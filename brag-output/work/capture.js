const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path=require('path');
const [mode, ...rest]=process.argv.slice(2);
(async()=>{
  const b=await chromium.launch({args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:1080,height:1080},deviceScaleFactor:1});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+path.join(__dirname,'index.html'));
  await p.evaluate(()=>window.ready);
  if(mode==='stills'){
    for(const t of rest){await p.evaluate(t=>render(+t),t);await p.screenshot({path:path.join(__dirname,'stills',`t${(+t).toFixed(2)}.png`)});}
  } else {
    const fps=30,dur=+rest[0],out=rest[1];
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
    const N=Math.round(dur*fps);
    for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
