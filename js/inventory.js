(function () {
  function itemCount(id) {
    return window.RikaState.get().owned.items[id] || 0;
  }

  function renderEquipment() {
    var data = window.RikaState.get();
    var html = '<section class="panel rpg-frame"><h2>そうび</h2><p>手に入れたそうびを選んで、バトルの力にしよう。</p><div class="inventory-grid">';
    window.RikaEquipment.slots.forEach(function (slot) {
      var equippedId = data.player.equipped[slot];
      var equipped = equippedId && window.EQUIPMENT[equippedId];
      var owned = window.RikaEquipment.ownedBySlot(slot).sort(function (a, b) {
        if ((a.rarity === "rare") !== (b.rarity === "rare")) return a.rarity === "rare" ? -1 : 1;
        return window.RikaUI.renderPlain(a.name).localeCompare(window.RikaUI.renderPlain(b.name), "ja");
      });
      html += '<article class="inventory-card"><div class="equipment-slot">' +
        window.RikaSVG.slotIcon(slot, 44) +
        '<div><h3>' + window.RikaUI.escapeHtml(window.RikaEquipment.slotLabels[slot]) + '</h3>' +
        '<p>' + (equipped ? rareMark(equipped) + window.RikaUI.renderFurigana(equipped.name) : "未そうび") + '</p></div></div>';
      if (equipped) html += '<p>' + window.RikaUI.renderFurigana(equipped.desc) + '</p>';
      if (owned.length) {
        html += '<label><span class="sr-only">' + window.RikaUI.escapeHtml(window.RikaEquipment.slotLabels[slot]) + 'を選ぶ</span><select data-equip-slot="' + slot + '"><option value="">はずす</option>';
        owned.forEach(function (item) {
          html += '<option value="' + item.id + '"' + (item.id === equippedId ? " selected" : "") + '>' + window.RikaUI.escapeHtml(window.RikaUI.renderPlain(item.name)) + '</option>';
        });
        html += '</select></label>';
      } else {
        html += '<p class="empty-state">このスロットのそうびはまだないよ。</p>';
      }
      html += '</article>';
    });
    var effects = window.RikaEquipment.effects();
    html += '</div><h3>今の合計ステータス</h3><div class="reward-row">' +
      '<span class="tag">会心 +' + Math.round((effects.critUp || 0) * 100) + '%</span>' +
      '<span class="tag">ブロック ' + (effects.block || 0) + '回</span>' +
      '<span class="tag">ライフ +' + (effects.hpUp || 0) + '</span>' +
      '<span class="tag">コンボ +' + (effects.comboUp || 0) + '</span>' +
      '<span class="tag">ヒント ' + ((effects.freeHint || 0) + (effects.hintFree || 0)) + '回</span>' +
      '<span class="tag rare-tag">二連撃 ' + (effects.doubleCrit ? "あり" : "なし") + '</span>' +
      '<span class="tag rare-tag">復活 ' + (effects.reviveOnce || 0) + '回</span>' +
      '<span class="tag rare-tag">コンボ守り ' + (effects.comboKeep || 0) + '回</span>' +
      '</div>' + renderRareEquipment(data) + '</section>';
    return html;
  }

  function rareMark(item) {
    return item && item.rarity === "rare" ? '<span class="rare-mark" aria-label="レア">★</span>' : "";
  }

  function renderRareEquipment(data) {
    var owned = data.owned.equipment || [];
    var rares = window.RikaEquipment.all().filter(function (item) { return item.rarity === "rare"; }).sort(function (a, b) {
      return (a.unitId || "").localeCompare(b.unitId || "");
    });
    if (!rares.length) return "";
    return '<h3>★レアそうび</h3><p>🎓中学チャレンジを全問正かいすると手に入る、とくべつなそうびだよ。</p><div class="collection-grid rare-equipment-grid">' +
      rares.map(function (item) {
        var has = owned.indexOf(item.id) !== -1;
        return '<article class="collection-card rare-card ' + (has ? "is-owned" : "is-locked") + '">' +
          '<div class="rare-card-head">' +
          '<span class="rare-silhouette">' + (has ? window.RikaSVG.slotIcon(item.slot, 44) : "?") + '</span>' +
          '<div><h4>' + (has ? window.RikaUI.renderFurigana(item.name) : "？？？★") + '</h4>' +
          '<span class="tag rare-tag">' + window.RikaUI.escapeHtml(item.unitId || item.theme) + '</span></div></div>' +
          '<p>' + (has ? window.RikaUI.renderFurigana(item.desc) : "🎓中学チャレンジ全問正かいで手に入る。") + '</p>' +
          '</article>';
      }).join("") +
      '</div>';
  }

  function renderItems() {
    var items = window.RikaState.get().owned.items;
    var ids = Object.keys(window.ITEMS || {});
    var html = '<section class="panel rpg-frame"><h2>どうぐ</h2><div class="inventory-grid">';
    ids.forEach(function (id) {
      var item = window.ITEMS[id];
      html += '<article class="inventory-card">' +
        '<div class="equipment-slot">' + window.RikaSVG.itemIcon(id, 44) + '<div><h3>' + window.RikaUI.renderFurigana(item.name) + '</h3><p>所持数: ' + (items[id] || 0) + '</p></div></div>' +
        '<p>' + window.RikaUI.renderFurigana(item.desc) + '</p></article>';
    });
    return html + '</div></section>';
  }

  function renderCompanions() {
    var owned = window.RikaState.get().owned.companions;
    var html = '<section class="panel rpg-frame"><h2>なかま図鑑</h2><div class="collection-grid">';
    Object.keys(window.COMPANIONS || {}).forEach(function (id) {
      var companion = window.COMPANIONS[id];
      var has = owned.indexOf(id) !== -1;
      html += '<article class="collection-card ' + (has ? "" : "is-locked") + '">' +
        '<h3>' + (has ? window.RikaUI.renderFurigana(companion.name) : "？？？") + '</h3>' +
        '<p>' + (has ? window.RikaUI.renderFurigana(companion.desc) : "ボスをとうばつすると出会えるよ。") + '</p>' +
        '<span class="tag">' + window.RikaUI.escapeHtml(companion.theme) + '</span>' +
        '</article>';
    });
    return html + '</div></section>';
  }

  function renderMonsterDex() {
    var seen = window.RikaState.get().owned.monsters.seen;
    var defeated = window.RikaState.get().owned.monsters.defeated;
    var html = '<section class="panel rpg-frame"><h2>モンスター図鑑</h2><div class="collection-grid">';
    Object.keys(window.MONSTERS || {}).forEach(function (id) {
      var monster = window.MONSTERS[id];
      var hasSeen = seen.indexOf(id) !== -1;
      var hasDefeated = defeated.indexOf(id) !== -1;
      html += '<article class="collection-card">' +
        (hasSeen ? window.RikaMonsters.render(id) : '<div class="empty-state">まだ出会っていないよ</div>') +
        '<h3>' + (hasSeen ? window.RikaUI.renderFurigana(monster.name) : "？？？") + '</h3>' +
        '<p>' + (hasSeen ? window.RikaUI.renderFurigana(monster.flavor) : "マップで単元にちょうせんすると出会えるよ。") + '</p>' +
        '<span class="tag ' + (hasDefeated ? "good" : "warn") + '">' + (hasDefeated ? "とうばつ" : "出会った") + '</span>' +
        '</article>';
    });
    return html + '</div></section>';
  }

  function render(active) {
    var tab = active || "equipment";
    return '<div class="inventory-tabs">' +
      '<button type="button" class="tab-button ' + (tab === "equipment" ? "is-active" : "") + '" data-inventory-tab="equipment">そうび</button>' +
      '<button type="button" class="tab-button ' + (tab === "items" ? "is-active" : "") + '" data-inventory-tab="items">どうぐ</button>' +
      '<button type="button" class="tab-button ' + (tab === "companions" ? "is-active" : "") + '" data-inventory-tab="companions">なかま</button>' +
      '<button type="button" class="tab-button ' + (tab === "monsters" ? "is-active" : "") + '" data-inventory-tab="monsters">図鑑</button>' +
      '</div><div id="inventory-content">' +
      (tab === "items" ? renderItems() : tab === "companions" ? renderCompanions() : tab === "monsters" ? renderMonsterDex() : renderEquipment()) +
      '</div>';
  }

  function bind(root) {
    root.querySelectorAll("[data-inventory-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.RikaApp) window.RikaApp.showInventory(button.dataset.inventoryTab);
      });
    });
    root.querySelectorAll("[data-equip-slot]").forEach(function (select) {
      select.addEventListener("change", function () {
        if (select.value) window.RikaState.equip(select.value);
        else window.RikaState.unequip(select.dataset.equipSlot);
        window.RikaUI.toast("そうびを更新したよ。");
        if (window.RikaApp) window.RikaApp.showInventory("equipment");
      });
    });
  }

  window.RikaInventory = {
    render: render,
    bind: bind,
    itemCount: itemCount
  };
})();
