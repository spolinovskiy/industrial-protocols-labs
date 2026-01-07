#!/usr/bin/env bash
set -euo pipefail

POLICY_FILE=/policy.yaml
ACTIVE_FILE=/lab/active_protocol

read_policy() {
  TTL_SECONDS=$(awk -F: '/ttl_seconds/ {gsub(/ /,"",$2); print $2}' "$POLICY_FILE")
  IDLE_SECONDS=$(awk -F: '/idle_seconds/ {gsub(/ /,"",$2); print $2}' "$POLICY_FILE")
  CAP_RETENTION_DAYS=$(awk -F: '/capture_retention_days/ {gsub(/ /,"",$2); print $2}' "$POLICY_FILE")
  CAP_MAX_FILES=$(awk -F: '/capture_max_files/ {gsub(/ /,"",$2); print $2}' "$POLICY_FILE")
}

trim_captures() {
  local cap_dir=/lab/capture
  mkdir -p "$cap_dir"
  ls -t "$cap_dir"/*.pcap 2>/dev/null | tail -n +$((CAP_MAX_FILES + 1)) | xargs -r rm -f
  find "$cap_dir" -type f -name "*.pcap" -mtime "+${CAP_RETENTION_DAYS}" -delete
}

restore_fuxa_seed() {
  local protocol="$1"
  local seed="/lab/seeds/${protocol}.project.json"
  if [[ -z "$protocol" || ! -f "$seed" ]]; then
    return
  fi

  echo "[reset] restoring FUXA seed for ${protocol}"
  # Best-effort import; if the API changes, this will no-op.
  curl -s -o /tmp/fuxa_import.out -w "%{http_code}" \
    -X POST \
    -F "file=@${seed}" \
    http://fuxa:1881/api/project/import || true
}

reset_lab() {
  local protocol="$1"
  echo "[reset] resetting lab (protocol=${protocol:-none})"

  docker ps --format '{{.Names}}' | grep -E '^proto-server-' | xargs -r docker stop

  trim_captures
  restore_fuxa_seed "$protocol"
}

read_policy
start_ts=$(date +%s)

while true; do
  sleep 60
  now=$(date +%s)

  last_activity=$(find /lab/fuxa /lab/capture -type f -printf '%T@\n' 2>/dev/null | sort -n | tail -1 || true)
  last_activity=${last_activity%.*}
  if [[ -z "$last_activity" ]]; then
    last_activity=$start_ts
  fi

  ttl_elapsed=$((now - start_ts))
  idle_elapsed=$((now - last_activity))

  if (( ttl_elapsed >= TTL_SECONDS || idle_elapsed >= IDLE_SECONDS )); then
    protocol=$(cat "$ACTIVE_FILE" 2>/dev/null || true)
    reset_lab "$protocol"
    start_ts=$now
  fi
done
