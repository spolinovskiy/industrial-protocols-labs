#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "cip" '(tcp port 44818 or udp port 2222)'
