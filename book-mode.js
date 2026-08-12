(()=>{
  'use strict';
  let editorItemId=null;
  let pending=null;

  const $=id=>document.getElementById(id);
  const Domain=window.PraviloDomain;
  const parseDate=value=>Domain?.parseLocalDate?.(value)||null;
  const daysLeft=deadline=>Domain?.daysLeft?.(deadline,today())||0;
  const targetFor=item=>Domain?.readingTarget?.(item?.debt,item?.readingPlan?.deadline,today())||0;
  const pluralDays=n=>{const a=Math.abs(n)%100,b=a%10;return a>10&&a<20?'дней':b===1?'день':b>=2&&b<=4?'дня':'дней'};
  const fmtDate=value=>{const d=parseDate(value);return d?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(d):''};

  function notice(title,message){
    if(typeof window.praviloNotice==='function')window.praviloNotice({kicker:'Книга',title,message});
    else console.warn('[Правило]',title,message);
  }

  function ensureEditor(){
    if($('bookModeBox'))return;
    const anchor=$('eIncrement')?.closest('.two')||$('eIncrement')?.closest('.field');
    if(!anchor)return;
    const box=document.createElement('section');box.id='bookModeBox';box.className='bookModeBox';
    box.innerHTML=`<div class="bookModeHead"><div><div class="bookModeTitle">Режим книги</div><div class="bookModeSub">Показывает, сколько страниц нужно прочитать сегодня, чтобы успеть к сроку.</div></div><label class="bookCheck"><input id="bookModeEnabled" type="checkbox"> Включить</label></div><div id="bookFields" class="bookFields hidden"><div class="field"><label>Название книги</label><input id="bookTitle" autocomplete="off" placeholder="Например, Братья Карамазовы"></div><div class="two"><div class="field"><label>Всего страниц</label><input id="bookTotal" type="number" inputmode="numeric" min="1" step="1"></div><div class="field"><label>Сейчас на странице</label><input id="bookCurrent" type="number" inputmode="numeric" min="0" step="1"></div></div><div class="field"><label>Дочитать до</label><input id="bookDeadline" type="date"></div><div class="bookCalc" id="bookCalc"></div><div class="modeHelp">Остаток книги не «начисляется» каждый день. Приложение каждый день заново делит непрочитанные страницы на оставшееся число дней.</div></div>`;
    anchor.insertAdjacentElement('afterend',box);
    $('bookModeEnabled').addEventListener('change',()=>{setFieldsVisible();updateCalc();});
    ['bookTitle','bookTotal','bookCurrent','bookDeadline'].forEach(id=>$(id)?.addEventListener('input',updateCalc));
  }

  function manualFields(disabled){
    ['eIncrement','ePeriod','eIntervalDays'].forEach(id=>{const el=$(id);if(el)el.disabled=!!disabled;});
  }
  function setFieldsVisible(){
    const on=!!$('bookModeEnabled')?.checked;
    $('bookFields')?.classList.toggle('hidden',!on);manualFields(on);
  }
  function updateCalc(){
    const el=$('bookCalc');if(!el)return;
    if(!$('bookModeEnabled')?.checked){el.textContent='';return;}
    const total=Math.max(0,Math.round(Number($('bookTotal')?.value)||0));
    const current=Math.max(0,Math.min(total,Math.round(Number($('bookCurrent')?.value)||0)));
    const deadline=$('bookDeadline')?.value||'';
    if(!total||!deadline){el.textContent='Укажи объём книги и срок.';return;}
    const remaining=Math.max(0,total-current),days=daysLeft(deadline);
    if(!remaining){el.textContent='Книга уже дочитана.';return;}
    if(days<1){el.textContent=`Срок прошёл · осталось ${remaining} стр.`;return;}
    const target=Domain.readingTarget(remaining,deadline,today());
    el.textContent=`Сегодня: ${target} стр. · осталось ${remaining} стр. · ${days} ${pluralDays(days)} до срока.`;
  }

  function openFor(id){
    ensureEditor();editorItemId=id||null;
    const item=id?state.items.find(x=>x.id===id):null,plan=item?.readingPlan||null;
    $('bookModeEnabled').checked=!!plan;
    $('bookTitle').value=plan?.title||item?.name||'';
    $('bookTotal').value=plan?.totalPages||'';
    $('bookCurrent').value=plan&&item?Math.max(0,Number(plan.totalPages||0)-Number(item.debt||0)):'';
    $('bookDeadline').value=plan?.deadline||'';
    setFieldsVisible();updateCalc();
  }

  function prepareSave(event){
    ensureEditor();
    const existing=editorItemId?state.items.find(x=>x.id===editorItemId):null;
    const enabled=!!$('bookModeEnabled')?.checked;
    if(!enabled){
      if(existing?.readingPlan){
        const m=existing.readingPlan.manual||{};
        $('eIncrement').disabled=false;$('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;
        $('eIncrement').value=Number.isFinite(Number(m.increment))?m.increment:15;$('ePeriod').value=m.period||'daily';$('eIntervalDays').value=m.intervalDays||2;$('eQuick').value=m.quick||5;$('eUnit').value=m.unit||'страниц';
        pending={remove:true,id:existing.id};
      }else pending=null;
      return;
    }
    const title=String($('bookTitle')?.value||'').trim();
    const total=Math.max(0,Math.round(Number($('bookTotal')?.value)||0));
    const current=Math.max(0,Math.min(total,Math.round(Number($('bookCurrent')?.value)||0)));
    const deadline=$('bookDeadline')?.value||'';
    if(!title||!total||!deadline){event.preventDefault();event.stopImmediatePropagation();notice('Не хватает данных','Укажи название книги, число страниц и срок чтения.');return;}
    if(daysLeft(deadline)<1){event.preventDefault();event.stopImmediatePropagation();notice('Проверь срок','Дата окончания чтения должна быть сегодня или позже.');return;}
    const old=existing?.readingPlan;
    const manual=old?.manual||{increment:Number(existing?.increment)||15,period:existing?.period||'daily',intervalDays:Number(existing?.intervalDays)||2,quick:Number(existing?.quick)||5,unit:existing?.unit||'страниц',name:existing?.name||$('eName')?.value||'Чтение'};
    pending={remove:false,id:existing?.id||null,title,totalPages:total,current,deadline,manual};
    $('eIncrement').disabled=false;$('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;
    $('eName').value=title;$('eIncrement').value=0;$('ePeriod').value='daily';$('eUnit').value='страниц';$('eDebt').value=Math.max(0,total-current);
  }

  function finishSave(event){
    if(!pending)return;
    const id=event.detail?.id||pending.id;const item=state.items.find(x=>x.id===id);if(!item){pending=null;return;}
    if(pending.remove){delete item.readingPlan;pending=null;save();render();return;}
    item.readingPlan={title:pending.title,totalPages:pending.totalPages,deadline:pending.deadline,manual:pending.manual};
    item.name=pending.title;item.increment=0;item.period='daily';item.unit='страниц';item.debt=Math.max(0,pending.totalPages-pending.current);item.lastAccrual=today();
    pending=null;save();render();
  }

  function decorate(){
    document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{
      const item=state.items.find(x=>x.id===card.dataset.itemId);if(!item?.readingPlan)return;
      const plan=item.readingPlan,remaining=Math.max(0,Math.round(Number(item.debt)||0)),target=targetFor(item),days=Math.max(1,daysLeft(plan.deadline)),total=Math.max(1,Math.round(Number(plan.totalPages)||1)),read=Math.max(0,total-remaining),pct=Math.min(100,Math.round(read/total*100));
      card.classList.add('bookPlanCard');
      const name=card.querySelector('.taskName'),rule=card.querySelector('.taskRule'),num=card.querySelector('.debtNumber'),unit=card.querySelector('.debtUnit'),note=card.querySelector('.debtNote');
      if(name)name.textContent=plan.title||item.name;if(rule)rule.textContent=remaining?`до ${fmtDate(plan.deadline)} · осталось ${remaining} стр.`:'Книга дочитана';if(num)num.textContent=target;if(unit)unit.textContent=remaining?'страниц сегодня':'книга дочитана';if(note)note.textContent=remaining?`Сегодня нужно ${target} стр. · всего осталось ${remaining} стр. · ${days} ${pluralDays(days)} до срока`:'Готово. Книга дочитана.';
      const quick=card.querySelector('[data-action="quick"]');if(quick){quick.textContent=target?`−${target}`:'Готово';quick.dataset.bookTarget=String(target);quick.disabled=!target;quick.title='Списать сегодняшнюю норму';}
      const close=card.querySelector('[data-action="close"]');if(close){close.textContent='Дочитано';close.dataset.bookClose='1';}
      let progress=card.querySelector('.bookProgress');if(!progress){progress=document.createElement('div');progress.className='bookProgress';card.appendChild(progress);}progress.innerHTML=`<div class="bookProgressHead"><span>${read} из ${total} стр.</span><span>${pct}%</span></div><div class="bookProgressTrack"><div class="bookProgressFill" style="width:${pct}%"></div></div>`;
    });
  }

  async function interceptActions(event){
    const button=event.target.closest?.('.task [data-action]');if(!button)return;
    const item=state.items.find(x=>x.id===button.dataset.id);if(!item?.readingPlan)return;
    if(button.dataset.action==='quick'){
      event.preventDefault();event.stopImmediatePropagation();const target=targetFor(item);if(target)subtract(item.id,target,'book-today');
    }else if(button.dataset.action==='close'){
      event.preventDefault();event.stopImmediatePropagation();
      if(item.debt<=0)return;
      const title=item.readingPlan.title||item.name;
      const ok=typeof window.praviloConfirm==='function'&&await window.praviloConfirm({kicker:'Книга',title:'Отметить книгу дочитанной?',message:`«${title}» будет закрыта целиком, весь оставшийся объём будет списан.`,confirmText:'Дочитано',danger:false});
      if(ok)subtract(item.id,item.debt,'book-finished');
    }
  }

  function harden(){let changed=false;for(const item of state.items||[]){if(!item.readingPlan)continue;if(item.increment!==0){item.increment=0;changed=true;}if(item.period!=='daily'){item.period='daily';changed=true;}if(item.unit!=='страниц'){item.unit='страниц';changed=true;}}if(changed)save();}

  function init(){ensureEditor();harden();decorate();
    window.addEventListener('pravilo:editor-open',e=>openFor(e.detail?.id));
    window.addEventListener('pravilo:editor-saved',finishSave);
    window.addEventListener('pravilo:render',decorate);
    window.addEventListener('pravilo:day-changed',()=>{harden();render();});
    $('saveTask')?.addEventListener('click',prepareSave,true);
    $('cards')?.addEventListener('click',interceptActions,true);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){harden();render();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
