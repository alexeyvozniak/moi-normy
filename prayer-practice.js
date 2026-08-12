(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const MIN_SESSION=100;
  let session=null,wakeLock=null,decorating=false;

  function ensureScreen(){
    if($('prayerPractice'))return;
    const root=document.createElement('div');root.id='prayerPractice';root.className='practiceScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="practiceBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Иисусова молитва</div><button class="practiceExit" id="practiceExit" type="button">Вернуться</button></div><div class="practicePulse" id="practicePulse"></div><div class="practiceCenter"><div class="practiceKicker">осталось</div><div class="practiceName" id="practiceName"></div><div class="practiceCount" id="practiceCount">0</div><div class="practiceCountLabel" id="practiceCountLabel"></div><div class="practiceDone" id="practiceDone"></div><div class="practiceHint" id="practiceHint">Минимум 100 молитв за одну практику.</div></div>`;
    document.body.appendChild(root);
    $('practiceExit').addEventListener('click',e=>{e.stopPropagation();close();});
    root.addEventListener('click',e=>{if(!e.target.closest('.practiceExit'))tap(e);});
  }
  async function lock(){try{if('wakeLock'in navigator)wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
  function unlock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}
  function historyEntry(){return session?.historyId?state.history.find(h=>h.id===session.historyId):null;}
  function effectiveLeft(item){
    const base=Math.max(0,Number(item?.debt)||0);
    return session&&session.count<MIN_SESSION?Math.max(0,base-session.count):base;
  }
  function update(){
    if(!session)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;
    const left=effectiveLeft(item);$('practiceCount').textContent=left;$('practiceCountLabel').textContent=item.unit||'молитв';$('practiceDone').textContent=session.count?`в этой практике: ${session.count}`:'';
    if(session.count<MIN_SESSION){const need=MIN_SESSION-session.count;$('practiceHint').textContent=`Ещё ${need} до минимальной сессии. До 100 результат не сохраняется.`;}
    else $('practiceHint').textContent='Сессия сохранена. Можно продолжать или вернуться в «Правило».';
    if(left<=0&&session.count>=MIN_SESSION){$('prayerPractice').classList.add('practiceFinished');$('practiceCount').textContent='Завершено';$('practiceCountLabel').textContent='молитвенное правило';$('practiceHint').textContent='Можно спокойно вернуться в «Правило».';session.finished=true;}
  }
  function open(id){
    const item=state.items.find(x=>x.id===id);if(!item||item.practiceType!=='prayer')return;ensureScreen();
    if(Number(item.debt)<MIN_SESSION){
      window.praviloNotice?.({kicker:'Молитва',title:'Нужно не меньше 100',message:`Сейчас осталось ${Math.max(0,Number(item.debt)||0)} ${item.unit||'молитв'}. Режим практики сохраняет только сессии от 100 молитв.`});
      return;
    }
    session={itemId:id,count:0,startDebt:Number(item.debt)||0,finished:false,historyId:null};
    $('practiceBackdrop').style.backgroundImage=`url("${item.image||'images/prayer_icons.webp'}")`;$('practiceName').textContent=item.name;$('practiceHint').textContent='Минимум 100 молитв за одну практику.';$('prayerPractice').classList.remove('practiceFinished');$('prayerPractice').classList.add('show');update();lock();
    window.dispatchEvent(new CustomEvent('pravilo:prayer-open',{detail:{itemId:item.id}}));
  }
  function commitFirstHundred(item){
    item.debt=Math.max(0,Number(item.debt)-MIN_SESSION);
    const entry=logAction(item,MIN_SESSION,'practice');
    session.historyId=entry?.id||null;
    save();
  }
  function commitExtra(item){
    item.debt=Math.max(0,Number(item.debt)-1);
    const entry=historyEntry();
    if(entry)entry.amount=Math.max(0,Number(entry.amount)||0)+1;
    else{const created=logAction(item,session.count,'practice');session.historyId=created?.id||null;}
    save();
  }
  function tap(event){
    if(!session||session.finished)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;
    if(session.count>=MIN_SESSION&&Number(item.debt)<=0)return;
    session.count+=1;
    if(session.count===MIN_SESSION)commitFirstHundred(item);
    else if(session.count>MIN_SESSION)commitExtra(item);
    window.dispatchEvent(new CustomEvent('pravilo:prayer-tap',{detail:{itemId:item.id,sessionCount:session.count,remaining:effectiveLeft(item)}}));
    const pulse=$('practicePulse');if(pulse){pulse.style.left=`${event.clientX-30}px`;pulse.style.top=`${event.clientY-30}px`;pulse.classList.remove('go');void pulse.offsetWidth;pulse.classList.add('go');}
    update();
    if(Number(item.debt)<=0&&session.count>=MIN_SESSION){
      window.praviloJournal?.('prayer_done','Завершено молитвенное правило',`${item.name}: ${session.count} ${item.unit}`.trim(),item.id);render();
    }
  }
  function close(){
    if(!session)return;
    const discarded=session.count>0&&session.count<MIN_SESSION;
    $('prayerPractice')?.classList.remove('show');unlock();render();session=null;
    if(discarded)window.praviloNotice?.({kicker:'Молитва',title:'Сессия не сохранена',message:'В этой практике было меньше 100 молитв, поэтому результат обнулён и остаток не изменился.'});
  }
  function decorate(){
    if(decorating)return;decorating=true;requestAnimationFrame(()=>{try{document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{const item=state.items.find(x=>x.id===card.dataset.itemId),row=card.querySelector('.subRow');if(!row)return;row.querySelectorAll('.prayerPracticeButton').forEach(x=>x.remove());if(item?.practiceType!=='prayer')return;const b=document.createElement('button');b.type='button';b.className='practiceButton prayerPracticeButton';b.textContent='◯ Режим практики';b.addEventListener('click',()=>open(item.id));row.insertBefore(b,row.firstChild);});}finally{decorating=false;}});
  }
  function init(){ensureScreen();decorate();window.addEventListener('pravilo:render',decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
