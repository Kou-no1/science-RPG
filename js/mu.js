(function () {
  var labels = ["予想", "根拠", "確かめ方", "別の条件"];
  var quests = window.RikaMuData.quests;
  var f = function (text) { return window.RikaUI.renderFurigana(text); };
  var e = function (text) { return window.RikaUI.escapeHtml(text); };

  function emptySave() {
    var progress = {}, seen = {};
    quests.forEach(function (q) { progress[q.id] = { cleared: false, badged: false, attempts: 0, history: [] }; seen[q.id] = []; });
    return { version: 1, counter: 0, progress: progress, seen: seen, exposureFull: {}, active: null };
  }

  function validSession(s) {
    if (!s || s.revision !== window.RikaMuData.revision || !quests.some(function (q) { return q.id === s.questId; })) return false;
    var valid = typeof s.id === "string" && /^[a-z0-9]+$/i.test(s.id) && Number.isInteger(s.seed) && s.seed >= 0 && s.seed <= 4294967295 &&
      Number.isInteger(s.currentSeed) && s.currentSeed >= 0 && s.currentSeed <= 4294967295 &&
      Number.isInteger(s.index) && s.index >= 0 && s.index < 4 && ["core", "recheck", "result"].includes(s.phase) &&
      Array.isArray(s.pending) && s.pending.every(function (i) { return Number.isInteger(i) && i >= 0 && i < 4; }) &&
      Array.isArray(s.responses) && s.responses.length <= 4 && s.responses.every(function (r) { return r && typeof r.correct === "boolean"; }) &&
      s.draft && typeof s.draft === "object" && typeof s.note === "string" && s.note.length <= 1000 &&
      ["answered", "hinted", "assisted", "fresh"].every(function (key) { return typeof s[key] === "boolean"; }) &&
      ["misses", "rechecks"].every(function (key) { return Number.isInteger(s[key]) && s[key] >= 0; }) &&
      (!s.answered || (s.feedback && typeof s.feedback.correct === "boolean")) &&
      (s.phase !== "result" || (s.result && Number.isInteger(s.result.exp) && s.result.exp >= 0 && s.result.exp <= 200 && Number.isInteger(s.result.firstCorrect) && s.result.firstCorrect >= 0 && s.result.firstCorrect <= 4 &&
        ["newBadge", "badge", "learning"].every(function (key) { return typeof s.result[key] === "boolean"; })));
    if (!valid) return false;
    var q = window.RikaMuData.build(s.questId, s.currentSeed).steps[s.index];
    if (typeof s.draft.number !== "string" || s.draft.number.length > 12 || !Array.isArray(s.draft.selections) || !Array.isArray(s.draft.order) || !s.draft.values || typeof s.draft.values !== "object") return false;
    if (q.type === "order" && (s.draft.order.length !== q.items.length || new Set(s.draft.order).size !== q.items.length || !s.draft.order.every(function (id) { return q.items.some(function (item) { return item.id === id; }); }))) return false;
    if (q.type === "evidence" && !s.draft.selections.every(function (id) { return q.table.rows.some(function (row) { return row[0] === id; }); })) return false;
    if (q.type === "classify" && Object.keys(s.draft.values).some(function (id) { return !q.fields.some(function (field) { return field.id === id; }) || !q.choices.some(function (option) { return option.id === s.draft.values[id]; }); })) return false;
    return true;
  }

  function normalizeSave(raw) {
    var result = emptySave();
    if (!raw) return result;
    if (raw.version !== 1) throw new Error("Unsupported inquiry save");
    result.counter = Number.isInteger(raw.counter) && raw.counter >= 0 ? Math.min(1000000000, raw.counter) : 0;
    quests.forEach(function (q) {
      var prior = raw.progress && raw.progress[q.id] || {};
      var target = result.progress[q.id];
      target.cleared = prior.cleared === true;
      target.badged = prior.badged === true && target.cleared;
      target.attempts = Number.isInteger(prior.attempts) && prior.attempts >= 0 ? Math.min(1000000, prior.attempts) : 0;
      target.history = Array.isArray(prior.history) ? prior.history.filter(function (h) { return h && typeof h.id === "string" && typeof h.note === "string" && Number.isFinite(h.firstCorrect); }).slice(-12).map(function (h) {
        return { id: h.id.slice(0, 40), note: h.note.slice(0, 1000), firstCorrect: Math.min(4, Math.max(0, h.firstCorrect)), rechecks: Math.max(0, Number(h.rechecks) || 0), badge: h.badge === true };
      }) : [];
      var seen = Array.isArray((raw.seen || {})[q.id]) ? raw.seen[q.id].filter(function (s) { return typeof s === "string" && /^[clw]:[0-9,]+$/.test(s); }) : [];
      result.seen[q.id] = Array.from(new Set(seen)).slice(0, 4096);
      result.exposureFull[q.id] = (raw.exposureFull || {})[q.id] === true || seen.length > 4096;
    });
    result.active = validSession(raw.active) ? raw.active : null;
    return result;
  }

  function state() {
    var data = window.RikaState.get();
    if (!data.mu) data.mu = emptySave();
    return data.mu;
  }

  function gate() {
    var data = window.RikaState.get();
    var grades = [3, 4, 5, 6].map(function (grade) {
      var units = window.CURRICULUM.filter(function (u) { return u.grade === grade; });
      return { grade: grade, total: units.length, cleared: units.filter(function (u) { return data.progress[u.unitId] && data.progress[u.unitId].basicCleared; }).length };
    });
    var total = grades.reduce(function (sum, g) { return sum + g.total; }, 0);
    var cleared = grades.reduce(function (sum, g) { return sum + g.cleared; }, 0);
    return { unlocked: total > 0 && cleared === total, total: total, cleared: cleared, grades: grades };
  }

  function selectCase(id) {
    var data = state(), seed, sample, fresh;
    for (var i = 0; i < 160; i += 1) {
      data.counter += 1;
      seed = Math.imul(data.counter, 2654435761) >>> 0;
      sample = window.RikaMuData.build(id, seed);
      fresh = !data.exposureFull[id] && !data.seen[id].includes(sample.signature);
      if (fresh) break;
    }
    if (!data.seen[id].includes(sample.signature)) {
      if (data.seen[id].length < 4096) data.seen[id].push(sample.signature);
      else data.exposureFull[id] = true;
    }
    return { seed: seed, fresh: fresh };
  }

  function step() {
    var s = state().active;
    return s && window.RikaMuData.build(s.questId, s.currentSeed).steps[s.index];
  }

  function blankDraft(q) {
    return { number: "", selections: [], order: q.items ? q.items.map(function (item) { return item.id; }) : [], values: {} };
  }

  function start(id, replace) {
    if (!gate().unlocked) { window.RikaUI.toast("四つの大陸の洞窟を、すべてクリアすると開くよ。"); return; }
    if (!quests.some(function (q) { return q.id === id; })) return;
    if (state().active && state().active.phase !== "result" && !replace) {
      window.RikaUI.confirm("新しい研究", "途中の研究は入れかわるよ。新しい資料で始める？", function () { start(id, true); }); return;
    }
    var chosen = selectCase(id);
    state().progress[id].attempts += 1;
    state().active = {
      id: Date.now().toString(36) + state().counter.toString(36), revision: window.RikaMuData.revision, questId: id,
      seed: chosen.seed, currentSeed: chosen.seed, fresh: chosen.fresh, index: 0, phase: "core", pending: [],
      responses: [], draft: {}, note: "", answered: false, hinted: false, assisted: false, misses: 0, rechecks: 0
    };
    state().active.draft = blankDraft(step());
    window.RikaState.save(); render(true);
  }

  function resume() {
    if (!gate().unlocked) { show(); return; }
    if (!validSession(state().active)) {
      state().active = null; window.RikaState.save(); show(); return;
    }
    render(true);
  }

  function numeric(value) {
    var text = String(value == null ? "" : value).replace(/[０-９]/g, function (x) { return String.fromCharCode(x.charCodeAt(0) - 65248); }).replace(/．/g, ".").trim();
    if (!/^\d+(\.\d+)?$/.test(text)) return null;
    var result = Number(text);
    return Number.isFinite(result) && result <= 100000 ? result : null;
  }

  function check(q, value) {
    if (q.type === "number") { var n = numeric(value); return n === null ? null : Math.abs(n - q.answer) < 1e-9; }
    if (q.type === "classify") {
      if (!value || !q.fields.every(function (field) { return q.choices.some(function (option) { return option.id === value[field.id]; }); })) return null;
      return q.fields.every(function (field) { return value[field.id] === q.answer[field.id]; });
    }
    if (!Array.isArray(value) || new Set(value).size !== value.length) return null;
    var allowed = q.type === "order" ? q.items.map(function (item) { return item.id; }) : q.table.rows.map(function (row) { return row[0]; });
    if (value.length !== q.answer.length || value.some(function (id) { return !allowed.includes(id); })) return null;
    return q.type === "order" ? value.every(function (id, i) { return id === q.answer[i]; }) : q.answer.every(function (id) { return value.includes(id); });
  }

  function submit(value) {
    var s = state().active;
    if (!gate().unlocked || !validSession(s) || s.answered || s.phase === "result") return;
    var result = check(step(), value);
    if (result === null) { window.RikaUI.toast("数字や選ぶ項目を確かめてね。まだ回答は記録していないよ。"); return; }
    s.answered = true;
    s.feedback = { correct: result };
    if (s.phase === "core") s.responses[s.index] = { correct: result, hinted: s.hinted };
    if (!result) { s.misses += 1; s.assisted = true; s.pending.push(s.index); }
    window.RikaState.save(); render();
    var feedback = document.querySelector('[data-mu-feedback]');
    if (feedback) { feedback.focus({ preventScroll: true }); feedback.scrollIntoView({ block: 'nearest', behavior: 'auto' }); }
  }

  function hint() {
    var s = state().active;
    if (!s || s.answered || s.phase === "result") return;
    s.hinted = true; s.assisted = true;
    window.RikaState.save(); render();
  }

  function finish() {
    var s = state().active;
    if (!s || s.phase === "result") return;
    window.RikaState.transaction(function () {
      var p = state().progress[s.questId];
      var badge = s.fresh && !s.assisted && s.responses.length === 4 && s.responses.every(function (r) { return r.correct && !r.hinted; });
      var exp = (p.cleared ? 0 : 80) + (badge && !p.badged ? 120 : 0);
      s.result = { exp: exp, newBadge: badge && !p.badged, badge: badge, learning: s.assisted, firstCorrect: s.responses.filter(function (r) { return r.correct; }).length };
      p.cleared = true;
      if (badge) p.badged = true;
      p.history.push({ id: s.id, note: s.note, firstCorrect: s.result.firstCorrect, rechecks: s.rechecks, badge: badge });
      p.history = p.history.slice(-12);
      s.phase = "result";
      if (exp) window.RikaState.addExp(exp);
    });
    render(true);
  }

  function advance() {
    var s = state().active;
    if (!s || !s.answered || s.phase === "result" || !gate().unlocked) return;
    if (s.phase === "core" && s.index < 3) s.index += 1;
    else if (s.pending.length) {
      s.phase = "recheck"; s.index = s.pending.shift(); s.currentSeed = selectCase(s.questId).seed; s.rechecks += 1;
    } else { finish(); return; }
    s.answered = false; s.hinted = false; s.feedback = null; s.draft = blankDraft(step());
    window.RikaState.save(); render(true);
  }

  function mount(html) {
    var root = document.getElementById("app");
    if (!root) return;
    root.innerHTML = html;
    root.focus({ preventScroll: true });
    if (window.RikaApp) window.RikaApp.renderStatus();
  }

  function scrollTop() {
    if (window.scrollTo) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function entry() {
    var g = gate(), active = state().active;
    return '<section class="mu-gateway"><div><h2>' + f("{幻|まぼろし}の大陸ムー") + '</h2><p>' +
      f(g.unlocked ? "四つの大陸の先に、新しい島があらわれた！" : "四つの大陸の洞窟をすべてクリアすると、島への道が開くよ。") +
      '</p><p>' + g.cleared + ' / ' + g.total + ' 洞窟</p><div class="button-row"><button class="primary-button" data-mu-open>ムー大陸へ</button>' +
      (g.unlocked && active && active.phase !== "result" ? '<button class="secondary-button" data-mu-resume>' + f('研究のつづき') + '</button>' : '') +
      '</div></div><div class="mu-gateway-art">' + window.RikaSVG.muContinent(g.unlocked) + '</div></section>';
  }

  function bindEntry(root) {
    root.querySelectorAll('[data-mu-open]').forEach(function (button) { button.addEventListener('click', show); });
    root.querySelectorAll('[data-mu-resume]').forEach(function (button) { button.addEventListener('click', resume); });
  }

  function show() {
    var g = gate(), data = state();
    mount('<section class="mu-world"><div class="mu-heading"><div><p class="eyebrow">四つの大陸の、その先へ</p><h2>' + f("{幻|まぼろし}の大陸ムー") +
      '</h2></div><button class="ghost-button" data-mu-home>ホームへ</button></div><div class="mu-atlas">' + window.RikaSVG.muContinent(g.unlocked) + '</div>' +
      (!g.unlocked ? '<div class="mu-lock"><h3>島への道は、まだ眠っている</h3><p>' + f("観察の章をふくむ、四つの大陸の洞窟をすべてクリアしよう。ボスやレアそうびの全問正解は必要ないよ。") + '</p><ul class="mu-grade-list">' + g.grades.map(function (grade) { return '<li>' + grade.grade + '年：' + grade.cleared + ' / ' + grade.total + '</li>'; }).join('') + '</ul><button class="primary-button" data-mu-map>大陸へもどる</button></div>' :
        '<div class="mu-quests">' + quests.map(function (q) {
          var p = data.progress[q.id];
          return '<article class="mu-quest"><div class="mu-quest-art">' + window.RikaMonsters.render(q.guardian) + '</div><h3>' + f(q.title) + '</h3><p>' + f(q.story) + '</p><p class="mu-achievement"' + (p.badged ? ' data-mu-badge' : '') + '>' + f(p.cleared ? '✓ 研究に成功' : '未調査') + '　' + f(p.badged ? '★ 探究バッジ' : '') + '</p><button class="primary-button" data-mu-start="' + q.id + '">' + f(p.cleared ? '新しい資料で研究' : '研究へ') + '</button>' +
            (p.history.length ? '<details><summary>研究ノート</summary>' + p.history.slice().reverse().map(function (h) { return '<div class="mu-history"><p>初めの回答 ' + h.firstCorrect + ' / 4 ・ 再確認 ' + h.rechecks + '回' + (h.badge ? ' ・ ★' : '') + '</p><p>' + e(h.note || '気づきの記録はまだないよ。') + '</p></div>'; }).join('') + '</details>' : '') + '</article>';
        }).join('') + '</div>' + (data.active && data.active.phase !== "result" ? '<div class="button-row"><button class="secondary-button" data-mu-resume>途中の研究からつづける</button></div>' : '')) + '</section>');
    bindEntry(document.getElementById('app'));
    bindCommon();
    scrollTop();
  }

  function renderTable(q, s) {
    if (!q.table) return '';
    var evidence = q.type === "evidence";
    return '<div class="question-data mu-data" tabindex="0" role="region" aria-label="実験の記録"><table><caption>' + f('学習用の架空の記録') + '</caption><thead><tr>' +
      (evidence ? '<th scope="col">' + f('根拠') + '</th>' : '') + q.table.headers.map(function (h) { return '<th scope="col">' + f(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      q.table.rows.map(function (row) { return '<tr>' + (evidence ? '<td><label class="mu-evidence"><input type="checkbox" data-mu-evidence="' + e(row[0]) + '" aria-label="記録' + e(row[0]) + 'を根拠に選ぶ" ' + (s.draft.selections.includes(row[0]) ? 'checked ' : '') + (s.answered ? 'disabled' : '') + '><span class="sr-only">' + e(row[0]) + '</span></label></td>' : '') + row.map(function (cell, i) { return '<' + (i ? 'td' : 'th scope="row"') + '>' + f(cell) + '</' + (i ? 'td' : 'th') + '>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  function controls(q, s) {
    var disabled = s.answered ? 'disabled' : '';
    if (q.type === 'number') return '<label class="mu-number"><span>' + f('予想した量') + '</span><span><input type="text" inputmode="decimal" autocomplete="off" maxlength="12" data-mu-number value="' + e(s.draft.number) + '" ' + disabled + '> ' + e(q.unit) + '</span></label>';
    if (q.type === 'order') return '<ol class="mu-order">' + s.draft.order.map(function (id, i) {
      var item = q.items.find(function (x) { return x.id === id; });
      return '<li><span>' + f(item.label) + '</span><div class="mu-order-actions"><button type="button" data-mu-move="' + i + '" data-direction="-1" title="上へ" aria-label="' + e(window.RikaUI.renderPlain(item.label)) + 'を上へ" ' + (s.answered || i === 0 ? 'disabled' : '') + '>↑</button><button type="button" data-mu-move="' + i + '" data-direction="1" title="下へ" aria-label="' + e(window.RikaUI.renderPlain(item.label)) + 'を下へ" ' + (s.answered || i === s.draft.order.length - 1 ? 'disabled' : '') + '>↓</button></div></li>';
    }).join('') + '</ol>';
    if (q.type === 'classify') return '<div class="mu-classify">' + q.fields.map(function (field) {
      return '<fieldset><legend>' + f(field.label) + '</legend><div class="mu-segments">' + q.choices.map(function (option) {
        return '<label><input type="radio" name="' + e(field.id) + '" data-mu-field="' + e(field.id) + '" value="' + e(option.id) + '" ' + (s.draft.values[field.id] === option.id ? 'checked ' : '') + disabled + '><span>' + f(option.label) + '</span></label>';
      }).join('') + '</div></fieldset>';
    }).join('') + '</div>';
    return '';
  }

  function note(s) {
    return '<label class="mu-note"><span>' + f('研究ノート：気づいたこと') + '</span><textarea rows="3" maxlength="1000" data-mu-note>' + e(s.note) + '</textarea></label>';
  }

  function render(resetScroll) {
    var s = state().active;
    if (!s) { show(); return; }
    var quest = quests.find(function (q) { return q.id === s.questId; });
    if (s.phase === 'result') {
      mount('<section class="panel mu-result"><div class="mu-result-art">' + window.RikaSVG.muBadge(s.result.badge) + '</div><h2>✓ 研究に成功！</h2><h3>' + f(quest.title) + '</h3><p>' +
        f(s.result.badge ? '新しい資料で、予想・根拠・確かめ方・別の条件をたしかめた！' : '解説を読み、新しい資料でたしかめたよ。次の研究も楽しもう。') + '</p>' +
        (s.result.newBadge ? '<p class="rare-tag">' + f('★ 探究バッジを てにいれた！') + '</p>' : s.result.badge ? '<p>' + f('★ 探究バッジ達成') + '</p>' : '<p>' + f('探究バッジは、まだ見ていない資料でヒントなしの初回回答が全部正解したときにもらえるよ。') + '</p>') +
        '<p>+' + s.result.exp + ' EXP ・ 初めの回答 ' + s.result.firstCorrect + ' / 4 ・ 再確認 ' + s.rechecks + '回</p>' + note(s) +
        '<div class="button-row"><button class="primary-button" data-mu-start="' + quest.id + '">新しい資料で研究</button><button class="secondary-button" data-mu-menu>ムー大陸へ</button></div></section>');
    } else {
      var q = step();
      mount('<section class="mu-research"><div class="mu-heading"><div><p class="eyebrow">小学校の知識をつなぐ探究</p><h2>' + f(quest.title) + '</h2></div><button class="ghost-button" data-mu-menu>ムー大陸へ</button></div>' +
        '<div class="mu-research-hud"><div class="mu-guardian">' + window.RikaMonsters.render(quest.guardian) + '</div><div><p>' + f(s.phase === 'recheck' ? '新しい資料で再確認' : '研究 ' + (s.index + 1) + ' / 4') + '</p><ol class="mu-steps">' + labels.map(function (label, i) { return '<li' + (i === s.index ? ' aria-current="step"' : '') + '>' + f(label) + '</li>'; }).join('') + '</ol><p>' + f(s.fresh && !s.assisted ? '★ 探究バッジに挑戦中' : '学び直して研究に成功しよう') + '</p></div></div>' +
        '<section class="panel mu-workspace"><p class="question-stem">' + f(q.stem) + '</p>' + (q.context ? '<p class="mu-context">' + f(q.context) + '</p>' : '') +
        '<form data-mu-form>' + renderTable(q, s) + controls(q, s) + '<div class="button-row"><button class="primary-button" type="submit" ' + (s.answered ? 'disabled' : '') + '>' + f('回答を記録') + '</button><button class="secondary-button" type="button" data-mu-hint ' + (s.answered || s.hinted ? 'disabled' : '') + '>ヒント</button></div></form>' +
        (s.hinted ? '<p class="mu-hint" role="status">' + f(q.hint) + '</p>' : '') +
        (s.answered ? '<div class="mu-feedback ' + (s.feedback.correct ? 'mu-good' : 'mu-retry') + '" data-mu-feedback tabindex="-1" role="status"><h3>' + (s.feedback.correct ? '✓ たしかめられた！' : '✗ おしい！ 新しい資料でたしかめよう') + '</h3><p>' + f(q.explanation) + '</p><button class="primary-button" data-mu-next>' + (s.phase === 'core' && s.index < 3 ? 'つぎの調査へ' : s.pending.length ? '新しい資料で再確認' : '研究をまとめる') + '</button></div>' : '') + note(s) + '</section></section>');
    }
    bindCommon(); bindWork();
    if (resetScroll) scrollTop();
  }

  function bindCommon() {
    var root = document.getElementById('app');
    root.querySelectorAll('[data-mu-start]').forEach(function (button) { button.addEventListener('click', function () { start(button.dataset.muStart); }); });
    root.querySelectorAll('[data-mu-menu]').forEach(function (button) { button.addEventListener('click', show); });
    root.querySelectorAll('[data-mu-home]').forEach(function (button) { button.addEventListener('click', window.RikaApp.showHome); });
    root.querySelectorAll('[data-mu-map]').forEach(function (button) { button.addEventListener('click', function () { window.RikaApp.showMap(window.RikaState.get().settings.lastGrade); }); });
    root.querySelectorAll('[data-mu-note]').forEach(function (input) { input.addEventListener('input', function () {
      var s = state().active; s.note = input.value.slice(0, 1000);
      var h = state().progress[s.questId].history.find(function (item) { return item.id === s.id; }); if (h) h.note = s.note;
      window.RikaState.save();
    }); });
  }

  function bindWork() {
    var root = document.getElementById('app'), s = state().active, q = step();
    var form = root.querySelector('[data-mu-form]');
    if (!form) return;
    root.querySelectorAll('[data-mu-number]').forEach(function (input) { input.addEventListener('input', function () { s.draft.number = input.value; window.RikaState.save(); }); });
    root.querySelectorAll('[data-mu-evidence]').forEach(function (input) { input.addEventListener('change', function () {
      s.draft.selections = Array.from(root.querySelectorAll('[data-mu-evidence]:checked')).map(function (x) { return x.dataset.muEvidence; }); window.RikaState.save();
    }); });
    root.querySelectorAll('[data-mu-field]').forEach(function (input) { input.addEventListener('change', function () { s.draft.values[input.dataset.muField] = input.value; window.RikaState.save(); }); });
    root.querySelectorAll('[data-mu-move]').forEach(function (button) { button.addEventListener('click', function () {
      var from = Number(button.dataset.muMove), to = from + Number(button.dataset.direction);
      var item = s.draft.order.splice(from, 1)[0]; s.draft.order.splice(to, 0, item); window.RikaState.save(); render();
      var next = document.querySelector('[data-mu-move="' + to + '"]:not([disabled])'); if (next) next.focus();
    }); });
    form.addEventListener('submit', function (event) {
      event.preventDefault(); submit(q.type === 'number' ? s.draft.number : q.type === 'evidence' ? s.draft.selections : q.type === 'order' ? s.draft.order : s.draft.values);
    });
    root.querySelector('[data-mu-hint]').addEventListener('click', hint);
    var next = root.querySelector('[data-mu-next]'); if (next) next.addEventListener('click', advance);
  }

  window.RikaMu = { emptySave: emptySave, normalizeSave: normalizeSave, gate: gate, entry: entry, bindEntry: bindEntry, show: show,
    start: start, resume: resume, getSession: function () { return state().active; }, getStep: step, submit: submit, advance: advance, hint: hint, numeric: numeric, check: check };
})();
