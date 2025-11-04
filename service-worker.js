/* 💖 Pookie’s Lovely Moments Service Worker v5 */

const CACHE_NAME = "pookie-cache-v5";

// Files to cache for offline use
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "offline.html",
  "icons/icon-72.png",
  "icons/icon-96.png",
  "icons/icon-128.png",
  "icons/icon-192.png",
  "icons/icon-256.png",
  "icons/icon-384.png",
  "icons/icon-512.png",
  "icons/favicon.svg",
  "icons/icon-maskable.svg",
  "icons/pookie-badge.svg",
  "icons/pookie-wordmark.svg"
];

// 🩷 Install event — caches all files
self.addEventListener("install", (event) => {
  console.log("💞 [Service Worker] Installing and caching app shell...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // activate immediately
});

// 🌸 Activate event — clears old cache
self.addEventListener("activate", (event) => {
  console.log("✨ [Service Worker] Activated new version.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 [Service Worker] Removing old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 💕 Fetch event — serves from cache first, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don’t cache POST/PUT or backend API requests — always go online for data
  if (
    request.method !== "GET" ||
    request.url.includes("/memories") ||
    request.url.includes("/api/")
  ) {
    event.respondWith(fetch(request).catch(() => caches.match("offline.html")));
    return;
  }

  // For static files — use cache first
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => caches.match("offline.html"))
      );
    })
  );
});

// 💫 Optional — handle push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data?.text() || "💌 A sweet reminder from your Pookie app!";
  event.waitUntil(
    self.registration.showNotification("Pookie’s Lovely Moments 💖", {
      body: data,
      icon: "icons/icon-192.png",
    })
  );
});
