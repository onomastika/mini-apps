const {chromium}=require('playwright'), assert=require('node:assert/strict'), fs=require('node:fs');
(async()=>{fs.mkdirSync('evidence',{recursive:true});const browser=await chromium.launch({headless:true});let errors=[];
for(const width of [390,320,1280]){
const ctx=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:width<500,hasTouch:width<500});
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url())});
await p.goto('http://127.0.0.1:8765/wingspan/',{waitUntil:'networkidle'});await p.locator('#quickHabitats .field-hab').first().waitFor();
assert.equal(await p.locator('#quickHabitats .field-hab').count(),3);assert.equal(await p.locator('#quickBirdCount').textContent(),'4');
await p.screenshot({path:'evidence/home-'+width+'.png',fullPage:true});
const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,'home overflow at '+width);
for(const tab of ['birds','catalog','game','score']){
await p.locator('.nav [data-tab="'+tab+'"]').click();
if(tab==='catalog'){await p.locator('#dbList .dbrow').first().waitFor();await p.locator('#dbQuery').fill('American Coot');await p.waitForFunction(()=>document.querySelectorAll('#dbList .dbrow').length===1)}
assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,tab+' overflow at '+width);
if(width===390)await p.screenshot({path:'evidence/'+tab+'.png',fullPage:true});
}
if(width===390){await p.locator('.nav [data-tab="guide"]').click();await p.locator('#quickStock button[aria-label="Увеличить Зерно"]').click();await p.locator('#quickStock button[aria-label="Увеличить Черви"]').click();await p.locator('#quickStock button[aria-label="Увеличить Яйца"]').click();await p.locator('#stockConfirmed').check();await p.locator('.nav [data-tab="birds"]').click();await p.locator('#hand .handrow').filter({hasText:'American Coot'}).getByRole('button').click();await p.locator('#birdActions button').filter({hasText:'Оплатить и выложить'}).click();assert.equal(await p.locator('#boardCount').textContent(),'5 / 15');await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('#boardCount').textContent(),'5 / 15');await p.locator('#undoBird').click();assert.equal(await p.locator('#boardCount').textContent(),'4 / 15');}
await ctx.close();
}
await browser.close();assert.deepEqual(errors,[]);console.log('Browser checks PASS at 320, 390, 1280; screenshots saved')})().catch(e=>{console.error(e);process.exitCode=1});
