// A job's live state, its log and its cancel (ITM-535) on the CI route, for a job no runtime has taken, and for a job taken on a Bridge — MOD-runtimes' `liveState(record, product,
// bridges)`, `jobLog(record, product, bridges)` and `cancelJob(record, product, bridges)`, as the accepted text of docs/architecture/MOD-runtimes.md states it (Interfaces) and
// ITM-535's Outcome settles it, for UC-049 and UC-036. The tab's route is tests/runtimes-live-tab.test.mjs.
// Run: node --test tests/runtimes-live-state.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DASHBOARD SHOWS EVERY JOB; A CANCELLED JOB WRITES NOTHING MORE; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The readings, each from ITM-535's Outcome: a record whose `## Taken` is absent is taken by no
// runtime; a `by:` that is `tab` is the tab's, one that begins `http://` or `https://` is a CI run's address (MOD-job-ledger, Data: "a CI run's address, a Bridge's name, this tab"),
// one that begins `ci ` is a CI route without an address (no run is found by it), any other is a Bridge's name. The run is the `CiRun` of `listCiRuns({ workflow: "agent-m-jobs.yml" })`
// whose `url` is the address. The live state of a job no runtime knows is `{ reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null,
// writtenAfterCancel: [] }` (the item names every field but `reason`, which is null where nothing failed). The end a cancel appends has state `cancelled`, no results, no draft, no
// rounds, no usage, the cost `{ known: false, usage: null }` and the reason `cancelled by a person`, with the run's address as `log` on the CI route and none otherwise; it is one
// commit on the default branch on the head read, with the message `Job <id>: end`. A run that `cancelJob` cannot find is refused with a RuntimeError named NotFound whose `what` is the
// address; a job whose log the runtime keeps no longer, or never kept, is `{ gone: true }`. The repository server is the fake host of tests/runtimes-live-fixture.mjs, the record is read
// back with MOD-job-ledger, and the global `fetch` is a spy that every test checks was never called: nothing reaches the network. A name the module does not provide yet is undefined
// here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { bridgeAt } from "../src/bridge-client/index.mjs";
import { RECORD_PATH, RUN_URL, START, ciRun, failure, fakeHost, fetched, restoreFetch, spyOnFetch } from "./runtimes-live-fixture.mjs";

test.beforeEach(spyOnFetch);
test.afterEach(() => {
  const requests = [...fetched];
  restoreFetch();
  assert.deepEqual(requests, [], "no request reached the network");
});

const UNKNOWN = { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] };
const BRIDGES = { "lab-pc": bridgeAt({ name: "lab-pc", address: "http://127.0.0.1:4712", token: "token-lab-pc" }) };
const NOT_READ = "the Bridge's jobs are not read yet";
const ask = (fake, call, bridges = BRIDGES) => async () => runtimes[call](await fake.record(), { host: fake.host }, bridges);

// TST-535001 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job whose record has no `## Taken`; a host whose CI lists a running run
// input: liveState(record, { host }, {})
// expect: { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; and the job's log is { gone: true }; the host's CI was not asked
test("liveState and jobLog — a job no runtime has taken is unknown, its log gone, and the CI is not asked", async () => {
  assert.equal(typeof runtimes.liveState, "function");
  const fake = fakeHost({ taken: null, runs: [ciRun(7, "running")] });
  const record = await fake.record();
  assert.equal(record.taken, null, "the record is not taken");
  assert.deepEqual(await runtimes.liveState(record, { host: fake.host }, {}), UNKNOWN);
  assert.deepEqual(await runtimes.jobLog(record, { host: fake.host }, {}), { gone: true });
  assert.deepEqual(fake.calls, [], "the CI was not asked");
});

// TST-535002 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by the CI run https://github.com/alice/product/actions/runs/7; the CI lists run 7 and another run 8 (running), in the state given
// input: liveState for run 7 queued, running, waiting; then success, failure, cancelled, skipped
// expect: for queued, running and waiting: { reachable: true, reason: null, known: true, running: true, cancelling: false, log: <run 7's address>, usage: null, writtenAfterCancel: [] }; for the four ended states the same with running: false — never run 8's state; the CI was asked by `list agent-m-jobs.yml` each time
test("liveState — a job taken on CI runs while its run is queued, running or waiting, with the run's address as its log", async () => {
  for (const [state, running] of [["queued", true], ["running", true], ["waiting", true], ["success", false], ["failure", false], ["cancelled", false], ["skipped", false]]) {
    const fake = fakeHost({ taken: RUN_URL, runs: [ciRun(8, "running"), ciRun(7, state)] });
    const live = await runtimes.liveState(await fake.record(), { host: fake.host }, {});
    assert.deepEqual(live, { reachable: true, reason: null, known: true, running, cancelling: false, log: RUN_URL, usage: null, writtenAfterCancel: [] }, `run 7 is ${state}`);
    assert.deepEqual(fake.calls, ["list agent-m-jobs.yml"], `asked once, for the job workflow, when run 7 is ${state}`);
  }
});

// TST-535003 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by run 7; the CI lists only run 8; known positive first — the CI lists run 7
// input: liveState; and for a record taken by `ci hosted` (a route without an address) the same list
// expect: with run 7 listed: known true; without it: { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; a record taken by `ci hosted`: the same unknown state; run 8, the only one listed, is never taken for the job
test("liveState — a run the CI does not list is unknown, and is not taken for another run", async () => {
  const listed = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "running")] });
  assert.equal((await runtimes.liveState(await listed.record(), { host: listed.host }, {})).known, true, "known positive");
  const missing = fakeHost({ taken: RUN_URL, runs: [ciRun(8, "running")] });
  assert.deepEqual(await runtimes.liveState(await missing.record(), { host: missing.host }, {}), UNKNOWN);
  const noAddress = fakeHost({ taken: "ci hosted", runs: [ciRun(8, "running")] });
  assert.deepEqual(await runtimes.liveState(await noAddress.record(), { host: noAddress.host }, {}), UNKNOWN);
});

// TST-535004 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// given: a job taken by run 7; a host whose listing of runs fails with Unreachable "the server could not be reached"; known positive first — the same host without the failure
// input: liveState; and for a host that has no listCiRuns at all
// expect: the known positive is known; the failure is not thrown: { reachable: false, reason: "the server could not be reached", known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; a host without listCiRuns: reachable false, known false, running false, and a reason that is a non-empty text
test("liveState — a failure of the host gives reachable false and its reason, never an error", async () => {
  const fine = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "running")] });
  assert.equal((await runtimes.liveState(await fine.record(), { host: fine.host }, {})).reachable, true, "known positive");
  const broken = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "running")], listFails: failure("Unreachable", { reason: "offline" }, "the server could not be reached") });
  assert.deepEqual(await runtimes.liveState(await broken.record(), { host: broken.host }, {}),
    { reachable: false, reason: "the server could not be reached", known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] });
  const without = fakeHost({ taken: RUN_URL, withoutCi: true });
  const live = await runtimes.liveState(await without.record(), { host: without.host }, {});
  assert.deepEqual([live.reachable, live.known, live.running, typeof live.reason, live.reason.length > 0], [false, false, false, "string", true]);
});

// TST-535005 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by run 7, which the CI lists; and one whose run it does not list
// input: jobLog
// expect: { address: "https://github.com/alice/product/actions/runs/7" } for the listed run, without a request for the run's log text (no `log` call); { gone: true } for the run the CI does not list
test("jobLog — the CI route gives the run's address, and gone for a run the CI no longer lists", async () => {
  const fake = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "success")] });
  assert.deepEqual(await runtimes.jobLog(await fake.record(), { host: fake.host }, {}), { address: RUN_URL });
  assert.deepEqual(fake.calls, ["list agent-m-jobs.yml"], "the address only, not the log text");
  const gone = fakeHost({ taken: RUN_URL, runs: [ciRun(8, "success")] });
  assert.deepEqual(await runtimes.jobLog(await gone.record(), { host: gone.host }, {}), { gone: true });
});

// TST-535006 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job whose record has no `## Taken`, at head c0
// input: cancelJob(record, { host }, {}); then cancelJob again on a record read afresh
// expect: "cancelled"; one commit on `trunk` with expectedHead c0, of docs/jobs/JOB-20261016-1100-c0de.md alone, with the message "Job JOB-20261016-1100-c0de: end"; the record read back has no taken part and the end { state: "cancelled", results: [], draft: null, usage: null, reason: "cancelled by a person", log: null }; the CI was not asked; a second cancel is refused with RecordEnded and writes nothing: still one commit
test("cancelJob — a job no runtime has taken is ended at once as cancelled, and nothing more is written", async () => {
  assert.equal(typeof runtimes.cancelJob, "function");
  const fake = fakeHost({ taken: null, runs: [] });
  assert.equal(await runtimes.cancelJob(await fake.record(), { host: fake.host }, {}), "cancelled");
  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.deepEqual([change.branch, change.expectedHead, change.files.map((file) => file.path), change.message],
    ["trunk", "c0", [RECORD_PATH], `Job ${START.id}: end`]);
  const record = await fake.record();
  assert.equal(record.taken, null);
  const { state, results, draft, usage, reason, log } = record.end;
  assert.deepEqual({ state, results, draft, usage, reason, log }, { state: "cancelled", results: [], draft: null, usage: null, reason: "cancelled by a person", log: null });
  assert.deepEqual(fake.calls, [], "the CI was not asked");
  await assert.rejects(runtimes.cancelJob(record, { host: fake.host }, {}), (error) => error.name === "RecordEnded");
  assert.equal(fake.writes.length, 1, "after the end nothing more is written");
});

// TST-535007 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job taken by run 7, running; the CI cancels run 7 when asked (its state becomes cancelled)
// input: cancelJob
// expect: "cancelled"; the CI was asked in this order: `list agent-m-jobs.yml`, `cancel 7`, `list agent-m-jobs.yml` (the run read once after the cancel); one commit on `trunk` on head c0, message "Job JOB-20261016-1100-c0de: end"; the record's end is { state: "cancelled", reason: "cancelled by a person", log: "https://github.com/alice/product/actions/runs/7" }
test("cancelJob — a job on CI is cancelled with its run, and ended once the run is read as cancelled", async () => {
  const runs = [ciRun(8, "running"), ciRun(7, "running")];
  const fake = fakeHost({ taken: RUN_URL, runs, afterCancel: (id, all) => { all.find((run) => run.id === id).state = "cancelled"; } });
  assert.equal(await runtimes.cancelJob(await fake.record(), { host: fake.host }, {}), "cancelled");
  assert.deepEqual(fake.calls, ["list agent-m-jobs.yml", "cancel 7", "list agent-m-jobs.yml"]);
  assert.equal(runs.find((run) => run.id === "8").state, "running", "the other run is left alone");
  assert.equal(fake.writes.length, 1);
  assert.deepEqual([fake.writes[0].branch, fake.writes[0].expectedHead, fake.writes[0].message], ["trunk", "c0", `Job ${START.id}: end`]);
  const { state, reason, log } = (await fake.record()).end;
  assert.deepEqual({ state, reason, log }, { state: "cancelled", reason: "cancelled by a person", log: RUN_URL });
});

// TST-535008 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job taken by run 7, running; the CI accepts the cancel but run 7 is still running when read
// input: cancelJob
// expect: "cancelling"; the CI asked `list agent-m-jobs.yml`, `cancel 7`, `list agent-m-jobs.yml`; no commit; the record has no end
test("cancelJob — while the run is not yet cancelled it gives cancelling and appends nothing", async () => {
  const fake = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "running")] });
  assert.equal(await runtimes.cancelJob(await fake.record(), { host: fake.host }, {}), "cancelling");
  assert.deepEqual(fake.calls, ["list agent-m-jobs.yml", "cancel 7", "list agent-m-jobs.yml"]);
  assert.equal(fake.writes.length, 0, "nothing appended");
  assert.equal((await fake.record()).end, null);
});

// TST-535009 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// given: a job taken by run 7; (a) the CI does not list run 7, (b) the CI refuses the cancel with PermissionMissing, (c) the commit of the end is refused with Moved; known positive first — case (a) with run 7 listed ends the job
// input: cancelJob in each case
// expect: known positive "cancelled"; (a) rejects with a RuntimeError named NotFound whose `what` is run 7's address, `cancel` not asked, no commit; (b) rejects with that same PermissionMissing error, no commit; (c) rejects with Moved, the run having been asked to cancel once
test("cancelJob — a run not found, a refused cancel and a moved head are thrown by name, with nothing written but the end", async () => {
  const positive = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "cancelled")] });
  assert.equal(await runtimes.cancelJob(await positive.record(), { host: positive.host }, {}), "cancelled", "known positive");

  const absent = fakeHost({ taken: RUN_URL, runs: [ciRun(8, "running")] });
  await assert.rejects(runtimes.cancelJob(await absent.record(), { host: absent.host }, {}),
    (error) => error instanceof runtimes.RuntimeError && error.name === "NotFound" && error.what === RUN_URL);
  assert.deepEqual([absent.calls, absent.writes.length], [["list agent-m-jobs.yml"], 0]);

  const refusal = failure("PermissionMissing", { permission: "actions:write" }, "the token lacks actions:write");
  const refused = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "running")], cancelFails: refusal });
  await assert.rejects(runtimes.cancelJob(await refused.record(), { host: refused.host }, {}), (error) => error === refusal);
  assert.equal(refused.writes.length, 0);

  const moved = fakeHost({ taken: RUN_URL, runs: [ciRun(7, "cancelled")], commitFails: failure("Moved", { head: "c9" }) });
  await assert.rejects(runtimes.cancelJob(await moved.record(), { host: moved.host }, {}), (error) => error.name === "Moved" && error.head === "c9");
  assert.deepEqual(moved.calls, ["list agent-m-jobs.yml", "cancel 7", "list agent-m-jobs.yml"]);
});

// TST-535010 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049
// given: a job taken by the Bridge `lab-pc`, which is among the connected Bridges; the global fetch is a spy that answers nothing
// input: liveState, jobLog, cancelJob
// expect: liveState { reachable: false, reason: "the Bridge's jobs are not read yet", known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; jobLog and cancelJob each rejected with a RuntimeError named NotSupported whose message is "the Bridge's jobs are not read yet"; no request reached the network (checked after the test), no CI call, no commit
test("liveState, jobLog and cancelJob — a job taken on a Bridge is not read yet: unreachable, and NotSupported", async () => {
  const fake = fakeHost({ taken: "lab-pc", runs: [ciRun(7, "running")] });
  assert.deepEqual(await ask(fake, "liveState")(),
    { reachable: false, reason: NOT_READ, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] });
  for (const call of ["jobLog", "cancelJob"]) {
    await assert.rejects(ask(fake, call)(), (error) => error instanceof runtimes.RuntimeError && error.name === "NotSupported" && error.message === NOT_READ, call);
  }
  assert.deepEqual([fake.calls, fake.writes.length], [[], 0], "no CI call, no commit");
});
