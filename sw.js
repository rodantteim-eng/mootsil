var CACHE_NAME = 'mootsil-v2';
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
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  // Red primero: siempre intenta traer la version mas reciente del servidor
  // (bypass del cache HTTP con no-store). Si no hay señal, usa lo ultimo
  // guardado en cache para que la app siga funcionando sin conexion.
  e.respondWith(
    fetch(e.request, {cache:'no-store'}).then(function(response){
      if(response && response.status === 200){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, copy); });
      }
      return response;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
