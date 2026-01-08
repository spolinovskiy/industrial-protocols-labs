#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "dnp3" 'tcp port 20000'
