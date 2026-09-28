import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, easeIn, fonts, mix, prog, radius, s, shadow } from "../styles/tokens";
import { T } from "../timing";
import { Avatar } from "./Avatar";
import { IconUser, IconVoice, IconWhatsApp } from "./Icons";
import { LEAD_H, LEAD_W, LeadCard } from "./LeadCard";
import { ChipTone } from "./StatusChip";

const CX = 540;
const CY = 705;

type Lead = { product: string; status: string; tone: ChipTone; meta: string; x: number; y: number; from: [number, number]; rot: number; slot: number };

const LEADS: Lead[] = [
  { product: "BUSINESS LOAN", status: "HOT LEAD", tone: "amber", meta: "2m ago", x: 250, y: -178, from: [900, -500], rot: 1.5, slot: 0 },
  { product: "PERSONAL LOAN", status: "FOLLOW-UP DUE", tone: "neutral", meta: "1d", x: -272, y: -168, from: [-900, -420], rot: -2, slot: 0 },
  { product: "LOAN APPLICATION", status: "NO RESPONSE", tone: "neutral", meta: "3d", x: -300, y: 62, from: [-1000, 80], rot: 1.2, slot: 1 },
  { product: "NEW ENQUIRY", status: "WAITING", tone: "neutral", meta: "5h", x: 316, y: 72, from: [1000, 120], rot: -1.4, slot: 1 },
  { product: "HOME LOAN", status: "CALLBACK DUE", tone: "neutral", meta: "2d", x: -200, y: 238, from: [-700, 700], rot: -1, slot: 2 },
  { product: "CREDIT CARD", status: "NO RESPONSE", tone: "neutral", meta: "4d", x: 214, y: 246, from: [800, 700], rot: 2, slot: 2 },
];

export const SLOTS = [
  { label: "AI VOICE", icon: IconVoice, y: CY - 170 },
  { label: "WHATSAPP", icon: IconWhatsApp, y: CY },
  { label: "RIGHT RM", icon: IconUser, y: CY + 170 },
];
const PILL_W = 330;
const PILL_H = 88;

const Pill: React.FC<{ i: number }> = ({ i }) => {
  const Icon = SLOTS[i].icon;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 22px", height: "100%" }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: i === 2 ? colors.greenDeep : colors.greenTint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={26} color={i === 2 ? "#fff" : colors.greenDeep} stroke={2.3} />
      </div>
      <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", color: colors.ink }}>
        {SLOTS[i].label}
      </span>
    </div>
  );
};

/** Lead cards accumulate around RM Rahul, one goes cold, then all re-organise into a clean workflow column. */
export const LeadStack: React.FC = () => {
  const frame = useCurrentFrame();
  const freezeF = s(T.betterWay);
  const driftF = Math.min(frame, freezeF);
  const focus = prog(frame, T.hotLeadsDontWait + 0.35, 0.6);
  const organise = (i: number) => prog(frame, T.betterWay + 0.02 + i * 0.03, 0.55);
  const handoff = prog(frame, 5.7, 0.4);
  const handMove = prog(frame, 5.62, 0.6, easeIn);
  const HAND = [
    { dx: -256, dy: 37, sc: 1.2 },
    { dx: 276, dy: -5, sc: 1.2 },
    { dx: 0, dy: 70, sc: 0.9 },
  ];

  // RM card follow-up counter
  const count = frame < s(1.25) ? 47 : frame < s(T.lakhs) ? 52 : 61;
  const bump = Math.max(
    0,
    1 - Math.abs(frame - s(1.25)) / 6,
    1 - Math.abs(frame - s(T.lakhs)) / 6,
  );
  const load = frame < s(1.25) ? 0.64 : frame < s(T.lakhs) ? 0.8 : 1;
  const loadP = interpolateLoad(frame);

  // hot card state
  const hotState = frame >= s(T.goCold) ? 2 : frame >= s(T.whileHot) ? 1 : 0;
  const stateP =
    hotState === 2 ? prog(frame, T.goCold, 0.35) : hotState === 1 ? prog(frame, T.whileHot, 0.35) : 1;
  const coldness = prog(frame, T.goCold, 0.8);

  const rmOrganise = organise(6);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* queue lines toward RM */}
      <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
        {LEADS.map((l, i) => {
          const land = prog(frame, 0.25 + i * 0.27 + 0.3, 0.4);
          const fade = 1 - organise(i);
          return (
            <line
              key={i}
              x1={CX + l.x * 0.92}
              y1={CY + l.y * 0.92}
              x2={CX}
              y2={CY}
              stroke={colors.borderStrong}
              strokeWidth={1.5}
              strokeDasharray="3 7"
              strokeDashoffset={-driftF * 0.6}
              opacity={land * fade * (1 - focus * 0.5)}
            />
          );
        })}
      </svg>

      {/* workflow line (organised state) */}
      {(() => {
        const draw = prog(frame, T.betterWay + 0.35, 0.45);
        const out = handoff;
        const len = SLOTS[2].y - SLOTS[0].y;
        return (
          <svg width={1080} height={1080} style={{ position: "absolute", inset: 0, opacity: draw > 0 ? 1 - out : 0 }}>
            <line x1={CX} y1={SLOTS[0].y} x2={CX} y2={SLOTS[0].y + len * draw} stroke={colors.green} strokeWidth={3} strokeLinecap="round" />
            <line
              x1={CX}
              y1={SLOTS[0].y}
              x2={CX}
              y2={SLOTS[2].y}
              stroke="#fff"
              strokeWidth={3}
              strokeDasharray="2 14"
              strokeDashoffset={-frame * 2}
              opacity={draw >= 1 ? 0.9 : 0}
            />
          </svg>
        );
      })()}

      {/* RM card */}
      {(() => {
        const inP = prog(frame, 0.05, 0.55);
        const m = rmOrganise;
        const slot = SLOTS[2];
        const x = mix(CX, CX, m);
        const y = mix(CY, slot.y, m) + HAND[2].dy * handMove;
        const w = mix(320, PILL_W, m);
        const h = mix(168, PILL_H, m);
        const blurDepth = focus * (1 - m) * 2.5;
        const opacity = inP * mix(1 - focus * 0.35, 1, m) * (1 - handoff);
        return (
          <div
            style={{
              position: "absolute",
              left: x - w / 2,
              top: y - h / 2 + mix(30, 0, inP),
              width: w,
              height: h,
              borderRadius: mix(radius.lg, 22, m),
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: shadow.lifted,
              opacity,
              filter: blurDepth > 0.05 ? `blur(${blurDepth}px)` : undefined,
              transform: `scale(${(1 + bump * 0.04) * mix(1 - focus * 0.04, 1, m)})`,
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            <div style={{ position: "absolute", inset: 0, padding: "22px 24px", opacity: 1 - m, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar initials="R" size={50} bg="#2F4A6B" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 26, color: colors.ink, letterSpacing: "-0.01em" }}>
                    RAHUL
                  </span>
                  <span style={{ fontFamily: fonts.sans, fontSize: 17, color: colors.inkMuted }}>Relationship Manager</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 8, background: colors.bgDeep, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${loadP * 100}%`,
                      height: "100%",
                      borderRadius: 8,
                      background: load >= 1 ? colors.amber : "#D9A66E",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: "0.06em",
                    color: "#8A4A12",
                    background: colors.amberTint,
                    borderRadius: 99,
                    padding: "6px 10px",
                    transform: `scale(${1 + bump * 0.12})`,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count} FOLLOW-UPS
                </span>
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: m }}>
              <Pill i={2} />
            </div>
          </div>
        );
      })()}

      {/* lead cards */}
      {LEADS.map((l, i) => {
        const t0 = 0.25 + i * 0.27;
        const inP = prog(frame, t0, 0.55);
        const vel = inP > 0 && inP < 1 ? (1 - inP) : 0;
        const isHot = i === 0;
        const floatX = Math.sin(driftF / 22 + i * 1.3) * 5;
        const floatY = Math.cos(driftF / 26 + i * 0.7) * 6;
        const m = organise(i);
        const slot = SLOTS[l.slot];
        const primary = i === 0 || i === 2 || i === 4;
        // position
        let x = CX + l.x + mix(l.from[0], 0, inP) + floatX;
        let y = CY + l.y + mix(l.from[1], 0, inP) + floatY;
        let scale = 1;
        let blur = vel * 6;
        let opacity = Math.min(1, inP * 1.6);
        if (isHot) {
          x += mix(0, -46, focus);
          y += mix(0, 30, focus);
          scale *= mix(1, 1.12, focus);
        } else {
          scale *= mix(1, 0.93, focus);
          blur += focus * 3.2;
          opacity *= mix(1, 0.55, focus);
        }
        // organise into workflow column
        x = mix(x, CX, m) + HAND[l.slot].dx * handMove;
        y = mix(y, slot.y, m) + HAND[l.slot].dy * handMove;
        scale = mix(scale, 1, m) * mix(1, HAND[l.slot].sc, handMove);
        blur += handMove * 4;
        blur = mix(blur, 0, m);
        opacity = mix(opacity, primary ? 1 : 0, m) * (1 - handoff);
        const w = mix(LEAD_W, PILL_W, m);
        const h = mix(LEAD_H, PILL_H, m);
        const rot = mix(l.rot * (1 - focus * (isHot ? 1 : 0)), 0, m);

        const hotStatus = ["HOT LEAD", "WAITING", "GOING COLD"][hotState];
        const hotTone: ChipTone = ["amber", "neutral", "cold"][hotState] as ChipTone;
        const tint = isHot ? mixColor("#FFFFFF", "#F1F4F6", coldness) : undefined;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              transform: `rotate(${rot}deg) scale(${scale})`,
              filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
              opacity,
              zIndex: isHot ? 5 : 3,
            }}
          >
            <div style={{ position: "absolute", inset: 0, opacity: 1 - m }}>
              <LeadCard
                product={l.product}
                status={isHot ? hotStatus : l.status}
                tone={isHot ? hotTone : l.tone}
                meta={isHot ? ["2m ago", "2d", "6d"][hotState] : l.meta}
                tint={tint}
                highlight={isHot ? focus : 0}
                statusProgress={isHot ? stateP : 1}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                boxShadow: shadow.lifted,
                opacity: m,
                overflow: "hidden",
              }}
            >
              <Pill i={l.slot} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

function interpolateLoad(frame: number) {
  const a = prog(frame, 0.2, 0.8);
  const b = prog(frame, 1.25, 0.4);
  const c = prog(frame, T.lakhs, 0.4);
  return 0.64 * a + 0.16 * b + 0.2 * c;
}

function mixColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}

export { CX as STACK_CX, CY as STACK_CY };
