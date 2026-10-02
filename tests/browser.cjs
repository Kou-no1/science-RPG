const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const out = process.env.RIKA_SCREENSHOT_DIR || path.join(os.tmpdir(),'rika-quest-qa');
fs.mkdirSync(out,{recursive:true});
async function run() {
  const server=http.createServer((req,res)=>{
    const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    fs.readFile(file,(error,body)=>{if(error){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript'}[path.extname(file)] || 'application/octet-stream')+'; charset=utf-8');res.end(body);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);
  let browser;
  try {
    browser=await chromium.launch({headless:true,executablePath});
    const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const external=[];page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:'))external.push(r.url());});
    await page.goto('http://127.0.0.1:'+server.address().port+'/');
    await page.locator('[data-home-map]').waitFor();
    await page.screenshot({path:path.join(out,'home-desktop.png'),fullPage:true});
    await page.locator('[data-home-map]').click();
    await page.locator('#grade-tab-3').focus();await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#grade-tab-4').getAttribute('aria-selected'),'true');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'grade-tab-4');
    for(const grade of [3,4,5,6]){
      await page.evaluate(g=>window.RikaApp.showMap(g),grade);
      assert.equal(await page.locator('[data-grade]').count(),4);
      await page.screenshot({path:path.join(out,'map-grade'+grade+'.png'),fullPage:true});
    }
    await page.evaluate(()=>{window.RikaState.progress('g5_u07').unlocked=true;window.RikaState.get().settings.sound=false;window.RikaBattle.start('g5_u07','basic',{replace:true});});
    assert.equal(await page.evaluate(()=>window.RikaBattle.getBattle().initialCount),23);
    await page.locator('[data-choice]').first().waitFor();
    const first=await page.evaluate(()=>{const q=window.RikaBattle.getBattle().questions[0];return {answer:q.answer,id:q.id,length:q.choices.length};});
    await page.locator('[data-choice="'+((first.answer+1)%first.length)+'"]').click();
    assert.match(await page.locator('#feedback').innerText(),/✗/);
    await page.reload();await page.locator('[data-resume]').click();
    assert.equal(await page.locator('[data-choice]:disabled').count(),first.length);
    assert.equal(await page.evaluate(id=>window.RikaState.get().questionStats[id].seen,first.id),1);
    await page.locator('[data-next-question]').click();
    let attempts=0;
    while(await page.evaluate(()=>!!window.RikaState.get().activeSession)){
      assert.ok(++attempts<50);
      const answer=await page.evaluate(()=>{const b=window.RikaBattle.getBattle();return b.questions[b.index].answer;});
      await page.locator('[data-choice="'+answer+'"]').click();
      await page.locator('[data-next-question]').click();
    }
    assert.equal(await page.evaluate(()=>window.RikaState.progress('g5_u07').basicCleared),true);
    for(const tier of ['boss','bonus']){
      await page.evaluate(t=>window.RikaBattle.start('g5_u07',t,{replace:true}),tier);
      while(await page.evaluate(()=>!!window.RikaState.get().activeSession)){
        const answer=await page.evaluate(()=>{const b=window.RikaBattle.getBattle();return b.questions[b.index].answer;});
        await page.locator('[data-choice="'+answer+'"]').click();await page.locator('[data-next-question]').click();
      }
      await page.locator('[role="dialog"]').waitFor();
      await page.screenshot({path:path.join(out,tier+'-reward.png'),fullPage:true});
      await page.keyboard.press('Escape');assert.equal(await page.locator('[role="dialog"]').count(),0);
    }
    await page.reload();assert.equal(await page.evaluate(()=>window.RikaState.progress('g5_u07').bonusPerfected),true);
    for(const viewport of [{width:1280,height:900},{width:768,height:1024},{width:390,height:844}]){
      await page.setViewportSize(viewport);
      for(const monsterId of ['soltin','myoubaroo','tokerun','rokagaeru','johatsubat']){
        await page.evaluate(id=>window.RikaBattle.start('g5_u07','basic',{replace:true,monsterId:id,limit:5}),monsterId);
        const geometry=await page.evaluate(()=>{const enemy=document.querySelector('[data-enemy-art] svg').getBoundingClientRect(),stage=document.querySelector('[data-battle-stage]').getBoundingClientRect();return {w:enemy.width,h:enemy.height,x:enemy.x,y:enemy.y,stage:{x:stage.x,y:stage.y,w:stage.width,h:stage.height}};});
        assert.ok(geometry.w>=100&&geometry.h>=80,monsterId);
        assert.ok(geometry.y>=geometry.stage.y&&geometry.y+geometry.h<=geometry.stage.y+geometry.stage.h,monsterId);
        const pixels=await page.evaluate(async()=>{const svg=document.querySelector('[data-enemy-art] svg');const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await img.decode();const c=document.createElement('canvas');c.width=220;c.height=180;const x=c.getContext('2d');x.drawImage(img,0,0,220,180);const p=x.getImageData(0,0,220,180).data;let n=0;for(let i=3;i<p.length;i+=4)if(p[i]>20)n++;return n;});
        assert.ok(pixels>1000,monsterId+' must have visible SVG pixels');
        await page.screenshot({path:path.join(out,monsterId+'-'+viewport.width+'.png'),fullPage:true});
      }
      for(const tier of ['boss','bonus']){
        await page.evaluate(t=>window.RikaBattle.start('g5_u07',t,{replace:true}),tier);
        assert.ok(await page.locator('.battle-topbar').evaluate(e=>[...e.children].every(child=>child.getBoundingClientRect().right<=e.getBoundingClientRect().right+1)),'battle label overflow');
        await page.screenshot({path:path.join(out,tier+'-'+viewport.width+'.png'),fullPage:true});
      }
      for(const tab of ['equipment','companions','monsters','notebook']){
        await page.evaluate(t=>window.RikaApp.showInventory(t),tab);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),tab+' overflow');
        await page.screenshot({path:path.join(out,tab+'-'+viewport.width+'.png'),fullPage:true});
      }
      await page.evaluate(()=>window.RikaApp.showMap(4));
      await page.screenshot({path:path.join(out,'map4-'+viewport.width+'.png'),fullPage:true});
      const mapOverflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(e=>!e.closest('.map-shell') && e.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(e=>[e.tagName,e.className,e.getBoundingClientRect().width])}));
      assert.ok(mapOverflow.scroll<=mapOverflow.width+1,'map overflow '+JSON.stringify(mapOverflow));
    }
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>{window.RikaBattle.start('g5_u07','basic',{replace:true});const b=window.RikaBattle.getBattle(),q=window.QUESTION_BANK.g5_u07.basic.find(q=>q.diagramKey);b.questions[0]=window.RikaBattle.prepareQuestion(q);window.RikaState.get().activeSession=JSON.parse(JSON.stringify(b));window.RikaBattle.resume();});
    assert.equal(await page.locator('.question-diagram svg').count(),1);await page.screenshot({path:path.join(out,'meniscus-mobile.png'),fullPage:true});
    const beforeHint=await page.locator('[data-choice]').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
    await page.locator('[data-use-item="hint_scroll"]').click();
    assert.equal(await page.locator('[data-choice]:disabled').count(),2);
    assert.deepEqual(await page.locator('[data-choice]').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width)),beforeHint);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{window.RikaState.get().settings.motion=true;window.RikaState.save();});
    const oldStage=await page.locator('[data-battle-stage]').elementHandle();
    const answer=await page.evaluate(()=>window.RikaBattle.getBattle().questions[0].answer);
    await page.locator('[data-choice="'+answer+'"]').click();
    assert.equal(await page.locator('.enemy-bar [role="progressbar"]').getAttribute('aria-valuenow'),'4');
    assert.equal(await page.locator('.enemy-bar [role="progressbar"]').getAttribute('aria-valuemax'),'5');
    assert.equal(await page.locator('.enemy-bar [role="progressbar"]').evaluate(e=>e.style.getPropertyValue('--value')),'80%');
    assert.equal(await page.locator('.spark').count()>0,true);
    await page.locator('[data-next-question]').click();assert.ok(await oldStage.evaluate(e=>e.isConnected));
    const ruby=await page.evaluate(()=>{const text=window.RikaUI.renderFurigana('子{葉|は} 体温');window.RikaState.get().settings.furigana=false;return {text,off:window.RikaUI.renderFurigana('子葉')};});
    assert.match(ruby.text,/<ruby>子葉<rt>しよう/);assert.equal(ruby.off,'子葉');
    const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));await local.goto(pathToFileURL(path.join(root,'index.html')).href);await local.locator('[data-home-map]').waitFor();await local.close();
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log('PASS browser UI, responsive SVG pixel checks, resume, rewards, ruby, file:// and offline requests');
    console.log('Screenshots: '+out);
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
