(()=>{
  'use strict';

  function hasStyle(name){return [...document.styleSheets].some(sheet=>sheet.href&&new URL(sheet.href).pathname.endsWith('/'+name));}

  function run(){
    const manifest=window.PraviloManifest;
    const bootstrap=window.PraviloBootstrap;
    const checks={
      manifest:!!manifest&&typeof manifest.version==='string'&&Array.isArray(manifest.styles)&&Array.isArray(manifest.scripts)&&Array.isArray(manifest.staticAssets),
      bootstrap:!!bootstrap&&bootstrap.version===manifest?.version&&Array.isArray(bootstrap.failed)&&bootstrap.failed.length===0,
      state:Array.isArray(window.state?.items)&&Array.isArray(window.state?.history),
      core:['save','render','openEditor','subtract'].every(name=>typeof window[name]==='function'),
      editor:!!document.getElementById('editorOverlay')&&!!document.getElementById('saveTask'),
      editorLayout:['editorScheduleSection','editorModesSection','editorStateSection','editorImageSection'].every(id=>!!document.getElementById(id)),
      pause:!!document.getElementById('pauseSwitch'),
      book:!!document.getElementById('bookModeBox'),
      dialog:typeof window.praviloConfirm==='function'&&typeof window.praviloNotice==='function',
      dashboardStyle:hasStyle('dashboard.css'),
      onboardingStyle:hasStyle('onboarding.css'),
      prayerCard:typeof window.PraviloPrayerCard?.validHundreds==='function'&&hasStyle('prayer-card.css'),
      audio:typeof window.PraviloAudio?.play==='function'&&typeof window.PraviloAudio?.getSettings==='function'&&typeof window.PraviloAudio?.setSettings==='function',
      notes:typeof window.PraviloNotes?.openNote==='function'&&typeof window.PraviloShareText?.shareHistoryNote==='function',
      audioSettings:!!document.getElementById('settingsSoundOverlay')&&!!document.getElementById('settingsAudioCard')&&!!document.getElementById('settingsAudioToggle'),
      settings:!!document.getElementById('settingsBtn')&&!!document.querySelector('#settingsBtn .settingsGearIcon')&&!!document.getElementById('settingsHub'),
      history:!!document.getElementById('historyPanel')
    };

    const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
    window.PraviloDiagnostics={...(bootstrap||{}),checks,failedChecks:failed,checkedAt:new Date().toISOString()};
    document.documentElement.dataset.praviloHealth=failed.length?'warning':'ok';
    if(failed.length)console.error('[Правило] Проверка целостности не пройдена:',failed);
    else console.info('[Правило] Проверка целостности: OK');
  }

  window.addEventListener('pravilo:ready',()=>setTimeout(run,0),{once:true});
})();
