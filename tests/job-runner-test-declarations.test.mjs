// The built-in check test-declarations — MOD-job-runner's correction loop with a kind that names it, as
// docs/architecture/MOD-job-runner.md states it under Data (Built-in strategies) and Files: MOD-test-document's testFindings
// on every declaration in the files that the branch a coding participant reports adds or changes — the branch read through
// the product's host with MOD-repository-hosts' readSnapshot, each file with MOD-test-document's testDeclarations.
// Run: node --test tests/job-runner-test-declarations.test.mjs
//
// Module: MOD-job-runner
// Guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; EVERY TEST HAS ONE LEVEL; UC-026
// Guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// The kind is this file's own, so that the check runs alone, in the loop of one coding participant whose answer is the report
// the catalogue's write-tests asks for. The host is a fixture that serves the branches a test sets, through readSnapshot
// alone, and keeps the refs it was asked for; a snapshot is a fixture too — its blob of a file is the file's text, so that
// equal texts are equal blobs — and the product's own snapshot is the state the branch is compared with. The driver answers
// from a list — a function there answers what it is sent — and keeps every input it was sent. A finding is compared as
// [the test it names, the line of its declaration, error or warning, the requirement it is reported under], sorted by test,
// since the module file does not state the order; of `what` and `fix` a test asks only that each says something in one
// line, as the module file of MOD-test-document does not word them. Each test states its input and its expected result
// before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

// ---------------------------------------------------------------- the kind, the host, the driver, the context

const NEEDS = ["read the repository", "write to the repository", "run code and tests"];
const DRAFTER = { name: "coder-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: NEEDS, place: "this machine", route: "bridge lab-pc agent claude" };

// The answer of write-tests: the branch, its commits, the pull request, and each test with its outcome and counter-proof.
const REPORT = { type: "object", required: ["branch", "commits", "pullRequest", "tests"], properties: {
  branch: { type: "string" }, commits: { type: "array", items: { type: "string" } }, pullRequest: { type: "string" },
  tests: { type: "array", items: { type: "object", required: ["identifier"], properties: { identifier: { type: "string" },
    outcome: { type: "string", enum: ["passed", "failed"] }, counterProof: { type: "string" },
    notWritten: { type: "string" } } } } } };

// A kind that names the check and no other: a person reviews its result, so runJob returns it and writes nothing.
const KIND = { name: "fixture-write-tests", serves: [], participant: "one", needs: NEEDS, resources: "product",
  preconditions: [], recipes: [], checks: ["test-declarations"], personDecides: [], reviewer: null, reviewers: 0, steps: [],
  gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Writes tests, for a test.",
  prompt: "Write the tests.", answer: REPORT };
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true,
  notFitting: [], leftOut: [], blocking: [], limit: 5 };

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
// A job's context: the product at its default branch, which a branch is compared with, and the host that serves the branch.
const contextOf = (main, host) => ({ kind: KIND, params: {},
  product: { address: REPOSITORY.web, snapshot: snapshotOf("main", main), host },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER],
  places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-11T08:00:00Z"),
  agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

// A driver that answers from `answers` in turn — a value is sent as its JSON, a function is called with the input the driver
// was sent and its value sent — and keeps every input it was sent.
function driver(answers) {
  const inputs = [];
  return { participant: DRAFTER, inputs, async send(input) {
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

// ---------------------------------------------------------------- the test files

// A test file of MOD-export, as it stands on the default branch: one complete declaration, TST-003, directly before its test
// case, which ends on line 6.
const EXPORT = `// TST-003 · level: unit · module: MOD-export
// guards: EXPORT IS A PDF
// given: a report
// input: the report exported
// expect: a PDF file
test("TST-003", () => {});
`;
// The same file with a second declaration, TST-004, whose first line is line 8 — without a level, or with one.
const TST_004 = (level) => `// TST-004 · ${level}module: MOD-export
// guards: EXPORT AS CSV
// given: a report
// input: the report exported as CSV
// expect: a CSV file
test("TST-004", () => {});
`;
const EXPORT_WITHOUT_LEVEL = `${EXPORT}\n${TST_004("")}`;
const EXPORT_WITH_LEVEL = `${EXPORT}\n${TST_004("level: unit · ")}`;
// A new test file with one declaration, TST-002, on line 1 — without its expected result, or with it.
const TST_002 = (expect) => `// TST-002 · level: unit · module: MOD-export
// guards: EXPORT AS CSV
// given: a report
// input: the report exported as CSV
${expect}test("TST-002", () => {});
`;
const CSV_WITHOUT_EXPECT = TST_002("");
const CSV_COMPLETE = TST_002("// expect: a CSV file\n");
// A test file of the default branch that declares no input and no expected result: a declaration the product has had.
const LEGACY = `// TST-001 · level: unit · module: MOD-legacy
// guards: A LEGACY RULE
// given: a state
test("TST-001", () => {});
`;

const BRANCH = "tests/export-formats";
const report = (commit, ids) => ({ branch: BRANCH, commits: [commit], pullRequest: "#7",
  tests: ids.map((identifier) => ({ identifier, outcome: "failed", counterProof: "a planted fault made it fail" })) });

const brief = (findings) => findings.map((found) => [found.artifact, found.line, found.kind, found.rule])
  .sort((a, b) => a[0].localeCompare(b[0]));
// A finding says what is wrong and what correction is expected, each in one line.
function sayItInOneLine(found) {
  for (const text of [found.what, found.fix]) assert.match(text, /^[^\n]+$/, `${found.artifact}: ${text}`);
}

// ---------------------------------------------------------------- the correction loop

// TST-472369 · level: unit · module: MOD-job-runner
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; EVERY TEST HAS ONE LEVEL; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// given: a product whose default branch holds tests/export.test.mjs with the complete declaration TST-003; a participant that reports the branch tests/export-formats, on which tests/csv.test.mjs is added with TST-002 declaring no expected result and tests/export.test.mjs is changed by TST-004, which declares no level — and, told of both, pushes both declarations complete and reports again
// input: runJob of it, a person attending
// expect: the host asked for the reported branch and for no other; the participant asked twice, the second time with two findings and the first report: TST-002 on line 1, an error under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS, and TST-004 on line 8, an error under EVERY TEST HAS ONE LEVEL — TST-003, complete and in a changed file, is not found —, each in one line; two rounds, the first with both answered fixed, the second with none; stopped because passed; the second report the result's draft, nothing remaining
test("test-declarations — a test added or changed without what it must declare goes back to the participant, and the corrected branch ends the loop", async () => {
  const host = hostOf({ [BRANCH]: { "tests/csv.test.mjs": CSV_WITHOUT_EXPECT,
    "tests/export.test.mjs": EXPORT_WITHOUT_LEVEL } });
  const first = report("c1", ["TST-002", "TST-004"]);
  const corrected = report("c2", ["TST-002", "TST-004"]);
  const pushed = { "tests/csv.test.mjs": CSV_COMPLETE, "tests/export.test.mjs": EXPORT_WITH_LEVEL };
  const drafter = driver([{ draft: first }, correcting(host, BRANCH, pushed, corrected)]);

  const result = await runJob(JOB, { drafter, reviewers: [] },
    { attended: true, context: contextOf({ "tests/export.test.mjs": EXPORT }, host) });

  const missing = [["TST-002", 1, "error", "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS"],
    ["TST-004", 8, "error", "EVERY TEST HAS ONE LEVEL"]];
  assert.ok(host.asked.length > 0 && host.asked.every((ref) => ref === BRANCH), `the host was asked for ${host.asked}`);
  assert.equal(drafter.inputs.length, 2);
  assert.deepEqual(brief(drafter.inputs[1].findings), missing);
  assert.equal(drafter.inputs[1].previous, JSON.stringify(first, null, 2));
  assert.deepEqual(result.rounds.map((round) => [round.number, brief(round.findings), round.answers.map((a) => a.how)]),
    [[1, missing, ["fixed", "fixed"]], [2, [], []]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.remaining], [corrected, "passed", []]);
  result.rounds[0].findings.forEach(sayItInOneLine);
});

// TST-472370 · level: unit · module: MOD-job-runner
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a product whose default branch holds tests/legacy.test.mjs with TST-001, which declares no input and no expected result, and tests/export.test.mjs with TST-003; known positive first — a branch that changes tests/legacy.test.mjs and adds tests/csv.test.mjs with the complete TST-002, the limit of rounds 1; then a branch that leaves tests/legacy.test.mjs as it is and adds the same tests/csv.test.mjs
// input: runJob of each, a person attending
// expect: the first: TST-001 found twice, on line 1 — an error under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS for its input and one for its expected result —, nothing found for TST-002, the findings remaining at the limit; the second: the participant asked once, nothing found — the declaration in the unchanged file is not checked, and the complete one passes —, stopped because passed, nothing remaining; the host asked for the reported branch only
test("test-declarations — a declaration in an unchanged file is not checked, and a complete one passes", async () => {
  const main = { "tests/export.test.mjs": EXPORT, "tests/legacy.test.mjs": LEGACY };
  const touched = hostOf({ [BRANCH]: { ...main, "tests/csv.test.mjs": CSV_COMPLETE, "tests/legacy.test.mjs": `${LEGACY}\n` } });
  const known = await runJob({ ...JOB, limit: 1 }, { drafter: driver([{ draft: report("c1", ["TST-002"]) }]), reviewers: [] },
    { attended: true, context: contextOf(main, touched) });
  const legacy = ["TST-001", 1, "error", "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS"];
  assert.deepEqual([brief(known.remaining), known.stoppedBecause], [[legacy, legacy], "limit"]);

  const host = hostOf({ [BRANCH]: { ...main, "tests/csv.test.mjs": CSV_COMPLETE } });
  const drafter = driver([{ draft: report("c1", ["TST-002"]) }]);
  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: contextOf(main, host) });

  assert.ok(host.asked.length > 0 && host.asked.every((ref) => ref === BRANCH), `the host was asked for ${host.asked}`);
  assert.equal(drafter.inputs.length, 1);
  assert.deepEqual(result.rounds.map((round) => [round.number, brief(round.findings)]), [[1, []]]);
  assert.deepEqual([result.stoppedBecause, result.remaining], ["passed", []]);
});
