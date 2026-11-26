'use strict';
// Experimental only: no runtime UI or deployed numeric rating changes.
const FEATURE_SOURCE=`function opportunityFeatures(b){
 const turns=personalTurns(),hand=held(),best=plans([b])[0],alt=plans(hand.filter(x=>x.id!==b.id))[0],rows=played();
 const activation=rows.some(x=>{let m=v6Combo(mechanic(x));return ['tuckHand','tuckDraw','tuckEgg','tuckGain','drawDiscard'].includes(m.kind)||(m.kind==='sequence'&&m.script.some(o=>o.op==='hand'||o.op==='handMany'))});
 const handGoal=S.roundGoals?.slice(S.r).some(x=>Number(x)===2008);
 const direct=best?Math.max(0,best.utility/(1+best.prep*.85)):0,altScore=alt?Math.max(0,alt.score):0,eggAlt=Math.min(capacityFree(),yieldFor('grass',rowBirds('grass').length));
 return {direct,relative:Math.max(0,direct-altScore),flex:Math.max(0,direct-(turns<=3?eggAlt:Math.min(3,eggAlt))),resource:((turns>0&&activation?1:0)+(handGoal?1:0))/Math.max(1,hand.length),turns};
}`;
function build(html,auditSource){
 const replace=(s,a,b)=>{if(s.split(a).length!==2)throw Error('anchor changed: '+a);return s.replace(a,b)};
 html=replace(html,'var valueMemo;',FEATURE_SOURCE+'\nvar valueMemo;');
 auditSource=replace(auditSource,'return {starterPlan,strategicValue,valuePreview,valueRating,state:()=>S','return {starterPlan,strategicValue,valuePreview,valueRating,opportunityFeatures,state:()=>S');
 auditSource=replace(auditSource,'delta:deep.delta??null,ms:','delta:deep.delta??null,features:ui.opportunityFeatures(b),ms:');
 const lib=new Function(auditSource+'\nreturn {auditBatch,metrics,clusteredIntervals}')();
 return {html,...lib};
}
const rate=x=>10*(1-Math.exp(-Math.max(0,x)/4)),delta=c=>Math.max(0,c.delta??0);
const models={
 deep:c=>c.deep,quick:c=>c.quick,blend:c=>Math.max(c.deep,.6*c.quick),
 opportunity:c=>rate(.55*delta(c)+.35*c.features.flex+.7*c.features.resource),
 relative:c=>rate(.55*delta(c)+.25*c.features.direct+.25*c.features.relative+.7*c.features.resource),
 adaptive:c=>rate((c.features.turns<=3?.85:.4)*delta(c)+(c.features.turns<=3?.15:.45)*c.features.flex+c.features.resource),
 floor:c=>Math.max(c.deep,rate(.35*c.features.flex+c.features.resource))
};
function compare(lib,ps,iterations=500){
 const result={positions:ps.length,pairs:ps.reduce((n,p)=>n+p.cards.length*p.replicates,0),models:{}};
 for(const [name,sel] of Object.entries(models)){
  const z=lib.metrics(ps,sel);
  result.models[name]={rho:z.spearman,tau:z.kendallWithin,worst:z.worst,worstN:z.worstN,regret:z.meanDiscardRegret,critical:z.criticalDiscard,safeN:z.safeCount,safeLoss:z.safeLoss5};
  if(['relative','adaptive'].includes(name)&&iterations){const ci=lib.clusteredIntervals(ps,sel,iterations,76493,models.deep).intervals;result.models[name].ci={rho:ci.spearman,regret:ci.meanDiscardRegret,critical:ci.criticalDiscard,worst:ci.worst}}
 }
 return result;
}
if(typeof module!=='undefined')module.exports={build,models,compare};
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),read=p=>fs.readFileSync(p,'utf8'),[start='334400',count='12',mode='base',rep='12',policy='baseline',out='']=process.argv.slice(2);
 const lib=build(read('public/wingspan/index.html'),read('tests/wingspan/strategic-rating-audit.cjs'));
 const ps=lib.auditBatch(lib.html,JSON.parse(read('public/wingspan/cards.json')),read('tests/wingspan/strategy-v5.cjs'),read('tests/wingspan/competitive-v12.cjs'),JSON.parse(read('tests/wingspan/v11-expansions-fixture.json')),Number(start),Number(count),mode==='oceania',Number(rep),{policy,oppPolicy:policy});
 if(out)fs.writeFileSync(out,JSON.stringify(ps));
 console.log(JSON.stringify({start:Number(start),mode,policy,...compare(lib,ps)}));
}
