// MOD-workflow-entries' entry onSchedule (ITM-1032), as the accepted text of docs/architecture/MOD-workflow-entries.md states it (blob 49316ce92c74b3c166dea7b5c65436fc40c6d660, :165-168): "`onSchedule(env: CiEnvironment) ->
// Promise<EntryStatus>` — on the product's schedule: the events in time. Each sprint that MOD-work-plans' `sprintsToClose` names — its time box ended, or, without one, every selected item done or the Product Owner's `## Ended` — whose
// closer is an agent gets its close, a job of kind `close-sprint` queued for the agent's model on the route `any` (MOD-job-ledger), unless a close of it is already queued or running (`A SPRINT CLOSED
// BY AN AGENT STARTS BY ITSELF`); a coding agent on CI that offers that model takes it, as `onRecordsChanged` takes the jobs of the route `any`, or a Bridge does (MOD-bridge-jobs)."; UC-041.
// Run: node --test tests/workflow-entries-schedule.test.mjs
//
// Module: MOD-workflow-entries
// Guards: A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF; CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: unit
//
// Deterministic, no network: the product and the instance are temporary git repositories laid out as the job workflow lays them out (as tests/workflow-entries-check-completed.test.mjs lays them out); the product holds the job workflow's file, which
// queueing on the CI route asks for, and four sprint records. The register names ci-bot (an agent of fixture-llm), lab-bot (an agent of lab-llm) and alice (a person). The job workflow declares the coding agent on CI
// dev-ci (claude, on the server's runners, its key FIXTURE_KEY) offering fixture-llm. The readings, named in the pull
// request: an agent is a participant of the register whose type is not `person`; its route is the one its register row names (`ci hosted ...` or `ci runner:<label> ...`); the job's `works_on` (which names items, not a sprint) is the items of the sprint's selection, its parameter
// `sprint` the sprint's name `<team>/<nn>`; its starter is the schedule; a close that is queued, taken or waiting at a gate counts as queued or running, one that has ended does not; like every entry that writes, it ends `not run` before writing when the person's token is missing.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendToRecord, startRecord } from "../src/job-ledger/index.mjs";
import { jobWorkflowFiles } from "../src/runtimes/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");

const text = (...lines) => `${lines.join("\n")}\n`;
const NOW = new Date("2026-10-19T06:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";

const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model |", "|---|---|---|",
  "| ci-bot | agent | fixture-llm |",
  "| lab-bot | agent | lab-llm |",
  "| alice | person | — |");
const declaration = (version) => text("---", "model: scrum", "model_file: src/model-catalogue/models/scrum.md", `model_version: ${version}`, "---",
  "# Process", "", "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | sprint/<team>/<nn> |", "",
  "## Definition of Done", "", "The job rules hold; no condition is added.");
const item = (id) => text("---", `id: ${id}`, `title: ${id} item`, "level: module", "realises:", "  - UC-001", "modules:", "  - MOD-store", "tests:", "  - unit", "origin:", "  - UC-001", "---", `# ${id} item`, "", "## Outcome", "", "o", "", "## Acceptance", "", "a");
const sprint = (team, nn, { end, closer, extra = [] }) => text("---", `sprint: ${Number(nn)}`, "goal: The fixture sprint", "start: 2026-10-05", `end: ${end}`, `closer: ${closer}`, "branch:", "selection:", "  - ITM-001", "---", `# ${team} Sprint ${nn}`, "", ...extra);
// The sprints: team1/01 ended and closed by the CI agent; /02 ended, closed already; /03 ended, closed by a person; /04 not ended; /05 ended and closed by the self-hosted agent.
const SPRINTS = {
  "docs/backlog/sprints/team1/01.md": sprint("team1", 1, { end: "2026-10-12", closer: "ci-bot" }),
  "docs/backlog/sprints/team1/02.md": sprint("team1", 2, { end: "2026-10-12", closer: "ci-bot", extra: ["## Review", "", "closed."] }),
  "docs/backlog/sprints/team1/03.md": sprint("team1", 3, { end: "2026-10-12", closer: "alice" }),
  "docs/backlog/sprints/team1/04.md": sprint("team1", 4, { end: "2026-11-30", closer: "ci-bot" }),
  "docs/backlog/sprints/team1/06.md": sprint("team1", 6, { end: "2026-10-12", closer: "ghost" }),
};
const LAB_SPRINT = { "docs/backlog/sprints/team2/01.md": sprint("team2", 1, { end: "2026-10-12", closer: "lab-bot" }) };

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${r.stderr}`);
  return r.stdout.trim();
}
function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}
function repository(root, name, files, folder) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Seed");
  git(seed, "config", "user.email", "seed@example.org");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  mkdirSync(join(folder, ".."), { recursive: true });
  git(root, "clone", "-q", origin, folder);
  git(folder, "config", "user.name", "Alice Agent M token");
  git(folder, "config", "user.email", "alice@example.org");
  return origin;
}
async function withWorkspace(sprints, run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-schedule-"));
  const workspace = join(root, "ws");
  try {
    repository(root, "instance", { "README.md": "# Instance\n", "SPEC.md": "# Spec\n", "docs/participants.md": PARTICIPANTS }, join(workspace, "instance"));
    const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
    const workflow = Object.fromEntries(jobWorkflowFiles("github", { repository: "alice/agent-m", commit: agentM.commit }, { token: "AGENT_M_TOKEN", keys: ["FIXTURE_KEY"] }, ["lab-pc"]).map((file) => [file.path, file.text]));
    const product = repository(root, "product", { "README.md": "# Thesis tool\n", "docs/process.md": declaration(agentM.commit), "docs/backlog/ITM-001-a.md": item("ITM-001"), ...workflow, ...sprints }, join(workspace, "product"));
    return await run({ root, workspace, head: git(join(workspace, "product"), "rev-parse", "HEAD"), productDir: join(workspace, "product"), product });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const onSchedule = (w, { token = TOKEN, runner = "hosted" } = {}) => runEntry("onSchedule", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "schedule", GITHUB_WORKSPACE: w.workspace,
  GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4712", GITHUB_ACTOR: "alice",
  AGENT_M_RUNNER: runner, AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", ...(token ? { AGENT_M_TOKEN: token } : {}), FIXTURE_KEY: KEY }, { now: NOW });
const pull = (w) => git(w.productDir, "pull", "-q", "--ff-only", "origin", "main");
const jobFiles = (w) => { pull(w); return git(w.productDir, "ls-tree", "-r", "--name-only", "HEAD", "docs/jobs/").split("\n").filter(Boolean); };
const fileAt = (w, path) => git(w.productDir, "show", `HEAD:${path}`);
const commits = (w) => { pull(w); return Number(git(w.productDir, "rev-list", "--count", `${w.head}..HEAD`)); };

// TST-1032101 · level: unit · module: MOD-workflow-entries
// guards: A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF; CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
// given: the sprint team1/01, ended on 2026-10-12, closed by the CI agent ci-bot; team1/02, ended and closed already; team1/03, ended, closed by the person alice; team1/04, whose time box ends 2026-11-30; team1/06, ended, whose closer ghost is no participant; today is 2026-10-19
// input: onSchedule
// expect: outcome `done`; one new commit adds exactly one job record, of the kind close-sprint, for the participant ci-bot and its model fixture-llm, on the route `any`, started by the schedule, working on ITM-001, the item the sprint selects, with the parameter sprint team1/01, queued (not taken); the sprints closed already, closed by a person and not ended get none
// Planted fault: naming sprints without testing the closer, or ignoring `## Review`, adds records for team1/02 or team1/03; leaving the time box out adds one for team1/04.
test("onSchedule — a sprint whose time box ended and whose closer is a CI agent gets one queued close-sprint job; closed, person-closed and running sprints get none", async () => {
  await withWorkspace(SPRINTS, async (w) => {
    const status = await onSchedule(w);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(commits(w), 1);
    const files = jobFiles(w);
    assert.equal(files.length, 1);
    const record = fileAt(w, files[0]);
    for (const line of ["kind: close-sprint", "participant: ci-bot", "model: fixture-llm", "route: any", "started_by: schedule", "  - ITM-001"]) assert.ok(record.includes(line), `the record holds "${line}"`);
    assert.ok(/"sprint":\s*"team1\/01"/.test(record), "the parameter sprint names the sprint");
    assert.ok(!record.includes("## Taken"), "the job is queued, not taken");
    for (const other of ["team1/02", "team1/03", "team1/04", "team1/06"]) assert.ok(!record.includes(other), other);
  });
});

// TST-1032102 · level: unit · module: MOD-workflow-entries
// guards: A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
// given: the same product after one onSchedule; then the job taken (running); then the job ended (done) with the sprint still without a review
// input: onSchedule again, in each of the three states
// expect: while the close is queued, and while it is taken, `nothing to do` and no new commit — no second close of the same sprint; after it ended without closing the sprint, a new close is queued
// Planted fault: not looking at the job records queues a second close on every run.
test("onSchedule — a close that is already queued or running is not queued again; one that ended without closing the sprint is", async () => {
  await withWorkspace(SPRINTS, async (w) => {
    assert.equal((await onSchedule(w)).outcome, "done");
    const [path] = jobFiles(w);
    const queued = await onSchedule(w);
    assert.equal(queued.outcome, "nothing to do", queued.summary);
    assert.equal(commits(w), 1);
    const taken = appendToRecord(fileAt(w, path), { part: "taken", at: new Date("2026-10-19T06:05:00Z"), by: "https://github.com/alice/thesis-tool/actions/runs/1" });
    writeFileSync(join(w.productDir, path), taken);
    git(w.productDir, "add", "-A"); git(w.productDir, "commit", "-q", "-m", "take"); git(w.productDir, "push", "-q", "origin", "HEAD:main");
    assert.equal((await onSchedule(w)).outcome, "nothing to do");
    assert.equal(jobFiles(w).length, 1);
    const ended = appendToRecord(taken, { part: "end", at: new Date("2026-10-19T06:30:00Z"), state: "failed", reason: "x", results: [], draft: null, rounds: [], usage: null, cost: null, log: null });
    writeFileSync(join(w.productDir, path), ended);
    git(w.productDir, "add", "-A"); git(w.productDir, "commit", "-q", "-m", "end"); git(w.productDir, "push", "-q", "origin", "HEAD:main");
    assert.equal((await onSchedule(w)).outcome, "done");
    assert.equal(jobFiles(w).length, 2);
  });
});

// TST-1032103 · level: unit · module: MOD-workflow-entries
// guards: A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
// given: team1/01 closed by ci-bot, an agent of fixture-llm, and team2/01, ended, closed by lab-bot, an agent of lab-llm
// input: onSchedule
// expect: two new job records, each for its closer and its closer's model, both on the route `any`: whatever offers the model takes it, whether CI offers it or not
// Planted fault: queueing the close for the route a CI agent offers leaves lab-bot, whose model no coding agent on CI offers, without a close.
test("onSchedule — each close is queued for its agent's model on the route any", async () => {
  await withWorkspace({ ...SPRINTS, ...LAB_SPRINT }, async (w) => {
    assert.equal((await onSchedule(w)).outcome, "done");
    const records = jobFiles(w).map((path) => fileAt(w, path));
    assert.equal(records.length, 2);
    const field = (participant, name) => new RegExp(`${name}: (.+)`).exec(records.find((record) => record.includes(`participant: ${participant}`)) ?? "")?.[1];
    assert.deepEqual([field("ci-bot", "route"), field("lab-bot", "route")], ["any", "any"]);
    assert.deepEqual([field("ci-bot", "model"), field("lab-bot", "model")], ["fixture-llm", "lab-llm"]);
  });
});

// TST-1032104 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the same product; the person's Agent M token is not passed to the entry
// input: onSchedule
// expect: outcome `not run`, the summary names the missing token and that nothing was written; no commit is made
// Planted fault: writing the record without the token's check makes a commit.
test("onSchedule — without the person's token the entry ends not run before it writes", async () => {
  await withWorkspace(SPRINTS, async (w) => {
    const status = await onSchedule(w, { token: null });
    assert.equal(status.outcome, "not run");
    assert.match(status.summary, /AGENT_M_TOKEN is missing/);
    assert.equal(commits(w), 0);
  });
});

// The coding agents on CI the job workflow declares (AGENT_M_CI_AGENTS): dev-ci, an agent that is not installed on the runner, offers fixture-llm on the server's runners.
const CI_AGENTS = JSON.stringify([{ name: "dev-ci", agent: "absent-agent", runner: "hosted", secret: "FIXTURE_KEY", place: "Anthropic, USA",
  capabilities: ["draft text", "read the repository", "write to the repository"], models: [{ model: "fixture-llm", context: 200000 }] }]);
const onRecordsChanged = (w, runner = "hosted") => runEntry("onRecordsChanged", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: w.workspace,
  GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4713", GITHUB_ACTOR: "alice",
  AGENT_M_RUNNER: runner, AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN, FIXTURE_KEY: KEY,
  AGENT_M_CI_AGENTS: CI_AGENTS }, { now: NOW });

// TST-20261109306 · level: unit · module: MOD-workflow-entries
// guards: A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL; UC-041
// given: the close of team1/01 queued by onSchedule on the route `any` for ci-bot's model fixture-llm, and the close of team2/01 for lab-bot's lab-llm; the job workflow declares the coding agent on CI dev-ci, offering fixture-llm on the server's runners
// input: onRecordsChanged on the self-hosted runner lab-pc, then on the server's runners
// expect: on lab-pc no job is taken — no coding agent on CI there offers either model —; on the server's runners the close of ci-bot is taken, its `## Taken` naming the connection `ci hosted agent absent-agent secret FIXTURE_KEY` and what it declares for fixture-llm, and it ends failed — the fixture has neither the agent nor a server —; lab-bot's close stays queued
test("onRecordsChanged — a coding agent on CI takes the close queued on the route any for the model it offers on its runner", async () => {
  await withWorkspace({ ...SPRINTS, ...LAB_SPRINT }, async (w) => {
    assert.equal((await onSchedule(w)).outcome, "done");
    const paths = jobFiles(w);
    const pathOf = (participant) => paths.find((path) => fileAt(w, path).includes(`participant: ${participant}`));
    const elsewhere = await onRecordsChanged(w, "lab-pc");
    assert.equal(elsewhere.outcome, "nothing to do", elsewhere.summary);
    assert.ok(!fileAt(w, pathOf("ci-bot")).includes("## Taken"), "known negative: no coding agent on lab-pc");
    const status = await onRecordsChanged(w);
    pull(w);
    const taken = fileAt(w, pathOf("ci-bot"));
    assert.match(taken, /## Taken[^]*connection: ci hosted agent absent-agent secret FIXTURE_KEY/);
    assert.match(taken, /declares: \{"context":200000,"capabilities":\["draft text","read the repository","write to the repository"\]\}/);
    assert.match(taken, /## Taken[^]*## End[^]*state: failed/);
    assert.equal(status.outcome, "failed", status.summary);
    assert.ok(!fileAt(w, pathOf("lab-bot")).includes("## Taken"), "lab-bot's close stays queued");
  });
});
