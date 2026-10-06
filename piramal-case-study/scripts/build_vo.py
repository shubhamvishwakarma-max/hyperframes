"""Cut the supplied voiceover down to the 30-second edit and emit the time map.

Steps
  1. Light cleanup of the original take and of the one inserted phrase
     ("At scale, in a day:" — same ElevenLabs voice, Aaditya – Healthcare
     Advisor), with the insert level-matched to the surrounding narration.
  2. Assemble the clauses listed in SEGS (word boundaries from
     vo-alignment.json), with tightened pauses and short splice fades.
     The KPI numbers are edited from the original words:
     "five thousand | plus calls attempted" and
     "one thousand three hundred | plus | completed customer conversations".
  3. Time-stretch with rubberband (pitch + formants kept) so the narration
     ends at VO_END.
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
VO_END = 28.7  # narration ends here; the rest is the end-frame hold
LEAD = 0.04

# (label, source, start, end, pause after — source seconds, text)
SEGS = [
    ("A", "orig", 0.06, 4.60, 0.32, "Piramal Finance was managing thousands of conversations across the loan lifecycle."),
    ("B", "orig", 5.00, 6.37, 0.03, "But manually following up"),
    ("C", "orig", 11.31, 13.42, 0.32, "was difficult to scale consistently."),
    ("D", "orig", 13.92, 16.89, 0.26, "So they deployed DoubleTick AI Voice."),
    ("E", "orig", 17.21, 19.40, 0.30, "AI automatically reached customers,"),
    ("F", "orig", 21.03, 21.97, 0.26, "captured intent"),
    ("G", "orig", 22.27, 25.59, 0.34, "and escalated complex conversations to the right RM."),
    ("INS", "ins", 0.00, 1.86, 0.20, "At scale, in a day:"),
    ("H1", "orig", 27.81, 28.59, 0.04, "five thousand"),
    ("H2", "orig", 29.64, 30.95, 0.26, "plus calls attempted,"),
    ("I1", "orig", 31.23, 32.47, 0.03, "one thousand three hundred"),
    ("PLUS", "orig", 29.64, 30.03, 0.05, "plus"),
    ("I2", "orig", 33.17, 35.13, 0.34, "completed customer conversations."),
    ("K", "orig", 39.28, 43.05, 0.00, "From manual follow-ups to intelligent, scalable conversations."),
]

assembled = sum(e - s + g for _, _, s, e, g, _ in SEGS)
TEMPO = assembled / (VO_END - LEAD)

NEW = {}  # label -> (src start, src end, new start, new end)
acc = 0.0
for lab, src, s, e, g, _ in SEGS:
    NEW[lab] = (s, e, LEAD + acc / TEMPO, LEAD + (acc + e - s) / TEMPO)
    acc += e - s + g


def at(lab, t=None, edge=None):
    """New time of source time t inside segment `lab` (or its start/end)."""
    s, e, n0, n1 = NEW[lab]
    if edge == "start":
        return n0
    if edge == "end":
        return n1
    return n0 + (min(max(t, s), e) - s) / TEMPO


# ---------------------------------------------------------------- visual map
# Anchors (old 46 s choreography time → new). The picture follows the voice
# exactly where words are kept; across cut narration the visuals are spread
# over the neighbouring words so no scene collapses.
A = [
    (0.0, 0.0),
    (4.60, at("A", edge="end")),
    (5.00, at("B", edge="start") - 0.02),
    (11.60, at("C", 12.16) - 0.25),  # "couldn't scale." just ahead of the spoken "scale"
    (13.42, at("C", edge="end")),
    (13.92, at("D", edge="start")),
    (16.89, at("D", edge="end")),
    (17.21, at("E", edge="start")),
    (18.46, at("E", 18.46)),
    (21.07, at("F", 21.07)),
    (21.97, at("F", edge="end")),
    (22.27, at("G", edge="start")),
    (25.30, at("G", 25.30)),
    (26.00, at("INS", edge="start")),  # "At scale, in a day" eyebrow on the spoken phrase
    (27.84, at("H1", 27.84)),
    (29.62, at("H2", edge="start") - 0.02),  # "+" on "plus"
    (30.95, at("H2", edge="end")),
    (31.23, at("I1", edge="start")),
    (32.47, at("I1", edge="end")),
    (32.98, at("PLUS", edge="start") - 0.02),  # second "+" on the second "plus"
    (33.19, at("I2", edge="start")),
    (35.13, at("I2", edge="end")),
    (38.90, at("I2", edge="end") + 0.2),
    (39.28, at("K", edge="start")),
    (43.05, at("K", edge="end")),
    (46.0, TOTAL),
]
VMAP = [[round(o, 4), round(n, 4)] for o, n in A]
assert all(VMAP[i][0] < VMAP[i + 1][0] and VMAP[i][1] < VMAP[i + 1][1] for i in range(len(VMAP) - 1)), VMAP

# ---------------------------------------------------------------- subtitles
SUB_SPEC = [
    (("A", "start"), ("A", 3.02), "Piramal Finance was managing thousands of conversations"),
    (("A", 3.02), ("A", "end"), "across the loan lifecycle."),
    (("B", "start"), ("C", "end"), "But manually following up was difficult to scale consistently."),
    (("D", "start"), ("D", "end"), "So they deployed DoubleTick AI Voice."),
    (("E", "start"), ("F", "end"), "AI automatically reached customers, captured intent"),
    (("G", "start"), ("G", "end"), "and escalated complex conversations to the right RM."),
    (("INS", "start"), ("INS", "end"), "At scale, in a day:"),
    (("H1", "start"), ("H2", "end"), "5,000+ calls attempted,"),
    (("I1", "start"), ("I2", "end"), "1,300+ completed customer conversations."),
    (("K", "start"), ("K", "end"), "From manual follow-ups to intelligent, scalable conversations."),
]


def _pt(p):
    lab, v = p
    return at(lab, edge=v) if isinstance(v, str) else at(lab, v)


SUBS = []
for i, (a, b, text) in enumerate(SUB_SPEC):
    t0 = max(0.0, _pt(a) - 0.06)
    t1 = _pt(b) + 0.22
    if i + 1 < len(SUB_SPEC):
        t1 = min(t1, _pt(SUB_SPEC[i + 1][0]) - 0.06)
    SUBS.append([round(t0, 3), round(t1, 3), text])

# ---------------------------------------------------------------- audio edit
chain = (
    "highpass=f=75,equalizer=f=220:t=q:w=1.0:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=1.5,"
    "deesser=i=0.25,acompressor=threshold=-21dB:ratio=2.2:attack=10:release=140:makeup=1.5,"
    "volume=6.4dB,alimiter=limit=0.83:attack=4:release=60:level=disabled,aresample=48000"
)
SRC = {
    "orig": os.path.join(AUD, "voiceover-original.mp3"),
    "ins": os.path.join(AUD, "vo-insert-at-scale-in-a-day.mp3"),
}
audio = {}
for key, path in SRC.items():
    tmp = os.path.join(AUD, f"_clean-{key}.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path, "-af", chain, "-ac", "1", "-c:a", "pcm_f32le", tmp], check=True)
    sr, x = wavfile.read(tmp)
    assert sr == SR
    audio[key] = x.astype(np.float64)
    os.remove(tmp)


def speech_rms(x):
    """RMS over the voiced frames only (20 ms frames above -40 dBFS)."""
    f = int(0.02 * SR)
    fr = x[: len(x) // f * f].reshape(-1, f)
    r = np.sqrt((fr**2).mean(1))
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


# level-match the inserted phrase to the narration around it
ref = audio["orig"][int(22.27 * SR) : int(30.95 * SR)]
audio["ins"] *= speech_rms(ref) / speech_rms(audio["ins"])

FADE = int(0.012 * SR)
parts = []
for lab, src, s, e, g, _ in SEGS:
    seg = audio[src][int(s * SR) : int(e * SR)].copy()
    seg[:FADE] *= np.linspace(0, 1, FADE)
    seg[-FADE:] *= np.linspace(1, 0, FADE)
    parts.append(seg)
    parts.append(np.zeros(int(g * SR)))
cut = os.path.join(AUD, "_vo-cut.wav")
out = os.path.join(AUD, "voiceover.wav")
wavfile.write(cut, SR, np.concatenate(parts).astype(np.float32))

stretch = f"rubberband=tempo={TEMPO:.5f}:formant=preserved:pitchq=quality:transients=mixed:window=standard"
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", "-i", cut, "-af", f"adelay={int(LEAD*1000)},{stretch}", "-ac", "2", "-c:a", "pcm_s16le", out],
    check=True,
)
os.remove(cut)
# bring the take back to -17 LUFS (linear gain) with a gentle -4 dBFS peak limit
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
        {"label": lab, "source": src, "src": [s, e], "new": [round(NEW[lab][2], 3), round(NEW[lab][3], 3)], "text": t}
        for lab, src, s, e, g, t in SEGS
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
    print(f"  {sgm['new'][0]:6.2f}–{sgm['new'][1]:6.2f}  [{sgm['source']}] {sgm['text']}")
