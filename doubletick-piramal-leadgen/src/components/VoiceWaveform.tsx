import React from "react";
import { C } from "../styles/tokens";

/**
 * Tasteful voice waveform. `mode` idle = ringing ripple, live = speech-like amplitude.
 * Deterministic (frame-driven sines), no randomness at render time.
 */
export const VoiceWaveform: React.FC<{
  frame: number;
  live: number; // 0 = ringing, 1 = connected speech
  width?: number;
  height?: number;
  bars?: number;
  color?: string;
}> = ({ frame, live, width = 520, height = 64, bars = 52, color = C.green }) => {
  const gap = 4;
  const bw = (width - gap * (bars - 1)) / bars;
  const t = frame / 30;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {Array.from({ length: bars }).map((_, i) => {
        const x = i * (bw + gap);
        const u = i / (bars - 1);
        // Ringing: a soft travelling ripple.
        const ring = 0.1 + 0.12 * Math.max(0, Math.sin(u * 9 - t * 7)) * Math.sin(Math.PI * u);
        // Speech: layered sines gated by a syllable envelope.
        const syll = 0.55 + 0.45 * Math.sin(t * 5.3 + Math.sin(t * 1.7) * 2);
        const speech =
          (0.18 +
            0.5 *
              Math.abs(Math.sin(u * 13.1 + t * 6.2)) *
              Math.abs(Math.sin(u * 5.3 - t * 3.1 + 1.3)) +
            0.25 * Math.abs(Math.sin(u * 29 + t * 11))) *
          Math.pow(Math.sin(Math.PI * (0.04 + u * 0.92)), 0.7) *
          syll;
        const a = Math.max(0.06, ring * (1 - live) + speech * live);
        const h = Math.max(4, a * height);
        return (
          <rect
            key={i}
            x={x}
            y={(height - h) / 2}
            width={bw}
            height={h}
            rx={bw / 2}
            fill={color}
            opacity={0.35 + 0.65 * Math.min(1, a * 1.8)}
          />
        );
      })}
    </svg>
  );
};
