'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const read=p=>fs.readFileSync(p,'utf8'),db=JSON.parse(read('public/wingspan/cards.json')),src=read('tests/wingspan/strategy-v5.cjs'),base='1dfe06a7c3351b7bc60166b2c64946ce16d2ad0d';
const mock=new Function(src.slice(src.indexOf('function mock'),src.indexOf('const assert=')).replace('return {state:()=>S',"return {actionAlternatives:typeof actionAlternatives==='function'?actionAlternatives:null,compareActionAlternatives:typeof compareActionAlternatives==='function'?compareActionAlternatives:null,renderStrategy,valueStateKey,state:()=>S")+'\nreturn mock')();
const old=mock(execFileSync('git',['show',base+':public/wingspan/index.html'],{encoding:'utf8',maxBuffer:4e6}),db).ui,{ui,map}=mock(read('public/wingspan/index.html'),db);
function setup(u,r,t,birds,stock={},feeder=['worm','seed']){
 u.reset();const s=u.state();Object.assign(s,{r,t,first:r%2,roundKnown:true,stockKnown:true,ledgerKnown:true,selectedGoals:[],roundGoals:[2000,2001,2008,2020],stock:{worm:0,seed:0,fruit:0,fish:0,rodent:0,nectar:0,eggs:0,...stock},birds:birds.map(([name,loc],i)=>({...db.birds.find(x=>x.name===name),id:'b'+i,loc,eggsOn:0,cachedOn:0,tuckedOn:0})),feeder});return s;
}
const fixtures=[
 [3,6,[['Ruddy Duck','water'],['Northern Flicker','grass']],{}],
 [3,8,[['Northern Flicker','grass'],['Sandhill Crane','hand']],{worm:2,seed:2}],
 [1,2,[['Northern Flicker','grass'],['Ruddy Duck','water'],['Sandhill Crane','hand']],{}],
 [0,0,[['Ruddy Duck','hand']],{}],
 [2,6,[['Northern Flicker','grass'],['American Coot','water'],['Sandhill Crane','hand']],{seed:2}],
 [3,8,[['Northern Flicker','grass']],{},['fish']],
 [3,8,[['Northern Flicker','grass']],{},[]]
];
for(const f of fixtures){
 setup(old,...f);const s=setup(ui,...f),a=ui.recommendation(),p=ui.projectGame(),before=JSON.stringify(s);
 assert.deepEqual(a,old.recommendation(),'primary recommendation unchanged');
 const opts=ui.actionAlternatives(a);if(a.kind==='egg'){assert(opts.some(x=>x.kind==='food'));assert(opts.some(x=>x.kind==='draw'))}
 assert(!opts.some(x=>x.kind===a.kind&&x.kind!=='play'));
 for(const x of opts.filter(x=>x.kind==='play'))assert(s.birds.some(b=>b.id===x.id&&b.loc==='hand'));
 const comp=ui.compareActionAlternatives(a,opts);assert.equal(comp.entries.length,opts.length+1);assert(comp.entries.every(x=>x.found));
 assert.equal(ui.compareActionAlternatives(a,opts),comp,'memo reused');
 assert.equal(JSON.stringify(s),before,'comparison is read only');assert.equal(ui.projectGame(),p,'normal projection memo unchanged');
 ui.renderStrategy();const html=map.get('strategyPanel').innerHTML;for(const x of opts)assert(html.includes('data-alt-kind="'+x.kind+'"'));
 assert(html.includes('Сравнение рассчитано'));
 if(a.kind==='egg'){assert(html.includes('Добудь корм'));assert(html.includes('Возьми карты'))}
 s.stock.seed++;const next=ui.compareActionAlternatives(ui.recommendation(),ui.actionAlternatives(ui.recommendation()));assert.notEqual(next,comp);
}
const s=setup(ui,...fixtures[0]);s.phase='end';assert.deepEqual(ui.actionAlternatives(ui.recommendation()),[]);
s.phase='done';assert.deepEqual(ui.actionAlternatives(ui.recommendation()),[]);
s.phase='play';s.setupMode=true;assert.deepEqual(ui.actionAlternatives(ui.recommendation()),[]);
console.log('PASS: egg alternatives, known/empty feeder, independent root forecasts, state/cache safety, unchanged primary advice and inactive phases');
