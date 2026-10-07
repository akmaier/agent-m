# The notifications measured on current browsers

**MESSUNG** — 2026-10-07, around 17:00–17:30 UTC, on `Andreas iMac (5)`, macOS 26.6.2 (25G83), with Python Playwright
1.59.0 and geckodriver 0.37.1. What UC-047 relies on, on the instance's Pages site `https://akmaier.github.io/agent-m/docs/`:
the worker registered from `src/notifications/`, a notification shown through that registration, and a click on it
opening its address (ITM-237). This entry covers the computer's installed Chrome and installed Firefox. It leaves Safari
itself, and the click on any of the three browsers, for a second entry: both need either macOS permissions this entry
was told not to grant, or akmaier's own hand — see "What this entry could not reach" below.

## Method

The Chrome and Firefox sections below (worker registered, notification shown) each drove their browser as a fresh,
disposable profile distinct from the person's own — not the profile the person browses with — so that nothing this
entry did persists in the person's real Chrome or Firefox settings (verified in each section). The one exploratory
check of the permission prompt itself ("What this entry could not reach", point 1) is the single exception: it used
Claude's Chrome extension, which acts in the person's own, already-running Chrome, in one tab opened for it and closed
again afterward; the permission request that click left behind was never answered and never persisted (the same
Preferences check reported in the Chrome section below covers this tab too, since it ran first). No system setting
and no browser preference of the person's own profile was changed to produce any result below. No `notificationclick`
was ever dispatched by a script: every click below is either a real click this entry's tool sent to the *page's* own
button (Settings → *Notifications* → *Switch on* / *Test*, `docs/assets/dashboard/settings-view.mjs`), which is real
behaviour of the product's own UI, or — for the notification banner itself — not produced at all, as "What this entry
could not reach" details.

Because `switchOn()` must call `Notification.requestPermission()` directly in a click handler
(`docs/architecture/MOD-notifications.md`, Interfaces), and because that call opens a prompt drawn by the browser's own
address-bar chrome — never by the page — answering it the way a person does (a click on *Allow*) needs exactly the
same OS-level pointer action as clicking the notification banner itself (see below), which this entry could not
produce either. So each browser's permission was instead granted ahead of the click, through that browser's own
automation interface, scoped to the one disposable profile of that run:

- **Chrome**: Python Playwright 1.59.0 (`pip3 show playwright`), already installed, launched the installed binary with
  `playwright.chromium.launch(channel="chrome")` and granted the permission with
  `browser.new_context(permissions=["notifications"])` — Playwright's wrapper over the CDP call
  `Browser.grantPermissions`, applied only to that automation session's own temporary profile.
- **Firefox**: geckodriver 0.37.1 (installed with `brew install geckodriver` for this measurement) started a WebDriver
  session whose capabilities named the installed binary and a preference of its own temporary profile only:
  ```json
  {"capabilities": {"alwaysMatch": {"browserName": "firefox", "moz:firefoxOptions": {
    "binary": "/Applications/Firefox.app/Contents/MacOS/firefox",
    "prefs": {"permissions.default.desktop-notification": 1}
  }}}}
  ```

Both scripts live outside this repository, in the clone's parent folder, as the task that gave this item required.

## Chrome

**Google Chrome 154.0.8037.98** (`/Applications/Google Chrome.app`, confirmed both by `browser.version` from Playwright
and by running the binary with `--version` directly), driven by Playwright as above, headful.

What was done, in order: launched the installed binary with the notifications permission pre-granted (above); opened
`https://akmaier.github.io/agent-m/docs/#settings`; read `Notification.permission` (`"granted"`, confirming the grant
took); clicked the page's own **Switch on** button (`[data-notifications-switch-on]`); read back the permission and
`navigator.serviceWorker.getRegistrations()`; clicked the page's own **Test** button (`[data-notifications-test]`);
read back the shown notification with `registration.getNotifications()`.

What was seen:
```
permission before any click: granted
permission after Switch on: granted
registrations after Switch on: [{"scope": "https://akmaier.github.io/agent-m/src/notifications/",
  "active": "https://akmaier.github.io/agent-m/src/notifications/worker.mjs"}]
notifications currently shown by the registration: [{"title": "Notifications of Agent M are on", "tag": "test",
  "data": null}]
```
The worker registered from `src/notifications/` — scope and active script both resolve under that folder, as
`docs/architecture/MOD-notifications.md` describes — and a notification was shown through that registration: the
product's own test notification, by its own design the one notification whose click opens nothing — its row in
`MOD-notifications.md`'s Data table gives its "Address it opens" as "none; a click only closes it". The click was not
produced; see below.

No trace was left in the person's own Chrome: after the run, `~/Library/Application Support/Google/Chrome/Default/
Preferences` carries no notifications exception for `akmaier.github.io` (checked by reading that one key, nothing
else), and the processes left running after the script are exactly the ones that were already running before it.

## Firefox

**Mozilla Firefox 140.12.0 (ESR)** (`/Applications/Firefox.app`, confirmed both by geckodriver's `browserVersion`
capability and by running the binary with `--version` directly), driven by geckodriver as above, headful.

Playwright cannot drive this installed copy at all — tried first, for consistency with Chrome's method, and ruled out
by a concrete failure, not assumed: `playwright.firefox.launch(executable_path=".../Firefox.app/Contents/MacOS/
firefox")` launches the real binary but then waits on Playwright's own automation pipe, which only Playwright's own
patched Firefox builds speak:
```
<launching> .../Firefox.app/Contents/MacOS/firefox -no-remote -wait-for-browser -foreground -profile
  /var/folders/.../playwright_firefoxdev_profile-ZlDtkl -juggler-pipe -silent
<launched> pid=19907
playwright._impl._errors.TimeoutError: BrowserType.launch: Timeout 15000ms exceeded.
```
The installed Firefox never opens that pipe, so the call times out; Playwright killed the process on its own timeout
(no Firefox process remained afterwards). Driven instead through geckodriver, which speaks the WebDriver/Marionette
protocol the installed Firefox does support — the same steps as Chrome's: opened the settings page with the
permission pre-granted (above), read `Notification.permission`, clicked **Switch on**
(`#notifications-settings [data-notifications-switch-on]`), read back the permission and the registrations, clicked
**Test** (`[data-notifications-test]`), read back the shown notification.

What was seen:
```
firefox full version (capabilities): 140.12.0
permission before any click: granted
permission after Switch on: granted
registrations after Switch on: [{"active": "https://akmaier.github.io/agent-m/src/notifications/worker.mjs",
  "scope": "https://akmaier.github.io/agent-m/src/notifications/"}]
notifications currently shown by the registration: [{"data": null, "tag": "test",
  "title": "Notifications of Agent M are on"}]
```
The same two behaviours as Chrome: the worker registered from `src/notifications/`, and a notification — the same
test notification, same reasoning about its click — shown through that registration.

No trace was left in the person's own Firefox: geckodriver creates a fresh temporary profile per session and no
preference was passed for any other one; the person's actual profile folder
(`~/Library/Application Support/Firefox/Profiles/s02ui1h2.default`) has no file newer than the start of this work.

## What this entry could not reach: the click, on either browser

On this Mac, both browsers hand a web notification's on-screen banner to macOS's own Notification Center — never to
anything the page, or the worker, draws — so clicking it needs a real pointer action on a piece of screen no browser's
own automation protocol (Chrome's CDP, Firefox's WebDriver/Marionette) exposes at all, on either browser. Four routes
that could reach a real, computer-level click were considered; each was tested, on this Mac, rather than assumed, and
each needs something this entry was told not to take:

1. **Claude's Chrome extension** (`mcp__claude-in-chrome__*`), which sends real clicks to the installed Chrome's own
   page content: clicking the page's own **Switch on** button this way leaves `Notification.permission` at `"default"`
   indefinitely, with no error raised. Chrome's own permission prompt opens — invisibly to a screenshot this tool
   takes, since that only captures the tab's content — and nothing ever answers it, because the prompt sits in the
   browser's address-bar chrome, outside any coordinate this tool's clicks can reach. (Run of 2026-10-07: tab
   `1720336294`, click on the *Switch on* button, then `Notification.permission` read back `"default"` by a fresh
   `javascript_tool` call.) This is the same wall as the notification banner itself, one level earlier.
2. **AppleScript UI scripting** (`osascript` → `System Events`), which could click any on-screen element including a
   notification banner, needs macOS's Accessibility permission for the process that calls it. Tested directly:
   `osascript -e 'tell application "System Events" to get name of every window of (first process whose name is
   "Finder")'` → `40:44: execution error: „System Events“ hat einen Fehler erhalten: osascript hat keine Berechtigung
   für den Hilfszugriff. (-1728)`. That permission is not granted, and granting it is exactly a System Settings → Privacy &
   Security → Accessibility change — the kind of change this item's task said to leave for the person.
3. **Reading**, without clicking, whether a banner was even posted, from macOS's own record of it
   (`~/Library/Group Containers/group.com.apple.usernoted/`): `Operation not permitted` — gated by Full Disk Access, a
   second, separate System Settings permission, also not granted and also not this entry's to grant.
4. No computer-use / remote-desktop screen-and-mouse tool, and no CLI pointer tool (`cliclick`, `xdotool`), is
   available to this entry at all.

None of the four reaches the banner. Producing the click, and seeing it open its address, needs either Accessibility
(and, to confirm the banner's own appearance independently, Full Disk Access) granted to whatever drives it, or
akmaier's own click — both left for the next entry, with his access.

## iPhone (quoted, not measured by this entry)

The iPhone's row (UC-047 1b, 3a) is akmaier's own measurement, 2026-10-07, on this same site
(`https://akmaier.github.io/agent-m/docs/`), quoted as he gave it: "I was able to test notifications and it did work
on iphone." He named no version of iOS or of the browser.

## Result so far

| Browser | Version | Driven via | Worker registered from `src/notifications/` | Notification shown through it | Click opens its address |
|---|---|---|---|---|---|
| Chrome (installed) | 154.0.8037.98 | Playwright 1.59.0, `channel="chrome"` | seen | seen (test notification) | not reached — needs Accessibility/Full Disk Access or akmaier |
| Firefox (installed) | 140.12.0 (ESR) | geckodriver 0.37.1 (WebDriver/Marionette); Playwright cannot drive it (confirmed above) | seen | seen (test notification) | not reached — same as Chrome |
| Safari | — | — | not measured by this entry | not measured by this entry | not measured by this entry |
| iPhone | not named by akmaier | — | — (akmaier's quote only covers "did work") | — | — |

## What the next entry needs from akmaier

- Safari itself (not Playwright's WebKit), measured directly, with its own version named.
- A real, computer-level click on the notification banner each browser shows — on Chrome and Firefox as measured here,
  and on Safari — opening its address: either akmaier's own click, or his access to grant Accessibility (and Full Disk
  Access, to independently confirm a banner was shown) to whatever is to drive it, per the sprint's record
  (`docs/backlog/sprints/11.md`: "ITM-237 once akmaier has given the access to Safari and to the click on his
  computer, about six hours after this decision").
