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
      rarity: "normal",
      name: "{溶解|ようかい}のつるぎ",
      desc: "正かいで「{会心|かいしん}の一{撃|げき}」が出やすくなる。",
      effect: { critUp: 0.15 }
    },
    sol_shield: {
      id: "sol_shield",
      slot: "shield",
      theme: "solution",
      rarity: "normal",
      name: "けっしょうの{盾|たて}",
      desc: "まちがえても1回だけ耐えられる。",
      effect: { block: 1 }
    },
    sol_armor: {
      id: "sol_armor",
      slot: "armor",
      theme: "solution",
      rarity: "normal",
      name: "ろ過の{鎧|よろい}",
      desc: "バトル開始時のライフ＋1。",
      effect: { hpUp: 1 }
    },
    sol_gauntlet: {
      id: "sol_gauntlet",
      slot: "gauntlet",
      theme: "solution",
      rarity: "normal",
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
        rarity: "normal",
        name: "{" + label + "|" + yomi + "}" + slotNames[slot][0],
        desc: slotNames[slot][1],
        effect: Object.assign({}, effectBySlot[slot])
      };
    });
  });

  Object.assign(window.EQUIPMENT, {
    sky_rare_gauntlet_g5u01: {
      id: "sky_rare_gauntlet_g5u01",
      unitId: "g5_u01",
      slot: "gauntlet",
      theme: "sky",
      rarity: "rare",
      name: "{稲妻|いなずま}のグローブ★",
      desc: "1回のミスではコンボが切れない。会心も少し出やすい。",
      effect: { comboKeep: 1, critUp: 0.1 }
    },
    plant_rare_armor_g5u02: {
      id: "plant_rare_armor_g5u02",
      unitId: "g5_u02",
      slot: "armor",
      theme: "plant",
      rarity: "rare",
      name: "いのちの{若葉|わかば}よろい★",
      desc: "ライフ0でも1回だけライフ1でふっかつする。",
      effect: { hpUp: 2, reviveOnce: 1 }
    },
    life_rare_sword_g5u03: {
      id: "life_rare_sword_g5u03",
      unitId: "g5_u03",
      slot: "sword",
      theme: "life",
      rarity: "rare",
      name: "{受精|じゅせい}の{輝剣|きけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    plant_rare_shield_g5u04: {
      id: "plant_rare_shield_g5u04",
      unitId: "g5_u04",
      slot: "shield",
      theme: "plant",
      rarity: "rare",
      name: "{花粉|かふん}ガードの{盾|たて}★",
      desc: "まちがいを2回までふせぐ。",
      effect: { block: 2 }
    },
    sky_rare_sword_g5u05: {
      id: "sky_rare_sword_g5u05",
      unitId: "g5_u05",
      slot: "sword",
      theme: "sky",
      rarity: "rare",
      name: "{大|おお}うずの{牙|きば}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    water_rare_gauntlet_g5u06: {
      id: "water_rare_gauntlet_g5u06",
      unitId: "g5_u06",
      slot: "gauntlet",
      theme: "water",
      rarity: "rare",
      name: "けずるダイヤのこて★",
      desc: "コンボボーナスが大きくなる。",
      effect: { comboUp: 2 }
    },
    sol_rare_sword: {
      id: "sol_rare_sword",
      unitId: "g5_u07",
      slot: "sword",
      theme: "solution",
      rarity: "rare",
      name: "{幻晶|げんしょう}のつるぎ★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    life_rare_armor_g5u08: {
      id: "life_rare_armor_g5u08",
      unitId: "g5_u08",
      slot: "armor",
      theme: "life",
      rarity: "rare",
      name: "{母|はは}なるまもりの{鎧|よろい}★",
      desc: "ライフ0でも1回だけライフ1でふっかつする。",
      effect: { hpUp: 2, reviveOnce: 1 }
    },
    electric_rare_sword_g5u09: {
      id: "electric_rare_sword_g5u09",
      unitId: "g5_u09",
      slot: "sword",
      theme: "electric",
      rarity: "rare",
      name: "{雷神|らいじん}の{電磁剣|でんじけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    physics_rare_gauntlet_g5u10: {
      id: "physics_rare_gauntlet_g5u10",
      unitId: "g5_u10",
      slot: "gauntlet",
      theme: "physics",
      rarity: "rare",
      name: "{等時|とうじ}のリズムこて★",
      desc: "1回のミスではコンボが切れない。",
      effect: { comboKeep: 1, comboUp: 1 }
    },
    fire_rare_sword_g6u01: {
      id: "fire_rare_sword_g6u01",
      unitId: "g6_u01",
      slot: "sword",
      theme: "fire",
      rarity: "rare",
      name: "{灼熱|しゃくねつ}の{炎剣|えんけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    body_rare_armor_g6u02: {
      id: "body_rare_armor_g6u02",
      unitId: "g6_u02",
      slot: "armor",
      theme: "body",
      rarity: "rare",
      name: "{生命|せいめい}のこどうの{鎧|よろい}★",
      desc: "ライフ0でも1回だけライフ1でふっかつする。",
      effect: { hpUp: 2, reviveOnce: 1 }
    },
    plant_rare_gauntlet_g6u03: {
      id: "plant_rare_gauntlet_g6u03",
      unitId: "g6_u03",
      slot: "gauntlet",
      theme: "plant",
      rarity: "rare",
      name: "みどりの{葉脈|ようみゃく}こて★",
      desc: "1回のミスではコンボが切れない。",
      effect: { comboKeep: 1, comboUp: 1 }
    },
    eco_rare_shield_g6u04: {
      id: "eco_rare_shield_g6u04",
      unitId: "g6_u04",
      slot: "shield",
      theme: "eco",
      rarity: "rare",
      name: "{食物|しょくもつ}れんさの{盾|たて}★",
      desc: "まちがいを2回までふせぐ。",
      effect: { block: 2 }
    },
    space_rare_sword_g6u05: {
      id: "space_rare_sword_g6u05",
      unitId: "g6_u05",
      slot: "sword",
      theme: "space",
      rarity: "rare",
      name: "{満月|まんげつ}の{光剣|こうけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    earth_rare_armor_g6u06: {
      id: "earth_rare_armor_g6u06",
      unitId: "g6_u06",
      slot: "armor",
      theme: "earth",
      rarity: "rare",
      name: "{地層|ちそう}の{岩|いわ}よろい★",
      desc: "バトル開始時のライフが2ふえる。",
      effect: { hpUp: 2 }
    },
    earth_rare_sword_g6u07: {
      id: "earth_rare_sword_g6u07",
      unitId: "g6_u07",
      slot: "sword",
      theme: "earth",
      rarity: "rare",
      name: "{噴火|ふんか}の{溶岩剣|ようがんけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    physics_rare_gauntlet_g6u08: {
      id: "physics_rare_gauntlet_g6u08",
      unitId: "g6_u08",
      slot: "gauntlet",
      theme: "physics",
      rarity: "rare",
      name: "{支点|してん}のパワーこて★",
      desc: "コンボボーナスが大きくなる。",
      effect: { comboUp: 2 }
    },
    electric_rare_sword_g6u09: {
      id: "electric_rare_sword_g6u09",
      unitId: "g6_u09",
      slot: "sword",
      theme: "electric",
      rarity: "rare",
      name: "{発電|はつでん}の{雷剣|らいけん}★",
      desc: "{会心|かいしん}の一{撃|げき}が2ダメージになる。",
      effect: { critUp: 0.3, doubleCrit: 1 }
    },
    chem_rare_shield_g6u10: {
      id: "chem_rare_shield_g6u10",
      unitId: "g6_u10",
      slot: "shield",
      theme: "chem",
      rarity: "rare",
      name: "リトマスの{守|まも}り{盾|たて}★",
      desc: "まちがいを2回までふせぐ。",
      effect: { block: 2 }
    },
    eco_rare_armor_g6u11: {
      id: "eco_rare_armor_g6u11",
      unitId: "g6_u11",
      slot: "armor",
      theme: "eco",
      rarity: "rare",
      name: "{地球|ちきゅう}のいのりの{鎧|よろい}★",
      desc: "1回ふっかつし、バトルで手に入る経験値が大きくふえる。",
      effect: { hpUp: 2, reviveOnce: 1, expBoostBig: 1 }
    }
  });
})();
