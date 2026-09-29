"""Tighten the ElevenLabs voiceover and write per-line subtitle timings.

Usage: python3 scripts/prep_vo.py   (run from the project root)
Reads assets/audio/vo_aaditya.mp3, caps every pause at MAX_GAP seconds, speeds
the read up by TEMPO, and writes assets/audio/vo.wav + assets/audio/vo.json.
"""

import json
import subprocess
import numpy as np
import soundfile as sf

SR = 48000
MAX_GAP = 0.45
TEMPO = 1.05
LEAD = 0.3  # silence before the first word

# Line boundaries measured on the raw take (pauses found by silence detection).
LINES = [
    ("AU Small Finance Bank faced the scale problem.", None, 3.12),
    ("Lakhs of rejected and cross-sell leads had potential.", 3.92, 7.08),
    ("But manually calling, qualifying, and following up with every customer wasn’t practical.", 7.79, 13.53),
    ("But they deployed DoubleTick AI Voice.", 14.68, 17.33),
    ("AI automatically re-engaged customers, understood their requirements,", 18.12, 22.55),
    ("classified intent, and surfaced qualified opportunities for the sales team.", 22.88, 27.33),
    ("At scale, this delivered", 28.45, 30.43),
    ("3 lakh+ AI calls,", 31.08, 32.94),
    ("5,000+ qualified leads,", 33.69, 35.91),
    ("1,700+ recovered gold loan opportunity.", 36.61, 39.93),
    ("From unworked leads to sales-ready conversation,", 41.0, 43.91),
    ("powered by DoubleTick.", 44.33, None),
]

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", "assets/audio/vo_aaditya.mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
    capture_output=True,
    check=True,
).stdout
y = np.frombuffer(raw, dtype=np.float32).copy()

# 10 ms energy envelope → silent runs
w = int(0.01 * SR)
e = np.array([np.sqrt((y[i : i + w] ** 2).mean()) for i in range(0, len(y) - w, w)])
db = 20 * np.log10(e + 1e-9)
voiced = db >= db.max() - 40
first = np.argmax(voiced) * 0.01
last = (len(voiced) - np.argmax(voiced[::-1])) * 0.01

# build a time map old→new while cutting pauses down to MAX_GAP
keep = []  # (old_start, old_end) segments that are kept
t = max(0.0, first - 0.05)
i = int(t / 0.01)
seg_start = t
run = 0
cap = int(MAX_GAP / 0.01)
end_idx = min(len(voiced), int((last + 0.25) / 0.01))
while i < end_idx:
    if not voiced[i]:
        run += 1
        if run == cap + 1:  # start skipping
            keep.append((seg_start, i * 0.01))
        i += 1
        continue
    if run > cap:
        seg_start = i * 0.01
    run = 0
    i += 1
keep.append((seg_start, end_idx * 0.01))

pieces, new_t, anchors = [], 0.0, []
for a, b in keep:
    anchors.append((a, new_t))
    pieces.append(y[int(a * SR) : int(b * SR)])
    new_t += b - a
    anchors.append((b, new_t))
tight = np.concatenate(pieces)


def to_new(old):
    for (a0, n0), (a1, n1) in zip(anchors[::2], anchors[1::2]):
        if old <= a1:
            return n0 + max(0.0, old - a0)
    return anchors[-1][1]


sf.write("assets/audio/_vo_tight.wav", tight, SR)
subprocess.run(
    [
        "ffmpeg", "-v", "error", "-y", "-i", "assets/audio/_vo_tight.wav",
        "-af", f"atempo={TEMPO},adelay={int(LEAD * 1000)},loudnorm=I=-16:TP=-1.5",
        "-ar", str(SR), "-ac", "1", "assets/audio/vo.wav",
    ],
    check=True,
)
subprocess.run(["rm", "-f", "assets/audio/_vo_tight.wav"], check=True)

total = LEAD + len(tight) / SR / TEMPO
meta = []
for text, a, b in LINES:
    a = first if a is None else a
    b = last if b is None else b
    meta.append(
        {
            "text": text,
            "start": round(LEAD + to_new(a) / TEMPO, 3),
            "end": round(LEAD + to_new(b) / TEMPO, 3),
        }
    )
json.dump(meta, open("assets/audio/vo.json", "w"), indent=1, ensure_ascii=False)
print("vo length", round(total, 2))
for m in meta:
    print(m)
