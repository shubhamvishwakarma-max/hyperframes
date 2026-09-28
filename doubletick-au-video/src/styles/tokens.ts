import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1080;
export const DURATION_SECONDS = 32;

export const colors = {
  bg: "#F4EFE6",
  bgDeep: "#ECE4D6",
  surface: "#FFFFFF",
  surfaceMuted: "#FAF7F2",
  border: "#E3DACB",
  borderStrong: "#D5CAB7",
  ink: "#1E2320",
  inkSoft: "#4A504C",
  inkMuted: "#8A8E88",
  green: "#28B379",
  greenDeep: "#0F6B47",
  greenInk: "#0B5A3B",
  greenTint: "#E3F4EA",
  greenGlow: "rgba(40, 179, 121, 0.35)",
  amber: "#C9772C",
  amberTint: "#FBEEDD",
  cold: "#6F8394",
  coldTint: "#E9EEF2",
  waBg: "#EFE7DD",
  waOut: "#D9FDD3",
  waHeader: "#FFFFFF",
  verified: "#1D9BF0",
};

export const fonts = {
  sans: "Geist, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};

export const radius = { sm: 10, md: 14, lg: 18, xl: 24 };

export const shadow = {
  card: "0 1px 0 rgba(30,35,32,0.04), 0 10px 30px -12px rgba(30,35,32,0.18), 0 2px 6px -2px rgba(30,35,32,0.06)",
  lifted:
    "0 1px 0 rgba(30,35,32,0.04), 0 24px 48px -18px rgba(30,35,32,0.28), 0 4px 12px -4px rgba(30,35,32,0.08)",
  soft: "0 6px 18px -10px rgba(30,35,32,0.2)",
};

/** DoubleTick house easing — cubic-bezier(0.22, 1, 0.36, 1). */
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

export const s = (seconds: number) => Math.round(seconds * FPS);

/** 0→1 progress between start and start+dur (seconds), eased. */
export const prog = (frame: number, start: number, dur: number, easing = ease) =>
  interpolate(frame, [s(start), s(start) + Math.max(1, s(dur))], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Visible window helper: fades in at `inAt`, out at `outAt`. */
export const windowOpacity = (frame: number, inAt: number, outAt: number, inDur = 0.35, outDur = 0.35) =>
  prog(frame, inAt, inDur) * (1 - prog(frame, outAt, outDur, easeIn));
