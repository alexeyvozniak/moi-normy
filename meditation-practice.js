(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const PART_MS=15*60*1000;
  let session=null,timer=null,wakeLock=null,decorating=false;

  function ensureScreen(){
    if($('meditationPractice'))return;
    const root=document.createElement('div');root.id='meditationPractice';root.className='practiceScreen meditationScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="meditationBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Медитация</div><button class="practiceExit" id="meditationExit" type="button">Вернуться</button></div>
      <div class="meditationSetup"><div class="meditationCard"><div class="practiceKicker">30 минут</div><div class="meditationTitle">Тишина и тема</div><div class="meditationLead">Сначала 15 минут тишины. Затем ещё 15 минут размышления. Тему можно назвать сейчас или только в конце.</div><div class="meditationFlow"><span>15 мин · тишина</span><b>→</b><span>15 мин · тема</span></div><div class="meditationTopic"><label>Тема медитации — необязательно</label><input id="meditationTopic" placeholder="Можно оставить пустой"></div><button class="meditationStart" id="meditationStart" type="button">Начать</button></div></div>
      <div class="meditationRun"><div class="meditationPhase" id="meditationPhase">первая часть</div><div class="meditationTimer" id="meditationTimer">15:00</div><div class="meditationPhaseTitle" id="meditationPhaseTitle">Тишина</div><div class="meditationPhaseTopic" id="meditationPhaseTopic">Ничего не нужно делать.</div><div class="meditationControls"><button class="meditationControl" id="meditationPause" type="button">Пауза</button><button class="meditationControl" id="meditationFinish" type="button">Закончить</button></div></div>
      <div class="meditationDone"><div class="meditationDoneMark">済</div><div class="meditationDoneTitle">Медитация завершена</div><div class="meditationDoneText" id="meditationDoneText"></div><div class="featureField hidden" id="meditationNoteFields" style="width:min(430px,100%);text-align:left;margin-top:18px"><label>Заметка — необязательно</label><textarea id="meditationNoteBody" placeholder="Если хочется что-то сохранить…"></textarea></div><div class="meditationControls"><button class="meditationControl" id="meditationAddNote" type="button">Добавить заметку</button><button class="meditationControl primary" id="meditationDoneClose" type="button">Готово</button></div></div>`;
    document.body.appendChild(root);
    $('meditationExit').addEventListener('click',()=>close(false));$('meditationStart').addEventListener('click',start);$('meditationPause').addEventListener('click',pause);$('meditationFinish').addEventListener('click',()=>{if(confirm('Закончить медитацию сейчас?'))close(false);});$('meditationAddNote').addEventListener('click',()=>{$('meditationNoteFields').classList.remove('hidden');$('meditationNoteBody')?.focus();});$('meditationDoneClose').addEventListener('click',saveNoteAndClose);
  }
  async function lock(){try{if('wakeLock'in navigator)wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
  function unlock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}
  function signal(kind){try{if(typeof navigator.vibrate==='function')navigator.vibrate(kind==='finish'?[90,80,140]:80);}catch(e){}}
  function open(id){
    const item=state.items.find(x=>x.id===id);if(!item||item.practiceType!=='meditation')return;ensureScreen();session={itemId:id,topic:'',phase:0,running:false,paused:false,endAt:0,remaining:PART_MS,historyId:null};$('meditationBackdrop').style.backgroundImage=`url("${item.image||'images/contemplation_looking_up.webp'}")`;$('meditationPractice').className='practiceScreen meditationScreen show';$('meditationTopic').value='';$('meditationNoteFields').classList.add('hidden');$('meditationNoteBody').value='';const final=$('meditationFinalTopic');if(final)final.value='';
  }
  function start(){if(!session)return;session.topic=$('meditationTopic').value.trim();session.phase=1;session.running=true;session.paused=false;session.remaining=PART_MS;session.endAt=Date.now()+PART_MS;$('meditationPractice').classList.add('running');lock();tick();}
  function tick(){clearInterval(timer);timer=setInterval(update,250);update();}
  function update(){
    if(!session?.running||session.paused)return;let ms=session.endAt-Date.now();
    if(ms<=0){signal(session.phase===1?'phase':'finish');if(session.phase===1){session.phase=2;session.remaining=PART_MS;session.endAt=Date.now()+PART_MS;ms=PART_MS;}else{return complete();}}
    const sec=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(sec/60),s=sec%60;$('meditationTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;$('meditationPhase').textContent=session.phase===1?'первая часть · тишина':'вторая часть · тема';$('meditationPhaseTitle').textContent=session.phase===1?'Тишина':(session.topic||'Размышление');$('meditationPhaseTopic').textContent=session.phase===1?'Пятнадцать минут без задачи и без счёта.':(session.topic?`Тема: ${session.topic}`:'Останься с темой, которая проясняется сейчас.');
  }
  function pause(){if(!session?.running)return;if(!session.paused){session.remaining=Math.max(0,session.endAt-Date.now());session.paused=true;$('meditationPause').textContent='Продолжить';unlock();}else{session.paused=false;session.endAt=Date.now()+session.remaining;$('meditationPause').textContent='Пауза';lock();update();}}
  function complete(){
    clearInterval(timer);timer=null;session.running=false;unlock();const item=state.items.find(x=>x.id===session.itemId);
    if(item&&Number(item.debt)>0){const before=state.history[0]?.id||null;subtract(item.id,1,'meditation');session.historyId=state.history[0]?.id!==before?state.history[0]?.id:null;}
    window.praviloJournal?.('meditation_done','Медитация завершена',`15 минут тишины · 15 минут размышления${session.topic?` · тема: ${session.topic}`:''}`,item?.id||'');
    $('meditationDoneText').textContent=`15 минут тишины и 15 минут размышления${session.topic?` над темой «${session.topic}»`:''}.`;$('meditationPractice').classList.remove('running');$('meditationPractice').classList.add('completed');
  }
  function saveNoteAndClose(){
    if(!session)return;const final=($('meditationFinalTopic')?.value||'').trim(),initial=($('meditationTopic')?.value||session.topic||'').trim(),title=final||initial,body=$('meditationNoteBody').value.trim();
    if(session.historyId&&(title||body)){const entry=state.history.find(x=>x.id===session.historyId);if(entry){entry.note={kind:'meditation',title:title||'Медитация',body,createdAt:new Date().toISOString()};save();}}
    close(true);
  }
  function close(completed){clearInterval(timer);timer=null;unlock();$('meditationPractice')?.classList.remove('show','running','completed');session=null;if(completed)render();}
  function decorate(){
    if(decorating)return;decorating=true;requestAnimationFrame(()=>{try{document.querySelectorAll('#cards .task[data-item-id]').forEach(card=>{const item=state.items.find(x=>x.id===card.dataset.itemId),row=card.querySelector('.subRow');if(!row)return;row.querySelectorAll('.meditationPracticeButton').forEach(x=>x.remove());if(item?.practiceType!=='meditation')return;const b=document.createElement('button');b.type='button';b.className='practiceButton meditationPracticeButton';b.textContent='◷ Начать медитацию';b.addEventListener('click',()=>open(item.id));row.insertBefore(b,row.firstChild);});}finally{decorating=false;}});
  }
  function init(){ensureScreen();decorate();window.addEventListener('pravilo:render',decorate);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
