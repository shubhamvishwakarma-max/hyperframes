import { CARD_TIMES, CHAT, ORGANIZE, VALUE } from "./beats";
import { T } from "./timing";

export type Cue = { file: string; at: number; gain: number };

/** Sound design cue sheet — every cue sits on an animation beat. Felt more than noticed. */
export const SFX: Cue[] = [
  // Hook
  { file: "low_hit", at: 4, gain: 0.32 },
  ...CARD_TIMES.map((at, i) => ({
    file: i % 3 === 0 ? "tick_b" : "tick",
    at,
    gain: 0.16 + (i / CARD_TIMES.length) * 0.1,
  })),
  { file: "low_hit", at: T.bandwidth, gain: 0.5 },
  // Chaos → orchestration
  { file: "sweep", at: ORGANIZE.pulse - 2, gain: 0.34 },
  { file: "tonal", at: T.piramal + 4, gain: 0.16 },
  // AI Voice
  { file: "activate", at: T.aiVoice - 3, gain: 0.3 },
  { file: "chime", at: T.connected, gain: 0.26 },
  { file: "tonal", at: T.across, gain: 0.14 },
  ...[T.nodeApp, T.nodeDrop, T.nodePartner, T.nodeColl].map((at) => ({
    file: "node",
    at,
    gain: 0.24,
  })),
  // WhatsApp + handoff
  { file: "swoosh_soft", at: T.whatsapp, gain: 0.2 },
  { file: "pop", at: CHAT.msg1, gain: 0.28 },
  { file: "pop", at: CHAT.msg2, gain: 0.26 },
  { file: "pop_out", at: CHAT.reply, gain: 0.28 },
  { file: "ping", at: CHAT.pulse + 13, gain: 0.26 },
  { file: "swoosh", at: CHAT.handoff - 2, gain: 0.3 },
  { file: "activate", at: CHAT.assigned, gain: 0.18 },
  // Value
  { file: "tonal", at: VALUE.s1, gain: 0.16 },
  { file: "tonal", at: VALUE.s2, gain: 0.16 },
  { file: "tick", at: T.fewer + 6, gain: 0.18 },
  { file: "tonal", at: VALUE.s3, gain: 0.16 },
  { file: "sweep_soft", at: T.faster + 2, gain: 0.22 },
  // Kinetic type
  { file: "whoosh_low", at: T.automateRep - 2, gain: 0.26 },
  { file: "whoosh_low", at: T.escalate, gain: 0.24 },
  { file: "whoosh_low", at: T.letRMs, gain: 0.24 },
  { file: "ping", at: T.highValue + 10, gain: 0.16 },
  // CTA
  { file: "swoosh_soft", at: T.cta, gain: 0.2 },
  { file: "cta_impact", at: T.book + 14, gain: 0.4 },
  { file: "shimmer", at: T.book + 20, gain: 0.22 },
];
