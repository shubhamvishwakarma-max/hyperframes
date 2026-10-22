const { chromium } = require('/opt/node22/lib/node_modules/playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});
await p.goto('file://'+path.join(__dirname,'index.html'));await p.evaluate(()=>window.ready);
await p.evaluate(()=>{render(33.8);document.getElementById('subs').style.opacity=0;});
await p.screenshot({path:path.join(__dirname,'poster.png')});await b.close();})();
