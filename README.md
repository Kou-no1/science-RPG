# リカ・クエスト（仮）

小学5・6年理科の単元を、ドラゴンRPG風の洞窟・城クエストで復習する静的学習ポータルです。東京書籍「新編 新しい理科」（5年・6年／令和6年度版）の単元名・小単元名・指導要領コードを正典データとして持ちます。

## 起動方法

ビルドは不要です。

```bash
cd rika-quest
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。ES Modulesや外部CDNを使っていないため、可能な範囲で `index.html` の直開きでも動く構成です。

## できること

- 5年10単元、6年11単元の全21単元をワールドマップに表示
- 洞窟＝基本問題、城＝ボス問題、おまけ＝中学チャレンジ／科学トリビア
- `localStorage` に自動保存
- 経験値、レベル、アイテム、仲間、モンスター図鑑、4スロット装備
- 5年10単元と6年11単元は各 `basic` 20問、`boss` 10問、`bonus` 15問を実装済み
- ボス全問正解で通常装備、🎓中学チャレンジ全問正解で★レア装備を入手

## セーブデータ

保存キーは `rika_quest_save_v1` です。設定画面の「最初からやり直す」でリセットできます。保存データは次のまとまりを持ちます。

- `player`: 名前、レベル、経験値、基礎ライフ、装備中ID
- `owned`: 所持装備、アイテム、仲間、モンスター図鑑
- `progress`: 単元ごとの解放、基本クリア、ボスクリア、ボス全問正解、おまけ解放、🎓全問正解
- `settings`: ルビ、音

## 問題を追加する方法

`data/questions/{unitId}.js` または `data/questions/{unitId}_*.js` に、次の形で問題を追加します。

```js
window.QUESTION_BANK["g5_u07"] = {
  basic: [],
  boss: [],
  bonus: []
};
```

1問のスキーマは `data/questions/_template.js` を参照してください。4択は `type: "mc4"`、○×は `type: "ox"` とし、`answer` は `choices` のindexです。

## 範囲ルール

- `basic` と `boss` は、その単元の小単元名と `curriculumRef` の範囲内に収めます。
- 迷った内容は出さず、易しい側へ寄せます。
- 中学用語、範囲外概念、発展トリビアは `bonus` だけに入れます。
- `bonus` は画面でも「中学チャレンジ／科学トリビア」として、本筋のクリア判定・通常装備ドロップから分けています。全問正解時だけ★レア装備を付与します。
- 教科書本文・図版・写真・イラストは転載しません。設問と解説はオリジナルで作成します。

## モンスター・装備の追加

- モンスター定義: `data/monsters-data.js`
- SVG描画関数: `js/monsters.js`
- 装備定義: `data/equipment-data.js`

通常装備は `rarity: "normal"` または省略、★レア装備は `rarity: "rare"` と `unitId` を持たせます。レア効果は `doubleCrit`, `reviveOnce`, `comboKeep`, `hintFree`, `expBoostBig` などを使えます。

テーマキーは `sky`, `plant`, `life`, `water`, `solution`, `electric`, `physics`, `fire`, `body`, `space`, `earth`, `chem`, `eco` です。画像・外部フォント・音源は使わず、初期素材はインラインSVGとWebAudioのみで構成します。
