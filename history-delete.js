(()=>{
  'use strict';
  let decorating=false;

  async function deleteEntry(id){
    const entry=state.history.find(h=>String(h.id)===String(id));if(!entry)return;
    const amount=Math.max(0,Number(entry.amount)||0);
    const label=entry.item?`«${entry.item}»`:'эту запись';
    const unit=entry.unit||'ед.';
    const message=amount>0
      ?`${label}: ${amount} ${unit} вернутся в текущий остаток, а запись исчезнет из истории и из «Пути», если там есть связанная заметка.`
      :`${label} исчезнет из истории и из «Пути», если там есть связанная заметка.`;
    const ok=await (window.praviloConfirm?.({kicker:'История',title:'Удалить запись?',message,confirmText:'Удалить и вернуть',danger:true})??Promise.resolve(false));
    if(!ok)return;
    if(window.PraviloHistoryLedger?.removeHistory)window.PraviloHistoryLedger.removeHistory(entry.id);
    else{
      const item=(state.items||[]).find(x=>String(x.id)===String(entry.itemId));
      if(item&&amount>0)item.debt=Math.max(0,Number(item.debt)||0)+amount;
      state.history=state.history.filter(h=>String(h.id)!==String(entry.id));save();render();
    }
    setTimeout(decorate,0);
  }

  function makeAction(entry){
    const button=document.createElement('button');
    button.type='button';button.className='entryMore historyEntryMore';button.textContent='×';button.setAttribute('aria-label','Удалить запись');button.title='Удалить запись';
    button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();deleteEntry(entry.id);});
    return button;
  }

  function decorate(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{
        const panel=document.getElementById('historyPanel');if(!panel)return;
        const entries=state.history.slice(0,80),rows=[...panel.querySelectorAll('.historyItem')];
        rows.forEach((row,i)=>{
          row.querySelectorAll('.historyDelete,.entryMenu,.entryMore').forEach(x=>x.remove());
          const entry=entries[i];if(!entry)return;
          row.appendChild(makeAction(entry));
        });
      }finally{decorating=false;}
    });
  }

  function init(){decorate();window.addEventListener('pravilo:render',decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
