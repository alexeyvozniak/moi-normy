(()=>{
  'use strict';

  const LEGACY_REMINDERS_KEY='pravilo_reminders_v1';
  const APP_AUTHOR='Алексей Возняк';
  const $=id=>document.getElementById(id);

  function appVersion(){return window.PraviloManifest?.version||'1.0.2';}
  function openOverlay(id){$(id)?.classList.add('show');}
  function closeOverlay(id){$(id)?.classList.remove('show');}
  function click(id){$(id)?.click();}

  function reminderCount(){
    if(Array.isArray(window.state?.reminders))return state.reminders.filter(r=>r.enabled!==false).length;
    try{
      const legacy=JSON.parse(localStorage.getItem(LEGACY_REMINDERS_KEY)||'[]');
      return Array.isArray(legacy)?legacy.filter(r=>r.enabled!==false).length:0;
    }catch(_){return 0;}
  }

  function createSection(id,title,lead,bodyHtml){
    if($(id))return $(id);
    const overlay=document.createElement('div');
    overlay.id=id;
    overlay.className='overlay settingsSectionOverlay';
    overlay.innerHTML=`<div class="sheet settingsSectionSheet"><div class="grabber"></div><div class="sheetHeader"><div class="sheetTitle">${title}</div><button class="settingsBack" type="button" data-settings-back>Назад</button></div><div class="settingsSectionLead">${lead}</div><div class="settingsSectionBody">${bodyHtml}</div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('[data-settings-back]').addEventListener('click',()=>closeOverlay(id));
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeOverlay(id);});
    return overlay;
  }

  function buildDataSection(){
    const overlay=createSection('settingsDataOverlay','Данные','Резервные копии, экспорт и локальное хранение.',`
      <div class="settingsCard"><strong>Данные хранятся на этом устройстве</strong><div class="settingsCardText">Экспорт JSON — внешняя резервная копия. Локальная копия IndexedDB помогает при работе офлайн.</div></div>
      <div class="settingsActionGrid"><button class="button" type="button" id="settingsExportData">Экспорт данных</button><button class="button" type="button" id="settingsImportData">Импорт данных</button><button class="button" type="button" id="settingsExportNotes">Выгрузить заметки</button><button class="button" type="button" id="settingsRefreshOffline">Обновить локальную копию</button></div>
      <div class="settingsStatus" id="settingsOfflineStatus">Проверяю локальное хранение…</div>
      <details class="settingsDanger"><summary>Опасные действия</summary><div class="settingsDangerBody"><button class="button danger" type="button" id="settingsClearHistory">Очистить историю</button><button class="button danger" type="button" id="settingsResetAll">Сбросить всё</button></div></details>`);

    $('settingsExportData').addEventListener('click',()=>click('exportBtn'));
    $('settingsImportData').addEventListener('click',()=>click('importBtn'));
    $('settingsExportNotes').addEventListener('click',()=>window.praviloExportNotes?.()||click('exportNotesBtn'));
    $('settingsRefreshOffline').addEventListener('click',async()=>{
      if(window.praviloRefreshOfflineBackup)await window.praviloRefreshOfflineBackup();
      else click('refreshOfflineBackup');
      await refreshOfflineStatus();
    });
    $('settingsClearHistory').addEventListener('click',()=>click('clearHistory'));
    $('settingsResetAll').addEventListener('click',()=>click('resetAll'));
    return overlay;
  }

  function buildSoundSection(){
    const overlay=createSection('settingsSoundOverlay','Звуки','Тихие сигналы практики. Всё можно проверить здесь, не запуская счётчик.',`
      <div class="settingsCard settingsAudioCard" id="settingsAudioCard">
        <div class="settingsAudioHead"><div><strong>Звуки практики</strong><div class="settingsCardText">Десятки и сотни молитв, переход и завершение медитации.</div></div><button class="switch" type="button" id="settingsAudioToggle" aria-label="Звуки практики" aria-pressed="true"></button></div>
        <div class="settingsAudioVolumeBlock"><div class="settingsAudioVolumeHead"><span>Громкость</span><b id="settingsAudioVolumeValue">100%</b></div><input type="range" id="settingsAudioVolume" min="15" max="100" step="5" value="100" aria-label="Громкость звуков практики"></div>
      </div>
      <div class="settingsSoundPreview" aria-label="Проверка звуков">
        <button class="settingsSoundRow" type="button" data-audio-preview="prayerTen"><span class="settingsSoundMark">十</span><span><strong>10 молитв</strong><small>короткий сигнал</small></span><span class="settingsSoundPlay">▶</span></button>
        <button class="settingsSoundRow" type="button" data-audio-preview="prayerHundred"><span class="settingsSoundMark">百</span><span><strong>100 молитв</strong><small>глубже и короче</small></span><span class="settingsSoundPlay">▶</span></button>
        <button class="settingsSoundRow" type="button" data-audio-preview="meditationBell"><span class="settingsSoundMark">◯</span><span><strong>Медитация</strong><small>переход между частями</small></span><span class="settingsSoundPlay">▶</span></button>
      </div>
      <div class="settingsSoundHint">На iPhone звук разрешается первым касанием внутри приложения. В беззвучном режиме поведение зависит от системных настроек iOS.</div>`);

    $('settingsAudioToggle').addEventListener('click',()=>{
      const audio=window.PraviloAudio;if(!audio)return;
      const current=audio.getSettings();
      audio.setSettings({enabled:!current.enabled});
      syncAudioSettings();
    });
    $('settingsAudioVolume').addEventListener('input',event=>{
      const audio=window.PraviloAudio;if(!audio)return;
      audio.setSettings({volume:Number(event.target.value)/100});
      syncAudioSettings();
    });
    overlay.querySelectorAll('[data-audio-preview]').forEach(button=>button.addEventListener('click',()=>{
      void window.PraviloAudio?.play(button.dataset.audioPreview,{preview:true,direct:true});
    }));
    syncAudioSettings();
    return overlay;
  }

  function menuRow(id,glyph,title,sub){
    return `<button class="settingsMenuRow" id="${id}" type="button"><span class="settingsMenuGlyph">${glyph}</span><span><strong>${title}</strong><small>${sub}</small></span><span class="settingsMenuArrow">›</span></button>`;
  }

  function buildAppSection(){
    const version=appVersion();
    const overlay=createSection('settingsAppOverlay','Приложение','Помощь, звук, установка и сведения о «Правиле».',`
      <div class="settingsMenu">
        ${menuRow('settingsOpenSound','♪','Звуки практики','сигналы молитвы и медитации')}
        ${menuRow('settingsOpenGuide','文','Как пользоваться','короткая инструкция')}
        ${menuRow('settingsCheckUpdate','↻','Проверить обновление','текущая версия '+version)}
        ${menuRow('settingsInstallHelp','⌂','Установка на телефон','добавить на экран «Домой»')}
      </div>
      <div class="settingsCard settingsAboutCard"><div class="settingsAboutTop"><div class="settingsAboutName">Правило</div><div class="settingsAboutVersion">версия ${version}</div></div><div class="settingsAboutAuthor">Автор — ${APP_AUTHOR} · 2026</div><div class="settingsCardText">Личное локальное PWA для молитвы, чтения, медитации и собственного ритма. Основные данные остаются на устройстве; интернет нужен только для обновления приложения.</div></div>`);

    $('settingsOpenSound').addEventListener('click',()=>{syncAudioSettings();openOverlay('settingsSoundOverlay');});
    $('settingsOpenGuide').addEventListener('click',()=>window.praviloOpenGuide?.()||click('openGuideBtn'));
    $('settingsCheckUpdate').addEventListener('click',()=>window.praviloCheckUpdate?.()||click('checkUpdateBtn'));
    $('settingsInstallHelp').addEventListener('click',()=>window.praviloOpenInstallHelp?.()||click('installSettingsBtn'));
    return overlay;
  }

  function syncAudioSettings(){
    const audio=window.PraviloAudio;
    const toggle=$('settingsAudioToggle'),range=$('settingsAudioVolume'),value=$('settingsAudioVolumeValue'),card=$('settingsAudioCard'),sub=$('settingsSoundSub');
    if(!audio)return;
    const settings=audio.getSettings(),percent=Math.round(settings.volume*100);
    if(toggle){toggle.classList.toggle('on',settings.enabled);toggle.setAttribute('aria-pressed',settings.enabled?'true':'false');}
    if(range)range.value=String(percent);
    if(value)value.textContent=`${percent}%`;
    card?.classList.toggle('audioMuted',!settings.enabled);
    if(sub)sub.textContent=settings.enabled?`включены · ${percent}%`:'выключены';
  }

  function hideLegacySettingsContent(sheet,hub){
    [...sheet.children].forEach(node=>{
      if(node===hub||node.classList.contains('grabber')||node.classList.contains('sheetHeader'))return;
      node.classList.add('settingsHubSource');
    });
  }

  function buildHub(){
    const sheet=$('settingsOverlay')?.querySelector('.sheet');
    if(!sheet||$('settingsHub'))return;

    buildDataSection();
    buildSoundSection();
    buildAppSection();

    const hub=document.createElement('div');
    hub.id='settingsHub';hub.className='settingsHub';
    hub.innerHTML=`
      <button class="settingsHubRow" id="settingsHubReminders" type="button"><span class="settingsHubIcon"><img src="images/settings-reminders.webp" alt=""></span><span><span class="settingsHubTitle">Напоминания</span><span class="settingsHubSub" id="settingsHubReminderSub"></span></span><span class="settingsHubArrow">›</span></button>
      <button class="settingsHubRow" id="settingsHubData" type="button"><span class="settingsHubIcon"><img src="images/settings-data.webp" alt=""></span><span><span class="settingsHubTitle">Данные</span><span class="settingsHubSub">копия · экспорт · офлайн</span></span><span class="settingsHubArrow">›</span></button>
      <button class="settingsHubRow" id="settingsHubApp" type="button"><span class="settingsHubIcon"><img src="images/settings-app.webp" alt=""></span><span><span class="settingsHubTitle">Приложение</span><span class="settingsHubSub"><span id="settingsSoundSub">звуки</span> · помощь · версия ${appVersion()}</span></span><span class="settingsHubArrow">›</span></button>`;

    sheet.querySelector('.sheetHeader')?.insertAdjacentElement('afterend',hub);
    hideLegacySettingsContent(sheet,hub);

    $('settingsHubReminders').addEventListener('click',()=>{
      if(window.praviloOpenReminders)window.praviloOpenReminders();
      else if($('openReminders'))click('openReminders');
      else openOverlay('remindersOverlay');
    });
    $('settingsHubData').addEventListener('click',async()=>{openOverlay('settingsDataOverlay');await refreshOfflineStatus();});
    $('settingsHubApp').addEventListener('click',()=>openOverlay('settingsAppOverlay'));

    updateReminderStatus();
    syncAudioSettings();
  }

  function updateReminderStatus(){
    const count=reminderCount(),el=$('settingsHubReminderSub');
    if(el)el.textContent=count?`${count} ${count===1?'активное':'активных'}`:'не настроены';
  }

  async function refreshOfflineStatus(){
    const el=$('settingsOfflineStatus');if(!el)return;
    if(!window.praviloOfflineStatus){el.textContent='Локальная копия подготавливается.';return;}
    const status=await window.praviloOfflineStatus();
    el.textContent=status.text;
  }

  function init(){
    buildHub();
    updateReminderStatus();
    syncAudioSettings();
    window.addEventListener('pravilo:reminders-changed',updateReminderStatus);
    window.addEventListener('pravilo:state-saved',updateReminderStatus);
    window.addEventListener('pravilo:offline-status',refreshOfflineStatus);
    window.addEventListener('pravilo:audio-settings',syncAudioSettings);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
