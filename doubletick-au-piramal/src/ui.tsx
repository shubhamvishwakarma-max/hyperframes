import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, MONO } from "./theme";
import { brandAssets } from "./brand-assets";

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 progress of an ease-out move starting at `at` seconds, lasting `dur` seconds. */
export const useProgress = (at: number, dur = 0.4) => {
  const f = useCurrentFrame();
  return interpolate(f / FPS, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
};

export const progressAt = (t: number, at: number, dur = 0.4) =>
  interpolate(t, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

/** Fade + subtle rise + 0.97→1 scale entrance. */
export const Reveal: React.FC<{
  at: number;
  dur?: number;
  y?: number;
  x?: number;
  scale?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, dur = 0.4, y = 18, x = 0, scale = false, style, children }) => {
  const p = useProgress(at, dur);
  const s = scale ? 0.97 + 0.03 * p : 1;
  return (
    <div
      style={{
        opacity: p,
        transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.accent,
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: 2.2,
      textTransform: "uppercase",
      color,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
    {children}
  </div>
);

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 22,
      boxShadow: "0 1px 2px rgba(23,25,23,0.04), 0 16px 36px -22px rgba(60,50,30,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const StatusChip: React.FC<{
  label: string;
  tone?: "green" | "warn" | "cold" | "neutral" | "solid";
  size?: number;
  style?: React.CSSProperties;
}> = ({ label, tone = "green", size = 14, style }) => {
  const tones = {
    green: [C.soft, C.green],
    warn: [C.warnSoft, C.warn],
    cold: [C.coldSoft, C.cold],
    neutral: ["#F1EEE6", C.muted],
    solid: [C.green, "#fff"],
  } as const;
  const [bg, fg] = tones[tone];
  return (
    <span
      style={{
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: 999,
        background: bg,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children_dot(fg)}
      {label}
    </span>
  );
};
const children_dot = (c: string) => (
  <span style={{ width: 6, height: 6, borderRadius: 3, background: c, display: "inline-block" }} />
);

/* ---------- icons (simple line icons, brand-neutral) ---------- */
type IconProps = { size?: number; color?: string; stroke?: number };
export const IconPhone: React.FC<IconProps> = ({ size = 22, color = C.green, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
export const IconChat: React.FC<IconProps> = ({ size = 22, color = C.green, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z" />
  </svg>
);
export const IconUser: React.FC<IconProps> = ({ size = 22, color = C.green, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
export const IconInbox: React.FC<IconProps> = ({ size = 22, color = C.green, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
  </svg>
);
export const IconSpark: React.FC<IconProps> = ({ size = 22, color = C.green, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  </svg>
);
export const IconCheck: React.FC<IconProps> = ({ size = 16, color = "#fff", stroke = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
export const IconArrow: React.FC<IconProps & { dir?: "right" | "down" }> = ({
  size = 20,
  color = C.accent,
  stroke = 2.4,
  dir = "right",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "down" ? "rotate(90deg)" : undefined }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconBadge: React.FC<{ children: React.ReactNode; size?: number; bg?: string }> = ({
  children,
  size = 40,
  bg = C.soft,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
    }}
  >
    {children}
  </div>
);

/* ---------- logos ---------- */
export const DoubleTickLogo: React.FC<{ width: number; style?: React.CSSProperties }> = ({
  width,
  style,
}) => <Img src={staticFile(brandAssets.doubletick)} style={{ width, height: "auto", display: "block", ...style }} />;

/**
 * Official customer logo. While the official file is not yet in /public/assets we render a neutral
 * dashed slot (never a typed/recreated brand mark).
 */
export const CustomerLogo: React.FC<{
  brand: "au" | "piramal";
  height: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({ brand, height, maxWidth, style }) => {
  const src = brandAssets[brand];
  if (src) {
    return (
      <Img
        src={staticFile(src)}
        style={{ height, width: "auto", maxWidth, objectFit: "contain", display: "block", ...style }}
      />
    );
  }
  return (
    <div
      style={{
        height,
        minWidth: height * 2.6,
        maxWidth,
        border: `1.5px dashed ${C.muted}`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO,
        fontSize: Math.max(8, height * 0.24),
        color: C.muted,
        letterSpacing: 1,
        padding: "0 8px",
        ...style,
      }}
    >
      LOGO
    </div>
  );
};

/** Square avatar holding the official customer logo (for WhatsApp business headers). */
export const LogoAvatar: React.FC<{ brand: "au" | "piramal"; size: number }> = ({ brand, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flex: "none",
    }}
  >
    <CustomerLogo brand={brand} height={size * 0.42} maxWidth={size * 0.78} style={{ minWidth: 0, border: brandAssets[brand] ? undefined : `1px dashed ${C.muted}`, fontSize: 7 }} />
  </div>
);

/* ---------- phone ---------- */
export const Phone: React.FC<{
  width: number;
  height: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ width, height, style, children }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 54,
      background: C.ink,
      padding: 11,
      boxShadow: "0 44px 70px -34px rgba(40,32,15,0.5), 0 10px 24px -12px rgba(40,32,15,0.3)",
      ...style,
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 44,
        overflow: "hidden",
        background: "#fff",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 92,
          height: 26,
          borderRadius: 14,
          background: C.ink,
          zIndex: 20,
        }}
      />
      {children}
    </div>
  </div>
);

export const StatusBar: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div
    style={{
      height: 50,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 30px 6px",
      fontSize: 15,
      fontWeight: 600,
      color: dark ? "#fff" : C.ink,
    }}
  >
    <span>9:41</span>
    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[6, 9, 12].map((h) => (
        <span key={h} style={{ width: 4, height: h, borderRadius: 1, background: dark ? "#fff" : C.ink }} />
      ))}
      <span style={{ width: 22, height: 11, borderRadius: 3, border: `1.5px solid ${dark ? "#fff" : C.ink}`, marginLeft: 4 }} />
    </span>
  </div>
);

export const Bubble: React.FC<{
  side: "in" | "out";
  time: string;
  p: number;
  children: React.ReactNode;
}> = ({ side, time, p, children }) => (
  <div
    style={{
      alignSelf: side === "in" ? "flex-start" : "flex-end",
      maxWidth: "84%",
      background: side === "in" ? "#fff" : C.waOut,
      borderRadius: 16,
      borderTopLeftRadius: side === "in" ? 4 : 16,
      borderTopRightRadius: side === "out" ? 4 : 16,
      padding: "11px 14px 20px",
      fontSize: 18,
      lineHeight: 1.35,
      color: C.ink,
      position: "relative",
      boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
      opacity: p,
      transform: `translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
      transformOrigin: side === "in" ? "left bottom" : "right bottom",
    }}
  >
    {children}
    <span style={{ position: "absolute", right: 12, bottom: 5, fontSize: 11, color: "#8A8D86" }}>
      {time}
      {side === "out" ? <span style={{ color: C.accent, fontWeight: 700 }}> ✓✓</span> : null}
    </span>
  </div>
);
