# Piramal Finance × DoubleTick AI Voice — customer story

1080 × 1080 · 30 fps · H.264 + AAC · 30.0 s

Final export: [`renders/piramal-finance-doubletick-case-study-1080x1080.mp4`](renders/piramal-finance-doubletick-case-study-1080x1080.mp4)

## Timing

`scripts/build_vo.py` cuts the supplied ElevenLabs voiceover (44.4 s) to a 30 s edit:

- **Dropped:**
  - "on pending documents, payments, dropped applications and channel partners"
  - "understood their requirements,"
  - "At scale, this delivered:"
  - the 51.6% document follow-up connect-rate line and its slide
- **New KPI copy, edited from the original words:**
  - "five thousand · plus calls attempted," (5,000+)
  - "one thousand three hundred · plus · completed customer conversations." (1,300+); this "plus" is reused from the first number
- **Inserted:** "At scale, in a day:" is the only phrase not in the original recording. It was generated with ElevenLabs in the same voice (Aaditya – Healthcare Advisor, `eleven_v4`), saved as `assets/audio/vo-insert-at-scale-in-a-day.mp3`, and level-matched to the surrounding narration.
- **Speed:** pauses tightened, then the whole take is stretched to 1.10× with rubberband (pitch and formants preserved).

The script also writes `assets/audio/timemap.json`: an old→new time map that drives the picture, captions, music and SFX. The scene choreography in `index.html` stays authored on the original word timings and is remapped at build time.

| Scene | Time | Beat |
| --- | --- | --- |
| 01 Hook | 0.0 – 4.4 | Red-toned hook: headline, Piramal logo and cards on screen from frame 0; PENDING flags pile up as the field pushes in |
| 02 Problem | 4.4 – 7.8 | Four use-case columns; one call completes, one stalls, then the whole board tips into "Pending" on "couldn't scale" |
| 03 Solution | 7.8 – 10.8 | Pending card morphs into the Piramal Loan Follow-up campaign row |
| 04 Outreach | 10.8 – 14.2 | Row → live AI call → transcript → intent chips (Reach / Understand / Capture intent) |
| 05 Handoff | 14.2 – 17.2 | AI-resolved path steps back; complex case routed to an RM with context |
| 06–07 KPIs | 17.2 – 25.2 | "At scale, in a day." headline → 5,000+ calls attempted → 1,300+ completed customer conversations (each "+" lands on the spoken "plus") |
| 08 End | 25.2 – 30.0 | Manual → intelligent conversations; DoubleTick lockup + "Apply for Free Pilot" |

All customer, RM and campaign data on screen is fictional. No phone numbers are shown.

## Audio

- `assets/audio/voiceover-original.mp3` is the file as supplied. `voiceover.wav` is the 30 s edit described above, including the one inserted ElevenLabs phrase. Cleanup is light: 75 Hz high-pass, small EQ, mild de-ess, 2.2:1 compression, −17 LUFS and a −4 dBFS peak limit.
- `music.wav` and `sfx.wav` are original and synthesised offline by `scripts/build_audio.py` (seeded, deterministic). No catalogue or AI music service was reachable from the build environment.
  - **Music:** an upbeat 120 BPM four-on-the-floor track in D major (I–V–vi–IV). It has a 16th-note pluck hook (tempo fitted to ~116 BPM so the drops land on the beat), offbeat bass with sidechain pump, and claps and hats. Snare-roll builds and crashes hit the drops at the DoubleTick AI Voice reveal and the KPI section, and a big D-chord resolve lands on the end lockup.
  - **Ducking:** the music ducks against the voiceover envelope, with extra dips under the solution line and each KPI.
  - **SFX:** layered impacts (sub boom, punch body, transient crack and tail, plus a tonal chord on the big ones), with risers cresting on the headline beats, "DoubleTick AI Voice", each KPI and the end lockup.
  - **Peak limiter:** a look-ahead limiter pulls down only the music and SFX wherever the summed mix would pass −1.8 dBFS. The voiceover is never touched.
- Final mix: −15.0 LUFS integrated, −1.7 dBFS peak.

## Rebuild

```bash
python3 scripts/build_vo.py           # VO edit + timemap (needs ffmpeg with rubberband)
python3 scripts/build_audio.py        # music + SFX on the same map (numpy + scipy)
npx hyperframes@0.8.91 check
npx hyperframes@0.8.91 render -q delivery --crf 14 -f 30 \
  -o renders/piramal-finance-doubletick-case-study-1080x1080.mp4
```

Fonts (Hedvig Letters Serif, Geist; SIL OFL) and GSAP are vendored in `assets/`, so a render makes no network requests.
