// The person's one click on the class of an issue — MOD-issue-handling's confirmClass and IssueClass (ITM-582), as the accepted text of docs/architecture/MOD-issue-handling.md states them: "`confirmClass(host, issue, cls, reason)` — the person's one click on the class: sets the label `defect`, `change` or `not-reproducible` and removes the other two; for *rejected*, comments the reason and closes the issue. Crosses the network to the product's tracker. Errors: Access's `TokenRefused`, `MissingPermission`, `RateLimited`, `Unreachable`." With UC-012 step 4 and 4a.
// Run: node --test tests/issue-handling-confirm-class.test.mjs
//
// Module: MOD-issue-handling
// Guards: ONE CLICK PER DECISION; EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// Level: unit
//
// The host is a fixture that keeps every call it receives, in order. Readings the texts leave open, which the tests state (the pull request names them):
//   - `IssueClass` is a frozen object whose values are the four class names: bug, change, notReproducible ("not-reproducible") and rejected.
//   - The comment of a rejection is the reason, trimmed, and nothing else; the comment is made before the issue is closed, so that a refused comment leaves the issue open.
//   - A rejection without a reason (null, empty or blank) and a class outside the four are a TypeError, thrown before the host is called. For the other three classes the reason is not used.
//   - A rejection touches no label: UC-012 4a "nothing else changes".
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";

const handling = await import("../src/issue-handling/index.mjs").catch((error) => ({ error }));
const confirmClass = (...given) => {
  assert.ok(typeof handling.confirmClass === "function", `MOD-issue-handling offers confirmClass: ${handling.error?.message}`);
  return handling.confirmClass(...given);
};

/** A host that keeps its calls; `refuse` names the call that throws the failure given. */
function hostOf({ refuse = null } = {}) {
  const calls = [];
  const call = (name) => async (...given) => {
    calls.push([name, ...given]);
    if (refuse?.call === name) throw refuse.failure;
  };
  return { calls, host: { setIssueLabels: call("setIssueLabels"), commentOnIssue: call("commentOnIssue"), setIssueState: call("setIssueState") } };
}
const REFUSED = Object.assign(new Error("The token was refused."), { name: "TokenRefused" });

// TST-582001 · level: unit · module: MOD-issue-handling
// guards: UC-012; ONE CLICK PER DECISION
// given: a host that keeps its calls; known positive first — bug
// input: confirmClass(host, 7, cls, null) for bug, change and not-reproducible; then with a reason for bug
// expect: one call to setIssueLabels(7, { add: [the class's label], remove: [the other two] }) each — defect, change, not-reproducible —, and no comment and no change of state; the reason is not used for a bug
test("confirmClass — a class sets its label and removes the other two, and writes nothing else", async () => {
  const expected = [["bug", "defect", ["change", "not-reproducible"]], ["change", "change", ["defect", "not-reproducible"]],
    ["not-reproducible", "not-reproducible", ["change", "defect"]]];
  for (const [cls, label, others] of expected) {
    const { host, calls } = hostOf();
    await confirmClass(host, 7, cls, null);
    assert.deepEqual(calls.map(([name, number, change]) => [name, number, change && { add: change.add, remove: [...change.remove].sort() }]),
      [["setIssueLabels", 7, { add: [label], remove: others }]], cls);
  }
  const { host, calls } = hostOf();
  await confirmClass(host, 7, "bug", "not used");
  assert.deepEqual(calls.map(([name]) => name), ["setIssueLabels"]);
});

// TST-582002 · level: unit · module: MOD-issue-handling
// guards: UC-012
// given: a host that keeps its calls
// input: confirmClass(host, 7, "rejected", "  Duplicate of #3.  ")
// expect: the calls, in this order: commentOnIssue(7, "Duplicate of #3.") and setIssueState(7, "closed"); no label is touched
test("confirmClass — a rejected issue is commented with its reason and closed, and no label changes", async () => {
  const { host, calls } = hostOf();
  await confirmClass(host, 7, "rejected", "  Duplicate of #3.  ");
  assert.deepEqual(calls, [["commentOnIssue", 7, "Duplicate of #3."], ["setIssueState", 7, "closed"]]);
});

// TST-582003 · level: unit · module: MOD-issue-handling
// guards: UC-012
// given: known positive first — rejected with a reason; then hosts that keep their calls
// input: confirmClass with rejected and the reason null, "" and "  "; with the class "wontfix"; with the issue number 0
// expect: each is a TypeError and the host is not called; the positive rejects nothing
test("confirmClass — a rejection needs a reason, and a class outside the four, or an issue that is no number, is refused before anything is written", async () => {
  const good = hostOf();
  await confirmClass(good.host, 7, "rejected", "Not ours.");
  assert.equal(good.calls.length, 2);
  for (const [cls, reason, number] of [["rejected", null, 7], ["rejected", "", 7], ["rejected", "  ", 7], ["wontfix", null, 7], ["bug", null, 0]]) {
    const { host, calls } = hostOf();
    await assert.rejects(confirmClass(host, number, cls, reason), TypeError, `${cls} ${JSON.stringify(reason)} ${number}`);
    assert.deepEqual(calls, [], `${cls} ${JSON.stringify(reason)} ${number}`);
  }
});

// TST-582004 · level: unit · module: MOD-issue-handling
// guards: UC-012
// given: hosts whose call named refuses with a TokenRefused
// input: confirmClass for bug against a host whose setIssueLabels refuses; for rejected against a host whose commentOnIssue refuses
// expect: both reject with that very error; the rejected issue is not closed after its comment was refused
test("confirmClass — the host's failure passes unchanged, and a refused comment leaves the issue open", async () => {
  const labels = hostOf({ refuse: { call: "setIssueLabels", failure: REFUSED } });
  await assert.rejects(confirmClass(labels.host, 7, "bug", null), (error) => error === REFUSED);
  const comment = hostOf({ refuse: { call: "commentOnIssue", failure: REFUSED } });
  await assert.rejects(confirmClass(comment.host, 7, "rejected", "Not ours."), (error) => error === REFUSED);
  assert.deepEqual(comment.calls.map(([name]) => name), ["commentOnIssue"]);
});

// TST-582005 · level: unit · module: MOD-issue-handling
// guards: UC-012
// given: the module's interface
// input: IssueClass
// expect: frozen, with exactly the values bug, change, not-reproducible and rejected under the keys bug, change, notReproducible and rejected
test("IssueClass — names the four classes", () => {
  assert.ok(handling.IssueClass, `MOD-issue-handling offers IssueClass: ${handling.error?.message}`);
  assert.ok(Object.isFrozen(handling.IssueClass));
  assert.deepEqual({ ...handling.IssueClass }, { bug: "bug", change: "change", notReproducible: "not-reproducible", rejected: "rejected" });
});
