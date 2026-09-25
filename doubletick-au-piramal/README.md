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
ELEVENLABS_API_KEY=... npm run narration          # voice "Aaditya K" → public/audio/narration.mp3 + cue sync
npm run render                                    # → out/doubletick-au-piramal-ai-voice-whatsapp.mp4
```

`npm run narration` stops (no substitution) if the exact voice name is not in the ElevenLabs account.

Shipped narration: ElevenLabs "Aaditya K - Deep Voice for Finance & Healthcare Support"
(`SVdvKlYuyNTd1xzQqLWD`, eleven_multilingual_v2), exact script. Two long paragraph pauses were
tightened and the take was time-stretched 1.14× (rubberband, pitch/formants preserved) → 40.65 s,
≈154 wpm. Cues in `src/narration-timing.json` are anchored on the detected pauses of that file.
Final audio is loudness-normalised to −14 LUFS after render.

Set `REMOTION_BROWSER` to a local Chromium headless shell if Remotion cannot download its own.

## Brand assets (`public/assets`)

- `doubletick-logo.png` — official logo supplied by DoubleTick.
- `au-small-finance-bank-logo.png` / `au-small-finance-bank-icon.png` — official AU files (supplied).
- `piramal-finance-logo.png` / `piramal-finance-icon.png` — official Piramal files (supplied).

Full logos sit top-right and inside the DoubleTick card; the icons are the WhatsApp business
avatars, shown with a blue verified tick next to the profile name. Paths live in `src/brand-assets.ts`.
