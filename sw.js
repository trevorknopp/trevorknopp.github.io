var cacheName = 'avg2-cache';
var filesToCache = [
    '/avgSpeed2.html',
    '/avgSpeed2.css',
    '/avgSpeed2Data.js',
    '/avgSpeed2Startup.js',
    '/avgSpeed2.js'

];

var appVersion = 170;

fetch('/meta.json')
    .then((response) => response.json())
    .then((meta) => {
        if (appVersion > meta.version) {
            // Service worker cache should be cleared with caches.delete()
            caches.keys().then(function (names) {
                for (let name of names) caches.delete(name);
                // delete browser cache and hard reload
                window.location.reload(true);
            });
        }
    });



/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
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
                    return caches.delete(cacheName);
                })
            );
        })
    );
});


