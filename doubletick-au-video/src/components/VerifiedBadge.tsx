import React from "react";
import { colors } from "../styles/tokens";

/** Small blue circular verified badge with a white tick (no emoji). */
export const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="10" fill={colors.verified} />
    <path
      d="M5.6 10.3l2.9 2.9 5.9-6.1"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
