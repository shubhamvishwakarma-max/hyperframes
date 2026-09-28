import React from "react";
import { useCurrentFrame } from "remotion";
import { motionBlur, prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, EASE, EASE_IO, LAYOUT } from "../styles/tokens";
import { KineticHeadline } from "../components/KineticHeadline";
import { PhoneMockup } from "../components/PhoneMockup";

/** The AI call continues on WhatsApp — a Piramal Finance business conversation. */
export const WhatsAppScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.whatsapp - 4 || frame > T.value + 24) return null;
  const enter = prog(frame, T.whatsapp, 18, EASE);
  const exit = prog(frame, T.value, 16, EASE_IO);
  const x = (1 - enter) * -470 + exit * -500;
  const v =
    (prog(frame + 1, T.whatsapp, 18, EASE) - enter) * 470 +
    (prog(frame + 1, T.value, 16, EASE_IO) - exit) * 500;
  const blur = motionBlur(v, 0.25, 8);
  return (
    <>
      <KineticHeadline
        lines={[
          "AUTOMATION FIRST.",
          ["HUMANS ", { text: "WHEN IT MATTERS.", color: C.green }].map((s) =>
            typeof s === "string" ? { text: s } : s,
          ),
        ]}
        modes={["mask", "rise"]}
        lineDelays={[0, Math.max(10, T.bringing - T.whatsapp + 4)]}
        enter={T.whatsapp + 2}
        exit={T.value - 4}
        size={54}
        style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop + 34 }}
      />
      <PhoneMockup
        style={{
          transform: `translateX(${x}px)`,
          opacity: Math.min(1, enter * 1.5) * (1 - exit),
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        }}
      />
    </>
  );
};
