// What a job's record takes as what its job works on — MOD-job-ledger's worksOnProblem, as the accepted text of docs/architecture/MOD-job-ledger.md states it:
// "why a record would refuse `worksOn` as what its job works on: the reason `writeDocument` gives for the field `works_on` of `job.schema.md`, whose form the `works on:` of
// `## Job started` shares; `null` where the record takes it. The one rule of what a job's record names it works on, which `startRecord` and `appendToRecord` apply when they
// write … Pure."
// Run: node --test tests/job-ledger-works-on-problem.test.mjs
//
// Module: MOD-job-ledger
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// Level: unit
//
// The one rule is shown by its writer: for each list, what worksOnProblem says is compared with what startRecord does with a start that works on it — it refuses exactly
// the lists worksOnProblem refuses, and with the same words. Every expected value stands in the test's own text; nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { startRecord, worksOnProblem } from "../src/job-ledger/index.mjs";

const START = {
  id: "JOB-20261109-0900-a1b2", kind: "change-use-case", worksOn: [], participant: "drafter-a", model: "example-model", route: "ci hosted", run: null, retries: null,
  startedBy: "alice", start: new Date("2026-11-09T09:00:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) }, inputs: [], limit: 5, destinations: [], params: {},
};

// What startRecord says of a start that works on `worksOn`: null where it writes it, else its error's words.
const written = (worksOn) => {
  try {
    startRecord({ ...START, worksOn });
    return null;
  } catch (error) {
    return error.message;
  }
};

// TST-2026110941 · level: unit · module: MOD-job-ledger
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: lists a record takes — a requirement's name, a use case, an item, a module, an https address, a commit of 40 hex digits —
// input: worksOnProblem(list)
// expect: null for each, and startRecord writes each
test("TST-2026110941: worksOnProblem — null for what a job's record takes", () => {
  for (const worksOn of [["EXPORT IS A PDF"], ["UC-049"], ["ITM-1319", "MOD-job-ledger"], ["https://github.com/alice/product/issues/7"], ["b".repeat(40)]]) {
    assert.equal(worksOnProblem(worksOn), null, JSON.stringify(worksOn));
    assert.equal(written(worksOn), null, JSON.stringify(worksOn));
  }
});

// TST-2026110942 · level: unit · module: MOD-job-ledger
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: lists a record refuses — a section's title in words, a file's path, a use case beside a place for something new, and no entry at all —
// input: worksOnProblem(list)
// expect: for each, the reason startRecord's refusal gives, word for word, naming works_on and the entry it refuses
// counter-proof: before this change MOD-job-ledger exported no worksOnProblem, and the import fails
test("TST-2026110942: worksOnProblem — the reason writeDocument gives for works_on, as startRecord refuses it", () => {
  for (const [worksOn, entry] of [[["the login page"], "the login page"], [["docs/use-cases/UC-049.md"], "docs/use-cases/UC-049.md"],
    [["UC-049", "a new use case for exports"], "a new use case for exports"], [[], "empty"]]) {
    const why = worksOnProblem(worksOn);
    assert.equal(typeof why, "string", JSON.stringify(worksOn));
    assert.equal(why, written(worksOn));
    assert.ok(why.includes("works_on") && why.includes(entry), why);
  }
});
