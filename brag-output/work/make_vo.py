import sys, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1]
k = Kokoro(f"{M}/kokoro.onnx", f"{M}/voices.bin")
LINES = [
 "It's 1 AM. A traveller wants to book a holiday. Who's responding?",
 "Your team is offline. Replies get delayed, quotes are pending, and potential bookings slip away.",
 "With DoubleTick, travel enquiries coming from Instagram, ads, websites, and other sources land directly on WhatsApp.",
 "DoubleTick Agentic AI responds twenty four seven, captures destinations, travel dates and budgets,",
 "checks connected pricing and availability, and shares personalised quotes.",
 "Ready to book? Send a secure deposit link.",
 "Still deciding? Automated WhatsApp follow-ups bring back the original quote.",
 "High-value enquiries reach your consultant with the full conversation and trip details.",
 "Turn more enquiries into booking opportunities.",
 "Book your free pilot today.",
]
for i, line in enumerate(LINES, 1):
    a, sr = k.create(line, voice="bm_george", speed=1.26, lang="en-gb")
    sf.write(f"vo/raw{i}.wav", a, sr)
