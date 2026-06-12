// Smoke test for the game (index.html) via the mandatory window.__test contract.
// Run: node /home/blazarov/projects/emma/dev/smoke.test.js
// Every check prints PASS/FAIL. Exit code 1 if any FAIL.
const { launch } = require('./browser');
const path = require('path');
const fs = require('fs');

const SHOTS = path.join(__dirname, 'shots');

let passCount = 0, failCount = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { passCount++; console.log(`PASS  ${name}`); }
  else {
    failCount++;
    failures.push(name + (detail ? ` — ${detail}` : ''));
    console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function msCount(arr) { const m = {}; for (const c of arr) m[c] = (m[c] || 0) + 1; return m; }
function msEqual(a, b) {
  const A = msCount(a), B = msCount(b);
  const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of keys) if ((A[k] || 0) !== (B[k] || 0)) return false;
  return true;
}
// Subtract word letters (multiset) from tray; null if tray lacks a word letter.
function msSubtract(tray, wordLetters) {
  const m = msCount(tray);
  for (const c of wordLetters) { if (!m[c]) return null; m[c]--; }
  const out = [];
  for (const k of Object.keys(m)) for (let i = 0; i < m[k]; i++) out.push(k);
  return out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { browser, page, errors } = await launch();

  const call = (fn, ...args) =>
    page.evaluate((f, a) => window.__test[f](...a), fn, args);
  const state = () => page.evaluate(() => window.__test.state());
  const tap = ch => call('tapLetter', ch);
  const shot = async (name, settle = 700) => {
    await sleep(settle); // let cosmetic animations settle for the screenshot
    await page.screenshot({ path: path.join(SHOTS, name + '.png') });
    console.log(`shot  ${name}.png`);
  };

  // Solve the current word by tapping expected letters in order.
  // Returns { ok, reveals, state } ; takes optional mid screenshot once.
  async function solveWord(midShotName = null) {
    let s = await state();
    const word = s.word;
    const reveals = [s.reveal];
    let ok = true;
    for (let i = s.placed.length; i < word.length; i++) {
      const accepted = await tap(word[i]);
      s = await state();
      if (!accepted || (s.screen === 'play' && s.placed !== word.slice(0, i + 1))) {
        ok = false;
        break;
      }
      reveals.push(s.reveal);
      if (midShotName && i + 1 === Math.ceil(word.length / 2) && s.screen === 'play') {
        await shot(midShotName);
        midShotName = null;
      }
    }
    return { ok, reveals, word, state: await state() };
  }

  try {
    // ---------- 1. page loads with no errors ----------
    check('1a. page loads without console/page errors', errors.length === 0, errors.join(' | '));

    // Clean slate (idempotent; fresh profile anyway)
    await call('reset');

    // ---------- 2. home -> map -> play, level 1 tray ----------
    let s = await state();
    check("2a. initial screen === 'home'", s.screen === 'home', `got '${s.screen}'`);
    check('2b. home state nulls (level/word) per contract',
      s.level === null && s.word === null && s.wordIndex === null && s.placed === '' &&
      s.tray.length === 0 && s.reveal === 0, JSON.stringify(s));
    await shot('01-home');

    await call('start');
    s = await state();
    check("2c. start() -> screen 'map'", s.screen === 'map', `got '${s.screen}'`);
    await shot('02-map');

    // ---------- 10. locked level (while unlocked === 1) ----------
    check('10a. fresh progress: unlocked === 1', s.progress.unlocked === 1, `got ${s.progress.unlocked}`);
    const lockedRes = await call('openLevel', 2);
    s = await state();
    check('10b. openLevel(2) while locked returns false', lockedRes === false, `got ${lockedRes}`);
    check("10c. screen stays 'map' after locked attempt", s.screen === 'map', `got '${s.screen}'`);

    // ---------- open level 1 ----------
    const open1 = await call('openLevel', 1);
    s = await state();
    check("2d. openLevel(1) returns true -> 'play'", open1 === true && s.screen === 'play',
      `ret=${open1} screen='${s.screen}'`);
    check('2e. level 1, word is a 3-letter uppercase word',
      s.level === 1 && typeof s.word === 'string' && s.word.length === 3 && s.word === s.word.toUpperCase(),
      `level=${s.level} word='${s.word}'`);
    check('2f. L1 tray contains exactly the word letters (0 extras)',
      msEqual(s.tray, s.word.split('')), `tray=${JSON.stringify(s.tray)} word='${s.word}'`);
    check('2g. new word starts mostly hidden (0 < reveal <= 0.2)',
      s.reveal > 0 && s.reveal <= 0.2, `reveal=${s.reveal}`);
    await shot('03-play-obscured');

    // ---------- 3. wrong letter ----------
    const expectedNext = s.word[s.placed.length];
    const wrong = s.tray.find(c => c !== expectedNext);
    if (wrong) {
      const beforeS = s;
      const res = await tap(wrong);
      s = await state();
      check(`3a. tapLetter('${wrong}') (wrong) returns false`, res === false, `got ${res}`);
      check('3b. placed and tray unchanged after wrong letter',
        s.placed === beforeS.placed && msEqual(s.tray, beforeS.tray),
        `placed='${s.placed}' tray=${JSON.stringify(s.tray)}`);
    } else {
      console.log('SKIP 3a/3b — no non-expected letter available in tray');
    }
    // bonus contract check: letter not present in tray
    if (!s.tray.includes('Я')) {
      const resAbsent = await tap('Я');
      const s2 = await state();
      check("3c. tapLetter of letter absent from tray returns false, no effect",
        resAbsent === false && s2.placed === s.placed, `ret=${resAbsent}`);
    }

    // ---------- 4 + 5. correct assembly, reveal monotonic, win ----------
    const word1 = s.word;
    const solved1 = await solveWord('04-play-mid');
    check(`4a. assembling '${word1}' letter by letter: all taps accepted`, solved1.ok);
    s = solved1.state;
    check("4b. after last letter screen === 'win'", s.screen === 'win', `got '${s.screen}'`);
    check('4c. on win reveal === 1', s.reveal === 1, `got ${s.reveal}`);
    check("4d. on win placed === word", s.placed === word1 && s.word === word1,
      `placed='${s.placed}'`);
    check('5.  reveal strictly increases with every correct letter',
      solved1.reveals.length === word1.length + 1 &&
      solved1.reveals.every((r, i) => i === 0 || r > solved1.reveals[i - 1]),
      `reveals=${JSON.stringify(solved1.reveals)}`);
    // stars pop in staggered (last one ~950ms after win) — wait them out for the shot
    await shot('05-win', 1600);
    const winStars = await page.evaluate(() => ({
      total: document.querySelectorAll('#winStars .star').length,
      shown: document.querySelectorAll('#winStars .star.shown').length,
    }));
    check('13a. win screen shows 3 stars for a 0-hint word',
      winStars.total === 3 && winStars.shown === 3, JSON.stringify(winStars));

    // ---------- 6. next() -> next word ----------
    await call('next');
    s = await state();
    check("6.  next() -> play with wordIndex 1", s.screen === 'play' && s.wordIndex === 1 && s.level === 1,
      `screen='${s.screen}' wordIndex=${s.wordIndex}`);

    // ---------- 7. finish level 1 without hints ----------
    let level1ok = true;
    for (let w = 1; w < 6; w++) {
      const solved = await solveWord();
      if (!solved.ok || solved.state.screen !== 'win') { level1ok = false; break; }
      if (w < 5) {
        await call('next');
        const sn = await state();
        if (sn.screen !== 'play' || sn.wordIndex !== w + 1) { level1ok = false; break; }
      }
    }
    check('7a. words 2..6 of level 1 all solved (win after each)', level1ok);
    s = await state();
    check('7b. after 6th word: progress.unlocked >= 2', s.progress.unlocked >= 2,
      `unlocked=${s.progress.unlocked}`);
    check('7c. stars[0] === 3 (no hints used)', s.progress.stars[0] === 3,
      `stars=${JSON.stringify(s.progress.stars)}`);
    await call('next'); // win of 6th word -> level-end
    s = await state();
    check("7d. level-end reported as screen 'win' with wordIndex/word null, reveal 1",
      s.screen === 'win' && s.level === 1 && s.wordIndex === null && s.word === null &&
      s.placed === '' && s.tray.length === 0 && s.reveal === 1, JSON.stringify(s));
    // level-end stars pop in until ~1.2s — wait them out for the shot
    await shot('06-levelend', 1700);
    const endStars = await page.evaluate(() => ({
      total: document.querySelectorAll('#endStars .star').length,
      shown: document.querySelectorAll('#endStars .star.shown').length,
      earned: document.querySelectorAll('#endStars .star:not(.empty)').length,
    }));
    check('13b. level-end shows 3 of 3 stars earned (no-hint run)',
      endStars.total === 3 && endStars.shown === 3 && endStars.earned === 3,
      JSON.stringify(endStars));
    await call('next'); // level-end -> map
    s = await state();
    check("7e. next() from level-end -> 'map'", s.screen === 'map', `got '${s.screen}'`);

    // ---------- 12. level 2: tray has exactly 1 extra letter, not from the word ----------
    const open2 = await call('openLevel', 2);
    s = await state();
    check("12a. openLevel(2) after unlock -> 'play' level 2 word 0",
      open2 === true && s.screen === 'play' && s.level === 2 && s.wordIndex === 0,
      `ret=${open2} screen='${s.screen}' level=${s.level}`);
    check('12b. tray.length === word.length + 1 extra (L2)',
      s.tray.length === s.word.length + 1,
      `tray=${JSON.stringify(s.tray)} word='${s.word}'`);
    const extras = msSubtract(s.tray, s.word.split(''));
    check('12c. tray contains all word letters', extras !== null,
      `tray=${JSON.stringify(s.tray)} word='${s.word}'`);
    check('12d. extra letters are not letters of the word',
      extras !== null && extras.every(c => !s.word.includes(c)),
      `extras=${JSON.stringify(extras)} word='${s.word}'`);

    // ---------- 8. hints ----------
    const before8 = s;
    await call('hintEye');
    s = await state();
    check('8a. hintEye() raises reveal significantly (+~0.38)',
      s.reveal > before8.reveal + 0.3, `before=${before8.reveal} after=${s.reveal}`);
    check('8b. hintsUsed === 1 after hintEye', s.hintsUsed === 1, `got ${s.hintsUsed}`);
    check('8c. hintEye does not place a letter', s.placed === before8.placed, `placed='${s.placed}'`);

    const expectedHintLetter = s.word[s.placed.length];
    const placedBefore = s.placed;
    await call('hintLetter');
    s = await state();
    check(`8d. hintLetter() places next correct letter ('${expectedHintLetter}')`,
      s.placed === placedBefore + expectedHintLetter, `placed='${s.placed}'`);
    check('8e. hintsUsed === 2 after second hint', s.hintsUsed === 2, `got ${s.hintsUsed}`);

    // budget exhausted -> both hints are no-ops
    const sBudget = s;
    await call('hintEye');
    s = await state();
    check('8f. hintEye is no-op when budget (2) exhausted',
      s.hintsUsed === 2 && s.reveal === sBudget.reveal && s.placed === sBudget.placed,
      `hintsUsed=${s.hintsUsed} reveal=${s.reveal}`);
    await call('hintLetter');
    s = await state();
    check('8g. hintLetter is no-op when budget exhausted',
      s.hintsUsed === 2 && s.placed === sBudget.placed, `placed='${s.placed}'`);

    // finish word 1 of level 2 (had 2 hints -> 1 star for the word)
    let solved = await solveWord();
    check('8h. word with hints can still be completed -> win',
      solved.ok && solved.state.screen === 'win' && solved.state.reveal === 1);

    // words 2..6 of level 2: exactly 1 hintLetter each (-> 2 stars per word)
    let level2ok = true;
    for (let w = 1; w < 6; w++) {
      await call('next');
      let sw = await state();
      if (sw.screen !== 'play' || sw.wordIndex !== w) { level2ok = false; break; }
      const expLetter = sw.word[sw.placed.length];
      await call('hintLetter');
      sw = await state();
      if (sw.hintsUsed !== 1 || sw.placed !== expLetter) { level2ok = false; break; }
      const sv = await solveWord();
      if (!sv.ok || sv.state.screen !== 'win') { level2ok = false; break; }
    }
    check('8i. words 2..6 of level 2 solved with exactly 1 hint each', level2ok);
    s = await state();
    // word stars: [1,2,2,2,2,2] -> avg 11/6 ≈ 1.83 -> round = 2 -> level stars 2
    check('8j. level finished with hints gives stars < 3', s.progress.stars[1] > 0 && s.progress.stars[1] < 3,
      `stars[1]=${s.progress.stars[1]}`);
    check('8k. star formula: max(1, round(avg(1,2,2,2,2,2))) === 2', s.progress.stars[1] === 2,
      `stars[1]=${s.progress.stars[1]}`);
    check('8l. finishing level 2 unlocks level 3', s.progress.unlocked >= 3,
      `unlocked=${s.progress.unlocked}`);
    await call('next'); // -> level-end
    await call('next'); // -> map

    // ---------- 9 + 11. persistence, sound, reset ----------
    await page.reload({ waitUntil: 'load' });
    s = await state();
    check("9a. after reload screen === 'home'", s.screen === 'home', `got '${s.screen}'`);
    check('9b. after reload progress.unlocked >= 2 persisted', s.progress.unlocked >= 2,
      `unlocked=${s.progress.unlocked}`);
    check('9c. stars persisted after reload (stars[0]=3, stars[1]=2)',
      s.progress.stars[0] === 3 && s.progress.stars[1] === 2,
      `stars=${JSON.stringify(s.progress.stars)}`);

    check('11a. soundOn defaults to true', s.soundOn === true, `got ${s.soundOn}`);
    await page.click('#scrHome .sndbtn'); // UI toggle (pointerdown handler)
    s = await state();
    check('11b. UI sound button toggles soundOn -> false', s.soundOn === false, `got ${s.soundOn}`);
    await page.reload({ waitUntil: 'load' });
    s = await state();
    check('11c. soundOn === false persists after reload', s.soundOn === false, `got ${s.soundOn}`);
    check('11d. progress still intact after second reload', s.progress.unlocked >= 2,
      `unlocked=${s.progress.unlocked}`);

    await call('reset');
    s = await state();
    check("9d. reset() -> screen 'home', unlocked 1, all stars 0",
      s.screen === 'home' && s.progress.unlocked === 1 && s.progress.stars.every(x => x === 0),
      JSON.stringify(s.progress));
    await page.reload({ waitUntil: 'load' });
    s = await state();
    check('9e. progress stays clean after reset + reload',
      s.progress.unlocked === 1 && s.progress.stars.every(x => x === 0),
      JSON.stringify(s.progress));

    // ---------- 1 (final): no errors accumulated during the whole session ----------
    check('1b. no console/page errors during entire session', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('0.  test run completed without unexpected exception', false, e.stack || String(e));
  } finally {
    await browser.close();
  }

  console.log(`\n==== SUMMARY: ${passCount} passed, ${failCount} failed ====`);
  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log('  - ' + f);
  }
  process.exitCode = failCount ? 1 : 0;
})();
