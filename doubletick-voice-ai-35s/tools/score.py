"""Deterministic sound-design generator for the DoubleTick Voice AI 35s ad.

Writes assets/audio/score.wav: one pre-mixed music bed + SFX track (38.0s, 48k stereo).
Run: /tmp/ttsvenv/bin/python tools/score.py
"""
import numpy as np, soundfile as sf, os

SR = 48000
DUR = 35.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)  # seeded -> deterministic

def idx(t): return int(t * SR)

def add(sig, t, gain=1.0, pan=0.0):
    s = idx(t)
    if s >= N: return
    e = min(N, s + len(sig))
    seg = sig[: e - s] * gain
    L[s:e] += seg * (1.0 - max(0.0, pan))
    R[s:e] += seg * (1.0 + min(0.0, pan))

def env(n, a, d, s_lvl=0.0, r=0.0):
    e = np.ones(n)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai + di] = np.linspace(1, s_lvl if s_lvl else 1, di)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e

def tone(freq, dur, a=0.01, r=0.1, kind="sine", detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == "sine":
        w = np.sin(2 * np.pi * freq * t)
        if detune:
            w += 0.5 * np.sin(2 * np.pi * freq * (1 + detune) * t)
            w /= 1.5
    elif kind == "tri":
        w = 2 * np.abs(2 * ((freq * t) % 1) - 1) - 1
    else:
        w = np.sign(np.sin(2 * np.pi * freq * t)) * 0.4
    return w * env(n, a, 0, 0, r if r < dur else dur * 0.5)

def noise(dur, lp=None, hp=None, a=0.005, r=0.2):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    # crude one-pole filters
    if lp:
        k = np.exp(-2 * np.pi * lp / SR); y = np.zeros(n); prev = 0.0
        for i in range(n):
            prev = (1 - k) * w[i] + k * prev; y[i] = prev
        w = y * 3.0
    if hp:
        k = np.exp(-2 * np.pi * hp / SR); y = np.zeros(n); prev = 0.0; prevx = 0.0
        for i in range(n):
            prev = k * (prev + w[i] - prevx); prevx = w[i]; y[i] = prev
        w = y
    return w * env(n, a, 0, 0, r if r < dur else dur * 0.5)

def sub_pulse(freq=48, dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * np.exp(-t * 3) + freq * 0.6
    w = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return w * np.exp(-t * 5.5)

def pad(freqs, dur, gain=1.0, a=1.2, r=1.5):
    n = int(dur * SR); t = np.arange(n) / SR
    w = np.zeros(n)
    for i, f in enumerate(freqs):
        w += np.sin(2 * np.pi * f * t + i) * (0.8 ** i)
        w += 0.35 * np.sin(2 * np.pi * f * 2.002 * t)
    lfo = 1 + 0.06 * np.sin(2 * np.pi * 0.18 * t)
    return w / len(freqs) * lfo * env(n, a, 0, 0, r) * gain

def pluck(freq, dur=0.32):
    return tone(freq, dur, a=0.002, r=dur * 0.9, kind="tri") * 0.6

def whoosh(dur=0.6, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    w = rng.standard_normal(n)
    sweep = np.linspace(0.05, 1.0, n) if up else np.linspace(1.0, 0.05, n)
    k = np.exp(-2 * np.pi * (300 + 5000 * sweep) / SR)
    y = np.zeros(n); prev = 0.0
    for i in range(n):
        prev = (1 - k[i]) * w[i] + k[i] * prev; y[i] = prev
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return y * e * 4.0

def blip(freq=1320, dur=0.09):
    return tone(freq, dur, a=0.002, r=0.07) * 0.5 + tone(freq * 1.5, dur, a=0.002, r=0.05) * 0.2

def tick(dur=0.035):
    return noise(dur, hp=2500, a=0.001, r=0.03) * 0.5

# ---------------------------------------------------------------- MUSIC BED
# Act 1 (0 - 12.4): low tension while the clock runs
add(pad([55, 82.4, 110], 13.0, gain=0.30, a=0.35, r=1.8), 0.0, 0.9)
add(pad([164.8, 196.0], 12.6, gain=0.10, a=1.8, r=2.2), 0.3, 0.8)
t = 0.3
while t < 12.1:
    add(sub_pulse(46, 0.5), t, 0.50)
    t += 0.7

# elapsed-time texture under the hook, accelerating as the timer jumps
t = 0.3
while t < 2.45:
    add(tick(), t, 0.34)
    t += 0.21

# a competing developer connects
add(tone(523.3, 0.16, a=0.005, r=0.13), 2.95, 0.20)
add(tone(784.0, 0.26, a=0.005, r=0.22), 3.08, 0.20)

# launch-desk activity, light incoming enquiries
for t0 in (6.72, 7.24, 7.76, 8.28, 8.94):
    add(blip(1320, 0.05), t0, 0.13)
for t0 in (10.46, 10.64, 10.82, 11.16, 11.34, 11.52):
    add(tick(), t0, 0.18)

# Act 2 (12.4 - 28.22): DoubleTick takes the call
add(whoosh(0.8, up=True), 11.8, 0.32)
add(sub_pulse(40, 1.2), 12.4, 0.80)
add(pad([82.4, 123.5, 164.8, 246.9], 7.4, gain=0.26, a=0.5, r=2.2), 12.4, 1.0)
add(pad([110, 164.8, 220, 329.6], 9.2, gain=0.24, a=0.9, r=2.4), 19.4, 1.0)
t = 12.5
i = 0
while t < 28.0:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# Act 3 (28.22 - 35): convert, then resolve on the CTA
add(pad([110, 164.8, 220, 277.2], 4.0, gain=0.26, a=0.4, r=1.6), 28.22, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 3.6, gain=0.32, a=0.5, r=2.6), 31.55, 1.0)
t = 28.3
i = 0
while t < 31.6:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.5), 31.6, 0.85)
add(sub_pulse(38, 2.0), 33.2, 0.42)

# ---------------------------------------------------------------- SFX
# S1: the lead lands, then the status slips
add(blip(1560, 0.08), 0.15, 0.30); add(blip(2080, 0.06), 0.24, 0.18)
add(tone(330, 0.2, a=0.005, r=0.18), 1.26, 0.16)

# S3: routing, PSTN ring, connect, then question and qualification confirms
add(blip(1760, 0.08), 12.58, 0.28)
add(tick(), 13.06, 0.26); add(blip(1320, 0.06), 13.08, 0.20)
add(blip(1480, 0.07), 13.52, 0.22)
for off in (0.0, 0.42):
    ring = (tone(440, 0.30, a=0.01, r=0.12) + tone(480, 0.30, a=0.01, r=0.12)) * 0.5
    add(ring, 15.5 + off, 0.16)
add(blip(880, 0.12), 16.16, 0.28)
add(blip(1400, 0.06), 17.32, 0.18)
add(blip(1520, 0.06), 18.02, 0.18)
for t0 in (19.74, 20.16, 20.58, 21.0):
    add(blip(1480, 0.06), t0, 0.19)
    add(tick(), t0, 0.14)

# S4: dead numbers, then a clean transfer
for t0 in (23.14, 23.36, 23.58):
    add(tone(261.6, 0.18, a=0.005, r=0.16), t0, 0.12)
for t0 in (24.54, 24.7, 24.86, 25.02):
    add(tick(), t0, 0.18)
add(tone(587.3, 0.15, a=0.004, r=0.12), 26.3, 0.22)
add(tone(880.0, 0.28, a=0.004, r=0.24), 26.44, 0.24)
add(blip(1174.7, 0.10), 26.74, 0.18)

# S5: pipeline running, then the CTA resolve
for k, t0 in enumerate((28.32, 28.44, 28.56, 28.68)):
    add(blip(1180 + k * 90, 0.05), t0, 0.13)
add(whoosh(0.5, up=True), 31.25, 0.22)
add(blip(1046.5, 0.45), 31.7, 0.16)

# ---------------------------------------------------------------- MASTER
stereo = np.stack([L, R], axis=1)
# gentle master fades
fi, fo = int(0.06 * SR), int(1.2 * SR)
stereo[:fi] *= np.linspace(0, 1, fi)[:, None]
stereo[-fo:] *= np.linspace(1, 0, fo)[:, None]
# soft-clip then normalise so the bed never fights the voiceover
stereo = np.tanh(stereo * 0.9)
peak = np.max(np.abs(stereo))
stereo *= (0.30 / peak)  # ~ -10.5 dBFS peak; VO stays dominant

out = os.path.join(os.path.dirname(__file__), "..", "assets", "audio", "score.wav")
sf.write(out, stereo.astype(np.float32), SR, subtype="PCM_16")
print("wrote", os.path.normpath(out), round(len(stereo) / SR, 2), "s")
