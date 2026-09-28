import React from "react";
import { interpolate } from "remotion";
import timing from "./narration-timing.json";
import { C, FONT } from "./theme";

type Cue = { start: number; end: number; text: string };

/** Caption lines with word-aligned timings (see narration-timing.json → captions). */
const buildCues = (): Cue[] => {
  const raw: Cue[] = timing.captions;
  // Hold each line until the next one starts (bridging short pauses), max 0.6s past its end.
  return raw.map((c, i) => ({
    ...c,
    end: Math.min(raw[i + 1]?.start ?? c.end + 0.6, c.end + 0.6),
  }));
};

const CUES = buildCues();

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cue = CUES.find((c) => t >= c.start - 0.02 && t < c.end);
  if (!cue) return null;
  const o = Math.min(
    interpolate(t, [cue.start - 0.02, cue.start + 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(t, [cue.end - 0.1, cue.end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 900,
          padding: "11px 22px",
          borderRadius: 18,
          background: "rgba(255, 255, 255, 0.84)",
          border: `1px solid ${C.border}`,
          boxShadow: "0 10px 26px -18px rgba(60,50,30,0.45)",
          fontFamily: FONT,
          fontSize: 25,
          lineHeight: 1.3,
          fontWeight: 500,
          color: C.charcoal,
          textAlign: "center",
          opacity: o,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
