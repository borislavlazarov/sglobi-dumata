// Review round 2 — functional verification of round-1 fixes + regressions.
const { launch } = require('./browser');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const out = [];
  const log = (...a) => { out.push(a.join(' ')); console.log(...a); };

  // ---------- TEST A: flyGhost stale callback regression ----------
  {
    const { browser, page, errors } = await launch();
    await page.evaluate(() => { window.__test.reset(); window.__test.start(); window.__test.openLevel(1); });
    // Solve word 1 quickly via tapLetter (uses the real DOM tile -> flyGhost path)
    const word1 = await page.evaluate(() => window.__test.state().word);
    for (const ch of word1) {
      await page.evaluate(c => window.__test.tapLetter(c), ch);
      // no delay -> ghosts in flight
    }
    const st1 = await page.evaluate(() => window.__test.state());
    log('A: after solving word1 screen=', st1.screen, 'word=', st1.word);
    // Immediately move to next word while ghost callbacks (390ms) still pending
    await page.evaluate(() => window.__test.next());
    const word2 = await page.evaluate(() => window.__test.state().word);
    log('A: word2 =', word2);
    await sleep(700); // let any stale flyGhost callbacks fire
    const slots = await page.evaluate(() =>
      [...document.querySelectorAll('#slotsRow .slot')].map(s => ({
        txt: s.textContent, filled: s.classList.contains('filled')
      })));
    log('A: slots of word2 after 700ms:', JSON.stringify(slots));
    const polluted = slots.some(s => s.txt !== '' || s.filled);
    log('A RESULT:', polluted ? 'FAIL — stale letters leaked into next word' : 'PASS — no stale fill');

    // A2: same but solving fast with hintLetter + tap mixing then next, two cycles
    for (let w = 1; w <= 2; w++) {
      const word = await page.evaluate(() => window.__test.state().word);
      for (const ch of word) await page.evaluate(c => window.__test.tapLetter(c), ch);
      await page.evaluate(() => window.__test.next());
    }
    await sleep(700);
    const slots2 = await page.evaluate(() =>
      [...document.querySelectorAll('#slotsRow .slot')].map(s => s.textContent).join(''));
    const stNow = await page.evaluate(() => window.__test.state());
    log('A2: current word', stNow.word, 'placed', JSON.stringify(stNow.placed), 'slots text:', JSON.stringify(slots2));
    log('A2 RESULT:', slots2 === '' ? 'PASS' : 'FAIL');
    log('A console errors:', JSON.stringify(errors));
    await browser.close();
  }

  // ---------- TEST B: sound buttons on win + level-end screens ----------
  {
    const { browser, page } = await launch();
    await page.evaluate(() => { window.__test.reset(); window.__test.start(); window.__test.openLevel(1); });
    // finish word 1
    await page.evaluate(() => {
      const w = window.__test.state().word;
      for (const ch of w) window.__test.tapLetter(ch);
    });
    let scr = await page.evaluate(() => window.__test.state().screen);
    log('B: screen =', scr);
    let btn = await page.evaluate(() => {
      const b = document.querySelector('#scrWin .sndbtn');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { w: r.width, h: r.height, visible: r.width > 0, txt: b.textContent, hit: el === b || b.contains(el) };
    });
    log('B: win sndbtn:', JSON.stringify(btn));
    // click it
    await page.evaluate(() => {
      const b = document.querySelector('#scrWin .sndbtn');
      const r = b.getBoundingClientRect();
      b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + 5, clientY: r.top + 5 }));
    });
    let snd = await page.evaluate(() => ({ on: window.__test.state().soundOn, txt: document.querySelector('#scrWin .sndbtn').textContent }));
    log('B: after toggle on win:', JSON.stringify(snd));
    // does the toggle persist? reload
    await page.reload({ waitUntil: 'load' });
    const sndAfter = await page.evaluate(() => window.__test.state().soundOn);
    log('B: soundOn after reload =', sndAfter, '(expect false)');

    // level end screen
    await page.evaluate(() => { window.__test.start(); window.__test.openLevel(1); });
    for (let w = 0; w < 6; w++) {
      await page.evaluate(() => {
        const word = window.__test.state().word;
        for (const ch of word) window.__test.tapLetter(ch);
        window.__test.next();
      });
    }
    const endVisible = await page.evaluate(() => document.getElementById('scrEnd').classList.contains('active'));
    const endBtn = await page.evaluate(() => {
      const b = document.querySelector('#scrEnd .sndbtn');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { w: r.width, h: r.height, txt: b.textContent, hit: el === b || b.contains(el) };
    });
    log('B: level-end active =', endVisible, 'sndbtn:', JSON.stringify(endBtn), '(icon should be 🔇 since sound off)');
    await browser.close();
  }

  // ---------- TEST C: no ОКО word; emoji-vs-UI-icon spoilers ----------
  {
    const { browser, page } = await launch();
    const spoil = await page.evaluate(() => {
      const res = { hasOko: false, words: [] };
      for (const L of (window.LEVELS || [])) {} // LEVELS not global, scan via test API by opening
      return res;
    });
    // LEVELS is const in closure — check source instead (done outside). Just check level1 words via play-through.
    await page.evaluate(() => { window.__test.reset(); window.__test.start(); window.__test.openLevel(1); });
    const words1 = [];
    for (let w = 0; w < 6; w++) {
      words1.push(await page.evaluate(() => window.__test.state().word));
      await page.evaluate(() => {
        const word = window.__test.state().word;
        for (const ch of word) window.__test.tapLetter(ch);
        window.__test.next();
      });
    }
    log('C: level1 words =', words1.join(','), '— ОКО present?', words1.includes('ОКО'));
    await browser.close();
  }

  // ---------- TEST D: all-levels-completed end state ----------
  {
    const { browser, page, errors } = await launch();
    await page.evaluate(() => { window.__test.reset(); window.__test.start(); });
    for (let lvl = 1; lvl <= 12; lvl++) {
      const ok = await page.evaluate(n => window.__test.openLevel(n), lvl);
      if (!ok) { log('D: FAIL could not open level', lvl); break; }
      for (let w = 0; w < 6; w++) {
        await page.evaluate(() => {
          const word = window.__test.state().word;
          for (const ch of word) window.__test.tapLetter(ch);
        });
        const scr = await page.evaluate(() => window.__test.state().screen);
        if (scr !== 'win') { log('D: FAIL word not completed at level', lvl, 'word', w, 'screen', scr); }
        await page.evaluate(() => window.__test.next());
      }
    }
    const prog = await page.evaluate(() => window.__test.state().progress);
    log('D: final progress =', JSON.stringify(prog));
    // At level-12 end: next-level button must be hidden
    await page.evaluate(() => { window.__test.openLevel(12); });
    for (let w = 0; w < 6; w++) {
      await page.evaluate(() => {
        const word = window.__test.state().word;
        for (const ch of word) window.__test.tapLetter(ch);
        window.__test.next();
      });
    }
    const endState = await page.evaluate(() => ({
      endActive: document.getElementById('scrEnd').classList.contains('active'),
      nextLevelDisplay: getComputedStyle(document.getElementById('btnNextLevel')).display
    }));
    log('D: after finishing level 12:', JSON.stringify(endState), '(nextLevel should be none)');
    await page.evaluate(() => window.__test.next());
    const scrFinal = await page.evaluate(() => window.__test.state().screen);
    log('D: next() from final level-end ->', scrFinal);
    log('D console errors:', JSON.stringify(errors));
    await browser.close();
  }

  console.log('\n===DONE===');
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
