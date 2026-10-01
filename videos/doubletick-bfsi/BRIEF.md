---
workflow: general-video
flow: automation
storyboard: no
message: "The document moves into the institution. The context moves to the RM."
destination: paid-social
aspect: 1080x1080
language: en
audience: "Banks, lenders and BFSI teams"
length: "~41s (driven by the voiceover)"
angle: product-launch film, abstract motion design
---

## Intent

Premium 1:1 motion-design ad for DoubleTick aimed at banks, lenders and BFSI
teams. Customers already send PAN cards, bank statements and income proofs on
WhatsApp — but those documents should not end up sitting on a relationship
manager's phone. DoubleTick's AI follows up on the institution's verified
WhatsApp number (chat or voice), says what is pending, answers questions,
captures consent and guides secure submission; documents route into the
institution's controlled workflow, and the RM takes over with full context.

Creative north star: **the document should move — not live on the RM's phone.**
One document object travels the whole film. 70% abstract motion, 20% realistic
WhatsApp (the only realistic UI), 10% typographic brand moments. Apple /
Linear / Stripe-level restraint; one headline + one hero + one status layer
per frame.

## Assets

- `assets/brand/doubletick-logo.png` — official DoubleTick logo (dark wordmark), top of frame throughout and the brand reveal. Supplied by the user; never redrawn.
- `assets/brand/doubletick-logo-white.png` — official white-wordmark variant (supplied; unused on the light palette).
- `assets/brand/doubletick-mark.png` — crop of the supplied logo's tick mark (reference only).
- `assets/vo_guide.wav` — **TEMPORARY guide voiceover** (local Kokoro TTS, exact script). The user's master VO file did not arrive with the request; replace it with the supplied recording and re-time `T` in `index.html` + `CUES` in `audio/build_audio.py`.

## Customizations

- Typography: Hedvig Letters Serif (headlines), Geist / Geist Mono (UI, status, subtitles) — bundled locally under `assets/fonts/`.
- Fictional institution "ABC Bank" with blue verified badge; customer "Ananya Sharma"; RM "Rohan".
- Phrase-level subtitles for the whole VO (Geist Medium, bottom centre, occasional green key term).
- Music bed + SFX are synthesized locally (`audio/build_audio.py`), deterministic, cued to the same timing table as the picture.

## Notes

- Do not show dashboards, CRM screens, tables, robots, hackers, padlocks, shields, real bank names or fake KPIs.
- RM receives context chips only — never the document object.
- Output: `DoubleTick_BFSI_Secure_Document_Journey_1080x1080.mp4`, 1080×1080, 30fps, H.264, AAC stereo.
