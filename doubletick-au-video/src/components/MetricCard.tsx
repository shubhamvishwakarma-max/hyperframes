import React from "react";
import { useCurrentFrame } from "remotion";
import { colors, easeInOut, fonts, mix, prog, radius, shadow } from "../styles/tokens";

/** Indian digit grouping: 312945 → 3,12,945 */
export const formatIndian = (n: number) => {
  const str = Math.floor(n).toString();
  if (str.length <= 3) return str;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
};

const Shell: React.FC<{ width: number; height: number; children: React.ReactNode; glow?: number }> = ({
  width,
  height,
  children,
  glow = 0,
}) => (
  <div
    style={{
      width,
      height,
      boxSizing: "border-box",
      borderRadius: radius.xl,
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      boxShadow: `${shadow.lifted}${glow > 0 ? `, 0 0 0 ${glow * 3}px rgba(40,179,121,${glow * 0.25})` : ""}`,
      padding: "28px 32px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const MetaRow: React.FC<{ index: string; tag: string }> = ({ index, tag }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 15, letterSpacing: "0.01em" }}>
    <span style={{ color: colors.inkMuted }}>{index}</span>
    <span style={{ color: colors.greenDeep }}>{tag}</span>
  </div>
);

/** 3,12,945+ — number resolves from a stream of call events (see CallParticles). */
export const CallsMetric: React.FC<{ at: number; width: number; height: number }> = ({ at, width, height }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 1.5, easeInOut);
  const done = prog(frame, at + 1.45, 0.35);
  const value = Math.round(312945 * p);
  const ticks = 44;
  return (
    <Shell width={width} height={height} glow={Math.sin(done * Math.PI) * 0.8}>
      <MetaRow index="01" tag="AI Voice" />
      <div>
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 104,
            letterSpacing: "-0.05em",
            color: colors.ink,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            display: "flex",
            alignItems: "baseline",
            filter: p > 0 && p < 1 ? `blur(${Math.sin(p * Math.PI) * 1.2}px)` : undefined,
          }}
        >
          {formatIndian(value)}
          <span
            style={{
              color: colors.green,
              display: "inline-block",
              transform: `scale(${mix(0.3, 1, done)})`,
              opacity: done,
              marginLeft: 4,
            }}
          >
            +
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {Array.from({ length: ticks }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 10,
                borderRadius: 3,
                background: i / ticks < p ? colors.green : colors.bgDeep,
                opacity: i / ticks < p ? 0.55 + 0.45 * ((i * 37) % 10) / 10 : 1,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em", color: colors.ink }}>
        Outbound
        <br />
        AI calls
      </div>
    </Shell>
  );
};

/** 30% — minimal circular conversion arc. */
export const ClosureMetric: React.FC<{ at: number; width: number; height: number }> = ({ at, width, height }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 1.0, easeInOut);
  const done = prog(frame, at + 0.95, 0.35);
  const R = 60;
  const C = 2 * Math.PI * R;
  const pct = 30 * p;
  return (
    <Shell width={width} height={height} glow={Math.sin(done * Math.PI) * 0.8}>
      <MetaRow index="02" tag="RM" />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={R * 2 + 20} height={R * 2 + 20} viewBox={`0 0 ${R * 2 + 20} ${R * 2 + 20}`}>
          <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke={colors.bgDeep} strokeWidth={14} />
          <circle
            cx={R + 10}
            cy={R + 10}
            r={R}
            fill="none"
            stroke={colors.green}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${(C * pct) / 100} ${C}`}
            transform={`rotate(-90 ${R + 10} ${R + 10})`}
          />
          {p > 0 && (
            <circle
              cx={R + 10 + R * Math.cos(((pct / 100) * 360 - 90) * (Math.PI / 180))}
              cy={R + 10 + R * Math.sin(((pct / 100) * 360 - 90) * (Math.PI / 180))}
              r={11}
              fill="#fff"
              stroke={colors.green}
              strokeWidth={4}
            />
          )}
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          right: 32,
          top: 116,
          fontFamily: fonts.sans,
          fontWeight: 700,
          fontSize: 84,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color: colors.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.round(pct)}
        <span style={{ fontSize: 54, color: colors.green }}>%</span>
      </div>
      <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.01em", color: colors.ink }}>
        RM Broadcast
        <br />
        <span style={{ color: colors.greenDeep }}>→</span> CC closure
      </div>
    </Shell>
  );
};
