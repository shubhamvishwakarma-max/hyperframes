import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, LAYOUT } from "../styles/tokens";
import { JourneyCard } from "../components/JourneyCard";
import { Eyebrow, KineticHeadline } from "../components/KineticHeadline";
import { LifecycleRail } from "../components/LifecycleRail";

/** Piramal → DoubleTick AI Voice automates the first follow-up, at loan-lifecycle scale. */
export const AIOutreachScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.piramal - 30 || frame > T.value + 30) return null;
  return (
    <>
      <Eyebrow
        text="PIRAMAL FINANCE × DOUBLETICK"
        enter={T.piramal}
        exit={T.value - 6}
        style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop }}
      />
      <KineticHeadline
        lines={[[{ text: "AUTOMATE", color: C.green }], "THE FIRST FOLLOW-UP."]}
        modes={["mask", "rise"]}
        lineDelays={[0, 8]}
        enter={T.piramal + 4}
        exit={T.whatsapp - 4}
        size={60}
        style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop + 34 }}
      />
      {frame >= T.across - 2 && (
        <KineticHeadline
          lines={["AT LOAN-LIFECYCLE SCALE."]}
          modes={["mask"]}
          enter={T.across}
          exit={T.whatsapp - 4}
          size={32}
          weight={650}
          color={C.ink2}
          tracking="-0.02em"
          style={{
            position: "absolute",
            left: LAYOUT.margin,
            top: LAYOUT.headlineTop + 34 + 128,
            opacity: prog(frame, T.across, 8),
          }}
        />
      )}
      <LifecycleRail />
      <JourneyCard />
    </>
  );
};
