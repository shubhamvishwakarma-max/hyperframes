# DoubleTick — BFSI lending ad (1080 × 1080)

HyperFrames project for the DoubleTick performance ad aimed at lending, BFSI and
RM-led sales teams. It is 43.5 s long, 1:1, 30 fps and exports as H.264 MP4. All
timing follows the supplied ElevenLabs voiceover (`assets/audio/voiceover.mp3`,
42.45 s). The voice is used as delivered. It is never regenerated, trimmed or
retimed.

## Story (synced to the voiceover)

| Time | Scene | On-screen idea |
| --- | --- | --- |
| 0.0–6.9 | Lost opportunity | Built to read on mute: frame 0 already shows the lead card, the "RM callback" timer ring and "Loan lead comes in." with its caption. The ring fills green → amber → red as the timer races to 01:00+, "RM responds late." in red, then a huge two-line "Opportunity / gone." ("gone." in red) while the card turns Lost. Circular light-to-red gradient that washes out into green on "With DoubleTick". |
| 6.9–9.8 | Question | "How often does this happen / in your lending funnel?" over a lead path where one lead drops out |
| 9.8–14.7 | AI Voice | "New Loan Enquiry" → "AI Voice · Calling in 00:03" flies into a WhatsApp voice call from **ABC Bank ✓ · AI Agent**; captured chips (Personal Loan · ₹8L Requirement · Home Renovation) lock into a context record |
| 14.7–18.4 | Voice → WhatsApp | Waveform compresses into the chat header; the context record flows into the same thread as a context strip. "No repeating. Full context intact." |
| 18.4–23.7 | Documents + eligibility | WhatsApp Flow: Income proof / Bank statement / ID proof → Submit securely → Documents received. WhatsApp → **Bank Underwriting** → Eligibility received (the bank decides, not DoubleTick) |
| 23.7–26.0 | AI follow-up | Action pending → AI follow-up triggered → in-thread AI Voice call banner |
| 26.0–31.1 | RM takeover | Human assistance needed → Assigned to Rahul • Relationship Manager in the same thread; context stack synced to CRM; Rahul's message |
| 31.1–37.3 | Connected journey | Phone collapses into the WhatsApp node: Enquiry → AI Voice → WhatsApp → Documents → RM → Disbursal. "One connected lending journey." |
| 37.3–43.5 | Brand + CTA | Logo grows to the centre, "Built for lending at scale.", **Apply for Free Pilot Today** button |

## Files

- `index.html`: the composition (GSAP timeline, WhatsApp UI, subtitles)
- `assets/audio/voiceover.mp3`: the supplied VO (unaltered)
- `assets/audio/music-sfx.wav`: synthesised music plus SFX bed, ducked under the VO
- `scripts/build_audio.py`: rebuilds the bed (seeded, deterministic)
- `scripts/master.sh`: social loudness master (about −15 LUFS, −1.5 dBTP) for the final MP4
- `transcript.json`: word timings of the VO (Parakeet), used to place every cue
- `renders/doubletick-lending-ad-1080x1080.mp4`: final deliverable

## Rebuild

```bash
python3 scripts/build_audio.py                 # music + SFX bed
npx hyperframes check                          # browser gate
npx hyperframes render -f 30 -q delivery -o renders/draft.mp4
scripts/master.sh renders/draft.mp4 renders/doubletick-lending-ad-1080x1080.mp4
```

Fonts: Hedvig Letters Serif (headlines) and Geist (UI, subtitles), both SIL OFL,
bundled locally. The UI SFX come from the HyperFrames media-use library (Pixabay
licence). The music and the remaining SFX are synthesised in `build_audio.py`.
