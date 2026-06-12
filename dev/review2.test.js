// Review pass 2: tray composition, mix mode, level-12 endgame, UI races, timers/confetti cleanup.
const { launch } = require('./browser');

const log = [];
function check(name, ok, detail) {
  log.push((ok ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const { browser, page, errors } = await launch();
  const st = () => page.evaluate(() => window.__test.state());

  // unlock everything for direct access
  await page.evaluate(() => { localStorage.setItem('sglobi-dumata-v1', JSON.stringify({ unlocked: 12, stars: [3,3,3,3,3,3,3,3,3,3,3,0], soundOn: true })); });
  await page.reload({ waitUntil: 'load' });

  // --- 1. tray composition sampling: 40 samples per level
  const trayAudit = await page.evaluate(() => {
    const issues = [];
    for (let lvl = 1; lvl <= 12; lvl++) {
      const L = LEVELS[lvl - 1];
      for (const W of L.words) {
        for (let rep = 0; rep < 40; rep++) {
          const tray = makeTray(W.word, L.extraLetters);
          const wl = [...W.word];
          // size
          if (tray.length !== wl.length + L.extraLetters)
            issues.push(`L${lvl} ${W.word}: tray size ${tray.length}`);
          // word letters all present with correct multiplicity
          const tcount = {}, wcount = {};
          tray.forEach(c => tcount[c] = (tcount[c] || 0) + 1);
          wl.forEach(c => wcount[c] = (wcount[c] || 0) + 1);
          for (const c of Object.keys(wcount))
            if ((tcount[c] || 0) !== wcount[c])
              issues.push(`L${lvl} ${W.word}: letter ${c} count ${tcount[c]} vs word ${wcount[c]}`);
          // extras: not in word, no extra duplicated
          const extras = [];
          for (const c of Object.keys(tcount)) {
            const e = tcount[c] - (wcount[c] || 0);
            if (e > 0) { extras.push([c, e]); if (wcount[c]) issues.push(`L${lvl} ${W.word}: extra duplicates word letter ${c}`); }
            if (e > 1) issues.push(`L${lvl} ${W.word}: duplicate extra ${c} x${e}`);
          }
          // never starts spelling the word
          if (tray.length > 1 && tray.slice(0, wl.length).join('') === W.word)
            issues.push(`L${lvl} ${W.word}: tray spells word in order`);
          // all letters from alphabet
          for (const c of tray) if (!ALPHABET.includes(c)) issues.push(`L${lvl} ${W.word}: non-alphabet char ${c}`);
        }
      }
    }
    return issues.slice(0, 20);
  });
  check('tray composition (2880 samples): sizes, multiplicity, extras not in word, no dup extras, never pre-spelled', trayAudit.length === 0, JSON.stringify(trayAudit));

  // --- 2. mix mode resolution on L11/L12 (sample via repeated openLevel)
  const mixModes = await page.evaluate(() => {
    const seen = new Set();
    for (let i = 0; i < 30; i++) { window.__test.openLevel(11); seen.add(S.mode); }
    return [...seen];
  });
  check('mix resolves to one of 4 modes', mixModes.every(m => ['blur-strong','silhouette','peephole-small','tiles'].includes(m)), JSON.stringify(mixModes));

  // --- 3. applyReveal throws nothing for every mode at extreme values; covers count for tiles at 0.95
  const tilesCap = await page.evaluate(() => {
    const t = window.__test;
    t.openLevel(8); // tiles
    t.hintEye(); t.hintEye(); // reveal 0.86
    let s0 = t.state();
    t.tapLetter(s0.word[0]); // +0.7/6=0.1167 -> cap 0.95
    s0 = t.state();
    const covers = elOverlay.children.length;
    const goneN = elOverlay.querySelectorAll('.cover.gone').length;
    return { reveal: s0.reveal, placedLen: s0.placed.length, wordLen: s0.word.length, covers, goneN, screen: s0.screen };
  });
  check('tiles mode at reveal 0.95: picture fully uncovered before word done (cap ineffective for tiles)',
    !(tilesCap.goneN === 9 && tilesCap.screen === 'play'),
    JSON.stringify(tilesCap));

  // --- 4. level 12 endgame: unlocked stays 12, btnNextLevel hidden
  const l12 = await page.evaluate(() => {
    const t = window.__test;
    t.openLevel(12);
    for (let w = 0; w < 6; w++) {
      while (t.state().screen === 'play') { const s0 = t.state(); t.tapLetter(s0.word[s0.placed.length]); }
      t.next();
    }
    const le = t.state();
    const nextLevelBtnDisplay = getComputedStyle(byId('btnNextLevel')).display;
    t.next();
    return { le, nextLevelBtnDisplay, after: t.state() };
  });
  check('L12 done: unlocked stays 12, stars[11]=3', l12.le.progress.unlocked === 12 && l12.le.progress.stars[11] === 3, JSON.stringify(l12.le.progress));
  check('L12 level-end hides next-level button', l12.nextLevelBtnDisplay === 'none');
  check('L12 next from level-end -> map', l12.after.screen === 'map');

  // --- 5. UI playthrough with real mouse incl. wrong taps + DOM/state coherence
  await page.evaluate(() => window.__test.reset());
  // home -> map via real click on play button
  const bb = await page.evaluate(() => { const r = byId('btnPlay').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(bb.x, bb.y);
  let s = await st();
  check('UI: play button -> map', s.screen === 'map', s.screen);
  // click level 1 node
  const n1 = await page.evaluate(() => { const n = document.querySelector('#mapArea .lnode'); const r = n.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(n1.x, n1.y);
  s = await st();
  check('UI: level node -> play', s.screen === 'play' && s.level === 1, JSON.stringify({ screen: s.screen, level: s.level }));

  // tap a WRONG tile 3 times -> bounce hint engaged; then correct tiles
  const uiWord = await page.evaluate(() => window.__test.state().word);
  async function tileCenter(letter, wrong) {
    return page.evaluate(({ letter, wrong }) => {
      const tiles = [...document.querySelectorAll('#trayRow .tile:not(.taken)')];
      const t = wrong ? tiles.find(t => t.dataset.l !== letter) : tiles.find(t => t.dataset.l === letter);
      if (!t) return null;
      const r = t.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, l: t.dataset.l };
    }, { letter, wrong });
  }
  let expected = await page.evaluate(() => { const s0 = window.__test.state(); return s0.word[s0.placed.length]; });
  let wrongPos = await tileCenter(expected, true);
  if (wrongPos) {
    for (let i = 0; i < 3; i++) await page.mouse.click(wrongPos.x, wrongPos.y);
    const bounce = await page.evaluate(() => ({ errStreak: S.errStreak, timer: bounceTimer !== null }));
    check('UI: 3 wrong taps -> errStreak 3 + bounce timer running', bounce.errStreak === 3 && bounce.timer, JSON.stringify(bounce));
  } else {
    check('UI: wrong tile available (L1 has none extra, word w/ distinct letters?)', true, 'skipped, tray=' + JSON.stringify(await page.evaluate(() => window.__test.state().tray)));
  }
  // back to map mid-word -> bounce timer must be cleared
  const backPos = await page.evaluate(() => { const r = byId('btnBack').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(backPos.x, backPos.y);
  const afterBack = await page.evaluate(() => ({ screen: window.__test.state().screen, timer: bounceTimer === null }));
  check('UI: back mid-word -> map, bounce interval cleared', afterBack.screen === 'map' && afterBack.timer, JSON.stringify(afterBack));

  // --- 6. double-tap race on the same correct tile (rapid)
  await page.mouse.click(n1.x, n1.y); // open level 1 again
  expected = await page.evaluate(() => { const s0 = window.__test.state(); return s0.word[s0.placed.length]; });
  const pos = await tileCenter(expected, false);
  // two immediate clicks at same coords without waiting for relayout
  await page.mouse.click(pos.x, pos.y);
  await page.mouse.click(pos.x, pos.y, { delay: 0 });
  const afterDouble = await page.evaluate(() => {
    const s0 = window.__test.state();
    const domTiles = [...document.querySelectorAll('#trayRow .tile:not(.taken)')].map(t => t.dataset.l).sort().join('');
    return { placed: s0.placed, tray: s0.tray.slice().sort().join(''), domTiles, word: s0.word };
  });
  check('double-tap: state tray matches visible DOM tiles', afterDouble.tray === afterDouble.domTiles, JSON.stringify(afterDouble));
  check('double-tap: placed grew consistently (no dup placement)',
    afterDouble.placed.length + afterDouble.tray.length === afterDouble.word.length, JSON.stringify(afterDouble));

  // --- 7. finish word via UI taps; win screen; confetti canvas cleanup
  for (let guard = 0; guard < 12; guard++) {
    const s0 = await st();
    if (s0.screen !== 'play') break;
    const p = await tileCenter(s0.word[s0.placed.length], false);
    if (!p) break;
    await page.mouse.click(p.x, p.y);
  }
  s = await st();
  check('UI: word finished -> win', s.screen === 'win', s.screen);
  let canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);
  check('confetti canvas present on win', canvases === 1, 'count=' + canvases);
  // quick multiple wins should never stack canvases: replay via API rapidly
  await page.evaluate(() => {
    const t = window.__test;
    for (let k = 0; k < 3; k++) {
      t.openLevel(1);
      while (t.state().screen === 'play') { const s0 = t.state(); t.tapLetter(s0.word[s0.placed.length]); }
    }
  });
  canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);
  check('rapid repeated wins -> single confetti canvas', canvases <= 1, 'count=' + canvases);
  await sleep(3200);
  const cleanup = await page.evaluate(() => ({ canvases: document.querySelectorAll('canvas').length, raf: confettiRaf, ghosts: document.querySelectorAll('.tile.ghost').length, winTimersLeft: winTimers.length }));
  check('confetti cleaned after duration (canvas removed, rAF=0, no ghost tiles)', cleanup.canvases === 0 && cleanup.raf === 0 && cleanup.ghosts === 0, JSON.stringify(cleanup));

  // --- 8. double next() race via API
  const dblNext = await page.evaluate(() => {
    const t = window.__test;
    t.next(); t.next(); // first -> word 2 play; second must be no-op
    return t.state();
  });
  check('double next(): second is no-op on play', dblNext.screen === 'play' && dblNext.wordIndex === 1 && dblNext.placed === '', JSON.stringify({ screen: dblNext.screen, wordIndex: dblNext.wordIndex }));

  // --- 9. tapLetter garbage inputs don't throw
  const garbage = await page.evaluate(() => {
    const t = window.__test;
    try {
      return { ok: true, res: [t.tapLetter(null), t.tapLetter(undefined), t.tapLetter(123), t.tapLetter(''), t.tapLetter('АБ')] };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  check('tapLetter(null/undefined/number/empty/multi) -> false, no throw', garbage.ok && garbage.res.every(r => r === false), JSON.stringify(garbage));

  // --- 10. sound toggle via UI persists; reset restores soundOn
  await page.evaluate(() => window.__test.reset());
  const sndPos = await page.evaluate(() => { const r = document.querySelector('#scrHome .sndbtn').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(sndPos.x, sndPos.y);
  let snd = await page.evaluate(() => ({ s: window.__test.state().soundOn, raw: localStorage.getItem('sglobi-dumata-v1'), gain: master ? master.gain.value : null, btn: document.querySelector('#scrHome .sndbtn').textContent }));
  check('UI: sound toggle -> off, persisted, master gain 0, icon updated', snd.s === false && JSON.parse(snd.raw).soundOn === false && (snd.gain === 0) && snd.btn === '🔇', JSON.stringify(snd));
  await page.reload({ waitUntil: 'load' });
  snd = await page.evaluate(() => window.__test.state().soundOn);
  check('soundOn=false survives reload', snd === false);

  // --- 11. hold-to-reset button: short press must NOT reset; 2s hold must reset
  await page.evaluate(() => { localStorage.setItem('sglobi-dumata-v1', JSON.stringify({ unlocked: 3, stars: [3,2,0,0,0,0,0,0,0,0,0,0], soundOn: true })); });
  await page.reload({ waitUntil: 'load' });
  const rstPos = await page.evaluate(() => { const r = byId('btnReset').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.click(rstPos.x, rstPos.y); // short tap
  await sleep(2300);
  s = await st();
  check('short tap on reset does nothing', s.progress.unlocked === 3, JSON.stringify(s.progress));
  await page.mouse.move(rstPos.x, rstPos.y);
  await page.mouse.down();
  await sleep(2300);
  await page.mouse.up();
  s = await st();
  check('2s hold on reset wipes progress', s.progress.unlocked === 1 && s.progress.stars.every(v => v === 0), JSON.stringify(s.progress));

  // --- 12. drag a correct tile onto slots row (drag support)
  await page.evaluate(() => { window.__test.start(); window.__test.openLevel(1); });
  const dragFrom = await page.evaluate(() => {
    const s0 = window.__test.state();
    const t = [...document.querySelectorAll('#trayRow .tile:not(.taken)')].find(t => t.dataset.l === s0.word[0]);
    const r = t.getBoundingClientRect();
    const sr = document.getElementById('slotsRow').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, sx: sr.x + sr.width / 2, sy: sr.y + sr.height / 2 };
  });
  await page.mouse.move(dragFrom.x, dragFrom.y);
  await page.mouse.down();
  await page.mouse.move(dragFrom.sx, dragFrom.sy, { steps: 8 });
  await page.mouse.up();
  s = await st();
  check('drag correct tile to slots -> placed', s.placed.length === 1, JSON.stringify({ placed: s.placed, word: s.word }));

  // drag a WRONG tile onto slots -> rejected, stays in tray
  const wrongDrag = await page.evaluate(() => {
    const s0 = window.__test.state();
    const exp = s0.word[s0.placed.length];
    const t = [...document.querySelectorAll('#trayRow .tile:not(.taken)')].find(t => t.dataset.l !== exp);
    if (!t) return null;
    const r = t.getBoundingClientRect();
    const sr = document.getElementById('slotsRow').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, sx: sr.x + sr.width / 2, sy: sr.y + sr.height / 2 };
  });
  if (wrongDrag) {
    const before = (await st()).placed;
    await page.mouse.move(wrongDrag.x, wrongDrag.y);
    await page.mouse.down();
    await page.mouse.move(wrongDrag.sx, wrongDrag.sy, { steps: 8 });
    await page.mouse.up();
    s = await st();
    check('drag wrong tile -> rejected, no placement', s.placed === before && s.tray.length + s.placed.length === s.word.length, JSON.stringify({ placed: s.placed, tray: s.tray }));
  }

  check('no console/page errors in pass 2', errors.length === 0, JSON.stringify(errors));
  console.log(log.join('\n'));
  await browser.close();
})().catch(e => { console.log(log.join('\n')); console.error('HARNESS ERROR', e); process.exit(1); });
