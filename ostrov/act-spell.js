/* ===== „Липсващата буква" / „Подреди изречението" — правописно внимание =====
   diff 1: липсва ударената гласна (3 избора) · diff 2: една буква навсякъде, 4 избора с чести обърквания
   diff 3: две липсващи букви (отляво надясно) или липсваща сричка · diff 4: изречение от 3 думи
   diff 5: изречение от 4–5 думи + една излишна дума, и дума с 2–3 липсващи букви.
   Малки букви (ctx.lower) само при diff ≥ 3. */
'use strict';
(function(){
const U=Capy.util;
const T_ONE='Коя буква липсва?',T_MANY='Кои букви липсват?',T_SYL='Коя сричка липсва?',T_SENT='Подреди изречението.';

/* думи: „СРИЧ-КИ|картинка|индекс на ударената гласна" */
const WORDS=`КОТ-КА|🐱|1; КУ-ЧЕ|🐶|1; РИ-БА|🐟|1; ЖА-БА|🐸|1; ЛУ-НА|🌙|3; ТОР-ТА|🎂|1; ЗА-ЕК|🐰|1;
 ЛИ-МОН|🍋|3; БА-НАН|🍌|3; ДИ-НЯ|🍉|1; Я-ГО-ДА|🍓|0; ГЪ-БА|🍄|1; ХЛЯБ|🍞|2; ЗЪБ|🦷|1; НОС|👃|1;
 РО-ЗА|🌹|1; ПАЛ-МА|🌴|1; ЗВЕЗ-ДА|⭐|5; СЛЪН-ЦЕ|☀️|2; КО-РО-НА|👑|3; БА-ЛОН|🎈|3; ТОП-КА|⚽|1;
 КЪ-ЩА|🏠|1; ЗА-МЪК|🏰|1; КО-РАБ|🚢|1; ВЛАК|🚂|2; РА-КЕ-ТА|🚀|3; ЛОД-КА|⛵|1; МЕЧ-КА|🐻|1;
 ЛИ-СИ-ЦА|🦊|3; ПИНГ-ВИН|🐧|1; ПЧЕ-ЛА|🐝|4; СЛОН|🐘|2; ПРИН-ЦЕ-СА|👸|5; ЕД-НО-РОГ|🦄|5;
 РОК-ЛЯ|👗|1; ЧА-ДЪР|☂️|1; МО-ЛИВ|✏️|1; КНИ-ГА|📖|2; ПИ-ЦА|🍕|1; МОР-КОВ|🥕|1; ДЪ-ГА|🌈|3;
 ОБ-ЛАК|☁️|0; ЦВЕ-ТЕ|🌸|4; Я-БЪЛ-КА|🍎|0; МИШ-КА|🐭|1; ОХ-ЛЮВ|🐌|0; МИ-ДА|🐚|1;
 СЛА-ДО-ЛЕД|🍦|6; МАЙ-МУ-НА|🐵|4; КАП-КА|💧|1; КЛЮЧ|🔑|2; ВЪЛ-НА|🌊|4; ДЪР-ВО|🌳|1`
 .split(';').map(x=>{const [s,p,i]=x.trim().split('|');const w=s.replace(/-/g,'');return {w,syl:s.split('-'),p,st:+i};});
const WSET=new Set(WORDS.map(x=>x.w));
const cap=s=>s.charAt(0)+s.slice(1).toLowerCase();
const sayWord=w=>cap(w.w);

/* изречения: „ДУМИ|картинка|алтернативен ред|излишна дума" (alt и x по желание) */
const S=s=>s.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const [w,p,alt,xw]=x.split('|').map(y=>(y||'').trim());
  const orders=[w.split(' ')];if(alt)alt.split('/').forEach(a=>orders.push(a.trim().split(' ')));return {orders,p,x:xw||''};});
const B4=S(`МАМА ПЕЧЕ ТОРТА|👩 🎂; КОТКАТА ПИЕ МЛЯКО|🐱 🥛; КУЧЕТО ГРИЗЕ КОКАЛ|🐶 🦴; ЗАЕКЪТ ЯДЕ МОРКОВ|🐰 🥕;
 МАЙМУНАТА ЯДЕ БАНАН|🐵 🍌; ТАТКО КАРА КОЛА|👨 🚗; ДЕДО ЧЕТЕ ВЕСТНИК|👴 📰; БАБА ПЛЕТЕ ШАЛ|👵 🧣;
 МОМИЧЕТО ПЕЕ ПЕСЕН|👧 🎤; ПРИНЦЕСАТА НОСИ КОРОНА|👸 👑; МОМЧЕТО РИТА ТОПКА|👦 ⚽; МЕЧЕТО ЯДЕ МЕД|🐻 🍯;
 ДЕТЕТО ЧЕТЕ КНИГА|🧒 📖; КОТКАТА ГОНИ МИШКА|🐱 🐭; ЕДНОРОГЪТ ЯДЕ ЯБЪЛКА|🦄 🍎; ПИНГВИНЪТ ЯДЕ РИБА|🐧 🐟;
 БЕБЕТО ПИЕ МЛЯКО|👶 🍼`);
const B5=S(`МАМА ПЕЧЕ ВКУСНА ТОРТА|👩 🎂||ПИЦА; ПРИНЦЕСАТА ЯДЕ ГОЛЯМ СЛАДОЛЕД|👸 🍦||ТОРТА;
 МАЛКАТА КОТКА ПИЕ МЛЯКО|🐱 🥛||СОК; МОМИЧЕТО ТАНЦУВА НА ПЛАЖА|💃 🏖️|НА ПЛАЖА ТАНЦУВА МОМИЧЕТО|ГОРАТА;
 РИБКАТА ПЛУВА В МОРЕТО|🐠 🌊|В МОРЕТО ПЛУВА РИБКАТА|ЛЕТИ; КОТКАТА СПИ НА ДИВАНА|🐱 💤 🛋️|НА ДИВАНА СПИ КОТКАТА|ЯДЕ;
 ТАТКО КАРА ЧЕРВЕНА КОЛА|👨 🚗||СИНЯ; БАБА ПЕЧЕ ТОПЛИ ПАЛАЧИНКИ|👵 🥞||ТОРТА; ДЕДО ЧЕТЕ ДЕБЕЛА КНИГА|👴 📖||ПИЕ;
 ЕДНОРОГЪТ ТИЧА ПО ДЪГАТА|🦄 🌈|ПО ДЪГАТА ТИЧА ЕДНОРОГЪТ|ЛУНАТА;
 ПРИНЦЕСАТА ЖИВЕЕ В ГОЛЯМ ЗАМЪК|👸 🏰|В ГОЛЯМ ЗАМЪК ЖИВЕЕ ПРИНЦЕСАТА|КОРАБ;
 МОМИЧЕТО ПЕЕ ВЕСЕЛА ПЕСЕН|👧 🎤||ТАНЦУВА; КУЧЕТО ИГРАЕ С ТОПКА|🐶 ⚽||ПЛУВА;
 ПТИЧКАТА ПЕЕ НА ДЪРВОТО|🐦 🎵 🌳|НА ДЪРВОТО ПЕЕ ПТИЧКАТА|ПЛУВА; МАЙМУНАТА ЯДЕ ЖЪЛТ БАНАН|🐵 🍌||ЧЕРВЕН;
 ДЕЦАТА СТРОЯТ ЗАМЪК ОТ ПЯСЪК|👧 👦 🏰 🏖️||СНЯГ; МАМА И ТАТКО ТАНЦУВАТ|💃 🕺|ТАТКО И МАМА ТАНЦУВАТ|СПЯТ;
 КОСТЕНУРКАТА ПЛУВА В МОРЕТО|🐢 🌊|В МОРЕТО ПЛУВА КОСТЕНУРКАТА|ГОРАТА;
 ЛОДКАТА ПЛАВА КЪМ ОСТРОВА|⛵ 🏝️|КЪМ ОСТРОВА ПЛАВА ЛОДКАТА|ЛЕТИ;
 ПЕПЕРУДАТА КАЦНА НА ЦВЕТЕТО|🦋 🌸|НА ЦВЕТЕТО КАЦНА ПЕПЕРУДАТА|КОЛАТА; БЕБЕТО ПИЕ ТОПЛО МЛЯКО|👶 🍼||СОК;
 ДЕЦАТА ПРАВЯТ СНЕЖЕН ЧОВЕК|👧 👦 ☃️||ТОРТА; ЗАЕКЪТ ЯДЕ ОРАНЖЕВ МОРКОВ|🐰 🥕||СИН;
 МЕЧЕТО СПИ В ГОРАТА|🐻 💤 🌲|В ГОРАТА СПИ МЕЧЕТО|МОРЕТО`);
const sentText=ws=>cap(ws.join(' '))+'.';

Capy.speech('bg',[T_ONE,T_MANY,T_SYL,T_SENT].concat(WORDS.map(sayWord),
  ...B4.concat(B5).map(b=>b.orders.map(sentText))));

/* ---------- букви ---------- */
const VOW='АЕИОУЪЮЯ',EASYV='АЕИОУЪ';
const CONF={И:'ЙЕ',Й:'И',О:'УА',У:'ОЮ',А:'ЪЯ',Ъ:'АО',Е:'ИЯ',Я:'АЕ',Ю:'У',Б:'ПВ',П:'Б',Д:'Т',Т:'Д',З:'СЖ',С:'ЗЦ',
  Ш:'ЩЖ',Щ:'ШЧ',Ж:'ШЗ',В:'ФБ',Ф:'В',Г:'К',К:'Г',Ц:'СЧ',Ч:'ЩЦ',Л:'Р',Р:'Л',М:'Н',Н:'М',Х:'К'};
const CONS='БВГДЖЗКЛМНПРСТФХЦЧШЩ';
function letterOpts(word,idx,n,easy){
  const c=word[idx],isV=VOW.indexOf(c)>=0;
  const okAlt=x=>x!==c&&!WSET.has(word.slice(0,idx)+x+word.slice(idx+1));
  const out=[];const add=x=>{if(out.length<n-1&&out.indexOf(x)<0&&okAlt(x))out.push(x);};
  if(easy){U.shuffle(EASYV.split('')).forEach(add);}
  else{U.shuffle((CONF[c]||'').split('')).slice(0,2).forEach(add);U.shuffle((isV?EASYV:CONS).split('')).forEach(add);}
  return U.shuffle(out.concat(c));
}
function pickMissing(w,k){                  /* k различни позиции, по възможност не съседни */
  for(let t=0;t<40;t++){const ix=U.sample(w.split('').map((_,i)=>i),k).sort((a,b)=>a-b);
    if(ix.every((x,i)=>i===0||x-ix[i-1]>1))return ix;}
  return U.sample(w.split('').map((_,i)=>i),k).sort((a,b)=>a-b);
}
const ALLSYL=[].concat(...WORDS.filter(x=>x.syl.length>1).map(x=>x.syl));
function sylOpts(wd,si){
  const c=wd.syl[si];
  const cands=U.shuffle(Array.from(new Set(ALLSYL))).filter(s=>s!==c&&Math.abs(s.length-c.length)<=1&&
    !WSET.has(wd.syl.map((x,i)=>i===si?s:x).join('')));
  const near=cands.filter(s=>s[0]===c[0]||s[s.length-1]===c[c.length-1]);
  const out=[];near.concat(cands).forEach(s=>{if(out.length<2&&out.indexOf(s)<0)out.push(s);});
  return U.shuffle(out.concat(c));
}

/* ---------- въпроси за рунда ---------- */
function makeQuestions(d){
  const ws=U.shuffle(WORDS);let wi=0;const nextW=f=>{for(;wi<ws.length;wi++){if(f(ws[wi]))return ws[wi++];}return U.pick(WORDS.filter(f));};
  if(d===1)return [0,1,2,3].map(()=>{const w=nextW(()=>true);return {kind:'letters',w,miss:[w.st],n:3,easy:true};});
  if(d===2)return [0,1,2,3].map(()=>{const w=nextW(x=>x.w.length>=3);return {kind:'letters',w,miss:[U.rnd(0,w.w.length-1)],n:4};});
  if(d===3)return U.shuffle(['letters','syl','letters','syl']).map(k=>{
    if(k==='syl'){const w=nextW(x=>x.syl.length>=2);return {kind:'syl',w,si:U.rnd(0,w.syl.length-1)};}
    const w=nextW(x=>x.w.length>=4);return {kind:'letters',w,miss:pickMissing(w.w,2),n:3};});
  if(d===4)return U.sample(B4,4).map(b=>({kind:'build',b}));
  const bs=U.sample(B5,2);
  return [{kind:'build',b:bs[0]},(()=>{const w=nextW(x=>x.w.length>=5);return {kind:'letters',w,miss:pickMissing(w.w,w.w.length>=7?3:2),n:3};})(),
          {kind:'build',b:bs[1]},(()=>{const w=nextW(x=>x.w.length>=5);return {kind:'letters',w,miss:pickMissing(w.w,w.w.length>=7?3:2),n:3};})()];
}

const EMOJI_FONT="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Segoe UI Symbol',sans-serif";
Capy.css(`
.spell-wrap{flex:1 1 auto;align-self:stretch;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:3.2cqmin;}
.spell-pic{flex:1 1 30%;min-height:0;width:100%;max-height:34cqh;container-type:size;display:flex;align-items:center;justify-content:center;}
.spell-pic span{font-family:${EMOJI_FONT};line-height:1.1;white-space:nowrap;font-size:min(88cqh,calc(78cqw / var(--n)),190px);
  filter:drop-shadow(0 6px 8px rgba(20,60,90,.18));animation:spellbob 3s ease-in-out infinite;}
@keyframes spellbob{50%{transform:translateY(-4%);}}
.spell-word{flex:none;font-size:var(--fs);font-weight:bold;padding:.18em .35em;gap:.08em;flex-wrap:nowrap;max-width:100%;}
.spell-ch,.spell-slot{display:inline-flex;align-items:center;justify-content:center;min-width:.62em;height:1.25em;line-height:1;}
.spell-slot{min-width:1em;margin:0 .06em;border-radius:.18em;background:#FFF4CC;box-shadow:inset 0 0 0 .06em #E8C55A;color:var(--purple-d);}
.spell-slot.spell-cur{background:#FFE58A;box-shadow:inset 0 0 0 .08em var(--coral);animation:spellcur 1.1s ease-in-out infinite;}
.spell-slot.spell-syl{min-width:1.9em;}
.spell-slot.spell-fill{background:#D6FBE6;box-shadow:inset 0 0 0 .06em var(--green);animation:okpop .4s ease-out;}
@keyframes spellcur{50%{transform:scale(1.08);}}
.spell-opts{flex:none;gap:4cqmin;flex-wrap:nowrap;}
.spell-opts .card.letter{font-size:var(--ofs);min-width:1.55em;min-height:1.55em;width:auto;padding:0 .2em;}
.spell-line{flex:none;flex-wrap:wrap;gap:.3em;padding:.3em .4em;font-size:var(--fs);font-weight:bold;max-width:100%;min-height:calc(var(--tap) + .4em);}
.spell-ws{display:inline-flex;align-items:center;justify-content:center;min-width:2.2em;height:1.6em;padding:0 .3em;border-radius:.35em;
  background:#FFF4CC;box-shadow:inset 0 0 0 .07em #E8C55A;}
.spell-ws.spell-fill{background:#E7F0FF;box-shadow:inset 0 0 0 .07em var(--blue);animation:okpop .35s ease-out;}
.spell-dot{align-self:flex-end;padding-bottom:.1em;}
.spell-tiles{flex:none;gap:3cqmin;max-width:100%;}
.spell-tiles .card.word{font-size:var(--fs);padding:.18em .55em;}
.spell-tiles .card.spell-used{opacity:0;pointer-events:none;transform:scale(.6);transition:opacity .25s,transform .25s;}
.spell-tiles .card.spell-hint{animation:spellcur 1s ease-in-out infinite;box-shadow:0 0 0 4px var(--yellow),var(--shadow);}
.spell-tiles .card.spell-fade{opacity:.3;pointer-events:none;}
`);

Capy.registerActivity('spell',{icon:'✏️',start(el,ctx){
  let dead=false,busy=false,qi=0,lastPrompt=null;
  const d=Math.max(1,Math.min(5,ctx.diff|0||1));
  const low=ctx.lower&&d>=3;
  const show=s=>low?s.toLowerCase():s;
  const qs=makeQuestions(d);
  const wrap=U.el('div','spell-wrap');el.appendChild(wrap);
  const prompt=t=>{if(t!==lastPrompt){lastPrompt=t;ctx.prompt('bg',t);}};

  function next(){
    if(dead)return;
    if(qi>=qs.length){ctx.done();return;}
    const q=qs[qi++];wrap.innerHTML='';busy=false;
    if(q.kind==='build')build(q.b);else if(q.kind==='syl')syl(q);else letters(q);
  }
  function finish(okEl,spoken){
    busy=true;ctx.right(okEl);
    ctx.say('bg',spoken).then(()=>U.wait(600)).then(next);
  }
  function picEl(p){const parts=p.split(' ');const e=U.el('div','spell-pic',`<span style="--n:${parts.length}">${parts.join('')}</span>`);return e;}
  function wordFS(len){return `min(${(86/(len*1.02)).toFixed(2)}cqw,15cqh,92px)`;}
  function hint(btns,wrongs){if(wrongs<2)return;const w=btns.filter(x=>x.dataset.ok!=='1'&&!x.classList.contains('dim'));if(w.length>1)U.pick(w).classList.add('dim');}

  /* --- липсващи букви (една или няколко, отляво надясно) --- */
  function letters(q){
    const w=q.w.w;prompt(q.miss.length>1?T_MANY:T_ONE);
    wrap.appendChild(picEl(q.w.p));
    const row=U.el('div','card spell-word');row.style.setProperty('--fs',wordFS(w.length+q.miss.length*.25));wrap.appendChild(row);
    const slots={};
    w.split('').forEach((ch,i)=>{if(q.miss.indexOf(i)>=0){const s=U.el('span','spell-slot','');slots[i]=s;row.appendChild(s);}
      else row.appendChild(U.el('span','spell-ch',show(ch)));});
    const opts=U.el('div','row spell-opts');opts.style.setProperty('--ofs',`min(12cqh,${(88/q.n/1.75).toFixed(1)}cqw,80px)`);wrap.appendChild(opts);
    let step=0;
    function stepUI(){
      const idx=q.miss[step];Object.values(slots).forEach(s=>s.classList.remove('spell-cur'));slots[idx].classList.add('spell-cur');
      opts.innerHTML='';const btns=[];let wrongs=0;
      letterOpts(w,idx,q.n,q.easy).forEach(c=>{
        const b=U.el('button','card letter',show(c));if(c===w[idx])b.dataset.ok='1';
        b.onclick=()=>{
          if(dead||busy||b.classList.contains('dim'))return;
          if(c===w[idx]){
            const s=slots[idx];s.textContent=show(c);s.classList.remove('spell-cur');s.classList.add('spell-fill');step++;
            if(step>=q.miss.length){b.classList.add('ok');btns.forEach(x=>{if(x!==b)x.classList.add('dim');});finish(row,sayWord(q.w));}
            else{Capy.sfx.pop();busy=true;b.classList.add('ok');setTimeout(()=>{if(dead)return;busy=false;stepUI();},380);}
          }else{ctx.wrong(b);wrongs++;hint(btns,wrongs);}
        };
        btns.push(b);opts.appendChild(b);
      });
    }
    stepUI();
  }

  /* --- липсваща сричка --- */
  function syl(q){
    const wd=q.w;prompt(T_SYL);
    wrap.appendChild(picEl(wd.p));
    const row=U.el('div','card spell-word');row.style.setProperty('--fs',wordFS(wd.w.length+1));wrap.appendChild(row);
    let slot=null;
    wd.syl.forEach((s,i)=>{if(i===q.si){slot=U.el('span','spell-slot spell-syl spell-cur','');slot.style.minWidth=(s.length*.82+.3)+'em';row.appendChild(slot);}
      else s.split('').forEach(ch=>row.appendChild(U.el('span','spell-ch',show(ch))));});
    const opts=U.el('div','row spell-opts');opts.style.setProperty('--ofs','min(10cqh,9.5cqw,64px)');wrap.appendChild(opts);
    const btns=[];let wrongs=0;
    sylOpts(wd,q.si).forEach(s=>{
      const ok=s===wd.syl[q.si];
      const b=U.el('button','card letter',show(s));if(ok)b.dataset.ok='1';
      b.onclick=()=>{
        if(dead||busy||b.classList.contains('dim'))return;
        if(ok){slot.textContent=show(s);slot.classList.remove('spell-cur');slot.classList.add('spell-fill');b.classList.add('ok');
          btns.forEach(x=>{if(x!==b)x.classList.add('dim');});finish(row,sayWord(wd));}
        else{ctx.wrong(b);wrongs++;hint(btns,wrongs);}
      };
      btns.push(b);opts.appendChild(b);
    });
  }

  /* --- подреди изречението (приема и естествения алтернативен ред) --- */
  function build(b){
    prompt(T_SENT);
    wrap.appendChild(picEl(b.p));
    const words=b.orders[0],N=words.length;
    const chars=words.join(' ').length+(b.x?b.x.length+1:0);
    const fs=`min(${Math.min(9,Math.max(4.8,330/chars)).toFixed(2)}cqw,${N>3?7.5:9}cqh,52px)`;
    const line=U.el('div','card spell-line');line.style.setProperty('--fs',fs);wrap.appendChild(line);
    const ws=words.map(()=>{const s=U.el('span','spell-ws','');line.appendChild(s);return s;});
    line.appendChild(U.el('span','spell-dot','.'));
    const tiles=U.el('div','row spell-tiles');tiles.style.setProperty('--fs',fs);wrap.appendChild(tiles);
    const placed=[];let wrongs=0;const btns=[];
    const valid=()=>new Set(b.orders.filter(o=>placed.every((w,i)=>o[i]===w)).map(o=>o[placed.length]));
    const mark=()=>{const v=valid();btns.forEach(x=>{if(v.has(x.dataset.w)&&!x.disabled)x.dataset.ok='1';else delete x.dataset.ok;});};
    U.shuffle(words.concat(b.x?[b.x]:[])).forEach(w=>{
      const t=U.el('button','card word',show(w));t.dataset.w=w;
      t.onclick=()=>{
        if(dead||busy||t.disabled||t.classList.contains('dim'))return;
        if(valid().has(w)){
          const k=placed.length;placed.push(w);
          ws[k].textContent=k===0&&low?cap(w):show(w);ws[k].classList.add('spell-fill');
          t.disabled=true;t.classList.add('spell-used');setTimeout(()=>{t.style.display='none';},260);wrongs=0;btns.forEach(x=>x.classList.remove('spell-hint'));
          if(placed.length===N){btns.forEach(x=>{if(!x.disabled)x.classList.add('spell-fade');});mark();finish(line,sentText(placed));}
          else{Capy.sfx.pop();mark();}
        }else{ctx.wrong(t);wrongs++;
          if(wrongs>=2){const v=valid();btns.forEach(x=>{if(!x.disabled&&v.has(x.dataset.w))x.classList.add('spell-hint');});}}
      };
      btns.push(t);tiles.appendChild(t);
    });
    mark();
  }

  next();
  return function(){dead=true;};
}});

Capy._spellData={WORDS,B4,B5,makeQuestions,letterOpts,sylOpts};
})();
