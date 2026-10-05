---
workflow: general-video
flow: automation
storyboard: no
message: "Sensitive documents are already on WhatsApp — DoubleTick moves the document to the institution and the context to the RM."
destination: linkedin
aspect: "1:1"
language: en
audience: "Banks, lenders and BFSI decision-makers"
length: "36s (supplied voiceover 33.72s + CTA hold)"
angle: "Mute-first problem hook → governed WhatsApp workflow → Free Pilot CTA"
---

# DoubleTick — Governed Documents (BFSI, LinkedIn 1:1)

## Intent

LinkedIn-first paid social creative. The first frame already shows the problem
(PAN / bank statement / income proof → WhatsApp), the freeze frame at ~7.7s is the
standalone static ad ("Governed — or sitting on an RM's phone?"), and the core
distinction is visual: **the document moves to the institution; the context moves to the RM.**

## Assets

- `assets/vo.mp3` — supplied master voiceover, used unchanged (33.72s). Word timings
  forced-aligned offline (PocketSphinx) → `work/align.json`.
- `assets/logo-dark.png` — official DoubleTick logo (supplied).
- `assets/music.wav`, `assets/sfx.wav` — synthesized deterministically by `work/synth.py`
  (ElevenLabs credits were exhausted; no stock or generated third-party audio).
- Fonts: Hedvig Letters Serif (headlines), Geist 400/500/600 (UI, subtitles) — bundled woff2.

## Customizations

- Subtitles: full VO, Geist Medium 28px, bottom-centre, 74px safe margin, subtle backing pill.
- Fictional "ABC Bank ✓" (blue verified badge), customer Ananya Sharma, RM Rohan.
- Music: 120 BPM, tension strip + true silence at the freeze (7.62–8.05s), drop at 8.5s.
- Mix: VO dominant; music bed carved against the VO (`data-fx-carve`, strength 0.55).

## Notes

- Export: `DoubleTick_Governed_Documents_BFSI_LinkedIn_1080x1080.mp4`, 1080×1080, 30fps,
  H.264, AAC stereo; master loudness-normalised after render.
