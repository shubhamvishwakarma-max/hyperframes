import React from "react";
import { colors, fonts, radius, shadow } from "../styles/tokens";
import { ChipTone, StatusChip } from "./StatusChip";

export const LEAD_W = 262;
export const LEAD_H = 96;

/** Compact lead card: product eyebrow + status chip + faint meta line. */
export const LeadCard: React.FC<{
  product: string;
  status: string;
  tone: ChipTone;
  meta: string;
  tint?: string;
  highlight?: number;
  statusKey?: string;
  statusProgress?: number;
}> = ({ product, status, tone, meta, tint, highlight = 0, statusProgress = 1 }) => (
  <div
    style={{
      width: LEAD_W,
      height: LEAD_H,
      borderRadius: radius.md,
      background: tint ?? colors.surface,
      border: `1px solid ${colors.border}`,
      boxShadow: highlight > 0 ? shadow.lifted : shadow.card,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          fontFamily: fonts.mono,
          fontWeight: 600,
          fontSize: 14.5,
          letterSpacing: "0.01em",
          color: colors.inkSoft,
        }}
      >
        {product}
      </span>
      <span style={{ width: 7, height: 7, borderRadius: 9, background: colors.borderStrong }} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div
        style={{
          transform: `translateY(${(1 - statusProgress) * 10}px)`,
          opacity: statusProgress,
          filter: statusProgress < 1 ? `blur(${(1 - statusProgress) * 3}px)` : undefined,
        }}
      >
        <StatusChip label={status} tone={tone} size={14} />
      </div>
      <span style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted }}>{meta}</span>
    </div>
  </div>
);
