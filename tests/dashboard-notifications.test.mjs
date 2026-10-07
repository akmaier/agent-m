// The release tests of A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE and NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// (ITM-246): SPEC.md names this file, which did not exist, as both requirements' own Check, with the cases its two Check
// lines state — through the settings and review pages as the dashboard reaches MOD-notifications since the change
// between jobs #157 (docs/assets/dashboard/settings-view.mjs, docs/assets/dashboard-app.mjs, src/home/home.mjs) —
// reached the way ITM-238's tests reach them: tests/app-harness.mjs's repoServer and openDashboard, a browser's
// Notification/navigator/setInterval stood in for the way tests/dashboard-notifications-wiring.test.mjs's own
// installBrowser() does, never a real timer. Every expected result is the requirement's own, from SPEC.md and UC-047,
// not from the code; MOD-notifications' own checking logic (the timing, the grouping past three, the dedupe) is
// unit-tested by tests/notifications.test.mjs and is not repeated here.
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

// ==================================================================================================================
// A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// ==================================================================================================================

// given: a fixture instance; notifications on, due for a second check
// input: a use case and a SPEC change entry both come to open since the baseline check; the second check
// expect: one notification for the use case and one for the SPEC change entry — each names the file and links the
//         page where it is accepted (its own review page, through this dashboard's addressOf)
test("A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE — a newly open use case and a newly open SPEC change are each notified, naming the file and linking where it is accepted", async () => {
  const server = await repoServer({ files: {} });
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
  const server = await repoServer({ files: {} });
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
  const server = await repoServer({ files: { "docs/use-cases/UC-932-sample.md": "# UC-932\n" } });
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

// given: a fresh browser; the person on the review page (#uc) before ever visiting settings
// input: navigating #uc, then #settings — no click yet; then pressing Switch on
// expect: no page asks the browser's permission before the click; the click on Switch on asks it, once
test("NOTIFICATIONS ARE SWITCHED ON BY THE PERSON — no page asks before the click; the click asks once", async () => {
  const server = await repoServer({ files: {} });
  const browser = installBrowser({ permission: "default" });
  try {
    const page = await openDashboard({ server, hash: "#uc" });
    assert.equal(browser.calls.requestPermission, 0, "the review page alone does not ask");
    await page.go("#settings");
    assert.equal(browser.calls.requestPermission, 0, "opening settings alone does not ask either");

    const dom = richDocument();
    const box = dom.byId("notifications-settings");
    await press(server, box.querySelector("[data-notifications-switch-on]"));
    assert.equal(browser.calls.requestPermission, 1, "the click asks the permission, once");
  } finally { browser.restore(); }
});
