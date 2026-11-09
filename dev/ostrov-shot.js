// Екранна снимка на острова: node ostrov-shot.js "<query>" out.png [w] [h] [waitMs] [clickSelector...]
const puppeteer=require('puppeteer-core');const path=require('path');
(async()=>{
  const [q='',out='shots/ostrov.png',w='390',h='844',wait='600',...clicks]=process.argv.slice(2);
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files']});
  const p=await b.newPage();await p.setViewport({width:+w,height:+h,deviceScaleFactor:1,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push('[pageerror] '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push('[console] '+m.text());});
  await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+(q?'?'+q:''),{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,+wait));
  for(const c of clicks){if(/^\d+$/.test(c)){await new Promise(r=>setTimeout(r,+c));continue;}
    try{await p.click(c);}catch(e){errs.push('click fail '+c+': '+e.message);}await new Promise(r=>setTimeout(r,500));}
  await p.screenshot({path:out});
  console.log(errs.length?errs.join('\n'):'no errors');await b.close();
})();
