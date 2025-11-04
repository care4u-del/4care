// 💖 Pookie Service Worker - Offline & Auto Update
const CACHE_NAME = "pookie-cache-v3"; // update version when files change

// Files to always cache
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/pookie-badge.svg",
  "icons/favicon.svg"
];

// Install SW and pre-cache
self.addEventListener("install", (event) => {
  console.log("💖 Installing Pookie SW...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate SW and remove old caches
self.addEventListener("activate", (event) => {
  console.log("✨ Activating new Pookie SW...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch from cache first, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // don't cache POST/PUT
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((res) => {
            // Save new responses in cache
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, res.clone());
              return res;
            });
          })
          .catch(() =>
            caches.match("offline.html").then((res) => res || new Response("You’re offline 💕"))
          )
      );
    })
  );
});
