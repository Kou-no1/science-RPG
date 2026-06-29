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
      '<button type="button" class="tab-button ' + (activeGrade === 5 ? "is-active" : "") + '" data-grade="5">5年大陸</button>' +
      '<button type="button" class="tab-button ' + (activeGrade === 6 ? "is-active" : "") + '" data-grade="6">6年大陸</button>' +
      '</div>';
  }

  function renderNode(unit, index) {
    var p = (coords[unit.grade] || [])[index] || [100 + index * 50, 240];
    var c = window.RikaSVG.colors(unit.theme);
    var status = statusFor(unit);
    var label = unit.unitNo + ". " + unit.title;
    var icon = status === "locked"
      ? window.RikaSVG.lockIcon(p[0], p[1] - 2)
      : window.RikaSVG.caveIcon(p[0] - (status === "unlocked" ? 0 : 22), p[1], 0.72, unit.theme) +
        (status === "basicCleared" || status === "bossCleared" || status === "perfected" ? window.RikaSVG.castleIcon(p[0] + 25, p[1] - 1, 0.62, unit.theme) : "");
    return '<g class="map-node ' + status + '" data-unit-id="' + unit.unitId + '" role="button" tabindex="0" aria-label="' + window.RikaSVG.esc(label + " " + statusLabel(status)) + '">' +
      '<circle class="node-ring" cx="' + p[0] + '" cy="' + p[1] + '" r="45" fill="' + c.land + '" stroke="#ffcf45"/>' +
      icon +
      window.RikaSVG.statusGlyph(status, p[0] + 31, p[1] - 31) +
      '<text x="' + p[0] + '" y="' + (p[1] + 66) + '" class="node-label">' + window.RikaSVG.esc(unit.unitNo + " " + unit.title) + '</text>' +
      '</g>';
  }

  function renderMap(activeGrade, selectedUnitId) {
    var grade = activeGrade || 5;
    var units = (window.CURRICULUM || []).filter(function (unit) { return unit.grade === grade; });
    var selected = getUnit(selectedUnitId) || units.find(function (unit) { return window.RikaState.progress(unit.unitId).unlocked; }) || units[0];
    var lines = units.map(function (unit, index) {
      if (index === 0) return "";
      var a = coords[grade][index - 1];
      var b = coords[grade][index];
      return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#7a8b72" stroke-width="5" stroke-linecap="round" opacity=".45"/>';
    }).join("");
    return renderGradeTabs(grade) +
      '<div class="map-layout">' +
      '<section class="map-shell" aria-label="' + grade + '年大陸のワールドマップ">' +
      '<svg class="world-map" viewBox="0 0 720 560" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="720" height="560" fill="transparent"/>' +
      window.RikaSVG.continentPath(grade) +
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
    var monsters = window.RikaMonsters.byTheme(unit.theme);
    if (unit.unitId === "g5_u07") monsters = window.RikaMonsters.byTheme("solution");
    var monsterHtml = monsters.slice(0, unit.unitId === "g5_u07" ? 6 : 2).map(function (monster) {
      return '<span class="monster-mini">' + window.RikaMonsters.render(monster.id) + '<span>' + window.RikaUI.renderFurigana(monster.name) + '</span></span>';
    }).join("");
    var bossReady = progress.basicCleared && bank.boss && bank.boss.length;
    var bonusReady = progress.bonusUnlocked && bank.bonus && bank.bonus.length;
    return '<h2>' + unit.grade + '年 ' + unit.unitNo + '. ' + window.RikaUI.renderFurigana(unit.title) + '</h2>' +
      '<div class="unit-meta">' +
      '<span class="tag">' + window.RikaUI.escapeHtml(unit.theme) + '</span>' +
      '<span class="tag ' + (status === "locked" ? "warn" : "good") + '">' + statusLabel(status) + '</span>' +
      '<span class="tag">基本 ' + (bank.basic ? bank.basic.length : 0) + '問</span>' +
      '<span class="tag">ボス ' + (bank.boss ? bank.boss.length : 0) + '問</span>' +
      '</div>' +
      '<h3>小単元</h3><ol class="sub-list">' + unit.sub.map(function (sub) {
        return '<li>' + window.RikaUI.renderFurigana(sub.title) + ' <span class="tag">' + window.RikaUI.escapeHtml(sub.ref) + '</span></li>';
      }).join("") + '</ol>' +
      '<h3>出会うモンスター</h3><div class="monster-row">' + monsterHtml + '</div>' +
      '<div class="button-row" style="margin-top:14px">' +
      '<button type="button" class="primary-button" data-start-tier="basic" ' + (!progress.unlocked ? "disabled" : "") + '>洞窟へ</button>' +
      '<button type="button" class="secondary-button" data-start-tier="boss" ' + (!bossReady ? "disabled" : "") + '>城へ</button>' +
      '<button type="button" class="ghost-button" data-start-tier="bonus" ' + (!bonusReady ? "disabled" : "") + '>おまけ</button>' +
      '</div>' +
      '<p class="empty-state">' + fallbackText(progress, bank) + '</p>';
  }

  function fallbackText(progress, bank) {
    if (!progress.unlocked) return "前の単元の洞窟をクリアすると道が開くよ。";
    if (!progress.basicCleared) return "まずは洞窟で基本問題にちょうせんしよう。";
    if (!bank.boss || !bank.boss.length) return "城は準備中。洞窟は何度でも復習できるよ。";
    if (!progress.bossCleared) return "城に入れるよ。全問正かいでテーマそうびが手に入る。";
    if (!bank.bonus || !bank.bonus.length) return "おまけは準備中。";
    return "おまけは本筋と別枠のチャレンジだよ。";
  }

  function bind(root, grade) {
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
    var unitId = unit && unit.unitId;
    if (heading) {
      var text = heading.textContent;
      var match = text.match(/(\d+)年\s+(\d+)\./);
      if (match) {
        var found = (window.CURRICULUM || []).find(function (item) {
          return item.grade === Number(match[1]) && item.unitNo === Number(match[2]);
        });
        if (found) unitId = found.unitId;
      }
    }
    card.querySelectorAll("[data-start-tier]").forEach(function (button) {
      button.addEventListener("click", function () {
        var startUnit = getUnit(unitId);
        var tier = button.dataset.startTier;
        var bank = startUnit && (window.QUESTION_BANK || {})[startUnit.unitId];
        if (!startUnit || !bank || !bank[tier] || !bank[tier].length) {
          window.RikaUI.toast(tier === "boss" ? "城は準備中だよ。" : "このチャレンジは準備中だよ。");
          return;
        }
        window.RikaBattle.start(startUnit.unitId, tier);
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
