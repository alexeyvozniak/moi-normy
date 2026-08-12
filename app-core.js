/* Core state + rendering for «Правило». Keep feature modules out of this file. */
'use strict';

var STORAGE_KEY='pravilo_v1';
var assets=[
  {id:'prayer',name:'Молитва',src:'images/prayer_person_beads.webp',tags:'молитва'},
  {id:'reading',name:'Чтение',src:'images/reading_person_book.webp',tags:'чтение'},
  {id:'contemplation',name:'Созерцание',src:'images/contemplation_looking_up.webp',tags:'тишина'},
  {id:'sport',name:'Тренировка',src:'images/samurai_training.webp',tags:'спорт'},
  {id:'onsen',name:'Отдых',src:'images/selfcare_onsen.webp',tags:'отдых'},
  {id:'calligraphy',name:'Каллиграфия',src:'images/calligraphy_ink.webp',tags:'творчество'},
  {id:'wanderer',name:'Путь',src:'images/walking_path.webp',tags:'прогулка'},
  {id:'book',name:'Книга',src:'images/open_book.webp',tags:'чтение'},
  {id:'desk',name:'Рабочий стол',src:'images/books_notes.webp',tags:'работа'},
  {id:'enso',name:'Энсо',src:'images/enso.webp',tags:'образ'}
];
var quotes=[
  {text:'Молитву совершай с усердием и со вниманием.',author:'прп. Антоний Великий'},
  {text:'Из всего старайся извлекать себе назидание.',author:'прп. авва Дорофей'},
  {text:'Во всём спрашивай прежде свою совесть.',author:'прп. авва Дорофей'},
  {text:'Возлюби безмолвие гораздо более дел.',author:'прп. Исаак Сирин'}
];

var editId=null;
var amountId=null;
var selectedImage='';
var currentTab='today';

function $(id){return document.getElementById(id);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function localDateKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function today(){return localDateKey();}
function safeNumber(value,fallback=0){const n=Number(value);return Number.isFinite(n)?n:fallback;}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
var esc=escapeHtml;
function ask(options){
  if(typeof window.praviloConfirm==='function')return window.praviloConfirm(options);
  return Promise.resolve(window.confirm(options?.message||options?.title||'Подтвердить действие?'));
}

function defaultPracticeType(name){
  if(/молитв|иисус/i.test(name))return 'prayer';
  if(/медит|созерц/i.test(name))return 'meditation';
  return '';
}
function freshState(){
  return {
    version:3,
    dayQuoteOffset:0,
    items:[
      {id:uid(),name:'Иисусова молитва',increment:200,unit:'молитв',period:'daily',intervalDays:1,quick:50,debt:200,practiceType:'prayer',image:'images/prayer_person_beads.webp',paused:false,lastAccrual:today()},
      {id:uid(),name:'Чтение',increment:15,unit:'страниц',period:'daily',intervalDays:1,quick:5,debt:15,image:'images/reading_person_book.webp',paused:false,lastAccrual:today()},
      {id:uid(),name:'Созерцание',increment:1,unit:'сессий',period:'weekly',intervalDays:7,quick:1,debt:1,practiceType:'meditation',image:'images/contemplation_looking_up.webp',paused:false,lastAccrual:today()}
    ],
    history:[],
    reminders:[]
  };
}
function normalizeState(candidate){
  const s=candidate&&typeof candidate==='object'?candidate:freshState();
  if(!Array.isArray(s.items))s.items=[];
  if(!Array.isArray(s.history))s.history=[];
  if(!Array.isArray(s.reminders))s.reminders=[];
  s.version=Math.max(3,safeNumber(s.version,1));
  s.dayQuoteOffset=safeNumber(s.dayQuoteOffset,0);
  s.items.forEach(item=>{
    item.increment=Math.max(0,safeNumber(item.increment,0));
    item.debt=Math.max(0,safeNumber(item.debt,0));
    item.quick=Math.max(0.01,safeNumber(item.quick,1));
    item.intervalDays=Math.max(1,safeNumber(item.intervalDays,2));
    item.period=item.period||'daily';
    item.unit=item.unit||'ед.';
    item.image=item.image||'images/enso.webp';
    item.paused=!!item.paused;
    item.lastAccrual=item.lastAccrual||today();
    if(!item.practiceType){const inferred=defaultPracticeType(item.name||'');if(inferred)item.practiceType=inferred;}
  });
  return s;
}
function load(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)return normalizeState(JSON.parse(raw));}catch(error){console.warn('[Правило] Не удалось прочитать локальные данные',error);}
  return freshState();
}
var state=load();
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('pravilo:state-saved'));}
  catch(error){console.error('[Правило] Не удалось сохранить данные',error);}
}
function logAction(item,amount,source='manual'){
  if(!item||!amount)return null;
  const entry={id:uid(),ts:new Date().toISOString(),day:today(),itemId:item.id,item:item.name,amount:Number(amount),unit:item.unit,source};
  state.history.unshift(entry);state.history=state.history.slice(0,1000);return entry;
}

function periodText(item){
  if(item.readingPlan)return 'режим книги';
  if(item.resetMode==='daily')return `${safeNumber(item.dailyTarget,item.increment)} ${item.unit} каждый день`;
  if(item.period==='daily')return `+${item.increment} каждый день`;
  if(item.period==='weekly')return `+${item.increment} каждую неделю`;
  if(item.period==='monthly')return `+${item.increment} каждый месяц`;
  return `+${item.increment} каждые ${item.intervalDays} дн.`;
}
function renderDayQuote(){
  const text=$('dayQuoteText'),author=$('dayQuoteAuthor');if(!text||!author||!quotes.length)return;
  const q=quotes[(new Date().getDate()+safeNumber(state.dayQuoteOffset,0))%quotes.length];
  text.textContent=q.text;author.textContent='— '+q.author;
}
function renderStats(){
  const el=$('stats');if(!el)return;
  const active=state.items.filter(i=>!i.paused).length;
  const debt=state.items.filter(i=>i.debt>0&&!i.paused).length;
  const done=state.history.filter(h=>h.day===today()).length;
  el.innerHTML=`<div class="stat"><img src="images/stat_active.webp" alt=""><div><div class="statNum">${active}</div><div class="statLabel">активных</div></div></div><div class="stat"><img src="images/stat_debt.webp" alt=""><div><div class="statNum">${debt}</div><div class="statLabel">с долгом</div></div></div><div class="stat"><img src="images/stat_done.webp" alt=""><div><div class="statNum">${done}</div><div class="statLabel">сделано сегодня</div></div></div>`;
}
function cardHtml(item){
  const special=item.readingPlan?`<div class="bookIdentity"><span class="bookIdentityLabel">книга</span><span class="bookIdentityTitle">${esc(item.readingPlan.title||item.name)}</span></div>`:'';
  return `<article class="task" data-item-id="${esc(item.id)}"><div class="taskTop"><div><div class="taskName">${esc(item.name)}</div><div class="taskRule">${esc(periodText(item))}</div>${special}</div><img class="taskImage" src="${esc(item.image)}" alt=""></div><div class="debtLine"><div class="debtNumber">${item.debt}</div><div class="debtUnit">${esc(item.unit)} осталось</div></div><div class="debtNote"></div><div class="controlRow"><button class="button primary" data-action="amount" data-id="${esc(item.id)}">Списать</button><button class="button" data-action="quick" data-id="${esc(item.id)}">−${item.quick}</button><button class="button" data-action="close" data-id="${esc(item.id)}">Закрыть</button></div><div class="subRow"><button class="editButton" data-action="edit" data-id="${esc(item.id)}">Изменить</button></div></article>`;
}
function renderCards(){const el=$('cards');if(el)el.innerHTML=state.items.map(cardHtml).join('');}
function renderWeek(){
  const el=$('weekPanel');if(!el)return;
  el.innerHTML=state.items.map(i=>`<div class="weekItem"><b>${esc(i.name)}</b> · осталось ${i.debt} ${esc(i.unit)}</div>`).join('')||'<div class="empty">Пока пусто.</div>';
}
function renderHistory(){
  const el=$('historyPanel');if(!el)return;
  el.innerHTML=state.history.slice(0,80).map(h=>`<div class="historyItem" data-history-id="${esc(h.id)}"><div><b>${esc(h.item)}</b><div class="smallText">${new Date(h.ts).toLocaleString('ru-RU')}</div></div><div class="historyAmount">−${h.amount}</div></div>`).join('')||'<div class="empty">История пока пуста.</div>';
}
function renderCatalog(){const el=$('catalog');if(el)el.innerHTML=assets.map(a=>`<div class="galleryCard"><img src="${a.src}" alt=""><div class="galleryMeta"><b>${esc(a.name)}</b><div class="smallText">${esc(a.tags)}</div></div></div>`).join('');}
function render(){
  const date=$('date');if(date)date.textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  renderDayQuote();renderStats();renderCards();renderWeek();renderHistory();renderCatalog();
  window.dispatchEvent(new CustomEvent('pravilo:render'));
}

function show(id){$(id)?.classList.add('show');}
function hide(id){$(id)?.classList.remove('show');}
function openAmount(id){
  amountId=id;const item=state.items.find(x=>x.id===id);if(!item)return;
  $('amountTitle').textContent='Списать: '+item.name;$('amountHint').textContent=`Сейчас осталось ${item.debt} ${item.unit}.`;$('amountInput').value='';show('amountOverlay');
}
function subtract(id,n,source='manual'){
  const item=state.items.find(x=>x.id===id);if(!item)return;
  const amount=Math.min(item.debt,Math.max(0,safeNumber(n,0)));if(!amount)return;
  item.debt=Math.max(0,item.debt-amount);logAction(item,amount,source);save();render();
}
function picker(){const el=$('imagePicker');if(el)el.innerHTML=assets.map(a=>`<button type="button" class="pick ${selectedImage===a.src?'selected':''}" data-image-src="${esc(a.src)}"><img src="${a.src}" alt=""><span>${esc(a.name)}</span></button>`).join('');}
function selectImage(src){selectedImage=src;if($('eImageUrl'))$('eImageUrl').value='';picker();}
function toggleIntervalField(){const f=$('intervalField'),p=$('ePeriod');if(f&&p)f.classList.toggle('hidden',p.value!=='interval');}
function setPauseSwitch(on){const button=$('pauseSwitch');if(!button)return;button.classList.toggle('on',!!on);button.setAttribute('aria-pressed',on?'true':'false');}
function openEditor(id=null){
  editId=id;const item=id?state.items.find(x=>x.id===id):null;
  $('editorTitle').textContent=item?'Изменить норму':'Новая норма';
  $('eName').value=item?.name||'';$('eIncrement').value=item?.increment??1;$('eUnit').value=item?.unit||'';$('ePeriod').value=item?.period||'daily';$('eIntervalDays').value=item?.intervalDays??2;$('eQuick').value=item?.quick??1;$('eDebt').value=item?.debt??1;
  selectedImage=item?.image||'images/enso.webp';$('eImageUrl').value='';setPauseSwitch(!!item?.paused);$('deleteTask').classList.toggle('hidden',!item);toggleIntervalField();picker();show('editorOverlay');
  window.dispatchEvent(new CustomEvent('pravilo:editor-open',{detail:{id}}));
}
function saveEditor(){
  let item=editId?state.items.find(x=>x.id===editId):null;
  if(!item){item={id:uid(),lastAccrual:today()};state.items.push(item);}
  item.name=$('eName').value.trim()||'Новая норма';item.increment=Math.max(0,safeNumber($('eIncrement').value,0));item.unit=$('eUnit').value.trim()||'ед.';item.period=$('ePeriod').value;item.intervalDays=Math.max(1,safeNumber($('eIntervalDays').value,2));item.quick=Math.max(.01,safeNumber($('eQuick').value,1));item.debt=Math.max(0,safeNumber($('eDebt').value,0));item.image=$('eImageUrl').value.trim()||selectedImage;item.paused=$('pauseSwitch').classList.contains('on');
  if(!item.practiceType){const inferred=defaultPracticeType(item.name);if(inferred)item.practiceType=inferred;}
  save();hide('editorOverlay');render();window.dispatchEvent(new CustomEvent('pravilo:editor-saved',{detail:{id:item.id}}));
}
async function deleteCurrentTask(){
  if(!editId)return;
  const item=state.items.find(i=>i.id===editId);if(!item)return;
  const ok=await ask({kicker:'Удаление',title:'Удалить занятие?',message:`«${item.name}» исчезнет из списка занятий. История выполненного останется отдельно.`,confirmText:'Удалить',danger:true});
  if(!ok)return;
  state.items=state.items.filter(i=>i.id!==editId);save();hide('editorOverlay');render();
}
function switchTab(tab){
  currentTab=tab;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  ['today','week','history','catalog'].forEach(x=>$(x+'View')?.classList.toggle('hidden',x!==tab));
}
function exportState(){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.href=url;a.download='pravilo-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function bindCoreUi(){
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>hide(b.dataset.close)));
  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  $('cards')?.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;if(b.dataset.action==='amount')openAmount(id);if(b.dataset.action==='quick'){const item=state.items.find(x=>x.id===id);subtract(id,item?.quick||0,'quick');}if(b.dataset.action==='close'){const item=state.items.find(x=>x.id===id);subtract(id,item?.debt||0,'close');}if(b.dataset.action==='edit')openEditor(id);});
  $('imagePicker')?.addEventListener('click',e=>{const b=e.target.closest('[data-image-src]');if(b){e.preventDefault();selectImage(b.dataset.imageSrc);}});
  $('amountSave')?.addEventListener('click',()=>{subtract(amountId,$('amountInput').value);hide('amountOverlay');});
  $('saveTask')?.addEventListener('click',saveEditor);
  $('deleteTask')?.addEventListener('click',deleteCurrentTask);
  $('pauseSwitch')?.addEventListener('click',()=>setPauseSwitch(!$('pauseSwitch').classList.contains('on')));
  $('ePeriod')?.addEventListener('change',toggleIntervalField);
  $('addBtn')?.addEventListener('click',()=>openEditor());
  $('settingsBtn')?.addEventListener('click',()=>show('settingsOverlay'));
  $('dayQuote')?.addEventListener('click',()=>{state.dayQuoteOffset=(safeNumber(state.dayQuoteOffset,0)+1)%Math.max(1,quotes.length);save();renderDayQuote();});
  $('exportBtn')?.addEventListener('click',exportState);
  $('importBtn')?.addEventListener('click',()=>$('importFile')?.click());
  $('importFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=normalizeState(JSON.parse(r.result));state=x;save();render();hide('settingsOverlay');}catch(_){alert('Не удалось прочитать файл.');}};r.readAsText(f);});
  $('clearHistory')?.addEventListener('click',async()=>{const ok=await ask({kicker:'История',title:'Очистить всю историю?',message:'Будут удалены записи о выполненных действиях и связанные с ними заметки. Сами занятия останутся.',confirmText:'Очистить',danger:true});if(ok){state.history=[];save();render();}});
  $('resetAll')?.addEventListener('click',async()=>{const ok=await ask({kicker:'Сброс',title:'Сбросить всё приложение?',message:'Все занятия, история и настройки будут заменены исходным набором. Перед этим лучше сделать экспорт.',confirmText:'Сбросить всё',danger:true});if(ok){state=freshState();save();render();hide('settingsOverlay');}});
}

function initCore(){bindCoreUi();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(r=>r.update()).catch(error=>console.warn('[Правило] service worker',error));window.dispatchEvent(new CustomEvent('pravilo:core-ready'));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initCore,{once:true});else initCore();
