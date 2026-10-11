// A group file read (ITM-300) — MOD-group-document's GroupTree and parseGroupFile, as docs/architecture/MOD-group-document.md
// states them: a group file docs/groups/<kind>.md read into its groups — their titles, their members and their lines —, its
// kind taken from its path, and NotAGroupFile for any other path. The arrangement of UC-021 (groupFileText, applyMoves,
// GroupMove) and the hierarchy with its findings are not part of ITM-300 and are not tested here.
// Run: node --test tests/group-document-read.test.mjs
//
// Module: MOD-group-document
// Guards: UC-007; UC-019; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; A GROUP CARRIES NO IDENTIFIER
// Level: unit
//
// The group file that is read is the module file's own example (its Data), cut out of the module file between its ```text
// fence and the fence's end. Each test states its input and its expected result before it runs (given / input / expect);
// the test that expects a refusal first shows the same text read on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseGroupFile } from "../src/group-document/index.mjs";

const MODULE_FILE = readFileSync(new URL("../docs/architecture/MOD-group-document.md", import.meta.url), "utf8");

// The module file's example of a group file: the ```text fence of its Data, without the fences. Its lines, from 1:
//  1 # Use cases — groups
//  2
//  3 The hierarchy of the use cases, each member by its identifier.
//  4
//  5 - Review
//  6   - UC-006
//  7   - UC-008
//  8 - Derivation
//  9   - UC-005
// 10   - UC-007
const EXAMPLE = /```text\n([\s\S]*?)```/.exec(MODULE_FILE)?.[1] ?? "";

// What reading the example under the path of a use-case group file must give, as the module file states GroupTree: the
// groups in the order they stand, each with its title and its line, its groups and its members — each with its identifier
// and its line —, and the top-level members, of which the example has none.
const EXPECTED = {
  kind: "use-cases",
  groups: [
    { title: "Review", line: 5, groups: [], members: [{ id: "UC-006", line: 6 }, { id: "UC-008", line: 7 }] },
    { title: "Derivation", line: 8, groups: [], members: [{ id: "UC-005", line: 9 }, { id: "UC-007", line: 10 }] },
  ],
  members: [],
};

const KINDS = ["requirements", "use-cases", "architecture", "modules", "tests"];

// guards: EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; A GROUP CARRIES NO IDENTIFIER
// given: the module file's example — a title line, a line saying what the file arranges, and a list of two groups:
//        Review (line 5) holding UC-006 (line 6) and UC-008 (line 7), Derivation (line 8) holding UC-005 (line 9) and
//        UC-007 (line 10)
// input: parseGroupFile("docs/groups/use-cases.md", example); then the same text under the path of each of the five kinds
// expect: under the use-cases path, kind "use-cases" and exactly two groups, Review then Derivation, each with its title and
//         line, no group inside it and its two members with identifier and line, and no member at the top level; no group
//         has an identifier; the title line and the explaining line are neither a group nor a member; under the path of
//         each kind the same text gives the same groups and that kind
test("parseGroupFile — the module file's example is read into its groups, their members and their lines, its kind from the path", () => {
  assert.ok(EXAMPLE.startsWith("# Use cases — groups\n") && EXAMPLE.split("\n").length === 11,
    "known positive: the module file's example was cut out whole, ten lines");
  const tree = parseGroupFile("docs/groups/use-cases.md", EXAMPLE);
  assert.deepEqual(tree, EXPECTED);
  for (const group of tree.groups) assert.equal("id" in group, false, `the group ${group.title} carries no identifier`);
  for (const kind of KINDS) {
    assert.deepEqual(parseGroupFile(`docs/groups/${kind}.md`, EXAMPLE), { ...EXPECTED, kind }, `the kind comes from the path ${kind}`);
  }
});

// guards: EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
// given: the module file's example; a known positive — the path docs/groups/use-cases.md of a known kind; and the path
//        docs/groups/sprints.md, of a kind the module does not know
// input: parseGroupFile(path, example) for each
// expect: the known path is read, with kind "use-cases"; the unknown one throws an error named NotAGroupFile whose message
//         names the path
test("parseGroupFile — a path of an unknown kind is refused as NotAGroupFile, naming the path", () => {
  assert.equal(parseGroupFile("docs/groups/use-cases.md", EXAMPLE).kind, "use-cases", "known positive: a path of a known kind is read");
  assert.throws(() => parseGroupFile("docs/groups/sprints.md", EXAMPLE), { name: "NotAGroupFile", message: /docs\/groups\/sprints\.md/ });
});
