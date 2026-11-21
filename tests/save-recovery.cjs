const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'js/state.js'), 'utf8');
const key = 'rika_quest_save_v1';
const older = JSON.stringify({
  schema: 1, player: {name: 'Returning', exp: 900, equipped: {sword: 'sol_sword'}},
  owned: {equipment: ['sol_sword'], items: {}, monsters: {defeated: ['soltin']}},
  progress: {g5_u01: {basicCleared: true}}, settings: {}
}, null, 2);

function store(primary) {
  const rows = new Map(primary === undefined ? [] : [[key, primary]]);
  return {
    rows, writes: [],
    getItem(k) {
      if (this.failRead === k) throw Error('read denied');
      return rows.get(k) ?? null;
    },
    setItem(k, text) {
      const used = Array.from(rows.values()).reduce((n, value) => n + value.length, 0);
      if (this.failWrite === k || used - (rows.get(k) || '').length + text.length > this.limit) throw Error('quota');
      this.writes.push(k);
      rows.set(k, String(text));
    }
  };
}

function tab(storage) {
  const window = {CURRICULUM: [{unitId: 'g5_u01', grade: 5, unitNo: 1}], EQUIPMENT: {sol_sword: {slot: 'sword'}}, COMPANIONS: {}};
  vm.runInNewContext(code, {window, localStorage: storage});
  window.RikaState.load();
  return window.RikaState;
}

test('first visit is read-only; migration checkpoints exact source bytes without rewriting the main key', () => {
  const empty = store(), fresh = tab(empty);
  assert.equal(fresh.get().player.exp, 0);
  assert.equal(fresh.getHero(), 'aoi');
  assert.equal(Object.hasOwn(fresh.get().player, 'heroId'), false);
  assert.deepEqual(empty.writes, []);
  const storage = store(older), state = tab(storage);
  assert.deepEqual(storage.writes, [state.COPY_KEY]);
  assert.equal(storage.getItem(key), older);
  assert.equal(storage.getItem(state.COPY_KEY), older);
  assert.equal(state.get().schema, 2);
  assert.equal(state.getHero(), 'aoi');
  assert.equal(state.get().progress.g5_u01.basicCleared, true);
  assert.deepEqual(Object.keys(state.get().owned.items), []);
  state.load();
  assert.deepEqual(storage.writes, [state.COPY_KEY]);
  state.addExp(5);
  assert.equal(JSON.parse(storage.getItem(key)).player.exp, 905);
  assert.equal(storage.getItem(key), storage.getItem(state.COPY_KEY));
  const migrated = tab(storage).get();
  assert.equal(migrated.player.name, 'Returning');
  assert.equal(Object.hasOwn(migrated.player, 'heroId'), false);
  assert.equal(migrated.player.equipped.sword, 'sol_sword');
  assert.equal(migrated.owned.monsters.defeated[0], 'soltin');
  assert.equal(migrated.owned.items.potion, undefined);
  assert.equal(migrated.settings.lastGrade, 5);
  assert.equal(migrated.progress.g5_u01.basicCleared, true);
});

test('missing and unrecognized heroes are display defaults, not reasons to rewrite or reset a save', () => {
  for (const heroId of [undefined, null, 'unknown', '__proto__', 1, ['jin']]) {
    const record = JSON.parse(older);
    record.schema = 2;
    record.player.heroId = heroId;
    const raw = JSON.stringify(record), storage = store(raw), state = tab(storage);
    assert.equal(state.getHero(), 'aoi');
    assert.equal(Object.hasOwn(state.get().player, 'heroId'), false);
    assert.equal(state.get().player.exp, 900);
    assert.equal(state.setHero(heroId), false);
    assert.equal(storage.getItem(key), raw);
    assert.equal(storage.getItem(state.COPY_KEY), raw);
    assert.deepEqual(storage.writes, [state.COPY_KEY]);
  }
});

test('selecting any hero preserves migrated game data, live references and export/import round trips', () => {
  const legacy = JSON.parse(older);
  legacy.activeSession = {sessionId: 's1', index: 1, questions: [{id: 'q1', choices: ['a', 'b']}]};
  legacy.rewardedSessions = ['s0'];
  legacy.questionStats = {q1: {seen: 2, correct: 1}};
  legacy.optionalSection = {revision: 7};
  legacy.player.optionalField = ['keep'];
  const storage = store(JSON.stringify(legacy)), state = tab(storage), data = state.get();
  const {player, activeSession} = data;
  const expected = JSON.parse(state.exportData());
  for (const id of ['jin', 'sora', 'mio', 'ritsu', 'nagi', 'aoi']) {
    assert.equal(state.setHero(id), true);
    assert.equal(state.get(), data);
    assert.equal(state.get().player, player);
    assert.equal(state.get().activeSession, activeSession);
    assert.equal(state.getHero(), id);
    expected.player.heroId = id;
    const raw = storage.getItem(key);
    assert.deepEqual(JSON.parse(raw), {...legacy, player: {...legacy.player, heroId: id}});
    assert.equal(storage.getItem(state.COPY_KEY), raw);
    const resumed = tab(storage);
    assert.equal(resumed.getHero(), id);
    const imported = tab(store());
    assert.ok(imported.importData(resumed.exportData()));
    assert.deepEqual(JSON.parse(imported.exportData()), expected);
  }
  assert.deepEqual([...storage.rows.keys()], [key, key + '_protected']);
});

test('a hero-only write cannot mask a failed gameplay save or strand pending progress on reload', () => {
  const storage = store(older), state = tab(storage);
  storage.failWrite = key;
  state.addExp(35);
  delete storage.failWrite;
  assert.equal(state.setHero('sora'), false);
  assert.equal(state.saveIssue(), 'write');
  assert.equal(state.isPersisted(), false);
  assert.equal(state.getHero(), 'aoi');
  assert.equal(state.get().player.exp, 935);
  assert.equal(JSON.parse(state.exportData()).player.exp, 935);
  assert.deepEqual([...storage.rows.values()], [older, older]);
  assert.equal(state.save(), true);
  assert.equal(state.setHero('sora'), true);
  const resumed = tab(storage);
  assert.equal(resumed.get().player.exp, 935);
  assert.equal(resumed.getHero(), 'sora');
});

test('rejected selections leave both the live appearance and previously committed bytes alone', () => {
  const storage = store(older), state = tab(storage);
  for (const previous of [undefined, 'sora']) {
    if (previous) assert.equal(state.setHero(previous), true);
    const before = state.exportData(), raw = storage.getItem(key), writes = storage.writes.slice();
    storage.failWrite = key;
    assert.equal(state.setHero('jin'), false);
    assert.equal(state.saveIssue(), 'write');
    assert.equal(state.getHero(), previous || 'aoi');
    assert.equal(state.setHero('invalid'), false);
    assert.equal(state.exportData(), before);
    assert.deepEqual(storage.writes, writes);
    assert.equal(storage.getItem(key), raw);
    assert.equal(storage.getItem(state.COPY_KEY), raw);
    delete storage.failWrite;
  }
  const raw = storage.getItem(key);
  storage.failWrite = state.COPY_KEY;
  assert.equal(state.setHero('jin'), true, 'the primary write committed');
  assert.equal(state.getHero(), 'jin');
  assert.equal(state.saveIssue(), 'copy');
  assert.equal(storage.getItem(state.COPY_KEY), raw);
  const reload = tab(storage);
  assert.equal(reload.needsChoice(), true);
  assert.equal(reload.setHero('aoi'), false);
  assert.equal(reload.getHero(), 'jin');
  assert.equal(storage.getItem(state.COPY_KEY), raw);
});

test('a cached pre-guard state script is never asked to load or create a save', () => {
  let boot;
  const app = {focus() {}};
  const window = {RikaState: {load() { assert.fail('old loader may overwrite the original'); }}};
  const document = {getElementById() { return app; }, addEventListener(name, fn) { boot = fn; }};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/main.js'), 'utf8'), {window, document});
  boot();
  assert.match(app.innerHTML, /再読み込み/);
});

test('unreadable, structurally invalid and unsupported records remain byte-exportable, including empty string', () => {
  for (const text of ['', '{bad', '{"schema":99}', older.replace('"schema": 1', '"schema": 22'),
    JSON.stringify({...JSON.parse(older), owned: []}),
    JSON.stringify({...JSON.parse(older), progress: {not_in_this_catalog: {basicCleared: true}}})]) {
    const storage = store(text), state = tab(storage);
    assert.equal(state.saveIssue(), 'invalid');
    assert.equal(state.setHero('jin'), false);
    assert.equal(state.getHero(), 'aoi');
    assert.equal(state.setName('Changed'), false);
    assert.equal(state.exportData(), text);
    assert.deepEqual(storage.writes, []);
    assert.throws(() => state.importData('null'));
    assert.equal(storage.getItem(key), text);
  }
});

test('out-of-date tabs cannot overwrite newer progress, including import and confirmed reset', () => {
  const storage = store(), first = tab(storage), second = tab(storage);
  first.addExp(300);
  const committed = storage.getItem(key);
  second.addExp(10);
  assert.equal(second.saveIssue(), 'stale');
  assert.equal(second.setHero('jin'), false);
  assert.equal(second.getHero(), 'aoi');
  assert.equal(JSON.parse(second.exportData()).player.exp, 10);
  assert.equal(second.reset(), false);
  assert.equal(second.importData(older), null);
  assert.equal(storage.getItem(key), committed);
  assert.equal(storage.getItem(first.COPY_KEY), committed);
  second.load();
  assert.equal(second.get().player.exp, 300);
  storage.rows.clear();
  assert.equal(second.save(), false);
  assert.equal(storage.rows.size, 0);
});

test('hero downgrade: a primary-only old writer leaves a choice; an old two-key writer drops only the preference', () => {
  for (const bothKeys of [false, true]) {
    const storage = store(older), previouslyOpen = tab(storage), current = tab(storage);
    assert.equal(current.setHero('sora'), true);
    const selected = storage.getItem(key);
    previouslyOpen.addExp(10);
    assert.equal(previouslyOpen.saveIssue(), 'stale');
    assert.equal(storage.getItem(key), selected);
    assert.equal(storage.getItem(current.COPY_KEY), selected);
    // A legacy normalizer rebuilds player from known fields before saving more progress.
    const downgraded = JSON.parse(selected);
    delete downgraded.player.heroId;
    downgraded.player.exp += 25;
    const legacyRaw = JSON.stringify(downgraded);
    storage.rows.set(key, legacyRaw);
    if (bothKeys) storage.rows.set(current.COPY_KEY, legacyRaw);
    assert.equal(current.setHero('jin'), false);
    assert.equal(current.getHero(), 'sora');
    assert.equal(current.saveIssue(), 'stale');
    const writes = storage.writes.slice(), reader = tab(storage);
    assert.deepEqual(storage.writes, writes);
    assert.equal(reader.getHero(), 'aoi');
    assert.equal(reader.get().player.exp, 925);
    assert.equal(reader.get().player.equipped.sword, 'sol_sword');
    assert.equal(reader.get().progress.g5_u01.basicCleared, true);
    assert.equal(reader.needsChoice(), !bothKeys);
    if (!bothKeys) {
      assert.equal(reader.setHero('jin'), false);
      assert.equal(reader.recoverySource('primary'), legacyRaw);
      assert.equal(reader.recoverySource('copy'), selected);
      assert.equal(reader.restore('copy'), true);
      assert.equal(reader.getHero(), 'sora');
      assert.equal(storage.getItem(key), selected);
    } else {
      assert.equal(reader.restore('copy'), false);
      assert.equal(reader.setHero('jin'), true);
      const newlySelected = JSON.parse(storage.getItem(key));
      assert.deepEqual(newlySelected, {...downgraded, player: {...downgraded.player, heroId: 'jin'}});
    }
  }
});

test('legacy overwrite, deletion and corruption leave an independent, explicitly restorable snapshot', () => {
  for (const replacement of [older, '', '{bad', null]) {
    const storage = store(older), first = tab(storage);
    first.addExp(500);
    const protectedText = storage.getItem(first.COPY_KEY);
    // An already-open, pre-guard build knows only the original key.
    if (replacement === null) storage.rows.delete(key);
    else storage.rows.set(key, replacement);
    const reader = tab(storage);
    assert.equal(reader.saveIssue(), 'different');
    assert.equal(reader.recoverySource('primary'), replacement);
    assert.equal(reader.recoverySource('copy'), protectedText);
    assert.equal(reader.save(), false);
    assert.equal(storage.getItem(key), replacement);
    assert.equal(reader.restore('copy'), true);
    assert.equal(storage.getItem(key), protectedText);
    assert.equal(tab(storage).get().player.exp, 1400);
  }
});

test('either valid source can win, but a change during confirmation invalidates the choice', () => {
  const storage = store(older), first = tab(storage);
  first.addExp(20);
  storage.rows.set(key, older);
  const reader = tab(storage);
  storage.rows.set(reader.COPY_KEY, older + ' ');
  assert.equal(reader.restore('copy'), false);
  assert.equal(reader.saveIssue(), 'stale');
  reader.load();
  assert.equal(reader.restore('primary'), true);
  assert.equal(storage.getItem(reader.COPY_KEY), older);
  assert.equal(tab(storage).saveIssue(), '');
});

test('read and quota failures do not replace the in-memory player or report a successful replacement', () => {
  const storage = store(older);
  storage.failRead = key;
  const state = tab(storage);
  assert.equal(state.saveIssue(), 'unreadable');
  assert.equal(state.setHero('sora'), false);
  assert.equal(state.getHero(), 'aoi');
  delete storage.failRead;
  assert.equal(state.reset(), false);
  assert.deepEqual(storage.writes, []);
  state.load();
  storage.failWrite = key;
  assert.equal(state.reset(), false);
  assert.equal(state.importData(older + ' '), null);
  assert.equal(state.saveIssue(), 'write');
  assert.equal(state.get().player.exp, 900);
  assert.equal(storage.getItem(key), older);
  assert.equal(storage.getItem(state.COPY_KEY), older);
  state.addExp(15);
  assert.equal(JSON.parse(state.exportData()).player.exp, 915);
  delete storage.failWrite;
  storage.failWrite = state.COPY_KEY;
  assert.equal(state.save(), true);
  assert.equal(state.saveIssue(), 'copy');
  assert.equal(JSON.parse(storage.getItem(key)).player.exp, 915);
  assert.equal(storage.getItem(state.COPY_KEY), older);
  assert.equal(tab(storage).saveIssue(), 'different');
});

test('shared quota: first-run checkpoint, main write, and second-copy write can each fail independently', () => {
  const storage = store(older);
  storage.limit = older.length;
  const state = tab(storage);
  assert.equal(state.saveIssue(), 'copy');
  assert.equal(storage.getItem(key), older);
  assert.equal(storage.getItem(state.COPY_KEY), null);
  storage.limit = Infinity;
  state.setName('A');
  const base = storage.getItem(key);
  assert.equal(storage.getItem(state.COPY_KEY), base);
  storage.limit = 2 * base.length;
  assert.equal(state.setName('AB'), false);
  assert.equal(state.saveIssue(), 'write');
  assert.equal(JSON.parse(state.exportData()).player.name, 'AB');
  assert.deepEqual(Array.from(storage.rows.values()), [base, base]);
  storage.limit += 1;
  assert.equal(state.save(), true);
  assert.equal(state.saveIssue(), 'copy');
  const newer = storage.getItem(key);
  assert.equal(JSON.parse(newer).player.name, 'AB');
  assert.equal(storage.getItem(state.COPY_KEY), base);
  const next = tab(storage);
  assert.equal(next.needsChoice(), true);
  next.restore('primary');
  assert.equal(next.needsChoice(), true, 'partial recovery must not dismiss the two choices');
  assert.equal(next.saveIssue(), 'copy');
  assert.equal(next.save(), false);
  storage.limit += 1;
  assert.equal(next.restore('primary'), true);
  assert.deepEqual(Array.from(storage.rows.values()), [newer, newer]);
  assert.equal(tab(storage).saveIssue(), '');
});

test('isolated Chrome tabs: visible stale warning, raw downloads, cancel and confirmed recovery', {
  skip: !process.argv.includes('--browser')
}, async () => {
  const {chromium} = require('playwright');
  const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined)});
  try {
    const ctx = await browser.newContext();
    const site = 'http://save-test.invalid/';
    await ctx.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(site).origin) return route.abort();
      const rel = decodeURIComponent(url.pathname).slice(1) || 'index.html';
      const file = path.resolve(root, rel);
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({status: 404, body: ''});
      return route.fulfill({path: file});
    });
    const first = await ctx.newPage(), second = await ctx.newPage();
    const errors = [];
    for (const page of [first, second]) {
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(site);
      await page.locator('[data-home-map]').waitFor();
    }
    await first.evaluate(() => RikaState.addExp(450));
    const previousFormat = await first.evaluate(() => {
      const record = JSON.parse(localStorage.getItem(RikaState.KEY));
      record.mu.exposureFull = {};
      record.mu.optionalField = {notes: ['keep']};
      record.player.optionalField = 'keep';
      const raw = JSON.stringify(record);
      for (const k of [RikaState.KEY, RikaState.COPY_KEY]) localStorage.setItem(k, raw);
      return record;
    });
    await first.reload();
    assert.ok(await first.evaluate(() => Object.keys(RikaState.get().mu.exposureFull).length));
    assert.equal(await first.evaluate(() => localStorage.getItem(RikaState.KEY)), JSON.stringify(previousFormat));
    assert.equal(await first.evaluate(() => RikaState.setHero('jin')), true);
    await second.locator('.save-warning').filter({hasText: 'ほかのタブ'}).waitFor();
    assert.equal(await second.evaluate(() => RikaState.save()), false);
    const latest = await first.evaluate(() => localStorage.getItem(RikaState.KEY));
    assert.deepEqual(JSON.parse(latest), {...previousFormat, player: {...previousFormat.player, heroId: 'jin'}});
    assert.equal(await first.evaluate(() => localStorage.getItem(RikaState.COPY_KEY)), latest);
    await first.evaluate(text => localStorage.setItem(RikaState.KEY, text), older);
    await first.reload();
    await first.locator('[data-restore="copy"]').waitFor();
    for (const [source, expected] of [['primary', older], ['copy', latest]]) {
      const pending = first.waitForEvent('download');
      await first.locator('[data-raw="' + source + '"]').click();
      const download = await pending;
      assert.equal(fs.readFileSync(await download.path(), 'utf8'), expected);
    }
    await first.locator('[data-restore="copy"]').click();
    await first.getByRole('button', {name: 'キャンセル'}).click();
    assert.equal(await first.evaluate(() => localStorage.getItem(RikaState.KEY)), older);
    await first.locator('[data-restore="copy"]').click();
    await first.getByRole('button', {name: '実行する'}).click();
    await first.locator('[data-home-map]').waitFor();
    await first.reload();
    assert.equal(await first.evaluate(() => RikaState.get().player.exp), 450);
    assert.equal(await first.evaluate(() => RikaState.getHero()), 'jin');
    const session = await first.evaluate(() => {
      RikaBattle.start('g3_u01', 'basic', {limit: 5});
      return JSON.stringify(RikaState.get().activeSession);
    });
    assert.ok(JSON.parse(session).questions.length);
    await first.reload();
    const resumed = await first.evaluate(() => {
      RikaBattle.resume();
      const battle = RikaBattle.getBattle();
      if (battle !== RikaState.get().activeSession || !RikaState.setHero('sora') ||
          battle !== RikaState.get().activeSession) throw Error('lost resumed battle reference');
      const beforeAnswer = JSON.stringify(battle);
      RikaBattle.answer(battle.questions[battle.index].answer);
      return beforeAnswer;
    });
    assert.deepEqual(JSON.parse(resumed), JSON.parse(session));
    await first.reload();
    assert.equal(await first.evaluate(() => RikaState.get().activeSession.answered), true);
    assert.equal(await first.evaluate(() => RikaState.getHero()), 'sora');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
