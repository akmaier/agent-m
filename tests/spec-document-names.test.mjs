// A requirement whose name is not in capitals (ITM-379) — MOD-spec-document as docs/architecture/MOD-spec-document.md states it:
// a head line of the requirement's form, `**name** *(source)*`, whose name is not in capitals is read as a requirement too, so
// that the findings name it instead of passing over it; and requirementFindings gives it an error under EVERY ARTIFACT HAS AN
// IDENTIFIER, naming the requirement and its line, since MOD-identifiers' scheme does not read it as a requirement's name.
// Run: node --test tests/spec-document-names.test.mjs
//
// Module: MOD-spec-document
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; A REQUIREMENT HAS FOUR FIELDS; UC-005; UC-019
// Level: unit
//
// Every text read here is a fixture SPEC written out below; no test opens Agent M's own SPEC.md (KEIN SPEC-ZUGRIFF AUS
// PRODUKT-CODE). The numbers beside a fixture are its lines. A finding is compared as `<requirement>:<line>: <kind> [<rule>]`,
// in the order of the lines; its `what` and `fix` are not worded by the module file, so a test asks of them only that each says
// something in one line, as the Finding of MOD-text-tools asks. Each test names the requirements it guards and states its input
// and its expected result before it runs (given / input / expect); every test holds something that the module does not do
// before this item, so that it fails on the code that is there; where a test expects something not to be found, the same
// reading is first shown to find it on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseSpec, requirementFindings } from "../src/spec-document/index.mjs";
import { finding } from "../src/text-tools/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

const HAS_IDENTIFIER = "EVERY ARTIFACT HAS AN IDENTIFIER";
const FOUR_FIELDS = "A REQUIREMENT HAS FOUR FIELDS";

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

// ---------------------------------------------------------------- names that are not in capitals
//
// The numbers are the lines of NAMES: three requirements whose names are not in capitals — one that begins with a capital letter,
// one with no capital letter at all, one in capitals and small letters — and one in capitals, the third directly after it with no
// empty line between, the last with a source over two lines. All four are whole.

const NAMES = lines(
  "## 1. Names",                                                                                 //  1
  "",                                                                                            //  2
  "**Export is a pdf** *(Product Owner)*",                                                       //  3
  "The export of a report is one PDF file.",                                                     //  4
  "*Check:* `tests/test_export.py`",                                                             //  5
  "",                                                                                            //  6
  "**EXPORT IS A PDF** *(Product Owner)*",                                                       //  7
  "The export of a report is one PDF file.",                                                     //  8
  "*Check:* `tests/test_export.py`",                                                             //  9
  "**export as csv** *(Product Owner)*",                                                         // 10
  "The export of a report may be one CSV file.",                                                 // 11
  "*Check:* `tests/test_csv.py`",                                                                // 12
  "",                                                                                            // 13
  "**Export Is A Pdf** *(Product Owner;",                                                        // 14
  "Vibe Coding, ch. 13 §6)*",                                                                    // 15
  "The export of a report is one PDF file.",                                                     // 16
  "*Check:* no automatic check; at review.",                                                     // 17
);

const EXPORT_PDF = { name: "Export is a pdf", source: "Product Owner", sources: ["Product Owner"],
  rule: "The export of a report is one PDF file.", check: "`tests/test_export.py`", checkPaths: ["tests/test_export.py"],
  section: "## 1. Names", line: 3 };
const EXPORT_CAPITALS = { ...EXPORT_PDF, name: "EXPORT IS A PDF", line: 7 };
const EXPORT_CSV = { name: "export as csv", source: "Product Owner", sources: ["Product Owner"],
  rule: "The export of a report may be one CSV file.", check: "`tests/test_csv.py`", checkPaths: ["tests/test_csv.py"],
  section: "## 1. Names", line: 10 };
const EXPORT_MIXED = { name: "Export Is A Pdf", source: "Product Owner;\nVibe Coding, ch. 13 §6",
  sources: ["Product Owner", "Vibe Coding, ch. 13 §6"], rule: "The export of a report is one PDF file.",
  check: "no automatic check; at review.", checkPaths: [], section: "## 1. Names", line: 14 };

// TST-473056 · level: unit · module: MOD-spec-document
// guards: A REQUIREMENT HAS FOUR FIELDS; EVERY ARTIFACT HAS AN IDENTIFIER; UC-005 (step 6, a candidate under a name of its own)
// given: NAMES — a head line of the requirement's form whose name is not in capitals: `Export is a pdf`; then one in capitals; then, directly after it with no empty line, `export as csv`, a name with no capital letter; then `Export Is A Pdf`, a name in capitals and small letters, with a source over two lines
// input: parseSpec(NAMES)
// expect: four requirements, in the order they stand, each read with its name as written, its source and that source's items, its rule, its check, its section and the line of its head line — 3, 7, 10 and 14 —, none lost into another: the check of EXPORT IS A PDF ends on line 9, where the head line on line 10 begins; the section lists the four names in order
test("parseSpec — a head line whose name is not in capitals is read as a requirement", () => {
  const spec = parseSpec(NAMES);
  assert.deepEqual([...spec.requirements.values()], [EXPORT_PDF, EXPORT_CAPITALS, EXPORT_CSV, EXPORT_MIXED]);
  assert.deepEqual(spec.sections.map((s) => s.requirements), [["Export is a pdf", "EXPORT IS A PDF", "export as csv", "Export Is A Pdf"]]);
});

// TST-473057 · level: unit · module: MOD-spec-document
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-005 (step 6) and UC-019 (step 7), findings sent back to the participant
// given: NAMES; and JUDGED — a requirement named `Export is a pdf` whose check is missing, which is otherwise whole
// input: requirementFindings of each, read by parseSpec
// expect: for NAMES, exactly one finding for each of the three requirements whose name is not in capitals, an error under EVERY ARTIFACT HAS AN IDENTIFIER that names the requirement and the line of its head line — Export is a pdf on line 3, export as csv on 10, Export Is A Pdf on 14 — and says something of its name; none for EXPORT IS A PDF; for JUDGED the same error on line 3 and, as for any other requirement, an error under A REQUIREMENT HAS FOUR FIELDS for the check that is missing — such a requirement is judged, not passed over
test("requirementFindings — a name that is not in capitals is an error under EVERY ARTIFACT HAS AN IDENTIFIER, on the requirement's line", () => {
  const found = findingsOf(NAMES);
  assert.deepEqual(found.map(summary), [
    `Export is a pdf:3: error [${HAS_IDENTIFIER}]`,
    `export as csv:10: error [${HAS_IDENTIFIER}]`,
    `Export Is A Pdf:14: error [${HAS_IDENTIFIER}]`,
  ]);
  for (const f of found) assert.match(f.what, /name/i, `${f.artifact}: it says something of the name`);
  assertWellFormed(found);

  const judged = findingsOf(lines(
    "## 1. Judged",                                                                              //  1
    "",                                                                                          //  2
    "**Export is a pdf** *(Product Owner)*",                                                     //  3
    "The export of a report is one PDF file.",                                                   //  4
  ));
  assert.deepEqual(judged.map(summary), [
    `Export is a pdf:3: error [${FOUR_FIELDS}]`,
    `Export is a pdf:3: error [${HAS_IDENTIFIER}]`,
  ]);
  assertWellFormed(judged);
});

// ---------------------------------------------------------------- names in capitals

// The numbers are the lines of CAPITALS: three requirements whose names use what the scheme of identifiers allows besides capital
// letters — an apostrophe, a hyphen, a comma, a digit and spaces. All are whole, and none has a rule with "and".

const CAPITALS = lines(
  "## 1. Capitals",                                                                              //  1
  "",                                                                                            //  2
  "**DON'T REPEAT YOURSELF** *(Vibe Coding, ch. 10 §3)*",                                        //  3
  "An architecture defines each rule in one place.",                                             //  4
  "*Check:* no automatic check; at review.",                                                     //  5
  "",                                                                                            //  6
  "**A MODEL-DEPENDENT TEST IS MEASURED AS A RATE** *(Product Owner)*",                          //  7
  "A test that depends on a model reports a rate.",                                              //  8
  "*Check:* `tests/test_rate.py`",                                                               //  9
  "",                                                                                            // 10
  "**AT LEAST 2 RUNS, OR 3** *(Product Owner)*",                                                 // 11
  "A rate is measured over a fixed number of runs.",                                             // 12
  "*Check:* `tests/test_runs.py`",                                                               // 13
);

// TST-473058 · level: unit · module: MOD-spec-document
// guards: EVERY ARTIFACT HAS AN IDENTIFIER; UC-005
// given: CAPITALS — three whole requirements whose names are in capitals and hold an apostrophe, a hyphen, a comma and a digit; and, to show that the same reading finds a fault, the same SPEC with the first name written `Don't repeat yourself`
// input: requirementFindings of each, read by parseSpec
// expect: no finding for CAPITALS; for the SPEC with the first name changed exactly one, an error under EVERY ARTIFACT HAS AN IDENTIFIER on `Don't repeat yourself`, line 3
test("requirementFindings — a name in capitals passes", () => {
  // Known positive: the same reading finds the one name changed in a copy.
  const planted = CAPITALS.replace("**DON'T REPEAT YOURSELF**", "**Don't repeat yourself**");
  assert.notEqual(planted, CAPITALS);
  assert.deepEqual(findingsOf(planted).map(summary), [`Don't repeat yourself:3: error [${HAS_IDENTIFIER}]`]);
  assert.deepEqual(findingsOf(CAPITALS), []);
});

// ---------------------------------------------------------------- the SPEC's own head lines

// The numbers are the lines of OWN: a SPEC in the form of Agent M's own — its title; a preamble with a bold line in capitals, a bold
// line of prose and a fenced example of the form whose name is not in capitals; one section with a requirement, an identifier of
// a use case written as a head line, a requirement whose name is not in capitals and a requirement of the apostrophe.

const OWN = lines(
  "# Fixture instance — Specification",                                                          //  1
  "",                                                                                            //  2
  "**VERBINDLICH (SPEC)**",                                                                      //  3
  "",                                                                                            //  4
  "**Form of a requirement** — prose in bold, not a requirement.",                               //  5
  "",                                                                                            //  6
  "```text",                                                                                     //  7
  "**The name of a requirement** *(its source)*",                                                //  8
  "Its rule, one statement.",                                                                    //  9
  "*Check:* `tests/the_test.py`",                                                                // 10
  "```",                                                                                         // 11
  "",                                                                                            // 12
  "## 1. Gates",                                                                                 // 13
  "",                                                                                            // 14
  "**A GATE IS REVIEWED** *(Product Owner; Vibe Coding, ch. 13 §6)*",                            // 15
  "A gate is reviewed by a person.",                                                             // 16
  "*Check:* `tests/test_gate.py`",                                                               // 17
  "",                                                                                            // 18
  "**UC-007** *(a use case is no requirement)*",                                                 // 19
  "Its text.",                                                                                   // 20
  "",                                                                                            // 21
  "**A gate is recorded** *(Product Owner)*",                                                    // 22
  "Every decision at a gate is kept as a record.",                                               // 23
  "*Check:* no automatic check; at review.",                                                     // 24
  "",                                                                                            // 25
  "**DON'T REPEAT YOURSELF** *(Vibe Coding, ch. 10 §3)*",                                        // 26
  "An architecture defines each rule in one place.",                                             // 27
  "*Check:* no automatic check; at review.",                                                     // 28
);

// TST-473059 · level: unit · module: MOD-spec-document
// guards: A REQUIREMENT HAS FOUR FIELDS; EVERY ARTIFACT HAS AN IDENTIFIER; UC-005
// given: OWN — a bold line in capitals without a source, a line of bold prose, and a fenced example of the form with a name not in capitals, all in the preamble; one section holding a requirement in capitals, a head line `UC-007`, which is the identifier of a use case, a requirement whose name is not in capitals, and a requirement of the apostrophe
// input: parseSpec(OWN)
// expect: the title; one section from line 13 to the end of the text, naming three requirements — A GATE IS REVIEWED on line 15, `A gate is recorded` on 22, DON'T REPEAT YOURSELF on 26 — and each read with its fields, section and line as in any SPEC; the bold line, the prose, the fenced example and the head line UC-007 are no requirement, read as before
test("parseSpec — the head lines of a SPEC in capitals read as before; what is no head line stays prose", () => {
  const spec = parseSpec(OWN);
  assert.equal(spec.title, "Fixture instance — Specification");
  assert.deepEqual(spec.sections, [{ heading: "## 1. Gates", line: 13, start: OWN.indexOf("## 1. Gates"), end: OWN.length,
    requirements: ["A GATE IS REVIEWED", "A gate is recorded", "DON'T REPEAT YOURSELF"] }]);
  assert.deepEqual([...spec.requirements.values()], [
    { name: "A GATE IS REVIEWED", source: "Product Owner; Vibe Coding, ch. 13 §6", sources: ["Product Owner", "Vibe Coding, ch. 13 §6"],
      rule: "A gate is reviewed by a person.", check: "`tests/test_gate.py`", checkPaths: ["tests/test_gate.py"], section: "## 1. Gates", line: 15 },
    { name: "A gate is recorded", source: "Product Owner", sources: ["Product Owner"], rule: "Every decision at a gate is kept as a record.",
      check: "no automatic check; at review.", checkPaths: [], section: "## 1. Gates", line: 22 },
    { name: "DON'T REPEAT YOURSELF", source: "Vibe Coding, ch. 10 §3", sources: ["Vibe Coding, ch. 10 §3"],
      rule: "An architecture defines each rule in one place.", check: "no automatic check; at review.", checkPaths: [],
      section: "## 1. Gates", line: 26 },
  ]);
});
