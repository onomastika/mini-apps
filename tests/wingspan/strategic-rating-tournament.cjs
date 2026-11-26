'use strict';
// Focused tournament: change only discard/tuck selection. Other actions,
// setup, hidden deck, tray choice and independent rule execution are identical.
function tournamentFactory(html,db,mockSource,simSource,fixture,oceania){
 const mock=new Function(mockSource.slice(mockSource.indexOf('function mock'),mockSource.indexOf('const assert=')).replace('return {state:()=>S','return {starterPlan,strategicValue,valuePreview,state:()=>S')+'\nreturn mock')();
 let src=simSource.slice(simSource.indexOf('function competitive'),simSource.indexOf('\n\nconst assert='));
 const patch=(a,b)=>{if(src.split(a).length!==2)throw Error('anchor changed: '+a);src=src.replace(a,b)};
 patch('function run(v,seed){','function run(v,seed){let ratedDecisions=0,ratingMs=0,changedChoices=0;');
 patch("if(i===seat){snapshot(p,off,bs);let t0=Date.now();start=ui.starterPlan();compute+=Date.now()-t0}else if(oppUI)","if(i===seat){start=baselineStart(p,off,bs)}else if(oppUI)");
 patch("if(i===seat){snapshot(p);let before=Date.now();advice=ui.recommendation();compute+=Date.now()-before;decisionCount++}else if(oppUI)","if(i===seat){advice=baseline(p);decisionCount++}else if(oppUI)");
 patch("let c=p.hand.slice().sort((a,b)=>a.points-b.points||a.id-b.id)[0];p.hand=p.hand.filter(b=>b.id!==c.id);return c",
 `let c=p.hand.slice().sort((a,b)=>a.points-b.points||a.id-b.id)[0];
 if(p===players[seat]&&p.hand.length>1&&v.version!=='printed'){
   let before=Date.now(),old=c,values=new Map();
   if(v.version==='static'){
     for(const b of p.hand)values.set(b.id,b.points+(b.color==='brown'?3:0)-Math.min(...b.cost.map(x=>x.length)));
   }else{
     snapshot(p);let s=ui.state();
     for(const b of s.birds.filter(x=>x.loc==='hand')){
       let q=ui.valuePreview(b).rating,n=v.version==='quick'?q:ui.strategicValue(b,'keep',true).rating;
       if(v.version==='blend')n=Math.round(Math.max(n,.6*q)*10)/10;
       values.set(b.catalogId,n);
     }
   }
   c=p.hand.slice().sort((a,b)=>values.get(a.id)-values.get(b.id)||a.id-b.id)[0];
   if(!values.has(c.id)||!Number.isFinite(values.get(c.id)))throw Error('missing discard value');
   ratedDecisions++;changedChoices+=Number(c.id!==old.id);ratingMs+=Date.now()-before;
 }
 p.hand=p.hand.filter(b=>b.id!==c.id);return c`);
 patch("return {seed,oceania,nectarScore:","return {seed,oceania,ratedDecisions,ratingMs,changedChoices,nectarScore:");
 const factory=new Function(src+'\nreturn competitive')();
 return (seeds,versions=['printed','static','quick','deep','blend'])=>factory(versions.map(version=>({version,html,db})),mock,fixture,seeds,null,oceania);
}
function summarizeTournament(results){
 const base=results.find(x=>x.version==='printed'),mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
 return results.map(v=>({version:v.version,games:v.cases.length,score:mean(v.cases.map(c=>c.score)),win:mean(v.cases.map(c=>c.win)),delta:mean(v.cases.map(c=>c.score-base.cases.find(b=>b.seed===c.seed).score)),ratedDecisions:v.cases.reduce((n,c)=>n+c.ratedDecisions,0),changedChoices:v.cases.reduce((n,c)=>n+c.changedChoices,0),ratingMs:v.cases.reduce((n,c)=>n+c.ratingMs,0)}));
}
if(typeof module!=='undefined')module.exports={tournamentFactory,summarizeTournament};
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),read=p=>fs.readFileSync(p,'utf8'),[start='342400',count='4',mode='base']=process.argv.slice(2);
 const run=tournamentFactory(read('public/wingspan/index.html'),JSON.parse(read('public/wingspan/cards.json')),read('tests/wingspan/strategy-v5.cjs'),read('tests/wingspan/competitive-v12.cjs'),JSON.parse(read('tests/wingspan/v11-expansions-fixture.json')),mode==='oceania');
 const results=run(Array.from({length:Number(count)},(_,i)=>Number(start)+i));console.log(JSON.stringify({mode,summary:summarizeTournament(results),results}));
}
