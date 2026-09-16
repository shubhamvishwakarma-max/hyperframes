# Brand layer

The persistent DoubleTick lockup lives in `index.html` as `#dt-logo`, a top-level
element **outside every scene section**, at `z-index: 100`. No tween in the
composition targets it, so it cannot be moved, faded, scaled or covered by a
scene transition — it is painted identically on every frame from 0:00 to the
final frame.

## Swapping in the official asset

The official logo file did not reach this session, so `#dt-logo` currently draws
the mark inline (green double-tick SVG + "DoubleTick" in Geist). To use the real
lockup, drop the file in this folder and replace the two child elements of
`#dt-logo` with a single image:

```html
<div id="dt-logo">
  <img src="assets/brand/doubletick-logo.svg" alt="DoubleTick" style="height: 52px" />
</div>
```

Position, clear space and alignment are controlled in one place — the `#dt-logo`
rule in `index.html`:

```css
#dt-logo { left: 92px; top: 104px; }
```

`left`/`top` set the distance from the frame edges; the lockup height sets the
scale. Nothing else in the composition needs to change.
