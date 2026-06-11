// Автоматизирана валидация на index.html през тестовия API.
const { launch } = require('/home/blazarov/projects/emma/dev/browser');

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('ok  - ' + name); }
  else { failures++; console.log('FAIL - ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { browser, page, errors } = await launch();
  const api = (expr) => page.evaluate(expr);
  const st = () => api('window.__test.state()');

  check('window.__test съществува', await api('typeof window.__test === "object" && typeof window.__test.state === "function"'));

  let s = await st();
  check('начален екран home', s.screen === 'home', s);
  check('начален progress.unlocked=1', s.progress.unlocked === 1, s.progress);
  check('home: нулеви полета', s.level === null && s.wordIndex === null && s.word === null && s.placed === '' && s.tray.length === 0 && s.hintsUsed === 0 && s.reveal === 0, s);

  await api('window.__test.start()');
  s = await st();
  check('start() -> map', s.screen === 'map', s);

  check('openLevel(2) заключено -> false', (await api('window.__test.openLevel(2)')) === false);
  s = await st();
  check('след отказан openLevel оставаме на map', s.screen === 'map', s);

  check('openLevel(1) -> true', (await api('window.__test.openLevel(1)')) === true);
  s = await st();
  check('play, ниво 1, дума 0', s.screen === 'play' && s.level === 1 && s.wordIndex === 0, s);
  check('дума ЛЪВ', s.word === 'ЛЪВ', s.word);
  check('табла = 3 плочки (0 излишни)', s.tray.length === 3, s.tray);
  check('reveal начален 0.1', Math.abs(s.reveal - 0.1) < 1e-9, s.reveal);

  // грешна буква (втората от думата, подадена преждевременно)
  check('tapLetter(грешна) -> false', (await api(`window.__test.tapLetter(${JSON.stringify(s.word[1])})`)) === false);
  s = await st();
  check('грешката не променя placed', s.placed === '', s);
  check('tapLetter(липсваща) -> false', (await api('window.__test.tapLetter("Ю")')) === false);

  // вярна буква
  check('tapLetter(Л) -> true', (await api('window.__test.tapLetter("Л")')) === true);
  s = await st();
  check('placed=Л, tray намалява', s.placed === 'Л' && s.tray.length === 2, s);
  check('reveal порасна', s.reveal > 0.1 && s.reveal <= 0.95, s.reveal);

  // двойно докосване: повторно Л вече е невярно/липсва
  check('двойно докосване не поставя втори път', (await api('window.__test.tapLetter("Л")')) === false);
  s = await st();
  check('placed остава Л', s.placed === 'Л', s.placed);

  await api('window.__test.tapLetter("Ъ")');
  await api('window.__test.tapLetter("В")');
  s = await st();
  check('думата завършена -> win', s.screen === 'win' && s.placed === 'ЛЪВ' && s.reveal === 1, s);

  // подсказки на следващата дума
  await api('window.__test.next()');
  s = await st();
  check('next() -> play, дума 1 (КОН)', s.screen === 'play' && s.wordIndex === 1 && s.word === 'КОН', s);
  const r0 = s.reveal;
  await api('window.__test.hintEye()');
  s = await st();
  check('hintEye: reveal +0.38, hintsUsed=1', Math.abs(s.reveal - Math.min(0.95, r0 + 0.38)) < 1e-9 && s.hintsUsed === 1, s);
  await api('window.__test.hintLetter()');
  s = await st();
  check('hintLetter: placed=К, hintsUsed=2', s.placed === 'К' && s.hintsUsed === 2, s);
  await api('window.__test.hintEye()');
  s = await st();
  check('трета подсказка е no-op', s.hintsUsed === 2, s);

  // next() извън win е no-op
  await api('window.__test.next()');
  s = await st();
  check('next() извън win е no-op', s.screen === 'play' && s.placed === 'К', s);

  // целият път: изиграваме всичките 12 нива чрез API (вкл. ОКО и БАРАБАН с дублирани букви)
  const full = await api(`(async () => {
    const T = window.__test;
    const out = { fails: [] };
    for (let lvl = 1; lvl <= 12; lvl++) {
      if (!T.openLevel(lvl)) { out.fails.push('openLevel ' + lvl); break; }
      for (let w = 0; w < 6; w++) {
        let s = T.state();
        if (s.screen !== 'play' || s.wordIndex !== w) { out.fails.push('not play L' + lvl + ' w' + w + ' ' + s.screen); return out; }
        const word = s.word;
        for (const ch of word) {
          if (!T.tapLetter(ch)) { out.fails.push('tap отказ ' + word + ' буква ' + ch); return out; }
        }
        s = T.state();
        if (s.screen !== 'win' || s.placed !== word || s.reveal !== 1) { out.fails.push('no win ' + word); return out; }
        T.next();
      }
      let s = T.state();
      if (!(s.screen === 'win' && s.level === lvl && s.wordIndex === null && s.word === null && s.placed === '' && s.tray.length === 0 && s.hintsUsed === 0 && s.reveal === 1)) {
        out.fails.push('level-end състояние L' + lvl + ' ' + JSON.stringify(s));
      }
      T.next();
      s = T.state();
      if (s.screen !== 'map') out.fails.push('после не е map L' + lvl);
    }
    out.final = T.state();
    return out;
  })()`);
  check('пълна игра 12 нива без откази', full.fails.length === 0, full.fails);
  check('накрая unlocked=12', full.final && full.final.progress.unlocked === 12, full.final && full.final.progress);
  check('всички нива по 3 звезди', full.final && full.final.progress.stars.every(v => v === 3), full.final && full.final.progress.stars);

  // персистентност след презареждане
  await page.reload({ waitUntil: 'load' });
  s = await st();
  check('след reload: home + запазен прогрес', s.screen === 'home' && s.progress.unlocked === 12 && s.progress.stars[0] === 3, s);

  // звук — превключване и запазване
  const snd0 = s.soundOn;
  await page.click('#scrHome .sndbtn');
  s = await st();
  check('звук бутон превключва', s.soundOn === !snd0, s.soundOn);
  await page.reload({ waitUntil: 'load' });
  s = await st();
  check('звук се помни след reload', s.soundOn === !snd0, s.soundOn);
  await page.click('#scrHome .sndbtn'); // върни

  // UI: клик по бутона играй + възел на картата + плочка
  await page.click('#btnPlay');
  s = await st();
  check('UI: играй -> map', s.screen === 'map', s);
  const nodes = await page.$$('.lnode');
  await nodes[0].click();
  s = await st();
  check('UI: възел 1 -> play', s.screen === 'play' && s.level === 1, s);
  const first = s.word[0];
  await new Promise(r => setTimeout(r, 700)); // изчакай pop-in анимацията на плочките (козметика)
  await page.click(`#trayRow .tile[data-l="${first}"]`);
  s = await st();
  check('UI: клик по плочка поставя буква', s.placed === first, s);

  // reset
  await api('window.__test.reset()');
  s = await st();
  check('reset() -> home, прогрес изтрит', s.screen === 'home' && s.progress.unlocked === 1 && s.progress.stars.every(v => v === 0), s);

  // изчакай малко да минат анимации/конфети и провери за грешки
  await new Promise(r => setTimeout(r, 800));
  check('няма page/console грешки', errors.length === 0, errors);

  await browser.close();
  console.log(failures === 0 ? '\nВСИЧКИ ПРОВЕРКИ МИНАВАТ' : `\n${failures} ПРОВАЛЕНИ ПРОВЕРКИ`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
