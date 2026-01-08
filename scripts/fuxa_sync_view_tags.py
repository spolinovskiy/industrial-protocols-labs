#!/usr/bin/env python3
import json
import os
import sqlite3


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
MODBUS_VIEW = "Modbus Test Bench"
BACNET_VIEW = "BACnet Test Bench"


def load_devices(cur):
    cur.execute("select value from devices")
    rows = cur.fetchall()
    devices = [json.loads(row[0]) for row in rows]
    modbus = next((d for d in devices if d.get("name") == "modbus"), None)
    bacnet = next((d for d in devices if d.get("name") == "bacnet"), None)
    fuxa = next((d for d in devices if d.get("type") == "FuxaServer" and d.get("tags")), None)
    return modbus, bacnet, fuxa


def load_views(cur):
    cur.execute("select name, value from views")
    rows = cur.fetchall()
    views = []
    for name, value in rows:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        views.append((name, obj))
    return views


def build_item_map(view):
    items = view.get("items", {})
    by_name = {}
    for item in items.values():
        name = item.get("name")
        prop = item.get("property") or {}
        vid = prop.get("variableId")
        if name and vid:
            by_name[name] = vid
    return by_name


def main() -> None:
    db_path = os.environ.get("FUXA_DB", DEFAULT_DB)
    if not os.path.exists(db_path):
        raise SystemExit(f"FUXA DB not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    modbus, bacnet, fuxa = load_devices(cur)
    if not modbus or not bacnet:
        raise SystemExit("Missing modbus or bacnet device in DB")

    modbus_tags = modbus.get("tags", {}) or {}
    bacnet_tags = bacnet.get("tags", {}) or {}

    modbus_id_to_name = {tag_id: tag.get("name") for tag_id, tag in modbus_tags.items()}
    bacnet_name_to_id = {tag.get("name"): tag_id for tag_id, tag in bacnet_tags.items()}

    bacnet_status_id = None
    if fuxa:
        for tag_id, tag in (fuxa.get("tags", {}) or {}).items():
            if tag.get("name") == "bacnet Connection Status":
                bacnet_status_id = tag_id
                break

    views = load_views(cur)
    modbus_view = next((v for _, v in views if v.get("name") == MODBUS_VIEW), None)
    bacnet_view_row = next(((name, v) for name, v in views if v.get("name") == BACNET_VIEW), None)

    if not modbus_view or not bacnet_view_row:
        raise SystemExit("Modbus or BACnet view not found")

    bacnet_view_name, bacnet_view = bacnet_view_row

    modbus_items_by_name = build_item_map(modbus_view)

    updated = 0
    for item in bacnet_view.get("items", {}).values():
        item_name = item.get("name")
        if not item_name:
            continue
        modbus_var = modbus_items_by_name.get(item_name)
        if not modbus_var:
            continue
        tag_name = modbus_id_to_name.get(modbus_var)
        if not tag_name:
            continue
        new_id = bacnet_name_to_id.get(tag_name)
        if not new_id and tag_name == "modbus Connection Status" and bacnet_status_id:
            new_id = bacnet_status_id
        if not new_id:
            continue
        prop = item.get("property") or {}
        if prop.get("variableId") != new_id:
            prop["variableId"] = new_id
            item["property"] = prop
            updated += 1

    cur.execute("update views set value = ? where name = ?", (json.dumps(bacnet_view), bacnet_view_name))
    conn.commit()
    conn.close()
    print(f"Updated {updated} BACnet items")


if __name__ == "__main__":
    main()
