(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const DRAFT_KEY='pravilo_prayer_session_v1';
  const Domain=window.PraviloDomain;
  let session=null,wakeLock=null,decorating=false,resumePromptOpen=false;

  const creditedFor=count=>Domain?.prayerCredited?.(count)??Math.floor(Math.max(0,Number(count)||0)/100)*100;

  function ensureScreen(){
    if($('prayerPractice'))return;
    const root=document.createElement('div');root.id='prayerPractice';root.className='practiceScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="practiceBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Иисусова молитва</div><button class="practiceExit" id="practiceExit" type="button">Вернуться</button></div><div class="practicePulse" id="practicePulse"></div><div class="practiceCenter"><div class="practiceKicker">осталось</div><div class="practiceName" id="practiceName"></div><div class="practiceCount" id="practiceCount">0</div><div class="practiceCountLabel" id="practiceCountLabel"></div><div class="practiceDone" id="practiceDone"></div><div class="practiceHint" id="practiceHint">Засчитываются только полные сотни.</div></div>`;
    document.body.appendChild(root);
    $('practiceExit').addEventListener('click',e=>{e.stopPropagation();void requestClose();});
    root.addEventListener('click',e=>{if(!e.target.closest('.practiceExit'))tap(e);});
  }
  async function lock(){try{if('wakeLock'in navigator)wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
  function unlock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}
  function historyEntry(){return session?.historyId?(state.history||[]).find(h=>String(h.id)===String(session.historyId)):null;}
  function tail(){return session?Math.max(0,session.count-session.credited):0;}
  function effectiveLeft(item){return Math.max(0,(Number(item?.debt)||0)-tail());}

  function saveDraft(){
    if(!session)return;
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify({itemId:session.itemId,count:session.count,credited:session.credited,startDebt:session.startDebt,historyId:session.historyId||null,updatedAt:new Date().toISOString()}));}catch(_){}
  }
  function readDraft(){
    try{const raw=localStorage.getItem(DRAFT_KEY);return raw?JSON.parse(raw):null;}catch(_){return null;}
  }
  function clearDraft(){try{localStorage.removeItem(DRAFT_KEY);}catch(_){} }

  function update(){
    if(!session)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;
    const left=effectiveLeft(item),remainder=tail(),next=session.credited+100;
    $('practiceCount').textContent=left;$('practiceCountLabel').textContent=item.unit||'молитв';
    $('practiceDone').textContent=session.count?`в этой практике: ${session.count} · засчитано ${session.credited}`:'';
    if(!session.count)$('practiceHint').textContent='Засчитываются только полные сотни. Первая отметка — на 100.';
    else if(remainder===0)$('practiceHint').textContent=`${session.credited} засчитано. Можно продолжить следующую сотню или вернуться.`;
    else $('practiceHint').textContent=`До ${next}: ${next-session.count}. При завершении сейчас засчитается ${session.credited}.`;
  }

  function showSession(item){
    ensureScreen();$('practiceBackdrop').style.backgroundImage=`url("${item.image||'images/prayer_icons.webp'}")`;$('practiceName').textContent=item.name;$('prayerPractice').classList.remove('practiceFinished');$('prayerPractice').classList.add('show');update();void lock();
    window.dispatchEvent(new CustomEvent('pravilo:prayer-open',{detail:{itemId:item.id}}));
  }

  function open(id){
    const item=state.items.find(x=>x.id===id);if(!item||item.practiceType!=='prayer')return;
    if(Number(item.debt)<100){window.praviloNotice?.({kicker:'Молитва',title:'Нужно не меньше 100',message:`Сейчас осталось ${Math.max(0,Number(item.debt)||0)} ${item.unit||'молитв'}. В режиме практики засчитываются только полные сотни.`});return;}
    session={itemId:id,count:0,credited:0,startDebt:Number(item.debt)||0,historyId:null};saveDraft();showSession(item);
  }

  function commitHundreds(item,target){
    const delta=Math.max(0,target-session.credited);if(!delta)return;
    const amount=Math.min(delta,Math.max(0,Number(item.debt)||0));if(!amount)return;
    item.debt=Math.max(0,Number(item.debt)-amount);
    const entry=historyEntry();
    if(entry)entry.amount=Math.max(0,Number(entry.amount)||0)+amount;
    else{const created=logAction(item,amount,'practice');session.historyId=created?.id||null;}
    session.credited+=amount;save();
  }

  function tap(event){
    if(!session)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;
    if(session.count>=session.startDebt)return;
    session.count+=1;
    const target=creditedFor(session.count);if(target>session.credited)commitHundreds(item,target);
    saveDraft();
    window.dispatchEvent(new CustomEvent('pravilo:prayer-tap',{detail:{itemId:item.id,sessionCount:session.count,credited:session.credited,remaining:effectiveLeft(item)}}));
    const pulse=$('practicePulse');if(pulse){pulse.style.left=`${event.clientX-30}px`;pulse.style.top=`${event.clientY-30}px`;pulse.classList.remove('go');void pulse.offsetWidth;pulse.classList.add('go');}
    update();
  }

  function finishSession(){
    if(!session)return;const item=state.items.find(x=>x.id===session.itemId),count=session.count,credited=session.credited;
    $('prayerPractice')?.classList.remove('show');unlock();clearDraft();session=null;render();
    if(count>credited)window.praviloNotice?.({kicker:'Молитва',title:`Засчитано ${credited}`,message:`Практика остановилась на ${count}. Неполная сотня не засчитана.`});
    if(item&&credited>0&&Number(item.debt)<=0)window.praviloJournal?.('prayer_done','Завершено молитвенное правило',`${item.name}: ${credited} ${item.unit}`.trim(),item.id);
  }

  async function requestClose(){
    if(!session)return;
    const remainder=tail();if(!remainder)return finishSession();
    const next=session.credited+100;
    const ok=await (window.praviloConfirm?.({kicker:'Молитва',title:`Вы остановились на ${session.count}`,message:`До ${next} осталось ${next-session.count}. Продолжить до полной сотни? Если закончить сейчас, будет засчитано ${session.credited}.`,confirmText:'Продолжить',cancelText:'Закончить',danger:false})??Promise.resolve(false));
    if(ok)return;
    finishSession();
  }

  async function offerResume(){
    if(resumePromptOpen||session)return;const draft=readDraft();if(!draft)return;
    const item=(state.items||[]).find(x=>String(x.id)===String(draft.itemId));if(!item||item.practiceType!=='prayer'){clearDraft();return;}
    const count=Math.max(0,Math.floor(Number(draft.count)||0)),credited=Math.max(0,Math.floor(Number(draft.credited)||0));
    if(!count||count===credited){clearDraft();return;}
    resumePromptOpen=true;
    const next=credited+100;
    const ok=await (window.praviloConfirm?.({kicker:'Незавершённая молитва',title:`Вы остановились на ${count}`,message:`До ${next} осталось ${next-count}. Продолжить с этого места? Если закончить, останется засчитано ${credited}.`,confirmText:'Продолжить',cancelText:'Закончить',danger:false})??Promise.resolve(false));
    resumePromptOpen=false;
    if(!ok){clearDraft();return;}
    session={itemId:item.id,count,credited,startDebt:Math.max(count,Number(draft.startDebt)||count),historyId:draft.historyId||null};showSession(item);saveDraft();
  }

  function decorate(){
    if(decorating)return;decorating=true;requestAnimationFrame(()=>{try{document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{const item=state.items.find(x=>x.id===card.dataset.itemId),row=card.querySelector('.subRow');if(!row)return;row.querySelectorAll('.prayerPracticeButton').forEach(x=>x.remove());if(item?.practiceType!=='prayer')return;const b=document.createElement('button');b.type='button';b.className='practiceButton prayerPracticeButton';b.textContent='◯ Режим практики';b.addEventListener('click',()=>open(item.id));row.insertBefore(b,row.firstChild);});}finally{decorating=false;}});
  }
  function init(){ensureScreen();decorate();window.addEventListener('pravilo:render',decorate);setTimeout(()=>{void offerResume();},220);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
