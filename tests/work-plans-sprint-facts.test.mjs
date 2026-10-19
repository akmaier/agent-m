// The facts of a sprint (ITM-986; UC-041 steps 2 and 5) — MOD-work-plans' sprintFacts as the accepted text of docs/architecture/MOD-work-plans.md states it: "the sprint's
// increment, what is not done and why, and the numbers of the sprint, each derived; `results` is the branch `test-results`; a cost only where a job's row has one".
// Run: node --test tests/work-plans-sprint-facts.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-041; A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; A SPRINT ENDS WITH A RETROSPECTIVE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NO COST IS GUESSED
// Level: unit
//
// Inputs are in the forms of their modules: the sprint a Document of planSchemas.sprint, states ItemState, jobs MOD-job-ledger's JobRow, pull requests MOD-repository-hosts'
// PullRequest, results a Snapshot of the branch test-results. Nothing reaches the network. The text leaves these readings open, which the pull request names:
//   - sprintFacts is async, as MOD-result-records' flakyTests, which it calls, is.
//   - A selected item is in the increment when its ItemState is done with a pull request; that pull request is the entry's pullRequest. Its realises are those of its item
//     document (facts.items); its tests are the ids of the tests (facts.tests, { id, guards }) that guard a requirement it realises, in the order given.
//   - A job of the sprint is a row whose record's worksOn names a selected item. failedJobs: rows in state failed; retriedJobs: rows whose record names a job it retries;
//     correctionRounds: the rounds of the records' ends.
//   - waitingAtGates: "<n> gates reached, <m> not resumed" over the gates of those records ("none" for none); waitingForAPerson: "<n> jobs" that ended waiting for a person or
//     hold a question ("none" for none). flakyTests: the tests flakyTests finds at the head commit of each merged pull request of the increment, each once, sorted.
//   - cost: "unknown" when no row has a known cost; else the sum of the known ones with its currency, and "for the jobs whose cost is known" where some are unknown.
//   - issues are handed in as the interface states; no number reads them.
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";

const HEAD_1 = "1".repeat(40), HEAD_2 = "2".repeat(40);
const sprint = { kind: "sprint", path: "docs/backlog/sprints/team1/01.md", id: "team1/01", fields: { sprint: 1, selection: ["ITM-001", "ITM-002", "ITM-003"] }, sections: [], appended: [], body: "" };
const item = (id, realises) => ({ kind: "item", path: `docs/backlog/${id}.md`, id, fields: { id, realises }, sections: [], appended: [], body: "" });
const ITEMS = [item("ITM-001", ["UC-032", "A STORE KEEPS BOOKS"]), item("ITM-002", ["UC-033"]), item("ITM-003", ["UC-034"])];
const TESTS = [{ id: "TST-001", guards: ["A STORE KEEPS BOOKS"] }, { id: "TST-002", guards: ["UC-032", "UC-099"] }, { id: "TST-003", guards: ["UC-033"] }, { id: "TST-004", guards: ["UC-099"] }];
const pr = (number, branch, state, head, body = "") => ({ number, title: `${branch} work`, branch, base: "main", head, state, draft: false, url: `https://example.test/pull/${number}`,
  opened: "2026-10-01T10:00:00Z", merged: state === "merged" ? "2026-10-02T10:00:00Z" : null, closed: null, body });
const PULL_REQUESTS = [
  pr(7, "item/ITM-001-store", "merged", HEAD_1, "The store."),
  pr(8, "item/ITM-002-pages", "open", HEAD_2, ""),
];
const state = (item, kind, reason, pullRequest = null) => ({ item, state: kind, reason, job: null, pullRequest });
const STATES = [state("ITM-001", "done", null, "7"), state("ITM-002", "in progress", "pull request 8 is open for review", "8"), state("ITM-003", "blocked", "job J-3 failed")];
const jobRow = (id, worksOn, jobState, { retries = null, rounds = [], cost = { known: false, usage: null }, gates = [], question = null, results = [] } = {}) =>
  ({ record: { id, worksOn, retries, gates, question, end: jobState === "done" || jobState === "failed" ? { state: jobState, rounds, results, cost } : null }, product: "p", state: jobState, elapsed: 1, cost,
    source: { reachable: true, reason: null } });
const JOBS = [
  jobRow("J-1", ["ITM-001"], "done", { rounds: [{ number: 1 }, { number: 2 }], cost: { known: true, amount: 1.5, currency: "USD", basis: "reported" }, gates: [{ gate: "acceptance", resumedBy: "r1" }] }),
  jobRow("J-2", ["ITM-001"], "done", { retries: "J-0", rounds: [{ number: 1 }] }),
  jobRow("J-3", ["ITM-003"], "failed", { gates: [{ gate: "acceptance", resumedBy: null }], question: "which layout?" }),
  jobRow("J-4", ["ITM-002"], "done", { results: ["waits for a person"] }),
  jobRow("J-9", ["ITM-099"], "failed", { rounds: [{ number: 1 }] }), // another sprint's item: not counted
];
const run = (rows) => ["---", `commit: ${HEAD_1}`, "levels:", "  - unit", "occasion: commit", "participant: ci", "date: 2026-10-07 10:00 UTC", "---", "## Outcomes", "",
  "| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((row) => `| ${row.join(" | ")} |`), ""].join("\n");
const RUNS = new Map([
  [`runs/${HEAD_1}/20261007-1000-commit-aaaa.md`, run([["TST-001", "unit", "passed", ""], ["TST-002", "unit", "passed", ""]])],
  [`runs/${HEAD_1}/20261007-1100-commit-bbbb.md`, run([["TST-001", "unit", "failed", ""], ["TST-002", "unit", "passed", ""]])],
  [`runs/${HEAD_2}/20261007-1000-commit-cccc.md`, run([["TST-003", "unit", "passed", ""]])],
]);
const results = { paths: [...RUNS.keys()], read: async (path) => RUNS.get(path) ?? null };
const facts = (over = {}) => ({ items: ITEMS, tests: TESTS, states: STATES, jobs: JOBS, results, pullRequests: PULL_REQUESTS, issues: [], ...over });

const { sprintFacts } = await import("../src/work-plans/index.mjs").catch((error) => ({ sprintFacts: async () => { throw error; } }));

// TST-986001 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; UC-041
// given: ITM-001 done with pull request 7, ITM-002 in progress with an open one, ITM-003 blocked; TST-004 guards a requirement no item of the sprint realises
// input: sprintFacts of the sprint
// expect: the increment is ITM-001 alone, with pull request 7, what its item realises and the tests that guard it (not TST-004)
test("the increment holds exactly the items that are done with a pull request", async () => {
  const { increment } = await sprintFacts(sprint, facts());
  assert.deepEqual(increment, [{ item: "ITM-001", pullRequest: "7", realises: ["UC-032", "A STORE KEEPS BOOKS"], tests: ["TST-001", "TST-002"] }]);
});

// TST-986002 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; UC-041
// given: the same inputs, ITM-002's pull request open
// input: sprintFacts of the sprint
// expect: ITM-002 is not in the increment, and it and ITM-003 stand in notDone with their states and reasons
test("an item with an open pull request is not done: it stands in notDone with its state and reason", async () => {
  const { increment, notDone } = await sprintFacts(sprint, facts());
  assert.ok(!increment.some((done) => done.item === "ITM-002"));
  assert.deepEqual(notDone, [STATES[1], STATES[2]]);
});

// TST-986003 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A RETROSPECTIVE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-041
// given: five job rows, one of another sprint's item; two test records of one commit, TST-001 passed in one and failed in the other
// input: sprintFacts of the sprint
// expect: failedJobs 1, retriedJobs 1, correctionRounds 3, two gates reached of which one is not resumed, two jobs waiting for a person, TST-001 flaky
test("the numbers are counted from the job rows and the result records of the sprint", async () => {
  const { numbers } = await sprintFacts(sprint, facts());
  assert.equal(numbers.failedJobs, 1);
  assert.equal(numbers.retriedJobs, 1);
  assert.equal(numbers.correctionRounds, 3);
  assert.equal(numbers.waitingAtGates, "2 gates reached, 1 not resumed");
  assert.equal(numbers.waitingForAPerson, "2 jobs");
  assert.deepEqual(numbers.flakyTests, ["TST-001"]);
});

// TST-986004 · level: unit · module: MOD-work-plans
// guards: NO COST IS GUESSED; UC-041
// given: job rows with and without a known cost; and rows none of which has one
// input: sprintFacts of the sprint
// expect: the sum of the known costs with its currency and the note that unknown ones are left out; "unknown", never zero, where no row has one
test("the cost is the sum of the known costs, and unknown where no row has one", async () => {
  assert.equal((await sprintFacts(sprint, facts())).numbers.cost, "1.5 USD, for the jobs whose cost is known");
  const unknown = JOBS.map((row) => ({ ...row, cost: { known: false, usage: null } }));
  const { numbers } = await sprintFacts(sprint, facts({ jobs: unknown }));
  assert.equal(numbers.cost, "unknown");
  assert.deepEqual([numbers.failedJobs, numbers.waitingAtGates === "none"], [1, false]);
});

// TST-986005 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; UC-041
// given: a sprint whose items have no pull request and no job
// input: sprintFacts with no job and no pull request
// expect: an empty increment, every selected item in notDone, and the numbers none, zero or unknown
test("a sprint with nothing done has an empty increment and quiet numbers", async () => {
  const { increment, notDone, numbers } = await sprintFacts(sprint, facts({ jobs: [], pullRequests: [], states: [] }));
  assert.deepEqual(increment, []);
  assert.deepEqual(notDone.map((each) => each.item), ["ITM-001", "ITM-002", "ITM-003"]);
  assert.deepEqual(numbers, { failedJobs: 0, retriedJobs: 0, correctionRounds: 0, waitingAtGates: "none", waitingForAPerson: "none", flakyTests: [], cost: "unknown" });
});

// TST-986006 · level: unit · module: MOD-work-plans
// guards: A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT; UC-041
// given: the same inputs, but ITM-001's state in progress while its pull request is merged on the host, and no item documents
// input: sprintFacts of the sprint
// expect: ITM-001 is not in the increment (the state decides, not a pull request's name); with no item documents the lists of an entry are empty
test("the state decides what is done, and an entry without an item document has no requirements or tests", async () => {
  const undone = STATES.map((each) => (each.item === "ITM-001" ? state("ITM-001", "in progress", "a job runs", "7") : each));
  assert.deepEqual((await sprintFacts(sprint, facts({ states: undone }))).increment, []);
  const bare = (await sprintFacts(sprint, facts({ items: [], tests: [] }))).increment;
  assert.deepEqual(bare, [{ item: "ITM-001", pullRequest: "7", realises: [], tests: [] }]);
});
