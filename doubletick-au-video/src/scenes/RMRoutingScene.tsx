import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Avatar } from "../components/Avatar";
import { ContextTimeline } from "../components/ContextTimeline";
import { DoubleTickMark } from "../components/DoubleTickLogo";
import { IconCheck, IconIntent, IconWhatsApp } from "../components/Icons";
import { MaskedLine } from "../components/KineticHeadline";
import { RMCard } from "../components/RMCard";
import { StatusChip } from "../components/StatusChip";
import { WorkflowConnector } from "../components/WorkflowConnector";
import { colors, easeIn, easeInOut, fonts, mix, prog, radius, shadow } from "../styles/tokens";
import { T } from "../timing";

const PANEL = { x: 504, y: 392, w: 512 };
const CUSTOMER_H = 232;
const RM_Y = 772;
const ROUTE = "M 560 624 C 560 700, 760 690, 760 766";

const Field: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontFamily: fonts.mono, fontSize: 13, letterSpacing: "0.1em", color: colors.inkMuted }}>{k}</span>
    {children}
  </div>
);

/** 0:11–0:18 — right lead, right RM, ownership change without context loss, then unified timeline. */
export const RMRoutingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = prog(frame, 17.8, 0.5, easeIn);
  const push = 1 + 0.02 * prog(frame, T.s3Start, 6.5, easeInOut);

  const custIn = prog(frame, T.s3Start + 0.25, 0.6);
  const expand = prog(frame, T.centralized - 0.05, 0.7, easeInOut);
  const panelH = mix(CUSTOMER_H, 610, expand);

  // routing token
  const routeDraw = prog(frame, T.rightRM - 0.1, 0.45);
  const travel = prog(frame, T.rightRM + 0.05, 0.6, easeInOut);
  const len = getLength(ROUTE);
  const pt = getPointAtLength(ROUTE, len * travel) ?? { x: 560, y: 624 };
  const tokenVis = prog(frame, T.rightRM, 0.2) * (1 - prog(frame, T.routed - 0.05, 0.2));

  const rmIn = prog(frame, T.rightRM - 0.15, 0.5);
  const routed = prog(frame, T.routed, 0.35);
  const morph = prog(frame, T.ownershipChanges, 0.6, easeInOut);
  const ownerChip = prog(frame, T.ownershipChanges + 0.1, 0.35);
  const history = prog(frame, T.historyPreserved, 0.4);
  const collapse = expand; // RM card + chips fold into the timeline panel

  return (
    <AbsoluteFill style={{ transform: `scale(${push * mix(1, 0.94, exit)})`, transformOrigin: "50% 60%", opacity: 1 - exit, filter: exit > 0.02 ? `blur(${exit * 6}px)` : undefined }}>
      <div style={{ position: "absolute", left: 64, top: 146 }}>
        <MaskedLine text="RIGHT LEAD." at={T.rightLead} exitAt={17.7} size={60} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 212 }}>
        <MaskedLine text="RIGHT RM." at={T.rightRM} exitAt={17.72} size={60} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 280 }}>
        <MaskedLine text="ZERO CONTEXT LOSS." at={T.zeroContextLoss} exitAt={17.74} size={70} color={colors.greenDeep} weight={800} />
      </div>

      {/* route */}
      <WorkflowConnector d={ROUTE} length={len} width={1080} height={1080} draw={routeDraw * (1 - collapse)} />

      {/* customer panel → expands into timeline */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x + mix(60, 0, custIn),
          top: PANEL.y,
          width: PANEL.w,
          height: panelH,
          boxSizing: "border-box",
          borderRadius: radius.xl,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: shadow.lifted,
          opacity: custIn,
          overflow: "hidden",
          padding: 26,
        }}
      >
        <div style={{ opacity: 1 - prog(frame, T.centralized - 0.1, 0.25), display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar initials="AM" size={54} bg="#3F5A4C" />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
              <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 27, color: colors.ink, letterSpacing: "-0.01em" }}>
                ARJUN MEHTA
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 13, letterSpacing: "0.1em", color: colors.inkMuted }}>CUSTOMER</span>
            </div>
            <DoubleTickMark size={26} />
          </div>
          <div style={{ height: 1, background: colors.border }} />
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.9fr 1.05fr", gap: 12 }}>
            <Field k="PRODUCT">
              <span style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 20, color: colors.ink, whiteSpace: "nowrap" }}>Business Loan</span>
            </Field>
            <Field k="INTENT">
              <StatusChip label="HIGH" tone="solid" size={14} icon={<IconIntent size={15} color="#fff" stroke={2.6} />} />
            </Field>
            <Field k="CHANNEL">
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: fonts.sans, fontWeight: 600, fontSize: 20, color: colors.ink }}>
                <IconWhatsApp size={20} color={colors.greenDeep} />
                WhatsApp
              </span>
            </Field>
          </div>
        </div>
        <div style={{ position: "absolute", left: 26, top: 26, opacity: prog(frame, T.centralized + 0.1, 0.3) }}>
          <ContextTimeline at={T.centralized + 0.1} width={PANEL.w - 52} />
        </div>
      </div>

      {/* travelling customer token */}
      <div
        style={{
          position: "absolute",
          left: pt.x,
          top: pt.y,
          transform: `translate(-50%, -50%) scale(${mix(0.8, 1, tokenVis)})`,
          opacity: tokenVis,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px 7px 7px",
          borderRadius: 99,
          background: colors.surface,
          border: `1.5px solid ${colors.green}`,
          boxShadow: `0 10px 24px -10px rgba(15,107,71,0.6)`,
          filter: travel > 0.05 && travel < 0.95 ? "blur(0.6px)" : undefined,
          zIndex: 4,
        }}
      >
        <Avatar initials="AM" size={30} bg="#3F5A4C" />
        <span style={{ fontFamily: fonts.mono, fontWeight: 600, fontSize: 14, letterSpacing: "0.06em", color: colors.ink }}>ARJUN · HIGH</span>
      </div>

      {/* RM card */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: mix(RM_Y + 24, RM_Y, rmIn) - collapse * 120,
          opacity: rmIn * (1 - collapse),
          transform: `scale(${mix(1, 0.92, collapse)})`,
        }}
      >
        <RMCard morph={morph} width={PANEL.w} active={routed} />
      </div>

      {/* status chips */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: RM_Y + 120 - collapse * 120,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          opacity: 1 - collapse,
        }}
      >
        <div style={{ position: "relative", height: 38 }}>
          <div style={{ position: "absolute", opacity: routed * (1 - ownerChip), transform: `translateY(${mix(10, 0, routed) - ownerChip * 10}px)` }}>
            <StatusChip label="AUTO-ROUTED" tone="green" size={16} icon={<IconCheck size={18} color={colors.greenDeep} stroke={3} />} />
          </div>
          <div style={{ position: "absolute", opacity: ownerChip, transform: `translateY(${mix(10, 0, ownerChip)}px)`, whiteSpace: "nowrap" }}>
            <StatusChip label="RM OWNERSHIP UPDATED" tone="neutral" size={16} />
          </div>
        </div>
        <div style={{ opacity: history, transform: `translateY(${mix(12, 0, history)}px) scale(${mix(0.94, 1, history)})`, transformOrigin: "0% 50%" }}>
          <StatusChip
            label="CHAT HISTORY PRESERVED"
            tone="solid"
            size={16}
            icon={<IconCheck size={18} color="#fff" stroke={3} />}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
