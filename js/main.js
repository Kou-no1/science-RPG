(function () {
  var currentGrade = 3;

  function appRoot() {
    return document.getElementById("app");
  }

  function setView(html) {
    var root = appRoot();
    root.innerHTML = html;
    root.focus({ preventScroll: true });
  }

  function renderStatus() {
    var root = document.getElementById("status-bar");
    if (!root || !window.RikaState) return;
    var data = window.RikaState.get();
    document.body.classList.toggle('reduce-motion', data.settings.motion === false);
    var info = window.RikaState.levelInfo(data.player.exp);
    var equipped = data.player.equipped;
    root.innerHTML = '<div class="hud">' +
      '<div class="lv"><b>' + info.level + '</b><small>Lv</small></div>' +
      '<div class="who">' +
      '<div class="name">' + window.RikaUI.escapeHtml(data.player.name) + '</div>' +
      '<div class="xp" role="progressbar" aria-label="経験値" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(info.percent) + '"><i style="width:' + info.percent + '%"></i></div>' +
      '<div class="exp-text">' + info.current + " / " + info.next + ' EXP</div>' +
      '</div>' +
      '<div class="gear">' +
      window.RikaEquipment.slots.map(function (slot) {
        var id = equipped[slot];
        var item = id && window.EQUIPMENT[id];
        return '<span class="slot ' + (item && item.rarity === "rare" ? "rare" : "") + '" title="' + window.RikaUI.escapeHtml(item ? window.RikaUI.renderPlain(item.name) : "未そうび") + '">' + window.RikaSVG.slotIcon(slot, 24) + '</span>';
      }).join("") +
      '</div></div>' + (!window.RikaState.isPersisted() ? '<p class="save-warning" role="status">保存できないため、この画面だけの記録だよ。設定から書き出してね。</p>' : '');
  }

  function showHome() {
    var data = window.RikaState.get();
    var total = (window.CURRICULUM || []).length;
    var basicCleared = Object.keys(data.progress).filter(function (id) { return data.progress[id].basicCleared; }).length;
    var bossCleared = Object.keys(data.progress).filter(function (id) { return data.progress[id].bossCleared; }).length;
    setView('<section class="hero-panel rpg-frame">' +
      '<div class="hero-scene">' +
      '<div class="hero-content">' +
      '<div>' +
      '<h2 class="hero-title">リカ・クエスト</h2>' +
      '<p class="lead">3年・4年・5年・6年の大陸へ。ぼうけんは じどうで きろくされるよ。</p>' +
      '<div class="button-row">' +
      '<button type="button" class="primary-button" data-home-map>マップへ</button>' +
      (data.activeSession ? '<button type="button" class="secondary-button" data-resume>途中からつづける</button>' : '') +
      '<button type="button" class="ghost-button" data-home-inventory>そうびを見る</button>' +
      '</div>' +
      '<form class="name-form" data-name-form>' +
      '<label><span class="sr-only">プレイヤー名</span><input name="name" maxlength="16" value="' + window.RikaUI.escapeHtml(data.player.name) + '" placeholder="名前"></label>' +
      '<button type="submit" class="secondary-button">名前を記録</button>' +
      '</form>' +
      '</div>' +
      '<div class="home-hero">' + window.RikaSVG.hero() + '</div>' +
      '</div></div></section>' +
      '<div class="view-grid" style="margin-top:18px">' +
      '<section class="panel rpg-frame"><h2>進み具合</h2><ul class="info-list">' +
      '<li><span class="status-flag">⚑</span><span>洞窟クリア：' + basicCleared + ' / ' + total + '</span></li>' +
      '<li><span class="status-crown">♛</span><span>ボスとうばつ：' + bossCleared + ' / ' + total + '</span></li>' +
      '<li><span class="status-gear">★</span><span>全問正かいそうび：' + data.owned.equipment.length + 'こ</span></li>' +
      '</ul></section>' +
      '<section class="panel rpg-frame"><h2>研究ノート</h2><p>これまでの正かい：' + Object.keys(data.questionStats).filter(function (id) { return data.questionStats[id].lastCorrect; }).length + '問</p><button type="button" class="primary-button" data-home-notebook>ノートを開く</button></section>' +
      '</div>');
    bindHome();
    renderStatus();
  }

  function bindHome() {
    var resume = document.querySelector('[data-resume]');
    if (resume) resume.addEventListener('click', window.RikaBattle.resume);
    var notebook = document.querySelector('[data-home-notebook]');
    if (notebook) notebook.addEventListener('click', function () { showInventory('notebook'); });
    document.querySelectorAll("[data-home-map]").forEach(function (button) {
      button.addEventListener("click", function () { showMap(currentGrade); });
    });
    document.querySelectorAll("[data-home-solution]").forEach(function (button) {
      button.addEventListener("click", function () { showMap(5, "g5_u07"); });
    });
    document.querySelectorAll("[data-home-inventory]").forEach(function (button) {
      button.addEventListener("click", function () { showInventory("equipment"); });
    });
    var form = document.querySelector("[data-name-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        window.RikaState.setName(new FormData(form).get("name"));
        window.RikaUI.toast("名前を記録したよ。");
        renderStatus();
      });
    }
  }

  function showMap(grade, selectedUnitId) {
    currentGrade = [3,4,5,6].includes(grade) ? grade : currentGrade;
    window.RikaState.get().settings.lastGrade = currentGrade;
    window.RikaState.save();
    setView(window.RikaMap.render(currentGrade, selectedUnitId));
    window.RikaMap.bind(appRoot(), currentGrade);
    renderStatus();
  }

  function showInventory(activeTab) {
    setView(window.RikaInventory.render(activeTab || "equipment"));
    window.RikaInventory.bind(appRoot());
    renderStatus();
  }

  function showSettings() {
    var settings = window.RikaState.get().settings;
    setView('<section class="panel rpg-frame"><h2>設定</h2><div class="settings-grid">' +
      '<label class="toggle-line"><span><strong>ルビ</strong><br>むずかしい漢字の読みがなを表示する。</span><input type="checkbox" data-setting="furigana" ' + (settings.furigana !== false ? "checked" : "") + '></label>' +
      '<label class="toggle-line"><span><strong>音</strong><br>WebAudioの短い効果音を鳴らす。</span><input type="checkbox" data-setting="sound" ' + (settings.sound !== false ? "checked" : "") + '></label>' +
      '<label class="toggle-line"><span><strong>アニメーション</strong></span><input type="checkbox" data-setting="motion" ' + (settings.motion !== false ? 'checked' : '') + '></label>' +
      '<div class="button-row"><button class="secondary-button" data-export>記録を書き出す</button><label class="import-label">記録を読みこむ<input type="file" accept="application/json,.json" data-import></label></div>' +
      '<div class="empty-state">セーブキー：rika_quest_save_v1</div>' +
      '<button type="button" class="danger-button" data-reset>最初からやり直す</button>' +
      '</div></section>');
    appRoot().querySelectorAll("[data-setting]").forEach(function (input) {
      input.addEventListener("change", function () {
        window.RikaState.get().settings[input.dataset.setting] = input.checked;
        window.RikaState.save();
        window.RikaUI.toast("設定を保存したよ。");
        showSettings();
      });
    });
    var reset = appRoot().querySelector("[data-reset]");
    appRoot().querySelector('[data-export]').addEventListener('click', function () {
      var blob = new Blob([window.RikaState.exportData()], {type:'application/json'});
      var url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'rika-quest-save.json'; link.click();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    appRoot().querySelector('[data-import]').addEventListener('change', async function (event) {
      var file = event.target.files[0];
      if (!file) return;
      if (file.size > 2000000) { window.RikaUI.toast('ファイルが大きすぎるよ。'); return; }
      var text = await file.text();
      try { window.RikaState.normalize(JSON.parse(text)); } catch (error) { window.RikaUI.toast('この記録は読みこめないよ。今の記録は残っているよ。'); return; }
      window.RikaUI.confirm('記録を読みこむ', '今の記録を、選んだファイルの記録に入れかえる？', function () {
        window.RikaState.importData(text); currentGrade = window.RikaState.get().settings.lastGrade; showHome(); window.RikaUI.toast('記録を読みこんだよ。');
      });
    });
    reset.addEventListener("click", function () {
      window.RikaUI.confirm("セーブをリセット", "今のぼうけん記録を消して、最初から始めるよ。よろしいですか？", function () {
        window.RikaState.reset();
        window.RikaUI.toast("セーブをリセットしたよ。");
        showHome();
      });
    });
    renderStatus();
  }

  function bindNav() {
    document.querySelectorAll("[data-route]").forEach(function (button) {
      button.addEventListener("click", function () {
        var route = button.dataset.route;
        if (route === "map") showMap(currentGrade);
        else if (route === "inventory") showInventory("equipment");
        else if (route === "settings") showSettings();
        else showHome();
      });
    });
  }

  function init() {
    window.RikaState.load();
    currentGrade = window.RikaState.get().settings.lastGrade;
    bindNav();
    showHome();
  }

  window.RikaApp = {
    init: init,
    renderStatus: renderStatus,
    showHome: showHome,
    showMap: showMap,
    showInventory: showInventory,
    showSettings: showSettings
  };

  document.addEventListener("DOMContentLoaded", init);
})();
