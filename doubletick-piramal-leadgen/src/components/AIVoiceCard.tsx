import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, FONT } from "../styles/tokens";
import { IconWave } from "./Icons";
import { Avatar, Chip, Mono, Swap } from "./ui";
import { VoiceWaveform } from "./VoiceWaveform";

export const AI_CARD = { w: 580, h: 332 };
export const USE_CASES = ["Application", "Drop-off", "Partner", "Collections"];

/** Which lifecycle use case is active at a frame (-1 before the rail starts). */
export const activeUseCase = (frame: number) => {
  const marks = [T.nodeApp, T.nodeDrop, T.nodePartner, T.nodeColl];
  let a = -1;
  marks.forEach((m, i) => {
    if (frame >= m) a = i;
  });
  return a;
};

const statusChip = (label: string, tone: "neutral" | "green" | "solid", pulse = 0) => (
  <Chip label={label} tone={tone} size={12} dotPulse={pulse} />
);

/** DoubleTick AI Voice module — one live call, three states. */
export const AIVoiceCard: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const responded = T.across - 6;
  const pConnected = prog(frame, T.connected, 10);
  const pResponded = prog(frame, responded, 10);
  const live = prog(frame, T.connected, 12);
  const secs = Math.max(0, Math.floor((frame - T.connected) / 30) + 3);
  const ringPulse = Math.abs(Math.sin(frame / 5));

  const lifecycle = activeUseCase(frame);
  const rotating = Math.floor(Math.max(0, frame - T.aiVoice) / 12) % 4;
  const active = lifecycle >= 0 ? lifecycle : rotating;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "24px 26px",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.sans,
        opacity,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconWave size={22} color="#fff" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          <Mono size={14} color={C.ink} style={{ fontWeight: 600 }}>
            AI Voice
          </Mono>
          <Mono size={11}>Campaign · Application follow-up</Mono>
        </div>
        <Swap
          p={pResponded}
          from={
            <Swap
              p={pConnected}
              from={statusChip("Calling", "neutral", ringPulse)}
              to={statusChip("Connected", "green")}
            />
          }
          to={statusChip("Customer responded", "solid")}
          style={{ justifyItems: "end" }}
        />
      </div>

      <div style={{ height: 1, background: C.line, margin: "18px 0" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar initials="R" size={50} bg={C.greenSoft} fg={C.green} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-0.02em", color: C.ink }}>
            Rohan Mehta
          </div>
          <Mono size={11} style={{ marginTop: 4, display: "block" }}>
            Customer · Loan application
          </Mono>
        </div>
        <Mono
          size={14}
          color={live > 0.5 ? C.green : C.muted}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {live > 0.5 ? `00:${String(secs).padStart(2, "0")}` : "Ringing"}
        </Mono>
      </div>

      <div style={{ marginTop: 18 }}>
        <VoiceWaveform frame={frame} live={live} width={528} height={58} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        {USE_CASES.map((u, i) => {
          const on = i === active;
          return (
            <span
              key={u}
              style={{
                padding: "6px 11px",
                borderRadius: 999,
                fontFamily: FONT.mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: on ? C.green : "#F4F1EA",
                color: on ? "#fff" : C.muted,
                border: `1px solid ${on ? C.green : C.line}`,
              }}
            >
              {u}
            </span>
          );
        })}
      </div>
    </div>
  );
};
