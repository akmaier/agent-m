// The record of a job (ITM-252) — MOD-job-ledger's newJobId, startRecord, jobState, listJobs and jobCost, as the
// accepted text of docs/architecture/MOD-job-ledger.md states them: a job's identifier, none of those its product
// holds; the start of its record; a record read with every part appended to it, each kind of part as the file writes
// it — the lines `gate record:`, `works on:` and `jobs at once:` with their spaces —, its End without a round record;
// its state from its last part and, for a job that has not ended, from its runtime's live state; and every job of the
// products given, newest first, with its cost. appendToRecord, takeJob and recordsNewestFirst are not part of this
// item and are not tested here.
// Run: node --test tests/job-ledger.test.mjs
//
// Module: MOD-job-ledger
// Guards: UC-013; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A JOB IDENTIFIER IS NEVER REUSED; PROGRESS AND JOB STATE
//         ARE DERIVED, NOT STORED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). listJobs is given fixture
// snapshots already held in memory (MOD-repository-hosts' Snapshot: paths and a read(path) that resolves from a plain
// object — no readSnapshot, no fetch, no network) and reaches no runtime; nothing sleeps or waits. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { newJobId, startRecord, jobState, listJobs, jobCost } from "../src/job-ledger/index.mjs";

// ---------------------------------------------------------------- fixtures

// A fixture snapshot (MOD-repository-hosts' Snapshot: paths, and read(path) resolving a file already held in memory) of
// the given job records, by path.
function snapshotOf(files) {
  return { paths: Object.keys(files), read: async (path) => (Object.hasOwn(files, path) ? files[path] : null) };
}

const START = {
  id: "JOB-20261007-0900-a1b2", kind: "derive-use-cases", worksOn: ["EXPORT IS A PDF"], participant: "drafter-a",
  model: "example-model", route: "tab", run: null, retries: null, startedBy: "alice",
  start: new Date("2026-10-07T09:00:00Z"), agentM: { version: "2026.10.0", commit: "abc123def456" },
  inputs: ["SPEC.md@deadbeefcafe"], limit: 5,
  destinations: [{ participant: "drafter-a", place: "this machine", parts: ["the chosen requirements", "every use case"] }],
  params: { requirements: ["EXPORT IS A PDF"] },
};

// ---------------------------------------------------------------- newJobId

// guards: A JOB IDENTIFIER IS NEVER REUSED
// given: a fixed instant, and taken holding the identifier Math.random would give first (four hex digits "0")
// input: newJobId(now, taken), with Math.random replaced so its first four digits collide and its next four do not
// expect: an identifier of the form JOB-<yyyymmdd>-<hhmm>-<4 hex>; the first candidate is never returned, since it
//         stands in taken; the one returned is not in taken
test("newJobId — an identifier of the record's form, none of those taken", () => {
  const now = new Date("2026-10-07T12:34:00Z");
  assert.match(newJobId(now, new Set()), /^JOB-20261007-1234-[0-9a-f]{4}$/);

  const original = Math.random;
  let calls = 0;
  Math.random = () => { calls += 1; return calls <= 4 ? 0 : 0.5; };
  try {
    const taken = new Set(["JOB-20261007-1234-0000"]);
    const id = newJobId(now, taken);
    assert.equal(id, "JOB-20261007-1234-8888");
    assert.ok(!taken.has(id));
  } finally {
    Math.random = original;
  }
});

// ---------------------------------------------------------------- startRecord, read back through listJobs

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a JobStart with every one of its parts — destinations, parameters, an input, a run-less, retry-less job
// input: startRecord(START), then listJobs of a fixture snapshot holding only that text
// expect: the one row's record carries every field of START exactly as given, state "queued" (no ## Taken yet), and its
//         source reachable
test("startRecord — the start of a record with each of its parts, read back as the same start", async () => {
  const { path, text } = startRecord(START);
  assert.equal(path, "docs/jobs/JOB-20261007-0900-a1b2.md");
  const rows = await listJobs([{ address: "org/repo", snapshot: snapshotOf({ [path]: text }) }], new Map());
  assert.equal(rows.length, 1);
  const { record, state, source } = rows[0];
  assert.equal(state, "queued");
  assert.deepEqual(source, { reachable: true, reason: null });
  assert.equal(record.id, START.id);
  assert.equal(record.kind, START.kind);
  assert.deepEqual(record.worksOn, START.worksOn);
  assert.equal(record.participant, START.participant);
  assert.equal(record.model, START.model);
  assert.equal(record.route, START.route);
  assert.equal(record.run, null);
  assert.equal(record.retries, null);
  assert.equal(record.startedBy, START.startedBy);
  assert.equal(record.start.getTime(), START.start.getTime());
  assert.deepEqual(record.agentM, START.agentM);
  assert.deepEqual(record.inputs, START.inputs);
  assert.equal(record.limit, START.limit);
  assert.deepEqual(record.destinations, START.destinations);
  assert.deepEqual(record.params, START.params);
  assert.equal(record.taken, null);
});

// ---------------------------------------------------------------- a record with each kind of part appended

const RUN_PATH = "docs/jobs/JOB-20261002-0800-c0c0.md";
// A run's record (MOD-job-ledger, Data: "A run ... is a record of kind run") carrying, in order, every kind of appended
// part ITM-252 names: Taken, Gate reached, Resumed, Job started (twice), Limits raised, End — each kind of part
// appended exactly as the file writes it (MOD-job-ledger.md, Data): `gate record:`, `works on:` and `jobs at once:`,
// with their spaces, not `gate_record:`/`works_on:`/`jobs_at_once:`. No round record stands in its End (ITM-252's
// Outcome: "its End without a round record" — MOD-job-runner's roundsText, not built by any item yet).
const RUN_RECORD = `---
id: JOB-20261002-0800-c0c0
kind: run
works_on:
  - UC-013
route: ci hosted
started_by: po-opus
start: 2026-10-02 08:00 UTC
agent_m: 2026.10.0, commit c0c0c0c0c0c0
limit: 5
---
## Destinations

- po-opus, at the release panel: the run's own progress.

## Parameters

\`\`\`json
{ "jobsAtOnce": 4, "cost": null, "rounds": 5 }
\`\`\`

## Taken

at: 2026-10-02 08:01 UTC
by: ci hosted

## Gate reached

at: 2026-10-02 08:10 UTC
gate: Release
decider: akmaier

## Resumed

at: 2026-10-02 08:20 UTC
gate record: docs/approvals/release-2026-10-02-abc123456789.md

## Job started

at: 2026-10-02 08:21 UTC
job: JOB-20261002-0821-d1d1
kind: implement
works on: ITM-247

## Job started

at: 2026-10-02 08:22 UTC
job: JOB-20261002-0822-d2d2
kind: implement
works on: ITM-248

## Limits raised

at: 2026-10-02 08:30 UTC
by: akmaier
jobs at once: 6
cost: 50
rounds: 6

## End

at: 2026-10-02 09:00 UTC
state: done
results: docs/jobs/JOB-20261002-0821-d1d1.md, docs/jobs/JOB-20261002-0822-d2d2.md
usage: {"inputTokens":1000,"outputTokens":200,"minutes":12,"cost":null}
cost: {"known":true,"amount":3.4,"currency":"USD","basis":"usage at the declared price"}
`;

// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: RUN_RECORD, one record with each of the six kinds of appended part (job.schema.md, Data: appended), the
//        resumption, the two started jobs and the raised limits each written with their spaced key
// input: listJobs of a fixture snapshot holding only that text
// expect: the row's record carries Taken (by), the one gate resumed by the named gate record, both started jobs in
//         order, the one limits-raised entry, and the end's state, results, usage and cost — each exactly as the text
//         states it, its rounds empty (no round record stands in the text, and none is built yet); the derived state
//         is "done" (its last part, A RECORD IS EVIDENCE, NOT A PROPOSAL)
test("listJobs — a record with each kind of part appended, read", async () => {
  const rows = await listJobs([{ address: "org/repo", snapshot: snapshotOf({ [RUN_PATH]: RUN_RECORD }) }], new Map());
  assert.equal(rows.length, 1);
  const { record, state } = rows[0];
  assert.equal(state, "done");
  assert.deepEqual(record.taken, { at: new Date("2026-10-02T08:01:00Z"), by: "ci hosted" });
  assert.equal(record.gates.length, 1);
  assert.equal(record.gates[0].gate, "Release");
  assert.equal(record.gates[0].decider, "akmaier");
  assert.equal(record.gates[0].resumedBy, "docs/approvals/release-2026-10-02-abc123456789.md");
  assert.equal(record.question, null);
  assert.deepEqual(record.jobs.map((j) => j.job), ["JOB-20261002-0821-d1d1", "JOB-20261002-0822-d2d2"]);
  assert.deepEqual(record.jobs[1].worksOn, ["ITM-248"]);
  assert.equal(record.limitsRaised.length, 1);
  assert.deepEqual(record.limitsRaised[0].limits, { jobsAtOnce: 6, cost: 50, rounds: 6 });
  assert.equal(record.end.state, "done");
  assert.deepEqual(record.end.results, ["docs/jobs/JOB-20261002-0821-d1d1.md", "docs/jobs/JOB-20261002-0822-d2d2.md"]);
  assert.deepEqual(record.end.usage, { inputTokens: 1000, outputTokens: 200, minutes: 12, cost: null });
  assert.deepEqual(record.end.cost, { known: true, amount: 3.4, currency: "USD", basis: "usage at the declared price" });
  assert.deepEqual(record.end.rounds, [], "an End is read without a round record (ITM-252's Outcome)");
});

// ---------------------------------------------------------------- jobState

function baseRecord(overrides) {
  return { taken: null, gates: [], end: null, ...overrides };
}

// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: records by their last part alone, then the same not-ended record with each kind of live state
// input: jobState(record, live)
// expect: not taken -> queued; taken, no open gate, no live -> running; an unresolved gate -> waiting at a gate,
//         whatever live says; ended -> its end's state; live reachable and not knowing the job -> ended without
//         record; live reachable, knowing it and cancelling -> cancelling; live unreachable -> running (the record
//         alone, A RECORD IS EVIDENCE, NOT A PROPOSAL)
test("jobState — the state of a record by its last part, with a live state and without one", () => {
  assert.equal(jobState(baseRecord({}), null), "queued");
  assert.equal(jobState(baseRecord({ taken: { at: new Date(), by: "tab" } }), null), "running");
  assert.equal(
    jobState(baseRecord({ taken: { at: new Date(), by: "tab" },
      gates: [{ at: new Date(), gate: "Development", decider: "review", resumedBy: null }] }), null),
    "waiting at a gate");
  for (const state of ["done", "failed", "cancelled"]) {
    assert.equal(jobState(baseRecord({ taken: { at: new Date(), by: "tab" }, end: { state } }),
      { reachable: true, known: false, running: false, cancelling: false }), state, `ended (${state}) outranks live`);
  }
  const taken = baseRecord({ taken: { at: new Date(), by: "tab" } });
  assert.equal(jobState(taken, { reachable: true, known: false, running: false, cancelling: false }),
    "ended without record");
  assert.equal(jobState(taken, { reachable: true, known: true, running: true, cancelling: true }), "cancelling");
  assert.equal(jobState(taken, { reachable: true, known: true, running: true, cancelling: false }), "running");
  assert.equal(jobState(taken, { reachable: false, reason: "Unreachable", known: false, running: false, cancelling: false }),
    "running");
});

// ---------------------------------------------------------------- listJobs: order, products, a record that fails

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: two products — one with a gate-waiting job (oldest) and a job that failed to read, the other with a running
//        job (newest) and a done job (middle) — the records of the second product named directly, no ## Taken needed
//        for order
// input: listJobs(products, live)
// expect: four rows; the gate-waiting job first; then the running job (newest of the rest) before the done job
//        (older); the unreadable path still listed, with source.reachable false and a reason naming it
test("listJobs — the jobs of two products newest first, waiting at a gate first, a record that cannot be read listed with the reason", async () => {
  const waiting = `---
id: JOB-20261001-0900-aaaa
kind: implement
works_on:
  - ITM-252
route: tab
started_by: alice
start: 2026-10-01 09:00 UTC
agent_m: 2026.10.0, commit aaaaaaaaaaaa
limit: 5
---
## Destinations

- alice, at this machine: the item.

## Parameters

\`\`\`json
{}
\`\`\`

## Taken

at: 2026-10-01 09:01 UTC
by: tab

## Gate reached

at: 2026-10-01 10:00 UTC
gate: Development
decider: review
`;
  const broken = "docs/jobs/JOB-20261001-0905-bbbb.md";
  const running = `---
id: JOB-20261005-0900-cccc
kind: implement
works_on:
  - ITM-253
route: tab
started_by: bob
start: 2026-10-05 09:00 UTC
agent_m: 2026.10.0, commit cccccccccccc
limit: 5
---
## Destinations

- bob, at this machine: the item.

## Parameters

\`\`\`json
{}
\`\`\`

## Taken

at: 2026-10-05 09:01 UTC
by: tab
`;
  const done = `---
id: JOB-20261003-0900-dddd
kind: implement
works_on:
  - ITM-254
route: tab
started_by: carol
start: 2026-10-03 09:00 UTC
agent_m: 2026.10.0, commit dddddddddddd
limit: 5
---
## Destinations

- carol, at this machine: the item.

## Parameters

\`\`\`json
{}
\`\`\`

## Taken

at: 2026-10-03 09:01 UTC
by: tab

## End

at: 2026-10-03 09:30 UTC
state: done
`;
  const productA = { address: "org/product-a", snapshot: {
    paths: ["docs/jobs/JOB-20261001-0900-aaaa.md", broken],
    read: async (path) => {
      if (path === broken) throw new Error("GitHub: not found");
      return path === "docs/jobs/JOB-20261001-0900-aaaa.md" ? waiting : null;
    },
  } };
  const productB = { address: "org/product-b", snapshot: snapshotOf({
    "docs/jobs/JOB-20261005-0900-cccc.md": running,
    "docs/jobs/JOB-20261003-0900-dddd.md": done,
  }) };

  const rows = await listJobs([productA, productB], new Map());
  assert.equal(rows.length, 4);
  assert.equal(rows[0].record.id, "JOB-20261001-0900-aaaa");
  assert.equal(rows[0].state, "waiting at a gate");
  assert.equal(rows[1].record.id, "JOB-20261005-0900-cccc");
  assert.equal(rows[1].state, "running");
  assert.equal(rows[2].record.id, "JOB-20261003-0900-dddd");
  assert.equal(rows[2].state, "done");
  const brokenRow = rows.find((row) => row.record.path === broken);
  assert.ok(brokenRow, "the record that cannot be read is still listed");
  assert.equal(brokenRow.source.reachable, false);
  assert.match(brokenRow.source.reason, /not found/);
  assert.equal(brokenRow.product, "org/product-a");
});

// ---------------------------------------------------------------- jobCost

// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: usage with a reported cost; usage with tokens and no reported cost, and a participant with a declared price;
//        no usage and no price
// input: jobCost(usage, participant)
// expect: the reported cost, basis "reported"; the tokens at the declared price, basis "usage at the declared price";
//         otherwise known false with the usage given — never a zero amount
test("jobCost — the cost as reported, at the declared price, or unknown, never zero", () => {
  const reported = { inputTokens: 100, outputTokens: 50, minutes: null, cost: { amount: 1.23, currency: "USD" } };
  assert.deepEqual(jobCost(reported, { price: { input: 0.01, output: 0.02, currency: "USD" } }),
    { known: true, amount: 1.23, currency: "USD", basis: "reported" });

  const usage = { inputTokens: 1000, outputTokens: 200, minutes: 5, cost: null };
  const priced = jobCost(usage, { price: { input: 0.001, output: 0.002, currency: "USD" } });
  assert.equal(priced.known, true);
  assert.equal(priced.basis, "usage at the declared price");
  assert.equal(priced.currency, "USD");
  assert.ok(priced.amount > 0, "never zero where tokens and a price are given");

  const unknown = jobCost(null, { price: null });
  assert.deepEqual(unknown, { known: false, usage: null });
  const noPrice = jobCost(usage, { price: null });
  assert.deepEqual(noPrice, { known: false, usage });
});
