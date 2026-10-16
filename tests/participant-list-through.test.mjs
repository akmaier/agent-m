// A subagent is reached through the agent that starts it (ITM-483) — MOD-participant-list's interface as
// docs/architecture/MOD-participant-list.md states it: the route `through <participant>` in the register's Route column, a
// model endpoint's route with ` secret <NAME>`, reachedThrough, and eligible leaving out a subagent whose `through` names
// no CLI agent of the register, or itself.
// Run: node --test tests/participant-list-through.test.mjs
//
// Module: MOD-participant-list
// Guards: UC-017; UC-049; A PARTICIPANT DECLARES ITS CAPABILITIES; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: unit
//
// Every expected value is written in the test's own text, from the module file's Data (Route: "`through <participant>` for a
// subagent, a CLI or sandboxed agent that another CLI agent of the register starts, naming that agent; a model endpoint's
// route may add ` secret <NAME>`") and Interfaces (reachedThrough: "the name of the participant a subagent is reached
// through, from a route `through <participant>`, or `null` for every other route"; eligible: "A subagent whose `through`
// names no CLI agent of the register, or itself, is left out by `eligible`, with that reason"), and from the values the
// sprint's selection gives: the route is the word `through`, one space and a participant's name; only a `CLI agent` may start
// a subagent; eligible checks against the participants it is given; its reasons are `reached through itself` and
// `reached through <name>, which is no CLI agent of the register`. No expected value is read from a document.
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is left out, the same call is first shown to keep a participant that fits. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readRegister } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";
import { eligible, participantSchema, participantsOf, reachedThrough } from "../src/participant-list/index.mjs";

const DRAFTING = ["draft text"];

// Participants of the type Participant, as the module file states it.
const participant = (name, type, route, extra = {}) => ({ name, type, model: type === "person" ? null : "example-model",
  context: 200000, price: null, capabilities: DRAFTING, place: type === "person" ? null : "this machine", route, ...extra });
const STARTER = participant("starter-a", "CLI agent", "bridge lab-pc agent claude");
const OTHER_STARTER = participant("starter-b", "CLI agent", "bridge lab-pc agent codex");
const SUB_OF_A = participant("sub-a", "CLI agent", "through starter-a");
const SANDBOXED_SUB = participant("sub-box", "sandboxed agent", "through starter-a");
const ALICE = participant("alice", "person", "account github.com/alice");
const ENDPOINT = participant("nhr", "model endpoint", "endpoint nhr");
const SANDBOX = participant("box", "sandboxed agent", "bridge lab-pc agent opencode");
const CI = participant("ci-a", "CI agent", "ci hosted secret AGENT_KEY");

// ---------------------------------------------------------------- a register with a subagent
//
// A register in the module file's form, read as every caller reads it: with participantSchema through MOD-documents.

const registerOf = (...rows) => [
  "# Participants of this instance", "", "**REGISTER**", "", "The people and agents who work on the products of this instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  ...rows, "",
].join("\n");
const row = (name, type, route) => `| ${name} | ${type} | ${type === "person" ? "—" : "example-model"} | — | — | draft text | `
  + `${type === "person" ? "—" : "this machine"} | ${route} |`;

function readOf(text) {
  const schema = participantSchema();
  const { document } = readRegister(schema, "docs/participants.md", text);
  return { findings: documentFindings(schema, document).map(formatFinding), participants: participantsOf(document) };
}

// TST-483001 · level: unit · module: MOD-participant-list
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a register of eight rows, one with each earlier route and the new ones — alice `account github.com/alice`; nhr `endpoint nhr`; nhr-ci `endpoint nhr secret NHR_KEY`; ci-a `ci hosted secret AGENT_KEY`; ci-b `ci runner:lab secret AGENT_KEY`; starter-a `bridge lab-pc agent claude`; sub-a, a CLI agent, `through starter-a`; sub-box, a sandboxed agent, `through starter-a`
// input: the register read with participantSchema, its findings by documentFindings, and participantsOf
// expect: no finding; eight participants in the rows' order whose routes are exactly the eight texts above
test("the register — a subagent's route, a model endpoint's secret and every earlier route are read without a finding", () => {
  const routes = ["account github.com/alice", "endpoint nhr", "endpoint nhr secret NHR_KEY", "ci hosted secret AGENT_KEY",
    "ci runner:lab secret AGENT_KEY", "bridge lab-pc agent claude", "through starter-a", "through starter-a"];
  const types = ["person", "model endpoint", "model endpoint", "CI agent", "CI agent", "CLI agent", "CLI agent", "sandboxed agent"];
  const names = ["alice", "nhr", "nhr-ci", "ci-a", "ci-b", "starter-a", "sub-a", "sub-box"];
  const { findings, participants } = readOf(registerOf(...names.map((name, i) => row(name, types[i], routes[i]))));
  assert.deepEqual(findings, []);
  assert.deepEqual(participants.map((p) => p.route), routes);
  assert.deepEqual(participants.map((p) => p.name), names);
});

// ---------------------------------------------------------------- reachedThrough

// TST-483002 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: sub-a, whose route is `through starter-a`; sub-box, a sandboxed agent, `through starter-a`; a subagent `through reviewer-9`
// input: reachedThrough of each
// expect: "starter-a" for sub-a; "starter-a" for sub-box; "reviewer-9" — the name after the word and one space, as written
test("reachedThrough — names the participant a subagent is reached through", () => {
  assert.equal(reachedThrough(SUB_OF_A), "starter-a");
  assert.equal(reachedThrough(SANDBOXED_SUB), "starter-a");
  assert.equal(reachedThrough(participant("sub-9", "CLI agent", "through reviewer-9")), "reviewer-9");
});

// TST-483003 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: sub-a, `through starter-a`, shown to give "starter-a"; participants with each other route — `account github.com/alice`; `endpoint nhr`; `endpoint nhr secret NHR_KEY`; `ci hosted secret AGENT_KEY`; `ci runner:lab secret AGENT_KEY`; `bridge lab-pc agent claude`
// input: reachedThrough of each
// expect: "starter-a" for sub-a; null for each of the six others
test("reachedThrough — null for every route that is not a subagent's", () => {
  assert.equal(reachedThrough(SUB_OF_A), "starter-a");
  for (const route of ["account github.com/alice", "endpoint nhr", "endpoint nhr secret NHR_KEY", "ci hosted secret AGENT_KEY",
    "ci runner:lab secret AGENT_KEY", "bridge lab-pc agent claude"]) {
    assert.equal(reachedThrough(participant("x", "CLI agent", route)), null, route);
  }
});

// TST-483004 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: sub-a, `through starter-a`, shown to give "starter-a"; routes that are not the word `through`, one space and a name — `through`, `through ` (no name), `through  starter-a` (two spaces), `throughout starter-a`, ` through starter-a` (a space before), `Through starter-a`
// input: reachedThrough of a participant with each route
// expect: "starter-a" for sub-a; null for each of the six
test("reachedThrough — the route is the word through, one space and a name: nothing else is a subagent's route", () => {
  assert.equal(reachedThrough(SUB_OF_A), "starter-a");
  for (const route of ["through", "through ", "through  starter-a", "throughout starter-a", " through starter-a", "Through starter-a"]) {
    assert.equal(reachedThrough(participant("x", "CLI agent", route)), null, JSON.stringify(route));
  }
});

// ---------------------------------------------------------------- eligible

// TST-483005 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: a need for `draft text`; starter-a, a CLI agent; sub-a, a CLI agent `through starter-a`; sub-box, a sandboxed agent `through starter-a`
// input: eligible([starter-a, sub-a, sub-box], that need)
// expect: all three offered, in that order; none left out — a subagent whose starter is a CLI agent of the given participants is kept
test("eligible — keeps a subagent whose starter is a CLI agent among the participants given", () => {
  assert.deepEqual(eligible([STARTER, SUB_OF_A, SANDBOXED_SUB], { capabilities: DRAFTING }),
    { eligible: [STARTER, SUB_OF_A, SANDBOXED_SUB], leftOut: [] });
});

// TST-483006 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: a need for `draft text`; starter-a, a CLI agent, shown offered; self-sub, a CLI agent whose route is `through self-sub`
// input: eligible([starter-a, self-sub], that need)
// expect: starter-a offered; self-sub left out with the one reason `reached through itself` — not also the reason of a starter that is no CLI agent
test("eligible — leaves out a subagent whose through names itself, with that reason", () => {
  const selfSub = participant("self-sub", "CLI agent", "through self-sub");
  assert.deepEqual(eligible([STARTER, selfSub], { capabilities: DRAFTING }),
    { eligible: [STARTER], leftOut: [{ participant: selfSub, reasons: ["reached through itself"] }] });
});

// TST-483007 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: a need for `draft text`; starter-a, a CLI agent, shown offered; alice (a person), nhr (a model endpoint), box (a sandboxed agent) and ci-a (a CI agent), each given; a subagent `through <that participant>` for each of the four
// input: eligible([starter-a, alice, nhr, box, ci-a, and the four subagents], that need)
// expect: starter-a and the four starters offered as they are; each of the four subagents left out with the one reason `reached through <name>, which is no CLI agent of the register`, the name that of the participant it names — alice, nhr, box, ci-a
test("eligible — leaves out a subagent whose through names a given participant that is no CLI agent, with that reason", () => {
  const starters = [ALICE, ENDPOINT, SANDBOX, CI];
  const subs = starters.map((starter) => participant(`sub-of-${starter.name}`, "CLI agent", `through ${starter.name}`));
  const result = eligible([STARTER, ...starters, ...subs], { capabilities: DRAFTING });
  assert.deepEqual(result.eligible, [STARTER, ...starters]);
  assert.deepEqual(result.leftOut, subs.map((sub, i) => ({ participant: sub,
    reasons: [`reached through ${starters[i].name}, which is no CLI agent of the register`] })));
});

// TST-483008 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: a need for `draft text`; sub-a `through starter-a`, shown offered when starter-a is given; starter-a is not given
// input: eligible([sub-a], that need), and eligible([starter-a, sub-a], that need)
// expect: with starter-a given, sub-a offered; with sub-a alone, sub-a left out with the one reason `reached through starter-a, which is no CLI agent of the register` — eligible reads nothing but the participants it is given; and likewise a subagent `through nobody` is left out with `reached through nobody, which is no CLI agent of the register`
test("eligible — checks only against the participants it is given: a starter that is not given is none", () => {
  assert.deepEqual(eligible([STARTER, SUB_OF_A], { capabilities: DRAFTING }).eligible, [STARTER, SUB_OF_A]);
  assert.deepEqual(eligible([SUB_OF_A], { capabilities: DRAFTING }), { eligible: [],
    leftOut: [{ participant: SUB_OF_A, reasons: ["reached through starter-a, which is no CLI agent of the register"] }] });
  const lost = participant("lost", "sandboxed agent", "through nobody");
  assert.deepEqual(eligible([STARTER, lost], { capabilities: DRAFTING }).leftOut,
    [{ participant: lost, reasons: ["reached through nobody, which is no CLI agent of the register"] }]);
});

// TST-483009 · level: unit · module: MOD-participant-list
// guards: UC-017; UC-049
// given: a need for `draft text` and `use tools`; starter-a and starter-b, CLI agents; sub-a `through starter-a` with only `draft text`; sub-b `through starter-b` with both capabilities
// input: eligible([starter-a, starter-b, sub-a, sub-b], that need) — starters given with both capabilities
// expect: sub-b offered, since its starter is given; sub-a left out for the capability it lacks, named, and not for its starter — the starter reasons judge only the route
test("eligible — a subagent is judged by its starter and by the need alike: each reason stands for itself", () => {
  const both = { capabilities: [...DRAFTING, "use tools"] };
  const a = { ...STARTER, ...both };
  const b = { ...OTHER_STARTER, ...both };
  const subA = { ...SUB_OF_A };
  const subB = { ...participant("sub-b", "CLI agent", "through starter-b"), ...both };
  assert.deepEqual(eligible([a, b, subA, subB], { capabilities: both.capabilities }), {
    eligible: [a, b, subB],
    leftOut: [{ participant: subA, reasons: ['lacks the capability "use tools"'] }],
  });
});
