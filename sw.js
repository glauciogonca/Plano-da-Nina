const CACHE = 'nutri-v1';
const ASSETS = ['./','./index.html','./manifest.json',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate' || req.destination === 'document'){
    e.respondWith(fetch(req).then(res=>{
      const c = res.clone(); caches.open(CACHE).then(x=>x.put('./index.html', c)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res=>{
    if (res && res.status===200 && res.type==='basic'){
      const c = res.clone(); caches.open(CACHE).then(x=>x.put(req,c)).catch(()=>{});
    }
    return res;
  }).catch(()=>hit)));
});
