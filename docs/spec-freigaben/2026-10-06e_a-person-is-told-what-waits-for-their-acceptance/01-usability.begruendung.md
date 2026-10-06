# 16. Usability: a person is told what waits for their acceptance

**The change.** Two new requirements after `A FORM OPENS WITH ITS FIRST FIELD FOCUSED`: `A PERSON IS TOLD WHAT WAITS FOR THEIR
ACCEPTANCE` and `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON`. The requirements already in §16 are carried over byte for byte.

**Why.** PO, 2026-10-06: "One thing that would be useful, would be to use browser notifications, to notify the user if a change
needs to be accepted. … triggering a notification when spec, UC or architecture, tests need to be reviewed. Ideally this should
be configured in the instance settings." — "So this is usability again."

**Why only while a page is open.** Agent M runs no server (`NO SERVER`). A notification to a browser that has no page of the
dashboard open would need Web Push, and Web Push needs a server that sends it; so the dashboard checks, and notifies, while one
of its pages is open — in front or in the background, as far as the browser runs it.

**What the browsers allow, read 2026-10-06:**
- MDN, *Notification()*: the constructor works only in a secure context; it "throws a TypeError when called in nearly all
  mobile browsers … Instead, you need to register a service worker and use ServiceWorkerRegistration.showNotification()". So
  the dashboard shows its notifications through a service worker — a static file of the site, no server.
- WebKit, *Web Push for Web Apps on iOS and iPadOS*: from iOS and iPadOS 16.4, "a web app that has been added to the Home
  Screen can request permission"; the request must answer "direct user interaction". Whether such a web app can show a
  notification from its own check, without Web Push, the post does not say: it is measured on a device before the feature is
  released (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`).

**Where it is set.** In the settings page's section *this browser* (UC-042): a browser grants the permission to notify for
itself, so the switch that asks for it belongs to the browser.

**Impact list:** two new requirements; nothing names them yet. UC-047 and UC-042, drafted with this queue, will.
