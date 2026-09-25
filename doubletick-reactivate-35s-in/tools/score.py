"""Deterministic sound design for the DoubleTick CRM-reactivation ad (India cut, 35.0s).

Two buses, written as two separate stems so the composition can hold the brief's
level relationship precisely:

  assets/audio/music.wav  — the music bed, ducked under every voice-over line
  assets/audio/sfx.wav    — UI / call / notification cues only

Mix targets (brief): narration dominant; music ~20 dB under the voice; UI + SFX
~15 dB under the voice. The voice-over stems are mastered to I=-15 LUFS, so the
music bus is normalised to -38 dBFS RMS and the SFX bus to -33 dBFS RMS over its
active hits. Everything is seeded / closed-form, so the render is deterministic.

Run: /tmp/ttsvenv/bin/python tools/score.py
"""
import numpy as np, soundfile as sf, os

SR = 48000
DUR = 35.0
N = int(SR * DUR)
ML = np.zeros(N); MR = np.zeros(N)   # music bus
XL = np.zeros(N); XR = np.zeros(N)   # sfx bus
rng = np.random.default_rng(7)  # seeded -> deterministic

def idx(t): return int(t * SR)

def _put(bl, br, sig, t, gain, pan):
    s = idx(t)
    if s >= N: return
    e = min(N, s + len(sig))
    seg = sig[: e - s] * gain
    bl[s:e] += seg * (1.0 - max(0.0, pan))
    br[s:e] += seg * (1.0 + min(0.0, pan))

def add(sig, t, gain=1.0, pan=0.0):        # music bus
    _put(ML, MR, sig, t, gain, pan)

def sfx(sig, t, gain=1.0, pan=0.0):        # sfx bus
    _put(XL, XR, sig, t, gain, pan)

def env(n, a, d, s_lvl=0.0, r=0.0):
    e = np.ones(n)
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai + di] = np.linspace(1, s_lvl if s_lvl else 1, di)
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e

def tone(freq, dur, a=0.01, r=0.1, kind="sine", detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == "sine":
        w = np.sin(2 * np.pi * freq * t)
        if detune:
            w += 0.5 * np.sin(2 * np.pi * freq * (1 + detune) * t)
            w /= 1.5
    elif kind == "tri":
        w = 2 * np.abs(2 * ((freq * t) % 1) - 1) - 1
    else:
        w = np.sign(np.sin(2 * np.pi * freq * t)) * 0.4
    return w * env(n, a, 0, 0, r if r < dur else dur * 0.5)

def noise(dur, lp=None, hp=None, a=0.005, r=0.2):
    n = int(dur * SR)
    w = rng.standard_normal(n)
    # crude one-pole filters
    if lp:
        k = np.exp(-2 * np.pi * lp / SR); y = np.zeros(n); prev = 0.0
        for i in range(n):
            prev = (1 - k) * w[i] + k * prev; y[i] = prev
        w = y * 3.0
    if hp:
        k = np.exp(-2 * np.pi * hp / SR); y = np.zeros(n); prev = 0.0; prevx = 0.0
        for i in range(n):
            prev = k * (prev + w[i] - prevx); prevx = w[i]; y[i] = prev
        w = y
    return w * env(n, a, 0, 0, r if r < dur else dur * 0.5)

def sub_pulse(freq=48, dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    f = freq * np.exp(-t * 3) + freq * 0.6
    w = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return w * np.exp(-t * 5.5)

def pad(freqs, dur, gain=1.0, a=1.2, r=1.5):
    n = int(dur * SR); t = np.arange(n) / SR
    w = np.zeros(n)
    for i, f in enumerate(freqs):
        w += np.sin(2 * np.pi * f * t + i) * (0.8 ** i)
        w += 0.35 * np.sin(2 * np.pi * f * 2.002 * t)
    lfo = 1 + 0.06 * np.sin(2 * np.pi * 0.18 * t)
    return w / len(freqs) * lfo * env(n, a, 0, 0, r) * gain

def pluck(freq, dur=0.32):
    return tone(freq, dur, a=0.002, r=dur * 0.9, kind="tri") * 0.6

def whoosh(dur=0.6, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    w = rng.standard_normal(n)
    sweep = np.linspace(0.05, 1.0, n) if up else np.linspace(1.0, 0.05, n)
    k = np.exp(-2 * np.pi * (300 + 5000 * sweep) / SR)
    y = np.zeros(n); prev = 0.0
    for i in range(n):
        prev = (1 - k[i]) * w[i] + k[i] * prev; y[i] = prev
    e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return y * e * 4.0

def blip(freq=1320, dur=0.09):
    return tone(freq, dur, a=0.002, r=0.07) * 0.5 + tone(freq * 1.5, dur, a=0.002, r=0.05) * 0.2

def tick(dur=0.035):
    return noise(dur, hp=2500, a=0.001, r=0.03) * 0.5

# ================================================================== VOICE MAP
# Where each narration line sits, used to duck the music underneath it and to
# hang the SFX off the right words.
VO = [
    (0.28, 5.53),    # 1  "Your CRM is sitting on thousands of old leads ..."
    (5.95, 10.93),   # 2  "... a database of twenty thousand cold numbers."
    (11.45, 20.58),  # 3  "DoubleTick Voice AI calls your existing leads over PSTN ..."
    (20.75, 27.61),  # 4  "And if they miss the call ... on WhatsApp ..."
    (27.80, 32.58),  # 5  "Turn your old database into active opportunities ..."
    (32.85, 34.59),  # 6  "Book your DoubleTick AI demo today."
]
# Phrases the brief asks to be pushed forward: duck a little harder under these.
KEY = [(0.90, 2.00), (8.40, 10.93), (11.45, 13.10), (15.90, 16.60),
       (22.10, 23.40), (28.40, 30.10), (32.85, 34.59)]

# ================================================================== MUSIC BED
# ---- Act 1 (0.00 - 11.35): premium corporate tension, controlled, never grim
add(pad([55, 82.4, 110], 12.0, gain=0.30, a=0.35, r=1.8), 0.0, 0.9)
add(pad([164.8, 196.0], 11.6, gain=0.10, a=1.8, r=2.2), 0.3, 0.8)
t = 0.3
while t < 11.1:                       # very subtle low-frequency pulse
    add(sub_pulse(46, 0.5), t, 0.46)
    t += 0.7

# ---- Act 2 (11.35 - 27.7): shifts positive and progressive as DoubleTick lands
add(whoosh(0.8, up=True), 10.80, 0.26)
add(sub_pulse(40, 1.2), 11.35, 0.78)
add(pad([82.4, 123.5, 164.8, 246.9], 7.0, gain=0.26, a=0.5, r=2.2), 11.35, 1.0)
add(pad([110, 164.8, 220, 329.6], 7.4, gain=0.24, a=0.9, r=2.4), 17.8, 1.0)
add(pad([98, 146.8, 196, 293.7], 8.4, gain=0.24, a=0.8, r=2.4), 23.2, 1.0)
t, i = 11.45, 0
while t < 27.5:
    add(sub_pulse(44, 0.45), t, 0.34 if i % 2 else 0.46)
    if i % 4 in (1, 3):
        add(pluck([329.6, 246.9, 392.0, 293.7][(i // 2) % 4], 0.28), t + 0.2, 0.07)
    t += 0.4
    i += 1

# ---- Act 3 (27.7 - 35.0): opens up, more confident, then resolves cleanly
add(pad([110, 164.8, 220, 277.2], 5.0, gain=0.28, a=0.4, r=1.6), 27.7, 1.0)
add(pad([82.4, 123.5, 207.7, 246.9, 329.6], 3.1, gain=0.34, a=0.5, r=1.1), 31.9, 1.0)
add(pad([82.4, 164.8, 246.9], 2.2, gain=0.22, a=0.3, r=0.9), 32.8, 1.0)   # clean resolve
t, i = 27.8, 0
while t < 32.6:
    add(sub_pulse(44, 0.45), t, 0.42 if i % 2 else 0.30)
    t += 0.4
    i += 1
add(sub_pulse(38, 1.4), 32.85, 0.80)      # the CTA lands
add(sub_pulse(38, 1.8), 33.5, 0.34)

# ======================================================================= SFX
# ---- 0:00-0:04  problem hook: a soft CRM / dashboard notification texture
sfx(blip(1180, 0.07), 0.74, 0.30)                      # on the word "CRM"
sfx(tick(), 0.80, 0.26)
t = 1.05
while t < 2.90:                                        # records scrolling past
    sfx(tick(), t, 0.22)
    t += 0.27
for t0 in (3.62, 3.80, 3.98):                          # the competing bidders
    sfx(blip(980, 0.06), t0, 0.20)

# ---- 0:04-0:09  scale of the problem: faint phone-list / database UI, no ringing
for k, t0 in enumerate((6.05, 6.70, 7.35, 8.00)):      # the counter climbing
    sfx(blip(880 + k * 55, 0.06), t0, 0.22)
t = 6.05
while t < 8.70:
    sfx(tick(), t, 0.18)
    t += 0.13
for t0 in (9.55, 9.72, 9.89, 10.06):                   # manual dialling, dry
    sfx(tone(1400, 0.05, a=0.002, r=0.05), t0, 0.16)

# ---- 0:09-0:18  Voice AI: routing, a clean outgoing PSTN connect, call ambience
sfx(blip(1760, 0.08), 11.58, 0.30)                     # route opens
sfx(tick(), 12.05, 0.26); sfx(blip(1320, 0.06), 12.07, 0.20)
for off in (0.0, 0.42):                                # two restrained ring cycles
    ring = (tone(440, 0.30, a=0.01, r=0.12) + tone(480, 0.30, a=0.01, r=0.12)) * 0.5
    sfx(ring, 12.70 + off, 0.17)
sfx(tone(660, 0.10, a=0.004, r=0.08), 13.72, 0.22)     # line connects
sfx(tone(880, 0.16, a=0.004, r=0.14), 13.80, 0.24)
t = 14.85                                              # subtle conversational bed
while t < 17.90:
    sfx(noise(0.22, lp=900, a=0.06, r=0.14), t, 0.05)
    t += 0.38
sfx(blip(1046.5, 0.07), 16.24, 0.20)                   # the buyer's question lands
for t0 in (18.22, 18.52, 18.82):                       # qualification confirms
    sfx(blip(1480, 0.06), t0, 0.20); sfx(tick(), t0, 0.14)
sfx(tone(587.3, 0.14, a=0.004, r=0.12), 19.42, 0.22)   # viewing booked
sfx(tone(880.0, 0.26, a=0.004, r=0.22), 19.56, 0.24)

# ---- 0:18-0:25  WhatsApp: one soft missed-call cue, then a clean message tone
sfx(tone(392.0, 0.20, a=0.006, r=0.18), 20.88, 0.17)   # unanswered, falling
sfx(tone(311.1, 0.32, a=0.006, r=0.28), 21.04, 0.17)
sfx(tone(1318.5, 0.09, a=0.003, r=0.08), 21.92, 0.26)  # WhatsApp-style two-tone
sfx(tone(1760.0, 0.14, a=0.003, r=0.12), 21.99, 0.22)
for t0 in (24.40, 24.66, 24.92):                       # Brochure / Payment / Project
    sfx(tick(), t0, 0.24); sfx(blip(1244.5, 0.05), t0, 0.15)
sfx(tick(), 24.58, 0.20); sfx(blip(1046.5, 0.06), 24.60, 0.16)   # CTA row 1 opens
sfx(tick(), 26.16, 0.20); sfx(blip(1160.0, 0.06), 26.18, 0.16)   # CTA row 2 opens

# ---- 0:25-0:31  outcome: soft success confirmations as leads turn active
for k in range(5):
    sfx(blip(1400 + k * 60, 0.05), 28.56 + k * 0.16, 0.16)
sfx(tone(659.3, 0.12, a=0.004, r=0.10), 29.42, 0.18)
sfx(tone(987.8, 0.20, a=0.004, r=0.18), 29.52, 0.18)

# ---- final CTA: one restrained branded impact, no cinematic boom
sfx(whoosh(0.42, up=True), 32.50, 0.20)
sfx(tone(523.3, 0.55, a=0.004, r=0.50), 32.86, 0.20)
sfx(tone(784.0, 0.50, a=0.004, r=0.46), 32.88, 0.13)

# ==================================================================== MASTER
def duck(buf_l, buf_r, depth_db, key_db, edge=0.16):
    """Pull the bus down under every narration line, a little further under the
    phrases the brief asks to be emphasised. Cosine edges, so no pumping."""
    g = np.ones(N)
    def dip(a, b, db):
        s, e = max(0, idx(a - edge)), min(N, idx(b + edge))
        if e <= s: return
        target = 10 ** (-abs(db) / 20.0)
        w = np.full(e - s, target)
        ne = max(1, idx(edge))
        ramp = (1 - np.cos(np.linspace(0, np.pi, ne))) / 2
        w[:ne] = 1 + (target - 1) * ramp
        w[-ne:] = target + (1 - target) * ramp
        g[s:e] = np.minimum(g[s:e], w)
    for a, b in VO:  dip(a, b, depth_db)
    for a, b in KEY: dip(a, b, key_db)
    return buf_l * g, buf_r * g

ML, MR = duck(ML, MR, 3.5, 6.0)      # music ducks under the voice
XL, XR = duck(XL, XR, 1.0, 2.0)      # sfx barely ducks — it is already sparse

def master(bl, br, rms_dbfs, fade_out=1.2):
    st = np.stack([bl, br], axis=1)
    st = np.tanh(st * 0.9)
    fi, fo = int(0.06 * SR), int(fade_out * SR)
    st[:fi] *= np.linspace(0, 1, fi)[:, None]
    st[-fo:] *= np.linspace(1, 0, fo)[:, None]
    rms = np.sqrt(np.mean(st[np.abs(st).max(axis=1) > 1e-4] ** 2)) if np.any(np.abs(st) > 1e-4) else 1.0
    st *= (10 ** (rms_dbfs / 20.0)) / (rms + 1e-9)
    peak = np.max(np.abs(st))
    if peak > 0.85:
        st *= 0.85 / peak
    return st.astype(np.float32)

out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "audio")
music = master(ML, MR, -38.0, fade_out=0.8)   # ~20 dB under the -15 LUFS voice
sfx_b = master(XL, XR, -33.0, fade_out=0.5)   # ~15 dB under the voice
for name, buf in (("music.wav", music), ("sfx.wav", sfx_b)):
    p = os.path.join(out_dir, name)
    sf.write(p, buf, SR, subtype="PCM_16")
    print("wrote", os.path.normpath(p), round(len(buf) / SR, 2), "s",
          "peak", round(20 * np.log10(np.max(np.abs(buf)) + 1e-9), 1), "dBFS")
