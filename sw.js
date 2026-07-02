const CACHE = 'mootsil-v1';
const ASSETS = ['/'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Solo cachear el HTML de la app, no las llamadas a Supabase
  if(url.includes('supabase.co')){
    e.respondWith(fetch(e.request).catch(function(){ return new Response(JSON.stringify([]),{headers:{'Content-Type':'application/json'}}); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        var clone = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return resp;
      });
    }).catch(function(){
      return caches.match('/');
    })
  );
});
