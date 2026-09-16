#!/usr/bin/env bash
# Deterministic frame export for scene-whatsapp-followup.html (8s @ 24fps).
# Each frame is rendered by freezing the CSS timeline at ?t=<seconds>.
set -euo pipefail

HTML="$(cd "$(dirname "$0")" && pwd)/scene-whatsapp-followup.html"
OUT="${1:-./seq}"
FPS=24
DUR=8
CHROME="${CHROME:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"

mkdir -p "$OUT"
total=$((FPS * DUR))
seq 0 $((total - 1)) | xargs -P 6 -I{} sh -c '
  t=$(echo "scale=4; {}/'"$FPS"'" | bc)
  n=$(printf "%04d" {})
  '"$CHROME"' --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1080 --virtual-time-budget=1800 \
    --screenshot='"$OUT"'/$n.png "file://'"$HTML"'?t=$t" 2>/dev/null
'

# H.264 master (needs a full ffmpeg build; the bundled Playwright one is VP8-only)
ffmpeg -y -framerate $FPS -i "$OUT/%04d.png" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart \
  scene-whatsapp-followup.mp4
