"""Find per-line timings in a voiceover take without an ASR model.

Usage: python3 scripts/align_vo.py <take.mp3> <out.json>

A local Kokoro reference of the same script is rendered line by line (so its
line boundaries are exact), DTW-aligned to the take on MFCCs, and each mapped
boundary is snapped to the nearest real pause in the take.
"""

import json
import subprocess
import sys
import numpy as np
import librosa
from kokoro_onnx import Kokoro

SR = 16000
HOP = 160  # 10 ms
LINES = [
    ("AU Small Finance Bank faced the scale problem.", "A U Small Finance Bank faced the scale problem."),
    ("Lakhs of rejected and cross-sell leads had potential.", "Laakhs of rejected and cross-sell leads had potential."),
    ("But manually calling, qualifying, and following up with every customer wasn’t practical.", "But manually calling, qualifying, and following up with every customer wasn't practical."),
    ("But they deployed DoubleTick AI Voice.", "But they deployed Double Tick A I Voice."),
    ("AI automatically re-engaged customers, understood their requirements,", "A I automatically re-engaged customers, understood their requirements,"),
    ("classified intent, and surfaced qualified opportunities for the sales team.", "classified intent, and surfaced qualified opportunities for the sales team."),
    ("At scale, this delivered", "At scale, this delivered"),
    ("3 lakh+ AI calls,", "three laakh plus A I calls,"),
    ("5,000+ qualified leads,", "five thousand plus qualified leads,"),
    ("1,700+ recovered gold loan opportunity.", "seventeen hundred plus recovered gold loan opportunity."),
    ("From unworked leads to sales-ready conversation,", "From unworked leads to sales-ready conversation,"),
    ("powered by DoubleTick.", "powered by Double Tick."),
]


def voiced_mask(y):
    e = librosa.feature.rms(y=y, frame_length=400, hop_length=HOP)[0]
    db = 20 * np.log10(e + 1e-9)
    return db >= db.max() - 40


def feats(y):
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=HOP, n_fft=512)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
    d = librosa.feature.delta(m)
    return np.vstack([m, d])


take_path, out_path = sys.argv[1], sys.argv[2]
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", take_path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
    capture_output=True,
    check=True,
).stdout
take = np.frombuffer(raw, dtype=np.float32).copy()

k = Kokoro("/root/.cache/hyperframes/tts/models/kokoro-v1.0.onnx", "/root/.cache/hyperframes/tts/voices/voices-v1.0.bin")
ref_parts, ref_bounds, t = [], [], 0.0
for _, spoken in LINES:
    s, sr = k.create(spoken, voice="hm_omega", speed=1.0, lang="en-gb")
    s = librosa.resample(s, orig_sr=sr, target_sr=SR)
    idx = np.where(np.abs(s) > 0.01)[0]
    s = s[idx[0] : idx[-1] + 1]
    ref_bounds.append((t, t + len(s) / SR))
    ref_parts += [s, np.zeros(int(0.25 * SR), dtype=np.float32)]
    t += len(s) / SR + 0.25
ref = np.concatenate(ref_parts)

_, wp = librosa.sequence.dtw(X=feats(ref), Y=feats(take), metric="cosine")
wp = wp[::-1]
ref_to_take = {}
for r, c in wp:
    ref_to_take.setdefault(r, []).append(c)


def map_t(tr):
    f = int(round(tr * SR / HOP))
    f = min(max(f, 0), max(ref_to_take))
    while f not in ref_to_take:
        f -= 1
    return float(np.median(ref_to_take[f])) * HOP / SR


# pauses in the take (≥80 ms of low energy) to snap boundaries onto
vm = voiced_mask(take)
pauses, st = [], None
for i, v in enumerate(vm):
    if not v and st is None:
        st = i
    if v and st is not None:
        if i - st >= 8:
            pauses.append((st * HOP / SR, i * HOP / SR))
        st = None
first = np.argmax(vm) * HOP / SR
last = (len(vm) - np.argmax(vm[::-1])) * HOP / SR


def snap(t, side):
    best = None
    for a, b in pauses:
        edge = a if side == "end" else b
        if abs(edge - t) <= 0.45 and (best is None or abs(edge - t) < abs(best - t)):
            best = edge
    return best if best is not None else t


out = []
for i, (text, _) in enumerate(LINES):
    a, b = ref_bounds[i]
    s = first if i == 0 else snap(map_t(a), "start")
    e = last if i == len(LINES) - 1 else snap(map_t(b), "end")
    out.append({"text": text, "start": round(s, 3), "end": round(e, 3)})
json.dump(out, open(out_path, "w"), indent=1, ensure_ascii=False)
for o in out:
    print(o)
