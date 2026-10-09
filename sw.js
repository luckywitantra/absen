/* AiMoy PWA Service Worker v48 — bounded cache, safe updates, graceful offline shell */
const CACHE_VERSION = 'aimoy-hc-v48';
const APP_SHELL = ['./','./index.html','./admin.html','./manifest.json','./manifest-admin.json','./logoaimoy.png'];
const OPTIONAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_VERSION);
    await Promise.all(APP_SHELL.map(async url=>{try{const r=await fetch(url,{cache:'reload'});if(r.ok)await cache.put(url,r);}catch(_){}}));
    await Promise.all(OPTIONAL_ASSETS.map(async url=>{try{const r=await fetch(url,{mode:'cors'});if(r.ok)await cache.put(url,r);}catch(_){}}));
    // Do not skip waiting automatically; allow an active session to finish before update activation.
  })());
});
self.addEventListener(activate,event=>event.waitUntil((async()=>{
  const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('aimoy-hc-')&&k!==CACHE_VERSION).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener(fetch,event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // API requests are never cached; attendance transactions must reach the server or show a clear failure.
  if(url.hostname==='script.google.com'||url.pathname.includes('/macros/s/'))return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{try{const fresh=await fetch(req);if(fresh&&fresh.ok){const c=await caches.open(CACHE_VERSION);c.put(req,fresh.clone());}return fresh;}catch(_){return (await caches.match(req))||(await caches.match('./index.html'))||Response.error();}})());return;
  }
  if(url.origin===self.location.origin||OPTIONAL_ASSETS.some(a=>req.url.startsWith(a))){
    event.respondWith((async()=>{const cache=await caches.open(CACHE_VERSION);const cached=await cache.match(req);if(cached)return cached;try{const fresh=await fetch(req);if(fresh&&fresh.ok&&req.url.startsWith('http'))cache.put(req,fresh.clone());return fresh;}catch(_){return cached||Response.error();}})());
  }
});
self.addEventListener(message,event=>{if(event.data&&event.data.action==='skipWaiting')self.skipWaiting();});
