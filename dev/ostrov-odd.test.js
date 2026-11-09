// Тест на „odd": node ostrov-odd.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  let fail=0;
  for(let d=1;d<=5;d++){for(const [w,h] of [[390,844],[844,390]]){
    const p=await b.newPage();await p.setViewport({width:w,height:h,hasTouch:true});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text()))errs.push(m.text());});
    await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?act=odd&diff='+d,{waitUntil:'load'});
    await sleep(500);
    let i=0,clicks=0,overflow=false;
    for(let t=0;t<200&&!i;t++){
      const r=await p.evaluate(()=>{const e=document.querySelector('[data-ok="1"]:not([data-done]):not(.found)');
        const s=document.getElementById('stage');const bad=!s.classList.contains("out")&&[...s.querySelectorAll("button:not(.ok):not(.found):not(.hint):not(.no)")].some(x=>{const a=x.getBoundingClientRect(),b=s.getBoundingClientRect();return a.right>b.right+1||a.bottom>b.bottom+1||a.left<b.left-1||a.top<b.top-1;});
        if(e)e.click();return {i:window.__capy.run.i,bad};});
      if(r.bad&&t>4)overflow=true;i=r.i;clicks++;await sleep(180);
    }
    const res=i>=1&&!errs.length&&!overflow;if(!res)fail++;
    console.log('diff',d,w+'x'+h,res?'OK':'FAIL','run.i',i,'clicks',clicks,overflow?'OVERFLOW':'',errs.join('|'));
    await p.close();
  }}
  await b.close();process.exit(fail?1:0);
})();
