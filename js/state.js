(function () {
  var KEY = "rika_quest_save_v1";
  var COPY_KEY = KEY + "_protected";
  var saveData = null;
  var primaryRaw = null;
  var copyRaw = null;
  var blocked = "";
  var storageIssue = "";
  var transactionDepth = 0;
  var pendingProgress = false;

  function finite(value, fallback, max) {
    return Number.isFinite(Number(value)) ? Math.min(max || 100000000, Math.max(0, Number(value))) : fallback;
  }

  function unique(values) {
    return Array.isArray(values) ? Array.from(new Set(values.filter(function (v) { return typeof v === "string"; }))) : [];
  }

  function expToNext(level) {
    return 100 + 50 * (level - 1);
  }

  function levelInfo(exp) {
    exp = finite(exp, 0);
    var steps = Math.floor((Math.sqrt(5625 + 100 * exp) - 75) / 50);
    var level = steps + 1;
    var remaining = exp - (25 * steps * steps + 75 * steps);
    return {
      level: level,
      current: remaining,
      next: expToNext(level),
      percent: remaining / expToNext(level) * 100
    };
  }

  function emptyProgress(unit) {
    return {
      unlocked: unit.unitNo === 1 && unit.kind !== "chapter",
      basicCleared: false,
      bossCleared: false,
      perfected: false,
      bonusPerfected: false,
      bestStreak: 0,
      bonusUnlocked: false,
      seenQuestionIds: [],
      masteredQuestionIds: []
    };
  }

  function createDefault() {
    var progress = {};
    (window.CURRICULUM || []).forEach(function (unit) {
      progress[unit.unitId] = emptyProgress(unit);
    });
    return {
      schema: 2,
      player: {
        name: "ぼうけんしゃ",
        level: 1,
        exp: 0,
        hpBase: 3,
        equipped: { sword: null, shield: null, armor: null, gauntlet: null }
      },
      owned: {
        equipment: [],
        items: { potion: 2, hint_scroll: 1 },
        companions: [],
        monsters: { seen: [], defeated: [] }
      },
      progress: progress,
      questionStats: {},
      encounterBags: {},
      questionBags: {},
      activeCompanions: [],
      activeSession: null,
      rewardedSessions: [],
      mu: window.RikaMu ? window.RikaMu.emptySave() : null,
      settings: { furigana: true, sound: true, motion: true, lastGrade: 3 }
    };
  }

  function record(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
  function hasOwn(obj, id) { return Object.prototype.hasOwnProperty.call(obj, id); }
  function validHero(id) { return ["aoi", "jin", "sora", "mio", "ritsu", "nagi"].includes(id); }

  function normalize(raw) {
    if (!record(raw) || ![1, 2].includes(raw.schema) || !record(raw.player) || !record(raw.owned) || !record(raw.progress)) throw new Error("Unsupported save");
    var base = createDefault();
    // A mixed/older set of game scripts must not silently discard saved content.
    if (Object.keys(raw.progress).some(function (id) { return !hasOwn(base.progress, id); }) ||
        unique(raw.owned.equipment).some(function (id) { return !hasOwn(window.EQUIPMENT || {}, id); }) ||
        unique(raw.owned.companions).some(function (id) { return !hasOwn(window.COMPANIONS || {}, id); }) ||
        (raw.mu && (!base.mu || Object.keys(raw.mu.progress || {}).some(function (id) { return !hasOwn(base.mu.progress, id); })))) {
      throw new Error("Unavailable save content");
    }
    base.player.name = String(raw.player.name || base.player.name).slice(0, 16);
    if (validHero(raw.player.heroId)) base.player.heroId = raw.player.heroId;
    base.player.exp = finite(raw.player.exp, 0);
    base.player.hpBase = finite(raw.player.hpBase, 3, 10) || 3;
    base.owned.equipment = unique(raw.owned.equipment).filter(function (id) { return !!window.EQUIPMENT[id]; });
    base.owned.companions = unique(raw.owned.companions).filter(function (id) { return !!window.COMPANIONS[id]; });
    Object.keys(base.player.equipped).forEach(function (slot) {
      var id = (raw.player.equipped || {})[slot];
      if (base.owned.equipment.includes(id) && window.EQUIPMENT[id].slot === slot) base.player.equipped[slot] = id;
    });
    base.owned.items = {};
    Object.keys(raw.owned.items || {}).forEach(function (id) { base.owned.items[id] = Math.floor(finite(raw.owned.items[id], 0, 9999)); });
    ["seen", "defeated"].forEach(function (key) { base.owned.monsters[key] = unique((raw.owned.monsters || {})[key]); });
    ["furigana", "sound", "motion"].forEach(function (key) {
      if (typeof (raw.settings || {})[key] === "boolean") base.settings[key] = raw.settings[key];
    });
    base.settings.lastGrade = [3, 4, 5, 6].includes((raw.settings || {}).lastGrade) ? raw.settings.lastGrade : 5;
    if (raw.schema === 1 && !(raw.settings || {}).lastGrade) base.settings.lastGrade = 5;
    (window.CURRICULUM || []).forEach(function (unit) {
      var p = raw.progress[unit.unitId] || {};
      var target = base.progress[unit.unitId];
      ["unlocked", "basicCleared", "bossCleared", "perfected", "bonusPerfected", "bonusUnlocked"].forEach(function (key) { if (typeof p[key] === "boolean") target[key] = p[key]; });
      target.bestStreak = finite(p.bestStreak, 0, 9999);
      target.bonusUnlocked = target.basicCleared;
      target.seenQuestionIds = unique(p.seenQuestionIds);
      target.masteredQuestionIds = unique(p.masteredQuestionIds);
    });
    Object.keys(raw.questionStats || {}).forEach(function (id) {
      var stat = raw.questionStats[id];
      if (!stat || typeof stat !== "object" || Array.isArray(stat) || id === "__proto__") return;
      var target = { lastCorrect: stat.lastCorrect === true, contentVersion: Math.floor(finite(stat.contentVersion, 1)) || 1 };
      ["seen", "correct", "wrong", "hints", "reviews"].forEach(function (key) { target[key] = Math.floor(finite(stat[key], 0)); });
      base.questionStats[id] = target;
    });
    ["encounterBags", "questionBags"].forEach(function (key) {
      Object.keys(raw[key] || {}).forEach(function (id) { if (id !== "__proto__") base[key][id] = unique(raw[key][id]); });
    });
    base.activeCompanions = unique(raw.schema === 1 ? base.owned.companions : raw.activeCompanions).filter(function (id) { return base.owned.companions.includes(id); }).slice(0, 2);
    base.activeSession = raw.activeSession && typeof raw.activeSession === "object" ? raw.activeSession : null;
    base.rewardedSessions = unique(raw.rewardedSessions).slice(-100);
    if (window.RikaMu) base.mu = window.RikaMu.normalizeSave(raw.mu);
    syncUnlocks(base);
    syncLevel(base);
    return base;
  }

  function syncUnlocks(data) {
    (window.CURRICULUM || []).forEach(function (unit) {
      var previous = unit.unlockAfter || (unit.kind !== "chapter" && unit.unitNo > 1 ? ["g" + unit.grade + "_u" + String(unit.unitNo - 1).padStart(2, "0")] : []);
      if (previous.length && previous.every(function (id) { return data.progress[id] && data.progress[id].basicCleared; })) data.progress[unit.unitId].unlocked = true;
    });
  }

  function syncLevel(data) {
    data.player.level = levelInfo(data.player.exp).level;
  }

  function readData(raw) {
    if (raw === null) return null;
    try { return normalize(JSON.parse(raw)); } catch (error) { return null; }
  }

  function checkStorage() {
    if (blocked === "stale" || blocked === "unreadable") return false;
    try {
      if (localStorage.getItem(KEY) !== primaryRaw || localStorage.getItem(COPY_KEY) !== copyRaw) blocked = "stale";
    } catch (error) { blocked = "unreadable"; }
    return blocked !== "stale" && blocked !== "unreadable";
  }

  function copyPrimary() {
    if (primaryRaw === copyRaw) return;
    localStorage.setItem(COPY_KEY, primaryRaw);
    copyRaw = primaryRaw;
  }

  function persist(data, raw, explicit, snapshot) {
    if (!checkStorage() || (blocked && !explicit)) return false;
    try {
      if (raw === null) raw = JSON.stringify(snapshot || data);
      if (raw !== primaryRaw) localStorage.setItem(KEY, raw);
    } catch (error) { storageIssue = "write"; return false; }
    primaryRaw = raw;
    saveData = data;
    pendingProgress = false;
    blocked = storageIssue = "";
    try { copyPrimary(); } catch (error) {
      // The main write succeeded. Do not claim that the recovery copy is current.
      storageIssue = "copy";
      if (explicit && copyRaw !== null) blocked = "different";
    }
    return true;
  }

  function save() {
    if (!saveData || transactionDepth) return false;
    syncLevel(saveData);
    syncUnlocks(saveData);
    var saved = persist(saveData, null, false);
    if (!saved) pendingProgress = true;
    if (window.RikaApp && window.RikaApp.renderStatus) window.RikaApp.renderStatus();
    return saved;
  }

  function load() {
    primaryRaw = copyRaw = null;
    blocked = storageIssue = "";
    pendingProgress = false;
    try {
      primaryRaw = localStorage.getItem(KEY);
      copyRaw = localStorage.getItem(COPY_KEY);
    } catch (error) { blocked = "unreadable"; }
    var primary = readData(primaryRaw);
    saveData = primary || readData(copyRaw) || createDefault();
    if (blocked) return saveData;
    if (copyRaw !== null && primaryRaw !== copyRaw) blocked = "different";
    else if (primaryRaw !== null && !primary) blocked = "invalid";
    else if (primary && copyRaw === null && checkStorage()) {
      // First run after an update: checkpoint the exact bytes, never rewrite the original on boot.
      try { copyPrimary(); } catch (error) { storageIssue = "copy"; }
    }
    return saveData;
  }

  function get() {
    if (!saveData) return load();
    return saveData;
  }

  function setName(name) {
    var cleaned = String(name || "").trim().slice(0, 16);
    get().player.name = cleaned || "ぼうけんしゃ";
    return save();
  }

  function getHero() {
    var id = get().player.heroId;
    return validHero(id) ? id : "aoi";
  }

  function setHero(id) {
    if (!validHero(id) || transactionDepth) return false;
    var data = get();
    // A preference-only write must not acknowledge unsaved game progress.
    if (blocked || pendingProgress) return false;
    // Patch the stored source, not the migrated view. Keep live battle references intact.
    var snapshot = primaryRaw === null ? Object.assign({}, data, { player: Object.assign({}, data.player) }) : JSON.parse(primaryRaw);
    snapshot.player.heroId = id;
    var saved = persist(data, null, false, snapshot);
    if (saved) data.player.heroId = id;
    if (window.RikaApp && window.RikaApp.renderStatus) window.RikaApp.renderStatus();
    return saved;
  }

  function progress(unitId) {
    var data = get();
    if (!data.progress[unitId]) {
      var unit = (window.CURRICULUM || []).find(function (item) { return item.unitId === unitId; });
      data.progress[unitId] = emptyProgress(unit || { unitNo: 999 });
    }
    return data.progress[unitId];
  }

  function updateProgress(unitId, patch) {
    Object.assign(progress(unitId), patch || {});
    save();
  }

  function unlockNext(unitId) {
    var units = (window.CURRICULUM || []).slice().sort(function (a, b) {
      return a.grade === b.grade ? a.unitNo - b.unitNo : a.grade - b.grade;
    });
    var unit = units.find(function (item) { return item.unitId === unitId; });
    if (!unit || unit.kind === "chapter") return null;
    var next = units.find(function (item) { return item.grade === unit.grade && item.unitNo === unit.unitNo + 1; });
    if (next) {
      progress(next.unitId).unlocked = true;
      save();
      return next;
    }
    return null;
  }

  function addExp(amount) {
    var data = get();
    var before = levelInfo(data.player.exp);
    data.player.exp = finite(data.player.exp + Math.round(finite(amount, 0)), 0);
    var after = levelInfo(data.player.exp);
    syncLevel(data);
    save();
    return { before: before, after: after, leveled: after.level > before.level };
  }

  function addItem(id, count) {
    var data = get();
    data.owned.items[id] = (data.owned.items[id] || 0) + (count || 1);
    save();
  }

  function spendItem(id, count) {
    var data = get();
    var amount = count || 1;
    if ((data.owned.items[id] || 0) < amount) return false;
    data.owned.items[id] -= amount;
    save();
    return true;
  }

  function addEquipment(id) {
    var data = get();
    if (!window.EQUIPMENT[id]) return false;
    if (data.owned.equipment.indexOf(id) === -1) {
      data.owned.equipment.push(id);
      save();
      return true;
    }
    return false;
  }

  function equip(id) {
    var data = get();
    var eq = window.EQUIPMENT[id];
    if (!eq || data.owned.equipment.indexOf(id) === -1) return false;
    data.player.equipped[eq.slot] = id;
    save();
    return true;
  }

  function unequip(slot) {
    if (!get().player.equipped.hasOwnProperty(slot)) return false;
    get().player.equipped[slot] = null;
    save();
    return true;
  }

  function addCompanion(id) {
    var data = get();
    if (!window.COMPANIONS[id]) return false;
    if (data.owned.companions.indexOf(id) === -1) {
      data.owned.companions.push(id);
      if (data.activeCompanions.length < 2) data.activeCompanions.push(id);
      save();
      return true;
    }
    return false;
  }

  function rememberMonster(id, defeated) {
    var monsters = get().owned.monsters;
    if (monsters.seen.indexOf(id) === -1) monsters.seen.push(id);
    if (defeated && monsters.defeated.indexOf(id) === -1) monsters.defeated.push(id);
    save();
  }

  function reset() {
    var data = createDefault();
    return persist(data, null, true);
  }

  function restore(source) {
    if (blocked !== "different" || !["primary", "copy"].includes(source)) return false;
    var raw = source === "copy" ? copyRaw : primaryRaw;
    var data = readData(raw);
    return !!data && persist(data, raw, true);
  }

  function transaction(action) {
    transactionDepth += 1;
    try { return action(get()); } finally { transactionDepth -= 1; if (!transactionDepth) save(); }
  }

  function selectCompanion(id, selected) {
    var data = get();
    if (!data.owned.companions.includes(id)) return false;
    if (selected && !data.activeCompanions.includes(id)) {
      if (data.activeCompanions.length >= 2) return false;
      data.activeCompanions.push(id);
    } else if (!selected) data.activeCompanions = data.activeCompanions.filter(function (x) { return x !== id; });
    save();
    return true;
  }

  function recordQuestion(unitId, question, correct, hint, review) {
    var data = get();
    var stat = data.questionStats[question.id] || { seen: 0, correct: 0, wrong: 0, hints: 0, reviews: 0 };
    stat.seen += 1;
    stat[correct ? "correct" : "wrong"] += 1;
    if (hint) stat.hints += 1;
    if (review) stat.reviews += 1;
    stat.lastCorrect = correct;
    stat.contentVersion = question.contentVersion || 1;
    data.questionStats[question.id] = stat;
    if (question.tier === "basic") {
      var p = progress(unitId);
      if (!p.seenQuestionIds.includes(question.id)) p.seenQuestionIds.push(question.id);
      if (correct && !p.masteredQuestionIds.includes(question.id)) p.masteredQuestionIds.push(question.id);
    }
    save();
  }

  window.RikaState = {
    KEY: KEY,
    load: load,
    save: save,
    isPersisted: function () { return !blocked && storageIssue !== "write"; },
    saveIssue: function () { return blocked === "stale" || blocked === "unreadable" ? blocked : storageIssue || blocked; },
    needsChoice: function () { return blocked === "different"; },
    checkStorage: checkStorage,
    COPY_KEY: COPY_KEY,
    restore: restore,
    recoverySource: function (source) { return source === "copy" ? copyRaw : primaryRaw; },
    get: get,
    reset: reset,
    normalize: normalize,
    transaction: transaction,
    selectCompanion: selectCompanion,
    recordQuestion: recordQuestion,
    exportData: function () { return blocked === "invalid" ? primaryRaw : JSON.stringify(get(), null, 2); },
    importData: function (text) {
      var data = normalize(JSON.parse(text));
      return persist(data, null, true) ? data : null;
    },
    setName: setName,
    getHero: getHero,
    setHero: setHero,
    expToNext: expToNext,
    levelInfo: levelInfo,
    progress: progress,
    updateProgress: updateProgress,
    unlockNext: unlockNext,
    addExp: addExp,
    addItem: addItem,
    spendItem: spendItem,
    addEquipment: addEquipment,
    equip: equip,
    unequip: unequip,
    addCompanion: addCompanion,
    rememberMonster: rememberMonster
  };
})();
