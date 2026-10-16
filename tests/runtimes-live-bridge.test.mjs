// A Bridge job's live state, its log and its cancel (ITM-545) — MOD-runtimes' `liveState(record, product, bridges)`, `jobLog(record, product, bridges)` and `cancelJob(record, product, bridges)`
// for a job whose record's `## Taken` `by:` is a Bridge's name, as the accepted text of docs/architecture/MOD-runtimes.md states it (Interfaces) and ITM-545's Outcome settles it, for UC-049
// and UC-036. The CI route, the tab's route and a job no runtime has taken are tests/runtimes-live-state.test.mjs and tests/runtimes-live-tab.test.mjs.
// Run: node --test tests/runtimes-live-bridge.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DASHBOARD SHOWS EVERY JOB; A CANCELLED JOB WRITES NOTHING MORE; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The readings, each from ITM-545's Outcome:
//   - The job is the one among `bridgeJobs(bridge)` whose `id` is the record's id ("the job with the record's id"); the Bridge is the one named by the record's `by:`, among `bridges`.
//   - `running` is true while its `state` is `running` and false for another state; `usage` is its `usage`; `known` is true for a job the Bridge lists ("`known: false` where the Bridge lists no
//     such job"); `cancelling` is false, `log` is null and `writtenAfterCancel` is [] (the Outcome names no value for them, and a job the runtime does not know has these).
//   - A Bridge missing from `bridges`, or one that does not answer, gives `reachable: false` with the client's reason: the `message` of the client's failure; for a Bridge missing there is no
//     client, and the reason is a text.
//   - `jobLog` gives `{ stream }`; the stream asks `bridgeJobLog(bridge, id, from)` from line 0, yields each line (one string at a time, in order), and asks again from the answer's `next` until
//     its `ended` is true; it asks no more after that.
//   - `cancelJob` asks `cancelOnBridge(bridge, id)` once; where the answer's `confirmed` is true it appends the end `cancelled` as ITM-535's cancel does (one commit on the default branch on the
//     head read, the message `Job <id>: end`, no results, no draft, no rounds, no usage, the cost `{ known: false, usage: null }`, the reason `cancelled by a person`, no `log`) and gives
//     "cancelled"; otherwise it gives "cancelling" and commits nothing.
//   - Where the Bridge's own failure meets `jobLog` or `cancelJob` — a job it does not know, no answer, a refused token —, the client's failure is thrown unchanged, by its name, and nothing is
//     committed. A Bridge missing from `bridges` is refused by them with a RuntimeError named NotFound whose `what` is the Bridge's name (as ITM-535 refuses a CI run it cannot find).
// The fixture Bridge is the stand-in for `fetch` of tests/runtimes-live-bridge-fixture.mjs, the repository server the fake host of tests/runtimes-live-fixture.mjs, the record is read back with
// MOD-job-ledger; no request reaches the network, and a request that is not for the fixture Bridge fails the test. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { bridgeAt } from "../src/bridge-client/index.mjs";
import { RECORD_PATH, START, ciRun, fakeHost, fetched, restoreFetch, spyOnFetch } from "./runtimes-live-fixture.mjs";
import { BRIDGES, BRIDGE_ADDRESS, BRIDGE_TOKEN, bridgeRow, fixtureBridge } from "./runtimes-live-bridge-fixture.mjs";

let current = null;
const install = (options) => (current = fixtureBridge(options));
test.beforeEach(() => { current = null; spyOnFetch(); });
test.afterEach(() => {
  const spied = [...fetched];
  restoreFetch();
  assert.deepEqual(spied, [], "no request reached the network");
  assert.deepEqual(current?.stray ?? [], [], "no request that was not for the fixture Bridge");
});

const ID = START.id;
const UNKNOWN = { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] };
const UNREACHABLE = (reason) => ({ ...UNKNOWN, reachable: false, reason });
const JOBS_URL = `${BRIDGE_ADDRESS}/v1/jobs`;
const LOG_URL = (from) => `${BRIDGE_ADDRESS}/v1/jobs/${ID}/log?from=${from}`;
const CANCEL_URL = `${BRIDGE_ADDRESS}/v1/jobs/${ID}/cancel`;
const job = (extra = {}) => ({ row: bridgeRow(ID, "running", { tokens: 12 }), lines: [], ended: false, ...extra });
const live = async (fake, bridges = BRIDGES) => runtimes.liveState(await fake.record(), { host: fake.host }, bridges);
const follow = async (fake, bridges = BRIDGES) => {
  const log = await runtimes.jobLog(await fake.record(), { host: fake.host }, bridges);
  assert.deepEqual(Object.keys(log), ["stream"], "the log is { stream }");
  assert.equal(typeof log.stream[Symbol.asyncIterator], "function", "the stream is an async iterable");
  const lines = [];
  for await (const line of log.stream) lines.push(line);
  return lines;
};
const cancel = async (fake, bridges = BRIDGES) => runtimes.cancelJob(await fake.record(), { host: fake.host }, bridges);
const named = (name, fields = {}) => (error) => error?.name === name && Object.entries(fields).every(([key, value]) => error[key] === value);

// TST-545001 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by the Bridge `lab-pc`, which is among the Bridges; the Bridge lists another job JOB-OTHER (running, usage { tokens: 99 }) before the job, whose state is in turn running, done, failed, cancelled, with usage { tokens: 12 }
// input: liveState
// expect: for running: { reachable: true, reason: null, known: true, running: true, cancelling: false, log: null, usage: { tokens: 12 }, writtenAfterCancel: [] }; for done, failed and cancelled the same with running: false — never JOB-OTHER's usage; one request each, GET http://localhost:4712/v1/jobs with the token "token-lab-pc-545"; no CI call and no commit
test("liveState — a job taken on a Bridge is the job of the Bridge's list with its identifier: running while its state is running, with its usage", async () => {
  for (const [state, running] of [["running", true], ["done", false], ["failed", false], ["cancelled", false]]) {
    const fake = fakeHost({ taken: "lab-pc", runs: [ciRun(7, "running")] });
    const bridge = install({ jobs: [{ row: bridgeRow("JOB-OTHER", "running", { tokens: 99 }) }, job({ row: bridgeRow(ID, state, { tokens: 12 }) })] });
    assert.deepEqual(await live(fake), { reachable: true, reason: null, known: true, running, cancelling: false, log: null, usage: { tokens: 12 }, writtenAfterCancel: [] }, `the job is ${state}`);
    assert.deepEqual(bridge.requests.map(({ method, url, token }) => [method, url, token]), [["GET", JOBS_URL, "token-lab-pc-545"]], `asked once, for the list, when the job is ${state}`);
    assert.deepEqual([fake.calls, fake.writes.length], [[], 0], "no CI call, no commit");
  }
});

// TST-545002 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by `lab-pc`; known positive first — the Bridge lists the job; then a Bridge that lists only JOB-OTHER (running), and one that lists no job
// input: liveState
// expect: with the job listed: known true; without it: { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] } for both — JOB-OTHER, the only one listed, is never taken for the job
test("liveState — a job the Bridge does not list is unknown, and another job is not taken for it", async () => {
  const fake = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job()] });
  assert.equal((await live(fake)).known, true, "known positive");
  install({ jobs: [{ row: bridgeRow("JOB-OTHER", "running", { tokens: 99 }) }] });
  assert.deepEqual(await live(fake), UNKNOWN);
  install({ jobs: [] });
  assert.deepEqual(await live(fake), UNKNOWN);
});

// TST-545003 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by `lab-pc`; known positive first — the Bridge answers; then (a) `bridges` holds only `other-box`, (b) `bridges` is empty, and the job is taken by "toString", (c) the Bridge is not running (fetch throws "connection refused"), (d) the Bridge refuses the token (401)
// input: liveState in each case
// expect: the known positive is reachable; no case throws: (a) and (b) { reachable: false, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] } with a reason that is a non-empty text, and no request made; (c) the same with the reason "The Bridge gave no answer: connection refused"; (d) the same with the reason "The Bridge refused its pairing token."
test("liveState — a Bridge missing from the Bridges, or one that does not answer, gives reachable false and the client's reason, never an error", async () => {
  const fake = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job()] });
  assert.equal((await live(fake)).reachable, true, "known positive");

  for (const [bridges, taken] of [[{ "other-box": BRIDGES["lab-pc"] }, "lab-pc"], [{}, "toString"]]) {
    const missing = fakeHost({ taken });
    const bridge = install({ jobs: [job()] });
    const state = await live(missing, bridges);
    const { reason, ...rest } = state;
    assert.deepEqual(rest, { reachable: false, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }, `${taken} is not among the Bridges`);
    assert.ok(typeof reason === "string" && reason.length > 0, `a reason is a text (${taken})`);
    assert.deepEqual(bridge.requests, [], `no request is made for ${taken}`);
  }

  install({ jobs: [job()], outage: "connection refused" });
  assert.deepEqual(await live(fake), UNREACHABLE("The Bridge gave no answer: connection refused"));

  install({ jobs: [job()] });
  assert.deepEqual(await live(fake, { "lab-pc": bridgeAt({ address: BRIDGE_ADDRESS, token: `${BRIDGE_TOKEN}-other` }) }), UNREACHABLE("The Bridge refused its pairing token."));
});

// TST-545004 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by `lab-pc` whose log the Bridge answers in turn with { lines: ["one","two"], next: 2, ended: false }, { lines: ["three"], next: 3, ended: false }, { lines: [], next: 3, ended: true }
// input: jobLog; the stream read to its end
// expect: jobLog gives an object with the one key stream, an async iterable; the lines yielded, in order, are "one", "two", "three" — each its own string; the requests are GET http://localhost:4712/v1/jobs/JOB-20261016-1100-c0de/log?from=0, then ?from=2, then ?from=3, each with the token, and no fourth after ended
test("jobLog — a job taken on a Bridge gives a stream that asks the log from line 0 and again from next, yielding each line, until ended", async () => {
  const fake = fakeHost({ taken: "lab-pc" });
  const bridge = install({ jobs: [job({ script: [{ lines: ["one", "two"], next: 2, ended: false }, { lines: ["three"], next: 3, ended: false }, { lines: [], next: 3, ended: true }] })] });
  assert.deepEqual(await follow(fake), ["one", "two", "three"]);
  assert.deepEqual(bridge.requests.map(({ method, url, token }) => [method, url, token]), [0, 2, 3].map((from) => ["GET", LOG_URL(from), "token-lab-pc-545"]));
  assert.deepEqual([fake.calls, fake.writes.length], [[], 0], "no CI call, no commit");
});

// TST-545005 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by `lab-pc`; (a) the Bridge answers { lines: ["a"], next: 5, ended: false } and then { lines: ["b"], next: 6, ended: true }; (b) it answers { lines: ["x","y"], next: 2, ended: true } at once; (c) it answers { lines: [], next: 0, ended: true } at once
// input: jobLog; the stream read to its end
// expect: (a) the lines "a", "b", and the requests ?from=0 then ?from=5 — the line the answer's next names, not the one after the lines yielded; (b) "x", "y" and one request, ?from=0; (c) no line and one request
test("jobLog — the next ask is from the answer's next, and none follows an ended answer", async () => {
  const cases = [
    [[{ lines: ["a"], next: 5, ended: false }, { lines: ["b"], next: 6, ended: true }], ["a", "b"], [0, 5]],
    [[{ lines: ["x", "y"], next: 2, ended: true }], ["x", "y"], [0]],
    [[{ lines: [], next: 0, ended: true }], [], [0]],
  ];
  for (const [script, lines, froms] of cases) {
    const fake = fakeHost({ taken: "lab-pc" });
    const bridge = install({ jobs: [job({ script })] });
    assert.deepEqual(await follow(fake), lines, JSON.stringify(lines));
    assert.deepEqual(bridge.requests.map((request) => request.url), froms.map(LOG_URL), JSON.stringify(froms));
  }
});

// TST-545006 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// given: a job taken by `lab-pc`; known positive first — the Bridge knows the job and ends its log; then (a) the Bridge does not know the job (404 not-found "No job JOB-20261016-1100-c0de."), (b) it is not running (fetch throws "connection refused"), (c) it refuses the token (401), (d) `bridges` holds only `other-box`, and `bridges` is empty for a job taken by "toString"
// input: jobLog, the stream read to its end
// expect: the known positive yields "only"; (a) rejects with BridgeFailed whose error is "not-found" and message "No job JOB-20261016-1100-c0de."; (b) NoAnswer; (c) TokenRefused; (d) a RuntimeError named NotFound whose what is "lab-pc", and for "toString" whose what is "toString", and no request made; no case commits anything
test("jobLog — the client's failures are thrown by name, and a Bridge missing from the Bridges is NotFound", async () => {
  const fake = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job({ lines: ["only"], ended: true })] });
  assert.deepEqual(await follow(fake), ["only"], "known positive");

  install({ jobs: [] });
  await assert.rejects(follow(fake), (error) => named("BridgeFailed", { error: "not-found", message: `No job ${ID}.` })(error));
  install({ jobs: [job()], outage: "connection refused" });
  await assert.rejects(follow(fake), named("NoAnswer"));
  install({ jobs: [job()] });
  await assert.rejects(follow(fake, { "lab-pc": bridgeAt({ address: BRIDGE_ADDRESS, token: "another-token" }) }), named("TokenRefused"));
  const bridge = install({ jobs: [job()] });
  await assert.rejects(follow(fake, { "other-box": BRIDGES["lab-pc"] }), (error) => error instanceof runtimes.RuntimeError && named("NotFound", { what: "lab-pc" })(error));
  const inherited = fakeHost({ taken: "toString" });
  await assert.rejects(follow(inherited, {}), (error) => error instanceof runtimes.RuntimeError && named("NotFound", { what: "toString" })(error));
  assert.deepEqual(bridge.requests, [], "no request for a Bridge that is not among the Bridges");
  assert.equal(fake.writes.length, 0, "nothing committed");
});

// TST-545007 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job taken by `lab-pc`, running, at head c0; the Bridge confirms the cancel ({ confirmed: true })
// input: cancelJob; then cancelJob again on the record read afresh
// expect: "cancelled"; one request, POST http://localhost:4712/v1/jobs/JOB-20261016-1100-c0de/cancel with the token, made while no commit had been written; then one commit on `trunk` with expectedHead c0, of docs/jobs/JOB-20261016-1100-c0de.md alone, with the message "Job JOB-20261016-1100-c0de: end"; the record read back is still taken by lab-pc and has the end { state: "cancelled", results: [], draft: null, usage: null, reason: "cancelled by a person", log: null }; no CI call; a second cancel is refused with RecordEnded and the record still has one commit
test("cancelJob — a job on a Bridge is cancelled at the Bridge and, once it confirms, ended as cancelled with one commit", async () => {
  const fake = fakeHost({ taken: "lab-pc" });
  const writesAtRequest = [];
  const bridge = install({ jobs: [job()], onRequest: () => writesAtRequest.push(fake.writes.length) });
  assert.equal(await cancel(fake), "cancelled");
  assert.deepEqual(bridge.requests.map(({ method, url, token }) => [method, url, token]), [["POST", CANCEL_URL, "token-lab-pc-545"]]);
  assert.deepEqual(writesAtRequest, [0], "the Bridge was asked before anything was committed");
  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.deepEqual([change.branch, change.expectedHead, change.files.map((file) => file.path), change.message], ["trunk", "c0", [RECORD_PATH], `Job ${ID}: end`]);
  const record = await fake.record();
  assert.equal(record.taken.by, "lab-pc");
  const { state, results, draft, usage, reason, log } = record.end;
  assert.deepEqual({ state, results, draft, usage, reason, log }, { state: "cancelled", results: [], draft: null, usage: null, reason: "cancelled by a person", log: null });
  assert.deepEqual(fake.calls, [], "no CI call");
  await assert.rejects(cancel(fake), named("RecordEnded"));
  assert.equal(fake.writes.length, 1, "after the end nothing more is written");
});

// TST-545008 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job taken by `lab-pc`, running; the Bridge answers the cancel { confirmed: false }; known positive first — the same job where the Bridge confirms
// input: cancelJob
// expect: the known positive gives "cancelled" with one commit; with { confirmed: false }: "cancelling", one request (POST …/cancel), no commit asked for (not even a refused one), and the record has no end
test("cancelJob — while the Bridge has not confirmed it gives cancelling and appends nothing", async () => {
  const positive = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job()] });
  assert.equal(await cancel(positive), "cancelled", "known positive");
  assert.equal(positive.writes.length, 1);

  const fake = fakeHost({ taken: "lab-pc" });
  const bridge = install({ jobs: [job({ confirm: false })] });
  assert.equal(await cancel(fake), "cancelling");
  assert.deepEqual(bridge.requests.map(({ method, url }) => [method, url]), [["POST", CANCEL_URL]]);
  assert.deepEqual([fake.writes.length, fake.attempts], [0, []], "nothing appended");
  assert.equal((await fake.record()).end, null);
});

// TST-545009 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// given: a job taken by `lab-pc`; (a) the Bridge does not know the job (404 not-found "No job JOB-20261016-1100-c0de."), (b) it is not running (fetch throws "connection refused"), (c) it refuses the token (401), (d) `bridges` holds only `other-box`, and `bridges` is empty for a job taken by "toString", (e) it confirms but the commit of the end is refused with Moved (head c9)
// input: cancelJob in each case
// expect: (a) rejects with BridgeFailed, error "not-found", message "No job JOB-20261016-1100-c0de."; (b) NoAnswer; (c) TokenRefused; each with no commit asked for; (d) a RuntimeError named NotFound whose what is "lab-pc", and for "toString" whose what is "toString", no request made, no commit asked for; (e) rejects with Moved whose head is "c9", the Bridge having been asked once
test("cancelJob — the client's failures and a moved head are thrown by name, a Bridge missing from the Bridges is NotFound, and nothing is committed but the end", async () => {
  const none = (fake) => assert.deepEqual([fake.writes.length, fake.attempts], [0, []], "nothing committed");

  const unknown = fakeHost({ taken: "lab-pc" });
  install({ jobs: [] });
  await assert.rejects(cancel(unknown), named("BridgeFailed", { error: "not-found", message: `No job ${ID}.` }));
  none(unknown);
  const silent = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job()], outage: "connection refused" });
  await assert.rejects(cancel(silent), named("NoAnswer"));
  none(silent);
  const refused = fakeHost({ taken: "lab-pc" });
  install({ jobs: [job()] });
  await assert.rejects(cancel(refused, { "lab-pc": bridgeAt({ address: BRIDGE_ADDRESS, token: "another-token" }) }), named("TokenRefused"));
  none(refused);
  const missing = fakeHost({ taken: "lab-pc" });
  const nobody = install({ jobs: [job()] });
  await assert.rejects(cancel(missing, { "other-box": BRIDGES["lab-pc"] }), (error) => error instanceof runtimes.RuntimeError && named("NotFound", { what: "lab-pc" })(error));
  const inherited = fakeHost({ taken: "toString" });
  await assert.rejects(cancel(inherited, {}), (error) => error instanceof runtimes.RuntimeError && named("NotFound", { what: "toString" })(error));
  assert.deepEqual(nobody.requests, [], "no request for a Bridge that is not among the Bridges");
  none(missing);
  none(inherited);

  const moved = fakeHost({ taken: "lab-pc", commitFails: Object.assign(new Error("Moved"), { name: "Moved", head: "c9" }) });
  const asked = install({ jobs: [job()] });
  await assert.rejects(cancel(moved), named("Moved", { head: "c9" }));
  assert.equal(asked.requests.length, 1, "the Bridge was asked once");
});
