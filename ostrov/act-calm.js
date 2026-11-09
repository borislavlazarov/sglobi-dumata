/* ===== „Спокойно, Капи" — самоконтрол и търпение =====
   Режим A: „Хвани Капи, не пипай крокодила" (go/no-go).  Режим B: „Изчакай" (отложено удовлетворение).
   Режимът се избира на случаен принцип (на трудност 1 — винаги A). За тестове: ?mode=A|B */
'use strict';
(function(){
const U=Capy.util;
const T_A='Хвани Капи, но не пипай крокодила!',T_B='Изчакай да стане готово.',T_MORE='Още малко.',T_DONE='Готово!';
Capy.speech('bg',[T_A,T_B,T_MORE,T_DONE]);

Capy.css(`
.calm-root{width:100%;flex:1;min-height:0;position:relative;border-radius:26px;overflow:hidden;display:flex;flex-direction:column;align-items:center;
  box-shadow:0 6px 0 rgba(30,70,100,.18),0 14px 28px rgba(20,80,110,.22);}
/* ---------- режим A: лагуна ---------- */
.calm-a{justify-content:space-evenly;gap:1.5cqh;padding:1.5cqh 2cqw 2cqh;
  background:radial-gradient(60% 40% at 20% 8%,rgba(255,255,255,.35),transparent 70%),
  radial-gradient(50% 30% at 85% 90%,rgba(255,255,255,.18),transparent 70%),
  linear-gradient(180deg,#7FE3E6 0%,#37BFD6 45%,#1E98BE 100%);}
.calm-a::before{content:"";position:absolute;inset:-20%;pointer-events:none;
  background:repeating-radial-gradient(circle at 30% 30%,transparent 0 5cqmin,rgba(255,255,255,.07) 5cqmin 6cqmin);animation:calmdrift 14s linear infinite;}
@keyframes calmdrift{to{transform:translate(6cqmin,3cqmin);}}
.calm-legend{position:relative;z-index:2;display:flex;align-items:center;gap:clamp(8px,2.4cqmin,20px);background:rgba(255,255,255,.88);
  border-radius:999px;padding:.4cqh 1.6cqmin;box-shadow:0 4px 0 rgba(0,0,0,.12);flex:none;}
.calm-lg{display:flex;align-items:center;gap:.3em;font-size:clamp(20px,5.4cqmin,38px);line-height:1;}
.calm-lg .calm-coin{width:clamp(34px,8cqmin,56px);flex:none;}
.calm-dots{display:flex;gap:3px;flex-wrap:wrap;max-width:26cqmin;margin-left:.3em;}
.calm-dots i{width:clamp(6px,1.4cqmin,10px);aspect-ratio:1;border-radius:50%;background:rgba(40,60,100,.18);}
.calm-dots i.on{background:#3FCF8E;}
.calm-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(2,var(--hs));gap:1.2cqh 3cqw;justify-content:center;align-content:center;
  --hs:min(43cqw,27cqh);}
@container (min-aspect-ratio:1/1){
  .calm-grid{grid-template-columns:repeat(3,var(--hs));gap:1.5cqh 3cqw;--hs:min(25cqw,38cqh);}
}
.calm-hole{position:relative;width:var(--hs);height:var(--hs);padding:0;background:none;border-radius:20%;display:block;}
.calm-w{position:absolute;left:3%;right:3%;bottom:4%;height:38%;border-radius:50%;
  background:radial-gradient(ellipse at 50% 40%,#0F6C8F 0,#1E8DB3 70%,#4FC6DD 100%);box-shadow:inset 0 .6cqmin 1cqmin rgba(0,40,70,.45);}
.calm-clip{position:absolute;left:0;right:0;top:0;bottom:22%;overflow:hidden;}
.calm-pop{position:absolute;left:11%;width:78%;aspect-ratio:1;bottom:-6%;transform:translateY(112%);transition:transform .22s ease-in;}
.calm-hole.up .calm-pop{transform:none;transition:transform .34s cubic-bezier(.3,1.7,.5,1);}
.calm-coin{position:relative;width:100%;aspect-ratio:1;border-radius:50%;overflow:hidden;border:calc(var(--hs)*.035) solid #fff;
  box-shadow:0 .8cqmin 0 rgba(0,0,0,.16);display:flex;align-items:center;justify-content:center;}
.calm-coin.cp{background:radial-gradient(circle at 50% 40%,#FFF6CF,#FFD36A);}
.calm-coin.cr{background:radial-gradient(circle at 50% 40%,#B7F29B,#3FAE58);border-color:#FF5C5C;}
.calm-coin.cb{background:radial-gradient(circle at 50% 40%,#FFC9BE,#FF6B5B);border-color:#FF5C5C;}
.calm-coin .capy{position:absolute;width:170%;left:-72.4%;top:3%;}
.calm-coin .em{font-size:calc(var(--hs)*.5);line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25));}
.calm-lg .calm-coin .em{font-size:clamp(20px,5cqmin,34px);}
.calm-lg .calm-coin .capy{width:170%;}
.calm-lily{position:absolute;left:-2%;right:-2%;bottom:0;height:31%;border-radius:50%;pointer-events:none;
  background:radial-gradient(ellipse at 40% 30%,#8BEA9E 0,#3CBE6A 60%,#27A058 100%);box-shadow:0 .5cqmin 0 #1B7E45,inset 0 -.4cqmin 0 rgba(0,0,0,.12);}
.calm-lily::before{content:"";position:absolute;left:54%;top:-3%;width:46%;height:60%;background:#2AA5C8;clip-path:polygon(0 50%,100% 0,100% 100%);opacity:.0;}
.calm-hole:nth-child(odd) .calm-lily::after{content:"🌸";position:absolute;right:6%;top:-22%;font-size:calc(var(--hs)*.22);}
.calm-hole:nth-child(3n) .calm-lily::after{content:"🌼";position:absolute;left:8%;top:-18%;font-size:calc(var(--hs)*.2);}
.calm-hole.wave .calm-pop{animation:calmwave .5s ease-in-out;}
@keyframes calmwave{25%{transform:rotate(-14deg);}75%{transform:rotate(14deg);}}
.calm-hole.hit .calm-pop{animation:calmhit .35s ease-out;}
@keyframes calmhit{40%{transform:translateY(-8%) scale(1.14);}}
.calm-hole.bite .calm-pop{animation:calmbite .4s ease-in-out;}
@keyframes calmbite{25%{transform:scale(1.18) rotate(-8deg);}50%{transform:scale(1.18) rotate(8deg);}}
.calm-hole.no{animation:shake .42s;}
.calm-hole.plink .calm-w{animation:calmplink .5s ease-out;}
@keyframes calmplink{50%{transform:scale(1.06,1.1);filter:brightness(1.3);}}
/* ---------- режим B: градина ---------- */
.calm-b{justify-content:center;gap:3cqh;
  background:radial-gradient(circle at 82% 12%,#FFF6B0 0 5%,rgba(255,246,176,.45) 6% 11%,transparent 12%),
  radial-gradient(130% 36% at 30% 108%,#92E3A3 0 60%,transparent 61%),radial-gradient(120% 30% at 85% 112%,#6FCB88 0 60%,transparent 61%),
  linear-gradient(180deg,#FFE7F5 0%,#E2F3FF 100%);}
.calm-trials{position:absolute;top:2.2cqh;left:50%;transform:translateX(-50%);display:flex;gap:1.6cqmin;z-index:2;}
.calm-trials i{width:clamp(14px,3.4cqmin,24px);aspect-ratio:1;border-radius:50%;background:rgba(120,90,160,.22);box-shadow:inset 0 0 0 2px rgba(255,255,255,.6);transition:all .3s;}
.calm-trials i.cur{background:#FFC933;transform:scale(1.25);} .calm-trials i.on{background:#3FCF8E;}
.calm-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3.5cqh;position:relative;z-index:1;}
@container (min-aspect-ratio:1/1){.calm-mid{flex-direction:row;gap:7cqw;}}
.calm-ow{--os:min(74cqw,44cqh);position:relative;width:var(--os);height:var(--os);padding:0;background:none;border-radius:50%;display:block;
  animation:calmin .5s cubic-bezier(.3,1.6,.5,1);}
@container (min-aspect-ratio:1/1){.calm-ow{--os:min(42cqw,70cqh);}}
@keyframes calmin{from{transform:scale(.3);opacity:0;}}
.calm-ow::before{content:"";position:absolute;inset:-12%;border-radius:50%;background:radial-gradient(circle,rgba(255,224,102,.95) 0,rgba(255,224,102,.45) 45%,transparent 70%);opacity:0;pointer-events:none;}
.calm-ow.ready::before{opacity:1;animation:calmglow 1.1s ease-in-out infinite;}
@keyframes calmglow{50%{transform:scale(1.12);opacity:.75;}}
.calm-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none;overflow:visible;}
.calm-ring circle{fill:none;stroke-linecap:round;stroke-width:5;}
.calm-ring .bg{stroke:rgba(255,255,255,.75);} .calm-ring .fg{stroke:#B48CFF;stroke-dasharray:289.03;stroke-dashoffset:289.03;}
.calm-ow.ready .calm-ring .fg{stroke:#3FCF8E;}
.calm-obj{position:absolute;inset:11%;width:78%;height:78%;overflow:visible;pointer-events:none;filter:drop-shadow(0 .8cqmin 1cqmin rgba(80,40,120,.25));}
.calm-obj.wig{animation:calmwig .7s ease-in-out;} @keyframes calmwig{20%{transform:rotate(-7deg) scale(1.03);}50%{transform:rotate(6deg);}80%{transform:rotate(-4deg);}}
.calm-ow.ready .calm-obj{animation:calmready 1.1s ease-in-out infinite;} @keyframes calmready{50%{transform:scale(1.06);}}
.calm-star{position:absolute;right:-3%;top:-6%;font-size:calc(var(--os)*.3);line-height:1;transform:scale(0);pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.2));}
.calm-ow.ready .calm-star{animation:calmstar .6s cubic-bezier(.3,1.9,.5,1) forwards;} @keyframes calmstar{to{transform:scale(1) rotate(12deg);}}
.calm-ow.no{animation:shake .42s;}
.calm-ow.reveal{animation:calmrev .9s ease-out;} @keyframes calmrev{30%{transform:scale(1.18) rotate(-4deg);}60%{transform:scale(.97);}}
.calm-rays{position:absolute;inset:-35%;border-radius:50%;pointer-events:none;opacity:0;
  background:repeating-conic-gradient(rgba(255,226,120,.55) 0 10deg,transparent 10deg 30deg);-webkit-mask-image:radial-gradient(circle,#000 25%,transparent 68%);mask-image:radial-gradient(circle,#000 25%,transparent 68%);}
.calm-ow.reveal .calm-rays{opacity:1;animation:calmspin 4s linear infinite;} @keyframes calmspin{to{transform:rotate(360deg);}}
.calm-prize{position:absolute;left:50%;top:40%;font-size:calc(var(--os)*.2);pointer-events:none;animation:calmprize 1.6s ease-out forwards;}
@keyframes calmprize{from{transform:translate(-50%,0) scale(.3);opacity:1;}to{transform:translate(calc(-50% + var(--dx)),calc(var(--dy))) scale(1.2);opacity:0;}}
.calm-breath{--bs:min(24cqw,14cqh);width:var(--bs);aspect-ratio:1;border-radius:50%;flex:none;position:relative;
  background:radial-gradient(circle at 40% 35%,#fff,#CDB6FF 60%,#A98BFF);box-shadow:0 0 0 .8cqmin rgba(255,255,255,.6),0 .8cqmin 1.6cqmin rgba(120,80,200,.3);animation:calmbr 4.6s ease-in-out infinite;}
@container (min-aspect-ratio:1/1){.calm-breath{--bs:min(18cqw,34cqh);}}
.calm-breath::after{content:"";position:absolute;inset:-14%;border-radius:50%;border:3px solid rgba(255,255,255,.7);animation:calmbr2 4.6s ease-in-out infinite;}
@keyframes calmbr{0%,100%{transform:scale(.62);opacity:.7;}50%{transform:scale(1);opacity:1;}}
@keyframes calmbr2{0%,100%{opacity:0;}50%{opacity:.8;}}
.calm-fake{position:absolute;pointer-events:none;font-size:calc(var(--os)*.13);animation:calmfake 1.3s ease-in-out forwards;}
@keyframes calmfake{0%{opacity:0;transform:scale(.2);}35%{opacity:1;transform:scale(1.2) rotate(20deg);}100%{opacity:0;transform:scale(.6);}}
.calm-bfly{position:absolute;left:0;z-index:3;pointer-events:none;font-size:clamp(34px,10cqmin,64px);animation:calmfly 3.4s linear forwards;}
.calm-bfly i{display:block;font-style:normal;animation:calmflap .8s ease-in-out infinite alternate;}
@keyframes calmfly{from{transform:translateX(-14cqw);}to{transform:translateX(112cqw);}}
@keyframes calmflap{from{transform:translateY(-5cqh) rotate(-12deg);}to{transform:translateY(5cqh) rotate(12deg);}}
.calm-wait{position:absolute;z-index:4;left:50%;font-size:clamp(26px,7cqmin,48px);pointer-events:none;animation:calmwait 1.3s ease-out forwards;}
@keyframes calmwait{from{transform:translate(-50%,0);opacity:1;}to{transform:translate(-50%,-9cqh);opacity:0;}}
/* общи частици */
.calm-obj .steam{animation:calmsteam 2.4s ease-in-out infinite;} @keyframes calmsteam{from{transform:translateY(8px);opacity:0;}50%{opacity:.8;}to{transform:translateY(-12px);opacity:0;}}
.calm-petal{transform-origin:100px 118px;transform:rotate(calc(var(--a)*var(--p))) scale(calc(.62 + .38*var(--p)));}
.calm-fc{transform-origin:100px 118px;transform:scale(var(--p));opacity:calc(var(--p)*3 - 1.6);}
.calm-sq{transform-origin:100px 176px;transform:scale(calc(.62 + .38*var(--p)),calc(.5 + .5*var(--p)));}
.calm-fr{transform-origin:100px 140px;transform:scale(calc(.12 + .88*var(--p)));}
.calm-cherry{transform:translateY(calc((1 - var(--p))*-26px));opacity:calc((var(--p) - .82)*5.5);}
.calm-lid{transform-origin:38px 134px;transform:rotate(calc(var(--p)*-52deg));}
.calm-pearl{transform:translateY(calc((1 - var(--p))*12px));opacity:calc((var(--p) - .55)*2.4);}
`);

/* ---------- SVG-предмети за режим B: всичко се движи от --p (0..1) ---------- */
const OBJ={
  flower:{prize:['🦋','🌸','✨'],svg:()=>`<svg class="calm-obj" viewBox="0 0 200 200">
    <ellipse cx="100" cy="190" rx="52" ry="8" fill="rgba(0,0,0,.12)"/>
    <path d="M100 118 Q94 160 100 192" stroke="#3FB86A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="78" cy="158" rx="22" ry="9" fill="#52CC7B" transform="rotate(-28 78 158)"/><ellipse cx="124" cy="168" rx="22" ry="9" fill="#52CC7B" transform="rotate(28 124 168)"/>
    <ellipse class="calm-petal" style="--a:-74deg" cx="100" cy="72" rx="17" ry="44" fill="#FF8FC0"/><ellipse class="calm-petal" style="--a:74deg" cx="100" cy="72" rx="17" ry="44" fill="#FF8FC0"/>
    <ellipse class="calm-petal" style="--a:-37deg" cx="100" cy="68" rx="18" ry="46" fill="#FF77B2"/><ellipse class="calm-petal" style="--a:37deg" cx="100" cy="68" rx="18" ry="46" fill="#FF77B2"/>
    <ellipse class="calm-petal" style="--a:0deg" cx="100" cy="64" rx="19" ry="48" fill="#FF5FA5"/>
    <circle class="calm-fc" cx="100" cy="112" r="16" fill="#FFD23F"/><circle class="calm-fc" cx="95" cy="107" r="5" fill="#FFF0A0"/></svg>`},
  squishy:{prize:['💖','✨','💗'],svg:()=>`<svg class="calm-obj" viewBox="0 0 200 200">
    <ellipse cx="100" cy="186" rx="64" ry="8" fill="rgba(0,0,0,.12)"/>
    <g class="calm-sq"><ellipse cx="100" cy="116" rx="76" ry="64" fill="#FF9EC8"/><ellipse cx="100" cy="124" rx="76" ry="56" fill="#FFB5D6"/>
    <ellipse cx="68" cy="82" rx="26" ry="14" fill="#fff" opacity=".55" transform="rotate(-24 68 82)"/>
    <circle cx="74" cy="118" r="8" fill="#4A2A5A"/><circle cx="126" cy="118" r="8" fill="#4A2A5A"/><circle cx="77" cy="115" r="3" fill="#fff"/><circle cx="129" cy="115" r="3" fill="#fff"/>
    <ellipse cx="58" cy="136" rx="11" ry="7" fill="#FF6F9E" opacity=".6"/><ellipse cx="142" cy="136" rx="11" ry="7" fill="#FF6F9E" opacity=".6"/>
    <path d="M88 136 q12 12 24 0" stroke="#4A2A5A" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>`},
  cake:{prize:['🍒','✨','🎉'],svg:()=>`<svg class="calm-obj" viewBox="0 0 200 200">
    <ellipse cx="100" cy="190" rx="60" ry="8" fill="rgba(0,0,0,.12)"/>
    <path class="steam" d="M78 40 q-10 -10 0 -20 q10 -10 0 -20" transform="translate(0 30)" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" style="animation-delay:-.2s"/>
    <path class="steam" d="M122 40 q-10 -10 0 -20 q10 -10 0 -20" transform="translate(0 40)" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" style="animation-delay:-1.2s"/>
    <g class="calm-fr"><ellipse cx="100" cy="132" rx="56" ry="24" fill="#FFB4D2"/><ellipse cx="100" cy="106" rx="45" ry="22" fill="#FF9EC6"/><ellipse cx="100" cy="82" rx="33" ry="20" fill="#FF86B6"/>
    <path d="M100 52 q-12 14 0 22 q12 -8 0 -22z" fill="#FF6FA6"/></g>
    <circle class="calm-cherry" cx="100" cy="50" r="12" fill="#E8283E"/><circle class="calm-cherry" cx="96" cy="46" r="4" fill="#FF8A98"/>
    <path d="M52 134 L148 134 L136 190 L64 190 Z" fill="#FFB74D"/>
    <path d="M66 134 L72 190 M84 134 L86 190 M102 134 V190 M120 134 L118 190 M138 134 L132 190" stroke="#F39A1F" stroke-width="5"/></svg>`},
  shell:{prize:['✨','💎','🌟'],svg:()=>`<svg class="calm-obj" viewBox="0 0 200 200">
    <ellipse cx="100" cy="186" rx="72" ry="8" fill="rgba(0,0,0,.12)"/>
    <path d="M36 136 Q101 226 166 136 Z" fill="#FFB38A"/><path d="M36 136 Q101 226 166 136 Z" fill="none" stroke="#F58C5E" stroke-width="5" stroke-linejoin="round"/>
    <path d="M101 140 V198 M72 142 L84 192 M130 142 L118 192" stroke="#F58C5E" stroke-width="4" fill="none" opacity=".7"/>
    <ellipse cx="101" cy="136" rx="65" ry="10" fill="#FF8FB0"/>
    <g class="calm-pearl"><circle cx="101" cy="130" r="19" fill="#FFF"/><circle cx="101" cy="130" r="19" fill="url(#pg)"/><circle cx="94" cy="123" r="6" fill="#fff" opacity=".9"/></g>
    <defs><radialGradient id="pg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#E4D4FF"/><stop offset="1" stop-color="#C5A8FF"/></radialGradient></defs>
    <g class="calm-lid"><path d="M38 134 Q103 36 168 134 Z" fill="#FFC9A6"/><path d="M38 134 Q103 36 168 134 Z" fill="none" stroke="#F58C5E" stroke-width="5" stroke-linejoin="round"/>
    <path d="M103 128 V98 M76 128 Q82 108 90 100 M130 128 Q124 108 116 100" stroke="#F58C5E" stroke-width="4" fill="none" opacity=".7"/></g></svg>`}
};
const OBJ_KEYS=Object.keys(OBJ);

/* ---------- настройки по трудност ---------- */
const STAY=[2400,2100,1900,1700,1500],COUNT=[12,13,15,16,18],NOGO=[.3,.32,.35,.38,.4];
const WAIT=[[3000,4000],[4000,5200],[5200,6600],[6200,7800],[7000,9000]];
const DECOYS=[0,0,1,2,3];

Capy.registerActivity('calm',{icon:'🧘',start(el,ctx){
  const diff=Math.max(1,Math.min(5,ctx.diff)),di=diff-1;
  let alive=true;const timers=new Set();
  const sleep=ms=>new Promise(r=>{timers.add(setTimeout(r,ms));});
  const later=(fn,ms)=>{timers.add(setTimeout(()=>{if(alive)fn();},ms));};
  const forced=new URLSearchParams(location.search).get('mode');
  const mode=diff===1?'A':(forced==='A'||forced==='B'?forced:U.pick(['A','B']));
  const root=U.el('div','calm-root '+(mode==='A'?'calm-a':'calm-b'));root.dataset.mode=mode;el.appendChild(root);
  let stopFns=[];
  const cleanup=()=>{alive=false;timers.forEach(clearTimeout);timers.clear();stopFns.forEach(f=>{try{f();}catch(e){}});stopFns=[];};

  const capyCoin=()=>'<div class="calm-coin cp">'+Capy.capySVG()+'</div>';
  /* ================= РЕЖИМ A ================= */
  function modeA(){
    const crab=diff>=4;
    root.innerHTML=`<div class="calm-legend"><div class="calm-lg">${capyCoin()}👆</div>
      <div class="calm-lg"><div class="calm-coin cr"><span class="em">🐊</span></div>🚫</div>
      ${crab?'<div class="calm-lg"><div class="calm-coin cb"><span class="em">🦀</span></div>🚫</div>':''}<div class="calm-dots"></div></div>
      <div class="calm-grid"></div>`;
    const grid=root.querySelector('.calm-grid'),dotsBox=root.querySelector('.calm-dots'),holes=[];
    for(let i=0;i<6;i++){
      const h=U.el('button','calm-hole','<i class="calm-w"></i><div class="calm-clip"><div class="calm-pop"></div></div><i class="calm-lily"></i>');
      h.setAttribute('aria-label','дупка');h.addEventListener('pointerdown',e=>{e.preventDefault();tap(h);});
      h.addEventListener('click',e=>{if(e.detail===0)tap(h);});grid.appendChild(h);holes.push(h);
    }
    /* списък от появявания: първите две са винаги Капи; не повече от 2 забранени подред */
    const n=COUNT[di],nog=Math.round(n*NOGO[di]);
    let list;
    for(let tries=0;;tries++){
      const arr=Array(n).fill('capy');U.sample(Array.from({length:n-2},(_,i)=>i+2),nog).forEach(i=>arr[i]='nogo');
      let bad=false;for(let i=2;i<n;i++)if(arr[i]==='nogo'&&arr[i-1]==='nogo'&&arr[i-2]==='nogo')bad=true;
      if(!bad||tries>40){list=arr;break;}
    }
    list=list.map((k,i)=>k==='capy'?'capy':(crab&&i%2===0?'crab':'croc'));
    for(let i=0;i<n;i++)dotsBox.appendChild(U.el('i'));
    let cur=null,correct=0,lastHole=-1;

    function tap(h){
      if(!alive)return;
      if(!cur||cur.h!==h||cur.tapped){h.classList.remove('plink');void h.offsetWidth;h.classList.add('plink');Capy.sfx.tap();return;}
      cur.tapped=true;
      if(cur.kind==='capy'){
        h.classList.add('hit');h.removeAttribute('data-ok');Capy.sfx.pop();ctx.sparkle(h);correct++;
        if(correct%4===0)ctx.right(h);
      }else{
        h.classList.add('bite');ctx.wrong(h);
      }
      cur.wake();
    }
    async function appear(kind,k){
      let hi;do{hi=U.rnd(0,5);}while(hi===lastHole);lastHole=hi;
      const h=holes[hi],pop=h.querySelector('.calm-pop');
      pop.innerHTML=kind==='capy'?capyCoin():kind==='crab'?'<div class="calm-coin cb"><span class="em">🦀</span></div>':'<div class="calm-coin cr"><span class="em">🐊</span></div>';
      let wake;const woke=new Promise(r=>{wake=r;});
      cur={h,kind,tapped:false,wake};
      if(kind==='capy')h.dataset.ok='1';else h.dataset.nogo='1';
      void h.offsetWidth;h.classList.add('up');
      Capy.sfx.tone({f:340,f2:620,dur:.1,g:.07});
      const stay=STAY[di];
      await Promise.race([sleep(stay-(kind==='capy'?520:0)),woke]);
      if(!alive)return;
      if(!cur.tapped&&kind==='capy'){h.classList.add('wave');await Promise.race([sleep(520),woke]);if(!alive)return;}
      else if(cur.tapped)await sleep(kind==='capy'?380:480);
      if(!alive)return;
      h.classList.remove('up','wave','hit','bite');h.removeAttribute('data-ok');h.removeAttribute('data-nogo');cur=null;
      dotsBox.children[k]&&dotsBox.children[k].classList.add('on');
      await sleep(380);
    }
    (async()=>{
      await Promise.race([ctx.prompt('bg',T_A),sleep(5000)]);await sleep(500);
      for(let k=0;k<n&&alive;k++){await appear(list[k],k);if(!alive)return;await sleep(U.rnd(600,1200));}
      if(alive){await sleep(300);ctx.done();}
    })();
  }

  /* ================= РЕЖИМ B ================= */
  function modeB(){
    root.innerHTML=`<div class="calm-trials"><i></i><i></i><i></i></div><div class="calm-mid"></div>`;
    const mid=root.querySelector('.calm-mid'),trialDots=root.querySelectorAll('.calm-trials i');
    const order=U.shuffle(OBJ_KEYS).slice(0,3);
    let ticker=0,lastSay=0;stopFns.push(()=>clearInterval(ticker));

    function trial(t){
      return new Promise(resolve=>{
        trialDots.forEach((d,i)=>{d.className=i<t?'on':i===t?'cur':'';});
        mid.innerHTML='';
        const key=order[t],O=OBJ[key];
        const wrap=U.el('button','calm-ow',`<span class="calm-rays"></span>
          <svg class="calm-ring" viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="46"/><circle class="fg" cx="50" cy="50" r="46"/></svg>
          ${O.svg()}<span class="calm-star">⭐</span>`);
        wrap.setAttribute('aria-label','изчакай');
        const breath=U.el('div','calm-breath');
        mid.appendChild(wrap);mid.appendChild(breath);
        const obj=wrap.querySelector('.calm-obj'),fg=wrap.querySelector('.fg');
        const total=U.rnd(WAIT[di][0],WAIT[di][1]);
        let elapsed=0,shown=0,ready=false,finished=false,last=performance.now();
        /* примамки */
        const decoys=[];const kinds=U.sample(['sparkle','wiggle','butterfly'],DECOYS[di]);
        kinds.forEach((kd,i)=>decoys.push({kind:kd,at:.18+(.62*(i+Math.random()*.6))/Math.max(1,kinds.length),done:false}));
        const fireDecoy=kd=>{
          if(kd==='sparkle'){for(let i=0;i<3;i++){const s=U.el('span','calm-fake','✨');s.style.left=(15+Math.random()*60)+'%';s.style.top=(8+Math.random()*60)+'%';s.style.animationDelay=(i*.25)+'s';wrap.appendChild(s);later(()=>s.remove(),2000);}}
          else if(kd==='wiggle'){obj.classList.remove('wig');void obj.getBoundingClientRect();obj.classList.add('wig');later(()=>obj.classList.remove('wig'),800);}
          else{const b=U.el('div','calm-bfly','<i>🦋</i>');b.style.top=(10+Math.random()*30)+'%';root.appendChild(b);later(()=>b.remove(),3600);}
        };
        const render=()=>{obj.style.setProperty('--p',shown.toFixed(3));fg.style.strokeDashoffset=(289.03*(1-shown)).toFixed(1);};
        render();
        const becomeReady=()=>{ready=true;wrap.classList.add('ready');wrap.dataset.ok='1';Capy.sfx.ding();Capy.sfx.tone({f:1568,dur:.5,g:.12,at:.18});};
        clearInterval(ticker);
        ticker=setInterval(()=>{
          if(!alive||finished)return;
          const now=performance.now(),dt=Math.min(100,now-last);last=now;
          if(!ready){
            elapsed+=dt;
            decoys.forEach(d=>{if(!d.done&&elapsed/total>=d.at&&total-elapsed>1300){d.done=true;fireDecoy(d.kind);}});
            if(elapsed>=total){elapsed=total;becomeReady();}
          }
          const target=ready?1:Math.min(1,elapsed/total);
          shown+=(target-shown)*Math.min(1,dt/130);if(Math.abs(target-shown)<.001)shown=target;
          render();
        },40);
        const act=()=>{
          if(!alive||finished)return;
          if(!ready){
            ctx.wrong(wrap);elapsed=Math.max(0,elapsed-total*.2);
            const w=U.el('span','calm-wait','⏳');wrap.appendChild(w);later(()=>w.remove(),1400);
            const nw=Date.now();if(nw-lastSay>5000){lastSay=nw;ctx.say('bg',T_MORE);}
            return;
          }
          finished=true;ready=false;wrap.removeAttribute('data-ok');clearInterval(ticker);
          shown=1;render();ctx.right(wrap);wrap.classList.add('reveal');Capy.confetti(1100);
          for(let i=0;i<6;i++){const s=U.el('span','calm-prize',U.pick(O.prize));const a=Math.PI*(1.1+.8*i/5)+(Math.random()-.5)*.3,d=40+Math.random()*30;
            s.style.setProperty('--dx',(Math.cos(a)*d*1.6)+'cqmin');s.style.setProperty('--dy',(Math.sin(a)*d)+'cqmin');s.style.animationDelay=(i*.08)+'s';wrap.appendChild(s);}
          if(t<2)ctx.say('bg',T_DONE);
          later(()=>resolve(),2200);
        };
        wrap.addEventListener('pointerdown',e=>{e.preventDefault();act();});
        wrap.addEventListener('click',e=>{if(e.detail===0)act();});
      });
    }
    (async()=>{
      await Promise.race([ctx.prompt('bg',T_B),sleep(5000)]);await sleep(500);
      for(let t=0;t<3&&alive;t++){await trial(t);if(!alive)return;}
      trialDots.forEach(d=>{d.className='on';});
      if(alive){await sleep(300);ctx.done();}
    })();
  }

  if(mode==='A')modeA();else modeB();
  return cleanup;
}});
})();
