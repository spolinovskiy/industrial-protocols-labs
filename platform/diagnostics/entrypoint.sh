#!/bin/sh
set -eu

TTYD_PORT=${TTYD_PORT:-7681}
TTYD_USER=${TTYD_USER:-}
TTYD_PASS=${TTYD_PASS:-}
DIAG_ALLOW_SHELL=${DIAG_ALLOW_SHELL:-0}

if [ "$DIAG_ALLOW_SHELL" = "1" ]; then
  CMD="/bin/bash"
else
  CMD="/bin/bash -lc /work/menu.sh"
fi

if [ -n "${TTYD_USER}" ] && [ -n "${TTYD_PASS}" ]; then
  echo "Starting ttyd on ${TTYD_PORT} with auth user ${TTYD_USER}" >&2
  exec /usr/local/bin/ttyd -W -p "${TTYD_PORT}" -c "${TTYD_USER}:${TTYD_PASS}" ${CMD}
fi

echo "Starting ttyd on ${TTYD_PORT} without auth" >&2
exec /usr/local/bin/ttyd -W -p "${TTYD_PORT}" ${CMD}
