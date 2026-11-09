// Тест на „Повтори танца": играе пълен рунд за всяка трудност 1..5 (паралелно).
const puppeteer=require('puppeteer-core');const path=require('path');
const LENS=[[2,2,3],[2,3,4],[3,4,5],[4,5,5],[4,5,6]];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function play(diff){
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--allow-file-access-from-files']});
  try{return await play1(b,diff);}finally{await b.close();}
}
async function play1(b,diff){
  const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'..','ostrov','index.html')+'?act=dance&diff='+diff);
  const fail=m=>{throw new Error('diff '+diff+': '+m);};
  const nPads=await p.$$eval('[data-pad]',e=>e.length);
  if(nPads!==(diff===1?3:4))fail('pads '+nPads);
  let prev='';
  for(let si=0;si<3;si++){
    await p.waitForFunction(prev=>{const r=document.querySelector('.dance-root');return r&&r.dataset.phase==='play'&&(r.dataset.seq!==prev||prev==='');},{timeout:40000,polling:100},prev);
    const seq=await p.$eval('.dance-root',r=>r.dataset.seq.split(',').map(Number));
    if(seq.length!==LENS[diff-1][si])fail('seq len '+seq.length+' at '+si);
    if(si===0&&diff===2){      /* неправилен подиум -> пак „гледай", същата поредица, после ред на детето */
      const wrong=[0,1,2].find(x=>x!==seq[0]);await p.click(`[data-pad="${wrong}"]`);
      await p.waitForFunction(()=>document.querySelector('.dance-root').dataset.phase==='watch',{timeout:3000});
      await p.waitForFunction(()=>document.querySelector('.dance-root').dataset.phase==='play',{timeout:30000,polling:100});
      const s2=await p.$eval('.dance-root',r=>r.dataset.seq.split(',').map(Number));
      if(s2.join()!==seq.join())fail('sequence changed after wrong');
    }
    for(const k of seq){await p.click(`[data-pad="${k}"]`);await sleep(180);}
    prev=seq.join(',');
  }
  await p.waitForFunction(()=>window.__capy.run&&window.__capy.run.i>=1,{timeout:15000,polling:100});
  if(errs.length)fail('page errors: '+errs.join(' | '));
  await p.close();console.log('diff',diff,'ok');
}
(async()=>{
  let bad=0;
  await Promise.all([1,2,3,4,5].map(d=>play(d).catch(e=>{bad++;console.error('FAIL',e.message);})));
  process.exit(bad?1:0);
})();
