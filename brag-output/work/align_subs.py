import sys, json
from pocketsphinx import Decoder
raw = open(sys.argv[1], 'rb').read(); SR = 16000
# [raw start, dur] per VO line (video start - 0.2)
LINES = [(0.0, 4.38), (5.08, 6.01), (11.48, 8.04), (19.82, 6.0), (26.05, 3.94), (30.4, 2.35), (33.19, 4.02), (37.6, 4.59), (42.47, 2.47), (45.24, 1.75)]
TEXT = [
 "its one a m a traveller wants to book a holiday whos responding",
 "your team is offline replies get delayed quotes are pending and potential bookings slip away",
 "with double tick travel enquiries coming from instagram ads websites and other sources land directly on whats app",
 "double tick agentic a i responds twenty four seven captures destinations travel dates and budgets",
 "checks connected pricing and availability and shares personalized quotes",
 "ready to book send a secure deposit link",
 "still deciding automated whats app follow ups bring back the original quote",
 "high value enquiries reach your consultant with the full conversation and trip details",
 "turn more enquiries into booking opportunities",
 "book your free pilot today",
]
d = Decoder(samprate=SR, bestpath=False)
for w, ph in [("agentic", "AH JH EH N T IH K"), ("whats", "W AH T S"), ("traveller", "T R AE V AH L ER"), ("enquiries", "IH N K W AY ER IY Z"), ("whos", "HH UW Z")]:
    try: d.add_word(w, ph, True)
    except Exception as e: print("addword", w, e, file=sys.stderr)
out = []
for (st, du), txt in zip(LINES, TEXT):
    a = max(0, st - 0.15); b = st + du + 0.2
    chunk = raw[int(a*SR)*2:int(b*SR)*2]
    d.set_align_text(txt)
    d.start_utt(); d.process_raw(chunk, full_utt=True); d.end_utt()
    d.set_alignment()
    d.start_utt(); d.process_raw(chunk, full_utt=True); d.end_utt()
    words = []
    for seg in d.get_alignment():
        if seg.name in ("<s>", "</s>", "<sil>"): continue
        words.append([seg.name, round(a + seg.start/100, 2), round(a + (seg.start+seg.duration)/100, 2)])
    out.append(words)
    print(" ".join(f"{w}@{s:.2f}" for w,s,e in words))
json.dump(out, open(sys.argv[2], 'w'))
