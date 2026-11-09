// Тест за „Липсващата буква / Подреди изречението" (ostrov/act-spell.js): за всяко diff 1..5 изиграва цял рунд чрез data-ok.
// Пуск: cd dev && node ostrov-spell.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
const ACT='spell';
const URL=q=>'file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?'+q;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0;const check=(name,ok,det='')=>{console.log((ok?'PASS  ':'FAIL  ')+name+(ok||!det?'':' — '+det));if(!ok)fails++;};

async function playRound(b,query,{wrongFirst=false}={}){
  const p=await b.newPage();await p.setViewport({width:844,height:390,deviceScaleFactor:1,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|net::/.test(m.text()))errs.push(m.text());});
  await p.goto(URL(query),{waitUntil:'load'});await sleep(500);
  const info={taps:0,okCountIssues:0,wrongTested:false,spokenOk:true};
  const t0=Date.now();
  while(Date.now()-t0<120000){
    const st=await p.evaluate(()=>({i:window.__capy.run?window.__capy.run.i:-1,m:window.__capy.run?window.__capy.run.mistakes:-1}));
    if(st.i>=1){info.mistakes=st.m;break;}
    const h=await p.$('#stage button[data-ok="1"]:not(.ok):not([disabled]):not(.dim)');
    if(!h){await sleep(120);continue;}
    if(wrongFirst&&!info.wrongTested){
      const w=await p.$('#stage button:not([data-ok]):not([disabled]):not(.dim):not(.spell-used)');
      if(w){await w.click();await sleep(300);info.wrongTested=(await p.evaluate(()=>window.__capy.run.mistakes))===1;}
    }
    await h.click();info.taps++;await sleep(150);
  }
  info.advanced=(await p.evaluate(()=>window.__capy.run?window.__capy.run.i:-1))>=1;
  await p.close();return {...info,errs};
}

(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  // съдържание: всяко изречено след отговор е регистрирано; ударенията сочат гласна
  {const p=await b.newPage();await p.goto(URL('act=demo'),{waitUntil:'load'});await sleep(300);
   const r=await p.evaluate(()=>{const D=Capy._spellData,sp=Capy._speech.bg,bad=[];
     const cap=s=>s.charAt(0)+s.slice(1).toLowerCase();
     D.WORDS.forEach(w=>{if('АЕИОУЪЮЯ'.indexOf(w.w[w.st])<0)bad.push('stress '+w.w);if(!sp.has(cap(w.w)))bad.push('unregistered '+w.w);});
     D.B4.concat(D.B5).forEach(s=>s.orders.forEach(o=>{const t=cap(o.join(' '))+'.';if(!sp.has(t))bad.push('unregistered '+t);}));
     return {bad,words:D.WORDS.length,sent:D.B4.length+D.B5.length};});
   await p.close();
   check(`content: ${r.words} words, ${r.sent} sentences, all spoken strings registered`,r.bad.length===0&&r.words>=30&&r.sent>=25,r.bad.join(', '));}
  for(let d=1;d<=5;d++){
    const r=await playRound(b,`act=${ACT}&diff=${d}`,{wrongFirst:d===4});
    check(`diff ${d}: round completed (run.i advanced)`,r.advanced);
    check(`diff ${d}: no page errors`,r.errs.length===0,r.errs.join(' | '));
    check(`diff ${d}: taps ≥ 4 (${r.taps})`,r.taps>=4);
    if(d===4)check(`diff 4: a wrong tile counts as a mistake`,r.wrongTested&&r.mistakes===1,'mistakes '+r.mistakes);
    else check(`diff ${d}: no mistakes when playing data-ok`,r.mistakes===0,'mistakes '+r.mistakes);
  }
  // diff 1–2 винаги ГЛАВНИ (дори на ниво 6); diff ≥3 следва ctx.lower
  for(const [q,caps] of [['diff=2&level=6',true],['diff=3&level=6',false],['diff=3&level=1',true]]){
    const p=await b.newPage();await p.goto(URL(`act=${ACT}&${q}`),{waitUntil:'load'});await sleep(400);
    const t=await p.$eval('#stage .spell-word, #stage .spell-tiles',e=>e.textContent);await p.close();
    check(`${q}: ${caps?'CAPS':'lowercase'} („${t}")`,caps?t===t.toUpperCase():t!==t.toUpperCase());
  }
  await b.close();
  console.log(fails?`\n${fails} FAILED`:'\nALL PASSED');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
