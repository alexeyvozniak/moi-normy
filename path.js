(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let editorSnapshot=null;

  function ensureJournal(){
    if(!Array.isArray(state.pathJournal))state.pathJournal=[];
    if(!state.pathMeta||typeof state.pathMeta!=='object')state.pathMeta={};
    if(!state.pathMeta.books)state.pathMeta.books={};
  }
  function journal(type,title,text='',itemId=''){
    ensureJournal();
    const entry={id:uid(),ts:new Date().toISOString(),type,title,text,itemId};
    state.pathJournal.unshift(entry);state.pathJournal=state.pathJournal.slice(0,400);save();
    if(!$('pathView')?.classList.contains('hidden'))renderPath();
    return entry;
  }
  window.praviloJournal=journal;

  function fmtDate(ts){try{return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(ts));}catch(e){return '';}}
  function addTab(){
    if(document.querySelector('.tab[data-tab="path"]'))return;
    const historyTab=document.querySelector('.tab[data-tab="history"]');
    const button=document.createElement('button');button.className='tab';button.dataset.tab='path';button.type='button';button.textContent='Путь';historyTab?.insertAdjacentElement('afterend',button);
    const section=document.createElement('section');section.id='pathView';section.className='hidden';section.innerHTML=`<div class="pathHero"><div class="pathHeroCopy"><div class="pathKicker">Личная рукопись</div><div class="pathTitle">Путь</div><div class="pathLead">Книги, заметки, изменения правила и завершённые практики — без очков, серий и оценок.</div></div></div><div id="pathTimeline" class="pathTimeline"></div>`;$('catalogView')?.parentElement?.appendChild(section);
    button.addEventListener('click',openPath);
    document.addEventListener('click',e=>{const tab=e.target.closest?.('.tab');if(tab&&tab.dataset.tab!=='path')section.classList.add('hidden');},true);
  }
  function openPath(){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='path'));['todayView','weekView','historyView','catalogView'].forEach(id=>$(id)?.classList.add('hidden'));$('pathView')?.classList.remove('hidden');renderPath();}

  function bookEvents(){
    ensureJournal();let changed=false;
    for(const item of state.items||[]){
      const plan=item.readingPlan;if(!plan)continue;
      const meta=state.pathMeta.books[item.id]||{},fingerprint=`${plan.title}|${plan.totalPages}|${plan.deadline}`;
      if(meta.fingerprint!==fingerprint){
        state.pathJournal.unshift({id:uid(),ts:new Date().toISOString(),type:'book_start',title:`Начата книга «${plan.title}»`,text:`${plan.totalPages} стр. · срок до ${fmtDate(plan.deadline+'T12:00:00')}`,itemId:item.id});
        state.pathMeta.books[item.id]={fingerprint,completed:false};changed=true;
      }
      const current=state.pathMeta.books[item.id];
      if(Number(item.debt)===0&&!current.completed){
        state.pathJournal.unshift({id:uid(),ts:new Date().toISOString(),type:'book_done',title:`Дочитана книга «${plan.title}»`,text:`${plan.totalPages} страниц`,itemId:item.id});
        current.completed=true;changed=true;
      }else if(Number(item.debt)>0&&current.completed){
        const index=state.pathJournal.findIndex(entry=>entry.type==='book_done'&&entry.itemId===item.id);
        if(index>=0)state.pathJournal.splice(index,1);
        current.completed=false;changed=true;
      }
    }
    if(changed){state.pathJournal=state.pathJournal.slice(0,400);save();}
  }
  function entries(){
    ensureJournal();const out=state.pathJournal.map(x=>({...x,source:'journal',sourceId:x.id}));
    for(const h of state.history||[]){if(!h.note)continue;const med=h.note.kind==='meditation';out.push({id:`note-${h.id}`,sourceId:h.id,source:'history',ts:h.ts,type:'note',title:h.note.title||(med?'Заметка после медитации':'Заметка о чтении'),text:h.note.body||'',itemId:h.itemId,tag:med?'медитация':'чтение'});}
    return out.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  }
  async function deleteEntry(source,id){
    const row=entries().find(x=>x.source===source&&String(x.sourceId)===String(id));
    const title=row?.title||'эту запись';
    const ok=await (window.praviloConfirm?.({kicker:'Путь',title:'Удалить запись из «Пути»?',message:`«${title}» будет удалена${source==='history'?' вместе со связанной записью истории':''}.`,confirmText:'Удалить',danger:true})??Promise.resolve(false));
    if(!ok)return;
    if(source==='history')state.history=state.history.filter(h=>h.id!==id);else state.pathJournal=state.pathJournal.filter(x=>x.id!==id);
    save();render();renderPath();
  }
  function actionHtml(){return '<button type="button" class="entryMore pathEntryMore" aria-label="Удалить запись" title="Удалить запись">×</button>';}
  function renderPath(){
    bookEvents();const root=$('pathTimeline');if(!root)return;const rows=entries();
    if(!rows.length){root.innerHTML='<div class="pathEmpty">Здесь постепенно появится твоя рукопись: завершённые практики, книги, заметки и изменения правила.</div>';return;}
    root.innerHTML=rows.map(x=>{const tag=x.tag||({book_start:'книга',book_done:'книга завершена',prayer_done:'молитва',meditation_done:'медитация',rule:'изменение правила',note:'заметка'}[x.type]||'путь');return `<article class="pathEntry ${x.type==='note'?'note':''}" data-source="${x.source}" data-source-id="${escapeHtml(x.sourceId)}"><div class="pathDate">${fmtDate(x.ts)}</div><div class="pathEntryTitle">${escapeHtml(x.title)}</div>${x.text?`<div class="pathEntryText">${escapeHtml(x.text)}</div>`:''}<div class="pathTag">${escapeHtml(tag)}</div>${actionHtml()}</article>`;}).join('');
  }
  function snapshot(id){const item=id?state.items.find(x=>x.id===id):null;if(!item)return null;return {id:item.id,name:item.name,increment:item.increment,period:item.period,intervalDays:item.intervalDays,quick:item.quick,paused:item.paused,resetMode:item.resetMode,dailyTarget:item.dailyTarget,readingPlan:item.readingPlan?JSON.stringify(item.readingPlan):''};}
  function ruleText(item){if(item.readingPlan)return `Книга «${item.readingPlan.title}» · до ${fmtDate(item.readingPlan.deadline+'T12:00:00')}`;if(item.resetMode==='daily')return `${item.dailyTarget} ${item.unit} каждый день без переноса`;return `${item.increment} ${item.unit} · ${item.period}`;}
  function onEditorOpen(event){editorSnapshot=snapshot(event.detail?.id);}
  function onEditorSaved(event){
    const before=editorSnapshot,item=state.items.find(x=>x.id===event.detail?.id);editorSnapshot=null;if(!before||!item)return;
    const after={name:item.name,increment:item.increment,period:item.period,intervalDays:item.intervalDays,quick:item.quick,paused:item.paused,resetMode:item.resetMode,dailyTarget:item.dailyTarget,readingPlan:item.readingPlan?JSON.stringify(item.readingPlan):''};const old={name:before.name,increment:before.increment,period:before.period,intervalDays:before.intervalDays,quick:before.quick,paused:before.paused,resetMode:before.resetMode,dailyTarget:before.dailyTarget,readingPlan:before.readingPlan};
    if(JSON.stringify(after)!==JSON.stringify(old))journal('rule',`Изменено правило «${item.name}»`,ruleText(item),item.id);
  }
  function init(){
    ensureJournal();addTab();bookEvents();
    window.addEventListener('pravilo:render',()=>{bookEvents();if(!$('pathView')?.classList.contains('hidden'))renderPath();});
    window.addEventListener('pravilo:editor-open',onEditorOpen);window.addEventListener('pravilo:editor-saved',onEditorSaved);
    $('pathTimeline')?.addEventListener('click',e=>{const button=e.target.closest('.entryMore');if(!button)return;e.preventDefault();e.stopPropagation();const row=button.closest('.pathEntry');deleteEntry(row.dataset.source,row.dataset.sourceId);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
