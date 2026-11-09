// The participants and who may hold a role — MOD-participant-list's interface as docs/architecture/MOD-participant-list.md
// states it, for UC-002 and UC-017: participantSchema, the schema of the instance's register docs/participants.md — a
// name, a person or an agent, and an agent's model —, and eligible, for the capabilities a role needs and the processing
// places a restricted source allows, judged on the connection a participant runs on. A Need's size and notLike, and
// differs, are tested in tests/participant-list-fit.test.mjs; participantsOf in tests/participant-list-reader.test.mjs.
// Run: node --test tests/participant-list.test.mjs
//
// Module: MOD-participant-list
// Guards: UC-002; UC-017; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A CONNECTION DECLARES ITS CAPABILITIES; A CONNECTION DECLARES WHERE IT PROCESSES DATA; A ROLE NAMES THE CAPABILITIES IT NEEDS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL
// Level: unit
//
// Every expected value is read from the module file. Its Data: the register `docs/participants.md` — a title, a sentence,
// and one table with one row per participant: Name; Type, `person` or `agent`; Model, for an agent, `—` for a person. Its
// Interfaces: `Participant`, who does a job and where it runs — a person, an agent on one connection that offers its model
// with that connection's type, context, capabilities, place and route, or an agent that no connection given offers, of the
// type `agent` with none of them —; `Need`, what a job or a role demands; `Eligibility`, every participant considered in
// exactly one of two lists; `participantSchema() -> Schema`; `eligible(participants, need) -> Eligibility`, with every
// reason a participant is left out, in words a person can act on: that no connection offers its model, naming the model;
// a capability its connection lacks; a place of its connection a source does not allow.
//
// The register is read as every caller reads it: through MOD-documents' interface, with the schema participantSchema gives
// — the module offers no reader of its own (Interfaces, participantSchema) —, and its errors are those documentFindings
// names with that schema. This instance's register, docs/participants.md, is read as it stands and never changed. eligible
// is given participants of the type Participant, as the module file states it.
//
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is refused, the same call is first shown to succeed on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentFindings, readRegister } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";
import { eligible, participantSchema } from "../src/participant-list/index.mjs";

const MODULE = new URL("../src/participant-list/index.mjs", import.meta.url);
const SCHEMA_FILE = new URL("../src/participant-list/participants.schema.md", import.meta.url);
const INSTANCE_REGISTER = new URL("../docs/participants.md", import.meta.url);
const REGISTER_PATH = "docs/participants.md";

// The six capabilities of A CONNECTION DECLARES ITS CAPABILITIES, in the module file's order.
const CAPABILITIES = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools",
  "reach the web"];

// ---------------------------------------------------------------- a register
//
// A register in the module file's form: its title, a sentence, and its table under the title with no heading of its own.

const HEAD = [
  "# Participants of this instance",                                                             // 1 — the title, and the
  "",                                                                                            // 2   heading of the
  "**REGISTER**",                                                                                // 3   table's section
  "",                                                                                            // 4
  "The people and agents who work on the products of this instance, one row per participant.",  // 5
  "",                                                                                            // 6
  "| Name | Type | Model |",                                                                     // 7
  "|---|---|---|",                                                                               // 8
];
// Line 9: a person, without a model.
const PERSON = "| alice | person | — |";
// Line 10: the module file's example row, an agent with its model.
const REVIEWER = "| reviewer-b | agent | example-model |";

// The register of PERSON and REVIEWER, followed by these rows from line 11 on.
const registerOf = (...rows) => [...HEAD, PERSON, REVIEWER, ...rows, ""].join("\n");

// The findings of a register's text, read with participantSchema, each in its one text form.
function findingsOf(text) {
  const schema = participantSchema();
  return documentFindings(schema, readRegister(schema, REGISTER_PATH, text).document).map(formatFinding);
}

// ---------------------------------------------------------------- participantSchema: where the schema is read from
//
// The module reads its own participants.schema.md once, when it is loaded: from the disk where the platform offers
// `process.getBuiltinModule("node:fs")`, as Node does, and from its own address with `fetch` where it does not, as in a
// browser. Each case sets these two for one load of the module, loads it anew from its own address with a query of its own,
// `index.mjs?load=<n>`, and puts both back — as tests/spec-document-load.test.mjs loads MOD-spec-document. The real
// participants.schema.md is read, never changed.

// One load of the module, anew: `disk` is what process.getBuiltinModule("node:fs") gives it — undefined, as in a browser —,
// `fetch` the browser's fetch. -> { module, error, reads } — the module's namespace, or the error its load failed with; and
// every read of the load, as "disk <address>" or "fetch <address>".
let loads = 0;
async function load({ disk, fetch }) {
  const saved = { getBuiltinModule: process.getBuiltinModule, fetch: globalThis.fetch };
  const reads = [];
  process.getBuiltinModule = (name) => (name === "node:fs" ? disk?.(reads) : saved.getBuiltinModule.call(process, name));
  globalThis.fetch = fetch ? (url) => { reads.push(`fetch ${url}`); return fetch(url); } : undefined;
  try {
    loads += 1;
    return { module: await import(new URL(`?load=${loads}`, MODULE)), error: null, reads };
  } catch (error) {
    return { module: null, error, reads };
  } finally {
    process.getBuiltinModule = saved.getBuiltinModule;
    globalThis.fetch = saved.fetch;
  }
}

// A disk that gives the real file's text for a read, noting each read.
const realDisk = (reads) => ({
  readFileSync: (url, encoding) => { reads.push(`disk ${url}`); return readFileSync(url, encoding); },
});

// TST-472424 · level: unit · module: MOD-participant-list
// guards: UC-002; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: the module loaded anew three times — (a) as in Node, with a disk that gives the real files; (b) as in a browser, without a disk, whose fetch answers the module's own address with the text of the real participants.schema.md; (c) as in a browser whose fetch answers 404 Not Found
// input: (a), (b): participantSchema(), and readRegister with it of the register of alice and reviewer-b
// expect: (a) one read, of src/participant-list/participants.schema.md from the disk; (b) one read, of the same address with fetch; each gives a schema deep-equal to the one of the module as this file loaded it, which reads the register's two rows, alice and reviewer-b. (c) one read, of the same address; the module does not load — a schema that cannot be read stops its module (MOD-documents, loadSchema) — and the error names participants.schema.md and 404
test("participantSchema — the register's schema is read from the module's own participants.schema.md: from the disk in Node, from its own address in a browser", async () => {
  const text = readFileSync(SCHEMA_FILE, "utf8");
  const onDisk = await load({ disk: realDisk });
  const atAddress = await load({ disk: undefined, fetch: async () => new Response(text, { status: 200 }) });
  for (const [where, loaded, read] of [["disk", onDisk, "disk"], ["address", atAddress, "fetch"]]) {
    assert.equal(loaded.error, null, `${where}: the module loads: ${loaded.error?.message}`);
    assert.deepEqual(loaded.reads, [`${read} ${SCHEMA_FILE.href}`], where);
    const schema = loaded.module.participantSchema();
    assert.deepEqual(schema, participantSchema(), where);
    const { rows } = readRegister(schema, REGISTER_PATH, registerOf());
    assert.deepEqual(rows.map((row) => row.cells.Name), ["alice", "reviewer-b"], where);
  }
  const notServed = await load({ disk: undefined, fetch: async () => new Response("Not Found", { status: 404 }) });
  assert.deepEqual(notServed.reads, [`fetch ${SCHEMA_FILE.href}`]);
  assert.equal(notServed.module, null, "a schema that cannot be read stops the module");
  assert.ok(notServed.error instanceof Error && notServed.error.message.includes("participants.schema.md")
    && notServed.error.message.includes("404"), `the error names participants.schema.md and 404: ${notServed.error?.message}`);
});

// ---------------------------------------------------------------- participantSchema: the instance's register read with it

// TST-20261109101 · level: unit · module: MOD-participant-list
// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; UC-017
// given: this instance's register docs/participants.md as it stands — its table under its title, with no heading of its own
// input: readRegister(participantSchema(), "docs/participants.md", its text); its rows by their Name, and the columns of the schema's table
// expect: the table's columns are Name, Type and Model, nothing else; among the rows: - akmaier: Type person, no Model; - developer-opus-e: Type agent, Model claude-opus-5-5; - developer-sonnet-f: Type agent, Model claude-sonnet-5-5
test("participantSchema — this instance's register read into its people and agents, each agent with its model", () => {
  const { rows } = readRegister(participantSchema(), REGISTER_PATH, readFileSync(INSTANCE_REGISTER, "utf8"));
  assert.deepEqual(participantSchema().sections[0].table.columns.map((column) => column.name), ["Name", "Type", "Model"]);
  const byName = new Map(rows.map((row) => [row.cells.Name, row.cells]));
  assert.deepEqual(byName.get("akmaier"), { Name: "akmaier", Type: "person" }, "akmaier");
  assert.deepEqual(byName.get("developer-opus-e"), { Name: "developer-opus-e", Type: "agent", Model: "claude-opus-5-5" });
  assert.deepEqual(byName.get("developer-sonnet-f"), { Name: "developer-sonnet-f", Type: "agent",
    Model: "claude-sonnet-5-5" });
});

// ---------------------------------------------------------------- participantSchema: the register's errors

// TST-20261109102 · level: unit · module: MOD-participant-list
// guards: A PARTICIPANT IS A PERSON OR AN AGENT; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; UC-017
// given: known positive first — the register of alice, a person without a model (line 9), and reviewer-b, an agent with its model (line 10), has no finding; then that register with one more row, line 11, of the type `CLI agent`, which is neither a person nor an agent; then that register with one more row, line 11, an agent without its model
// input: documentFindings(participantSchema(), the register read with it), each finding in its text form
// expect: none for the known positive; for the type `CLI agent` one error, on line 11, naming A PARTICIPANT IS A PERSON OR AN AGENT; for the agent without its model one error, on line 11, naming A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL — and none for alice, a person without one
test("participantSchema — a row of another type than person or agent, and an agent without its model, named as errors", () => {
  assert.deepEqual(findingsOf(registerOf()), [], "known positive");
  assert.deepEqual(findingsOf(registerOf("| helper | CLI agent | example-model |")), [
    "docs/participants.md:11: error: the column Type does not fit: \"CLI agent\" is not one of person, agent "
      + "[A PARTICIPANT IS A PERSON OR AN AGENT] — correct the column Type of this row.",
  ]);
  assert.deepEqual(findingsOf(registerOf("| developer-c | agent | — |")), [
    "docs/participants.md:11: error: the column Model is required where Type is not person, and left out "
      + "[A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL] — fill in the column Model of this row.",
  ]);
});

// ---------------------------------------------------------------- eligible
//
// Participants of the type Participant, as the module file states it: a person; agents on the connections that offer
// their models; an agent whose model no connection given offers.

const ALICE = { name: "alice", type: "person", model: null, context: null, capabilities: [], place: null, route: null };
const DEVELOPER = { name: "developer-a", type: "CLI agent", model: "example-model", context: 200000,
  capabilities: CAPABILITIES, place: "this machine", route: "bridge lab-pc agent claude" };
const SUMMARISER = { name: "summariser", type: "model endpoint", model: "small-model", context: 32000,
  capabilities: ["draft text", "read the repository"], place: "NHR@FAU, Erlangen", route: "endpoint nhr" };
const PROVIDER = { name: "reviewer-p", type: "CLI agent", model: "other-model", context: 200000,
  capabilities: CAPABILITIES, place: "Anthropic, a provider in the USA", route: "bridge lab-pc agent codex" };
const UNREACHED = { name: "developer-b", type: "agent", model: "absent-model", context: null, capabilities: [],
  place: null, route: null };

// TST-20261109103 · level: unit · module: MOD-participant-list
// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; A CONNECTION DECLARES ITS CAPABILITIES; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-002
// given: the role Developers of Scrum, which needs `write to the repository` and `run code and tests` (UC-002, step 4); four participants — developer-a, an agent on a Bridge's coding agent that declares all six capabilities; summariser, an agent on a model endpoint that can draft text and read the repository; developer-b, an agent whose model absent-model no connection offers; alice, a person
// input: eligible([developer-a, summariser, developer-b, alice], { capabilities: ["write to the repository", "run code and tests"] })
// expect: offered developer-a alone; left out summariser, its connection lacking both capabilities, each named; developer-b, naming that no connection offers its model absent-model, and nothing of a connection it has none of; alice, a person, who runs on no connection, lacking both: every participant in exactly one of the two lists
test("eligible — offers for a role exactly the participants whose connection has every capability it needs, and names a model no connection offers", () => {
  assert.deepEqual(eligible([DEVELOPER, SUMMARISER, UNREACHED, ALICE],
    { capabilities: ["write to the repository", "run code and tests"] }), {
    eligible: [DEVELOPER],
    leftOut: [
      { participant: SUMMARISER, reasons: ["lacks the capability \"write to the repository\"",
        "lacks the capability \"run code and tests\""] },
      { participant: UNREACHED, reasons: ["no connection offers its model absent-model"] },
      { participant: ALICE, reasons: ["lacks the capability \"write to the repository\"",
        "lacks the capability \"run code and tests\""] },
    ],
  });
});

// TST-20261109104 · level: unit · module: MOD-participant-list
// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A CONNECTION DECLARES WHERE IT PROCESSES DATA; UC-002
// given: a need for `draft text` with the places of two restricted sources — SRC-iec-62304 allows "this machine" and "NHR@FAU, Erlangen", SRC-customer-contract allows "this machine"; three agents on their connections — developer-a at this machine; summariser at NHR@FAU, Erlangen; reviewer-p at "Anthropic, a provider in the USA"
// input: eligible([developer-a, summariser, reviewer-p], that need)
// expect: offered developer-a alone; left out, each with every reason, in the order of the need's sources, each naming the place of its connection and the source: summariser for SRC-customer-contract; reviewer-p for both sources
test("eligible — leaves out a participant whose connection processes data where a restricted source does not allow, naming the place and the source", () => {
  const need = { capabilities: ["draft text"], places: [
    { from: "SRC-iec-62304", allowed: ["this machine", "NHR@FAU, Erlangen"] },
    { from: "SRC-customer-contract", allowed: ["this machine"] },
  ] };
  const at = (place, from) => `processes data at "${place}", where the content of ${from} may not go`;
  assert.deepEqual(eligible([DEVELOPER, SUMMARISER, PROVIDER], need), {
    eligible: [DEVELOPER],
    leftOut: [
      { participant: SUMMARISER, reasons: [at("NHR@FAU, Erlangen", "SRC-customer-contract")] },
      { participant: PROVIDER, reasons: [at("Anthropic, a provider in the USA", "SRC-iec-62304"),
        at("Anthropic, a provider in the USA", "SRC-customer-contract")] },
    ],
  });
});
