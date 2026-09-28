import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, prog } from "../lib/anim";
import { ORGANIZE } from "../lib/beats";
import { T } from "../lib/timing";
import { C, EASE, EASE_IO, SHADOW } from "../styles/tokens";
import { AIVoiceCard, AI_CARD } from "./AIVoiceCard";
import { QUEUE_HANDOFF, queueRowY } from "./FollowupStack";
import { CONTEXT_CARD, IntentCard } from "./IntentCard";
import { VALUE_NODE } from "./WorkflowPath";

type Rect = { x: number; y: number; w: number; h: number };
const lerp = (a: Rect, b: Rect, t: number): Rect => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  w: mix(a.w, b.w, t),
  h: mix(a.h, b.h, t),
});

const ROW: Rect = {
  x: 540 - ORGANIZE.queueW / 2,
  y: queueRowY(0) - ORGANIZE.rowH / 2,
  w: ORGANIZE.queueW,
  h: ORGANIZE.rowH,
};
const AI_FULL: Rect = { x: 540 - AI_CARD.w / 2, y: 372, w: AI_CARD.w, h: AI_CARD.h };
const AI_SMALL_SCALE = 0.78;
const AI_SMALL: Rect = {
  x: 540 - (AI_CARD.w * AI_SMALL_SCALE) / 2,
  y: 364,
  w: AI_CARD.w * AI_SMALL_SCALE,
  h: AI_CARD.h * AI_SMALL_SCALE,
};

/**
 * One continuous surface: queue row → AI Voice card → (shrinks for the lifecycle rail)
 * → Customer Context / RM handoff card → compresses into the workflow's RM node.
 */
export const JourneyCard: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < QUEUE_HANDOFF || frame > T.value + 22) return null;

  const expand = prog(frame, QUEUE_HANDOFF, 16, EASE);
  const shrink = prog(frame, T.across, 16, EASE_IO);
  const toContext = prog(frame, T.whatsapp, 18, EASE_IO);
  const toNode = prog(frame, T.value, 18, EASE_IO);

  let r = lerp(ROW, AI_FULL, expand);
  r = lerp(r, AI_SMALL, shrink);
  r = lerp(r, CONTEXT_CARD, toContext);
  r = lerp(r, VALUE_NODE(3), toNode);

  const aiOpacity = prog(frame, QUEUE_HANDOFF + 6, 10) * (1 - prog(frame, T.whatsapp + 3, 8));
  const ctxOpacity = prog(frame, T.whatsapp + 5, 9) * (1 - prog(frame, T.value + 7, 8));
  // AI content keeps its native layout and scales to the surface width.
  const aiScale = r.w / AI_CARD.w;
  const surfaceOpacity = 1 - prog(frame, T.value + 13, 7);

  // Queue depth: two ghost cards trail behind the live AI Voice call until the rail takes over.
  const ghosts = expand * (1 - prog(frame, T.across - 6, 12));

  return (
    <>
      {ghosts > 0 &&
        [2, 1].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: r.x + k * 18,
              top: r.y + r.h - 40 + k * 16,
              width: r.w - k * 36,
              height: 40,
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 16,
              boxShadow: SHADOW.card,
              opacity: ghosts * (k === 1 ? 0.8 : 0.5),
              zIndex: 19 - k,
            }}
          />
        ))}
      <div
        style={{
          position: "absolute",
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: mix(12, 18, expand),
          boxShadow: SHADOW.lift,
          overflow: "hidden",
          opacity: surfaceOpacity,
          zIndex: 20,
        }}
      >
        {aiOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: AI_CARD.w,
              height: AI_CARD.h,
              transform: `scale(${aiScale})`,
              transformOrigin: "top left",
            }}
          >
            <AIVoiceCard opacity={aiOpacity} />
          </div>
        )}
        {ctxOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CONTEXT_CARD.w,
              height: CONTEXT_CARD.h,
              transform: `scale(${r.w / CONTEXT_CARD.w})`,
              transformOrigin: "top left",
            }}
          >
            <IntentCard opacity={ctxOpacity} />
          </div>
        )}
      </div>
    </>
  );
};
