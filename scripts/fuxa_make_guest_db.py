#!/usr/bin/env python3
import json
import os
import shutil
import sqlite3


DEFAULT_SRC = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
DEFAULT_DEST = "/home/master/industrial-protocols-labs/platform/fuxa_guest/volumes/appdata/project.fuxap.db"
VIEW_NAME = "Modbus Test Bench"
DEVICE_NAME = "modbus"


def ensure_parent(path: str) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)


def load_json(value: str):
    try:
        return json.loads(value)
    except Exception:
        return None


def main() -> None:
    src = os.environ.get("FUXA_DB_SRC", DEFAULT_SRC)
    dest = os.environ.get("FUXA_DB_DEST", DEFAULT_DEST)
    view_name = os.environ.get("GUEST_VIEW_NAME", VIEW_NAME)
    device_name = os.environ.get("GUEST_DEVICE_NAME", DEVICE_NAME)

    if not os.path.exists(src):
        raise SystemExit(f"Source FUXA DB not found: {src}")

    ensure_parent(dest)
    shutil.copy2(src, dest)

    conn = sqlite3.connect(dest)
    cur = conn.cursor()

    cur.execute("select name, value from views")
    views = cur.fetchall()
    keep_view_ids = set()
    removed_views = 0
    for view_id, value in views:
        view = load_json(value)
        if not view:
            continue
        if view.get("name") == view_name:
            keep_view_ids.add(view_id)
        else:
            cur.execute("delete from views where name = ?", (view_id,))
            removed_views += 1

    if not keep_view_ids:
        conn.close()
        raise SystemExit(f"View not found: {view_name}")

    cur.execute("select name, value from devices")
    devices = cur.fetchall()
    removed_devices = 0
    kept_devices = 0
    for device_id, value in devices:
        device = load_json(value)
        if not device:
            continue
        if device.get("name") == device_name or device.get("type") == "FuxaServer":
            kept_devices += 1
            continue
        cur.execute("delete from devices where name = ?", (device_id,))
        removed_devices += 1

    conn.commit()
    conn.close()

    print(
        "Guest DB updated.",
        "Removed views:",
        removed_views,
        "Removed devices:",
        removed_devices,
        "Kept devices:",
        kept_devices,
    )


if __name__ == "__main__":
    main()
