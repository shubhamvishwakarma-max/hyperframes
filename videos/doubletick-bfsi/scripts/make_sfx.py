"""Build the sound-design stem for the DoubleTick BFSI film.

Every cue below is timed to the GSAP timeline in index.html. Sounds are either
synthesized here (deterministic) or taken from the HyperFrames bundled SFX
library (media-use/audio/assets/sfx). Output: assets/sfx.wav (44.1 kHz stereo, 47s).
"""

import os
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 47.0
N = int(SR * DUR)
OUT = np.zeros((N, 2))
rng = np.random.default_rng(3)
LIB = os.path.expanduser("~/.claude/skills/media-use/audio/assets/sfx")


def lp(x, fc):
    return sosfilt(butter(2, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc):
    return sosfilt(butter(2, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def tt(sec):
    return np.arange(int(sec * SR)) / SR


def lib(name):
    raw = subprocess.run(
        ["ffmpeg", "-v", "quiet", "-i", f"{LIB}/{name}.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return x / (np.max(np.abs(x)) + 1e-9)


def tone(f, sec, decay, attack=0.004, partials=((1, 1.0),)):
    t = tt(sec)
    s = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in partials)
    return s * np.minimum(t / attack, 1) * np.exp(-t * decay)


# ---------------------------------------------------------------- sound palette


def soft_pulse():
    t = tt(0.9)
    s = tone(392, 0.9, 5.5, 0.01, ((1, 1), (2, 0.25))) + tone(784, 0.9, 9, 0.01) * 0.25
    sub = np.sin(2 * np.pi * 98 * t) * np.exp(-t * 7) * 0.5
    return s * 0.5 + sub


def data_tick(f=2400):
    return tone(f, 0.08, 70, 0.001, ((1, 1), (2.01, 0.3))) * 0.6


def snap(big=True):
    t = tt(0.45)
    crack = hp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 90)
    f = 900 * np.exp(-t * 9) + 120
    drop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    s = crack * 0.55 + drop * 0.6
    return s if big else s * 0.5


def ring():
    t = tt(0.26)
    s = (np.sin(2 * np.pi * 1046 * t) + 0.7 * np.sin(2 * np.pi * 1318 * t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t))
    env = np.minimum(t / 0.01, 1) * np.minimum((0.26 - t) / 0.04, 1)
    return s * env * 0.45


def hang():
    t = tt(0.25)
    click = bp(rng.standard_normal(len(t)), 300, 1600) * np.exp(-t * 120)
    thud = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30)
    return click * 0.5 + thud * 0.7


def decel():
    t = tt(0.7)
    f = 820 * np.exp(-t * 2.6) + 160
    trem = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(28 * np.exp(-t * 3) + 4) / SR))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * trem
    return lp(s, 3000) * np.exp(-t * 3.2) * np.minimum(t / 0.01, 1) * 0.35


def clock_pulse():
    a = tone(523, 0.35, 16, 0.002, ((1, 1), (2.76, 0.4))) * 0.6
    b = tone(494, 0.35, 16, 0.002, ((1, 1), (2.76, 0.4))) * 0.6
    out = np.zeros(int(0.7 * SR))
    out[: len(a)] += a
    out[int(0.22 * SR) : int(0.22 * SR) + len(b)] += b
    return out


def wood_tick():
    return tone(1200, 0.06, 90, 0.001, ((1, 1), (1.5, 0.5))) * 0.4


def mag_snap(f=180):
    t = tt(0.3)
    thump = np.sin(2 * np.pi * np.cumsum(f * (1 + 2 * np.exp(-t * 60))) / SR) * np.exp(-t * 26)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 260) * 0.4
    tail = tone(1568, 0.3, 22, 0.001) * 0.18
    return thump * 0.8 + click + tail


def chime(root=659.25, third=830.6):
    a = tone(root, 1.6, 3.2, 0.003, ((1, 1), (2, 0.3), (3.01, 0.12)))
    b = tone(third, 1.4, 3.2, 0.003, ((1, 1), (2, 0.3)))
    out = np.zeros(len(a) + int(0.09 * SR))
    out[: len(a)] += a * 0.5
    out[int(0.09 * SR) : int(0.09 * SR) + len(b)] += b * 0.5
    return out


def completion():
    out = np.zeros(int(2.0 * SR))
    for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
        s = tone(f, 1.8, 2.6, 0.004, ((1, 1), (2, 0.25)))
        i = int(k * 0.045 * SR)
        out[i : i + len(s)] += s * 0.3
    return out


def connect_tone():
    out = np.zeros(int(0.8 * SR))
    for k, f in enumerate([587.33, 880.0]):
        s = tone(f, 0.6, 6, 0.01, ((1, 1), (2, 0.2)))
        i = int(k * 0.12 * SR)
        out[i : i + len(s)] += s * 0.45
    t = tt(0.8)
    out += lp(rng.standard_normal(len(t)), 900) * np.exp(-((t - 0.35) ** 2) / 0.02) * 0.05
    return out


def disconnect_tone():
    out = np.zeros(int(0.6 * SR))
    for k, f in enumerate([880.0, 587.33]):
        s = tone(f, 0.45, 8, 0.01)
        i = int(k * 0.1 * SR)
        out[i : i + len(s)] += s * 0.35
    return out


def soft_whoosh(sec=0.6, up=True):
    t = tt(sec)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    blocks = 12
    for k in range(blocks):
        a = k * len(t) // blocks
        b = (k + 1) * len(t) // blocks
        fr = k / blocks if up else 1 - k / blocks
        fc = 500 * (6 ** fr)
        out[a:b] = bp(n[max(0, a - 1500) : b], fc * 0.6, fc * 1.6)[-(b - a) :]
    env = np.sin(np.pi * t / sec) ** 2
    return out * env * 0.5


def riser_short(sec=1.0):
    t = tt(sec)
    f = 300 * (4 ** (t / sec))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + soft_whoosh(sec, True)
    return s * (t / sec) ** 1.5


def logo_resolve():
    out = np.zeros(int(2.6 * SR))
    t = tt(2.6)
    out += np.sin(2 * np.pi * 87.3 * t) * np.exp(-t * 2.2) * np.minimum(t / 0.02, 1) * 0.6
    for k, f in enumerate([698.46, 880.0, 1046.5, 1396.9]):
        s = tone(f, 2.4, 2.0, 0.006, ((1, 1), (2, 0.2)))
        i = int(k * 0.03 * SR)
        out[i : i + len(s)] += s * 0.22
    return out


def cta_accent():
    t = tt(0.5)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 300) * 0.4
    body = tone(988, 0.5, 9, 0.002, ((1, 1), (2, 0.3))) * 0.4
    sub = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 18) * 0.5
    return click + body + sub


POP = lib("pop")
CLICK = lib("click-soft")
PING = lib("ping")
SPARKLE = lib("sparkle")
WHOOSH = lib("whoosh-short")

# ---------------------------------------------------------------- placement


def put(sig, t, gain=1.0, pan=0.0, width=0.0):
    i = int(round(t * SR))
    n = min(len(sig), N - i)
    if n <= 0:
        return
    a = (pan + 1) * np.pi / 4
    l = sig[:n] * np.cos(a) * gain * 1.41
    r = sig[:n] * np.sin(a) * gain * 1.41
    if width:
        d = int(0.011 * SR)
        r = np.concatenate([r[:d] * (1 - width), r[d:] * (1 - width) + r[:-d] * width]) if n > d else r
    OUT[i : i + n, 0] += l
    OUT[i : i + n, 1] += r


# Scene 1–2
put(soft_pulse(), 0.15, 0.75, -0.4)
put(data_tick(2600), 0.55, 0.35, -0.3)
put(soft_pulse(), 1.25, 0.35, -0.2)
put(soft_pulse(), 2.25, 0.35, 0.0)
put(data_tick(3000), 4.5, 0.4, 0.5)
put(snap(), 5.04, 0.95, 0.3)
put(soft_whoosh(0.7), 5.8, 0.22, 0, 0.4)
# Scene 3
put(ring(), 6.42, 0.7, -0.5)
put(ring(), 6.72, 0.7, -0.5)
put(hang(), 7.03, 0.8, -0.5)
put(snap(False), 7.1, 0.35, -0.5)
put(WHOOSH, 7.3, 0.12, -0.2)
put(data_tick(2000), 8.0, 0.3, -0.15)
put(data_tick(2100), 8.3, 0.3, -0.15)
put(decel(), 8.55, 0.65, -0.15)
put(snap(False), 8.8, 0.35, -0.15)
put(WHOOSH, 8.98, 0.12, 0.1)
put(CLICK, 9.6, 0.55, 0.2)
put(data_tick(3100), 9.62, 0.25, 0.2)
put(snap(False), 10.3, 0.35, 0.2)
put(WHOOSH, 10.46, 0.12, 0.4)
for k, tk in enumerate([10.92, 11.12, 11.32]):
    put(wood_tick(), tk, 0.35, 0.5)
put(clock_pulse(), 11.46, 0.55, 0.5)
put(snap(False), 11.65, 0.35, 0.5)
# Scene 4
put(soft_whoosh(0.55), 12.0, 0.2, 0, 0.4)
put(PING, 12.55, 0.65)
for k in range(4):
    put(mag_snap(170 + k * 12), 12.66 + k * 0.07, 0.4, (-0.6, -0.2, 0.2, 0.6)[k])
for tm, g in [(13.45, 0.45), (14.15, 0.45), (15.75, 0.4), (17.28, 0.45), (17.95, 0.4), (18.6, 0.35), (18.98, 0.35), (19.33, 0.35), (19.72, 0.35), (21.3, 0.3), (21.42, 0.35), (25.45, 0.4), (26.0, 0.4)]:
    put(POP, tm, g, -0.25)
for tm in [15.5, 18.42, 20.02]:
    put(CLICK, tm, 0.6, -0.25)
put(data_tick(2600), 18.8, 0.45, 0.4)
put(data_tick(2800), 19.5, 0.45, 0.4)
put(data_tick(3000), 21.55, 0.45, 0.4)
put(connect_tone(), 20.15, 0.5, -0.2)
put(disconnect_tone(), 21.08, 0.35, -0.2)
put(chime(783.99, 987.77), 22.12, 0.4, 0.3)
put(soft_whoosh(0.6, False), 22.45, 0.16, -0.3)
put(soft_whoosh(0.9), 23.35, 0.16, 0.2, 0.4)
for k in range(3):
    put(data_tick(2400 + k * 300), 24.40 + k * 0.12, 0.5, 0.5)
put(soft_whoosh(0.6), 25.1, 0.15, -0.2)
put(soft_whoosh(0.5, False), 28.42, 0.16, 0, 0.4)
# Scene 7–8
for k, tm in enumerate([29.32, 29.9, 30.62, 31.22, 31.45]):
    put(mag_snap(160 + k * 10), tm, 0.5, -0.6 + k * 0.3)
put(chime(659.25, 830.61), 30.6, 0.35, 0.15)
put(SPARKLE, 32.25, 0.18, 0, 0.5)
for k, tm in enumerate([33.53, 33.72, 33.9, 34.07]):
    put(data_tick(2200 + k * 200), tm, 0.32, -0.5 + k * 0.33)
put(completion(), 34.25, 0.55, 0.4)
put(soft_whoosh(0.5), 34.3, 0.22, 0.3, 0.4)
# Scene 9
for k in range(5):
    put(data_tick(2000 + k * 250), 34.98 + k * 0.12, 0.38, -0.4 + k * 0.2)
put(soft_whoosh(0.4), 36.12, 0.28, 0, 0.3)
for k in range(5):
    put(data_tick(2600 + k * 220), 37.36 + k * 0.14, 0.38, -0.6 + k * 0.3)
put(soft_whoosh(0.5), 38.5, 0.2, 0, 0.4)
# Scene 10–11
put(riser_short(1.0), 39.3, 0.3, 0, 0.4)
for k, tm in enumerate([39.62, 39.85, 40.08]):
    put(POP, tm, 0.25, -0.3 + k * 0.3)
put(chime(783.99, 987.77), 40.33, 0.4, 0.45)
put(soft_whoosh(0.6), 41.0, 0.18, 0, 0.4)
put(logo_resolve(), 41.55, 0.55, 0, 0.5)
put(cta_accent(), 42.95, 0.55)

peak = np.max(np.abs(OUT))
OUT = OUT / peak * 10 ** (-3 / 20)
wavfile.write("assets/sfx.wav", SR, (OUT * 32767).astype(np.int16))
print("wrote assets/sfx.wav, prior peak", round(peak, 3))
