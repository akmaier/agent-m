// The findings of a test declaration (docs/architecture/MOD-test-document.md, Interfaces: testFindings). ITM-304 builds it;
// index.mjs offers it as testFindings.
//
// Module: MOD-test-document
//
// Pure: it reads only the declaration it is given, keeps nothing, performs no input or output. Each finding is an error, made
// with MOD-text-tools' finding; it names the declaration by its identifier and the line of its first line, and says in one
// line what is wrong and what correction is expected. Where the module file leaves a reading open, this file states the
// reading it takes:
//
//   - A key that testDeclarations reads as null, and one with nothing after its colon, which it reads as an empty text, are
//     both missing.
//   - A declaration missing its precondition, its input and its expected result has three findings, one for each.
//   - A test guards nothing when `guards` is null or empty. It names the word `system` as its module wrongly only at level
//     unit or component; at any other level the word is the module of a test that exercises the whole product.
//   - "fewer than two runs" holds of every test that declares `runs`, with phrasings or without, since `runs` is a key of a
//     test whose outcome depends on a model's answer. A test that declares phrasings and no runs is the other fault, and a test
//     that declares neither does not depend on a model, so it has no runs to count.

import { kindOfIdentifier } from "../identifiers/index.mjs";
import { finding } from "../text-tools/index.mjs";

const ONE_LEVEL = "EVERY TEST HAS ONE LEVEL";
const EXPECTED_RESULT = "A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS";
const ORIGIN = "EVERY ARTIFACT NAMES ITS ORIGIN";
const RATE = "A MODEL-DEPENDENT TEST IS MEASURED AS A RATE";
const REFERENCE = "A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION";

const LEVELS = ["unit", "component", "system", "release", "user"];
const MINIMUM_RUNS = 2;

// Whether a key is left out: it is missing, or has nothing after its colon.
const left = (value) => value === null || value === undefined || String(value).trim() === "";
// Whether a key that holds a number is there: a key that is missing reads null.
const given = (value) => value !== null && value !== undefined;

// testFindings(declaration: TestDeclaration) -> Finding[] — an error under EVERY TEST HAS ONE LEVEL for a missing or unknown
// level; under A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS for a missing precondition, input or expected result; under
// EVERY ARTIFACT NAMES ITS ORIGIN for a test that guards nothing or names no module, or a test of level unit or component that
// names system; under A MODEL-DEPENDENT TEST IS MEASURED AS A RATE for a test with phrasings and no runs, or with fewer than
// two runs; under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION for each guards entry that is neither a requirement's name nor a use case's identifier.
// Each finding names the declaration and its line.
export function testFindings(declaration) {
  const d = declaration;
  const found = [];
  const add = (rule, what, fix) => found.push(finding({ artifact: d.id, line: d.line, kind: "error", rule, what, fix }));

  if (left(d.level)) {
    add(ONE_LEVEL, "no level", `name one level in a line level: ${LEVELS.join(", ")}`);
  } else if (!LEVELS.includes(d.level)) {
    add(ONE_LEVEL, `the level "${d.level}" is not one of ${LEVELS.join(", ")}`, "write exactly one of them after level: in its line");
  }

  for (const [key, value, noun] of [["given", d.given, "precondition"], ["input", d.input, "input"], ["expect", d.expect, "expected result"]]) {
    if (left(value)) add(EXPECTED_RESULT, `no ${noun}`, `add a line ${key}: that states the ${noun}`);
  }

  if (!d.guards || d.guards.length === 0) {
    add(ORIGIN, "the test guards nothing",
      "name what it guards in a line guards:, separated by ; — requirements by their names, use cases as UC-<nnn>");
  }
  // A guards entry is a requirement's name or a use case's identifier (MOD-identifiers' scheme), and nothing else: a use case written with its step is none.
  for (const entry of d.guards ?? []) {
    const kind = kindOfIdentifier(entry);
    if (kind !== "requirement" && kind !== "UC") {
      add(REFERENCE, `the guards entry "${entry}" is neither a requirement's name nor a use case's identifier`,
        "write the requirement's name, or the use case as UC-<nnn> without its step, and nothing else");
    }
  }
  if (left(d.module)) {
    add(ORIGIN, "the test names no module",
      "name the module it exercises in a line module: MOD-<slug>, or system for a test of level system, release or user");
  } else if (d.module === "system" && (d.level === "unit" || d.level === "component")) {
    add(ORIGIN, `a test of level ${d.level} names system, not a module`,
      "name the module it exercises in a line module: MOD-<slug>");
  }

  if (given(d.phrasings) && !given(d.runs)) {
    add(RATE, "the test has phrasings but no runs",
      `fix the number of runs, at least ${MINIMUM_RUNS}, in a line runs: before the first run`);
  } else if (given(d.runs) && !(d.runs >= MINIMUM_RUNS)) {
    add(RATE, `runs is ${d.runs}, fewer than the ${MINIMUM_RUNS} a rate needs`,
      `fix at least ${MINIMUM_RUNS} runs in the line runs: before the first run`);
  }
  return found;
}
