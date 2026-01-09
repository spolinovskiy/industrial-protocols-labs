#!/usr/bin/env python3
import json
import os
import sqlite3


DEFAULT_DB = "/home/master/industrial-protocols-labs/platform/fuxa/volumes/appdata/project.fuxap.db"
VIEW_NAME = "CIP Test Bench"


def main() -> None:
    db_path = os.environ.get("FUXA_DB", DEFAULT_DB)
    if not os.path.exists(db_path):
        raise SystemExit(f"FUXA DB not found: {db_path}")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("select name, value from views")
    rows = cur.fetchall()

    cip_views = []
    for name, value in rows:
        try:
            obj = json.loads(value)
        except Exception:
            continue
        if obj.get("name") == VIEW_NAME:
            cip_views.append((name, obj))

    if len(cip_views) <= 1:
        print("No duplicate CIP views found.")
        conn.close()
        return

    keep_name, _ = cip_views[0]
    remove_names = [name for name, _ in cip_views[1:]]

    for name in remove_names:
        cur.execute("delete from views where name = ?", (name,))

    conn.commit()
    conn.close()
    print(f"Removed {len(remove_names)} duplicate CIP views (kept {keep_name}).")


if __name__ == "__main__":
    main()
