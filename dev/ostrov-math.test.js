// Тест на math: за всяка трудност 1..5 играе един рунд с data-ok. node ostrov-math.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  let fail=0;
  for(let diff=1;diff<=5;diff++){
    const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text());});
    await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?act=math&diff='+diff,{waitUntil:'load'});
    await new Promise(r=>setTimeout(r,500));
    const i0=await p.evaluate(()=>window.__capy.run.i);
    let clicks=0,advanced=false,wrongTried=false;
    const t0=Date.now();
    while(Date.now()-t0<90000){
      const i=await p.evaluate(()=>window.__capy.run&&window.__capy.run.i);
      if(i>i0){advanced=true;break;}
      if(!wrongTried){ // веднъж натисни грешен отговор: трябва да остане въпрос
        wrongTried=await p.evaluate(()=>{const w=[...document.querySelectorAll('#stage .math-ans>*')].find(x=>!x.dataset.ok&&!x.classList.contains('dim'));if(w){w.click();return true;}return false;});
      }
      const c=await p.evaluate(()=>{const o=document.querySelector('#stage [data-ok="1"]:not(.ok)');if(o){o.click();return 1;}return 0;});
      clicks+=c;await new Promise(r=>setTimeout(r,c?900:250));
    }
    const ok=advanced&&clicks>=4&&!errs.length;
    console.log(`diff ${diff}: ${ok?'PASS':'FAIL'} clicks=${clicks} advanced=${advanced} errs=${errs.join('|')}`);
    if(!ok)fail++;await p.close();
  }
  await b.close();process.exit(fail?1:0);
})();
