(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let pendingType='';

  function inferredType(item){
    if(!item)return '';
    if(item.practiceType==='prayer'||item.practiceType==='meditation')return item.practiceType;
    if(item.theme==='jesus'||/иисус|молитв|четк|чётк/i.test(`${item.name||''} ${item.unit||''}`))return 'prayer';
    if(item.theme==='contemplation'||/медит|созерц|тишин/i.test(`${item.name||''} ${item.unit||''}`))return 'meditation';
    return '';
  }
  function ensureField(){
    if($('practiceTypeField'))return;
    const anchor=$('eDebt')?.closest('.field');if(!anchor)return;
    const field=document.createElement('div');field.className='field';field.id='practiceTypeField';field.innerHTML=`<label>Специальный режим</label><select id="practiceType"><option value="">Нет</option><option value="prayer">Молитва · счётчик по касанию</option><option value="meditation">Медитация · таймер 15 + 15 минут</option></select><div class="smallText" style="margin-top:6px">Режим относится к этой активности, а не к её названию. Его можно назначить любой новой карточке.</div>`;anchor.insertAdjacentElement('afterend',field);
  }
  function fill(id){ensureField();const item=id?state.items.find(x=>x.id===id):null;if($('practiceType'))$('practiceType').value=inferredType(item);}
  function prepare(){pendingType=$('practiceType')?.value||'';}
  function finish(event){
    const item=state.items.find(x=>x.id===event.detail?.id);if(!item)return;
    if(pendingType==='prayer'){item.practiceType='prayer';item.theme='jesus';}
    else if(pendingType==='meditation'){item.practiceType='meditation';item.theme='contemplation';}
    else{delete item.practiceType;if(item.theme==='jesus'||item.theme==='contemplation')item.theme='auto';}
    pendingType='';save();render();
  }
  function migrate(){let changed=false;for(const item of state.items||[]){const type=inferredType(item);if(type&&item.practiceType!==type){item.practiceType=type;changed=true;}if(type==='prayer'&&item.theme!=='jesus'){item.theme='jesus';changed=true;}if(type==='meditation'&&item.theme!=='contemplation'){item.theme='contemplation';changed=true;}}if(changed)save();}
  function init(){ensureField();migrate();window.addEventListener('pravilo:editor-open',e=>fill(e.detail?.id));window.addEventListener('pravilo:editor-saved',finish);$('saveTask')?.addEventListener('click',prepare,true);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
