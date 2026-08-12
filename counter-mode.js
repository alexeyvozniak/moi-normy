(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let pending=null;
  const num=(v,d=0)=>Math.max(0,safeNumber(v,d));

  function ensureUi(){
    if($('counterModeBox'))return;
    const anchor=$('intervalField')||$('eDebt')?.closest('.field');if(!anchor)return;
    const box=document.createElement('div');box.id='counterModeBox';box.className='counterModeBox';
    box.innerHTML=`<label for="counterMode">Режим счётчика</label><select id="counterMode"><option value="carry">Накопительный — остаток переносится</option><option value="reset">С чистого дня — остаток не переносится</option></select><div class="counterModeHelp" id="counterModeHelp"></div>`;
    anchor.insertAdjacentElement('afterend',box);
    $('counterMode').addEventListener('change',updateUi);
  }
  function updateUi(){
    ensureUi();const book=!!$('bookModeEnabled')?.checked,mode=book?'carry':$('counterMode')?.value||'carry';
    if($('counterMode')){$('counterMode').disabled=book;if(book)$('counterMode').value='carry';}
    const help=$('counterModeHelp');if(help)help.textContent=book?'В режиме книги остаток распределяется до срока автоматически.':mode==='reset'?'Каждый новый день начинается с полной дневной цели; вчерашний остаток не переносится.':'Невыполненный остаток сохраняется и складывается со следующей нормой.';
  }
  function fill(id){
    ensureUi();const item=id?state.items.find(x=>x.id===id):null;const reset=item?.resetMode==='daily';$('counterMode').value=reset?'reset':'carry';if(reset){$('eIncrement').value=num(item.dailyTarget,1);$('ePeriod').value='daily';$('eDebt').value=num(item.debt,0);}updateUi();
  }
  function prepare(){
    ensureUi();const book=!!$('bookModeEnabled')?.checked;const mode=book?'carry':$('counterMode').value;pending={mode,target:num($('eIncrement').value,1)};
    if(mode==='reset'){$('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;$('ePeriod').value='daily';}
  }
  function finish(event){
    if(!pending)return;const item=state.items.find(x=>x.id===event.detail?.id);if(!item){pending=null;return;}
    if(pending.mode==='reset'){
      item.resetMode='daily';item.dailyTarget=pending.target;item.resetDay=today();item.increment=0;item.period='daily';item.lastAccrual=today();item.debt=num(item.debt,pending.target);
    }else if(item.resetMode==='daily'){
      delete item.resetMode;delete item.dailyTarget;delete item.resetDay;item.lastAccrual=today();
    }
    pending=null;save();render();
  }
  function applyReset(){
    const day=today();let changed=false;
    for(const item of state.items||[]){
      if(item.resetMode!=='daily')continue;
      item.dailyTarget=num(item.dailyTarget,item.increment||1);item.increment=0;item.period='daily';item.lastAccrual=day;
      if(item.resetDay!==day){item.debt=item.paused?0:item.dailyTarget;item.resetDay=day;changed=true;}
    }
    if(changed){save();render();}
  }
  function decorate(){
    document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{const item=state.items.find(x=>x.id===card.dataset.itemId);if(item?.resetMode!=='daily')return;const title=card.querySelector('.taskName');if(title&&!title.parentElement.querySelector('.resetModeBadge')){const b=document.createElement('div');b.className='resetModeBadge';b.textContent='с чистого дня';title.parentElement.insertBefore(b,title);}const rule=card.querySelector('.taskRule');if(rule)rule.textContent=`${item.dailyTarget} ${item.unit} каждый день · без переноса`;const note=card.querySelector('.debtNote');if(note)note.textContent=item.debt>0?`Сегодня осталось ${item.debt} ${item.unit}. Завтра счётчик снова начнётся с ${item.dailyTarget}.`:'На сегодня выполнено. Завтра счётчик начнётся заново.';});
  }
  function init(){ensureUi();applyReset();decorate();window.addEventListener('pravilo:editor-open',e=>fill(e.detail?.id));window.addEventListener('pravilo:editor-saved',finish);window.addEventListener('pravilo:render',decorate);$('saveTask')?.addEventListener('click',prepare,true);$('bookModeEnabled')?.addEventListener('change',updateUi);document.addEventListener('visibilitychange',()=>{if(!document.hidden)applyReset();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
