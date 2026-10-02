const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({window:{}});
for (const file of ['data/readings.js','data/curriculum.js','data/curriculum-grades34.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const w = ctx.window;
const corrections = require('./content-corrections.cjs');
const everyday = require('./content-everyday.cjs');
const dedicatedBonus = require('./content-bonus34.cjs');
const content = {...require('./content-grades3.cjs'),...require('./content-grades4.cjs'),...require('./content-chapters.cjs')};
const sources = {};
const subMatchers = {
 g5_u01:[[2,/西|東|予想|予報|画像|アメダス|衛星/]], g5_u02:[[3,/成長|苗|肥料あり/],[2,/子葉|でんぷん|ヨウ素/]],
 g5_u04:[[2,/受粉|花粉を|実が|袋|ふくろ/]],g5_u05:[[2,/災害|避難|洪水|土砂|高潮|備え|増水/]],
 g5_u06:[[4,/災害|避難|堤防|ダム|備え/],[3,/水の量|水量|大雨|増水/],[1,/石|上流|下流/],[2,/しん食|運ぱん|たい積|曲が/]],
 g5_u07:[[3,/ろ過|ろ紙|ろうと|ガラス棒|蒸発|冷や|結晶|とり出|取り出/],[2,/量|温度|限り|種類|増や/]],
 g5_u09:[[2,/強さ|強く|巻き数|電流の大きさ|クリップ/]],g6_u01:[[2,/割合|石灰水|検知管|成分|減|増/]],
 g6_u02:[[4,/じん臓|かん臓|位置/],[3,/血液|心臓|心ぞう|脈|はく動/],[2,/呼吸|肺|空気|酸素/]],
 g6_u03:[[2,/でんぷん|日光|ヨウ素/]],g6_u04:[[2,/酸素|二酸化炭素|呼吸|空気/],[3,/水/]],
 g6_u06:[[2,/でき方|積も|運ば|火山|水そう/]],g6_u07:[[2,/避難|災害|安全|備え|情報|ハザード/]],
 g6_u08:[[3,/道具|はさみ|せんぬき|くぎぬき|ピンセット/],[2,/つり合|目もり|重さ.*距離/]],
 g6_u09:[[4,/プログラム|センサー|自動/],[3,/効率|少ない|有効|LED.*比|省エネ/],[2,/ため|コンデンサー|光・音|熱|モーター|電熱/]],
 g6_u10:[[3,/金属|金ぞく|アルミニウム|鉄を|あわ|換気|保護/],[2,/性|リトマス|BTB|キャベツ/]],g6_u11:[[2,/守|減ら|リサイクル|再生|持続|取り組|取組/]]
};
const plain = text => text.replace(/\{([^|{}]+)\|[^{}]+\}/g,'$1');
function finishQuestion(u,tier,q,index) {
 const result = {...q,id:q.id || u.unitId.replaceAll('_','') + '-' + (tier==='basic'?'b':tier) + '-' + String(index+1).padStart(3,'0'),tier};
 const text = plain(result.stem + result.explanation);
 const selected = (subMatchers[u.unitId] || []).find(([,pattern])=>pattern.test(text));
 const sub = u.sub.find(s=>s.no===(q.sub || (selected && selected[0]) || 1)) || u.sub[0];
 result.subId = tier === 'bonus' && result.sourceQuestionId && result.subId ? result.subId : sub.subId;
 result.curriculumRef = result.curriculumRef || sub.ref;
 result.context = result.context || 'standard';
 result.targetStage = result.targetStage || (tier==='bonus' ? 'middle' : 'elementary'+u.grade);
 result.contentVersion = result.contentVersion || 1;
 if (tier==='bonus') result.bonusCategory = result.bonusCategory || (result.stem.startsWith('💡')?'trivia':'middle');
 ['stem','explanation'].forEach(key=>result[key]=w.RikaReadings.annotate(result[key]));
 result.choices = result.choices.map(s=>w.RikaReadings.annotate(s));
 delete result.sub;
 return result;
}
function writeBank(u,bank,file) {
 for(const tier of ['basic','boss','bonus']) bank[tier]=bank[tier].map((q,i)=>finishQuestion(u,tier,q,i));
 fs.writeFileSync(path.join(root,'data/questions',file),'/* Original Rika Quest questions. Generated from tools/content-*.cjs. */\nwindow.QUESTION_BANK = window.QUESTION_BANK || {};\nwindow.QUESTION_BANK['+JSON.stringify(u.unitId)+'] = '+JSON.stringify(bank,null,2)+';\n');
 w.QUESTION_BANK[u.unitId]=bank;
 console.log(u.unitId+': '+['basic','boss','bonus'].map(t=>bank[t].length).join('/'));
}
w.QUESTION_BANK = {};
for(const file of fs.readdirSync(path.join(root,'data/questions')).filter(f=>/^g[56]_/.test(f))) {
 vm.runInContext(fs.readFileSync(path.join(root,'data/questions',file),'utf8'),ctx);
 sources[file.startsWith('g5_u07')?'g5_u07':file.slice(0,6)]=file;
}
for(const u of w.CURRICULUM.filter(u=>u.grade>=5)) {
 const bank=w.QUESTION_BANK[u.unitId];
 for(const tier of ['basic','boss','bonus']) for(const q of bank[tier]) {
  if(corrections[q.id]) Object.assign(q,corrections[q.id],{contentVersion:2});
  if(tier==='bonus' && /pH/.test(q.stem+q.explanation)) q.explanation=q.explanation.replace(/酸性・アルカリ性の強さ/g,'水溶液の酸性・アルカリ性の程度').replace(/酸性やアルカリ性の強さ/g,'水溶液の酸性やアルカリ性の程度');
 }
 // Re-running is idempotent: appended IDs are stable, never duplicate a bank.
 everyday[u.unitId].forEach((q,i)=>{
  const tier=i<3?'basic':'boss', number=i<3?21+i:11+i-3;
  const id=u.unitId.replace('_','')+'-'+(tier==='basic'?'b':'boss')+'-'+String(number).padStart(3,'0');
  const row={...q,id}; const old=bank[tier].findIndex(x=>x.id===id);
  if(old<0)bank[tier].push(row);else bank[tier][old]=row;
 });
 writeBank(u,bank,sources[u.unitId]);
}
for(const u of w.CURRICULUM.filter(u=>u.grade<5)) {
 const rows=content[u.unitId];
 if(!rows)throw new Error('Missing authored unit '+u.unitId);
 const mc=(row,stem,context)=>({type:'mc4',skill:/道具|手順|使う|記録|そろえる|比べるとき|はかる|安全|世話/.test(stem)?'experiment':/何という|名前|部分は|すがたは/.test(stem)?'term':'concept',stem,choices:row.choices,answer:0,explanation:row.why,sub:row.sub,context:context||'standard'});
 const basic=rows.map(row=>mc(row,row.ask));
 const oxCount=u.kind==='chapter'?5:7;
 rows.slice(0,oxCount).forEach((row,i)=>basic.push({type:'ox',skill:'concept',stem:i%2?row.why:row.falseStatement,choices:['○','×'],answer:i%2?0:1,explanation:row.why,sub:row.sub}));
 if(u.kind!=='chapter') {
  const target=u.title;
  basic.push(
   {type:'mc4',skill:'experiment',stem:target+'を調べた二つの記録を比べたい。あとで同じ対象かわかるように残すものは？',choices:['調べた物と場所の名前','数字だけで名前は不要','絵だけで日付は不要','調べなかった別の物の名前'],answer:0,explanation:'何を、どこで調べた記録かも残すと、別の対象を取りちがえず比べられるよ。',context:'everyday'},
   {type:'mc4',skill:'experiment',stem:target+'の観察で、見えなかった部分があった。記録のしかたは？',choices:['見えたことと、まだわからないことを分ける','想像を見た事実として書く','記録を全て捨てる','友だちの記録を自分の結果とする'],answer:0,explanation:'見えたことを記録し、わからない部分は次に確かめよう。',context:'everyday'},
   {type:'mc4',skill:'experiment',stem:target+'を調べた数字をノートに書く。数字に添えると必要なことは？',choices:['何の数字かと、cmなどの単位','数字だけで十分','好きな色だけ','別の実験の数字だけ'],answer:0,explanation:'何をはかった数字かを書き、長さならcm、温度なら℃など、単位も書こう。',context:'everyday'}
  );
 }
 const boss=rows.map(row=>mc(row,row.apply,'everyday'));
 writeBank(u,{basic,boss,bonus:[]},u.file);
}
// Extension questions are deliberately shared learning steps, not falsely
// claimed to be new facts. Their source IDs and actual destination grade remain.
const links={g3_u01:'g4_u01',g3_u02:'g5_u02',g3_u03:'g5_u03',g3_u04:'g4_u08',g3_u05:'g6_u04',g3_u06:'g4_u06',g3_u07:'g6_u05',g3_u08:'g5_u10',g3_u09:'g6_u08',g3_u10:'g4_u04',g3_u11:'g5_u09',g4_u01:'g6_u04',g4_u02:'g6_u02',g4_u03:'g5_u01',g4_u04:'g5_u09',g4_u05:'g5_u06',g4_u06:'g6_u05',g4_u07:'g5_u07',g4_u08:'g5_u10',g4_u09:'g5_u07',g4_u10:'g6_u09',g4_u11:'g5_u07',g4_u12:'g6_u11'};
for(const u of w.CURRICULUM.filter(u=>u.grade<5&&u.kind!=='chapter')) {
 const destination=w.CURRICULUM.find(x=>x.unitId===links[u.unitId]);
 const bank=w.QUESTION_BANK[u.unitId], next=w.QUESTION_BANK[destination.unitId];
 // Ten elementary next steps, then five explicitly labelled middle/trivia steps.
 const middleSource=destination.grade>=5?next:w.QUESTION_BANK[destination.theme==='space'?'g6_u05':destination.theme==='electric'?'g5_u09':destination.theme==='physics'?'g5_u10':'g5_u02'];
 bank.bonus=dedicatedBonus[u.unitId] || next.basic.slice(0,10).map(q=>({...q,id:undefined,tier:'bonus',stem:'🎓 '+destination.grade+'年につながる問題。'+q.stem,explanation:destination.grade+'年で学ぶよ。'+q.explanation,targetStage:'elementary'+destination.grade,bonusCategory:'next_grade',sourceQuestionId:q.id,prerequisiteIds:[q.id]})).concat(middleSource.bonus.slice(0,5).map(q=>({...q,id:undefined,tier:'bonus',sourceQuestionId:q.id,prerequisiteIds:[q.id]})));
 writeBank(u,bank,u.file);
}
