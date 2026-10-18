// Who works on what — MOD-progress-measures' whoWorksOnWhat, as the accepted text of docs/architecture/MOD-progress-measures.md states it:
// "each participant of the product with its roles, its teams in a product with several teams, and its current jobs; what each team's sprint
// holds; and each source of jobs that could not be read, whose running jobs are not shown". It reads facts.assignments, facts.jobs and
// facts.held, as productFacts with the scope `work` gives them. Of the module, this is whoWorksOnWhat alone.
// Run: node --test tests/progress-measures-who-works-on-what.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// The fixture product has two teams. Its role assignments are read with MOD-product-process' roleAssignmentSchema, as docs/role-assignments/
// holds them; its job rows are in the form of MOD-job-ledger's JobRow; what the sprints hold is in the form of MOD-work-plans' Held.
// Nothing is read from the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { roleAssignmentSchema } from "../src/product-process/index.mjs";
import { whoWorksOnWhat } from "../src/progress-measures/index.mjs";
import { facts, jobRow } from "./progress-measures-facts.mjs";

const assignment = (team, rows) => readDocument(roleAssignmentSchema, `docs/role-assignments/${team}.md`, [
  `# ${team}`, "", "## Roles", "", "| Role | Participants |", "|---|---|", ...rows.map(([role, who]) => `| ${role} | ${who} |`), "",
].join("\n"));
const TEAM1 = assignment("team1", [["Product Owner", "po-a"], ["Scrum Master", "sm-a"], ["Developers", "dev-a, dev-b"]]);
const TEAM2 = assignment("team2", [["Product Owner", "po-a"], ["Developers", "dev-b, dev-c"]]);

/** A JobRow with the route its record names; `reachable` and the reason are the source's. */
const job = (id, participant, state, route, over = {}) => {
  const row = jobRow({ id, participant, state, reachable: over.reachable ?? true });
  return { ...row, record: { ...row.record, route }, source: { reachable: over.reachable ?? true, reason: over.reason ?? null } };
};

const HELD = [
  { item: "ITM-004", sprint: "docs/backlog/sprints/team1/03.md", team: "team1", changes: ["MOD-alpha"], uses: ["MOD-beta"] },
  { item: "ITM-007", sprint: "docs/backlog/sprints/team2/05.md", team: "team2", changes: ["MOD-gamma"], uses: [] },
];

const JOBS = [
  job("JOB-1", "dev-a", "running", "ci hosted"),
  job("JOB-2", "dev-b", "waiting at a gate", "bridge lab-pc"),
  job("JOB-3", "dev-b", "done", "bridge lab-pc"),
  job("JOB-4", "dev-c", "running", "bridge far-pc", { reachable: false, reason: "connect ECONNREFUSED 127.0.0.1:8765" }),
  job("JOB-5", "dev-c", "queued", "tab"),
  job("JOB-6", "dev-a", "failed", "ci hosted"),
];

const twoTeams = (over = {}) => facts({ assignments: [TEAM1, TEAM2], jobs: JOBS, held: HELD, ...over });

// TST-799001 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a product with two teams, team1 and team2; po-a is Product Owner in both, sm-a Scrum Master in team1, dev-a Developers in team1, dev-b Developers in both, dev-c Developers in team2; jobs: JOB-1 running (dev-a), JOB-2 waiting at a gate (dev-b), JOB-3 done (dev-b), JOB-4 running on a Bridge that does not answer (dev-c), JOB-5 queued (dev-c), JOB-6 failed (dev-a)
// input: whoWorksOnWhat(facts)
// expect: five participants in the order the assignments name them: po-a with roles [Product Owner], teams [team1, team2], no job; sm-a [Scrum Master], [team1], none; dev-a [Developers], [team1], [JOB-1]; dev-b [Developers], [team1, team2], [JOB-2]; dev-c [Developers], [team2], [JOB-5] — a job that has ended is not current, and the job on the unreachable Bridge is not shown
test("whoWorksOnWhat — each participant with its roles, its teams and its current jobs", () => {
  const { participants } = whoWorksOnWhat(twoTeams());
  assert.deepEqual(participants, [
    { participant: "po-a", roles: ["Product Owner"], teams: ["team1", "team2"], jobs: [] },
    { participant: "sm-a", roles: ["Scrum Master"], teams: ["team1"], jobs: [] },
    { participant: "dev-a", roles: ["Developers"], teams: ["team1"], jobs: ["JOB-1"] },
    { participant: "dev-b", roles: ["Developers"], teams: ["team1", "team2"], jobs: ["JOB-2"] },
    { participant: "dev-c", roles: ["Developers"], teams: ["team2"], jobs: ["JOB-5"] },
  ]);
});

// TST-799002 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: the product of the first case; and a product with one role assignment, whose Developers are dev-a
// input: whoWorksOnWhat of each
// expect: for the product with two teams, the held items as the facts hold them — ITM-004 of team1 with MOD-alpha changed and MOD-beta used, ITM-007 of team2 with MOD-gamma changed — in the same order; for the product with one assignment, dev-a has no team, since the teams are named only in a product with several
test("whoWorksOnWhat — what each team's sprint holds, and no team in a product with one role assignment", () => {
  assert.deepEqual(whoWorksOnWhat(twoTeams()).held, HELD);
  const single = whoWorksOnWhat(facts({ assignments: [assignment("team1", [["Developers", "dev-a"]])], jobs: [job("JOB-1", "dev-a", "running", "tab")] }));
  assert.deepEqual(single.participants, [{ participant: "dev-a", roles: ["Developers"], teams: [], jobs: ["JOB-1"] }]);
});

// TST-799003 · level: unit · module: MOD-progress-measures
// guards: UC-035 1b; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: the product of the first case, whose JOB-4 runs on the Bridge far-pc that answers "connect ECONNREFUSED 127.0.0.1:8765", plus JOB-7, a second job on that Bridge, and JOB-8, whose record cannot be read: no route, the reason "not held at this commit", the path docs/jobs/JOB-8.md
// input: whoWorksOnWhat(facts); and whoWorksOnWhat of the same facts with every source reachable
// expect: unreachable lists the Bridge far-pc once, with its reason, and docs/jobs/JOB-8.md with "not held at this commit", in the order of the jobs; no job of either source is in any participant's jobs; with every source reachable, unreachable is empty and JOB-4 stands among dev-c's jobs
test("whoWorksOnWhat — a source of jobs that could not be read is named with its reason, and its running jobs are not shown", () => {
  const extra = [
    job("JOB-7", "dev-a", "running", "bridge far-pc", { reachable: false, reason: "connect ECONNREFUSED 127.0.0.1:8765" }),
    { ...job("JOB-8", null, "running", null, { reachable: false, reason: "not held at this commit" }), record: { ...jobRow({ id: "JOB-8" }).record, route: null, participant: null } },
  ];
  const { participants, unreachable } = whoWorksOnWhat(twoTeams({ jobs: [...JOBS, ...extra] }));
  assert.deepEqual(unreachable, [
    { route: "bridge far-pc", reason: "connect ECONNREFUSED 127.0.0.1:8765" },
    { route: "docs/jobs/JOB-8.md", reason: "not held at this commit" },
  ]);
  const shown = participants.flatMap((entry) => entry.jobs);
  assert.ok(!shown.includes("JOB-4") && !shown.includes("JOB-7") && !shown.includes("JOB-8"), shown.join(", "));
  const reachable = JOBS.map((row) => ({ ...row, source: { reachable: true, reason: null } }));
  const answered = whoWorksOnWhat(twoTeams({ jobs: reachable }));
  assert.deepEqual(answered.unreachable, []);
  assert.deepEqual(answered.participants.find((entry) => entry.participant === "dev-c").jobs, ["JOB-4", "JOB-5"]);
});
