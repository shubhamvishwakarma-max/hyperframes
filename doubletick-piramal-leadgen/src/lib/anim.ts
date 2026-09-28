import { interpolate } from "remotion";
import { EASE, FPS } from "../styles/tokens";

type EasingFn = (t: number) => number;

export const sec = (s: number) => Math.round(s * FPS);

/** 0→1 progress over [start, start+dur] frames, clamped and eased. */
export const prog = (frame: number, start: number, dur: number, easing: EasingFn = EASE) =>
  dur <= 0
    ? frame >= start
      ? 1
      : 0
    : interpolate(frame, [start, start + dur], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing,
      });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Enter progress minus exit progress — handy for elements with a life window. */
export const life = (
  frame: number,
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
  easing: EasingFn = EASE,
) => prog(frame, inStart, inDur, easing) * (1 - prog(frame, outStart, outDur, easing));

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Point on a cubic bezier. */
export const bezierPoint = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number,
): [number, number] => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
};

/** Fake directional motion blur: blur proportional to per-frame velocity (px/frame). */
export const motionBlur = (velocity: number, k = 0.35, max = 10) =>
  Math.min(max, Math.abs(velocity) * k);
