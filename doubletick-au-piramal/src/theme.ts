import timing from "./narration-timing.json";

export const FPS = 30;
export const W = 1080;
export const H = 1080;
export const CTA_HOLD_SEC = 2.2;

export const C = {
  beige: "#F3F0E8",
  beigeDeep: "#EAE5D9",
  ink: "#171917",
  charcoal: "#252724",
  green: "#174D3B",
  accent: "#247354",
  logoGreen: "#2BB477",
  soft: "#DDE9E1",
  card: "#FFFFFF",
  border: "#DEDAD0",
  muted: "#6C6D67",
  warn: "#B8651B",
  warnSoft: "#F6E7D6",
  cold: "#5B6F86",
  coldSoft: "#E3E9EF",
  waHeader: "#174D3B",
  waBg: "#EFEADF",
  waOut: "#DCEFD9",
};

export const FONT = "Geist, system-ui, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, monospace";

export type CueName = keyof typeof timing.cues;
export const cues = timing.cues;
export const narrationSec = timing.durationSec;
export const totalSec = narrationSec + CTA_HOLD_SEC;

// Section boundaries derived from the narration
export const SECTIONS = {
  hook: [0, cues.au - 0.3],
  au: [cues.au - 0.3, cues.piramal - 0.3],
  piramal: [cues.piramal - 0.3, cues.solution - 0.25],
  solution: [cues.solution - 0.25, cues.cta - 0.25],
  cta: [cues.cta - 0.25, totalSec],
} as const;

export const sec = (s: number) => Math.round(s * FPS);
