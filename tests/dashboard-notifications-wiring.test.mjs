// A change between jobs, sprint 07 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS; docs/backlog/sprints/07.md): the
// dashboard's old code (docs/assets/dashboard/settings-view.mjs, docs/assets/dashboard-app.mjs, src/home/home.mjs) now
// reaches MOD-notifications, as ITM-236's Outcome names it — the settings page shows the line *Notifications* through
// notificationState, switchOn, testNotification and switchOff, and the main and review pages start watchForAcceptance
// with MOD-browser-store's store of the instance. MOD-notifications' own behaviour — the checks, the timing, the
// grouping past three — is tested by tests/notifications.test.mjs and is not repeated here; these three tests check only
// that the dashboard reaches it.
//
// Module: MOD-notifications
// Guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// Level: component
//
// watchForAcceptance registers a real interval (globalThis.setInterval) the instant it is called, uncleared for the
// page's whole life — exactly what a real browser tab does, and exactly what must not happen for real in this process:
// tests/app-harness.mjs's openDashboard does not fake Notification, navigator or setInterval (it was built for views
// that need none of them), so every test below installs its own — restored in `finally` — the same way tests/
// notifications.test.mjs's installBrowser() does for MOD-notifications' own tests, not a change to that shared file.
// Counter-proof, verified for this file and recorded in the pull request: without that install, Notification is
// undefined under node --test, and the wiring below (`typeof globalThis.Notification === "undefined"` in dashboard-
// app.mjs's and home.mjs's startNotifications) skips watchForAcceptance — which is also why no other existing test that
// loads these pages leaks a real interval.

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, REPO } from "./app-harness.mjs";

const PREFIX = `agent-m:${REPO}:`; // MOD-browser-store's own prefix of the instance (store.mjs prefixOf)
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();

// Notification "granted", a worker that registers, setInterval/clearInterval that only record their calls — never a
// real timer. restore() puts back exactly what was there before (notifications.test.mjs's own installBrowser, trimmed
// to what these three tests read).
function installBrowser() {
  const prior = {
    hadNotification: "Notification" in globalThis, Notification: globalThis.Notification,
    hadNavigator: "navigator" in globalThis, navigator: globalThis.navigator,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
  };
  const calls = { requestPermission: 0, setInterval: [] };
  const registration = { showNotification() {} };
  Object.defineProperty(globalThis, "Notification", {
    value: { permission: "granted", requestPermission: async () => { calls.requestPermission++; return "granted"; } },
    configurable: true, writable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: { serviceWorker: { register: async () => registration, getRegistration: async () => registration }, userAgent: "node" },
    configurable: true, writable: true,
  });
  globalThis.setInterval = (fn, ms) => { calls.setInterval.push({ fn, ms }); return 1; }; // captured, never really scheduled
  globalThis.clearInterval = () => {};
  return {
    calls,
    restore() {
      if (prior.hadNotification) globalThis.Notification = prior.Notification; else delete globalThis.Notification;
      if (prior.hadNavigator) globalThis.navigator = prior.navigator; else delete globalThis.navigator;
      globalThis.setInterval = prior.setInterval;
      globalThis.clearInterval = prior.clearInterval;
    },
  };
}

// ---------------------------------------------------------------- the settings page (UC-042, UC-047)

// given: the settings page of a fresh browser (nothing stored under MOD-browser-store's prefix yet)
// input: opening #settings, then the person's click on *Switch on*
// expect: the line *Notifications* is off before the click, through notificationState; the click asks the browser's
//         permission directly (NOTIFICATIONS ARE SWITCHED ON BY THE PERSON) and, once granted, switchOn stores the
//         switch under MOD-browser-store's own key of the instance — "agent-m:<instance>:notifications" — and the
//         line then reads on, through the same notificationState
test("the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser();
  try {
    const page = await openDashboard({ server, hash: "#uc" });
    const dom = richDocument();
    await page.go("#settings");

    const box = dom.byId("notifications-settings");
    assert.match(box.innerHTML, /<h3>Notifications<\/h3>/);
    assert.match(box.innerHTML, /<p class="state">off<\/p>/, "notificationState: off before anything is stored");
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notifications`), null);

    const switchOn = box.querySelector("[data-notifications-switch-on]");
    assert.ok(switchOn, "Switch on is offered while off");
    await press(server, switchOn);

    assert.equal(browser.calls.requestPermission, 1, "Switch on asks the browser's permission, once, on the click");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`)), { checked: null },
      "switchOn stored the switch under MOD-browser-store's own key of the instance");
    assert.match(box.innerHTML, /<p class="state">✓ on<\/p>/, "notificationState now reads on");
    assert.ok(box.querySelector("[data-notifications-switch-off]"), "Switch off is offered once on");
  } finally { browser.restore(); }
});

// ---------------------------------------------------------------- the review pages (UC-047)

// given: an empty fixture repository (nothing waits for acceptance); "notifications" already switched on in this
//        browser, its last check six minutes old — due for a new one (MOD-notifications, Interfaces: watchForAcceptance)
// input: opening the review pages (openDashboard), with the browser installed above
// expect: watchForAcceptance registered its one check interval (the only call anywhere in this codebase that passes
//         60000 to setInterval — src/notifications/checks.mjs's CHECK_EVERY_MS); its immediate first run (before any
//         interval tick) read MOD-browser-store's store of the instance, checked this empty repository through
//         MOD-repository-hosts' real connect() against this fixture, found nothing waiting, and wrote the check's own
//         time back under the very key it was given — proof that the store watchForAcceptance ran with is the
//         instance's, not some other
test("the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser();
  const stale = minutesAgo(6);
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: stale }) } });

    assert.equal(browser.calls.setInterval.length, 1, "watchForAcceptance registered its one check interval");
    assert.equal(browser.calls.setInterval[0].ms, 60000);

    const after = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`));
    assert.notEqual(after.checked, stale,
      "a real check ran through MOD-browser-store's store of the instance, and recorded its own time");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`)), { [REPO]: {} },
      "nothing waits in this empty fixture, read through MOD-repository-hosts' real connect()");
  } finally { browser.restore(); }
});

// ---------------------------------------------------------------- the main page (UC-047)
//
// src/home/home.mjs has no test harness of its own yet (unlike docs/assets/dashboard-app.mjs's tests/app-harness.mjs):
// no existing test loads it. This brings the small environment its start() needs — document.getElementById returning a
// plain, settable element (home.mjs only ever assigns .innerHTML, never queries a control back out of one), location
// (instanceOf) and localStorage (MOD-browser-store, and settings-store.mjs's own legacy store) — built for this file
// alone, not a change to any existing test or test helper.

function fakeMainPageDom() {
  const els = new Map();
  return { getElementById: (id) => { if (!els.has(id)) els.set(id, { innerHTML: "" }); return els.get(id); } };
}

// given: the same empty fixture and stale "notifications" as the review pages' test above
// input: importing src/home/home.mjs fresh, with this small environment installed, and letting its start() (run on
//        import, since globalThis.document then exists) settle
// expect: the same two proofs as the review pages' test — the one check interval, and the stale check's time replaced
//         — through the main page's own wiring (src/home/home.mjs startNotifications), not the review pages'
test("the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser();
  const stale = minutesAgo(6);
  const priorDocument = "document" in globalThis ? globalThis.document : undefined, hadDocument = "document" in globalThis;
  const priorLocation = "location" in globalThis ? globalThis.location : undefined, hadLocation = "location" in globalThis;
  const priorLocalStorage = globalThis.localStorage, priorFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "document", { value: fakeMainPageDom(), configurable: true, writable: true });
  Object.defineProperty(globalThis, "location", {
    value: { hostname: "akmaier.github.io", pathname: "/agent-m/", href: "https://akmaier.github.io/agent-m/" },
    configurable: true, writable: true,
  });
  const mem = new Map([[`${PREFIX}notifications`, JSON.stringify({ checked: stale })]]);
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => { mem.set(k, String(v)); }, removeItem: (k) => { mem.delete(k); },
      get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null,
    },
    configurable: true, writable: true,
  });
  globalThis.fetch = server.fetch;
  try {
    // start() is called without being awaited (`if (globalThis.document) start();`, run on import for every entry page
    // of this dashboard) — its own card read and watchForAcceptance's first run() are both still in flight once the
    // import settles; settle(server) (tests/app-harness.mjs's own, used as the review pages' tests already do) waits
    // for every request through the shared fetch mock, from either, to quiet down.
    await import(new URL(`../src/home/home.mjs?load=${Date.now()}`, import.meta.url));
    await settle(server);

    assert.equal(browser.calls.setInterval.length, 1, "watchForAcceptance registered its one check interval");
    assert.equal(browser.calls.setInterval[0].ms, 60000);

    const after = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`));
    assert.notEqual(after.checked, stale,
      "a real check ran through MOD-browser-store's store of the instance, and recorded its own time");
  } finally {
    browser.restore();
    if (hadDocument) globalThis.document = priorDocument; else delete globalThis.document;
    if (hadLocation) globalThis.location = priorLocation; else delete globalThis.location;
    globalThis.localStorage = priorLocalStorage;
    globalThis.fetch = priorFetch;
  }
});
