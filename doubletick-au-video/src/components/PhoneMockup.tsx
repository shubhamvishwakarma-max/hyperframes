import React from "react";
import { colors, fonts } from "../styles/tokens";
import { T } from "../timing";
import { ChatBubble, TypingIndicator } from "./ChatBubble";
import { WhatsAppHeader } from "./WhatsAppHeader";

export const PHONE_W = 400;
export const PHONE_H = 640;

/** Customer-side WhatsApp conversation with AU Small Finance Bank (powered by DoubleTick behind the scenes). */
export const PhoneMockup: React.FC<{ historyGlow?: number }> = ({ historyGlow = 0 }) => (
  <div
    style={{
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 50,
      background: "#1E2320",
      padding: 10,
      boxShadow:
        "0 40px 80px -30px rgba(30,35,32,0.45), 0 12px 24px -12px rgba(30,35,32,0.25), inset 0 0 0 1.5px #3A403C",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 41,
        overflow: "hidden",
        background: colors.waBg,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* status bar */}
      <div
        style={{
          height: 38,
          background: colors.waHeader,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 26px 0",
          fontFamily: fonts.sans,
          fontWeight: 600,
          fontSize: 15,
          color: colors.ink,
        }}
      >
        <span>10:42</span>
        <div style={{ width: 96, height: 26, borderRadius: 20, background: "#1E2320", marginTop: 2 }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="18" height="12" viewBox="0 0 18 12">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 4.6} y={9 - i * 3} width="3.2" height={3 + i * 3} rx="1" fill={colors.ink} />
            ))}
          </svg>
          <div style={{ width: 24, height: 12, borderRadius: 3.5, border: `1.5px solid ${colors.ink}`, padding: 1.5 }}>
            <div style={{ width: "72%", height: "100%", background: colors.ink, borderRadius: 1.5 }} />
          </div>
        </div>
      </div>
      <WhatsAppHeader />
      {/* chat */}
      <div
        style={{
          flex: 1,
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          backgroundImage: "radial-gradient(rgba(120,100,70,0.08) 1.2px, transparent 1.3px)",
          backgroundSize: "18px 18px",
          position: "relative",
        }}
      >
        <div
          style={{
            alignSelf: "center",
            fontFamily: fonts.sans,
            fontSize: 13,
            color: "#6E6A62",
            background: "rgba(255,255,255,0.85)",
            padding: "5px 12px",
            borderRadius: 8,
            marginBottom: 4,
          }}
        >
          Today
        </div>
        <ChatBubble at={T.msg1} time="10:41" text="Hi Arjun, we're following up on your loan enquiry." glow={historyGlow} />
        <ChatBubble at={T.msg2} time="10:41" text="Would you like to continue here on WhatsApp?" glow={historyGlow} />
        <TypingIndicator from={T.msg2 + 0.35} to={T.reply} />
        <ChatBubble at={T.reply} time="10:42" outgoing text="Yes, I'm still interested." glow={historyGlow} />
      </div>
      {/* input bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 18px" }}>
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            fontFamily: fonts.sans,
            fontSize: 16,
            color: "#9A9A94",
          }}
        >
          Message
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "#1FA855",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);
