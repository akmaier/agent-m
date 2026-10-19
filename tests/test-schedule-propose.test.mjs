// The pull request of a schedule and the nightly pipeline schedule (ITM-746) — MOD-test-schedule's proposeSchedule(host,
// schedule, context) and applyPipelineSchedule(host, schedule), as the accepted text of docs/architecture/MOD-test-schedule.md
// states them under Interfaces: one branch from the head that was read, one commit of the schedule file, the generated file and,
// on GitLab, the product's `.gitlab-ci.yml` with the include entry, one pull request that says when a foreign configuration
// stays beside Agent M's; nothing written for a schedule with an error finding; the nightly pipeline schedule on GitLab.
// Run: node --test tests/test-schedule-propose.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// Level: unit
//
// The host is a fake of MOD-repository-hosts' interface that records every call it receives. Each test states its input and
// its expected result before it runs (given / input / expect). Nothing here sleeps, waits or reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import * as testSchedule from "../src/test-schedule/index.mjs";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";
import { HostError } from "../src/repository-hosts/index.mjs";

const { scheduleSchema } = testSchedule;
const HEAD = "0123456789abcdef0123456789abcdef01234567";
const INSTANCE_COMMIT = "fedcba9876543210fedcba9876543210fedcba98";
const GITHUB_FILE = ".github/workflows/agent-m-tests.yml";
const GITLAB_FILE = ".gitlab/agent-m-tests.yml";
const SCHEDULE_FILE = "docs/tests/schedule.md";
const SCHEDULES_PAGE = "https://git.example.org/acme/product/-/pipeline_schedules";

const TABLE_HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const DEFAULT_ROWS = {
  unit: "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", component: "| component | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  system: "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |", paid: "| paid | | | ✓ | ✓ | ✓ | |",
  release: "| release | | | | ✓ | ✓ | |", user: "| user | | | | ✓ | ✓ | |",
};
const scheduleWith = (changed = {}, front = "nightly: 03:30") => readDocument(scheduleSchema, SCHEDULE_FILE,
  `---\n${front}\n---\n## Levels\n\n${TABLE_HEAD}\n${Object.values({ ...DEFAULT_ROWS, ...changed }).join("\n")}\n`);
const SCHEDULE = scheduleWith();
const participants = readDocument(participantSchema(), "docs/participants.md",
  "# Participants of this instance\n\n**REGISTER**\n\nThe participants.\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n");
const resources = readDocument(resourceSchema(), "docs/resources.md",
  "# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|\n");

const context = (server, extra = {}) => ({
  server, instance: server === "github" ? "acme/agent-m" : "https://git.example.org/acme/agent-m", instanceCommit: INSTANCE_COMMIT,
  resources, participants, head: HEAD, trailers: [], ...extra });

// A host that records its calls. `files` is the product at the head; the pipeline schedules are kept by description, so that a
// second save of the same description replaces the first, as the real host's setPipelineSchedule does.
function fakeHost({ server = "github", files = {}, defaultBranch = "trunk", failCommit = null } = {}) {
  const calls = [], pipelineSchedules = new Map();
  const record = (name, ...args) => calls.push({ name, args });
  return {
    calls, pipelineSchedules,
    of: (name) => calls.filter((c) => c.name === name),
    async repositoryInfo() { record("repositoryInfo"); return { defaultBranch, visibility: "private", canWrite: true, archived: false, description: "" }; },
    async readSnapshot(ref) {
      record("readSnapshot", ref);
      return { ref, commit: ref, paths: Object.keys(files), read: async (path) => files[path] ?? null, blob: (path) => (path in files ? "blob" : null) };
    },
    async createBranch(name, from) { record("createBranch", name, from); },
    async commitFiles(change) {
      record("commitFiles", change);
      if (failCommit) throw failCommit;
      return { commit: "c".repeat(40), url: "https://example.org/commit" };
    },
    async openPullRequest(request) { record("openPullRequest", request); return { number: 7, url: "https://example.org/pull/7", ...request }; },
    async setPipelineSchedule(schedule) { record("setPipelineSchedule", schedule); pipelineSchedules.set(schedule.description, schedule); return { id: 1, url: SCHEDULES_PAGE }; },
    webLinks: () => ({ pipelineSchedules: server === "gitlab" ? SCHEDULES_PAGE : null }),
  };
}
const written = (host) => host.of("commitFiles")[0].args[0];
const textOfFile = (host, path) => written(host).files.find((f) => f.path === path)?.text;

// TST-746001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a GitHub product at a head commit, whose default branch is "trunk" and which holds no workflow; the default schedule; a job's two provenance lines as trailers
// input: proposeSchedule(host, schedule, context)
// expect: one branch created at the head, one commit on that branch made on that head holding exactly docs/tests/schedule.md (the text writeDocument gives the schedule) and .github/workflows/agent-m-tests.yml (the text ciConfiguration gives), the message ending with the two trailer lines; one pull request from that branch into "trunk"; the answer holds that pull request and the branch's name
// Planted fault: opening the pull request into a fixed "main", or a second commit for the generated file, makes the base or the commit count fail.
test("proposeSchedule — GitHub: one branch from the head, one commit of the schedule and the generated file, one pull request into the default branch", async () => {
  const host = fakeHost(), trailers = ["Agent-M-Job: JOB-20261019-1000-aaaa", "Agent-M-Participant: claude"];
  const answer = await testSchedule.proposeSchedule(host, SCHEDULE, context("github", { trailers }));
  assert.equal(host.of("createBranch").length, 1);
  const [branch, from] = host.of("createBranch")[0].args;
  assert.equal(from, HEAD, "the branch is made at the head that was read");
  assert.equal(host.of("commitFiles").length, 1, "one commit");
  const change = written(host);
  assert.equal(change.branch, branch);
  assert.equal(change.expectedHead, HEAD);
  assert.deepEqual(change.files.map((f) => f.path).sort(), [GITHUB_FILE, SCHEDULE_FILE].sort());
  assert.equal(textOfFile(host, SCHEDULE_FILE), writeDocument(scheduleSchema, SCHEDULE));
  const generated = testSchedule.ciConfiguration(SCHEDULE, { server: "github", instance: "acme/agent-m", instanceCommit: INSTANCE_COMMIT }, resources, participants);
  assert.equal(textOfFile(host, GITHUB_FILE), generated.files[GITHUB_FILE]);
  assert.ok(change.message.trim().length > 0 && change.message.endsWith(trailers.join("\n")), "the job's provenance lines end the message");
  assert.equal(host.of("openPullRequest").length, 1, "one pull request");
  const request = host.of("openPullRequest")[0].args[0];
  assert.equal(request.branch, branch);
  assert.equal(request.base, "trunk", "into the default branch the host names");
  assert.equal(answer.branch, branch);
  assert.equal(answer.pullRequest.number, 7);
});

// TST-746002 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
// given: a GitLab product with no .gitlab-ci.yml; one with a .gitlab-ci.yml that has jobs and no include:; one whose include: is a list of another entry; one that includes Agent M's file already
// input: proposeSchedule for each
// expect: the commit holds the schedule file, .gitlab/agent-m-tests.yml and, except for the last product, .gitlab-ci.yml; the new .gitlab-ci.yml is exactly "include:\n  - local: .gitlab/agent-m-tests.yml\n" for the first; for the second the old text byte for byte followed by an include: key with the entry; for the third the old text with the entry added after the last entry of the list; every other line stays as it was
// Planted fault: rewriting the file instead of adding to it, or adding the entry a second time, changes the bytes asserted here.
test("proposeSchedule — GitLab: the product's .gitlab-ci.yml gains the include entry and no other line changes", async () => {
  const entry = "- local: .gitlab/agent-m-tests.yml";
  const jobs = "stages: [test]\nbuild:\n  script: make\n";
  const listed = "include:\n  - project: group/shared\n    file: ci.yml\nbuild:\n  script: make\n";
  const cases = [
    { name: "no file", files: {}, expected: `include:\n  ${entry}\n` },
    { name: "jobs and no include", files: { ".gitlab-ci.yml": jobs }, expected: `${jobs}include:\n  ${entry}\n` },
    { name: "a list of another entry", files: { ".gitlab-ci.yml": listed },
      expected: "include:\n  - project: group/shared\n    file: ci.yml\n  - local: .gitlab/agent-m-tests.yml\nbuild:\n  script: make\n" },
    { name: "already included", files: { ".gitlab-ci.yml": `include:\n  ${entry}\n` }, expected: undefined },
  ];
  for (const { name, files, expected } of cases) {
    const host = fakeHost({ server: "gitlab", files });
    await testSchedule.proposeSchedule(host, SCHEDULE, context("gitlab"));
    const paths = written(host).files.map((f) => f.path).sort();
    const wanted = [SCHEDULE_FILE, GITLAB_FILE, ...(expected === undefined ? [] : [".gitlab-ci.yml"])].sort();
    assert.deepEqual(paths, wanted, `${name}: the files of the commit`);
    assert.equal(textOfFile(host, ".gitlab-ci.yml"), expected, `${name}: the text of .gitlab-ci.yml`);
  }
});

// TST-746003 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab product whose .gitlab-ci.yml writes its include: as a single string, and one as a map
// input: proposeSchedule for each
// expect: it rejects with an error named GitlabCiNotList that names .gitlab-ci.yml, and nothing is written: no branch, no commit, no pull request
// Planted fault: replacing the string or the map without a refusal writes a commit, and the call counts fail.
test("proposeSchedule — GitLab: an include: that is not a list is refused by name, before anything is written", async () => {
  for (const text of ["include: other.yml\nbuild:\n  script: make\n", "include:\n  local: other.yml\nbuild:\n  script: make\n"]) {
    const host = fakeHost({ server: "gitlab", files: { ".gitlab-ci.yml": text } });
    await assert.rejects(testSchedule.proposeSchedule(host, SCHEDULE, context("gitlab")), (e) => e.name === "GitlabCiNotList" && /\.gitlab-ci\.yml/.test(e.message));
    for (const call of ["createBranch", "commitFiles", "openPullRequest"]) assert.equal(host.of(call).length, 0, `${call} is not called`);
  }
});

// TST-746004 · level: unit · module: MOD-test-schedule
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitHub product that holds .github/workflows/ci.yml beside none of Agent M's; a GitHub product with only .github/workflows/agent-m-jobs.yml; a GitLab product with a .gitlab-ci.yml of its own; a GitHub product with no workflow
// input: proposeSchedule for each
// expect: the pull request body of the first names .github/workflows/ci.yml and says that Agent M's file stands beside it; the bodies of the second and fourth name no foreign configuration; the third names .gitlab-ci.yml
// Planted fault: always saying it, or never, or counting Agent M's own workflow as foreign, fails one of the four.
test("proposeSchedule — the pull request says when a foreign configuration stays beside Agent M's", async () => {
  const body = async (server, files) => { const host = fakeHost({ server, files }); await testSchedule.proposeSchedule(host, SCHEDULE, context(server)); return host.of("openPullRequest")[0].args[0].body; };
  const foreign = await body("github", { ".github/workflows/ci.yml": "name: ci\n" });
  assert.match(foreign, /\.github\/workflows\/ci\.yml/);
  assert.match(foreign, /beside/);
  const own = await body("github", { ".github/workflows/agent-m-jobs.yml": "name: jobs\n" });
  assert.doesNotMatch(own, /beside/);
  assert.doesNotMatch(own, /agent-m-jobs/);
  const lab = await body("gitlab", { ".gitlab-ci.yml": "build:\n  script: make\n" });
  assert.match(lab, /\.gitlab-ci\.yml/);
  assert.match(lab, /beside/);
  assert.doesNotMatch(await body("github", {}), /beside/);
});

// TST-746005 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a schedule whose row "unit" is not ticked for the release candidate (an error finding)
// input: proposeSchedule on GitHub and on GitLab
// expect: it rejects with InvalidSchedule carrying the findings, and the host received no createBranch, no commitFiles and no openPullRequest
// Planted fault: creating the branch before generating the configuration leaves a branch behind, and the createBranch count fails.
test("proposeSchedule — a schedule with an error finding writes nothing", async () => {
  const invalid = scheduleWith({ unit: "| unit | ✓ | ✓ | ✓ | | ✓ | |" });
  for (const server of ["github", "gitlab"]) {
    const host = fakeHost({ server });
    await assert.rejects(testSchedule.proposeSchedule(host, invalid, context(server)), (e) => e.name === "InvalidSchedule" && e.findings.length > 0);
    for (const call of ["createBranch", "commitFiles", "openPullRequest"]) assert.equal(host.of(call).length, 0, `${server}: ${call} is not called`);
  }
});

// TST-746006 · level: unit · module: MOD-test-schedule
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: a host whose commitFiles fails with Moved because the branch is no longer at the head, and one whose createBranch fails with TokenRefused
// input: proposeSchedule for each
// expect: the very error of the host is passed on (name Moved, name TokenRefused), and no pull request is opened
// Planted fault: opening the pull request in a finally, or turning the error into another, fails the name or the count.
test("proposeSchedule — a failure of the host is passed on and no pull request follows", async () => {
  const moved = new HostError("Moved", { branch: "b", expectedHead: HEAD }, "The branch moved.");
  const host = fakeHost({ failCommit: moved });
  await assert.rejects(testSchedule.proposeSchedule(host, SCHEDULE, context("github")), (e) => e === moved);
  assert.equal(host.of("openPullRequest").length, 0);
  const refused = new HostError("TokenRefused", {}, "The token was refused.");
  const other = fakeHost();
  other.createBranch = async () => { throw refused; };
  await assert.rejects(testSchedule.proposeSchedule(other, SCHEDULE, context("github")), (e) => e === refused);
  assert.equal(other.of("openPullRequest").length, 0);
  assert.equal(other.of("commitFiles").length, 0);
});

// TST-746007 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
// given: a GitLab host whose default branch is "trunk", and a schedule with nightly at 03:30 whose rows unit, component, system and paid tick nightly; then the same schedule with nightly at 04:15
// input: applyPipelineSchedule(host, schedule) twice with the first schedule, then once with the second
// expect: setPipelineSchedule gets a description, the cron "30 3 * * *", the timezone "UTC", the ref "trunk", active true and the variable ROWS "unit,component,system,paid"; the answer is { url } of the host's pipeline schedules page; after the second call the host still holds one schedule, and after the third that one has the cron "15 4 * * *"
// Planted fault: a description that changes per call, or a fixed ref "main", leaves two schedules or the wrong ref.
test("applyPipelineSchedule — GitLab: the nightly pipeline schedule is set at the declared time, and saving again updates it", async () => {
  const host = fakeHost({ server: "gitlab" });
  const first = await testSchedule.applyPipelineSchedule(host, SCHEDULE);
  const sent = host.of("setPipelineSchedule")[0].args[0];
  assert.equal(sent.cron, "30 3 * * *");
  assert.equal(sent.timezone, "UTC");
  assert.equal(sent.ref, "trunk");
  assert.equal(sent.active, true);
  assert.deepEqual(sent.variables, { ROWS: "unit,component,system,paid" });
  assert.ok(typeof sent.description === "string" && sent.description.trim());
  assert.deepEqual(first, { url: SCHEDULES_PAGE });
  await testSchedule.applyPipelineSchedule(host, SCHEDULE);
  assert.equal(host.pipelineSchedules.size, 1, "saving again adds no second schedule");
  await testSchedule.applyPipelineSchedule(host, scheduleWith({}, "nightly: 04:15"));
  assert.equal(host.pipelineSchedules.size, 1);
  assert.equal([...host.pipelineSchedules.values()][0].cron, "15 4 * * *");
});

// TST-746008 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab host and a schedule with no row ticked for nightly
// input: applyPipelineSchedule
// expect: the pipeline schedule is set with active false and the variable ROWS empty, so that one set before stops running
// Planted fault: leaving it active makes the active assertion fail; not calling the host leaves an earlier schedule running.
test("applyPipelineSchedule — GitLab: a schedule with no nightly row sets the pipeline schedule inactive", async () => {
  const none = scheduleWith({ unit: "| unit | ✓ | ✓ | | ✓ | ✓ | |", component: "| component | ✓ | ✓ | | ✓ | ✓ | |", system: "| system | ✓ | ✓ | | ✓ | ✓ | |", paid: "| paid | | | | ✓ | ✓ | |" });
  const host = fakeHost({ server: "gitlab" });
  await testSchedule.applyPipelineSchedule(host, none);
  const sent = host.of("setPipelineSchedule")[0].args[0];
  assert.equal(sent.active, false);
  assert.deepEqual(sent.variables, { ROWS: "" });
});

// TST-746009 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
// given: a GitHub host, whose web links name no pipeline schedules page
// input: applyPipelineSchedule(host, schedule)
// expect: the answer is null and the host received no setPipelineSchedule
// Planted fault: calling setPipelineSchedule on GitHub makes the host answer NotSupported, and the call count fails.
test("applyPipelineSchedule — GitHub: null, and nothing is set", async () => {
  const host = fakeHost({ server: "github" });
  assert.equal(await testSchedule.applyPipelineSchedule(host, SCHEDULE), null);
  assert.equal(host.of("setPipelineSchedule").length, 0);
});
