(function () {
  var profiles = [
    ["g3_u01",["ハルメバエ","ハナミツビー","クサムラスライム"],"ハルノモリドラゴン","春風のこて★","gauntlet"],
    ["g3_u02",["タネコロ","メバエスライム","ネッコモグラ"],"メバエドラゴン","芽ばえのよろい★","armor"],
    ["g3_u03",["タマゴコロ","アオムシン","サナギン"],"チョウノハネリュウ","ちょうの光のつるぎ★","sword"],
    ["g3_u04",["カゼコロ","ゴムピョン","クルマスライム"],"カゼゴムドラゴン","風ゴムのこて★","gauntlet"],
    ["g3_u05",["ムシミツケ","バッタピョン","トンボルン"],"コンチュウドラゴン","六つの足のたて★","shield"],
    ["g3_u06",["カゲコロ","ヒナタネコ","ヒカゲモグラ"],"カゲノミチリュウ","ひかげのまもりのたて★","shield"],
    ["g3_u07",["カガミン","ヒカリスライム","レンズン"],"ヒカリドラゴン","日光の光のつるぎ★","sword"],
    ["g3_u08",["フルエン","オトコロ","イトデンワン"],"オトノヒビキリュウ","ひびきのこて★","gauntlet"],
    ["g3_u09",["ネンドン","オモサスライム","ハカリン"],"オモサゴーレム","はかりのよろい★","armor"],
    ["g3_u10",["デンチン","マメデン","ドウセンヘビ"],"アカリドラゴン","明かりのこて★","gauntlet"],
    ["g3_u11",["ジシャコロ","テツクリップン","キョクン"],"ジシャリュウ","じしゃくのたて★","shield"],
    ["g4_u01",["ハルノメ","キオンコロ","カンサツビー"],"キセツドラゴン","春のかんさつのこて★","gauntlet"],
    ["g4_u02",["ホネコロ","キンニクン","カンセツン"],"ウゴクカラダリュウ","かんせつのよろい★","armor"],
    ["g4_u03",["キオンスライム","ハレクモ","オンケイン"],"キオンノソラリュウ","気温の風のこて★","gauntlet"],
    ["g4_u04",["デンリュン","モータン","ツナギン"],"カイテンドラゴン","回転のつるぎ★","sword"],
    ["g4_u05",["アメミズン","スナツブン","シミコムモグラ"],"アメノミチリュウ","雨水のまもりのたて★","shield"],
    ["g4_u06",["ツキコロ","ホシキラ","ナラビウサ"],"ホシノミチドラゴン","星の地図のこて★","gauntlet"],
    ["g4_u07",["ジョーハツン","ミズテキン","クウキミズ"],"ミズノメグリリュウ","水のめぐりのよろい★","armor"],
    ["g4_u08",["クウキプニ","ミズプニ","オシカエシン"],"クウキミズゴーレム","おし返すたて★","shield"],
    ["g4_u09",["フクラムン","チヂムン","キンゾクコロ"],"タイセキドラゴン","ふくらむ光のつるぎ★","sword"],
    ["g4_u10",["アタタマルン","ミズウゴキ","クウキウゴキ"],"アタタマリドラゴン","あたたかさのよろい★","armor"],
    ["g4_u11",["コオリコロ","ユゲフワ","ミズスライム"],"ミズノスガタリュウ","氷と水のつるぎ★","sword"],
    ["g4_u12",["シキメバエ","キセツバチ","キロクフクロウ"],"シキノモリドラゴン","四季のまもりのよろい★","armor"]
  ];
  ["light","sound","heat"].forEach(function (theme, i) {
    var names = [["光のつるぎ","鏡のたて","日光のよろい","レンズのこて"],["音のつるぎ","ひびきのたて","楽器のよろい","ふるえのこて"],["あたたかさのつるぎ","温度のたて","ぬくもりのよろい","金ぞくのこて"]][i];
    ["sword","shield","armor","gauntlet"].forEach(function (slot, n) {
      var id = theme + "_" + slot;
      window.EQUIPMENT[id] = {id:id,theme:theme,slot:slot,rarity:"normal",name:names[n],desc:["かいしんが出やすくなる。","まちがいを1回までふせぐ。","ライフが1ふえる。","3コンボのEXPがふえる。"][n],effect:[{critUp:.15},{block:1},{hpUp:1},{comboUp:1}][n]};
    });
    var id = theme + "_friend";
    window.COMPANIONS[id] = {id:id,theme:theme,name:["ひかりはかせ","おとがくたい","ぬくもりはかせ"][i],desc:"バトルのはじめにヒントが1回ふえる。",effect:{freeHint:1}};
  });
  profiles.forEach(function (row) {
    var u = window.CURRICULUM.find(function (x) { return x.unitId === row[0]; });
    u.encounters = row[1].map(function (name, i) {
      var id = u.unitId + "_enemy" + (i + 1);
      window.MONSTERS[id] = {id:id,unitId:u.unitId,name:name,theme:u.theme,role:"zako",flavor:u.title + "のひみつをさがす、かんさつ好きのなかまだよ。",svg:i === 2 ? "makeGenericBeast" : "makeGenericSlime"};
      return id;
    });
    u.bossId = u.unitId + "_boss";
    window.MONSTERS[u.bossId] = {id:u.bossId,unitId:u.unitId,name:row[2],theme:u.theme,role:"boss",flavor:"じっけんの記録をあつめる、やさしいドラゴン。",svg:"makeGenericDragon"};
    var id = u.unitId + "_rare";
    var effect = {sword:{critUp:.3,doubleCrit:1},shield:{block:2},armor:{hpUp:2,reviveOnce:1},gauntlet:{comboUp:2,comboKeep:1}}[row[4]];
    if (["g3_u04","g3_u10","g4_u01","g4_u06"].includes(u.unitId)) effect = {comboUp:2,hintFree:1};
    if (["g3_u09","g4_u10"].includes(u.unitId)) effect = {hpUp:2,hintFree:1};
    window.EQUIPMENT[id] = {id:id,unitId:u.unitId,theme:u.theme,slot:row[4],rarity:"rare",name:row[3],desc:{sword:"かいしんで2ダメージ！",shield:"まちがいを2回までふせぐ。",armor:"ライフが2ふえる。ふっかつ、または無料ヒントつき。",gauntlet:"コンボのEXPがふえる。コンボのまもり、または無料ヒントつき。"}[row[4]],effect:effect};
  });
  window.CURRICULUM.forEach(function (u) {
    if (u.kind === "chapter") {
      var parent = window.CURRICULUM.find(function (x) { return x.unitId === u.unlockAfter[0]; });
      u.encounters = parent.encounters;
      u.bossId = parent.bossId;
    } else if (!u.encounters) {
      u.encounters = Object.keys(window.MONSTERS).filter(function (id) { return window.MONSTERS[id].theme === u.theme && window.MONSTERS[id].role === "zako" && !window.MONSTERS[id].unitId; });
      u.bossId = Object.keys(window.MONSTERS).find(function (id) { return window.MONSTERS[id].theme === u.theme && window.MONSTERS[id].role === "boss" && !window.MONSTERS[id].unitId; });
    }
    if (u.kind !== "chapter") {
      var boss = window.MONSTERS[u.bossId];
      u.legendaryId = u.unitId + "_legendary";
      window.MONSTERS[u.legendaryId] = Object.assign({},boss,{id:u.legendaryId,unitId:u.unitId,name:"きらめきの" + boss.name,variant:"legendary",flavor:"上の学年のひみつをまもる、金色のかんむりのドラゴン。"});
    }
  });
})();
