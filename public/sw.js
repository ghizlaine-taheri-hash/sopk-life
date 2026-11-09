// Service worker SMOP Map — socle installable + base pour les notifications
const CACHE = "smop-map-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
// passthrough réseau (on ne met rien en cache agressif pour ne pas servir une vieille version)
self.addEventListener("fetch", (e) => {});
// réception d'une notification push (utilisé à l'étape B)
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
