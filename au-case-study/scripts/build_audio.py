"""Build the final soundtrack: original synth music bed + VO + micro-SFX.

Usage: python3 scripts/build_audio.py   (run from the project root)
Writes assets/audio/mix.wav (48 kHz stereo). Requires numpy, soundfile, ffmpeg.
"""

import subprocess
import numpy as np
import soundfile as sf

SR = 48000
DUR = 36.5
N = int(SR * DUR)
BPM = 112
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(7)


def load(path, gain=1.0):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy() * gain


def place(buf, clip, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    n = min(len(clip), len(buf) - i)
    buf[i : i + n] += clip[:n] * gain


def lp_fast(x, fc, passes=2):
    # smooth Butterworth-shaped low-pass applied in the frequency domain
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / np.sqrt(1 + (f / fc) ** (2 * passes))
    return np.fft.irfft(X * (h[:, None] if x.ndim > 1 else h), n=len(x), axis=0)


def hp_fast(x, fc, passes=2):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 - 1 / np.sqrt(1 + (f / fc) ** (2 * passes))
    return np.fft.irfft(X * (h[:, None] if x.ndim > 1 else h), n=len(x), axis=0)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(freq, t):
    ph = (freq * t) % 1.0
    return 2 * ph - 1


# vi – IV – I – V in D major, voiced warm
CHORDS = [
    [47, 59, 62, 66, 69],  # Bm7 (B2 root)
    [43, 59, 62, 66, 71],  # Gmaj7
    [50, 57, 62, 66, 69],  # D (add9-ish)
    [45, 57, 61, 64, 69],  # A
]


def chord_at(t):
    return CHORDS[int(t // BAR) % 4]


t_all = np.arange(N) / SR
music = np.zeros((N, 2), dtype=np.float64)

# ---------- pad ----------
pad = np.zeros((N, 2))
nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    t0 = b * BAR
    i0, i1 = int(t0 * SR), min(N, int((t0 + BAR + 0.6) * SR))
    if i0 >= N:
        break
    tt = np.arange(i1 - i0) / SR
    env = np.minimum(1, tt / 0.45) * np.clip((BAR + 0.6 - tt) / 0.6, 0, 1)
    for k, m in enumerate(CHORDS[b % 4][1:]):
        f = midi(m)
        l = saw(f * 0.998, tt + k * 0.13) + saw(f * 1.004, tt)
        r = saw(f * 1.002, tt + k * 0.07) + saw(f * 0.996, tt + 0.31)
        pad[i0:i1, 0] += l * env * 0.05
        pad[i0:i1, 1] += r * env * 0.05
pad = lp_fast(pad, 900, 2)
# pad swell: restrained start, opens when DoubleTick appears, softer at close
pad_gain = np.interp(t_all, [0, 2, 10.5, 11.2, 21.0, 21.5, 33.8, 36.5], [0.0, 1.0, 1.0, 0.8, 0.8, 0.9, 1.0, 0.0])
music += pad * pad_gain[:, None]

# ---------- bass (from 10.71) ----------
bass = np.zeros(N)
t = 10.71
while t < 34.2:
    root = chord_at(t)[0] - 12
    f = midi(root)
    L = int(BEAT / 2 * SR * 0.9)
    tt = np.arange(L) / SR
    env = np.exp(-tt * 7) * np.minimum(1, tt / 0.004)
    tone = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.15 * saw(f, tt)
    i = int(t * SR)
    n = min(L, N - i)
    bass[i : i + n] += (tone * env)[:n] * 0.22
    t += BEAT / 2
bass = lp_fast(bass, 420, 2)
music += bass[:, None]

# ---------- kick (from 10.71, four on the floor) ----------
def kick():
    L = int(0.32 * SR)
    tt = np.arange(L) / SR
    f = 45 + 70 * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 9) * 0.55


K = kick()
t = 10.71
while t < 33.9:
    place(music, np.stack([K, K], 1), t, 0.8 if t < 21.4 else 1.0)
    t += BEAT

# ---------- hats (offbeat 8ths from 4.29) ----------
def hat(length=0.035):
    L = int(length * SR)
    n = rng.standard_normal(L)
    n = hp_fast(n, 7000, 2)
    return n * np.exp(-np.arange(L) / SR * 90) * 0.09


t = 4.29 + BEAT / 2
while t < 33.9:
    h = hat()
    g = 0.5 if t < 10.7 else 0.8
    place(music, np.stack([h * 0.9, h], 1), t, g)
    t += BEAT

# ---------- soft clap on 2 & 4 from 21.43 ----------
def clap():
    L = int(0.18 * SR)
    n = rng.standard_normal(L)
    n = lp_fast(hp_fast(n, 1200), 5000)
    return n * np.exp(-np.arange(L) / SR * 22) * 0.07


t = 21.43 + BEAT
while t < 33.9:
    c = clap()
    place(music, np.stack([c, c * 0.9], 1), t)
    t += 2 * BEAT

# ---------- pluck arp (uplift during KPI section) ----------
arp = np.zeros((N, 2))
t = 21.43
step = 0
while t < 34.29:
    ch = chord_at(t)[1:]
    m = ch[[0, 1, 2, 3, 2, 1, 0, 3][step % 8]] + 12
    f = midi(m)
    L = int(0.4 * SR)
    tt = np.arange(L) / SR
    tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 11)
    pan = 0.5 + 0.25 * np.sin(step * 0.9)
    place(arp, np.stack([tone * (1 - pan), tone * pan], 1), t, 0.07)
    t += BEAT / 2
    step += 1
# simple stereo delay
d = int(BEAT * 0.75 * SR)
arp[d:, 0] += arp[:-d, 1] * 0.35
arp[d:, 1] += arp[:-d, 0] * 0.35
music += arp

# final sustained chord under the lockup
tt = np.arange(N - int(34.29 * SR)) / SR
fin = np.zeros((len(tt), 2))
for m in [50, 57, 62, 66, 69, 74]:
    f = midi(m)
    fin[:, 0] += np.sin(2 * np.pi * f * 0.999 * tt) * 0.03
    fin[:, 1] += np.sin(2 * np.pi * f * 1.001 * tt) * 0.03
fin *= (np.minimum(1, tt / 0.3) * np.exp(-tt * 0.9))[:, None]
music[int(34.29 * SR) :] += fin

# riser into KPI section
riser = load("assets/audio/sfx-riser.mp3")
seg = riser[int(7.6 * SR) : int(10.0 * SR)]
seg *= np.linspace(0, 1, len(seg))[:, None] ** 2
place(music, seg, 21.43 - len(seg) / SR, 0.22)

# ---------- VO + ducking ----------
vo = load("assets/audio/vo.wav")
vo_track = np.zeros((N, 2))
place(vo_track, vo, 0.0)
win = int(0.03 * SR)
env = np.sqrt(np.convolve(vo_track[:, 0] ** 2, np.ones(win) / win, mode="same"))
env = np.clip(env / (env.max() + 1e-9) * 3, 0, 1)
# smooth: fast attack, slow release
acc = 0.0
a_att, a_rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
# decimate for speed
dec = 48
envd = env[::dec]
smd = np.zeros_like(envd)
a_att_d, a_rel_d = a_att**dec, a_rel**dec
for i, v in enumerate(envd):
    a = a_att_d if v > acc else a_rel_d
    acc = a * acc + (1 - a) * v
    smd[i] = acc
sm = np.interp(np.arange(N), np.arange(len(smd)) * dec, smd)
duck = 1 - 0.5 * sm
music *= duck[:, None]

# ---------- SFX ----------
sfx = np.zeros((N, 2))
S = lambda name: load(f"assets/audio/sfx-{name}.mp3")
cues = [
    ("whoosh", 0.3, 0.12),
    ("whoosh-short", 4.55, 0.22),
    ("whoosh-short", 10.15, 0.22),
    ("click-soft", 10.85, 0.5),
    ("click-soft", 11.75, 0.35),
    ("click-soft", 12.55, 0.35),
    ("click-soft", 15.35, 0.35),
    ("whoosh-short", 17.55, 0.2),
    ("ping", 19.45, 0.22),
    ("impact-bass-1", 23.05, 0.3),
    ("pop", 25.95, 0.35),
    ("chime", 28.55, 0.25),
    ("whoosh", 31.1, 0.15),
    ("sparkle", 34.25, 0.14),
]
for name, t, g in cues:
    place(sfx, S(name), t, g)


# data ticks accelerating during the scale counter (1.5 -> 3.2s)
def tick():
    L = int(0.012 * SR)
    tt = np.arange(L) / SR
    x = np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 500)
    return np.stack([x, x], 1) * 0.05


tk = 1.55
gap = 0.16
while tk < 3.15:
    place(sfx, tick(), tk)
    tk += gap
    gap = max(0.045, gap * 0.86)
# light pulse when 3L+ lands
place(sfx, S("pop"), 3.2, 0.25)


# muted call-connect tone when the AI call opens (14.05s)
def blip(f, L=0.12):
    n = int(L * SR)
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.005) * np.exp(-tt * 18)
    return np.stack([x, x], 1) * 0.12


place(sfx, blip(660), 14.05)
place(sfx, blip(880), 14.17)

mix = music * 0.52 + vo_track * 1.0 + sfx
mix = np.tanh(mix * 1.1) / 1.1  # gentle soft clip safety
sf.write("assets/audio/mix_raw.wav", mix.astype(np.float32), SR)
subprocess.run(
    [
        "ffmpeg", "-v", "error", "-y", "-i", "assets/audio/mix_raw.wav",
        "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", str(SR), "assets/audio/mix.wav",
    ],
    check=True,
)
print("wrote assets/audio/mix.wav")
