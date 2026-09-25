"""Synthesizes the soft UI sound effects into public/sfx (deterministic, no samples)."""
import wave, pathlib
import numpy as np

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)

def tone(f, d, decay, amp, attack=0.004):
    x = np.arange(int(SR * d)) / SR
    env = np.exp(-x * decay) * np.clip(x / attack, 0, 1)
    return (np.sin(2 * np.pi * f * x) + 0.25 * np.sin(2 * np.pi * f * 2 * x)) * env * amp

def mix(*parts):
    n = max(off + len(p) for off, p in parts)
    y = np.zeros(n)
    for off, p in parts:
        y[off:off + len(p)] += p
    return y

def save(name, y):
    fade = np.linspace(1, 0, min(600, len(y)))
    y[-len(fade):] *= fade
    pcm = (np.clip(y, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

ms = lambda t: int(SR * t / 1000)
save("tick.wav", tone(1850, 0.08, 70, 0.35))
save("message.wav", mix((0, tone(988, 0.18, 26, 0.3)), (ms(70), tone(1319, 0.22, 22, 0.28))))
save("connect.wav", mix((0, tone(660, 0.2, 18, 0.28)), (ms(90), tone(880, 0.22, 16, 0.26)), (ms(180), tone(1320, 0.3, 12, 0.22))))
save("reveal.wav", mix((0, tone(523, 0.5, 7, 0.22)), (ms(40), tone(784, 0.5, 7, 0.18)), (ms(80), tone(1047, 0.55, 6, 0.16))))
save("done.wav", mix((0, tone(1175, 0.2, 20, 0.28)), (ms(95), tone(1568, 0.3, 14, 0.26))))
print("sfx written to", OUT)
