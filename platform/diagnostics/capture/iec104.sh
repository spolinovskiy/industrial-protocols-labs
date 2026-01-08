#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "iec104" 'tcp port 2404'
