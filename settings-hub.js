(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const REM_KEY='pravilo_reminders_v1';

  function reminderCount(){
    try{return (JSON.parse(localStorage.getItem(REM_KEY)||'[]')||[]).filter(x=>x.enabled!==false).length}catch(e){return 0}
  }
  function closeOverlay(id){$(id)?.classList.remove('show')}
  function openOverlay(id){$(id)?.classList.add('show')}

  function makeSection(id,title,lead){
    if($(id))return $(id);
    const o=document.createElement('div');o.id=id;o.className='overlay settingsSectionOverlay';
    o.innerHTML=`<div class="sheet settingsSectionSheet"><div class="grabber"></div><div class="sheetHeader"><div class="sheetTitle">${title}</div><button class="settingsBack" data-settings-back>Назад</button></div><div class="settingsSectionLead">${lead}</div><div class="settingsSectionBody"></div></div>`;
    document.body.appendChild(o);
    o.querySelector('[data-settings-back]').addEventListener('click',()=>closeOverlay(id));
    o.addEventListener('click',e=>{if(e.target===o)closeOverlay(id)});
    return o;
  }

  function moveUnique(body,node){if(node&&node.parentElement!==body)body.appendChild(node)}

  function buildDataSection(){
    const o=makeSection('settingsDataOverlay','Данные','Локальное хранение, резервные копии и экспорт.');
    const body=o.querySelector('.settingsSectionBody');body.classList.add('settingsDataBody');
    const settings=$('settingsOverlay')?.querySelector('.sheet');
    if(!settings)return;

    const dataPanel=[...settings.children].find(x=>x.classList?.contains('panel')&&x.querySelector?.('#exportBtn')===null) || settings.querySelector('.panel');
    const exportRow=$('exportBtn')?.closest('.sheetActions');
    const importFile=$('importFile');
    const notes=$('notesExportPanel');
    const offline=$('offlineStoragePanel');
    const destructive=$('clearHistory')?.closest('.sheetActions');

    moveUnique(body,dataPanel);
    moveUnique(body,exportRow);
    moveUnique(body,importFile);
    moveUnique(body,notes);
    moveUnique(body,offline);

    if(destructive){
      let danger=$('settingsDanger');
      if(!danger){
        danger=document.createElement('details');danger.id='settingsDanger';danger.className='settingsDanger';
        danger.innerHTML='<summary>Опасные действия</summary>';
        body.appendChild(danger);
      }
      moveUnique(danger,destructive);
    }
    return o;
  }

  function buildAppSection(){
    const o=makeSection('settingsAppOverlay','Приложение','Помощь, обновления и установка на телефон.');
    const body=o.querySelector('.settingsSectionBody');body.classList.add('settingsAppBody');
    const feature=$('featureSettingsRow');
    if(feature)moveUnique(body,feature);
    return o;
  }

  function statusText(){
    const count=reminderCount();
    const rem=$('settingsHubReminderSub');if(rem)rem.textContent=count?`${count} ${count===1?'активное':'активных'}`:'не настроены';
    const data=$('settingsHubDataSub');if(data)data.textContent='копия · экспорт · офлайн';
    const app=$('settingsHubAppSub');if(app)app.textContent='помощь · обновления · установка';
  }

  function buildHub(){
    const sheet=$('settingsOverlay')?.querySelector('.sheet');if(!sheet||$('settingsHub'))return;
    buildDataSection();buildAppSection();
    $('remindersPanel')?.classList.add('settingsHubSource');

    const hub=document.createElement('div');hub.id='settingsHub';hub.className='settingsHub';
    hub.innerHTML=`
      <button class="settingsHubRow" id="settingsHubReminders"><span class="settingsHubIcon">◷</span><span><span class="settingsHubTitle">Напоминания</span><span class="settingsHubSub" id="settingsHubReminderSub"></span></span><span class="settingsHubArrow">›</span></button>
      <button class="settingsHubRow" id="settingsHubData"><span class="settingsHubIcon">文</span><span><span class="settingsHubTitle">Данные</span><span class="settingsHubSub" id="settingsHubDataSub"></span></span><span class="settingsHubArrow">›</span></button>
      <button class="settingsHubRow" id="settingsHubApp"><span class="settingsHubIcon">◌</span><span><span class="settingsHubTitle">Приложение</span><span class="settingsHubSub" id="settingsHubAppSub"></span></span><span class="settingsHubArrow">›</span></button>`;

    const header=sheet.querySelector('.sheetHeader');
    header?.insertAdjacentElement('afterend',hub);

    // Everything still left below the hub is implementation scaffolding; keep it hidden rather than deleting it.
    [...sheet.children].forEach(n=>{
      if(n===hub||n.classList.contains('grabber')||n.classList.contains('sheetHeader'))return;
      n.classList.add('settingsHubSource');
    });

    $('settingsHubReminders').addEventListener('click',()=>{
      const open=$('openReminders');
      if(open)open.click();else openOverlay('remindersOverlay');
      statusText();
    });
    $('settingsHubData').addEventListener('click',()=>openOverlay('settingsDataOverlay'));
    $('settingsHubApp').addEventListener('click',()=>{buildAppSection();openOverlay('settingsAppOverlay')});
    statusText();
  }

  function reconcile(){
    if(!$('settingsHub'))buildHub();
    else{
      buildDataSection();buildAppSection();$('remindersPanel')?.classList.add('settingsHubSource');statusText();
    }
  }

  function init(){
    // Other feature scripts add their settings controls at startup; one delayed reconciliation keeps their handlers intact.
    reconcile();setTimeout(reconcile,180);setTimeout(reconcile,900);
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#settingsBtn'))setTimeout(()=>{reconcile();statusText()},0);
      if(e.target.closest?.('#reminderSave')||e.target.closest?.('[data-rem-toggle]')||e.target.closest?.('#reminderDelete'))setTimeout(statusText,80);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
