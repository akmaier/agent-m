// recordGateDecision (ITM-785) — MOD-product-process' function of that name, as the accepted text of docs/architecture/MOD-product-process.md states it: a decision on a gate is
// refused with MayNotDecide when mayDecide would not pass it, a rejection needs its reason (ReasonMissing), and a decision that stands is written as one gate record of gateSchema in
// one commit on the head that was read, on the default branch repositoryInfo names, with the job's provenance lines as trailers; Moved comes from the host.
// Run: node --test tests/product-process-record-gate.test.mjs
//
// Module: MOD-product-process
// Guards: UC-034; THE GATE IS RECORDED; A GATE NAMES WHO DECIDES IT; A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT; A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
// Level: unit
//
// The workflow is a literal of the Workflow form with two gates, Development → Release testing (decided by the Product Owner) and Release testing → Release (decided by the check `done`);
// the role assignment is read with roleAssignmentSchema; the host is a double that records the calls of repositoryInfo and commitFiles. Nothing waits and nothing reaches the network.
// Reading taken where the texts leave it open: the record's `decider` is the participant's name, or `check: <name>` for a check; the record's date is `YYYY-MM-DD HH:MM UTC` of `now`,
// as the repository's own records give it.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument } from "../src/documents/index.mjs";
import { HostError } from "../src/repository-hosts/index.mjs";
import * as product from "../src/product-process/index.mjs";

const { gateSchema, gateStates, roleAssignmentSchema, recordGateDecision } = product;

const DEV = "Development → Release testing", REL = "Release testing → Release";
const ARTIFACT = "docs/increment.md", BLOB = "a".repeat(40), HEAD = "1".repeat(40);
const workflow = {
  phases: [{ name: "Development" }, { name: "Release testing" }, { name: "Release" }],
  transitions: [{ from: "Development", to: "Release testing", kind: "sequence" }, { from: "Release testing", to: "Release", kind: "sequence" }],
  gates: [
    { name: DEV, from: "Development", to: "Release testing", artifacts: "the increment", condition: "every item meets its acceptance", decider: "Product Owner", addedBy: null, practice: null },
    { name: REL, from: "Release testing", to: "Release", artifacts: "the release", condition: "the check is green", decider: "check: done", addedBy: null, practice: null },
  ],
};
const assignment = readDocument(roleAssignmentSchema, "docs/role-assignments/team2.md",
  ["# Team 2", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product Owner | po-opus-b |", "| Developers | developer-sonnet-g |", ""].join("\n"));
const NOW = new Date(Date.UTC(2026, 9, 18, 9, 41, 30));
const TRAILERS = ["Agent-M-Job: JOB-785", "Agent-M-Participant: po-opus-b"];

// A host that holds nothing and records what is asked of it; `moved` makes commitFiles fail as the host does when the branch has moved.
function hostDouble({ moved = false } = {}) {
  const calls = { info: 0, commits: [] };
  return {
    calls,
    repositoryInfo: async () => { calls.info += 1; return { defaultBranch: "trunk", visibility: "private", canWrite: true, archived: false, description: "" }; },
    commitFiles: async (change) => {
      calls.commits.push(change);
      if (moved) throw new HostError("Moved", { head: "2".repeat(40) }, "the branch has moved");
      return { commit: "c".repeat(40), url: "https://example.test/commit/c" };
    },
  };
}
const decide = (host, over = {}, context = {}) => recordGateDecision(host,
  { gate: DEV, job: null, decider: { name: "po-opus-b", kind: "agent" }, role: "Product Owner", decision: "passed", reason: null, on: [`${ARTIFACT}@${BLOB}`], ...over },
  { workflow, assignment, workBy: ["developer-sonnet-g"], head: HEAD, now: NOW, trailers: TRAILERS, ...context });
const failure = async (promise) => { try { await promise; } catch (error) { return error; } return null; };
const readRecord = (call) => readDocument(gateSchema, call.files[0].path, call.files[0].text);

// TST-785001 · level: unit · module: MOD-product-process
// guards: A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT; A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS; A GATE NAMES WHO DECIDES IT
// given: the gate Development → Release testing, decided by the Product Owner, whose holder in the job's role assignment is po-opus-b; developer-sonnet-g, a Developer, did the work it checks; a host double that records its calls
// input: recordGateDecision for the decider developer-sonnet-g (not a holder); for po-opus-b with po-opus-b in workBy (did the work); for a check named done (the gate is decided by a role)
// expect: each is refused with the error MayNotDecide, whose reason is "not a holder of the deciding role", "did the work this gate checks" and "not a holder of the deciding role", and whose holders are ["po-opus-b"]; commitFiles is never called
test("TST-785001: a decision mayDecide refuses is refused with MayNotDecide, naming the reason and the holders, and nothing is written", async () => {
  const host = hostDouble();
  const cases = [
    [{ decider: { name: "developer-sonnet-g", kind: "agent" }, role: "Developers" }, {}, "not a holder of the deciding role"],
    [{}, { workBy: ["po-opus-b"] }, "did the work this gate checks"],
    [{ decider: { name: "done", kind: "check" }, role: "Product Owner" }, {}, "not a holder of the deciding role"],
  ];
  for (const [over, context, reason] of cases) {
    const error = await failure(decide(host, over, context));
    assert.equal(error?.name, "MayNotDecide", `${JSON.stringify(over)} is refused`);
    assert.equal(error.reason, reason);
    assert.deepEqual(error.holders, ["po-opus-b"]);
  }
  assert.deepEqual(host.calls.commits, [], "nothing is written");
  const own = await decide(host);
  assert.equal(own.path.startsWith("docs/gates/"), true, "known positive: the holder who did not do the work is not refused");
  assert.equal(host.calls.commits.length, 1);
});

// TST-785002 · level: unit · module: MOD-product-process
// guards: THE GATE IS RECORDED
// given: the gate Development → Release testing, po-opus-b its holder; a host double that records its calls
// input: recordGateDecision with decision "rejected" and the reason null, "" and "  "; then with decision "passed" and the reason null; then with decision "rejected" and the reason "TST-1 does not guard the Acceptance"
// expect: the three rejections without a reason fail with ReasonMissing and write nothing; the pass without a reason and the rejection with one each write one record
test("TST-785002: a rejection without a reason fails with ReasonMissing and writes nothing; a pass needs none", async () => {
  const host = hostDouble();
  for (const reason of [null, "", "  "]) {
    const error = await failure(decide(host, { decision: "rejected", reason }));
    assert.equal(error?.name, "ReasonMissing", `reason ${JSON.stringify(reason)}`);
  }
  assert.deepEqual(host.calls.commits, []);
  await decide(host, { decision: "passed", reason: null });
  await decide(host, { decision: "rejected", reason: "TST-1 does not guard the Acceptance" });
  assert.equal(host.calls.commits.length, 2);
});

// TST-785003 · level: unit · module: MOD-product-process
// guards: THE GATE IS RECORDED
// given: a host double whose commitFiles fails as the host does when the branch is no longer at the head that was read: Moved { head: "2"x40 }
// input: recordGateDecision by the holder po-opus-b on the head "1"x40
// expect: it fails with the error Moved, whose head is "2"x40, as the host gave it; commitFiles was asked once, for expectedHead "1"x40; no commit is returned
test("TST-785003: a moved head fails with Moved, and the commit was asked on the head that was read", async () => {
  const host = hostDouble({ moved: true });
  const error = await failure(decide(host));
  assert.equal(error?.name, "Moved");
  assert.equal(error.head, "2".repeat(40));
  assert.equal(host.calls.commits.length, 1);
  assert.equal(host.calls.commits[0].expectedHead, HEAD);
});

// TST-785004 · level: unit · module: MOD-product-process
// guards: THE GATE IS RECORDED; UC-034
// given: the workflow with its two gates, a host double whose default branch is "trunk", the head "1"x40, now 2026-10-18 09:41:30 UTC, the trailers of a job, and the checked artifact docs/increment.md at the blob "a"x40
// input: recordGateDecision by po-opus-b (an agent) passing Development → Release testing on `docs/increment.md@<blob>` and a commit, with the job JOB-785 and a reason; and by the check done passing Release testing → Release; the records read back with readDocument(gateSchema) and gateStates over them
// expect: each is one commitFiles call on branch "trunk" (not "main") with expectedHead "1"x40 and exactly one file docs/gates/20261018-0941-<gate slug>-<4 hex>.md, the slug being development-release-testing and release-testing-release; the message's last lines are the trailers; the call returns the commit and that path; each record reads with no finding under documentFindings and gives gate, job, decider (po-opus-b, and "check: done"), role (Product Owner, and "done"), decision passed, on and date "2026-10-18 09:41 UTC"; gateStates gives passed for both against the blob "a"x40 and "passed on an earlier text" for the first against another blob
test("TST-785004: a decision is one gate record in one commit on the default branch and the head that was read, with the trailers; gateStates reads it back as passed", async () => {
  const host = hostDouble();
  const first = await decide(host, { job: "JOB-785", reason: "every acceptance line holds", on: [`${ARTIFACT}@${BLOB}`, "f".repeat(40)] });
  const second = await decide(host, { gate: REL, decider: { name: "done", kind: "check" }, role: "done", on: ["f".repeat(40)] });
  assert.equal(host.calls.commits.length, 2);
  assert.ok(host.calls.info >= 1, "the default branch is asked of the host");
  const [one, two] = host.calls.commits;
  for (const [call, result, slug] of [[one, first, "development-release-testing"], [two, second, "release-testing-release"]]) {
    assert.equal(call.branch, "trunk");
    assert.equal(call.expectedHead, HEAD);
    assert.equal(call.files.length, 1);
    assert.match(call.files[0].path, new RegExp(`^docs/gates/20261018-0941-${slug}-[0-9a-f]{4}\\.md$`));
    assert.deepEqual(result, { commit: "c".repeat(40), path: call.files[0].path });
    assert.deepEqual(call.message.split("\n").slice(-TRAILERS.length), TRAILERS);
  }
  const records = [readRecord(one), readRecord(two)];
  assert.deepEqual(records.flatMap((record) => documentFindings(gateSchema, record)), [], "both records read with no finding");
  assert.deepEqual(records.map((record) => record.fields.decider), ["po-opus-b", "check: done"]);
  assert.deepEqual(records.map((record) => record.fields.role), ["Product Owner", "done"]);
  assert.deepEqual(records.map((record) => [record.fields.gate, record.fields.decision, record.fields.date]), [[DEV, "passed", "2026-10-18 09:41 UTC"], [REL, "passed", "2026-10-18 09:41 UTC"]]);
  assert.equal(records[0].fields.job, "JOB-785");
  assert.deepEqual(records[0].fields.on, [`${ARTIFACT}@${BLOB}`, "f".repeat(40)]);
  assert.ok(one.files[0].text.includes("every acceptance line holds"));
  const now = gateStates(workflow, records, { [ARTIFACT]: BLOB });
  assert.deepEqual(now.map((state) => [state.gate, state.state]), [[DEV, "passed"], [REL, "passed"]]);
  assert.equal(gateStates(workflow, records, { [ARTIFACT]: "b".repeat(40) })[0].state, "passed on an earlier text");
});

// TST-785005 · level: unit · module: MOD-product-process
// guards: THE GATE IS RECORDED; UC-034
// given: the workflow, the holder po-opus-b, a host double
// input: recordGateDecision with decision "rejected" and the reason "TST-785002 does not guard the Acceptance", on `docs/increment.md@<blob>`; the record read back and gateStates over it; an empty trailers list
// expect: the record has the decision rejected and a `## Reason` section holding the reason; gateStates gives rejected for Development → Release testing, with the record's path, and not reached for Release testing → Release; with no trailers the message holds no trailer line (no "Agent-M" text)
test("TST-785005: a rejection is written with its reason and gateStates reads it back as rejected", async () => {
  const host = hostDouble();
  const reason = "TST-785002 does not guard the Acceptance";
  const done = await decide(host, { decision: "rejected", reason }, { trailers: [] });
  const call = host.calls.commits[0];
  const record = readRecord(call);
  assert.equal(record.fields.decision, "rejected");
  assert.ok(call.files[0].text.includes(`## Reason\n\n${reason}`));
  const states = gateStates(workflow, [record], { [ARTIFACT]: BLOB });
  assert.deepEqual(states.map((state) => [state.gate, state.state]), [[DEV, "rejected"], [REL, "not reached"]]);
  assert.equal(states[0].record, done.path);
  assert.equal(call.message.includes("Agent-M"), false);
});
