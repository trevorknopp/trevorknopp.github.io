var cacheName = 'avg3-cache';
var filesToCache = [
    '/avgSpeed3.html',
    '/avgSpeed2.css',
    '/avgSpeed3.js'

];


/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('installed');
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request, {cacheName: cacheName}).then(function (response) {
            console.log(response ? 'fetched offline': 'real online fetch');
            return response || fetch(e.request);
        })
    );
});


self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                    return true;
                }).map(function (cacheName) {
                    console.log('delete cached file: ' + cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});


