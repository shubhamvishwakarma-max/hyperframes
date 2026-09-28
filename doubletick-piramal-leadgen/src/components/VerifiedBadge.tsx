import React from "react";
import { C } from "../styles/tokens";

/** Blue verified badge — scalloped seal, white check. */
export const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 18 }) => {
  const points = 12;
  const r1 = 12;
  const r2 = 10.4;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    d += `${i === 0 ? "M" : "L"}${(12 + Math.cos(a) * r).toFixed(2)},${(12 + Math.sin(a) * r).toFixed(2)}`;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        d={d + "Z"}
        fill={C.verified}
        strokeLinejoin="round"
        stroke={C.verified}
        strokeWidth={1.4}
      />
      <path
        d="M7.4 12.3l3.1 3.1 6.1-6.3"
        fill="none"
        stroke="#fff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
