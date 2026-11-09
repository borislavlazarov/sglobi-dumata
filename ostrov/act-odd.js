/* ===== „Внимание" (odd): различно, намери всички, не е от групата, намери разликата ===== */
'use strict';
(function(){
const U=Capy.util;
const T={a:'Кое е различно?',b:'Намери всички.',c:'Кое не е от групата?',d:'Намери разликата.'};
Capy.speech('bg',Object.keys(T).map(k=>T[k]));

const POOL1=['🐠','🍎','🚗','⭐','🌸','🐱','🎈','🍌','🐸','🦋','🍓','🏠'];
const MED=[['🐶','🐱'],['🍎','🍌'],['🚗','🚌'],['🐸','🐢'],['🌸','🌻'],['🐟','🐙'],['🍓','🍇'],['⭐','🌙'],['🐻','🐼'],['🍩','🍪']];
const SIM=[['🙂','🙃'],['🐶','🐱'],['🌕','🌝'],['🐻','🐨'],['🍊','🍑'],['🐰','🐭'],['😊','😄'],['🍒','🍓']];
const NEAR=[['🕐','🕑'],['😀','😃'],['🍎','🍅'],['🌷','🌹'],['🐝','🐞'],['⭐','🌟'],['🐭','🐹'],['🌻','🌼']];
const TWIN={};NEAR.forEach(([x,y])=>{TWIN[x]=y;TWIN[y]=x;});
const CATS={fruit:['🍎','🍌','🍇','🍓','🍊','🍉','🍒','🍑','🍐','🍋'],animals:['🐶','🐱','🐭','🐰','🐻','🐼','🦁','🐯','🐮','🐷','🐸','🐵'],
  vehicles:['🚗','🚌','🚕','🚓','🚑','🚒','🚜','✈️','🚂','🚲','🚀'],clothes:['👕','👗','👖','🧦','👒','👟','🧢','🧤','👚'],
  sea:['🐠','🐟','🐬','🐳','🐙','🦀','🦈','🦑','🦐'],sweets:['🍭','🍬','🍫','🍩','🍪','🍰','🧁','🍦'],
  music:['🎸','🥁','🎹','🎷','🎺','🎻']};
const BAD={animals:['sea'],sea:['animals'],fruit:['sweets'],sweets:['fruit']};
const FIND=['🐠','🍎','⭐','🌸','🐱','🚗','🎈','🐸','🍓','🦋'];
const SPOT=['🐠','🍎','🚗','⭐','🌸','🐱','🎈','🍌','🐸','🦋','🍓','🏠','🐶','🍩','🌙','👑'];

Capy.css(`
.odd-root{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;gap:clamp(8px,2vmin,18px);}
.odd-field{flex:1;min-height:0;width:100%;position:relative;}
.odd-grid{display:flex;flex-wrap:wrap;justify-content:center;align-content:center;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);}
.odd-cell{width:var(--s);height:var(--s);padding:0;border-radius:24%;background:#fff;box-shadow:0 5px 0 rgba(40,60,90,.15),0 8px 14px rgba(20,80,110,.15);
  font-size:calc(var(--s)*.6);line-height:1;display:flex;align-items:center;justify-content:center;flex:none;transition:transform .12s,opacity .25s,background .2s;font-family:var(--font);}
.odd-cell:active{transform:translateY(3px);}
.odd-cell.ok,.odd-cell.found{background:#D6FBE6;box-shadow:0 0 0 4px var(--green),0 0 18px rgba(63,207,142,.7);animation:okpop .45s ease-out;}
.odd-cell.no{animation:shake .42s;}
.odd-cell.dim{opacity:.25;pointer-events:none;}
.odd-cell.hint{animation:oddhint .8s ease-in-out infinite;}
.odd-cell.cat{border-radius:26%;}
@keyframes oddhint{50%{transform:scale(1.14);box-shadow:0 0 0 5px var(--yellow),0 0 20px var(--yellow);}}
.odd-head{flex:none;display:flex;align-items:center;gap:.5em;background:#fff;border-radius:999px;padding:.2em .9em;box-shadow:var(--shadow);font-weight:bold;font-size:clamp(22px,min(7cqw,6cqh),48px);}
.odd-head .tg{font-size:1.5em;line-height:1.1;} .odd-head .ct{background:var(--purple);color:#fff;border-radius:999px;padding:0 .6em;}
.odd-sd{display:flex;align-items:center;justify-content:center;position:absolute;inset:0;}
.odd-sd.col{flex-direction:column;}
.odd-sd .odd-grid{position:static;transform:none;background:rgba(255,255,255,.55);border-radius:22px;padding:calc(var(--g)*1px);box-shadow:inset 0 0 0 4px #fff;}
.odd-sd .odd-cell{box-shadow:0 3px 0 rgba(40,60,90,.12);}
`);

/* най-големите квадратни клетки в рамката; cols — допустими брой колони */
function best(W,H,n,gap,cols){let b=null;cols.forEach(c=>{const r=Math.ceil(n/c),s=Math.floor(Math.min((W-gap*(c-1))/c,(H-gap*(r-1))/r));if(!b||s>b.s)b={c,r,s};});return b;}

Capy.registerActivity('odd',{icon:'🔍',start(el,ctx){
  let dead=false;const timers=new Set(),ros=[];
  const later=(f,ms)=>{const t=setTimeout(()=>{timers.delete(t);if(!dead)f();},ms);timers.add(t);};
  const d=Math.max(1,Math.min(5,ctx.diff));
  const count=d<=2||d===5?3:4;
  const allowed=['a'].concat(d>=2?['b','c']:[],d>=3?['d']:[]);
  const root=U.el('div','odd-root');el.appendChild(root);
  function padLeft(){const sr=el.getBoundingClientRect(),cp=document.getElementById('capyPlay'),mr=cp?cp.getBoundingClientRect():null;
    root.style.paddingLeft=((innerWidth>innerHeight&&mr)?Math.max(0,Math.min(130,mr.right+4-(innerWidth-el.offsetWidth)/2)):0)+'px';}
  function observe(f){f();if(window.ResizeObserver){const ro=new ResizeObserver(f);ro.observe(root);ros.push(ro);}}
  function clearPuz(){ros.forEach(r=>r.disconnect());ros.length=0;root.innerHTML='';}

  /* общ помощник: решетка от бутони */
  function mkGrid(cells,cols,gapK,cls){
    const field=U.el('div','odd-field'),grid=U.el('div','odd-grid');field.appendChild(grid);
    const els=cells.map(c=>{const b=U.el('button','odd-cell'+(cls?' '+cls:''),c.h);if(c.ok)b.dataset.ok='1';grid.appendChild(b);return b;});
    const fit=()=>{padLeft();const W=field.clientWidth,H=field.clientHeight,gap=Math.max(8,Math.min(W,H)*gapK),r=best(W,H,cells.length,gap,cols);
      const s=Math.max(36,Math.min(r.s,190));grid.style.setProperty('--s',s+'px');grid.style.gap=gap+'px';grid.style.width=(r.c*s+(r.c-1)*gap)+'px';};
    return {field,grid,els,fit};
  }
  function solved(promiseRes,b){ctx.right(b);later(promiseRes,850);}

  const PUZ={
    a(){ // едно различно
      const dims=[[2,3],[3,3],[3,4],[4,4],[4,5]][d-1],n=dims[0]*dims[1];let pr;
      if(d===1)pr=U.sample(POOL1,2);else if(d===2)pr=U.pick(MED);else if(d===3)pr=U.pick(SIM);else if(d===4)pr=U.pick(SIM.concat(NEAR));else pr=U.pick(NEAR);
      pr=U.shuffle(pr);const base=pr[0],odd=pr[1],oi=U.rnd(0,n-1);
      const cells=Array.from({length:n},(_,i)=>({h:i===oi?odd:base,ok:i===oi}));
      return new Promise(res=>{const g=mkGrid(cells,[dims[0],dims[1]],.04);root.appendChild(g.field);observe(g.fit);let w=0,fin=false;
        g.els.forEach((b,i)=>b.onclick=()=>{if(fin)return;
          if(i===oi){fin=true;solved(res,b);}else{ctx.wrong(b);if(++w===2){const others=g.els.filter((x,j)=>j!==oi&&!x.classList.contains('dim'));U.sample(others,Math.floor(others.length/2)).forEach(x=>x.classList.add('dim'));}}});});
    },
    b(){ // намери всички
      const N=[0,0,4,6,7,8][d],tot=[0,0,16,20,24,30][d];
      const tw=d>=4;const tg=tw?U.pick(Object.keys(TWIN)):U.pick(FIND);
      const others=FIND.concat(['🍌','🍇','🐶','🐼','🌙','🍩']).filter(e=>e!==tg&&e!==TWIN[tg]);
      const pool=U.sample(others,d===2?3:5);if(tw)pool.push(TWIN[tg],TWIN[tg]);
      const cells=U.shuffle(Array.from({length:tot},(_,i)=>i<N?{h:tg,ok:true}:{h:U.pick(pool),ok:false}));
      const cols={16:[4,8],20:[4,5,10],24:[4,6,8],30:[5,6,10]}[tot];
      return new Promise(res=>{
        const head=U.el('div','odd-head','<span>НАМЕРИ ВСИЧКИ</span><span class="tg">'+tg+'</span><span class="ct">0/'+N+'</span>');root.appendChild(head);
        const g=mkGrid(cells,cols,.035);root.appendChild(g.field);observe(g.fit);let found=0,w=0;
        g.els.forEach((b,i)=>b.onclick=()=>{if(b.classList.contains('found'))return;
          if(cells[i].ok){found++;b.classList.add('found');b.classList.remove('hint');b.removeAttribute('data-ok');b.dataset.done='1';head.querySelector('.ct').textContent=found+'/'+N;Capy.sfx.pop();Capy.sparkle(b);
            if(found===N){ctx.right(b);later(res,850);}}
          else{ctx.wrong(b);if(++w===2){const t=g.els.find((x,j)=>cells[j].ok&&!x.classList.contains('found'));if(t)t.classList.add('hint');}}});});
    },
    c(){ // не е от групата
      const n=d===2?4:5,keys=Object.keys(CATS),ga=U.pick(keys),gb=U.pick(keys.filter(k=>k!==ga&&!(BAD[ga]||[]).includes(k)));
      const items=U.sample(CATS[ga],n-1),odd=U.pick(CATS[gb]),oi=U.rnd(0,n-1);
      const cells=items.slice();cells.splice(oi,0,odd);
      const cs=cells.map((h,i)=>({h,ok:i===oi}));
      return new Promise(res=>{const g=mkGrid(cs,n===4?[2,4]:[5,3],.05,'cat');root.appendChild(g.field);observe(g.fit);let w=0,fin=false;
        g.els.forEach((b,i)=>b.onclick=()=>{if(fin)return;
          if(i===oi){fin=true;solved(res,b);}else{ctx.wrong(b);if(++w===2){const t=U.pick(g.els.filter((x,j)=>j!==oi&&!x.classList.contains('dim')));if(t)t.classList.add('dim');}}});});
    },
    d(){ // намери разликата
      const [c,r]=[null,null,null,[3,3],[3,4],[4,4]][d],n=c*r;
      const base=Array.from({length:n},()=>U.pick(SPOT));
      const di=U.rnd(0,n-1),alt=U.pick(SPOT.filter(e=>e!==base[di]));
      const field=U.el('div','odd-field'),sd=U.el('div','odd-sd');field.appendChild(sd);root.appendChild(field);
      const mk=(second)=>{const g=U.el('div','odd-grid');const es=base.map((h,i)=>{const hh=second&&i===di?alt:h;const b=U.el('button','odd-cell',hh);if(i===di)b.dataset.ok='1';g.appendChild(b);return b;});sd.appendChild(g);return {g,es};};
      const A=mk(false),B=mk(true);
      const fit=()=>{padLeft();const W=field.clientWidth,H=field.clientHeight,gap=Math.max(6,Math.min(W,H)*.02),mid=Math.max(12,Math.min(W,H)*.05),pad=Math.max(6,Math.min(W,H)*.02);
        const sh=Math.min((W-mid-4*pad-gap*(c-1)*2)/2/c,(H-2*pad-gap*(r-1))/r),st=Math.min((W-2*pad-gap*(c-1))/c,(H-mid-4*pad-gap*(r-1)*2)/2/r);
        const side=sh>=st,s=Math.max(30,Math.min(Math.floor(side?sh:st),150));
        sd.classList.toggle('col',!side);sd.style.gap=mid+'px';
        [A,B].forEach(x=>{x.g.style.setProperty('--s',s+'px');x.g.style.setProperty('--g',pad);x.g.style.gap=gap+'px';x.g.style.width=(c*s+(c-1)*gap+2*pad)+'px';});};
      return new Promise(res=>{observe(fit);let w=0,fin=false;
        A.es.concat(B.es).forEach((b,k)=>{const i=k%n;b.onclick=()=>{if(fin)return;
          if(i===di){fin=true;A.es[di].classList.add('found');B.es[di].classList.add('found');solved(res,b);}
          else{ctx.wrong(b);if(++w===2)A.es[di].classList.add('hint');}};});});
    }
  };
  (async()=>{
    let last=null;
    for(let i=0;i<count&&!dead;i++){
      const pool=allowed.length>1?allowed.filter(t=>t!==last):allowed;const t=U.pick(pool);last=t;
      clearPuz();ctx.prompt('bg',T[t]);
      await PUZ[t]();
    }
    if(!dead){await U.wait(100);ctx.done();}
  })();
  return function cleanup(){dead=true;timers.forEach(clearTimeout);timers.clear();ros.forEach(r=>r.disconnect());};
}});
})();
