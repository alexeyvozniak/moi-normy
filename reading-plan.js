(()=>{
  let currentEditId=null;
  let decorating=false;

  const $=id=>document.getElementById(id);
  const readState=()=>{try{return JSON.parse(localStorage.getItem('pravilo_v1')||'{}')}catch(e){return {items:[],history:[]}}};
  const writeState=s=>localStorage.setItem('pravilo_v1',JSON.stringify(s));
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const parseDate=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const daysLeft=deadline=>{const a=parseDate(todayKey()),b=parseDate(deadline);if(!a||!b)return 1;return Math.floor((b-a)/86400000)+1};
  const targetFor=(remaining,deadline)=>remaining<=0?0:Math.ceil(remaining/Math.max(1,daysLeft(deadline)));
  const fmtDate=s=>{const d=parseDate(s);return d?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(d):''};

  function ensureEditor(){
    if($('readingPlanBox'))return;
    const theme=$('eTheme');
    if(!theme)return;
    const host=theme.closest('.field');
    const box=document.createElement('div');
    box.className='readingPlanBox';
    box.id='readingPlanBox';
    box.innerHTML=`
      <div class="readingPlanHead">
        <div><div class="readingPlanTitle">Книга</div><div class="readingPlanSub">Необязательно · норма посчитается сама</div></div>
        <label class="readingPlanToggle"><input id="rpEnabled" type="checkbox"><span></span></label>
      </div>
      <div id="rpFields" class="readingPlanFields hidden">
        <div class="field"><label>Название книги</label><input id="rpTitle" placeholder="Например, Братья Карамазовы"></div>
        <div class="two">
          <div class="field"><label>Всего страниц</label><input id="rpTotal" type="number" inputmode="numeric" min="1" step="1" placeholder="640"></div>
          <div class="field"><label>Сейчас на странице</label><input id="rpCurrent" type="number" inputmode="numeric" min="0" step="1" placeholder="0"></div>
        </div>
        <div class="field"><label>Дочитать до</label><input id="rpDeadline" type="date"></div>
        <div class="readingPlanCalc" id="rpCalc">Укажи объём и срок — я посчитаю норму.</div>
      </div>`;
    host.insertAdjacentElement('afterend',box);
    $('rpEnabled').addEventListener('change',()=>{
      $('rpFields').classList.toggle('hidden',!$('rpEnabled').checked);
      updateCalc();
    });
    ['rpTotal','rpCurrent','rpDeadline'].forEach(id=>$(id).addEventListener('input',updateCalc));
  }

  function updateCalc(){
    if(!$('rpCalc')||!$('rpEnabled')?.checked)return;
    const total=Math.max(0,Number($('rpTotal').value)||0);
    const current=Math.max(0,Number($('rpCurrent').value)||0);
    const deadline=$('rpDeadline').value;
    const remaining=Math.max(0,total-current);
    if(!total||!deadline){$('rpCalc').textContent='Укажи объём и срок — я посчитаю норму.';return;}
    const days=daysLeft(deadline);
    if(!remaining){$('rpCalc').textContent='Книга уже дочитана.';return;}
    const target=targetFor(remaining,deadline);
    $('rpCalc').textContent=days<1?`Срок уже прошёл · осталось ${remaining} стр.`:`Получится ${target} стр. в день · осталось ${remaining} стр. на ${days} ${days===1?'день':days<5?'дня':'дней'}.`;
  }

  function fillEditor(id){
    ensureEditor();
    currentEditId=id||null;
    const state=readState();
    const item=id?(state.items||[]).find(x=>x.id===id):null;
    const plan=item?.readingPlan||null;
    $('rpEnabled').checked=!!plan;
    $('rpFields').classList.toggle('hidden',!plan);
    $('rpTitle').value=plan?.title||'';
    $('rpTotal').value=plan?.totalPages||'';
    $('rpCurrent').value=plan&&item?Math.max(0,(Number(plan.totalPages)||0)-(Number(item.debt)||0)):'';
    $('rpDeadline').value=plan?.deadline||'';
    updateCalc();
  }

  const originalOpenEditor=window.openEditor;
  if(typeof originalOpenEditor==='function'){
    window.openEditor=function(id=null){originalOpenEditor(id);setTimeout(()=>fillEditor(id),0);};
  }

  function interceptSave(){
    const btn=$('saveTask');
    if(!btn)return;
    btn.addEventListener('click',ev=>{
      ensureEditor();
      const enabled=$('rpEnabled')?.checked;
      const before=readState();
      const existing=currentEditId?(before.items||[]).find(x=>x.id===currentEditId):null;
      const oldPlan=existing?.readingPlan||null;

      if(enabled){
        const title=$('rpTitle').value.trim();
        const total=Math.max(0,Math.round(Number($('rpTotal').value)||0));
        const current=Math.max(0,Math.min(total,Math.round(Number($('rpCurrent').value)||0)));
        const deadline=$('rpDeadline').value;
        if(!title||!total||!deadline){
          ev.preventDefault();ev.stopImmediatePropagation();
          alert('Для плана книги укажи название, число страниц и срок.');
          return;
        }
        if(daysLeft(deadline)<1){
          ev.preventDefault();ev.stopImmediatePropagation();
          alert('Срок чтения должен быть сегодня или позже.');
          return;
        }

        const manual=oldPlan?.manual||{
          increment:Number(existing?.increment)||15,
          period:existing?.period||'daily',
          intervalDays:Number(existing?.intervalDays)||2,
          quick:Number(existing?.quick)||5
        };

        if($('eIncrement'))$('eIncrement').value=0;
        if($('ePeriod'))$('ePeriod').value='daily';
        if($('eUnit'))$('eUnit').value='страниц';
        if($('eDebt'))$('eDebt').value=Math.max(0,total-current);
        if($('eTheme'))$('eTheme').value='reading';

        const idsBefore=new Set((before.items||[]).map(x=>x.id));
        setTimeout(()=>{
          const after=readState();
          let item=currentEditId?(after.items||[]).find(x=>x.id===currentEditId):null;
          if(!item)item=(after.items||[]).find(x=>!idsBefore.has(x.id));
          if(!item)return;
          item.readingPlan={title,totalPages:total,deadline,manual};
          item.name=title;
          item.unit='страниц';
          item.increment=0;
          item.period='daily';
          item.debt=Math.max(0,total-current);
          item.theme='reading';
          writeState(after);
          location.reload();
        },0);
      }else if(existing&&oldPlan){
        const manual=oldPlan.manual||{increment:15,period:'daily',intervalDays:2,quick:5};
        if($('eIncrement'))$('eIncrement').value=manual.increment||15;
        if($('ePeriod'))$('ePeriod').value=manual.period||'daily';
        if($('eIntervalDays'))$('eIntervalDays').value=manual.intervalDays||2;
        if($('eQuick'))$('eQuick').value=manual.quick||5;
        setTimeout(()=>{
          const after=readState();
          const item=(after.items||[]).find(x=>x.id===currentEditId);
          if(item){delete item.readingPlan;writeState(after);location.reload();}
        },0);
      }
    },true);
  }

  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function decorateCards(){
    if(decorating)return;
    decorating=true;
    requestAnimationFrame(()=>{
      try{
        const state=readState();
        const cards=[...document.querySelectorAll('#cards .task')];
        (state.items||[]).forEach((item,i)=>{
          const plan=item.readingPlan,card=cards[i];
          if(!plan||!card)return;
          const remaining=Math.max(0,Number(item.debt)||0);
          const days=daysLeft(plan.deadline);
          const target=targetFor(remaining,plan.deadline);
          const name=card.querySelector('.taskName');
          const rule=card.querySelector('.taskRule');
          const unit=card.querySelector('.debtUnit');
          const note=card.querySelector('.debtNote');
          const quick=[...card.querySelectorAll('.button')].find(b=>/^−/.test(b.textContent.trim()));
          const close=[...card.querySelectorAll('.button')].find(b=>b.textContent.trim()==='Закрыть'||b.dataset.rpClose==='1');
          setText(name,plan.title);
          setText(rule,remaining===0?'Книга дочитана':`${target} стр/день · до ${fmtDate(plan.deadline)}`);
          setText(unit,'страниц осталось');
          if(quick)setText(quick,`−${Math.max(1,Number(item.quick)||5)}`);
          if(remaining===0)setText(note,'Готово. Книга дочитана.');
          else setText(note,`Сегодня ориентир ${target} стр. · ${Math.max(1,days)} ${days===1?'день':days<5?'дня':'дней'} до срока`);
          if(close){close.dataset.rpClose='1';setText(close,'Дочитано');}
          if(!card.querySelector('.readingPlanMark')){
            const mark=document.createElement('div');mark.className='readingPlanMark';mark.textContent='Книга';
            name?.parentElement?.insertBefore(mark,name);
          }
        });
      }finally{decorating=false;}
    });
  }

  function init(){
    ensureEditor();interceptSave();decorateCards();
    const cards=$('cards');if(cards)new MutationObserver(decorateCards).observe(cards,{childList:true,subtree:true});
    document.addEventListener('click',e=>{
      const btn=e.target.closest?.('.editButton');
      if(btn){const m=(btn.getAttribute('onclick')||'').match(/openEditor\('([^']+)'\)/);if(m)setTimeout(()=>fillEditor(m[1]),0);}
      if(e.target.closest?.('#addBtn'))setTimeout(()=>fillEditor(null),0);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
