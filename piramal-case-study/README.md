# Piramal Finance × DoubleTick AI Voice — customer story

1080 × 1080 · 30 fps · H.264 + AAC · 46.0 s

Final export: [`renders/piramal-finance-doubletick-case-study-1080x1080.mp4`](renders/piramal-finance-doubletick-case-study-1080x1080.mp4)

## Timing

The supplied ElevenLabs voiceover is the master track, and it runs 44.4 s. Because it must stay unaltered (same narrator, wording and pacing), the cut is 46 s rather than the 30 s in the brief: the voiceover plus a short end-frame hold. Every scene is keyed to word timings from a forced alignment of the audio against the script:

| Scene | Time | Beat |
| --- | --- | --- |
| 01 Hook | 0.0 – 4.9 | Hook, Piramal logo and 12 cards on screen from frame 0; cards keep multiplying outward |
| 02 Problem | 4.9 – 13.7 | Four use-case columns; one manual caller vs. growing pending queue |
| 03 Solution | 13.7 – 17.1 | Pending card morphs into the Piramal Loan Follow-up campaign row |
| 04 Outreach | 17.1 – 22.2 | Row → live AI call → transcript → intent chips (Reach / Understand / Capture intent) |
| 05 Handoff | 22.2 – 25.8 | AI-resolved path steps back; complex case routed to an RM with context |
| 06–08 KPIs | 25.8 – 39.0 | 5,704+ · 1,343 · 51.6% (odometer rolls land on the spoken number) |
| 09 End | 39.0 – 46.0 | Manual → intelligent conversations; DoubleTick lockup |

All customer, RM and campaign data on screen is fictional. No phone numbers are shown.

## Audio

- `assets/audio/voiceover-original.mp3` is the file as supplied. `voiceover.wav` is the same take with light processing only: 75 Hz high-pass, small EQ, mild de-ess, 2.2:1 compression, and gain to −17 LUFS. Duration and timing are unchanged; the render's VO lag measures 0.00 ms.
- `music.wav` and `sfx.wav` are original and synthesised offline by `scripts/build_audio.py` (seeded, deterministic). No catalogue or AI music service was reachable from the build environment.
  - **Music:** an upbeat 120 BPM four-on-the-floor track in D major (I–V–vi–IV). It has a 16th-note pluck hook, offbeat bass with sidechain pump, and claps and hats. Snare-roll builds and crashes hit the drops at 13.9 s (DoubleTick AI Voice) and 25.9 s (KPIs), and a big D-chord resolve lands at 43.9 s.
  - **Ducking:** the music ducks against the voiceover envelope, with extra dips under the solution line and each KPI.
  - **SFX:** layered impacts (sub boom, punch body, transient crack and tail, plus a tonal chord on the big ones), with risers cresting on the headline beats, "DoubleTick AI Voice", each KPI and the end lockup.
  - **Peak limiter:** a look-ahead limiter pulls down only the music and SFX wherever the summed mix would pass −1.8 dBFS. The voiceover is never touched.
- Final mix: −15.0 LUFS integrated, −1.8 dBFS peak.

## Rebuild

```bash
python3 scripts/build_audio.py        # needs numpy + scipy
npx hyperframes@0.8.91 check
npx hyperframes@0.8.91 render -q delivery --crf 14 -f 30 \
  -o renders/piramal-finance-doubletick-case-study-1080x1080.mp4
```

Fonts (Hedvig Letters Serif, Geist; SIL OFL) and GSAP are vendored in `assets/`, so a render makes no network requests.
