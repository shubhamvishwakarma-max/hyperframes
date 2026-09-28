import React from "react";
import { Img, staticFile } from "remotion";

/** Official DoubleTick wordmark (public/logos/doubletick-logo.png). */
export const DoubleTickLogo: React.FC<{ height?: number; style?: React.CSSProperties }> = ({
  height = 34,
  style,
}) => (
  <Img
    src={staticFile("logos/doubletick-logo.png")}
    style={{ height, width: "auto", display: "block", ...style }}
  />
);
