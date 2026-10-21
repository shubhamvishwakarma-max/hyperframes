"""Deterministic 120 BPM product-launch bed for the DoubleTick ad.

0-10.6s  restrained late-night tension (A minor pad, ticking hats, soft pulse, riser)
10.6s    positive lift when DoubleTick appears (C-G-Am-F, four-on-the-floor)
36.6s    drums drop for one G bar under the CTA, 38.6s final C resolve, fade to 41s
Usage: python3 scripts/make_music.py assets/music/bed.wav
"""

import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 41.0
N = int(SR * DUR)
BEAT = 0.5
LIFT = 10.6  # downbeat where the track turns positive
END_RESOLVE = 38.6
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a, d, s, r, sr=SR):
    t = np.arange(n) / sr
    total = n / sr
    e = np.ones(n) * s
    e[t < a] = t[t < a] / max(a, 1e-4)
    m = (t >= a) & (t < a + d)
    e[m] = 1 - (1 - s) * (t[m] - a) / max(d, 1e-4)
    rel = t > total - r
    e[rel] *= np.clip((total - t[rel]) / max(r, 1e-4), 0, 1)
    return e


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * (1 - max(pan, 0))
    R[i : i + len(sig)] += sig * gain * (1 + min(pan, 0))


def lp(sig, fc, order=2):
    return sosfilt(butter(order, fc, btype="low", fs=SR, output="sos"), sig)


def hp(sig, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), sig)


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        f = freq * (1 + d)
        out += 2 * ((t * f) % 1.0) - 1
    return out / 3


def pad(notes, start, dur, gain, cutoff):
    n = int(dur * SR)
    sig = sum(saw(midi(m), n, 0.004) for m in notes) / len(notes)
    sig = lp(sig, cutoff) * env_adsr(n, 0.6, 0.2, 0.9, 0.8)
    add(sig, start, gain, -0.2)
    add(lp(sum(saw(midi(m), n, 0.007) for m in notes) / len(notes), cutoff) * env_adsr(n, 0.6, 0.2, 0.9, 0.8), start, gain, 0.2)


def kick(start, gain=0.9):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) * np.exp(-t * 9)
    add(sig, start, gain)


def clap(start, gain=0.28):
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sig = hp(lp(noise, 5000), 900) * np.exp(-t * 22)
    add(sig, start, gain)


def hat(start, gain=0.08, decay=60):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    sig = hp(rng.standard_normal(n), 7000) * np.exp(-t * decay)
    add(sig, start, gain, 0.25)


def tick(start, gain=0.12):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180)
    add(sig, start, gain, -0.3)


def bass(note, start, dur, gain=0.32):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * midi(note) * t) + 0.3 * np.sin(4 * np.pi * midi(note) * t)
    sig = lp(sig, 600) * env_adsr(n, 0.005, 0.08, 0.6, 0.05)
    add(sig, start, gain)


def pluck(note, start, gain=0.07, pan=0.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    sig = (np.sin(2 * np.pi * midi(note) * t) + 0.25 * np.sin(6 * np.pi * midi(note) * t)) * np.exp(-t * 11)
    add(sig, start, gain, pan)


# --- Tension: 0 - LIFT -------------------------------------------------------
pad([45, 52, 60, 64], 0.0, LIFT + 0.4, 0.16, 700)
grid0 = LIFT - 10 * BEAT * 2  # 0.6s
b = grid0
while b < LIFT - 0.01:
    tick(b, 0.10)
    tick(b + BEAT / 2, 0.05)
    beat_i = round((b - grid0) / BEAT)
    if beat_i % 2 == 0:
        kick(b, 0.35)
    b += BEAT
for k in range(8):  # low pulse
    bass(33, grid0 + k * 1.0 + 0.5, 0.4, 0.12)
# riser into the lift
n = int(1.0 * SR)
t = np.arange(n) / SR
noise = hp(rng.standard_normal(n), 2500) * (t / t[-1]) ** 2
add(noise, LIFT - 1.0, 0.10)

# --- Lift: positive progression ----------------------------------------------
prog = [
    ([48, 55, 64, 67], 36, [72, 76, 79, 76]),  # C
    ([43, 55, 62, 67], 31, [71, 74, 79, 74]),  # G
    ([45, 57, 64, 69], 33, [72, 76, 81, 76]),  # Am
    ([41, 53, 60, 65], 29, [69, 72, 77, 72]),  # F
]
bar = 0
t0 = LIFT
while t0 < END_RESOLVE - 2.01:
    chord, root, arp = prog[bar % 4]
    pad(chord, t0, 2.1, 0.12, 2600)
    for i in range(4):
        bt = t0 + i * BEAT
        kick(bt, 0.8)
        if i in (1, 3):
            clap(bt, 0.22)
        hat(bt + BEAT / 2, 0.09)
        hat(bt, 0.035)
        for e in range(2):
            bass(root, bt + e * BEAT / 2, BEAT / 2 - 0.02, 0.26)
    for i in range(8):
        pluck(arp[i % 4], t0 + i * BEAT / 2, 0.055, 0.35 if i % 2 else -0.35)
    bar += 1
    t0 += 2.0
# drum drop: one G bar of suspense under the CTA
pad([43, 55, 62, 67, 71], END_RESOLVE - 2.0, 2.1, 0.13, 3200)
for i in range(8):
    pluck([71, 74, 79, 83][i % 4], END_RESOLVE - 2.0 + i * BEAT / 2, 0.05 + i * 0.004, 0.3 if i % 2 else -0.3)
n = int(2.0 * SR)
t = np.arange(n) / SR
add(hp(rng.standard_normal(n), 3000) * (t / t[-1]) ** 3, END_RESOLVE - 2.0, 0.08)
# final resolve
kick(END_RESOLVE, 0.9)
pad([36, 48, 55, 64, 67, 72], END_RESOLVE, DUR - END_RESOLVE, 0.17, 3000)
bass(24, END_RESOLVE, 2.2, 0.3)
for i, m in enumerate([72, 76, 79, 84]):
    pluck(m, END_RESOLVE + i * 0.12, 0.07)

# --- Master --------------------------------------------------------------------
mix = np.stack([L, R], axis=1)
fade_in = int(0.4 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fo = int(1.6 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= np.max(np.abs(mix)) / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1], DUR, "s")
