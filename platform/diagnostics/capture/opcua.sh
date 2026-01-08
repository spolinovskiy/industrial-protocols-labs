#!/usr/bin/env bash
set -euo pipefail
. /work/capture/common.sh
capture_pcap "opcua" 'tcp port 4840'
