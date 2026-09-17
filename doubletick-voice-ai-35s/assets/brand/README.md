# Brand layer

The persistent DoubleTick lockup lives in `index.html` as `#dt-logo`, a top-level
element **outside every scene section**, at `z-index: 100`. No tween in the
composition targets it, so it cannot be moved, faded, scaled or covered by a
scene transition — it is painted identically on every frame from 0:00 to the
final frame.

## Position

Top centre, controlled in one rule:

```css
#dt-logo { left: 0; right: 0; top: 104px; justify-content: center; }
#dt-logo .mark { width: 78px; height: 42px; }
```

`top` sets the distance from the frame edge; `.mark` sets the scale.

## The mark

`#dtmark` in the shared `<defs>` is traced from the supplied lockup: two ticks
with the first partly behind the second, mitred corners and flat stroke ends, in
the logo's own green `--brand-green: #2bb673` (sampled from the artwork). The
wordmark is set in Geist Bold alongside it.

## Using the vector file directly

If you can drop the original `.svg` into this folder, replace the two children of
`#dt-logo` with the file and the traced copy is no longer used:

```html
<div id="dt-logo">
  <img src="assets/brand/doubletick-logo.svg" alt="DoubleTick" style="height: 42px" />
</div>
```

Nothing else in the composition needs to change.
