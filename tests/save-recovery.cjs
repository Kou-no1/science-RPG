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
  assert.deepEqual(empty.writes, []);
  const storage = store(older), state = tab(storage);
  assert.deepEqual(storage.writes, [state.COPY_KEY]);
  assert.equal(storage.getItem(key), older);
  assert.equal(storage.getItem(state.COPY_KEY), older);
  assert.equal(state.get().schema, 2);
  assert.equal(state.get().progress.g5_u01.basicCleared, true);
  assert.deepEqual(Object.keys(state.get().owned.items), []);
  state.load();
  assert.deepEqual(storage.writes, [state.COPY_KEY]);
  state.addExp(5);
  assert.equal(JSON.parse(storage.getItem(key)).player.exp, 905);
  assert.equal(storage.getItem(key), storage.getItem(state.COPY_KEY));
  const migrated = tab(storage).get();
  assert.equal(migrated.player.name, 'Returning');
  assert.equal(migrated.player.equipped.sword, 'sol_sword');
  assert.equal(migrated.owned.monsters.defeated[0], 'soltin');
  assert.equal(migrated.owned.items.potion, undefined);
  assert.equal(migrated.settings.lastGrade, 5);
  assert.equal(migrated.progress.g5_u01.basicCleared, true);
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
    await second.locator('.save-warning').filter({hasText: 'ほかのタブ'}).waitFor();
    assert.equal(await second.evaluate(() => RikaState.save()), false);
    const latest = await first.evaluate(() => localStorage.getItem(RikaState.KEY));
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
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
