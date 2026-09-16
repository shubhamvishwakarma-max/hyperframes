"""Deterministic sound-design generator for the DoubleTick UAE ad.

Writes assets/audio/score.wav: one pre-mixed music bed + SFX track (38.0s, 48k stereo).
Run: /tmp/ttsvenv/bin/python tools/score.py
"""
import numpy as np, soundfile as sf, os

SR = 48000
DUR = 40.0
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
# Act 1 (0 - 14.6): tension under the hook and the slow-follow-up problem
add(pad([55, 82.4, 110], 15.2, gain=0.30, a=0.35, r=1.8), 0.0, 0.9)
add(pad([164.8, 196.0], 14.8, gain=0.10, a=2.0, r=2.2), 0.4, 0.8)
t = 0.35
while t < 14.3:
    add(sub_pulse(46, 0.5), t, 0.50)
    t += 0.7
t = 0.5
while t < 7.4:
    add(tick(), t, 0.34)
    t += 0.5

# the lead sliding to the rival developer
add(whoosh(0.9, up=False), 5.85, 0.30)
add(tone(220, 0.5, a=0.01, r=0.45), 6.35, 0.16)
add(tone(174.6, 0.7, a=0.01, r=0.6), 6.6, 0.18)

# manual dialling under scene 02 - restrained, never chaotic
for t0 in (9.5, 10.0, 10.5, 11.0, 11.5):
    add(tone(1400, 0.06, a=0.002, r=0.05), t0, 0.15)
    add(tone(1180, 0.06, a=0.002, r=0.05), t0 + 0.1, 0.13)
t = 11.5
while t < 13.1:
    add(tick(), t, 0.22)
    t += 0.16

# Act 2 (14.6 - 32.6): the DoubleTick reveal - confident, warmer
add(whoosh(0.85, up=True), 13.9, 0.32)
add(sub_pulse(40, 1.2), 14.6, 0.80)
add(pad([82.4, 123.5, 164.8, 246.9], 6.4, gain=0.26, a=0.5, r=2.2), 14.6, 1.0)
add(pad([110, 164.8, 220, 329.6], 9.0, gain=0.24, a=0.9, r=2.4), 20.4, 1.0)
add(pad([98, 146.8, 196, 293.7], 8.2, gain=0.24, a=0.8, r=2.4), 25.0, 1.0)
t = 14.7
i = 0
while t < 32.4:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# Act 3 (32.6 - 40): resolve into the CTA
add(whoosh(0.7, up=True), 32.2, 0.26)
add(pad([110, 164.8, 220, 277.2], 3.8, gain=0.26, a=0.4, r=1.4), 32.6, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 6.4, gain=0.32, a=0.5, r=2.8), 36.0, 1.0)
t = 32.7
i = 0
while t < 36.0:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.6), 36.05, 0.85)
add(sub_pulse(38, 2.2), 37.6, 0.42)

# ---------------------------------------------------------------- SFX
# S1: the competing-launch handover
add(blip(1560), 5.34, 0.26); add(blip(2080, 0.07), 5.42, 0.16)

# S2: lead rows landing
for t0 in (8.82, 8.92, 9.02, 9.12, 9.22):
    add(tick(), t0, 0.22)

# S3: reveal -> routing -> PSTN ring -> connect
add(blip(1760, 0.08), 16.56, 0.30)
add(tick(), 16.98, 0.30); add(blip(1320, 0.07), 17.0, 0.22)
add(blip(1480, 0.08), 17.42, 0.24)
for t0 in (18.45, 18.95):  # two-tone PSTN ring cadence
    for off in (0.0, 0.42):
        ring = (tone(440, 0.34, a=0.01, r=0.12) + tone(480, 0.34, a=0.01, r=0.12)) * 0.5
        add(ring, t0 + off, 0.16)
add(blip(880, 0.12), 19.34, 0.30)
add(blip(1320, 0.10), 19.44, 0.22)

# S4: qualification confirmations
for t0 in (22.9, 23.4, 23.9, 24.4):
    add(blip(1480, 0.07), t0, 0.20)
    add(tick(), t0, 0.15)

# S5: live-transfer cue
add(tone(587.3, 0.16, a=0.004, r=0.12), 28.7, 0.22)
add(tone(880.0, 0.30, a=0.004, r=0.26), 28.86, 0.24)
add(blip(1174.7, 0.12), 29.3, 0.20)

# S6: concurrent calls + CTA
for k, t0 in enumerate((32.76, 32.94, 33.12, 33.3, 33.48, 33.66)):
    add(blip(1180 + k * 90, 0.06), t0, 0.13)
add(whoosh(0.5, up=True), 35.7, 0.22)
add(blip(1046.5, 0.5), 36.1, 0.16)

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
