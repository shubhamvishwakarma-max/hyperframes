# SOTC × DoubleTick — customer case-study video

A HyperFrames composition: 1920×1080, 30 fps, H.264. Output is `renders/sotc-doubletick-case-study-1080x1080.mp4`.

Story arc: unanswered calls → WhatsApp conversations → closed deals → business impact.

| Scene | Time (s) | Content |
| --- | --- | --- |
| 01 Hook | 0.0–4.6 | Unanswered call (the PDF's incoming-call UI) and "No answer" call cards. Headline: "Unanswered calls. Still, a chance to close." |
| 02 Problem | 4.6–11.9 | SOTC "Customer Story" intro, agent call queue (No answer / Call missed / Follow-up pending), no follow-up channel |
| 03 Solution | 11.9–17.6 | The PDF's WhatsApp chat, revealed bubble by bubble, then the WhatsApp call screen. WHATSAPP CHAT and WHATSAPP CALLS chips |
| 04 KPI | 17.6–20.9 | 30% higher call connectivity |
| 05 KPI | 20.9–27.3 | ₹5.04 crore revenue in 60 days |
| 06 KPI | 27.3–30.4 | 135+ deals closed purely on WhatsApp |
| 07 End frame | 30.4–34.0 | Missed call → WhatsApp conversation → deal closed. DoubleTick and SOTC lockup |

## Files

- `index.html`: the composition, with every scene on one GSAP timeline timed to the voiceover's measured pauses.
- `assets/ui/`: phone screens cropped at high resolution from the reference PDF. Chat bubbles are revealed by masking `chat_full.png` over `chat_empty.png`.
- `assets/logos/`: the supplied SOTC and DoubleTick logos.
- `assets/audio/voiceover.mp3`: the supplied ElevenLabs voiceover, unaltered.
- `assets/audio/music.wav` and `sfx.wav`: a music bed and UI sounds, synthesized by `scripts/synth_audio.py`. They are deterministic, so you can regenerate them with `python3 -I scripts/synth_audio.py assets/audio`.
- `assets/fonts/`: Hedvig Letters Serif and Geist. Hedvig has no ₹ glyph, so the rupee sign comes from a Noto Serif subset.

## Commands

```bash
npx hyperframes@0.8.162 check
npx hyperframes@0.8.162 preview
npx hyperframes@0.8.162 render --fps=30 --quality=high --output=renders/sotc-doubletick-case-study-1080x1080.mp4
```
