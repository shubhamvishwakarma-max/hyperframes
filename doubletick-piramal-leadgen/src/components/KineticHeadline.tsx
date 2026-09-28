import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { C, EASE, EASE_IO, FONT } from "../styles/tokens";

export type Seg = { text: string; color?: string };
export type HeadlineLine = string | Seg[];
type Mode = "mask" | "rise";

const toSegs = (l: HeadlineLine): Seg[] => (typeof l === "string" ? [{ text: l }] : l);

/**
 * Kinetic headline: per-line masked wipe or word-staggered rise; exits upward through its mask.
 * All frames are absolute (global timeline).
 */
export const KineticHeadline: React.FC<{
  lines: HeadlineLine[];
  enter: number;
  exit?: number;
  modes?: Mode[];
  /** Absolute frame offsets (from `enter`) per line. Defaults to 5-frame steps. */
  lineDelays?: number[];
  size?: number;
  weight?: number;
  color?: string;
  align?: "left" | "center";
  tracking?: string;
  lineHeight?: number;
  wordStagger?: number;
  enterDur?: number;
  exitDur?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  enter,
  exit,
  modes,
  lineDelays,
  size = 58,
  weight = 700,
  color = C.ink,
  align = "left",
  tracking = "-0.035em",
  lineHeight = 1.02,
  wordStagger = 2.5,
  enterDur = 16,
  exitDur = 12,
  style,
}) => {
  const frame = useCurrentFrame();
  if (frame < enter - 1) return null;
  if (exit !== undefined && frame > exit + exitDur + 12) return null;

  let wordIndex = 0;
  return (
    <div
      style={{
        fontFamily: FONT.sans,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        const mode = modes?.[li] ?? "rise";
        const delay = lineDelays?.[li] ?? li * 5;
        const lineStart = enter + delay;
        const segs = toSegs(line);
        const words: { text: string; color?: string }[] = [];
        segs.forEach((s) =>
          s.text
            .split(" ")
            .filter(Boolean)
            .forEach((w) => words.push({ text: w, color: s.color })),
        );

        const maskP = prog(frame, lineStart, enterDur + 4, EASE);
        const lineStyle: React.CSSProperties =
          mode === "mask"
            ? {
                clipPath: `inset(-0.2em ${(1 - maskP) * 100}% -0.2em 0)`,
                transform: `translateX(${(1 - maskP) * -28}px)`,
              }
            : { overflow: "hidden" };

        return (
          <div
            key={li}
            style={{
              ...lineStyle,
              paddingBottom: "0.1em",
              marginBottom: "-0.1em",
              whiteSpace: "nowrap",
              display: "flex",
              justifyContent: align === "center" ? "center" : "flex-start",
              gap: "0.24em",
            }}
          >
            {words.map((w, wi) => {
              const gi = wordIndex++;
              const p = mode === "rise" ? prog(frame, lineStart + wi * wordStagger, enterDur) : 1;
              const e = exit !== undefined ? prog(frame, exit + gi * 1.2, exitDur, EASE_IO) : 0;
              const y = (1 - p) * 105 - e * 105;
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    color: w.color ?? color,
                    transform: `translateY(${y}%)`,
                    opacity: mode === "rise" ? Math.min(1, p * 1.6) * (1 - e * 0.6) : 1 - e * 0.6,
                    filter: e > 0 ? `blur(${e * 6}px)` : undefined,
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Small Geist Mono uppercase label with a leading status dot. */
export const Eyebrow: React.FC<{
  text: string;
  enter: number;
  exit?: number;
  color?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}> = ({ text, enter, exit, color = C.green, dot = true, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, enter, 14);
  const e = exit !== undefined ? prog(frame, exit, 10, EASE_IO) : 0;
  if (p <= 0 || e >= 1) return null;
  const chars = Math.round(text.length * prog(frame, enter + 2, 16));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT.mono,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.14em",
        color,
        opacity: p * (1 - e),
        transform: `translateY(${(1 - p) * 8 - e * 8}px)`,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 2,
            background: color,
            transform: `scale(${p})`,
          }}
        />
      )}
      <span>
        {text.slice(0, chars)}
        <span style={{ opacity: 0 }}>{text.slice(chars)}</span>
      </span>
    </div>
  );
};
