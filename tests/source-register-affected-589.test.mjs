// The requirements a source affects and the passages that changed (ITM-589) — MOD-source-register's affectedRequirements and
// changedPassages, as the accepted text of docs/architecture/MOD-source-register.md states them: `affectedRequirements(spec, source)`
// gives the names of the requirements one of whose source items names the source, read with MOD-spec-document, and
// `changedPassages(before, after)` the passages that changed between two versions of a text, line by line. The sprint record's readings:
// `source` is a register entry's identifier; an item names it when it begins with that identifier, followed by the item's end or by
// `, ` and the part — the grammar sourceFindings reads —; the requirements stand in the SPEC's order; changedPassages is MOD-text-tools'
// lineDiff without its `same` lines.
// Run: node --test tests/source-register-affected-589.test.mjs
//
// Module: MOD-source-register
// Guards: UC-015; UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// Level: unit
//
// The fixtures are small and ours: a SPEC of ten requirements whose source items are written here, and pairs of texts. A name the
// module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once. The expected
// results are stated in each test's own text, never read from a document. Each test states its input and its expected result before
// it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { parseSpec } from "../src/spec-document/index.mjs";
import * as sourceRegister from "../src/source-register/index.mjs";

const { affectedRequirements, changedPassages, sourceFindings, sourceSchemas } = sourceRegister;

// ---------------------------------------------------------------- the SPEC

const text = (...lines) => `${lines.join("\n")}\n`;
const head = (name, source) => (source === null ? `**${name}**` : `**${name}** *(${source})*`);
const requirement = ([name, source]) => [head(name, source), "A rule that is one statement.", "*Check:* `tests/a.test.mjs`", ""];

// In the SPEC's order, which is deliberately not the alphabetical one.
const REQUIREMENTS = [
  ["ZEBRA NAMES IT WITH A PART", "SRC-x, Art. 13"],
  ["MANGO NAMES IT ALONE", "SRC-x"],
  ["APPLE NAMES ANOTHER ENTRY WHOSE IDENTIFIER BEGINS LIKE IT", "SRC-xy, Art. 1"],
  ["NECTARINE HAS NO COMMA AFTER THE IDENTIFIER", "SRC-x Art. 2"],
  ["KIWI NAMES IT AS ITS SECOND ITEM", "Product Owner; SRC-x, Art. 4"],
  ["BANANA NAMES NO SOURCE", null],
  ["CHERRY NAMES ANOTHER ENTRY", "SRC-y, Art. 5"],
  ["FIG NAMES THE BOOK BY ITS TITLE", "Vibe Coding, ch. 9"],
  ["DATE NAMES THE BOOK BY ITS IDENTIFIER", "SRC-vibe-coding, ch. 9"],
  ["LEMON HAS IT AS A SUFFIX ONLY", "Annex SRC-x, Art. 6"],
];
const SPEC = text("# Fixture product — Specification", "", "## Section", "", ...REQUIREMENTS.flatMap(requirement));

// ---------------------------------------------------------------- affectedRequirements

// TST-589001 · level: unit · module: MOD-source-register
// guards: UC-015; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the SPEC above, whose requirements name SRC-x as `SRC-x, Art. 13`, as `SRC-x` alone and as the second of two items, `Product Owner; SRC-x, Art. 4`, in the order ZEBRA, MANGO, KIWI
// input: affectedRequirements of the SPEC and "SRC-x"
// expect: ["ZEBRA NAMES IT WITH A PART", "MANGO NAMES IT ALONE", "KIWI NAMES IT AS ITS SECOND ITEM"] — those three, in the SPEC's order, which is neither alphabetical nor sorted
test("affectedRequirements — the requirements one of whose items begins with the identifier and ends there or at `, `, in the SPEC's order", () => {
  assert.deepEqual(affectedRequirements(SPEC, "SRC-x"), [
    "ZEBRA NAMES IT WITH A PART",
    "MANGO NAMES IT ALONE",
    "KIWI NAMES IT AS ITS SECOND ITEM",
  ]);
});

// TST-589002 · level: unit · module: MOD-source-register
// guards: UC-015; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the SPEC above, with APPLE (`SRC-xy, Art. 1`), NECTARINE (`SRC-x Art. 2`, no comma), LEMON (`Annex SRC-x, Art. 6`, the identifier not at the beginning) and CHERRY (`SRC-y, Art. 5`); the known positive is test TST-589001, where the same call names the three requirements that do
// input: affectedRequirements of the SPEC and "SRC-x"; and of the SPEC and "SRC-xy", "SRC-y"
// expect: none of APPLE, NECTARINE, LEMON, CHERRY for "SRC-x"; ["APPLE NAMES ANOTHER ENTRY WHOSE IDENTIFIER BEGINS LIKE IT"] for "SRC-xy" and ["CHERRY NAMES ANOTHER ENTRY"] for "SRC-y"
test("affectedRequirements — an item that begins like the identifier but is not followed by the end or `, ` does not name it", () => {
  const found = affectedRequirements(SPEC, "SRC-x");
  assert.equal(found.length, 3, "known positive: the same call finds the three that name SRC-x");
  for (const left of ["APPLE", "NECTARINE", "LEMON", "CHERRY"]) {
    assert.equal(found.some((name) => name.startsWith(left)), false, `${left} does not name SRC-x`);
  }

  assert.deepEqual(affectedRequirements(SPEC, "SRC-xy"), ["APPLE NAMES ANOTHER ENTRY WHOSE IDENTIFIER BEGINS LIKE IT"]);
  assert.deepEqual(affectedRequirements(SPEC, "SRC-y"), ["CHERRY NAMES ANOTHER ENTRY"]);
});

// TST-589003 · level: unit · module: MOD-source-register
// guards: UC-015; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the SPEC above, whose FIG item is `Vibe Coding, ch. 9` — the title of the book's entry — and whose DATE item is `SRC-vibe-coding, ch. 9` — its identifier —; the signature carries no register entry
// input: affectedRequirements of the SPEC and "SRC-vibe-coding"
// expect: ["DATE NAMES THE BOOK BY ITS IDENTIFIER"] — FIG, whose item begins with the entry's title, is not among them
test("affectedRequirements — a title is not matched for an identifier, since the signature carries no register entry", () => {
  assert.deepEqual(affectedRequirements(SPEC, "SRC-vibe-coding"), ["DATE NAMES THE BOOK BY ITS IDENTIFIER"]);
});

// TST-589004 · level: unit · module: MOD-source-register
// guards: UC-015; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the SPEC above, which no requirement names "SRC-none" in; a text with no requirement; an empty text
// input: affectedRequirements of the SPEC and "SRC-none"; of the text and "SRC-x"; of "" and "SRC-x"
// expect: [] for each — a source no requirement names, a text without requirements and an empty text give an empty list
test("affectedRequirements — an unnamed source, a text without requirements and an empty text give an empty list", () => {
  assert.equal(affectedRequirements(SPEC, "SRC-x").length, 3, "known positive: the same SPEC gives three for SRC-x");

  assert.deepEqual(affectedRequirements(SPEC, "SRC-none"), []);
  assert.deepEqual(affectedRequirements("# A title\n\nOnly prose, SRC-x, Art. 1.\n", "SRC-x"), []);
  assert.deepEqual(affectedRequirements("", "SRC-x"), []);
});

// TST-589005 · level: unit · module: MOD-source-register
// guards: UC-015; A REQUIREMENT HAS A REGISTERED SOURCE
// given: the SPEC above; a register of one entry, SRC-x, and a links file that links it; so that sourceFindings reads each requirement's items against the entry the identifier names
// input: for each of the ten requirements, sourceFindings of it, the links and the register
// expect: a requirement has no finding exactly when affectedRequirements of the SPEC and "SRC-x" names it — the three of TST-589001 have none, and the other seven are reported — so the one grammar reads both
test("affectedRequirements — names exactly the requirements whose item sourceFindings reads as naming the entry", () => {
  const entry = readDocument(sourceSchemas().entry, "docs/sources/SRC-x.md", text("---", "id: SRC-x", "title: A fixture regulation",
    "kind: regulation", "authority: normative", "licence: may be republished — fixture", "---", "# SRC-x A fixture regulation", "", "A fixture source."));
  const links = readDocument(sourceSchemas().links, "docs/sources.md", text("# The sources this product meets", "",
    "| Source | Version | Hash | Part |", "|---|---|---|---|", `| SRC-x | 2026-10-05 | ${"0".repeat(64)} | |`));
  const named = new Set(affectedRequirements(SPEC, "SRC-x"));
  assert.equal(named.size, 3, "known positive: three requirements name SRC-x");

  for (const [name] of REQUIREMENTS) {
    const reported = sourceFindings([parseSpec(SPEC).requirements.get(name)], links, [entry]).length === 1;
    assert.equal(reported, !named.has(name), `${name}: reported by sourceFindings exactly when affectedRequirements does not name it`);
  }
});

// ---------------------------------------------------------------- changedPassages

const ADDED_FIRST = [
  { op: "added", text: "B", before: null, after: 2 },
  { op: "removed", text: "b", before: 2, after: null },
  { op: "added", text: "d", before: null, after: 4 },
];

// TST-589006 · level: unit · module: MOD-source-register
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the version before, the lines a, b, c, and the version after, the lines a, B, c, d
// input: changedPassages of the two texts
// expect: three passages, in order, with no `same` line: `B` added at line 2 of the text after, `b` removed from line 2 of the text before — an added line comes before the removed one where the change leaves the order open —, and `d` added at line 4 of the text after
test("changedPassages — the added and removed lines of two versions, each with its line, and no line that stayed the same", () => {
  assert.deepEqual(changedPassages("a\nb\nc\n", "a\nB\nc\nd\n"), ADDED_FIRST);
});

// TST-589007 · level: unit · module: MOD-source-register
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: two texts of the same lines; two texts that differ only in their line endings, LF in the one and CR LF in the other; two empty texts
// input: changedPassages of each pair; the known positive is TST-589006, where the same call finds three passages
// expect: [] for each pair — a text that did not change, or changed only its line endings, has no changed passage
test("changedPassages — texts that did not change, or changed only their line endings, give no passage", () => {
  assert.equal(changedPassages("a\nb\nc\n", "a\nB\nc\nd\n").length, 3, "known positive: a changed text gives its passages");

  assert.deepEqual(changedPassages("a\nb\nc\n", "a\nb\nc\n"), []);
  assert.deepEqual(changedPassages("a\nb\nc\n", "a\r\nb\r\nc\r\n"), []);
  assert.deepEqual(changedPassages("", ""), []);
});

// TST-589008 · level: unit · module: MOD-source-register
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: an empty text before and the lines x, y after; and the lines x, y before and an empty text after
// input: changedPassages of each pair
// expect: for the first, `x` added at line 1 and `y` added at line 2 of the text after; for the second, `x` removed from line 1 and `y` removed from line 2 of the text before
test("changedPassages — a text that appears or vanishes is all added or all removed", () => {
  assert.deepEqual(changedPassages("", "x\ny\n"), [
    { op: "added", text: "x", before: null, after: 1 },
    { op: "added", text: "y", before: null, after: 2 },
  ]);
  assert.deepEqual(changedPassages("x\ny\n", ""), [
    { op: "removed", text: "x", before: 1, after: null },
    { op: "removed", text: "y", before: 2, after: null },
  ]);
});

// TST-589009 · level: unit · module: MOD-source-register
// guards: UC-016; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: a text of eight lines, l1 to l8, and the same text with l3 changed to L3 and l7 removed, so that long runs of lines stay the same between the changes
// input: changedPassages of the two texts
// expect: three passages and no line from the runs that stayed: `L3` added at line 3 of the text after, `l3` removed from line 3 of the text before, `l7` removed from line 7 of the text before, in this order — and no `same` among them
test("changedPassages — the lines between two changes are left out", () => {
  const before = "l1\nl2\nl3\nl4\nl5\nl6\nl7\nl8\n";
  const after = "l1\nl2\nL3\nl4\nl5\nl6\nl8\n";

  assert.deepEqual(changedPassages(before, after), [
    { op: "added", text: "L3", before: null, after: 3 },
    { op: "removed", text: "l3", before: 3, after: null },
    { op: "removed", text: "l7", before: 7, after: null },
  ]);
});
