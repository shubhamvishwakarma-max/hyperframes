import React from "react";
import { useCurrentFrame } from "remotion";
import { fonts, mix, prog } from "../styles/tokens";
import { VO_OFFSET } from "../timing";

/**
 * Voiceover captions. Phrase times are narration-relative (seconds), taken from the measured
 * pause boundaries of public/audio/narration.mp3 before VO_OFFSET is applied.
 */
const CUES: Array<[number, number, string]> = [
  [0.0, 2.06, "Still relying on RMs to manually chase"],
  [2.1, 2.95, "lakhs of leads —"],
  [3.08, 4.75, "while hot opportunities go cold?"],
  [4.98, 6.62, "AU Small Finance Bank uses"],
  [6.74, 8.47, "DoubleTick AI Voice and WhatsApp"],
  [8.78, 10.99, "to re-engage dormant and rejected leads at scale."],
  [11.4, 13.35, "DoubleTick maps conversations to the right RM,"],
  [13.49, 14.71, "preserves context when ownership changes,"],
  [14.79, 16.1, "and gives teams centralized visibility"],
  [16.2, 17.79, "across customer conversations."],
  [18.04, 18.46, "The impact?"],
  [18.72, 20.46, "Over 3,12,945"],
  [20.59, 22.43, "outbound AI calls placed, with thirty percent"],
  [22.66, 24.8, "RM Broadcast-to-CC closure."],
  [24.99, 25.6, "Automate outreach."],
  [25.8, 26.52, "Preserve context."],
  [26.63, 29.05, "Let your RMs focus on conversations that convert."],
  [29.46, 31.53, "Book your DoubleTick demo today."],
];

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30 - VO_OFFSET;
  const idx = CUES.findIndex(([a, b], i) => {
    const next = CUES[i + 1]?.[0] ?? b + 0.6;
    const hold = Math.min(next, b + 0.45);
    return t >= a - 0.04 && t < hold;
  });
  if (idx < 0) return null;
  const [a, , text] = CUES[idx];
  const p = prog(frame, a + VO_OFFSET - 0.04, 0.18);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 34,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: "11px 22px 12px",
          borderRadius: 14,
          background: "rgba(30, 35, 32, 0.86)",
          color: "#FFFFFF",
          fontFamily: fonts.sans,
          fontWeight: 500,
          fontSize: 31,
          lineHeight: 1.25,
          letterSpacing: "-0.005em",
          textAlign: "center",
          boxShadow: "0 10px 24px -14px rgba(30,35,32,0.6)",
          opacity: mix(0.4, 1, p),
          transform: `translateY(${mix(6, 0, p)}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {text.split(/(DoubleTick|AI Voice|WhatsApp|3,12,945|thirty percent)/).map((part, i) =>
          /^(DoubleTick|AI Voice|WhatsApp|3,12,945|thirty percent)$/.test(part) ? (
            <span key={i} style={{ color: "#7BE3B2" }}>
              {part}
            </span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          ),
        )}
      </div>
    </div>
  );
};

