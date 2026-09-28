# DoubleTick × AU Small Finance Bank — 30s lead-gen video

A Remotion + React + TypeScript project that renders `doubletick-au-bank-leadgen-30sec.mp4`: a 1080×1080, 30 fps, 32-second H.264/AAC performance ad for LinkedIn, Meta and Instagram.

## Render

```bash
npm install
python3 scripts/build_audio.py        # rebuilds public/audio stems from audio-src/ (needs numpy + scipy)
npx remotion render AULeadGenVideo out/doubletick-au-bank-leadgen-30sec.mp4
# offline / preinstalled Chromium:
#   --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion studio                   # scrub the timeline interactively
node scripts/stills.mjs 2.8 10.9 24   # QA stills at given seconds → out/stills/
```

## Structure

```
src/
  Root.tsx, AULeadGenVideo.tsx   composition + scene windows + audio stems
  timing.ts                      beat sheet (single source of truth for picture AND sfx sync)
  fonts.ts                       Geist / Geist Mono loaded from the `geist` package (public/fonts)
  styles/tokens.ts               colours, radii, shadows, easing (0.22, 1, 0.36, 1)
  scenes/                        Hook → Reengagement → RMRouting → Impact → Value → CTA
  components/                    DoubleTickLogo, AULogo, KineticHeadline, LeadCard, LeadStack,
                                 PhoneMockup, PhoneLayer, WhatsAppHeader, VerifiedBadge, ChatBubble,
                                 AIVoiceCard, RMCard, ContextTimeline, MetricCard, WorkflowConnector,
                                 CTAButton, BrandBar, Background, StatusChip, Icons, Avatar, Subtitles
public/
  assets/doubletick-mark.svg                 DoubleTick mark (DT.svg brand asset)
  assets/au-small-finance-bank-logo.png      AU Small Finance Bank mark (see note below)
  audio/narration.mp3, music.mp3, sfx.wav    pre-aligned, pre-ducked stems
audio-src/                                   original ElevenLabs VO + music takes, pause-squeeze helper
scripts/build_audio.py                       VO levelling, music ducking, synthesised SFX
```

## Subtitles

On-screen text is in sentence case. Burned-in captions (`src/components/Subtitles.tsx`) follow the voiceover phrase by phrase. Cue times come from the measured pause boundaries of the narration. Scene content is scaled to 92% toward the top to leave a clean band for them.

## Audio

- **Voiceover:** ElevenLabs `eleven_multilingual_v2`, voice "Raj – Indian English Ads & Social", using the supplied script word for word. The natural read ran about 41 s. To fit 30–32 s, pauses longer than 0.2 s were shortened (`audio-src/squeeze.py`) and the take was sped up 1.2× (`atempo`). The exception is "Let your RMs focus on conversations that convert.", which is left at natural 1.0× speed. The result is about 31.5 s.
- **Music:** ElevenLabs `eleven_music_v2`, instrumental (checked with a transcription pass: no vocals). It is delayed 0.4 s so its lift lands on the "better way" transition, and ducked about 8.5 dB whenever the voice is active.
- **SFX:** synthesised in `build_audio.py` (ticks, message pops, call ring/connect, chimes, whooshes, metric thumps) and placed from `src/timing.ts`.

## Brand asset notes

- **DoubleTick:** the mark path comes from the DoubleTick `DT.svg` brand file. The wordmark is set in Geist SemiBold.
- **AU Small Finance Bank:** doubletick.io, aubank.in and Wikimedia were unreachable from the build environment. The mark currently used is the AU icon shipped in the `banks-in-india` npm package (48×48 px). It is shown at 44–46 px so it stays sharp, but it is not a first-party file. **Before publishing, replace `public/assets/au-small-finance-bank-logo.png` with the official high-resolution AU logo** (same filename, square, transparent or white background) and re-render. No code changes are needed.
