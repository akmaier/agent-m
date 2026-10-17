// checkersFor and namedPersonFindings of MOD-personal-data (ITM-838): the three participants that check a rewritten text, and the
// findings for a known person named in a generated artifact who is neither an account nor a consenting collaborator.
// Run: node --test tests/personal-data-checkers-and-consent.test.mjs
//
// Module: MOD-personal-data
// Guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS; NO CHECKER IS THE REWRITER; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
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

// TST-838001 · level: unit · module: MOD-personal-data
// guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: the rewriter (model-r) and three participants at allowed places that draft text, with the models model-a, model-b and model-c
// input: checkersFor of the four, the rewriter, and the places campus and eu-cloud
// expect: { checkers } holds exactly the three, c-a, c-b and c-c, in that order, and no missing
test("checkersFor — three eligible participants with three other models are chosen", () => {
  const result = personal.checkersFor([REWRITER, participant("c-a", "model-a"), participant("c-b", "model-b", "eu-cloud"), participant("c-c", "model-c")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
  assert.equal("missing" in result, false);
});

// TST-838002 · level: unit · module: MOD-personal-data
// guards: NO CHECKER IS THE REWRITER
// given: the rewriter, and four others: c-a, c-b, c-c and c-d with four models
// input: checkersFor of the five including the rewriter first
// expect: the checkers are c-a, c-b and c-c; "rewriter" is not among them
test("checkersFor — the rewriter is never a checker, though it is in the set and eligible itself", () => {
  const result = personal.checkersFor([REWRITER, participant("c-a", "model-a"), participant("c-b", "model-b"), participant("c-c", "model-c"), participant("c-d", "model-d")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
});

// TST-838003 · level: unit · module: MOD-personal-data
// guards: NO CHECKER IS THE REWRITER
// given: the rewriter (model-r) and c-twin, another participant that uses model-r, then c-a, c-b, c-c with other models
// input: checkersFor of the five
// expect: the checkers are c-a, c-b and c-c; c-twin is not chosen
test("checkersFor — a participant that uses the rewriter's model is not chosen", () => {
  const result = personal.checkersFor([REWRITER, participant("c-twin", "model-r"), participant("c-a", "model-a"), participant("c-b", "model-b"), participant("c-c", "model-c")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
});

// TST-838004 · level: unit · module: MOD-personal-data
// guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: c-a and c-a2 both using model-a, then c-b (model-b), c-c (model-c)
// input: checkersFor of the four and the rewriter
// expect: the checkers are c-a, c-b and c-c; c-a2 is not chosen, since it shares c-a's model
test("checkersFor — two participants with one model give one checker", () => {
  const result = personal.checkersFor([participant("c-a", "model-a"), participant("c-a2", "model-a"), participant("c-b", "model-b"), participant("c-c", "model-c")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
});

// TST-838005 · level: unit · module: MOD-personal-data
// guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: only c-a (model-a), c-a2 (model-a) and c-b (model-b) besides the rewriter: two distinct models are left
// input: checkersFor of these and the rewriter
// expect: no checkers key; missing is a non-empty string
test("checkersFor — with fewer than three different models left, missing is given in a sentence", () => {
  const result = personal.checkersFor([REWRITER, participant("c-a", "model-a"), participant("c-a2", "model-a"), participant("c-b", "model-b")], REWRITER, PLACES);
  assert.equal("checkers" in result, false);
  assert.equal(typeof result.missing, "string");
  assert.notEqual(result.missing.trim(), "");
});

// TST-838006 · level: unit · module: MOD-personal-data
// guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: c-a, c-b at allowed places; c-far (model-far) at the place "abroad", which the mailbox does not allow; c-c (model-c) at campus
// input: checkersFor of the four with the places campus and eu-cloud
// expect: the checkers are c-a, c-b and c-c; c-far is not chosen
test("checkersFor — a participant at a place the mailbox does not allow is not chosen", () => {
  const result = personal.checkersFor([participant("c-a", "model-a"), participant("c-far", "model-far", "abroad"), participant("c-b", "model-b"), participant("c-c", "model-c")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
});

// TST-838007 · level: unit · module: MOD-personal-data
// guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: two participants at allowed places and a third, c-far, at "abroad"
// input: checkersFor of the three with the places campus and eu-cloud
// expect: no checkers key; missing is a non-empty string
test("checkersFor — when the third stands at a disallowed place, missing is given", () => {
  const result = personal.checkersFor([participant("c-a", "model-a"), participant("c-b", "model-b"), participant("c-far", "model-far", "abroad")], REWRITER, PLACES);
  assert.equal("checkers" in result, false);
  assert.equal(typeof result.missing, "string");
  assert.notEqual(result.missing.trim(), "");
});

// TST-838008 · level: unit · module: MOD-personal-data
// guards: A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: c-a, c-b, c-c at campus, with models a, b, c; c-tool has another model and the capability "use tools" but not "draft text"
// input: checkersFor of c-tool first, then the three
// expect: the checkers are c-a, c-b and c-c; c-tool, which does not work with a language model for text, is not chosen
test("checkersFor — a participant that cannot draft text is not chosen", () => {
  const result = personal.checkersFor([participant("c-tool", "model-t", "campus", ["use tools"]), participant("c-a", "model-a"), participant("c-b", "model-b"), participant("c-c", "model-c")], REWRITER, PLACES);
  assert.deepEqual(names(result), ["c-a", "c-b", "c-c"]);
});

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
