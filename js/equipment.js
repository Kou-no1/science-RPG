(function () {
  var slotLabels = {
    sword: "剣",
    shield: "盾",
    armor: "鎧",
    gauntlet: "こて"
  };

  function all() {
    return Object.keys(window.EQUIPMENT || {}).map(function (id) { return window.EQUIPMENT[id]; });
  }

  function byTheme(theme) {
    return all().filter(function (item) { return item.theme === theme; });
  }

  function normalByTheme(theme) {
    return byTheme(theme).filter(function (item) { return item.rarity !== "rare"; });
  }

  function rareForUnit(unitId) {
    return all().find(function (item) {
      return item.rarity === "rare" && item.unitId === unitId;
    }) || null;
  }

  function ownedBySlot(slot) {
    var owned = window.RikaState.get().owned.equipment;
    return all().filter(function (item) {
      return item.slot === slot && owned.indexOf(item.id) !== -1;
    });
  }

  function combineEffects() {
    var data = window.RikaState.get();
    var effect = {
      critUp: 0,
      block: 0,
      hpUp: 0,
      comboUp: 0,
      expRate: 0,
      freeHint: 0,
      hintFree: 0,
      expBoostBig: 0,
      doubleCrit: 0,
      reviveOnce: 0,
      comboKeep: 0
    };
    Object.keys(data.player.equipped).forEach(function (slot) {
      var id = data.player.equipped[slot];
      var item = id && window.EQUIPMENT[id];
      if (item && item.effect) {
        Object.keys(item.effect).forEach(function (key) {
          effect[key] = (effect[key] || 0) + item.effect[key];
        });
      }
    });
    data.owned.companions.forEach(function (id) {
      var companion = window.COMPANIONS[id];
      if (companion && companion.effect) {
        Object.keys(companion.effect).forEach(function (key) {
          effect[key] = (effect[key] || 0) + companion.effect[key];
        });
      }
    });
    return effect;
  }

  function companionForTheme(theme) {
    return Object.keys(window.COMPANIONS || {}).map(function (id) {
      return window.COMPANIONS[id];
    }).find(function (item) {
      return item.theme === theme;
    });
  }

  window.RikaEquipment = {
    slots: ["sword", "shield", "armor", "gauntlet"],
    slotLabels: slotLabels,
    all: all,
    byTheme: byTheme,
    normalByTheme: normalByTheme,
    rareForUnit: rareForUnit,
    ownedBySlot: ownedBySlot,
    effects: combineEffects,
    companionForTheme: companionForTheme
  };
})();
