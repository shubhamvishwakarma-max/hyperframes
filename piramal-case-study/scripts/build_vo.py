"""Cut the supplied voiceover down to the 30-second edit and emit the time map.

Steps
  1. Light cleanup of the original take (same chain as the 46 s version).
  2. Keep the clauses listed in SEGS (word boundaries from vo-alignment.json),
     tighten the pauses between them, splice with short fades.
  3. Time-stretch the assembled take with rubberband (pitch + formants kept)
     so the narration ends at VO_END.
  4. Write assets/audio/timemap.json and inject the same data into index.html
     between the @timemap markers, so the composition, subtitles, music and
     SFX all follow one old→new mapping.

    python3 scripts/build_vo.py
"""

import json
import os
import re
import subprocess

import numpy as np
from scipy.io import wavfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "assets", "audio")
SR = 48000

TOTAL = 30.0  # final cut length
VO_END = 28.55  # narration ends here; the rest is the end-frame hold
LEAD = 0.04

# (old start, old end, pause after — in original-time seconds, label)
SEGS = [
    (0.06, 4.60, 0.30, "Piramal Finance was managing thousands of conversations across the loan lifecycle."),
    (5.00, 6.37, 0.03, "But manually following up"),  # drops: on pending documents … channel partners
    (11.31, 13.42, 0.28, "was difficult to scale consistently."),
    (13.92, 16.89, 0.24, "So they deployed DoubleTick AI Voice."),
    (17.21, 19.40, 0.10, "AI automatically reached customers,"),  # drops: understood their requirements,
    (21.03, 21.97, 0.16, "captured intent"),
    (22.27, 25.59, 0.28, "and escalated complex conversations to the right RM."),  # drops: At scale, this delivered:
    (27.81, 30.95, 0.22, "5,704 plus calls attempted,"),
    (31.23, 35.13, 0.24, "1,343 completed customer conversations,"),
    (35.47, 38.90, 0.28, "and a 51.6 percent document follow-up connect rate."),
    (39.28, 43.05, 0.00, "From manual follow-ups to intelligent, scalable conversations."),
]

assembled = sum(e - s + g for s, e, g, _ in SEGS)
TEMPO = assembled / (VO_END - LEAD)

# cumulative (assembled-time) start of each kept segment
_cum = []
acc = 0.0
for s, e, g, _ in SEGS:
    _cum.append(acc)
    acc += e - s + g


def vo_new(t):
    """Old VO time → new time, for a time inside a kept segment (clamped to the nearest one)."""
    for (s, e, g, _), c in zip(SEGS, _cum):
        if t <= e + g:
            return LEAD + (c + min(max(t, s), e) - s) / TEMPO
    s, e, g, _ = SEGS[-1]
    return LEAD + (_cum[-1] + e - s) / TEMPO


# ---------------------------------------------------------------- visual map
# Anchors (old → new). Inside kept narration the map follows the voice exactly;
# across cut narration the visuals are spread over the neighbouring words so
# no scene collapses to zero length.
A = [(0.0, 0.0)]
A += [(4.60, vo_new(4.60))]
A += [(5.00, vo_new(5.00) - 0.02)]  # S2 starts with "But manually…"
A += [(11.60, vo_new(11.62))]  # "couldn't scale." lands on the spoken line
A += [(13.42, vo_new(13.42)), (13.92, vo_new(13.92))]
A += [(16.89, vo_new(16.89)), (17.21, vo_new(17.21)), (18.46, vo_new(18.46))]
A += [(21.07, vo_new(21.07)), (21.97, vo_new(21.97)), (22.27, vo_new(22.27))]
A += [(25.30, vo_new(25.30))]
A += [(27.84, vo_new(27.84))]
A += [(30.95, vo_new(30.95)), (31.23, vo_new(31.23)), (35.13, vo_new(35.13)), (35.47, vo_new(35.47))]
A += [(38.90, vo_new(38.90)), (39.28, vo_new(39.28)), (43.05, vo_new(43.05)), (46.0, TOTAL)]
VMAP = [[round(o, 4), round(n, 4)] for o, n in A]
assert all(VMAP[i][0] < VMAP[i + 1][0] and VMAP[i][1] < VMAP[i + 1][1] for i in range(len(VMAP) - 1)), VMAP

# ---------------------------------------------------------------- subtitles
SUB_SPEC = [
    ((0.10, 3.02), "Piramal Finance was managing thousands of conversations"),
    ((3.02, 4.60), "across the loan lifecycle."),
    ((5.00, 13.42), "But manually following up was difficult to scale consistently."),
    ((13.92, 16.89), "So they deployed DoubleTick AI Voice."),
    ((17.21, 21.97), "AI automatically reached customers, captured intent"),
    ((22.27, 25.59), "and escalated complex conversations to the right RM."),
    ((27.81, 30.95), "5,704+ calls attempted,"),
    ((31.23, 35.13), "1,343 completed customer conversations,"),
    ((35.47, 38.90), "and a 51.6% document follow-up connect rate."),
    ((39.28, 43.05), "From manual follow-ups to intelligent, scalable conversations."),
]
SUBS = []
for i, ((s, e), text) in enumerate(SUB_SPEC):
    a = max(0.0, vo_new(s) - 0.06)
    b = vo_new(e) + 0.22
    if i + 1 < len(SUB_SPEC):
        b = min(b, vo_new(SUB_SPEC[i + 1][0][0]) - 0.06)
    SUBS.append([round(a, 3), round(b, 3), text])

# ---------------------------------------------------------------- audio edit
src = os.path.join(AUD, "voiceover-original.mp3")
clean = os.path.join(AUD, "_vo-clean.wav")
cut = os.path.join(AUD, "_vo-cut.wav")
out = os.path.join(AUD, "voiceover.wav")
chain = (
    "highpass=f=75,equalizer=f=220:t=q:w=1.0:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=1.5,"
    "deesser=i=0.25,acompressor=threshold=-21dB:ratio=2.2:attack=10:release=140:makeup=1.5,"
    "volume=6.4dB,alimiter=limit=0.83:attack=4:release=60:level=disabled,aresample=48000"
)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", chain, "-ac", "1", "-c:a", "pcm_f32le", clean], check=True)
sr, x = wavfile.read(clean)
assert sr == SR
x = x.astype(np.float64)

FADE = int(0.012 * SR)
parts = []
for s, e, g, _ in SEGS:
    seg = x[int(s * SR) : int(e * SR)].copy()
    seg[:FADE] *= np.linspace(0, 1, FADE)
    seg[-FADE:] *= np.linspace(1, 0, FADE)
    parts.append(seg)
    parts.append(np.zeros(int(g * SR)))
wavfile.write(cut, SR, np.concatenate(parts).astype(np.float32))

stretch = f"rubberband=tempo={TEMPO:.5f}:formant=preserved:pitchq=quality:transients=mixed:window=standard"
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", "-i", cut, "-af", f"adelay={int(LEAD*1000)},{stretch}", "-ac", "2", "-c:a", "pcm_s16le", out],
    check=True,
)
os.remove(clean)
os.remove(cut)
# rubberband changes the level slightly — bring the take back to -17 LUFS (linear gain only)
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", meas)[-1])
tmp = out + ".tmp.wav"
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", "-i", out, "-af",
     f"volume={-17.0 - lufs:.2f}dB,alimiter=limit=0.63:attack=3:release=50:level=disabled",
     "-c:a", "pcm_s16le", tmp],
    check=True,
)
os.replace(tmp, out)
vo_len = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout)

# ---------------------------------------------------------------- outputs
data = {
    "total": TOTAL,
    "tempo": round(TEMPO, 5),
    "vo_length": round(vo_len, 3),
    "vmap": VMAP,
    "subs": SUBS,
    "segments": [
        {"old": [s, e], "new": [round(vo_new(s), 3), round(vo_new(e), 3)], "text": t} for s, e, g, t in SEGS
    ],
}
with open(os.path.join(AUD, "timemap.json"), "w") as f:
    json.dump(data, f, indent=1)

html_p = os.path.join(ROOT, "index.html")
html = open(html_p).read()
block = (
    "/* @timemap:start — generated by scripts/build_vo.py */\n"
    f"        const VMAP = {json.dumps(VMAP)};\n"
    f"        const SUBS = {json.dumps(SUBS, ensure_ascii=False)};\n"
    "        /* @timemap:end */"
)
html, n = re.subn(r"/\* @timemap:start.*?/\* @timemap:end \*/", lambda m: block, html, flags=re.S)
assert n == 1, "timemap markers missing in index.html"
html = re.sub(r'(<audio id="vo"[^>]*data-duration=")[0-9.]+"', lambda m: m.group(1) + f'{vo_len:.2f}"', html)
open(html_p, "w").write(html)

print(f"tempo {TEMPO:.3f}x · assembled {assembled:.2f}s → narration ends {VO_END}s · voiceover.wav {vo_len:.2f}s")
for sgm in data["segments"]:
    print(f"  {sgm['new'][0]:6.2f}–{sgm['new'][1]:6.2f}  {sgm['text']}")
