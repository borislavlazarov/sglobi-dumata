// Debug: do real mouse pointer events reach the tiles? What cancels the reset hold?
const { launch } = require('./browser');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const { browser, page, errors } = await launch();

  // open level 1 via API, wait for popin to finish
  await page.evaluate(() => { window.__test.start(); window.__test.openLevel(1); });
  await sleep(800);

  // instrument: log all pointer events on the first tile and on document
  await page.evaluate(() => {
    window.__evts = [];
    const tile = document.querySelector('#trayRow .tile');
    ['pointerdown','pointerup','pointermove','pointercancel','gotpointercapture','lostpointercapture','click'].forEach(t => {
      tile.addEventListener(t, e => window.__evts.push('tile:' + t + ':id' + e.pointerId + ':' + e.pointerType));
      document.addEventListener(t, e => window.__evts.push('doc:' + t + ':tgt=' + (e.target.className || e.target.tagName)), true);
    });
    const r = tile.getBoundingClientRect();
    window.__tilePos = { x: r.x + r.width / 2, y: r.y + r.height / 2, l: tile.dataset.l, w: r.width, h: r.height };
  });
  const pos = await page.evaluate(() => window.__tilePos);
  console.log('tile pos:', JSON.stringify(pos));
  await page.mouse.click(pos.x, pos.y);
  await sleep(200);
  let evts = await page.evaluate(() => ({ evts: window.__evts, state: window.__test.state(), errStreak: S.errStreak }));
  console.log('after click:', JSON.stringify(evts, null, 1));

  // elementFromPoint check
  const efp = await page.evaluate(p => {
    const el = document.elementFromPoint(p.x, p.y);
    return el ? el.className + ' / ' + el.tagName : 'null';
  }, pos);
  console.log('elementFromPoint at tile center:', efp);

  // try dispatching synthetic PointerEvents directly
  const synth = await page.evaluate(() => {
    const s0 = window.__test.state();
    const exp = s0.word[s0.placed.length];
    const tile = [...document.querySelectorAll('#trayRow .tile:not(.taken)')].find(t => t.dataset.l === exp);
    const r = tile.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, pointerId: 7, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, pointerType: 'touch', isPrimary: true };
    tile.dispatchEvent(new PointerEvent('pointerdown', opts));
    tile.dispatchEvent(new PointerEvent('pointerup', opts));
    return window.__test.state().placed;
  });
  console.log('after synthetic pointerdown+up placed:', synth);

  // reset-hold instrumentation
  await page.evaluate(() => { window.__test.start(); });
  await page.evaluate(() => {
    window.__revts = [];
    const b = document.getElementById('btnReset');
  });
  await page.evaluate(() => { window.__test.reset(); }); // go home
  await page.evaluate(() => {
    window.__revts = [];
    const b = document.getElementById('btnReset');
    ['pointerdown','pointerup','pointerleave','pointercancel'].forEach(t =>
      b.addEventListener(t, e => window.__revts.push(t + ':' + e.pointerType)));
    // also stamp setTimeout firing
    window.__held = false;
  });
  const rp = await page.evaluate(() => { const r = document.getElementById('btnReset').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(rp.x, rp.y);
  await page.mouse.down();
  await sleep(2400);
  await page.mouse.up();
  const rres = await page.evaluate(() => ({ revts: window.__revts, holding: document.getElementById('btnReset').className }));
  console.log('reset hold events:', JSON.stringify(rres));
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
