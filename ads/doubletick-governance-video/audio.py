"""Synthesize the music bed + SFX for the DoubleTick governance video (numpy only)."""
import numpy as np, wave, sys

SR = 44100
DUR = 47.5
N = int(SR * DUR)
rng = np.random.default_rng(7)


def t_(d): return np.arange(int(SR * d)) / SR
def place(buf, sig, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(sig))
    if j > i: buf[i:j] += sig[: j - i] * gain
def lowpass(x, k):  # moving-average FIR (cheap low-pass)
    return np.convolve(x, np.ones(k) / k, mode="same")
def note(m): return 440.0 * 2 ** ((m - 69) / 12)

# same [videoTime, animTime] keypoints as index.html; W() maps animation time -> video time
KP = [[0, 0], [0.15, 0.15], [6.32, 5.6], [13.33, 11.8], [16.55, 15.25], [17.42, 16.6], [25.2, 22.65], [26.44, 24.0], [27.35, 25.05], [30.09, 28.0], [33.15, 31.05], [34.85, 32.15], [35.6, 33.35], [36.3, 34.45], [39.75, 37.0], [44.34, 41.4], [47.5, 45.0]]
def W(o):
    for (n0, o0), (n1, o1) in zip(KP, KP[1:]):
        if o <= o1: return n0 + (n1 - n0) * min(1, max(0, (o - o0) / (o1 - o0)))
    return KP[-1][0]
P_END, S_END = W(15.9), W(41.1)

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
nb = int(np.ceil(P_END / 2.0))
for b in range(nb):
    ch = problem[b % 4]; place(music, pad(ch, 2.05, 0.07), b * 2.0); place(music, bass(roots_p[b % 4], 1.9, 0.12), b * 2.0)
for b in range(int(P_END / BEAT)):
    t0 = b * BEAT
    place(music, kick(0.55 if b % 2 == 0 else 0.0), t0)
    place(music, hat(0.10), t0 + BEAT / 2)
for b in range(int(np.ceil((S_END - P_END) / 2.0))):
    t0 = P_END + b * 2.0
    ch = solution[b % 4]
    place(music, pad([m + 12 for m in ch], 2.05, 0.06), t0); place(music, pad(ch, 2.05, 0.05), t0)
    for q in range(4):
        if t0 + q * BEAT < S_END: place(music, bass(roots_s[b % 4], 0.45, 0.2), t0 + q * BEAT)
for b in range(int((S_END - P_END) / BEAT)):
    t0 = P_END + b * BEAT
    place(music, kick(0.8), t0); place(music, hat(0.13), t0 + BEAT / 2); place(music, hat(0.06, 0.03), t0 + BEAT / 4)
    if b % 2 == 1: place(music, clap(0.3), t0)
for i, ch in enumerate([[53, 57, 60, 65], [48, 55, 60, 64], [53, 57, 60, 65]]):
    place(music, pad(ch, 2.5, 0.08), S_END + i * 2.2); place(music, bass([41, 36, 41][i], 2.3, 0.16), S_END + i * 2.2)
for b in range(int((DUR - 0.6 - S_END) / BEAT)):
    place(music, hat(0.06), S_END + b * BEAT + BEAT / 2)
tt = t_(1.0); n = rng.standard_normal(len(tt)); n = n - lowpass(n, 4)
place(music, 0.12 * n * (tt / 1.0) ** 2, P_END - 1.0)

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

# times are animation time, warped to video time
def ps(sig, at, g=1.0): place(sfx, sig, W(at), g)
for i, at in enumerate((0.12, 0.2, 0.28, 0.36)): ps( pop(700 + 70 * i, 0.07, 0.16), at)
ps( tick_s(0.16), 1.15)                                  # "Left the company"
ps( whoosh(1.2, 0.34), 1.95)                             # agent card exits
ps( whoosh(1.0, 0.16), 2.2)                              # cards drag after him
ps( snap(0.3), 3.7)                                      # freeze halfway
ps( whoosh(0.5, 0.12), 5.4)
for at in (6.25, 6.95, 7.7): ps( pop(860, 0.09, 0.22), at)       # WhatsApp messages
for at in (6.85, 7.55, 8.3): ps( tick_s(0.14), at)
ps( pop(420, 0.1, 0.2), 11.85)
for i in range(3): ps( blip_down(0.14), 12.9 + i * 0.15)         # lines stop short
ps( whoosh(0.9, 0.34), 15.2); ps( impact(0.3), 15.8)      # green sweep -> brand WhatsApp
ps( chime(0.18), 15.9)
for i in range(3): ps( snap(0.32), 16.9 + i * 0.1)               # snap into dashboard rows
ps( tick_s(0.2), 22.6); ps( whoosh(0.5, 0.14), 22.8)
for i in range(4): ps( pop(900 + 60 * i, 0.06, 0.12), 23.0 + i * 0.2)
ps( pop(1040, 0.09, 0.2), 24.05); ps( tick_s(0.18), 24.4)
ps( snap(0.42), 25.85); ps( pop(1100, 0.08, 0.16), 26.4)  # Rahul -> Neha
ps( whoosh(0.5, 0.14), 27.9)
for i in range(3):                                               # masking ticks
    for j in range(6): ps( tick_s(0.07), 28.65 + i * 0.45 + j * 0.09)
ps( whoosh(0.5, 0.14), 30.85)
for a, f in ((31.2, 32.15), (32.8, 33.35), (33.85, 34.5)):       # AI warning pings
    ps( pop(860, 0.08, 0.18), a); ps( tick_s(0.24), f); ps( blip_down(0.08), f + 0.04)
ps( whoosh(0.5, 0.14), 36.8)
ps( whoosh(1.0, 0.12), 37.1)
for i in range(6): ps( snap(0.2), 37.75 + i * 0.1)        # nodes snap onto the line
ps( chime(0.2), 38.1)
for i in range(4): ps( tick_s(0.16), 39.1 + i * 0.2)
ps( whoosh(0.5, 0.14), 40.95)
ps( chime(0.3), 41.75); ps( pop(1200, 0.08, 0.14), 43.05)

def write(path, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    st = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

write("music.wav", music)
write("sfx.wav", sfx)
print("ok", DUR)
