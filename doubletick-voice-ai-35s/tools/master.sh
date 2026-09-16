#!/usr/bin/env bash
# Loudness-master the music bed. The voice is already mastered by voice.sh
# (-15 LUFS); the bed sits ~11 LU under it so narration always stays dominant.
set -euo pipefail
cd "$(dirname "$0")/../assets/audio"
ffmpeg -v error -y -i score.wav -af loudnorm=I=-26:TP=-6:LRA=11 -ar 48000 score.norm.wav
mv score.norm.wav score.wav
echo "bed mastered"
