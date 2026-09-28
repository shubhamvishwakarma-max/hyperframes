import React from "react";
import { colors, fonts } from "../styles/tokens";

/** DoubleTick mark — path from the official DT.svg brand asset (public/assets/doubletick-mark.svg). */
export const DoubleTickMark: React.FC<{ size: number; color?: string }> = ({ size, color = colors.green }) => (
  <svg width={size} height={size * (706 / 712)} viewBox="0 0 712 706" fill="none">
    <path
      d="M666.578 159.213L709.17 200.909L709.975 201.696L709.17 202.483L356.545 547.693L355.773 548.448L355.003 547.693L183.102 379.406L182.297 378.619L183.102 377.832L225.696 336.136L226.468 335.381L227.238 336.136L355.773 461.968L665.037 159.213L665.808 158.458L666.578 159.213ZM46.5107 336.136L204.764 491.002L205.568 491.789L204.764 492.576L162.113 534.331L161.342 535.086L160.571 534.331L2.37793 379.406L1.57324 378.619L2.37793 377.832L44.9697 336.136L45.7402 335.381L46.5107 336.136ZM485.851 159.213L528.446 200.908L529.25 201.696L528.446 202.483L352.604 374.629L351.833 375.384L351.062 374.629L308.47 332.93L307.666 332.142L308.47 331.354L484.31 159.213L485.08 158.458L485.851 159.213Z"
      fill={color}
      stroke={color}
      strokeWidth={2.2}
    />
  </svg>
);

export const DoubleTickLogo: React.FC<{ height?: number; color?: string; markColor?: string }> = ({
  height = 34,
  color = colors.ink,
  markColor = colors.green,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: height * 0.22 }}>
    <DoubleTickMark size={height * 1.25} color={markColor} />
    <span
      style={{
        fontFamily: fonts.sans,
        fontWeight: 600,
        fontSize: height * 0.82,
        letterSpacing: "-0.02em",
        color,
        lineHeight: 1,
      }}
    >
      DoubleTick
    </span>
  </div>
);
