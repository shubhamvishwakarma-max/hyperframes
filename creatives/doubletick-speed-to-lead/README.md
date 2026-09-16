# DoubleTick — Speed to Lead (1080 × 1080 static ad)

Square performance creative for LinkedIn / Instagram / Meta paid.

Two variants:

- `ad-minimal.html` / `ad-minimal.png` — **the simple one**, built on the "Building a new AI agent…" reference layout: black top band with the framed headline panel, centered supporting line, a three-step visual (New Lead → 00:01 AI Calling → Broker), the green CTA button with cursor, and the brand footer bar.
- `ad.html` / `ad.png` — the denser product-UI variant (lead card, live call panel, qualification chips, manual-vs-AI timer strip).

- `ad.html` — the source. Self-contained single file (Figtree + JetBrains Mono embedded as base64 woff2, all art is inline SVG/CSS). Fixed `.canvas` of 1080 × 1080, no overflow, 64px safe margins.
- `ad.png` — the exported creative, 1080 × 1080.

## Re-export

```bash
/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,1080 --virtual-time-budget=4000 \
  --screenshot=ad-minimal.png file://$PWD/ad-minimal.html
```

(Any headless Chrome works; use `headless_shell` — the `--headless=new` path renders at a ~1.09× scale here.)

## Structure

Reusable blocks, mirroring the reference design system (dark charcoal → green wash, green accent,
rounded enterprise cards, mono for numerics/labels):

- `.header` — DoubleTick lockup + Meta Business Partner badge
- `.head` — kicker pill, hook with `5+ MINUTES` as the dominant element
- `.compare` — `Manual follow-up 05:00+` (ghosted, struck) vs `DoubleTick Voice AI 00:01`
- `.hero` — lead card (Ahmed R. · Dubai Marina Residence · AED 2.5M) → 1 sec connector → AI call panel (`00:01`, LIVE, waveform)
- `.hero-bottom` — qualification chips + live broker handoff
- `.support` / `.cta` — supporting line and CTA button

The waveform is generated from a fixed height array (no `Math.random()`), so exports are deterministic.

---

## Scene — 0:21–0:29 "WhatsApp follow-up"

`scene-whatsapp-followup.html` — an 8-second animated scene (1080 × 1080), self-contained, **Geist / Geist Mono only**.
`scene-whatsapp-followup.webm` — rendered preview (24 fps, 8.00s). `frames/` holds four key stills.

Voice-over it is cut to: *"If they miss the call, DoubleTick instantly follows up on WhatsApp with the brochure, payment plan, and project details."* — carried as full subtitles in the bottom safe area, above the unchanged campaign footer.

### Beat sheet

| t | beat |
|---|---|
| 0.0 | Headline 01 rises in — MISSED THE / VOICE CALL? / **WHATSAPP FOLLOWS UP** (green) |
| 0.25 | Missed-call state: `VOICE AI CALL · No answer · 00:22` (green, never red) |
| 1.20 | WhatsApp thread opens (panel scales in) |
| 1.45 | In-thread system line: `Voice call · No answer` |
| 1.75 | Personalised intro message to Ahmed |
| 2.55 | Brochure attachment (PDF card) |
| 3.30 | Headline 02 — BROCHURE / PAYMENT PLAN / PROJECT DETAILS |
| 3.45 | Payment plan card (20/60/20, AED 2.1M, Q4 2027) |
| 4.35 | Project details card |
| 5.05 | Headline 03 — NO RESPONSE? / SEND A / **REQUEST FOR CALLBACK** (green) |
| 5.70 | CTA message: "Want to speak with our team?" |
| 6.30 | **Request for Callback** button pulses (3 cycles) |

A four-step green progress rail (Missed call → WhatsApp sent → Project info → Callback) lights up in step with the thread.

### Timeline model

Every animated element carries `--d` (its start time in scene seconds) and resolves
`animation-delay: calc(var(--d) - var(--seek))`. With `--seek: 0s` the scene plays live in a browser;
appending `?t=3.45` sets `--seek` and pauses all animations, so any frame can be rendered exactly and
repeatably. `./render-scene.sh` uses that to export the whole sequence and encode an H.264 master.
(The bundled Playwright ffmpeg is VP8-only, which is why the checked-in preview is `.webm`.)
