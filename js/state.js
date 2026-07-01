(function () {
  var KEY = "rika_quest_save_v1";
  var saveData = null;

  function expToNext(level) {
    return 100 + 50 * (level - 1);
  }

  function levelInfo(exp) {
    var level = 1;
    var remaining = Math.max(0, Number(exp) || 0);
    while (remaining >= expToNext(level)) {
      remaining -= expToNext(level);
      level += 1;
    }
    return {
      level: level,
      current: remaining,
      next: expToNext(level),
      percent: remaining / expToNext(level) * 100
    };
  }

  function emptyProgress(unit) {
    return {
      unlocked: unit.unitNo === 1,
      basicCleared: false,
      bossCleared: false,
      perfected: false,
      bonusPerfected: false,
      bestStreak: 0,
      bonusUnlocked: false
    };
  }

  function createDefault() {
    var progress = {};
    (window.CURRICULUM || []).forEach(function (unit) {
      progress[unit.unitId] = emptyProgress(unit);
    });
    return {
      schema: 1,
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
      settings: { furigana: true, sound: true }
    };
  }

  function normalize(raw) {
    if (!raw || raw.schema !== 1 || !raw.player || !raw.owned || !raw.progress) {
      return createDefault();
    }
    var base = createDefault();
    raw.player = Object.assign(base.player, raw.player);
    raw.player.equipped = Object.assign(base.player.equipped, raw.player.equipped || {});
    raw.owned.items = Object.assign(base.owned.items, raw.owned.items || {});
    raw.owned.equipment = Array.isArray(raw.owned.equipment) ? raw.owned.equipment : [];
    raw.owned.companions = Array.isArray(raw.owned.companions) ? raw.owned.companions : [];
    raw.owned.monsters = raw.owned.monsters || {};
    raw.owned.monsters.seen = Array.isArray(raw.owned.monsters.seen) ? raw.owned.monsters.seen : [];
    raw.owned.monsters.defeated = Array.isArray(raw.owned.monsters.defeated) ? raw.owned.monsters.defeated : [];
    raw.settings = Object.assign(base.settings, raw.settings || {});
    (window.CURRICULUM || []).forEach(function (unit) {
      raw.progress[unit.unitId] = Object.assign(emptyProgress(unit), raw.progress[unit.unitId] || {});
    });
    syncLevel(raw);
    return raw;
  }

  function syncLevel(data) {
    data.player.level = levelInfo(data.player.exp).level;
  }

  function save() {
    if (!saveData) return;
    syncLevel(saveData);
    localStorage.setItem(KEY, JSON.stringify(saveData));
    if (window.RikaApp && window.RikaApp.renderStatus) window.RikaApp.renderStatus();
  }

  function load() {
    try {
      var stored = localStorage.getItem(KEY);
      saveData = stored ? normalize(JSON.parse(stored)) : createDefault();
      save();
    } catch (error) {
      saveData = createDefault();
      save();
      if (window.RikaUI) {
        window.RikaUI.toast("セーブデータを読みこめなかったので、はじめから作り直したよ。");
      }
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
    save();
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
    if (!unit) return null;
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
    data.player.exp += Math.max(0, Math.round(amount || 0));
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
    if (data.owned.items[id] <= 0) delete data.owned.items[id];
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
    saveData = createDefault();
    save();
  }

  window.RikaState = {
    KEY: KEY,
    load: load,
    save: save,
    get: get,
    reset: reset,
    setName: setName,
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
