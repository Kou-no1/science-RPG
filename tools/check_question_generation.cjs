// Verify the published banks and every release generator without editing the worktree.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const qDir = path.join('data','questions');
const ctx = vm.createContext({window:{}});
const load = file => vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const plain = s => s.replace(/\{([^|{}]+)\|[^{}]+\}/g,'$1');
const files = fs.readdirSync(path.join(root,qDir)).filter(f=>/^g[3-6]_.*\.js$/.test(f));
for(const f of ['data/curriculum.js','data/curriculum-grades34.js',...files.map(f=>path.join(qDir,f))]) load(f);
const {CURRICULUM,QUESTION_BANK} = ctx.window;
const authored = {...require('./content-grades3.cjs'),...require('./content-grades4.cjs'),...require('./content-chapters.cjs')};
const byId = new Map();
const links = [];
assert.deepEqual(Object.keys(QUESTION_BANK).sort(),Array.from(CURRICULUM,u=>u.unitId).sort());
for(const u of CURRICULUM) {
  const bank=QUESTION_BANK[u.unitId];
  for(const [tier,rows] of Object.entries(bank)) for(const q of rows) {
    assert(!byId.has(q.id),q.id);
    byId.set(q.id,q);
    assert.equal(q.tier,tier,q.id);
    assert(['ox','mc4'].includes(q.type),q.id);
    assert.equal(q.choices.length,q.type==='ox'?2:4,q.id);
    if(q.type==='ox') assert.deepEqual(Array.from(q.choices),['○','×'],q.id);
    assert.equal(new Set(q.choices.map(plain)).size,q.choices.length,q.id);
    assert(Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.choices.length,q.id);
    assert(q.explanation.trim() && q.stem.trim() && q.curriculumRef && q.contentVersion>=1,q.id);
    if(tier!=='bonus') {
      assert.equal(q.targetStage,'elementary'+u.grade,q.id);
      assert(u.sub.some(s=>s.subId===q.subId),q.id);
    }
    if(q.bonusCategory==='trivia') assert.equal(q.targetStage,'trivia',q.id);
    if(q.sourceQuestionId) links.push(q);
  }
  if(authored[u.unitId]) authored[u.unitId].forEach((row,i)=>{
    const sub=u.sub.find(s=>s.no===(row.sub||1)).subId;
    assert.equal(bank.basic[i].subId,sub,bank.basic[i].id);
    assert.equal(bank.boss[i].subId,sub,bank.boss[i].id);
  });
}
for(const q of links) {
  const source=byId.get(q.sourceQuestionId);
  assert(source,q.id);
  for(const key of ['contentVersion','answer','subId','curriculumRef']) assert.equal(q[key],source[key],q.id);
  assert.deepEqual(Array.from(q.choices,plain),Array.from(source.choices,plain),q.id);
  for(const key of ['stem','explanation']) assert(plain(q[key]).endsWith(plain(source[key])),q.id);
}
for(const id of Object.keys(require('./content-corrections.cjs'))) assert(byId.has(id),'Unknown correction: '+id);

// Compare the files themselves: field reordering and ruby churn matter even
// if a reconstructed object would grade the same way.
const parent = fs.realpathSync(os.tmpdir());
const temp = fs.mkdtempSync(path.join(parent,'science-bank-check-'));
try {
  for(const dir of ['data','tools']) fs.cpSync(path.join(root,dir),path.join(temp,dir),{recursive:true});
  for(const name of ['generate_grades34','generate_g5_question_banks','generate_g6_question_banks','generate_grades34']) {
    execFileSync(process.execPath,[path.join('tools',name+'.cjs')],{cwd:temp,stdio:'pipe'});
    for(const file of files) {
      const relative=path.join(qDir,file);
      assert(fs.readFileSync(path.join(temp,relative)).equals(fs.readFileSync(path.join(root,relative))),name+': '+file);
    }
  }
} finally {
  if(path.dirname(fs.realpathSync(temp))!==parent) throw new Error('Unexpected temporary directory');
  fs.rmSync(temp,{recursive:true});
}
console.log(files.length+' banks / '+byId.size+' IDs / '+links.length+' linked questions; all generator outputs byte-identical.');
