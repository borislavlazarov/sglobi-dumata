// Regression test for РОДИТЕЛСКИ РЕЖИМ (parent/test mode) via window.__test.
// Lets a parent unlock any level and skip words while testing. Run:
//   node /home/blazarov/projects/emma/sglobi-dumata/dev/parent.test.js
const { launch } = require('./browser');

let passCount = 0, failCount = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) { passCount++; console.log(`PASS  ${name}`); }
  else { failCount++; failures.push(name + (detail ? ` — ${detail}` : '')); console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const { browser, page, errors } = await launch();
  const call = (fn, ...args) => page.evaluate((f, a) => window.__test[f](...a), fn, args);
  const state = () => page.evaluate(() => window.__test.state());
  const ui = () => page.evaluate(() => ({
    badge: document.getElementById('parentBadge').classList.contains('on'),
    skip: document.getElementById('btnParentSkip').classList.contains('on'),
    locked: document.querySelectorAll('#mapArea .lnode.locked').length,
    nodes: document.querySelectorAll('#mapArea .lnode').length,
  }));

  try {
    check('1a. page loads without errors', errors.length === 0, errors.join(' | '));
    await call('reset');
    let s = await state();
    check('2a. fresh: parent mode off, only level 1 unlocked',
      s.parent === false && s.progress.unlocked === 1, JSON.stringify({ p: s.parent, u: s.progress.unlocked }));

    // locked level cannot be opened while parent mode is off
    check('2b. openLevel(16) refused when locked & not parent', (await call('openLevel', 16)) === false);

    // turn parent mode ON
    await call('setParent', true);
    await call('start'); // -> map, re-rendered with all unlocked
    s = await state();
    let u = await ui();
    check('3a. parentState() === true', (await call('parentState')) === true);
    check('3b. badge visible in parent mode', u.badge === true, JSON.stringify(u));
    check('3c. all 16 map nodes unlocked (0 locked)', u.nodes === 16 && u.locked === 0, JSON.stringify(u));

    // jump straight into a far level despite unlocked === 1
    const jumped = await call('openLevel', 16);
    s = await state();
    check('4a. openLevel(16) allowed in parent mode (no grinding)',
      jumped === true && s.screen === 'play' && s.level === 16, `ret=${jumped} screen='${s.screen}'`);
    u = await ui();
    check('4b. skip button visible during play in parent mode', u.skip === true, JSON.stringify(u));

    // skip the word instantly -> win
    const word = s.word;
    const skipped = await call('skipWord');
    s = await state();
    check('5a. skipWord() instantly solves -> win', skipped === true && s.screen === 'win', `screen='${s.screen}'`);
    check('5b. skipped word fully placed, reveal 1', s.placed === word && s.reveal === 1,
      `placed='${s.placed}' word='${word}' reveal=${s.reveal}`);
    u = await ui();
    check('5c. skip button hidden on win screen', u.skip === false, JSON.stringify(u));

    // skip remaining 5 words to clear the whole level quickly
    let cleared = true;
    for (let w = 1; w < 6; w++) {
      await call('next');
      let sw = await state();
      if (sw.screen !== 'play') { cleared = false; break; }
      const ok = await call('skipWord');
      sw = await state();
      if (!ok || sw.screen !== 'win') { cleared = false; break; }
    }
    check('6a. all 6 words of level 16 skipped to win', cleared);
    await call('next'); // -> level-end
    s = await state();
    check('6b. skipping a level still unlocks the next (progress works)',
      s.progress.unlocked >= 16, `unlocked=${s.progress.unlocked}`);

    // turn parent mode OFF -> gating restored
    await call('setParent', false);
    await call('reset'); // reset also clears parent
    s = await state();
    check('7a. reset() turns parent mode off', s.parent === false);
    u = await ui();
    check('7b. badge hidden after reset', u.badge === false, JSON.stringify(u));
    check('7c. openLevel(16) refused again after reset', (await call('openLevel', 16)) === false);

    check('1b. no console/page errors during whole session', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('0. test run completed without exception', false, e.stack || String(e));
  } finally {
    await browser.close();
  }

  console.log(`\n==== SUMMARY: ${passCount} passed, ${failCount} failed ====`);
  if (failures.length) { console.log('Failures:'); for (const f of failures) console.log('  - ' + f); }
  process.exitCode = failCount ? 1 : 0;
})();
