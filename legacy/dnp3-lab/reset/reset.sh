#!/bin/sh
set -e

# Simple hourly restart for lab services (stateless reset)
# Requires access to Docker socket on the host.

LAB_DIR="/lab"
COMPOSE_FILE="$LAB_DIR/docker-compose.yml"

while true; do
  sleep 3600
  docker compose -f "$COMPOSE_FILE" restart dnp3-server dnp3-client fuxa fuxa-proxy diagnostics
  echo "[reset] DNP3 lab services restarted"
done
