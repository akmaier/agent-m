// The board and the items per state per day of a model with a work-in-progress limit (UC-035 step 2; ITM-796) — MOD-progress-measures'
// progressIn as the accepted text of docs/architecture/MOD-progress-measures.md states it: "For a model with a work-in-progress limit,
// the board with its columns and its limit — counted per team in a model with sprints — and the items per state per day. Each item's
// state on a day is dated by the records and the pull requests", `flow: { columns: Array<{ name, items }>, wip: number | null,
// cumulative: Array<{ day, counts }> } | null`, and "After a change of model, `since` is the change, and the chart starts there".
// Run: node --test tests/progress-measures-flow.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// Where the accepted text leaves a reading open, these cases take the one that its words allow (ITM-796 names them):
//   - the columns are the states of MOD-work-plans' ItemState, in the order of that type, one column each, an empty one included, and
//     every item of `plan.states` stands in the column of its state;
//   - `wip` is the model's limit; the count per team is how the limit is applied (`startable`, `blocked`), so the board holds all items;
//   - the days run from `since`, else from the first day a pull request of an item opens or a job on it starts, to the day of `now`;
//     `counts` holds a number for every column;
//   - an item is dated by its pull requests (named as the burn-down names them: in the branch or the title) and by the job records that
//     work on it: in progress from the earlier of the day its first pull request opened and the day its first job started, done from the
//     day its first merged pull request merged; on the day of `now`, every item is in its state as the facts give it, so that the last day
//     is the board; before its start a started item was ready, because a job starts only for a ready item; an item that never started
//     is in its state throughout, as is one whose start or merge nothing dates;
//   - with the pull requests unknown nothing is dated, and `cumulative` is empty.
// The facts are those progressIn reads, in the form of MOD-progress-measures' Facts. Each test states its input and its expected result
// before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { progressIn } from "../src/progress-measures/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const NOW = new Date("2026-10-16T12:00:00Z");
const COLUMNS = ["waiting for acceptance", "waiting for an item it builds on", "waiting", "ready", "in progress", "blocked", "done", "unknown"];
const KANBAN = { name: "kanban", kind: "pulled", measure: "items per state over time", flow: { wip: 3, timeBox: null, sprints: false } };
const SCRUM_WIP = { name: "scrum-wip", kind: "pulled", measure: "items per state over time", flow: { wip: 4, timeBox: null, sprints: true } };
const SCRUM = { name: "scrum", kind: "pulled", measure: "remaining items per time box", flow: { wip: null, timeBox: "1 week", sprints: true } };
const V_MODEL = { name: "v-model", kind: "planned", measure: "plan entries per phase", flow: null, phases: [], transitions: [], gates: [] };

const state = (item, value) => ({ item, state: value, reason: null, job: null, pullRequest: null });
const pullRequest = (number, item, { opened, merged = null, closed = null }) => ({ number, title: `${item}: the work`, branch: `work/${item}`,
  base: "main", head: "a".repeat(40), state: merged ? "merged" : closed ? "closed" : "open", draft: false, url: `https://example.org/${number}`,
  opened: `${opened}T08:00:00Z`, merged: merged ? `${merged}T10:00:00Z` : null, closed: merged ? `${merged}T10:00:00Z` : closed ? `${closed}T10:00:00Z` : null });
const job = (id, item, day) => ({ record: { id, path: `docs/jobs/${id}.md`, worksOn: [item], start: new Date(`${day}T09:00:00Z`) }, state: "running" });
const assignment = (team) => ({ kind: "role-assignment", path: `docs/role-assignments/${team}.md`, id: null, fields: {} });
const sprint = (team, nn, selection) => readDocument(planSchemas.sprint, `docs/backlog/sprints/${team}/${nn}.md`, ["---", `sprint: ${Number(nn)}`,
  "goal: g", "start: 2026-10-12", "end:", "closer: alice", "branch:", "selection:", ...selection.map((id) => `  - ${id}`), "---", `# ${team} Sprint ${nn}`, ""].join("\n"));

// ITM-001 opened 10-12 and merged 10-14; ITM-002 opened 10-13 and is open; ITM-003 has a job since 10-14 and no pull request; ITM-004 is ready;
// ITM-005 waits for an item it builds on; ITM-006 failed a job started 10-15. Pull request 9 names ITM-0011, which is no item here.
const STATES = [state("ITM-001", "done"), state("ITM-002", "in progress"), state("ITM-003", "in progress"), state("ITM-004", "ready"),
  state("ITM-005", "waiting for an item it builds on"), state("ITM-006", "blocked")];
const FACTS = (over = {}) => ({
  model: KANBAN, modelSince: null, assignments: [], sprints: [], plan: { order: null, items: [], states: STATES },
  pullRequests: [pullRequest(1, "ITM-001", { opened: "2026-10-12", merged: "2026-10-14" }), pullRequest(2, "ITM-002", { opened: "2026-10-13" }),
    pullRequest(9, "ITM-0011", { opened: "2026-10-10", merged: "2026-10-13" })],
  jobs: [job("JOB-1", "ITM-003", "2026-10-14"), job("JOB-2", "ITM-006", "2026-10-15")],
  ...over,
});
const board = (flow) => flow.columns.map((column) => [column.name, column.items]).filter(([, items]) => items.length);
const days = (flow) => flow.cumulative.map(({ day, counts }) => [day, Object.fromEntries(Object.entries(counts).filter(([, count]) => count))]);

// TST-796001 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: a Kanban product (limit 3) with six items — ITM-001 done (pull request opened 10-12, merged 10-14), ITM-002 in progress (pull request opened 10-13, open), ITM-003 in progress (a job since 10-14, no pull request), ITM-004 ready, ITM-005 waiting for an item it builds on, ITM-006 blocked (a job since 10-15) — and a merged pull request of ITM-0011, no item here; the day is 2026-10-16
// input: progressIn(facts, now)
// expect: the model's measure; no sprint entries and no grid; flow.wip 3; the eight columns in the order of ItemState, each item in the one of its state; and the items per state for each day from 10-12, the first dated day, to 10-16 — a started item ready before its start, ITM-001 done on its merge day 10-14 (the merged ITM-0011 does not date ITM-001), ITM-006 in progress from 10-15 and blocked on 10-16, which is the board
test("progressIn — the board of a Kanban product holds each item in its state, and the items per state per day follow the records and pull requests", () => {
  const progress = progressIn(FACTS(), NOW);
  assert.equal(progress.measure, "items per state over time");
  assert.deepEqual(progress.sprints, []);
  assert.equal(progress.planned, null);
  assert.equal(progress.flow.wip, 3);
  assert.deepEqual(progress.flow.columns.map((column) => column.name), COLUMNS);
  assert.deepEqual(board(progress.flow), [["waiting for an item it builds on", ["ITM-005"]], ["ready", ["ITM-004"]],
    ["in progress", ["ITM-002", "ITM-003"]], ["blocked", ["ITM-006"]], ["done", ["ITM-001"]]]);
  assert.deepEqual(days(progress.flow), [
    ["2026-10-12", { "waiting for an item it builds on": 1, ready: 4, "in progress": 1 }],
    ["2026-10-13", { "waiting for an item it builds on": 1, ready: 3, "in progress": 2 }],
    ["2026-10-14", { "waiting for an item it builds on": 1, ready: 2, "in progress": 2, done: 1 }],
    ["2026-10-15", { "waiting for an item it builds on": 1, ready: 1, "in progress": 3, done: 1 }],
    ["2026-10-16", { "waiting for an item it builds on": 1, ready: 1, "in progress": 2, blocked: 1, done: 1 }],
  ]);
  for (const { counts } of progress.flow.cumulative) assert.deepEqual(Object.keys(counts), COLUMNS);
});

// TST-796002 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: the facts of TST-796001, with the model declared on 2026-10-14 (modelSince)
// input: progressIn(facts, now)
// expect: the chart starts at the change, on 10-14, and the days before it are not drawn; the counts of the days from there on are those of TST-796001
test("progressIn — after a change of model the items per state per day start at the change", () => {
  const { flow, since } = progressIn(FACTS({ modelSince: "2026-10-14" }), NOW);
  assert.equal(since, "2026-10-14");
  assert.deepEqual(flow.cumulative.map(({ day }) => day), ["2026-10-14", "2026-10-15", "2026-10-16"]);
  assert.deepEqual(days(flow)[0], ["2026-10-14", { "waiting for an item it builds on": 1, ready: 2, "in progress": 2, done: 1 }]);
  assert.deepEqual(days(flow)[2], ["2026-10-16", { "waiting for an item it builds on": 1, ready: 1, "in progress": 2, blocked: 1, done: 1 }]);
});

// TST-796003 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: (a) the facts of TST-796001 with the pull requests unknown; (b) a Kanban product with no item and no pull request; (c) a Kanban product whose items none has started, with no change of model
// input: progressIn of each
// expect: (a) the board and the limit as the item states give them, and no day — nothing is dated, nothing guessed; (b) eight empty columns, the limit, and no day; (c) the board, and no day, since no day is dated
test("progressIn — the days are not guessed: with the pull requests unknown, with nothing dated, with no item", () => {
  const unknown = progressIn(FACTS({ pullRequests: "unknown" }), NOW).flow;
  assert.equal(unknown.wip, 3);
  assert.deepEqual(board(unknown), [["waiting for an item it builds on", ["ITM-005"]], ["ready", ["ITM-004"]],
    ["in progress", ["ITM-002", "ITM-003"]], ["blocked", ["ITM-006"]], ["done", ["ITM-001"]]]);
  assert.deepEqual(unknown.cumulative, []);
  const empty = progressIn(FACTS({ plan: { order: null, items: [], states: [] }, pullRequests: [], jobs: [] }), NOW).flow;
  assert.deepEqual(empty.columns.map((column) => [column.name, column.items.length]), COLUMNS.map((name) => [name, 0]));
  assert.equal(empty.wip, 3);
  assert.deepEqual(empty.cumulative, []);
  const waiting = progressIn(FACTS({ plan: { order: null, items: [], states: [state("ITM-004", "ready"), state("ITM-007", "waiting")] },
    pullRequests: [], jobs: [] }), NOW).flow;
  assert.deepEqual(board(waiting), [["waiting", ["ITM-007"]], ["ready", ["ITM-004"]]]);
  assert.deepEqual(waiting.cumulative, []);
});

// TST-796004 · level: unit · module: MOD-progress-measures
// guards: UC-035; EVERY TEAM RUNS SPRINTS OF ITS OWN; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: the facts of TST-796001 under Scrum with a work-in-progress limit (limit 4, sprints, no time box), with team1's role assignment and its running sprint 01 that selects ITM-002 and ITM-003
// input: progressIn(facts, now)
// expect: the sprints hold team1's sprint with its two items, as for a model with time boxes, and flow holds the board and the limit 4 — all six items, the count per team being how the limit is applied, not a split of the board
test("progressIn — a model with sprints and a limit gives both the sprints and the board", () => {
  const facts = FACTS({ model: SCRUM_WIP, assignments: [assignment("team1")], sprints: [sprint("team1", "01", ["ITM-002", "ITM-003"])] });
  const progress = progressIn(facts, NOW);
  assert.deepEqual(progress.sprints.map((each) => [each.team, each.items.map((item) => item.item)]), [["team1", ["ITM-002", "ITM-003"]]]);
  assert.equal(progress.flow.wip, 4);
  assert.deepEqual(progress.flow.columns.flatMap((column) => column.items).sort(), STATES.map((each) => each.item));
  assert.equal(progress.flow.cumulative.length, 5);
});

// TST-796005 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: the facts of TST-796001 under (a) Scrum with time boxes and no limit, (b) a planned model, (c) a model that could not be read ("unknown")
// input: progressIn of each
// expect: flow is null for each — a board is drawn only for a model with a work-in-progress limit
test("progressIn — a model without a work-in-progress limit has no board", () => {
  assert.equal(progressIn(FACTS({ model: SCRUM }), NOW).flow, null);
  assert.equal(progressIn(FACTS({ model: V_MODEL }), NOW).flow, null);
  assert.equal(progressIn(FACTS({ model: "unknown" }), NOW).flow, null);
});

// TST-796006 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: Kanban items — ITM-001 done by a pull request that opened and merged on 10-13 and is named only in its title, ITM-002 ready again after a pull request opened 10-12 and closed without merge 10-13, ITM-003 in progress by a job whose start is a text "2026-10-12T09:00:00Z" — and the facts' jobs missing altogether (then ITM-003 has no dated start)
// input: progressIn(facts, now)
// expect: ITM-001 is done from 10-13, never in progress before it; ITM-002 stays ready on every day, as its state says; ITM-003 started 10-12 and in progress from then on; the facts without `jobs` date only by the pull requests, and ITM-003, whose start nothing dates, stays in progress on every day
test("progressIn — a pull request named in its title, one closed without merge, a job start given as text, and no jobs", () => {
  const titled = { ...pullRequest(3, "ITM-001", { opened: "2026-10-13", merged: "2026-10-13" }), branch: "feature/the-work", title: "ITM-001 the work" };
  const abandoned = pullRequest(4, "ITM-002", { opened: "2026-10-12", closed: "2026-10-13" });
  const textual = { record: { id: "JOB-3", path: "docs/jobs/JOB-3.md", worksOn: ["ITM-003"], start: "2026-10-12T09:00:00Z" }, state: "running" };
  const states = [state("ITM-001", "done"), state("ITM-002", "ready"), state("ITM-003", "in progress")];
  const { flow } = progressIn(FACTS({ plan: { order: null, items: [], states }, pullRequests: [titled, abandoned], jobs: [textual] }), NOW);
  assert.deepEqual(days(flow), [
    ["2026-10-12", { ready: 2, "in progress": 1 }],
    ["2026-10-13", { ready: 1, "in progress": 1, done: 1 }],
    ["2026-10-14", { ready: 1, "in progress": 1, done: 1 }],
    ["2026-10-15", { ready: 1, "in progress": 1, done: 1 }],
    ["2026-10-16", { ready: 1, "in progress": 1, done: 1 }],
  ]);
  const withoutJobs = FACTS({ plan: { order: null, items: [], states }, pullRequests: [titled] });
  delete withoutJobs.jobs;
  assert.deepEqual(days(progressIn(withoutJobs, NOW).flow), [
    ["2026-10-13", { ready: 1, "in progress": 1, done: 1 }], ["2026-10-14", { ready: 1, "in progress": 1, done: 1 }],
    ["2026-10-15", { ready: 1, "in progress": 1, done: 1 }], ["2026-10-16", { ready: 1, "in progress": 1, done: 1 }],
  ]);
});
