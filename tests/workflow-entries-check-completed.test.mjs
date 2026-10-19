// MOD-workflow-entries' entry onCheckCompleted (ITM-792), as the accepted text of docs/architecture/MOD-workflow-entries.md states it: "onCheckCompleted — on a
// completed CI check that a gate of the product's workflow names as its decider: the gate's record — decided by that check, passed or not, on which commit
// (`A GATE NAMES WHO DECIDES IT`, `THE GATE IS RECORDED`) —, written through Process's `recordGateDecision`, whose push resumes the waiting job"; UC-034 step 7.
// Run: node --test tests/workflow-entries-check-completed.test.mjs
//
// Module: MOD-workflow-entries
// Guards: A GATE NAMES WHO DECIDES IT; THE GATE IS RECORDED; UC-034
// Level: unit
//
// Deterministic, no network: the product and the instance are temporary git repositories laid out as the job workflow lays them out (the workspace holds
// `product/` and `instance/`), as tests/workflow-entries-resume-gate.test.mjs lays them out. The product declares the shipped model scrum and adds, under
// `## Gates added by requirements`, the gate A GREEN BUILD GATES THE MERGE between Development and Sprint Review, decided by `check: build`. Where the text leaves a
// reading open, the test states the one it takes, and the pull request names it:
//   - The event is GitHub's check_run, action completed: its payload holds check_run.name, .status, .conclusion and .head_sha. The check's name is the name after `check:`.
//   - The decision is `passed` for the conclusion `success`, else `rejected` with the reason "the check <name> concluded <conclusion>". `on` is the check's commit.
//   - The record's `job` is the job waiting at that gate, else empty. The record's `role` is `check`. A check that is not completed decides nothing.
//   - A gate that is passed already is not decided again by the same check on the same commit.
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendToRecord, startRecord } from "../src/job-ledger/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const NOW = new Date("2026-10-08T09:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";
const GATE = "A GREEN BUILD GATES THE MERGE";
const SHA = "0123456789abcdef0123456789abcdef01234567";
const JOB = "JOB-20261008-0800-a1b2";

const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| ci-bot | CI agent | fixture-llm | 100000 | — | read the repository, write to the repository | GitHub's hosted runners | ci hosted secret FIXTURE_KEY |");
const SPEC = text("# Spec", "", `**${GATE}** *(Product Owner)*`, "", "A merge needs a green build.", "*Check:* no automatic check; at review.");
const declaration = (version) => text("---", "model: scrum", "model_file: src/model-catalogue/models/scrum.md", `model_version: ${version}`, "---",
  "# Process", "", "## Practices", "", "- none", "", "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "| Sprint | sprint/<team>/<nn> |", "",
  "## Gates added by requirements", "", "| Requirement | Between | Artifacts | Condition | Decider |", "|---|---|---|---|---|",
  `| ${GATE} | Development → Sprint Review | the pull request | the build is green | check: build |`, "",
  "## Definition of Done", "", "The job rules hold; no condition is added.");

// A job of ci-bot that reached the added gate.
function waitingJob(agentM) {
  const { path, text: start } = startRecord({ id: JOB, kind: "decide-gate", worksOn: ["A LOAN HAS A DUE DATE"], participant: "ci-bot", model: "fixture-llm", route: "ci hosted", run: null,
    retries: null, startedBy: "alice", start: new Date("2026-10-08T08:00:00Z"), agentM, inputs: [], limit: 2,
    destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: [] }], params: {} });
  const taken = appendToRecord(start, { part: "taken", at: new Date("2026-10-08T08:30:00Z"), by: "https://github.com/alice/thesis-tool/actions/runs/1" });
  return [path, appendToRecord(taken, { part: "gate reached", at: new Date("2026-10-08T08:40:00Z"), gate: GATE, decider: "check: build" })];
}

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
async function withWorkspace(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-check-"));
  const workspace = join(root, "ws");
  try {
    repository(root, "instance", { "README.md": "# Instance\n", "SPEC.md": SPEC, "docs/participants.md": PARTICIPANTS }, join(workspace, "instance"));
    const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
    const [jobPath, jobText] = waitingJob(agentM);
    const product = repository(root, "product", { "README.md": "# Thesis tool\n", "docs/process.md": declaration(agentM.commit), [jobPath]: jobText }, join(workspace, "product"));
    return await run({ root, workspace, head: git(join(workspace, "product"), "rev-parse", "HEAD"), productDir: join(workspace, "product"), product });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
// The environment of a completed check: GitHub's check_run event with the payload in a file.
function checkRun(w, check, { token = TOKEN } = {}) {
  const payload = join(w.root, "event.json");
  writeFileSync(payload, JSON.stringify({ action: "completed", check_run: { status: "completed", head_sha: SHA, ...check } }));
  return runEntry("onCheckCompleted", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "check_run", GITHUB_EVENT_PATH: payload, GITHUB_WORKSPACE: w.workspace,
    GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice",
    AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", ...(token ? { AGENT_M_TOKEN: token } : {}), FIXTURE_KEY: KEY },
  { now: NOW });
}
const commits = (w) => Number(git(w.product, "rev-list", "--count", `${w.head}..main`));
const gateFiles = (w) => git(w.product, "ls-tree", "-r", "--name-only", "main", "docs/gates/").split("\n").filter(Boolean);
const fileAt = (w, path) => git(w.product, "show", `main:${path}`);

// ---------------------------------------------------------------- the tests

// TST-792001 · level: unit · module: MOD-workflow-entries
// guards: A GATE NAMES WHO DECIDES IT; THE GATE IS RECORDED; UC-034
// given: the gate A GREEN BUILD GATES THE MERGE decided by `check: build`, and a job waiting at it
// input: onCheckCompleted on the completed check `build`, conclusion success, on a commit
// expect: outcome `done`; one commit on main with the subject "gates: A GREEN BUILD GATES THE MERGE passed by build" adds one gate record: gate the requirement, job the waiting job, decider `check: build`, decision passed, on the check's commit
test("onCheckCompleted — a completed check that a gate names writes one gate record with its result and commit", async () => {
  await withWorkspace(async (w) => {
    const status = await checkRun(w, { name: "build", conclusion: "success" });
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(commits(w), 1);
    assert.equal(git(w.product, "log", "-1", "--format=%s", "main"), `gates: ${GATE} passed by build`);
    const files = gateFiles(w);
    assert.equal(files.length, 1);
    const record = fileAt(w, files[0]);
    for (const line of [`gate: ${GATE}`, `job: ${JOB}`, "decider: check: build", "decision: passed", `  - ${SHA}`]) assert.ok(record.includes(line), `the record holds "${line}"`);
  });
});

// TST-792002 · level: unit · module: MOD-workflow-entries
// guards: THE GATE IS RECORDED
// given: the same product
// input: onCheckCompleted on the completed check `build`, conclusion failure
// expect: one gate record, decision rejected, with a reason that names the check and its conclusion, on the check's commit
test("onCheckCompleted — a check that failed is recorded as a rejection with its reason", async () => {
  await withWorkspace(async (w) => {
    const status = await checkRun(w, { name: "build", conclusion: "failure" });
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(commits(w), 1);
    const record = fileAt(w, gateFiles(w)[0]);
    assert.ok(record.includes("decision: rejected"));
    assert.ok(record.includes("the check build concluded failure"));
    assert.ok(record.includes(`  - ${SHA}`));
  });
});

// TST-792003 · level: unit · module: MOD-workflow-entries
// guards: A GATE NAMES WHO DECIDES IT
// given: the same product, whose only gate decided by a check names `build`
// input: onCheckCompleted on the completed check `lint`, conclusion success; and on `build` that is still in progress
// expect: both `nothing to do`; no commit on main and no gate record (the counter-proof of TST-792001: a check no gate names, or one that is not completed, writes nothing)
test("onCheckCompleted — a check no gate names, or one not completed, writes nothing", async () => {
  await withWorkspace(async (w) => {
    const other = await checkRun(w, { name: "lint", conclusion: "success" });
    assert.equal(other.outcome, "nothing to do", other.summary);
    const running = await checkRun(w, { name: "build", status: "in_progress", conclusion: null });
    assert.equal(running.outcome, "nothing to do", running.summary);
    assert.equal(commits(w), 0);
    assert.deepEqual(gateFiles(w), []);
  });
});

// TST-792004 · level: unit · module: MOD-workflow-entries
// guards: THE GATE IS RECORDED
// given: the same product, but the workflow gives the entry no token to write with
// input: onCheckCompleted on the completed check `build`, conclusion success
// expect: outcome `not run`, the summary names AGENT_M_TOKEN; nothing is written
test("onCheckCompleted — without the person's token nothing is written and the status says why", async () => {
  await withWorkspace(async (w) => {
    const status = await checkRun(w, { name: "build", conclusion: "success" }, { token: null });
    assert.equal(status.outcome, "not run");
    assert.match(status.summary, /AGENT_M_TOKEN/);
    assert.equal(commits(w), 0);
  });
});
