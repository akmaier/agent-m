// The declarations of the tests (ITM-248) — MOD-test-document's TestDeclaration and testDeclarations, as
// docs/architecture/MOD-test-document.md states them: every test declaration of a test file, in the comment marker of
// its language or, for a test of level user, under a heading `### TST-<nnn>` of a Markdown file, with its identifier,
// level, module, what it guards, its precondition, input and expected result, and its runs, phrasings and paid service
// where it has them; a missing key read as null. testFindings is not part of this item.
// Run: node --test tests/test-document-declarations.test.mjs
//
// Module: MOD-test-document
// Guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-013
// Level: unit
//
// Every text read here is a fixture test file written out below; no file of this repository is read (MOD-test-document
// "reads and writes no file; its callers give it the texts of test files", its module file's Files). The expected
// declarations are read from the module file's Data and Interfaces: a declaration's first line names its identifier,
// alone or followed by one or more `key: value` fields separated by ` · ` (the same separator `*Check:* ` uses for
// several paths, docs/architecture/MOD-spec-document.md); each line after it is one or more `key: value` fields the same
// way; it ends at the first line not of that form, and scanning then looks for the next declaration from that line on.
// A missing key reads as null — `guards` included, since nothing in the module file exempts it from the rule. Each test
// names the requirement it guards and states its input and expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testDeclarations } from "../src/test-document/index.mjs";

// A text of these lines, each ended by a line feed.
const lines = (...ls) => ls.map((l) => `${l}\n`).join("");

const PATH = "fixture/test-document.test.mjs";

// ---------------------------------------------------------------- one declaration in each comment marker, every key

// `//`: the identifier, level and module packed on the first line as the module file's own example shows, every other
// key its own line. The numbers are the lines of SLASH_FIXTURE.
const SLASH_FIXTURE = lines(
  "import test from \"node:test\";",                                                      //  1
  "",                                                                                      //  2
  "// TST-014 · level: unit · module: MOD-text-tools",                                     //  3
  "// guards: A FINDING READS LIKE A COMPILER MESSAGE",                                     //  4
  "// given: a finding of kind error on line 4 of UC-007",                                  //  5
  "// input: the finding formatted as text",                                                //  6
  "// expect: \"UC-007:4: error: text [A FINDING READS LIKE A COMPILER MESSAGE]\"",          //  7
  "// runs: 3",                                                                             //  8
  "// phrasings: 2",                                                                        //  9
  "// paid: openai",                                                                        // 10
  "test(\"a finding formatted as text\", () => {});",                                       // 11
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: SLASH_FIXTURE — a `//` declaration with its identifier, level and module packed on the first line at ` · `,
//        every other key one per line, directly before the test case it declares
// input: testDeclarations(PATH, SLASH_FIXTURE)
// expect: one declaration, at line 3, every key read: id "TST-014", level "unit", module "MOD-text-tools", guards one
//         name, given/input/expect as written, runs 3, phrasings 2, paid "openai", path PATH
test("testDeclarations — a // declaration, identifier/level/module packed on its first line, every key read", () => {
  assert.deepEqual(testDeclarations(PATH, SLASH_FIXTURE), [{
    id: "TST-014",
    level: "unit",
    module: "MOD-text-tools",
    guards: ["A FINDING READS LIKE A COMPILER MESSAGE"],
    given: "a finding of kind error on line 4 of UC-007",
    input: "the finding formatted as text",
    expect: "\"UC-007:4: error: text [A FINDING READS LIKE A COMPILER MESSAGE]\"",
    runs: 3,
    phrasings: 2,
    paid: "openai",
    path: PATH,
    line: 3,
  }]);
});

// `#`: the identifier alone on its first line, level and module each their own following line, two names in guards
// split at `;`. The numbers are the lines of HASH_FIXTURE.
const HASH_FIXTURE = lines(
  "def test_something():",                                                                 //  1
  "    # TST-101",                                                                         //  2
  "    # level: component",                                                                //  3
  "    # module: MOD-foo",                                                                 //  4
  "    # guards: FIXTURE REQUIREMENT ONE; FIXTURE REQUIREMENT TWO",                        //  5
  "    # given: two requirements guarded at once",                                          //  6
  "    # input: a value",                                                                   //  7
  "    # expect: both are read, trimmed, as a list of two",                                 //  8
  "    # runs: 1",                                                                          //  9
  "    # phrasings: 1",                                                                     // 10
  "    # paid: anthropic",                                                                  // 11
  "    assert True",                                                                        // 12
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: HASH_FIXTURE — a `#` declaration with its identifier alone on the first line, level and module each their own
//        line, and two names in guards separated by `;`
// input: testDeclarations(PATH, HASH_FIXTURE)
// expect: one declaration, at line 2, guards the two names split and trimmed, every other key as written
test("testDeclarations — a # declaration, identifier alone on its first line, guards split at `;`", () => {
  assert.deepEqual(testDeclarations(PATH, HASH_FIXTURE), [{
    id: "TST-101",
    level: "component",
    module: "MOD-foo",
    guards: ["FIXTURE REQUIREMENT ONE", "FIXTURE REQUIREMENT TWO"],
    given: "two requirements guarded at once",
    input: "a value",
    expect: "both are read, trimmed, as a list of two",
    runs: 1,
    phrasings: 1,
    paid: "anthropic",
    path: PATH,
    line: 2,
  }]);
});

// `--`: module the word "system", a level-system test whose guards names a use case by identifier. The numbers are the
// lines of DASH_FIXTURE.
const DASH_FIXTURE = lines(
  "-- TST-205 · level: system · module: system",                                           //  1
  "-- guards: UC-099",                                                                      //  2
  "-- given: a seeded database",                                                            //  3
  "-- input: the query",                                                                    //  4
  "-- expect: one row",                                                                      //  5
  "-- runs: 1",                                                                              //  6
  "-- phrasings: 1",                                                                         //  7
  "-- paid: none",                                                                           //  8
  "SELECT 1;",                                                                               //  9
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: DASH_FIXTURE — a `--` declaration whose module names "system", the word a test of level system, release or
//        user that exercises the whole product uses, and whose guards names a use case by identifier, not a
//        requirement
// input: testDeclarations(PATH, DASH_FIXTURE)
// expect: one declaration, at line 1, module "system", guards ["UC-099"], every other key as written
test("testDeclarations — a -- declaration whose module is the word \"system\"", () => {
  assert.deepEqual(testDeclarations(PATH, DASH_FIXTURE), [{
    id: "TST-205",
    level: "system",
    module: "system",
    guards: ["UC-099"],
    given: "a seeded database",
    input: "the query",
    expect: "one row",
    runs: 1,
    phrasings: 1,
    paid: "none",
    path: PATH,
    line: 1,
  }]);
});

// `;`: the marker of a Lisp-like language. The numbers are the lines of SEMI_FIXTURE.
const SEMI_FIXTURE = lines(
  "; TST-310 · level: unit · module: MOD-bar",                                              //  1
  "; guards: FIXTURE REQUIREMENT THREE",                                                     //  2
  "; given: a register set to zero",                                                         //  3
  "; input: INC",                                                                            //  4
  "; expect: the register is 1",                                                             //  5
  "; runs: 1",                                                                               //  6
  "; phrasings: 1",                                                                          //  7
  "; paid: none",                                                                             //  8
  "(test-inc)",                                                                              //  9
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: SEMI_FIXTURE — a `;` declaration
// input: testDeclarations(PATH, SEMI_FIXTURE)
// expect: one declaration, at line 1, every key read
test("testDeclarations — a ; declaration", () => {
  assert.deepEqual(testDeclarations(PATH, SEMI_FIXTURE), [{
    id: "TST-310",
    level: "unit",
    module: "MOD-bar",
    guards: ["FIXTURE REQUIREMENT THREE"],
    given: "a register set to zero",
    input: "INC",
    expect: "the register is 1",
    runs: 1,
    phrasings: 1,
    paid: "none",
    path: PATH,
    line: 1,
  }]);
});

// ` *`: a line inside a block comment, indented under its opening `/**`. The numbers are the lines of BLOCK_FIXTURE.
const BLOCK_FIXTURE = lines(
  "/**",                                                                                     //  1
  " * TST-420 · level: component · module: MOD-baz",                                         //  2
  " * guards: FIXTURE REQUIREMENT FOUR",                                                     //  3
  " * given: a component mounted",                                                           //  4
  " * input: a click",                                                                        //  5
  " * expect: it re-renders",                                                                 //  6
  " * runs: 1",                                                                               //  7
  " * phrasings: 1",                                                                          //  8
  " * paid: none",                                                                            //  9
  " */",                                                                                       // 10
  "test(\"click\", () => {});",                                                               // 11
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: BLOCK_FIXTURE — a declaration inside a block comment, its lines marked ` *`; `/**` names no declaration, and
//        `*/` ends it exactly where its last key: value line does
// input: testDeclarations(PATH, BLOCK_FIXTURE)
// expect: one declaration, at line 2 (not line 1, which is `/**`, not a declaration line), every key read
test("testDeclarations — a declaration inside a block comment, marked ` *`", () => {
  assert.deepEqual(testDeclarations(PATH, BLOCK_FIXTURE), [{
    id: "TST-420",
    level: "component",
    module: "MOD-baz",
    guards: ["FIXTURE REQUIREMENT FOUR"],
    given: "a component mounted",
    input: "a click",
    expect: "it re-renders",
    runs: 1,
    phrasings: 1,
    paid: "none",
    path: PATH,
    line: 2,
  }]);
});

// A manual test of level `user`: the same lines, without a comment marker, directly under a Markdown heading
// `### TST-<nnn> <title>`. The numbers are the lines of HEADING_FIXTURE.
const HEADING_FIXTURE = lines(
  "# Manual tests",                                                                          //  1
  "",                                                                                         //  2
  "### TST-500 A user signs in with a wrong password",                                        //  3
  "level: user",                                                                              //  4
  "module: system",                                                                           //  5
  "guards: FIXTURE REQUIREMENT FIVE",                                                         //  6
  "given: a registered user on the sign-in page",                                              //  7
  "input: the correct email with a wrong password",                                            //  8
  "expect: the page shows \"wrong email or password\" and does not sign in",                    //  9
  "runs: 1",                                                                                    // 10
  "phrasings: 1",                                                                               // 11
  "paid: none",                                                                                 // 12
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: HEADING_FIXTURE — a manual test's declaration under a Markdown heading `### TST-500 <title>`, its title text
//        after the identifier not a field, its following lines the same key: value form without a marker
// input: testDeclarations(PATH, HEADING_FIXTURE)
// expect: one declaration, at line 3, every key read, the heading's title text held nowhere in it
test("testDeclarations — a manual test's declaration under a Markdown heading", () => {
  assert.deepEqual(testDeclarations(PATH, HEADING_FIXTURE), [{
    id: "TST-500",
    level: "user",
    module: "system",
    guards: ["FIXTURE REQUIREMENT FIVE"],
    given: "a registered user on the sign-in page",
    input: "the correct email with a wrong password",
    expect: "the page shows \"wrong email or password\" and does not sign in",
    runs: 1,
    phrasings: 1,
    paid: "none",
    path: PATH,
    line: 3,
  }]);
});

// ---------------------------------------------------------------- a missing key read as null

// A declaration missing guards and input — a required key either side of the ones it has — and missing runs, phrasings
// and paid, the three that are not always required. The numbers are the lines of PARTIAL_FIXTURE.
const PARTIAL_FIXTURE = lines(
  "// TST-777 · level: unit · module: MOD-foo",                                              //  1
  "// given: a value",                                                                        //  2
  "// expect: the result",                                                                    //  3
  "test(\"partial\", () => {});",                                                             //  4
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: PARTIAL_FIXTURE — a declaration without guards or input, and without runs, phrasings or paid
// input: testDeclarations(PATH, PARTIAL_FIXTURE)
// expect: one declaration with every missing key null — guards included — and level, module, given and expect as
//         written; nothing guessed
test("testDeclarations — a declaration missing a key is read with that key null", () => {
  assert.deepEqual(testDeclarations(PATH, PARTIAL_FIXTURE), [{
    id: "TST-777",
    level: "unit",
    module: "MOD-foo",
    guards: null,
    given: "a value",
    input: null,
    expect: "the result",
    runs: null,
    phrasings: null,
    paid: null,
    path: PATH,
    line: 1,
  }]);
});

// ---------------------------------------------------------------- a declaration ends at the first line not of its form

// Three declarations: the second starts on the very line that ends the first (no line stands between them at all), and
// the third follows a blank line after a line of code ends the second. The numbers are the lines of MULTIPLE_FIXTURE.
const MULTIPLE_FIXTURE = lines(
  "// TST-001 · level: unit · module: MOD-a",                                                //  1
  "// guards: FIXTURE REQUIREMENT ONE",                                                       //  2
  "// given: one",                                                                             //  3
  "// input: one",                                                                             //  4
  "// expect: one",                                                                            //  5
  "// TST-002 · level: unit · module: MOD-b",                                                 //  6
  "// guards: FIXTURE REQUIREMENT TWO",                                                        //  7
  "// given: two",                                                                             //  8
  "// input: two",                                                                             //  9
  "// expect: two",                                                                            // 10
  "test(\"second\", () => {});",                                                               // 11
  "",                                                                                           // 12
  "// TST-003 · level: unit · module: MOD-c",                                                 // 13
  "// guards: FIXTURE REQUIREMENT THREE",                                                      // 14
  "// given: three",                                                                            // 15
  "// input: three",                                                                            // 16
  "// expect: three",                                                                           // 17
  "test(\"third\", () => {});",                                                                 // 18
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-013
// given: MULTIPLE_FIXTURE — TST-001 ends exactly on the line TST-002 begins, with nothing of TST-001 in TST-002 or the
//        reverse; TST-002 ends at the code line `test("second", …)`; TST-003 follows a blank line and ends at
//        `test("third", …)`
// input: testDeclarations(PATH, MULTIPLE_FIXTURE)
// expect: three declarations, in order, at lines 1, 6 and 13, each exactly its own five keys — none of a neighbour's
//         fields, none of the code or the blank line read as a key
test("testDeclarations — a declaration ends at the first line not of its form; the next is still found", () => {
  const base = { level: "unit", runs: null, phrasings: null, paid: null, path: PATH };
  assert.deepEqual(testDeclarations(PATH, MULTIPLE_FIXTURE), [
    { ...base, id: "TST-001", module: "MOD-a", guards: ["FIXTURE REQUIREMENT ONE"],
      given: "one", input: "one", expect: "one", line: 1 },
    { ...base, id: "TST-002", module: "MOD-b", guards: ["FIXTURE REQUIREMENT TWO"],
      given: "two", input: "two", expect: "two", line: 6 },
    { ...base, id: "TST-003", module: "MOD-c", guards: ["FIXTURE REQUIREMENT THREE"],
      given: "three", input: "three", expect: "three", line: 13 },
  ]);
});

// ---------------------------------------------------------------- a file without a declaration

const NO_DECLARATION_FIXTURE = lines(
  "// an ordinary comment, not a declaration",                                                //  1
  "function helper() { return 1; }",                                                           //  2
  "test(\"uses the helper\", () => { assert.equal(helper(), 1); });",                           //  3
);

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: NO_DECLARATION_FIXTURE — an ordinary comment that names no identifier, a function and a test case, nothing in
//        the form of a declaration
// input: testDeclarations(PATH, NO_DECLARATION_FIXTURE)
// expect: no declaration; the caller decides whether that is a gap
test("testDeclarations — a file without a declaration yields none", () => {
  assert.deepEqual(testDeclarations(PATH, NO_DECLARATION_FIXTURE), []);
});
