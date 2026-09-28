import React from "react";
import { useCurrentFrame } from "remotion";
import { bezierPoint, mix, prog } from "../lib/anim";
import { CHAT } from "../lib/beats";
import { C, EASE_IO } from "../styles/tokens";
import { CONTEXT_CARD, INTENT_ROW_Y } from "../components/IntentCard";
import { REPLY_ANCHOR } from "../components/PhoneMockup";

/**
 * The customer's reply emits a green data pulse that travels a curved path into DoubleTick,
 * where the context card registers the intent and hands off to the RM.
 */
export const RMHandoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < CHAT.pulse - 4 || frame > CHAT.handoff + 30) return null;

  const p0: [number, number] = REPLY_ANCHOR;
  const p3: [number, number] = [CONTEXT_CARD.x + 6, INTENT_ROW_Y];
  const p1: [number, number] = [p0[0] + 40, p0[1] + 90];
  const p2: [number, number] = [p3[0] - 70, p3[1] + 80];
  const d = `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;

  const draw = prog(frame, CHAT.pulse - 3, 12, EASE_IO);
  const travel = prog(frame, CHAT.pulse, 15, EASE_IO);
  const fade = 1 - prog(frame, CHAT.handoff + 8, 14);
  const arrive = prog(frame, CHAT.pulse + 14, 10);
  const [x, y] = bezierPoint(p0, p1, p2, p3, travel);
  const trail = [0.06, 0.12, 0.18].map((dt) =>
    bezierPoint(p0, p1, p2, p3, Math.max(0, travel - dt)),
  );

  return (
    <svg
      width={1080}
      height={1080}
      style={{ position: "absolute", inset: 0, zIndex: 40, opacity: fade, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="pulseGlow">
          <stop offset="0%" stopColor={C.greenBright} stopOpacity={0.55} />
          <stop offset="100%" stopColor={C.greenBright} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={C.green}
        strokeOpacity={0.35}
        strokeWidth={2}
        strokeDasharray="3 6"
        pathLength={1}
        style={{ strokeDashoffset: 0 }}
      />
      <path
        d={d}
        fill="none"
        stroke={C.green}
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${draw} 1`}
        opacity={0.8 * (1 - arrive * 0.6)}
      />
      {travel > 0 && travel < 1 && (
        <>
          {trail.map(([tx, ty], i) => (
            <circle
              key={i}
              cx={tx}
              cy={ty}
              r={6 - i * 1.5}
              fill={C.greenBright}
              opacity={0.35 - i * 0.1}
            />
          ))}
          <circle cx={x} cy={y} r={26} fill="url(#pulseGlow)" />
          <circle cx={x} cy={y} r={7} fill={C.green} stroke="#fff" strokeWidth={2} />
        </>
      )}
      {arrive > 0 && arrive < 1 && (
        <circle
          cx={p3[0]}
          cy={p3[1]}
          r={mix(6, 38, arrive)}
          fill="none"
          stroke={C.greenBright}
          strokeWidth={2}
          opacity={1 - arrive}
        />
      )}
    </svg>
  );
};
