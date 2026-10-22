const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path=require('path');
const [mode, ...rest]=process.argv.slice(2);
const FMT=process.env.FMT||'sq';const SZ={sq:[1080,1080,1080,1080],portrait:[1080,1350,1080,1350],land:[1920,1080,1920,1080],wide:[2201,1080,1280,628],vert:[1080,1920,1080,1920]}[FMT];
(async()=>{
  const b=await chromium.launch({args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:SZ[0],height:SZ[1]},deviceScaleFactor:SZ[2]/SZ[0]});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('file://'+path.join(__dirname,'index.html')+'?fmt='+FMT);
  await p.evaluate(()=>window.ready);
  if(mode==='stills'){
    for(const t of rest){await p.evaluate(t=>render(+t),t);await p.screenshot({path:path.join(__dirname,'stills',`${FMT}_t${(+t).toFixed(2)}.png`)});}
  } else {
    const fps=30,dur=+rest[0],out=rest[1];
    const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-vf',`scale=${SZ[2]}:${SZ[3]}:flags=lanczos`,'-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p',out],{stdio:['pipe','inherit','inherit']});
    const N=Math.round(dur*fps);
    for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%150==0)console.log('frame',i,'/',N);}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
