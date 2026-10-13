// A requirement's rule decides its duplicates, not its name (ITM-450) — MOD-documents' classifyCandidates, as the accepted texts ask: "an exact
// duplicate restates an existing requirement — its normalised rule equals the existing one's" (EXACT DUPLICATES ARE FOUND WITHOUT A MODEL); "a candidate
// under an existing name with another rule is no duplicate, and keeps the class its participant proposed, a change" (A CHANGE IS PROPOSED UNDER THE
// EXISTING NAME); "candidates of one run are merged when they state the same rule" (CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES). A requirement's key is
// its name and its rule, as Candidate states it: its rule decides, and its name alone joins nothing. A key of one field — the title of a use case, a
// decision or an item, the identifier of a module — is decided by that field.
// Run: node --test tests/documents-rule-decides.test.mjs
//
// Module: MOD-documents
// Guards: UC-005; UC-019; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES; A CHANGE IS PROPOSED UNDER THE EXISTING NAME
// Level: unit
//
// The example data are those of the use cases: UC-019's own findings name the requirement EXPORT IS A PDF ("restates the existing requirement word for
// word but is classed new") and the unknown name EXPORT AS PDF; the rule "A report can be exported as a PDF file." and the second requirement A REPORT HAS A
// TITLE with "Every report shows a title." are those of the product of UC-007's example, which this repository's tests of UC-019 use. Where the file leaves a
// reading open, the test states the one it takes, and the pull request names it:
//   - The value that decides is the last of a key's values: a requirement's rule, a one-field key's field.
//   - A blank deciding value names nothing and joins nothing.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { classifyCandidates } from "../src/documents/index.mjs";

const EXPORT = "EXPORT IS A PDF", EXPORT_RULE = "A report can be exported as a PDF file.";
const TITLE = "A REPORT HAS A TITLE", TITLE_RULE = "Every report shows a title.";
const existing = [{ id: EXPORT, keys: [EXPORT, EXPORT_RULE] }, { id: TITLE, keys: [TITLE, TITLE_RULE] }];
const candidate = (ref, keys, from, proposed = { class: "new", of: null }) => ({ ref, keys, from, proposed });
const classified = (refs, from, cls, of, decidedBy) => ({ refs, from, class: cls, of, decidedBy });

// guards: A CHANGE IS PROPOSED UNDER THE EXISTING NAME; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
// given: the requirements EXPORT IS A PDF and A REPORT HAS A TITLE; a candidate under the name A REPORT HAS A TITLE with the rule "Every report shows its title on the first page."
//        proposed a change of it
// input: classifyCandidates of it
// expect: one class, a change of A REPORT HAS A TITLE, decided by the participant — it is no duplicate by rule, its name alone joins nothing
test("classifyCandidates — a candidate under an existing name with another rule keeps its class, a change, and is no duplicate", () => {
  const draft = [candidate("c1", [TITLE, "Every report shows its title on the first page."], ["SRC-alice"], { class: "change", of: TITLE })];
  assert.deepEqual(classifyCandidates(draft, existing), [classified(["c1"], ["SRC-alice"], "change", TITLE, "participant")]);
  assert.equal(classifyCandidates(draft, existing)[0].class === "duplicate", false);
});

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; UC-019 (step 5)
// given: the same requirements; a candidate under the new name EXPORT AS A PDF with the rule of EXPORT IS A PDF, proposed new; another under the name of A REPORT HAS A TITLE
//        with its rule in other letters, white space and quotation marks, proposed a conflict
// input: classifyCandidates of both
// expect: a duplicate of EXPORT IS A PDF by rule for the first, a duplicate of A REPORT HAS A TITLE by rule for the second, whatever each participant proposed
test("classifyCandidates — a candidate whose normalised rule equals an existing requirement's is a duplicate of it, under another name too", () => {
  const draft = [
    candidate("c1", ["EXPORT AS A PDF", EXPORT_RULE], ["SRC-alice, p. 1"]),
    candidate("c2", [TITLE, "  EVERY   report  shows a TITLE.  "], ["SRC-alice, p. 2"], { class: "conflict", of: TITLE }),
  ];
  assert.deepEqual(classifyCandidates(draft, existing), [
    classified(["c1"], ["SRC-alice, p. 1"], "duplicate", EXPORT, "rule"),
    classified(["c2"], ["SRC-alice, p. 2"], "duplicate", TITLE, "rule"),
  ]);
});

// guards: CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// given: no existing requirement; two candidates of one name with different rules; and two candidates that state one rule under two names, from two passages
// input: classifyCandidates of each pair
// expect: the first pair two classes of their own, each with its passage; the second one class naming both candidates and both passages, new, decided by the participant
test("classifyCandidates — two candidates of one name with different rules stay two classes, and two that state one rule are merged", () => {
  const named = [
    candidate("c1", [EXPORT, "A report can be exported as a PDF file."], ["SRC-alice, p. 1"]),
    candidate("c2", [EXPORT, "A report can be exported as a CSV file."], ["SRC-alice, p. 2"]),
  ];
  assert.deepEqual(classifyCandidates(named, []), [
    classified(["c1"], ["SRC-alice, p. 1"], "new", null, "participant"),
    classified(["c2"], ["SRC-alice, p. 2"], "new", null, "participant"),
  ]);
  const ruled = [
    candidate("c3", ["EXPORT AS A PDF", EXPORT_RULE], ["SRC-alice, p. 3"]),
    candidate("c4", ["A REPORT IS EXPORTED AS A PDF", EXPORT_RULE], ["SRC-alice, p. 4"]),
  ];
  assert.deepEqual(classifyCandidates(ruled, []), [classified(["c3", "c4"], ["SRC-alice, p. 3", "SRC-alice, p. 4"], "new", null, "participant")]);
});

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// given: keys of one field — a title: the existing use case "Export a report as a PDF"; two candidates of it in other letters and one with another title; a
//        module identifier MOD-documents as the existing key and a candidate with the same identifier
// input: classifyCandidates of each
// expect: a key of one field is decided by that field: the two candidates in other letters are merged and are a duplicate of the existing use case by rule; the other title is its own
//         class, new; the module identifier is a duplicate of the existing one
test("classifyCandidates — a key of one field is decided by that field, as before", () => {
  const cases = [{ id: "UC-007", keys: ["Export a report as a PDF"] }];
  const draft = [
    candidate("u1", ["export a REPORT as a pdf"], ["SRC-alice, p. 1"]),
    candidate("u2", ["Print a report"], ["SRC-alice, p. 2"]),
    candidate("u3", ["Export a report   as a PDF"], ["SRC-alice, p. 3"]),
  ];
  assert.deepEqual(classifyCandidates(draft, cases), [
    classified(["u1", "u3"], ["SRC-alice, p. 1", "SRC-alice, p. 3"], "duplicate", "UC-007", "rule"),
    classified(["u2"], ["SRC-alice, p. 2"], "new", null, "participant"),
  ]);
  assert.deepEqual(classifyCandidates([candidate("m1", ["MOD-documents"], ["ARC-012"])], [{ id: "MOD-documents", keys: ["MOD-documents"] }]),
    [classified(["m1"], ["ARC-012"], "duplicate", "MOD-documents", "rule")]);
});

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// given: an existing requirement and candidates whose rule is blank: two with different names, and one with the existing requirement's name
// input: classifyCandidates of them
// expect: a blank rule names nothing: three classes of their own, none a duplicate, each keeping what its participant proposed
test("classifyCandidates — a blank rule names nothing and joins nothing", () => {
  const draft = [
    candidate("b1", ["FIRST", ""], ["SRC-alice, p. 1"]),
    candidate("b2", ["SECOND", ""], ["SRC-alice, p. 2"]),
    candidate("b3", [EXPORT, ""], ["SRC-alice, p. 3"], { class: "change", of: EXPORT }),
  ];
  assert.deepEqual(classifyCandidates(draft, existing), [
    classified(["b1"], ["SRC-alice, p. 1"], "new", null, "participant"),
    classified(["b2"], ["SRC-alice, p. 2"], "new", null, "participant"),
    classified(["b3"], ["SRC-alice, p. 3"], "change", EXPORT, "participant"),
  ]);
});

// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
// given: two existing requirements that state one rule — EXPORT IS A PDF and, in an open entry, EXPORT AS A PDF — and a candidate that states it
// input: classifyCandidates of it
// expect: a duplicate of the first of them in the list, EXPORT IS A PDF, decided by rule
test("classifyCandidates — a rule that two existing requirements state is a duplicate of the first", () => {
  const both = [{ id: EXPORT, keys: [EXPORT, EXPORT_RULE] }, { id: "EXPORT AS A PDF", keys: ["EXPORT AS A PDF", EXPORT_RULE] }];
  assert.deepEqual(classifyCandidates([candidate("c1", ["A REPORT IS A PDF", EXPORT_RULE], ["SRC-alice"])], both), [classified(["c1"], ["SRC-alice"], "duplicate", EXPORT, "rule")]);
});
