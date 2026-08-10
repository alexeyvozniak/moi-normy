(()=>{
  'use strict';
  let resetEditId=null;

  const $=id=>document.getElementById(id);
  const today=()=>localDateKey();
  const num=(v,d=0)=>Math.max(0,safeNumber(v,d));

  function addPrayerCovers(){
    const extra=[
      {id:'prayer_icons_jp',name:'Молитва перед иконами',src:'images/prayer_icons.webp',tags:'молитва · иконы · тишина'},
      {id:'prayer_prostration_jp',name:'Земной поклон',src:'images/prayer_prostration.webp',tags:'молитва · земной поклон'},
      {id:'prayer_bow_jp',name:'Поясной поклон',src:'images/prayer_bow.webp',tags:'молитва · поясной поклон'}
    ];
    for(const a of extra){if(!assets.some(x=>x.src===a.src))assets.push(a);}
    try{renderCatalog();}catch(e){}
  }

  function ensureCounterMode(){
    if($('counterModeBox'))return;
    const interval=$('intervalField');
    if(!interval)return;
    const box=document.createElement('div');
    box.id='counterModeBox';box.className='counterModeBox';
    box.innerHTML=`<label for="counterMode">Режим счётчика</label>
      <select id="counterMode">
        <option value="carry">Накопительный — остаток переносится</option>
        <option value="reset">Каждый день заново — остаток сгорает</option>
      </select>
      <div class="counterModeHelp" id="counterModeHelp"></div>`;
    interval.insertAdjacentElement('afterend',box);
    $('counterMode').addEventListener('change',()=>{
      if($('counterMode').value==='reset')$('eDebt').value=num($('eIncrement').value,1);
      updateCounterUi();
    });
    $('eIncrement').addEventListener('input',()=>{
      if($('counterMode')?.value==='reset')$('eDebt').value=num($('eIncrement').value,1);
    });
    $('bookModeEnabled')?.addEventListener('change',updateCounterUi);
  }

  function updateCounterUi(){
    ensureCounterMode();
    const bookOn=!!$('bookModeEnabled')?.checked;
    const sel=$('counterMode');
    if(bookOn){sel.value='carry';sel.disabled=true;}else sel.disabled=false;
    const reset=!bookOn&&sel.value==='reset';
    const period=$('ePeriod'),interval=$('eIntervalDays');
    if(reset){period.value='daily';period.disabled=true;if(interval)interval.disabled=true;toggleIntervalField();}
    else{period.disabled=false;if(interval)interval.disabled=false;toggleIntervalField();}
    const incLabel=$('eIncrement')?.closest('.field')?.querySelector('label');
    const debtLabel=$('eDebt')?.closest('.field')?.querySelector('label');
    if(incLabel)incLabel.textContent=reset?'Цель на день':'Начислять';
    if(debtLabel)debtLabel.textContent=reset?'Осталось сегодня':'Текущий долг';
    const help=$('counterModeHelp');
    if(help)help.innerHTML=bookOn?'Для режима книги дневной темп рассчитывается отдельно.':reset?'<strong>С чистого дня.</strong> Невыполненный остаток не переносится: завтра снова будет полная дневная цель.':'Невыполненное переносится дальше и складывается с новой нормой.';
  }

  function fillCounterMode(id){
    ensureCounterMode();resetEditId=id||null;
    const item=id?state.items.find(x=>x.id===id):null;
    const reset=item?.resetMode==='daily';
    $('counterMode').value=reset?'reset':'carry';
    if(reset){
      $('eIncrement').value=num(item.dailyTarget,1);
      $('ePeriod').value='daily';
      $('eDebt').value=num(item.debt,0);
    }
    updateCounterUi();
  }

  function wrapEditor(){
    ensureCounterMode();
    const original=window.openEditor;
    if(typeof original==='function'&&!original.__resetModeWrapped){
      const wrapped=function(id=null){resetEditId=id||null;original(id);setTimeout(()=>fillCounterMode(id),0);};
      wrapped.__resetModeWrapped=true;window.openEditor=wrapped;
    }
    const saveBtn=$('saveTask');
    if(!saveBtn||saveBtn.dataset.resetModeHook)return;
    saveBtn.dataset.resetModeHook='1';
    saveBtn.addEventListener('click',()=>{
      ensureCounterMode();
      const bookOn=!!$('bookModeEnabled')?.checked;
      const mode=bookOn?'carry':$('counterMode').value;
      const target=num($('eIncrement').value,1);
      const idsBefore=new Set((state.items||[]).map(x=>x.id));
      const editingId=resetEditId;

      if(mode==='reset'){
        $('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;
        $('ePeriod').value='daily';
      }

      setTimeout(()=>{
        let item=editingId?state.items.find(x=>x.id===editingId):null;
        if(!item)item=(state.items||[]).find(x=>!idsBefore.has(x.id));
        if(!item)return;
        if(mode==='reset'){
          item.resetMode='daily';
          item.dailyTarget=target;
          item.resetDay=today();
          item.increment=0;
          item.period='daily';
          item.lastAccrual=today();
          item.debt=num(item.debt,target);
        }else if(item.resetMode==='daily'){
          const fallback=num(item.dailyTarget,target||1);
          delete item.resetMode;delete item.dailyTarget;delete item.resetDay;
          item.increment=target||fallback;
          item.period=$('ePeriod')?.value||'daily';
          item.lastAccrual=today();
        }
        save();
        render();
      },60);
    },true);
  }

  function applyDailyReset(){
    const d=today();let changed=false;
    for(const item of state.items||[]){
      if(item.resetMode!=='daily')continue;
      item.dailyTarget=num(item.dailyTarget,item.increment||1);
      if(item.increment!==0){item.increment=0;changed=true;}
      item.period='daily';item.lastAccrual=d;
      if(item.resetDay!==d){
        item.debt=item.paused?0:item.dailyTarget;
        item.resetDay=d;changed=true;
      }
    }
    if(changed)save();
    return changed;
  }

  function decorateResetCards(){
    const cards=[...document.querySelectorAll('#cards .task')];
    (state.items||[]).forEach((item,i)=>{
      if(item.resetMode!=='daily')return;
      const card=cards[i];if(!card)return;
      const title=card.querySelector('.taskName');
      if(title&&!title.parentElement.querySelector('.resetModeBadge')){
        const badge=document.createElement('div');badge.className='resetModeBadge';badge.textContent='с чистого дня';title.parentElement.insertBefore(badge,title);
      }
      const rule=card.querySelector('.taskRule');
      if(rule)rule.textContent=`${item.dailyTarget} ${item.unit} каждый день · без переноса`;
      const note=card.querySelector('.debtNote');
      if(note)note.textContent=item.debt>0?`Сегодня осталось ${item.debt} ${item.unit}. Завтра счётчик снова начнётся с ${item.dailyTarget}.`:'На сегодня выполнено. Завтра счётчик начнётся заново.';
    });
  }

  function ensureNotesExport(){
    if($('notesExportPanel'))return;
    const settings=$('settingsOverlay')?.querySelector('.sheet');if(!settings)return;
    const featureRow=$('featureSettingsRow');
    const panel=document.createElement('div');panel.id='notesExportPanel';panel.className='notesExportPanel';
    panel.innerHTML=`<div class="notesExportTitle">Заметки чтения и медитации</div><div class="notesExportText">Выгрузить все сохранённые заметки в один читаемый Markdown-файл. Его можно открыть в Obsidian, Notion, Bear или обычном текстовом редакторе.</div><button class="button" id="exportNotesBtn">Выгрузить заметки</button>`;
    if(featureRow)featureRow.insertAdjacentElement('afterend',panel);else settings.appendChild(panel);
    $('exportNotesBtn').addEventListener('click',exportNotes);
  }

  function noteKindLabel(h){
    if(h.note?.kind==='meditation')return 'Медитация';
    if(h.note?.kind==='reading')return 'Чтение';
    return /медит|созерц/i.test(h.item||'')?'Медитация':'Чтение';
  }
  function exportNotes(){
    const rows=(state.history||[]).filter(h=>h.note&&(h.note.title||h.note.body)).slice().reverse();
    if(!rows.length){alert('Пока нет заметок для выгрузки.');return;}
    const out=['# Заметки «Правила»','',`Экспорт: ${new Intl.DateTimeFormat('ru-RU',{dateStyle:'long'}).format(new Date())}`,''];
    for(const h of rows){
      const date=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(h.ts));
      const kind=noteKindLabel(h);
      out.push(`## ${date} · ${kind}`);
      if(h.item)out.push(`**${kind==='Чтение'?'Книга / действие':'Действие'}:** ${h.item}`);
      if(h.amount)out.push(`**Выполнено:** ${h.amount} ${h.unit||''}`.trim());
      if(h.note.title)out.push(`**${kind==='Медитация'?'Тема':'Тема / глава'}:** ${h.note.title}`);
      out.push('');
      if(h.note.body)out.push(h.note.body,'');
      out.push('---','');
    }
    const blob=new Blob(['\ufeff'+out.join('\n')],{type:'text/markdown;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pravilo-zametki-${today()}.md`;document.body.appendChild(a);a.click();const href=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(href),1200);
  }

  function init(){
    addPrayerCovers();ensureCounterMode();wrapEditor();ensureNotesExport();
    const changed=applyDailyReset();
    if(changed)render();
    decorateResetCards();
    const cards=$('cards');if(cards)new MutationObserver(decorateResetCards).observe(cards,{childList:true,subtree:false});
    document.addEventListener('click',e=>{
      const edit=e.target.closest?.('.editButton');
      if(edit){const m=(edit.getAttribute('onclick')||'').match(/openEditor\('([^']+)'\)/);if(m)setTimeout(()=>fillCounterMode(m[1]),20);}
      if(e.target.closest?.('#addBtn'))setTimeout(()=>fillCounterMode(null),20);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
