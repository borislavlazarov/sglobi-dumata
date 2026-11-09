/* ===== Островът на Капи — ядро (екрани, прогрес, звук, говор, рундове) =====
   Активностите се регистрират с Capy.registerActivity(); виж dev/OSTROV.md за договора. */
'use strict';
(function(){
const Capy=window.Capy={};
const KEY='sglobi-ostrov-v1';
const $=id=>document.getElementById(id);
const Q=new URLSearchParams(location.search);

/* ---------------- util ---------------- */
const U=Capy.util={
  shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
  pick(a){return a[Math.floor(Math.random()*a.length)];},
  sample(a,n){return U.shuffle(a).slice(0,n);},
  rnd(lo,hi){return lo+Math.floor(Math.random()*(hi-lo+1));},
  wait(ms){return new Promise(r=>setTimeout(r,ms));},
  el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
};
Capy.css=function(s){const st=document.createElement('style');st.textContent=s;document.head.appendChild(st);};

/* ---------------- store ---------------- */
const D=Capy.data={stars:{},shells:0,paint:{},sound:true,en:'ABCDE',lower:'auto',unlockAll:false};
function load(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&typeof p==='object')Object.assign(D,p);}catch(e){}
  if(typeof D.en!=='string'||!/^[A-Z]+$/.test(D.en))D.en='ABCDE';
  if(!D.stars||typeof D.stars!=='object')D.stars={}; if(!D.paint||typeof D.paint!=='object')D.paint={};
  D.shells=Number.isFinite(D.shells)?Math.max(0,Math.floor(D.shells)):0;}
const save=Capy.save=function(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}};
const levelOpen=n=>D.unlockAll||n===1||(D.stars[n-1]||0)>0;
const maxLevel=()=>{let m=1;for(let n=1;n<=Capy.LEVELS.length;n++)if(levelOpen(n))m=n;return m;};
Capy.pageUnlocked=function(pageId){if(D.unlockAll)return true;const i=Capy.LEVELS.findIndex(l=>l.page===pageId);return i<0||(D.stars[i+1]||0)>0;};

/* ---------------- audio: sfx ---------------- */
let actx=null,master=null;
function initAudio(){
  if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=D.sound?1:0;master.connect(actx.destination);}catch(e){actx=null;}}
  if(actx&&actx.state==='suspended')actx.resume().catch(()=>{});
}
document.addEventListener('pointerdown',initAudio,true);
function tone(o){
  if(!actx||!master)return;const now=actx.currentTime+(o.at||0),dur=o.dur||.2;
  const os=actx.createOscillator(),g=actx.createGain();os.type=o.type||'sine';
  os.frequency.setValueAtTime(o.f,now);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,now+dur);
  g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(o.g||.2,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
  os.connect(g);g.connect(master);os.start(now);os.stop(now+dur+.05);
}
Capy.audio={ctx(){initAudio();return actx;},out(){return master;}};
const sfx=Capy.sfx={tone,
  tap(){tone({f:520,dur:.05,g:.1});},
  pop(){tone({f:300,f2:900,dur:.09,g:.16});},
  right(){tone({f:660,dur:.09,g:.22});tone({f:990,dur:.14,g:.22,at:.1});},
  wrong(){tone({f:230,f2:170,dur:.22,type:'triangle',g:.14});},
  ding(){tone({f:1319,dur:.35,g:.2});tone({f:1760,dur:.4,g:.14,at:.08});},
  fanfare(){[523,659,784,1047,1319].forEach((f,i)=>tone({f,dur:.16,type:'triangle',g:.2,at:i*.11}));}
};

/* ---------------- audio: speech (предварително генерирани mp3 + резервен TTS) ---------------- */
Capy.AUDIO={};                       /* audio/manifest.js го презаписва: {hash:1,...} */
Capy._speech={bg:new Set(),en:new Set()};
Capy.speech=function(lang,texts){(Array.isArray(texts)?texts:[texts]).forEach(t=>{if(t)Capy._speech[lang].add(String(t));});};
Capy.hash=function(lang,text){let h=2166136261;const s=lang+'|'+text;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return ('0000000'+h.toString(16)).slice(-8);};
const player=new Audio();let sayTok=0;
function stopSpeech(){sayTok++;try{player.pause();}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}}
Capy.say=function(lang,text){
  stopSpeech();const tok=sayTok;
  if(!D.sound||!text)return Promise.resolve(false);
  text=String(text);
  return new Promise(res=>{
    let fin=false;const done=v=>{if(!fin){fin=true;res(v);}};
    setTimeout(()=>done(false),9000);
    const h=Capy.hash(lang,text);
    if(Capy.AUDIO[h]){
      player.onended=()=>{if(tok===sayTok)done(true);};player.onerror=()=>done(false);
      player.src='audio/'+lang+'/'+h+'.mp3';
      const p=player.play();if(p&&p.catch)p.catch(()=>done(false));
      return;
    }
    try{
      const ss=window.speechSynthesis;if(!ss)return done(false);
      const v=ss.getVoices().find(v=>v.lang&&v.lang.toLowerCase().indexOf(lang)===0);
      if(!v&&lang!=='en')return done(false);      /* няма български глас — мълчим */
      const u=new SpeechSynthesisUtterance(text);if(v)u.voice=v;u.lang=lang==='en'?'en-US':'bg-BG';u.rate=.85;
      u.onend=()=>done(true);u.onerror=()=>done(false);ss.speak(u);
    }catch(e){done(false);}
  });
};
const PRAISE=['Браво!','Супер!','Чудесно!','Точно така!','Страхотно!','Много добре!'];
const T_CALM='Полека. Помисли спокойно.',T_HELLO='Здравей! Аз съм Капи. Хайде да играем!',
      T_END='Ти успя! Имаш нова картинка за оцветяване.',T_SHELL='Спечели мидичка!';
Capy.speech('bg',PRAISE.concat([T_CALM,T_HELLO,T_END,T_SHELL]));

/* ---------------- маскот ---------------- */
Capy.capySVG=function(){return `<svg class="capy" viewBox="0 0 200 170" aria-hidden="true">
<ellipse cx="100" cy="161" rx="72" ry="7" fill="rgba(0,0,0,.13)"/>
<g class="c-all">
 <rect x="40" y="126" width="24" height="34" rx="11" fill="#8E5E38"/><rect x="112" y="126" width="24" height="34" rx="11" fill="#8E5E38"/>
 <ellipse cx="88" cy="106" rx="68" ry="45" fill="#B8804E"/>
 <rect x="60" y="130" width="24" height="32" rx="11" fill="#A26E40"/><rect x="130" y="130" width="24" height="32" rx="11" fill="#A26E40"/>
 <ellipse cx="80" cy="118" rx="40" ry="24" fill="#C99561" opacity=".55"/>
 <ellipse cx="116" cy="38" rx="9" ry="11" fill="#8E5E38"/><ellipse cx="116" cy="40" rx="4.5" ry="6" fill="#E8A9A0"/>
 <rect x="98" y="36" width="90" height="70" rx="31" fill="#C58C58"/>
 <rect x="150" y="54" width="40" height="46" rx="20" fill="#D3A06C"/>
 <ellipse cx="183" cy="66" rx="3" ry="4.5" fill="#5B3A22"/><ellipse cx="172" cy="62" rx="3" ry="4.5" fill="#5B3A22"/>
 <path d="M160 88 q12 9 24 1" fill="none" stroke="#5B3A22" stroke-width="3.5" stroke-linecap="round"/>
 <ellipse cx="140" cy="84" rx="9" ry="5.5" fill="#F29C9C" opacity=".75"/>
 <g class="eye-open"><ellipse cx="140" cy="64" rx="6.5" ry="7.5" fill="#3A2416"/><circle cx="142.5" cy="61" r="2.4" fill="#fff"/></g>
 <path class="eye-shut" d="M132 66 q8 6 16 0" fill="none" stroke="#3A2416" stroke-width="4" stroke-linecap="round"/>
 <g class="c-orange"><circle cx="128" cy="24" r="14" fill="#FF9F1C"/><circle cx="123" cy="19" r="4" fill="#FFC46B" opacity=".8"/>
  <path d="M128 11 q9 -11 17 -3 q-9 7 -17 3z" fill="#3FB86A"/></g>
 <text class="zzz" x="160" y="34" font-size="26" font-weight="bold" fill="#fff">z</text>
</g></svg>`;};
function mascot(state){document.querySelectorAll('.screen.active .capy,#calmOverlay .capy').forEach(c=>{
  if(c.closest('#calmOverlay'))return;c.classList.remove('joy','sad');void c.getBoundingClientRect();
  if(state==='joy'||state==='sad'){c.classList.add(state);setTimeout(()=>c.classList.remove(state),1600);}});}
Capy.mascot=mascot;

/* ---------------- fx ---------------- */
function sparkle(el){if(!el||!el.getBoundingClientRect)return;const r=el.getBoundingClientRect();
  for(let i=0;i<7;i++){const s=U.el('span','sparkle',U.pick(['✨','⭐','💖','🌸']));
    s.style.left=(r.left+r.width/2-14)+'px';s.style.top=(r.top+r.height/2-14)+'px';
    const a=Math.random()*6.28,d=50+Math.random()*70;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
    document.body.appendChild(s);setTimeout(()=>s.remove(),720);}}
Capy.sparkle=sparkle;
let confRAF=0;
function confetti(ms){const c=$('confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;cancelAnimationFrame(confRAF);
  const cols=['#FF7E6B','#FFD23F','#3FCF8E','#4DABF7','#9B7BFF','#FF8FC0'];
  const ps=Array.from({length:90},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,s:6+Math.random()*8,r:Math.random()*6,c:U.pick(cols)}));
  const t0=performance.now();(function fr(t){x.clearRect(0,0,c.width,c.height);if(t-t0>ms)return;
    ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.12;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.globalAlpha=Math.max(0,1-(t-t0)/ms);x.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);x.restore();});
    confRAF=requestAnimationFrame(fr);})(t0);}
Capy.confetti=confetti;

/* ---------------- екрани ---------------- */
let screen='home';
function show(name){screen=name;document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('scr'+name[0].toUpperCase()+name.slice(1)).classList.add('active');
  if(name==='home'||name==='map'||name==='gallery')renderShells();
  if(name==='map')renderMap(); if(name==='gallery')renderGallery();}
Capy.show=show;
function renderShells(){['homePearls','mapPearls','galPearls'].forEach(id=>{$(id).textContent='🐚 '+D.shells+'   ⭐ '+totalStars();});}
const totalStars=Capy.totalStars=()=>Object.values(D.stars).reduce((a,b)=>a+(b||0),0);
function updSound(){document.querySelectorAll('.sndbtn').forEach(b=>b.textContent=D.sound?'🔊':'🔇');if(master)master.gain.value=D.sound?1:0;}

/* ---------------- карта ---------------- */
const NODE_COL=['#FF7E6B','#FFA94D','#F5B700','#3FCF8E','#4DABF7','#9B7BFF','#FF8FC0'];
const DECO=['🌴','🐚','🦀','🌺','⛱️','🐠','🍍','🦜','🌊','🐢','⭐','🏰'];
function renderMap(){
  const g=$('mapGrid'),n=Capy.LEVELS.length,cols=innerWidth>innerHeight?Math.min(6,n):3;g.style.setProperty('--cols',cols);g.innerHTML='';
  const cur=maxLevel();
  Capy.LEVELS.forEach((L,i)=>{const lv=i+1,row=Math.floor(i/cols),c=i%cols,col=row%2?cols-1-c:c,st=D.stars[lv]||0;
    const b=U.el('button','node'+(levelOpen(lv)?'':' locked')+(lv===cur&&!st?' current':''),
      `<span>${lv}</span><span class="st">${st?'⭐'.repeat(st):''}</span><span class="deco">${DECO[i%DECO.length]}</span>`);
    b.style.background=NODE_COL[i%NODE_COL.length];b.style.gridRow=row+1;b.style.gridColumn=col+1;b.dataset.level=lv;
    b.onclick=()=>{if(!levelOpen(lv)){sfx.wrong();b.classList.add('no');setTimeout(()=>b.classList.remove('no'),450);return;}sfx.tap();startLevel(lv);};
    g.appendChild(b);});
  const pr=$('practiceRow');pr.innerHTML='';
  Object.keys(ACTS).forEach(k=>{const b=U.el('button','prac',ACTS[k].icon||'🎲');b.dataset.act=k;b.setAttribute('aria-label',k);
    b.onclick=()=>{sfx.tap();startPractice(k);};pr.appendChild(b);});
}
addEventListener('resize',()=>{if(screen==='map')renderMap();});

/* ---------------- галерия / оцветяване ---------------- */
const PAGES=Capy.pages={};
Capy.registerPages=function(list){list.forEach(p=>{PAGES[p.id]=p;});};
function pageOrder(){const ids=Capy.LEVELS.map(l=>l.page).filter(id=>PAGES[id]);Object.keys(PAGES).forEach(id=>{if(ids.indexOf(id)<0)ids.push(id);});return ids;}
function thumbHTML(id){return Capy.coloring&&Capy.coloring.thumb?Capy.coloring.thumb(id):(PAGES[id]?PAGES[id].svg:'');}
function renderGallery(){const g=$('galGrid');g.innerHTML='';
  pageOrder().forEach(id=>{const ok=Capy.pageUnlocked(id),lv=Capy.LEVELS.findIndex(l=>l.page===id)+1;
    const b=U.el('button','thumb'+(ok?'':' locked'),thumbHTML(id));b.dataset.page=id;b.dataset.n=lv||'';
    b.onclick=()=>{if(!ok){sfx.wrong();return;}sfx.tap();openColor(id,'gallery');};g.appendChild(b);});}
function openColor(id,back){if(!Capy.coloring||!PAGES[id])return;show('color');
  Capy.coloring.open($('colorRoot'),id,{back(){$('colorRoot').innerHTML='';show(back||'gallery');}});}
Capy.openColor=openColor;

/* ---------------- активности и рундове ---------------- */
const ACTS=Capy.acts={};
Capy.registerActivity=function(name,def){ACTS[name]=def;};
let run=null,cleanup=null,wrongTimes=[],calming=false,lastPrompt=null;
const STREAK=5;
function renderHud(){
  const d=$('roundDots');d.innerHTML='';run.recipe.forEach((_,i)=>{d.appendChild(U.el('i',i<run.i?'done':i===run.i?'cur':''));});
  const s=$('streak');s.innerHTML='';for(let i=0;i<STREAK;i++)s.appendChild(U.el('i',i<run.streak?'on':'','🐚'));
}
function startLevel(n){run={level:n,recipe:Capy.LEVELS[n-1].rounds.filter(r=>ACTS[r.act]),i:0,mistakes:0,streak:0,shells:0,practice:false};show('play');nextRound(true);}
function startPractice(act){const lv=maxLevel(),diff=Capy.LEVELS[lv-1].diff;
  run={level:lv,recipe:[0,1,2].map(()=>({act,diff})),i:0,mistakes:0,streak:0,shells:0,practice:true};show('play');nextRound(true);}
Capy.startLevel=startLevel;Capy.startPractice=startPractice;
function endCleanup(){if(typeof cleanup==='function'){try{cleanup();}catch(e){}}cleanup=null;stopSpeech();}
function lowerOn(level){return D.lower==='always'||(D.lower!=='never'&&level>=4);}
function nextRound(first){
  endCleanup();
  if(!run)return;
  if(run.i>=run.recipe.length)return finishLevel();
  const r=run.recipe[run.i],act=ACTS[r.act],stage=$('stage'),myRun=run,myI=run.i;let finished=false;
  renderHud();lastPrompt=null;stage.className='';stage.innerHTML='';void stage.offsetWidth;stage.classList.add('in');
  const live=()=>run===myRun&&run.i===myI&&!finished;
  const ctx={
    diff:r.diff||Capy.LEVELS[run.level-1].diff,level:run.level,lower:lowerOn(run.level),
    enLetters:D.en.split(''),opts:r.opts||{},
    say:(l,t)=>live()||finished?Capy.say(l,t):Promise.resolve(false),
    prompt(lang,text){lastPrompt=[lang,text];return Capy.say(lang,text);},
    right(el){if(!live())return;sfx.right();if(el&&el.classList)el.classList.add('ok');sparkle(el);
      run.streak++;if(run.streak>=STREAK){renderHud();run.streak=0;run.shells++;D.shells++;save();sfx.ding();setTimeout(()=>{if(run===myRun)renderHud();},700);}else renderHud();},
    wrong(el){if(!live())return;sfx.wrong();mascot('sad');if(el&&el.classList){el.classList.remove('no');void el.offsetWidth;el.classList.add('no');setTimeout(()=>el.classList.remove('no'),450);}
      run.mistakes++;run.streak=0;renderHud();const t=Date.now();wrongTimes=wrongTimes.filter(x=>t-x<3500);wrongTimes.push(t);if(wrongTimes.length>=3){wrongTimes=[];calm();}},
    mascot,sparkle,
    done(){if(!live())return;finished=true;mascot('joy');sfx.fanfare();
      Promise.race([U.wait(350).then(()=>Capy.say('bg',U.pick(PRAISE))),U.wait(2200)]).then(()=>U.wait(350)).then(()=>{
        if(run!==myRun)return;stage.classList.add('out');setTimeout(()=>{if(run!==myRun)return;run.i++;nextRound();},260);});}
  };
  try{cleanup=act.start(stage,ctx)||null;}catch(e){console.error(e);run.i++;setTimeout(nextRound,0);}
}
function calm(){if(calming)return;calming=true;const o=$('calmOverlay');o.classList.add('on');o.querySelector('.capy').classList.add('sleep');
  Capy.say('bg',T_CALM);setTimeout(()=>{o.classList.remove('on');calming=false;},3800);}
function quit(){endCleanup();run=null;show('map');}
function finishLevel(){
  const r=run;run=null;
  if(r.practice){confetti(1500);sfx.fanfare();show('map');return;}
  const stars=r.mistakes<=2?3:r.mistakes<=6?2:1,first=!(D.stars[r.level]>0);
  D.stars[r.level]=Math.max(D.stars[r.level]||0,stars);save();
  show('end');confetti(2600);sfx.fanfare();
  const es=$('endStars');es.innerHTML='';for(let i=0;i<3;i++){const s=U.el('span',i<stars?'':'off','⭐');s.style.animationDelay=(i*.3)+'s';es.appendChild(s);if(i<stars)setTimeout(sfx.ding,300+i*300);}
  const page=Capy.LEVELS[r.level-1].page,rw=$('endReward');rw.innerHTML='';
  if(PAGES[page]&&Capy.coloring){const t=U.el('div','thumb',thumbHTML(page));rw.appendChild(t);}
  if(r.shells)rw.appendChild(U.el('span','', '+'+r.shells+' 🐚'));
  $('btnEndColor').style.display=PAGES[page]&&Capy.coloring?'':'none';
  $('btnEndColor').onclick=()=>openColor(page,'map');
  const nx=r.level<Capy.LEVELS.length?r.level+1:0;$('btnEndNext').style.display=nx?'':'none';$('btnEndNext').onclick=()=>startLevel(nx);
  document.querySelector('#capyEnd .capy').classList.add('moonwalk');
  if(first)setTimeout(()=>Capy.say('bg',T_END),900);
}

/* ---------------- родителски панел ---------------- */
function renderParent(){
  const pl=$('parLetters');pl.innerHTML='';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch=>{const b=U.el('button',D.en.indexOf(ch)>=0?'on':'',ch);
    b.onclick=()=>{let s=new Set(D.en.split(''));s.has(ch)?s.delete(ch):s.add(ch);if(s.size<3)return;D.en=Array.from(s).sort().join('');save();renderParent();};pl.appendChild(b);});
  const sg=$('parLower');sg.innerHTML='';[['auto','От ниво 4'],['always','Винаги'],['never','Само ГЛАВНИ']].forEach(([k,t])=>{
    const b=U.el('button',D.lower===k?'on':'',t);b.onclick=()=>{D.lower=k;save();renderParent();};sg.appendChild(b);});
  $('parUnlock').checked=!!D.unlockAll;
}

/* ---------------- boot ---------------- */
Capy.boot=function(){
  load();
  if(Q.get('parent')==='1')D.unlockAll=true;
  ['capyHome','capyPlay','capyEnd','capyCalm'].forEach(id=>{$(id).innerHTML=Capy.capySVG();});
  updSound();renderShells();
  document.querySelectorAll('.sndbtn').forEach(b=>b.onclick=()=>{D.sound=!D.sound;save();updSound();if(!D.sound)stopSpeech();else{initAudio();sfx.pop();}});
  let greeted=false;
  $('btnPlay').onclick=()=>{sfx.pop();show('map');if(!greeted&&!totalStars()){greeted=true;Capy.say('bg',T_HELLO);}};
  $('btnGallery').onclick=()=>{sfx.pop();show('gallery');};
  $('btnMapHome').onclick=$('btnGalHome').onclick=()=>{sfx.tap();show('home');};
  $('btnQuit').onclick=()=>{sfx.tap();quit();};
  $('btnReplay').onclick=()=>{if(lastPrompt)Capy.say(lastPrompt[0],lastPrompt[1]);};
  $('btnEndMap').onclick=()=>{sfx.tap();show('map');};
  $('capyHome').onclick=()=>{mascot('joy');sfx.pop();};
  /* родители: задържане 1.5 сек */
  let ht=0;const bp=$('btnParent');
  bp.addEventListener('pointerdown',()=>{ht=setTimeout(()=>{renderParent();show('parent');},1500);});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>bp.addEventListener(ev,()=>clearTimeout(ht)));
  $('parUnlock').onchange=e=>{D.unlockAll=e.target.checked;save();};
  $('parClose').onclick=()=>show('home');
  $('parReset').onclick=()=>{if(confirm('Да изтрия ли целия прогрес на острова?')){try{localStorage.removeItem(KEY);}catch(e){}location.reload();}};
  /* директни входове за разработка/тестове: ?act=read&diff=3 | ?level=2 | ?color=<pageId> */
  const qa=Q.get('act');
  if(qa&&ACTS[qa]){const diff=Math.max(1,Math.min(5,+Q.get('diff')||1)),lv=Math.max(1,Math.min(Capy.LEVELS.length,+Q.get('level')||(diff>=3?6:1)));
    run={level:lv,recipe:Array.from({length:20},()=>({act:qa,diff})),i:0,mistakes:0,streak:0,shells:0,practice:true};show('play');nextRound(true);}
  else if(Q.get('level')){startLevel(Math.max(1,Math.min(Capy.LEVELS.length,+Q.get('level'))));}
  else if(Q.get('color')){openColor(Q.get('color'),'gallery');}
  window.__capy={get screen(){return screen;},get run(){return run;},data:D};
};
})();
