"""Deterministic sound-design generator for the DoubleTick UAE ad.

Writes assets/audio/score.wav: one pre-mixed music bed + SFX track (38.0s, 48k stereo).
Run: /tmp/ttsvenv/bin/python tools/score.py
"""
import numpy as np, soundfile as sf, os

SR = 48000
DUR = 38.0
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
# Act 1 (0 - 11.2): tension
add(pad([55, 82.4, 110], 11.8, gain=0.30, a=0.35, r=1.6), 0.0, 0.9)
add(pad([164.8, 196.0], 11.4, gain=0.10, a=2.0, r=2.0), 0.4, 0.8)
t = 0.35
while t < 11.0:
    add(sub_pulse(46, 0.5), t, 0.50)
    t += 0.7
# clock ticks under the hook + timer
t = 0.5
while t < 6.3:
    add(tick(), t, 0.42)
    t += 0.5
# accelerating ticks as the timer runs out
t = 4.2
step = 0.22
while t < 6.2:
    add(tick(), t, 0.36)
    t += step
    step = max(0.09, step * 0.88)

# dialling / missed-call layer under the problem scene (restrained)
for t0 in (6.7, 7.5, 8.3, 9.1, 9.9):
    add(tone(1400, 0.06, a=0.002, r=0.05), t0, 0.16)
    add(tone(1180, 0.06, a=0.002, r=0.05), t0 + 0.1, 0.14)

# Act 2 (11.2 - 27.4): the DoubleTick reveal - confident, warmer
add(whoosh(0.85, up=True), 10.5, 0.30)
add(sub_pulse(40, 1.1), 11.2, 0.75)
add(pad([82.4, 123.5, 164.8, 246.9], 8.8, gain=0.26, a=0.5, r=2.2), 11.2, 1.0)
add(pad([110, 164.8, 220, 329.6], 8.6, gain=0.24, a=0.9, r=2.4), 19.4, 1.0)
t = 11.3
i = 0
while t < 27.2:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# Act 3 (27.4 - 38): resolve
add(whoosh(0.7, up=True), 27.0, 0.26)
add(pad([110, 164.8, 220, 277.2], 4.6, gain=0.26, a=0.4, r=1.4), 27.4, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 6.6, gain=0.30, a=0.5, r=2.6), 31.5, 1.0)
t = 27.5
i = 0
while t < 33.8:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.6), 31.6, 0.85)
add(sub_pulse(38, 2.2), 35.0, 0.45)

# ---------------------------------------------------------------- SFX
# S1: new lead notification + status decay
add(blip(1560), 3.55, 0.34); add(blip(2080, 0.07), 3.62, 0.20)
add(tone(300, 0.22, a=0.004, r=0.2), 5.05, 0.18)   # NEW -> WAITING
add(tone(230, 0.26, a=0.004, r=0.24), 5.45, 0.18)  # WAITING -> COLD
add(whoosh(0.45, up=False), 5.9, 0.22)

# S2: lead stack thuds
for k, t0 in enumerate((6.9, 7.6, 8.3, 9.0)):
    add(sub_pulse(70, 0.22), t0, 0.26)
    add(tick(), t0, 0.30)

# S3: form submit -> routing -> PSTN ring -> connect
add(blip(1760, 0.08), 12.5, 0.34)
add(tick(), 13.15, 0.35); add(blip(1320, 0.07), 13.2, 0.24)
for t0 in (14.0, 15.0):  # two-tone ring cadence
    for off in (0.0, 0.42):
        ring = (tone(440, 0.34, a=0.01, r=0.12) + tone(480, 0.34, a=0.01, r=0.12)) * 0.5
        add(ring, t0 + off, 0.16)
add(blip(880, 0.12), 15.95, 0.30)   # call connect
add(blip(1320, 0.10), 16.05, 0.22)

# S4: qualification confirmations
for t0 in (21.7, 22.5, 23.3, 24.1, 24.9):
    add(blip(1480, 0.07), t0, 0.20)
    add(tick(), t0, 0.16)
add(blip(1960, 0.10), 25.9, 0.26)

# S5: transfer cue
add(tone(587.3, 0.16, a=0.004, r=0.12), 29.5, 0.22)
add(tone(880.0, 0.30, a=0.004, r=0.26), 29.66, 0.24)
add(blip(1174.7, 0.12), 30.6, 0.22)

# S6: scale cards + CTA
for k, t0 in enumerate((32.0, 32.18, 32.36, 32.54, 32.72, 32.9)):
    add(blip(1180 + k * 90, 0.06), t0, 0.14)
add(whoosh(0.5, up=True), 34.1, 0.22)
add(sub_pulse(42, 0.9), 34.5, 0.5)
add(blip(1046.5, 0.5), 34.6, 0.16)

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
