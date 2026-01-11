#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

FUXA_DB_SRC=${FUXA_DB_SRC:-"$ROOT/platform/fuxa/volumes/appdata/project.fuxap.db"}
FUXA_DB_DEST=${FUXA_DB_DEST:-"$ROOT/platform/fuxa_guest/volumes/appdata/project.fuxap.db"}

mkdir -p "$ROOT/platform/fuxa_guest/volumes/appdata" \
  "$ROOT/platform/fuxa_guest/volumes/db" \
  "$ROOT/platform/fuxa_guest/volumes/logs" \
  "$ROOT/platform/fuxa_guest/volumes/images"

export FUXA_DB_SRC
export FUXA_DB_DEST

python3 "$ROOT/scripts/fuxa_make_guest_db.py"
