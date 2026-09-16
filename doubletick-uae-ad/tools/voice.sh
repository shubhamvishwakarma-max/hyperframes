#!/usr/bin/env bash
# Regenerate the voiceover: General American English, Kokoro-82M (am_michael).
# Requires: pip install kokoro-onnx soundfile  (point HYPERFRAMES_PYTHON at that venv)
set -euo pipefail
cd "$(dirname "$0")/.."
gen() { npx -y hyperframes tts "$2" -v am_michael -s "$3" -o "assets/audio/$1.wav"; }
gen vo1 "If your sales team takes more than five minutes to call a new project lead..." 1.06
gen vo2 "you may already be handing that opportunity to another developer." 1.06
gen vo3 "With DoubleTick A.I. Calling, every new lead can receive an instant P S T N call." 1.0
gen vo4 "It answers payment plan questions, understands intent, and qualifies budget in real time." 1.0
gen vo5 "Your brokers step in only when the investor is ready." 1.0
gen vo6 "Scale your next launch without scaling your sales team. Book your DoubleTick Voice A.I. demo." 1.04
