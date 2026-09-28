import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";

const times = process.argv.slice(2).map(Number);
const browserExecutable = process.env.REMOTION_CHROME || null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "AULeadGenVideo", browserExecutable });
for (const t of times) {
  const frame = Math.round(t * 30);
  const output = path.resolve(`out/stills/t${t.toFixed(2)}.jpg`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "jpeg", jpegQuality: 85, browserExecutable });
  console.log(output);
}
