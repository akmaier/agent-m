// An added test without a declaration, not a file without a test (ITM-449) — the check `test-declarations` of MOD-job-runner, as docs/architecture/MOD-job-runner.md states it
// (Data: "an error under `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS` for a file the branch adds that `isTestFile` calls a test file and that declares none") and as the Product
// Owner's answer to #341 reads it: the check "reports an added test, not a file, and a fixture holds no test" (docs/backlog/sprints/team1/14.md). For UC-026.
// Run: node --test tests/job-runner-test-case.test.mjs
//
// Module: MOD-job-runner
// Guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
// Level: unit
//
// A file the branch adds under `tests/` that holds no test case has nothing to declare: a fixture, a data file, a helper. How the check tells a test case in a file is this reading, by
// its language's form of one at the start of a line: JavaScript and TypeScript (`.js .mjs .cjs .jsx .ts .tsx`) — `test(`, `it(`, `describe(` and their `.only` / `.skip` / `.todo` forms;
// Python (`.py`) — `def test…(` and `async def test…(`; Go (`.go`) — `func Test…(`; Rust (`.rs`) — `#[test]`; Java and Kotlin (`.java .kt`) — `@Test`. A line that is a comment, a name that only ends
// in `test(` (`attest(`) and a file of another language or of data hold none. A Markdown file holds a test case where it has a `### TST-` heading, which is its declaration. `isTestFile` stays as it
// is. The drafts are the report of `write-tests` and the branch is a fixture of the host, as tests/job-runner-test-declarations.test.mjs does it; the loop is limited to one round so that the
// first round's findings are the result. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts an absence of a finding, a file that must
// be found is in the same branch. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { runJob } from "../src/job-runner/index.mjs";

const NEEDS = ["read the repository", "write to the repository", "run code and tests"];
const DRAFTER = { name: "coder-a", type: "CLI agent", model: "example-model", context: 200000, price: null, capabilities: NEEDS, place: "this machine", route: "bridge lab-pc agent claude" };
const REPORT = { type: "object", required: ["branch", "commits", "pullRequest", "tests"], properties: { branch: { type: "string" }, commits: { type: "array", items: { type: "string" } },
  pullRequest: { type: "string" }, tests: { type: "array", items: { type: "object", required: ["identifier"], properties: { identifier: { type: "string" } } } } } };
const KIND = { name: "fixture-write-tests", serves: [], participant: "one", needs: NEEDS, resources: "product", preconditions: [], recipes: [], checks: ["test-declarations"], personDecides: [],
  reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft", limit: 1, purpose: "Writes tests, for a test.", prompt: "Write the tests.", answer: REPORT };
const JOB = { kind: KIND, params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 1 };
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const BRANCH = "tests/added";
const snapshotOf = (ref, files) => ({ repository: REPOSITORY, ref, commit: null, paths: Object.keys(files).sort(), read: async (path) => (path in files ? files[path] : null),
  blob: (path) => (path in files ? files[path] : null) });
const contextOf = (added) => ({ kind: KIND, params: {}, product: { address: REPOSITORY.web, snapshot: snapshotOf("main", {}), host: { readSnapshot: async () => snapshotOf(BRANCH, added) } },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [], person: "alice",
  now: new Date("2026-10-13T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });
const report = { branch: BRANCH, commits: ["c1"], pullRequest: "#7", tests: [] };
const drafter = { participant: DRAFTER, async send() { return { text: JSON.stringify({ draft: report, answers: [] }), usage: null }; } };
// The paths the check reports for a branch that adds these files, and the rule of each.
async function reported(added) {
  const result = await runJob(JOB, { drafter, reviewers: [] }, { attended: true, context: contextOf(added) });
  return result.rounds[0].findings.map((found) => [found.artifact, found.rule]);
}
const RULE = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS";
const DECLARATION = (id) => `// ${id} · level: unit · module: MOD-export\n// guards: EXPORT IS A PDF\n// given: a report\n// input: the report exported\n// expect: a PDF file\n`;

// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; UC-026
// given: a branch that adds, under tests/, a JSON fixture, a helper module that exports a value, a Python helper with a function that is no test, a Markdown note, a file named as tests are
//        named that holds only helpers, a source file outside tests/ that calls a function named `test`, and — as the known positive — an undeclared test file
// input: runJob with the test-declarations check
// expect: one finding, for the undeclared test file; none for the fixture, the helpers, the note, the source file (no test file) or the file named as a test that holds no test case
test("test-declarations — a fixture or a helper the branch adds under tests/ is not reported, an undeclared test is", async () => {
  const found = await reported({
    "tests/fixtures/data.json": '{ "rows": [1, 2, 3] }\n',
    "tests/helper.mjs": "export const rows = [1, 2, 3];\nexport function attest(value) { return value; }\n",
    "tests/helpers.py": "def build_rows():\n    return [1, 2, 3]\n",
    "tests/README.md": "# The tests\n\nHow they are run.\n",
    "tests/test_util.py": "def make_rows():\n    return [1]\n",
    "src/not-a-test.mjs": 'test("a function of this name, in a source file");\n',
    "tests/loose.test.mjs": 'test("plain", () => {});\n',
  });
  assert.deepEqual(found, [["tests/loose.test.mjs", RULE]]);
});

// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a branch that adds a test file with a test case and its whole declaration, a Python one and a Markdown manual test; known positive first — the same JavaScript file without its declaration
// input: runJob with the check
// expect: the undeclared one reported; the three with their declarations give no finding
test("test-declarations — an added test case with its declaration passes", async () => {
  assert.deepEqual(await reported({ "tests/a.test.mjs": 'test("a", () => {});\n' }), [["tests/a.test.mjs", RULE]], "known positive");
  const found = await reported({
    "tests/a.test.mjs": `${DECLARATION("TST-001")}test("a", () => {});\n`,
    "tests/test_b.py": "# TST-002 · level: unit · module: MOD-export\n# guards: EXPORT IS A PDF\n# given: a report\n# input: the report exported\n# expect: a PDF file\ndef test_b():\n    pass\n",
    "tests/manual.md": "### TST-003 A manual test\nlevel: user\nmodule: MOD-export\nguards: EXPORT IS A PDF\ngiven: a report\ninput: the page\nexpect: a PDF\n",
  });
  assert.deepEqual(found, []);
});

// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a branch that adds, each undeclared, a test file in each language's form of a test case: JavaScript `test(`, `it(`, `describe.skip(`, indented in a block; TypeScript; Python `def test_…` and
//        `async def test_…`; Go `func Test…(`; Rust `#[test]`; Java `@Test` — and, for each of those languages, a helper file of the same kind with no test case in it, with `test(` only in a comment
//        or in a longer name
// input: runJob with the check
// expect: every file with a test case reported, in path order; no helper reported
test("test-declarations — a test case is told by its language's form of one", async () => {
  const withCase = {
    "tests/a.test.mjs": 'test("a", () => {});\n', "tests/b.spec.js": 'it("b", () => {});\n', "tests/c.test.mjs": 'describe("c", () => {});\n', "tests/c2.test.mjs": 'test.skip("c2", () => {});\n', "tests/c3.test.mjs": '{\n  it("c3", () => {});\n}\n',
    "tests/d.test.ts": 'import test from "node:test";\n  test("e", () => {});\n', "tests/test_e.py": "import unittest\n\ndef test_e():\n    pass\n", "tests/test_f.py": "async def test_f():\n    pass\n",
    "tests/g_test.go": "package g\n\nfunc TestG(t *testing.T) {}\n", "tests/h.rs": "#[test]\nfn h() {}\n", "tests/I.java": "class I {\n  @Test\n  void i() {}\n}\n",
  };
  const helpers = {
    "tests/h1.mjs": "// test(this) is how it is called\nexport const attest = (v) => v;\nexport function contest(v) { return v; }\n", "tests/h2.py": "# def test_x(): described here\ndef latest_test_data():\n    return 1\n",
    "tests/h3.go": "package g\n\nfunc helper() {}\n", "tests/h4.rs": "fn helper() {}\n", "tests/H5.java": "class H5 {}\n", "tests/h6.txt": "test(\"not a language we read\")\n",
  };
  assert.deepEqual((await reported({ ...helpers, ...withCase })).map(([path]) => path), Object.keys(withCase).sort());
  assert.deepEqual(await reported(helpers), []);
});

// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a Markdown file under tests/ with a heading that is no test's, and one with a `### TST-` heading
// input: runJob with the check
// expect: neither is reported for want of a declaration: the first holds no test, the second declares one (its keys are judged as ever, here complete)
test("test-declarations — a Markdown file holds a test case where it has a TST heading, which is its declaration", async () => {
  assert.deepEqual(await reported({ "tests/notes.md": "### A heading\n\nWords.\n" }), []);
  assert.deepEqual(await reported({ "tests/manual.md": "### TST-009 A manual test\nlevel: user\nmodule: MOD-export\nguards: EXPORT IS A PDF\ngiven: a report\ninput: the page\nexpect: a PDF\n" }), []);
});
