// Release tests of the requirements UC-017 "Configure the participants of the instance" realises, each checked from what an author does on the Participants page and reads in the register
// `docs/participants.md` that the page commits: one list for the instance, a person or an agent, an agent's model, no key in the repository, the author's commit made directly and in one click, and the folded
// explanation. The page is the real route `participants` of MOD-settings-pages shown by the frame, over a fake GitHub server and this browser's model endpoints (tests/uc-017-harness.mjs).
// Run: node --test tests/release-uc-017-configure-participants.test.mjs
//
// Module: MOD-settings-pages
// Module: MOD-participant-list
// Guards: UC-017
// Level: release
//
// Readings the texts leave open, which the cases state:
//   - "a product assigns its roles from that list" (PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE) is read as the page naming, for a participant, the roles a product's assignment gives it, while the list
//     shown and written is the instance's alone, even where a product's repository holds a file of the same path.
//   - "committed to the default branch under their own account" (A PERSON'S OWN INPUT IS COMMITTED DIRECTLY) is read as the writes the host sees being the tree, the commit and the move of the
//     default branch, each with the instance's token this browser keeps, and no branch, pull request or issue.
//   - "Every step that asks something of the person carries an explanation" (EVERY STEP EXPLAINS ITSELF) is read, with UC-017 step 2, as the one folded What is this? of the form, beside the type, holding
//     the topic participant-person-or-agent of MOD-site-frame's explanations.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installDocument } from "./settings-pages-harness.mjs";
import { ALPHA, INSTANCE, KEY, PARTICIPANTS, PRODUCT_TOKEN, REGISTER, TOKEN, addParticipant, byClass, change, choose, click, commitsOf, endpoint, folds, instanceFiles, one, optionsOf, page, productOf,
  productSettings, put, registerOf, save, textOf } from "./uc-017-harness.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
for (const strategies of view.strategies) registerStrategies("tests/release-uc-017-configure-participants.test.mjs", strategies);
const { documentFindings, readDocument } = await import("../src/documents/index.mjs");
const { participantSchema } = await import("../src/participant-list/index.mjs");

const HUB = { "endpoint:hub": endpoint("claude-opus-5-5", "Anthropic, USA") };
/** The errors the register's schema finds in the text of a register. */
const errorsOf = (text) => documentFindings(participantSchema(), readDocument(participantSchema(), PARTICIPANTS, text)).filter((found) => found.kind === "error");
/** The person adds the agent `name` of the model `model` and saves it. */
async function addAgent(main, name, model) {
  await addParticipant(main, "agent");
  await put(main, "participant-name", name);
  await choose(main, "participant-model", model);
  await save(main);
}

// TST-20261109207 · level: release · module: system
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: the instance's register holds alice (person); the product acme/alpha, which this browser lists, assigns alice the Product Owner in team-one and holds a file docs/participants.md of its own naming intruder; the endpoint hub
// input: the author reads the list, adds the agent dev-x of claude-opus-5-5 and presses Save, then presses Change on alice
// expect: the list names alice and not intruder; the save writes the instance's docs/participants.md alone, which then lists alice and dev-x, and nothing to the product; known positive: the form of alice names alpha's role team-one: Product Owner
test("TST-20261109207: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE — the page lists and writes the instance's one register, from which a product assigns its roles", async (t) => {
  const product = productOf({ "team-one": [["Product Owner", ["alice"]], ["Scrum Master", ["alice"]], ["Developers", ["alice"]]] });
  product.files[PARTICIPANTS] = REGISTER("| intruder | person | — |");
  const shown = await page(t, { instance: instanceFiles(REGISTER("| alice | person | — |")), settings: { ...HUB, ...productSettings(ALPHA) }, products: { "acme/alpha": product } });
  const main = shown.main();
  assert.match(textOf(one(main, "participants-list")), /alice — person/);
  assert.doesNotMatch(textOf(one(main, "participants-list")), /intruder/);
  await addAgent(main, "dev-x", "claude-opus-5-5");
  assert.deepEqual(commitsOf(shown).map((commit) => Object.keys(commit.files)), [[PARTICIPANTS]]);
  assert.equal(registerOf(shown), REGISTER("| alice | person | — |", "| dev-x | agent | claude-opus-5-5 |"));
  assert.equal(commitsOf(shown, "acme/alpha").length, 0);
  await change(main, "alice");
  assert.match(textOf(one(main, "participant-product-use-box")), /team-one: Product Owner/);
});

// TST-20261109208 · level: release · module: system
// guards: A PARTICIPANT IS A PERSON OR AN AGENT
// given: the frame at #participants over an empty register; the register's schema
// input: the author opens + Add participant and reads the types; the schema reads a register of a person and an agent, and one row of each withdrawn type CLI agent and model endpoint
// expect: the types offered are person and agent alone; known positive: the register of a person and an agent has no error; each row of another type has one
test("TST-20261109208: A PARTICIPANT IS A PERSON OR AN AGENT — the page offers the two types, and the register takes no other", async (t) => {
  const shown = await page(t, { settings: HUB });
  const main = shown.main();
  await click(one(main, "participants-add"));
  assert.deepEqual(optionsOf(one(main, "participant-type")).map(([value]) => value).filter(Boolean), ["person", "agent"]);
  assert.deepEqual(errorsOf(REGISTER("| alice | person | — |", "| dev-a | agent | claude-opus-5-5 |")), [], "known positive: a person and an agent are accepted");
  for (const other of ["CLI agent", "model endpoint"]) assert.ok(errorsOf(REGISTER(`| dev-b | ${other} | claude-opus-5-5 |`)).length > 0, `${other} is no type`);
});

// TST-20261109209 · level: release · module: system
// guards: A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
// given: the frame at #participants over an empty register; the endpoint hub offers claude-opus-5-5
// input: the author adds an agent dev-x and, before a model is chosen, presses Save; then chooses claude-opus-5-5 and presses Save; the schema reads an agent's row without a model and a person's
// expect: without a model Save is withheld and nothing is committed; with it the row names claude-opus-5-5; the schema rejects the agent's row without a model and accepts the same row with it, and a person's with none
test("TST-20261109209: A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL — an agent is saved only with its model", async (t) => {
  const shown = await page(t, { settings: HUB });
  const main = shown.main();
  await addParticipant(main, "agent");
  await put(main, "participant-name", "dev-x");
  assert.equal(one(main, "participant-save").disabled, true);
  await click(one(main, "participant-save"));
  assert.equal(commitsOf(shown).length, 0);
  await choose(main, "participant-model", "claude-opus-5-5");
  await save(main);
  assert.equal(registerOf(shown), REGISTER("| dev-x | agent | claude-opus-5-5 |"));
  assert.ok(errorsOf(REGISTER("| dev-x | agent | — |")).length > 0, "an agent without its model is rejected");
  assert.deepEqual(errorsOf(REGISTER("| dev-x | agent | claude-opus-5-5 |", "| alice | person | — |")), [], "counter-proof: with its model it is accepted, and a person needs none");
});

// TST-20261109210 · level: release · module: system
// guards: NO SECRET IN THE REPOSITORY
// given: this browser keeps the instance's token, a product's token and the endpoint hub with its key; the product acme/alpha uses alice
// input: the author adds the agent dev-x of claude-opus-5-5 and presses Save; then presses Change on alice, whom alpha uses, renames her alice-b and presses Save
// expect: known positive: the key stands in this browser's store; two commits are made, and no commit's message or files of the instance or the product holds the key, the instance's token or the product's token
test("TST-20261109210: NO SECRET IN THE REPOSITORY — no key or token of this browser enters a commit", async (t) => {
  const shown = await page(t, { instance: instanceFiles(REGISTER("| alice | person | — |")), settings: { ...HUB, ...productSettings(ALPHA) },
    products: { "acme/alpha": productOf({ "team-one": [["Product Owner", ["alice"]], ["Scrum Master", ["alice"]], ["Developers", ["alice"]]] }) } });
  const main = shown.main();
  await addAgent(main, "dev-x", "claude-opus-5-5");
  await change(main, "alice");
  await put(main, "participant-name", "alice-b");
  await save(main);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(`agent-m:${INSTANCE}:endpoint:hub`)).key, KEY, "known positive: the key is kept in this browser");
  const committed = JSON.stringify([...commitsOf(shown), ...commitsOf(shown, "acme/alpha")].map((commit) => [commit.message, commit.files]));
  assert.equal(commitsOf(shown).length, 2);
  for (const secret of [KEY, TOKEN, PRODUCT_TOKEN]) assert.ok(!committed.includes(secret), "no secret in a commit");
});

// TST-20261109211 · level: release · module: system
// guards: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// given: the frame at #participants over an empty register, with the instance's token kept by this browser
// input: the author adds the person alice and presses Save
// expect: the writes GitHub sees are a tree, a commit and the move of main, each with the instance's token; no branch, pull request or issue is made; main then holds the register with alice
test("TST-20261109211: A PERSON'S OWN INPUT IS COMMITTED DIRECTLY — the save is a commit to the default branch with the author's token", async (t) => {
  const shown = await page(t, { settings: HUB });
  const main = shown.main();
  await addParticipant(main, "person");
  await put(main, "participant-name", "alice");
  await save(main);
  const writes = shown.world.requests.filter((request) => request.method !== "GET" && request.url.pathname !== "/graphql");
  assert.deepEqual(writes.map((request) => `${request.method} ${request.url.pathname.split("/").slice(4).join("/")}`),
    ["POST git/trees", "POST git/commits", "PATCH git/refs/heads/main"]);
  assert.ok(writes.every((request) => String(request.authorization).includes(TOKEN)), "each with the instance's token");
  assert.equal(registerOf(shown), REGISTER("| alice | person | — |"));
});

// TST-20261109212 · level: release · module: system
// guards: ONE CLICK PER DECISION
// given: the frame at #participants over an empty register; the endpoint hub offers claude-opus-5-5
// input: the author fills the form of the agent dev-x of claude-opus-5-5 and presses Save once
// expect: known negative: before the form is complete Save is withheld; once it is, one click makes the one commit and the page says Saved. — nothing else is asked; the form closes and the list names dev-x
test("TST-20261109212: ONE CLICK PER DECISION — once the participant's inputs are complete, one click on Save commits it", async (t) => {
  const shown = await page(t, { settings: HUB });
  const main = shown.main();
  await addParticipant(main, "agent");
  assert.equal(one(main, "participant-save").disabled, true, "known negative: the form is not complete");
  await put(main, "participant-name", "dev-x");
  await choose(main, "participant-model", "claude-opus-5-5");
  assert.equal(commitsOf(shown).length, 0);
  await click(one(main, "participant-save"));
  assert.equal(commitsOf(shown).length, 1);
  assert.equal(one(main, "participants-result").textContent, "Saved.");
  assert.equal(one(main, "participants-add-panel").hidden, true);
  assert.match(textOf(one(main, "participants-list")), /dev-x — agent; model: claude-opus-5-5/);
});

// TST-20261109213 · level: release · module: system
// guards: EVERY STEP EXPLAINS ITSELF
// given: the frame at #participants over an empty register; the topic participant-person-or-agent of src/site-frame/explanations.md
// input: the author opens + Add participant and expands the What is this? beside the type, for a person and for an agent
// expect: known positive: the topic is written in explanations.md; the form carries one folded What is this?, holding that topic's first sentence, for either type
test("TST-20261109213: EVERY STEP EXPLAINS ITSELF — the participant's form carries the folded explanation of a person and an agent", async (t) => {
  const topic = readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8").split("## participant-person-or-agent\n")[1];
  assert.ok(topic, "known positive: the topic is written");
  const first = topic.trim().split(/\.\s/)[0].replace(/\s+/g, " ");
  const shown = await page(t, { settings: HUB });
  const main = shown.main();
  for (const kind of ["person", "agent"]) {
    const panel = await addParticipant(main, kind);
    const explained = folds(panel);
    assert.equal(explained.length, 1, kind);
    assert.ok(textOf(explained[0]).includes(first), `${kind}: ${first}`);
  }
  assert.equal(byClass(main, "participants-add-panel").length, 1);
});
