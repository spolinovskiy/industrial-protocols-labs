#!/usr/bin/env python3
import json
import os
import sqlite3
import subprocess
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
STATIC_DIR = ROOT / "platform" / "lab_switcher"
LABCTL = ROOT / "labctl"
ACTIVE_FILE = ROOT / "platform" / "active_protocol"
FUXA_DB = ROOT / "platform" / "fuxa" / "volumes" / "appdata" / "project.fuxap.db"

PROTOCOLS = ["modbus", "opcua", "bacnet", "cip", "dnp3", "iec104", "mqtt", "s7"]


def run_cmd(cmd, check=True):
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if check and result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "command failed")
    return result.stdout.strip()


def read_active_protocol():
    if not ACTIVE_FILE.exists():
        return None
    value = ACTIVE_FILE.read_text().strip()
    return value or None


def set_active_protocol(value):
    if value:
        ACTIVE_FILE.write_text(value)
    else:
        ACTIVE_FILE.write_text("")


def update_fuxa_connections(active):
    if not FUXA_DB.exists():
        raise RuntimeError(f"FUXA DB not found: {FUXA_DB}")
    conn = sqlite3.connect(FUXA_DB)
    cur = conn.cursor()
    cur.execute("select name, value from devices")
    rows = cur.fetchall()
    updated = 0
    for row_id, value in rows:
        try:
            device = json.loads(value)
        except Exception:
            continue
        name = device.get("name")
        if name in PROTOCOLS:
            device["enabled"] = bool(active and name == active)
            cur.execute("update devices set value = ? where name = ?", (json.dumps(device), row_id))
            updated += 1
    conn.commit()
    conn.close()
    return updated


def restart_fuxa():
    run_cmd(["docker", "restart", "fuxa"], check=False)


def switch_protocol(proto):
    if proto not in PROTOCOLS:
        raise RuntimeError("unknown protocol")
    run_cmd([str(LABCTL), "switch", proto])
    set_active_protocol(proto)
    updated = update_fuxa_connections(proto)
    restart_fuxa()
    return updated


def stop_protocols():
    run_cmd([str(LABCTL), "stop"])
    set_active_protocol("")
    updated = update_fuxa_connections(None)
    restart_fuxa()
    return updated


def pause_protocol(proto, pause):
    if proto not in PROTOCOLS:
        raise RuntimeError("unknown protocol")
    name = f"proto-server-{proto}"
    cmd = ["docker", "pause", name] if pause else ["docker", "unpause", name]
    run_cmd(cmd, check=False)


def require_token(handler, params):
    token = os.environ.get("LAB_SWITCHER_TOKEN")
    if not token:
        return True
    provided = handler.headers.get("X-Auth-Token") or params.get("token", [""])[0]
    return provided == token


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def send_json(self, status, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            params = parse_qs(parsed.query)
            if not require_token(self, params):
                self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "unauthorized"})
                return
            if parsed.path == "/api/status":
                active = read_active_protocol()
                self.send_json(HTTPStatus.OK, {"active": active})
                return
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "unknown endpoint"})
            return
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        if not require_token(self, params):
            self.send_json(HTTPStatus.UNAUTHORIZED, {"error": "unauthorized"})
            return
        try:
            if parsed.path == "/api/switch":
                proto = params.get("protocol", [""])[0]
                updated = switch_protocol(proto)
                self.send_json(HTTPStatus.OK, {"message": f"switched to {proto}", "updated": updated})
                return
            if parsed.path == "/api/stop":
                updated = stop_protocols()
                self.send_json(HTTPStatus.OK, {"message": "stopped protocol servers", "updated": updated})
                return
            if parsed.path == "/api/pause":
                proto = params.get("protocol", [""])[0]
                pause = params.get("pause", ["1"])[0] != "0"
                pause_protocol(proto, pause)
                state = "paused" if pause else "resumed"
                self.send_json(HTTPStatus.OK, {"message": f"{proto} {state}"})
                return
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "unknown endpoint"})
        except Exception as exc:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})


def main():
    host = os.environ.get("LAB_SWITCHER_HOST", "0.0.0.0")
    port = int(os.environ.get("LAB_SWITCHER_PORT", "8090"))
    if not STATIC_DIR.exists():
        raise SystemExit(f"Missing UI directory: {STATIC_DIR}")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Lab switcher listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
