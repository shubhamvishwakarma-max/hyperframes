"""Build the final soundtrack: original upbeat music bed + SFX (+ optional VO).

Usage: python3 scripts/build_audio.py   (run from the project root, after prep_vo.py)
Writes assets/audio/mix.wav (48 kHz stereo). Requires numpy, soundfile, ffmpeg.
"""

import json
import subprocess
import numpy as np
import soundfile as sf

SR = 48000
VOICEOVER = False  # vo.wav is timed to the 41.6s cut; re-run prep_vo/retime before enabling
WARP = json.load(open("assets/audio/warp.json"))
VO = json.load(open("assets/audio/vo.json"))
DUR = WARP["end"]
N = int(SR * DUR)
BPM = 122
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)


def warp(t):
    o, n = WARP["old"], WARP["new"]
    for i in range(len(o) - 1):
        if t <= o[i + 1]:
            return n[i] + (t - o[i]) / (o[i + 1] - o[i]) * (n[i + 1] - n[i])
    return n[-1] + (t - o[-1])


# section markers, all on the bar grid
DROP = warp(10.84)  # DoubleTick AI Voice reveal
LIFT = DROP + 6 * BAR  # KPI section
OUTRO = DROP + 43 * BEAT  # brand lockup (lands on the logo beat)
ORIGIN = DROP - 7 * BAR  # bar 0 of the chord grid (before t=0)


def load(path, gain=1.0):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy() * gain


def place(buf, clip, t, gain=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    n = min(len(clip), len(buf) - i)
    buf[i : i + n] += clip[:n] * gain


def lp(x, fc, passes=2):
    # smooth Butterworth-shaped low-pass applied in the frequency domain
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / np.sqrt(1 + (f / fc) ** (2 * passes))
    return np.fft.irfft(X * (h[:, None] if x.ndim > 1 else h), n=len(x), axis=0)


def hp(x, fc, passes=2):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 - 1 / np.sqrt(1 + (f / fc) ** (2 * passes))
    return np.fft.irfft(X * (h[:, None] if x.ndim > 1 else h), n=len(x), axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(freq, t):
    return 2 * ((freq * t) % 1.0) - 1


def st(x):
    return np.stack([x, x], 1)


# I – V – vi – IV in D major
CHORDS = [
    [50, 62, 66, 69, 74],  # D
    [45, 61, 64, 69, 73],  # A
    [47, 62, 66, 71, 74],  # Bm
    [43, 62, 67, 71, 74],  # G
]


def chord_at(t):
    return CHORDS[int(np.floor((t - ORIGIN) / BAR)) % 4]


def grid(start, end, step, offset=0.0):
    k = np.ceil((start - ORIGIN - offset) / step)
    t = ORIGIN + offset + k * step
    while t < end:
        yield t
        t += step


t_all = np.arange(N) / SR
music = np.zeros((N, 2))

# ---------- chord stabs / pad ----------
pad = np.zeros((N, 2))
for b in range(-1, int(DUR / BAR) + 3):
    t0 = ORIGIN + b * BAR
    i0, i1 = max(0, int(t0 * SR)), min(N, int((t0 + BAR + 0.3) * SR))
    if i1 <= i0:
        continue
    tt = (np.arange(i1 - i0) + (i0 - int(t0 * SR))) / SR
    env = np.minimum(1, tt / 0.25) * np.clip((BAR + 0.3 - tt) / 0.3, 0, 1)
    for k, m in enumerate(CHORDS[b % 4][1:]):
        f = midi(m)
        pad[i0:i1, 0] += (saw(f * 0.997, tt + k * 0.11) + saw(f * 1.003, tt)) * env * 0.04
        pad[i0:i1, 1] += (saw(f * 1.003, tt + k * 0.05) + saw(f * 0.997, tt + 0.2)) * env * 0.04
pad = lp(pad, 1300, 2)
# sidechain-style pump on the pad once the groove is in (house feel)
pump = np.ones(N)
for t in grid(DROP, OUTRO, BEAT):
    i = int(t * SR)
    L = min(int(BEAT * SR), N - i)
    pump[i : i + L] = 0.35 + 0.65 * np.minimum(1, np.arange(L) / (0.28 * SR))
pad_gain = np.interp(t_all, [0, 1.5, DROP - 0.1, DROP, OUTRO, DUR], [0.0, 0.8, 0.9, 0.8, 0.8, 0.0])
music += pad * (pad_gain * pump)[:, None]

# ---------- bass: offbeat 8ths in the intro, driving 8ths after the drop ----------
bass = np.zeros(N)
for t in grid(0.2, OUTRO, BEAT / 2):
    offbeat = abs(((t - ORIGIN) / (BEAT / 2)) % 2 - 1) < 0.01
    if t < DROP and not offbeat:
        continue
    f = midi(chord_at(t)[0] - 12)
    L = int(BEAT / 2 * SR * 0.85)
    tt = np.arange(L) / SR
    env = np.exp(-tt * 6) * np.minimum(1, tt / 0.003)
    tone = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) + 0.25 * saw(f, tt)
    i = int(t * SR)
    n = min(L, N - i)
    bass[i : i + n] += (tone * env)[:n] * (0.16 if t < DROP else 0.24)
bass = lp(bass, 650, 2)
music += st(bass)


# ---------- drums ----------
def kick():
    L = int(0.3 * SR)
    tt = np.arange(L) / SR
    f = 48 + 90 * np.exp(-tt * 32)
    click = rng.standard_normal(L) * np.exp(-tt * 400) * 0.15
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) + click) * 0.7


def noise_hit(L, hpf, lpf, decay, gain):
    n = rng.standard_normal(int(L * SR))
    n = lp(hp(n, hpf), lpf)
    return n * np.exp(-np.arange(len(n)) / SR * decay) * gain


K = st(kick())
# intro: half-time kick on 1 & 3, then four-on-the-floor from the drop
for t in grid(0.2, DROP, 2 * BEAT):
    place(music, K, t, 0.7)
for t in grid(DROP, OUTRO, BEAT):
    place(music, K, t, 1.0)
# claps on 2 & 4
for t in grid(3.0, OUTRO, 2 * BEAT, BEAT):
    c = noise_hit(0.2, 900, 6000, 20, 0.11)
    place(music, np.stack([c, c * 0.92], 1), t, 0.55 if t < DROP else 1.0)
# 16th shaker (accented on the offbeat)
for i, t in enumerate(grid(0.2, OUTRO, BEAT / 4)):
    h = noise_hit(0.03, 7500, 16000, 110, 0.05)
    acc = 1.0 if i % 2 else 0.45
    place(music, np.stack([h * 0.85, h], 1), t, acc * (0.6 if t < DROP else 1.0))
# open hats on the offbeat in the lift section
for t in grid(LIFT, OUTRO, BEAT, BEAT / 2):
    oh = noise_hit(0.22, 6000, 15000, 14, 0.05)
    place(music, np.stack([oh, oh * 0.9], 1), t)

# ---------- pluck lead (lift section) ----------
lead = np.zeros((N, 2))
pattern = [0, 2, 1, 3, 2, 1, 3, 2]
for step, t in enumerate(grid(LIFT, OUTRO, BEAT / 2)):
    m = chord_at(t)[1:][pattern[step % 8]] + 12
    f = midi(m)
    L = int(0.35 * SR)
    tt = np.arange(L) / SR
    tone = (saw(f, tt) * 0.4 + np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 13)
    pan = 0.5 + 0.3 * np.sin(step * 1.1)
    place(lead, np.stack([tone * (1 - pan), tone * pan], 1), t, 0.06)
lead = lp(lead, 5000)
d = int(BEAT * 0.75 * SR)
lead[d:, 0] += lead[:-d, 1] * 0.35
lead[d:, 1] += lead[:-d, 0] * 0.35
music += lead

# ---------- outro chord ----------
tt = np.arange(N - int(OUTRO * SR)) / SR
fin = np.zeros((len(tt), 2))
for m in [50, 57, 62, 66, 69, 74, 78]:
    f = midi(m)
    fin[:, 0] += np.sin(2 * np.pi * f * 0.999 * tt) * 0.028
    fin[:, 1] += np.sin(2 * np.pi * f * 1.001 * tt) * 0.028
fin *= (np.minimum(1, tt / 0.05) * np.exp(-tt * 0.7))[:, None]
music[int(OUTRO * SR) :] += fin
place(music, K, OUTRO, 0.9)

# risers into the drop and the lift
riser = load("assets/audio/sfx-riser.mp3")
for at, g in [(DROP, 0.3), (LIFT, 0.35)]:
    seg = riser[int(7.0 * SR) : int(10.0 * SR)].copy()
    seg *= np.linspace(0, 1, len(seg))[:, None] ** 2
    place(music, seg, at - len(seg) / SR, g)

# ---------- VO + ducking ----------
vo_track = np.zeros((N, 2))
if VOICEOVER:
    vo = load("assets/audio/vo.wav")
    place(vo_track, vo, 0.0)
    win = int(0.03 * SR)
    env = np.sqrt(np.convolve(vo_track[:, 0] ** 2, np.ones(win) / win, mode="same"))
    env = np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
    dec = 48
    envd = env[::dec]
    smd = np.zeros_like(envd)
    a_att, a_rel = np.exp(-dec / (0.02 * SR)), np.exp(-dec / (0.3 * SR))
    acc = 0.0
    for i, v in enumerate(envd):
        a = a_att if v > acc else a_rel
        acc = a * acc + (1 - a) * v
        smd[i] = acc
    duck = 1 - 0.45 * np.interp(np.arange(N), np.arange(len(smd)) * dec, smd)
    music *= duck[:, None]

# ---------- SFX (authored on the original choreography clock, then warped) ----------
sfx = np.zeros((N, 2))
cache = {}


def S(name):
    if name not in cache:
        cache[name] = load(f"assets/audio/sfx-{name}.mp3")
    return cache[name]


cues = [
    ("whoosh", 0.3, 0.14),  # logo + case card in
    ("pop", 3.2, 0.3),  # 3 lakh+ lands
    ("whoosh-short", 4.55, 0.28),  # mask wipe
    ("click-soft", 6.9, 0.35),  # "called" chips
    ("click-soft", 7.4, 0.3),
    ("whoosh-short", 9.95, 0.25),  # card flies to the dashboard
    ("click", 10.85, 0.3),  # dashboard lands
    ("click-soft", 11.45, 0.4),  # status updates
    ("click-soft", 12.15, 0.35),
    ("click-soft", 12.85, 0.35),
    ("whoosh", 13.5, 0.18),  # camera push into the call
    ("click-soft", 15.2, 0.3),  # intelligence chips
    ("click-soft", 15.58, 0.3),
    ("click-soft", 15.96, 0.3),
    ("click-soft", 16.34, 0.3),
    ("pop", 16.95, 0.28),  # flow nodes
    ("pop", 17.45, 0.28),
    ("pop", 17.87, 0.28),
    ("pop", 18.29, 0.32),
    ("whoosh-short", 18.5, 0.22),
    ("notification", 19.45, 0.22),  # new qualified lead toast
    ("whoosh", 20.75, 0.18),
    ("impact-bass-1", 23.0, 0.38),  # KPI 1 lands
    ("whoosh-short", 24.75, 0.22),
    ("impact-bass-2", 25.95, 0.25),  # KPI 2 lands
    ("whoosh-short", 27.05, 0.22),
    ("chime", 28.55, 0.3),  # recovered
    ("whoosh-short", 29.5, 0.2),
    ("whoosh", 31.0, 0.16),
    ("pop", 32.05, 0.25),  # lead hops into the hub
    ("whoosh-short", 32.75, 0.2),
    ("sparkle", 34.25, 0.2),  # brand lockup
    ("chime", 34.3, 0.18),
]
for name, t, g in cues:
    place(sfx, S(name), warp(t), g)


def tick():
    L = int(0.012 * SR)
    tt = np.arange(L) / SR
    return st(np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 500)) * 0.06


# accelerating data ticks under the counters
for a, b in [(1.55, 3.15), (21.2, 22.95)]:
    tk, gap = warp(a), 0.15
    while tk < warp(b):
        place(sfx, tick(), tk)
        tk += gap
        gap = max(0.045, gap * 0.87)


def blip(f, L=0.12):
    n = int(L * SR)
    tt = np.arange(n) / SR
    return st(np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.005) * np.exp(-tt * 18)) * 0.14


place(sfx, blip(660), warp(14.05))  # AI call connects
place(sfx, blip(880), warp(14.05) + 0.12)

mix = music * (0.42 if VOICEOVER else 0.6) + vo_track * 1.0 + sfx
mix = np.tanh(mix * 1.1) / 1.1  # gentle soft clip safety
sf.write("assets/audio/mix_raw.wav", mix.astype(np.float32), SR)
subprocess.run(
    [
        "ffmpeg", "-v", "error", "-y", "-i", "assets/audio/mix_raw.wav",
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), "assets/audio/mix.wav",
    ],
    check=True,
)
subprocess.run(["rm", "-f", "assets/audio/mix_raw.wav"], check=True)
print("wrote assets/audio/mix.wav", round(DUR, 2), "s  drop", round(DROP, 2), "lift", round(LIFT, 2), "outro", round(OUTRO, 2))
