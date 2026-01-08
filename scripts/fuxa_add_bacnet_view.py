#!/usr/bin/env python3
import json
import os
import sqlite3
import uuid


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
BACNET_DEVICE_ID = 1234
DEFAULT_BACNET_ADDR = "172.31.30.2:47808"
DEFAULT_BACNET_BROADCAST = "proto-server-bacnet"


def make_tag(tag_id, name, tag_type, address, memaddress, description):
    return {
        "id": tag_id,
        "name": name,
        "type": tag_type,
        "memaddress": memaddress,
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
    bacnet_device_existing = None
    fuxa_server_row = None
    tag_by_id = {}
    for name, value in devices_rows:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "modbus":
            modbus_device = obj
        if obj.get("name") == "bacnet":
            bacnet_device_existing = (name, obj)
        if obj.get("type") == "FuxaServer" and obj.get("tags"):
            fuxa_server_row = (name, obj)
        for tag in obj.get("tags", {}).values():
            tag_by_id[tag.get("id")] = tag

    if not modbus_device:
        raise SystemExit("modbus device not found in FUXA DB")

    if bacnet_device_existing:
        bacnet_row_name, bacnet_existing_obj = bacnet_device_existing
        bacnet_id = bacnet_existing_obj.get("id", bacnet_row_name)
    else:
        bacnet_id = f"d_{uuid.uuid4().hex}"
    bacnet_mem = str(BACNET_DEVICE_ID)

    bacnet_tags = {}
    def add_tag(tag_id, name, tag_type, address, description):
        bacnet_tags[tag_id] = make_tag(tag_id, name, tag_type, address, bacnet_mem, description)

    for idx in range(1, 9):
        add_tag(f"b_do_{idx:02d}", f"DO_0{idx}", "Bool", f"4-{idx}", f"BACnet DO {idx}")
        add_tag(f"b_di_{idx:02d}", f"DI_0{idx}", "Bool", f"3-{idx}", f"BACnet DI {idx}")

    for idx in range(1, 5):
        add_tag(f"b_ao_{idx:02d}", f"AO_0{idx}", "Float", f"1-{idx}", f"BACnet AO {idx}")
        add_tag(f"b_ai_{idx:02d}", f"AI_0{idx}", "Float", f"0-{idx}", f"BACnet AI {idx}")

    add_tag("b_tmr_01", "TMR_01", "Float", "2-1", "Timer above 70%")
    add_tag("b_cnt_01", "CNT_01", "Float", "2-2", "Crossings above 70%")

    bacnet_device = {
        "id": bacnet_id,
        "name": "bacnet",
        "enabled": True,
        "property": {
            "address": os.environ.get("BACNET_ADDR", DEFAULT_BACNET_ADDR),
            "broadcastAddress": os.environ.get("BACNET_BROADCAST", DEFAULT_BACNET_BROADCAST),
            "adpuTimeout": 6000,
        },
        "type": "BACnet",
        "polling": 200,
        "tags": bacnet_tags,
    }

    # Upsert bacnet device into devices table
    if bacnet_device_existing:
        cur.execute("update devices set value = ? where name = ?", (json.dumps(bacnet_device), bacnet_row_name))
    else:
        cur.execute(
            "insert into devices (name, value, connection, cntid, cntpwd) values (?, ?, '', '', '')",
            (bacnet_id, json.dumps(bacnet_device)),
        )

    # Add bacnet connection status tag to FUXA Server device
    if fuxa_server_row:
        fuxa_name, fuxa_obj = fuxa_server_row
        status_tag_id = None
        for tag in fuxa_obj.get("tags", {}).values():
            if tag.get("name") == "bacnet Connection Status":
                status_tag_id = tag.get("id")
                tag["memaddress"] = bacnet_id
                break
        if not status_tag_id:
            status_tag_id = f"t_{uuid.uuid4().hex[:16]}"
            fuxa_obj["tags"][status_tag_id] = {
                "id": status_tag_id,
                "name": "bacnet Connection Status",
                "label": "bacnet Connection Status",
                "type": "number",
                "memaddress": bacnet_id,
                "daq": {"enabled": False, "interval": 60, "changed": False, "restored": False},
                "init": "",
                "sysType": 1,
            }
        cur.execute("update devices set value = ? where name = ?", (json.dumps(fuxa_obj), fuxa_name))
    else:
        status_tag_id = None

    # Duplicate Modbus view and rebind tags to bacnet ids
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

    bacnet_view = json.loads(json.dumps(modbus_view))
    bacnet_view_id = f"v_{uuid.uuid4().hex[:12]}"
    bacnet_view["id"] = bacnet_view_id
    bacnet_view["name"] = "BACnet Test Bench"

    name_to_bacnet_id = {tag["name"]: tag_id for tag_id, tag in bacnet_tags.items()}

    for item in bacnet_view.get("items", {}).values():
        prop = item.get("property") or {}
        vid = prop.get("variableId")
        if not vid:
            continue
        tag = tag_by_id.get(vid)
        if not tag:
            continue
        tag_name = tag.get("name")
        if tag_name in name_to_bacnet_id:
            prop["variableId"] = name_to_bacnet_id[tag_name]
        elif tag_name == "modbus Connection Status" and status_tag_id:
            prop["variableId"] = status_tag_id

    # Upsert view
    existing_view_name = None
    for name, value in views:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "BACnet Test Bench":
            existing_view_name = name
            break

    if existing_view_name:
        cur.execute("update views set value = ? where name = ?", (json.dumps(bacnet_view), existing_view_name))
    else:
        cur.execute("insert into views (name, value) values (?, ?)", (bacnet_view_id, json.dumps(bacnet_view)))

    conn.commit()
    conn.close()
    print("BACnet view + device added. Restart FUXA to load new view.")


if __name__ == "__main__":
    main()
