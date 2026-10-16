// A conversation's work handed over to CI or a Bridge (ITM-495), the two routes — MOD-runtimes' handOverJob(prepared, route, start, host, head, task, target), as the accepted
// text of docs/architecture/MOD-runtimes.md states it (Interfaces: handOverJob), for UC-049 4a: the start record committed as the person's commit on the head read, naming no
// word of the task; then, on the CI route, the product's job workflow started with `startWorkflow` and the inputs `job`, `task` and, for a model endpoint, `endpoint`, or, on a
// Bridge, the job handed over with `handOver` and the task; a start the server refuses after the commit ends the record as failed with the server's reason. The refusals
// before anything is written, and the template, are tests/runtimes-hand-over.test.mjs.
// Run: node --test tests/runtimes-hand-over-routes.test.mjs
//
// Module: MOD-runtimes
// Guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// Guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-049
// Level: component
//
// Each test states its expected values in its own text; none reads them from a document. The values the module file leaves unstated are those of ITM-495's Outcome and
// sprint 42's selection: the record is `startRecord` of `start` with `task: "with the hand-over"`, committed with the message `Queue job <id>: <kind>`; the CI route is
// started with the workflow file of the server on the default branch and the inputs `{ job, task }` plus `endpoint` as the JSON text of the target's endpoint; the Bridge
// route is `handOver` with the product's address, the record's path, the commit and the task; a refusal after the commit appends an end `failed` — the commit message
// `Job <id>: end`, as a job in the tab appends its parts — whose reason is `<name>: <message>` of the refusal, and the refusal is thrown again unchanged. A record that
// cannot be appended to does not hide the refusal, as in `runOnTab`. The repository server is the fake host of tests/runtimes-hand-over-fixture.mjs with a spy for
// startWorkflow, the Bridge a fixture behind the global `fetch` with the real Bridge client, and the record is read back with MOD-job-ledger. Nothing reaches the network.
// A name the module does not provide yet is undefined here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { BRIDGE_ADDRESS, BRIDGE_ROUTE, CI_HOSTED, ENDPOINT, ENDPOINT_TEXT, GITHUB_WORKFLOW, RECORD_PATH, START, TASK, bridgeNamed, failure, fakeHost, holdsTask, installBridge, preparedOf,
  restoreFetch } from "./runtimes-hand-over-fixture.mjs";

test.afterEach(restoreFetch);

const NO_ENDPOINT = { endpoint: null, bridge: null };

// TST-495010 · level: component · module: MOD-runtimes
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-049 4a
// given: a product on GitHub whose default branch `trunk` holds its job workflow; a prepared job that fits and blocks nothing; a task in the participant's words; a model endpoint as the target
// input: handOverJob(prepared, { kind: "ci", runner: "hosted" }, START, host, the head read, TASK, { endpoint: ENDPOINT, bridge: null }); then the same with `endpoint: null`
// expect: one commit on `trunk`, on the head read, of the start record alone at docs/jobs/<id>.md with the message "Queue job JOB-20261016-0930-abcd: write-tests", whose text has the line `task: with the hand-over` and none of the task's words; after it exactly one startWorkflow, of .github/workflows/agent-m-jobs.yml on `trunk`, with the inputs { job: the id, task: TASK, endpoint: the JSON text of the endpoint } — and, without an endpoint, { job, task } alone; the result { path, commit } of the start record's commit
test("handOverJob — the CI route commits the record without the task, then starts the job workflow with the job, the task and the endpoint", async () => {
  assert.equal(typeof runtimes.handOverJob, "function");
  const run = fakeHost({});
  const head = run.head();

  const result = await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, run.host, head, TASK, { endpoint: ENDPOINT, bridge: null });

  assert.equal(run.writes.length, 1, "one commit");
  const [change] = run.writes;
  assert.deepEqual([change.branch, change.expectedHead, change.message], ["trunk", head, "Queue job JOB-20261016-0930-abcd: write-tests"]);
  assert.deepEqual(change.files.map((file) => file.path), [RECORD_PATH], "the start record alone");
  assert.match(change.files[0].text, /^task: with the hand-over$/m, "the record says that its task travels with the hand-over");
  assert.equal(holdsTask(change.files[0].text), false, "the record holds no word of the task");
  assert.deepEqual(run.events, [["commit", "Queue job JOB-20261016-0930-abcd: write-tests"], ["start", GITHUB_WORKFLOW]], "the record is committed first, the run started after it");
  assert.deepEqual(run.starts, [{ workflow: GITHUB_WORKFLOW, ref: "trunk", inputs: { job: START.id, task: TASK, endpoint: ENDPOINT_TEXT } }]);
  assert.deepEqual(result, { path: RECORD_PATH, commit: run.head() });

  const without = fakeHost({});
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, without.host, without.head(), TASK, NO_ENDPOINT);
  assert.deepEqual(without.starts.map((each) => each.inputs), [{ job: START.id, task: TASK }], "no endpoint, no endpoint input");
});

// TST-495011 · level: component · module: MOD-runtimes
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; UC-049 4a
// given: a product whose default branch `trunk` holds no job workflow (a Bridge needs none); the Bridge `lab-pc`; a prepared job that fits and blocks nothing; a task
// input: handOverJob(prepared, { kind: "bridge", bridge: "lab-pc" }, START, host, the head read, TASK, { endpoint: null, bridge: the Bridge })
// expect: one commit on `trunk`, on the head read, of the start record alone, with `task: with the hand-over` and none of the task's words; then exactly one request, POST /v1/jobs to http://127.0.0.1:4712 with the Bridge's token, made after that commit, with the body { product: "https://github.com/alice/product", record: the record's path, commit: the commit, task: TASK }; no workflow started; the result { path, commit }
test("handOverJob — the Bridge route commits the record without the task, then hands the job over to the Bridge with the task", async () => {
  const run = fakeHost({ workflow: false });
  const lab = installBridge(() => run.writes.length);
  const head = run.head();

  const result = await runtimes.handOverJob(preparedOf(), BRIDGE_ROUTE, START, run.host, head, TASK, { endpoint: null, bridge: bridgeNamed("lab-pc") });

  assert.equal(run.writes.length, 1, "one commit");
  const [change] = run.writes;
  assert.deepEqual([change.branch, change.expectedHead, change.message, change.files.map((file) => file.path)],
    ["trunk", head, "Queue job JOB-20261016-0930-abcd: write-tests", [RECORD_PATH]]);
  assert.match(change.files[0].text, /^task: with the hand-over$/m);
  assert.equal(holdsTask(change.files[0].text), false, "the record holds no word of the task");
  assert.deepEqual(lab.requests.map((each) => [each.method, each.path, each.origin, each.token, each.writes]), [["POST", "/v1/jobs", BRIDGE_ADDRESS, "token-lab-pc", 1]],
    "one hand-over, made after the commit");
  assert.deepEqual(lab.requests[0].body, { product: "https://github.com/alice/product", record: RECORD_PATH, commit: run.head(), task: TASK });
  assert.equal(run.starts.length, 0, "no workflow started on a Bridge");
  assert.deepEqual(result, { path: RECORD_PATH, commit: run.head() });
});

// TST-495012 · level: component · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049 4c, 4d
// given: a product whose server refuses to start the workflow (PermissionMissing, "The token may not start workflows"); known positive first — a server that starts it, whose record has no end
// input: handOverJob on the CI route
// expect: rejects with the server's own error, unchanged (the same object: name PermissionMissing, message "The token may not start workflows"); two commits — the queued record, then the record with an end: state failed, a reason "PermissionMissing: The token may not start workflows", message "Job JOB-20261016-0930-abcd: end" —, the record still holding none of the task's words; the commits and the start attempt in the order commit, start, commit
test("handOverJob — the CI route's refused start ends the record as failed with the server's reason, and the refusal is thrown again", async () => {
  const positive = fakeHost({});
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, positive.host, positive.head(), TASK, NO_ENDPOINT);
  assert.equal((await positive.record()).end, null, "known positive: a started job has no end");

  const refusal = failure("PermissionMissing", {}, "The token may not start workflows");
  const run = fakeHost({ refuseStart: refusal });
  await assert.rejects(runtimes.handOverJob(preparedOf(), CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT), (error) => error === refusal);

  assert.deepEqual(run.writes.map((change) => change.message), ["Queue job JOB-20261016-0930-abcd: write-tests", "Job JOB-20261016-0930-abcd: end"]);
  assert.deepEqual(run.events.map(([what]) => what), ["commit", "start", "commit"], "queued, start attempted, ended");
  const record = await run.record();
  assert.equal(record.id, START.id);
  assert.equal(record.end.state, "failed");
  assert.equal(record.end.reason, "PermissionMissing: The token may not start workflows");
  assert.equal(holdsTask(run.tree.get(RECORD_PATH)), false, "the ended record holds no word of the task either");
});

// TST-495013 · level: component · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS; UC-049 4a
// given: a Bridge that is paused ("Bridge is paused."); known positive first — a Bridge that accepts
// input: handOverJob on the Bridge route
// expect: rejects with the Bridge client's BridgeFailed with `error` "paused", carrying `queued` { path, commit } of the start record; two commits — the queued record, then the record with an end: state failed, a reason starting "BridgeFailed: " and holding "Bridge is paused.", message "Job JOB-20261016-0930-abcd: end"; the record holds none of the task's words
test("handOverJob — a Bridge that refuses the hand-over ends the record as failed with its reason, and the refusal is thrown again", async () => {
  const positive = fakeHost({ workflow: false });
  installBridge(() => positive.writes.length);
  await runtimes.handOverJob(preparedOf(), BRIDGE_ROUTE, START, positive.host, positive.head(), TASK, { endpoint: null, bridge: bridgeNamed("lab-pc") });
  assert.equal((await positive.record()).end, null, "known positive: an accepted job has no end");

  const run = fakeHost({ workflow: false });
  installBridge(() => run.writes.length).refuse = "paused";
  await assert.rejects(runtimes.handOverJob(preparedOf(), BRIDGE_ROUTE, START, run.host, run.head(), TASK, { endpoint: null, bridge: bridgeNamed("lab-pc") }), (error) => {
    assert.equal(error.name, "BridgeFailed");
    assert.equal(error.error, "paused");
    assert.deepEqual(error.queued, { path: RECORD_PATH, commit: "c1" });
    return true;
  });
  assert.deepEqual(run.writes.map((change) => change.message), ["Queue job JOB-20261016-0930-abcd: write-tests", "Job JOB-20261016-0930-abcd: end"]);
  const record = await run.record();
  assert.equal(record.end.state, "failed");
  assert.match(record.end.reason, /^BridgeFailed: /);
  assert.ok(record.end.reason.includes("Bridge is paused."), record.end.reason);
  assert.equal(holdsTask(run.tree.get(RECORD_PATH)), false);
});

// TST-495014 · level: component · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a product whose server refuses to start the workflow and whose branch refuses the commit of the end (Moved)
// input: handOverJob on the CI route
// expect: rejects with the server's own refusal (the same object, name PermissionMissing), not the Moved of the end; the queued record stays the only commit
test("handOverJob — a record that cannot be ended does not hide the server's refusal", async () => {
  const refusal = failure("PermissionMissing", {}, "The token may not start workflows");
  const run = fakeHost({ refuseStart: refusal, refuseSecondCommit: true });
  await assert.rejects(runtimes.handOverJob(preparedOf(), CI_HOSTED, START, run.host, run.head(), TASK, NO_ENDPOINT), (error) => error === refusal);
  assert.equal(run.writes.length, 1, "only the queued record");
});
