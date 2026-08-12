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

  window.PraviloShareText=Object.freeze({shareHistoryNote});

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-share-history-id]');if(!button)return;
    event.preventDefault();event.stopPropagation();
    void shareHistoryNote(button.dataset.shareHistoryId);
  });
})();
