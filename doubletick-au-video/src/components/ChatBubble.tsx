import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts, mix, prog } from "../styles/tokens";

/** WhatsApp-style chat bubble with a masked pop-in at `at` (seconds). */
export const ChatBubble: React.FC<{
  text: string;
  at: number;
  outgoing?: boolean;
  time: string;
  glow?: number;
}> = ({ text, at, outgoing = false, time, glow = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 0.4);
  if (p <= 0) return null;
  return (
    <div
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        maxWidth: "84%",
        transformOrigin: outgoing ? "100% 100%" : "0% 100%",
        transform: `translateY(${mix(14, 0, p)}px) scale(${mix(0.9, 1, p)})`,
        opacity: p,
      }}
    >
      <div
        style={{
          position: "relative",
          background: outgoing ? colors.waOut : "#FFFFFF",
          borderRadius: outgoing ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          padding: "10px 12px 8px 13px",
          boxShadow: `0 1px 1px rgba(0,0,0,0.06)${glow > 0 ? `, 0 0 0 ${2 * glow}px rgba(40,179,121,${0.45 * glow})` : ""}`,
          fontFamily: fonts.sans,
          fontSize: 18.5,
          lineHeight: 1.32,
          color: colors.ink,
        }}
      >
        {text}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            marginTop: 3,
            fontSize: 12.5,
            color: "#8C8F8A",
          }}
        >
          {time}
          {outgoing && (
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="#34B7F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 6.5l3 3L10.5 2.5" />
              <path d="M7 9.5l0.5 0.5L16 2.5" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export const TypingIndicator: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const vis = prog(frame, from, 0.2) * (1 - prog(frame, to - 0.1, 0.12));
  if (vis <= 0) return null;
  return (
    <div
      style={{
        alignSelf: "flex-end",
        background: colors.waOut,
        borderRadius: "14px 4px 14px 14px",
        padding: "12px 14px",
        display: "flex",
        gap: 5,
        opacity: vis,
        boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 9,
            background: "#6C8A70",
            opacity: 0.35 + 0.65 * Math.max(0, Math.sin(frame / 3.2 - i * 0.9)),
          }}
        />
      ))}
    </div>
  );
};
