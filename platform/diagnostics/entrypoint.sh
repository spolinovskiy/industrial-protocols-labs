#!/usr/bin/env bash
set -euo pipefail

TTYD_PORT=${TTYD_PORT:-7681}
TTYD_USER=${TTYD_USER:-student}
TTYD_PASS=${TTYD_PASS:-lab123}
DIAG_ALLOW_SHELL=${DIAG_ALLOW_SHELL:-0}

MENU_CMD=(/work/menu.sh)
if [[ "$DIAG_ALLOW_SHELL" == "1" ]]; then
  MENU_CMD=(/bin/bash)
fi

exec /usr/local/bin/ttyd -p "${TTYD_PORT}" -c "${TTYD_USER}:${TTYD_PASS}" "${MENU_CMD[@]}"
