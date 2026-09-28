import React from "react";
import { mix, prog } from "../lib/anim";
import { C, EASE_BACK, FONT } from "../styles/tokens";

const Ticks: React.FC = () => (
  <svg width={18} height={11} viewBox="0 0 18 11" style={{ display: "block" }}>
    <path
      d="M1 6l3 3 6-7.5"
      fill="none"
      stroke={C.wa.tick}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 9l1 0.2 6-7.7"
      fill="none"
      stroke={C.wa.tick}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** WhatsApp bubble; appears with a short pop from its tail corner. */
export const ChatBubble: React.FC<{
  text: string;
  outgoing?: boolean;
  frame: number;
  at: number;
  glow?: number;
}> = ({ text, outgoing = false, frame, at, glow = 0 }) => {
  const p = prog(frame, at, 9, EASE_BACK);
  if (p <= 0) return null;
  return (
    <div
      style={{
        alignSelf: outgoing ? "flex-end" : "flex-start",
        maxWidth: 318,
        padding: "9px 12px 9px 13px",
        borderRadius: 14,
        borderTopLeftRadius: outgoing ? 14 : 4,
        borderTopRightRadius: outgoing ? 4 : 14,
        background: outgoing ? C.wa.outgoing : C.wa.incoming,
        color: C.wa.ink,
        fontFamily: FONT.sans,
        fontSize: 21,
        fontWeight: 450,
        lineHeight: 1.34,
        letterSpacing: "-0.005em",
        boxShadow: `0 1px 1px rgba(11,20,26,0.10)${
          glow > 0
            ? `, 0 0 0 ${mix(0, 5, glow)}px ${C.greenBright}${Math.round(glow * 90)
                .toString(16)
                .padStart(2, "0")}`
            : ""
        }`,
        opacity: Math.min(1, p * 1.5),
        transform: `translateY(${(1 - p) * 10}px) scale(${mix(0.92, 1, p)})`,
        transformOrigin: outgoing ? "top right" : "top left",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <span>{text}</span>
      {outgoing && (
        <span style={{ paddingBottom: 3 }}>
          <Ticks />
        </span>
      )}
    </div>
  );
};

/** Three-dot typing indicator in an incoming bubble. */
export const TypingBubble: React.FC<{ frame: number; from: number; to: number }> = ({
  frame,
  from,
  to,
}) => {
  if (frame < from || frame >= to) return null;
  const p = prog(frame, from, 6);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        padding: "13px 15px",
        borderRadius: 14,
        borderTopLeftRadius: 4,
        background: C.wa.incoming,
        boxShadow: "0 1px 1px rgba(11,20,26,0.10)",
        display: "flex",
        gap: 5,
        opacity: p,
        transform: `scale(${mix(0.9, 1, p)})`,
        transformOrigin: "top left",
      }}
    >
      {[0, 1, 2].map((i) => {
        const t = (frame - from) / 30;
        const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9));
        return (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.wa.sub,
              opacity: a,
              transform: `translateY(${-a * 2}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
