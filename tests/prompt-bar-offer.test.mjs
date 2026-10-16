// The participants the prompt bar offers, the reasons it keeps a message from being sent, and the draft and running message it gives
// (ITM-504) — offer.mjs, send.mjs's whyNot, and bar.mjs's latestDraft and currentJob, as the accepted text of
// docs/architecture/MOD-prompt-bar.md and UC-049 (Precondition, 1a, 1b, 3a) state them. The module file names no function for the offer;
// offer.mjs gives `readParticipants(snapshot)`, `offeredAmong(participants, store)` and `placeOf(participant)`, which these tests call
// directly (the gap is named in the pull request).
// Run: node --test tests/prompt-bar-offer.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; THE PAGE NAMES WHERE IT SENDS; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA; A PARTICIPANT DECLARES ITS CAPABILITIES
// Level: unit
//
// The store is the browser store over fixture storages; no request leaves this process. Each test states its input and its expected result
// in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { openStore, writeSetting, writeTabValue } from "../src/browser-store/index.mjs";
import { currentJob, latestDraft } from "../src/prompt-bar/index.mjs";
import { offeredAmong, placeOf, readParticipants } from "../src/prompt-bar/offer.mjs";
import { whyNot } from "../src/prompt-bar/send.mjs";

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  return openStore("alice/agent-m");
}

const COLUMNS = "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|";
const row = (name, type, route, { place = "Anthropic, USA", context = "200000" } = {}) =>
  `| ${name} | ${type} | ${type === "person" ? "—" : "model-x"} | ${context} | — | draft text | ${type === "person" ? "—" : place} | ${route} |`;
const register = (...rows) => `# Participants of this instance\n\n${COLUMNS}\n${rows.join("\n")}\n`;
const snapshotOf = (files) => ({ read: async (path) => files[path] ?? null });

const ROWS = [
  row("ep-local", "model endpoint", "endpoint local"),
  row("ep-missing", "model endpoint", "endpoint nowhere"),
  row("ep-bridged", "model endpoint", "endpoint viabridge"),
  row("ep-lost-bridge", "model endpoint", "endpoint lostbridge"),
  row("cli-on-bridge", "CLI agent", "bridge mac agent claude"),
  row("cli-no-bridge", "CLI agent", "bridge gone agent claude"),
  row("sub", "CLI agent", "through cli-on-bridge"),
  row("box", "sandboxed agent", "bridge mac agent opencode"),
  row("ci", "CI agent", "ci hosted secret CI_KEY"),
  row("alice", "person", "the GitHub account `alice`"),
];

// TST-600010 · level: unit · module: MOD-prompt-bar
// guards: UC-049 (Precondition, 1b); THE PAGE NAMES WHERE IT SENDS
// given: a register of ten participants — endpoints ep-local (setting stored), ep-missing (no setting), ep-bridged (setting stored, naming the stored Bridge mac), ep-lost-bridge (setting stored, naming a Bridge not stored); CLI agent cli-on-bridge (Bridge mac stored), cli-no-bridge (Bridge not stored), sub (route `through cli-on-bridge`); sandboxed agent box (Bridge mac stored); CI agent ci; person alice
// input: readParticipants(snapshot), then offeredAmong(participants, store)
// expect: ten participants read in the register's order; offered, in that order: ep-local, ep-bridged, cli-on-bridge, box — and none of ep-missing, ep-lost-bridge, cli-no-bridge, sub, ci, alice
test("offeredAmong — an endpoint or an agent this browser reaches; never a subagent, a CI agent or a person", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:local", { kind: "openai-compatible", url: "https://models.example/v1", model: "m", key: "k" });
  writeSetting(store, "endpoint:viabridge", { kind: "openai-compatible", url: "http://localhost:11434/v1", model: "m", key: null, bridge: "mac" });
  writeSetting(store, "endpoint:lostbridge", { kind: "openai-compatible", url: "http://localhost:11434/v1", model: "m", key: null, bridge: "lost" });
  writeSetting(store, "bridge:mac", { address: "http://localhost:7777", token: "t" });
  const participants = await readParticipants(snapshotOf({ "docs/participants.md": register(...ROWS) }));
  assert.deepEqual(participants.map((each) => each.name), ["ep-local", "ep-missing", "ep-bridged", "ep-lost-bridge", "cli-on-bridge", "cli-no-bridge", "sub", "box", "ci", "alice"]);
  assert.deepEqual(offeredAmong(participants, store).map((each) => each.name), ["ep-local", "ep-bridged", "cli-on-bridge", "box"]);
});

// TST-600011 · level: unit · module: MOD-prompt-bar
// guards: UC-049 (1a); THE PAGE NAMES WHERE IT SENDS
// given: a store that keeps no endpoint and no Bridge, a register of one endpoint and one CLI agent; and an instance with no register at all
// input: offeredAmong over the first register's participants; readParticipants over a snapshot without docs/participants.md
// expect: nothing offered for the first; no participants (an empty list) for the second
test("offeredAmong — with nothing configured in this browser nothing is offered; an instance without a register has no participants", async () => {
  const store = freshStore();
  const participants = await readParticipants(snapshotOf({ "docs/participants.md": register(row("ep-local", "model endpoint", "endpoint local"), row("cli", "CLI agent", "bridge mac agent claude")) }));
  assert.equal(participants.length, 2);
  assert.deepEqual(offeredAmong(participants, store), []);
  assert.deepEqual(await readParticipants(snapshotOf({})), []);
});

// TST-600012 · level: unit · module: MOD-prompt-bar
// guards: THE PAGE NAMES WHERE IT SENDS; A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
// given: a participant whose place is "Anthropic, USA" and one whose place is null
// input: placeOf for each
// expect: "Anthropic, USA" for the first; "no processing place declared" for the second — never an empty name
test("placeOf — the declared place, or the statement that none is declared", () => {
  assert.equal(placeOf({ place: "Anthropic, USA" }), "Anthropic, USA");
  assert.equal(placeOf({ place: null }), "no processing place declared");
});

// TST-600013 · level: unit · module: MOD-prompt-bar
// guards: UC-049 (3a); UC-019 (4a, 4b)
// given: a prepared job with one finding that keeps it from starting, and one that does not fit the participant tiny (context 100, size 400), with the offered participants tiny, big (context 1000) and unknown (no context)
// input: whyNot(prepared, offered)
// expect: two lines — the finding in MOD-text-tools' one-line form, and "tiny does not hold this message: its context holds 100 tokens, the job needs about 400. Choose big, whose context is larger."
test("whyNot — a finding that keeps the job from starting, and the participant it does not fit, with a larger one offered", () => {
  const blocking = { artifact: "docs/participants.md", line: 1, kind: "error", rule: "A PARTICIPANT DECLARES ITS CAPABILITIES", what: "tiny cannot draft text", fix: "choose one that can" };
  const prepared = { blocking: [blocking], notFitting: [{ participant: { name: "tiny" }, size: 400, context: 100 }] };
  const offered = [{ name: "tiny", context: 100 }, { name: "big", context: 1000 }, { name: "unknown", context: null }];
  assert.deepEqual(whyNot(prepared, offered), [
    "docs/participants.md:1: error: tiny cannot draft text [A PARTICIPANT DECLARES ITS CAPABILITIES] — choose one that can.",
    "tiny does not hold this message: its context holds 100 tokens, the job needs about 400. Choose big, whose context is larger.",
  ]);
  assert.deepEqual(whyNot({ blocking: [], notFitting: [] }, offered), []);
});

// TST-600014 · level: unit · module: MOD-prompt-bar
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a store whose tab keeps a draft for the subject "use-case:UC-007", and a store whose tab keeps none
// input: latestDraft(store, "use-case:UC-007") and latestDraft(store, "use-case:UC-008") on the first; latestDraft(store, "use-case:UC-007") on the second
// expect: the draft itself for the first subject; null for the other subject; null where the tab keeps no draft
test("latestDraft — the draft only for the subject it was drafted on", () => {
  const store = freshStore();
  const draft = { subject: "use-case:UC-007", kind: "converse", participant: "ep-local", params: {}, result: { draft: { answer: "A" } } };
  writeTabValue(store, "prompt-bar:draft", draft);
  assert.deepEqual(latestDraft(store, "use-case:UC-007"), draft);
  assert.equal(latestDraft(store, "use-case:UC-008"), null);
  assert.equal(latestDraft(freshStore(), "use-case:UC-007"), null);
});

// TST-600015 · level: unit · module: MOD-prompt-bar
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: no message running in this tab
// input: currentJob()
// expect: null
test("currentJob — null while no message runs", () => {
  assert.equal(currentJob(), null);
});
