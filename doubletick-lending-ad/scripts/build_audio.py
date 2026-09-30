"""Build the music + SFX bed for the DoubleTick lending ad.

Everything here is synthesised (seeded, deterministic) except a handful of
bundled Pixabay-licensed UI SFX from the HyperFrames media-use library. The bed
is sidechain-ducked against the supplied voiceover so every word stays clear.
The voiceover itself is never altered by this script.

Usage:  python3 scripts/build_audio.py  (needs numpy, scipy, ffmpeg on PATH)
Writes: assets/audio/music-sfx.wav
"""

import os
import re
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 43.5
N = int(SR * DUR)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SFX_DIR = os.environ.get("SFX_DIR", os.path.expanduser("~/.claude/skills/media-use/audio/assets/sfx"))
rng = np.random.default_rng(20260930)


def db(x):
    return 10 ** (x / 20)


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "quiet", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def lufs(buf):
    tmp = os.path.join(ROOT, ".lufs_tmp.wav")
    write_wav(tmp, buf)
    out = subprocess.run(["ffmpeg", "-i", tmp, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    os.remove(tmp)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)
    return float(m[-1])


def write_wav(path, buf):
    b = np.clip(buf, -1, 1)
    pcm = (b * 32767).astype("<i2")
    import wave

    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x, axis=0)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x, axis=0)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x, axis=0)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def place(dst, src, t, gain=1.0, pan=0.0):
    """Mix mono (1-D) or stereo src into dst at time t."""
    i = int(round(t * SR))
    if i >= len(dst):
        return
    if src.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        src = np.stack([src * l * 1.414, src * r * 1.414], axis=1)
    n = min(len(src), len(dst) - i)
    dst[i : i + n] += src[:n] * gain


def env_ad(n, a, d):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / d))
    return e


# ---------------------------------------------------------------- instruments
def kick(vel=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = hp(rng.standard_normal(n) * np.exp(-t / 0.004), 1800) * 0.25
    return (body + click) * vel


def hat(vel=1.0, decay=0.035):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7000, 3) * np.exp(-t / decay)
    return x * vel * 0.5


def clap(vel=1.0):
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018]):
        e += np.where(t >= off, np.exp(-(t - off) / (0.006 if k < 2 else 0.09)), 0)
    return bp(rng.standard_normal(n), 900, 4200) * e * vel * 0.5


def bass_note(freq, length, vel=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, 6))
    x = lp(x, 520)
    e = env_ad(n, 0.006, length * 0.55)
    return x * e * vel * 0.55


def pluck(freq, vel=1.0, decay=0.22):
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.1 * np.sin(2 * np.pi * freq * 3.01 * t)
    return x * env_ad(n, 0.003, decay) * vel * 0.3


def pad(freqs, length, vel=1.0, att=0.6, rel=0.9, cutoff=1400):
    n = int(length * SR)
    t = np.arange(n) / SR
    L = np.zeros(n)
    R = np.zeros(n)
    for f in freqs:
        for det, side in ((-0.18, 0), (0.18, 1)):
            ff = f * 2 ** (det / 12 / 8)
            w = 2 * np.pi * ff * t
            v = np.sin(w) + 0.22 * np.sin(2 * w) + 0.08 * np.sin(3 * w)
            if side == 0:
                L += v
            else:
                R += v
    e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (length - t) / rel))
    x = np.stack([L * e, R * e], axis=1) / (len(freqs) * 2)
    return lp(x, cutoff) * vel


def reverb(x, secs=1.6, wet=0.22):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (secs / 5))[:, None]
    ir = lp(ir, 6000)
    ir /= np.sqrt((ir**2).sum(axis=0))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - wet) + y * wet


# ---------------------------------------------------------------- music
def build_music():
    m = np.zeros((N, 2))
    drums = np.zeros((N, 2))

    # A) Problem 0–6.9: tense minor pad + soft heartbeat sub pulse
    place(m, pad([midi(45), midi(52), midi(57), midi(60)], 7.2, 0.9, att=0.25, rel=0.6, cutoff=900), 0.0)
    for k in range(14):
        t = k * 0.5
        if t > 6.6:
            break
        place(drums, kick(0.45 if k % 2 == 0 else 0.28), t)
    # B) Question 6.9–9.9: suspended pad, hush + riser
    place(m, pad([midi(41), midi(48), midi(55), midi(57)], 3.3, 0.8, att=0.4, rel=0.4, cutoff=1100), 6.85)
    rn = int(1.2 * SR)
    tt = np.arange(rn) / SR
    riser = bp(rng.standard_normal(rn), 800, 6000) * (tt / 1.2) ** 2.5 * 0.35
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 900 * (tt / 1.2) ** 2) / SR) * (tt / 1.2) ** 3 * 0.08
    place(m, riser + sweep, 8.72)

    # C–E) Solution groove from 9.9 (120 BPM, bar = 2 s)
    g0 = 9.9
    beat = 0.5
    prog = [  # (bass midi, chord midi)
        (48, [60, 64, 67, 71]),  # Cmaj7
        (43, [59, 62, 67, 69]),  # G6/B-ish
        (45, [57, 60, 64, 67]),  # Am7
        (41, [57, 60, 65, 69]),  # Fmaj7
    ]
    t = g0
    bar = 0
    end_groove = 40.4
    while t < 37.3:
        bass_m, chord = prog[bar % 4]
        place(m, pad([midi(c) for c in chord], 2.15, 0.75, att=0.08, rel=0.3, cutoff=1800), t)
        section = "C" if t < 26.0 else ("D" if t < 31.0 else "E")
        for b in range(4):
            bt = t + b * beat
            place(drums, kick(0.85), bt)
            if section != "D" or b % 2 == 1:
                place(drums, hat(0.55), bt + beat / 2, pan=0.25)
            if section == "E":
                place(drums, hat(0.14, 0.02), bt + beat / 4, pan=-0.3)
                place(drums, hat(0.14, 0.02), bt + 3 * beat / 4, pan=-0.3)
            if section in ("D", "E") and b in (1, 3):
                place(drums, clap(0.4 if section == "D" else 0.32), bt)
            # bass: 8th pulse
            for e8 in range(2):
                place(m, bass_note(midi(bass_m - 12 + (12 if (b == 3 and e8 == 1) else 0)), 0.22, 0.9 if e8 == 0 else 0.6), bt + e8 * beat / 2)
        # arpeggio plucks (16ths, sparse)
        arp = [chord[0] + 12, chord[2] + 12, chord[1] + 12, chord[3] + 12]
        for s16 in range(16):
            if s16 % 4 == 3 and section == "C":
                continue
            f = midi(arp[s16 % 4] + (12 if section == "E" and s16 % 8 == 6 else 0))
            place(m, pluck(f, 0.5 if s16 % 4 == 0 else 0.32), t + s16 * beat / 4, pan=(-0.35 if s16 % 2 else 0.35))
        t += 2.0
        bar += 1

    # F) Resolution 37.3 → end: C add9 chord, groove continues lightly to CTA then rings out
    place(m, pad([midi(48), midi(55), midi(62), midi(64), midi(67)], 6.3, 1.35, att=0.05, rel=2.2, cutoff=2400), 37.3)
    for k in range(int((end_groove - 37.3) / beat)):
        bt = 37.3 + k * beat
        place(drums, kick(0.7 if k % 2 == 0 else 0.5), bt)
        place(drums, hat(0.4), bt + beat / 2, pan=0.25)
        place(m, bass_note(midi(36), 0.22, 0.7), bt)
    for k, n_ in enumerate([72, 76, 79, 83, 84]):
        place(m, pluck(midi(n_), 0.6, 0.5), 40.42 + k * 0.12, pan=(-0.3 + 0.15 * k))
    place(m, pad([midi(36), midi(43), midi(52), midi(55), midi(62)], 3.1, 1.6, att=0.1, rel=2.4, cutoff=1600), 40.4)

    m = reverb(m, 1.8, 0.28)
    drums = hp(drums, 30)
    mix = m + drums * 0.9
    # gentle glue + fade
    fade = np.ones(N)
    fo = int(1.0 * SR)
    fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
    fi = int(0.02 * SR)
    fade[:fi] = np.linspace(0, 1, fi)
    return mix * fade[:, None]


# ---------------------------------------------------------------- SFX
def tick(freq=2200, vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.008) * vel * 0.5


def blip(f0, f1, length=0.12, vel=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (t / length)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.004, length / 3) * vel * 0.5


def tone2(fa, fb, vel=1.0):
    a = blip(fa, fa, 0.14, vel)
    b = blip(fb, fb, 0.2, vel)
    out = np.zeros(len(a) + len(b) + int(0.02 * SR))
    out[: len(a)] += a
    out[len(a) + int(0.02 * SR) :] += b
    return out


def sweep(length, up=True, vel=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    # moving band: approximate by crossfading two filtered versions
    lo = bp(x, 400, 1500)
    hi = bp(x, 2500, 9000)
    k = t / length if up else 1 - t / length
    e = np.sin(np.pi * t / length) ** 1.5
    return (lo * (1 - k) + hi * k) * e * vel * 0.35


def upload_prog(length=0.28, vel=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 600 + 900 * (t / length)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.3 + 0.7 * t / length) * np.minimum(1, (length - t) / 0.03) * vel * 0.12


def voice_bed(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 200, 900) * (0.5 + 0.5 * np.abs(np.sin(t * 7.3)))
    e = np.minimum(1, t / 0.3) * np.minimum(1, (length - t) / 0.3)
    return x * e * 0.05


def build_sfx():
    s = np.zeros((N, 2))
    lib = {}

    def L(name):
        if name not in lib:
            lib[name] = decode(os.path.join(SFX_DIR, name + ".mp3"))
        return lib[name]

    def F(name, t, g_db, cut=None, pan=0.0):
        x = L(name)
        if cut:
            x = lp(x, cut)
        place(s, x, t, db(g_db))

    # Scene 1 — lost opportunity
    F("notification", 0.02, -12)
    tick_times = [0.35 + 4.2 * (sec / 60) ** (1 / 2.2) for sec in range(5, 61, 5)]
    for i, tt in enumerate(tick_times):
        place(s, tick(1900 + i * 40, 0.35 + 0.03 * i), tt)
    place(s, blip(700, 520, 0.2, 0.35), 2.95)  # cooling
    F("whoosh-short", 2.55, -26)
    F("whoosh-short", 4.5, -24, cut=4000)
    F("impact-bass-1", 5.9, -21, cut=900)  # muted impact on "gone"
    place(s, blip(420, 180, 0.35, 0.3), 5.9)
    F("whoosh", 6.68, -26, cut=5000)
    # Scene 2
    place(s, blip(520, 260, 0.4, 0.25), 8.62)  # lead drops out
    # Scene 3 — AI Voice
    F("pop", 9.74, -18)
    F("pop", 9.96, -20)
    for k, tt in enumerate([10.0, 10.27, 10.53]):
        place(s, tick(2600, 0.35), tt)
    place(s, tone2(880, 1320, 0.45), 10.8)  # call initiation
    F("whoosh-short", 10.84, -22)
    place(s, tone2(660, 990, 0.25), 11.0)
    place(s, tone2(660, 990, 0.22), 11.35)
    place(s, blip(1200, 1600, 0.1, 0.4), 11.52)  # connected
    place(s, voice_bed(3.2), 11.5)
    for tt in (12.98, 13.48, 13.98):
        place(s, tick(3100, 0.5), tt)
        place(s, blip(900, 1400, 0.08, 0.2), tt + 0.02)
    F("click-soft", 14.3, -14)
    place(s, blip(1500, 1500, 0.1, 0.25), 14.34)
    # Scene 4 — voice -> chat
    F("whoosh-short", 14.7, -20)
    F("pop", 15.12, -22)
    F("pop", 15.4, -17)
    F("whoosh-short", 16.38, -24)
    F("click", 16.9, -17)
    F("sparkle", 16.92, -30)
    # Scene 5 — documents + underwriting
    F("pop", 18.62, -17)
    F("click-soft", 19.06, -12)
    F("whoosh-short", 19.12, -25)
    for i in range(3):
        place(s, upload_prog(0.3, 1.0), 19.5 + i * 0.3)
        place(s, tick(2400 + i * 200, 0.45), 19.78 + i * 0.3)
    F("click", 20.4, -13)
    F("whoosh-short", 20.56, -27)
    F("chime", 20.86, -12)
    place(s, sweep(0.55, True, 0.8), 21.4)  # sync sweep out
    place(s, sweep(0.5, False, 0.7), 22.6)  # data back
    F("ping", 22.58, -17)
    F("pop", 22.98, -18)
    # Scene 6 — follow-up
    F("pop", 23.9, -20)
    F("sparkle", 24.4, -26)
    place(s, blip(800, 1300, 0.12, 0.35), 24.42)
    place(s, tone2(880, 1320, 0.35), 24.8)
    F("whoosh-short", 26.0, -28)
    # Scene 7 — RM handoff
    place(s, blip(1300, 1700, 0.08, 0.35), 26.24)  # sent
    F("pop", 26.72, -21)
    F("chime", 27.6, -10)
    for i in range(4):
        place(s, tick(2000 + 150 * i, 0.3), 28.9 + i * 0.24)
    place(s, sweep(0.6, True, 0.5), 28.8)  # CRM sync
    F("pop", 30.02, -17)
    # Scene 8 — journey
    F("whoosh", 30.95, -24)
    for i, tt in enumerate([31.4, 31.96, 32.44, 33.0, 33.58, 34.34]):
        place(s, pluck(midi(72 + [0, 2, 4, 7, 9, 12][i]), 0.38, 0.3), tt, pan=-0.5 + i * 0.2)
    F("riser", 36.3, -30, cut=5000)
    # Scene 9 — brand + CTA
    F("whoosh-cinematic", 37.05, -26)
    F("impact-bass-2", 37.35, -25, cut=1200)
    F("pop", 40.42, -18)
    F("click", 41.42, -12)
    F("sparkle", 41.46, -27)
    return s


def voice_envelope():
    vo = decode(os.path.join(ROOT, "assets/audio/voiceover.mp3")).mean(axis=1)
    vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(vo**2, np.ones(win) / win, mode="same") + 1e-12)
    lvl = 20 * np.log10(rms)
    active = np.clip((lvl + 48) / 14, 0, 1)  # 0 below -48 dB, 1 above -34 dB
    # attack 40 ms / release 380 ms smoothing
    blk = 32
    a = np.exp(-blk / (0.04 * SR))
    r = np.exp(-blk / (0.38 * SR))
    out = np.zeros(N)
    y = 0.0
    for i in range(0, N, blk):
        x = active[i : i + blk].max()
        c = a if x > y else r
        y = x + (y - x) * c
        out[i : i + blk] = y
    return out


def main():
    music = build_music()
    sfx = build_sfx()
    duck = voice_envelope()

    vo_lufs = lufs(decode(os.path.join(ROOT, "assets/audio/voiceover.mp3")))
    m_lufs = lufs(music)
    # music sits ~14 dB under the VO before ducking; ducking takes another ~7 dB under words
    g_music = db((vo_lufs - 13.0) - m_lufs)
    music_g = music * g_music * (1 - (1 - db(-7)) * duck)[:, None]
    # voice carve: gently thin the bed in the 1–4 kHz speech band while talking
    band = bp(music_g, 1000, 4000)
    music_g = music_g - band * (0.5 * duck)[:, None]
    sfx_g = sfx * db(-9) * (1 - (1 - db(-3)) * duck)[:, None]
    bed = music_g + sfx_g
    peak = np.abs(bed).max()
    if peak > 0.9:
        bed *= 0.9 / peak
    out = os.path.join(ROOT, "assets/audio/music-sfx.wav")
    write_wav(out, bed)
    print(f"VO {vo_lufs:.1f} LUFS | music raw {m_lufs:.1f} LUFS | bed {lufs(bed):.1f} LUFS | peak {20*np.log10(np.abs(bed).max()):.1f} dBFS")
    print("wrote", out)


if __name__ == "__main__":
    sys.exit(main())
