---
workflow: product-launch-video
flow: automation
storyboard: no
message: "The lead is ready now. Your team may not be. DoubleTick Agentic AI bridges the gap."
destination: linkedin-meta-feed
aspect: 1080x1080
language: en
length: 41s
angle: one continuous lead journey (10 PM enquiry → AI qualifies → human closes)
vo_mode: verbatim
capture: none
---

## Intent

High-conversion 1:1 product ad for DoubleTick Agentic AI for LinkedIn / Meta / retargeting.
One continuous WhatsApp lead journey: a 10 PM enquiry goes unanswered and cools, DoubleTick
intercepts, the AI answers, captures requirements as chips, qualifies to High Intent, and hands
the lead with full context to a human salesperson who closes. Premium SaaS launch film, readable on mute.

## Customizations

- Script used verbatim as voiceover (7 lines). Subtitles: Geist Medium 28px, bottom-centre, no background, max 2 lines;
  omitted where the identical line is already the on-screen headline (brand intro, final line, CTA).
- Hedvig Letters Serif for hook / headlines / CTA; Geist for all UI, labels, subtitles, buttons.
- Continuity devices: the same chat panel persists scene 1→7; the same lead card cools (S2), gets caught by the
  green line, re-heats to High Intent (S5) and its data flies into the sales workspace (S6); clock rewinds to 10:00 PM.
- CTA: opacity 0→1, scale 0.96→1 over 0.28s, one restrained pulse, hold.

## Notes

- Official DoubleTick logo (assets/logo/) supplied by the user; WhatsApp UI rebuilt to match the user’s WhatsApp Business reference screenshot (business "ABC Ent", customer "Ravi").
- Voice: ElevenLabs had insufficient credits and HeyGen was signed out, so narration is local Kokoro TTS (`af_heart`).
  Music bed is synthesized deterministically by `scripts/make_music.py` (120 BPM, tension → lift at 10.6s → resolve).
  SFX from the bundled media-use library.
- Built as one monolithic composition (not per-frame workers) because the brief's core requirement is element
  continuity across every scene.
- Avoid: robots, AI faces, brains, purple/neon gradients, dashboards, fake KPIs or revenue numbers.
