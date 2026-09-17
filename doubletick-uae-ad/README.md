# DoubleTick — Voice AI for UAE Real Estate (9:16 performance ad)

A 57.4s vertical performance ad built as a HyperFrames composition.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 9:16 — 1080 × 1920 |
| Duration | 57.4s (1722 frames) |
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
- `assets/audio/vo1…vo5.wav` — voiceover (Kokoro `am_michael`), one file per narration line.
- `assets/audio/score.wav` — the whole music bed + sound design, pre-mixed.
- `tools/score.py` — deterministic generator for `score.wav` (seeded, re-runnable).
- `tools/voice.sh` + `tools/tighten.py` — regenerate and pace the voiceover.

## Scene map

Every on-screen line is the narration it sits under, or a tight condensation of it —
no free-floating campaign slogans.

| # | Window | VO | On screen |
| --- | --- | --- | --- |
| 01 | 0.00 – 11.55 | 1 | `Taking more than 5 minutes to call a new project lead?` → `You didn't lose an investor.` → `You handed millions in off-plan revenue to a rival developer.` |
| 02 | 11.55 – 21.50 | 2 | `Slow follow-ups kill launch inventory.` → `Thousands of high-intent leads sitting cold.` |
| 03 | 21.50 – 31.30 | 3a | `DoubleTick AI Calling changes that instantly.` → NEW LEAD → DOUBLETICK AI → PSTN CALL → `Lead registers. DoubleTick calls instantly.` |
| 04 | 31.30 – 37.35 | 3b | `Talking naturally` → `Answering payment-plan questions` → `Vetting budget on the spot`, qualification auto-capturing |
| 05 | 37.35 – 48.75 | 4 | `No robotic delays.` → `No missed leads.` → live transfer chain → `Brokers step in with qualified investors.` |
| 06 | 48.75 – 57.40 | 5 | `Sell your next development faster.` → `Without expanding your sales team.` → end card + `BOOK YOUR DEMO` |

## Typography

Geist for all copy, UI labels and CTAs. Geist Mono for every numeral-led element —
the `5` in the hook, phone numbers, the uncontacted-lead count, `AED 3–4M`, `AED 3.5M`,
`2` Bedroom, `30` Days and the live call duration. No other family is loaded.

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

`tools/voice.py` generates the voiceover, `tools/score.py` the bed + SFX, and
`tools/master.sh` loudness-masters the bed, so the delivered MP4 lands in
social-delivery range with the voice clearly dominant.

### Voiceover

The script is spoken verbatim. Three levers do the work instead of feeding the
engine a raw paragraph:

1. **Phoneme input.** Each line is phonemised and the brand / telecom terms are
   overridden with hand-written pronunciations before synthesis
   (`is_phonemes=True`). This is what makes these land:

   | Term | Phonemes sent |
   | --- | --- |
   | UAE | `jˈuː ˈeɪ ˈiː` (U — A — E) |
   | PSTN | `pˈiː ˈɛs tˈiː ˈɛn` (P — S — T — N) |
   | AI | `ˌeɪˈaɪ` (A — I, never "aye") |
   | DoubleTick | `dˈʌbəl tˈɪk` (Double Tick) |
   | off-plan / high-intent / payment-plan | spoken as two connected words, no hyphen stall |
   | live transfers | `lˈaɪv` (real-time, not "I live in Dubai") |

   None of this touches on-screen spelling — it exists only in the audio layer.

2. **Prosody.** One synthesis pass per sentence, each with its own speech rate,
   plus authored clause/sentence pauses and authored gaps between sentences, so
   the energy curve rises into the reveal and settles on the CTA. The read runs
   ~166 wpm. A soft inhale sits ahead of the two biggest sentence starts.

3. **A voice chain.** High-pass, de-boxing cut at 380 Hz, warmth at 180 Hz,
   articulation at 3.2 kHz, air at 7.6 kHz, gentle compression, then loudness —
   so the take sits like a recorded commercial read rather than a dry dump.

Voice: Kokoro-82M `af_heart`. Override with `DT_VOICE=am_michael python tools/voice.py`.
