"""Deterministic music bed + SFX layer for the DoubleTick BFSI ad.

120 BPM grid (beat = 0.5 s) locked to the supplied voiceover:
  0.00–3.75  pulse intro (sparse, punchy)            Dm
  3.75–7.62  tension: drums out, sub + filtered pulse  Dm
  7.62–8.05  VACUUM (true silence at the freeze)
  8.05–8.50  riser  →  8.50 drop (solution unlocked)
  8.50–21.3  groove  F C Dm Bb
  21.3–25.3  + forward 16th saw arp (routing)
  25.3–30.5  open harmony (add9 pads, lighter hats)
  30.55      strip → 30.95 brand resolve chord
  32.5–35.5  CTA groove → 35.5 clean final hit
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import soundfile as sf

SR = 48000
DUR = 36.0
N = int(SR * DUR)
rng = np.random.default_rng(1005)


def t_(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, o=2):
    return sosfilt(butter(o, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, min(hi, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def saw(f, d, detune=0.0):
    t = t_(d)
    ph = (f * (1 + detune)) * t
    # band-limited-ish saw via additive (cap harmonics)
    out = np.zeros_like(t)
    nh = int(min(40, (SR / 2) / max(f, 1) - 1))
    for k in range(1, max(nh, 1) + 1):
        out += ((-1) ** (k + 1)) * np.sin(2 * np.pi * k * ph) / k
    return out * (2 / np.pi)


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.ones(n) * s
    a = min(a, n)
    e[:a] = np.linspace(0, 1, a, endpoint=False) if a else e[:a]
    dd = min(d, n - a)
    if dd > 0:
        e[a : a + dd] = np.linspace(1, s, dd)
    if r > 0 and n > r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def add(buf, x, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= buf.shape[0]:
        return
    x = x[: buf.shape[0] - i]
    if i < 0:
        x = x[-i:]
        i = 0
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(x), 0] += x * gain * l * 1.414
    buf[i : i + len(x), 1] += x * gain * r * 1.414


def reverb(x, secs=1.6, damp=4500, mix=0.18, seed=3):
    g = np.random.default_rng(seed)
    n = int(secs * SR)
    tt = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        noise = g.standard_normal(n) * np.exp(-tt * (6.9 / secs))
        ir[:, c] = lp(noise, damp)
    ir /= np.sqrt((ir**2).sum(axis=0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - mix) + wet * mix * 1.4


# ------------------------------------------------------------------ drums
def kick(punch=1.0):
    d = 0.42
    t = t_(d)
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 400) * 0.35
    return np.tanh((body + click) * 1.6 * punch) * 0.9


def clap():
    d = 0.32
    t = t_(d)
    n = rng.standard_normal(len(t))
    e = np.zeros_like(t)
    for k, o in enumerate([0, 0.011, 0.022]):
        e += (t >= o) * np.exp(-(t - o).clip(0) * (90 if k < 2 else 18))
    return bp(n, 900, 3200) * e * 0.55


def hat(open_=False):
    d = 0.22 if open_ else 0.06
    t = t_(d)
    n = hp(rng.standard_normal(len(t)), 7000, 4)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.35


def tick_perc():
    t = t_(0.03)
    return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 160) * 0.3


# ------------------------------------------------------------------ tonal
def pad(notes, d, cutoff=2200, att=0.25, rel=0.5, bright=1.0):
    out = np.zeros(int(d * SR))
    for m in notes:
        f = mtof(m)
        for dt in (-0.004, 0.0, 0.0045):
            out += saw(f, d, dt) * 0.18
    out = lp(out, cutoff * bright, 2)
    return out * env_adsr(len(out), att, 0.3, 0.85, rel)


def pluck(m, d=0.22, cutoff=3800, wave="saw"):
    t = t_(d)
    f = mtof(m)
    if wave == "saw":
        x = saw(f, d) * 0.6 + saw(f, d, 0.006) * 0.4
    else:
        x = np.sign(np.sin(2 * np.pi * f * t)) * 0.6
    # quick filter env: apply two filters crossfaded
    bright = lp(x, cutoff, 2)
    dark = lp(x, cutoff * 0.25, 2)
    k = np.exp(-t * 22)
    x = bright * k + dark * (1 - k)
    return x * np.exp(-t * 9) * env_adsr(len(t), 0.002, 0.05, 1, 0.03)


def bass(m, d):
    t = t_(d)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) * 0.85 + lp(saw(f, d), 600) * 0.45
    return np.tanh(x * 1.4) * env_adsr(len(t), 0.004, 0.08, 0.8, 0.04) * 0.7


def sub(m, d):
    t = t_(d)
    return np.sin(2 * np.pi * mtof(m) * t) * env_adsr(len(t), 0.4, 0.2, 1, 0.3)


def bell(freqs, d=1.0, decay=4.0):
    t = t_(d)
    x = np.zeros_like(t)
    for i, f in enumerate(freqs):
        x += np.sin(2 * np.pi * f * t) * np.exp(-t * decay * (1 + 0.3 * i)) / (1 + 0.4 * i)
        x += 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * decay * 3)
    return x * env_adsr(len(t), 0.004, 0.1, 1, 0.05)


# ================================================================== MUSIC
drums = np.zeros((N, 2))
tonal = np.zeros((N, 2))
pumpenv = np.ones(N)  # sidechain from kick

BEAT = 0.5
STOP = 7.62

F = {"F": [57, 60, 65, 69], "C": [55, 60, 64, 67], "Dm": [57, 62, 65, 69], "Bb": [58, 62, 65, 70]}
ROOT = {"F": 41, "C": 36, "Dm": 38, "Bb": 34}
OPEN = {"F": [57, 60, 65, 67, 72], "C": [55, 62, 64, 67, 74], "Dm": [57, 62, 64, 69, 72], "Bb": [58, 62, 65, 69, 72]}


def do_kick(t, g=1.0):
    add(drums, kick(), t, 0.8 * g)
    i = int(t * SR)
    L = int(0.32 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(L) / SR * 9)
    j = min(N, i + L)
    pumpenv[i:j] = np.minimum(pumpenv[i:j], seg[: j - i])


# --- intro pulse 0 – 3.75 (Dm) ---
for b in range(0, 8):
    t = b * BEAT
    if b % 2 == 0:
        do_kick(t, 1.05)
    add(drums, hat(), t + 0.25, 0.55, pan=0.25)
add(drums, clap(), 1.5, 0.7)
add(drums, clap(), 3.5, 0.55)
# 16th pluck pulse on D, filtered
for k in range(int(3.75 / 0.125)):
    t = k * 0.125
    m = [50, 62, 57, 62][k % 4]
    add(tonal, pluck(m, 0.16, 2600), t, 0.32, pan=(-0.3 if k % 2 else 0.3))
add(tonal, sub(38, 3.8), 0.0, 0.26)
add(tonal, pad([50, 57, 62, 65], 3.9, cutoff=1300, att=0.05), 0.0, 0.35)

# --- tension 3.75 – 7.62: drums out, low pulse + rising filter ---
for k in range(int((STOP - 3.75) / 0.25)):
    t = 3.75 + k * 0.25
    prog = (t - 3.75) / (STOP - 3.75)
    add(tonal, pluck(38 if k % 2 == 0 else 50, 0.2, 500 + 2200 * prog), t, 0.38 + 0.2 * prog)
    if k % 2 == 1:
        add(drums, tick_perc(), t, 0.25 + 0.3 * prog, pan=0.4)
add(tonal, sub(38, STOP - 3.75), 3.75, 0.32)
add(tonal, pad([50, 56, 62, 65], STOP - 3.75, cutoff=900, att=0.6, rel=0.05), 3.75, 0.3)

# --- riser 8.05 → 8.5 ---
rt = t_(0.45)
riser = bp(rng.standard_normal(len(rt)), 400, 6000) * (rt / 0.45) ** 2 * 0.5
sweep = np.sin(2 * np.pi * np.cumsum(220 + 900 * (rt / 0.45) ** 2) / SR) * (rt / 0.45) ** 2 * 0.25
add(tonal, riser + sweep, 8.05, 0.8)

# --- groove 8.5 → 30.5 ---
prog = ["F", "C", "Dm", "Bb"]
GROOVE_END = 30.5
bar_t = 8.5
bi = 0
while bar_t < GROOVE_END - 0.01:
    ch = prog[bi % 4]
    open_h = bar_t >= 24.5
    bar_len = min(2.0, GROOVE_END - bar_t)
    # pads
    notes = OPEN[ch] if open_h else F[ch]
    add(tonal, pad(notes, bar_len + 0.3, cutoff=2600 if open_h else 2000, att=0.08), bar_t, 0.42 if open_h else 0.34)
    for b in range(int(bar_len / BEAT)):
        t = bar_t + b * BEAT
        do_kick(t)
        if b % 2 == 1:
            add(drums, clap(), t, 0.75)
        # 16th hats
        for s in range(4):
            if s == 0:
                continue
            g = 0.5 if s == 2 else 0.22
            if open_h and s != 2:
                g *= 0.6
            add(drums, hat(open_=(s == 2 and open_h)), t + s * 0.125, g, pan=0.3 if s % 2 else -0.2)
        # offbeat pumping bass
        add(tonal, bass(ROOT[ch], 0.22), t + 0.25, 0.42)
        add(tonal, bass(ROOT[ch] + 12, 0.1), t + 0.375, 0.25)
    # chord stab on bar start (not in open section)
    if not open_h:
        for m in F[ch]:
            add(tonal, pluck(m + 12, 0.28, 5000), bar_t, 0.1, pan=0.0)
    # routing section: forward 16th saw arp
    if 21.3 <= bar_t + 1.9 and bar_t < 25.3:
        tones = [m + 12 for m in F[ch]]
        for s in range(int(bar_len / 0.125)):
            t = bar_t + s * 0.125
            if t < 21.3 or t >= 25.3:
                continue
            pr = (t - 21.3) / 4.0
            add(tonal, pluck(tones[s % 4], 0.14, 1500 + 4500 * pr), t, 0.16, pan=(-0.45 if s % 2 else 0.45))
    # light arp elsewhere in groove
    elif not open_h:
        tones = [m + 12 for m in F[ch]]
        for s in range(0, int(bar_len / 0.25)):
            t = bar_t + s * 0.25 + 0.125
            add(tonal, pluck(tones[(s * 2) % 4], 0.12, 3000), t, 0.07, pan=(-0.5 if s % 2 else 0.5))
    if open_h:
        # high shimmer layer
        add(tonal, pad([n + 12 for n in OPEN[ch][2:]], bar_len + 0.4, cutoff=5000, att=0.4), bar_t, 0.12)
    bar_t += 2.0
    bi += 1

# --- brand: strip at 30.5, resolve at 30.95 ---
add(tonal, pad([58, 62, 65, 69], 0.6, cutoff=1500, att=0.05, rel=0.3), 30.5, 0.25)
res = pad([53, 57, 60, 65, 67, 72], 1.9, cutoff=3200, att=0.02, rel=1.0)
add(tonal, res, 30.95, 0.5)
add(tonal, bell([mtof(77), mtof(81), mtof(84)], 1.8, 2.2), 30.95, 0.22)
add(tonal, sub(29, 1.5), 30.95, 0.28)
do_kick(30.95, 0.9)

# --- CTA groove 32.5 → 35.5, final hit 35.5 ---
cta_prog = [("Dm", 32.5), ("Bb", 33.5), ("C", 34.5)]
for ch, t0 in cta_prog:
    add(tonal, pad(F[ch], 1.1, cutoff=2400, att=0.05), t0, 0.32)
    for b in range(2):
        t = t0 + b * BEAT
        do_kick(t)
        if (b + (1 if ch == "Bb" else 0)) % 2 == 1:
            add(drums, clap(), t, 0.6)
        add(drums, hat(), t + 0.25, 0.4, pan=0.25)
        add(tonal, bass(ROOT[ch], 0.22), t + 0.25, 0.4)
# final hit
do_kick(35.5, 1.1)
add(drums, clap(), 35.5, 0.5)
fin = pad([53, 57, 60, 65, 69], 0.5, cutoff=3500, att=0.005, rel=0.35)
add(tonal, fin, 35.5, 0.5)
add(tonal, bass(29, 0.45), 35.5, 0.7)

# --- vacuum at the freeze: hard silence 7.62 → 8.05 ---
for buf in (drums, tonal):
    a = int(STOP * SR)
    fade = int(0.012 * SR)
    buf[a : a + fade] *= np.linspace(1, 0, fade)[:, None]
    buf[a + fade : int(8.05 * SR)] = 0

# sidechain pump on tonal content
tonal *= pumpenv[:, None]
tonal = reverb(tonal, 1.8, 5000, 0.22, seed=11)
drums = reverb(drums, 0.7, 7000, 0.08, seed=12)
music = drums * 0.9 + tonal
music = hp(music.T, 32, 2).T
low = lp(music.T, 140, 2).T
music = music - 0.38 * low  # tame the low end so the voice stays on top
air = hp(music.T, 5000, 2).T
music = music + 0.35 * air
# re-enforce vacuum after reverb tails, and end cleanly
a = int(STOP * SR)
music[a + int(0.02 * SR) : int(8.05 * SR)] *= 0.0
music[a : a + int(0.02 * SR)] *= np.linspace(1, 0, int(0.02 * SR))[:, None]
end = int(35.95 * SR)
music[end:] *= np.linspace(1, 0, N - end)[:, None]
# master: gentle glue + limiter
music = np.tanh(music * 1.2) / 1.2
music *= 0.89 / np.max(np.abs(music))
sf.write("assets/music.wav", music.astype(np.float32), SR, subtype="PCM_24")

# ================================================================== SFX
fx = np.zeros((N, 2))


def s_doc_tick():
    t = t_(0.09)
    paper = bp(rng.standard_normal(len(t)), 1800, 9000) * np.exp(-t * 90) * 0.6
    thump = np.sin(2 * np.pi * (140 + 120 * np.exp(-t * 60)) * t) * np.exp(-t * 45) * 0.7
    return paper + thump


def s_snap():
    t = t_(0.18)
    chirp = np.sin(2 * np.pi * np.cumsum(500 + 1800 * (t / 0.02).clip(0, 1)) / SR) * np.exp(-t * 70) * 0.35
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * 0.5
    low = np.sin(2 * np.pi * 85 * t) * np.exp(-t * 22) * 0.8
    return chirp + click + low


def s_impact():
    t = t_(0.7)
    f = 42 + 70 * np.exp(-t * 14)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    n = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18) * 0.5
    return np.tanh((body + n) * 1.5) * 0.8


def s_pop(f0=620, f1=1150, d=0.09, bright=0.25):
    t = t_(d)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (40 / d * 0.09)) * env_adsr(len(t), 0.002, 0.02, 1, 0.01)
    x += bright * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * np.exp(-t * 80)
    return x * 0.6


def s_whoosh(d=0.45, lo=300, hi=4000, up=True):
    t = t_(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    steps = 24
    seg = len(t) // steps
    for k in range(steps):
        p = k / (steps - 1)
        p = p if up else 1 - p
        fc = lo * (hi / lo) ** p
        sl = slice(k * seg, (k + 1) * seg if k < steps - 1 else len(t))
        out[sl] = bp(n, fc * 0.6, fc * 1.6)[sl]
    e = np.sin(np.pi * (t / d)) ** 1.6
    return out * e * 0.7


def s_click():
    t = t_(0.03)
    return (bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 300) * 0.6 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 400) * 0.3)


def s_chime(base=1318.5):
    return bell([base, base * 1.5], 0.7, 6.0) * 0.4


def s_pulse():
    t = t_(0.32)
    x = np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 110 * t) + 0.18 * np.sin(2 * np.pi * 220 * t)
    return np.tanh(x * 1.3) * np.sin(np.pi * t / 0.32) ** 2 * 0.6


def s_stop():
    t = t_(0.2)
    body = np.sin(2 * np.pi * (60 + 60 * np.exp(-t * 50)) * t) * np.exp(-t * 28)
    n = lp(rng.standard_normal(len(t)), 1400) * np.exp(-t * 60) * 0.5
    x = np.tanh((body + n) * 2.0) * 0.9
    x[-int(0.02 * SR) :] *= np.linspace(1, 0, int(0.02 * SR))
    return x


def s_call():
    a = bell([880.0], 0.16, 14) * 0.5
    b = bell([1318.5], 0.22, 12) * 0.5
    out = np.zeros(int(0.42 * SR))
    out[: len(a)] += a
    o = int(0.16 * SR)
    out[o : o + len(b)] += b
    return out


def s_texture(d=0.7):
    t = t_(d)
    n = bp(rng.standard_normal(len(t)), 300, 2800)
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 7.5 * t + 0.6 * np.sin(2 * np.pi * 2.3 * t))
    return n * am * np.sin(np.pi * t / d) * 0.22


def s_rise(d=1.0, f0=600, f1=1250):
    t = t_(d)
    f = f0 + (f1 - f0) * (t / d) ** 1.4
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_adsr(len(t), 0.2, 0.1, 1, 0.08) * 0.12


def s_sweep(d=0.45):
    return s_whoosh(d, 3500, 11000) * 0.45


def s_lock():
    t = t_(0.2)
    return s_click()[: len(t)].sum() * 0 + (
        hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 250) * 0.5 + np.sin(2 * np.pi * 120 * t) * np.exp(-t * 35) * 0.7
    )


def s_confirm():
    t = t_(0.9)
    x = (np.sin(2 * np.pi * 523.25 * t) + 0.7 * np.sin(2 * np.pi * 783.99 * t) + 0.35 * np.sin(2 * np.pi * 1046.5 * t))
    return x * env_adsr(len(t), 0.015, 0.2, 0.5, 0.6) * np.exp(-t * 2.4) * 0.28


def s_brand():
    x = bell([mtof(77), mtof(81), mtof(84), mtof(89)], 1.6, 2.4) * 0.35
    return x


ev = []
E = lambda t, x, g=1.0, p=0.0: ev.append((t, x, g, p))

# opening
E(0.0, s_whoosh(0.35, 500, 5000), 0.25, 0.0)
E(0.20, s_doc_tick(), 0.6, -0.5)
E(0.28, s_doc_tick(), 0.6, 0.0)
E(0.36, s_doc_tick(), 0.6, 0.5)
E(1.19, s_snap(), 0.6)
E(1.21, s_impact(), 0.38)
E(1.56, s_pop(700, 1400, 0.1, 0.35), 0.7, 0.2)
# doc leaves / RM appears
E(3.28, s_whoosh(0.42, 400, 3500), 0.5, 0.3)
E(3.62, s_whoosh(0.3, 800, 3000, up=False), 0.25, 0.7)
# approach: low tension pulses
for t, g in [(5.45, 0.27), (6.05, 0.32), (6.6, 0.37), (7.05, 0.42), (7.3, 0.47)]:
    E(t, s_pulse(), g)
E(7.62, s_stop(), 0.95)
# redirect
E(8.05, s_whoosh(0.6, 250, 5200), 0.6, -0.2)
E(8.12, s_snap(), 0.45, -0.1)
E(9.28, s_pop(400, 900, 0.12, 0.1), 0.45)
# AI follow-up
E(9.62, s_chime(1567.98), 0.55)  # notification
E(10.2, s_pop(), 0.45, -0.2)
for i, t in enumerate([10.7, 10.82, 10.94]):
    E(t, s_click(), 0.35, -0.2 + 0.2 * i)
E(12.42, s_click(), 0.7)
E(12.6, s_pop(700, 1400, 0.1, 0.35), 0.55, 0.25)
E(13.0, s_pop(), 0.45, -0.25)
E(13.44, s_click(), 0.35)
E(13.62, s_pop(), 0.35, -0.2)
E(13.98, s_click(), 0.7)
E(14.08, s_call(), 0.55)
E(14.3, s_texture(0.75), 0.9)
E(15.32, s_click(), 0.5)
E(15.34, s_chime(2093.0), 0.25)
# pending / answers
E(15.62, s_pop(520, 980, 0.11), 0.45)
E(16.47, s_pop(700, 1400, 0.1, 0.35), 0.5, 0.25)
E(16.88, s_pop(), 0.45, -0.25)
E(17.06, s_click(), 0.3)
# consent
E(17.62, s_pop(480, 900, 0.12), 0.45)
E(18.22, s_click(), 0.8)
E(18.52, s_chime(1318.5), 0.6)
# upload
E(19.1, s_pop(700, 1400, 0.1, 0.35), 0.5, 0.25)
E(19.5, s_snap(), 0.35, 0.2)
for t in (19.5, 19.8, 20.15, 20.45):
    E(t, s_click(), 0.4)
E(19.45, s_rise(1.05), 1.0)
E(20.72, s_click(), 0.7)
E(20.74, s_chime(1567.98), 0.55)
# routing
E(21.32, s_whoosh(0.5, 300, 4000), 0.32, -0.3)
E(21.62, s_whoosh(0.7, 200, 1800), 0.18, 0.2)
E(21.72, s_snap(), 0.35, 0.1)
E(22.33, s_sweep(0.6), 0.42, 0.0)
E(22.93, s_sweep(0.35), 0.32, 0.1)
E(23.3, s_lock(), 0.55)
E(23.62, s_whoosh(0.45, 300, 2600), 0.3, 0.4)
E(24.06, s_snap(), 0.5, 0.4)
E(24.08, s_confirm(), 0.6, 0.3)
for t in (24.27, 24.43, 24.59):
    E(t, s_click(), 0.2, 0.4)
# RM not needed for the file
E(24.95, s_whoosh(0.5, 250, 1500), 0.25)
E(25.47, s_pop(500, 800, 0.08), 0.3, 0.5)
E(25.86, s_lock(), 0.3, 0.4)
# context to RM
for t in (27.27, 27.59, 27.91):
    E(t, s_doc_tick(), 0.45, 0.6)
E(27.88, s_chime(1760.0), 0.4, 0.6)
# RM joins
E(28.3, s_whoosh(0.5, 300, 2500, up=False), 0.3, -0.3)
E(28.74, s_pop(380, 720, 0.12, 0.1), 0.55, -0.2)
E(28.94, s_pop(), 0.4, -0.2)
# system overview
E(29.62, s_whoosh(0.45, 300, 2000), 0.25)
for t in (30.05, 30.15, 30.25):
    E(t, s_click(), 0.15)
# brand
E(30.95, s_brand(), 0.6)
# CTA
E(32.38, s_click(), 0.55)
E(32.38, s_impact()[: int(0.25 * SR)] * np.linspace(1, 0, int(0.25 * SR)), 0.25)
E(33.42, s_pop(600, 900, 0.1, 0.0), 0.2)

for t, x, g, p in ev:
    add(fx, x, t, g, p)
fx = reverb(fx, 0.9, 6000, 0.12, seed=21)
# keep the freeze vacuum honest (stop impact tail only)
a = int(7.84 * SR)
fx[a : int(8.05 * SR)] *= np.linspace(1, 0, int(8.05 * SR) - a)[:, None] ** 3
fx = np.tanh(fx * 1.1) / 1.1
fx *= min(1.0, 0.9 / np.max(np.abs(fx)))
sf.write("assets/sfx.wav", fx.astype(np.float32), SR, subtype="PCM_24")

print("music peak", np.max(np.abs(music)), "sfx peak", np.max(np.abs(fx)))
