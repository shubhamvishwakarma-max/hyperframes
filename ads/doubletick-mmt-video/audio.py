"""Synthesize the music bed + SFX for the MakeMyTrip x DoubleTick video (numpy only)."""
import numpy as np, wave, sys

SR = 44100
DUR = 26.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(SR * d)) / SR
def place(buf, sig, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def lowpass(x, k):  # moving-average FIR (cheap low-pass)
    return np.convolve(x, np.ones(k) / k, mode="same")
def note(m): return 440.0 * 2 ** ((m - 69) / 12)

# ---------------- music ----------------
music = np.zeros(N)
BEAT = 0.5  # 120 BPM

def kick(amp=1.0):
    tt = t_(0.32); f = 45 + 85 * np.exp(-tt * 28)
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
def hat(amp=0.25, d=0.05):
    tt = t_(d); n = rng.standard_normal(len(tt)); n = n - lowpass(n, 6)
    return amp * n * np.exp(-tt * 70)
def clap(amp=0.35):
    tt = t_(0.18); n = rng.standard_normal(len(tt)); n = lowpass(n, 3) - lowpass(n, 18)
    return amp * n * np.exp(-tt * 22)
def pad(midis, d, amp=0.08):
    tt = t_(d); s = np.zeros(len(tt))
    for m in midis:
        for det in (-0.12, 0.0, 0.12):
            s += np.sin(2 * np.pi * note(m + det) * tt)
    env = np.minimum(1, tt / 0.35) * np.minimum(1, (d - tt) / 0.4)
    return amp * s / (3 * len(midis)) * env
def bass(m, d, amp=0.22):
    tt = t_(d); f = note(m); s = sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 6))
    s = lowpass(s, 20); env = np.minimum(1, tt / 0.01) * np.exp(-tt * 2.2)
    return amp * s * env

# chord plan (2s bars)
problem = [[57, 60, 64], [53, 57, 60]] * 2                    # Am  F  (0-8s)
solution = [[48, 55, 64], [55, 59, 62], [57, 60, 64], [53, 57, 65]] * 3 + [[48, 55, 64]]  # C G Am F (8-34 trimmed)
roots_p = [45, 41] * 2
roots_s = [36, 43, 45, 41] * 3 + [36]
for b, ch in enumerate(problem):
    place(music, pad(ch, 2.05, 0.07), b * 2.0)
    place(music, bass(roots_p[b], 1.9, 0.12), b * 2.0)
for b in range(int(8.0 / BEAT)):
    t0 = b * BEAT
    place(music, kick(0.55 if b % 2 == 0 else 0.0), t0)
    place(music, hat(0.10), t0 + BEAT / 2)
# solution section 8.0 - 21.4 : full groove
for b, ch in enumerate(solution):
    t0 = 8.0 + b * 2.0
    if t0 >= 21.4: break
    place(music, pad([m + 12 for m in ch], 2.05, 0.06), t0)
    place(music, pad(ch, 2.05, 0.05), t0)
    for q in range(4):
        place(music, bass(roots_s[b], 0.45, 0.2), t0 + q * BEAT)
for b in range(int((21.4 - 8.0) / BEAT)):
    t0 = 8.0 + b * BEAT
    place(music, kick(0.8), t0)
    place(music, hat(0.13), t0 + BEAT / 2)
    place(music, hat(0.06, 0.03), t0 + BEAT / 4)
    if b % 2 == 1: place(music, clap(0.3), t0)
# CTA: warm sustain + light hats
place(music, pad([53, 57, 60, 65], 2.4, 0.08), 21.4)
place(music, pad([48, 55, 60, 64], 2.8, 0.08), 23.6)
place(music, bass(41, 2.2, 0.16), 21.4)
place(music, bass(36, 2.6, 0.16), 23.6)
for b in range(int((25.6 - 21.4) / BEAT)):
    place(music, hat(0.06), 21.4 + b * BEAT + BEAT / 2)
# riser into the green sweep
tt = t_(1.0); n = rng.standard_normal(len(tt)); n = n - lowpass(n, 4)
place(music, 0.12 * n * (tt / 1.0) ** 2, 7.0)

# master fade in/out
env = np.ones(N); fi = int(0.05 * SR); fo = int(1.2 * SR)
env[:fi] = np.linspace(0, 1, fi); env[-fo:] = np.linspace(1, 0, fo)
music *= env

# ---------------- sfx ----------------
sfx = np.zeros(N)
def pop(f=880, d=0.09, amp=0.35):
    tt = t_(d); fr = f * (1 + 0.5 * np.exp(-tt * 60))
    return amp * np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 38)
def blip_down(amp=0.3):
    tt = t_(0.22); fr = 620 * np.exp(-tt * 5)
    return amp * np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.4 * np.exp(-tt * 14)
def whoosh(d=0.6, amp=0.28, up=True):
    tt = t_(d); n = rng.standard_normal(len(tt)); k = 2 + (np.arange(len(tt)) // 2000)
    lp = lowpass(n, 8) - lowpass(n, 40)
    shape = np.sin(np.pi * tt / d) ** 2
    return amp * lp * shape
def tick_s(amp=0.3):
    tt = t_(0.06); s = amp * np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 90); s[:int(0.05*SR)] += pop(1500, 0.05, amp * 0.6); return s
def snap(amp=0.4):
    tt = t_(0.12); body = np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 40)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 300)
    return amp * (0.7 * body + 0.3 * click)
def impact(amp=0.55):
    tt = t_(0.9); f = 38 + 70 * np.exp(-tt * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 120)
    shimmer = sum(np.sin(2 * np.pi * note(m) * tt) for m in (84, 88, 91)) / 3 * np.exp(-tt * 6)
    return amp * (0.8 * boom + 0.25 * click + 0.12 * shimmer)
def chime(amp=0.3):
    tt = t_(1.4); s = sum(np.sin(2 * np.pi * note(m) * tt) * w for m, w in ((72, 1), (79, .7), (84, .5), (88, .35)))
    return amp * s / 2.5 * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.005)

for i, at in enumerate((0.45, 0.57, 0.69)): place(sfx, pop(780 + 120 * i), at)
place(sfx, whoosh(0.5, 0.12), 1.35)
place(sfx, tick_s(0.15), 2.72)
for i, at in enumerate((5.25, 5.37, 5.49)): place(sfx, pop(520, 0.06, 0.18), at)
for i, at in enumerate((6.0, 6.15, 6.3)): place(sfx, blip_down(0.22), at)
place(sfx, whoosh(0.9, 0.35), 7.75)
place(sfx, impact(0.28), 8.6)
for i, at in enumerate((9.3, 9.42, 9.54)): place(sfx, tick_s(0.28), at)
for i, at in enumerate((10.0, 10.25, 10.5)): place(sfx, pop(1040 + 80 * i, 0.1, 0.32), at)
place(sfx, whoosh(0.6, 0.22), 13.5)
for i, at in enumerate((14.3, 14.4, 14.5)): place(sfx, snap(0.4), at)
for i, at in enumerate((15.42, 15.54, 15.66)): place(sfx, tick_s(0.16), at)
place(sfx, whoosh(0.5, 0.16), 17.45)
place(sfx, impact(0.6), 18.0)
place(sfx, impact(0.5), 18.35)
place(sfx, pop(900, 0.1, 0.25), 19.05)
place(sfx, whoosh(0.5, 0.16), 21.3)
place(sfx, chime(0.32), 22.55)
place(sfx, pop(1200, 0.08, 0.14), 24.15)

def write(path, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    st = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

mix = 0.55 * music / np.max(np.abs(music)) + 0.75 * sfx / np.max(np.abs(sfx))
write(sys.argv[1] if len(sys.argv) > 1 else "music_sfx.wav", mix)
print("ok", DUR)
