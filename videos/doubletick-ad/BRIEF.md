---
workflow: general-video
flow: automation
storyboard: no
message: "Manage thousands of WhatsApp conversations, automate customer engagement, and scale sales operations without losing control."
destination: LinkedIn, Instagram, Meta ads, website
aspect: "1:1"
resolution: 1080x1080
fps: 30
length: 40s (voiceover-driven)
language: en
---

# DoubleTick — premium B2B brand ad

## Intent

A high-end enterprise SaaS ad for DoubleTick. Five scenes plus an end card, all told as one continuous visual story:
many WhatsApp numbers → one governed inbox → personalisation → Click-to-WhatsApp lead → automated follow-ups → CRM →
calls + groups → tracking → AI agents for chat + voice → customer logos → MakeMyTrip results → end card.

## Assets

- Voiceover (master track, unchanged): `assets/audio/voiceover.mp3` (ElevenLabs "Hale"), 0.5s of leading silence trimmed.
- Product UI: stills cut from the supplied UI reel (`uia.mp4`) into `assets/ui/*.png`.
- Logos: `assets/logos/*.png` extracted from the supplied logo sheet (original colours and proportions, background removed); DoubleTick wordmark from the supplied PNG.
- Fonts: Hedvig Letters Serif (headlines, numbers) and Geist (UI, labels), bundled locally from @fontsource.
- Music bed `assets/audio/music-bed.mp3` and SFX `assets/audio/sfx-*.wav`: synthesized locally (ElevenLabs generation failed because the account ran out of credits).

## Customizations

- DoubleTick logo placed top centre (per the user's final instruction), small and consistent through scene 5.
- Timing is mapped to the voiceover's pauses (silence detection); no word-level ASR was available offline.
