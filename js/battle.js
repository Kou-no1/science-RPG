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

  function prepareQuestion(question) {
    var prepared = Object.assign({}, question, {
      choices: (question.choices || []).slice()
    });
    if (prepared.type !== "mc4") return prepared;

    var indexedChoices = prepared.choices.map(function (choice, index) {
      return { choice: choice, originalIndex: index };
    });
    var shuffledChoices = shuffle(indexedChoices);
    prepared.choices = shuffledChoices.map(function (item) { return item.choice; });
    prepared.answer = shuffledChoices.findIndex(function (item) {
      return item.originalIndex === question.answer;
    });
    return prepared;
  }

  function prepareQuestions(source) {
    return shuffle(source).map(prepareQuestion);
  }

  function unitById(unitId) {
    return (window.CURRICULUM || []).find(function (unit) { return unit.unitId === unitId; });
  }

  function tierLabel(tier) {
    return tier === "basic" ? "洞窟" : tier === "boss" ? "城" : "おまけ";
  }

  function start(unitId, tier, options) {
    options = options || {};
    var unit = unitById(unitId);
    var bank = unit && (window.QUESTION_BANK || {})[unit.unitId];
    var source = bank && bank[tier] ? bank[tier] : [];
    var progress = unit && window.RikaState.progress(unitId);
    if (!progress || !progress.unlocked || (tier !== "basic" && !progress.basicCleared)) {
      window.RikaUI.toast("先に手前の洞窟をクリアしてね。");
      return;
    }
    if (options.context === "everyday") source = source.filter(function (q) { return q.context === "everyday"; });
    if (options.review) source = source.filter(function (q) { var s = window.RikaState.get().questionStats[q.id]; return s && !s.lastCorrect; });
    if (!unit || !source.length) {
      window.RikaUI.toast("このチャレンジは準備中だよ。");
      return;
    }
    var effects = window.RikaEquipment.effects();
    if (window.RikaState.get().activeSession && !options.replace) {
      window.RikaUI.confirm("新しいぼうけん", "途中のぼうけんをやめて、新しくはじめる？", function () { start(unitId, tier, Object.assign({}, options, { replace: true })); });
      return;
    }
    var requestedLimit = [5, 10].includes(Number(options.limit)) ? Number(options.limit) : source.length;
    var limit = tier === "boss" ? Math.min(unit.kind === "chapter" ? 5 : 10, source.length) : tier === "bonus" ? source.length : Math.min(requestedLimit, source.length);
    var selected = [];
    if (tier === "basic" && limit < source.length && !options.review) {
      var key = unitId + ":" + (options.context || "standard");
      var bags = window.RikaState.get().questionBags;
      var bagIds = Array.isArray(bags[key]) ? bags[key].filter(function (id) { return source.some(function (q) { return q.id === id; }); }) : [];
      if (!bagIds.length) bagIds = shuffle(source).map(function (q) { return q.id; });
      selected = bagIds.splice(0, limit).map(function (id) { return source.find(function (q) { return q.id === id; }); });
      bags[key] = bagIds;
    } else if (tier === "boss") {
      var groups = {};
      shuffle(source).forEach(function (q) { var key = q.subId || "all"; (groups[key] = groups[key] || []).push(q); });
      while (selected.length < limit) Object.keys(groups).forEach(function (key) { if (groups[key].length && selected.length < limit) selected.push(groups[key].pop()); });
    } else selected = shuffle(source).slice(0, limit);
    var questions = selected.map(prepareQuestion);
    var monster = tier === 'basic' && (unit.encounters || []).includes(options.monsterId) ? window.MONSTERS[options.monsterId] : window.RikaMonsters.choose(unit, tier);
    if (monster) window.RikaState.rememberMonster(monster.id, false);
    var extraLife = tier === "boss" || tier === "bonus" ? 1 : 0;
    var maxLives = window.RikaState.get().player.hpBase + (effects.hpUp || 0) + extraLife;
    battle = {
      unit: unit,
      sessionId: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      options: options,
      mode: options.review || (tier === "basic" && options.mode !== "challenge") ? "learn" : "challenge",
      tier: tier,
      questions: questions,
      index: 0,
      lives: maxLives,
      maxLives: maxLives,
      enemyHp: tier === "basic" ? Math.min(5, questions.length) : Math.ceil(questions.length * .8),
      enemyMax: tier === "basic" ? Math.min(5, questions.length) : Math.ceil(questions.length * .8),
      firstCorrectCount: 0,
      misses: 0,
      initialCount: questions.length,
      reviewQueue: [],
      reviewing: false,
      wave: 0,
      waves: [],
      monster: monster,
      effects: effects,
      blockLeft: effects.block || 0,
      freeHintLeft: (effects.freeHint || 0) + (effects.hintFree || 0),
      reviveLeft: effects.reviveOnce || 0,
      comboKeepLeft: effects.comboKeep || 0,
      usedHint: false,
      hiddenChoices: {},
      streak: 0,
      bestStreak: 0,
      perfect: true,
      answered: false,
      extraExp: 0,
      log: "エンカウント！ " + (monster ? monster.name : "モンスター") + "があらわれた。"
    };
    if (battle.mode === "challenge" && tier === "basic") battle.enemyHp = battle.enemyMax = Math.ceil(Math.min(5, questions.length) * .8);
    battle.waves.push({ monsterId: monster && monster.id, hp: battle.enemyHp, max: battle.enemyMax });
    persist();
    render();
  }

  function persist() {
    window.RikaState.get().activeSession = JSON.parse(JSON.stringify(battle));
    window.RikaState.save();
  }

  function resume() {
    var stored = window.RikaState.get().activeSession;
    if (!stored) return;
    var unit = unitById(stored.unit && stored.unit.unitId);
    var source = unit && (window.QUESTION_BANK[unit.unitId] || {})[stored.tier];
    var monster = stored.monster && window.MONSTERS[stored.monster.id];
    var valid = source && typeof stored.sessionId === "string" && /^[a-z0-9]+$/i.test(stored.sessionId) && Array.isArray(stored.questions) && stored.questions.length && Number.isInteger(stored.index) && stored.index >= 0 && stored.index < stored.questions.length && Number.isFinite(stored.lives) && stored.lives >= 0 && stored.lives <= 20 && stored.effects && stored.options && Array.isArray(stored.waves) && stored.waves[stored.wave] && Array.isArray(stored.reviewQueue) && Number.isInteger(stored.initialCount) && stored.initialCount > 0 && stored.initialCount <= source.length && ['learn','challenge'].includes(stored.mode) && stored.questions.every(function (q) {
      var original = q && source.find(function (x) { return x.id === q.id; });
      return original && Array.isArray(q.choices) && Number.isInteger(q.answer) && (original.contentVersion || 1) === (q.contentVersion || 1) && original.choices.slice().sort().join("\n") === q.choices.slice().sort().join("\n") && q.choices[q.answer] === original.choices[original.answer];
    });
    valid = valid && monster && stored.hiddenChoices && typeof stored.hiddenChoices === "object" &&
      ["maxLives", "enemyHp", "enemyMax", "firstCorrectCount", "misses", "wave", "blockLeft", "freeHintLeft", "reviveLeft", "comboKeepLeft", "streak", "bestStreak", "extraExp"].every(function (key) { return Number.isFinite(stored[key]) && stored[key] >= 0; }) &&
      stored.enemyMax > 0 && stored.enemyHp <= stored.enemyMax && stored.lives <= stored.maxLives &&
      stored.firstCorrectCount <= stored.initialCount && stored.reviewQueue.every(function (item) {
        var original = item && item.question && source.find(function (q) { return q.id === item.question.id; });
        return original && Number.isInteger(item.wave) && !!stored.waves[item.wave] && Array.isArray(item.question.choices) &&
          Number.isInteger(item.question.answer) && item.question.choices[item.question.answer] === original.choices[original.answer] &&
          original.choices.slice().sort().join("\n") === item.question.choices.slice().sort().join("\n");
      });
    if (!valid) {
      window.RikaState.get().activeSession = null;
      window.RikaState.save();
      window.RikaUI.toast("問題が新しくなったので、マップからもう一度はじめてね。学習記録は残っているよ。");
      return;
    }
    battle = stored;
    battle.unit = unit;
    battle.questions = stored.questions.map(function (q) {
      return Object.assign({}, source.find(function (original) { return original.id === q.id; }), { choices: q.choices.slice(), answer: q.answer });
    });
    battle.reviewQueue = stored.reviewQueue.map(function (item) {
      return { wave: item.wave, question: Object.assign({}, source.find(function (q) { return q.id === item.question.id; }), { choices: item.question.choices.slice(), answer: item.question.answer }) };
    });
    battle.monster = monster;
    render();
  }

  function currentQuestion() {
    return battle.questions[battle.index];
  }

  function render() {
    var app = document.getElementById("app");
    if (!battle || !app) return;
    var q = currentQuestion();
    var retainedStage = document.querySelector('[data-session="' + battle.sessionId + '"]');
    var hpPct = battle.enemyMax ? (battle.enemyHp / battle.enemyMax * 100) : 0;
    app.innerHTML = '<section class="battle-panel rpg-frame tier-' + battle.tier + '">' +
      '<div class="battle-topbar">' +
      '<button type="button" class="ghost-button" data-battle-exit>マップにもどる</button>' +
      (battle.tier === "bonus" ? '<span class="bonus-label">' + (battle.unit.grade < 5 ? '上の学年チャレンジ' : '中学チャレンジ／科学トリビア') + '</span>' : '<span class="tag">' + tierLabel(battle.tier) + ' ・ ' + (battle.mode === 'learn' ? '学び直し' : 'RPG挑戦') + '</span>') +
      '</div>' +
      '<div class="battle-stage" data-battle-stage data-session="' + battle.sessionId + '">' +
      '<div class="stage-ground"></div>' +
      '<div class="enemy-bar"><div class="enemy-bar-row"><span data-enemy-name>' + (battle.monster ? window.RikaUI.renderFurigana(battle.monster.name) : "モンスター") + '</span><span class="tag">Lv ' + Math.max(1, battle.unit.unitNo + (battle.tier === "boss" ? 4 : battle.tier === "bonus" ? 6 : 1)) + '</span></div>' +
      window.RikaUI.progressBar(hpPct, "モンスターHP") + '</div>' +
      '<aside class="enemy-stage">' +
      '<div class="enemy-art" data-enemy-art data-monster="' + (battle.monster ? battle.monster.id : '') + '">' + renderMonsterArt() + '</div>' +
      '<div class="battle-stats" data-live-hud>' +
      '<div><strong>ライフ</strong>' + window.RikaUI.hearts(battle.lives, battle.maxLives) + '</div>' +
      '<div class="reward-row"><span class="tag">れんぞく ' + battle.streak + '</span><span class="tag">ブロック ' + battle.blockLeft + '</span><span class="tag">ヒント ' + hintCount() + '</span><span class="tag">復活 ' + battle.reviveLeft + '</span></div>' +
      '<div class="quest-log"><p>' + window.RikaUI.renderFurigana(battle.log) + '</p></div>' +
      '</div></aside>' +
      '<div class="battle-hero">' + window.RikaSVG.hero() + '</div>' +
      '<div class="battle-flash"><div class="battle-word" data-battle-word></div></div>' +
      '</div>' +
      '<section class="question-card">' +
      '<div class="question-count">' + (battle.reviewing ? '学び直し ' + (battle.index - battle.initialCount + 1) : '問題 ' + (battle.index + 1) + ' / ' + battle.initialCount) + ' ・ ' + ({term:'ようご',experiment:'じっけん・かんさつ',concept:'考え方'}[q.skill]) + '</div>' +
      (battle.tier === "bonus" ? '<div class="tag">' + window.RikaUI.escapeHtml(q.bonusCategory === 'next_grade' ? '上の学年で学ぶよ' : q.bonusCategory === 'trivia' ? '科学トリビア' : q.bonusCategory === 'beyond_middle' ? 'さらに先の科学' : '中学でくわしく学ぶよ') + '</div>' : '') +
      '<p class="question-stem">' + window.RikaUI.renderFurigana(q.stem) + '</p>' +
      (window.RikaDiagrams ? window.RikaDiagrams.render(q) : '') +
      '<div class="battle-tools">' +
      '<button type="button" class="secondary-button" data-use-item="hint_scroll" ' + (canUseHint() ? "" : "disabled") + '>ヒント</button>' +
      '<button type="button" class="secondary-button" data-use-item="potion" ' + (canUsePotion() ? "" : "disabled") + '>ポーション</button>' +
      '</div>' +
      renderChoices(q) +
      '<div id="feedback" class="feedback"></div>' +
      '</section></section>';
    bind();
    if (retainedStage) document.querySelector('[data-battle-stage]').replaceWith(retainedStage);
    updateHUD();
    if (battle.answered) showFeedback();
    if (window.RikaApp) window.RikaApp.renderStatus();
  }

  function updateHUD() {
    var bar = document.querySelector('.enemy-bar .bar');
    if (bar) { bar.style.setProperty('--value', (battle.enemyHp / battle.enemyMax * 100) + '%'); bar.setAttribute('aria-valuenow', battle.enemyHp); bar.setAttribute('aria-valuemax', battle.enemyMax); }
    var art = document.querySelector('[data-enemy-art]');
    if (art && art.dataset.monster !== (battle.monster && battle.monster.id)) { art.innerHTML = renderMonsterArt(); art.dataset.monster = battle.monster.id; }
    var name = document.querySelector('[data-enemy-name]');
    if (name) name.innerHTML = window.RikaUI.renderFurigana(battle.monster ? battle.monster.name : 'モンスター');
    var hud = document.querySelector('[data-live-hud]');
    if (hud) hud.innerHTML = '<div><strong>' + (battle.mode === 'learn' ? 'ライフ（へらないよ）' : 'ライフ') + '</strong>' + window.RikaUI.hearts(battle.lives, battle.maxLives) + '</div><div class="reward-row"><span class="tag">れんぞく ' + battle.streak + '</span><span class="tag">ブロック ' + battle.blockLeft + '</span><span class="tag">ヒント ' + hintCount() + '</span></div><div class="quest-log"><p>' + window.RikaUI.renderFurigana(battle.log) + '</p></div>';
  }

  function renderMonsterArt() {
    if (!battle.monster) {
      return '<div class="monster-fallback">?</div>';
    }
    var art = window.RikaMonsters.render(battle.monster.id, "battle-monster");
    if (art) return art;
    return '<div class="monster-fallback">' + window.RikaUI.escapeHtml(battle.monster.name.charAt(0) || "?") + '</div>';
  }

  function renderChoices(q) {
    var classes = q.type === "ox" ? "choice-grid ox" : "choice-grid";
    return '<div class="' + classes + '">' + q.choices.map(function (choice, index) {
      var hidden = battle.hiddenChoices[q.id] && battle.hiddenChoices[q.id].indexOf(index) !== -1;
      return '<button type="button" class="choice-button' + (hidden ? ' hint-eliminated' : '') + '" data-choice="' + index + '" ' + (hidden ? "disabled" : "") + '>' +
        (q.type === "ox" ? "" : '<span class="choice-prefix">' + String.fromCharCode(65 + index) + '. </span>') +
        window.RikaUI.renderFurigana(choice) +
        '</button>';
    }).join("") + '</div>';
  }

  function showBattleWord(text, good) {
    var word = document.querySelector("[data-battle-word]");
    if (!word) return;
    word.textContent = text;
    word.className = "battle-word " + (good ? "good" : "bad");
    void word.offsetWidth;
    word.classList.add("show");
  }

  function animateEnemyHit() {
    var enemy = document.querySelector("[data-enemy-art]");
    if (!enemy) return;
    enemy.classList.remove("hit");
    void enemy.offsetWidth;
    enemy.classList.add("hit");
  }

  function shakeStage() {
    var stage = document.querySelector("[data-battle-stage]");
    if (!stage) return;
    stage.classList.remove("shake");
    void stage.offsetWidth;
    stage.classList.add("shake");
  }

  function sparkle() {
    var stage = document.querySelector("[data-battle-stage]");
    var enemy = document.querySelector("[data-enemy-art]");
    if (!stage || !enemy) return;
    var stageRect = stage.getBoundingClientRect();
    var enemyRect = enemy.getBoundingClientRect();
    var cx = enemyRect.left - stageRect.left + enemyRect.width / 2;
    var cy = enemyRect.top - stageRect.top + enemyRect.height / 2;
    for (var i = 0; i < 14; i += 1) {
      var spark = document.createElement("span");
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 70;
      spark.className = "spark";
      spark.style.left = cx + "px";
      spark.style.top = cy + "px";
      spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      if (i % 2) spark.style.background = "linear-gradient(180deg,#fff,#22d3ee)";
      stage.appendChild(spark);
      window.setTimeout(function (node) { node.remove(); }, 760, spark);
    }
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
    if (exit) exit.addEventListener("click", function () { persist(); if (window.RikaApp) window.RikaApp.showMap(battle.unit.grade); });
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
      persist();
      render();
      return;
    }
    if (id === "potion" && canUsePotion() && window.RikaState.spendItem("potion", 1)) {
      battle.lives = Math.min(battle.maxLives, battle.lives + 1);
      battle.log = "元気ポーションでライフが1つ回復した。";
      persist();
      render();
    }
  }

  function answer(choiceIndex) {
    if (!battle || battle.answered) return;
    var target = currentQuestion();
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= target.choices.length || ((battle.hiddenChoices[target.id] || []).includes(choiceIndex))) return;
    battle.answered = true;
    battle.selectedChoice = choiceIndex;
    var q = currentQuestion();
    var correct = choiceIndex === q.answer;
    if (!battle.reviewing && correct) battle.firstCorrectCount += 1;
    if (!correct) {
      if (!battle.reviewing) battle.misses += 1;
      if (battle.mode === 'learn') battle.reviewQueue.push({ question: q, wave: battle.wave });
    }
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
        if (battle.effects.doubleCrit) {
          battle.enemyHp = Math.max(0, battle.enemyHp - 1);
          flourish = " ★会心の二連撃！";
        } else {
          flourish = " 会心の一撃！";
        }
        battle.extraExp += battle.effects.doubleCrit ? 35 : 25;
      }
      if (battle.streak > 0 && battle.streak % 3 === 0) {
        battle.extraExp += 20 + (battle.effects.comboUp || 0) * 10;
        flourish += " " + battle.streak + "コンボ！";
      }
      if (feedback) feedback.className = "feedback is-visible good";
      if (feedback) feedback.innerHTML = '<div class="feedback-mark">✓ 正かい！' + window.RikaUI.renderFurigana(flourish) + '</div><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>' + nextButton();
      showBattleWord("こうげき成功！", true);
      animateEnemyHit();
      sparkle();
      window.RikaAudio.ok();
    } else {
      battle.perfect = false;
      if (battle.comboKeepLeft > 0 && battle.streak > 0) {
        battle.comboKeepLeft -= 1;
        battle.log = "★レア装備がコンボを守った！";
      } else {
        battle.streak = 0;
      }
      if (battle.mode === 'learn') {
        battle.log = "おしい！ 解説を読んで、あとで学び直そう。";
      } else if (battle.blockLeft > 0) {
        battle.blockLeft -= 1;
        battle.log = "そうびの盾が守ってくれた！";
      } else {
        battle.lives -= 1;
        battle.log = "おしい！ 解説を読んで次につなげよう。";
      }
      if (battle.lives <= 0 && battle.reviveLeft > 0) {
        battle.reviveLeft -= 1;
        battle.lives = 1;
        battle.log = "★レア装備の力でライフ1でふっかつ！";
      }
      if (feedback) feedback.className = "feedback is-visible bad";
      if (feedback) feedback.innerHTML = '<div class="feedback-mark">✗ おしい！</div><p>正かいは「' + window.RikaUI.renderFurigana(q.choices[q.answer]) + '」。</p><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>' + nextButton();
      showBattleWord("おしい！", false);
      shakeStage();
      window.RikaAudio.bad();
    }
    battle.waves[battle.wave].hp = battle.enemyHp;
    if (battle.enemyHp === 0 && battle.monster) window.RikaState.rememberMonster(battle.monster.id, true);
    window.RikaState.recordQuestion(battle.unit.unitId, q, correct, battle.usedHint, battle.reviewing);
    persist();
    updateHUD();
    document.querySelectorAll('[data-use-item]').forEach(function (button) { button.disabled = true; });
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

  function showFeedback() {
    var q = currentQuestion(), correct = battle.selectedChoice === q.answer;
    document.querySelectorAll('[data-choice]').forEach(function (button) { button.disabled = true; button.classList.toggle('is-correct', Number(button.dataset.choice) === q.answer); button.classList.toggle('is-wrong', !correct && Number(button.dataset.choice) === battle.selectedChoice); });
    var feedback = document.getElementById('feedback');
    feedback.className = 'feedback is-visible ' + (correct ? 'good' : 'bad');
    feedback.innerHTML = '<div class="feedback-mark">' + (correct ? '✓ 正かい！' : '✗ おしい！') + '</div><p>正かいは「' + window.RikaUI.renderFurigana(q.choices[q.answer]) + '」。</p><p>' + window.RikaUI.renderFurigana(q.explanation) + '</p>' + nextButton();
    document.querySelector('[data-next-question]').addEventListener('click', advance);
    document.querySelectorAll('[data-use-item]').forEach(function (button) { button.disabled = true; });
  }

  function nextButton() {
    return '<button type="button" class="primary-button" data-next-question>つぎへ</button>';
  }

  function advance() {
    if (!battle || !battle.answered) return;
    if (battle.lives <= 0) {
      finish(false);
      return;
    }
    battle.index += 1;
    battle.answered = false;
    battle.usedHint = false;
    if (battle.index >= battle.questions.length) {
      if (battle.mode === 'learn' && battle.reviewQueue.length) {
        var review = battle.reviewQueue.shift();
        battle.reviewing = true;
        battle.questions.push(prepareQuestion(review.question));
        battle.wave = review.wave;
        var wave = battle.waves[battle.wave];
        battle.monster = window.MONSTERS[wave.monsterId];
        battle.enemyHp = wave.hp;
        battle.enemyMax = wave.max;
      } else {
        finish(battle.mode === 'learn' || battle.firstCorrectCount >= Math.ceil(battle.initialCount * .8));
        return;
      }
    }
    if (!battle.reviewing && battle.tier === 'basic' && battle.index % 5 === 0) {
      battle.wave += 1;
      battle.monster = window.RikaMonsters.choose(battle.unit, 'basic');
      if (battle.monster) window.RikaState.rememberMonster(battle.monster.id, false);
      battle.enemyMax = Math.min(5, battle.initialCount - battle.index);
      if (battle.mode === 'challenge') battle.enemyMax = Math.ceil(battle.enemyMax * .8);
      battle.enemyHp = battle.enemyMax;
      battle.waves.push({monsterId:battle.monster && battle.monster.id,hp:battle.enemyHp,max:battle.enemyMax});
      battle.log = 'つぎの5問！ ' + (battle.monster ? battle.monster.name : 'モンスター') + 'があらわれた。';
    }
    persist();
    render();
    var first = document.querySelector('[data-choice]:not([disabled])');
    if (first) first.focus({preventScroll:true});
  }

  function finish(success) {
    var bank = window.QUESTION_BANK[battle.unit.unitId].basic;
    var p = window.RikaState.progress(battle.unit.unitId);
    var mastered = bank.filter(function (q) { return p.masteredQuestionIds.includes(q.id); }).length;
    var masteryComplete = battle.options.review || battle.options.context ? p.basicCleared : bank.every(function (q) { return p.seenQuestionIds.includes(q.id); }) && mastered >= (battle.mode === 'challenge' ? Math.ceil(bank.length * .8) : bank.length);
    var result = window.RikaRewards.handleBattleResult({
      unit: battle.unit,
      tier: battle.tier,
      success: success,
      perfect: battle.perfect && success,
      bestStreak: battle.bestStreak,
      extraExp: battle.extraExp
      , masteryComplete: masteryComplete, sessionId: battle.sessionId, total: battle.initialCount, effects: battle.effects, review: !!battle.options.review
    });
    window.RikaState.get().activeSession = null;
    window.RikaState.save();
    if (battle.enemyHp === 0 && battle.monster) window.RikaState.rememberMonster(battle.monster.id, true);
    if (success && window.RikaAudio) window.RikaAudio.reward();
    var app = document.getElementById("app");
    var title = success ? "クエストクリア！" : "もう一度ちょうせん";
    app.innerHTML = '<section class="panel rpg-frame">' +
      '<h2>' + title + '</h2>' +
      '<p>はじめの回答：' + battle.firstCorrectCount + ' / ' + battle.initialCount + '問 正かい ・ ' + battle.misses + '問 学び直し</p>' +
      '<p>' + window.RikaUI.renderFurigana(success ? "よくがんばったね。ぼうけんは自動で記録されたよ。" : "おしい！ 復習して、もう一度ちょうせんしよう。") + '</p>' +
      '<ul class="result-list">' + result.messages.map(function (message) { return '<li>' + window.RikaUI.renderFurigana(message) + '</li>'; }).join("") + '</ul>' +
      '<div class="button-row" style="margin-top:16px">' +
      '<button type="button" class="primary-button" data-result-map>マップへ</button>' +
      '<button type="button" class="secondary-button" data-result-retry>もう一度</button>' +
      '<button type="button" class="ghost-button" data-result-inventory>そうびを見る</button>' +
      '</div></section>';
    document.querySelector("[data-result-map]").addEventListener("click", function () { window.RikaApp.showMap(battle.unit.grade, battle.unit.unitId); });
    document.querySelector("[data-result-retry]").addEventListener("click", function () { start(battle.unit.unitId, battle.tier, battle.options); });
    document.querySelector("[data-result-inventory]").addEventListener("click", function () { window.RikaApp.showInventory("equipment"); });
    if (window.RikaApp) window.RikaApp.renderStatus();
    if (result.equipment) {
      var eq = result.equipment;
      window.RikaUI.modal('そうびを てにいれた！', '<div class="reward-reveal ' + (eq.rarity === 'rare' ? 'rare-reveal' : '') + '">' + (eq.rarity === 'rare' ? '<div class="reward-rays" aria-hidden="true"></div><span class="rare-tag">★レア</span>' : '') + '<h3>' + window.RikaUI.renderFurigana(eq.name) + '</h3>' + window.RikaSVG.slotIcon(eq.slot,120) + '<p>' + window.RikaUI.renderFurigana(eq.desc) + '</p></div>');
    } else if (result.leveled) window.RikaUI.toast('LEVEL UP! レベル' + result.level);
  }

  window.RikaBattle = {
    start: start,
    resume: resume,
    prepareQuestion: prepareQuestion,
    answer: answer,
    advance: advance,
    getBattle: function () { return battle; }
  };
})();
