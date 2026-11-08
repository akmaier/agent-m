// The first place of a new item in a group file — MOD-group-document's placeItems and the Place it takes, as the accepted text of
// docs/architecture/MOD-group-document.md states them: "the tree with each item given its first place, in order, as a new tree; the one
// given is not changed. A new group is created in its group, unless a group of its title already stands there, which is then taken; it is
// made with the moves `create` and `move` of `applyMoves` … A place is not applied, with its reason, when its group, or the group a new
// group is to stand in, does not stand in the tree — `noGroup` is then true —, when a new group's title is an identifier, or when the tree
// already names the item, which keeps the place it has". For UC-006 step 6 and 5b, UC-021 3b.
// Run: node --test tests/group-document-place-items.test.mjs
//
// Module: MOD-group-document
// Guards: UC-006; UC-021; AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; A GROUP HOLDS ONE KIND OF ARTIFACT
// Level: unit
//
// The tree is a requirements group file stated in this file: the group "3. Requirements" holding EXPORT AS CSV and the group Export,
// which holds EXPORT AS PDF. A result is compared as a person reads it, without the lines (outline). Each test states its input and its
// expected result before it runs (given / input / expect); where a place is refused, the same call is first shown to apply on a known
// positive. The counter-proofs are recorded in the commit of the red tests.

import test from "node:test";
import assert from "node:assert/strict";
import * as groupDocument from "../src/group-document/index.mjs";

// A name the module does not provide is undefined here, so that each test fails by itself, not the whole file at once.
const { placeItems, parseGroupFile, groupFileText } = groupDocument;

const PATH = "docs/groups/requirements.md";
const FILE = [
  "# Requirements — groups", "", "The hierarchy of the requirements, each member by its name.", "",
  "- 3. Requirements", "  - EXPORT AS CSV", "  - Export", "    - EXPORT AS PDF", "",
].join("\n");
const tree = () => parseGroupFile(PATH, FILE);
const outline = (node) => ({
  groups: node.groups.map((group) => ({ title: group.title, ...outline(group) })),
  members: node.members.map((member) => member.id),
});
const group = (title, groups, members) => ({ title, groups, members });
const AS_READ = () => ({ groups: [group("3. Requirements", [group("Export", [], ["EXPORT AS PDF"])], ["EXPORT AS CSV"])], members: [] });
const place = (path, title = null) => ({ group: path, new: title });

// TST-2026110871 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-006
// given: the group file stated above — "3. Requirements" holding EXPORT AS CSV and the group Export with EXPORT AS PDF
// input: placeItems with EXPORT HAS A TITLE PAGE in ["3. Requirements", "Export"], A RULE AT THE TOP at the top level ([]), and A CANDIDATE NAMES ITS PLACE in a new group "Derivation" standing in ["3. Requirements"]
// expect: all three placed, in order, none not applied; Export holds EXPORT AS PDF then EXPORT HAS A TITLE PAGE, the top level holds A RULE AT THE TOP, "3. Requirements" holds a new group Derivation with A CANDIDATE NAMES ITS PLACE after Export; every item already in the file stands where it stood; the tree given is unchanged
test("TST-2026110871: placeItems gives each new item its first place — in a group, at the top level, or in a new group", () => {
  assert.equal(typeof placeItems, "function", "MOD-group-document provides placeItems");
  const given = tree(), before = JSON.stringify(given);
  const places = [
    { item: "EXPORT HAS A TITLE PAGE", place: place(["3. Requirements", "Export"]) },
    { item: "A RULE AT THE TOP", place: place([]) },
    { item: "A CANDIDATE NAMES ITS PLACE", place: place(["3. Requirements"], "Derivation") },
  ];
  const result = placeItems(given, places);
  assert.deepEqual(outline(result.tree), {
    groups: [group("3. Requirements", [group("Export", [], ["EXPORT AS PDF", "EXPORT HAS A TITLE PAGE"]), group("Derivation", [], ["A CANDIDATE NAMES ITS PLACE"])], ["EXPORT AS CSV"])],
    members: ["A RULE AT THE TOP"],
  });
  assert.deepEqual(result.placed, places);
  assert.deepEqual(result.notApplied, []);
  assert.equal(JSON.stringify(given), before, "the tree given is not changed");
  assert.equal(result.tree.kind, "requirements");
});

// TST-2026110872 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; UC-006
// given: the group file stated above, whose "3. Requirements" already holds a group Export
// input: placeItems with A FIRST NEW RULE in a new group "Export" standing in ["3. Requirements"], then A SECOND NEW RULE in a new group "Derivation" there, then A THIRD NEW RULE in a new group "Derivation" there again
// expect: all placed; no second Export is made — the one standing there is taken and holds EXPORT AS PDF then A FIRST NEW RULE —; one group Derivation is made and holds A SECOND NEW RULE then A THIRD NEW RULE
test("TST-2026110872: a new group whose title already stands in its group takes that group, and is made once", () => {
  const result = placeItems(tree(), [
    { item: "A FIRST NEW RULE", place: place(["3. Requirements"], "Export") },
    { item: "A SECOND NEW RULE", place: place(["3. Requirements"], "Derivation") },
    { item: "A THIRD NEW RULE", place: place(["3. Requirements"], "Derivation") },
  ]);
  assert.deepEqual(outline(result.tree), {
    groups: [group("3. Requirements", [group("Export", [], ["EXPORT AS PDF", "A FIRST NEW RULE"]), group("Derivation", [], ["A SECOND NEW RULE", "A THIRD NEW RULE"])], ["EXPORT AS CSV"])],
    members: [],
  });
  assert.equal(result.placed.length, 3);
  assert.deepEqual(result.notApplied, []);
});

// TST-2026110873 · level: unit · module: MOD-group-document
// guards: AN ITEM HAS ONE PLACE IN ITS HIERARCHY; A GROUP CARRIES NO IDENTIFIER; UC-006
// given: the group file stated above; known positive: A NEW RULE placed in ["3. Requirements"] is applied
// input: placeItems with A NEW RULE in ["Formats"], which the tree does not hold; A SECOND RULE in a new group "Derivation" standing in ["Formats"]; A THIRD RULE in a new group "UC-007"; EXPORT AS PDF, which the file names, in ["3. Requirements"]; then A FOURTH RULE in ["3. Requirements"]
// expect: the first four not applied, each with its reason — `there is no group "Formats"` twice, with noGroup true; `"UC-007" is an identifier, and a group carries none` with noGroup false; that the file names EXPORT AS PDF already, with noGroup false —; A FOURTH RULE placed; EXPORT AS PDF keeps its place in Export, no group UC-007 or Derivation is made, and nothing else of the tree changes
test("TST-2026110873: a place whose group is not in the tree, a new group titled by an identifier, and an item the file names already are not applied", () => {
  const positive = placeItems(tree(), [{ item: "A NEW RULE", place: place(["3. Requirements"]) }]);
  assert.deepEqual([positive.placed.length, positive.notApplied], [1, []], "known positive: a place in a group the tree holds is applied");
  const refused = [
    { item: "A NEW RULE", place: place(["Formats"]) },
    { item: "A SECOND RULE", place: place(["Formats"], "Derivation") },
    { item: "A THIRD RULE", place: place([], "UC-007") },
    { item: "EXPORT AS PDF", place: place(["3. Requirements"]) },
  ];
  const fourth = { item: "A FOURTH RULE", place: place(["3. Requirements"]) };
  const result = placeItems(tree(), [...refused, fourth]);
  assert.deepEqual(result.notApplied.map(({ item, place: where, noGroup }) => ({ item, place: where, noGroup })), refused.map((each, at) => ({ ...each, noGroup: at < 2 })));
  assert.deepEqual(result.notApplied.slice(0, 3).map((each) => each.reason), ['there is no group "Formats"', 'there is no group "Formats"', '"UC-007" is an identifier, and a group carries none']);
  assert.match(result.notApplied[3].reason, /EXPORT AS PDF/);
  assert.match(result.notApplied[3].reason, /already/);
  assert.deepEqual(result.placed, [fourth]);
  const expected = AS_READ();
  expected.groups[0].members.push("A FOURTH RULE");
  assert.deepEqual(outline(result.tree), expected);
});

// TST-2026110874 · level: unit · module: MOD-group-document
// guards: A GROUP HOLDS ONE KIND OF ARTIFACT; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN; UC-006
// given: the empty tree of requirements, as parseGroupFile reads a product without docs/groups/requirements.md; known positive: a requirement placed at the top level of it is applied
// input: placeItems with A FIRST RULE in a new group "Export" at the top level and UC-007, a use case, in ["Export"]; then groupFileText of the result
// expect: A FIRST RULE placed; UC-007 not applied with the reason applyMoves gives a move of it, "UC-007 is a use case, not a requirement", and noGroup false; the file written is the title line, the line below it and the list "- Export" holding "  - A FIRST RULE"
test("TST-2026110874: on the empty tree a first place makes the group file, and an item of another kind is refused as a move of it is", () => {
  const empty = parseGroupFile(PATH, "");
  assert.equal(placeItems(empty, [{ item: "A RULE", place: place([]) }]).placed.length, 1, "known positive: a requirement is placed at the top of the empty tree");
  const result = placeItems(empty, [{ item: "A FIRST RULE", place: place([], "Export") }, { item: "UC-007", place: place(["Export"]) }]);
  assert.deepEqual(result.placed, [{ item: "A FIRST RULE", place: place([], "Export") }]);
  assert.deepEqual(result.notApplied, [{ item: "UC-007", place: place(["Export"]), reason: "UC-007 is a use case, not a requirement", noGroup: false }]);
  assert.equal(groupFileText(result.tree), "# Requirements — groups\n\nThe hierarchy of the requirements, each member by its name.\n\n- Export\n  - A FIRST RULE\n");
});
