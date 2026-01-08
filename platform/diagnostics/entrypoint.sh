#!/usr/bin/env bash
set -euo pipefail

TTYD_PORT=${TTYD_PORT:-7681}
TTYD_USER=${TTYD_USER:-}
TTYD_PASS=${TTYD_PASS:-}
DIAG_ALLOW_SHELL=${DIAG_ALLOW_SHELL:-0}

MENU_CMD=(/work/start.sh)
if [[ "$DIAG_ALLOW_SHELL" == "1" ]]; then
  MENU_CMD=(/bin/bash)
fi

if [[ -n "${TTYD_USER}" && -n "${TTYD_PASS}" ]]; then
  exec /usr/local/bin/ttyd -w -p "${TTYD_PORT}" -c "${TTYD_USER}:${TTYD_PASS}" "${MENU_CMD[@]}"
fi

exec /usr/local/bin/ttyd -w -p "${TTYD_PORT}" "${MENU_CMD[@]}"
