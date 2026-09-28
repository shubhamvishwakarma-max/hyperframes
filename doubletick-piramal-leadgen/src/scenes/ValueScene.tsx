import React from "react";
import { T } from "../lib/timing";
import { VALUE } from "../lib/beats";
import { C, LAYOUT } from "../styles/tokens";
import { Eyebrow, KineticHeadline } from "../components/KineticHeadline";

const pos: React.CSSProperties = {
  position: "absolute",
  left: LAYOUT.margin,
  top: LAYOUT.headlineTop + 34,
};

/** Operating model: three statements, one at a time, over the persistent workflow. */
export const ValueScene: React.FC = () => (
  <>
    <Eyebrow
      text="THE OPERATING MODEL"
      enter={T.value + 2}
      exit={T.automateRep - 8}
      style={{ position: "absolute", left: LAYOUT.margin, top: LAYOUT.headlineTop }}
    />
    <KineticHeadline
      lines={["MORE CONSISTENT", [{ text: "OUTREACH.", color: C.green }]]}
      enter={VALUE.s1}
      exit={VALUE.s2 - 6}
      size={60}
      style={pos}
    />
    <KineticHeadline
      lines={["FEWER REPETITIVE", [{ text: "RM CALLS.", color: C.green }]]}
      enter={VALUE.s2}
      exit={VALUE.s3 - 6}
      size={60}
      style={pos}
    />
    <KineticHeadline
      lines={["FASTER CUSTOMER", [{ text: "MOMENTUM.", color: C.green }]]}
      enter={VALUE.s3}
      exit={VALUE.out - 6}
      size={60}
      style={pos}
    />
  </>
);
