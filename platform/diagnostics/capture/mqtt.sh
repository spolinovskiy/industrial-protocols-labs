#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "mqtt" 'tcp port 1883'
