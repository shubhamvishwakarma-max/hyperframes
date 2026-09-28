import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../lib/anim";
import { CHAT } from "../lib/beats";
import { T } from "../lib/timing";
import { C, FONT, SHADOW } from "../styles/tokens";
import { ChatBubble, TypingBubble } from "./ChatBubble";
import { IconPhone } from "./Icons";
import { WhatsAppHeader } from "./WhatsAppHeader";

export const PHONE = { x: 44, y: 294, w: 420, h: 612, bezel: 9 };

/** Approximate on-canvas anchor of the customer's reply bubble (right edge, vertical centre). */
export const REPLY_ANCHOR: [number, number] = [PHONE.x + PHONE.w - PHONE.bezel - 12, 659];

const MsgSlot: React.FC<{ children: React.ReactNode; minH: number }> = ({ children, minH }) => (
  <div style={{ position: "relative", minHeight: minH, display: "flex", flexDirection: "column" }}>
    {children}
  </div>
);

/** Premium generic phone running WhatsApp: Piramal Finance business chat with Rohan. */
export const PhoneMockup: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const frame = useCurrentFrame();
  const chipP = prog(frame, T.whatsapp + 2, 10);
  const glow = prog(frame, CHAT.pulse - 3, 5) * (1 - prog(frame, CHAT.pulse + 10, 12));
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE.x,
        top: PHONE.y,
        width: PHONE.w,
        height: PHONE.h,
        borderRadius: 52,
        background: "#1D1F1C",
        padding: PHONE.bezel,
        boxSizing: "border-box",
        boxShadow: SHADOW.phone,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 44,
          overflow: "hidden",
          background: C.wa.chatBg,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Minimal status bar */}
        <div
          style={{
            height: 38,
            background: C.wa.header,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 26px 0 30px",
            fontFamily: FONT.sans,
            fontSize: 14,
            fontWeight: 650,
            color: C.wa.ink,
          }}
        >
          <span>9:41</span>
          <div
            style={{
              width: 84,
              height: 24,
              borderRadius: 14,
              background: "#111",
              position: "absolute",
              left: "50%",
              marginLeft: -42,
              top: 9,
            }}
          />
          <div
            style={{
              width: 24,
              height: 11,
              borderRadius: 3,
              border: "1.5px solid #111",
              padding: 1.5,
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: "72%", height: "100%", background: "#111", borderRadius: 1 }} />
          </div>
        </div>
        <WhatsAppHeader />

        {/* Chat */}
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            backgroundImage: `radial-gradient(${C.ink}0d 1px, transparent 1.2px)`,
            backgroundSize: "18px 18px",
          }}
        >
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              borderRadius: 10,
              background: "#FFFFFFE6",
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 550,
              color: C.wa.sub,
              marginBottom: 6,
              opacity: chipP,
              transform: `translateY(${(1 - chipP) * 6}px)`,
            }}
          >
            <IconPhone size={14} color={C.green} />
            AI Voice call · Connected
          </div>
          <MsgSlot minH={84}>
            <TypingBubble frame={frame} from={CHAT.typing1} to={CHAT.msg1} />
            <ChatBubble
              frame={frame}
              at={CHAT.msg1}
              text="Hi Rohan, your loan application is still incomplete."
            />
          </MsgSlot>
          <MsgSlot minH={50}>
            <TypingBubble frame={frame} from={CHAT.typing2} to={CHAT.msg2} />
            <ChatBubble frame={frame} at={CHAT.msg2} text="Would you like help continuing?" />
          </MsgSlot>
          <MsgSlot minH={50}>
            <ChatBubble
              frame={frame}
              at={CHAT.reply}
              outgoing
              text="Yes, I need help."
              glow={glow}
            />
          </MsgSlot>
        </div>

        {/* Input bar */}
        <div
          style={{
            height: 62,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 10px 6px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 42,
              borderRadius: 21,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontFamily: FONT.sans,
              fontSize: 15,
              color: "#9AA3A8",
            }}
          >
            Message
          </div>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: C.wa.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24">
              <rect x="9" y="3" width="6" height="12" rx="3" fill="#fff" />
              <path
                d="M6 11a6 6 0 0 0 12 0M12 17v4"
                stroke="#fff"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
