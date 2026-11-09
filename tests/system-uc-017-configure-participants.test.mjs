// System coverage for UC-017 Configure the participants of the instance, its main flow and its alternative flows walked as an author meets them: the frame started at the fragment #participants over the
// module view of MOD-settings-pages, against MOD-repository-hosts' real GitHub host answered by a fake GitHub server that holds the instance and two products (tests/uc-017-harness.mjs). This browser's
// connections are model endpoints in its store; the models a Bridge's coding agent offers and the postcondition are walked in tests/system-uc-017-participants-through-the-frame.test.mjs. No request leaves the
// process.
// Run: node --test tests/system-uc-017-configure-participants.test.mjs
//
// Module: MOD-settings-pages
// Module: MOD-participant-list
// Guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// Guards: NO SECRET IN THE REPOSITORY; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// Readings the texts leave open, which the cases state:
//   - "The author opens **Participants** on the dashboard" (1) is read as the frame shown at the fragment #participants: the route `participants` of MOD-settings-pages.
//   - "Agent M links to the pages of endpoints (UC-003) and of the Bridges (UC-044)" (3a) is read as the buttons of the agent's form that take the frame to the fragments #endpoints and #bridge.
//   - "A job already running keeps its model" (4a) is read as the change committing docs/participants.md alone: no job's record is written.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument } from "./settings-pages-harness.mjs";
import { ALPHA, BETA, KEY, PARTICIPANTS, REGISTER, addParticipant, byClass, byTag, change, choose, click, commitsOf, endpoint, folds, go, instanceFiles, one, optionsOf, page, productOf,
  productSettings, put, registerOf, save, textOf } from "./uc-017-harness.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
for (const strategies of view.strategies) registerStrategies("tests/system-uc-017-configure-participants.test.mjs", strategies);

// Two endpoints of this browser that offer claude-opus-5-5, at a provider and at NHR, and one of another model.
const ENDPOINTS = { "endpoint:hub": endpoint("claude-opus-5-5", "Anthropic, USA"), "endpoint:nhr": endpoint("claude-opus-5-5", "NHR@FAU, Erlangen"),
  "endpoint:small": endpoint("small-model", "Anthropic, USA", { context: 32000 }) };

// TST-20261109201 · level: system · module: system
// guards: UC-017; A PARTICIPANT IS A PERSON OR AN AGENT; EVERY STEP EXPLAINS ITSELF; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY; ONE CLICK PER DECISION; NO SECRET IN THE REPOSITORY
// given: the frame at #participants; the instance's register holds no participant; this browser keeps the endpoint hub with its key
// input: the author chooses + Add participant (1), picks person and opens What is this? (2), names alice (3) and presses Save (4)
// expect: the type offers person and agent; one folded What is this? explains both and that an agent's place, capabilities and context are the connection's; a person is offered no model; Save makes one commit to the instance whose register gains `| alice | person | — |` and holds no key; the page says Saved. and lists alice as a person
test("TST-20261109201: UC-017 1-4 a person is added by their account and committed in one click, with no model and no key", async (t) => {
  const shown = await page(t, { settings: { "endpoint:hub": ENDPOINTS["endpoint:hub"] } });
  const main = shown.main();
  assert.equal(one(main, "participants-add").textContent, "+ Add participant");
  const panel = await addParticipant(main, "person");
  assert.deepEqual(optionsOf(one(main, "participant-type")).map(([value]) => value), ["", "person", "agent"]);
  const explained = folds(panel);
  assert.equal(explained.length, 1, "one folded explanation beside the type");
  assert.equal(byTag(explained[0], "summary")[0].textContent, "What is this?");
  for (const piece of ["A person is a colleague", "An agent works with a language model", "belong to the connection that offers its model"]) assert.ok(textOf(explained[0]).includes(piece), piece);
  assert.equal(byClass(main, "participant-model").length, 0, "a person names no model");
  await put(main, "participant-name", "alice");
  await save(main);
  assert.equal(commitsOf(shown).length, 1, "one click, one commit");
  assert.equal(registerOf(shown), REGISTER("| alice | person | — |"));
  assert.ok(!JSON.stringify(commitsOf(shown)).includes(KEY), "no key in the commit");
  assert.match(one(main, "participants-result").textContent, /Saved\./);
  assert.match(textOf(one(main, "participants-list")), /alice — person/);
});

// TST-20261109202 · level: system · module: system
// guards: UC-017; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; ONE CLICK PER DECISION; NO SECRET IN THE REPOSITORY
// given: the frame at #participants over an empty register; this browser's endpoints hub (claude-opus-5-5, Anthropic, USA), nhr (claude-opus-5-5, NHR@FAU, Erlangen) and small (small-model, Anthropic, USA)
// input: the author adds an agent dev-x (1, 2), reads the models offered and, known negative, presses Save before choosing one; then chooses claude-opus-5-5 (3) and presses Save (4)
// expect: the model offers claude-opus-5-5 with both connections that offer it and their places, and small-model with small; without a model Save is withheld and nothing is committed; with it one commit adds `| dev-x | agent | claude-opus-5-5 |` and nothing of a connection — no endpoint name, place, address or key
test("TST-20261109202: UC-017 3-4 an agent's model is chosen among the models this browser's connections offer, and only name, type and model are committed", async (t) => {
  const shown = await page(t, { settings: ENDPOINTS });
  const main = shown.main();
  await addParticipant(main, "agent");
  await put(main, "participant-name", "dev-x");
  assert.deepEqual(optionsOf(one(main, "participant-model")), [["", "Choose a model"],
    ["claude-opus-5-5", "claude-opus-5-5 — hub (Anthropic, USA), nhr (NHR@FAU, Erlangen)"], ["small-model", "small-model — small (Anthropic, USA)"]]);
  assert.equal(one(main, "participant-save").disabled, true, "known negative: an agent without its model is not saved");
  await click(one(main, "participant-save"));
  assert.equal(commitsOf(shown).length, 0);
  await choose(main, "participant-model", "claude-opus-5-5");
  await save(main);
  assert.equal(commitsOf(shown).length, 1);
  const register = registerOf(shown);
  assert.equal(register, REGISTER("| dev-x | agent | claude-opus-5-5 |"));
  for (const piece of ["hub", "nhr", "Anthropic", "NHR@FAU", "models.example", KEY]) assert.ok(!register.includes(piece), `nothing of a connection: ${piece}`);
});

// TST-20261109203 · level: system · module: system
// guards: UC-017; EVERY STEP EXPLAINS ITSELF
// given: the frame at #participants over an empty register; this browser keeps no endpoint and no Bridge
// input: the author adds an agent and reads the model field (3a); presses Endpoints; returns to #participants, adds an agent again and presses Bridges
// expect: the model offers none and the page says no connection of this browser offers a model; Endpoints takes the frame to #endpoints, Bridges to #bridge
test("TST-20261109203: UC-017 3a with no connection offering a model the form links to the pages of the endpoints and of the Bridges", async (t) => {
  const shown = await page(t);
  let main = shown.main();
  await addParticipant(main, "agent");
  assert.deepEqual(optionsOf(one(main, "participant-model")), [["", "Choose a model"]]);
  assert.match(one(main, "participant-no-connection").textContent, /No connection of this browser offers a model/);
  await click(one(main, "participant-go-endpoints"));
  assert.equal(shown.location.hash, "#endpoints");
  await go(shown, "#participants");
  main = shown.main();
  await addParticipant(main, "agent");
  await click(one(main, "participant-go-bridge"));
  assert.equal(shown.location.hash, "#bridge");
});

// TST-20261109204 · level: system · module: system
// guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the register holds alice (person) and dev-a (agent, claude-opus-5-5); the endpoint hub offers claude-opus-5-5; this browser lists the products acme/alpha (team-one: Product Owner and Scrum Master alice, Developers dev-a) and acme/beta (team-web: Product Owner and Developers alice, Scrum Master dev-a), both declaring the Scrum model whose Product Owner is a person
// input: the author presses Change on alice (4a), reads the products; makes alice an agent of claude-opus-5-5, reads them again, and presses Save
// expect: known positive — the page names alpha with team-one's Product Owner and Scrum Master and beta with team-web's Product Owner and Developers, with no assignment invalid yet; after the change it shows that the role Product Owner needs a person and no person holds it; Save commits docs/participants.md alone to the instance — none to a product, no job record — and the register then reads alice as an agent of claude-opus-5-5
test("TST-20261109204: UC-017 4a a change to a participant that products use names those products and roles, and the assignments it makes invalid", async (t) => {
  const register = REGISTER("| alice | person | — |", "| dev-a | agent | claude-opus-5-5 |");
  const shown = await page(t, { instance: instanceFiles(register), settings: { "endpoint:hub": ENDPOINTS["endpoint:hub"], ...productSettings(ALPHA, BETA) },
    products: { "acme/alpha": productOf({ "team-one": [["Product Owner", ["alice"]], ["Scrum Master", ["alice"]], ["Developers", ["dev-a"]]] }),
      "acme/beta": productOf({ "team-web": [["Product Owner", ["alice"]], ["Scrum Master", ["dev-a"]], ["Developers", ["alice"]]] }) } });
  const main = shown.main();
  await change(main, "alice");
  let use = textOf(one(main, "participant-product-use-box"));
  for (const piece of [ALPHA, "team-one: Product Owner (docs/role-assignments/team-one.md)", "team-one: Scrum Master", BETA, "team-web: Product Owner", "team-web: Developers"]) {
    assert.ok(use.includes(piece), `names ${piece}: ${use}`);
  }
  assert.doesNotMatch(use, /needs a person/, "known negative: nothing is invalid yet");
  await choose(main, "participant-type", "agent");
  await choose(main, "participant-model", "claude-opus-5-5");
  use = textOf(one(main, "participant-product-use-box"));
  assert.match(use, /the role Product Owner needs a person, and no person holds it/);
  await save(main);
  assert.deepEqual([commitsOf(shown).length, commitsOf(shown, "acme/alpha").length, commitsOf(shown, "acme/beta").length], [1, 0, 0]);
  assert.deepEqual(Object.keys(commitsOf(shown)[0].files), [PARTICIPANTS], "the register alone: no job record is written");
  assert.equal(registerOf(shown), REGISTER("| alice | agent | claude-opus-5-5 |", "| dev-a | agent | claude-opus-5-5 |"));
});
