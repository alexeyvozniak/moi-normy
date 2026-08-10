const CACHE='pravilo-polish-v7';
const ASSETS=['./','./index.html','./polish.css','./onboarding.css','./onboarding.js','./features.css','./features.js','./welcome-preview.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png','./images/hero.webp','./images/prayer_person_beads.webp','./images/reading_person_book.webp','./images/contemplation_looking_up.webp','./images/samurai_training.webp','./images/selfcare_onsen.webp','./images/calligraphy_ink.webp','./images/walking_path.webp','./images/books_notes.webp','./images/open_book.webp','./images/enso.webp','./images/stat_active.webp','./images/stat_debt.webp','./images/stat_done.webp','./images/onboarding_hero.webp','./images/onboarding_prayer.webp','./images/onboarding_reading.webp','./images/onboarding_meditation.webp'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();
});

function enhancedHtml(text){
  let out=text;
  if(!out.includes('polish.css')) out=out.replace('</head>','<link rel="stylesheet" href="polish.css?v=7">\n</head>');
  if(!out.includes('onboarding.css')) out=out.replace('</head>','<link rel="stylesheet" href="onboarding.css?v=3">\n</head>');
  if(!out.includes('features.css')) out=out.replace('</head>','<link rel="stylesheet" href="features.css?v=1">\n</head>');
  if(!out.includes('onboarding.js')) out=out.replace('</body>','<script src="onboarding.js?v=3" defer></script>\n</body>');
  if(!out.includes('features.js')) out=out.replace('</body>','<script src="features.js?v=1" defer></script>\n</body>');
  return out;
}

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request)
        .then(r=>r.text())
        .then(text=>new Response(enhancedHtml(text),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}}))
        .catch(()=>caches.match('./index.html').then(r=>r.text()).then(text=>new Response(enhancedHtml(text),{headers:{'Content-Type':'text/html; charset=utf-8'}})))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
});
