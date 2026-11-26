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
   const btn=makeButton('+',()=>openSlot(kind),'slot cf-empty');
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
 const direct=document.createElement('div');direct.className='cf-direct-slot';
 if(DB){
   const query=document.createElement('input');query.type='search';query.className='cf-batch-query';query.placeholder='Название птицы из атласа';query.setAttribute('aria-label','Поиск птицы для '+H[kind]);
   const results=document.createElement('div');results.className='cf-slot-choices cf-direct-results';
   query.oninput=()=>{
     const q=dbNorm(query.value);
     if(!q){results.replaceChildren();return}
     const matches=DB.birds.filter(b=>setAllowed(b)&&b.hab.includes(kind)&&dbNorm(b.name+' '+(b.scientific||'')).includes(q)&&!S.birds.some(x=>dbNorm(x.name)===dbNorm(b.name)&&x.loc!=='discard')).slice(0,12);
     results.replaceChildren(...matches.map(b=>makeButton(b.name,()=>{
       if(S.wizard||rowBirds(kind).length>=5)return;
       const before=trayIds().slice(),count=S.birds.length;
       slotDialog.close();dbAdd(b,kind);
       if(S.birds.length>count&&S.birdHistory?.length){S.birdHistory.at(-1).cfTray=before;save()}
     })));
     if(!matches.length)results.textContent='Подходящих карт не найдено.';
   };
   direct.append(query,results);
 }
 slotDialog.replaceChildren(title,p,list,direct,find,makeButton('Отмена',()=>slotDialog.close(),'wide outline-btn'));slotDialog.showModal();
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
const home=document.createElement('a');home.href=header.querySelector('.home-link').href;home.className='cf-menu-home';home.textContent='Каталог приложений';menu.insertBefore(home,menu.lastElementChild);help.onclick=()=>menu.showModal();
const res=sanctuary.querySelector('.resource-panel');res.classList.add('cf-resources');
const score=makeButton('',()=>setTab('score'),'cf-score');
score.id='cfScore';score.setAttribute('aria-label','Открыть подробный подсчёт очков');
const strip=document.createElement('div');strip.className='cf-topline';by('turnSummary').before(strip);strip.append(by('turnSummary'),score);
by('advice').after(res);
const resourceLink=makeButton('Ресурсы и обновление состояния',()=>{setTab('guide');res.scrollIntoView({block:'nearest'});},'outline-btn wide cf-resource-link');
const boardPanel=by('board').closest('.panel');boardPanel.classList.add('cf-board-panel');sanctuary.querySelector('.section-heading').after(boardPanel);boardPanel.after(resourceLink);boardPanel.querySelector('h3').textContent='Игровой планшет';
const quick=by('quickStock');
const updateScore=()=>{let n=totals()[0];if(score.dataset.total===String(n))return;score.dataset.total=String(n);score.replaceChildren();let v=document.createElement('b');v.textContent=n;let l=document.createElement('small');l.textContent='Учтено ›';score.append(v,l);};
watch('total0',updateScore);watch('advice',updateScore);updateScore();
const shortcuts=guide.querySelector('.turn-shortcuts');
shortcuts.querySelector('[data-tab="birds"]').textContent='Заповедник';
by('quickSearch').textContent='Найти птицу';
const trayDetails=by('tray').closest('details');sanctuary.append(trayDetails);const handPanel=by('hand').closest('.panel');resourceLink.after(handPanel);handPanel.classList.add('cf-hand-panel');
const forecastPanel=by('forecastPanel'), summaryForecast=forecastPanel.querySelector('summary');
const forecastHint=document.createElement('small');forecastHint.className='cf-forecast-hint';summaryForecast.append(forecastHint);
let forecastSnapshot=null;
function updateForecastHint(){
 const p=forecastSnapshot===stateKey()&&S.roundKnown&&S.phase==='play'&&!S.setupMode&&!S.wizard?forecastMemo.value:null;
 const value=p&&p.turns===personalTurns()?p.points:null;
 const text=Number.isFinite(value)?' · '+(value>=0?'+':'')+value+' условных очк.':' · открыть расчёт';
 if(forecastHint.textContent!==text)forecastHint.textContent=text;
}
watch('forecast',()=>{if(forecastPanel.open)forecastSnapshot=stateKey();updateForecastHint()});watch('advice',updateForecastHint);forecastPanel.addEventListener('toggle',updateForecastHint);updateForecastHint();
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
const originalUndoBird=by('undoBird').onclick;
by('undoBird').onclick=function(){const last=S.birdHistory?.at(-1);if(last?.cfTray)S.tray=last.cfTray.slice();originalUndoBird.call(this)};
const batchDialog=document.createElement('dialog');batchDialog.id='cfBatchDialog';document.body.append(batchDialog);
const batchButton=makeButton('＋ Несколько птиц',openBatch,'outline-btn wide');atlas.querySelector('.section-heading').after(batchButton);function updateBatchButton(){batchButton.disabled=!DB||!!S.wizard||trayPick!==null||dbKind!=='birds'}watch('dbList',updateBatchButton);updateBatchButton();
function openBatch(){
 if(!DB||S.wizard)return;
 const picked=new Map(), title=document.createElement('h2');title.textContent='Добавить птиц в руку';
 const query=document.createElement('input');query.type='search';query.placeholder='Название птицы';query.setAttribute('aria-label','Поиск для пакетного добавления');query.className='cf-batch-query';
 const list=document.createElement('div');list.className='cf-batch-list';const chosen=document.createElement('p');chosen.className='muted';chosen.setAttribute('aria-live','polite');
 const available=b=>setAllowed(b)&&!S.birds.some(x=>dbNorm(x.name)===dbNorm(b.name)&&x.loc!=='discard');
 const apply=makeButton('Добавить выбранные',()=>{
   if(S.wizard||!picked.size)return;const birds=[...picked.values()];
   if(!birds.every(available)){for(const [id,b] of picked)if(!available(b))picked.delete(id);render();return}
   v8Checkpoint();S.birdHistory.at(-1).cfTray=trayIds().slice();S.lastGuided=null;
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
 const observed=new Set();const observeRows=()=>{for(const row of observed){if(!row.isConnected){io.unobserve(row);observed.delete(row)}}by('board').querySelectorAll('.hab').forEach(row=>{if(!observed.has(row)){io.observe(row);observed.add(row)}})};watch('board',observeRows);observeRows();
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
 setTimeout(()=>{const after=stateKey();if(after!==key){undoState={before,after};undo.hidden=false}},0);
}
by('quickResourceEditor').addEventListener('click',captureResource,true);by('quickResourceEditor').addEventListener('change',captureResource,true);
const verifyUndo=()=>{undo.hidden=!undoState||stateKey()!==undoState.after};watch('advice',verifyUndo);watch('quickStock',verifyUndo);
// Keep the complete rationale accessible while making the useful first sentence the default.
function refineAdvice(){
 const el=by('advice'),note=el.querySelector('.note'),detail=by('adviceSteps');
 if(!note||!detail||note.dataset.cfCompact)return;
 note.dataset.cfCompact='true';
 const unknown=[!S.stockKnown&&'Запас не подтверждён',!S.roundKnown&&'Момент партии неизвестен',!S.ledgerKnown&&'Жетоны не сверены'].filter(Boolean);
 if(unknown.length){
   const flags=document.createElement('small');flags.className='cf-uncertainty';flags.textContent=unknown.join(' · ');
   note.after(flags);
 }
 const text=note.textContent.trim();
 const split=text.match(/^(.*?[.!?])(?=\s|$)/u);
 if(text.length>135&&split&&split[1].length<text.length){
   const full=document.createElement('p');full.className='cf-full-rationale';full.textContent=text;detail.insertBefore(full,detail.querySelector('ol'));
   note.textContent=split[1];
 }
 const action=el.querySelector(':scope > button.wide');
 if(action&&action.textContent.includes('Изменить текущее состояние')){
   action.textContent='Сверить состояние';action.onclick=()=>{setTab('guide');const batch=quick.querySelector(':scope > .outline-btn');if(!v10Batch)batch?.click();res.scrollIntoView({block:'nearest',behavior:'instant'})};
 }
}
watch('advice',refineAdvice);refineAdvice();
// Keep the existing snapshot editor on the center of each tile; +/- are separate
// accessible controls, so no nested buttons or alternative resource ledger.
function refineResources(){
 const batch=quick.querySelector(':scope > .outline-btn');
 if(batch&&batch.textContent==='Изменить весь запас'){batch.textContent='Обновить состояние';batch.classList.add('cf-update')}
 const keys=foodKeys.filter(k=>k!=='nectar'||S.oceania).concat('eggs');
 [...quick.querySelectorAll(':scope > .res-tile')].forEach((tile,i)=>{
   const key=keys[i], label=tile.title;
   if(!key)return;
   const group=document.createElement('div');group.className='cf-resource-token';group.dataset.resource=key;
   group.setAttribute('role','group');group.setAttribute('aria-label',label);
   const adjust=(delta,button)=>{
     if(S.wizard||v10Batch)return;
     const value=S.stock[key]||0;
     if(value+delta<0||value+delta>999)return;
     const before=JSON.stringify(S), wasFocused=document.activeElement===button;
     changeStock(key,delta);
     const after=stateKey();
     undoState={before,after};undo.hidden=false;
     // The engine replaces quickStock on each explicit edit. Reattach immediately
     // for rapid consecutive taps, rather than waiting for the next frame.
     refineResources();
     if(wasFocused){
       const replacement=quick.querySelector('[data-resource="'+key+'"] .cf-resource-'+(delta<0?'minus':'plus'));
       if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});
     }
   };
   const counter=(delta)=>{
     const direction=delta<0?'minus':'plus';
     const button=makeButton(delta<0?'−':'+',()=>adjust(delta,button),'cf-resource-step cf-resource-'+direction);
     button.setAttribute('aria-label',(delta<0?'Уменьшить ':'Увеличить ')+label+' на 1');
     button.disabled=!!S.wizard||!!v10Batch||(delta<0?(S.stock[key]||0)===0:(S.stock[key]||0)>=999);
     return button;
   };
   const minus=counter(-1),plus=counter(1);
   tile.before(group);group.append(minus,tile,plus);
 });
 // Batch mode is a draft: do not let side buttons accidentally discard it.
 for(const step of quick.querySelectorAll('.cf-resource-step')){
   const key=step.closest('[data-resource]').dataset.resource;
   step.disabled=!!S.wizard||!!v10Batch||(step.classList.contains('cf-resource-minus')?(S.stock[key]||0)===0:(S.stock[key]||0)>=999);
 }
}
watch('quickStock',refineResources);refineResources();
function tabChrome(){const current=document.querySelector('.tab:not([hidden])')?.id;header.classList.toggle('cf-compact',current!=='rules');document.body.dataset.cfTab=current||'guide';}
document.querySelectorAll('.tab').forEach(t=>new MutationObserver(tabChrome).observe(t,{attributes:true,attributeFilter:['hidden']}));tabChrome();
enhanceBoard();progress();forecast();

// Ornithology card system. Presentation only: existing renderers retain state ownership.
const birdTiming={brown:'При активации',white:'При размещении',pink:'Между ходами',teal:'В конце раунда',yellow:'В конце партии',none:'Без способности'};
const birdNests={bowl:'Чаша',cavity:'Дупло',ground:'На земле',platform:'Платформа',star:'Любое',wild:'Любое'};
const birdReason={'no free habitat':'Нет свободного места','food engine':'Развитие добычи корма','card/tuck synergy':'Комбинация карт и подкладок','bonus synergy':'Подходит к бонусной цели','endgame value':'Ценность в конце партии','habitat and cost':'Среда и стоимость'};
const birdFood={worm:'Червь',seed:'Зерно',fruit:'Ягода',fish:'Рыба',rodent:'Грызун',nectar:'Нектар',any:'Любой корм'};
function ornEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function ornStyle(el,b){el.classList.add('orn-card');el.dataset.habitat=(b.hab||[]).length>1?'multi':b.hab?.[0]||'multi';el.dataset.power=b.color||traits(b).color||'none'}
function ornIcon(k){const img=ornEl('img','orn-food-icon');img.src='./art/res-'+k+'.svg';img.alt=birdFood[k]||k;img.loading='lazy';return img}
function ornFood(b){
 const row=ornEl('span','orn-food');row.setAttribute('aria-label','Корм: '+englishCost(b));
 (b.cost||[]).forEach((opt,i)=>{if(i)row.append(ornEl('span','orn-food-separator','/'));if(!opt.length)row.append(ornEl('span','','0'));opt.forEach(k=>row.append(k==='any'?ornEl('span','orn-any','✳'):ornIcon(k)))});
 if(b.manualCost)row.append(ornEl('small','','Особая стоимость'));return row
}
function ornFacts(b,full=false){
 const facts=ornEl('div','orn-facts');
 const habitats=ornEl('span','orn-habitats',(b.hab||[]).map(h=>H[h]||h).join(' · '));facts.append(habitats);
 const eggs=ornEl('span','orn-fact');eggs.append(ornIcon('eggs'),ornEl('span','',String(b.capacity??'—')));eggs.title='Вместимость яиц';facts.append(eggs);
 if(full&&b.nestType)facts.append(ornEl('span','orn-fact','Гнездо: '+(birdNests[b.nestType]||b.nestType)));
 if(full&&(Number.isFinite(b.span)||b.flightless))facts.append(ornEl('span','orn-fact',b.flightless?'Нелетающая':'↔ '+b.span+' см'));
 return facts
}
function ornArt(b,existing=null){
 const frame=ornEl('div','orn-art');
 const img=existing||ornEl('img','');if(!existing){img.src=portraitFor(b)?portraitUrl(b):'./art/ref-'+(b.hab?.[0]||'forest')+'.webp';img.loading='lazy'}img.alt=portraitFor(b)?b.name:'Иллюстрация среды обитания';img.classList.add('orn-portrait');frame.append(img);
 if(!portraitFor(b))frame.append(ornEl('small','orn-art-caption','Портрет отсутствует'));
 frame.append(ornEl('span','orn-points',String(b.points??'—')));frame.lastElementChild.setAttribute('aria-label','Очки птицы: '+(b.points??'неизвестны'));return frame
}
function ornPower(b){
 const block=ornEl('div','orn-power');block.append(ornEl('small','orn-power-label',birdTiming[b.color||traits(b).color||'none']||'Способность'));
 const p=ornEl('p','',englishPower(b));p.lang='en';block.append(p);return block
}
function ornStrategy(b){
 const panel=ornEl('div','orn-strategy');const reason=fitReason(b);
 const headline=ornEl('b','',birdReason[reason]||reason);panel.append(headline);
 const tags=chosenGoals().filter(n=>qualifiesFor(b,n));
 if(tags.length)panel.append(ornEl('small','','Бонусы: '+tags.join(', ')));
 if(H[b.loc])panel.append(ornEl('small','','В заповеднике · '+H[b.loc]));
 else{
   const free=(b.hab||[]).filter(h=>rowBirds(h).length<5);
   let availability=!free.length?'Нет свободного места':b.manualCost?'Стоимость сверяется вручную':!S.stockKnown?'Корм не подтверждён':!payPlan(b)?'Не хватает корма: '+missingFood(b).labels.join(' + '):Math.min(...free.map(eggPrice))>(S.stock.eggs||0)?'Не хватает яиц':'Известного корма и яиц хватает';
   panel.append(ornEl('small','',availability));
 }
 return panel
}
function ornTitle(b){const h=ornEl('div','orn-name');h.append(ornEl('h2','',b.name));if(b.scientific)h.append(ornEl('i','orn-scientific',b.scientific));return h}
function ornDetail(b){
 const body=ornEl('div','orn-detail');ornStyle(body,b);
 body.append(ornArt(b),ornTitle(b),ornFood(b),ornFacts(b,true),ornPower(b),ornStrategy(b));return body
}
const ornPreview=document.createElement('dialog');ornPreview.id='ornPreview';ornPreview.setAttribute('aria-label','Карточка птицы');document.body.append(ornPreview);
function ornOpen(b){
 if(!b)return;
 const owned=S.birds.find(x=>x.loc!=='discard'&&(x.id===b.id||x.catalogId===b.id||x.name===b.name));
 if(owned){showBird(owned.id);return}
 const detail=ornDetail(b),actions=ornEl('div','orn-actions');
 const available=()=>!S.wizard&&!S.birds.some(x=>x.name===b.name&&x.loc!=='discard');
 const add=makeButton(trayPick!==null?'Выбрать открытую карту':'＋ В руку',()=>{if(!available())return;ornPreview.close();if(trayPick!==null)setTray(b);else dbAdd(b)},'primary wide');add.disabled=!available();actions.append(add);
 if(trayPick===null)for(const h of b.hab||[]){if(rowBirds(h).length>=5)continue;const btn=makeButton('В заповедник · '+H[h],()=>{if(!available()||rowBirds(h).length>=5)return;ornPreview.close();dbAdd(b,h)},'outline-btn wide');btn.disabled=!available();actions.append(btn)}
 actions.append(makeButton('Закрыть',()=>ornPreview.close(),'wide'));ornPreview.replaceChildren(detail,actions);ornPreview.showModal()
}
const ornCatalogIndex=new Map();let ornCatalogSource=null;
function ornCatalog(){
 if(!DB||dbKind!=='birds')return;
 if(ornCatalogSource!==DB){ornCatalogSource=DB;ornCatalogIndex.clear();DB.birds.forEach(b=>ornCatalogIndex.set(b.name,b))}
 for(const row of by('dbList').querySelectorAll('.dbrow:not(.orn-card)')){
   const info=row.querySelector('.grow'),name=info?.querySelector('b'),b=ornCatalogIndex.get(name?.textContent);if(!b)continue;
   ornStyle(row,b);const cards=row.classList.contains('atlas-card');
   const image=row.querySelector('.catalog-art');const art=ornArt(b,image);row.prepend(art);
   const open=makeButton(b.name,()=>ornOpen(b),'orn-title-button');open.setAttribute('aria-label','Открыть карточку '+b.name);name.replaceChildren(open);
   const subtitle=info.querySelector(':scope > small');if(subtitle)subtitle.textContent=b.scientific||dbNames[b.set]||b.set||'';
   const chips=info.querySelector('.chips');if(chips)chips.replaceChildren(ornFood(b),ornFacts(b,cards));
   const power=info.querySelector('.card-power');if(power){const label=ornEl('small','orn-power-label',birdTiming[b.color]||'Способность');power.before(label)}
   // Preserve the engine's original rating and power text; add a compact Russian explanation.
   const rating=info.querySelector('.fit-rating');if(rating){rating.title=rating.textContent;rating.classList.add('orn-engine-rating');rating.after(ornEl('small','orn-reason',birdReason[fitReason(b)]||fitReason(b)))}
   const actions=ornEl('div','orn-actions');for(const ctl of [...row.querySelectorAll(':scope > button,:scope > select')]){if(ctl.tagName==='BUTTON')ctl.textContent=ctl.disabled?'Уже добавлена':trayPick!==null?'Выбрать':'+ В руку';actions.append(ctl)}
   row.append(actions);
 }
}
function ornHand(){
 const list=held();by('hand').querySelectorAll('.handrow:not(.orn-card)').forEach((row,i)=>{
   const b=list[i];if(!b)return;ornStyle(row,b);const img=row.querySelector('.bird-thumb');if(img){const art=ornArt(b,img);row.prepend(art)}
   const info=row.querySelector('.grow'),name=info?.querySelector('b');if(name)name.textContent=b.name;
   if(info&&b.scientific)name.after(ornEl('i','orn-scientific',b.scientific));
   const chips=info?.querySelector('.chips');if(chips)chips.replaceChildren(ornFood(b),ornFacts(b));
   info?.append(ornEl('small','orn-reason',birdReason[fitReason(b)]||fitReason(b)));
 });
}
function ornTray(){
 const birds=trayBirds();by('tray').querySelectorAll('.tray-slot').forEach((row,i)=>{
   const b=birds[i];if(!b||row.classList.contains('orn-card'))return;ornStyle(row,b);
   const art=ornArt(b);const info=row.querySelector('.grow'),name=info?.querySelector('b');row.prepend(art);
   if(name){const open=makeButton(b.name,()=>ornOpen(b),'orn-title-button');name.replaceChildren(open)}
   if(info){if(b.scientific)name.after(ornEl('i','orn-scientific',b.scientific));info.append(ornFood(b),ornFacts(b))}
   const actions=ornEl('div','orn-actions');for(const ctl of [...row.querySelectorAll(':scope > button')])actions.append(ctl);row.append(actions)
 })
}
function ornBoard(){
 by('board').querySelectorAll('.hab').forEach(row=>{
   const h=['forest','grass','water'].find(k=>row.classList.contains(k));if(!h)return;
   const birds=rowBirds(h);
   row.querySelectorAll('.slot:not(.cf-empty)').forEach((slot,i)=>{
     const b=birds[i];if(!b||slot.classList.contains('orn-card'))return;ornStyle(slot,b);
     const points=ornEl('small','orn-mini-points',String(b.points??'—'));points.title='Очки птицы';slot.prepend(points);
     const img=slot.querySelector('img');if(img&&!portraitFor(b))img.title='Условная иллюстрация; портрет отсутствует';
   })
 })
}
function ornOwned(){
 const info=by('birdInfo');if(info.querySelector('.orn-detail'))return;
 const name=info.querySelector('h2')?.textContent,b=S.birds.find(x=>x.name===name&&x.loc!=='discard')||S.birds.find(x=>x.name===name);if(!b)return;
 info.replaceChildren(ornDetail(b),ornEl('small','orn-snapshot-note','Изменения — только снимок состояния, без оплаты или активации.'));
}
watch('dbList',ornCatalog);watch('hand',ornHand);watch('tray',ornTray);watch('board',ornBoard);watch('birdInfo',ornOwned);
ornCatalog();ornHand();ornTray();ornBoard();

})();
