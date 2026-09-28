import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts, prog } from "../styles/tokens";
import { IconArrowRight } from "./Icons";

/** Dominant pill CTA with a light shimmer sweep and a tap compression at `tapAt`. */
export const CTAButton: React.FC<{ label: string; shimmerAt: number; tapAt: number }> = ({ label, shimmerAt, tapAt }) => {
  const frame = useCurrentFrame();
  const sh = prog(frame, shimmerAt, 0.9);
  const tapDown = prog(frame, tapAt, 0.12);
  const tapUp = prog(frame, tapAt + 0.12, 0.3);
  const press = tapDown * (1 - tapUp);
  const ripple = prog(frame, tapAt + 0.05, 0.7);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 20,
        padding: "0 16px 0 44px",
        height: 96,
        borderRadius: 999,
        background: colors.greenDeep,
        color: "#fff",
        boxShadow: `0 22px 40px -18px rgba(15,107,71,0.7), 0 0 0 ${ripple * 18}px rgba(40,179,121,${0.28 * (1 - ripple)})`,
        transform: `scale(${1 - press * 0.035})`,
        overflow: "hidden",
      }}
    >
      <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 34, letterSpacing: "0.02em" }}>{label}</span>
      <span
        style={{
          width: 66,
          height: 66,
          borderRadius: 66,
          background: colors.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconArrowRight size={32} color="#fff" stroke={2.6} />
      </span>
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 120,
          left: `${-30 + sh * 140}%`,
          background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
          opacity: sh > 0 && sh < 1 ? 1 : 0,
        }}
      />
    </div>
  );
};
