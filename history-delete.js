(()=>{
  'use strict';
  let decorating=false;

  async function deleteEntry(id){
    const entry=state.history.find(h=>h.id===id);if(!entry)return;
    const label=entry.item?`«${entry.item}»`:'эту запись';
    const ok=await (window.praviloConfirm?.({kicker:'История',title:'Удалить запись?',message:`${label} исчезнет из истории и из «Пути», если там есть связанная заметка.`,confirmText:'Удалить',danger:true})??Promise.resolve(false));
    if(!ok)return;
    state.history=state.history.filter(h=>h.id!==id);
    save();render();setTimeout(decorate,0);
  }

  function makeAction(entry){
    const button=document.createElement('button');
    button.type='button';button.className='entryMore historyEntryMore';button.textContent='⋯';button.setAttribute('aria-label','Действия с записью');
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
