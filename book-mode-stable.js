(()=>{
  'use strict';
  const KEY='pravilo_v1';
  const BACKUP='pravilo_book_plans_v3';
  const $=id=>document.getElementById(id);
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {items:[],history:[]}}};
  const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const backups=()=>{try{return JSON.parse(localStorage.getItem(BACKUP)||'{}')}catch(e){return {}}};
  const saveBackups=b=>localStorage.setItem(BACKUP,JSON.stringify(b));
  const parseDate=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const daysLeft=s=>{const a=new Date();a.setHours(12,0,0,0);const b=parseDate(s);return b?Math.floor((b-a)/86400000)+1:0};

  function globalState(){
    try{return typeof state!=='undefined'&&state&&Array.isArray(state.items)?state:null}catch(e){return null}
  }
  function globalEditId(){
    try{return typeof editId!=='undefined'?editId:null}catch(e){return null}
  }

  function hideObsoleteQuoteTheme(){
    const el=$('eTheme');
    if(!el)return;
    const field=el.closest('.field');
    if(field){field.classList.add('hidden');field.setAttribute('aria-hidden','true');}
    /* Поле сохраняем в DOM, потому что старый saveEditor всё ещё его читает. */
    if(!el.value)el.value='auto';
  }

  function planFromEditor(){
    const enabled=!!$('bookModeEnabled')?.checked;
    if(!enabled)return null;
    const title=String($('bookTitle')?.value||'').trim();
    const total=Math.max(0,Math.round(Number($('bookTotal')?.value)||0));
    const current=Math.max(0,Math.min(total,Math.round(Number($('bookCurrent')?.value)||0)));
    const deadline=String($('bookDeadline')?.value||'');
    if(!title||!total||!deadline||daysLeft(deadline)<1)return null;
    return {title,totalPages:total,current,deadline};
  }

  function applyPlan(plan,idHint,nameHint){
    if(!plan)return false;
    const local=read();
    const gs=globalState();
    const findIn=arr=>{
      if(!Array.isArray(arr))return null;
      return (idHint&&arr.find(x=>x.id===idHint))||arr.find(x=>x.name===nameHint)||arr.find(x=>x.name===plan.title)||null;
    };
    let li=findIn(local.items),gi=gs?findIn(gs.items):null;
    if(!li&&gi)li=(local.items||[]).find(x=>x.id===gi.id);
    if(!gi&&li&&gs)gi=(gs.items||[]).find(x=>x.id===li.id);
    if(!li&&!gi)return false;

    const remaining=Math.max(0,plan.totalPages-plan.current);
    const manual=(li?.readingPlan||gi?.readingPlan)?.manual||{
      increment:Number(li?.increment??gi?.increment)||15,
      period:li?.period||gi?.period||'daily',
      intervalDays:Number(li?.intervalDays??gi?.intervalDays)||2,
      quick:Number(li?.quick??gi?.quick)||5,
      unit:li?.unit||gi?.unit||'страниц',
      name:li?.name||gi?.name||'Чтение'
    };
    const savedPlan={title:plan.title,totalPages:plan.totalPages,deadline:plan.deadline,manual};
    const patch=item=>{
      if(!item)return;
      item.readingPlan=savedPlan;
      item.name=plan.title;
      item.unit='страниц';
      item.increment=0;
      item.period='daily';
      item.debt=remaining;
      item.theme='reading';
      item.lastAccrual=(new Date()).toISOString().slice(0,10);
    };
    patch(li);patch(gi);
    if(li)write(local);
    if(gs&&gi)localStorage.setItem(KEY,JSON.stringify(gs));
    const b=backups();const id=(gi||li)?.id;if(id){b[id]={...savedPlan,itemName:plan.title,savedAt:Date.now()};saveBackups(b);}
    return true;
  }

  function removePlan(idHint,nameHint){
    const local=read(),gs=globalState();
    const patch=arr=>{
      const item=(idHint&&arr?.find(x=>x.id===idHint))||arr?.find(x=>x.name===nameHint);
      if(item?.readingPlan)delete item.readingPlan;
    };
    patch(local.items);if(gs)patch(gs.items);write(gs||local);
  }

  function installSaveGuard(){
    const btn=$('saveTask');if(!btn||btn.dataset.bookStable)return;
    btn.dataset.bookStable='1';
    btn.addEventListener('click',e=>{
      hideObsoleteQuoteTheme();
      const enabled=!!$('bookModeEnabled')?.checked;
      const idHint=globalEditId();
      const nameHint=String($('eName')?.value||'').trim();
      if(!enabled){
        /* Если пользователь явно снял режим книги — это должно сохраниться тоже. */
        setTimeout(()=>removePlan(idHint,nameHint),40);
        return;
      }
      const plan=planFromEditor();
      if(!plan)return; // валидацию и сообщение оставляем features.js
      /* Старый редактор обязан сохранить книгу как чтение, но не начислять страницы. */
      if($('eName'))$('eName').value=plan.title;
      if($('eUnit'))$('eUnit').value='страниц';
      if($('eIncrement')){$('eIncrement').disabled=false;$('eIncrement').value='0';}
      if($('ePeriod')){$('ePeriod').disabled=false;$('ePeriod').value='daily';}
      if($('eDebt'))$('eDebt').value=String(Math.max(0,plan.totalPages-plan.current));
      if($('eTheme'))$('eTheme').value='reading';

      /* Основной saveEditor синхронный. Повторяем привязку после него и ещё пару раз,
         чтобы никакой старый обработчик не мог затереть readingPlan. */
      [0,25,100,350].forEach(ms=>setTimeout(()=>{
        if(applyPlan(plan,idHint,nameHint)){
          try{typeof render==='function'&&render()}catch(err){}
          try{window.dispatchEvent(new Event('pravilo:book-saved'))}catch(err){}
        }
      },ms));
    },true);
  }

  function recoverKnownPlans(){
    const b=backups();if(!Object.keys(b).length)return;
    const local=read(),gs=globalState();let changed=false;
    for(const item of local.items||[]){
      if(item.readingPlan||!b[item.id])continue;
      item.readingPlan={title:b[item.id].title,totalPages:b[item.id].totalPages,deadline:b[item.id].deadline,manual:b[item.id].manual};
      item.increment=0;item.period='daily';item.unit='страниц';item.theme='reading';changed=true;
      const gi=gs?.items?.find(x=>x.id===item.id);if(gi)Object.assign(gi,item);
    }
    if(changed)write(gs||local);
  }

  function init(){hideObsoleteQuoteTheme();recoverKnownPlans();installSaveGuard();
    const editor=$('editorOverlay');if(editor)new MutationObserver(()=>{hideObsoleteQuoteTheme();installSaveGuard();}).observe(editor,{attributes:true,subtree:true,childList:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('#addBtn,.editButton'))setTimeout(()=>{hideObsoleteQuoteTheme();installSaveGuard();},20)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
