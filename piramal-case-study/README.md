# Piramal Finance × DoubleTick AI Voice — customer story

1080 × 1080 · 30 fps · H.264 + AAC · 30.0 s

Final export: [`renders/piramal-finance-doubletick-case-study-1080x1080.mp4`](renders/piramal-finance-doubletick-case-study-1080x1080.mp4)

## Timing

The supplied ElevenLabs voiceover (44.4 s) is cut to a 30 s edit by `scripts/build_vo.py`:

- **Dropped clauses:**
  - "on pending documents, payments, dropped applications and channel partners"
  - "understood their requirements,"
  - "At scale, this delivered:"
- **Pauses:** tightened.
- **Speed:** the remaining take is stretched to 1.19× with rubberband (pitch and formants preserved).
- **Wording and narrator:** everything kept is the original take, word for word.

The script also writes `assets/audio/timemap.json`: an old→new time map that drives the picture, captions, music and SFX. The scene choreography in `index.html` stays authored on the original word timings and is remapped at build time.

| Scene | Time | Beat |
| --- | --- | --- |
| 01 Hook | 0.0 – 4.0 | Red-toned hook: headline, Piramal logo and cards on screen from frame 0; PENDING flags pile up as the field pushes in |
| 02 Problem | 4.0 – 7.2 | Four use-case columns; one manual caller vs. growing pending queue (red tint eases out) |
| 03 Solution | 7.2 – 10.0 | Pending card morphs into the Piramal Loan Follow-up campaign row |
| 04 Outreach | 10.0 – 12.9 | Row → live AI call → transcript → intent chips (Reach / Understand / Capture intent) |
| 05 Handoff | 12.9 – 15.5 | AI-resolved path steps back; complex case routed to an RM with context |
| 06–08 KPIs | 15.5 – 25.2 | 5,704+ · 1,343 · 51.6% (odometer rolls land on the spoken number) |
| 09 End | 25.2 – 30.0 | Manual → intelligent conversations; DoubleTick lockup + "Apply for Free Pilot" |

All customer, RM and campaign data on screen is fictional. No phone numbers are shown.

## Audio

- `assets/audio/voiceover-original.mp3` is the file as supplied. `voiceover.wav` is the 30 s edit described above. Cleanup is light: 75 Hz high-pass, small EQ, mild de-ess, 2.2:1 compression, −17 LUFS and a −4 dBFS peak limit.
- `music.wav` and `sfx.wav` are original and synthesised offline by `scripts/build_audio.py` (seeded, deterministic). No catalogue or AI music service was reachable from the build environment.
  - **Music:** an upbeat 120 BPM four-on-the-floor track in D major (I–V–vi–IV). It has a 16th-note pluck hook (tempo fitted to ~116 BPM so the drops land on the beat), offbeat bass with sidechain pump, and claps and hats. Snare-roll builds and crashes hit the drops at the DoubleTick AI Voice reveal and the KPI section, and a big D-chord resolve lands on the end lockup.
  - **Ducking:** the music ducks against the voiceover envelope, with extra dips under the solution line and each KPI.
  - **SFX:** layered impacts (sub boom, punch body, transient crack and tail, plus a tonal chord on the big ones), with risers cresting on the headline beats, "DoubleTick AI Voice", each KPI and the end lockup.
  - **Peak limiter:** a look-ahead limiter pulls down only the music and SFX wherever the summed mix would pass −1.8 dBFS. The voiceover is never touched.
- Final mix: −14.8 LUFS integrated, −1.8 dBFS peak.

## Rebuild

```bash
python3 scripts/build_vo.py           # VO edit + timemap (needs ffmpeg with rubberband)
python3 scripts/build_audio.py        # music + SFX on the same map (numpy + scipy)
npx hyperframes@0.8.91 check
npx hyperframes@0.8.91 render -q delivery --crf 14 -f 30 \
  -o renders/piramal-finance-doubletick-case-study-1080x1080.mp4
```

Fonts (Hedvig Letters Serif, Geist; SIL OFL) and GSAP are vendored in `assets/`, so a render makes no network requests.
