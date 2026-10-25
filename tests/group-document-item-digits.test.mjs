// A group names items of three or more digits (ITM-1091), as MOD-identifiers' accepted text gives a numbered identifier
// (docs/architecture/MOD-identifiers.md, Data: `UC-<nnn>` and `ITM-<nnn>`, three or more digits) to MOD-group-document, which
// tells a member from a group's title by it (docs/architecture/MOD-group-document.md, Uses: `MOD-identifiers.kindOfIdentifier`).
// Reads a group file with parseGroupFile and lays it over the known items with hierarchy.
// Run: node --test tests/group-document-item-digits.test.mjs
//
// Module: MOD-group-document
// Guards: A GROUP CARRIES NO IDENTIFIER; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL; EVERY ARTIFACT HAS AN IDENTIFIER
// Level: unit
//
// The group file is that of the use cases, docs/groups/use-cases.md: a backlog item has no group file of its kind among the
// kinds the module names, and UC- is numbered with three or more digits as ITM- is. Each test states its input and its expected
// result before it runs (given / input / expect); each pairs the case under test with a three-digit item, still read. The
// reader does not order items: the items no group names are appended in the order the caller gives them. The counter-proofs are
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { hierarchy, parseGroupFile } from "../src/group-document/index.mjs";

const PATH = "docs/groups/use-cases.md";
const FILE = (members) => `# Use cases — groups\n\nThe hierarchy of the use cases, each member by its identifier.\n\n- Sprint\n${members.map((id) => `  - ${id}`).join("\n")}\n`;
const rules = (findings) => findings.map(({ artifact, line, kind, rule }) => [artifact, line, kind, rule]);

// TST-1091101 · level: unit · module: MOD-group-document
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: a group file whose group Sprint names UC-100, UC-999 and UC-1000, and the same three as the known items
// input: hierarchy(parseGroupFile(path, text), items)
// expect: no finding; the group holds the three as members, none unknown, and none left to be placed
test("hierarchy — a group that names UC-100, UC-999 and UC-1000 reads all three as members", () => {
  const items = ["UC-100", "UC-999", "UC-1000"];
  const { tree, ungrouped, unknown, findings } = hierarchy(parseGroupFile(PATH, FILE(items)), items);
  assert.deepEqual(findings, []);
  assert.deepEqual(tree.groups[0].members.map(({ id }) => id), items);
  assert.deepEqual([ungrouped, unknown], [[], []]);
});

// TST-1091102 · level: unit · module: MOD-group-document
// guards: A GROUP CARRIES NO IDENTIFIER
// given: a group file whose group Sprint names UC-100 and UC-99 (line 7), and the known items UC-100 and UC-999
// input: hierarchy(parseGroupFile(path, text), items)
// expect: UC-99, which is no identifier, is no member but the title of a group inside Sprint, and no finding names it, since its title is no identifier; UC-100 is a member (known positive)
test("hierarchy — UC-99 is no identifier, so it is a group's title and no member", () => {
  const { tree, findings } = hierarchy(parseGroupFile(PATH, FILE(["UC-100", "UC-99"])), ["UC-100", "UC-999"]);
  assert.deepEqual(tree.groups[0].members.map(({ id }) => id), ["UC-100"]);
  assert.deepEqual(tree.groups[0].groups.map(({ title, line }) => [title, line]), [["UC-99", 7]]);
  assert.deepEqual(rules(findings), []);
});

// TST-1091103 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY
// given: UC-1000 named twice in a group file (lines 6 and 7), and the known items UC-1000 and UC-100
// input: hierarchy(parseGroupFile(path, text), items)
// expect: one error, at line 7 of the group file, under AN ITEM HAS ONE PLACE IN ITS HIERARCHY, naming the second UC-1000
test("hierarchy — an item of four digits named twice is listed a second time", () => {
  const { findings } = hierarchy(parseGroupFile(PATH, FILE(["UC-1000", "UC-1000"])), ["UC-1000", "UC-100"]);
  assert.deepEqual(rules(findings), [[PATH, 7, "error", "AN ITEM HAS ONE PLACE IN ITS HIERARCHY"]]);
  assert.match(findings[0].what, /^UC-1000 is listed a second time/);
});

// TST-1091104 · level: unit · module: MOD-group-document
// guards: AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
// given: a group file naming UC-100 only, and the known items UC-100, UC-999 and UC-1000
// input: hierarchy(parseGroupFile(path, text), items)
// expect: no finding; UC-999 and UC-1000 are ungrouped and stand at the top level, in the order given
test("hierarchy — the items no group names are laid over the tree, those of four digits among them", () => {
  const { tree, ungrouped, findings } = hierarchy(parseGroupFile(PATH, FILE(["UC-100"])), ["UC-100", "UC-999", "UC-1000"]);
  assert.deepEqual(findings, []);
  assert.deepEqual(ungrouped, ["UC-999", "UC-1000"]);
  assert.deepEqual(tree.members.map(({ id }) => id), ["UC-999", "UC-1000"]);
});
