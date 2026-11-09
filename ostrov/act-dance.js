/* ===== „Повтори танца" — последователност (Simon), памет и внимание =====
   Капи танцува на сцена, подиуми светват един по един; детето повтаря. Без лимит във времето. */
'use strict';
(function(){
const U=Capy.util;
const T_WATCH='Гледай внимателно и повтори танца.',T_TURN='Сега е твой ред.',T_AGAIN='Гледай пак.';
Capy.speech('bg',[T_WATCH,T_TURN,T_AGAIN]);

/* дължини на трите поредици във всеки рунд, по трудност */
const LENS=[[2,2,3],[2,3,4],[3,4,5],[4,5,5],[4,5,6]];
/* подиуми: цвят, сянка, емоджи за движение, нота (пентатоника C-D-E-G-A) */
const PADS=[
  {c:'#FF7E6B',d:'#D9503D',ico:'👏',f:523.25},
  {c:'#4DABF7',d:'#2B86D1',ico:'🙌',f:659.25},
  {c:'#3FCF8E',d:'#22A06B',ico:'💃',f:783.99},
  {c:'#9B7BFF',d:'#6E4FD6',ico:'⭐',f:880.0}
];

Capy.css(`
.dance-root{width:100%;flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;gap:clamp(6px,1.8cqh,16px);
  --pad:min(calc((96cqw - (var(--n) - 1)*2.4cqw)/var(--n)),26cqh,200px);}
.dance-stage{position:relative;flex:1;min-height:0;width:100%;border-radius:26px;overflow:hidden;
  background:radial-gradient(90% 60% at 50% 70%,#7B2F9E 0,transparent 70%),linear-gradient(180deg,#1B1248 0%,#3C1B73 55%,#6B2A8C 100%);
  box-shadow:0 6px 0 rgba(40,20,80,.25),0 14px 28px rgba(30,10,70,.35);}
/* завеси */
.dance-curtain{position:absolute;top:0;bottom:0;width:15%;z-index:4;pointer-events:none;
  background:repeating-linear-gradient(90deg,#E0346E 0 9px,#B8205A 9px 18px,#F2518A 18px 22px);box-shadow:0 0 22px rgba(0,0,0,.45);}
.dance-curtain.l{left:0;border-radius:0 0 60% 0/0 0 38% 0;transform-origin:0 0;}
.dance-curtain.r{right:0;border-radius:0 0 0 60%/0 0 0 38%;}
.dance-valance{position:absolute;left:0;right:0;top:0;height:clamp(18px,7cqh,40px);z-index:5;pointer-events:none;
  background:radial-gradient(circle at 50% 0,#FFD23F 0 14%,transparent 15%) 0 0/10% 100% repeat-x,
  radial-gradient(circle at 50% 0,#C2255C 0 62%,transparent 64%) 0 0/10% 100% repeat-x;
  filter:drop-shadow(0 4px 4px rgba(0,0,0,.35));}
/* прожектори */
.dance-spot{position:absolute;top:-3%;width:36%;height:92%;z-index:1;pointer-events:none;transform-origin:50% 0;mix-blend-mode:screen;
  clip-path:polygon(47% 0,53% 0,100% 100%,0 100%);
  background:linear-gradient(180deg,var(--sc),rgba(255,255,255,0) 92%);opacity:.55;animation:dsway 3.4s ease-in-out infinite alternate;}
.dance-spot.s1{left:6%;--sc:rgba(255,143,192,.95);} .dance-spot.s2{left:32%;--sc:rgba(120,230,255,.9);animation-delay:-1.4s;animation-duration:4.1s;}
.dance-spot.s3{left:58%;--sc:rgba(255,226,110,.9);animation-delay:-2.3s;}
@keyframes dsway{from{transform:rotate(-13deg);}to{transform:rotate(13deg);}}
/* дискотопка */
.dance-ball{position:absolute;top:clamp(26px,9cqh,52px);right:18%;z-index:3;width:clamp(26px,8cqmin,54px);aspect-ratio:1;pointer-events:none;}
.dance-ball::before{content:"";position:absolute;left:50%;top:-100cqh;width:2px;height:100cqh;background:rgba(255,255,255,.5);}
.dance-ball i{position:absolute;inset:0;border-radius:50%;overflow:hidden;
  background:repeating-conic-gradient(#fff 0 12%,#B9C4E6 0 25%,#8895C4 0 37%,#E6ECFF 0 50%);box-shadow:0 0 18px 4px rgba(255,255,255,.55);animation:dball 6s linear infinite;}
.dance-ball i::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.9),transparent 40%),radial-gradient(circle at 70% 80%,rgba(60,30,120,.55),transparent 60%);}
@keyframes dball{to{transform:rotate(360deg);}}
/* под */
.dance-floor{position:absolute;left:-30%;right:-30%;bottom:-8%;height:58%;z-index:2;pointer-events:none;
  transform:perspective(520px) rotateX(64deg);transform-origin:50% 100%;
  background:repeating-conic-gradient(#FF8FC0 0 25%,#7A58E6 0 50%) 0 0/12% 26%;
  -webkit-mask-image:linear-gradient(transparent,#000 45%);mask-image:linear-gradient(transparent,#000 45%);}
.dance-floor::after{content:"";position:absolute;inset:0;background:repeating-conic-gradient(#FFD23F 0 25%,#35BCD0 0 50%) 0 0/12% 26%;opacity:0;animation:dflick 1.2s steps(1) infinite;}
.dance-root[data-phase=watch] .dance-floor::after{animation-duration:.6s;}
@keyframes dflick{50%{opacity:.85;}}
.dance-flash{position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;mix-blend-mode:screen;
  background:radial-gradient(circle at 50% 75%,var(--glow,#fff) 0,transparent 62%);}
.dance-flash.on{animation:dflash .7s ease-out;}
@keyframes dflash{from{opacity:.85;}to{opacity:0;}}
.dance-tw{position:absolute;z-index:2;color:#FFF3A8;pointer-events:none;font-size:clamp(10px,3cqmin,22px);animation:dtw 2.2s ease-in-out infinite;}
@keyframes dtw{0%,100%{opacity:.15;transform:scale(.6);}50%{opacity:1;transform:scale(1.2) rotate(20deg);}}
/* Капи */
.dance-capy{position:absolute;left:0;right:0;margin:0 auto;bottom:5%;width:min(60cqw,54cqh);z-index:3;transform-origin:50% 90%;pointer-events:none;}
.dance-capy .capy{filter:drop-shadow(0 6px 8px rgba(0,0,0,.35));}
.dance-capy.mv0{animation:dmv0 .55s ease-out;} .dance-capy.mv1{animation:dmv1 .55s ease-out;}
.dance-capy.mv2{animation:dmv2 .55s ease-out;} .dance-capy.mv3{animation:dmv3 .6s ease-in-out;}
@keyframes dmv0{30%{transform:translateY(-16%) scale(.96,1.06);}60%{transform:translateY(0) scale(1.06,.93);}}
@keyframes dmv1{40%{transform:translateX(-16%) rotate(-13deg);}}
@keyframes dmv2{40%{transform:translateX(16%) rotate(13deg);}}
@keyframes dmv3{50%{transform:translateY(-14%) rotate(180deg) scale(1.05);}100%{transform:rotate(360deg);}}
.dance-fx{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden;}
.dance-fx span{position:absolute;bottom:-10%;font-size:clamp(18px,5.5cqmin,36px);animation:dfx 1.5s ease-out forwards;}
@keyframes dfx{to{transform:translateY(-110cqh) rotate(40deg);opacity:0;}}
/* табло: какво правим сега */
.dance-hud{position:absolute;top:clamp(20px,8cqh,44px);left:50%;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:clamp(6px,1.6cqmin,12px);
  background:rgba(255,255,255,.93);border-radius:999px;padding:.1em .6em .1em .4em;box-shadow:0 4px 0 rgba(0,0,0,.18);white-space:nowrap;}
.dance-ind{font-size:clamp(28px,7cqmin,48px);line-height:1.2;display:block;animation:dind 1s ease-in-out infinite;}
.dance-root[data-phase=play] .dance-ind{animation:dpoint .8s ease-in-out infinite;}
@keyframes dind{50%{transform:scale(1.14);}} @keyframes dpoint{50%{transform:translateY(7px);}}
.dance-dots{display:flex;gap:clamp(4px,1.1cqmin,9px);}
.dance-dots i{width:clamp(11px,2.8cqmin,20px);aspect-ratio:1;border-radius:50%;background:#E3DDF0;box-shadow:inset 0 0 0 2px rgba(0,0,0,.08);transition:transform .15s,background .15s;}
.dance-dots i.on{background:var(--c);transform:scale(1.2);}
/* подиуми */
.dance-pads{flex:none;display:flex;gap:2.4cqw;justify-content:center;align-items:center;padding-bottom:clamp(2px,1cqh,10px);}
.dance-pad{width:var(--pad);height:var(--pad);flex:none;border-radius:26%;position:relative;display:flex;align-items:center;justify-content:center;
  font-size:calc(var(--pad)*.5);line-height:1;padding:0;
  background:radial-gradient(circle at 34% 26%,rgba(255,255,255,.6),transparent 46%),var(--c);
  box-shadow:0 calc(var(--pad)*.08) 0 var(--d),0 calc(var(--pad)*.14) 18px rgba(20,10,60,.3),inset 0 0 0 calc(var(--pad)*.035) rgba(255,255,255,.5);
  transition:transform .1s,filter .1s,box-shadow .1s;}
.dance-pad span{filter:drop-shadow(0 3px 2px rgba(0,0,0,.25));pointer-events:none;}
.dance-root[data-phase=watch] .dance-pad{pointer-events:none;}
.dance-root[data-phase=play] .dance-pad{animation:dpb 2.2s ease-in-out infinite;}
.dance-root[data-phase=play] .dance-pad:nth-child(2){animation-delay:-.5s;} .dance-root[data-phase=play] .dance-pad:nth-child(3){animation-delay:-1s;} .dance-root[data-phase=play] .dance-pad:nth-child(4){animation-delay:-1.5s;}
@keyframes dpb{50%{transform:translateY(-3%);}}
.dance-pad.lit{animation:none !important;transform:translateY(5%) scale(1.1);filter:brightness(1.28) saturate(1.2);
  box-shadow:0 0 0 calc(var(--pad)*.06) rgba(255,255,255,.9),0 0 calc(var(--pad)*.5) calc(var(--pad)*.12) var(--c),inset 0 0 0 calc(var(--pad)*.035) rgba(255,255,255,.7);}
.dance-pad.no{animation:shake .42s !important;}
`);

Capy.registerActivity('dance',{icon:'💃',start(el,ctx){
  const diff=ctx.diff,nPads=diff===1?3:4,lens=LENS[Math.max(0,Math.min(4,diff-1))];
  const baseMs=650-(diff-1)*37.5;                       /* 650 мс → 500 мс на стъпка */
  let alive=true;const timers=new Set();
  const sleep=ms=>new Promise(r=>{timers.add(setTimeout(r,ms));});
  const later=(fn,ms)=>{timers.add(setTimeout(()=>{if(alive)fn();},ms));};

  /* ---------- DOM ---------- */
  const root=U.el('div','dance-root');root.style.setProperty('--n',nPads);root.dataset.phase='watch';root.dataset.seq='';
  let tw='';for(let i=0;i<12;i++)tw+=`<span class="dance-tw" style="left:${8+Math.random()*84}%;top:${10+Math.random()*50}%;animation-delay:${-Math.random()*2.2}s">✦</span>`;
  root.innerHTML=`<div class="dance-stage">
    <div class="dance-spot s1"></div><div class="dance-spot s2"></div><div class="dance-spot s3"></div>
    <div class="dance-floor"></div><div class="dance-flash"></div>${tw}
    <div class="dance-curtain l"></div><div class="dance-curtain r"></div><div class="dance-valance"></div>
    <div class="dance-ball"><i></i></div>
    <div class="dance-capy">${Capy.capySVG()}</div>
    <div class="dance-fx"></div>
    <div class="dance-hud"><span class="dance-ind">👀</span><span class="dance-dots"></span></div>
  </div><div class="dance-pads"></div>`;
  el.appendChild(root);
  const stageEl=root.querySelector('.dance-stage'),capyW=root.querySelector('.dance-capy'),capySvg=capyW.querySelector('.capy'),
        flash=root.querySelector('.dance-flash'),fx=root.querySelector('.dance-fx'),ind=root.querySelector('.dance-ind'),
        dots=root.querySelector('.dance-dots'),padsBox=root.querySelector('.dance-pads');
  const padEls=[];
  for(let i=0;i<nPads;i++){
    const b=U.el('button','dance-pad','<span>'+PADS[i].ico+'</span>');b.dataset.pad=i;b.setAttribute('aria-label','подиум '+(i+1));
    b.style.setProperty('--c',PADS[i].c);b.style.setProperty('--d',PADS[i].d);
    b.addEventListener('pointerdown',e=>{e.preventDefault();onPad(i);});
    b.addEventListener('click',e=>{if(e.detail===0)onPad(i);});   /* клавиатура / тестове; докосването се обработва в pointerdown */
    padsBox.appendChild(b);padEls.push(b);
  }

  /* ---------- звук ---------- */
  const ac=Capy.audio.ctx(),outN=Capy.audio.out();
  let sfxBus=null,beatBus=null,noiseBuf=null,beatTimer=0,nextT=0,stepI=0,stepDur=.15;
  if(ac&&outN){
    try{
      sfxBus=ac.createGain();sfxBus.gain.value=.9;sfxBus.connect(outN);
      beatBus=ac.createGain();beatBus.gain.value=.55;beatBus.connect(outN);
      noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.3),ac.sampleRate);
      const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    }catch(e){sfxBus=beatBus=null;}
  }
  const osc=(bus,type,f,f2,t,dur,g)=>{
    const o=ac.createOscillator(),ga=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    ga.gain.setValueAtTime(.0001,t);ga.gain.linearRampToValueAtTime(g,t+.01);ga.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(ga);ga.connect(bus);o.start(t);o.stop(t+dur+.05);};
  const noise=(t,dur,g,ftype,ff)=>{
    const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),ga=ac.createGain();s.buffer=noiseBuf;fl.type=ftype;fl.frequency.value=ff;
    ga.gain.setValueAtTime(g,t);ga.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(fl);fl.connect(ga);ga.connect(beatBus);s.start(t);s.stop(t+dur+.02);};
  function note(f,bad){if(!sfxBus)return;try{const t=ac.currentTime;
    osc(sfxBus,'triangle',f,0,t,.7,.2);osc(sfxBus,'sine',f*2,0,t,.45,.06);osc(sfxBus,'sine',f*3,0,t,.25,.025);}catch(e){}}
  const BASS={0:130.8,3:130.8,6:98,8:110,11:110,14:98};
  function hit(s,t){
    if(s%4===0)osc(beatBus,'sine',130,46,t,.16,.55);                       /* бас-барабан на всяка долна */
    if(s===4||s===12)noise(t,.13,.22,'bandpass',1900);                    /* пляскане */
    if(s%4===2)noise(t,.05,.1,'highpass',7000);else if(s%2===0)noise(t,.03,.04,'highpass',8000);
    else noise(t,.02,.018,'highpass',9000);
    if(BASS[s]!==undefined)osc(beatBus,'triangle',BASS[s],0,t,stepDur*2.2,.17);
  }
  function sched(){if(!ac||!beatTimer)return;while(nextT<ac.currentTime+.15){hit(stepI%16,nextT);nextT+=stepDur;stepI++;}}
  function beatStart(ms){if(!beatBus)return;beatStop(true);try{
    stepDur=ms/4000;nextT=ac.currentTime+.05;stepI=0;
    beatBus.gain.cancelScheduledValues(ac.currentTime);beatBus.gain.setValueAtTime(.55,ac.currentTime);
    beatTimer=setInterval(sched,25);sched();}catch(e){}}
  function beatStop(quick){if(beatTimer){clearInterval(beatTimer);beatTimer=0;}
    if(beatBus&&!quick){try{beatBus.gain.cancelScheduledValues(ac.currentTime);beatBus.gain.setTargetAtTime(0,ac.currentTime,.06);}catch(e){}}}

  /* ---------- визуални помощници ---------- */
  function setPhase(p,icon){root.dataset.phase=p;ind.textContent=icon||(p==='play'?'👉':'👀');}
  function mkDots(n){dots.innerHTML='';for(let i=0;i<n;i++)dots.appendChild(U.el('i'));}
  function fillDot(k,pad){const d=dots.children[k];if(d){d.style.setProperty('--c',PADS[pad].c);d.classList.add('on');}}
  function move(i){capyW.classList.remove('mv0','mv1','mv2','mv3');void capyW.offsetWidth;capyW.classList.add('mv'+(i%4));}
  function lit(i,ms){const p=padEls[i];p.classList.add('lit');later(()=>p.classList.remove('lit'),ms);
    flash.style.setProperty('--glow',PADS[i].c);flash.classList.remove('on');void flash.offsetWidth;flash.classList.add('on');move(i);}

  /* ---------- поредици ---------- */
  let lastKey='';
  function gen(len){
    for(let tries=0;tries<30;tries++){
      const s=[];for(let k=0;k<len;k++){let p;do{p=U.rnd(0,nPads-1);}while(k>0&&p===s[k-1]);s.push(p);}
      const key=s.join(',');if(key!==lastKey||tries===29){lastKey=key;return s;}
    }}

  async function watch(seq,slow){
    const ms=baseMs*slow;setPhase('watch');mkDots(seq.length);
    beatStart(ms);await sleep(550);
    for(let k=0;k<seq.length&&alive;k++){
      lit(seq[k],ms*.62);note(PADS[seq[k]].f);fillDot(k,seq[k]);await sleep(ms);
    }
    beatStop();await sleep(350);
  }

  let acceptor=null;
  function onPad(i){if(acceptor&&root.dataset.phase==='play')acceptor(i);}
  function play(seq){
    return new Promise(res=>{
      let pos=0;mkDots(seq.length);setPhase('play');ctx.say('bg',T_TURN);
      acceptor=i=>{
        if(i===seq[pos]){
          lit(i,300);note(PADS[i].f);fillDot(pos,i);pos++;
          if(pos===seq.length){acceptor=null;setPhase('watch','🎉');res(true);}
        }else{
          acceptor=null;setPhase('watch');ctx.wrong(padEls[i]);res(false);
        }
      };
    });
  }

  async function celebrate(ms){
    beatStart(ms);capySvg.classList.add('moonwalk');capySvg.classList.remove('joy');
    const em=['✨','⭐','💖','🎵','🌸','💫'];
    for(let k=0;k<14;k++){const s=U.el('span','',U.pick(em));s.style.left=(4+Math.random()*88)+'%';s.style.animationDelay=(Math.random()*.5)+'s';fx.appendChild(s);}
    Capy.sfx.tone({f:784,dur:.2,g:.12,at:.05});Capy.sfx.tone({f:1047,dur:.3,g:.12,at:.2});
    await sleep(1600);capySvg.classList.remove('moonwalk');fx.innerHTML='';beatStop();await sleep(400);
  }

  async function main(){
    await Promise.race([ctx.prompt('bg',T_WATCH),sleep(4500)]);await sleep(350);
    for(let si=0;si<3&&alive;si++){
      const seq=gen(lens[si]);root.dataset.seq=seq.join(',');let slow=1;
      for(;;){
        await watch(seq,slow);if(!alive)return;
        const ok=await play(seq);if(!alive)return;
        if(ok)break;
        slow=Math.min(1.45,slow*1.12);
        await sleep(800);if(!alive)return;
        setPhase('watch');await Promise.race([ctx.say('bg',T_AGAIN),sleep(2200)]);
      }
      ctx.right(stageEl);
      await celebrate(baseMs*slow);
    }
    if(alive)ctx.done();
  }
  main();

  return function cleanup(){
    alive=false;acceptor=null;timers.forEach(clearTimeout);timers.clear();
    if(beatTimer){clearInterval(beatTimer);beatTimer=0;}
    try{if(beatBus){beatBus.gain.cancelScheduledValues(ac.currentTime);beatBus.gain.setValueAtTime(0,ac.currentTime);}}catch(e){}
    try{setTimeout(()=>{try{beatBus&&beatBus.disconnect();sfxBus&&sfxBus.disconnect();}catch(e){}},150);}catch(e){}
  };
}});
})();
