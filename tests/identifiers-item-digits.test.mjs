// An item's identifier takes three or more digits (ITM-1090), as MOD-identifiers' accepted text states it (docs/architecture/MOD-identifiers.md:54, Data: "`ITM` | `ITM-<nnn>`, three or more digits | `ITM-202`")
// in the module's scheme (src/identifiers/scheme.mjs): the reading of item identifiers above ITM-999.
// Run: node --test tests/identifiers-item-digits.test.mjs
//
// Module: MOD-identifiers
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; THE NAME IS THE ID AND IT SURVIVES
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect); each pairs a known positive (a three-digit item, still read) with the case under test. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { identifiersIn, kindOfIdentifier, nextIdentifier } from "../src/identifiers/index.mjs";

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
