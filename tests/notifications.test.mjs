// The notifications of what waits (ITM-236) — MOD-notifications' interface as the accepted text of
// docs/architecture/MOD-notifications.md states it: notificationState, switchOn, switchOff and watchForAcceptance, with
// the browser's Notification, its service worker and the timer replaced by fakes. testNotification and worker.mjs carry
// no Acceptance line of their own and are not tested here (ITM-236, Acceptance).
// Run: node --test tests/notifications.test.mjs
//
// Module: MOD-notifications
// Guards: UC-047; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). localStorage is a
// Map-backed stand-in installed on globalThis, as tests/browser-store.test.mjs's own does; Notification, navigator and
// setInterval/clearInterval are stood in for by installBrowser() below, restored after each test; watchForAcceptance's
// host is a fake of MOD-repository-hosts' Host carrying a snapshot this file builds directly, never a real fetch.
// waitingForAcceptance itself is the real function of MOD-progress-measures (ITM-235): an "open" file is simply a path
// under docs/use-cases/ with no matching docs/approvals/ record, exactly as MOD-approvals' statuses derives it
// (src/approvals/status.mjs) — no SPEC-change queue path is given, so MOD-spec-changes' queues reads nothing. Nothing
// here sleeps or reaches the network; a check's own promise chain is let settle with one flush of the microtask queue
// (node:timers/promises' setImmediate), never a real wait. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { setImmediate as flushAsync } from "node:timers/promises";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";
import { notificationState, switchOn, switchOff, watchForAcceptance } from "../src/notifications/index.mjs";

const INSTANCE = "akmaier/agent-m";
const sha1 = (s) => createHash("sha1").update(s).digest("hex");
const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();

// ---------------------------------------------------------------- fakes

// A Map-backed localStorage (tests/browser-store.test.mjs's own stand-in).
function memoryStorage() {
  const mem = new Map();
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); },
    get length() { return mem.size; },
    key: (i) => [...mem.keys()][i] ?? null,
  };
}

function openFreshStore() {
  Object.defineProperty(globalThis, "localStorage", { value: memoryStorage(), configurable: true, writable: true });
  return openStore(INSTANCE);
}

// The browser's Notification, navigator.serviceWorker and setInterval/clearInterval, stood in for one test; restore()
// puts back whatever (if anything) was there before. permission starts "granted" unless a test says otherwise.
function installBrowser({ permission = "granted" } = {}) {
  const prior = {
    hadNotification: "Notification" in globalThis, Notification: globalThis.Notification,
    hadNavigator: "navigator" in globalThis, navigator: globalThis.navigator,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
  };
  const calls = { requestPermission: 0, register: 0, unregister: 0 };
  const shown = [];
  let current = permission;
  let requestResult = "granted";
  const registration = {
    active: {},
    showNotification: (title, options) => { shown.push({ title, ...options }); },
    unregister: async () => { calls.unregister++; },
  };
  const serviceWorker = {
    register: async () => { calls.register++; return registration; },
    getRegistration: async () => (calls.register > 0 ? registration : undefined),
  };
  Object.defineProperty(globalThis, "Notification", {
    value: { get permission() { return current; }, requestPermission: async () => { calls.requestPermission++; current = requestResult; return requestResult; } },
    configurable: true, writable: true,
  });
  Object.defineProperty(globalThis, "navigator", { value: { serviceWorker, userAgent: "node" }, configurable: true, writable: true });
  let captured = null;
  globalThis.setInterval = (fn) => { captured = fn; return 1; };
  globalThis.clearInterval = () => {};
  return {
    calls, shown,
    setRequestResult: (r) => { requestResult = r; },
    tick: () => captured(),
    restore() {
      if (prior.hadNotification) globalThis.Notification = prior.Notification; else delete globalThis.Notification;
      if (prior.hadNavigator) globalThis.navigator = prior.navigator; else delete globalThis.navigator;
      globalThis.setInterval = prior.setInterval;
      globalThis.clearInterval = prior.clearInterval;
    },
  };
}

// A fake of MOD-repository-hosts' Host carrying only repositoryInfo and readSnapshot — the two watchForAcceptance calls
// (MOD-notifications, Uses) — over a set of "open" files this test controls directly: a path under docs/use-cases/ with
// no matching docs/approvals/ record reads as open (MOD-approvals' statuses, src/approvals/status.mjs), so a fixture
// needs no approval record and no SPEC-change queue to make a file wait. failNextRead() makes the next repositoryInfo or
// readSnapshot throw once (NotFound/Unreachable/…, MOD-repository-hosts' HostError), as a repository that cannot be read.
function fakeHost() {
  let waiting = [];
  let nextFailure = null;
  return {
    setWaiting(entries) { waiting = entries; },
    failNextRead(error) { nextFailure = error; },
    host: {
      async repositoryInfo() {
        if (nextFailure) { const e = nextFailure; nextFailure = null; throw e; }
        return { defaultBranch: "main", visibility: "public", canWrite: false, archived: false, description: "" };
      },
      async readSnapshot(ref) {
        if (nextFailure) { const e = nextFailure; nextFailure = null; throw e; }
        const blobs = Object.fromEntries(waiting.map((w) => [w.path, w.blob]));
        return { ref, commit: "0".repeat(40), paths: Object.keys(blobs), blob: (p) => blobs[p] ?? null, read: async () => null };
      },
    },
  };
}

// addressOf(route, params, repository) — a fake of the frame's own writer of a review-page address (MOD-notifications,
// Interfaces: watchForAcceptance): deterministic and inspectable, never MOD-review-pages' real routes.
function fakeAddressOf() {
  const calls = [];
  const addressOf = (route, params, repository) => {
    calls.push({ route, params, repository });
    return `https://dashboard.test/${repository}/${route}${params.id ? `/${params.id}` : ""}`;
  };
  return { addressOf, calls };
}

function makePage(store, host, addressOf) {
  return { store, instance: { repository: INSTANCE, host }, addressOf };
}

// ---------------------------------------------------------------- switchOn / switchOff

// guards: NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: a fresh store; the browser's Notification and worker registration stood in for, permission starting "default"
// input: notificationState(store) (before any call); switchOn(store) with the browser refusing ("denied"); switchOn(store)
//        again with the browser allowing ("granted")
// expect: notificationState alone never asks the permission (0 calls); the refusal asks it once, registers no worker and
//         stores nothing; the allowed call asks it once more (one ask per call, only on the call), registers the worker
//         once and stores { checked: null } under "notifications"
test("switchOn asks the browser's permission only on the call, and a refusal stores nothing", async () => {
  const store = openFreshStore();
  const browser = installBrowser({ permission: "default" });
  try {
    const before = notificationState(store);
    assert.equal(browser.calls.requestPermission, 0, "reading the state alone never asks the permission");
    assert.equal(before.on, false);
    assert.equal(before.permission, "default");
    assert.equal(before.available, "here");

    browser.setRequestResult("denied");
    const refused = await switchOn(store);
    assert.equal(browser.calls.requestPermission, 1, "Switch on asks the permission, once, on the call");
    assert.equal(browser.calls.register, 0, "a refusal registers no worker");
    assert.equal(readSetting(store, "notifications"), null, "a refusal stores nothing");
    assert.equal(refused.on, false);
    assert.equal(refused.permission, "denied");

    browser.setRequestResult("granted");
    const allowed = await switchOn(store);
    assert.equal(browser.calls.requestPermission, 2, "asked again, once, on this call");
    assert.equal(browser.calls.register, 1, "granted: the worker is registered");
    assert.deepEqual(readSetting(store, "notifications"), { checked: null }, "granted: the switch is stored, no check made yet");
    assert.equal(allowed.on, true);
    assert.equal(allowed.permission, "granted");
  } finally { browser.restore(); }
});

// guards: A CLEAR IS A REAL CLEAR
// given: a store with "notifications" and "notified" both set, and a registered worker
// input: switchOff(store)
// expect: both keys are gone from the store itself (readSetting answers null for each); the worker is unregistered
test("switchOff removes both notifications and notified, and unregisters the worker", async () => {
  const store = openFreshStore();
  const browser = installBrowser();
  try {
    writeSetting(store, "notifications", { checked: "2026-10-07T09:00:00.000Z" });
    writeSetting(store, "notified", { [INSTANCE]: { "docs/use-cases/UC-050-sample.md": sha1("a") } });
    await globalThis.navigator.serviceWorker.register(); // a worker already registered, for switchOff to find and unregister

    await switchOff(store);
    assert.equal(readSetting(store, "notifications"), null, "notifications is gone from the store itself");
    assert.equal(readSetting(store, "notified"), null, "notified is gone from the store itself");
    assert.equal(browser.calls.unregister, 1, "the worker is unregistered");
  } finally { browser.restore(); }
});

// ---------------------------------------------------------------- watchForAcceptance

// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; UC-047
// given: notifications switched on, never checked (checked: null); one use case already open when the first check runs
// input: watchForAcceptance(page)
// expect: no notification is shown; "notified" records the open use case's path and blob as the new baseline; "checked"
//         is recorded (no longer null)
test("the first check after Switch on notifies nothing, and only records what waits then", async () => {
  const store = openFreshStore();
  writeSetting(store, "notifications", { checked: null });
  const browser = installBrowser();
  const { host, setWaiting } = fakeHost();
  const { addressOf } = fakeAddressOf();
  try {
    const blob = sha1("UC-090@1");
    setWaiting([{ id: "UC-090", path: "docs/use-cases/UC-090-sample.md", blob }]);

    watchForAcceptance(makePage(store, host, addressOf));
    await flushAsync();

    assert.deepEqual(browser.shown, [], "the first check shows nothing");
    assert.deepEqual(readSetting(store, "notified"), { [INSTANCE]: { "docs/use-cases/UC-090-sample.md": blob } });
    assert.notEqual(readSetting(store, "notifications").checked, null, "the check is recorded");
  } finally { browser.restore(); }
});

// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; UC-047
// given: a baseline check with nothing waiting; then one use case comes to wait; then, unchanged, a further check; then
//        the same use case is edited again (a new blob) while still unaccepted
// input: four checks of watchForAcceptance's page, five minutes apart
// expect: the baseline shows nothing; the use case that came to wait is notified once, naming it and the repository,
//         with an address built from its kind and id; the unchanged check notifies nothing more (still just the one);
//         the file edited again is notified anew, as a second, distinct notification
test("a file come to wait is notified once, with its text and address, and a file changed again anew", async () => {
  const store = openFreshStore();
  writeSetting(store, "notifications", { checked: null });
  const browser = installBrowser();
  const { host, setWaiting } = fakeHost();
  const { addressOf, calls: addressCalls } = fakeAddressOf();
  try {
    watchForAcceptance(makePage(store, host, addressOf)); // baseline: nothing waits yet
    await flushAsync();
    assert.deepEqual(browser.shown, [], "baseline check shows nothing");

    writeSetting(store, "notifications", { checked: minutesAgo(6) });
    const blob1 = sha1("UC-070@1");
    setWaiting([{ id: "UC-070", path: "docs/use-cases/UC-070-sample.md", blob: blob1 }]);
    browser.tick();
    await flushAsync();

    assert.equal(browser.shown.length, 1, "the newly waiting file is notified once");
    const first = browser.shown[0];
    assert.equal(first.title, "UC-070 waits for your acceptance");
    assert.equal(first.body, INSTANCE);
    assert.equal(first.tag, `${INSTANCE}:docs/use-cases/UC-070-sample.md:${blob1}`);
    assert.deepEqual(addressCalls.at(-1), { route: "use-case", params: { id: "UC-070" }, repository: INSTANCE });
    assert.equal(first.data.url, addressOf("use-case", { id: "UC-070" }, INSTANCE), "the notification's address is addressOf's own");
    assert.deepEqual(readSetting(store, "notified"), { [INSTANCE]: { "docs/use-cases/UC-070-sample.md": blob1 } });

    writeSetting(store, "notifications", { checked: minutesAgo(6) }); // unchanged: still waiting at blob1
    browser.tick();
    await flushAsync();
    assert.equal(browser.shown.length, 1, "unchanged: nothing further is notified");

    writeSetting(store, "notifications", { checked: minutesAgo(6) });
    const blob2 = sha1("UC-070@2"); // edited again, still unaccepted
    setWaiting([{ id: "UC-070", path: "docs/use-cases/UC-070-sample.md", blob: blob2 }]);
    browser.tick();
    await flushAsync();

    assert.equal(browser.shown.length, 2, "come to wait anew: notified again");
    assert.equal(browser.shown[1].title, "UC-070 waits for your acceptance");
    assert.equal(browser.shown[1].tag, `${INSTANCE}:docs/use-cases/UC-070-sample.md:${blob2}`);
    assert.deepEqual(readSetting(store, "notified"), { [INSTANCE]: { "docs/use-cases/UC-070-sample.md": blob2 } });
  } finally { browser.restore(); }
});

// guards: A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE; UC-047
// given: a baseline check with nothing waiting; then four use cases of the same repository come to wait at once
// input: two checks of watchForAcceptance's page, five minutes apart
// expect: one notification naming their number and kind, not four — with the repository and an address built from the
//         kind alone (the list, no single id)
test("more than three of one kind in one repository give one notification of their number", async () => {
  const store = openFreshStore();
  writeSetting(store, "notifications", { checked: null });
  const browser = installBrowser();
  const { host, setWaiting } = fakeHost();
  const { addressOf, calls: addressCalls } = fakeAddressOf();
  try {
    watchForAcceptance(makePage(store, host, addressOf));
    await flushAsync();
    assert.deepEqual(browser.shown, [], "baseline check shows nothing");

    writeSetting(store, "notifications", { checked: minutesAgo(6) });
    const entries = ["UC-080", "UC-081", "UC-082", "UC-083"].map((id, i) => (
      { id, path: `docs/use-cases/${id}-sample.md`, blob: sha1(`${id}@${i}`) }));
    setWaiting(entries);
    browser.tick();
    await flushAsync();

    assert.equal(browser.shown.length, 1, "one notification, not four");
    assert.equal(browser.shown[0].title, "4 use cases wait for your acceptance");
    assert.equal(browser.shown[0].body, INSTANCE);
    assert.equal(browser.shown[0].tag, `${INSTANCE}:use case`);
    assert.deepEqual(addressCalls.at(-1), { route: "use-case", params: {}, repository: INSTANCE });
    assert.deepEqual(readSetting(store, "notified"), {
      [INSTANCE]: Object.fromEntries(entries.map((e) => [e.path, e.blob])),
    });
  } finally { browser.restore(); }
});

// guards: UC-047
// given: a baseline check with one use case already waiting (so "notified" starts non-empty); the next check's
//        repository cannot be read; the one after that can, with that same use case unchanged and two more come to
//        wait since the baseline
// input: three checks of watchForAcceptance's page, five minutes apart
// expect: the failed check shows nothing and leaves "notified" exactly as the baseline left it — the one already-
//         waiting entry neither dropped nor altered — but still records its own time (so the next check is five
//         minutes later, not retried at once); the following, working check notifies only the two new files, not the
//         unchanged one, and "notified" ends with all three
test("a repository that cannot be read is skipped until the next check", async () => {
  const store = openFreshStore();
  writeSetting(store, "notifications", { checked: null });
  const browser = installBrowser();
  const { host, setWaiting, failNextRead } = fakeHost();
  const { addressOf } = fakeAddressOf();
  try {
    const blob94 = sha1("UC-094@1");
    setWaiting([{ id: "UC-094", path: "docs/use-cases/UC-094-sample.md", blob: blob94 }]);
    watchForAcceptance(makePage(store, host, addressOf));
    await flushAsync();
    const baselineNotified = readSetting(store, "notified");
    assert.deepEqual(baselineNotified, { [INSTANCE]: { "docs/use-cases/UC-094-sample.md": blob94 } });

    const staleChecked = minutesAgo(6);
    writeSetting(store, "notifications", { checked: staleChecked });
    failNextRead(new Error("Unreachable: boom"));
    browser.tick();
    await flushAsync();

    assert.deepEqual(browser.shown, [], "the failed check shows nothing");
    assert.deepEqual(readSetting(store, "notified"), baselineNotified, "notified is kept exactly as the baseline left it");
    const checkedAfterFailure = readSetting(store, "notifications").checked;
    assert.notEqual(checkedAfterFailure, null);
    assert.notEqual(checkedAfterFailure, staleChecked,
      "the check still records its own time, even though this repository failed, so the next try is five minutes later, not at once");

    writeSetting(store, "notifications", { checked: minutesAgo(6) });
    const blobA = sha1("UC-095@1"), blobB = sha1("UC-096@1");
    setWaiting([
      { id: "UC-094", path: "docs/use-cases/UC-094-sample.md", blob: blob94 }, // unchanged since the baseline
      { id: "UC-095", path: "docs/use-cases/UC-095-sample.md", blob: blobA },
      { id: "UC-096", path: "docs/use-cases/UC-096-sample.md", blob: blobB },
    ]);
    browser.tick();
    await flushAsync();

    assert.equal(browser.shown.length, 2, "only the two new files are notified, not the unchanged one");
    assert.deepEqual(new Set(browser.shown.map((n) => n.title)),
      new Set(["UC-095 waits for your acceptance", "UC-096 waits for your acceptance"]));
    assert.deepEqual(readSetting(store, "notified"), {
      [INSTANCE]: {
        "docs/use-cases/UC-094-sample.md": blob94,
        "docs/use-cases/UC-095-sample.md": blobA,
        "docs/use-cases/UC-096-sample.md": blobB,
      },
    });
  } finally { browser.restore(); }
});
