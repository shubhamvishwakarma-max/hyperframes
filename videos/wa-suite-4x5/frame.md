# frame.md — DoubleTick WA Suite (4:5 feed remake)

Brand truth for every frame. Source: the square "wa suite final sq.mp4" — match its look, re-laid-out for 1080×1350.

## Canvas & safe zones (4:5 feed)

- Canvas **1080 × 1350**, 24 fps source (render at 30).
- **Logo band, y 0–170: reserved.** The host draws the white DoubleTick pill (x 380–700, y 64–140) above every frame.
- **Hero band, y 190–900:** the main visual (type, UI card, chart, disc).
- **Caption band, y 920–1100:** the spoken line, centred, max width 960 (one line preferred, two max).
- Keep y 1180–1350 free of essential text (feed UI / crop safety). Backgrounds and footage bleed through it.
- Side gutters 60px.

## Colour tokens

| token | value | use |
| --- | --- | --- |
| `--cream` | `#F7F3EC` | light background base |
| `--blush` | `#F7CFD4` | radial glow on light backgrounds (bottom-right + top-left corners, 55% opacity) |
| `--grid` | `rgba(60,40,20,0.07)` | hairline grid lines on light bg, 2px, every 180px |
| `--ink` | `#1C1C1E` | primary text on light |
| `--ink-soft` | `#3A3A3C` | secondary text |
| `--ghost` | `#B9B3AA` | a word that is still "arriving" in captions |
| `--card` | `#FFFFFF` | UI cards |
| `--card-line` | `#ECE6DD` | card borders / table rules |
| `--chat-bg` | `#EFEAE2` | WhatsApp chat wallpaper |
| `--green-deep` | `#0D3A26` | dark green bg centre |
| `--green-edge` | `#072217` | dark green bg edges |
| `--mint` | `#22F08A` | hero accent on dark green (headlines, pills, glows) |
| `--mint-soft` | `#D3F5E1` | glass cards on green (gradient to `#A9E8C4`) |
| `--wa` | `#25D366` | WhatsApp brand green (logo, WhatsApp word, CTA button `#1FA855`) |
| `--red` | `#C8161D` | alert pills ("replies delayed", "No Visibility", "SLA TRIGGER", "risk") |
| `--red-deep` | `#5A0609` | dark red wash backgrounds |
| `--orange` | `#D9531E` | "delays", "over-alerts" pills, unanswered alert icons |
| `--amber` | `#D8A31A` | "frustration", "missed replies" pills |
| `--lime` | `#A8D94A` | "chaos" pill |
| `--night` | `#0B0B0C` | near-black bg (volume/control chart, "chats get missed") |

Light background recipe: `--cream` + two radial blush glows (`radial-gradient(circle at 100% 100%, rgba(247,207,212,.75), transparent 55%)`, `radial-gradient(circle at 0% 0%, rgba(247,207,212,.45), transparent 45%)`) + optional 180px hairline grid.
Dark green recipe: `radial-gradient(circle at 50% 45%, #145236 0%, #0D3A26 45%, #072217 100%)`.

## Type

- **Inter** (bundled — write `font-family: Inter, sans-serif;`, no @font-face needed). Weights 400/500/600/700.
- Logo wordmark only: **Montserrat 700**.
- Caption (spoken line): Inter 500, **70px**, line-height 1.12, letter-spacing −0.025em, centred. Ink on light, white on dark/footage.
- Headline words ("ignored", "real time", "instantly", "NO", "CX Overview"): Inter 600–700, **150–220px**, letter-spacing −0.045em.
- Pills: Inter 500, 64–84px text, `border-radius: 999px`, padding 0.28em 0.7em.
- UI text inside cards: Inter 500/400, 30–38px (names 32px 600, body 30px, meta 22px `--ghost`).
- No `<br>` in text; let width wrap or use separate block lines.

## Captions — the source's signature

Every spoken phrase appears **word by word on the VO word times** (given per frame in the worker brief, global seconds; convert to local by subtracting the frame start). Each word enters `opacity 0 → 1, y 18 → 0, 0.28s, power2.out`, starting colour `--ghost`, settling to the final colour over 0.35s. A new phrase replaces the old one with a quick fade (0.15s) — never stack two phrases.

## Motion language

- Snappy and clean. Enters: `y 40 → 0, opacity 0 → 1, 0.5s, power3.out`. Pills/badges pop: `scale 0.6 → 1, back.out(1.8), 0.45s`. Cards stagger 0.08–0.12s.
- Between beats inside a frame: hard cut or 0.2s crossfade (the source is cut-heavy). Between frames: hard cuts (the host cuts).
- Slow push-in on held shots: scale 1 → 1.04 over the beat.
- Cursor: macOS-style white hand/arrow with dark outline, glides on `power2.inOut`, click = scale 0.85 → 1 + a mint ripple ring.
- Never animate the `.clip` element's visibility/opacity — animate children.

## Footage (stock people)

Pre-cropped 4:5 clips in `assets/footage/` (1080×1350, muted, the burned DoubleTick logo already removed). **Each still has the source's burned-in caption/pill in it** — every footage frame must place its own opaque caption element exactly over the listed cover box so the burned text never shows. Darken footage slightly with a bottom gradient `linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.55) 28%, transparent 55%)` so white captions read.

## Components

- **DoubleTick logo pill** — host-owned, do not redraw in frames.
- **Alert pill**: `--red` fill, white Inter 500, optional leading icon (white line icon 0.9em).
- **Customer card**: white, radius 26px, border 2px `--card-line`, shadow `0 18px 50px rgba(30,20,10,.08)`, padding 26px 30px; left avatar disc 64px (lavender `#EDE3F7` with initials `#9C7BC4`), name 30px 600, message 30px `--ink-soft`; optional orange alert ring icon outside left.
- **WhatsApp chat window**: radius 34px, `--chat-bg` body, incoming bubbles white radius 18px with time stamp 20px `--ghost`, composer bar white radius 999 at bottom with emoji/attach/magic icons and a round send button.
- **Glass card (green scenes)**: radius 36px, gradient `--mint-soft → #A9E8C4`, inner white icon tile 120px radius 26px with a `#1FA855` icon, title Inter 600 72px `#0E3B27`.
