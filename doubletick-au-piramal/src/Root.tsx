import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, H, W, sec, totalSec } from "./theme";

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={sec(totalSec)} fps={FPS} width={W} height={H} />
);
