import React from "react";
import { C, FONT, SHADOW } from "../styles/tokens";

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      boxShadow: SHADOW.card,
      fontFamily: FONT.sans,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 13, color = C.muted, style }) => (
  <span
    style={{
      fontFamily: FONT.mono,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </span>
);

export type ChipTone = "neutral" | "green" | "solid" | "amber" | "dark";

const TONES: Record<ChipTone, { bg: string; fg: string; dot: string; border: string }> = {
  neutral: { bg: "#F4F1EA", fg: C.ink2, dot: C.faint, border: C.line },
  green: { bg: C.greenSoft, fg: C.green, dot: C.greenBright, border: C.greenLine },
  solid: { bg: C.green, fg: "#fff", dot: "#9BE3C0", border: C.green },
  amber: { bg: C.amberSoft, fg: C.amber, dot: C.amber, border: "#F0DDBA" },
  dark: { bg: C.ink, fg: "#fff", dot: C.greenBright, border: C.ink },
};

export const Chip: React.FC<{
  label: string;
  tone?: ChipTone;
  dot?: boolean;
  dotPulse?: number;
  size?: number;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ label, tone = "neutral", dot = true, dotPulse = 0, size = 13, icon, style }) => {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: `${size * 0.45}px ${size * 0.8}px`,
        borderRadius: 999,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        fontFamily: FONT.mono,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      {dot && !icon && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: t.dot,
            boxShadow: dotPulse > 0 ? `0 0 0 ${dotPulse * 5}px ${t.dot}33` : undefined,
          }}
        />
      )}
      {label}
    </span>
  );
};

export const Avatar: React.FC<{
  initials: string;
  size?: number;
  bg?: string;
  fg?: string;
}> = ({ initials, size = 40, bg = "#EDE6D8", fg = C.ink2 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      color: fg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT.sans,
      fontWeight: 650,
      fontSize: size * 0.38,
      letterSpacing: "-0.01em",
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

/** Two stacked layers that crossfade + slide — for state labels that change in place. */
export const Swap: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  p: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ from, to, p, distance = 10, style }) => (
  <div style={{ position: "relative", display: "inline-grid", ...style }}>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: 1 - p,
        transform: `translateY(${-p * distance}px)`,
        filter: p > 0 && p < 1 ? `blur(${p * 3}px)` : undefined,
      }}
    >
      {from}
    </div>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: p,
        transform: `translateY(${(1 - p) * distance}px)`,
        filter: p > 0 && p < 1 ? `blur(${(1 - p) * 3}px)` : undefined,
      }}
    >
      {to}
    </div>
  </div>
);
