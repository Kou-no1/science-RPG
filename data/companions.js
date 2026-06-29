(function () {
  window.ITEMS = {
    potion: {
      id: "potion",
      name: "{元気|げんき}ポーション",
      desc: "バトル中にライフを1つ回復する。"
    },
    hint_scroll: {
      id: "hint_scroll",
      name: "ヒントの{巻物|まきもの}",
      desc: "4択のまちがいを2つ消して、2択にする。"
    },
    crystal_badge: {
      id: "crystal_badge",
      name: "けっしょうバッジ",
      desc: "おまけクリアのしるし。"
    }
  };

  window.COMPANIONS = {
    sky_friend: {
      id: "sky_friend",
      theme: "sky",
      name: "くもよみフクロウ",
      desc: "空のようすを見て、ぼうけんを助ける。",
      effect: { expRate: 0.05 }
    },
    plant_friend: {
      id: "plant_friend",
      theme: "plant",
      name: "メバエスプラウト",
      desc: "こつこつ育つ力で、少しだけ経験値がふえる。",
      effect: { expRate: 0.05 }
    },
    life_friend: {
      id: "life_friend",
      theme: "life",
      name: "タマゴリュウ",
      desc: "バトル開始時にヒントを1回くれる。",
      effect: { freeHint: 1 }
    },
    water_friend: {
      id: "water_friend",
      theme: "water",
      name: "ゴロタワニ",
      desc: "ながれる水の力で、ライフが少しふえる。",
      effect: { hpUp: 1 }
    },
    solution_friend: {
      id: "solution_friend",
      theme: "solution",
      name: "ビーカーはかせ",
      desc: "実験の手じゅんを思い出させ、ヒントを1回くれる。",
      effect: { freeHint: 1 }
    },
    electric_friend: {
      id: "electric_friend",
      theme: "electric",
      name: "ビリリス",
      desc: "正かいの勢いを少し強くする。",
      effect: { critUp: 0.05 }
    },
    physics_friend: {
      id: "physics_friend",
      theme: "physics",
      name: "フリコウモリ",
      desc: "リズムよく答えると経験値が少しふえる。",
      effect: { expRate: 0.05 }
    },
    fire_friend: {
      id: "fire_friend",
      theme: "fire",
      name: "ホノオスライム",
      desc: "あきらめない火で、ライフが少しふえる。",
      effect: { hpUp: 1 }
    },
    body_friend: {
      id: "body_friend",
      theme: "body",
      name: "ケツエキスライム",
      desc: "からだのすみずみへ元気を運ぶ。",
      effect: { hpUp: 1 }
    },
    space_friend: {
      id: "space_friend",
      theme: "space",
      name: "ツキウサギュラ",
      desc: "夜空からヒントを1回くれる。",
      effect: { freeHint: 1 }
    },
    earth_friend: {
      id: "earth_friend",
      theme: "earth",
      name: "チソウゴーレム",
      desc: "しっかりした足場で、まちがいを1回耐える。",
      effect: { block: 1 }
    },
    chem_friend: {
      id: "chem_friend",
      theme: "chem",
      name: "リトマスバット",
      desc: "答えを見分ける助けをする。",
      effect: { freeHint: 1 }
    },
    eco_friend: {
      id: "eco_friend",
      theme: "eco",
      name: "ジュンカンスライム",
      desc: "学びをめぐらせて経験値が少しふえる。",
      effect: { expRate: 0.05 }
    }
  };
})();
