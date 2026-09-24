# DoubleTick — "Personalization at Scale" (30s B2B ad)

1080×1080 · 30 fps · H.264 + AAC stereo · 34.0 s · −14 LUFS integrated
Final render: `renders/doubletick-personalization-at-scale-1080x1080.mp4`

## Story / timing (video seconds)
| Scene | Time | Beat |
|---|---|---|
| 01 Executive hook | 0.0–6.6 | Scale vs. Personalization? / You don't have to choose. → volume card (24,580 leads) and rep card join via a green connector → PERSONALIZATION × SCALE |
| 02 AI-powered rep experience | 6.6–13.8 | Connector grows into Deepak's WhatsApp chat (WhatsApp light UI, grey → blue read ticks); AI Agent panel ticks Intent → Team size → Enterprise → Qualification; PROSPECT → HOT LEAD |
| 03 Hot lead + human handoff | 13.8–19.6 | HOT LEAD pill becomes the eyebrow; notification → AI Summary + channels → Take Over Conversation; AI recedes, owner card comes forward |
| 04 CXO governance | 19.6–27.3 | Pull-back reveals other reps → command center, AI Governance (72 / 19 / 9), alerts one at a time |
| 05 CTA | 27.3–34.0 | Brand emerges from centre → True Personalization at Scale. → Book an Executive Demo (held about 4 s after it is fully visible) |

## Sources
- **VO:** ElevenLabs "Aaditya K — Deep Voice for Finance & Healthcare Support" (`eleven_multilingual_v2`), one natural take (~147 WPM). Scribe transcript matches the script word for word (DoubleTick, AI, WhatsApp).
  The only edit is shortening two inter-scene breaths (1.15 s → 0.6 s, 1.02 s → 0.55 s). There's no time-stretching.
- **Music / SFX:** ElevenLabs Music v2 (≈110 BPM, sparse → builds, no drop) plus text-to-SFX (whoosh, tick, notification, click).
  The music sits ~15–18 dB under the VO, is side-chain ducked, and lifts after the last line.
- **Faces:** AI-generated headshots (gpt-image-2), used for fictional reps.
- **Theme:** light, on a warm beige canvas `#f5efe4` (approximated: doubletick.io is unreachable from the build sandbox and its extracted brand kit lists no beige, so swap in the exact site value in `:root --bg` if it differs). Emerald text is deepened to `#08774a` for contrast on light surfaces.
- **Brand:** green `#27b578` and deep greens extracted from doubletick.io (ElevenLabs brand-kit extractor). Fonts: Geist, Geist Mono, Hedvig Letters Sans (self-hosted, OFL).
- **Logo:** `index.html#logo` is a placeholder mark (green tile + double tick + Geist wordmark) because the official logo file could not be downloaded here. Swap in the official SVG before publishing.

## Rebuild
```bash
./scripts/mix-audio.sh        # rebuilds assets/audio/mix.wav from assets/source/*
npx hyperframes check
npx hyperframes render -o renders/doubletick-personalization-at-scale-1080x1080.mp4 --fps 30 --quality high
```
