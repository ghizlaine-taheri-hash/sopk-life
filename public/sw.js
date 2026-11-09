// Service worker SMOP Map — mise à jour auto + notifications
const CACHE = "smop-map-v2";

self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });

// Réseau d'abord pour la navigation (index.html) : l'app shell est toujours à jour quand il y a du réseau,
// et retombe sur le cache uniquement hors ligne. Les assets hashés (JS/CSS) gardent le cache HTTP normal.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/")))
    );
  }
});

// Notifications push (rappels quotidiens)
self.addEventListener("push", (e) => {
  let data = { title: "SMOP Map", body: "N'oublie pas ta mission du jour." };
  try { if (e.data) data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title || "SMOP Map", {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png"
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((cl) => {
    for (const c of cl) { if ("focus" in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow("/");
  }));
});
