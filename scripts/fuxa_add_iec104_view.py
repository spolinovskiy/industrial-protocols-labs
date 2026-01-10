#!/usr/bin/env python3
import json
import os
import sqlite3
import uuid


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
DEFAULT_ADDR = "http://proto-gateway-iec104:9002/tags"


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
    iec104_device_existing = None
    fuxa_server_row = None
    tag_by_id = {}
    for name, value in devices_rows:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "modbus":
            modbus_device = obj
        if obj.get("name") == "iec104":
            iec104_device_existing = (name, obj)
        if obj.get("type") == "FuxaServer" and obj.get("tags"):
            fuxa_server_row = (name, obj)
        for tag in obj.get("tags", {}).values():
            tag_by_id[tag.get("id")] = tag

    if not modbus_device:
        raise SystemExit("modbus device not found in FUXA DB")

    if iec104_device_existing:
        iec104_row_name, iec104_existing_obj = iec104_device_existing
        iec104_id = iec104_existing_obj.get("id", iec104_row_name)
    else:
        iec104_id = f"i_{uuid.uuid4().hex}"

    iec104_tags = {}

    def add_tag(tag_id, name, tag_type, address, description):
        iec104_tags[tag_id] = make_tag(tag_id, name, tag_type, address, description)

    for idx in range(1, 9):
        add_tag(f"i_do_{idx:02d}", f"DO_0{idx}", "Bool", f"DO_0{idx}", f"IEC-104 DO {idx}")
        add_tag(f"i_di_{idx:02d}", f"DI_0{idx}", "Bool", f"DI_0{idx}", f"IEC-104 DI {idx}")

    for idx in range(1, 5):
        add_tag(f"i_ao_{idx:02d}", f"AO_0{idx}", "Number", f"AO_0{idx}", f"IEC-104 AO {idx}")
        add_tag(f"i_ai_{idx:02d}", f"AI_0{idx}", "Number", f"AI_0{idx}", f"IEC-104 AI {idx}")

    add_tag("i_tmr_01", "TMR_01", "Number", "TMR_01", "Timer above 70%")
    add_tag("i_cnt_01", "CNT_01", "Number", "CNT_01", "Crossings above 70%")

    iec104_device = {
        "id": iec104_id,
        "name": "iec104",
        "enabled": True,
        "property": {
            "getTags": os.environ.get("IEC104_GET", DEFAULT_ADDR),
            "postTags": os.environ.get("IEC104_POST", DEFAULT_ADDR),
        },
        "type": "WebAPI",
        "polling": 1000,
        "tags": iec104_tags,
    }

    if iec104_device_existing:
        cur.execute("update devices set value = ? where name = ?", (json.dumps(iec104_device), iec104_row_name))
    else:
        cur.execute(
            "insert into devices (name, value, connection, cntid, cntpwd) values (?, ?, '', '', '')",
            (iec104_id, json.dumps(iec104_device)),
        )

    if fuxa_server_row:
        fuxa_name, fuxa_obj = fuxa_server_row
        status_tag_id = None
        for tag in fuxa_obj.get("tags", {}).values():
            if tag.get("name") == "iec104 Connection Status":
                status_tag_id = tag.get("id")
                tag["memaddress"] = iec104_id
                break
        if not status_tag_id:
            status_tag_id = f"t_{uuid.uuid4().hex[:16]}"
            fuxa_obj["tags"][status_tag_id] = {
                "id": status_tag_id,
                "name": "iec104 Connection Status",
                "label": "iec104 Connection Status",
                "type": "number",
                "memaddress": iec104_id,
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

    iec104_view = json.loads(json.dumps(modbus_view))
    iec104_view_id = f"v_{uuid.uuid4().hex[:12]}"
    iec104_view["id"] = iec104_view_id
    iec104_view["name"] = "IEC-104 Test Bench"

    name_to_iec104_id = {tag["name"]: tag_id for tag_id, tag in iec104_tags.items()}

    for item in iec104_view.get("items", {}).values():
        if not isinstance(item, dict):
            continue
        prop = item.get("property") or {}
        vid = prop.get("variableId")
        if vid:
            tag = tag_by_id.get(vid)
            if tag:
                tag_name = tag.get("name")
                if tag_name in name_to_iec104_id:
                    prop["variableId"] = name_to_iec104_id[tag_name]
                elif tag_name == "modbus Connection Status" and status_tag_id:
                    prop["variableId"] = status_tag_id

        for ev in prop.get("events", []) or []:
            act = ev.get("actoptions", {})
            var = act.get("variable") or {}
            raw = var.get("variableRaw") or {}
            raw_name = raw.get("name")
            if raw_name == "DO5":
                raw_name = "DO_05"
            if raw_name and raw_name in name_to_iec104_id:
                new_id = name_to_iec104_id[raw_name]
                act["variable"] = {
                    "variableId": new_id,
                    "variableRaw": iec104_tags[new_id],
                    "bitmask": None,
                }
                ev["actoptions"] = act

    existing_view_name = None
    for name, value in views:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == "IEC-104 Test Bench":
            existing_view_name = name
            break

    if existing_view_name:
        cur.execute("update views set value = ? where name = ?", (json.dumps(iec104_view), existing_view_name))
    else:
        cur.execute("insert into views (name, value) values (?, ?)", (iec104_view_id, json.dumps(iec104_view)))

    conn.commit()
    conn.close()
    print("IEC-104 view + device added. Restart FUXA to load new view.")


if __name__ == "__main__":
    main()
