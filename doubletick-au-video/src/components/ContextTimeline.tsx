import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts, mix, prog } from "../styles/tokens";
import { DoubleTickMark } from "./DoubleTickLogo";
import { IconCheck, IconHistory, IconIntent, IconUser, IconVoice, IconWhatsApp } from "./Icons";
import { StatusChip } from "./StatusChip";

const rows = [
  { k: "AI VOICE", v: "Connected", icon: IconVoice },
  { k: "WHATSAPP", v: "Active", icon: IconWhatsApp },
  { k: "CUSTOMER INTENT", v: "High", icon: IconIntent },
  { k: "ASSIGNED RM", v: "Priya Mehta", icon: IconUser },
  { k: "HISTORY", v: "Preserved", icon: IconHistory },
];

/** Simplified unified conversation timeline — centralized visibility, not a dashboard. */
export const ContextTimeline: React.FC<{ at: number; width: number }> = ({ at, width }) => {
  const frame = useCurrentFrame();
  const ROW = 92;
  const lineP = prog(frame, at + 0.1, 1.0);
  return (
    <div style={{ width, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 18,
          marginBottom: 12,
          borderBottom: `1px solid ${colors.border}`,
          opacity: prog(frame, at, 0.35),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DoubleTickMark size={22} />
          <span style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 15, letterSpacing: "0.1em", color: colors.inkSoft }}>
            ARJUN MEHTA · TIMELINE
          </span>
        </div>
        <StatusChip label="LIVE" tone="green" size={13} />
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 25,
            top: 26,
            width: 2,
            height: (rows.length - 1) * ROW * lineP,
            background: `linear-gradient(${colors.green}, ${colors.green})`,
            borderRadius: 2,
          }}
        />
        {rows.map((r, i) => {
          const p = prog(frame, at + 0.12 + i * 0.16, 0.45);
          const Icon = r.icon;
          const last = i === rows.length - 1;
          return (
            <div
              key={r.k}
              style={{
                height: ROW,
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: p,
                transform: `translateY(${mix(16, 0, p)}px)`,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: last ? colors.greenDeep : colors.surface,
                  border: `1px solid ${last ? colors.greenDeep : colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 4px 10px -6px rgba(30,35,32,0.25)",
                }}
              >
                <Icon size={24} color={last ? "#fff" : colors.greenDeep} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: "0.1em", color: colors.inkMuted }}>{r.k}</span>
                <span style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 24, color: colors.ink, letterSpacing: "-0.01em" }}>
                  {r.v}
                </span>
              </div>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  background: colors.greenTint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${prog(frame, at + 0.35 + i * 0.16, 0.35)})`,
                }}
              >
                <IconCheck size={17} color={colors.greenDeep} stroke={3} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
