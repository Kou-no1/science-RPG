(function () {
  var currentGrade = 5;

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
      '</div></div>';
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
      '<p class="lead">5年・6年の理科単元を、洞窟と城のクエストで進める学習ポータル。ぼうけんは自動で記録されるよ。</p>' +
      '<div class="button-row">' +
      '<button type="button" class="primary-button" data-home-map>マップへ</button>' +
      '<button type="button" class="secondary-button" data-home-solution>見本単元へ</button>' +
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
      '<section class="panel rpg-frame"><h2>今日の入口</h2><p>5年・単元7「物のとけ方」は完成形。基本、ボス、おまけまで通しで遊べるよ。</p><button type="button" class="primary-button" data-home-solution>物のとけ方へ</button></section>' +
      '</div>');
    bindHome();
    renderStatus();
  }

  function bindHome() {
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
    currentGrade = grade || currentGrade || 5;
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
