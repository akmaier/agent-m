// A writer's notes, and a result that commits nothing (ITM-390) — MOD-job-runner's WriteOutcome, runJob and writeResult as the accepted text of
// docs/architecture/MOD-job-runner.md states them: "`WriteOutcome` — `{ commits, files, pullRequest, shown, notes: string[] }`: what a writer did;
// `shown` is what `return-draft` hands back; `notes` what the writer changed of the draft while writing, one line each, which the job's end record
// lists"; "A writer whose every file already stands on the head byte for byte as it would write it commits nothing and returns an outcome without a
// commit"; `writeResult` "throws what the writer throws by name". For UC-007 4a and 4b and UC-010 4a. The writers that fill the notes are their
// modules' (ITM-336, ITM-338) and the end record is the route's (ITM-319, ITM-327, ITM-365): here the writers are fixtures.
// Run: node --test tests/job-runner-writer-notes.test.mjs
//
// Module: MOD-job-runner
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A RECORD IS EVIDENCE, NOT A PROPOSAL
// Level: unit
//
// The module file says an outcome "without a commit" and gives no other field for it; these tests read it as `commits: []`, the form the module's own
// `return-draft` writes for a writer that wrote nothing. The runner hands the outcome on as the writer gave it, whatever else it holds: it does not
// add, remove or rewrite a field — the one outcome the runner itself makes, `return-draft`'s, carries the field `notes`, empty. The kind and the job
// are fixtures of this file; the writer is a strategy it registers under a name of its own. Each test states its input and its expected result
// before it runs (given / input / expect); where a test asserts that something is not done, the same call is first shown to do it. Nothing reaches
// the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { registerStrategies, runJob, writeResult } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const WRITER = "writer-notes fixture";

// What the fixture writer does in the test that runs: it keeps what it was given and returns, or throws, as the test sets.
let behaviour = async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] });
const calls = [];
registerStrategies("tests/job-runner-writer-notes.test.mjs", { writers: { [WRITER]: async (result, context) => {
  calls.push({ draft: result.draft, context });
  return behaviour(result, context);
} } });

const ANSWER = { type: "object", required: ["files"], properties: { files: { type: "array", items: { type: "object",
  required: ["path", "text"], properties: { path: { type: "string" }, text: { type: "string" } } } } } };
const kindOf = (writer) => ({ name: "fixture-writer", serves: [], participant: "one", needs: ["draft text"], resources: "none",
  preconditions: [], recipes: [], checks: [], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "none",
  writer, limit: 5, purpose: "Writes files, for a test.", prompt: "Write the files.", answer: ANSWER });
const jobOf = (writer) => ({ kind: kindOf(writer), params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 });
const contextOf = (kind) => ({ kind, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) },
  jobId: "JOB-20261011-0800-abcd" });

const DRAFT = { files: [{ path: "docs/use-cases/UC-001-x.md", text: "# UC-001 x\n" }] };
const driver = () => ({ participant: DRAFTER, async send() { return { text: JSON.stringify({ draft: DRAFT, answers: [] }), usage: null }; } });
// A job as runJob ends it where nobody attends, and the same where a person does.
const unattended = (writer = WRITER) => runJob(jobOf(writer), { drafter: driver(), reviewers: [] },
  { attended: false, context: contextOf(kindOf(writer)) });
const attended = async (writer = WRITER) => {
  const job = jobOf(writer);
  const kind = { ...job.kind, review: "person" };
  const waiting = await runJob({ ...job, kind }, { drafter: driver(), reviewers: [] }, { attended: true, context: contextOf(kind) });
  return { job: { ...job, kind }, waiting, context: contextOf(kind) };
};

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-007 4a
// given: a writer that changes the draft while writing and returns one note for each change, with its commit
// input: runJob where nobody attends; then runJob where a person attends, and writeResult on their click with a draft they changed
// expect: the result's `written` is the outcome the writer returned, notes included, in their order, one line each; the same outcome comes from
//         writeResult, whose writer was given the person's draft; known positive first — the writer was called, with the draft
test("runJob and writeResult — the notes of a writer are handed on, in their order", async () => {
  const outcome = { commits: ["c0ffee"], files: ["docs/use-cases/UC-001-x.md"], pullRequest: null, shown: null,
    notes: ["removed the realised name EXPORT, which no requirement states", "changed the class of UC-002 from new to change"] };
  behaviour = async () => outcome;
  calls.length = 0;
  const result = await unattended();
  assert.deepEqual(calls.map((call) => call.draft), [DRAFT], "known positive: the writer was called with the draft");
  assert.deepEqual(result.written, outcome);
  assert.deepEqual(result.written.notes, outcome.notes);
  const { job, waiting, context } = await attended();
  assert.equal(waiting.written, null, "the result waits for the person");
  const theirs = { files: [{ path: "docs/use-cases/UC-001-x.md", text: "# UC-001 x, as the person left it\n" }] };
  assert.deepEqual(await writeResult(job, theirs, { result: waiting, context }), outcome);
  assert.deepEqual(calls.at(-1).draft, theirs, "the writer was given the draft as the person left it");
});

// guards: A RECORD IS EVIDENCE, NOT A PROPOSAL; UC-010 4a
// given: a writer whose every file already stands on the head as it would write it: it commits nothing and returns an outcome without a commit
// input: runJob where nobody attends; writeResult on a person's click
// expect: the outcome as the writer returned it — `commits` empty, no pull request, and its notes, none — and not an outcome with a commit made up
//         by the runner; the same from writeResult; a writer with a commit, called first, gives its commit
test("runJob and writeResult — an outcome without a commit is handed on as it is", async () => {
  behaviour = async () => ({ commits: ["c0ffee"], files: ["a.md"], pullRequest: null, shown: null, notes: [] });
  assert.deepEqual((await unattended()).written.commits, ["c0ffee"], "known positive: a writer's commit is handed on");
  const nothing = { commits: [], files: ["docs/use-cases/UC-001-x.md"], pullRequest: null, shown: null, notes: [] };
  behaviour = async () => nothing;
  const result = await unattended();
  assert.deepEqual(result.written, nothing);
  assert.deepEqual(result.written.commits, []);
  assert.equal(result.written.pullRequest, null);
  const { job, waiting, context } = await attended();
  assert.deepEqual(await writeResult(job, DRAFT, { result: waiting, context }), nothing);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a writer that refuses by name — DueDiligenceMissing for a reuse decision without its due diligence, and a refused commit because the
//        branch moved — after a writer that does not refuse
// input: runJob where nobody attends; writeResult on a person's click
// expect: the writer that does not refuse gives its outcome; each failure thrown by its own name, with its fields, by both, and nothing handed on
test("runJob and writeResult — a writer's failure is thrown by its name, as before", async () => {
  behaviour = async () => ({ commits: ["c0ffee"], files: [], pullRequest: null, shown: null, notes: [] });
  assert.ok((await unattended()).written, "known positive: the writer gives an outcome");
  for (const [name, fields] of [["DueDiligenceMissing", { names: ["ARC-002"] }], ["BranchMoved", { branch: "main" }]]) {
    behaviour = async () => { throw Object.assign(new Error(`${name} for the test`), { name, ...fields }); };
    await assert.rejects(unattended(), (error) => error.name === name && JSON.stringify({ ...error }) === JSON.stringify({ name, ...fields }), name);
    const { job, waiting, context } = await attended();
    await assert.rejects(writeResult(job, DRAFT, { result: waiting, context }), (error) => error.name === name && error.message.includes("for the test"), name);
  }
});

// guards: A RECORD IS EVIDENCE, NOT A PROPOSAL
// given: a kind whose writer is the runner's own `return-draft`, which writes nothing and hands the draft to the caller; the job run where nobody
//        attends, and on a person's click
// input: runJob; writeResult
// expect: `written` is { commits: [], files: [], pullRequest: null, shown: the draft, notes: [] } — notes empty, since it changed nothing — from
//         both, so every outcome the runner makes has the field of the type
test("return-draft — hands the draft back with no commit and no notes", async () => {
  const expected = { commits: [], files: [], pullRequest: null, shown: DRAFT, notes: [] };
  assert.deepEqual((await unattended("return-draft")).written, expected);
  const { job, waiting, context } = await attended("return-draft");
  assert.deepEqual(await writeResult(job, DRAFT, { result: waiting, context }), expected);
});
