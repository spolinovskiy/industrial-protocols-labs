#!/usr/bin/env python3
import json
import os
import sqlite3


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
TARGET_COLOR = "#1f8ed3ff"
COLOR_ITEMS = {
    "led_1",
    "led_2",
    "led_3",
    "led_4",
    "output_1",
    "output_2",
    "output_3",
    "shape_24",
}
AI_BAR_NAME = "reset"
AI_BAR_RENAME = "ai_bar"


def update_ranges(prop):
    ranges = prop.get("ranges")
    if not ranges:
        return 0
    changed = 0
    for r in ranges:
        if r.get("color") != TARGET_COLOR:
            r["color"] = TARGET_COLOR
            changed += 1
        if r.get("stroke") != TARGET_COLOR:
            r["stroke"] = TARGET_COLOR
            changed += 1
    return changed


def update_property(prop):
    changed = update_ranges(prop)
    if "color" in prop and prop.get("color") != TARGET_COLOR:
        prop["color"] = TARGET_COLOR
        changed += 1
    if "stroke" in prop and prop.get("stroke") != TARGET_COLOR:
        prop["stroke"] = TARGET_COLOR
        changed += 1
    return changed


def main() -> None:
    db_path = os.environ.get("FUXA_DB", DEFAULT_DB)
    if not os.path.exists(db_path):
        raise SystemExit(f"FUXA DB not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("select name, value from views")
    rows = cur.fetchall()

    total_views = 0
    total_items = 0
    total_changes = 0
    total_renamed = 0

    for view_name, value in rows:
        try:
            view = json.loads(value)
        except Exception:
            continue

        if "Test Bench" not in view.get("name", ""):
            continue

        items = view.get("items", {})
        changed = False

        for item in items.values():
            name = item.get("name")
            if not name:
                continue
            if name in COLOR_ITEMS:
                prop = item.get("property") or {}
                total_changes += update_property(prop)
                item["property"] = prop
                total_items += 1
                changed = True
            if name == AI_BAR_NAME:
                item["name"] = AI_BAR_RENAME
                prop = item.get("property") or {}
                total_changes += update_property(prop)
                item["property"] = prop
                total_renamed += 1
                changed = True

        if changed:
            cur.execute(
                "update views set value = ? where name = ?",
                (json.dumps(view), view_name),
            )
            total_views += 1

    conn.commit()
    conn.close()

    print(
        "Updated views:",
        total_views,
        "items:",
        total_items,
        "renamed:",
        total_renamed,
        "property changes:",
        total_changes,
    )


if __name__ == "__main__":
    main()
