import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { easeInOut, prog } from "../styles/tokens";
import { T } from "../timing";

/**
 * Reddish "problem state" tint over the hook. It deepens as leads go cold, then the
 * DoubleTick green pulse wipes it away left-to-right.
 */
export const ProblemWash: React.FC = () => {
  const frame = useCurrentFrame();
  const build = 0.55 + 0.45 * prog(frame, T.whileHot, 1.2, easeInOut);
  const wipe = prog(frame, T.betterWay, 0.75, easeInOut);
  if (wipe >= 1) return null;
  const edge = wipe * 130 - 15; // % position of the wipe edge
  const mask = `linear-gradient(90deg, transparent ${edge}%, black ${edge + 22}%)`;
  return (
    <AbsoluteFill style={{ opacity: build, WebkitMaskImage: mask, maskImage: mask, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(214, 92, 70, 0.10)", mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 62%, rgba(214,92,70,0.00) 0%, rgba(200,65,47,0.10) 55%, rgba(160,40,28,0.22) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
