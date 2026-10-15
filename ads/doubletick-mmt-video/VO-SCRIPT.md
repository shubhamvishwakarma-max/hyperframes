# MakeMyTrip × DoubleTick — VO script (26s cut)

The on-screen subtitles follow this script line for line. Record or generate the VO
against these timings (about 2.7 words/second, confident and warm, not salesy).

| Time | Scene | VO line |
|---|---|---|
| 0:00–0:02.5 | 01 Hook | MakeMyTrip had 2,000+ travel sellers on separate WhatsApp numbers. |
| 0:02.5–0:04.5 | 01 Hook | Managers couldn't see the conversations. |
| 0:04.6–0:08.3 | 02 Problem | Chats were scattered. Follow-ups slipped. Generic campaigns fell flat. |
| 0:08.9–0:13.4 | 03 Own numbers | With DoubleTick, sellers sent personalised campaigns from their own numbers, |
| 0:13.5–0:17.4 | 04 Central view | while managers tracked every conversation from one central dashboard. |
| 0:17.6–0:20.0 | 05 Result | The result? 30% higher operational efficiency. 10% incremental revenue growth. |
| 0:20.0–0:21.6 | 05 Result | 2,000+ sellers enabled. |
| 0:21.8–0:26.0 | 06 CTA | Your travel business could be next. Book your free DoubleTick pilot today. |

## Why this differs from the master script

The master script is ~105 words, which needs ~35–38 seconds at a natural read.
This cut keeps every claim and beat (2,000+ sellers, separate numbers, no visibility,
scattered chats / follow-ups / generic campaigns, personalised campaigns from own
numbers, central dashboard, 30%, 10%, CTA) in ~70 words so it fits 22–26 seconds.

If you prefer the full master script word for word, the timeline needs to stretch to
~36 seconds — the scene timings in `index.html` (`render(t)`) and `SUBS` can be scaled.

## Adding the VO

Drop the VO file next to this script as `vo.wav` (or .mp3) and run:

```bash
ffmpeg -i video-silent.mp4 -i music_sfx.wav -i vo.wav \
  -filter_complex "[1:a]volume=0.35[m];[2:a]volume=1.0[v];[m][v]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart doubletick-mmt-video-vo-1080x1080.mp4
```
