import React from "react";
import { Composition } from "remotion";
import { PiramalLeadGen } from "./PiramalLeadGen";
import { DURATION } from "./lib/timing";
import { FPS, SIZE } from "./styles/tokens";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PiramalLeadGen"
    component={PiramalLeadGen}
    durationInFrames={DURATION}
    fps={FPS}
    width={SIZE}
    height={SIZE}
  />
);
