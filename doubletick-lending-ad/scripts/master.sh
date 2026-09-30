#!/usr/bin/env bash
# Social-delivery master: keep the rendered H.264 picture untouched, bring the
# mix up to a social loudness target (~-15 LUFS, -1.5 dBTP) with a transparent
# peak limiter, and write a faststart MP4.
#   usage: scripts/master.sh renders/draft.mp4 renders/doubletick-lending-ad-1080x1080.mp4
set -euo pipefail
IN="$1"
OUT="$2"
TARGET=-15

measure() {
  ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}'
}

CUR=$(measure "$IN")
GAIN=$(python3 -c "print(round(${TARGET} - (${CUR}) + 0.6, 2))")
echo "rendered mix: ${CUR} LUFS -> applying ${GAIN} dB before limiter"

ffmpeg -hide_banner -y -i "$IN" \
  -af "volume=${GAIN}dB,alimiter=limit=0.84:attack=4:release=60:level=disabled,aresample=48000" \
  -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"

echo "master: $(measure "$OUT") LUFS"
