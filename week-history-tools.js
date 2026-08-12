(()=>{
  'use strict';
  let historyFilter='all';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function localKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
  function entryDay(entry){if(entry?.day)return String(entry.day);return localKey(new Date(entry?.ts||Date.now()));}
  function lastSeven(){const result=[],now=new Date();now.setHours(12,0,0,0);for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);result.push({key:localKey(d),date:d});}return result;}
  function dateFromKey(key){const [y,m,d]=String(key).split('-').map(Number);return new Date(y,(m||1)-1,d||1,12,0,0,0);}

  function ensureWeekSheet(){
    if(document.getElementById('weekDayOverlay'))return;
    const overlay=document.createElement('div');overlay.className='overlay';overlay.id='weekDayOverlay';
    overlay.innerHTML=`<div class="sheet weekDaySheet"><div class="grabber"></div><div class="sheetHeader"><div><div class="sheetTitle" id="weekDayTitle"></div><div class="weekDaySheetLead" id="weekDayLead">Что было отмечено в этот день.</div></div><button class="closeBtn" id="weekDayClose" type="button" aria-label="Закрыть">✕</button></div><div class="weekDaySummary" id="weekDaySummary"></div></div>`;
    document.body.appendChild(overlay);
    document.getElementById('weekDayClose').addEventListener('click',()=>overlay.classList.remove('show'));
    overlay.addEventListener('click',event=>{if(event.target===overlay)overlay.classList.remove('show');});
  }

  function openWeekDay(key){
    ensureWeekSheet();const date=dateFromKey(key),entries=(state.history||[]).filter(h=>entryDay(h)===key&&h.itemId);
    const sums=new Map();
    entries.forEach(entry=>{const id=String(entry.itemId),current=sums.get(id)||{amount:0,item:entry.item||'Занятие',unit:entry.unit||''};current.amount+=Math.max(0,Number(entry.amount)||0);if(entry.item)current.item=entry.item;if(entry.unit)current.unit=entry.unit;sums.set(id,current);});
    const rows=[...sums.values()].filter(x=>x.amount>0);
    document.getElementById('weekDayTitle').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(date);
    document.getElementById('weekDayLead').textContent=rows.length?`${rows.length} ${rows.length===1?'занятие':'занятия'} с записью.`:'В этот день записей нет.';
    document.getElementById('weekDaySummary').innerHTML=rows.length?rows.map(row=>`<div class="weekDaySummaryRow"><div class="weekDaySummaryName">${esc(row.item)}</div><div class="weekDaySummaryValue">${esc(row.amount)} ${esc(row.unit)}</div></div>`).join(''):'<div class="weekDayEmpty">Здесь будет видно всё, что было отмечено за выбранный день.</div>';
    document.getElementById('weekDayOverlay').classList.add('show');
  }

  function decorateWeek(){
    const view=document.getElementById('weekView');if(!view)return;
    const days=lastSeven(),legend=[...view.querySelectorAll('.weekLegend span')];
    legend.forEach((node,i)=>{const day=days[i];if(!day)return;node.dataset.weekDay=day.key;node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-label',`Открыть ${new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(day.date)}`);});
    [...view.querySelectorAll('.weekItem')].forEach((itemNode,itemIndex)=>{
      const item=(state.items||[])[itemIndex];
      [...itemNode.querySelectorAll('.weekDay')].forEach((cell,i)=>{const day=days[i];if(!day)return;cell.dataset.weekDay=day.key;if(item)cell.dataset.itemId=String(item.id);cell.setAttribute('role','button');cell.tabIndex=0;});
    });
  }

  function typeForEntry(entry){
    const item=(state.items||[]).find(x=>String(x.id)===String(entry?.itemId));
    if(item?.practiceType==='prayer')return 'prayer';
    if(item?.practiceType==='meditation')return 'meditation';
    if(item?.readingPlan)return 'reading';
    const text=`${entry?.item||''} ${item?.name||''} ${item?.unit||entry?.unit||''}`;
    if(/молитв|иисус|четк|чётк/i.test(text))return 'prayer';
    if(/медит|созерц|тишин/i.test(text))return 'meditation';
    if(/чтен|книг|страниц/i.test(text))return 'reading';
    return 'other';
  }

  function ensureHistoryFilters(){
    const view=document.getElementById('historyView'),panel=document.getElementById('historyPanel');if(!view||!panel)return;
    let bar=document.getElementById('historyFilters');if(bar)return;
    bar=document.createElement('div');bar.id='historyFilters';bar.className='historyFilters';bar.setAttribute('aria-label','Фильтр истории');
    [['all','Все'],['prayer','Молитва'],['reading','Чтение'],['meditation','Медитация']].forEach(([value,label])=>{const b=document.createElement('button');b.type='button';b.className='historyFilter'+(value==='all'?' active':'');b.dataset.historyFilter=value;b.textContent=label;b.addEventListener('click',()=>{historyFilter=value;bar.querySelectorAll('.historyFilter').forEach(x=>x.classList.toggle('active',x===b));applyHistoryFilter();});bar.appendChild(b);});
    panel.insertAdjacentElement('beforebegin',bar);
  }

  function applyHistoryFilter(){
    ensureHistoryFilters();const panel=document.getElementById('historyPanel');if(!panel)return;
    const entries=new Map((state.history||[]).slice(0,80).map(entry=>[String(entry.id),entry]));
    panel.querySelectorAll('.historyItem[data-history-id]').forEach(row=>{const entry=entries.get(String(row.dataset.historyId)),show=historyFilter==='all'||typeForEntry(entry)===historyFilter;row.classList.toggle('filteredOut',!show);});
    panel.querySelectorAll('.historyDayGroup').forEach(group=>{const visible=[...group.querySelectorAll('.historyItem')].some(row=>!row.classList.contains('filteredOut'));group.classList.toggle('filteredEmpty',!visible);});
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(()=>{decorateWeek();applyHistoryFilter();}));}
  function init(){
    ensureWeekSheet();ensureHistoryFilters();schedule();
    document.getElementById('weekView')?.addEventListener('click',event=>{const node=event.target.closest?.('[data-week-day]');if(node)openWeekDay(node.dataset.weekDay);});
    document.getElementById('weekView')?.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const node=event.target.closest?.('[data-week-day]');if(!node)return;event.preventDefault();openWeekDay(node.dataset.weekDay);});
    window.addEventListener('pravilo:render',schedule);window.addEventListener('pravilo:day-changed',schedule);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
