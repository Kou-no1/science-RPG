(function (data) {
  var h = data.helpers;
  data.domains = [
    { id: "matter", title: "{物質|ぶっしつ}の工房", short: "物質", color: "#22d3ee" },
    { id: "energy", title: "エネルギーの港", short: "エネルギー", color: "#ffd43b" },
    { id: "life", title: "{生命|せいめい}の森", short: "生命", color: "#34d399" },
    { id: "earth", title: "{地球|ちきゅう}の観測所", short: "地球", color: "#88bfff" }
  ];
  var additions = [
    { id: "ice_box", domain: "matter", level: "elementary", title: "氷を守る配達便", theme: "solution", guardian: "tokerun", story: "氷を遠くの村へ届けたい。包み方で、とける量はどう変わる？", connection: "保冷箱と、水のすがたの変化。", units: ["g4_u10", "g4_u11"] },
    { id: "salt_lab", domain: "matter", level: "middle", title: "{濃度|のうど}の調合室", theme: "solution", guardian: "g5_u07_legendary", prerequisites: ["crystal_gate", "ice_box"], story: "料理の塩水を同じこさに調合しよう。水を足すと、蒸発させると？", connection: "物のとけ方 → {質量|しつりょう}パーセント濃度。", primer: "中学の手がかり：{溶質|ようしつ}はとけている物、{溶媒|ようばい}はとかす物。{質量|しつりょう}パーセント濃度＝食塩の重さ ÷ 食塩水全体の重さ × 100。水だけの重さではわらないよ。", units: ["g5_u07"] },
    { id: "lever_gate", domain: "energy", level: "elementary", title: "小さな力の水門", theme: "physics", guardian: "teko_lizard", story: "重い水門の模型を、小さなおもりで動かせるかな？　支点からのきょりが手がかり。", connection: "てこから、道具の力の使い方へ。", units: ["g6_u08"] },
    { id: "lamp_port", domain: "energy", level: "elementary", title: "長く光る灯台", theme: "electric", guardian: "magnet_dragon", story: "同じ量の電気で、灯台を長く光らせたい。比べ方に落とし穴はないかな？", connection: "LEDと電気の有効利用 → 電流の調べ方。", units: ["g6_u09"] },
    { id: "circuit_lab", domain: "energy", level: "middle", title: "{抵抗|ていこう}の回路工房", theme: "electric", guardian: "g6_u09_legendary", prerequisites: ["lever_gate", "lamp_port"], story: "電圧を変えると電流はどう変わる？　回路の記録からきまりを探そう。", connection: "電気の利用 → 電圧・抵抗・オームの法則。", primer: "中学の手がかり：電圧の単位はV、電流はA、{抵抗|ていこう}はΩ。オームの法則に従う抵抗では、電流(A)＝電圧(V) ÷ 抵抗(Ω)。温度などの条件をそろえた模型で考えるよ。", units: ["g5_u09", "g6_u09"] },
    { id: "pulse_trail", domain: "life", level: "elementary", title: "こどうの探検路", theme: "body", guardian: "ibukuro_dragon", story: "歩く前と後で、脈の記録が変わった。人数や、はかった時間にも注目しよう。", connection: "心臓と血液 → 記録から言えることの限界。", units: ["g6_u02"] },
    { id: "food_web", domain: "life", level: "middle", title: "森のつながり研究所", theme: "eco", guardian: "g6_u04_legendary", prerequisites: ["light_garden", "pulse_trail"], story: "植物から動物へ、落ち葉から土へ。森のつながりをたどろう。", connection: "葉の養分・食べる関係 → 生産者・消費者・分解者。", primer: "中学の手がかり：植物など、自分で養分を作る生き物は{生産者|せいさんしゃ}。ほかの生き物から養分を得る動物は{消費者|しょうひしゃ}。菌などが死がいや落ち葉を分解する役割を{分解者|ぶんかいしゃ}というよ。ここではこの三つの役割を区別するね。", units: ["g6_u03", "g6_u04"] },
    { id: "cloud_ship", domain: "earth", level: "elementary", title: "雲を追う観測船", theme: "sky", guardian: "typhoon_dragon", story: "西の港に雲が見えた。画像をつないで、灯台に来る時刻を予想しよう。", connection: "天気の予想 → 予想に必要な条件と不確かさ。", units: ["g5_u01", "g5_u05"] },
    { id: "dew_lab", domain: "earth", level: "middle", title: "くもる窓の観測室", theme: "sky", guardian: "g5_u01_legendary", prerequisites: ["river_valley", "cloud_ship"], story: "冷たい窓に水滴がついた。水蒸気と温度の記録を読み解こう。", connection: "水のすがた・天気 → 湿度・飽和水蒸気量・凝結。", primer: "中学の手がかり：{飽和水蒸気量|ほうわすいじょうきりょう}は、その温度で水蒸気のままでいられる量の上限。{湿度|しつど}(%)＝今の水蒸気の量 ÷ 同じ体積・温度での上限 × 100。冷やして上限をこえる分が水滴になることを{凝結|ぎょうけつ}というよ。", units: ["g4_u11", "g5_u01"] }
  ];
  data.quests.push.apply(data.quests, additions);

  function integer(rng, min, count) { return min + Math.floor(rng() * count); }
  function pack(rng, headers, rows) {
    var names = h.shuffled(["A", "B", "C", "D"], rng);
    return { names: names, table: h.table(["記録"].concat(headers), h.shuffled(rows.map(function (row, i) { return [names[i]].concat(row); }), rng)) };
  }
  function evidence(p, stem, context, explanation) {
    return { type: "evidence", table: p.table, answer: p.names.slice(0, 2), stem: stem, context: context,
      explanation: p.names[0] + "と" + p.names[1] + "が根拠だよ。" + explanation,
      hint: "問題で調べたい条件を見て、ほかの条件がそろう二つを探そう。" };
  }
  function classify(rng, stem, entries, choices, context, explanation, hint) {
    var answer = {};
    entries.forEach(function (entry) { answer[entry[0]] = entry[2]; });
    return { type: "classify", stem: stem, fields: h.shuffled(entries.map(function (entry) { return { id: entry[0], label: entry[1] }; }), rng),
      choices: h.shuffled(choices, rng), answer: answer, context: context, explanation: explanation, hint: hint };
  }
  var designChoices = [{ id: "same", label: "同じにする" }, { id: "change", label: "変える" }];
  var claimChoices = [{ id: "supported", label: "記録に合っている" }, { id: "refuted", label: "記録と違っている" }, { id: "unknown", label: "この記録だけではわからない" }];
  function design(rng, stem, entries, context) {
    return classify(rng, stem, entries, designChoices, context,
      "調べたい条件を一つだけ変え、ほかはそろえるよ。いくつも条件を変えると、何が結果に関係したかわからないよ。",
      "今回調べたい条件は何かな？　それ以外をそろえよう。");
  }

  function ice(rng) {
    var mass = integer(rng, 10, 6) * 10, minutes = integer(rng, 2, 5) * 5;
    var wrapped = integer(rng, 4, 8), bare = wrapped + integer(rng, 9, 15), ambient = integer(rng, 20, 9);
    var p = pack(rng, ["包み", "初めの氷", "室温", "時間", "とけた量"], [
      ["なし", mass + "g", ambient + "℃", minutes + "分", bare + "g"], ["あり", mass + "g", ambient + "℃", minutes + "分", wrapped + "g"],
      ["あり", mass + "g", ambient + "℃", minutes + 10 + "分", wrapped + 3 + "g"], ["なし", mass + 20 + "g", ambient + "℃", minutes + "分", bare + 2 + "g"]
    ]);
    var context = "同じ形・初めの温度の氷と、同じ容器で比べた架空の記録だよ。包み方だけの効果を調べる。ここでは氷が水にすがたを変える。食塩が水にとける変化とは違うよ。氷や水は外にこぼれないものとして考えよう。";
    var nextMass = mass + 30, nextMelt = wrapped + integer(rng, 2, 6);
    return { signature: "ice:" + [mass, minutes, wrapped, bare, ambient, nextMelt].join(","), steps: [
      { type: "number", unit: "g", answer: mass - wrapped, table: p.table, context: context, stem: "包みありの氷は、" + minutes + "分後に何g残る？", explanation: "初めの" + mass + "gから、とけた" + wrapped + "gを引く。残る氷は" + (mass - wrapped) + "gだよ。", hint: "初めの氷から、とけた分を引こう。" },
      evidence(p, "包みのあり・なしだけを比べられる記録を二つ選ぼう。", context, "初めの氷・室温・時間が同じ。包み以外も変えた記録では、包みだけの効果を比べられないよ。"),
      design(rng, "別の包みで再調査する。何を変え、何をそろえる？", [["wrap", "包みの種類", "change"], ["mass", "初めの氷の量と温度", "same"], ["room", "室温", "same"], ["time", "比べる時間", "same"]], context),
      { type: "number", unit: "g", answer: nextMass - nextMelt, context: "新しい配達便では、初めの氷が" + nextMass + "g、とけた量が" + nextMelt + "gだった。前のとけた量をそのまま使わないでね。", stem: "新しい便で残った氷は何g？", explanation: nextMass + "−" + nextMelt + "＝" + (nextMass - nextMelt) + "g。包みは、とけるのを遅らせることはあっても、どんな条件でもずっと氷のままにできるとは言えないよ。", hint: "新しい便の数字を使って、残りを求めよう。" }
    ] };
  }

  function salt(rng) {
    var total = integer(rng, 2, 7) * 50, percent = integer(rng, 2, 5) * 2;
    var saltMass = total * percent / 100, water = total - saltMass, added = integer(rng, 1, 5) * 20;
    var p = pack(rng, ["食塩", "水", "全体"], [
      [saltMass + "g", water + "g", total + "g"], [saltMass + "g", water + added + "g", total + added + "g"],
      [saltMass * 2 + "g", water + "g", total + saltMass + "g"], [saltMass * 3 + "g", water + added + "g", total + saltMass * 2 + added + "g"]
    ]);
    var context = "中学への橋。食塩は全部とけ、こぼれたり、食塩が外へ出たりしない模型だよ。食塩水は飲まないよ。";
    return { signature: "salt:" + [total, percent, added].join(","), steps: [
      { type: "number", unit: "%", inputLabel: "食塩水の濃度", answer: percent, context: context, stem: "食塩" + saltMass + "gと水" + water + "gの食塩水。質量パーセント濃度は何%？", explanation: "全体は" + total + "g。" + saltMass + "÷" + total + "×100＝" + percent + "%だよ。", hint: "水ではなく、食塩水全体の重さでわろう。" },
      evidence(p, "食塩を増やさず、水だけ足した変化を調べる記録を二つ選ぼう。", context, "食塩の重さが同じで、水の重さだけが増えているよ。"),
      classify(rng, "水だけ足すと、何が増え、何が変わらない？", [["salt", "食塩の重さ", "same"], ["water", "水の重さ", "up"], ["all", "全体の重さ", "up"], ["percent", "濃度", "down"]], [{ id: "same", label: "変わらない" }, { id: "up", label: "増える" }, { id: "down", label: "減る" }], context, "食塩は同じ。水と全体が増えるので、全体に対する食塩の割合は小さくなるよ。", "濃度は、全体に対する食塩の割合だよ。"),
      { type: "number", unit: "%", inputLabel: "新しい濃度", answer: percent * 2, context: "先生が水だけ蒸発させ、全体の重さが" + total / 2 + "gになった。食塩" + saltMass + "gは全部とけたままで、食塩は失われない条件だよ。", stem: "もとの食塩水の濃度は、今度は何%？", explanation: saltMass + "÷" + total / 2 + "×100＝" + percent * 2 + "%だよ。水だけ減ると、全体に対する食塩の割合が大きくなる。", hint: "食塩の重さは同じ。新しい全体の重さでわろう。" }
    ] };
  }

  function lever(rng) {
    var base = integer(rng, 2, 10) * 5, right = integer(rng, 1, 3), left = integer(rng, 2, 5) * 2, mass = base * left;
    var p = pack(rng, ["右のおもり", "右のきょり", "左のきょり", "つり合う左のおもり"], [
      [mass + "g", right + "目もり", left + "目もり", base * right + "g"], [mass + "g", right + "目もり", left * 2 + "目もり", base * right / 2 + "g"],
      [mass + "g", right + 1 + "目もり", left + "目もり", base * (right + 1) + "g"], [mass * 2 + "g", right + "目もり", left * 2 + "目もり", base * right + "g"]
    ]);
    var context = "水門は実験用てこの模型。左右の「重さ×支点からのきょり」が同じで水平につり合うよ。目もりの間隔は全部同じ。実物の重い水門には触れないよ。";
    return { signature: "lever:" + [base, right, left].join(","), steps: [
      { type: "number", unit: "g", answer: base * right * 2, context: context, stem: "右は" + mass + "gで支点から" + right + "目もり。左は" + left / 2 + "目もり。何gをつるすとつり合う？", explanation: "右は" + mass + "×" + right + "。左のきょり" + left / 2 + "でわると、" + base * right * 2 + "gだよ。", hint: "まず右の重さ×きょり。次に左のきょりでわろう。" },
      evidence(p, "左のきょりだけを変えると、必要なおもりが変わるか調べたい。根拠の記録を二つ選ぼう。", context, "右のおもりと右のきょりがそろい、左のきょりだけが変わるよ。"),
      design(rng, "左のきょりの効果を調べる実験を組み立てよう。", [["left", "左の支点からのきょり", "change"], ["right", "右のおもりの重さ", "same"], ["arm", "右の支点からのきょり", "same"], ["tool", "使うてこ", "same"]], context),
      { type: "number", unit: "g", answer: base * right / 2, context: context, stem: "右の条件は同じ。左を支点から" + left * 2 + "目もりに移すと、つり合う左のおもりは何g？", explanation: mass + "×" + right + "÷" + left * 2 + "＝" + base * right / 2 + "g。支点から遠くすると、小さなおもりでつり合うよ。", hint: "右の重さ×きょりは変わらない。新しい左のきょりでわろう。" }
    ] };
  }

  function lamp(rng) {
    var bulb = integer(rng, 10, 16), led = bulb + integer(rng, 15, 26);
    var p = pack(rng, ["ランプ", "初めの電気", "明るさ", "光った時間"], [
      ["豆電球", "同じ量", "同じ明るさ", bulb + "分"], ["LED", "同じ量", "同じ明るさ", led + "分"],
      ["豆電球", "多い量", "同じ明るさ", bulb + 10 + "分"], ["LED", "同じ量", "弱い明るさ", led + 12 + "分"]
    ]);
    var nextLED = integer(rng, 12, 20), nextBulb = integer(rng, 15, 20);
    var context = "ムーの灯台の模型の架空の記録だよ。先生が同じ量の電気をため、同じ明るさにそろえて比べた。家庭の電源やコンセントでは実験しないよ。";
    return { signature: "lamp:" + [bulb, led, nextLED, nextBulb].join(","), steps: [
      { type: "number", unit: "分", answer: led - bulb, table: p.table, context: context, stem: "同じ条件で、LEDは豆電球より何分長く光った？", explanation: led + "−" + bulb + "＝" + (led - bulb) + "分長く光ったよ。", hint: "同じ電気の量・同じ明るさの記録を使おう。" },
      evidence(p, "ランプの種類だけを変えて、長く光るか調べられる記録を二つ選ぼう。", context, "初めの電気と明るさが同じ。明るさまで変えると、ランプの種類だけの効果を比べられないよ。"),
      h.orderStep("新しいランプを比べる手順を並べよう。", ["同じコンデンサーに同じ量の電気をためる", "ランプをつなぎ、同じ明るさで同時に光らせる", "消えるまでの時間をはかる", "記録を比べ、どの条件をそろえたか確かめる"], "準備、点灯、測定、比較の順だよ。同じ量の電気でも、明るさをそろえずに時間だけ比べるのは公平ではないよ。", "ためる → 光らせる → はかる → 比べる、の順。", rng),
      classify(rng, "別の灯台の記録から、どこまで言える？", [["longer", "LED" + nextLED + "分、豆電球" + nextBulb + "分。この記録ではLEDのほうが長く光った", nextLED > nextBulb ? "supported" : "refuted"], ["efficiency", "LEDだけ明るさを強くした。時間だけで、どちらが少ない電気で同じ明るさになるか決められる", "unknown"], ["universal", "どんな製品・明るさでも、前の記録と同じ分数だけ長く光る", "unknown"]], claimChoices, "新しい灯台はLEDの明るさを強くした。初めの電気は同じ量だけれど、明るさは同じでないよ。", "光った時間の数字は比べられる。LEDの時間が同じか短ければ「長く光った」は記録と違う。ただし、同じ明るさでの電気の使い方は、明るさをそろえないと比べられないよ。", "記録に合う・違う・まだわからない、を分けよう。")
    ] };
  }

  function circuit(rng) {
    var resistance = integer(rng, 1, 10) * 10, rate = integer(rng, 1, 9) / 10;
    var voltage = Math.round(resistance * rate * 10) / 10;
    var p = pack(rng, ["抵抗", "電圧", "電流"], [
      [resistance + "Ω", resistance / 10 + "V", "0.1A"], [resistance + "Ω", resistance / 5 + "V", "0.2A"],
      [resistance * 2 + "Ω", resistance / 5 + "V", "0.1A"], [resistance * 3 + "Ω", resistance * .3 + "V", "0.1A"]
    ]);
    var context = "中学への橋。温度をそろえた、オームの法則に従う抵抗の模型だよ。この式をLEDなど全ての道具にそのまま使えるわけではない。コンセントでは試さないよ。";
    return { signature: "circuit:" + [resistance, Math.round(rate * 10)].join(","), steps: [
      { type: "number", unit: "A", inputLabel: "電流の大きさ", answer: rate, context: context, stem: resistance + "Ωの抵抗に" + voltage + "Vをかける。流れる電流は何A？", explanation: voltage + "÷" + resistance + "＝" + rate + "Aだよ。電流＝電圧÷抵抗。", hint: "Vの数字を、Ωの数字でわろう。" },
      evidence(p, "同じ抵抗で、電圧と電流の関係を調べる記録を二つ選ぼう。", context, "抵抗が同じで、電圧だけが変わるよ。抵抗も変えると、この比較にはならない。"),
      design(rng, "電圧の変化を調べる回路を組み立てよう。", [["voltage", "電圧", "change"], ["resistance", "抵抗", "same"], ["temperature", "抵抗の温度", "same"], ["method", "電流のはかり方", "same"]], context),
      { type: "number", unit: "A", inputLabel: "新しい電流", answer: rate / 2, context: context, stem: "同じ" + voltage + "Vで、抵抗を" + resistance * 2 + "Ωにする。今度の電流は何A？", explanation: voltage + "÷" + resistance * 2 + "＝" + rate / 2 + "A。同じ電圧で抵抗が大きくなると、電流は小さくなるよ。", hint: "電圧は同じ。新しい抵抗の数字でわろう。" }
    ] };
  }

  function pulse(rng) {
    var before = integer(rng, 14, 7), after = before + integer(rng, 5, 10), seconds = integer(rng, 1, 3) * 10;
    var p = pack(rng, ["人", "場面", "はかった時間", "脈の回数"], [
      ["ミナ", "歩く前", seconds + "秒", before + "回"], ["ミナ", "歩いた後", seconds + "秒", after + "回"],
      ["ソラ", "歩く前", seconds + "秒", before + 2 + "回"], ["ミナ", "歩いた後", seconds * 2 + "秒", after * 2 + "回"]
    ]);
    var recovery = before + integer(rng, 0, 5);
    var context = "架空の人の観察記録だよ。強い運動をしたり、脈の数を友だちと競ったりしない。数だけで病気や体調は判断できないよ。";
    return { signature: "pulse:" + [before, after, seconds, recovery].join(","), steps: [
      { type: "number", unit: "回", answer: after - before, table: p.table, context: context, stem: "ミナが歩く前と後。同じ長さの時間では、脈の回数が何回増えた？", explanation: after + "−" + before + "＝" + (after - before) + "回。はかった時間をそろえて比べよう。", hint: "人とはかった時間が同じ二つの記録を使おう。" },
      evidence(p, "一人の人の、歩く前と後の変化を比べる記録を二つ選ぼう。", context, "同じ人を、同じ長さの時間ではかっているよ。人や時間が違う記録を、そのまま比べないでね。"),
      design(rng, "歩く前と後の記録を比べ直す。何をそろえる？", [["scene", "歩く前・歩いた後という場面", "change"], ["person", "観察する人", "same"], ["seconds", "脈を数える時間", "same"], ["place", "脈をはかる場所・方法", "same"]], context),
      classify(rng, "休んだ後は、同じ" + seconds + "秒で" + recovery + "回だった。記録から言えることは？", [["fewer", "休んだ後の回数は、歩いた直後の" + after + "回より少ない", "supported"], ["equal", "休んだ後は、歩く前の" + before + "回と同じだった", recovery === before ? "supported" : "refuted"], ["all", "どの人も、同じ時間休めば必ず同じ回数になる", "unknown"], ["health", "脈の数字だけで健康かどうか決められる", "unknown"]], claimChoices, context, "この人の、この時間の数字は比べられる。同じでなければ「同じだった」は記録と違う。でも、ほかの人や体調について、この記録だけで決められないよ。", "記録に合う・違う・書かれていないことを分けよう。")
    ] };
  }

  function food(rng) {
    var chains = [["草", "バッタ", "カエル"], ["草", "ウサギ", "キツネ"], ["草の種子", "ネズミ", "フクロウ"]];
    var chain = chains[integer(rng, 0, chains.length)], count = integer(rng, 2, 30), days = integer(rng, 2, 12), target = integer(rng, 0, 3);
    var roles = [{ id: "producer", label: "生産者" }, { id: "consumer", label: "消費者" }, { id: "decomposer", label: "分解者の役割" }];
    var objects = [["草：日光で養分を作る", "producer"], [chain[1] + "：ほかの生き物から養分を得る動物", "consumer"], ["菌：落ち葉を分解する役割", "decomposer"]];
    var p = pack(rng, ["観察した関係"], [[chain[1] + "が" + chain[0] + "を食べた"], [chain[2] + "が" + chain[1] + "を食べた"], ["菌が落ち葉を分解した"], [chain[2] + "が水を飲んだ"]]);
    var context = "中学への橋。" + days + "日間の架空の森の記録だよ。今の" + chain[2] + "は" + count + "匹。生き物を捕まえたり減らしたりせず、資料で調べるよ。";
    return { signature: "food:" + [chains.indexOf(chain), count, days, target].join(","), steps: [
      classify(rng, "この生き物の役割は？", [["target", objects[target][0], objects[target][1]]], roles, context, "草は養分を作る生産者。動物は消費者。菌などが死がいや落ち葉を分解する役割が、分解者だよ。", "名前だけでなく、どう養分を得るかを見よう。"),
      evidence(p, "生きた植物から二段階の動物へ、食べ物がつながる根拠を二つ選ぼう。", context, chain[0] + "→" + chain[1] + "→" + chain[2] + "という食べる・食べられる関係だよ。水を飲むことは、この食べ物の矢印ではないよ。"),
      classify(rng, "この記録で確かめたことと、まだ決められないことを分けよう。", [["feed", chain[2] + "が" + chain[1] + "を食べた", "supported"], ["future", "明日も" + chain[2] + "は必ず" + count + "匹いる", "unknown"], ["only", chain[2] + "は、ほかの食べ物を絶対に食べない", "unknown"], ["decompose", "菌が落ち葉を分解した", "supported"]], claimChoices, context, "一度見た食べ物のつながりだけでは、将来の匹数や、ほかの食べ物がないことまでは決められないよ。", "見たという記録と、必ず・絶対という言い切りを区別しよう。"),
      classify(rng, "別の池でも、説明から役割を考えよう。", [["plant", "水草：日光で養分を作る", "producer"], ["animal", "小魚：小さな動物を食べる", "consumer"], ["fungi", "菌：死がいを分解する役割", "decomposer"]], roles, "池の架空の資料。陸でも水中でも、養分の得方と役割を手がかりにするよ。", "水草は生産者、小魚は消費者、菌は分解者の役割。姿や場所が変わっても、同じ見方でつながりを調べられるよ。", "何をして養分を得るか、一つずつ確かめよう。")
    ] };
  }

  function cloud(rng) {
    var move = integer(rng, 2, 5), hours = integer(rng, 3, 6), start = integer(rng, 7, 4), other = integer(rng, 1, 4);
    var p = pack(rng, ["時刻", "雲の印", "西の港からの位置"], [
      [start + "時", "○の雲", "0ます"], [start + 1 + "時", "○の雲", move + "ます東"],
      [start + "時", "△の雲", move * 2 + "ます東"], [start + 1 + "時", "△の雲", move * 3 + "ます東"]
    ]);
    var context = "架空の雲画像の地図だよ。○は画像で追跡した同じ雲。地図のますは同じ長さ。ここでは同じ動きを続けると仮定して予想する。現実の雲は動きや形が変わるよ。太陽は直接見ないよ。";
    return { signature: "cloud:" + [move, hours, start, other].join(","), steps: [
      { type: "number", unit: "時間後", inputLabel: "港を出てからの時間", answer: hours, table: p.table, context: context, stem: "○の雲が毎時間" + move + "ます東へ進むと仮定する。港から東へ" + move * hours + "ますの灯台に、出発の何時間後に来る？", explanation: move * hours + "÷" + move + "＝" + hours + "時間後。これは同じ動きを続けるという仮定つきの予想だよ。", hint: "灯台までのますを、1時間に進むますでわろう。" },
      evidence(p, "○の雲の動きを調べる、二つの画像の記録を選ぼう。", context, "違う時刻の同じ雲を追っているよ。別の雲をつなげると、○の雲の動きはわからないよ。"),
      h.orderStep("雲画像から動きを調べる手順を並べよう。", ["時刻の違う雲画像を用意する", "二つの画像で同じ雲のかたまりを見つける", "それぞれの画像で、その雲の位置を記録する", "時刻と位置を比べ、動いた方角を考える"], "時刻のついた画像で、同じ雲を追うことが大切。形が似た別の雲と取り違えないようにするよ。", "画像 → 同じ雲 → 位置の記録 → 比較、の順。", rng),
      classify(rng, "灯台で天気を予想するとき、どこまで言える？", [["model", "途中で止まらず同じ動きなら、港から" + move * (hours + other) + "ますの場所へ" + (hours + other) + "時間後に来る", "supported"], ["rain", "雲が来たら、必ず雨が降る", "unknown"], ["real", "実際の雲も、必ず同じ時刻に到着する", "unknown"]], claimChoices, context, "模型の条件では計算できる。でも現実の雲の動きは変わるし、雲があるだけで必ず雨とは言えないよ。", "仮定つきの模型の予想と、現実の天気の言い切りを分けよう。")
    ] };
  }

  function dew(rng) {
    var capacity = integer(rng, 4, 4) * 5, percent = integer(rng, 4, 5) * 10, vapor = capacity * percent / 100;
    var cool = integer(rng, 3, 7) * 2, drops = Math.max(0, vapor - cool);
    var p = pack(rng, ["温度", "空気の体積", "冷やす前の水蒸気", "その温度の上限"], [
      ["あたたかい", "1m³", vapor + "g", capacity + "g"], ["冷たい", "1m³", vapor + "g", cool + "g"],
      ["冷たい", "1m³", vapor + 3 + "g", cool + "g"], ["あたたかい", "2m³", vapor * 2 + "g", capacity * 2 + "g"]
    ]);
    var context = "中学への橋。「ムーの空気模型」の架空の量だよ。実際の気温ごとの数値ではない。空気1m³を冷やし、水蒸気が外へ出入りしないものとして考えるよ。薬品や火は使わない観測資料だよ。";
    return { signature: "dew:" + [capacity, percent, cool].join(","), steps: [
      { type: "number", unit: "%", inputLabel: "冷やす前の湿度", answer: percent, context: context, stem: "あたたかいときの上限が" + capacity + "g、今の水蒸気が" + vapor + "g。湿度は何%？", explanation: vapor + "÷" + capacity + "×100＝" + percent + "%だよ。同じ体積・温度の上限と比べよう。", hint: "今の水蒸気÷その温度の上限×100だよ。" },
      evidence(p, "同じ初めの水蒸気と体積で、温度の効果を調べる記録を二つ選ぼう。", context, "初めの量と体積が同じで、温度だけが違う。上限の違いを温度と結びつけて考えられるよ。"),
      design(rng, "冷やす効果だけを確かめる。どの条件を変える？", [["temp", "温度", "change"], ["amount", "初めの水蒸気の量", "same"], ["volume", "空気の体積", "same"], ["entry", "外との水蒸気の出入り", "same"]], context),
      { type: "number", unit: "g", inputLabel: "水滴になる量", answer: drops, context: context, stem: "冷やした後の上限は" + cool + "g。初めの水蒸気" + vapor + "gのうち、上限をこえて水滴になる分は何g？　こえなければ0と答えよう。", explanation: vapor > cool ? vapor + "−" + cool + "＝" + drops + "gが水滴になる。冷たい窓で水滴ができることも、温度と水蒸気の量に関係するよ。" : "今の" + vapor + "gは上限" + cool + "gをこえないので、この模型で水滴になる分は0g。冷やせばどんな条件でも必ず水滴が出るわけではないよ。", hint: "上限をこえる分だけを引き算する。こえていないなら0だよ。" }
    ] };
  }

  var builders = { ice_box: ice, salt_lab: salt, lever_gate: lever, lamp_port: lamp, circuit_lab: circuit, pulse_trail: pulse, food_web: food, cloud_ship: cloud, dew_lab: dew };
  var originalBuild = data.build;
  data.build = function (id, seed) { return builders[id] ? builders[id](h.random(seed)) : originalBuild(id, seed); };
})(window.RikaMuData);
