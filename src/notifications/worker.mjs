// worker.mjs — the service worker through which the browser shows Agent M's notifications and opens, on a click, the
// page where what a notification names is accepted (docs/architecture/MOD-notifications.md, Parts, Data). It imports
// nothing, so that it registers as a classic worker in every browser; it has no `fetch` handler, keeps nothing and
// makes no request — it only shows a notification handed to it through its registration, and opens a window on a
// click. A worker can navigate only a page it controls, which is why the notification's own click opens a new window
// or tab instead (MOD-notifications, Data).
//
// Module: MOD-notifications

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) event.waitUntil(self.clients.openWindow(url));
});
