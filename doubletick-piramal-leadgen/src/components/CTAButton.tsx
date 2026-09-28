import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { C, EASE, EASE_IO, FONT } from "../styles/tokens";
import { IconArrow } from "./Icons";

/** "Book a demo" — slides in with a restrained scale, one green light sweep, no pulsing. */
export const CTAButton: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, enter, 16, EASE);
  const sweep = prog(frame, enter + 14, 22, EASE_IO);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        height: 74,
        padding: "0 34px 0 38px",
        borderRadius: 16,
        background: C.green,
        color: "#fff",
        fontFamily: FONT.sans,
        fontSize: 25,
        fontWeight: 650,
        letterSpacing: "0.02em",
        overflow: "hidden",
        boxShadow: "0 18px 40px -14px rgba(1,122,91,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 34}px) scale(${mix(0.94, 1, p)})`,
      }}
    >
      <span style={{ position: "relative", zIndex: 2 }}>BOOK A DEMO</span>
      <span style={{ position: "relative", zIndex: 2, transform: `translateX(${(1 - p) * -8}px)` }}>
        <IconArrow size={22} color="#fff" />
      </span>
      {sweep > 0 && sweep < 1 && (
        <div
          style={{
            position: "absolute",
            top: -20,
            bottom: -20,
            width: 90,
            left: mix(-120, 360, sweep),
            background: "linear-gradient(90deg, transparent, rgba(190,255,225,0.55), transparent)",
            transform: "skewX(-18deg)",
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
};
