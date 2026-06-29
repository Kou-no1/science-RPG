(function () {
  function expWithCompanion(base) {
    var effects = window.RikaEquipment.effects();
    return Math.round(base * (1 + (effects.expRate || 0)));
  }

  function itemName(id) {
    return window.ITEMS[id] ? window.ITEMS[id].name : id;
  }

  function chooseEquipment(theme) {
    var options = window.RikaEquipment.byTheme(theme);
    var owned = window.RikaState.get().owned.equipment;
    var missing = options.filter(function (item) { return owned.indexOf(item.id) === -1; });
    var pool = missing.length ? missing : options;
    return pool[0] || null;
  }

  function handleBattleResult(context) {
    var unit = context.unit;
    var tier = context.tier;
    var success = context.success;
    var perfect = context.perfect;
    var extraExp = context.extraExp || 0;
    var progress = window.RikaState.progress(unit.unitId);
    var messages = [];

    if (!success) {
      return {
        messages: ["おしい！ じゅんびを整えて、もう一度ちょうせんしよう。"],
        leveled: false
      };
    }

    if (tier === "basic") {
      var firstBasic = !progress.basicCleared;
      window.RikaState.updateProgress(unit.unitId, {
        basicCleared: true,
        bonusUnlocked: true,
        bestStreak: Math.max(progress.bestStreak || 0, context.bestStreak || 0)
      });
      var next = window.RikaState.unlockNext(unit.unitId);
      if (firstBasic) {
        var itemId = unit.theme === "solution" ? "hint_scroll" : "potion";
        window.RikaState.addItem(itemId, 1);
        var expResult = window.RikaState.addExp(expWithCompanion(100 + extraExp));
        messages.push("洞窟をクリア！ 100EXPを手に入れた。");
        messages.push(itemName(itemId) + "を1こ手に入れた。");
        if (next) messages.push(next.title + "への道が開いた。");
        if (expResult.leveled) messages.push("レベル" + expResult.after.level + "に上がった！");
        return { messages: messages, leveled: expResult.leveled };
      }
      var replayExp = window.RikaState.addExp(expWithCompanion(30 + extraExp));
      messages.push("もう一度クリア！ 30EXPを手に入れた。");
      if (replayExp.leveled) messages.push("レベル" + replayExp.after.level + "に上がった！");
      return { messages: messages, leveled: replayExp.leveled };
    }

    if (tier === "boss") {
      var firstBoss = !progress.bossCleared;
      var wasPerfected = !!progress.perfected;
      var rewardPatch = {
        bossCleared: true,
        perfected: wasPerfected || perfect,
        bestStreak: Math.max(progress.bestStreak || 0, context.bestStreak || 0)
      };
      window.RikaState.updateProgress(unit.unitId, rewardPatch);
      if (firstBoss) {
        var companion = window.RikaEquipment.companionForTheme(unit.theme);
        if (companion && window.RikaState.addCompanion(companion.id)) {
          messages.push("なかま「" + companion.name + "」が なかまになった！");
        }
        var bossExp = window.RikaState.addExp(expWithCompanion(200 + extraExp));
        messages.push("ボスをとうばつ！ 200EXPを手に入れた。");
        if (bossExp.leveled) messages.push("レベル" + bossExp.after.level + "に上がった！");
      } else {
        var bossReplay = window.RikaState.addExp(expWithCompanion(50 + extraExp));
        messages.push("ボス再とうばつ！ 50EXPを手に入れた。");
        if (bossReplay.leveled) messages.push("レベル" + bossReplay.after.level + "に上がった！");
      }
      if (perfect && !wasPerfected) {
        var equipment = chooseEquipment(unit.theme);
        if (equipment && window.RikaState.addEquipment(equipment.id)) {
          messages.push(equipment.name + "を手に入れた！");
          if (!window.RikaState.get().player.equipped[equipment.slot]) {
            window.RikaState.equip(equipment.id);
            messages.push(equipment.name + "をそうびした。");
          }
        }
      } else if (perfect && wasPerfected) {
        messages.push("全問正かい！ すでにこのテーマのそうびを手に入れているよ。");
      } else {
        messages.push("全問正かいでテーマそうびが手に入るよ。");
      }
      return { messages: messages, leveled: false };
    }

    if (tier === "bonus") {
      var bonusExp = window.RikaState.addExp(expWithCompanion(40 + extraExp));
      window.RikaState.addItem("crystal_badge", 1);
      messages.push("おまけクリア！ 40EXPとけっしょうバッジを手に入れた。");
      if (bonusExp.leveled) messages.push("レベル" + bonusExp.after.level + "に上がった！");
      return { messages: messages, leveled: bonusExp.leveled };
    }

    return { messages: messages, leveled: false };
  }

  window.RikaRewards = {
    handleBattleResult: handleBattleResult
  };
})();
