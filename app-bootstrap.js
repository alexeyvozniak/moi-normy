(()=>{
  'use strict';
  const VERSION='31.1.0';

  const styles=[
    'designer-fonts.css?v=1',
    'responsive.css?v=1',
    'onboarding.css?v=4',
    'features.css?v=1',
    'enhancements.css?v=1',
    'practice.css?v=1',
    'prayer-haptics.css?v=2',
    'reminders.css?v=1',
    'settings-hub.css?v=6',
    'quiet-ui.css?v=2',
    'install-helper.css?v=1'
  ];

  /* Один модуль — одна ответственность. */
  const scripts=[
    'accrual.js?v=1',
    'onboarding.js?v=4',
    'book-mode.js?v=1',
    'practice-types.js?v=2',
    'enhancements.js?v=1',
    'practice.js?v=1',
    'prayer-haptics.js?v=4',
    'meditation-topic-fix.js?v=1',
    'meditation-audio.js?v=2',
    'notes.js?v=1',
    'history-delete.js?v=1',
    'offline-storage.js?v=1',
    'reminders.js?v=1',
    'quiet-ui.js?v=1',
    'app-help.js?v=1',
    'install-helper.js?v=1',
    'settings-hub.js?v=6'
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
  async function start(){styles.forEach(ensureStyle);for(const src of scripts)await loadScript(src);diagnostics.finishedAt=new Date().toISOString();document.documentElement.dataset.praviloReady='1';window.dispatchEvent(new CustomEvent('pravilo:ready',{detail:diagnostics}));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
