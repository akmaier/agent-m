// The CI configuration generated from a schedule (ITM-744) — MOD-test-schedule's ciConfiguration(schedule, target,
// resources, participants), as the accepted text of docs/architecture/MOD-test-schedule.md states it under Data and
// Interfaces: a GitHub Actions workflow or a GitLab CI file with one job per ticked row and occasion, nothing for a push
// that changes only job records, the nightly run, the release candidate on a tag, the manual start, the job agent-m done,
// the step that hands the JUnit XML report on, and the secrets by name.
// Run: node --test tests/test-schedule-ci-configuration.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A JOB RECORD STARTS NO CI RUN; COMMIT TESTS CALL NO PAID SERVICE; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; GITLAB PRODUCTS ARE SUPPORTED; NO SECRET IN THE REPOSITORY
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
const fileOf = (server) => (server === "github" ? ".github/workflows/agent-m-tests.yml" : ".gitlab/agent-m-tests.yml");
const testJobs = (jobs) => Object.keys(jobs).filter((name) => name !== "agent-m-done").sort();
const expectedJobs = (schedule) => ROWS.flatMap((row) => occasionsOf(row, schedule).map((o) => jobName(row, o))).sort();

// What starts a run on a push to a branch, read from the GitHub file: the files of the push that match no paths-ignore
// pattern (`dir/**`); the push starts a run when one file remains.
function pushStarts(text, files) {
  const ignore = [...text.slice(text.indexOf("paths-ignore:")).matchAll(/^\s+- (\S+\/)\*\*\s*$/gm)].map((m) => m[1]);
  if (!text.includes("paths-ignore:")) return true;
  return files.some((file) => !ignore.some((dir) => file.startsWith(dir)));
}

// TST-744001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (5)
// given: the book's default schedule and a changed fixture schedule (unit only on a pull request and at the release candidate and on demand, system only nightly and later, component on the self-hosted runner lab)
// input: ciConfiguration(schedule, target, resources, participants) for each schedule on GitHub and on GitLab
// expect: GitHub: one file, .github/workflows/agent-m-tests.yml, no include entry, no pipeline schedule; GitLab: one file, .gitlab/agent-m-tests.yml, the include entry { file: ".gitlab-ci.yml", entry: "- local: .gitlab/agent-m-tests.yml" }; in each file exactly the jobs named <row>-<occasion> that occasionsOf ticks, plus agent-m-done
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
    }
  });
}

// TST-744002 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (5)
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
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (5)
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
// guards: A JOB RECORD STARTS NO CI RUN; UC-027 (7)
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
// guards: A JOB RECORD STARTS NO CI RUN; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (7)
// given: the GitLab file generated from the default schedule
// input: the script of each job of the occasion every commit
// expect: each begins with a check of the files the push changed that ends the job at once when all lie under docs/jobs/ or docs/conversations/, and that lets the job run when any other file changed
test("ciConfiguration — GitLab: a commit job ends at once for a push that records only jobs", () => {
  const jobs = jobsOf(textOf(generate(defaultSchedule(), GITLAB)), "gitlab");
  for (const row of ["unit", "component", "system"]) {
    const block = jobs[jobName(row, "every commit")];
    const script = block.slice(block.indexOf("script:"));
    const guard = script.match(/^\s+- (.*git diff.*)$/m)?.[1] ?? "";
    assert.ok(guard.includes("CI_COMMIT_BEFORE_SHA") && guard.includes("^docs/jobs/") && guard.includes("^docs/conversations/"), guard);
    assert.ok(guard.includes("exit 0"), guard);
    assert.ok(script.indexOf("git diff") < script.indexOf("onTestsFinished") || !script.includes("onTestsFinished"));
  }
});

// TST-744006 · level: unit · module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-027 (2)
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
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-027 (2)
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
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (3a)
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
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; UC-027 (5)
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
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (5)
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
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (5, 6)
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
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-027 (7)
// given: the default schedule; a schedule whose front matter names the command "pytest -q" and the report "build/junit.xml"
// input: a test job of each file
// expect: the job runs the tests (for the default with node's test runner and its JUnit reporter, for the other with the command), then hands the report to onTestsFinished at the instance commit — the report agent-m-report.xml for the default, build/junit.xml for the other
test("ciConfiguration — after its tests every job hands the JUnit XML report to onTestsFinished", () => {
  for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
    const plain = jobsOf(generate(defaultSchedule(), target).files[fileOf(server)], server)["unit-pull-request"];
    assert.ok(plain.includes("--test-reporter=junit") && plain.includes("agent-m-report.xml"), plain);
    assert.ok(plain.indexOf("--test-reporter=junit") < plain.indexOf("main.mjs onTestsFinished"), "tests, then the report");
    assert.ok(plain.includes("main.mjs onTestsFinished") && plain.includes(COMMIT));
    const own = scheduleWith({}, "nightly: 03:30\ncommand: pytest -q\nreport: build/junit.xml");
    const custom = jobsOf(generate(own, target).files[fileOf(server)], server)["unit-pull-request"];
    assert.ok(custom.includes("pytest -q") && !custom.includes("--test-reporter=junit"), custom);
    assert.ok(custom.indexOf("pytest -q") < custom.indexOf("main.mjs onTestsFinished") && custom.includes("build/junit.xml"), custom);
  }
});

// TST-744013 · level: unit · module: MOD-test-schedule
// guards: NO SECRET IN THE REPOSITORY; UC-027 (4)
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
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (3)
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
