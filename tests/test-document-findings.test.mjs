// The findings of a test declaration (ITM-304) — MOD-test-document's testFindings, as docs/architecture/MOD-test-document.md
// states it: for a TestDeclaration, an error under EVERY TEST HAS ONE LEVEL for a missing or unknown level; under A TEST STATES
// ITS EXPECTED RESULT BEFORE IT RUNS for a missing precondition, input or expected result; under EVERY ARTIFACT NAMES ITS ORIGIN
// for a test that guards nothing or names no module, or a test of level unit or component that names system; and under A
// MODEL-DEPENDENT TEST IS MEASURED AS A RATE for a test with phrasings and no runs, or with fewer than two runs. Whether a
// guarded name exists, and whether a commit-level test calls a paid service, are decided elsewhere and are not tested here.
// Run: node --test tests/test-document-findings.test.mjs
//
// Module: MOD-test-document
// Guards: EVERY TEST HAS ONE LEVEL; A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; EVERY ARTIFACT NAMES ITS ORIGIN; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-026
// Level: unit
//
// Every declaration read here stands in a fixture test file written out below and is read by testDeclarations, as the check
// that calls testFindings reads it: a key that is missing reads null, and one with nothing after its colon reads an empty
// text. The numbers beside a fixture are its lines. A finding is compared as `<declaration>:<line>: <kind> [<rule>]` — the
// identifier of the declaration it names, the line of its first line, error or warning, and the requirement it is reported
// under — in the order of the lines, since the module file does not state the order in which testFindings lists them; its
// `what` and `fix` are not worded by the module file, so a test asks of them only what the Finding of MOD-text-tools asks:
// both say something, in one line. Each test names the requirements it guards and states its input and its expected result
// before it runs (given / input / expect); where a test expects something not to be found, the same reading is first shown to
// find it on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testDeclarations, testFindings } from "../src/test-document/index.mjs";
import { finding } from "../src/text-tools/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

const ONE_LEVEL = "EVERY TEST HAS ONE LEVEL";
const EXPECTED_RESULT = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const RATE = "A MODEL-DEPENDENT TEST IS MEASURED AS A RATE";

const PATH = "tests/sample.test.mjs";

// The findings of every declaration of the test file `text`, in the order of their lines — on one line, in the order of their
// rules and their words.
function findingsIn(text, path = PATH) {
  return testDeclarations(path, text).flatMap((declaration) => testFindings(declaration))
    .sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule) || a.what.localeCompare(b.what));
}

// A finding as the tests compare it: the declaration it names, its line, error or warning, and the requirement it is reported under.
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

// A declaration that has all it needs, and the text of a test file holding one declaration: `id`, then each key of `fields`
// that is given, in the order of the module file's Data, on a line of its own.
const COMPLETE = {
  level: "unit", module: "MOD-sample", guards: "A SAMPLE REQUIREMENT",
  given: "a precondition", input: "an input", expect: "an expected result",
};
const KEYS = ["level", "module", "guards", "given", "input", "expect", "runs", "phrasings", "paid"];
function declared(id, fields) {
  return lines(`// ${id}`, ...KEYS.filter((key) => fields[key] !== undefined).map((key) => `// ${key}: ${fields[key]}`));
}

// ---------------------------------------------------------------- a missing or unknown level
//
// The numbers are the lines of LEVELS.

const LEVELS = lines(
  "// TST-101 · module: MOD-sample",                                                             //  1
  "// guards: A SAMPLE REQUIREMENT",                                                             //  2
  "// given: a precondition",                                                                    //  3
  "// input: an input",                                                                          //  4
  "// expect: an expected result",                                                               //  5
  "",                                                                                            //  6
  "// TST-102 · module: MOD-sample",                                                             //  7
  "// level:",                                                                                   //  8
  "// guards: A SAMPLE REQUIREMENT",                                                             //  9
  "// given: a precondition",                                                                    // 10
  "// input: an input",                                                                          // 11
  "// expect: an expected result",                                                               // 12
  "",                                                                                            // 13
  "// TST-103 · level: integration · module: MOD-sample",                                        // 14
  "// guards: A SAMPLE REQUIREMENT",                                                             // 15
  "// given: a precondition",                                                                    // 16
  "// input: an input",                                                                          // 17
  "// expect: an expected result",                                                               // 18
  "",                                                                                            // 19
  "// TST-104 · level: unit|component · module: MOD-sample",                                     // 20
  "// guards: A SAMPLE REQUIREMENT",                                                             // 21
  "// given: a precondition",                                                                    // 22
  "// input: an input",                                                                          // 23
  "// expect: an expected result",                                                               // 24
);

// guards: EVERY TEST HAS ONE LEVEL; UC-026 (step 5, each case carries its level)
// given: LEVELS — a declaration with no `level` key, one whose `level:` has nothing after it, one of the level "integration",
//        and one of "unit|component", two levels in one value; every other key given. Then, one declaration each, the five
//        levels unit, component, system, release and user, each with a module that fits it, every other key given
// input: testFindings of each declaration, read by testDeclarations
// expect: exactly one finding for each of the four, an error under EVERY TEST HAS ONE LEVEL that names the declaration and the
//         line of its first line — TST-101 on line 1, TST-102 on 7, TST-103 on 14, TST-104 on 20 — and says that the level is
//         missing, and, for the last two, which level it found; none for the declaration of any of the five levels
test("testFindings — a missing or unknown level is an error under EVERY TEST HAS ONE LEVEL, on the declaration's line", () => {
  const found = findingsIn(LEVELS);
  assert.deepEqual(found.map(summary), [
    `TST-101:1: error [${ONE_LEVEL}]`,
    `TST-102:7: error [${ONE_LEVEL}]`,
    `TST-103:14: error [${ONE_LEVEL}]`,
    `TST-104:20: error [${ONE_LEVEL}]`,
  ]);
  assert.match(found[0].what, /level/i, "TST-101: the level is missing");
  assert.match(found[1].what, /level/i, "TST-102: the level is missing");
  assert.ok(found[2].what.includes("integration"), "TST-103: the level it found");
  assert.ok(found[3].what.includes("unit|component"), "TST-104: the level it found");
  assertWellFormed(found);
  // The same reading lets each of the five levels pass.
  for (const level of ["unit", "component", "system", "release", "user"]) {
    const module = level === "unit" || level === "component" ? "MOD-sample" : "system";
    assert.deepEqual(findingsIn(declared("TST-110", { ...COMPLETE, level, module })), [], level);
  }
});

// ---------------------------------------------------------------- a missing precondition, input or expected result
//
// The numbers are the lines of RESULTS.

const RESULTS = lines(
  "// TST-201 · level: unit · module: MOD-sample",                                               //  1
  "// guards: A SAMPLE REQUIREMENT",                                                             //  2
  "// input: an input",                                                                          //  3
  "// expect: an expected result",                                                               //  4
  "",                                                                                            //  5
  "// TST-202 · level: unit · module: MOD-sample",                                               //  6
  "// guards: A SAMPLE REQUIREMENT",                                                             //  7
  "// given: a precondition",                                                                    //  8
  "// expect: an expected result",                                                               //  9
  "",                                                                                            // 10
  "// TST-203 · level: unit · module: MOD-sample",                                               // 11
  "// guards: A SAMPLE REQUIREMENT",                                                             // 12
  "// given: a precondition",                                                                    // 13
  "// input: an input",                                                                          // 14
  "",                                                                                            // 15
  "// TST-204 · level: unit · module: MOD-sample",                                               // 16
  "// guards: A SAMPLE REQUIREMENT",                                                             // 17
  "// given: a precondition",                                                                    // 18
  "// input: an input",                                                                          // 19
  "// expect:",                                                                                  // 20
  "",                                                                                            // 21
  "// TST-205 · level: unit · module: MOD-sample",                                               // 22
  "// guards: A SAMPLE REQUIREMENT",                                                             // 23
  "// given: a precondition",                                                                    // 24
  "// input: an input",                                                                          // 25
  "// expect: an expected result",                                                               // 26
);

// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; UC-026 (step 6, cases without an expected result)
// given: RESULTS — a declaration with no `given`, one with no `input`, one with no `expect`, one whose `expect:` has nothing
//        after it, and a complete one; every other key given
// input: testFindings of each declaration, read by testDeclarations
// expect: exactly one finding for each of the first four, an error under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS that
//         names the declaration and the line of its first line — TST-201 on line 1, TST-202 on 6, TST-203 on 11, TST-204 on
//         16 — and says which is missing: the precondition, the input, the expected result, the expected result; none for
//         TST-205
test("testFindings — a missing precondition, input or expected result is an error under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS", () => {
  const found = findingsIn(RESULTS);
  assert.deepEqual(found.map(summary), [
    `TST-201:1: error [${EXPECTED_RESULT}]`,
    `TST-202:6: error [${EXPECTED_RESULT}]`,
    `TST-203:11: error [${EXPECTED_RESULT}]`,
    `TST-204:16: error [${EXPECTED_RESULT}]`,
  ]);
  assert.match(found[0].what, /precondition|given/i, "TST-201: the precondition is missing");
  assert.match(found[1].what, /input/i, "TST-202: the input is missing");
  assert.match(found[2].what, /expect/i, "TST-203: the expected result is missing");
  assert.match(found[3].what, /expect/i, "TST-204: the expected result is missing");
  assertWellFormed(found);
});

// ---------------------------------------------------------------- a test that guards nothing or names no module, or a module that is system
//
// The numbers are the lines of ORIGINS.

const ORIGINS = lines(
  "// TST-301 · level: unit · module: MOD-sample",                                               //  1
  "// given: a precondition",                                                                    //  2
  "// input: an input",                                                                          //  3
  "// expect: an expected result",                                                               //  4
  "",                                                                                            //  5
  "// TST-302 · level: unit · module: MOD-sample",                                               //  6
  "// guards:",                                                                                  //  7
  "// given: a precondition",                                                                    //  8
  "// input: an input",                                                                          //  9
  "// expect: an expected result",                                                               // 10
  "",                                                                                            // 11
  "// TST-303 · level: unit",                                                                    // 12
  "// guards: A SAMPLE REQUIREMENT",                                                             // 13
  "// given: a precondition",                                                                    // 14
  "// input: an input",                                                                          // 15
  "// expect: an expected result",                                                               // 16
  "",                                                                                            // 17
  "// TST-304 · level: unit · module: system",                                                   // 18
  "// guards: A SAMPLE REQUIREMENT",                                                             // 19
  "// given: a precondition",                                                                    // 20
  "// input: an input",                                                                          // 21
  "// expect: an expected result",                                                               // 22
  "",                                                                                            // 23
  "// TST-305 · level: component · module: system",                                              // 24
  "// guards: A SAMPLE REQUIREMENT",                                                             // 25
  "// given: a precondition",                                                                    // 26
  "// input: an input",                                                                          // 27
  "// expect: an expected result",                                                               // 28
);

// guards: EVERY ARTIFACT NAMES ITS ORIGIN; UC-026 (step 6, cases that guard nothing)
// given: ORIGINS — a declaration with no `guards` key, one whose `guards:` has nothing after it, one with no `module` key, one
//        of level unit that names the module system, and one of level component that names system; every other key given.
//        Then the declarations that name system or a module as they fit: level system, release and user with the module
//        system, level unit and component with a module
// input: testFindings of each declaration, read by testDeclarations
// expect: exactly one finding for each of the five, an error under EVERY ARTIFACT NAMES ITS ORIGIN that names the declaration
//         and the line of its first line — TST-301 on line 1, TST-302 on 6, TST-303 on 12, TST-304 on 18, TST-305 on 24 — and
//         says that the test guards nothing, guards nothing, names no module, names system, names system; none for the
//         declarations that fit
test("testFindings — a test that guards nothing, names no module, or names system at level unit or component is an error under EVERY ARTIFACT NAMES ITS ORIGIN", () => {
  const found = findingsIn(ORIGINS);
  assert.deepEqual(found.map(summary), [
    `TST-301:1: error [${ORIGIN}]`,
    `TST-302:6: error [${ORIGIN}]`,
    `TST-303:12: error [${ORIGIN}]`,
    `TST-304:18: error [${ORIGIN}]`,
    `TST-305:24: error [${ORIGIN}]`,
  ]);
  assert.match(found[0].what, /guard/i, "TST-301: it guards nothing");
  assert.match(found[1].what, /guard/i, "TST-302: it guards nothing");
  assert.match(found[2].what, /module/i, "TST-303: it names no module");
  assert.match(found[3].what, /system/i, "TST-304: it names system");
  assert.match(found[4].what, /system/i, "TST-305: it names system");
  assertWellFormed(found);
  // The same reading lets the declarations that fit pass: system names system at any level that exercises the whole product.
  for (const [level, module] of [["system", "system"], ["release", "system"], ["user", "system"], ["unit", "MOD-sample"], ["component", "MOD-sample"]]) {
    assert.deepEqual(findingsIn(declared("TST-310", { ...COMPLETE, level, module })), [], `${level} ${module}`);
  }
});

// ---------------------------------------------------------------- phrasings without runs, or fewer than two runs
//
// The numbers are the lines of RATES.

const RATES = lines(
  "// TST-401 · level: unit · module: MOD-sample",                                               //  1
  "// guards: A SAMPLE REQUIREMENT",                                                             //  2
  "// given: a model that answers one question",                                                 //  3
  "// input: the question, in three phrasings",                                                  //  4
  "// expect: the model gives the right answer",                                                 //  5
  "// phrasings: 3",                                                                             //  6
  "",                                                                                            //  7
  "// TST-402 · level: unit · module: MOD-sample",                                               //  8
  "// guards: A SAMPLE REQUIREMENT",                                                             //  9
  "// given: a model that answers one question",                                                 // 10
  "// input: the question, in three phrasings",                                                  // 11
  "// expect: the model gives the right answer",                                                 // 12
  "// runs: 1",                                                                                  // 13
  "// phrasings: 3",                                                                             // 14
  "",                                                                                            // 15
  "// TST-403 · level: unit · module: MOD-sample",                                               // 16
  "// guards: A SAMPLE REQUIREMENT",                                                             // 17
  "// given: a model that answers one question",                                                 // 18
  "// input: the question",                                                                      // 19
  "// expect: the model gives the right answer",                                                 // 20
  "// runs: 1",                                                                                  // 21
  "",                                                                                            // 22
  "// TST-404 · level: unit · module: MOD-sample",                                               // 23
  "// guards: A SAMPLE REQUIREMENT",                                                             // 24
  "// given: a model that answers one question",                                                 // 25
  "// input: the question, in three phrasings",                                                  // 26
  "// expect: the model gives the right answer",                                                 // 27
  "// runs: 0",                                                                                  // 28
  "// phrasings: 3",                                                                             // 29
);

// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-026 (step 6, model-dependent cases judged on a single run)
// given: RATES — a declaration with `phrasings: 3` and no `runs`; one with `phrasings: 3` and `runs: 1`; one with `runs: 1` and
//        no phrasings; one with `phrasings: 3` and `runs: 0`; every other key given. Then the declarations that fit: `runs: 2`
//        with `phrasings: 3`, `runs: 5` with `phrasings: 4`, and one with neither, an ordinary test
// input: testFindings of each declaration, read by testDeclarations
// expect: exactly one finding for each of the four, an error under A MODEL-DEPENDENT TEST IS MEASURED AS A RATE that names the
//         declaration and the line of its first line — TST-401 on line 1, TST-402 on 8, TST-403 on 16, TST-404 on 23 — and
//         says something of the runs; none for the declarations that fit, two runs being enough and no runs being no fault
//         in a test that does not depend on a model
test("testFindings — phrasings without runs, or fewer than two runs, is an error under A MODEL-DEPENDENT TEST IS MEASURED AS A RATE", () => {
  const found = findingsIn(RATES);
  assert.deepEqual(found.map(summary), [
    `TST-401:1: error [${RATE}]`,
    `TST-402:8: error [${RATE}]`,
    `TST-403:16: error [${RATE}]`,
    `TST-404:23: error [${RATE}]`,
  ]);
  for (const f of found) assert.match(f.what, /runs/i, `${f.artifact}: it says something of the runs`);
  assertWellFormed(found);
  // The same reading lets the declarations that fit pass.
  for (const [runs, phrasings] of [[2, 3], [5, 4], [undefined, undefined]]) {
    assert.deepEqual(findingsIn(declared("TST-410", { ...COMPLETE, runs, phrasings })), [], `runs ${runs}, phrasings ${phrasings}`);
  }
});

// ---------------------------------------------------------------- a complete declaration
//
// The numbers are the lines of FULL.

const FULL = lines(
  "// TST-501 · level: unit · module: MOD-sample",                                               //  1
  "// guards: A SAMPLE REQUIREMENT; UC-900",                                                     //  2
  "// given: a precondition",                                                                    //  3
  "// input: an input",                                                                          //  4
  "// expect: an expected result",                                                               //  5
  "",                                                                                            //  6
  "// TST-502 · level: component · module: MOD-sample",                                          //  7
  "// guards: A SAMPLE REQUIREMENT",                                                             //  8
  "// given: a model that answers one question",                                                 //  9
  "// input: the question, in three phrasings, three times each",                                // 10
  "// expect: a pass rate of at least two in three",                                             // 11
  "// runs: 3",                                                                                  // 12
  "// phrasings: 3",                                                                             // 13
  "// paid: a sample service",                                                                   // 14
  "",                                                                                            // 15
  "// TST-503 · level: release · module: system",                                                // 16
  "// guards: A SAMPLE REQUIREMENT",                                                             // 17
  "// given: a release candidate",                                                               // 18
  "// input: its main flow",                                                                     // 19
  "// expect: every step works",                                                                 // 20
);
// A manual test of level user, under a heading of a Markdown file.
const MANUAL = lines(
  "# Manual tests",                                                                              //  1
  "",                                                                                            //  2
  "### TST-504 A sample manual test",                                                            //  3
  "level: user",                                                                                 //  4
  "module: system",                                                                              //  5
  "guards: A SAMPLE REQUIREMENT",                                                                //  6
  "given: a person with the release candidate",                                                  //  7
  "input: the person walks the main flow",                                                       //  8
  "expect: the person records that every step worked",                                           //  9
);

// guards: EVERY TEST HAS ONE LEVEL; A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; EVERY ARTIFACT NAMES ITS ORIGIN; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-026
// given: FULL — a unit test with a level, a module, two guards and its precondition, input and expected result; a component
//        test that depends on a model, with also runs 3, phrasings 3 and a paid service; a release test of the module system —,
//        and MANUAL, a manual test of level user under a heading of a Markdown file
// input: testFindings of each declaration, read by testDeclarations; and, to show that the same reading finds a fault in this
//        file, the same with the expected result of TST-501 taken out
// expect: no finding for FULL or MANUAL; for the file without that line exactly one, an error under A TEST STATES ITS EXPECTED
//         RESULT BEFORE IT RUNS on TST-501, line 1
test("testFindings — a complete declaration has no finding", () => {
  // Known positive: the same reading finds the one fault planted in a copy.
  const planted = FULL.replace("// expect: an expected result\n", "");
  assert.notEqual(planted, FULL);
  assert.deepEqual(findingsIn(planted).map(summary), [`TST-501:1: error [${EXPECTED_RESULT}]`]);
  assert.deepEqual(findingsIn(FULL), []);
  assert.deepEqual(findingsIn(MANUAL, "tests/manual-tests.md"), []);
});
