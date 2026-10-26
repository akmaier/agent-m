// Independent release tests of ITM-476 by tester-opus, who implemented none of its behaviour: Agent M declares its own test
// schedule and its CI is generated from it. They check, from outside, the requirements the item realises on what Agent M has
// committed — its schedule `docs/tests/schedule.md` and its workflow `.github/workflows/agent-m-tests.yml` — reading both as
// text, as GitHub and a reader of the repository see them, and importing no module of Agent M.
// Run: node --test tests/release-itm-476-own-ci-schedule.test.mjs
//
// Module: MOD-test-schedule; MOD-workflow-entries
// Guards: UC-027; THE TEST SCHEDULE IS DECLARED PER PRODUCT; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; COMMIT TESTS CALL NO PAID SERVICE; A JOB RECORD STARTS NO CI RUN; EVERY TEST RUN LEAVES A RESULT RECORD
// Level: release
//
// Each test states its input and its expected result before it runs (given / input / expect); every expected value is written
// here. How the workflow is read:
//   - a job is the block at two spaces below `jobs:`; its `if:`, `needs:`, `timeout-minutes:` and `env:` are its lines at four
//     spaces; a job that runs tests is one whose steps call the entry `runTests`;
//   - whether a job runs for an event is decided by evaluating its `if:` the way GitHub does, for the terms the file uses:
//     `github.event_name == '<name>'`, `startsWith(github.ref, '<prefix>')`, `contains(format(',{0},', inputs.rows), ',<row>,')`
//     and `!cancelled()`, joined by `&&`; a job without `if:` runs for every event, and a term outside these fails the test,
//     so that a new form is read, never guessed;
//   - which pushes start the workflow is decided by the push trigger's `paths-ignore` globs, `**` matching any part of a path
//     and `*` any part without a slash, as GitHub's filter matches them.
// The planted-fault counter-proofs are recorded in docs/tests/counter-proofs/TST-4768nn.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const LEVELS = ["unit", "component", "system", "release", "user"];
const OCCASIONS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];

// ------------------------------------------------------------------------------------------- the schedule, as a reader sees it

// The front matter's keys and the table under `## Levels`, each row as { Row, <column>: cell }.
function schedule() {
  const text = read("docs/tests/schedule.md");
  const front = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(front, "the schedule opens with its front matter");
  const fields = Object.fromEntries([...front[1].matchAll(/^([a-z]+):[ ]?(.*)$/gm)].map((m) => [m[1], m[2].trim()]));
  const levels = text.slice(text.indexOf("## Levels"));
  const lines = levels.split("\n").filter((line) => line.startsWith("|"));
  const cells = (line) => line.slice(1, line.lastIndexOf("|")).split("|").map((cell) => cell.trim());
  const columns = cells(lines[0]);
  const rows = lines.slice(2).map((line) => Object.fromEntries(cells(line).map((cell, i) => [columns[i], cell])));
  return { fields, columns, rows };
}

// ------------------------------------------------------------------------------------------- the workflow, as GitHub reads it

function workflow() {
  const text = read(".github/workflows/agent-m-tests.yml");
  const on = text.slice(text.indexOf("\non:\n"), text.indexOf("\njobs:\n"));
  const body = text.slice(text.indexOf("\njobs:\n") + 7);
  const keys = [...body.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)];
  const jobs = keys.map((key, i) => {
    const block = body.slice(key.index, keys[i + 1]?.index ?? body.length);
    const line = (name) => new RegExp(`^ {4}${name}: (.+)$`, "m").exec(block)?.[1] ?? null;
    const envBlock = /^ {4}env:\n((?: {6}.+\n)+)/m.exec(block)?.[1] ?? "";
    const env = Object.fromEntries([...envBlock.matchAll(/^ {6}([A-Z_]+): (.*)$/gm)].map((m) => [m[1], m[2].replace(/^'(.*)'$/, "$1")]));
    const needs = line("needs");
    const shards = /^ {8}shard: \[(.*)\]$/m.exec(block)?.[1].split(",").map((s) => s.trim()) ?? null;
    return { name: key[1], block, if: line("if"), timeout: line("timeout-minutes"), env, shards,
      needs: needs === null ? [] : needs.startsWith("[") ? needs.slice(1, -1).split(",").map((n) => n.trim()) : [needs.trim()],
      runsTests: /main\.mjs runTests\b/.test(block) };
  });
  return { text, on, jobs };
}

// Whether a job runs for an event { name, ref, rows }, evaluating its `if:` term by term.
function runsFor(job, event) {
  if (job.if === null) return true;
  const expression = job.if.replace(/^\$\{\{\s*/, "").replace(/\s*\}\}$/, "");
  return expression.split("&&").map((term) => term.trim()).every((term) => {
    let m;
    if (term === "!cancelled()") return true;
    if ((m = /^github\.event_name == '([a-z_]+)'$/.exec(term))) return event.name === m[1];
    if ((m = /^startsWith\(github\.ref, '([^']+)'\)$/.exec(term))) return (event.ref ?? "").startsWith(m[1]);
    if ((m = /^contains\(format\(',\{0\},', inputs\.rows\), ',([a-z]+),'\)$/.exec(term))) return `,${event.rows ?? ""},`.includes(`,${m[1]},`);
    throw new Error(`${job.name}: the term ${term} is not one this reading evaluates`);
  });
}

// The events of the five occasions, and a push to a branch.
const EVENTS = {
  "every commit": { name: "push", ref: "refs/heads/some-branch" },
  "pull request": { name: "pull_request", ref: "refs/pull/1/merge" },
  nightly: { name: "schedule", ref: "refs/heads/main" },
  "release candidate": { name: "push", ref: "refs/tags/v2026.3.0-rc.1" },
  "on demand": { name: "workflow_dispatch", ref: "refs/heads/main", rows: "unit,component,system,paid,release,user" },
};

// GitHub's glob of a path filter: `**` any part of a path, `*` any part without a slash.
const glob = (pattern) => new RegExp(`^${pattern.split("**").map((part) => part.split("*")
  .map((piece) => piece.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")).join(".*")}$`);
// Whether a push to a branch that changes these files starts the workflow, by the push trigger's paths-ignore.
function pushStarts(on, files) {
  const push = /\n {2}push:\n((?: {4}.*\n)+)/.exec(on)?.[1] ?? "";
  const ignore = /^ {4}paths-ignore:\n((?: {6}- .+\n)+)/m.exec(push)?.[1].split("\n").filter(Boolean).map((l) => l.replace(/^ {6}- /, "").replace(/^"(.*)"$/, "$1")) ?? [];
  return files.some((file) => !ignore.some((pattern) => glob(pattern).test(file)));
}

// ---------------------------------------------------------------------------------------------------------------- the tests

// TST-476801 · level: release · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: Agent M's repository as committed
// input: docs/tests/schedule.md, its front matter and its table under `## Levels`
// expect: the file exists; its table's columns are Row, then the five occasions every commit, pull request, nightly, release candidate and on demand, in this order; each of the five levels unit, component, system, release and user is a row exactly once; every cell of an occasion column is ✓ or empty; the front matter names the nightly time as HH:MM
test("TST-476801 Agent M declares in its own repository which levels run on each of the five occasions", () => {
  const { fields, columns, rows } = schedule();
  assert.deepEqual(columns.slice(0, 6), ["Row", ...OCCASIONS]);
  for (const level of LEVELS) assert.equal(rows.filter((row) => row.Row === level).length, 1, `the level ${level} is declared once`);
  for (const row of rows) for (const occasion of OCCASIONS) assert.ok(["✓", ""].includes(row[occasion]), `${row.Row} × ${occasion}: ${row[occasion]}`);
  assert.match(fields.nightly ?? "", /^([01]\d|2[0-3]):[0-5]\d$/);
});

// TST-476802 · level: release · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the committed schedule and the committed .github/workflows/agent-m-tests.yml
// input: for each row of the schedule and each occasion, the event of that occasion (a push to a branch, a pull request, the nightly schedule, a push of a release-candidate tag, a run on demand naming every row); the jobs of the workflow that run tests for it
// expect: the workflow says it is generated from docs/tests/schedule.md; for every row and occasion, the jobs that run tests for the event and carry AGENT_M_ROW of the row exist exactly when the cell is ✓, carry AGENT_M_OCCASION of the occasion and the schedule's number of shards (empty: 1) as AGENT_M_SHARDS and as many matrix shards, and run the schedule's command; the schedule's nightly HH:MM is the workflow's cron, and a release-candidate tag is a push trigger
test("TST-476802 the committed workflow runs exactly the rows the schedule ticks for each occasion", () => {
  const { fields, rows } = schedule();
  const { text, on, jobs } = workflow();
  assert.match(text, /^# Generated by Agent M from docs\/tests\/schedule\.md\./);
  for (const row of rows) {
    for (const occasion of OCCASIONS) {
      const running = jobs.filter((job) => job.runsTests && job.env.AGENT_M_ROW === row.Row && runsFor(job, EVENTS[occasion]));
      assert.equal(running.length, row[occasion] === "✓" ? 1 : 0, `${row.Row} × ${occasion}: ${running.map((j) => j.name).join(", ")}`);
      for (const job of running) {
        const shards = row.shards ? Number(row.shards) : 1;
        assert.equal(job.env.AGENT_M_OCCASION, occasion.replace(" ", "-"), job.name);
        assert.equal(job.env.AGENT_M_SHARDS, String(shards), job.name);
        assert.equal(job.shards.length, shards, job.name);
        assert.equal(job.env.AGENT_M_COMMAND, fields.command, job.name);
      }
    }
  }
  const [hour, minute] = fields.nightly.split(":").map(Number);
  assert.match(on, new RegExp(`\\n {4}- cron: "${minute} ${hour} \\* \\* \\*"\\n`));
  assert.match(on, /\n {4}tags:\n {6}- "v\*-rc\.\*"\n/);
});

// TST-476803 · level: release · module: MOD-test-schedule; MOD-workflow-entries
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; UC-027
// given: the committed workflow
// input: the jobs that run for a pull request, by their `if:`
// expect: there are such jobs, among them one that runs tests; every one of them carries `timeout-minutes: 2`, after which GitHub stops it and the run fails; and the schedule declares `minutes: 2`
test("TST-476803 every job that runs on a pull request is stopped after two minutes", () => {
  const { fields } = schedule();
  const { jobs } = workflow();
  const pullRequest = jobs.filter((job) => runsFor(job, EVENTS["pull request"]));
  assert.ok(pullRequest.some((job) => job.runsTests), "a pull request runs tests");
  for (const job of pullRequest) assert.equal(job.timeout, "2", `${job.name} carries timeout-minutes: 2`);
  assert.equal(fields.minutes, "2");
});

// TST-476804 · level: release · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-027
// given: the committed schedule and workflow
// input: the jobs that run tests for a push to a branch (every commit) and for a pull request
// expect: the schedule ticks neither every commit nor pull request in its row paid; none of these jobs runs the row paid; none reads a secret of the repository (`secrets.`) and each hands its tests an empty AGENT_M_SECRETS, so that no key of a paid service reaches a test of a commit or a pull request
test("TST-476804 no test of a commit or a pull request runs the row paid or receives a secret", () => {
  const { rows } = schedule();
  const paid = rows.find((row) => row.Row === "paid");
  assert.ok(paid, "the schedule has the row paid");
  assert.deepEqual([paid["every commit"], paid["pull request"]], ["", ""]);
  const { jobs } = workflow();
  const commitJobs = jobs.filter((job) => job.runsTests && (runsFor(job, EVENTS["every commit"]) || runsFor(job, EVENTS["pull request"])));
  assert.ok(commitJobs.length > 0, "a pull request runs tests");
  for (const job of commitJobs) {
    assert.notEqual(job.env.AGENT_M_ROW, "paid", `${job.name} runs the row paid`);
    assert.doesNotMatch(job.block, /secrets\./, `${job.name} reads a secret`);
    assert.equal(job.env.AGENT_M_SECRETS, "", `${job.name} hands its tests no secret`);
  }
});

// TST-476805 · level: release · module: MOD-test-schedule
// guards: A JOB RECORD STARTS NO CI RUN
// given: the committed workflow's push trigger
// input: a push to a branch that changes only docs/jobs/JOB-20261026-0626-2aec.md; one that changes docs/jobs/JOB-20261026-0626-2aec.md and docs/jobs/JOB-20261026-0700-ab12.md; counter-proof: one that changes docs/jobs/JOB-20261026-0626-2aec.md and src/test-schedule/generate.mjs, and one that changes only docs/jobs-overview.md
// expect: the first two start no run; the last two start one
test("TST-476805 a push that changes only job records starts no run, one that also changes code does", () => {
  const { on } = workflow();
  assert.equal(pushStarts(on, ["docs/jobs/JOB-20261026-0626-2aec.md"]), false);
  assert.equal(pushStarts(on, ["docs/jobs/JOB-20261026-0626-2aec.md", "docs/jobs/JOB-20261026-0700-ab12.md"]), false);
  assert.equal(pushStarts(on, ["docs/jobs/JOB-20261026-0626-2aec.md", "src/test-schedule/generate.mjs"]), true);
  assert.equal(pushStarts(on, ["docs/jobs-overview.md"]), true);
});

// TST-476806 · level: release · module: MOD-workflow-entries; MOD-test-schedule
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-027
// given: the committed workflow
// input: for each of the four occasions that run tests — pull request, nightly, release candidate, on demand — the jobs that run tests and the job that calls the entry onTestsFinished
// expect: exactly one job calls onTestsFinished; it runs for each of the four events; its `if:` holds `!cancelled()`, so that it runs when a test job failed; it needs every job that runs tests; it takes the run's reports (download-artifact into agent-m-reports) and holds AGENT_M_TOKEN from the repository's secret to write the record; every job that runs tests keeps its reports (upload-artifact of agent-m-reports/) with `if: always()`, so that a failing job's report reaches the record too
test("TST-476806 every run that runs tests ends in the job that writes its result record, whatever its tests did", () => {
  const { jobs } = workflow();
  const recorders = jobs.filter((job) => /main\.mjs onTestsFinished\b/.test(job.block));
  assert.equal(recorders.length, 1, "one job writes the record");
  const [records] = recorders;
  const testing = jobs.filter((job) => job.runsTests);
  for (const occasion of ["pull request", "nightly", "release candidate", "on demand"]) {
    assert.ok(testing.some((job) => runsFor(job, EVENTS[occasion])), `the ${occasion} runs tests`);
    assert.ok(runsFor(records, EVENTS[occasion]), `the record is written on the ${occasion}`);
  }
  assert.match(records.if ?? "", /!cancelled\(\)/, "the record is written when a test job failed");
  assert.deepEqual(testing.map((job) => job.name).filter((name) => !records.needs.includes(name)), [], "it waits for every test job");
  assert.match(records.block, /uses: actions\/download-artifact@v\d+\n\s+with:\n\s+path: agent-m-reports\n/);
  assert.equal(records.env.AGENT_M_TOKEN, "${{ secrets.AGENT_M_TOKEN }}");
  for (const job of testing) {
    assert.match(job.block, /- name: Keep the report and the status\n\s+if: always\(\)\n\s+uses: actions\/upload-artifact@v\d+\n\s+with:\n\s+name: .+\n\s+path: agent-m-reports\/\n/, job.name);
  }
});
