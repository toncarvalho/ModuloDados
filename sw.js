/**
 * Service Worker — cache do app shell para o jogo funcionar 100% offline
 * e carregar rápido. Estratégia cache-first com fallback de rede.
 */
const CACHE = "idolmath-v9";
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
  "js/data/roupas.js",
  "js/data/conquistas.js",
  "js/scenes/BootScene.js",
  "js/scenes/ProfileScene.js",
  "js/scenes/MenuScene.js",
  "js/scenes/HeroScene.js",
  "js/scenes/StageScene.js",
  "js/scenes/GameScene.js",
  "js/scenes/ResultScene.js",
  "js/scenes/SettingsScene.js",
  "js/scenes/TrainScene.js",
  "js/scenes/ProgressScene.js",
  "js/scenes/LojaScene.js",
  "js/scenes/ConquistasScene.js",
  "assets/icon.svg",
  "assets/herois/rubi.svg",
  "assets/herois/rubi-festa.svg",
  "assets/herois/rubi-inverno.svg",
  "assets/herois/lorena.svg",
  "assets/herois/lorena-rock.svg",
  "assets/herois/lorena-esporte.svg",
  "assets/herois/mel.svg",
  "assets/herois/mel-diva.svg",
  "assets/herois/mel-verao.svg",
  "assets/herois/leo.svg",
  "assets/herois/leo-aventura.svg",
  "assets/herois/leo-gamer.svg",
  "assets/herois/priya.svg",
  "assets/herois/priya-festival.svg",
  "assets/herois/priya-esporte.svg",
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

// "App shell" (código): rede-primeiro p/ pegar atualização; cache como fallback
// offline. Estáticos pesados (phaser, svg, imagens): cache-primeiro (rápido).
function ehCodigo(req) {
  if (req.mode === "navigate") return true;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return false;
  return /\.(?:html|js|css|json)$/.test(url.pathname) || url.pathname === "/";
}

function guardar(req, resp) {
  if (resp && resp.ok && req.url.startsWith(self.location.origin)) {
    const copy = resp.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return resp;
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const req = e.request;

  if (ehCodigo(req)) {
    // network-first
    e.respondWith(
      fetch(req)
        .then((resp) => guardar(req, resp))
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("index.html"))
        )
    );
    return;
  }

  // cache-first (estáticos)
  e.respondWith(
    caches.match(req).then(
      (hit) => hit || fetch(req).then((resp) => guardar(req, resp)).catch(() => hit)
    )
  );
});
