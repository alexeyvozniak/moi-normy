const APP_VERSION='35.0.0';
const CACHE=`pravilo-shell-v${APP_VERSION}`;
const CORE=[
  './','./index.html','./app.css','./app-core.js','./app-bootstrap.js','./manifest.webmanifest',
  './designer-fonts.css','./ui-controls.css','./ui-dialog.css','./responsive.css','./onboarding.css','./feature-ui.css','./mode-tools.css','./practice.css','./prayer-haptics.css','./reminders.css','./settings-hub.css','./quiet-ui.css','./install-helper.css',
  './ui-dialog.js','./accrual.js','./onboarding.js','./book-mode.js','./practice-types.js','./counter-mode.js','./catalog-extras.js','./path.js','./prayer-practice.js','./prayer-haptics.js','./meditation-practice.js','./notes.js','./notes-export.js','./history-delete.js','./offline-storage.js','./reminders.js','./quiet-ui.js','./app-help.js','./install-helper.js','./settings-hub.js','./app-self-test.js',
  './icon-180.png','./icon-192.png','./icon-512.png',
  './images/hero.webp','./images/stat_active.webp','./images/stat_debt.webp','./images/stat_done.webp',
  './images/prayer_person_beads.webp','./images/reading_person_book.webp','./images/contemplation_looking_up.webp','./images/samurai_training.webp','./images/selfcare_onsen.webp','./images/calligraphy_ink.webp','./images/walking_path.webp','./images/open_book.webp','./images/books_notes.webp','./images/enso.webp',
  './images/prayer_icons.webp','./images/prayer_prostration.webp','./images/prayer_bow.webp',
  './images/settings-reminders.webp','./images/settings-data.webp','./images/settings-app.webp'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(asset=>cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    const open=list.find(client=>'focus' in client);
    if(open)return open.focus();
    if(clients.openWindow)return clients.openWindow('./');
  })());
});

async function putIfUsable(request,response){
  if(!response?.ok)return response;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return response;
  const cache=await caches.open(CACHE);
  cache.put(request,response.clone()).catch(()=>{});
  return response;
}

async function networkFirst(request,fallback){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(!response?.ok)throw new Error(`HTTP ${response?.status||0}`);
    return await putIfUsable(request,response);
  }catch(error){
    return (await caches.match(request))||(fallback?await caches.match(fallback):null)||Response.error();
  }
}

async function staleWhileRevalidate(request){
  const cached=await caches.match(request);
  const refresh=fetch(request).then(response=>putIfUsable(request,response)).catch(()=>null);
  return cached||(await refresh)||Response.error();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request,'./index.html'));
    return;
  }

  const url=new URL(request.url);
  const sameOrigin=url.origin===self.location.origin;
  const codeAsset=sameOrigin&&(
    request.destination==='script'||request.destination==='style'||
    /\.(?:js|css|webmanifest)$/i.test(url.pathname)
  );

  event.respondWith(codeAsset?networkFirst(request):staleWhileRevalidate(request));
});
