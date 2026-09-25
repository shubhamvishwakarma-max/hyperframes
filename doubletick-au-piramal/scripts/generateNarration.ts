/**
 * Generates the narration with ElevenLabs and syncs the Remotion composition to it.
 *
 *   ELEVENLABS_API_KEY=... npx tsx scripts/generateNarration.ts
 *
 * 1. Resolves the voice "Aaditya - Healthcare Advisor" (exact name; stops if missing).
 * 2. Renders the narration with character-level timestamps.
 * 3. Writes public/audio/narration.mp3.
 * 4. Writes src/narration-timing.json (duration + visual cue times from the spoken words).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VOICE_NAME = "Aaditya - Healthcare Advisor";
const MODEL_ID = "eleven_multilingual_v2";
const OFFSET_SEC = 0.3; // narration starts 0.3s into the film

export const NARRATION = `Still chasing lakhs of leads manually, while hot opportunities go cold before your RMs can follow up?

AU Small Finance Bank uses DoubleTick AI Voice and WhatsApp to re-engage dormant and rejected leads at scale—placing over three lakh twelve thousand outbound AI calls and routing engaged customers to the right RM.

Piramal Finance uses DoubleTick AI Voice and WhatsApp across the loan lifecycle—from application follow-ups and drop-off recovery to partner engagement and collections—cutting RM response time by ninety percent.

Automate outreach. Surface high-intent conversations. Let your RMs focus on closing.

Book your DoubleTick demo today.`;

// Visual cue → phrase in the narration (first occurrence after the previous cue).
const CUE_PHRASES: [string, string][] = [
  ["hook", "Still chasing"],
  ["au", "AU Small Finance Bank"],
  ["auDoubleTick", "DoubleTick AI Voice"],
  ["auWhatsApp", "WhatsApp"],
  ["auMetric", "three lakh twelve thousand"],
  ["auRm", "right RM"],
  ["piramal", "Piramal Finance"],
  ["pDoubleTick", "DoubleTick"],
  ["pChannels", "AI Voice and WhatsApp"],
  ["pChip1", "application follow-ups"],
  ["pChip2", "drop-off recovery"],
  ["pChip3", "partner engagement"],
  ["pChip4", "collections"],
  ["pMetric", "ninety percent"],
  ["solution", "Automate outreach"],
  ["cta", "Book your DoubleTick demo"],
];

const normalize = (s: string) => s.toLowerCase().replace(/[–—-]/g, "-").replace(/\s+/g, " ").trim();

type Voice = { voice_id: string; name: string };

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set.");
  const res = await fetch(`https://api.elevenlabs.io${path}`, {
    ...init,
    headers: { "xi-api-key": key, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

async function resolveVoice(): Promise<Voice> {
  const target = normalize(VOICE_NAME);
  const mine = await api<{ voices: Voice[] }>(`/v2/voices?page_size=100&search=${encodeURIComponent("Aaditya")}`);
  const shared = await api<{ voices: Voice[] }>(`/v1/shared-voices?page_size=100&search=${encodeURIComponent("Aaditya")}`);
  const all = [...mine.voices, ...shared.voices];
  const hit = all.find((v) => normalize(v.name) === target);
  if (!hit) {
    const near = all.map((v) => `  - ${v.name} (${v.voice_id})`).join("\n");
    console.error(`Voice "${VOICE_NAME}" was not found. Stopping (no substitution).\nClosest matches:\n${near}`);
    process.exit(1);
  }
  return hit;
}

async function main() {
  const voice = await resolveVoice();
  console.log(`Voice: ${voice.name} (${voice.voice_id})`);

  const out = await api<{
    audio_base64: string;
    alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
  }>(`/v1/text-to-speech/${voice.voice_id}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST",
    body: JSON.stringify({
      text: NARRATION,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });

  mkdirSync(join(ROOT, "public/audio"), { recursive: true });
  writeFileSync(join(ROOT, "public/audio/narration.mp3"), Buffer.from(out.audio_base64, "base64"));

  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = out.alignment;
  const spoken = characters.join("");
  const cues: Record<string, number> = {};
  let from = 0;
  for (const [name, phrase] of CUE_PHRASES) {
    const idx = spoken.indexOf(phrase, from);
    if (idx < 0) throw new Error(`Cue phrase not found: ${phrase}`);
    cues[name] = +(starts[idx] + OFFSET_SEC).toFixed(2);
    from = idx + phrase.length;
  }
  const durationSec = +(ends[ends.length - 1] + OFFSET_SEC).toFixed(2);
  writeFileSync(
    join(ROOT, "src/narration-timing.json"),
    JSON.stringify({ source: `elevenlabs:${voice.voice_id}`, durationSec, cues }, null, 2) + "\n",
  );
  const assetsPath = join(ROOT, "src/audio-assets.json");
  const assets = JSON.parse(readFileSync(assetsPath, "utf8"));
  writeFileSync(assetsPath, JSON.stringify({ ...assets, narration: true, narrationOffsetSec: OFFSET_SEC }, null, 2) + "\n");
  console.log(`Narration ${durationSec}s written; cues synced.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
