#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "bacnet" 'udp port 47808'
