/* Регресионен тест за трите находки от ревю-рунд №2:
   1. [critical] tiles: всяка вярна буква маха поне една плочка (вкл. 8-буквени думи)
   2. [major]   плочките никога не падат под 64px и таблата се пренася балансирано
   3. [minor]   номерата върху светлите възли на картата са тъмни (контраст)        */
const { launch } = require('./browser');

let pass = 0, fail = 0;
const ok = (cond, msg) => { cond ? pass++ : fail++; console.log((cond ? 'PASS' : 'FAIL') + ' | ' + msg); };

const UNLOCK_ALL = JSON.stringify({ unlocked: 12, stars: Array(12).fill(3), soundOn: true });

async function freshPage(width, height) {
  const ctx = await launch({ width, height });
  await ctx.page.evaluateOnNewDocument(k => localStorage.setItem('sglobi-dumata-v1', k), UNLOCK_ALL);
  await ctx.page.reload({ waitUntil: 'load' });
  return ctx;
}

const isTilesMode = page => page.evaluate(() =>
  document.getElementById('tilesOverlay').classList.contains('on'));
const goneCount = page => page.evaluate(() =>
  document.querySelectorAll('#tilesOverlay .gone').length);

// довършва текущата дума, проверявайки tiles-инварианта ако режимът е tiles
async function playWord(page, checkTiles) {
  const word = await page.evaluate(() => window.__test.state().word);
  let prevGone = checkTiles ? await goneCount(page) : 0;
  for (let i = 0; i < word.length; i++) {
    const acc = await page.evaluate(ch => window.__test.tapLetter(ch), word[i]);
    if (!acc) return { ok: false, why: `буква ${word[i]} (${i + 1}/${word.length}) отказана в ${word}` };
    if (checkTiles && i < word.length - 1) { // последната буква -> win екран, там reveal=1
      const g = await goneCount(page);
      if (g < prevGone + 1)
        return { ok: false, why: `${word}: буква №${i + 1} не маха плочка (gone ${prevGone}→${g})` };
      prevGone = g;
    }
  }
  return { ok: true, word };
}

(async () => {
  // ---------- 1. tiles reveal: L8 и L9 (детерминирано tiles) ----------
  let { browser, page, errors } = await freshPage(1280, 800);
  await page.evaluate(() => { window.__test.start(); });

  for (const lvl of [8, 9]) {
    await page.evaluate(n => window.__test.openLevel(n), lvl);
    for (let w = 0; w < 6; w++) {
      ok(await isTilesMode(page), `L${lvl} дума ${w + 1}: режим tiles активен`);
      const r = await playWord(page, true);
      ok(r.ok, `L${lvl} дума ${w + 1} (${r.word || ''}): всяка буква маха плочка${r.ok ? '' : ' — ' + r.why}`);
      await page.evaluate(() => window.__test.next());
    }
    await page.evaluate(() => { const s = window.__test.state(); if (s.screen !== 'map') window.__test.next(); });
  }

  // ---------- 1б. лов на 8-буквена дума в режим tiles (L11/L12 mix) ----------
  let found8 = 0, attempts = 0;
  while (found8 < 3 && attempts < 40) {
    attempts++;
    const lvl = 11 + (attempts % 2);
    await page.evaluate(n => window.__test.openLevel(n), lvl);
    for (let w = 0; w < 6; w++) {
      const st = await page.evaluate(() => window.__test.state());
      if (st.word && st.word.length === 8 && await isTilesMode(page)) {
        found8++;
        const r = await playWord(page, true);
        ok(r.ok, `8-буквена tiles дума ${r.word || st.word} (L${lvl}): всяка буква маха плочка${r.ok ? '' : ' — ' + r.why}`);
        if (found8 >= 3) break;
      } else {
        const r = await playWord(page, false);
        if (!r.ok) { ok(false, 'неуспешно превъртане: ' + r.why); break; }
      }
      await page.evaluate(() => window.__test.next());
      const sc = await page.evaluate(() => window.__test.state().screen);
      if (sc !== 'play') break;
    }
  }
  ok(found8 >= 3, `намерени и проверени ${found8}/3 осембуквени tiles думи (${attempts} опита)`);
  await browser.close();

  // ---------- 2. размер на плочките + балансирано пренасяне ----------
  for (const [W, H, label] of [[810, 1080, 'портрет 810×1080'], [1024, 768, '1024×768'], [1280, 800, '1280×800']]) {
    const c = await freshPage(W, H);
    await c.page.evaluate(() => { window.__test.start(); window.__test.openLevel(12); });
    // стигаме до 8-буквена дума (8+4 излишни = 12 плочки — най-широкият случай)
    for (let w = 0; w < 6; w++) {
      const len = await c.page.evaluate(() => window.__test.state().word.length);
      if (len === 8) break;
      const r = await playWord(c.page, false);
      if (!r.ok) { ok(false, `${label}: превъртане към 8-буквена дума — ` + r.why); break; }
      await c.page.evaluate(() => window.__test.next());
    }
    await c.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const m = await c.page.evaluate(() => {
      const tiles = [...document.querySelectorAll('#trayRow .tile:not(.taken)')];
      const widths = tiles.map(t => parseFloat(getComputedStyle(t).width));
      const rows = {};
      tiles.forEach(t => { const top = Math.round(t.offsetTop / 10) * 10; rows[top] = (rows[top] || 0) + 1; });
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      return { n: tiles.length, minW: Math.min(...widths), rows: Object.values(rows), overflow };
    });
    ok(m.n === 12, `${label}: L12 има 12 плочки (${m.n})`);
    ok(m.minW >= 64, `${label}: мин. ширина на плочка ${m.minW}px >= 64px`);
    ok(Math.max(...m.rows) - Math.min(...m.rows) <= 1, `${label}: балансирани редове [${m.rows.join('+')}]`);
    ok(!m.overflow, `${label}: няма хоризонтален overflow`);
    await c.browser.close();
  }

  // ---------- 3. контраст на номерата върху светлите възли ----------
  const c3 = await freshPage(1280, 800);
  await c3.page.evaluate(() => { window.__test.start(); });
  const colors = await c3.page.evaluate(() => {
    const out = [];
    for (const cls of ['c1', 'c2', 'c3']) {
      const node = document.querySelector('.lnode.' + cls + ' .num');
      if (node) out.push({ cls, color: getComputedStyle(node).color });
    }
    return out;
  });
  ok(colors.length === 3, `намерени възли c1/c2/c3 на картата (${colors.length})`);
  for (const { cls, color } of colors)
    ok(color === 'rgb(107, 66, 38)', `възел ${cls}: номерът е тъмнокафяв (${color})`);
  ok(c3.errors.length === 0, 'нула console/page грешки: ' + (c3.errors.join('; ') || 'чисто'));
  await c3.browser.close();

  console.log(`\n=== РЕЗУЛТАТ: ${pass} PASS, ${fail} FAIL ===`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
