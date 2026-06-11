// Shared helper: launch system chromium against the game file.
// Usage: const { launch } = require('./browser'); const { browser, page, errors } = await launch();
const puppeteer = require('puppeteer-core');
const path = require('path');

const GAME_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

async function launch(opts = {}) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars',
           `--window-size=${opts.width || 1280},${opts.height || 800}`],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width || 1280, height: opts.height || 800 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('[console.error] ' + m.text()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  await page.goto(GAME_URL, { waitUntil: 'load' });
  return { browser, page, errors, GAME_URL };
}

module.exports = { launch, GAME_URL };
