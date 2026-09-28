# DoubleTick — 15s launch video

A 1920×1080, 15-second motion-graphics launch spot for DoubleTick, built as a single HyperFrames composition (`index.html`, GSAP).

| Time | Beat | Motion |
| --- | --- | --- |
| 0.0–2.4s | **Delivered. Read. Sold.** | Ticks stroke-draw in grey, then turn blue for "read" and lime for "sold". Slot-machine word rolls, shockwave ring, camera punch. |
| 2.4–5.4s | **Every chat. One inbox.** | Scattered chat cards fly in, snap into a tidy shared inbox, and agent chips pop in. |
| 5.4–8.4s | **Broadcast to thousands.** | Phone sends, pulse rings and message packets radiate, 70 contacts light up by distance, odometer counts to 25,000. |
| 8.4–11.4s | **Bots that sell while you sleep.** | Bot conversation: typing dots, a product card, a finger tap with ripple on "Buy now", a paid confirmation and a "+1 sale" sticker. |
| 11.4–15s | **Logo resolve** | Skewed brand wipe, the mark spins in and draws, a spark burst, the wordmark letters flip up, then the tagline and CTA. |

GSAP and the Plus Jakarta Sans font are vendored in `assets/`, so renders make no network calls.

```bash
npx hyperframes lint
npx hyperframes preview                              # scrub in the studio
npx hyperframes render -o doubletick-launch.mp4
```

The video is silent. To add a music bed or SFX, drop an `<audio>` clip into the composition (see `/media-use`).
