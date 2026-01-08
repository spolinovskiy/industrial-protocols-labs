#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "s7" 'tcp port 102'
