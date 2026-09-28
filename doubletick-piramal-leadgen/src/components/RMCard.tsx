import React from "react";
import { mix, prog } from "../lib/anim";
import { C, EASE_BACK, FONT } from "../styles/tokens";
import { IconCheck } from "./Icons";
import { Avatar, Chip, Mono } from "./ui";

/** Assigned relationship manager — enters only when a human is needed. */
export const RMCard: React.FC<{ frame: number; enter: number; assigned: number }> = ({
  frame,
  enter,
  assigned,
}) => {
  const p = prog(frame, enter, 14);
  const a = prog(frame, assigned, 10, EASE_BACK);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 14,
        background: mix(0, 1, a) > 0.5 ? C.greenSoft : "#FAF8F3",
        border: `1px solid ${a > 0.5 ? C.greenLine : C.line}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        fontFamily: FONT.sans,
      }}
    >
      <Avatar initials="PS" size={48} bg={C.green} fg="#fff" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-0.02em", color: C.ink }}>
          Priya Sharma
        </div>
        <Mono size={11} color={C.ink2} style={{ display: "block", marginTop: 4 }}>
          Relationship Manager
        </Mono>
      </div>
      <div style={{ opacity: a, transform: `scale(${mix(0.7, 1, a)})` }}>
        <Chip label="Assigned" tone="solid" size={12} icon={<IconCheck size={13} color="#fff" />} />
      </div>
    </div>
  );
};
