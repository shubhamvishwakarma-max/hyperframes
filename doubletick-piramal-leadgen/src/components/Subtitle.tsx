import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { SUBTITLE_HIGHLIGHTS } from "../lib/script";
import { CUES } from "../lib/timing";
import { C, EASE_IO, FONT, LAYOUT } from "../styles/tokens";

/** Split text into plain / highlighted runs (AI Voice, WhatsApp, RMs, high-value). */
const runs = (text: string) => {
  const pattern = new RegExp(
    `(${SUBTITLE_HIGHLIGHTS.map((h) => h.replace(/[-]/g, "\\-")).join("|")})`,
    "g",
  );
  return text
    .split(pattern)
    .filter(Boolean)
    .map((t) => ({ t, hi: SUBTITLE_HIGHLIGHTS.includes(t) }));
};

/** Phrase-level subtitles, bottom-centre capsule, 4-frame (~130ms) fades, synced to the narration. */
export const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = CUES.find((c) => frame >= c.start && frame < c.end + 4);
  if (!cue) return null;
  const inP = prog(frame, cue.start, 4, EASE_IO);
  const outP = prog(frame, cue.end, 4, EASE_IO);
  const o = inP * (1 - outP);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: LAYOUT.subtitleBottom,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 200,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          padding: "10px 18px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.9)",
          border: `1px solid ${C.line}`,
          boxShadow: "0 6px 20px -8px rgba(27,29,26,0.18)",
          fontFamily: FONT.sans,
          fontSize: 22,
          fontWeight: 500,
          lineHeight: 1.36,
          letterSpacing: "-0.005em",
          color: C.ink,
          textAlign: "center",
          opacity: o,
          transform: `translateY(${(1 - inP) * 4}px)`,
        }}
      >
        {runs(cue.text).map((r, i) =>
          r.hi ? (
            <span key={i} style={{ color: C.green, fontWeight: 650 }}>
              {r.t}
            </span>
          ) : (
            <span key={i}>{r.t}</span>
          ),
        )}
      </div>
    </div>
  );
};
