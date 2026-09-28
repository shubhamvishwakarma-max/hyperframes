import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Eyebrow, MaskedLine } from "../components/KineticHeadline";
import { LeadStack } from "../components/LeadStack";
import { colors, easeInOut, prog } from "../styles/tokens";
import { T } from "../timing";

/** 0:00–0:06 — the follow-up gap, then the green pulse that organises chaos into a workflow. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const push = 1 + 0.03 * prog(frame, 0, T.betterWay, easeInOut);
  const pulse = prog(frame, T.betterWay, 0.75, easeInOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 62%" }}>
        <div style={{ position: "absolute", left: 64, top: 132 }}>
          <Eyebrow text="The follow-up gap" at={0.05} exitAt={4.6} color="#8A4A12" />
        </div>
        <div style={{ position: "absolute", left: 64, top: 176 }}>
          <MaskedLine text="Lakhs of leads." at={0.12} exitAt={4.62} size={72} />
        </div>
        <div style={{ position: "absolute", left: 64, top: 256 }}>
          <MaskedLine
            text="Not enough RM bandwidth."
            at={0.45}
            exitAt={T.hotLeadsDontWait - 0.05}
            size={62}
            color={colors.inkSoft}
            weight={600}
          />
        </div>
        <div style={{ position: "absolute", left: 64, top: 252 }}>
          <MaskedLine
            text="Hot leads don't wait."
            at={T.hotLeadsDontWait + 0.12}
            exitAt={4.66}
            size={72}
            color={colors.amber}
            stagger={0.08}
          />
        </div>
        <LeadStack />
      </AbsoluteFill>

      {/* DoubleTick green pulse sweeping in from the left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 520,
          left: -560 + pulse * 1800,
          background: `linear-gradient(90deg, rgba(40,179,121,0) 0%, rgba(40,179,121,0.16) 55%, rgba(40,179,121,0.32) 80%, rgba(40,179,121,0) 100%)`,
          opacity: pulse > 0 && pulse < 1 ? 1 : 0,
          mixBlendMode: "multiply",
        }}
      />

      <div style={{ position: "absolute", left: 64, top: 186 }}>
        <MaskedLine text="There's a better way." at={T.betterWay + 0.1} exitAt={5.55} size={70} color={colors.greenDeep} />
      </div>
    </AbsoluteFill>
  );
};
