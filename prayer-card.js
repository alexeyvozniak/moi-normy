(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let amountPrayerId=null,decorating=false;

  function itemById(id){return (state.items||[]).find(item=>String(item.id)===String(id))||null;}
  function isPrayer(item){return item?.practiceType==='prayer';}
  function fullHundreds(value){return Math.floor(Math.max(0,Number(value)||0)/100)*100;}
  function validHundreds(value){const n=Number(value);return Number.isFinite(n)&&n>=100&&n%100===0;}

  function notice(title,message){window.praviloNotice?.({kicker:'Молитва',title,message});}

  function normalizePrayerItems(){
    let changed=false;
    for(const item of state.items||[]){
      if(!isPrayer(item))continue;
      if(Number(item.quick)!==100){item.quick=100;changed=true;}
    }
    if(changed)save();
  }

  function decorateCards(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{
        document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{
          const item=itemById(card.dataset.itemId);card.classList.toggle('prayerCard',isPrayer(item));
          if(!isPrayer(item))return;
          const amount=card.querySelector('[data-action="amount"]');
          const quick=card.querySelector('[data-action="quick"]');
          const close=card.querySelector('[data-action="close"]');
          if(amount)amount.textContent='Списать сотни';
          if(quick)quick.textContent='−100';
          if(close){close.classList.add('prayerHiddenAction');close.setAttribute('aria-hidden','true');close.tabIndex=-1;}
        });
      }finally{decorating=false;}
    });
  }

  function configureEditor(){
    const type=$('practiceType')?.value||'';
    const quick=$('eQuick'),inc=$('eIncrement');
    const quickField=quick?.closest('.field');
    if(type==='prayer'){
      if(quick)quick.value='100';
      if(quickField)quickField.classList.add('prayerFixedField');
      if(inc){inc.min='100';inc.step='100';}
    }else{
      if(quickField)quickField.classList.remove('prayerFixedField');
      if(inc){inc.removeAttribute('min');inc.removeAttribute('step');}
    }
  }

  function validatePrayerEditor(event){
    if(($('practiceType')?.value||'')!=='prayer')return;
    const increment=Number($('eIncrement')?.value);
    if(!validHundreds(increment)){
      event.preventDefault();event.stopImmediatePropagation();
      notice('Норма задаётся сотнями','Для молитвенной практики укажи 100, 200, 300 и т. д.');
      return;
    }
    if($('eQuick'))$('eQuick').value='100';
  }

  function openPrayerAmount(id){
    const item=itemById(id);if(!isPrayer(item))return;
    const available=fullHundreds(item.debt);
    if(available<100){notice('Нет полной сотни',`Сейчас осталось ${Math.max(0,Number(item.debt)||0)} ${item.unit||'молитв'}. Списывать можно только полные сотни.`);return;}
    amountPrayerId=id;
    openAmount(id);
    if($('amountTitle'))$('amountTitle').textContent='Списать сотни: '+item.name;
    if($('amountHint'))$('amountHint').textContent=`Можно списать 100, 200, 300… Не больше ${available} ${item.unit||'молитв'}.`;
    if($('amountInput')){$('amountInput').min='100';$('amountInput').step='100';$('amountInput').inputMode='numeric';}
  }

  function handleCardAction(event,button){
    const item=itemById(button.dataset.id);if(!isPrayer(item))return false;
    const action=button.dataset.action;
    if(!['amount','quick','close'].includes(action))return false;
    event.preventDefault();event.stopPropagation();
    if(action==='amount')openPrayerAmount(item.id);
    else if(action==='quick'){
      if(Number(item.debt)<100)notice('Нет полной сотни',`Осталось ${Math.max(0,Number(item.debt)||0)} ${item.unit||'молитв'}.`);
      else subtract(item.id,100,'quick');
    }else{
      const amount=fullHundreds(item.debt);
      if(amount>=100)subtract(item.id,amount,'close');
      else notice('Нет полной сотни','Неполный остаток нельзя отметить выполненным из карточки.');
    }
    return true;
  }

  function handleAmountSave(event){
    if(!amountPrayerId)return false;
    const item=itemById(amountPrayerId);if(!isPrayer(item)){amountPrayerId=null;return false;}
    event.preventDefault();event.stopImmediatePropagation();
    const amount=Number($('amountInput')?.value),available=fullHundreds(item.debt);
    if(!validHundreds(amount)||amount>available){
      notice('Только полные сотни',`Укажи 100, 200, 300… не больше ${available}.`);return true;
    }
    subtract(item.id,amount,'manual');hide('amountOverlay');amountPrayerId=null;return true;
  }

  function init(){
    normalizePrayerItems();decorateCards();
    window.addEventListener('pravilo:render',decorateCards);
    window.addEventListener('pravilo:editor-open',()=>setTimeout(configureEditor,0));
    window.addEventListener('pravilo:editor-saved',event=>{
      const item=itemById(event.detail?.id);if(isPrayer(item)&&Number(item.quick)!==100){item.quick=100;save();render();}
    });
    $('practiceType')?.addEventListener('change',configureEditor);
    $('saveTask')?.addEventListener('click',validatePrayerEditor,true);
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#cards [data-action]');if(button&&handleCardAction(event,button))return;
      if(event.target.closest?.('#amountSave'))handleAmountSave(event);
      if(event.target.closest?.('[data-close="amountOverlay"]'))amountPrayerId=null;
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
