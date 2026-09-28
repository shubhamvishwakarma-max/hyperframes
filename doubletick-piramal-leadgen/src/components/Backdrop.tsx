import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../styles/tokens";

/** Warm canvas + faint modular grid + dot-matrix corner. Motifs stay ≤5% opacity. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.12;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 9; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={c * 18} cy={r * 18} r={1.6} fill={C.ink} />);
    }
  }
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%), radial-gradient(90% 70% at 50% 110%, rgba(214,202,178,0.35) 0%, rgba(214,202,178,0) 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.ink}08 1px, transparent 1px), linear-gradient(90deg, ${C.ink}08 1px, transparent 1px)`,
          backgroundSize: "54px 54px",
          backgroundPosition: `${-drift}px ${-drift * 0.5}px`,
          maskImage: "radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />
      <svg
        width={170}
        height={120}
        style={{
          position: "absolute",
          right: 40,
          bottom: 150,
          opacity: 0.05,
          transform: `translateY(${-drift * 0.4}px)`,
        }}
      >
        {dots}
      </svg>
    </AbsoluteFill>
  );
};
