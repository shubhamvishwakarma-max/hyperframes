"""Deterministic sound-design generator for the DoubleTick CRM-reactivation ad.

Writes assets/audio/score.wav: one pre-mixed music bed + SFX track (38.0s, 48k stereo).
Run: /tmp/ttsvenv/bin/python tools/score.py
"""
import numpy as np, soundfile as sf, os

SR = 48000
DUR = 52.4
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
# Act 1 (0 - 17.55): low premium tension over the cold database
add(pad([55, 82.4, 110], 18.2, gain=0.30, a=0.35, r=2.0), 0.0, 0.9)
add(pad([164.8, 196.0], 17.6, gain=0.10, a=2.0, r=2.4), 0.4, 0.8)
t = 0.35
while t < 17.2:
    add(sub_pulse(46, 0.5), t, 0.50)
    t += 0.7

# database / interface texture under the record list
t = 0.35
while t < 4.4:
    add(tick(), t, 0.30)
    t += 0.28
t = 0.3
while t < 1.9:
    add(tick(), t, 0.20)
    t += 0.1

# one broker, one number at a time
for t0 in (10.3, 10.92, 11.54, 12.16):
    add(tone(1400, 0.06, a=0.002, r=0.05), t0, 0.15)
    add(tone(1180, 0.06, a=0.002, r=0.05), t0 + 0.1, 0.13)
t = 12.8
while t < 14.4:
    add(tick(), t, 0.22)
    t += 0.16

# Act 2 (17.55 - 41.9): the reveal, the calls, the fallback
add(whoosh(0.85, up=True), 16.9, 0.32)
add(sub_pulse(40, 1.2), 17.55, 0.80)
add(pad([82.4, 123.5, 164.8, 246.9], 7.0, gain=0.26, a=0.5, r=2.4), 17.55, 1.0)
add(pad([110, 164.8, 220, 329.6], 7.4, gain=0.24, a=0.9, r=2.4), 24.1, 1.0)
add(pad([98, 146.8, 196, 293.7], 12.0, gain=0.24, a=0.8, r=2.6), 30.65, 1.0)
t = 17.65
i = 0
while t < 41.7:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# Act 3 (41.9 - 52.4): the database wakes up, then resolve
add(pad([110, 164.8, 220, 277.2], 6.4, gain=0.26, a=0.4, r=1.8), 41.9, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 4.6, gain=0.32, a=0.5, r=2.8), 47.95, 1.0)
t = 42.0
i = 0
while t < 48.0:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.6), 48.0, 0.85)
add(sub_pulse(38, 2.2), 49.8, 0.42)

# ---------------------------------------------------------------- SFX
# S1: records loading, then the competitor spend rising
add(blip(1560, 0.07), 4.5, 0.20)
add(whoosh(0.6, up=True), 5.6, 0.16)

# S3: reveal -> routing -> calls initiating -> PSTN connect -> viewing booked
add(blip(1760, 0.08), 18.72, 0.28)
add(tick(), 19.28, 0.28); add(blip(1320, 0.07), 19.3, 0.20)
add(blip(1480, 0.08), 19.86, 0.22)
for k, t0 in enumerate((20.58, 20.72, 20.86, 21.0)):
    add(blip(1150 + k * 95, 0.06), t0, 0.14)
for t0 in (21.44, 21.8, 22.16, 22.52):
    add(blip(1520, 0.06), t0, 0.15)
for off in (0.0, 0.42):  # PSTN two-tone before the connect
    ring = (tone(440, 0.30, a=0.01, r=0.12) + tone(480, 0.30, a=0.01, r=0.12)) * 0.5
    add(ring, 23.2 + off, 0.15)
add(blip(880, 0.12), 24.16, 0.28)
add(blip(1480, 0.07), 27.44, 0.18)
add(tone(587.3, 0.14, a=0.004, r=0.12), 28.72, 0.20)
add(tone(880.0, 0.28, a=0.004, r=0.24), 28.86, 0.22)

# S4: unanswered call, then the WhatsApp follow-up - soft, never a consumer alert
add(tone(392.0, 0.22, a=0.006, r=0.2), 31.56, 0.16)
add(tone(311.1, 0.34, a=0.006, r=0.3), 31.74, 0.16)
add(blip(1320, 0.07), 33.26, 0.18)
add(blip(1560, 0.07), 33.72, 0.18)
add(whoosh(0.45, up=True), 34.7, 0.18)
add(blip(1046.5, 0.09), 35.42, 0.20)
add(tick(), 36.94, 0.24); add(blip(1244.5, 0.06), 36.96, 0.14)
add(tick(), 37.78, 0.24); add(blip(1318.5, 0.06), 37.8, 0.14)
add(blip(1760, 0.09), 39.54, 0.22); add(blip(2093, 0.07), 39.62, 0.14)

# S5: rows flipping from cold to active
for k in range(5):
    add(tick(), 42.56 + k * 0.18, 0.18)
    add(blip(1400 + k * 60, 0.05), 43.36 + k * 0.18, 0.13)

# S6: CTA resolve
add(whoosh(0.5, up=True), 47.6, 0.22)
add(blip(1046.5, 0.5), 48.1, 0.16)

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
