"""Build the music bed and SFX stem for the Piramal × DoubleTick case study.

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
# MUSIC  — 100 BPM, D major, restrained electronic pulse
# ----------------------------------------------------------------------------
BPM = 100
BEAT = 60 / BPM
BAR = BEAT * 4
CHORDS = [  # (bass midi, voicing)
    (38, [50, 57, 61, 64, 66]),  # Dmaj9
    (35, [47, 54, 57, 61, 62]),  # Bm9
    (31, [43, 50, 54, 57, 59]),  # Gmaj9
    (33, [45, 52, 54, 59, 61]),  # A6/9
]

# section markers (seconds) — follow the voiceover structure
S_PROBLEM, S_SOLUTION, S_KPI, S_END, S_RESOLVE = 4.9, 13.9, 25.8, 39.0, 43.2


def section_level(t):
    """0..1 energy curve for the arrangement."""
    return np.interp(
        t,
        [0, 4.9, 13.3, 13.9, 25.2, 25.8, 38.8, 39.4, 43.0, 46],
        [0.35, 0.45, 0.55, 0.75, 0.8, 1.0, 1.0, 0.6, 0.55, 0.5],
    )


def additive(freq, n, harmonics, rolloff, detune_cents=0.0, phase=0.0):
    t = t_axis(n)
    out = np.zeros(n)
    f = freq * 2 ** (detune_cents / 1200)
    for h in range(1, harmonics + 1):
        if f * h > 9000:
            break
        out += np.sin(2 * np.pi * f * h * t + phase * h) / (h**rolloff)
    return out


music = np.zeros((N, 2))
pad = np.zeros((N, 2))

# --- pad: one chord per bar, long crossfades, brightness follows the arc
bars = int(np.ceil(DUR / BAR)) + 1
for b in range(bars):
    t0 = b * BAR - 0.35
    if t0 > S_RESOLVE - 0.2:
        break
    bass, voicing = CHORDS[b % 4]
    L = BAR + 0.9
    n = int(L * SR)
    bright = section_level(max(t0, 0))
    harm = int(4 + 6 * bright)
    e = np.clip(t_axis(n) / 0.7, 0, 1) * np.clip((L - t_axis(n)) / 0.8, 0, 1)
    chord = np.zeros((n, 2))
    for k, m in enumerate(voicing):
        for side, det in ((0, -6), (1, 6)):
            chord[:, side] += additive(mtof(m), n, harm, 1.25, det, phase=k * 0.7 + side)
    chord *= e[:, None] * 0.05
    place(pad, chord, max(t0, 0), 1.0)

# --- final resolve chord (Dmaj9 up an octave-ish) + bells
n = int((DUR - S_RESOLVE) * SR)
res = np.zeros((n, 2))
for k, m in enumerate([50, 57, 61, 64, 66, 69]):
    for side, det in ((0, -5), (1, 5)):
        res[:, side] += additive(mtof(m), n, 6, 1.4, det, phase=k)
res *= (np.clip(t_axis(n) / 0.25, 0, 1) * np.exp(-t_axis(n) / 2.6))[:, None] * 0.06
place(pad, res, S_RESOLVE)
# keep the pad out of the narrator's fundamental range
for c in range(2):
    pad[:, c] = sosfiltfilt(butter(2, 110, "high", fs=SR, output="sos"), pad[:, c])
music += pad
for k, m in enumerate([74, 78, 81, 85]):
    nb = int(2.8 * SR)
    tb = t_axis(nb)
    bell = (np.sin(2 * np.pi * mtof(m) * tb) + 0.25 * np.sin(2 * np.pi * mtof(m) * 2.76 * tb) * np.exp(-tb / 0.25)) * np.exp(-tb / 0.9)
    place(music, bell * 0.05, S_RESOLVE + 0.02 + k * 0.09, pan=-0.4 + k * 0.27)

# --- arpeggio pluck (from problem section), 8ths
step = BEAT / 2
t = S_PROBLEM
i = 0
pattern = [0, 2, 4, 1, 3, 2, 4, 3]
while t < S_END + 1.2:
    bar_idx = int(t // BAR)
    _, voicing = CHORDS[bar_idx % 4]
    m = voicing[pattern[i % 8]] + 12
    nn = int(0.45 * SR)
    tt = t_axis(nn)
    lvl = section_level(t)
    pl = (np.sin(2 * np.pi * mtof(m) * tt) + 0.35 * np.sin(2 * np.pi * mtof(m) * 2 * tt) * np.exp(-tt / 0.05)) * np.exp(-tt / (0.12 + 0.08 * lvl))
    fade = 1.0 if t < S_END else max(0, 1 - (t - S_END) / 1.2)
    place(music, pl * 0.035 * (0.4 + 0.6 * lvl) * fade, t, pan=0.35 if i % 2 else -0.35)
    t += step
    i += 1

# --- data ticks (hook + problem): tiny high blips on 16ths, very quiet
t = 0.6
k = 0
while t < S_SOLUTION:
    if k % 4 != 0:
        nn = int(0.012 * SR)
        tt = t_axis(nn)
        f = 3400 if k % 2 else 2600
        place(music, np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.003) * 0.02, t, pan=0.5 if k % 3 else -0.5)
    t += BEAT / 4
    k += 1


# --- kick
def kick(level):
    nn = int(0.35 * SR)
    tt = t_axis(nn)
    f = 48 + 90 * np.exp(-tt / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt / 0.16) * level


def hat(level, decay=0.028):
    nn = int(0.08 * SR)
    x = hp(rng.standard_normal(nn), 7000, 4)
    return x * np.exp(-t_axis(nn) / decay) * level


beat_i = 0
t = S_SOLUTION
while t < S_END:
    in_kpi = t >= S_KPI - 0.05
    bpos = beat_i % 4
    if in_kpi or bpos in (0, 2):
        place(music, kick(0.22 if in_kpi else 0.16), t)
    # hats
    for sub in range(4 if in_kpi else 2):
        th = t + sub * (BEAT / (4 if in_kpi else 2))
        lvl = 0.03 if sub % 2 else 0.018
        if not in_kpi:
            lvl = 0.02 if sub == 1 else 0.0
        if lvl:
            place(music, hat(lvl), th, pan=0.25)
    # soft clap on 2 & 4 in KPI
    if in_kpi and bpos in (1, 3):
        nn = int(0.2 * SR)
        x = bp(rng.standard_normal(nn), 900, 3500) * np.exp(-t_axis(nn) / 0.05)
        place(music, x * 0.05, t, pan=-0.1)
    t += BEAT
    beat_i += 1

# --- bass: pulsing root on 8ths from solution, sidechain-shaped
t = S_SOLUTION
while t < S_END:
    bar_idx = int(t // BAR)
    bass, _ = CHORDS[bar_idx % 4]
    nn = int(BEAT / 2 * SR)
    tt = t_axis(nn)
    f = mtof(bass + 12)
    b = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    e = (1 - np.exp(-tt / 0.03)) * np.exp(-tt / 0.22)
    lvl = 0.07 if t >= S_KPI else 0.05
    place(music, b * e * lvl, t)
    t += BEAT / 2


# --- swells into sections
def swell(length, lo, hi, level):
    nn = int(length * SR)
    tt = t_axis(nn)
    x = rng.standard_normal(nn)
    x = bp(x, lo, hi)
    e = (tt / length) ** 2.2
    return x * e * level


place(music, swell(0.9, 800, 6000, 0.05), S_SOLUTION - 0.9)
place(music, swell(0.8, 900, 7000, 0.06), S_KPI - 0.8)

# reverb glue, gentle low cut
music = verb(music, 0.22)
for c in range(2):
    music[:, c] = hp(music[:, c], 45)
    # gentle presence carve so consonants of the voice stay clear
    music[:, c] -= 0.35 * sosfiltfilt(butter(2, [1500, 4000], "band", fs=SR, output="sos"), music[:, c])

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
duck_db = -7.5 * g
# extra space under the solution line and each KPI phrase
for a, b in [(13.9, 16.95), (27.7, 31.0), (31.15, 35.2), (35.4, 39.0)]:
    ramp = np.clip(np.minimum((t_axis(N) - a) / 0.25, (b - t_axis(N)) / 0.3), 0, 1)
    duck_db += -2.5 * ramp
music *= db(duck_db)[:, None]

# overall music level: sits well under the narrator
music *= db(-31 - loud_rms_db(music[: int(43 * SR)]))
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


EVENTS = []


def ev(t, sig, gain_db, pan=0.0, name=""):
    EVENTS.append({"t": round(t, 3), "db": gain_db, "name": name})
    place(sfx, sig, t, db(gain_db), pan)


# SCENE 1 — hook
ev(0.12, s_tick(1800, 0.006), -30, 0, "logo")
card_times = [0.55 + i * 0.1 for i in range(5)] + [1.2 + i * 0.06 for i in range(7)]
for k, t in enumerate(card_times):
    ev(t + 0.02, s_tap(), -27 - (k > 4) * 3, (-0.5 + (k * 0.37) % 1.0), "card")
for k in range(18):
    ev(1.62 + k * 0.045, s_tick(2400 + (k % 4) * 350, 0.003), -36 + (k % 3), (k % 5 - 2) * 0.2, "cards-scale")
ev(1.45, s_whoosh(0.5, 300, 2500), -30, 0, "headline")
ev(2.45, s_thump(f0=55), -17, 0, "headline-land")
ev(4.35, s_whoosh(0.7, 300, 4500), -26, 0.2, "to-problem")

# SCENE 2 — problem
for k in range(8):
    ev(4.97 + k * 0.045, s_tap(), -30, (k % 4 - 1.5) * 0.3, "sort")
for t in (6.9, 7.69, 8.69, 10.12):
    ev(t, s_tick(1500, 0.01, 0.05), -29, 0, "header")
ev(5.75, s_tap(), -28, 0.5, "agent")
ev(6.35, s_ring(), -28, 0.4, "manual-ring")
ev(8.2, s_ring(), -30, 0.4, "manual-ring")
ev(10.3, s_ring(), -31, 0.4, "manual-ring")
for t in (7.75, 9.85):
    ev(t, s_blip(880, 1320, 0.1), -28, 0.3, "done")
for t in (7.0, 7.35, 7.9, 8.3, 10.35, 10.6, 10.85, 11.1):
    ev(t, s_tap(), -30, 0.1, "arrival")
for k, t in enumerate([8.7, 9.1, 9.45, 9.75, 10.1, 11.0, 11.3, 11.55, 12.0, 12.2, 12.4, 12.6]):
    ev(t, s_blip(620, 560, 0.08), -32 + min(k, 6) * 0.5, (k % 4 - 1.5) * 0.3, "pending-pulse")
ev(11.62, s_thump(f0=50), -20, 0, "couldnt-scale")
ev(12.95, s_whoosh(0.85, 250, 5000), -24, 0, "push-in")
ev(14.02, s_tap(), -26, 0, "row-lock")

# SCENE 3 — AI Voice
for k in range(4):
    ev(14.0 + k * 0.08, s_tick(2600, 0.003), -33, 0.2, "rows")
ev(15.15, s_chime([62, 69, 74, 78], 0.06, 0.9), -19, 0, "activation")
ev(15.15, s_thump(f0=58), -24, 0, "activation-body")

# SCENE 4 — outreach
ev(17.2, s_whoosh(0.9, 200, 3000), -28, 0, "push")
ev(17.55, s_ring(), -29, -0.3, "outbound")
ev(18.46, s_blip(760, 1140, 0.09), -24, 0, "connect")
ev(18.56, s_blip(1140, 1520, 0.09), -26, 0, "connect-2")
ev(18.8, s_whoosh(0.6, 400, 5000), -29, 0, "morph")
ev(19.35, s_chime([74, 81], 0.05, 0.4), -31, 0.1, "wave-on")
for k, t in enumerate((20.3, 20.72, 21.14)):
    ev(t, s_tap(), -24, (-0.4, 0, 0.4)[k], "chip")
    ev(t + 0.01, s_blip(1300 + k * 150, None, 0.05), -31, (-0.4, 0, 0.4)[k], "chip-tone")

# SCENE 5 — handoff
ev(22.25, s_whoosh(0.6, 300, 4500, rev=True), -28, 0, "collapse")
ev(23.55, s_blip(700, 520, 0.12), -26, -0.3, "needs-rm")
ev(24.3, s_whoosh(0.65, 500, 6000), -22, 0.3, "route")
ev(25.02, s_chime([69, 74, 78], 0.05, 0.5), -21, 0.2, "assigned")
ev(25.02, s_tap(), -24, 0.2, "assigned-click")

# SCENE 6-8 — KPIs
ev(25.55, s_whoosh(0.7, 200, 3500, rev=True), -24, 0, "to-kpi")
s_odometer(27.84, 29.55, 30)
ev(29.62, s_kpi_hit(62), -12, 0, "kpi-1")
ev(31.1, s_whoosh(0.5, 400, 5000), -28, 0, "roll")
s_odometer(31.2, 32.95, 22)
ev(32.98, s_kpi_hit(66), -15, 0, "kpi-2")
ev(34.45, s_blip(990, 1480, 0.1), -26, 0, "completed")
ev(35.3, s_whoosh(0.5, 400, 5000), -28, 0, "roll")
s_odometer(35.4, 36.8, 20)
ev(36.9, s_kpi_hit(69), -13, 0, "kpi-3")
ev(36.95, s_shimmer(), -24, 0.2, "shimmer")

# SCENE 9 — transformation + resolve
ev(38.9, s_whoosh(0.8, 200, 3000, rev=True), -27, 0, "out-kpi")
ev(40.55, s_thump(f0=52), -21, 0, "pulse-body")
ev(40.62, s_chime([74, 81, 86], 0.05, 0.6), -24, 0, "pulse")
for k in range(4):
    ev(40.98 + k * 0.13, s_tap(), -30, 0.4, "organize")
ev(43.25, s_whoosh(0.8, 200, 3500), -29, 0, "to-end")
ev(44.15, s_chime([62, 69, 74, 78, 81], 0.08, 1.2), -20, 0, "brand-resolve")

sfx[:, 0] = hp(sfx[:, 0], 30)
sfx[:, 1] = hp(sfx[:, 1], 30)
sfx = verb(sfx, 0.12)


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
