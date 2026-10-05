# DoubleTick — BFSI Secure Document Journey (1080×1080)

Final render: `renders/DoubleTick_BFSI_Secure_Document_Journey_1080x1080.mp4`
(H.264 High · 1080×1080 · 30 fps · AAC-LC stereo 48 kHz · 36.4 s · −17.6 LUFS)

## Voiceover

`assets/vo_master.wav` is the supplied master VO (ElevenLabs "Aaditya", converted from
the delivered MP3 at `assets/vo_master_src.wav` and loudness-normalised to −17 LUFS by
`audio/build_audio.py`). Line starts are in `V` in both `index.html` and
`audio/build_audio.py`; scenes 3–9 keep the original choreography, scaled per scene
(`K3…K9`) to the master read. `assets/vo_guide.wav` is the earlier TTS guide, kept for reference.

## Opening hook (0 → 8.6s, mute-first)

Built to read with sound off: documents (PAN / Bank Statement / Income Proof) → a
WhatsApp attachment to "Rohan (RM)" → the stack travels toward an RM phone → ghost
copies + freeze ("Local file?") → a DoubleTick-green line redirects it and becomes the
outline of the verified ABC Bank WhatsApp. Headlines (Hedvig): "Sensitive documents are
already moving through WhatsApp." → "But where do they end up?" → "Governed — or
sitting on an RM's phone?". Subtitles start at 8.61s; the hook is captioned by its headlines.

## Structure

- `index.html` — one continuous master timeline (deliberately a single file:
  the document object persists and travels across all nine scenes).
- `audio/build_audio.py` — deterministic music bed + SFX stem, cued to `V`;
  music is ducked ~8 dB under the narration.
- `assets/fonts` — Hedvig Letters Serif, Geist, Geist Mono (local, no network).
- `assets/brand` — supplied DoubleTick logo files (used unaltered).
- `assets/vendor/gsap.min.js` — GSAP vendored so renders never fetch from a CDN.
