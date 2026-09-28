import React from "react";
import { Img, staticFile } from "remotion";

/**
 * AU Small Finance Bank logo — uses the supplied bank brand asset file, never a text recreation.
 * Drop a higher-resolution official file at public/assets/au-small-finance-bank-logo.png to upgrade it.
 */
export const AULogo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img
    src={staticFile("assets/au-small-finance-bank-logo.png")}
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      display: "block",
      imageRendering: "auto",
      ...style,
    }}
  />
);
