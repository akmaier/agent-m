// MOD-workflow-entries' entry onTestsFinished (ITM-1209), as the accepted text of docs/architecture/MOD-workflow-entries.md states it: "in a product, the step after the tests
// of every run of MOD-test-schedule's configuration: the run's result record — the commit, the levels run, the occasion, who ran it, the date, the run's address, `uncommitted`
// when the working tree held changes not in the commit, and each test's outcome with the excerpts of its failures — added to the branch `test-results`. A level that did not run
// is not recorded as passed. On `Moved` it reads the branch again and adds again; a record that cannot be added ends the entry with `failed` [...] It reads the outcomes from the
// run's JUnit XML report, matched to the declarations of the product's tests, and appends the record."; UC-028 step 7.
// Run: node --test tests/workflow-entries-tests-finished.test.mjs
//
// Module: MOD-workflow-entries
// Guards: EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// Level: unit
//
// Deterministic, no network. The product's checkout is a temporary git repository laid out as MOD-test-schedule's generated test job lays it out
// (src/test-schedule/templates/github-job.yml): the workspace is the product's checkout, the report lies in it, and the step runs the entry with AGENT_M_LEVEL (the
// schedule's row), AGENT_M_REPORT and AGENT_M_INSTANCE_COMMIT. The branch `test-results` is served by a fake of GitHub's REST API (the Git database endpoints a commit
// through MOD-repository-hosts uses: the commit, its tree, the branch's reference, a new tree, a new commit, the reference moved fast-forward only), which `fetch` is replaced with.
// The readings, named in the pull request:
//   - The person's Agent M token is read as every product entry reads it, AGENT_M_TOKEN; the record is added through the server's API with it, since the test job's checkout
//     holds the commit under test with the workflow's read-only token.
//   - The occasion is the event's: a push `commit`, a pushed tag `release-candidate`, a pull request `pull-request`, the schedule `nightly`, a start by hand `on-demand`.
//   - Who ran it is the CI service's runner, by the name the runner gives (RUNNER_NAME); the run's address is the run's page.
//   - The levels run are the row's level; the outcomes recorded are those of the declared tests of that level, and each undeclared case, given the run's level, which the
//     record's row requires. A declared test of another level is not recorded, passed or not.
//   - The commit is the one the checkout holds; changes of tracked files make the record `uncommitted`, files the run adds — the report among them — do not.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readDocument } from "../src/documents/index.mjs";
import { resultSchema } from "../src/result-records/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");

// ---------------------------------------------------------------- the fixtures

const NOW = new Date("2026-10-25T09:30:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const API = "https://api.github.com/repos/alice/thesis-tool";
const RUN = "https://github.com/alice/thesis-tool/actions/runs/4711";
const OLD = "runs/0123456789abcdef0123456789abcdef01234567/20261024-1200-commit-ab12.md";

const declared = (id, level, expect) => [`// ${id} · level: ${level} · module: MOD-store`, "// guards: A LOAN HAS A DUE DATE", "// given: a loan", "// input: its date",
  `// expect: ${expect}`, `test("${id} a loan", () => {});`, ""].join("\n");
const TESTS = {
  "tests/store.test.mjs": ["// Module: MOD-store", "// Level: unit", "", declared("TST-001", "unit", "the due date"), declared("TST-002", "unit", "fourteen days"),
    declared("TST-003", "unit", "a reminder")].join("\n"),
  "tests/store-flow.test.mjs": ["// Module: MOD-store", "// Level: component", "", declared("TST-004", "component", "the loan is stored")].join("\n"),
};
// TST-001 passes; TST-002 fails with a message and a log holding a bar and a second line; TST-003 has no case; TST-004, of the level component, passes; one case names no test.
const REPORT = ["<?xml version=\"1.0\" encoding=\"utf-8\"?>", "<testsuites>", "<testsuite name=\"tests/store.test.mjs\">",
  "<testcase name=\"TST-001 a loan\" time=\"0.01\"/>",
  "<testcase name=\"TST-002 a loan\" time=\"0.01\"><failure message=\"expected 14, got 7\">AssertionError: expected 14 | got 7\n    at tests/store.test.mjs:12</failure></testcase>",
  "<testcase name=\"TST-004 a loan\" time=\"0.01\"/>",
  "<testcase name=\"a stray case\" time=\"0.01\"/>", "</testsuite>", "</testsuites>"].join("\n");
const UNIT_ONLY = "<testsuites><testsuite name=\"s\"><testcase name=\"TST-001 a loan\"/></testsuite></testsuites>";
const SKIPPED = ["<testsuites><testsuite name=\"s\">", "<testcase name=\"TST-001 a loan\"><skipped/></testcase>", "<testcase name=\"TST-002 a loan\"><skipped/></testcase>",
  "<testcase name=\"TST-003 a loan\"><skipped/></testcase>", "</testsuite></testsuites>"].join("\n");

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

// The product's checkout, as the test job's checkout step leaves it: one commit, the report written into it by the tests' step.
async function withCheckout(report, run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-tests-finished-"));
  const checkout = join(root, "product");
  try {
    mkdirSync(checkout);
    git(checkout, "init", "-q", "-b", "main");
    git(checkout, "config", "user.name", "Seed");
    git(checkout, "config", "user.email", "seed@example.org");
    write(checkout, { "README.md": "# Thesis tool\n", "src/store/index.mjs": "export const due = 14;\n", ...TESTS });
    git(checkout, "add", "-A");
    git(checkout, "commit", "-q", "-m", "first");
    if (report !== null) write(checkout, { "agent-m-report.xml": report });
    return await run({ checkout, head: git(checkout, "rev-parse", "HEAD") });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// A fake of GitHub's REST API for the repository alice/thesis-tool, which holds the branch test-results. `refuseWrite` answers the new tree with that status;
// `moveOnce` lands another run's record on the branch just before the first move of the reference.
function fakeGitHub({ refuseWrite = null, moveOnce = null } = {}) {
  let made = 0;
  const commits = new Map(), trees = new Map(), calls = [];
  const id = () => createHash("sha1").update(`fake ${++made}`).digest("hex");
  const commitOf = (tree, parent) => { const sha = id(); trees.set(sha, tree); commits.set(sha, { tree: sha, parent }); return sha; };
  const state = { head: commitOf(new Map([["README.md", "# Test results\n"], [OLD, "an older record\n"]]), null), calls, written: [] };
  state.files = (at = state.head) => trees.get(commits.get(at).tree);
  const answer = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  let moved = false;
  state.fetch = async (address, init = {}) => {
    const url = new URL(String(address)), method = init.method ?? "GET", path = `${url.origin}${url.pathname}`;
    calls.push(`${method} ${path}`);
    const body = init.body ? JSON.parse(init.body) : null;
    if (method === "GET" && (path === `${API}/commits/test-results` || commits.has(path.slice(`${API}/commits/`.length)))) {
      const sha = path.endsWith("/test-results") ? state.head : path.slice(`${API}/commits/`.length);
      return answer(200, { sha });
    }
    if (method === "GET" && path.startsWith(`${API}/git/trees/`)) {
      const tree = trees.get(path.slice(`${API}/git/trees/`.length));
      return tree ? answer(200, { tree: [...tree.keys()].map((p) => ({ path: p, type: "blob", sha: createHash("sha1").update(tree.get(p)).digest("hex") })) }) : answer(404, { message: "Not Found" });
    }
    if (method === "GET" && path === `${API}/git/ref/heads/test-results`) return answer(200, { object: { sha: state.head } });
    if (method === "GET" && path.startsWith(`${API}/git/commits/`)) {
      const sha = path.slice(`${API}/git/commits/`.length);
      return commits.has(sha) ? answer(200, { sha, tree: { sha: commits.get(sha).tree } }) : answer(404, { message: "Not Found" });
    }
    if (method === "POST" && path === `${API}/git/trees`) {
      if (refuseWrite) return answer(refuseWrite, { message: "Resource not accessible by personal access token" });
      const tree = new Map(trees.get(body.base_tree));
      for (const entry of body.tree) tree.set(entry.path, entry.content);
      const sha = id();
      trees.set(sha, tree);
      return answer(201, { sha });
    }
    if (method === "POST" && path === `${API}/git/commits`) {
      const sha = id();
      commits.set(sha, { tree: body.tree, parent: body.parents[0] });
      state.written.push(body.message);
      return answer(201, { sha, html_url: `https://github.com/alice/thesis-tool/commit/${sha}` });
    }
    if (method === "PATCH" && path === `${API}/git/refs/heads/test-results`) {
      if (moveOnce && !moved) {
        moved = true;
        state.head = commitOf(new Map([...state.files(), [moveOnce, "another run's record\n"]]), state.head);
      }
      if (commits.get(body.sha)?.parent !== state.head || body.force) return answer(422, { message: "Update is not a fast forward" });
      state.head = body.sha;
      return answer(200, { object: { sha: body.sha } });
    }
    throw new TypeError(`fetch failed: the fake GitHub does not serve ${method} ${path}`);
  };
  return state;
}

// The entry, run in the test job's environment of GitHub Actions, with the fake server in place of the network.
async function onTestsFinished(w, server, { event = "push", refType = "branch", level = "unit", token = TOKEN, report = "agent-m-report.xml" } = {}) {
  const real = globalThis.fetch;
  globalThis.fetch = server ? server.fetch : async () => { throw new Error("no request may be made"); };
  try {
    return await runEntry("onTestsFinished", { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: event, GITHUB_REF_TYPE: refType, GITHUB_WORKSPACE: w.checkout,
      GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: refType === "tag" ? "v2026.4.0-rc.1" : "main", GITHUB_SHA: w.head,
      GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice", RUNNER_NAME: "GitHub Actions 7", AGENT_M_LEVEL: level, AGENT_M_INSTANCE_COMMIT: "f".repeat(40),
      ...(report ? { AGENT_M_REPORT: report } : {}), ...(token ? { AGENT_M_TOKEN: token } : {}) }, { now: NOW });
  } finally { globalThis.fetch = real; }
}

// The records the run added: the paths under runs/ that the branch holds now and did not hold before, each read with the record's schema.
function added(server) {
  return [...server.files().keys()].filter((path) => path.startsWith("runs/") && path !== OLD && !server.files().get(path).startsWith("another run"))
    .map((path) => readDocument(resultSchema.run, path, server.files().get(path)));
}
const rows = (record, heading) => record.sections.find((section) => section.heading === heading)?.rows.map((row) => row.cells) ?? [];

// ---------------------------------------------------------------- the tests

// TST-1209101 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a clean checkout of the product at one commit with the unit tests TST-001, TST-002, TST-003 and the component test TST-004; its JUnit report: TST-001 passed, TST-002 failed ("expected 14, got 7", a log of two lines with a bar), TST-004 passed, an undeclared case "a stray case"; the branch test-results holds README.md and one older record; the time 2026-10-25 09:30 UTC
// input: onTestsFinished after a push, the row unit, run 4711 on the runner "GitHub Actions 7"
// expect: outcome `done`; one commit adds exactly one file runs/<commit>/20261025-0930-commit-<4 hex>.md, whose parent is the branch's head, every other file unchanged; its front matter commit <the checkout's commit>, levels [unit], occasion commit, participant "GitHub Actions 7", date "2026-10-25 09:30 UTC", run <the run's page>, no uncommitted;
//         its outcomes TST-001 unit passed, TST-002 unit failed, TST-003 unit not run, "a stray case" unit undeclared, and no row of TST-004; its failures name TST-002 with the expected "fourteen days", the observed "expected 14, got 7" and a log holding "expected 14 | got 7" and "store.test.mjs:12"; the token stands nowhere in it
test("onTestsFinished — a run's record is added to test-results with its commit, levels, occasion, runner, date, run address and outcomes", async () => {
  await withCheckout(REPORT, async (w) => {
    const server = fakeGitHub();
    const before = server.head, files = new Map(server.files());
    const status = await onTestsFinished(w, server);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(server.written.length, 1, "one commit");
    assert.equal([...server.files().keys()].length, files.size + 1, "one file added");
    for (const [path, text] of files) assert.equal(server.files().get(path), text, `${path} unchanged`);
    assert.notEqual(server.head, before);
    const [record] = added(server);
    assert.match(record.path, new RegExp(`^runs/${w.head}/20261025-0930-commit-[0-9a-f]{4}\\.md$`));
    assert.deepEqual({ ...record.fields }, { commit: w.head, levels: ["unit"], occasion: "commit", participant: "GitHub Actions 7", date: "2026-10-25 09:30 UTC", run: RUN });
    const outcomes = rows(record, "## Outcomes");
    const of = (test) => outcomes.find((row) => row.Test === test);
    assert.equal(of("TST-001")?.Outcome, "passed");
    assert.equal(of("TST-002")?.Outcome, "failed");
    assert.equal(of("TST-003")?.Outcome, "not run");
    assert.deepEqual([of("a stray case")?.Level, of("a stray case")?.Outcome], ["unit", "undeclared"]);
    for (const test of ["TST-001", "TST-002", "TST-003"]) assert.equal(of(test).Level, "unit", test);
    assert.equal(of("TST-004"), undefined, "a test of a level not run is not recorded");
    const [failure] = rows(record, "## Failures");
    assert.equal(failure.Test, "TST-002");
    assert.equal(failure.Expected, "fourteen days");
    assert.equal(failure.Observed, "expected 14, got 7");
    assert.ok(failure.Log.includes("expected 14 | got 7") && failure.Log.includes("store.test.mjs:12"), failure.Log);
    assert.ok(!server.files().get(record.path).includes(TOKEN));
    assert.equal(git(w.checkout, "rev-parse", "HEAD"), w.head, "the checkout is left as it was");
  });
});

// TST-1209102 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the same checkout; (a) a report whose cases of TST-001, TST-002 and TST-003 are all skipped; (b) a report that holds no case of the component test TST-004 but a passing one of TST-001
// input: onTestsFinished (a) for the row unit; (b) for the row component
// expect: (a) `done`, levels [unit], TST-001, TST-002 and TST-003 each `not run`, none passed; (b) `done`, levels [component], TST-004 `not run`, and no row of a unit test — a level that did not run is not recorded as passed
test("onTestsFinished — a level that did not run is not recorded as passed", async () => {
  await withCheckout(SKIPPED, async (w) => {
    const server = fakeGitHub();
    const status = await onTestsFinished(w, server);
    assert.equal(status.outcome, "done", status.summary);
    const [record] = added(server);
    assert.deepEqual(record.fields.levels, ["unit"]);
    const outcomes = rows(record, "## Outcomes");
    for (const test of ["TST-001", "TST-002", "TST-003"]) assert.equal(outcomes.find((row) => row.Test === test)?.Outcome, "not run", test);
    assert.ok(!outcomes.some((row) => row.Outcome === "passed"));
  });
  await withCheckout(UNIT_ONLY, async (w) => {
    const server = fakeGitHub();
    const status = await onTestsFinished(w, server, { level: "component" });
    assert.equal(status.outcome, "done", status.summary);
    const [record] = added(server);
    assert.deepEqual(record.fields.levels, ["component"]);
    const outcomes = rows(record, "## Outcomes");
    assert.equal(outcomes.find((row) => row.Test === "TST-004")?.Outcome, "not run");
    assert.ok(!outcomes.some((row) => row.Level === "unit"), "no outcome of the level unit, which did not run");
  });
});

// TST-1209103 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the checkout and report of TST-1209101
// input: onTestsFinished on the events pull_request, schedule, workflow_dispatch, and a push of the tag v2026.4.0-rc.1
// expect: each `done`; the records' occasions pull-request, nightly, on-demand and release-candidate, each in its record's path
test("onTestsFinished — the occasion is the event's", async () => {
  for (const [event, refType, occasion] of [["pull_request", "branch", "pull-request"], ["schedule", "branch", "nightly"], ["workflow_dispatch", "branch", "on-demand"], ["push", "tag", "release-candidate"]]) {
    await withCheckout(REPORT, async (w) => {
      const server = fakeGitHub();
      const status = await onTestsFinished(w, server, { event, refType });
      assert.equal(status.outcome, "done", `${event}: ${status.summary}`);
      const [record] = added(server);
      assert.equal(record.fields.occasion, occasion, event);
      assert.match(record.path, new RegExp(`-${occasion}-[0-9a-f]{4}\\.md$`));
    });
  }
});

// TST-1209104 · level: unit · module: MOD-workflow-entries
// guards: A RESULT RECORD IS NEVER REWRITTEN; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: the checkout and report of TST-1209101; the branch test-results moves on — another run's record lands — after the entry read it and before its reference is moved
// input: onTestsFinished
// expect: `done`; the branch holds the other run's record unchanged and this run's record, added on top of it; nothing was forced
test("onTestsFinished — on Moved it reads the branch again and adds again", async () => {
  await withCheckout(REPORT, async (w) => {
    const other = `runs/${"e".repeat(40)}/20261025-0929-commit-cd34.md`;
    const server = fakeGitHub({ moveOnce: other });
    const status = await onTestsFinished(w, server);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(server.files().get(other), "another run's record\n", "the other run's record is kept");
    assert.equal(added(server).length, 1, "this run's record is added");
    assert.ok(server.calls.filter((call) => call === `PATCH ${API}/git/refs/heads/test-results`).length >= 2, "the reference was moved again after the refusal");
  });
});

// TST-1209105 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; A RESULT RECORD IS NEVER REWRITTEN
// given: the checkout and report of TST-1209101; the server refuses the write with 403 "Resource not accessible by personal access token"
// input: onTestsFinished
// expect: outcome `failed`, its summary saying that the record was not added; the branch test-results is unchanged
test("onTestsFinished — a record that cannot be added ends the entry failed", async () => {
  await withCheckout(REPORT, async (w) => {
    const server = fakeGitHub({ refuseWrite: 403 });
    const before = server.head;
    const status = await onTestsFinished(w, server);
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /not added/);
    assert.equal(server.head, before);
  });
});

// TST-1209106 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; NO SECRET IN THE REPOSITORY
// given: the checkout and report of TST-1209101; the person's token AGENT_M_TOKEN is not set
// input: onTestsFinished
// expect: outcome `not run`, its summary naming AGENT_M_TOKEN; no request is made, nothing is written
test("onTestsFinished — a missing secret ends the entry before anything is written", async () => {
  await withCheckout(REPORT, async (w) => {
    const status = await onTestsFinished(w, null, { token: null });
    assert.equal(status.outcome, "not run", status.summary);
    assert.match(status.summary, /AGENT_M_TOKEN/);
  });
});

// TST-1209107 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: a checkout in which the tests' step wrote no report; the token is set
// input: onTestsFinished (a) with AGENT_M_REPORT naming agent-m-report.xml, which does not exist; (b) without AGENT_M_REPORT
// expect: each `not run`, the summary naming the report (a: its path agent-m-report.xml); no request is made, nothing is written
test("onTestsFinished — a missing report ends the entry before anything is written", async () => {
  await withCheckout(null, async (w) => {
    const missing = await onTestsFinished(w, null);
    assert.equal(missing.outcome, "not run", missing.summary);
    assert.match(missing.summary, /agent-m-report\.xml/);
    const unnamed = await onTestsFinished(w, null, { report: null });
    assert.equal(unnamed.outcome, "not run", unnamed.summary);
    assert.match(unnamed.summary, /report/);
  });
});

// TST-1209108 · level: unit · module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the checkout and report of TST-1209101, in which the tracked file src/store/index.mjs was changed after the commit
// input: onTestsFinished
// expect: `done`; the record's front matter holds uncommitted: true; in TST-1209101 — the report alone added to the working tree — it holds none
test("onTestsFinished — a working tree with changes not in the commit makes the record uncommitted", async () => {
  await withCheckout(REPORT, async (w) => {
    writeFileSync(join(w.checkout, "src/store/index.mjs"), "export const due = 7;\n");
    const server = fakeGitHub();
    const status = await onTestsFinished(w, server);
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(added(server)[0].fields.uncommitted, "true");
  });
});
