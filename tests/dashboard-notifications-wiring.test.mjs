// A change between jobs, sprint 07 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS; docs/backlog/sprints/team1/07.md): the
// dashboard's old code now
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
import { repoServer, openDashboard, richDocument, press, settle, REPO, TOKEN } from "./app-harness.mjs";
import { installPage } from "./site-frame-start.d/dom.mjs";
import { startPage } from "../src/site-frame/index.mjs";
import { view } from "../src/main-page/index.mjs";

const PREFIX = `agent-m:${REPO}:`; // MOD-browser-store's own prefix of the instance (store.mjs prefixOf)
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const API = "https://api.github.com"; // GitHub's REST API host (src/repository-hosts/github.mjs) — ITM-238 F2's tests below
const emptyTags = (url) => (url.origin === API && /\/tags$/.test(url.pathname)
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);

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

// MOD-settings-pages owns the public Settings DOM.  Capture its actual tab panel
// from the dashboard mount instead of reaching the retired dashboard-owned id.
const publicControls = (root, name, out = []) => {
  for (const child of root?.children ?? []) {
    if (typeof child !== "object") continue;
    if (child.className?.split(" ").includes(name)) out.push(child);
    publicControls(child, name, out);
  }
  return out;
};

async function usabilitySettings(page) {
  const main = globalThis.document.getElementById("main");
  const replace = main.replaceChildren.bind(main);
  let mounted = [];
  main.replaceChildren = (...children) => { mounted = children; replace(...children); };
  await page.go("#settings");
  const pane = mounted.find((node) => node.className === "settings-tab-panel" && /Usability/.test(node.textContent));
  assert.ok(pane, "the dashboard mounts MOD-settings-pages' public Usability tab");
  return pane;
}

// ---------------------------------------------------------------- the settings page (UC-042, UC-047)

// TST-472132 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: the settings page of a fresh browser (nothing stored under MOD-browser-store's prefix yet)
// input: opening #settings, then the person's click on *Switch on*
// expect: the line *Notifications* is off before the click, through notificationState; the click asks the browser's permission directly (NOTIFICATIONS ARE SWITCHED ON BY THE PERSON) and, once granted, switchOn stores the switch under MOD-browser-store's own key of the instance — "agent-m:<instance>:notifications" — and the line then reads on, through the same notificationState
test("the settings page's line Notifications reaches MOD-notifications: off, then Switch on stores the switch under MOD-browser-store's key", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    const page = await openDashboard({ server, hash: "#uc" });
    const box = await usabilitySettings(page);
    assert.match(box.textContent, /Notifications/);
    assert.match(box.textContent, /off/, "notificationState: off before anything is stored");
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notifications`), null);

    const switchOn = publicControls(box, "settings-notifications-on")[0];
    assert.ok(switchOn, "Switch on is offered while off");
    await press(server, switchOn);

    assert.equal(browser.calls.requestPermission, 1, "Switch on asks the browser's permission, once, on the click");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`)), { checked: null },
      "switchOn stored the switch under MOD-browser-store's own key of the instance");
    assert.match(box.textContent, /on/, "notificationState now reads on");
    assert.ok(publicControls(box, "settings-notifications-off").length, "Switch off is offered once on");
  } finally { browser.restore(); }
});

// ---------------------------------------------------------------- the review pages (UC-047)

// TST-472133 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: an empty fixture repository (nothing waits for acceptance); "notifications" already switched on in this browser, its last check six minutes old — due for a new one (MOD-notifications, Interfaces: watchForAcceptance)
// input: opening the review pages (openDashboard), with the browser installed above
// expect: watchForAcceptance registered its one check interval (the only call anywhere in this codebase that passes 60000 to setInterval — src/notifications/checks.mjs's CHECK_EVERY_MS); its immediate first run (before any interval tick) read MOD-browser-store's store of the instance, checked this empty repository through MOD-repository-hosts' real connect() against this fixture, found nothing waiting, and wrote the check's own time back under the very key it was given — proof that the store watchForAcceptance ran with is the instance's, not some other
test("the review pages start MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
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
// The root page enters through MOD-site-frame's native startPage with MOD-main-page's view. This test-owned setup
// follows the Frame DOM entry pattern without sharing start.mjs's process-global strategy registry with review fixtures.
async function openNativeMainPage({ server, entries = {}, keepOpen = false }) {
  const priorDocument = globalThis.document, hadDocument = "document" in globalThis;
  const priorLocation = globalThis.location, hadLocation = "location" in globalThis;
  const priorWindow = globalThis.window, hadWindow = "window" in globalThis;
  const priorLocalStorage = globalThis.localStorage, priorFetch = globalThis.fetch;
  const page = installPage({ hostname: "akmaier.github.io", pathname: "/agent-m/" });
  page.document.baseURI = new URL("./page.html", import.meta.url).href;
  for (const [key, value] of Object.entries(entries)) globalThis.localStorage.setItem(key, value);
  globalThis.fetch = server.fetch;
  const restore = () => {
    if (hadDocument) globalThis.document = priorDocument; else delete globalThis.document;
    if (hadLocation) globalThis.location = priorLocation; else delete globalThis.location;
    if (hadWindow) globalThis.window = priorWindow; else delete globalThis.window;
    globalThis.localStorage = priorLocalStorage;
    globalThis.fetch = priorFetch;
  };
  let started = false;
  try {
    await startPage({ page: "main", views: [view] });
    await settle(server);
    started = true;
    if (keepOpen) return { restore };
  } finally {
    if (!keepOpen || !started) restore();
  }
}

// TST-472134 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: the same empty fixture and stale "notifications" as the review pages' test above
// input: starting the native Frame entry with MOD-main-page's view, then letting its first check settle
// expect: the same two proofs as the review pages' test — the one check interval, and the stale check's time replaced — through the main page's native Frame wiring, not the review pages'
test("the main page starts MOD-notifications' watchForAcceptance with MOD-browser-store's store of the instance", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  const stale = minutesAgo(6);
  let page;
  try {
    page = await openNativeMainPage({ server, keepOpen: true, entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: stale }) } });

    assert.equal(browser.calls.setInterval.length, 1, "watchForAcceptance registered its one check interval");
    assert.equal(browser.calls.setInterval[0].ms, 60000);

    const after = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`));
    assert.notEqual(after.checked, stale,
      "a real check ran through MOD-browser-store's store of the instance, and recorded its own time");
  } finally { page?.restore(); browser.restore(); }
});

// ---------------------------------------------------------------- ITM-238 F1 and F2 fixed (UC-047)
//
// A further change between jobs, sprint 08 (SPEC.md WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS; docs/backlog/
// sprints/08.md, "now, before ITM-243"): two findings against the wiring above are fixed — settings-view.mjs showed
// *Notifications* as its own section beside "This browser", not inside it (F1); and dashboard-app.mjs and home.mjs
// connected the instance's host, for the checks, with MOD-browser-store's own "github-token" setting, which nothing
// in the repository ever writes, in place of the dashboard's real, stored GitHub token — settings-store.mjs's
// store.getToken(), used everywhere else, as the dashboard's own connect() for the routes of MOD-implementation-pages already does
// (F2). These three tests are this change's own proof, reached the same way the tests above reach these pages.
// ITM-238's own system test (tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs) still marks F1 and
// F2 todo; ITM-243 removes those marks, not this change.

// TST-477001 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: a fresh browser (nothing stored)
// input: opening #settings
// expect: (F1 fixed) the Notifications controls live in the public Usability tab, with no dashboard-owned browser-settings composition.
test("ITM-238 F1 fixed: the Notifications controls are in the public Usability tab", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    const page = await openDashboard({ server, hash: "#settings" });
    const box = await usabilitySettings(page);
    assert.match(box.textContent, /Notifications/, "the live public pane contains Notifications");
    assert.equal(page.main().includes('id="browser-settings"'), false, "the retired dashboard-owned settings section is absent");
  } finally { browser.restore(); }
});

// TST-477002 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: the dashboard's own stored GitHub token (openDashboard's default), notifications on and due
// input: opening a review page (#uc)
// expect: (F2 fixed) every request the page makes to the instance's API — the content it shows and the check alike — carries the dashboard's own stored token (settings-store.mjs's store.getToken(), this page's ghToken()), never MOD-browser-store's separate, never-written "github-token" setting
test("ITM-238 F2 fixed: the review pages' check connects the instance with the dashboard's own stored token", async () => {
  const seenAuth = [];
  const browser = installBrowser();
  const server = await repoServer({ files: {}, handlers: [emptyTags,
    (url, init) => { if (url.origin === API) seenAuth.push(init.headers?.Authorization ?? null); return undefined; },
  ] });
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }) } });
    assert.ok(seenAuth.length > 0, "the page made at least one request to the instance's API");
    assert.ok(seenAuth.every((a) => a === `Bearer ${TOKEN}`),
      "every request — the page's own content and the check alike — carried the dashboard's stored token; none was unauthenticated");
  } finally { browser.restore(); }
});

// TST-477003 · level: component · module: MOD-notifications
// guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: the same main-page environment as "the main page starts…" above, with the dashboard's own stored GitHub token and notifications due
// input: starting the native Frame entry with MOD-main-page's view
// expect: (F2 fixed) every request the main page makes to the instance's API carries the dashboard's own stored token — the same fix as the review pages' above, through the Frame's store-following host
test("ITM-238 F2 fixed: the main page's check also connects the instance with the dashboard's own stored token", async () => {
  const seenAuth = [];
  const server = await repoServer({ files: {}, handlers: [emptyTags,
    (url, init) => { if (url.origin === API) seenAuth.push(init.headers?.Authorization ?? null); return undefined; },
  ] });
  const browser = installBrowser();
  const stale = minutesAgo(6);
  try {
    await openNativeMainPage({ server, entries: {
      [`${PREFIX}notifications`]: JSON.stringify({ checked: stale }), [`${PREFIX}github-token`]: JSON.stringify({ value: TOKEN, name: "Agent M", expires: null, stored: "2026-10-19" }),
    } });
    assert.ok(seenAuth.length > 0, "the main page made at least one request to the instance's API");
    assert.ok(seenAuth.every((a) => a === `Bearer ${TOKEN}`),
      "every request the main page made carried the dashboard's stored token; none was unauthenticated");
  } finally { browser.restore(); }
});

// TST-863201 · level: component · module: MOD-notifications
// guards: UC-047; A CLEAR IS A REAL CLEAR
// given: the main page's environment as above, with notifications switched on and due, the product alice/thesis kept with its own token github_pat_PRODUCT…; a fetch handler that records the authorisation of every request to the product and answers none
// input: starting the native Frame entry with MOD-main-page's view and letting its first check run; then the product's token is removed, five minutes pass (the stored time of the last check is set back) and the page's one check interval fires
// expect: the first check sends at least one request to https://api.github.com/repos/alice/thesis, each carrying "Bearer github_pat_PRODUCT0123456789abcdefghij" (the main page's checks reach a kept product through its host); the second check sends at least one, each carrying no authorisation (null), and none anywhere carries the removed token
test("the main page's checks reach a kept product through its host, and a token removed since is not sent", async () => {
  const PRODUCT_TOKEN = "github_pat_PRODUCT0123456789abcdefghij", PRODUCT_API = `${API}/repos/alice/thesis`;
  const sent = [];
  const spy = (url, init) => { if (url.href.startsWith(PRODUCT_API)) sent.push(init.headers?.Authorization ?? null); return undefined; };
  const server = await repoServer({ files: {}, handlers: [emptyTags, spy] });
  const browser = installBrowser();
  let page;
  try {
    page = await openNativeMainPage({ server, keepOpen: true, entries: {
      [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }),
      [`${PREFIX}products`]: JSON.stringify(["https://github.com/alice/thesis"]),
      [`${PREFIX}github-token:alice/thesis`]: JSON.stringify({ value: PRODUCT_TOKEN, name: "Agent M", expires: null, stored: "2026-10-19" }),
    } });
    assert.equal(sent.length > 0 && sent.every((auth) => auth === `Bearer ${PRODUCT_TOKEN}`), true, JSON.stringify(sent));

    globalThis.localStorage.removeItem(`${PREFIX}github-token:alice/thesis`);
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    sent.length = 0;
    browser.calls.setInterval.find((each) => each.ms === 60000).fn();
    await settle(server);
    assert.deepEqual(sent.map((auth) => auth), sent.map(() => null), JSON.stringify(sent));
    assert.equal(sent.length > 0, true, "the second check reached the product");
  } finally { page?.restore(); browser.restore(); }
});
