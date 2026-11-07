/* Service worker de EnglishPath (escrito a mano: Serwist no es compatible con Turbopack).
 *
 * - Archivos estáticos con hash (/_next/static, íconos, imágenes): caché primero. No cambian nunca.
 * - Páginas: siempre de la red (tienen datos del usuario). Sin conexión → página /offline.
 * - Todo lo demás (datos, acciones del servidor, Supabase): pasa directo a la red.
 *
 * La versión llega en la URL de registro (/sw.js?v=<build>): cada despliegue instala un SW nuevo
 * y refresca la página sin conexión.
 */
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const STATIC_CACHE = "ep-static-v1";
const PAGES_CACHE = `ep-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const MAX_STATIC_ENTRIES = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("ep-pages-") && n !== PAGES_CACHE).map((n) => caches.delete(n)),
      );
      await trimStatic();
      await self.clients.claim();
    })(),
  );
});

/** Borra los archivos estáticos más viejos si hay demasiados (de despliegues anteriores). */
async function trimStatic() {
  const cache = await caches.open(STATIC_CACHE);
  const keys = await cache.keys();
  const extra = keys.length - MAX_STATIC_ENTRIES;
  for (let i = 0; i < extra; i++) await cache.delete(keys[i]);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /^\/(icons|images|sounds)\//.test(url.pathname) ||
    url.pathname.startsWith("/icon.png")
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function networkWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkWithOfflineFallback(request));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
