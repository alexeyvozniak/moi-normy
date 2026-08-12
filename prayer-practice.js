(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let session=null,wakeLock=null,decorating=false;

  function ensureScreen(){
    if($('prayerPractice'))return;
    const root=document.createElement('div');root.id='prayerPractice';root.className='practiceScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="practiceBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Иисусова молитва</div><button class="practiceExit" id="practiceExit" type="button">Вернуться</button></div><div class="practicePulse" id="practicePulse"></div><div class="practiceCenter"><div class="practiceKicker">осталось</div><div class="practiceName" id="practiceName"></div><div class="practiceCount" id="practiceCount">0</div><div class="practiceCountLabel" id="practiceCountLabel"></div><div class="practiceDone" id="practiceDone"></div><div class="practiceHint" id="practiceHint">Коснись свободного места на экране после каждой молитвы.</div></div>`;
    document.body.appendChild(root);
    $('practiceExit').addEventListener('click',e=>{e.stopPropagation();close();});
    root.addEventListener('click',e=>{if(!e.target.closest('.practiceExit'))tap(e);});
  }
  async function lock(){try{if('wakeLock'in navigator)wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
  function unlock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}
  function update(){
    if(!session)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;
    const left=Math.max(0,Number(item.debt)||0);$('practiceCount').textContent=left;$('practiceCountLabel').textContent=item.unit||'молитв';$('practiceDone').textContent=session.logged?`в этой практике: ${session.logged}`:'';
    if(left<=0){$('prayerPractice').classList.add('practiceFinished');$('practiceCount').textContent='Завершено';$('practiceCountLabel').textContent='молитвенное правило';$('practiceHint').textContent='Можно спокойно вернуться в «Правило».';session.finished=true;}
  }
  function open(id){
    const item=state.items.find(x=>x.id===id);if(!item||item.practiceType!=='prayer')return;ensureScreen();session={itemId:id,logged:0,startDebt:Number(item.debt)||0,finished:false};$('practiceBackdrop').style.backgroundImage=`url("${item.image||'images/prayer_icons.webp'}")`;$('practiceName').textContent=item.name;$('practiceHint').textContent='Коснись свободного места на экране после каждой молитвы.';$('prayerPractice').classList.remove('practiceFinished');$('prayerPractice').classList.add('show');update();lock();
  }
  function tap(event){
    if(!session||session.finished)return;const item=state.items.find(x=>x.id===session.itemId);if(!item||Number(item.debt)<=0)return;
    item.debt=Math.max(0,Number(item.debt)-1);session.logged+=1;save();
    const pulse=$('practicePulse');if(pulse){pulse.style.left=`${event.clientX-30}px`;pulse.style.top=`${event.clientY-30}px`;pulse.classList.remove('go');void pulse.offsetWidth;pulse.classList.add('go');}
    update();
    if(Number(item.debt)<=0){flush('close');window.praviloJournal?.('prayer_done','Завершено молитвенное правило',`${item.name}: ${session.startDebt} ${item.unit}`.trim(),item.id);render();}
  }
  function flush(source='practice'){
    if(!session?.logged)return;const item=state.items.find(x=>x.id===session.itemId);if(!item)return;logAction(item,session.logged,source);session.logged=0;save();
  }
  function close(){if(!session)return;flush('practice');$('prayerPractice')?.classList.remove('show');unlock();render();session=null;}
  function decorate(){
    if(decorating)return;decorating=true;requestAnimationFrame(()=>{try{document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{const item=state.items.find(x=>x.id===card.dataset.itemId),row=card.querySelector('.subRow');if(!row)return;row.querySelectorAll('.prayerPracticeButton').forEach(x=>x.remove());if(item?.practiceType!=='prayer')return;const b=document.createElement('button');b.type='button';b.className='practiceButton prayerPracticeButton';b.textContent='◯ Режим практики';b.addEventListener('click',()=>open(item.id));row.insertBefore(b,row.firstChild);});}finally{decorating=false;}});
  }
  function init(){ensureScreen();decorate();window.addEventListener('pravilo:render',decorate);document.addEventListener('visibilitychange',()=>{if(document.hidden&&session)flush('practice');});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
