'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const read=p=>fs.readFileSync(p,'utf8'),db=JSON.parse(read('public/wingspan/cards.json')),source=read('tests/wingspan/strategy-v5.cjs'),base='df60d273ae264c43179d0ac15b77d428fb08e82b';
const mock=new Function(source.slice(source.indexOf('function mock'),source.indexOf('const assert=')).replace('return {state:()=>S','return {strategicValue,valuePreview,valueStateKey,work:()=>[ratingPlanCalls,ratingPlanCards],state:()=>S')+'\nreturn mock')();
function instrument(s){const a='function plans(cards=held()){';assert.equal(s.split(a).length,2);return s.replace(a,'var ratingPlanCalls=0,ratingPlanCards=0;'+a+'ratingPlanCalls++;ratingPlanCards+=cards.length;')}
const make=s=>mock(instrument(s),db).ui,old=make(execFileSync('git',['show',base+':public/wingspan/index.html'],{encoding:'utf8',maxBuffer:4e6})),candidate=make(read('public/wingspan/index.html'));
function setup(ui,r,size){ui.reset();let s=ui.state();Object.assign(s,{r,t:2,first:r%2,phase:'play',setupMode:false,roundKnown:true,stockKnown:true,ledgerKnown:true,stock:{worm:2,seed:2,fruit:1,fish:1,rodent:1,nectar:r%2,eggs:2},oceania:!!(r%2),selectedGoals:['Bird Feeder'],roundGoals:[2000,2001,2008,2020],birds:db.birds.filter(x=>!x.manualCost).slice(r*12,r*12+size).map((x,i)=>({...x,id:'h'+i,loc:'hand',eggsOn:0})),feeder:['seed','worm','fruit']});return s}
function measure(ui,s){
 const key=ui.valueStateKey(),start=ui.work(),t=performance.now(),list=[...s.birds.filter(b=>b.loc==='hand').map(b=>[b,'keep']),...db.birds.map(b=>[b,'acquire'])],result=list.map(([b,mode])=>ui.valuePreview(b,mode)),ms=performance.now()-t,end=ui.work();
 assert.equal(ui.valueStateKey(),key);const warm=performance.now(),warmStart=ui.work();for(const [b,mode] of list)ui.valuePreview(b,mode);const warmMs=performance.now()-warm,warmEnd=ui.work();assert.deepEqual(warmStart,warmEnd);
 return {result,ms,warmMs,calls:end[0]-start[0],cards:end[1]-start[1]};
}
let total={ratings:0,oldCards:0,newCards:0,oldMs:0,newMs:0,oldWarm:0,newWarm:0};
for(let r=0;r<4;r++)for(const size of [1,5,10]){
 const states=[old,candidate].map(ui=>setup(ui,r,size));const a=measure(old,states[0]),b=measure(candidate,states[1]);assert.deepEqual(a.result,b.result);assert(b.cards<a.cards);
 total.ratings+=a.result.length;total.oldCards+=a.cards;total.newCards+=b.cards;total.oldMs+=a.ms;total.newMs+=b.ms;total.oldWarm+=a.warmMs;total.newWarm+=b.warmMs;
 // Changed resources and removed hand card must invalidate the context.
 for(const s of states){s.stock.seed+=3;s.birds.pop()}
 const c=measure(old,states[0]),d=measure(candidate,states[1]);assert.deepEqual(c.result,d.result);
}
assert(total.newCards<total.oldCards*.25,'expected deterministic reduction of plan work');console.log(JSON.stringify(total));
