"""Deterministic synthesis of the music bed and SFX track for the SOTC case study.

Usage: python3 -I scripts/synth_audio.py <out_dir>
Writes music.wav and sfx.wav (44.1 kHz mono, 34 s).
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 34.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a, d, s, r, sustain_len):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    s_n = max(0, int(sustain_len * SR) - a_n - d_n)
    e = np.concatenate([
        np.linspace(0, 1, a_n, endpoint=False) if a_n else [],
        np.linspace(1, s, d_n, endpoint=False) if d_n else [],
        np.full(s_n, s),
        np.linspace(s, 0, r_n) if r_n else [],
    ])
    out = np.zeros(n)
    out[: min(n, len(e))] = e[:n]
    return out


def add(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def lowpass(x, cutoff):
    # one-pole lowpass, vectorised via cumulative filtering in chunks
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(0, len(x), 4096):
        seg = x[k : k + 4096]
        out = np.empty_like(seg)
        for i, v in enumerate(seg):
            acc = (1 - a) * v + a * acc
            out[i] = acc
        y[k : k + 4096] = out
    return y


# ---------------------------------------------------------------- music
BEAT = 0.6  # 100 BPM
BAR = BEAT * 4
# D major, optimistic: Dmaj9 - Bm9 - Gmaj9 - Asus/A
CHORDS = [
    [50, 57, 61, 64, 66],  # D A C# E F#
    [47, 54, 57, 61, 62],  # B F# A C# D
    [43, 50, 54, 57, 59],  # G D F# A B
    [45, 52, 57, 59, 64],  # A E A B E
]
music = np.zeros(N)

# pad: detuned soft sines with few harmonics, slow attack, continuous
n_bars = int(np.ceil(DUR / BAR)) + 1
for b in range(n_bars):
    st = b * BAR
    ch = CHORDS[b % 4] if st < 30.4 else CHORDS[0]
    length = BAR + 1.2
    n = int(length * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in ch[1:]:
        f = midi(m + 12)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * ff * tt) + 0.18 * np.sin(4 * np.pi * ff * tt)
    sig *= env_adsr(n, 0.9, 0.4, 0.8, 1.2, BAR)
    # pad swells slightly through the film
    lvl = 0.010 + 0.006 * min(1, st / 20)
    if st >= 30.4:
        lvl = 0.016
    add(music, sig * lvl, st)

# plucked arpeggio (eighth notes) from scene 2, brighter from scene 3
PAT = [0, 2, 1, 3, 2, 4, 3, 1]
eighth = BEAT / 2
k = 0
t = 4.8
while t < 30.3:
    bar_idx = int(t // BAR)
    ch = CHORDS[bar_idx % 4]
    m = ch[PAT[k % 8]] + 12
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = midi(m)
    sig = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.08 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 9)
    sig *= np.minimum(1, tt / 0.004)
    lvl = 0.020 if t < 11.9 else (0.030 if t < 17.6 else 0.036)
    if k % 2:
        lvl *= 0.7
    add(music, sig * lvl, t)
    t += eighth
    k += 1

# sub bass from scene 3
for b in range(n_bars):
    st = b * BAR
    if st < 11.9 - BAR or st >= 30.4:
        continue
    st = max(st, 12.0)
    ch = CHORDS[int(st // BAR) % 4]
    n = int((BAR) * SR)
    tt = np.arange(n) / SR
    f = midi(ch[0] - 12)
    sig = np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(4 * np.pi * f * tt)
    sig *= env_adsr(n, 0.02, 0.3, 0.7, 0.3, BAR - 0.05)
    add(music, sig * 0.055, st)

# soft kick on quarters during the KPI section (momentum), hats from scene 3
t = 12.0
while t < 30.3:
    if t >= 17.6:
        n = int(0.35 * SR)
        tt = np.arange(n) / SR
        f = 48 + 70 * np.exp(-tt * 30)
        ph = 2 * np.pi * np.cumsum(f) / SR
        kick = np.sin(ph) * np.exp(-tt * 11)
        add(music, kick * 0.11, t)
    # offbeat hat: highpassed noise blip
    n = int(0.06 * SR)
    nz = rng.standard_normal(n)
    nz = np.diff(np.concatenate([[0], nz]))
    hat = nz * np.exp(-np.arange(n) / SR * 70)
    add(music, hat * (0.006 if t < 17.6 else 0.009), t + BEAT / 2)
    t += BEAT

# gentle fade in and resolve
fade_in = np.minimum(1, t_all / 1.2)
fade_out = np.clip((DUR - t_all) / 2.2, 0, 1)
music *= fade_in * fade_out

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)


def tone(freqs, length, decay, attack=0.004):
    n = int(length * SR)
    tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt) for f in freqs) / len(freqs)
    return s * np.exp(-tt * decay) * np.minimum(1, tt / attack)


def ringback(start):
    # restrained outgoing-call tone: two short 400/450 Hz bursts
    for off in (0.0, 0.55):
        n = int(0.38 * SR)
        tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * 400 * tt) + np.sin(2 * np.pi * 450 * tt)) * 0.5
        e = np.minimum(1, tt / 0.02) * np.minimum(1, (0.38 - tt) / 0.04)
        add(sfx, s * e * 0.05, start + off)


def pop(start, base=880, lvl=0.07):
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    f = base * (1 + 0.5 * np.minimum(1, tt / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28) * np.minimum(1, tt / 0.003)
    add(sfx, s * lvl, start)


def whoosh(start, length=0.6, lvl=0.05):
    n = int(length * SR)
    tt = np.arange(n) / SR
    nz = rng.standard_normal(n)
    nz = lowpass(nz, 1800)
    e = np.sin(np.pi * tt / length) ** 2
    add(sfx, nz * e * lvl, start)


def impact(start, lvl=0.16, f0=70):
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    f = f0 + 60 * np.exp(-tt * 25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5)
    click = tone([2400], 0.03, 120) * 0.15
    add(sfx, s * lvl, start)
    add(sfx, click, start)


def tick(start, lvl=0.06):
    add(sfx, tone([1760, 2640], 0.09, 45), start) if False else None
    add(sfx, tone([1760], 0.08, 50) * lvl, start)
    add(sfx, tone([2637], 0.10, 40) * lvl * 0.8, start + 0.07)


def connect(start):
    add(sfx, tone([660], 0.18, 14) * 0.05, start)
    add(sfx, tone([990], 0.30, 9) * 0.05, start + 0.12)


def chime(start):
    for i, m in enumerate([74, 78, 81]):
        add(sfx, tone([midi(m)], 1.4, 3.2) * 0.035, start + i * 0.08)


ringback(0.25)
add(sfx, tone([520], 0.12, 20) * 0.04, 2.05)   # call ends: muted down blip
add(sfx, tone([390], 0.18, 16) * 0.04, 2.17)
whoosh(4.35, 0.6, 0.035)
whoosh(11.45, 0.7, 0.04)
impact(11.95, 0.07, 90)
pop(12.55, 880, 0.06)
pop(13.75, 1175, 0.045)
pop(14.55, 880, 0.055)
pop(15.15, 880, 0.055)
connect(15.75)
whoosh(17.35, 0.6, 0.04)
impact(18.9, 0.15)
whoosh(20.65, 0.6, 0.035)
impact(25.2, 0.2, 52)
whoosh(27.05, 0.55, 0.035)
for i, tt0 in enumerate((28.35, 28.6, 28.85)):
    tick(tt0, 0.05)
tick(29.25, 0.07)
whoosh(30.15, 0.6, 0.035)
chime(32.35)


def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


out = sys.argv[1]
write(f"{out}/music.wav", music)
write(f"{out}/sfx.wav", sfx)
print("peak music", np.abs(music).max(), "peak sfx", np.abs(sfx).max())
