(()=>{
  'use strict';
  let entryId=null;
  const $=id=>document.getElementById(id);
  const itemById=id=>state.items.find(x=>x.id===id);
  const kindOf=entry=>{
    const item=itemById(entry.itemId);
    if(item?.practiceType==='meditation'||/медит|созерц|тишин/i.test(`${item?.name||''} ${entry.item||''}`))return 'meditation';
    if(item?.readingPlan||/чтен|книг|страниц/i.test(`${item?.name||''} ${entry.item||''} ${entry.unit||''}`))return 'reading';
    return null;
  };
  function toast(text){let t=$('notesToast');if(!t){t=document.createElement('div');t.id='notesToast';t.className='toast';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2000);}
  function ensureOverlay(){
    if($('noteFeatureOverlay'))return;
    const o=document.createElement('div');o.id='noteFeatureOverlay';o.className='featureOverlay';o.innerHTML=`<div class="featureSheet"><div class="featureGrabber"></div><div class="featureSheetHead"><div><div class="featureKicker" id="noteKicker"></div><div class="featureTitle">Заметка</div><div class="featureLead" id="noteLead"></div></div><button class="featureClose" type="button" data-note-close>✕</button></div><div class="featureField"><label id="noteSubjectLabel">Название / тема</label><input id="noteSubject"></div><div class="featureField"><label>Содержание / наблюдения</label><textarea id="noteBody"></textarea></div><div class="featureActions"><button class="button" type="button" data-note-close>Не сейчас</button><button class="button primary" type="button" id="noteSave">Сохранить</button></div></div>`;document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show');});o.querySelectorAll('[data-note-close]').forEach(b=>b.addEventListener('click',()=>o.classList.remove('show')));$('noteSave').addEventListener('click',saveNote);
  }
  function openNote(id){
    ensureOverlay();const entry=state.history.find(h=>h.id===id);if(!entry)return;entryId=id;const kind=kindOf(entry),item=itemById(entry.itemId);
    if(kind==='meditation'){$('noteKicker').textContent='После медитации';$('noteLead').textContent='Тему можно назвать сейчас, даже если она пришла только в конце практики.';$('noteSubjectLabel').textContent='Название / тема медитации';}
    else{$('noteKicker').textContent=item?.readingPlan?'Чтение книги':'После чтения';$('noteLead').textContent=item?.readingPlan?`«${item.readingPlan.title}» · прочитано ${entry.amount} ${entry.unit||'стр.'}`:`Прочитано ${entry.amount} ${entry.unit||'стр.'}`;$('noteSubjectLabel').textContent='Тема / глава';}
    $('noteSubject').value=entry.note?.title||entry.meditationTopic||'';$('noteBody').value=entry.note?.body||'';$('noteFeatureOverlay').classList.add('show');setTimeout(()=>$('noteSubject')?.focus(),100);
  }
  function saveNote(){
    const entry=state.history.find(h=>h.id===entryId);if(!entry)return;const title=$('noteSubject').value.trim(),body=$('noteBody').value.trim();if(!title&&!body){toast('Заметка пустая');return;}
    entry.note={kind:kindOf(entry),title,body,createdAt:new Date().toISOString()};save();$('noteFeatureOverlay').classList.remove('show');renderHistory();decorateHistory();
  }
  function decorateHistory(){
    const panel=$('historyPanel');if(!panel)return;const rows=[...panel.querySelectorAll('.historyItem')],entries=state.history.slice(0,80);
    rows.forEach((row,i)=>{row.querySelectorAll('.notesExtra').forEach(x=>x.remove());const entry=entries[i];if(!entry)return;const kind=kindOf(entry);if(!kind)return;
      if(entry.note){const n=document.createElement('div');n.className='historyNote notesExtra';n.innerHTML=`<div class="historyNoteTag">${kind==='meditation'?'медитация':'чтение'}</div>${entry.note.title?`<div class="historyNoteTitle">${escapeHtml(entry.note.title)}</div>`:''}${entry.note.body?`<div class="historyNoteBody">${escapeHtml(entry.note.body)}</div>`:''}`;row.appendChild(n);}
      else{const b=document.createElement('button');b.type='button';b.className='historyNoteButton notesExtra';b.textContent='+ добавить заметку';b.addEventListener('click',()=>openNote(entry.id));row.appendChild(b);}
    });
  }
  function maybePromptAfterAction(beforeId){
    const entry=state.history[0];if(!entry||entry.id===beforeId||entry.note)return;const kind=kindOf(entry);if(!kind)return;const item=itemById(entry.itemId);
    if(kind==='meditation'||(kind==='reading'&&(entry.source==='manual'||entry.source==='close'||entry.source==='book-finished'||(item?.readingPlan&&item.debt===0))))setTimeout(()=>openNote(entry.id),140);
  }
  function watchActions(){
    document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;const taskAction=b.closest?.('.task [data-action]')||b.id==='amountSave';if(!taskAction)return;const before=state.history[0]?.id||null;setTimeout(()=>maybePromptAfterAction(before),40);},true);
  }
  function init(){ensureOverlay();decorateHistory();watchActions();window.addEventListener('pravilo:render',decorateHistory);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
