import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IconIntent, IconUser, IconVoice, IconWhatsApp } from "../components/Icons";
import { WorkflowConnector } from "../components/WorkflowConnector";
import { colors, easeIn, easeInOut, fonts, mix, prog } from "../styles/tokens";
import { T } from "../timing";

const NODES = [
  { title: "AI VOICE", desc: "Automated outreach", icon: IconVoice, at: T.automate },
  { title: "WHATSAPP", desc: "Conversation continues", icon: IconWhatsApp, at: T.preserve },
  { title: "HIGH INTENT", desc: "Intent surfaced", icon: IconIntent, at: T.startClosing - 0.1 },
  { title: "RM", desc: "Ready to close", icon: IconUser, at: T.focus },
];
const XS = [183, 421, 659, 897];
const NY = 572;

/** Masked vertical word roll: `from` rolls up and out while `to` rolls in. */
const WordRoll: React.FC<{ from: string; to: string; at: number; swapAt: number; exitAt: number; color?: string; toColor?: string }> = ({
  from,
  to,
  at,
  swapAt,
  exitAt,
  color = colors.ink,
  toColor = colors.ink,
}) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, at, 0.55);
  const swap = prog(frame, swapAt, 0.55, easeInOut);
  const out = prog(frame, exitAt, 0.4, easeIn);
  const blur = (p: number) => (p > 0.02 && p < 0.98 ? `blur(${Math.sin(p * Math.PI) * 3}px)` : undefined);
  return (
    <span style={{ display: "inline-grid", overflow: "hidden", paddingBottom: 10, marginBottom: -10 }}>
      <span
        style={{
          gridArea: "1 / 1",
          color,
          transform: `translateY(${mix(105, 0, inP) - swap * 105}%)`,
          filter: blur(inP < 1 ? inP : swap),
        }}
      >
        {from}
      </span>
      <span
        style={{
          gridArea: "1 / 1",
          color: toColor,
          transform: `translateY(${mix(105, 0, swap) - out * 105}%)`,
          filter: blur(swap < 1 ? swap : out),
        }}
      >
        {to}
      </span>
    </span>
  );
};

/** 0:24–0:29 — STOP CHASING. → START CLOSING. over the clean four-step workflow. */
export const ValueScene: React.FC = () => {
  const frame = useCurrentFrame();
  const echo = prog(frame, T.ctaStart - 0.1, 0.8, easeInOut);
  const rmHi = prog(frame, T.focus, 0.5);
  const connDraw = prog(frame, T.automate + 0.1, 2.4, easeInOut);
  const pulse = (frame / 30 - T.automate) / 1.6;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 176,
          fontFamily: fonts.sans,
          fontWeight: 800,
          fontSize: 108,
          letterSpacing: "-0.045em",
          lineHeight: 1.02,
          display: "flex",
          gap: 28,
          whiteSpace: "nowrap",
        }}
      >
        <WordRoll from="STOP" to="START" at={T.s5Start + 0.15} swapAt={T.startClosing} exitAt={T.ctaStart - 0.2} />
        <WordRoll
          from="CHASING."
          to="CLOSING."
          at={T.s5Start + 0.25}
          swapAt={T.startClosing + 0.08}
          exitAt={T.ctaStart - 0.15}
          color={colors.inkSoft}
          toColor={colors.greenDeep}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${echo * 300}px) scale(${mix(1, 0.8, echo)})`,
          transformOrigin: "50% 60%",
          opacity: mix(1, 0.1, echo),
          filter: echo > 0.02 ? `blur(${echo * 1.5}px)` : undefined,
        }}
      >
        <WorkflowConnector
          d={`M ${XS[0]} ${NY} L ${XS[3]} ${NY}`}
          length={XS[3] - XS[0]}
          width={1080}
          height={1080}
          draw={connDraw}
          pulse={pulse > 0 && pulse < 1 ? pulse : undefined}
          strokeWidth={3}
        />
        {NODES.map((n, i) => {
          const p = prog(frame, n.at, 0.5);
          const label = prog(frame, n.at + 0.12, 0.45);
          const isRM = i === 3;
          const hi = isRM ? rmHi : 0;
          const Icon = n.icon;
          const nodeIn = prog(frame, T.s5Start + 0.05 + i * 0.07, 0.5);
          return (
            <div key={n.title} style={{ position: "absolute", left: XS[i] - 120, top: NY - 60, width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 32,
                  background: hi > 0 ? mixHex(colors.surface, colors.greenDeep, hi) : colors.surface,
                  border: `1.5px solid ${p > 0 ? `rgba(40,179,121,${0.25 + 0.6 * p})` : colors.border}`,
                  boxShadow: `0 18px 36px -18px rgba(30,35,32,0.35)${hi > 0 ? `, 0 0 0 ${hi * 10}px rgba(40,179,121,0.16)` : ""}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${mix(0.7, 1, nodeIn) * (1 + 0.06 * p - 0.06 * prog(frame, n.at + 0.2, 0.3)) * (1 + 0.1 * hi)})`,
                  opacity: nodeIn,
                }}
              >
                <Icon size={50} color={hi > 0.5 ? "#fff" : p > 0 ? colors.greenDeep : colors.inkMuted} stroke={2.2} />
              </div>
              <div
                style={{
                  marginTop: 26,
                  fontFamily: fonts.mono,
                  fontWeight: 600,
                  fontSize: 21,
                  letterSpacing: "0.12em",
                  color: p > 0 ? colors.ink : colors.inkMuted,
                  opacity: nodeIn,
                  whiteSpace: "nowrap",
                }}
              >
                {n.title}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: fonts.sans,
                  fontWeight: 500,
                  fontSize: 25,
                  lineHeight: 1.2,
                  textAlign: "center",
                  color: isRM ? mixHex(colors.inkSoft, colors.greenDeep, hi) : colors.inkSoft,
                  opacity: label,
                  transform: `translateY(${mix(10, 0, label)}px)`,
                  width: 220,
                }}
              >
                {n.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}
