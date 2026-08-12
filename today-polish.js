(()=>{
  'use strict';
  const Domain=window.PraviloDomain;

  function parseDate(value){return Domain?.parseLocalDate?.(value)||null;}
  function shortDate(value){
    const d=parseDate(value);if(!d)return '—';
    return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(d).replace('.','');
  }
  function daysLeft(value){return Math.max(0,Domain?.daysLeft?.(value,today())||0);}
  function targetFor(item){return Math.max(0,Domain?.readingTarget?.(item?.debt,item?.readingPlan?.deadline,today())||0);}

  function ensureBookMeta(card,item){
    if(!item?.readingPlan)return;
    const plan=item.readingPlan,total=Math.max(1,Math.round(Number(plan.totalPages)||1));
    const remaining=Math.max(0,Math.round(Number(item.debt)||0));
    const target=targetFor(item),days=daysLeft(plan.deadline),read=Math.max(0,total-remaining);
    let meta=card.querySelector('.bookMeta');
    if(!meta){meta=document.createElement('div');meta.className='bookMeta';card.appendChild(meta);}
    meta.innerHTML=`
      <div class="bookMetaCell"><div class="bookMetaLabel">сегодня</div><div class="bookMetaValue">${target} стр.</div></div>
      <div class="bookMetaCell"><div class="bookMetaLabel">осталось</div><div class="bookMetaValue">${remaining} стр.</div></div>
      <div class="bookMetaCell"><div class="bookMetaLabel">срок</div><div class="bookMetaValue">${shortDate(plan.deadline)}</div></div>`;
    const note=card.querySelector('.debtNote');if(note)note.textContent='';
    const progress=card.querySelector('.bookProgress');
    if(progress){
      const head=progress.querySelector('.bookProgressHead');
      if(head)head.innerHTML=`<span>прочитано ${read} из ${total}</span><span>${days?`${days} дн. до срока`:'срок сегодня'}</span>`;
    }
  }

  function ensureMeditationSummary(card,item){
    if(item?.practiceType!=='meditation')return;
    card.classList.add('meditationTaskCard');
    const rule=card.querySelector('.taskRule');if(rule)rule.textContent='30 минут · тишина и размышление';
    let summary=card.querySelector('.meditationCardSummary');
    if(!summary){summary=document.createElement('div');summary.className='meditationCardSummary';const debt=card.querySelector('.debtLine');debt?.insertAdjacentElement('beforebegin',summary);}
    const due=Math.max(0,Number(item.debt)||0);
    summary.innerHTML=`<div class="meditationSummaryStep"><b>15</b><span>минут тишины</span></div><div class="meditationSummaryStep"><b>15</b><span>минут размышления</span></div><div class="meditationSummaryStatus">${due?`${due} ${due===1?'практика':'практики'} осталось`:'на сегодня выполнено'}</div>`;
    const button=card.querySelector('.meditationPracticeButton');if(button)button.textContent='Начать медитацию';
  }

  function decorate(){
    document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{
      const item=(state.items||[]).find(x=>String(x.id)===String(card.dataset.itemId));if(!item)return;
      if(item.readingPlan)ensureBookMeta(card,item);else card.querySelector('.bookMeta')?.remove();
      if(item.practiceType==='meditation')ensureMeditationSummary(card,item);
    });
  }
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(decorate));}
  function init(){schedule();window.addEventListener('pravilo:render',schedule);window.addEventListener('pravilo:day-changed',schedule);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
