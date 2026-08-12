(()=>{
  'use strict';

  function ensureMeditationSummary(card,item){
    if(item?.practiceType!=='meditation')return;
    card.classList.add('meditationTaskCard');

    const rule=card.querySelector('.taskRule');
    if(rule)rule.textContent='30 минут · тишина и размышление';

    let summary=card.querySelector('.meditationCardSummary');
    if(!summary){
      summary=document.createElement('div');
      summary.className='meditationCardSummary';
      const debt=card.querySelector('.debtLine');
      debt?.insertAdjacentElement('beforebegin',summary);
    }

    const due=Math.max(0,Number(item.debt)||0);
    summary.innerHTML=`<div class="meditationSummaryStep"><b>15</b><span>минут тишины</span></div><div class="meditationSummaryStep"><b>15</b><span>минут размышления</span></div><div class="meditationSummaryStatus">${due?`${due} ${due===1?'практика':'практики'} осталось`:'на сегодня выполнено'}</div>`;

    const practice=card.querySelector('.meditationPracticeButton');
    if(practice)practice.textContent='Начать медитацию';

    const row=card.querySelector('.subRow');
    const quick=card.querySelector('.controlRow [data-action="quick"]');
    if(row&&quick){
      quick.textContent='−1';
      quick.classList.add('meditationManualButton');
      quick.title='Отметить одну самостоятельную медитацию';
      quick.setAttribute('aria-label','Отметить одну самостоятельную медитацию');
      const edit=row.querySelector('.editButton');
      row.insertBefore(quick,edit||null);
    }
  }

  function decorate(){
    document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{
      const item=(state.items||[]).find(x=>String(x.id)===String(card.dataset.itemId));
      if(!item)return;
      if(item.practiceType==='meditation')ensureMeditationSummary(card,item);
    });
  }

  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(decorate));}
  function init(){schedule();window.addEventListener('pravilo:render',schedule);window.addEventListener('pravilo:day-changed',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
