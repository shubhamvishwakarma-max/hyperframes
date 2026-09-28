import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, FONT } from "../styles/tokens";
import { CTAButton } from "../components/CTAButton";
import { KineticHeadline } from "../components/KineticHeadline";

/** Final frame belongs to DoubleTick. */
export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.cta) return null;
  const sub = prog(frame, T.cta + 18, 14);
  const support = prog(frame, T.book + 24, 14);
  return (
    <>
      <KineticHeadline
        lines={[
          "STOP MANAGING",
          ["EVERY FOLLOW-UP ", { text: "MANUALLY.", color: C.green }].map((s) =>
            typeof s === "string" ? { text: s } : s,
          ),
        ]}
        modes={["rise", "rise"]}
        lineDelays={[8, 13]}
        enter={T.cta}
        size={58}
        align="center"
        style={{ position: "absolute", left: 0, right: 0, top: 262 }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 412,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.45,
          color: C.ink2,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 10}px)`,
        }}
      >
        Let AI handle the repetitive.
        <br />
        Let RMs handle the <span style={{ color: C.green, fontWeight: 650 }}>valuable</span>.
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 540,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CTAButton enter={T.book + 6} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 646,
          textAlign: "center",
          fontFamily: FONT.mono,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.14em",
          color: C.muted,
          opacity: support,
        }}
      >
        AI VOICE + WHATSAPP + RM WORKFLOWS
      </div>
    </>
  );
};
