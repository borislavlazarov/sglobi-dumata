// Проверка на генерирания говор чрез разпознаване на реч (ElevenLabs Scribe): node dev/check-audio.js [bg|en] [брой|all] [regex]
const fs=require('fs'),path=require('path');const AUD=path.resolve(__dirname,'..','ostrov','audio');
const idx=JSON.parse(fs.readFileSync(path.join(AUD,'index.json')));const [lang='bg',n='40',re='']=process.argv.slice(2).filter(a=>a!=='--fix');
const norm=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
(async()=>{
  let items=Object.entries(idx).filter(([k,t])=>k.startsWith(lang+'/')&&(!re||new RegExp(re).test(t)));
  if(n!=='all')items=items.sort(()=>Math.random()-.5).slice(0,+n);
  let bad=0;const q=items.slice();
  await Promise.all([0,1].map(async()=>{for(let it;(it=q.shift());){const [k,t]=it;
    const fd=new FormData();fd.append('model_id','scribe_v1');fd.append('language_code',lang);fd.append('file',new Blob([fs.readFileSync(path.join(AUD,k+'.mp3'))]),'a.mp3');
    let j=null;for(let a=0;a<5&&!j;a++){try{const r=await fetch('https://api.elevenlabs.io/v1/speech-to-text',{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY},body:fd});
      if(r.status===429||r.status>=500)throw new Error('retry');j=await r.json();}catch(e){await new Promise(z=>setTimeout(z,2500*(a+1)));}}
    if(!j){console.log('? пропуснат (мрежа)',k);continue;}const got=j.text||JSON.stringify(j).slice(0,120);
    if(norm(got)!==norm(t)){bad++;if(process.argv.includes('--fix'))fs.unlinkSync(path.join(AUD,k+'.mp3'));console.log('≠',k,JSON.stringify(t),'→',JSON.stringify(got));}}}));
  console.log(`${lang}: проверени ${items.length}, разлики ${bad}`);
})();
