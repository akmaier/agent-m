// The CI configuration generated from a schedule (ITM-744) — MOD-test-schedule's ciConfiguration(schedule, target,
// resources, participants), as the accepted text of docs/architecture/MOD-test-schedule.md states it under Data and
// Interfaces: a GitHub Actions workflow or a GitLab CI file with one job per ticked row and occasion, nothing for a push
// that changes only job records, the nightly run, the release candidate on a tag, the manual start, the job agent-m done,
// the step that hands the JUnit XML report on, and the secrets by name. ITM-1214 adds what MOD-test-schedule's Data states under
// *The generated configuration* and *The variables of a test job*: a row's shards as a matrix or `parallel:`, the time limit
// `minutes`, the job agent-m setup where `cache` names paths, the job agent-m records after every test job, agent-m done after
// the test jobs and agent-m records, and the person's token in those two jobs alone.
// Run: node --test tests/test-schedule-ci-configuration.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A JOB RECORD STARTS NO CI RUN; COMMIT TESTS CALL NO PAID SERVICE; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; GITLAB PRODUCTS ARE SUPPORTED; NO SECRET IN THE REPOSITORY; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing here sleeps,
// waits or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, defaultSchedule, occasionsOf, secretsNeeded, ciConfiguration } from "../src/test-schedule/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const ROWS = ["unit", "component", "system", "paid", "release", "user"];
const OCCASIONS = ["every commit", "pull request", "nightly", "release candidate", "on demand"];
const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const GITHUB = { server: "github", instance: "acme/agent-m", instanceCommit: COMMIT };
const GITLAB = { server: "gitlab", instance: "https://git.example.org/acme/agent-m", instanceCommit: COMMIT };
const jobName = (row, occasion) => `${row}-${occasion.replaceAll(" ", "-")}`;

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const DEFAULT_ROWS = {
  unit: "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |", paid: "| paid | | | ✓ | ✓ | ✓ | |",
  release: "| release | | | | ✓ | ✓ | |", user: "| user | | | | ✓ | ✓ | |",
};
function scheduleWith(changed = {}, front = "nightly: 03:30") {
  const rows = Object.values({ ...DEFAULT_ROWS, ...changed }).join("\n");
  return readDocument(scheduleSchema, "docs/tests/schedule.md", `---\n${front}\n---\n## Levels\n\n${HEAD}\n${rows}\n`);
}
// A changed schedule: unit only on pull requests, system only nightly, component on a self-hosted runner.
const CHANGED = scheduleWith({
  unit: "| unit | | ✓ | | ✓ | ✓ | |", system: "| system | | | ✓ | ✓ | ✓ | |",
  component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | lab-runner |" });

const participants = readDocument(participantSchema(), "docs/participants.md", `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ci runner:lab secret LAB_KEY |
`);
const RESOURCE_HEAD = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const resourcesOf = (...rows) => readDocument(resourceSchema(), "docs/resources.md",
  `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${RESOURCE_HEAD}\n${rows.join("\n")}\n`);
const ORACLE = "| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |";
const LEAKY = "| leaky | endpoint | https://leaky.example.org | example-model | — | — | runner:cpu | the vendor | yes | sk-live-abc123def456 |";
const resources = resourcesOf(ORACLE, LEAKY);

const generate = (schedule, target) => ciConfiguration(schedule, target, resources, participants);
const textOf = (result) => Object.values(result.files).join("\n");

// The jobs of a generated file by name: on GitHub the keys under `jobs:` (two spaces), on GitLab the top-level keys.
function jobsOf(text, server) {
  const body = server === "github" ? text.slice(text.indexOf("\njobs:\n") + 7) : text;
  const key = server === "github" ? /^ {2}([A-Za-z0-9-]+):\s*$/gm : /^([A-Za-z0-9-]+):\s*$/gm;
  const found = [...body.matchAll(key)];
  return Object.fromEntries(found.map((m, i) => [m[1], body.slice(m.index, found[i + 1]?.index ?? body.length)]));
}
// The value a job gives a variable (GitHub's env:, GitLab's variables:), without the quotes YAML may put around it; undefined where the job sets none.
function variable(block, name) {
  const raw = new RegExp(`^\\s+${name}: ?(.*)$`, "m").exec(block)?.[1];
  if (raw === undefined) return undefined;
  if (/^'.*'$/.test(raw)) return raw.slice(1, -1).replaceAll("''", "'");
  if (/^".*"$/.test(raw)) return raw.slice(1, -1);
  return raw;
}
const fileOf = (server) => (server === "github" ? ".github/workflows/agent-m-tests.yml" : ".gitlab/agent-m-tests.yml");
// The test jobs of a file: every job but Agent M's own, agent-m-setup, agent-m-records and agent-m-done.
const testJobs = (jobs) => Object.keys(jobs).filter((name) => !name.startsWith("agent-m-")).sort();
const expectedJobs = (schedule) => ROWS.flatMap((row) => occasionsOf(row, schedule).map((o) => jobName(row, o))).sort();

// What starts a run on a push to a branch, read from the GitHub file: the files of the push that match no paths-ignore
// pattern (`dir/**`); the push starts a run when one file remains.
function pushStarts(text, files) {
  const ignore = [...text.slice(text.indexOf("paths-ignore:")).matchAll(/^\s+- (\S+\/)\*\*\s*$/gm)].map((m) => m[1]);
  if (!text.includes("paths-ignore:")) return true;
  return files.some((file) => !ignore.some((dir) => file.startsWith(dir)));
}

// Ruby's File.fnmatch with FNM_PATHNAME | FNM_DOTMATCH | FNM_EXTGLOB, as far as the generated globs use it: one level of braces,
// `**/`, `*`, `?` and `[!x]`.
function fnmatch(glob, file) {
  const open = glob.indexOf("{");
  if (open >= 0) {
    const close = glob.indexOf("}", open);
    return glob.slice(open + 1, close).split(",").some((alt) => fnmatch(glob.slice(0, open) + alt + glob.slice(close + 1), file));
  }
  const source = glob.replace(/[.+^$()|\\]/g, "\\$&").replace(/\*\*\//g, "\0").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]")
    .replace(/\[!([^\]]*)\]/g, "[^$1/]").replaceAll("\0", "(?:.*/)?");
  return new RegExp(`^${source}$`).test(file);
}

// TST-744001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the book's default schedule and a changed fixture schedule (unit only on a pull request and at the release candidate and on demand, system only nightly and later, component on the self-hosted runner lab)
// input: ciConfiguration(schedule, target, resources, participants) for each schedule on GitHub and on GitLab
// expect: GitHub: one file, .github/workflows/agent-m-tests.yml, no include entry, no pipeline schedule; GitLab: one file, .gitlab/agent-m-tests.yml, the include entry { file: ".gitlab-ci.yml", entry: "- local: .gitlab/agent-m-tests.yml" }; in each file exactly the jobs named <row>-<occasion> that occasionsOf ticks, plus agent-m-records and agent-m-done, and no agent-m-setup (neither schedule names a cache)
for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
  test(`ciConfiguration — ${server}: the file, and one job per ticked row and occasion`, () => {
    for (const schedule of [defaultSchedule(), CHANGED]) {
      const result = generate(schedule, target);
      assert.deepEqual(Object.keys(result.files), [fileOf(server)]);
      if (server === "github") assert.equal(result.include, null);
      else assert.deepEqual(result.include, { file: ".gitlab-ci.yml", entry: "- local: .gitlab/agent-m-tests.yml" });
      const jobs = jobsOf(result.files[fileOf(server)], server);
      assert.deepEqual(testJobs(jobs), expectedJobs(schedule));
      assert.ok("agent-m-done" in jobs, "the job agent-m-done");
      assert.ok("agent-m-records" in jobs, "the job agent-m-records");
      assert.ok(!("agent-m-setup" in jobs), "no job agent-m-setup without a cache");
    }
  });
}

// TST-744002 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the default schedule and the changed fixture schedule
// input: the GitHub file of each; the event condition (`if:`) of each test job
// expect: a job of the occasion every commit runs on a push of a branch (not a tag); pull request on pull_request; nightly on schedule; release candidate on a pushed tag; on demand on workflow_dispatch and only when the input rows names its row — so the rows a condition lets run are exactly those the schedule ticks for the occasion
test("ciConfiguration — GitHub: each job runs on the event of its occasion", () => {
  const IF = {
    "every commit": "github.event_name == 'push' && !startsWith(github.ref, 'refs/tags/')",
    "pull request": "github.event_name == 'pull_request'",
    nightly: "github.event_name == 'schedule'",
    "release candidate": "github.event_name == 'push' && startsWith(github.ref, 'refs/tags/')",
  };
  for (const schedule of [defaultSchedule(), CHANGED]) {
    const jobs = jobsOf(textOf(generate(schedule, GITHUB)), "github");
    for (const row of ROWS) for (const occasion of occasionsOf(row, schedule)) {
      const block = jobs[jobName(row, occasion)];
      const condition = block.match(/^\s+if: (.*)$/m)?.[1] ?? "";
      if (occasion === "on demand") {
        assert.ok(condition.includes("github.event_name == 'workflow_dispatch'") && condition.includes(`',${row},'`), `${row}: ${condition}`);
      } else assert.equal(condition, IF[occasion], `${row} ${occasion}`);
    }
  }
});

// TST-744003 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the default schedule and the changed fixture schedule
// input: the GitLab file of each; the rules (`- if:`) of each test job
// expect: every commit on a push without a tag; pull request on merge_request_event; nightly on the schedule source; release candidate on a tag matching v*-rc.*; on demand on the web source and only when the variable ROWS names its row
test("ciConfiguration — GitLab: each job runs on the rule of its occasion", () => {
  const RULE = {
    "every commit": '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_TAG == null',
    "pull request": '$CI_PIPELINE_SOURCE == "merge_request_event"',
    nightly: '$CI_PIPELINE_SOURCE == "schedule"',
    "release candidate": "$CI_COMMIT_TAG =~ /^v.*-rc\\..*$/",
  };
  for (const schedule of [defaultSchedule(), CHANGED]) {
    const jobs = jobsOf(textOf(generate(schedule, GITLAB)), "gitlab");
    for (const row of ROWS) for (const occasion of occasionsOf(row, schedule)) {
      const rules = [...jobs[jobName(row, occasion)].matchAll(/^\s+- if: (.*)$/gm)].map((m) => m[1].replace(/^'(.*)'$/, "$1"));
      if (occasion === "on demand") {
        assert.ok(rules.length === 1 && rules[0].includes('$CI_PIPELINE_SOURCE == "web"') && rules[0].includes("$ROWS") && rules[0].includes(row), `${row}: ${rules}`);
      } else assert.deepEqual(rules, [RULE[occasion]], `${row} ${occasion}`);
    }
  }
});

// TST-744004 · level: unit · module: MOD-test-schedule
// guards: A JOB RECORD STARTS NO CI RUN; UC-027
// given: the GitHub file generated from the default schedule; pushes that change (a) only docs/jobs/run-1.md, (b) only docs/conversations/c1.md and docs/jobs/run-1.md, (c) docs/jobs/run-1.md and src/a.mjs
// input: which of the pushes start a run according to the file's paths-ignore filter of the push trigger
// expect: (a) and (b) start nothing; (c) starts the commit rows, as does a push of src/a.mjs alone
test("ciConfiguration — GitHub: a push that records only jobs or conversations starts nothing", () => {
  const text = generate(defaultSchedule(), GITHUB).files[fileOf("github")];
  assert.equal(pushStarts(text, ["docs/jobs/run-1.md"]), false);
  assert.equal(pushStarts(text, ["docs/conversations/c1.md", "docs/jobs/run-1.md"]), false);
  assert.equal(pushStarts(text, ["docs/jobs/run-1.md", "src/a.mjs"]), true);
  assert.equal(pushStarts(text, ["src/a.mjs"]), true);
});

// TST-744005 · level: unit · module: MOD-test-schedule
// guards: A JOB RECORD STARTS NO CI RUN; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the GitLab file generated from the default schedule
// input: the rule of each job of the occasion every commit, whose `changes` globs are read with Ruby's File.fnmatch semantics (FNM_PATHNAME, braces, [!x]); pushes that change (a) only docs/jobs/run-1.md, (b) docs/conversations/c1.md and docs/jobs/run-1.md, (c) docs/jobs/run-1.md and src/a.mjs, (d) only src/a.mjs, docs/SPEC.md, README.md, docs/jobsx/a.md or docs/jobs.md
// expect: the rule holds a `changes` list; (a) and (b) match no glob, so the job is not added; (c) matches, as does each push of (d); no job script holds a check of the changed files
test("ciConfiguration — GitLab: a commit job has a rule that a push of only job records does not match", () => {
  const jobs = jobsOf(textOf(generate(defaultSchedule(), GITLAB)), "gitlab");
  for (const row of ["unit", "component", "system"]) {
    const block = jobs[jobName(row, "every commit")];
    const globs = [...(block.match(/^ {6}changes:\n((?: {8}- ".*"\n)+)/m)?.[1] ?? "").matchAll(/- "(.*)"/g)].map((m) => m[1]);
    assert.ok(globs.length > 0, `${row}: no rules:changes`);
    const starts = (files) => files.some((file) => globs.some((glob) => fnmatch(glob, file)));
    assert.equal(starts(["docs/jobs/run-1.md"]), false);
    assert.equal(starts(["docs/conversations/c1.md", "docs/jobs/run-1.md"]), false);
    assert.equal(starts(["docs/jobs/run-1.md", "src/a.mjs"]), true);
    for (const file of ["src/a.mjs", "docs/SPEC.md", "README.md", "docs/jobsx/a.md", "docs/jobs.md", "doc/a.md", "d/a.md"]) assert.equal(starts([file]), true, file);
    assert.ok(!block.includes("git diff"), "no check in the script");
  }
});

// TST-744006 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-027
// given: the default schedule, which ticks the row paid for nightly, release candidate and on demand only; a schedule that ticks paid for every commit
// input: ciConfiguration on GitHub and GitLab for the default; for the other, ciConfiguration on GitHub
// expect: with the default no job paid-every-commit or paid-pull-request and the paid jobs hold neither the push-of-a-branch nor the pull-request condition; with the other the call throws InvalidSchedule whose findings name the row paid and the column every commit, and no file is returned
test("ciConfiguration — the row paid never runs on a commit or a pull request", () => {
  for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
    const jobs = jobsOf(textOf(generate(defaultSchedule(), target)), server);
    assert.deepEqual(Object.keys(jobs).filter((n) => n.startsWith("paid-")).sort(), ["paid-nightly", "paid-on-demand", "paid-release-candidate"]);
    for (const [name, block] of Object.entries(jobs)) if (name === "paid-nightly") {
      assert.ok(!block.includes("pull_request") && !block.includes("merge_request_event"), name);
    }
  }
  const paidOnCommit = scheduleWith({ paid: "| paid | ✓ | | ✓ | ✓ | ✓ | |" });
  assert.throws(() => generate(paidOnCommit, GITHUB), (error) => {
    assert.equal(error.name, "InvalidSchedule");
    assert.equal(error.findings.length, 1);
    assert.equal(error.findings[0].kind, "error");
    assert.ok(error.findings[0].what.includes("paid") && error.findings[0].what.includes("every commit"), error.findings[0].what);
    return true;
  });
});

// TST-744007 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-027
// given: a schedule whose row release leaves the release candidate column empty
// input: ciConfiguration on GitLab
// expect: InvalidSchedule, whose findings name the row release and the column release candidate; no file
test("ciConfiguration — InvalidSchedule names the findings of a schedule with an error", () => {
  const broken = scheduleWith({ release: "| release | | | | | ✓ | |" });
  assert.throws(() => generate(broken, GITLAB), (error) => {
    assert.equal(error.name, "InvalidSchedule");
    assert.deepEqual(error.findings.map((f) => f.rule), ["A RELEASE RUNS EVERY TEST AT EVERY LEVEL"]);
    assert.ok(error.findings[0].what.includes("release") && error.findings[0].what.includes("release candidate"));
    assert.ok(error.message.includes("release candidate"), error.message);
    return true;
  });
});

// TST-744008 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: a schedule whose nightly time is 03:30
// input: ciConfiguration on GitHub and on GitLab
// expect: GitHub: a schedule trigger with the cron "30 3 * * *" and no pipelineSchedule; GitLab: no schedule line in the file and pipelineSchedule { cron: "30 3 * * *", rows } with exactly the rows ticked for nightly
test("ciConfiguration — the nightly run is a schedule on GitHub and a pipeline schedule on GitLab", () => {
  for (const schedule of [scheduleWith({}, "nightly: 03:30"), CHANGED]) {
    const github = generate(schedule, GITHUB);
    assert.equal(github.pipelineSchedule, null);
    assert.ok(github.files[fileOf("github")].includes('- cron: "30 3 * * *"'));
    const gitlab = generate(schedule, GITLAB);
    assert.ok(!gitlab.files[fileOf("gitlab")].includes("cron"));
    assert.deepEqual(gitlab.pipelineSchedule, { cron: "30 3 * * *", rows: ROWS.filter((row) => occasionsOf(row, schedule).includes("nightly")) });
  }
});

// TST-744009 · level: unit · module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-027
// given: the default schedule
// input: the GitHub and GitLab files; the jobs of the occasion release candidate
// expect: the file triggers on a pushed tag v*-rc.*; the jobs of the release candidate are one for each of the six rows
test("ciConfiguration — the release candidate runs every row on a tag v*-rc.*", () => {
  const github = generate(defaultSchedule(), GITHUB).files[fileOf("github")];
  assert.ok(/tags:\s*\n\s+- "v\*-rc\.\*"/.test(github), "the tag trigger");
  for (const [server, text] of [["github", github], ["gitlab", generate(defaultSchedule(), GITLAB).files[fileOf("gitlab")]]]) {
    const names = Object.keys(jobsOf(text, server)).filter((n) => n.endsWith("-release-candidate")).sort();
    assert.deepEqual(names, ROWS.map((row) => jobName(row, "release candidate")).sort());
  }
});

// TST-744010 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the default schedule
// input: the GitHub file's workflow_dispatch trigger; the GitLab file's rules of on-demand jobs
// expect: GitHub: workflow_dispatch with an input rows; GitLab: the on-demand jobs run on the web source naming rows in the variable ROWS
test("ciConfiguration — on demand is a manual start that names its rows", () => {
  const github = generate(defaultSchedule(), GITHUB).files[fileOf("github")];
  assert.ok(/workflow_dispatch:\s*\n\s+inputs:\s*\n\s+rows:/.test(github), "workflow_dispatch with the input rows");
  const gitlab = jobsOf(generate(defaultSchedule(), GITLAB).files[fileOf("gitlab")], "gitlab");
  assert.ok(gitlab["unit-on-demand"].includes('$CI_PIPELINE_SOURCE == "web"') && gitlab["unit-on-demand"].includes("$ROWS"));
});

// TST-744011 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the default schedule and an instance commit
// input: the job agent-m-done of the GitHub and of the GitLab file
// expect: the job runs on pull requests only (pull_request / merge_request_event), is named "agent-m done" on GitHub, runs onDoneCheck from the instance repository at the instance commit
test("ciConfiguration — the job agent-m done runs onDoneCheck at the instance commit on a pull request", () => {
  const github = jobsOf(generate(defaultSchedule(), GITHUB).files[fileOf("github")], "github")["agent-m-done"];
  assert.ok(github.includes("name: agent-m done") && github.includes("github.event_name == 'pull_request'"));
  assert.ok(github.includes("onDoneCheck") && github.includes(COMMIT) && github.includes("acme/agent-m"));
  const gitlab = jobsOf(generate(defaultSchedule(), GITLAB).files[fileOf("gitlab")], "gitlab")["agent-m-done"];
  assert.ok(gitlab.includes('$CI_PIPELINE_SOURCE == "merge_request_event"'));
  assert.ok(gitlab.includes("onDoneCheck") && gitlab.includes(COMMIT) && gitlab.includes("https://git.example.org/acme/agent-m"));
});

// TST-744012 · level: unit · module: MOD-test-schedule
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-027
// given: the default schedule, which names no command; a schedule whose front matter names the command "pytest -q"
// input: the test job unit-pull-request of each file, on GitHub and on GitLab
// expect: the job runs MOD-workflow-entries' runTests at the instance commit, with AGENT_M_COMMAND empty for the default and "pytest -q" for the other; it writes no report path of its own (no AGENT_M_REPORT, no agent-m-report.xml, no --test-reporter), and runs no onTestsFinished — that is the job agent-m records'
test("ciConfiguration — a test job runs runTests with the schedule's command, and hands its report on to agent-m records", () => {
  for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
    const own = scheduleWith({}, "nightly: 03:30\ncommand: pytest -q");
    for (const [schedule, command] of [[defaultSchedule(), ""], [own, "pytest -q"]]) {
      const block = jobsOf(generate(schedule, target).files[fileOf(server)], server)["unit-pull-request"];
      assert.ok(block.includes("node .agent-m/src/workflow-entries/main.mjs runTests") && block.includes(COMMIT), block);
      assert.equal(variable(block, "AGENT_M_COMMAND"), command, `${server}: ${block}`);
      for (const absent of ["AGENT_M_REPORT", "agent-m-report.xml", "--test-reporter", "onTestsFinished"]) assert.ok(!block.includes(absent), `${server}: ${absent}`);
    }
  }
});

// TST-744013 · level: unit · module: MOD-test-schedule
// guards: NO SECRET IN THE REPOSITORY; UC-027
// given: a resource list with a paid endpoint whose Secret is ci:ORACLE_KEY and a paid endpoint holding the value sk-live-abc123def456; a fixture store holding ORACLE_KEY = sk-live-store-7788
// input: ciConfiguration with the default schedule on GitHub and on GitLab; the files and the jobs
// expect: each name secretsNeeded gives (ORACLE_KEY) appears in the jobs of the row paid — on GitHub as ${{ secrets.ORACLE_KEY }} —, in no job of the occasions every commit or pull request; neither value appears in any file
test("ciConfiguration — the secrets by name, never a value", () => {
  const store = { ORACLE_KEY: "sk-live-store-7788" };
  assert.deepEqual(secretsNeeded(defaultSchedule(), resources).map((s) => s.name), ["ORACLE_KEY"]);
  for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
    const result = generate(defaultSchedule(), target);
    const text = textOf(result);
    assert.ok(!text.includes(store.ORACLE_KEY) && !text.includes("sk-live-abc123def456"), "a value in the file");
    const jobs = jobsOf(result.files[fileOf(server)], server);
    for (const name of ["paid-nightly", "paid-release-candidate", "paid-on-demand"]) assert.ok(jobs[name].includes("ORACLE_KEY"), name);
    if (server === "github") assert.ok(jobs["paid-nightly"].includes("${{ secrets.ORACLE_KEY }}"));
    for (const name of Object.keys(jobs).filter((n) => !n.startsWith("paid-"))) assert.ok(!jobs[name].includes("ORACLE_KEY"), name);
  }
});

// TST-744014 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the changed fixture schedule, whose row component runs on lab-runner (runner label lab) and whose other rows run hosted
// input: the jobs of the row component and of the row unit, on GitHub and on GitLab
// expect: GitHub: runs-on [self-hosted, lab] for component and ubuntu-latest for unit; GitLab: tags [lab] for component and no tags for unit
test("ciConfiguration — a row on a self-hosted runner runs on it", () => {
  const github = jobsOf(generate(CHANGED, GITHUB).files[fileOf("github")], "github");
  assert.ok(github["component-pull-request"].includes("runs-on: [self-hosted, lab]"));
  assert.ok(github["unit-pull-request"].includes("runs-on: ubuntu-latest"));
  const gitlab = jobsOf(generate(CHANGED, GITLAB).files[fileOf("gitlab")], "gitlab");
  assert.ok(gitlab["component-pull-request"].includes("tags: [lab]"));
  assert.ok(!gitlab["unit-pull-request"].includes("tags:"));
});

// ------------------------------------------------------------------------------------------------ ITM-1214

// A schedule that declares shards, a command, a setup, a cache and a time limit: unit in 3 shards, system in 2, paid in 4, component with
// the column empty (one shard), the occasions those of the book's default.
const SHARDS_HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on | shards |\n|---|---|---|---|---|---|---|---|";
const SETUP = "sudo apt-get install --yes xvfb openbox";
const FRONT = ["nightly: 02:00", "command: ./tests/run.sh", `setup: ${SETUP}`, "cache:", "  - /home/runner/apt-archives", "  - /home/runner/apt-lists", "minutes: 2"];
function shardedWith(front = FRONT) {
  const rows = ["| unit | ✓ | ✓ | ✓ | ✓ | ✓ | | 3 |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | | |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | | 2 |",
    "| paid | | | ✓ | ✓ | ✓ | | 4 |", "| release | | | | ✓ | ✓ | | |", "| user | | | | ✓ | ✓ | | |"];
  return readDocument(scheduleSchema, "docs/tests/schedule.md", `---\n${front.join("\n")}\n---\n## Levels\n\n${SHARDS_HEAD}\n${rows.join("\n")}\n`);
}
const SHARDED = shardedWith();
const SHARDS = { unit: 3, component: 1, system: 2, paid: 4, release: 1, user: 1 };
const OCCASION_VALUE = { "every commit": "commit", "pull request": "pull-request", nightly: "nightly", "release candidate": "release-candidate", "on demand": "on-demand" };
const SERVERS = [["github", GITHUB], ["gitlab", GITLAB]];
const jobsFor = (schedule, server, target) => jobsOf(generate(schedule, target).files[fileOf(server)], server);
// The names a job lists under needs: GitHub's `needs: [a, b]` or `needs: a`; GitLab's `- job: a` or `- a` items under needs:.
function needsOf(block) {
  const inline = /^ {4}needs: \[(.*)\]\s*$/m.exec(block) ?? /^ {4}needs: (\S+)\s*$/m.exec(block);
  if (inline) return inline[1].split(",").map((n) => n.trim()).filter(Boolean);
  const list = /^ {2}needs:\n((?: {4}.*\n?)+)/m.exec(block)?.[1] ?? "";
  return [...list.matchAll(/^ {4}- (?:job: )?([A-Za-z0-9-]+)\s*$/gm)].map((m) => m[1]);
}
// The jobs of a file that hold the person's token: a job naming AGENT_M_TOKEN, or on GitLab a job of the environment agent-m-write.
const tokenHolders = (jobs) => Object.entries(jobs).filter(([, block]) => block.includes("AGENT_M_TOKEN") || block.includes("agent-m-write")).map(([name]) => name).sort();

// TST-1214001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the schedule SHARDED — unit in 3 shards, system in 2, paid in 4, component with the column shards empty —; and the book's default, which has no column shards
// input: ciConfiguration on GitHub and on GitLab; every test job
// expect: GitHub: each test job runs the matrix `shard: [1, …, n]` of its row's n shards (component and every row of the default: [1]) with fail-fast false, AGENT_M_SHARD ${{ matrix.shard }}; GitLab: a row of n > 1 shards gives `parallel: n` and AGENT_M_SHARD $CI_NODE_INDEX, a row of one shard no parallel: and AGENT_M_SHARD 1; AGENT_M_SHARDS n on both
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: a row's shards give a ${server === "github" ? "matrix" : "parallel:"} of that size`, () => {
    for (const [schedule, shards] of [[SHARDED, SHARDS], [defaultSchedule(), Object.fromEntries(ROWS.map((row) => [row, 1]))]]) {
      const jobs = jobsFor(schedule, server, target);
      for (const row of ROWS) for (const occasion of occasionsOf(row, schedule)) {
        const block = jobs[jobName(row, occasion)];
        const n = shards[row];
        assert.equal(variable(block, "AGENT_M_SHARDS"), String(n), `${row} ${occasion}`);
        if (server === "github") {
          const matrix = /^ {6}matrix:\n {8}shard: \[([^\]]*)\]\s*$/m.exec(block)?.[1];
          assert.deepEqual(matrix?.split(",").map((x) => Number(x.trim())), Array.from({ length: n }, (_, i) => i + 1), `${row} ${occasion}: ${block}`);
          assert.ok(/^ {6}fail-fast: false\s*$/m.test(block), `${row} ${occasion}: every shard runs to its end`);
          assert.equal(variable(block, "AGENT_M_SHARD"), "${{ matrix.shard }}");
        } else if (n > 1) {
          assert.ok(new RegExp(`^ {2}parallel: ${n}\\s*$`, "m").test(block), `${row} ${occasion}: ${block}`);
          assert.equal(variable(block, "AGENT_M_SHARD"), "$CI_NODE_INDEX");
        } else {
          assert.ok(!/^ {2}parallel:/m.test(block), `${row} ${occasion}: no parallel: for one shard`);
          assert.equal(variable(block, "AGENT_M_SHARD"), "1");
        }
      }
    }
  });
}

// TST-1214002 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; COMMIT TESTS CALL NO PAID SERVICE; NO SECRET IN THE REPOSITORY; UC-027
// given: the schedule SHARDED, whose command is ./tests/run.sh and whose setup installs xvfb and openbox; the resources whose paid endpoint's secret is ci:ORACLE_KEY
// input: every test job, on GitHub and on GitLab
// expect: AGENT_M_ROW the row; AGENT_M_OCCASION commit, pull-request, nightly, release-candidate or on-demand; AGENT_M_COMMAND ./tests/run.sh; AGENT_M_SECRETS ORACLE_KEY for the row paid and empty for every other; no AGENT_M_REPORT and no AGENT_M_LEVEL set by the job; the job runs the setup, then runTests, and keeps the folder agent-m-reports/ whatever the outcome — on GitHub with upload-artifact under `if: always()`, named <occasion>.<row>.${{ matrix.shard }}; on GitLab as artifacts `when: always`
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: a test job sets the variables of a test job, runs setup then runTests, and keeps its report and status`, () => {
    const jobs = jobsFor(SHARDED, server, target);
    for (const row of ROWS) for (const occasion of occasionsOf(row, SHARDED)) {
      const block = jobs[jobName(row, occasion)];
      const where = `${row} ${occasion}`;
      assert.equal(variable(block, "AGENT_M_ROW"), row, where);
      assert.equal(variable(block, "AGENT_M_OCCASION"), OCCASION_VALUE[occasion], where);
      assert.equal(variable(block, "AGENT_M_COMMAND"), "./tests/run.sh", where);
      assert.equal(variable(block, "AGENT_M_SECRETS"), row === "paid" ? "ORACLE_KEY" : "", where);
      assert.equal(variable(block, "AGENT_M_REPORT"), undefined, where);
      assert.equal(variable(block, "AGENT_M_LEVEL"), undefined, where);
      const setupAt = block.lastIndexOf(SETUP);
      const runAt = block.indexOf("node .agent-m/src/workflow-entries/main.mjs runTests");
      assert.ok(setupAt > 0 && runAt > setupAt, `${where}: setup, then runTests`);
      if (server === "github") {
        const keep = block.slice(block.indexOf("uses: actions/upload-artifact@v4") - 60);
        assert.ok(block.includes("uses: actions/upload-artifact@v4") && /if: always\(\)/.test(keep), `${where}: ${block}`);
        assert.ok(keep.includes(`name: ${OCCASION_VALUE[occasion]}.${row}.\${{ matrix.shard }}`) && keep.includes("path: agent-m-reports/"), `${where}: ${keep}`);
      } else {
        assert.ok(/^ {2}artifacts:\n(?: {4}.*\n)*? {4}when: always\s*$/m.test(block) && block.includes("- agent-m-reports/"), `${where}: ${block}`);
      }
    }
  });
}

// TST-1214003 · level: unit · module: MOD-test-schedule
// guards: A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the schedule SHARDED, whose minutes is 2; the same with minutes 7; the book's default, which sets no time limit
// input: every job of the GitHub and of the GitLab file
// expect: with minutes m, every job a commit or a pull request runs — the test jobs of those two occasions, agent-m-setup, agent-m-records and agent-m-done — carries on the job itself GitHub's `timeout-minutes: m` or GitLab's `timeout: m minutes`; the test jobs of the occasions nightly, release candidate and on demand carry none; with the default no job carries one
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: every job of a commit or a pull request carries minutes as its time limit`, () => {
    const limit = (block) => (server === "github" ? /^ {4}timeout-minutes: (\d+)\s*$/m : /^ {2}timeout: (\d+) minutes\s*$/m).exec(block)?.[1];
    const bound = (name) => name.startsWith("agent-m-") || name.endsWith("-every-commit") || name.endsWith("-pull-request");
    for (const [schedule, minutes] of [[SHARDED, "2"], [shardedWith(FRONT.map((l) => (l === "minutes: 2" ? "minutes: 7" : l))), "7"]]) {
      const jobs = jobsFor(schedule, server, target);
      for (const name of ["agent-m-setup", "agent-m-records", "agent-m-done"]) assert.ok(name in jobs, name);
      for (const [name, block] of Object.entries(jobs)) assert.equal(limit(block), bound(name) ? minutes : undefined, `${name}: ${block}`);
    }
    for (const [name, block] of Object.entries(jobsFor(defaultSchedule(), server, target))) assert.equal(limit(block), undefined, name);
  });
}

// TST-1214004 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES; UC-027
// given: the schedule SHARDED, whose cache names /home/runner/apt-archives and /home/runner/apt-lists; the same with another setup; the same without the key cache; the book's default
// input: the jobs of the GitHub and of the GitLab file
// expect: with a cache, one job agent-m-setup that runs the setup and keeps both paths under a key made of the setup and the week (`date -u +%G-W%V`) — another setup gives another key —, and every test job restores those paths (GitHub: needs agent-m-setup and restores with actions/cache/restore@v4 under the key agent-m-setup gives; GitLab: agent-m-setup in the stage .pre, the test jobs pull the same cache key); without a cache no job agent-m-setup and no cache in any job, while the test jobs still run the setup; with the default neither the job nor the setup
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: the job agent-m setup appears only where cache names paths`, () => {
    const keyOf = (block) => (server === "github" ? /^ {10}key: (.*)$/m : /^ {4}key: (.*)$/m).exec(block)?.[1];
    const jobs = jobsFor(SHARDED, server, target);
    const setup = jobs["agent-m-setup"];
    assert.ok(setup, "the job agent-m-setup");
    assert.ok(setup.includes(SETUP) && setup.includes("date -u +%G-W%V"), setup);
    for (const path of ["/home/runner/apt-archives", "/home/runner/apt-lists"]) assert.ok(setup.includes(path), path);
    const other = jobsFor(shardedWith(FRONT.map((l) => (l.startsWith("setup:") ? "setup: sudo apt-get install --yes xvfb" : l))), server, target)["agent-m-setup"];
    const named = (block) => block.match(/agent-m-setup-[0-9a-f]+/)?.[0];
    assert.ok(named(setup) && named(setup) !== named(other), "a key made of the setup: another setup, another key");
    if (server === "github") {
      assert.ok(setup.includes("uses: actions/cache@v4") && keyOf(setup) === "${{ steps.key.outputs.key }}", setup);
    } else {
      assert.match(setup, /^ {2}stage: \.pre\s*$/m);
      assert.equal(keyOf(setup), named(setup));
    }
    for (const name of testJobs(jobs)) {
      const block = jobs[name];
      if (server === "github") {
        assert.ok(needsOf(block).includes("agent-m-setup"), `${name}: ${block}`);
        assert.ok(block.includes("uses: actions/cache/restore@v4") && keyOf(block) === "${{ needs.agent-m-setup.outputs.key }}", `${name}: ${block}`);
      } else {
        assert.equal(keyOf(block), keyOf(setup), name);
        assert.ok(/^ {4}policy: pull\s*$/m.test(block), `${name}: ${block}`);
      }
      assert.ok(block.includes("/home/runner/apt-archives") && block.includes("/home/runner/apt-lists"), name);
    }
    const uncached = jobsFor(shardedWith(FRONT.filter((l) => !l.startsWith("cache:") && !l.startsWith("  - "))), server, target);
    assert.ok(!("agent-m-setup" in uncached), "no job agent-m-setup without a cache");
    for (const [name, block] of Object.entries(uncached)) {
      assert.ok(!block.includes("actions/cache") && !/^ {2}cache:/m.test(block), `${name}: no cache`);
      if (!name.startsWith("agent-m-")) assert.ok(block.includes(SETUP), `${name}: the setup still runs`);
    }
    const plain = jobsFor(defaultSchedule(), server, target);
    assert.ok(!("agent-m-setup" in plain));
    for (const [name, block] of Object.entries(plain)) assert.ok(!block.includes(SETUP) && !block.includes("actions/cache"), name);
  });
}

// TST-1214005 · level: unit · module: MOD-test-schedule
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the schedule SHARDED and the book's default; then, as counter-proof, the generated file with the line `AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}` (GitHub) or the environment agent-m-write (GitLab) planted into the test job unit-pull-request
// input: the jobs of the GitHub and of the GitLab file that name the token — AGENT_M_TOKEN, or on GitLab the environment agent-m-write
// expect: exactly agent-m-done and agent-m-records; GitHub: both read it as `AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}`, and no test job reads a secret but the paid service's; GitLab: both are of the environment agent-m-write with the action verify and take neither default: nor the global variables:, and no test job is of an environment; the planted file names unit-pull-request too, so the check fails it
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: the token stands in agent-m records and agent-m done alone`, () => {
    for (const schedule of [SHARDED, defaultSchedule()]) {
      const jobs = jobsFor(schedule, server, target);
      assert.deepEqual(tokenHolders(jobs), ["agent-m-done", "agent-m-records"]);
      for (const name of ["agent-m-done", "agent-m-records"]) {
        const block = jobs[name];
        if (server === "github") assert.equal(variable(block, "AGENT_M_TOKEN"), "${{ secrets.AGENT_M_TOKEN }}", name);
        else {
          assert.ok(/^ {2}environment:\n {4}name: agent-m-write\n {4}action: verify\s*$/m.test(block), `${name}: ${block}`);
          assert.ok(/^ {2}inherit:\n {4}default: false\n {4}variables: false\s*$/m.test(block), `${name}: ${block}`);
        }
      }
      for (const name of testJobs(jobs)) {
        const block = jobs[name];
        if (server === "github") {
          const read = [...block.matchAll(/secrets\.([A-Za-z0-9_]+)/g)].map((m) => m[1]);
          assert.deepEqual(read, name.startsWith("paid-") ? ["ORACLE_KEY"] : [], name);
        } else assert.ok(!/^ {2}environment:/m.test(block), name);
      }
    }
    const text = generate(SHARDED, target).files[fileOf(server)];
    const jobs = jobsOf(text, server);
    const planted = server === "github"
      ? text.replace(jobs["unit-pull-request"], jobs["unit-pull-request"].replace("    env:\n", "    env:\n      AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}\n"))
      : text.replace(jobs["unit-pull-request"], jobs["unit-pull-request"].replace("  stage: test\n", "  stage: test\n  environment:\n    name: agent-m-write\n    action: verify\n"));
    assert.notEqual(planted, text, "the plant took");
    assert.deepEqual(tokenHolders(jobsOf(planted, server)), ["agent-m-done", "agent-m-records", "unit-pull-request"]);
  });
}

// TST-1214006 · level: unit · module: MOD-test-schedule
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the schedule SHARDED and the book's default
// input: the job agent-m-records of the GitHub and of the GitLab file
// expect: it runs MOD-workflow-entries' onTestsFinished from the instance at the instance commit after every test job, whatever their outcome, with the reports of the run in agent-m-reports/, and keeps its status: GitHub — named agent-m records, needs every test job, `if: ${{ !cancelled() }}`, download-artifact into agent-m-reports with merge-multiple before the entry, upload-artifact of agent-m-reports/records.status under `if: always()`; GitLab — in the stage .post, each of its rules `when: always`, artifacts agent-m-reports/ `when: always`
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: agent-m records runs onTestsFinished after every test job, whatever their outcome`, () => {
    for (const schedule of [SHARDED, defaultSchedule()]) {
      const jobs = jobsFor(schedule, server, target);
      const block = jobs["agent-m-records"];
      assert.ok(block.includes("node .agent-m/src/workflow-entries/main.mjs onTestsFinished") && block.includes(COMMIT), block);
      if (server === "github") {
        assert.match(block, /^ {4}name: agent-m records\s*$/m);
        assert.deepEqual([...needsOf(block)].sort(), testJobs(jobs));
        assert.match(block, /^ {4}if: \$\{\{ !cancelled\(\) \}\}\s*$/m);
        assert.ok(block.includes("uses: actions/download-artifact@v4") && block.includes("path: agent-m-reports") && block.includes("merge-multiple: true"), block);
        assert.ok(block.indexOf("actions/download-artifact@v4") < block.indexOf("onTestsFinished"), "the reports, then the record");
        const keep = block.slice(block.lastIndexOf("uses: actions/upload-artifact@v4") - 60);
        assert.ok(/if: always\(\)/.test(keep) && keep.includes("path: agent-m-reports/records.status"), keep);
      } else {
        assert.match(block, /^ {2}stage: \.post\s*$/m);
        const rules = [...block.matchAll(/^ {4}- if: /gm)].length;
        assert.ok(rules > 0 && [...block.matchAll(/^ {6}when: always\s*$/gm)].length === rules, block);
        assert.ok(/^ {2}artifacts:\n(?: {4}.*\n)*? {4}when: always\s*$/m.test(block) && block.includes("- agent-m-reports/"), block);
      }
    }
  });
}

// TST-1214007 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the schedule SHARDED, which ticks unit (3 shards), component (1) and system (2) for a pull request; the book's default (one shard each)
// input: the job agent-m-done of the GitHub and of the GitLab file
// expect: AGENT_M_EXPECTED "unit:3,component:1,system:2" for SHARDED and "unit:1,component:1,system:1" for the default; it runs onDoneCheck at the instance commit with the run's artifacts in agent-m-reports/, after the pull request's test jobs and agent-m-records, whatever their outcome: GitHub — needs exactly the pull-request test jobs and agent-m-records, its `if:` holding !cancelled() and the pull_request event, download-artifact into agent-m-reports with merge-multiple before the entry; GitLab — in the stage .post, needs agent-m-records with its artifacts, its one rule merge_request_event `when: always`
for (const [server, target] of SERVERS) {
  test(`ciConfiguration — ${server}: agent-m done needs the test jobs and agent-m records and runs whatever their outcome`, () => {
    for (const [schedule, expected] of [[SHARDED, "unit:3,component:1,system:2"], [defaultSchedule(), "unit:1,component:1,system:1"]]) {
      const jobs = jobsFor(schedule, server, target);
      const block = jobs["agent-m-done"];
      assert.equal(variable(block, "AGENT_M_EXPECTED"), expected);
      assert.ok(block.includes("node .agent-m/src/workflow-entries/main.mjs onDoneCheck") && block.includes(COMMIT), block);
      if (server === "github") {
        const pullRequestJobs = testJobs(jobs).filter((n) => n.endsWith("-pull-request"));
        assert.deepEqual([...needsOf(block)].sort(), [...pullRequestJobs, "agent-m-records"].sort());
        const condition = /^ {4}if: (.*)$/m.exec(block)?.[1] ?? "";
        assert.ok(condition.includes("!cancelled()") && condition.includes("github.event_name == 'pull_request'"), condition);
        assert.ok(block.includes("uses: actions/download-artifact@v4") && block.includes("path: agent-m-reports") && block.includes("merge-multiple: true"), block);
        assert.ok(block.indexOf("actions/download-artifact@v4") < block.indexOf("onDoneCheck"));
      } else {
        assert.match(block, /^ {2}stage: \.post\s*$/m);
        assert.deepEqual(needsOf(block), ["agent-m-records"]);
        assert.match(block, /^ {6}artifacts: true\s*$/m);
        assert.deepEqual([...block.matchAll(/^ {4}- if: (.*)$/gm)].map((m) => m[1]), [`'$CI_PIPELINE_SOURCE == "merge_request_event"'`]);
        assert.match(block, /^ {6}when: always\s*$/m);
      }
    }
  });
}

// TST-1214008 · level: unit · module: MOD-test-schedule
// guards: A JOB RECORD STARTS NO CI RUN; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: the files generated from SHARDED, which hold agent-m-setup, agent-m-records and agent-m-done besides the test jobs; pushes of a branch that change (a) only docs/jobs/run-1.md, (b) docs/conversations/c1.md and docs/jobs/run-1.md, (c) docs/jobs/run-1.md and src/a.mjs
// input: GitHub: the push trigger's paths-ignore; GitLab: every rule of every job whose `if` admits a push of a branch, read with its `changes` globs (Ruby's File.fnmatch)
// expect: (a) and (b) start nothing — no GitHub run, no GitLab job, agent-m-setup and agent-m-records included —; (c) starts a run, and on GitLab exactly the commit test jobs, agent-m-setup and agent-m-records
test("ciConfiguration — a push that records only jobs starts nothing, Agent M's own jobs included", () => {
  const github = generate(SHARDED, GITHUB).files[fileOf("github")];
  assert.equal(pushStarts(github, ["docs/jobs/run-1.md"]), false);
  assert.equal(pushStarts(github, ["docs/conversations/c1.md", "docs/jobs/run-1.md"]), false);
  assert.equal(pushStarts(github, ["docs/jobs/run-1.md", "src/a.mjs"]), true);
  const jobs = jobsOf(generate(SHARDED, GITLAB).files[fileOf("gitlab")], "gitlab");
  // Whether a job is added to the pipeline of a push of a branch that changes `files`: one of its rules admits a push and either names no
  // changes or has a glob that matches one of the files.
  const added = (block, files) => block.split(/^ {4}- if: /m).slice(1).some((rule) => {
    const condition = rule.split("\n")[0];
    if (!condition.includes('$CI_PIPELINE_SOURCE == "push"')) return false;
    const globs = [...(/^ {6}changes:\n((?: {8}- ".*"\n?)+)/m.exec(rule)?.[1] ?? "").matchAll(/- "(.*)"/g)].map((m) => m[1]);
    return globs.length === 0 || files.some((file) => globs.some((glob) => fnmatch(glob, file)));
  });
  for (const files of [["docs/jobs/run-1.md"], ["docs/conversations/c1.md", "docs/jobs/run-1.md"]]) {
    assert.deepEqual(Object.keys(jobs).filter((name) => added(jobs[name], files)), [], files.join(" "));
  }
  const started = Object.keys(jobs).filter((name) => added(jobs[name], ["docs/jobs/run-1.md", "src/a.mjs"])).sort();
  assert.deepEqual(started, ["agent-m-records", "agent-m-setup", "component-every-commit", "system-every-commit", "unit-every-commit"]);
});
