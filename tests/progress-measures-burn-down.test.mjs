// The burn-down of each team's sprint (UC-035; UC-032) — MOD-progress-measures' progressIn as the accepted text of
// docs/architecture/MOD-progress-measures.md states it for a model with sprints: "for each team its sprint's items and the
// remaining items per day of the sprint; for a team with no running sprint, its last sprint's final burn-down … Each item's
// state on a day is dated by the records and the pull requests." Of progressIn, this is the part built: the grid of a planned
// model and the board's flow are not built yet, and are null.
// Run: node --test tests/progress-measures-burn-down.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; EVERY TEAM RUNS SPRINTS OF ITS OWN
// Level: unit
//
// The facts are those progressIn reads, in the form of MOD-progress-measures' Facts: the declared model; the role
// assignments, which name the teams; every team's sprint records, read with MOD-work-plans' planSchemas.sprint; the items'
// states, in ItemState form; and the pull requests, in MOD-repository-hosts' PullRequest form. team1 runs its sprint 01
// (2026-10-12 to 2026-10-18, on its own branch) with ITM-001 to ITM-003; team2 closed its sprint 01 (2026-10-01 to
// 2026-10-07) with ITM-004 and ITM-005; team3 has no sprint yet. Each test states its input and its expected result before
// it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { progressIn } from "../src/progress-measures/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const NOW = new Date("2026-10-16T12:00:00Z");
const MODEL = (sprints = true) => ({ name: "team-scrum", kind: "pulled", measure: "remaining items per time box",
  flow: { wip: null, timeBox: sprints ? "1 week" : null, sprints } });
const assignment = (team) => ({ kind: "role-assignment", path: `docs/role-assignments/${team}.md`, id: null, fields: {} });
const sprint = (team, nn, { start, end, branch = "", selection, appended = [] }) => readDocument(planSchemas.sprint,
  `docs/backlog/sprints/${team}/${nn}.md`, ["---", `sprint: ${Number(nn)}`, "goal: g", `start: ${start}`, `end: ${end}`.trimEnd(),
    "closer: alice", `branch: ${branch}`.trimEnd(), "selection:", ...selection.map((id) => `  - ${id}`), "---", `# ${team} Sprint ${nn}`,
    "", ...appended, ""].join("\n"));
const merged = (number, item, base, day) => ({ number, title: `${item}: the work`, branch: `work/${item}`, base, head: "a".repeat(40),
  state: "merged", draft: false, url: `https://example.org/${number}`, opened: `${day}T08:00:00Z`, merged: `${day}T10:00:00Z`,
  closed: `${day}T10:00:00Z` });
const state = (item, value) => ({ item, state: value, reason: null, job: null, pullRequest: null });

const SPRINTS = [
  sprint("team1", "01", { start: "2026-10-12", end: "2026-10-18", branch: "sprint/team1/01", selection: ["ITM-001", "ITM-002", "ITM-003"] }),
  sprint("team2", "01", { start: "2026-10-01", end: "2026-10-07", selection: ["ITM-004", "ITM-005"],
    appended: ["## Review", "", "The increment is ITM-004.", "", "## Unfinished items", "", "to the backlog: ITM-005",
      "into the next sprint:", "", "## Retrospective", "", "- change: review sooner."] }),
];
const FACTS = (over = {}) => ({
  model: MODEL(), modelSince: null, assignments: ["team1", "team2", "team3"].map(assignment), sprints: SPRINTS,
  plan: { order: null, items: [], states: [state("ITM-001", "done"), state("ITM-002", "done"), state("ITM-003", "in progress"),
    state("ITM-004", "done"), state("ITM-005", "ready")] },
  pullRequests: [merged(1, "ITM-001", "sprint/team1/01", "2026-10-13"), merged(2, "ITM-002", "sprint/team1/01", "2026-10-15"),
    merged(3, "ITM-004", "main", "2026-10-03")],
  ...over,
});
const days = (entries) => entries.map(({ day, remaining }) => [day, remaining]);

// TST-472459 · level: unit · module: MOD-progress-measures
// guards: UC-035; EVERY TEAM RUNS SPRINTS OF ITS OWN; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the facts above, on 2026-10-16
// input: progressIn(facts, now)
// expect: the model's measure; for team1 its running sprint's three items with their states and the remaining items per day from its start to today — 3, 2 after ITM-001's merge on 10-13, 1 after ITM-002's on 10-15 —, not final; for team2, whose sprint is closed, that sprint's final burn-down over its whole time box — 2, then 1 from 10-03; no entry for team3, which has no sprint; the grid and the flow not built, null
test("progressIn — each team's sprint, its items and the remaining items per day; a closed sprint's burn-down is final", () => {
  const progress = progressIn(FACTS(), NOW);
  assert.equal(progress.measure, "remaining items per time box");
  assert.deepEqual(progress.sprints.map((s) => [s.team, s.items.map((i) => [i.item, i.state]), s.final]), [
    ["team1", [["ITM-001", "done"], ["ITM-002", "done"], ["ITM-003", "in progress"]], false],
    ["team2", [["ITM-004", "done"], ["ITM-005", "ready"]], true],
  ]);
  assert.deepEqual(days(progress.sprints[0].burnDown),
    [["2026-10-12", 3], ["2026-10-13", 2], ["2026-10-14", 2], ["2026-10-15", 1], ["2026-10-16", 1]]);
  assert.deepEqual(days(progress.sprints[1].burnDown), [["2026-10-01", 2], ["2026-10-02", 2], ["2026-10-03", 1],
    ["2026-10-04", 1], ["2026-10-05", 1], ["2026-10-06", 1], ["2026-10-07", 1]]);
  assert.equal(progress.planned, null);
  assert.equal(progress.flow, null);
});

// TST-472460 · level: unit · module: MOD-progress-measures
// guards: UC-035; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
// given: team1's sprint changed by a new start decision on 2026-10-14 (## Selection) that adds ITM-006, still open; and, as a second case, a sprint without a time box — no end —, started 2026-10-14
// input: progressIn(facts with that sprint, now)
// expect: the remaining items count ITM-006 from 10-14 on — 3, 2, then 3, 2, 2 —, and its items list it; a sprint without a time box runs from its start to today
test("progressIn — a new start decision counts from its day; a sprint without a time box runs to today", () => {
  const changed = sprint("team1", "01", { start: "2026-10-12", end: "2026-10-18", branch: "sprint/team1/01",
    selection: ["ITM-001", "ITM-002", "ITM-003"], appended: ["## Selection", "", "at: 2026-10-14",
      "selection: ITM-001, ITM-002, ITM-003, ITM-006"] });
  const facts = FACTS({ sprints: [changed], plan: { order: null, items: [], states: [...FACTS().plan.states, state("ITM-006", "ready")] } });
  const team1 = progressIn(facts, NOW).sprints[0];
  assert.deepEqual(team1.items.map((i) => i.item), ["ITM-001", "ITM-002", "ITM-003", "ITM-006"]);
  assert.deepEqual(days(team1.burnDown),
    [["2026-10-12", 3], ["2026-10-13", 2], ["2026-10-14", 3], ["2026-10-15", 2], ["2026-10-16", 2]]);
  const open = sprint("team1", "02", { start: "2026-10-14", end: "", selection: ["ITM-003"] });
  const noBox = progressIn(FACTS({ sprints: [open] }), NOW).sprints[0];
  assert.deepEqual(days(noBox.burnDown), [["2026-10-14", 1], ["2026-10-15", 1], ["2026-10-16", 1]]);
  assert.equal(noBox.final, false);
});

// TST-472461 · level: unit · module: MOD-progress-measures
// guards: PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: (a) a model without sprints; (b) no declared model
// input: progressIn of each
// expect: (a) no sprint entries; (b) the error NoModel
test("progressIn — without sprints there is no burn-down; without a declared model there is no progress", () => {
  assert.deepEqual(progressIn(FACTS({ model: MODEL(false) }), NOW).sprints, []);
  assert.throws(() => progressIn(FACTS({ model: null }), NOW), (error) => error.name === "NoModel");
});
