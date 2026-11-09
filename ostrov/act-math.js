'use strict';
(function(){
const U=Capy.util;

/* ---------- думи ---------- */
const W=['нула','едно','две','три','четири','пет','шест','седем','осем','девет','десет','единайсет','дванайсет','тринайсет','четиринайсет','петнайсет','шестнайсет','седемнайсет','осемнайсет','деветнайсет','двайсет'];
const cap=s=>s[0].toUpperCase()+s.slice(1);
const eqAdd=(a,b)=>cap(W[a]+' плюс '+W[b]+' е '+W[a+b]+'.');
const eqSub=(a,b)=>cap(W[a]+' минус '+W[b]+' е '+W[a-b]+'.');
const sgn=(a,b)=>{const lo=Math.min(a,b),hi=Math.max(a,b);return lo===hi?cap(W[lo]+' е равно на '+W[hi]+'.'):cap(W[lo]+' е по-малко от '+W[hi]+'.');};
const T={count:'Колко са?',more:'Къде са повече?',fewer:'Къде са по-малко?',missing:'Кое число липсва?',add:'Колко стават?',sub:'Колко остават?',next:'Какво следва?',bigger:'Кое число е по-голямо?',sign:'Кой знак е верен?'};
const after=n=>'Кое число е след '+W[n]+'?',before=n=>'Кое число е преди '+W[n]+'?';

const S=Object.values(T).concat(W);
for(let a=1;a<=9;a++){for(let b=1;a+b<=10;b++)S.push(eqAdd(a,b));}
for(let a=2;a<=10;a++){for(let b=1;b<a;b++)S.push(eqSub(a,b));}
for(let u=0;u<=5;u++){for(let d=1;d<=9-u;d++)S.push(eqAdd(10+u,d));for(let d=1;d<=u;d++)S.push(eqSub(10+u,d));}
for(let n=1;n<=9;n++)S.push(after(n));
for(let n=2;n<=10;n++)S.push(before(n));
for(let a=1;a<=10;a++)for(let b=a;b<=10;b++)S.push(sgn(a,b));
Capy.speech('bg',S);

/* ---------- външен вид ---------- */
const NC=['#5B6EE1','#E85F4C','#F08A00','#D49A00','#27B276','#12A6B8','#2F8BEA','#7A58E6','#E96AA3','#B5651D'];
const OBJ=['🧁','🍩','🍓','🐥','🐠','🐚','⭐','🌸','🍭','🎀','🐙','🦄','🍒','🐢','🦀','🍪','🍎'];
const COLS=['#FF5A5F','#3B8CF0','#FFD23F','#3FCF8E','#9B7BFF','#FF8FC0'];

Capy.css(`
.math-q{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(10px,3cqmin,34px);animation:mathin .35s ease-out;
  --o:min(17cqw,12cqh);--on:clamp(60px,min(24cqw,19cqh),150px);}
.math-q.multi{--o:min(13cqw,7.5cqh);}
@container (min-aspect-ratio:13/10){
 .math-q{--o:min(11cqw,18cqh);}
 .math-q.multi{--o:min(6.5cqw,14cqh);}
}
@keyframes mathin{from{opacity:0;transform:translateY(16px);}}
.math-vis{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2cqmin,24px);max-width:100%;}
.math-vis.wide{flex-direction:column;}
@container (min-aspect-ratio:13/10){.math-vis.wide{flex-direction:row;gap:3cqw;}}
.math-ans{display:flex;gap:clamp(10px,3cqmin,32px);justify-content:center;align-items:center;flex-wrap:nowrap;max-width:100%;}
.math-grp{display:flex;flex-direction:column;align-items:center;gap:calc(var(--o)*.08);padding:calc(var(--o)*.25);}
.math-grp.card{border:4px solid transparent;padding:calc(var(--o)*.3);}
.math-row{display:flex;gap:calc(var(--o)*.08);justify-content:flex-start;}
.math-o{width:var(--o);height:var(--o);font-size:calc(var(--o)*.82);line-height:var(--o);text-align:center;position:relative;flex:none;}
.math-o.gone{opacity:.35;filter:grayscale(.6);transform:translateY(calc(var(--o)*.15)) rotate(-12deg);}
.math-o.gone::after{content:"✖";position:absolute;inset:0;font-size:.85em;color:#E85F4C;opacity:.9;}
.math-o.pulse,.math-cell.pulse{animation:mathpulse .6s ease-out;}
@keyframes mathpulse{40%{transform:scale(1.5);}}
.math-sym{font-size:calc(var(--o)*1.1);font-weight:bold;color:var(--purple-d);line-height:1;}
.math-eq{display:flex;align-items:center;justify-content:center;gap:.25em;font-weight:bold;font-size:clamp(34px,min(14cqw,14cqh),130px);line-height:1.1;}
.math-eq .math-slot{min-width:1.1em;}
.math-n{font-weight:bold;}
.math-slot{display:inline-flex;align-items:center;justify-content:center;min-width:1.2em;min-height:1.15em;border-radius:.25em;border:.07em dashed var(--purple);color:var(--purple-d);animation:mathslot 1.4s ease-in-out infinite;background:rgba(255,255,255,.55);}
.math-slot.full{animation:none;border-style:solid;border-color:var(--green);background:#fff;}
@keyframes mathslot{50%{transform:scale(1.07);}}
.math-seq{display:flex;gap:clamp(6px,1.6cqmin,16px);justify-content:center;align-items:center;font-size:clamp(30px,min(12.5cqw,14cqh),110px);}
.math-seq .card{min-width:1.35em;min-height:1.35em;font-weight:bold;font-size:1em;padding:0;}
.math-seq .math-slot{min-width:1.35em;min-height:1.35em;}
.math-num{font-size:calc(var(--on)*.78);font-weight:bold;min-width:calc(var(--on)*1.2);min-height:var(--on);padding:0 .15em;}
.math-num.sign{font-size:calc(var(--on)*.95);}
.math-pi{display:inline-flex;align-items:center;justify-content:center;width:1.1em;height:1.1em;font-size:inherit;line-height:1;}
.math-pi i{display:block;width:.8em;height:.8em;border-radius:50%;box-shadow:inset -.08em -.1em 0 rgba(0,0,0,.14);}
.math-seq .math-pi{font-size:.8em;}
.math-ans .math-pi{font-size:calc(var(--on)*.62);}
.math-ans .card.math-pat{min-width:var(--on);min-height:var(--on);}
.math-frame{display:grid;grid-template-columns:repeat(5,var(--c));grid-auto-rows:var(--c);gap:calc(var(--c)*.1);padding:calc(var(--c)*.14);background:#fff;border-radius:calc(var(--c)*.3);box-shadow:var(--shadow);--c:calc(var(--o)*.8);}
.math-cell{border-radius:50%;background:#EEF3F7;box-shadow:inset 0 2px 0 rgba(0,0,0,.08);position:relative;}
.math-cell.a{background:var(--blue);} .math-cell.b{background:var(--green);} .math-cell.c{background:var(--coral);}
.math-cell.x{background:var(--blue);opacity:.35;} .math-cell.x::after{content:"✖";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(var(--c)*.8);color:#E85F4C;}
.math-frames{display:flex;gap:calc(var(--o)*.3);flex-wrap:wrap;justify-content:center;align-items:center;}
.math-ans.col{flex-direction:column;}
@container (min-aspect-ratio:13/10){.math-ans.col{flex-direction:row;}}
.math-hint:empty{display:none;}
.math-hint{animation:mathin .35s ease-out;}
.math-arrow{font-size:calc(var(--o)*1.1);color:var(--purple-d);line-height:1;}
.math-big{display:flex;align-items:center;justify-content:center;gap:.3em;font-weight:bold;font-size:clamp(50px,min(22cqw,20cqh),160px);}
`);

/* ---------- помощници ---------- */
const nEl=(n,cls)=>{const s=U.el('span',cls||'math-n',String(n));s.style.color=NC[n%10];return s;};
const nHTML=n=>`<span style="color:${NC[n%10]}">${n}</span>`;
function group(emoji,n,gone){
  const g=U.el('div','math-grp');const rows=n<=5?[n]:[5,n-5];let k=0;
  rows.forEach(c=>{const r=U.el('div','math-row');for(let i=0;i<c;i++){const o=U.el('span','math-o'+(gone&&k>=n-gone?' gone':''),emoji);r.appendChild(o);k++;}g.appendChild(r);});
  return g;
}
function frame(cells){ /* cells: масив от 10 класа */
  const f=U.el('div','math-frame');cells.forEach(c=>f.appendChild(U.el('div','math-cell '+c)));return f;
}
function fillCells(spec){const a=[];spec.forEach(([n,c])=>{for(let i=0;i<n;i++)a.push(c);});while(a.length<10)a.push('');return a;}
function pi(it){const s=U.el('span','math-pi');if(it.k==='e')s.textContent=it.v;else{const i=document.createElement('i');i.style.background=it.v;s.appendChild(i);}return s;}
function numOpts(ans,lo,hi,n,spread){
  const set=new Set([ans]);let guard=0;
  while(set.size<(n||3)&&guard++<80){const d=U.pick([-2,-1,1,2,3,-3]);const v=ans+d;if(v>=lo&&v<=hi)set.add(v);}
  for(let v=lo;set.size<(n||3)&&v<=hi;v++)set.add(v);
  return U.shuffle(Array.from(set)).map(v=>({v,ok:v===ans}));
}
function distinct3(a){return U.shuffle(a);}

/* ---------- генератори на въпроси ---------- */
/* всеки връща {key,prompt,say,vis[],opts[],hint(),onWrong(n),reveal(),cls} */
function digitOpts(list){return list.map(o=>{const b=U.el('button','card math-num');b.style.color=NC[o.v%10];b.textContent=o.v;return {el:b,ok:o.ok};});}
function pulseSeq(root,sel){return ()=>{[...root.querySelectorAll(sel)].forEach((e,i)=>setTimeout(()=>{e.classList.add('pulse');Capy.sfx.tap();},i*380));};}

const Q={
  count(max){return()=>{const n=U.rnd(1,max),e=U.pick(OBJ),g=group(e,n);
    return {key:'count'+n+e,prompt:T.count,say:W[n],vis:[g],opts:digitOpts(numOpts(n,1,Math.max(max,3))),hint:g};};},
  more(fewer,max){return()=>{let a,b;do{a=U.rnd(1,max);b=U.rnd(1,max);}while(Math.abs(a-b)<2);
    const e=U.pick(OBJ),want=fewer?Math.min(a,b):Math.max(a,b),cols=['#FF8FC0','#4DABF7'];
    const opts=[a,b].map((n,i)=>{const bt=U.el('button','card math-grp');bt.style.borderColor=cols[i];bt.appendChild(group(e,n));return {el:bt,ok:n===want,n};});
    return {key:'more'+(fewer?'f':'m')+a+'-'+b+e,prompt:fewer?T.fewer:T.more,say:W[want],vis:[],opts,optsCls:'math-ans col',cls:'multi',hint:null};};},
  missing(){return()=>{const len=U.rnd(4,5),s=U.rnd(1,10-len+1),idx=U.rnd(0,len-1),ans=s+idx;
    const seq=U.el('div','math-seq');let slot;for(let i=0;i<len;i++){if(i===idx){slot=U.el('span','math-slot','?');seq.appendChild(slot);}else{const c=U.el('div','card');c.appendChild(nEl(s+i));seq.appendChild(c);}}
    return {key:'miss'+s+'-'+len+'-'+idx,prompt:T.missing,say:W[ans],vis:[seq],opts:digitOpts(numOpts(ans,1,10)),reveal:()=>{slot.textContent=ans;slot.style.color=NC[ans%10];slot.classList.add('full');}};};},
  dots(){return()=>{const n=U.rnd(1,10),f=frame(fillCells([[n,U.pick(['a','b','c'])]]));
    return {key:'dots'+n,prompt:T.count,say:W[n],vis:[f],opts:digitOpts(numOpts(n,1,10)),hint:f};};},
  addObj(){return()=>{const mx=Math.random()<.5?6:10,a=U.rnd(1,mx-1),b=U.rnd(1,mx-a),[e1,e2]=U.sample(OBJ,2);
    const A=group(e1,a),B=group(e2,b),row=U.el('div','math-vis wide');
    row.appendChild(A);row.appendChild(U.el('div','math-sym','＋'));row.appendChild(B);row.appendChild(U.el('div','math-sym','＝ ?'));
    return {key:'add'+a+'+'+b,prompt:T.add,say:eqAdd(a,b),vis:[row],opts:digitOpts(numOpts(a+b,1,10)),hint:row,cls:'multi'};};},
  subObj(){return()=>{const a=U.rnd(3,10),b=U.rnd(1,a-1),e=U.pick(OBJ),g=group(e,a,b);
    const eq=U.el('div','math-eq');eq.innerHTML=nHTML(a)+'<span class="math-sym" style="font-size:1em">−</span>'+nHTML(b)+'<span class="math-sym" style="font-size:1em">＝</span><span class="math-slot">?</span>';
    return {key:'sub'+a+'-'+b,prompt:T.sub,say:eqSub(a,b),vis:[eq,g],opts:digitOpts(numOpts(a-b,0+1,10)),hint:g,hintSel:'.math-o:not(.gone)'};};},
  addDig(){return()=>{const a=U.rnd(1,9),b=U.rnd(1,10-a),eq=U.el('div','math-eq');
    eq.innerHTML=nHTML(a)+'<span class="math-sym" style="font-size:1em">＋</span>'+nHTML(b)+'<span class="math-sym" style="font-size:1em">＝</span><span class="math-slot">?</span>';
    return {key:'ad'+a+'+'+b,prompt:T.add,say:eqAdd(a,b),vis:[eq],opts:digitOpts(numOpts(a+b,2,10)),
      onWrong:(h)=>{if(h===1)h_frame(this_q,[[a,'a'],[b,'b']]);}};};},
  bigger(){return()=>{let a,b;do{a=U.rnd(1,10);b=U.rnd(1,10);}while(a===b);
    const opts=[a,b].map(v=>{const bt=U.el('button','card math-num');bt.style.color=NC[v%10];bt.textContent=v;return {el:bt,ok:v===Math.max(a,b)};});
    return {key:'big'+a+'-'+b,prompt:T.bigger,say:W[Math.max(a,b)],vis:[],opts};};},
  pattern(kinds){return()=>{const kind=U.pick(kinds),useEm=Math.random()<.5;
    const pool=useEm?U.sample(OBJ,3).map(v=>({k:'e',v})):U.sample(COLS,3).map(v=>({k:'c',v}));
    const unit={AB:[0,1],AAB:[0,0,1],ABC:[0,1,2]}[kind],full=unit.length,shown=kind==='AB'?U.rnd(4,5):full*2;
    const seq=Array.from({length:shown+1},(_,i)=>unit[i%full]),ans=seq.pop();
    const line=U.el('div','math-seq');seq.forEach(i=>line.appendChild(pi(pool[i])));let slot=U.el('span','math-slot','?');line.appendChild(slot);
    const used=Array.from(new Set(unit)),idxs=used.slice();while(idxs.length<3){const x=[0,1,2].find(i=>idxs.indexOf(i)<0);idxs.push(x);}
    const opts=U.shuffle(idxs).map(i=>{const b=U.el('button','card math-pat');b.appendChild(pi(pool[i]));return {el:b,ok:i===ans};});
    return {key:'pat'+kind+pool.map(p=>p.v).join(''),prompt:T.next,say:null,vis:[line],opts,reveal:()=>{slot.textContent='';slot.appendChild(pi(pool[ans]));slot.classList.add('full');}};};},
  neighbour(){return()=>{const aft=Math.random()<.5,n=aft?U.rnd(1,9):U.rnd(2,10),ans=aft?n+1:n-1;
    const r=U.el('div','math-big'),q=U.el('span','math-slot','?'),ar=U.el('span','math-arrow','➜');
    if(aft){r.appendChild(nEl(n));r.appendChild(ar);r.appendChild(q);}else{r.appendChild(q);r.appendChild(ar);r.appendChild(nEl(n));}
    return {key:'nb'+(aft?'a':'b')+n,prompt:aft?after(n):before(n),say:W[ans],vis:[r],opts:digitOpts(numOpts(ans,1,10)),reveal:()=>{q.textContent=ans;q.style.color=NC[ans%10];q.classList.add('full');}};};},
  missAdd(){return()=>{const c=U.rnd(3,10),a=U.rnd(1,c-2),b=c-a,eq=U.el('div','math-eq');
    eq.innerHTML=nHTML(a)+'<span class="math-sym" style="font-size:1em">＋</span><span class="math-slot">?</span><span class="math-sym" style="font-size:1em">＝</span>'+nHTML(c);
    return {key:'ma'+a+'+'+b,prompt:T.missing,say:eqAdd(a,b),vis:[eq],opts:digitOpts(numOpts(b,1,9)),
      onWrong:(h)=>{if(h===1)h_frame(this_q,[[a,'a'],[b,'c']]);},reveal:()=>{const s=eq.querySelector('.math-slot');s.textContent=b;s.style.color=NC[b%10];s.classList.add('full');}};};},
  teen(){return()=>{const add=Math.random()<.5;let a,d;
    if(add){const u=U.rnd(0,5);a=10+u;d=U.rnd(1,9-u);}else{const u=U.rnd(1,5);a=10+u;d=U.rnd(1,u);}
    const u=a-10,ans=add?a+d:a-d,eq=U.el('div','math-eq');
    eq.innerHTML=nHTML(a)+'<span class="math-sym" style="font-size:1em">'+(add?'＋':'−')+'</span>'+nHTML(d)+'<span class="math-sym" style="font-size:1em">＝</span><span class="math-slot">?</span>';
    const fr=U.el('div','math-frames');fr.appendChild(frame(fillCells([[10,'a']])));
    fr.appendChild(frame(add?fillCells([[u,'a'],[d,'b']]):fillCells([[u-d,'a'],[d,'x']])));
    return {key:'teen'+a+(add?'+':'-')+d,prompt:add?T.add:T.sub,say:add?eqAdd(a,d):eqSub(a,d),vis:[eq,fr],opts:digitOpts(numOpts(ans,10,20)),hint:fr,hintSel:'.math-cell.a,.math-cell.b',cls:'multi',
      reveal:()=>{const s=eq.querySelector('.math-slot');s.textContent=ans;s.style.color=NC[ans%10];s.classList.add('full');}};};},
  twos(){return()=>{const s=2*U.rnd(0,7),seq=U.el('div','math-seq'),ans=s+6;let slot;
    [0,2,4,6].forEach(k=>{if(k===6){slot=U.el('span','math-slot','?');seq.appendChild(slot);}else{const c=U.el('div','card');c.appendChild(nEl(s+k));seq.appendChild(c);}});
    const set=new Set([ans,ans+1,ans-1,ans+2,ans-2].filter(v=>v>=1&&v<=20));
    const opts=U.sample(Array.from(set).filter(v=>v!==ans),2).map(v=>({v,ok:false}));opts.push({v:ans,ok:true});
    return {key:'two'+s,prompt:T.next,say:W[ans],vis:[seq],opts:digitOpts(U.shuffle(opts)),reveal:()=>{slot.textContent=ans;slot.style.color=NC[ans%10];slot.classList.add('full');}};};},
  sign(){return()=>{const a=U.rnd(1,10),b=Math.random()<.2?a:U.rnd(1,10),want=a<b?'<':a>b?'>':'=';
    const r=U.el('div','math-big');r.appendChild(nEl(a));const q=U.el('span','math-slot','?');r.appendChild(q);r.appendChild(nEl(b));
    const opts=['<','=','>'].map(s=>{const bt=U.el('button','card math-num sign');bt.textContent=s;bt.style.color=s==='<'?'#E96AA3':s==='='?'#27B276':'#2F8BEA';return {el:bt,ok:s===want,s};});
    return {key:'sg'+a+want+b,prompt:T.sign,say:sgn(a,b),vis:[r],opts,reveal:()=>{q.textContent=want;q.classList.add('full');}};};}
};
let this_q=null;
function h_frame(q,spec){const h=q.querySelector('.math-hint');if(h&&!h.firstChild)h.appendChild(frame(fillCells(spec)));}

const TYPES={
  1:[Q.count(5),Q.more(false,5)],
  2:[Q.count(10),Q.more(true,8),Q.missing(),Q.dots()],
  3:[Q.addObj(),Q.neighbour(),Q.pattern(['AB','AAB'])],
  4:[Q.subObj(),Q.addDig(),Q.bigger(),Q.pattern(['ABC'])],
  5:[Q.missAdd(),Q.teen(),Q.twos(),Q.sign()]
};

Capy.registerActivity('math',{icon:'🔢',start(el,ctx){
  let alive=true;const timers=[];
  const setT=(f,ms)=>{const t=setTimeout(()=>{if(alive)f();},ms);timers.push(t);return t;};
  const diff=Math.max(1,Math.min(5,ctx.diff||1)),types=TYPES[diff],seen=new Set();
  let order=[];

  function nextSpec(){
    if(!order.length)order=U.shuffle(types);
    const gen=order.pop();let sp,g=0;
    do{sp=gen();}while(seen.has(sp.key)&&g++<40);
    seen.add(sp.key);return sp;
  }

  function ask(sp){
    return new Promise(res=>{
      el.innerHTML='';
      const q=U.el('div','math-q '+(sp.cls||''));this_q=q;
      const vis=U.el('div','math-vis');sp.vis.forEach(v=>vis.appendChild(v));if(sp.vis.length)q.appendChild(vis);
      const hint=U.el('div','math-hint');q.appendChild(hint);
      const ans=U.el('div',sp.optsCls||'math-ans');q.appendChild(ans);
      let wrongs=0,locked=false;
      sp.opts.forEach(o=>{
        const b=o.el;if(o.ok)b.dataset.ok='1';
        b.onclick=async()=>{
          if(locked||!alive)return;
          if(o.ok){
            locked=true;ctx.right(b);if(sp.reveal)sp.reveal();
            sp.opts.forEach(x=>{if(x!==o)x.el.classList.add('dim');});
            if(sp.say)await ctx.say('bg',sp.say);else await U.wait(900);
            await U.wait(450);if(alive)res();
          }else{
            wrongs++;ctx.wrong(b);
            if(sp.onWrong)sp.onWrong(wrongs);
            if(wrongs>=2){b.classList.add('dim');
              if(wrongs===2){const h=sp.hint;if(h){if(sp.hintSel)pulseSeq(h,sp.hintSel)();else pulseSeq(h,'.math-o,.math-cell.a,.math-cell.b,.math-cell.c')();}
                if(sp.cls!=='multi'||sp.onWrong){}}}
          }
        };
        ans.appendChild(b);
      });
      el.appendChild(q);
      ctx.prompt('bg',sp.prompt);
    });
  }

  (async()=>{
    for(let i=0;i<4&&alive;i++){await ask(nextSpec());}
    if(alive){alive=false;ctx.done();}
  })();

  return function(){alive=false;timers.forEach(clearTimeout);};
}});
})();
