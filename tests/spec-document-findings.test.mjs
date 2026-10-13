// The findings of a requirement (ITM-301) — MOD-spec-document's requirementFindings, as docs/architecture/MOD-spec-document.md
// states it: for each requirement of a Spec, an error under A REQUIREMENT HAS FOUR FIELDS when its source, rule or check is
// missing; an error under A REQUIREMENT NAMES ITS CHECK when its check names neither a test nor review; a warning under ONE
// STATEMENT PER REQUIREMENT when its rule contains "and" or "additionally"; an error under THE NAME IS THE ID AND IT SURVIVES
// for a name given twice; and an error under A DOCUMENT HOLDS NO HISTORY for each mark of history. Each finding names the
// requirement and its line. sectionText, replaceSection, requirementNamesIn and renamedRequirements are not part of ITM-301.
// Run: node --test tests/spec-document-findings.test.mjs
//
// Module: MOD-spec-document
// Guards: A REQUIREMENT HAS FOUR FIELDS; A REQUIREMENT NAMES ITS CHECK; ONE STATEMENT PER REQUIREMENT; THE NAME IS THE ID AND IT SURVIVES; A DOCUMENT HOLDS NO HISTORY; UC-005; UC-018; UC-019
// Level: unit
//
// Every text read here is a fixture SPEC written out below, read by parseSpec; no test opens Agent M's own SPEC.md (KEIN
// SPEC-ZUGRIFF AUS PRODUKT-CODE). The numbers beside a fixture are its lines. A finding is compared as
// `<requirement>:<line>: <kind> [<rule>]` — the requirement it names, the line of that requirement's head line, error or
// warning, and the requirement it is reported under — in the order of the lines, since the module file does not state the
// order in which requirementFindings lists them; its `what` and `fix` are not worded by the module file, so a test asks of
// them only what the Finding of MOD-text-tools asks: both say something, in one line. Each test names the requirement it
// guards and states its input and its expected result before it runs (given / input / expect); where a test expects
// something not to be found, the same reading is first shown to find it on a known positive. The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseSpec, requirementFindings } from "../src/spec-document/index.mjs";
import { finding } from "../src/text-tools/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

const FOUR_FIELDS = "A REQUIREMENT HAS FOUR FIELDS";
const NAMES_ITS_CHECK = "A REQUIREMENT NAMES ITS CHECK";
const ONE_STATEMENT = "ONE STATEMENT PER REQUIREMENT";
const NAME_SURVIVES = "THE NAME IS THE ID AND IT SURVIVES";
const NO_HISTORY = "A DOCUMENT HOLDS NO HISTORY";

// The findings of the SPEC `text`, in the order of their lines — on one line, in the order of their rules and their words.
function findingsOf(text) {
  return [...requirementFindings(parseSpec(text))]
    .sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule) || a.what.localeCompare(b.what));
}

// A finding as the tests compare it: the requirement it names, its line, error or warning, and the requirement it is reported under.
const summary = (f) => `${f.artifact}:${f.line}: ${f.kind} [${f.rule}]`;

// Each finding is a Finding as MOD-text-tools makes it — its six fields, a kind, a line from 1, a rule in capitals — and its
// `what` and `fix` each say something, in one line, as a compiler message does.
function assertWellFormed(findings) {
  for (const f of findings) {
    assert.deepEqual(finding(f), f, `${summary(f)} is a Finding`);
    for (const [part, text] of [["what", f.what], ["fix", f.fix]]) {
      assert.equal(typeof text, "string", `${summary(f)}: ${part} is a text`);
      assert.notEqual(text.trim(), "", `${summary(f)}: ${part} says something`);
      assert.doesNotMatch(text, /[\r\n]/, `${summary(f)}: ${part} is one line`);
    }
  }
}

// ---------------------------------------------------------------- a missing source, rule or check
//
// The numbers are the lines of FIELDS.

const FIELDS = lines(
  "## 1. Fields",                                                                                //  1
  "",                                                                                            //  2
  "**NO SOURCE**",                                                                               //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_no_source.py`",                                                          //  5
  "",                                                                                            //  6
  "**NO RULE** *(Product Owner)*",                                                               //  7
  "*Check:* `tests/test_no_rule.py`",                                                            //  8
  "",                                                                                            //  9
  "**NO CHECK** *(Product Owner)*",                                                              // 10
  "Its rule.",                                                                                   // 11
  "",                                                                                            // 12
  "**ALL FOUR** *(Product Owner)*",                                                              // 13
  "Its rule.",                                                                                   // 14
  "*Check:* `tests/test_all_four.py`",                                                           // 15
);

// TST-473047 · level: unit · module: MOD-spec-document
// guards: A REQUIREMENT HAS FOUR FIELDS; UC-005 (step 6, a candidate without one of the four fields); UC-018 (step 3, a missing field is marked)
// given: FIELDS — a requirement whose head line names no source, one without a rule, one without a check, and one with all four fields, which parseSpec reads with the missing field null
// input: requirementFindings(parseSpec(FIELDS))
// expect: exactly one finding for each of the three, an error under A REQUIREMENT HAS FOUR FIELDS that names the requirement and the line of its head line — NO SOURCE on line 3, NO RULE on line 7, NO CHECK on line 10 — and says which field is missing, source, rule and check; none for ALL FOUR
test("requirementFindings — a missing source, rule or check is an error under A REQUIREMENT HAS FOUR FIELDS, on the requirement's line", () => {
  const found = findingsOf(FIELDS);
  assert.deepEqual(found.map(summary), [
    `NO SOURCE:3: error [${FOUR_FIELDS}]`,
    `NO RULE:7: error [${FOUR_FIELDS}]`,
    `NO CHECK:10: error [${FOUR_FIELDS}]`,
  ]);
  assert.match(found[0].what, /source/i, "the first says that the source is missing");
  assert.match(found[1].what, /rule/i, "the second says that the rule is missing");
  assert.match(found[2].what, /check/i, "the third says that the check is missing");
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a check that names neither a test nor review
//
// The numbers are the lines of CHECKS.

const CHECKS = lines(
  "## 1. Checks",                                                                                //  1
  "",                                                                                            //  2
  "**A TEST** *(Product Owner)*",                                                                //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_a.py`",                                                                  //  5
  "",                                                                                            //  6
  "**SEVERAL TESTS** *(Product Owner)*",                                                         //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_b.py` · `tests/b.test.mjs` — what they do.",                             //  9
  "",                                                                                            // 10
  "**AT REVIEW** *(Product Owner)*",                                                             // 11
  "Its rule.",                                                                                   // 12
  "*Check:* no automatic check; at review.",                                                     // 13
  "",                                                                                            // 14
  "**NO WORDS** *(Product Owner)*",                                                              // 15
  "Its rule.",                                                                                   // 16
  "*Check:* none",                                                                               // 17
  "",                                                                                            // 18
  "**TO BE DECIDED** *(Product Owner)*",                                                         // 19
  "Its rule.",                                                                                   // 20
  "*Check:* to be decided",                                                                      // 21
  "",                                                                                            // 22
  "**NO FILE** *(Product Owner)*",                                                               // 23
  "Its rule.",                                                                                   // 24
  "*Check:* the export test",                                                                    // 25
  "",                                                                                            // 26
  "**THE WORD REVIEW** *(Product Owner)*",                                                       // 27
  "Its rule.",                                                                                   // 28
  "*Check:* see the review notes",                                                               // 29
);

// TST-473048 · level: unit · module: MOD-spec-document
// guards: A REQUIREMENT NAMES ITS CHECK; UC-005
// given: CHECKS — three requirements whose check names a test, names two tests and says what they do, and says that it is made at review; then four whose check names neither: the word "none", "to be decided", "the export test" — a test by words, not by its path —, and "see the review notes" — the word review, not that the check is made at review
// input: requirementFindings(parseSpec(CHECKS))
// expect: exactly one finding for each of the four, an error under A REQUIREMENT NAMES ITS CHECK that names the requirement and the line of its head line — NO WORDS on line 15, TO BE DECIDED on 19, NO FILE on 23, THE WORD REVIEW on 27 —; none for the first three, which show that the same reading finds a check that names a test or review and lets it pass
test("requirementFindings — a check that names neither a test nor review is an error under A REQUIREMENT NAMES ITS CHECK", () => {
  const found = findingsOf(CHECKS);
  assert.deepEqual(found.map(summary), [
    `NO WORDS:15: error [${NAMES_ITS_CHECK}]`,
    `TO BE DECIDED:19: error [${NAMES_ITS_CHECK}]`,
    `NO FILE:23: error [${NAMES_ITS_CHECK}]`,
    `THE WORD REVIEW:27: error [${NAMES_ITS_CHECK}]`,
  ]);
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a rule with "and" or "additionally"
//
// The numbers are the lines of RULES.

const RULES = lines(
  "## 1. Rules",                                                                                 //  1
  "",                                                                                            //  2
  "**AND IN THE RULE** *(Product Owner)*",                                                       //  3
  "The export of a report is a PDF file and is signed.",                                         //  4
  "*Check:* `tests/test_a.py`",                                                                  //  5
  "",                                                                                            //  6
  "**ADDITIONALLY IN THE RULE** *(Product Owner)*",                                              //  7
  "The export of a report is a PDF file; additionally it is signed.",                            //  8
  "*Check:* `tests/test_b.py`",                                                                  //  9
  "",                                                                                            // 10
  "**AND AT THE START OF THE RULE** *(Product Owner)*",                                          // 11
  "And the export of a report is a PDF file.",                                                   // 12
  "*Check:* `tests/test_c.py`",                                                                  // 13
  "",                                                                                            // 14
  "**AND ON THE SECOND LINE OF THE RULE** *(Product Owner)*",                                    // 15
  "The export of a report is a PDF file",                                                        // 16
  "and is signed.",                                                                              // 17
  "*Check:* `tests/test_d.py`",                                                                  // 18
  "",                                                                                            // 19
  "**NO CONJUNCTION** *(Product Owner)*",                                                        // 20
  "The export of a report is a PDF file in the standard handling.",                              // 21
  "*Check:* `tests/test_e.py`",                                                                  // 22
  "",                                                                                            // 23
  "**A NAME IN THE RULE** *(Product Owner)*",                                                    // 24
  "Every export follows `ONE DEFINITION AND ONE DRIVER`.",                                       // 25
  "*Check:* `tests/test_f.py`",                                                                  // 26
  "",                                                                                            // 27
  "**AND ONLY IN THE CHECK** *(Product Owner)*",                                                 // 28
  "The export of a report is a PDF file.",                                                       // 29
  "*Check:* `tests/test_g.py` — a report without a signature fails and is refused.",             // 30
);

// TST-473049 · level: unit · module: MOD-spec-document
// guards: ONE STATEMENT PER REQUIREMENT; UC-005 (step 6, a rule containing a conjunction); UC-018 (step 3, a conjunction in the rule is marked)
// given: RULES — four rules that contain "and" — in the middle of a line, at the start of the rule, and on its second line — or "additionally"; then three that contain none: "standard handling" — the letters inside other words —, a requirement named in a code span, whose name holds AND, and a requirement whose name and check hold "and" but whose rule does not
// input: requirementFindings(parseSpec(RULES))
// expect: exactly one finding for each of the four, a warning — not an error — under ONE STATEMENT PER REQUIREMENT that names the requirement and the line of its head line — AND IN THE RULE on line 3, ADDITIONALLY IN THE RULE on 7, AND AT THE START OF THE RULE on 11, AND ON THE SECOND LINE OF THE RULE on 15 —; none for NO CONJUNCTION, A NAME IN THE RULE and AND ONLY IN THE CHECK
test("requirementFindings — a rule with \"and\" or \"additionally\" is a warning under ONE STATEMENT PER REQUIREMENT", () => {
  const found = findingsOf(RULES);
  assert.deepEqual(found.map(summary), [
    `AND IN THE RULE:3: warning [${ONE_STATEMENT}]`,
    `ADDITIONALLY IN THE RULE:7: warning [${ONE_STATEMENT}]`,
    `AND AT THE START OF THE RULE:11: warning [${ONE_STATEMENT}]`,
    `AND ON THE SECOND LINE OF THE RULE:15: warning [${ONE_STATEMENT}]`,
  ]);
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a name given twice
//
// The numbers are the lines of NAMES.

const NAMES = lines(
  "## 1. First",                                                                                 //  1
  "",                                                                                            //  2
  "**ONE NAME** *(Product Owner)*",                                                              //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_a.py`",                                                                  //  5
  "",                                                                                            //  6
  "**ANOTHER NAME** *(Product Owner)*",                                                          //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_b.py`",                                                                  //  9
  "",                                                                                            // 10
  "**ONE NAME** *(Product Owner)*",                                                              // 11
  "Its rule, said again.",                                                                       // 12
  "*Check:* `tests/test_c.py`",                                                                  // 13
  "",                                                                                            // 14
  "## 2. Second",                                                                                // 15
  "",                                                                                            // 16
  "**ANOTHER NAME** *(Product Owner)*",                                                          // 17
  "Its rule, said again.",                                                                       // 18
  "*Check:* `tests/test_d.py`",                                                                  // 19
  "",                                                                                            // 20
  "**A NAME GIVEN ONCE** *(Product Owner)*",                                                     // 21
  "Its rule.",                                                                                   // 22
  "*Check:* `tests/test_e.py`",                                                                  // 23
);

// TST-473050 · level: unit · module: MOD-spec-document
// guards: THE NAME IS THE ID AND IT SURVIVES; UC-018
// given: NAMES — ONE NAME given twice in the same section, on lines 3 and 11; ANOTHER NAME given twice in two sections, on lines 7 and 17; and A NAME GIVEN ONCE; every requirement in the full form
// input: requirementFindings(parseSpec(NAMES))
// expect: exactly one finding for each name given twice, an error under THE NAME IS THE ID AND IT SURVIVES that names the requirement and the line of the second — ONE NAME on line 11, ANOTHER NAME on line 17, as parseSpec reads the second of two of the same name —; none for the first of either, and none for A NAME GIVEN ONCE
test("requirementFindings — a name given twice is an error under THE NAME IS THE ID AND IT SURVIVES, on the second", () => {
  const found = findingsOf(NAMES);
  assert.deepEqual(found.map(summary), [
    `ONE NAME:11: error [${NAME_SURVIVES}]`,
    `ANOTHER NAME:17: error [${NAME_SURVIVES}]`,
  ]);
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a mark of history
//
// The numbers are the lines of HISTORY.

const HISTORY = lines(
  "## 1. History",                                                                               //  1
  "",                                                                                            //  2
  "**DATED BY ITS SOURCE** *(PO A. Maier, 2026-09-24)*",                                         //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_a.py`",                                                                  //  5
  "",                                                                                            //  6
  "**WITHDRAWN IN ITS RULE** *(Product Owner)*",                                                 //  7
  "Its rule.",                                                                                   //  8
  "*Withdrawn:* replaced by `OTHER NAME`.",                                                      //  9
  "*Check:* `tests/test_b.py`",                                                                  // 10
  "",                                                                                            // 11
  "**STAMPED IN ITS CHECK** *(Product Owner)*",                                                  // 12
  "Its rule.",                                                                                   // 13
  "*Check:* `tests/test_c.py` — reworded 2026-09-30.",                                           // 14
  "",                                                                                            // 15
  "**TWO MARKS IN ONE SOURCE** *(PO A. Maier, 2026-09-24;",                                      // 16
  "reworded 2026-09-30)*",                                                                       // 17
  "Its rule.",                                                                                   // 18
  "*Check:* `tests/test_d.py`",                                                                  // 19
  "",                                                                                            // 20
  "**A DATE THAT IS NO MARK** *(Product Owner)*",                                                // 21
  "The licence text read on 2026-09-24 applies.",                                                // 22
  "*Check:* `tests/test_e.py`",                                                                  // 23
);
// The marks of history in HISTORY as MOD-text-tools' historyMarks tells them, by the requirement that holds them.
const MARKS = {
  "DATED BY ITS SOURCE": ["2026-09-24"],
  "WITHDRAWN IN ITS RULE": ["*Withdrawn:* replaced by `OTHER NAME`."],
  "STAMPED IN ITS CHECK": ["reworded 2026-09-30"],
  "TWO MARKS IN ONE SOURCE": ["2026-09-24", "reworded 2026-09-30"],
};

// TST-473051 · level: unit · module: MOD-spec-document
// guards: A DOCUMENT HOLDS NO HISTORY
// given: HISTORY — a source that dates a change, a rule that holds a note of withdrawal, a check that stamps a rewording, a source that holds two marks over two lines, and a rule that states a date which is no mark of history, the date a text was read; every requirement otherwise in the full form
// input: requirementFindings(parseSpec(HISTORY))
// expect: one finding for each mark, five in all — an error under A DOCUMENT HOLDS NO HISTORY that names the requirement and the line of its head line, and in its `what` the mark, as MARKS writes it: DATED BY ITS SOURCE on line 3, WITHDRAWN IN ITS RULE on 7, STAMPED IN ITS CHECK on 12, TWO MARKS IN ONE SOURCE twice on 16, one finding for each of its two marks —; none for A DATE THAT IS NO MARK
test("requirementFindings — each mark of history is an error under A DOCUMENT HOLDS NO HISTORY", () => {
  const found = findingsOf(HISTORY);
  assert.deepEqual(found.map(summary), [
    `DATED BY ITS SOURCE:3: error [${NO_HISTORY}]`,
    `WITHDRAWN IN ITS RULE:7: error [${NO_HISTORY}]`,
    `STAMPED IN ITS CHECK:12: error [${NO_HISTORY}]`,
    `TWO MARKS IN ONE SOURCE:16: error [${NO_HISTORY}]`,
    `TWO MARKS IN ONE SOURCE:16: error [${NO_HISTORY}]`,
  ]);
  for (const [name, marks] of Object.entries(MARKS)) {
    const whats = found.filter((f) => f.artifact === name).map((f) => f.what);
    assert.equal(whats.length, marks.length, `${name}: one finding for each of its marks`);
    for (const mark of marks) assert.ok(whats.some((what) => what.includes(mark)), `${name}: a finding names the mark ${mark}`);
  }
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a requirement with none
//
// The numbers are the lines of CLEAN.

const CLEAN = lines(
  "## 1. Clean",                                                                                 //  1
  "",                                                                                            //  2
  "**A TEST NAMED** *(Product Owner)*",                                                          //  3
  "Its rule is one statement.",                                                                  //  4
  "*Check:* `tests/test_a.py`",                                                                  //  5
  "",                                                                                            //  6
  "**SEVERAL OF EACH** *(Product Owner; Vibe Coding, ch. 13 §6)*",                               //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_b.py` · `tests/b.test.mjs` — a run without its record fails;",           //  9
  "counter-proof: with the record, it passes.",                                                  // 10
  "",                                                                                            // 11
  "**AT REVIEW** *(Product Owner)*",                                                             // 12
  "Its rule.",                                                                                   // 13
  "*Check:* no automatic check; at review.",                                                     // 14
  "",                                                                                            // 15
  "## 2. More",                                                                                  // 16
  "",                                                                                            // 17
  "**A SOURCE OVER TWO LINES** *(IEC 62304:2006+AMD1:2015, 5.5.5;",                              // 18
  "Product Owner)*",                                                                             // 19
  "Its rule.",                                                                                   // 20
  "*Check:* `tests/test_d.py`",                                                                  // 21
);

// TST-473052 · level: unit · module: MOD-spec-document
// guards: A REQUIREMENT HAS FOUR FIELDS; A REQUIREMENT NAMES ITS CHECK; ONE STATEMENT PER REQUIREMENT; THE NAME IS THE ID AND IT SURVIVES; A DOCUMENT HOLDS NO HISTORY; UC-005; UC-018; UC-019
// given: CLEAN — four requirements in the full form, with four distinct names in two sections: a check that names a test, one that names two and says what they do over two lines, one at review, and a source over two lines with the years of a standard in it
// input: requirementFindings(parseSpec(CLEAN)); and, to show that the same reading finds a fault in this SPEC, the same with the check of AT REVIEW taken out
// expect: no finding for CLEAN; for the SPEC without that check exactly one, an error under A REQUIREMENT HAS FOUR FIELDS on AT REVIEW, line 12
test("requirementFindings — a requirement in the full form has no finding", () => {
  // Known positive: the same reading finds the one fault planted in a copy.
  const planted = CLEAN.replace("*Check:* no automatic check; at review.\n", "");
  assert.notEqual(planted, CLEAN);
  assert.deepEqual(findingsOf(planted).map(summary), [`AT REVIEW:12: error [${FOUR_FIELDS}]`]);
  assert.deepEqual(findingsOf(CLEAN), []);
});
