# DoubleTick Voice AI — Reactivate Your CRM (9:16, 35s)

Old CRM database → manual re-engagement problem → DoubleTick Voice AI reactivates
leads over PSTN → missed call gets a WhatsApp follow-up → active opportunities → CTA.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 9:16 — 1080 × 1920 |
| Duration | 35.0s (1050 frames) |
| Frame rate | 30 fps |
| Output | MP4 / H.264 (`renders/doubletick-reactivate-35s-9x16.mp4`) |
| Placements | LinkedIn, Instagram Reels, paid social |

## Layout system

- **Top band 0–230px (12%) stays empty in every scene.** No logo, header, badge
  or brand mark anywhere near the top; branding comes from colour, typography,
  UI and the end card.
- **Hero headlines are exactly three lines**, one font size (72px) and one
  weight (700) across all three, centre-aligned, in the visual centre of the
  frame. Emphasis comes from colour only — never from size.
- **Everything centres**: headlines, product UI, connectors, cards, subtitles.
- **Subtitles** carry the complete narration, two lines maximum, bottom safe area.

## Colour journey

Red appears only in 0:00–11.35 and only for negative states — OLD LEADS,
COMPETITORS, 20,000 COLD, COLD / INACTIVE / NOT CONTACTED, MANUAL CALLING. The
moment DoubleTick enters at 11.35s the red is gone for good and the film runs on
white + charcoal + DoubleTick green. NO ANSWER in the WhatsApp scene is neutral
grey, not red.

## Typography

**Geist only — no Geist Mono anywhere**, including numbers: `20,000`, the climbing
counter, `AED 2.8M`, `AED 3–4M`, `30 Days` and every lead ID are all Geist.

## Scene map

| # | Window | VO | Hero (3 lines) |
| --- | --- | --- | --- |
| 01 | 0.00 – 5.75 | 1 | `YOUR CRM HOLDS / THOUSANDS OF / OLD LEADS` then `YOUR COMPETITORS / ARE PAYING TO / FIND THEM AGAIN` |
| 02 | 5.75 – 11.35 | 2 | `20,000 COLD / NUMBERS CAN'T BE / CALLED MANUALLY` |
| 03 | 11.35 – 20.65 | 3 | `REACTIVATE YOUR / EXISTING LEADS / WITH VOICE AI` → `NATURAL PROJECT / CONVERSATIONS OVER / PSTN CALLS` → `QUALIFY INTEREST / IDENTIFY BUYERS / BOOK VIEWINGS` |
| 04 | 20.65 – 27.70 | 4 | `MISSED THE / VOICE CALL? / FOLLOW UP INSTANTLY` → `BROCHURE / PAYMENT PLAN / PROJECT DETAILS` |
| 05 | 27.70 – 35.00 | 5 | `TURN OLD LEADS / INTO ACTIVE / OPPORTUNITIES` → `REACTIVATE MORE / LEADS WITHOUT MORE / BROKERS` → end card |

## Audio

`tools/voice.py` generates the voiceover and the subtitle cues, `tools/score.py`
the bed and SFX, `tools/master.sh` masters the bed. The script is spoken verbatim;
pronunciation is fixed at the phoneme layer, never in on-screen text: DoubleTick
`dˈʌbəl tˈɪk`, Voice AI `ˌeɪˈaɪ`, PSTN `pˈiː ˈɛs tˈiː ˈɛn`, CRM `sˈiː ˈɑːɹ ˈɛm`,
WhatsApp `wˌʌts ˈæp`, and 20,000 spoken as "twenty thousand". Voice: Kokoro-82M
`af_heart`; override with `DT_VOICE=am_michael python tools/voice.py`.

## Determinism

No `Date.now()`, no unseeded `Math.random()`, no render-time network or fetch —
subtitle cues are baked in as a literal array. One paused GSAP root timeline on
`window.__timelines["main"]`; fonts, GSAP and audio are local to the project.

> **Note:** `doubletick.io` is blocked by this environment's network egress policy,
> so the palette is reconstructed rather than sampled. Swap the `:root` values in
> `index.html` for the official hexes.
