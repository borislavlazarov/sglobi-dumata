#!/usr/bin/env node
/* Хомоглифна проверка на index.html:
   1) Извлича всички "кирилски-наглед" токени (последователности от букви,
      съдържащи поне една кирилска буква) от целия файл.
   2) За всеки токен проверява ПО КОДОВИ ТОЧКИ, че сред кирилицата няма
      латински A,E,O,P,C,X,H,M,T,B,K (и малките им варианти) или други
      некирилски букви.
   3) Допълнително: проверява вградения LEVELS списък — всяка дума да е
      само от главни кирилски букви U+0410..U+042F, и ALPHABET-а. */
const fs = require("fs");
const path = "/home/blazarov/projects/emma/index.html";
const src = fs.readFileSync(path, "utf8");

const LATIN_HOMOGLYPHS = new Set([..."AEOPCXHMTBKaeopcxhmtbk"]);
const isCyr = cp => (cp >= 0x0400 && cp <= 0x04FF) || (cp >= 0x0500 && cp <= 0x052F);
const isLetter = ch => /\p{L}/u.test(ch);

let problems = 0;

/* --- 1+2: токени със смесени писмености --- */
const lines = src.split("\n");
lines.forEach((line, ln) => {
  let tok = "";
  const flush = () => {
    if (!tok) return;
    const chars = [...tok];
    const hasCyr = chars.some(c => isCyr(c.codePointAt(0)));
    if (hasCyr) {
      const bad = chars.filter(c => !isCyr(c.codePointAt(0)));
      if (bad.length) {
        problems++;
        console.log(`ред ${ln + 1}: СМЕСЕН ТОКЕН "${tok}" — некирилски знаци: ` +
          bad.map(c => `${JSON.stringify(c)}=U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}` +
            (LATIN_HOMOGLYPHS.has(c) ? " (ЛАТИНСКИ ХОМОГЛИФ!)" : "")).join(", "));
      }
    }
    tok = "";
  };
  for (const ch of line) { if (isLetter(ch)) tok += ch; else flush(); }
  flush();
});

/* --- 3: вградените данни --- */
const m = src.match(/const LEVELS = (\[[\s\S]*?\]);\nconst ALPHABET/);
if (!m) { console.log("НЕ НАМЕРИХ вградения LEVELS!"); process.exit(2); }
const LEVELS = eval(m[1]);
const words = LEVELS.flatMap(L => L.words.map(w => ({ level: L.level, word: w.word })));
console.log(`\nПроверка на ${words.length} вградени думи (${LEVELS.length} нива):`);
for (const { level, word } of words) {
  for (const ch of word) {
    const cp = ch.codePointAt(0);
    if (!(cp >= 0x0410 && cp <= 0x042F)) {  // главни кирилски А..Я
      problems++;
      console.log(`  L${level} "${word}": знак ${JSON.stringify(ch)}=U+${cp.toString(16).toUpperCase()} НЕ е главна кирилска буква` +
        (LATIN_HOMOGLYPHS.has(ch) ? " (ЛАТИНСКИ ХОМОГЛИФ!)" : ""));
    }
  }
}

const am = src.match(/const ALPHABET=\[\.\.\."([^"]+)"\]/);
if (am) {
  const a = [...am[1]];
  console.log(`ALPHABET: ${a.length} букви`);
  a.forEach(ch => {
    const cp = ch.codePointAt(0);
    if (!(cp >= 0x0410 && cp <= 0x042F)) {
      problems++;
      console.log(`  ALPHABET: ${JSON.stringify(ch)}=U+${cp.toString(16).toUpperCase()} не е главна кирилска буква!`);
    }
  });
  if (a.includes("Ь")) { problems++; console.log("  ALPHABET съдържа Ь (не трябва)!"); }
  const expected = [..."АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЮЯ"];
  if (a.join("") !== expected.join("")) console.log("  ALPHABET се различава от очакваните 29 букви (без Ь)");
} else { problems++; console.log("НЕ НАМЕРИХ ALPHABET!"); }

/* видимият бутон „буква" — "А?" */
const bm = src.match(/id="btnLetter"[^>]*>([^<]+)</);
if (bm) {
  const cps = [...bm[1]].map(c => `${JSON.stringify(c)}=U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
  console.log(`btnLetter съдържание: ${cps.join(" ")}`);
  const A = [...bm[1]][0];
  if (A.codePointAt(0) !== 0x0410) { problems++; console.log("  буквата А в бутона НЕ е кирилско U+0410!"); }
}

console.log(problems ? `\nОБЩО ПРОБЛЕМИ: ${problems}` : "\nЧИСТО: няма латински хомоглифи сред кирилицата.");
process.exit(problems ? 1 : 0);
