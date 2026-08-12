(()=>{
  'use strict';

  const manifest=globalThis.PraviloManifest;
  const VERSION=manifest?.version||'unknown';
  const diagnostics={version:VERSION,loaded:[],failed:[],startedAt:new Date().toISOString()};
  window.PraviloBootstrap=diagnostics;

  function pathOf(url){
    try{return new URL(url,location.href).pathname;}catch(_){return '';}
  }

  function ensureStyle(href){
    const target='/'+href;
    if([...document.styleSheets].some(sheet=>sheet.href&&pathOf(sheet.href).endsWith(target))||document.querySelector(`link[data-pravilo-style="${href}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`${href}?v=${encodeURIComponent(VERSION)}`;
    link.dataset.praviloStyle=href;
    link.addEventListener('error',()=>{if(!diagnostics.failed.includes(href))diagnostics.failed.push(href);console.error('[Правило] Не загрузился стиль:',href);},{once:true});
    document.head.appendChild(link);
  }

  function loadScript(src){
    return new Promise(resolve=>{
      const target='/'+src;
      if(document.querySelector(`script[data-pravilo-module="${src}"]`)||[...document.scripts].some(script=>script.src&&pathOf(script.src).endsWith(target))){diagnostics.loaded.push(src);resolve();return;}
      const script=document.createElement('script');
      script.src=`${src}?v=${encodeURIComponent(VERSION)}`;
      script.async=false;
      script.dataset.praviloModule=src;
      const finish=(ok)=>{clearTimeout(timer);if(ok)diagnostics.loaded.push(src);else if(!diagnostics.failed.includes(src))diagnostics.failed.push(src);resolve();};
      const timer=setTimeout(()=>{console.error('[Правило] Таймаут загрузки модуля:',src);finish(false);},10000);
      script.onload=()=>finish(true);
      script.onerror=()=>{console.error('[Правило] Не загрузился модуль:',src);finish(false);};
      document.body.appendChild(script);
    });
  }

  async function start(){
    if(!manifest){
      diagnostics.failed.push('app-manifest.js');
      diagnostics.finishedAt=new Date().toISOString();
      document.documentElement.dataset.praviloReady='0';
      console.error('[Правило] Не найден центральный manifest приложения');
      return;
    }

    manifest.styles.forEach(ensureStyle);
    for(const src of manifest.scripts)await loadScript(src);

    diagnostics.finishedAt=new Date().toISOString();
    document.documentElement.dataset.praviloReady=diagnostics.failed.length?'warning':'1';
    window.dispatchEvent(new CustomEvent('pravilo:ready',{detail:diagnostics}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
