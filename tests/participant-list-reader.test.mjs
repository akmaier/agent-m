// The register's people and agents joined with the connections that offer the agents' models — MOD-participant-list's
// participantsOf as docs/architecture/MOD-participant-list.md states it: `participantsOf(register: Document, connections:
// Connection[]) -> Participant[]`, the participants of a register read with participantSchema, in its order: a person once;
// an agent once for each connection among `connections` whose `model` is the agent's, in their order, and once without a
// route where none is — the values eligible takes.
// Run: node --test tests/participant-list-reader.test.mjs
//
// Module: MOD-participant-list
// Guards: UC-017; UC-049; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A CONNECTION NAMES THE MODELS IT OFFERS; A CONNECTION DECLARES ITS CAPABILITIES; A CONNECTION DECLARES WHERE IT PROCESSES DATA; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; A ROLE NAMES THE CAPABILITIES IT NEEDS
// Level: unit
//
// Every expected value is read from the module file, and for this instance's register from the register as it stands. Its
// Interfaces: a `Connection` is `{ name, type: "model endpoint" | "CLI agent", model, context, capabilities, place, route }`,
// one model that one connection offers; a `Participant` is `{ name, type, model, context, capabilities, place, route }` —
// a person with no model, no context, no capabilities, no place and no route; an agent on one connection that offers its
// model, with the agent's name and model and the connection's type, context, capabilities, place and route; an agent that
// no connection given offers its model, of the type `agent`, with no context, no capabilities, no place and no route.
//
// The register is read as its callers read it: through MOD-documents' readRegister, with the schema participantSchema gives,
// and the document it reads is given to participantsOf. This instance's register, docs/participants.md, is read as it
// stands and never changed.
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readRegister } from "../src/documents/index.mjs";
import * as participantList from "../src/participant-list/index.mjs";

const { eligible, participantSchema } = participantList;

// participantsOf is called through the module's namespace, so that while it is missing each test fails on its own.
const participantsOf = (register, connections) => participantList.participantsOf(register, connections);

const INSTANCE_REGISTER = new URL("../docs/participants.md", import.meta.url);
const REGISTER_PATH = "docs/participants.md";

// The six capabilities of A CONNECTION DECLARES ITS CAPABILITIES, in the module file's order.
const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"];

// The participants of a register's text on these connections, as a caller reads them: the text read with
// participantSchema through readRegister, and its document given to participantsOf.
const participantsIn = (text, connections) =>
  participantsOf(readRegister(participantSchema(), REGISTER_PATH, text).document, connections);

// ---------------------------------------------------------------- a register and connections
//
// A register in the module file's form — its title, a sentence, and its table under the title — with three rows: alice, a
// person; developer-a, an agent of example-model; summariser, an agent of small-model.

const FIXTURE = [
  "# Participants of this instance",
  "",
  "**REGISTER**",
  "",
  "The people and agents who work on the products of this instance, one row per participant.",
  "",
  "| Name | Type | Model |",
  "|---|---|---|",
  "| alice | person | — |",
  "| developer-a | agent | example-model |",
  "| summariser | agent | small-model |",
  "",
].join("\n");

// Three connections, as MOD-prompt-bar's endpointsOffered and sessionsOffered give them: a Bridge's coding agent that runs
// example-model and small-model, one Connection each; and a model endpoint of small-model.
const LAB_EXAMPLE = { name: "lab-pc:claude", type: "CLI agent", model: "example-model", context: 200000,
  capabilities: CAPABILITIES, place: "this machine", route: "bridge lab-pc agent claude" };
const LAB_SMALL = { name: "lab-pc:claude", type: "CLI agent", model: "small-model", context: 100000,
  capabilities: CAPABILITIES, place: "this machine", route: "bridge lab-pc agent claude" };
const NHR = { name: "nhr", type: "model endpoint", model: "small-model", context: 32000,
  capabilities: ["draft text", "read the repository"], place: "NHR@FAU, Erlangen", route: "endpoint nhr secret NHR_KEY" };

const ALICE = { name: "alice", type: "person", model: null, context: null, capabilities: [], place: null, route: null };
const on = (name, model, connection) => ({ name, type: connection.type, model, context: connection.context,
  capabilities: connection.capabilities, place: connection.place, route: connection.route });
const unreached = (name, model) => ({ name, type: "agent", model, context: null, capabilities: [], place: null,
  route: null });

// ---------------------------------------------------------------- participantsOf

// TST-20261109111 · level: unit · module: MOD-participant-list
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; UC-017
// given: this instance's register docs/participants.md as it stands, and no connection
// input: participantsOf(the document that readRegister(participantSchema(), "docs/participants.md", its text) gives, [])
// expect: one participant per row of its table, in its order — their names those of the rows readRegister gives —; akmaier a person with no model, context, capabilities, place or route; developer-opus-e an agent of claude-opus-5-5 that, on no connection, keeps the type agent with no context, capabilities, place or route
test("participantsOf — this instance's register on no connection: each row once, a person, and an agent standing without a route", () => {
  const { document, rows } = readRegister(participantSchema(), REGISTER_PATH, readFileSync(INSTANCE_REGISTER, "utf8"));
  const participants = participantsOf(document, []);
  assert.deepEqual(participants.map((participant) => participant.name), rows.map((row) => row.cells.Name),
    "one participant per row, in its order");
  const named = (name) => participants.find((participant) => participant.name === name);
  assert.deepEqual(named("akmaier"), { ...ALICE, name: "akmaier" });
  assert.deepEqual(named("developer-opus-e"), unreached("developer-opus-e", "claude-opus-5-5"));
});

// TST-20261109112 · level: unit · module: MOD-participant-list
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; A CONNECTION NAMES THE MODELS IT OFFERS; A CONNECTION DECLARES ITS CAPABILITIES; A CONNECTION DECLARES WHERE IT PROCESSES DATA; UC-017; UC-049
// given: the fixture register — alice, developer-a of example-model, summariser of small-model — and the connections lab-pc:claude with example-model, lab-pc:claude with small-model, nhr with small-model, in that order
// input: participantsIn(the fixture, those connections)
// expect: alice once, as a person; developer-a once, on lab-pc:claude with example-model, with that connection's type, context, capabilities, place and route; summariser twice, on lab-pc:claude with small-model and on nhr, in the connections' order, each with its own connection's values and the agent's name and model
test("participantsOf — a person once, an agent once for each connection that offers its model, in the connections' order", () => {
  assert.deepEqual(participantsIn(FIXTURE, [LAB_EXAMPLE, LAB_SMALL, NHR]), [
    ALICE,
    on("developer-a", "example-model", LAB_EXAMPLE),
    on("summariser", "small-model", LAB_SMALL),
    on("summariser", "small-model", NHR),
  ]);
});

// TST-20261109113 · level: unit · module: MOD-participant-list
// guards: A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-017
// given: the fixture register and one connection, nhr with small-model — none offers example-model
// input: participantsIn(the fixture, [nhr])
// expect: alice; developer-a once, of the type agent with its model and no context, capabilities, place or route; summariser on nhr
test("participantsOf — an agent whose model no connection given offers stands once, without a route", () => {
  assert.deepEqual(participantsIn(FIXTURE, [NHR]), [
    ALICE,
    unreached("developer-a", "example-model"),
    on("summariser", "small-model", NHR),
  ]);
});

// ---------------------------------------------------------------- eligible, given the participants joined

// TST-20261109114 · level: unit · module: MOD-participant-list
// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-002
// given: a role that needs `run code and tests`; the fixture register on two connections that offer small-model — lab-pc:claude, which declares that capability, and nhr, which does not —, and none that offers example-model
// input: eligible(participantsIn(the fixture, [lab-pc:claude with small-model, nhr]), { capabilities: ["run code and tests"] })
// expect: offered summariser on lab-pc:claude alone; left out alice, lacking the capability; developer-a, naming that no connection offers its model example-model; summariser on nhr, lacking the capability. Counter-proof: with lab-pc:claude removed, nothing is offered and summariser on nhr is left out naming the capability it lacks
test("eligible — a job of a role goes only to a connection that offers its agent's model and declares what the role needs", () => {
  const need = { capabilities: ["run code and tests"] };
  const lacks = "lacks the capability \"run code and tests\"";
  assert.deepEqual(eligible(participantsIn(FIXTURE, [LAB_SMALL, NHR]), need), {
    eligible: [on("summariser", "small-model", LAB_SMALL)],
    leftOut: [
      { participant: ALICE, reasons: [lacks] },
      { participant: unreached("developer-a", "example-model"), reasons: ["no connection offers its model example-model"] },
      { participant: on("summariser", "small-model", NHR), reasons: [lacks] },
    ],
  });
  const without = eligible(participantsIn(FIXTURE, [NHR]), need);
  assert.deepEqual(without.eligible, [], "counter-proof: sent nowhere");
  assert.deepEqual(without.leftOut.at(-1), { participant: on("summariser", "small-model", NHR), reasons: [lacks] });
});
