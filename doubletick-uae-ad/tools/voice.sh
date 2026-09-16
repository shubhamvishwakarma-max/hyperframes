#!/usr/bin/env bash
# Regenerate the voiceover. Kokoro-82M `am_michael` (clear, unexaggerated
# English) -> pause-tighten -> 1.26x time-stretch (pitch preserved) -> loudness.
# The spelled forms below are what make U-A-E, P-S-T-N and A-I read as letters.
# Requires: pip install kokoro-onnx soundfile numpy; HYPERFRAMES_PYTHON -> that venv.
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${HYPERFRAMES_PYTHON:-python3}"
RAW=$(mktemp -d)
say() { npx -y hyperframes tts "$2" -v am_michael -s "$3" -o "$RAW/$1.raw.wav" >/dev/null; }

say vo1 "Take more than five minutes to call a new project lead, and you didn't lose an investor. You handed millions in off-plan revenue to a rival developer." 1.1
say vo2 "In the U. A. E., slow follow-ups kill launch inventory. While brokers dial spreadsheets by hand, thousands of high-intent leads sit cold." 1.1
say vo3 "Double Tick A. I. Calling changes that instantly. The second a lead registers, we dial over direct P. S. T. N. lines, talking naturally, answering payment plan questions, vetting budget on the spot." 1.1
say vo4 "No robotic delays. No missed leads. Brokers stop chasing unverified numbers and step in only to close live transfers with qualified investors." 1.1
say vo5 "Sell out your next development in record time, without expanding your sales team. Book your Double Tick Voice A. I. demo today." 1.08

for v in vo1 vo2 vo3 vo4 vo5; do
  "$PY" tools/tighten.py "$RAW/$v.raw.wav" "$RAW/$v.tight.wav"
  ffmpeg -v error -y -i "$RAW/$v.tight.wav" -af "atempo=1.26,loudnorm=I=-15:TP=-1.5:LRA=7" -ar 48000 "assets/audio/$v.wav"
done
rm -rf "$RAW"
echo "voiceover written to assets/audio/"
