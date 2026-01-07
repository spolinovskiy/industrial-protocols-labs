#!/usr/bin/env bash
set -euo pipefail

CAP_DIR=/work/capture
mkdir -p "$CAP_DIR"

print_header() {
  echo ""
  echo "ICS Diagnostics Menu"
  echo "===================="
}

run_capture() {
  local script="$1"
  if [[ ! -x "$script" ]]; then
    echo "Capture script not found: $script"
    return
  fi
  "$script"
}

open_last_capture() {
  local latest
  latest=$(ls -t "$CAP_DIR"/*.pcap 2>/dev/null | head -n 1 || true)
  if [[ -z "$latest" ]]; then
    echo "No captures found."
    return
  fi
  termshark -r "$latest"
}

show_connections() {
  ss -ntup || true
}

while true; do
  print_header
  echo "1) Capture Modbus (10s)"
  echo "2) Capture OPC UA (10s)"
  echo "3) Capture BACnet/IP (10s)"
  echo "4) Capture CIP (10s)"
  echo "5) Capture DNP3 (10s)"
  echo "6) Capture IEC-104 (10s)"
  echo "7) Capture MQTT (10s)"
  echo "8) Capture S7comm (10s)"
  echo "9) Open last capture in termshark"
  echo "10) Show active connections"
  echo "11) Advanced shell (admin only)"
  echo "0) Exit"
  echo ""
  read -r -p "Select option: " choice

  case "$choice" in
    1) run_capture /work/capture/modbus.sh ;;
    2) run_capture /work/capture/opcua.sh ;;
    3) run_capture /work/capture/bacnet.sh ;;
    4) run_capture /work/capture/cip.sh ;;
    5) run_capture /work/capture/dnp3.sh ;;
    6) run_capture /work/capture/iec104.sh ;;
    7) run_capture /work/capture/mqtt.sh ;;
    8) run_capture /work/capture/s7.sh ;;
    9) open_last_capture ;;
    10) show_connections ;;
    11)
      if [[ "${DIAG_ALLOW_SHELL:-0}" == "1" ]]; then
        /bin/bash
      else
        echo "Advanced shell disabled."
      fi
      ;;
    0) exit 0 ;;
    *) echo "Invalid option." ;;
  esac

done
