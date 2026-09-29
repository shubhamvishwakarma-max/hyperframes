"""Build the upbeat music bed and impact SFX stem for the Piramal × DoubleTick case study.

Everything is synthesised offline (seeded, deterministic) so the render never
depends on a network catalogue. The music is ducked against the envelope of
the supplied voiceover, which stays the master track and is never altered
beyond light cleanup (see README).

    python3 scripts/build_audio.py
"""

import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt, sosfiltfilt

SR = 48000
DUR = 46.0
N = int(SR * DUR)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUD = os.path.join(ROOT, "assets", "audio")
rng = np.random.default_rng(20260929)


def db(x):
    return 10 ** (x / 20)


def t_axis(n):
    return np.arange(n) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sig, t, gain=1.0, pan=0.0):
    """Add a mono (or stereo) signal into a stereo buffer at time t."""
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if sig.ndim == 1:
        l = sig * gain * np.sqrt(0.5 * (1 - pan))
        r = sig * gain * np.sqrt(0.5 * (1 + pan))
        sig = np.stack([l, r], 1) * np.sqrt(2)
    else:
        sig = sig * gain
    n = min(len(sig), len(buf) - i)
    buf[i : i + n] += sig[:n]


def env_adsr(n, a, d, s, r_start=None, r=0.05):
    t = t_axis(n)
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    if r_start is not None:
        e *= np.clip(1 - (t - r_start) / r, 0, 1)
    return e


def reverb_ir(seconds=2.0, predelay=0.012):
    n = int(seconds * SR)
    t = t_axis(n)
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (seconds / 6.5))[:, None]
    ir[:, 0] = lp(ir[:, 0], 6500)
    ir[:, 1] = lp(ir[:, 1], 6500)
    pad = np.zeros((int(predelay * SR), 2))
    ir = np.concatenate([pad, ir])
    return ir / np.sqrt((ir**2).sum() / 2)


IR = reverb_ir()


def verb(x, wet):
    y = np.stack([fftconvolve(x[:, c], IR[:, c])[: len(x)] for c in range(2)], 1)
    return x + y * wet


def loud_rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x**2)) + 1e-12)


# ----------------------------------------------------------------------------
# MUSIC  — 120 BPM, D major, upbeat four-on-the-floor with sidechain pump
# ----------------------------------------------------------------------------
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
G0 = -0.1  # grid origin: puts downbeats on 13.9 (solution drop) and 43.9 (end hit)
CHORDS = [  # I – V – vi – IV
    (38, [62, 66, 69, 74, 76]),  # D(add9)
    (33, [61, 64, 69, 73, 76]),  # A
    (35, [62, 66, 71, 74, 78]),  # Bm
    (31, [62, 67, 71, 74, 79]),  # G
]

# section markers (seconds) — follow the voiceover structure
S_PROBLEM, S_SOLUTION, S_KPI, S_END, S_RESOLVE = 4.9, 13.9, 25.9, 39.9, 43.9


def section_level(t):
    """0..1 energy curve for the arrangement."""
    return np.interp(
        t,
        [0, 4.8, 4.9, 13.8, 13.9, 25.8, 25.9, 39.8, 39.9, 43.9, 46],
        [0.55, 0.6, 0.7, 0.75, 0.9, 0.9, 1.0, 1.0, 0.85, 0.85, 0.7],
    )


def additive(freq, n, harmonics, rolloff, detune_cents=0.0, phase=0.0):
    t = t_axis(n)
    out = np.zeros(n)
    f = freq * 2 ** (detune_cents / 1200)
    for h in range(1, harmonics + 1):
        if f * h > 11000:
            break
        out += np.sin(2 * np.pi * f * h * t + phase * h) / (h**rolloff)
    return out


def chord_at(t):
    return CHORDS[int(np.floor((t - G0) / BAR)) % 4]


def beats(t0, t1, div=1):
    """Grid times from t0 to t1 at BEAT/div resolution."""
    step = BEAT / div
    k = int(np.ceil((t0 - G0) / step - 1e-6))
    out = []
    while G0 + k * step < t1 - 1e-6:
        out.append((G0 + k * step, k))
        k += 1
    return out


drums = np.zeros((N, 2))
tonal = np.zeros((N, 2))  # everything that gets sidechain-pumped
KICKS = []


def kick(level):
    nn = int(0.4 * SR)
    tt = t_axis(nn)
    f = 46 + 130 * np.exp(-tt / 0.028)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.tanh(1.6 * np.sin(ph)) * np.exp(-tt / 0.2)
    click = hp(rng.standard_normal(nn), 3000) * np.exp(-tt / 0.003) * 0.35
    return (body + click) * level


def clap(level):
    nn = int(0.35 * SR)
    tt = t_axis(nn)
    x = bp(rng.standard_normal(nn), 900, 5200)
    e = np.zeros(nn)
    for d in (0.0, 0.011, 0.022):
        e += np.where(tt >= d, np.exp(-(tt - d) / (0.012 if d < 0.02 else 0.11)), 0)
    return x * e * level


def hat(level, decay=0.03):
    nn = int(0.25 * SR)
    x = hp(rng.standard_normal(nn), 7500, 4)
    return x * np.exp(-t_axis(nn) / decay) * level


def snare(level):
    nn = int(0.3 * SR)
    tt = t_axis(nn)
    tone = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.05)
    x = bp(rng.standard_normal(nn), 1200, 7000) * np.exp(-tt / 0.09)
    return (0.6 * tone + x) * level


def crash(level, length=2.2):
    nn = int(length * SR)
    tt = t_axis(nn)
    x = hp(rng.standard_normal(nn), 5000, 2)
    return x * np.exp(-tt / (length / 4)) * level


# --- kick: four-on-the-floor (soft intro, full from the problem section)
for t, k in beats(0.35, S_RESOLVE):
    lvl = 0.55 if t < S_PROBLEM else (0.75 if t < S_SOLUTION else 0.9)
    place(drums, kick(lvl * 0.34), t)
    KICKS.append(t)
# --- claps on 2 & 4
for t, k in beats(S_PROBLEM, S_RESOLVE):
    if k % 2 == 1:
        place(drums, clap(0.10 if t < S_SOLUTION else 0.15), t, pan=-0.05)
# --- hats: offbeat 8ths throughout, 16ths from the solution drop, open hats in KPIs
for t, k in beats(0.35, S_RESOLVE, 4):
    sub = k % 4
    if sub == 2:
        place(drums, hat(0.07 if t < S_KPI else 0.075, 0.05 if t >= S_KPI else 0.03), t, pan=0.3)
    elif t >= S_SOLUTION and sub in (1, 3):
        place(drums, hat(0.028), t, pan=0.35)
    if t >= S_KPI and sub == 2:
        place(drums, hat(0.03, 0.16), t, pan=-0.3)  # open hat
# --- shaker 16ths in KPIs
for t, k in beats(S_KPI, S_END, 4):
    nn = int(0.06 * SR)
    x = bp(rng.standard_normal(nn), 5000, 11000) * np.exp(-t_axis(nn) / 0.02)
    place(drums, x * (0.04 if k % 2 else 0.022), t, pan=-0.45)
# --- snare-roll builds into each drop
for drop in (S_SOLUTION, S_KPI):
    t = drop - BAR
    for i, (tt_, k) in enumerate(beats(drop - BAR, drop, 4)):
        u = i / 16
        place(drums, snare(0.03 + 0.09 * u**1.5), tt_, pan=0.1)
# --- crashes on the drops + end hit
for t, lvl in ((S_SOLUTION, 0.06), (S_KPI, 0.07), (S_RESOLVE, 0.07)):
    place(drums, crash(lvl), t, pan=0.2)
    place(drums, crash(lvl, 1.8), t + 0.004, pan=-0.2)

# --- bass: offbeat 8ths (the "and"), rolling in the KPIs
for t, k in beats(S_PROBLEM - BAR / 2, S_RESOLVE, 4):
    sub = k % 4
    in_kpi = t >= S_KPI
    if not (sub == 2 or (in_kpi and sub == 3) or (t >= S_SOLUTION and sub == 1 and k % 8 == 5)):
        continue
    bass, _ = chord_at(t)
    nn = int(0.24 * SR)
    tt = t_axis(nn)
    f = mtof(bass)
    b = additive(f, nn, 7, 1.5) + 0.5 * np.sin(2 * np.pi * f / 2 * tt)
    b = np.tanh(1.4 * b)
    e = np.clip(tt / 0.004, 0, 1) * np.exp(-tt / 0.16)
    place(tonal, b * e * (0.11 if in_kpi else 0.09) * (1.0 if t >= S_SOLUTION else 0.75), t)

# --- chord stabs on the offbeat (from the solution drop), bright + short
for t, k in beats(S_SOLUTION, S_RESOLVE, 2):
    if k % 2 == 0:
        continue
    _, voicing = chord_at(t)
    nn = int(0.3 * SR)
    tt = t_axis(nn)
    st = np.zeros((nn, 2))
    for j, m in enumerate(voicing[:4]):
        for side, det in ((0, -9), (1, 9)):
            st[:, side] += additive(mtof(m), nn, 9, 1.1, det, phase=j)
    e = np.clip(tt / 0.003, 0, 1) * np.exp(-tt / 0.09)
    place(tonal, st * e[:, None] * 0.028 * section_level(t), t)

# --- pluck hook: 16th-note arpeggio across the whole piece (the upbeat motor)
pattern = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 3, 1, 4, 2, 3]
for t, k in beats(0.35, S_RESOLVE, 4):
    _, voicing = chord_at(t)
    m = voicing[pattern[k % 16]] + (12 if k % 16 in (6, 14) else 0)
    nn = int(0.3 * SR)
    tt = t_axis(nn)
    pl = additive(mtof(m), nn, 5, 1.6) * np.exp(-tt / 0.07) * np.clip(tt / 0.002, 0, 1)
    acc = 1.0 if k % 4 == 0 else 0.7
    place(tonal, pl * 0.03 * acc * section_level(t), t, pan=0.4 if k % 2 else -0.4)

# --- pad: sustained chords underneath, brightens with the arc
for b in range(int(DUR / BAR) + 2):
    t0 = G0 + b * BAR
    if t0 >= S_RESOLVE:
        break
    _, voicing = CHORDS[b % 4]
    L = BAR + 0.3
    n = int(L * SR)
    e = np.clip(t_axis(n) / 0.15, 0, 1) * np.clip((L - t_axis(n)) / 0.3, 0, 1)
    ch = np.zeros((n, 2))
    for j, m in enumerate(voicing):
        for side, det in ((0, -7), (1, 7)):
            ch[:, side] += additive(mtof(m - 12), n, 6, 1.3, det, phase=j + side)
    place(tonal, ch * e[:, None] * 0.018 * section_level(max(t0, 0)), max(t0, 0))

# --- final resolve: big D chord + bells, rings out to the end
n = int((DUR - S_RESOLVE) * SR)
res = np.zeros((n, 2))
for j, m in enumerate([38, 50, 57, 62, 66, 69, 74]):
    for side, det in ((0, -6), (1, 6)):
        res[:, side] += additive(mtof(m), n, 7, 1.3, det, phase=j)
res *= (np.clip(t_axis(n) / 0.01, 0, 1) * np.exp(-t_axis(n) / 1.4))[:, None] * 0.05
place(drums, res, S_RESOLVE)
for j, m in enumerate([74, 78, 81, 86]):
    nb = int(2.0 * SR)
    tb = t_axis(nb)
    bell = np.sin(2 * np.pi * mtof(m) * tb) * np.exp(-tb / 0.7)
    place(drums, bell * 0.035, S_RESOLVE + j * 0.06, pan=-0.3 + j * 0.2)

# --- sidechain pump from the kick onto the tonal bus
pump = np.ones(N)
tt_all = t_axis(N)
for kt in KICKS:
    i0 = int(kt * SR)
    seg = min(int(0.45 * SR), N - i0)
    if seg <= 0:
        continue
    u = t_axis(seg)
    pump[i0 : i0 + seg] = np.minimum(pump[i0 : i0 + seg], 1 - 0.62 * np.exp(-u / 0.11))
tonal *= pump[:, None]


# --- noise risers into the drops
def swell(length, lo, hi, level):
    nn = int(length * SR)
    tt = t_axis(nn)
    x = bp(rng.standard_normal(nn), lo, hi)
    return x * (tt / length) ** 2.4 * level


place(drums, swell(BAR, 1500, 9000, 0.08), S_SOLUTION - BAR)
place(drums, swell(BAR, 1500, 9000, 0.09), S_KPI - BAR)

music = verb(tonal, 0.2) + verb(drums, 0.06)
for c in range(2):
    music[:, c] = hp(music[:, c], 32)
    # presence carve so the narrator's consonants stay on top
    music[:, c] -= 0.4 * sosfiltfilt(butter(2, [1500, 4000], "band", fs=SR, output="sos"), music[:, c])

# ----------------------------------------------------------------------------
# Ducking against the voiceover envelope
# ----------------------------------------------------------------------------
sr_vo, vo = wavfile.read(os.path.join(AUD, "voiceover.wav"))
assert sr_vo == SR
vo = vo.astype(np.float64) / 32768.0
vo_m = vo.mean(1) if vo.ndim == 2 else vo
vo_full = np.zeros(N)
vo_full[: min(N, len(vo_m))] = vo_m[:N]
win = int(0.02 * SR)
rms = np.sqrt(np.convolve(vo_full**2, np.ones(win) / win, mode="same"))
active = (20 * np.log10(rms + 1e-9) > -42).astype(float)
# attack 60 ms / release 450 ms smoothing
g = np.zeros(N)
a_c = np.exp(-1 / (0.06 * SR))
r_c = np.exp(-1 / (0.45 * SR))
prev = 0.0
for i in range(0, N, 48):  # 1 ms resolution
    x = active[i]
    c = a_c if x > prev else r_c
    prev = c**48 * prev + (1 - c**48) * x
    g[i : i + 48] = prev
duck_db = -6.5 * g
# extra space under the solution line and each KPI phrase
for a, b in [(13.9, 16.95), (27.7, 31.0), (31.15, 35.2), (35.4, 39.0)]:
    ramp = np.clip(np.minimum((t_axis(N) - a) / 0.25, (b - t_axis(N)) / 0.3), 0, 1)
    duck_db += -2.5 * ramp
music *= db(duck_db)[:, None]

# overall music level: sits well under the narrator
music *= db(-28 - loud_rms_db(music[: int(43 * SR)]))
fade = np.clip((DUR - t_axis(N)) / 1.2, 0, 1)
fade *= np.clip(t_axis(N) / 0.4, 0, 1)
music *= fade[:, None]

# ----------------------------------------------------------------------------
# SFX
# ----------------------------------------------------------------------------
sfx = np.zeros((N, 2))


def s_tick(f=2800, decay=0.004, n_s=0.03):
    nn = int(n_s * SR)
    tt = t_axis(nn)
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt / decay)


def s_tap():
    nn = int(0.06 * SR)
    tt = t_axis(nn)
    x = bp(rng.standard_normal(nn), 1500, 6000) * np.exp(-tt / 0.006)
    return x + 0.6 * np.sin(2 * np.pi * 900 * tt) * np.exp(-tt / 0.012)


def s_blip(f1, f2=None, length=0.09):
    nn = int(length * SR)
    tt = t_axis(nn)
    f = np.full(nn, f1) if f2 is None else np.linspace(f1, f2, nn)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.clip(tt / 0.004, 0, 1) * np.exp(-tt / (length / 3))


def s_thump(level_tone=0.6, f0=62):
    nn = int(0.9 * SR)
    tt = t_axis(nn)
    f = f0 + 70 * np.exp(-tt / 0.02)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt / 0.28)
    click = hp(rng.standard_normal(nn), 2500) * np.exp(-tt / 0.004) * 0.25
    return body + click


def s_kpi_hit(root=62):
    """Sub thump + soft tonal layer (a D-major dyad) — premium, not cinematic."""
    x = s_thump()
    nn = len(x)
    tt = t_axis(nn)
    tone = sum(np.sin(2 * np.pi * mtof(m) * tt) for m in (root, root + 7, root + 12)) / 3
    tone *= np.clip(tt / 0.006, 0, 1) * np.exp(-tt / 0.45)
    return x * 0.9 + tone * 0.35


def s_whoosh(length=0.55, lo=400, hi=5000, rev=False):
    nn = int(length * SR)
    tt = t_axis(nn)
    x = rng.standard_normal(nn)
    # moving band via two filters blended over time
    a = bp(x, lo, lo * 3)
    b = bp(x, hi / 3, hi)
    mix = tt / length
    y = a * (1 - mix) + b * mix
    e = np.sin(np.pi * np.clip(tt / length, 0, 1)) ** 1.6
    y = y * e
    return y[::-1] if rev else y


def s_chime(notes, spacing=0.07, decay=0.7):
    total = int((len(notes) * spacing + decay * 4) * SR)
    out = np.zeros(total)
    for k, m in enumerate(notes):
        i = int(k * spacing * SR)
        tt = t_axis(total - i)
        f = mtof(m)
        tone = np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt / 0.08)
        out[i:] += tone * np.clip(tt / 0.003, 0, 1) * np.exp(-tt / decay)
    return out / len(notes) ** 0.5


def s_ring():
    """Soft outbound ring: two short dual-tone pulses."""
    nn = int(0.9 * SR)
    tt = t_axis(nn)
    tone = (np.sin(2 * np.pi * 400 * tt) + np.sin(2 * np.pi * 450 * tt)) * 0.5
    gate = ((tt < 0.32) | ((tt > 0.48) & (tt < 0.8))).astype(float)
    gate = lp(gate, 60)
    return lp(tone * gate, 2500)


def s_odometer(t0, t1, n=26):
    """Decelerating ticks while a number rolls."""
    for k in range(n):
        u = k / (n - 1)
        t = t0 + (t1 - t0) * (1 - (1 - u) ** 2.2)
        place(sfx, s_tick(3200 + (k % 3) * 300, 0.0025), t, db(-34 + 6 * u), pan=0.2 * np.sin(k))


def s_shimmer():
    nn = int(1.4 * SR)
    tt = t_axis(nn)
    out = np.zeros(nn)
    for k, m in enumerate([86, 90, 93, 97, 98, 102]):
        i = int(k * 0.045 * SR)
        t2 = t_axis(nn - i)
        out[i:] += np.sin(2 * np.pi * mtof(m) * t2) * np.exp(-t2 / 0.35)
    return out / 3


def s_impact(size=1.0, root=None):
    """Layered hit: sub boom + punch body + transient crack + low tail (+ optional tonal chord)."""
    L = 0.6 + 1.4 * size
    nn = int(L * SR)
    tt = t_axis(nn)
    f = 40 + 120 * np.exp(-tt / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.tanh(1.8 * np.sin(ph)) * np.exp(-tt / (0.22 + 0.35 * size))
    body = lp(rng.standard_normal(nn), 520, 2) * np.exp(-tt / 0.07) * 2.2
    crack = hp(rng.standard_normal(nn), 2500, 2) * np.exp(-tt / 0.012) * 0.55
    tail = bp(rng.standard_normal(nn), 150, 1800) * np.exp(-tt / (0.25 + 0.5 * size)) * 0.35 * size
    out = sub + body + crack + tail
    if root is not None:
        tone = sum(np.sin(2 * np.pi * mtof(m) * tt) for m in (root, root + 7, root + 12, root + 16)) / 4
        out += tone * np.clip(tt / 0.004, 0, 1) * np.exp(-tt / (0.35 + 0.3 * size)) * 0.55
    return out / np.max(np.abs(out))


def s_riser(length=1.2):
    """Noise sweep + rising tone, cut dead on the hit."""
    nn = int(length * SR)
    tt = t_axis(nn)
    u = tt / length
    x = rng.standard_normal(nn)
    lo_b = bp(x, 600, 2500)
    hi_b = bp(x, 3000, 10000)
    noise = lo_b * (1 - u) + hi_b * u
    f = 220 * 2 ** (2 * u**1.3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    out = (noise + tone) * u**2.6
    out[-int(0.004 * SR):] *= np.linspace(1, 0, int(0.004 * SR))
    return out / np.max(np.abs(out))


def s_suck(length=0.5):
    """Reverse-cymbal pull into a hit."""
    return s_riser(length) * 0.0 + s_whoosh(length, 2000, 9000)[::-1] * np.linspace(0.2, 1, int(length * SR)) ** 2


EVENTS = []


def ev(t, sig, gain_db, pan=0.0, name=""):
    EVENTS.append({"t": round(t, 3), "db": gain_db, "name": name})
    place(sfx, sig, t, db(gain_db), pan)


def hit(t, size, gain_db, root=None, riser=None, name="hit"):
    if riser:
        ev(t - riser, s_riser(riser), gain_db - 11, 0, name + "-riser")
    ev(t, s_impact(size, root), gain_db, 0, name)


# SCENE 1 — hook: land the brand + story fast
hit(0.04, 0.6, -15, 62, name="open")
for k in range(22):  # cards keep multiplying outward (0.1 – 1.3 s)
    ev(0.12 + k * 0.056, s_tick(2400 + (k % 4) * 350, 0.003), -29 + (k % 3), (k % 5 - 2) * 0.2, "cards-scale")
for k, t in enumerate((0.2, 0.46, 0.8, 1.15)):
    ev(t, s_tap(), -25, (-0.4, 0.3, -0.2, 0.4)[k], "card")
hit(2.45, 0.8, -13, 57, riser=0.6, name="bottleneck")
ev(4.3, s_whoosh(0.7, 300, 6000), -19, 0.2, "to-problem")

# SCENE 2 — problem
hit(4.95, 0.35, -18, name="sort")
for k in range(8):
    ev(4.97 + k * 0.045, s_tap(), -25, (k % 4 - 1.5) * 0.3, "sort-tap")
for t in (6.9, 7.69, 8.69, 10.12):
    ev(t, s_tap(), -23, 0, "header")
ev(5.75, s_tap(), -22, 0.5, "agent")
ev(6.35, s_ring(), -25, 0.4, "manual-ring")
ev(8.2, s_ring(), -27, 0.4, "manual-ring")
ev(10.3, s_ring(), -28, 0.4, "manual-ring")
for t in (7.75, 9.85):
    ev(t, s_blip(880, 1320, 0.1), -23, 0.3, "done")
for t in (7.0, 7.35, 7.9, 8.3, 10.35, 10.6, 10.85, 11.1):
    ev(t, s_tap(), -24, 0.1, "arrival")
for k, t in enumerate([8.7, 9.1, 9.45, 9.75, 10.1, 11.0, 11.3, 11.55, 12.0, 12.2, 12.4, 12.6]):
    ev(t, s_blip(620, 540, 0.08), -26 + min(k, 6) * 0.6, (k % 4 - 1.5) * 0.3, "pending-pulse")
hit(11.62, 0.8, -13, 50, riser=0.7, name="couldnt-scale")
ev(12.95, s_whoosh(0.8, 250, 7000), -18, 0, "push-in")
hit(13.9, 0.7, -14, name="panel-drop")

# SCENE 3 — AI Voice reveal
for k in range(4):
    ev(14.0 + k * 0.08, s_tap(), -27, 0.2, "rows")
hit(15.15, 1.0, -11, 62, riser=0.75, name="ai-voice")
ev(15.15, s_chime([62, 69, 74, 78, 81], 0.05, 0.9), -17, 0, "activation")

# SCENE 4 — outreach
ev(17.2, s_whoosh(0.8, 200, 5000), -20, 0, "push")
ev(17.55, s_ring(), -25, -0.3, "outbound")
hit(18.46, 0.35, -17, 69, name="connect")
ev(18.46, s_blip(760, 1140, 0.09), -20, 0, "connect-blip")
ev(18.56, s_blip(1140, 1520, 0.09), -22, 0, "connect-blip-2")
ev(18.78, s_whoosh(0.55, 400, 7000), -21, 0, "morph")
for k, t in enumerate((20.3, 20.72, 21.14)):
    hit(t, 0.2, -19, name="chip")
    ev(t + 0.01, s_blip(1300 + k * 180, None, 0.06), -24, (-0.4, 0, 0.4)[k], "chip-tone")

# SCENE 5 — handoff
ev(22.2, s_whoosh(0.55, 300, 6000, rev=True), -21, 0, "collapse")
hit(23.55, 0.3, -18, 57, name="needs-rm")
ev(24.25, s_whoosh(0.6, 500, 8000), -17, 0.3, "route")
hit(25.02, 0.7, -13, 69, name="assigned")
ev(25.02, s_chime([69, 74, 78], 0.05, 0.5), -19, 0.2, "assigned-chime")

# KPIs — the three biggest hits of the film
ev(25.35, s_suck(0.5), -19, 0, "to-kpi")
hit(25.85, 0.5, -16, name="kpi-open")
s_odometer(27.84, 29.55, 30)
hit(29.62, 1.2, -9, 62, riser=1.2, name="kpi-1")
ev(31.05, s_whoosh(0.5, 400, 7000), -20, 0, "roll")
s_odometer(31.2, 32.95, 22)
hit(32.98, 1.0, -10, 66, riser=0.9, name="kpi-2")
ev(34.45, s_blip(990, 1480, 0.1), -21, 0, "completed")
ev(35.25, s_whoosh(0.5, 400, 7000), -20, 0, "roll")
s_odometer(35.4, 36.8, 20)
hit(36.9, 1.2, -9, 69, riser=1.0, name="kpi-3")
ev(36.95, s_shimmer(), -19, 0.2, "shimmer")

# SCENE 9 — transformation + brand resolve
ev(38.85, s_whoosh(0.8, 200, 5000, rev=True), -20, 0, "out-kpi")
hit(40.62, 0.8, -13, 62, riser=0.6, name="pulse")
ev(40.62, s_chime([74, 81, 86], 0.05, 0.6), -20, 0, "pulse-chime")
for k in range(4):
    ev(40.98 + k * 0.13, s_tap(), -24, 0.4, "organize")
ev(43.2, s_whoosh(0.7, 200, 5000), -21, 0, "to-end")
hit(43.9, 1.3, -9, 62, riser=0.6, name="brand-resolve")
ev(43.92, s_chime([62, 69, 74, 78, 81], 0.08, 1.2), -16, 0, "brand-chime")

sfx[:, 0] = hp(sfx[:, 0], 30)
sfx[:, 1] = hp(sfx[:, 1], 30)
sfx = verb(sfx, 0.1)


# ----------------------------------------------------------------------------
# Peak safety: the composition plays every stem at MASTER gain. Where
# voice + music + sfx would exceed the ceiling, pull music and sfx down
# (never the voiceover) with a short look-ahead limiter.
# ----------------------------------------------------------------------------
MASTER = 1.23  # data-volume on all three <audio> elements in index.html
CEIL = db(-1.8)
vo_st = np.zeros((N, 2))
vo_st[: min(N, len(vo))] = (vo if vo.ndim == 2 else np.stack([vo, vo], 1))[:N]
bed = music + sfx
room = np.clip(CEIL / MASTER - np.abs(vo_st), 0.0, None)
need = np.min(np.where(np.abs(bed) > 1e-6, room / np.maximum(np.abs(bed), 1e-6), 1.0), axis=1)
need = np.clip(need, 0.0, 1.0)
look = int(0.004 * SR)
from scipy.ndimage import minimum_filter1d

need = minimum_filter1d(need, size=2 * look + 1)
gain = np.empty(N)
prev = 1.0
rel = np.exp(-1 / (0.08 * SR))
for i in range(N):
    x = need[i]
    prev = x if x < prev else rel * prev + (1 - rel) * x
    gain[i] = prev
music *= gain[:, None]
sfx *= gain[:, None]
print(f"bed limiter: max reduction {20*np.log10(gain.min()):.1f} dB")


def write(name, x):
    peak = np.max(np.abs(x))
    if peak > 0.97:
        x = x * (0.97 / peak)
    wavfile.write(os.path.join(AUD, name), SR, (x * 32767).astype(np.int16))
    print(f"{name}: rms {loud_rms_db(x):.1f} dBFS, peak {20*np.log10(np.max(np.abs(x))+1e-12):.1f} dBFS")


write("music.wav", music)
write("sfx.wav", sfx)
with open(os.path.join(AUD, "sfx-cues.json"), "w") as f:
    json.dump(EVENTS, f, indent=1)
