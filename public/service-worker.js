// The Vue 2 web version installed an offline service worker. Browsers that still run it keep
// serving that old app from their cache, but they check this address for updates. This
// replacement deletes the old caches, unregisters itself and reloads open tabs, so returning
// visitors get the current site. CoinMenu does not register a service worker itself any more.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        await self.registration.unregister();
        const windows = await self.clients.matchAll({ type: 'window' });
        windows.forEach(client => client.navigate(client.url));
    })());
});
