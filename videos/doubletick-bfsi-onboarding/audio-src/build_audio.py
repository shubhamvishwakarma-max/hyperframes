"""Builds the music bed (arc automation baked in) and the synthesized SFX stem.

Deterministic: fixed RNG seed, no external samples. Run from the project root:
    python3 audio-src/build_audio.py
"""
import subprocess, wave
import numpy as np

SR = 48000
DUR = 43.5
N = int(SR * DUR)
rng = np.random.default_rng(20260930)


def read_wav(path):
    w = wave.open(path)
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    return a.reshape(-1, w.getnchannels())


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    w = wave.open(path, "wb")
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
    w.close()


def env_points(points, n=N):
    """piecewise-linear gain envelope from [(t, gain_db)]"""
    t = np.arange(n) / SR
    ts = [p[0] for p in points]; gs = [p[1] for p in points]
    return 10 ** (np.interp(t, ts, gs) / 20)


# ---------------------------------------------------------------- music bed
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.45", "-i", "assets/audio/music-raw.mp3",
                "-t", str(DUR), "-ar", str(SR), "-ac", "2", "/tmp/music-trim.wav"], check=True)
m = read_wav("/tmp/music-trim.wav")
if len(m) < N:
    m = np.vstack([m, np.zeros((N - len(m), 2))])
m = m[:N]
# arc: minimal open → strip back on "go silent" → full rhythm on "With DoubleTick" → clean end
arc = env_points([
    (0.0, -60), (0.35, 0), (4.7, 0), (5.8, -4), (6.2, -15), (7.35, -15), (7.52, 0),
    (41.4, 0), (42.9, -40), (43.5, -80),
])
m = m * arc[:, None]
# "soundscape narrows" — darken the bed while the journey goes silent
t = np.arange(N) / SR
cut = np.interp(t, [0, 5.8, 6.2, 7.35, 7.55, 43.5], [20000, 20000, 900, 900, 20000, 20000])
# vectorised time-varying LP only over the window that needs it
i0, i1 = int(5.7 * SR), int(7.7 * SR)
seg = m[i0:i1].copy()
a = np.exp(-2 * np.pi * cut[i0:i1] / SR)
y = np.zeros_like(seg); s = np.zeros(2)
for i in range(len(seg)):
    s = (1 - a[i]) * seg[i] + a[i] * s
    y[i] = s
m[i0:i1] = y
write_wav("assets/audio/music-bed.wav", m * 0.8)

# ---------------------------------------------------------------- SFX
out = np.zeros((N, 2))
tt = lambda d: np.arange(int(d * SR)) / SR


def place(sig, at, gain_db=0.0, pan=0.0):
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], -1)
    i = int(at * SR); j = min(N, i + len(sig))
    out[i:j] += sig[: j - i] * 10 ** (gain_db / 20)


def add(*sigs):
    n = max(len(x) for x in sigs)
    return sum(np.pad(x, (0, n - len(x))) for x in sigs)


def adsr(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def fftconv(a, b):
    L = len(a) + len(b) - 1
    nf = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, nf) * np.fft.rfft(b, nf), nf)[:L]


def reverb(sig, decay=0.35, mix=0.18):
    n = int(decay * 4 * SR)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / SR / decay)
    ir = np.convolve(ir, np.ones(8) / 8, "same")
    wet = fftconv(sig, ir)
    dry = np.concatenate([sig, np.zeros(len(wet) - len(sig))])
    wet *= (np.sqrt((dry ** 2).mean()) + 1e-9) / (np.sqrt((wet ** 2).mean()) + 1e-9)
    return dry * (1 - mix) + wet * mix


def sine(f, d, dec=0.12, a=0.003, ph=0):
    t = tt(d)
    f = np.broadcast_to(np.asarray(f, float), t.shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph) * adsr(len(t), a, dec)


def noise(d):
    return rng.normal(0, 1, int(d * SR))


def bandnoise(d, lo, hi):
    x = noise(d)
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, len(x))
    return y / (np.abs(y).max() + 1e-9)


def bell(f0, d=1.2, dec=0.35, partials=((1, 1), (2.0, 0.28), (3.01, 0.12), (4.2, 0.05))):
    s = sum(g * sine(f0 * p, d, dec / (1 + 0.6 * k), 0.002) for k, (p, g) in enumerate(partials))
    return reverb(s, 0.4, 0.22)


def click(bright=1.0, d=0.05):
    n = bandnoise(d, 1800 * bright, 9000) * adsr(int(d * SR), 0.0005, 0.004)
    body = sine(180, d, 0.012) * 0.6
    return (n * 0.5 + body)


def pop(f1=900, f2=520, d=0.09):
    f = np.linspace(f1, f2, int(d * SR))
    return sine(f, d, 0.03, 0.001) + bandnoise(d, 2000, 7000) * adsr(int(d * SR), 0.0005, 0.003) * 0.15


def whoosh(d, lo=300, hi=3000, peak=0.6, rise=True):
    n = int(d * SR); t = np.arange(n) / n
    e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.6)
    x = bandnoise(d, lo, hi) * e
    return x


def tone_rise(d, f0, f1, dec=None):
    n = int(d * SR); t = np.arange(n) / n
    f = f0 * (f1 / f0) ** t
    e = np.sin(np.pi * t) ** 1.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * e


def impact(f0=70, d=1.2):
    f = f0 * (1 + 0.8 * np.exp(-tt(d) / 0.05))
    return sine(f, d, 0.35, 0.002) + bandnoise(d, 40, 400) * adsr(int(d * SR), 0.002, 0.08) * 0.3


def ticks(start, count, spacing, f=2600, g=-24, grow=1.0):
    at = start
    for k in range(count):
        place(add(sine(f, 0.03, 0.008, 0.0005), click(1.4, 0.02) * 0.2), at, g)
        at += spacing; spacing *= grow


# --- scene 1: application starts, progress pulses decelerate, stall
place(bell(1318.5, 1.0, 0.18, ((1, 1), (1.5, 0.35), (2, 0.15))), 0.5, -21)
place(bell(1975.5, 0.8, 0.14), 0.6, -27)
ticks(0.95, 7, 0.16, 2200, -30, 1.18)
f = np.linspace(260, 95, int(0.28 * SR))
place(add(sine(f, 0.28, 0.08) * 0.7, click(0.6, 0.06) * 0.7), 2.36, -20)  # dampened mechanical click
place(click(0.9), 3.42, -32)
# --- scene 2: go silent — sub air-out
place(tone_rise(1.2, 110, 70) * 0.5, 5.9, -30)
place(sine(1760, 0.08, 0.02), 7.2, -30)  # dot turns green
# --- scene 3: WhatsApp arrives
place(bell(1567.98, 1.2, 0.3, ((1, 1), (2, 0.4), (2.99, 0.12))), 7.55, -16)  # notification ping
place(bell(2093.0, 1.0, 0.22), 7.66, -22)
place(impact(62, 1.4), 7.56, -15)
place(whoosh(0.55, 150, 1400, 0.35), 7.5, -24)
for at in (8.32, 9.92):
    place(pop(), at, -21)
place(pop(1100, 700, 0.07), 11.62, -25)
ticks(8.75, 5, 0.22, 3000, -34, 1.0)  # line reconnects
place(click(), 13.55, -20)
# --- scene 4
place(pop(700, 480), 13.87, -24)
place(pop(), 14.07, -21)
place(click(), 14.3, -22)
place(pop(760, 520), 14.52, -24)
place(pop(), 14.92, -21)
# AI voice call connect + waveform ambience
place(sine(660, 0.09, 0.05) , 15.03, -24); place(sine(880, 0.12, 0.06), 15.12, -24)
amb = bandnoise(0.7, 900, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * tt(0.7))) * np.sin(np.pi * np.linspace(0, 1, int(0.7 * SR)))
place(amb, 15.1, -40)
place(sine(880, 0.08, 0.04), 15.78, -27); place(sine(587, 0.1, 0.05), 15.84, -27)
place(click(), 15.46, -22)
place(pop(900, 640, 0.06), 15.82, -27); place(pop(900, 640, 0.06), 16.04, -27)
place(pop(), 16.28, -21)
place(click(), 16.8, -21)
place(pop(700, 480), 17.02, -24)
# --- scene 5: KYC flow
place(whoosh(0.5, 200, 1800, 0.3), 17.1, -27)
place(click(), 18.2, -20)
ticks(18.45, 9, 0.095, 3400, -32)
place(bell(1760, 0.9, 0.2, ((1, 1), (1.5, 0.3))), 19.38, -21)  # upload complete
place(whoosh(0.4, 200, 1500, 0.4), 19.72, -30)
place(pop(700, 480), 19.97, -24)
# --- scene 6: governed workflow
place(whoosh(1.0, 250, 2600, 0.55), 20.85, -23, 0.3)  # controlled routing
place(click(0.7), 21.95, -26)
place(pop(), 22.47, -22)
place(click(), 22.95, -20)
place(bell(1318.5, 1.0, 0.25, ((1, 1), (2, 0.25), (3, 0.08))), 23.05, -20)  # consent chime
sw = bandnoise(0.8, 3000, 9000) * np.sin(np.pi * np.linspace(0, 1, int(0.8 * SR))) ** 2
place(sw * 0.5, 24.1, -30, 0.3)  # masking digital sweep
ticks(24.18, 10, 0.045, 4200, -36)
ticks(24.6, 10, 0.045, 4600, -36)
place(bell(1567.98, 0.8, 0.18), 24.95, -23)
place(click(0.8), 26.1, -30)
place(click(0.5, 0.04), 27.32, -24)  # muted: download disabled
place(bell(1760, 0.8, 0.18), 28.0, -23)
place(tone_rise(0.6, 300, 900) * 0.6 + whoosh(0.6, 400, 3000, 0.7) * 0.5, 28.42, -26)  # morph
# --- scene 7: connected journey — ascending restrained checks
for at, fq in ((29.07, 1046.5), (29.68, 1174.66), (31.22, 1318.51), (31.66, 1567.98)):
    place(bell(fq, 0.9, 0.2, ((1, 1), (2, 0.2))), at, -22)
ticks(30.72, 6, 0.08, 2800, -33)
place(bell(1567.98, 1.1, 0.28, ((1, 1), (2, 0.4), (2.99, 0.12))), 31.8, -21)  # follow-up ping
# --- scene 8: rising tonal movement
pad = sum(tone_rise(2.4, f0, f0 * 1.06) * g for f0, g in ((261.6, 0.5), (392.0, 0.35), (523.3, 0.25)))
place(pad, 32.8, -30)
# --- scene 9: line collapses → sonic logo
place(whoosh(0.4, 400, 4000, 0.9), 35.18, -26)
place(impact(55, 1.6), 35.6, -14)
chord = sum(bell(f0, 2.2, 0.7, ((1, 1), (2, 0.22), (3.01, 0.07))) * g for f0, g in ((523.25, 0.5), (659.25, 0.35), (783.99, 0.3), (1046.5, 0.22)))
place(chord, 35.6, -20)
# --- CTA
place(whoosh(0.6, 200, 2000, 0.6), 39.0, -30)
place(click(), 40.72, -20)
place(bell(1318.5, 1.6, 0.45, ((1, 1), (1.5, 0.3), (2, 0.2), (3, 0.06))), 40.76, -19)
place(bell(1975.5, 1.4, 0.35), 40.86, -25)
place(sine(1318.5, 0.5, 0.2) * 0.4, 42.2, -32)

out *= 0.9
peak = np.abs(out).max()
print("sfx peak dBFS", 20 * np.log10(peak + 1e-9))
if peak > 0.5:
    out *= 0.5 / peak
write_wav("assets/audio/sfx.wav", out)
print("wrote music-bed.wav + sfx.wav")
