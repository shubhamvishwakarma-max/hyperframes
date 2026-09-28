import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { T } from "../lib/timing";
import { EASE, EASE_IO, LAYOUT } from "../styles/tokens";
import { DoubleTickLogo } from "./DoubleTickLogo";
import { PiramalLogo } from "./PiramalLogo";

const DT_H = 34;
const CTA_H = 58;

/** DoubleTick top-left throughout; Piramal top-right for the Piramal story; DoubleTick owns the CTA. */
export const BrandBar: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = prog(frame, 0, 14);
  const toCta = prog(frame, T.cta, 20, EASE_IO);
  const h = mix(DT_H, CTA_H, toCta);
  const w = h * (287 / 52);
  const x = mix(LAYOUT.logoLeft, 540 - (CTA_H * (287 / 52)) / 2, toCta);
  const y = mix(LAYOUT.logoTop, 150, toCta);

  const pfIn = prog(frame, T.piramal, 16, EASE);
  const pfOut = prog(frame, T.cta - 2, 12, EASE_IO);

  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, opacity: inP, zIndex: 150 }}>
        <DoubleTickLogo height={h} />
      </div>
      {pfIn > 0 && pfOut < 1 && (
        <div
          style={{
            position: "absolute",
            right: LAYOUT.logoLeft,
            top: LAYOUT.logoTop - 12,
            opacity: pfIn * (1 - pfOut),
            transform: `translateY(${(1 - pfIn) * -10 - pfOut * 10}px)`,
            clipPath: `inset(0 0 0 ${(1 - pfIn) * 100}%)`,
            zIndex: 150,
          }}
        >
          <PiramalLogo height={58} />
        </div>
      )}
    </>
  );
};
