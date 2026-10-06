---
id: MOD-notifications
title: The browser's notifications of what waits for the person's acceptance
folder: src/notifications/
realises:
follows:
  - ARC-038
uses:
  - MOD-browser-store.readSetting
  - MOD-browser-store.writeSetting
  - MOD-browser-store.clearSetting
  - MOD-repository-hosts.Host
  - MOD-repository-hosts.Snapshot
  - MOD-repository-hosts.parseAddress
  - MOD-repository-hosts.connect
  - MOD-repository-hosts.repositoryInfo
  - MOD-repository-hosts.readSnapshot
  - MOD-progress-measures.waitingForAcceptance
provides:
  - NotificationState
  - watchForAcceptance
  - notificationState
  - switchOn
  - testNotification
  - switchOff
---
# MOD-notifications The browser's notifications of what waits for the person's acceptance

## Responsibility

It belongs to the Site (ARC-038). Its one responsibility is telling the person, through their browser's notifications,
what has come to wait for their acceptance — a SPEC change, a use case, an architecture file, a release test report — in
the instance and in each product this browser keeps (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`): the switch,
with the browser's permission asked only on the person's click (`NOTIFICATIONS ARE SWITCHED ON BY THE PERSON`); the check
every five minutes while a page of the dashboard is open; what was notified, so that nothing is notified twice while it
waits; and the service worker through which the browser shows a notification and opens, on a click, the page where the
file is accepted. Agent M runs no server that could check while no page is open (`NO SERVER`), so nothing is checked
then. It is no view: the frame starts its checks on the main and the review pages, and the settings page shows its
switch.

It runs in a browser — the main page and the review pages, never the Bridge's window.

## Parts

- `index.mjs` — the interface.
- `checks.mjs` — the checks, what is new against what was notified, and the notifications of a check.
- `permission.mjs` — the state, switching on and off, the test.
- `worker.mjs` — the service worker. It imports nothing, so that it registers as a classic worker in every browser. On a
  click on a notification it closes it and opens the address the notification carries in a new window or tab; it has no
  `fetch` handler, keeps nothing and makes no request.

## Data

It keeps, while a page is open, the hosts of the repositories it reads, so that each blob is read once
(MOD-repository-hosts), and, in this browser's store, the keys `notifications` — the switch, with the time of this
browser's last check — and `notified` — what was notified, by repository, file and the blob of its text —, in the
formats MOD-browser-store's catalogue defines. It owns the notification it shows:

| Notification | Title and text | Tag | Address it opens |
|---|---|---|---|
| one file that has come to wait, where no more than three of its kind came in its repository in one check | `<identifier> waits for your acceptance`, and the repository's path — `owner/name`, or a GitLab project's path | the repository, the file and its blob | its review page, MOD-review-pages' route `<k>/<id>` for that repository — `<k>` `spec-entry`, `use-case`, `decision` or `module` by its kind, `<id>` its identifier —; for a release test report, MOD-test-pages' release panel, the route `release`, for that repository |
| more than three of one kind that have come to wait in one repository in one check | `<n>` and the kind, `wait for your acceptance`, and the repository's path | the repository and the kind | the list of that kind, MOD-review-pages' route `<k>`, for that repository; for release test reports, the release panel |
| the test | `Notifications of Agent M are on` | the instance and `test` | none; a click only closes it |

Every notification leads to where what it names is accepted (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`): one file
to its review page; several of one kind to that kind's list, where they are accepted one by one or together (`SEVERAL
FILES ARE ACCEPTED IN ONE CLICK`); a release test report to the release panel, where *Accept and release* accepts it
(UC-013). A notification with the tag of one that is still shown replaces it instead of standing beside it, so two open
pages that notify the same text at the same moment show it once.

The service worker lives in this module's folder (`AGENT M'S SOURCE CODE LIVES IN SRC`), and GitHub Pages sets no
`Service-Worker-Allowed` header, so its scope is that folder: it controls no page of the dashboard. A page therefore
shows a notification through the registration it gets from registering the worker — not through
`navigator.serviceWorker.ready`, which waits for a worker of the page's own scope —, once that registration's worker is
active; a click reaches the worker, which opens the address in a new window or tab, since a worker can navigate only a
page it controls. Where a browser opens the dashboard without passing the click on to the worker (UC-047 3a), the
notification's text — what waits and where — is what leads the person on.

## Interfaces

- `NotificationState` — `{ on: boolean, permission: "default" | "granted" | "denied", available: "here" | "from the Home
  Screen" | "no" }`: `on` whether the person has switched notifications on in this browser; `permission` the browser's
  answer to its question, as `Notification.permission` gives it; `available` whether this browser can show notifications
  for the dashboard as it is opened — `from the Home Screen` on an iPhone or iPad, whose Safari shows them only for a
  site opened from the Home Screen (UC-047 1b), `no` where the browser offers a page no notifications or no service
  worker, as in a private window of some browsers.
- `watchForAcceptance(page: { store: Store, instance: { repository: string, host: Host }, addressOf: (route: string,
  params: Record<string, string>, repository: string) -> string }) -> void` — the checks of one page, started by the
  frame on the main and the review pages with this page's store, the instance as the frame connected it, and the frame's
  writing of the address of a route of the review pages for a repository — the instance's or a product's address. Every
  minute the page looks whether a check is due — the switch on, the browser's permission granted, and this browser's
  last check five minutes old or older —, so that the pages open in this browser together check every five minutes, and
  a page opened after a pause checks at once (UC-047 2a). A check reads the snapshot of the default branch of the
  instance and of each product the store keeps — each connected with its own token, which goes only to its own server —,
  takes from each, with its host, what waits for acceptance with `waitingForAcceptance`, and compares it with
  `notified`: what waits on a blob `notified` does not hold for its path has come to wait — a file changed again among
  it. Of one kind in one repository, up to three are notified one by one and more than three by one notification of
  their number; then the check records its time, and `notified` holds, for every repository it read, what waits there
  now, so that an entry whose file no longer waits is dropped. The first check after notifications are switched on —
  `checked` still `null` — shows nothing and only records what waits then: a notification tells what comes to wait while
  notifications are on (`A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`). Considers: it crosses the network to the
  repository servers; a repository it cannot read — `NotFound`, `TokenRefused`, `PermissionMissing`, `RateLimited`,
  `Unreachable` — is skipped until the next check, keeps its entries in `notified`, and nothing is notified for it in
  between (UC-047 2c); a check costs a repository the requests of one snapshot, of its tags and of the blobs not read
  before on this page, job records among them only while a release candidate is pending (MOD-release-evidence). A
  browser that pauses a page in the background holds its checks until it runs the page again (UC-047 2b). Where the
  browser has dropped the worker's registration, the check registers it again. It throws nothing: a store the browser
  refuses holds no switch, and no check runs.
- `notificationState(store: Store) -> NotificationState` — the state of this browser, for the settings page; it asks
  nothing and makes no request.
- `switchOn(store: Store) -> Promise<NotificationState>` — the person's **Switch on**: asks the browser's permission to
  notify — the only call in Agent M that asks it —; once it is granted, registers the worker from this module's folder
  and stores the switch as on, with no check made yet. When the person or the browser refuses, nothing is registered or
  stored, and the state's `permission` says `denied` (UC-047 1a). Considers: it must be called directly in the handler
  of the person's click, before that handler awaits anything, since browsers ask only within a person's action. Errors:
  `NotAvailable { available }` while `available` is not `here`; `WorkerRefused { reason }` when the browser refuses to
  register the worker — nothing is stored then —; `StorageUnavailable`.
- `testNotification() -> Promise<void>` — the person's **Test**: shows the test notification at once, through the
  worker's registration. Errors: `NotPermitted` while the permission is not granted; `WorkerRefused { reason }`.
- `switchOff(store: Store) -> Promise<void>` — the person's **Switch off**: removes `notifications` and `notified` from the
  store (`A CLEAR IS A REAL CLEAR`), so that no open page checks again (UC-047 4a), and unregisters the worker. The
  browser keeps its permission until the person takes it back in its own settings; no page can take it back. Errors:
  `StorageUnavailable`.

`Store` is MOD-browser-store's; `Host` is MOD-repository-hosts'.

## Files

It reads and writes, through MOD-browser-store, the keys `notifications` and `notified`, and reads `products` and the
products' tokens. It reads, through the hosts it connects, the snapshot of the default branch of the instance and of
each product this browser keeps — the files `waitingForAcceptance` reads. It writes no repository file. It registers and
unregisters its own `worker.mjs` with the browser.

## Uses

- MOD-browser-store.readSetting — the switch, what was notified, the products this browser keeps and their tokens;
  MOD-browser-store.writeSetting — the switch, the time of the last check and what was notified;
  MOD-browser-store.clearSetting — both keys removed on *Switch off*.
- MOD-repository-hosts.Host, MOD-repository-hosts.parseAddress, MOD-repository-hosts.connect — each product's host, with
  its own token; MOD-repository-hosts.repositoryInfo — each repository's default branch, read once per page;
  MOD-repository-hosts.readSnapshot, MOD-repository-hosts.Snapshot — the default branch at its head, at every check, handed
  to `waitingForAcceptance`.
- MOD-progress-measures.waitingForAcceptance — what waits for acceptance in a repository, from its snapshot alone.
