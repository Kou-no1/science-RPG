(function () {
  var collectionGrade = null;
  function gradeFilter() {
    if (collectionGrade === null) collectionGrade = window.RikaState.get().settings.lastGrade;
    return '<label class="collection-filter">学年 <select data-collection-grade><option value="0"' + (!collectionGrade ? ' selected' : '') + '>全学年</option>' + [3,4,5,6].map(function (grade) { return '<option value="' + grade + '"' + (grade === collectionGrade ? ' selected' : '') + '>' + grade + '年</option>'; }).join('') + '</select></label>';
  }
  function itemCount(id) {
    return window.RikaState.get().owned.items[id] || 0;
  }

  function renderEquipment() {
    var data = window.RikaState.get();
    var html = '<section class="panel rpg-frame"><h2>そうび</h2><div class="equipment-preview">' + window.RikaSVG.hero() + '<div class="preview-gear">' + window.RikaEquipment.slots.map(function (slot) { var eq = window.EQUIPMENT[data.player.equipped[slot]]; return '<span class="slot ' + (eq && eq.rarity === 'rare' ? 'rare' : '') + '" title="' + window.RikaUI.escapeHtml(eq ? window.RikaUI.renderPlain(eq.name) : '未そうび') + '">' + (eq ? window.RikaSVG.slotIcon(slot,36) : '?') + '</span>'; }).join('') + '</div></div><div class="inventory-grid">';
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
    var filter = gradeFilter();
    var rares = window.RikaEquipment.all().filter(function (item) { return item.rarity === "rare" && (!collectionGrade || (item.unitId || '').startsWith('g' + collectionGrade + '_')); }).sort(function (a, b) {
      return (a.unitId || "").localeCompare(b.unitId || "");
    });
    if (!rares.length) return "";
    return '<h3>★レアそうび</h3>' + filter + '<p>🎓15問チャレンジを全問正かいすると手に入る、とくべつなそうびだよ。</p><div class="collection-grid rare-equipment-grid">' +
      rares.map(function (item) {
        var has = owned.indexOf(item.id) !== -1;
        var unit = window.CURRICULUM.find(function (u) { return u.unitId === item.unitId; });
        return '<article class="collection-card rare-card ' + (has ? "is-owned" : "is-locked") + '">' +
          '<div class="rare-card-head">' +
          '<span class="rare-silhouette">' + (has ? window.RikaSVG.slotIcon(item.slot, 44) : "?") + '</span>' +
          '<div><h4>' + (has ? window.RikaUI.renderFurigana(item.name) : "？？？★") + '</h4>' +
          '<span class="tag rare-tag">' + window.RikaUI.renderFurigana(unit ? unit.grade + '年 ' + unit.title : item.theme) + '</span></div></div>' +
          '<p>' + (has ? window.RikaUI.renderFurigana(item.desc) : "🎓15問チャレンジ全問正かいで手に入る。") + '</p>' +
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
    var active = window.RikaState.get().activeCompanions;
    var html = '<section class="panel rpg-frame"><h2>なかま図鑑</h2><p>いっしょに行くなかま ' + active.length + ' / 2体</p><div class="collection-grid">';
    Object.keys(window.COMPANIONS || {}).forEach(function (id) {
      var companion = window.COMPANIONS[id];
      var has = owned.indexOf(id) !== -1;
      html += '<article class="collection-card ' + (has ? "" : "is-locked") + '">' +
        '<h3>' + (has ? window.RikaUI.renderFurigana(companion.name) : "？？？") + '</h3>' +
        '<p>' + (has ? window.RikaUI.renderFurigana(companion.desc) : "ボスをとうばつすると出会えるよ。") + '</p>' +
        '<span class="tag">' + window.RikaUI.escapeHtml(companion.theme) + '</span>' +
        (has ? '<label class="toggle-line">いっしょに行く<input type="checkbox" data-companion="' + id + '" ' + (active.includes(id) ? 'checked' : '') + '></label>' : '') +
        '</article>';
    });
    return html + '</div></section>';
  }

  function renderMonsterDex() {
    var seen = window.RikaState.get().owned.monsters.seen;
    var defeated = window.RikaState.get().owned.monsters.defeated;
    var filter = gradeFilter();
    var units = window.CURRICULUM.filter(function (u) { return !collectionGrade || u.grade === collectionGrade; });
    var ids = new Set([].concat.apply([], units.map(function (u) { return (u.encounters || []).concat(u.bossId || [], u.legendaryId || []); })));
    var html = '<section class="panel rpg-frame"><h2>モンスター図鑑</h2>' + filter + '<div class="collection-grid">';
    Object.keys(window.MONSTERS || {}).forEach(function (id) {
      if (!ids.has(id)) return;
      var monster = window.MONSTERS[id];
      var hasSeen = seen.indexOf(id) !== -1;
      var hasDefeated = defeated.indexOf(id) !== -1;
      html += '<article class="collection-card">' +
        (hasSeen ? window.RikaMonsters.render(id) : '<div class="empty-state">まだ出会っていないよ</div>') +
        '<h3>' + (hasSeen ? window.RikaUI.renderFurigana(monster.name) : "？？？") + '</h3>' +
        '<p>' + (hasSeen ? window.RikaUI.renderFurigana(monster.flavor) : "マップで単元にちょうせんすると出会えるよ。") + '</p>' +
        '<span class="tag ' + (hasDefeated ? "good" : "warn") + '">' + (hasDefeated ? "とうばつ" : hasSeen ? "出会った" : "未発見") + '</span>' +
        (monster.role === 'zako' ? '<button type="button" class="secondary-button" data-explore="' + id + '">会いに行く</button>' : '') +
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
      '<button type="button" class="tab-button ' + (tab === "notebook" ? "is-active" : "") + '" data-inventory-tab="notebook">研究ノート</button>' +
      '</div><div id="inventory-content">' +
      (tab === "items" ? renderItems() : tab === "companions" ? renderCompanions() : tab === "monsters" ? renderMonsterDex() : tab === "notebook" ? renderNotebook() : renderEquipment()) +
      '</div>';
  }

  function bind(root) {
    root.querySelectorAll('[data-collection-grade]').forEach(function (select) { select.addEventListener('change', function () { collectionGrade = Number(select.value); var tab = root.querySelector('[data-inventory-tab].is-active'); window.RikaApp.showInventory(tab ? tab.dataset.inventoryTab : 'equipment'); }); });
    root.querySelectorAll('[data-companion]').forEach(function (input) { input.addEventListener('change', function () { if (!window.RikaState.selectCompanion(input.dataset.companion, input.checked)) window.RikaUI.toast('なかまは2体までだよ。'); window.RikaApp.showInventory('companions'); }); });
    root.querySelectorAll('[data-explore]').forEach(function (button) { button.addEventListener('click', function () {
      var candidates = window.CURRICULUM.filter(function (u) { return (u.encounters || []).includes(button.dataset.explore); });
      var unit = candidates.find(function (u) { return window.RikaState.progress(u.unitId).unlocked; });
      if (!unit) { window.RikaUI.toast('先に手前の洞窟をクリアしてね。'); if (candidates[0]) window.RikaApp.showMap(candidates[0].grade, candidates[0].unitId); return; }
      window.RikaBattle.start(unit.unitId, 'basic', {monsterId:button.dataset.explore,limit:5,mode:'learn'});
    }); });
    root.querySelectorAll('[data-review-unit]').forEach(function (button) { button.addEventListener('click', function () { window.RikaBattle.start(button.dataset.reviewUnit, button.dataset.reviewTier, {review:true,mode:'learn'}); }); });
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

  function renderNotebook() {
    var stats = window.RikaState.get().questionStats;
    var rows = window.CURRICULUM.map(function (u) {
      var bank = window.QUESTION_BANK[u.unitId];
      var all = [].concat(bank.basic, bank.boss, bank.bonus);
      var questions = all.filter(function (q) { return stats[q.id] && !stats[q.id].lastCorrect; });
      var learned = all.filter(function (q) { return !!stats[q.id]; }).length;
      if (!questions.length && !learned) return '';
      var buttons = ['basic','boss','bonus'].filter(function (tier) { return questions.some(function (q) { return q.tier === tier; }); }).map(function (tier) { return '<button class="secondary-button" data-review-unit="' + u.unitId + '" data-review-tier="' + tier + '">' + ({basic:'洞窟',boss:'城',bonus:'おまけ'}[tier]) + 'を学び直す</button>'; }).join('');
      return '<article class="notebook-row"><h3>' + u.grade + '年 ' + window.RikaUI.renderFurigana(u.title) + '</h3><p>学んだ問題 ' + learned + '問 ・ 学び直し ' + questions.length + '問</p>' + (questions.length ? '<div class="button-row">' + buttons + '</div><details><summary>問題を見る</summary>' + questions.map(function (q) { return '<p>' + window.RikaUI.renderFurigana(q.stem) + '</p><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>'; }).join('') + '</details>' : '<span class="tag good">✓ よくがんばったね</span>') + '</article>';
    }).join('');
    return '<section class="panel rpg-frame"><h2>研究ノート</h2>' + (rows || '<p>ぼうけんをはじめると、学んだ問題がここに記録されるよ。</p>') + '</section>';
  }

  window.RikaInventory = {
    render: render,
    bind: bind,
    itemCount: itemCount
  };
})();
