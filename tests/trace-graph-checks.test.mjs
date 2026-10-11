// The checks across artifacts (ITM-306) — MOD-trace-graph's graphFindings and selfSufficiencyFindings, as
// docs/architecture/MOD-trace-graph.md states them, each decided from the graph alone that traceGraph builds (ITM-382): a name in
// realises, forced_by, an item's realises or a test's guards that matches no requirement or use case; a uses edge whose interface
// the used module's node does not provide; a cycle among the modules' uses; a module designed by no decision or by more than one,
// or that does not follow the decision that designs it; more or fewer than one decision without refines, or a decision that does
// not refine it; an item that names a module the architecture does not describe; a plan step whose tests are not those of its
// level; a module whose folder is not named after its identifier or lies inside another module's folder; a name that is the title
// of a group; the graph's positions as the warnings they are — and, for a link, a target that is a path the repository does not
// hold, the instance's repository, or its dashboard. graph-checks (ITM-330) and the use-case editor (ITM-358) call them.
// Run: node --test tests/trace-graph-checks.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-007; UC-018; UC-019; A USE CASE REALISES NAMED REQUIREMENTS; EVERY ARTIFACT NAMES ITS ORIGIN; DEVELOP AGAINST INTERFACES; MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE; A MODULE BELONGS TO ONE SUBSYSTEM; ONE DECISION STATES THE WHOLE ARCHITECTURE; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL; A MODULE IS A FOLDER; A GROUP CARRIES NO IDENTIFIER; A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION; THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; AN INSTANCE IS A FORK OF AGENT M
// Level: unit
//
// The fixture repository is small and ours, never Agent M's own: a SPEC.md of one requirement, a use case, two architecture
// decisions, two module files, a plan step, a backlog item, a group file and a test file, which break no rule, and a README.
// Each test builds its graph with traceGraph from that repository through a TextSource built here — a graph, not a hand-made
// object —, with one edit to one file that breaks the rule under test, and states its input and its expected result before it
// runs (given / input / expect). What a test pins of a finding is what the module file states of it: the artifact, the line, the
// kind and the rule; that its `what` names the thing at fault and that it has a `fix` — the words are the code's. An expected
// line is read off the edited fixture (lineOf), not counted. The clean repository is shown to give no finding, and each graph
// is shown to hold what a test reads from it, before a test expects that something is not there. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { positionalReferences } from "../src/identifiers/index.mjs";
import * as traceGraphModule from "../src/trace-graph/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { traceGraph, graphFindings, selfSufficiencyFindings } = traceGraphModule;

// A TextSource over a fixed set of files: every key is listed in `paths`, `read` resolves its text.
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

// An edit of a file's lines: the one line `old` replaced by `news` — by none, to remove it. The file must hold `old` once.
const replace = (old, ...news) => (lines) => {
  const at = lines.indexOf(old);
  assert.ok(at >= 0 && lines.lastIndexOf(old) === at, `the file holds the line ${JSON.stringify(old)} once`);
  return [...lines.slice(0, at), ...news, ...lines.slice(at + 1)];
};
const then = (...edits) => (lines) => edits.reduce((own, edit) => edit(own), lines);

// The finding a test expects: its artifact, its line, its rule, and what its `what` must name.
const want = (artifact, line, rule, ...names) => ({ artifact, line, rule, names });

// The findings found and the findings wanted are the same list of errors — compared by artifact, line and rule, in the order of
// artifact and line —, each `what` names what the wanted finding says it names, and each has a `fix`.
function assertFindings(found, wanted, label = "the findings") {
  const place = (a, b) => (a.artifact < b.artifact ? -1 : a.artifact > b.artifact ? 1 : a.line - b.line);
  const actual = [...found].sort(place);
  const expected = [...wanted].sort(place);
  assert.deepEqual(actual.map(({ artifact, line, kind, rule }) => ({ artifact, line, kind, rule })),
    expected.map(({ artifact, line, rule }) => ({ artifact, line, kind: "error", rule })), label);
  actual.forEach((f, i) => {
    assert.ok(typeof f.what === "string" && f.what !== "", `${label}: the finding says what is wrong`);
    assert.ok(typeof f.fix === "string" && f.fix !== "", `${label}: the finding says what to do`);
    for (const name of expected[i].names) assert.ok(f.what.includes(name), `${label}: ${JSON.stringify(f.what)} names ${name}`);
  });
}

const REQUIREMENT = "A SAMPLE RULE";
const INSTANCE = "fixture-owner/agent-m";
const REALISES = "A USE CASE REALISES NAMED REQUIREMENTS";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const INTERFACES = "DEVELOP AGAINST INTERFACES";
const CYCLE = "MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE";
const SUBSYSTEM = "A MODULE BELONGS TO ONE SUBSYSTEM";
const WHOLE = "ONE DECISION STATES THE WHOLE ARCHITECTURE";
const MODULES = "A BACKLOG ITEM NAMES THE MODULES IT CHANGES";
const LEVEL = "A PLAN STEP NAMES THE TESTS OF ITS LEVEL";
const FOLDER = "A MODULE IS A FOLDER";
const GROUP = "A GROUP CARRIES NO IDENTIFIER";
const POSITION = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";
const SELF = "THE PRODUCT REPOSITORY IS SELF-SUFFICIENT";

// ---------------------------------------------------------------- the fixture repository

const SPEC_PATH = "SPEC.md";
const SPEC_LINES = [
  "# Fixture product — Specification",
  "",
  "## Section",
  "",
  `**${REQUIREMENT}** *(Product Owner)*`,
  "A sample rule that a use case realises.",
  "*Check:* `tests/sample.test.mjs`",
  "",
];

// The use case's goal line holds four links: to a file, to its own section, to another site and to a folder.
const UC_PATH = "docs/use-cases/UC-001-read-a-file.md";
const GOAL = "**Goal.** The reader reads a file whole with [the module](../architecture/MOD-reader.md); see [the goal](#goal), "
  + "[a standard](https://example.org/standard) and [the folder](../architecture/).";
const UC_LINES = [
  "---",
  "id: UC-001",
  "title: Read a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises:",
  `  - ${REQUIREMENT}`,
  "---",
  "# UC-001 Read a file",
  "",
  GOAL,
  "",
];

const ARC1_PATH = "docs/architecture/ARC-001-the-whole-architecture.md";
const ARC1_LINES = [
  "---",
  "id: ARC-001",
  "title: The whole architecture",
  "forced_by:",
  `  - ${REQUIREMENT}`,
  "designs:",
  "  - MOD-text",
  "---",
  "# ARC-001 The whole architecture",
  "",
];

const ARC2_PATH = "docs/architecture/ARC-002-reading-lives-in-a-module.md";
const ARC2_LINES = [
  "---",
  "id: ARC-002",
  "title: Reading lives in a module",
  "refines: ARC-001",
  "forced_by:",
  "  - UC-001",
  "designs:",
  "  - MOD-reader",
  "---",
  "# ARC-002 Reading lives in a module",
  "",
];

const TEXT_PATH = "docs/architecture/MOD-text.md";
const TEXT_LINES = [
  "---",
  "id: MOD-text",
  "title: Text",
  "folder: src/text/",
  "realises:",
  `  - ${REQUIREMENT}`,
  "follows:",
  "  - ARC-001",
  "uses: []",
  "provides:",
  "  - readLines",
  "  - Line",
  "---",
  "# MOD-text Text",
  "",
];

const READER_PATH = "docs/architecture/MOD-reader.md";
const READER_LINES = [
  "---",
  "id: MOD-reader",
  "title: Reading a file",
  "folder: src/reader/",
  "realises:",
  "  - UC-001",
  "follows:",
  "  - ARC-002",
  "uses:",
  "  - MOD-text.readLines",
  "provides:",
  "  - readFile",
  "---",
  "# MOD-reader Reading a file",
  "",
];

const STEP_PATH = "docs/plan/ITM-001-the-reader.md";
const STEP_LINES = [
  "---",
  "id: ITM-001",
  "title: The reader",
  "level: module",
  "realises:",
  "  - UC-001",
  "modules:",
  "  - MOD-reader",
  "tests:",
  "  - unit",
  "---",
  "# ITM-001 The reader",
  "",
];

const ITEM_PATH = "docs/backlog/ITM-002-the-reader-page.md";
const ITEM_LINES = [
  "---",
  "id: ITM-002",
  "title: The reader page",
  "level: module",
  "realises:",
  "  - UC-001",
  "modules:",
  "  - MOD-reader",
  "builds_on:",
  "  - ITM-001",
  "tests:",
  "  - unit",
  "---",
  "# ITM-002 The reader page",
  "",
];

const GROUP_PATH = "docs/groups/use-cases.md";
const GROUP_LINES = [
  "# Use cases — groups",
  "",
  "The hierarchy of the use cases, each member by its identifier.",
  "",
  "- Reading",
  "  - UC-001",
  "",
];

const TEST_PATH = "tests/sample.test.mjs";
const TEST_LINES = [
  "// TST-001",
  "// level: unit",
  `// guards: ${REQUIREMENT}`,
  "",
];

// The files in the order a repository lists them; the README is no artifact.
const BASE = {
  [SPEC_PATH]: SPEC_LINES, "README.md": ["# Fixture product", ""], [UC_PATH]: UC_LINES, [ARC1_PATH]: ARC1_LINES,
  [ARC2_PATH]: ARC2_LINES, [TEXT_PATH]: TEXT_LINES, [READER_PATH]: READER_LINES, [STEP_PATH]: STEP_LINES, [ITEM_PATH]: ITEM_LINES,
  [GROUP_PATH]: GROUP_LINES, [TEST_PATH]: TEST_LINES,
};

// The fixture with the edits given, { path: edit }: the lines of every file it holds, and the graph traceGraph builds from them.
// `keep` lists the paths of BASE it holds, `extra` the files { path: lines } it holds besides.
async function repository(edits = {}, { keep = Object.keys(BASE), extra = {} } = {}) {
  for (const path of Object.keys(edits)) assert.ok(keep.includes(path), `the edited file ${path} is in the repository`);
  const lines = { ...extra };
  for (const path of keep) lines[path] = (edits[path] ?? ((own) => own))(BASE[path]);
  const files = Object.fromEntries(Object.entries(lines).map(([path, own]) => [path, own.join("\n")]));
  return { lines, graph: await traceGraph(source(files)) };
}

// ---------------------------------------------------------------- a repository that breaks no rule

// guards: UC-007; UC-018; UC-019
// given: the fixture repository as it stands: every name matches a requirement or a use case, the used interface is provided, no
//        cycle, each module is designed by one decision that it follows, one decision refines nothing and the other refines it,
//        each item names a module that is described, the plan step names the unit tests of its level, each folder is named after
//        its module and none lies inside another, no group title is named, no reference is by position, and the links of the use
//        case reach a file, a folder, its own section and another site
// input: graphFindings of its graph, and selfSufficiencyFindings of it for the instance fixture-owner/agent-m
// expect: no finding from either
test("graphFindings and selfSufficiencyFindings — a repository that breaks no rule gives no finding", async () => {
  const { graph } = await repository();
  const kinds = new Set([...graph.nodes.values()].map((node) => node.kind));
  for (const kind of ["requirement", "UC", "ARC", "MOD", "ITM", "TST", "group"]) assert.ok(kinds.has(kind), `known positive: a ${kind} node`);
  assert.ok(graph.edges.some((edge) => edge.via === "uses"), "known positive: a uses edge");
  assert.equal(graph.links.length, 4, "known positive: the four links of the use case");
  assert.deepEqual(graph.unread, [], "known positive: every file was read");
  assert.deepEqual(graphFindings(graph), []);
  assert.deepEqual(selfSufficiencyFindings(graph, INSTANCE), []);
});

// ---------------------------------------------------------------- a name that matches no requirement or use case

// Each row: a file, the edit that puts a name in it that is neither a requirement nor a use case, the line of the file on which the
// finding is expected, and the artifact and the rule it is expected under.
const UNKNOWN_NAMES = [
  { where: "a use case's realises", path: UC_PATH, edit: replace(`  - ${REQUIREMENT}`, "  - NO SUCH RULE"), at: "  - NO SUCH RULE",
    artifact: "UC-001", rule: REALISES, name: "NO SUCH RULE" },
  { where: "a decision's forced_by", path: ARC2_PATH, edit: replace("  - UC-001", "  - UC-099"), at: "  - UC-099",
    artifact: "ARC-002", rule: ORIGIN, name: "UC-099" },
  { where: "a module's realises", path: TEXT_PATH, edit: replace(`  - ${REQUIREMENT}`, "  - GHOST RULE"), at: "  - GHOST RULE",
    artifact: "MOD-text", rule: ORIGIN, name: "GHOST RULE" },
  { where: "an item's realises", path: ITEM_PATH, edit: replace("  - UC-001", "  - UC-099"), at: "  - UC-099",
    artifact: "ITM-002", rule: ORIGIN, name: "UC-099" },
  { where: "a test's guards", path: TEST_PATH, edit: replace(`// guards: ${REQUIREMENT}`, "// guards: GHOST RULE"), at: "// TST-001",
    artifact: "TST-001", rule: ORIGIN, name: "GHOST RULE" },
];

// guards: A USE CASE REALISES NAMED REQUIREMENTS; EVERY ARTIFACT NAMES ITS ORIGIN; UC-007; UC-018; UC-019
// given: the fixture, with in one file a name that is neither a requirement nor a use case: a use case's realises names NO SUCH
//        RULE, a decision's forced_by UC-099, a module's realises GHOST RULE, a backlog item's realises UC-099, a test's guards
//        GHOST RULE
// input: graphFindings of the graph of each
// expect: for each, the one error at the artifact and the line of the name — of a test, the line of its declaration —, under A USE
//         CASE REALISES NAMED REQUIREMENTS for the use case and under EVERY ARTIFACT NAMES ITS ORIGIN for the others, naming the name
test("graphFindings — a name in realises, forced_by or guards that matches no requirement or use case is an error", async () => {
  for (const row of UNKNOWN_NAMES) {
    const { lines, graph } = await repository({ [row.path]: row.edit });
    assertFindings(graphFindings(graph), [want(row.artifact, lineOf(lines[row.path], row.at), row.rule, row.name)], row.where);
  }
});

// ---------------------------------------------------------------- a used interface the module does not provide

// guards: DEVELOP AGAINST INTERFACES; UC-007; UC-019
// given: the fixture, with the use that MOD-reader's file states changed to an interface MOD-text does not provide, readWords, and,
//        in a second graph, to a module no file describes, MOD-nothing
// input: graphFindings of the graph of each
// expect: for each, the one error at MOD-reader and the line of that use, under DEVELOP AGAINST INTERFACES, naming the use
test("graphFindings — a uses edge whose interface the used module's node does not provide is an error", async () => {
  for (const use of ["MOD-text.readWords", "MOD-nothing.read"]) {
    const { lines, graph } = await repository({ [READER_PATH]: replace("  - MOD-text.readLines", `  - ${use}`) });
    assertFindings(graphFindings(graph), [want("MOD-reader", lineOf(lines[READER_PATH], `  - ${use}`), INTERFACES, use)], use);
  }
});

// ---------------------------------------------------------------- a cycle among the modules' uses

// guards: MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE; UC-007; UC-019
// given: the fixture, with MOD-text also using MOD-reader.readFile, so that MOD-reader uses MOD-text and MOD-text uses MOD-reader
// input: graphFindings of its graph
// expect: one error under MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE, at the module of the cycle whose identifier comes first,
//         MOD-reader, and the line of its use that stays in the cycle, naming both modules
test("graphFindings — a cycle among the modules' uses is an error", async () => {
  const { lines, graph } = await repository({ [TEXT_PATH]: replace("uses: []", "uses:", "  - MOD-reader.readFile") });
  assertFindings(graphFindings(graph),
    [want("MOD-reader", lineOf(lines[READER_PATH], "  - MOD-text.readLines"), CYCLE, "MOD-reader", "MOD-text")]);
});

// ---------------------------------------------------------------- the decision that designs a module

// guards: A MODULE BELONGS TO ONE SUBSYSTEM; UC-007; UC-019
// given: the fixture, with ARC-002 no longer designing MOD-reader; with ARC-001 designing MOD-reader as well as ARC-002; and with
//        MOD-reader following ARC-001 in place of ARC-002, the decision that designs it
// input: graphFindings of the graph of each
// expect: for each, the one error at MOD-reader and the line of its identifier, under A MODULE BELONGS TO ONE SUBSYSTEM: designed by
//         no decision; designed by more than one, naming ARC-001 and ARC-002; not following ARC-002, naming it
test("graphFindings — a module designed by no decision or by more than one, or that does not follow its designer, is an error", async () => {
  const rows = [
    { label: "designed by no decision", edits: { [ARC2_PATH]: then(replace("designs:", "designs: []"), replace("  - MOD-reader")) }, names: ["MOD-reader"] },
    { label: "designed by two", edits: { [ARC1_PATH]: replace("  - MOD-text", "  - MOD-text", "  - MOD-reader") }, names: ["ARC-001", "ARC-002"] },
    { label: "not following its designer", edits: { [READER_PATH]: replace("  - ARC-002", "  - ARC-001") }, names: ["ARC-002"] },
  ];
  for (const { label, edits, names } of rows) {
    const { lines, graph } = await repository(edits);
    assertFindings(graphFindings(graph), [want("MOD-reader", lineOf(lines[READER_PATH], "id: MOD-reader"), SUBSYSTEM, ...names)], label);
  }
});

// ---------------------------------------------------------------- the one decision that states the whole architecture

// guards: ONE DECISION STATES THE WHOLE ARCHITECTURE; UC-007; UC-019
// given: the fixture, with ARC-002 refining no decision, so that two decisions refine none; with ARC-001 refining ARC-002, so that
//        every decision refines another; with ARC-002 refining ARC-009, which is no decision, so that it does not refine ARC-001, the
//        one that refines none; and a repository of requirements and use cases alone, without a decision
// input: graphFindings of the graph of each
// expect: under ONE DECISION STATES THE WHOLE ARCHITECTURE, in the first case one error at each of ARC-001 and ARC-002, at the line of
//         its identifier; in the second one error at ARC-001, the first by identifier; in the third one error at ARC-002, naming
//         ARC-001; in the fourth none, since use cases are drafted before any decision (UC-007)
test("graphFindings — more or fewer than one decision without refines, or a decision that does not refine it, is an error", async () => {
  const id = (lines, n) => lineOf(lines, `id: ARC-00${n}`);
  const many = await repository({ [ARC2_PATH]: replace("refines: ARC-001") });
  assertFindings(graphFindings(many.graph), [
    want("ARC-001", id(many.lines[ARC1_PATH], 1), WHOLE, "ARC-001", "ARC-002"),
    want("ARC-002", id(many.lines[ARC2_PATH], 2), WHOLE, "ARC-001", "ARC-002"),
  ], "two decisions refine none");
  const none = await repository({ [ARC1_PATH]: replace("title: The whole architecture", "title: The whole architecture", "refines: ARC-002") });
  assertFindings(graphFindings(none.graph), [want("ARC-001", id(none.lines[ARC1_PATH], 1), WHOLE)], "every decision refines another");
  const apart = await repository({ [ARC2_PATH]: replace("refines: ARC-001", "refines: ARC-009") });
  assertFindings(graphFindings(apart.graph), [want("ARC-002", id(apart.lines[ARC2_PATH], 2), WHOLE, "ARC-001")], "a decision that refines another");
  const alone = await repository({}, { keep: [SPEC_PATH, UC_PATH] });
  assert.equal(alone.graph.nodes.size, 2, "known positive: the graph holds the requirement and the use case");
  assert.deepEqual(graphFindings(alone.graph), [], "no decision at all");
});

// ---------------------------------------------------------------- the modules an item changes

// guards: A BACKLOG ITEM NAMES THE MODULES IT CHANGES; UC-007; UC-019
// given: the fixture, with the backlog item ITM-002 changing MOD-nothing, which no file describes, in place of MOD-reader
// input: graphFindings of its graph
// expect: one error at ITM-002 and the line of that module, under A BACKLOG ITEM NAMES THE MODULES IT CHANGES, naming MOD-nothing
test("graphFindings — an item that names a module the architecture does not describe is an error", async () => {
  const { lines, graph } = await repository({ [ITEM_PATH]: replace("  - MOD-reader", "  - MOD-nothing") });
  assertFindings(graphFindings(graph), [want("ITM-002", lineOf(lines[ITEM_PATH], "  - MOD-nothing"), MODULES, "MOD-nothing")]);
});

// ---------------------------------------------------------------- the tests of a plan step's level

// guards: A PLAN STEP NAMES THE TESTS OF ITS LEVEL; UC-007; UC-019
// given: the fixture's plan step ITM-001, of level module with the unit tests, changed to name component tests in their place;
//        to name unit and component tests; to be of level system with the unit tests; to name no tests; and, as known positives,
//        to be of level system with the system and release tests; and the backlog item ITM-002, of level module, changed to name
//        unit and release tests
// input: graphFindings of the graph of each
// expect: for the first four, the one error at ITM-001 and the line of its identifier, under A PLAN STEP NAMES THE TESTS OF ITS
//         LEVEL, naming the tests of another level (component; component; unit; none to name); for the last two none — a system's tests
//         are the system and release tests, and the rule is the plan step's, which the backlog item is not
test("graphFindings — a plan step whose tests are not those of its level is an error", async () => {
  const wrong = [
    { label: "component tests at level module", edit: replace("  - unit", "  - component"), names: ["component"] },
    { label: "unit and component tests at level module", edit: replace("  - unit", "  - unit", "  - component"), names: ["component"] },
    { label: "unit tests at level system", edit: replace("level: module", "level: system"), names: ["unit"] },
    { label: "no tests", edit: then(replace("tests:", "tests: []"), replace("  - unit")), names: [] },
  ];
  for (const { label, edit, names } of wrong) {
    const { lines, graph } = await repository({ [STEP_PATH]: edit });
    assertFindings(graphFindings(graph), [want("ITM-001", lineOf(lines[STEP_PATH], "id: ITM-001"), LEVEL, ...names)], label);
  }
  const system = await repository({ [STEP_PATH]: then(replace("level: module", "level: system"), replace("  - unit", "  - system", "  - release")) });
  assert.deepEqual(system.graph.nodes.get("ITM-001").tests, ["system", "release"], "known positive: the graph holds the step's tests");
  assert.deepEqual(graphFindings(system.graph), [], "the system and release tests at level system");
  const item = await repository({ [ITEM_PATH]: replace("  - unit", "  - unit", "  - release") });
  assert.deepEqual(item.graph.nodes.get("ITM-002").tests, ["unit", "release"], "known positive: the graph holds the item's tests");
  assert.deepEqual(graphFindings(item.graph), [], "a backlog item is not a plan step");
});

// ---------------------------------------------------------------- a module's folder

// guards: A MODULE IS A FOLDER; UC-007; UC-019
// given: the fixture, with MOD-reader's folder src/wrong/, which is not named after its identifier; src/text/reader/, which is named
//        after it but lies inside the folder src/text/ of MOD-text; and no folder
// input: graphFindings of the graph of each
// expect: for the first two, the one error at MOD-reader and the line of its identifier, under A MODULE IS A FOLDER, naming the
//         folder; for the third none — a module file without a folder is a finding of its format, MOD-documents'
test("graphFindings — a module whose folder is not named after its identifier or lies inside another module's folder is an error", async () => {
  for (const folder of ["src/wrong/", "src/text/reader/"]) {
    const { lines, graph } = await repository({ [READER_PATH]: replace("folder: src/reader/", `folder: ${folder}`) });
    assertFindings(graphFindings(graph), [want("MOD-reader", lineOf(lines[READER_PATH], "id: MOD-reader"), FOLDER, folder)], folder);
  }
  const bare = await repository({ [READER_PATH]: replace("folder: src/reader/") });
  assert.equal(bare.graph.nodes.get("MOD-reader").folder, null, "known positive: the graph holds the module without a folder");
  assert.deepEqual(graphFindings(bare.graph), [], "no folder");
});

// ---------------------------------------------------------------- the title of a group where an identifier is expected

// guards: A GROUP CARRIES NO IDENTIFIER; UC-007; UC-019
// given: the fixture, whose group file holds a group titled Reading, with the use case's realises naming Reading in place of the
//        requirement
// input: graphFindings of its graph
// expect: the one error at UC-001 and the line of that name, under A GROUP CARRIES NO IDENTIFIER, naming Reading — and no second one,
//         that the name matches no requirement
test("graphFindings — a name where an identifier is expected that is the title of a group is an error", async () => {
  const { lines, graph } = await repository({ [UC_PATH]: replace(`  - ${REQUIREMENT}`, "  - Reading") });
  assert.ok([...graph.nodes.values()].some((node) => node.kind === "group" && node.title === "Reading"), "known positive: the group");
  assertFindings(graphFindings(graph), [want("UC-001", lineOf(lines[UC_PATH], "  - Reading"), GROUP, "Reading")]);
});

// ---------------------------------------------------------------- a reference by position

// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION; UC-007; UC-018; UC-019
// given: the fixture, with the use case's goal pointing at "step 5" of another use case
// input: graphFindings of its graph
// expect: the one finding is the warning MOD-identifiers' positionalReferences gives for that text — a warning, at the line of the
//         goal, under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION, naming the file —, as it gives it
test("graphFindings — a reference by position is a warning, as positionalReferences gives it", async () => {
  const goal = `${GOAL} It repeats step 5 of UC-002.`;
  const { lines, graph } = await repository({ [UC_PATH]: replace(GOAL, goal) });
  const found = graphFindings(graph);
  assert.deepEqual(found.map(({ artifact, line, kind, rule }) => ({ artifact, line, kind, rule })),
    [{ artifact: UC_PATH, line: lineOf(lines[UC_PATH], goal), kind: "warning", rule: POSITION }]);
  assert.deepEqual(found, positionalReferences(UC_PATH, lines[UC_PATH].join("\n")));
});

// ---------------------------------------------------------------- a link to what the product does not hold

// guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; UC-007; UC-018; UC-019
// given: the fixture, with the use case's link to MOD-reader.md changed to a file the repository does not hold, MOD-missing.md
// input: selfSufficiencyFindings of its graph for the instance fixture-owner/agent-m
// expect: the one error at UC-001 and the line of the link, under THE PRODUCT REPOSITORY IS SELF-SUFFICIENT, naming MOD-missing.md —
//         while the links to the section, to another site and to the folder of the clean repository are none
test("selfSufficiencyFindings — a link to a path of the repository that it does not hold is an error", async () => {
  const goal = GOAL.replace("MOD-reader.md", "MOD-missing.md");
  const { lines, graph } = await repository({ [UC_PATH]: replace(GOAL, goal) });
  assert.equal(graph.links.length, 4, "known positive: the graph holds the four links");
  assertFindings(selfSufficiencyFindings(graph, INSTANCE), [want("UC-001", lineOf(lines[UC_PATH], goal), SELF, "MOD-missing.md")]);
});

// guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; UC-007; UC-018; UC-019
// given: the fixture, holding the file docs/use-cases/Übersicht.md, with the use case also linking to it as Übersicht.md and as
//        %C3%9Cbersicht.md, and, in a second graph, to ../50%.md, a target with a stray percent sign
// input: selfSufficiencyFindings of the graph of each
// expect: none for the first, where both targets name the file; for the second the one error at UC-001 and the line of the link,
//         naming ../50%.md — a link that cannot be read as a path is a path the repository does not hold, not a crash
test("selfSufficiencyFindings — a link target is read as an address: the file it names is held, a stray percent sign is a path not held", async () => {
  const extra = { "docs/use-cases/Übersicht.md": ["# Übersicht", ""] };
  const encoded = `${GOAL} See [raw](Übersicht.md) and [encoded](%C3%9Cbersicht.md).`;
  const held = await repository({ [UC_PATH]: replace(GOAL, encoded) }, { extra });
  assert.equal(held.graph.links.length, 6, "known positive: the graph holds the six links");
  assert.deepEqual(selfSufficiencyFindings(held.graph, INSTANCE), []);
  const stray = `${GOAL} See [stray](../50%.md).`;
  const lost = await repository({ [UC_PATH]: replace(GOAL, stray) }, { extra });
  assertFindings(selfSufficiencyFindings(lost.graph, INSTANCE), [want("UC-001", lineOf(lost.lines[UC_PATH], stray), SELF, "../50%.md")]);
});

// guards: THE PRODUCT REPOSITORY IS SELF-SUFFICIENT; AN INSTANCE IS A FORK OF AGENT M; UC-007; UC-018; UC-019
// given: the fixture, with the use case also linking to a file of the repository of the instance fixture-owner/agent-m; to the
//        repository itself; to its dashboard, at the address MOD-identifiers' pagesAddress gives; to a page of the dashboard; to
//        another repository of the same owner, agent-m-tools; and to a page of another owner's site of the same name
// input: selfSufficiencyFindings of the graph of each, for the instance fixture-owner/agent-m
// expect: for the first four, the one error at UC-001 and the line of the link, under THE PRODUCT REPOSITORY IS SELF-SUFFICIENT,
//         naming the target; for the last two none, which are other places
test("selfSufficiencyFindings — a link to the instance's repository or to its dashboard is an error, a link to another place is none", async () => {
  const flagged = [
    "https://github.com/fixture-owner/agent-m/blob/main/SPEC.md",
    "https://github.com/fixture-owner/agent-m",
    "https://fixture-owner.github.io/agent-m/",
    "https://fixture-owner.github.io/agent-m/#settings",
  ];
  for (const target of flagged) {
    const goal = `${GOAL} See [Agent M](${target}).`;
    const { lines, graph } = await repository({ [UC_PATH]: replace(GOAL, goal) });
    assertFindings(selfSufficiencyFindings(graph, INSTANCE), [want("UC-001", lineOf(lines[UC_PATH], goal), SELF, target)], target);
  }
  for (const target of ["https://github.com/fixture-owner/agent-m-tools", "https://other-owner.github.io/agent-m/"]) {
    const { graph } = await repository({ [UC_PATH]: replace(GOAL, `${GOAL} See [elsewhere](${target}).`) });
    assert.ok(graph.links.some((link) => link.target === target), `known positive: the graph holds the link to ${target}`);
    assert.deepEqual(selfSufficiencyFindings(graph, INSTANCE), [], target);
  }
});
