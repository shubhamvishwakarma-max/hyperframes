# MakeMyTrip × DoubleTick — VO (34.1s cut)

VO: `vo/yousef-vo.mp3` (ElevenLabs "Yousef – Warm Customer Support", supplied), placed
from 0:00.20 as one continuous take. Music is sidechain-ducked under it.

Beats were aligned to the pauses in the recording (no speech recognition was available
in the build environment, so line boundaries come from silence detection):

| Video time | Line | On-screen beat |
|---|---|---|
| 0:00.2 | MakeMyTrip had over two thousand travel agents on separate WhatsApp numbers. | "2,000+ travel agents" + chats enter |
| 0:04.9 | But managers couldn't see the conversations. | headline → "who could see" |
| 0:07.4 | Chats were scattered. Follow-ups slipped. Generic campaigns fell flat. | Scattered chats / broken manager lines |
| 0:11.8 | With DoubleTick, agents sent personalised campaigns from their own numbers, | green sweep → own numbers + campaigns |
| 0:16.0 | while managers tracked every conversation from one central dashboard. | One central view (inbox) |
| 0:19.8 | The result? | THE RESULT |
| 0:20.7 | Thirty percent higher operational efficiency. | 30% |
| 0:23.2 | Ten percent incremental revenue growth. | 10% |
| 0:25.7 | Over two thousand agents enabled on WhatsApp. | 2,000+ agents enabled on WhatsApp |
| 0:28.4 | Your travel business could be next. Book your free DoubleTick pilot today. | CTA (button on "Book…"), held to 0:34.1 |

## Re-timing for a different take

The animation maps video time to animation time through the `KP` keypoints in
`index.html` (`warp()`); `audio.py` uses the same list so SFX stay in sync. To use a new
VO, update `KP`, `SUBS_T` and `T_END`, then:

```bash
python3 audio.py                                   # music.wav + sfx.wav
ffmpeg -i vo/NEW.mp3 -af "adelay=200|200,apad=whole_dur=34.1" -ac 2 -ar 44100 -t 34.1 vo/vo_track.wav
ffmpeg -i music.wav -i sfx.wav -i vo/vo_track.wav -filter_complex \
  "[2:a]asplit=2[vo][sc];[0:a]volume=0.42[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[1:a]volume=0.5[s];[md][s][vo]amix=inputs=3:normalize=0,loudnorm=I=-15:TP=-1.5:LRA=9[out]" \
  -map "[out]" mix.wav
```
