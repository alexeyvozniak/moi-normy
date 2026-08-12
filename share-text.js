(()=>{
  'use strict';

  function noteText(entry){
    const note=entry?.note;if(!note)return null;
    const title=String(note.title||'').trim();
    const body=String(note.body||'').trim();
    const text=[title,body].filter(Boolean).join('\n\n');
    if(!text)return null;
    return {title:title||'Заметка',text};
  }

  async function shareHistoryNote(historyId){
    const entry=(state.history||[]).find(row=>String(row.id)===String(historyId));
    const payload=noteText(entry);if(!payload)return false;
    if(typeof navigator.share==='function'){
      try{await navigator.share({title:payload.title,text:payload.text});return true;}
      catch(error){if(error?.name==='AbortError')return false;}
    }
    try{
      await navigator.clipboard.writeText(payload.text);
      window.praviloNotice?.({kicker:'Заметка',title:'Текст скопирован',message:'Можно сразу вставить его в Telegram, почту или сообщение.'});
      return true;
    }catch(error){
      window.praviloNotice?.({kicker:'Заметка',title:'Не удалось поделиться',message:'Открой заметку и скопируй текст вручную.'});
      return false;
    }
  }

  function decoratePath(){
    document.querySelectorAll('.pathEntry.note[data-source="history"]').forEach(row=>{
      const id=row.dataset.sourceId;if(!id)return;
      let actions=row.querySelector('.pathNoteActions');
      if(!actions){actions=document.createElement('div');actions.className='pathNoteActions';row.appendChild(actions);}
      if(!actions.querySelector('[data-edit-note-id]')){
        const edit=document.createElement('button');edit.type='button';edit.className='noteEditButton pathNoteEdit';edit.dataset.editNoteId=id;edit.textContent='✎ Изменить';actions.appendChild(edit);
      }
      if(!actions.querySelector('[data-share-history-id]')){
        const share=document.createElement('button');share.type='button';share.className='noteShareButton pathNoteShare';share.dataset.shareHistoryId=id;share.textContent='Поделиться';actions.appendChild(share);
      }
    });
  }

  window.PraviloShareText=Object.freeze({shareHistoryNote,decoratePath});

  document.addEventListener('click',event=>{
    const share=event.target.closest?.('[data-share-history-id]');if(share){event.preventDefault();event.stopPropagation();void shareHistoryNote(share.dataset.shareHistoryId);return;}
    const edit=event.target.closest?.('[data-edit-note-id]');if(edit){event.preventDefault();event.stopPropagation();window.PraviloNotes?.openNote?.(edit.dataset.editNoteId);return;}
    if(event.target.closest?.('.tab[data-tab="path"]'))setTimeout(decoratePath,30);
  });
  window.addEventListener('pravilo:render',()=>setTimeout(decoratePath,0));
})();
