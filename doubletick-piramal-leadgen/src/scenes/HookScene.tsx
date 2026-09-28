import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { ORGANIZE } from "../lib/beats";
import { T } from "../lib/timing";
import { C, EASE, EASE_IO, FONT, LAYOUT } from "../styles/tokens";
import { FollowupStack } from "../components/FollowupStack";
import { Eyebrow, KineticHeadline } from "../components/KineticHeadline";

/** 00:00 → Piramal: follow-ups pile up faster than one RM can handle. */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  // "BUT RM BANDWIDTH DOES." is pulled forward with scale + focus blur.
  const pull = prog(frame, T.bandwidth, 16, EASE);
  const microIn = (i: number) => prog(frame, T.manual + i * 5, 12);
  const microOut = prog(frame, T.bandwidth - 6, 8, EASE_IO);

  return (
    <>
      <FollowupStack />
      <Eyebrow
        text="THE OUTREACH BOTTLENECK"
        enter={2}
        exit={ORGANIZE.pulse}
        style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop }}
      />
      <KineticHeadline
        lines={["FOLLOW-UPS", "DON'T STOP."]}
        modes={["mask", "rise"]}
        lineDelays={[0, 9]}
        enter={5}
        exit={T.bandwidth - 6}
        size={62}
        style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop + 34 }}
      />
      {/* Supporting microcopy */}
      <div
        style={{
          position: "absolute",
          right: LAYOUT.margin,
          top: LAYOUT.headlineTop + 44,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
          fontFamily: FONT.mono,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.14em",
          color: C.ink2,
        }}
      >
        {["APPLICATIONS", "PARTNERS", "COLLECTIONS"].map((t, i) => (
          <span
            key={t}
            style={{
              opacity: microIn(i) * (1 - microOut),
              transform: `translateX(${(1 - microIn(i)) * 14}px)`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {t}
            <span style={{ width: 18, height: 1, background: C.faint }} />
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: LAYOUT.margin,
          top: LAYOUT.headlineTop + 34,
          transformOrigin: "left top",
          transform: `scale(${mix(1.14, 1, pull)})`,
          filter: pull < 1 ? `blur(${(1 - pull) * 10}px)` : undefined,
          opacity: Math.min(1, pull * 2),
          zIndex: 70,
        }}
      >
        <KineticHeadline
          lines={["BUT RM BANDWIDTH", [{ text: "DOES." }]]}
          modes={["rise", "rise"]}
          lineDelays={[0, 5]}
          enter={T.bandwidth}
          exit={T.piramal - 8}
          size={62}
        />
      </div>
    </>
  );
};
