"""
Synthesises the music bed and the SFX kit for the Piramal × DoubleTick film.

Deterministic (seeded) additive/subtractive synthesis with numpy/scipy — no samples, no network.
Music: ~112 BPM clean SaaS pulse (tight kick, sub pulse, plucks, soft pad, light texture) that
follows the film's arc; section boundaries come from the narration alignment.

    python3 scripts/generate_audio.py
"""
import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BPM = 112.0
BEAT = 60.0 / BPM
RNG = np.random.default_rng(7)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio")

narr = json.load(open(os.path.join(ROOT, "src", "data", "narration.json")))
WORDS = narr["words"]


def word_start(text, after=0.0):
    t = text.lower()
    for w in WORDS:
        if w["start"] >= after and w["text"].lower().strip(".,?!—") == t:
            return w["start"]
    raise KeyError(text)


# Section boundaries (seconds)
S_BUILD = word_start("piramal")  # 0–5.6 minimal pulse
S_FULL = word_start("that")  # rhythm builds until here
S_PEAK = word_start("automate", after=20)  # strongest section
S_CTA = word_start("book")  # simplify + resolve
TOTAL = min(30.5, narr["duration"] + 1.15)
N = int(TOTAL * SR)


# ---------------------------------------------------------------- helpers
def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def env_adsr(n, a=0.005, d=0.1, s=0.0, r=0.05, sus_time=0.0):
    a_n, d_n, s_n, r_n = int(a * SR), int(d * SR), int(sus_time * SR), int(r * SR)
    e = np.concatenate(
        [np.linspace(0, 1, max(a_n, 1)), np.linspace(1, s, max(d_n, 1)), np.full(s_n, s), np.linspace(s, 0, max(r_n, 1))]
    )
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    return e[:n]


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def place(buf, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def reverb_ir(dur=1.6, decay=3.2, bright=6000):
    n = int(dur * SR)
    ir = RNG.standard_normal(n) * np.exp(-np.arange(n) / SR * decay)
    ir = lp(ir, bright)
    ir[0] = 0
    return ir / np.sqrt(np.sum(ir**2))


IR = reverb_ir()


def verb(x, mix=0.2):
    return x + fftconvolve(x, IR)[: len(x)] * mix


# ---------------------------------------------------------------- instruments
def kick(level=1.0, tight=1.0):
    t = t_arr(0.42)
    f = 46 + 90 * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 9 * tight)
    click = hp(RNG.standard_normal(len(t)), 3000) * np.exp(-t * 400) * 0.25
    return (body + click) * level


def hat(open_=False):
    t = t_arr(0.18 if open_ else 0.06)
    n = hp(RNG.standard_normal(len(t)), 7500, 4)
    return n * np.exp(-t * (18 if open_ else 70)) * 0.35


def clap():
    t = t_arr(0.3)
    n = bp(RNG.standard_normal(len(t)), 900, 2600)
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) * (60 if k < 2 else 16)) * (0.6 if k < 2 else 1)
    return verb(n * e * 0.5, 0.25)


def pluck(freq, dur=0.32, bright=1.0):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for k in range(1, 14):
        if freq * k > 12000:
            break
        amp = (1.0 / k) * (0.6 if k % 2 == 0 else 1.0)
        out += amp * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (7 + k * 3.2 / bright))
    out *= np.minimum(1, t / 0.002)
    return out * 0.32


def sub(freq, dur):
    t = t_arr(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(2 * np.pi * freq * 2 * t)
    return s * env_adsr(len(t), 0.004, dur * 0.7, 0.35, dur * 0.25) * 0.5


def pad_chord(freqs, dur):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            for k in range(1, 7):
                out += (1 / k**1.6) * np.sin(2 * np.pi * ff * k * t + RNG.uniform(0, 6.28))
    e = env_adsr(len(t), 0.35, 0.2, 0.85, 0.5, max(0, dur - 1.05))
    return lp(out * e, 2400) * 0.04


# ---------------------------------------------------------------- music
def build_music():
    L = np.zeros(N)
    R = np.zeros(N)
    drums = np.zeros(N)
    bass = np.zeros(N)
    plucks = np.zeros(N)
    pad = np.zeros(N)
    side = np.ones(N)  # sidechain gain

    # Cmaj9 – Am9 – Fmaj7 – Gsus/G  (one chord per bar)
    chords = [
        (48, [60, 64, 67, 71, 74]),
        (45, [57, 60, 64, 67, 71]),
        (41, [57, 60, 64, 65, 69]),
        (43, [55, 60, 62, 67, 71]),
    ]
    bar = BEAT * 4
    n_bars = int(np.ceil(TOTAL / bar)) + 1

    for b in range(n_bars):
        t0 = b * bar
        if t0 >= TOTAL:
            break
        root, tones = chords[b % 4]
        in_cta = t0 >= S_CTA - 0.05
        end_bar = in_cta and b == int((S_CTA + 0.05) // bar) + 0
        for beat in range(4):
            tb = t0 + beat * BEAT
            if tb >= TOTAL:
                break
            sec = (
                "cta" if tb >= S_CTA - 0.02 else
                "peak" if tb >= S_PEAK - 0.02 else
                "full" if tb >= S_FULL - 0.02 else
                "build" if tb >= S_BUILD - 0.02 else
                "intro"
            )
            # Kick
            if sec == "intro":
                place(drums, lp(kick(0.55, 1.3), 900), tb)
            elif sec in ("build", "full", "peak"):
                place(drums, kick(0.9 if sec != "build" else 0.8), tb)
            # Sidechain dip on every kick
            if sec in ("build", "full", "peak", "intro"):
                i = int(tb * SR)
                dip = 1 - 0.55 * np.exp(-np.arange(int(0.25 * SR)) / SR * 14)
                j = min(N, i + len(dip))
                side[i:j] = np.minimum(side[i:j], dip[: j - i])
            # Hats
            if sec in ("build", "full", "peak"):
                place(drums, hat(), tb + BEAT / 2, 0.8)
            if sec in ("full", "peak"):
                place(drums, hat(), tb, 0.35)
            if sec == "peak":
                place(drums, hat(), tb + BEAT / 4, 0.3)
                place(drums, hat(), tb + 3 * BEAT / 4, 0.3)
                if beat == 3:
                    place(drums, hat(True), tb + BEAT / 2, 0.5)
            # Clap on 2 & 4
            if sec in ("full", "peak") and beat in (1, 3):
                place(drums, clap(), tb, 0.55 if sec == "full" else 0.7)
            # Sub pulse (8ths), silent in intro except a soft root on 1
            if sec == "intro":
                if beat == 0:
                    place(bass, sub(midi(root), bar * 0.9), tb, 0.5)
            elif sec != "cta":
                for h in (0, 0.5):
                    f = midi(root + (12 if sec == "peak" and beat == 3 and h else 0))
                    place(bass, sub(f, BEAT * 0.45), tb + h * BEAT, 0.7 if sec == "build" else 0.85)
            # Plucks: arpeggio density grows with the arc
            pattern = {
                "intro": [0],
                "build": [0, 2],
                "full": [0, 1, 2, 3],
                "peak": [0, 1, 2, 3],
                "cta": [0, 2],
            }[sec]
            step = BEAT / 4 if sec in ("full", "peak") else BEAT / 2
            for k, s in enumerate(pattern):
                tt = tb + s * step
                note = tones[(b * 3 + beat * 2 + k) % len(tones)] + (12 if sec == "peak" and k % 2 else 0)
                gain = {"intro": 0.35, "build": 0.55, "full": 0.6, "peak": 0.7, "cta": 0.5}[sec]
                place(plucks, pluck(midi(note), 0.3, 1.2 if sec == "peak" else 1.0), tt, gain)
        # Pad from build onward; CTA gets the resolving Cmaj9 held to the end
        if t0 >= S_BUILD - bar and not in_cta:
            place(pad, pad_chord([midi(n) for n in tones[:4]], bar + 0.4), t0, 0.8 if t0 < S_FULL else 1.0)

    # CTA: resolve on Cmaj9, let it ring
    t_res = S_CTA + 0.02
    place(pad, pad_chord([midi(n) for n in [48, 60, 64, 67, 71, 74]], TOTAL - t_res + 0.3), t_res, 1.4)
    place(bass, sub(midi(36), 2.2), t_res, 0.7)
    place(drums, lp(kick(0.7, 0.7), 1500), t_res)
    for k, n in enumerate([72, 76, 79, 83, 86]):
        place(plucks, pluck(midi(n), 0.9, 0.8), t_res + 0.08 * k, 0.45)

    # Light digital texture: filtered noise with slow movement
    tex = bp(RNG.standard_normal(N), 3500, 9000) * 0.006
    tex *= 0.5 + 0.5 * np.sin(2 * np.pi * np.arange(N) / SR * 0.25)

    # Plucks → dotted-8th ping-pong delay for width
    d = int(BEAT * 0.75 * SR)
    pl_l = plucks.copy()
    pl_r = np.zeros(N)
    fb = plucks.copy()
    for rep in range(3):
        fb = np.concatenate([np.zeros(d), fb[:-d]]) * 0.38
        if rep % 2 == 0:
            pl_r += lp(fb, 5000)
        else:
            pl_l += lp(fb, 4500)

    pad_v = verb(pad, 0.5) * side
    bass_s = lp(bass, 400) * side
    L = drums * 0.9 + bass_s + verb(pl_l, 0.25) * side * 0.9 + pad_v + tex
    R = drums * 0.9 + bass_s + verb(pl_r + plucks * 0.75, 0.25) * side * 0.9 + pad_v * 0.97 + tex[::-1]

    mix = np.stack([L, R], 1)
    mix = np.tanh(mix * 1.4) / 1.4  # gentle glue
    # Master: fade in/out, normalise RMS to about -20 dBFS (the film ducks it further under VO)
    fade = np.ones(N)
    fade[: int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR))
    fade[-int(0.9 * SR):] = np.linspace(1, 0, int(0.9 * SR)) ** 1.5
    mix *= fade[:, None]
    rms = np.sqrt(np.mean(mix**2))
    mix *= 10 ** (-20 / 20) / rms
    peak = np.abs(mix).max()
    if peak > 0.89:
        mix *= 0.89 / peak
    return mix


# ---------------------------------------------------------------- SFX
def sfx_kit():
    kit = {}
    # Soft low impact
    t = t_arr(0.9)
    f = 42 + 50 * np.exp(-t * 22)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)
    air = lp(RNG.standard_normal(len(t)), 700) * np.exp(-t * 12) * 0.35
    kit["low_hit"] = verb(body + air, 0.3)
    # Muted ticks
    t = t_arr(0.06)
    kit["tick"] = bp(RNG.standard_normal(len(t)), 1800, 4200) * np.exp(-t * 110) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) * 0.3
    kit["tick_b"] = bp(RNG.standard_normal(len(t)), 1200, 3000) * np.exp(-t * 100) + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90) * 0.3
    # Node activation tick (higher, cleaner)
    t = t_arr(0.12)
    kit["node"] = np.sin(2 * np.pi * 1320 * t) * np.exp(-t * 45) * 0.6 + np.sin(2 * np.pi * 2640 * t) * np.exp(-t * 70) * 0.2
    # Digital sweep (noise band rising)
    t = t_arr(0.6)
    noise = RNG.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = len(t) // 24
    for k in range(24):
        c = 400 * (6000 / 400) ** (k / 23)
        chunk = bp(noise, c * 0.7, min(c * 1.4, 20000))[k * seg:(k + 1) * seg]
        out[k * seg:(k + 1) * seg] = chunk
    glide = np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / t[-1]) ** 2) / SR) * 0.15
    e = np.sin(np.pi * np.clip(t / t[-1], 0, 1)) ** 1.5
    kit["sweep"] = verb((out * 0.8 + glide) * e, 0.3)
    kit["sweep_soft"] = lp(kit["sweep"], 3000) * 0.8
    # Interface activation: two soft rising blips
    t = t_arr(0.35)
    a = np.sin(2 * np.pi * midi(76) * t) * np.exp(-t * 14)
    b_ = np.zeros(len(t))
    i = int(0.07 * SR)
    b_[i:] = np.sin(2 * np.pi * midi(83) * t[: len(t) - i]) * np.exp(-t[: len(t) - i] * 12)
    kit["activate"] = verb((a + b_) * 0.45, 0.3)
    # Connection chime
    t = t_arr(1.1)
    ch = sum(np.sin(2 * np.pi * midi(n) * t) * np.exp(-t * dcy) * g for n, dcy, g in [(84, 4, 0.5), (91, 5, 0.3), (96, 7, 0.15)])
    kit["chime"] = verb(ch * np.minimum(1, t / 0.004) * 0.6, 0.4)
    # Message pops
    t = t_arr(0.12)
    f = 520 + 520 * np.exp(-t * 60)
    kit["pop"] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38) * 0.7
    f = 620 + 680 * np.exp(-t * 60)
    kit["pop_out"] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40) * 0.7
    # Data ping
    t = t_arr(0.7)
    p = np.sin(2 * np.pi * 2093 * t) * np.exp(-t * 16) * 0.4 + np.sin(2 * np.pi * 3136 * t) * np.exp(-t * 24) * 0.15
    echo = np.concatenate([np.zeros(int(0.11 * SR)), p[: -int(0.11 * SR)]]) * 0.35
    kit["ping"] = verb(p + echo, 0.3)
    # Routing swoosh (band moves up then settles)
    t = t_arr(0.5)
    noise = RNG.standard_normal(len(t))
    lo = bp(noise, 600, 1600)
    hi = bp(noise, 2200, 6000)
    m = (t / t[-1])
    sw = (lo * (1 - m) + hi * m) * np.sin(np.pi * m) ** 2
    kit["swoosh"] = verb(sw * 0.9, 0.3)
    kit["swoosh_soft"] = lp(kit["swoosh"], 2500) * 0.7
    # Tonal text sweep
    t = t_arr(0.4)
    f = 280 * 2 ** (t / t[-1])
    ton = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]) ** 2 * 0.3
    kit["tonal"] = verb(ton + lp(RNG.standard_normal(len(t)), 1800) * np.sin(np.pi * t / t[-1]) ** 2 * 0.15, 0.35)
    # Low whoosh for typography transformations
    t = t_arr(0.55)
    wh = lp(RNG.standard_normal(len(t)), 900) * np.sin(np.pi * t / t[-1]) ** 2
    sub_ = np.sin(2 * np.pi * np.cumsum(90 - 40 * t / t[-1]) / SR) * np.sin(np.pi * t / t[-1]) ** 2 * 0.3
    kit["whoosh_low"] = verb(wh * 0.9 + sub_, 0.3)
    # CTA impact + shimmer
    t = t_arr(1.0)
    f = 48 + 60 * np.exp(-t * 26)
    imp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + bp(RNG.standard_normal(len(t)), 200, 1200) * np.exp(-t * 30) * 0.4
    kit["cta_impact"] = verb(imp, 0.3)
    t = t_arr(1.6)
    sh = np.zeros(len(t))
    for k, n in enumerate([96, 100, 103, 107, 108]):
        i = int(k * 0.045 * SR)
        tt = t[: len(t) - i]
        sh[i:] += np.sin(2 * np.pi * midi(n) * tt) * np.exp(-tt * 3.5) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt)) * 0.18
    kit["shimmer"] = verb(sh, 0.55)
    return kit


def write(path, x):
    x = np.asarray(x, dtype=np.float64)
    peak = np.abs(x).max()
    if x.ndim == 1:
        x = x / max(peak, 1e-9) * 0.7  # SFX normalised; per-cue gain is set in src/lib/sfx.ts
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "sfx"), exist_ok=True)
    print(f"Sections: build {S_BUILD:.2f}s, full {S_FULL:.2f}s, peak {S_PEAK:.2f}s, cta {S_CTA:.2f}s, total {TOTAL:.2f}s")
    write(os.path.join(OUT, "music.wav"), build_music())
    for name, sig in sfx_kit().items():
        write(os.path.join(OUT, "sfx", f"{name}.wav"), sig)
    print("Wrote music.wav and", len(os.listdir(os.path.join(OUT, "sfx"))), "SFX")
