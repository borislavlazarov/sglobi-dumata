/* ===== „Прочети и намери" — четене с разбиране (дума/фраза/изречение → картинка) =====
   Съдържанието е в изреченски регистър („Котката спи."); при ctx.lower=false се показва С ГЛАВНИ.
   Изречената фраза (след верен отговор) е точно този текст — той е регистриран в Capy.speech. */
'use strict';
(function(){
const U=Capy.util;
const T_READ='Прочети и намери картинката.',T_REV='Виж картинката. Намери изречението.';

/* ред: „текст|картинка|етикети"; картинка = 1–3 емоджи, разделени с интервал;
   „^" отпред = голямо, „~" отпред = малко (за ГОЛЯМО/МАЛКО) */
const A=s=>s.split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const [t,p,k]=x.split('|').map(y=>(y||'').trim());
  return {t,p,k:k?k.split(/\s+/):[]};});

/* ---------- ниво 1: единични думи, по категории (дистракторите са от други категории) ---------- */
const W1={
 animal:A(`Котка|🐱;Куче|🐶;Риба|🐟;Кон|🐴;Заек|🐰;Мечка|🐻;Жаба|🐸;Слон|🐘;Пингвин|🐧;Еднорог|🦄;
   Мишка|🐭;Лисица|🦊;Маймуна|🐵;Пчела|🐝;Охлюв|🐌`),
 food:A(`Ябълка|🍎;Банан|🍌;Ягода|🍓;Лимон|🍋;Диня|🍉;Морков|🥕;Хляб|🍞;Торта|🎂;Сладолед|🍦;Пица|🍕;
   Мляко|🥛;Гъба|🍄`),
 nature:A(`Слънце|☀️;Луна|🌙;Звезда|⭐;Облак|☁️;Дъга|🌈;Цвете|🌸;Дърво|🌳;Палма|🌴;Вълна|🌊;Остров|🏝️;
   Мида|🐚;Капка|💧`),
 thing:A(`Кола|🚗;Влак|🚂;Кораб|🚢;Топка|⚽;Балон|🎈;Къща|🏠;Замък|🏰;Корона|👑;Книга|📖;Молив|✏️;
   Чадър|☂️;Лодка|⛵;Ракета|🚀;Рокля|👗;Ключ|🔑`)
};
Object.keys(W1).forEach(c=>W1[c].forEach(it=>{it.cat=c;}));
const D1=[].concat(...Object.values(W1));

/* ---------- ниво 2: две думи; етикети „семейство признак съществително" ---------- */
const D2=A(`
 Червено сърце|❤️|col red heart; Синьо сърце|💙|col blue heart; Зелено сърце|💚|col green heart;
 Жълто сърце|💛|col yellow heart; Лилаво сърце|💜|col purple heart;
 Червена ябълка|🍎|col red apple; Зелена ябълка|🍏|col green apple;
 Червена книга|📕|col red book; Зелена книга|📗|col green book; Синя книга|📘|col blue book;
 Червен кръг|🔴|col red circle; Син кръг|🔵|col blue circle; Зелен кръг|🟢|col green circle; Жълт кръг|🟡|col yellow circle;
 Червен квадрат|🟥|col red square; Син квадрат|🟦|col blue square; Зелен квадрат|🟩|col green square; Жълт квадрат|🟨|col yellow square;
 Една котка|🐱|num 1 cat; Две котки|🐱 🐱|num 2 cat; Три котки|🐱 🐱 🐱|num 3 cat;
 Две риби|🐟 🐟|num 2 fish; Три риби|🐟 🐟 🐟|num 3 fish;
 Един балон|🎈|num 1 balloon; Два балона|🎈 🎈|num 2 balloon; Три балона|🎈 🎈 🎈|num 3 balloon;
 Един сладолед|🍦|num 1 ice; Два сладоледа|🍦 🍦|num 2 ice; Три сладоледа|🍦 🍦 🍦|num 3 ice;
 Два еднорога|🦄 🦄|num 2 unicorn; Три еднорога|🦄 🦄 🦄|num 3 unicorn;
 Две звезди|⭐ ⭐|num 2 star; Три звезди|⭐ ⭐ ⭐|num 3 star;
 Две принцеси|👸 👸|num 2 princess; Две кучета|🐶 🐶|num 2 dog;
 Голямо куче|^🐶|size big dog; Малко куче|~🐶|size small dog;
 Голяма котка|^🐱|size big cat; Малка котка|~🐱|size small cat;
 Голяма риба|^🐟|size big fish; Малка риба|~🐟|size small fish;
 Голям балон|^🎈|size big balloon; Малък балон|~🎈|size small balloon;
 Голяма торта|^🎂|size big cake; Малка торта|~🎂|size small cake`);

/* ---------- ниво 3: кратки изречения (2–3 думи) ---------- */
const D3=A(`
 Котката спи.|🐱 💤|cat sleep; Кучето спи.|🐶 💤|dog sleep; Бебето спи.|👶 💤|baby sleep;
 Принцесата спи.|👸 💤|princess sleep;
 Рибата плува.|🐟 🌊|fish swim; Патицата плува.|🦆 🌊|duck swim; Пингвинът плува.|🐧 🌊|penguin swim;
 Птичката пее.|🐦 🎵|bird sing; Птичката лети.|🐦 ☁️|bird fly; Момичето пее.|👧 🎤|girl sing;
 Принцесата пее.|👸 🎤|princess sing; Момичето танцува.|💃 🎶|girl dance;
 Котката пие мляко.|🐱 🥛|cat drink milk; Бебето пие мляко.|👶 🍼|baby drink milk;
 Кучето яде кокал.|🐶 🦴|dog eat; Заекът яде морков.|🐰 🥕|rabbit eat; Маймуната яде банан.|🐵 🍌|monkey eat;
 Мечето яде мед.|🐻 🍯|bear eat; Котката яде риба.|🐱 🐟|cat eat fish;
 Вали дъжд.|🌧️ ☔|weather rain; Вали сняг.|🌨️ ☃️|weather snow;
 Слънцето грее.|☀️|sky sun; Луната свети.|🌙 ✨|sky moon;
 Корабът плава.|🚢 🌊|ship swim; Самолетът лети.|✈️ ☁️|plane fly;
 Момчето рита топка.|👦 ⚽|boy ball; Котката играе.|🐱 🧶|cat play; Баба плете.|👵 🧶|grandma yarn;
 Дедо чете.|👴 📖|grandpa read; Конят тича.|🐴 💨|horse run; Кучето тича.|🐶 💨|dog run;
 Еднорогът тича.|🦄 💨|unicorn run; Бебето плаче.|👶 😭|baby cry`);

/* ---------- ниво 4: изречения 3–4 думи (+ обратен режим: картинка → изречение) ---------- */
const D4=A(`
 Котката спи в кутията.|🐱 💤 📦|cat sleep box; Кучето спи в леглото.|🐶 💤 🛏️|dog sleep bed;
 Котката спи в леглото.|🐱 💤 🛏️|cat sleep bed; Мечето спи в гората.|🐻 💤 🌲|bear sleep forest;
 Мама пече торта.|👩 🎂|mom bake cake; Баба пече палачинки.|👵 🥞|grandma bake;
 Татко кара кола.|👨 🚗|dad drive car; Дедо кара колело.|👴 🚲|grandpa drive bike; Татко кара колело.|👨 🚲|dad drive bike;
 Момичето яде сладолед.|👧 🍦|girl eat; Момчето яде пица.|👦 🍕|boy eat;
 Принцесата живее в замък.|👸 🏰|princess castle; Принцесата държи цвете.|👸 🌹|princess flower;
 Рибката плува в морето.|🐠 🌊|fish sea; Делфинът скача във водата.|🐬 🌊|dolphin sea;
 Котката гони мишка.|🐱 🐭|cat mouse; Птичката е на дървото.|🐦 🌳|bird tree; Маймуната е на палмата.|🐵 🌴|monkey tree;
 Кучето играе с топка.|🐶 ⚽|dog play ball; Котката играе с топка.|🐱 ⚽|cat play ball;
 Еднорогът яде ябълка.|🦄 🍎|unicorn eat; Конят яде морков.|🐴 🥕|horse eat; Пингвинът яде риба.|🐧 🐟|penguin eat;
 Лодката плава по морето.|⛵ 🌊|boat sea; Слънцето грее над морето.|☀️ 🌊|sun sea; Луната свети над замъка.|🌙 🏰|moon castle;
 Детето чете книга.|🧒 📖|child book; Детето пуска хвърчило.|🧒 🪁|child kite;
 Татко пие кафе.|👨 ☕|dad drink; Мама пие чай.|👩 🍵|mom drink;
 Момичето танцува балет.|👧 🩰|girl dance; Костенурката е на плажа.|🐢 🏖️|turtle beach;
 Пеперудата е на цветето.|🦋 🌸|butterfly flower; Децата правят снежен човек.|👧 👦 ☃️|child snow`);

/* ---------- ниво 5: по-дълги изречения; дистракторите се различават в ЕДНА подробност ---------- */
const S5={'принцесата':'👸','момичето':'👧','котката':'🐱','кучето':'🐶','маймуната':'🐵','мечето':'🐻','еднорогът':'🦄','баба':'👵'};
const A5={'яде сладолед':'🍦','яде торта':'🎂','яде диня':'🍉','яде банан':'🍌','яде ягоди':'🍓','пие мляко':'🥛','чете книга':'📖','пее':'🎤','спи':'💤'};
const P5={'на плажа':'🏖️','в замъка':'🏰','в гората':'🌲','в лодката':'⛵','в колата':'🚗','на луната':'🌙'};
const T5=`принцесата/яде сладолед/на плажа; принцесата/пее/в замъка; принцесата/спи/в замъка; принцесата/чете книга/в лодката;
 принцесата/яде диня/в гората; принцесата/яде торта/в колата; момичето/яде диня/на плажа; момичето/пее/в колата;
 момичето/пие мляко/в колата; момичето/яде сладолед/в лодката; момичето/спи/на плажа; момичето/пее/на луната;
 котката/спи/в колата; котката/спи/в лодката; котката/пие мляко/в замъка; котката/яде торта/на плажа; котката/яде ягоди/на луната;
 кучето/спи/на плажа; кучето/пие мляко/в колата; кучето/яде сладолед/на плажа;
 маймуната/яде банан/в гората; маймуната/яде банан/на плажа; маймуната/чете книга/в гората;
 мечето/спи/в гората; мечето/яде ягоди/в гората; мечето/пее/в лодката; мечето/пие мляко/на луната;
 еднорогът/спи/на луната; еднорогът/яде сладолед/в замъка; еднорогът/пее/на луната; еднорогът/чете книга/в гората;
 баба/чете книга/на плажа; баба/яде диня/в лодката; баба/спи/в лодката`
 .split(';').map(x=>x.trim().split('/'));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const mk5=([s,a,p])=>({t:cap(s+' '+a+' '+p+'.'),p:S5[s]+' '+A5[a]+' '+P5[p],sl:[s,a,p]});
const D5=T5.map(mk5);

Capy.speech('bg',[T_READ,T_REV].concat(D1.map(x=>x.t),D2.map(x=>x.t),D3.map(x=>x.t),D4.map(x=>x.t),D5.map(x=>x.t)));

/* ---------- избор на дистрактори ---------- */
const overlap=(a,b)=>a.k.filter(x=>b.k.indexOf(x)>=0).length;
function pickShared(target,pool,n,nShare){
  const others=U.shuffle(pool.filter(x=>x!==target&&x.t!==target.t&&x.p!==target.p));
  const out=[],pics=new Set([target.p]);
  const add=x=>{if(out.length<n&&out.indexOf(x)<0&&!pics.has(x.p)){out.push(x);pics.add(x.p);}};
  others.filter(o=>overlap(o,target)>0).forEach(o=>{if(out.length<nShare)add(o);});
  others.forEach(add);
  return out;
}
function opts2(t){                       /* единият дистрактор споделя признака, другият — съществителното */
  const fam=D2.filter(x=>x.k[0]===t.k[0]&&x!==t);
  const sameA=U.shuffle(fam.filter(x=>x.k[1]===t.k[1]&&x.k[2]!==t.k[2]));
  const sameN=U.shuffle(fam.filter(x=>x.k[2]===t.k[2]&&x.k[1]!==t.k[1]));
  const out=[];[sameA[0],sameN[0]].concat(sameA.slice(1),sameN.slice(1),U.shuffle(fam)).forEach(x=>{if(x&&out.length<2&&out.indexOf(x)<0&&x.p!==t.p)out.push(x);});
  return out;
}
function opts5(t){
  const [s,a,p]=t.sl,out=[];
  const swap=(i,keys)=>{const k=U.pick(keys.filter(x=>x!==t.sl[i]));const sl=t.sl.slice();sl[i]=k;return mk5(sl);};
  out.push(swap(0,Object.keys(S5)),swap(1,Object.keys(A5)),swap(2,Object.keys(P5)));
  return out;
}
function makeQuestions(d){
  if(d===1){return U.sample(D1,4).map(t=>{const cats=U.sample(Object.keys(W1).filter(c=>c!==t.cat),2);
    return {mode:'pic',t,opts:cats.map(c=>U.pick(W1[c]))};});}
  if(d===2)return U.sample(D2,4).map(t=>({mode:'pic',t,opts:opts2(t)}));
  if(d===3)return U.sample(D3,4).map(t=>({mode:'pic',t,opts:pickShared(t,D3,3,2)}));
  if(d===4)return U.sample(D4,4).map((t,i)=>i<2?{mode:'pic',t,opts:pickShared(t,D4,3,2)}:{mode:'rev',t,opts:pickShared(t,D4,2,2)});
  return U.sample(D5,4).map(t=>({mode:'pic',t,opts:opts5(t)}));
}

function picHTML(p){
  const big=p[0]==='^',sm=p[0]==='~';if(big||sm)p=p.slice(1);
  const parts=p.split(' ');
  return `<span class="read-pic${sm?' read-sm':''}" style="--n:${parts.length}">${parts.join('')}</span>`;
}
const npic=p=>p.replace(/^[~^]/,'').split(' ').length;
function phraseFS(len){                    /* текстът да се събира в ~2 реда и да е едър */
  const w=Math.min(13,Math.max(5.2,190/Math.max(len,1)));
  const h=len<=10?15:len<=18?11:9;
  return `min(${w.toFixed(2)}cqw,${h}cqh,72px)`;
}

Capy.css(`
.read-wrap{flex:1 1 auto;align-self:stretch;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3cqmin;}
.read-q{flex:none;font-size:var(--fs);letter-spacing:.02em;max-width:100%;padding:.35em .8em;}
.read-opts{flex:1 1 auto;min-height:0;width:100%;max-height:78cqh;display:grid;gap:3cqmin;
  grid-template-columns:repeat(var(--lc),minmax(0,1fr));grid-auto-rows:minmax(0,1fr);}
@container (max-aspect-ratio:1/1){.read-opts{grid-template-columns:repeat(var(--pc),minmax(0,1fr));}}
.read-opt{container-type:size;min-width:0;min-height:0;padding:0;overflow:hidden;}
.read-pic{display:block;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Segoe UI Symbol',sans-serif;line-height:1.15;white-space:nowrap;text-align:center;font-size:min(58cqh,calc(76cqw / var(--n)),150px);}
.read-sm{font-size:min(24cqh,calc(30cqw / var(--n)),58px);}
.read-fade{opacity:.35;transition:opacity .3s;}
.read-rev .read-top{flex:0 0 36%;width:min(100%,90cqh);container-type:size;min-height:0;}
.read-rev .read-opts{grid-template-columns:minmax(0,1fr)!important;max-height:none;}
.read-ph{font-size:var(--fs);font-weight:bold;min-width:0;min-height:0;padding:.2em .6em;line-height:1.2;text-align:center;}
@container (min-aspect-ratio:13/10){
  .read-rev{flex-direction:row;}
  .read-rev .read-top{flex:0 0 40%;width:auto;height:min(100%,60cqw);}
  .read-rev .read-opts{height:100%;}
}
`);

Capy.registerActivity('read',{icon:'📖',start(el,ctx){
  let dead=false,busy=false,qi=0,lastMode=null;
  const d=Math.max(1,Math.min(5,ctx.diff|0||1));
  const show=t=>ctx.lower?t:t.toUpperCase();
  const qs=makeQuestions(d);
  const wrap=U.el('div','read-wrap');el.appendChild(wrap);

  function next(){
    if(dead)return;
    if(qi>=qs.length){ctx.done();return;}
    const q=qs[qi++];
    if(q.mode!==lastMode){lastMode=q.mode;ctx.prompt('bg',q.mode==='rev'?T_REV:T_READ);}
    render(q);busy=false;
  }
  function render(q){
    wrap.innerHTML='';wrap.className='read-wrap'+(q.mode==='rev'?' read-rev':'');
    const items=U.shuffle([q.t].concat(q.opts));let wrongs=0;const btns=[];
    let grid;
    if(q.mode==='rev'){
      wrap.appendChild(U.el('div','card read-top',picHTML(q.t.p)));
      grid=U.el('div','read-opts');
      const maxLen=Math.max(...items.map(x=>x.t.length));
      grid.style.setProperty('--fs',`min(${Math.min(8,Math.max(3.6,150/maxLen)).toFixed(2)}cqw,${maxLen>24?7:8.5}cqh,46px)`);
    }else{
      const ph=U.el('div','phrase read-q',show(q.t.t));ph.style.setProperty('--fs',phraseFS(q.t.t.length));wrap.appendChild(ph);
      grid=U.el('div','read-opts');
      const n=items.length,m=Math.max(...items.map(x=>npic(x.p)));
      grid.style.setProperty('--lc',n===4&&m>=3?2:n);grid.style.setProperty('--pc',n===4&&m===1?2:1);
    }
    wrap.appendChild(grid);
    items.forEach(it=>{
      const ok=it===q.t;
      const b=q.mode==='rev'?U.el('button','card read-ph',show(it.t)):U.el('button','card read-opt',picHTML(it.p));
      if(ok)b.dataset.ok='1';
      b.onclick=()=>{
        if(dead||busy||b.classList.contains('dim'))return;
        if(ok){busy=true;ctx.right(b);btns.forEach(x=>{if(x!==b)x.classList.add('read-fade');});
          ctx.say('bg',q.t.t).then(()=>U.wait(550)).then(next);}
        else{ctx.wrong(b);wrongs++;
          if(wrongs>=2){const w=btns.filter(x=>x.dataset.ok!=='1'&&!x.classList.contains('dim'));if(w.length>1)U.pick(w).classList.add('dim');}}
      };
      btns.push(b);grid.appendChild(b);
    });
  }
  next();
  return function(){dead=true;};
}});

/* за тестове/проверка на съдържанието */
Capy._readData={D1,D2,D3,D4,D5,W1,makeQuestions};
})();
