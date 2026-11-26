'use strict';
/* Independent V12 rollout audit. Replays identical prefixes; target card is
 * quarantined (not recycled), preserving conservation. Continuation policy is
 * one of the independent continuation policies, not the rating or advisor.
 * A single rollout is noisy, not an oracle. Replicates use independent seeds. */
function auditFactory(html,db,mockSource,simSource,fixture,oceania,options={}) {
 const mock=new Function(mockSource.slice(mockSource.indexOf('function mock'),mockSource.indexOf('const assert=')).replace('return {state:()=>S','return {starterPlan,strategicValue,valuePreview,valueRating,state:()=>S')+'\nreturn mock')();
 let src=simSource.slice(simSource.indexOf('function competitive'),simSource.indexOf('\n\nconst assert='));
 function patch(a,b){if(src.split(a).length!==2)throw Error('Simulator anchor changed: '+a);src=src.replace(a,b)}
 patch('function run(v,seed){','function run(v,seed,audit){let quarantined=[],observed=null,forked=false;');
 patch("if(i===seat){snapshot(p,off,bs);let t0=Date.now();start=ui.starterPlan();compute+=Date.now()-t0}else if(oppUI)","if(i===seat){start=baselineStart(p,off,bs)}else if(oppUI)");
 patch("if(i===seat){snapshot(p);let before=Date.now();advice=ui.recommendation();compute+=Date.now()-before;decisionCount++}else if(oppUI)","if(i===seat){if(r===audit.round&&used[i]===audit.turn){if(audit.capture){snapshot(p);const s=ui.state();observed={hand:p.hand.map(c=>({id:c.id,name:c.name})),ratings:s.birds.filter(b=>b.loc==='hand').map(b=>{const t=Date.now(),quick=ui.valuePreview(b).rating,deep=ui.strategicValue(b,'keep',true);return {id:b.catalogId,quick,deep:deep.rating,preliminary:deep.preliminary,delta:deep.delta??null,ms:Date.now()-t}}),stock:s.stock,board:p.board.length};}if(audit.remove!=null){const k=p.hand.findIndex(c=>c.id===audit.remove);if(k<0)throw Error('target not in identical prefix');quarantined.push(p.hand.splice(k,1)[0])}}advice=forked&&audit.policy==='goal-aware'?goalAware(p,op):baseline(p);decisionCount++}else if(oppUI)");
 patch("ui=mock(v.html,db).ui,oppDb=","ui=audit.capture?mock(v.html,db).ui:null,oppDb=");
 patch("if(audit.remove!=null){const k=p.hand.findIndex","if(audit.futureSeed!=null){random=rng(audit.futureSeed);deck=shuffle(deck,random);bonusDeck=shuffle(bonusDeck,random);for(let j=time;j<rolls.length;j++)rolls[j]=Array.from({length:100},()=>F[Math.floor(random()*6)])}if(audit.remove!=null){const k=p.hand.findIndex");
 patch("if(audit.futureSeed!=null){random=rng(audit.futureSeed);","if(audit.futureSeed!=null){forked=true;random=rng(audit.futureSeed);");
 patch("function act(i){",`function goalPoints(own,other){return !own?0:own>other?4+r:own===other?Math.floor((5+2*r)/2):1+r}
 function goalAware(p,op){
   if(r<2||L[r]-used[players.indexOf(p)]!==1)return baseline(p);
   const id=goals[r],other=metric(op,id),before=metric(p,id),gain=n=>goalPoints(n,other)-goalPoints(before,other),choices=[];
   const add=(advice,value)=>choices.push({advice,value});
   add({kind:'egg'},Math.min(free(p),Y.grass[pRow(p,'grass').length]));
   const draws=Math.min(deck.length+discard.length,Y.water[pRow(p,'water').length]);
   add({kind:'draw'},id===2008?gain(before+draws):0);
   for(const a of costOptions(p)){const b={...a.b,loc:a.h};const q={...p,board:[...p.board,b],hand:p.hand.filter(c=>c.id!==b.id)};const bonus=scoreBonus(q)-scoreBonus(p)+sum(p.extraBonus.map(z=>scoreBonus(q,z)-scoreBonus(p,z)));add({kind:'play',candidate:'c'+b.id,hab:a.h},b.points-a.eg+bonus+gain(metric(q,id)))}
   choices.sort((a,b)=>b.value-a.value);return choices[0].value>0?choices[0].advice:baseline(p);
 }
 function act(i){`);
 patch("else advice=baseline(p);let kind=advice.kind","else advice=forked&&audit.oppPolicy==='goal-aware'?goalAware(p,op):baseline(p);let kind=advice.kind");
 patch("let live=[...deck,...discard,...tray,","let live=[...quarantined,...deck,...discard,...tray,");
 patch("return {seed,oceania,nectarScore:","return {observed,seed,oceania,nectarScore:");
 patch("return versions.map(v=>({version:v.version,cases:seeds.map(seed=>run(v,seed))}))","return run");
 const factory=new Function(src+'\nreturn competitive')(),run=factory([],mock,fixture,[],null,oceania),v={html,db};
 return (seed,round,turn,replicates=1)=>{let a=run(v,seed,{round,turn,capture:true}),obs=a.observed;if(!obs)throw Error('missing audit position');const policy=options.policy||'baseline',oppPolicy=options.oppPolicy||'baseline';if(![policy,oppPolicy].every(p=>['baseline','goal-aware'].includes(p)))throw Error('unknown audit policy');const scenarios=Array.from({length:replicates},(_,j)=>((seed*2654435761+round*8191+turn*131+j*104729)>>>0));const keep=scenarios.map(futureSeed=>run(v,seed,{round,turn,futureSeed,capture:false,policy,oppPolicy}));return {seed,round,turn,oceania,policy,oppPolicy,board:obs.board,stock:obs.stock,replicates,cards:obs.hand.map(b=>{const losses=[],margins=[],wins=[];for(let j=0;j<replicates;j++){const z=run(v,seed,{round,turn,futureSeed:scenarios[j],capture:false,policy,oppPolicy,remove:b.id}),a=keep[j];losses.push(a.score-z.score);margins.push((a.score-a.opponent)-(z.score-z.opponent));wins.push(a.win-z.win)}const mean=a=>a.reduce((s,x)=>s+x,0)/a.length,loss=mean(losses),se=losses.length>1?Math.sqrt(losses.reduce((s,x)=>s+(x-loss)**2,0)/(losses.length*(losses.length-1))):null;return {...b,...obs.ratings.find(x=>x.id===b.id),loss,lossSE:se,marginLoss:mean(margins),winLoss:mean(wins),pairs:replicates}})}};

}
function metrics(positions,selector) {
 const rows=positions.flatMap(p=>p.cards),mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
 const ranks=a=>{let o=a.map((v,i)=>({v,i})).sort((x,y)=>x.v-y.v),r=[];for(let i=0;i<o.length;){let j=i+1;while(j<o.length&&o[j].v===o[i].v)j++;for(let k=i;k<j;k++)r[o[k].i]=(i+1+j)/2;i=j}return r};
 const pearson=(a,b)=>{if(a.length<2)return null;let x=mean(a),y=mean(b),num=0,aa=0,bb=0;for(let i=0;i<a.length;i++){num+=(a[i]-x)*(b[i]-y);aa+=(a[i]-x)**2;bb+=(b[i]-y)**2}return aa&&bb?num/Math.sqrt(aa*bb):null};
 let concord=0,discord=0,tieX=0,tieY=0,worst=[],best=[],top3=[],regret=[],critical=0,decisions=0;
 for(const p of positions){const a=p.cards;if(a.length<2)continue;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){let x=Math.sign(selector(a[i])-selector(a[j])),y=Math.sign(a[i].loss-a[j].loss);if(x&&y){if(x===y)concord++;else discord++}else if(x)tieY++;else if(y)tieX++}
 const ordered=a.slice().sort((x,y)=>selector(x)-selector(y)||x.id-y.id),truth=a.slice().sort((x,y)=>x.loss-y.loss||x.id-y.id),n=a.length;
 if(truth[1].loss-truth[0].loss>Math.max(1,1.96*Math.hypot(truth[0].lossSE||0,truth[1].lossSE||0)))worst.push(Number(ordered[0].id===truth[0].id));
 if(truth[n-1].loss>truth[n-2].loss)best.push(Number(ordered[n-1].id===truth[n-1].id));
 if(n>3&&truth[n-3].loss>truth[n-4].loss)top3.push(ordered.slice(-3).filter(c=>truth.slice(-3).some(t=>t.id===c.id)).length/3);
 let loss=ordered[0].loss-truth[0].loss;regret.push(loss);critical+=Number(loss>=5);decisions++;
 }
 const safe=rows.filter(c=>selector(c)<3),bins=[[0,3],[3,5],[5,7],[7,9],[9,10.01]].map(([lo,hi])=>{let a=rows.filter(c=>selector(c)>=lo&&selector(c)<hi);return {lo,hi,count:a.length,meanLoss:mean(a.map(c=>c.loss)),loss5:mean(a.map(c=>Number(c.loss>=5)))}});
 const den=Math.sqrt((concord+discord+tieX)*(concord+discord+tieY));
 return {comparisons:rows.length,positions:positions.filter(p=>p.cards.length).length,multi:decisions,spearman:pearson(ranks(rows.map(selector)),ranks(rows.map(c=>c.loss))),kendallWithin:den?(concord-discord)/den:null,worst:mean(worst),worstN:worst.length,best:mean(best),bestN:best.length,top3:mean(top3),top3N:top3.length,meanDiscardRegret:mean(regret),criticalDiscard:decisions?critical/decisions:null,safeCount:safe.length,safeLoss5:mean(safe.map(c=>Number(c.loss>=5))),bins};
}
function auditBatch(html,db,mockSource,simSource,fixture,start,count,oceania,replicates=8,options={}){const run=auditFactory(html,db,mockSource,simSource,fixture,oceania,options),positions=[];for(let i=0;i<count;i++){const seed=start+i;for(let r=0;r<4;r++)positions.push(run(seed,r,(seed>>>r)%[8,7,6,5][r],replicates));}return positions}
/* Bootstrap whole games, not individual cards/futures: rounds from a game
 * share a prefix and are not IID. Intervals cover between-game sampling only. */
function clusteredIntervals(positions,selector,iterations=500,seed=76493,baseline=null){
 const groups=new Map();for(const p of positions){let k=String(p.oceania)+':'+p.seed;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)}
 const clusters=[...groups.values()],keys=['spearman','kendallWithin','worst','best','meanDiscardRegret','criticalDiscard','safeLoss5'],samples=Object.fromEntries(keys.map(k=>[k,[]]));
 if(!clusters.length)return {clusters:0,iterations,intervals:{}};
 let z=seed>>>0;const random=()=>{z=(Math.imul(z,1664525)+1013904223)>>>0;return z/4294967296};
 for(let i=0;i<iterations;i++){let ps=[];for(let j=0;j<clusters.length;j++)ps.push(...clusters[Math.floor(random()*clusters.length)]);let a=metrics(ps,selector),b=baseline?metrics(ps,baseline):null;for(let k of keys){if(Number.isFinite(a[k])&&(!b||Number.isFinite(b[k])))samples[k].push(a[k]-(b?b[k]:0))}}
 const intervals={};for(const k of keys){let a=samples[k].sort((a,b)=>a-b);intervals[k]=a.length?{low:a[Math.floor((a.length-1)*.025)],high:a[Math.ceil((a.length-1)*.975)],valid:a.length}:null}
 return {clusters:clusters.length,iterations,intervals};
}
function summarize(positions){return {positions:positions.length,pairedRollouts:positions.reduce((n,p)=>n+p.cards.length*p.replicates,0),deep:metrics(positions,c=>c.deep),quick:metrics(positions,c=>c.quick),conservative:metrics(positions,c=>c.preliminary?Math.max(c.deep,c.quick,3):c.deep),blend:metrics(positions,c=>Math.max(c.deep,.6*c.quick)),examples:positions.flatMap(p=>p.cards.filter(c=>c.deep<3&&c.loss>=5).map(c=>({round:p.round+1,seed:p.seed,...c}))).slice(0,12)}}
if(typeof module!=='undefined')module.exports={auditFactory,auditBatch,metrics,summarize,clusteredIntervals};
if(typeof require!=='undefined'&&require.main===module){const fs=require('node:fs'),read=p=>fs.readFileSync(p,'utf8'),start=Number(process.argv[2]||304100),count=Number(process.argv[3]||8),oceania=process.argv[4]==='oceania',replicates=Number(process.argv[6]||8),policy=process.argv[7]||'baseline',oppPolicy=process.argv[8]||'baseline';const p=auditBatch(read('public/wingspan/index.html'),JSON.parse(read('public/wingspan/cards.json')),read('tests/wingspan/strategy-v5.cjs'),read('tests/wingspan/competitive-v12.cjs'),JSON.parse(read('tests/wingspan/v11-expansions-fixture.json')),start,count,oceania,replicates,{policy,oppPolicy});console.log(JSON.stringify({...summarize(p),confidence:clusteredIntervals(p,c=>c.deep)}));if(process.argv[5])fs.writeFileSync(process.argv[5],JSON.stringify(p))}
