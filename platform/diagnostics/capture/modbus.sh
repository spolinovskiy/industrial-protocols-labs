#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "modbus" 'tcp port 502'
