// MOD-workflow-entries' entries onRecordsChanged and onDispatch, which take and run a job in a product's job workflow (ITM-365), as the
// accepted text of docs/architecture/MOD-workflow-entries.md states them: "onRecordsChanged(env) — on a push to docs/jobs/ or docs/gates/
// of a product: takes each queued job whose route is this CI service and runs it from its record alone — its kind, the parameters of its
// `## Parameters` and its pinned inputs —, with the driver of its participant, a coding-agent process or a model endpoint, the participant's
// key from its secret, appending its records. No person attends a job in CI: its kind's writer writes at once … A job whose writer
// committed nothing, since its result equals the current files, ends done, and its end record and the entry's summary say `no change`
// (UC-010 4a)"; "onDispatch(env) — on a run started from the CI service's own page with the inputs the dashboard named (UC-024): writes
// the job's start record, those inputs its parameters, and runs it as onRecordsChanged runs a job"; "A secret that is missing ends the entry
// at once with a status that names it, before anything is written (UC-010)"; Data: "In a product, … the person's Agent M token … and each
// CI participant's key". For UC-010 steps 1 to 4, 3a, 4a.
// Run: node --test tests/workflow-entries-job-workflow.test.mjs
//
// Module: MOD-workflow-entries
// Guards: UC-010; ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CI AGENT'S DRAFT ENTERS AS OPEN; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; NO SECRET IN THE REPOSITORY
// Level: unit
//
// Deterministic, no network: the product and the instance are temporary git repositories — each a bare origin, the clone the workflow's
// checkout stands for, and a seed clone —, laid out as the job workflow lays them out: the workspace holds `product/` and `instance/`. The
// model endpoint is a fake `fetch` that answers as an OpenAI-compatible endpoint does and records every request. The kind is MOD-job-catalogue's
// `decide-gate`, whose recipe and writer the module's own strategies do not give yet: the tests register a recipe `gate-inputs` and a writer
// `gate-record` of their own, with the runner's registry, which the entry fills with the strategies of the modules that offer them. The
// product, the instance and the participant are the small ones this file holds. Where the module file leaves a reading open, the test states
// the one it takes, and the pull request names it:
//   - The names the entry reads are those of the job workflow's template (src/runtimes/workflow/github.yml, MOD-runtimes' jobWorkflowFiles):
//     AGENT_M_RUNNER (the route's runner, `hosted` or a label), AGENT_M_PRODUCT_DIR (the product's checkout), AGENT_M_TOKEN_NAME (the name of
//     the secret that holds the person's token), AGENT_M_TOKEN (its value), AGENT_M_KEY_NAMES (the names of the key secrets, separated by
//     blanks) and each key secret by its own name; and GitHub's own: GITHUB_WORKSPACE, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_REF_NAME,
//     GITHUB_SHA, GITHUB_RUN_ID, GITHUB_ACTOR, GITHUB_EVENT_NAME, GITHUB_EVENT_PATH. The instance's checkout is `instance/` of the workspace.
//   - This CI service's route is `ci hosted` for the runner `hosted` and `ci runner:<label>` for a label, as MOD-job-ledger writes a record's
//     route. A queued job is one MOD-job-ledger's jobState calls so; jobs are taken oldest first. `Taken` names the run's address.
//   - A CI participant's route is `ci hosted secret <NAME>` or `ci runner:<label> secret <NAME>` (MOD-participant-list, Data): its key is the
//     value of the variable NAME. A job whose participant's key is missing ends the whole entry, before any job is taken.
//   - A job's endpoint is given by its record: the parameter `endpoint` — `{ name, kind, baseUrl, model }` — whose key is the participant's
//     secret; a parameter `agent` names a supported coding agent instead. The module file says where CI gets an endpoint's settings; the
//     record's parameters are the only place a job carries.
//   - The End holds: the state; `results` the commits the writer made, or `no change` for an outcome without a commit; the draft of a kind
//     that hands its draft back; the rounds; the usage the endpoint reported and the run's address as `log`. The entry's status is `done` with a
//     summary that names each job and its result, `no change` among them; `failed` when a job ended failed.
//   - onDispatch takes the job's identifier from the input `job`; a record of that identifier that exists is run; else the inputs `kind`,
//     `participant`, `works_on` (identifiers separated by commas) and `parameters` (a JSON text) make its start record, written in one commit and run.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendToRecord, startRecord } from "../src/job-ledger/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const entries = await import("../src/workflow-entries/main.mjs").catch((error) => ({ error }));
const { runEntry } = entries;

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const NOW = new Date("2026-10-08T09:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";
const ENDPOINT = { name: "fixture", kind: "openai-compatible", baseUrl: "https://llm.example.test/v1", model: "fixture-llm" };
const GATE_PATH = "docs/gates/GATE-fixture.md";
const gateText = (decision, reason) => text("# Gate fixture", "", `decision: ${decision}`, `reason: ${reason}`);
const REASON = "every artifact meets the condition";

const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| ci-bot | CI agent | fixture-llm | 100000 | — | read the repository, write to the repository | GitHub's hosted runners | ci hosted secret FIXTURE_KEY |");

// The job's record names the commit of Agent M that runs — the instance's checkout is at it —, so the records are made once the instance exists.
const jobStart = (id, { agentM, route = "ci hosted", params = { endpoint: ENDPOINT } } = {}) => ({ id, kind: "decide-gate", worksOn: ["A LOAN HAS A DUE DATE"], participant: "ci-bot",
  model: "fixture-llm", route, run: null, retries: null, startedBy: "alice", start: new Date("2026-10-08T08:00:00Z"), agentM, inputs: [], limit: 2,
  destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: ["gate-inputs"] }], params });
const JOB = "JOB-20261008-0800-a1b2", OTHER_RUNNER_JOB = "JOB-20261008-0801-c3d4", TAKEN_JOB = "JOB-20261008-0802-e5f6";
const recordFile = (start) => { const { path, text: body } = startRecord(start); return [path, body]; };
// A record another runner took already: it is no queued job.
const takenFile = (start) => { const [path, body] = recordFile(start); return [path, appendToRecord(body, { part: "taken", at: new Date("2026-10-08T08:30:00Z"), by: "https://github.com/alice/thesis-tool/actions/runs/1" })]; };

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
// A bare origin whose `main` holds `files`, and the clone of it the workflow checks out into `folder`. -> the origin's folder.
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
// The workspace of a job workflow: product/ and instance/, the product holding the records given.
async function withWorkspace({ records = () => [], extra = {} } = {}, run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-jobs-"));
  const workspace = join(root, "ws");
  try {
    const instance = repository(root, "instance", { "README.md": "# Instance\n", "docs/participants.md": PARTICIPANTS }, join(workspace, "instance"));
    const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
    const product = repository(root, "product", { "README.md": "# Thesis tool\n", ...Object.fromEntries(records(agentM)), ...extra }, join(workspace, "product"));
    return await run({ root, workspace, product, instance, agentM, head: git(join(workspace, "product"), "rev-parse", "HEAD"), productDir: join(workspace, "product") });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
// What the job workflow's job gives the entry (src/runtimes/workflow/github.yml), with the secrets it filled.
const environment = (w, extra = {}) => ({ GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: w.workspace, GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice",
  AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: w.productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN,
  FIXTURE_KEY: KEY, ...extra });
const headOf = (w) => git(w.product, "rev-parse", "main");
const subjects = (w) => git(w.product, "log", "--format=%s", "main").split("\n");
const fileAt = (w, path) => git(w.product, "show", `main:${path}`).concat("\n");

// The fake model endpoint: answers as an OpenAI-compatible one does and records every request.
function fakeEndpoint({ reason = REASON } = {}) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), method: init.method, headers: init.headers ?? {}, body: init.body ?? "" });
    const content = JSON.stringify({ draft: { decision: "passed", reason }, answers: [] });
    return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 120, completion_tokens: 30 } }), { status: 200 });
  };
  return requests;
}

// The strategies this file gives the runner for decide-gate: its recipe, which keeps the context it was given, and its writer, which commits the
// gate's record through the product's host on the head it reads — or commits nothing where the record stands already.
let seen = null;
registerStrategies("tests/workflow-entries-job-workflow.test.mjs", {
  recipes: { "gate-inputs": async (context) => { seen = context; return [{ name: "gate-inputs", text: "gate fixture checks docs/a.md", size: 0, sources: [], required: true }]; } },
  writers: { "gate-record": async (result, context) => {
    const host = context.product.host, head = await host.readSnapshot("HEAD"), body = gateText(result.draft.decision, result.draft.reason);
    if ((await head.read(GATE_PATH)) === body) return { commits: [], files: [], pullRequest: null, shown: null, notes: [] };
    const { commit } = await host.commitFiles({ branch: "main", expectedHead: head.commit, files: [{ path: GATE_PATH, text: body }], message: "gate fixture decided" });
    return { commits: [commit], files: [GATE_PATH], pullRequest: null, shown: null, notes: [] };
  } },
});
const run = (w, extra) => { assert.ok(runEntry, `runEntry: ${entries.error?.message}`); return runEntry("onRecordsChanged", environment(w, extra), { now: NOW }); };

// ---------------------------------------------------------------- a queued job, taken and run

// guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; A CI AGENT'S DRAFT ENTERS AS OPEN; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a product whose `main` holds a queued job of the route `ci hosted`, another of the route `ci runner:lab` and one a runner took already, an instance holding the
//        participant ci-bot, a fixture endpoint, and the job workflow's environment for the hosted runner with the person's token and the key
// input: onRecordsChanged
// expect: outcome `done`, the summary naming the job; on the origin's main in order: the commit that takes the job, the writer's commit — the
//         gate's record, open —, and the commit that ends it; the record names the run's address as the route that took it, ends `done` with the
//         writer's commit as its result, the usage the endpoint reported and the run's address as its log; the other job is not taken; the
//         one taken already is left as it is; everything committed on main, no other branch; the endpoint asked once, at its address, with the
//         key in its authorisation header
test("onRecordsChanged — a queued job of this route is taken and run: its writer's commit and its end appended", async () => {
  const requests = fakeEndpoint();
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM })), recordFile(jobStart(OTHER_RUNNER_JOB, { agentM, route: "ci runner:lab" })),
    takenFile(jobStart(TAKEN_JOB, { agentM }))] }, async (w) => {
    const taken = fileAt(w, `docs/jobs/${TAKEN_JOB}.md`);
    const status = await run(w);
    assert.equal(status.outcome, "done");
    assert.match(status.summary, new RegExp(JOB));
    assert.deepEqual(subjects(w).slice(0, 3), [`end ${JOB}: done`, "gate fixture decided", `take ${JOB} (https://github.com/alice/thesis-tool/actions/runs/4711)`]);
    assert.equal(fileAt(w, GATE_PATH), gateText("passed", REASON));
    const record = fileAt(w, `docs/jobs/${JOB}.md`);
    assert.match(record, /## Taken[^]*by: https:\/\/github\.com\/alice\/thesis-tool\/actions\/runs\/4711/);
    assert.match(record, /## End[^]*state: done/);
    const writerCommit = git(w.product, "log", "-1", "--format=%H", "--grep=gate fixture decided", "main");
    assert.ok(record.includes(writerCommit), "the writer's commit is the End's result");
    assert.match(record, /log: https:\/\/github\.com\/alice\/thesis-tool\/actions\/runs\/4711/);
    assert.match(record, /120/);
    assert.ok(!fileAt(w, `docs/jobs/${OTHER_RUNNER_JOB}.md`).includes("## Taken"), "the job of another route is not taken");
    assert.equal(fileAt(w, `docs/jobs/${TAKEN_JOB}.md`), taken, "a job taken already is left as it is");
    assert.equal(git(w.product, "branch", "--list").replace(/[* ]/g, ""), "main", "everything is committed on the branch the workflow runs for");
    assert.equal(requests.length, 1, "the endpoint was asked once");
    assert.equal(requests[0].address, "https://llm.example.test/v1/chat/completions");
    assert.equal(requests[0].headers.Authorization, `Bearer ${KEY}`);
  });
});

// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a product with a queued job of the route `ci hosted` and another of the route `ci runner:lab`, and the job workflow's environment of the
//        self-hosted runner `lab`
// input: onRecordsChanged
// expect: the job of the route `ci runner:lab` is taken and run; the job of `ci hosted` is left as it is
test("onRecordsChanged — a self-hosted runner takes the jobs of its own label", async () => {
  fakeEndpoint();
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM })), recordFile(jobStart(OTHER_RUNNER_JOB, { agentM, route: "ci runner:lab" }))] }, async (w) => {
    const hosted = fileAt(w, `docs/jobs/${JOB}.md`);
    const status = await run(w, { AGENT_M_RUNNER: "lab" });
    assert.equal(status.outcome, "done");
    assert.match(fileAt(w, `docs/jobs/${OTHER_RUNNER_JOB}.md`), /## End[^]*state: done/);
    assert.equal(fileAt(w, `docs/jobs/${JOB}.md`), hosted);
  });
});

// ---------------------------------------------------------------- a missing secret

// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; NO SECRET IN THE REPOSITORY
// given: the product with a queued job, and the environment without the participant's key; and without the person's token
// input: onRecordsChanged for each; and, as the known positive, with both
// expect: outcome `not run` each time, the summary naming the secret — FIXTURE_KEY, then AGENT_M_TOKEN — before anything is written: the
//         origin's main as it was, the job not taken, the endpoint not asked; with both the job is run
test("onRecordsChanged — a missing secret ends the entry not run, naming it, with nothing written", async () => {
  const requests = fakeEndpoint();
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))] }, async (w) => {
    for (const [missing, name] of [["FIXTURE_KEY", "FIXTURE_KEY"], ["AGENT_M_TOKEN", "AGENT_M_TOKEN"]]) {
      const status = await run(w, { [missing]: undefined });
      assert.equal(status.outcome, "not run", missing);
      assert.match(status.summary, new RegExp(name), missing);
      assert.equal(headOf(w), w.head, `${missing}: the origin is as it was`);
      assert.equal(git(w.productDir, "status", "--porcelain"), "", `${missing}: the checkout is clean`);
      assert.equal(requests.length, 0, `${missing}: the endpoint is not asked`);
    }
    assert.equal((await run(w)).outcome, "done", "known positive: with both secrets the job is run");
    assert.equal(requests.length, 1);
  });
});

// ---------------------------------------------------------------- the context

// guards: ONE DEFINITION, THREE DRIVERS; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: the product with a queued job and the workspace of the job workflow
// input: onRecordsChanged; the recipe of the kind keeps the context the entry gives the runner
// expect: the context names the product's address, the instance's checkout — the workspace's instance/ folder — with a snapshot read from it
//         that holds the participants' register, the job's identifier, the person who started it, Agent M's version and commit as the record
//         names them, and the participants the register lists
test("onRecordsChanged — the job's context names the instance's checkout", async () => {
  fakeEndpoint();
  seen = null;
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))] }, async (w) => {
    await run(w);
    assert.ok(seen, "the recipe was given a context");
    assert.equal(seen.instance.checkout, join(w.workspace, "instance"));
    assert.equal(await seen.instance.snapshot.read("docs/participants.md"), PARTICIPANTS);
    assert.equal(seen.product.address, "https://github.com/alice/thesis-tool");
    assert.equal(seen.jobId, JOB);
    assert.equal(seen.person, "alice");
    assert.deepEqual(seen.agentM, w.agentM);
    assert.deepEqual(seen.participants.map((participant) => participant.name), ["ci-bot"]);
  });
});

// ---------------------------------------------------------------- no change

// guards: A CI AGENT'S DRAFT ENTERS AS OPEN; UC-010 4a
// given: the product already holds the gate's record exactly as the writer would write it, and a queued job
// input: onRecordsChanged
// expect: outcome `done`; no commit of the writer; the job taken and ended `done` with the result `no change`; the summary says `no change`
test("onRecordsChanged — a result equal to the current files ends done with no change", async () => {
  fakeEndpoint();
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))], extra: { [GATE_PATH]: gateText("passed", REASON) } }, async (w) => {
    const status = await run(w);
    assert.equal(status.outcome, "done");
    assert.match(status.summary, /no change/);
    assert.deepEqual(subjects(w).slice(0, 3), [`end ${JOB}: done`, `take ${JOB} (https://github.com/alice/thesis-tool/actions/runs/4711)`, "first"]);
    assert.match(fileAt(w, `docs/jobs/${JOB}.md`), /## End[^]*state: done[^]*results:[^]*no change/);
  });
});

// ---------------------------------------------------------------- a dispatched job

// guards: UC-010 step 1; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A CI AGENT'S DRAFT ENTERS AS OPEN
// given: a product with another queued job and no record of the one started, and a start from the server's own page with the inputs job, kind, participant, works_on and the parameters
// input: onDispatch, the event's payload read from the file GITHUB_EVENT_PATH names
// expect: outcome `done`; the start record committed at docs/jobs/<job>.md — route `ci hosted`, started by the actor, the inputs' parameters —,
//         then taken and run as a queued job is: the writer's commit and the End; the other queued job is left as it is
test("onDispatch — a dispatched job is started and run", async () => {
  fakeEndpoint();
  const id = "JOB-20261008-0900-d1e2";
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))] }, async (w) => {
    const payload = join(w.root, "event.json");
    const queued = fileAt(w, `docs/jobs/${JOB}.md`);
    writeFileSync(payload, JSON.stringify({ inputs: { job: id, kind: "decide-gate", participant: "ci-bot", works_on: "A LOAN HAS A DUE DATE", parameters: JSON.stringify({ endpoint: ENDPOINT }) } }));
    assert.ok(runEntry, `runEntry: ${entries.error?.message}`);
    const status = await runEntry("onDispatch", environment(w, { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: payload }), { now: NOW });
    assert.equal(status.outcome, "done");
    const log = subjects(w);
    assert.ok(log[0].startsWith(`end ${id}`) && log[1] === "gate fixture decided" && log[2].startsWith(`take ${id}`) && log[3].includes(id), log.join(" | "));
    const record = fileAt(w, `docs/jobs/${id}.md`);
    assert.match(record, /kind: decide-gate/);
    assert.match(record, /route: ci hosted/);
    assert.match(record, /started_by: alice/);
    assert.match(record, /baseUrl/);
    assert.match(record, /## End[^]*state: done/);
    assert.equal(fileAt(w, GATE_PATH), gateText("passed", REASON));
    assert.equal(fileAt(w, `docs/jobs/${JOB}.md`), queued, "another queued job is left as it is");
  });
});

// ---------------------------------------------------------------- no secret in any commit

// guards: NO SECRET IN THE REPOSITORY; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the job run as in the first test; and a job whose endpoint, a leaky one, quotes the key it was given in the reason of its decision
// input: onRecordsChanged for each; every commit of the product's origin searched for the person's token and the key
// expect: in neither run does a commit hold either; in the second the writer's commit is refused — nothing of the decision is written — and the
//         job ends `failed`, the status `failed`
test("onRecordsChanged — no secret value in any commit", async () => {
  const holdsSecret = (w) => [TOKEN, KEY].some((secret) => git(w.product, "log", "-p", "--all").includes(secret));
  fakeEndpoint();
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))] }, async (w) => {
    assert.equal((await run(w)).outcome, "done");
    assert.equal(holdsSecret(w), false, "a normal run");
  });
  fakeEndpoint({ reason: `authorised with ${KEY}` });
  await withWorkspace({ records: (agentM) => [recordFile(jobStart(JOB, { agentM }))] }, async (w) => {
    const status = await run(w);
    assert.equal(status.outcome, "failed");
    assert.equal(holdsSecret(w), false, "a leaky endpoint");
    assert.throws(() => fileAt(w, GATE_PATH), /does not exist|exists on disk, but not/, "nothing of the decision is written");
    assert.match(fileAt(w, `docs/jobs/${JOB}.md`), /## End[^]*state: failed/);
  });
});
