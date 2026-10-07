// The register's rows read as participants (ITM-230) — MOD-participant-list's participantsOf as
// docs/architecture/MOD-participant-list.md states it: `participantsOf(register: Document) -> Participant[]`, the
// participants of a register read with participantSchema, one per row of its table, in its order — the values eligible
// takes.
// Run: node --test tests/participant-list-reader.test.mjs
//
// Module: MOD-participant-list
// Guards: UC-002; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; NO COST IS GUESSED; A PARTICIPANT DECLARES ITS CAPABILITIES; A ROLE NAMES THE CAPABILITIES IT NEEDS
// Level: unit
//
// Every expected value is read from the module file, and for this instance's register from the register as it stands. Its
// Interfaces: participantsOf gives a row's Name as name, Type as type, Model as model, Context as context, Price as price,
// Capabilities as capabilities, Processing place as place and Route as route; a value left out as null; and Price as its
// input, output and currency. A Participant is `{ name, type, model, context, price: { input, output, currency } | null,
// capabilities, place, route }`. Its Data: a Price is written `<input> / <output> <currency> per million tokens`.
//
// The register is read as its callers read it: through MOD-documents' readRegister, with the schema participantSchema gives,
// and the document it reads is given to participantsOf. This instance's register, docs/participants.md, is read as it
// stands and never changed.
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readRegister } from "../src/documents/index.mjs";
import * as participantList from "../src/participant-list/index.mjs";

const { eligible, participantSchema } = participantList;

// participantsOf is called through the module's namespace, so that while it is missing each test fails on its own.
const participantsOf = (register) => participantList.participantsOf(register);

const INSTANCE_REGISTER = new URL("../docs/participants.md", import.meta.url);
const REGISTER_PATH = "docs/participants.md";

// The six capabilities of A PARTICIPANT DECLARES ITS CAPABILITIES, in the module file's order.
const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"];

// The participants of a register's text, as a caller reads them: the text read with participantSchema through readRegister,
// and its document given to participantsOf.
const participantsIn = (text) => participantsOf(readRegister(participantSchema(), REGISTER_PATH, text).document);

// ---------------------------------------------------------------- a register
//
// A register in the module file's form — its title, a sentence, and its table under the title — with three rows: alice, a
// person; summariser, a model endpoint that declares a context and a price; developer-a, a CLI agent that declares a context.

const ALL_SIX = CAPABILITIES.join(", ");
const FIXTURE = [
  "# Participants of this instance",
  "",
  "**REGISTER**",
  "",
  "The people and agents who work on the products of this instance, one row per participant.",
  "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",
  "|---|---|---|---|---|---|---|---|",
  `| alice | person | — | — | — | ${ALL_SIX} | — | account github.com/alice |`,
  "| summariser | model endpoint | small-model | 32000 | 0.5 / 1.5 EUR per million tokens | draft text | NHR@FAU, Erlangen | "
    + "endpoint nhr |",
  `| developer-a | CLI agent | example-model | 200000 | — | ${ALL_SIX} | this machine | bridge lab-pc agent claude |`,
  "",
].join("\n");

// The fixture's rows as participants, of the type Participant, as the module file states it.
const ALICE = { name: "alice", type: "person", model: null, context: null, price: null, capabilities: CAPABILITIES,
  place: null, route: "account github.com/alice" };
const SUMMARISER = { name: "summariser", type: "model endpoint", model: "small-model", context: 32000,
  price: { input: 0.5, output: 1.5, currency: "EUR" }, capabilities: ["draft text"], place: "NHR@FAU, Erlangen",
  route: "endpoint nhr" };
const DEVELOPER = { name: "developer-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: CAPABILITIES, place: "this machine", route: "bridge lab-pc agent claude" };

// ---------------------------------------------------------------- participantsOf

// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A
//         PARTICIPANT DECLARES WHERE IT PROCESSES DATA; UC-002
// given: this instance's register docs/participants.md as it stands
// input: participantsOf(the document that readRegister(participantSchema(), "docs/participants.md", its text) gives)
// expect: one participant per row of its table, in its order — their names those of the rows readRegister gives —; among
//         them:
//         - akmaier, a person without a model and a place: name "akmaier", type "person", model null, context null, price
//           null, capabilities all six, place null, route the text of its row's Route;
//         - developer-sol-d, a CLI agent with its model and its place: name "developer-sol-d", type "CLI agent", model
//           "gpt-6.1-sol", context null, price null, capabilities all six, place "OpenAI; the processing region of this Codex session is not declared" —
//           one place, its punctuation kept —, route the text of its row's Route
test("participantsOf — this instance's register read into participants: a person without a model and a place, a CLI agent with its model and its place", () => {
  const { document, rows } = readRegister(participantSchema(), REGISTER_PATH, readFileSync(INSTANCE_REGISTER, "utf8"));
  const participants = participantsOf(document);
  assert.deepEqual(participants.map((participant) => participant.name), rows.map((row) => row.cells.Name),
    "one participant per row, in its order");
  const named = (name) => participants.find((participant) => participant.name === name);
  const routeOf = (name) => rows.find((row) => row.cells.Name === name)?.cells.Route;
  assert.deepEqual(named("akmaier"), { name: "akmaier", type: "person", model: null, context: null, price: null,
    capabilities: CAPABILITIES, place: null, route: routeOf("akmaier") }, "akmaier");
  assert.deepEqual(named("developer-sol-d"), { name: "developer-sol-d", type: "CLI agent", model: "gpt-6.1-sol",
    context: null, price: null, capabilities: CAPABILITIES, place: "OpenAI; the processing region of this Codex session is not declared",
    route: routeOf("developer-sol-d") }, "developer-sol-d");
});

// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; NO COST IS GUESSED
// given: the fixture register, whose row summariser, a model endpoint, declares the context 32000 and the price
//        `0.5 / 1.5 EUR per million tokens`
// input: participantsOf(the document that readRegister(participantSchema(), "docs/participants.md", the fixture) gives); of
//        it, the participant summariser
// expect: name "summariser", type "model endpoint", model "small-model", context 32000 — a number —, price { input 0.5,
//         output 1.5, currency "EUR" } — two numbers and a currency —, capabilities ["draft text"], place
//         "NHR@FAU, Erlangen", route "endpoint nhr"
test("participantsOf — a row with a context and a price read into numbers and a currency", () => {
  assert.deepEqual(participantsIn(FIXTURE).find((participant) => participant.name === "summariser"), SUMMARISER);
});

// ---------------------------------------------------------------- eligible, given the participants read

// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; A PARTICIPANT DECLARES ITS CAPABILITIES; UC-002
// given: the role Developers of Scrum, which needs `write to the repository` and `run code and tests` (UC-002, step 4); the
//        participants of the fixture register, read with participantsOf — alice, a person, and developer-a, a CLI agent at
//        this machine, each with all six capabilities; summariser, a model endpoint that can only draft text
// input: eligible(those participants, { capabilities: ["write to the repository", "run code and tests"] })
// expect: offered alice and developer-a, in the register's order, each as participantsOf reads it — with where it processes
//         data: alice none, as a person, developer-a "this machine" —; left out summariser, lacking both capabilities, each
//         named: every participant in exactly one of the two lists
test("eligible — given the participants read from a register, offers for a role exactly those with every capability it needs", () => {
  assert.deepEqual(eligible(participantsIn(FIXTURE), { capabilities: ["write to the repository", "run code and tests"] }), {
    eligible: [ALICE, DEVELOPER],
    leftOut: [
      { participant: SUMMARISER, reasons: ["lacks the capability \"write to the repository\"",
        "lacks the capability \"run code and tests\""] },
    ],
  });
});
