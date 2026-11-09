// node dev/ostrov-color.test.js [--shots]   — тест на оцветяването (ostrov/color.js + pages-0.js)
const puppeteer=require('puppeteer-core'),path=require('path'),fs=require('fs');
const OS=path.resolve(__dirname,'..','ostrov'),KEY='sglobi-ostrov-v1',SHOTS=process.argv.includes('--shots');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL: '+m);}else console.log('ok: '+m);};
(async()=>{
  // временен harness: index.html със само нужните скриптове + pages-0.js
  let html=fs.readFileSync(path.join(OS,'index.html'),'utf8');
  html=html.replace(/<script src="([^"]+)"><\/script>/g,(m,s)=>fs.existsSync(path.join(OS,s))?m:'');
  html=html.replace('<script>Capy.boot();','<script src="pages-0.js"></script>\n<script>Capy.boot();');
  const H=path.join(OS,'_color-harness.html');fs.writeFileSync(H,html);
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files']});
  const errs=[];
  async function newPage(w,h,q,seed){
    const p=await b.newPage();await p.setViewport({width:w,height:h,hasTouch:true});
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_FILE_NOT_FOUND/.test(m.text()))errs.push(m.text());});
    if(seed)await p.evaluateOnNewDocument((k,s)=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(k,s);sessionStorage.setItem('seeded','1');}},KEY,JSON.stringify(seed));
    await p.goto('file://'+H+'?parent=1&'+q);await sleep(500);return p;
  }
  const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}'),KEY);
  const tapR=async(p,name)=>{const r=await p.evaluate(n=>{const e=document.querySelector('.clr-canvas [data-r="'+n+'"]');const b=e.getBoundingClientRect();
    for(let i=1;i<24;i++)for(let j=1;j<24;j++){const x=b.x+b.width*i/24,y=b.y+b.height*j/24;const t=document.elementsFromPoint(x,y).find(q=>q.classList&&q.classList.contains('r'));if(t===e&&e.isPointInFill&&true)return [x,y];}
    return [b.x+b.width/2,b.y+b.height/2];},name);await p.mouse.click(r[0],r[1]);await sleep(80);};
  const swatch=(p,k)=>p.evaluate(k=>{document.querySelector('.clr-sw[data-k="'+k+'"]').click();},k);
  const fillOf=(p,n)=>p.evaluate(n=>document.querySelector('.clr-canvas [data-r="'+n+'"]').getAttribute('fill'),n);

  let p=await newPage(390,844,'color=test-flower');
  ok(await p.evaluate(()=>document.querySelectorAll('.clr-canvas .r').length)===16,'16 regions rendered');
  ok(await p.evaluate(()=>document.querySelectorAll('.clr-sw').length)>=31,'>=31 swatches');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.clr-sw')].every(e=>e.getBoundingClientRect().width>=44)),'swatches >=44px');
  await swatch(p,'#FF5C9E');await tapR(p,'petal1');
  ok(await fillOf(p,'petal1')==='#FF5C9E','petal filled');
  await swatch(p,'#3FBF6E');await tapR(p,'stem');await tapR(p,'hill');
  let d=await saved(p);ok(d.paint['test-flower'].petal1==='#FF5C9E'&&d.paint['test-flower'].stem==='#3FBF6E','persisted to localStorage');
  // forgiving hit: tap exactly on a stroke between petals / bg area near shape
  await p.click('[data-t=undo]');await sleep(100);
  ok(await fillOf(p,'hill')===null,'undo removed last fill');
  d=await saved(p);ok(!d.paint['test-flower'].hill,'undo persisted');
  // locked special
  await swatch(p,'sp:rainbow');await tapR(p,'sun');
  ok(!(await fillOf(p,'sun')||'').startsWith('url'),'locked special not applied (shells=0)');
  // undo depth 25
  const nm=await p.evaluate(()=>[...document.querySelectorAll('.clr-canvas .r')].map(e=>e.dataset.r));
  await p.evaluate(()=>{while(!document.querySelector('[data-t=undo]').disabled)document.querySelector('[data-t=undo]').click();});
  const cols=['#FF8FC0','#FF5C9E','#E8344F','#FF8A3D','#FFC83D','#FFF07A','#A5E36B','#3FBF6E','#5ED6D0','#2EAFC4'];
  await swatch(p,'#FF5C9E');await tapR(p,'petal1');
  const cnt=async()=>Object.keys((await saved(p)).paint['test-flower']).length;
  for(let j=0;j<25;j++){await swatch(p,cols[j%10]);await tapR(p,nm[(j+1)%16]);}
  for(let i=0;i<22;i++)await p.click('[data-t=undo]');
  ok(await cnt()<=4,'25 steps recorded, 22 undone ('+await cnt()+' left)');
  if(SHOTS)await p.screenshot({path:path.join(__dirname,'shots/color-390.png')});
  // reload restores
  await p.reload();await sleep(500);
  ok(await fillOf(p,'petal1')==='#FF5C9E','reload restores fill '+JSON.stringify(await saved(p)).slice(0,300));
  await p.close();

  // specials unlocked
  p=await newPage(844,390,'color=test-flower',{shells:20});
  await swatch(p,'sp:rainbow');await tapR(p,'sun');
  ok((await fillOf(p,'sun')||'').startsWith('url(#clr'),'rainbow applied with 20 shells');
  for(const [k,r] of [['sp:gold','petal1'],['sp:pink','petal2'],['sp:hearts','petal3'],['sp:dots','petal4'],['sp:stars','petal5'],['sp:galaxy','petal6']]){await swatch(p,k);await tapR(p,r);}
  d=await saved(p);ok(d.paint['test-flower'].petal6==='sp:galaxy'&&d.paint['test-flower'].sun==='sp:rainbow','special keys persisted');
  await swatch(p,'#FFC83D');await tapR(p,'center');await swatch(p,'#A5E36B');await tapR(p,'leaf1');await tapR(p,'leaf2');
  // tap on the pupil (.ln) falls through to region
  const pr=await p.evaluate(()=>{const e=document.querySelector('.clr-canvas .ln[r="7"]').getBoundingClientRect();return [e.x+e.width/2,e.y+e.height/2];});
  await swatch(p,'#E8344F');await p.mouse.click(pr[0],pr[1]);await sleep(80);
  ok(await fillOf(p,'center')==='#E8344F','tap on .ln pupil fills region beneath');
  // eraser
  await p.click('[data-t=eraser]');await tapR(p,'center');
  ok(await fillOf(p,'center')===null,'eraser clears');
  // thumb + two thumbs
  const t=await p.evaluate(()=>{const a=Capy.coloring.thumb('test-flower'),c=Capy.coloring.thumb('test-flower');
    const d=document.createElement('div');d.innerHTML='<div id=t1>'+a+'</div><div id=t2>'+c+'</div>';document.body.appendChild(d);
    const ids=[...d.querySelectorAll('[id^=clt]')].map(e=>e.id);
    const fills=[...d.querySelectorAll('#t1 [fill^="url("]')].map(e=>e.getAttribute('fill').slice(5,-1));
    return {has:a.includes('url(#clt'),uniq:new Set(ids).size===ids.length&&ids.length>=12,refsOwn:fills.every(f=>d.querySelector('#t1 [id="'+f+'"]')),n:fills.length};});
  ok(t.has&&t.uniq&&t.refsOwn&&t.n>=7,'thumb painted, unique pattern ids, own refs '+JSON.stringify(t));
  // save PNG should not throw
  await p.click('[data-t=save]');await sleep(500);
  // hold trash
  await p.evaluate(()=>{});const tb=await p.$('[data-t=clear]');const bx=await tb.boundingBox();
  await p.mouse.move(bx.x+20,bx.y+20);await p.mouse.down();await sleep(500);await p.mouse.up();
  ok(Object.keys((await saved(p)).paint['test-flower']).length>5,'short press does not clear');
  await p.mouse.move(bx.x+20,bx.y+20);await p.mouse.down();await sleep(1500);await p.mouse.up();await sleep(100);
  ok(Object.keys((await saved(p)).paint['test-flower']).length===0,'hold clears all');
  await p.click('[data-t=undo]');
  ok(Object.keys((await saved(p)).paint['test-flower']).length>5,'undo restores after clear');
  // complete -> confetti once
  await p.evaluate(()=>{window.__f=0;const o=Capy.sfx.fanfare;Capy.sfx.fanfare=function(){window.__f++;o();};});
  const names=await p.evaluate(()=>[...document.querySelectorAll('.clr-canvas .r')].map(e=>e.dataset.r));
  await swatch(p,'#FFC83D');for(const n of names)await tapR(p,n);await sleep(600);
  ok(await p.evaluate(()=>window.__f)===1,'completion fanfare once');
  if(SHOTS){await p.screenshot({path:path.join(__dirname,'shots/color-844.png')});}
  await p.click('[data-t=back]');
  ok(await p.evaluate(()=>window.__capy.screen)==='gallery','back() returns to gallery');
  await p.close();

  p=await newPage(1366,768,'color=test-flower',{shells:7});
  await swatch(p,'#FF8FC0');for(const n of ['petal1','petal3','petal5','petal7'])await tapR(p,n);
  await swatch(p,'#C9A7FF');for(const n of ['petal2','petal4','petal6','petal8'])await tapR(p,n);
  await swatch(p,'sp:gold');await tapR(p,'center');await swatch(p,'#5ED6D0');await tapR(p,'bg');await swatch(p,'#3FBF6E');await tapR(p,'hill');await tapR(p,'stem');
  await swatch(p,'#FFC83D');await tapR(p,'sun');
  if(SHOTS)await p.screenshot({path:path.join(__dirname,'shots/color-1366.png')});
  await p.close();
  ok(errs.length===0,'no page errors '+errs.join('|'));
  fs.unlinkSync(H);await b.close();
  console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0);
})().catch(e=>{console.error(e);try{fs.unlinkSync(path.join(OS,'_color-harness.html'));}catch(x){}process.exit(1);});
