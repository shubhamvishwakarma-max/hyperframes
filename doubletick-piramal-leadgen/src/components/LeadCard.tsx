import React from "react";
import { mix } from "../lib/anim";
import { C, FONT, SHADOW } from "../styles/tokens";
import { Chip, Mono } from "./ui";
import { IconClock, IconWave } from "./Icons";
import type { TaskCard } from "../lib/beats";

export const LEAD_CARD = { w: 262, h: 72, rowW: 540, rowH: 50 };

/**
 * A follow-up task. `rowP` morphs it from a loose manual task (0) into an AI Voice queue row (1).
 * Geometry is set by the parent; this renders content for both states and crossfades them.
 */
export const LeadCard: React.FC<{
  card: TaskCard;
  rowP: number;
  queued?: number;
  calling?: boolean;
  style?: React.CSSProperties;
}> = ({ card, rowP, queued = 0, calling = false, style }) => {
  const w = mix(LEAD_CARD.w, LEAD_CARD.rowW, rowP);
  const h = mix(LEAD_CARD.h, LEAD_CARD.rowH, rowP);
  const overdue = card.status === "Overdue" || card.status === "No response";
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        background: C.card,
        border: `1px solid ${rowP > 0.5 ? C.line : C.lineStrong}`,
        borderRadius: mix(14, 12, rowP),
        boxShadow: SHADOW.card,
        fontFamily: FONT.sans,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Manual task layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: 1 - Math.min(1, rowP * 2.2),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mono size={11} color={C.ink2}>
            {card.type}
          </Mono>
          <IconClock size={14} color={overdue ? C.amber : C.faint} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em" }}>
            {card.name}
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: overdue ? C.amber : C.muted }}>
            {card.status}
          </span>
        </div>
      </div>
      {/* Queue row layout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 14px 0 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: Math.max(0, rowP * 2 - 1),
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: calling ? C.green : C.greenSoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconWave size={16} color={calling ? "#fff" : C.green} />
        </div>
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: C.ink,
            width: 170,
            letterSpacing: "-0.01em",
          }}
        >
          {card.name}
        </span>
        <Mono size={11} color={C.muted} style={{ flex: 1, whiteSpace: "nowrap" }}>
          {card.type}
        </Mono>
        <div style={{ opacity: queued, transform: `translateX(${(1 - queued) * 8}px)` }}>
          <Chip
            label={calling ? "Calling" : "Queued"}
            tone={calling ? "solid" : "green"}
            size={11}
          />
        </div>
      </div>
    </div>
  );
};
