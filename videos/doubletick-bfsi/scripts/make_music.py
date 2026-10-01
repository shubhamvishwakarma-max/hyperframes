"""Synthesize the music bed for the DoubleTick BFSI film.

Premium, restrained electronic product-launch bed at 112 BPM. The beat grid is
anchored so beat 0 lands on the "unlock" (VO "With DoubleTick" at 12.20s).
Deterministic: every noise source uses a fixed seed.

Output: assets/music.wav (44.1 kHz stereo, 47.0s)
"""

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
DUR = 47.0
N = int(SR * DUR)
BPM = 112
B = 60 / BPM
ANCHOR = 12.20  # beat 0
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
# separate sends so reverb can be applied once
REV_L = np.zeros(N)
REV_R = np.zeros(N)


def t_of(b):
    return ANCHOR + b * B


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, order=2):
    sos = butter(order, fc, "low", fs=SR, output="sos")
    return sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = butter(order, fc, "high", fs=SR, output="sos")
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], "band", fs=SR, output="sos")
    return sosfilt(sos, x)


def place(sig_l, sig_r, t, gain=1.0, send=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig_l = sig_l[-i:]
        sig_r = sig_r[-i:]
        i = 0
    n = min(len(sig_l), N - i)
    L[i : i + n] += sig_l[:n] * gain
    R[i : i + n] += sig_r[:n] * gain
    if send:
        REV_L[i : i + n] += sig_l[:n] * gain * send
        REV_R[i : i + n] += sig_r[:n] * gain * send


def pan(sig, p):
    # p in [-1, 1]
    a = (p + 1) * np.pi / 4
    return sig * np.cos(a), sig * np.sin(a)


def env_adsr(n, a, d, s, r, hold):
    """n samples total; a,d,r seconds; s sustain level; hold = seconds before release."""
    t = np.arange(n) / SR
    e = np.zeros(n)
    a = max(a, 1e-4)
    e = np.where(t < a, t / a, e)
    dm = (t >= a) & (t < a + d)
    e = np.where(dm, 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    sm = (t >= a + d) & (t < hold)
    e = np.where(sm, s, e)
    rm = t >= hold
    lvl = s if hold >= a + d else 1.0
    e = np.where(rm, lvl * np.exp(-(t - hold) / max(r, 1e-4) * 4.0), e)
    return e


def saw_additive(f, n, max_h=None, phase=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    nh = int(min(9000 / f, max_h or 64))
    for h in range(1, nh + 1):
        out += np.sin(2 * np.pi * f * h * t + phase * h) / h
    return out * 0.55


# ---------------------------------------------------------------- instruments


def kick(gain=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 300) * 0.25
    s = np.tanh((body + click) * 1.6) * 0.85 * gain
    return s, s


def clap(gain=1.0):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        e += np.where(t >= off, np.exp(-(t - off) * (180 if k < 2 else 26)), 0)
    s = bp(noise, 900, 5200) * e * 0.33 * gain
    return pan(s, 0.05)


def hat(open_=False, gain=1.0, p=0.25):
    n = int((0.22 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    s = hp(rng.standard_normal(n), 7500, 4) * np.exp(-t * (16 if open_ else 95)) * 0.16 * gain
    return pan(s, p)


def tick(gain=1.0, f=2100, p=0.0):
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) * 0.5 + bp(rng.standard_normal(n), 1500, 6000) * 0.4) * np.exp(-t * 85)
    return pan(s * 0.22 * gain, p)


def sub_pulse(m, gain=1.0, length=0.42):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    e = np.minimum(t / 0.012, 1) * np.exp(-t * 5.5)
    s = s * e * 0.5 * gain
    return s, s


def bass(m, length, gain=1.0):
    n = int(length * SR)
    f = midi(m)
    s = saw_additive(f, n, max_h=14)
    s = lp(s, 520, 2)
    s += np.sin(2 * np.pi * f * np.arange(n) / SR) * 0.6
    e = env_adsr(n, 0.006, 0.12, 0.55, 0.06, length - 0.06)
    s = np.tanh(s * e * 1.4) * 0.42 * gain
    return s, s


def pad(notes, length, gain=1.0, cutoff=1500, bright=False):
    n = int((length + 1.2) * SR)
    sl = np.zeros(n)
    sr = np.zeros(n)
    for j, m in enumerate(notes):
        for k, det in enumerate([-0.09, 0.0, 0.08]):
            f = midi(m + det)
            v = saw_additive(f, n, max_h=24, phase=rng.uniform(0, 6.28))
            p = ((k - 1) * 0.55 + (j - len(notes) / 2) * 0.08)
            a, b = pan(v, max(-1, min(1, p)))
            sl += a
            sr += b
    sl = lp(sl, cutoff, 2)
    sr = lp(sr, cutoff, 2)
    if bright:
        sl += hp(sl, 2500) * 0.25
        sr += hp(sr, 2500) * 0.25
    e = env_adsr(n, 0.55, 0.4, 0.85, 1.0, length)
    g = 0.07 * gain / max(1, len(notes) ** 0.5)
    return sl * e * g, sr * e * g


def pluck(m, gain=1.0, p=0.0, decay=9.0, cutoff=3200):
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = saw_additive(f, n, max_h=16) * 0.6 + np.sin(2 * np.pi * f * t) * 0.6
    s = lp(s, cutoff, 2)
    s = s * np.minimum(t / 0.003, 1) * np.exp(-t * decay)
    return pan(s * 0.16 * gain, p)


def bell(m, gain=1.0, p=0.0, length=3.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    s = (
        np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6)
        + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 3)
        + 0.15 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 5)
    )
    s *= np.minimum(t / 0.004, 1)
    return pan(s * 0.12 * gain, p)


def riser(length, gain=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 24
    for k in range(blocks):
        a = k * n // blocks
        b = (k + 1) * n // blocks
        fc = 400 * (12 ** (k / blocks))
        seg = bp(noise[max(0, a - 2000) : b], fc * 0.7, min(fc * 1.4, 16000))
        out[a:b] = seg[-(b - a) :]
    e = (t / length) ** 2.2
    s = out * e * 0.12 * gain
    return pan(s, -0.2)[0], pan(s, 0.2)[1]


# ---------------------------------------------------------------- harmony
# F major colours, optimistic. Each chord: (bass midi, pad voicing)
DM9 = (38, [50, 53, 57, 60, 64])  # D F A C E
BBMAJ7 = (34, [50, 53, 57, 58, 65])  # D F A Bb F
FMAJ9 = (41, [53, 57, 60, 64, 67])  # F A C E G
C69 = (36, [52, 55, 57, 62, 64])  # C E G A D
GM9 = (43, [53, 57, 58, 62, 65])
PROG = [DM9, BBMAJ7, FMAJ9, C69]
ARP = {
    id(DM9): [62, 65, 69, 72, 76, 72, 69, 65],
    id(BBMAJ7): [62, 65, 69, 70, 74, 70, 69, 65],
    id(FMAJ9): [65, 69, 72, 76, 79, 76, 72, 69],
    id(C69): [64, 67, 69, 74, 76, 74, 69, 67],
}

# ---------------------------------------------------------------- arrangement

# Intro + drop-offs: beats -23 .. 0
# pad: Dm9 (intro) -> Bbmaj7 -> C (tension into unlock)
intro_chords = [(-23, 8, DM9, 0.85), (-15, 4, DM9, 0.9), (-11, 4, BBMAJ7, 1.0), (-7, 6, C69, 1.05)]
for b0, nb, ch, g in intro_chords:
    sl, sr = pad(ch[1], nb * B, gain=g, cutoff=1100)
    place(sl, sr, t_of(b0), send=0.35)

for b in range(-22, 0):
    t = t_of(b)
    # soft heartbeat pulse in intro, tighter in drop-off section
    if b < -12:
        m = 38
        sl, sr = sub_pulse(m, gain=0.55 if b < -20 else 0.8)
        place(sl, sr, t)
        sl, sr = hat(gain=0.45, p=0.3)
        place(sl, sr, t + B / 2, send=0.15)
    elif b < -1:
        m = 38 if b < -7 else 36
        sl, sr = sub_pulse(m, gain=0.9, length=0.3)
        place(sl, sr, t)
        for k in range(4):
            sl, sr = hat(gain=0.35 + (0.25 if k == 2 else 0), p=0.35 if k % 2 else -0.2)
            place(sl, sr, t + k * B / 4, send=0.1)
        sl, sr = tick(gain=0.7, f=1900, p=-0.25)
        place(sl, sr, t + B / 2, send=0.2)

# riser into the unlock (silence the final half beat for impact)
sl, sr = riser(4 * B - 0.05, gain=1.0)
place(sl, sr, t_of(-4))
sl, sr = tick(gain=1.0, f=2600)
place(sl, sr, t_of(-1), send=0.4)

# Main groove: beats 0 .. 58
SECTION_GOV = 31  # ~28.8s widen
SECTION_LIFT = 42  # ~34.7s lift
SECTION_OPEN = 50  # ~38.98s open harmony
SECTION_END = 58  # ~43.27s


for bar in range(0, (SECTION_OPEN) // 4 + 1):
    b0 = bar * 4
    if b0 >= SECTION_OPEN:
        break
    ch = PROG[bar % 4]
    nb = min(4, SECTION_OPEN - b0)
    # pad
    widen = b0 >= SECTION_GOV - 3
    sl, sr = pad(ch[1], nb * B, gain=1.0 if not widen else 1.15, cutoff=1500 if not widen else 2300, bright=widen)
    place(sl, sr, t_of(b0), send=0.3)
    if widen:
        sl, sr = pad([m + 12 for m in ch[1][2:]], nb * B, gain=0.55, cutoff=4200)
        place(sl, sr, t_of(b0), send=0.6)
    for k in range(nb):
        b = b0 + k
        t = t_of(b)
        # kick on 1 and 3, plus syncopated "and of 3" pickup on odd bars
        if k in (0, 2):
            sl, sr = kick(gain=0.95)
            place(sl, sr, t)
        if k == 3 and bar % 2 == 1:
            sl, sr = kick(gain=0.55)
            place(sl, sr, t + B / 2)
        if k in (1, 3):
            sl, sr = clap(gain=0.8 if b < SECTION_LIFT else 0.95)
            place(sl, sr, t, send=0.35)
        # 16th hats with accents
        for s16 in range(4):
            acc = 1.0 if s16 == 2 else 0.55
            sl, sr = hat(gain=acc, p=0.3 if s16 % 2 else -0.15)
            place(sl, sr, t + s16 * B / 4, send=0.08)
        if b >= SECTION_LIFT:
            sl, sr = hat(open_=True, gain=0.6, p=-0.3)
            place(sl, sr, t + B / 2, send=0.2)
        # bass eighths (sidechain feel: second eighth softer)
        for e8 in range(2):
            m = ch[0] + (12 if (e8 == 1 and k == 3) else 0)
            sl, sr = bass(m, B / 2 - 0.02, gain=1.0 if e8 == 0 else 0.7)
            place(sl, sr, t + e8 * B / 2 + (0.03 if e8 == 0 else 0))
        # arp 8ths
        arp = ARP[id(ch)]
        for e8 in range(2):
            idx = (k * 2 + e8) % 8
            m = arp[idx] + (12 if widen else 0)
            sl, sr = pluck(m, gain=0.75, p=-0.45 if idx % 2 else 0.45, cutoff=2600 if not widen else 3800)
            place(sl, sr, t + e8 * B / 2, send=0.45)

# clap roll into the lift and into open harmony
for k in range(4):
    sl, sr = clap(gain=0.35 + k * 0.12)
    place(sl, sr, t_of(SECTION_LIFT - 1) + k * B / 4, send=0.3)

# Open harmony: beats 50 .. 58 — Bbmaj9 -> Fmaj9, airy, drums thinned
OPEN = [((34, [58, 62, 65, 69, 72]), 4), ((41, [57, 60, 64, 67, 72]), 4)]
b = SECTION_OPEN
for (bass_m, voicing), nb in OPEN:
    sl, sr = pad(voicing, nb * B, gain=1.25, cutoff=3000, bright=True)
    place(sl, sr, t_of(b), send=0.6)
    sl, sr = pad([m + 12 for m in voicing[1:4]], nb * B, gain=0.5, cutoff=5200)
    place(sl, sr, t_of(b), send=0.8)
    for k in range(nb):
        t = t_of(b + k)
        sl, sr = sub_pulse(bass_m, gain=0.9, length=0.5)
        place(sl, sr, t)
        if k in (0, 2):
            sl, sr = kick(gain=0.6)
            place(sl, sr, t)
        for s8 in range(2):
            sl, sr = hat(gain=0.6, p=0.2)
            place(sl, sr, t + s8 * B / 2, send=0.1)
        sl, sr = pluck(voicing[(k * 2) % 5] + 12, gain=0.6, p=-0.4, decay=5, cutoff=4200)
        place(sl, sr, t, send=0.7)
        sl, sr = pluck(voicing[(k * 2 + 3) % 5] + 12, gain=0.45, p=0.4, decay=5, cutoff=4200)
        place(sl, sr, t + B / 2, send=0.7)
    b += nb

# Beats 58..60: gentle lift (C69 pad, soft rising ticks) then resolve on Fadd9 at beat 60
sl, sr = pad(C69[1], 2 * B, gain=0.9, cutoff=2400)
place(sl, sr, t_of(58), send=0.6)
for k in range(4):
    sl, sr = tick(gain=0.5 + 0.12 * k, f=1800 + 220 * k, p=(-1) ** k * 0.3)
    place(sl, sr, t_of(58) + k * B / 2, send=0.4)

t_res = t_of(60)
sl, sr = kick(gain=0.8)
place(sl, sr, t_res)
sl, sr = pad([53, 57, 60, 65, 67, 72], DUR - t_res - 1.4, gain=1.35, cutoff=3200, bright=True)
place(sl, sr, t_res, send=0.7)
sl, sr = sub_pulse(29 + 12, gain=1.0, length=2.4)
place(sl, sr, t_res)
for k, m in enumerate([77, 81, 84, 89]):
    sl, sr = bell(m, gain=0.75, p=(-0.4, 0.3, -0.2, 0.4)[k], length=DUR - t_res)
    place(sl, sr, t_res + k * 0.06, send=0.6)

# ---------------------------------------------------------------- reverb + master


def ir(seconds, seed):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    x = r.standard_normal(n) * np.exp(-t * 3.2)
    x = lp(x, 6000)
    x[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return x / np.sqrt(np.sum(x**2))


wet_l = fftconvolve(hp(REV_L, 250), ir(2.4, 11))[:N]
wet_r = fftconvolve(hp(REV_R, 250), ir(2.4, 12))[:N]
L += wet_l * 0.55
R += wet_r * 0.55

# gentle high-pass and glue
L = hp(L, 28)
R = hp(R, 28)
mix = np.stack([L, R], axis=1)
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25)
# fade in first 0.4s, fade out last 1.2s
fi = int(0.4 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.2 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix *= 10 ** (-1.5 / 20)
wavfile.write("assets/music.wav", SR, (mix * 32767).astype(np.int16))
print("wrote assets/music.wav", mix.shape[0] / SR, "s")
