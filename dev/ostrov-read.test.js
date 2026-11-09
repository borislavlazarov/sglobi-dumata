// Тест за „Прочети и намери" (ostrov/act-read.js): за всяко diff 1..5 изиграва цял рунд чрез data-ok.
// Пуск: cd dev && node ostrov-read.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
const ACT='read';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0;const check=(name,ok,det='')=>{console.log((ok?'PASS  ':'FAIL  ')+name+(ok||!det?'':' — '+det));if(!ok)fails++;};

async function playRound(b,query,{wrongFirst=false,inspect}={}){
  const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:1,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|net::/.test(m.text()))errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?'+query,{waitUntil:'load'});
  await sleep(500);
  const info={questions:0,issues:[],wrongTested:false};
  const t0=Date.now();
  while(Date.now()-t0<90000){
    const st=await p.evaluate(()=>({i:window.__capy.run?window.__capy.run.i:-1,m:window.__capy.run?window.__capy.run.mistakes:-1}));
    if(st.i>=1){info.mistakes=st.m;break;}
    const h=await p.$('#stage button[data-ok="1"]:not(.ok):not([disabled]):not(.dim)');
    if(!h){await sleep(150);continue;}
    if(inspect){const iss=await p.evaluate(inspect);if(iss)info.issues.push(iss);}
    if(wrongFirst&&!info.wrongTested){
      const w=await p.$('#stage button:not([data-ok]):not([disabled]):not(.dim)');
      if(w){await w.click();await sleep(300);
        const m=await p.evaluate(()=>window.__capy.run.mistakes);
        info.wrongTested=m===1;}
    }
    await h.click();info.questions++;await sleep(200);
  }
  const fin=await p.evaluate(()=>window.__capy.run?window.__capy.run.i:-1);
  await p.close();
  return {...info,advanced:fin>=1,errs};
}

(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  // при всеки въпрос: опциите да са с различни картинки/текстове, точно една вярна
  const inspect=()=>{const bs=[...document.querySelectorAll('#stage .read-opts button')];
    const keys=bs.map(b=>b.innerHTML);const ok=bs.filter(b=>b.dataset.ok==='1').length;
    if(new Set(keys).size!==keys.length)return 'duplicate options';if(ok!==1)return 'ok count '+ok;
    const q=document.querySelector('#stage .read-q');
    if(q&&!window.__capy.run)return null;return null;};
  for(let d=1;d<=5;d++){
    const r=await playRound(b,`act=${ACT}&diff=${d}`,{wrongFirst:d===2,inspect});
    check(`diff ${d}: round completed (run.i advanced)`,r.advanced);
    check(`diff ${d}: no page errors`,r.errs.length===0,r.errs.join(' | '));
    check(`diff ${d}: 4 questions answered`,r.questions===4,'answered '+r.questions);
    check(`diff ${d}: options sane`,r.issues.length===0,r.issues.join(', '));
    if(d===2)check(`diff 2: a wrong tap counts as a mistake and does not advance`,r.wrongTested&&r.mistakes===1);
    else check(`diff ${d}: no mistakes when playing data-ok`,r.mistakes===0,'mistakes '+r.mistakes);
  }
  // главни/малки букви: level 1 → ГЛАВНИ, level 6 → изреченски регистър
  for(const [lv,caps] of [[1,true],[6,false]]){
    const p=await b.newPage();await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+`?act=${ACT}&diff=3&level=${lv}`,{waitUntil:'load'});await sleep(400);
    const t=await p.$eval('#stage .read-q',e=>e.textContent);await p.close();
    check(`level ${lv}: text is ${caps?'ALL CAPS':'sentence case'} („${t}")`,caps?t===t.toUpperCase():(t!==t.toUpperCase()&&t[0]===t[0].toUpperCase()));
  }
  await b.close();
  console.log(fails?`\n${fails} FAILED`:'\nALL PASSED');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
