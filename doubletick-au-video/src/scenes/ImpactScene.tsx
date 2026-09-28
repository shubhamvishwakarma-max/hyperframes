import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Eyebrow, MaskedLine } from "../components/KineticHeadline";
import { CallsMetric, ClosureMetric } from "../components/MetricCard";
import { colors, easeIn, easeInOut, mix, prog } from "../styles/tokens";
import { T } from "../timing";

const N = 150;
const LEFT = { x: 64, y: 186, w: 548, h: 372 };
const RIGHT = { x: 632, y: 186, w: 384, h: 372 };

const particleAt = (i: number, f: number) => {
  const r1 = random(`p${i}a`);
  const r2 = random(`p${i}b`);
  const r3 = random(`p${i}c`);
  const fromPhone = i % 2 === 0;
  const ox = fromPhone ? 90 + r1 * 350 : 530 + r1 * 460;
  const oy = 420 + r2 * 560;
  const burst = prog(f, 17.85 + r3 * 0.25, 0.8);
  const angle = r1 * Math.PI * 2;
  const bx = ox + Math.cos(angle) * 50 * burst;
  const by = oy + Math.sin(angle) * 36 * burst;
  const start = T.threeLakh - 0.45 + r3 * 1.0;
  const gather = prog(f, start, 0.55, easeInOut);
  const tx = LEFT.x + 40 + r2 * 420;
  const ty = LEFT.y + 110 + r1 * 80;
  return { x: mix(bx, tx, gather), y: mix(by, ty, gather), gather, start, r2, r3 };
};

/**
 * Call-event particles: the previous scene's UI dissolves into small call markers
 * that stream in (with motion streaks) and compress into the 3,12,945+ figure.
 */
const CallParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  if (t < 17.8 || t > 21.2) return null;
  return (
    <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: N }).map((_, i) => {
        const p = particleAt(i, frame);
        const appear = prog(frame, 17.85 + p.r3 * 0.3, 0.3);
        const absorb = prog(frame, p.start + 0.45, 0.12);
        const size = mix(2.6 + p.r2 * 1.4, 1.2, p.gather);
        const col = p.r3 > 0.25 ? colors.green : colors.inkSoft;
        const o = appear * (1 - absorb) * 0.8;
        if (o <= 0.01) return null;
        return (
          <g key={i} opacity={o}>
            <circle cx={p.x} cy={p.y} r={size} fill={col} />
          </g>
        );
      })}
    </svg>
  );
};

/** 0:18–0:25 — proof: 3,12,945+ outbound AI calls, 30% RM Broadcast → CC closure. */
export const ImpactScene: React.FC = () => {
  const frame = useCurrentFrame();
  const leftIn = prog(frame, 18.3, 0.6);
  const rightIn = prog(frame, 18.45, 0.6);
  const exit = prog(frame, 24.8, 0.35, easeIn);
  const push = 1 + 0.02 * prog(frame, 18.1, 7, easeInOut);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 50%" }}>
      <div style={{ position: "absolute", left: 64, top: 132 }}>
        <Eyebrow text="Proven at scale" at={18.15} exitAt={24.75} />
      </div>
      <div
        style={{
          position: "absolute",
          left: LEFT.x,
          top: LEFT.y + mix(40, 0, leftIn) - exit * 60,
          opacity: leftIn * (1 - exit),
          filter: exit > 0.02 ? `blur(${exit * 6}px)` : undefined,
        }}
      >
        <CallsMetric at={T.threeLakh} width={LEFT.w} height={LEFT.h} />
      </div>
      <div
        style={{
          position: "absolute",
          left: RIGHT.x,
          top: RIGHT.y + mix(40, 0, rightIn) - exit * 60,
          opacity: rightIn * (1 - exit),
          filter: exit > 0.02 ? `blur(${exit * 6}px)` : undefined,
        }}
      >
        <ClosureMetric at={T.thirtyPercent} width={RIGHT.w} height={RIGHT.h} />
      </div>
      <CallParticles />
      <div style={{ position: "absolute", left: 64, top: 622 }}>
        <MaskedLine text="Scale outreach." at={21.05} exitAt={24.72} size={92} weight={800} stagger={0.1} />
      </div>
      <div style={{ position: "absolute", left: 64, top: 724 }}>
        <MaskedLine text="Not RM workload." at={21.35} exitAt={24.76} size={92} weight={800} color={colors.greenDeep} stagger={0.1} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 858,
          width: 952 * prog(frame, 21.7, 0.8) * (1 - exit),
          height: 2,
          background: colors.borderStrong,
        }}
      />
    </AbsoluteFill>
  );
};
