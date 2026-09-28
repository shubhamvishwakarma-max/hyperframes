"""Builds the audio stems used by the Remotion composition.

Inputs (audio-src/):  narration_fast.mp3 (ElevenLabs VO, pauses tightened, 1.2x), music_b.mp3 (ElevenLabs music)
Outputs (public/audio/): narration.wav, music.wav (ducked under VO), sfx.wav (synthesised, synced to src/timing.ts)
"""

import json
import subprocess
from pathlib import Path

import numpy as np
import scipy.io.wavfile as wavfile
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "audio-src"
OUT = ROOT / "public" / "audio"
SR = 44100
DUR = 32.0
N = int(SR * DUR)
VO_OFFSET = 0.25
MUSIC_OFFSET = 0.4
rng = np.random.default_rng(7)


def ffmpeg():
    d = ROOT / "node_modules/@remotion/compositor-linux-x64-gnu"
    return str(d / "ffmpeg"), {"LD_LIBRARY_PATH": str(d)}


def load(path: Path, channels=1):
    exe, env = ffmpeg()
    tmp = path.with_suffix(".tmp.wav")
    subprocess.run([exe, "-hide_banner", "-loglevel", "error", "-y", "-i", str(path), "-ac", str(channels), "-ar", str(SR), "-c:a", "pcm_s16le", str(tmp)], check=True, env=env)
    sr, x = wavfile.read(tmp)
    tmp.unlink()
    return x.astype(np.float32) / 32768.0


def db(v):
    return 10 ** (v / 20)


def place(buf, clip, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    clip = clip[: len(buf) - i]
    if buf.ndim == 2 and clip.ndim == 1:
        clip = np.stack([clip, clip], axis=1)
    buf[i : i + len(clip)] += clip * gain


def env(n, attack=0.004, decay=0.1):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


# ---------- SFX palette ----------
def tick(freq=2400, dur=0.05, level=0.35):
    n = int(SR * dur)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) * env(n, 0.001, 0.012)
    noise = signal.lfilter(*signal.butter(2, [2000 / (SR / 2), 9000 / (SR / 2)], "band"), rng.standard_normal(n)) * env(n, 0.0005, 0.006)
    return (tone * 0.7 + noise * 0.5) * level


def pop(f0=520, f1=1150, dur=0.09, level=0.45):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.002, 0.03) * level


def chime(freqs=(1318.5, 1975.5), dur=0.7, level=0.28, stagger=0.045):
    n = int(SR * dur)
    out = np.zeros(n)
    t = np.arange(n) / SR
    for k, f in enumerate(freqs):
        d = int(stagger * k * SR)
        e = env(n - d, 0.003, 0.22)
        out[d:] += (np.sin(2 * np.pi * f * t[: n - d]) + 0.25 * np.sin(2 * np.pi * 2 * f * t[: n - d])) * e
    return out * level / len(freqs)


def whoosh(dur=0.7, level=0.35, f_lo=300, f_hi=4500, peak=0.6):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    y1 = 0.0
    y2 = 0.0
    tt = np.linspace(0, 1, n)
    shape = np.where(tt < peak, tt / peak, (1 - tt) / (1 - peak)) ** 1.6
    fc = f_lo + (f_hi - f_lo) * shape
    alpha = 1 - np.exp(-2 * np.pi * fc / SR)
    for i in range(n):  # time-varying 2-pole lowpass
        y1 += alpha[i] * (x[i] - y1)
        y2 += alpha[i] * (y1 - y2)
        out[i] = y2
    hp = signal.lfilter(*signal.butter(2, 120 / (SR / 2), "high"), out)
    hp /= np.max(np.abs(hp)) + 1e-9
    return hp * shape * level


def thump(level=0.6):
    n = int(SR * 0.45)
    t = np.arange(n) / SR
    f = 95 * np.exp(-t * 6) + 48
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(n, 0.002, 0.16)
    click = tick(1600, 0.03, 0.25)
    return body * level + np.pad(click, (0, n - len(click)))


def soft_blip(f=330, f_end=250, dur=0.28, level=0.3):
    n = int(SR * dur)
    f_arr = np.linspace(f, f_end, n)
    ph = 2 * np.pi * np.cumsum(f_arr) / SR
    tone = np.sin(ph) + 0.3 * np.sin(2 * ph)
    return tone * env(n, 0.01, 0.1) * level


def ring(level=0.12):
    n = int(SR * 0.22)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)
    e = np.clip(t / 0.01, 0, 1) * np.clip((0.22 - t) / 0.03, 0, 1)
    return tone * e * level


def build_sfx():
    sfx = np.zeros((N, 2), dtype=np.float64)
    # Scene 1 — cards landing, counter bumps, going cold
    for i in range(6):
        place(sfx, tick(2100 + i * 90, level=0.22), 0.25 + i * 0.27 + 0.33)
    place(sfx, whoosh(0.35, 0.10, 800, 5000, 0.3), 0.2)
    for t in (1.25, 2.3):
        place(sfx, pop(700, 980, 0.07, 0.22), t)
    place(sfx, soft_blip(360, 300, 0.22, 0.2), 3.35)
    place(sfx, soft_blip(300, 190, 0.45, 0.3), 4.05)
    # Transition — green pulse + organise
    place(sfx, whoosh(0.95, 0.42, 200, 5200, 0.55), 4.72)
    for i in range(3):
        place(sfx, tick(2600 + i * 200, level=0.2), 5.25 + i * 0.08)
    place(sfx, chime((987.8, 1480), 0.6, 0.14), 5.28)  # AU logo
    place(sfx, whoosh(0.55, 0.22, 300, 4000, 0.45), 5.6)
    # Scene 2 — AI voice, WhatsApp
    place(sfx, ring(0.09), 7.0)
    place(sfx, ring(0.09), 7.32)
    place(sfx, chime((880, 1318.5), 0.5, 0.22), 7.75)
    place(sfx, chime((1318.5, 1760), 0.5, 0.14), 8.35)
    place(sfx, whoosh(0.4, 0.14, 800, 6000, 0.5), 8.4)
    for t in (T["msg1"], T["msg2"]):
        place(sfx, pop(480, 1000, 0.09, 0.38), t)
    place(sfx, pop(620, 1250, 0.08, 0.36), T["reply"])
    place(sfx, chime((1568, 2349), 0.7, 0.24), T["highIntent"])
    place(sfx, whoosh(0.45, 0.2, 400, 6000, 0.35), T["atScale"] - 0.05)
    # Scene 3 — routing, ownership, context
    place(sfx, whoosh(0.8, 0.3, 250, 4200, 0.5), 11.2)
    place(sfx, whoosh(0.55, 0.18, 600, 5000, 0.5), T["rightRM"] + 0.05)
    place(sfx, tick(2800, level=0.3), T["routed"])
    place(sfx, chime((1174.7, 1760), 0.5, 0.2), T["routed"] + 0.03)
    place(sfx, whoosh(0.5, 0.16, 400, 3500, 0.5), T["ownershipChanges"])
    place(sfx, chime((1318.5, 1975.5, 2637), 0.9, 0.26, 0.06), T["historyPreserved"])
    place(sfx, whoosh(0.6, 0.18, 300, 3000, 0.4), T["centralized"])
    for i in range(5):
        place(sfx, tick(2200 + i * 150, level=0.16), T["centralized"] + 0.45 + i * 0.16)
    # Scene 4 — impact
    place(sfx, whoosh(0.9, 0.34, 200, 5200, 0.55), 17.8)
    t = T["threeLakh"]
    k = 0
    while t < T["callsResolved"] - 0.05:
        place(sfx, tick(3000 + (k % 5) * 120, 0.03, 0.12), t)
        t += max(0.035, 0.12 - (t - T["threeLakh"]) * 0.06)
        k += 1
    place(sfx, thump(0.55), T["callsResolved"])
    place(sfx, chime((1318.5, 1975.5), 0.6, 0.12), T["callsResolved"] + 0.02)
    place(sfx, whoosh(0.5, 0.18, 400, 4000, 0.4), 21.0)
    place(sfx, whoosh(0.9, 0.16, 300, 3000, 0.8), T["thirtyPercent"])
    place(sfx, thump(0.45), T["thirtyPercent"] + 0.98)
    place(sfx, chime((1568, 2093), 0.6, 0.12), T["thirtyPercent"] + 1.0)
    # Scene 5 — value
    place(sfx, whoosh(0.7, 0.28, 250, 4800, 0.5), 24.95)
    for key in ("automate", "preserve"):
        place(sfx, pop(560, 1100, 0.08, 0.28), T[key])
    place(sfx, pop(560, 1100, 0.08, 0.28), T["startClosing"] - 0.1)
    place(sfx, whoosh(0.5, 0.22, 400, 5200, 0.4), T["startClosing"] - 0.05)
    place(sfx, chime((1318.5, 1975.5, 2637), 0.8, 0.24, 0.05), T["focus"])
    # Scene 6 — CTA
    place(sfx, whoosh(0.9, 0.3, 200, 4800, 0.5), T["ctaStart"] - 0.15)
    place(sfx, chime((1046.5, 1568, 2093), 1.1, 0.3, 0.07), T["ctaStart"] + 0.6)
    place(sfx, tick(2000, 0.04, 0.32), 31.22)
    return sfx.astype(np.float32)


def smooth_env(x, attack=0.05, release=0.35):
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    y = np.zeros_like(x)
    prev = 0.0
    for i, v in enumerate(x):
        c = a if v > prev else r
        prev = c * prev + (1 - c) * v
        y[i] = prev
    return y


def main():
    # --- narration: level to ~-18 dB RMS (voiced), soft-limit peaks
    vo = load(SRC / "narration_fast.mp3")
    voiced = vo[np.abs(vo) > 0.01]
    gain = 10 ** ((-18.5 - 20 * np.log10(np.sqrt(np.mean(voiced**2)))) / 20)
    vo = np.tanh(vo * gain * 1.1) / 1.1
    vo_full = np.zeros(N, dtype=np.float32)
    i = int(VO_OFFSET * SR)
    vo_full[i : i + len(vo)] = vo[: N - i]

    # --- music: delay so the build lands on the transition; duck under the voice
    mu = load(SRC / "music_b.mp3", channels=2)
    mu_full = np.zeros((N, 2), dtype=np.float32)
    j = int(MUSIC_OFFSET * SR)
    mu_full[j : j + len(mu)] = mu[: N - j]
    # activity envelope from VO (block RMS)
    blk = int(0.02 * SR)
    frames = len(vo_full) // blk
    rms = np.sqrt(np.mean(vo_full[: frames * blk].reshape(frames, blk) ** 2, axis=1))
    active = (rms > 0.02).astype(np.float64)
    active = np.repeat(active, blk)
    active = np.pad(active, (0, N - len(active)))
    act = smooth_env(active[::10], 0.08 / 10 * 10, 0.4)  # decimated for speed
    act = np.interp(np.arange(N), np.arange(0, N, 10)[: len(act)], act)
    base = db(-7.5)  # music bed level relative to its master
    duck = db(-8.5)
    g = base * (1 - act * (1 - duck))
    # fade in / out
    t = np.arange(N) / SR
    g *= np.clip((t - MUSIC_OFFSET) / 0.25, 0, 1)
    g *= np.clip((DUR - t) / 1.1, 0, 1)
    g *= 1 + (db(7) - 1) * np.clip((4.45 - t) / 0.35, 0, 1)  # lift the sparse intro so the hook has a pulse
    mu_full *= g[:, None].astype(np.float32)

    sfx = build_sfx()
    sfx *= db(-5)

    OUT.mkdir(parents=True, exist_ok=True)
    exe, envv = ffmpeg()
    for name, data in (("narration", vo_full), ("music", mu_full)):
        tmp = OUT / f"{name}.tmp.wav"
        wavfile.write(tmp, SR, (np.clip(data, -1, 1) * 32767).astype(np.int16))
        subprocess.run([exe, "-hide_banner", "-loglevel", "error", "-y", "-i", str(tmp), "-c:a", "libmp3lame", "-b:a", "256k", str(OUT / f"{name}.mp3")], check=True, env=envv)
        tmp.unlink()
    wavfile.write(OUT / "sfx.wav", SR, (np.clip(sfx, -1, 1) * 32767).astype(np.int16))

    mix = np.stack([vo_full, vo_full], 1) + mu_full + sfx
    peak = np.max(np.abs(mix))
    print(json.dumps({"mix_peak_db": round(float(20 * np.log10(peak)), 2), "vo_gain_db": round(float(20 * np.log10(gain)), 2)}))


def read_timing():
    """Beat times come from src/timing.ts so picture and sound share one source of truth."""
    import re

    text = (ROOT / "src" / "timing.ts").read_text()
    body = text[text.index("export const T") :]
    return {k: float(v) for k, v in re.findall(r"^\s+(\w+):\s*([0-9.]+),", body, re.M)}


T = read_timing()
if __name__ == "__main__":
    main()
