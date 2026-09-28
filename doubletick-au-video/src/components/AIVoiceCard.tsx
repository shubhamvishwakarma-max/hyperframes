import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, fonts, mix, prog, radius, s, shadow } from "../styles/tokens";
import { T } from "../timing";
import { Avatar } from "./Avatar";
import { DoubleTickMark } from "./DoubleTickLogo";
import { IconVoice } from "./Icons";
import { StatusChip } from "./StatusChip";

export const AIVOICE_W = 440;
export const AIVOICE_H = 336;

const BARS = 34;

/** DoubleTick AI Voice call card — CALLING → CONNECTED → INTEREST DETECTED. */
export const AIVoiceCard: React.FC = () => {
  const frame = useCurrentFrame();
  const calling = frame >= s(T.aiVoice) - 6;
  const connected = frame >= s(T.connected);
  const interest = frame >= s(T.interest);
  const connP = prog(frame, T.connected, 0.35);
  const intP = prog(frame, T.interest, 0.4);
  const status = interest ? "INTEREST DETECTED" : connected ? "CONNECTED" : "CALLING…";
  const tone = interest ? "solid" : connected ? "green" : "amber";
  const statusSwap = interest ? intP : connected ? connP : prog(frame, T.aiVoice - 0.2, 0.3);
  const secs = Math.max(0, Math.floor((frame - s(T.connected)) / 30));
  const amp = !calling ? 0.15 : connected ? 1 : 0.35;
  return (
    <div
      style={{
        width: AIVOICE_W,
        height: AIVOICE_H,
        borderRadius: radius.lg,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: shadow.lifted,
        padding: 26,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <StatusChip
          label="AI VOICE"
          tone="green"
          size={15}
          icon={<IconVoice size={16} color={colors.greenInk} stroke={2.4} />}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DoubleTickMark size={20} />
          <span style={{ fontFamily: fonts.mono, fontSize: 13, letterSpacing: "0.08em", color: colors.inkMuted }}>
            CAMPAIGN
          </span>
        </div>
      </div>
      <div style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 25, color: colors.ink, letterSpacing: "-0.02em" }}>
        Dormant Lead Campaign
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar initials="AM" size={50} bg="#3F5A4C" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 21, color: colors.ink }}>Arjun Mehta</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13.5, letterSpacing: "0.06em", color: colors.inkMuted }}>
            {connected ? `LIVE · 00:${String(secs + 4).padStart(2, "0")}` : "RE-ENGAGEMENT CALL"}
          </span>
        </div>
      </div>
      {/* waveform */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, height: 50 }}>
        {Array.from({ length: BARS }).map((_, i) => {
          const n =
            Math.abs(Math.sin(frame * 0.35 + i * 0.9)) * 0.55 +
            Math.abs(Math.sin(frame * 0.17 + i * 1.7)) * 0.45;
          const env = Math.sin((i / (BARS - 1)) * Math.PI) * 0.7 + 0.3;
          const h = 5 + n * env * 44 * amp;
          const lit = connected ? colors.green : colors.borderStrong;
          return (
            <span
              key={i}
              style={{ width: 5, height: h, borderRadius: 4, background: lit, opacity: mix(0.55, 1, connP) }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            transform: `translateY(${(1 - statusSwap) * 10}px)`,
            opacity: statusSwap,
            filter: statusSwap < 1 ? `blur(${(1 - statusSwap) * 3}px)` : undefined,
          }}
        >
          <StatusChip label={status} tone={tone} size={15} pulse={connected ? 0 : (Math.sin(frame / 4) + 1) / 2} />
        </div>
        <span style={{ fontFamily: fonts.mono, fontSize: 13, letterSpacing: "0.06em", color: colors.inkMuted }}>
          AUTO-DIALED
        </span>
      </div>
    </div>
  );
};
