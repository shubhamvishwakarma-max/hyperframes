const { chromium } = require('/opt/node22/lib/node_modules/playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const FMT=process.env.FMT||'sq';const SZ={sq:[1080,1080,1080],portrait:[1080,1350,1080],land:[1920,1080,1920],wide:[2201,1080,1280]}[FMT];
const p=await b.newPage({viewport:{width:SZ[0],height:SZ[1]},deviceScaleFactor:SZ[2]/SZ[0]});
await p.goto('file://'+path.join(__dirname,'index.html')+'?fmt='+FMT);await p.evaluate(()=>window.ready);
await p.evaluate(()=>{render(33.8);document.getElementById('subs').style.opacity=0;});
await p.screenshot({path:path.join(__dirname,`poster_${FMT}.png`)});await b.close();})();
