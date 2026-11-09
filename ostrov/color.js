/* ===== Оцветяване: Capy.coloring = { open(rootEl,pageId,{back}), thumb(pageId) } =====
   Боите са стабилни ключове: '#RRGGBB' или 'sp:<име>'. Запазват се в Capy.data.paint[pageId][регион]. */
'use strict';
(function(){
const U=Capy.util,NS='http://www.w3.org/2000/svg';
const COLORS=['#FF8FC0','#FF5C9E','#E8344F','#FF8A3D','#FFC83D','#FFF07A','#A5E36B','#3FBF6E',
  '#5ED6D0','#2EAFC4','#4DABF7','#2F5FD0','#C9A7FF','#9B6BE8','#6B3FB0','#FFE0C7',
  '#F5C29A','#D99A6C','#A86B45','#6B4226','#8B5A3C','#2B2B2B','#B8B8C0','#FFFFFF'];
/* специални бои: отключват се с общия брой мидички */
const SPECIALS=[['rainbow',2],['gold',4],['pink',7],['hearts',10],['dots',14],['stars',18],['galaxy',18]];
const SP_NEED={};SPECIALS.forEach(s=>SP_NEED['sp:'+s[0]]=s[1]);
const HEX=/^#[0-9A-Fa-f]{6}$/;
const validKey=k=>typeof k==='string'&&(HEX.test(k)||SP_NEED[k]!==undefined);
let inst=0;

function spDef(name,id){
  const sparkle=(x,y,s,c)=>`<path d="M${x} ${y-s}L${x+s*.28} ${y-s*.28}L${x+s} ${y}L${x+s*.28} ${y+s*.28}L${x} ${y+s}L${x-s*.28} ${y+s*.28}L${x-s} ${y}L${x-s*.28} ${y-s*.28}Z" fill="${c}" stroke="none"/>`;
  const pat=(w,body)=>`<pattern id="${id}" width="${w}" height="${w}" patternUnits="userSpaceOnUse">${body}</pattern>`;
  const grad=stops=>`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${stops.map((c,i)=>`<stop offset="${(i/(stops.length-1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  switch(name){
    case 'rainbow':return grad(['#FF4D4D','#FF9F1C','#FFE14D','#3FCF8E','#4DABF7','#9B7BFF','#FF8FC0']);
    case 'galaxy':return grad(['#1B1464','#5B2AA8','#C04DD0','#FF8FC0','#FFD3A5']);
    case 'gold':return pat(34,`<rect width="34" height="34" fill="#F6C945" stroke="none"/><rect width="34" height="34" fill="#FFE48A" opacity=".35" stroke="none"/>`+
      sparkle(8,9,6,'#FFFBE0')+sparkle(25,22,5,'#FFF')+sparkle(27,5,2.5,'#FFFBE0')+sparkle(6,27,2.5,'#fff')+`<circle cx="17" cy="16" r="1.6" fill="#B8860B" stroke="none"/><circle cx="31" cy="31" r="1.4" fill="#B8860B" stroke="none"/>`);
    case 'pink':return pat(34,`<rect width="34" height="34" fill="#FF9CCB" stroke="none"/>`+
      sparkle(9,8,6,'#fff')+sparkle(24,23,5,'#FFF0F8')+sparkle(27,6,2.5,'#fff')+sparkle(6,27,2.5,'#fff')+`<circle cx="16" cy="18" r="1.6" fill="#E0559A" stroke="none"/><circle cx="31" cy="31" r="1.4" fill="#E0559A" stroke="none"/>`);
    case 'hearts':{const h=(x,y,c)=>`<path transform="translate(${x} ${y})" d="M6 11C-1 6 0 0.5 3.4 0.5C5 0.5 6 1.8 6 2.8C6 1.8 7 0.5 8.6 0.5C12 0.5 13 6 6 11Z" fill="${c}" stroke="none"/>`;
      return pat(32,`<rect width="32" height="32" fill="#FFD9EA" stroke="none"/>`+h(2,3,'#FF4F93')+h(18,19,'#FF7FB2'));}
    case 'dots':return pat(28,`<rect width="28" height="28" fill="#6FD3F2" stroke="none"/><circle cx="7" cy="7" r="5" fill="#fff" stroke="none"/><circle cx="21" cy="21" r="5" fill="#FFE14D" stroke="none"/>`);
    case 'stars':{const st=(x,y,r,c)=>{let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;p+=(x+Math.cos(a)*rr).toFixed(1)+','+(y+Math.sin(a)*rr).toFixed(1)+' ';}return `<polygon points="${p}" fill="${c}" stroke="none"/>`;};
      return pat(32,`<rect width="32" height="32" fill="#3C2C8F" stroke="none"/>`+st(9,9,7,'#FFD84D')+st(25,24,6,'#fff')+st(26,6,2.5,'#FFD84D')+st(6,26,2.5,'#fff'));}
  }
  return '';
}
function defsMarkup(prefix,names){return '<defs>'+names.map(n=>spDef(n,prefix+n)).join('')+'</defs>';}
function fillFor(key,prefix){
  if(!validKey(key))return '#FFFFFF';
  return key.slice(0,3)==='sp:'?'url(#'+prefix+key.slice(3)+')':key;
}
const ALL_SP=SPECIALS.map(s=>s[0]);

/* боядисан SVG низ; prefix прави id-тата на дефинициите уникални */
function paintedSVG(id,prefix,withAll){
  const pg=Capy.pages[id];if(!pg)return '';
  const paints=(Capy.data.paint&&Capy.data.paint[id])||{},used={};
  let svg=pg.svg.replace(/<(?:path|circle|ellipse|rect|polygon)\b[^>]*>/g,tag=>{
    if(!/\bclass="r"/.test(tag))return tag;
    const m=/\bdata-r="([^"]*)"/.exec(tag);if(!m||!Object.prototype.hasOwnProperty.call(paints,m[1]))return tag;
    const k=paints[m[1]];if(k.slice&&k.slice(0,3)==='sp:'&&validKey(k))used[k.slice(3)]=1;
    tag=tag.replace(/\sfill="[^"]*"/,'');
    return tag.replace(/\s*\/?>$/,e=>' fill="'+fillFor(k,prefix)+'"'+e);});
  const names=withAll?ALL_SP:Object.keys(used);
  if(names.length)svg=svg.replace(/<svg\b[^>]*>/,m=>m+defsMarkup(prefix,names));
  return svg;
}

Capy.css(`
.clr{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));box-sizing:border-box;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;}
.clr-tools{display:flex;gap:8px;justify-content:center;align-items:center;flex:none;}
.clr-tools .sp{flex:1;}
.clr-btn{position:relative;width:48px;height:48px;border-radius:50%;background:#fff;box-shadow:0 3px 0 rgba(0,0,0,.15),0 4px 10px rgba(80,40,120,.15);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;border:0;touch-action:manipulation;flex:none;}
.clr-btn:active{transform:translateY(2px);}
.clr-btn:disabled{opacity:.35;}
.clr-btn.on{outline:4px solid #9B6BE8;}
.clr-btn svg.ring{position:absolute;inset:-3px;width:calc(100% + 6px);height:calc(100% + 6px);pointer-events:none;transform:rotate(-90deg);}
.clr-btn svg.ring circle{fill:none;stroke:#E8344F;stroke-width:4;stroke-linecap:round;stroke-dasharray:132;stroke-dashoffset:132;}
.clr-btn.hold svg.ring circle{stroke-dashoffset:0;transition:stroke-dashoffset 1.2s linear;}
.clr-canvas{flex:1;min-width:0;min-height:0;container-type:size;display:flex;align-items:center;justify-content:center;touch-action:none;}
.clr-canvas>svg{width:min(100cqw,calc(100cqh*4/3));height:auto;aspect-ratio:4/3;display:block;border-radius:18px;background:#fff;box-shadow:0 6px 18px rgba(80,40,120,.22);touch-action:none;cursor:pointer;overflow:hidden;}
.clr-canvas .ln{pointer-events:none;}
.clr-pal{flex:none;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-content:flex-start;}
.clr-sw{position:relative;width:46px;height:46px;border-radius:50%;padding:0;border:0;background:none;flex:none;touch-action:manipulation;transition:transform .12s;}
.clr-sw svg{width:100%;height:100%;display:block;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(0,0,0,.16),0 2px 4px rgba(0,0,0,.18);}
.clr-sw.sel{transform:scale(1.14);}
.clr-sw.sel::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:4px solid #3B2A4A;box-shadow:0 0 0 2px #fff;}
.clr-sw.lock svg{filter:grayscale(1);opacity:.45;}
.clr-sw.lock b{position:absolute;left:0;right:0;top:50%;transform:translateY(-52%);text-align:center;font-size:12px;line-height:1.05;color:#3B2A4A;font-weight:800;}
.clr-sw.lock b i{display:block;font-style:normal;font-size:15px;}
@media (orientation:landscape){
  .clr{flex-direction:row;}
  .clr-tools{flex-direction:column;justify-content:flex-start;}
  .clr-tools .sp{flex:1;}
  .clr-pal{flex:none;width:calc(5*50px + 4*6px);overflow-y:auto;overflow-x:hidden;padding:10px 8px;box-sizing:content-box;}
}
@media (orientation:landscape) and (min-height:560px){
  .clr-btn{width:56px;height:56px;font-size:28px;}
  .clr-sw{width:52px;height:52px;} .clr-pal{width:calc(4*52px + 3*8px);gap:8px;}
}
@media (orientation:portrait){
  .clr-sw{width:44px;height:44px;} .clr-pal{gap:7px;padding:4px 0 2px;}
}
`);

function open(root,id,opts){
  opts=opts||{};const pg=Capy.pages[id];
  if(!pg){if(opts.back)opts.back();return;}
  const D=Capy.data,prefix='clr'+(++inst)+'-';
  if(!D.paint[id]||typeof D.paint[id]!=='object')D.paint[id]={};
  const paints=D.paint[id];
  let sel='#FF8FC0';const hist=[];let holdT=0;
  root.innerHTML='';
  const wrap=U.el('div','clr');root.appendChild(wrap);
  const tools=U.el('div','clr-tools'),canvas=U.el('div','clr-canvas'),pal=U.el('div','clr-pal');
  const mk=(icon,label)=>{const b=U.el('button','clr-btn',icon);b.setAttribute('aria-label',label);return b;};
  const bBack=mk('⬅','назад'),bUndo=mk('↩','отмени'),bEr=mk('🧽','гума'),bTr=mk('🗑','започни отначало'),bSave=mk('💾','запази');
  bTr.insertAdjacentHTML('beforeend','<svg class="ring" viewBox="0 0 50 50"><circle cx="25" cy="25" r="21"/></svg>');
  bBack.dataset.t='back';bUndo.dataset.t='undo';bEr.dataset.t='eraser';bTr.dataset.t='clear';bSave.dataset.t='save';
  const spacer=U.el('div','sp');
  [bBack,spacer,bUndo,bEr,bTr,bSave].forEach(x=>tools.appendChild(x));
  wrap.appendChild(tools);wrap.appendChild(canvas);wrap.appendChild(pal);
  canvas.innerHTML=paintedSVG(id,prefix,true);
  const svg=canvas.querySelector('svg');
  const regions={};svg.querySelectorAll('.r').forEach(e=>{regions[e.getAttribute('data-r')]=e;});
  const names=Object.keys(regions);
  svg.setAttribute('role','img');

  /* ---- палитра ---- */
  const swatches=[];
  const svgSw=fill=>`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="${fill}"/></svg>`;
  function addSw(key,need){
    const b=U.el('button','clr-sw');b.dataset.k=key;b.setAttribute('aria-label',key);
    b.innerHTML=svgSw(fillFor(key,prefix));b.dataset.need=need||0;swatches.push(b);pal.appendChild(b);
    b.addEventListener('click',()=>{
      if(need&&D.shells<need){Capy.sfx.wrong();b.animate([{transform:'rotate(0)'},{transform:'rotate(-14deg)'},{transform:'rotate(12deg)'},{transform:'rotate(-8deg)'},{transform:'rotate(0)'}],{duration:380});return;}
      Capy.sfx.tap();sel=key;markSel();});
  }
  COLORS.forEach(c=>addSw(c));
  SPECIALS.forEach(s=>addSw('sp:'+s[0],s[1]));
  function refreshLocks(){swatches.forEach(b=>{const need=+b.dataset.need,lock=need&&D.shells<need;b.classList.toggle('lock',!!lock);
    const old=b.querySelector('b');if(old)old.remove();if(lock)b.insertAdjacentHTML('beforeend',`<b><i>🐚</i>${need}</b>`);});}
  function markSel(){swatches.forEach(b=>b.classList.toggle('sel',b.dataset.k===sel&&!eraser));bEr.classList.toggle('on',eraser);}
  let eraser=false;
  refreshLocks();markSel();
  bEr.onclick=()=>{Capy.sfx.tap();eraser=!eraser;markSel();};
  swatches.forEach(b=>b.addEventListener('click',()=>{if(!b.classList.contains('lock'))eraser=false;markSel();}));

  /* ---- рисуване ---- */
  const complete=()=>names.every(n=>paints[n]);
  let wasComplete=complete();
  function apply(n,key){const e=regions[n];if(!e)return;
    if(key){paints[n]=key;e.setAttribute('fill',fillFor(key,prefix));}
    else{delete paints[n];e.removeAttribute('fill');}}
  function syncUndo(){bUndo.disabled=!hist.length;}
  function ripple(e,key,evt){
    try{const pt=svg.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());
      const cid=prefix+'c'+(Math.random()*1e6|0),cp=document.createElementNS(NS,'clipPath');cp.setAttribute('id',cid);
      const cl=e.cloneNode(false);cl.removeAttribute('class');cl.removeAttribute('fill');cl.removeAttribute('stroke');cp.appendChild(cl);
      const g=document.createElementNS(NS,'g');g.setAttribute('clip-path','url(#'+cid+')');g.style.pointerEvents='none';
      const c=document.createElementNS(NS,'circle');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',320);c.setAttribute('fill','#fff');c.setAttribute('opacity','.7');c.style.pointerEvents='none';
      c.style.transformBox='fill-box';c.style.transformOrigin='center';g.appendChild(c);svg.appendChild(cp);svg.appendChild(g);
      c.animate([{transform:'scale(.05)',opacity:.8},{transform:'scale(1)',opacity:0}],{duration:420,easing:'ease-out'}).onfinish=()=>{g.remove();cp.remove();};
    }catch(x){}
    e.animate([{opacity:.3},{opacity:1}],{duration:260,easing:'ease-out'});
  }
  function regionAt(x,y){
    const find=(px,py)=>{const l=document.elementsFromPoint(px,py);for(const e of l){if(e.classList&&e.classList.contains('r')&&svg.contains(e))return e;}return null;};
    let h=find(x,y);
    if(!h||h.getAttribute('data-r')==='bg'||h===regions.bg){
      for(const rad of [4,8]){for(let i=0;i<8;i++){const a=i*Math.PI/4,c=find(x+Math.cos(a)*rad,y+Math.sin(a)*rad);
        if(c&&c!==regions.bg)return c;}}
    }
    return h;
  }
  function onDown(ev){
    if(ev.pointerType==='mouse'&&ev.button!==0)return;ev.preventDefault();
    const e=regionAt(ev.clientX,ev.clientY);if(!e)return;
    const n=e.getAttribute('data-r'),key=eraser?null:sel;
    if(!key&&!paints[n])return;
    if(key===paints[n])return;
    if(key&&key.slice(0,3)==='sp:'&&D.shells<SP_NEED[key])return;
    hist.push([[n,paints[n]]]);if(hist.length>60)hist.shift();
    apply(n,key);Capy.save();syncUndo();
    ripple(e,key||'#FFFFFF',ev);Capy.sfx.pop();
    const c=complete();
    if(c&&!wasComplete){setTimeout(()=>{Capy.confetti(2000);Capy.sfx.fanfare();},250);}
    wasComplete=c;
  }
  svg.addEventListener('pointerdown',onDown);
  svg.addEventListener('contextmenu',e=>e.preventDefault());

  bUndo.onclick=()=>{const h=hist.pop();if(!h)return;Capy.sfx.tap();h.forEach(([n,k])=>{apply(n,k);if(regions[n])regions[n].animate([{opacity:.4},{opacity:1}],{duration:200});});
    Capy.save();syncUndo();wasComplete=complete();};
  syncUndo();

  /* ---- започни отначало: задръж ---- */
  const endHold=()=>{clearTimeout(holdT);holdT=0;bTr.classList.remove('hold');};
  bTr.addEventListener('pointerdown',ev=>{ev.preventDefault();endHold();void bTr.getBoundingClientRect();bTr.classList.add('hold');
    holdT=setTimeout(()=>{endHold();const ch=Object.keys(paints).map(n=>[n,paints[n]]);if(!ch.length)return;
      hist.push(ch);if(hist.length>60)hist.shift();ch.forEach(([n])=>apply(n,null));Capy.save();syncUndo();wasComplete=false;Capy.sfx.pop();},1200);});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>bTr.addEventListener(t,endHold));
  bTr.addEventListener('contextmenu',e=>e.preventDefault());

  /* ---- запази като PNG ---- */
  bSave.onclick=()=>{Capy.sfx.tap();
    try{
      let s=paintedSVG(id,prefix+'s-',false);
      s=s.replace(/<svg\b[^>]*>/,m=>/xmlns=/.test(m)?m:m.replace('<svg','<svg xmlns="'+NS+'"'));
      s=s.replace(/<svg\b([^>]*)>/,(m,a)=>'<svg'+a.replace(/\s(width|height)="[^"]*"/g,'')+' width="1600" height="1200">');
      const img=new Image();
      img.onload=()=>{try{const cv=document.createElement('canvas');cv.width=1600;cv.height=1200;const x=cv.getContext('2d');
        x.fillStyle='#fff';x.fillRect(0,0,1600,1200);x.drawImage(img,0,0,1600,1200);
        cv.toBlob(b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kapi-'+id+'.png';
          document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href);},1000);},'image/png');}catch(e){}};
      img.onerror=()=>{};
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
    }catch(e){}};

  bBack.onclick=()=>{Capy.sfx.tap();endHold();if(opts.back)opts.back();};
}

function thumb(id){return paintedSVG(id,'clt'+(++inst)+'-',false);}
Capy.coloring={open,thumb,COLORS,SPECIALS};
})();
