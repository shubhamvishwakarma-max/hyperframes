import numpy as np, subprocess, scipy.signal as ss
from scipy.io import wavfile
SR = 48000; DUR = 94.5; N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def midi(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, r, hold=0):
    e = np.ones(n); A = int(a * SR); R = int(r * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    e[-R:] *= np.linspace(1, 0, R) ** 2
    return e
def lp(x, fc, order=2): b, a = ss.butter(order, fc / (SR / 2)); return ss.lfilter(b, a, x)
def hp(x, fc, order=2): b, a = ss.butter(order, fc / (SR / 2), 'high'); return ss.lfilter(b, a, x)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(x));
    if i < N: buf[i:j] += x[:j - i] * g
def reverb(x, secs=2.6, mix=.3):
    n = int(secs * SR); tt = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt * 6.5 / secs); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    wet = ss.fftconvolve(x, ir)[:len(x)]
    return x * (1 - mix) + wet * mix * 1.4

# ---------- music: D major, 96 BPM, bar = 2.5s ----------
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
chords = [[50, 57, 62, 64, 66, 69], [47, 54, 59, 62, 66, 69], [43, 50, 59, 62, 66, 71], [45, 52, 57, 62, 64, 69]]  # Dmaj9 Bm7 Gmaj7 A6sus
pad = np.zeros(N); pluck = np.zeros(N); bass = np.zeros(N); kick = np.zeros(N); hat = np.zeros(N)
nbars = int(np.ceil(DUR / BAR))
def kpi_amt(t):  # rhythmic emphasis windows
    for a, b in [(16.9, 22.4), (46.3, 51.5), (71.7, 79.3), (85.9, 94.5)]:
        if a - .5 <= t <= b: return 1.0
    return 0.0
for bi in range(nbars):
    t0 = bi * BAR; ch = chords[bi % 4]; n = int(BAR * 1.25 * SR); tt = np.arange(n) / SR
    # pad: soft detuned sines + gentle 2nd harmonic
    x = np.zeros(n)
    for m in ch[1:]:
        f = midi(m)
        for d in (-0.12, 0.12):
            x += np.sin(2 * np.pi * f * (1 + d / 100) * tt + rng.uniform(0, 6)) + .18 * np.sin(4 * np.pi * f * tt)
    add(pad, x * env(n, .9, 1.0) / 10, t0)
    # bass: root, soft sine
    f = midi(ch[0] - 12); nb = int(BAR * SR)
    b = np.sin(2 * np.pi * f * np.arange(nb) / SR) + .25 * np.sin(4 * np.pi * f * np.arange(nb) / SR)
    add(bass, b * env(nb, .05, .6), t0)
    # pluck arpeggio 8ths (from 3.3s)
    arp = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[5] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 12, ch[3] + 12]
    for k in range(8):
        tk = t0 + k * BEAT / 2
        if tk < 3.2: continue
        f = midi(arp[k]); npk = int(.5 * SR); tp = np.arange(npk) / SR
        p = (np.sin(2 * np.pi * f * tp) + .3 * np.sin(4 * np.pi * f * tp) * np.exp(-tp * 30)) * np.exp(-tp * 9)
        add(pluck, p * (0.75 if k % 2 == 0 else .5), tk)
    # kick on beats 1 & 3 after hook, all 4 in KPI windows; hats offbeats in KPI windows
    for k in range(4):
        tk = t0 + k * BEAT
        if tk < 3.3: continue
        ka = kpi_amt(tk)
        if k in (0, 2) or ka:
            nk = int(.35 * SR); tq = np.arange(nk) / SR
            fsw = 48 + 70 * np.exp(-tq * 30)
            kx = np.sin(2 * np.pi * np.cumsum(fsw) / SR) * np.exp(-tq * 9)
            add(kick, kx * (.55 + .45 * ka), tk)
        if ka:
            nh = int(.08 * SR); h = hp(rng.standard_normal(nh), 7000) * np.exp(-np.arange(nh) / SR * 60)
            add(hat, h * .35, tk + BEAT / 2)

# section lift: music grows across the story
lift = np.interp(t_all, [0, 3.3, 30, 58, 86, 90, 94.5], [.75, .85, .92, 1.0, 1.08, 1.12, 1.0])
music = (reverb(pad, 3.2, .45) * .55 + reverb(pluck, 2.2, .35) * .16 + lp(bass, 300) * .22 + lp(kick, 900) * .30 + reverb(hat, 1.2, .2) * .05) * lift
music = lp(hp(music, 35), 9000)
# fades
music *= np.clip(t_all / 1.2, 0, 1) * np.clip((DUR - t_all) / 2.5, 0, 1)

# ---------- sfx (in key, soft) ----------
sfx = np.zeros(N)
def tick(t0, m=81, g=.22):  # card appear: soft high pluck
    n = int(.4 * SR); tt = np.arange(n) / SR; f = midi(m)
    add(sfx, (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 16) + .25 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 40)) * g, t0)
def bell(t0, notes=(74, 78, 81), g=.20):
    n = int(2.4 * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for i, m in enumerate(notes):
        f = midi(m); x += np.sin(2 * np.pi * f * tt + 1.2 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt * 4)) * np.exp(-tt * (2.2 + i * .4))
    add(sfx, x / len(notes) * g * np.minimum(1, tt / .005), t0)
def sweep(t0, d=.32, g=.10, f1=1500, f2=6000):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n)
    seg = 256
    for i in range(0, n, seg):
        fc = f1 + (f2 - f1) * i / n; b, a = ss.butter(2, [fc * .7 / (SR / 2), min(.99, fc * 1.3 / (SR / 2))], 'band')
        out[i:i + seg] = ss.lfilter(b, a, x[i:i + seg])
    add(sfx, out * np.sin(np.pi * np.arange(n) / n) * g, t0)
def tones(t0, ms, step=.14, g=.16, dec=7):
    for i, m in enumerate(ms):
        n = int(.7 * SR); tt = np.arange(n) / SR; f = midi(m)
        add(sfx, (np.sin(2 * np.pi * f * tt) + .15 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * dec) * np.minimum(1, tt / .01) * g, t0 + i * step)
def click(t0, g=.12):
    n = int(.03 * SR); add(sfx, hp(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / SR * 200) * g, t0)
def swell(t0, d=1.0, m=62, g=.10):
    n = int(d * SR); tt = np.arange(n) / SR; f = midi(m)
    x = sum(np.sin(2 * np.pi * f * k * tt) / k for k in (1, 2, 3)) * np.sin(np.pi * tt / d) ** 2
    add(sfx, x * g, t0)

for t0 in [0.12, .85, 1.25, 1.65, 2.05]: tick(t0, [81, 78, 83, 76, 74][[0.12, .85, 1.25, 1.65, 2.05].index(t0)], .18)
for t0, m in [(3.95, 78), (4.3, 81), (5.4, 74), (5.85, 76), (10.6, 81), (13.25, 78), (33.0, 74), (33.3, 78), (33.8, 81), (34.0, 83), (34.2, 85), (58.25, 78), (67.45, 81), (67.9, 78), (68.7, 83)]: tick(t0, m, .14)
for t0 in [3.55, 32.95, 61.95]: swell(t0, 1.1, 62, .07); tick(t0 + .05, 86, .10)  # customer logo intros
tones(7.0, [69, 70], .18, .05, 10)  # exposed highlight (quiet, slightly tense)
for i, t0 in enumerate([15.05, 15.27, 15.49]): sweep(t0, .26, .07, 1200, 4500); tick(t0 + .24, 86, .07)  # masking
sweep(22.6, 1.0, .05, 800, 5000); tones(22.9, [74, 81], .3, .07, 5)  # security ring
for t0 in [17.82, 47.15, 72.9]: bell(t0, (74, 78, 81), .20)
for t0 in [20.15, 49.55]: bell(t0, (76, 81, 85), .18)
bell(76.2, (74, 78, 81, 86), .24)  # rupee hero
tones(40.0, [74, 78, 81, 86], .09, .10)  # campaign activation (reps light up)
tones(44.8, [62, 69], .2, .09, 4)  # central control
click(53.3); click(55.25); tick(55.0, 88, .08)  # CRM clicks + sent
tones(55.4, [78, 85], .12, .09)  # call initiated
for k in range(4): tones(57.7 + k * 1.25, [81, 78], .09, .045, 12)  # soft ringing
tones(62.5, [69, 66], .22, .10, 5)  # missed call: gentle descending
sweep(66.95, .7, .05, 600, 3000)  # voice -> whatsapp
tones(69.5, [74, 81], .13, .10)  # whatsapp voice connected
tones(73.6, [69, 74, 78], .2, .08, 4)  # connection line
for i, t0 in enumerate([79.95, 80.95, 81.85, 82.95]): tick(t0, [74, 78, 81, 86][i], .12)
for i, t0 in enumerate([86.05, 86.4, 86.75]): tick(t0, [74, 78, 81][i], .14)
swell(89.1, 2.2, 50, .12); bell(89.3, (62, 69, 74, 78), .22); bell(90.5, (74, 81, 86), .18)  # brand resolve
sfx = reverb(sfx, 2.0, .3)

# ---------- VO: decode, duck the bed under it ----------
vo = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'vo.mp3', '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
vo = np.frombuffer(vo, np.float32).astype(np.float64)
v = np.zeros(N); v[:len(vo)] = vo[:N]
e = np.abs(v); e = ss.lfilter([1 - np.exp(-1 / (.03 * SR))], [1, -np.exp(-1 / (.03 * SR))], e)
# slow release
rel = np.exp(-1 / (.35 * SR)); env2 = np.zeros(N); acc = 0.0
e_ds = e[::48]; out = np.zeros_like(e_ds); a2 = np.exp(-1 / (.35 * SR / 48))
for i, x in enumerate(e_ds): acc = x if x > acc else acc * a2 + x * (1 - a2); out[i] = acc
env2 = np.repeat(out, 48)[:N]
duck = 1 - .45 * np.clip(env2 / .05, 0, 1)
bed = (music * .30 + sfx * .55) * duck
# carve a little room for the voice (presence dip on bed)
b, a = ss.iirpeak(2500 / (SR / 2), 1.0); bed = bed - .25 * ss.lfilter(b, a, bed)
mix = v * 1.0 + bed
mix /= max(1e-9, np.abs(mix).max()) / .89
wavfile.write('mix.wav', SR, np.stack([mix, mix], 1).astype(np.float32))
wavfile.write('bed.wav', SR, np.stack([bed, bed], 1).astype(np.float32))
print('ok', np.abs(music).max(), np.abs(sfx).max())
