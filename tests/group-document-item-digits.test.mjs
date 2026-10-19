// A group names backlog items of three or more digits (ITM-1091), as MOD-identifiers' accepted text gives an item's identifier (docs/architecture/MOD-identifiers.md:54, `ITM-<nnn>`, three or more digits)
// to the reader of group files, `docs/assets/artifacts/groups.mjs`, which MOD-group-document takes over (docs/architecture/MOD-group-document.md:38). Reads a group file with parseGroupFile and lays it over
// the known items with hierarchy.
// Run: node --test tests/group-document-item-digits.test.mjs
//
// Module: MOD-group-document
// Guards: A GROUP HOLDS ONE KIND OF ARTIFACT; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; EVERY ARTIFACT HAS AN IDENTIFIER
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); each pairs the case under test with a three-digit item, still read. The reader does not order items: the items no group names
// are appended in the order the caller gives them, so no ordering is asserted. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { hierarchy, parseGroupFile } from "../docs/assets/artifacts/groups.mjs";

const FILE = (members) => `# Backlog items — groups\n\nThe hierarchy of the backlog items.\n\n- Sprint\n${members.map((id) => `  - ${id}`).join("\n")}\n`;
const rules = (problems) => problems.map(({ artifact, line, kind, rule }) => [artifact, line, kind, rule]);

// TST-1091101 · level: unit · module: MOD-group-document
// guards: A GROUP HOLDS ONE KIND OF ARTIFACT; EVERY ARTIFACT HAS AN IDENTIFIER
// given: a group file whose group Sprint names ITM-100, ITM-999 and ITM-1000, and the same three as the known items
// input: hierarchy(parseGroupFile(text), items)
// expect: no problem; the group holds the three as members, none marked unknown, and none left to be placed
test("hierarchy — a group that names ITM-100, ITM-999 and ITM-1000 reads all three as backlog items", () => {
  const items = ["ITM-100", "ITM-999", "ITM-1000"];
  const { tree, problems } = hierarchy(parseGroupFile(FILE(items)), items);
  assert.deepEqual(problems, []);
  assert.equal(tree.kind, "backlog-item");
  assert.deepEqual(tree.children[0].children.map(({ id, unknown }) => [id, unknown ?? false]), [["ITM-100", false], ["ITM-999", false], ["ITM-1000", false]]);
  assert.equal(tree.children.filter((node) => node.notYetPlaced).length, 0);
});

// TST-1091102 · level: unit · module: MOD-group-document
// guards: A GROUP HOLDS ONE KIND OF ARTIFACT
// given: a group file whose group Sprint names ITM-100 and ITM-99 (line 7), and the known items ITM-100 and ITM-999
// input: hierarchy(parseGroupFile(text), items)
// expect: one error, for ITM-99 at line 7, under A GROUP HOLDS ONE KIND OF ARTIFACT — it is no backlog item —; none for ITM-100 (known positive)
test("hierarchy — ITM-99 is not a backlog item", () => {
  const { problems } = hierarchy(parseGroupFile(FILE(["ITM-100", "ITM-99"])), ["ITM-100", "ITM-999"]);
  assert.deepEqual(rules(problems), [["ITM-99", 7, "error", "A GROUP HOLDS ONE KIND OF ARTIFACT"]]);
});

// TST-1091103 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY
// given: ITM-1000 named twice in a group file (lines 6 and 7), and the known item ITM-1000 with ITM-100
// input: hierarchy(parseGroupFile(text), items)
// expect: one error, for the second ITM-1000 at line 7, under AN ITEM HAS ONE PLACE IN ITS HIERARCHY, and nothing for ITM-100 left unplaced beyond it
test("hierarchy — an item of four digits named twice is listed a second time", () => {
  const { problems } = hierarchy(parseGroupFile(FILE(["ITM-1000", "ITM-1000"])), ["ITM-1000", "ITM-100"]);
  assert.deepEqual(rules(problems), [["ITM-1000", 7, "error", "AN ITEM HAS ONE PLACE IN ITS HIERARCHY"]]);
});

// TST-1091104 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY
// given: a group file naming ITM-100 only, and the known items ITM-100, ITM-999 and ITM-1000
// input: hierarchy(parseGroupFile(text), items)
// expect: no problem; ITM-999 and ITM-1000 are appended as not yet placed, in the order given
test("hierarchy — the items no group names are laid over the tree, those of four digits among them", () => {
  const { tree, problems } = hierarchy(parseGroupFile(FILE(["ITM-100"])), ["ITM-100", "ITM-999", "ITM-1000"]);
  assert.deepEqual(problems, []);
  assert.deepEqual(tree.children.filter((node) => node.notYetPlaced).map((node) => node.id), ["ITM-999", "ITM-1000"]);
});
