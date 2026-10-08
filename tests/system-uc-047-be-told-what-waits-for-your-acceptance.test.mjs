// The system tests of UC-047, Be told what waits for your acceptance (ITM-238): its main flow and every alternative flow it
// names, walked through the settings page and the main and review pages as the dashboard reaches MOD-notifications since the
// change between jobs #157 (docs/assets/dashboard/settings-view.mjs, docs/assets/dashboard-app.mjs, src/home/home.mjs) —
// reached the way tests/dashboard-notifications-wiring.test.mjs reaches them: tests/app-harness.mjs's repoServer and
// openDashboard, a browser's Notification/navigator/setInterval stood in for as that file's own installBrowser() does, never a
// real timer. MOD-notifications' own checking logic (the timing, the grouping past three, the dedupe) is unit-tested by
// tests/notifications.test.mjs and is not repeated for its own sake here; every test below is reached through a real page,
// which tests/notifications.test.mjs does not do. Every expected result is UC-047's own; where the page and UC-047 disagree,
// the test follows UC-047 and is marked todo with its FINDING.
//
// ITM-243 (sprint 08, once sprint 08's change between jobs #163 fixed F1 and F2 — docs/gates/20261007-1315-development-
// release-testing-d362.md) removes the todo marks of the two tests that hit them, with their counter-proof recorded in
// the pull request.
//
// Written by developer-sonnet-e, the release tester of docs/instructions/developers.md's "An item of release or system
// tests", who implemented none of UC-047 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
//
// Run: node --test tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs
//
// Module: MOD-notifications
// Guards: UC-047
// Level: system

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, REPO, TOKEN } from "./app-harness.mjs";

const PREFIX = `agent-m:${REPO}:`; // MOD-browser-store's own prefix of the instance (store.mjs prefixOf)
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const API = "https://api.github.com", RAW = "https://raw.githubusercontent.com";
const PRODUCT = "alice/thesis-tool"; // a product this browser keeps, UC-047 step 2's "each product"
const emptyTags = (url) => (url.origin === API && /\/tags$/.test(url.pathname)
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);

// ---------------------------------------------------------------- the browser: Notification, navigator.serviceWorker and
// ---------------------------------------------------------------- setInterval/clearInterval stood in for one test, combining
// ---------------------------------------------------------------- tests/dashboard-notifications-wiring.test.mjs's own
// ---------------------------------------------------------------- installBrowser() (never a real timer) with
// ---------------------------------------------------------------- tests/notifications.test.mjs's own tick() (a second check,
// ---------------------------------------------------------------- run by hand, never a real wait) — not a change to either
// ---------------------------------------------------------------- shared file.

function installBrowser({ permission = "granted", userAgent = "node" } = {}) {
  const prior = {
    hadNotification: "Notification" in globalThis, Notification: globalThis.Notification,
    hadNavigator: "navigator" in globalThis, navigator: globalThis.navigator,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
  };
  const calls = { requestPermission: 0, setInterval: [] };
  let current = permission, requestResult = "granted";
  const registration = { showNotification() {}, unregister: async () => {} };
  Object.defineProperty(globalThis, "Notification", {
    value: { get permission() { return current; },
      requestPermission: async () => { calls.requestPermission++; current = requestResult; return requestResult; } },
    configurable: true, writable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: { serviceWorker: { register: async () => registration, getRegistration: async () => registration }, userAgent },
    configurable: true, writable: true,
  });
  let captured = null;
  globalThis.setInterval = (fn, ms) => { captured = fn; calls.setInterval.push({ fn, ms }); return 1; };
  globalThis.clearInterval = () => {};
  return {
    calls,
    setRequestResult: (r) => { requestResult = r; },
    tick: () => captured(), // a second (or third) check, run by hand — never a real wait
    restore() {
      if (prior.hadNotification) globalThis.Notification = prior.Notification; else delete globalThis.Notification;
      if (prior.hadNavigator) globalThis.navigator = prior.navigator; else delete globalThis.navigator;
      globalThis.setInterval = prior.setInterval;
      globalThis.clearInterval = prior.clearInterval;
    },
  };
}

// The instance's server, with one product behind it (UC-047 step 2's "each product this browser keeps") — forwarded the
// way tests/release-sprint-04-uc-001-repository-hosts.test.mjs's own servers() forwards a product's requests, trimmed to
// reading alone (no write is tested here).
async function withProduct(instanceFiles, productFiles) {
  const product = await repoServer({ repo: PRODUCT, files: productFiles, handlers: [emptyTags] });
  const productAuthorizations = [];
  const instance = await repoServer({
    files: instanceFiles,
    handlers: [
      emptyTags,
      (url, init) => {
        if (!((url.origin === API && url.pathname.startsWith(`/repos/${PRODUCT}`))
          || (url.origin === RAW && url.pathname.startsWith(`/${PRODUCT}/`)))) return undefined;
        productAuthorizations.push(new Headers(init.headers).get("Authorization"));
        return product.fetch(url.href, init);
      },
    ],
  });
  return { instance, product, productAuthorizations };
}

// A page that can show a real notification: this harness's document has no baseURI (built for views that resolve no
// address from it — a real browser always has one) and installBrowser()'s own worker registration does nothing;
// both are added here, locally, on the document openDashboard just created — not a change to tests/app-harness.mjs
// or to installBrowser() above, which this file still uses for Notification/navigator/setInterval. Called after
// openDashboard (document does not exist before it); the first check after Switch on never reaches a notification at
// all (firstCheck), so no test needs this before that first check runs.
function captureNotifications() {
  Object.defineProperty(globalThis.document, "baseURI", { value: "https://akmaier.github.io/agent-m/", configurable: true });
  const shown = [];
  const registration = { showNotification: (title, options) => shown.push({ title, ...options }) };
  Object.defineProperty(globalThis.navigator.serviceWorker, "register", { value: async () => registration, configurable: true });
  Object.defineProperty(globalThis.navigator.serviceWorker, "getRegistration", { value: async () => registration, configurable: true });
  return shown;
}

// What a person reads: HTML entities decoded, as tests/release-sprint-04-uc-001-repository-hosts.test.mjs's own unesc does.
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// This browser's canonical MOD-browser-store product list and the product's own GitHub token, given directly as a
// fixture entry the way every test of this file gives "notifications"/"notified" directly, never driving the
// add-product page itself (out of this item's scope: MOD-notifications reads the product, not how it was added).
const PRODUCT_ENTRIES = {
  [`${PREFIX}products`]: JSON.stringify([`https://github.com/${PRODUCT}`]),
  [`${PREFIX}github-token:${PRODUCT}`]: JSON.stringify({ value: "github_pat_PRODUCTTOKEN0123456789abcdefg", name: PRODUCT }),
};

// ==================================================================================================================
// Main flow
// ==================================================================================================================

// given: a fresh browser (nothing stored)
// input: opening #settings
// expect (step 1: "On the settings page, in the section *this browser* (UC-042), the line Notifications says off"): the
//         Notifications heading and state sit inside the section headed "This browser", and the state reads off
test("step 1: the line Notifications sits in the section *this browser*, and says off", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser();
  try {
    const page = await openDashboard({ server, hash: "#settings" });
    const html = page.main();
    const h3At = html.indexOf("<h3>This browser</h3>");
    assert.ok(h3At >= 0, "the section This browser is on the page");
    const sectionCloseAt = html.indexOf("</section>", h3At);
    const notificationsAt = html.indexOf('id="notifications-settings"');
    assert.ok(notificationsAt >= 0, "the Notifications panel is on the page");
    assert.ok(notificationsAt < sectionCloseAt,
      "UC-047 step 1 places Notifications in the section This browser, before that section's own closing tag");

    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    assert.match(box.innerHTML, /<p class="state">off<\/p>/);
  } finally { browser.restore(); }
});

// given: a fresh browser, the browser's permission starting "default"
// input: pressing Switch on, the browser allowing it
// expect (step 1: "The person presses Switch on. The browser asks its own question... the person allows them. The line
//         says on, with Test... and Switch off"): the permission is asked exactly once, directly on the click; once
//         granted, the line reads on and offers Test and Switch off
test("step 1: Switch on asks the browser's permission once, directly on the click, then offers Test and Switch off", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser({ permission: "default" });
  try {
    const page = await openDashboard({ server, hash: "#settings" });
    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    assert.equal(browser.calls.requestPermission, 0, "no page asks the permission before the click");

    const switchOn = box.querySelector("[data-notifications-switch-on]");
    await press(server, switchOn);

    assert.equal(browser.calls.requestPermission, 1, "Switch on asks the permission, once, on the click");
    assert.match(box.innerHTML, /<p class="state">✓ on<\/p>/);
    assert.ok(box.querySelector("[data-notifications-test]"), "Test is offered once on");
    assert.ok(box.querySelector("[data-notifications-switch-off]"), "Switch off is offered once on");
  } finally { browser.restore(); }
});

// given: notifications on, due (last check six minutes old); the instance's real stored GitHub token (every page has one,
//        used for everything else the dashboard does, stored by openDashboard's own default)
// input: opening a review page (#uc)
// expect (step 2: "It derives them... from the files, the records and the tags, and with the token of each"): the check's
//         request for the instance's repository carries the browser's stored token as its Authorization header
test("step 2: the check of the instance connects with the instance's own stored token", async () => {
  const seenAuth = [];
  const browser = installBrowser();
  const server = await repoServer({ files: {}, handlers: [emptyTags,
    (url, init) => { if (url.origin === API) seenAuth.push(init.headers?.Authorization ?? null); return undefined; },
  ] });
  try {
    await openDashboard({
      server, hash: "#uc",
      entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }) },
    });
    assert.ok(seenAuth.length > 0, "the check made at least one request to the instance's API");
    assert.ok(seenAuth.some((a) => a === `Bearer ${TOKEN}`),
      "UC-047 step 2: checked with the instance's own token, as every other read of it is");
  } finally { browser.restore(); }
});

// given: notifications on, due; a product this browser keeps (its own address and its own stored token — PRODUCT_ENTRIES),
//        with something open in its repository
// input: opening a review page (#uc)
// expect (step 2: "...and in each product this browser keeps... with the token of each"): the product's repository is
//         reached at all, and reached with its own token
// TST-279
// Module: MOD-notifications
// Guards: UC-047; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: system
test("TST-279 step 2: the check also reaches each product this browser keeps, with that product's own token", async () => {
  const { instance, product, productAuthorizations } = await withProduct({}, { "docs/use-cases/UC-500-product-thing.md": "# UC-500\n" });
  const browser = installBrowser();
  try {
    await openDashboard({
      server: instance, hash: "#uc",
      entries: { ...PRODUCT_ENTRIES, [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }) },
    });
    assert.ok(product.requests.length > 0,
      "UC-047 step 2: the product this browser keeps is reached by the check — none of its requests arrived");
    assert.ok(productAuthorizations.includes("Bearer github_pat_PRODUCTTOKEN0123456789abcdefg"),
      "UC-047 step 2: the product is reached with its own token");
  } finally { browser.restore(); }
});

// given: a fixture repository with one use case already open; notifications switched on but never checked (checked: null)
// input: opening a review page (#uc)
// expect (step 1/3: "The first check after Switch on tells nothing and takes what waits then as known"): no notification
//         is shown, even though the use case already waits; it is recorded as the baseline all the same
test("step 1 into step 3: the first check after Switch on tells nothing, even though something already waits", async () => {
  const server = await repoServer({ files: { "docs/use-cases/UC-520-sample.md": "# UC-520\n" }, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({
      server, hash: "#uc",
      entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) },
    });
    const shown = captureNotifications();
    await settle(server);
    assert.deepEqual(shown, [], "the first check tells nothing, even though a use case already waits");
    const notified = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`));
    assert.deepEqual(notified[REPO], { "docs/use-cases/UC-520-sample.md": notified[REPO]["docs/use-cases/UC-520-sample.md"] },
      "it is recorded as the baseline all the same");
  } finally { browser.restore(); }
});

// given: notifications on, due; a fixture repository empty at the baseline check; then one use case comes to wait
// input: two checks of the review page, five minutes apart (the second run by hand, browser.tick())
// expect (step 3: "a notification that names it and where it is... a click on it opens the page where it is accepted"):
//         the use case is notified once, with its id in the title and an address this dashboard actually resolves
//         (#uc/<id>) — this also covers 3a: the notification's own title and body already name what waits and where,
//         so the text leads the person even where a click would not
test("step 3 (and 3a): a file come to wait is notified once, naming it and an address this page resolves", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();
    await server.change("docs/use-cases/UC-540-sample.md", "# UC-540\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);

    assert.equal(shown.length, 1, "one notification, for the one file come to wait");
    assert.equal(shown[0].title, "UC-540 waits for your acceptance");
    assert.equal(shown[0].body, REPO, "names where: the repository");
    // dashboard-app.mjs's own productHref always writes a leading "?" (URLSearchParams stringifies empty to ""), even for
    // the instance's own address, where no repo= is needed — the same address format every other link of this page uses.
    assert.equal(shown[0].data.url, new URL("?#uc/UC-540", "https://akmaier.github.io/agent-m/").href,
      "an address this dashboard's own addressOf resolves (3a: the text already names what and where)");
  } finally { browser.restore(); }
});

// given: notifications on, due; a baseline check with nothing open; then four use cases of the same kind come to wait at
//        once
// input: two checks, five minutes apart
// expect (step 3: "When more than three of one kind come at once... one notification names their number instead"): one
//         notification, not four, naming the count and the kind
test("step 3: more than three of one kind in one repository give one notification of their number", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();
    for (const id of ["UC-561", "UC-562", "UC-563", "UC-564"]) await server.change(`docs/use-cases/${id}-sample.md`, `# ${id}\n`);
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);

    assert.equal(shown.length, 1, "one notification, not four");
    assert.equal(shown[0].title, "4 use cases wait for your acceptance");
    assert.equal(shown[0].body, REPO);
  } finally { browser.restore(); }
});

// given: notifications on, due; one use case notified at the baseline check
// input: a second, unchanged check, then a third after the file is edited again (still unaccepted)
// expect (step 4: "nothing is notified twice while it waits; a file changed again comes to wait anew"): the unchanged
//         check notifies nothing further; the file edited again is notified a second time
test("step 4: what was notified is kept — nothing twice while unchanged, a file changed again comes to wait anew", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();
    await server.change("docs/use-cases/UC-580-sample.md", "# UC-580 v1\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "notified once");

    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); // unchanged
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "unchanged: nothing further");

    await server.change("docs/use-cases/UC-580-sample.md", "# UC-580 v2 — edited again, still unaccepted\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 2, "come to wait anew: notified again");
  } finally { browser.restore(); }
});

// ==================================================================================================================
// Alternative flows
// ==================================================================================================================

// given: a fresh browser, the browser's permission starting "default"
// input: pressing Switch on, the browser (or the person) refusing it
// expect (1a: "The line says that notifications are blocked for this site, and where the browser's own site settings
//         allow them; nothing is notified"): the line names the block and where to allow it; Switch on is disabled;
//         nothing is stored
test("1a: the person, or the browser, refuses — the line says blocked, and where to allow it; nothing is stored", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser({ permission: "default" });
  browser.setRequestResult("denied");
  try {
    const page = await openDashboard({ server, hash: "#settings" });
    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    await press(server, box.querySelector("[data-notifications-switch-on]"));

    assert.match(unesc(box.innerHTML), /blocked — notifications are refused for this site; allow them in the browser's own site settings/);
    assert.equal(box.querySelector("[data-notifications-switch-on]").disabled, true, "refused: Switch on is disabled");
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notifications`), null, "nothing is stored");
    void page;
  } finally { browser.restore(); }
});

// given: a fresh browser, navigator reporting an iPhone's Safari not opened from the Home Screen
// input: opening #settings
// expect (1b: "Safari shows notifications only for a site added to the Home Screen; the line says so and how to add
//         it"): the line names the Home Screen and tells the person to add this page to it
test("1b: on an iPhone or iPad not opened from the Home Screen, the line says so and how to add it", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser({ permission: "default", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari" });
  try {
    await openDashboard({ server, hash: "#settings" });
    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    assert.match(box.innerHTML, /Safari shows notifications only for a site added to the Home Screen/);
    assert.match(box.innerHTML, /add this page to the Home Screen, open it from there, then press Switch on/);
  } finally { browser.restore(); }
});

// given: notifications on, last check one minute old — not yet five minutes (MOD-notifications, Interfaces: due())
// input: opening a review page (#uc)
// expect (2a/2b: "nothing is checked"; "the check runs when it runs the page again" — here too, a check only ever runs
//         when this page's own code runs it, never on its own): the stored check time is left exactly as it was; no
//         check ran
test("2a/2b: while not due, opening the page makes no check — the last check time is left exactly as it was", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser();
  const recent = minutesAgo(1);
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: recent }) } });
    const after = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`));
    assert.equal(after.checked, recent, "not due: the check did not run, so its own time was not touched");
  } finally { browser.restore(); }
});

// given: notifications on; one use case already notified at the baseline (so "notified" starts non-empty); the review
//        page's own instance is then made to fail once, on the very next (otherwise due) check — after the page has
//        already loaded, so this failure can only be the check's own second request, never the page's first rendering
// input: a second check that fails, then a third that succeeds
// expect (2c: "a repository... is skipped until the next check... nothing is notified for it in between"): the failed
//         check shows nothing and leaves "notified" exactly as the baseline left it, but still records its own time (so
//         the next check is not retried at once); the next, working check notifies the file missed in between
test("2c: a server that cannot be reached is skipped until the next check; nothing lost, nothing notified in between", async () => {
  let failOnce = false;
  const server = await repoServer({
    files: { "docs/use-cases/UC-600-sample.md": "# UC-600\n" },
    handlers: [emptyTags, (url) => (failOnce && url.origin === API && /\/(commits|git\/(ref|trees)\/)/.test(url.pathname)
      ? (() => { failOnce = false; return new Response("{}", { status: 500 }); })() : undefined)],
  });
  const browser = installBrowser();
  try {
    // first check: baseline, UC-600 recorded as already waiting, notified nothing (checked: null)
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();
    await settle(server);
    const baseline = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`));
    assert.deepEqual(baseline, { [REPO]: { "docs/use-cases/UC-600-sample.md": baseline[REPO]["docs/use-cases/UC-600-sample.md"] } });

    // a second file comes to wait, but the next check's read of the repository fails
    await server.change("docs/use-cases/UC-601-sample.md", "# UC-601\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    failOnce = true;
    browser.tick();
    await settle(server);

    assert.deepEqual(shown, [], "the failed check shows nothing");
    assert.deepEqual(JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notified`)), baseline,
      "notified is kept exactly as the baseline left it — UC-601 not lost, not falsely recorded either");
    const afterFail = JSON.parse(globalThis.localStorage.getItem(`${PREFIX}notifications`));
    assert.notEqual(afterFail.checked, null, "the failed check still records its own time, so it is not retried at once");

    // the next check succeeds and notifies the file that was missed in between
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "the file missed while the server could not be reached is notified once it can be");
    assert.equal(shown[0].title, "UC-601 waits for your acceptance");
  } finally { browser.restore(); }
});

// given: notifications on; something already notified
// input: pressing Switch off
// expect (4a: "The checks stop at once, and what was notified is forgotten"): both keys are gone from the store itself
test("4a: Switch off stops the checks and forgets what was notified", async () => {
  const server = await repoServer({ files: { "docs/use-cases/UC-620-sample.md": "# UC-620\n" } });
  const browser = installBrowser();
  try {
    const page = await openDashboard({
      server, hash: "#settings",
      entries: {
        [`${PREFIX}notifications`]: JSON.stringify({ checked: minutesAgo(6) }),
        [`${PREFIX}notified`]: JSON.stringify({ [REPO]: { "docs/use-cases/UC-620-sample.md": "f".repeat(40) } }),
      },
    });
    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    await press(server, box.querySelector("[data-notifications-switch-off]"));

    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notifications`), null, "notifications is gone from the store itself");
    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notified`), null, "notified is gone from the store itself");
    assert.match(box.innerHTML, /<p class="state">off<\/p>/);
    void page;
  } finally { browser.restore(); }
});
