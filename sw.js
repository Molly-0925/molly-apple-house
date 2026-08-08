// Molly 的苹果屋 service worker
const CACHE = "molly-apple-house-v4";
const ASSETS = [
    "./",
    "./index.html",
    "./schedule.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png",
    "./favicon-molly.png"
];

self.addEventListener("install", e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ));
    self.clients.claim();
});

self.addEventListener("fetch", e => {
    if (e.request.method !== "GET") return;
    const url = new URL(e.request.url);
    // 跨域请求（如外接 API /v1/chat/completions, /v1/models）完全放行，不拦截
    if (url.origin !== location.origin) return;
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
            if (resp.ok) {
                const clone = resp.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return resp;
        }).catch(() => caches.match("./index.html")))
    );
});
