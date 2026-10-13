// Moves applied to a group file (ITM-381) — MOD-group-document's applyMoves and the GroupMove it takes, as
// docs/architecture/MOD-group-document.md states them: the moves applied in order to a new tree, the given tree unchanged; a
// move refused, with its reason, when it would put an item of another kind into the tree, delete a group that is not empty,
// give a group an identifier as its title or name a group that does not exist; no move deletes an item. hierarchy has its own
// test file, tests/group-document-hierarchy.test.mjs; groupFileText and the arrangement page (UC-021) are not part of ITM-381
// and are not tested here.
// Run: node --test tests/group-document-moves.test.mjs
//
// Module: MOD-group-document
// Guards: UC-021; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; A GROUP HOLDS ONE KIND OF ARTIFACT; REGROUPING LEAVES THE GROUPED FILE UNCHANGED
// Level: unit
//
// The tree the moves are applied to is the module file's own example (its Data), read by parseGroupFile (ITM-300): the group
// Review (UC-006, UC-008) and the group Derivation (UC-005, UC-007). A result is compared as a person reads it, without the
// lines (outline): each group as its title, its groups and its members, each member as its identifier. Each test states its
// input and its expected result before it runs (given / input / expect); a refusal is shown to leave the tree as it was. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as groupDocument from "../src/group-document/index.mjs";

// A name the module does not provide is undefined here, so that each test fails by itself, not the whole file at once.
const { applyMoves, parseGroupFile } = groupDocument;

const MODULE_FILE = readFileSync(new URL("../docs/architecture/MOD-group-document.md", import.meta.url), "utf8");
// The module file's example of a group file: the ```text fence of its Data, without the fences.
const EXAMPLE = /```text\n([\s\S]*?)```/.exec(MODULE_FILE)?.[1] ?? "";
const PATH = "docs/groups/use-cases.md";

// The example as a fresh tree: no test shares one with another.
const example = () => parseGroupFile(PATH, EXAMPLE);

// A tree, or a group of it, as a person reads it: each group as { title, groups, members }, each member as its identifier.
const outline = (node) => ({
  groups: node.groups.map((group) => ({ title: group.title, ...outline(group) })),
  members: node.members.map((member) => member.id),
});
const group = (title, groups, members) => ({ title, groups, members });
const REVIEW = () => group("Review", [], ["UC-006", "UC-008"]);
const DERIVATION = () => group("Derivation", [], ["UC-005", "UC-007"]);

// Every identifier a tree holds, wherever it stands, in order.
const identifiers = (outlined) => [...outlined.members, ...outlined.groups.flatMap(identifiers)];

// ---------------------------------------------------------------- each kind of move

// TST-472230 · level: unit · module: MOD-group-document
// guards: UC-021
// given: the example group file — Review holding UC-006 and UC-008, Derivation holding UC-005 and UC-007
// input: applyMoves with create "Approval" at the top, then create "Details" in Review
// expect: both moves applied, none refused; the tree holds Review (now with the empty group Details), Derivation and the new empty group Approval at the top, each member where it stood
test("applyMoves — create puts a new, empty group at the top or inside a group", () => {
  assert.deepEqual(outline(example()), { groups: [REVIEW(), DERIVATION()], members: [] }, "known positive: the example is read");
  const moves = [{ op: "create", title: "Approval", in: [] }, { op: "create", title: "Details", in: ["Review"] }];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [group("Details", [], [])], ["UC-006", "UC-008"]), DERIVATION(), group("Approval", [], [])],
    members: [],
  });
  assert.deepEqual([result.applied, result.refused], [moves, []]);
  assert.equal(result.tree.kind, "use-cases");
});

// TST-472231 · level: unit · module: MOD-group-document
// guards: UC-021
// given: the example group file
// input: applyMoves with rename of the group Review to "Approval"
// expect: the move applied; the first group is titled Approval and holds UC-006 and UC-008 as before; Derivation is as it was
test("applyMoves — rename changes the title of a group and nothing else", () => {
  const moves = [{ op: "rename", group: ["Review"], title: "Approval" }];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), { groups: [group("Approval", [], ["UC-006", "UC-008"]), DERIVATION()], members: [] });
  assert.deepEqual([result.applied, result.refused], [moves, []]);
});

// TST-472232 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; REGROUPING LEAVES THE GROUPED FILE UNCHANGED; UC-021
// given: the example group file
// input: applyMoves with move of UC-007 into Review, then move of UC-006 to the top level
// expect: both applied; Review holds UC-008 then UC-007, Derivation holds UC-005, UC-006 stands at the top level; each of the four use cases stands exactly once in the tree, a moved one leaving no copy behind
test("applyMoves — move takes an item out of its place and puts it into a group or at the top level, once", () => {
  const moves = [{ op: "move", item: "UC-007", to: ["Review"] }, { op: "move", item: "UC-006", to: [] }];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [], ["UC-008", "UC-007"]), group("Derivation", [], ["UC-005"])],
    members: ["UC-006"],
  });
  assert.deepEqual(identifiers(outline(result.tree)).sort(), ["UC-005", "UC-006", "UC-007", "UC-008"]);
  assert.deepEqual([result.applied, result.refused], [moves, []]);
});

// TST-472233 · level: unit · module: MOD-group-document
// guards: UC-021
// given: the example group file
// input: applyMoves with move-group of Derivation into Review
// expect: the move applied; the top level holds Review only, and Review holds UC-006 and UC-008 and the group Derivation with UC-005 and UC-007
test("applyMoves — move-group moves a group with all it holds into another group", () => {
  const moves = [{ op: "move-group", group: ["Derivation"], to: ["Review"] }];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [DERIVATION()], ["UC-006", "UC-008"])],
    members: [],
  });
  assert.deepEqual([result.applied, result.refused], [moves, []]);
});

// TST-472234 · level: unit · module: MOD-group-document
// guards: REGROUPING LEAVES THE GROUPED FILE UNCHANGED; UC-021
// given: the example group file
// input: applyMoves with move of UC-005 and UC-007 into Review, then delete of Derivation, which is empty by then
// expect: all three applied; the top level holds Review only, with UC-006, UC-008, UC-005 and UC-007 — deleting a group deleted no item
test("applyMoves — delete removes an empty group, and no item", () => {
  const moves = [
    { op: "move", item: "UC-005", to: ["Review"] },
    { op: "move", item: "UC-007", to: ["Review"] },
    { op: "delete", group: ["Derivation"] },
  ];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), { groups: [group("Review", [], ["UC-006", "UC-008", "UC-005", "UC-007"])], members: [] });
  assert.deepEqual([result.applied, result.refused], [moves, []]);
});

// TST-472235 · level: unit · module: MOD-group-document
// guards: UC-021
// given: the example group file
// input: applyMoves with move-group of Derivation into Review, then lift of Review — its content moved up one level
// expect: both applied; Review is still there but empty; Derivation, with UC-005 and UC-007, stands at the top level again after it, and UC-006 and UC-008 stand at the top level — nothing was deleted
test("applyMoves — lift moves what a group holds up one level and leaves the group, now empty", () => {
  const moves = [{ op: "move-group", group: ["Derivation"], to: ["Review"] }, { op: "lift", group: ["Review"] }];
  const result = applyMoves(example(), moves);
  assert.deepEqual(outline(result.tree), {
    groups: [group("Review", [], []), DERIVATION()],
    members: ["UC-006", "UC-008"],
  });
  assert.deepEqual([result.applied, result.refused], [moves, []]);
});

// ---------------------------------------------------------------- each refusal, with its reason

// A move, and the reason it is refused with: each is applied alone to the example group file.
const REFUSALS = [
  // a move that would put an item of another kind into the tree
  ["an item of another kind — a module", { op: "move", item: "MOD-reader", to: ["Review"] }, "MOD-reader is a module, not a use case"],
  ["an item of another kind — a requirement", { op: "move", item: "A SAMPLE RULE", to: [] }, "A SAMPLE RULE is a requirement, not a use case"],
  ["an item that is no identifier", { op: "move", item: "Review", to: [] }, '"Review" is no identifier'],
  // a delete of a group that is not empty
  ["a group that is not empty", { op: "delete", group: ["Review"] }, 'the group "Review" is not empty; move what it holds out first'],
  // a group titled by an identifier — a use case's, a decision's or a requirement's name — or by nothing
  ["a group created with an identifier as its title", { op: "create", title: "UC-010", in: [] }, '"UC-010" is an identifier, and a group carries none'],
  ["a group renamed to an identifier", { op: "rename", group: ["Review"], title: "ARC-001" }, '"ARC-001" is an identifier, and a group carries none'],
  ["a group titled by a requirement's name", { op: "create", title: "A SAMPLE RULE", in: [] }, '"A SAMPLE RULE" is an identifier, and a group carries none'],
  ["a group without a title", { op: "create", title: "  ", in: [] }, "a group needs a title"],
  // a move that names a group that does not exist, whichever its kind and wherever the name stands
  ["create in a group that does not exist", { op: "create", title: "Details", in: ["Nowhere"] }, 'there is no group "Nowhere"'],
  ["rename of a group that does not exist", { op: "rename", group: ["Nowhere"], title: "Details" }, 'there is no group "Nowhere"'],
  ["move to a group that does not exist", { op: "move", item: "UC-007", to: ["Nowhere"] }, 'there is no group "Nowhere"'],
  ["move-group of a group that does not exist", { op: "move-group", group: ["Nowhere"], to: [] }, 'there is no group "Nowhere"'],
  ["move-group to a group that does not exist", { op: "move-group", group: ["Review"], to: ["Nowhere"] }, 'there is no group "Nowhere"'],
  ["delete of a group that does not exist", { op: "delete", group: ["Nowhere"] }, 'there is no group "Nowhere"'],
  ["lift of a group that does not exist", { op: "lift", group: ["Nowhere"] }, 'there is no group "Nowhere"'],
  ["a group named by a path that goes through no group", { op: "delete", group: ["Review", "Nowhere"] }, 'there is no group "Review / Nowhere"'],
  // a move that would lose what a group holds, and a move of no kind
  ["a group moved into itself", { op: "move-group", group: ["Review"], to: ["Review"] }, 'the group "Review" cannot be moved into itself or a group inside it'],
  ["a move of no kind", { op: "split", group: ["Review"] }, 'unknown change "split"'],
];

// TST-472236 · level: unit · module: MOD-group-document
// guards: A GROUP HOLDS ONE KIND OF ARTIFACT; A GROUP CARRIES NO IDENTIFIER; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-021
// given: the example group file, and each move of the table above applied alone: an item of another kind (a module, a requirement) or no identifier moved into the tree; a group that is not empty deleted; a group created with an identifier or a requirement's name as its title, renamed to an identifier, or created without a title; every kind of move that names a group that does not exist; a group moved into itself; a move of no kind
// input: applyMoves of each, to a fresh example tree
// expect: for each, nothing applied; the move refused with the reason the table gives; the tree as the example reads — and a group moved into a group inside it, once Details stands in Review, refused the same way
test("applyMoves — each refusal comes with its reason, and a refused move changes nothing", () => {
  for (const [label, move, reason] of REFUSALS) {
    const result = applyMoves(example(), [move]);
    assert.deepEqual([result.applied, result.refused], [[], [{ move, reason }]], label);
    assert.deepEqual(outline(result.tree), { groups: [REVIEW(), DERIVATION()], members: [] }, `${label}: the tree is as it was`);
  }
  const inside = [{ op: "create", title: "Details", in: ["Review"] }, { op: "move-group", group: ["Review"], to: ["Review", "Details"] }];
  const result = applyMoves(example(), inside);
  assert.deepEqual(result.applied, [inside[0]]);
  assert.deepEqual(result.refused, [{ move: inside[1], reason: 'the group "Review" cannot be moved into itself or a group inside it' }]);
});

// ---------------------------------------------------------------- the given tree

// Every object of a value frozen, so that a change to any of them throws.
const deepFreeze = (value) => {
  for (const inner of Object.values(value)) if (inner !== null && typeof inner === "object") deepFreeze(inner);
  return Object.freeze(value);
};

// TST-472237 · level: unit · module: MOD-group-document
// guards: REGROUPING LEAVES THE GROUPED FILE UNCHANGED; UC-021
// given: the example tree, frozen all through, and a copy of it; moves of every kind, one of them refused
// input: applyMoves of the moves to the frozen tree
// expect: no change to the tree it was given, which still equals its copy; the result is another tree, and a changed one
test("applyMoves — the tree it is given is not changed", () => {
  const given = deepFreeze(example());
  const before = structuredClone(given);
  const result = applyMoves(given, [
    { op: "create", title: "Approval", in: [] },
    { op: "rename", group: ["Review"], title: "Checking" },
    { op: "move", item: "UC-007", to: ["Approval"] },
    { op: "move-group", group: ["Derivation"], to: ["Approval"] },
    { op: "lift", group: ["Approval"] },
    { op: "delete", group: ["Checking"] },
    { op: "delete", group: ["Nowhere"] },
  ]);
  assert.deepEqual(given, before);
  assert.notEqual(result.tree, given);
  assert.notDeepEqual(outline(result.tree), outline(before), "known positive: the moves did change the tree they returned");
  assert.equal(result.refused.length, 2, "the delete of Checking, which still holds two use cases, and of Nowhere, are refused");
});
