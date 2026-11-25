const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const source=fs.readFileSync('tests/wingspan/strategy-v5.cjs','utf8');
const baseMock=source.slice(source.indexOf('function mock'),source.indexOf('const assert='));
const mock=new Function(baseMock+'\nreturn mock')();
const modernMock=new Function(baseMock.replace('return {state:()=>S','return {v7State,v7Atomic,v7PlaceOptions,v7RoundPoints,v7RoundKnown,v7RoundSeen,v7CardMatches,v7Targets,v7NeedsLedger,starterPlan,v6Targets,v6Choice,v6Options,v6StaticBonus,v6RoundGoal,v6StarterJoint,v6Faces,v6ExtraSim,roundGoalMetric,foodChance,state:()=>S')+'\nreturn mock')();
const verify=new Function(source.slice(source.indexOf('function verify'),source.indexOf('const root='))+'\nreturn verify')();
const old6=fs.readFileSync('tests/wingspan/strategy-v6.cjs','utf8');const v6Checks=new Function(old6.slice(old6.indexOf('function v6Checks'),old6.indexOf('console.log(JSON.stringify(v6Checks')).replace('length===296','length>=296')+'\nreturn v6Checks')();

function v7Checks(html,db,mock){
 const assert=(v,msg)=>{if(!v)throw Error(msg)},b=mock(html,db),{ui,map}=b,passed=[];
 const fresh=(names,stock={},r=3,t=8)=>{ui.reset();let s=ui.state();Object.assign(s,{r,t,first:r%2,phase:'play',stockKnown:true,roundKnown:true,ledgerKnown:true,selectedGoals:[],stock:{worm:0,seed:0,fish:0,fruit:0,rodent:0,nectar:0,eggs:0,...stock},birds:names.map(([name,loc,extra],i)=>{let q=db.birds.find(z=>z.name===name);if(!q)throw Error(name);return {...q,id:'b'+i,loc,eggsOn:0,tuckedOn:0,cachedOn:0,...extra}})});return s};
 const el=()=>map.get('actionBody'),button=(name)=>{let e=el().children.find(x=>String(x.textContent).includes(name));if(!e)throw Error('missing '+name+' / '+el().children.map(x=>x.textContent).join('|'));if(e.disabled)throw Error('disabled '+name);e.onclick()},cancel=()=>map.get('cancelAction').onclick(),all=(str)=>el().children.filter(x=>String(x.textContent).includes(str)),card=(n)=>db.birds.find(x=>x.name===n);
 assert(db.version===7&&db.birds.length===707&&db.birds.filter(x=>['guided','deterministic'].includes(x.mechanic.mode)).length===520,'catalog coverage');passed.push('catalog coverage');
 let s=fresh([['Crested Lark','grass']],{seed:1});ui.setWizard(s.birds[0]);button('-1 Seed');assert(s.stock.seed===0&&s.stock.eggs===1&&s.birds[0].eggsOn===1,'atomic debit');cancel();assert(s.stock.seed===1&&s.stock.eggs===0,'atomic rollback');s.stock.seed=0;ui.setWizard(s.birds[0]);assert(!all('-1 Seed').length,'cannot pay');button('Нет допустимого действия');assert(s.stock.eggs===0,'no free effect');cancel();passed.push('atomic cost, capacity and rollback');
 s=fresh([['European Shag','water'],['Northern Flicker','hand']]);ui.setWizard(s.birds[0]);button('Подложить Northern Flicker');assert(s.stock.fish===1&&s.scores[0].tucked===1&&s.birds[1].loc==='discard','hand + gain');cancel();assert(s.birds[1].loc==='hand'&&s.stock.fish===0,'hand rollback');passed.push('composed hand and food operations');
 s=fresh([['Ruff','water'],['Ruddy Duck','hand'],['American Coot','hand']]);ui.setWizard(s.birds[0]);let picks=el().children.filter(x=>x.children.some(y=>y.type==='checkbox'));picks[0].children[0].checked=true;button('Подложить выбранные');assert(s.scores[0].tucked===1,'repeat tuck');assert(all('Подтвердить 1 карт')[0].disabled,'draw identity required');ui.addDuringAction(card('Northern Flicker'));button('Подтвердить 1 карт');assert(s.birds.some(x=>x.name==='Northern Flicker'&&x.loc==='hand'),'draw recorded');cancel();assert(s.birds.length===3&&!s.scores[0].tucked,'sequence rollback');passed.push('variable hand choice then exact draw');
 s=fresh([['Common Eider','water',{eggsOn:1}],['Dickcissel','grass']],{eggs:1});ui.setWizard(s.birds[0]);button('Common Eider → Dickcissel');assert(s.stock.eggs===1&&s.birds[0].eggsOn===0&&s.birds[1].eggsOn===1,'egg transfer');ui.addDuringAction(card('Northern Flicker'));button('Подтвердить 1 карт');cancel();assert(s.birds[0].eggsOn===1&&s.birds[1].eggsOn===0,'egg transfer rollback');passed.push('egg transfer and dependent draw');
 s=fresh([['Australian Reed Warbler','water'],['Ruddy Duck','hand']],{worm:1});ui.setWizard(s.birds[0]);button('Ruddy Duck');assert(s.wizard.queue[1].v7Egg===0,'discount queued');button('Птица выложена');assert(s.stock.worm===0&&s.birds[1].loc==='water'&&s.stock.eggs===0,'discounted placement');cancel();assert(s.stock.worm===1&&s.birds[1].loc==='hand','placement rollback');passed.push('discounted extra placement and rollback');
 s=fresh([['Goldcrest','forest'],['Ruddy Duck','hand']],{worm:1});ui.setWizard(s.birds[0]);assert(!all('Сбросить Ruddy Duck').length,'no legal follow-up place');button('Нет допустимого действия');assert(s.birds[1].loc==='hand','no premature discard');cancel();passed.push('compound preflight blocks pointless payment');
 s=fresh([['Brahminy Kite','grass']]);ui.setWizard(s.birds[0]);button('Есть подходящая грань');button('Нет · потерять');assert(!s.scores[0].cached,'risk failure all lost');cancel();ui.setWizard(s.birds[0]);button('Есть подходящая грань');button('Остановиться');assert(s.scores[0].cached===1,'risk cashout');cancel();passed.push('risk sequence loss and stop');
 s=fresh([['Green Bee-Eater','forest']]);s.tray=[card('Northern Flicker').id,card('Crested Pigeon').id,null];ui.setWizard(s.birds[0]);assert(all('Подложить Northern Flicker').length===1&&!all('Подложить Crested Pigeon').length,'tray condition');button('Подложить Northern Flicker');assert(s.tray[0]===null&&s.scores[0].tucked===1,'tray consumed');cancel();assert(s.tray[0]===card('Northern Flicker').id,'tray rollback');passed.push('filtered tray and rollback');
 s=fresh([['Common Chaffinch','forest'],['Carolina Chickadee','forest'],['Ruddy Duck','hand'],['American Coot','hand']]);ui.setWizard(s.birds[0]);picks=el().children.filter(x=>x.children.some(y=>y.type==='checkbox'));assert(picks.length===4,'two targets + two cards');picks.forEach(z=>z.children[0].checked=true);button('Подтвердить выбор птиц');assert(s.birds[0].tuckedOn===1&&s.birds[1].tuckedOn===1&&s.scores[0].tucked===2,'distributed');cancel();assert(s.birds.every(z=>!z.tuckedOn),'distributed rollback');passed.push('distributed effects and exact targets');
 s=fresh([['Gray Wagtail','forest']]);s.v7RoundLog={3:{count:4,seen:['food','egg','draw','play'],playCount:1}};assert(ui.v7RoundKnown(),'known history');ui.setWizard(s.birds[0]);button('+1 Seed · +1 Seed');assert(s.stock.seed===2,'round condition');cancel();assert(s.stock.seed===0&&ui.v7RoundSeen().length===4,'round snapshot');assert(JSON.stringify(ui.v7RoundPoints(0,3,3,'green',2000))==='[2,2]','tie');assert(JSON.stringify(ui.v7RoundPoints(3,5,0,'green',2000))==='[7,0]','zero opponent');assert(JSON.stringify(ui.v7RoundPoints(2,13,26,'blue',2050))==='[2,5]','blue cap');passed.push('round history, scoring and ties');
 s=fresh([['Brown Falcon','forest']]);ui.setWizard(s.birds[0]);let input=el().children.find(z=>z.type==='search');input.value='Northern Flicker';input.oninput();let results=el().children.find(z=>z.children.some(y=>y.textContent==='Northern Flicker'));results.children.find(z=>z.textContent==='Northern Flicker').onclick();button('Подтвердить результат');button('+1 подкладок');assert(s.scores[0].tucked===1&&s.birds.some(z=>z.name==='Northern Flicker'&&z.loc==='discard'),'deck identity');cancel();passed.push('observed deck condition and exact result');
 s=fresh([['Grassland Sparrow','grass']],{seed:3});ui.setWizard(s.birds[0]);let box=el().children.find(z=>z.className==='action-fields');box.children[0].children[0].value=2;button('Подтвердить расход');assert(s.stock.seed===1&&s.stock.eggs===2,'variable cost');cancel();passed.push('variable resource exchange');
 s=fresh([['Crested Lark','grass']],{seed:1});let x=ui.v7State(),y=ui.simPower(x,s.birds[0],'brown');assert(y.stock.eggs===1&&y.stock.seed===0&&s.stock.seed===1,'pure simulation');passed.push('pure projection');
 return passed
}

/* Independent controlled replay, not a full rules implementation.
   Real 26-turn schedules; shuffled named deck and common per-turn feeder streams.
   Opponent is an exogenous feeder reset, no round competition. All scoring and
   effects below are independent of app projection and identical across versions. */
function benchmark(versions,mock,seeds=[17,71,2026]){
 const K=['worm','seed','fish','fruit','rodent'],H=['forest','grass','water'],rounds=[8,7,6,5],faces=['worm','seed','worm/seed','fish','fruit','rodent'];
 const names=['Carolina Chickadee','Blue-Gray Gnatcatcher','Northern Cardinal','American Robin','Barn Swallow','American Coot','Mallard','Chipping Sparrow','Mourning Dove','California Quail','American Goldfinch','Eastern Phoebe','American Kestrel','Crested Lark','European Shag','Common Chaffinch','Red Junglefowl','Red-Vented Bulbul','Purple Finch','House Sparrow','Common Swift','Crested Pigeon','Eastern Meadowlark','House Wren','Baya Weaver','American Flamingo','Scaly-Breasted Munia','Dickcissel','Common Iora','Red-Legged Partridge'];
 function rng(seed){let z=seed>>>0;return ()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296}}
 function shuffle(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function pay(b,stock){let best=null,value=Infinity;for(let a of b.cost){function run(i,s,spent){if(i===a.length){let n=Object.values(spent).reduce((x,y)=>x+y,0);if(n<value){value=n;best=spent}return}let k=a[i],choices=k==='any'?K.map(f=>[f]):[[k],...K.flatMap((x,j)=>K.slice(j).map(y=>[x,y]))];for(let fs of choices){let z={...s},u={...spent};if(fs.some(f=>{z[f]--;u[f]=(u[f]||0)+1;return z[f]<0}))continue;run(i+1,z,u)}}run(0,stock,{})}return best}
 const effects=new Set(names);
 function replay(v,seed){
  let full=v.db,db={...full,birds:full.birds.filter(b=>effects.has(b.name))};if(db.birds.length!==names.length)throw Error('benchmark fixture missing cards');
  let ui=mock(v.html,db).ui,random=rng(seed),deck=shuffle(names,random).map(n=>db.birds.find(b=>b.name===n)),foodRolls=Array.from({length:26},()=>Array.from({length:50},()=>faces[Math.floor(random()*6)])),oppRolls=Array.from({length:26},()=>random()<.4);
  let stock=Object.fromEntries(K.map(k=>[k,0])),birds=[],tray=[],discard=[],round=0,turn=0,playedKinds=[],actions=[],fallbacks=0,roll=[],rollIndex=0;stock.eggs=0;stock.nectar=0;
  const make=(b,loc)=>({...b,id:'c'+b.id,loc,eggsOn:0,tuckedOn:0,cachedOn:0}),row=h=>birds.filter(b=>b.loc===h).sort((a,b)=>(a.slotOrder??0)-(b.slotOrder??0)),board=()=>birds.filter(b=>H.includes(b.loc)),hand=()=>birds.filter(b=>b.loc==='hand'),eggTotal=()=>board().reduce((s,b)=>s+b.eggsOn,0),free=b=>b.capacity-b.eggsOn,food=n=>{stock[n]++},capacity=()=>board().reduce((s,b)=>s+free(b),0);
  function pull(n){for(let i=0;i<n&&deck.length;i++)birds.push(make(deck.shift(),'hand'))}
  function fill(){while(tray.length<3&&deck.length)tray.push(deck.shift())}
  function putEgg(target,n=1){let m=Math.min(n,free(target));target.eggsOn+=m;stock.eggs+=m}
  function eggs(n,targets=board()){for(let i=0;i<n;i++){let a=targets.filter(b=>free(b)>0).sort((x,y)=>((y.loc==='grass'?1:0)+(y.eggsOn?0:1))-((x.loc==='grass'?1:0)+(x.eggsOn?0:1))||free(y)-free(x));if(!a.length)break;putEgg(a[0])}}
  function consumeEgg(n){for(let i=0;i<n;i++){let b=board().filter(b=>b.eggsOn>0).sort((x,y)=>y.eggsOn-x.eggsOn)[0];if(!b)throw Error('missing egg');b.eggsOn--;stock.eggs--}}
  function discardCard(b){b.loc='discard'}
  function tuck(b,n=1){for(let i=0;i<n&&hand().length;i++){let c=hand().slice().sort((a,z)=>a.points-z.points||a.id.localeCompare(z.id))[0];discardCard(c);b.tuckedOn++}}
  function deckTuck(b,n){let take=Math.min(n,deck.length);for(let i=0;i<take;i++)discard.push(make(deck.shift(),'discard'));b.tuckedOn+=take}
  function playOptions(){return hand().flatMap(b=>b.hab.filter(h=>row(h).length<5).map(h=>({b,h,cost:pay(b,stock),eg:[0,1,1,2,2][row(h).length]}))).filter(a=>a.cost&&stock.eggs>=a.eg)}
  function play(a){if(!a||!a.cost||a.eg>stock.eggs)throw Error('illegal play');for(let [k,n] of Object.entries(a.cost)){if(stock[k]<n)throw Error('overdraw');stock[k]-=n}consumeEgg(a.eg);a.b.loc=a.h;let max=Math.max(-1,...row(a.h).filter(b=>b.id!==a.b.id).map(b=>b.slotOrder??0));a.b.slotOrder=max+1;if(a.b.name==='American Goldfinch')stock.seed+=3;if(a.b.name==='House Wren'){let c=playOptions().filter(x=>x.h===a.h).sort((x,y)=>y.b.points-x.b.points)[0];if(c)play(c)}}
  function power(b,phase){let n=b.name;if(phase==='teal'){if(n==='House Sparrow'||n==='Common Swift'){let k=n==='House Sparrow'?'seed':'worm',a=Math.min(5,stock[k],deck.length);stock[k]-=a;deckTuck(b,a)}return}
   if(phase==='yellow'){if(n==='Crested Pigeon'){let a=Math.min(8,stock.seed);stock.seed-=a;b.cachedOn+=a}return}
   if(phase==='pink')return;
   if(b.color!=='brown')return;
   if(n==='Carolina Chickadee')b.cachedOn++;
   else if(n==='Blue-Gray Gnatcatcher'||n==='Eastern Phoebe')stock.worm++;
   else if(n==='Northern Cardinal')stock.fruit++;
   else if(['American Robin','Barn Swallow','American Coot'].includes(n)){if(hand().length){tuck(b);pull(1)}}
   else if(n==='Mallard')pull(1);
   else if(n==='Chipping Sparrow')eggs(1);
   else if(n==='Mourning Dove'||n==='California Quail')putEgg(b,1);
   else if(n==='American Kestrel'){let dice=Math.max(0,5-roll.length);for(let i=0;i<dice;i++)if((rollStream()[0]||'').split('/').includes('rodent')){b.cachedOn++;break}}
   else if(n==='Crested Lark'){if(stock.seed&&free(b)>0){stock.seed--;putEgg(b,1)}}
   else if(n==='European Shag'){if(hand().length>1||turn>=23&&hand().length){tuck(b);stock.fish++}}
   else if(n==='Common Chaffinch'){let a=Math.min(row(b.loc).length,Math.max(0,hand().length-1)+(turn>=23?1:0));for(let p of row(b.loc).slice(0,a))tuck(p)}
   else if(n==='Red Junglefowl'){if(stock.eggs<6)putEgg(b,1)}
   else if(n==='Red-Vented Bulbul'){if(stock.fruit)putEgg(b,1)}
   else if(n==='Purple Finch'){pull(1);tuck(b)}
   else if(n==='Eastern Meadowlark')putEgg(b,2);
   else if(n==='Baya Weaver'){let a=Math.min(3,Math.max(0,hand().length-1)+(turn>=23?1:0));if(a){tuck(b,a);putEgg(b,1)}}
   else if(n==='American Flamingo'){let a=Math.min(2,Math.max(0,hand().length-1)+(turn>=23?1:0));if(a){tuck(b,a);stock.worm++}}
   else if(n==='Scaly-Breasted Munia'){if(turn<14&&stock.seed<3)stock.seed++;else deckTuck(b,1)}
   else if(n==='Dickcissel'){if(hand().length){tuck(b);putEgg(b,1)}}
   else if(n==='Common Iora'){let col=row(b.loc).indexOf(b),a=H.filter(h=>h!==b.loc).map(h=>row(h)[col]).filter(x=>x&&free(x)>0);if(a.length)putEgg(a[0],1)}
   else if(n==='Red-Legged Partridge'){let col=row(b.loc).indexOf(b);for(let h of H){let a=row(h)[col];if(a)putEgg(a,1)}}
   else throw Error('unhandled brown '+n)
  }
  function rollStream(){return [foodRolls[turn][rollIndex++%50]]}
  function reroll(){roll=Array.from({length:5},()=>rollStream()[0])}
  function gainFood(n,wanted){for(let i=0;i<n;i++){if(!roll.length)reroll();let same=roll.every(x=>x===roll[0]);if(same&&wanted&&!roll.some(x=>x.split('/').includes(wanted)))reroll();let scores={};for(let k of K)scores[k]=hand().reduce((s,b)=>s+b.cost[0].filter(f=>f===k).length,0)-(stock[k]||0)*.5;let opt=roll.flatMap((f,j)=>f.split('/').map(k=>({k,j,v:k===wanted?100:scores[k]}))).sort((a,b)=>b.v-a.v)[0];if(!opt)break;stock[opt.k]++;roll.splice(opt.j,1)}}
  pull(3);stock.worm=1;stock.seed=1;fill();
  for(let r=0;r<4;r++){round=r;playedKinds=[];for(let t=0;t<rounds[r];t++,turn++){
    rollIndex=0;reroll();let s=ui.state();ui.reset();s=ui.state();Object.assign(s,{r,t:t*2,first:r%2,phase:'play',stockKnown:true,roundKnown:true,ledgerKnown:true,setupMode:false,stock:{...stock},birds:[...birds,...discard].map(b=>({...b})),tray:[...tray.map(b=>b.id),null,null,null].slice(0,3),feeder:roll.slice(),selectedGoals:['Bird Counter'],v7RoundLog:{[r]:{count:t,seen:[...new Set(playedKinds)],playCount:playedKinds.filter(k=>k==='play').length}}});
    let advice=ui.recommendation(),p=ui.projectGame(),kind=advice.kind,h=advice.hab,action=kind,choice=kind==='play'?playOptions().find(x=>x.b.id===advice.candidate&&x.h===h):null;
    if(kind==='play'&&!choice){fallbacks++;kind='draw'}
    if(kind==='play')play(choice);
    else if(kind==='egg'){eggs([2,2,3,3,4,4][row('grass').length]);for(let b of row('grass').slice().reverse())power(b,'brown')}
    else if(kind==='food'){gainFood([1,1,2,2,3,3][row('forest').length],advice.food||p?.steps[0]?.food);for(let b of row('forest').slice().reverse())power(b,'brown')}
    else {kind='draw';let n=[1,1,2,2,3,3][row('water').length],wanted=advice.card||p?.steps[0]?.card;let target=tray.find(b=>b.name===wanted);if(target){birds.push(make(target,'hand'));tray=tray.filter(b=>b!==target);n--}pull(n);for(let b of row('water').slice().reverse())power(b,'brown')}
    if(oppRolls[turn]){ /* fixed opponent event; benchmark cards have no pink power */ }
    fill();playedKinds.push(kind);actions.push(kind);
    if(stock.eggs!==eggTotal()||board().some(b=>b.eggsOn<0||b.eggsOn>b.capacity)||Object.values(stock).some(n=>n<0)||H.some(h=>row(h).length>5))throw Error('independent replay invariant');
   }
   for(let b of board())power(b,'teal');
  }
  for(let b of board())power(b,'yellow');
  let categories={birds:board().reduce((s,b)=>s+b.points,0),eggs:stock.eggs,tucked:board().reduce((s,b)=>s+b.tuckedOn,0),cached:board().reduce((s,b)=>s+b.cachedOn,0),bonus:2*board().filter(b=>b.qualifies.includes('Bird Counter')).length};
  return {seed,score:Object.values(categories).reduce((a,b)=>a+b,0),categories,turns:actions.length,actions:actions.reduce((o,k)=>(o[k]=(o[k]||0)+1,o),{}),fallbacks}
 }
 return versions.map(v=>{let cases=seeds.map(s=>replay(v,s));return {version:v.version,cases,mean:cases.reduce((s,c)=>s+c.score,0)/cases.length}})
}
const versions=['ebb4a6f10b27bbc82b62bd1f650cebb63c3c4b7f','7daf3f381fcf86cea5ba38d004f88d48a8295a3b',null].map((ref,i)=>({version:i+5,html:ref?execFileSync('git',['show',ref+':public/wingspan/index.html'],{encoding:'utf8'}):fs.readFileSync('public/wingspan/index.html','utf8'),db:JSON.parse(ref?execFileSync('git',['show',ref+':public/wingspan/cards.json'],{encoding:'utf8'}):fs.readFileSync('public/wingspan/cards.json','utf8'))}));
const v=versions[2];const reg=v6Checks(v.html,v.db,versions[0].html,versions[0].db,modernMock,verify);console.log(JSON.stringify({v5:reg.baseline,v6:reg.passed,v7:v7Checks(v.html,v.db,modernMock),benchmark:benchmark(versions,mock,[17,71,2026,19,43,113,7,29,101,311,809,1729])},null,2));
