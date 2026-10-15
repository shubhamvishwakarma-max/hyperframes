"""Generate per-scene VO lines with the offline Kokoro TTS model."""
import sys, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1]
k = Kokoro(f"{M}/kokoro.onnx", f"{M}/voices.bin")
LINES = [
  "MakeMyTrip had over two thousand travel agents on separate WhatsApp numbers.",
  "But managers couldn't see the conversations.",
  "Chats were scattered. Follow-ups slipped. Generic campaigns fell flat.",
  "With DoubleTick, agents sent personalised campaigns from their own numbers,",
  "while managers tracked every conversation from one central dashboard.",
  "The result? Thirty percent higher operational efficiency. Ten percent incremental revenue growth.",
  "Over two thousand agents enabled.",
  "Your travel business could be next. Book your free DoubleTick pilot today.",
]
voice = sys.argv[2] if len(sys.argv) > 2 else "bm_george"
for i, line in enumerate(LINES, 1):
    audio, sr = k.create(line, voice=voice, speed=1.2, lang="en-gb")
    sf.write(f"vo/line{i}.wav", audio, sr)
    print(i, round(len(audio) / sr, 2))
