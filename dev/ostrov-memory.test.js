// Тест на „memory": node ostrov-memory.test.js
const puppeteer=require('puppeteer-core');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--allow-file-access-from-files']});
  let fail=0;
  for(let d=1;d<=5;d++){
    const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text()))errs.push(m.text());});
    await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?act=memory&diff='+d,{waitUntil:'load'});
    await sleep(500);
    const expect=[3,4,5,6,8][d-1];
    const groups=await p.evaluate(()=>{const g={};document.querySelectorAll('.mem-card').forEach((c,i)=>{(g[c.dataset.pair]=g[c.dataset.pair]||[]).push(i);});return Object.values(g);});
    let ok=groups.length===expect&&groups.every(g=>g.length===2);
    const clk=i=>p.evaluate(i=>document.querySelectorAll('.mem-card')[i].click(),i);
    if(d===1){await clk(groups[0][0]);await clk(groups[1][0]);await sleep(1900);} // непасващи
    for(const g of groups){await clk(g[0]);await sleep(150);await clk(g[1]);await sleep(900);}
    let i=0;for(let t=0;t<40&&!i;t++){await sleep(400);i=await p.evaluate(()=>window.__capy.run.i);}
    const res=ok&&i>=1&&!errs.length;if(!res)fail++;
    console.log('diff',d,res?'OK':'FAIL','pairs',groups.length,'run.i',i,errs.join('|'));
    await p.close();
  }
  await b.close();process.exit(fail?1:0);
})();
