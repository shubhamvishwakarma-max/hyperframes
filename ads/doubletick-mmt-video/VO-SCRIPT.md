# MakeMyTrip × DoubleTick — VO script (36.9s cut)

The VO in `doubletick-mmt-video-1080x1080.mp4` is generated offline with the open
Kokoro TTS model (voice `bm_george`, British male, speed 1.2) — see `vo/make_vo.py`.
Each line is placed at its scene, and the subtitles match it word for word.

| Starts at | Scene | VO line |
|---|---|---|
| 0:00.15 | 01 Hook | MakeMyTrip had over two thousand travel agents on separate WhatsApp numbers. |
| 0:05.10 | 01 Hook | But managers couldn't see the conversations. |
| 0:07.90 | 02 Problem | Chats were scattered. Follow-ups slipped. Generic campaigns fell flat. |
| 0:12.85 | 03 Own numbers | With DoubleTick, agents sent personalised campaigns from their own numbers, |
| 0:17.40 | 04 Central view | while managers tracked every conversation from one central dashboard. |
| 0:21.90 | 05 Result | The result? Thirty percent higher operational efficiency. Ten percent incremental revenue growth. |
| 0:27.85 | 05 Result | Over two thousand agents enabled. |
| 0:30.75 | 06 CTA | Your travel business could be next. Book your free DoubleTick pilot today. |

## Timing

Read naturally, this script needs ~35 s, so the film runs 36.9 s (CTA held ~2 s at the
end). Animations still play at their designed speed — `index.html` maps video time to
animation time through the `KP` keypoints (`warp()`), adding holds where the VO needs room.
`audio.py` uses the same keypoints so every SFX lands on its visual.

## Swapping in a studio / ElevenLabs VO

Record the eight lines separately, trim silence, name them `vo/t1.wav` … `vo/t8.wav`,
then rebuild the mix (start times above):

```bash
python3 audio.py   # music.wav + sfx.wav
# then re-run the VO placement + mix commands (adelay per line, sidechain-ducked music)
```

If the new lines run longer or shorter, adjust the matching `KP` holds in `index.html`
and `audio.py`, and the `SUBS_T` times.
