# DoubleTick — BFSI Secure Document Journey (1080×1080)

Final render: `renders/DoubleTick_BFSI_Secure_Document_Journey_1080x1080.mp4`
(H.264 High · 1080×1080 · 30 fps · AAC-LC stereo 48 kHz · 40.8 s · −17 LUFS)

## ⚠ The voiceover is a temporary guide track

The supplied master VO did not arrive with the brief. `assets/vo_guide.wav` is a
local TTS read of the exact script, used only to time the picture. To swap in
the real recording:

1. Convert it to 48 kHz WAV: `ffmpeg -i master.mp3 -ar 48000 assets/vo_master.wav`
2. Note where each of the 8 lines starts (seconds) and update `V` in **both**
   `index.html` and `audio/build_audio.py`. Update the `SUBS` cue times in
   `index.html` too. Everything else (scenes, SFX, music arc, ducking) is
   derived from `V`.
3. If the master runs longer or shorter, set root `data-duration` / `END` to match.
4. `python3 audio/build_audio.py --vo assets/vo_master.wav`, then point the
   `<audio id="vo">` src at `assets/vo_master.wav`.
5. `npx hyperframes check` → `npx hyperframes render -o renders/... -f 30 -q delivery`

## Structure

- `index.html` — one continuous master timeline (deliberately a single file:
  the document object persists and travels across all nine scenes).
- `audio/build_audio.py` — deterministic music bed + SFX stem, cued to `V`;
  music is ducked ~8 dB under the narration.
- `assets/fonts` — Hedvig Letters Serif, Geist, Geist Mono (local, no network).
- `assets/brand` — supplied DoubleTick logo files (used unaltered).
- `assets/vendor/gsap.min.js` — GSAP vendored so renders never fetch from a CDN.
