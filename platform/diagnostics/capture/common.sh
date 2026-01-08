#!/usr/bin/env bash
set -euo pipefail

CAP_DIR=/work/capture
CAP_DURATION=${CAP_DURATION:-10}
CAP_MAX_FILES=${CAP_MAX_FILES:-20}
CAP_RETENTION_DAYS=${CAP_RETENTION_DAYS:-3}

capture_pcap() {
  local name="$1"
  local filter="$2"
  local ts
  ts=$(date +%Y%m%d_%H%M%S)
  local pcap="$CAP_DIR/${name}_${ts}.pcap"

  echo "Capturing ${name} (${CAP_DURATION}s) -> ${pcap}"
  timeout "${CAP_DURATION}" tcpdump -i any -s 0 -U -w "${pcap}" ${filter} || true
  trim_captures
}

trim_captures() {
  ls -t "$CAP_DIR"/*.pcap 2>/dev/null | tail -n +$((CAP_MAX_FILES + 1)) | xargs -r rm -f
  find "$CAP_DIR" -type f -name "*.pcap" -mtime "+${CAP_RETENTION_DAYS}" -delete
}
