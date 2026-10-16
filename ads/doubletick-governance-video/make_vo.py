"""Offline placeholder VO (Kokoro). Swap in a recorded take and re-time KP in index.html."""
import sys, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1]
k = Kokoro(f"{M}/kokoro.onnx", f"{M}/voices.bin")
LINES = [
 "Your travel agent just left the company. Did your customer chats and pending bookings leave with them?",
 "In many travel businesses, customer conversations, quotes, and refund promises live on agents' personal WhatsApp.",
 "When an agent leaves, managers lose visibility into what was promised.",
 "With DoubleTick, keep customer conversations on your brand's WhatsApp number and manage everything from one dashboard.",
 "Preserve chat history,",
 "track follow-ups,",
 "and reassign enquiries without losing context.",
 "DoubleTick also masks sensitive guest details,",
 "and uses AI to flag incorrect prices, missed replies, and policy violations before they escalate.",
 "Keep customer relationships, commitments, and service quality under your control.",
 "Book your free DoubleTick pilot today.",
]
for i, line in enumerate(LINES, 1):
    a, sr = k.create(line, voice="bm_george", speed=1.25, lang="en-gb")
    sf.write(f"vo/raw{i}.wav", a, sr)
    print(i, round(len(a) / sr, 2))
