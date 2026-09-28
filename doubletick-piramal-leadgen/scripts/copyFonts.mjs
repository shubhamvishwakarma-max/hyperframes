// Copies Geist + Geist Mono variable fonts from the `geist` package into public/fonts.
import { copyFileSync, mkdirSync } from "node:fs";

const src = "node_modules/geist/dist/fonts";
mkdirSync("public/fonts", { recursive: true });
copyFileSync(`${src}/geist-sans/Geist-Variable.woff2`, "public/fonts/Geist-Variable.woff2");
copyFileSync(`${src}/geist-mono/GeistMono-Variable.woff2`, "public/fonts/GeistMono-Variable.woff2");
console.log("Fonts copied to public/fonts");
