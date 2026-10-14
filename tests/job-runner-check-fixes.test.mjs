// The fixes of the checks document-schema and test-declarations — MOD-job-runner as its file now states them under Data
// (Built-in strategies) and Interfaces (Prepared): document-schema reads each drafted document with the schema MOD-documents'
// artifactSchemaOf names for its path and judges none whose path no pattern matches; test-declarations reports a file the
// branch adds that MOD-test-document's isTestFile calls a test file and that declares none, and sends back a branch the host
// does not hold, while any other failure of the host is thrown; prepareJob lists among `blocking` a job of write-tests whose
// context has no product host. The cases of ITM-328 (tests/job-runner-document-schema.test.mjs) and ITM-331
// (tests/job-runner-test-declarations.test.mjs) stand as they are.
// Run: node --test tests/job-runner-check-fixes.test.mjs
//
// Module: MOD-job-runner
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// Guards: DON'T REPEAT YOURSELF; UC-007; UC-026
// Level: unit
//
// The kinds of the first three tests are this file's own, so that a check runs alone, in the loop of one participant; the
// fourth prepares the catalogue's write-tests, whose other strategies are stand-ins this file registers, skipped where a
// module already registered the name. The host is a fixture that serves the branches a test sets through readSnapshot alone,
// and a snapshot is one too — its blob of a file is the file's text, so that equal texts are equal blobs. The driver answers
// from a list — a function there answers what it is sent — and keeps every input it was sent. A finding the module file
// words not at all is compared as [error or warning, the requirement it is reported under], with `what` and `fix` each
// saying something in one line; where the module file leaves the requirement open, the test states the one this file's
// check takes, and the pull request names it. Each test states its input and its expected result before it runs (given /
// input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, registerStrategies, runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the participant, the kinds, the host, the context

const NEEDS = ["read the repository", "write to the repository", "run code and tests"];
const PARTICIPANT = { name: "coder-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", ...NEEDS], place: "this machine", route: "bridge lab-pc agent claude" };

// The answers of a kind that drafts documents, and of write-tests, which reports its branch.
const FILES = { type: "object", required: ["files"], properties: { files: { type: "array", items: { type: "object",
  required: ["path", "text", "class"], properties: { path: { type: "string" }, text: { type: "string" },
    class: { type: "string", enum: ["new", "change", "duplicate", "conflict"] } } } } } };
const REPORT = { type: "object", required: ["branch", "commits", "pullRequest", "tests"], properties: {
  branch: { type: "string" }, commits: { type: "array", items: { type: "string" } }, pullRequest: { type: "string" },
  tests: { type: "array", items: { type: "object", required: ["identifier"],
    properties: { identifier: { type: "string" } } } } } };

// A kind that names the one check: a person reviews its result, so runJob returns it and writes nothing.
const fixtureKind = (name, check, answer, needs) => ({ name, serves: [], participant: "one", needs, resources: "none",
  preconditions: [], recipes: [], checks: [check], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [],
  review: "person", writer: "return-draft", limit: 5, purpose: "A kind for a test.", prompt: "Do the work.", answer });
const DOCUMENTS = fixtureKind("fixture-documents", "document-schema", FILES, ["draft text"]);
const WRITE_TESTS = fixtureKind("fixture-write-tests", "test-declarations", REPORT, NEEDS);
const jobOf = (kind) => ({ kind, params: {}, drafter: PARTICIPANT, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 });

const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product",
  web: "https://github.com/alice/product" };
// A repository at a ref, from the files it holds.
const snapshotOf = (ref, files) => ({ repository: REPOSITORY, ref, commit: null, paths: Object.keys(files).sort(),
  read: async (path) => (path in files ? files[path] : null), blob: (path) => (path in files ? files[path] : null) });
// A host of the product: the branches it holds are the files a test sets, which a participant may change by pushing.
function hostOf(branches) {
  const asked = [];
  return { asked, branches, async readSnapshot(ref) {
    asked.push(ref);
    if (!(ref in branches)) throw Object.assign(new Error(`no branch ${ref}`), { name: "NotFound", what: ref });
    return snapshotOf(ref, branches[ref]);
  } };
}
// A job's context: the product at its default branch, with the host that serves the branches, or without one.
const contextOf = (kind, { main = {}, host = null } = {}) => ({ kind, params: {},
  product: { address: REPOSITORY.web, snapshot: snapshotOf("main", main), host },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [PARTICIPANT],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

// A driver that answers from `answers` in turn — a value is sent as its JSON, a function is called with the input the driver
// was sent and its value sent — and keeps every input it was sent.
function driver(answers) {
  const inputs = [];
  return { participant: PARTICIPANT, inputs, async send(input) {
    inputs.push(input);
    if (answers.length === 0) throw new Error("the drafter was asked more often than the test expects");
    const next = answers.shift();
    return { text: JSON.stringify(typeof next === "function" ? next(input) : next), usage: null };
  } };
}
// What a participant that corrects answers: it pushes `files` to its branch, reports `draft`, and says each finding it was
// sent is fixed.
const correcting = (host, branch, files, draft) => (input) => {
  host.branches[branch] = files;
  return { draft, answers: input.findings.map((found) => ({ finding: formatFinding(found), how: "fixed" })) };
};

const BRANCH = "tests/export-formats";
const report = (commit) => ({ branch: BRANCH, commits: [commit], pullRequest: "#7", tests: [{ identifier: "TST-002" }] });

const brief = (findings) => findings.map((found) => [found.artifact, found.line, found.kind, found.rule])
  .sort((a, b) => a[0].localeCompare(b[0]));
const kindsOf = (findings) => findings.map((found) => [found.kind, found.rule]);
// A finding says what is wrong and what correction is expected, each in one line, and names a line.
function sayItInOneLine(found) {
  assert.ok(Number.isInteger(found.line) && found.line >= 1, `${found.artifact} names a line`);
  for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/, `${found.artifact}: ${text}`);
}

// ---------------------------------------------------------------- document-schema

const FENCE = "```";
// A use case and a backlog item, each whole but for the last of its required sections, which the draft leaves out.
const USE_CASE = `---
id: UC-001
title: Fixture use case
area: fixtures
actors:
  - Author
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
---
# UC-001 Fixture use case

## Actors

- **Author** — starts it.

## Precondition

- Nothing.

## Main flow

1. The author starts it.

${FENCE}mermaid
flowchart LR
    A[Author] --> B[Agent M]
${FENCE}

## Alternative flows

- None.
`;
const ITEM = `---
id: ITM-001
title: Fixture item
level: module
realises:
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-fixture
tests:
  - unit
origin:
  - fixture
---
# ITM-001 Fixture item

## Outcome

An outcome.
`;
const NOT_A_DOCUMENT = "Some words that are no document: no front matter, no title, no sections.\n";

// TST-472316 · level: unit · module: MOD-job-runner
// guards: DON'T REPEAT YOURSELF; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-007
// given: a kind that names document-schema alone; a draft of four files — a use case without its ## Postcondition at docs/use-cases/UC-001-fixture.md, a backlog item without its ## Acceptance at docs/backlog/ITM-001-fixture.md, and two files whose paths no schema's pattern matches, docs/use-cases/UC-1-short.md, whose number has one digit, and docs/notes/loose.md, each holding text that is no document
// input: runJob of it without a drafter, the draft as `from`: the draft is checked once
// expect: two errors, UC-001 under A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION and ITM-001 under THE BACKLOG LIVES IN THE PRODUCT REPOSITORY, each on line 1 — each file judged by the schema of its path —, and nothing for either of the two files whose path no pattern matches; the findings remaining
test("document-schema — a use case and a backlog item are judged by their schemas, and a path no pattern matches is not judged", async () => {
  const draft = { files: [
    { path: "docs/use-cases/UC-001-fixture.md", text: USE_CASE, class: "new" },
    { path: "docs/backlog/ITM-001-fixture.md", text: ITEM, class: "new" },
    { path: "docs/use-cases/UC-1-short.md", text: NOT_A_DOCUMENT, class: "new" },
    { path: "docs/notes/loose.md", text: NOT_A_DOCUMENT, class: "new" },
  ] };

  const result = await runJob(jobOf(DOCUMENTS), { drafter: null, reviewers: [] },
    { attended: true, context: contextOf(DOCUMENTS), from: draft });

  assert.deepEqual(brief(result.remaining), [
    ["ITM-001", 1, "error", "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY"],
    ["UC-001", 1, "error", "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION"],
  ]);
  result.remaining.forEach(sayItInOneLine);
  assert.deepEqual(result.rounds.map((round) => round.findings.length), [2]);
});

// ---------------------------------------------------------------- test-declarations

// A test file whose one declaration is whole, directly before its test case.
const DECLARED = (id) => `// ${id} · level: unit · module: MOD-export
// guards: EXPORT IS A PDF
// given: a report
// input: the report exported
// expect: a PDF file
// TST-584001 · level: unit · module: MOD-job-runner
// guards: EXPORT IS A PDF
// given: a report
// input: the report exported
// expect: a PDF file
test("${id}", () => {});
`;
const PLAIN = 'test("plain", () => {});\n';   // a test file that declares none

// TST-472318 · level: unit · module: MOD-job-runner
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; UC-026
// given: a product whose default branch holds tests/legacy.test.mjs, which declares none; a participant that reports the branch tests/export-formats, on which tests/loose.test.mjs is added declaring none, tests/export.test.mjs is added with the whole TST-001, docs/notes.md is added declaring none and is no test file, and tests/legacy.test.mjs is changed — and, told of the finding, pushes a declaration for tests/loose.test.mjs and reports again
// input: runJob of it, a person attending
// expect: one finding in the first round, an error naming tests/loose.test.mjs under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS, in one line — not tests/export.test.mjs, whose declaration is whole, nor docs/notes.md, which is no test file, nor tests/legacy.test.mjs, which the branch changes and does not add —; the participant asked twice, the second time with that finding; none in the second round; stopped because passed, nothing remaining
test("test-declarations — a test file the branch adds that declares none is reported, one it only changes or that is no test file is not", async () => {
  const main = { "tests/legacy.test.mjs": PLAIN };
  const host = hostOf({ [BRANCH]: { "docs/notes.md": "# Notes\n\nSome words.\n", "tests/export.test.mjs": DECLARED("TST-001"),
    "tests/legacy.test.mjs": `${PLAIN}// edited\n`, "tests/loose.test.mjs": PLAIN } });
  const first = report("c1");
  const corrected = report("c2");
  const pushed = { "docs/notes.md": "# Notes\n\nSome words.\n", "tests/export.test.mjs": DECLARED("TST-001"),
    "tests/legacy.test.mjs": `${PLAIN}// edited\n`, "tests/loose.test.mjs": DECLARED("TST-002") };
  const drafter = driver([{ draft: first }, correcting(host, BRANCH, pushed, corrected)]);

  const result = await runJob(jobOf(WRITE_TESTS), { drafter, reviewers: [] },
    { attended: true, context: contextOf(WRITE_TESTS, { main, host }) });

  const loose = [["tests/loose.test.mjs", "error", "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS"]];
  const named = (findings) => findings.map((found) => [found.artifact, found.kind, found.rule]);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(named(drafter.inputs[1].findings), loose);
  assert.deepEqual(result.rounds.map((round) => [round.number, named(round.findings)]), [[1, loose], [2, []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
  result.rounds[0].findings.forEach(sayItInOneLine);
});

// TST-472319 · level: unit · module: MOD-job-runner
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; UC-026
// given: a product whose host holds no branch yet; a participant that reports the branch tests/export-formats, which it has not pushed, and — told of it — pushes the branch with a whole declaration and reports again; and, apart, a host that fails with Unreachable
// input: runJob of the first, a person attending; runJob of the second
// expect: the first: the participant asked twice; one error in the first round, under A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT, in one line that names the branch; none in the second — the host now holds it, the known positive —; stopped because passed. The second: the job fails with the host's own Unreachable, thrown as it is, the participant asked once — a branch the host does not hold is a finding, any other failure of the host is not
test("test-declarations — a branch the host does not hold is sent back as a finding, and any other failure of the host is thrown", async () => {
  const host = hostOf({});
  const first = report("c1");
  const corrected = report("c2");
  const pushed = { "tests/export.test.mjs": DECLARED("TST-001") };
  const drafter = driver([{ draft: first }, correcting(host, BRANCH, pushed, corrected)]);

  const result = await runJob(jobOf(WRITE_TESTS), { drafter, reviewers: [] },
    { attended: true, context: contextOf(WRITE_TESTS, { host }) });

  const unknown = [["error", "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT"]];
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(kindsOf(drafter.inputs[1].findings), unknown);
  assert.ok(drafter.inputs[1].findings[0].what.includes(BRANCH), drafter.inputs[1].findings[0].what);
  assert.deepEqual(result.rounds.map((round) => [round.number, kindsOf(round.findings)]), [[1, unknown], [2, []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
  result.rounds[0].findings.forEach(sayItInOneLine);

  const unreachable = Object.assign(new Error("the server could not be reached"), { name: "Unreachable", reason: "offline" });
  const asked = driver([{ draft: first }]);
  await assert.rejects(runJob(jobOf(WRITE_TESTS), { drafter: asked, reviewers: [] },
    { attended: true, context: contextOf(WRITE_TESTS, { host: { readSnapshot: async () => { throw unreachable; } } }) }),
  (error) => error === unreachable);
  assert.equal(asked.inputs.length, 1);
});

// ---------------------------------------------------------------- prepareJob

// The strategies of write-tests that no module offers yet.
const part = (name) => ({ name, text: `the text of ${name}`, size: 0, sources: [], required: true });
for (const [category, strategies] of Object.entries({
  preconditions: { "rests-on-accepted": async () => null },
  recipes: { "test-selection": async () => [part("selection")], "chapters-for-tests": async () => [part("chapter 13")] },
  checks: { "test-proposals": () => [] },
  writers: { "branch-and-pull-request": async () => ({ commits: [], files: [], pullRequest: null, shown: null }) },
})) {
  for (const [name, strategy] of Object.entries(strategies)) {
    try {
      registerStrategies("tests/job-runner-check-fixes.test.mjs", { [category]: { [name]: strategy } });
    } catch (error) {
      if (error.name !== "DuplicateStrategy") throw error;
    }
  }
}

// TST-472320 · level: unit · module: MOD-job-runner
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; UC-026
// given: the catalogue's write-tests, whose check test-declarations reads the branch the participant reports; known positive first — the job's context with the product's host; then the same context without it
// input: prepareJob of write-tests for each; then runJob of the job prepared without the host
// expect: with the host, nothing blocking; without it, one error under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS, in one line, among `blocking`; runJob refuses that job as NotStartable and the participant is asked nothing
test("prepareJob — a job of write-tests without the product's host is blocked before it starts", async () => {
  const choice = { drafter: PARTICIPANT, reviewers: [] };
  const kind = await kindOf("write-tests");
  const withHost = await prepareJob("write-tests", contextOf(kind, { host: hostOf({}) }), choice);
  assert.deepEqual(withHost.blocking, []);

  const context = contextOf(kind);
  const job = await prepareJob("write-tests", context, choice);
  assert.deepEqual(kindsOf(job.blocking), [["error", "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS"]]);
  job.blocking.forEach(sayItInOneLine);

  const drafter = driver([]);
  await assert.rejects(runJob(job, { drafter, reviewers: [] }, { attended: false, context }),
    (error) => error.name === "NotStartable");
  assert.equal(drafter.inputs.length, 0);
});
