(function () {
  var effectBySlot = {
    sword: { critUp: 0.15 },
    shield: { block: 1 },
    armor: { hpUp: 1 },
    gauntlet: { comboUp: 1 }
  };

  var themes = {
    sky: ["雲風", "くもかぜ"],
    plant: ["若葉", "わかば"],
    life: ["生命", "せいめい"],
    water: ["川石", "かわいし"],
    electric: ["電磁", "でんじ"],
    physics: ["力学", "りきがく"],
    fire: ["燃焼", "ねんしょう"],
    body: ["からだ", "からだ"],
    space: ["月光", "げっこう"],
    earth: ["地層", "ちそう"],
    chem: ["試薬", "しやく"],
    eco: ["地球", "ちきゅう"]
  };

  var slotNames = {
    sword: ["のつるぎ", "正かいで会心の一撃が出やすくなる。"],
    shield: ["の{盾|たて}", "まちがえても1回だけ耐えられる。"],
    armor: ["の{鎧|よろい}", "バトル開始時のライフが1ふえる。"],
    gauntlet: ["のこて", "3問れんぞく正かいでコンボボーナス。"]
  };

  window.EQUIPMENT = {
    sol_sword: {
      id: "sol_sword",
      slot: "sword",
      theme: "solution",
      name: "{溶解|ようかい}のつるぎ",
      desc: "正かいで「{会心|かいしん}の一{撃|げき}」が出やすくなる。",
      effect: { critUp: 0.15 }
    },
    sol_shield: {
      id: "sol_shield",
      slot: "shield",
      theme: "solution",
      name: "けっしょうの{盾|たて}",
      desc: "まちがえても1回だけ耐えられる。",
      effect: { block: 1 }
    },
    sol_armor: {
      id: "sol_armor",
      slot: "armor",
      theme: "solution",
      name: "ろ過の{鎧|よろい}",
      desc: "バトル開始時のライフ＋1。",
      effect: { hpUp: 1 }
    },
    sol_gauntlet: {
      id: "sol_gauntlet",
      slot: "gauntlet",
      theme: "solution",
      name: "{蒸発|じょうはつ}のこて",
      desc: "3問れんぞく正かいでコンボボーナス。",
      effect: { comboUp: 1 }
    }
  };

  Object.keys(themes).forEach(function (theme) {
    Object.keys(slotNames).forEach(function (slot) {
      var key = theme + "_" + slot;
      var label = themes[theme][0];
      var yomi = themes[theme][1];
      window.EQUIPMENT[key] = {
        id: key,
        slot: slot,
        theme: theme,
        name: "{" + label + "|" + yomi + "}" + slotNames[slot][0],
        desc: slotNames[slot][1],
        effect: Object.assign({}, effectBySlot[slot])
      };
    });
  });
})();
