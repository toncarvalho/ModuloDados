/**
 * Service Worker — cache do app shell para o jogo funcionar 100% offline
 * e carregar rápido. Estratégia cache-first com fallback de rede.
 */
const CACHE = "idolmath-v4";
const ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "css/style.css",
  "vendor/phaser.min.js",
  "js/main.js",
  "js/core/Storage.js",
  "js/core/MathEngine.js",
  "js/core/Audio.js",
  "js/core/UI.js",
  "js/core/Util.js",
  "js/data/fases.js",
  "js/data/herois.js",
  "js/scenes/BootScene.js",
  "js/scenes/ProfileScene.js",
  "js/scenes/MenuScene.js",
  "js/scenes/HeroScene.js",
  "js/scenes/StageScene.js",
  "js/scenes/GameScene.js",
  "js/scenes/ResultScene.js",
  "js/scenes/SettingsScene.js",
  "js/scenes/TrainScene.js",
  "assets/icon.svg",
  "assets/herois/rubi.svg",
  "assets/herois/lorena.svg",
  "assets/herois/mel.svg",
  "assets/herois/leo.svg",
  "assets/herois/priya.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      // resiliente: não falha tudo se um arquivo faltar
      Promise.allSettled(ASSETS.map((u) => cache.add(u)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((resp) => {
            // guarda cópias do mesmo domínio
            if (resp.ok && e.request.url.startsWith(self.location.origin)) {
              const copy = resp.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return resp;
          })
          .catch(() => caches.match("index.html"))
    )
  );
});
