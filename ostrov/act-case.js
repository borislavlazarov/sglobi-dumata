/* ===== „Голяма и малка буква" (case) — малките печатни букви ===== */
'use strict';
(function(){
const U=Capy.util;
const T_LOW='Намери малката буква.',T_CAP='Намери голямата буква.',T_WORD='Намери същата дума.',T_PICT='Намери картинката.',T_COPY='Напиши думата с малки букви.';
Capy.speech('bg',[T_LOW,T_CAP,T_WORD,T_PICT,T_COPY]);

const SAME='ОКМСТХПНШВГЗЖИЛЧЦ'.split('');         /* малката прилича на голямата */
const CHANGE='АБЕРУФДЯЮЙЩЪЬ'.split('');          /* малката сменя формата си */
const GROUPS=['БВЬЪ','ИЙНП','ШЩЦ','ГТ','ЛД','ЧУ','АЯ','ЕЗ'].map(s=>s.split(''));
const ALL='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ'.split('');
const lo=s=>s.toLowerCase();

/* дума, картинка, подбрани подобни думи */
const WORDS=[['котка','🐱',['кофа','кутия']],['куче','🐶',['куфар','кукла']],['риба','🐟',['рана','рамо']],['слон','🐘',['стол','сок']],
 ['лъв','🦁',['лак','лов']],['къща','🏠',['каша','къса']],['кола','🚗',['кула','коза']],['луна','🌙',['лупа','лула']],
 ['слънце','☀️',['слама','сладко']],['звезда','⭐',['звяр','зеле']],['цвете','🌸',['цена','цвят']],['дърво','🌳',['дъска','дъжд']],
 ['ябълка','🍎',['ягода','юбка']],['банан','🍌',['баба','банка']],['грозде','🍇',['гроб','градина']],['ягода','🍓',['яйце','ябълка']],
 ['торта','🎂',['топка','трева']],['балон','🎈',['баба','бонбон']],['корона','👑',['кора','корен']],['сърце','❤️',['сирене','свещ']],
 ['мишка','🐭',['мида','мина']],['заек','🐰',['зеле','земя']],['жаба','🐸',['жито','жена']],['пате','🦆',['пита','пари']],
 ['птица','🐦',['пица','плат']],['чадър','☂️',['чаша','час']],['обувка','👟',['обица','облак']],['шапка','👒',['шала','шише']],
 ['лодка','⛵',['лопата','лимон']],['влак','🚂',['вълк','вода']],['книга','📖',['кино','кула']],['ключ','🔑',['клен','клин']],
 ['дъга','🌈',['дъска','дупка']],['облак','☁️',['обица','обяд']],['сняг','❄️',['сън','слог']]];
/* минимални тройки (първите две са двойката) */
const MIN=[['коса','коза','роса'],['маса','каса','мама'],['кола','кула','коло'],['пате','бате','пита']];
Capy.speech('bg',WORDS.map(w=>w[0]).concat([].concat(...MIN)));

Capy.css(`
.case-root{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:2cqh;
  font-family:var(--font);font-style:normal;font-variant:normal;text-transform:none;font-weight:700;letter-spacing:0;color:var(--ink);--ob:min(22cqw,15cqh);}
.case-root.land{--ob:min(17cqw,30cqh);}
.case-root *{text-transform:none;font-style:normal;font-family:var(--font);}
.case-show{background:#fff;border-radius:28px;box-shadow:var(--shadow),inset 0 0 0 6px #FFE9B8;padding:.12em .5em;display:flex;align-items:center;justify-content:center;line-height:1.35;
  min-width:min(40cqw,26cqh);max-width:100%;color:var(--coral-d);text-align:center;}
.case-opts{display:flex;flex-wrap:wrap;gap:clamp(8px,2.4cqmin,22px);align-items:center;justify-content:center;max-width:100%;}
.case-opts.words{flex-direction:column;}
.case-root.land .case-opts.words{flex-direction:row;}
.case-opt{min-width:var(--ob);height:var(--ob);padding:0 .45em;border-radius:26%;background:#fff;box-shadow:var(--shadow);font-size:calc(var(--ob)*.62);line-height:1;
  display:flex;align-items:center;justify-content:center;transition:transform .12s,opacity .25s,background .2s;}
.case-opts.words .case-opt{font-size:calc(var(--ob)*.5);border-radius:999px;min-width:min(70cqw,300px);height:calc(var(--ob)*.78);}
.case-root.land .case-opts.words .case-opt{min-width:0;}
.case-opts.pics .case-opt{font-size:calc(var(--ob)*.7);padding:0;width:calc(var(--ob)*1.1);height:calc(var(--ob)*1.1);}
.case-opt:active{transform:translateY(4px);}
.case-opt.ok{background:#D6FBE6;box-shadow:0 0 0 5px var(--green),var(--shadow);animation:okpop .45s ease-out;}
.case-opt.no{animation:shake .42s;} .case-opt.dim{opacity:.25;pointer-events:none;}
.case-pair{display:flex;align-items:center;justify-content:center;gap:.5em;font-size:calc(var(--ob)*.9);animation:okpop .5s ease-out;flex-wrap:wrap;}
.case-pair span{background:#fff;border-radius:26px;padding:.05em .4em;box-shadow:var(--shadow);line-height:1.15;}
.case-pair .cp1{color:var(--coral-d);} .case-pair .cp2{color:var(--purple-d);} .case-pair .em{background:none;box-shadow:none;}
.case-slots{display:flex;gap:clamp(6px,1.6cqmin,14px);justify-content:center;flex-wrap:wrap;}
.case-slot{width:calc(var(--ob)*.7);height:calc(var(--ob)*.8);border-radius:20%;background:rgba(255,255,255,.7);box-shadow:inset 0 0 0 4px #fff,inset 0 -6px 0 rgba(0,0,0,.06);
  font-size:calc(var(--ob)*.55);display:flex;align-items:center;justify-content:center;line-height:1;color:var(--purple-d);}
.case-slot.cur{box-shadow:inset 0 0 0 4px var(--yellow);}
.case-slot.fill{background:#fff;animation:okpop .3s ease-out;}
.case-tiles{display:flex;flex-wrap:wrap;gap:clamp(8px,2cqmin,18px);justify-content:center;max-width:min(100%,640px);}
.case-tile{width:calc(var(--ob)*.8);height:calc(var(--ob)*.8);border-radius:26%;background:var(--yellow);box-shadow:0 5px 0 #E0A800,0 8px 14px rgba(20,80,110,.2);font-size:calc(var(--ob)*.5);
  display:flex;align-items:center;justify-content:center;line-height:1;}
.case-tile:active{transform:translateY(4px);} .case-tile.used{opacity:.2;pointer-events:none;} .case-tile.no{animation:shake .42s;} .case-tile.dim{opacity:.15;pointer-events:none;}
`);

function conf(L,n,exclude){
  const g=GROUPS.find(x=>x.indexOf(L)>=0)||[];const out=U.shuffle(g.filter(x=>x!==L));
  const res=out.slice(0,n);
  U.shuffle(ALL).forEach(x=>{if(res.length<n&&x!==L&&res.indexOf(x)<0)res.push(x);});
  return res.slice(0,n);
}
function distinctFrom(L,n){ /* визуално различни букви (за диф. 1) */
  const g=GROUPS.find(x=>x.indexOf(L)>=0)||[L];
  return U.sample(SAME.filter(x=>x!==L&&g.indexOf(x)<0),n);
}

Capy.registerActivity('case',{icon:'🔡',start(el,ctx){
  let dead=false;const timers=new Set(),ros=[];
  const later=(f,ms)=>{const t=setTimeout(()=>{timers.delete(t);if(!dead)f();},ms);timers.add(t);};
  const d=Math.max(1,Math.min(5,ctx.diff));
  const sayW=(t)=>Promise.race([ctx.say('bg',t),U.wait(2600)]);
  const root=U.el('div','case-root');root.lang='bg';el.appendChild(root);
  const setLand=()=>{root.classList.toggle('land',el.clientWidth>el.clientHeight*1.15);
    const cp=document.getElementById('capyPlay'),mr=cp?cp.getBoundingClientRect():null;
    root.style.paddingLeft=((innerWidth>innerHeight&&mr)?Math.max(0,Math.min(130,mr.right+4-(innerWidth-el.offsetWidth)/2)):0)+'px';};
  setLand();if(window.ResizeObserver){const ro=new ResizeObserver(setLand);ro.observe(el);ros.push(ro);}

  /* ---- генериране на въпросите ---- */
  const used=new Set();
  const fresh=(arr,key)=>{const a=U.shuffle(arr).find(x=>!used.has(key(x)))||U.pick(arr);used.add(key(a));return a;};
  function letterQ(){
    let L,toCap=false;
    if(d===1)L=fresh(SAME,x=>x);
    else{L=fresh(CHANGE.concat(CHANGE,SAME.slice(0,6)),x=>x);toCap=Math.random()<.5;}
    const opts=d===1?[L].concat(distinctFrom(L,2)):[L].concat(conf(L,3));
    const f=toCap?lo:x=>x;
    return {kind:'letter',prompt:toCap?T_CAP:T_LOW,show:toCap?lo(L):L,opts:U.shuffle(opts).map(x=>({h:toCap?x:lo(x),ok:x===L})),
      pair:[L,lo(L)]};
  }
  function wordPool(){return WORDS.filter(w=>w[0].length>=3);}
  function wordQ(){
    const w=fresh(wordPool(),x=>x[0]),W=w[0];
    return {kind:'word',prompt:T_WORD,show:W.toUpperCase(),opts:U.shuffle([W].concat(w[2])).map(x=>({h:x,ok:x===W})),pair:[W.toUpperCase(),W],emoji:w[1],say:W,cls:'words'};
  }
  function d4Q(){
    const r=Math.random();
    if(r<.4){ // дума -> картинка
      const w=fresh(WORDS,x=>x[0]);const others=U.sample(WORDS.filter(x=>x[1]!==w[1]),2);
      return {kind:'word',prompt:T_PICT,show:w[0],showLow:true,opts:U.shuffle([w].concat(others)).map(x=>({h:x[1],ok:x===w})),pair:[w[0].toUpperCase(),w[0]],emoji:w[1],say:w[0],cls:'pics'};
    }
    let W,ds;
    if(r<.75){const t=fresh(MIN,x=>x[0]);const pickI=Math.random()<.5?0:1;W=t[pickI];ds=[t[1-pickI],t[2]];}
    else{const w=fresh(wordPool(),x=>x[0]);W=w[0];ds=w[2];}
    const toCap=Math.random()<.5,f=toCap?x=>x.toUpperCase():x=>x;
    return {kind:'word',prompt:T_WORD,show:toCap?W:W.toUpperCase(),showLow:toCap,opts:U.shuffle([W].concat(ds)).map(x=>({h:toCap?x.toUpperCase():x,ok:x===W})),
      pair:[W.toUpperCase(),W],say:W,cls:'words'};
  }
  function copyQ(){const w=fresh(WORDS.filter(x=>x[0].length>=3&&x[0].length<=6),x=>x[0]);return {kind:'copy',word:w[0],emoji:w[1]};}

  /* ---- показване ---- */
  function showFont(q){const len=String(q.show).length;
    if(q.kind==='letter')return 'min(34cqw,24cqh)';
    return 'min('+(84/(len*.84)).toFixed(1)+'cqw,'+(root.classList.contains('land')?'20':'12')+'cqh)';}
  function pairBlock(q){const p=U.el('div','case-pair');
    p.innerHTML='<span class="cp1">'+q.pair[0]+'</span><span class="cp2">'+q.pair[1]+'</span>'+(q.emoji?'<span class="em">'+q.emoji+'</span>':'');return p;}

  function ask(q){
    return new Promise(res=>{
      root.innerHTML='';ctx.prompt('bg',q.prompt);
      const sh=U.el('div','case-show',q.show);sh.style.fontSize=showFont(q);
      if(q.showLow)sh.style.color='var(--purple-d)';
      const box=U.el('div','case-opts '+(q.cls||'letters'));
      root.append(sh,box);
      let w=0,fin=false;
      q.opts.forEach(o=>{const b=U.el('button','case-opt',o.h);if(o.ok)b.dataset.ok='1';box.appendChild(b);
        b.onclick=()=>{if(fin)return;
          if(o.ok){fin=true;ctx.right(b);
            later(async()=>{box.replaceWith(pairBlock(q));
              const sp=q.say?sayW(q.say):U.wait(300);await sp;later(res,q.say?500:1000);},450);}
          else{ctx.wrong(b);if(++w===2){const t=U.pick([...box.children].filter(x=>!x.dataset.ok&&!x.classList.contains('dim')));if(t)t.classList.add('dim');}}};});
    });
  }
  function copy(q){
    return new Promise(res=>{
      root.innerHTML='';ctx.prompt('bg',T_COPY);
      const W=q.word,sh=U.el('div','case-show',W.toUpperCase());sh.style.fontSize=showFont({kind:'word',show:W});
      const slots=U.el('div','case-slots'),tiles=U.el('div','case-tiles');root.append(sh,slots,tiles);
      const sl=[...W].map(()=>{const s=U.el('div','case-slot');slots.appendChild(s);return s;});
      const extra=U.shuffle(ALL.filter(x=>x!=='Ь'&&W.toUpperCase().indexOf(x)<0)).slice(0,2).map(lo);
      const letters=U.shuffle([...W].concat(extra));
      const tl=letters.map(ch=>{const b=U.el('button','case-tile',ch);b.dataset.ch=ch;tiles.appendChild(b);return b;});
      let pos=0,w=0,fin=false;
      const mark=()=>{tl.forEach(b=>b.removeAttribute('data-ok'));sl.forEach((s,i)=>s.classList.toggle('cur',i===pos));
        const n=tl.find(b=>!b.classList.contains('used')&&b.dataset.ch===W[pos]);if(n&&pos<W.length)n.dataset.ok='1';};
      mark();
      tl.forEach(b=>b.onclick=()=>{if(fin||b.classList.contains('used'))return;
        if(b.dataset.ch===W[pos]){b.classList.add('used');sl[pos].textContent=W[pos];sl[pos].classList.add('fill');Capy.sfx.pop();pos++;w=0;mark();
          if(pos===W.length){fin=true;ctx.right(slots);
            later(async()=>{root.innerHTML='';root.appendChild(pairBlock({pair:[W.toUpperCase(),W],emoji:q.emoji}));await sayW(W);later(res,500);},450);}}
        else{ctx.wrong(b);if(++w===2){const t=U.pick(tl.filter(x=>!x.classList.contains('used')&&x.dataset.ch!==W[pos]&&!x.classList.contains('dim')));if(t)t.classList.add('dim');}}});
    });
  }

  (async()=>{
    for(let i=0;i<5&&!dead;i++){
      if(d<=2)await ask(letterQ());
      else if(d===3)await ask(wordQ());
      else if(d===4)await ask(d4Q());
      else await copy(copyQ());
    }
    if(!dead)ctx.done();
  })();
  return function cleanup(){dead=true;timers.forEach(clearTimeout);timers.clear();ros.forEach(r=>r.disconnect());};
}});
})();
