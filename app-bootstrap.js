(()=>{
  'use strict';
  const VERSION='35.6.1';

  const styles=[
    'designer-fonts.css',
    'ui-controls.css',
    'ui-dialog.css',
    'responsive.css',
    'dashboard.css',
    'editor-layout.css',
    'onboarding.css',
    'feature-ui.css',
    'mode-tools.css',
    'practice.css',
    'prayer-haptics.css',
    'reminders.css',
    'settings-hub.css',
    'quiet-ui.css',
    'install-helper.css'
  ];

  const scripts=[
    'ui-dialog.js',
    'ui-notice.js',
    'domain.js',
    'day-clock.js',
    'audio.js',
    'history-ledger.js',
    'accrual.js',
    'onboarding.js',
    'book-mode.js',
    'practice-types.js',
    'counter-mode.js',
    'catalog-extras.js',
    'path.js',
    'prayer-practice.js',
    'prayer-haptics.js',
    'meditation-practice.js',
    'notes.js',
    'notes-export.js',
    'history-delete.js',
    'offline-storage.js',
    'reminders.js',
    'interaction-dialogs.js',
    'app-help.js',
    'install-helper.js',
    'settings-hub.js',
    'editor-layout.js',
    'app-self-test.js'
  ];

  const diagnostics={version:VERSION,loaded:[],failed:[],startedAt:new Date().toISOString()};
  window.PraviloBootstrap=diagnostics;

  function ensureStyle(href){
    if([...document.styleSheets].some(sheet=>sheet.href&&new URL(sheet.href).pathname.endsWith('/'+href))||document.querySelector(`link[data-pravilo-style="${href}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';link.href=href;link.dataset.praviloStyle=href;
    document.head.appendChild(link);
  }

  function loadScript(src){
    return new Promise(resolve=>{
      if(document.querySelector(`script[data-pravilo-module="${src}"]`)||[...document.scripts].some(script=>script.src&&new URL(script.src).pathname.endsWith('/'+src))){diagnostics.loaded.push(src);resolve();return;}
      const script=document.createElement('script');
      script.src=src;script.async=false;script.dataset.praviloModule=src;
      script.onload=()=>{diagnostics.loaded.push(src);resolve();};
      script.onerror=()=>{diagnostics.failed.push(src);console.error('[Правило] Не загрузился модуль:',src);resolve();};
      document.body.appendChild(script);
    });
  }

  async function start(){
    styles.forEach(ensureStyle);
    for(const src of scripts)await loadScript(src);
    diagnostics.finishedAt=new Date().toISOString();
    document.documentElement.dataset.praviloReady='1';
    window.dispatchEvent(new CustomEvent('pravilo:ready',{detail:diagnostics}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
