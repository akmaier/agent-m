// What is blocked, each with its reason — MOD-progress-measures' blocked, as the accepted text of docs/architecture/MOD-progress-measures.md
// states it: "every item or plan entry that cannot move, each with its reason; for a gate, the role or check that decides it; for a held
// module, the other team's sprint and the module", the reasons being "failed job", "waiting at a gate", "requirement not accepted",
// "work-in-progress limit" and "held by another team's sprint" (UC-035 step 4). Of the module, this is blocked alone.
// Run: node --test tests/progress-measures-blocked.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The facts are held in memory, in the form of
// MOD-progress-measures' Facts (tests/progress-measures-facts.mjs): the item states are MOD-work-plans' ItemState, the held items its Held,
// the job rows MOD-job-ledger's JobRow, the plan's items documents with the `modules` front matter an item has, and the model the part of
// MOD-model-catalogue's Model that names its flow. `fetch` is replaced by a spy for every test and must not have been called when the test
// ends. The counter-proofs are recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { blocked } from "../src/progress-measures/index.mjs";
import { facts, itemState, jobRow } from "./progress-measures-facts.mjs";

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

const SPRINT1 = "docs/backlog/sprints/team1/03.md", SPRINT2 = "docs/backlog/sprints/team2/05.md";
const held = (item, team, changes, uses = []) => ({ item, team, sprint: team === "team1" ? SPRINT1 : SPRINT2, changes, uses });
const item = (id, modules) => ({ id, path: `docs/backlog/${id}.md`, fields: { id, modules } });
const job = (id, state) => jobRow({ id, state });
const SCRUM_WIP = (wip) => ({ flow: { wip, timeBox: null, sprints: true } });
const KANBAN = (wip) => ({ flow: { wip, timeBox: null, sprints: false } });

// A product with one case of each reason, and cases that look blocked and are not.
const SIX = () => facts({
  model: SCRUM_WIP(1),
  plan: {
    order: null,
    items: [item("ITM-005", ["MOD-alpha"]), item("ITM-006", ["MOD-delta"]), item("ITM-012", ["MOD-zeta"])],
    states: [
      itemState("ITM-001", "blocked", { reason: "job JOB-1 is failed", job: "JOB-1" }),
      itemState("ITM-002", "blocked", { reason: "job JOB-2 waits at Plan → Build for Product Owner", job: "JOB-2" }),
      itemState("ITM-003", "waiting", { reason: "Plan → Build, decided by Product Owner (pending; needs the increment accepted)" }),
      itemState("ITM-004", "waiting for acceptance", { reason: "UC-001 is open, not accepted" }),
      itemState("ITM-005", "ready"),
      itemState("ITM-006", "ready"),
      itemState("ITM-007", "in progress", { job: "JOB-7", reason: "job JOB-7 is running" }),
      itemState("ITM-008", "done", { pullRequest: "12" }),
      itemState("ITM-009", "waiting for an item it builds on", { reason: "ITM-004 is not done" }),
      itemState("ITM-010", "unknown", { reason: "pull request facts are unknown" }),
      itemState("ITM-012", "ready"),
    ],
  },
  jobs: [job("JOB-1", "failed"), job("JOB-2", "waiting at a gate"), job("JOB-7", "running")],
  held: [held("ITM-005", "team1", ["MOD-alpha"]), held("ITM-006", "team1", ["MOD-delta"]), held("ITM-007", "team1", ["MOD-beta"]),
    held("ITM-020", "team2", ["MOD-alpha"], ["MOD-gamma"])],
});

// TST-798001 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a Scrum product with a work-in-progress limit of 1 and two teams; ITM-001 blocked by a failed job; ITM-002 blocked by a job that waits at a gate; ITM-003 waiting for the gate before its phase; ITM-004 waiting for UC-001, not accepted; ITM-005 ready, changing MOD-alpha, which ITM-020 of team2's sprint changes; ITM-006 ready in team1, whose ITM-007 is the one item in progress; and, as cases that are not blocked, ITM-007 in progress, ITM-008 done, ITM-009 waiting for an item it builds on, ITM-010 unknown and ITM-012 ready (selected for no sprint, changing MOD-zeta that no sprint holds)
// input: blocked(facts)
// expect: exactly six entries in the order of the plan — ITM-001 "failed job" with the sentence of its state; ITM-002 "waiting at a gate" with the sentence that names the gate and its decider; ITM-003 "waiting at a gate" with the gate and its decider; ITM-004 "requirement not accepted" naming UC-001; ITM-005 "held by another team's sprint" naming MOD-alpha, ITM-020 and team2's sprint; ITM-006 "work-in-progress limit" naming the limit, team1 and ITM-007 — and nothing else
test("blocked — a product with one case of each reason lists each with its reason and detail, and nothing else", () => {
  assert.deepEqual(blocked(SIX()), [
    { item: "ITM-001", reason: "failed job", detail: "job JOB-1 is failed" },
    { item: "ITM-002", reason: "waiting at a gate", detail: "job JOB-2 waits at Plan → Build for Product Owner" },
    { item: "ITM-003", reason: "waiting at a gate", detail: "Plan → Build, decided by Product Owner (pending; needs the increment accepted)" },
    { item: "ITM-004", reason: "requirement not accepted", detail: "UC-001 is open, not accepted" },
    { item: "ITM-005", reason: "held by another team's sprint", detail: `MOD-alpha is held by ITM-020 in ${SPRINT2} of team2` },
    { item: "ITM-006", reason: "work-in-progress limit", detail: "the limit of 1 is reached under team1: ITM-007 is in progress" },
  ]);
});

// TST-798002 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: a ready item ITM-006 selected for team1's sprint; ITM-007 and ITM-008 of team2's sprint in progress; ITM-009 of team1's sprint in progress; a limit of 2
// input: blocked(facts) with model Scrum (sprints) and limit 2; the same with the limit 1; with a model without sprints (Kanban) and limit 2; with limit null; with a model that is "unknown"
// expect: with limit 2 in sprints, not blocked — only ITM-009 is in progress under team1, the two of team2 do not count; with limit 1 in sprints, blocked naming ITM-009; without sprints and limit 2, blocked — all three in progress count, and the detail has no team; with no limit or an unknown model, never blocked for the limit
test("blocked — the work-in-progress limit counts the items in progress of the item's team in a model with sprints, of the product without", () => {
  const states = [itemState("ITM-006", "ready"), itemState("ITM-007", "in progress"), itemState("ITM-008", "in progress"), itemState("ITM-009", "in progress")];
  const held3 = [held("ITM-006", "team1", ["MOD-a"]), held("ITM-007", "team2", ["MOD-b"]), held("ITM-008", "team2", ["MOD-c"]), held("ITM-009", "team1", ["MOD-d"])];
  const of = (model) => blocked(facts({ model, plan: { order: null, items: [item("ITM-006", ["MOD-a"])], states }, held: held3 }));
  assert.deepEqual(of(SCRUM_WIP(2)), []);
  assert.deepEqual(of(SCRUM_WIP(1)), [{ item: "ITM-006", reason: "work-in-progress limit", detail: "the limit of 1 is reached under team1: ITM-009 is in progress" }]);
  assert.deepEqual(of(KANBAN(2)), [{ item: "ITM-006", reason: "work-in-progress limit", detail: "the limit of 2 is reached: ITM-007, ITM-008 and ITM-009 are in progress" }]);
  assert.deepEqual(of(SCRUM_WIP(null)), []);
  assert.deepEqual(of("unknown"), []);
});

// TST-798003 · level: unit · module: MOD-progress-measures
// guards: SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES; UC-035
// given: ready items: ITM-001 (team1) changing MOD-a and MOD-b; ITM-002 (team1) changing MOD-c; ITM-003 (team1) changing MOD-d; ITM-004, selected for no sprint, changing MOD-e; held items: ITM-021 of team2 changing MOD-a and using MOD-c; ITM-022 of team2 changing MOD-b; ITM-023 of team1 changing MOD-d; ITM-024 of team2 changing nothing the others change or use
// input: blocked(facts) with no limit
// expect: ITM-001 held by team2's sprint, naming MOD-a with ITM-021 and MOD-b with ITM-022, in that order, in one entry; ITM-002 held, naming MOD-c, which ITM-021 uses and ITM-002 changes; ITM-003 not blocked — the one other item that holds MOD-d is of its own team; ITM-004 not blocked — no sprint holds MOD-e
test("blocked — an item is held by another team's sprint for each module it changes that the held item changes or uses, and by none of its own team", () => {
  const states = ["ITM-001", "ITM-002", "ITM-003", "ITM-004"].map((id) => itemState(id, "ready"));
  const items = [item("ITM-001", ["MOD-a", "MOD-b"]), item("ITM-002", ["MOD-c"]), item("ITM-003", ["MOD-d"]), item("ITM-004", ["MOD-e"])];
  const result = blocked(facts({
    model: SCRUM_WIP(null), plan: { order: null, items, states },
    held: [held("ITM-001", "team1", ["MOD-a", "MOD-b"]), held("ITM-002", "team1", ["MOD-c"]), held("ITM-003", "team1", ["MOD-d"]),
      held("ITM-021", "team2", ["MOD-a"], ["MOD-c"]), held("ITM-022", "team2", ["MOD-b"]), held("ITM-023", "team1", ["MOD-d"]),
      held("ITM-024", "team2", ["MOD-z"])],
  }));
  assert.deepEqual(result, [
    { item: "ITM-001", reason: "held by another team's sprint",
      detail: `MOD-a is held by ITM-021 in ${SPRINT2} of team2; MOD-b is held by ITM-022 in ${SPRINT2} of team2` },
    { item: "ITM-002", reason: "held by another team's sprint", detail: `MOD-c is held by ITM-021 in ${SPRINT2} of team2` },
  ]);
});

// TST-798004 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: ITM-001 and ITM-002 in the state blocked, whose jobs the rows give as failed and as waiting at a gate; ITM-003 blocked by a job that has no row among the jobs; a product with no plan
// input: blocked(facts); blocked of facts with an empty plan
// expect: ITM-001 "failed job" and ITM-002 "waiting at a gate", each with the sentence of its state; ITM-003 is not listed — a reason is not guessed where the job's row is missing; an empty plan lists nothing
test("blocked — a blocked item is a failed job or a job waiting at a gate by its job's row, and never guessed", () => {
  const states = [
    itemState("ITM-001", "blocked", { job: "JOB-1", reason: "job JOB-1 is failed" }),
    itemState("ITM-002", "blocked", { job: "JOB-2", reason: "job JOB-2 waits for a person: which module?" }),
    itemState("ITM-003", "blocked", { job: "JOB-3", reason: "job JOB-3 is failed" }),
  ];
  assert.deepEqual(blocked(facts({ plan: { order: null, items: [], states }, jobs: [job("JOB-1", "failed"), job("JOB-2", "waiting at a gate")] })), [
    { item: "ITM-001", reason: "failed job", detail: "job JOB-1 is failed" },
    { item: "ITM-002", reason: "waiting at a gate", detail: "job JOB-2 waits for a person: which module?" },
  ]);
  assert.deepEqual(blocked(facts()), []);
});
