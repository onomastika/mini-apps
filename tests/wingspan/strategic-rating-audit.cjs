'use strict';
/* Independent V12 rollout audit. Replays identical prefixes; target card is
 * quarantined (not recycled), preserving conservation. Continuation policy is
 * the independent simulator's baseline, not the rating or advisor.
 * A single rollout is noisy, not an oracle. Replicates use independent seeds. */
function auditFactory(html,db,mockSource,simSource,fixture,oceania) {
 const mock=new Function(mockSource.slice(mockSource.indexOf('function mock'),mockSource.indexOf('const assert=')).replace('return {state:()=>S','return {starterPlan,strategicValue,valuePreview,valueRating,state:()=>S')+'\nreturn mock')();
 let src=simSource.slice(simSource.indexOf('function competitive'),simSource.indexOf('\n\nconst assert='));
 function patch(a,b){if(src.split(a).length!==2)throw Error('Simulator anchor changed: '+a);src=src.replace(a,b)}
 patch('function run(v,seed){','function run(v,seed,audit){let quarantined=[],observed=null;');
 patch("if(i===seat){snapshot(p,off,bs);let t0=Date.now();start=ui.starterPlan();compute+=Date.now()-t0}else if(oppUI)","if(i===seat){start=baselineStart(p,off,bs)}else if(oppUI)");
 patch("if(i===seat){snapshot(p);let before=Date.now();advice=ui.recommendation();compute+=Date.now()-before;decisionCount++}else if(oppUI)","if(i===seat){if(r===audit.round&&used[i]===audit.turn){if(audit.capture){snapshot(p);const s=ui.state();observed={hand:p.hand.map(c=>({id:c.id,name:c.name})),ratings:s.birds.filter(b=>b.loc==='hand').map(b=>{const t=Date.now(),quick=ui.valuePreview(b).rating,deep=ui.strategicValue(b,'keep',true);return {id:b.catalogId,quick,deep:deep.rating,preliminary:deep.preliminary,delta:deep.delta??null,ms:Date.now()-t}}),stock:s.stock,board:p.board.length};}if(audit.remove!=null){const k=p.hand.findIndex(c=>c.id===audit.remove);if(k<0)throw Error('target not in identical prefix');quarantined.push(p.hand.splice(k,1)[0])}}advice=baseline(p);decisionCount++}else if(oppUI)");
 patch("let live=[...deck,...discard,...tray,","let live=[...quarantined,...deck,...discard,...tray,");
 patch("return {seed,oceania,nectarScore:","return {observed,seed,oceania,nectarScore:");
 patch("return versions.map(v=>({version:v.version,cases:seeds.map(seed=>run(v,seed))}))","return run");
 const factory=new Function(src+'\nreturn competitive')(),run=factory([],mock,fixture,[],null,oceania),v={html,db};
 return (seed,round,turn)=>{let a=run(v,seed,{round,turn,capture:true}),obs=a.observed;if(!obs)throw Error('missing audit position');return {seed,round,turn,oceania,board:obs.board,stock:obs.stock,cards:obs.hand.map(b=>{let z=run(v,seed,{round,turn,capture:false,remove:b.id});return {...b,...obs.ratings.find(x=>x.id===b.id),loss:a.score-z.score,marginLoss:(a.score-a.opponent)-(z.score-z.opponent),winLoss:a.win-z.win}})}};
}
function metrics(positions,selector) {
 const rows=positions.flatMap(p=>p.cards),mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
 const ranks=a=>a.map(x=>{let low=a.filter(y=>y<x).length,tie=a.filter(y=>y===x).length;return low+(tie+1)/2});
 const pearson=(a,b)=>{if(a.length<2)return null;let x=mean(a),y=mean(b),num=0,aa=0,bb=0;for(let i=0;i<a.length;i++){num+=(a[i]-x)*(b[i]-y);aa+=(a[i]-x)**2;bb+=(b[i]-y)**2}return aa&&bb?num/Math.sqrt(aa*bb):null};
 let concord=0,discord=0,tieX=0,tieY=0,worst=[],best=[],top3=[],regret=[],critical=0,decisions=0;
 for(const p of positions){const a=p.cards;if(a.length<2)continue;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){let x=Math.sign(selector(a[i])-selector(a[j])),y=Math.sign(a[i].loss-a[j].loss);if(x&&y){if(x===y)concord++;else discord++}else if(x)tieY++;else if(y)tieX++}
 const ordered=a.slice().sort((x,y)=>selector(x)-selector(y)||x.id-y.id),truth=a.slice().sort((x,y)=>x.loss-y.loss||x.id-y.id),n=a.length;
 if(truth[1].loss>truth[0].loss)worst.push(Number(ordered[0].id===truth[0].id));
 if(truth[n-1].loss>truth[n-2].loss)best.push(Number(ordered[n-1].id===truth[n-1].id));
 if(n>3&&truth[n-3].loss>truth[n-4].loss)top3.push(ordered.slice(-3).filter(c=>truth.slice(-3).some(t=>t.id===c.id)).length/3);
 let loss=ordered[0].loss-truth[0].loss;regret.push(loss);critical+=Number(loss>=5);decisions++;
 }
 const safe=rows.filter(c=>selector(c)<3),bins=[[0,3],[3,5],[5,7],[7,9],[9,10.01]].map(([lo,hi])=>{let a=rows.filter(c=>selector(c)>=lo&&selector(c)<hi);return {lo,hi,count:a.length,meanLoss:mean(a.map(c=>c.loss)),loss5:mean(a.map(c=>Number(c.loss>=5)))}});
 const den=Math.sqrt((concord+discord+tieX)*(concord+discord+tieY));
 return {comparisons:rows.length,positions:positions.filter(p=>p.cards.length).length,multi:decisions,spearman:pearson(ranks(rows.map(selector)),ranks(rows.map(c=>c.loss))),kendallWithin:den?(concord-discord)/den:null,worst:mean(worst),worstN:worst.length,best:mean(best),bestN:best.length,top3:mean(top3),top3N:top3.length,meanDiscardRegret:mean(regret),criticalDiscard:decisions?critical/decisions:null,safeCount:safe.length,safeLoss5:mean(safe.map(c=>Number(c.loss>=5))),bins};
}
function auditBatch(html,db,mockSource,simSource,fixture,start,count,oceania){const run=auditFactory(html,db,mockSource,simSource,fixture,oceania),positions=[];for(let i=0;i<count;i++){const seed=start+i;for(let r=0;r<4;r++)positions.push(run(seed,r,(seed>>>r)%[8,7,6,5][r]));}return positions}
function summarize(positions){return {positions:positions.length,deep:metrics(positions,c=>c.deep),quick:metrics(positions,c=>c.quick),conservative:metrics(positions,c=>c.preliminary?Math.max(c.deep,c.quick,3):c.deep),blend:metrics(positions,c=>Math.max(c.deep,.6*c.quick)),examples:positions.flatMap(p=>p.cards.filter(c=>c.deep<3&&c.loss>=5).map(c=>({round:p.round+1,seed:p.seed,...c}))).slice(0,12)}}
if(typeof module!=='undefined')module.exports={auditFactory,auditBatch,metrics,summarize};
if(typeof require!=='undefined'&&require.main===module){const fs=require('node:fs'),read=p=>fs.readFileSync(p,'utf8'),start=Number(process.argv[2]||304100),count=Number(process.argv[3]||8),oceania=process.argv[4]==='oceania';const p=auditBatch(read('public/wingspan/index.html'),JSON.parse(read('public/wingspan/cards.json')),read('tests/wingspan/strategy-v5.cjs'),read('tests/wingspan/competitive-v12.cjs'),JSON.parse(read('tests/wingspan/v11-expansions-fixture.json')),start,count,oceania);console.log(JSON.stringify(summarize(p)));if(process.argv[5])fs.writeFileSync(process.argv[5],JSON.stringify(p))}
