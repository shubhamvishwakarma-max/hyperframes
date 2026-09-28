#!/usr/bin/env bash
# Two-pass EBU R128 master of the Remotion render: -14 LUFS, -1.5 dBTP, video re-encoded to broadcast-range yuv420p H.264 High.
set -euo pipefail
IN=${1:-out/raw.mp4}
OUT=${2:-output/doubletick-piramal-finance-leadgen.mp4}
mkdir -p "$(dirname "$OUT")"
M=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i "$IN" -c:v libx264 -preset slow -crf 15 -profile:v high -pix_fmt yuv420p -vf "scale=in_range=full:out_range=tv" -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -r 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
echo "Mastered → $OUT"
