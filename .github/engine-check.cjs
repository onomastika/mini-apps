const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{fs.mkdirSync('evidence',{recursive:true});const b=await chromium.launch(),errors=[];
for(const width of [320,390,1280]){const p=await b.newPage({viewport:{width,height:844},isMobile:width<500,hasTouch:width<500});p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto('http://127.0.0.1:8765/wingspan/',{waitUntil:'networkidle'});await p.waitForFunction(()=>DB?.version===3);
assert.equal(await p.evaluate(()=>DB.birds.filter(x=>['guided','deterministic'].includes(x.mechanic.mode)).length),86);
await p.evaluate(()=>{S.stockKnown=true;S.roundKnown=true;S.r=0;S.t=0;S.stock.seed=1;S.stock.worm=1;S.stock.eggs=1;S.ledgerKnown=true;for(let x of S.birds){x.eggsOn=x.id==='ruddy'?1:0;x.cachedOn=0;x.tuckedOn=0}renderAll()});
for(const [r,t,n] of [[0,0,26],[2,0,11],[3,8,1]])assert.equal(await p.evaluate(([r,t])=>{S.r=r;S.t=t;return projectGame().steps.length},[r,t]),n);
await p.evaluate(()=>{S.r=2;S.t=0;renderAll();startGuided({kind:'play',candidate:'coot',hab:'water'})});
await p.locator('#actionBody .action-fields input').first().fill('1');await p.getByRole('button',{name:'Птица выложена · списать стоимость'}).click();assert.equal(await p.evaluate(()=>S.stock.eggs),0);assert.equal(await p.evaluate(()=>S.ledgerKnown),true);
await p.getByRole('button',{name:'Подтвердить ход',exact:true}).click();await p.locator('.nav [data-tab="game"]').click();await p.locator('#undo').click();assert.equal(await p.evaluate(()=>S.stock.eggs),1);assert.equal(await p.evaluate(()=>S.t),0);
await p.evaluate(()=>{S.phase='end';S.r=2;S.t=12;renderAll();startRoundPowers()});await p.getByRole('spinbutton',{name:'Очки цели раунда'}).fill('3');await p.getByRole('button',{name:'Подтвердить очки'}).click();await p.getByRole('button',{name:'Завершить раунд',exact:true}).click();assert.equal(await p.evaluate(()=>S.r),3);assert.equal(await p.evaluate(()=>S.scores[0].r2),3);
await p.locator('.nav [data-tab="guide"]').click();await p.locator('#forecastPanel summary').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:'evidence/home-'+width+'.png',fullPage:true});
await p.locator('.nav [data-tab="birds"]').click();await p.locator('details').filter({has:p.locator('#ledgerPanel')}).locator('summary').click();assert.equal(await p.locator('#ledgerPanel').isVisible(),true);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await p.locator('.nav [data-tab="catalog"]').click();await p.locator('#dbQuery').fill('American Coot');await p.waitForFunction(()=>document.querySelectorAll('#dbList .dbrow').length===1);assert.match(await p.locator('.fit-rating').innerText(),/Guided power/);
await p.close()}
await b.close();assert.deepEqual(errors,[]);console.log('ENGINE PASS 320/390/1280')})().catch(e=>{console.error(e);process.exitCode=1});
