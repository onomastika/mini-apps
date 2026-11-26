/* Presentation adapter: renders existing state; explicit user actions delegate to snapshot operations. */
(()=>{'use strict';
const by=id=>document.getElementById(id), root=document.documentElement, motionKey='wingspanVisualMotionV1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let decorative=true;
try{decorative=localStorage.getItem(motionKey)!=='off'}catch{}
const applyMotion=()=>{root.classList.toggle('vs-still',!decorative||reduced.matches);root.classList.toggle('vs-paused',document.hidden||by('birds').hidden)};
applyMotion();document.addEventListener('visibilitychange',applyMotion);if(reduced.addEventListener)reduced.addEventListener('change',applyMotion);else reduced.addListener(applyMotion);
const settings=document.createElement('section');settings.className='panel vs-motion-settings';settings.innerHTML='<h3>Оформление</h3><label><input type="checkbox" id="vsMotion"> Живой заповедник</label><p class="muted">Декоративное движение воды, травы и листвы. Системная настройка уменьшения движения всегда имеет приоритет.</p>';by('rules').append(settings);
const check=by('vsMotion');check.checked=decorative;check.addEventListener('change',()=>{decorative=check.checked;try{localStorage.setItem(motionKey,decorative?'on':'off')}catch{}applyMotion()});
const art={
 forest:'<g class="vs-sway" fill="none" stroke="#4f7554" stroke-width="1.2" stroke-linecap="round"><path d="M172 130Q150 62 118 35M172 130Q184 62 199 14M163 95Q138 91 117 64M181 70Q198 55 213 43"/><g fill="#72936b" stroke="none"><ellipse cx="120" cy="42" rx="9" ry="3" transform="rotate(38 120 42)"/><ellipse cx="132" cy="75" rx="12" ry="4" transform="rotate(28 132 75)"/><ellipse cx="199" cy="21" rx="5" ry="12" transform="rotate(24 199 21)"/><ellipse cx="207" cy="48" rx="11" ry="4" transform="rotate(-35 207 48)"/></g></g><g class="vs-sway" fill="#9ab077" opacity=".55"><circle cx="94" cy="48" r="2"/><circle cx="142" cy="24" r="3"/><circle cx="178" cy="37" r="2"/></g>',
 grass:'<g fill="none" stroke="#998348" stroke-width="1.3" stroke-linecap="round"><g class="vs-sway"><path d="M128 130Q120 84 105 50M141 130Q139 77 151 35M155 130Q154 90 178 62"/><path d="M105 50l-8 -11m8 11 3 -13m43 -2 -4 -13m4 13 8 -12"/></g><g class="vs-sway"><path d="M185 130Q176 79 186 27M196 130Q198 86 213 58M108 130Q101 104 84 85"/><path d="M186 27l-6 -12m6 12 7 -10m20 41 5 -12"/></g></g>',
 water:'<g fill="none" stroke="#6d9d9b" stroke-width="1.5" stroke-linecap="round"><path class="vs-ripple" d="M68 95Q92 88 119 95T174 95T226 95"/><path class="vs-ripple" d="M100 108Q126 101 150 108T205 108"/><path class="vs-ripple" d="M58 120Q84 114 107 120T159 120T211 120"/><path class="vs-ripple" d="M139 77Q160 73 180 77T220 77"/></g>'
};
function enhanceBoard(){by('board').querySelectorAll('.hab').forEach(row=>{if(row.querySelector('.vs-land-motion'))return;const kind=['forest','grass','water'].find(k=>row.classList.contains(k));if(!kind)return;let layer=document.createElement('div');layer.className='vs-land-motion';layer.setAttribute('aria-hidden','true');layer.innerHTML='<svg viewBox="0 0 230 130" preserveAspectRatio="xMaxYMax meet">'+art[kind]+'</svg>';if(kind==='water'||kind==='grass'){let svg=layer.querySelector('svg');let cloud=document.createElementNS('http://www.w3.org/2000/svg','g');cloud.setAttribute('class','vs-drift');cloud.setAttribute('fill','#fffaf0');cloud.setAttribute('opacity','.4');cloud.innerHTML='<ellipse cx="137" cy="23" rx="28" ry="8"/><ellipse cx="166" cy="19" rx="21" ry="7"/>';svg.prepend(cloud)}row.prepend(layer);const count=row.querySelector('.slots')?.querySelectorAll('.slot:not(.cf-empty)').length||0;const meter=document.createElement('div');meter.className='vs-hab-meter';meter.setAttribute('aria-hidden','true');for(let i=0;i<5;i++){let dot=document.createElement('span');dot.className=i<count?'filled':'';meter.append(dot)}row.querySelector('.slots')?.before(meter);enhanceSlots(row,kind)})}
function progress(){
 const summary=by('turnSummary'), title=by('turnLabel');
 let el=by('vsProgress');
 if(!el){el=document.createElement('div');el.id='vsProgress';el.className='vs-progress';summary.append(el)}
 const known=S.roundKnown, left=known?personalTurns():null;
 const label=known?(S.phase==='done'?'Партия окончена':S.phase==='end'?'Раунд '+(S.r+1)+' завершён':'Раунд '+(S.r+1)+' · ход '+(limits[S.r]-remaining(0)+1)+'/'+limits[S.r]) :'Указать момент партии';
 if(title.textContent!==label)title.textContent=label;
 const detail=document.createElement('small');detail.textContent=left===null?'Момент неизвестен':left+' из 26 ходов осталось';
 const track=document.createElement('div');track.className='vs-progress-track';track.setAttribute('aria-hidden','true');
 limits.forEach((n,i)=>{let segment=document.createElement('span');segment.style.flex=String(n);let fill=document.createElement('i');let used=known?(S.phase==='done'||i<S.r?n:i===S.r?n-remaining(0):0):0;fill.style.width=100*used/n+'%';segment.append(fill);track.append(segment)});
 el.replaceChildren(detail,track);
}
function forecast(){let el=by('forecast');if(el.querySelector('.vs-forecast-metrics'))return;let p=el.querySelector('p'),small=el.querySelector('small');if(!p||!small)return;let a=p.textContent.match(/условное изменение известных очков:\s*([+−-]?\d+(?:[.,]\d+)?)/),b=small.textContent.match(/мат\. ожидание\):\s*([+−-]?\d+(?:[.,]\d+)?)/);if(!a||!b)return;let grid=document.createElement('div');grid.className='vs-forecast-metrics';for(let [v,label] of [[a[1],'Условные известные очки'],[b[1],'Ожидаемые случайные очки']]){let box=document.createElement('div');box.className='vs-metric';let num=document.createElement('b');num.textContent=v;let desc=document.createElement('small');desc.textContent=label;box.append(num,desc);grid.append(box)}el.prepend(grid)}
const pending=new Set();let queued=false;const schedule=(fn)=>{pending.add(fn);if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;let jobs=[...pending];pending.clear();jobs.forEach(f=>f())})};
const watch=(id,fn)=>{let target=by(id);if(target)new MutationObserver(()=>schedule(fn)).observe(target,{childList:true,subtree:true,characterData:true})};
watch('board',enhanceBoard);watch('gamePanel',progress);watch('forecast',forecast);
const snapshots=new Map();
function feedback(id,selector,key,value){let target=by(id),nodes=[...target.querySelectorAll(selector)],old=snapshots.get(id),next=new Map(nodes.map(n=>[key(n),value(n)]));snapshots.set(id,next);if(!old||reduced.matches||target.closest('.tab[hidden]'))return;for(let n of nodes){let k=key(n);if(old.get(k)!==next.get(k)&&typeof n.animate==='function')n.animate([{opacity:.68,transform:'translateY(2px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'})}}
const stockFeedback=()=>feedback('quickStock','.res-tile b',n=>n.parentElement.querySelector('small').textContent,n=>n.textContent);
const adviceFeedback=()=>feedback('advice','.advice-content h2',()=> 'title',n=>n.textContent);
const boardFeedback=()=>feedback('board','.slot',n=>n.textContent,n=>n.textContent);
watch('quickStock',stockFeedback);watch('advice',adviceFeedback);watch('board',boardFeedback);
let scoreLast=by('scoreSummary').textContent;watch('scoreSummary',()=>{let n=by('scoreSummary'),next=n.textContent;if(next!==scoreLast&&!reduced.matches&&!by('score').hidden)n.animate?.([{opacity:.7},{opacity:1}],{duration:180});scoreLast=next});
stockFeedback();adviceFeedback();boardFeedback();
let catalogSignature=by('dbList').textContent;
watch('dbList',()=>{let el=by('dbList'),next=el.textContent;if(next!==catalogSignature&&!reduced.matches&&!by('catalog').hidden)el.animate?.([{opacity:.82},{opacity:1}],{duration:150});catalogSignature=next});
document.addEventListener('toggle',event=>{let el=event.target;if(el.tagName!=='DETAILS'||!el.open||reduced.matches||el.closest('.tab[hidden]'))return;let body=[...el.children].find(n=>n.tagName!=='SUMMARY');body?.animate?.([{opacity:.72},{opacity:1}],{duration:160})},true);


const positions=new Map();let current=document.querySelector('.tab:not([hidden])')?.id||'guide';
document.querySelectorAll('.tab').forEach(tab=>new MutationObserver(()=>{const next=document.querySelector('.tab:not([hidden])');if(!next||next.id===current)return;current=next.id;applyMotion();if(!reduced.matches){next.classList.remove('vs-enter');requestAnimationFrame(()=>{if(!next.hidden)next.classList.add('vs-enter')})}}).observe(tab,{attributes:true,attributeFilter:['hidden']}));
document.querySelector('.nav').addEventListener('click',e=>{let btn=e.target.closest('[data-tab]');if(!btn)return;let target=btn.dataset.tab;if(target===current)return;positions.set(current,window.scrollY);let y=positions.get(target);if(y!==undefined)requestAnimationFrame(()=>{if(!by(target).hidden)window.scrollTo(0,y)})},true);
document.addEventListener('animationend',e=>{if(e.animationName==='vs-enter')e.target.classList.remove('vs-enter')});

// Clean & Fluid — reuse original DOM, catalog and snapshot operations.
const makeButton=(label,handler,cls='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls;b.addEventListener('click',handler);return b};
function enhanceSlots(row,kind){
 const slots=row.querySelector('.slots'), birds=rowBirds(kind);if(!slots)return;
 const existing=[...slots.querySelectorAll('.slot')];
 existing.forEach((btn,i)=>{
   const bird=birds[i];if(!bird)return;
   btn.classList.add('cf-occupied');btn.title=bird.name;
   const meta=document.createElement('small');meta.className='cf-bird-meta';
   const known=S.ledgerKnown||bird.v8TokensKnown;
   meta.textContent=bird.points+' ★'+(known?' · '+(bird.eggsOn||0)+' 🥚 · '+(bird.cachedOn||0)+' корм · '+(bird.tuckedOn||0)+' карт':' · жетоны ?');
   btn.append(meta);btn.setAttribute('aria-label',bird.name+', '+meta.textContent);
 });
 const info=slots.querySelector(':scope > small');if(info)info.remove();
 for(let i=birds.length;i<5;i++){
   const price=[0,1,1,2,2][i];
   const btn=makeButton('＋',()=>openSlot(kind),'slot cf-empty');
   const small=document.createElement('small');small.textContent=price+' 🥚';btn.append(small);
   btn.setAttribute('aria-label','Добавить птицу: '+H[kind]+', место '+(i+1)+', '+price+' яиц');btn.disabled=!!S.wizard;slots.append(btn);
 }
}
const slotDialog=document.createElement('dialog');slotDialog.id='cfSlotDialog';document.body.append(slotDialog);
function openSlot(kind){
 if(S.wizard||rowBirds(kind).length>=5)return;
 const title=document.createElement('h2');title.textContent=H[kind]+' · добавить птицу';
 const p=document.createElement('p');p.className='muted';p.textContent='Укажи птицу, которая уже находится здесь на физическом планшете. Корм и яйца не списываются.';
 const choices=held().filter(b=>b.hab.includes(kind));
 const list=document.createElement('div');list.className='cf-slot-choices';
 choices.forEach(b=>list.append(makeButton(b.name,()=>{slotDialog.close();moveBird(b.id,kind)})));
 if(!choices.length)list.textContent='Нет подходящих птиц в руке.';
 const find=makeButton('Найти в атласе',()=>{slotDialog.close();openSearch();by('dbHab').value=kind;if(DB)dbRender();},'primary wide');
 slotDialog.replaceChildren(title,p,list,find,makeButton('Отмена',()=>slotDialog.close(),'wide outline-btn'));slotDialog.showModal();
}
const guide=by('guide'), sanctuary=by('birds'), atlas=by('catalog'), nav=document.querySelector('.nav');
const navNames={guide:'Советник',birds:'Заповедник',catalog:'Атлас'};
for(const b of nav.querySelectorAll('[data-tab]')){
 const name=navNames[b.dataset.tab];if(name)b.querySelector('span').textContent=name;else b.hidden=true;
}
const header=document.querySelector('.atlas-header');
const help=header.querySelector('[data-tab="rules"]');help.textContent='⋯';help.setAttribute('aria-label','Меню и настройки');
const menu=document.createElement('dialog');menu.id='cfMenu';document.body.append(menu);
const menuTitle=document.createElement('h2');menuTitle.textContent='Меню';
menu.append(menuTitle,...[['Настройки партии','game'],['Подсчёт очков','score'],['Правила, импорт, экспорт и оформление','rules']].map(([label,tab])=>makeButton(label,()=>{menu.close();setTab(tab)},'wide outline-btn')),makeButton('Закрыть',()=>menu.close(),'wide'));
help.onclick=()=>menu.showModal();
const res=sanctuary.querySelector('.resource-panel');res.classList.add('cf-resources');
const score=makeButton('',()=>setTab('score'),'cf-score');
score.id='cfScore';score.setAttribute('aria-label','Открыть подробный подсчёт очков');
const strip=document.createElement('div');strip.className='cf-topline';by('turnSummary').before(strip);strip.append(by('turnSummary'),score);
strip.after(res);
const resourceLink=makeButton('Ресурсы и обновление состояния',()=>{setTab('guide');res.scrollIntoView({block:'nearest'});},'outline-btn wide cf-resource-link');
sanctuary.querySelector('.section-heading').after(resourceLink);
const quick=by('quickStock');
const updateScore=()=>{let n=by('total0').textContent||'0';score.replaceChildren();let v=document.createElement('b');v.textContent=n;let l=document.createElement('small');l.textContent='Очки ›';score.append(v,l);};
watch('total0',updateScore);updateScore();
const shortcuts=guide.querySelector('.turn-shortcuts');
shortcuts.querySelector('[data-tab="birds"]').textContent='Заповедник';
by('quickSearch').textContent='Найти птицу';
const trayDetails=by('tray').closest('details');sanctuary.append(trayDetails);
const forecastPanel=by('forecastPanel'), summaryForecast=forecastPanel.querySelector('summary');
const forecastHint=document.createElement('small');forecastHint.className='cf-forecast-hint';summaryForecast.append(forecastHint);
function updateForecastHint(){const p=by('forecast').querySelector('p');const m=p?.textContent.match(/условное изменение известных очков:\s*([+−-]?\d+(?:[.,]\d+)?)/);const stale=!forecastPanel.open;forecastHint.textContent=!stale&&m?' · '+m[1]+' условных очк.':' · открыть расчёт'}
watch('forecast',updateForecastHint);forecastPanel.addEventListener('toggle',updateForecastHint);updateForecastHint();
const goals=document.createElement('section');goals.className='panel cf-goals';goals.innerHTML='<div class="row between"><h3>Цели раундов</h3></div><div id="cfGoals"></div>';
goals.querySelector('.row').append(makeButton('Изменить',()=>{setTab('game');let target=by('roundGoalChoices');target.closest('details').open=true;target.scrollIntoView({block:'start'});},'plain'));
const bonusPanel=by('quickGoals').closest('.panel');bonusPanel.after(goals);
function renderGoalCards(){
 const nodes=limits.map((_,i)=>{
 let cell=document.createElement('div');cell.className='cf-goal'+(S.roundKnown&&i===S.r?' cf-goal-current':'');
 const title=document.createElement('small');title.textContent='Раунд '+(i+1);
 const g=DB?.goals?.find(g=>String(g.id)===String(S.roundGoals?.[i]));
 const name=document.createElement('b');name.textContent=g?g.name.replace(/\[(.*?)\]/g,'$1'):'Не указана';
 const info=document.createElement('small');if(g&&S.roundKnown&&i===S.r&&S.phase==='play'){const metric=roundGoalMetric(g.id,played(),S.stock,held().length);info.textContent=metric==null?'Показатель неизвестен':'Показатель: '+metric+' · очки условны'}else info.textContent=g?'Очки по итогам раунда':'Выбрать цель';
 cell.append(title,name,info);return cell});
 by('cfGoals').replaceChildren(...nodes);
}
watch('roundGoalChoices',renderGoalCards);watch('advice',renderGoalCards);renderGoalCards();
function labelCatalog(){
 const set=(selector,label)=>{const x=atlas.querySelector(selector);if(x)x.textContent=label};
 set('.section-heading h2','Атлас птиц');set('.section-heading [data-tab="birds"]','Моя рука ›');
 for(const [key,label] of Object.entries({birds:'Птицы',bonus:'Бонусы',hummingbirds:'Колибри',goals:'Цели'}))set('[data-kind="'+key+'"]',label);
 by('dbQuery').placeholder='Поиск по названию…';by('dbQuery').setAttribute('aria-label','Поиск карт');set('#dbReset','Сбросить фильтры');set('#dbMore','Показать ещё');set('[data-view="list"]','☰ Список');set('[data-view="cards"]','▦ Карточки');
 const sortLabels={name:'А–Я / A–Z',points:'Очки',fit:'Совместимость',cost:'Стоимость'};
 for(const opt of by('dbSort').options)if(sortLabels[opt.value])opt.textContent=sortLabels[opt.value];
 for(const [id,label] of Object.entries({dbSet:'Все наборы',dbHab:'Все среды',dbFood:'Любой корм',dbColor:'Все способности'})){by(id).options[0].textContent=label;}
}
labelCatalog();watch('dbSet',()=>{const x=by('dbSet').options[0];if(x&&x.textContent!=='Все наборы')x.textContent='Все наборы'});
// Batch hand additions are a single explicit snapshot, with one render and one checkpoint.
const batchDialog=document.createElement('dialog');batchDialog.id='cfBatchDialog';document.body.append(batchDialog);
const batchButton=makeButton('＋ Несколько птиц',openBatch,'outline-btn wide');atlas.querySelector('.section-heading').after(batchButton);
function openBatch(){
 if(!DB||S.wizard)return;
 const picked=new Map(), title=document.createElement('h2');title.textContent='Добавить птиц в руку';
 const query=document.createElement('input');query.type='search';query.placeholder='Название птицы';query.setAttribute('aria-label','Поиск для пакетного добавления');query.className='cf-batch-query';
 const list=document.createElement('div');list.className='cf-batch-list';const chosen=document.createElement('p');chosen.className='muted';chosen.setAttribute('aria-live','polite');
 const available=b=>setAllowed(b)&&!S.birds.some(x=>dbNorm(x.name)===dbNorm(b.name)&&x.loc!=='discard');
 const apply=makeButton('Добавить выбранные',()=>{
   if(S.wizard||!picked.size)return;const birds=[...picked.values()];
   if(!birds.every(available)){render();return}
   v8Checkpoint();S.lastGuided=null;
   const stamp=Date.now();
   birds.forEach((b,i)=>S.birds.push({...b,id:'db-'+b.id+'-'+stamp+'-'+i,catalogId:b.id,loc:'hand',power:englishPower(b)}));
   S.tray=trayIds().map(id=>picked.has(String(id))?null:id);
   batchDialog.close();renderGuide();renderScores();save();dbRender();
   by('dbMessage').textContent='Добавлено в руку: '+birds.length;
 },'primary wide');
 function render(){
   const q=dbNorm(query.value);let options=DB.birds.filter(b=>available(b)&&(!q||dbNorm(b.name+' '+(b.scientific||'')).includes(q))).slice(0,35);
   list.replaceChildren(...options.map(b=>{let label=document.createElement('label');let input=document.createElement('input');input.type='checkbox';input.checked=picked.has(String(b.id));input.onchange=()=>{if(input.checked)picked.set(String(b.id),b);else picked.delete(String(b.id));update()};label.append(input,b.name);return label}));update();
 }
 function update(){chosen.textContent=picked.size?'Выбрано: '+picked.size+' · '+[...picked.values()].map(b=>b.name).join(', '):'Выбери карты, затем сохрани все сразу.';apply.disabled=!picked.size}
 query.oninput=render;batchDialog.replaceChildren(title,query,chosen,list,apply,makeButton('Отмена',()=>batchDialog.close(),'wide outline-btn'));render();batchDialog.showModal();query.focus();
}
// Disable decorative movement for habitat rows outside the visible viewport.
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('cf-offscreen',!e.isIntersecting)));
 const observeRows=()=>by('board').querySelectorAll('.hab').forEach(row=>io.observe(row));watch('board',observeRows);observeRows();
}
// Keep the existing resource controls and undo the explicit resource snapshot, including its clock.
let undoState=null;
const undo=makeButton('↶ Отменить обновление',()=>{
 if(!undoState||stateKey()!==undoState.after||S.wizard)return;
 const tab=S.tab;S=JSON.parse(undoState.before);S.tab=tab;undoState=null;renderAll();undo.hidden=true;
},'plain cf-undo');
undo.hidden=true;res.append(undo);
function stateKey(){const {tab,...rest}=S;return JSON.stringify(rest)}
function captureResource(e){
 const target=e.target;
 const isApply=e.type==='click'&&target.closest('button')?.textContent==='Сохранить весь запас';
 const isCounter=e.type==='click'&&['−','+'].includes(target.closest('button')?.textContent);
 const isInput=e.type==='change'&&target.matches('input[type=number]');
 if(!isApply&&!isCounter&&!isInput)return;
 const before=JSON.stringify(S), key=stateKey();
 queueMicrotask(()=>{const after=stateKey();if(after!==key){undoState={before,after};undo.hidden=false}});
}
by('quickResourceEditor').addEventListener('click',captureResource,true);by('quickResourceEditor').addEventListener('change',captureResource,true);
const verifyUndo=()=>{undo.hidden=!undoState||stateKey()!==undoState.after};watch('advice',verifyUndo);watch('quickStock',verifyUndo);
function refineResources(){const b=quick.querySelector(':scope > .outline-btn');if(b&&b.textContent==='Изменить весь запас'){b.textContent='Обновить состояние';b.classList.add('cf-update')}}
watch('quickStock',refineResources);refineResources();
function tabChrome(){const current=document.querySelector('.tab:not([hidden])')?.id;header.classList.toggle('cf-compact',current!=='rules');document.body.dataset.cfTab=current||'guide';}
document.querySelectorAll('.tab').forEach(t=>new MutationObserver(tabChrome).observe(t,{attributes:true,attributeFilter:['hidden']}));tabChrome();
enhanceBoard();progress();forecast();
})();
