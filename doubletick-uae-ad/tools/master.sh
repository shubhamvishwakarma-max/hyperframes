#!/usr/bin/env bash
# Loudness-master the audio assets so the rendered MP4 lands near -14 LUFS
# (social delivery). Voice sits ~11 LU above the bed. Idempotent-ish: re-run
# after regenerating voice.sh / score.py, not on already-mastered files.
set -euo pipefail
cd "$(dirname "$0")/../assets/audio"
for f in vo1 vo2 vo3 vo4 vo5 vo6; do
  ffmpeg -v error -y -i "$f.wav" -af loudnorm=I=-15:TP=-1.5:LRA=7 -ar 48000 "$f.norm.wav"
  mv "$f.norm.wav" "$f.wav"
done
ffmpeg -v error -y -i score.wav -af loudnorm=I=-26:TP=-6:LRA=11 -ar 48000 score.norm.wav
mv score.norm.wav score.wav
echo "mastered"
