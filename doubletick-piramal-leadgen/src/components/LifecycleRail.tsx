import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, EASE, EASE_BACK, EASE_IO, FONT, SHADOW } from "../styles/tokens";
import { activeUseCase } from "./AIVoiceCard";

const NODES = [
  { label: "Application", sub: "Follow-ups" },
  { label: "Drop-off", sub: "Recovery" },
  { label: "Partner", sub: "Channel callbacks" },
  { label: "Collections", sub: "Reminders" },
];
const FROM = [
  { dx: -40, dy: -80, rot: -7 },
  { dx: 24, dy: 70, rot: 5 },
  { dx: -18, dy: -60, rot: 4 },
  { dx: 36, dy: 80, rot: -6 },
];

export const RAIL = { top: 676, w: 222, h: 94, gap: 26 };
const x0 = (1080 - (4 * RAIL.w + 3 * RAIL.gap)) / 2;
export const railNodeX = (i: number) => x0 + i * (RAIL.w + RAIL.gap);

/** Loan-lifecycle rail: floating cards snap into one line; nodes light as the narrator names them. */
export const LifecycleRail: React.FC = () => {
  const frame = useCurrentFrame();
  const start = T.across + 2;
  if (frame < start || frame > T.whatsapp + 24) return null;
  const active = activeUseCase(frame);
  const marks = [T.nodeApp, T.nodeDrop, T.nodePartner, T.nodeColl];
  const cy = RAIL.top + RAIL.h / 2;

  const lineIn = prog(frame, start + 8, 16);
  const exitAll = prog(frame, T.whatsapp, 14, EASE_IO);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg
        width={1080}
        height={1080}
        style={{ position: "absolute", inset: 0, opacity: lineIn * (1 - exitAll) }}
      >
        {[0, 1, 2].map((i) => {
          const x1 = railNodeX(i) + RAIL.w + 4;
          const x2 = railNodeX(i + 1) - 4;
          const lit = active > i ? (i + 1 === active ? prog(frame, marks[i + 1], 8) : 1) : 0;
          return (
            <g key={i}>
              <line
                x1={x1}
                x2={x2}
                y1={cy}
                y2={cy}
                stroke={C.lineStrong}
                strokeWidth={2}
                strokeDasharray="3 4"
              />
              {lit > 0 && (
                <line
                  x1={x1}
                  x2={mix(x1, x2, lit)}
                  y1={cy}
                  y2={cy}
                  stroke={C.green}
                  strokeWidth={2.5}
                />
              )}
            </g>
          );
        })}
      </svg>
      {NODES.map((n, i) => {
        const p = prog(frame, start + i * 3, 20, EASE_BACK);
        const pf = prog(frame, start + i * 3, 14, EASE);
        const f = FROM[i];
        const isActive = i === active;
        const isPast = active > i;
        const act = prog(frame, marks[i], 9);
        const deact = active > i && i + 1 < marks.length ? prog(frame, marks[i + 1], 9) : 0;
        const on = act * (1 - deact);
        const ex = prog(frame, T.whatsapp + i * 2, 12, EASE_IO);
        const scale = mix(0.96, 1, p) * mix(1, 1.06, on) * (isPast ? mix(1, 0.97, deact) : 1);
        const opacity = pf * (isPast ? mix(1, 0.55, deact) : active < i ? 0.9 : 1) * (1 - ex);
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: railNodeX(i) + (1 - p) * f.dx,
              top: RAIL.top + (1 - p) * f.dy + ex * 30,
              width: RAIL.w,
              height: RAIL.h,
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: 14,
              background: on > 0.5 ? C.green : C.card,
              border: `1px solid ${on > 0.5 ? C.green : C.line}`,
              boxShadow: on > 0.5 ? SHADOW.lift : SHADOW.card,
              transform: `rotate(${(1 - p) * f.rot}deg) scale(${scale})`,
              opacity,
              filter: pf < 1 || ex > 0 ? `blur(${(1 - pf) * 6 + ex * 6}px)` : undefined,
              fontFamily: FONT.sans,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: isActive ? 5 : 1,
            }}
          >
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: on > 0.5 ? "#BFE8D3" : C.muted,
              }}
            >
              0{i + 1}
            </span>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 650,
                  letterSpacing: "-0.015em",
                  color: on > 0.5 ? "#fff" : C.ink,
                }}
              >
                {n.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: on > 0.5 ? "#CFEBDD" : C.muted,
                  marginTop: 2,
                }}
              >
                {n.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
