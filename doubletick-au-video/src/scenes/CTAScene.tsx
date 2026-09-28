import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CTAButton } from "../components/CTAButton";
import { MaskedLine } from "../components/KineticHeadline";
import { colors, fonts, mix, prog } from "../styles/tokens";
import { T } from "../timing";

/** 0:29–0:32 — DoubleTick becomes the sole brand; CTA dominates and holds. */
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = prog(frame, T.ctaStart + 0.5, 0.5);
  const btn = prog(frame, T.ctaStart + 0.55, 0.6);
  const url = prog(frame, T.ctaStart + 0.8, 0.5);
  const cursorIn = prog(frame, 30.35, 0.5);
  const cursorOut = prog(frame, 31.35, 0.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 318, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <MaskedLine text="YOUR HOTTEST LEADS" at={T.ctaStart + 0.12} size={70} align="center" weight={800} />
        <MaskedLine text="SHOULDN'T HAVE TO WAIT." at={T.ctaStart + 0.24} size={70} align="center" weight={800} color={colors.greenDeep} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 498,
          textAlign: "center",
          fontFamily: fonts.sans,
          fontWeight: 500,
          fontSize: 30,
          color: colors.inkSoft,
          opacity: sub,
          transform: `translateY(${mix(12, 0, sub)}px)`,
        }}
      >
        AI Voice + WhatsApp + smart RM routing
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 584,
          display: "flex",
          justifyContent: "center",
          opacity: btn,
          transform: `translateY(${mix(26, 0, btn)}px) scale(${mix(0.9, 1, btn)})`,
        }}
      >
        <CTAButton label="BOOK A DEMO" shimmerAt={30.1} tapAt={30.95} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 716,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: url,
          transform: `translateY(${mix(10, 0, url)}px)`,
        }}
      >
        <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 28, letterSpacing: "0.04em", color: colors.ink }}>doubletick.io</span>
        <span style={{ fontFamily: fonts.sans, fontSize: 22, color: colors.inkMuted }}>Turn more conversations into conversions.</span>
      </div>
      {/* tap micro-interaction */}
      <svg
        width="40"
        height="48"
        viewBox="0 0 40 48"
        style={{
          position: "absolute",
          left: mix(760, 640, cursorIn),
          top: mix(760, 648, cursorIn),
          opacity: cursorIn * (1 - cursorOut),
          transform: `scale(${1 - 0.12 * prog(frame, 30.95, 0.1) * (1 - prog(frame, 31.07, 0.25))})`,
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.25))",
        }}
      >
        <path d="M6 3 L6 37 L14 29 L20 43 L26 40 L20 27 L32 27 Z" fill="#fff" stroke={colors.ink} strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
