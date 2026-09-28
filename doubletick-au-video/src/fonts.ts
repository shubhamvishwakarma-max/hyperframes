import { useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const faces: Array<[string, string, string]> = [
  ["Geist", "Geist-Regular.woff2", "400"],
  ["Geist", "Geist-Medium.woff2", "500"],
  ["Geist", "Geist-SemiBold.woff2", "600"],
  ["Geist", "Geist-Bold.woff2", "700"],
  ["Geist", "Geist-Black.woff2", "800"],
  ["Geist Mono", "GeistMono-Regular.woff2", "400"],
  ["Geist Mono", "GeistMono-Medium.woff2", "500"],
  ["Geist Mono", "GeistMono-SemiBold.woff2", "600"],
];

let loading: Promise<void> | null = null;

const loadAll = () => {
  if (!loading) {
    loading = Promise.all(
      faces.map(async ([family, file, weight]) => {
        const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, { weight });
        await face.load();
        document.fonts.add(face);
      }),
    ).then(() => undefined);
  }
  return loading;
};

/** Blocks rendering until Geist + Geist Mono (bundled from the `geist` package) are ready. */
export const useBrandFonts = () => {
  const [handle] = useState(() => delayRender("Loading Geist fonts"));
  useState(() => {
    loadAll()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    return null;
  });
};
