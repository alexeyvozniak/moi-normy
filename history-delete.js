(()=>{
  'use strict';
  const KEY='pravilo_v1';
  let decorating=false;
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {items:[],history:[]}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));

  function deleteEntry(id){
    const s=load(),entry=(s.history||[]).find(h=>h.id===id);if(!entry)return;
    const label=entry.item?`«${entry.item}»`:'эту запись';
    if(!confirm(`Удалить ${label} из истории? Она также исчезнет из статистики «Путь» и недели.`))return;
    s.history=(s.history||[]).filter(h=>h.id!==id);
    save(s);
    try{window.render?.()}catch(e){location.reload();}
    setTimeout(decorate,0);
  }

  function decorate(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{
        const panel=document.getElementById('historyPanel');if(!panel)return;
        const s=load(),entries=(s.history||[]).slice(0,80),rows=[...panel.querySelectorAll('.historyItem')];
        rows.forEach((row,i)=>{
          row.querySelectorAll('.historyDelete').forEach(x=>x.remove());
          const h=entries[i];if(!h)return;
          const b=document.createElement('button');b.type='button';b.className='historyDelete';b.textContent='Удалить из пути и истории';
          b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();deleteEntry(h.id);});
          row.appendChild(b);
        });
      }finally{decorating=false;}
    });
  }

  function init(){
    decorate();
    const panel=document.getElementById('historyPanel');
    if(panel)new MutationObserver(()=>{if(!decorating)decorate();}).observe(panel,{childList:true,subtree:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('.tab[data-tab="history"]'))setTimeout(decorate,40)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
