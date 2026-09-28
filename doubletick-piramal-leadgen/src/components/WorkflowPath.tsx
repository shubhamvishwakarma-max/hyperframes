import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, EASE, EASE_IO, FONT, SHADOW } from "../styles/tokens";
import { IconChat, IconSpark, IconUser, IconWave } from "./Icons";
import { Chip, Mono } from "./ui";

type Rect = { x: number; y: number; w: number; h: number };

const NODES = [
  { label: "AI Voice", sub: "First-level outreach", Icon: IconWave },
  { label: "WhatsApp", sub: "Conversation continues", Icon: IconChat },
  { label: "Intent", sub: "Need detected", Icon: IconSpark },
  { label: "RM", sub: "Right RM, with context", Icon: IconUser },
];

export const VALUE_NODE = (i: number): Rect => ({ x: 56 + i * 256, y: 486, w: 204, h: 172 });
const PILL_NODE = (i: number): Rect => ({ x: 190 + i * 180, y: 840, w: 160, h: 40 });
const CTA_X = [255, 465, 465, 675];
const CTA_NODE = (i: number): Rect => ({ x: CTA_X[i], y: 800, w: 150, h: 42 });

const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});

/** AI Voice → WhatsApp → Intent → RM. Persists from the value beat through the CTA background. */
export const WorkflowPath: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.value) return null;

  const toPill = prog(frame, T.automateRep - 4, 18, EASE_IO);
  const toCta = prog(frame, T.cta, 18, EASE_IO);
  const ctaFade = mix(1, 0.3, toCta);

  // Entrance: nodes slide out from beneath the RM node (where the handoff card lands).
  const enterAt = [T.value + 16, T.value + 13, T.value + 10, T.value + 12];
  const rects = NODES.map((_, i) => {
    const e = prog(frame, enterAt[i], 16, EASE);
    const from = { ...VALUE_NODE(3) };
    let r = lerpRect(from, VALUE_NODE(i), i === 3 ? 1 : e);
    r = lerpRect(r, PILL_NODE(i), toPill);
    r = lerpRect(r, CTA_NODE(i), toCta);
    return r;
  });
  const nodeOpacity = NODES.map((_, i) => {
    const e = prog(frame, i === 3 ? T.value + 12 : enterAt[i], i === 3 ? 8 : 10);
    return e * (i === 2 ? 1 - toCta : 1);
  });

  // ---- States ----
  const inS1 = frame >= T.value + 4 && frame < T.fewer;
  const inS2 = frame >= T.fewer && frame < T.faster;
  const inS3 = frame >= T.faster && frame < T.automateRep - 4;
  const pulseT = prog(frame, T.faster + 3, 26, EASE_IO);
  const pulseX = mix(rects[0].x + rects[0].w, rects[3].x, pulseT);
  const kAuto = frame >= T.automateRep && frame < T.escalate;
  const kEsc = frame >= T.escalate && frame < T.letRMs;
  const kVal = frame >= T.letRMs && frame < T.cta;

  const active = (i: number): number => {
    if (toCta > 0.5) return 0;
    if (inS1) return i === 0 ? 1 : 0;
    if (inS2) return i === 3 ? 1 : 0;
    if (inS3) {
      const cx = rects[i].x + rects[i].w / 2;
      return i === 0 || pulseX >= cx - rects[i].w / 2 ? 1 : 0;
    }
    if (kAuto) return i === 0 ? 1 : 0;
    if (kEsc) return i >= 2 ? 1 : 0;
    if (kVal) return i === 3 ? 1 : 0;
    return 0;
  };
  const dim = (i: number): number => {
    if (inS2 && i === 0) return 0.45;
    if (inS2 && (i === 1 || i === 2)) return 0.75;
    return 1;
  };

  const extrasOut = 1 - prog(frame, T.automateRep - 8, 8);

  // Connectors between consecutive visible nodes
  const order = toCta > 0.5 ? [0, 1, 3] : [0, 1, 2, 3];
  const cy = (r: Rect) => r.y + r.h / 2;

  // Steady cadence dots (s1): AI Voice → WhatsApp at a regular rhythm.
  const cadence: React.ReactNode[] = [];
  if (inS1) {
    for (let k = 0; k < 3; k++) {
      const t = ((frame - T.value + k * 9) % 27) / 27;
      const x = mix(rects[0].x + rects[0].w + 6, rects[1].x - 6, t);
      cadence.push(
        <circle
          key={k}
          cx={x}
          cy={cy(rects[0])}
          r={4}
          fill={C.green}
          opacity={Math.sin(Math.PI * t)}
        />,
      );
    }
  }

  // Qualified-dot (kinetic "high-value"): Intent → RM
  const qd = prog(frame, T.highValue - 4, 16, EASE_IO);
  const qdVis = frame >= T.highValue - 4 && frame < T.cta ? 1 : 0;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: ctaFade }}>
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        {order.slice(0, -1).map((i, idx) => {
          const j = order[idx + 1];
          const a = rects[i];
          const b = rects[j];
          const x1 = a.x + a.w + 8;
          const x2 = b.x - 8;
          const y = cy(a);
          const vis = Math.min(nodeOpacity[i], nodeOpacity[j] || 1) * (j === 2 ? 1 : 1);
          const lit = inS3 ? Math.max(0, Math.min(1, (pulseX - x1) / Math.max(1, x2 - x1))) : 0;
          return (
            <g key={`${i}-${j}`} opacity={vis}>
              <line
                x1={x1}
                x2={x2}
                y1={y}
                y2={y}
                stroke={C.lineStrong}
                strokeWidth={2}
                strokeDasharray="3 5"
              />
              {lit > 0 && (
                <line
                  x1={x1}
                  x2={mix(x1, x2, lit)}
                  y1={y}
                  y2={y}
                  stroke={C.green}
                  strokeWidth={2.5}
                />
              )}
              <path
                d={`M${x2 - 7},${y - 5} L${x2},${y} L${x2 - 7},${y + 5}`}
                fill="none"
                stroke={C.faint}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
        {cadence}
        {inS3 && pulseT > 0 && pulseT < 1 && (
          <g>
            <circle cx={pulseX} cy={cy(rects[0])} r={16} fill={C.greenBright} opacity={0.18} />
            <circle cx={pulseX} cy={cy(rects[0])} r={6} fill={C.green} />
          </g>
        )}
        {qdVis > 0 && qd < 1 && (
          <g>
            <circle
              cx={mix(rects[2].x + rects[2].w, rects[3].x, qd)}
              cy={cy(rects[2])}
              r={12}
              fill={C.greenBright}
              opacity={0.2}
            />
            <circle
              cx={mix(rects[2].x + rects[2].w, rects[3].x, qd)}
              cy={cy(rects[2])}
              r={5}
              fill={C.green}
            />
          </g>
        )}
      </svg>

      {NODES.map((n, i) => {
        const r = rects[i];
        const on = active(i);
        const pill = Math.max(toPill, toCta);
        const Icon = n.Icon;
        return (
          <div
            key={n.label}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              boxSizing: "border-box",
              borderRadius: mix(16, 999, pill),
              background: on && pill > 0.5 ? C.green : C.card,
              border: `${on ? 2 : 1}px solid ${on ? C.green : C.line}`,
              boxShadow: on ? SHADOW.lift : SHADOW.card,
              opacity: nodeOpacity[i] * dim(i),
              transform: `scale(${on && pill < 0.5 ? 1.04 : 1})`,
              fontFamily: FONT.sans,
              overflow: "hidden",
            }}
          >
            {/* Full node */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: 1 - Math.min(1, pill * 2.5),
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: on ? C.green : C.greenSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={24} color={on ? "#fff" : C.green} />
              </div>
              <div>
                <Mono size={14} color={C.ink} style={{ fontWeight: 600, display: "block" }}>
                  {n.label}
                </Mono>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: C.muted,
                    marginTop: 5,
                    lineHeight: 1.25,
                  }}
                >
                  {n.sub}
                </div>
              </div>
            </div>
            {/* Pill */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: Math.max(0, pill * 2 - 1),
              }}
            >
              <Icon size={16} color={on ? "#fff" : C.green} />
              <Mono size={12} color={on ? "#fff" : C.ink} style={{ fontWeight: 600 }}>
                {n.label}
              </Mono>
            </div>
          </div>
        );
      })}

      {/* s1: cadence label under AI Voice */}
      <div
        style={{
          position: "absolute",
          left: VALUE_NODE(0).x,
          top: 690,
          width: 460,
          opacity: prog(frame, T.value + 8, 10) * (1 - prog(frame, T.fewer - 4, 8)) * extrasOut,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 8 }).map((_, k) => {
            const lit = Math.floor((frame - T.value) / 5) % 8 >= k;
            return (
              <span
                key={k}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: lit ? C.green : C.line,
                }}
              />
            );
          })}
        </div>
        <Mono size={12} color={C.green}>
          Every lead, on schedule
        </Mono>
      </div>

      {/* s2: manual follow-up counter falls away; RM receives one qualified conversation */}
      {(() => {
        const inP = prog(frame, T.fewer - 2, 8);
        const strike = prog(frame, T.fewer + 6, 8);
        const fall = prog(frame, T.fewer + 15, 14, EASE_IO);
        const q = prog(frame, T.fewer + 20, 16);
        const out = 1 - prog(frame, T.faster + 18, 10);
        const R = VALUE_NODE(3);
        return (
          <>
            <div
              style={{
                position: "absolute",
                left: VALUE_NODE(1).x,
                top: 700,
                opacity: inP * (1 - fall) * extrasOut,
                transform: `translateY(${fall * 36}px) rotate(${fall * -4}deg)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: C.muted,
                    letterSpacing: "-0.03em",
                  }}
                >
                  58
                </span>
                <Mono size={12}>Manual follow-ups</Mono>
                <div
                  style={{
                    position: "absolute",
                    left: -4,
                    right: -4,
                    top: "50%",
                    height: 2,
                    background: C.ink2,
                    transform: `scaleX(${strike})`,
                    transformOrigin: "left",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: R.x - 40,
                top: 684,
                width: R.w + 40,
                opacity: q * out * extrasOut,
                transform: `translateX(${(1 - q) * -60}px)`,
                background: C.card,
                border: `1px solid ${C.greenLine}`,
                borderRadius: 14,
                boxShadow: SHADOW.card,
                padding: "12px 14px",
                boxSizing: "border-box",
                fontFamily: FONT.sans,
              }}
            >
              <Chip label="Qualified" tone="green" size={11} />
              <div style={{ fontSize: 17, fontWeight: 650, color: C.ink, marginTop: 8 }}>
                Rohan Mehta
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.muted, marginTop: 2 }}>
                Needs assistance
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};
