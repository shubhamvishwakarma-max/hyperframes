import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const FPS = 30, DUR = 94.5, TOTAL = Math.round(DUR * FPS), W = +process.argv[2] || 4;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const per = Math.ceil(TOTAL / W);
await Promise.all([...Array(W)].map(async (_, w) => {
  const s = w * per, e = Math.min(TOTAL, s + per);
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.goto('file://' + process.cwd() + '/index.html'); await p.waitForFunction(() => window.READY === true);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', `seg${w}.mp4`]);
  for (let i = s; i < e; i++) {
    await p.evaluate(t => window.seek(t), i / FPS);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log('frame', i);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}));
await b.close(); console.log('done');
