"""Deterministic sound-design generator for the DoubleTick CRM-reactivation 35s ad.

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
# Act 1 (0 - 11.35): the dormant database, controlled tension
add(pad([55, 82.4, 110], 12.0, gain=0.30, a=0.35, r=1.8), 0.0, 0.9)
add(pad([164.8, 196.0], 11.6, gain=0.10, a=1.8, r=2.2), 0.3, 0.8)
t = 0.3
while t < 11.1:
    add(sub_pulse(46, 0.5), t, 0.50)
    t += 0.7

# database / interface texture under the scrolling records
t = 0.3
while t < 3.0:
    add(tick(), t, 0.30)
    t += 0.26

# competing acquisition stack
for t0 in (3.08, 3.24, 3.40):
    add(blip(980, 0.06), t0, 0.14)

# the counter climbing, then manual dialling
for t0 in (5.98, 6.63, 7.28, 7.93):
    add(blip(880 + (t0 - 5.9) * 60, 0.06), t0, 0.16)
t = 5.98
while t < 8.7:
    add(tick(), t, 0.20)
    t += 0.13
for t0 in (9.82, 9.96, 10.10, 10.24):
    add(tone(1400, 0.05, a=0.002, r=0.05), t0, 0.13)

# Act 2 (11.35 - 27.7): DoubleTick takes over
add(whoosh(0.8, up=True), 10.75, 0.32)
add(sub_pulse(40, 1.2), 11.35, 0.80)
add(pad([82.4, 123.5, 164.8, 246.9], 7.0, gain=0.26, a=0.5, r=2.2), 11.35, 1.0)
add(pad([110, 164.8, 220, 329.6], 7.4, gain=0.24, a=0.9, r=2.4), 17.8, 1.0)
add(pad([98, 146.8, 196, 293.7], 8.4, gain=0.24, a=0.8, r=2.4), 23.2, 1.0)
t = 11.45
i = 0
while t < 27.5:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# Act 3 (27.7 - 35): the database wakes up, then resolve
add(pad([110, 164.8, 220, 277.2], 4.4, gain=0.26, a=0.4, r=1.6), 27.7, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 3.6, gain=0.32, a=0.5, r=2.6), 31.8, 1.0)
t = 27.8
i = 0
while t < 31.9:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.5), 31.9, 0.85)
add(sub_pulse(38, 2.0), 33.4, 0.42)

# ---------------------------------------------------------------- SFX
# S3: routing, PSTN ring, connect, qualification confirms
add(blip(1760, 0.08), 11.58, 0.26)
add(tick(), 12.05, 0.24); add(blip(1320, 0.06), 12.07, 0.18)
for off in (0.0, 0.42):
    ring = (tone(440, 0.30, a=0.01, r=0.12) + tone(480, 0.30, a=0.01, r=0.12)) * 0.5
    add(ring, 12.6 + off, 0.15)
add(blip(880, 0.12), 13.6, 0.26)
add(blip(1046.5, 0.07), 16.24, 0.18)
for t0 in (18.34, 18.64, 18.94):
    add(blip(1480, 0.06), t0, 0.18)
    add(tick(), t0, 0.13)
add(tone(587.3, 0.14, a=0.004, r=0.12), 19.54, 0.20)
add(tone(880.0, 0.26, a=0.004, r=0.22), 19.68, 0.22)

# S4: unanswered call, then a soft WhatsApp delivery
add(tone(392.0, 0.20, a=0.006, r=0.18), 20.8, 0.15)
add(tone(311.1, 0.30, a=0.006, r=0.26), 20.96, 0.15)
add(blip(1320, 0.06), 21.64, 0.16)
add(blip(1560, 0.06), 22.24, 0.16)
add(whoosh(0.45, up=True), 23.2, 0.18)
add(blip(1046.5, 0.08), 23.84, 0.18)
for t0 in (24.54, 25.24, 25.94):
    add(tick(), t0, 0.22); add(blip(1244.5, 0.05), t0, 0.13)

# S5: rows flipping active, then the CTA resolve
for k in range(5):
    add(blip(1400 + k * 60, 0.05), 28.56 + k * 0.16, 0.13)
add(whoosh(0.5, up=True), 31.5, 0.22)
add(blip(1046.5, 0.45), 31.95, 0.16)

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
