#!/usr/bin/env python3
"""10s score for the DoubleTick 'governed system' clip (music + SFX, one stem).

Reuses the synth helpers from ../../doubletick-bfsi/audio/build_audio.py and
cues every hit to the picture timing in index.html.
"""

import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "..", "doubletick-bfsi", "audio"))
import build_audio as B  # noqa: E402

SR = B.SR
END = 10.0
N = int(SR * END)
rng = np.random.default_rng(10)


def main():
    bus = np.zeros((N, 2))
    pads = np.zeros((N, 2))
    drums = np.zeros((N, 2))
    beat = 0.5  # 120 BPM; the burst lands on a downbeat at 2.1
    g0 = 0.1

    # --- harmony: tense and sparse for the problem, opening wide at the snap ---
    chords = [
        (0.0, 1.7, [50, 57, 62, 66, 69], 1700, 0.5),  # D(add9): the hook
        (1.7, 3.3, [47, 54, 57, 62, 64], 1100, 0.42),  # Bm(add11), darker: the problem
        (3.55, 4.4, [55, 59, 62, 66, 74], 2900, 0.58),  # Gmaj7: the system
        (4.4, 5.0, [57, 61, 64, 69, 76], 3000, 0.55),  # A6
        (5.0, 7.0, [55, 59, 62, 66, 69, 74], 2200, 0.5),  # Gmaj9 under the frame
        (7.4, 10.0, [50, 57, 61, 64, 66, 69, 76], 3200, 0.62),  # Dmaj9 resolve
    ]
    for t0, t1, notes, cut, g in chords:
        B.place(pads, B.pad_chord(notes, t1 - t0, cut, att=0.04 if t0 == 0 else 0.25, rel=0.9), t0, g)
    for t0, r in [(3.55, 43), (4.4, 45), (5.0, 43)]:
        for k in range(6 if t0 < 5 else 4):
            tb = t0 + k * beat / 2
            if tb > 7.0:
                break
            B.place(bus, B.bass_note(B.midi(r - 12), beat / 2 * 0.9), tb, 0.34)
    B.place(bus, B.bass_note(B.midi(38 - 12), 2.2), 8.3, 0.4)

    # --- rhythm: hook pulse, heartbeat under the problem, full groove at the snap ---
    for i in range(int(END / (beat / 2))):
        tb = i * beat / 2
        if tb < 1.7:
            B.place(drums, B.hat(), tb, 0.06 if i % 2 else 0.09, pan=0.3)
            if i % 4 == 0:
                B.place(drums, B.kick(0.7), tb, 0.5)
        elif tb < 3.3:
            if i % 4 == 0:
                B.place(drums, B.kick(0.5), tb, 0.45)
        elif 3.55 <= tb < 5.0:
            if i % 2 == 0:
                B.place(drums, B.kick(0.95), tb, 0.62)
            if i % 4 == 2:
                B.place(drums, B.clap(), tb, 0.24)
            B.place(drums, B.hat(open_=(i % 4 == 3)), tb, 0.07, pan=0.3)
            B.place(drums, B.shaker(), tb + beat / 4, 0.04, pan=-0.35)
        elif 5.0 <= tb < 7.0:
            B.place(drums, B.hat(), tb, 0.045, pan=0.25)
    arp = [62, 66, 69, 74, 69, 66, 71, 74]
    for i in range(12):
        B.place(bus, B.pluck(B.midi(arp[i % 8] + 12)), 3.55 + i * beat / 4, 0.065, pan=0.35 if i % 2 else -0.35)

    mix = bus + pads * 0.85 + drums
    mix = B.reverb(mix, B.reverb_ir(2.2), 0.22)

    # --- sound design ---
    fx = np.zeros((N, 2))
    # frame 0: an immediate, confident hit
    B.place(fx, B.s_lowpulse(), 0.0, 0.7)
    B.place(fx, B.s_snap(), 0.0, 0.45)
    B.place(fx, B.s_tick(2600, 0.7), 0.25, 0.25)
    # beat B: phones pop, documents thud onto them, warning tags
    for i in range(3):
        B.place(fx, B.s_pop(), 1.7 + i * 0.07, 0.3, pan=-0.5 + i * 0.5)
    for j in range(10):
        B.place(fx, B.s_tick(900 + (j % 3) * 150, 0.8), 2.35 + j * 0.07, 0.22, pan=float(rng.uniform(-0.6, 0.6)))
    B.place(fx, B.s_tension(1.2), 2.0, 1.2)
    for i in range(3):
        B.place(fx, B.s_stop(), 2.55 + i * 0.12, 0.28, pan=-0.5 + i * 0.5)
    # beat C: everything is pulled into the hub, then the system bursts
    B.place(fx, B.s_rise(0.3), 3.22, 0.9)
    B.place(fx, B.s_whoosh(0.35, 600, 3600, 1.0), 3.2, 0.55)
    B.place(fx, B.s_snap(), 3.55, 0.6)
    B.place(fx, B.s_lowpulse(), 3.55, 0.7)
    for i in range(26):
        B.place(fx, B.s_tick(1800 + rng.integers(0, 1800), 0.4), 3.57 + i * 0.022, 0.15, pan=float(rng.uniform(-0.7, 0.7)))
    # push into the frame
    B.place(fx, B.s_tap(), 4.98, 0.6)
    B.place(fx, B.s_snap(), 5.12, 0.4)
    B.place(fx, B.s_sweep(), 5.4, 0.45)
    # exit + light leak
    B.place(fx, B.s_whoosh(0.6, 500, 4200, 0.9), 6.95, 0.5)
    # dots arrive, lines connect, logo resolves
    for i in range(7):
        B.place(fx, B.s_tick(2900 + i * 140, 0.6), 7.42 + i * 0.05 + 0.5, 0.22, pan=-0.3 + i * 0.1)
    B.place(fx, B.s_rise(0.45), 8.0, 0.6)
    B.place(fx, B.s_resolve(), 8.5, 0.9)
    B.place(fx, B.s_chime(), 8.55, 0.45)

    out = mix * 0.9 + B.norm_peak(fx, -12.0)
    # tail
    fo = int(9.2 * SR)
    out[fo:] *= np.linspace(1, 0, N - fo)[:, None] ** 1.4
    fi = int(0.004 * SR)
    out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out = B.to_lufs(B.hp(out.T, 30).T, -15.0)
    os.makedirs(os.path.join(ROOT, "assets", "audio"), exist_ok=True)
    sf.write(os.path.join(ROOT, "assets", "audio", "score.wav"), out, SR, subtype="PCM_24")
    print("ok")


if __name__ == "__main__":
    main()
