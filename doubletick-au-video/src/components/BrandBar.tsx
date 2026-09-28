import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, easeIn, easeInOut, fonts, mix, prog } from "../styles/tokens";
import { T } from "../timing";
import { AULogo } from "./AULogo";
import { DoubleTickLogo } from "./DoubleTickLogo";

/**
 * Persistent brand layer: DoubleTick top-left throughout (moves centre-stage for the CTA),
 * AU Small Finance Bank top-right during the customer-story sections.
 */
export const BrandBar: React.FC = () => {
  const frame = useCurrentFrame();
  const dtIn = prog(frame, 0, 0.4);
  const toCenter = prog(frame, T.ctaStart - 0.05, 0.8, easeInOut);
  const auIn = prog(frame, T.auLogo, 0.5);
  const auOut = prog(frame, T.auOut, 0.4, easeIn);

  const h = mix(32, 48, toCenter);
  const logoW = h * 1.25 + h * 0.22 + h * 0.82 * 5.05; // mark + gap + wordmark width estimate
  const x = mix(100, 540 - logoW / 2, toCenter);
  const y = mix(52, 204, toCenter);

  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, opacity: dtIn }}>
        <DoubleTickLogo height={h} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 44,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: auIn * (1 - auOut),
          transform: `translateY(${mix(-14, 0, auIn) - auOut * 14}px)`,
        }}
      >
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 14,
            letterSpacing: "0.01em",
            color: colors.inkMuted,
            opacity: prog(frame, T.auLogo + 0.25, 0.4),
          }}
        >
          Customer story
        </span>
        <div style={{ width: 1, height: 30, background: colors.borderStrong }} />
        <div
          style={{
            padding: 3,
            borderRadius: 99,
            background: "#fff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 6px 14px -8px rgba(30,35,32,0.35)",
            transform: `scale(${mix(0.7, 1, auIn)})`,
          }}
        >
          <AULogo size={46} />
        </div>
      </div>
    </>
  );
};
