// MOD-workflow-entries' entries onDispatch and onRecordsChanged for a job whose task travels with a conversation's hand-over (ITM-498), as the accepted text
// of docs/architecture/MOD-workflow-entries.md states them: "onRecordsChanged … takes each queued job whose route is this CI service, except one whose task
// travels with its hand-over, which `onDispatch` takes"; "onDispatch … On a run a hand-over started (UC-049 4a), whose input `job` names a queued record
// whose task travels with the hand-over: takes that job and runs it with the input `task` as its instruction — for a model endpoint, with opencode working
// with the endpoint the input `endpoint` names and the key from the participant's secret (MOD-agent-processes) —; it writes the task to no file, and a branch
// whose commit messages or pull request text hold the task's words is refused by name, the job then ending failed with nothing merged; it appends the job's
// end with its commits, files and pull request, and leaves the participant's answer in the run's summary and log … An endpoint the run cannot reach ends it
// `failed`, its summary naming the reason that MOD-endpoint-calls' `diagnoseEndpoint` gives and the routes that would work — a self-hosted runner, or a
// Bridge (UC-049 4d)." For UC-049 4a, 4d.
// Run: node --test tests/workflow-entries-hand-over.test.mjs
//
// Module: MOD-workflow-entries
// Guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; AN UNSUPPORTED ENDPOINT SAYS SO
// Level: component
//
// Deterministic, no network, no real agent: the product and the instance are temporary git repositories laid out as the job workflow lays them out (the
// fixture of tests/workflow-entries-job-workflow.test.mjs is the model, as is the agent fixture of tests/bridge-job-task-492.test.mjs): an executable named
// opencode on the PATH answers a fixed draft and appends the arguments and the OPENCODE_CONFIG_CONTENT it was started with to a file outside the repositories.
// The GitHub API, which the entry reaches for a pull request's facts, is a fake `fetch`. The kind is decide-gate, whose recipe `gate-inputs` and writer
// `gate-record` this file registers: the recipe puts the job's instruction into the prompt, the writer commits the gate's record, and where the case asks for it
// pushes a branch of its own with the commit message the case plants. Where the module file leaves a reading open, the test states the one it takes, and the
// pull request names it:
//   - The inputs are those of the job workflow's template: `job`, `task` and `endpoint` (the JSON text of { kind, baseUrl, model }), read from the event's payload.
//   - The key is the value of the variable the participant's route names after ` secret `; AGENT_M_KEY_NAMES passes it.
//   - The answer is the draft's `answer` where it is a text, else the draft as JSON; it goes to the file GITHUB_STEP_SUMMARY names and to the log.
//   - A pull request is read by the number in the address the writer returned; its text is the title and the branch it carries, its commit messages those the
//     server lists for it.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRecord } from "../src/job-ledger/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const entries = await import("../src/workflow-entries/main.mjs").catch((error) => ({ error }));
const { runEntry } = entries;
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
const REAL_SLEEP = spawnSync("sh", ["-c", "command -v sleep"], { encoding: "utf8" }).stdout.trim();

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const NOW = new Date("2026-10-16T09:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const KEY = "sk-FIXTURE-KEY-0123456789abcdef";
const TASK = "Please widen the footer of the lending page to 960 pixels, token zebra-498";
const ANSWER = "The footer is widened, token otter-498";
const ENDPOINT = { kind: "openai-compatible", baseUrl: "https://llm.example.test/v1", model: "fixture-llm" };
const GATE_PATH = "docs/gates/GATE-fixture.md";
const NO_TASK = "the task travels with its hand-over, and this run was started without it";
const JOB = "JOB-20261016-0900-a1b2", IN_RECORD = "JOB-20261016-0901-c3d4";

const PARTICIPANTS = text("# Participants of this instance", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| hand-bot | Model endpoint | fixture-llm | 100000 | — | draft text, read the repository | GitHub's hosted runners | endpoint fixture secret FIXTURE_KEY |",
  "| ci-bot | CI agent | fixture-llm | 100000 | — | read the repository, write to the repository | GitHub's hosted runners | ci hosted secret FIXTURE_KEY |");

// The job's record names the commit of Agent M that runs — the instance's checkout is at it —, so the records are made once the instance exists.
const jobStart = (id, { agentM, participant = "hand-bot", task = "with the hand-over", params = {} }) => ({ id, kind: "decide-gate", worksOn: ["A LOAN HAS A DUE DATE"], participant,
  model: "fixture-llm", route: "ci hosted", run: null, retries: null, startedBy: "alice", start: new Date("2026-10-16T08:00:00Z"), agentM, inputs: [], limit: 2, task,
  destinations: [{ participant, place: "GitHub's hosted runners", parts: ["gate-inputs"] }], params });

function git(cwd, ...args) {
  const r = spawnSync(REAL_GIT, args, { cwd, encoding: "utf8" });
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
const script = (bin, name, body) => writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });

// The strategies this file gives the runner for decide-gate. The recipe puts the job's instruction into the prompt. The writer commits the gate's record through
// the product's host — or, where `plan.pullRequest` is set, as an agent would: on a branch of its own, with a commit message that holds the task when `plan.plant`
// says so, and returns the address of a pull request.
let plan = { pullRequest: false, plant: null };
let pushed = null;
registerStrategies("tests/workflow-entries-hand-over.test.mjs", {
  recipes: { "gate-inputs": async (context) => [{ name: "gate-inputs", text: `gate fixture checks docs/a.md. ${context.params.instruction ?? ""}`, size: 0, sources: [], required: true }] },
  writers: { "gate-record": async (result, context) => {
    const body = text("# Gate fixture", "", `decision: ${result.draft.decision}`, `reason: ${result.draft.reason}`);
    if (!plan.pullRequest) {
      const host = context.product.host, head = await host.readSnapshot("HEAD");
      const { commit } = await host.commitFiles({ branch: "main", expectedHead: head.commit, files: [{ path: GATE_PATH, text: body }], message: "gate fixture decided" });
      return { commits: [commit], files: [GATE_PATH], pullRequest: null, shown: null, notes: [] };
    }
    // As an agent does: its own commit on its own branch, pushed from the checkout without moving the checkout's head.
    const dir = plan.dir, branch = `agent-m/${context.jobId}`;
    const blob = spawnSync(REAL_GIT, ["hash-object", "-w", "--stdin"], { cwd: dir, input: body, encoding: "utf8" }).stdout.trim();
    const index = join(dir, ".git", "fixture-index");
    spawnSync(REAL_GIT, ["read-tree", "HEAD"], { cwd: dir, env: { ...process.env, GIT_INDEX_FILE: index } });
    spawnSync(REAL_GIT, ["update-index", "--add", "--cacheinfo", `100644,${blob},${GATE_PATH}`], { cwd: dir, env: { ...process.env, GIT_INDEX_FILE: index } });
    const tree = spawnSync(REAL_GIT, ["write-tree"], { cwd: dir, env: { ...process.env, GIT_INDEX_FILE: index }, encoding: "utf8" }).stdout.trim();
    const message = plan.plant === "message" ? `gate fixture decided: ${context.params.instruction}` : "gate fixture decided";
    const commit = git(dir, "commit-tree", tree, "-p", "HEAD", "-m", message);
    git(dir, "push", "-q", "origin", `${commit}:refs/heads/${branch}`);
    pushed = { branch, commit, message, title: plan.plant === "title" ? `Gate fixture: ${context.params.instruction}` : "Gate fixture" };
    return { commits: [commit], files: [GATE_PATH], pullRequest: "https://github.com/alice/thesis-tool/pull/7", shown: null, notes: [] };
  } },
});

// The fake GitHub API: the pull request 7 of the product as `pushed` describes it, with no checks, files or reviews.
function fakeGitHub() {
  const requests = [];
  const json = (value) => new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (address) => {
    const path = new URL(String(address)).pathname.replace("/repos/alice/thesis-tool", "");
    requests.push(path);
    if (path === "/pulls/7") return json({ number: 7, title: pushed.title, head: { ref: pushed.branch, sha: pushed.commit }, base: { ref: "main", sha: "0".repeat(40) }, state: "open",
      merged_at: null, draft: false, html_url: "https://github.com/alice/thesis-tool/pull/7", created_at: "2026-10-16T09:00:00Z", closed_at: null });
    if (path === "/pulls/7/commits") return json([{ sha: pushed.commit, commit: { message: pushed.message, committer: { date: "2026-10-16T09:00:00Z" } }, parents: [] }]);
    if (path.endsWith("/check-runs")) return json({ check_runs: [] });
    if (/\/commits\/[0-9a-f]+$/.test(path)) return json({ files: [] });
    return json([]);
  };
  return requests;
}

// The fake model endpoint of the existing path (a job whose record names its endpoint): answers as an OpenAI-compatible one does and records every request.
function fakeEndpoint() {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), headers: init.headers ?? {} });
    const content = JSON.stringify({ draft: { decision: "passed", reason: "from the record" }, answers: [] });
    return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 120, completion_tokens: 30 } }), { status: 200 });
  };
  return requests;
}

// The computer of the workflow: the PATH holds git, sleep and the fixture agent opencode, which answers `agent`: "ok" (the fixed draft) or "unreachable"
// (it says on its error output what it was started with and that it could not connect, and ends with 1). `records` are the queued records of the product.
async function world({ records = [], agent = "ok", probe = refuse }, run) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-ITM-498-")));
  const workspace = join(root, "ws"), bin = join(root, "bin"), calls = join(root, "calls"), summary = join(root, "summary.md");
  mkdirSync(bin);
  writeFileSync(calls, "");
  script(bin, "git", `exec ${REAL_GIT} "$@"`);
  script(bin, "sleep", `exec ${REAL_SLEEP} "$@"`);
  const event = JSON.stringify({ type: "text", part: { text: JSON.stringify({ draft: { decision: "passed", reason: ANSWER }, answers: [] }) } });
  script(bin, "opencode", `case "$1" in --version) echo 1.4.0;; auth) echo '1 credentials';;
run) printf 'RUN %s\\n' "$*" >> ${calls}
printf 'CONFIG %s\\n' "$OPENCODE_CONFIG_CONTENT" >> ${calls}
${agent === "ok" ? `printf '%s\\n' '${event}' '{"type":"step_finish","part":{"tokens":{"input":11,"output":7}}}'`
  : agent === "failed" ? `printf 'agent started with: %s\\nagent stopped: internal error 17\\n' "$*" >&2; exit 1`
  : `printf 'agent started with: %s\\nfetch failed: connect ECONNREFUSED 10.0.0.5:8080 while asking: %s\\n' "$*" '${TASK}' >&2; exit 1`};; esac`);
  const instance = repository(root, "instance", { "README.md": "# Instance\n", "docs/participants.md": PARTICIPANTS }, join(workspace, "instance"));
  const agentM = { version: "2026.10.0", commit: git(join(workspace, "instance"), "rev-parse", "HEAD") };
  const files = Object.fromEntries(records.map((start) => { const { path, text: body } = startRecord(jobStart(start.id, { ...start, agentM })); return [path, body]; }));
  const product = repository(root, "product", { "README.md": "# Thesis tool\n", ...files }, join(workspace, "product"));
  const productDir = join(workspace, "product");
  const head = git(productDir, "rev-parse", "HEAD");
  plan = { pullRequest: false, plant: null, dir: productDir };
  pushed = null;
  const lines = [];
  const writers = [process.stdout, process.stderr].map((stream) => [stream, stream.write]);
  for (const [stream, write] of writers) stream.write = (chunk, ...rest) => { lines.push(String(chunk)); return write.call(stream, chunk, ...rest); };
  const saved = { PATH: process.env.PATH, CI: process.env.CI, FIXTURE_KEY: process.env.FIXTURE_KEY, fetch: globalThis.fetch };
  Object.assign(process.env, { PATH: bin, CI: "true", FIXTURE_KEY: KEY });
  const dir = ["--git-dir", product];
  // Every request the entry makes reaches this spy and nothing else: `probe` answers or refuses it, and no request leaves the machine.
  const probes = [];
  globalThis.fetch = async (address, init = {}) => {
    const request = { address: String(address), headers: init.headers ?? {}, body: String(init.body ?? ""), answered: null };
    probes.push(request);
    return probe(request);
  };
  try {
    return await run({ root, head, productDir, product, instance, summary, probes, lines: () => lines.join("\n"), agentM,
      originText: (path, ref = "main") => spawnSync(REAL_GIT, [...dir, "show", `${ref}:${path}`], { encoding: "utf8" }).stdout,
      subjects: () => git(root, ...dir, "log", "--format=%s", "main").split("\n"),
      mainHead: () => git(root, ...dir, "rev-parse", "main"),
      mainHolds: (commit) => spawnSync(REAL_GIT, [...dir, "merge-base", "--is-ancestor", commit, "main"]).status === 0,
      // Everything the product's repository holds anywhere: every commit message, and every file at every commit of every branch.
      everything: () => git(root, ...dir, "rev-list", "--all").split("\n").filter(Boolean).map((commit) => [git(root, ...dir, "log", "-1", "--format=%B", commit),
        ...git(root, ...dir, "ls-tree", "-r", "--name-only", commit).split("\n").filter(Boolean).map((file) => git(root, ...dir, "show", `${commit}:${file}`))].join("\n")).join("\n"),
      starts: () => readFileSync(calls, "utf8").split(/^RUN /m).filter(Boolean),
      calls: () => readFileSync(calls, "utf8"),
      dispatch: (inputs, env = {}) => {
        const payload = join(root, "event.json");
        writeFileSync(payload, JSON.stringify({ inputs }));
        return runEntry("onDispatch", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: payload, GITHUB_WORKSPACE: workspace,
          GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: agentM.commit, GITHUB_RUN_ID: "4711",
          GITHUB_ACTOR: "alice", GITHUB_STEP_SUMMARY: summary, AGENT_M_RUNNER: "hosted", AGENT_M_PRODUCT_DIR: productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN",
          AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN, FIXTURE_KEY: KEY, ...env }, { now: NOW });
      },
      onRecordsChanged: () => runEntry("onRecordsChanged", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "push", GITHUB_WORKSPACE: workspace, GITHUB_SERVER_URL: "https://github.com",
        GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: agentM.commit, GITHUB_RUN_ID: "4712", GITHUB_ACTOR: "alice", AGENT_M_RUNNER: "hosted",
        AGENT_M_PRODUCT_DIR: productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_TOKEN: TOKEN, FIXTURE_KEY: KEY }, { now: NOW }),
    });
  } finally {
    for (const [stream, write] of writers) stream.write = write;
    for (const name of ["PATH", "CI", "FIXTURE_KEY"]) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
    globalThis.fetch = saved.fetch;
    rmSync(root, { recursive: true, force: true });
  }
}
// The default answer of the spy: the connection is refused, as the endpoint of TST-498006 refuses it.
const refuse = () => { throw new TypeError("fetch failed: connect ECONNREFUSED 10.0.0.5:8080"); };
// An answer of the spy: the status and JSON body of a model endpoint, recorded with the request.
const answer = (status, body) => (request) => { request.answered = JSON.stringify(body); return new Response(request.answered, { status, headers: { "content-type": "application/json" } }); };
const HAND_OVER = { id: JOB };
const INPUTS = { job: JOB, task: TASK, endpoint: JSON.stringify(ENDPOINT) };
const holdsTask = (haystack) => haystack.includes("zebra-498");

// ---------------------------------------------------------------- a hand-over run with its task

// TST-498001 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: a product whose `main` holds a queued job of kind decide-gate for the model endpoint hand-bot, route `ci hosted`, whose record says task `with the hand-over` and holds no instruction; the instance's participants list hand-bot with the route `endpoint fixture secret FIXTURE_KEY`; the fixture agent opencode on the PATH; the job workflow's environment with the person's token, the key FIXTURE_KEY and a file for GITHUB_STEP_SUMMARY
// input: onDispatch with the inputs job, task "Please widen the footer of the lending page to 960 pixels, token zebra-498" and endpoint the JSON text of { kind openai-compatible, baseUrl https://llm.example.test/v1, model fixture-llm }
// expect: outcome `done`; opencode is started once, its prompt holds the token zebra-498 once, its OPENCODE_CONFIG_CONTENT holds the baseUrl and the model and names the key by {env:FIXTURE_KEY} and holds neither the key's value nor the token zebra-498; on main in order: the commit that takes the job, the writer's commit, the commit that ends it; the record's End says `state: done`, names the writer's commit and the file as results, holds no draft; every commit message and every file at every commit of the product holds no zebra-498 — while the agent's own record of what it was started with does, which shows that the search finds the token where it is; nothing the entry printed holds zebra-498; the file GITHUB_STEP_SUMMARY names holds the answer "The footer is widened, token otter-498", and so does the log
test("TST-498001: a dispatched hand-over runs opencode with the task and the endpoint, and writes the task nowhere", async () => {
  await world({ records: [HAND_OVER] }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(w.starts().length, 1, "the agent was started once");
    assert.equal(w.starts()[0].split("zebra-498").length - 1, 1, "its prompt holds the task once");
    const config = JSON.parse(/^CONFIG (.*)$/m.exec(w.calls())[1]);
    assert.equal(config.provider["agent-m"].options.baseURL, "https://llm.example.test/v1");
    assert.equal(config.model, "agent-m/fixture-llm");
    assert.equal(config.provider["agent-m"].options.apiKey, "{env:FIXTURE_KEY}");
    assert.ok(!w.calls().includes(KEY), "the key's value is not given to the agent's configuration");
    assert.deepEqual(w.subjects().slice(0, 3), [`end ${JOB}: done`, "gate fixture decided", `take ${JOB} (https://github.com/alice/thesis-tool/actions/runs/4711)`]);
    const record = w.originText(`docs/jobs/${JOB}.md`);
    const writerCommit = git(w.root, "--git-dir", w.product, "log", "-1", "--format=%H", "--grep=gate fixture decided", "main");
    const end = record.split(/^## End$/m)[1];
    assert.match(end, /state: done/);
    assert.ok(end.includes(writerCommit), "the writer's commit is a result");
    assert.ok(end.includes(GATE_PATH), "the file is a result");
    assert.doesNotMatch(end, /```json/, "no draft in the end");
    assert.ok(holdsTask(w.calls()), "known positive: the search finds the task where the agent was started with it");
    assert.equal(holdsTask(w.everything()), false, "no commit message and no file of the product holds the task");
    assert.equal(holdsTask(w.lines() + status.summary), false, "nothing the entry printed holds the task");
    assert.ok(readFileSync(w.summary, "utf8").includes(ANSWER), "the run's summary holds the answer");
    assert.ok(w.lines().includes(ANSWER), "the log holds the answer");
    assert.equal(holdsTask(readFileSync(w.summary, "utf8")), false, "the run's summary holds no task");
  });
});

// TST-498002 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: as TST-498001; and the same dispatch for each of the inputs without task, with task "" and with task "   "
// input: onDispatch for each
// expect: outcome `failed` each time, the summary holds "the task travels with its hand-over, and this run was started without it"; the one commit on main is `end <job>: failed`, whose record End says `state: failed` and holds that reason; the job is not taken (no Taken part); opencode is never started; the endpoint input is not asked about
test("TST-498002: a hand-over dispatched without its task ends failed with the reason and writes only the end", async () => {
  for (const inputs of [{ job: JOB, endpoint: INPUTS.endpoint }, { ...INPUTS, task: "" }, { ...INPUTS, task: "   " }]) {
    await world({ records: [HAND_OVER] }, async (w) => {
      const status = await w.dispatch(inputs);
      assert.equal(status.outcome, "failed");
      assert.ok(status.summary.includes(NO_TASK), status.summary);
      assert.deepEqual(w.subjects().slice(0, 2), [`end ${JOB}: failed`, "first"], JSON.stringify(inputs));
      const record = w.originText(`docs/jobs/${JOB}.md`);
      assert.match(record, /## End[^]*state: failed/);
      assert.ok(record.includes(NO_TASK));
      assert.doesNotMatch(record, /## Taken/);
      assert.equal(w.starts().length, 0, "the agent was not started");
    });
  }
});

// TST-498003 · level: component · module: MOD-workflow-entries
// guards: UC-049; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: as TST-498001, but the environment lacks the key FIXTURE_KEY; and, as the known positive, the same with the key
// input: onDispatch with the task and the endpoint
// expect: without the key outcome `not run`, the summary naming FIXTURE_KEY, main as it was and opencode never started; with it outcome `done`
test("TST-498003: a hand-over whose participant's key is missing is not run, naming the secret, with nothing written", async () => {
  await world({ records: [HAND_OVER] }, async (w) => {
    const status = await w.dispatch(INPUTS, { FIXTURE_KEY: undefined });
    assert.equal(status.outcome, "not run");
    assert.match(status.summary, /FIXTURE_KEY/);
    assert.equal(w.mainHead(), w.head, "main is as it was");
    assert.equal(w.starts().length, 0);
    assert.equal((await w.dispatch(INPUTS)).outcome, "done", "known positive: with the key the job is run");
  });
});

// ---------------------------------------------------------------- onRecordsChanged leaves it

// TST-498004 · level: component · module: MOD-workflow-entries
// guards: UC-049
// given: a product whose `main` holds a queued job of the route `ci hosted` that says task `with the hand-over`, and another that says task `in parameters` and names its endpoint in its parameters, for the CI agent ci-bot; the fixture endpoint; the fixture agent opencode
// input: onRecordsChanged
// expect: outcome `done`; the job that says `in parameters` is taken and ends `state: done` (the known positive) after one request to the endpoint; the record of the hand-over job is exactly as queued; opencode is never started
test("TST-498004: onRecordsChanged leaves a job whose task travels with its hand-over queued", async () => {
  await world({ records: [HAND_OVER, { id: IN_RECORD, participant: "ci-bot", task: "in parameters", params: { endpoint: { name: "fixture", ...ENDPOINT } } }] }, async (w) => {
    const asked = fakeEndpoint();
    const queued = w.originText(`docs/jobs/${JOB}.md`);
    const status = await w.onRecordsChanged();
    assert.equal(status.outcome, "done", status.summary);
    assert.match(w.originText(`docs/jobs/${IN_RECORD}.md`), /## End[^]*state: done/);
    assert.equal(w.originText(`docs/jobs/${JOB}.md`), queued, "the hand-over job is left as it was queued");
    assert.equal(asked.length, 1, "the endpoint was asked once, for the job that says in parameters");
    assert.equal(w.starts().length, 0, "opencode was not started");
  });
});

// ---------------------------------------------------------------- a branch that holds the task

// TST-498005 · level: component · module: MOD-workflow-entries
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: as TST-498001, but the writer pushes the branch agent-m/<job> with its commit and returns the address of pull request 7, whose facts the fake GitHub API gives from that branch; the case plants the task in the commit message, in the pull request's title, or nowhere
// input: onDispatch with the task and the endpoint, for each case
// expect: planted in the commit message or in the title: outcome `failed`, the summary and the record's End name the branch agent-m/<job> and say it is refused, hold no zebra-498, and the record ends `state: failed`; the branch's commit is not on main; nowhere (the known positive): outcome `done`, the pull request's address is among the End's results, and the facts were read
test("TST-498005: a branch whose commit message or pull request text holds the task is refused by name, nothing merged", async () => {
  for (const plant of ["message", "title", null]) {
    await world({ records: [HAND_OVER] }, async (w) => {
      const api = fakeGitHub();
      plan = { pullRequest: true, plant, dir: w.productDir };
      const status = await w.dispatch(INPUTS);
      const branch = `agent-m/${JOB}`;
      assert.ok(api.includes("/pulls/7"), "the pull request's facts were read");
      const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
      if (plant === null) {
        assert.equal(status.outcome, "done", status.summary);
        assert.match(end, /state: done/);
        assert.ok(end.includes("https://github.com/alice/thesis-tool/pull/7"), "the pull request is among the results");
        return;
      }
      assert.equal(status.outcome, "failed", plant);
      for (const said of [status.summary, end]) {
        assert.ok(said.includes(branch), `${plant}: names the branch`);
        assert.match(said, /refused/, plant);
        assert.equal(holdsTask(said), false, `${plant}: the refusal does not repeat the task`);
      }
      assert.match(end, /state: failed/);
      assert.equal(w.mainHolds(pushed.commit), false, `${plant}: nothing is merged`);
      assert.equal(holdsTask(w.originText(`docs/jobs/${JOB}.md`)), false, `${plant}: the record holds no task`);
    });
  }
});

// ---------------------------------------------------------------- an endpoint the run cannot reach

// TST-498006 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN UNSUPPORTED ENDPOINT SAYS SO; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: as TST-498001, but the fixture agent says on its error output what it was started with — the prompt, which holds the task — and, as its last line, that it could not connect (ECONNREFUSED 10.0.0.5:8080) while asking the task, and ends with 1
// input: onDispatch with the task and the endpoint
// expect: outcome `failed`; the summary and the record's End hold the reason `not reachable` that diagnoseEndpoint gives for an error without status run in Node, and name "a self-hosted runner" and "a Bridge"; the record ends `state: failed`; no zebra-498 in the summary, the record, any commit or anything the entry printed; the agent's error output, which holds the task, is where the search finds it (the known positive: the fixture's calls file)
test("TST-498006: an endpoint the run cannot reach ends it failed with the diagnosis and the routes that would work, without the task", async () => {
  await world({ records: [HAND_OVER], agent: "unreachable" }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "failed");
    const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
    for (const said of [status.summary, end]) {
      assert.match(said, /not reachable/);
      assert.match(said, /a self-hosted runner/);
      assert.match(said, /a Bridge/);
    }
    assert.match(end, /state: failed/);
    assert.ok(holdsTask(w.calls()), "known positive: the agent was started with the task");
    assert.equal(holdsTask(status.summary + w.lines() + w.everything()), false, "the task reaches no summary, record, commit or output");
  });
});

// ---------------------------------------------------------------- the agent failed: the endpoint is tested once (ITM-539)

// TST-539001 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN UNSUPPORTED ENDPOINT SAYS SO
// given: as TST-498006, but the fixture agent ends with 1 after the last line "agent stopped: internal error 17", which says nothing of the endpoint; the endpoint answers the request of testEndpoint with 401 and the message "Invalid API key."
// input: onDispatch with the task and the endpoint
// expect: outcome `failed`; the summary and the record's End hold the reason `key refused` and the message "Invalid API key.", do not hold `not reachable`, and name "a self-hosted runner" and "a Bridge"; exactly one request reached the endpoint, at https://llm.example.test/v1, carrying the key FIXTURE_KEY's value and the model fixture-llm, and neither the task nor the agent's last line; the record ends `state: failed`; no zebra-498 in the summary, the record, any commit or anything the entry printed (known positive: the agent was started with the task)
test("TST-539001: a refused key is named as refused, not as unreachable", async () => {
  await world({ records: [HAND_OVER], agent: "failed", probe: answer(401, { error: { message: "Invalid API key." } }) }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "failed");
    const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
    for (const said of [status.summary, end]) {
      assert.match(said, /key refused/);
      assert.match(said, /Invalid API key\./);
      assert.doesNotMatch(said, /not reachable/);
      assert.match(said, /a self-hosted runner/);
      assert.match(said, /a Bridge/);
    }
    assert.match(end, /state: failed/);
    assert.equal(w.probes.length, 1, "the endpoint was asked once");
    assert.ok(w.probes[0].address.startsWith("https://llm.example.test/v1"), w.probes[0].address);
    assert.ok(JSON.stringify(w.probes[0].headers).includes(KEY), "the request carries the key");
    assert.ok(w.probes[0].body.includes("fixture-llm"), "the request names the model");
    assert.equal(holdsTask(w.probes[0].body + JSON.stringify(w.probes[0].headers)), false, "the request holds no task");
    assert.equal(w.probes[0].body.includes("agent stopped"), false, "the request holds nothing of the agent's output");
    assert.ok(holdsTask(w.calls()), "known positive: the agent was started with the task");
    assert.equal(holdsTask(status.summary + w.lines() + w.everything()), false, "the task reaches no summary, record, commit or output");
  });
});

// TST-539002 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN UNSUPPORTED ENDPOINT SAYS SO
// given: as TST-539001, but the endpoint answers 404 with the message "The model fixture-llm does not exist (asked: <the task>)", which repeats the task
// input: onDispatch with the task and the endpoint
// expect: outcome `failed`; the summary and the record's End hold the reason `model unknown` and "The model fixture-llm does not exist", not `not reachable`, and "[the task]" where the endpoint repeated the task; one request reached the endpoint; no zebra-498 in the summary, the record, any commit or anything the entry printed (known positive: the endpoint's answer, as the spy recorded it, holds the task)
test("TST-539002: an unknown model is named as unknown, and the task an endpoint repeats is hidden", async () => {
  await world({ records: [HAND_OVER], agent: "failed", probe: answer(404, { error: { message: `The model fixture-llm does not exist (asked: ${TASK})` } }) }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "failed");
    const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
    for (const said of [status.summary, end]) {
      assert.match(said, /model unknown/);
      assert.match(said, /The model fixture-llm does not exist/);
      assert.doesNotMatch(said, /not reachable/);
      assert.ok(said.includes("[the task]"), "the task the endpoint repeated is hidden");
    }
    assert.equal(w.probes.length, 1, "the endpoint was asked once");
    assert.ok(holdsTask(w.probes[0].answered), "known positive: the endpoint's answer holds the task");
    assert.equal(holdsTask(status.summary + w.lines() + w.everything()), false, "the task reaches no summary, record, commit or output");
  });
});

// TST-539003 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN UNSUPPORTED ENDPOINT SAYS SO
// given: as TST-539001, but the request of testEndpoint is refused by a connection error with the message "connect ECONNREFUSED 10.0.0.9:9", which the agent's output does not hold
// input: onDispatch with the task and the endpoint
// expect: outcome `failed`; the summary and the record's End hold the reason `not reachable` and the message "connect ECONNREFUSED 10.0.0.9:9", and name "a self-hosted runner" and "a Bridge"; one request reached the endpoint; the record ends `state: failed`
test("TST-539003: an endpoint nothing answers is named as not reachable in the words of the test request", async () => {
  await world({ records: [HAND_OVER], agent: "failed", probe: () => { throw new TypeError("connect ECONNREFUSED 10.0.0.9:9"); } }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "failed");
    const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
    for (const said of [status.summary, end]) {
      assert.match(said, /not reachable/);
      assert.match(said, /connect ECONNREFUSED 10\.0\.9\.9:9/);
      assert.match(said, /a self-hosted runner/);
      assert.match(said, /a Bridge/);
    }
    assert.match(end, /state: failed/);
    assert.equal(w.probes.length, 1, "the endpoint was asked once");
  });
});

// TST-539004 · level: component · module: MOD-workflow-entries
// guards: UC-049; AN UNSUPPORTED ENDPOINT SAYS SO
// given: as TST-539001, but the endpoint answers the request of testEndpoint as a working OpenAI-compatible endpoint does, with a message "ok"
// input: onDispatch with the task and the endpoint
// expect: outcome `failed`; the summary and the record's End hold the agent's last output "agent stopped: internal error 17" and neither `key refused` nor `model unknown`; the record ends `state: failed`; one request reached the endpoint; no zebra-498 in the summary, the record, any commit or anything the entry printed
test("TST-539004: where the endpoint works, the failure is the agent's and its last output is reported", async () => {
  await world({ records: [HAND_OVER], agent: "failed", probe: answer(200, { choices: [{ message: { content: "ok" } }] }) }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "failed");
    const end = w.originText(`docs/jobs/${JOB}.md`).split(/^## End$/m)[1];
    for (const said of [status.summary, end]) {
      assert.ok(said.includes("agent stopped: internal error 17"), said);
      assert.doesNotMatch(said, /key refused|model unknown/);
    }
    assert.match(end, /state: failed/);
    assert.equal(w.probes.length, 1, "the endpoint was asked once");
    assert.equal(holdsTask(status.summary + w.lines() + w.everything()), false, "the task reaches no summary, record, commit or output");
  });
});

// TST-539005 · level: component · module: MOD-workflow-entries
// guards: UC-049
// given: as TST-498001: the fixture agent succeeds; the endpoint would answer 401
// input: onDispatch with the task and the endpoint
// expect: outcome `done`; no request reached the endpoint (the entry asks the endpoint only after the agent failed)
test("TST-539005: a hand-over run whose agent succeeds makes no request to the endpoint", async () => {
  await world({ records: [HAND_OVER], probe: answer(401, { error: { message: "Invalid API key." } }) }, async (w) => {
    const status = await w.dispatch(INPUTS);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(w.probes.length, 0);
  });
});
