#!/usr/bin/env python3
"""Deterministic soundtrack build for the DoubleTick BFSI film.

Writes three stems that index.html mounts as <audio> tracks:
  assets/vo_guide.wav       guide VO, loudness-normalised (replace with the master VO)
  assets/music/bed.wav      synthesized fintech pulse bed, ducked under the VO
  assets/sfx/sfx_stem.wav   every sound effect, placed on the picture's timing

All timings derive from V (the VO line starts) exactly as in index.html, so
re-timing for the supplied master voiceover means editing V in both files and
re-running:  python3 audio/build_audio.py [--vo path/to/master.wav]
"""

import argparse
import os

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
END = 36.4
N = int(SR * END)
V = [0.06, 3.81, 8.61, 14.54, 21.35, 25.35, 30.67, 31.87]
# per-scene time scale (master VO line lengths vs the guide read) — mirrors index.html
K3, K4, K5, K7, K9 = 5.93 / 6.35, 6.81 / 7.25, 4.0 / 4.8, 5.32 / 5.6, 1.2 / 1.45
FREEZE, REDIRECT = 7.86, 8.16
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RNG = np.random.default_rng(20261001)


# ----------------------------------------------------------------- helpers
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env_ad(dur, a, d, curve=4.0):
    t = t_axis(dur)
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / max(d, 1e-4) * curve / 4.0))
    return e


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def noise(dur):
    return RNG.standard_normal(int(dur * SR))


def place(bus, sig, t, gain=1.0, pan=0.0):
    """Add mono or stereo sig into stereo bus at time t (seconds)."""
    i = int(round(t * SR))
    if i >= bus.shape[0]:
        return
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], axis=1)
    n = min(sig.shape[0], bus.shape[0] - i)
    if i < 0:
        sig = sig[-i:]
        i = 0
        n = min(sig.shape[0], bus.shape[0])
    bus[i : i + n] += sig[:n] * gain


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def reverb_ir(dur=2.2, damp=4500):
    t = t_axis(dur)
    irs = []
    for _ in range(2):
        n = RNG.standard_normal(t.size) * np.exp(-t * 3.2)
        n = lp(n, damp)
        n[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        irs.append(n / np.sqrt(np.sum(n**2)))
    return np.stack(irs, axis=1)


def reverb(x, ir, wet):
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = fftconvolve(x[:, c], ir[:, c])[: x.shape[0]]
    return x + out * wet


# ------------------------------------------------------------ instruments
def pad_note(f, dur, cutoff, detune=0.07):
    t = t_axis(dur)
    sig = np.zeros_like(t)
    kmax = int(min(7000 / f, 40))
    for v, cents in enumerate((-7, 0, 7)):
        ff = f * 2 ** (cents / 1200)
        ph = RNG.uniform(0, 2 * np.pi)
        for k in range(1, kmax + 1):
            a = (1 / k) / np.sqrt(1 + (k * ff / cutoff) ** 4)
            sig += a * np.sin(2 * np.pi * k * ff * t + ph * k)
    return sig / 3


def pad_chord(notes, dur, cutoff, att=0.35, rel=0.6):
    total = dur + rel
    t = t_axis(total)
    e = np.clip(t / att, 0, 1) * np.clip((total - t) / rel, 0, 1)
    out = np.zeros((t.size, 2))
    for j, m in enumerate(notes):
        s = pad_note(midi(m), total, cutoff) * e
        pan = (-0.5 + j / max(1, len(notes) - 1)) * 0.7
        out[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
        out[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
    return out / len(notes)


def pluck(f, dur=0.6):
    t = t_axis(dur)
    s = np.zeros_like(t)
    for k in range(1, 9):
        s += (0.6**k) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (7 + 5 * k))
    return s * np.clip(t / 0.002, 0, 1)


def bass_note(f, dur):
    t = t_axis(dur)
    e = np.clip(t / 0.008, 0, 1) * np.exp(-t * 3.0) * np.clip((dur - t) / 0.03, 0, 1)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)) * e


def kick(soft=1.0):
    t = t_axis(0.45)
    f = 46 + 95 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(noise(0.45), 2500) * np.exp(-t * 400) * 0.25
    return (s + click) * soft


def clap():
    d = 0.32
    t = t_axis(d)
    n = bp(noise(d), 900, 4200)
    e = np.zeros_like(t)
    for off in (0.0, 0.011, 0.022):
        e += np.where(t >= off, np.exp(-(t - off) * 55), 0)
    e += np.exp(-t * 14) * 0.35
    return n * e * 0.5 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.2


def hat(open_=False):
    d = 0.18 if open_ else 0.06
    t = t_axis(d)
    n = hp(noise(d), 7500, 3)
    return n * np.exp(-t * (18 if open_ else 70))


def shaker():
    d = 0.09
    t = t_axis(d)
    n = bp(noise(d), 4500, 10000)
    return n * np.clip(t / 0.02, 0, 1) * np.exp(-t * 40)


# ------------------------------------------------------------------ music
def build_music(vo_env):
    bus = np.zeros((N, 2))
    pad_bus = np.zeros((N, 2))
    drum_bus = np.zeros((N, 2))

    beat = (V[7] - V[2]) / 44  # ~113.5 BPM, downbeats on the solution and the CTA
    bar = beat * 4
    g0 = V[2] - 4 * bar  # ≈0.15s: the groove starts immediately
    prog = [
        (43, [59, 62, 66, 69]),  # Gmaj9
        (42, [57, 62, 64, 69]),  # D/F#
        (47, [57, 62, 66, 73]),  # Bm9
        (45, [59, 64, 69, 71]),  # Asus2
    ]

    def sec(t):
        if t < V[1]:
            return "s1"
        if t < V[2]:
            return "s2"
        if t < V[3]:
            return "s3"
        if t < V[4]:
            return "s4"
        if t < V[5]:
            return "s5"
        if t < V[5] + 4.2 * K7:
            return "s7"
        if t < V[6]:
            return "s8"
        if t < V[7]:
            return "s9"
        return "cta"

    # pads, chord per bar
    nbar = int((V[6] - g0) / bar) + 1
    for b in range(nbar):
        t0 = g0 + b * bar
        if t0 >= V[6] - 0.05:
            break
        root, notes = prog[b % 4]
        s = sec(max(t0, 0))
        cutoff = {"s1": 1300, "s2": 700, "s3": 1900, "s4": 2200, "s5": 2600, "s7": 3200, "s8": 2400}.get(s, 2000)
        gain = {"s1": 0.55, "s2": 0.42, "s3": 0.6, "s4": 0.6, "s5": 0.65, "s7": 0.72, "s8": 0.6}.get(s, 0.6)
        dur = min(bar, V[6] - t0)
        place(pad_bus, pad_chord(notes, dur, cutoff), t0, gain)
        if s == "s7":  # open the harmonic layer an octave up
            place(pad_bus, pad_chord([n + 12 for n in notes[1:]], dur, 4200, att=0.5), t0, 0.28)
        # bass
        if s in ("s3", "s4", "s5", "s7"):
            for k in range(8):
                tb = t0 + k * beat / 2
                if tb >= V[6] - 0.1:
                    break
                f = midi(root - 12 if k % 4 != 3 else root)
                place(bus, bass_note(f, beat / 2 * 0.92), tb, 0.36)
        elif s == "s1":
            for k in range(4):
                place(bus, bass_note(midi(root - 12), beat * 0.5), t0 + k * beat, 0.22)

    # scene 2: strip back — low drone that holds through the freeze
    td = V[1]
    dd = V[2] - td
    t = t_axis(dd)
    drone = (np.sin(2 * np.pi * midi(31) * t) + 0.5 * np.sin(2 * np.pi * midi(43) * t) + 0.2 * np.sin(2 * np.pi * midi(50) * t))
    drone *= np.clip(t / 0.6, 0, 1) * np.clip((dd - t) / 0.2, 0, 1) * 0.16
    place(bus, drone, td, 1.0)

    # resolve: Dmaj9 swell for the logo, then the CTA hits
    place(pad_bus, pad_chord([54, 57, 61, 64, 69], V[7] - V[6] + 0.4, 2600, att=0.5, rel=0.6), V[6], 0.7)
    place(bus, bass_note(midi(38 - 12), 1.6) * 1.0, V[6] + 0.7, 0.3)
    cta_prog = [(38, [57, 62, 66, 69, 76]), (43, [59, 62, 66, 71, 74]), (45, [57, 61, 64, 69, 76]), (38, [54, 57, 62, 66, 69, 74])]
    for i, (root, notes) in enumerate(cta_prog):
        t0 = V[7] + i * bar * 0.5
        last = i == len(cta_prog) - 1
        dur = (END - t0 - 0.2) if last else bar * 0.5
        place(pad_bus, pad_chord(notes, dur, 3000, att=0.04, rel=1.2 if last else 0.3), t0, 0.62)
        place(bus, bass_note(midi(root - 12), min(dur, 1.4)), t0, 0.34)

    # pluck arpeggio (scenes 3–7): micro-percussive 16ths
    arp_steps = [0, 1, 2, 3, 2, 1, 3, 2]
    for b in range(nbar):
        t0 = g0 + b * bar
        s = sec(max(t0, 0))
        if s not in ("s3", "s4", "s5", "s7"):
            continue
        root, notes = prog[b % 4]
        for k in range(16):
            tp = t0 + k * beat / 4
            if tp >= V[6] - 0.1:
                break
            if s == "s3" and k % 2 == 1:
                continue
            m = notes[arp_steps[k % 8]] + 12
            vel = 0.5 + 0.5 * ((k % 4) == 0)
            place(bus, pluck(midi(m)), tp, 0.07 * vel, pan=0.35 if k % 2 else -0.35)

    # drums
    nb = int((END - g0) / beat) + 1
    for i in range(nb):
        tb = g0 + i * beat
        if tb < 0:
            continue
        s = sec(tb)
        pos = i % 4
        if s == "s1":
            # hook: no slow intro — a driving pulse from the first beat
            place(drum_bus, kick(0.7), tb, 0.58)
            if pos in (1, 3):
                place(drum_bus, clap(), tb, 0.16, pan=0.05)
            for h in range(2):
                place(drum_bus, hat(), tb + h * beat / 2, 0.06 if h else 0.09, pan=0.25)
        elif s == "s2":
            if tb < FREEZE and pos in (0, 2):  # heartbeat until the freeze
                place(drum_bus, kick(0.4), tb, 0.45)
        elif s in ("s3", "s4", "s5", "s7"):
            place(drum_bus, kick(0.9), tb, 0.62)
            if pos in (1, 3):
                place(drum_bus, clap(), tb, 0.28 if s != "s3" else 0.2, pan=0.05)
            for h in range(4):
                if s == "s3" and h % 2:
                    continue
                v = 0.1 if h == 2 else 0.05
                place(drum_bus, hat(open_=(h == 2 and s in ("s5", "s7"))), tb + h * beat / 4, v, pan=0.3)
            if s in ("s5", "s7"):
                for h in range(4):
                    place(drum_bus, shaker(), tb + h * beat / 4 + beat / 8, 0.04, pan=-0.35)
        elif s == "s8":
            for h in range(2):
                place(drum_bus, hat(), tb + h * beat / 2, 0.06, pan=0.25)
        elif s == "cta":
            if tb < V[7] + bar * 1.5 + 0.01:
                place(drum_bus, kick(0.95), tb, 0.6)
                if pos in (1, 3):
                    place(drum_bus, clap(), tb, 0.24)
                for h in range(2):
                    place(drum_bus, hat(), tb + h * beat / 2, 0.07, pan=0.3)

    # sidechain pump on the pad from the kick grid (scenes 3+), gentle
    pump = np.ones(N)
    for i in range(nb):
        tb = g0 + i * beat
        s = sec(max(tb, 0))
        if s in ("s3", "s4", "s5", "s7", "cta") and tb >= 0:
            a = int(tb * SR)
            L = int(beat * SR)
            seg = 1 - 0.32 * np.exp(-np.arange(L) / (0.09 * SR))
            pump[a : a + L] = np.minimum(pump[a : a + L], seg[: max(0, min(L, N - a))])
    pad_bus *= pump[:, None]

    mix = bus + pad_bus * 0.9 + drum_bus
    ir = reverb_ir(2.4)
    mix = reverb(mix, ir, 0.22)

    # freeze: everything but the drone ducks hard from 9.3 → 10.0
    g = np.ones(N)
    tf, tr = FREEZE, REDIRECT
    a, b = int(tf * SR), int(tr * SR)
    g[a:b] = 0.25
    g[b : b + int(0.4 * SR)] = np.linspace(0.25, 1, int(0.4 * SR))
    # tail fade
    fo = int((END - 1.2) * SR)
    g[fo:] *= np.linspace(1, 0, N - fo) ** 1.5
    # VO ducking (dynamic, ~ -8 dB while the narrator speaks)
    g *= 1 - 0.6 * vo_env
    mix *= g[:, None]
    mix = hp(mix.T, 30).T
    return mix


# -------------------------------------------------------------------- sfx
def s_tick(pitch=2600, amp=1.0):
    t = t_axis(0.08)
    s = np.sin(2 * np.pi * pitch * t) * np.exp(-t * 90) * 0.6
    s += hp(noise(0.08), 5000) * np.exp(-t * 260) * 0.5
    return s * amp


def s_paper(amp=1.0):
    t = t_axis(0.16)
    n = bp(noise(0.16), 1800, 7000) * np.exp(-t * 45) * 0.7
    tk = np.pad(s_tick(3100, 0.45), (0, t.size - int(0.08 * SR)))
    return (n + tk) * amp


def s_snap():
    t = t_axis(0.35)
    th = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 18) * 0.8
    ring = (np.sin(2 * np.pi * 1180 * t) + 0.6 * np.sin(2 * np.pi * 3070 * t)) * np.exp(-t * 28) * 0.18
    cl = hp(noise(0.35), 3000) * np.exp(-t * 300) * 0.4
    return th + ring + cl


def s_pop():
    t = t_axis(0.18)
    f = 520 + 520 * (1 - np.exp(-t * 60))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 26) * np.clip(t / 0.003, 0, 1) * 0.7


def s_ping(base=1318.5):
    t = t_axis(0.7)
    s = np.zeros_like(t)
    for k, a, d in ((1, 1.0, 7), (1.5, 0.45, 9), (2.76, 0.18, 14)):
        s += a * np.sin(2 * np.pi * base * k * t) * np.exp(-t * d)
    s2 = np.zeros_like(t)
    off = int(0.07 * SR)
    for k, a, d in ((1, 1.0, 7), (2.0, 0.3, 11)):
        s2[off:] += a * np.sin(2 * np.pi * base * 1.335 * k * t[: t.size - off]) * np.exp(-t[: t.size - off] * d)
    return (s + 0.8 * s2) * np.clip(t / 0.002, 0, 1) * 0.28


def s_lowpulse():
    t = t_axis(0.6)
    return np.tanh(1.6 * np.sin(2 * np.pi * 55 * t)) * np.clip(t / 0.03, 0, 1) * np.exp(-t * 6) * 0.7


def s_stop():
    t = t_axis(0.22)
    body = np.sin(2 * np.pi * 240 * t) * np.exp(-t * 60)
    n = lp(noise(0.22), 2500) * np.exp(-t * 120) * 0.6
    sub = np.sin(2 * np.pi * 62 * t) * np.exp(-t * 14) * 0.7
    return (body + n + sub) * 0.8


def s_tension(dur=0.85):
    t = t_axis(dur)
    s = np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 232.5 * t) + 0.4 * np.sin(2 * np.pi * 110 * t)
    e = np.clip(t / 0.5, 0, 1) * np.clip((dur - t) / 0.2, 0, 1)
    return s * e * 0.1


def s_whoosh(dur=0.75, lo=350, hi=3800, amp=1.0, stereo=True):
    n = noise(dur)
    t = t_axis(dur)
    out = np.zeros_like(n)
    seg = int(0.03 * SR)
    win = np.hanning(seg * 2)
    pos = 0
    while pos < n.size:
        u = pos / n.size
        fc = lo + (hi - lo) * np.sin(np.pi * u) ** 1.5
        chunk = n[max(0, pos - seg) : pos + seg]
        y = bp(chunk, max(80, fc * 0.6), min(16000, fc * 1.6))
        w = win[: y.size]
        out[max(0, pos - seg) : max(0, pos - seg) + y.size] += y * w
        pos += seg
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    s = out * e * amp * 0.5
    if not stereo:
        return s
    pan = np.linspace(-0.7, 0.7, s.size)
    return np.stack([s * np.cos((pan + 1) * np.pi / 4) * 1.4, s * np.sin((pan + 1) * np.pi / 4) * 1.4], axis=1)


def s_tap():
    t = t_axis(0.06)
    return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 160) * 0.5 + lp(noise(0.06), 4500) * np.exp(-t * 400) * 0.5) * 0.9


def s_connect():
    t = t_axis(0.5)
    s = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 12) * (t < 0.12)
    o = int(0.11 * SR)
    s2 = np.zeros_like(t)
    s2[o:] = np.sin(2 * np.pi * 1318.5 * t[: t.size - o]) * np.exp(-t[: t.size - o] * 7)
    return (s + s2) * np.clip(t / 0.004, 0, 1) * 0.3


def s_texture(dur):
    t = t_axis(dur)
    n = bp(noise(dur), 900, 3200)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) * np.sin(2 * np.pi * 2.3 * t)
    e = np.clip(t / 0.15, 0, 1) * np.clip((dur - t) / 0.2, 0, 1)
    return n * am * e * 0.05


def s_chime():
    t = t_axis(1.6)
    s = np.zeros_like(t)
    for f0, dl in ((1046.5, 0.0), (1568.0, 0.06), (2093.0, 0.12)):
        o = int(dl * SR)
        tt = t[: t.size - o]
        part = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 3.2) + 0.25 * np.sin(2 * np.pi * f0 * 2.76 * tt) * np.exp(-tt * 9)
        s[o:] += part * np.clip(tt / 0.002, 0, 1)
    return s * 0.2


def s_sweep():
    dur = 0.5
    t = t_axis(dur)
    n = hp(noise(dur), 2000)
    out = np.zeros_like(n)
    k = 0
    seg = int(0.02 * SR)
    while k < n.size:
        u = k / n.size
        fc = 2500 + 7000 * u
        y = bp(n[k : k + seg], fc * 0.8, min(fc * 1.25, 20000))
        out[k : k + y.size] = y
        k += seg
    grains = np.zeros_like(t)
    for g in range(9):
        i = int((0.04 + g * 0.045) * SR)
        grains[i : i + 60] += np.sin(2 * np.pi * (3000 + g * 250) * t[:60]) * np.exp(-t[:60] * 900)
    e = np.sin(np.pi * t / dur)
    return (out * e * 0.35 + grains * 0.2) * 0.9


def s_confirm():
    t = t_axis(0.4)
    s = np.sin(2 * np.pi * 146.8 * t) + 0.7 * np.sin(2 * np.pi * 220 * t) + 0.3 * np.sin(2 * np.pi * 293.7 * t)
    return s * np.clip(t / 0.01, 0, 1) * np.exp(-t * 5) * 0.32


def s_handoff():
    t = t_axis(0.3)
    f = 300 + 260 * (1 - np.exp(-t * 45))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 14) + 0.3 * np.sin(2 * ph) * np.exp(-t * 22)) * np.clip(t / 0.004, 0, 1) * 0.55


def s_rise(dur=0.7):
    t = t_axis(dur)
    f = 440 * 2 ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.sin(np.pi * t / dur) ** 1.5
    return (np.sin(ph) + 0.4 * np.sin(2 * ph)) * e * 0.12


def s_resolve():
    t = t_axis(2.2)
    sub = np.sin(2 * np.pi * 73.4 * t) * np.exp(-t * 3) * 0.5
    sh = np.zeros_like(t)
    for f0 in (2349.3, 2793.8, 3520.0):
        sh += np.sin(2 * np.pi * f0 * t) * np.exp(-t * 2.4)
    return (sub + sh * 0.05) * np.clip(t / 0.01, 0, 1)


def build_sfx():
    bus = np.zeros((N, 2))
    t3, t4, t5, t7, t9, t10 = V[2], V[3], V[4], V[5], V[6], V[7]
    # hook — documents slam in, snap, WhatsApp send, travel toward the RM phone
    place(bus, s_lowpulse(), 0.0, 0.65)
    place(bus, s_whoosh(0.4, 500, 3200, 0.8), 0.0, 0.45)
    for i, t in enumerate((0.42, 0.52, 0.64)):
        place(bus, s_paper(), t, 0.6, pan=(-0.5, 0.5, 0.0)[i])
    place(bus, s_snap(), 0.8, 0.55)
    place(bus, s_pop(), 0.9, 0.35)
    place(bus, s_tap(), 2.04, 0.5)
    place(bus, s_pop(), 2.12, 0.65)
    place(bus, s_tick(3200, 0.5), 2.24, 0.3)
    place(bus, s_tick(3600, 0.5), 2.72, 0.3)
    place(bus, s_whoosh(0.8, 300, 2400, 0.9), 2.84, 0.5)
    place(bus, s_whoosh(0.35, 900, 3600, 0.6), 3.2, 0.3)
    place(bus, s_lowpulse(), 3.95, 0.55)
    place(bus, s_tension(3.9), 3.95, 1.1)
    place(bus, s_rise(3.8), 4.05, 0.55)
    place(bus, s_lowpulse(), 5.05, 0.45)
    place(bus, s_lowpulse(), 6.47, 0.55)
    for i in range(3):
        place(bus, s_tick(1800 - i * 200, 0.4), 6.75 + i * 0.1, 0.3, pan=0.3)
    place(bus, s_stop(), FREEZE, 0.75)
    place(bus, s_tick(2400, 0.4), FREEZE + 0.08, 0.25)
    place(bus, s_whoosh(0.8, 400, 4200, 1.0), REDIRECT - 0.02, 0.6)
    place(bus, s_tick(2900, 0.6), REDIRECT + 0.12, 0.4)
    # scene 3 — AI chat + voice inside WhatsApp
    place(bus, s_ping(), t3 + 0.42 * K3, 0.55)
    place(bus, s_ping(), t3 + 1.38 * K3, 0.45)
    place(bus, s_tap(), t3 + 2.3 * K3, 0.5)
    place(bus, s_pop(), t3 + 2.6 * K3, 0.45)
    place(bus, s_ping(), t3 + 3.3 * K3, 0.45)
    place(bus, s_ping(), t3 + 4.1 * K3, 0.4)
    place(bus, s_tap(), t3 + 4.62 * K3, 0.5)
    place(bus, s_connect(), t3 + 4.8 * K3, 0.6)
    place(bus, s_texture(1.15), t3 + 5.13 * K3, 1.0)
    place(bus, s_whoosh(0.4, 900, 3000, 0.6), t3 + 6.05 * K3, 0.4)
    place(bus, s_tick(2600, 0.5), t3 + 6.45 * K3, 0.4)
    # scene 4 — pending → question → consent → upload
    place(bus, s_ping(), t4 + 0.36 * K4, 0.45)
    place(bus, s_tap(), t4 + 1.35 * K4, 0.5)
    place(bus, s_pop(), t4 + 2.05 * K4, 0.45)
    place(bus, s_ping(), t4 + 2.65 * K4, 0.4)
    place(bus, s_tick(2200, 0.5), t4 + 3.3 * K4, 0.4)
    place(bus, s_tap(), t4 + 3.95 * K4, 0.5)
    place(bus, s_tick(2800, 0.9), t4 + 4.12 * K4, 0.55)
    place(bus, s_tick(2800, 0.5), t4 + 4.15 * K4, 0.25)
    place(bus, s_pop(), t4 + 4.55 * K4, 0.4)
    place(bus, s_snap(), t4 + 4.5 * K4 + 0.67, 0.3)
    for t in (t4 + 4.95 * K4, t4 + 5.45 * K4, t4 + 5.9 * K4):
        place(bus, s_tick(3600, 0.5), t, 0.32)
    place(bus, s_chime(), t4 + 6.32 * K4, 0.8)
    # scene 5 + 6 — the document leaves WhatsApp
    place(bus, s_whoosh(0.9, 250, 2600, 1.0), t5 - 0.05, 0.6)
    place(bus, s_rise(0.8), t5 + 0.3 * K5, 0.6)
    place(bus, s_snap(), t5 + 0.82 * K5, 0.5)
    place(bus, s_sweep(), t5 + 1.72 * K5, 0.55)
    place(bus, s_sweep(), t5 + 1.9 * K5, 0.35)
    place(bus, s_tick(2400, 0.6), t5 + 2.3 * K5, 0.4)
    place(bus, s_lowpulse(), t5 + 2.25 * K5, 0.3)
    place(bus, s_tick(1500, 0.5), t5 + 2.5 * K5, 0.3)
    place(bus, s_stop(), t5 + 3.0 * K5, 0.3)
    place(bus, s_snap(), t5 + 3.42 * K5, 0.6)
    place(bus, s_confirm(), t5 + 3.48 * K5, 0.8)
    for i in range(3):
        place(bus, s_tick(3000 + i * 300, 0.35), t5 + 3.62 * K5 + i * 0.12, 0.28)
    # scene 7 — context to the RM, RM joins
    place(bus, s_whoosh(0.6, 300, 1800, 0.5), t7 - 0.05, 0.35)
    for i in range(3):
        place(bus, s_tick(2200 + i * 330, 0.6), t7 + 0.55 * K7 + i * 0.26, 0.35, pan=0.2 + i * 0.15)
    place(bus, s_pop(), t7 + 1.4 * K7, 0.3)
    place(bus, s_whoosh(0.7, 300, 2200, 0.6), t7 + 2.0 * K7, 0.4)
    place(bus, s_handoff(), t7 + 2.72 * K7, 0.7)
    place(bus, s_ping(), t7 + 3.25 * K7, 0.4)
    # scene 8 — one line connects everything
    t8 = t7 + 4.2 * K7
    place(bus, s_rise(0.65), t8 + 0.25 * K7, 0.9)
    place(bus, s_tick(2600, 0.5), t8 + 0.7 * K7, 0.3, pan=-0.3)
    place(bus, s_tick(2300, 0.5), t8 + 0.92 * K7, 0.3, pan=0.3)
    # scene 9 — brand + CTA
    place(bus, s_resolve(), t9 + 0.72 * K9, 0.8)
    place(bus, s_tap(), t10 + 0.85, 0.3)
    place(bus, s_tap(), t10 + 1.5, 0.55)
    place(bus, s_lowpulse(), t10 + 1.5, 0.35)
    return bus


# --------------------------------------------------------------------- vo
def load_vo(path):
    x, sr = sf.read(path, always_2d=True)
    assert sr == SR, f"VO must be {SR} Hz (got {sr}); resample with ffmpeg first"
    out = np.zeros((N, 2))
    n = min(N, x.shape[0])
    out[:n] = x[:n, :2] if x.shape[1] >= 2 else np.repeat(x[:n], 2, axis=1)
    return out


def vo_envelope(vo):
    m = np.abs(vo).mean(axis=1)
    win = int(0.05 * SR)
    sm = np.convolve(m, np.ones(win) / win, mode="same")
    gate = (sm > 0.01).astype(float)
    # attack 40 ms, release 350 ms
    out = np.zeros_like(gate)
    a = 1 - np.exp(-1 / (0.04 * SR))
    r = 1 - np.exp(-1 / (0.35 * SR))
    y = 0.0
    for i, g in enumerate(gate):
        y += (a if g > y else r) * (g - y)
        out[i] = y
    return out


def norm_peak(x, peak_db):
    p = np.max(np.abs(x)) + 1e-9
    return x * (10 ** (peak_db / 20) / p)


def to_lufs(x, target, ceiling_db=-1.5):
    """Static gain to an integrated loudness target (keeps ducking intact)."""
    import pyloudnorm as pyln

    lufs = pyln.Meter(SR).integrated_loudness(x)
    y = x * 10 ** ((target - lufs) / 20)
    pk = np.max(np.abs(y))
    if pk > 10 ** (ceiling_db / 20):
        y *= 10 ** (ceiling_db / 20) / pk
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vo", default=os.path.join(ROOT, "assets", "vo_guide.wav"))
    args = ap.parse_args()

    vo = load_vo(args.vo)
    env = vo_envelope(vo)

    music = to_lufs(build_music(env), -27)
    os.makedirs(os.path.join(ROOT, "assets", "music"), exist_ok=True)
    sf.write(os.path.join(ROOT, "assets", "music", "bed.wav"), music, SR, subtype="PCM_24")

    sfx = norm_peak(build_sfx(), -9.0)
    os.makedirs(os.path.join(ROOT, "assets", "sfx"), exist_ok=True)
    sf.write(os.path.join(ROOT, "assets", "sfx", "sfx_stem.wav"), sfx, SR, subtype="PCM_24")

    # narration stays dominant
    vo_out = "vo_guide.wav" if args.vo.endswith("vo_guide.wav") else "vo_master.wav"
    sf.write(os.path.join(ROOT, "assets", vo_out), to_lufs(vo, -17), SR, subtype="PCM_24")
    print("ok")


if __name__ == "__main__":
    main()
