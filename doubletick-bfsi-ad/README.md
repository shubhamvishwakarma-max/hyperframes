# DoubleTick BFSI case-study ad (30s, 1080×1080)

Final render: `DoubleTick_BFSI_30s_1080x1080.mp4` (30.6s, 30 fps, H.264 + AAC, −14 LUFS).

| Scene | Time | Content |
|---|---|---|
| 1 Hook | 0:00–0:04.6 | Lead list phone + missed follow-ups / dormant / slow RM cards, "leads going cold" |
| 2 Problem | 0:04.6–0:08.6 | Manual call list vs. stalled WhatsApp thread, 1 RM overloaded |
| 3 AU Small Finance Bank | 0:08.6–0:14.6 | WhatsApp chat, 3,12,945+ AI calls, AI Voice → WhatsApp → RM |
| 4 Piramal Finance | 0:14.6–0:20.0 | WhatsApp chat, 90% faster RM response, lifecycle workflow cards |
| 5 Value | 0:20.0–0:26.4 | 4-step flow + DoubleTick lead card status updating + WhatsApp |
| 6 CTA | 0:26.4–0:30.6 | "Book your DoubleTick demo today", Book Demo button, floating tags |

Audio: ElevenLabs voice "Aaditya K – Deep Voice for Finance & Healthcare Support"
(`audio/voiceover.mp3`), ElevenLabs music bed (`audio/music.mp3`, ducked under VO),
synthesized soft UI ticks.

## Re-render
```bash
npm install
FF=/path/to/ffmpeg node render.mjs video video_silent.mp4   # frames → H.264
# then mux with the audio mix (see commit notes)
```
Scene timings live in the `S` array at the top of the script in `index.html`.
