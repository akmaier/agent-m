// ITM-476: the CI entry boundary, using the public owners of reports, records and the Definition of Done.
// Module: MOD-workflow-entries
// Level: component
// Guards: UC-027; UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// Run: node --test tests/workflow-entries-tests-and-done.test.mjs
// Author/executor: developer-terra-b (this Codex session; runtime model unavailable).
//
// The fixture follows workflow-entries-job-workflow.test.mjs: workspace/product and workspace/instance, bare origins,
// real local-clone writes, and recorded fetch replies for the server-only operations. No real service or credential.
// The workflow-variable spelling is implementation wiring of the accepted CiEnvironment, not a new module interface:
// AGENT_M_JUNIT_REPORT (path), AGENT_M_TEST_COMMIT (tested SHA, not the instance SHA), AGENT_M_LEVELS (space-separated),
// AGENT_M_OCCASION and AGENT_M_PARTICIPANT; AGENT_M_JOB selects the existing job record for the DoD check. Its worksOn
// item supplies the assigned modules. GitLab uses its predefined CI_* values and AGENT_M_INSTANCE/AGENT_M_COMMIT,
// as the existing MOD-runtimes template does. The schedule generator can pass these variables without a new contract.
// Git configuration is isolated. The real CLI is spawned with a small explicit environment, never process.env wholesale.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runEntry } from "../src/workflow-entries/main.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { artifactSchemaOf, readDocument } from "../src/documents/index.mjs";
import { catalogue } from "../src/model-catalogue/index.mjs";
import { declarationSchema, doneCheck, gateSchema, workflowOf } from "../src/product-process/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { parseOutcomes, resultSchema, resultsAt } from "../src/result-records/index.mjs";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAIN = join(ROOT, "src/workflow-entries/main.mjs");
const NOW = new Date("2026-10-14T22:30:00Z");
const TOKEN = "fixture-person-token-not-a-real-credential";
const JOB = "JOB-20261014-2200-a1b2";
const MODEL = "src/model-catalogue/models/scrum.md";
const FIRST = "1".repeat(40), BASE = "b".repeat(40);
const TEST = "tests/widget.test.mjs", SOURCE = "src/widget/index.mjs";
const RULE = "EVERY TEST RUN LEAVES A RESULT RECORD";
const declaration = (id, level, expected) => [
  `// ${id}`, `// level: ${level}`, "// module: MOD-widget", `// guards: ${RULE}`,
  "// given: a widget", "// input: its value", `// expect: ${expected}`, `test('${id}: widget', () => {});`, "",
].join("\n");
const DECLARATIONS = declaration("TST-900901", "unit", "one") + declaration("TST-900902", "component", "two")
  + declaration("TST-900903", "unit", "three") + declaration("TST-900904", "unit", "four")
  + declaration("TST-900905", "system", "five");
const REPORT = '<testsuites><testsuite name="widget">'
  + '<testcase name="TST-900901: widget"/>'
  + '<testcase name="TST-900902: widget"><failure message="got zero">expected two, got zero</failure></testcase>'
  + '<testcase name="TST-900903: widget"><skipped/></testcase>'
  + '</testsuite></testsuites>';
const moduleText = "---\nid: MOD-widget\ntitle: Widget\nfolder: src/widget/\nrealises:\nfollows:\n  - ARC-043\nuses:\nprovides:\n---\n# MOD-widget Widget\n";
const modulePath = "docs/architecture/MOD-widget.md";
const itemPath = "docs/backlog/ITM-999-widget.md";
const itemText = "---\nid: ITM-999\ntitle: Widget\nlevel: module\nrealises:\n  - UC-028\nmodules:\n  - MOD-widget\nbuilds_on:\ntests:\n  - unit\norigin:\n  - UC-028\n---\n# ITM-999 Widget\n\n## Outcome\n\nWidget.\n\n## Acceptance\n\nTested.\n";
const addressOf = (service) => service === "github" ? "https://github.com/alice/widget" : "https://gitlab.example.test/team/widget";
const git = (cwd, ...args) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, `fixture git ${args[0]}: ${result.stderr}`);
  return result.stdout.trim();
};
function write(root, files) {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
}
function repository(root, name, files, clone) {
  const origin = join(root, `${name}.git`), seed = join(root, `${name}-seed`);
  git(root, "init", "-q", "--bare", "-b", "main", origin);
  git(root, "clone", "-q", origin, seed);
  git(seed, "config", "user.name", "Fixture");
  git(seed, "config", "user.email", "fixture@example.test");
  write(seed, files);
  git(seed, "add", "-A");
  git(seed, "commit", "-q", "-m", "fixture");
  git(seed, "push", "-q", "origin", "HEAD:main");
  mkdirSync(dirname(clone), { recursive: true });
  git(root, "clone", "-q", origin, clone);
  git(clone, "config", "user.name", "Fixture CI");
  git(clone, "config", "user.email", "ci@example.test");
  return { origin, seed, clone };
}
async function workspace(run) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-476-entries-")), ws = join(root, "ws");
  try {
    const instance = repository(root, "instance", { "SPEC.md": "# Fixture instance\n", [MODEL]: readFileSync(join(ROOT, MODEL), "utf8") }, join(ws, "instance"));
    const instanceCommit = git(instance.clone, "rev-parse", "HEAD");
    const processText = `---\nmodel: scrum\nmodel_file: ${MODEL}\nmodel_version: ${instanceCommit}\n---\n# Product process\n\n## Practices\n\n- none\n\n## Branches\n\n| Phase or time box | Branch |\n|---|---|\n\n## Definition of Done\n\ncheck: widget-ci\n`;
    const record = startRecord({ id: JOB, kind: "implement", worksOn: ["ITM-999"], participant: "fixture-dev", model: "fixture", route: "ci hosted",
      run: null, retries: null, startedBy: "alice", start: NOW, agentM: { version: "unreleased", commit: instanceCommit }, inputs: [], limit: 1, destinations: [], params: {} });
    const product = repository(root, "product", { "SPEC.md": "# Widget\n", "docs/process.md": processText, [TEST]: DECLARATIONS,
      [SOURCE]: "export const widget = 1;\n", [modulePath]: moduleText, [itemPath]: itemText, [record.path]: record.text }, join(ws, "product"));
    const head = git(product.clone, "rev-parse", "HEAD");
    const host = connect(parseAddress(addressOf("github")), { clone: instance.clone });
    const cat = await catalogue(await host.readSnapshot(instanceCommit));
    const workflow = workflowOf(readDocument(declarationSchema, "docs/process.md", processText), cat.models.find((m) => m.path === MODEL), [], "# Fixture instance\n");
    const gates = workflow.gates.map((gate, index) => {
      const path = `docs/gates/20261014-220${index}-fixture-abcd.md`;
      const text = `---\ngate: ${gate.name}\njob: ${JOB}\ndecider: ${gate.decider.startsWith("check:") ? gate.decider : "fixture-po"}\nrole: ${gate.decider.startsWith("check:") ? "check" : gate.decider}\ndecision: passed\non:\n  - ${head}\ndate: 2026-10-14 22:30 UTC\n---\n# Gate\n\n## Reason\n\nFixture passed.\n`;
      return { path, text, document: readDocument(gateSchema, path, text) };
    });
    write(product.clone, Object.fromEntries(gates.map(({ path, text }) => [path, text])));
    git(product.clone, "add", "docs/gates");
    git(product.clone, "commit", "-q", "-m", "fixture gates");
    git(product.clone, "push", "-q", "origin", "HEAD:main");
    git(product.clone, "branch", "test-results");
    git(product.clone, "push", "-q", "origin", "test-results");
    const report = join(root, "report.xml");
    writeFileSync(report, REPORT);
    await run({ root, ws, instance, product, instanceCommit, head, workflow, gates, report,
      main: git(product.origin, "rev-parse", "main"), results: git(product.origin, "rev-parse", "test-results") });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
function environment(w, service = "github", extra = {}) {
  const common = { AGENT_M_PRODUCT_DIR: w.product.clone, AGENT_M_TOKEN_NAME: "PERSON_TOKEN", AGENT_M_TOKEN: TOKEN,
    AGENT_M_KEY_NAMES: "", AGENT_M_RUNNER: "hosted", AGENT_M_INSTANCE: "alice/agent-m", AGENT_M_COMMIT: w.instanceCommit,
    AGENT_M_JUNIT_REPORT: w.report, AGENT_M_TEST_COMMIT: w.head, AGENT_M_LEVELS: "unit component", AGENT_M_OCCASION: "pull-request",
    AGENT_M_PARTICIPANT: `${service} fixture runner`, AGENT_M_JOB: JOB };
  const defaults = service === "github" ? { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "pull_request", GITHUB_WORKSPACE: w.ws,
    GITHUB_SERVER_URL: "https://github.com", GITHUB_REPOSITORY: "alice/widget", GITHUB_REF_NAME: "feature/widget", GITHUB_SHA: w.head,
    GITHUB_RUN_ID: "4711", GITHUB_ACTOR: "alice" }
    : { GITLAB_CI: "true", CI_PIPELINE_SOURCE: "merge_request_event", CI_PROJECT_DIR: w.product.clone,
      CI_PROJECT_URL: addressOf(service), CI_SERVER_URL: "https://gitlab.example.test", CI_PROJECT_PATH: "team/widget",
      CI_COMMIT_SHA: w.head, CI_COMMIT_REF_NAME: "feature/widget", CI_MERGE_REQUEST_IID: "7", CI_PIPELINE_ID: "4711",
      CI_PIPELINE_URL: `${addressOf(service)}/-/pipelines/4711`, GITLAB_USER_LOGIN: "alice" };
  return { ...common, ...defaults, ...extra };
}
const run = (name, w, service = "github", extra = {}) => runEntry(name, environment(w, service, extra), { now: NOW });
const runUrl = (service) => `${addressOf(service)}${service === "github" ? "/actions/runs/" : "/-/pipelines/"}4711`;
function resultFiles(w) {
  return git(w.product.origin, "ls-tree", "-r", "--name-only", "test-results").split("\n").filter((path) => path.startsWith("runs/"));
}
function recorded(w) {
  const paths = resultFiles(w);
  assert.equal(paths.length, 1, "exactly one actual result record committed");
  const text = git(w.product.origin, "show", `test-results:${paths[0]}`) + "\n";
  return { path: paths[0], text, document: readDocument(resultSchema.run, paths[0], text) };
}
function unchanged(w) {
  assert.equal(git(w.product.origin, "rev-parse", "main"), w.main, "default branch unchanged");
  assert.equal(git(w.product.clone, "rev-parse", "HEAD"), w.main, "checkout head unchanged");
}
async function assertRecord(w, service, uncommitted = false) {
  const { path, document, text } = recorded(w);
  assert.match(path, new RegExp(`^runs/${w.head}/20261014-2230-pull-request-[0-9a-f]{4}\\.md$`));
  assert.equal(document.fields.commit, w.head, "tested product commit, not the instance or later gate commit");
  assert.deepEqual(document.fields.levels, ["unit", "component"]);
  assert.equal(document.fields.occasion, "pull-request");
  assert.equal(document.fields.participant, `${service} fixture runner`);
  assert.equal(document.fields.date, "2026-10-14 22:30 UTC");
  assert.equal(document.fields.run, runUrl(service));
  assert.equal(document.fields.uncommitted ?? null, uncommitted ? "true" : null);
  const outcomes = document.sections.find((s) => s.heading === "## Outcomes").rows.map((r) => r.cells);
  assert.equal(outcomes.find((r) => r.Test === "TST-900901").Outcome, "passed");
  assert.equal(outcomes.find((r) => r.Test === "TST-900902").Outcome, "failed");
  for (const id of ["TST-900903", "TST-900904"]) assert.equal(outcomes.find((r) => r.Test === id).Outcome, "not run");
  assert.ok(!outcomes.some((r) => r.Level === "system" && r.Outcome === "passed"), "an unrun level is never passed");
  const failure = document.sections.find((s) => s.heading === "## Failures").rows.find((r) => r.cells.Test === "TST-900902").cells;
  assert.equal(failure.Expected, "two");
  assert.match(failure.Observed, /zero/);
  assert.match(failure.Log, /expected two, got zero/);
  assert.ok(!text.includes(TOKEN));
  const host = connect(parseAddress(addressOf(service)), { clone: w.product.origin });
  const summary = await resultsAt(await host.readSnapshot("test-results"), w.head, [{ id: "TST-900901", level: "unit" }]);
  assert.equal(summary[0].passed, uncommitted ? 0 : 1, "dirty evidence is shown but not counted for the commit");
  unchanged(w);
}

// TST-476300
// level: component
// module: MOD-workflow-entries
// guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY
// given: the existing public parser accepts the fixture XML, a clean GitHub checkout and a test-results branch
// input: runEntry(onTestsFinished) with the report path, tested SHA, levels, occasion, runner and CI run address
// expect: done; one real record with exact metadata, pass/failure/skipped/missing outcomes and failure excerpts; default branch untouched
test("TST-476300: GitHub test completion appends the actual report with exact run metadata", async () => {
  const outcomes = parseOutcomes(REPORT, testDeclarations(TEST, DECLARATIONS));
  assert.equal(outcomes.find((o) => o.test === "TST-900901").outcome, "passed", "known positive: public report parser");
  assert.equal(outcomes.find((o) => o.test === "TST-900902").failure.expected, "two");
  await workspace(async (w) => {
    const status = await run("onTestsFinished", w);
    assert.equal(status.outcome, "done", status.summary);
    await assertRecord(w, "github");
  });
});

// TST-476301
// level: component
// module: MOD-workflow-entries
// guards: GITLAB PRODUCTS ARE SUPPORTED; UC-028; EVERY TEST RUN LEAVES A RESULT RECORD
// given: the same clean checkout and report, with only GitLab CI_* and existing Agent M workflow variables
// input: runEntry(onTestsFinished) in the GitLab environment
// expect: done; identical report outcomes, the tested product SHA and the GitLab pipeline URL, no GitHub environment required
test("TST-476301: GitLab test completion uses its accepted service environment", async () => workspace(async (w) => {
  const status = await run("onTestsFinished", w, "gitlab");
  assert.equal(status.outcome, "done", status.summary);
  await assertRecord(w, "gitlab");
}));

// TST-476302
// level: component
// module: MOD-workflow-entries
// guards: UC-028 6a; EVERY TEST RUN LEAVES A RESULT RECORD
// given: a tracked product file differs from the tested commit in the working tree
// input: runEntry(onTestsFinished)
// expect: done with an uncommitted record; its passing outcome does not count as a result of the tested commit; dirty file unchanged
test("TST-476302: a dirty checkout is recorded as uncommitted, never counted as clean evidence", async () => workspace(async (w) => {
  const dirty = "export const widget = 99;\n";
  writeFileSync(join(w.product.clone, SOURCE), dirty);
  const status = await run("onTestsFinished", w);
  assert.equal(status.outcome, "done", status.summary);
  await assertRecord(w, "github", true);
  assert.equal(readFileSync(join(w.product.clone, SOURCE), "utf8"), dirty);
}));

// TST-476303
// level: component
// module: MOD-workflow-entries
// guards: UC-028; EVERY TEST RUN LEAVES A RESULT RECORD
// given: a malformed report, then a report path that does not exist, with otherwise complete metadata
// input: runEntry(onTestsFinished) for each
// expect: failed, naming the report problem; no result record, result-branch commit or default-branch change
test("TST-476303: an unreadable or missing report cannot produce green or fabricated evidence", async () => workspace(async (w) => {
  writeFileSync(w.report, "<testsuite><testcase></testsuite>");
  for (const path of [w.report, join(w.root, "missing.xml")]) {
    const status = await run("onTestsFinished", w, "github", { AGENT_M_JUNIT_REPORT: path });
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /report|xml|ENOENT|read/i);
    assert.deepEqual(resultFiles(w), []);
    assert.equal(git(w.product.origin, "rev-parse", "test-results"), w.results);
    unchanged(w);
  }
}));

// TST-476304
// level: component
// module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-028
// given: a valid report but no person's token on either CI service
// input: runEntry(onTestsFinished), then the actual Node CLI, without AGENT_M_TOKEN
// expect: not run naming PERSON_TOKEN before any write; CLI exits one with that status rather than claiming the entry is unknown
test("TST-476304: the public entry and CLI name a missing secret and write nothing", async () => workspace(async (w) => {
  for (const service of ["github", "gitlab"]) {
    const env = environment(w, service, { AGENT_M_TOKEN: "" });
    const status = await runEntry("onTestsFinished", env, { now: NOW });
    assert.equal(status.outcome, "not run", status.summary);
    assert.match(status.summary, /PERSON_TOKEN/);
    const cli = spawnSync(process.execPath, [MAIN, "onTestsFinished"], { cwd: w.instance.clone,
      env: { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0", ...env }, encoding: "utf8", timeout: 30_000 });
    assert.equal(cli.status, 1, cli.stderr);
    assert.match(cli.stdout, /onTestsFinished: not run[^]*PERSON_TOKEN/);
    assert.deepEqual(resultFiles(w), []);
    unchanged(w);
  }
}));

// TST-476305
// level: component
// module: MOD-workflow-entries
// guards: A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a real pre-push race advances test-results once with an unrelated file after the entry read it
// input: runEntry(onTestsFinished)
// expect: done after reading the moved branch again; exactly one new run record appended on the competing commit, preserving that file
test("TST-476305: Moved rereads the result branch and appends without losing another run", async () => workspace(async (w) => {
  git(w.product.seed, "fetch", "-q", "origin", "test-results");
  git(w.product.seed, "checkout", "-q", "-b", "test-results", "origin/test-results");
  write(w.product.seed, { "other-run.md": "immutable other runner evidence\n" });
  git(w.product.seed, "add", "other-run.md");
  git(w.product.seed, "commit", "-q", "-m", "competing result");
  const competitor = git(w.product.seed, "rev-parse", "HEAD");
  const hook = join(w.product.clone, ".git/hooks/pre-push"), marker = join(w.root, "raced");
  const quote = (s) => `'${s.replaceAll("'", "'\\''")}'`;
  writeFileSync(hook, `#!/bin/sh\nif test ! -e ${quote(marker)}; then\n  touch ${quote(marker)}\n  git -C ${quote(w.product.seed)} push -q origin HEAD:test-results || exit 1\nfi\n`);
  chmodSync(hook, 0o755);
  const status = await run("onTestsFinished", w);
  assert.equal(status.outcome, "done", status.summary);
  await assertRecord(w, "github");
  assert.equal(git(w.product.origin, "show", "test-results:other-run.md"), "immutable other runner evidence");
  assert.equal(git(w.product.origin, "rev-parse", "test-results^"), competitor, "retry appends on the actual new head");
}));

// TST-476306
// level: component
// module: MOD-workflow-entries
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: a valid report but git cannot push the appended result (the fixture pre-push hook fails)
// input: runEntry(onTestsFinished)
// expect: failed with the push failure; no result visible on the origin and no default-branch change
test("TST-476306: a result that cannot be persisted fails the CI entry", async () => workspace(async (w) => {
  const hook = join(w.product.clone, ".git/hooks/pre-push");
  writeFileSync(hook, "#!/bin/sh\necho fixture-result-storage-unavailable >&2\nexit 1\n");
  chmodSync(hook, 0o755);
  const status = await run("onTestsFinished", w);
  assert.equal(status.outcome, "failed", status.summary);
  assert.match(status.summary, /fixture-result-storage-unavailable/);
  assert.deepEqual(resultFiles(w), []);
  assert.equal(git(w.product.origin, "rev-parse", "test-results"), w.results);
  unchanged(w);
}));

// Recorded REST facts, using the route shapes already exercised by repository-hosts-pull-requests.test.mjs.
function factsServer(w, service, { broken = false, refused = false } = {}) {
  const calls = [], head = w.head, firstFiles = [TEST], changed = [TEST, SOURCE];
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
  const contents = { [TEST]: DECLARATIONS, [SOURCE]: "export const widget = 1;\n" };
  const prefix = service === "github" ? "/repos/alice/widget" : "/api/v4/projects/team%2Fwidget";
  const pull = service === "github" ? { number: 7, title: `ITM-999 ${JOB}`, state: "open", draft: false,
    html_url: `${addressOf(service)}/pull/7`, created_at: NOW.toISOString(), head: { ref: "feature/widget", sha: head }, base: { ref: "main", sha: BASE } }
    : { iid: 7, title: `ITM-999 ${JOB}`, state: "opened", draft: false, web_url: `${addressOf(service)}/-/merge_requests/7`,
      created_at: NOW.toISOString(), source_branch: "feature/widget", target_branch: "main", sha: head, diff_refs: { base_sha: BASE } };
  const checked = (sha) => sha === FIRST ? "failure" : "success";
  const api = async (input, init = {}) => {
    const url = new URL(String(input)), path = url.pathname.slice(prefix.length);
    calls.push({ url: url.href, method: init.method ?? "GET", headers: new Headers(init.headers) });
    assert.equal(url.origin, service === "github" ? "https://api.github.com" : "https://gitlab.example.test");
    assert.equal(init.method ?? "GET", "GET", "the DoD entry reads facts, never merges or writes");
    if (refused) return json({ message: "fixture-facts-refused" }, 503);
    if (service === "github") {
      if (path === "/pulls/7") return json(pull);
      if (path === "/pulls/7/commits") return json([FIRST, head].map((sha, i) => ({ sha, parents: [{ sha: i ? FIRST : BASE }], commit: { message: i ? "implementation" : "tests first", committer: { date: NOW.toISOString() } } })));
      if (path === "/pulls/7/files") return json(changed.map((filename) => ({ filename, status: "added" })));
      if (path === "/pulls/7/reviews") return json([]);
      if (/^\/commits\/[^/]+\/check-runs$/.test(path)) return json({ total_count: 1, check_runs: [{ name: "widget-ci", status: "completed", conclusion: broken && path.includes(head) ? "failure" : checked(path.split("/")[2]), html_url: runUrl(service) }] });
      if (path.endsWith("/statuses")) return json([]);
      if (path.startsWith("/commits/")) return json({ files: (path.endsWith(FIRST) ? firstFiles : changed).map((filename) => ({ filename, status: "added" })) });
      if (path.startsWith("/contents/")) return new Response(contents[decodeURIComponent(path.slice(10))] ?? "", { status: 200 });
    } else {
      if (path === "/merge_requests/7") return json(pull);
      if (path === "/merge_requests/7/commits") return json([FIRST, head].map((id, i) => ({ id, parent_ids: [i ? FIRST : BASE], message: i ? "implementation" : "tests first", committed_date: NOW.toISOString() })));
      if (path === "/merge_requests/7/diffs") return json(changed.map((new_path) => ({ new_path, old_path: new_path, new_file: true })));
      if (path === "/merge_requests/7/approvals") return json({ approved_by: [] });
      if (path === "/pipelines") return json([{ id: url.searchParams.get("sha") === FIRST ? 60 : 61, status: url.searchParams.get("sha") === FIRST || broken ? "failed" : "success" }]);
      if (path === "/pipelines/61/jobs") return json([{ id: 1, name: "widget-ci", status: broken ? "failed" : "success", web_url: runUrl(service) }]);
      if (/^\/repository\/commits\/[^/]+\/diff$/.test(path)) return json((path.includes(FIRST) ? firstFiles : changed).map((new_path) => ({ new_path, old_path: new_path, new_file: true })));
      if (path.startsWith("/repository/files/")) return new Response(contents[decodeURIComponent(path.slice(18, -4))] ?? "", { status: 200 });
    }
    throw new Error(`unrouted fixture request: ${url.href}`);
  };
  return { calls, api };
}
async function serving(fake, work) {
  const real = globalThis.fetch;
  globalThis.fetch = fake.api;
  try { return await work(); } finally { globalThis.fetch = real; }
}
function event(w, service) {
  if (service === "gitlab") return {};
  const path = join(w.root, "event.json");
  writeFileSync(path, JSON.stringify({ number: 7, pull_request: { number: 7, head: { sha: w.head, ref: "feature/widget" }, base: { ref: "main" } } }));
  return { GITHUB_EVENT_PATH: path };
}
async function expectedDone(w, service, fake) {
  const facts = await connect(parseAddress(addressOf(service)), { token: TOKEN }).pullRequestFacts(7);
  const modules = [readDocument(artifactSchemaOf(modulePath), modulePath, moduleText)];
  return doneCheck(facts, w.workflow, modules, w.gates.map((g) => g.document), { kind: "implement", modules: ["MOD-widget"] });
}

// TST-476307
// level: component
// module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; UC-027
// given: real product process, assigned item/job, module and gate documents; GitHub facts with red tests first and green implementation
// input: runEntry(onDoneCheck) from the pull_request payload; public Process.doneCheck on the same facts is the positive control
// expect: done with no findings, server facts read with the person's token, no merge/write and all repository refs unchanged
test("TST-476307: GitHub DoD entry delegates the real passing product to Process", async () => workspace(async (w) => {
  const fake = factsServer(w, "github");
  await serving(fake, async () => {
    assert.deepEqual(await expectedDone(w, "github", fake), [], "known positive: existing public Process check");
    fake.calls.length = 0;
    const status = await run("onDoneCheck", w, "github", event(w, "github"));
    assert.equal(status.outcome, "done", status.summary);
    assert.deepEqual(status.findings, []);
    assert.ok(fake.calls.some((c) => c.url.includes("/pulls/7")), "entry actually reads server facts");
    assert.ok(fake.calls.every((c) => c.headers.get("authorization") === `Bearer ${TOKEN}`));
    unchanged(w);
    assert.equal(git(w.product.origin, "rev-parse", "test-results"), w.results);
  });
}));

// TST-476308
// level: component
// module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the same product but the head's widget-ci check fails; Process already reports the violated default and declared conditions
// input: runEntry(onDoneCheck) on the real server-adapter facts
// expect: failed and exactly the public Process findings, including the named declared check, not a duplicated or suppressed DoD verdict
test("TST-476308: a failed declared DoD condition reaches the entry findings unchanged", async () => workspace(async (w) => {
  const fake = factsServer(w, "github", { broken: true });
  await serving(fake, async () => {
    const expected = await expectedDone(w, "github", fake);
    assert.ok(expected.some((f) => f.rule === "A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS" && f.what.includes("widget-ci")));
    const status = await run("onDoneCheck", w, "github", event(w, "github"));
    assert.equal(status.outcome, "failed", status.summary);
    assert.deepEqual(status.findings, expected);
    unchanged(w);
  });
}));

// TST-476309
// level: component
// module: MOD-workflow-entries
// guards: GITLAB PRODUCTS ARE SUPPORTED; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; UC-027
// given: the same passing product and public Process control, GitLab's MR IID and recorded GitLab API facts
// input: runEntry(onDoneCheck) with GitLab CI_* and AGENT_M_* variables only
// expect: done with no findings; MR facts fetched from that GitLab server using the person's token, no GitHub request or write
test("TST-476309: GitLab DoD entry reads the merge request through its public Host", async () => workspace(async (w) => {
  const fake = factsServer(w, "gitlab");
  await serving(fake, async () => {
    assert.deepEqual(await expectedDone(w, "gitlab", fake), [], "known positive: GitLab facts satisfy Process");
    fake.calls.length = 0;
    const status = await run("onDoneCheck", w, "gitlab");
    assert.equal(status.outcome, "done", status.summary);
    assert.deepEqual(status.findings, []);
    assert.ok(fake.calls.some((c) => c.url.includes("/merge_requests/7")));
    assert.ok(fake.calls.every((c) => c.headers.get("private-token") === TOKEN));
    unchanged(w);
  });
}));

// TST-476310
// level: component
// module: MOD-workflow-entries
// guards: A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a known-good facts server, then a 503 refusing those facts, and an environment missing the person's token
// input: onDoneCheck on each, then the real CLI without the token
// expect: failed naming the server refusal, or not run naming PERSON_TOKEN without any request; CLI exits one and prints not run
test("TST-476310: DoD cannot pass without facts or the required secret", async () => workspace(async (w) => {
  const good = factsServer(w, "github");
  await serving(good, async () => assert.deepEqual(await expectedDone(w, "github", good), []));
  const refused = factsServer(w, "github", { refused: true });
  await serving(refused, async () => {
    const status = await run("onDoneCheck", w, "github", event(w, "github"));
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /fixture-facts-refused|503/);
    assert.ok(refused.calls.length > 0);
  });
  await serving(good, async () => {
    good.calls.length = 0;
    const env = environment(w, "github", { ...event(w, "github"), AGENT_M_TOKEN: "" });
    const status = await runEntry("onDoneCheck", env, { now: NOW });
    assert.equal(status.outcome, "not run", status.summary);
    assert.match(status.summary, /PERSON_TOKEN/);
    assert.equal(good.calls.length, 0);
    const cli = spawnSync(process.execPath, [MAIN, "onDoneCheck"], { cwd: w.instance.clone,
      env: { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0", ...env }, encoding: "utf8", timeout: 30_000 });
    assert.equal(cli.status, 1, cli.stderr);
    assert.match(cli.stdout, /onDoneCheck: not run[^]*PERSON_TOKEN/);
    unchanged(w);
  });
}));

// TST-476311
// level: component
// module: MOD-workflow-entries
// guards: ONE DEFINITION, THREE DRIVERS; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the valid report, real local origins, and complete workflow environments for GitHub and GitLab
// input: node src/workflow-entries/main.mjs onTestsFinished as a real child process for each service
// expect: exit zero and done only after a real immutable record is pushed; the report's failure is retained with its expected/observed excerpt
test("TST-476311: the actual CLI dispatches test completion and persists both service environments", async () => {
  for (const service of ["github", "gitlab"]) await workspace(async (w) => {
    const cli = spawnSync(process.execPath, [MAIN, "onTestsFinished"], { cwd: w.instance.clone,
      env: { PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_TERMINAL_PROMPT: "0", ...environment(w, service) },
      encoding: "utf8", timeout: 30_000 });
    assert.equal(cli.status, 0, `${cli.stdout}\n${cli.stderr}`);
    assert.match(cli.stdout, /onTestsFinished: done/);
    const { document, text } = recorded(w);
    assert.equal(document.fields.commit, w.head);
    assert.deepEqual(document.fields.levels, ["unit", "component"]);
    assert.equal(document.fields.occasion, "pull-request");
    assert.equal(document.fields.participant, `${service} fixture runner`);
    assert.equal(document.fields.run, runUrl(service));
    assert.ok(Number.isFinite(Date.parse(document.fields.date)), "the real CLI records its clock");
    const failure = document.sections.find((s) => s.heading === "## Failures").rows.find((r) => r.cells.Test === "TST-900902").cells;
    assert.equal(failure.Expected, "two");
    assert.match(failure.Observed, /zero/);
    assert.match(failure.Log, /expected two, got zero/);
    assert.ok(!text.includes(TOKEN));
    unchanged(w);
  });
});
