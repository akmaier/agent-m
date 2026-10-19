// An item's identifier takes three or more digits (ITM-1090), as MOD-identifiers' accepted text states it (docs/architecture/MOD-identifiers.md:54, Data: "`ITM` | `ITM-<nnn>`, three or more digits | `ITM-202`")
// in the readers of the module: the scheme (src/identifiers/scheme.mjs) and `docs/assets/artifacts/identity.mjs`, which the module takes over (:39). The reading of item identifiers above ITM-999.
// Run: node --test tests/identifiers-item-digits.test.mjs
//
// Module: MOD-identifiers
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; THE NAME IS THE ID AND IT SURVIVES
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); each pairs a known positive (a three-digit item, still read) with the case under test. Where the text leaves a reading open
// the test states the one it takes: the items `identifiers` lists are ordered by their number, not by the text of their path (as MOD-work-plans' reader orders them since ITM-1000). The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { identifiersIn, kindOfIdentifier, nextIdentifier } from "../src/identifiers/index.mjs";
import { identifierKind, identifiers } from "../docs/assets/artifacts/identity.mjs";

// TST-1090101 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: ITM-202 (the table's own example), ITM-100 and ITM-999 (three digits), ITM-1000 and ITM-12345 (four and five); then ITM-99, ITM-1 and ITM-1000a, which are none
// input: kindOfIdentifier of each
// expect: "ITM" for the first five; null for ITM-99, ITM-1 and ITM-1000a; and, unchanged beside them, null for ARC-1000 (ARC takes exactly three digits)
test("kindOfIdentifier — an item takes three or more digits", () => {
  for (const id of ["ITM-202", "ITM-100", "ITM-999", "ITM-1000", "ITM-12345"]) assert.equal(kindOfIdentifier(id), "ITM", id);
  for (const id of ["ITM-99", "ITM-1", "ITM-1000a"]) assert.equal(kindOfIdentifier(id), null, id);
  assert.equal(kindOfIdentifier("ARC-1000"), null);
});

// TST-1090102 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: a text that writes ITM-999 on line 1, ITM-1000 on line 2, ITM-99 on line 3, and the file name ITM-1000-x.md on line 4
// input: identifiersIn("docs/example.md", the text)
// expect: places for ITM-999 (line 1) and ITM-1000 (line 2), both of kind ITM; none for ITM-99 and none for the file name, whose run is another string
test("identifiersIn — an item above ITM-999 is found in a text", () => {
  const places = identifiersIn("docs/example.md", "ITM-999 first\nthen ITM-1000\nnot ITM-99\nsee ITM-1000-x.md\n");
  assert.deepEqual(places.map(({ id, kind, line }) => [id, kind, line]), [["ITM-999", "ITM", 1], ["ITM-1000", "ITM", 2]]);
});

// TST-1090103 · level: unit · module: MOD-identifiers
// guards: THE NAME IS THE ID AND IT SURVIVES
// given: histories whose highest item is ITM-999; ITM-999 and ITM-1000 (as text, ITM-999 is above ITM-1000); and ITM-451
// input: nextIdentifier("ITM", history)
// expect: ITM-1000; ITM-1001 (the numbers compared as numbers); ITM-452 (known positive, unchanged)
test("nextIdentifier — an item after ITM-999 is ITM-1000, the numbers compared as numbers", () => {
  assert.equal(nextIdentifier("ITM", ["ITM-001", "ITM-999"]), "ITM-1000");
  assert.equal(nextIdentifier("ITM", ["ITM-999", "ITM-1000"]), "ITM-1001");
  assert.equal(nextIdentifier("ITM", ["ITM-451"]), "ITM-452");
});

// TST-1090104 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: ITM-100, ITM-999, ITM-1000 and ITM-12345; then ITM-99 and ARC-1000
// input: identifierKind of each (identity.mjs)
// expect: "backlog-item" for the first four; null for ITM-99 and for ARC-1000
test("identity.mjs identifierKind — an item takes three or more digits", () => {
  for (const id of ["ITM-100", "ITM-999", "ITM-1000", "ITM-12345"]) assert.equal(identifierKind(id), "backlog-item", id);
  assert.equal(identifierKind("ITM-99"), null);
  assert.equal(identifierKind("ITM-1000"), "backlog-item");
  assert.equal(identifierKind("ARC-1000"), null);
});

// TST-1090105 · level: unit · module: MOD-identifiers
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; THE NAME IS THE ID AND IT SURVIVES
// given: a version of a repository with the backlog files ITM-1000-x.md (front matter id ITM-1000), ITM-999-y.md, ITM-100-z.md and ITM-12345-v.md, and the file ITM-99-w.md
// input: identifiers(files) of identity.mjs
// expect: four items, kind backlog-item, ordered by number — ITM-100, ITM-999, ITM-1000, ITM-12345 — and one problem, for ITM-99-w.md, "the file name carries no identifier"; none for the four
test("identity.mjs identifiers — a backlog file of four digits is an item, listed by number; ITM-99 is refused", () => {
  const files = {
    "docs/backlog/ITM-1000-x.md": "---\nid: ITM-1000\n---\n# x\n", "docs/backlog/ITM-999-y.md": "# y\n", "docs/backlog/ITM-100-z.md": "# z\n",
    "docs/backlog/ITM-12345-v.md": "# v\n", "docs/backlog/ITM-99-w.md": "# w\n",
  };
  const { items, problems } = identifiers(files);
  assert.deepEqual(items.map(({ id, kind }) => [id, kind]), [["ITM-100", "backlog-item"], ["ITM-999", "backlog-item"], ["ITM-1000", "backlog-item"], ["ITM-12345", "backlog-item"]]);
  assert.deepEqual(problems.map(({ artifact, what }) => [artifact, what]), [["docs/backlog/ITM-99-w.md", "the file name carries no identifier"]]);
});
