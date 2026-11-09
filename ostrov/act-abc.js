/* ===== Английска азбука: букви, картинки, цветове, числа, сглобяване на думи ===== */
'use strict';
(function(){
const U=Capy.util;
const L26='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* ---------- данни ---------- */
const LW={
 A:[['apple','🍎'],['ant','🐜'],['airplane','✈️']],
 B:[['ball','⚽'],['banana','🍌'],['bear','🐻']],
 C:[['cat','🐱'],['car','🚗'],['cake','🍰']],
 D:[['dog','🐶'],['duck','🦆'],['drum','🥁']],
 E:[['egg','🥚'],['elephant','🐘'],['ear','👂']],
 F:[['fish','🐟'],['frog','🐸'],['fork','🍴']],
 G:[['goat','🐐'],['grapes','🍇'],['guitar','🎸']],
 H:[['hat','🎩'],['horse','🐴'],['house','🏠']],
 I:[['ice cream','🍦'],['insect','🐛'],['iguana','🦎']],
 J:[['jeans','👖'],['jeep','🚙'],['jacket','🧥']],
 K:[['koala','🐨'],['key','🔑'],['kangaroo','🦘']],
 L:[['lion','🦁'],['lemon','🍋'],['lollipop','🍭']],
 M:[['monkey','🐵'],['moon','🌙'],['mouse','🐭']],
 N:[['nose','👃'],['nut','🥜'],['newspaper','📰']],
 O:[['octopus','🐙'],['orange','🍊'],['owl','🦉']],
 P:[['pig','🐷'],['pizza','🍕'],['penguin','🐧']],
 Q:[['queen','👸'],['question','❓'],['quiet','🤫']],
 R:[['rabbit','🐰'],['rainbow','🌈'],['robot','🤖']],
 S:[['sun','☀️'],['snake','🐍'],['star','⭐']],
 T:[['tree','🌳'],['tiger','🐯'],['train','🚂']],
 U:[['umbrella','☔'],['unicorn','🦄'],['UFO','🛸']],
 V:[['violin','🎻'],['volcano','🌋'],['van','🚐']],
 W:[['watch','⌚'],['whale','🐳'],['watermelon','🍉']],
 X:[['xylophone','🎹'],['Xmas tree','🎄'],['X-ray','🦴']],
 Y:[['yarn','🧶'],['yacht','⛵'],['yo-yo','🪀']],
 Z:[['zebra','🦓'],['zero','0️⃣'],['zipper','🤐']]
};
/* кратки думи за сглобяване (картинка + дума) */
const SPELL=[['ace','♠️'],['add','➕'],['ant','🐜'],['ape','🦍'],['arm','💪'],['bad','👎'],['bag','👜'],['bat','🦇'],['bed','🛏️'],
 ['bee','🐝'],['bin','🗑️'],['bow','🎀'],['box','📦'],['bug','🐛'],['bus','🚌'],['cab','🚕'],['can','🥫'],['cap','🧢'],['car','🚗'],
 ['cat','🐱'],['cow','🐮'],['cut','✂️'],['dad','👨'],['dog','🐶'],['dot','⚫'],['ear','👂'],['egg','🥚'],['elf','🧝'],['end','🔚'],
 ['eye','👁️'],['fox','🦊'],['gem','💎'],['ham','🍖'],['hat','🎩'],['hen','🐔'],['hot','🔥'],['hug','🤗'],['jet','✈️'],['key','🔑'],
 ['kid','🧒'],['leg','🦵'],['lip','👄'],['log','🪵'],['map','🗺️'],['nut','🥜'],['oil','🛢️'],['owl','🦉'],['pen','🖊️'],['pie','🥧'],
 ['pig','🐷'],['pin','📌'],['pot','🍲'],['rat','🐀'],['red','🔴'],['sad','😢'],['sea','🌊'],['spy','🕵️'],['sun','☀️'],['tea','🍵'],
 ['tie','👔'],['top','🔝'],['toy','🧸'],['tub','🛁'],['van','🚐'],['web','🕸️'],['win','🏆']];
const VEH=new Set(['car','cab','bus','van','jeep','airplane','jet','train']);
const BODY=new Set(['ear','eye','nose','arm','leg','lip']);
const grp=w=>VEH.has(w)?'veh':BODY.has(w)?'body':w;

const WORDS={};   // име -> {w,e,L,g,lw}
Object.keys(LW).forEach(L=>LW[L].forEach(([w,e])=>{WORDS[w]={w,e,L,g:grp(w),lw:true};}));
SPELL.forEach(([w,e])=>{if(!WORDS[w])WORDS[w]={w,e,L:w[0].toUpperCase(),g:grp(w),lw:false};});
const SPELLW=SPELL.map(x=>x[0]);

const COLORS=[['red','#E53935'],['blue','#1E88E5'],['green','#43A047'],['yellow','#FDD835'],['pink','#F78FB3'],
 ['orange','#FB8C00'],['purple','#8E44C9'],['black','#2B2B2B'],['white','#FFFFFF']];
const NUMW=['one','two','three','four','five','six','seven','eight','nine','ten'];

/* ---------- говор ---------- */
const BG={hear:'Коя буква чуваш?',pic:'Коя картинка започва с тази буква?',lower:'Намери малката буква.',color:'Кой цвят чуваш?',
 miss:'Коя буква липсва?',spell:'Сглоби думата.',word:'Коя картинка чуваш?',first:'С коя буква започва картинката?',num:'Кое число чуваш?'};
Capy.speech('bg',Object.values(BG));
const sent=(L,w)=>L+' is for '+w+'.';
Capy.speech('en',L26.map(l=>l+'.'));
Capy.speech('en',Object.keys(WORDS).map(w=>w+'.'));
Capy.speech('en',Object.keys(LW).reduce((a,L)=>a.concat(LW[L].map(x=>sent(L,x[0]))),[]));
Capy.speech('en',COLORS.map(c=>c[0]+'.'));
Capy.speech('en',NUMW.map(n=>n+'.'));

const hue=L=>Math.round((L26.indexOf(L)*137.5+12)%360);
const lcol=L=>'background:linear-gradient(160deg,hsl('+hue(L)+' 85% 62%),hsl('+hue(L)+' 75% 48%));color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.22);box-shadow:0 7px 0 hsl('+hue(L)+' 70% 36%),0 12px 22px rgba(20,60,90,.22);';

Capy.css(`
.abc-q{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:2cqh;
 --h:min(50cqw,32cqh);--o:min(44cqw,26cqh);--t:min(16cqw,12cqh);--sq:min(19cqw,13cqh);animation:abcin .35s ease-out;}
.abc-q.col{--o:min(28cqw,24cqh);}
@keyframes abcin{from{opacity:0;transform:scale(.94);}}
.abc-side{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5cqh;flex:0 1 auto;min-width:0;max-width:100%;}
.abc-opts{display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:2.6cqmin;max-width:100%;}
.abc-head{flex:none;width:var(--h);height:var(--h);font-size:calc(var(--h)*.62);font-weight:bold;line-height:1;padding:0;border-radius:28px;}
.abc-head.pic{font-size:calc(var(--h)*.6);}
.abc-head.spk{background:linear-gradient(160deg,#FFB3D6,var(--pink));box-shadow:0 7px 0 var(--pink-d),0 12px 22px rgba(20,60,90,.22);font-size:calc(var(--h)*.5);animation:abcpulse 2.2s ease-in-out infinite;}
.abc-head:active{transform:translateY(4px) scale(.97);}
@keyframes abcpulse{50%{transform:scale(1.05);}}
.abc-opt{width:var(--o);height:var(--o);font-size:calc(var(--o)*.58);font-weight:bold;line-height:1;padding:0;border-radius:26px;
 animation:abcpop .5s cubic-bezier(.3,1.6,.5,1) backwards;}
.abc-opt:nth-child(2){animation-delay:.07s;} .abc-opt:nth-child(3){animation-delay:.14s;} .abc-opt:nth-child(4){animation-delay:.21s;}
@keyframes abcpop{from{transform:scale(.3) rotate(-12deg);opacity:0;}}
.abc-opt:active{transform:translateY(4px) scale(.96);}
.abc-opt.low{background:#fff;color:var(--ink);}
.abc-opt.big2{--o:min(44cqw,28cqh);}
.abc-opt.ok,.abc-head.ok{box-shadow:0 0 0 6px var(--green),var(--shadow);}
.abc-blob{width:76%;height:76%;border-radius:50%;box-shadow:inset 0 -8px 0 rgba(0,0,0,.14),inset 0 8px 0 rgba(255,255,255,.28);}
.abc-blob.w{border:3px solid #cfd6e0;}
.abc-num{flex-direction:column;gap:4%;}
.abc-num b{font-size:calc(var(--o)*.4);line-height:1;color:var(--purple-d);}
.abc-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:calc(var(--o)*.04);width:72%;}
.abc-dots i{width:calc(var(--o)*.13);aspect-ratio:1;border-radius:50%;background:var(--coral);}
.abc-seq{display:flex;gap:2cqmin;justify-content:center;flex:none;}
.abc-sq{width:var(--sq);height:var(--sq);font-size:calc(var(--sq)*.64);font-weight:bold;border-radius:20px;padding:0;line-height:1;}
.abc-sq.hole{background:rgba(255,255,255,.55);border:4px dashed var(--purple);box-shadow:none;color:var(--purple);}
.abc-slot{width:var(--t);height:calc(var(--t)*1.12);font-size:calc(var(--t)*.64);font-weight:bold;border-radius:18px;padding:0;line-height:1;
 background:rgba(255,255,255,.55);border:4px dashed var(--purple);box-shadow:none;}
.abc-slot.fill{border:0;animation:abcpop .4s cubic-bezier(.3,1.6,.5,1);}
.abc-tile{width:var(--t);height:calc(var(--t)*1.12);font-size:calc(var(--t)*.64);font-weight:bold;border-radius:18px;padding:0;line-height:1;}
.abc-tile.used{opacity:.18;pointer-events:none;box-shadow:none;}
.abc-row{display:flex;gap:2cqmin;justify-content:center;flex-wrap:wrap;}
@container (min-aspect-ratio:6/5){
 .abc-q{flex-direction:row;justify-content:space-evenly;gap:4cqw;--h:min(34cqw,66cqh);--o:min(17cqw,42cqh);--t:min(10.5cqw,27cqh);--sq:min(10cqw,26cqh);}
 .abc-side{max-width:calc(100cqw - var(--h) - 6cqw);}
 .abc-q.col{flex-direction:column;--o:min(16cqw,34cqh);--sq:min(10cqw,28cqh);}
 .abc-q.col .abc-side{max-width:100%;}
 .abc-opt.big2{--o:min(22cqw,56cqh);}
}
`);

/* ---------- помощници ---------- */
const uniq=a=>Array.from(new Set(a));
function pickPics(correct,pool,n){ // n различни картинки (различни емоджита и групи), първата е верната
  const out=[correct];const ge=new Set([correct.e]),gg=new Set([correct.g]);
  for(const w of U.shuffle(pool)){if(out.length>=n)break;if(w.w===correct.w||ge.has(w.e)||gg.has(w.g))continue;out.push(w);ge.add(w.e);gg.add(w.g);}
  return out.length===n?out:null;
}
function pickLetters(correct,known,n){
  const o=U.sample(known.filter(l=>l!==correct),n-1);return o.length===n-1?o.concat(correct):null;
}

Capy.registerActivity('abc',{icon:'🔤',start(el,ctx){
  const diff=ctx.diff;
  const known=uniq(ctx.enLetters.filter(l=>/^[A-Z]$/.test(l))).sort();
  const ks=new Set(known);
  const lwPool=[];known.forEach(L=>LW[L].forEach(([w])=>lwPool.push(WORDS[w])));
  const spellOK=SPELLW.filter(w=>w.toUpperCase().split('').every(c=>ks.has(c))).map(w=>WORDS[w]);
  const runs=[];{let cur=[];known.forEach(l=>{if(cur.length&&l.charCodeAt(0)===cur[cur.length-1].charCodeAt(0)+1)cur.push(l);else{if(cur.length>=3)runs.push(cur);cur=[l];}});if(cur.length>=3)runs.push(cur);}
  let dead=false,used=new Set(),busyQ=false;const timers=[];
  const wait=ms=>new Promise(r=>{const t=setTimeout(r,ms);timers.push(t);});
  const sayAll=async list=>{for(const [l,t] of list){if(dead)return;await ctx.say(l,t);}};

  /* ----- генератори на въпроси: връщат обект или null ----- */
  const mk={};
  const sentFor=w=>w.lw?[['en',sent(w.L,w.w)]]:[['en',w.w+'.']];
  mk.hearLetter=()=>{
    const cand=known.filter(l=>!used.has('hl:'+l));if(!cand.length)return null;const L=U.pick(cand);
    const lower=diff>=4&&Math.random()<.45;const ls=pickLetters(L,known,3);
    return{key:'hl:'+L,kind:'choice',cls:'',bg:BG.hear,target:['en',L+'.'],head:{spk:true},
      opts:U.shuffle(ls).map(l=>({html:lower?l.toLowerCase():l,style:lcol(l),L:l,ok:l===L})),after:[['en',sent(L,U.pick(LW[L])[0])]]};};
  mk.letterPic=()=>{
    const cand=known.filter(l=>!used.has('lp:'+l));if(!cand.length)return null;const L=U.pick(cand);
    const cw=WORDS[U.pick(LW[L])[0]];
    const others=lwPool.filter(w=>w.L!==L);let pics=null;
    for(let k=0;k<12&&!pics;k++){const pool=[];known.filter(l=>l!==L).forEach(l=>pool.push(WORDS[U.pick(LW[l])[0]]));pics=pickPics(cw,pool,3);}
    if(!pics)return null;
    return{key:'lp:'+L,kind:'choice',bg:BG.pic,target:['en',L+'.'],head:{html:L,style:lcol(L),L,tap:['en',L+'.']},
      opts:U.shuffle(pics).map(w=>({html:w.e,W:w.w,ok:w===cw})),after:[['en',sent(L,cw.w)]]};};
  mk.matchCase=()=>{
    const cand=known.filter(l=>!used.has('mc:'+l));if(!cand.length)return null;const L=U.pick(cand);const ls=pickLetters(L,known,3);
    return{key:'mc:'+L,kind:'choice',bg:BG.lower,target:['en',L+'.'],head:{html:L,style:lcol(L),L,tap:['en',L+'.']},
      opts:U.shuffle(ls).map(l=>({html:l.toLowerCase(),cls:'low',L:l,ok:l===L})),after:[['en',L+'.']]};};
  mk.colour=()=>{
    const list=diff>=4?COLORS:COLORS.slice(0,5);const cand=list.filter(c=>!used.has('co:'+c[0]));if(!cand.length)return null;
    const c=U.pick(cand);const o=U.sample(list.filter(x=>x!==c),(diff>=4?4:3)-1).concat([c]);
    return{key:'co:'+c[0],kind:'choice',bg:BG.color,target:['en',c[0]+'.'],head:{spk:true},
      opts:U.shuffle(o).map(x=>({blob:x[1],cls:x[0]==='white'?'w':'',ok:x===c})),after:[['en',c[0]+'.']]};};
  mk.hearWord=()=>{
    const cand=lwPool.filter(w=>!used.has('hw:'+w.w));if(!cand.length)return null;const w=U.pick(cand);
    const pics=pickPics(w,lwPool,3);if(!pics)return null;
    return{key:'hw:'+w.w,kind:'choice',bg:BG.word,target:['en',w.w+'.'],head:{spk:true},
      opts:U.shuffle(pics).map(x=>({html:x.e,W:x.w,ok:x===w})),after:sentFor(w)};};
  mk.picLetter=()=>{
    const cand=lwPool.filter(w=>!used.has('pl:'+w.w));if(!cand.length)return null;const w=U.pick(cand);const ls=pickLetters(w.L,known,3);
    return{key:'pl:'+w.w,kind:'choice',bg:BG.first,target:['en',w.w+'.'],head:{html:w.e,pic:true,tap:['en',w.w+'.']},
      opts:U.shuffle(ls).map(l=>({html:l,style:lcol(l),L:l,ok:l===w.L})),after:[['en',sent(w.L,w.w)]]};};
  mk.number=()=>{
    const max=diff>=4?10:5;const cand=[];for(let i=1;i<=max;i++)if(!used.has('nu:'+i))cand.push(i);if(!cand.length)return null;
    const n=U.pick(cand);const all=[];for(let i=1;i<=max;i++)if(i!==n)all.push(i);const o=U.sample(all,2).concat(n);
    return{key:'nu:'+n,kind:'choice',bg:BG.num,target:['en',NUMW[n-1]+'.'],head:{spk:true},
      opts:U.shuffle(o).map(x=>({num:x,ok:x===n})),after:[['en',NUMW[n-1]+'.']]};};
  mk.order=()=>{
    if(!runs.length)return null;
    for(let k=0;k<8;k++){
      const run=U.pick(runs);const len=Math.min(run.length,U.pick([3,4]));const s=U.rnd(0,run.length-len);const win=run.slice(s,s+len);
      const mi=U.rnd(0,len-1);const key='or:'+win.join('')+mi;if(used.has(key))continue;const L=win[mi];const ls=pickLetters(L,known,3);
      return{key,kind:'choice',col:true,bg:BG.miss,target:null,seq:win,hole:mi,
        opts:U.shuffle(ls).map(l=>({html:l,style:lcol(l),L:l,ok:l===L})),after:win.map(l=>['en',l+'.'])};}
    return null;};
  mk.similar=()=>{
    const pairs=[];
    known.forEach(L=>{const a=LW[L];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j)pairs.push([WORDS[a[i][0]],WORDS[a[j][0]]]);});
    spellOK.forEach(a=>spellOK.forEach(b=>{if(a!==b&&a.w.length===b.w.length&&a.e!==b.e&&a.g!==b.g){let d=0;for(let i=0;i<a.w.length;i++)if(a.w[i]!==b.w[i])d++;if(d===1)pairs.push([a,b]);}}));
    const cand=pairs.filter(p=>!used.has('hs:'+p[0].w)&&p[0].e!==p[1].e&&p[0].g!==p[1].g);if(!cand.length)return null;
    const [a,b]=U.pick(cand);
    return{key:'hs:'+a.w,kind:'choice',bg:BG.word,target:['en',a.w+'.'],head:{spk:true},big:true,
      opts:U.shuffle([a,b]).map(x=>({html:x.e,W:x.w,ok:x===a})),after:sentFor(a)};};
  mk.spell=()=>{
    const cand=spellOK.filter(w=>!used.has('sp:'+w.w));if(!cand.length)return null;const w=U.pick(cand);
    return{key:'sp:'+w.w,kind:'spell',w};};

  const TYPES=[['hearLetter',1],['letterPic',1],['matchCase',2],['colour',2],['hearWord',3],['picLetter',3],['number',3],['order',4],['similar',5],['spell',5]];
  const enabled=TYPES.filter(t=>diff>=t[1]).map(t=>t[0]);
  const typeCount={};let lastType=null;
  function nextQuestion(){
    for(let pass=0;pass<2;pass++){
      const order=U.shuffle(enabled).sort((a,b)=>(typeCount[a]||0)-(typeCount[b]||0)||(a===lastType?1:0)-(b===lastType?1:0));
      for(const t of order){const q=mk[t]();if(q){q.type=t;typeCount[t]=(typeCount[t]||0)+1;lastType=t;used.add(q.key);return q;}}
      used=new Set();
    }
    return null;
  }

  /* ----- показване ----- */
  const letterEl=(L,html,cls,tag)=>{const b=U.el(tag||'button',cls,html);b.dataset.l=L;b.setAttribute('style',lcol(L));return b;};

  function runChoice(q,box){return new Promise(resolve=>{
    busyQ=false;let wrongs=0,answered=false;
    const root=U.el('div','abc-q'+(q.col?' col':''));box.appendChild(root);
    const speak=()=>q.target?ctx.say(q.target[0],q.target[1]):null;
    if(q.seq){const sq=U.el('div','abc-seq');q.seq.forEach((l,i)=>{if(i===q.hole){const h=U.el('div','card abc-sq hole','?');h.id='abcHole';sq.appendChild(h);}else{const c=letterEl(l,l,'card abc-sq','div');sq.appendChild(c);}});root.appendChild(sq);}
    else{
      const h=q.head;const b=U.el('button','card abc-head'+(h.spk?' spk':'')+(h.pic?' pic':''),h.spk?'🔊':h.html);
      if(h.L){b.dataset.l=h.L;b.setAttribute('style',lcol(h.L));}
      const rep=h.tap||q.target;if(rep)b.onclick=()=>{ctx.say(rep[0],rep[1]);};
      root.appendChild(b);
    }
    const side=U.el('div','abc-side');root.appendChild(side);const opts=U.el('div','abc-opts');side.appendChild(opts);
    q.opts.forEach(o=>{
      let b;
      if(o.blob){b=U.el('button','card abc-opt','<span class="abc-blob '+(o.cls||'')+'" style="background:'+o.blob+'"></span>');}
      else if(o.num){b=U.el('button','card abc-opt abc-num','<b>'+o.num+'</b><span class="abc-dots">'+'<i></i>'.repeat(o.num)+'</span>');}
      else b=U.el('button','card abc-opt'+(o.cls?' '+o.cls:'')+(q.big?' big2':''),o.html);
      if(o.L){b.dataset.l=o.L;if(o.style)b.setAttribute('style',o.style);}
      if(o.W)b.dataset.w=o.W;
      if(o.ok)b.dataset.ok='1';
      b.onclick=async()=>{
        if(busyQ||dead)return;
        if(!o.ok){ctx.wrong(b);wrongs++;if(wrongs>=2){const w=[...opts.children].find(x=>!x.dataset.ok&&!x.classList.contains('dim'));if(w)w.classList.add('dim');}return;}
        busyQ=true;answered=true;ctx.right(b);
        const hole=document.getElementById('abcHole');if(hole){hole.className='card abc-sq';hole.textContent=o.html;hole.setAttribute('style',o.style||'');hole.dataset.l=o.L;}
        await sayAll(q.after);await wait(450);resolve();
      };
      opts.appendChild(b);
    });
    (async()=>{await ctx.prompt('bg',q.bg);if(dead||answered)return;if(q.target)await ctx.say(q.target[0],q.target[1]);})();
  });}

  function runSpell(q,box){return new Promise(resolve=>{
    busyQ=false;let pos=0,wrongs=0;const w=q.w,letters=w.w.toUpperCase().split('');
    const root=U.el('div','abc-q');box.appendChild(root);
    const head=U.el('button','card abc-head pic',w.e);head.onclick=()=>ctx.say('en',w.w+'.');root.appendChild(head);
    const side=U.el('div','abc-side');root.appendChild(side);
    const slotsRow=U.el('div','abc-row');side.appendChild(slotsRow);
    const slots=letters.map(()=>{const s=U.el('div','card abc-slot');slotsRow.appendChild(s);return s;});
    const extra=U.sample(known.filter(l=>!letters.includes(l)),Math.min(2,known.length-uniq(letters).length));
    let tl;do{tl=U.shuffle(letters.concat(extra));}while(tl.join('')===letters.join('')&&tl.length>1);
    const tilesRow=U.el('div','abc-row');side.appendChild(tilesRow);
    const tiles=tl.map(l=>{const t=letterEl(l,l,'card abc-tile');tilesRow.appendChild(t);return t;});
    const mark=()=>{tiles.forEach(t=>delete t.dataset.ok);if(pos<letters.length){const t=tiles.find(x=>!x.classList.contains('used')&&x.dataset.l===letters[pos]);if(t)t.dataset.ok='1';}};
    mark();
    tiles.forEach(t=>t.onclick=async()=>{
      if(busyQ||dead||t.classList.contains('used'))return;
      if(t.dataset.l!==letters[pos]){ctx.wrong(t);wrongs++;
        if(wrongs>=2){const rest=letters.slice(pos);const d=tiles.find(x=>!x.classList.contains('used')&&!x.classList.contains('dim')&&!rest.includes(x.dataset.l));if(d)d.classList.add('dim');}return;}
      t.classList.add('used');const s=slots[pos];s.className='card abc-slot fill';s.textContent=t.dataset.l;s.dataset.l=t.dataset.l;s.setAttribute('style',lcol(t.dataset.l));
      pos++;ctx.sparkle(s);mark();
      if(pos===letters.length){busyQ=true;ctx.right(slotsRow);await ctx.say('en',w.w+'.');await wait(500);resolve();}
    });
    (async()=>{await ctx.prompt('bg',BG.spell);if(dead||pos>0)return;await ctx.say('en',w.w+'.');})();
  });}

  (async()=>{
    const n=U.rnd(4,5);
    for(let i=0;i<n&&!dead;i++){
      const q=nextQuestion();if(!q)break;
      el.innerHTML='';
      if(q.kind==='spell')await runSpell(q,el);else await runChoice(q,el);
    }
    if(!dead){await wait(150);if(!dead)ctx.done();}
  })();

  return function cleanup(){dead=true;timers.forEach(clearTimeout);};
}});
})();
