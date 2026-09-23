# DoubleTick customer stories: 1080 × 1080

A narrated customer-proof film for DoubleTick's BFSI customers, built with HyperFrames.

- Composition ID: `doubletick-customer-stories-1080-square`, in `index.html`
- 1080 × 1080, 30 fps, about 2:03 (123.0 s). Narration sets the timing.
- Output: `renders/doubletick-customer-stories-1080-square.mp4` (H.264 + AAC, −14 LUFS)

## Content lock

Every customer string (problem, solution, bullets, metrics, opening and CTA copy) is in
`scripts/customer-data.js`. Each one is copied verbatim from the source doc
`customers_carousels` (Google Drive, BFSI section). The layout code never contains copy.

- Change copy in `customer-data.js` only. Don't edit the scene scripts for copy.
- Some source details are kept on purpose:
  - "lifecycle !" and "govern !" keep the space before the "!". A non-breaking space stops the mark from wrapping onto its own line.
  - "Samar capital" is stored as written in the source. CSS uppercases every customer name for display.
  - The Piramal solution keeps its spaced hyphen: "collections - escalating".
- The recap (scene 07) repeats metrics that the stories already showed. It adds nothing new.
- The narration uses phrases from the PDF only. The optional recap line ("Customer outcomes across banking, lending, wealth and fintech") was left out to keep the narration strictly PDF-only. Music carries the recap instead.

## Structure

```
index.html                 root composition: clips, audio tracks, script order
styles/tokens.css          brand tokens (--dt-*), with source status noted per token
styles/layout.css          frame, safe area (80/76/86 px), zones, persistent header
styles/components.css      header, problem, solution, bullets, metric tile, cards, CTA
styles/scenes.css          scene-specific styling
scripts/customer-data.js   CONTENT LOCK: all copy + metrics
scripts/vo-timing.js       generated: narration line + word timings (window.VO)
scripts/components.js      helpers: cue(), Indian number format, component builders
scripts/customer-scene.js  shared identity → problem → solution → bullets → impact phases
scripts/scene-01..08.js    one file per scene (product metaphor + seam transition)
scripts/main.js            builds the single paused root timeline
build/voiceover.py         narration: Kokoro TTS, Indian-English voice, pronunciation fixes
build/asr.py               local ASR: narration QA + word timestamps for visual sync
build/music.py             original 112 BPM music bed, arranged to the scene map
build/apply-timing.py      writes clip timings and the music duck envelope into index.html
build/finalize.sh          loudness pass: −14 LUFS integrated, −1.5 dBTP
assets/logos               DoubleTick logo (official asset) + official customer logos (au, pf, ww, cd, sc .png)
assets/audio               narration.wav, music.wav, sfx/ (Pixabay licence, see CREDITS.md)
assets/fonts               fallback brand font (Plus Jakarta Sans, OFL)
assets/vendor/gsap.min.js  GSAP 3.14.2, local so renders need no network
```

## Rebuilding

```bash
python3 build/voiceover.py      # needs: pip install kokoro-onnx soundfile scipy sherpa-onnx
python3 build/music.py
python3 build/apply-timing.py   # re-stamp clip timings + duck lane after any VO change
npx hyperframes lint && npx hyperframes check
npx hyperframes render --fps 30 --output renders/doubletick-customer-stories-1080-square.raw.mp4
bash build/finalize.sh          # loudness-normalise → final .mp4
```

Note: in `hyperframes@0.8.64`, `render -c` takes a composition *file*. This film is `index.html`, the default, so `-c` isn't needed.

## Audio

- **Voice**: Kokoro-82M on the local machine. It blends the two Hindi male voices (`hm_omega` + `hm_psi`) reading English phonemes, which gives a mature Indian-English male read.
  - Speed is 0.95×. Spoken lines run at about 130–140 wpm.
  - Pronunciation is fixed at the phoneme level:
    - RM → "R-M"
    - BFSI → "B-F-S-I"
    - AU → "A-U"
    - Piramal → "Pi-RAA-mal"
    - Samar → "SUH-maar"
    - lakhs → "laakhs"
    - Every t is un-flapped (automates, capital).
  - A local ASR pass checked every line.
- **Music**: an original piece in `build/music.py`. Seeded, so it rebuilds identically. 112 BPM, D major. It runs as one continuous track: minimal intro → light rhythm → percussion → steady momentum → lift at the recap → open resolve at the CTA.
- **Mix**: the music drops about 4.2 dB under narration through a `data-automation` volume lane with soft attack and release. It lifts in the recap.
  - SFX sit about 12–18 dB under the voice, with at most 1–2 per scene.
  - `build/finalize.sh` normalises the render to −14 LUFS integrated with a −1.5 dBTP ceiling (linear gain, no extra compression).

## Open items (need your input or network access)

1. **doubletick.io was blocked** by this environment's network policy, so nothing could be read from the live site: font family, dark greens, button style, radii, shadows.
   - `--dt-green #28B379` is verified. It was sampled from the official logo.
   - Every other token is derived from it and marked UNVERIFIED in `styles/tokens.css`.
   - The font is a declared fallback: `--dt-font-brand` → Plus Jakarta Sans.
   - Put the site's computed values into `tokens.css`. The film then updates everywhere.
2. **Customer logos**: the official logos supplied are reversed artwork with white lettering. Each one sits unaltered on a dark DoubleTick-green plate (212 × 72, `object-fit: contain`) in the story header and the recap. To swap one, replace `assets/logos/<id>.png`.
3. **Duration**: the brief asked for 50–60 s. At a natural pace, the required narration alone runs about 96 s. Add designed pauses and reading holds for the full on-screen copy, and the film comes to 2:19. Nothing was sped up or cut.
4. **Voice**: ElevenLabs "Aaditya K - Soothing Midnight Storyteller" (`qWdiyiWdNPlPyVCOLW0h`, eleven_multilingual_v2), generated through the ElevenLabs connector. The takes are in `build/vo-takes/`. `build/voiceover.py` (provider `takes`) shortens long internal pauses, then applies a pitch-preserving tempo so every full sentence runs at 145–160 wpm. Short name lines keep their natural read.
