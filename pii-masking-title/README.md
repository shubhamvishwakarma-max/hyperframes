# DoubleTick title card: "Custom PII Masking and Blocking"

`doubletick-custom-pii-masking.mp4` is the uploaded `logo.mp4` with only the title text changed:

- Before: "How to connect / DoubleTick with Claude / via MCP server?"
- After: "Custom PII Masking / and Blocking"

`doubletick-rcs-1on1-conversation.mp4` is the same treatment with "RCS message in a 1:1 / conversation ?". It was rendered with
`--variables '{"line1":"RCS message in a 1:1","line2":"conversation ?"}'`.

Nothing else was changed:

- **0 – 4.04s (frames 0–96), the logo intro:** taken straight from the source. Its PSNR against the original is 61.5 dB, so the difference can't be seen.
- **Audio:** stream-copied. The MD5 is identical to the source.
- **4.04 – 7s (frames 97–167), the title card:** the original background, dot grid, moving glows, logo and camera pan are all kept. The old text was removed and the new text added in its place.

## How the title card was rebuilt

1. **Text style, measured from the source.** The font is Geist Regular at 146.5px, with letter-spacing -1.03px and a line pitch of 170px. The first line's cap top is at y=506.5. Each line has a vertical gradient from `rgb(252,253,251)` to `rgb(193,232,202)`.
2. **Animation, fitted to the source frame by frame.**
   - The characters are staggered by 0.01783s each. Spaces and line breaks count as characters.
   - Each word rises 236px over 0.719s with the ease `1-(1-p)^2.5`.
   - Each letter fades in over 0.5625s with `power1.out`, starting 0.065s after its word begins to rise.
   - To check the fit, the original text was re-rendered with this model and compared to the source. Positions match within 1–2px and opacities within ~0.02.
3. **`composition/index.html` (HyperFrames).** Renders the text on a transparent background:
   `npx hyperframes render composition --format png-sequence -f 24 -o renders/new`.
   The text can be changed with variables (`line1`, `line2`, `line3`, `anchor`).
4. **`scripts/clean_plate.py`.** Removes the old text. It uses frame 97, which has no text yet, and adds a smooth estimate of how the glow changes in each frame. The mask is the re-rendered original-text matte combined with a mask detected from the source.
5. **`scripts/composite.py`.** Places the new text over the clean plate. ffmpeg then joins the result to the untouched intro and copies the original audio.

To align the 2 lines with the bottom of the original 3-line block instead of the top, render with `--variables '{"anchor":"bottom"}'`.
