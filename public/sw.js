const CACHE_NAME = "proje-yoneticisi-v1"
const urlsToCache = ["/", "/offline", "/icons/icon-192x192.png", "/icons/icon-512x512.png", "/manifest.json"]

// Service Worker kurulumu
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch olayları
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache'de varsa döndür
      if (response) {
        return response
      }

      return fetch(event.request).catch(() => {
        // Ağ hatası durumunda offline sayfasını göster
        if (event.request.destination === "document") {
          return caches.match("/offline")
        }
      })
    }),
  )
})

// Cache güncelleme
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Push notification desteği
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Yeni bildirim",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Görüntüle",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Kapat",
        icon: "/icons/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Proje Yöneticisi", options))
})
