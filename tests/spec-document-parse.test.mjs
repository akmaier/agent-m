// The process requirements of a SPEC (ITM-214) — MOD-spec-document's parseSpec, with Spec, SpecSection and Requirement, as
// docs/architecture/MOD-spec-document.md states them: a SPEC's title, its sections, and its requirements, each with its name,
// its source and that source's items, its rule, its check and the tests the check names, its section and its line.
// Run: node --test tests/spec-document-parse.test.mjs
//
// Module: MOD-spec-document
// Guards: A REQUIREMENT HAS FOUR FIELDS; A REQUIREMENT NAMES WHAT IT CONSTRAINS; UC-002
// Level: unit
//
// Every text read here is a fixture SPEC written out below; no test opens Agent M's own SPEC.md (KEIN SPEC-ZUGRIFF AUS
// PRODUKT-CODE). The expected values are read from the module file's Data and Interfaces: a section begins with a heading of
// level two, and its bytes run to the next one; a requirement begins with its head line `**NAME** *(source)*`, whose source
// may continue over further lines until `)*` and names its items separated by `;`, then its rule, then `*Check:* ` with a
// test's path — several separated by ` · ` — or the words `no automatic check; at review`; it ends at an empty line, a
// heading or the next head line. A missing field is read as null. What a requirement constrains follows from the SPEC it
// stands in, and no field holds it. Each test names the requirement it guards and states its input and its expected result
// before it runs (given / input / expect); where a test expects something not to be found, the same reading is first shown
// to find it. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseSpec } from "../src/spec-document/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

// ---------------------------------------------------------------- the SPEC of a fixture instance
//
// The instance's own SPEC, in the form of Agent M's: its requirements constrain how the instance's products are developed —
// they are what MOD-product-process takes as the process requirements, with their sources (UC-002, step 7). Its preamble
// holds a bold line in capitals and shows the form of a requirement in a fenced block, as the module file's Data does. The
// numbers are the lines of INSTANCE.

const PREAMBLE = lines(
  "# Fixture instance — Specification",                                                          //  1
  "",                                                                                            //  2
  "**VERBINDLICH (SPEC)**",                                                                      //  3
  "",                                                                                            //  4
  "The binding document of a fixture instance. A requirement is written in this form:",         //  5
  "",                                                                                            //  6
  "```text",                                                                                     //  7
  "## The heading of a section",                                                                 //  8
  "**THE NAME IN CAPITALS** *(its source)*",                                                     //  9
  "Its rule, one statement.",                                                                    // 10
  "*Check:* `tests/the_test.py`",                                                                // 11
  "```",                                                                                         // 12
  "",                                                                                            // 13
  "---",                                                                                         // 14
);
const GATES = lines(
  "## 1. Gates",                                                                                 // 15
  "",                                                                                            // 16
  "**A RELEASE IS REVIEWED BY A SECOND PERSON** *(Product Owner; Vibe Coding, ch. 13 §6)*",     // 17
  "A release is accepted only after a person other than its implementer has reviewed",          // 18
  "its test report.",                                                                            // 19
  "*Check:* `tests/test_release_review.py` — a report accepted by its implementer is refused;",  // 20
  "counter-proof: one accepted by a second person passes.",                                      // 21
  "",                                                                                            // 22
  "**UNIT VERIFICATION IS DOCUMENTED** *(IEC 62304:2006+AMD1:2015, 5.5.5;",                     // 23
  "Product Owner)*",                                                                             // 24
  "A change to a software unit is merged only with a record of its verification.",              // 25
  "*Check:* `tests/test_unit_verification.py` · `tests/unit-verification.test.mjs`",            // 26
  "",                                                                                            // 27
);
const RECORDS = lines(
  "## 2. Records",                                                                               // 28
  "",                                                                                            // 29
  "**A GATE DECISION IS KEPT** *(Product Owner)*",                                              // 30
  "Every decision at a gate is kept as a record in the product's repository.",                  // 31
  "*Check:* no automatic check; at review.",                                                     // 32
);
const INSTANCE = PREAMBLE + GATES + RECORDS;

// Its three requirements, as the module file's Requirement holds them.
const RELEASE_REVIEW = {
  name: "A RELEASE IS REVIEWED BY A SECOND PERSON",
  source: "Product Owner; Vibe Coding, ch. 13 §6",
  sources: ["Product Owner", "Vibe Coding, ch. 13 §6"],
  rule: "A release is accepted only after a person other than its implementer has reviewed\nits test report.",
  check: "`tests/test_release_review.py` — a report accepted by its implementer is refused;\n" +
    "counter-proof: one accepted by a second person passes.",
  checkPaths: ["tests/test_release_review.py"],
  section: "## 1. Gates",
  line: 17,
};
const UNIT_VERIFICATION = {
  name: "UNIT VERIFICATION IS DOCUMENTED",
  source: "IEC 62304:2006+AMD1:2015, 5.5.5;\nProduct Owner",
  sources: ["IEC 62304:2006+AMD1:2015, 5.5.5", "Product Owner"],
  rule: "A change to a software unit is merged only with a record of its verification.",
  check: "`tests/test_unit_verification.py` · `tests/unit-verification.test.mjs`",
  checkPaths: ["tests/test_unit_verification.py", "tests/unit-verification.test.mjs"],
  section: "## 1. Gates",
  line: 23,
};
const GATE_DECISION = {
  name: "A GATE DECISION IS KEPT",
  source: "Product Owner",
  sources: ["Product Owner"],
  rule: "Every decision at a gate is kept as a record in the product's repository.",
  check: "no automatic check; at review.",
  checkPaths: [],
  section: "## 2. Records",
  line: 30,
};

const byName = (...requirements) => new Map(requirements.map((r) => [r.name, r]));

// guards: A REQUIREMENT HAS FOUR FIELDS
// given: INSTANCE — a title line; a preamble with a bold line in capitals and a fenced example of the form, holding a heading
//        of level two and a head line; then two sections holding three requirements
// input: parseSpec(INSTANCE)
// expect: the title "Fixture instance — Specification"; two sections — `## 1. Gates` from line 15, `## 2. Records` from line
//         28 —, each with its byte range, which holds exactly GATES and RECORDS, and the names of its requirements in order;
//         the three requirements by name, in the order they stand, each with its name, source, rule and check, its section and
//         its line, as RELEASE_REVIEW, UNIT_VERIFICATION and GATE_DECISION write them out; neither the bold line nor anything
//         in the fenced block is a section or a requirement — out of its fence, the same example is both
test("parseSpec — the requirements of a SPEC with their four fields, their section and their line", () => {
  const spec = parseSpec(INSTANCE);
  assert.deepEqual(spec, {
    title: "Fixture instance — Specification",
    sections: [
      { heading: "## 1. Gates", line: 15, start: PREAMBLE.length, end: PREAMBLE.length + GATES.length,
        requirements: [RELEASE_REVIEW.name, UNIT_VERIFICATION.name] },
      { heading: "## 2. Records", line: 28, start: PREAMBLE.length + GATES.length, end: INSTANCE.length,
        requirements: [GATE_DECISION.name] },
    ],
    requirements: byName(RELEASE_REVIEW, UNIT_VERIFICATION, GATE_DECISION),
  });
  assert.deepEqual([...spec.requirements.keys()], [RELEASE_REVIEW.name, UNIT_VERIFICATION.name, GATE_DECISION.name],
    "in the order they stand");
  assert.deepEqual(spec.sections.map((s) => INSTANCE.slice(s.start, s.end)), [GATES, RECORDS],
    "a section's bytes run from its heading line up to the next heading of level two, or to the end");
  // Known positive: out of its fence, the example is a section with a requirement.
  const example = parseSpec(lines("## The heading of a section", "**THE NAME IN CAPITALS** *(its source)*",
    "Its rule, one statement.", "*Check:* `tests/the_test.py`"));
  assert.deepEqual(example.sections.map((s) => s.heading), ["## The heading of a section"]);
  assert.deepEqual([...example.requirements.keys()], ["THE NAME IN CAPITALS"]);
});

// ---------------------------------------------------------------- sources
//
// The numbers are the lines of SOURCES.

const SOURCES = lines(
  "## 1. Sources",                                                                               //  1
  "",                                                                                            //  2
  "**ONE SOURCE** *(Product Owner)*",                                                            //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_one.py`",                                                                //  5
  "",                                                                                            //  6
  "**ONE SOURCE AND THE PART IT DRAWS ON** *(Vibe Coding, ch. 13 §6)*",                          //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_two.py`",                                                                //  9
  "",                                                                                            // 10
  "**SEVERAL SOURCES** *(Product Owner; Vibe Coding, ch. 13 §6; SRC-iec-62304, 5.5.5)*",         // 11
  "Its rule.",                                                                                   // 12
  "*Check:* `tests/test_three.py`",                                                              // 13
  "",                                                                                            // 14
  "**A SOURCE OVER SEVERAL LINES** *(IEC 62304:2006+AMD1:2015, 5.5.5;",                          // 15
  "Product Owner;",                                                                              // 16
  "Vibe Coding, ch. 12 §2)*",                                                                    // 17
  "Its rule, which begins after its source has ended.",                                          // 18
  "*Check:* `tests/test_four.py`",                                                               // 19
);

// guards: A REQUIREMENT HAS FOUR FIELDS; UC-002 (each gate a process requirement adds is marked with the source it comes from)
// given: SOURCES — a source of one item without a part, one of one item with the part it draws on, one of three items with
//        and without their parts, and one that runs over three lines
// input: parseSpec(SOURCES)
// expect: each requirement's source as written between `*(` and `)*`, its line breaks kept; its items in `sources`, split at
//         `;` and trimmed, each keeping the part it draws on — `, ` splits nothing —; the source over several lines read up to
//         its `)*` on line 17, and the rule beginning on the line after it
test("parseSpec — a source over several lines, and several sources split at `;`, with and without their parts", () => {
  const got = [...parseSpec(SOURCES).requirements.values()].map(({ name, source, sources, rule, line }) =>
    ({ name, source, sources, rule, line }));
  assert.deepEqual(got, [
    { name: "ONE SOURCE", source: "Product Owner", sources: ["Product Owner"], rule: "Its rule.", line: 3 },
    { name: "ONE SOURCE AND THE PART IT DRAWS ON", source: "Vibe Coding, ch. 13 §6", sources: ["Vibe Coding, ch. 13 §6"],
      rule: "Its rule.", line: 7 },
    { name: "SEVERAL SOURCES", source: "Product Owner; Vibe Coding, ch. 13 §6; SRC-iec-62304, 5.5.5",
      sources: ["Product Owner", "Vibe Coding, ch. 13 §6", "SRC-iec-62304, 5.5.5"], rule: "Its rule.", line: 11 },
    { name: "A SOURCE OVER SEVERAL LINES", source: "IEC 62304:2006+AMD1:2015, 5.5.5;\nProduct Owner;\nVibe Coding, ch. 12 §2",
      sources: ["IEC 62304:2006+AMD1:2015, 5.5.5", "Product Owner", "Vibe Coding, ch. 12 §2"],
      rule: "Its rule, which begins after its source has ended.", line: 15 },
  ]);
});

// ---------------------------------------------------------------- checks
//
// The numbers are the lines of CHECKS.

const CHECKS = lines(
  "## 1. Checks",                                                                                //  1
  "",                                                                                            //  2
  "**ONE TEST** *(Product Owner)*",                                                              //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_one.py`",                                                                //  5
  "",                                                                                            //  6
  "**SEVERAL TESTS** *(Product Owner)*",                                                         //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_two.py` · `tests/two.test.mjs` · `tests/test_two_more.py`",              //  9
  "",                                                                                            // 10
  "**SEVERAL TESTS, AND WHAT THEY DO** *(Product Owner)*",                                       // 11
  "Its rule.",                                                                                   // 12
  "*Check:* `tests/test_three.py` · `tests/three.test.mjs` — a run without its record fails;",   // 13
  "counter-proof: with the record, it passes.",                                                  // 14
  "",                                                                                            // 15
  "**ONE TEST, AND A SENTENCE ON IT** *(Product Owner)*",                                        // 16
  "Its rule.",                                                                                   // 17
  "*Check:* `tests/test_four.py`. Three accepted modules yield one job each.",                   // 18
  "",                                                                                            // 19
  "**AT REVIEW** *(Product Owner)*",                                                             // 20
  "Its rule.",                                                                                   // 21
  "*Check:* no automatic check; at review.",                                                     // 22
  "",                                                                                            // 23
  "**AT REVIEW, WITH A SENTENCE ON IT** *(Product Owner)*",                                      // 24
  "Its rule.",                                                                                   // 25
  "*Check:* no automatic check; at review. The branch protection can enforce it.",               // 26
);

// guards: A REQUIREMENT HAS FOUR FIELDS
// given: CHECKS — a check naming one test; one naming three, separated by ` · `; one naming two and saying what they do, over
//        two lines; one naming a test followed by a sentence; and two at review, one with a sentence after it
// input: parseSpec(CHECKS)
// expect: each check as written after `*Check:* `, its line breaks kept; in `checkPaths` the paths of the tests it names,
//         split at ` · `, without the sentence after them; a check at review names none
test("parseSpec — a check naming several tests split at ` · `, and one at review naming none", () => {
  const got = [...parseSpec(CHECKS).requirements.values()].map(({ name, check, checkPaths }) => ({ name, check, checkPaths }));
  assert.deepEqual(got, [
    { name: "ONE TEST", check: "`tests/test_one.py`", checkPaths: ["tests/test_one.py"] },
    { name: "SEVERAL TESTS", check: "`tests/test_two.py` · `tests/two.test.mjs` · `tests/test_two_more.py`",
      checkPaths: ["tests/test_two.py", "tests/two.test.mjs", "tests/test_two_more.py"] },
    { name: "SEVERAL TESTS, AND WHAT THEY DO",
      check: "`tests/test_three.py` · `tests/three.test.mjs` — a run without its record fails;\n" +
        "counter-proof: with the record, it passes.",
      checkPaths: ["tests/test_three.py", "tests/three.test.mjs"] },
    { name: "ONE TEST, AND A SENTENCE ON IT", check: "`tests/test_four.py`. Three accepted modules yield one job each.",
      checkPaths: ["tests/test_four.py"] },
    { name: "AT REVIEW", check: "no automatic check; at review.", checkPaths: [] },
    { name: "AT REVIEW, WITH A SENTENCE ON IT", check: "no automatic check; at review. The branch protection can enforce it.",
      checkPaths: [] },
  ]);
});

// ---------------------------------------------------------------- requirements missing a field
//
// The numbers are the lines of MISSING.

const MISSING = lines(
  "## 1. Requirements missing a field",                                                          //  1
  "",                                                                                            //  2
  "**NO SOURCE**",                                                                               //  3
  "Its rule.",                                                                                   //  4
  "*Check:* `tests/test_no_source.py`",                                                          //  5
  "",                                                                                            //  6
  "**AN EMPTY SOURCE** *()*",                                                                    //  7
  "Its rule.",                                                                                   //  8
  "*Check:* `tests/test_empty_source.py`",                                                       //  9
  "",                                                                                            // 10
  "**NO RULE** *(Product Owner)*",                                                               // 11
  "*Check:* `tests/test_no_rule.py`",                                                            // 12
  "",                                                                                            // 13
  "**NO CHECK** *(Product Owner)*",                                                              // 14
  "Its rule.",                                                                                   // 15
  "",                                                                                            // 16
  "*Check:* `tests/test_elsewhere.py` — a paragraph of its own, after that requirement ended.",  // 17
  "",                                                                                            // 18
  "**AN EMPTY CHECK** *(Product Owner)*",                                                        // 19
  "Its rule.",                                                                                   // 20
  "*Check:*",                                                                                    // 21
  "",                                                                                            // 22
  "**NO RULE AND NO CHECK** *(Product Owner)*",                                                  // 23
  "",                                                                                            // 24
  "**BOLD PROSE IN CAPITALS**",                                                                  // 25
  "A paragraph after it, with no check.",                                                        // 26
);
const SECTION = "## 1. Requirements missing a field";

// guards: A REQUIREMENT HAS FOUR FIELDS
// given: MISSING — a requirement whose head line names no source, one with an empty source, one without a rule, one without
//        a check — a `*Check:*` line follows only in a paragraph of its own, after an empty line —, one whose check line is
//        empty, one of a head line alone; then a bold line in capitals followed by a paragraph without a check
// input: parseSpec(MISSING)
// expect: six requirements, each read with its missing field null — `sources` and `checkPaths` empty with it — and every
//         other field as written; nothing taken from a neighbour: the check of the paragraph on line 17 belongs to no
//         requirement, and a check is never read as a rule; the bold line on line 25 is no requirement — the same line
//         followed by its check is one, as NO SOURCE on line 3 shows
test("parseSpec — a requirement missing a field is read with that field null, not guessed", () => {
  const spec = parseSpec(MISSING);
  const r = (name, line, fields) => ({ name, source: "Product Owner", sources: ["Product Owner"], rule: "Its rule.", check: null,
    checkPaths: [], section: SECTION, line, ...fields });
  const expected = [
    r("NO SOURCE", 3, { source: null, sources: [], check: "`tests/test_no_source.py`", checkPaths: ["tests/test_no_source.py"] }),
    r("AN EMPTY SOURCE", 7, { source: null, sources: [], check: "`tests/test_empty_source.py`",
      checkPaths: ["tests/test_empty_source.py"] }),
    r("NO RULE", 11, { rule: null, check: "`tests/test_no_rule.py`", checkPaths: ["tests/test_no_rule.py"] }),
    r("NO CHECK", 14, {}),
    r("AN EMPTY CHECK", 19, {}),
    r("NO RULE AND NO CHECK", 23, { rule: null }),
  ];
  assert.deepEqual([...spec.requirements.values()], expected);
  assert.deepEqual(spec.sections.map((s) => s.requirements), [expected.map((x) => x.name)]);
});

// ---------------------------------------------------------------- the text of one section

// guards: A REQUIREMENT HAS FOUR FIELDS
// given: GATES alone — the text of one section of INSTANCE, as a change queue's entry holds its proposal: the complete
//        section from its heading line to its end, nothing else
// input: parseSpec(GATES)
// expect: no title, so the empty text; one section, `## 1. Gates`, from line 1 over the whole text; its two requirements read
//         as in INSTANCE — the same fields and section —, each at its line in GATES, 14 lines less than in INSTANCE
test("parseSpec — the text of one section, such as a change queue's proposal, is read as a SPEC is read", () => {
  assert.deepEqual(parseSpec(GATES), {
    title: "",
    sections: [{ heading: "## 1. Gates", line: 1, start: 0, end: GATES.length,
      requirements: [RELEASE_REVIEW.name, UNIT_VERIFICATION.name] }],
    requirements: byName({ ...RELEASE_REVIEW, line: 3 }, { ...UNIT_VERIFICATION, line: 9 }),
  });
});

// ---------------------------------------------------------------- what a requirement constrains
//
// A product's SPEC beside the instance's. It holds A GATE DECISION IS KEPT word for word, in a section of the same heading as
// in INSTANCE. The numbers are the lines of PRODUCT.

const PRODUCT = lines(
  "# Fixture product — Specification",                                                           //  1
  "",                                                                                            //  2
  "**VERBINDLICH (SPEC)**",                                                                      //  3
  "",                                                                                            //  4
  "## 1. Export",                                                                                //  5
  "",                                                                                            //  6
  "**THE EXPORT IS A PDF** *(Product Owner)*",                                                   //  7
  "The export of a report is one PDF file.",                                                     //  8
  "*Check:* `tests/export.test.mjs`",                                                            //  9
  "",                                                                                            // 10
  "## 2. Records",                                                                               // 11
  "",                                                                                            // 12
  "**A GATE DECISION IS KEPT** *(Product Owner)*",                                              // 13
  "Every decision at a gate is kept as a record in the product's repository.",                  // 14
  "*Check:* no automatic check; at review.",                                                     // 15
);

// guards: A REQUIREMENT NAMES WHAT IT CONSTRAINS; UC-002 (the requirements of the instance's SPEC are the process requirements)
// given: INSTANCE, the instance's SPEC, whose requirements constrain the development process, and PRODUCT, a product's SPEC,
//        whose requirements constrain the product
// input: parseSpec of each
// expect: every requirement of either SPEC has exactly the fields of the module file's Requirement — name, source, sources,
//         rule, check, checkPaths, section, line —, none of which says what it constrains; A GATE DECISION IS KEPT is read
//         alike from both, apart from its line, 30 and 13: what it constrains is the SPEC its caller read it from
test("parseSpec — what a requirement constrains follows from the SPEC it stands in; no field of Requirement holds it", () => {
  const instance = parseSpec(INSTANCE), product = parseSpec(PRODUCT);
  const FIELDS = ["check", "checkPaths", "line", "name", "rule", "section", "source", "sources"];
  const all = [...instance.requirements.values(), ...product.requirements.values()];
  assert.equal(all.length, 5, "three requirements of the instance, two of the product");
  for (const r of all) assert.deepEqual(Object.keys(r).sort(), FIELDS, r.name);
  assert.deepEqual(instance.requirements.get(GATE_DECISION.name), GATE_DECISION);
  assert.deepEqual(product.requirements.get(GATE_DECISION.name), { ...GATE_DECISION, line: 13 });
});
