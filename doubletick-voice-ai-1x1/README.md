# DoubleTick Voice AI — Instant Calling for Launch Leads (1:1)

A 35-second vertical performance ad: a new project lead arrives, the response
clock runs, a competitor connects first, DoubleTick Voice AI calls instantly over
PSTN, qualifies the buyer, and hands a qualified investor to a broker.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 1:1 — 1080 × 1080 |
| Duration | 35.0s (1050 frames) |
| Frame rate | 30 fps |
| Output | MP4 / H.264 (`renders/doubletick-voice-ai-1x1-1080.mp4`) |
| Placements | LinkedIn, Instagram Reels, Meta Ads, paid social |

## Run

```bash
npx hyperframes lint
npx hyperframes check     # lint + runtime + layout + motion + WCAG contrast
npx hyperframes render -o renders/doubletick-voice-ai-1x1-1080.mp4 -f 30 -q delivery
```

## Three text layers

1. **Hero keywords** — upper frame, used only at the matching narration moment,
   drawn from the supplied hero library. Never a full VO sentence.
2. **Subtitles** — the complete narration, phrase-timed, two lines maximum, in
   the bottom safe area, visually secondary. Cue times come from the synthesis
   itself (`tools/voice.py` writes `assets/subtitles.json`), so they track the
   spoken audio rather than being hand-guessed.
3. **Product UI text** — small native labels inside the interface: NEW LEAD,
   WAITING FOR CALL, CALL CONNECTED, CALLING, CONNECTED, QUALIFIED, BUYER READY,
   LIVE TRANSFER, BROKER ANSWERING.

## Square recompose

This is the 1:1 cut of the vertical ad — same narration, same 35.0s timeline,
same subtitle cues, same score. Only the layout changed, because 1080 × 1080
drops 840px of height:

- One **UI zone** at the top (y 56 – ~660) and one **hero slot** below it
  (y 700), so every scene reads top-down in half the height.
- Hero type drops 86px → 58px; `.qline` rows 88 → 72; flow nodes 132 → 92;
  the lead timer 82 → 60; the call panel and qualification rows tightened so
  each card clears the hero slot.
- Subtitles move to y 928 at 32px, still centred in the bottom safe area.
- The end card is re-centred for the square frame.

## Scene map

| # | Window | VO | Beat |
| --- | --- | --- | --- |
| 01 | 0.00 – 5.90 | 1 | New project lead lands → response timer 00:48 → 05:08, status slips to WAITING FOR CALL → competitor CALL CONNECTED 00:03 |
| 02 | 5.90 – 12.40 | 2 | Launch desk running flat out → leads NEW → WAITING → COLD |
| 03 | 12.40 – 23.06 | 3 | NEW PROJECT LEAD → DOUBLETICK VOICE AI → PSTN CALL INITIATED → live call, project + payment-plan questions → budget qualification |
| 04 | 23.06 – 28.22 | 4 | Three dead numbers → AI CALL → QUALIFIED → BUYER READY → LIVE TRANSFER → broker gets the qualified buyer |
| 05 | 28.22 – 35.00 | 5 | Four leads running in parallel → end card + `BOOK YOUR VOICE AI DEMO`, held 2.5s |

## Typography

Geist for hero text, subtitles, UI labels and the CTA. Geist Mono for every
numeral — the `5 minutes` hook, both timers, `AED 3–4M`, `AED 3.5M`, `30` Days,
call duration, lead numbers, desk counts.

## Audio

`tools/voice.py` generates the voiceover and the subtitle cues, `tools/score.py`
the bed and SFX, `tools/master.sh` masters the bed. The script is spoken
verbatim; pronunciation is fixed at the phoneme layer, never in on-screen text:
DoubleTick `dˈʌbəl tˈɪk`, Voice AI `ˌeɪˈaɪ`, PSTN `pˈiː ˈɛs tˈiː ˈɛn`,
UAE `jˈuː ˈeɪ ˈiː`. Read runs ~180 wpm. Voice: Kokoro-82M `af_heart`; override
with `DT_VOICE=am_michael python tools/voice.py`.

## Determinism

No `Date.now()`, no unseeded `Math.random()`, no render-time network or fetch —
subtitle cues are baked into the composition as a literal array. One paused GSAP
root timeline on `window.__timelines["main"]`; fonts, GSAP and audio are local.

> **Note:** `doubletick.io` is blocked by this environment's network egress policy,
> so the palette is reconstructed from DoubleTick's known identity rather than
> sampled. Swap the `:root` values in `index.html` for the official hexes.
