// Review pass 1: contract shape, full playthrough, stars, unlock, hints, reveal, storage.
const { launch } = require('./browser');

const log = [];
function check(name, ok, detail) {
  log.push((ok ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
}

(async () => {
  const { browser, page, errors } = await launch();

  const st = () => page.evaluate(() => window.__test.state());

  // --- 0. initial shape + audio context not created before gesture
  let s = await st();
  check('initial screen home', s.screen === 'home', JSON.stringify(s));
  check('initial nulls', s.level === null && s.wordIndex === null && s.word === null && s.placed === '' && Array.isArray(s.tray) && s.tray.length === 0 && s.hintsUsed === 0 && s.reveal === 0, JSON.stringify(s));
  check('initial progress', s.progress.unlocked === 1 && s.progress.stars.length === 12 && s.progress.stars.every(v => v === 0), JSON.stringify(s.progress));
  const audioBefore = await page.evaluate(() => ({ hasCtx: !!window.actx || (typeof actx !== 'undefined' && !!actx) }));
  check('no AudioContext before gesture', audioBefore.hasCtx === false, JSON.stringify(audioBefore));

  // --- 1. openLevel locked from map
  await page.evaluate(() => window.__test.start());
  s = await st();
  check('start -> map', s.screen === 'map');
  const lockedRes = await page.evaluate(() => window.__test.openLevel(2));
  s = await st();
  check('openLevel(2) locked -> false, no effect', lockedRes === false && s.screen === 'map');
  const badRes = await page.evaluate(() => [window.__test.openLevel(0), window.__test.openLevel(13), window.__test.openLevel('1'), window.__test.openLevel(1.5)]);
  check('openLevel invalid args -> false', badRes.every(r => r === false), JSON.stringify(badRes));

  // --- 2. open level 1, inspect word/tray
  const ok1 = await page.evaluate(() => window.__test.openLevel(1));
  s = await st();
  check('openLevel(1) -> play', ok1 === true && s.screen === 'play' && s.level === 1 && s.wordIndex === 0 && typeof s.word === 'string');
  check('reveal starts 0.1', Math.abs(s.reveal - 0.1) < 1e-9, 'reveal=' + s.reveal);
  check('tray = word letters (L1, 0 extras)', s.tray.slice().sort().join('') === [...s.word].sort().join(''), JSON.stringify(s));

  // wrong letter / missing letter behavior
  const wrongLetter = await page.evaluate(() => {
    const t = window.__test, s0 = t.state();
    const wrong = s0.tray.find(ch => ch !== s0.word[0]);
    const r1 = wrong ? t.tapLetter(wrong) : null;        // in tray, wrong
    const r2 = t.tapLetter('Щ' === s0.word[0] ? 'Ф' : 'Щ'); // not in tray (L1 words contain neither Щ nor Ф)
    const r3 = t.tapLetter(s0.word[0].toLowerCase());     // lowercase accepted?
    return { r1, r2, r3, after: t.state() };
  });
  check('wrong tray letter -> false, no state change', wrongLetter.r1 === false || wrongLetter.r1 === null);
  check('letter not in tray -> false', wrongLetter.r2 === false);
  check('lowercase of correct letter accepted', wrongLetter.r3 === true, JSON.stringify(wrongLetter.after.placed));

  // --- 3. finish word 1 monotonically checking reveal
  const word1 = await page.evaluate(() => {
    const t = window.__test;
    const reveals = [t.state().reveal];
    while (t.state().screen === 'play') {
      const st0 = t.state();
      t.tapLetter(st0.word[st0.placed.length]);
      reveals.push(t.state().reveal);
    }
    return { reveals, final: t.state() };
  });
  check('word done -> screen win, placed===word, reveal===1',
    word1.final.screen === 'win' && word1.final.placed === word1.final.word && word1.final.reveal === 1,
    JSON.stringify(word1.final));
  check('reveal monotonic & within [0,1]',
    word1.reveals.every((r, i) => r >= 0 && r <= 1 && (i === 0 || r >= word1.reveals[i - 1])),
    JSON.stringify(word1.reveals));

  // --- 4. hints: word 2 with 1 hintEye, word 3 with 2 hints (incl hintLetter finishing the word)
  await page.evaluate(() => window.__test.next());
  s = await st();
  check('next -> word 2 play', s.screen === 'play' && s.wordIndex === 1 && s.placed === '');
  const hintScenario = await page.evaluate(() => {
    const t = window.__test;
    t.hintEye();
    const afterEye = t.state();
    // finish with taps
    while (t.state().screen === 'play') { const st0 = t.state(); t.tapLetter(st0.word[st0.placed.length]); }
    const win2 = t.state();
    t.next();
    // word 3: use hintLetter for every letter -> budget 2, then taps; last letter via hintLetter if budget remains
    t.hintLetter(); t.hintLetter();
    const after2hints = t.state();
    t.hintLetter(); t.hintEye(); // should be no-ops
    const afterNoop = t.state();
    while (t.state().screen === 'play') { const st0 = t.state(); t.tapLetter(st0.word[st0.placed.length]); }
    const win3 = t.state();
    return { afterEye, win2, after2hints, afterNoop, win3 };
  });
  check('hintEye: hintsUsed=1, reveal +0.38', hintScenario.afterEye.hintsUsed === 1 && Math.abs(hintScenario.afterEye.reveal - 0.48) < 1e-9, 'reveal=' + hintScenario.afterEye.reveal);
  check('hintLetter x2: hintsUsed=2, placed 2 letters', hintScenario.after2hints.hintsUsed === 2 && hintScenario.after2hints.placed.length === 2, JSON.stringify(hintScenario.after2hints.placed));
  check('3rd hint is no-op', hintScenario.afterNoop.hintsUsed === 2 && hintScenario.afterNoop.placed.length === 2 && hintScenario.afterNoop.reveal === hintScenario.after2hints.reveal);

  // --- 5. hintLetter on the very last letter finishes word synchronously
  await page.evaluate(() => window.__test.next());
  const lastLetterHint = await page.evaluate(() => {
    const t = window.__test;
    let st0 = t.state();
    while (st0.placed.length < st0.word.length - 1) { t.tapLetter(st0.word[st0.placed.length]); st0 = t.state(); }
    t.hintLetter(); // place final letter via hint
    return t.state();
  });
  check('hintLetter on last letter -> win, reveal 1, hintsUsed 1',
    lastLetterHint.screen === 'win' && lastLetterHint.reveal === 1 && lastLetterHint.placed === lastLetterHint.word && lastLetterHint.hintsUsed === 1,
    JSON.stringify(lastLetterHint));

  // --- 6. finish remaining words of level 1 cleanly; words so far: w1 0 hints(3*), w2 1 hint(2*), w3 2 hints(1*), w4 1 hint(2*)
  const endLevel = await page.evaluate(() => {
    const t = window.__test;
    t.next();
    for (let w = 4; w <= 5; w++) {
      while (t.state().screen === 'play') { const st0 = t.state(); t.tapLetter(st0.word[st0.placed.length]); }
      if (w < 5) t.next();
    }
    const winLast = t.state();
    t.next(); // -> level end
    const levelEnd = t.state();
    t.next(); // -> map
    const mapAfter = t.state();
    return { winLast, levelEnd, mapAfter };
  });
  // stars: [3,2,1,2,3,3] avg = 14/6 = 2.333 -> round 2
  check('level-end reported as win w/ nulls + reveal 1',
    endLevel.levelEnd.screen === 'win' && endLevel.levelEnd.level === 1 && endLevel.levelEnd.wordIndex === null &&
    endLevel.levelEnd.word === null && endLevel.levelEnd.placed === '' && endLevel.levelEnd.tray.length === 0 &&
    endLevel.levelEnd.hintsUsed === 0 && endLevel.levelEnd.reveal === 1,
    JSON.stringify(endLevel.levelEnd));
  check('progress saved at 6th word win (before level-end)',
    endLevel.winLast.progress.unlocked === 2 && endLevel.winLast.progress.stars[0] === 2,
    JSON.stringify(endLevel.winLast.progress));
  check('next from level-end -> map', endLevel.mapAfter.screen === 'map');

  // --- 7. replay keeps max: replay level 1 with 0 hints -> 3 stars; then replay with 2 hints per word -> stays 3
  const replay = await page.evaluate(() => {
    const t = window.__test;
    function playLevel(n, hintsPerWord) {
      t.openLevel(n);
      for (let w = 0; w < 6; w++) {
        for (let h = 0; h < hintsPerWord; h++) t.hintEye();
        while (t.state().screen === 'play') { const st0 = t.state(); t.tapLetter(st0.word[st0.placed.length]); }
        t.next();
      }
      const le = t.state();
      t.next();
      return le.progress;
    }
    const perfect = playLevel(1, 0);
    const sloppy = playLevel(1, 2);
    return { perfect, sloppy };
  });
  check('perfect replay -> 3 stars', replay.perfect.stars[0] === 3, JSON.stringify(replay.perfect));
  check('sloppy replay keeps max 3', replay.sloppy.stars[0] === 3, JSON.stringify(replay.sloppy));

  // --- 8. persistence across reload (mid-word) + storage content
  await page.evaluate(() => { window.__test.openLevel(2); const t = window.__test; const s0 = t.state(); t.tapLetter(s0.word[0]); });
  const stored = await page.evaluate(() => localStorage.getItem('sglobi-dumata-v1'));
  await page.reload({ waitUntil: 'load' });
  s = await st();
  check('reload mid-word -> home, progress retained', s.screen === 'home' && s.progress.unlocked === 2 && s.progress.stars[0] === 3, JSON.stringify(s.progress) + ' stored=' + stored);

  // --- 9. corrupted / legacy storage
  await page.evaluate(() => localStorage.setItem('sglobi-dumata-v1', '{broken json!!'));
  await page.reload({ waitUntil: 'load' });
  s = await st();
  check('corrupted JSON -> defaults, no crash', s.screen === 'home' && s.progress.unlocked === 1 && s.progress.stars.every(v => v === 0), JSON.stringify(s.progress));
  await page.evaluate(() => localStorage.setItem('sglobi-dumata-v1', JSON.stringify({ unlocked: 99, stars: [5, -1, 'x', 3, 3, 3, 3, 3, 3, 3, 3, 3], soundOn: 'yes' })));
  await page.reload({ waitUntil: 'load' });
  s = await st();
  check('out-of-range storage sanitized', s.progress.unlocked === 1 && s.progress.stars[0] === 0 && s.progress.stars[1] === 0 && s.progress.stars[2] === 0 && s.progress.stars[3] === 3 && s.soundOn === true, JSON.stringify(s.progress));

  // --- 10. reset
  await page.evaluate(() => { localStorage.setItem('sglobi-dumata-v1', JSON.stringify({ unlocked: 5, stars: [3,3,3,3,0,0,0,0,0,0,0,0], soundOn: false })); });
  await page.reload({ waitUntil: 'load' });
  const afterReset = await page.evaluate(() => { window.__test.reset(); return { s: window.__test.state(), raw: localStorage.getItem('sglobi-dumata-v1') }; });
  check('reset -> home, defaults, storage removed', afterReset.s.screen === 'home' && afterReset.s.progress.unlocked === 1 && afterReset.raw === null, JSON.stringify(afterReset));

  // --- 11. console errors
  check('no console/page errors so far', errors.length === 0, JSON.stringify(errors));

  console.log(log.join('\n'));
  await browser.close();
})().catch(e => { console.log(log.join('\n')); console.error('HARNESS ERROR', e); process.exit(1); });
