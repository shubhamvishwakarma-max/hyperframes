import React from "react";
import { colors, fonts, mix, radius, shadow } from "../styles/tokens";
import { Avatar } from "./Avatar";

/**
 * Assigned-RM card. `morph` 0→1 rolls Rahul Sharma into Priya Mehta inside a clip mask
 * (card morph instead of a cut); the surrounding card stays put so ownership reads as a change of hands.
 */
export const RMCard: React.FC<{ morph: number; width: number; active?: number }> = ({ morph, width, active = 0 }) => {
  const nameRoll = (text: string, dir: 1 | -1, p: number) => (
    <span
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        whiteSpace: "nowrap",
        transform: `translateY(${dir * p * 110}%)`,
        filter: p > 0.02 && p < 0.98 ? `blur(${Math.sin(p * Math.PI) * 3}px)` : undefined,
      }}
    >
      {text}
    </span>
  );
  const bulge = Math.sin(morph * Math.PI);
  return (
    <div
      style={{
        width,
        height: 104,
        boxSizing: "border-box",
        borderRadius: radius.lg,
        background: colors.surface,
        border: `1.5px solid ${active > 0 ? `rgba(40,179,121,${0.25 + 0.5 * active})` : colors.border}`,
        boxShadow: shadow.lifted,
        padding: "0 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transform: `scale(${1 + bulge * 0.025})`,
      }}
    >
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - morph, transform: `scale(${mix(1, 0.6, morph)})` }}>
          <Avatar initials="RS" size={56} bg="#2F4A6B" />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: morph, transform: `scale(${mix(0.6, 1, morph)})` }}>
          <Avatar initials="PM" size={56} bg={colors.greenDeep} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div
          style={{
            position: "relative",
            height: 30,
            overflow: "hidden",
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 25,
            letterSpacing: "-0.01em",
            color: colors.ink,
          }}
        >
          {nameRoll("RAHUL SHARMA", -1, morph)}
          {nameRoll("PRIYA MEHTA", 1, 1 - morph)}
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: "0.1em", color: colors.inkMuted }}>
          ASSIGNED RM
        </span>
      </div>
    </div>
  );
};
