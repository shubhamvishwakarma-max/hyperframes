import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, FPS, SECTIONS, cues, sec, totalSec } from "./theme";
import { DoubleTickLogo, progressAt } from "./ui";
import { Hook } from "./scenes/Hook";
import { CustomerStory } from "./scenes/CustomerStory";
import { Solution } from "./scenes/Solution";
import { Cta } from "./scenes/Cta";
import audioAssets from "./audio-assets.json";

const FONTS: [string, string, string][] = [
  ["Geist", "fonts/Geist-Regular.woff2", "400"],
  ["Geist", "fonts/Geist-Medium.woff2", "500"],
  ["Geist", "fonts/Geist-SemiBold.woff2", "600"],
  ["Geist", "fonts/Geist-Bold.woff2", "700"],
  ["Geist Mono", "fonts/GeistMono-Medium.woff2", "500"],
  ["Geist Mono", "fonts/GeistMono-SemiBold.woff2", "600"],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) => {
        const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
        return face.load().then((f) => document.fonts.add(f));
      }),
    ).then(() => continueRender(handle));
  }, [handle]);
};

/** Section wrapper: visible inside [a, b] with short cross-fades. */
const Section: React.FC<{ t: number; range: readonly [number, number]; last?: boolean; children: React.ReactNode }> = ({
  t,
  range,
  last,
  children,
}) => {
  const [a, b] = range;
  if (t < a - 0.01 || (!last && t > b + 0.35)) return null;
  const fin = a <= 0 ? 1 : progressAt(t, a, 0.35);
  const fout = last ? 1 : 1 - progressAt(t, b, 0.35);
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

// UI sound design, anchored to narration cues (seconds)
const SFX: [string, number, number][] = [
  ["sfx/tick.wav", 1.1, 0.5],
  ["sfx/tick.wav", 2.4, 0.4],
  ["sfx/tick.wav", 3.7, 0.4],
  ["sfx/connect.wav", cues.auDoubleTick, 0.55],
  ["sfx/message.wav", cues.auWhatsApp, 0.45],
  ["sfx/message.wav", cues.auWhatsApp + 0.85, 0.35],
  ["sfx/message.wav", cues.auWhatsApp + 1.7, 0.45],
  ["sfx/reveal.wav", cues.auMetric, 0.5],
  ["sfx/done.wav", cues.auRm, 0.55],
  ["sfx/connect.wav", cues.pChannels, 0.5],
  ["sfx/tick.wav", cues.pChip1, 0.4],
  ["sfx/tick.wav", cues.pChip2, 0.4],
  ["sfx/tick.wav", cues.pChip3, 0.4],
  ["sfx/tick.wav", cues.pChip4, 0.4],
  ["sfx/reveal.wav", cues.pMetric, 0.5],
  ["sfx/done.wav", SECTIONS.solution[0] + 1.0 + 0.55 * 4, 0.45],
  ["sfx/done.wav", SECTIONS.cta[0] + 0.8, 0.5],
];

export const Main: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const logoIn = interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const total = sec(totalSec);

  return (
    <AbsoluteFill style={{ background: C.beige, overflow: "hidden" }}>
      {/* soft warm depth, very subtle */}
      <div style={{ position: "absolute", width: 900, height: 900, right: -420, top: -460, borderRadius: "50%", background: "radial-gradient(circle, #F9F7F1 0%, rgba(249,247,241,0) 70%)" }} />
      <div style={{ position: "absolute", width: 760, height: 760, left: -380, bottom: -420, borderRadius: "50%", background: "radial-gradient(circle, #EBE6DA 0%, rgba(235,230,218,0) 70%)" }} />

      <Section t={t} range={SECTIONS.hook}>
        <Hook t={t} />
      </Section>
      <Section t={t} range={[SECTIONS.au[0], SECTIONS.piramal[1]]}>
        <CustomerStory t={t} />
      </Section>
      <Section t={t} range={SECTIONS.solution}>
        <Solution t={t} />
      </Section>
      <Section t={t} range={SECTIONS.cta} last>
        <Cta t={t} />
      </Section>

      {/* persistent DoubleTick logo */}
      <div style={{ position: "absolute", left: 52, top: 42, opacity: logoIn }}>
        <DoubleTickLogo width={158} />
      </div>

      {audioAssets.narration ? (
        <Sequence from={sec(audioAssets.narrationOffsetSec)}>
          <Audio src={staticFile("audio/narration.mp3")} />
        </Sequence>
      ) : null}
      {audioAssets.music ? (
        <Audio
          src={staticFile("audio/music.mp3")}
          volume={(f) => {
            const s = f / FPS;
            const fadeIn = interpolate(s, [0, 0.8], [0, 1], { extrapolateRight: "clamp" });
            const fadeOut = interpolate(s, [totalSec - 1.6, totalSec], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            // sit low under narration, lift slightly on the CTA hold
            const bed = s > SECTIONS.cta[0] + 1.6 ? 0.2 : 0.1;
            return bed * fadeIn * fadeOut;
          }}
        />
      ) : null}
      {audioAssets.sfx
        ? SFX.map(([file, at, vol], i) =>
            at * FPS < total ? (
              <Sequence key={i} from={sec(at)} durationInFrames={sec(1)}>
                <Audio src={staticFile(file)} volume={vol} />
              </Sequence>
            ) : null,
          )
        : null}
    </AbsoluteFill>
  );
};
