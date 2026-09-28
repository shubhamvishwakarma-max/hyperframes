import React from "react";
import { colors, fonts } from "../styles/tokens";

export type ChipTone = "green" | "amber" | "cold" | "neutral" | "solid";

const tones: Record<ChipTone, { bg: string; fg: string; dot: string; border: string }> = {
  green: { bg: colors.greenTint, fg: colors.greenInk, dot: colors.green, border: "rgba(40,179,121,0.25)" },
  amber: { bg: colors.amberTint, fg: "#8A4A12", dot: colors.amber, border: "rgba(201,119,44,0.25)" },
  cold: { bg: colors.coldTint, fg: "#40525F", dot: colors.cold, border: "rgba(111,131,148,0.25)" },
  neutral: { bg: colors.surfaceMuted, fg: colors.inkSoft, dot: colors.inkMuted, border: colors.border },
  solid: { bg: colors.greenDeep, fg: "#FFFFFF", dot: "#7BE3B2", border: colors.greenDeep },
};

export const StatusChip: React.FC<{
  label: string;
  tone?: ChipTone;
  size?: number;
  pulse?: number;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ label, tone = "green", size = 15, pulse = 0, icon, style }) => {
  const t = tones[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.5,
        padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: 999,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
        fontFamily: fonts.mono,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon ?? (
        <span
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: 99,
            background: t.dot,
            boxShadow: pulse > 0 ? `0 0 0 ${pulse * size * 0.45}px ${t.dot}33` : undefined,
          }}
        />
      )}
      {label}
    </div>
  );
};
