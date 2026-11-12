// A job of a run queued (UC-043 step 5), as the accepted text of docs/architecture/MOD-runtimes.md states queueJob: "For a job of a run (`start.run`), the same commit
// appends a `Job started` part to the run's record, through MOD-job-ledger's `appendToRecord`: two starts of the same job cannot both land, since the second commit is
// refused on a head that moved"; and MOD-job-ledger's `## Job started`: "in the record of a run …: `job:` the identifier of a job it started, `kind:`, `works on:` — one
// part per job, committed together with that job's start record".
// Run: node --test tests/runtimes-queue-run.test.mjs
//
// Module: MOD-runtimes · MOD-job-ledger
// Guards: A RUN IS A JOB THAT NAMES ITS JOBS; A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS; UC-043
// Level: unit
//
// The repository server is the fake host of tests/runtimes-hand-over-fixture.mjs, which keeps every commit; the Bridge is given no handle, so that it takes the job when it
// next reads the repository. Each test states its input and its expected result before it runs (given / input / expect). Reading of the text this file takes: a run whose
// record the head does not hold is refused with RuntimeError NotFound, naming the record, before anything is written — as a hand-over's job that names its job is.

import test from "node:test";
import assert from "node:assert/strict";
import { queueJob } from "../src/runtimes/index.mjs";
import { recordsNewestFirst, startRecord } from "../src/job-ledger/index.mjs";
import { BRIDGE_ROUTE, CI_HOSTED, START, fakeHost } from "./runtimes-hand-over-fixture.mjs";

async function readRecord(path, text) {
  for await (const record of recordsNewestFirst({ paths: [path], read: async () => text })) return record;
  return null;
}

// The run's record: a job of kind `run` over ITM-001, with its limits as parameters (MOD-run-planner, Data).
const RUN = { ...START, id: "JOB-20261111-0800-a0a0", kind: "run", worksOn: ["ITM-001"], participant: null, model: null, route: "ci hosted", task: "in parameters",
  destinations: [], params: { jobsAtOnce: 3, cost: null, rounds: 5 } };
const RUN_PATH = `docs/jobs/${RUN.id}.md`;
// A job the run starts: set-up-ci, then implement ITM-001, each naming the run.
const JOB = { ...START, id: "JOB-20261111-0805-b1b1", kind: "implement", worksOn: ["ITM-001"], run: RUN.id, startedBy: RUN.id, task: "in parameters" };
const JOB_PATH = `docs/jobs/${JOB.id}.md`;

async function withRun() {
  const run = fakeHost({});
  const { path, text } = startRecord(RUN);
  await run.host.commitFiles({ branch: "trunk", expectedHead: run.head(), files: [{ path, text }], message: "Queue job" });
  run.writes.length = 0;
  run.events.length = 0;
  return run;
}

// TST-20261111701 · level: unit · module: MOD-runtimes
// guards: A RUN IS A JOB THAT NAMES ITS JOBS; UC-043
// given: a head holding the record of the run JOB-20261111-0800-a0a0; known positive first: a start that names no run commits its own record alone
// input: queueJob of a start whose run is JOB-20261111-0800-a0a0, on the CI route and on a Bridge route
// expect: one commit each, holding two files — the job's record, whose run is the run, and the run's record, which then reads with one `Job started` part: job the job's
// identifier, kind implement, works on ITM-001
test("TST-20261111701: a job of a run is queued in one commit with the run's Job started part", async () => {
  const person = await withRun();
  await queueJob(person.host, { ...JOB, run: null, startedBy: "alice" }, CI_HOSTED, person.head());
  assert.deepEqual(person.writes[0].files.map((file) => file.path), [JOB_PATH], "known positive: a job of no run commits its record alone");

  for (const route of [CI_HOSTED, BRIDGE_ROUTE]) {
    const run = await withRun();
    await queueJob(run.host, JOB, route, run.head());
    assert.equal(run.writes.length, 1, `${route.kind}: one commit`);
    const files = Object.fromEntries(run.writes[0].files.map((file) => [file.path, file.text]));
    assert.deepEqual(Object.keys(files).sort(), [JOB_PATH, RUN_PATH].sort(), route.kind);
    assert.equal((await readRecord(JOB_PATH, files[JOB_PATH])).run, RUN.id, route.kind);
    const record = await readRecord(RUN_PATH, files[RUN_PATH]);
    assert.deepEqual(record.jobs.map(({ job, kind, worksOn }) => ({ job, kind, worksOn })), [{ job: JOB.id, kind: "implement", worksOn: ["ITM-001"] }], route.kind);
  }
});

// TST-20261111702 · level: unit · module: MOD-runtimes
// guards: A RUN IS A JOB THAT NAMES ITS JOBS
// given: a head that holds no record of the run JOB-20261111-0800-a0a0; the known positive of TST-20261111701, whose head holds it
// input: queueJob of the job whose run is JOB-20261111-0800-a0a0, on the CI route
// expect: rejects with RuntimeError NotFound naming docs/jobs/JOB-20261111-0800-a0a0.md; nothing committed
test("TST-20261111702: a job of a run the head does not hold is refused before anything is written", async () => {
  const run = fakeHost({});
  await assert.rejects(queueJob(run.host, JOB, CI_HOSTED, run.head()), (error) => {
    assert.equal(error.name, "NotFound");
    assert.match(error.message, /docs\/jobs\/JOB-20261111-0800-a0a0\.md/);
    return true;
  });
  assert.equal(run.writes.length, 0);
});
