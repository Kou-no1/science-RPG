/* Unit titles and scope: Tokyo Shoseki 2024 annual plans; original game data. */
(function () {
  var rows = [
    [3,1,"spring","春の生き物","eco","B(1)ア(ｱ),イ",["生き物を見つけよう","生き物のすがたをくらべよう"]],
    [3,2,"sowing","たねまき","plant","B(1)ア(ｳ),イ",["たねをまこう","芽が出るようすをしらべよう"]],
    [3,3,"butterfly","チョウのかんさつ","life","B(1)ア(ｲ),イ",["チョウの育ち方","チョウのからだのつくり"]],
    [3,4,"wind_rubber","風やゴムのはたらき","physics","A(2)ア(ｱ)(ｲ),イ",["風のはたらき","ゴムのはたらき"]],
    [3,5,"insects","こん虫のかんさつ","life","B(1)ア(ｱ)(ｲ),イ",["こん虫のすみか","こん虫のからだと育ち方"]],
    [3,6,"sun_shadow","太陽とかげ","sky","B(2)ア(ｱ)(ｲ),イ",["太陽とかげの向き","日なたと日かげ"]],
    [3,7,"light","太陽の光","light","A(3)ア(ｱ)(ｲ),イ",["光の進み方","光を集めたとき"]],
    [3,8,"sound","音のせいしつ","sound","A(3)ア(ｳ),イ",["音とふるえ","音の伝わり方"]],
    [3,9,"weight","物の重さ","physics","A(1)ア(ｱ)(ｲ),イ",["形と重さ","同じ体積の物の重さ"]],
    [3,10,"circuits","電気の通り道","electric","A(5)ア(ｱ)(ｲ),イ",["明かりがつくつなぎ方","電気を通す物"]],
    [3,11,"magnets","じしゃくのせいしつ","electric","A(4)ア(ｱ)(ｲ),イ",["じしゃくにつく物","じしゃくの極"]],
    [4,1,"spring","あたたかくなると","eco","B(2)ア(ｱ)(ｲ),イ",["春の植物","春の動物"]],
    [4,2,"movement","動物のからだのつくりと運動","body","B(1)ア(ｱ)(ｲ),イ",["ほねと関節","きん肉のはたらき"]],
    [4,3,"temperature","天気と気温","sky","B(4)ア(ｱ),イ",["気温のはかり方","天気と気温の変化"]],
    [4,4,"current","電流のはたらき","electric","A(3)ア(ｱ),イ",["電流の向き","かん電池のつなぎ方"]],
    [4,5,"rain_ground","雨水のゆくえと地面のようす","water","B(3)ア(ｱ)(ｲ),イ",["雨水の流れ方","水のしみこみ方"]],
    [4,6,"moon_stars","月や星の見え方","space","B(5)ア(ｱ)(ｳ),イ",["月の位置","星の位置とならび方"]],
    [4,7,"water_nature","自然のなかの水のすがた","water","B(4)ア(ｲ),イ",["水の蒸発","空気中の水"]],
    [4,8,"air_water","とじこめた空気と水","physics","A(1)ア(ｱ)(ｲ),イ",["とじこめた空気","とじこめた水"]],
    [4,9,"volume_heat","物の体積と温度","heat","A(2)ア(ｱ),イ",["空気の体積と温度","水や金ぞくの体積と温度"]],
    [4,10,"warming","物のあたたまり方","heat","A(2)ア(ｲ),イ",["金ぞくのあたたまり方","水と空気のあたたまり方"]],
    [4,11,"water_temperature","水のすがたと温度","water","A(2)ア(ｳ),イ",["水を熱したとき","水を冷やしたとき"]],
    [4,12,"year_review","生き物の1年をふり返って","eco","B(2)ア(ｱ)(ｲ),イ",["植物の1年","動物の1年"]]
  ];
  rows.forEach(function (row) {
    var id = "g" + row[0] + "_u" + String(row[1]).padStart(2, "0");
    window.CURRICULUM.push({ grade: row[0], unitNo: row[1], unitId: id, file: id + "_" + row[2] + ".js", title: row[3], theme: row[4], kind: "unit", order: row[1], nodeType: "cave_castle", sub: row[6].map(function (title, i) { return { no: i + 1, subId: id + "_s" + (i + 1), title: title, ref: row[5] }; }) });
  });
  var chapters = [
    [3,"growth","どれぐらい育ったかな","plant",2.2,"g3_u02","B(1)ア(ｳ),イ"],
    [3,"flowering","花がさいたよ","plant",5.2,"g3_growth","B(1)ア(ｳ),イ"],
    [3,"fruiting","実ができたよ","plant",8.2,"g3_flowering","B(1)ア(ｳ),イ"],
    [4,"summer_life","暑くなると","eco",4.2,"g4_u01","B(2)ア(ｱ)(ｲ),イ"],
    [4,"summer_stars","夏の星","space",5.2,"g4_u01","B(5)ア(ｲ),イ"],
    [4,"autumn_life","すずしくなると","eco",8.2,"g4_summer_life","B(2)ア(ｱ)(ｲ),イ"],
    [4,"winter_stars","冬の星","space",11.2,"g4_u06","B(5)ア(ｲ)(ｳ),イ"],
    [4,"winter_life","寒くなると","eco",11.4,"g4_autumn_life","B(2)ア(ｱ)(ｲ),イ"]
  ];
  chapters.forEach(function (row) {
    var id = "g" + row[0] + "_" + row[1];
    window.CURRICULUM.push({ grade: row[0], unitNo: 0, unitId: id, file: id + ".js", title: row[2], theme: row[3], kind: "chapter", order: row[4], unlockAfter: [row[5]], nodeType: "cave_castle", sub: [{ no: 1, subId: id + "_s1", title: row[2], ref: row[6] }] });
  });
  window.CURRICULUM.forEach(function (u) { u.kind = u.kind || "unit"; u.order = u.order || u.unitNo; });
  window.CURRICULUM.sort(function (a, b) { return a.grade - b.grade || a.order - b.order; });
})();
