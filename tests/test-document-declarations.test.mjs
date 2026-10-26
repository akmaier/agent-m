// The declarations of the tests (ITM-248) — MOD-test-document's interface as docs/architecture/MOD-test-document.md
// states it: TestDeclaration and testDeclarations, reading every test declaration of a test file from the comment lines
// of its language — `//`, `#`, `--`, `;` or ` *` inside a block comment — or, for a Markdown file, from a heading
// `### TST-<nnn> <title>`. testFindings is not part of ITM-248 and is not tested here.
// Run: node --test tests/test-document-declarations.test.mjs
//
// Module: MOD-test-document
// Guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// Level: unit
//
// Every expected value is read from the module file's Data table and its example. Each test states its input and its
// expected result before it runs (given / input / expect); where a test asserts that nothing is found, the same call is
// first shown to find something on a known positive (ends-at-non-form-line, no-declaration). The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testDeclarations } from "../src/test-document/index.mjs";

// ---------------------------------------------------------------- a declaration with every key, one per comment marker
//
// Given: a declaration in the comment marker named, with every key MOD-test-document's Data table lists, each on its own
// line after the identifier. Input: that file's text. Expect: one TestDeclaration with every key read, `path` the name
// given and `line` the identifier's line (from 1).

const FULL = {
  level: "unit",
  module: "MOD-sample",
  guards: ["A SAMPLE REQUIREMENT", "UC-900"],
  given: "a sample precondition",
  input: "a sample input",
  expect: "a sample expected result",
  runs: 3,
  phrasings: 2,
  paid: "a sample service",
};

function fullExpected(id, path, line) {
  return { id, title: null, path, line, ...FULL };
}

// The text of a test file, every key of FULL on its own line in `marker`'s comment, the identifier `id` on the first.
function markerText(marker, id) {
  return [
    `${marker} ${id}`,
    `${marker} level: ${FULL.level}`,
    `${marker} module: ${FULL.module}`,
    `${marker} guards: ${FULL.guards.join("; ")}`,
    `${marker} given: ${FULL.given}`,
    `${marker} input: ${FULL.input}`,
    `${marker} expect: ${FULL.expect}`,
    `${marker} runs: ${FULL.runs}`,
    `${marker} phrasings: ${FULL.phrasings}`,
    `${marker} paid: ${FULL.paid}`,
    "",
  ].join("\n");
}

const MARKER_NAMES = { "//": "slash-slash", "#": "hash", "--": "dash-dash", ";": "semicolon" };

for (const marker of ["//", "#", "--", ";"]) {
  // TST-478008 · level: unit · module: MOD-test-document
  // guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  // given: a declaration in the comment marker named, with every key MOD-test-document's Data table lists, each on its own line after the identifier
  // input: that file's text
  // expect: one TestDeclaration with every key read, `path` the name given and `line` the identifier's line (from 1)
  test(`a '${marker}' declaration is read with every key — MOD-test-document`, () => {
    const path = `fixtures/marker-${MARKER_NAMES[marker]}.test.mjs`;
    const text = markerText(marker, "TST-001");
    assert.deepEqual(testDeclarations(path, text), [fullExpected("TST-001", path, 1)]);
  });
}

// TST-478009 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a block-comment declaration (lines starting ' *') with every key MOD-test-document's Data table lists, each on its own line after the identifier TST-002
// input: that file's text
// expect: one TestDeclaration with every key read, `path` the name given and `line` 2
test("a ' *' block-comment declaration is read with every key — MOD-test-document", () => {
  const path = "fixtures/marker-block.test.mjs";
  const text = [
    "/**",
    " * TST-002",
    " * level: unit",
    " * module: MOD-sample",
    " * guards: A SAMPLE REQUIREMENT; UC-900",
    " * given: a sample precondition",
    " * input: a sample input",
    " * expect: a sample expected result",
    " * runs: 3",
    " * phrasings: 2",
    " * paid: a sample service",
    " */",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [fullExpected("TST-002", path, 2)]);
});

// TST-478010 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a Markdown file whose heading '### TST-003 A sample manual test' is followed by every key as a plain `key: value` line
// input: that file's text
// expect: one TestDeclaration with every key read, level user, `path` the name given and `line` 3
test("a Markdown heading declaration is read with every key — MOD-test-document", () => {
  const path = "fixtures/manual-tests.md";
  const text = [
    "# Manual tests",
    "",
    "### TST-003 A sample manual test",
    "level: user",
    "module: MOD-sample",
    "guards: A SAMPLE REQUIREMENT; UC-900",
    "given: a sample precondition",
    "input: a sample input",
    "expect: a sample expected result",
    "runs: 3",
    "phrasings: 2",
    "paid: a sample service",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [
    { id: "TST-003", title: "A sample manual test", path, line: 3, ...FULL, level: "user" },
  ]);
});

// ---------------------------------------------------------------- a missing key

// TST-478011 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a declaration TST-004 with level, module, guards, input and expect but no `given` line
// input: that file's text
// expect: one TestDeclaration with `given` null and every other stated key read
test("a declaration missing a key is read with that key null — MOD-test-document", () => {
  const path = "fixtures/missing-key.test.mjs";
  const text = [
    "// TST-004",
    "// level: unit",
    "// module: MOD-sample",
    "// guards: A SAMPLE REQUIREMENT",
    "// input: a sample input",
    "// expect: a sample expected result",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [{
    id: "TST-004",
    title: null,
    level: "unit",
    module: "MOD-sample",
    guards: ["A SAMPLE REQUIREMENT"],
    given: null,
    input: "a sample input",
    expect: "a sample expected result",
    runs: null,
    phrasings: null,
    paid: null,
    path,
    line: 1,
  }]);
});

// ---------------------------------------------------------------- a declaration ends at the first line not of its form

// TST-478012 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a declaration TST-005 followed by a bare `//` line and then given, input and expect lines, and after a blank line a complete declaration TST-006
// input: that file's text
// expect: TST-005 is read with given, input and expect null, because it ended at the bare `//` line, and TST-006 is still read with every stated key
test("a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document", () => {
  const path = "fixtures/ends-at-non-form.test.mjs";
  const text = [
    "// TST-005",
    "// level: unit",
    "// module: MOD-sample",
    "// guards: A SAMPLE REQUIREMENT",
    "//",
    "// given: should not be read — the declaration already ended above",
    "// input: should not be read",
    "// expect: should not be read",
    "",
    "// TST-006",
    "// level: component",
    "// module: MOD-other",
    "// guards: UC-900",
    "// given: a second precondition",
    "// input: a second input",
    "// expect: a second expected result",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [
    {
      id: "TST-005", title: null, level: "unit", module: "MOD-sample", guards: ["A SAMPLE REQUIREMENT"],
      given: null, input: null, expect: null, runs: null, phrasings: null, paid: null, path, line: 1,
    },
    {
      id: "TST-006", title: null, level: "component", module: "MOD-other", guards: ["UC-900"],
      given: "a second precondition", input: "a second input", expect: "a second expected result",
      runs: null, phrasings: null, paid: null, path, line: 10,
    },
  ]);
});

// ---------------------------------------------------------------- a following line whose value holds ' · '
//
// The reason of this item's rejection in sprint 08 (docs/gates/20261007-1317-development-release-testing-a439.md):
// MOD-test-document's own example (its Data section), with `expect` read as UC-047's own notification text — which
// holds ' · ' — and `runs` after it. Given: that declaration. Input: its text. Expect: `expect` holds the value whole,
// ' · ' included, and `runs` is read, not lost.

// TST-478013 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: MOD-test-document's own example (its Data section), with `expect` read as UC-047's own notification text, which holds ' · ', and `runs` after it
// input: its text
// expect: `expect` holds the value whole, ' · ' included, and `runs` is read, not lost
test("a following line whose value holds ' · ' does not end the declaration — MOD-test-document", () => {
  const path = "fixtures/middle-dot-value.test.mjs";
  const text = [
    "// TST-014 · level: unit · module: MOD-text-tools",
    "// guards: A FINDING READS LIKE A COMPILER MESSAGE",
    "// given: a finding of kind error on line 4 of UC-007",
    "// input: the finding formatted as text",
    '// expect: the notification "UC-047 waits for your acceptance · akmaier/agent-m"',
    "// runs: 1",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [{
    id: "TST-014",
    title: null,
    level: "unit",
    module: "MOD-text-tools",
    guards: ["A FINDING READS LIKE A COMPILER MESSAGE"],
    given: "a finding of kind error on line 4 of UC-007",
    input: "the finding formatted as text",
    expect: 'the notification "UC-047 waits for your acceptance · akmaier/agent-m"',
    runs: 1,
    phrasings: null,
    paid: null,
    path,
    line: 1,
  }]);
});

// ---------------------------------------------------------------- a file without a declaration

// TST-478014 · level: unit · module: MOD-test-document
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a JavaScript file with only a plain comment naming no TST- identifier and a Markdown file with no heading of the form TST-<nnn>
// input: each file's text
// expect: no declaration is found in either
test("a file without a declaration yields none — MOD-test-document", () => {
  const code = [
    "// a plain comment, naming no TST- identifier",
    "import test from \"node:test\";",
    "test(\"something\", () => {});",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("fixtures/no-declaration.test.mjs", code), []);

  const markdown = [
    "# Not a test document",
    "",
    "Prose with no heading of the form TST-<nnn>.",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("fixtures/no-declaration.md", markdown), []);
});

// ---------------------------------------------------------------- the title of a declaration (ITM-888)
//
// MOD-test-document, Data: the title is, for a manual test, the heading's `<title>`; for a test in code, the name the test case
// gives itself on the first line after the declaration — its first string literal, or else the name it defines —; null where
// neither is found.

// The declaration of a test, as lines in `marker`'s comment, ending where the test case's own first line begins.
function declared(marker, id) {
  return [`${marker} ${id} · level: unit · module: MOD-sample`, `${marker} guards: A SAMPLE REQUIREMENT`];
}

// TST-888001 · level: unit · module: MOD-test-document
// guards: UC-029; EVERY TEST HAS ONE LEVEL
// given: a JavaScript file whose declaration TST-701 is followed by the line `test("a sample case — MOD-sample", () => {` and TST-702 by `it('a second case', () => {})`
// input: that file's text
// expect: the titles "a sample case — MOD-sample" and "a second case", the first string literal of each line
test("a JavaScript test case's title is its first string literal — MOD-test-document", () => {
  const path = "fixtures/title-js.test.mjs";
  const text = [
    ...declared("//", "TST-701"),
    'test("a sample case — MOD-sample", () => {',
    "});",
    ...declared("//", "TST-702"),
    "it('a second case', () => {})",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text).map((d) => [d.id, d.title]), [
    ["TST-701", "a sample case — MOD-sample"],
    ["TST-702", "a second case"],
  ]);
});

// TST-888002 · level: unit · module: MOD-test-document
// guards: UC-029; EVERY TEST HAS ONE LEVEL
// given: a Python file whose declaration TST-703 is followed by the line `def test_sample_case(tmp_path):`, and one whose declaration TST-704 is followed by `def test_with_default(label="a literal"):`
// input: each file's text
// expect: the title "test_sample_case", the name it defines, for TST-703; and "a literal", the first string literal, for TST-704
test("a Python test case's title is the name it defines, a string literal first — MOD-test-document", () => {
  const first = [...declared("#", "TST-703"), "def test_sample_case(tmp_path):", "    pass", ""].join("\n");
  const second = [...declared("#", "TST-704"), 'def test_with_default(label="a literal"):', "    pass", ""].join("\n");
  assert.deepEqual(testDeclarations("fixtures/title.py", first).map((d) => d.title), ["test_sample_case"]);
  assert.deepEqual(testDeclarations("fixtures/title.py", second).map((d) => d.title), ["a literal"]);
});

// TST-888003 · level: unit · module: MOD-test-document
// guards: UC-029; EVERY TEST HAS ONE LEVEL
// given: a declaration TST-705 at the end of a file, one followed by a blank line and then `test("not on the first line", …)`, and one followed by a line `setup();` that holds neither a string literal nor a definition
// input: that file's text
// expect: the title of each is null
test("a declaration with no string literal and no name on its next line has the title null — MOD-test-document", () => {
  const path = "fixtures/title-none.test.mjs";
  const text = [
    ...declared("//", "TST-705"),
    "",
    'test("not on the first line", () => {});',
    ...declared("//", "TST-706"),
    "setup();",
    ...declared("//", "TST-707"),
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text).map((d) => [d.id, d.title]), [
    ["TST-705", null], ["TST-706", null], ["TST-707", null],
  ]);
});

// TST-888004 · level: unit · module: MOD-test-document
// guards: UC-029; EVERY TEST HAS ONE LEVEL
// given: a Markdown file with the headings '### TST-709 Open the review page' and '### TST-710' (no title) and a JavaScript file whose declaration TST-708 is followed by `function check() {}`
// input: each file's text
// expect: the titles "Open the review page" and null for the headings; "check" for TST-708, the name the function defines
test("a manual test's title is its heading's title; a function's name is a title — MOD-test-document", () => {
  const manual = [
    "### TST-709 Open the review page", "level: user", "", "### TST-710", "level: user", "",
  ].join("\n");
  assert.deepEqual(testDeclarations("fixtures/manual.md", manual).map((d) => [d.id, d.title]), [
    ["TST-709", "Open the review page"], ["TST-710", null],
  ]);
  const code = [...declared("//", "TST-708"), "function check() {}", ""].join("\n");
  assert.deepEqual(testDeclarations("fixtures/title-function.test.mjs", code).map((d) => d.title), ["check"]);
});

// ---------------------------------------------------------------- the title past every comment line of the block (ITM-1220)
//
// MOD-test-document, Data: for a test in code, the title is the name the test case gives itself on the first line after the
// declaration. A declaration's block of comment lines may go on past its last field — a line `// Planted fault: …`, or a
// field's value continued over further comment lines —; the test case's first line is the first line after that whole block.
// The fixtures below are shaped as Agent M's own declarations whose title was read null or wrong: TST-961007
// (tests/bridge-build-build-platform.test.mjs), TST-1182001 (tests/bridge-build-tunnel-check-host-key.test.mjs), TST-1120002
// (tests/implementation-pages-plan-stored-graph.test.mjs) and TST-519011 (tests/test_artifact_provenance.py).

// TST-1220101 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a JavaScript file shaped as TST-961007: its declaration's fields, then the comment line `// Planted fault: a scan of the whole installed tree finds the build tools' addon and rejects.`, then the line `test("buildPlatform — a .node file in the build tools only, which the app does not ship, gives no NativeAddonFound", async () => {`
// input: that file's text
// expect: one declaration whose title is "buildPlatform — a .node file in the build tools only, which the app does not ship, gives no NativeAddonFound", and whose fields are read as before
test("a title is read past a comment line after the fields that is no field — MOD-test-document", () => {
  const text = [
    "// TST-961007 · level: unit · module: MOD-bridge-build",
    "// guards: THE BRIDGE IS BUILT FROM THE DASHBOARD'S CODE; UC-044",
    "// given: a Linux build whose installed tree holds compiled addons in its build tools only",
    "// input: buildPlatform({ platform: \"linux\", checkout, tag, folder })",
    "// expect: it does not reject with NativeAddonFound: electron-builder is started and the AppImage is handed on",
    "// Planted fault: a scan of the whole installed tree finds the build tools' addon and rejects.",
    "test(\"buildPlatform — a .node file in the build tools only, which the app does not ship, gives no NativeAddonFound\", async () => {",
    "});",
    "",
  ].join("\n");
  const [declaration] = testDeclarations("tests/bridge-build-build-platform.test.mjs", text);
  assert.equal(declaration.title, "buildPlatform — a .node file in the build tools only, which the app does not ship, gives no NativeAddonFound");
  assert.deepEqual([declaration.id, declaration.module, declaration.expect],
    ["TST-961007", "MOD-bridge-build", "it does not reject with NativeAddonFound: electron-builder is started and the AppImage is handed on"]);
});

// TST-1220102 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: two JavaScript blocks whose comment lines after the fields hold a string literal: one shaped as TST-1182001, ending with `// Planted fault: today's check, which hands the first key to the Server whatever it is, fails with "Malformed OpenSSH private key".`; one shaped as TST-1120002, its expect continued on `//         frame shows in the page's place (MOD-site-frame's readProblem); …`; each followed by its `test("…", async () => {` line
// input: that file's text
// expect: the titles "tunnelCheck — the test SSH server takes only a host key that ssh2 parses, and generates another when one does not" and "the plan page builds no graph where none is stored, and fails with GraphNotStored" — not "Malformed OpenSSH private key", not "s place (MOD-site-frame"
test("a title is not read from a comment line of the block that holds a string literal — MOD-test-document", () => {
  const text = [
    "// TST-1182001 · level: unit · module: MOD-bridge-build",
    "// guards: THE BRIDGE IS SIGNED BY ITS PUBLISHER",
    "// input: tunnelCheck",
    "// expect: the Server is built with a host key that ssh2 parses",
    "// Planted fault: today's check, which hands the first key to the Server whatever it is, fails with \"Malformed OpenSSH private key\".",
    "test(\"tunnelCheck — the test SSH server takes only a host key that ssh2 parses, and generates another when one does not\", async () => {",
    "});",
    "",
    "// TST-1120002 · level: unit · module: MOD-implementation-pages",
    "// guards: UC-045; A PAGE LOAD READS THE REPOSITORY IN BATCHES",
    "// input: the route plan's render",
    "// expect: no graph is built; the render fails with GraphNotStored, whose message the",
    "//         frame shows in the page's place (MOD-site-frame's readProblem); `readOn` was asked as in TST-1120001",
    "test(\"the plan page builds no graph where none is stored, and fails with GraphNotStored\", async () => {",
    "});",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("tests/sample-titles.test.mjs", text).map((d) => [d.id, d.title]), [
    ["TST-1182001", "tunnelCheck — the test SSH server takes only a host key that ssh2 parses, and generates another when one does not"],
    ["TST-1120002", "the plan page builds no graph where none is stored, and fails with GraphNotStored"],
  ]);
});

// TST-1220103 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a Python file shaped as TST-519011: an indented declaration whose expect continues over two `#         …` lines — the first holding `Agent-M-Kind: change-use-case`, the second `the detector names the version …` —, then `def test_the_commit_of_a_written_use_case_names_the_version_the_participant_and_the_model(self):`
// input: that file's text
// expect: one declaration whose title is "test_the_commit_of_a_written_use_case_names_the_version_the_participant_and_the_model", the name the method defines
test("a Python title is read past a field continued over comment lines — MOD-test-document", () => {
  const text = [
    "class ArtifactProvenance(unittest.TestCase):",
    "    # TST-519011 · level: system · module: system",
    "    # guards: AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT",
    "    # given: the fixture CI agent ci-drafter (model ci-model-7) at Agent M 2026.10.0, commit abc123def456",
    "    # input: its change-use-case job run unattended; the message of the commit the writer open-files made",
    "    # expect: the message ends with the six lines Agent-M-Version: 2026.10.0, commit abc123def456 /",
    "    #         Agent-M-Kind: change-use-case / Agent-M-Participant: ci-drafter / Agent-M-Model: ci-model-7 / Agent-M-Rounds: 1;",
    "    #         the detector names the version, the commit, the job, the participant, the model and a trailer line in that message",
    "    def test_the_commit_of_a_written_use_case_names_the_version_the_participant_and_the_model(self):",
    "        pass",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("tests/test_artifact_provenance.py", text).map((d) => [d.id, d.title]), [
    ["TST-519011", "test_the_commit_of_a_written_use_case_names_the_version_the_participant_and_the_model"],
  ]);
});

// ---------------------------------------------------------------- a declaration only in code, its title the case's name (ITM-1222)
//
// MOD-test-document, Data: a declaration is a block of comment lines, in the comment marker of the file's language, directly
// before a test case, whose title is the name the test case gives itself. The fixtures are shaped as Agent M's own tests whose
// declaration or title was misread: the fixture of tests/job-runner-check-fixes.test.mjs (TST-584001), TST-472351
// (tests/job-runner-requirement-form.test.mjs), TST-748001 (tests/repository-hosts-merge-pull-request.test.mjs), TST-1149003
// (tests/implementation-pages-backlog-stored-facts.test.mjs) and TST-604003 (tests/runtimes-gitlab-ci-merge.test.mjs).

// TST-1222101 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a JavaScript file shaped as tests/job-runner-check-fixes.test.mjs: a template string `const DECLARED = (id) => \`…\`` whose lines inside are comment-shaped and hold the declaration TST-584001 and `test("${id}", …)`, closed by "\`;"; then a real declaration TST-584002 before `test("a real case", () => {});`
// input: that file's text
// expect: exactly one declaration, TST-584002 with the title "a real case" — none from the lines inside the string literal
test("comment-shaped lines inside a string literal are no declaration — MOD-test-document", () => {
  const text = [
    "const DECLARED = (id) => `// ${id} · level: unit · module: MOD-export",
    "// guards: EXPORT IS A PDF",
    "// TST-584001 · level: unit · module: MOD-job-runner",
    "// guards: EXPORT IS A PDF",
    "// expect: a PDF file",
    "test(\"${id}\", () => {});",
    "`;",
    "",
    "// TST-584002 · level: unit · module: MOD-job-runner",
    "// guards: EXPORT IS A PDF",
    "test(\"a real case\", () => {});",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("tests/job-runner-check-fixes.test.mjs", text).map((d) => [d.id, d.title]), [["TST-584002", "a real case"]]);
});

// TST-1222102 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a JavaScript file shaped as TST-472351, its case `test("requirement-form — a rule with \"and\" goes back as a warning, and a one-line justification ends the loop", async () => {`; and a Python case `def test_quote(label='it\'s here'):`
// input: each file's text
// expect: the titles `requirement-form — a rule with "and" goes back as a warning, and a one-line justification ends the loop` and `it's here`: the whole literal, each escaped quote read as the quote it stands for
test("a title with an escaped quote is read whole — MOD-test-document", () => {
  const js = ["// TST-472351 · level: unit · module: MOD-job-runner", "// guards: ONE STATEMENT PER REQUIREMENT",
    "test(\"requirement-form — a rule with \\\"and\\\" goes back as a warning, and a one-line justification ends the loop\", async () => {", "});", ""].join("\n");
  assert.deepEqual(testDeclarations("tests/job-runner-requirement-form.test.mjs", js).map((d) => d.title),
    ["requirement-form — a rule with \"and\" goes back as a warning, and a one-line justification ends the loop"]);
  const py = ["    # TST-472352 · level: unit · module: MOD-job-runner", "    def test_quote(label='it\\'s here'):", "        pass", ""].join("\n");
  assert.deepEqual(testDeclarations("tests/test_quote.py", py).map((d) => d.title), ["it's here"]);
});

// TST-1222103 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: two declarations before a loop whose body is the test: one shaped as TST-748001, `for (const [label, connectTo, server, path, header, value, token] of SERVERS) {` then `  test(\`mergePullRequest on ${label} — at the expected head it merges, carrying that head, and returns the merge commit\`, async () => {`; one shaped as TST-1149003, `for (const [label, stored] of [["stored facts", (files) => factsFile(files)], ["files", undefined]]) {` then a `test(\`…\`)` line
// input: that file's text
// expect: the titles are the cases' names on the line after the loop header — "mergePullRequest on ${label} — at the expected head it merges, carrying that head, and returns the merge commit" and "the backlog page names a model version it cannot read and does not fall back to today's catalogue (${label})" —, not null and not "stored facts"
test("a title is read past a loop header whose body is the test — MOD-test-document", () => {
  const text = [
    "// TST-748001 · level: unit · module: MOD-repository-hosts",
    "// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS",
    "for (const [label, connectTo, server, path, header, value, token] of SERVERS) {",
    "  test(`mergePullRequest on ${label} — at the expected head it merges, carrying that head, and returns the merge commit`, async () => {",
    "  });",
    "}",
    "",
    "// TST-1149003 · level: unit · module: MOD-implementation-pages",
    "// guards: UC-045",
    "for (const [label, stored] of [[\"stored facts\", (files) => factsFile(files)], [\"files\", undefined]]) {",
    "  test(`the backlog page names a model version it cannot read and does not fall back to today's catalogue (${label})`, async () => {",
    "  });",
    "}",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("tests/sample-loops.test.mjs", text).map((d) => [d.id, d.title]), [
    ["TST-748001", "mergePullRequest on ${label} — at the expected head it merges, carrying that head, and returns the merge commit"],
    ["TST-1149003", "the backlog page names a model version it cannot read and does not fall back to today's catalogue (${label})"],
  ]);
});

// TST-1222104 · level: unit · module: MOD-test-document
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a declaration shaped as TST-604003 whose next line is `const ENTRY_ENDING = " Agent M passes its inputs only through an entry written with local: and inputs:";`
// input: that file's text
// expect: the title "Agent M passes its inputs only through an entry written with local: and inputs:" — no leading space
test("a title keeps no leading space — MOD-test-document", () => {
  const text = ["// TST-604003 · level: unit · module: MOD-runtimes", "// guards: UC-010; UC-027",
    "const ENTRY_ENDING = \" Agent M passes its inputs only through an entry written with local: and inputs:\";", ""].join("\n");
  assert.deepEqual(testDeclarations("tests/runtimes-gitlab-ci-merge.test.mjs", text).map((d) => d.title),
    ["Agent M passes its inputs only through an entry written with local: and inputs:"]);
});
