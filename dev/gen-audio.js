// Генерира говора за „Островът на Капи" с ElevenLabs.
//   ELEVENLABS_API_KEY=... node dev/gen-audio.js            генерира липсващите mp3 + manifest
//   node dev/gen-audio.js --dry                              само брои низовете/символите
//   node dev/gen-audio.js --list-voices                      показва гласовете в акаунта
//   node dev/gen-audio.js --prune                            трие mp3, които вече не се ползват
//   node dev/gen-audio.js --only=bg | --only=en  --limit=20  частично генериране (за проба на гласа)
// Настройки (env): ELEVEN_VOICE_BG, ELEVEN_VOICE_EN, ELEVEN_MODEL (по подразбиране eleven_multilingual_v2)
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..','ostrov'),AUD=path.join(ROOT,'audio');
const args=process.argv.slice(2),flag=n=>args.includes('--'+n),opt=n=>{const a=args.find(x=>x.startsWith('--'+n+'='));return a?a.split('=')[1]:null;};
const KEY=process.env.ELEVENLABS_API_KEY||process.env.XI_API_KEY||'';
const MODEL=process.env.ELEVEN_MODEL||'eleven_multilingual_v2'; // v2 се оказа най-точен за кратки български думи (v3 и turbo ги бъркат)
const VOICE={bg:process.env.ELEVEN_VOICE_BG||'M1ydWt7KnBCiuv4CnEDC',en:process.env.ELEVEN_VOICE_EN||'cgSgspJ2msm6clMCkdW9'}; // bg: Milena (книжовен изговор), en: Jessica

/* зареждаме скриптовете на играта в пясъчник, за да съберем всичко от Capy.speech() */
function collect(){
  const noop=()=>{},el=()=>({style:{setProperty:noop},classList:{add:noop,remove:noop},appendChild:noop,addEventListener:noop,setAttribute:noop,dataset:{}});
  const sb={console,setTimeout,clearTimeout,setInterval,clearInterval,Math,JSON,Promise,Date,
    location:{search:''},URLSearchParams,addEventListener:noop,innerWidth:1280,innerHeight:800,
    localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},
    Audio:function(){return {play:noop,pause:noop};},
    document:{addEventListener:noop,getElementById:el,createElement:el,querySelectorAll:()=>[],querySelector:el,head:el(),body:el()}};
  sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const files=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(f=>!/manifest/.test(f));
  for(const f of files){const p=path.join(ROOT,f);if(!fs.existsSync(p)){console.warn('липсва',f);continue;}
    try{vm.runInContext(fs.readFileSync(p,'utf8'),sb,{filename:f});}catch(e){console.error('ГРЕШКА в',f,e.message);process.exit(1);}}
  const out=[];for(const lang of ['bg','en'])for(const text of sb.Capy._speech[lang])out.push({lang,text,hash:sb.Capy.hash(lang,text)});
  return out;
}
async function tts(lang,text){
  const body={text,model_id:MODEL,voice_settings:{stability:.5,similarity_boost:.75,speed:.92}};
  if(/v3|v2_5/.test(MODEL))body.language_code=lang;
  for(let attempt=0;attempt<5;attempt++){
    let r;try{r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE[lang]}?output_format=mp3_44100_64`,
      {method:'POST',headers:{'xi-api-key':KEY,'content-type':'application/json'},body:JSON.stringify(body)});}
    catch(e){await new Promise(z=>setTimeout(z,3000*(attempt+1)));continue;}
    if(r.ok)return Buffer.from(await r.arrayBuffer());
    const msg=await r.text();
    if(r.status===429||r.status>=500){await new Promise(z=>setTimeout(z,1500*(attempt+1)));continue;}
    throw new Error(r.status+' '+msg.slice(0,300));
  }
  throw new Error('твърде много опити');
}
(async()=>{
  if(flag('list-voices')){
    const r=await fetch('https://api.elevenlabs.io/v1/voices',{headers:{'xi-api-key':KEY}});const j=await r.json();
    (j.voices||[]).forEach(v=>console.log(v.voice_id,'|',v.name,'|',Object.values(v.labels||{}).join(', ')));if(!j.voices)console.log(j);return;
  }
  let items=collect();
  const chars=items.reduce((a,i)=>a+i.text.length,0);
  console.log(`низове: ${items.length} (bg ${items.filter(i=>i.lang==='bg').length}, en ${items.filter(i=>i.lang==='en').length}), символи: ${chars}`);
  const file=i=>path.join(AUD,i.lang,i.hash+'.mp3');
  const dup=new Map();items.forEach(i=>{const k=i.lang+i.hash;if(dup.has(k)&&dup.get(k)!==i.text){console.error('ХЕШ КОЛИЗИЯ',i.text,dup.get(k));process.exit(1);}dup.set(k,i.text);});
  if(flag('prune')){for(const lang of ['bg','en']){const keep=new Set(items.filter(i=>i.lang===lang).map(i=>i.hash+'.mp3'));
    for(const f of fs.readdirSync(path.join(AUD,lang)))if(f.endsWith('.mp3')&&!keep.has(f)){fs.unlinkSync(path.join(AUD,lang,f));console.log('изтрит',lang,f);}}}
  let todo=items.filter(i=>!fs.existsSync(file(i)));
  if(opt('only'))todo=todo.filter(i=>i.lang===opt('only'));
  if(opt('limit'))todo=todo.slice(0,+opt('limit'));
  console.log(`за генериране: ${todo.length} (${todo.reduce((a,i)=>a+i.text.length,0)} символа)`);
  if(!flag('dry')&&todo.length){
    if(!KEY){console.error('Липсва ELEVENLABS_API_KEY');process.exit(1);}
    let n=0,fail=0;const q=todo.slice();
    await Promise.all([0,1].map(async()=>{for(let i;(i=q.shift());){
      try{fs.mkdirSync(path.dirname(file(i)),{recursive:true});fs.writeFileSync(file(i),await tts(i.lang,i.text));n++;if(n%25===0)console.log(n+'/'+todo.length);}
      catch(e){fail++;console.error('НЕУСПЕХ',i.lang,JSON.stringify(i.text),e.message);if(fail>8){console.error('твърде много грешки — спирам');process.exit(1);}}}}));
    console.log(`готови: ${n}, неуспешни: ${fail}`);
  }
  const have=items.filter(i=>fs.existsSync(file(i)));
  fs.writeFileSync(path.join(AUD,'manifest.js'),'Capy.AUDIO={'+have.map(i=>`"${i.hash}":1`).join(',')+'};\n');
  fs.writeFileSync(path.join(AUD,'index.json'),JSON.stringify(Object.fromEntries(items.map(i=>[i.lang+'/'+i.hash,i.text])),null,1));
  console.log(`manifest: ${have.length}/${items.length} налични`);
})();
