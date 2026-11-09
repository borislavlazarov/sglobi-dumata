// Renders ostrov/pages-2.js pages to dev/shots/page-<id>.png (+ painted variant) and validates them.
'use strict';
const fs=require('fs'),path=require('path');
const puppeteer=require('puppeteer-core');
let pages=[];
global.Capy={registerPages(l){pages=pages.concat(l);}};
require(path.join(__dirname,'..','ostrov','pages-2.js'));
const only=process.argv[2];
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',args:['--no-sandbox']});
  const p=await b.newPage();
  await p.setViewport({width:800,height:600});
  for(const pg of pages){
    if(only&&pg.id!==only)continue;
    const s=pg.svg, bad=[];
    if(/<style|\sid=|<use|<text|<script|Gradient|<filter/.test(s))bad.push('forbidden construct');
    if(!/^<svg viewBox="0 0 800 600" xmlns="http:\/\/www.w3.org\/2000\/svg">\s*<g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">\s*<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"\/>/.test(s))bad.push('header mismatch');
    await p.setContent('<body style="margin:0;background:#fff"><div id="h" style="width:800px;line-height:0">'+s+'</div></body>');
    const info=await p.evaluate((src)=>{
      const d=new DOMParser().parseFromString(src,'image/svg+xml');
      const err=d.querySelector('parsererror');
      const out={xml:err?err.textContent.slice(0,200):'ok',regs:[],dups:[],other:[]};
      const svg=document.querySelector('svg');svg.style.width='800px';
      const seen={};
      document.querySelectorAll('.ln').forEach(e=>e.style.pointerEvents='none');
      svg.querySelectorAll('*').forEach(e=>{const t=e.tagName;if(t==='g'||t==='svg')return;
        if(!e.classList.contains('r')&&!e.classList.contains('ln'))out.other.push(e.outerHTML.slice(0,60));
        if(e.classList.contains('r')&&!e.getAttribute('data-r'))out.other.push('no data-r');
        if(e.classList.contains('r')&&e.getAttribute('fill'))out.other.push('fill on r');});
      const vis={};
      for(let y=2;y<600;y+=4)for(let x=2;x<800;x+=4){const e=document.elementFromPoint(x,y);const n=e&&e.getAttribute&&e.getAttribute('data-r');if(!n)continue;
        const v=vis[n]||(vis[n]={n:0,x0:1e9,x1:-1,y0:1e9,y1:-1});v.n++;v.x0=Math.min(v.x0,x);v.x1=Math.max(v.x1,x);v.y0=Math.min(v.y0,y);v.y1=Math.max(v.y1,y);}
      document.querySelectorAll('.r').forEach(e=>{const n=e.getAttribute('data-r');if(seen[n])out.dups.push(n);seen[n]=1;
        const r=e.getBoundingClientRect(),v=vis[n];
        out.regs.push({n,w:Math.round(r.width),h:Math.round(r.height),area:v?v.n*16:0,vw:v?v.x1-v.x0+4:0,vh:v?v.y1-v.y0+4:0});});
      return out;
    },s);
    console.log('== '+pg.id+' «'+pg.title+'» regions='+info.regs.length+' xml='+info.xml+(bad.length?' BAD:'+bad:'')+(info.dups.length?' DUPS:'+info.dups:'')+(info.other.length?' OTHER:'+info.other.join('|'):''));
    for(const r of info.regs){const flag=(r.w<45||r.h<45?' SMALLBBOX':'')+(r.area<1500?' LOWVIS':'')+(r.vw<40||r.vh<40?' THINVIS':'');
      if(flag||process.env.ALL)console.log('   '+r.n+' bbox '+r.w+'x'+r.h+' visArea '+r.area+' vis '+r.vw+'x'+r.vh+flag);}
    await p.screenshot({path:path.join(__dirname,'shots','page-'+pg.id+'.png')});
    await p.evaluate(()=>{let i=0;document.querySelectorAll('.r').forEach(e=>{e.style.fill='hsl('+((i++*67)%360)+' 75% 78%)';});});
    await p.screenshot({path:path.join(__dirname,'shots','page-'+pg.id+'-painted.png')});
  }
  await b.close();
})();
