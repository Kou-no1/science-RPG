(function () {
  var battle = null;

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function unitById(unitId) {
    return (window.CURRICULUM || []).find(function (unit) { return unit.unitId === unitId; });
  }

  function tierLabel(tier) {
    return tier === "basic" ? "洞窟" : tier === "boss" ? "城" : "おまけ";
  }

  function start(unitId, tier) {
    var unit = unitById(unitId);
    var bank = unit && (window.QUESTION_BANK || {})[unit.unitId];
    var source = bank && bank[tier] ? bank[tier] : [];
    if (!unit || !source.length) {
      window.RikaUI.toast("このチャレンジは準備中だよ。");
      return;
    }
    var effects = window.RikaEquipment.effects();
    var questions = shuffle(source);
    var monster = window.RikaMonsters.choose(unit, tier);
    if (monster) window.RikaState.rememberMonster(monster.id, false);
    var extraLife = tier === "boss" ? 1 : 0;
    var maxLives = window.RikaState.get().player.hpBase + (effects.hpUp || 0) + extraLife;
    battle = {
      unit: unit,
      tier: tier,
      questions: questions,
      index: 0,
      lives: maxLives,
      maxLives: maxLives,
      enemyHp: tier === "boss" ? questions.length : questions.length,
      monster: monster,
      effects: effects,
      blockLeft: effects.block || 0,
      freeHintLeft: effects.freeHint || 0,
      usedHint: false,
      hiddenChoices: {},
      streak: 0,
      bestStreak: 0,
      perfect: true,
      answered: false,
      extraExp: 0,
      log: "エンカウント！ " + (monster ? monster.name : "モンスター") + "があらわれた。"
    };
    render();
  }

  function currentQuestion() {
    return battle.questions[battle.index];
  }

  function render() {
    var app = document.getElementById("app");
    if (!battle || !app) return;
    var q = currentQuestion();
    var hpPct = battle.questions.length ? (battle.enemyHp / battle.questions.length * 100) : 0;
    app.innerHTML = '<section class="battle-panel rpg-frame">' +
      '<div class="button-row" style="justify-content:space-between;margin-bottom:12px">' +
      '<button type="button" class="ghost-button" data-battle-exit>マップにもどる</button>' +
      (battle.tier === "bonus" ? '<span class="bonus-label">中学チャレンジ／科学トリビア</span>' : '<span class="tag">' + tierLabel(battle.tier) + '</span>') +
      '</div>' +
      '<div class="battle-grid">' +
      '<aside class="enemy-stage">' +
      '<div class="enemy-art">' + (battle.monster ? window.RikaMonsters.render(battle.monster.id) : "") + '</div>' +
      '<h2>' + (battle.monster ? window.RikaUI.renderFurigana(battle.monster.name) : "モンスター") + '</h2>' +
      '<div class="battle-stats">' +
      '<div><strong>モンスターHP</strong>' + window.RikaUI.progressBar(hpPct, "モンスターHP") + '</div>' +
      '<div><strong>ライフ</strong>' + window.RikaUI.hearts(battle.lives, battle.maxLives) + '</div>' +
      '<div class="reward-row"><span class="tag">れんぞく ' + battle.streak + '</span><span class="tag">ブロック ' + battle.blockLeft + '</span><span class="tag">ヒント ' + hintCount() + '</span></div>' +
      '<div class="quest-log"><p>' + window.RikaUI.renderFurigana(battle.log) + '</p></div>' +
      '</div></aside>' +
      '<section class="question-card">' +
      '<div class="question-count">問題 ' + (battle.index + 1) + ' / ' + battle.questions.length + ' ・ ' + window.RikaUI.escapeHtml(q.skill) + '</div>' +
      '<p class="question-stem">' + window.RikaUI.renderFurigana(q.stem) + '</p>' +
      '<div class="battle-tools">' +
      '<button type="button" class="secondary-button" data-use-item="hint_scroll" ' + (canUseHint() ? "" : "disabled") + '>ヒント</button>' +
      '<button type="button" class="secondary-button" data-use-item="potion" ' + (canUsePotion() ? "" : "disabled") + '>ポーション</button>' +
      '</div>' +
      renderChoices(q) +
      '<div id="feedback" class="feedback"></div>' +
      '</section></div></section>';
    bind();
    if (window.RikaApp) window.RikaApp.renderStatus();
  }

  function renderChoices(q) {
    var classes = q.type === "ox" ? "choice-grid ox" : "choice-grid";
    return '<div class="' + classes + '">' + q.choices.map(function (choice, index) {
      var hidden = battle.hiddenChoices[q.id] && battle.hiddenChoices[q.id].indexOf(index) !== -1;
      return '<button type="button" class="choice-button" data-choice="' + index + '" ' + (hidden ? "disabled hidden" : "") + '>' +
        '<span class="choice-prefix">' + (q.type === "ox" ? "" : String.fromCharCode(65 + index) + ". ") + '</span>' +
        window.RikaUI.renderFurigana(choice) +
        '</button>';
    }).join("") + '</div>';
  }

  function hintCount() {
    return battle.freeHintLeft + (window.RikaState.get().owned.items.hint_scroll || 0);
  }

  function canUseHint() {
    var q = currentQuestion();
    return !battle.answered && q.type === "mc4" && !battle.usedHint && hintCount() > 0;
  }

  function canUsePotion() {
    return !battle.answered && battle.lives < battle.maxLives && (window.RikaState.get().owned.items.potion || 0) > 0;
  }

  function bind() {
    document.querySelectorAll("[data-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        answer(Number(button.dataset.choice));
      });
    });
    var exit = document.querySelector("[data-battle-exit]");
    if (exit) exit.addEventListener("click", function () { if (window.RikaApp) window.RikaApp.showMap(battle.unit.grade); });
    document.querySelectorAll("[data-use-item]").forEach(function (button) {
      button.addEventListener("click", function () {
        useTool(button.dataset.useItem);
      });
    });
  }

  function useTool(id) {
    if (id === "hint_scroll" && canUseHint()) {
      if (battle.freeHintLeft > 0) {
        battle.freeHintLeft -= 1;
      } else if (!window.RikaState.spendItem("hint_scroll", 1)) {
        return;
      }
      var q = currentQuestion();
      var wrong = q.choices.map(function (_, index) { return index; }).filter(function (index) { return index !== q.answer; });
      battle.hiddenChoices[q.id] = shuffle(wrong).slice(0, 2);
      battle.usedHint = true;
      battle.log = "ヒントでまちがいの答えを2つ消したよ。";
      render();
      return;
    }
    if (id === "potion" && canUsePotion() && window.RikaState.spendItem("potion", 1)) {
      battle.lives = Math.min(battle.maxLives, battle.lives + 1);
      battle.log = "元気ポーションでライフが1つ回復した。";
      render();
    }
  }

  function answer(choiceIndex) {
    if (!battle || battle.answered) return;
    battle.answered = true;
    var q = currentQuestion();
    var correct = choiceIndex === q.answer;
    var feedback = document.getElementById("feedback");
    document.querySelectorAll("[data-choice]").forEach(function (button) {
      var index = Number(button.dataset.choice);
      button.disabled = true;
      if (index === q.answer) button.classList.add("is-correct");
      if (index === choiceIndex && !correct) button.classList.add("is-wrong");
    });

    if (correct) {
      battle.streak += 1;
      battle.bestStreak = Math.max(battle.bestStreak, battle.streak);
      battle.enemyHp = Math.max(0, battle.enemyHp - 1);
      battle.log = "やったー！ こうげき成功！";
      var flourish = "";
      if ((battle.effects.critUp || 0) > 0 && Math.random() < battle.effects.critUp) {
        battle.enemyHp = Math.max(0, battle.enemyHp - 1);
        battle.extraExp += 25;
        flourish = " 会心の一撃！";
      }
      if (battle.streak > 0 && battle.streak % 3 === 0) {
        battle.extraExp += 20 + (battle.effects.comboUp || 0) * 10;
        flourish += " " + battle.streak + "コンボ！";
      }
      if (feedback) feedback.className = "feedback is-visible good";
      if (feedback) feedback.innerHTML = '<div class="feedback-mark">✓ 正かい！' + window.RikaUI.renderFurigana(flourish) + '</div><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>' + nextButton();
      window.RikaAudio.ok();
    } else {
      battle.perfect = false;
      battle.streak = 0;
      if (battle.blockLeft > 0) {
        battle.blockLeft -= 1;
        battle.log = "けっしょうの盾が守ってくれた！";
      } else {
        battle.lives -= 1;
        battle.log = "おしい！ 解説を読んで次につなげよう。";
      }
      if (feedback) feedback.className = "feedback is-visible bad";
      if (feedback) feedback.innerHTML = '<div class="feedback-mark">✗ おしい！</div><p>正かいは「' + window.RikaUI.renderFurigana(q.choices[q.answer]) + '」。</p><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>' + nextButton();
      window.RikaAudio.bad();
    }
    if (battle.lives <= 0) {
      var next = document.querySelector("[data-next-question]");
      if (next) next.textContent = "リザルトへ";
    }
    var nextButtonEl = document.querySelector("[data-next-question]");
    if (nextButtonEl) {
      nextButtonEl.addEventListener("click", advance);
      nextButtonEl.focus();
    }
  }

  function nextButton() {
    return '<button type="button" class="primary-button" data-next-question>つぎへ</button>';
  }

  function advance() {
    if (battle.lives <= 0) {
      finish(false);
      return;
    }
    battle.index += 1;
    battle.answered = false;
    battle.usedHint = false;
    if (battle.index >= battle.questions.length) {
      var success = battle.tier === "boss" || battle.tier === "bonus" ? battle.lives > 0 : battle.enemyHp <= 0;
      finish(success);
      return;
    }
    render();
  }

  function finish(success) {
    var result = window.RikaRewards.handleBattleResult({
      unit: battle.unit,
      tier: battle.tier,
      success: success,
      perfect: battle.perfect && success,
      bestStreak: battle.bestStreak,
      extraExp: battle.extraExp
    });
    if (success && battle.monster) window.RikaState.rememberMonster(battle.monster.id, true);
    if (success && window.RikaAudio) window.RikaAudio.reward();
    var app = document.getElementById("app");
    var title = success ? "クエストクリア！" : "もう一度ちょうせん";
    app.innerHTML = '<section class="panel rpg-frame">' +
      '<h2>' + title + '</h2>' +
      '<p>' + window.RikaUI.renderFurigana(success ? "よくがんばったね。ぼうけんは自動で記録されたよ。" : "おしい！ 復習して、もう一度ちょうせんしよう。") + '</p>' +
      '<ul class="result-list">' + result.messages.map(function (message) { return '<li>' + window.RikaUI.renderFurigana(message) + '</li>'; }).join("") + '</ul>' +
      '<div class="button-row" style="margin-top:16px">' +
      '<button type="button" class="primary-button" data-result-map>マップへ</button>' +
      '<button type="button" class="secondary-button" data-result-retry>もう一度</button>' +
      '<button type="button" class="ghost-button" data-result-inventory>そうびを見る</button>' +
      '</div></section>';
    document.querySelector("[data-result-map]").addEventListener("click", function () { window.RikaApp.showMap(battle.unit.grade, battle.unit.unitId); });
    document.querySelector("[data-result-retry]").addEventListener("click", function () { start(battle.unit.unitId, battle.tier); });
    document.querySelector("[data-result-inventory]").addEventListener("click", function () { window.RikaApp.showInventory("equipment"); });
    if (window.RikaApp) window.RikaApp.renderStatus();
  }

  window.RikaBattle = {
    start: start
  };
})();
