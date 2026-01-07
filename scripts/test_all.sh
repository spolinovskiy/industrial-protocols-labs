#!/usr/bin/env bash
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
COMPOSE="$ROOT/platform/docker-compose.platform.yml"

protocols=(modbus opcua bacnet cip dnp3 iec104 mqtt s7)
arch=$(uname -m)
if [[ "${RUN_DNP3:-0}" != "1" && ( "$arch" = "arm64" || "$arch" = "aarch64" ) ]]; then
  echo "[test] skipping dnp3 on $arch (pydnp3 build is not supported)"
  protocols=(modbus opcua bacnet cip iec104 mqtt s7)
fi

echo "[test] docker compose config"
docker compose -f "$COMPOSE" config >/dev/null

echo "[test] starting platform base"
docker compose -f "$COMPOSE" up -d
sleep 5

echo "[test] gateway health"
status_code=$(curl -s -o /dev/null -u guest:guest -w "%{http_code}" http://localhost:1881/)
test "$status_code" = "200"

for proto in "${protocols[@]}"; do
  echo "[test] profile $proto"
  docker compose -f "$COMPOSE" --profile "$proto" up -d --build
  sleep 5

  services=$(docker compose -f "$COMPOSE" ps --format '{{.Service}}')
  echo "$services" | grep -q "proto-server-$proto"

  if docker compose -f "$COMPOSE" config --services | grep -q "proto-client-$proto"; then
    echo "[test] client $proto"
    docker compose -f "$COMPOSE" --profile "${proto}-test" run --rm "proto-client-$proto" || true
  fi

  echo "[test] capture $proto"
  docker exec diagnostics "/work/capture/${proto}.sh" || true

  # stop protocol server before next
  docker stop "proto-server-$proto" >/dev/null 2>&1 || true
  if [[ "$proto" == "mqtt" ]]; then
    docker stop proto-server-mqtt-bridge >/dev/null 2>&1 || true
  fi

done

echo "[test] exclusivity check"
docker compose -f "$COMPOSE" --profile modbus up -d
sleep 2
"$ROOT/labctl" switch opcua
sleep 2
! docker ps --format '{{.Names}}' | grep -q 'proto-server-modbus'

echo "[test] resource snapshot"
docker stats --no-stream --format '{{.Name}} {{.CPUPerc}} {{.MemUsage}}' | head -n 20

# Cleanup
docker compose -f "$COMPOSE" down
