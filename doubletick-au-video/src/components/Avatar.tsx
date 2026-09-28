import React from "react";
import { fonts } from "../styles/tokens";

/** Initials avatar (no photos / no PII). */
export const Avatar: React.FC<{ initials: string; size?: number; bg: string; fg?: string; ring?: string }> = ({
  initials,
  size = 44,
  bg,
  fg = "#fff",
  ring,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: bg,
      color: fg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.sans,
      fontWeight: 600,
      fontSize: size * 0.38,
      letterSpacing: "0.02em",
      boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);
