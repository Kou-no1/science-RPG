const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const key = 'rika_quest_save_v1';
function app(initial, quota = false) {
  const storage = new Map(initial ? [[key, initial]] : []);
  const node = { innerHTML:'', textContent:'', dataset:{}, className:'', classList:{add(){},remove(){},toggle(){}}, style:{setProperty(){}}, setAttribute(){},addEventListener(){},focus(){},querySelectorAll(){return [];},querySelector(){return null;} };
  const document = {body:node,activeElement:node,addEventListener(){},getElementById(id){return id === 'app' ? node : null;},querySelector(sel){return sel.startsWith('[data-result-') ? node : null;},querySelectorAll(){return [];} };
  const ctx = vm.createContext({window:{setTimeout(){}},document,localStorage:{getItem(k){return storage.get(k) || null;},setItem(k,v){if(quota)throw new Error('QuotaExceeded');storage.set(k,v);}},console});
  for (const file of scripts.filter(f => f !== 'js/main.js')) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), ctx, {filename:file});
  const w = ctx.window;
  w.RikaAudio = {ok(){},bad(){},reward(){}};
  w.RikaApp = {renderStatus(){},showMap(){},showInventory(){}};
  w.RikaState.load();
  return {w,storage,node,ctx};
}
function clear(w, unitId, tier, options = {}, mistakes = []) {
  w.RikaBattle.start(unitId,tier,{...options,replace:true});
  let count = 0;
  while(w.RikaState.get().activeSession) {
    assert.ok(++count < 200, 'battle must finish: '+unitId+'/'+tier);
    const b = w.RikaBattle.getBattle(), q = b.questions[b.index];
    const wrong = b.index < b.initialCount && mistakes.includes(b.index);
    w.RikaBattle.answer(wrong ? (q.answer + 1) % q.choices.length : q.answer);
    w.RikaBattle.advance();
  }
  return w.RikaBattle.getBattle();
}
const tests = [];
function test(name, fn) { tests.push([name,fn]); }
test('curriculum, question schema, diagrams and content boundaries', () => {
  const {w} = app(), ids = new Set();
  assert.equal(w.CURRICULUM.length,52);
  assert.equal(w.CURRICULUM.filter(u=>u.kind !== 'chapter').length,44);
  for (const u of w.CURRICULUM) {
    const bank=w.QUESTION_BANK[u.unitId];
    assert.equal(bank.basic.length,u.kind==='chapter'?10:u.grade<5?20:23);
    assert.equal(bank.boss.length,u.kind==='chapter'?5:u.grade<5?10:12);
    assert.equal(bank.bonus.length,u.kind==='chapter'?0:15);
    for (const tier of ['basic','boss','bonus']) for(const q of bank[tier]) {
      assert.ok(!ids.has(q.id),q.id); ids.add(q.id);
      assert.equal(q.tier,tier);
      assert.equal(q.choices.length,q.type==='ox'?2:4,q.id);
      assert.equal(new Set(q.choices).size,q.choices.length,q.id);
      assert.ok(Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.choices.length,q.id);
      assert.ok(q.subId && q.curriculumRef && q.explanation && q.contentVersion,q.id);
      if(tier==='bonus')assert.match(q.stem,/^[🎓💡]/u);
      if(tier!=='bonus') {
        const text=(q.stem+q.explanation+q.choices.join(' ')).replace(/\{([^|{}]+)\|[^{}]+\}/g,'$1');
        const guards={g5_u04:/花粉管|胚珠|被子植物/,g5_u07:/溶質|溶媒|飽和|再結晶|分子|原子/,g6_u03:/光合成|気孔|葉緑体|道管|師管/,g6_u05:/日食|月食|公転|自転/,g6_u10:/pH|中和|イオン|化学式/,g6_u08:/モーメント|トルク/,g6_u07:/プレート|マグニチュード/};
        if(guards[u.unitId])assert.doesNotMatch(text,guards[u.unitId],q.id);
        if(u.grade<5)assert.doesNotMatch(text,/受粉|花粉|ヨウ素|光合成|細胞|オーム|プレート|圧力|気圧|イオン/,q.id);
      }
    }
    for(const id of u.encounters)assert.match(w.RikaMonsters.render(id),/<svg/);
    if(u.kind!=='chapter') {assert.ok(w.RikaEquipment.rareForUnit(u.unitId));assert.match(w.RikaMonsters.render(u.unitId+'_legendary'),/<svg/);}
  }
  assert.equal(ids.size,2205);
});
test('legacy migration preserves progress, equipment and spent items',()=>{
  const legacy={schema:1,player:{name:'旧セーブ',exp:300,equipped:{sword:'sol_sword'}},owned:{equipment:['sol_sword'],items:{},companions:[]},progress:{g5_u07:{unlocked:true,basicCleared:true,bossCleared:true,perfected:true}},settings:{furigana:false}};
  const {w}=app(JSON.stringify(legacy)),s=w.RikaState.get();
  assert.equal(s.schema,2); assert.equal(s.player.name,'旧セーブ');assert.equal(s.player.equipped.sword,'sol_sword');
  assert.equal(s.progress.g5_u08.unlocked,true);assert.equal(Object.keys(s.owned.items).length,0);
  w.RikaState.addItem('potion',1);w.RikaState.spendItem('potion');w.RikaState.load();assert.equal(w.RikaState.get().owned.items.potion,0);
});
test('unknown save is preserved, quota errors do not crash, EXP remains finite',()=>{
  const original=JSON.stringify({schema:99,player:{}}),{w,storage}=app(original);
  assert.equal(storage.get(key),original);assert.equal(w.RikaState.exportData(),original);
  w.RikaState.reset();assert.equal(JSON.parse(storage.get(key)).schema,2);
  const full=app(null,true);assert.doesNotThrow(()=>full.w.RikaState.save());
  full.w.RikaState.addExp(Infinity);assert.ok(Number.isFinite(full.w.RikaState.get().player.exp));
});
test('every basic encounter is reachable without repeats',()=>{
  const {w}=app();
  for(const u of w.CURRICULUM) {
    const found=[];
    for(let i=0;i<u.encounters.length;i++) {const m=w.RikaMonsters.choose(u,'basic');found.push(m.id);w.RikaState.rememberMonster(m.id,false);}
    assert.equal(new Set(found).size,u.encounters.length,u.unitId);
    assert.ok(u.encounters.every(id=>found.includes(id)));
  }
  assert.equal(w.CURRICULUM.find(u=>u.unitId==='g5_u07').encounters.length,5);
});
test('choices are shuffled without mutating the bank or answer',()=>{
  const {w}=app(),q=w.QUESTION_BANK.g5_u01.basic[0],original=JSON.stringify(q),positions=new Set();
  for(let i=0;i<200;i++){const p=w.RikaBattle.prepareQuestion(q);assert.equal(p.choices[p.answer],q.choices[q.answer]);positions.add(p.answer);}
  assert.equal(positions.size,4);assert.equal(JSON.stringify(q),original);
});
test('compound ruby, malformed sessions, and import are safe',()=>{
  const {w}=app();
  assert.equal(w.RikaReadings.annotate('子{葉|は}'),'{子葉|しよう}');
  assert.equal(w.RikaReadings.annotate('体温'),'{体温|たいおん}');
  w.RikaState.get().activeSession={unit:{unitId:'g3_u01'},tier:'basic',questions:[{id:'g3u01-b-001',choices:null}],index:0};
  assert.doesNotThrow(()=>w.RikaBattle.resume());assert.equal(w.RikaState.get().activeSession,null);
  const before=w.RikaState.exportData();assert.throws(()=>w.RikaState.importData('{bad'));assert.equal(w.RikaState.exportData(),before);
  const imported=JSON.parse(before);imported.questionStats={'g3u01-b-001':{seen:'2',correct:-1,wrong:'bad'},invalid:7};
  imported.questionBags={'g3_u01:standard':['g3u01-b-001','g3u01-b-001',null]};
  w.RikaState.importData(JSON.stringify(imported));
  const stat=w.RikaState.get().questionStats['g3u01-b-001'];assert.equal(stat.seen,2);assert.equal(stat.correct,0);assert.equal(stat.wrong,0);
  assert.equal(w.RikaState.get().questionStats.invalid,undefined);assert.equal(w.RikaState.get().questionBags['g3_u01:standard'].length,1);
  w.RikaBattle.start('g3_u01','basic',{replace:true});w.RikaState.get().activeSession.sessionId='"><img src=x>';
  w.RikaBattle.resume();assert.equal(w.RikaState.get().activeSession,null);
});
test('normal and rare effects change battle mechanics without inflating correct counts',()=>{
  const {w,ctx}=app();vm.runInContext('Math.random = function () { return 0; }',ctx);
  function equip(id){w.RikaState.addEquipment(id);w.RikaState.equip(id);}
  equip('sol_sword');equip('sol_shield');equip('sol_armor');equip('sol_gauntlet');
  w.RikaBattle.start('g3_u01','basic',{replace:true,mode:'challenge'});
  let b=w.RikaBattle.getBattle();assert.equal(b.lives,4);assert.equal(b.blockLeft,1);
  for(let i=0;i<3;i++){const q=b.questions[b.index];w.RikaBattle.answer(q.answer);w.RikaBattle.advance();}
  assert.equal(b.firstCorrectCount,3);assert.equal(b.extraExp,105);
  let q=b.questions[b.index];w.RikaBattle.answer((q.answer+1)%q.choices.length);assert.equal(b.lives,4);assert.equal(b.blockLeft,0);assert.equal(b.perfect,false);
  w.RikaState.reset();const rares=Object.values(w.EQUIPMENT).filter(e=>e.rarity==='rare');
  for(const slot of ['sword','armor','gauntlet'])equip(rares.find(e=>e.slot===slot&&e.effect[{sword:'doubleCrit',armor:'reviveOnce',gauntlet:'comboKeep'}[slot]]).id);
  w.RikaBattle.start('g3_u01','basic',{replace:true,mode:'challenge'});b=w.RikaBattle.getBattle();q=b.questions[0];
  const hp=b.enemyHp;w.RikaBattle.answer(q.answer);assert.equal(b.enemyHp,Math.max(0,hp-2));assert.equal(b.firstCorrectCount,1);w.RikaBattle.advance();
  q=b.questions[1];b.lives=1;w.RikaBattle.answer((q.answer+1)%q.choices.length);assert.equal(b.lives,1);assert.equal(b.reviveLeft,0);assert.equal(b.streak,1);assert.equal(b.comboKeepLeft,0);assert.equal(b.perfect,false);
  const exp=w.RikaState.get().player.exp;
  w.RikaRewards.handleBattleResult({unit:w.CURRICULUM[0],tier:'basic',success:true,masteryComplete:false,effects:{expBoostBig:1}});
  assert.equal(w.RikaState.get().player.exp-exp,15);
});
test('all four grades and seasonal chapters clear with normal and rare rewards',()=>{
  const {w}=app();
  for(const u of w.CURRICULUM) {
    assert.equal(w.RikaState.progress(u.unitId).unlocked,true,u.unitId);
    clear(w,u.unitId,'basic');assert.equal(w.RikaState.progress(u.unitId).basicCleared,true,u.unitId);
    clear(w,u.unitId,'boss');assert.equal(w.RikaState.progress(u.unitId).perfected,true,u.unitId);
    if(u.kind!=='chapter') {clear(w,u.unitId,'bonus');assert.equal(w.RikaState.progress(u.unitId).bonusPerfected,true,u.unitId);assert.ok(w.RikaState.get().owned.equipment.includes(w.RikaEquipment.rareForUnit(u.unitId).id));}
  }
});
test('learning retries mistakes; challenge accuracy is independent of equipment damage',()=>{
  const {w}=app();let b=clear(w,'g3_u01','basic',{},[0]);
  assert.equal(b.firstCorrectCount,19);assert.equal(b.questions.length,21);assert.equal(b.lives,3);assert.equal(b.perfect,false);
  w.RikaState.reset();b=clear(w,'g3_u01','basic',{mode:'challenge'},[0]);assert.equal(b.lives,2);assert.equal(w.RikaState.progress('g3_u01').basicCleared,true);
});
test('course completion does not mark an undefeated final monster defeated',()=>{
  const {w}=app();w.RikaState.get().player.hpBase=6;
  const b=clear(w,'g3_u01','basic',{mode:'challenge'},[15,16,17]);
  assert.ok(b.enemyHp>0);assert.equal(w.RikaState.progress('g3_u01').basicCleared,true);
  assert.equal(b.waves[b.wave].hp,b.enemyHp);
});
test('perfect boss replays collect all normal equipment; a shield never makes a mistake perfect',()=>{
  const {w}=app();w.RikaState.progress('g5_u07').unlocked=true;clear(w,'g5_u07','basic');
  for(let i=0;i<5;i++)clear(w,'g5_u07','boss');
  assert.equal(w.RikaEquipment.normalByTheme('solution').filter(e=>w.RikaState.get().owned.equipment.includes(e.id)).length,4);
  w.RikaState.equip('sol_shield');clear(w,'g5_u07','bonus',{},[0]);assert.equal(w.RikaState.progress('g5_u07').bonusPerfected,false);
  clear(w,'g5_u07','bonus');w.RikaState.load();assert.equal(w.RikaState.progress('g5_u07').bonusPerfected,true);
});
test('short courses exhaust the bank without repeats; sessions resume; locked routes stay locked',()=>{
  const {w}=app(),seen=[];
  for(let i=0;i<4;i++){const b=clear(w,'g3_u01','basic',{limit:5});seen.push(...b.questions.map(q=>q.id));}
  assert.equal(new Set(seen).size,20);assert.equal(w.RikaState.progress('g3_u01').basicCleared,true);
  w.RikaBattle.start('g3_u01','basic',{replace:true});const prepared=JSON.stringify(w.RikaBattle.getBattle().questions);w.RikaState.load();w.RikaBattle.resume();assert.equal(JSON.stringify(w.RikaBattle.getBattle().questions),prepared);
  w.RikaState.reset();w.RikaBattle.start('g6_u02','boss');assert.equal(w.RikaState.get().activeSession,null);
});
test('reward transactions are idempotent, review has no rewards, and companions cap at two',()=>{
  const {w}=app(),u=w.CURRICULUM[0],ctx={unit:u,tier:'basic',success:true,masteryComplete:true,sessionId:'once',total:20};
  w.RikaRewards.handleBattleResult(ctx);const exp=w.RikaState.get().player.exp;w.RikaRewards.handleBattleResult(ctx);assert.equal(w.RikaState.get().player.exp,exp);
  w.RikaRewards.handleBattleResult({...ctx,sessionId:'review',review:true});assert.equal(w.RikaState.get().player.exp,exp);
  for(const id of Object.keys(w.COMPANIONS))w.RikaState.addCompanion(id);assert.equal(w.RikaState.get().activeCompanions.length,2);
});
function unlockMu(w){for(const u of w.CURRICULUM)w.RikaState.progress(u.unitId).basicCleared=true;w.RikaState.save();}
function solveMu(w){let n=0;while(w.RikaMu.getSession().phase!=='result'){assert.ok(++n<25);const q=w.RikaMu.getStep();w.RikaMu.submit(q.answer);w.RikaMu.advance();}return w.RikaMu.getSession();}
test('Mu unlock requires all four grades including observation chapters, not bosses',()=>{
  const {w}=app();assert.equal(w.RikaMu.gate().unlocked,false);w.RikaMu.start('crystal_gate');assert.equal(w.RikaMu.getSession(),null);
  for(const u of w.CURRICULUM.filter(u=>u.kind!=='chapter'))w.RikaState.progress(u.unitId).basicCleared=true;
  assert.equal(w.RikaMu.gate().unlocked,false);unlockMu(w);assert.equal(w.RikaMu.gate().unlocked,true);assert.equal(w.RikaMu.gate().total,52);
  assert.ok(w.CURRICULUM.every(u=>!w.RikaState.progress(u.unitId).bossCleared));
});
test('Mu cases vary answers and evidence labels, remain deterministic, and never start sorted',()=>{
  const {w}=app();for(const quest of w.RikaMuData.quests){const signatures=new Set(),evidence=new Set();
    assert.match(w.RikaMonsters.render(quest.guardian),/<svg/);
    for(let i=1;i<=160;i++){const c=w.RikaMuData.build(quest.id,Math.imul(i,2654435761)>>>0);assert.equal(JSON.stringify(c),JSON.stringify(w.RikaMuData.build(quest.id,Math.imul(i,2654435761)>>>0)));signatures.add(c.signature);evidence.add(c.steps[1].answer.slice().sort().join(','));
      assert.equal(c.steps.length,4);for(const q of c.steps){assert.equal(w.RikaMu.check(q,q.answer),true);if(q.type==='order')assert.notEqual(q.items.map(i=>i.id).join(','),q.answer.join(','));}
      if(quest.id==='crystal_gate')assert.notEqual(c.steps[0].answer,c.steps[3].answer);
    }assert.ok(signatures.size>50,quest.id);assert.ok(evidence.size>=5,quest.id);
  }
  assert.equal(w.RikaMu.numeric('１２.０'),12);assert.equal(w.RikaMu.numeric('1e3'),null);assert.equal(w.RikaMu.numeric(''),null);
});
test('Mu completion, first-try badges, notes, resume, and rewards persist independently',()=>{
  const {w}=app();unlockMu(w);const equipment=JSON.stringify(w.RikaState.get().owned.equipment);
  for(const q of w.RikaMuData.quests){w.RikaMu.start(q.id,true);const seed=w.RikaMu.getSession().seed;w.RikaMu.getSession().note='わかったこと <script>保存</script>';
    w.RikaState.save();w.RikaState.load();w.RikaMu.resume();assert.equal(w.RikaMu.getSession().seed,seed);
    const s=solveMu(w);assert.equal(s.result.newBadge,true);assert.equal(s.result.exp,200);assert.equal(w.RikaState.get().mu.progress[q.id].badged,true);
    const exp=w.RikaState.get().player.exp;w.RikaMu.advance();w.RikaMu.submit(w.RikaMu.getStep().answer);assert.equal(w.RikaState.get().player.exp,exp);
    w.RikaState.load();assert.match(w.RikaState.get().mu.progress[q.id].history[0].note,/<script>/);
  }assert.equal(JSON.stringify(w.RikaState.get().owned.equipment),equipment);assert.equal(w.RikaState.get().player.exp,2400);
});
test('Mu wrong answers lock, rechecks use new data, hints exclude badges, and repeats do not farm EXP',()=>{
  const {w}=app();unlockMu(w);w.RikaMu.start('crystal_gate',true);let s=w.RikaMu.getSession(),q=w.RikaMu.getStep();
  w.RikaMu.submit('bad');assert.equal(s.answered,false);w.RikaMu.submit(q.answer+1);assert.equal(s.misses,1);w.RikaMu.submit(q.answer);assert.equal(s.responses[0].correct,false);
  const seed=s.seed;w.RikaState.load();w.RikaMu.resume();assert.equal(w.RikaMu.getSession().answered,true);w.RikaMu.advance();
  for(let i=0;i<3;i++){w.RikaMu.submit(w.RikaMu.getStep().answer);w.RikaMu.advance();}
  s=w.RikaMu.getSession();assert.equal(s.phase,'recheck');assert.notEqual(s.currentSeed,seed);assert.equal(w.RikaState.get().mu.progress.crystal_gate.cleared,false);
  const retry=s.currentSeed;w.RikaMu.submit(w.RikaMu.getStep().answer+1);w.RikaMu.advance();assert.notEqual(s.currentSeed,retry);
  solveMu(w);assert.equal(s.result.badge,false);assert.equal(s.result.exp,80);assert.equal(w.RikaState.get().mu.progress.crystal_gate.badged,false);
  w.RikaMu.start('crystal_gate',true);w.RikaMu.hint();assert.equal(solveMu(w).result.badge,false);
  w.RikaMu.start('crystal_gate',true);assert.equal(solveMu(w).result.exp,120);
  w.RikaMu.start('crystal_gate',true);assert.equal(solveMu(w).result.exp,0);
  w.RikaState.get().mu.exposureFull.light_garden=true;w.RikaMu.start('light_garden',true);assert.equal(solveMu(w).result.badge,false);
});
test('old schema 2 saves acquire Mu data; invalid inquiry drafts and changed content discard only inquiry session',()=>{
  const {w}=app();const prior=JSON.parse(w.RikaState.exportData());delete prior.mu;w.RikaState.importData(JSON.stringify(prior));assert.equal(w.RikaState.get().mu.active,null);
  unlockMu(w);w.RikaMu.start('crystal_gate',true);w.RikaState.get().mu.active.draft.order=null;w.RikaState.save();w.RikaState.load();assert.equal(w.RikaMu.getSession(),null);assert.equal(w.RikaMu.gate().unlocked,true);
  w.RikaMu.start('light_garden',true);w.RikaState.get().mu.active.revision=99;w.RikaState.save();w.RikaState.load();assert.equal(w.RikaMu.getSession(),null);
  assert.equal(w.RikaMu.gate().unlocked,true);
  w.RikaMu.start('crystal_gate',true);solveMu(w);w.RikaState.get().mu.active.result.firstCorrect='<img src=x>';
  w.RikaState.save();w.RikaState.load();assert.equal(w.RikaMu.getSession(),null);assert.equal(w.RikaState.get().mu.progress.crystal_gate.cleared,true);
});
test('Mu has four balanced domains, with gated middle-school bridges kept out of ordinary banks',()=>{
  const {w}=app();assert.equal(w.RikaMuData.quests.length,12);assert.equal(w.RikaMuData.domains.length,4);
  for(const domain of w.RikaMuData.domains){
    const quests=w.RikaMuData.quests.filter(q=>q.domain===domain.id);
    assert.equal(quests.length,3);assert.equal(quests.filter(q=>q.level==='elementary').length,2);
    const middle=quests.find(q=>q.level==='middle');assert.ok(middle.primer);assert.equal(middle.prerequisites.length,2);
    assert.ok(middle.prerequisites.every(id=>quests.some(q=>q.id===id&&q.level==='elementary')));
    assert.ok(quests.every(q=>q.units.every(id=>w.CURRICULUM.some(u=>u.unitId===id))));
    unlockMu(w);assert.equal(w.RikaMu.canStart(middle.id),false);w.RikaMu.start(middle.id,true);assert.equal(w.RikaMu.getSession()?.questId===middle.id,false);
    for(const id of middle.prerequisites){w.RikaMu.start(id,true);solveMu(w);}
    assert.equal(w.RikaMu.canStart(middle.id),true);w.RikaMu.start(middle.id,true);assert.equal(solveMu(w).result.newBadge,true);
    assert.equal(w.QUESTION_BANK[middle.id],undefined);
  }
  for(const quest of w.RikaMuData.quests.filter(q=>q.level==='elementary')){
    const text=JSON.stringify(w.RikaMuData.build(quest.id,987));
    assert.doesNotMatch(text,/溶質|溶媒|質量パーセント|オーム|抵抗|電圧|飽和水蒸気量|凝結|生産者|消費者|分解者/);
  }
});
test('Mu numeric answers independently agree with mass balance, lever, Ohm and humidity records',()=>{
  const {w}=app();let noDrops=0,drops=0;
  for(let seed=1;seed<=300;seed++){
    const salt=w.RikaMuData.build('salt_lab',seed),sr=salt.steps[1].table.rows.find(r=>r[0]===salt.steps[1].answer[0]);
    assert.equal(parseFloat(sr[3]),parseFloat(sr[1])+parseFloat(sr[2]));
    assert.ok(Math.abs(salt.steps[0].answer-parseFloat(sr[1])/parseFloat(sr[3])*100)<1e-9);
    assert.equal(salt.steps[3].answer,salt.steps[0].answer*2);
    const lever=w.RikaMuData.build('lever_gate',seed),lm=lever.steps[0].stem.match(/右は(\d+)gで支点から(\d+)目もり。左は(\d+)目もり/);
    assert.ok(lm);assert.equal(lever.steps[0].answer,Number(lm[1])*Number(lm[2])/Number(lm[3]));
    const circuit=w.RikaMuData.build('circuit_lab',seed),cm=circuit.steps[0].stem.match(/(\d+)Ωの抵抗に([\d.]+)V/);
    assert.ok(Math.abs(circuit.steps[0].answer-Number(cm[2])/Number(cm[1]))<1e-9);
    assert.equal(circuit.steps[3].answer,circuit.steps[0].answer/2);
    const dew=w.RikaMuData.build('dew_lab',seed),dr=dew.steps[1].table.rows.find(r=>r[0]===dew.steps[1].answer[0]),cr=dew.steps[1].table.rows.find(r=>r[0]===dew.steps[1].answer[1]);
    assert.ok(Math.abs(dew.steps[0].answer-parseFloat(dr[3])/parseFloat(dr[4])*100)<1e-9);
    assert.equal(dew.steps[3].answer,Math.max(0,parseFloat(dr[3])-parseFloat(cr[4])));
    if(dew.steps[3].answer===0)noDrops++;else drops++;
  }
  assert.ok(noDrops>0&&drops>0);
});
test('three-quest saves keep notes, badges, seen cases and active session after expansion',()=>{
  const {w}=app();unlockMu(w);w.RikaMu.start('crystal_gate',true);solveMu(w);
  w.RikaMu.start('light_garden',true);w.RikaMu.getSession().note='前の研究ノート';w.RikaState.save();
  const old=JSON.parse(w.RikaState.exportData()),seed=old.mu.active.seed,seen=old.mu.seen.crystal_gate[0];
  for(const q of w.RikaMuData.quests.filter(q=>!['crystal_gate','light_garden','river_valley'].includes(q.id))){delete old.mu.progress[q.id];delete old.mu.seen[q.id];delete old.mu.exposureFull[q.id];}
  w.RikaState.importData(JSON.stringify(old));w.RikaMu.resume();
  assert.equal(w.RikaMu.getSession().seed,seed);assert.equal(w.RikaMu.getSession().note,'前の研究ノート');
  assert.equal(w.RikaState.get().mu.progress.crystal_gate.badged,true);assert.ok(w.RikaState.get().mu.seen.crystal_gate.includes(seen));
  assert.equal(w.RikaState.get().mu.progress.salt_lab.cleared,false);
  w.RikaMu.start('ice_box',true);solveMu(w);const exposure=JSON.stringify(w.RikaState.get().mu.seen.ice_box);
  w.RikaState.load();assert.equal(JSON.stringify(w.RikaState.get().mu.seen.ice_box),exposure);
});
let failed=0;
for(const [name,fn] of tests){try{fn();console.log('PASS '+name);}catch(error){failed++;console.error('FAIL '+name+'\n'+error.stack);}}
console.log(`${tests.length-failed}/${tests.length} checks passed`);
process.exitCode=failed?1:0;
