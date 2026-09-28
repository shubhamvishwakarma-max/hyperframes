import React from "react";
import { Img, staticFile } from "remotion";

/** Official Piramal Finance logo (public/logos/piramal-finance-logo.png). */
export const PiramalLogo: React.FC<{ height?: number; style?: React.CSSProperties }> = ({
  height = 36,
  style,
}) => (
  <Img
    src={staticFile("logos/piramal-finance-logo.png")}
    style={{ height, width: "auto", display: "block", ...style }}
  />
);

/** Piramal mark cropped for a round avatar (public/logos/piramal-finance-mark.png). */
export const PiramalMark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#fff",
      border: "1px solid #E6E1D8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <Img
      src={staticFile("logos/piramal-finance-mark.png")}
      style={{ width: size * 0.74, height: size * 0.74, objectFit: "contain" }}
    />
  </div>
);
