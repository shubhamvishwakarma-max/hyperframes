import React from "react";
import { Composition } from "remotion";
import { AULeadGenVideo } from "./AULeadGenVideo";
import { DURATION_SECONDS, FPS, HEIGHT, WIDTH } from "./styles/tokens";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AULeadGenVideo"
    component={AULeadGenVideo}
    durationInFrames={DURATION_SECONDS * FPS}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
