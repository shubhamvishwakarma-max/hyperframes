import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { T } from "../lib/timing";
import { C, EASE, EASE_IO, FONT } from "../styles/tokens";

const SIZE = 94;

type Enter = "chars" | "emerge" | "grow";
type Exit = "up" | "back";

/** One line of full-screen ad typography with its own enter/exit transformation. */
const TypeLine: React.FC<{
  text: string;
  y: number;
  color?: string;
  enter: number;
  enterMode?: Enter;
  exit: number;
  exitMode?: Exit;
  frame: number;
}> = ({ text, y, color = C.ink, enter, enterMode = "chars", exit, exitMode = "up", frame }) => {
  if (frame < enter - 1 || frame > exit + 20) return null;
  const e = prog(frame, exit, 14, EASE_IO);
  const exitStyle: React.CSSProperties =
    exitMode === "up"
      ? { transform: `translateY(${-e * 150}px) scale(${mix(1, 0.5, e)})`, opacity: 1 - e }
      : {
          transform: `scale(${mix(1, 0.55, e)})`,
          opacity: 1 - e,
          filter: e > 0 ? `blur(${e * 9}px)` : undefined,
        };

  let inner: React.ReactNode;
  if (enterMode === "chars") {
    inner = text.split("").map((ch, i) => {
      const p = prog(frame, enter + i * 1.1, 14, EASE);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            transform: `translateY(${(1 - p) * 70}%)`,
            opacity: Math.min(1, p * 1.8),
          }}
        >
          {ch}
        </span>
      );
    });
  } else {
    const p = prog(frame, enter, 18, EASE);
    inner = (
      <span
        style={{
          display: "inline-block",
          transform:
            enterMode === "emerge" ? `scale(${mix(1.4, 1, p)})` : `scale(${mix(0.25, 1, p)})`,
          letterSpacing: enterMode === "grow" ? `${mix(0.35, -0.045, p)}em` : undefined,
          filter: p < 1 ? `blur(${(1 - p) * 14}px)` : undefined,
          opacity: Math.min(1, p * 1.6),
        }}
      >
        {text}
      </span>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: FONT.sans,
        fontSize: SIZE,
        fontWeight: 750,
        letterSpacing: "-0.045em",
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        ...exitStyle,
      }}
    >
      <div
        style={{ overflow: enterMode === "chars" ? "hidden" : "visible", paddingBottom: "0.08em" }}
      >
        {inner}
      </div>
    </div>
  );
};

/** Background pattern the repetitive work recedes into. */
const Pattern: React.FC<{ frame: number }> = ({ frame }) => {
  const o =
    prog(frame, T.escalate - 2, 14) *
    mix(1, 0.45, prog(frame, T.letRMs, 14)) *
    (1 - prog(frame, T.cta, 12));
  if (o <= 0) return null;
  const row = Array.from({ length: 6 })
    .map(() => "REPETITIVE")
    .join("   ");
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: o }}>
      {Array.from({ length: 9 }).map((_, r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            top: 40 + r * 112,
            left: -400,
            whiteSpace: "nowrap",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: "-0.04em",
            color: C.ink,
            opacity: 0.035,
            transform: `translateX(${(r % 2 === 0 ? -1 : 1) * (frame - T.escalate) * 1.4 + (r % 2) * -180}px)`,
          }}
        >
          {row}
        </div>
      ))}
    </div>
  );
};

/** Automate the repetitive. Escalate what matters. Let RMs focus on value. */
export const CoreValueScene: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.automateRep - 2 || frame > T.cta + 24) return null;
  const out = prog(frame, T.cta - 2, 9, EASE_IO);
  const y1 = 330;
  const y2 = 440;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 1 - out,
        transform: `scale(${mix(1, 0.94, out)})`,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
      }}
    >
      <Pattern frame={frame} />
      <TypeLine
        frame={frame}
        text="AUTOMATE"
        color={C.green}
        y={y1}
        enter={T.automateRep}
        exit={T.escalate}
        exitMode="up"
      />
      <TypeLine
        frame={frame}
        text="THE REPETITIVE."
        y={y2}
        enter={T.automateRep + 5}
        exit={T.escalate - 2}
        exitMode="back"
      />
      <TypeLine
        frame={frame}
        text="ESCALATE"
        y={y1}
        enter={T.escalate + 2}
        exit={T.letRMs}
        exitMode="up"
      />
      <TypeLine
        frame={frame}
        text="WHAT MATTERS."
        color={C.green}
        y={y2}
        enter={T.escalate + 4}
        enterMode="emerge"
        exit={T.letRMs - 2}
        exitMode="back"
      />
      <TypeLine frame={frame} text="LET RMs" y={y1} enter={T.letRMs + 2} exit={T.cta + 40} />
      {/* FOCUS ON + VALUE. — VALUE grows from its centre */}
      {frame >= T.letRMs + 4 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y2,
            display: "flex",
            justifyContent: "center",
            gap: "0.26em",
            fontFamily: FONT.sans,
            fontSize: SIZE,
            fontWeight: 750,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              overflow: "hidden",
              paddingBottom: "0.08em",
              color: C.ink,
            }}
          >
            {"FOCUS ON".split("").map((ch, i) => {
              const p = prog(frame, T.letRMs + 6 + i * 1.1, 14, EASE);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    transform: `translateY(${(1 - p) * 70}%)`,
                    opacity: Math.min(1, p * 1.8),
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {(() => {
            const p = prog(frame, T.letRMs + 12, 18, EASE);
            return (
              <span
                style={{
                  display: "inline-block",
                  color: C.green,
                  transform: `scale(${mix(0.25, 1, p)})`,
                  letterSpacing: `${mix(0.3, -0.045, p)}em`,
                  filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
                  opacity: Math.min(1, p * 1.6),
                }}
              >
                VALUE.
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
};
