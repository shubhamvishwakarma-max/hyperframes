import { chromium } from 'playwright-core';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/index.html');
await p.waitForFunction(() => window.READY === true);
for (const t of times) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `snaps/t${t.toFixed(2)}.png` }); }
await b.close();
