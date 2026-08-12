(()=>{
  'use strict';

  const diagnostics={version:'unknown',loaded:[],failed:[],startedAt:new Date().toISOString()};
  window.PraviloBootstrap=diagnostics;

  function pathOf(url){
    try{return new URL(url,location.href).pathname;}catch(_){return '';}
  }

  function loadManifest(){
    if(globalThis.PraviloManifest)return Promise.resolve(globalThis.PraviloManifest);
    return new Promise(resolve=>{
      const existing=[...document.scripts].find(script=>script.src&&pathOf(script.src).endsWith('/app-manifest.js'));
      if(existing){existing.addEventListener('load',()=>resolve(globalThis.PraviloManifest||null),{once:true});existing.addEventListener('error',()=>resolve(null),{once:true});return;}
      const script=document.createElement('script');
      script.src='app-manifest.js';
      script.async=false;
      script.dataset.praviloManifest='1';
      script.onload=()=>resolve(globalThis.PraviloManifest||null);
      script.onerror=()=>resolve(null);
      document.head.appendChild(script);
    });
  }

  function ensureStyle(href,version){
    const target='/'+href;
    if([...document.styleSheets].some(sheet=>sheet.href&&pathOf(sheet.href).endsWith(target))||document.querySelector(`link[data-pravilo-style="${href}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`${href}?v=${encodeURIComponent(version)}`;
    link.dataset.praviloStyle=href;
    link.addEventListener('error',()=>{if(!diagnostics.failed.includes(href))diagnostics.failed.push(href);console.error('[Правило] Не загрузился стиль:',href);},{once:true});
    document.head.appendChild(link);
  }

  function loadScript(src,version){
    return new Promise(resolve=>{
      const target='/'+src;
      if(document.querySelector(`script[data-pravilo-module="${src}"]`)||[...document.scripts].some(script=>script.src&&pathOf(script.src).endsWith(target))){diagnostics.loaded.push(src);resolve();return;}
      const script=document.createElement('script');
      script.src=`${src}?v=${encodeURIComponent(version)}`;
      script.async=false;
      script.dataset.praviloModule=src;
      let settled=false;
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(ok)diagnostics.loaded.push(src);else if(!diagnostics.failed.includes(src))diagnostics.failed.push(src);resolve();};
      const timer=setTimeout(()=>{console.error('[Правило] Таймаут загрузки модуля:',src);finish(false);},10000);
      script.onload=()=>finish(true);
      script.onerror=()=>{console.error('[Правило] Не загрузился модуль:',src);finish(false);};
      document.body.appendChild(script);
    });
  }

  async function start(){
    const manifest=await loadManifest();
    if(!manifest){
      diagnostics.failed.push('app-manifest.js');
      diagnostics.finishedAt=new Date().toISOString();
      document.documentElement.dataset.praviloReady='0';
      console.error('[Правило] Не найден центральный manifest приложения');
      return;
    }

    diagnostics.version=manifest.version;
    manifest.styles.forEach(href=>ensureStyle(href,manifest.version));
    for(const src of manifest.scripts)await loadScript(src,manifest.version);

    diagnostics.finishedAt=new Date().toISOString();
    document.documentElement.dataset.praviloReady=diagnostics.failed.length?'warning':'1';
    window.dispatchEvent(new CustomEvent('pravilo:ready',{detail:diagnostics}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
