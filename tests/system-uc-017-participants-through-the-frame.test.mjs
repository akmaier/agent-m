// System coverage for UC-017 Configure the participants of the instance where it meets a Bridge, and its postcondition: the frame started at the fragment #participants over the module view of
// MOD-settings-pages, against MOD-repository-hosts' real GitHub host answered by a fake GitHub server (tests/uc-017-harness.mjs), with a real Bridge of this browser — MOD-bridge-http over MOD-bridge-jobs'
// real handlers — on a "computer" that is a folder holding a fixture claude, and a model endpoint in this browser's store. The flows with endpoints alone (steps 1–4, 3a, 4a) are walked in
// tests/system-uc-017-configure-participants.test.mjs. No request leaves the process.
// Run: node --test tests/system-uc-017-participants-through-the-frame.test.mjs
//
// Module: MOD-settings-pages
// Module: MOD-participant-list
// Module: MOD-prompt-bar
// Module: MOD-runtimes
// Guards: UC-017
// Level: system
//
// Readings the texts leave open, which the cases state:
//   - "each model a Bridge's coding agent can run (UC-044)" (3) is read as each model the declaration the Bridge keeps for its agent names, for an agent the Bridge reports ready (MOD-bridge-http, GET /v1/agents).
//   - "The participant does the jobs ... each on a connection that offers its model" (postcondition) is read as MOD-participant-list's participantsOf joining the saved register with this browser's connections,
//     and MOD-runtimes' routesFor giving the agent the route of each connection that offers its model and a person none.
//   - "The prompt bar offers the connections this browser configures, not the participants of this list" (postcondition) is read as the bar under the page naming each connection `<name> · <model>` and
//     no participant's name.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument } from "./settings-pages-harness.mjs";
import { INSTANCE, PARTICIPANTS, REGISTER, addParticipant, byClass, choose, commitsOf, computer, endpoint, instanceFiles, one, optionsOf, page, put, registerOf, save, startBridge, textOf } from "./uc-017-harness.mjs";

installDocument();
const { view } = await import("../src/settings-pages/index.mjs");
const { registerStrategies } = await import("../src/job-runner/index.mjs");
for (const strategies of view.strategies) registerStrategies("tests/system-uc-017-participants-through-the-frame.test.mjs", strategies);
const { readDocument } = await import("../src/documents/index.mjs");
const { participantSchema, participantsOf } = await import("../src/participant-list/index.mjs");
const { openStore } = await import("../src/browser-store/index.mjs");
const { endpointsOffered, sessionsOffered } = await import("../src/prompt-bar/index.mjs");
const { routesFor } = await import("../src/runtimes/index.mjs");

const CODING = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"];
/** The declaration a Bridge keeps for its claude: at this machine, every capability a coding agent needs, the models `models`, each with its context. */
const declares = (models) => ({ place: "this machine", capabilities: CODING, models: models.map((model) => ({ model, context: 200000 })) });
/** The setting of a Bridge `bridge` of this browser. */
const bridgeSettings = (bridge) => ({ [`bridge:${bridge.name}`]: { address: bridge.address, token: bridge.token } });

// TST-20261109205 · level: system · module: system
// guards: UC-017; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; NO SECRET IN THE REPOSITORY; ONE CLICK PER DECISION
// given: a real Bridge laptop on a computer with claude logged in, kept by this browser with its token, which keeps for its CLI session laptop:claude the declaration of the models claude-opus-5-5 and claude-sonnet-5 at the place this machine; the endpoint hub offers claude-opus-5-5 at Anthropic, USA
// input: the author adds an agent dev-l (1, 2), reads the models offered (3), chooses claude-sonnet-5 and presses Save (4)
// expect: the model offers claude-opus-5-5 with hub (Anthropic, USA) and laptop:claude (this machine), and claude-sonnet-5 with laptop:claude (this machine) alone; one commit adds `| dev-l | agent | claude-sonnet-5 |`; the Bridge's token and its name are in no commit; the list names dev-l on laptop:claude
test("TST-20261109205: UC-017 3 the models a Bridge's coding agent can run are offered beside the endpoints', each with its connections and places", async (t) => {
  const bridge = await startBridge(t, computer(), { name: "laptop", declares: declares(["claude-opus-5-5", "claude-sonnet-5"]) });
  const shown = await page(t, { settings: { "endpoint:hub": endpoint("claude-opus-5-5", "Anthropic, USA"), ...bridgeSettings(bridge) } });
  const main = shown.main();
  await addParticipant(main, "agent");
  await put(main, "participant-name", "dev-l");
  assert.deepEqual(optionsOf(one(main, "participant-model")), [["", "Choose a model"],
    ["claude-opus-5-5", "claude-opus-5-5 — hub (Anthropic, USA), laptop:claude (this machine)"], ["claude-sonnet-5", "claude-sonnet-5 — laptop:claude (this machine)"]]);
  await choose(main, "participant-model", "claude-sonnet-5");
  await save(main);
  assert.equal(commitsOf(shown).length, 1);
  assert.equal(registerOf(shown), REGISTER("| dev-l | agent | claude-sonnet-5 |"));
  const committed = JSON.stringify(commitsOf(shown));
  assert.ok(!committed.includes(bridge.token) && !committed.includes("laptop"), "nothing of the Bridge is committed");
  assert.match(textOf(one(main, "participants-list")), /dev-l — agent; model: claude-sonnet-5; on laptop:claude \(this machine\)/);
});

// TST-20261109206 · level: system · module: system
// guards: UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; NO SECRET IN THE REPOSITORY
// given: the register holds alice (person); the endpoint hub offers claude-opus-5-5 at Anthropic, USA; the real Bridge laptop keeps for its session laptop:claude the declaration of claude-opus-5-5 at this machine
// input: the author adds the agent dev-x of claude-opus-5-5 and presses Save; the saved register is joined with this browser's connections, each participant's routes are asked for a private product with a job workflow, and the prompt bar under the page is read
// expect: the register lists alice as a person and dev-x as an agent of claude-opus-5-5, with no key or token; dev-x stands once for each connection that offers its model — on hub with the route endpoint hub, the tab, and on laptop:claude with the route bridge laptop agent claude, that Bridge —, alice with no route and no offer; the prompt bar names hub · claude-opus-5-5 and laptop:claude · claude-opus-5-5 and neither participant
test("TST-20261109206: UC-017 postcondition the saved participant does its jobs on the connections that offer its model, and the prompt bar offers connections, not participants", async (t) => {
  const bridge = await startBridge(t, computer(), { name: "laptop", declares: declares(["claude-opus-5-5"]) });
  const shown = await page(t, { instance: instanceFiles(REGISTER("| alice | person | — |")),
    settings: { "endpoint:hub": endpoint("claude-opus-5-5", "Anthropic, USA"), ...bridgeSettings(bridge) } });
  const main = shown.main();
  await addParticipant(main, "agent");
  await put(main, "participant-name", "dev-x");
  await choose(main, "participant-model", "claude-opus-5-5");
  await save(main);
  const register = registerOf(shown);
  assert.equal(register, REGISTER("| alice | person | — |", "| dev-x | agent | claude-opus-5-5 |"));
  assert.ok(!register.includes(bridge.token) && !register.includes("sk-"), "no key in the repository");
  const store = openStore(INSTANCE);
  const connections = [...endpointsOffered(store), ...await sessionsOffered(store)];
  const participants = participantsOf(readDocument(participantSchema(), PARTICIPANTS, register), connections);
  assert.deepEqual(participants.map((each) => [each.name, each.type, each.model, each.place, each.route]), [
    ["alice", "person", null, null, null],
    ["dev-x", "model endpoint", "claude-opus-5-5", "Anthropic, USA", "endpoint hub"],
    ["dev-x", "CLI agent", "claude-opus-5-5", "this machine", "bridge laptop agent claude"]]);
  const product = { visibility: "private", jobWorkflow: true };
  assert.deepEqual(participants.map((each) => routesFor(each, product, []).map((offer) => [offer.route, offer.available])), [
    [], [[{ kind: "tab" }, true]], [[{ kind: "bridge", bridge: "laptop" }, true]]]);
  const bar = textOf(one(document.body, "site-frame-prompt-bar"));
  for (const offered of ["hub · claude-opus-5-5", "laptop:claude · claude-opus-5-5"]) assert.ok(bar.includes(offered), `the bar offers ${offered}: ${bar}`);
  for (const name of ["alice", "dev-x"]) assert.ok(!bar.includes(name), `the bar offers no participant: ${name}`);
  assert.equal(byClass(main, "participants-row").length, 2);
});
