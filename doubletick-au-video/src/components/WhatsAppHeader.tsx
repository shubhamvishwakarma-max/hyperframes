import React from "react";
import { colors, fonts } from "../styles/tokens";
import { AULogo } from "./AULogo";
import { VerifiedBadge } from "./VerifiedBadge";

/** WhatsApp business-profile header — the conversation belongs to AU Small Finance Bank. */
export const WhatsAppHeader: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px 14px 12px",
      background: colors.waHeader,
      borderBottom: "1px solid #ECE6DC",
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
    <div style={{ padding: 2, borderRadius: 99, background: "#fff", boxShadow: "0 0 0 1px #EEE7DB" }}>
      <AULogo size={44} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: 19,
            color: colors.ink,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          AU Small Finance Bank
        </span>
        <VerifiedBadge size={17} />
      </div>
      <span style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.inkMuted }}>Business Account</span>
    </div>
  </div>
);
