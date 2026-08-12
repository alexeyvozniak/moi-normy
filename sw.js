importScripts('./app-manifest.js');

const MANIFEST=self.PraviloManifest;
const APP_VERSION=MANIFEST?.version||'unknown';
const CACHE=`pravilo-shell-v${APP_VERSION}`;
const CORE=[
  './','./index.html','./app.css','./app-core.js','./app-bootstrap.js','./app-manifest.js','./manifest.webmanifest',
  ...MANIFEST.styles.map(path=>`./${path}`),
  ...MANIFEST.scripts.map(path=>`./${path}`)
];
const STATIC=MANIFEST.staticAssets.map(path=>`./${path}`);

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);
    await Promise.allSettled(STATIC.map(asset=>cache.add(asset)));
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

function canonicalRequest(request){
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return null;
  url.search='';url.hash='';
  return new Request(url.toString(),{method:'GET',credentials:'same-origin'});
}

async function matchCached(request,fallback){
  const exact=await caches.match(request);
  if(exact)return exact;
  const withoutQuery=await caches.match(request,{ignoreSearch:true});
  if(withoutQuery)return withoutQuery;
  if(fallback){
    const fallbackExact=await caches.match(fallback);
    if(fallbackExact)return fallbackExact;
    return caches.match(fallback,{ignoreSearch:true});
  }
  return null;
}

async function putIfUsable(request,response){
  if(!response?.ok)return response;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return response;
  const cache=await caches.open(CACHE);
  cache.put(request,response.clone()).catch(()=>{});
  const canonical=canonicalRequest(request);
  if(canonical&&url.search)cache.put(canonical,response.clone()).catch(()=>{});
  return response;
}

async function networkFirst(request,fallback){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(!response?.ok)throw new Error(`HTTP ${response?.status||0}`);
    return await putIfUsable(request,response);
  }catch(_){
    return (await matchCached(request,fallback))||Response.error();
  }
}

async function staleWhileRevalidate(request){
  const cached=await matchCached(request);
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
