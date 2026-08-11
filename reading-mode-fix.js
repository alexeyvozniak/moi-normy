(()=>{
  'use strict';
  const KEY='pravilo_v1';
  const BACKUP_KEY='pravilo_book_plans_v2';
  const $=id=>document.getElementById(id);
  let patching=false;

  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {items:[],history:[]}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const loadBackups=()=>{try{return JSON.parse(localStorage.getItem(BACKUP_KEY)||'{}')}catch(e){return {}}};
  const saveBackups=b=>localStorage.setItem(BACKUP_KEY,JSON.stringify(b));
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const parseLocal=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const daysLeft=deadline=>{const a=parseLocal(todayKey()),b=parseLocal(deadline);if(!a||!b)return 0;return Math.floor((b-a)/86400000)+1};
  const fmtDate=s=>{const d=parseLocal(s);return d?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(d):''};
  const pluralDays=n=>{const a=Math.abs(n)%100,b=a%10;return a>10&&a<20?'дней':b===1?'день':b>=2&&b<=4?'дня':'дней'};
  const dailyTarget=item=>{const p=item?.readingPlan;if(!p)return null;const rem=Math.max(0,Math.round(Number(item.debt)||0)),days=Math.max(1,daysLeft(p.deadline));return rem?Math.ceil(rem/days):0;};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function rememberPlans(state){const b=loadBackups();let changed=false;for(const item of state.items||[]){if(!item?.id||!item.readingPlan)continue;const snap={...item.readingPlan,itemName:item.name||'',savedAt:Date.now()};if(JSON.stringify(b[item.id])!==JSON.stringify(snap)){b[item.id]=snap;changed=true;}}if(changed)saveBackups(b);}
  function hardenBookItems(){const s=load();let changed=false;for(const item of s.items||[]){if(!item?.readingPlan)continue;if(Number(item.increment)!==0){item.increment=0;changed=true;}if(item.period!=='daily'){item.period='daily';changed=true;}if(item.unit!=='страниц'){item.unit='страниц';changed=true;}if(item.theme!=='reading'){item.theme='reading';changed=true;}if(!Number.isFinite(Number(item.debt))||Number(item.debt)<0){item.debt=0;changed=true;}}if(changed)save(s);rememberPlans(s);return s;}
  function itemForCard(card,state){const cards=[...document.querySelectorAll('#cards .task')],idx=cards.indexOf(card);return idx>=0?(state.items||[])[idx]:null;}
  function text(el,value){if(el&&el.textContent!==String(value))el.textContent=String(value)}
  function attr(el,name,value){if(el&&el.getAttribute(name)!==String(value))el.setAttribute(name,String(value))}

  const originalQuick=window.quickSubtract;
  if(typeof originalQuick==='function'&&!originalQuick.__bookFixedV3){const wrapped=function(id,amount){const s=load(),item=(s.items||[]).find(x=>x.id===id);if(item?.readingPlan){const n=Math.max(0,Math.round(Number(amount)||0));if(!n)return;item.debt=Math.max(0,Math.round(Number(item.debt)||0)-n);item.increment=0;item.lastAccrual=todayKey();save(s);rememberPlans(s);try{window.render?.()}catch(e){location.reload();}setTimeout(patchCards,0);return;}return originalQuick.apply(this,arguments);};wrapped.__bookFixedV3=true;window.quickSubtract=wrapped;}

  function patchCard(card,item){
    const p=item.readingPlan;if(!p)return;
    const remaining=Math.max(0,Math.round(Number(item.debt)||0)),days=Math.max(1,daysLeft(p.deadline)),target=dailyTarget(item)||0,total=Math.max(1,Math.round(Number(p.totalPages)||1)),read=Math.max(0,total-remaining),pct=Math.min(100,Math.round(read/total*100));
    card.classList.add('bookPlanCard','bookTodayCard');
    const name=card.querySelector('.taskName');text(name,p.title||item.name||'Книга');
    let identity=card.querySelector('.bookIdentity');if(!identity&&name){identity=document.createElement('div');identity.className='bookIdentity';name.insertAdjacentElement('afterend',identity);}
    if(identity)identity.innerHTML=`<span class="bookIdentityLabel">книга</span><span class="bookIdentityTitle">${esc(p.title||item.name||'Без названия')}</span>`;
    text(card.querySelector('.debtNumber'),target);text(card.querySelector('.debtUnit'),remaining===0?'книга дочитана':'страниц сегодня');
    text(card.querySelector('.taskRule'),remaining===0?'Книга дочитана':`до ${fmtDate(p.deadline)} · осталось ${remaining} стр.`);
    text(card.querySelector('.debtNote'),remaining===0?'Готово. Книга дочитана.':`Сегодня нужно ${target} стр. · всего осталось ${remaining} стр. · ${days} ${pluralDays(days)} до срока`);
    const quick=[...card.querySelectorAll('.button')].find(b=>(b.getAttribute('onclick')||'').startsWith('quickSubtract'));if(quick){text(quick,target>0?`−${target}`:'Готово');if(target>0){quick.disabled=false;attr(quick,'onclick',`quickSubtract('${item.id}',${target})`);}else quick.disabled=true;quick.title='Списать сегодняшнюю рассчитанную норму';}
    let progress=card.querySelector('.bookProgress');if(!progress){progress=document.createElement('div');progress.className='bookProgress';card.appendChild(progress);}const html=`<div class="bookProgressHead"><span>${read} из ${total} стр.</span><span>${pct}%</span></div><div class="bookProgressTrack"><div class="bookProgressFill" style="width:${pct}%"></div></div>`;if(progress.innerHTML!==html)progress.innerHTML=html;
    const close=[...card.querySelectorAll('.button')].find(b=>b.dataset.bookClose==='1'||b.textContent.trim()==='Дочитано'||b.textContent.trim()==='Закрыть');if(close){close.dataset.bookClose='1';text(close,'Дочитано');close.onclick=e=>{e.preventDefault();e.stopPropagation();const st=load(),it=(st.items||[]).find(x=>x.id===item.id);if(!it||!it.readingPlan)return;if((Number(it.debt)||0)<=0)return;if(!confirm('Отметить книгу дочитанной и закрыть весь оставшийся объём?'))return;it.debt=0;it.increment=0;it.lastAccrual=todayKey();save(st);rememberPlans(st);try{window.render?.()}catch(err){location.reload();}setTimeout(patchCards,0);};}
  }
  function patchCards(){if(patching)return;patching=true;requestAnimationFrame(()=>{try{const s=hardenBookItems();document.querySelectorAll('#cards .task').forEach(card=>{const item=itemForCard(card,s);if(item?.readingPlan)patchCard(card,item);});}finally{patching=false;}});}
  function init(){hardenBookItems();patchCards();const cards=$('cards');if(cards)new MutationObserver(()=>{if(!patching)patchCards()}).observe(cards,{childList:true,subtree:true,characterData:true});document.addEventListener('click',e=>{if(e.target.closest?.('.editButton,#addBtn'))setTimeout(patchCards,120);if(e.target.closest?.('#amountSave'))setTimeout(()=>{hardenBookItems();patchCards();},80);},true);document.addEventListener('visibilitychange',()=>{if(!document.hidden){hardenBookItems();patchCards();}});window.addEventListener('pageshow',()=>{hardenBookItems();patchCards();});setInterval(()=>{if(!document.hidden)patchCards();},60000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
