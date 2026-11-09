// The plan a job nobody attends proposes is handed over piece by piece, each as a job of its own (UC-049 4f, as accepted: "each piece of its plan of a kind other than the
// conversation itself that rests on no other piece is spawned as a job of its own on GitHub Actions, as 4a.2 and 4a.3 say, which names the conversation's job …; a piece that rests
// on another is not handed over. The conversation's job record names every job it started and every piece not handed over, with why"). As docs/architecture/MOD-workflow-entries.md
// states it (onRecordsChanged): "The agent's machine leaves those pieces, with their tasks, with its result (`leaveResult`); the writing machine, which holds the person's token,
// prepares each with its kind's preconditions and no start rule of the product's process, and hands it over with MOD-runtimes' `handOverJob`, its start's `startedBy` the job — so
// that the commit of its record appends the job's `Job started` part — and its task the input `task` of the run it starts, standing in no file. Each runs in a run of its own as
// `onDispatch` runs a hand-over … A piece whose `after` names another, a piece of the job's own kind … is not handed over, and the job's end names it with why … for a piece that
// rests on another, `<why>` is `waits for the acceptance of <n>` … and that piece's job where it was handed over … The end lists, beside the job's own results, `handed over: <kind> —
// <JOB-id>` for each piece handed over"; and MOD-approvals' `rests-on-accepted` (NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED).
// Run: node --test tests/workflow-entries-hand-over-in-run.test.mjs
//
// Module: MOD-workflow-entries · MOD-runtimes · MOD-approvals
// Guards: UC-049; UC-036; A RUN IS A JOB THAT NAMES ITS JOBS; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON;
//   A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// Level: component
//
// Deterministic, no network, no real model: the product and the instance are temporary git repositories; each machine of a run works in a clone of its own, laid out as the job
// workflow lays them out — the agent's machine (AGENT_M_PART agent, its result's folder, the one key FIXTURE_KEY, no token) and the writing machine (AGENT_M_PART write, the person's
// token, every key). The job is the endpoint's own `converse` job that the prompt bar spawned (its record `declares` draft text and read the repository; its task travels with the
// hand-over), dispatched with its task. The product holds the job workflow, the use case UC-001, accepted, and UC-002, open; the architecture ARC-001 with the module MOD-reader; and
// the backlog items ITM-001, which realises UC-001, and ITM-002, which realises UC-002 — no process declaration, no sprint, no role assignment. One fake `fetch` stands for the world:
// the model endpoint (OpenAI-compatible), which answers the conversation with the test's plan and implement's prompt from a script of tool calls, and the repository server's API,
// which takes a start of the job workflow (`POST …/actions/workflows/agent-m-jobs.yml/dispatches`, 204). Each test states its input and its expected result before it runs
// (given / input / expect). Counter-proof: on the entries as they stood, which ran the hand-over in the same run, implement's prompt is sent on the agent's machine and no record of
// a job of its own is written; each test fails.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRecord } from "../src/job-ledger/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");
const REAL_GIT = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();

// ---------------------------------------------------------------- the fixtures

const text = (...lines) => `${lines.join("\n")}\n`;
const sha256 = (body) => createHash("sha256").update(body).digest("hex");
const blobOf = (body) => createHash("sha1").update(`blob ${Buffer.byteLength(body)}\0${body}`).digest("hex");
const NOW = new Date("2026-10-28T09:00:00Z");
const KEY = "sk-INRUN-KEY-0123456789abcdef";
const TOKEN = "ghp_ALICEinRunToken0123456789abcdef";
const TASK = "Talk about the due date, token kestrel-2026";
const PIECE_TASK = "tell the member the due date, piece osprey-4711";
const ENDPOINT = { kind: "openai-compatible", baseUrl: "https://llm.example.test/v1", model: "fixture-llm" };
const JOB = "JOB-20261028-0800-c4d5";
const RECORD = `docs/jobs/${JOB}.md`;
const PLACE = "GitHub's hosted runners";
const SEVEN = ["read", "write", "edit", "bash", "grep", "glob", "webfetch"];
const AGENTS_MD = "# Agent M rules, fixture in-run-2026\n";
const BRANCH = "agent-m/ITM-001";
const DISPATCHES = "https://api.github.com/repos/alice/thesis-tool/actions/workflows/agent-m-jobs.yml/dispatches";

const RULE = "A LOAN HAS A DUE DATE";
const SPEC = text("# Thesis tool — Specification", "", "## Lending", "", `**${RULE}** *(SRC-fixture-po)*`, "Every loan states the date by which the book is returned.",
  "*Check:* `tests/loan.test.mjs`");
const useCase = (id, title) => text("---", `id: ${id}`, `title: ${title}`, "area: lending", "actors:", "  - Member", "realises:", `  - ${RULE}`, "---", `# ${id} ${title}`, "",
  "**Goal.** The member borrows a book.");
const UC1 = useCase("UC-001", "Check out a book"), UC2 = useCase("UC-002", "Renew a book");
const DIAGRAM = ["", "```mermaid", "flowchart LR", "    Desk --> Shelf", "```", ""];
const ARC = text("---", "id: ARC-001", "title: Lending is a desk", "forced_by:", `  - ${RULE}`, "---", "# ARC-001 Lending is a desk", "", "## Context", "", "Books are lent at a desk.", "",
  "## Decision", "", "The desk is one module.", ...DIAGRAM, "## Alternatives", "", "None.", "", "## Consequences", "", "One folder.");
const MOD = text("---", "id: MOD-reader", "title: Reading a book", "folder: src/reader/", "realises:", `  - ${RULE}`, "follows:", "  - ARC-001", "uses:", "provides:", "  - lend", "---",
  "# MOD-reader Reading a book", "", "## Responsibility", "", "It lends a book.", ...DIAGRAM, "## Parts", "", "- `index.mjs`", "", "## Data", "", "Nothing.", "", "## Interfaces", "", "- `lend`", "",
  "## Files", "", "None.", "", "## Uses", "", "Nothing.");
const item = (id, realises) => text("---", `id: ${id}`, `title: ${id} the due date`, "realises:", `  - ${realises}`, "modules:", "  - MOD-reader", "origin:", "  - the fixture", "---",
  `# ${id} ${id} the due date`, "", "## Outcome", "", "The member is told the date.", "", "## Acceptance", "", "The date is shown.");
const record = (id, body) => [`docs/approvals/${id}-${blobOf(body).slice(0, 12)}.md`, text("---", `id: ${id}`, "kind: approval", "---", `# Approval of ${id}`)];
// UC-001, ARC-001 and MOD-reader are accepted: a record names each one's text. UC-002 is open: none names it.
const PRODUCT = Object.fromEntries([
  ["README.md", "# Thesis tool\n"], ["SPEC.md", SPEC], ["docs/use-cases/UC-001-check-out-a-book.md", UC1], ["docs/use-cases/UC-002-renew-a-book.md", UC2],
  ["docs/architecture/ARC-001-lending-is-a-desk.md", ARC], ["docs/architecture/MOD-reader.md", MOD], ["src/reader/index.mjs", "export const lend = () => null;\n"],
  ["docs/backlog/ITM-001-due-date.md", item("ITM-001", "UC-001")], ["docs/backlog/ITM-002-renewal.md", item("ITM-002", "UC-002")],
  [".github/workflows/agent-m-jobs.yml", "name: agent-m-jobs\n"],
  record("UC-001", UC1), record("ARC-001", ARC), record("MOD-reader", MOD)]);

// The book's chapters 8 to 13, which the recipe chapters-for-implementation reads from the instance's register (9, 11, 12 and 13).
const CHAPTERS = [8, 9, 10, 11, 12, 13].map((n) => [`${String(n).padStart(2, "0")}_chapter-${n}.md`, `Chapter ${n} of the fixture book.\n`]);
const BOOK = text("---", "id: SRC-vibe-coding", "title: Vibe Coding", "kind: document", "authority: normative", "licence: may be republished — fixture", "---",
  "# SRC-vibe-coding Vibe Coding", "", "## Versions", "", "| Version | Date | Edition | Read from | Files |", "|---|---|---|---|---|",
  `| \`2026-10-05\` | 2026-10-05 | — | the fixture | ${CHAPTERS.length} files, listed below; version hash \`${sha256(CHAPTERS.map(([name, body]) => `${sha256(body)}  ${name}\n`).join(""))}\` |`,
  "", "### Files of 2026-10-05", "", "| File | SHA-256 |", "|---|---|", ...CHAPTERS.map(([name, body]) => `| \`${name}\` | \`${sha256(body)}\` |`));
const PARTICIPANTS = text("# Participants of this instance", "", "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|",
  "| alice | person | — | — | — | read the repository, write to the repository | — | account github.com/alice |");

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
const NO_MAINTENANCE = ["-c", "gc.auto=0", "-c", "maintenance.auto=false", "-c", "receive.autogc=false"];
const quiet = (dir) => { for (const [key, value] of [["gc.auto", "0"], ["maintenance.auto", "false"], ["receive.autogc", "false"]]) git(dir, "config", key, value); };
// A clone of `origin` into `folder`, as a machine's checkout.
function cloneInto(root, origin, folder) {
  mkdirSync(join(folder, ".."), { recursive: true });
  git(root, "clone", "-q", ...NO_MAINTENANCE, origin, folder);
  quiet(folder);
  git(folder, "config", "user.name", "Alice");
  git(folder, "config", "user.email", "alice@example.org");
}
// A bare origin whose `main` holds `files`, and the clone of it the workflow checks out into `folder`.
function repository(root, name, files, folder) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  quiet(origin);
  git(root, "clone", "-q", ...NO_MAINTENANCE, origin, seed);
  quiet(seed);
  git(seed, "config", "user.name", "Seed");
  git(seed, "config", "user.email", "seed@example.org");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "first");
  git(seed, "push", "-q", "origin", "HEAD:refs/heads/main");
  if (folder) cloneInto(root, origin, folder);
  return origin;
}

// The answers of the fake endpoint: a tool call, or the final draft.
const call = (id, name, args) => ({ choices: [{ finish_reason: "tool_calls", message: { content: null, tool_calls: [{ id, type: "function", function: { name, arguments: JSON.stringify(args) } }] } }] });
const final = (draft) => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ draft, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
// The prompt of `implement` (src/job-catalogue/kinds/implement/prompt.md), by which the fake endpoint tells its requests from the conversation's.
const IMPLEMENT = "You implement one step of a product's plan, or one backlog item";

// The implementation in the checkout: a file written, a branch of its own committed and pushed, the draft reporting it.
const IMPLEMENTS = [
  call("i1", "write", { path: "src/reader/due.mjs", content: "export const due = (day) => day + 14;\n" }),
  call("i2", "bash", { command: `git checkout -q -b ${BRANCH} && git add -A && git commit -q -m "ITM-001: the due date" && git push -q origin HEAD` }),
  final({ branch: BRANCH, commits: [], pullRequest: "" }),
];

// The pieces of a plan, as the conversation's answer holds them.
const piece = (kind, works_on, task, after = []) => ({ kind, works_on, task, after });

// The world of a product whose endpoint's own converse job the bar spawned. `plan` is what the conversation's answer hands on. `run` is given the machines: `agent(job, task)` runs
// onDispatch and leaveResult on a fresh agent's machine, `writer(job, task)` writeResult on a fresh writing machine, each with the inputs job, task, endpoint and secret FIXTURE_KEY.
async function world(plan, run) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agent-m-in-run-")));
  const workspace = join(root, "ws"), instanceDir = join(workspace, "instance");
  repository(root, "instance", { "README.md": "# Instance\n", "AGENTS.md": AGENTS_MD, "docs/participants.md": PARTICIPANTS, "docs/sources/SRC-vibe-coding.md": BOOK,
    ...Object.fromEntries(CHAPTERS.map(([name, body]) => [`docs/sources/SRC-vibe-coding/2026-10-05/${name}`, body])) }, instanceDir);
  const agentM = { version: "2026.10.0", commit: git(instanceDir, "rev-parse", "HEAD") };
  const { path, text: start } = startRecord({ id: JOB, declares: { context: 100000, capabilities: ["draft text", "read the repository"] }, kind: "converse",
    worksOn: ["https://github.com/alice/thesis-tool"], participant: "fixture-endpoint", model: "fixture-llm", route: "ci hosted", run: null, retries: null, startedBy: "alice",
    start: new Date("2026-10-28T08:00:00Z"), agentM, inputs: [], limit: 1, task: "with the hand-over", destinations: [{ participant: "fixture-endpoint", place: PLACE, parts: ["instruction"] }],
    params: { source: "SRC-fixture-po" } });
  const origin = repository(root, "product", { ...PRODUCT, [path]: start }, null);
  const base = git(origin, "rev-parse", "main");
  const requests = [], dispatches = [];
  const saved = { FIXTURE_KEY: process.env.FIXTURE_KEY, NODE_TEST_CONTEXT: process.env.NODE_TEST_CONTEXT, fetch: globalThis.fetch, log: console.log };
  process.env.FIXTURE_KEY = KEY;
  delete process.env.NODE_TEST_CONTEXT;
  let implementAsked = 0, machines = 0, log = "";
  globalThis.fetch = async (address, init = {}) => {
    const url = String(address);
    if (url === DISPATCHES && init.method === "POST") {
      dispatches.push({ headers: init.headers ?? {}, body: JSON.parse(String(init.body)) });
      return new Response(null, { status: 204 });
    }
    if (!url.startsWith(ENDPOINT.baseUrl)) throw new TypeError(`uncontrolled request: ${address}`);
    const body = JSON.parse(String(init.body ?? "{}"));
    requests.push({ address: url, headers: init.headers ?? {}, body });
    const answer = JSON.stringify(body).includes(IMPLEMENT) ? IMPLEMENTS[Math.min(implementAsked++, IMPLEMENTS.length - 1)]
      : final({ answer: "I plan this.", handOver: plan });
    return new Response(JSON.stringify(answer), { status: 200, headers: { "content-type": "application/json" } });
  };
  console.log = (...args) => { log += `${args.join(" ")}\n`; };
  const environment = (job, task, productDir, resultDir, part) => {
    const payload = join(root, `event-${machines}.json`);
    writeFileSync(payload, JSON.stringify({ inputs: { job, task, endpoint: JSON.stringify(ENDPOINT), secret: "FIXTURE_KEY" } }));
    return { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_EVENT_PATH: payload, GITHUB_WORKSPACE: workspace, GITHUB_SERVER_URL: "https://github.com",
      GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "main", GITHUB_SHA: agentM.commit, GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice", AGENT_M_RUNNER: "hosted",
      AGENT_M_PRODUCT_DIR: productDir, AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN", AGENT_M_KEY_NAMES: "FIXTURE_KEY", AGENT_M_PART: part, AGENT_M_RESULT_DIR: resultDir, FIXTURE_KEY: KEY,
      ...(part === "agent" ? { AGENT_M_KEY: "1" } : { AGENT_M_TOKEN: TOKEN }) };
  };
  let resultDir = null;
  const agent = async (job, task) => {
    const productDir = join(root, `agent-${++machines}`);
    resultDir = join(root, `result-${machines}`);
    cloneInto(root, origin, productDir);
    const status = await runEntry("onDispatch", environment(job, task, productDir, resultDir, "agent"), { now: NOW });
    const left = await runEntry("leaveResult", environment(job, task, productDir, resultDir, "agent"), { now: NOW });
    const deferred = join(resultDir, "deferred.json");
    return { status, left, productDir, kept: existsSync(deferred) ? JSON.parse(readFileSync(deferred, "utf8")) : { pullRequests: [], ends: [], plans: [] } };
  };
  const writer = async (job, task) => {
    const productDir = join(root, `writer-${++machines}`);
    cloneInto(root, origin, productDir);
    return runEntry("writeResult", environment(job, task, productDir, resultDir, "write"), { now: NOW });
  };
  try {
    return await run({ agent, writer, requests, dispatches, origin, base, log: () => log,
      implementRequests: () => requests.filter((each) => JSON.stringify(each.body).includes(IMPLEMENT)),
      fileAt: (path, ref = "main") => { const r = spawnSync(REAL_GIT, ["--git-dir", origin, "show", `${ref}:${path}`], { encoding: "utf8" }); return r.status === 0 ? r.stdout : null; },
      recordsAt: () => git(origin, "ls-tree", "-r", "--name-only", "main").split("\n").filter((each) => /^docs\/jobs\/JOB-.*\.md$/.test(each)),
      everything: () => git(origin, "log", "--all", "-p", `^${base}`),
      endOf: (path) => (spawnSync(REAL_GIT, ["--git-dir", origin, "show", `main:${path}`], { encoding: "utf8" }).stdout.split(/^## End$/m)[1] ?? "") });
  } finally {
    for (const name of ["FIXTURE_KEY", "NODE_TEST_CONTEXT"]) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }
    globalThis.fetch = saved.fetch;
    console.log = saved.log;
    rmSync(root, { recursive: true, force: true });
  }
}

// The result lines of an end: its `results:` list, one item each.
const resultLines = (end) => (/^results: (.*)$/m.exec(end)?.[1] ?? "").split(", ").filter(Boolean);

// ---------------------------------------------------------------- a plan handed over piece by piece

// TST-2026281001 · level: component · module: MOD-workflow-entries · MOD-runtimes
// guards: UC-049; A RUN IS A JOB THAT NAMES ITS JOBS; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the endpoint's own converse job (it declares draft text and read the repository; its source SRC-fixture-po); its answer plans three pieces — 1 { implement, [ITM-001], "tell the member the due date, piece osprey-4711" }, ITM-001 realising the accepted UC-001; 2 { change-use-case, [UC-001], after [1] }; 3 { converse, [UC-001] } —
// input: onDispatch and leaveResult on the agent's machine, with the inputs job, task, endpoint and secret FIXTURE_KEY; then writeResult on the writing machine with the same inputs
// expect: the agent's machine ends done, sends implement's prompt never, and keeps for the writing machine the plan of the conversation's record, piece 1 with its task; the writing machine ends done and writes one new record of a job of implement — works on ITM-001, started_by the conversation's job, task `with the hand-over`, its parameters source SRC-fixture-po, items [ITM-001] and refuses [hand-over], declaring the conversation's context and capabilities —, the conversation's record gaining one `Job started` part naming that job, kind implement, works on ITM-001; it starts the job workflow once, with the person's token, on main, with the inputs job (that job), task (piece 1's task), endpoint and secret FIXTURE_KEY; the conversation's end lists `handed over: implement — <that job>`, `not run: change-use-case — waits for the acceptance of 1 (<that job>)` and `not run: converse — ` naming this conversation itself; neither the conversation's task nor piece 1's stands in any commit; the log holds no `--- answer handed on in` line
test("TST-2026281001: a hosted conversation's plan is left with its result, and the writing machine hands each piece over as a job of its own that names the conversation's job", async () => {
  await world([piece("implement", ["ITM-001"], PIECE_TASK), piece("change-use-case", ["UC-001"], "realise the due date", [1]), piece("converse", ["UC-001"], "go on")], async (w) => {
    const agent = await w.agent(JOB, TASK);
    assert.equal(agent.status.outcome, "done", agent.status.summary);
    assert.equal(w.implementRequests().length, 0, "the agent's machine sends implement's prompt never");
    const kept = (agent.kept.plans ?? []).find((each) => each.path === RECORD);
    assert.ok(kept, `the plan is kept for the writing machine: ${JSON.stringify(agent.kept)}`);
    assert.equal(kept.pieces.find((each) => each.kind === "implement")?.task, PIECE_TASK, "piece 1 is kept with its task");

    const written = await w.writer(JOB, TASK);
    assert.equal(written.outcome, "done", written.summary);
    const added = w.recordsAt().filter((each) => each !== RECORD);
    assert.equal(added.length, 1, `one new record: ${added.join(", ")}`);
    const pieceId = /(JOB-[^/]+)\.md$/.exec(added[0])[1];
    const pieceRecord = w.fileAt(added[0]);
    assert.match(pieceRecord, /^kind: implement$/m);
    assert.match(pieceRecord, /^works_on:\n {2}- ITM-001$/m);
    assert.match(pieceRecord, new RegExp(`^started_by: ${JOB}$`, "m"));
    assert.match(pieceRecord, /^task: with the hand-over$/m);
    assert.match(pieceRecord, /"refuses": \[\s*"hand-over"\s*\]/);
    assert.match(pieceRecord, /"items": \[\s*"ITM-001"\s*\]/);
    assert.match(pieceRecord, /"source": "SRC-fixture-po"/);
    assert.match(pieceRecord, /^declares: \{"context":100000,"capabilities":\["draft text","read the repository"\]\}$/m);
    const conversation = w.fileAt(RECORD);
    assert.equal((conversation.match(/^## Job started$/gm) ?? []).length, 1, "the conversation's record names the job it started");
    assert.match(conversation, new RegExp(`## Job started\\n[^#]*job: ${pieceId}\\nkind: implement\\nworks on: ITM-001\\n`));
    assert.equal(w.dispatches.length, 1, "the job workflow is started once");
    assert.equal(w.dispatches[0].headers.Authorization, `Bearer ${TOKEN}`, "with the person's token");
    assert.deepEqual(w.dispatches[0].body, { ref: "main", inputs: { job: pieceId, task: PIECE_TASK, endpoint: JSON.stringify(ENDPOINT), secret: "FIXTURE_KEY" } });
    const lines = resultLines(w.endOf(RECORD));
    assert.ok(lines.includes(`handed over: implement — ${pieceId}`), lines.join("\n"));
    assert.ok(lines.includes(`not run: change-use-case — waits for the acceptance of 1 (${pieceId})`), lines.join("\n"));
    assert.ok(lines.some((line) => /^not run: converse — .*this conversation itself/.test(line)), lines.join("\n"));
    assert.ok(!w.everything().includes("osprey-4711") && !w.everything().includes("kestrel-2026"), "no task stands in any commit");
    assert.ok(!w.log().includes("--- answer handed on in"), "no answer is handed on in the run's log");
  });
});

// TST-2026281002 · level: component · module: MOD-workflow-entries · MOD-approvals
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-049
// given: as TST-2026281001 — whose piece of ITM-001 is handed over, the known positive —, but the plan's one piece is { implement, [ITM-002] }, and ITM-002 realises UC-002, which no approval record names
// input: onDispatch and leaveResult on the agent's machine, then writeResult
// expect: both end done; no record but the conversation's is written, and the job workflow is not started; the conversation's end lists `not run: implement — ` naming UC-002 and the rule NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED — MOD-approvals' rests-on-accepted read the item's `realises` —, and no `handed over:`
test("TST-2026281002: a piece of implement on an item whose use case is not accepted is not handed over, its reason the kind's precondition", async () => {
  await world([piece("implement", ["ITM-002"], "let the member renew")], async (w) => {
    assert.equal((await w.agent(JOB, TASK)).status.outcome, "done");
    const written = await w.writer(JOB, TASK);
    assert.equal(written.outcome, "done", written.summary);
    assert.deepEqual(w.recordsAt(), [RECORD]);
    assert.equal(w.dispatches.length, 0);
    const lines = resultLines(w.endOf(RECORD));
    assert.ok(lines.some((line) => /^not run: implement — .*UC-002.*NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED/.test(line)), lines.join("\n"));
    assert.ok(!lines.some((line) => line.startsWith("handed over:")), lines.join("\n"));
  });
});

// TST-2026114907 · level: component · module: MOD-workflow-entries
// guards: UC-049; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: the world of TST-2026281001 after its writing machine handed piece 1 over as a job of implement
// input: onDispatch and leaveResult on a new agent's machine, with the inputs the start named — job (that job), task (piece 1's task), endpoint and secret FIXTURE_KEY —; the endpoint answers implement's prompt by writing src/reader/due.mjs, committing it on the branch agent-m/ITM-001, pushing it and reporting that branch
// expect: outcome done; implement's prompt is sent with the job's own endpoint, model and key — the seven tools of the checkout offered and hand-over not among them, no system prompt, the first message beginning with the instance's AGENTS.md, sent once, and naming the checkout after it —; the result's repository holds agent-m/ITM-001 with src/reader/due.mjs; one pull request of it into main is kept for the writing machine; the job's own end is kept, listing `pending-pull-request:agent-m/ITM-001`
test("TST-2026114907: a piece handed over runs in a run of its own, by its kind's definition, in the job's checkout", async () => {
  await world([piece("implement", ["ITM-001"], PIECE_TASK)], async (w) => {
    await w.agent(JOB, TASK);
    await w.writer(JOB, TASK);
    const pieceId = w.dispatches[0]?.body.inputs.job;
    assert.ok(pieceId, "known positive: the piece was handed over");
    const run = await w.agent(pieceId, w.dispatches[0].body.inputs.task);
    assert.equal(run.status.outcome, "done", run.status.summary);
    const implementing = w.implementRequests();
    assert.ok(implementing.length >= 1, "implement's prompt is sent");
    for (const request of implementing) {
      assert.equal(request.address, "https://llm.example.test/v1/chat/completions");
      assert.equal(request.body.model, "fixture-llm");
      assert.equal(request.headers.Authorization, `Bearer ${KEY}`);
    }
    assert.deepEqual((implementing[0].body.tools ?? []).map((tool) => tool.function.name), SEVEN, "the seven tools of the checkout, and no hand-over");
    // EVERY MODEL READS AGENT M'S AGENTS.MD FIRST: no system prompt; the first message is the person's side, beginning with the instance's AGENTS.md, sent
    // once, and the checkout's instructions follow it.
    const first = implementing[0].body.messages[0];
    assert.ok(!implementing[0].body.messages.some((message) => message.role === "system"), "no system prompt precedes AGENTS.md");
    assert.equal(first.role, "user");
    assert.ok(first.content.startsWith(AGENTS_MD), first.content.slice(0, 120));
    assert.equal(JSON.stringify(implementing[0].body).split(AGENTS_MD.trim()).length - 1, 1, "AGENTS.md is sent once");
    assert.ok(first.content.indexOf(`Working folder: ${run.productDir}`) > AGENTS_MD.length, "checkoutPrompt names the checkout, after AGENTS.md");
    assert.ok(first.content.indexOf(`Working folder: ${run.productDir}`) < first.content.indexOf(IMPLEMENT), "and before the kind's prompt");
    assert.deepEqual(run.kept.pullRequests.map((each) => [each.branch, each.base]), [[BRANCH, "main"]]);
    const end = run.kept.ends.find((each) => each.path === `docs/jobs/${pieceId}.md`);
    assert.ok(end?.part.part.results.includes(`pending-pull-request:${BRANCH}`), JSON.stringify(run.kept.ends));
  });
});
