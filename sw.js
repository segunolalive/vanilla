'use strict';
this.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/static/main.css',
        '/static/index.js',
        '/static/images/vanilla192x192.png',
        '/static/images/vanilla256x256.png',
        '/static/images/vanilla512x512.png',
        '/static/images/vanillaFavicon.png',
        '/templates/index.html'
      ]);
    })
  );
});


this.addEventListener('activate', function(event) {
  const cacheWhitelist = ['v1'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});


this.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                if (
                    networkResponse.headers.get('Content-Type') !==
                    'text/event-stream'
                ) {
                    let networkResponseClone = networkResponse.clone();
                    caches.open('v1').then((cache) => {
                        cache.put(event.request, networkResponseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return caches. match('/templates/index.html');
            })
        })
    );
});
