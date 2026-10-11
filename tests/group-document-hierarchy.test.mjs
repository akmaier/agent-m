// The hierarchy of a group file (ITM-381) — MOD-group-document's hierarchy and the Hierarchy it returns, as
// docs/architecture/MOD-group-document.md states them: the tree with every item of the kind in its one place, the items no
// group names shown at the top level and listed as ungrouped, the members that match no item listed as unknown and not dropped,
// and the findings — an error under AN ITEM HAS ONE PLACE IN ITS HIERARCHY for a member named twice, and under A GROUP CARRIES NO
// IDENTIFIER for a group titled by an identifier. The moves have their own test file, tests/group-document-moves.test.mjs;
// groupFileText is not part of ITM-381 and is not tested here.
// Run: node --test tests/group-document-hierarchy.test.mjs
//
// Module: MOD-group-document
// Guards: UC-021; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
// Level: unit
//
// The group file is the module file's own example (its Data), read by parseGroupFile (ITM-300): the group Review (UC-006, UC-008)
// and the group Derivation (UC-005, UC-007), on lines 5 to 10 of docs/groups/use-cases.md; the items the caller gives are the four
// use cases, or as a test says. Each test states its input and its expected result before it runs (given / input / expect);
// where a test expects that nothing is reported, the same call is first shown to report on a known positive. A tree is compared
// as a person reads it, without the lines (outline). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as groupDocument from "../src/group-document/index.mjs";

// A name the module does not provide is undefined here, so that each test fails by itself, not the whole file at once.
const { hierarchy, parseGroupFile } = groupDocument;

const MODULE_FILE = readFileSync(new URL("../docs/architecture/MOD-group-document.md", import.meta.url), "utf8");
// The module file's example of a group file: the ```text fence of its Data, without the fences.
const EXAMPLE = /```text\n([\s\S]*?)```/.exec(MODULE_FILE)?.[1] ?? "";
const PATH = "docs/groups/use-cases.md";
const ITEMS = ["UC-005", "UC-006", "UC-007", "UC-008"];

// A tree, or a group of it, as a person reads it: each group as { title, groups, members }, each member as its identifier.
const outline = (node) => ({
  groups: node.groups.map((group) => ({ title: group.title, ...outline(group) })),
  members: node.members.map((member) => member.id),
});
const group = (title, groups, members) => ({ title, groups, members });

// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-021
// given: the example group file with UC-006 listed a second time, under Derivation, on line 11 — its first place is on line 6 —,
//        and the four use cases as the items
// input: hierarchy of the tree parseGroupFile reads from it
// expect: one finding: an error at line 11 of docs/groups/use-cases.md under AN ITEM HAS ONE PLACE IN ITS HIERARCHY, saying
//         UC-006 is listed a second time and where it first stands, and what to do; the tree shows both places; nothing is unknown
//         or ungrouped. The example itself reports nothing.
test("hierarchy — a member named twice is an error under AN ITEM HAS ONE PLACE IN ITS HIERARCHY, and both places stay", () => {
  const clean = hierarchy(parseGroupFile(PATH, EXAMPLE), ITEMS);
  assert.deepEqual([clean.findings, clean.unknown, clean.ungrouped], [[], [], []], "known positive: the example reports nothing");
  const text = EXAMPLE.replace("  - UC-007\n", "  - UC-007\n  - UC-006\n");
  assert.ok(text.includes("  - UC-007\n  - UC-006\n"), "the example was changed as the test says");
  const result = hierarchy(parseGroupFile(PATH, text), ITEMS);
  assert.deepEqual(result.findings, [{
    artifact: PATH, line: 11, kind: "error", rule: "AN ITEM HAS ONE PLACE IN ITS HIERARCHY",
    what: "UC-006 is listed a second time (first on line 6)", fix: "keep UC-006 in one place and remove the other line",
  }]);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [], ["UC-006", "UC-008"]), group("Derivation", [], ["UC-005", "UC-007", "UC-006"])],
    members: [],
  });
  assert.deepEqual([result.unknown, result.ungrouped], [[], []]);
});

// guards: A GROUP CARRIES NO IDENTIFIER; UC-021
// given: the example group file with the group Derivation titled UC-004 instead — a use case's identifier — on line 8, and the
//        four use cases as the items
// input: hierarchy of the tree parseGroupFile reads from it
// expect: one finding: an error at line 8 of docs/groups/use-cases.md under A GROUP CARRIES NO IDENTIFIER, saying the group's
//         title is an identifier, and what to do; the group stays in the tree with its members. The example itself reports nothing.
test("hierarchy — a group titled by an identifier is an error under A GROUP CARRIES NO IDENTIFIER", () => {
  const clean = hierarchy(parseGroupFile(PATH, EXAMPLE), ITEMS);
  assert.deepEqual(clean.findings, [], "known positive: the example reports nothing");
  const text = EXAMPLE.replace("- Derivation\n", "- UC-004\n");
  assert.ok(text.includes("- UC-004\n  - UC-005\n"), "the example was changed as the test says");
  const result = hierarchy(parseGroupFile(PATH, text), ITEMS);
  assert.deepEqual(result.findings, [{
    artifact: PATH, line: 8, kind: "error", rule: "A GROUP CARRIES NO IDENTIFIER",
    what: 'the group title "UC-004" is an identifier',
    fix: "name the group by a title in words, and list an identifier as a member of a group, never as its title",
  }]);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [], ["UC-006", "UC-008"]), group("UC-004", [], ["UC-005", "UC-007"])],
    members: [],
  });
});

// guards: AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL; UC-021
// given: the example group file, with UC-005, UC-006, UC-007 and UC-009 as the items — so UC-008, which Review lists, matches no
//        item, and UC-009, which no group lists, is named by none
// input: hierarchy of the tree parseGroupFile reads from the example
// expect: UC-008 listed as unknown, and not dropped: Review still holds it; no finding, since an unknown member may be left; UC-009
//         listed as ungrouped and shown at the top level of the tree
test("hierarchy — a member that matches no item is listed as unknown, not dropped, and an item no group names is shown at the top level", () => {
  const result = hierarchy(parseGroupFile(PATH, EXAMPLE), ["UC-005", "UC-006", "UC-007", "UC-009"]);
  assert.deepEqual(result.unknown, ["UC-008"]);
  assert.deepEqual(result.ungrouped, ["UC-009"]);
  assert.deepEqual(result.findings, []);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [], ["UC-006", "UC-008"]), group("Derivation", [], ["UC-005", "UC-007"])],
    members: ["UC-009"],
  });
});
