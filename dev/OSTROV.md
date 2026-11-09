# Островът на Капи (Phase 2) — developer contract

Phase 2 of the Bulgarian kids' game „Сглоби думата". Player: a 6-year-old girl in the
pre-school year. She reads Bulgarian CAPITAL letters and syllables well, is just starting
lowercase and beginner English (A B C D E), basic math. Loves capybaras, princesses,
K-pop/dancing, the Maldives, squishies, drawing. Goal: more educational, beautiful,
engaging — and trains patience/attention. **No timers that pressure, no punishment,
no text instructions (she can't read instructions; everything is icons + spoken audio).**

Runs from `ostrov/index.html` — plain classic `<script>` files (must work from `file://`,
so NO ES modules, NO fetch, NO external resources/CDNs/fonts). Devices: **phone
(portrait 390×844 and landscape 844×390, touch)** and **Windows PC (1366×768+, mouse)**.

## Files
- `ostrov/core.js`, `core.css`, `levels.js`, `index.html` — the shell. **Do not edit.** If
  you need a core change, say so in your final report instead.
- `ostrov/act-<name>.js` — one self-contained file per activity (CSS injected with `Capy.css()`).
- `ostrov/act-demo.js` — tiny working example. Read it and `core.js`/`core.css` first.
- `ostrov/color.js`, `ostrov/pages-N.js` — colouring engine and pages.

## Activity API
```js
'use strict';
(function(){
const U=Capy.util;            // shuffle(a) pick(a) sample(a,n) rnd(lo,hi) wait(ms) el(tag,cls,html)
Capy.css(`.myact-x{...}`);    // prefix ALL your class names with your activity name
Capy.speech('bg',[...]);      // register EVERY string you may ever speak (see Speech)
Capy.registerActivity('name',{
  icon:'📖',                  // emoji shown on the practice button
  start(el,ctx){              // el = empty #stage (flex column, centered, container-type:size)
    ...build DOM in el...
    return function cleanup(){ /* clear timers/intervals/listeners/audio nodes */ };
  }
});
})();
```
`ctx`:
- `ctx.diff` 1..5 (difficulty), `ctx.level` 1..12, `ctx.lower` (bool: lowercase Bulgarian
  letters may be used for reading text; if false use ALL CAPS), `ctx.enLetters`
  (array of English capital letters the child currently knows, ≥3, default A–E).
- `ctx.prompt(lang,text)` — speak the instruction; the 👂 button replays it. Call at the
  start of the round and whenever the task changes.
- `ctx.say(lang,text)` → Promise (resolves when finished, or quickly if audio unavailable/muted). 
- `ctx.right(el)` — a question answered correctly: plays sound, adds `.ok` to el, sparkles,
  advances the „calm streak" (5 in a row → child earns a 🐚). Call ~3–6 times per round.
- `ctx.wrong(el)` — a mistake: soft sound, shake, resets streak, counts toward level stars.
  3 wrongs within 3.5 s make Capy fall asleep (core overlay, blocks input ~4 s) — this is the
  anti-random-tapping mechanic; you don't need to handle it.
- `ctx.done()` — the round is complete; call exactly once (after your last `ctx.right` and
  after awaiting any final speech). Core celebrates and moves on; stop accepting input.
- `ctx.mascot('joy'|'sad')`, `ctx.sparkle(el)`.

A **round** should last roughly **45–75 seconds**: usually 3–5 questions/puzzles of the same
kind, or one bigger board. Content is picked randomly from pools so replays differ; never
repeat the same item within a round. A wrong answer never ends a question — the child
retries until right (after 2 wrongs on one question, hint gently, e.g. dim a wrong option).

## Speech
All speech is pre-generated mp3 (ElevenLabs) keyed by exact `(lang,text)`; a build script
collects everything registered through `Capy.speech(lang, arrayOfStrings)` at load time.
So: only speak strings from a **static registered list** (no runtime string building unless
every possible result is registered). lang is `'bg'` or `'en'`. Write Bulgarian numbers as
words („седем"), natural sentences with punctuation. Instructions are short, warm,
second person singular („Намери…", „Колко са?"). Keep it under ~250 unique strings.
**Reading tasks: never speak the text the child must read before she answers** — speak it
after the correct answer as reinforcement.

## Look & layout
Use the shared classes from `core.css`: `.card` (+ `.pic` emoji card, `.letter`, `.word`),
`.phrase` (+`.big`), `.row`, states `.ok` `.no` `.dim`; CSS vars `--ink --coral --pink
--purple --green --yellow --blue --sand --r --shadow --tap --txt --txt-big --u`.
Use `<button>` for tappables (min size `var(--tap)`). `#stage` is a size container: size
things with `cqw/cqh/cqmin` so the layout **fills the stage** on a tall phone and a wide PC
alike (no tiny cluster in the middle, no overflow/scroll, nothing under the small Capy
mascot in the bottom-left ~110px corner on wide screens is critical). Pictures are emoji —
use only widely supported ones (Unicode ≤ 12, no new 2020+ emoji; they must render on
Windows 10 and Android). There is **no capybara emoji** — use `Capy.capySVG()` (returns an
`<svg class="capy">` string; width follows its container; classes `joy sad sleep dance
moonwalk` animate it). Bright, toy-like, rounded, generous; subtle animations
(transform/opacity only). Mark the correct option(s) in the DOM with `data-ok="1"` so tests
can play it.

## Dev & verification (required before you report)
- Sandbox URL: `ostrov/index.html?act=<name>&diff=<1..5>` runs endless rounds of your activity.
- Screenshot: `cd dev && node ostrov-shot.js "act=<name>&diff=3" shots/<name>-3.png 390 844 600 [selector-to-click | ms-to-wait ...]`
  (args: query, out, width, height, initial wait ms, then clicks/waits). It prints JS errors.
  **Look at your screenshots** (Read the png) at 390×844, 844×390 and 1366×768 for diff 1, 3, 5.
- Write `dev/ostrov-<name>.test.js` (puppeteer-core, chromium at `/usr/bin/chromium-browser`,
  args `--no-sandbox`; see `dev/ostrov-shot.js`) that, for each diff 1..5, plays one full round
  to completion using `data-ok`, asserts `window.__capy.run.i` advanced and no page errors,
  and exits non-zero on failure. Run it and make it pass.
- Do not git commit. Do not touch files outside your own. Final report: ≤10 lines — files,
  what each diff does, speech string count, anything you could not finish or core changes needed.
