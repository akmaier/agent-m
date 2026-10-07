# The notifications measured on current browsers

**MESSUNG** — 2026-10-07, macOS 26.6.2 (build 25G83). Node 25.9.0 with Playwright 1.59.0 (`npx playwright` reports
`Version 1.59.0`; Python 3.14.6 has the same `playwright` 1.59.0 package installed but was not needed — Node's sufficed for
every browser below). What UC-047 relies on (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`; UC-047 steps 1, 3, and the
alternative flows 1b and 3a), measured on the instance's Pages site as it serves `main`,
`https://akmaier.github.io/agent-m/docs/`: the service worker registered from `src/notifications/`, a notification shown
through that registration, and a click on it opening the address it carries.

## Method

A Node script (kept outside the repository, in the clone's parent folder — not part of this change) used Playwright to, for
each browser below: launch it, open a new browser context with `permissions: ["notifications"]` already granted (so the
browser's own permission question never has to be answered by hand), open `https://akmaier.github.io/agent-m/docs/#settings`,
and wait for the settings page's *Notifications* panel (`#notifications-settings`, `docs/assets/dashboard/settings-view.mjs`)
to render its button.

1. **The worker registered from `src/notifications/`.** Click the real **Switch on** button (`[data-notifications-switch-on]`),
   which calls `switchOn()` (`src/notifications/permission.mjs`) — the same call the dashboard's own settings page makes.
   Read back `navigator.serviceWorker.getRegistrations()`.
2. **A notification shown through that registration.** Click the real **Test** button (`[data-notifications-test]`), which
   calls `testNotification()` — the same call the settings page makes — and read back `registration.getNotifications()`.
   The dashboard's own Test notification carries no address by design (`docs/architecture/MOD-notifications.md`, Data: its
   address is "none"), so to see a notification that does carry one — the shape `checks.mjs` gives a real one that waits for
   acceptance — the script called `registration.showNotification(…, { data: { url } })` itself, directly, through the very
   same registration Step 1 obtained.
3. **A click on it opening its address.** No Playwright API, for any of the three engines, drives a click on an
   OS-rendered notification banner — that surface is outside the browser's own page and outside what any of these tools
   reach. Where `context.serviceWorkers()` exposes the registered worker (Chromium only, confirmed below), the script went
   one step further and reached into the worker's own execution context to dispatch a real `NotificationEvent
   ("notificationclick", { notification })` built from the shown notification — the same event type and shape `worker.mjs`'s
   own listener receives from the browser on a genuine click — and watched whether a new page opened in the context. Where
   that API exposes no worker, nothing more could be done, and this file says so.

The dashboard was reached with no GitHub token and no product stored in the browser, as the main-page measurement of
2026-10-05 reached it; every run was independent (clean context, no state kept between browsers).

## Google Chrome — version 154.0.8037.98 (Playwright channel `chrome`; Chromium engine)

This is the Google Chrome.app installed on this Mac (`Info.plist` `CFBundleShortVersionString` also reads
`154.0.8037.98`), driven through Playwright's `channel: "chrome"`, not Playwright's own bundled Chromium.

**Done:** the three steps of Method above, in full, including the worker-level click dispatch.

**Seen:**
```json
"registeredActive": [{
  "scope": "https://akmaier.github.io/agent-m/src/notifications/",
  "active": { "scriptURL": "https://akmaier.github.io/agent-m/src/notifications/worker.mjs", "state": "activated" }
}]
"notificationShown": [{ "title": "Notifications of Agent M are on", "tag": "test", "data": null }]
"notificationWithAddress": { "shown": 1, "title": "ITM-237 measurement waits for your acceptance",
  "data": { "url": "https://akmaier.github.io/agent-m/docs/#use-case/UC-047" } }
"clickResult": {
  "workerUrl": "https://akmaier.github.io/agent-m/src/notifications/worker.mjs",
  "dispatchResult": {
    "dispatched": true,
    "openedUrl": "https://akmaier.github.io/agent-m/docs/#use-case/UC-047",
    "openWindowError": "Not allowed to open a window."
  },
  "newPageUrl": null
}
```
The worker registered from `src/notifications/worker.mjs`, active, at the scope that folder gives it. Both notifications were
shown (confirmed through the Notifications API, not by eye — these tools cannot photograph macOS's own notification banner).
The dispatched click reached `worker.mjs`'s real `notificationclick` listener, which read `event.notification.data.url`
correctly — the opened address matches exactly — and called `self.clients.openWindow(url)`, but Chrome refused with "Not
allowed to open a window": a synthetic event carries no genuine user gesture, which `openWindow` requires, and no new page
opened. A real click by a person, which does carry that gesture, is not something any tool available here can produce or
observe; this is as far as it goes.

## Firefox — version 148.0.2 (Playwright's own Firefox build, `firefox-1511`; Gecko engine)

Playwright's own Firefox, downloaded for this measurement (`npx playwright install firefox`) — not the Firefox.app this Mac
may or may not have installed; none was used.

**Done:** Steps 1 and 2 of Method in full. Step 3 was attempted the same way as Chrome's.

**Seen:**
```json
"registeredActive": [{
  "scope": "https://akmaier.github.io/agent-m/src/notifications/",
  "active": { "scriptURL": "https://akmaier.github.io/agent-m/src/notifications/worker.mjs", "state": "activated" }
}]
"notificationShown": [{ "title": "Notifications of Agent M are on", "tag": "test", "data": null }]
"notificationWithAddress": { "shown": 1, "title": "ITM-237 measurement waits for your acceptance",
  "data": { "url": "https://akmaier.github.io/agent-m/docs/#use-case/UC-047" } }
"clickResult": { "attempted": false, "reason": "context.serviceWorkers() is not available or returned no worker for this engine" }
```
The worker registered and both notifications were shown, exactly as in Chrome, confirmed the same way. `context.serviceWorkers()`
returned an empty list for this engine — Playwright gives no access to a Firefox service worker's own execution context — so
there was no way, with these tools, to reach the worker and no way to drive or observe a click on the notification. Nothing
else was tried.

## WebKit — version 26.4 (Playwright's own WebKit build, `v2272`; WebKit engine)

Playwright's own WebKit (`npx playwright install webkit`, downloaded for this measurement) — not Safari.app, which this Mac
has; none was used here.

**Done:** Step 1 of Method, with the same context-level permission grant as the other two. Since it did not lead to a
registration (below), Steps 2 and 3 had nothing to act on and were not attempted beyond confirming there was nothing.

**Seen:**
```json
"regState": { "hasNotification": true, "hasServiceWorker": true, "permission": "default", "registrations": [] }
"notificationShown": null
"notificationWithAddress": { "error": "no registration" }
"clickResult": { "attempted": false, "reason": "context.serviceWorkers() is not available or returned no worker for this engine" }
```
`Notification` and `navigator.serviceWorker` both exist in this engine, and `context.newContext({ permissions: ["notifications"] })`
was accepted without error, but the permission did not take effect: a direct follow-up check — same page, same context —
called `Notification.requestPermission()` by itself and read back `{ "result": "denied" }`, with `Notification.permission`
reading `"default"` again immediately after. `switchOn()`'s own code
(`src/notifications/permission.mjs`: `if (permission !== "granted") return notificationState(store)`) therefore did nothing
further: no worker was registered, and the settings panel still showed *off* with only **Switch on**. The dashboard did not
misreport this — it simply never received a granted permission to act on. No notification was ever shown, so there was
nothing to click, and this engine, like Firefox, exposes no worker through `context.serviceWorkers()` either.

## Safari — not measured

`safaridriver` is present (`Included with Safari 26.6.2 (21624.5.1.11.3)`), but creating a WebDriver session against it was
refused:
```
{"value":{"error":"session not created","message":"Could not create a session: You must enable 'Allow remote automation' in
the Developer section of Safari Settings to control Safari via WebDriver.","stacktrace":""}}
```
Safari's own "Allow Remote Automation" is off on this Mac. That setting was not changed (the task said not to), so no
session could be opened and nothing about Safari — worker, notification or click — was measured.

## iPhone — akmaier's own measurement, quoted

Not measured here; the item gives this row as akmaier's own measurement of 2026-10-07, on `https://akmaier.github.io/agent-m/docs/`
— the same Pages site this file's other rows were measured on — standing for UC-047's alternative flows 1b (Safari on an
iPhone shows notifications only from the Home Screen) and 3a (whether the browser passes a notification's click on to the
dashboard). Quoted as the item gives it: "I was able to test notifications and it did work on iphone." He stated no version
of iOS or of the browser.

## Result

| Browser | Version (Playwright's report) | Worker registered from `src/notifications/` | Notification shown through it | Click opening its address |
|---|---|---|---|---|
| Google Chrome (channel `chrome`) | 154.0.8037.98 — Chromium | yes, active at `.../src/notifications/worker.mjs` | yes (Test button; a second, address-carrying one shown directly) | worker read the right address on a dispatched click event; opening the window was refused ("Not allowed to open a window" — no genuine user gesture); no real click could be produced or observed |
| Firefox (Playwright's own build) | 148.0.2 — Gecko | yes, same as Chrome | yes, same as Chrome | not observable with these tools — no worker access (`context.serviceWorkers()` empty) and no way to drive or see an OS click |
| WebKit (Playwright's own build) | 26.4 — WebKit | no — the context's notifications permission did not take effect (`requestPermission()` → `"denied"`) | not observed — no registration | not observable — neither a notification nor worker access existed |
| Safari (native, via `safaridriver`) | 26.6.2 (driver only; no session) | not measured | not measured | not measured — "Allow Remote Automation" is off; not changed |
| iPhone (akmaier, quoted) | not stated | — | "I was able to test notifications and it did work on iphone" (akmaier, 2026-10-07; no version given) | included in the same quote; not separately broken out |
