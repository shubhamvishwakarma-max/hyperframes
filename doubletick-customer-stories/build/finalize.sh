#!/usr/bin/env bash
# Loudness pass: -14 LUFS integrated, -1.5 dBTP, linear gain (no extra
# compression). Video stream is copied untouched; audio re-encoded AAC 192k.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=renders/doubletick-customer-stories-1080-square.raw.mp4
OUT=renders/doubletick-customer-stories-1080-square.mp4
M=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -y -i "$IN" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|Peak:"
