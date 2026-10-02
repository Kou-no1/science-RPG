# リカ・クエスト（仮）

小学3・4・5・6年の理科を、洞窟・城・ドラゴンの冒険で学ぶ静的ポータルです。東京書籍「新編 新しい理科」令和6年度版の単元構成と、学習指導要領の範囲を基準にしています。教科書本文・写真・図版は使用していません。非公式のオリジナル教材であり、出版社による認定や全問の最終査読を受けたものではありません。

## 起動

ビルド・インストール・ログインは不要です。このリポジトリのルートで実行します。

```bash
python3 -m http.server 8000
```

`http://localhost:8000/` を開いてください。通常のscriptタグでデータを読み込むため、Chromeで `index.html` の直開きも検証済みです。保存はブラウザ・URLごとに異なります。file直開きからサーバーへ変えるときは設定の書き出し・読み込みを使ってください。

アプリの外部依存はゼロです。HTML/CSS/Vanilla JS、インラインSVG、localStorage、任意のWebAudioのみを使います。開発用NodeやPlaywrightは、子どもが遊ぶ際には不要です。

## 収録範囲

| 学年 | 番号付き単元 | 観察章 | 番号付き単元の問題数（基本 / ボス / おまけ） |
| --- | ---: | ---: | --- |
| 3年 | 11 | 植物の成長・花・実の3章 | 20 / 10 / 15 |
| 4年 | 12 | 夏・秋・冬の生き物、夏・冬の星の5章 | 20 / 10 / 15 |
| 5年 | 10 | 0 | 23 / 12 / 15 |
| 6年 | 11 | 0 | 23 / 12 / 15 |

全44単元と8観察章、計2,205件の問題レコードです。観察章は基本10・ボス5・おまけなし。5・6年の既存945件のIDを保持し、各単元に生活・資料読み取り問題を基本3件、ボス2件追加しています。

3・4年のおまけは、上の学年の学習につながる共有問題と、中学・トリビアを分離しています。共有した問題には `sourceQuestionId` と実際の到達学年を記録しています。全レコードが相互に異なる新作問題という意味ではありません。「音」「とじこめた空気と水」には、振動・圧力・身近な利用の専用おまけ15問を用意しています。

3・4年の番号付き単元・章の構成は[東京書籍3年年間計画](https://ten.tokyo-shoseki.co.jp/text/shou/rika/data/rika_nenkankeikaku_3_n.pdf)と[4年年間計画](https://ten.tokyo-shoseki.co.jp/text/shou/rika/data/rika_nenkankeikaku_4.pdf)、範囲は[文部科学省の理科解説](https://www.mext.go.jp/content/20211020-mxt_kyoiku02-100002607_05.pdf)を参照しています。3・4年の小単元ラベルはゲーム用に整理したもので、教科書の見出しの完全な複製ではありません。

## 出題と報酬

- 洞窟は全問コースが標準。短く5問・10問も選べます。短いコースは保存した抽選袋で、全件を使い切るまで重複しません。最後は残った問題数になります。
- 学び直しモードはライフを減らさず、間違えた問題を最後に再出題します。全件を経験して正解を確認すると洞窟クリア。RPG挑戦はライフを使い、コースの初回正解率80%以上で勝利します。洞窟の進行解放にはバンク全件の経験と、異なる問題の80%以上の正解記録も必要です。
- 基本は5問ごとに敵が変わります。単元の出現表を未遭遇優先・重複なしで抽選。「物のとけ方」はソルティン、ミョウバルー、トケルン、ロカガエル、ジョーハツバットの全5体に出会えます。図鑑から対象の敵を指定した探索もできます。
- 城は小単元ごとに偏りを抑えて10問抽出（観察章は5問）。全問正解のたびに未入手の通常装備を1点もらえ、テーマの4種をそろえられます。
- おまけは基本クリア後に解放。15問すべての初回回答が正解なら単元専用★レアを取得します。盾でミスを防いでもノーミスにはなりません。会心・復活・コンボは正解数を増やしません。
- 途中の問題順・選択肢・回答済み解説を保存し、ホームから再開できます。問題の内容版が変わった場合は途中セッションのみ取り消し、学習記録を残します。
- 研究ノートには各難度の解答履歴・誤答・ヒントが記録されます。ノートの学び直しは報酬なし。仲間は2体まで選んで効果を適用します。
- 4択は毎回正解位置も一緒に並べ替えます。回答後は✓/✗と必ず解説を表示。ルビ・音・動きを設定で切り替えられます。

## セーブ

キーは既存の `rika_quest_save_v1` を維持し、内部スキーマを `2` に更新しています。旧schema 1の進捗・装備・名前・消費済みアイテムを引き継ぎます。

- `player` / `owned`: 経験値、装備、アイテム、仲間、遭遇・討伐図鑑
- `progress`: 解放、クリア、全問正解、`bonusPerfected`、履修・正解済み問題ID
- `questionStats`: 解答・誤答・ヒント・再確認の数、直近の正誤、内容版
- `encounterBags` / `questionBags`: 未抽選の敵・問題ID
- `activeSession`: 途中のバトル、出題・選択肢の順序、ライフ
- `activeCompanions` / `rewardedSessions`: 選択した仲間、重複報酬防止のセッションID
- `settings`: ルビ、音、動き、最後に選んだ学年

設定画面でJSONを書き出し・読み込みできます。読み込みには確認があります。壊れたデータや未知のスキーマは勝手に削除・上書きせず、元のデータを書き出せる状態にします。保存容量などのエラーは警告を出します。「最初からやり直す」は確認後に1つのセーブを初期化します。

## 問題の追加

通常の問題ファイルは `window.QUESTION_BANK[unitId] = { basic:[], boss:[], bonus:[] }` を登録します。基本スキーマは `data/questions/_template.js` を参照してください。

```js
{
  id: "g5u07-b-024", tier: "basic", type: "mc4", skill: "experiment",
  stem: "水の体積をはかる{器具|きぐ}は？",
  choices: ["メスシリンダー", "温度計", "ものさし", "時計"],
  answer: 0, explanation: "メスシリンダーで水の体積をはかるよ。",
  subId: "g5_u07_s1", curriculumRef: "A(1)イ",
  targetStage: "elementary5", contentVersion: 1, context: "standard"
}
```

`mc4`は選択肢4件、`ox`は `['○','×']`。正解indexは元データの位置です。`{漢字|よみ}`でルビを指定し、補助辞書は `data/readings.js`。内容を修正したら `contentVersion` を増やします。架空の表データは `diagramKey:'table'` と `diagramData:{headers,rows,fictional:true}`、器具図は `js/diagrams.js` に追加できます。

生成・編集元は次のとおりです。生成物だけを編集すると、再生成時に戻る箇所があります。

- 3・4年: `tools/content-grades3.cjs` / `content-grades4.cjs` / `content-chapters.cjs`
- 専用先取り: `tools/content-bonus34.cjs`
- 既存問題の科学的修正: `tools/content-corrections.cjs`
- 5・6年の生活問題: `tools/content-everyday.cjs`
- その他の5・6年問題: 既存の `data/questions/g5_*` / `g6_*` を編集（既存IDを変えない）

```bash
node tools/generate_grades34.cjs
node tests/regression.cjs
```

再生成では固定IDで更新するので問題を二重追加しません。新ファイルは `index.html` のscriptへ登録してください。ボス空配列は準備中として扱います。

## 範囲と安全

基本・ボスは、その学年・単元の範囲だけで作ります。中学用語や次の学年の概念はおまけに隔離し、`targetStage` / `bonusCategory` を表示します。特に3年の発芽条件・受粉、4年の満ち欠けの理由、6年の光合成用語・気孔・pH・中和・イオン・プレート等を本筋に混ぜません。

火・薬品・電池・太陽・夜間・水辺は安全な観察を前提にし、大人や先生の指示なしで危険な実験を促しません。全問の授業難度や誤答の妥当性を保証する最終教材査読は別途必要です。

## キャラクターと装備

既存定義は `data/monsters-data.js` / `equipment-data.js` / `companions.js`、3・4年と単元別出現表は `data/grades34-content.js` にあります。描画は `js/monsters.js` / `svg.js` のSVG文字列を返す関数です。

テーマは `sky, plant, life, water, solution, electric, physics, fire, body, space, earth, chem, eco, light, sound, heat`。通常装備は4スロット。レアには `rarity:'rare'` と `unitId` を指定します。効果は `critUp, block, hpUp, comboUp, doubleCrit, reviveOnce, comboKeep, hintFree, expBoostBig` を使用できます。

## 検証

`node tests/regression.cjs` はNode標準機能だけで、全52経路、問題スキーマ・範囲ガード、全出現候補、装備効果、通常4種再取得、レア条件、セーブ移行・破損・消費・途中再開を検証します。GitHub Actionsでも実行します。

`node tests/browser.cjs` は開発時のみPlaywrightとChromiumを使用します。`PLAYWRIGHT_CHROMIUM_EXECUTABLE`で実行ファイルを指定できます。Windowsの既定はインストール済みChromeです。ローカルサーバーをテスト内で起動・終了し、1280/768/390px幅、モンスターのSVGピクセル、回答後リロード、装備報酬、ルビ、file直開き、外部通信なしを検証します。スクリーンショットはOSの一時フォルダ（`RIKA_SCREENSHOT_DIR`で変更可）へ保存します。

将来の基本40・ボス20への増補、図で答える問題の拡充などは [拡張設計書](docs/grades3-6-design.md) に分けて記載しています。
