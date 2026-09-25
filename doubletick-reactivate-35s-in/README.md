# DoubleTick Voice AI — Reactivate Your CRM — India cut (9:16, 35s)

Old CRM database → manual re-engagement problem → DoubleTick Voice AI reactivates
leads over PSTN → missed call gets a WhatsApp follow-up → active opportunities → CTA.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 9:16 — 1080 × 1920 |
| Duration | 35.0s (1050 frames) |
| Frame rate | 30 fps |
| Output | MP4 / H.264 (`renders/doubletick-reactivate-35s-in-9x16.mp4`) |
| Placements | LinkedIn, Instagram Reels, paid social |
| Voice-over | ElevenLabs — "Aaditya K" (Indian English, male), `eleven_multilingual_v2`, 6 lines |
| Audio stems | `vo1`–`vo6` (VO, track 11), `music.wav` (bed, track 10), `sfx.wav` (UI/call cues, track 12) |
| Locale | India — Emerald Heights / Whitefield, ₹ pricing, BHK config |

## Layout system

- **Top band 0–230px (12%) stays empty in every scene.** No logo, header, badge
  or brand mark anywhere near the top; branding comes from colour, typography,
  UI and the end card.
- **Hero headlines are exactly three lines**, one font size (72px) and one
  weight (700) across all three, centre-aligned, in the visual centre of the
  frame. Emphasis comes from colour only — never from size.
- **Everything centres**: headlines, product UI, connectors, cards, subtitles.
- **Subtitles** carry the complete narration, two lines maximum, bottom safe area.

## Colour journey

Red appears only in 0:00–11.35 and only for negative states — OLD LEADS,
COMPETITORS, 20,000 COLD, COLD / INACTIVE / NOT CONTACTED, MANUAL CALLING. The
moment DoubleTick enters at 11.35s the red is gone for good and the film runs on
white + charcoal + DoubleTick green. NO ANSWER in the WhatsApp scene is neutral
grey, not red.

## Typography

**Geist only — no Geist Mono anywhere**, including numbers: `20,000`, the climbing
counter, `₹2.8 Cr`, `₹2.5–3.5 Cr`, `30 Days` and every lead ID are all Geist.

## Scene map

| # | Window | VO | Hero (3 lines) |
| --- | --- | --- | --- |
| 01 | 0.00 – 5.75 | 1 | `YOUR CRM HOLDS / THOUSANDS OF / OLD LEADS` then `YOUR COMPETITORS / ARE PAYING TO / FIND THEM AGAIN` |
| 02 | 5.75 – 11.35 | 2 | `20,000 COLD / NUMBERS CAN'T BE / CALLED MANUALLY` |
| 03 | 11.35 – 20.65 | 3 | `REACTIVATE YOUR / EXISTING LEADS / WITH VOICE AI` → `NATURAL PROJECT / CONVERSATIONS OVER / PSTN CALLS` → `QUALIFY INTEREST / IDENTIFY BUYERS / BOOK VIEWINGS` |
| 04 | 20.65 – 27.70 | 4 | `MISSED THE / VOICE CALL? / FOLLOW UP INSTANTLY` → `BROCHURE / PAYMENT PLAN / PROJECT DETAILS` |
| 05 | 27.70 – 35.00 | 5 | `TURN OLD LEADS / INTO ACTIVE / OPPORTUNITIES` → `REACTIVATE MORE / LEADS WITHOUT MORE / BROKERS` → end card |

## Audio

`tools/voice.py` generates the voiceover and the subtitle cues, `tools/score.py`
the bed and SFX, `tools/master.sh` masters the bed. The script is spoken verbatim;
pronunciation is fixed at the phoneme layer, never in on-screen text: DoubleTick
`dˈʌbəl tˈɪk`, Voice AI `ˌeɪˈaɪ`, PSTN `pˈiː ˈɛs tˈiː ˈɛn`, CRM `sˈiː ˈɑːɹ ˈɛm`,
WhatsApp `wˌʌts ˈæp`, and 20,000 spoken as "twenty thousand". Voice: Kokoro-82M
`af_heart`; override with `DT_VOICE=am_michael python tools/voice.py`.

## Determinism

No `Date.now()`, no unseeded `Math.random()`, no render-time network or fetch —
subtitle cues are baked in as a literal array. One paused GSAP root timeline on
`window.__timelines["main"]`; fonts, GSAP and audio are local to the project.

> **Note:** `doubletick.io` is blocked by this environment's network egress policy,
> so the palette is reconstructed rather than sampled. Swap the `:root` values in
> `index.html` for the official hexes.

## India localisation

Identical to the UAE cut in structure, timing, layout, colour and motion. The
only changes are the voice-over and the locale strings:

| UAE cut | India cut |
| --- | --- |
| Kokoro-82M TTS (`am_michael`) | ElevenLabs "Aaditya K" (`SVdvKlYuyNTd1xzQqLWD`) |
| Marina Residences | Emerald Heights |
| Starting AED 2.8M | Starting ₹2.8 Cr |
| 2 Bedroom | 3 BHK |
| Hi Mohammad … AVA at Palm Jumeirah | Hi Rohit … Emerald Heights in Whitefield |
| Budget AED 3–4M | Budget ₹2.5–3.5 Cr |

The narration script is unchanged — it carried no locale references.

The ElevenLabs read is slower than the previous TTS read (35.3s of speech vs
32.7s), so each line is de-silenced at the head/tail and lines 3 and 5 are
nudged +13% / +11% in tempo (pitch-preserving `atempo`) to keep every scene
window, animation and cut at exactly the original 35.0s. Subtitle cues were
re-derived against the new line durations. `tools/voice.py` is retained from the
UAE cut for reference but no longer produces the shipped audio.

## Audio build

Three buses, kept as separate stems so the brief's level relationship is exact
and verifiable rather than eyeballed:

| Bus | File | Level | Measured |
| --- | --- | --- | --- |
| Narration | `vo1`–`vo6.wav` | dominant, mastered to I=-15 LUFS | -15.3 dBFS active RMS |
| Music bed | `music.wav` | 18–22 dB under the voice | **20.4 dB** under |
| UI / SFX | `sfx.wav` | 12–18 dB under the voice | **15.4 dB** under |

`tools/score.py` writes the music and SFX stems from seeded, closed-form
synthesis (no sample library, so the render stays deterministic) and applies a
cosine-edged ducking envelope keyed to the narration windows: -3.5 dB under
every line, -6 dB under the phrases the brief flags for emphasis. The SFX bus
ducks only -1 to -2 dB, since it is sparse by design.

Cue map, following the sound-design brief:

| Window | Music | SFX |
| --- | --- | --- |
| 0:00–0:04 | premium corporate tension bed, sub-pulse underneath | soft CRM/dashboard notification on the word "CRM", record-scroll ticks, three competitor blips |
| 0:04–0:09 | same bed holds | faint phone-list / database UI ticks under the counter, dry manual-dial beeps — no literal ringing |
| 0:09–0:18 | shifts positive and progressive as DoubleTick lands (11.35s) | route-open blip, two restrained ring cycles, a clean PSTN connect, low conversational ambience under the call |
| 0:18–0:25 | continues | one soft falling missed-call cue, one clean two-tone WhatsApp message tone, UI ticks on Brochure / Payment plan / Project details and on each CTA row |
| 0:25–0:31 | opens up, more confident | soft success confirmations as leads flip to active |
| final CTA | resolves cleanly over 0.8s | one restrained branded impact on "Book your DoubleTick AI demo today" |

No cinematic booms, exaggerated whooshes, stock jingles or futuristic AI sounds.
Final mix peaks at -1.2 dBFS.

## Fitting the read to 35.0s

The directed read totals 33.8s of speech across six lines. Every scene window,
animation and cut stays exactly where it was; each line is de-silenced at the
head and tail and placed in its own scene, with a light pitch-preserving tempo
nudge where a line overran its window (line 3 +2.5%, line 4 +8.1%, line 5 +4%;
lines 1, 2 and 6 run at their natural pace). A 0.42s beat sits after the first
sentence, per the delivery notes. Subtitle cues were re-derived from the
measured pause boundaries inside each rendered line rather than estimated.
