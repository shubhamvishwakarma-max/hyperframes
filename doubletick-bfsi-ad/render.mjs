import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const [,, mode, arg] = process.argv; // mode: snap "t1,t2" | video out.mp4
const FF = process.env.FF;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto('file://' + process.cwd() + '/index.html');
await page.evaluate(() => window.__ready);
if (mode === 'snap') {
  for (const t of arg.split(',')) {
    await page.evaluate(t => window.seek(t), +t);
    await page.screenshot({ path: `snap_${t}.png` });
  }
} else {
  const dur = await page.evaluate(() => window.DURATION);
  const n = Math.round(dur * 30);
  const ff = spawn(FF, ['-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-r','30', arg], { stdio: ['pipe','inherit','inherit'] });
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.seek(t), i / 30);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log('frame', i, '/', n);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
