import narration from "../data/narration.json";
import { FPS } from "../styles/tokens";
import { SUBTITLE_SEGMENTS, VOICEOVER, norm, tokenize } from "./script";

export type Word = { text: string; start: number; end: number };
type NarrationData = { file?: string; duration: number; offset?: number; words: Word[] };

/** Fallback when narration.json has not been generated yet: ~29s evenly by characters. */
const estimateWords = (): NarrationData => {
  const tokens = tokenize(VOICEOVER);
  const total = 28.4;
  const weights = tokens.map((t) => t.length + 2 + (/[.?,]$/.test(t) ? 6 : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  let t = 0.25;
  const words = tokens.map((text, i) => {
    const d = (weights[i] / sum) * total;
    const w = { text, start: t, end: t + d * 0.8 };
    t += d;
    return w;
  });
  return { duration: t + 0.2, words };
};

const data: NarrationData =
  (narration as NarrationData).words.length > 0 ? (narration as NarrationData) : estimateWords();

export const WORDS: Word[] = data.words;
export const NARRATION_DURATION = data.duration;
export const NARRATION_FILE = data.file ?? "audio/narration.wav";
/** Frame at which narration.wav starts (word times already include this offset). */
export const NARRATION_OFFSET = Math.round((data.offset ?? 0) * FPS);

const NORM_WORDS = WORDS.map((w) => norm(w.text));

/** Find a phrase in the narration; returns start/end in seconds. `after` skips earlier matches. */
export const phrase = (text: string, after = 0): { start: number; end: number; index: number } => {
  const target = tokenize(text).map(norm);
  for (let i = 0; i <= NORM_WORDS.length - target.length; i++) {
    if (WORDS[i].start < after) continue;
    if (target.every((t, j) => NORM_WORDS[i + j] === t)) {
      return { start: WORDS[i].start, end: WORDS[i + target.length - 1].end, index: i };
    }
  }
  throw new Error(`Phrase not found in narration: "${text}"`);
};

const f = (s: number) => Math.round(s * FPS);

// ---- Anchors (seconds) ----------------------------------------------------
const manual = phrase("manual calling");
const followups1 = phrase("while follow-ups");
const collections1 = phrase("collections keep");
const dropoffs1 = phrase("drop-offs and collections");
const piling = phrase("keep piling up");
const piramal = phrase("Piramal Finance");
const aiVoice = phrase("DoubleTick AI Voice");
const automate = phrase("to automate first-level");
const appNode = phrase("loan follow-ups", automate.start);
const dropNode = phrase("application drop-offs");
const partnerNode = phrase("channel partners");
const collNode = phrase("collections", partnerNode.end);
const bringing = phrase("bringing RMs");
const intervention = phrase("human intervention");
const needed = phrase("is needed");
const thatMeans = phrase("That means");
const consistent = phrase("more consistent outreach");
const fewer = phrase("fewer repetitive calls");
const faster = phrase("faster movement");
const automateRep = phrase("Automate the repetitive");
const escalate = phrase("Escalate what matters");
const letRMs = phrase("Let your RMs");
const highValue = phrase("high-value conversations");
const book = phrase("Book your DoubleTick demo today");

/** Total film length: narration + a short CTA hold, kept inside 28–30s where possible. */
export const DURATION = Math.max(f(28), Math.min(f(30.5), f(NARRATION_DURATION + 1.15)));

/** Master timeline, in frames. Every visual beat hangs off the narration. */
export const T = {
  // Hook
  manual: f(manual.start),
  followups1: f(followups1.start),
  collections1: f(collections1.start),
  bandwidth: f(dropoffs1.start - 0.05),
  pilingEnd: f(piling.end),
  // Chaos → orchestration
  pulse: f(Math.min(piling.end + 0.05, piramal.start - 0.75)),
  piramal: f(piramal.start),
  aiVoice: f(aiVoice.start),
  connected: f(automate.start + 0.1),
  // Lifecycle
  across: f(appNode.start - 0.35),
  nodeApp: f(appNode.start),
  nodeDrop: f(dropNode.start),
  nodePartner: f(partnerNode.start),
  nodeColl: f(collNode.start),
  // WhatsApp + handoff
  whatsapp: f(collNode.start + 0.3),
  bringing: f(bringing.start),
  intervention: f(intervention.start),
  needed: f(needed.start),
  neededEnd: f(needed.end),
  // Value
  value: f(consistent.start - 0.3),
  thatMeans: f(thatMeans.start),
  consistent: f(consistent.start),
  fewer: f(fewer.start),
  faster: f(faster.start),
  // Kinetic type
  automateRep: f(automateRep.start - 0.12),
  escalate: f(escalate.start - 0.1),
  letRMs: f(letRMs.start - 0.1),
  highValue: f(highValue.start),
  // CTA
  cta: f(book.start - 0.3),
  book: f(book.start),
  narrationEnd: f(NARRATION_DURATION),
  end: DURATION,
} as const;

export type Timeline = typeof T;

/** Subtitle cues built from the real word alignment. */
export type Cue = { text: string; start: number; end: number };

export const CUES: Cue[] = (() => {
  const cues: Cue[] = [];
  let cursor = 0;
  for (const seg of SUBTITLE_SEGMENTS) {
    const n = tokenize(seg).length;
    const first = WORDS[cursor];
    const last = WORDS[Math.min(WORDS.length - 1, cursor + n - 1)];
    cues.push({ text: seg, start: first.start, end: last.end });
    cursor += n;
  }
  // Hold each cue until the next one starts (short gaps), so text never flickers off mid-thought.
  return cues.map((c, i) => {
    const next = cues[i + 1];
    const end = next ? (next.start - c.end < 0.7 ? next.start : c.end + 0.35) : c.end + 0.6;
    return { text: c.text, start: f(c.start - 0.06), end: f(end) };
  });
})();

/** Frames where the narrator is speaking (for music ducking). */
export const isSpeaking = (frame: number) => {
  const s = frame / FPS;
  return WORDS.some((w) => s >= w.start - 0.12 && s <= w.end + 0.25);
};
