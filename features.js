(()=>{
  'use strict';
  const STORAGE_KEY='pravilo_v1';
  const SEEN_BUILD_KEY='pravilo_seen_build_v1';
  const RETURN_TAB_KEY='pravilo_return_tab_v1';
  let currentEditId=null;
  let noteEntryId=null;
  let latestRemoteBuild=null;
  let decorating=false;

  const $=id=>document.getElementById(id);
  const readState=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch(e){return {items:[],history:[]}}};
  const writeState=s=>localStorage.setItem(STORAGE_KEY,JSON.stringify(s));
  const itemById=(s,id)=>(s.items||[]).find(x=>x.id===id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const parseLocal=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const daysLeft=deadline=>{const a=parseLocal(todayKey()),b=parseLocal(deadline);if(!a||!b)return 0;return Math.floor((b-a)/86400000)+1};
  const targetFor=(remaining,deadline)=>remaining<=0?0:Math.ceil(remaining/Math.max(1,daysLeft(deadline)));
  const fmtDate=s=>{const d=parseLocal(s);return d?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(d):''};
  const pluralDays=n=>n===1?'день':(n>=2&&n<=4?'дня':'дней');

  function isReadingItem(i){
    if(!i)return false;
    return i.id==='pages'||i.theme==='reading'||/чтен|книг|страниц|read|book/i.test(`${i.name||''} ${i.unit||''}`);
  }
  function isMeditationItem(i){
    if(!i)return false;
    return i.id==='meditation'||i.theme==='contemplation'||/медит|созерц|тишин/i.test(`${i.name||''} ${i.unit||''}`);
  }
  function historyKind(entry,state){
    const item=itemById(state,entry.itemId);
    if(isMeditationItem(item)||/медит|созерц/i.test(entry.item||''))return 'meditation';
    if(isReadingItem(item)||/чтен|книг|страниц/i.test(`${entry.item||''} ${entry.unit||''}`))return 'reading';
    return null;
  }

  function toast(text){
    let t=$('featureToast');
    if(!t){t=document.createElement('div');t.id='featureToast';t.className='toast';document.body.appendChild(t);}
    t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2200);
  }

  function ensureBookBox(){
    if($('bookModeBox'))return;
    const inc=$('eIncrement');
    if(!inc)return;
    const anchor=inc.closest('.two')||inc.closest('.field');
    const box=document.createElement('div');
    box.id='bookModeBox';box.className='bookModeBox featureHidden';
    box.innerHTML=`
      <div class="bookModeHead">
        <div class="bookModeCopy"><div class="bookModeTitle">Режим книги</div><div class="bookModeSub">Вместо фиксированной нормы приложение распределит оставшиеся страницы до выбранной даты.</div></div>
        <label class="bookCheck"><input id="bookModeEnabled" type="checkbox"> Читаю книгу</label>
      </div>
      <div id="bookFields" class="bookFields hidden">
        <div class="field"><label>Название книги</label><input id="bookTitle" placeholder="Например, Братья Карамазовы"></div>
        <div class="two">
          <div class="field"><label>Всего страниц</label><input id="bookTotal" type="number" inputmode="numeric" min="1" step="1" placeholder="640"></div>
          <div class="field"><label>Сейчас на странице</label><input id="bookCurrent" type="number" inputmode="numeric" min="0" step="1" placeholder="0"></div>
        </div>
        <div class="field"><label>Дочитать до</label><input id="bookDeadline" type="date"></div>
        <div class="bookCalc" id="bookCalc">Укажи объём и срок — дневная норма появится здесь.</div>
        <div class="bookModeHint">Если снять галочку, вернётся прежняя обычная норма — например 15 страниц в день.</div>
      </div>`;
    anchor.insertAdjacentElement('afterend',box);
    $('bookModeEnabled').addEventListener('change',()=>{
      $('bookFields').classList.toggle('hidden',!$('bookModeEnabled').checked);
      setManualFieldsDisabled($('bookModeEnabled').checked);
      updateBookCalc();
    });
    ['bookTotal','bookCurrent','bookDeadline'].forEach(id=>$(id).addEventListener('input',updateBookCalc));
    ['eName','eUnit','eTheme'].forEach(id=>$(id)?.addEventListener('input',refreshBookVisibility));
    $('eTheme')?.addEventListener('change',refreshBookVisibility);
  }

  function editorLooksReading(){
    const s=`${$('eName')?.value||''} ${$('eUnit')?.value||''}`;
    return currentEditId==='pages'||$('eTheme')?.value==='reading'||/чтен|книг|страниц|read|book/i.test(s);
  }
  function refreshBookVisibility(){
    ensureBookBox();
    const state=readState(),item=currentEditId?itemById(state,currentEditId):null;
    const show=!!item?.readingPlan||isReadingItem(item)||editorLooksReading();
    $('bookModeBox')?.classList.toggle('featureHidden',!show);
  }
  function setManualFieldsDisabled(on){
    ['eIncrement','ePeriod','eIntervalDays'].forEach(id=>{
      const el=$(id);if(!el)return;el.disabled=!!on;el.closest('.field')?.classList.toggle('bookModeDisabled',!!on);
    });
  }
  function updateBookCalc(){
    const calc=$('bookCalc');if(!calc||!$('bookModeEnabled')?.checked)return;
    const total=Math.max(0,Math.round(Number($('bookTotal').value)||0));
    const current=Math.max(0,Math.round(Number($('bookCurrent').value)||0));
    const deadline=$('bookDeadline').value;
    if(!total||!deadline){calc.textContent='Укажи объём и срок — дневная норма появится здесь.';return;}
    const remaining=Math.max(0,total-current),days=daysLeft(deadline);
    if(!remaining){calc.textContent='Книга уже дочитана.';return;}
    if(days<1){calc.textContent=`Срок уже прошёл · осталось ${remaining} стр.`;return;}
    calc.textContent=`${targetFor(remaining,deadline)} стр. в день · осталось ${remaining} стр. на ${days} ${pluralDays(days)}.`;
  }
  function fillBookEditor(id){
    ensureBookBox();currentEditId=id||null;
    const state=readState(),item=id?itemById(state,id):null,plan=item?.readingPlan||null;
    refreshBookVisibility();
    $('bookModeEnabled').checked=!!plan;
    $('bookFields').classList.toggle('hidden',!plan);
    $('bookTitle').value=plan?.title||item?.name||'';
    $('bookTotal').value=plan?.totalPages||'';
    $('bookCurrent').value=plan&&item?Math.max(0,(Number(plan.totalPages)||0)-(Number(item.debt)||0)):'';
    $('bookDeadline').value=plan?.deadline||'';
    setManualFieldsDisabled(!!plan);updateBookCalc();
  }

  function installEditorHook(){
    const original=window.openEditor;
    if(typeof original==='function'&&!original.__featuresWrapped){
      const wrapped=function(id=null){currentEditId=id||null;original(id);setTimeout(()=>fillBookEditor(id),0);};
      wrapped.__featuresWrapped=true;window.openEditor=wrapped;
    }
    const save=$('saveTask');if(!save||save.dataset.featuresHook)return;
    save.dataset.featuresHook='1';
    save.addEventListener('click',ev=>{
      ensureBookBox();
      const enabled=$('bookModeEnabled')?.checked&&(!$('bookModeBox')?.classList.contains('featureHidden'));
      const before=readState(),existing=currentEditId?itemById(before,currentEditId):null,oldPlan=existing?.readingPlan||null;
      if(enabled){
        const title=$('bookTitle').value.trim();
        const total=Math.max(0,Math.round(Number($('bookTotal').value)||0));
        const current=Math.max(0,Math.min(total,Math.round(Number($('bookCurrent').value)||0)));
        const deadline=$('bookDeadline').value;
        if(!title||!total||!deadline){ev.preventDefault();ev.stopImmediatePropagation();alert('Для режима книги укажи название, число страниц и срок.');return;}
        if(daysLeft(deadline)<1){ev.preventDefault();ev.stopImmediatePropagation();alert('Срок чтения должен быть сегодня или позже.');return;}
        const manual=oldPlan?.manual||{increment:Number(existing?.increment)||15,period:existing?.period||'daily',intervalDays:Number(existing?.intervalDays)||2,quick:Number(existing?.quick)||5,unit:existing?.unit||'страниц',name:existing?.name||'Чтение'};
        $('eIncrement').disabled=false;$('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;
        $('eIncrement').value=0;$('ePeriod').value='daily';$('eUnit').value='страниц';$('eDebt').value=Math.max(0,total-current);$('eTheme').value='reading';
        const idsBefore=new Set((before.items||[]).map(x=>x.id));
        sessionStorage.setItem(RETURN_TAB_KEY,'today');
        setTimeout(()=>{
          const after=readState();
          let item=currentEditId?itemById(after,currentEditId):null;
          if(!item)item=(after.items||[]).find(x=>!idsBefore.has(x.id));
          if(!item)return;
          item.readingPlan={title,totalPages:total,deadline,manual};
          item.name=title;item.unit='страниц';item.increment=0;item.period='daily';item.debt=Math.max(0,total-current);item.theme='reading';
          writeState(after);location.reload();
        },30);
      }else if(existing&&oldPlan){
        const m=oldPlan.manual||{increment:15,period:'daily',intervalDays:2,quick:5,unit:'страниц',name:'Чтение'};
        $('eIncrement').disabled=false;$('ePeriod').disabled=false;if($('eIntervalDays'))$('eIntervalDays').disabled=false;
        $('eIncrement').value=m.increment||15;$('ePeriod').value=m.period||'daily';$('eIntervalDays').value=m.intervalDays||2;$('eQuick').value=m.quick||5;$('eUnit').value=m.unit||'страниц';
        sessionStorage.setItem(RETURN_TAB_KEY,'today');
        setTimeout(()=>{
          const after=readState(),item=itemById(after,currentEditId);
          if(item){delete item.readingPlan;writeState(after);location.reload();}
        },30);
      }
    },true);
  }

  function decorateBookCards(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{
        const state=readState(),cards=[...document.querySelectorAll('#cards .task')];
        (state.items||[]).forEach((item,i)=>{
          const plan=item.readingPlan,card=cards[i];if(!plan||!card)return;
          const remaining=Math.max(0,Number(item.debt)||0),total=Math.max(1,Number(plan.totalPages)||1),read=Math.max(0,total-remaining),pct=Math.min(100,Math.round(read/total*100)),days=daysLeft(plan.deadline),target=targetFor(remaining,plan.deadline);
          const name=card.querySelector('.taskName'),rule=card.querySelector('.taskRule'),unit=card.querySelector('.debtUnit'),note=card.querySelector('.debtNote');
          if(name)name.textContent=plan.title;
          if(rule)rule.textContent=remaining===0?'Книга дочитана':`${target} стр/день · до ${fmtDate(plan.deadline)}`;
          if(unit)unit.textContent='страниц осталось';
          if(note)note.textContent=remaining===0?'Готово. Книга дочитана.':`Сегодня ориентир ${target} стр. · ${Math.max(1,days)} ${pluralDays(Math.max(1,days))} до срока`;
          if(!card.querySelector('.bookMark')){const mark=document.createElement('div');mark.className='bookMark';mark.textContent='Книга';name?.parentElement?.insertBefore(mark,name);}
          let p=card.querySelector('.bookProgress');
          if(!p){p=document.createElement('div');p.className='bookProgress';card.appendChild(p);}
          p.innerHTML=`<div class="bookProgressHead"><span>${read} из ${total} стр.</span><span>${pct}%</span></div><div class="bookProgressTrack"><div class="bookProgressFill" style="width:${pct}%"></div></div>`;
          const close=[...card.querySelectorAll('.button')].find(b=>b.textContent.trim()==='Закрыть'||b.dataset.bookClose==='1');if(close){close.dataset.bookClose='1';close.textContent='Дочитано';}
        });
      }finally{decorating=false;}
    });
  }

  function ensureNoteOverlay(){
    if($('noteFeatureOverlay'))return;
    const o=document.createElement('div');o.id='noteFeatureOverlay';o.className='featureOverlay';
    o.innerHTML=`<div class="featureSheet"><div class="featureGrabber"></div><div class="featureSheetHead"><div><div class="featureKicker" id="noteKicker"></div><div class="featureTitle" id="noteTitle"></div><div class="featureLead" id="noteLead"></div></div><button class="featureClose" data-feature-close="noteFeatureOverlay">✕</button></div><div class="featureField"><label id="noteSubjectLabel">Тема</label><input id="noteSubject"></div><div class="featureField"><label id="noteBodyLabel">Заметка</label><textarea id="noteBody"></textarea></div><div class="featureActions"><button class="button" data-feature-close="noteFeatureOverlay">Не сейчас</button><button class="button primary" id="noteSave">Сохранить заметку</button></div></div>`;
    document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show');});
    o.querySelectorAll('[data-feature-close]').forEach(b=>b.addEventListener('click',()=>o.classList.remove('show')));
    $('noteSave').addEventListener('click',saveNote);
  }
  function openNote(entryId){
    ensureNoteOverlay();const state=readState(),entry=(state.history||[]).find(h=>h.id===entryId);if(!entry)return;
    noteEntryId=entryId;const kind=historyKind(entry,state),item=itemById(state,entry.itemId),book=item?.readingPlan;
    if(kind==='meditation'){
      $('noteKicker').textContent='После медитации';$('noteTitle').textContent='Хотите сделать заметку?';$('noteLead').textContent='Можно сохранить тему медитации и несколько мыслей или наблюдений.';$('noteSubjectLabel').textContent='Тема медитации';$('noteBodyLabel').textContent='Содержание / наблюдения';
    }else{
      $('noteKicker').textContent=book?'Чтение книги':'После чтения';$('noteTitle').textContent='Хотите сделать заметку?';$('noteLead').textContent=`Прочитано ${entry.amount||0} ${entry.unit||'страниц'}${book?` · ${book.title}`:''}. Сохрани мысль, цитату или короткий итог.`;$('noteSubjectLabel').textContent=book?'Тема / глава':'Тема заметки';$('noteBodyLabel').textContent='Что хочется сохранить';
    }
    $('noteSubject').value=entry.note?.title||'';$('noteBody').value=entry.note?.body||'';$('noteFeatureOverlay').classList.add('show');setTimeout(()=>$('noteSubject').focus(),160);
  }
  function saveNote(){
    const state=readState(),entry=(state.history||[]).find(h=>h.id===noteEntryId);if(!entry)return;
    const kind=historyKind(entry,state),title=$('noteSubject').value.trim(),body=$('noteBody').value.trim();
    if(!title&&!body){toast('Заметка пустая');return;}
    entry.note={kind,title,body,createdAt:new Date().toISOString()};writeState(state);sessionStorage.setItem(RETURN_TAB_KEY,'history');location.reload();
  }
  function decorateHistory(){
    const panel=$('historyPanel');if(!panel)return;
    const state=readState(),rows=[...panel.querySelectorAll('.historyItem')],entries=(state.history||[]).slice(0,80);
    rows.forEach((row,i)=>{
      row.querySelectorAll('.featureHistoryExtra').forEach(x=>x.remove());
      const h=entries[i];if(!h)return;const kind=historyKind(h,state);if(!kind)return;
      if(h.note){
        const n=document.createElement('div');n.className='historyNote featureHistoryExtra';n.innerHTML=`<div class="historyNoteTag">${kind==='meditation'?'медитация':'заметка о чтении'}</div>${h.note.title?`<div class="historyNoteTitle">${esc(h.note.title)}</div>`:''}${h.note.body?`<div class="historyNoteBody">${esc(h.note.body)}</div>`:''}`;row.appendChild(n);
      }else{
        const b=document.createElement('button');b.className='historyNoteButton featureHistoryExtra';b.textContent='+ добавить заметку';b.addEventListener('click',()=>openNote(h.id));row.appendChild(b);
      }
    });
  }
  function installActionNoteHook(){
    document.addEventListener('click',e=>{
      const target=e.target.closest?.('button');if(!target)return;
      const before=readState(),beforeId=before.history?.[0]?.id||null;
      const isAmount=target.id==='amountSave',isTaskAction=target.classList.contains('button')&&target.closest('.task');
      if(!isAmount&&!isTaskAction)return;
      const label=target.textContent.trim();
      setTimeout(()=>{
        const after=readState(),h=after.history?.[0];if(!h||h.id===beforeId)return;
        const kind=historyKind(h,after),item=itemById(after,h.itemId);if(!kind)return;
        const shouldAsk=kind==='meditation'||(kind==='reading'&&(isAmount||h.type==='close'||label==='Закрыть'||label==='Дочитано'||(item?.readingPlan&&Number(item.debt)===0)));
        if(shouldAsk&&!h.note)setTimeout(()=>openNote(h.id),180);
      },80);
    },true);
  }

  function ensureGuide(){
    if($('guideFeatureOverlay'))return;
    const o=document.createElement('div');o.id='guideFeatureOverlay';o.className='featureOverlay';o.innerHTML=`<div class="featureSheet"><div class="featureGrabber"></div><div class="featureSheetHead"><div><div class="featureKicker">Короткая инструкция</div><div class="featureTitle">Как устроено «Правило»</div><div class="featureLead">Главная идея проста: норма начисляется, выполненное списывается, остаток не теряется.</div></div><button class="featureClose" data-feature-close="guideFeatureOverlay">✕</button></div><div class="guideCards"><div class="guideCard"><div class="guideNum">一</div><div class="guideTitle">Обычная норма</div><div class="guideText">Задай, сколько начислять и как часто. Например: 200 молитв ежедневно или 15 страниц в день.</div></div><div class="guideCard"><div class="guideNum">二</div><div class="guideTitle">Режим книги</div><div class="guideText">В норме чтения поставь галочку «Читаю книгу», укажи название, объём, текущую страницу и срок. Дневной ориентир будет пересчитываться автоматически.</div></div><div class="guideCard"><div class="guideNum">三</div><div class="guideTitle">Списывание и долг</div><div class="guideText">«Списать» — вводишь фактически сделанное. Быстрая кнопка снимает маленький объём. «Закрыть» списывает весь текущий остаток.</div></div><div class="guideCard"><div class="guideNum">四</div><div class="guideTitle">Заметки</div><div class="guideText">После чтения и медитации приложение предложит сохранить заметку. Её можно добавить и позже прямо из «Истории».</div></div><div class="guideCard"><div class="guideNum">五</div><div class="guideTitle">Обновления</div><div class="guideText">Когда опубликована новая версия, появится полоска «Есть обновление». Нажми «Обновить» — приложение перезагрузится с новой версией.</div></div><div class="guideCard"><div class="guideNum">六</div><div class="guideTitle">Резервная копия</div><div class="guideText">В настройках есть экспорт и импорт. Книжные планы и заметки сохраняются вместе с остальными данными.</div></div></div><div class="guideMini"><strong>Виджет iPhone.</strong> Для настоящего системного виджета нужна нативная сборка через Xcode. Исходники уже лежат в папке <code>ios/</code>; веб-версия из Safari сама WidgetKit установить не может.</div><div class="featureActions"><button class="button" id="guideWelcome">Показать приветствие</button><button class="button primary" data-feature-close="guideFeatureOverlay">Понятно</button></div></div>`;document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show');});o.querySelectorAll('[data-feature-close]').forEach(b=>b.addEventListener('click',()=>o.classList.remove('show')));$('guideWelcome').addEventListener('click',()=>{o.classList.remove('show');window.showPraviloOnboarding?.(true);});
  }
  function injectSettingsHelp(){
    const sheet=$('settingsOverlay')?.querySelector('.sheet');if(!sheet||$('featureSettingsRow'))return;
    const destructive=$('clearHistory')?.closest('.sheetActions');
    const row=document.createElement('div');row.id='featureSettingsRow';row.className='featureSettingsRow';row.innerHTML=`<button class="button" id="openGuideBtn">Как пользоваться</button><button class="button" id="showWelcomeBtn">Приветствие</button><button class="button" id="checkUpdateBtn">Проверить обновление</button><button class="button" id="openWelcomePageBtn">Открыть приветствие отдельно</button>`;
    (destructive||sheet).insertAdjacentElement(destructive?'beforebegin':'beforeend',row);
    $('openGuideBtn').addEventListener('click',()=>{ensureGuide();$('guideFeatureOverlay').classList.add('show');});
    $('showWelcomeBtn').addEventListener('click',()=>window.showPraviloOnboarding?.(true));
    $('checkUpdateBtn').addEventListener('click',()=>checkForUpdate(true));
    $('openWelcomePageBtn').addEventListener('click',()=>window.open('welcome-preview.html','_blank'));
  }

  function ensureUpdateBanner(){
    if($('updateBanner'))return;
    const b=document.createElement('div');b.id='updateBanner';b.className='updateBanner';b.innerHTML=`<div><div class="updateKicker">Новая версия</div><div class="updateTitle">Есть обновление «Правила»</div></div><button class="updateButton" id="updateNowBtn">Обновить</button>`;
    const tabs=document.querySelector('.tabs');tabs?.insertAdjacentElement('afterend',b);$('updateNowBtn').addEventListener('click',applyUpdate);
  }
  async function remoteBuild(){
    try{const r=await fetch(`sw.js?check=${Date.now()}`,{cache:'no-store'});const t=await r.text();return t.match(/const CACHE=['"]([^'"]+)['"]/)?.[1]||null;}catch(e){return null;}
  }
  async function checkForUpdate(manual=false){
    ensureUpdateBanner();const build=await remoteBuild();if(!build){if(manual)toast('Не удалось проверить обновление');return;}
    latestRemoteBuild=build;const seen=localStorage.getItem(SEEN_BUILD_KEY);
    if(!seen){localStorage.setItem(SEEN_BUILD_KEY,build);if(manual)toast('Установлена актуальная версия');return;}
    if(build!==seen){$('updateBanner').classList.add('show');if(manual)toast('Найдена новая версия');}
    else{$('updateBanner').classList.remove('show');if(manual)toast('Обновлений нет');}
  }
  async function applyUpdate(){
    const b=$('updateNowBtn');if(b){b.disabled=true;b.textContent='Обновляю…';}
    if(latestRemoteBuild)localStorage.setItem(SEEN_BUILD_KEY,latestRemoteBuild);
    try{const reg=await navigator.serviceWorker?.getRegistration();await reg?.update();if(reg?.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});}catch(e){}
    setTimeout(()=>location.reload(),650);
  }

  function restoreTab(){
    const tab=sessionStorage.getItem(RETURN_TAB_KEY);if(!tab)return;sessionStorage.removeItem(RETURN_TAB_KEY);setTimeout(()=>document.querySelector(`.tab[data-tab="${tab}"]`)?.click(),80);
  }

  function init(){
    ensureBookBox();installEditorHook();decorateBookCards();ensureNoteOverlay();ensureGuide();injectSettingsHelp();ensureUpdateBanner();installActionNoteHook();decorateHistory();restoreTab();checkForUpdate(false);
    const cards=$('cards');if(cards)new MutationObserver(decorateBookCards).observe(cards,{childList:true});
    const hist=$('historyPanel');if(hist)new MutationObserver(decorateHistory).observe(hist,{childList:true});
    document.addEventListener('click',e=>{
      const edit=e.target.closest?.('.editButton');if(edit){const m=(edit.getAttribute('onclick')||'').match(/openEditor\('([^']+)'\)/);if(m){currentEditId=m[1];setTimeout(()=>fillBookEditor(currentEditId),0);}}
      if(e.target.closest?.('#addBtn')){currentEditId=null;setTimeout(()=>fillBookEditor(null),0);}
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
