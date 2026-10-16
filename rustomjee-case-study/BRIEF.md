# BRIEF — DoubleTick × Rustomjee customer case study

workflow: general-video
flow: automation
storyboard: no

## Intent
Premium enterprise-SaaS customer story: missed sales calls → 17 WhatsApp numbers, one platform →
AI-qualified leads → higher connectivity → more revenue bookings. Editorial typography, real
DoubleTick/Rustomjee branding, simplified product UI rebuilt from the supplied reference board.

## Stated (from the user's master prompt)
- 16:9, 1920×1080, 30 fps, H.264 MP4
- Supplied ElevenLabs VO is the master track; wording unchanged
- Hedvig Letters Serif (hook, statements, KPIs) + Geist (UI, labels, subtitles)
- DoubleTick logo fixed top-left; Rustomjee introduced in the opening as the customer
- UI references from the supplied board: number cards, mobile inbox, desktop inbox, AI chat, voice call, revenue-booking card
- Salesperson footage shown when the VO says "salesperson calls"
- Subtitles synced to the VO, max two lines, bottom safe area

## Inferred / decided
- **Length ≈ 38 s, not 30 s.** The supplied VO itself runs 35.5 s; animation follows the audio.
- **The VO doesn't include the brand line** "DoubleTick. Turn missed connections into business growth."
  A 1.5 s breath was inserted after "…before a salesperson calls." (23.3 s) so the bridge scene can carry
  that line on screen with music only. The VO wording is untouched.
- **Music and SFX were synthesised locally** (no music was supplied, and the ElevenLabs workspace had too few credits).
- **Word timings** come from forced alignment (pocketsphinx) of the exact script against the VO.
- **Output filename uses 1920x1080** instead of the brief's `-1080x1080` suffix, because the frame is 16:9.
- **Illustrative extras:** the 10 desk/team numbers beyond the 7 named reps (e.g. "Thane Sales"), and lead names
  reused from the reference board.
