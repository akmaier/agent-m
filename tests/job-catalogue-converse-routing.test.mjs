// The prompt of `converse` hands a wish for new or changed behaviour of a product to `change-requirements`, never straight to an implementation, as
// SPEC.md states it: EVOLUTION ENTERS THROUGH THE SPECIFICATION ("… becomes a specification change first and a code change second") and AGILE IMPLEMENTATION
// STARTS FROM THE BACKLOG ("every implementation job implements one item of the product's backlog"); and UC-049 step 3, "Agent M's rules for what it drafts".
// Run: node --test tests/job-catalogue-converse-routing.test.mjs
//
// Module: MOD-job-catalogue
// Guards: UC-049; EVOLUTION ENTERS THROUGH THE SPECIFICATION; AGILE IMPLEMENTATION STARTS FROM THE BACKLOG
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Counter-proof: on the prompt as it stood before this test,
// which offered `implement` for "changing code" without naming the backlog, the test fails.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const PROMPT = readFileSync(new URL("../src/job-catalogue/kinds/converse/prompt.md", import.meta.url), "utf8").replace(/\s+/g, " ");

// TST-2026111108 · level: unit · module: MOD-job-catalogue
// given: the prompt of `converse`
// input: none
// expect: it says that new or changed behaviour of a product is a change of its requirements first, handed to `change-requirements`; and that
//   `implement` and `fix-bug` work on an item of the backlog or an issue
test("TST-2026111108: converse hands new or changed behaviour to change-requirements, and an implementation only an item of the backlog", () => {
  assert.match(PROMPT, /new or changed behaviour of a product is a change of its requirements first[^.]*`change-requirements`/);
  assert.match(PROMPT, /`implement` and `fix-bug` work only on an item of the product's backlog or an issue/);
});
