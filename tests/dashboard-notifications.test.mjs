// The release tests of A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE and NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// (ITM-246): SPEC.md names this file, which did not exist, as both requirements' own Check, with the cases its two Check
// lines state — through the main, settings and review pages as the dashboard reaches MOD-notifications since the change
// between jobs #157 (docs/assets/dashboard/settings-view.mjs, docs/assets/dashboard-app.mjs, src/home/home.mjs) —
// reached the way ITM-238's tests reach them: tests/app-harness.mjs's repoServer and openDashboard for the settings and
// review pages; the main page, src/home/home.mjs, has no test harness of its own (unlike docs/assets/dashboard-app.mjs's
// app-harness.mjs), so openMainPage below brings the small environment its start() needs, the same shape tests/
// dashboard-notifications-wiring.test.mjs's own main-page tests do — a local copy here, not a change to that file or to
// tests/app-harness.mjs. A browser's Notification/navigator/setInterval stood in for the way that file's own
// installBrowser() does, never a real timer. Every expected result is the requirement's own, from SPEC.md and UC-047,
// not from the code; MOD-notifications' own checking logic (the timing, the grouping past three, the dedupe) is
// unit-tested by tests/notifications.test.mjs and is not repeated here.
//
// Corrected after sprint 10's gate (docs/gates/20261007-1603-development-release-testing-9980.md, pull request #181):
// the main page, src/home/home.mjs, also runs MOD-notifications' checks (UC-047 step 2) and the item's Acceptance names
// it beside the review pages; the test of NOTIFICATIONS ARE SWITCHED ON BY THE PERSON below now opens it first, before
// the review and settings pages, and checks that it asks for the permission no more than they do.
//
// Written by developer-sonnet-e, the release tester of docs/instructions/developers.md's "An item of release or system
// tests", who implemented none of UC-047 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER).
//
// Run: node --test tests/dashboard-notifications.test.mjs
//
// Module: MOD-notifications
// Guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// Level: release

import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, openDashboard, richDocument, press, settle, REPO } from "./app-harness.mjs";

const PREFIX = `agent-m:${REPO}:`; // MOD-browser-store's own prefix of the instance (store.mjs prefixOf)
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const emptyTags = (url) => (url.origin === "https://api.github.com" && /\/tags$/.test(url.pathname)
  ? new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }) : undefined);

// ---------------------------------------------------------------- the browser, as tests/dashboard-notifications-
// ---------------------------------------------------------------- wiring.test.mjs's own installBrowser() stands in
// ---------------------------------------------------------------- for it (not a change to that shared file; each file
// ---------------------------------------------------------------- of this codebase's release tests keeps its own copy).

function installBrowser({ permission = "granted" } = {}) {
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
    value: { serviceWorker: { register: async () => registration, getRegistration: async () => registration }, userAgent: "node" },
    configurable: true, writable: true,
  });
  let captured = null;
  globalThis.setInterval = (fn, ms) => { captured = fn; calls.setInterval.push({ fn, ms }); return 1; };
  globalThis.clearInterval = () => {};
  return {
    calls,
    tick: () => captured(), // a second check, run by hand — never a real wait
    restore() {
      if (prior.hadNotification) globalThis.Notification = prior.Notification; else delete globalThis.Notification;
      if (prior.hadNavigator) globalThis.navigator = prior.navigator; else delete globalThis.navigator;
      globalThis.setInterval = prior.setInterval;
      globalThis.clearInterval = prior.clearInterval;
    },
  };
}

// A page that can show a real notification — this harness's document has no baseURI and installBrowser()'s own worker
// registration does nothing; both are added here, locally, on the document openDashboard just created (not a change to
// tests/app-harness.mjs), the same way tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs's own
// captureNotifications() does.
function captureNotifications() {
  Object.defineProperty(globalThis.document, "baseURI", { value: "https://akmaier.github.io/agent-m/", configurable: true });
  const shown = [];
  const registration = { showNotification: (title, options) => shown.push({ title, ...options }) };
  Object.defineProperty(globalThis.navigator.serviceWorker, "register", { value: async () => registration, configurable: true });
  Object.defineProperty(globalThis.navigator.serviceWorker, "getRegistration", { value: async () => registration, configurable: true });
  return shown;
}

// One open SPEC change queue entry, in the files MOD-spec-changes' queues() reads them from (its index.md: the title,
// the target line, and one row of its entry table; the entry's own proposal file, named "<nr>-*.md") — the same
// minimal shape tests/progress-measures-waiting-for-acceptance.test.mjs's own queueFixture() builds and is proven
// against the real schema reader, trimmed to the one open row this file needs; no entscheidungen.md and no approval
// record under docs/approvals/, so the entry's state is open (MOD-spec-changes' entryOf). Its id is "spec-<folder>-<nr>"
// (MOD-progress-measures' waitingForAcceptance).
function specChangeFiles(folder, nr) {
  const base = `docs/spec-freigaben/${folder}`;
  return {
    [`${base}/index.md`]: [
      `# SPEC approvals — queue ${folder} · sample queue`,
      "",
      "**Zieldatei aller Einträge:** `SPEC.md`",
      "",
      "| Nr | Datei | Anker (Überschrift, wortgetreu) | bis (exklusiv) | Commits |",
      "|---|---|---|---|---|",
      `| ${nr} | \`SPEC.md\` | ## Sample section | — | — |`,
      "",
    ].join("\n"),
    [`${base}/${nr}-sample-entry.md`]: "## Sample section\nSample proposal text.\n",
  };
}

// ---------------------------------------------------------------- the main page's own small environment (UC-047) —
// ---------------------------------------------------------------- src/home/home.mjs has no test harness of its own,
// ---------------------------------------------------------------- unlike docs/assets/dashboard-app.mjs's app-
// ---------------------------------------------------------------- harness.mjs: the same shape tests/dashboard-
// ---------------------------------------------------------------- notifications-wiring.test.mjs's own main-page tests
// ---------------------------------------------------------------- bring, a local copy here (not a change to that file
// ---------------------------------------------------------------- or to tests/app-harness.mjs). home.mjs only ever
// ---------------------------------------------------------------- assigns .innerHTML, never queries a control back out
// ---------------------------------------------------------------- of one, so a plain, settable element is enough.

function fakeMainPageDom() {
  const els = new Map();
  return { getElementById: (id) => { if (!els.has(id)) els.set(id, { innerHTML: "" }); return els.get(id); } };
}

// Loads src/home/home.mjs fresh, with the small environment its start() needs (document, location, localStorage,
// fetch) installed, lets it settle, then restores exactly what was there before — document, location, localStorage
// and fetch only; installBrowser()'s own Notification/navigator/setInterval stand, since the caller still reads
// browser.calls.requestPermission afterwards. entries: further settings in this browser, the same shape openDashboard's
// own `entries` takes.
async function openMainPage({ server, entries = {} }) {
  const hadDocument = "document" in globalThis, priorDocument = globalThis.document;
  const hadLocation = "location" in globalThis, priorLocation = globalThis.location;
  const priorLocalStorage = globalThis.localStorage, priorFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "document", { value: fakeMainPageDom(), configurable: true, writable: true });
  Object.defineProperty(globalThis, "location", {
    value: { hostname: "akmaier.github.io", pathname: "/agent-m/", href: "https://akmaier.github.io/agent-m/" },
    configurable: true, writable: true,
  });
  const mem = new Map(Object.entries(entries));
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => { mem.set(k, String(v)); }, removeItem: (k) => { mem.delete(k); },
      get length() { return mem.size; }, key: (i) => [...mem.keys()][i] ?? null,
    },
    configurable: true, writable: true,
  });
  globalThis.fetch = server.fetch;
  try {
    await import(new URL(`../src/home/home.mjs?load=${Date.now()}-${Math.random()}`, import.meta.url));
    await settle(server);
  } finally {
    if (hadDocument) globalThis.document = priorDocument; else delete globalThis.document;
    if (hadLocation) globalThis.location = priorLocation; else delete globalThis.location;
    globalThis.localStorage = priorLocalStorage;
    globalThis.fetch = priorFetch;
  }
}

// ==================================================================================================================
// A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// ==================================================================================================================

// given: a fixture instance; notifications on, due for a second check
// input: a use case and a SPEC change entry both come to open since the baseline check; the second check
// expect: one notification for the use case and one for the SPEC change entry — each names the file and links the
//         page where it is accepted (its own review page, through this dashboard's addressOf)
test("A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();

    await server.change("docs/use-cases/UC-930-sample.md", "# UC-930\n");
    for (const [path, text] of Object.entries(specChangeFiles("2026-10-07_sample", "01"))) await server.change(path, text);
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);

    assert.equal(shown.length, 2, "one notification for the use case, one for the SPEC change entry — not grouped: each kind's own count is one");
    const byTitle = Object.fromEntries(shown.map((n) => [n.title, n]));

    assert.ok(byTitle["UC-930 waits for your acceptance"], "names the use case that came to wait");
    assert.equal(byTitle["UC-930 waits for your acceptance"].body, REPO, "names the repository it is in");
    assert.equal(byTitle["UC-930 waits for your acceptance"].data.url,
      new URL("?#uc/UC-930", "https://akmaier.github.io/agent-m/").href, "links to the page where it is accepted");

    assert.ok(byTitle["spec-2026-10-07_sample-01 waits for your acceptance"], "names the SPEC change entry that came to open");
    assert.equal(byTitle["spec-2026-10-07_sample-01 waits for your acceptance"].body, REPO, "names the repository it is in");
    assert.equal(byTitle["spec-2026-10-07_sample-01 waits for your acceptance"].data.url,
      new URL("?#spec/2026-10-07_sample/01", "https://akmaier.github.io/agent-m/").href, "links to the page where it is accepted");
  } finally { browser.restore(); }
});

// given: a fixture instance; a use case already notified at a prior, due check
// input: a further check with nothing changed since
// expect: no further notification — a file already notified yields none
test("A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a file already notified yields no further notification", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc", entries: { [`${PREFIX}notifications`]: JSON.stringify({ checked: null }) } });
    const shown = captureNotifications();
    await server.change("docs/use-cases/UC-931-sample.md", "# UC-931\n");
    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) }));
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "notified once");

    globalThis.localStorage.setItem(`${PREFIX}notifications`, JSON.stringify({ checked: minutesAgo(6) })); // unchanged since
    browser.tick();
    await settle(server);
    assert.equal(shown.length, 1, "already notified, nothing changed since: no further notification");
  } finally { browser.restore(); }
});

// given: a fixture repository with a use case already waiting; notifications never switched on (no "notifications" key
//        stored at all — the state Switch off leaves, too)
// input: opening a review page, where a check would otherwise be due
// expect: nothing is notified — notifications switched off yields none
test("A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — notifications switched off yields no notification", async () => {
  const server = await repoServer({ files: { "docs/use-cases/UC-932-sample.md": "# UC-932\n" }, handlers: [emptyTags] });
  const browser = installBrowser();
  try {
    await openDashboard({ server, hash: "#uc" }); // no "notifications" entry: switched off
    const shown = captureNotifications();
    await settle(server);

    assert.equal(globalThis.localStorage.getItem(`${PREFIX}notifications`), null, "switched off: nothing stored");
    assert.deepEqual(shown, [], "switched off: nothing is notified, even though a use case waits");
  } finally { browser.restore(); }
});

// ==================================================================================================================
// NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// ==================================================================================================================

// given: a fresh browser; the person on the main page before ever visiting the dashboard's own pages
// input: loading the main page (src/home/home.mjs), then the review page (#uc), then #settings — no click yet; then
//        pressing Switch on
// expect: no page of the dashboard asks for the permission before the click — the main page, src/home/home.mjs, as
//         well as the review pages, each of which starts MOD-notifications' checks (the item's Acceptance, corrected
//         after docs/gates/20261007-1603-development-release-testing-9980.md) —; the click on Switch on asks it, once
test("NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page, the main page among them, asks before the click; the click asks once", async () => {
  const server = await repoServer({ files: {}, handlers: [emptyTags] });
  const browser = installBrowser({ permission: "default" });
  try {
    await openMainPage({ server });
    assert.equal(browser.calls.requestPermission, 0, "the main page alone does not ask");

    const page = await openDashboard({ server, hash: "#uc" });
    assert.equal(browser.calls.requestPermission, 0, "the review page alone does not ask either");
    await page.go("#settings");
    assert.equal(browser.calls.requestPermission, 0, "opening settings alone does not ask either");

    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    await press(server, box.querySelector("[data-notifications-switch-on]"));
    assert.equal(browser.calls.requestPermission, 1, "the click asks the permission, once");
  } finally { browser.restore(); }
});
