const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('tests/wingspan/strategy-v5.cjs','utf8');
const mock=new Function(source.slice(source.indexOf('function mock'),source.indexOf('const assert=')).replace('return {state:()=>S','return {strategicValue,valuePreview,valueRating,valueStateKey,state:()=>S')+'\nreturn mock')();
const db=JSON.parse(fs.readFileSync('public/wingspan/cards.json','utf8')),ui=mock(fs.readFileSync('public/wingspan/index.html','utf8'),db).ui;
function setup(r,t,cards,stock={}){ui.reset();let s=ui.state();Object.assign(s,{r,t,first:r%2,roundKnown:true,stockKnown:true,ledgerKnown:true,selectedGoals:[],stock:{worm:0,seed:0,fruit:0,fish:0,rodent:0,nectar:0,eggs:0,...stock},birds:cards.map(([name,loc],i)=>({...db.birds.find(b=>b.name===name),id:'b'+i,loc,eggsOn:0,tuckedOn:0,cachedOn:0}))});return s}
let s=setup(3,8,[['Sandhill Crane','hand'],['Ruddy Duck','hand']],{});
let before=JSON.stringify(s),a=ui.strategicValue(s.birds[0],'keep',true);assert.equal(a.rating,0);assert.equal(JSON.stringify(s),before);assert.deepEqual(ui.strategicValue(s.birds[0],'keep',true),a);
s=setup(3,8,[['Sandhill Crane','hand'],['Ruddy Duck','hand']],{worm:4,seed:4,fish:4,fruit:4,rodent:4});let scores=s.birds.map(b=>ui.strategicValue(b,'keep',true));assert(scores.every(x=>Number.isFinite(x.delta)&&x.rating>=0&&x.rating<=10));assert(scores.some(x=>x.rating<7));assert(scores.some(x=>x.rating>0));assert.equal(JSON.stringify(s.birds.map(b=>b.loc)),JSON.stringify(['hand','hand']));
let key=ui.valueStateKey();s.selectedGoals=['Bird Feeder'];assert.notEqual(ui.valueStateKey(),key);s.stockKnown=false;assert(ui.strategicValue(s.birds[0],'keep',true).preliminary);
s=setup(0,0,[['Northern Flicker','hand'],['Ruddy Duck','hand']],{});assert(ui.valuePreview(s.birds[0]).rating>0);assert(ui.valueRating(0)===0&&ui.valueRating(15)>9);
console.log('Strategic value: late-game opportunity cost, relative discard, early potential, cache invalidation, unknown inputs and non-mutation PASS');
s=setup(0,0,[['Northern Flicker','hand'],['Ruddy Duck','hand']],{});assert(ui.strategicValue(s.birds[1],'keep',true).rating>=7);
s=setup(2,0,[['Ruddy Duck','water'],['American Coot','hand']],{seed:2});assert(ui.strategicValue(s.birds[1],'keep',true).rating>=9);

s=setup(3,8,[['American Coot','water'],['Northern Flicker','forest'],['Cerulean Warbler','hand']],{worm:3,seed:3,eggs:1});let no=ui.strategicValue(s.birds[2],'keep',true).rating;s.selectedGoals=['Bird Counter'];assert.notEqual(ui.strategicValue(s.birds[2],'keep',true).rating,no);
