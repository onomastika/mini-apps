const fs=require('node:fs'),{execFileSync}=require('node:child_process');const source=fs.readFileSync('tests/wingspan/strategy-v5.cjs','utf8');const mock=new Function(source.slice(source.indexOf('function mock'),source.indexOf('const assert=')).replace('return {state:()=>S','return {starterPlan,state:()=>S')+'\nreturn mock')();

/* Independent competitive fixture; no application rule execution or projection is
 * used to decide outcomes. Only the tested advisor's recommendation is called.
 * Base board, two players, shared hidden deck/feeder, public tray, four rounds,
 * actual green-side goals and supported printed rules. Optional board upgrades
 * are not chosen. A fixed opponent policy is used across paired seed trials. */
function competitive(versions,mock,fixture,seeds,oppVersion=null,oceania=false){
 const BASE=['worm','seed','fruit','fish','rodent'],K=oceania?[...BASE,'nectar']:BASE,H=['forest','grass','water'],F=oceania?['worm','worm/seed','seed/nectar','fruit/nectar','fish','rodent']:['worm','seed','worm/seed','fruit','fish','rodent'],Y=oceania?{forest:[1,2,2,3,3,3],grass:[1,2,2,2,3,4],water:[1,2,2,3,3,3]}:{forest:[1,1,2,2,3,3],grass:[2,2,3,3,4,4],water:[1,1,2,2,3,3]},L=[8,7,6,5],BON=['Bird Counter','Bird Feeder','Nest Box Builder','Ecologist','Falconer','Rodentologist','Forester','Fishery Manager'];
 fixture=fixture.filter(b=>oceania||!b.cost.flat().includes('nectar'));
 const rng=seed=>{let z=seed>>>0;return ()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}},shuffle=(a,r)=>{a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const sum=a=>a.reduce((s,n)=>s+n,0),total=o=>sum(Object.values(o)),pay=(b,s)=>{let best=null,low=Infinity;for(let opt of b.cost){function go(i,stock,used){if(i===opt.length){let v=total(used)*10+(used.nectar||0);if(v<low){low=v;best=used}return}let k=opt[i],opts=k==='any'?K.map(z=>[z]):[[k],...(oceania&&k!=='nectar'?[['nectar']]:[]),...BASE.flatMap((a,j)=>BASE.slice(j).map(b=>[a,b]))];for(let a of opts){let z={...stock},u={...used};for(let k of a){z[k]--;u[k]=(u[k]||0)+1}if(a.some(k=>!K.includes(k)||z[k]<0||!Number.isFinite(z[k])))continue;go(i+1,z,u)}}go(0,s,{})}return best};
 const pRow=(p,h)=>p.board.filter(b=>b.loc===h).sort((a,b)=>a.slotOrder-b.slotOrder),eggs=p=>sum(p.board.map(b=>b.eggsOn)),free=p=>sum(p.board.map(b=>b.capacity-b.eggsOn)),scoreBonus=(p,bonus=p.bonus)=>{let n=p.board.filter(b=>bonus==='Bird Counter'?b.flocking:bonus==='Falconer'?b.predator:bonus==='Bird Feeder'?b.printedFoods.seed:bonus==='Rodentologist'?b.printedFoods.rodent:bonus==='Nest Box Builder'?['cavity','wild'].includes(b.nestType):bonus==='Forester'?b.hab.length===1&&b.hab[0]==='forest':bonus==='Fishery Manager'?b.printedFoods.fish:false).length;return bonus==='Ecologist'?2*Math.min(...H.map(h=>pRow(p,h).length)):['Bird Counter','Falconer','Rodentologist'].includes(bonus)?2*n:bonus==='Bird Feeder'?n>=8?7:n>=5?3:0:bonus==='Nest Box Builder'?n>=6?7:n>=4?4:0:bonus==='Forester'?n>=5?8:n>=3?4:0:n>=4?8:n>=2?3:0};
 function run(v,seed){
  let random=rng(seed),cards=new Map(fixture.map(c=>[c.id,c])),ids=new Set(cards.keys()),db={...v.db,birds:v.db.birds.filter(c=>ids.has(c.id))},ui=mock(v.html,db).ui,oppDb=oppVersion?{...oppVersion.db,birds:oppVersion.db.birds.filter(c=>ids.has(c.id))}:null,oppUI=oppVersion?mock(oppVersion.html,oppDb).ui:null;
  let bonusDeck=shuffle(BON,random),bonusDiscard=[],deck=shuffle(fixture,random),discard=[],tray=[],feeder=[],players=[0,1].map(()=>({board:[],hand:[],stock:Object.fromEntries(K.map(k=>[k,0])),bonus:'',extraBonus:[],round:0,spent:Object.fromEntries(H.map(h=>[h,0])),pink:new Set(),actions:[],delay:[],points:0})),seat=seed%2,goals=shuffle([2000,2001,2002,2003,2005,2008,2020,2024],random).slice(0,4),rolls=Array.from({length:53},()=>Array.from({length:100},()=>F[Math.floor(random()*6)])),time=0,ri=0,turns=0,r=0,used=[0,0],fallbacks=0,compute=0,decisionCount=0,initial=0;
  let roll=()=>rolls[Math.min(time,52)][ri++%100],reset=()=>{feeder=Array.from({length:5},roll)},get=()=>{if(!deck.length&&discard.length){deck=shuffle(discard,random);discard=[]}return deck.shift()||null},fill=()=>{while(tray.length<3){let c=get();if(!c)break;tray.push(c)}},pull=(p,n)=>{for(let i=0;i<n;i++){let c=get();if(c)p.hand.push(c)}},make=(c,h)=>({...c,loc:h,eggsOn:0,cachedOn:0,tuckedOn:0,tuckedCards:[]}),costOptions=(p)=>p.hand.flatMap(b=>b.hab.filter(h=>pRow(p,h).length<5).map(h=>({b,h,eg:[0,1,1,2,2][pRow(p,h).length],pay:pay(b,p.stock)}))).filter(z=>z.pay&&z.eg<=eggs(p));
  function want(p){return K.slice().sort((a,b)=>{let rank=k=>sum(p.hand.map(c=>Math.max(...c.cost.map(o=>o.filter(z=>z===k).length))))-(p.stock[k]||0)*1.2;return rank(b)-rank(a)})[0]}
  function gain(p,n,k){for(let i=0;i<n;i++)p.stock[k==='any'?want(p):k]++}
  function egg(p,n,target){let a=target?[target]:p.board;for(let i=0;i<n;i++){let b=a.filter(b=>b.eggsOn<b.capacity).sort((a,b)=>b.capacity-b.eggsOn-a.capacity+a.eggsOn)[0];if(!b)break;b.eggsOn++}}
  function eggCost(p,n,except){for(let i=0;i<n;i++){let b=p.board.filter(b=>b!==except&&b.eggsOn>0).sort((a,b)=>b.eggsOn-a.eggsOn)[0];if(!b)return false;b.eggsOn--}return true}
  function discardHand(p){if(!p.hand.length)return null;let c=p.hand.slice().sort((a,b)=>a.points-b.points||a.id-b.id)[0];p.hand=p.hand.filter(b=>b.id!==c.id);return c}
  function tuckHand(p,b){let c=discardHand(p);if(!c)return false;b.tuckedOn++;b.tuckedCards.push(c);return true}
  function tuckDeck(b,n){for(let i=0;i<n;i++){let c=get();if(!c)break;b.tuckedOn++;b.tuckedCards.push(c)}}
  function gainFeeder(p,n,wanted,cacheBird=null,optional=false){for(let i=0;i<n;i++){if(!feeder.length){if(optional)break;reset()}if(wanted!=='any'&&wanted&&!feeder.some(f=>f.split('/').includes(wanted))){if(optional)break;if(feeder.every(f=>f===feeder[0]))reset()}let choices=feeder.flatMap((f,j)=>f.split('/').map(k=>({k,j})));let best=choices.find(z=>z.k===wanted)||(optional&&wanted!=='any'?null:choices.find(z=>z.k===want(p))||choices[0]);if(!best)break;feeder.splice(best.j,1);if(cacheBird&&turns>16)cacheBird.cachedOn++;else gain(p,1,best.k)}}
  function place(p,op,a,depth=0){if(!a||!a.pay||a.eg>eggs(p)||pRow(p,a.h).length>=5||!p.hand.some(c=>c.id===a.b.id))throw Error('invalid placement');for(let [k,n] of Object.entries(a.pay)){if(p.stock[k]<n)throw Error('invalid payment');p.stock[k]-=n}p.spent[a.h]+=a.pay.nectar||0;if(!eggCost(p,a.eg))throw Error('egg payment');p.hand=p.hand.filter(c=>c.id!==a.b.id);let b=make(a.b,a.h);b.slotOrder=pRow(p,a.h).length;p.board.push(b);if(b.color==='white'&&depth<8)power(p,op,b,depth+1);return b}
  function takeBonuses(n){let a=[];for(let i=0;i<n;i++){if(!bonusDeck.length&&bonusDiscard.length){bonusDeck=shuffle(bonusDiscard,random);bonusDiscard=[]}if(!bonusDeck.length)break;a.push(bonusDeck.shift())}return a}
function chooseBonus(p,n){let a=takeBonuses(n).sort((a,b)=>scoreBonus(p,b)-scoreBonus(p,a));if(a.length)p.extraBonus.push(a.shift());bonusDiscard.push(...a)}
function drawChoice(n){let a=[];for(let j=0;j<n;j++){let c=get();if(c)a.push(c)}return a.sort((a,b)=>b.points-b.cost[0].length-a.points+a.cost[0].length)}
function tuckCard(b,c){if(c){b.tuckedOn++;b.tuckedCards.push(c)}}
function consumeFaces(foods,n=5){let result=[];while(result.length<n){let i=feeder.findIndex(f=>f.split('/').some(k=>foods.includes(k)));if(i<0)break;let k=feeder[i].split('/').find(k=>foods.includes(k));result.push(k);feeder.splice(i,1)}return result}
function roundActions(p){return new Set(p.actions.slice(p.actions.length-used[players.indexOf(p)]))}
function power(p,op,b,depth=0){let m=b.rule;switch(m.kind){
   case 'none':break;case 'gain':gain(p,m.n,m.food);break;case 'sharedGain':gain(p,m.n,m.food);gain(op,m.n,m.food);break;case 'cache':b.cachedOn+=m.n;break;case 'egg':egg(p,m.n,m.target==='this'?b:null);break;
   case 'draw':pull(p,m.n);break;case 'sharedDraw':pull(p,m.n);pull(op,m.n);break;case 'drawDiscard':pull(p,m.n);p.delay.push(m.cost);break;
   case 'tuckDraw':if(tuckHand(p,b))pull(p,1);break;case 'tuckEgg':if(tuckHand(p,b))egg(p,1,b);break;case 'tuckGain':if(tuckHand(p,b))gain(p,m.n,m.food);break;
   case 'foodTuck':if(p.stock[m.food]&&deck.length+discard.length>=m.n){p.stock[m.food]--;tuckDeck(b,m.n)}break;case 'foodTuckMany':{let n=Math.min(m.n,p.stock[m.food],deck.length+discard.length);p.stock[m.food]-=n;tuckDeck(b,n);break}
   case 'diceCache':{let dice=5-feeder.length,yes=false;for(let i=0;i<dice;i++)if(roll().split('/').includes(m.food))yes=true;if(yes)b.cachedOn+=m.n;break}
   case 'predator':{let c=get();if(c){if(c.flightless||c.span<m.span){b.tuckedOn++;b.tuckedCards.push(c)}else discard.push(c)}break}
   case 'feederAll':{let n=feeder.filter(z=>z.split('/').includes(m.food)).length;feeder=feeder.filter(z=>!z.split('/').includes(m.food));gain(p,n,m.food);break}
   case 'feeder':gainFeeder(p,m.n,m.food,m.cache?b:null,true);break;
   case 'eggFood':if(p.board.some(z=>z!==b&&z.eggsOn>0)&&turns<22&&total(p.stock)<7){eggCost(p,1,b);gain(p,m.n,'any')}break;
   case 'eggDraw':if(eggs(p)>0&&p.hand.length<4&&turns<23){eggCost(p,1);pull(p,m.n)}break;
   case 'extraPlace':{let a=costOptions(p).filter(z=>z.h===(m.same?b.loc:m.hab)).sort((a,b)=>b.b.points-a.b.points)[0];if(a&&depth<8)place(p,op,a,depth);break}
   case 'distributedTuck':for(let z of pRow(p,b.loc))if(p.hand.length>(turns<20?1:0))tuckHand(p,z);break;
   case 'exchange':{let a=K.filter(k=>p.stock[k]>=2&&k!==want(p)).sort((a,b)=>p.stock[b]-p.stock[a])[0];if(a){p.stock[a]--;gain(p,1,want(p))}break}
   case 'bonusChoice':chooseBonus(p,2);break;
case 'bonusDraw':{chooseBonus(p,1);let a=[];for(let j=0;j<3;j++){let z=get();if(z)a.push(z)}a.sort((a,b)=>b.points-b.cost[0].length-a.points+a.cost[0].length);if(a.length)p.hand.push(a.shift());discard.push(...a);break}
case 'bonusFeeder':chooseBonus(p,1);gainFeeder(p,1,'any');break;
case 'checkFood':{let z=get();if(z){if(z.printedFoods[m.food]){gain(p,1,m.food);b.cachedOn++}discard.push(z)}break}
case 'steal':{let k=m.food==='any'?K.find(k=>op.stock[k]>0):m.food;if(k&&op.stock[k]>0){op.stock[k]--;if(m.cache)b.cachedOn++;else gain(p,1,k);gainFeeder(op,1,'any')}break}
case 'move':{let row=pRow(p,b.loc),h=b.hab.filter(h=>h!==b.loc&&pRow(p,h).length<5).sort((a,b)=>pRow(p,a).length-pRow(p,b).length)[0];if(row.at(-1)===b&&h&&pRow(p,h).length<row.length-1){let idx=pRow(p,h).length;b.loc=h;b.slotOrder=idx}break}
case 'moveEgg':{let row=pRow(p,b.loc),i=row.indexOf(b),z=[row[i-1],row[i+1]].find(z=>z&&z.eggsOn<z.capacity);if(z&&b.eggsOn>0){b.eggsOn--;z.eggsOn++;pull(p,1)}break}
case 'opFish':if(op.stock.fish>0)gain(p,1,'fish');break;
case 'duplicateFeeder':{let face=feeder.find((z,i)=>feeder.indexOf(z)!==i);if(face){let k=face.split('/').includes(want(p))?want(p):face.split('/')[0];feeder.splice(feeder.indexOf(face),1);gain(p,1,k)}break}
case 'predEgg':if(pRow(p,b.loc).some(z=>z!==b&&z.predator))egg(p,2,b);break;
case 'fiveFood':if(BASE.every(k=>p.stock[k]>0))b.cachedOn+=4;break;
case 'allEgg':if(H.every(h=>pRow(p,h).some(z=>z.eggsOn>=2)))egg(p,3,b);break;
case 'discardTuck':if(discard.length&&tuckHand(p,b))p.hand.push(discard.pop());break;
case 'allFoodTuck':if(total(p.stock)>0&&(total(p.stock)<=3||turns>=23)){for(let k of K)p.stock[k]=0;tuckDeck(b,3)}break;
case 'moreFood':if(total(p.stock)>total(op.stock))gainFeeder(p,1,'any');break;
case 'rowColTuck':tuckDeck(b,p.board.filter(z=>z!==b&&(z.loc===b.loc||z.slotOrder===b.slotOrder)).length);break;
case 'rowColEgg':for(let z of p.board.filter(z=>z.loc===b.loc||z.slotOrder===b.slotOrder))egg(p,1,z);break;
case 'removeSeed':if(feeder.length){feeder.shift();gain(p,1,'seed')}break;
case 'drawThenTuck':pull(p,1);tuckHand(p,b);break;
case 'oppEgg':egg(p,op.actions.slice(-used[players.indexOf(op)]).filter(k=>k==='egg').length,b);break;
case 'oppCache':b.cachedOn+=op.actions.slice(-used[players.indexOf(op)]).filter(k=>k==='egg').length;break;
case 'pinkCost':case 'pinkWhite':break;
case 'fewestDraw':if(pRow(p,m.hab).length<=pRow(op,m.hab).length)pull(p,1);if(pRow(op,m.hab).length<=pRow(p,m.hab).length)pull(op,1);break;
case 'nestEggAll':for(let z of p.board.filter(z=>z.nestType===m.nest||z.nestType==='wild'))egg(p,1,z);break;
case 'nestEggThis':egg(p,p.board.filter(z=>z!==b&&(z.nestType===m.nest||z.nestType==='wild')).length,b);break;
case 'drawTuck':tuckDeck(b,1);pull(p,1);break;
case 'chooseSharedFood':{let k=want(p);gain(p,1,k);gain(op,1,k);break}
case 'allTray':p.hand.push(...tray);tray=[];break;
case 'refreshTray':discard.push(...tray);tray=[];fill();if(tray.length)p.hand.push(tray.shift());break;
case 'resetGain':reset();gainFeeder(p,1,m.food,null,true);break;
case 'maxPredator':b.cachedOn+=Math.max(p.board.filter(z=>z.predator).length,op.board.filter(z=>z.predator).length);break;
case 'filterTray':{let c=tray.find(z=>z.hab.includes(m.hab));if(c){p.hand.push(c);tray=tray.filter(z=>z!==c)}break}
case 'sharedFeeder':gainFeeder(p,1,'any');gainFeeder(op,1,'any');break;
case 'emptyHabEgg':{let row=H.map(h=>pRow(p,h)).filter(z=>z.every(b=>!b.eggsOn)).sort((a,b)=>b.length-a.length)[0]||[];for(let z of row)egg(p,1,z);break}
case 'doubleGoal':case 'pinkGain':case 'pinkEgg9':case 'pinkPredator':case 'pinkTuck':case 'pinkEgg':case 'pinkPlay':break;
   
case 'emptyEggOne':{let z=p.board.find(z=>!z.eggsOn&&z.capacity>0);if(z)egg(p,1,z);break}
case 'columnEggOther':for(let z of p.board.filter(z=>z!==b&&z.slotOrder===b.slotOrder))egg(p,m.n,z);break;
case 'rowTuckEach':for(let z of pRow(p,m.hab))tuckDeck(z,1);break;
case 'wildCache':{let n=m.n;for(let k of BASE){let c=Math.min(n,p.stock[k]);p.stock[k]-=c;b.cachedOn+=c;n-=c}break}
case 'choiceSupply':{let k=m.foods.slice().sort((a,b)=>p.stock[a]-p.stock[b])[0];gain(p,1,k);break}
case 'tuckThenEgg':{let n=0;while(n<m.n&&p.hand.length>(turns<20?1:0)&&tuckHand(p,b))n++;if(n)egg(p,1,b);break}
case 'adjEgg':{let row=pRow(p,b.loc),i=row.indexOf(b);for(let z of [row[i-1],row[i+1]].filter(Boolean))egg(p,1,z);break}
case 'spanEgg':for(let z of p.board.filter(z=>z.span>m.span))egg(p,1,z);break;
case 'smallestTray':{let c=tray.slice().sort((a,b)=>a.span-b.span)[0];if(c){tray=tray.filter(z=>z!==c);b.tuckedOn++;b.tuckedCards.push(c)}break}
case 'seedTrayTuck':{let c=tray.slice().sort((a,b)=>a.points-b.points)[0];if(c&&p.stock.seed>0){p.stock.seed--;tray=tray.filter(z=>z!==c);b.tuckedOn++;b.tuckedCards.push(c)}break}
case 'columnEggOne':{let z=p.board.find(z=>z!==b&&z.slotOrder===b.slotOrder&&z.eggsOn<z.capacity);if(z)egg(p,1,z);break}
case 'drawKeepGive':{let a=[get(),get()].filter(Boolean).sort((a,b)=>b.points-a.points);if(a[0])p.hand.push(a[0]);if(a[1])op.hand.push(a[1]);break}
case 'tuckMany':for(let j=0;j<m.n&&p.hand.length>(turns<20?1:0);j++)tuckHand(p,b);break;
case 'drawTuckChoice':for(let j=0;j<m.n;j++){let c=get();if(c){if(turns>20||p.hand.length>=3){b.tuckedOn++;b.tuckedCards.push(c)}else p.hand.push(c)}}break;
case 'pinkDrawTuck':break;
case 'resetCacheAll':reset();b.cachedOn+=consumeFaces(m.foods).length;break;
case 'resetCacheOne':reset();b.cachedOn+=consumeFaces(m.foods,1).length;break;
case 'tuckThenGain':{let n=0;while(n<m.n&&p.hand.length>1&&tuckHand(p,b))n++;if(n)gain(p,1,m.food);break}
case 'draftThree':{let a=drawChoice(3);if(a.length)p.hand.push(a.shift());if(a.length)op.hand.push(a.shift());p.hand.push(...a);break}
case 'crossEggCache':for(let z of p.board.filter(z=>z!==b&&(z.loc===b.loc||z.slotOrder===b.slotOrder)&&z.eggsOn)){z.eggsOn--;b.cachedOn+=2}break;
case 'pinkFood':case 'pinkEggTuck':break;
case 'opFoodTuck':if(op.stock[m.food])tuckDeck(b,1);break;
case 'columnEggThis':egg(p,p.board.filter(z=>z!==b&&z.slotOrder===b.slotOrder&&z.eggsOn>0).length,b);break;
case 'bonusNest':chooseBonus(p,p.board.filter(z=>z.nestType===m.nest||z.nestType==='wild').length);break;
case 'bonusHab':chooseBonus(p,pRow(p,m.hab).length);break;
case 'allActions':if(roundActions(p).size===4){gain(p,1,'any');egg(p,1);pull(p,1)}break;
case 'allActionsGain':if(roundActions(p).size===4)gain(p,2,'any');break;
case 'absentFood':{let k=BASE.filter(k=>!feeder.some(f=>f.split('/').includes(k))).sort((a,b)=>p.stock[a]-p.stock[b])[0];if(k)gain(p,1,k);break}
case 'resetAbsentEgg':reset();if(!feeder.some(f=>f.split('/').includes(m.food)))egg(p,1,b);break;
case 'checkSeedFruit':{let c=get();if(c){let k=['seed','fruit'].find(k=>c.printedFoods[k]);if(k){gain(p,1,k);discard.push(c)}else tuckCard(b,c)}break}
case 'resetDrawTuck':reset();for(let j=0,n=feeder.filter(f=>f.split('/').includes(m.food)).length;j<n;j++){let c=get();if(c){if(turns>18||p.hand.length>3)tuckCard(b,c);else p.hand.push(c)}}break;
case 'nestEggTuck':{let z=p.board.filter(z=>z.nestType===m.nest||z.nestType==='wild').sort((a,b)=>b.eggsOn-a.eggsOn)[0];if(z){let n=z.eggsOn;z.eggsOn=0;tuckDeck(b,2*n)}break}
case 'drawThenTuckMany':pull(p,m.n);for(let j=0;j<m.n&&p.hand.length>1;j++)tuckHand(p,b);break;
case 'opHandDraw':if(op.hand.length>=2)pull(p,1);break;
case 'opEggDraw':egg(op,1);pull(p,m.n);break;
case 'foodPredator':{let c=get();if(c){if(m.foods.some(k=>c.printedFoods[k]))tuckCard(b,c);else discard.push(c)}break}
case 'resetChoice':reset();for(let k of consumeFaces(m.foods,1))gain(p,1,k);break;
case 'filledColumnEgg':for(let j=0;j<5;j++){let a=p.board.filter(z=>z.slotOrder===j);if(a.length===3){let z=a.find(z=>z.eggsOn<z.capacity);if(z)egg(p,1,z)}}break;
case 'discardFood':if(discard.at(-1)?.printedFoods[m.food])gain(p,1,m.food);break;
case 'choiceCache':for(let k of consumeFaces(m.foods,1)){if(turns>16)b.cachedOn++;else gain(p,1,k)}break;
case 'choiceFeeder':for(let k of consumeFaces(m.foods,1))gain(p,1,k);break;
case 'habEggDraw':{let a=drawChoice(pRow(p,m.hab).filter(z=>z.eggsOn).length);if(a.length)p.hand.push(a.shift());discard.push(...a);break}
case 'actionDraw':{let a=drawChoice(roundActions(p).size);if(a.length){let c=a.shift();if(turns>18)tuckCard(b,c);else p.hand.push(c)}discard.push(...a);break}
case 'habEggDrawTuck':pull(p,Math.floor(sum(pRow(p,m.hab).map(z=>z.eggsOn))/3));for(let j=0;j<2&&p.hand.length>1;j++)tuckHand(p,b);break;
case 'foodEgg':if(p.stock[m.food]>0&&b.eggsOn<b.capacity){p.stock[m.food]--;egg(p,1,b)}break;
case 'stockCache':{let n=Math.min(m.n,p.stock[m.food]);p.stock[m.food]-=n;b.cachedOn+=n;break}
case 'sharedNestEgg':for(let q of [p,op])for(let z of q.board.filter(z=>z.nestType===m.nest||z.nestType==='wild'))egg(q,1,z);break;
case 'drawReturn':{let a=drawChoice(2);if(a.length)p.hand.push(a.shift());deck.unshift(...a);break}
case 'habEggThis':egg(p,pRow(p,m.hab).filter(z=>z!==b).length,b);break;
case 'selfOtherEgg':egg(p,2,b);{let z=op.board.find(z=>(z.nestType==='ground'||z.nestType==='wild')&&z.eggsOn<z.capacity);if(z)egg(op,1,z)}break;
case 'sharedNectar':gain(p,1,'nectar');gain(op,1,'nectar');gain(p,1,'seed');break;
case 'diceEgg':{let yes=false;for(let j=0;j<5-feeder.length;j++)if(roll().split('/').includes(m.food))yes=true;if(yes)egg(p,1,b);break}
case 'splitFeeder':{let n=consumeFaces([m.food]).length;gain(p,Math.ceil(n/2),m.food);gain(op,Math.floor(n/2),m.food);break}
case 'printedEgg':for(let z of p.board.filter(z=>z.printedFoods[m.food]))egg(p,1,z);break;
case 'stealSupply':if(op.stock[m.food]>0){op.stock[m.food]--;gain(p,1,m.food);gain(op,1,'any')}break;
case 'rollCache':{let yes=false;for(let j=0;j<m.n;j++)if(roll().split('/').includes(m.food))yes=true;if(yes)b.cachedOn++;break}
case 'rowStockCache':for(let z of pRow(p,m.hab)){if(p.stock[m.food]<=0)break;p.stock[m.food]--;z.cachedOn++}break;
case 'habEggGain':{let n=Math.floor(sum(pRow(p,m.hab).map(z=>z.eggsOn))/3);for(let j=0;j<n;j++){if(turns>17&&j<2)b.cachedOn++;else gain(p,1,p.stock.seed<p.stock.worm?'seed':'worm')}break}
case 'resetGainAll':reset();gain(p,consumeFaces([m.food]).length,m.food);break;
case 'choiceFoodEgg':for(let j=0;j<m.n&&b.eggsOn<b.capacity;j++){let k=m.foods.find(k=>p.stock[k]>0);if(!k)break;p.stock[k]--;egg(p,1,b)}break;
case 'checkWorm':{let c=get();if(c){if(c.printedFoods.worm&&turns<18)p.hand.push(c);else{if(c.printedFoods.worm)egg(p,1,b);discard.push(c)}}break}
case 'leftEgg':egg(p,b.slotOrder,b);break;
case 'otherResetTuck':reset();gainFeeder(op,1,'seed',null,true);tuckDeck(b,2);break;
case 'sharedEggs':egg(p,4);egg(op,2);break;
case 'eggToFood':if(eggs(p)>0&&turns<20){eggCost(p,1);gain(p,1,m.food)}break;
default:throw Error('unsupported fixture rule '+m.kind)
  }}
  function snapshot(p,offer,bonusOffer,actor=seat,target=ui,targetDb=db){target.reset();let s=target.state(),as=(c,loc)=>({...targetDb.birds.find(z=>z.id===c.id),id:'c'+c.id,loc,slotOrder:c.slotOrder,eggsOn:c.eggsOn||0,cachedOn:c.cachedOn||0,tuckedOn:c.tuckedOn||0,catalogId:c.id});Object.assign(s,{r,t:used[actor]*2,first:r%2,phase:'play',stockKnown:true,roundKnown:true,ledgerKnown:true,setupMode:!!offer,oceania,stock:{...p.stock,eggs:eggs(p),nectar:p.stock.nectar||0},birds:[...p.board.map(c=>as(c,c.loc)),...(offer||p.hand).map(c=>as(c,'hand'))],selectedGoals:bonusOffer||[p.bonus,...p.extraBonus],roundGoals:goals.map(String),tray:[...tray.map(c=>c.id),null,null,null].slice(0,3),feeder:feeder.slice(),scores:[{},{}],v7RoundLog:{[r]:{count:used[actor],seen:[...new Set(p.actions.slice(-used[actor]))],playCount:p.actions.slice(-used[actor]).filter(k=>k==='play').length}}});return s}
  function baselineStart(p,off,bs){let keep=off.slice().sort((a,b)=>(b.points-b.cost[0].length+(b.color==='brown'?3:0))-(a.points-a.cost[0].length+(a.color==='brown'?3:0))).slice(0,2),stock=Object.fromEntries(K.map(k=>[k,0]));for(let k of BASE.slice().sort((a,b)=>sum(keep.map(c=>c.cost[0].filter(k=>k===b).length))-sum(keep.map(c=>c.cost[0].filter(k=>k===a).length))).slice(0,3))stock[k]=1;if(oceania)stock.nectar=1;return {keep:keep.map(c=>'c'+c.id),stock,goal:bs[0]}}
  for(let i=0;i<2;i++){let p=players[i],off=[];for(let j=0;j<5;j++)off.push(get());let bs=takeBonuses(2),start;if(i===seat){snapshot(p,off,bs);let t0=Date.now();start=ui.starterPlan();compute+=Date.now()-t0}else if(oppUI){snapshot(p,off,bs,i,oppUI,oppDb);start=oppUI.starterPlan()}else start=baselineStart(p,off,bs);if(!start)throw Error('missing startup');p.hand=off.filter(c=>start.keep.includes('c'+c.id));discard.push(...off.filter(c=>!p.hand.includes(c)));p.stock=Object.fromEntries(K.map(k=>[k,start.stock[k]||0]));p.bonus=start.goal;bonusDiscard.push(...bs.filter(z=>z!==p.bonus));if(p.hand.length+total(p.stock)!==(oceania?6:5))throw Error('invalid startup');if(i===seat)initial=costOptions(p).length}
  fill();reset();
  function baseline(p){let opts=costOptions(p).sort((a,b)=>{let val=z=>z.b.points+(turns<16&&z.b.color==='brown'?4:0)+(turns<16&&z.h==='forest'?2:0)-z.eg-total(z.pay)*.5;return val(b)-val(a)});if(turns>=21&&free(p)>0&&(!opts.length||opts[0].b.points-opts[0].eg<Math.min(free(p),Y.grass[pRow(p,'grass').length])))return {kind:'egg'};if(opts.length)return {kind:'play',candidate:'c'+opts[0].b.id,hab:opts[0].h};if(p.hand.length&&total(p.stock)<5)return {kind:'food',food:want(p)};if(free(p)>0&&eggs(p)<2&&p.hand.length)return {kind:'egg'};return {kind:'draw'}}
  function act(i){let p=players[i],op=players[1-i];p.pink.clear();p.delay=[];let advice;if(i===seat){snapshot(p);let before=Date.now();advice=ui.recommendation();compute+=Date.now()-before;decisionCount++}else if(oppUI){snapshot(p,null,null,i,oppUI,oppDb);advice=oppUI.recommendation()}else advice=baseline(p);let kind=advice.kind,placeOp=kind==='play'?costOptions(p).find(z=>'c'+z.b.id===advice.candidate&&z.h===advice.hab):null;if(kind==='play'&&!placeOp||!['play','food','egg','draw'].includes(kind)){if(i===seat)fallbacks++;advice=baseline(p);kind=advice.kind;placeOp=kind==='play'?costOptions(p).find(z=>'c'+z.b.id===advice.candidate&&z.h===advice.hab):null}
   let tuckedBefore=sum(p.board.map(z=>z.tuckedOn)),predBefore=sum(p.board.filter(z=>z.predator).map(z=>z.tuckedOn)),placed=null;
   if(kind==='play')placed=place(p,op,placeOp);
   else{let h=kind==='food'?'forest':kind==='egg'?'grass':'water',n=pRow(p,h).length;if(kind==='food')gainFeeder(p,Y[h][n],advice.food||want(p));else if(kind==='egg')egg(p,Y.grass[n]);else{let count=Y[h][n],wanted=advice.card||String(advice.note||'').match(/Если карта ещё открыта: (.+?)\./)?.[1],c=tray.find(z=>z.name===wanted);if(c){p.hand.push(c);tray=tray.filter(z=>z!==c);count--}pull(p,count)}for(let b of pRow(p,h).slice().reverse())if(b.color==='brown')power(p,op,b)}
   for(let n of p.delay)for(let j=0;j<n;j++){let c=discardHand(p);if(c)discard.push(c)}
   for(let b of op.board.filter(z=>z.color==='pink'&&!op.pink.has(z.id))){let m=b.rule,usedPower=false;if(m.kind==='pinkFood'&&kind==='food'){let n=consumeFaces([m.food],1).length;if(n){gain(op,n,m.food);usedPower=true}}if(m.kind==='pinkEggTuck'&&kind==='egg'&&tuckHand(op,b))usedPower=true;if(m.kind==='pinkDrawTuck'&&sum(p.board.map(z=>z.tuckedOn))>tuckedBefore){pull(op,1);usedPower=true}if(m.kind==='pinkTuck'&&sum(p.board.map(z=>z.tuckedOn))>tuckedBefore){tuckDeck(b,1);usedPower=true}if(m.kind==='pinkEgg'&&kind==='egg'){let target=op.board.find(z=>z!==b&&z.eggsOn<z.capacity&&(m.nests.includes(z.nestType)||z.nestType==='wild'));if(target){egg(op,1,target);usedPower=true}}if(m.kind==='pinkPlay'&&placed?.loc===m.hab&&tuckHand(op,b))usedPower=true;if(m.kind==='pinkGain'&&placed?.loc===m.hab){gain(op,1,m.food);usedPower=true}if(m.kind==='pinkEgg9'&&kind==='egg'){let target=op.board.find(z=>(!m.other||z!==b)&&z.eggsOn<z.capacity&&(z.nestType===m.nest||z.nestType==='wild'));if(target){egg(op,1,target);usedPower=true}}if(m.kind==='pinkPredator'&&sum(p.board.filter(z=>z.predator).map(z=>z.tuckedOn))>predBefore){gainFeeder(op,1,'any');usedPower=true}if(m.kind==='pinkCost'&&placed&&Math.min(...placed.cost.map(a=>a.length))===3){pull(op,1);usedPower=true}if(m.kind==='pinkWhite'&&placed?.color==='white'){gainFeeder(op,1,'any');usedPower=true}if(usedPower)op.pink.add(b.id)}
   p.actions.push(kind);used[i]++;fill();let bonuses=[...bonusDeck,...bonusDiscard,...players.flatMap(p=>[p.bonus,...p.extraBonus])];if(bonuses.length!==BON.length||new Set(bonuses).size!==BON.length)throw Error('bonus conservation');for(let q of players){if(Object.values(q.stock).some(n=>n<0)||H.some(h=>pRow(q,h).length>5)||q.board.some(b=>b.eggsOn<0||b.eggsOn>b.capacity||b.tuckedCards.length!==b.tuckedOn))throw Error('state invariant')};
   let live=[...deck,...discard,...tray,...players.flatMap(q=>[...q.hand,...q.board,...q.board.flatMap(b=>b.tuckedCards)])];if(live.length!==fixture.length||new Set(live.map(c=>c.id)).size!==live.length)throw Error('card conservation');time++;ri=0
  }
  function metric(p,id){let count=f=>sum(p.board.filter(f).map(b=>b.rule.kind==='doubleGoal'?2:1));return id>=2000&&id<=2002?count(b=>b.loc===H[id-2000]):id===2003?Math.max(...H.map(h=>count(b=>b.loc===h))):id===2005?count(b=>b.points>4):id===2008?p.hand.length:id===2020?count(b=>b.color==='brown'):count(()=>true)}
  for(r=0;r<4;r++){used=[0,0];for(let t=0;t<L[r];t++,turns++){let first=r%2;act(first);act(1-first)}for(let i of [r%2,1-r%2])for(let b of players[i].board.filter(b=>b.color==='teal'))power(players[i],players[1-i],b);if(oceania)for(let p of players)p.stock.nectar=0;let a=metric(players[0],goals[r]),b=metric(players[1],goals[r]);if(a===b&&a>0){players[0].round+=Math.floor((4+r+1+r)/2);players[1].round+=Math.floor((4+r+1+r)/2)}else if(a!==b){players[a>b?0:1].round+=4+r;if(Math.min(a,b)>0)players[a>b?1:0].round+=1+r}discard.push(...tray);tray=[];fill()}
  for(let i=0;i<2;i++)for(let b of players[i].board.filter(z=>z.color==='yellow'))power(players[i],players[1-i],b);
  let nectarScore=p=>oceania?sum(H.map(h=>{let a=p.spent[h],b=players.find(q=>q!==p).spent[h];return a===0?0:a>b?5:a===b?3:2})):0;let score=p=>nectarScore(p)+sum(p.board.map(b=>b.points+b.eggsOn+b.cachedOn+b.tuckedOn))+p.round+scoreBonus(p)+sum(p.extraBonus.map(z=>scoreBonus(p,z))),p=players[seat],o=players[1-seat],own=score(p),other=score(o);return {seed,oceania,nectarScore:nectarScore(p),spent:p.spent,score:own,opponent:other,win:own>other?1:own<other?0:total(p.stock)>total(o.stock)?1:total(p.stock)<total(o.stock)?0:.5,ms:compute,decisions:decisionCount,fallbacks,initialAffordable:initial,board:p.board.length,combo:sum(p.board.map(b=>b.cachedOn+b.tuckedOn)),turns:p.actions.length}
 }
 return versions.map(v=>({version:v.version,cases:seeds.map(seed=>run(v,seed))}))
}


const assert=require('node:assert/strict'),fixture=JSON.parse(fs.readFileSync('tests/wingspan/v11-expansions-fixture.json','utf8')),html=fs.readFileSync('public/wingspan/index.html','utf8'),db=JSON.parse(fs.readFileSync('public/wingspan/cards.json','utf8')),old='3f6d8d4622cad5fd456ca505c28171bcc6baf667',oldHtml=execFileSync('git',['show',old+':public/wingspan/index.html'],{encoding:'utf8',maxBuffer:4e6}),oldDb=JSON.parse(execFileSync('git',['show',old+':public/wingspan/cards.json'],{encoding:'utf8',maxBuffer:4e6}));
const versions=[{version:11,html:oldHtml,db:oldDb},{version:12,html,db}],mode=process.argv[2]||'base',oceania=mode.startsWith('oceania'),strong=mode.endsWith('strong'),chunk=Number(process.argv[3]||0),seeds=Array.from({length:6},(_,i)=>20321101+(oceania?10000:0)+(strong?1000:0)+chunk*6+i),results=competitive(versions,mock,fixture,seeds,strong?versions[0]:null,oceania);
for(let v of results)for(let c of v.cases){assert.equal(c.turns,26);assert.equal(c.decisions,26);assert(Number.isFinite(c.score));assert.equal(c.fallbacks,0)}
console.log(JSON.stringify({mode,chunk,results}));