// privacyStrategies of MOD-personal-data (ITM-839): the recipe `report-data` and the check `people-search`.
// Run: node --test tests/personal-data-strategies.test.mjs
//
// Module: MOD-personal-data
// Guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
// Level: unit
//
// Every participant, person, address and text is constructed. Readings the module file leaves open, which the tests state:
//   - A recipe is called as `(context, params)` with `params` = `context.params`. The picked pieces are read from `params.pieces`
//     (`{ name, text }[]`), the participant that will receive the parts from `params.participant`, and the mail's people (People)
//     from `params.people`; the mailbox's allowed places are `context.places.mailbox`.
//   - A part's `name` is its piece's name and its `text` the piece's text as picked; the runner sets size, recipe and the rest.
//   - What `PlaceNotAllowed` carries beyond its name, and a finding's `artifact`, `what` and `fix`, are open: the tests assert
//     the error's name, and a finding's line, kind and rule.
//   - The check reads the text of a draft `{ text }`; a line is a line of that text, counted from 1.

import test from "node:test";
import assert from "node:assert/strict";
import * as personal from "../src/personal-data/index.mjs";

const RULE = "A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE";
const participant = (name, place) => ({
  name, type: "model endpoint", model: "model-a", context: 8000, price: null, capabilities: ["draft text"], place, route: "endpoint",
});
const PEOPLE = { names: ["Ada Example"], addresses: ["a.zeta@mail.test"], phones: [], accounts: [] };
const context = (params, mailbox = ["campus"]) => ({ params, places: { sources: {}, mailbox, contents: [] } });

// TST-839001 · level: unit · module: MOD-personal-data
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
// given: a participant at the allowed place campus, two picked pieces (a log and an error message) that name nobody, and the mail's people Ada Example and a.zeta@mail.test in the job's parameters
// input: the recipe report-data with that context
// expect: exactly two parts, named log and error and holding the pieces' texts in that order; no part's text contains "Ada", "Example" or "a.zeta@mail.test"
test("report-data — one part per picked piece, and none holds the mail's people", async () => {
  const pieces = [{ name: "log", text: "The import stops at row 12 with E42." }, { name: "error", text: "Error E42: the column count differs." }];
  const params = { pieces, participant: participant("p-campus", "campus"), people: PEOPLE };
  const parts = await personal.privacyStrategies.recipes["report-data"](context(params), params);
  assert.deepEqual(parts.map((part) => part.name), ["log", "error"]);
  assert.deepEqual(parts.map((part) => part.text), pieces.map((piece) => piece.text));
  for (const part of parts) assert.doesNotMatch(part.text, /ada|example|a\.zeta/i);
});

// TST-839002 · level: unit · module: MOD-personal-data
// guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
// given: the mailbox allows only campus; the participant is at the place eu-cloud; one picked piece
// input: the recipe report-data with that context
// expect: it rejects with an error named PlaceNotAllowed and gives no parts
test("report-data — a participant at a place the mailbox does not allow gets PlaceNotAllowed", async () => {
  const params = { pieces: [{ name: "log", text: "The import stops at row 12." }], participant: participant("p-cloud", "eu-cloud"), people: PEOPLE };
  await assert.rejects(personal.privacyStrategies.recipes["report-data"](context(params, ["campus"]), params), { name: "PlaceNotAllowed" });
});

// TST-839003 · level: unit · module: MOD-personal-data
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
// given: the people Ada Example and a.zeta@mail.test; a draft whose line 2 holds the planted address and whose line 3 holds the planted name
// input: the check people-search on that draft
// expect: exactly two findings, both of kind error under the rule, the first at line 2 and the second at line 3
test("people-search — a planted address and a planted name are found, each with its line", async () => {
  const draft = { text: "The import stops at row 12.\nWrite to a.zeta@mail.test for the log.\nThanks, Ada Example" };
  const found = await personal.privacyStrategies.checks["people-search"](draft, context({ people: PEOPLE }));
  assert.deepEqual(found.map((f) => [f.line, f.kind, f.rule]), [[2, "error", RULE], [3, "error", RULE]]);
});

// TST-839004 · level: unit · module: MOD-personal-data
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
// given: the same people; a draft that names none of them
// input: the check people-search on that draft
// expect: no finding
test("people-search — a clean draft gives no finding", async () => {
  const draft = { text: "The import stops at row 12.\nThe user's home folder holds the log.\nError E42: the column count differs." };
  const found = await personal.privacyStrategies.checks["people-search"](draft, context({ people: PEOPLE }));
  assert.deepEqual(found, []);
});
