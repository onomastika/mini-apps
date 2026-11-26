'use strict';
// Exact-prefix intervention audit at actual mandatory card-selection calls.
// Does not assume the activation itself is optional. A tucked card stays tucked;
// discarded cards follow independent simulator rules (including recycling).
function interventionFactory(html,db,mockSource,simSource,fixture,oceania){
 const mock=new Function(mockSource.slice(mockSource.indexOf('function mock'),mockSource.indexOf('const assert=')).replace('return {state:()=>S','return {starterPlan,strategicValue,valuePreview,state:()=>S')+'\nreturn mock')();
 let src=simSource.slice(simSource.indexOf('function competitive'),simSource.indexOf('\n\nconst assert='));
 const patch=(a,b)=>{if(src.split(a).length!==2)throw Error('anchor changed: '+a);src=src.replace(a,b)};
 patch('function run(v,seed){','function run(v,seed,request={}){let choices=[],ordinal=0,active=-1,applied=false;');
 patch("ui=mock(v.html,db).ui,oppDb=","ui=request.capture?mock(v.html,db).ui:null,oppDb=");
 patch("if(i===seat){snapshot(p,off,bs);let t0=Date.now();start=ui.starterPlan();compute+=Date.now()-t0}else if(oppUI)","if(i===seat){start=baselineStart(p,off,bs)}else if(oppUI)");
 patch("if(i===seat){snapshot(p);let before=Date.now();advice=ui.recommendation();compute+=Date.now()-before;decisionCount++}else if(oppUI)","if(i===seat){advice=baseline(p);decisionCount++}else if(oppUI)");
 patch("function act(i){let p=","function act(i){active=i;let p=");
 patch("time++;ri=0","time++;ri=0;active=-1");
 patch("function discardHand(p){","function discardHand(p,context='discard'){");
 patch("function tuckHand(p,b){let c=discardHand(p);","function tuckHand(p,b){let c=discardHand(p,'tuck');");
 patch("let c=p.hand.slice().sort((a,b)=>a.points-b.points||a.id-b.id)[0];p.hand=p.hand.filter(b=>b.id!==c.id);return c",`let c=p.hand.slice().sort((a,b)=>a.points-b.points||a.id-b.id)[0];
 if(p===players[seat]&&p.hand.length>1){
   const index=ordinal++;
   if(request.capture){
     snapshot(p);const s=ui.state(),left=L[r]-used[seat]-(active===seat?1:0);
     s.t=Math.min(2*L[r],2*(used[seat]+(active===seat?1:0)));
     const ratings=s.birds.filter(b=>b.loc==='hand').map(b=>{const q=ui.valuePreview(b).rating,d=ui.strategicValue(b,'keep',true).rating;return {id:b.catalogId,quick:q,deep:d,blend:Math.round(Math.max(d,.6*q)*10)/10}});
     // A separate independent one-step option heuristic. It uses legal placement
     // and incremental printed/bonus value, not the application's forecast.
     const options=costOptions(p).map(a=>({id:a.b.id,value:a.b.points-a.eg+scoreBonus({...p,board:[...p.board,{...a.b,loc:a.h}]})-scoreBonus(p)}));
     const goal=goals[r],own=metric(p,goal),other=metric(players[1-seat],goal);
     choices.push({index,round:r,used:used[seat],left,context,goal,own,other,baseline:c.id,hand:p.hand.map(b=>({id:b.id,name:b.name,points:b.points,static:b.points+(b.color==='brown'?3:0)-Math.min(...b.cost.map(z=>z.length)),option:Math.max(0,...options.filter(a=>a.id===b.id).map(a=>a.value))})),ratings});
   }
   if(index===request.index&&request.remove!=null){
     c=p.hand.find(b=>b.id===request.remove);if(!c)throw Error('intervention not in identical prefix');
     if(context!==request.context)throw Error('intervention context changed');
     applied=true;
     random=rng(request.futureSeed);deck=shuffle(deck,random);bonusDeck=shuffle(bonusDeck,random);
     for(let j=time+1;j<rolls.length;j++)rolls[j]=Array.from({length:100},()=>F[Math.floor(random()*6)]);
   }
 }
 p.hand=p.hand.filter(b=>b.id!==c.id);return c`);
 patch("return {seed,oceania,nectarScore:","if(request.remove!=null&&!applied)throw Error('intervention not applied');return {choices,seed,oceania,nectarScore:");
 patch("return versions.map(v=>({version:v.version,cases:seeds.map(seed=>run(v,seed))}))","return run");
 const factory=new Function(src+'\nreturn competitive')(),run=factory([],mock,fixture,[],null,oceania),v={html,db};
 return (seed,replicates=8,maxChoices=4)=>{
   const original=run(v,seed,{capture:true});
   return original.choices.slice(0,maxChoices).map(p=>{
     const futures=Array.from({length:replicates},(_,j)=>(Math.imul(seed,2654435761)+p.index*8191+j*104729)>>>0);
     return {...p,seed,oceania,replicates,cards:p.hand.map(b=>{
       const scores=futures.map(futureSeed=>run(v,seed,{index:p.index,remove:b.id,context:p.context,futureSeed}));
       return {...b,...p.ratings.find(x=>x.id===b.id),scores:scores.map(x=>x.score),margins:scores.map(x=>x.score-x.opponent),wins:scores.map(x=>x.win)};
     })};
   });
 };
}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const selectors={printed:c=>c.points,static:c=>c.static,quick:c=>c.quick,deep:c=>c.deep,blend:c=>c.blend,legal:c=>c.option+.15*c.static};
function summarize(positions){
 const result={positions:positions.length,games:new Set(positions.map(p=>p.oceania+':'+p.seed)).size,rollouts:positions.reduce((n,p)=>n+p.cards.length*p.replicates,0),models:{}};
 for(const [name,selector] of Object.entries(selectors)){
   let regrets=[],margins=[],wins=[],best=0,critical=0;
   for(const p of positions){
     let pick=p.cards.slice().sort((a,b)=>selector(a)-selector(b)||a.id-b.id)[0],optimal=Math.max(...p.cards.map(c=>mean(c.scores))),regret=optimal-mean(pick.scores);
     regrets.push(regret);margins.push(mean(pick.margins));wins.push(mean(pick.wins));best+=Number(regret<1e-9);critical+=Number(regret>=5);
   }
   result.models[name]={meanRegret:mean(regrets),optimal:positions.length?best/positions.length:null,critical:positions.length?critical/positions.length:null,meanMargin:mean(margins),meanWin:mean(wins)};
 }
 return result;
}
// Paired policy differences do not require selecting a noisy in-sample oracle.
// Bootstrap whole game prefixes, not individual card decisions or futures.
function pairedPolicyCI(positions,candidate,baseline='deep',iterations=1000,seed=76493){
 const pick=(p,model)=>p.cards.slice().sort((a,b)=>selectors[model](a)-selectors[model](b)||a.id-b.id)[0];
 const groups=new Map();
 for(const p of positions){
   const a=pick(p,candidate),b=pick(p,baseline),key=p.oceania+':'+p.seed;
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push({score:mean(a.scores.map((x,i)=>x-b.scores[i])),margin:mean(a.margins.map((x,i)=>x-b.margins[i])),win:mean(a.wins.map((x,i)=>x-b.wins[i]))});
 }
 const clusters=[...groups.values()],keys=['score','margin','win'],samples=Object.fromEntries(keys.map(k=>[k,[]]));
 if(!clusters.length)return {clusters:0,iterations,intervals:{}};
 let z=seed>>>0;const random=()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296};
 for(let i=0;i<iterations;i++){const rows=[];for(let j=0;j<clusters.length;j++)rows.push(...clusters[Math.floor(random()*clusters.length)]);for(const k of keys)samples[k].push(mean(rows.map(x=>x[k])))}
 return {clusters:clusters.length,iterations,intervals:Object.fromEntries(keys.map(k=>{const a=samples[k].sort((x,y)=>x-y);return [k,{mean:mean(clusters.flat().map(x=>x[k])),low:a[Math.floor((a.length-1)*.025)],high:a[Math.ceil((a.length-1)*.975)]}]}))};
}
if(typeof module!=='undefined')module.exports={interventionFactory,summarize,selectors,pairedPolicyCI};
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),read=p=>fs.readFileSync(p,'utf8'),[start='354400',count='4',mode='base',rep='4',out='']=process.argv.slice(2);
 const run=interventionFactory(read('public/wingspan/index.html'),JSON.parse(read('public/wingspan/cards.json')),read('tests/wingspan/strategy-v5.cjs'),read('tests/wingspan/competitive-v12.cjs'),JSON.parse(read('tests/wingspan/v11-expansions-fixture.json')),mode==='oceania');
 const positions=Array.from({length:Number(count)},(_,i)=>run(Number(start)+i,Number(rep))).flat();
 if(out)fs.writeFileSync(out,JSON.stringify(positions));console.log(JSON.stringify({...summarize(positions),pairedLegal:pairedPolicyCI(positions,'legal'),pairedBlend:pairedPolicyCI(positions,'blend')}));
}
