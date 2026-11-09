/* ===== Играта „Двойки" (memory) — една дъска на рунд ===== */
'use strict';
(function(){
const U=Capy.util;
const T_PIC='Намери еднаквите картинки.',T_PAIR='Намери двойките.';
Capy.speech('bg',[T_PIC,T_PAIR]);

/* дума -> картинка (всички думи се изговарят след познаване) */
const WORDS=[['котка','🐱'],['куче','🐶'],['риба','🐟'],['слон','🐘'],['лъв','🦁'],['къща','🏠'],['кола','🚗'],['луна','🌙'],
  ['слънце','☀️'],['звезда','⭐'],['цвете','🌸'],['дърво','🌳'],['ябълка','🍎'],['банан','🍌'],['грозде','🍇'],['ягода','🍓'],
  ['торта','🎂'],['балон','🎈'],['корона','👑'],['мишка','🐭']];
Capy.speech('bg',WORDS.map(w=>w[0]));
/* английски: буква -> [картинка, дума] */
const EN={A:['🍎','apple'],B:['⚽','ball'],C:['🐱','cat'],D:['🐶','dog'],E:['🐘','elephant'],F:['🐸','frog'],G:['🍇','grapes'],H:['🏠','house'],
  I:['🍦','ice cream'],J:['👖','jeans'],K:['🔑','key'],L:['🦁','lion'],M:['🌙','moon'],N:['👃','nose'],O:['🐙','octopus'],P:['🐷','pig'],
  Q:['👸','queen'],R:['🌈','rainbow'],S:['☀️','sun'],T:['🌳','tree'],U:['☂️','umbrella'],V:['🎻','violin'],W:['🐳','whale'],Y:['⛵','yacht'],Z:['🦓','zebra']};
Capy.speech('en',Object.keys(EN).map(k=>EN[k][1]));
const THEMES=[['🐠','🐟','🐬','🐳','🐙','🦀','🐢','🦈','🐚','🦑','🦐','🐡'],
  ['🍭','🍬','🍫','🍩','🍪','🧁','🍰','🍦','🍓','🍡'],
  ['👑','👗','🏰','💎','👸','💍','🦄','🎀','👠','💄','🌹'],
  ['🎤','🎧','💃','🎵','🎸','🥁','🎹','🎷','🕺','🎺']];
const ALPHA='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');
const DOTC=['#FF7E6B','#4DABF7','#3FCF8E','#9B7BFF','#FF8FC0','#F5A300','#27B276','#E96AA3','#35BCD0'];

Capy.css(`
.mem-wrap{flex:1;min-height:0;width:100%;position:relative;}
.mem-board{display:flex;flex-wrap:wrap;justify-content:center;align-content:center;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);}
.mem-card{position:relative;width:var(--s);height:var(--s);padding:0;background:none;perspective:700px;flex:none;border-radius:22%;}
.mem-in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .45s cubic-bezier(.3,1.3,.5,1);border-radius:22%;}
.mem-card.open .mem-in,.mem-card.matched .mem-in{transform:rotateY(180deg);}
.mem-back,.mem-front{position:absolute;inset:0;border-radius:22%;display:flex;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;
  box-shadow:0 5px 0 rgba(40,60,90,.18),0 8px 16px rgba(20,80,110,.2);overflow:hidden;}
.mem-back{background:
  radial-gradient(circle at 50% 118%,rgba(255,255,255,.4) 0 26%,transparent 27%) 0 0/36% 36%,
  radial-gradient(circle at 50% 118%,rgba(255,255,255,.3) 0 26%,transparent 27%) 18% 18%/36% 36%,
  linear-gradient(150deg,#9B7BFF,#FF8FC0);border:calc(var(--s)*.05) solid #fff;font-size:calc(var(--s)*.4);}
.mem-back::after{content:"🐚";filter:drop-shadow(0 2px 2px rgba(0,0,0,.25));}
.mem-front{background:#fff;transform:rotateY(180deg);font-size:calc(var(--s)*.52);line-height:1;font-weight:bold;color:var(--ink);font-family:var(--font);text-transform:none;}
.mem-card.matched .mem-front{background:#E4FFEF;box-shadow:0 0 0 calc(var(--s)*.05) var(--green),0 0 calc(var(--s)*.3) rgba(63,207,142,.75);animation:memglow 1.4s ease-in-out infinite alternate;}
.mem-card.matched{animation:okpop .5s ease-out;}
.mem-card.no .mem-in{animation:shake .42s;}
.mem-dots{display:grid;gap:calc(var(--s)*.05);justify-items:center;align-items:center;}
.mem-dots i{display:block;border-radius:50%;width:calc(var(--s)*var(--d));height:calc(var(--s)*var(--d));box-shadow:inset 0 -3px 0 rgba(0,0,0,.15);}
@keyframes memglow{to{filter:brightness(1.07);transform:scale(1.03);}}
`);

function buildPairs(ctx){
  const d=Math.max(1,Math.min(5,ctx.diff)),n=[3,4,5,6,8][d-1];
  const types=['pic'];if(d>=2)types.push('abc','num');if(d>=3)types.push('word');if(d>=4)types.push('en');
  const type=U.pick(types);
  const pairs=[];
  const pic=(count)=>{U.sample(U.pick(THEMES),count).forEach(e=>pairs.push({a:{h:e,c:'pic'},b:{h:e,c:'pic'}}));};
  if(type==='pic')pic(n);
  else if(type==='abc'){U.sample(ALPHA,n).forEach(L=>pairs.push({a:{h:L,c:'t'},b:{h:L.toLowerCase(),c:'t'}}));}
  else if(type==='num'){U.sample([1,2,3,4,5,6,7,8,9],n).forEach(k=>pairs.push({a:{h:String(k),c:'num',k},b:{dots:k,c:'dots'}}));}
  else if(type==='word'){U.sample(WORDS,n).forEach(([w,e])=>pairs.push({a:{h:e,c:'pic'},b:{h:ctx.lower?w:w.toUpperCase(),c:'word'},say:['bg',w]}));}
  else{const av=U.shuffle(ctx.enLetters.filter(l=>EN[l])),k=Math.min(av.length,n);
    av.slice(0,k).forEach(L=>pairs.push({a:{h:L,c:'t'},b:{h:EN[L][0],c:'pic'},say:['en',EN[L][1]]}));
    if(k<n)pic(n-k);}
  return {pairs,type};
}

Capy.registerActivity('memory',{icon:'🃏',start(el,ctx){
  let dead=false;const timers=new Set();
  const later=(f,ms)=>{const t=setTimeout(()=>{timers.delete(t);if(!dead)f();},ms);timers.add(t);};
  const {pairs,type}=buildPairs(ctx);
  ctx.prompt('bg',type==='pic'?T_PIC:T_PAIR);
  const wrap=U.el('div','mem-wrap'),board=U.el('div','mem-board');wrap.appendChild(board);el.appendChild(wrap);
  const cards=[];
  pairs.forEach((p,k)=>{[p.a,p.b].forEach(f=>{
    const b=U.el('button','mem-card');b.dataset.pair=k;
    const front=U.el('span','mem-front');
    if(f.c==='dots'){const g=U.el('span','mem-dots');const n=f.dots,cols=n<=3?n:n<=4?2:3;g.style.gridTemplateColumns='repeat('+cols+',auto)';
      g.style.setProperty('--d',n>6?'.15':n>4?'.18':'.22');for(let i=0;i<n;i++){const i2=document.createElement('i');i2.style.background=DOTC[n-1];g.appendChild(i2);}front.appendChild(g);}
    else{front.textContent=f.h;
      if(f.c==='word'){front.style.fontSize='calc(var(--s)*'+Math.min(.34,1.4/f.h.length).toFixed(3)+')';}
      if(f.c==='num'){front.style.color=DOTC[f.k-1];front.style.fontSize='calc(var(--s)*.62)';}
      if(f.c==='t'&&type==='en'){front.style.color='var(--purple-d)';}
      if(f.c==='t'&&type==='abc'){front.style.color=U.pick(['#E85F4C','#7A58E6','#27B276','#E96AA3']);}}
    b.append(U.el('span','mem-back'),front);
    cards.push({el:b,k,seen:false,open:false,matched:false,was:false});});});
  U.shuffle(cards).forEach(c=>board.appendChild(c.el));
  /* оразмеряване: най-големи квадратни карти, които се събират */
  function fit(){
    const N=cards.length,gap=Math.max(8,Math.min(W(),H())*.03);let best=null;
    function W(){return wrap.clientWidth;} function H(){return wrap.clientHeight;}
    const sr=el.getBoundingClientRect(),cp=document.getElementById('capyPlay'),mr=cp?cp.getBoundingClientRect():null;
    const pl=(innerWidth>innerHeight&&mr)?Math.max(0,Math.min(130,mr.right+4-(innerWidth-el.offsetWidth)/2)):0;
    wrap.style.paddingLeft=pl+'px';
    const w=W()-pl,h=H();
    const opts=[];
    for(let c=2;c<=8;c++){const r=Math.ceil(N/c);opts.push({c,r,s:Math.floor(Math.min((w-gap*(c-1))/c,(h-gap*(r-1))/r)),ex:N%c===0});}
    best=opts.reduce((x,y)=>y.s>x.s?y:x);
    const ex=opts.filter(o=>o.ex&&o.s>=best.s*.7).reduce((x,y)=>!x||y.s>x.s?y:x,null);if(ex)best=ex;
    const s=Math.max(40,Math.min(best.s,200));
    board.style.setProperty('--s',s+'px');board.style.gap=gap+'px';board.style.width=(best.c*s+(best.c-1)*gap)+'px';}
  fit();let ro=null;
  if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(wrap);}else addEventListener('resize',fit);
  let sel=[],lock=false,left=pairs.length;
  const sayW=(l,t)=>Promise.race([ctx.say(l,t),U.wait(2600)]);
  function tap(c){
    if(lock||dead||c.matched||c.open)return;
    c.was=c.seen;c.seen=true;c.open=true;c.el.classList.add('open');Capy.sfx.tap();sel.push(c);
    if(sel.length<2)return;
    lock=true;const [a,b]=sel;sel=[];
    later(()=>{
      if(a.k===b.k){
        [a,b].forEach(x=>{x.matched=true;x.open=false;x.el.classList.remove('open');x.el.classList.add('matched');});
        ctx.right(b.el);left--;const p=pairs[a.k];
        if(left===0){const sp=p.say?sayW(p.say[0],p.say[1]):U.wait(500);
          sp.then(()=>U.wait(500)).then(()=>{if(!dead)ctx.done();});}
        else{if(p.say)ctx.say(p.say[0],p.say[1]);lock=false;}
      }else{
        if(a.was||b.was)ctx.wrong(b.el);
        later(()=>{[a,b].forEach(x=>{x.open=false;x.el.classList.remove('open');});later(()=>{lock=false;},250);},650);
      }
    },520);
  }
  cards.forEach(c=>{c.el.onclick=()=>tap(c);});
  return function cleanup(){dead=true;timers.forEach(clearTimeout);timers.clear();if(ro)ro.disconnect();removeEventListener('resize',fit);};
}});
})();
