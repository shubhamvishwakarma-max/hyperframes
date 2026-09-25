import React from "react";
import { interpolate } from "remotion";
import { C, FONT, MONO, SECTIONS } from "../theme";
import { Eyebrow, IconChat, IconCheck, IconInbox, IconPhone, IconUser, Reveal, progressAt } from "../ui";

const NODES = [
  { label: "New lead", sub: "", icon: IconInbox },
  { label: "AI Voice", sub: "Automated Outreach", icon: IconPhone },
  { label: "WhatsApp", sub: "Conversation Continues", icon: IconChat },
  { label: "High intent", sub: "", icon: IconCheck },
  { label: "RM", sub: "Ready to Engage", icon: IconUser },
];

export const Solution: React.FC<{ t: number }> = ({ t }) => {
  const [s] = SECTIONS.solution;
  const flowStart = s + 0.7;
  const step = 0.55;
  const pulse = interpolate(t, [flowStart + 0.3, flowStart + 0.3 + step * 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x0 = 110;
  const x1 = 970;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 64, top: 230, width: 950 }}>
        <Reveal at={s + 0.05}>
          <Eyebrow>One connected outreach engine</Eyebrow>
        </Reveal>
        <Reveal at={s + 0.2} style={{ marginTop: 20 }}>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.6, lineHeight: 1.08, color: C.ink }}>
            Automate the chase.
            <br />
            <span style={{ color: C.accent }}>Let RMs focus on closing.</span>
          </div>
        </Reveal>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 600, height: 300 }}>
        {/* track */}
        <div style={{ position: "absolute", left: x0, width: x1 - x0, top: 52, height: 4, borderRadius: 2, background: C.border, opacity: progressAt(t, flowStart, 0.4) }} />
        <div style={{ position: "absolute", left: x0, width: (x1 - x0) * pulse, top: 52, height: 4, borderRadius: 2, background: C.accent }} />
        <div
          style={{
            position: "absolute",
            left: x0 + (x1 - x0) * pulse - 11,
            top: 43,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: C.accent,
            boxShadow: `0 0 0 8px rgba(36,115,84,0.18)`,
            opacity: pulse > 0 && pulse < 1 ? 1 : 0,
          }}
        />
        {NODES.map((n, i) => {
          const cx = x0 + ((x1 - x0) / 4) * i;
          const appear = progressAt(t, flowStart + i * 0.12, 0.4);
          const lit = progressAt(t, flowStart + 0.3 + step * i - 0.05, 0.3);
          const Icon = n.icon;
          const isRm = i === 4;
          return (
            <div key={n.label} style={{ position: "absolute", left: cx - 90, width: 180, top: 0, display: "flex", flexDirection: "column", alignItems: "center", opacity: appear, transform: `translateY(${(1 - appear) * 16}px)` }}>
              <div
                style={{
                  width: 108,
                  height: 108,
                  borderRadius: 30,
                  background: lit > 0.5 ? (isRm ? C.green : "#fff") : "#FAF8F4",
                  border: `1.5px solid ${lit > 0.5 ? C.accent : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -2,
                  transform: `scale(${0.97 + 0.03 * lit})`,
                  boxShadow: lit > 0.5 ? "0 16px 30px -18px rgba(23,77,59,0.55)" : "none",
                }}
              >
                <Icon size={42} color={lit > 0.5 ? (isRm ? "#fff" : C.green) : "#A9A89F"} stroke={isRm || i === 3 ? 2.4 : 2} />
              </div>
              <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 16, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: lit > 0.5 ? C.ink : C.muted }}>{n.label}</div>
              {n.sub ? (
                <div style={{ marginTop: 6, fontSize: 17, fontWeight: 500, color: C.accent, opacity: lit, textAlign: "center" }}>{n.sub}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
