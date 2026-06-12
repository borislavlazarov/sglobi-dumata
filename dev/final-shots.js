// Take final screenshots for the review: home, map, play (obscured picture +
// letter tiles), win (celebration with confetti).
const { launch } = require('./browser');
const path = require('path');
const fs = require('fs');

const SHOTS = path.join(__dirname, 'shots');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { browser, page } = await launch();
  const shot = async (name, settle = 700) => {
    await sleep(settle);
    await page.screenshot({ path: path.join(SHOTS, name + '.png') });
    console.log('shot ' + name + '.png');
  };
  const call = (fn, ...args) => page.evaluate((f, a) => window.__test[f](...a), fn, args);
  const state = () => page.evaluate(() => window.__test.state());

  await call('reset');
  await shot('final-01-home');

  await call('start');
  await shot('final-02-map');

  await call('openLevel', 1);
  let s = await state();
  console.log('play state:', JSON.stringify({ word: s.word, tray: s.tray, reveal: s.reveal }));
  await shot('final-03-play');

  // solve the word -> win screen with confetti
  for (const ch of s.word) await call('tapLetter', ch);
  s = await state();
  console.log('after solve screen=', s.screen, 'reveal=', s.reveal);
  // wait for stars to pop in and confetti to be mid-air
  await shot('final-04-win', 1300);

  await browser.close();
})();
