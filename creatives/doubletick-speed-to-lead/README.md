# DoubleTick — Speed to Lead (1080 × 1080 static ad)

Square performance creative for LinkedIn / Instagram / Meta paid.

- `ad.html` — the source. Self-contained single file (Figtree + JetBrains Mono embedded as base64 woff2, all art is inline SVG/CSS). Fixed `.canvas` of 1080 × 1080, no overflow, 64px safe margins.
- `ad.png` — the exported creative, 1080 × 1080.

## Re-export

```bash
/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell \
  --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,1080 --virtual-time-budget=4000 \
  --screenshot=ad.png file://$PWD/ad.html
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
