import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { BrandBar } from "./components/BrandBar";
import { PhoneLayer } from "./components/PhoneLayer";
import { useBrandFonts } from "./fonts";
import { CTAScene } from "./scenes/CTAScene";
import { HookScene } from "./scenes/HookScene";
import { ImpactScene } from "./scenes/ImpactScene";
import { ReengagementScene } from "./scenes/ReengagementScene";
import { RMRoutingScene } from "./scenes/RMRoutingScene";
import { ValueScene } from "./scenes/ValueScene";
import { s } from "./styles/tokens";
import { T } from "./timing";

/** Mounts children only inside [from, to) seconds; children keep using the absolute timeline. */
const Window: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < s(from) || frame >= s(to)) return null;
  return <>{children}</>;
};

export const AULeadGenVideo: React.FC = () => {
  useBrandFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F4EFE6" }}>
      <Background />
      <Window from={0} to={6.4}>
        <HookScene />
      </Window>
      <Window from={5.6} to={11.9}>
        <ReengagementScene />
      </Window>
      <Window from={11.2} to={18.4}>
        <RMRoutingScene />
      </Window>
      <Window from={5.7} to={18.4}>
        <PhoneLayer />
      </Window>
      <Window from={17.8} to={25.6}>
        <ImpactScene />
      </Window>
      <Window from={24.9} to={T.end}>
        <ValueScene />
      </Window>
      <Window from={28.9} to={T.end}>
        <CTAScene />
      </Window>
      <BrandBar />

      {/* Stems are pre-aligned to the timeline by scripts/build_audio.py (VO offset, music ducking, SFX sync). */}
      <Audio src={staticFile("audio/narration.mp3")} />
      <Audio src={staticFile("audio/music.mp3")} />
      <Audio src={staticFile("audio/sfx.wav")} />
    </AbsoluteFill>
  );
};
