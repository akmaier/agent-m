// namedPersonFindings of MOD-personal-data (ITM-838): the
// findings for a known person named in a generated artifact who is neither an account nor a consenting collaborator.
// Run: node --test tests/personal-data-checkers-and-consent.test.mjs
//
// Module: MOD-personal-data
// Guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// Level: unit
//
// Every participant, model, place, name and account is constructed. Readings the module file leaves open, which the tests state:
//   - The wording of `missing` is open: the tests assert that it is a non-empty string and that no `checkers` key is given.
//   - The wording of a finding's `what` and `fix` is open: the tests assert artifact, line, kind and rule only.
//   - Three checkers are the first three eligible participants, in the order given, that differ from each other.
//   - A name passes as an account when it equals an account of `accounts`, whatever its case and with or without a leading `@`.
//   - A collaborator's name passes when a row of the collaborators document has that Name (whatever its case).
//   - Every occurrence of a known name in the text is a finding of its own.

import test from "node:test";
import assert from "node:assert/strict";
import * as personal from "../src/personal-data/index.mjs";

const RULE = "A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT";
const PLACES = ["campus", "eu-cloud"];
const participant = (name, model, place = "campus", capabilities = ["draft text"]) => ({
  name, type: "model endpoint", model, context: 8000, price: null, capabilities, place, route: "endpoint",
});
const REWRITER = participant("rewriter", "model-r");
const names = (result) => result.checkers.map((p) => p.name);
const people = (given = {}) => ({ names: [], addresses: [], phones: [], accounts: [], ...given });
const collaborators = (...rows) => ({ sections: [{ rows: rows.map(([Name, Account]) => ({ cells: { Name, Account, Agreed: "yes" } })) }] });

// TST-838009 · level: unit · module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the known person "Ada Example"; a text of two lines whose second line names her; no collaborators; no accounts
// input: namedPersonFindings of the text, the artifact "UC-900", the known person, null and []
// expect: one finding: artifact UC-900, line 2, kind error, rule A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
test("namedPersonFindings — a known name in a text gives one error naming the artifact and the line", () => {
  const found = personal.namedPersonFindings("Intro line.\nWrite to Ada Example today.\n", "UC-900", people({ names: ["Ada Example"] }), null, []);
  assert.equal(found.length, 1);
  assert.deepEqual({ artifact: found[0].artifact, line: found[0].line, kind: found[0].kind, rule: found[0].rule }, { artifact: "UC-900", line: 2, kind: "error", rule: RULE });
});

// TST-838010 · level: unit · module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the same text; the collaborators document holds "Ada Example", who agreed, and "Bob Sample" who is not in the text
// input: namedPersonFindings with the known person Ada Example and that document; then the same with a document that holds only Bob Sample
// expect: none for the first; one finding on line 1 for the second
test("namedPersonFindings — a collaborator who agreed passes; one who is not a collaborator does not", () => {
  const text = "Ada Example wrote this.\n";
  const known = people({ names: ["Ada Example"] });
  assert.deepEqual(personal.namedPersonFindings(text, "UC-900", known, collaborators(["Ada Example", "ada-example"], ["Bob Sample", "bob-sample"]), []), []);
  const other = personal.namedPersonFindings(text, "UC-900", known, collaborators(["Bob Sample", "bob-sample"]), []);
  assert.deepEqual(other.map((f) => [f.artifact, f.line, f.kind]), [["UC-900", 1, "error"]]);
});

// TST-838011 · level: unit · module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the known name "ada-example" in a text; the accounts of the server are ["ada-example"]
// input: namedPersonFindings with those accounts; then with the accounts ["someone-else"]
// expect: none for the first; one finding on line 1 for the second
test("namedPersonFindings — a name that is an account passes; the same name with no such account does not", () => {
  const text = "Thanks to ada-example for this.\n";
  const known = people({ names: ["ada-example"] });
  assert.deepEqual(personal.namedPersonFindings(text, "UC-900", known, null, ["ada-example"]), []);
  assert.deepEqual(personal.namedPersonFindings(text, "UC-900", known, null, ["someone-else"]).map((f) => f.line), [1]);
});

// TST-838012 · level: unit · module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the known person "Ada Example"; a text that does not contain the name
// input: namedPersonFindings of the text
// expect: no finding
test("namedPersonFindings — a text without a known name gives none", () => {
  assert.deepEqual(personal.namedPersonFindings("Nothing about anyone here.\n", "UC-900", people({ names: ["Ada Example"] }), null, []), []);
});

// TST-838013 · level: unit · module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the collaborators document holds "Ada Example" with Agreed "no", "Bob Sample" with Agreed empty, and "Cy Invented" with Agreed "yes"
// input: namedPersonFindings of a text naming all three on lines 1 to 3, the three as known names
// expect: findings on lines 1 and 2 only; Cy Invented, who agreed, passes
test("namedPersonFindings — a collaborator row whose Agreed is not yes does not let the name pass", () => {
  const row = (Name, Agreed) => ({ cells: { Name, Account: "x", Agreed } });
  const document = { sections: [{ rows: [row("Ada Example", "no"), row("Bob Sample", ""), row("Cy Invented", "yes")] }] };
  const found = personal.namedPersonFindings("Ada Example\nBob Sample\nCy Invented\n", "UC-900", people({ names: ["Ada Example", "Bob Sample", "Cy Invented"] }), document, []);
  assert.deepEqual(found.map((f) => f.line), [1, 2]);
});
