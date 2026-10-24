// Whether a job may start for an item, and every reason it may not (UC-032 steps 6 and 7, 7a; UC-034) — MOD-work-plans'
// startable as the accepted text of docs/architecture/MOD-work-plans.md states it: not selected for the current sprint of
// its team; a requirement or use case it names not accepted; an item it builds on not done; the work-in-progress limit
// reached by the items in progress under its role assignment, naming them and those waiting for review; the gate before its
// phase not recorded; no holder of the implementing role in its role assignment with what the role needs.
// Run: node --test tests/work-plans-startable.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-032; UC-034; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
// Guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// Level: unit
//
// The fixture product works in sprints with a work-in-progress limit of 2, and has two teams. Its process has the phase
// Development, done by Developers, which produces MOD and TST; Developers need read the repository, write to the repository,
// and run code and tests. team1's Developers are dev-a, a CLI agent with all three; team2's are dev-a and dev-c, a model
// endpoint that can only draft text and read the repository. A role assignment is read with MOD-product-process'
// roleAssignmentSchema, a sprint with planSchemas.sprint, both through MOD-documents' readDocument; the held items come from
// heldItems. The workflow is written here in MOD-product-process' Workflow form with the parts startable reads, and the
// items' states in the form of ItemState, as itemStates derives them. A reason is a sentence; each test checks the facts the
// reason must name — the item, the sprint, the limit, the role —, not its wording. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { roleAssignmentSchema } from "../src/product-process/index.mjs";
import { heldItems, planSchemas, startable } from "../src/work-plans/index.mjs";

// ---------------------------------------------------------------- the fixture product

const DEVELOPERS = { name: "Developers", filledBy: "agent", howMany: "several",
  capabilities: ["read the repository", "write to the repository", "run code and tests"] };
const workflowWith = (flow) => ({
  model: { name: "team-scrum", kind: "pulled", flow },
  phases: [
    { name: "Sprint Planning", roles: ["Product Owner"], produces: ["ITM"] },
    { name: "Development", roles: ["Developers"], produces: ["MOD", "TST"] },
  ],
  roles: [{ name: "Product Owner", filledBy: "person", howMany: "one", capabilities: ["read the repository"] }, DEVELOPERS],
});
const IN_SPRINTS = workflowWith({ wip: 2, timeBox: null, sprints: true });
const WITHOUT_SPRINTS = workflowWith({ wip: 2, timeBox: null, sprints: false });

const PARTICIPANTS = [
  { name: "alice", type: "person", model: null, capabilities: ["read the repository", "write to the repository"], place: null, route: "person" },
  { name: "dev-a", type: "CLI agent", model: "example-model",
    capabilities: ["read the repository", "write to the repository", "run code and tests"], place: "this machine", route: "bridge" },
  { name: "dev-c", type: "model endpoint", model: "example-model", capabilities: ["draft text", "read the repository"],
    place: "this machine", route: "endpoint" },
];

const assignment = (team, developers) => readDocument(roleAssignmentSchema, `docs/role-assignments/${team}.md`, [
  `# ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product Owner | alice |",
  `| Developers | ${developers} |`, "",
].join("\n"));
const TEAM1 = assignment("team1", "dev-a");
const TEAM2 = assignment("team2", "dev-a, dev-c");

const sprint = (team, nn, selection) => readDocument(planSchemas.sprint, `docs/backlog/sprints/${team}/${nn}.md`, [
  "---", `sprint: ${Number(nn)}`, "goal: g", "start: 2026-10-12", "end:", "closer: alice", "branch:", "selection:",
  ...selection.map((id) => `  - ${id}`), "---", `# ${team} Sprint ${nn}`, "",
].join("\n"));
// team1's current sprint selects ITM-001, ITM-002 and ITM-003; team2's selects ITM-004 and ITM-005.
const SPRINT1 = sprint("team1", "01", ["ITM-001", "ITM-002", "ITM-003"]);
const SPRINT2 = sprint("team2", "01", ["ITM-004", "ITM-005"]);
const item = (id) => ({ kind: "item", path: `docs/backlog/${id}-work.md`, id, fields: { id, modules: [], builds_on: [] } });
const HELD = heldItems([SPRINT1, SPRINT2], ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005"].map(item), [], []);

const state = (item, value, { reason = null, pullRequest = null, job = null } = {}) => ({ item, state: value, reason, job, pullRequest });
const READY = ["ITM-001", "ITM-002", "ITM-003", "ITM-004", "ITM-005", "ITM-006"].map((id) => state(id, "ready"));
const withStates = (...changed) => READY.map((s) => changed.find((c) => c.item === s.item) ?? s);

const context = (over = {}) => ({ workflow: IN_SPRINTS, assignment: TEAM1, sprint: SPRINT1, held: HELD, wip: 2,
  participants: PARTICIPANTS, ...over });
const reasonsOf = (result) => (result.startable ? [] : result.reasons);

// ---------------------------------------------------------------- startable

// TST-473187 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// given: ITM-001 ready, selected for team1's current sprint; team1's Developers held by dev-a, who has all they need; no item in progress
// input: startable("ITM-001", the states, team1's context)
// expect: { startable: true } — the known positive of every test below, each of which changes one thing and finds one reason
test("startable — a ready item selected for its team's current sprint, with a capable holder of the implementing role, may start", () => {
  assert.deepEqual(startable("ITM-001", READY, context()), { startable: true });
});

// TST-473188 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
// given: two teams' sprints running at once — team1's selects ITM-001 to ITM-003, team2's ITM-004 and ITM-005 —; every item ready
// input: startable of ITM-004 and of ITM-006 with team1's context; of ITM-004 with team2's context and team2's sprint
// expect: ITM-004 under team1: one reason, naming ITM-004 and team1's sprint team1/01 — team2's sprint selected it, not team1's —; ITM-006, selected by no sprint: one reason naming team1/01; ITM-004 under team2: startable
test("startable — with several teams running sprints, a job starts only for an item its own team's current sprint selected", () => {
  const notTeam1 = reasonsOf(startable("ITM-004", READY, context()));
  assert.equal(notTeam1.length, 1, notTeam1.join(" | "));
  assert.ok(notTeam1[0].includes("ITM-004") && notTeam1[0].includes("team1/01"), notTeam1[0]);
  const nowhere = reasonsOf(startable("ITM-006", READY, context()));
  assert.equal(nowhere.length, 1, nowhere.join(" | "));
  assert.ok(nowhere[0].includes("team1/01"), nowhere[0]);
  assert.deepEqual(startable("ITM-004", READY, context({ assignment: TEAM2, sprint: SPRINT2 })), { startable: true });
});

// TST-473189 · level: unit · module: MOD-work-plans
// guards: A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
// given: ITM-001 ready; (a) a model with sprints, and no sprint of team1 running; (b) a model without sprints, and no sprint
// input: startable("ITM-001", the states, each context)
// expect: (a) one reason, naming team1 — no sprint of it runs —; (b) startable: without sprints there is no selection
test("startable — in a model with sprints nothing starts while the team runs no sprint; without sprints there is no selection", () => {
  const none = reasonsOf(startable("ITM-001", READY, context({ sprint: null })));
  assert.equal(none.length, 1, none.join(" | "));
  assert.ok(none[0].includes("team1"), none[0]);
  assert.deepEqual(startable("ITM-001", READY, context({ workflow: WITHOUT_SPRINTS, sprint: null, held: [] })), { startable: true });
});

// TST-473190 · level: unit · module: MOD-work-plans
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-032
// given: ITM-001 (a) waiting for acceptance of UC-007; (b) waiting for ITM-009, an item it builds on that is not done; (c) a step waiting for the gate Design → Development, decided by the Product Owner; (d) done
// input: startable("ITM-001", the states of each case, team1's context)
// expect: one reason each, naming (a) UC-007, (b) ITM-009, (c) the gate Design → Development, (d) that ITM-001 is done
test("startable — an item whose state is not ready names why: what is not accepted, the item it waits for, the gate before its phase, or that it is done", () => {
  const cases = [
    [state("ITM-001", "waiting for acceptance", { reason: "UC-007" }), "UC-007"],
    [state("ITM-001", "waiting for an item it builds on", { reason: "ITM-009" }), "ITM-009"],
    [state("ITM-001", "waiting", { reason: "the gate Design → Development, decided by the Product Owner" }), "Design → Development"],
    [state("ITM-001", "done"), "done"],
  ];
  for (const [changed, named] of cases) {
    const reasons = reasonsOf(startable("ITM-001", withStates(changed), context()));
    assert.equal(reasons.length, 1, `${changed.state}: ${reasons.join(" | ")}`);
    assert.ok(reasons[0].includes(named), reasons[0]);
  }
});

// TST-473191 · level: unit · module: MOD-work-plans
// guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; UC-032
// given: the limit 2; team1's sprint holds ITM-001, in progress with a job, and ITM-002, in progress with its pull request open — waiting for review —; team2's sprint holds ITM-004, in progress; ITM-003 ready
// input: startable("ITM-003", those states, team1's context); then the same with ITM-001 done; and startable("ITM-005", the first states, team2's context)
// expect: ITM-003: one reason, naming the limit 2, ITM-001 and ITM-002, and that ITM-002 waits for review; once ITM-001 is done, startable; ITM-005 under team2: startable — only ITM-004 is in progress under team2's assignment
test("startable — the work-in-progress limit counts the items in progress under the item's role assignment, naming them and those waiting for review", () => {
  const busy = withStates(state("ITM-001", "in progress", { job: "JOB-1" }), state("ITM-002", "in progress", { pullRequest: "#7" }),
    state("ITM-004", "in progress", { job: "JOB-4" }));
  const reasons = reasonsOf(startable("ITM-003", busy, context()));
  assert.equal(reasons.length, 1, reasons.join(" | "));
  for (const named of ["2", "ITM-001", "ITM-002", "review"]) assert.ok(reasons[0].includes(named), `${named}: ${reasons[0]}`);
  assert.ok(!reasons[0].includes("ITM-004"), reasons[0]);
  const freed = busy.map((s) => (s.item === "ITM-001" ? state("ITM-001", "done") : s));
  assert.deepEqual(startable("ITM-003", freed, context()), { startable: true });
  assert.deepEqual(startable("ITM-005", busy, context({ assignment: TEAM2, sprint: SPRINT2 })), { startable: true });
});

// TST-473192 · level: unit · module: MOD-work-plans
// guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
// given: a model without sprints and the limit 2, its one role assignment; ITM-001 and ITM-004 in progress; ITM-003 ready
// input: startable("ITM-003", those states, a context without sprints)
// expect: one reason naming the limit and both items in progress — without sprints, every item is under the one assignment
test("startable — without sprints, every item in progress counts under the product's one role assignment", () => {
  const busy = withStates(state("ITM-001", "in progress", { job: "JOB-1" }), state("ITM-004", "in progress", { job: "JOB-4" }));
  const reasons = reasonsOf(startable("ITM-003", busy, context({ workflow: WITHOUT_SPRINTS, sprint: null, held: [] })));
  assert.equal(reasons.length, 1, reasons.join(" | "));
  for (const named of ["2", "ITM-001", "ITM-004"]) assert.ok(reasons[0].includes(named), `${named}: ${reasons[0]}`);
});

// TST-473193 · level: unit · module: MOD-work-plans
// guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE; A ROLE NAMES THE CAPABILITIES IT NEEDS
// given: ITM-001 ready and selected; team1's Developers held (a) by dev-c alone, who cannot write to the repository or run code and tests; (b) by alice only for Product Owner, and no Developers row at all
// input: startable("ITM-001", the states, team1's context with each assignment)
// expect: one reason each, naming Developers — the implementing role, the role of the phase that produces MOD —; for (a) also a capability it needs that no holder has
test("startable — without a holder of the implementing role that has what the role needs, nothing starts", () => {
  const weak = assignment("team1", "dev-c");
  const reasons = reasonsOf(startable("ITM-001", READY, context({ assignment: weak })));
  assert.equal(reasons.length, 1, reasons.join(" | "));
  assert.ok(reasons[0].includes("Developers") && reasons[0].includes("run code and tests"), reasons[0]);
  const empty = readDocument(roleAssignmentSchema, "docs/role-assignments/team1.md",
    ["# team1", "", "## Roles", "", "| Role | Participants |", "|---|---|", "| Product Owner | alice |", ""].join("\n"));
  const none = reasonsOf(startable("ITM-001", READY, context({ assignment: empty })));
  assert.equal(none.length, 1, none.join(" | "));
  assert.ok(none[0].includes("Developers"), none[0]);
});
