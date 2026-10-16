// ITM-554: architectureImpact derives the accepted result from a public graph and supplied texts.
// Module: MOD-trace-graph
// Guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// Level: unit
// Run: node --test tests/trace-graph-architecture-impact.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as trace from "../src/trace-graph/index.mjs";

const ARC = "docs/architecture/ARC-001-reading.md";
const READER = "docs/architecture/MOD-reader.md";
const NEW = "docs/architecture/MOD-new.md";

function moduleText(id, { provides = [], uses = [], follows = [], realises = [], interfaces = [], responsibility = "One concern." } = {}) {
  return ["---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`,
    "realises:", ...realises.map((name) => `  - ${name}`),
    "follows:", ...follows.map((name) => `  - ${name}`),
    "uses:", ...uses.map((name) => `  - ${name}`),
    "provides:", ...provides.map((name) => `  - ${name}`),
    "---", `# ${id}`, "", "## Responsibility", "", responsibility, "", "## Interfaces", "", ...interfaces, ""].join("\n");
}

function decisionText(id, designs, names) {
  return ["---", `id: ${id}`, `title: ${id}`, "forced_by:", ...names.map((name) => `  - ${name}`),
    "designs:", ...designs.map((name) => `  - ${name}`), "---", `# ${id}`, "", "## Decision", "", "A single concern.", ""].join("\n");
}

function itemText(id, module) {
  return ["---", `id: ${id}`, `title: ${id}`, "level: module", "modules:", `  - ${module}`,
    "tests:", "  - unit", "---", `# ${id}`, ""].join("\n");
}

function testText(id, module, guards) {
  return [`// ${id}`, "// level: unit", `// module: ${module}`, `// guards: ${guards.join("; ")}`, ""].join("\n");
}

const READER_BEFORE = moduleText("MOD-reader", {
  provides: ["readFile", "listTree", "Meta"], follows: ["ARC-001"], realises: ["RULE ONE", "UC-001"],
  interfaces: ["- `readFile(path) -> text | null` - read a file.", "- `listTree() -> [path]` - list paths.", "- `Meta` - file metadata."],
});
const ARC_BEFORE = decisionText("ARC-001", ["MOD-reader"], ["RULE ONE", "UC-001"]);

const FILES = {
  "SPEC.md": "# Fixture\n\n**RULE ONE** *(Product Owner)*\nFirst rule.\n\n**RULE TWO** *(Product Owner)*\nSecond rule.\n",
  [ARC]: ARC_BEFORE,
  [READER]: READER_BEFORE,
  "docs/architecture/MOD-review.md": moduleText("MOD-review", { uses: ["MOD-reader.readFile"] }),
  "docs/architecture/MOD-tree-view.md": moduleText("MOD-tree-view", { uses: ["MOD-reader.listTree"] }),
  "docs/architecture/MOD-stable-view.md": moduleText("MOD-stable-view", { uses: ["MOD-reader.Meta"] }),
  "docs/architecture/MOD-follower.md": moduleText("MOD-follower", { follows: ["ARC-001"] }),
  "docs/architecture/MOD-writer.md": moduleText("MOD-writer"),
  "tests/reader.test.mjs": testText("TST-101", "MOD-reader", ["RULE ONE", "UC-001"]),
  "tests/review.test.mjs": testText("TST-102", "MOD-review", ["RULE TWO"]),
  "tests/tree-view.test.mjs": testText("TST-103", "MOD-tree-view", ["RULE TWO"]),
  "tests/follower.test.mjs": testText("TST-104", "MOD-follower", ["RULE ONE"]),
  "tests/writer.test.mjs": testText("TST-105", "MOD-writer", ["RULE TWO"]),
  "tests/stable-view.test.mjs": testText("TST-106", "MOD-stable-view", ["RULE ONE"]),
  "docs/backlog/ITM-101-reader.md": itemText("ITM-101", "MOD-reader"),
  "docs/plan/ITM-102-review.md": itemText("ITM-102", "MOD-review"),
  "docs/backlog/ITM-103-tree-view.md": itemText("ITM-103", "MOD-tree-view"),
  "docs/plan/ITM-104-follower.md": itemText("ITM-104", "MOD-follower"),
  "docs/backlog/ITM-105-writer.md": itemText("ITM-105", "MOD-writer"),
  "docs/backlog/ITM-106-stable-view.md": itemText("ITM-106", "MOD-stable-view"),
  "src/reader/read.mjs": "export const read = 1;\n",
  "src/reader/nested/types.ts": "export type File = string;\n",
  "src/review/view.py": "view = 1\n",
  "src/tree-view/view.js": "export const tree = 1;\n",
  "src/stable-view/view.css": "p { color: black; }\n",
  "src/follower/follow.mjs": "export const follow = 1;\n",
  "src/writer/write.mjs": "export const write = 1;\n",
  "src/reader-extra/unrelated.mjs": "export const unrelated = 1;\n",
};

async function fixture(edits = {}) {
  const files = { ...FILES, ...edits };
  const paths = Object.keys(files).filter((path) => files[path] !== null);
  const reads = [];
  const graph = await trace.traceGraph({ paths, read: async (path) => { reads.push(path); return files[path]; } });
  assert.deepEqual(graph.unread, [], "positive control: the supplied artifacts are readable");
  return { graph, reads };
}

// Only order is normalised: every public field and every entry is still compared, with no projection or deduplication.
function canonical(impact) {
  if (impact === undefined) return impact;
  const byId = (a, b) => a.id.localeCompare(b.id);
  return { ...impact, modules: [...impact.modules].sort(byId), codeFiles: [...impact.codeFiles].sort(),
    tests: impact.tests.map((entry) => ({ ...entry, guards: [...entry.guards].sort() })).sort(byId),
    named: { ...impact.named, added: [...impact.named.added].sort(), removed: [...impact.named.removed].sort() },
    items: [...impact.items].sort() };
}

// TST-554001
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: the fixture has a reader folder, interface users, exercised tests and both backlog and plan items
// input: public traceGraph, then requirementImpact for RULE ONE
// expect: folder src/reader/, all three provided interfaces, the readFile uses edge, reader exercises and guards edges,
// expect: ITM-101 and ITM-102 changes edges, src/reader/read.mjs in files but no code node/read, and the positive TST-101 guards row
test("TST-554001 public graph facts and requirement impact are positive before architecture impact", async () => {
  const { graph, reads } = await fixture();
  assert.equal(graph.nodes.get("MOD-reader").folder, "src/reader/");
  assert.deepEqual(graph.nodes.get("MOD-reader").provides, ["readFile", "listTree", "Meta"]);
  assert.deepEqual(graph.edges.filter((edge) => edge.from === "MOD-review" && edge.via === "uses")
    .map(({ to, interface: name }) => [to, name]), [["MOD-reader.readFile", "readFile"]]);
  assert.deepEqual(graph.edges.filter((edge) => edge.from === "TST-101").map(({ via, to }) => [via, to]),
    [["guards", "RULE ONE"], ["guards", "UC-001"], ["exercises", "MOD-reader"]]);
  assert.deepEqual(graph.edges.filter((edge) => ["ITM-101", "ITM-102"].includes(edge.from) && edge.via === "changes")
    .map(({ from, to }) => [from, to]), [["ITM-101", "MOD-reader"], ["ITM-102", "MOD-review"]]);
  assert.ok(graph.files.includes("src/reader/read.mjs"));
  assert.ok(reads.includes(READER), "positive control: artifact reads took place");
  assert.equal(reads.includes("src/reader/read.mjs"), false);
  assert.deepEqual([...graph.nodes.values()].filter((node) => node.kind === "code"), []);
  assert.deepEqual(trace.requirementImpact(graph, "RULE ONE").filter((row) => row.id === "TST-101"),
    [{ id: "TST-101", kind: "TST", path: "tests/reader.test.mjs", line: 1, via: "guards" }]);
});

// TST-554002
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: ARC-001 formerly designs writer, now designs reader; reader and follower follow it
// input: architectureImpact of the current graph and supplied before/after decision texts, changing RULE ONE/UC-001 to RULE TWO/UC-002
// expect: reader, writer and follower changed/nonbreaking; their four code files, TST-101/104/105 with guards, ITM-101/104/105,
// expect: RULE TWO and UC-002 added, RULE ONE and UC-001 removed; no interface users are affected by a decision edit
test("TST-554002 changed decision includes designs from both texts and graph followers", async () => {
  const before = decisionText("ARC-001", ["MOD-writer"], ["RULE ONE", "UC-001"]);
  const after = decisionText("ARC-001", ["MOD-reader"], ["RULE TWO", "UC-002"]);
  const { graph } = await fixture({ [ARC]: after });
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path: ARC, before, after }])), {
    modules: [{ id: "MOD-follower", why: "changed", breaks: false }, { id: "MOD-reader", why: "changed", breaks: false },
      { id: "MOD-writer", why: "changed", breaks: false }],
    codeFiles: ["src/follower/follow.mjs", "src/reader/nested/types.ts", "src/reader/read.mjs", "src/writer/write.mjs"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }, { id: "TST-104", guards: ["RULE ONE"] },
      { id: "TST-105", guards: ["RULE TWO"] }],
    named: { added: ["RULE TWO", "UC-002"], removed: ["RULE ONE", "UC-001"] }, items: ["ITM-101", "ITM-104", "ITM-105"],
  });
});

// TST-554003
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: new ARC-002 designs writer and follower follows it
// input: architectureImpact with before null and the added decision naming RULE TWO and UC-002
// expect: follower/writer changed/nonbreaking, their two code files, TST-104/105 with guards and ITM-104/105;
// expect: added RULE TWO/UC-002, removed []
test("TST-554003 added decision has the same designs and follows path with a null before", async () => {
  const path = "docs/architecture/ARC-002-writing.md";
  const after = decisionText("ARC-002", ["MOD-writer"], ["RULE TWO", "UC-002"]);
  const { graph } = await fixture({ [path]: after,
    "docs/architecture/MOD-follower.md": moduleText("MOD-follower", { follows: ["ARC-002"] }) });
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path, before: null, after }])), {
    modules: [{ id: "MOD-follower", why: "changed", breaks: false }, { id: "MOD-writer", why: "changed", breaks: false }],
    codeFiles: ["src/follower/follow.mjs", "src/writer/write.mjs"],
    tests: [{ id: "TST-104", guards: ["RULE ONE"] }, { id: "TST-105", guards: ["RULE TWO"] }],
    named: { added: ["RULE TWO", "UC-002"], removed: [] }, items: ["ITM-104", "ITM-105"],
  });
});

// TST-554004
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: ARC-001 has left the snapshot; its supplied before designs reader, and reader/follower still follow it
// input: architectureImpact with after null
// expect: follower/reader changed/nonbreaking, their three code files, TST-101/104 with guards and ITM-101/104;
// expect: added [], removed RULE ONE/UC-001 even though ARC-001 is no current node
test("TST-554004 removed decision retains designs and followers without a current decision node", async () => {
  const { graph } = await fixture({ [ARC]: null });
  assert.ok(graph.nodes.has("MOD-reader"), "positive control: the current modules are present");
  assert.equal(graph.nodes.has("ARC-001"), false);
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path: ARC, before: ARC_BEFORE, after: null }])), {
    modules: [{ id: "MOD-follower", why: "changed", breaks: false }, { id: "MOD-reader", why: "changed", breaks: false }],
    codeFiles: ["src/follower/follow.mjs", "src/reader/nested/types.ts", "src/reader/read.mjs"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }, { id: "TST-104", guards: ["RULE ONE"] }],
    named: { added: [], removed: ["RULE ONE", "UC-001"] }, items: ["ITM-101", "ITM-104"],
  });
});

// TST-554005
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: reader changes readFile(path) to readFile(path, commit), removes listTree, and leaves Meta unchanged
// input: architectureImpact with the edited reader, whose realises changes RULE ONE/UC-001 to RULE TWO/UC-002
// expect: reader changed/nonbreaking, review breaking for altered readFile, tree-view breaking for removed listTree before reader;
// expect: reader/review/tree code, TST-101/102/103 with guards, ITM-101/102/103 and literal named deltas; no stable-view or reader-extra
test("TST-554005 altered and removed interfaces reach their public graph users and all downstream fields", async () => {
  const after = moduleText("MOD-reader", { provides: ["readFile", "Meta"], follows: ["ARC-001"], realises: ["RULE TWO", "UC-002"],
    interfaces: ["- `readFile(path, commit) -> text | null` - read a file.", "- `Meta` - file metadata."] });
  const { graph } = await fixture({ [READER]: after });
  const result = trace.architectureImpact?.(graph, [{ path: READER, before: READER_BEFORE, after }]);
  assert.deepEqual(canonical(result), {
    modules: [{ id: "MOD-reader", why: "changed", breaks: false },
      { id: "MOD-review", why: "uses an interface that changes", breaks: true },
      { id: "MOD-tree-view", why: "uses an interface that is removed", breaks: true }],
    codeFiles: ["src/reader/nested/types.ts", "src/reader/read.mjs", "src/review/view.py", "src/tree-view/view.js"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }, { id: "TST-102", guards: ["RULE TWO"] },
      { id: "TST-103", guards: ["RULE TWO"] }],
    named: { added: ["RULE TWO", "UC-002"], removed: ["RULE ONE", "UC-001"] }, items: ["ITM-101", "ITM-102", "ITM-103"],
  });
  assert.ok(result.modules.findIndex((entry) => entry.id === "MOD-tree-view") < result.modules.findIndex((entry) => entry.id === "MOD-reader"),
    "the user of the removed interface precedes the changed module (UC-023 4a)");
});

// TST-554006
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: a new module with no code yet, a test TST-107 guarding RULE TWO, and backlog item ITM-107 naming it
// input: architectureImpact with before null and the new module naming RULE TWO/UC-002
// expect: only MOD-new changed/nonbreaking, codeFiles [], TST-107 guards [RULE TWO], added RULE TWO/UC-002, removed [], items [ITM-107]
test("TST-554006 added module with no code still gives its exercised tests and item", async () => {
  const after = moduleText("MOD-new", { provides: ["open"], realises: ["RULE TWO", "UC-002"], interfaces: ["- `open() -> text` - open."] });
  const { graph } = await fixture({ [NEW]: after, "tests/new.test.mjs": testText("TST-107", "MOD-new", ["RULE TWO"]),
    "docs/backlog/ITM-107-new.md": itemText("ITM-107", "MOD-new") });
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path: NEW, before: null, after }])), {
    modules: [{ id: "MOD-new", why: "changed", breaks: false }], codeFiles: [],
    tests: [{ id: "TST-107", guards: ["RULE TWO"] }], named: { added: ["RULE TWO", "UC-002"], removed: [] }, items: ["ITM-107"],
  });
});

// TST-554007
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: reader has left the snapshot; its old folder, code, test, item and all three interface users remain
// input: architectureImpact with the original reader as before and after null
// expect: reader changed/nonbreaking; review/stable-view/tree-view breaking for removed interfaces; five code files including reader's old folder;
// expect: TST-101/102/103/106 with guards, ITM-101/102/103/106; added [], removed RULE ONE/UC-001
test("TST-554007 removed module recovers its folder from before and retains still-naming tests and users", async () => {
  const { graph } = await fixture({ [READER]: null });
  assert.ok(graph.nodes.has("MOD-review"), "positive control: the interface user is present");
  assert.equal(graph.nodes.has("MOD-reader"), false);
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path: READER, before: READER_BEFORE, after: null }])), {
    modules: [{ id: "MOD-reader", why: "changed", breaks: false },
      { id: "MOD-review", why: "uses an interface that is removed", breaks: true },
      { id: "MOD-stable-view", why: "uses an interface that is removed", breaks: true },
      { id: "MOD-tree-view", why: "uses an interface that is removed", breaks: true }],
    codeFiles: ["src/reader/nested/types.ts", "src/reader/read.mjs", "src/review/view.py", "src/stable-view/view.css", "src/tree-view/view.js"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }, { id: "TST-102", guards: ["RULE TWO"] },
      { id: "TST-103", guards: ["RULE TWO"] }, { id: "TST-106", guards: ["RULE ONE"] }],
    named: { added: [], removed: ["RULE ONE", "UC-001"] }, items: ["ITM-101", "ITM-102", "ITM-103", "ITM-106"],
  });
});

// TST-554008
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: reader's Responsibility alone changes, with the same provides and Interfaces declarations
// input: architectureImpact of that prose edit after the interface-change positive in TST-554005
// expect: only reader changed/nonbreaking, its two code files, TST-101 with RULE ONE/UC-001, ITM-101, no added/removed names;
// expect: no interface user, even though the current graph has readFile/listTree/Meta uses edges
test("TST-554008 unrelated responsibility prose does not manufacture interface changes", async () => {
  const after = READER_BEFORE.replace("One concern.", "Reads each file whole.");
  const { graph } = await fixture({ [READER]: after });
  assert.equal(graph.edges.filter((edge) => edge.via === "uses").length, 3, "positive control: users are in the graph");
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [{ path: READER, before: READER_BEFORE, after }])), {
    modules: [{ id: "MOD-reader", why: "changed", breaks: false }], codeFiles: ["src/reader/nested/types.ts", "src/reader/read.mjs"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }], named: { added: [], removed: [] }, items: ["ITM-101"],
  });
});

// TST-554009
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: the reader's prose changes and MOD-new is added in the same change set
// input: architectureImpact with both supplied changes, the new module's test TST-107 and plan item ITM-107
// expect: MOD-new/reader changed/nonbreaking, reader's two code files, TST-101/107 with guards, added RULE TWO/UC-002,
// expect: removed [], items ITM-101/107; neither change is lost and unchanged interface users stay out
test("TST-554009 one impact list includes every file in the supplied changes array", async () => {
  const editedReader = READER_BEFORE.replace("One concern.", "Reads each file whole.");
  const added = moduleText("MOD-new", { realises: ["RULE TWO", "UC-002"] });
  const { graph } = await fixture({ [READER]: editedReader, [NEW]: added,
    "tests/new.test.mjs": testText("TST-107", "MOD-new", ["RULE TWO"]),
    "docs/plan/ITM-107-new.md": itemText("ITM-107", "MOD-new") });
  assert.deepEqual(canonical(trace.architectureImpact?.(graph, [
    { path: READER, before: READER_BEFORE, after: editedReader }, { path: NEW, before: null, after: added },
  ])), {
    modules: [{ id: "MOD-new", why: "changed", breaks: false }, { id: "MOD-reader", why: "changed", breaks: false }],
    codeFiles: ["src/reader/nested/types.ts", "src/reader/read.mjs"],
    tests: [{ id: "TST-101", guards: ["RULE ONE", "UC-001"] }, { id: "TST-107", guards: ["RULE TWO"] }],
    named: { added: ["RULE TWO", "UC-002"], removed: [] }, items: ["ITM-101", "ITM-107"],
  });
});

// TST-554010
// level: unit
// module: MOD-trace-graph
// guards: AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023
// given: Graph.files lists reader code under ordinary, third_party, third-party and .git folder names, plus vendor/node_modules,
// given: a test file and a Markdown file; these are in-memory TextSource paths, not real repository writes
// input: architectureImpact for a reader prose change, after confirming ordinary reader code is included
// expect: the five literal programming-language paths below, including the three nonexcluded folder names; no vendor/node_modules,
// expect: test or Markdown paths, per the accepted code-file Data description rather than the legacy caller's extra exclusions
test("TST-554010 code files follow the accepted folder exclusions without legacy-only omissions", async () => {
  const after = READER_BEFORE.replace("One concern.", "Reads each file whole.");
  const { graph } = await fixture({ [READER]: after,
    "src/reader/third_party/adapt.mjs": "export const adapt = 1;\n",
    "src/reader/third-party/adapt.py": "adapt = 1\n",
    "src/reader/.git/local.js": "export const local = 1;\n",
    "src/reader/vendor/skip.mjs": "export const skip = 1;\n",
    "src/reader/node_modules/skip.css": "p {}\n",
    "src/reader/local.test.mjs": "// No test declaration.\n",
    "src/reader/README.md": "# Reader\n",
  });
  const actual = trace.architectureImpact(graph, [{ path: READER, before: READER_BEFORE, after }]).codeFiles;
  assert.ok(actual.includes("src/reader/read.mjs"), "positive control: ordinary code in the affected folder is included");
  assert.deepEqual([...actual].sort(), ["src/reader/.git/local.js", "src/reader/nested/types.ts", "src/reader/read.mjs",
    "src/reader/third-party/adapt.py", "src/reader/third_party/adapt.mjs"]);
});
