# DoubleTick × AU Small Finance Bank × Piramal Finance — customer story

Remotion + React + TypeScript. 1080×1080, 30 fps, H.264 + AAC.
Output: `out/doubletick-au-piramal-ai-voice-whatsapp.mp4`.

## Structure

| Section | Driven by narration cue |
|---|---|
| Hook — "Still chasing lakhs of leads manually?" | `hook` |
| AU Small Finance Bank — 3,12,945+ outbound AI calls | `au`, `auDoubleTick`, `auWhatsApp`, `auMetric`, `auRm` |
| Piramal Finance — 90% reduction in RM response time | `piramal`, `pDoubleTick`, `pChannels`, `pChip1…4`, `pMetric` |
| Solution — New lead → AI Voice → WhatsApp → High intent → RM | `solution` |
| CTA — Book a Demo (held 2.2 s after the last word) | `cta` |

All visual beats read their times from `src/narration-timing.json`, so the film re-syncs
automatically whenever the narration is regenerated.

## Build

```bash
npm install
python3 scripts/make-sfx.py                       # soft UI sound effects → public/sfx
ELEVENLABS_API_KEY=... npm run narration          # voice "Aaditya - Healthcare Advisor" → public/audio/narration.mp3 + cue sync
npm run render                                    # → out/doubletick-au-piramal-ai-voice-whatsapp.mp4
```

`npm run narration` stops (no substitution) if the exact voice "Aaditya - Healthcare Advisor"
is not in the ElevenLabs account.

Set `REMOTION_BROWSER` to a local Chromium headless shell if Remotion cannot download its own.

## Brand assets (`public/assets`)

- `doubletick-logo.png` — official logo supplied by DoubleTick.
- `au-small-finance-bank-logo.svg` — **official file required** (not yet added).
- `piramal-finance-logo.svg` — **official file required** (not yet added).

After adding a customer logo, set its path in `src/brand-assets.ts`. Until then the video shows
a neutral dashed "LOGO" slot; brands are never recreated with typed text.
