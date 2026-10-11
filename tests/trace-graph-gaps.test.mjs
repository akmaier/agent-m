// The coverage gaps of requirements and use cases (ITM-308) — MOD-trace-graph's coverageGaps, as docs/architecture/MOD-trace-graph.md
// states it: the requirements no use case realises and — once the graph holds modules and tests — no module realises and no test
// guards; the use cases that realise no requirement; every name that matches no requirement or use case, with the artifacts and the
// lines that name it. The gaps are shown and block nothing (UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN); the recipe
// chosen-requirements (ITM-337) takes its default selection, the requirements no use case realises, from the first of them.
// Run: node --test tests/trace-graph-gaps.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-007; UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; A USE CASE REALISES NAMED REQUIREMENTS
// Level: unit
//
// The fixture repository is small and ours, never Agent M's own: a SPEC.md of four requirements, two use cases, a module file and a
// test file, given to traceGraph through a TextSource built here — a graph, not a hand-made object. Each requirement but the first
// lacks one thing: AN UNREALISED RULE is realised by no use case, AN UNTESTED RULE is guarded by no test, AN UNBUILT RULE is realised
// by no module; A FULLY COVERED RULE lacks nothing. UC-002 realises nothing, and UC-001 also names A RULE NOBODY WROTE, which is no
// requirement. Each test states its input and its expected result before it runs (given / input / expect); an expected line is read
// off the fixture (lineOf), not counted. The first four tests are the Acceptance's; the next three are what the module file and the
// item's Outcome add — when modules and tests count, the order of the lists, and what is no unknown name — and can be cut. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as traceGraphModule from "../src/trace-graph/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { traceGraph, coverageGaps } = traceGraphModule;

// A TextSource over a fixed set of files: every key is listed in `paths`, in the order of the keys; `read` resolves its text.
function source(files) {
  return {
    paths: Object.keys(files),
    read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null),
  };
}

// The line, from 1, on which a file has exactly this text; the file must hold it once.
function lineOf(lines, text) {
  const at = lines.flatMap((line, i) => (line === text ? [i + 1] : []));
  assert.equal(at.length, 1, `the file holds the line ${JSON.stringify(text)} once`);
  return at[0];
}

// An edit of a file's lines: the one line `old` replaced by `news`. The file must hold `old` once. And one that appends lines.
const replace = (old, ...news) => (lines) => {
  const at = lines.indexOf(old);
  assert.ok(at >= 0 && lines.lastIndexOf(old) === at, `the file holds the line ${JSON.stringify(old)} once`);
  return [...lines.slice(0, at), ...news, ...lines.slice(at + 1)];
};
const append = (...news) => (lines) => [...lines, ...news];

const FULL = "A FULLY COVERED RULE";
const UNREALISED = "AN UNREALISED RULE";
const UNTESTED = "AN UNTESTED RULE";
const UNBUILT = "AN UNBUILT RULE";
const NOBODY = "A RULE NOBODY WROTE";

// ---------------------------------------------------------------- the fixture repository

const SPEC_PATH = "SPEC.md";
const SPEC_LINES = [
  "# Fixture product — Specification",
  "",
  "## Section",
  "",
  `**${FULL}** *(Product Owner)*`,
  "A use case and a module realise it and a test guards it.",
  "*Check:* `tests/sample.test.mjs`",
  "",
  `**${UNREALISED}** *(Product Owner)*`,
  "A module realises it and a test guards it, but no use case realises it.",
  "*Check:* `tests/sample.test.mjs`",
  "",
  `**${UNTESTED}** *(Product Owner)*`,
  "A use case and a module realise it, but no test guards it.",
  "*Check:* no automatic check; at review",
  "",
  `**${UNBUILT}** *(Product Owner)*`,
  "A use case realises it and a test guards it, but no module realises it.",
  "*Check:* `tests/sample.test.mjs`",
  "",
];

const UC1_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC1_LINES = [
  "---",
  "id: UC-001",
  "title: Read a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises:",
  `  - ${FULL}`,
  `  - ${NOBODY}`,
  `  - ${UNTESTED}`,
  `  - ${UNBUILT}`,
  "---",
  "# UC-001 Read a file",
  "",
  "**Goal.** The reader reads a file whole.",
  "",
];

const UC2_PATH = "docs/use-cases/UC-002-show-a-file.md";
const UC2_LINES = [
  "---",
  "id: UC-002",
  "title: Show a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises: []",
  "---",
  "# UC-002 Show a file",
  "",
  "**Goal.** The reader sees a file.",
  "",
];

const MOD_PATH = "docs/architecture/MOD-reader.md";
const MOD_LINES = [
  "---",
  "id: MOD-reader",
  "title: Reading a file",
  "folder: src/reader/",
  "realises:",
  `  - ${FULL}`,
  `  - ${UNREALISED}`,
  `  - ${UNTESTED}`,
  "provides:",
  "  - readFile",
  "---",
  "# MOD-reader Reading a file",
  "",
];

const TEST_PATH = "tests/sample.test.mjs";
const TEST_LINES = [
  "// TST-001",
  "// level: unit",
  `// guards: ${FULL}; ${UNREALISED}; ${UNBUILT}; UC-001`,
  "",
];

// The files in the order a repository lists them.
const BASE = {
  [SPEC_PATH]: SPEC_LINES, [UC1_PATH]: UC1_LINES, [UC2_PATH]: UC2_LINES, [MOD_PATH]: MOD_LINES, [TEST_PATH]: TEST_LINES,
};

// The fixture with the edits given, { path: edit }; `keep` lists the paths of BASE it holds, `extra` the files { path: lines } it
// holds besides, and `reverse` lists them in the reverse order: the lines of every file it holds, and the graph traceGraph builds.
async function repository(edits = {}, { keep = Object.keys(BASE), extra = {}, reverse = false } = {}) {
  const lines = { ...Object.fromEntries(keep.map((path) => [path, BASE[path]])), ...extra };
  for (const [path, edit] of Object.entries(edits)) lines[path] = edit(lines[path]);
  const listed = Object.entries(lines).map(([path, own]) => [path, own.join("\n")]);
  if (reverse) listed.reverse();
  return { lines, graph: await traceGraph(source(Object.fromEntries(listed))) };
}

// ---------------------------------------------------------------- the Acceptance's four cases

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; UC-007
// given: the fixture, where AN UNREALISED RULE is realised by its module and guarded by its test but by no use case
// input: coverageGaps of its graph
// expect: requirementsWithoutUseCase is that requirement alone — its module and its test name it, which does not make a use case
//         realise it — and the three that a use case realises are not in it
test("coverageGaps — a requirement no use case realises is a gap", async () => {
  const { graph } = await repository();
  assert.deepEqual(coverageGaps(graph).requirementsWithoutUseCase, [UNREALISED]);
});

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; A USE CASE REALISES NAMED REQUIREMENTS; UC-007
// given: the fixture, where UC-002 realises nothing and UC-001 realises three requirements and names one that is none
// input: coverageGaps of its graph
// expect: useCasesWithoutRequirement is UC-002 alone
test("coverageGaps — a use case that realises nothing is a gap", async () => {
  const { graph } = await repository();
  assert.deepEqual(coverageGaps(graph).useCasesWithoutRequirement, ["UC-002"]);
});

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; A USE CASE REALISES NAMED REQUIREMENTS; UC-007
// given: the fixture, where UC-001 realises A RULE NOBODY WROTE, which is no requirement of its SPEC, and its test guards UC-001,
//        which is a use case
// input: coverageGaps of its graph
// expect: unknownNames is that one name, with UC-001, the file of UC-001 and the line of the name in it — the use case the test guards
//         is no unknown name
test("coverageGaps — an unknown name is a gap, with the use case and the line that name it", async () => {
  const { lines, graph } = await repository();
  assert.deepEqual(coverageGaps(graph).unknownNames, [
    { name: NOBODY, namedBy: [{ id: "UC-001", path: UC1_PATH, line: lineOf(lines[UC1_PATH], `  - ${NOBODY}`) }] },
  ]);
});

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; UC-007
// given: the fixture, where AN UNTESTED RULE is realised by a use case and a module but guarded by no test — the test guards that use
//        case, UC-001, which does not make it guard the use case's requirements
// input: coverageGaps of its graph
// expect: requirementsWithoutTest is that requirement alone
test("coverageGaps — a requirement no test guards is a gap", async () => {
  const { graph } = await repository();
  assert.deepEqual(coverageGaps(graph).requirementsWithoutTest, [UNTESTED]);
});

// ---------------------------------------------------------------- what the module file and the Outcome add

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; UC-007
// given: the fixture, where AN UNBUILT RULE is realised by no module; and the same fixture without its module file, without its
//        test file, and without both
// input: coverageGaps of the graph of each
// expect: with both, requirementsWithoutModule is AN UNBUILT RULE alone; without the module file it is empty, as without both, and
//         without the test file requirementsWithoutTest is empty, as without both — the requirements and the use cases give their
//         gaps in all four
test("coverageGaps — a requirement no module realises and one no test guards are gaps once the graph holds modules and tests", async () => {
  const whole = coverageGaps((await repository()).graph);
  assert.deepEqual([whole.requirementsWithoutModule, whole.requirementsWithoutTest], [[UNBUILT], [UNTESTED]]);
  const gaps = async (...keep) => coverageGaps((await repository({}, { keep: [SPEC_PATH, UC1_PATH, UC2_PATH, ...keep] })).graph);
  const noModule = await gaps(TEST_PATH), noTest = await gaps(MOD_PATH), neither = await gaps();
  assert.deepEqual([noModule.requirementsWithoutModule, noModule.requirementsWithoutTest], [[], [UNTESTED]], "without the module file");
  assert.deepEqual([noTest.requirementsWithoutModule, noTest.requirementsWithoutTest], [[UNBUILT], []], "without the test file");
  assert.deepEqual([neither.requirementsWithoutModule, neither.requirementsWithoutTest], [[], []], "without both");
  for (const gap of [noModule, noTest, neither]) {
    assert.deepEqual([gap.requirementsWithoutUseCase, gap.useCasesWithoutRequirement], [[UNREALISED], ["UC-002"]]);
  }
});

// A SPEC with two more requirements, ZEBRA RULE and ALPHA RULE, in that order, which nothing realises; a decision forced by A RULE
// NOBODY WROTE; and a third use case that realises ZERO RULE, which is none, and A RULE NOBODY WROTE.
const ZEBRA = "ZEBRA RULE", ALPHA = "ALPHA RULE", ZERO = "ZERO RULE";
const ARC_PATH = "docs/architecture/ARC-001-reading-lives-in-a-module.md";
const ARC_LINES = ["---", "id: ARC-001", "title: Reading lives in a module", "forced_by:", `  - ${NOBODY}`, "---", "# ARC-001 Reading lives in a module", ""];
const UC3_PATH = "docs/use-cases/UC-003-list-a-folder.md";
const UC3_LINES = [
  "---", "id: UC-003", "title: List a folder", "area: reading", "actors:", "  - Reader", "realises:", `  - ${ZERO}`, `  - ${NOBODY}`, "---",
  "# UC-003 List a folder", "", "**Goal.** The reader lists a folder.", "",
];
const MORE = {
  edits: { [SPEC_PATH]: append(`**${ZEBRA}** *(Product Owner)*`, "A rule nothing realises.", "*Check:* no automatic check; at review", "",
    `**${ALPHA}** *(Product Owner)*`, "Another rule nothing realises.", "*Check:* no automatic check; at review", "") },
  extra: { [ARC_PATH]: ARC_LINES, [UC3_PATH]: UC3_LINES },
};
const sortedGaps = (lines) => ({
  requirementsWithoutUseCase: [ALPHA, UNREALISED, ZEBRA],
  requirementsWithoutModule: [ALPHA, UNBUILT, ZEBRA],
  requirementsWithoutTest: [ALPHA, UNTESTED, ZEBRA],
  useCasesWithoutRequirement: ["UC-002", "UC-003"],
  unknownNames: [
    { name: NOBODY, namedBy: [
      { id: "ARC-001", path: ARC_PATH, line: lineOf(lines[ARC_PATH], `  - ${NOBODY}`) },
      { id: "UC-001", path: UC1_PATH, line: lineOf(lines[UC1_PATH], `  - ${NOBODY}`) },
      { id: "UC-003", path: UC3_PATH, line: lineOf(lines[UC3_PATH], `  - ${NOBODY}`) },
    ] },
    { name: ZERO, namedBy: [{ id: "UC-003", path: UC3_PATH, line: lineOf(lines[UC3_PATH], `  - ${ZERO}`) }] },
  ],
});

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; UC-007
// given: the fixture with two more requirements, ZEBRA RULE and ALPHA RULE, in that order, which nothing realises; a third use case
//        that realises nothing; a decision and two use cases that name A RULE NOBODY WROTE; and a second unknown name, ZERO RULE —
//        listed once in the order of the fixture's files and once in the reverse order
// input: coverageGaps of the graph of each
// expect: the same gaps from both: the requirements by name, the use cases by identifier, the unknown names by name, and who names
//         one by identifier — ARC-001, UC-001, UC-003 for A RULE NOBODY WROTE, whatever kind of artifact names it
test("coverageGaps — the lists come sorted, and an unknown name lists everything that names it, whatever order the files are listed in", async () => {
  const forward = await repository(MORE.edits, { extra: MORE.extra });
  const backward = await repository(MORE.edits, { extra: MORE.extra, reverse: true });
  assert.notDeepEqual(backward.graph.edges.map((edge) => edge.from), forward.graph.edges.map((edge) => edge.from),
    "known positive: the graphs hold their edges in another order");
  assert.deepEqual(coverageGaps(forward.graph), sortedGaps(forward.lines));
  assert.deepEqual(coverageGaps(backward.graph), sortedGaps(backward.lines));
});

// guards: UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN; UC-007
// given: the fixture, where the goal of UC-002 also writes AN IMAGINARY RULE between backticks — a name in running text, which is
//        stated nowhere
// input: coverageGaps of its graph
// expect: the same unknown names as without it: one, A RULE NOBODY WROTE — a name a text merely writes is no unknown name
test("coverageGaps — a name written in a text and stated nowhere is no unknown name", async () => {
  const { lines, graph } = await repository({ [UC2_PATH]: replace("**Goal.** The reader sees a file.", "**Goal.** The reader sees a file; see `AN IMAGINARY RULE`.") });
  assert.ok(graph.edges.some((edge) => edge.via === "names" && edge.to === "AN IMAGINARY RULE"), "known positive: the graph holds the name");
  assert.deepEqual(coverageGaps(graph).unknownNames, [
    { name: NOBODY, namedBy: [{ id: "UC-001", path: UC1_PATH, line: lineOf(lines[UC1_PATH], `  - ${NOBODY}`) }] },
  ]);
});
