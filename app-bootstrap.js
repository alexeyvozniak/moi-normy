(()=>{
  'use strict';
  const VERSION='34.1.0';

  const styles=[
    'designer-fonts.css?v=2',
    'ui-controls.css?v=1',
    'ui-dialog.css?v=1',
    'responsive.css?v=1',
    'onboarding.css?v=4',
    'feature-ui.css?v=1',
    'mode-tools.css?v=1',
    'practice.css?v=1',
    'prayer-haptics.css?v=2',
    'reminders.css?v=1',
    'settings-hub.css?v=6',
    'quiet-ui.css?v=3',
    'install-helper.css?v=1'
  ];

  const scripts=[
    'ui-dialog.js?v=1',
    'accrual.js?v=1',
    'onboarding.js?v=4',
    'book-mode.js?v=2',
    'practice-types.js?v=3',
    'counter-mode.js?v=1',
    'catalog-extras.js?v=1',
    'path.js?v=2',
    'prayer-practice.js?v=1',
    'prayer-haptics.js?v=4',
    'meditation-practice.js?v=3',
    'notes.js?v=1',
    'notes-export.js?v=1',
    'history-delete.js?v=3',
    'offline-storage.js?v=2',
    'reminders.js?v=1',
    'quiet-ui.js?v=1',
    'app-help.js?v=1',
    'install-helper.js?v=1',
    'settings-hub.js?v=6',
    'app-self-test.js?v=1'
  ];

  const diagnostics={version:VERSION,loaded:[],failed:[],startedAt:new Date().toISOString()};
  window.PraviloBootstrap=diagnostics;

  function ensureStyle(href){
    const plain=href.split('?')[0];
    if([...document.styleSheets].some(s=>s.href&&s.href.includes(plain))||document.querySelector(`link[data-pravilo-style="${plain}"]`))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.praviloStyle=plain;document.head.appendChild(link);
  }
  function loadScript(src){
    return new Promise(resolve=>{
      const plain=src.split('?')[0];
      if(document.querySelector(`script[data-pravilo-module="${plain}"]`)||[...document.scripts].some(s=>s.src&&s.src.includes(plain))){diagnostics.loaded.push(plain);resolve();return;}
      const script=document.createElement('script');script.src=src;script.async=false;script.dataset.praviloModule=plain;
      script.onload=()=>{diagnostics.loaded.push(plain);resolve();};
      script.onerror=()=>{diagnostics.failed.push(plain);console.error('[Правило] Не загрузился модуль:',plain);resolve();};
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
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
