import React from "react";
import { C, FONT } from "../styles/tokens";
import { PiramalMark } from "./PiramalLogo";
import { VerifiedBadge } from "./VerifiedBadge";

/** WhatsApp business header — the conversation belongs to Piramal Finance. */
export const WhatsAppHeader: React.FC = () => (
  <div
    style={{
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 14px 0 8px",
      background: C.wa.header,
      borderBottom: "1px solid #ECE8E1",
      fontFamily: FONT.sans,
    }}
  >
    <svg width={22} height={22} viewBox="0 0 24 24">
      <path
        d="M15 5l-7 7 7 7"
        fill="none"
        stroke={C.wa.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <PiramalMark size={40} />
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 17, fontWeight: 650, color: C.wa.ink, letterSpacing: "-0.01em" }}>
          Piramal Finance
        </span>
        <VerifiedBadge size={17} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: C.wa.sub }}>Business Account</span>
    </div>
  </div>
);
