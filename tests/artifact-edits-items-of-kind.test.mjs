// MOD-artifact-edits' recipe items-of-kind (ITM-723; UC-021 1b), as the accepted text of docs/architecture/MOD-artifact-edits.md states it: "recipe `items-of-kind` — the title and
// identifier of every item of the kind the job's parameters name, with the whole text of each requirement when the kind is requirements, and the current group file", and as the
// Uses state it: MOD-trace-graph.traceGraph gives "the items of a kind with their identifiers and titles", MOD-spec-document.parseSpec "the text of each requirement".
// Run: node --test tests/artifact-edits-items-of-kind.test.mjs
//
// Module: MOD-artifact-edits
// Guards: UC-021; ARTIFACTS ARE ARRANGED IN NESTED GROUPS; THE PAGE NAMES WHERE IT SENDS
// Level: unit
//
// The product is a fixture snapshot of one requirement pair, a use case, a decision, a module, a test and, for two kinds, a group file. The items are the nodes of traceGraph of the
// kinds the check group-rules reads (requirement, UC, ARC, MOD, TST), as the job's parameter `kind` names them (requirements, use-cases, architecture, modules, tests). Where the
// module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The recipe gives two parts, in this order: one named `the <kind>` whose text holds one line `- <identifier> — <title>` for each item, sorted by identifier — a requirement is
//     its name, with its whole text on the lines after `- <name>`, and an item with no title (a test) is `- <identifier>` alone —; and, where the product has one, a part named
//     `docs/groups/<kind>.md` holding the group file as it stands. A product without a group file gives the first part only.
//   - The parts name no source and are required: size 0, sources [].
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { editStrategies } from "../src/artifact-edits/index.mjs";

const RULE_ONE = "A SAMPLE RULE", RULE_TWO = "ANOTHER SAMPLE RULE";
const SPEC = ["# Fixture product — Specification", "", "## Section", "",
  `**${RULE_ONE}** *(Product Owner)*`, "A sample rule that a use case realises.", "*Check:* `tests/sample.test.mjs`", "",
  `**${RULE_TWO}** *(Product Owner)*`, "Another sample rule.", "*Check:* no automatic check; at review", ""].join("\n");
const useCase = (id, slug, title) => [`docs/use-cases/${id}-${slug}.md`,
  `---\nid: ${id}\ntitle: ${title}\narea: reading\nactors:\n  - Reader\nrealises:\n  - ${RULE_ONE}\n---\n# ${id} ${title}\n`];
const decision = (id, slug, title) => [`docs/architecture/${id}-${slug}.md`,
  `---\nid: ${id}\ntitle: ${title}\nforced_by:\n  - ${RULE_ONE}\n---\n# ${id} ${title}\n\n## Context\n\nc\n`];
const module_ = (id, title) => [`docs/architecture/${id}.md`,
  `---\nid: ${id}\ntitle: ${title}\nfolder: src/${id.slice(4)}/\nrealises:\n  - ${RULE_ONE}\nfollows:\n  - ARC-002\nuses: []\nprovides:\n  - read\n---\n# ${id} ${title}\n`];
const GROUPS = {
  requirements: `# Requirements — groups\n\nThe hierarchy of the requirements.\n\n- Samples\n  - ${RULE_ONE}\n`,
  "use-cases": "# Use cases — groups\n\nThe hierarchy of the use cases.\n\n- Reading\n  - UC-001\n",
};
const FILES = Object.fromEntries([["SPEC.md", SPEC],
  useCase("UC-001", "read-a-file", "Read a file"), useCase("UC-002", "write-a-file", "Write a file"),
  decision("ARC-002", "reading-lives-in-a-module", "Reading lives in a module"), decision("ARC-003", "writing-too", "Writing too"),
  module_("MOD-reader", "Reading a file"), module_("MOD-writer", "Writing a file"),
  ["tests/sample.test.mjs", `// TST-001\n// level: unit\n// guards: ${RULE_ONE}\n// TST-002\n// level: unit\n// guards: ${RULE_TWO}\n`],
  ["docs/groups/requirements.md", GROUPS.requirements], ["docs/groups/use-cases.md", GROUPS["use-cases"]]]);

const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const snapshotOf = (files) => ({ repository: REPOSITORY, ref: "main", commit: null, paths: Object.keys(files).sort(),
  read: async (path) => (path in files ? files[path] : null), blob: (path) => (path in files ? files[path] : null) });
const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const contextOf = (kind, params, files = FILES) => ({ kind, params, product: { address: REPOSITORY.web, snapshot: snapshotOf(files), host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null },
  gates: [], person: "alice", now: new Date("2026-10-19T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null });

const recipe = async (kind, files) => {
  const items = editStrategies.recipes?.["items-of-kind"];
  assert.equal(typeof items, "function", "the recipe items-of-kind is offered");
  return items(contextOf(null, { kind }, files), { kind });
};

// TST-723001 · level: unit · module: MOD-artifact-edits
// guards: UC-021; ARTIFACTS ARE ARRANGED IN NESTED GROUPS
// given: the fixture product, whose use cases and requirements have group files and whose other kinds have none
// input: the recipe items-of-kind for each of the five kinds
// expect: every item of the kind with its identifier and title, in the part `the <kind>`, sorted; none of another kind; a requirement with its name and its whole text; a test by its identifier alone; the group file as it stands, as a second part for use-cases and requirements, and no second part for the other three
test("items-of-kind — each of the five kinds gives its items with identifier and title, a requirement with its text, and the group file as it stands", async () => {
  const lines = async (kind) => (await recipe(kind, FILES));
  const want = {
    requirements: [`- ${RULE_ONE}`, "A sample rule that a use case realises.", `- ${RULE_TWO}`, "Another sample rule."],
    "use-cases": ["- UC-001 — Read a file", "- UC-002 — Write a file"],
    architecture: ["- ARC-002 — Reading lives in a module", "- ARC-003 — Writing too"],
    modules: ["- MOD-reader — Reading a file", "- MOD-writer — Writing a file"],
    tests: ["- TST-001", "- TST-002"],
  };
  for (const [kind, expected] of Object.entries(want)) {
    const parts = await lines(kind);
    assert.equal(parts[0].name, `the ${kind}`, kind);
    assert.deepEqual(parts[0].text.split("\n").filter(Boolean).map((line) => line.trim()), expected, kind);
    assert.deepEqual([parts[0].size, parts[0].sources, parts[0].required], [0, [], true], kind);
    if (GROUPS[kind]) {
      assert.deepEqual(parts.map((each) => each.name), [`the ${kind}`, `docs/groups/${kind}.md`], kind);
      assert.equal(parts[1].text, GROUPS[kind], `${kind}: the group file as it stands`);
    } else assert.equal(parts.length, 1, `${kind}: no group file, no second part`);
  }
});

// TST-723002 · level: unit · module: MOD-artifact-edits
// guards: UC-021; THE PAGE NAMES WHERE IT SENDS
// given: a product with no group files and no item of the kind modules
// input: the recipe for use-cases, and for modules
// expect: the use cases are given and no group part; for modules the part `the modules` is there and holds no item line (an empty kind is not an error)
test("items-of-kind — a product without a group file gives none, and a kind without items gives an empty list", async () => {
  const bare = Object.fromEntries(Object.entries(FILES).filter(([path]) => !path.startsWith("docs/groups/") && !path.startsWith("docs/architecture/MOD-")));
  const cases = await recipe("use-cases", bare);
  assert.deepEqual(cases.map((each) => each.name), ["the use-cases"]);
  assert.match(cases[0].text, /- UC-001 — Read a file/);
  const none = await recipe("modules", bare);
  assert.deepEqual(none.map((each) => each.name), ["the modules"]);
  assert.equal(none[0].text.includes("- MOD-"), false);
});

// TST-723003 · level: unit · module: MOD-artifact-edits
// guards: UC-021
// given: the kind propose-groups and this module's strategies registered with the job runner
// input: prepareJob("propose-groups", context for the kind use-cases, { drafter, reviewers: [] })
// expect: it does not throw UnknownStrategy; the parts of the recipe items-of-kind are those of the recipe, the use cases and their group file
test("prepareJob — propose-groups finds the recipe items-of-kind, with no strategy missing", async () => {
  try { registerStrategies("tests/artifact-edits-items-of-kind.test.mjs", editStrategies); } catch (error) { if (error.name !== "DuplicateStrategy") throw error; }
  const kind = await kindOf("propose-groups");
  const job = await prepareJob("propose-groups", contextOf(kind, { kind: "use-cases" }), { drafter: DRAFTER, reviewers: [] });
  const parts = job.parts.filter((each) => each.recipe === "items-of-kind");
  assert.deepEqual(parts.map((each) => each.name), ["the use-cases", "docs/groups/use-cases.md"]);
  assert.match(parts[0].text, /- UC-002 — Write a file/);
});
