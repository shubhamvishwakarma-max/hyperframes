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

    # --- harmony: airy D major colours, opening wider at the burst ---
    chords = [
        (0.0, 2.1, [57, 62, 66, 69, 76], 1500, 0.5),  # Dadd9, filtered
        (2.1, 3.0, [55, 59, 62, 66, 74], 2600, 0.55),  # Gmaj7
        (3.1, 4.0, [57, 61, 64, 69, 76], 2800, 0.55),  # A6
        (4.1, 5.0, [59, 62, 66, 71, 78], 3000, 0.55),  # Bm(add11)
        (5.0, 7.0, [55, 59, 62, 66, 69, 74], 2200, 0.5),  # Gmaj9 under the frame
        (7.4, 10.0, [50, 57, 61, 64, 66, 69, 76], 3200, 0.62),  # Dmaj9 resolve
    ]
    for t0, t1, notes, cut, g in chords:
        B.place(pads, B.pad_chord(notes, t1 - t0, cut, att=0.25 if t0 else 0.5, rel=0.9), t0, g)
    roots = [(2.1, 43), (3.1, 45), (4.1, 47), (5.0, 43)]
    for t0, r in roots:
        for k in range(8 if t0 < 5 else 4):
            tb = t0 + k * beat / 2
            if tb > 7.0:
                break
            B.place(bus, B.bass_note(B.midi(r - 12), beat / 2 * 0.9), tb, 0.32)
    B.place(bus, B.bass_note(B.midi(38 - 12), 2.2), 8.3, 0.4)

    # --- rhythm: ticking intro, a real pulse through the burst, air under the frame ---
    for i in range(int(END / (beat / 2))):
        tb = g0 + i * beat / 2
        if tb < 2.1:
            B.place(drums, B.hat(), tb, 0.05 if i % 2 else 0.08, pan=0.3)
        elif tb < 5.0:
            if i % 2 == 0:
                B.place(drums, B.kick(0.9), tb, 0.6)
            if i % 4 == 2:
                B.place(drums, B.clap(), tb, 0.22)
            B.place(drums, B.hat(open_=(i % 4 == 3)), tb, 0.07, pan=0.3)
            B.place(drums, B.shaker(), tb + beat / 4, 0.04, pan=-0.35)
        elif tb < 7.0:
            B.place(drums, B.hat(), tb, 0.045, pan=0.25)
    # pluck arpeggio through the burst
    arp = [62, 66, 69, 74, 69, 66, 71, 74]
    for i in range(24):
        tp = 2.1 + i * beat / 4
        B.place(bus, B.pluck(B.midi(arp[i % 8] + 12)), tp, 0.06, pan=0.35 if i % 2 else -0.35)

    mix = bus + pads * 0.85 + drums
    mix = B.reverb(mix, B.reverb_ir(2.2), 0.24)

    # --- sound design ---
    fx = np.zeros((N, 2))
    # letter ticks for the kinetic words
    for t0, n in ((0.12, 11), (1.12, 15)):
        for i in range(n):
            B.place(fx, B.s_tick(2400 + (i % 4) * 260, 0.35), t0 + i * 0.034, 0.18, pan=-0.4 + i * 0.06)
    # burst: whoosh + sub + one tiny tick per tile
    B.place(fx, B.s_whoosh(0.7, 300, 3200, 1.0), 1.75, 0.55)
    B.place(fx, B.s_lowpulse(), 2.1, 0.55)
    for i in range(26):
        B.place(fx, B.s_tick(1800 + rng.integers(0, 1800), 0.4), 2.14 + i * 0.03, 0.16, pan=float(rng.uniform(-0.7, 0.7)))
    # push into the frame
    B.place(fx, B.s_rise(0.6), 4.4, 0.8)
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
    fi = int(0.06 * SR)
    out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out = B.to_lufs(B.hp(out.T, 30).T, -15.0)
    os.makedirs(os.path.join(ROOT, "assets", "audio"), exist_ok=True)
    sf.write(os.path.join(ROOT, "assets", "audio", "score.wav"), out, SR, subtype="PCM_24")
    print("ok")


if __name__ == "__main__":
    main()
