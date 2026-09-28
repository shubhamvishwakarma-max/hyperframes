import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { CARD_TIMES, COUNTER_STEPS, ORGANIZE, TASK_CARDS } from "../lib/beats";
import { T } from "../lib/timing";
import { C, EASE, EASE_BACK, EASE_IO, FONT, SHADOW } from "../styles/tokens";
import { LeadCard } from "./LeadCard";
import { Chip, Mono } from "./ui";
import { IconUser } from "./Icons";

/** Frame at which the queue hands its first row to the AI Voice card. */
export const QUEUE_HANDOFF = T.aiVoice - 4;

export const queueRowY = (slot: number) =>
  ORGANIZE.queueTop + slot * (ORGANIZE.rowH + ORGANIZE.rowGap) + ORGANIZE.rowH / 2;

const RollingNumber: React.FC<{ frame: number; size: number; color: string }> = ({
  frame,
  size,
  color,
}) => {
  let idx = 0;
  COUNTER_STEPS.forEach((s, i) => {
    if (frame >= s.at) idx = i;
  });
  const cur = COUNTER_STEPS[idx];
  const prev = COUNTER_STEPS[Math.max(0, idx - 1)];
  const p = idx === 0 ? 1 : prog(frame, cur.at, 9);
  return (
    <div
      style={{
        position: "relative",
        height: size * 1.02,
        overflow: "hidden",
        minWidth: size * 1.25,
      }}
    >
      {idx > 0 && p < 1 && (
        <div
          style={{
            position: "absolute",
            transform: `translateY(${-p * 100}%)`,
            opacity: 1 - p,
            filter: `blur(${p * 4}px)`,
          }}
        >
          {prev.value}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          transform: `translateY(${(1 - p) * 100}%)`,
          filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
          color,
        }}
      >
        {cur.value}
      </div>
    </div>
  );
};

const RMCardOverloaded: React.FC<{ frame: number }> = ({ frame }) => {
  const enter = prog(frame, 3, 18);
  const exit = prog(frame, ORGANIZE.pulse + 2, 14, EASE_IO);
  const freeze = prog(frame, T.bandwidth, 10);
  let idx = 0;
  COUNTER_STEPS.forEach((s, i) => {
    if (frame >= s.at) idx = i;
  });
  const load = (v: number) => mix(0.34, 1, (v - 18) / 40);
  const barP = idx === 0 ? 1 : prog(frame, COUNTER_STEPS[idx].at, 12);
  const fill = mix(
    load(COUNTER_STEPS[Math.max(0, idx - 1)].value),
    load(COUNTER_STEPS[idx].value),
    barP,
  );
  const hot = fill > 0.8;
  if (exit >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 195,
        top: 640 - 102,
        width: 390,
        height: 204,
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        boxShadow: freeze > 0 ? SHADOW.lift : SHADOW.card,
        padding: "22px 24px",
        boxSizing: "border-box",
        fontFamily: FONT.sans,
        zIndex: 50,
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 24}px) scale(${mix(0.96, 1, enter) * mix(1, 1.035, freeze) * mix(1, 0.9, exit)})`,
        filter: exit > 0 ? `blur(${exit * 6}px)` : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#F1ECE2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconUser size={19} color={C.ink2} />
        </div>
        <Mono size={12} color={C.ink2} style={{ flex: 1 }}>
          Relationship Manager
        </Mono>
        <div style={{ opacity: freeze, transform: `scale(${mix(0.85, 1, freeze)})` }}>
          <Chip label="At capacity" tone="amber" size={11} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 14 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            color: C.ink,
          }}
        >
          <RollingNumber frame={frame} size={64} color={hot ? C.amber : C.ink} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.ink2, letterSpacing: "-0.01em" }}>
          Follow-ups pending
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Mono size={11}>Bandwidth used</Mono>
          <Mono size={11} color={hot ? C.amber : C.ink2}>
            {Math.round(fill * 100)}%
          </Mono>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: "#F1ECE2", overflow: "hidden" }}>
          <div
            style={{
              width: `${fill * 100}%`,
              height: "100%",
              borderRadius: 8,
              background: hot ? C.amber : C.green,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/** Hook: manual follow-ups pile up around an RM, then a green pulse organises them into the AI Voice queue. */
export const FollowupStack: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > QUEUE_HANDOFF + 24) return null;

  const freeze = prog(frame, T.bandwidth, 10) * (1 - prog(frame, ORGANIZE.pulse, 8));
  const pulseX = mix(-120, 1200, prog(frame, ORGANIZE.pulse, ORGANIZE.sweepDur, EASE_IO));
  const pulseVis =
    prog(frame, ORGANIZE.pulse - 2, 4) *
    (1 - prog(frame, ORGANIZE.pulse + ORGANIZE.sweepDur - 4, 6));
  const headerP = prog(frame, ORGANIZE.pulse + 12, 14);
  const collapse = prog(frame, QUEUE_HANDOFF, 14, EASE_IO);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Queue header */}
      {headerP > 0 && (
        <div
          style={{
            position: "absolute",
            left: 540 - ORGANIZE.queueW / 2,
            width: ORGANIZE.queueW,
            top: ORGANIZE.queueTop - 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: headerP * (1 - collapse),
            transform: `translateY(${(1 - headerP) * 10}px)`,
          }}
        >
          <Mono size={14} color={C.ink}>
            AI Voice queue
          </Mono>
          <Chip
            label="Automation activated"
            tone="green"
            size={11}
            dotPulse={Math.abs(Math.sin(frame / 6))}
          />
        </div>
      )}

      {TASK_CARDS.map((card, i) => {
        const t0 = CARD_TIMES[i];
        const appear = prog(frame, t0, 11, EASE_BACK);
        if (appear <= 0) return null;
        const morphStart = ORGANIZE.pulse + Math.round((card.x / 1080) * ORGANIZE.sweepDur);
        const m = prog(frame, morphStart, ORGANIZE.morphDur, EASE);
        const hidden = i >= ORGANIZE.visibleRows;
        const slot = Math.min(i, ORGANIZE.visibleRows - 1);
        const tx = 540;
        const ty = queueRowY(slot);
        const x = mix(card.x, tx, m);
        const y = mix(card.y, ty, m) + (1 - appear) * 26;
        const rot = mix(card.rot, 0, m);
        const bgBlur = freeze * 3;
        const opacity = Math.min(1, appear * 1.4) * mix(1, 0.45, freeze) * (hidden ? 1 - m : 1);
        const queued = prog(frame, ORGANIZE.pulse + 20 + slot * 2, 10);
        // Collapse: row 0 becomes the AI Voice card; the rest slide beneath it.
        if (i === 0 && frame >= QUEUE_HANDOFF) return null;
        const cy = i > 0 ? collapse * (30 + slot * 6) : 0;
        const cOpacity = 1 - collapse;
        return (
          <LeadCard
            key={i}
            card={card}
            rowP={m}
            queued={queued}
            calling={i === 0 && frame >= QUEUE_HANDOFF - 12}
            style={{
              left: x,
              top: y + cy,
              zIndex: hidden ? 1 : 10 - slot,
              opacity: opacity * cOpacity,
              transform: `rotate(${rot}deg) scale(${mix(0.92, 1, appear) * mix(1, 0.98, freeze) * (hidden ? mix(1, 0.94, m) : 1)})`,
              filter: bgBlur + collapse * 5 > 0.05 ? `blur(${bgBlur + collapse * 5}px)` : undefined,
            }}
          />
        );
      })}

      <RMCardOverloaded frame={frame} />

      {/* Green orchestration pulse */}
      {pulseVis > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: pulseX - 90,
            width: 180,
            zIndex: 60,
            opacity: pulseVis,
            pointerEvents: "none",
            background: `linear-gradient(90deg, transparent 0%, ${C.greenBright}10 35%, ${C.greenBright}55 50%, ${C.greenBright}10 65%, transparent 100%)`,
            maskImage:
              "linear-gradient(180deg, transparent 0%, #000 25%, #000 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, #000 25%, #000 80%, transparent 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 89,
              top: 0,
              bottom: 0,
              width: 2,
              background: C.green,
            }}
          />
        </div>
      )}
    </div>
  );
};
