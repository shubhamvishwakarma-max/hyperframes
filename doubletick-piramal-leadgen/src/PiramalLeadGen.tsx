import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { Backdrop } from "./components/Backdrop";
import { BrandBar } from "./components/BrandBar";
import { Subtitle } from "./components/Subtitle";
import { WorkflowPath } from "./components/WorkflowPath";
import { SFX } from "./lib/sfx";
import { DURATION, NARRATION_FILE, NARRATION_OFFSET, isSpeaking } from "./lib/timing";
import { AIOutreachScene } from "./scenes/AIOutreachScene";
import { CoreValueScene } from "./scenes/CoreValueScene";
import { CTAScene } from "./scenes/CTAScene";
import { HookScene } from "./scenes/HookScene";
import { RMHandoffScene } from "./scenes/RMHandoffScene";
import { ValueScene } from "./scenes/ValueScene";
import { WhatsAppScene } from "./scenes/WhatsAppScene";
import { ensureFonts } from "./styles/fonts";

ensureFonts();

/** Precomputed ducking envelope: music dips under narration, smoothed so it never pumps. */
const DUCK: number[] = (() => {
  const raw = Array.from({ length: DURATION }, (_, f) => (isSpeaking(f) ? 1 : 0));
  const out: number[] = [];
  let v = 0;
  for (let f = 0; f < DURATION; f++) {
    const target = raw[f];
    v += (target - v) * (target > v ? 0.35 : 0.08); // fast attack, slow release
    out.push(v);
  }
  return out;
})();

const musicVolume = (f: number) => {
  const fadeIn = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [DURATION - 24, DURATION - 1], [1, 0], {
    extrapolateLeft: "clamp",
  });
  // Level lift across the arc; CTA simplifies (handled in the music itself).
  const duck = DUCK[Math.min(DURATION - 1, Math.max(0, f))] ?? 0;
  const bed = 0.5 - 0.22 * duck; // relative to the pre-levelled bed from scripts/generate_audio.py
  return fadeIn * fadeOut * bed;
};

export const PiramalLeadGen: React.FC = () => (
  <AbsoluteFill style={{ background: "#F4F4EC" }}>
    <Backdrop />
    <HookScene />
    <AIOutreachScene />
    <WhatsAppScene />
    <RMHandoffScene />
    <WorkflowPath />
    <ValueScene />
    <CoreValueScene />
    <CTAScene />
    <BrandBar />
    <Subtitle />

    <Sequence from={NARRATION_OFFSET} layout="none">
      <Audio src={staticFile(NARRATION_FILE)} volume={1} />
    </Sequence>
    <Audio src={staticFile("audio/music.wav")} volume={musicVolume} />
    {SFX.map((s, i) => (
      <Sequence
        key={i}
        from={Math.max(0, s.at)}
        durationInFrames={Math.max(1, DURATION - Math.max(0, s.at))}
        layout="none"
      >
        <Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.gain} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
