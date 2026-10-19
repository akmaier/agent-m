// MOD-run-planner's runOf (ITM-976), as the accepted text of docs/architecture/MOD-run-planner.md states it: "`Run` — `{ id, selection, limits:
// { jobsAtOnce, cost, rounds }, jobs, state: "running" | "waiting at a gate" | "held by a limit" | "finished" | "stopped" }`; `limits` are those in
// force", and "`runOf(record: JobRecord, jobs: JobRow[]) -> Run` — a run from its record and the rows of its jobs, with the limits of its newest
// `## Limits raised` part, or of its parameters. Errors: `NotARun` for a record of another kind." (Data: a run is a job record of kind `run`; its
// `works_on` is the selection; its parameters are its limits; a `## Job started` part names each job it started; a `## Limits raised` part holds
// the limits a person raised, the newest in force; a run's end is `## End`, `done` for a finished run, `cancelled` for a run a person stopped.)
// Run: node --test tests/run-planner-run-of.test.mjs
//
// Module: MOD-run-planner
// Guards: A RUN IS A JOB THAT NAMES ITS JOBS; A RUN HAS LIMITS FIXED AT ITS START; UC-043
// Level: unit
//
// Deterministic, nothing reaches the network. The run record is made with MOD-job-ledger's startRecord and appendToRecord and read as every caller
// reads it, through recordsNewestFirst; the rows of its jobs are written here in the form of JobRow with only what a run reads (a state and a cost).
// Each test states its expected results in its own text. Where the module text leaves a reading open, the test states it and the pull request names it:
//   - A run's state is `finished` once its record has an `## End` of `done` and `stopped` once it has one of `cancelled`; otherwise `held by a limit`
//     when the cost the rows of its jobs report reaches a cost limit in force, else `waiting at a gate` when a row is waiting at one, else `running`.
//   - A job of the run is `{ job, kind, worksOn }` from its `## Job started` part, `worksOn` the identifiers it works on, joined by a comma and a space.

import test from "node:test";
import assert from "node:assert/strict";
import { startRecord, appendToRecord, recordsNewestFirst } from "../src/job-ledger/index.mjs";
import * as planner from "../src/run-planner/index.mjs";

const at = (minute) => new Date(Date.UTC(2026, 9, 19, 9, minute));
const START = (kind = "run", params = { jobsAtOnce: 3, cost: null, rounds: 5 }) => ({
  id: "JOB-20261019-0900-a1b2", kind, worksOn: ["ITM-001", "ITM-002"], participant: null, model: null, route: "tab", run: null, retries: null,
  startedBy: "alice", start: at(0), agentM: { version: "2026.10.0", commit: "abc123def456" }, inputs: [], limit: 5, destinations: [], params,
});
const started = (job, worksOn, minute) => ({ part: "job started", at: at(minute), job, kind: "implement", worksOn: [worksOn] });
const raised = (limits, minute) => ({ part: "limits raised", at: at(minute), by: "alice", limits });
const END = (state) => ({ part: "end", at: at(30), state, results: [], draft: null, rounds: [], usage: null, cost: { known: false, usage: null }, reason: null, log: null });

// The record a text holds, read as every caller reads it.
async function recordOf(text, path = "docs/jobs/JOB-20261019-0900-a1b2.md") {
  for await (const record of recordsNewestFirst({ paths: [path], read: async () => text })) return record;
  return null;
}
// A run record: its start, then the parts given, in order.
async function run(parts = [], start = START()) {
  let text = startRecord(start).text;
  for (const part of parts) text = appendToRecord(text, part);
  return recordOf(text);
}
// The row of a job of the run: its state and cost, with the record's fields a run does not read left out.
const row = (job, state = "running", amount = null) => ({ record: { id: job }, product: "https://github.com/alice/product", state, elapsed: 0,
  cost: amount === null ? { known: false, usage: null } : { known: true, amount, currency: "USD", basis: "reported" }, source: { reachable: true, reason: null } });
const ROWS = [row("JOB-20261019-0901-aaaa"), row("JOB-20261019-0902-bbbb")];
const TWO_JOBS = [started("JOB-20261019-0901-aaaa", "ITM-001", 1), started("JOB-20261019-0902-bbbb", "ITM-002", 2)];

// TST-976001 · level: unit · module: MOD-run-planner
// guards: A RUN IS A JOB THAT NAMES ITS JOBS; A RUN HAS LIMITS FIXED AT ITS START; UC-043
// given: a run record for ITM-001 and ITM-002 whose parameters are jobsAtOnce 3, no cost limit and rounds 5, with two `## Job started` parts and a `## Limits raised` part (jobs at once 6, cost 40, rounds 8)
// input: runOf(record, the rows of the two jobs)
// expect: { id: "JOB-20261019-0900-a1b2", selection: ["ITM-001", "ITM-002"], limits: { jobsAtOnce: 6, cost: 40, rounds: 8 }, jobs: the two jobs in the order they were started, each { job, kind: "implement", worksOn }, state: "running" }
test("runOf gives a run's selection, its jobs and the limits it was raised to", async () => {
  const record = await run([...TWO_JOBS, raised({ jobsAtOnce: 6, cost: 40, rounds: 8 }, 10)]);
  assert.equal(typeof planner.runOf, "function", "runOf is built");
  assert.deepEqual(planner.runOf(record, ROWS), {
    id: "JOB-20261019-0900-a1b2", selection: ["ITM-001", "ITM-002"], limits: { jobsAtOnce: 6, cost: 40, rounds: 8 },
    jobs: [{ job: "JOB-20261019-0901-aaaa", kind: "implement", worksOn: "ITM-001" }, { job: "JOB-20261019-0902-bbbb", kind: "implement", worksOn: "ITM-002" }],
    state: "running",
  });
});

// TST-976002 · level: unit · module: MOD-run-planner
// guards: A RUN HAS LIMITS FIXED AT ITS START
// given: the same run without a `## Limits raised` part; and one whose parameters name a cost limit of 25
// input: runOf of each
// expect: the limits of `## Parameters` — { jobsAtOnce: 3, cost: null, rounds: 5 }, and for the second { jobsAtOnce: 3, cost: 25, rounds: 5 }
test("runOf without a raise gives the limits of the run's parameters", async () => {
  assert.deepEqual(planner.runOf(await run(TWO_JOBS), ROWS).limits, { jobsAtOnce: 3, cost: null, rounds: 5 });
  assert.deepEqual(planner.runOf(await run(TWO_JOBS, START("run", { jobsAtOnce: 3, cost: 25, rounds: 5 })), ROWS).limits, { jobsAtOnce: 3, cost: 25, rounds: 5 });
});

// TST-976003 · level: unit · module: MOD-run-planner
// guards: A RUN IS A JOB THAT NAMES ITS JOBS
// given: the record of a job of kind implement; known positive: the same text read as a run record of kind run
// input: runOf of each
// expect: the record of kind run gives a run; the record of kind implement throws a failure named NotARun
test("runOf throws NotARun for a record of another kind", async () => {
  assert.equal(planner.runOf(await run([]), []).id, "JOB-20261019-0900-a1b2");
  const other = await run([], START("implement"));
  assert.equal(other.kind, "implement", "known positive: the record is read, and is of kind implement");
  assert.throws(() => planner.runOf(other, []), { name: "NotARun" });
});

// TST-976004 · level: unit · module: MOD-run-planner
// guards: A RUN HAS LIMITS FIXED AT ITS START
// given: a run raised twice — first to jobs at once 4, cost 30, rounds 6; then, later, to 6, 40, 8 — whose parts stand in that order
// input: runOf(record, rows)
// expect: the limits of the newest raise, { jobsAtOnce: 6, cost: 40, rounds: 8 }, never those of the older one
test("runOf takes the limits of the newest raise, not the oldest", async () => {
  const record = await run([...TWO_JOBS, raised({ jobsAtOnce: 4, cost: 30, rounds: 6 }, 10), raised({ jobsAtOnce: 6, cost: 40, rounds: 8 }, 20)]);
  assert.deepEqual(planner.runOf(record, ROWS).limits, { jobsAtOnce: 6, cost: 40, rounds: 8 });
});

// TST-976005 · level: unit · module: MOD-run-planner
// guards: UC-043
// given: runs of the small record: (a) ended `done`; (b) ended `cancelled`; (c) a job whose row waits at a gate; (d) a cost limit of 10 and rows that report 6 and 5; (e) the same limit and rows that report 6 and 3
// input: runOf of each, with its rows
// expect: (a) finished; (b) stopped; (c) waiting at a gate; (d) held by a limit; (e) running
test("runOf gives the state of a run: finished, stopped, waiting at a gate, held by a limit, running", async () => {
  assert.equal(planner.runOf(await run([...TWO_JOBS, END("done")]), ROWS).state, "finished");
  assert.equal(planner.runOf(await run([...TWO_JOBS, END("cancelled")]), ROWS).state, "stopped");
  assert.equal(planner.runOf(await run(TWO_JOBS), [row("JOB-20261019-0901-aaaa", "waiting at a gate"), row("JOB-20261019-0902-bbbb")]).state, "waiting at a gate");
  const limited = await run(TWO_JOBS, START("run", { jobsAtOnce: 3, cost: 10, rounds: 5 }));
  assert.equal(planner.runOf(limited, [row("JOB-20261019-0901-aaaa", "done", 6), row("JOB-20261019-0902-bbbb", "done", 5)]).state, "held by a limit");
  assert.equal(planner.runOf(limited, [row("JOB-20261019-0901-aaaa", "done", 6), row("JOB-20261019-0902-bbbb", "done", 3)]).state, "running");
});
