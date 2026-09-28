import { Easing } from "remotion";

export const FPS = 30;
export const SIZE = 1080;

/** DoubleTick campaign palette (warm canvas, charcoal ink, deep green). */
export const C = {
  bg: "#F4F4EC",
  bgDeep: "#EFE8DA",
  ink: "#1B1D1A",
  ink2: "#43453F",
  muted: "#8B877D",
  faint: "#B9B3A6",
  line: "#E6DFD0",
  lineStrong: "#D8D0BE",
  card: "#FFFFFF",
  green: "#017A5B",
  greenBright: "#1FAE7F",
  greenSoft: "#E2F1EA",
  greenLine: "#BFDCCB",
  amber: "#B7791F",
  amberSoft: "#FBF0DC",
  verified: "#1D8CF8",
  wa: {
    chatBg: "#EFE7DC",
    incoming: "#FFFFFF",
    outgoing: "#D9FDD3",
    header: "#FFFFFF",
    tick: "#53BDEB",
    green: "#25D366",
    ink: "#111B21",
    sub: "#667781",
  },
} as const;

export const FONT = {
  sans: "Geist, 'Geist Fallback', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
} as const;

/** Signature ease — cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
/** Symmetric ease for moves that start from rest and land at rest. */
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);
/** Gentle overshoot, used sparingly (snap-into-place moments only). */
export const EASE_BACK = Easing.bezier(0.34, 1.32, 0.64, 1);

export const SHADOW = {
  card: "0 1px 2px rgba(27,29,26,0.04), 0 8px 24px -6px rgba(27,29,26,0.10)",
  lift: "0 2px 4px rgba(27,29,26,0.05), 0 22px 48px -12px rgba(27,29,26,0.20)",
  phone: "0 30px 70px -20px rgba(27,29,26,0.35), 0 4px 10px rgba(27,29,26,0.08)",
} as const;

export const LAYOUT = {
  margin: 56,
  logoLeft: 50,
  logoTop: 42,
  headlineTop: 124,
  subtitleBottom: 52,
} as const;
