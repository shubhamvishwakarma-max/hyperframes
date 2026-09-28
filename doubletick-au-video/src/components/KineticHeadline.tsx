import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, easeIn, fonts, mix, prog } from "../styles/tokens";

type LineProps = {
  text: string;
  /** Reveal start (seconds). */
  at: number;
  /** Optional exit start (seconds): words mask out upward. */
  exitAt?: number;
  size: number;
  color?: string;
  weight?: number;
  stagger?: number;
  dur?: number;
  tracking?: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
};

/**
 * Masked kinetic line — each word rises out of a clip mask with a touch of motion blur,
 * then (optionally) exits upward through the same mask.
 */
export const MaskedLine: React.FC<LineProps> = ({
  text,
  at,
  exitAt,
  size,
  color = colors.ink,
  weight = 700,
  stagger = 0.06,
  dur = 0.55,
  tracking = "-0.035em",
  align = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `0 ${size * 0.26}px`,
        fontFamily: fonts.sans,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: tracking,
        lineHeight: 1.02,
        color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(frame, at + i * stagger, dur);
        const out = exitAt === undefined ? 0 : prog(frame, exitAt + i * stagger * 0.6, 0.38, easeIn);
        const y = mix(105, 0, p) + mix(0, -105, out);
        const velocity = Math.abs(1 - p) * (p > 0 && p < 1 ? 1 : 0) + (out > 0 && out < 1 ? 1 : 0);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              paddingBottom: size * 0.08,
              marginBottom: -size * 0.08,
              paddingRight: size * 0.02,
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${y}%)`,
                filter: velocity > 0.05 ? `blur(${velocity * 2.4}px)` : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Eyebrow: React.FC<{
  text: string;
  at: number;
  exitAt?: number;
  color?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}> = ({ text, at, exitAt, color = colors.greenDeep, dot = true, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 0.45);
  const out = exitAt === undefined ? 0 : prog(frame, exitAt, 0.3, easeIn);
  const chars = Math.round(text.length * p);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: fonts.mono,
        fontWeight: 500,
        fontSize: 19,
        letterSpacing: "0.14em",
        color,
        opacity: p * (1 - out),
        transform: `translateY(${mix(8, 0, p) - out * 8}px)`,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 9,
            background: colors.green,
            boxShadow: `0 0 0 5px ${colors.greenTint}`,
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
