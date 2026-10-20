// A job of the tab's route names the browser that took it (ITM-1025) — MOD-runtimes' queueJob writes the taking as `tab <browser>`, this browser's identifier (the key `browser` of MOD-browser-store, in the store of
// the instance whose Pages address the tab shows) or, where there is none, this tab's own; liveState reads it: a job another browser took is `reachable: false` with the reason that its live state and log exist only in
// that browser's tab (UC-036 1b), a job this browser took and this tab does not hold is `known: false` (1c), and a bare `tab` is this browser's. As the accepted text of docs/architecture/MOD-runtimes.md states it (:115-122,
// :172, :214-217) and MOD-job-ledger.md:91.
// Run: node --test tests/runtimes-tab-browser.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-036
// Level: unit
//
// A Map-backed localStorage and a location the test sets; the fake host of tests/runtimes-live-fixture.mjs, unchanged. Nothing reaches the network. Readings the texts leave open, which the tests state (the pull request names them):
//   - "sixteen random hexadecimal digits" is the form of every identifier, this browser's and this tab's own: /^[0-9a-f]{16}$/.
//   - Where the tab's address names no instance (a host that is not <owner>.github.io) or localStorage is absent, queueJob keeps this tab's own identifier in memory; the same tab gets the same one every time. The
//     tests do not reset that memory, so they assert only that the identifier of one test is used consistently within it.
//   - liveState only reads: with no `browser` key stored it creates none.
// The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { listJobs, jobState } from "../src/job-ledger/index.mjs";
import { liveState, queueJob } from "../src/runtimes/index.mjs";
import { START, fakeHost } from "./runtimes-live-fixture.mjs";

const INSTANCE = "alice/agent-m";
const KEY = `agent-m:${INSTANCE}:browser`;
const HEX16 = /^[0-9a-f]{16}$/;
const TAB = { kind: "tab" };
const PRODUCT = { host: null };
const realLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
const realStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null, values };
}
function surroundings({ location = { hostname: "alice.github.io", pathname: "/agent-m/" }, storage = memoryStorage() } = {}) {
  Object.defineProperty(globalThis, "location", { value: location, configurable: true, writable: true });
  if (storage === null) delete globalThis.localStorage; else Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return storage;
}
afterEach(() => {
  for (const [name, saved] of [["location", realLocation], ["localStorage", realStorage]]) { if (saved) Object.defineProperty(globalThis, name, saved); else delete globalThis[name]; }
});

/** The `by:` the tab's route wrote for a job queued now. */
async function takenBy(id) {
  const fake = fakeHost({ id: "JOB-20261016-1100-aaaa" });
  await queueJob(fake.host, { ...START, id, route: "tab" }, TAB, fake.head());
  const written = fake.writes.at(-1).files[0].text;
  return /## Taken[\s\S]*?by: (.*)\n/.exec(written)?.[1];
}
/** The record of a job a given `by:` took, read from the fake repository. */
async function recordTakenBy(by) {
  const fake = fakeHost({ taken: by });
  return { fake, record: await fake.record() };
}

// TST-1025001 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036
// given: a tab at alice.github.io/agent-m/ with an empty localStorage
// input: queueJob on the tab's route, twice
// expect: each record's `## Taken` names `tab <browser>`, <browser> sixteen hexadecimal digits; both name the same one; it is stored under the key `browser` of the instance alice/agent-m
test("queueJob on the tab's route names this browser, makes its identifier at first use and keeps it in the instance's store", async () => {
  const storage = surroundings();
  const first = await takenBy("JOB-20261016-1100-0001");
  const second = await takenBy("JOB-20261016-1100-0002");
  assert.match(first, /^tab [0-9a-f]{16}$/);
  assert.equal(second, first);
  assert.equal(JSON.parse(storage.values.get(KEY)), first.slice(4));
});

// TST-1025002 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a store that already holds the identifier 0123456789abcdef under `browser`
// input: queueJob on the tab's route
// expect: the taking is `tab 0123456789abcdef`; the stored value is unchanged
test("queueJob reads the identifier the store already holds", async () => {
  const storage = surroundings();
  storage.setItem(KEY, JSON.stringify("0123456789abcdef"));
  assert.equal(await takenBy("JOB-20261016-1100-0003"), "tab 0123456789abcdef");
  assert.equal(JSON.parse(storage.values.get(KEY)), "0123456789abcdef");
});

// TST-1025003 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a tab whose address names no instance (example.org); and a tab at an instance whose browser has no localStorage
// input: queueJob on the tab's route, twice for each
// expect: the taking is `tab <browser>` of the same form, the same within one tab; nothing is stored
test("without an instance or without localStorage the job is named by this tab's own identifier", async () => {
  const storage = surroundings({ location: { hostname: "example.org", pathname: "/x/" } });
  const own = await takenBy("JOB-20261016-1100-0004");
  assert.match(own, /^tab [0-9a-f]{16}$/);
  assert.equal(await takenBy("JOB-20261016-1100-0005"), own);
  assert.equal(storage.values.size, 0, "nothing is stored");
  surroundings({ storage: null });
  const unavailable = await takenBy("JOB-20261016-1100-0006");
  assert.match(unavailable, /^tab [0-9a-f]{16}$/);
});

// TST-1025004 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-036
// given: this browser's identifier 0123456789abcdef in the store; a job whose `## Taken` is `tab fedcba9876543210`, another browser's, that this tab does not hold
// input: liveState of the record; jobState with that live state; listJobs
// expect: reachable false, known false, with the reason that its live state and log exist only in that browser's tab; the job's state is "running" (the record alone says it); its row says its source is not reachable, with that reason
test("a job another browser took is reachable: false with the note that its live state and log exist only in that browser's tab", async () => {
  surroundings().setItem(KEY, JSON.stringify("0123456789abcdef"));
  const { fake, record } = await recordTakenBy("tab fedcba9876543210");
  const live = await liveState(record, PRODUCT, {});
  assert.equal(live.reachable, false);
  assert.equal(live.known, false);
  assert.match(live.reason, /live state and log exist only in .*browser'?s? tab/i);
  assert.equal(jobState(record, live), "running");
  const snapshot = await fake.host.readSnapshot("trunk");
  const [row] = await listJobs([{ address: "https://github.com/alice/product", snapshot }], new Map([[record.id, live]]));
  assert.equal(row.source.reachable, false);
  assert.match(row.source.reason, /only in .*tab/i);
});

// TST-1025005 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-036
// given: this browser's identifier 0123456789abcdef in the store; a job taken by `tab 0123456789abcdef` that this tab does not hold; and one taken by the bare `tab`
// input: liveState of each; jobState with each
// expect: reachable true and known false for both, so that both are "ended without record"
test("a job this browser took and this tab no longer holds is ended without record, and a bare tab is this browser's", async () => {
  surroundings().setItem(KEY, JSON.stringify("0123456789abcdef"));
  for (const by of ["tab 0123456789abcdef", "tab"]) {
    const { record } = await recordTakenBy(by);
    const live = await liveState(record, PRODUCT, {});
    assert.equal(live.reachable, true, by);
    assert.equal(live.known, false, by);
    assert.equal(live.reason, null, by);
    assert.equal(jobState(record, live), "ended without record", by);
  }
});

// TST-1025006 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: a tab with no instance in its address that queued a job (so this tab's own identifier names it)
// input: liveState of that job's record
// expect: reachable true and known false: the tab's own identifier is this browser's
test("a job named by this tab's own identifier is read as this browser's", async () => {
  surroundings({ location: { hostname: "example.org", pathname: "/x/" } });
  const by = await takenBy("JOB-20261016-1100-0007");
  const { record } = await recordTakenBy(by);
  const live = await liveState(record, PRODUCT, {});
  assert.deepEqual([live.reachable, live.known], [true, false]);
});

// TST-1025007 · level: unit · module: MOD-runtimes
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a store with no `browser` key
// input: liveState of a job taken by `tab fedcba9876543210`
// expect: the store still holds no `browser` key: liveState only reads
test("liveState makes no identifier", async () => {
  const storage = surroundings();
  const { record } = await recordTakenBy("tab fedcba9876543210");
  await liveState(record, PRODUCT, {});
  assert.equal(storage.values.has(KEY), false);
});
