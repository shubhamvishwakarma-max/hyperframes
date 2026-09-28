import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

let loaded = false;

/** Loads Geist + Geist Mono (variable woff2, copied from the `geist` package into public/fonts). */
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  void loadFont({
    family: "Geist",
    url: staticFile("fonts/Geist-Variable.woff2"),
    weight: "100 900",
    format: "woff2",
  });
  void loadFont({
    family: "Geist Mono",
    url: staticFile("fonts/GeistMono-Variable.woff2"),
    weight: "100 900",
    format: "woff2",
  });
};
