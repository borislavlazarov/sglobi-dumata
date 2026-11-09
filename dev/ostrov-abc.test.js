// node ostrov-abc.test.js — играе по един пълен рунд на abc за diff 1..5 (A–E, широк и разкъсан набор букви)
const puppeteer=require('puppeteer-core');const path=require('path');
const URL='file://'+path.resolve(__dirname,'..','ostrov','index.html');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  let fails=0;
  const cases=[];[1,2,3,4,5].forEach(d=>cases.push([d,null]));
  [3,4,5].forEach(d=>cases.push([d,'ABCDEFGHIJKLM']));[4,5].forEach(d=>cases.push([d,'ACE']));cases.push([5,'XYZ']);
  for(const [diff,en] of cases){
    const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text());});
    if(en)await p.evaluateOnNewDocument(e=>{try{localStorage.setItem('sglobi-ostrov-v1',JSON.stringify({en:e}));}catch(_){}},en);
    await p.goto(URL+'?act=abc&diff='+diff,{waitUntil:'load'});await sleep(500);
    const known=en||'ABCDE';let bad=[],types=0,qs=0,last='';
    const i0=await p.evaluate(()=>window.__capy.run.i);let ok=false;const t0=Date.now();
    while(Date.now()-t0<90000){
      const r=await p.evaluate(()=>{
        const out={i:window.__capy.run.i,ls:[...document.querySelectorAll('#stage [data-l]')].map(e=>e.dataset.l),sig:document.getElementById('stage').innerText};
        const e=document.querySelector('#stage [data-ok="1"]:not(.dim)');if(e)e.click();return out;});
      r.ls.forEach(l=>{if(!known.includes(l))bad.push(l);});
      if(r.sig!==last){qs++;last=r.sig;}
      if(r.i>i0){ok=true;break;}
      await sleep(250);
    }
    const pass=ok&&!errs.length&&!bad.length;if(!pass)fails++;
    console.log((pass?'PASS':'FAIL')+' diff='+diff+' en='+known+' views='+qs+(errs.length?' errs='+errs.join('|'):'')+(bad.length?' badletters='+bad:'')+(ok?'':' TIMEOUT'));
    await p.close();
  }
  await b.close();process.exit(fails?1:0);
})();
