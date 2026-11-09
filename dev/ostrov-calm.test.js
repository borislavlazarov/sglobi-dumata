// Тест на „Спокойно, Капи": и двата режима за всяка трудност 1..5 (паралелно). Режимът се форсира с ?mode=A|B.
const puppeteer=require('puppeteer-core');const path=require('path');
async function play(diff,mode){
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--allow-file-access-from-files']});
  try{return await play1(b,diff,mode);}finally{await b.close();}
}
async function play1(b,diff,mode){
  const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+`?act=calm&diff=${diff}&mode=${mode}`);
  const tag='diff '+diff+' mode '+mode+': ';
  const fail=m=>{throw new Error(tag+m);};
  if(await p.$eval('.calm-root',r=>r.dataset.mode)!==mode)fail('wrong mode');
  const start=Date.now();let sawNogo=0,sawOk=0,punished=false,early=false;
  for(;;){
    if(Date.now()-start>170000)fail('timeout');
    if(await p.evaluate(()=>window.__capy.run.i>=1))break;
    if(mode==='A'){
      const st=await p.evaluate(()=>({ok:!!document.querySelector('[data-ok]'),no:!!document.querySelector('[data-nogo]')}));
      if(st.no)sawNogo=1;
      if(st.no&&diff===2&&!punished){punished=true;await p.click('[data-nogo]').catch(()=>{});await new Promise(r=>setTimeout(r,150));
        if(await p.evaluate(()=>window.__capy.run.mistakes)<1)fail('croc tap not counted');}
      else if(st.ok){sawOk++;await p.click('[data-ok]').catch(()=>{});}
    }else{
      const ok=await p.$('[data-ok]');
      if(!ok&&!early&&Date.now()-start>1800){early=true;await p.click('.calm-ow').catch(e=>fail('early click: '+e.message));await new Promise(r=>setTimeout(r,150));
        if(await p.evaluate(()=>window.__capy.run.mistakes)<1)fail('early tap not counted');}
      else if(ok)await p.click('[data-ok]').catch(()=>{});
    }
    await new Promise(r=>setTimeout(r,90));
  }
  if(mode==='A'&&(!sawNogo||sawOk<5))fail('A: nogo '+sawNogo+' capy '+sawOk);
  if(errs.length)fail('page errors: '+errs.join(' | '));
  await p.close();console.log(tag+'ok ('+Math.round((Date.now()-start)/1000)+'s)');
}
(async()=>{
  let bad=0;const jobs=[];
  for(let d=1;d<=5;d++){jobs.push(play(d,'A'));if(d>1)jobs.push(play(d,'B'));}
  await Promise.all(jobs.map(j=>j.catch(e=>{bad++;console.error('FAIL',e.message);})));
  process.exit(bad?1:0);
})();
