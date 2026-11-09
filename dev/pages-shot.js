// Рендер и проверка на страниците за оцветяване: node pages-shot.js ../ostrov/pages-1.js [id...]
const puppeteer=require('puppeteer-core');const path=require('path');const fs=require('fs');
(async()=>{
  const [file='../ostrov/pages-1.js',...only]=process.argv.slice(2);
  let pages=[];global.Capy={registerPages(l){pages=pages.concat(l);}};
  require(path.resolve(file));
  const b=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',headless:'new',args:['--no-sandbox','--disable-gpu','--hide-scrollbars']});
  const p=await b.newPage();await p.setViewport({width:800,height:600,deviceScaleFactor:1});
  for(const pg of pages){
    if(only.length&&!only.includes(pg.id))continue;
    const problems=[];
    if(/<style|\sid=|<use|<text|<script|Gradient|<filter/.test(pg.svg))problems.push('forbidden construct');
    if(!/^<svg viewBox="0 0 800 600" xmlns="http:\/\/www.w3.org\/2000\/svg">/.test(pg.svg))problems.push('bad root');
    await p.setContent(`<body style="margin:0;background:#fff">${pg.svg}<style>svg{width:800px;display:block}.ln{pointer-events:none}</style></body>`);
    const info=await p.evaluate((src)=>{
      const d=new DOMParser().parseFromString(src,'image/svg+xml');const err=d.querySelector('parsererror');
      const svg=document.querySelector('svg');const out={xml:err?err.textContent.slice(0,200):'ok',regions:[],dup:[],small:[],first:''};
      const seen={};const g=svg.firstElementChild;out.first=g.firstElementChild.getAttribute('data-r');out.gkids=svg.children.length;
      svg.querySelectorAll('.r').forEach(e=>{const n=e.getAttribute('data-r');if(seen[n])out.dup.push(n);seen[n]=1;
        const r=e.getBoundingClientRect();out.regions.push(n);if(r.width<45||r.height<45)out.small.push(n+' '+r.width.toFixed(0)+'x'+r.height.toFixed(0));
        // видима ли е областта? проба в решетка от точки
        });
      // видимост: за всяка област брой точки от решетка 8px, където тя е най-горният .r
      const vis={};for(let y=4;y<600;y+=8)for(let x=4;x<800;x+=8){let e=document.elementFromPoint(x,y);if(e&&e.classList.contains('r')){const n=e.getAttribute('data-r');vis[n]=(vis[n]||0)+1;}}
      out.lowvis=out.regions.filter(n=>(vis[n]||0)*64<1500).map(n=>n+' '+((vis[n]||0)*64));
      return out;},pg.svg);
    await p.screenshot({path:path.join(__dirname,'shots','page-'+pg.id+'.png')});
    await p.evaluate(()=>{let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
      document.querySelectorAll('.r').forEach(e=>{e.setAttribute('fill',`hsl(${Math.floor(rnd()*360)} ${55+Math.floor(rnd()*30)}% ${70+Math.floor(rnd()*15)}%)`);});
      document.querySelectorAll('.ln').forEach(e=>e.style.pointerEvents='none');});
    await p.screenshot({path:path.join(__dirname,'shots','page-'+pg.id+'-painted.png')});
    console.log(pg.id,'|',pg.title,'| regions',info.regions.length,'| xml',info.xml,'| first',info.first,'| dup',info.dup.join(',')||'-','| small',info.small.join(', ')||'-','| lowvis(<1500u²)',info.lowvis.join(', ')||'-',problems.length?'| PROBLEMS '+problems.join(';'):'');
  }
  await b.close();
})();
