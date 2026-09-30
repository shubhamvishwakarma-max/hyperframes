"""Build the master mix for the DoubleTick BFSI ad.

VO (untouched, only gain) + ElevenLabs music bed (bar-aligned edit, VO-ducked)
+ SFX (bundled HyperFrames library + small synthesized UI tones).
Output: assets/audio/master_mix.wav (48 kHz stereo, -14 LUFS, -1 dBTP)
plus stems in assets/audio/stems/.
"""

import os
import subprocess

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, find_peaks, sosfilt, sosfiltfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
A = os.path.join(ROOT, "assets", "audio")
SR = 48000
DUR = 51.5
N = int(DUR * SR)
rng = np.random.default_rng(7)


def load(path, mono=False):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    ).stdout
    x = np.frombuffer(raw, np.float32).copy()
    return x if mono else x.reshape(-1, 2)


def db(v):
    return 10 ** (v / 20)


def place(buf, clip, t, gain_db=0.0, pan=0.0):
    if clip.ndim == 1:
        clip = np.stack([clip, clip], 1)
    l, r = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    clip = clip * np.array([l, r]) * db(gain_db)
    i = int(round(t * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[: j - i]


def env(n, a, d):
    """attack / exponential decay envelope, seconds"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e


# ---------------- synthesized UI sounds ----------------
def s_tick(freq=2400, dur=0.05, level=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) * env(n, 0.001, 0.012)
    x += 0.4 * rng.standard_normal(n) * env(n, 0.0005, 0.004)
    return (x * level).astype(np.float32)


def s_blip(freq=1320, dur=0.18):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)) * env(n, 0.003, 0.05)
    return x.astype(np.float32)


def s_bell(freq, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (
        np.sin(2 * np.pi * freq * t)
        + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t / 0.12)
        + 0.12 * np.sin(2 * np.pi * freq * 3.0 * t) * np.exp(-t / 0.06)
    ) * env(n, 0.004, 0.28)
    return x.astype(np.float32)


def s_ring(total=1.3):
    """soft dual-tone ring-ring (400+450 Hz), phone-speaker filtered"""
    n = int(total * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 400 * t) + np.sin(2 * np.pi * 450 * t)
    gate = np.zeros(n)
    for a, b in [(0.0, 0.4), (0.6, 1.0)]:
        ia, ib = int(a * SR), int(b * SR)
        seg = np.ones(ib - ia)
        f = int(0.02 * SR)
        seg[:f] = np.linspace(0, 1, f)
        seg[-f:] = np.linspace(1, 0, f)
        gate[ia:ib] = seg
    x = tone * gate * 0.5
    sos = butter(2, [300, 3000], "band", fs=SR, output="sos")
    return sosfilt(sos, x).astype(np.float32)


def s_callend():
    out = []
    for f, d in [(620, 0.13), (0, 0.05), (470, 0.2)]:
        n = int(d * SR)
        t = np.arange(n) / SR
        if f == 0:
            out.append(np.zeros(n))
        else:
            e = np.ones(n)
            k = int(0.01 * SR)
            e[:k] = np.linspace(0, 1, k)
            e[-k:] = np.linspace(1, 0, k)
            out.append(np.sin(2 * np.pi * f * t) * e * 0.6)
    return np.concatenate(out).astype(np.float32)


def s_downer(dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 220 * np.exp(-t * 1.6) + 55
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env(n, 0.01, 0.45)
    return x.astype(np.float32)


def s_pulse(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 58 * t) * env(n, 0.01, 0.09)).astype(np.float32)


def s_rise(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 300 + 500 * (t / dur) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    noise = rng.standard_normal(n)
    sos = butter(2, [1500, 7000], "band", fs=SR, output="sos")
    noise = sosfilt(sos, noise)
    x = (0.5 * np.sin(ph) + 0.25 * np.sin(1.5 * ph) + 0.25 * noise) * (t / dur) ** 2
    k = int(0.05 * SR)
    x[-k:] *= np.linspace(1, 0, k)
    return x.astype(np.float32)


# ---------------- load sources ----------------
vo = load(os.path.join(A, "src", "vo.mp3"), mono=True)
music = load(os.path.join(A, "src", "music_a.mp3"))
S = {k: load(os.path.join(A, "sfx", k + ".mp3")) for k in ["notification", "pop", "click", "click-soft", "whoosh", "whoosh-short", "chime", "sparkle", "ping", "typing", "impact-bass-1"]}

# ---------------- music edit (bar aligned) ----------------
lo = sosfilt(butter(4, 150, "low", fs=SR, output="sos"), music.mean(1))
hop = SR // 100
e = np.sqrt(np.add.reduceat(lo[: len(lo) // hop * hop] ** 2, np.arange(0, len(lo) // hop * hop, hop)) / hop)
dd = np.maximum(0, np.diff(e))
pk, _ = find_peaks(dd, height=dd.max() * 0.25, distance=20)
on = pk / 100.0
on = on[(on > 8) & (on < 43.5)]
k = np.round((on - on[0]) / 0.2685)
p8, a0 = np.polyfit(k, on, 1)
bar = p8 * 8
lift = a0  # first full-groove downbeat
drop = a0 + 16 * bar  # groove ends, sustained tail begins
print(f"music: lift {lift:.3f}s  bar {bar:.4f}s  drop {drop:.3f}s  bpm {60 / (p8 * 2):.2f}")

VO_LIFT = 9.31  # "With DoubleTick" transition
off = VO_LIFT - lift
bed = np.zeros((N, 2), np.float32)


def fade(n, a_in, a_out):
    g = np.ones(n, np.float32)
    ia, io = int(a_in * SR), int(a_out * SR)
    if ia:
        g[:ia] = np.linspace(0, 1, ia)
    if io:
        g[-io:] = np.linspace(1, 0, io)
    return g


# pass 1: music 0 -> (tail) until the CTA re-entry
cta_in = 47.35
m1_end_video = cta_in + 0.12
m1 = music[: int((m1_end_video - off) * SR)]
m1 = m1 * fade(len(m1), 0.25, 0.14)[:, None]
place(bed, m1, off)
# pass 2: re-enter one bar before the drop, so the cadence lands on the tick resolve
re_src = drop - bar
m2 = music[int((re_src - 0.012) * SR) : int((drop + 2.3) * SR)]
m2 = m2 * fade(len(m2), 0.012, 0.9)[:, None]
place(bed, m2, cta_in - 0.012)
print(f"music offset {off:.3f}s; drop at video {drop + off:.2f}s; CTA cadence at {cta_in + bar:.2f}s")

# ---------------- VO ----------------
vo_st = np.zeros((N, 2), np.float32)
place(vo_st, vo, 0.0)

# ---------------- SFX ----------------
fx = np.zeros((N, 2), np.float32)
place(fx, S["notification"], 0.08, -9)
for t in np.arange(0.35, 4.6, 0.536):
    place(fx, s_pulse(), t, -12)
tt = [2.45, 2.85, 3.15, 3.42, 3.65, 3.86, 4.05, 4.22]
for i, t in enumerate(tt):
    place(fx, s_tick(2600, level=1.0), t, -16 + i * 0.6)
for t in np.linspace(2.5, 4.2, 14):
    place(fx, s_tick(3200, 0.03), t, -24)
place(fx, s_blip(700, 0.25), 2.45, -20)
place(fx, s_downer(), 7.82, -9)
place(fx, S["whoosh-short"], 9.2, -15, -0.3)
place(fx, S["whoosh"], 9.5, -16, 0.3)
place(fx, s_ring(), 9.95, -17, 0.35)
place(fx, s_callend(), 11.32, -16, 0.35)
place(fx, S["whoosh"], 12.22, -12, 0.3)
place(fx, S["sparkle"], 12.4, -18, 0.3)
place(fx, S["whoosh-short"], 12.62, -16, 0.3)
for t in [13.0, 13.45, 16.65, 18.45, 20.3, 20.85, 21.4, 21.9, 22.45, 22.95, 23.4, 23.85, 31.85, 33.25, 34.55]:
    place(fx, S["pop"], t, -19, 0.3)
for t in [13.8, 13.9, 33.6, 33.7]:
    place(fx, S["click-soft"], t, -22, 0.3)
for t in [14.85, 16.4, 34.35]:
    place(fx, S["click"], t, -13, 0.3)
place(fx, S["whoosh-short"], 15.05, -18, -0.2)
place(fx, S["click-soft"], 15.65, -15, -0.3)
for t in [21.25, 22.3, 23.35, 24.25]:
    place(fx, s_blip(1568, 0.16), t, -19, -0.3)
place(fx, S["whoosh"], 24.45, -16, 0.4)
place(fx, S["whoosh-short"], 24.7, -18, 0.3)
for i in range(4):
    t = 25.3 + i * 0.24
    place(fx, S["whoosh-short"], t + 0.1, -23, 0.1)
    place(fx, s_tick(2200 + i * 180, 0.05), t + 0.62, -17, 0.3)
place(fx, S["chime"], 26.6, -12, 0.2)
place(fx, S["pop"], 27.0, -18, -0.2)
place(fx, S["whoosh"], 27.35, -17, 0.2)
place(fx, S["pop"], 28.05, -14, 0.3)
place(fx, s_blip(1175, 0.2), 28.1, -21, 0.3)
place(fx, S["click-soft"], 28.95, -20, 0.3)
place(fx, S["typing"][: int(0.85 * SR)] * fade(int(0.85 * SR), 0.02, 0.1)[:, None], 29.95, -21, 0.3)
place(fx, S["pop"], 30.8, -16, 0.3)
place(fx, S["whoosh"], 31.15, -17, 0.3)
place(fx, S["click"], 31.82, -15, -0.3)
place(fx, S["whoosh-short"], 32.95, -18, 0.0)
place(fx, s_bell(1046.5), 34.8, -15, -0.1)
place(fx, s_bell(1568.0), 34.92, -16, 0.1)
place(fx, S["whoosh"], 35.85, -16, -0.2)
for i in range(5):
    place(fx, s_blip(1318.5 + i * 90, 0.16), 36.45 + i * 0.5, -20, -0.6 + i * 0.3)
place(fx, S["whoosh-short"], 39.05, -17, 0.4)
for i in range(3):
    place(fx, S["pop"], 39.8 + i * 0.36, -18, 0.0)
place(fx, S["ping"], 42.25, -20, 0.2)
place(fx, S["impact-bass-1"], 43.62, -15)
place(fx, S["sparkle"], 43.7, -21)
place(fx, s_rise(1.6), cta_in - 1.6, -17)
place(fx, S["pop"], 48.1, -17)
place(fx, S["click-soft"], 48.92, -16)
place(fx, s_bell(1318.5, 1.4), 49.5, -17, -0.15)
place(fx, s_bell(1975.5, 1.4), 49.58, -19, 0.15)
place(fx, S["sparkle"], 49.52, -18)

# ---------------- levels + ducking ----------------
meter = pyln.Meter(SR)
L_vo = meter.integrated_loudness(vo_st[: int(47.5 * SR)])

# VO activity envelope (smoothed), used to duck the bed
act = np.abs(vo_st[:, 0])
act = sosfiltfilt(butter(2, 6, "low", fs=SR, output="sos"), act)
act = np.clip(act / (np.percentile(act[act > 1e-4], 60) + 1e-9), 0, 1)
act = sosfiltfilt(butter(1, 1.5, "low", fs=SR, output="sos"), act)
act = np.clip(act * 1.6, 0, 1)

L_bed = meter.integrated_loudness(bed[int(10 * SR) : int(43 * SR)])
target_under = L_vo - 16.5  # music under narration
g_under = target_under - L_bed
duck_extra = -3.0 * act  # deeper while words are present
tt_ax = np.arange(N) / SR
g = np.full(N, g_under) + duck_extra
# CTA opens up (no narration): lift the bed after the VO ends
lift_ramp = np.clip((tt_ax - 47.25) / 0.25, 0, 1)
g = g + lift_ramp * 9.0 * (1 - act)
bed_mixed = bed * db(g)[:, None].astype(np.float32)

mix = vo_st + bed_mixed + fx
L_mix = meter.integrated_loudness(mix)
mix *= db(-14.0 - L_mix)


# simple lookahead peak limiter to -1 dBFS (sample peak, 4x headroom margin)
def limiter(x, ceiling=db(-1.2), look=0.004, rel=0.08):
    peak = np.abs(x).max(1)
    need = np.minimum(1, ceiling / np.maximum(peak, 1e-9))
    la = int(look * SR)
    need = np.minimum.accumulate(need[::-1])[::-1] if False else need
    # running min over the lookahead window
    from scipy.ndimage import minimum_filter1d

    gmin = minimum_filter1d(need, size=2 * la + 1)
    out = np.empty_like(gmin)
    a = np.exp(-1 / (rel * SR))
    cur = 1.0
    for i in range(len(gmin)):
        v = gmin[i]
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return x * out[:, None]


mix = limiter(mix)
print(f"VO {L_vo:.1f} LUFS | bed under VO target {target_under:.1f} | master {meter.integrated_loudness(mix):.2f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS")

os.makedirs(os.path.join(A, "stems"), exist_ok=True)
scale = db(-14.0 - L_mix)
sf.write(os.path.join(A, "master_mix.wav"), mix.astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(A, "stems", "music_bed_ducked.wav"), (bed_mixed * scale).astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(A, "stems", "sfx.wav"), (fx * scale).astype(np.float32), SR, subtype="PCM_24")
sf.write(os.path.join(A, "stems", "vo.wav"), (vo_st * scale).astype(np.float32), SR, subtype="PCM_24")
print("wrote master_mix.wav + stems")
