import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, mode, outDir] = process.argv; // mode: "stills" or "all"
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('file://' + process.cwd() + '/brag.html');
await page.evaluate(() => window.ready);
const times = mode === 'all' ? Array.from({ length: 300 }, (_, i) => i / 30) : mode.split(',').map(Number);
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  await page.evaluate((t) => window.render(t), t);
  const name = mode === 'all' ? `f${String(i).padStart(4, '0')}.png` : `t${t.toFixed(2)}.png`;
  await page.screenshot({ path: `${outDir}/${name}` });
}
await browser.close();
