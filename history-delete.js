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

  function dayKey(entry){
    if(entry?.day)return String(entry.day);
    const d=new Date(entry?.ts||Date.now());
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function localKey(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function keyDate(key){
    const [y,m,d]=String(key).split('-').map(Number);
    return new Date(y||1970,(m||1)-1,d||1,12,0,0,0);
  }

  function dayHeading(key){
    const date=keyDate(key),now=new Date();now.setHours(12,0,0,0);
    const yesterday=new Date(now);yesterday.setDate(now.getDate()-1);
    const dateText=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(date);
    const weekday=new Intl.DateTimeFormat('ru-RU',{weekday:'long'}).format(date);
    if(key===localKey(now))return {title:'Сегодня',meta:dateText};
    if(key===localKey(yesterday))return {title:'Вчера',meta:dateText};
    return {title:dateText,meta:weekday};
  }

  function timeText(entry){
    const date=new Date(entry?.ts||Date.now());
    return new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit'}).format(date);
  }

  function groupRows(panel,entries,rows){
    const groups=[];let current=null;
    rows.forEach((row,i)=>{
      const entry=entries[i];if(!entry)return;
      const key=dayKey(entry);
      if(!current||current.key!==key){current={key,rows:[]};groups.push(current);}
      const meta=row.querySelector('.smallText');if(meta)meta.textContent=timeText(entry);
      const amount=row.querySelector('.historyAmount');if(amount)amount.textContent=`−${entry.amount}`;
      current.rows.push(row);
    });
    if(!groups.length){panel.classList.remove('historyGrouped');return;}
    const fragment=document.createDocumentFragment();
    groups.forEach(group=>{
      const heading=dayHeading(group.key);
      const section=document.createElement('section');section.className='historyDayGroup';
      const header=document.createElement('div');header.className='historyDayHeader';
      header.innerHTML=`<div class="historyDayTitle">${heading.title}</div><div class="historyDayMeta">${heading.meta}</div>`;
      const body=document.createElement('div');body.className='historyDayRows';
      group.rows.forEach(row=>body.appendChild(row));
      section.append(header,body);fragment.appendChild(section);
    });
    panel.replaceChildren(fragment);panel.classList.add('historyGrouped');
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
        groupRows(panel,entries,rows);
      }finally{decorating=false;}
    });
  }

  function init(){decorate();window.addEventListener('pravilo:render',decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
