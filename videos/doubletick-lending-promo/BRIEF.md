---
workflow: general-video
flow: automation
storyboard: no
message: "DoubleTick turns every lending enquiry into one connected, AI-driven WhatsApp journey — no lead goes cold."
aspect: "16:9"
length: 43s
language: en
---

# DoubleTick — Built for lending at scale

## Intent

A ~43s narrated promo for lenders: problem (a personal-loan enquiry goes cold because the RM
responds late) → question → DoubleTick's answer (AI Voice call within seconds → WhatsApp with
context → in-chat documents → eligibility from the bank's underwriting system → AI follow-up →
RM takeover with full history) → one connected journey → end card with CTA.

## Assets

- `assets/voiceover.mp3` — supplied ElevenLabs VO ("Aaditya"); drives all timing (42.45s).
- `assets/demo.mp4` — supplied product demo recording, trimmed to source 55s–200s
  (composition `data-media-start` = source time − 55s). Phone and agent-desk panels are shown
  as fixed crops (`CROPS` in `index.html`).
- `assets/doubletick-logo-light.png`, `assets/doubletick-tick.png` — supplied logo (dark-bg variant).

## Decisions (inferred, not asked)

- Dark green-black canvas so the light product UI pops; DoubleTick green `#2bc37f` as sole accent,
  coral `#ff8a73` only for the "opportunity lost" beat.
- Montserrat 900 headlines + IBM Plex Mono labels (both bundled, render offline).
- Scene cuts land on the VO's natural pauses (detected with ffmpeg `silencedetect`).
- No music bed or captions were supplied/requested; on-screen headlines carry the key lines.
- Illustrative UI values (lead name, ₹5,00,000 amount, response timer) are placeholders.
