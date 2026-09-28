# Piramal Finance × DoubleTick: 30s lead-gen film

A 1080 × 1080, 30 fps, H.264 + AAC Remotion film, built entirely in code (React + TypeScript + SVG).

**Final render:** `output/doubletick-piramal-finance-leadgen.mp4` (30.5 s, -14 LUFS, -1.5 dBTP)

## Build

```bash
npm install
npm run setup:fonts     # Geist + Geist Mono → public/fonts
npm run audio           # music bed + SFX kit → public/audio (python3 + numpy/scipy)
REMOTION_BROWSER=/path/to/chrome-headless-shell npm run render
npm run master          # two-pass loudness master → output/…mp4
npm run studio          # scrub the timeline interactively
```

## How it's put together

- **Narration is the master clock.** `src/data/narration.json` holds word-level timestamps. `src/lib/timing.ts` turns key phrases (such as "DoubleTick AI Voice", "channel partners" and "human intervention") into frame anchors, and every animation, subtitle cue and SFX hangs off those anchors.
- **One continuous visual system, no scene cuts.**
  - Task cards pile up around an overloaded RM, then a green pulse organises them into the AI Voice queue.
  - The first queue row expands into the AI Voice call card, which shrinks when the loan-lifecycle rail snaps in.
  - The call card morphs into the DoubleTick Customer Context card beside the Piramal WhatsApp chat.
  - The customer's reply emits a data pulse, and the card detects intent and hands off to the RM.
  - The handoff card compresses into the RM node of the AI Voice → WhatsApp → Intent → RM workflow. That workflow becomes the pill rail under the kinetic type, then the faded background of the CTA. (`src/components/JourneyCard.tsx`, `WorkflowPath.tsx`)
- **Subtitles** are phrase-level cues built from the real alignment (`src/lib/script.ts`, `Subtitle.tsx`).
- **Audio:**
  - The voiceover sits at -16 LUFS.
  - The music bed is ducked under the narration (fast attack, slow release) and sits about 13–14 dB below the voice.
  - The SFX cue sheet is in `src/lib/sfx.ts`.

## Provenance and deviations (please read)

| Item | What happened |
|---|---|
| **Voice** | The account has no voice named exactly "Aaditya - Healthcare Advisor". The closest match, **"Aaditya K - Deep Voice for Finance & Healthcare Support"** (`SVdvKlYuyNTd1xzQqLWD`, `eleven_multilingual_v2`), was used after asking. Swap it by re-running `scripts/generateNarration.ts` with `VOICE_NAME` set. |
| **VO length** | Natural takes ran 39–42 s. Pauses were tightened, then a **1.19× pitch- and formant-preserving stretch** (rubberband) brought the voiceover to 29.15 s. The script is unchanged. At this length the read is brisk; a longer cut (about 35 s) would allow a slower read. |
| **Timestamps** | `ELEVENLABS_API_KEY` wasn't available in the build container, and the account ran out of credits for Scribe. Word timings come from local forced alignment (pocketsphinx) against the exact script. |
| **Music and SFX** | Synthesised in `scripts/generate_audio.py` (112 BPM; minimal pulse → build → fuller → peak → resolve on Cmaj9), because the ElevenLabs credits were exhausted. It's deterministic and royalty-free. Replace `public/audio/music.wav` with a licensed track if preferred; ducking is applied automatically. |
| **Logos** | doubletick.io and piramalfinance.com were blocked by the container's network policy. Both logos were taken at native resolution from the official *dt_piramal_caraousel.pdf* creative (Google Drive) and keyed to transparent PNGs. Drop official SVGs into `public/logos/` (same filenames, `.png` → `.svg` in `DoubleTickLogo.tsx` / `PiramalLogo.tsx`) for vector crispness. |
| **Brand palette** | Canvas `#F4F4EC` and green `#017A5B`, sampled from the same official creative. |

The names Rohan Mehta and Priya Sharma, plus the queue entries, are illustrative UI content. The "58" follow-up counter is an illustrative UI state, not a claimed metric.
