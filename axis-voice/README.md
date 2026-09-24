# Axis Bank × DoubleTick demo: ElevenLabs voice replacement (v4)

Picture-locked voice swap of `AxisBank_DoubleTick_Demo_v3.mp4`. The video frames are untouched: the
primary export copies the original H.264 stream bit for bit. Only the audio track is new.

## What was in the original audio

- Voice only. Every gap between lines is digital silence (−75 to −91 dB), so there is **no music bed and no UI SFX** to keep or duck.
- Script recovered with ElevenLabs Scribe, then mapped line by line onto the original speech timings (`cues.json`).
- The old track is discarded completely. The new MP4 carries a single audio stream built only from the clips below, so no old voice can remain.

## Voice lock (ElevenLabs, `eleven_multilingual_v2`)

| Role | Character | ElevenLabs voice | voice_id |
|---|---|---|---|
| Narrator | — | Aaditya K – Deep Voice for Finance & Healthcare Support | `SVdvKlYuyNTd1xzQqLWD` |
| Customer | Rohan | Aarav J – Cool & Wise Friend (young Indian male) | `jpdt2U2ncF4tVZvy35oY` |
| AI Agent | Richa | Monika Sogam – Friendly Customer Care (Indian female) | `ZUrEGyu8GFMwnHbvLhv2` |
| RM | Priya | Sweta Priyadarshan (mature Indian female, professional) | `vnJXCu1mkdsxb9UdCYZp` |

Voice settings: the ElevenLabs connector used here exposes no stability, similarity or speed controls, so
every clip uses that voice's library defaults.

## Files

```
audio/
  narrator/narrator_01..13.mp3   ai-agent/ai_01..07.mp3
  rohan/rohan_01..04.mp3         rm/rm_01.mp3
  _superseded/                   first takes of narrator 02/04/05/09/13 (replaced by tighter retakes)
cues.json              clip -> original line start (s)
build_mix.py           trims, fits and places the cached clips; never calls ElevenLabs
timeline_report.json   final placement, tempo and shift of every line
dialogue_master.wav    mastered dialogue (48 kHz, −15.2 LUFS, peak −4.5 dBFS)
out/AxisBank_DoubleTick_Demo_v4_ElevenLabs.mp4        24 fps original picture (stream copy) + new AAC audio
out/AxisBank_DoubleTick_Demo_v4_ElevenLabs_30fps.mp4  30 fps H.264 re-encode (CRF 14) of the same
```

The cache: `audio/**.mp3` is the source of truth. Rebuilding the mix never regenerates speech.
To change a line, regenerate only that clip, drop it in at the same path, and rerun:

```bash
python3 build_mix.py /path/to/ffmpeg
```

Then run the loudnorm and mux commands in the session log.

## Timing accommodations

- Each line starts at its original cue. It moves later only when the previous line hasn't finished, and then with a 250 ms breathing gap.
- A line that overruns its slot first has any internal pause over 0.36 s shortened. If it still overruns, it is time-compressed, **capped at 1.10×**.
- Lines that needed compression: narrator 01 (1.05×), 04 (1.09×), 05/06/09 (1.10×), 10 (1.08×) and Richa 06 (1.02×). All other lines play at natural speed.
- Largest start shifts: Priya's first line +0.80 s, because the handoff narration before it runs long. Narrator 06 moves +0.33 s and narrator 07 +0.17 s. Every other line starts within 0.02 s of its original cue.

## Script notes

- The wording matches the original. Only commas were adjusted, and only for delivery.
- The original audio said "dispersal", but the on-screen card reads **"Disbursal confirmed"**. The new narration says "disbursal".
