import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AIVOICE_H, AIVOICE_W, AIVoiceCard } from "../components/AIVoiceCard";
import { DoubleTickMark } from "../components/DoubleTickLogo";
import { IconIntent } from "../components/Icons";
import { Eyebrow, MaskedLine } from "../components/KineticHeadline";
import { StatusChip } from "../components/StatusChip";
import { WorkflowConnector } from "../components/WorkflowConnector";
import { colors, easeIn, easeInOut, fonts, mix, prog } from "../styles/tokens";
import { T } from "../timing";

const CARD = { x: 64, y: 404 };

/** 0:05–0:11 — AU uses DoubleTick AI Voice + WhatsApp to re-engage leads at scale. */
export const ReengagementScene: React.FC = () => {
  const frame = useCurrentFrame();
  const push = 1 + 0.02 * prog(frame, T.s2Start, 5.5, easeInOut);

  // AI card morphs out of the AI VOICE pill
  const enter = prog(frame, 5.72, 0.7);
  const exit = prog(frame, T.s3Start - 0.25, 0.5, easeIn);
  const dim = prog(frame, T.whatsapp, 0.5);
  const fromCX = 540;
  const fromCY = 535;
  const cx = mix(fromCX, CARD.x + AIVOICE_W / 2, enter) - exit * 160;
  const cy = mix(fromCY, CARD.y + AIVOICE_H / 2, enter);
  const cardScale = mix(0.6, 1, enter) * mix(1, 0.97, dim);
  const cardBlur = (1 - enter) * 5 + dim * 0.6 + exit * 6;

  // workflow energy AI card → phone
  const draw = prog(frame, T.aiVoice, 0.6) * (1 - exit);
  const pulse = prog(frame, T.interest + 0.05, 0.55, easeInOut);

  // AT SCALE kinetic reveal
  const sc = prog(frame, T.atScale, 0.6);
  const scOut = prog(frame, T.s3Start - 0.3, 0.35, easeIn);
  const underline = prog(frame, T.atScale + 0.25, 0.5);

  // HIGH INTENT chip
  const hi = prog(frame, T.highIntent, 0.45);
  const hiOut = exit;

  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
      <div style={{ position: "absolute", left: 64, top: 132 }}>
        <Eyebrow text="AU Small Finance Bank × DoubleTick" at={5.82} exitAt={T.s3Start - 0.35} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 180 }}>
        <MaskedLine text="Re-engage the leads" at={5.98} exitAt={T.s3Start - 0.35} size={58} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 243 }}>
        <MaskedLine text="you already have." at={6.12} exitAt={T.s3Start - 0.3} size={58} color={colors.inkSoft} weight={600} />
      </div>
      {/* AT SCALE. */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 306,
          overflow: "hidden",
          paddingBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: 58,
            lineHeight: 1.02,
            color: colors.green,
            letterSpacing: `${mix(0.35, -0.035, sc)}em`,
            transform: `translateY(${mix(130, 0, sc) - scOut * 130}%) scale(${mix(1.15, 1, sc)})`,
            opacity: sc > 0 ? 1 : 0,
            transformOrigin: "0% 100%",
            filter: sc > 0 && sc < 1 ? `blur(${(1 - sc) * 3}px)` : undefined,
            whiteSpace: "nowrap",
          }}
        >
          At scale.
        </div>
        <div style={{ height: 6, marginTop: 4, width: `${underline * (1 - scOut) * 100}%`, background: colors.green, borderRadius: 6 }} />
      </div>

      <WorkflowConnector
        d="M 504 600 C 560 600, 560 640, 616 640"
        length={130}
        width={1080}
        height={1080}
        draw={draw}
        pulse={pulse}
      />
      {/* signal from the reply to the DoubleTick intent chip */}
      <WorkflowConnector
        d="M 700 760 C 600 800, 520 830, 420 850"
        length={300}
        width={1080}
        height={1080}
        draw={prog(frame, T.reply + 0.2, 0.4) * (1 - hiOut)}
        pulse={prog(frame, T.reply + 0.15, 0.5, easeInOut)}
        style={{ zIndex: 3 }}
      />

      <div
        style={{
          position: "absolute",
          left: cx - AIVOICE_W / 2,
          top: cy - AIVOICE_H / 2,
          transform: `scale(${cardScale})`,
          opacity: Math.min(1, enter * 1.4) * (1 - exit) * mix(1, 0.8, dim),
          filter: cardBlur > 0.05 ? `blur(${cardBlur}px)` : undefined,
        }}
      >
        <AIVoiceCard />
      </div>

      {/* DoubleTick system chip outside the phone */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 806,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: hi * (1 - hiOut),
          transform: `translateY(${mix(20, 0, hi)}px) scale(${mix(0.92, 1, hi)})`,
          transformOrigin: "0% 50%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DoubleTickMark size={20} />
          <span style={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: "0.01em", color: colors.inkMuted }}>
            DoubleTick · Intent signal
          </span>
        </div>
        <StatusChip
          label="High intent"
          tone="solid"
          size={22}
          icon={<IconIntent size={24} color="#fff" stroke={2.6} />}
          style={{ boxShadow: `0 16px 30px -14px rgba(15,107,71,0.7), 0 0 0 ${Math.sin(hi * Math.PI) * 10}px rgba(40,179,121,0.18)` }}
        />
      </div>
    </AbsoluteFill>
  );
};
