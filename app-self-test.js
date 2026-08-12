(()=>{
  'use strict';
  function hasStyle(name){return [...document.styleSheets].some(sheet=>sheet.href&&new URL(sheet.href).pathname.endsWith('/'+name));}
  function run(){
    const checks={
      state:Array.isArray(window.state?.items)&&Array.isArray(window.state?.history),
      core:['save','render','openEditor','subtract'].every(name=>typeof window[name]==='function'),
      editor:!!document.getElementById('editorOverlay')&&!!document.getElementById('saveTask'),
      editorLayout:['editorScheduleSection','editorModesSection','editorStateSection','editorImageSection'].every(id=>!!document.getElementById(id)),
      pause:!!document.getElementById('pauseSwitch'),
      book:!!document.getElementById('bookModeBox'),
      dialog:typeof window.praviloConfirm==='function'&&typeof window.praviloNotice==='function',
      dashboardStyle:hasStyle('dashboard.css'),
      settings:!!document.getElementById('settingsBtn')&&!!document.querySelector('#settingsBtn .settingsGearIcon'),
      history:!!document.getElementById('historyPanel')
    };
    const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
    window.PraviloDiagnostics={...(window.PraviloBootstrap||{}),checks,failedChecks:failed,checkedAt:new Date().toISOString()};
    document.documentElement.dataset.praviloHealth=failed.length?'warning':'ok';
    if(failed.length)console.error('[Правило] Проверка целостности не пройдена:',failed);
    else console.info('[Правило] Проверка целостности: OK');
  }
  window.addEventListener('pravilo:ready',()=>setTimeout(run,0),{once:true});
})();
