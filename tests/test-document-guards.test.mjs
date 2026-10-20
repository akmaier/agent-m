// A `guards` entry names a requirement or a use case and nothing else (ITM-649) — MOD-test-document's testFindings, as docs/architecture/MOD-test-document.md states it: "an error … under
// `A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION` for each `guards` entry that is neither a requirement's name nor a use case's identifier — a use case written with its step, such as
// `UC-005 (alternative flow 6a)`, is none —, naming the test and the entry, from the first declaration read: a header that writes such an entry fails it". And Data: `guards` is "the requirements
// it guards by name, or use cases by identifier, separated by `;`". A requirement's name is, by MOD-identifiers' scheme, a name in capitals, digits, spaces, apostrophes, commas and hyphens, with no
// lowercase letter and no prefix of another kind; a use case's identifier is `UC-<nnn>`, three or more digits.
// Run: node --test tests/test-document-guards.test.mjs
//
// Module: MOD-test-document
// Guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// Level: unit
//
// Each declaration read here stands in a fixture test file written out below and is read by testDeclarations, as the check that calls testFindings reads it. A finding is compared by the
// declaration it names, its line, its kind and the requirement it is reported under; its `what` is asked to name the entry, since the text says the finding names the test and the entry.
// Readings the text leaves open, which the tests state (the pull request names them): the finding is one error for each such entry, on the declaration's line, and `what` holds the entry as written.
// Each test states its input and its expected result before it runs; where a test expects no finding, the same reading is first shown to find one on a known positive. The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testDeclarations, testFindings } from "../src/test-document/index.mjs";

const RULE = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";
const PATH = "tests/sample.test.mjs";

// A fixture test file of one declaration whose `guards` line is `guards`.
const fixture = (guards, id = "TST-649001") => [
  `// ${id} · level: unit · module: MOD-test-document`,
  `// guards: ${guards}`,
  "// given: a header",
  "// input: it is read",
  "// expect: it is judged",
  'test("a case", () => {});',
  "",
].join("\n");

// The findings under the rule, of every declaration of a fixture.
const underRule = (guards, id) => testDeclarations(PATH, fixture(guards, id)).flatMap((declaration) => testFindings(declaration)).filter((found) => found.rule === RULE);

// TST-649001 · level: unit · module: MOD-test-document
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: a test whose guards line writes a use case with its step, UC-005 (alternative flow 6a)
// input: testFindings of its declaration
// expect: one error under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION, naming the test TST-649001 and the entry as written, on the declaration's first line
test("testFindings — a use case written with its step is an error under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION, naming the test and the entry", () => {
  const found = underRule("UC-005 (alternative flow 6a)");
  assert.equal(found.length, 1);
  assert.equal(found[0].artifact, "TST-649001");
  assert.equal(found[0].kind, "error");
  assert.equal(found[0].line, 1);
  assert.ok(found[0].what.includes("UC-005 (alternative flow 6a)"), `the finding names the entry: ${found[0].what}`);
});

// TST-649002 · level: unit · module: MOD-test-document
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: a test whose guards line holds a requirement's name, a bare use case, a requirement name with digits, apostrophes, commas and hyphens, and a use case with three digits more
// input: testFindings of its declaration, after the known positive of TST-649001
// expect: no finding under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION (the counter-proof of the finding above)
test("testFindings — a bare use case and a requirement's name give no finding under the rule", () => {
  assert.equal(underRule("UC-005 (alternative flow 6a)").length, 1, "known positive: the step is found");
  assert.deepEqual(underRule("A LOAN HAS A DUE DATE; UC-005; A MEMBER'S 2ND CARD, IF ANY, IS ONE-OF-A-KIND; UC-0057"), []);
  assert.deepEqual(underRule("UC-005"), []);
});

// TST-649003 · level: unit · module: MOD-test-document
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: a guards line of three entries: a requirement's name, a use case with its step, and a bare use case
// input: testFindings of its declaration
// expect: exactly one finding, for the middle entry, and it does not name the others
test("testFindings — each entry is judged by itself: only the one that is none is named", () => {
  const found = underRule("A LOAN HAS A DUE DATE; UC-005 (alternative flow 6a); UC-006");
  assert.equal(found.length, 1);
  assert.ok(found[0].what.includes("UC-005 (alternative flow 6a)"));
  assert.ok(!found[0].what.includes("A LOAN HAS A DUE DATE") && !found[0].what.includes("UC-006"), "it names the one entry only");
});

// TST-649004 · level: unit · module: MOD-test-document
// guards: A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
// given: guards lines that write an identifier of another kind (an architecture decision ARC-001, a module MOD-prompt-bar, a backlog item ITM-649), a requirement name with a lowercase letter, a use case with fewer than three digits, and free words
// input: testFindings of each
// expect: one finding each — an entry is a requirement's name or a use case's identifier, and nothing else
test("testFindings — an identifier of another kind, a name with a lowercase letter, a short use-case number and free words are each an entry that is none", () => {
  for (const entry of ["ARC-001", "MOD-prompt-bar", "ITM-649", "A loan has a due date", "UC-5", "the whole page"]) {
    assert.equal(underRule(entry).length, 1, `${entry} is an entry that is none`);
  }
});
