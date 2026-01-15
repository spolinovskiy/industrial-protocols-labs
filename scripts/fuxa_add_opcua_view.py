#!/usr/bin/env python3
import json
import os
import sqlite3
import uuid


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
DEFAULT_ENDPOINT = "opc.tcp://proto-server-opcua:4840/"


def make_tag(tag_id, name, tag_type, address, description):
    return {
        "id": tag_id,
        "name": name,
        "type": tag_type,
        "memaddress": "",
        "address": address,
        "divisor": None,
        "daq": {"enabled": False, "interval": 60, "changed": False, "restored": False},
        "description": description,
        "value": 0,
        "timestamp": 0,
    }


def main() -> None:
    db_path = os.environ.get("FUXA_DB", DEFAULT_DB)
    if not os.path.exists(db_path):
        raise SystemExit(f"FUXA DB not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("select name, value from devices")
    devices_rows = cur.fetchall()

    modbus_device = None
    opcua_device_existing = None
    fuxa_server_row = None
    tag_by_id = {}
    for name, value in devices_rows:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "modbus":
            modbus_device = obj
        if obj.get("name") == "opcua":
            opcua_device_existing = (name, obj)
        if obj.get("type") == "FuxaServer" and obj.get("tags"):
            fuxa_server_row = (name, obj)
        for tag in obj.get("tags", {}).values():
            tag_by_id[tag.get("id")] = tag

    if not modbus_device:
        raise SystemExit("modbus device not found in FUXA DB")

    if opcua_device_existing:
        opcua_row_name, opcua_existing_obj = opcua_device_existing
        opcua_id = opcua_existing_obj.get("id", opcua_row_name)
    else:
        opcua_id = f"d_{uuid.uuid4().hex}"

    opcua_tags = {}

    def add_tag(tag_id, name, tag_type, address, description):
        opcua_tags[tag_id] = make_tag(tag_id, name, tag_type, address, description)

    for idx in range(1, 9):
        add_tag(f"u_do_{idx:02d}", f"DO_0{idx}", "Bool", f"ns=2;s=opcua/DO_0{idx}", f"OPCUA DO {idx}")
        add_tag(f"u_di_{idx:02d}", f"DI_0{idx}", "Bool", f"ns=2;s=opcua/DI_0{idx}", f"OPCUA DI {idx}")

    for idx in range(1, 5):
        add_tag(f"u_ao_{idx:02d}", f"AO_0{idx}", "Float", f"ns=2;s=opcua/AO_0{idx}", f"OPCUA AO {idx}")
        add_tag(f"u_ai_{idx:02d}", f"AI_0{idx}", "Float", f"ns=2;s=opcua/AI_0{idx}", f"OPCUA AI {idx}")

    add_tag("u_tmr_01", "TMR_01", "Float", "ns=2;s=opcua/TMR_01", "Timer above 70%")
    add_tag("u_cnt_01", "CNT_01", "Float", "ns=2;s=opcua/CNT_01", "Crossings above 70%")

    opcua_device = {
        "id": opcua_id,
        "name": "opcua",
        "enabled": True,
        "property": {
            "address": os.environ.get("OPCUA_ENDPOINT", DEFAULT_ENDPOINT),
        },
        "type": "OPCUA",
        "polling": 200,
        "tags": opcua_tags,
    }

    if opcua_device_existing:
        cur.execute("update devices set value = ? where name = ?", (json.dumps(opcua_device), opcua_row_name))
    else:
        cur.execute(
            "insert into devices (name, value, connection, cntid, cntpwd) values (?, ?, '', '', '')",
            (opcua_id, json.dumps(opcua_device)),
        )

    # Add opcua connection status tag to FUXA Server device
    if fuxa_server_row:
        fuxa_name, fuxa_obj = fuxa_server_row
        status_tag_id = None
        for tag in fuxa_obj.get("tags", {}).values():
            if tag.get("name") == "opcua Connection Status":
                status_tag_id = tag.get("id")
                tag["memaddress"] = opcua_id
                break
        if not status_tag_id:
            status_tag_id = f"t_{uuid.uuid4().hex[:16]}"
            fuxa_obj["tags"][status_tag_id] = {
                "id": status_tag_id,
                "name": "opcua Connection Status",
                "label": "opcua Connection Status",
                "type": "number",
                "memaddress": opcua_id,
                "daq": {"enabled": False, "interval": 60, "changed": False, "restored": False},
                "init": "",
                "sysType": 1,
            }
        cur.execute("update devices set value = ? where name = ?", (json.dumps(fuxa_obj), fuxa_name))
    else:
        status_tag_id = None

    cur.execute("select name, value from views")
    views = cur.fetchall()
    modbus_view = None
    for name, value in views:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "Modbus Test Bench":
            modbus_view = obj
            break

    if not modbus_view:
        raise SystemExit("Modbus Test Bench view not found")

    opcua_view = json.loads(json.dumps(modbus_view))
    opcua_view_id = f"v_{uuid.uuid4().hex[:12]}"
    opcua_view["id"] = opcua_view_id
    opcua_view["name"] = "OPC UA Test Bench"

    name_to_opcua_id = {tag["name"]: tag_id for tag_id, tag in opcua_tags.items()}

    for item in opcua_view.get("items", {}).values():
        if not isinstance(item, dict):
            continue
        prop = item.get("property") or {}
        vid = prop.get("variableId")
        if vid:
            tag = tag_by_id.get(vid)
            if tag:
                tag_name = tag.get("name")
                if tag_name in name_to_opcua_id:
                    prop["variableId"] = name_to_opcua_id[tag_name]
                elif tag_name == "modbus Connection Status" and status_tag_id:
                    prop["variableId"] = status_tag_id

        # Update action variables (e.g. reset button)
        for ev in prop.get("events", []) or []:
            act = ev.get("actoptions", {})
            var = act.get("variable") or {}
            raw = var.get("variableRaw") or {}
            raw_name = raw.get("name")
            if raw_name == "DO5":
                raw_name = "DO_05"
            if raw_name and raw_name in name_to_opcua_id:
                new_id = name_to_opcua_id[raw_name]
                act["variable"] = {
                    "variableId": new_id,
                    "variableRaw": opcua_tags[new_id],
                    "bitmask": None,
                }
                ev["actoptions"] = act

    existing_view_name = None
    for name, value in views:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "OPC UA Test Bench":
            existing_view_name = name
            break

    if existing_view_name:
        cur.execute("update views set value = ? where name = ?", (json.dumps(opcua_view), existing_view_name))
    else:
        cur.execute("insert into views (name, value) values (?, ?)", (opcua_view_id, json.dumps(opcua_view)))

    conn.commit()
    conn.close()
    print("OPC UA view + device added. Restart FUXA to load new view.")


if __name__ == "__main__":
    main()
