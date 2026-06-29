(function () {
  window.MONSTERS = {
    kumokumo: {
      id: "kumokumo",
      name: "クモクモスライム",
      theme: "sky",
      role: "zako",
      flavor: "{雲|くも}の形をまねする、ふわふわスライム。",
      svg: "makeGenericSlime"
    },
    typhoon_dragon: {
      id: "typhoon_dragon",
      name: "タイフーンドラゴン",
      theme: "sky",
      role: "boss",
      flavor: "{風|かぜ}と雨のうずをまとったドラゴン。",
      svg: "makeGenericDragon"
    },
    mebae_slime: {
      id: "mebae_slime",
      name: "メバエスライム",
      theme: "plant",
      role: "zako",
      flavor: "{種子|しゅし}の力で元気にのびるスライム。",
      svg: "makeGenericSlime"
    },
    tane_dragon: {
      id: "tane_dragon",
      name: "タネドラゴン",
      theme: "plant",
      role: "boss",
      flavor: "花と実を守る小さな森のドラゴン。",
      svg: "makeGenericDragon"
    },
    medakappa: {
      id: "medakappa",
      name: "メダカッパ",
      theme: "life",
      role: "zako",
      flavor: "{水辺|みずべ}でたまごを見守るなかま。",
      svg: "makeGenericBeast"
    },
    tamago_dragon: {
      id: "tamago_dragon",
      name: "タマゴリュウ",
      theme: "life",
      role: "boss",
      flavor: "{生命|せいめい}のはじまりを守るドラゴン。",
      svg: "makeGenericDragon"
    },
    shinsyoku_slime: {
      id: "shinsyoku_slime",
      name: "シンショクスライム",
      theme: "water",
      role: "zako",
      flavor: "流れる水で石をけずるスライム。",
      svg: "makeGenericSlime"
    },
    gorota_wani: {
      id: "gorota_wani",
      name: "ゴロタワニ",
      theme: "water",
      role: "boss",
      flavor: "川原の丸い石を背中にのせたワニ。",
      svg: "makeGenericBeast"
    },
    soltin: {
      id: "soltin",
      name: "ソルティン",
      theme: "solution",
      role: "zako",
      flavor: "{食塩|しょくえん}のけっしょうがスライムになったよ。",
      svg: "makeSoltin"
    },
    myoubaroo: {
      id: "myoubaroo",
      name: "ミョウバルー",
      theme: "solution",
      role: "zako",
      flavor: "ミョウバンのつばさをもつ小さな{竜|りゅう}。",
      svg: "makeMyoubaroo"
    },
    tokerun: {
      id: "tokerun",
      name: "トケルン",
      theme: "solution",
      role: "zako",
      flavor: "{水|みず}の中で半透明になるスライム。",
      svg: "makeTokerun"
    },
    rokagaeru: {
      id: "rokagaeru",
      name: "ロカガエル",
      theme: "solution",
      role: "zako",
      flavor: "ろ紙のマントで、とけ残りを止めるカエル。",
      svg: "makeRokagaeru"
    },
    johatsu_bat: {
      id: "johatsu_bat",
      name: "ジョーハツバット",
      theme: "solution",
      role: "zako",
      flavor: "{蒸発|じょうはつ}の風をおこすコウモリ。",
      svg: "makeJohatsuBat"
    },
    crystadra: {
      id: "crystadra",
      name: "クリスタドラゴン",
      theme: "solution",
      role: "boss",
      flavor: "ミョウバンのけっしょうから生まれた{竜|りゅう}。とけ残りを{操|あやつ}る。",
      svg: "makeCrystadra"
    },
    biribiri_slime: {
      id: "biribiri_slime",
      name: "ビリビリスライム",
      theme: "electric",
      role: "zako",
      flavor: "{電流|でんりゅう}の力でぴかっと光るスライム。",
      svg: "makeGenericSlime"
    },
    magnet_dragon: {
      id: "magnet_dragon",
      name: "マグネドラ",
      theme: "electric",
      role: "boss",
      flavor: "{電磁石|でんじしゃく}の力をまとったドラゴン。",
      svg: "makeGenericDragon"
    },
    furiko_bat: {
      id: "furiko_bat",
      name: "フリコウモリ",
      theme: "physics",
      role: "zako",
      flavor: "ふりこのリズムでとぶコウモリ。",
      svg: "makeGenericBeast"
    },
    teko_lizard: {
      id: "teko_lizard",
      name: "テコトカゲ",
      theme: "physics",
      role: "boss",
      flavor: "てこの力で大きな岩を動かすトカゲ。",
      svg: "makeGenericBeast"
    },
    honoo_slime: {
      id: "honoo_slime",
      name: "ホノオスライム",
      theme: "fire",
      role: "zako",
      flavor: "{空気|くうき}をよく見て燃え方を変える。",
      svg: "makeGenericSlime"
    },
    sanso_dragon: {
      id: "sanso_dragon",
      name: "サンソドラゴン",
      theme: "fire",
      role: "boss",
      flavor: "燃え続ける条件を守るドラゴン。",
      svg: "makeGenericDragon"
    },
    ketsueki_slime: {
      id: "ketsueki_slime",
      name: "ケツエキスライム",
      theme: "body",
      role: "zako",
      flavor: "{血液|けつえき}のはたらきをまねるスライム。",
      svg: "makeGenericSlime"
    },
    ibukuro_dragon: {
      id: "ibukuro_dragon",
      name: "イぶくろドラゴン",
      theme: "body",
      role: "boss",
      flavor: "食べ物のゆくえを見守るドラゴン。",
      svg: "makeGenericDragon"
    },
    moon_dragon_zako: {
      id: "moon_dragon_zako",
      name: "ツキウサギュラ",
      theme: "space",
      role: "zako",
      flavor: "{月|つき}の形に合わせてすがたを変える。",
      svg: "makeGenericBeast"
    },
    moon_dragon: {
      id: "moon_dragon",
      name: "ムーンドラゴン",
      theme: "space",
      role: "boss",
      flavor: "{太陽|たいよう}の光を受けて夜空にあらわれる。",
      svg: "makeGenericDragon"
    },
    chisou_golem: {
      id: "chisou_golem",
      name: "チソウゴーレム",
      theme: "earth",
      role: "zako",
      flavor: "{地層|ちそう}のしまもようをもつゴーレム。",
      svg: "makeGenericBeast"
    },
    kazan_dragon: {
      id: "kazan_dragon",
      name: "カザンドラゴン",
      theme: "earth",
      role: "boss",
      flavor: "{火山|かざん}と大地の変化を見守るドラゴン。",
      svg: "makeGenericDragon"
    },
    sansei_slime: {
      id: "sansei_slime",
      name: "サンセイスライム",
      theme: "chem",
      role: "zako",
      flavor: "水溶液のなかま分けが得意なスライム。",
      svg: "makeGenericSlime"
    },
    alkali_dragon: {
      id: "alkali_dragon",
      name: "アルカリドラゴン",
      theme: "chem",
      role: "boss",
      flavor: "水溶液の性質を見分けるドラゴン。",
      svg: "makeGenericDragon"
    },
    junkan_slime: {
      id: "junkan_slime",
      name: "ジュンカンスライム",
      theme: "eco",
      role: "zako",
      flavor: "生き物どうしのつながりをめぐるスライム。",
      svg: "makeGenericSlime"
    },
    eco_dragon: {
      id: "eco_dragon",
      name: "エコドラゴン",
      theme: "eco",
      role: "boss",
      flavor: "{地球|ちきゅう}に生きるみんなを見守るドラゴン。",
      svg: "makeGenericDragon"
    }
  };
})();
