"""Original background score, synthesized deterministically (seeded).

112 BPM, D major, one continuous track arranged against the scene map in
build/vo-timing.json:
  s01 intro      soft pad + sparse bell piano, felt pulse
  s02 AU         light rhythm: soft kick, pluck arp, clean bass
  s03 Piramal    + shaker 16ths
  s04 Wint       + rim on 2 & 4 (steady confident momentum)
  s05 CoinDCX    + counter-melody pluck (slight progression)
  s06 Samar      maintain
  s07 recap      +~12% energy: open hat, fuller arp, pad brighter
  s08 CTA        drums thin out, pad opens, final Dmaj9 rings out

Output: assets/audio/music.wav (48 kHz stereo, peak ~-3 dBFS, unducked).
"""

import json
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
BPM = 112.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(20260923)

timing = json.load(open(os.path.join(ROOT, "build/vo-timing.json")))
TOTAL = timing["total"]
S = {k: v["start"] for k, v in timing["scenes"].items()}
N = int(TOTAL * SR) + SR
L = np.zeros(N)
R = np.zeros(N)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), "low", output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc / (SR / 2), "high", output="sos"), x)


def env_adsr(n, a, d, s, r, sustain_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sl = max(0, int(sustain_len * SR) - a - d)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(sl, s), np.linspace(s, 0, max(r, 1))])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl = np.cos((pan + 1) * np.pi / 4) * gain
    gr = np.sin((pan + 1) * np.pi / 4) * gain
    L[i : i + len(sig)] += sig * gl
    R[i : i + len(sig)] += sig * gr


def section(t):
    order = ["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08"]
    cur = "s01"
    for k in order:
        if t + 1e-6 >= snap(S[k]):
            cur = k
    return cur


def snap(t):
    """Section changes land on the bar line nearest the scene start."""
    return round(t / BAR) * BAR


# Chords (MIDI): Dmaj9, Bm11, Gmaj7(#11-ish), A6sus -> 1 bar each
CHORDS = [
    [50, 57, 61, 64, 66],  # D A C# E F#
    [47, 54, 57, 62, 64],  # B F# A D E
    [43, 50, 54, 59, 61],  # G D F# B C#
    [45, 52, 54, 57, 62],  # A E F# A D
]
ROOTS = [38, 35, 31, 33]

n_bars = int(np.ceil(TOTAL / BAR)) + 1

# ---- instruments -------------------------------------------------------------


def pad(chord, dur, bright):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for j, m in enumerate(chord):
        for det in (-0.07, 0.07):
            f = midi(m + 12) * 2 ** (det / 12)
            ph = rng.uniform(0, 2 * np.pi)
            # soft saw via few harmonics
            for h in range(1, 6):
                s += np.sin(2 * np.pi * f * h * t + ph * h) / (h ** 1.6) * 0.5
    s = lp(s, 900 + 1400 * bright)
    return s * env_adsr(n, 0.9, 0.5, 0.8, 1.4, dur) / len(chord)


def pluck(m, dur=0.35, bright=1.0):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t + 0.3)
    e = np.exp(-t / (0.09 + 0.05 * bright))
    return lp(s * e, 2500 + 2000 * bright) * env_adsr(n, 0.002, 0.01, 1, 0.05, dur)


def bell(m, dur=1.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.2 * np.exp(-t / 0.4)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.7) + 0.3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.3)
    return s * env_adsr(n, 0.004, 0.05, 1, 0.3, dur)


def bass(m, dur):
    n = int((dur + 0.1) * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    s = np.tanh(1.6 * s) / np.tanh(1.6)
    return lp(s, 700) * env_adsr(n, 0.005, 0.12, 0.7, 0.06, dur)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.12) * 0.9


def noise_hit(dur, fc_hp, decay):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), fc_hp) * np.exp(-t / decay)


def rim():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    s = 0.6 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.015) + 0.5 * hp(rng.standard_normal(n), 1800) * np.exp(-t / 0.03)
    return s


KICK = kick()

# ---- arrangement -------------------------------------------------------------
end_t = TOTAL
cta = snap(S["s08"])
for b in range(n_bars):
    t0 = b * BAR
    if t0 > end_t:
        break
    sec = section(t0 + 0.01)
    ci = b % 4
    chord = CHORDS[ci]
    lift = sec == "s07"
    final = t0 >= cta
    bright = 0.35 if sec == "s01" else (0.9 if lift or final else 0.6)

    # Pad (always)
    last_bar = t0 + BAR > end_t - 3.5
    pdur = BAR if not last_bar else max(0.5, end_t - t0 - 1.2)
    add(pad(CHORDS[0] if last_bar else chord, pdur, bright), t0, gain=0.34 if not final else 0.4, pan=0)

    # Bell piano: intro + CTA, sparse
    if sec == "s01" or final:
        for k, beat in enumerate([0, 1.5, 3]):
            if last_bar and beat > 0:
                continue
            m = chord[(k * 2 + b) % len(chord)] + 12
            add(bell(m), t0 + beat * BEAT, gain=0.10, pan=-0.3 + 0.3 * k)

    # Felt pulse in intro (quarter notes on root, very soft)
    if sec == "s01" and t0 > 1.0:
        for q in range(4):
            add(pluck(ROOTS[ci] + 24, 0.2, 0.2), t0 + q * BEAT, gain=0.07, pan=0)

    drums = sec not in ("s01",) and not last_bar
    if sec != "s01" and not last_bar:
        # Bass: syncopated 8ths
        pattern = [0, 1.5, 2, 3.5] if not final else [0, 2]
        for p in pattern:
            add(bass(ROOTS[ci], 0.42 if p % 1 else 0.5), t0 + p * BEAT, gain=0.30)
        # Arp: 8th-note pluck over chord tones
        arp_idx = [0, 2, 3, 4, 3, 2, 4, 1]
        for k in range(8):
            if final and k % 2:
                continue
            m = chord[arp_idx[k]] + 12
            g = 0.075 if not lift else 0.09
            add(pluck(m, 0.25, bright), t0 + k * BEAT / 2, gain=g, pan=-0.35 if k % 2 else 0.35)
    if drums:
        kick_beats = [0, 2] if sec in ("s02", "s03") or final else [0, 1, 2, 3]
        for q in kick_beats:
            add(KICK, t0 + q * BEAT, gain=0.42 if not lift else 0.46)
        if sec not in ("s02",) and not final:
            for s16 in range(16):
                acc = 0.035 if s16 % 2 else 0.05
                add(noise_hit(0.05, 6000, 0.012), t0 + s16 * BEAT / 4, gain=acc * (1.2 if lift else 1), pan=0.25)
        if sec in ("s04", "s05", "s06", "s07"):
            for q in (1, 3):
                add(rim(), t0 + q * BEAT, gain=0.14, pan=-0.1)
        if lift:
            for q in range(4):
                add(noise_hit(0.22, 7000, 0.07), t0 + (q + 0.5) * BEAT, gain=0.05, pan=-0.2)
        if sec in ("s05", "s06", "s07"):
            # counter-melody: two notes per bar, upper register
            mel = [chord[4] + 12, chord[2] + 12]
            for k, beat in enumerate([0.5, 2.5]):
                add(pluck(mel[k], 0.5, 0.8), t0 + beat * BEAT, gain=0.06, pan=0.45)

# Riser-free soft swell into the recap (subtle, filtered noise)
sw_t = snap(S["s07"]) - BAR
n = int(BAR * SR)
sw = lp(rng.standard_normal(n), 2500) * np.linspace(0, 1, n) ** 2 * 0.05
add(sw, sw_t, gain=1.0)

# Final ring-out: bell Dmaj9 at the last downbeat before end
add(bell(74, 3.5), max(0, end_t - 3.3), gain=0.10, pan=-0.2)
add(bell(78, 3.5), max(0, end_t - 3.3) + 0.12, gain=0.08, pan=0.2)
add(bell(81, 3.5), max(0, end_t - 3.3) + 0.24, gain=0.07, pan=0.0)

# ---- master ------------------------------------------------------------------
# short stereo room (two taps) for glue, very subtle
for d, g in ((0.023, 0.12), (0.037, 0.1)):
    k = int(d * SR)
    L[k:] += g * R[:-k]
    R[k:] += g * L[:-k]
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
mix = hp(mix.T, 30).T
# gentle glue: soft clip
mix = np.tanh(1.2 * mix) / 1.2
fade_in = int(0.8 * SR)
fade_out = int(2.6 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
mix[-fade_out:] *= (np.linspace(1, 0, fade_out) ** 1.5)[:, None]
mix *= 0.708 / np.abs(mix).max()  # -3 dBFS peak
sf.write(os.path.join(ROOT, "assets/audio/music.wav"), mix.astype(np.float32), SR, subtype="PCM_16")
print(f"music.wav {TOTAL:.2f}s, bars={n_bars}, sections at", {k: round(snap(v), 2) for k, v in S.items()})
