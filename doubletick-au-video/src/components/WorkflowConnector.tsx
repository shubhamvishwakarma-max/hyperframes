import React from "react";
import { useCurrentFrame } from "remotion";
import { colors } from "../styles/tokens";

/**
 * Animated SVG connector: draws on with `draw` (0→1), carries flowing dashes, and an optional
 * travelling signal pulse at `pulse` (0→1 along the path).
 */
export const WorkflowConnector: React.FC<{
  d: string;
  length: number;
  width: number;
  height: number;
  draw: number;
  pulse?: number;
  opacity?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({ d, length, width, height, draw, pulse, opacity = 1, strokeWidth = 3, style }) => {
  const frame = useCurrentFrame();
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity, ...style }}>
      <defs>
        <filter id={`g${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke={colors.borderStrong} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${length * draw} ${length}`} />
      <path
        d={d}
        fill="none"
        stroke={colors.green}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`2 12`}
        strokeDashoffset={-frame * 1.6}
        opacity={draw >= 1 ? 0.9 : 0}
      />
      <path d={d} fill="none" stroke={colors.green} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${length * draw} ${length}`} opacity={0.35} />
      {pulse !== undefined && pulse > 0 && pulse < 1 && (
        <>
          <path
            d={d}
            fill="none"
            stroke={colors.green}
            strokeWidth={strokeWidth * 3}
            strokeLinecap="round"
            strokeDasharray={`${length * 0.12} ${length}`}
            strokeDashoffset={-length * (pulse * 1.12 - 0.12)}
            filter={`url(#g${id})`}
          />
          <path
            d={d}
            fill="none"
            stroke={colors.green}
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
            strokeDasharray={`${length * 0.08} ${length}`}
            strokeDashoffset={-length * (pulse * 1.08 - 0.08)}
          />
        </>
      )}
    </svg>
  );
};
