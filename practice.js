(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const nowIso=()=>new Date().toISOString();
  let prayerSession=null;
  let meditation=null;
  let meditationTimer=null;
  let audioCtx=null;
  let wakeLock=null;
  let editorSnapshot=null;

  function isJesus(i){
    if(!i)return false;
    return i.id==='prayers'||i.theme==='jesus'||/иисус|молитв|четк|чётк/i.test(`${i.name||''} ${i.unit||''}`);
  }
  function isMeditation(i){
    if(!i)return false;
    return i.id==='meditation'||i.theme==='contemplation'||/медит|созерц|тишин/i.test(`${i.name||''} ${i.unit||''}`);
  }
  function ensureJournal(){if(!Array.isArray(state.pathJournal))state.pathJournal=[];if(!state.pathMeta||typeof state.pathMeta!=='object')state.pathMeta={books:{}};if(!state.pathMeta.books)state.pathMeta.books={};}
  function journal(type,title,text='',itemId=''){
    ensureJournal();
    state.pathJournal.unshift({id:uid(),ts:nowIso(),type,title,text,itemId});
    state.pathJournal=state.pathJournal.slice(0,400);
    save();
  }
  function fmtDate(ts){return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(ts));}
  function esc(s){return escapeHtml(String(s??''));}

  function addPathTab(){
    if(document.querySelector('.tab[data-tab="path"]'))return;
    const historyTab=document.querySelector('.tab[data-tab="history"]');
    const btn=document.createElement('button');btn.className='tab';btn.dataset.tab='path';btn.textContent='Путь';
    historyTab?.insertAdjacentElement('afterend',btn);
    const main=$('catalogView')?.parentElement;
    const section=document.createElement('section');section.id='pathView';section.className='hidden';
    section.innerHTML=`<div class="pathHero"><div class="pathHeroCopy"><div class="pathKicker">Личная рукопись</div><div class="pathTitle">Путь</div><div class="pathLead">Книги, заметки, изменения правила и завершённые практики — без очков, серий и оценок.</div></div></div><div id="pathTimeline" class="pathTimeline"></div>`;
    main?.appendChild(section);
    btn.addEventListener('click',()=>openPath());
    document.addEventListener('click',e=>{
      const t=e.target.closest?.('.tab');
      if(t&&t.dataset.tab!=='path')section.classList.add('hidden');
    },true);
  }
  function openPath(){
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab==='path'));
    ['todayView','weekView','historyView','catalogView'].forEach(id=>$(id)?.classList.add('hidden'));
    $('pathView')?.classList.remove('hidden');
    renderPath();
  }

  function bookEvents(){
    ensureJournal();let changed=false;
    for(const item of state.items||[]){
      const p=item.readingPlan;if(!p)continue;
      const key=item.id;const meta=state.pathMeta.books[key]||{};
      const fingerprint=`${p.title}|${p.totalPages}|${p.deadline}`;
      if(meta.fingerprint!==fingerprint){
        state.pathJournal.unshift({id:uid(),ts:nowIso(),type:'book_start',title:`Начата книга «${p.title}»`,text:`${p.totalPages} стр. · срок до ${fmtDate(p.deadline+'T12:00:00')}`,itemId:item.id});
        state.pathMeta.books[key]={fingerprint,completed:false};changed=true;
      }
      const m=state.pathMeta.books[key];
      if(Number(item.debt)===0&&!m.completed){
        state.pathJournal.unshift({id:uid(),ts:nowIso(),type:'book_done',title:`Дочитана книга «${p.title}»`,text:`${p.totalPages} страниц`,itemId:item.id});
        m.completed=true;changed=true;
      }
    }
    if(changed){state.pathJournal=state.pathJournal.slice(0,400);save();}
  }

  function pathEntries(){
    ensureJournal();
    const out=(state.pathJournal||[]).map(x=>({...x,source:'journal'}));
    for(const h of state.history||[]){
      if(!h.note)continue;
      const med=h.note.kind==='meditation'||/медит|созерц/i.test(h.item||'');
      out.push({id:`note-${h.id}`,ts:h.ts,type:'note',title:h.note.title||(med?'Заметка после медитации':'Заметка о чтении'),text:h.note.body||'',itemId:h.itemId,tag:med?'медитация':'чтение'});
    }
    return out.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  }
  function renderPath(){
    bookEvents();const el=$('pathTimeline');if(!el)return;
    const entries=pathEntries();
    if(!entries.length){el.innerHTML='<div class="pathEmpty">Здесь постепенно появится твоя рукопись: завершённые практики, книги, заметки и изменения правила.</div>';return;}
    el.innerHTML=entries.map(x=>{
      const tag=x.tag||({book_start:'книга',book_done:'книга завершена',prayer_done:'молитва',meditation_done:'медитация',rule:'изменение правила',note:'заметка'}[x.type]||'путь');
      return `<article class="pathEntry ${x.type==='note'?'note':''}"><div class="pathDate">${fmtDate(x.ts)}</div><div class="pathEntryTitle">${esc(x.title)}</div>${x.text?`<div class="pathEntryText">${esc(x.text)}</div>`:''}<div class="pathTag">${esc(tag)}</div></article>`;
    }).join('');
  }

  function practiceButtons(){
    const cards=[...document.querySelectorAll('#cards .task')];
    (state.items||[]).forEach((item,i)=>{
      const card=cards[i];if(!card)return;
      const row=card.querySelector('.subRow');if(!row)return;
      row.querySelectorAll('.practiceButton').forEach(b=>b.remove());
      if(isJesus(item)){
        const b=document.createElement('button');b.className='practiceButton';b.textContent='◯ Режим практики';b.addEventListener('click',()=>openPrayerPractice(item.id));row.insertBefore(b,row.firstChild);
      }else if(isMeditation(item)){
        const b=document.createElement('button');b.className='practiceButton';b.textContent='◷ Начать медитацию';b.addEventListener('click',()=>openMeditation(item.id));row.insertBefore(b,row.firstChild);
      }
    });
  }

  function ensurePrayerScreen(){
    if($('prayerPractice'))return;
    const root=document.createElement('div');root.id='prayerPractice';root.className='practiceScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="practiceBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Иисусова молитва</div><button class="practiceExit" id="practiceExit">Вернуться</button></div><div class="practicePulse" id="practicePulse"></div><div class="practiceCenter"><div class="practiceKicker">осталось</div><div class="practiceName" id="practiceName"></div><div class="practiceCount" id="practiceCount">0</div><div class="practiceCountLabel" id="practiceCountLabel"></div><div class="practiceDone" id="practiceDone"></div><div class="practiceHint" id="practiceHint">Коснись свободного места на экране после каждой молитвы. Никаких серий и наград — только счёт.</div></div>`;
    document.body.appendChild(root);
    $('practiceExit').addEventListener('click',e=>{e.stopPropagation();closePrayerPractice();});
    root.addEventListener('click',e=>{if(e.target.closest('.practiceExit'))return;prayerTap(e);});
  }
  function openPrayerPractice(id){
    const item=state.items.find(x=>x.id===id);if(!item)return;
    ensurePrayerScreen();
    prayerSession={itemId:id,logged:0,startDebt:Number(item.debt)||0,finished:false};
    $('practiceBackdrop').style.backgroundImage=`url("${item.image||'images/prayer_icons.webp'}")`;
    $('practiceName').textContent=item.name;
    $('prayerPractice').classList.remove('practiceFinished');
    $('prayerPractice').classList.add('show');
    updatePrayerScreen();requestWakeLock();
  }
  function updatePrayerScreen(){
    if(!prayerSession)return;const item=state.items.find(x=>x.id===prayerSession.itemId);if(!item)return;
    $('practiceCount').textContent=Math.max(0,Number(item.debt)||0);
    $('practiceCountLabel').textContent=item.unit||'молитв';
    $('practiceDone').textContent=prayerSession.logged?`в этой практике: ${prayerSession.logged}`:'';
    if(Number(item.debt)<=0){
      $('prayerPractice').classList.add('practiceFinished');$('practiceCount').textContent='Завершено';$('practiceCountLabel').textContent='молитвенное правило';$('practiceHint').textContent='Можно спокойно вернуться в «Правило».';
    }
  }
  function prayerTap(e){
    if(!prayerSession||prayerSession.finished)return;
    const item=state.items.find(x=>x.id===prayerSession.itemId);if(!item||Number(item.debt)<=0)return;
    item.debt=Math.max(0,Number(item.debt)-1);prayerSession.logged+=1;save();
    const pulse=$('practicePulse');pulse.style.left=`${e.clientX-30}px`;pulse.style.top=`${e.clientY-30}px`;pulse.classList.remove('go');void pulse.offsetWidth;pulse.classList.add('go');
    if(navigator.vibrate)navigator.vibrate(8);
    updatePrayerScreen();
    if(Number(item.debt)===0){
      flushPrayer(true);prayerSession.finished=true;
      journal('prayer_done','Завершено молитвенное правило',`${item.name}: ${prayerSession.startDebt} ${item.unit}`.trim(),item.id);
      render();practiceButtons();
    }
  }
  function flushPrayer(completed=false){
    if(!prayerSession||!prayerSession.logged)return;
    const item=state.items.find(x=>x.id===prayerSession.itemId);if(!item)return;
    logAction(item,prayerSession.logged,completed?'close':'practice');prayerSession.logged=0;save();
  }
  function closePrayerPractice(){flushPrayer(false);$('prayerPractice')?.classList.remove('show');releaseWakeLock();render();practiceButtons();prayerSession=null;}

  function ensureMeditationScreen(){
    if($('meditationPractice'))return;
    const root=document.createElement('div');root.id='meditationPractice';root.className='practiceScreen meditationScreen';
    root.innerHTML=`<div class="practiceBackdrop" id="meditationBackdrop"></div><div class="practiceVeil"></div><div class="practiceTop"><div class="practiceTopLabel">Медитация</div><button class="practiceExit" id="meditationExit">Вернуться</button></div>
    <div class="meditationSetup"><div class="meditationCard"><div class="practiceKicker">30 минут</div><div class="meditationTitle">Тишина и тема</div><div class="meditationLead">Сначала 15 минут просто тишины. После сигнала — ещё 15 минут размышления над выбранной темой.</div><div class="meditationFlow"><span>15 мин · тишина</span><b>→</b><span>15 мин · тема</span></div><div class="meditationTopic"><label>Тема второй части</label><input id="meditationTopic" placeholder="Например: благодарность, призвание, псалом…"></div><button class="meditationStart" id="meditationStart">Начать</button></div></div>
    <div class="meditationRun"><div class="meditationPhase" id="meditationPhase">первая часть</div><div class="meditationTimer" id="meditationTimer">15:00</div><div class="meditationPhaseTitle" id="meditationPhaseTitle">Тишина</div><div class="meditationPhaseTopic" id="meditationPhaseTopic">Ничего не нужно делать.</div><div class="meditationControls"><button class="meditationControl" id="meditationPause">Пауза</button><button class="meditationControl" id="meditationFinish">Закончить</button></div></div>
    <div class="meditationDone"><div class="meditationDoneMark">済</div><div class="meditationDoneTitle">Медитация завершена</div><div class="meditationDoneText" id="meditationDoneText">15 минут тишины и 15 минут размышления.</div><div class="featureField hidden" id="meditationNoteFields" style="width:min(430px,100%);text-align:left;margin-top:18px"><label>Заметка — необязательно</label><textarea id="meditationNoteBody" placeholder="Если хочется что-то сохранить…"></textarea></div><div class="meditationControls"><button class="meditationControl" id="meditationAddNote">Добавить заметку</button><button class="meditationControl primary" id="meditationDoneClose">Готово</button></div></div>`;
    document.body.appendChild(root);
    $('meditationExit').addEventListener('click',()=>closeMeditation(false));
    $('meditationStart').addEventListener('click',startMeditation);
    $('meditationPause').addEventListener('click',toggleMeditationPause);
    $('meditationFinish').addEventListener('click',()=>{if(confirm('Закончить медитацию сейчас?'))closeMeditation(false);});
    $('meditationAddNote').addEventListener('click',()=>{$('meditationNoteFields').classList.remove('hidden');$('meditationNoteBody').focus();});
    $('meditationDoneClose').addEventListener('click',saveMeditationNoteAndClose);
  }
  function openMeditation(id){
    const item=state.items.find(x=>x.id===id);if(!item)return;
    ensureMeditationScreen();
    meditation={itemId:id,topic:'',phase:0,running:false,paused:false,endAt:0,remaining:900000,historyId:null};
    $('meditationBackdrop').style.backgroundImage=`url("${item.image||'images/contemplation_looking_up.webp'}")`;
    $('meditationPractice').className='practiceScreen meditationScreen show';$('meditationTopic').value='';$('meditationNoteFields').classList.add('hidden');$('meditationNoteBody').value='';
  }
  async function primeAudio(){
    try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();g.gain.value=.0001;o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.02);}catch(e){}
  }
  function bell(){
    try{
      if(!audioCtx)return;const now=audioCtx.currentTime;[0,0.11,0.23].forEach((d,k)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=740-k*85;g.gain.setValueAtTime(0.0001,now+d);g.gain.exponentialRampToValueAtTime(.18,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.7);o.connect(g);g.connect(audioCtx.destination);o.start(now+d);o.stop(now+d+.72);});
    }catch(e){}
  }
  async function startMeditation(){
    await primeAudio();meditation.topic=$('meditationTopic').value.trim();meditation.phase=1;meditation.running=true;meditation.paused=false;meditation.remaining=900000;meditation.endAt=Date.now()+meditation.remaining;$('meditationPractice').classList.add('running');requestWakeLock();tickMeditation();
  }
  function tickMeditation(){
    clearInterval(meditationTimer);meditationTimer=setInterval(updateMeditation,250);updateMeditation();
  }
  function updateMeditation(){
    if(!meditation?.running||meditation.paused)return;
    let ms=meditation.endAt-Date.now();
    if(ms<=0){
      bell();
      if(meditation.phase===1){meditation.phase=2;meditation.remaining=900000;meditation.endAt=Date.now()+meditation.remaining;}
      else{return completeMeditation();}
      ms=meditation.remaining;
    }
    const sec=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(sec/60),s=sec%60;
    $('meditationTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    $('meditationPhase').textContent=meditation.phase===1?'первая часть · тишина':'вторая часть · тема';
    $('meditationPhaseTitle').textContent=meditation.phase===1?'Тишина':(meditation.topic||'Размышление');
    $('meditationPhaseTopic').textContent=meditation.phase===1?'Пятнадцать минут без задачи и без счёта.':(meditation.topic?`Тема: ${meditation.topic}`:'Останься с темой, которая сейчас требует внимания.');
  }
  function toggleMeditationPause(){
    if(!meditation?.running)return;
    if(!meditation.paused){meditation.remaining=Math.max(0,meditation.endAt-Date.now());meditation.paused=true;$('meditationPause').textContent='Продолжить';releaseWakeLock();}
    else{meditation.paused=false;meditation.endAt=Date.now()+meditation.remaining;$('meditationPause').textContent='Пауза';requestWakeLock();updateMeditation();}
  }
  function completeMeditation(){
    clearInterval(meditationTimer);meditationTimer=null;meditation.running=false;bell();releaseWakeLock();
    const item=state.items.find(x=>x.id===meditation.itemId);
    if(item&&Number(item.debt)>0){const before=state.history?.[0]?.id;subtract(item.id,1,'practice');meditation.historyId=state.history?.[0]?.id!==before?state.history?.[0]?.id:null;}
    journal('meditation_done','Медитация завершена',`15 минут тишины · 15 минут размышления${meditation.topic?` · тема: ${meditation.topic}`:''}`,item?.id||'');
    $('meditationDoneText').textContent=`15 минут тишины и 15 минут размышления${meditation.topic?` над темой «${meditation.topic}»`:''}.`;
    $('meditationPractice').classList.remove('running');$('meditationPractice').classList.add('completed');practiceButtons();
  }
  function saveMeditationNoteAndClose(){
    const body=$('meditationNoteBody').value.trim();
    if(body&&meditation?.historyId){const h=(state.history||[]).find(x=>x.id===meditation.historyId);if(h){h.note={kind:'meditation',title:meditation.topic||'Медитация',body,createdAt:nowIso()};save();}}
    closeMeditation(true);
  }
  function closeMeditation(afterComplete){clearInterval(meditationTimer);meditationTimer=null;releaseWakeLock();$('meditationPractice')?.classList.remove('show','running','completed');if(afterComplete){render();practiceButtons();renderPath();}meditation=null;}

  async function requestWakeLock(){try{if('wakeLock'in navigator)wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
  function releaseWakeLock(){try{wakeLock?.release();}catch(e){}wakeLock=null;}

  function snapshotItem(){
    const id=typeof editId!=='undefined'?editId:null;if(!id)return null;const i=state.items.find(x=>x.id===id);if(!i)return null;
    return {id:i.id,name:i.name,increment:i.increment,period:i.period,intervalDays:i.intervalDays,quick:i.quick,paused:i.paused,resetMode:i.resetMode,dailyTarget:i.dailyTarget,readingPlan:i.readingPlan?JSON.stringify(i.readingPlan):''};
  }
  function installRuleJournal(){
    const btn=$('saveTask');if(!btn||btn.dataset.pathHook)return;btn.dataset.pathHook='1';
    btn.addEventListener('pointerdown',()=>{editorSnapshot=snapshotItem();},true);
    btn.addEventListener('click',()=>{
      const before=editorSnapshot;setTimeout(()=>{
        if(!before)return;const after=state.items.find(x=>x.id===before.id);if(!after)return;
        const a={name:after.name,increment:after.increment,period:after.period,intervalDays:after.intervalDays,quick:after.quick,paused:after.paused,resetMode:after.resetMode,dailyTarget:after.dailyTarget,readingPlan:after.readingPlan?JSON.stringify(after.readingPlan):''};
        const b={name:before.name,increment:before.increment,period:before.period,intervalDays:before.intervalDays,quick:before.quick,paused:before.paused,resetMode:before.resetMode,dailyTarget:before.dailyTarget,readingPlan:before.readingPlan};
        if(JSON.stringify(a)!==JSON.stringify(b))journal('rule',`Изменено правило «${after.name}»`,after.resetMode==='daily'?`Теперь: ${after.dailyTarget} ${after.unit} каждый день без переноса.`:ruleText(after),after.id);
      },120);
    },true);
  }

  function augmentGuide(){
    const cards=$('guideFeatureOverlay')?.querySelector('.guideCards');if(!cards||cards.querySelector('[data-practice-guide]'))return;
    const a=document.createElement('div');a.className='guideCard';a.dataset.practiceGuide='1';a.innerHTML='<div class="guideNum">七</div><div class="guideTitle">Режим практики</div><div class="guideText">У Иисусовой молитвы есть тихий полноэкранный счётчик: одно касание — одна молитва. У медитации — 15 минут тишины, сигнал и ещё 15 минут размышления над темой.</div>';
    const b=document.createElement('div');b.className='guideCard';b.dataset.practiceGuide='1';b.innerHTML='<div class="guideNum">八</div><div class="guideTitle">Путь</div><div class="guideText">Это личная рукопись: завершённые практики, книги, изменения правила и заметки собираются в хронологию без очков и серий.</div>';
    cards.append(a,b);
  }

  function init(){
    ensureJournal();bookEvents();addPathTab();practiceButtons();installRuleJournal();
    const cards=$('cards');if(cards)new MutationObserver(practiceButtons).observe(cards,{childList:true,subtree:false});
    document.addEventListener('click',e=>{if(e.target.closest?.('#openGuideBtn'))setTimeout(augmentGuide,40);},true);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&prayerSession)flushPrayer(false);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
