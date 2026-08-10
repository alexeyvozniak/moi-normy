(()=>{
  'use strict';
  const KEY='pravilo_reminders_v1';
  const $=id=>document.getElementById(id);
  let reminders=[];
  let editingId=null;
  let timer=null;
  const dayNames=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

  function uid(){return 'r'+Math.random().toString(36).slice(2)+Date.now().toString(36)}
  function load(){try{reminders=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(reminders))reminders=[];}catch(e){reminders=[]}}
  function save(){localStorage.setItem(KEY,JSON.stringify(reminders));renderList();schedule();}
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function activeDaysText(r){const d=(r.days||[]).slice().sort();if(d.length===7)return 'каждый день';return d.map(x=>dayNames[x]).join(', ')||'без дней'}
  function findItem(id){try{return (state.items||[]).find(x=>x.id===id)}catch(e){return null}}
  function defaultMessage(item){
    const s=(item?.name||'').toLowerCase();
    if(/иисус|молит/.test(s))return 'Время для молитвы.';
    if(/чтен|страниц|книг/.test(s))return 'Несколько страниц в спокойном ритме.';
    if(/медит|тишин|созерц/.test(s))return 'Время для тишины.';
    return item?.name?`Время: ${item.name}`:'Время для правила.';
  }
  function ensureUI(){
    if($('remindersPanel'))return;
    const settings=$('settingsOverlay')?.querySelector('.sheet');if(!settings)return;
    const panel=document.createElement('div');panel.id='remindersPanel';panel.className='remindersPanel';
    panel.innerHTML='<div class="remindersHead"><div><div class="remindersTitle">Напоминания</div><div class="remindersText">Спокойные напоминания о выбранных делах. Время и текст хранятся только на этом устройстве.</div></div><button class="remindersOpen" id="openReminders">Настроить</button></div>';
    settings.appendChild(panel);

    const overlay=document.createElement('div');overlay.id='remindersOverlay';overlay.className='overlay';
    overlay.innerHTML=`<div class="sheet reminderSheet"><div class="sheetHead"><div><div class="sheetKicker">Правило</div><div class="sheetTitle">Напоминания</div></div><button class="sheetClose" data-close-reminders>×</button></div><div id="reminderPermission"></div><div id="reminderList" class="reminderList"></div><button class="button primary reminderAdd" id="addReminder">＋ Добавить напоминание</button><div class="reminderCalendar">Системные уведомления срабатывают надёжно, пока приложение открыто или недавно активно. Для гарантированного сигнала при полностью закрытом приложении можно добавить событие в календарь.</div></div>`;
    document.body.appendChild(overlay);

    const edit=document.createElement('div');edit.id='reminderEditOverlay';edit.className='overlay';
    edit.innerHTML=`<div class="sheet reminderSheet"><div class="sheetHead"><div><div class="sheetKicker">Напоминание</div><div class="sheetTitle" id="reminderEditTitle">Новое</div></div><button class="sheetClose" data-close-reminder-edit>×</button></div><div class="reminderForm"><label>Дело<select id="reminderItem"></select></label><label>Время<input id="reminderTime" type="time" value="20:00"></label><label>Дни<div id="reminderDays" class="reminderDays"></div></label><label>Текст<textarea id="reminderMessage" maxlength="120"></textarea></label></div><div class="reminderFooter"><button class="button" id="reminderTest">Проверить</button><button class="button primary" id="reminderSave">Сохранить</button><button class="button wide hidden" id="reminderDelete">Удалить</button></div></div>`;
    document.body.appendChild(edit);

    $('openReminders').onclick=()=>{renderPermission();renderList();$('remindersOverlay').classList.add('show')};
    overlay.querySelector('[data-close-reminders]').onclick=()=>overlay.classList.remove('show');
    edit.querySelector('[data-close-reminder-edit]').onclick=()=>edit.classList.remove('show');
    $('addReminder').onclick=()=>openEditor();
    $('reminderSave').onclick=saveEditor;
    $('reminderDelete').onclick=deleteEditor;
    $('reminderTest').onclick=()=>showNotification('Правило',$('reminderMessage').value.trim()||'Время для правила.');
    $('reminderItem').onchange=()=>{const item=findItem($('reminderItem').value);if(item)$('reminderMessage').value=defaultMessage(item)};
    renderPermission();renderList();
  }
  function renderPermission(){
    const el=$('reminderPermission');if(!el)return;
    if(!('Notification'in window)){el.innerHTML='<div class="reminderPermission">Системные уведомления не поддерживаются этим браузером. Можно использовать экспорт в календарь.</div>';return;}
    if(Notification.permission==='granted'){el.innerHTML='<div class="reminderPermission">Системные уведомления разрешены.</div>';return;}
    if(Notification.permission==='denied'){el.innerHTML='<div class="reminderPermission">Уведомления запрещены в настройках браузера/системы.</div>';return;}
    el.innerHTML='<div class="reminderPermission">Чтобы показывать уведомления, нужно один раз разрешить их.<br><button class="button" id="allowNotifications">Разрешить уведомления</button></div>';
    $('allowNotifications').onclick=async()=>{try{await Notification.requestPermission()}catch(e){}renderPermission()};
  }
  function renderList(){
    const el=$('reminderList');if(!el)return;
    if(!reminders.length){el.innerHTML='<div class="reminderEmpty">Пока нет напоминаний. Можно, например, поставить молитву утром и чтение вечером.</div>';return;}
    el.innerHTML=reminders.map(r=>{const item=findItem(r.itemId);return `<div class="reminderItem ${r.enabled===false?'off':''}"><div class="reminderTop"><div class="reminderName">${esc(item?.name||'Правило')}</div><div class="reminderTime">${esc(r.time)}</div></div><div class="reminderMeta">${activeDaysText(r)} · ${r.enabled===false?'выключено':'включено'}</div><div class="reminderMessage">${esc(r.message||'')}</div><div class="reminderActions"><button class="reminderMini primary" data-rem-edit="${r.id}">Изменить</button><button class="reminderMini" data-rem-toggle="${r.id}">${r.enabled===false?'Включить':'Выключить'}</button><button class="reminderMini" data-rem-cal="${r.id}">В календарь</button></div></div>`}).join('');
    el.querySelectorAll('[data-rem-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.remEdit));
    el.querySelectorAll('[data-rem-toggle]').forEach(b=>b.onclick=()=>{const r=reminders.find(x=>x.id===b.dataset.remToggle);if(r){r.enabled=r.enabled===false?true:false;save()}});
    el.querySelectorAll('[data-rem-cal]').forEach(b=>b.onclick=()=>downloadIcs(reminders.find(x=>x.id===b.dataset.remCal)));
  }
  function openEditor(id=null){
    editingId=id;const r=id?reminders.find(x=>x.id===id):null;
    $('reminderEditTitle').textContent=r?'Изменить':'Новое';
    $('reminderItem').innerHTML=(state.items||[]).map(i=>`<option value="${esc(i.id)}">${esc(i.name)}</option>`).join('');
    const itemId=r?.itemId||(state.items||[])[0]?.id||'';$('reminderItem').value=itemId;
    $('reminderTime').value=r?.time||'20:00';
    $('reminderMessage').value=r?.message||defaultMessage(findItem(itemId));
    const days=r?.days||[1,2,3,4,5,6,0];
    $('reminderDays').innerHTML=dayNames.map((n,i)=>`<button type="button" class="reminderDay ${days.includes(i)?'on':''}" data-day="${i}">${n}</button>`).join('');
    $('reminderDays').querySelectorAll('.reminderDay').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
    $('reminderDelete').classList.toggle('hidden',!r);
    $('reminderEditOverlay').classList.add('show');
  }
  function saveEditor(){
    const days=[...$('reminderDays').querySelectorAll('.reminderDay.on')].map(b=>Number(b.dataset.day));
    if(!days.length){alert('Выбери хотя бы один день.');return;}
    const data={itemId:$('reminderItem').value,time:$('reminderTime').value||'20:00',days,message:$('reminderMessage').value.trim()||'Время для правила.',enabled:true,lastFired:''};
    if(editingId){const r=reminders.find(x=>x.id===editingId);Object.assign(r,data)}else reminders.push({id:uid(),...data});
    save();$('reminderEditOverlay').classList.remove('show');
  }
  function deleteEditor(){if(!editingId)return;if(confirm('Удалить это напоминание?')){reminders=reminders.filter(x=>x.id!==editingId);save();$('reminderEditOverlay').classList.remove('show')}}
  async function showNotification(title,body){
    if(!('Notification'in window))return;
    if(Notification.permission!=='granted'){try{await Notification.requestPermission()}catch(e){return}}
    if(Notification.permission!=='granted')return;
    try{
      const reg=await navigator.serviceWorker?.ready;
      if(reg?.showNotification)await reg.showNotification(title,{body,icon:'icon-192.png',badge:'icon-192.png',tag:'pravilo-reminder',renotify:false});
      else new Notification(title,{body,icon:'icon-192.png'});
    }catch(e){try{new Notification(title,{body})}catch(_){} }
  }
  function localKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function check(){
    const now=new Date();const hm=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;const day=now.getDay();const key=localKey(now)+'@'+hm;
    reminders.forEach(r=>{if(r.enabled===false||!r.days?.includes(day)||r.time!==hm||r.lastFired===key)return;const item=findItem(r.itemId);r.lastFired=key;showNotification(item?.name||'Правило',r.message||defaultMessage(item));});
    localStorage.setItem(KEY,JSON.stringify(reminders));
  }
  function schedule(){clearInterval(timer);check();timer=setInterval(check,30000)}
  function pad(n){return String(n).padStart(2,'0')}
  function icsEscape(s){return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
  function nextDateFor(r){const [h,m]=(r.time||'20:00').split(':').map(Number);const d=new Date();d.setSeconds(0,0);for(let k=0;k<8;k++){const x=new Date(d);x.setDate(d.getDate()+k);x.setHours(h,m,0,0);if(r.days.includes(x.getDay())&&x>d)return x}return d}
  function downloadIcs(r){
    if(!r)return;const item=findItem(r.itemId);const d=nextDateFor(r);const end=new Date(d.getTime()+15*60000);const stamp=x=>`${x.getFullYear()}${pad(x.getMonth()+1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
    const byday=(r.days||[]).map(x=>['SU','MO','TU','WE','TH','FR','SA'][x]).join(',');
    const text=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Pravilo//Reminder//RU\r\nBEGIN:VEVENT\r\nUID:${r.id}@pravilo\r\nDTSTART:${stamp(d)}\r\nDTEND:${stamp(end)}\r\nRRULE:FREQ=WEEKLY;BYDAY=${byday}\r\nSUMMARY:${icsEscape(item?.name||'Правило')}\r\nDESCRIPTION:${icsEscape(r.message)}\r\nBEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:${icsEscape(r.message)}\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const blob=new Blob([text],{type:'text/calendar;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pravilo-${r.id}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  load();
  function init(){ensureUI();schedule();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});window.addEventListener('focus',check)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
