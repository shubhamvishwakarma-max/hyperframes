import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { CHAT } from "../lib/beats";
import { T } from "../lib/timing";
import { C, EASE_IO, FONT } from "../styles/tokens";
import { IconRoute } from "./Icons";
import { RMCard } from "./RMCard";
import { Avatar, Chip, Mono, Swap } from "./ui";

export const CONTEXT_CARD = { x: 526, y: 318, w: 498, h: 408 };
/** Canvas y of the INTENT row centre — the data pulse lands here. */
export const INTENT_ROW_Y = CONTEXT_CARD.y + 22 + 36 + 17 + 56 + 12 + 3 * 40 + 20;

const Row: React.FC<{
  label: string;
  children: React.ReactNode;
  flash?: number;
  delayP: number;
}> = ({ label, children, flash = 0, delayP }) => (
  <div
    style={{
      height: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 10px",
      margin: "0 -10px",
      borderRadius: 10,
      background: flash > 0 ? `rgba(31,174,127,${flash * 0.14})` : undefined,
      opacity: delayP,
      transform: `translateX(${(1 - delayP) * 10}px)`,
    }}
  >
    <Mono size={12}>{label}</Mono>
    <div
      style={{
        fontSize: 17,
        fontWeight: 600,
        color: C.ink,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </div>
  </div>
);

const Dot: React.FC<{ color?: string }> = ({ color = C.greenBright }) => (
  <span
    style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }}
  />
);

/**
 * DoubleTick customer context → intent detected → RM handoff. One card that morphs in place;
 * contents only (the parent positions/morphs the surface).
 */
export const IntentCard: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const base = T.whatsapp + 6;
  const rowP = (i: number) => prog(frame, base + 4 + i * 3, 12);
  const intent = prog(frame, CHAT.intent, 8);
  const flash = prog(frame, CHAT.intent - 2, 4) * (1 - prog(frame, CHAT.intent + 8, 16));
  const banner = prog(frame, CHAT.intent + 5, 10);
  const handoff = prog(frame, CHAT.handoff, 14, EASE_IO);
  const assigned = prog(frame, CHAT.assigned, 8);
  const routeBar = prog(frame, CHAT.handoff + 2, 14, EASE_IO);

  const rowsH = mix(160, 0, handoff);
  const summaryH = mix(0, 44, handoff);
  const rmH = mix(0, 82, handoff);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.sans,
        opacity,
      }}
    >
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Swap
          p={handoff}
          from={
            <Mono size={14} color={C.ink} style={{ fontWeight: 600 }}>
              Customer context
            </Mono>
          }
          to={
            <Mono size={14} color={C.green} style={{ fontWeight: 600 }}>
              RM handoff
            </Mono>
          }
        />
        <Swap
          p={assigned}
          from={
            <Swap
              p={intent}
              from={
                <Chip
                  label="Live"
                  tone="green"
                  size={11}
                  dotPulse={Math.abs(Math.sin(frame / 6))}
                />
              }
              to={<Chip label="Intent detected" tone="solid" size={11} />}
              style={{ justifyItems: "end" }}
            />
          }
          to={<Chip label="With context" tone="green" size={11} />}
          style={{ justifyItems: "end" }}
        />
      </div>
      <div style={{ height: 1, background: C.line, margin: "8px 0" }} />
      <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, opacity: rowP(0) }}>
        <Avatar initials="R" size={44} bg={C.greenSoft} fg={C.green} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 650, letterSpacing: "-0.02em", color: C.ink }}>
            Rohan Mehta
          </div>
          <Mono size={11} style={{ display: "block", marginTop: 3 }}>
            Personal loan · Application
          </Mono>
        </div>
      </div>
      <div style={{ height: 12 }} />
      <div style={{ height: rowsH, overflow: "hidden", opacity: 1 - handoff }}>
        <Row label="Journey" delayP={rowP(1)}>
          Application drop-off
        </Row>
        <Row label="AI Voice" delayP={rowP(2)}>
          <Dot /> Connected
        </Row>
        <Row label="WhatsApp" delayP={rowP(3)}>
          <Dot /> Active
        </Row>
        <Row label="Intent" delayP={rowP(4)} flash={flash}>
          <Swap
            p={intent}
            from={<span style={{ color: C.muted, fontWeight: 500 }}>Listening…</span>}
            to={<Chip label="Needs assistance" tone="green" size={12} />}
            style={{ justifyItems: "end" }}
          />
        </Row>
      </div>
      <div
        style={{
          height: summaryH,
          overflow: "hidden",
          opacity: handoff,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Mono size={11}>Shared:</Mono>
        <Chip label="Call summary" tone="neutral" size={11} dot={false} />
        <Chip label="WhatsApp thread" tone="neutral" size={11} dot={false} />
        <Chip label="Intent" tone="green" size={11} dot={false} />
      </div>
      <div style={{ height: 12 }} />
      <div
        style={{
          height: 48,
          borderRadius: 12,
          background: C.ink,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          position: "relative",
          overflow: "hidden",
          opacity: banner,
          transform: `translateY(${(1 - banner) * 8}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${routeBar * 100}%`,
            background: C.green,
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <Swap
            p={handoff}
            from={
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Dot color="#F2B35B" />
                <Mono size={13} color="#fff" style={{ fontWeight: 600 }}>
                  Human intervention required
                </Mono>
              </span>
            }
            to={
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IconRoute size={17} color="#fff" />
                <Mono size={13} color="#fff" style={{ fontWeight: 600 }}>
                  Routed to the right RM
                </Mono>
              </span>
            }
          />
        </div>
      </div>
      <div style={{ height: 12 }} />
      <div style={{ height: rmH, overflow: "visible" }}>
        {handoff > 0 && <RMCard frame={frame} enter={CHAT.handoff + 4} assigned={CHAT.assigned} />}
      </div>
    </div>
  );
};
