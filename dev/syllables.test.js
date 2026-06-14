// Regression test for the срички (syllable) levels (13–16) via window.__test.
// Tiles are whole syllables, not single letters. Run:
//   node /home/blazarov/projects/emma/sglobi-dumata/dev/syllables.test.js
const { launch } = require('./browser');

let passCount = 0, failCount = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { passCount++; console.log(`PASS  ${name}`); }
  else { failCount++; failures.push(name + (detail ? ` — ${detail}` : '')); console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}
function msCount(a){const m={};for(const c of a)m[c]=(m[c]||0)+1;return m;}
function msEqual(a,b){const A=msCount(a),B=msCount(b);const ks=new Set([...Object.keys(A),...Object.keys(B)]);for(const k of ks)if((A[k]||0)!==(B[k]||0))return false;return true;}
function msSubtract(tray,units){const m=msCount(tray);for(const u of units){if(!m[u])return null;m[u]--;}const out=[];for(const k of Object.keys(m))for(let i=0;i<m[k];i++)out.push(k);return out;}

(async () => {
  const { browser, page, errors } = await launch();
  const call = (fn, ...args) => page.evaluate((f, a) => window.__test[f](...a), fn, args);
  const state = () => page.evaluate(() => window.__test.state());
  const tap = u => call('tapLetter', u);

  // Solve current word by tapping its syllables in order; returns reveal trace + final state.
  async function solveUnits() {
    let s = await state();
    const reveals = [s.reveal];
    let ok = true;
    for (let i = s.step; i < s.units.length; i++) {
      const accepted = await tap(s.units[i]);
      s = await state();
      if (!accepted) { ok = false; break; }
      if (s.screen === 'play') reveals.push(s.reveal);
    }
    return { ok, reveals, state: await state() };
  }

  try {
    check('1a. page loads without errors', errors.length === 0, errors.join(' | '));

    // Unlock every level so we can reach the syllable chapter directly.
    await page.evaluate(() => localStorage.setItem('sglobi-dumata-v1',
      JSON.stringify({ unlocked: 16, stars: Array(16).fill(0), soundOn: true })));
    await page.reload({ waitUntil: 'load' });
    await call('start');
    let s = await state();
    check('1b. all 16 levels unlocked after seeding progress', s.progress.unlocked === 16,
      `unlocked=${s.progress.unlocked}`);
    check('1c. map renders 16 level nodes',
      (await page.evaluate(() => document.querySelectorAll('#mapArea .lnode').length)) === 16);

    // ---------- Level 13: 2-syllable words, 0 extras ----------
    const open13 = await call('openLevel', 13);
    s = await state();
    check("13a. openLevel(13) -> 'play'", open13 === true && s.screen === 'play' && s.level === 13,
      `ret=${open13} screen='${s.screen}'`);
    check('13b. units is the syllable split (>=2 units, multi-letter)',
      Array.isArray(s.units) && s.units.length >= 2 && s.units.join('') === s.word,
      `units=${JSON.stringify(s.units)} word='${s.word}'`);
    check('13c. tray = exactly the syllables, 0 extras (L13)',
      msEqual(s.tray, s.units), `tray=${JSON.stringify(s.tray)} units=${JSON.stringify(s.units)}`);
    check('13d. tray tiles carry syllables, not single letters',
      s.tray.some(t => t.length >= 2), `tray=${JSON.stringify(s.tray)}`);

    // tapping a single LETTER of the next syllable must NOT be accepted (syllable granularity)
    const firstSyl = s.units[0];
    if (firstSyl.length >= 2) {
      const single = await tap(firstSyl[0]);
      const s2 = await state();
      check('13e. tapping a single letter of a syllable is rejected',
        single === false && s2.step === 0 && s2.placed === '', `ret=${single} step=${s2.step}`);
    }

    // wrong syllable: a tray syllable that is not the expected next one
    const expected = s.units[s.step];
    const wrong = s.tray.find(t => t !== expected);
    if (wrong) {
      const res = await tap(wrong);
      const s3 = await state();
      check('13f. wrong syllable rejected, nothing placed',
        res === false && s3.step === 0, `ret=${res} step=${s3.step}`);
    }

    const word13 = s.word;
    const solved = await solveUnits();
    check(`13g. assembling '${word13}' syllable by syllable -> all accepted`, solved.ok);
    s = solved.state;
    check("13h. after last syllable screen === 'win'", s.screen === 'win', `got '${s.screen}'`);
    check('13i. on win placed === word, reveal === 1', s.placed === word13 && s.reveal === 1,
      `placed='${s.placed}' reveal=${s.reveal}`);
    check('13j. reveal strictly increases with each syllable',
      solved.reveals.length === word13.length /*not letters*/ || solved.reveals.every((r,i)=>i===0||r>solved.reveals[i-1]),
      `reveals=${JSON.stringify(solved.reveals)}`);
    // win screen shows one tile per syllable (not per letter)
    const winTiles = await page.evaluate(() => document.querySelectorAll('#winWord .wtile').length);
    check('13k. win screen shows one tile per syllable', winTiles === s.units.length,
      `tiles=${winTiles} units=${s.units.length}`);

    // ---------- Level 14: 1 extra syllable ----------
    // finish the rest of level 13 first to keep state clean, then open 14 directly
    await call('openLevel', 14);
    s = await state();
    check("14a. openLevel(14) -> play level 14", s.screen === 'play' && s.level === 14, `screen='${s.screen}'`);
    check('14b. tray = units + exactly 1 extra (L14)', s.tray.length === s.units.length + 1,
      `tray=${JSON.stringify(s.tray)} units=${JSON.stringify(s.units)}`);
    const extras14 = msSubtract(s.tray, s.units);
    check('14c. tray contains all word syllables', extras14 !== null, JSON.stringify(s.tray));
    check('14d. extra is a syllable not part of the word',
      extras14 !== null && extras14.length === 1 && !s.units.includes(extras14[0]),
      `extras=${JSON.stringify(extras14)}`);

    // ---------- Level 16: 4-syllable words ----------
    await call('openLevel', 16);
    s = await state();
    check('16a. level 16 words split into 4 syllables', s.units.length === 4 && s.units.join('') === s.word,
      `units=${JSON.stringify(s.units)} word='${s.word}'`);
    check('16b. tray = 4 units + 2 extras (L16)', s.tray.length === 6,
      `tray=${JSON.stringify(s.tray)}`);

    // ---------- Full level 13 run + progress/stars ----------
    await call('reset');
    await page.evaluate(() => localStorage.setItem('sglobi-dumata-v1',
      JSON.stringify({ unlocked: 16, stars: Array(16).fill(0), soundOn: true })));
    await page.reload({ waitUntil: 'load' });
    await call('openLevel', 13);
    let level13ok = true;
    for (let w = 0; w < 6; w++) {
      const sv = await solveUnits();
      if (!sv.ok || sv.state.screen !== 'win') { level13ok = false; break; }
      if (w < 5) {
        await call('next');
        const sn = await state();
        if (sn.screen !== 'play' || sn.wordIndex !== w + 1) { level13ok = false; break; }
      }
    }
    check('17a. all 6 syllable words of level 13 solved', level13ok);
    await call('next'); // -> level-end
    s = await state();
    check('17b. finishing level 13 awards stars[12] === 3 (no hints)', s.progress.stars[12] === 3,
      `stars[12]=${s.progress.stars[12]}`);
    check('17c. finishing level 13 unlocks level 14', s.progress.unlocked >= 14,
      `unlocked=${s.progress.unlocked}`);

    check('1d. no console/page errors during whole syllable session', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('0. test run completed without exception', false, e.stack || String(e));
  } finally {
    await browser.close();
  }

  console.log(`\n==== SUMMARY: ${passCount} passed, ${failCount} failed ====`);
  if (failures.length) { console.log('Failures:'); for (const f of failures) console.log('  - ' + f); }
  process.exitCode = failCount ? 1 : 0;
})();
