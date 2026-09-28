import React from "react";
import { useCurrentFrame } from "remotion";
import { easeIn, easeInOut, mix, prog } from "../styles/tokens";
import { T } from "../timing";
import { PHONE_H, PHONE_W, PhoneMockup } from "./PhoneMockup";

export const PHONE_S2 = { x: 616, y: 380 };
export const PHONE_S3 = { x: 64, y: 380 };

/**
 * The one WhatsApp phone that persists across scenes 2 and 3 — it morphs out of the
 * WHATSAPP workflow pill, becomes dominant on "WhatsApp", then glides left for routing.
 */
export const PhoneLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = prog(frame, 5.78, 0.7);
  const dominant = prog(frame, T.whatsapp, 0.5) * (1 - prog(frame, T.s3Start - 0.2, 0.5));
  const move = prog(frame, T.s3Start - 0.15, 0.7, easeInOut);
  const exit = prog(frame, 17.85, 0.5, easeIn);
  const glow = prog(frame, T.historyPreserved - 0.05, 0.35) * (1 - prog(frame, T.historyPreserved + 1.1, 0.6));
  if (enter <= 0 || exit >= 1) return null;

  // entry: from the WHATSAPP pill in the centre column
  const fromX = 540 - PHONE_W / 2;
  const fromY = 705 - PHONE_H / 2;
  const x0 = mix(fromX, PHONE_S2.x, enter);
  const y0 = mix(fromY, PHONE_S2.y, enter);
  const x = mix(x0, PHONE_S3.x, move);
  const y = mix(y0, PHONE_S3.y, move);
  const scale = mix(0.42, 1, enter) * (1 + 0.03 * dominant) * mix(1, 0.8, exit);
  const blur = (1 - enter) * 6 + exit * 6 + Math.sin(move * Math.PI) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: PHONE_W,
        height: PHONE_H,
        transform: `scale(${scale})`,
        transformOrigin: "50% 50%",
        opacity: Math.min(1, enter * 1.5) * (1 - exit),
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}
    >
      <PhoneMockup historyGlow={glow} />
    </div>
  );
};
