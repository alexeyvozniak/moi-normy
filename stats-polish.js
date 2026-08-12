(()=>{
  'use strict';
  const Domain=window.PraviloDomain;
  const number=value=>{const n=Number(value);return Number.isFinite(n)?n:0;};
  const dayKey=()=>typeof today==='function'?today():new Date().toISOString().slice(0,10);
  const entryDay=entry=>entry?.day||(entry?.ts?localDay(new Date(entry.ts)):dayKey());
  const localDay=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

  function amountToday(itemId){
    const key=dayKey();
    return (state.history||[]).reduce((sum,entry)=>entry?.itemId===itemId&&entryDay(entry)===key?sum+Math.max(0,number(entry.amount)):sum,0);
  }

  function targetFor(item){
    if(item?.readingPlan){
      return Math.max(0,number(Domain?.readingTarget?.(item.debt,item.readingPlan.deadline,dayKey())));
    }
    if(item?.resetMode==='daily')return Math.max(0,number(item.dailyTarget??item.increment));
    return Math.max(0,number(item?.increment));
  }

  function isDueToday(item,done){
    if(!item||item.paused)return false;
    if(item.readingPlan)return number(item.debt)>0||done>0;
    if(item.resetMode==='daily'||item.period==='daily')return true;
    return number(item.debt)>0||done>0;
  }

  function isCompletedToday(item,done){
    const target=targetFor(item);
    if(item?.readingPlan&&number(item.debt)<=0&&done>0)return true;
    if(target<=0)return done>0&&number(item?.debt)<=0;
    return done>=target;
  }

  function renderPolishedStats(){
    const el=document.getElementById('stats');if(!el)return;
    const active=(state.items||[]).filter(item=>!item.paused);
    const debt=active.filter(item=>number(item.debt)>0).length;
    const due=active.map(item=>({item,done:amountToday(item.id)})).filter(row=>isDueToday(row.item,row.done));
    const completed=due.filter(row=>isCompletedToday(row.item,row.done)).length;
    const total=due.length;
    const progress=total?Math.round(completed/total*100):0;
    const ratio=total?`${completed}<span class="statSlash">/</span>${total}`:'—';

    el.innerHTML=`
      <div class="stat statActive" aria-label="${active.length} активных норм">
        <img src="images/stat_active.webp" alt=""><div class="statMetric"><div class="statNum">${active.length}</div><div class="statLabel">в ритме</div></div>
      </div>
      <div class="stat statDebt" aria-label="${debt} норм с долгом">
        <img src="images/stat_debt.webp" alt=""><div class="statMetric"><div class="statNum">${debt}</div><div class="statLabel">с долгом</div></div>
      </div>
      <div class="stat statToday" style="--today-progress:${progress}%" aria-label="Сегодня выполнено ${completed} из ${total} актуальных норм">
        <img src="images/stat_done.webp" alt=""><div class="statMetric"><div class="statNum statRatio">${ratio}</div><div class="statLabel">сегодня</div></div>
      </div>`;
  }

  window.renderStats=renderPolishedStats;
  renderPolishedStats();
})();
