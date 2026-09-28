import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../styles/tokens";

/** Warm beige canvas, faint product grid (~3%), and two soft drifting beige shapes. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame / 30;
  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          left: -260 + Math.sin(drift * 0.25) * 30,
          top: -380 + Math.cos(drift * 0.2) * 20,
          background: `radial-gradient(circle at 50% 50%, ${colors.bgDeep} 0%, rgba(236,228,214,0) 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          right: -420 + Math.cos(drift * 0.18) * 30,
          bottom: -520 + Math.sin(drift * 0.22) * 24,
          background: `radial-gradient(circle at 50% 50%, rgba(40,179,121,0.07) 0%, rgba(40,179,121,0) 65%)`,
        }}
      />
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
        <defs>
          <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse">
            <path d="M54 0H0V54" fill="none" stroke={colors.ink} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1080" fill="url(#grid)" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(94,78,52,0.08) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
