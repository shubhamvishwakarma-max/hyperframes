# Piramal Finance × DoubleTick — agentic AI + human loan journey

A rebrand of the original Axis Bank DoubleTick demo (194.7 s, 1920×1080, 30 fps) as a HyperFrames composition. It keeps the same scenes, script, timing and layout.

- `index.html`: the whole composition (scene A problem → scene B solution → steps 01–10 → end card).
- `assets/voiceover.wav`: the original ElevenLabs voiceover with the six "Axis Bank" mentions re-voiced as "Piramal Finance" in each speaker's own voice. These are zero-shot clones of the narrator, Richa and Priya, spliced at natural pauses. All other audio is untouched.
- `assets/piramal-logo.png`, `assets/piramal-icon.png`: supplied brand assets. The icon is the WhatsApp profile avatar and call-screen badge; the full logo appears on the call screen, the header and the end card.
- `renders/`: the rendered MP4.

## Colour mapping

| Where | Original | Now |
| --- | --- | --- |
| Accents, caption bars, stage tags, labels, end-card chips | Axis maroon `#9A124C` | Piramal orange `#EF4123` (text-safe `#C9381B` / `#A82E14`) |
| WhatsApp header, send button, bubble labels, Flow sheet | maroon | WhatsApp `#008069` / `#00A884` |
| Call screen | maroon gradient | WhatsApp dark-teal call gradient |

## Rebuild

```bash
npx hyperframes lint
npx hyperframes render -o renders/PiramalFinance_DoubleTick_Demo_30fps.mp4 -f 30
```
