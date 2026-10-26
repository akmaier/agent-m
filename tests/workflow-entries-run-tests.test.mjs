// MOD-workflow-entries' entry runTests (ITM-1215), as the accepted text of docs/architecture/MOD-workflow-entries.md states it: "in a product, in each test job of
// MOD-test-schedule's configuration, on a machine that holds no token: the files of the row `AGENT_M_ROW` among the commit's committed files, read through Access's local
// clone, as MOD-test-schedule's `testsOfRow` names them; then `AGENT_M_COMMAND`, or node's test runner where it is empty, run with those files and the variables of
// MOD-test-schedule's *The variables of a test job*, writing the report and the status where *The reports of a run* fixes them. Before anything runs it checks that each
// secret `AGENT_M_SECRETS` names is set, reading no value: one that is not set ends the entry `not run`, its status `not run: secret missing: <name>`, and the command does not
// run (UC-027 4a). Ends `done` when the command ends with 0, `failed` when it does not, naming the status, `nothing to do` for a row without a file — no report is then
// written —, and `failed` before anything runs when a named test file's level cannot be read, naming each such file. [...] Reads no token and writes nothing to a repository."
// Run: node --test tests/workflow-entries-run-tests.test.mjs
//
// Module: MOD-workflow-entries
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-027
// Level: unit
//
// Deterministic, no network. The product's checkout is a temporary git repository laid out as a test job of MOD-test-schedule's generated configuration lays it out: the
// workspace is the product's checkout at one commit, and the job's variables are those of MOD-test-schedule's *The variables of a test job* — AGENT_M_ROW, AGENT_M_OCCASION,
// AGENT_M_SHARD, AGENT_M_SHARDS, AGENT_M_COMMAND, AGENT_M_SECRETS. The product's command is a fake: a node script that writes the arguments and the variables it was given to
// a file and a report to AGENT_M_REPORT, and ends with the status FAKE_EXIT names. The readings, named in the pull request:
//   - The report and the status lie below the checkout, in agent-m-reports/<occasion>.<row>.<shard>.xml and .status (MOD-workflow-entries, Data: The reports of a run);
//     AGENT_M_REPORT is that report's path. The status is one line: `done`, `nothing to do`, or the outcome and its reason, `failed: <why>`, `not run: secret missing: <name>`.
//   - A secret is set when its variable holds a value: an unset secret of GitHub Actions reaches the job as an empty variable.
//   - The command runs in the checkout, with the files as its arguments, given as the paths the commit names. AGENT_M_COMMAND and AGENT_M_SECRETS are read by runTests alone
//     and are not passed on; every other variable of the job is, except the tokens a CI service may hold (AGENT_M_TOKEN, GITHUB_TOKEN, CI_JOB_TOKEN), which are not read.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.GIT_CONFIG_GLOBAL = "/dev/null";
process.env.GIT_CONFIG_SYSTEM = "/dev/null";
process.env.GIT_TERMINAL_PROMPT = "0";

const { runEntry } = await import("../src/workflow-entries/main.mjs");

// ---------------------------------------------------------------- the fixtures

const NOW = new Date("2026-10-26T09:30:00Z");
const TOKEN = "ghp_ALICEagentMtoken0123456789abcdef";
const TOKENS = ["AGENT_M_TOKEN", "GITHUB_TOKEN", "CI_JOB_TOKEN"];

// A test file of the product: its header names its module and level, its one case is declared and passes under node's test runner.
const testFile = (id, level, header = true) => [...(header ? ["// Module: MOD-store", `// Level: ${level}`, ""] : []),
  "import test from \"node:test\";", "", `// ${id} · level: ${level} · module: MOD-store`, "// guards: A LOAN HAS A DUE DATE", "// given: a loan", "// input: its date",
  "// expect: the due date", `test("${id} a loan", () => {});`, ""].join("\n");
const COMMITTED = {
  "README.md": "# Thesis tool\n",
  "src/store/index.mjs": "export const due = 14;\n",
  "tests/store-a.test.mjs": testFile("TST-001", "unit"),
  "tests/store-b.test.mjs": testFile("TST-002", "unit"),
  "tests/store-flow.test.mjs": testFile("TST-003", "component"),
  "tests/store-helpers.mjs": "// Module: MOD-store\n// A helper of the store's tests.\nexport const loan = { due: 14 };\n",
};
// A test file without a level: no header, and no declaration.
const NO_LEVEL = "import test from \"node:test\";\ntest(\"a loan\", () => {});\n";

// The fake command: the arguments and the variables it was given, written to FAKE_OUT; a report written to AGENT_M_REPORT; the status FAKE_EXIT names.
const FAKE = [
  "import { writeFileSync } from \"node:fs\";",
  "const names = [\"AGENT_M_ROW\", \"AGENT_M_OCCASION\", \"AGENT_M_SHARD\", \"AGENT_M_SHARDS\", \"AGENT_M_REPORT\", \"AGENT_M_COMMAND\", \"AGENT_M_SECRETS\", \"PAID_KEY\", \"AGENT_M_TOKEN\", \"GITHUB_TOKEN\", \"CI_JOB_TOKEN\"];",
  "const variables = Object.fromEntries(names.filter((name) => name in process.env).map((name) => [name, process.env[name]]));",
  "writeFileSync(process.env.FAKE_OUT, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd(), variables }));",
  "writeFileSync(process.env.AGENT_M_REPORT, \"<testsuites><testsuite name=\\\"s\\\"><testcase name=\\\"TST-001 a loan\\\"/></testsuite></testsuites>\");",
  "process.exitCode = Number(process.env.FAKE_EXIT ?? 0);", ""].join("\n");

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

// The product's checkout, as a test job's checkout step leaves it: one commit of `files`, and `untracked` written into the working tree after it; the fake command beside it.
async function withCheckout(run, { files = {}, untracked = {} } = {}) {
  const root = mkdtempSync(join(tmpdir(), "agent-m-run-tests-"));
  const checkout = join(root, "product");
  try {
    mkdirSync(checkout);
    git(checkout, "init", "-q", "-b", "main");
    git(checkout, "config", "user.name", "Seed");
    git(checkout, "config", "user.email", "seed@example.org");
    write(checkout, { ...COMMITTED, ...files });
    git(checkout, "add", "-A");
    git(checkout, "commit", "-q", "-m", "first");
    write(checkout, untracked);
    const fake = join(root, "fake-command.mjs");
    writeFileSync(fake, FAKE);
    const out = join(root, "fake-out.json");
    return await run({ checkout, head: git(checkout, "rev-parse", "HEAD"), command: `"${process.execPath}" "${fake}"`, out,
      given: () => (existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null) });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// The variables of a GitHub Actions test job of the row `row`, shard `shard` of `shards`, on a pull request; `more` adds or replaces variables.
function jobVariables(w, { row = "unit", shard = 1, shards = 2, command = w.command, secrets = "", more = {} } = {}) {
  return { GITHUB_ACTIONS: "true", GITHUB_EVENT_NAME: "pull_request", GITHUB_WORKSPACE: w.checkout, GITHUB_SERVER_URL: "https://github.com",
    GITHUB_REPOSITORY: "alice/thesis-tool", GITHUB_REF_NAME: "7/merge", GITHUB_SHA: w.head, GITHUB_RUN_ID: "4711", RUNNER_NAME: "GitHub Actions 7", PATH: process.env.PATH,
    AGENT_M_ROW: row, AGENT_M_OCCASION: "pull-request", AGENT_M_SHARD: String(shard), AGENT_M_SHARDS: String(shards), AGENT_M_COMMAND: command, AGENT_M_SECRETS: secrets,
    FAKE_OUT: w.out, FAKE_EXIT: "0", ...more };
}
const runTests = (variables) => runEntry("runTests", variables, { now: NOW });
const reportsOf = (w) => join(w.checkout, "agent-m-reports");
const statusOf = (w, name) => (existsSync(join(reportsOf(w), `${name}.status`)) ? readFileSync(join(reportsOf(w), `${name}.status`), "utf8") : null);

// ---------------------------------------------------------------- the tests

// TST-1215101 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: a checkout at one commit holding the unit test files tests/store-a.test.mjs and tests/store-b.test.mjs, the component test file tests/store-flow.test.mjs and the helper tests/store-helpers.mjs; the unit test file tests/store-c.test.mjs written after the commit, not committed; the fake command, ending with 0
// input: runTests in the job of the row unit, shard 1 of 2, on the occasion pull-request
// expect: outcome `done`; the command ran once in the checkout with exactly the arguments tests/store-a.test.mjs and tests/store-b.test.mjs, in this order; it was given AGENT_M_ROW unit, AGENT_M_OCCASION pull-request, AGENT_M_SHARD 1, AGENT_M_SHARDS 2 and AGENT_M_REPORT <checkout>/agent-m-reports/pull-request.unit.1.xml, and neither AGENT_M_COMMAND nor AGENT_M_SECRETS; the report it wrote lies there; agent-m-reports/pull-request.unit.1.status holds the one line `done`; the checkout's commit and branches are unchanged
test("runTests — the command runs the files testsOfRow names for the row, with the job's variables, and the status says done", async () => {
  await withCheckout(async (w) => {
    const branches = git(w.checkout, "for-each-ref");
    const status = await runTests(jobVariables(w));
    assert.equal(status.outcome, "done", status.summary);
    const given = w.given();
    assert.ok(given, "the command ran");
    assert.deepEqual(given.args, ["tests/store-a.test.mjs", "tests/store-b.test.mjs"]);
    assert.equal(realpathSync(given.cwd), realpathSync(w.checkout), "the command runs in the checkout");
    const report = join(reportsOf(w), "pull-request.unit.1.xml");
    assert.deepEqual(given.variables, { AGENT_M_ROW: "unit", AGENT_M_OCCASION: "pull-request", AGENT_M_SHARD: "1", AGENT_M_SHARDS: "2", AGENT_M_REPORT: report });
    assert.ok(existsSync(report), "the report lies where AGENT_M_REPORT names it");
    assert.equal(statusOf(w, "pull-request.unit.1").trim(), "done");
    assert.equal(git(w.checkout, "rev-parse", "HEAD"), w.head, "nothing is committed");
    assert.equal(git(w.checkout, "for-each-ref"), branches, "no branch is moved");
  }, { untracked: { "tests/store-c.test.mjs": testFile("TST-004", "unit") } });
});

// TST-1215102 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the checkout of TST-1215101; the fake command ends with the status 3
// input: runTests in the job of the row unit, shard 2 of 2
// expect: outcome `failed`, its summary naming the status 3; agent-m-reports/pull-request.unit.2.status holds one line beginning `failed: ` that names the status 3; the command's report is kept
test("runTests — a command that ends with a status other than 0 ends the entry failed, naming the status", async () => {
  await withCheckout(async (w) => {
    const status = await runTests(jobVariables(w, { shard: 2, more: { FAKE_EXIT: "3" } }));
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /\b3\b/);
    const line = statusOf(w, "pull-request.unit.2");
    assert.match(line, /^failed: .*\b3\b/);
    assert.equal(line.trim().split("\n").length, 1, "one line");
    assert.ok(existsSync(join(reportsOf(w), "pull-request.unit.2.xml")));
  });
});

// TST-1215103 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the checkout of TST-1215101; the job of the row unit names the secrets PAID_KEY and OTHER_KEY in AGENT_M_SECRETS
// input: runTests (a) with PAID_KEY set and OTHER_KEY not given; (b) with PAID_KEY set and OTHER_KEY empty, as GitHub gives a secret that is not set; (c) with both set
// expect: (a) and (b) outcome `not run`, the summary naming OTHER_KEY; the status `not run: secret missing: OTHER_KEY`; the command did not run and no report was written; (c) `done`, the command ran and was given PAID_KEY
test("runTests — a secret AGENT_M_SECRETS names that is not set ends the entry not run before the command runs", async () => {
  for (const other of [undefined, ""]) {
    await withCheckout(async (w) => {
      const more = { PAID_KEY: "sk-paid-0123", ...(other === undefined ? {} : { OTHER_KEY: other }) };
      const status = await runTests(jobVariables(w, { secrets: "PAID_KEY,OTHER_KEY", more }));
      assert.equal(status.outcome, "not run", status.summary);
      assert.match(status.summary, /OTHER_KEY/);
      assert.equal(statusOf(w, "pull-request.unit.1").trim(), "not run: secret missing: OTHER_KEY");
      assert.equal(w.given(), null, "the command did not run");
      assert.ok(!existsSync(join(reportsOf(w), "pull-request.unit.1.xml")), "no report");
    });
  }
  await withCheckout(async (w) => {
    const status = await runTests(jobVariables(w, { secrets: "PAID_KEY,OTHER_KEY", more: { PAID_KEY: "sk-paid-0123", OTHER_KEY: "sk-other-4567" } }));
    assert.equal(status.outcome, "done", status.summary);
    assert.equal(w.given()?.variables.PAID_KEY, "sk-paid-0123");
  });
});

// TST-1215104 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the checkout of TST-1215101 whose commit also holds tests/store-x.test.mjs and tests/store-y.test.mjs, two test files named as tests whose level cannot be read — no Level: in a header and no declaration
// input: runTests in the job of the row unit
// expect: outcome `failed`, its summary naming tests/store-x.test.mjs and tests/store-y.test.mjs; the status begins `failed: ` and names both; the command did not run and no report was written
test("runTests — a named test file whose level cannot be read ends the entry failed before anything runs, naming each such file", async () => {
  await withCheckout(async (w) => {
    const status = await runTests(jobVariables(w));
    assert.equal(status.outcome, "failed", status.summary);
    assert.match(status.summary, /tests\/store-x\.test\.mjs/);
    assert.match(status.summary, /tests\/store-y\.test\.mjs/);
    const line = statusOf(w, "pull-request.unit.1");
    assert.match(line, /^failed: /);
    assert.ok(line.includes("tests/store-x.test.mjs") && line.includes("tests/store-y.test.mjs"), line);
    assert.equal(w.given(), null, "the command did not run");
    assert.ok(!existsSync(join(reportsOf(w), "pull-request.unit.1.xml")), "no report");
  }, { files: { "tests/store-x.test.mjs": NO_LEVEL, "tests/store-y.test.mjs": NO_LEVEL } });
});

// TST-1215105 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the checkout of TST-1215101, which holds no test file of the level system
// input: runTests in the job of the row system, shard 1 of 1
// expect: outcome `nothing to do`; the status `nothing to do`; the command did not run and no report was written
test("runTests — a row without a file ends nothing to do and writes no report", async () => {
  await withCheckout(async (w) => {
    const status = await runTests(jobVariables(w, { row: "system", shards: 1 }));
    assert.equal(status.outcome, "nothing to do", status.summary);
    assert.equal(statusOf(w, "pull-request.system.1").trim(), "nothing to do");
    assert.equal(w.given(), null, "the command did not run");
    assert.ok(!existsSync(join(reportsOf(w), "pull-request.system.1.xml")), "no report");
  });
});

// TST-1215106 · level: unit · module: MOD-workflow-entries
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the checkout of TST-1215101, whose unit test files tests/store-a.test.mjs (TST-001) and tests/store-b.test.mjs (TST-002) each hold one passing case under node's test runner; AGENT_M_COMMAND empty
// input: runTests in the job of the row unit, (a) shard 1 of 2, (b) shard 2 of 2
// expect: each `done` with the status `done`; node's test runner drew the share with its shard flag and wrote a JUnit XML report: (a) agent-m-reports/pull-request.unit.1.xml holds a testcase of TST-001 and none of TST-002, (b) agent-m-reports/pull-request.unit.2.xml one of TST-002 and none of TST-001
test("runTests — with the command empty, node's test runner runs the share with its shard flag and its JUnit reporter", async () => {
  await withCheckout(async (w) => {
    for (const [shard, own, other] of [[1, "TST-001", "TST-002"], [2, "TST-002", "TST-001"]]) {
      const status = await runTests(jobVariables(w, { shard, command: "" }));
      assert.equal(status.outcome, "done", status.summary);
      assert.equal(statusOf(w, `pull-request.unit.${shard}`).trim(), "done");
      const report = readFileSync(join(reportsOf(w), `pull-request.unit.${shard}.xml`), "utf8");
      assert.match(report, /<testsuites/);
      assert.match(report, new RegExp(`<testcase[^>]*name="${own} a loan"`));
      assert.doesNotMatch(report, new RegExp(`name="${other} a loan"`));
    }
  });
});

// TST-1215107 · level: unit · module: MOD-workflow-entries
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; UC-027
// given: the checkout of TST-1215101; a test job whose variables, against the generated configuration, also hold AGENT_M_TOKEN, GITHUB_TOKEN and CI_JOB_TOKEN; every variable the entry reads is recorded
// input: runTests in the job of the row unit
// expect: outcome `done`; none of AGENT_M_TOKEN, GITHUB_TOKEN and CI_JOB_TOKEN was read, and the command was given none of them
test("runTests — no token variable is read", async () => {
  await withCheckout(async (w) => {
    const read = new Set();
    const variables = new Proxy(jobVariables(w, { more: { AGENT_M_TOKEN: TOKEN, GITHUB_TOKEN: "ghs_workflow0123", CI_JOB_TOKEN: "glcbt-job0123" } }), {
      get(target, name, receiver) { read.add(name); return Reflect.get(target, name, receiver); },
    });
    const status = await runTests(variables);
    assert.equal(status.outcome, "done", status.summary);
    for (const name of TOKENS) assert.ok(!read.has(name), `${name} was read`);
    const given = w.given();
    assert.ok(given, "the command ran");
    for (const name of TOKENS) assert.ok(!(name in given.variables), `the command was given ${name}`);
  });
});
