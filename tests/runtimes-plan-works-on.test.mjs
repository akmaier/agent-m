// The check `plan-works-on` of MOD-runtimes' routeStrategies, as the accepted text of docs/architecture/MOD-runtimes.md states it: "for each piece of the draft's plan,
// `handOver`, whether the tool `hand-over` held it or the answer gave it (MOD-job-runner), whose `works_on` is not empty and is refused by MOD-job-ledger's
// `worksOnProblem`, an error on `answer`, line 1, under `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`, its `what` naming the piece by its number from 1 and the reason
// `worksOnProblem` gives, its `fix` asking to name each entry in one of the forms that reason names, or to leave `works_on` empty for something new, whose place the task
// names — the job of such a piece works on the repository, by its address —, so that the drafter corrects in the round what `handOverJob` could not record (UC-049 4a,
// 4f). A draft without a plan has no finding. Pure."
// Run: node --test tests/runtimes-plan-works-on.test.mjs
//
// Module: MOD-runtimes
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-049
// Level: unit
//
// The check is called as the correction loop calls a check, with the draft and the job's context, on the draft as it stands once the tool's plan is in it (MOD-job-runner's
// withHeld puts it under `handOver`, as an answer gives it). The reason is MOD-job-ledger's own, read here through worksOnProblem. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { worksOnProblem } from "../src/job-ledger/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";

const RULE = "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY";
const check = (draft) => routeStrategies.checks["plan-works-on"](draft, { params: {} });
const piece = (works_on) => ({ kind: "change-use-case", works_on, task: "split the main flow", after: [] });

// TST-2026110951 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a plan of three pieces — 1 works on UC-049, 2 on "the login page", 3 on nothing (something new) —; then a plan whose second piece works on UC-049 and "docs/x.md"
// input: the check plan-works-on of each draft
// expect: one finding for each: an error on answer, line 1, under A JOB IS RECORDED IN ITS PRODUCT REPOSITORY, its what naming piece 2 and worksOnProblem's reason for its
//   works_on, its fix asking for one of those forms or an empty works_on for something new; piece 1 and the empty piece 3 are not judged
// counter-proof: before this change routeStrategies offered no check, and the call fails
test("TST-2026110951: plan-works-on — an error on the answer for each piece whose works_on its job's record refuses", () => {
  for (const [plan, refused] of [[[piece(["UC-049"]), piece(["the login page"]), piece([])], ["the login page"]],
    [[piece(["UC-049"]), piece(["UC-049", "docs/x.md"])], ["UC-049", "docs/x.md"]]]) {
    const found = check({ answer: "planned", handOver: plan });
    assert.equal(found.length, 1, JSON.stringify(plan));
    const [one] = found;
    assert.deepEqual([one.artifact, one.line, one.kind, one.rule], ["answer", 1, "error", RULE]);
    assert.match(one.what, /\b2\b/);
    assert.ok(one.what.includes(worksOnProblem(refused)), one.what);
    assert.match(one.fix, /works_on/);
    assert.match(one.fix, /empty/);
  }
});

// TST-2026110952 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a draft without a plan; one with an empty plan; one whose every piece works on what a record takes, or on nothing
// input: the check plan-works-on of each draft
// expect: no finding for any of them
test("TST-2026110952: plan-works-on — no plan, or a plan its records take, has no finding", () => {
  for (const draft of [{ answer: "no plan" }, { answer: "empty", handOver: [] },
    { answer: "planned", handOver: [piece(["EXPORT IS A PDF"]), piece(["UC-049", "ITM-1319"]), piece([])] }]) {
    assert.deepEqual(check(draft), [], JSON.stringify(draft));
  }
});
