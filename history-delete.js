(()=>{
  'use strict';
  let decorating=false;
  function deleteEntry(id){
    const entry=state.history.find(h=>h.id===id);if(!entry)return;
    const label=entry.item?`«${entry.item}»`:'эту запись';
    if(!confirm(`Удалить ${label} из истории и пути?`))return;
    state.history=state.history.filter(h=>h.id!==id);
    /* Заметки в «Пути» строятся из истории, поэтому исчезнут вместе с событием. */
    save();render();setTimeout(decorate,0);
  }
  function decorate(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{
        const panel=document.getElementById('historyPanel');if(!panel)return;
        const entries=state.history.slice(0,80),rows=[...panel.querySelectorAll('.historyItem')];
        rows.forEach((row,i)=>{row.querySelectorAll('.historyDelete').forEach(x=>x.remove());const entry=entries[i];if(!entry)return;const button=document.createElement('button');button.type='button';button.className='historyDelete';button.textContent='Удалить из пути и истории';button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();deleteEntry(entry.id);});row.appendChild(button);});
      }finally{decorating=false;}
    });
  }
  function init(){decorate();window.addEventListener('pravilo:render',decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
