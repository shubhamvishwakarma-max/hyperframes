# DoubleTick — Voice AI for UAE Real Estate (9:16 performance ad)

A 38.0s vertical performance ad built as a HyperFrames composition.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 9:16 — 1080 × 1920 |
| Duration | 38.0s (1140 frames) |
| Frame rate | 30 fps |
| Output | MP4 / H.264 (`renders/doubletick-uae-voice-ai-9x16.mp4`) |
| Placements | Instagram Reels, LinkedIn, Meta Ads, mobile-first paid media |

## Run

```bash
npx hyperframes lint      # 0 errors
npx hyperframes check     # browser gate: lint + runtime + layout + motion + WCAG contrast
npx hyperframes preview   # live studio
npx hyperframes render -o renders/doubletick-uae-voice-ai-9x16.mp4 -f 30 -q delivery
```

`render` needs `ffmpeg` **and** `ffprobe` on PATH.

## Structure

- `index.html` — the whole composition: brand tokens, six timed scenes (`.clip`),
  one paused GSAP root timeline on `window.__timelines["main"]`.
- `assets/fonts/` — Geist Variable + Geist Mono Variable (shipped locally, `@font-face`d).
- `assets/vendor/gsap.min.js` — GSAP, vendored so the render never touches the network.
- `assets/audio/vo1…vo6.wav` — voiceover, General American (Kokoro `am_michael`).
- `assets/audio/score.wav` — the whole music bed + sound design, pre-mixed.
- `tools/score.py` — deterministic generator for `score.wav` (seeded, re-runnable).

## Scene map

| # | Window | Beat |
| --- | --- | --- |
| 01 | 0.00 – 6.90 | Hook: `5 MINUTES.` → lead decays NEW → WAITING → COLD |
| 02 | 6.90 – 11.20 | Problem: manual dialling, +48 / +126 / +247 uncalled leads |
| 03 | 11.20 – 19.60 | Solution: enquiry → DoubleTick AI → PSTN call. `LEAD IN. AI CALL OUT. INSTANTLY.` |
| 04 | 19.60 – 27.40 | AI qualification: live transcript + auto-captured fields. `ASK. QUALIFY. ANSWER.` |
| 05 | 27.40 – 31.60 | Live transfer to broker. `AI QUALIFIES. YOUR TEAM CLOSES.` |
| 06 | 31.60 – 38.00 | Scale + end card. `SCALE CONVERSATIONS. NOT HEADCOUNT.` → `BOOK A VOICE AI DEMO` |

## Typography

Geist for all copy, UI labels and CTAs. Geist Mono for every numeral-led element —
the `5 MINUTES.` hook, the `00:00 → 05:00` timer, phone numbers, `+247`, `AED 3–4M`,
`2` BEDROOM, `30` DAYS, call duration, concurrent-call counter. No other family is loaded.

## Brand tokens

Defined once on `:root` in `index.html`: signal green `#25D366` (with `#14B85B` /
`#0E8F49` / `#0A4D2C` for gradients and depth), near-black `#05090A` grounds,
`#0D1417`→`#111A1D` card gradients, hairline `rgba(255,255,255,.08)` borders,
34–44px card radii, 999px status pills, 28px CTA radius.

> **Note:** `doubletick.io` is blocked by this environment's network egress policy, so the
> palette and UI language were reconstructed from DoubleTick's known identity (the green
> double-tick mark and the WhatsApp-ecosystem green it sits in) rather than sampled from the
> live site. Swap the `:root` values in `index.html` for the official brand hexes to make it
> exact — nothing else in the composition hardcodes a colour.

## Determinism

No `Date.now()`, no unseeded `Math.random()`, no render-time network. Waveform bar
heights come from a fixed sine table; `tools/score.py` is seeded (`default_rng(7)`).

## Audio

`tools/voice.sh` regenerates the voiceover, `tools/score.py` the bed + SFX, and
`tools/master.sh` loudness-masters both (voice ≈ −16 LUFS, bed ≈ −26 LUFS) so the
delivered MP4 lands in social-delivery range with the voice clearly dominant.
