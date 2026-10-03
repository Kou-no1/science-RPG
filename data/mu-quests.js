(function () {
  var revision = 1;
  var quests = [
    { id: "crystal_gate", title: "{結晶|けっしょう}の{扉|とびら}", theme: "solution", guardian: "crystadra", story: "水と{温度|おんど}の記録から、{結晶|けっしょう}の{扉|とびら}を開こう。", units: ["g4_u11", "g5_u07"] },
    { id: "light_garden", title: "光の庭", theme: "plant", guardian: "tane_dragon", story: "庭の葉に{養分|ようぶん}ができるのはどこ？　日光と葉の{実験|じっけん}をたどろう。", units: ["g3_u06", "g5_u02", "g6_u03"] },
    { id: "river_valley", title: "水門の谷", theme: "water", guardian: "gorota_wani", story: "水が運ぶ砂を調べて、谷の記録を読み{解|と}こう。", units: ["g4_u05", "g5_u06"] }
  ];

  function random(seed) {
    var value = seed >>> 0;
    return function () {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function shuffled(values, rng) {
    var result = values.slice();
    for (var i = result.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var swap = result[i]; result[i] = result[j]; result[j] = swap;
    }
    return result;
  }

  function orderStep(stem, labels, explanation, hint, rng) {
    var items = labels.map(function (label, i) { return { id: "item" + i, label: label }; });
    var answer = items.map(function (item) { return item.id; });
    var mixed = shuffled(items, rng);
    if (mixed.every(function (item, i) { return item.id === answer[i]; })) mixed.reverse();
    return { type: "order", stem: stem, items: mixed, answer: answer, explanation: explanation, hint: hint };
  }

  function table(headers, rows) {
    return { headers: headers, rows: rows, fictional: true };
  }

  function crystal(rng) {
    var water = 1 + Math.floor(rng() * 4);
    var other = water + 1;
    var cool = 3 + Math.floor(rng() * 6);
    var warm = cool + 8 + Math.floor(rng() * 19);
    var names = shuffled(["A", "B", "C", "D"], rng);
    var rows = shuffled([
      [names[0], water * 50 + "mL", "20℃", cool * water + "g"],
      [names[1], water * 50 + "mL", "60℃", warm * water + "g"],
      [names[2], other * 50 + "mL", "20℃", cool * other + "g"],
      [names[3], other * 50 + "mL", "60℃", warm * other + "g"]
    ], rng);
    var data = table(["記録", "水の量", "水の温度", "とける量の限り"], rows);
    var context = "ムーの{結晶|けっしょう}は学習用の{架空|かくう}の物だよ。水は{蒸発|じょうはつ}せず、表の量まで全部とけるものとして考えよう。";
    var difference = (warm - cool) * water;
    return {
      signature: "c:" + [water, cool, warm].join(","),
      steps: [
        { type: "number", unit: "g", table: data, context: context, answer: difference,
          stem: "60℃の水" + water * 50 + "mLに、限りまで{結晶|けっしょう}をとかした。20℃に冷やすと、何gの{結晶|けっしょう}が出る？",
          explanation: "同じ水の量で比べよう。" + warm * water + "gから" + cool * water + "gを引くと、" + difference + "gが出るよ。",
          hint: "水の量が同じ二つの記録で、あたたかいときと冷たいときの差を考えよう。" },
        { type: "evidence", table: data, context: context, answer: names.slice(0, 2),
          stem: "今の" + water * 50 + "mLの水を冷やす予想の{根拠|こんきょ}になる記録を、二つ選ぼう。",
          explanation: names[0] + "と" + names[1] + "は水の量が同じで、温度だけがちがうよ。ほかの二つは別の水の量の記録だよ。",
          hint: "最初に使った水の量を確かめて、その量の記録を二つ探そう。" },
        orderStep("温度でとける量が変わるか、先生と調べる手順を並べよう。", [
          "同じ量の水を、二つの{容器|ようき}に用意する", "水の温度を20℃と60℃にする",
          "同じ物を少しずつ入れ、とける量の限りを調べる", "二つのとけた量を比べ、記録する"
        ], "水の量と物の種類をそろえ、温度だけを変えるよ。準備をしてから調べ、最後に結果を比べよう。", "準備 → 温度を変える → 調べる → 結果の順だよ。", rng),
        { type: "number", unit: "g", table: data, context: context, answer: (warm - cool) * other,
          stem: "別の条件でも考えよう。水を" + other * 50 + "mLに変え、60℃で限りまでとかして20℃に冷やすと、何g出る？",
          explanation: "今度の水の量は" + other * 50 + "mL。" + names[3] + "の" + warm * other + "gから" + names[2] + "の" + cool * other + "gを引いて、" + (warm - cool) * other + "gだよ。",
          hint: "今度の水の量を使って、表の二つの量の差を求めよう。" }
      ]
    };
  }

  function leaves(rng) {
    var water = 20 + Math.floor(rng() * 6) * 5;
    var hours = 3 + Math.floor(rng() * 4);
    var temperature = 20 + Math.floor(rng() * 6);
    var names = shuffled(["P", "Q", "R", "S"], rng);
    var targetIndex = rng() < .5 ? 0 : 1;
    var target = names[targetIndex];
    var data = table(["植物", "日光", "水", "温度", "肥料"], shuffled([
      [names[0], hours + "時間当てる", water + "mL", temperature + "℃", "同じ量"],
      [names[1], "当てない", water + "mL", temperature + "℃", "同じ量"],
      [names[2], "当てない", water + 20 + "mL", temperature + "℃", "同じ量"],
      [names[3], hours + "時間当てる", water + "mL", temperature + 5 + "℃", "同じ量"]
    ], rng));
    var choices = [{ id: "blue", label: "青むらさき色になる" }, { id: "none", label: "青むらさき色にならない" }];
    var context = "同じ種類・育ち具合の植物で、先生が実験前の葉にでんぷんがないことを確かめたよ。先生が安全にヨウ素液で調べる実験の記録だよ。";
    var sunlight = shuffled([true, false, rng() < .5], rng);
    var fields = shuffled(sunlight.map(function (sun, i) { return { id: "leaf" + (i + 1), label: "葉" + ["ア", "イ", "ウ"][i] + "：日光を" + (sun ? "当てる" : "当てない") }; }), rng);
    var answer = {};
    sunlight.forEach(function (sun, i) { answer["leaf" + (i + 1)] = sun ? "blue" : "none"; });
    return {
      signature: "l:" + [water, hours, temperature, targetIndex].concat(sunlight.map(function (sun) { return sun ? 1 : 0; })).join(","),
      steps: [
        { type: "classify", table: data, context: context, fields: [{ id: "target", label: "植物" + target + "の葉" }], choices: choices,
          answer: { target: targetIndex === 0 ? "blue" : "none" }, stem: "植物" + target + "の葉をヨウ素液で調べると、どうなると予想する？",
          explanation: "日光を当てた" + names[0] + "の葉にはでんぷんができ、青むらさき色になるよ。日光を当てない" + names[1] + "は青むらさき色にならないよ。",
          hint: "日光を当てたかどうかを見よう。ヨウ素液はでんぷんがあると青むらさき色になるよ。" },
        { type: "evidence", table: data, context: context, answer: names.slice(0, 2), stem: "日光のちがいだけを比べられる植物を、二つ選ぼう。",
          explanation: names[0] + "と" + names[1] + "は水・温度・肥料がそろい、日光だけがちがうよ。ほかの二つは別の条件も変わってしまうよ。",
          hint: "日光以外の列が、全部同じになっている組を探そう。" },
        orderStep("葉の実験を先生と行う手順を並べよう。", [
          "同じ種類の植物を用意し、葉にでんぷんがないことを確かめる", "日光を当てる植物と、当てない植物に分ける",
          "水や温度をそろえ、決めた時間だけ育てる", "先生がヨウ素液で葉を調べ、結果を比べる"
        ], "初めの状態を確かめ、日光以外をそろえてから、最後に葉を調べるよ。薬品を使う作業は先生と行おう。", "初めの状態 → 日光の条件 → 育てる → 葉を調べる、の順だよ。", rng),
        { type: "classify", fields: fields, choices: choices, answer: answer, context: context,
          stem: "別の三つの葉でも考えよう。初めのでんぷんはなく、日光以外は同じ条件だよ。それぞれの結果を予想しよう。",
          explanation: sunlight.map(function (sun, i) { return "葉" + ["ア", "イ", "ウ"][i] + "は" + (sun ? "日光を当てたので青むらさき色になる" : "日光を当てないので青むらさき色にならない"); }).join("。") + "。葉の名前ではなく、日光の条件を使おう。",
          hint: "葉を一枚ずつ見て、日光を当てたかどうかで分けよう。" }
      ]
    };
  }

  function river(rng) {
    var volume = 50 + Math.floor(rng() * 6) * 25;
    var low = 3 + Math.floor(rng() * 8);
    var high = low + 4 + Math.floor(rng() * 12);
    var minutes = 1 + Math.floor(rng() * 3);
    var names = shuffled(["A", "B", "C", "D"], rng);
    var data = table(["記録", "流した水", "しゃ面", "時間", "運ばれた砂"], shuffled([
      [names[0], volume + "mL", "同じ坂", minutes + "分", low + "g"],
      [names[1], volume * 2 + "mL", "同じ坂", minutes + "分", high + "g"],
      [names[2], volume + "mL", "ゆるい坂", minutes + "分", "2g"],
      [names[3], volume * 2 + "mL", "同じ坂", minutes + 2 + "分", high + 6 + "g"]
    ], rng));
    var amount = high + 3 + Math.floor(rng() * 8);
    var recordNames = shuffled(["X", "Y", "Z"], rng);
    var records = shuffled([low, amount, high].map(function (n, i) { return { id: "record" + recordNames[i], label: "記録" + recordNames[i] + "：運ばれた砂 " + n + "g" }; }), rng);
    var expected = ["record" + recordNames[1], "record" + recordNames[2], "record" + recordNames[0]];
    if (records.every(function (item, i) { return item.id === expected[i]; })) records.reverse();
    var context = "同じ土と砂を使った、小さな模型の実験だよ。川には入らず、安全な場所で先生と調べるよ。表は学習用の架空の記録だよ。";
    return {
      signature: "w:" + [volume, low, high, minutes, amount].join(","),
      steps: [
        { type: "number", table: data, context: context, unit: "g", answer: high - low,
          stem: names[0] + "から" + names[1] + "へ水を増やすと、運ばれた砂は何g多くなった？",
          explanation: names[1] + "の" + high + "gから" + names[0] + "の" + low + "gを引くと、" + (high - low) + "g多くなったよ。",
          hint: "問題で示した二つの記録の、運ばれた砂の量の差を求めよう。" },
        { type: "evidence", table: data, context: context, answer: names.slice(0, 2), stem: "水の量のちがいによるはたらきを比べる記録を、二つ選ぼう。",
          explanation: names[0] + "と" + names[1] + "は坂・土・砂・時間が同じで、水の量だけがちがうよ。ほかの二つは坂や時間も変わっているよ。",
          hint: "水の量以外の条件が、全部同じになる組を探そう。" },
        { type: "classify", choices: [{ id: "same", label: "同じにする" }, { id: "change", label: "変える" }],
          fields: [{ id: "water", label: "流す水の量" }, { id: "slope", label: "坂のかたむき" }, { id: "time", label: "流す時間" }, { id: "soil", label: "土や砂の種類と量" }],
          answer: { water: "change", slope: "same", time: "same", soil: "same" },
          stem: "水の量のはたらきを調べる、新しい実験を組み立てよう。何を変え、何をそろえる？",
          explanation: "調べたい水の量だけを変え、坂・時間・土や砂を同じにするよ。いくつも変えると、何が結果に関係したかわからないよ。",
          hint: "調べたい条件を一つだけ変え、ほかはそろえよう。" },
        { type: "order", items: records, answer: expected, context: context,
          stem: "別の模型で得た新しい記録だよ。運ばれた砂が多い順に並べよう。前の記録の名前とは関係ないよ。",
          explanation: "新しい記録の数字を使おう。" + amount + "gの" + recordNames[1] + "、" + high + "gの" + recordNames[2] + "、" + low + "gの" + recordNames[0] + "の順だよ。水を増やすと必ず同じ割合で砂が増える、とまではこの記録だけでは言えないよ。",
          hint: "記録の名前ではなく、砂の数字を大きい順に比べよう。" }
      ]
    };
  }

  window.RikaMuData = {
    revision: revision,
    quests: quests,
    build: function (id, seed) {
      var rng = random(seed);
      return id === "crystal_gate" ? crystal(rng) : id === "light_garden" ? leaves(rng) : id === "river_valley" ? river(rng) : null;
    }
  };
})();
