#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
# Capture CIP control traffic plus WebAPI gateway polling.
capture_pcap "cip" '(tcp port 44818 or udp port 2222 or tcp port 9000)'
