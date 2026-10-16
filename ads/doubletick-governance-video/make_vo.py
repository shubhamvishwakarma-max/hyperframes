"""Offline placeholder VO (Kokoro). Swap in a recorded take and re-time KP in index.html."""
import sys, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1]
k = Kokoro(f"{M}/kokoro.onnx", f"{M}/voices.bin")
LINES = [
 "Your travel agent just left. Did your customer chats and pending bookings leave with them?",
 "Scattered WhatsApp conversations make it difficult to track follow-ups, customer commitments, and what agents actually promised.",
 "With DoubleTick, centralise your team's WhatsApp conversations in one dashboard.",
 "Keep customer history accessible, route enquiries to the right agent or property,",
 "and track every quote and cancellation policy.",
 "DoubleTick also masks sensitive guest details,",
 "and uses AI to flag incorrect prices, missed replies, and policy violations before they escalate.",
 "Keep customer relationships, conversations, and service quality under your control.",
 "Book your free DoubleTick pilot today.",
]
for i, line in enumerate(LINES, 1):
    a, sr = k.create(line, voice="bm_george", speed=1.33, lang="en-gb")
    sf.write(f"vo/raw{i}.wav", a, sr)
    print(i, round(len(a) / sr, 2))
