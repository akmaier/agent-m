// MOD-workflow-entries' entry onDoneCheck (ITM-1210), as the accepted text of docs/architecture/MOD-workflow-entries.md states it: "on a pull request of a product opened or
// updated, run only by the Definition-of-Done job of MOD-test-schedule's test configuration: the Definition-of-Done check from the pull request's facts and the product's declared
// conditions, its status and findings shown on the pull request (`A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`)."; UC-027.
// Run: node --test tests/workflow-entries-done-check.test.mjs
//
// Module: MOD-workflow-entries
// Guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; THE DEFAULT DEFINITION OF DONE IS THE JOB RULES; UC-027
// Level: unit
//
// Deterministic, no network. The checkout is laid out as MOD-test-schedule's generated job `agent-m done` lays it out (src/test-schedule/templates/github-done.yml): the
// workspace is the product's checkout of the pull request, the instance is checked out into its folder `.agent-m`, both temporary git repositories. The product declares the
// shipped model kanban — no gate of it stands before the merge —, the backlog item ITM-001 of the module MOD-store (folder src/store/) and the job JOB-20261025-0900-a1b2 of
// kind implement working on it. The pull request's facts come from a fake of GitHub's REST API (the pull request, its commits with their files and checks, its files, its
// reviews, a file's text at a commit), which `fetch` is replaced with. The readings, named in the pull request:
//   - The pull request's job is the job its title or description names (`Job: <id>`, as MOD-runtimes' writer branch-and-pull-request writes them); its modules are those of the
//     items and plan steps the job works on. A pull request that names no job is no implementation job's: `nothing to do`.
//   - The check `agent-m done` that runs the entry is running while it checks: of the head's checks, the one of this run whose name is this job's is not weighed, and the head's CI
//     counts green when only that check keeps it running. Every other check counts.
//   - The status and the findings are shown on the pull request as the check's: its outcome, its log (main.mjs prints the findings) and the run's summary, which GitHub
//     links from the check (GITHUB_STEP_SUMMARY).
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { startRecord } from "../src/job-ledger/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");

// ---------------------------------------------------------------- the fixtures

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "src/model-catalogue/models/kanban.md";
const NOW = new Date("2026-10-25T10:00:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const JOB = "JOB-20261025-0900-a1b2";
const API = "https://api.github.com/repos/alice/thesis-tool";
const WEB = "https://github.com/alice/thesis-tool";
const RUN = `${WEB}/actions/runs/4711`;
const BASE = "b".repeat(40), FIRST = "1".repeat(40), HEAD = "2".repeat(40);

const text = (...lines) => `${lines.join("\n")}\n`;
const NEW_TEST = text("// Module: MOD-store", "// Level: unit", "", "// TST-001 · level: unit · module: MOD-store", "// guards: A LOAN HAS A DUE DATE", "// given: a loan",
  "// input: its date", "// expect: the due date", "test(\"TST-001 a loan\", () => {});");
const declaration = (version) => text("---", "model: kanban", `model_file: ${MODEL}`, `model_version: ${version}`, "---", "# Process", "", "## Practices", "", "- none", "",
  "## Branches", "", "| Phase or time box | Branch |", "|---|---|", "", "## Definition of Done", "", "The job rules hold; no condition is added.");
const ITEM = text("---", "id: ITM-001", "title: A loan has a due date", "level: module", "realises:", "  - UC-001", "modules:", "  - MOD-store", "tests:", "  - unit", "origin:",
  "  - UC-001", "---", "# ITM-001 A loan has a due date", "", "## Outcome", "", "o", "", "## Acceptance", "", "a");
const MODULE = text("---", "id: MOD-store", "title: The store", "folder: src/store/", "realises:", "follows:", "  - ARC-001", "uses:", "provides:", "---", "# MOD-store The store");

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
function repository(folder, files) {
  mkdirSync(folder, { recursive: true });
  git(folder, "init", "-q", "-b", "main");
  git(folder, "config", "user.name", "Seed");
  git(folder, "config", "user.email", "seed@example.org");
  write(folder, files);
  git(folder, "add", "-A");
  git(folder, "commit", "-q", "-m", "first");
  return git(folder, "rev-parse", "HEAD");
}

// The job `agent-m done`'s checkout of the pull request, with the instance in its folder .agent-m, and the event's payload.
async function withCheckout(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-done-check-"));
  const checkout = join(root, "product");
  try {
    const instance = repository(join(checkout, ".agent-m"), { "SPEC.md": "# Spec\n", [MODEL]: readFileSync(join(ROOT, MODEL), "utf8") });
    const job = startRecord({ id: JOB, kind: "implement", worksOn: ["ITM-001"], participant: "ci-bot", model: "fixture-llm", route: "ci hosted", run: null, retries: null,
      startedBy: "alice", start: new Date("2026-10-25T09:00:00Z"), agentM: { version: "unreleased", commit: instance }, inputs: [], limit: 2,
      destinations: [{ participant: "ci-bot", place: "GitHub's hosted runners", parts: [] }], params: {} });
    write(checkout, { "README.md": "# Thesis tool\n", "docs/process.md": declaration(instance), "docs/backlog/ITM-001-a-loan-has-a-due-date.md": ITEM,
      "docs/architecture/MOD-store.md": MODULE, [job.path]: job.text, "src/store/index.mjs": "export const due = 14;\n", "tests/store.test.mjs": NEW_TEST });
    git(checkout, "init", "-q", "-b", "main");
    git(checkout, "config", "user.name", "Seed");
    git(checkout, "config", "user.email", "seed@example.org");
    git(checkout, "add", "README.md", "docs", "src", "tests");
    git(checkout, "commit", "-q", "-m", "the merge of the pull request");
    const event = join(root, "event.json"), summary = join(root, "summary.md");
    writeFileSync(event, JSON.stringify({ action: "synchronize", number: 7, pull_request: { number: 7 } }));
    return await run({ checkout, event, summary });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// A fake of GitHub's REST API serving the pull request #7 of alice/thesis-tool: its first commit adds the test and was red, its head commit changes src/store/index.mjs — and
// `outside`, where given — with the check `node` green and this run's check `agent-m done` running. `title`/`body` are the pull request's.
function fakeGitHub({ outside = null, title = `${JOB}: implement ITM-001`, body = `Job: ${JOB}\nKind: implement\nBacklog item: ITM-001\nModules: MOD-store` } = {}) {
  const answer = (status, value) => new Response(typeof value === "string" ? value : JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
  const headFiles = ["src/store/index.mjs", ...(outside ? [outside] : [])];
  const commits = [
    { sha: FIRST, parents: [BASE], files: [{ filename: "tests/store.test.mjs", status: "added" }], checks: [{ name: "node", status: "completed", conclusion: "failure", html_url: `${WEB}/actions/runs/4700/job/1` }] },
    { sha: HEAD, parents: [FIRST], files: headFiles.map((filename) => ({ filename, status: filename === outside ? "added" : "modified" })),
      checks: [{ name: "node", status: "completed", conclusion: "success", html_url: `${RUN}/job/98` }, { name: "agent-m done", status: "in_progress", conclusion: null, html_url: `${RUN}/job/99` }] },
  ];
  const calls = [];
  const fetch = async (address) => {
    const url = new URL(String(address)), path = url.pathname.replace("/repos/alice/thesis-tool", ""), page = Number(url.searchParams.get("page") ?? "1");
    calls.push(`${url.origin}${url.pathname}`);
    if (url.origin !== "https://api.github.com" || !url.pathname.startsWith("/repos/alice/thesis-tool")) throw new TypeError(`fetch failed: ${address}`);
    const paged = (list) => answer(200, page === 1 ? list : []);
    if (path === "/pulls/7") {
      return answer(200, { number: 7, title, body, state: "open", draft: false, html_url: `${WEB}/pull/7`, created_at: "2026-10-25T09:10:00Z", merged_at: null, closed_at: null,
        merge_commit_sha: null, head: { ref: `agent-m/${JOB}`, sha: HEAD }, base: { ref: "main", sha: BASE } });
    }
    if (path === "/pulls/7/commits") return paged(commits.map((c, i) => ({ sha: c.sha, parents: c.parents.map((sha) => ({ sha })), commit: { message: i ? "the code" : "the tests", committer: { date: `2026-10-25T09:0${i}:00Z` } } })));
    if (path === "/pulls/7/files") return paged([{ filename: "tests/store.test.mjs", status: "added" }, ...headFiles.map((filename) => ({ filename, status: filename === outside ? "added" : "modified" }))]);
    if (path === "/pulls/7/reviews") return paged([]);
    for (const c of commits) {
      if (path === `/commits/${c.sha}/check-runs`) return answer(200, { total_count: page === 1 ? c.checks.length : 0, check_runs: page === 1 ? c.checks : [] });
      if (path === `/commits/${c.sha}/statuses`) return paged([]);
      if (path === `/commits/${c.sha}`) return answer(200, { sha: c.sha, files: page === 1 ? c.files : [] });
    }
    if (path === "/contents/tests/store.test.mjs") return answer(200, NEW_TEST);
    if (path.startsWith("/contents/")) return answer(404, { message: "Not Found" });
    throw new TypeError(`fetch failed: the fake GitHub does not serve ${path}`);
  };
  return { fetch, calls };
}

// The entry, run in the job `agent-m done` of GitHub Actions on the event pull_request, with the fake server in place of the network.
async function onDoneCheck(w, server, { token = TOKEN } = {}) {
  const real = globalThis.fetch;
  globalThis.fetch = server ? server.fetch : async () => { throw new Error("no request may be made"); };
  try {
    return await runEntry("onDoneCheck", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: w.event, GITHUB_WORKSPACE: w.checkout,
      GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "7/merge", GITHUB_SHA: "3".repeat(40), GITHUB_RUN_ID: "4711",
      GITHUB_JOB: "agent-m-done", GITHUB_ACTOR: "alice", GITHUB_STEP_SUMMARY: w.summary, AGENT_M_INSTANCE_COMMIT: "f".repeat(40), ...(token ? { AGENT_M_TOKEN: token } : {}) }, { now: NOW });
  } finally { globalThis.fetch = real; }
}
const summaryOf = (w) => (existsSync(w.summary) ? readFileSync(w.summary, "utf8") : "");

// ---------------------------------------------------------------- the tests

// TST-1210101 · level: unit · module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; THE DEFAULT DEFINITION OF DONE IS THE JOB RULES; UC-027
// given: the pull request #7 of the job JOB-20261025-0900-a1b2 (kind implement, item ITM-001 of MOD-store): its first commit adds only the test file and its CI failed; its head changes src/store/index.mjs, the check node is green and this run's check `agent-m done` is running; the new test TST-001 names what it guards and its module; the product declares kanban, whose one gate stands after the merge, and adds no condition
// input: onDoneCheck on the event pull_request
// expect: outcome `done`, no finding, the summary saying that the Definition of Done holds; the run's summary says so too; the pull request's facts were read from the server
test("onDoneCheck — a pull request meeting every condition of the Definition of Done ends passed", async () => {
  await withCheckout(async (w) => {
    const server = fakeGitHub();
    const status = await onDoneCheck(w, server);
    assert.equal(status.outcome, "done", `${status.summary} ${JSON.stringify(status.findings)}`);
    assert.deepEqual(status.findings, []);
    assert.match(status.summary, /holds/);
    assert.match(summaryOf(w), /holds/);
    assert.ok(server.calls.includes(`${API}/pulls/7/commits`), "the commits of the pull request were read");
  });
});

// TST-1210102 · level: unit · module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; THE DEFAULT DEFINITION OF DONE IS THE JOB RULES; UC-027
// given: the pull request of TST-1210101, whose head also adds src/other/extra.mjs, a file in the folder of no module of the job
// input: onDoneCheck on the event pull_request
// expect: outcome `failed`; one error finding under AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES on src/other/extra.mjs; the run's summary, which the check links on the pull request, names the file and the rule
test("onDoneCheck — a pull request missing a condition ends failed and names it on the pull request", async () => {
  await withCheckout(async (w) => {
    const status = await onDoneCheck(w, fakeGitHub({ outside: "src/other/extra.mjs" }));
    assert.equal(status.outcome, "failed", status.summary);
    assert.equal(status.findings.length, 1, JSON.stringify(status.findings));
    assert.equal(status.findings[0].rule, "AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES");
    assert.equal(status.findings[0].artifact, "src/other/extra.mjs");
    assert.match(summaryOf(w), /src\/other\/extra\.mjs/);
    assert.match(summaryOf(w), /AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES/);
  });
});

// TST-1210103 · level: unit · module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; NO SECRET IN THE REPOSITORY
// given: the checkout of TST-1210101; the person's token AGENT_M_TOKEN is not set
// input: onDoneCheck on the event pull_request
// expect: outcome `not run`, its summary naming AGENT_M_TOKEN; no request is made, nothing is written
test("onDoneCheck — a missing secret ends the entry before anything is written", async () => {
  await withCheckout(async (w) => {
    const status = await onDoneCheck(w, null, { token: null });
    assert.equal(status.outcome, "not run", status.summary);
    assert.match(status.summary, /AGENT_M_TOKEN/);
    assert.equal(summaryOf(w), "");
  });
});

// TST-1210104 · level: unit · module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// given: the checkout of TST-1210101; a pull request whose title and description name no job — a person's own change
// input: onDoneCheck on the event pull_request
// expect: outcome `nothing to do`, the summary saying that the pull request names no implementation job
test("onDoneCheck — a pull request that names no job is no implementation job's", async () => {
  await withCheckout(async (w) => {
    const status = await onDoneCheck(w, fakeGitHub({ title: "Fix a typo", body: "" }));
    assert.equal(status.outcome, "nothing to do", status.summary);
    assert.match(status.summary, /no job/);
  });
});
