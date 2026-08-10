(()=>{
  'use strict';
  const KEY='pravilo_v1';
  const $=id=>document.getElementById(id);
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {items:[],history:[]}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const parseLocal=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const daysLeft=deadline=>{const a=parseLocal(todayKey()),b=parseLocal(deadline);if(!a||!b)return 0;return Math.floor((b-a)/86400000)+1};
  const dailyTarget=item=>{
    const p=item?.readingPlan;if(!p)return null;
    const rem=Math.max(0,Number(item.debt)||0),days=Math.max(1,daysLeft(p.deadline));
    return rem?Math.ceil(rem/days):0;
  };
  const itemForCard=(card,state)=>{
    const cards=[...document.querySelectorAll('#cards .task')],idx=cards.indexOf(card);
    return idx>=0?(state.items||[])[idx]:null;
  };
  const originalQuick=window.quickSubtract;
  if(typeof originalQuick==='function'&&!originalQuick.__bookFixed){
    const wrapped=function(id,amount){
      const s=load(),item=(s.items||[]).find(x=>x.id===id);
      if(item?.readingPlan){
        const n=Math.max(0,Math.round(Number(amount)||0));
        if(!n)return;
        item.debt=Math.max(0,(Number(item.debt)||0)-n);
        item.lastAccrual=todayKey();
        save(s);
        try{window.render?.()}catch(e){location.reload();}
        return;
      }
      return originalQuick.apply(this,arguments);
    };
    wrapped.__bookFixed=true;window.quickSubtract=wrapped;
  }
  function patchCards(){
    const s=load();
    document.querySelectorAll('#cards .task').forEach(card=>{
      const item=itemForCard(card,s);if(!item?.readingPlan)return;
      const target=dailyTarget(item);
      const quick=[...card.querySelectorAll('.button')].find(b=>(b.getAttribute('onclick')||'').startsWith('quickSubtract'));
      if(quick&&target!==null){
        quick.textContent=target>0?`−${target}`:'Готово';
        if(target>0)quick.setAttribute('onclick',`quickSubtract('${item.id}',${target})`);else quick.disabled=true;
        quick.title='Списать рассчитанную норму на сегодня';
      }
      const close=[...card.querySelectorAll('.button')].find(b=>b.dataset.bookClose==='1'||b.textContent.trim()==='Дочитано');
      if(close){
        close.textContent='Дочитано';
        close.onclick=e=>{
          e.preventDefault();e.stopPropagation();
          const st=load(),it=(st.items||[]).find(x=>x.id===item.id);if(!it)return;
          if((Number(it.debt)||0)<=0)return;
          if(!confirm('Отметить книгу дочитанной и закрыть весь оставшийся объём?'))return;
          it.debt=0;it.lastAccrual=todayKey();save(st);try{window.render?.()}catch(err){location.reload();}
        };
      }
    });
  }
  function init(){
    patchCards();
    const cards=$('cards');if(cards)new MutationObserver(()=>requestAnimationFrame(patchCards)).observe(cards,{childList:true,subtree:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('.editButton,#addBtn'))setTimeout(patchCards,120)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
