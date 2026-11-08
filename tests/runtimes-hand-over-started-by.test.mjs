// A piece of a conversation's plan handed over in the run of the conversation's own job (UC-049 4f), as the accepted text of docs/architecture/MOD-runtimes.md states
// handOverJob: it "commits `start` as the person's commit on the head that was read … and, for a start whose `startedBy` names a job, in the same commit that job's `Job
// started` part, through MOD-job-ledger's `appendToRecord`, as `queueJob` appends a run's"; and MOD-job-ledger's `## Job started`: "in the record of a run, or of a
// conversation's job that planned pieces (UC-049 4f): `job:` the identifier of a job it started, `kind:`, `works on:` — one part per job, committed together with that
// job's start record"; `started_by`: "the account whose click started it, or the run or the job that started it".
// Run: node --test tests/runtimes-hand-over-started-by.test.mjs
//
// Module: MOD-runtimes · MOD-job-ledger
// Guards: A RUN IS A JOB THAT NAMES ITS JOBS; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-049; UC-036
// Level: unit
//
// The repository server is the fake host of tests/runtimes-hand-over-fixture.mjs, which keeps every commit; the Bridge a fixture behind the global `fetch`. Each test states
// its input and its expected result before it runs (given / input / expect). Readings of the texts this file takes: a `startedBy` names a job where it is a job identifier
// (`JOB-…`); a job it names whose record the head does not hold is refused with RuntimeError NotFound, naming the record, before anything is written.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { recordsNewestFirst, startRecord } from "../src/job-ledger/index.mjs";

// A record read as every caller reads it, through MOD-job-ledger's recordsNewestFirst, from a snapshot that holds that one file.
async function readRecord(path, text) {
  for await (const record of recordsNewestFirst({ paths: [path], read: async () => text })) return record;
  return null;
}
import { BRIDGE_ROUTE, CI_HOSTED, START, TASK, bridgeNamed, fakeHost, installBridge, preparedOf, restoreFetch } from "./runtimes-hand-over-fixture.mjs";

test.afterEach(restoreFetch);

const NO_ENDPOINT = { endpoint: null, bridge: null };
// The conversation's own job, which planned the piece: its record stands on the head.
const CONVERSATION = { ...START, id: "JOB-20261016-0900-c0c0", kind: "converse", worksOn: ["https://github.com/alice/product"], task: "with the hand-over" };
const CONVERSATION_PATH = `docs/jobs/${CONVERSATION.id}.md`;
const PIECE = { ...START, startedBy: CONVERSATION.id };

// The fake host with the conversation's record committed on its head.
async function withConversation() {
  const run = fakeHost({});
  const { path, text } = startRecord(CONVERSATION);
  await run.host.commitFiles({ branch: "trunk", expectedHead: run.head(), files: [{ path, text }], message: "Queue job" });
  run.writes.length = 0;
  run.events.length = 0;
  return run;
}

// TST-2026114905 · level: unit · module: MOD-runtimes
// guards: A RUN IS A JOB THAT NAMES ITS JOBS; UC-049
// given: a head holding the record of the conversation's job JOB-20261016-0900-c0c0; known positive first: a start whose startedBy is the person alice commits the piece's record alone
// input: handOverJob of a piece whose start's startedBy is JOB-20261016-0900-c0c0, on the CI route, and on a Bridge route
// expect: one commit each, holding two files — the piece's record, whose started_by is the conversation's job, and the conversation's record, which then reads with one `Job started` part: job the piece's identifier, kind write-tests, works on ITM-495 —; on the CI route the workflow is started after that commit, with the inputs job and task
test("TST-2026114905: a piece whose start names the conversation's job appends that job's Job started part in the same commit", async () => {
  const person = await withConversation();
  await runtimes.handOverJob(preparedOf(), CI_HOSTED, START, person.host, person.head(), TASK, NO_ENDPOINT);
  assert.deepEqual(person.writes[0].files.map((file) => file.path), [`docs/jobs/${START.id}.md`], "known positive: a person's start commits the piece's record alone");

  for (const [route, target] of [[CI_HOSTED, NO_ENDPOINT], [BRIDGE_ROUTE, { endpoint: null, bridge: bridgeNamed("lab-pc") }]]) {
    const run = await withConversation();
    installBridge(() => run.writes.length);
    await runtimes.handOverJob(preparedOf(), route, PIECE, run.host, run.head(), TASK, target);
    assert.equal(run.writes.length, 1, `${route.kind}: one commit`);
    const files = Object.fromEntries(run.writes[0].files.map((file) => [file.path, file.text]));
    assert.deepEqual(Object.keys(files).sort(), [CONVERSATION_PATH, `docs/jobs/${START.id}.md`].sort(), route.kind);
    assert.equal((await readRecord(`docs/jobs/${START.id}.md`, files[`docs/jobs/${START.id}.md`])).startedBy, CONVERSATION.id, route.kind);
    const conversation = await readRecord(CONVERSATION_PATH, files[CONVERSATION_PATH]);
    assert.deepEqual(conversation.jobs.map(({ job, kind, worksOn }) => ({ job, kind, worksOn })), [{ job: START.id, kind: "write-tests", worksOn: ["ITM-495"] }], route.kind);
    if (route.kind === "ci") {
      assert.deepEqual(run.events.map(([what]) => what), ["commit", "start"]);
      assert.deepEqual(run.starts[0].inputs, { job: START.id, task: TASK });
    }
  }
});

// TST-2026114906 · level: unit · module: MOD-runtimes
// guards: A RUN IS A JOB THAT NAMES ITS JOBS
// given: a head that holds no record of JOB-20261016-0900-c0c0; the known positive of TST-2026114905, whose head holds it
// input: handOverJob of the piece whose startedBy is JOB-20261016-0900-c0c0, on the CI route
// expect: rejects with RuntimeError NotFound naming docs/jobs/JOB-20261016-0900-c0c0.md; nothing committed, no workflow started
test("TST-2026114906: a piece whose start names a job the head does not hold is refused before anything is written", async () => {
  const run = fakeHost({});
  await assert.rejects(runtimes.handOverJob(preparedOf(), CI_HOSTED, PIECE, run.host, run.head(), TASK, NO_ENDPOINT), (error) => {
    assert.equal(error.name, "NotFound");
    assert.match(error.message, /docs\/jobs\/JOB-20261016-0900-c0c0\.md/);
    return true;
  });
  assert.deepEqual([run.writes.length, run.starts.length], [0, 0]);
});
