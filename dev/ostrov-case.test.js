// Тест на „case": node ostrov-case.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  let fail=0;
  for(let d=1;d<=5;d++){
    const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text()))errs.push(m.text());});
    await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?act=case&diff='+d,{waitUntil:'load'});
    await sleep(500);
    let i=0,wrongTried=false,tf=true;
    for(let t=0;t<120&&!i;t++){
      const r=await p.evaluate(()=>{const e=document.querySelector('#stage [data-ok="1"]:not(.ok):not(.used)');
        const s=document.querySelector('.case-root');const cs=s?getComputedStyle(s):null;
        if(e)e.click();return {i:window.__capy.run.i,tt:cs?cs.textTransform:'none',fs:cs?cs.fontStyle:'normal'};});
      if(r.tt!=='none'||r.fs!=='normal')tf=false;
      i=r.i;await sleep(220);
    }
    const res=i>=1&&!errs.length&&tf;if(!res)fail++;
    console.log('diff',d,res?'OK':'FAIL','run.i',i,tf?'':'TEXT-TRANSFORM',errs.join('|'));
    await p.close();
  }
  await b.close();process.exit(fail?1:0);
})();
