// ITM-476 / JOB-20261015-2005-50c5: the eight accepted remaining public schedule interfaces.
// Module: MOD-test-schedule
// Guards: UC-027; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// Level: unit
// Run: node --test tests/test-schedule-implementation.test.mjs
// Runtime selection by declaration is deliberately separate pending its public-dependency clarification.
// No source-private imports, live network, real fixture writes, or changes to the retained CI.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as schedule from "../src/test-schedule/index.mjs";
import { readDocument, readRegister, documentFindings } from "../src/documents/index.mjs";
import { participantSchema, participantsOf } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";
import { connect, parseAddress, HostError } from "../src/repository-hosts/index.mjs";

const fixture = (name) => readFileSync(new URL(`./fixtures/test-schedule/${name}`, import.meta.url), "utf8");
const rows = (document) => document.sections.find((section) => section.heading === "## Levels").rows;
const cells = (document, name) => rows(document).find((row) => row.cells.Row === name).cells;
const participants = () => readDocument(participantSchema(), "docs/participants.md", fixture("participants.md"));
const resources = () => readRegister(resourceSchema(), "docs/resources.md", fixture("resources.md")).document;
const product = () => readDocument(schedule.scheduleSchema, "docs/tests/schedule.md", fixture("product.md"));
const PIN = "cc755f81316807ee48a1bec4cee92561fcc4b8f9";
const HEAD = "1234567890123456789012345678901234567890";
const WRITTEN = "abcdefabcdefabcdefabcdefabcdefabcdefabcd";
const target = (server) => ({ server, instance: "https://github.com/example/instance", instanceCommit: PIN });
const functionOf = (name) => {
  assert.equal(typeof schedule[name], "function", `public MOD-test-schedule.${name} is implemented`);
  return schedule[name];
};
// The existing Bridge lock pins js-yaml; retained CI installs it before Node tests.
// Load after the public API assertion so a missing export is the first-commit failure node.
const yaml = (text) => createRequire(new URL("../src/bridge-build/package.json", import.meta.url))("js-yaml").load(text);
const textOfSteps = (job) => (job.steps ?? []).map((step) => step.run ?? "").join("\n");
const scriptOf = (job) => [job.before_script, job.script, job.after_script].flat(2).filter(Boolean).join("\n");
const levelsOf = (job, server) => String((server === "github" ? job.env : job.variables)?.AGENT_M_LEVELS ?? "")
  .split(/\s+/).filter(Boolean);

function hostFixture(server, initial = {}) {
  const repository = parseAddress(server === "github" ? "https://github.com/example/product" : "https://gitlab.example.org/group/product");
  const files = { ...initial }, calls = [];
  const snapshot = { repository, ref: "integration/ci", commit: HEAD, paths: Object.keys(files),
    read: async (path) => files[path] ?? null, blob: () => null };
  const pullRequest = { number: 27, title: "Schedule", branch: "", base: "integration/ci", head: WRITTEN,
    state: "open", draft: false, url: `${repository.web}/pull/27`, opened: "2026-10-15T20:00:00Z", merged: null, closed: null };
  const host = {
    webLinks: () => connect(repository).webLinks(),
    repositoryInfo: async () => { calls.push(["repositoryInfo"]); return { defaultBranch: "integration/ci", canWrite: true,
      visibility: "private", archived: false, description: "Fixture" }; },
    readSnapshot: async (ref) => { calls.push(["readSnapshot", ref]); return snapshot; },
    createBranch: async (name, from) => { calls.push(["createBranch", name, from]); },
    commitFiles: async (change) => { calls.push(["commitFiles", structuredClone(change)]); return { commit: WRITTEN, url: `${repository.web}/commit/${WRITTEN}` }; },
    openPullRequest: async (request) => { calls.push(["openPullRequest", structuredClone(request)]);
      return { ...pullRequest, ...request }; },
    setPipelineSchedule: async (request) => { calls.push(["setPipelineSchedule", structuredClone(request)]);
      return { id: "71", url: connect(repository).webLinks().pipelineSchedules }; },
  };
  return { host, calls, snapshot };
}
const writes = (calls) => calls.filter(([method]) => ["createBranch", "commitFiles", "openPullRequest", "setPipelineSchedule"].includes(method));
const context = (server, trailers = []) => ({ ...target(server), resources: resources(), participants: participants(), head: HEAD, trailers });

// TST-476500
// level: unit
// module: MOD-test-schedule
// guards: THE DEFAULT SCHEDULE FOLLOWS THE BOOK; THE TEST SCHEDULE IS DECLARED PER PRODUCT
// given: existing public schemas/default and the readable product/participant/resource fixtures
// input: defaultSchedule, readDocument, readRegister and participantsOf
// expect: the default has all six RC rows; the custom schema reads 03:30, system runner and report; all three fixtures validate and public participantsOf reads the runner route
test("TST-476500: public schema/default and input registries are positive controls", () => {
  const defaults = schedule.defaultSchedule(), custom = product(), people = participants(), services = resources();
  assert.equal(defaults.default, true);
  assert.deepEqual(rows(defaults).map((row) => row.cells.Row), ["unit", "component", "system", "paid", "release", "user"]);
  assert.ok(rows(defaults).every((row) => row.cells["release candidate"] === "✓"));
  assert.equal(custom.fields.nightly, "03:30");
  assert.equal(custom.fields.report, "build/results.xml");
  assert.equal(cells(custom, "system")["runs on"], "lab-runner");
  assert.deepEqual(documentFindings(schedule.scheduleSchema, custom), []);
  assert.deepEqual(documentFindings(participantSchema(), people), []);
  assert.deepEqual(documentFindings(resourceSchema(), services), []);
  assert.equal(participantsOf(people)[0].route, "ci runner:lab-linux secret RUNNER_KEY");
});

// TST-476501
// level: unit
// module: MOD-test-schedule
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED
// given: the completed public Host on both platforms and a constructed project response
// input: connect, webLinks.actions/pipelineSchedules, repositoryInfo and the prerequisite method availability
// expect: existing actions and schedule pages, both completed methods, and the controlled default branch after exactly one fake GET per platform
test("TST-476501: public Host prerequisites are positive controls", async () => {
  const original = globalThis.fetch, sent = [];
  globalThis.fetch = async (input) => {
    sent.push(String(input));
    return new Response(JSON.stringify({ default_branch: "integration/ci", private: true, visibility: "private",
      archived: false, description: "Fixture", permissions: { push: true, project_access: { access_level: 40 } } }), { status: 200 });
  };
  try {
    for (const server of ["github", "gitlab"]) {
      const address = parseAddress(server === "github" ? "https://github.com/example/product" : "https://gitlab.example.org/group/product");
      const host = connect(address), links = host.webLinks();
      assert.equal(links.actions, `${address.web}${server === "github" ? "/actions" : "/-/pipelines"}`);
      assert.equal(links.pipelineSchedules, server === "github" ? null : `${address.web}/-/pipeline_schedules`);
      assert.equal(typeof host.setPipelineSchedule, "function");
      assert.equal(typeof host.openPullRequest, "function");
      assert.equal((await host.repositoryInfo()).defaultBranch, "integration/ci");
    }
    assert.equal(sent.length, 2);
  } finally { globalThis.fetch = original; }
});

// TST-476502
// level: unit
// module: MOD-test-schedule
// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL; COMMIT TESTS CALL NO PAID SERVICE
// given: a valid schedule then missing system RC and paid commit/PR ticks
// input: scheduleFindings(schedule, participants)
// expect: valid is clean; each invalid cell has an error naming its row/column and the guarded rule
test("TST-476502: findings identify release and paid-occasion violations", () => {
  const find = functionOf("scheduleFindings"), valid = product(), people = participants();
  assert.deepEqual(find(valid, people), []);
  const invalid = structuredClone(valid);
  delete cells(invalid, "system")["release candidate"];
  cells(invalid, "paid")["every commit"] = "✓";
  cells(invalid, "paid")["pull request"] = "✓";
  const found = find(invalid, people);
  for (const [row, column, rule] of [["system", "release candidate", "A RELEASE RUNS EVERY TEST AT EVERY LEVEL"],
    ["paid", "every commit", "COMMIT TESTS CALL NO PAID SERVICE"], ["paid", "pull request", "COMMIT TESTS CALL NO PAID SERVICE"]]) {
    assert.ok(found.some((mark) => mark.kind === "error" && mark.rule === rule && mark.artifact === invalid.path
      && `${mark.what} ${mark.fix}`.includes(row) && `${mark.what} ${mark.fix}`.includes(column)), `${row}/${column}`);
  }
});

// TST-476503
// level: unit
// module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: lab-runner has the required capability and runner route; reader lacks it; bridge-agent has a non-runner route
// input: scheduleFindings for each named system runner
// expect: the known positive is clean; unknown, incapable and non-runner participants each produce a system/runs on error
test("TST-476503: named runners use the public participant contract", () => {
  const find = functionOf("scheduleFindings"), custom = product(), people = participants();
  assert.deepEqual(find(custom, people), []);
  for (const name of ["missing-runner", "reader", "bridge-agent"]) {
    const invalid = structuredClone(custom); cells(invalid, "system")["runs on"] = name;
    assert.ok(find(invalid, people).some((mark) => mark.kind === "error" && `${mark.what} ${mark.fix}`.includes("system")
      && `${mark.what} ${mark.fix}`.includes("runs on")), name);
  }
});

// TST-476504
// level: unit
// module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; THE DEFAULT SCHEDULE FOLLOWS THE BOOK
// given: the default and the custom fixture with different occasion columns
// input: occasionsOf for unit, system and paid
// expect: exactly the displayed occasions ticked for that row, including custom system PR/nightly and no paid commit/PR
test("TST-476504: occasionsOf follows the row rather than the default", () => {
  const occasions = functionOf("occasionsOf");
  assert.deepEqual(occasions("unit", schedule.defaultSchedule()), ["every commit", "pull request", "nightly", "release candidate", "on demand"]);
  assert.deepEqual(occasions("unit", product()), ["every commit", "pull request", "release candidate", "on demand"]);
  assert.deepEqual(occasions("system", product()), ["pull request", "nightly", "release candidate", "on demand"]);
  assert.deepEqual(occasions("paid", product()), ["nightly", "release candidate", "on demand"]);
});

// TST-476505
// level: unit
// module: MOD-test-schedule
// guards: A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE; COMMIT TESTS CALL NO PAID SERVICE
// given: a scheduled paid row and resources naming one CI secret and one browser-only secret
// input: secretsNeeded; then the same schedule with no paid occasions
// expect: MODEL_KEY with a nonempty purpose, never browser or secret values; no paid secret when the row never runs
test("TST-476505: secretsNeeded returns needed CI names, not values", () => {
  const needed = functionOf("secretsNeeded"), custom = product(), services = resources();
  const names = needed(custom, services);
  assert.deepEqual(names.map((entry) => entry.name), ["MODEL_KEY"]);
  assert.ok(names.every((entry) => typeof entry.for === "string" && entry.for.length > 0));
  const noPaid = structuredClone(custom);
  for (const key of ["every commit", "pull request", "nightly", "release candidate", "on demand"]) delete cells(noPaid, "paid")[key];
  assert.deepEqual(needed(noPaid, services), []);
});

// TST-476506
// level: unit
// module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A JOB RECORD STARTS NO CI RUN; A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
// given: the custom schedule, public input registries and exact instance commit
// input: ciConfiguration with four arguments for GitHub, parsed using the existing pinned YAML library
// expect: its own workflow, 03:30 cron, RC/manual/PR/push triggers and job-only-push exclusion, one job per tick plus done; named runner labels and a maximum two-minute job budget
test("TST-476506: GitHub emits declared jobs, triggers and named runners", () => {
  const generate = functionOf("ciConfiguration"), custom = product();
  const result = generate(custom, target("github"), resources(), participants());
  assert.deepEqual(Object.keys(result.files), [".github/workflows/agent-m-tests.yml"]);
  assert.equal(result.include, null); assert.equal(result.pipelineSchedule, null);
  const workflow = yaml(result.files[".github/workflows/agent-m-tests.yml"]);
  assert.equal(workflow.on.schedule[0].cron, "30 3 * * *");
  for (const event of ["pull_request", "push", "workflow_dispatch"]) assert.ok(Object.hasOwn(workflow.on, event));
  assert.ok(workflow.on.push.tags.includes("v*-rc.*"));
  assert.ok(JSON.stringify(workflow.on.push).includes("docs/jobs/**"));
  const jobs = Object.values(workflow.jobs);
  assert.equal(jobs.length, rows(custom).reduce((n, row) => n + Object.entries(row.cells).filter(([key, value]) => key !== "Row" && value === "✓").length, 0) + 1);
  assert.equal(jobs.filter((job) => job.name === "agent-m done").length, 1);
  for (const job of jobs) assert.ok(job["timeout-minutes"] > 0 && job["timeout-minutes"] <= 2);
  const systems = jobs.filter((job) => levelsOf(job, "github").join(" ") === "system");
  assert.equal(systems.length, 4);
  for (const job of systems) assert.deepEqual(new Set(job["runs-on"]), new Set(["self-hosted", "lab-linux"]));
});

// TST-476507
// level: unit
// module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; EVERY TEST RUN LEAVES A RESULT RECORD; A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
// given: generated GitHub jobs from a custom-command schedule and pinned instance
// input: their actual checkout/entry steps and report environment
// expect: done invokes onDoneCheck; every test job runs the custom command and always invokes onTestsFinished with its report and real levels; instance checkouts are pinned; the default uses Node's native JUnit reporter
test("TST-476507: GitHub calls the real pinned entries and reports every run", () => {
  const generate = functionOf("ciConfiguration");
  const result = generate(product(), target("github"), resources(), participants());
  const workflow = yaml(result.files[".github/workflows/agent-m-tests.yml"]);
  for (const job of Object.values(workflow.jobs)) {
    const done = job.name === "agent-m done", text = textOfSteps(job);
    assert.match(text, new RegExp(`src/workflow-entries/main\\.mjs\\s+${done ? "onDoneCheck" : "onTestsFinished"}`));
    assert.ok(job.steps.some((step) => step.with?.repository === "example/instance" && step.with?.ref === PIN), "instance checkout is pinned");
    if (!done) {
      assert.ok(text.includes(product().fields.command));
      assert.ok(job.steps.some((step) => /onTestsFinished/.test(step.run ?? "") && /always\(\)/.test(step.if ?? "")), "reporting runs after a failing test step");
      assert.equal(job.env.AGENT_M_JUNIT_REPORT, "build/results.xml");
      assert.ok(levelsOf(job, "github").length > 0 && levelsOf(job, "github").every((level) => ["unit", "component", "system", "release", "user"].includes(level)));
    }
  }
  const native = yaml(generate(schedule.defaultSchedule(), target("github"), resources(), participants()).files[".github/workflows/agent-m-tests.yml"]);
  for (const job of Object.values(native.jobs).filter((job) => job.name !== "agent-m done")) {
    assert.match(textOfSteps(job), /--test-reporter(?:=|\s+)junit/);
    assert.ok(job.env.AGENT_M_JUNIT_REPORT, "native reporter output is handed to onTestsFinished");
  }
});

// TST-476508
// level: unit
// module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; EVERY TEST RUN LEAVES A RESULT RECORD
// given: the same inputs on GitLab
// input: ciConfiguration and its parsed YAML
// expect: its own included file, UTC nightly project setting, declared jobs and lab-linux tags, actual pinned done/result entries, and a report call in the main script so its failure cannot be swallowed by after_script
test("TST-476508: GitLab emits project scheduling and failure-visible entry calls", () => {
  const generate = functionOf("ciConfiguration"), custom = product();
  const result = generate(custom, target("gitlab"), resources(), participants());
  assert.deepEqual(Object.keys(result.files), [".gitlab/agent-m-tests.yml"]);
  assert.deepEqual(result.include, { file: ".gitlab-ci.yml", entry: "- local: .gitlab/agent-m-tests.yml" });
  assert.deepEqual(result.pipelineSchedule, { cron: "30 3 * * *", rows: ["system", "paid"] });
  const config = yaml(result.files[".gitlab/agent-m-tests.yml"]);
  const jobs = Object.values(config).filter((value) => value && typeof value === "object" && value.script);
  assert.equal(jobs.length, 19);
  assert.ok(JSON.stringify(config).includes("CI_PIPELINE_SOURCE"));
  for (const job of jobs) {
    const text = scriptOf(job), done = /onDoneCheck/.test(text);
    assert.ok(text.includes(PIN), "instance checkout is pinned");
    assert.match(text, /src\/workflow-entries\/main\.mjs\s+(onDoneCheck|onTestsFinished)/);
    if (!done) {
      assert.ok([job.script].flat().join("\n").includes("onTestsFinished"), "after_script cannot enforce entry failure");
      assert.ok(text.includes(custom.fields.command));
      assert.equal(job.variables.AGENT_M_JUNIT_REPORT, custom.fields.report);
    }
  }
  const systems = jobs.filter((job) => levelsOf(job, "gitlab").join(" ") === "system");
  assert.equal(systems.length, 4);
  for (const job of systems) assert.ok(job.tags.includes("lab-linux"));
});

// TST-476509
// level: unit
// module: MOD-test-schedule
// guards: COMMIT TESTS CALL NO PAID SERVICE; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
// given: a known valid schedule and then an illegal paid commit tick
// input: ciConfiguration on each platform
// expect: valid generation first; InvalidSchedule with the paid finding on the invalid schedule
test("TST-476509: generation rejects an invalid schedule with its findings", () => {
  const generate = functionOf("ciConfiguration");
  for (const server of ["github", "gitlab"]) {
    const valid = product(); assert.ok(Object.keys(generate(valid, target(server), resources(), participants()).files).length);
    cells(valid, "paid")["every commit"] = "✓";
    assert.throws(() => generate(valid, target(server), resources(), participants()), (error) => error.name === "InvalidSchedule"
      && error.findings.some((mark) => mark.rule === "COMMIT TESTS CALL NO PAID SERVICE"));
  }
});

// TST-476510
// level: unit
// module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the default generated configuration and its committed participant/resource inputs
// input: configurationDrift's unchanged three arguments, then a changed file and missing GitLab include
// expect: an agreeing configuration is clean; changed generated content and a missing include each name their path
test("TST-476510: drift compares generated files and the GitLab include", () => {
  const drift = functionOf("configurationDrift"), generate = functionOf("ciConfiguration");
  for (const server of ["github", "gitlab"]) {
    const custom = product(), generated = generate(custom, target(server), resources(), participants());
    const files = { ...generated.files, "docs/participants.md": fixture("participants.md"), "docs/resources.md": fixture("resources.md") };
    if (server === "gitlab") files[".gitlab-ci.yml"] = `include:\n  ${generated.include.entry}\n`;
    assert.deepEqual(drift(files, custom, target(server)), []);
    const path = Object.keys(generated.files)[0];
    assert.ok(drift({ ...files, [path]: "# changed\n" }, custom, target(server)).some((entry) => entry.path === path && entry.difference));
    if (server === "gitlab") assert.ok(drift({ ...files, ".gitlab-ci.yml": fixture("foreign-gitlab.yml") }, custom, target(server))
      .some((entry) => entry.path === ".gitlab-ci.yml" && entry.difference));
  }
});

// TST-476511
// level: unit
// module: MOD-test-schedule
// guards: UC-027; A GENERATED ARTIFACT IS A PROPOSAL
// given: public Host-shaped controlled snapshots with foreign CI and the read head
// input: proposeSchedule for GitHub and GitLab with provenance trailers
// expect: one branch from that exact head, one atomic commit of schedule/generated/include, one PR; unrelated CI stays and GitLab original lines survive; provenance is in the commit
test("TST-476511: proposal is one atomic schedule/configuration PR", async () => {
  const propose = functionOf("proposeSchedule"), generate = functionOf("ciConfiguration");
  for (const server of ["github", "gitlab"]) {
    const foreignPath = server === "github" ? ".github/workflows/product-build.yml" : ".gitlab-ci.yml";
    const foreign = fixture("foreign-gitlab.yml"), fake = hostFixture(server, { [foreignPath]: foreign });
    const trailers = ["Agent-M-Job: JOB-20261015-2005-50c5", "Agent-M-Participant: developer-sol-b"];
    const custom = product(), result = await propose(fake.host, custom, context(server, trailers));
    const made = writes(fake.calls);
    assert.deepEqual(made.map(([method]) => method), ["createBranch", "commitFiles", "openPullRequest"]);
    assert.equal(made[0][2], HEAD); assert.equal(made[0][1], result.branch);
    const commit = made[1][1], pr = made[2][1];
    assert.equal(commit.branch, result.branch); assert.equal(commit.expectedHead, HEAD);
    for (const trailer of trailers) assert.ok(commit.message.includes(trailer));
    const committed = Object.fromEntries(commit.files.map((file) => [file.path, file.text]));
    const expected = generate(custom, target(server), resources(), participants());
    for (const [path, text] of Object.entries(expected.files)) assert.equal(committed[path], text);
    const saved = readDocument(schedule.scheduleSchema, "docs/tests/schedule.md", committed["docs/tests/schedule.md"]);
    assert.deepEqual(rows(saved).map((row) => row.cells), rows(custom).map((row) => row.cells));
    assert.equal(saved.fields.nightly, custom.fields.nightly);
    assert.equal(pr.branch, result.branch); assert.equal(pr.base, "integration/ci");
    assert.equal(result.pullRequest.url, `${fake.snapshot.repository.web}/pull/27`);
    assert.match(pr.body, /configuration|workflow|pipeline/i);
    if (server === "github") assert.equal(committed[foreignPath], undefined, "foreign workflow is not rewritten");
    else {
      const changed = committed[foreignPath];
      assert.ok(changed.includes("- local: .gitlab/agent-m-tests.yml"));
      assert.equal(changed.split("\n").filter((line) => !line.includes("- local: .gitlab/agent-m-tests.yml")).join("\n"), foreign);
    }
    assert.equal(commit.files.length, server === "github" ? 2 : 3);
  }
});

// TST-476512
// level: unit
// module: MOD-test-schedule
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED
// given: GitLab include forms already holding the generated entry, no include, and no root file
// input: proposeSchedule for each controlled snapshot
// expect: exactly one entry after saving, preserving every original line and product settings
test("TST-476512: proposal inserts a missing include without duplicating one", async () => {
  const propose = functionOf("proposeSchedule");
  for (const before of ["include:\n  - local: .gitlab/agent-m-tests.yml\nvariables:\n  KEEP: yes\n", "variables:\n  KEEP: yes\n", null]) {
    const fake = hostFixture("gitlab", before === null ? {} : { ".gitlab-ci.yml": before });
    await propose(fake.host, product(), context("gitlab"));
    const commit = fake.calls.find(([method]) => method === "commitFiles")[1];
    const after = commit.files.find((file) => file.path === ".gitlab-ci.yml")?.text ?? before;
    assert.equal(after.match(/local: \.gitlab\/agent-m-tests\.yml/g)?.length, 1);
    assert.ok(yaml(after).include);
    if (before?.includes("local: .gitlab/agent-m-tests.yml")) assert.equal(after, before);
    else if (before) assert.ok(after.includes(before));
  }
});

// TST-476513
// level: unit
// module: MOD-test-schedule
// guards: UC-027; COMMIT TESTS CALL NO PAID SERVICE; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a successful proposal control, then invalid schedule and controlled Host refusals
// input: proposeSchedule
// expect: invalid writes nothing; each documented Host failure propagates unchanged instead of reporting success
test("TST-476513: invalid proposals write nothing and Host refusals survive", async () => {
  const propose = functionOf("proposeSchedule"), good = hostFixture("gitlab");
  await propose(good.host, product(), context("gitlab")); assert.equal(writes(good.calls).length, 3);
  const invalid = product(); cells(invalid, "paid")["pull request"] = "✓";
  const fake = hostFixture("gitlab");
  await assert.rejects(propose(fake.host, invalid, context("gitlab")), (error) => error.name === "InvalidSchedule" && error.findings.length > 0);
  assert.deepEqual(writes(fake.calls), []);
  for (const name of ["Moved", "TokenRefused", "PermissionMissing", "RateLimited", "Unreachable"]) {
    const refused = hostFixture("gitlab"), failure = new HostError(name, {}, "Constructed refusal");
    refused.host.commitFiles = async () => { throw failure; };
    await assert.rejects(propose(refused.host, product(), context("gitlab")), (error) => error === failure);
    assert.equal(refused.calls.some(([method]) => method === "openPullRequest"), false);
  }
});

// TST-476514
// level: unit
// module: MOD-test-schedule
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitHub public page positive and a Host whose every network operation would fail
// input: applyPipelineSchedule
// expect: exactly null without a network operation, because GitHub's nightly run is in the workflow
test("TST-476514: GitHub apply is null without any remote operation", async () => {
  const apply = functionOf("applyPipelineSchedule"), fake = hostFixture("github");
  assert.equal(fake.host.webLinks().pipelineSchedules, null);
  for (const method of ["repositoryInfo", "readSnapshot", "createBranch", "commitFiles", "openPullRequest", "setPipelineSchedule"]) {
    fake.host[method] = async () => assert.fail(`GitHub apply must not call ${method}`);
  }
  assert.equal(await apply(fake.host, product()), null);
  assert.deepEqual(fake.calls, []);
});

// TST-476515
// level: unit
// module: MOD-test-schedule
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: the GitLab public project page and declared 03:30 nightly system/paid rows, then controlled scheduling refusals
// input: applyPipelineSchedule
// expect: Host receives 30 3 * * *, UTC, the actual default branch and active schedule carrying the nightly rows; returns the public project page and propagates each refusal
test("TST-476515: GitLab apply uses the public scheduler and own project page", async () => {
  const apply = functionOf("applyPipelineSchedule"), fake = hostFixture("gitlab");
  const result = await apply(fake.host, product());
  const calls = fake.calls.filter(([method]) => method === "setPipelineSchedule");
  assert.equal(calls.length, 1);
  const request = calls[0][1];
  assert.equal(request.cron, "30 3 * * *"); assert.equal(request.timezone, "UTC");
  assert.equal(request.ref, "integration/ci"); assert.equal(request.active, true);
  assert.ok(typeof request.description === "string" && request.description.length > 0);
  const values = Object.values(request.variables).join(" ");
  assert.match(values, /system/); assert.match(values, /paid/);
  assert.doesNotMatch(values, /release|user|unit|component/);
  assert.deepEqual(result, { url: fake.host.webLinks().pipelineSchedules });
  for (const name of ["TokenRefused", "PermissionMissing", "RateLimited", "Unreachable"]) {
    const refused = hostFixture("gitlab"), failure = new HostError(name, {}, "Constructed refusal");
    refused.host.setPipelineSchedule = async () => { throw failure; };
    await assert.rejects(apply(refused.host, product()), (error) => error === failure);
  }
});

// TST-476516
// level: unit
// module: MOD-test-schedule
// guards: UC-027; AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT; A GENERATED ARTIFACT IS A PROPOSAL
// given: the set-up-ci writer's public JobContext, once with a product schedule and once without
// input: scheduleStrategies.writers[ci-configuration]
// expect: one proposal transaction through the same generator, using the product schedule or default and carrying actual job/version/kind provenance in its commit
test("TST-476516: the writer uses the same proposal and job provenance", async () => {
  assert.equal(typeof schedule.scheduleStrategies, "object", "public scheduleStrategies is implemented");
  const writer = schedule.scheduleStrategies.writers["ci-configuration"];
  assert.equal(typeof writer, "function");
  const generate = functionOf("ciConfiguration");
  for (const declared of [true, false]) {
    const files = { "docs/resources.md": fixture("resources.md"), ...(declared ? { "docs/tests/schedule.md": fixture("product.md") } : {}) };
    const fake = hostFixture("github", files);
    const instanceRepository = parseAddress(target("github").instance);
    const instance = { repository: instanceRepository, ref: "main", commit: PIN, paths: ["docs/participants.md"],
      read: async (path) => path === "docs/participants.md" ? fixture("participants.md") : null, blob: () => null };
    const jobContext = { kind: { name: "set-up-ci" }, params: {},
      product: { address: fake.snapshot.repository.web, host: fake.host, snapshot: fake.snapshot },
      instance: { snapshot: instance, host: null, checkout: null }, participants: participantsOf(participants()),
      connect: async () => assert.fail("no other repository is needed"), places: { sources: {}, mailbox: null }, gates: [],
      person: "example", now: new Date("2026-10-15T20:00:00Z"), agentM: { version: "unreleased", commit: PIN }, jobId: "JOB-20261015-2005-50c5" };
    const result = { draft: null, raw: null, drafter: null, rounds: [], remaining: [], forPerson: [], stepFindings: [], classes: null,
      stoppedBecause: "passed", gate: null, usage: [], written: null };
    await writer(result, jobContext);
    const made = writes(fake.calls);
    assert.deepEqual(made.map(([method]) => method), ["createBranch", "commitFiles", "openPullRequest"]);
    const commit = made[1][1];
    for (const line of [`Agent-M-Version: unreleased, commit ${PIN}`, "Agent-M-Job: JOB-20261015-2005-50c5", "Agent-M-Kind: set-up-ci"]) assert.ok(commit.message.includes(line));
    const expectedSchedule = declared ? product() : schedule.defaultSchedule();
    const expected = generate(expectedSchedule, target("github"), resources(), participants());
    for (const [path, text] of Object.entries(expected.files)) assert.equal(commit.files.find((file) => file.path === path)?.text, text);
  }
});
