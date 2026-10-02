(function () {
  var coords = {
    5: [
      [102, 168], [235, 120], [365, 154], [510, 118], [612, 216],
      [538, 346], [392, 396], [254, 330], [140, 420], [80, 290]
    ],
    6: [
      [106, 390], [172, 250], [285, 154], [430, 122], [566, 172],
      [622, 292], [552, 422], [418, 468], [284, 410], [170, 482], [76, 280]
    ]
  };
  [3, 4, 5, 6].forEach(function (grade) {
    var units = window.CURRICULUM.filter(function (u) { return u.grade === grade; });
    coords[grade] = units.map(function (_, i) { var row = Math.floor(i / 4); return [100 + (row % 2 ? 3 - i % 4 : i % 4) * 170, 90 + row * 140]; });
  });

  function getUnit(unitId) {
    return (window.CURRICULUM || []).find(function (unit) { return unit.unitId === unitId; });
  }

  function statusFor(unit) {
    var progress = window.RikaState.progress(unit.unitId);
    if (progress.perfected) return "perfected";
    if (progress.bossCleared) return "bossCleared";
    if (progress.basicCleared) return "basicCleared";
    if (progress.unlocked) return "unlocked";
    return "locked";
  }

  function statusLabel(status) {
    return {
      locked: "ロック中",
      unlocked: "ちょうせんできる",
      basicCleared: "洞窟クリア",
      bossCleared: "ボスとうばつ",
      perfected: "全問正かい"
    }[status] || "";
  }

  function renderGradeTabs(activeGrade) {
    return '<div class="grade-tabs" role="tablist" aria-label="学年の大陸">' +
      [3,4,5,6].map(function (grade) { return '<button role="tab" id="grade-tab-' + grade + '" aria-controls="world-continent" tabindex="' + (activeGrade === grade ? '0' : '-1') + '" aria-selected="' + (activeGrade === grade) + '" type="button" class="tab-button ' + (activeGrade === grade ? 'is-active' : '') + '" data-grade="' + grade + '">' + grade + '年大陸</button>'; }).join('') +
      '</div>';
  }

  function renderNode(unit, index) {
    var p = (coords[unit.grade] || [])[index] || [100 + index * 50, 240];
    var c = window.RikaSVG.colors(unit.theme);
    var status = statusFor(unit);
    var progress = window.RikaState.progress(unit.unitId);
    var label = (unit.kind === 'chapter' ? '観察 ' : unit.unitNo + '. ') + unit.title;
    var icon = status === "locked"
      ? window.RikaSVG.lockIcon(p[0], p[1] - 2)
      : window.RikaSVG.caveIcon(p[0] - (status === "unlocked" ? 0 : 22), p[1], 0.72, unit.theme) +
        (status === "basicCleared" || status === "bossCleared" || status === "perfected" ? window.RikaSVG.castleIcon(p[0] + 25, p[1] - 1, 0.62, unit.theme) : "");
    return '<g class="map-node ' + status + '" data-unit-id="' + unit.unitId + '" role="button" tabindex="0" aria-label="' + window.RikaSVG.esc(label + " " + statusLabel(status)) + '">' +
      '<circle class="node-ring" cx="' + p[0] + '" cy="' + p[1] + '" r="45" fill="' + (status === 'locked' ? '#302553' : c.land) + '" stroke="#ffcf45"/>' +
      icon +
      window.RikaSVG.statusGlyph(status, p[0] + 31, p[1] - 31) +
      (progress.bonusPerfected ? '<circle cx="' + (p[0] - 32) + '" cy="' + (p[1] - 32) + '" r="16" fill="#ffd85a" stroke="#7b5200" stroke-width="3"/><text x="' + (p[0] - 32) + '" y="' + (p[1] - 27) + '" text-anchor="middle" font-size="17">🎓</text>' : "") +
      '<foreignObject x="' + (p[0] - 80) + '" y="' + (p[1] + 48) + '" width="160" height="80"><div xmlns="http://www.w3.org/1999/xhtml" class="node-name">' + window.RikaUI.renderFurigana(label) + '</div></foreignObject>' +
      '</g>';
  }

  function renderMap(activeGrade, selectedUnitId) {
    var grade = activeGrade || window.RikaState.get().settings.lastGrade;
    var units = (window.CURRICULUM || []).filter(function (unit) { return unit.grade === grade; });
    var selected = getUnit(selectedUnitId) || units.find(function (unit) { return window.RikaState.progress(unit.unitId).unlocked; }) || units[0];
    var lines = units.map(function (unit, index) {
      if (index === 0) return "";
      var a = coords[grade][index - 1];
      var b = coords[grade][index];
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#7a8b72" stroke-width="5" stroke-linecap="round" opacity=".45"/>';
    }).join("");
    return renderGradeTabs(grade) +
      '<div class="map-layout" id="world-continent" role="tabpanel" aria-labelledby="grade-tab-' + grade + '">' +
      '<section class="map-shell" aria-label="' + grade + '年大陸のワールドマップ">' +
      '<svg class="world-map" viewBox="0 0 720 ' + (grade < 5 ? 90 + Math.ceil(units.length / 4) * 140 : 560) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="720" height="560" fill="transparent"/>' +
      (grade < 5 ? '<rect x="20" y="20" width="680" height="' + (50 + Math.ceil(units.length / 4) * 140) + '" rx="45" fill="#375e65" opacity=".5"/>' : window.RikaSVG.continentPath(grade)) +
      lines +
      units.map(renderNode).join("") +
      '</svg></section>' +
      '<aside id="unit-card" class="unit-card rpg-frame">' + renderUnitCard(selected.unitId) + '</aside>' +
      '</div>';
  }

  function renderUnitCard(unitId) {
    var unit = getUnit(unitId);
    if (!unit) return '<p class="empty-state">単元が見つからないよ。</p>';
    var progress = window.RikaState.progress(unit.unitId);
    var bank = (window.QUESTION_BANK || {})[unit.unitId] || { basic: [], boss: [], bonus: [] };
    var status = statusFor(unit);
    var monsters = (unit.encounters || []).concat(unit.bossId || []).map(function (id) { return window.MONSTERS[id]; }).filter(Boolean);
    var monsterHtml = monsters.map(function (monster) {
      return '<span class="monster-mini">' + window.RikaMonsters.render(monster.id) + '<span>' + window.RikaUI.renderFurigana(monster.name) + '</span></span>';
    }).join("");
    var bossReady = progress.basicCleared && bank.boss && bank.boss.length;
    var bonusReady = progress.bonusUnlocked && bank.bonus && bank.bonus.length;
    return '<h2 data-card-unit="' + unit.unitId + '">' + unit.grade + '年 ' + (unit.kind === 'chapter' ? '観察 ' : unit.unitNo + '. ') + window.RikaUI.renderFurigana(unit.title) + '</h2>' +
      '<div class="unit-meta">' +
      '<span class="tag">' + window.RikaUI.escapeHtml(unit.theme) + '</span>' +
      '<span class="tag ' + (status === "locked" ? "warn" : "good") + '">' + statusLabel(status) + '</span>' +
      '<span class="tag">基本 ' + (bank.basic ? bank.basic.length : 0) + '問</span>' +
      '<span class="tag">ボス ' + (bank.boss ? bank.boss.length : 0) + '問（1回' + Math.min(unit.kind === 'chapter' ? 5 : 10, bank.boss.length) + '問）</span>' +
      '<span class="tag">おまけ ' + (bank.bonus ? bank.bonus.length : 0) + '問</span>' +
      (unit.kind === 'chapter' ? '' : progress.bonusPerfected ? '<span class="tag rare-tag">🎓全問正かい</span>' : '<span class="tag warn">★レア未入手</span>') +
      '</div>' +
      '<h3>小単元</h3><ol class="sub-list">' + unit.sub.map(function (sub) {
        return '<li>' + window.RikaUI.renderFurigana(sub.title) + ' <span class="tag">' + window.RikaUI.escapeHtml(sub.ref) + '</span></li>';
      }).join("") + '</ol>' +
      '<h3>出会うモンスター</h3><div class="monster-row">' + monsterHtml + '</div>' +
      '<div class="course-settings"><label>洞窟のコース<select data-course-limit><option value="0">全問（' + bank.basic.length + '問）</option><option value="5">短く5問</option><option value="10">短く10問</option></select></label><label>モード<select data-course-mode><option value="learn">学び直し（ライフなし）</option><option value="challenge">RPG挑戦（80%以上）</option></select></label></div>' +
      '<p>学んだ問題 ' + progress.seenQuestionIds.filter(function (id) { return bank.basic.some(function (q) { return q.id === id; }); }).length + ' / ' + bank.basic.length + '問</p>' +
      '<div class="button-row" style="margin-top:14px">' +
      '<button type="button" class="primary-button" data-start-tier="basic" ' + (!progress.unlocked ? "disabled" : "") + '>洞窟へ</button>' +
      '<button type="button" class="secondary-button" data-start-tier="boss" ' + (!bossReady ? "disabled" : "") + '>城へ</button>' +
      '<button type="button" class="ghost-button" data-start-tier="bonus" ' + (!bonusReady ? "disabled" : "") + '>🎓' + (unit.grade < 5 ? '上の学年へ' : '中学チャレンジ') + '</button>' +
      '<button type="button" class="secondary-button" data-start-tier="basic" data-context="everyday" ' + (!progress.unlocked || !bank.basic.some(function (q) { return q.context === 'everyday'; }) ? 'disabled' : '') + '>くらしの広場</button>' +
      '</div>' +
      '<p class="empty-state">' + fallbackText(progress, bank) + '</p>';
  }

  function fallbackText(progress, bank) {
    if (!progress.unlocked) return "前の単元の洞窟をクリアすると道が開くよ。";
    if (!progress.basicCleared) return "まずは洞窟で基本問題にちょうせんしよう。";
    if (!bank.boss || !bank.boss.length) return "城は準備中。洞窟は何度でも復習できるよ。";
    if (!progress.bossCleared) return "城に入れるよ。全問正かいでテーマそうびが手に入る。";
    if (!bank.bonus || !bank.bonus.length) return "この観察クエストはここまで。次の単元もたんけんしよう。";
    if (!progress.bonusPerfected) return "🎓おまけは本筋と別枠だよ。15問全問正かいで★レアそうびが手に入る。";
    return "🎓15問全問正かいずみ。★レアそうびも記録されているよ。";
  }

  function bind(root, grade) {
    root.querySelectorAll('[data-grade]').forEach(function (button) { button.addEventListener('keydown', function (event) {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      var grades = [3,4,5,6], index = grades.indexOf(grade);
      var next = event.key === 'Home' ? 3 : event.key === 'End' ? 6 : grades[(index + (event.key === 'ArrowRight' ? 1 : 3)) % 4];
      window.RikaApp.showMap(next);
      document.getElementById('grade-tab-' + next).focus();
    }); });
    root.querySelectorAll("[data-grade]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.RikaApp) window.RikaApp.showMap(Number(button.dataset.grade));
      });
    });
    root.querySelectorAll(".map-node").forEach(function (node) {
      function select() {
        var unit = getUnit(node.dataset.unitId);
        if (!unit) return;
        if (!window.RikaState.progress(unit.unitId).unlocked) {
          window.RikaUI.toast("この単元はまだロック中だよ。前の洞窟をクリアしよう。");
          return;
        }
        var card = root.querySelector("#unit-card");
        if (card) {
          card.innerHTML = renderUnitCard(unit.unitId);
          bindUnitCard(card, unit);
        }
      }
      node.addEventListener("click", select);
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });
    });
    var selected = root.querySelector("#unit-card h2");
    var firstUnit = (window.CURRICULUM || []).find(function (unit) { return unit.grade === grade && window.RikaState.progress(unit.unitId).unlocked; });
    bindUnitCard(root.querySelector("#unit-card"), firstUnit);
  }

  function bindUnitCard(card, unit) {
    if (!card) return;
    var heading = card.querySelector("h2");
    var unitId = heading && heading.dataset.cardUnit;
    card.querySelectorAll("[data-start-tier]").forEach(function (button) {
      button.addEventListener("click", function () {
        var startUnit = getUnit(unitId);
        var tier = button.dataset.startTier;
        var bank = startUnit && (window.QUESTION_BANK || {})[startUnit.unitId];
        if (!startUnit || !bank || !bank[tier] || !bank[tier].length) {
          window.RikaUI.toast(tier === "boss" ? "城は準備中だよ。" : "このチャレンジは準備中だよ。");
          return;
        }
        window.RikaBattle.start(startUnit.unitId, tier, { limit: Number(card.querySelector('[data-course-limit]').value), mode: card.querySelector('[data-course-mode]').value, context: button.dataset.context });
      });
    });
  }

  window.RikaMap = {
    render: renderMap,
    bind: bind,
    renderUnitCard: renderUnitCard,
    statusFor: statusFor,
    getUnit: getUnit
  };
})();
