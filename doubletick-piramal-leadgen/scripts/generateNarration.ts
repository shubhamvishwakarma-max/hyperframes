/**
 * Narration pipeline (ElevenLabs REST API).
 *
 *   ELEVENLABS_API_KEY=... npx tsx scripts/generateNarration.ts
 *
 * 1. Resolves the voice by name from the account (exact match required — never substitutes).
 * 2. Generates the exact VOICEOVER with character-level timestamps.
 * 3. Writes public/audio/narration.mp3 and src/data/narration.json (word timings = master timeline).
 *
 * Note: the committed render was produced through the ElevenLabs connector (no API key in the build
 * container): take → pause-tightening + 1.19× pitch-preserving stretch → local forced alignment
 * (pocketsphinx). See README.md. This script is the key-based equivalent for re-runs.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { VOICEOVER, tokenize } from "../src/lib/script";

const VOICE_NAME = process.env.VOICE_NAME ?? "Aaditya - Healthcare Advisor";
const MODEL = "eleven_multilingual_v2";
const OFFSET = 0.3; // narration starts 0.3s into the film

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY is not set.");
  process.exit(1);
}
const headers = { "xi-api-key": key, "Content-Type": "application/json" };

type Voice = { voice_id: string; name: string };
type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

const resolveVoice = async (): Promise<Voice> => {
  const res = await fetch(
    `https://api.elevenlabs.io/v2/voices?search=${encodeURIComponent(VOICE_NAME)}&page_size=100`,
    { headers },
  );
  const body = (await res.json()) as { voices?: Voice[] };
  const exact = (body.voices ?? []).find(
    (v) => v.name.trim().toLowerCase() === VOICE_NAME.toLowerCase(),
  );
  if (!exact) {
    const names = (body.voices ?? []).map((v) => `  - ${v.name} (${v.voice_id})`).join("\n");
    throw new Error(
      `Voice "${VOICE_NAME}" not found in this account. Closest matches:\n${names || "  (none)"}`,
    );
  }
  return exact;
};

const main = async () => {
  const voice = await resolveVoice();
  console.log(`Voice: ${voice.name} → ${voice.voice_id}`);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}/with-timestamps?output_format=mp3_44100_192`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: VOICEOVER,
        model_id: MODEL,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.15,
          use_speaker_boost: true,
          speed: 1.1,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`TTS failed: ${res.status} ${await res.text()}`);
  const out = (await res.json()) as { audio_base64: string; alignment: Alignment };

  mkdirSync("public/audio", { recursive: true });
  writeFileSync("public/audio/narration.mp3", Buffer.from(out.audio_base64, "base64"));

  // Characters → words, matched against the script's own tokenisation.
  const {
    characters: ch,
    character_start_times_seconds: st,
    character_end_times_seconds: en,
  } = out.alignment;
  const words: { text: string; start: number; end: number }[] = [];
  let cur = "";
  let s = 0;
  ch.forEach((c, i) => {
    if (/[\s—]/.test(c)) {
      if (cur.trim()) words.push({ text: cur.trim(), start: s, end: en[i - 1] });
      cur = "";
    } else {
      if (!cur) s = st[i];
      cur += c;
    }
  });
  if (cur.trim()) words.push({ text: cur.trim(), start: s, end: en[en.length - 1] });

  const expected = tokenize(VOICEOVER).length;
  if (words.length !== expected)
    throw new Error(`Alignment produced ${words.length} words, expected ${expected}`);

  const duration = en[en.length - 1];
  writeFileSync(
    "src/data/narration.json",
    JSON.stringify(
      {
        file: "audio/narration.mp3",
        voiceId: voice.voice_id,
        voiceName: voice.name,
        model: MODEL,
        offset: OFFSET,
        duration: +(duration + OFFSET).toFixed(3),
        words: words.map((w) => ({
          text: w.text,
          start: +(w.start + OFFSET).toFixed(3),
          end: +(w.end + OFFSET).toFixed(3),
        })),
      },
      null,
      1,
    ),
  );
  console.log(`Narration ${duration.toFixed(2)}s, ${words.length} words → src/data/narration.json`);
  if (duration > 29.6) console.warn("Narration exceeds ~29.5s; the film is capped at 30.5s.");
};

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
