# DoubleTick Agentic AI — UAE Real Estate (1080×1080 ad)

45.8 s, 30 fps, H.264 MP4. Render: `renders/doubletick-uae-real-estate-1080.mp4`.

## Timeline

| Time | Scene file | Beat | VO |
| --- | --- | --- | --- |
| 0.0–3.8 | `compositions/ads.html` | Ads are working → three sources feed WhatsApp | "Your real estate ads are working." |
| 3.8–11.0 | `compositions/problem.html` | 4 identical enquiries, coral tint, "who's ready to buy?" → green sweep → Introducing DoubleTick Agentic AI | lines 2–3 |
| 11.0–20.0 | `compositions/qualify.html` | ABC Properties chat; budget/location/type/timeline chips extract, then snap into the Buyer Profile → High Intent | line 4 |
| 20.0–23.8 | `compositions/match.html` | 3 matching Dubai Marina properties, Best Match | "Then, it recommends matching properties," |
| 23.8–30.8 | `compositions/answer.html` | Pricing / payment plan / amenities answered, then viewing booked | "…answers questions…" / "…books the viewing automatically." |
| 30.8–38.2 | `compositions/handoff.html` | Chips move into the RM workspace, assigned to Sarah; other leads recede, RM chat | line 6 |
| 38.2–41.8 | `compositions/journey.html` | Ad → WhatsApp → AI Qualification → Property Match → Viewing → RM | "DoubleTick Agentic AI. Built for UAE real estate." |
| 41.8–45.8 | `compositions/cta.html` | Logo, headline, Book Your Free Demo Today → | "Book your free demo today." |

Subtitles live in `compositions/captions.html` (Geist Medium 28 px, bottom centre).

## Audio

- Voiceover: `assets/vo/*.wav`, local Kokoro TTS (`af_heart`), one file per line so each line is placed on its beat in `index.html`. Swap a file with a pro VO of the same line and nudge its `data-start`.
- SFX: `assets/sfx/` (HyperFrames bundled library, see `assets/sfx/CREDITS.md`).
- **No music bed yet.** To add one, drop it in `assets/music/bed.mp3` and add to `index.html`:
  `<audio id="bgm" class="clip" src="assets/music/bed.mp3" data-start="0" data-duration="45.8" data-track-index="9" data-volume="0.14" data-fade-out="1.5"></audio>`

## Assets

- WhatsApp UI: header, doodle wallpaper and composer are cut from the reference screenshot (`assets/ui/wa-*`); only the avatar, name and messages are ours. The Team Inbox wallpaper is cut from the DoubleTick inbox screenshot (`assets/ui/dt-wall.jpg`).
- The DoubleTick logo is pinned top-left (80 px from top and left) for the whole film, on the root (`#dt-logo` in `index.html`).

- Logo: `assets/brand/logo-dark.svg` (from doubletick.io). Fonts: Hedvig Letters Serif, Geist (Google Fonts, OFL).
- Property thumbnails / background towers: Unsplash (Unsplash License).
- "ABC Properties", "Ahmed", "Sarah" and the listings/prices are fictional demo content.

## Editing

`tools/generate.mjs` regenerates every composition and `index.html` from one file (copy, timings, colours at the top):
`node tools/generate.mjs .` — it overwrites hand edits to the generated files. Then `npx hyperframes check` and `npx hyperframes render -q delivery`.
