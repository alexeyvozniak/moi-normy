const VERSION="pravilo-v3";
const ASSETS=["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./images/book.webp", "./images/calligraphy.webp", "./images/contemplation.webp", "./images/desk.webp", "./images/enso.webp", "./images/hero.webp", "./images/onsen.webp", "./images/prayer.webp", "./images/reading.webp", "./images/sport.webp", "./images/stat_active.webp", "./images/stat_debt.webp", "./images/stat_done.webp", "./images/wanderer.webp"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.mode==="navigate"){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(k=>k.put("./index.html",c));return r;}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(k=>k.put(req,c));return r;})));
});
