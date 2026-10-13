// Whether a participant's context holds a job, and whether it differs from the participants it must differ from —
// MOD-participant-list's interface as docs/architecture/MOD-participant-list.md states it: a Need's size and notLike, which
// eligible judges, and differs. They are what MOD-job-runner's prepareJob asks before anything is sent. The capabilities
// and places eligible judges are tested in tests/participant-list.test.mjs.
// Run: node --test tests/participant-list-fit.test.mjs
//
// Module: MOD-participant-list
// Guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; NO REVIEWER IS THE DRAFTER; NO CHECKER IS THE REWRITER
// Level: unit
//
// Every expected value is read from the module file's Interfaces: eligible leaves out a participant "a context smaller than
// the size of the job, or none declared", and one "that it is, or uses the model of, a participant it must differ from";
// differs(a, b) is "true when the two are different participants and name different models; false when either names no
// model". Each test states its input and its expected result before it runs (given / input / expect); where a test asserts
// that something is left out, the same call is first shown to keep a participant that fits. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { differs, eligible } from "../src/participant-list/index.mjs";

const DRAFTING = ["draft text"];

// Participants of the type Participant, as the module file states it.
const ALICE = { name: "alice", type: "person", model: null, context: null, price: null, capabilities: DRAFTING, place: null,
  route: "account github.com/alice" };
const DRAFTER = { name: "drafter-a", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: DRAFTING, place: "this machine", route: "bridge lab-pc agent claude" };
const SAME_MODEL = { name: "drafter-b", type: "CLI agent", model: "example-model", context: 200000, price: null,
  capabilities: DRAFTING, place: "this machine", route: "bridge lab-pc agent codex" };
const OTHER_MODEL = { name: "reviewer-c", type: "model endpoint", model: "other-model", context: 32000, price: null,
  capabilities: DRAFTING, place: "NHR@FAU, Erlangen", route: "endpoint nhr" };
const NO_CONTEXT = { name: "ci-drafter", type: "CI agent", model: "third-model", context: null, price: null,
  capabilities: DRAFTING, place: "GitHub's hosted runners, in the USA", route: "ci hosted secret AGENT_KEY" };

// ---------------------------------------------------------------- eligible: the size of the job

// TST-472416 · level: unit · module: MOD-participant-list
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a need for `draft text` of 50000 tokens; drafter-a, whose context holds 200000 tokens; reviewer-c, whose context holds 32000; ci-drafter, which declares no context
// input: eligible([drafter-a, reviewer-c, ci-drafter], that need)
// expect: offered drafter-a alone; reviewer-c left out naming its 32000 tokens and the job's 50000; ci-drafter left out naming that it declares no context size and the job's 50000 — every participant in exactly one list
test("eligible — leaves out a participant whose context is smaller than the job, or that declares none, naming both sizes", () => {
  assert.deepEqual(eligible([DRAFTER, OTHER_MODEL, NO_CONTEXT], { capabilities: DRAFTING, size: 50000 }), {
    eligible: [DRAFTER],
    leftOut: [
      { participant: OTHER_MODEL, reasons: ["its context holds 32000 tokens, fewer than the 50000 of the job"] },
      { participant: NO_CONTEXT, reasons: ["declares no context size, so the 50000 tokens of the job may not fit"] },
    ],
  });
});

// TST-472417 · level: unit · module: MOD-participant-list
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
// given: a need for `draft text` of exactly 32000 tokens, and of 32001; reviewer-c, whose context holds 32000
// input: eligible([reviewer-c], each need)
// expect: offered for 32000 — a context as large as the job holds it —; left out for 32001
test("eligible — a context exactly as large as the job holds it; one token more does not fit", () => {
  assert.deepEqual(eligible([OTHER_MODEL], { capabilities: DRAFTING, size: 32000 }).eligible, [OTHER_MODEL]);
  assert.deepEqual(eligible([OTHER_MODEL], { capabilities: DRAFTING, size: 32001 }).leftOut,
    [{ participant: OTHER_MODEL, reasons: ["its context holds 32000 tokens, fewer than the 32001 of the job"] }]);
});

// ---------------------------------------------------------------- eligible: the participants it must differ from

// TST-472418 · level: unit · module: MOD-participant-list
// guards: NO REVIEWER IS THE DRAFTER; NO CHECKER IS THE REWRITER
// given: a need for `draft text` that must differ from drafter-a; four participants — drafter-a itself; drafter-b, another participant with drafter-a's model; reviewer-c, another participant with another model; alice, a person, who names no model
// input: eligible([drafter-a, drafter-b, reviewer-c, alice], that need)
// expect: offered reviewer-c alone; left out drafter-a, naming that it is drafter-a; drafter-b, naming drafter-a's model; alice, naming that she names no model, so she cannot be shown to differ
test("eligible — leaves out a participant that is, or uses the model of, one it must differ from", () => {
  assert.deepEqual(eligible([DRAFTER, SAME_MODEL, OTHER_MODEL, ALICE], { capabilities: DRAFTING, notLike: [DRAFTER] }), {
    eligible: [OTHER_MODEL],
    leftOut: [
      { participant: DRAFTER, reasons: ["is drafter-a, from which it must differ"] },
      { participant: SAME_MODEL, reasons: ["uses the model example-model of drafter-a, from which it must differ"] },
      { participant: ALICE, reasons: ["names no model, so it cannot be shown to differ from drafter-a"] },
    ],
  });
});

// TST-472419 · level: unit · module: MOD-participant-list
// guards: NO CHECKER IS THE REWRITER
// given: a need for `draft text`, 50000 tokens, that must differ from drafter-a and from reviewer-c; drafter-b, which has drafter-a's model and a context of 200000
// input: eligible([drafter-b], that need)
// expect: drafter-b left out with one reason, drafter-a's model — reviewer-c it differs from, and its context holds the job
test("eligible — judges each participant it must differ from, and names only those it does not differ from", () => {
  assert.deepEqual(eligible([SAME_MODEL], { capabilities: DRAFTING, size: 50000, notLike: [DRAFTER, OTHER_MODEL] }), {
    eligible: [],
    leftOut: [{ participant: SAME_MODEL, reasons: ["uses the model example-model of drafter-a, from which it must differ"] }],
  });
});

// ---------------------------------------------------------------- differs

// TST-472420 · level: unit · module: MOD-participant-list
// guards: NO REVIEWER IS THE DRAFTER; NO CHECKER IS THE REWRITER
// given: drafter-a and reviewer-c — different participants, different models; drafter-a with itself; drafter-a and drafter-b — different participants, the same model; alice, who names no model, with reviewer-c, either way round
// input: differs(a, b) for each pair
// expect: true for drafter-a and reviewer-c, and the other way round; false for every other pair
test("differs — true only for two different participants that name two different models", () => {
  assert.equal(differs(DRAFTER, OTHER_MODEL), true);
  assert.equal(differs(OTHER_MODEL, DRAFTER), true);
  assert.equal(differs(DRAFTER, DRAFTER), false);
  assert.equal(differs(DRAFTER, SAME_MODEL), false);
  assert.equal(differs(ALICE, OTHER_MODEL), false);
  assert.equal(differs(OTHER_MODEL, ALICE), false);
});
