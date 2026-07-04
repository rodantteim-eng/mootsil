var CACHE_NAME = 'mootsil-v1';
var APP_SHELL = ['./', './index.html'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){return n!==CACHE_NAME;}).map(function(n){return caches.delete(n);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(function(cached){
      var networkFetch = fetch(e.request).then(function(response){
        if(response && response.status === 200){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, copy); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || networkFetch;
    })
  );
});
