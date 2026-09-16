# DoubleTick — Reactivate Your Cold CRM (9:16 performance ad)

A vertical performance ad on reactivating a dormant real-estate CRM with
DoubleTick AI Calling over PSTN, with WhatsApp fallback when a call goes
unanswered. Built as a HyperFrames composition.

| Spec | Value |
| --- | --- |
| Aspect / resolution | 9:16 — 1080 × 1920 |
| Duration | 52.4s (1572 frames) |
| Frame rate | 30 fps |
| Output | MP4 / H.264 (`renders/doubletick-crm-reactivation-9x16.mp4`) |
| Placements | LinkedIn, Instagram Reels, paid social |

## Run

```bash
npx hyperframes lint
npx hyperframes check     # lint + runtime + layout + motion + WCAG contrast
npx hyperframes render -o renders/doubletick-crm-reactivation-9x16.mp4 -f 30 -q delivery
```

`render` needs `ffmpeg` and `ffprobe` on PATH.

## Scene map

| # | Window | VO | On screen |
| --- | --- | --- | --- |
| 01 | 0.00 – 9.70 | 1 | Frame 0 is the lead database itself — records bleeding past the frame. `Your Cold Lead Database = Unlocked Off-Plan Revenue`, then YOUR CRM vs a competitor's new-lead acquisition spend |
| 02 | 9.70 – 17.55 | 2 | Broker worksheet, one number at a time → `20,000` / `OLD LEADS` over a cascade of contact rows → `Manual re-engagement doesn't scale.` |
| 03 | 17.55 – 30.65 | 3 | `Reactivate 20,000+ Leads Instantly Over PSTN`, CRM DATABASE → DOUBLETICK AI → PSTN CALLS, four calls running, then one live conversation → VIEWING INTEREST High → VIEWING BOOKED |
| 04 | 30.65 – 41.90 | 4 | CALLING → NO ANSWER → WHATSAPP FALLBACK → MESSAGE SENT; the message card grows as Project Brochure.pdf and Payment Plan.pdf attach; delivery ticks turn DoubleTick green |
| 05 | 41.90 – 48.00 | 5a | Records flip COLD → CONTACTED → INTERESTED / VIEWING BOOKED, broker queue fills → `Monetize Your Existing CRM.` / `Zero Extra Brokers.` |
| 06 | 48.00 – 52.40 | 5b | End card: `Turn Cold Leads Into Active Sales`, `AI Calling + WhatsApp Follow-Up`, `BOOK YOUR AI DEMO`, CRM → AI CALL → WHATSAPP → ACTIVE LEAD |

## Typography

Geist for all copy, UI labels and the CTA. Geist Mono for every numeral-led
element — `20,000` / `20,000+`, lead IDs, phone numbers, `AED 1.8M`, record
counts, call duration, file sizes, the broker-queue count.

## Audio

`tools/voice.py` generates the voiceover, `tools/score.py` the bed and SFX, and
`tools/master.sh` masters the bed. The script is spoken verbatim; pronunciation
is fixed at the phoneme layer before synthesis, never in on-screen text:

| Term | Phonemes sent |
| --- | --- |
| CRM | `sˈiː ˈɑːɹ ˈɛm` (C — R — M) |
| PSTN | `pˈiː ˈɛs tˈiː ˈɛn` (P — S — T — N) |
| AI | `ˌeɪˈaɪ` (A — I) |
| DoubleTick | `dˈʌbəl tˈɪk` (Double Tick) |
| WhatsApp | `wˌʌts ˈæp` (unforced) |
| 20,000 | `twˈɛnti θˈaʊzənd` (twenty thousand, not a digit readout) |

Prosody is authored per sentence — own speech rate, authored clause/sentence
pauses and inter-sentence gaps, a soft inhale ahead of the two biggest sentence
starts — then a commercial voice chain (EQ, compression, loudness). Read runs
~168 wpm. Voice: Kokoro-82M `af_heart`; override with
`DT_VOICE=am_michael python tools/voice.py`.

## Determinism

No `Date.now()`, no unseeded `Math.random()`, no render-time network. GSAP runs
as one paused root timeline on `window.__timelines["main"]`; fonts, GSAP and all
audio are local to the project.

> **Note:** `doubletick.io` is blocked by this environment's network egress policy,
> so the palette is reconstructed from DoubleTick's known identity rather than
> sampled from the live site. Swap the `:root` values in `index.html` for the
> official brand hexes — nothing else hardcodes a colour.
