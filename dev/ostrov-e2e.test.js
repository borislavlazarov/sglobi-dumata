// Цялостен тест: изиграва цели нива на острова (всички активности смесено), проверява звезди, отключена картинка и оцветяване.
// node dev/ostrov-e2e.test.js [нива, напр. 1,2,11]
const puppeteer=require('puppeteer-core');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL='file://'+path.resolve(__dirname,'..','ostrov','index.html');
async function playLevel(level,vp){
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage();await p.setViewport({width:vp[0],height:vp[1],hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL+'?parent=1',{waitUntil:'load'});
  await p.click('#btnPlay');await sleep(400);await p.click(`.node[data-level="${level}"]`);await sleep(500);
  const t0=Date.now();let acts=[],lastI=-1;
  while(Date.now()-t0<420000){
    const st=await p.evaluate(()=>{const r=window.__capy.run;return {screen:window.__capy.screen,i:r?r.i:-1,act:r&&r.recipe[r.i]?r.recipe[r.i].act:null,
      dance:(()=>{const d=document.querySelector('#stage [data-seq]')||(document.querySelector('#stage').dataset.seq?document.querySelector('#stage'):null);return d?{seq:d.dataset.seq,phase:d.dataset.phase}:null;})(),
      mem:document.querySelectorAll('#stage .mem-card').length}});
    if(st.screen==='end')break;
    if(st.screen!=='play'){errs.push('unexpected screen '+st.screen);break;}
    if(st.i!==lastI){lastI=st.i;acts.push(st.act);if(st.i===2)await p.screenshot({path:`shots/e2e-L${level}-round3.png`});}
    if(st.dance){
      if(st.dance.phase==='play'&&st.dance.seq){for(const k of st.dance.seq.split(',')){await p.click(`[data-pad="${k}"]`).catch(()=>{});await sleep(200);}await sleep(1200);}
      else await sleep(300);
    }else if(st.mem){
      const groups=await p.evaluate(()=>{const g={};document.querySelectorAll('#stage .mem-card').forEach((c,i)=>{(g[c.dataset.pair]=g[c.dataset.pair]||[]).push(i);});return Object.values(g);});
      for(const g of groups){for(const i of g){await p.evaluate(i=>{const c=document.querySelectorAll('#stage .mem-card')[i];c&&c.click();},i);await sleep(450);}await sleep(500);}
      await sleep(800);
    }else{
      const h=await p.$('#stage [data-ok]:not(.ok):not([disabled]):not(.dim)');
      if(h){await h.click().catch(()=>{});await sleep(380);}else await sleep(200);
    }
  }
  const res=await p.evaluate(()=>({screen:window.__capy.screen,stars:window.__capy.data.stars,shells:window.__capy.data.shells}));
  await sleep(1500);await p.screenshot({path:`shots/e2e-L${level}-end.png`});
  let colorOk=false,painted=false;
  if(res.screen==='end'){await p.click('#btnEndColor');await sleep(700);
    colorOk=await p.evaluate(()=>window.__capy.screen==='color'&&!!document.querySelector('#colorRoot svg .r'));
    const box=await p.evaluate(()=>{const r=document.querySelector('#colorRoot svg .r').ownerSVGElement.getBoundingClientRect();return {x:r.left+r.width*.5,y:r.top+r.height*.55};});
    await p.mouse.click(box.x,box.y);await sleep(400);
    painted=await p.evaluate(()=>Object.keys(Object.values(window.__capy.data.paint)[0]||{}).length>0);
    await p.screenshot({path:`shots/e2e-L${level}-color.png`});}
  await b.close();
  const ok=res.screen==='end'&&res.stars[level]>=1&&colorOk&&painted&&!errs.length;
  console.log(`${ok?'PASS':'FAIL'} level ${level} @${vp.join('x')}: ${Math.round((Date.now()-t0)/1000)}s, rounds [${acts.join(',')}], stars ${res.stars[level]}, shells ${res.shells}, color ${colorOk}/${painted}`+(errs.length?' ERR: '+errs.join(' | '):''));
  return ok;
}
(async()=>{
  const levels=(process.argv[2]||'1,2,11').split(',').map(Number);const vps=[[390,844],[844,390],[1366,768]];
  const r=await Promise.all(levels.map((l,i)=>playLevel(l,vps[i%3])));
  process.exit(r.every(Boolean)?0:1);
})();
