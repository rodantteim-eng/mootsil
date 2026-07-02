const CACHE = 'mootsil-v3';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('supabase.co')){
    e.respondWith(fetch(e.request).catch(function(){
      return new Response('[]',{headers:{'Content-Type':'application/json'}});
    }));
    return;
  }
  e.respondWith(fetch(e.request).catch(function(){
    return caches.match(e.request);
  }));
});
