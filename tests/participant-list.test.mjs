// The participants and who may hold a role (ITM-216) — MOD-participant-list's interface as
// docs/architecture/MOD-participant-list.md states it, for UC-002: participantSchema, the schema of the instance's register
// docs/participants.md, and eligible, for the capabilities a role needs and the processing places a restricted source
// allows. differs is not part of ITM-216, and neither are a Need's size and notLike, which no step of UC-002 gives: none
// of them is tested here.
// Run: node --test tests/participant-list.test.mjs
//
// Module: MOD-participant-list
// Guards: UC-002; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT HAS ONE OF FIVE TYPES; A PARTICIPANT DECLARES ITS CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; A ROLE NAMES THE CAPABILITIES IT NEEDS; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// Every expected value is read from the module file. Its Data: the register `docs/participants.md` — a title, a sentence,
// and one table with one row per participant: Name; Type, one of five; Model, for every type but person; Context; Price;
// Capabilities, a list from six; Processing place, for every type but person; Route. Its Interfaces: `Participant`, one row
// of the register; `Need`, what a job or a role demands; `Eligibility`, every participant considered in exactly one of two
// lists; `participantSchema() -> Schema`; `eligible(participants, need) -> Eligibility`, with every reason a participant is
// left out, in words a person can act on.
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

// The six capabilities of A PARTICIPANT DECLARES ITS CAPABILITIES, in the module file's order.
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
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |",         // 7
  "|---|---|---|---|---|---|---|---|",                                                          // 8
];
// Line 9: a person, without a model and without a processing place.
const PERSON = "| alice | person | — | — | — | draft text, read the repository, write to the repository | — | "
  + "account github.com/alice |";
// Line 10: the module file's example row, a CLI agent with its model and its place.
const REVIEWER = "| reviewer-b | CLI agent | example-model | 200000 | — | draft text, read the repository | "
  + "this machine | bridge lab-pc agent claude |";

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

// guards: UC-002; PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
// given: the module loaded anew three times — (a) as in Node, with a disk that gives the real files; (b) as in a browser,
//        without a disk, whose fetch answers the module's own address with the text of the real participants.schema.md;
//        (c) as in a browser whose fetch answers 404 Not Found
// input: (a), (b): participantSchema(), and readRegister with it of the register of alice and reviewer-b
// expect: (a) one read, of src/participant-list/participants.schema.md from the disk; (b) one read, of the same address with
//         fetch; each gives a schema deep-equal to the one of the module as this file loaded it, which reads the register's
//         two rows, alice and reviewer-b. (c) one read, of the same address; the module does not load — a schema that cannot
//         be read stops its module (MOD-documents, loadSchema) — and the error names participants.schema.md and 404
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

// The columns of a row that the item names — its type, capabilities, processing place and model —, those that stand.
const NAMED = ["Type", "Model", "Processing place", "Capabilities"];
const namedCells = (cells) => Object.fromEntries(NAMED.filter((column) => column in cells).map((c) => [c, cells[c]]));

// guards: PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE; A PARTICIPANT HAS ONE OF FIVE TYPES; A PARTICIPANT DECLARES ITS
//         CAPABILITIES; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS
//         MODEL; UC-002
// given: this instance's register docs/participants.md as it stands — its table under its title, with no heading of its own
// input: readRegister(participantSchema(), "docs/participants.md", its text); its rows by their Name
// expect: among the rows, three participants, each with its type, capabilities, processing place and model as the register
//         writes them, a value written — left out:
//         - akmaier: Type person, Capabilities all six, no Model and no Processing place;
//         - developer-sol-d: Type CLI agent, Model gpt-6.1-sol, Capabilities all six, Processing place
//           "OpenAI; the processing region of this Codex session is not declared" — one place, its punctuation kept;
//         - reviewer-terra: Type CLI agent, Model gpt-5.6-terra, the same capabilities and place
test("participantSchema — this instance's register read into participants, each with its type, capabilities, processing place and model", () => {
  const { rows } = readRegister(participantSchema(), REGISTER_PATH, readFileSync(INSTANCE_REGISTER, "utf8"));
  const byName = new Map(rows.map((row) => [row.cells.Name, row.cells]));
  assert.deepEqual(namedCells(byName.get("akmaier") ?? {}), { Type: "person", Capabilities: CAPABILITIES }, "akmaier");
  assert.deepEqual(namedCells(byName.get("developer-sol-d") ?? {}), { Type: "CLI agent", Model: "gpt-6.1-sol",
    "Processing place": "OpenAI; the processing region of this Codex session is not declared", Capabilities: CAPABILITIES }, "developer-sol-d");
  assert.deepEqual(namedCells(byName.get("reviewer-terra") ?? {}), { Type: "CLI agent", Model: "gpt-5.6-terra",
    "Processing place": "OpenAI; the processing region of this Codex session is not declared", Capabilities: CAPABILITIES }, "reviewer-terra");
});

// ---------------------------------------------------------------- participantSchema: the register's errors

// guards: A PARTICIPANT HAS ONE OF FIVE TYPES; A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL; UC-002
// given: known positive first — the register of alice, a person without a model (line 9), and reviewer-b, a CLI agent with
//        its model (line 10), has no finding; then that register with one more row, line 11, of the type `assistant`, which
//        is not one of the five; then that register with four more rows, lines 11 to 14, one of each type that works with a
//        language model — model endpoint, CI agent, CLI agent, sandboxed agent —, each without its model
// input: documentFindings(participantSchema(), the register read with it), each finding in its text form
// expect: none for the known positive; for the type outside the five one error, on line 11, naming
//         A PARTICIPANT HAS ONE OF FIVE TYPES; for the participants without their model four errors, on lines 11 to 14, each
//         naming A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL — and none for alice, a person without one
test("participantSchema — an entry of a type outside the five, and a participant based on a language model without its model, named as errors", () => {
  assert.deepEqual(findingsOf(registerOf()), [], "known positive");
  assert.deepEqual(findingsOf(registerOf(
    "| helper | assistant | example-model | — | — | draft text | this machine | bridge lab-pc agent codex |",
  )), [
    "docs/participants.md:11: error: the column Type does not fit: \"assistant\" is not one of person, model endpoint, "
      + "CI agent, CLI agent, sandboxed agent [A PARTICIPANT HAS ONE OF FIVE TYPES] — correct the column Type of this row.",
  ]);
  const withoutModel = (line) => `docs/participants.md:${line}: error: the column Model is required where Type is not person, `
    + "and left out [A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL] — fill in the column Model of this row.";
  assert.deepEqual(findingsOf(registerOf(
    "| summariser | model endpoint | — | 32000 | 0.5 / 1.5 EUR per million tokens | draft text | NHR@FAU, Erlangen | endpoint nhr |",
    "| ci-tester | CI agent | — | — | — | read the repository, run code and tests | GitHub's hosted runners | ci hosted secret AGENT_KEY |",
    "| reviewer-c | CLI agent | — | 200000 | — | draft text, read the repository | this machine | bridge lab-pc agent claude |",
    "| sandbox | sandboxed agent | — | — | — | run code and tests | this machine | bridge lab-pc agent opencode |",
  )), [withoutModel(11), withoutModel(12), withoutModel(13), withoutModel(14)]);
});

// ---------------------------------------------------------------- eligible
//
// Participants of the type Participant, as the module file states it.

const ALICE = { name: "alice", type: "person", model: null, context: null, price: null, capabilities: CAPABILITIES,
  place: null, route: "account github.com/alice" };
const DEVELOPER = { name: "developer-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: CAPABILITIES, place: "this machine", route: "bridge lab-pc agent claude" };
const SUMMARISER = { name: "summariser", type: "model endpoint", model: "small-model", context: 32000,
  price: { input: 0.5, output: 1.5, currency: "EUR" }, capabilities: ["draft text"], place: "NHR@FAU, Erlangen",
  route: "endpoint nhr" };
const CI_TESTER = { name: "ci-tester", type: "CI agent", model: "example-model", context: null, price: null,
  capabilities: ["read the repository", "write to the repository"], place: "GitHub's hosted runners, in the USA",
  route: "ci hosted secret AGENT_KEY" };
const PROVIDER = { name: "reviewer-p", type: "CLI agent", model: "other-model", context: 200000, price: null,
  capabilities: CAPABILITIES, place: "Anthropic, a provider in the USA", route: "bridge lab-pc agent claude" };

// guards: A ROLE NAMES THE CAPABILITIES IT NEEDS; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; UC-002
// given: the role Developers of Scrum, which needs `write to the repository` and `run code and tests` (UC-002, step 4); four
//        participants — alice, a person, and developer-a, a CLI agent at this machine, each with all six capabilities;
//        summariser, a model endpoint that can only draft text; ci-tester, a CI agent that can read and write the
//        repository but not run code and tests
// input: eligible([alice, developer-a, summariser, ci-tester], { capabilities: ["write to the repository",
//        "run code and tests"] })
// expect: offered exactly alice and developer-a, in their order, each with where it processes data — alice none, as a
//         person, developer-a "this machine"; left out summariser, lacking both capabilities, each named, and ci-tester,
//         lacking `run code and tests`, named: every participant in exactly one of the two lists
test("eligible — offers for a role exactly the participants with every capability it needs, each with where it processes data", () => {
  const result = eligible([ALICE, DEVELOPER, SUMMARISER, CI_TESTER],
    { capabilities: ["write to the repository", "run code and tests"] });
  assert.deepEqual(result, {
    eligible: [ALICE, DEVELOPER],
    leftOut: [
      { participant: SUMMARISER, reasons: ["lacks the capability \"write to the repository\"",
        "lacks the capability \"run code and tests\""] },
      { participant: CI_TESTER, reasons: ["lacks the capability \"run code and tests\""] },
    ],
  });
  assert.deepEqual(result.eligible.map((p) => [p.name, p.place]), [["alice", null], ["developer-a", "this machine"]]);
});

// guards: RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; UC-002
// given: a need for `draft text` with the places of two restricted sources — SRC-iec-62304 allows "this machine" and
//        "NHR@FAU, Erlangen", SRC-customer-contract allows "this machine"; five participants — developer-a at this machine;
//        summariser at NHR@FAU, Erlangen; reviewer-p at "Anthropic, a provider in the USA"; alice, a person, who declares
//        no place; ci-tester, who cannot draft text, at "GitHub's hosted runners, in the USA"
// input: eligible([developer-a, summariser, reviewer-p, alice, ci-tester], that need)
// expect: offered developer-a alone; left out, each with every reason, in the order of the need — its capabilities, then
//         its sources —, each naming the place and the source: summariser for SRC-customer-contract; reviewer-p and alice for
//         both sources; ci-tester for the capability and both sources
test("eligible — leaves out a participant whose processing place a restricted source does not allow, naming the place and the source", () => {
  const need = { capabilities: ["draft text"], places: [
    { from: "SRC-iec-62304", allowed: ["this machine", "NHR@FAU, Erlangen"] },
    { from: "SRC-customer-contract", allowed: ["this machine"] },
  ] };
  const at = (place, from) => `processes data at "${place}", where the content of ${from} may not go`;
  const nowhere = (from) => `declares no processing place, so the content of ${from} may not go to it`;
  assert.deepEqual(eligible([DEVELOPER, SUMMARISER, PROVIDER, ALICE, CI_TESTER], need), {
    eligible: [DEVELOPER],
    leftOut: [
      { participant: SUMMARISER, reasons: [at("NHR@FAU, Erlangen", "SRC-customer-contract")] },
      { participant: PROVIDER, reasons: [at("Anthropic, a provider in the USA", "SRC-iec-62304"),
        at("Anthropic, a provider in the USA", "SRC-customer-contract")] },
      { participant: ALICE, reasons: [nowhere("SRC-iec-62304"), nowhere("SRC-customer-contract")] },
      { participant: CI_TESTER, reasons: ["lacks the capability \"draft text\"",
        at("GitHub's hosted runners, in the USA", "SRC-iec-62304"),
        at("GitHub's hosted runners, in the USA", "SRC-customer-contract")] },
    ],
  });
});
