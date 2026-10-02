(function () {
  function handleBattleResult(context) {
    return window.RikaState.transaction(function (data) {
      var unit = context.unit, tier = context.tier, p = window.RikaState.progress(unit.unitId);
      var result = { messages: [], leveled: false, equipment: null };
      if (context.review) {
        result.messages.push("学び直し、おつかれさま！ 研究ノートを更新したよ。");
        return result;
      }
      if (context.sessionId && data.rewardedSessions.includes(context.sessionId)) {
        result.messages.push("このぼうけんの報酬は、すでに受け取ったよ。");
        return result;
      }
      p.bestStreak = Math.max(p.bestStreak, context.bestStreak || 0);
      if (!context.success) {
        result.messages.push("おしい！ 研究ノートでたしかめて、またちょうせんしよう。");
        return result;
      }
      var base = 30;
      if (tier === "basic") {
        if (context.masteryComplete !== false) {
          base = p.basicCleared ? 30 : 100;
          if (!p.basicCleared) {
            var itemId = unit.theme === "solution" ? "hint_scroll" : "potion";
            window.RikaState.addItem(itemId, 1);
            result.messages.push(window.ITEMS[itemId].name + "を1こ手に入れた。");
          }
          p.basicCleared = p.bonusUnlocked = true;
          var next = window.RikaState.unlockNext(unit.unitId);
          if (next) result.messages.push(next.title + "への道が開いた。");
        } else {
          base = 10;
          result.messages.push("このコースを完走！ のこりの問題も学んで洞窟をクリアしよう。");
        }
      } else if (tier === "boss") {
        base = p.bossCleared ? 50 : 200;
        p.bossCleared = true;
        p.perfected = p.perfected || context.perfect;
        var companion = window.RikaEquipment.companionForTheme(unit.theme);
        if (companion && window.RikaState.addCompanion(companion.id)) result.messages.push("なかま「" + companion.name + "」をむかえた！");
        if (context.perfect) {
          var missing = window.RikaEquipment.normalByTheme(unit.theme).filter(function (eq) { return !data.owned.equipment.includes(eq.id); });
          result.equipment = missing[0] || null;
          if (!result.equipment) result.messages.push("全問正かい！ このテーマの通常そうびは、全部そろったよ。");
        } else result.messages.push("全問正かいで通常そうびが手に入るよ。");
      } else if (tier === "bonus") {
        base = 80;
        window.RikaState.addItem("crystal_badge", 1);
        if (context.perfect && context.total === 15) {
          var rare = window.RikaEquipment.rareForUnit(unit.unitId);
          if (rare) {
            if (!data.owned.equipment.includes(rare.id)) result.equipment = rare;
            else result.messages.push("全問正かい！ この★レアは入手ずみだよ。");
            p.bonusPerfected = true;
          } else result.messages.push("★レアのデータは準備中だよ。もう一度ちょうせんできるよ。");
        } else result.messages.push("15問すべて正かいで、単元だけの★レアが手に入るよ。");
      }
      if (result.equipment) {
        window.RikaState.addEquipment(result.equipment.id);
        if (!data.player.equipped[result.equipment.slot]) window.RikaState.equip(result.equipment.id);
        result.messages.push((result.equipment.rarity === "rare" ? "★レア「" : "「") + result.equipment.name + "」を てにいれた！");
      }
      var effects = context.effects || window.RikaEquipment.effects();
      var amount = Math.round((base + (context.extraExp || 0)) * (1 + (effects.expRate || 0) + (effects.expBoostBig ? 0.5 : 0)));
      var exp = window.RikaState.addExp(amount);
      result.leveled = exp.leveled;
      result.level = exp.after.level;
      result.messages.push(amount + "EXPを手に入れた。");
      if (exp.leveled) result.messages.push("レベル" + exp.after.level + "に上がった！");
      if (context.sessionId) data.rewardedSessions = data.rewardedSessions.concat(context.sessionId).slice(-100);
      return result;
    });
  }
  window.RikaRewards = { handleBattleResult: handleBattleResult };
})();
