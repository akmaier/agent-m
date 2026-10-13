// The classes of candidates (ITM-303) — MOD-documents' Candidate, Classified and classifyCandidates, as the accepted text of
// docs/architecture/MOD-documents.md states them under Interfaces: the candidates of one normalised key merged into one, naming
// every passage they came from; a candidate whose normalised key equals an existing artifact's a duplicate of it, decided by
// rule, whatever its participant proposed; every other candidate keeping the class its participant proposed. Keys are
// normalised by case, white space, quotation marks and dashes; the caller gives them.
// Run: node --test tests/documents-classify-candidates.test.mjs
//
// Module: MOD-documents
// Guards: UC-005; UC-019; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT; EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// Level: unit
//
// A requirement's key is its name and its rule — `keys: [name, rule]` —, as the module file says, and its rule decides (ITM-450): a
// candidate whose normalised rule equals an existing requirement's is a duplicate (EXACT DUPLICATES ARE FOUND WITHOUT A MODEL), and a name
// alone joins nothing; the key of another kind of artifact is the caller's to give, an architecture decision's being its title here. Each test states its input
// and its expected result before it runs (given / input / expect). Nothing is read from a file or from the network.

import test from "node:test";
import assert from "node:assert/strict";
import { classifyCandidates } from "../src/documents/index.mjs";

const NEW = { class: "new", of: null };
const candidate = (ref, keys, from, proposed = NEW) => ({ ref, keys, from, proposed });
const classified = (refs, from, cls, of, decidedBy) => ({ refs, from, class: cls, of, decidedBy });

// TST-472157 · level: unit · module: MOD-documents
// guards: CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES; A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
// given: three candidates of one run and no existing artifact: c1 and c2 state one requirement — one name, one rule — from two passages, "SRC-law, Art. 4" and "SRC-law, Art. 9"; c3 states another from "SRC-law, Art. 6"; each proposed new. Then three candidates c4, c6, c5 of one run, in that order: c4 and c5 have one name and two rules, c5 and c6 have one rule and two names, c4 and c6 nothing in common
// input: classifyCandidates([c1, c2, c3], []); classifyCandidates([c4, c6, c5], [])
// expect: two classes, in the order of the candidates: the first names c1 and c2 and both passages, new, of null, decided by the participant; the second names c3 alone, with its passage. For the other three, two classes: c4 alone, and c6 and c5 together with both their passages, since they state one rule — the name c4 and c5 share joins nothing
test("classifyCandidates — two candidates of one rule are merged into one, naming both passages; a name alone joins nothing", () => {
  const draft = [
    candidate("c1", ["EXPORT AS PDF", "The export is a PDF."], ["SRC-law, Art. 4"]),
    candidate("c2", ["EXPORT AS PDF", "The export is a PDF."], ["SRC-law, Art. 9"]),
    candidate("c3", ["PRINT TWICE", "Printing is repeated."], ["SRC-law, Art. 6"]),
  ];
  assert.deepEqual(classifyCandidates(draft, []), [
    classified(["c1", "c2"], ["SRC-law, Art. 4", "SRC-law, Art. 9"], "new", null, "participant"),
    classified(["c3"], ["SRC-law, Art. 6"], "new", null, "participant"),
  ]);

  const chain = [
    candidate("c4", ["SAVE ON EXIT", "Unsaved work is saved on exit."], ["SRC-law, Art. 1"]),
    candidate("c6", ["STORE WORK WHEN LEAVING", "Work is stored when the user leaves."], ["SRC-law, Art. 3"]),
    candidate("c5", ["SAVE ON EXIT", "Work is stored when the user leaves."], ["SRC-law, Art. 2"]),
  ];
  assert.deepEqual(classifyCandidates(chain, []), [
    classified(["c4"], ["SRC-law, Art. 1"], "new", null, "participant"),
    classified(["c6", "c5"], ["SRC-law, Art. 3", "SRC-law, Art. 2"], "new", null, "participant"),
  ]);
});

// TST-472158 · level: unit · module: MOD-documents
// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// given: three existing requirements — EXPORT AS PDF, PRINT TWICE and SAVE ON EXIT, each with its rule — and four candidates of one run: c1 and c4 with the name and the rule of EXPORT AS PDF, from two passages, c1 proposed new; c2 with the name of PRINT TWICE and another rule, proposed a change of it; c3 with another name and the rule of SAVE ON EXIT, proposed a conflict with it. Then an architecture decision, whose key is its title: ARC-012 exists, and a candidate with its title in other letters is proposed new
// input: classifyCandidates([c1, c2, c3, c4], the three requirements); classifyCandidates of the decision's candidate
// expect: three classes, each a duplicate decided by rule, whatever the participant proposed: of EXPORT AS PDF for c1 and c4 together, naming both passages — merged before they are compared with the existing —; c2, which takes the name of PRINT TWICE with another rule, no duplicate: it keeps the change of PRINT TWICE its participant proposed, decided by the participant; and a duplicate of SAVE ON EXIT for c3 — its rule equals, under another name —; for the decision, a duplicate of ARC-012 by rule
test("classifyCandidates — a candidate whose rule equals an existing artifact's is a duplicate of it by rule, whatever its participant proposed", () => {
  const existing = [
    { id: "EXPORT AS PDF", keys: ["EXPORT AS PDF", "The export is a PDF."] },
    { id: "PRINT TWICE", keys: ["PRINT TWICE", "Printing is repeated."] },
    { id: "SAVE ON EXIT", keys: ["SAVE ON EXIT", "Unsaved work is saved on exit."] },
  ];
  const draft = [
    candidate("c1", ["EXPORT AS PDF", "The export is a PDF."], ["SRC-law, Art. 4"]),
    candidate("c2", ["PRINT TWICE", "Printing happens two times."], ["SRC-law, Art. 6"], { class: "change", of: "PRINT TWICE" }),
    candidate("c3", ["STORE WORK WHEN LEAVING", "Unsaved work is saved on exit."], ["SRC-law, Art. 8"],
      { class: "conflict", of: "SAVE ON EXIT" }),
    candidate("c4", ["EXPORT AS PDF", "The export is a PDF."], ["SRC-law, Art. 9"]),
  ];
  assert.deepEqual(classifyCandidates(draft, existing), [
    classified(["c1", "c4"], ["SRC-law, Art. 4", "SRC-law, Art. 9"], "duplicate", "EXPORT AS PDF", "rule"),
    classified(["c2"], ["SRC-law, Art. 6"], "change", "PRINT TWICE", "participant"),
    classified(["c3"], ["SRC-law, Art. 8"], "duplicate", "SAVE ON EXIT", "rule"),
  ]);

  const decisions = [{ id: "ARC-012", keys: ["Keep the broker out of the browser"] }];
  assert.deepEqual(classifyCandidates([candidate("d1", ["keep the BROKER out of the browser"], ["UC-022, step 4"])], decisions),
    [classified(["d1"], ["UC-022, step 4"], "duplicate", "ARC-012", "rule")]);
});

// TST-472159 · level: unit · module: MOD-documents
// guards: EXACT DUPLICATES ARE FOUND WITHOUT A MODEL; CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
// given: pairs of names that differ only in case ("Export As PDF"), in white space (blanks, a tab, a line break), in quotation marks (a curly apostrophe, curly double quotes) or in dashes (an en dash, an em dash) from their plain forms; and, as a control, "EXPORT AS PDF" against "EXPORT AS A PDF", which differ by a word. A key is the name alone
// input: for each pair, classifyCandidates of the variant and the plain form as two candidates of one run, and of the variant as a candidate proposed new against the plain form as an existing artifact
// expect: for each of the six pairs, one class naming both candidates, and the variant a duplicate of the existing artifact by rule; for the control, two classes of their own, and the candidate kept as new, decided by the participant
test("classifyCandidates — keys that differ only in case, white space, quotation marks or dashes are one key", () => {
  const pairs = [
    ["case", "Export As PDF", "EXPORT AS PDF"],
    ["white space", "  EXPORT   AS\tPDF\n", "EXPORT AS PDF"],
    ["quotation marks", "THE READER’S RULE", "THE READER'S RULE"],
    ["double quotation marks", "“EXPORT” AS PDF", "\"EXPORT\" AS PDF"],
    ["an en dash", "READ–ONLY MODE", "READ-ONLY MODE"],
    ["an em dash", "READ—ONLY MODE", "READ-ONLY MODE"],
  ];
  for (const [label, variant, plain] of pairs) {
    const together = classifyCandidates([candidate("c1", [plain], ["p1"]), candidate("c2", [variant], ["p2"])], []);
    assert.deepEqual(together, [classified(["c1", "c2"], ["p1", "p2"], "new", null, "participant")], `${label}: merged`);
    const against = classifyCandidates([candidate("c1", [variant], ["p1"])], [{ id: "X-1", keys: [plain] }]);
    assert.deepEqual(against, [classified(["c1"], ["p1"], "duplicate", "X-1", "rule")], `${label}: a duplicate of the existing`);
  }
  const apart = classifyCandidates([candidate("c1", ["EXPORT AS PDF"], ["p1"]), candidate("c2", ["EXPORT AS A PDF"], ["p2"])],
    [{ id: "X-1", keys: ["EXPORT AS PDF"] }]);
  assert.deepEqual(apart, [classified(["c1"], ["p1"], "duplicate", "X-1", "rule"), classified(["c2"], ["p2"], "new", null, "participant")],
    "control: a key that differs by a word is another key");
});

// TST-472160 · level: unit · module: MOD-documents
// guards: A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
// given: the existing requirement EXPORT AS PDF, and four candidates whose keys equal none of its keys, proposed new, a change of EXPORT AS PDF, a duplicate of EXPORT AS PDF — the same obligation in other words, which only a model can tell — and a conflict with EXPORT AS PDF; the change's name differs from the existing name by a word, and the last two have no rule text, a blank value that is no key
// input: classifyCandidates of the four, with the existing requirement
// expect: four classes of their own, each with the class and the `of` its participant proposed — new of null, change, duplicate and conflict of EXPORT AS PDF — decided by the participant
test("classifyCandidates — every other candidate keeps the class its participant proposed", () => {
  const existing = [{ id: "EXPORT AS PDF", keys: ["EXPORT AS PDF", "The export is a PDF."] }];
  const draft = [
    candidate("c1", ["SHOW A PREVIEW", "A preview is shown before printing."], ["SRC-law, Art. 3"]),
    candidate("c2", ["EXPORT AS A PDF FILE", "The export is a PDF file."], ["SRC-law, Art. 5"], { class: "change", of: "EXPORT AS PDF" }),
    candidate("c3", ["CREATE A PDF", ""], ["SRC-law, Art. 7"], { class: "duplicate", of: "EXPORT AS PDF" }),
    candidate("c4", ["NO EXPORT", ""], ["SRC-law, Art. 11"], { class: "conflict", of: "EXPORT AS PDF" }),
  ];
  assert.deepEqual(classifyCandidates(draft, existing), [
    classified(["c1"], ["SRC-law, Art. 3"], "new", null, "participant"),
    classified(["c2"], ["SRC-law, Art. 5"], "change", "EXPORT AS PDF", "participant"),
    classified(["c3"], ["SRC-law, Art. 7"], "duplicate", "EXPORT AS PDF", "participant"),
    classified(["c4"], ["SRC-law, Art. 11"], "conflict", "EXPORT AS PDF", "participant"),
  ]);
});
