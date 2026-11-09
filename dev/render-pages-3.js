// Renders ostrov/pages-3.js colouring pages (plain + random-pastel painted) to dev/shots/page-<id>.png and validates them.
'use strict';
const fs=require('fs'),path=require('path');
const puppeteer=require('puppeteer-core');
const file=path.resolve(__dirname,'..','ostrov',process.argv[2]||'pages-3.js');
let pages=[];global.Capy={registerPages(l){pages=pages.concat(l);}};
require(file);
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',args:['--no-sandbox']});
  const p=await b.newPage();await p.setViewport({width:1620,height:600});
  let bad=0;
  for(const pg of pages){
    await p.setContent(`<body style="margin:0;background:#fff;display:flex;gap:20px"><div id="a" style="width:800px">${pg.svg}</div><div id="b" style="width:800px">${pg.svg}</div></body>`);
    const res=await p.evaluate((svg)=>{
      const out={errs:[]};
      const d=new DOMParser().parseFromString(svg,'image/svg+xml');
      if(d.querySelector('parsererror'))out.errs.push('XML: '+d.querySelector('parsererror').textContent.slice(0,200));
      const root=document.querySelector('#a svg');
      if(root.getAttribute('viewBox')!=='0 0 800 600'||root.hasAttribute('width')||root.hasAttribute('height'))out.errs.push('root attrs');
      if(root.children.length!==1||root.children[0].tagName!=='g')out.errs.push('wrapper g');
      if(root.querySelector('style,script,use,text,linearGradient,radialGradient,filter,[id]'))out.errs.push('forbidden element/attr');
      const first=root.children[0].children[0];
      if(!(first&&first.getAttribute('data-r')==='bg'))out.errs.push('bg first');
      const rs=[...root.querySelectorAll('.r')];out.count=rs.length;
      const seen={};
      for(const e of root.querySelectorAll('g *')){const c=e.getAttribute('class');if(e.tagName!=='g'&&c!=='r'&&c!=='ln')out.errs.push('no class: '+e.outerHTML.slice(0,60));}
      for(const e of rs){
        const n=e.getAttribute('data-r');if(!n)out.errs.push('no data-r');if(seen[n])out.errs.push('dup '+n);seen[n]=1;
        if(e.hasAttribute('fill'))out.errs.push('fill on '+n);
        const r=e.getBoundingClientRect();
        if(r.width<45||r.height<45)out.errs.push(`small ${n} ${r.width.toFixed(0)}x${r.height.toFixed(0)}`);
        if(e.tagName==='path'&&!/z\s*$/i.test(e.getAttribute('d')))out.errs.push('not closed '+n);
      }
      // visibility: sample points inside bbox, count hits where this element is topmost
      out.vis=[];
      for(const e of rs){const r=e.getBoundingClientRect();let hit=0;const N=24;
        for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x=r.left+(i+.5)*r.width/N,y=r.top+(j+.5)*r.height/N;
          if(x<0||y<0||x>=800||y>=600)continue;if(document.elementFromPoint(x,y)===e)hit++;}
        const area=hit*(r.width/N)*(r.height/N);out.vis.push([e.getAttribute('data-r'),Math.round(area)]);}
      // paint copy b
      let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
      for(const e of document.querySelectorAll('#b svg .r')){e.setAttribute('fill',`hsl(${Math.floor(rnd()*360)} ${60+rnd()*30}% ${68+rnd()*14}%)`);}
      return out;
    },pg.svg);
    const low=res.vis.filter(v=>v[1]<1500).map(v=>v.join(':'));
    console.log(`${pg.id} "${pg.title}": ${res.count} regions`+(res.errs.length?'\n  ERR '+res.errs.join('\n  ERR '):'')+(low.length?'\n  low visible area (<1500u²): '+low.join(' '):''));
    if(res.errs.length)bad++;
    await p.screenshot({path:path.join(__dirname,'shots',`page-${pg.id}.png`)});
  }
  await b.close();process.exit(bad?1:0);
})();
