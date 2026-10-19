// The writer that sets up CI in a run (ITM-747) — MOD-test-schedule's scheduleStrategies with its writer `ci-configuration`, as the
// accepted text of docs/architecture/MOD-test-schedule.md states it under Interfaces: "the product's schedule, or the default where
// there is none, through `proposeSchedule` with the job's provenance lines". The kind `set-up-ci` names the writer.
// Run: node --test tests/test-schedule-strategies.test.mjs
//
// Module: MOD-test-schedule
// Guards: A RUN SETS UP CI BEFORE IT IMPLEMENTS; THE DEFAULT SCHEDULE FOLLOWS THE BOOK; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; THE TEST SCHEDULE IS DECLARED PER PRODUCT; GITLAB PRODUCTS ARE SUPPORTED
// Level: unit
//
// The host is a fake that records its calls (tests/test-schedule.d/host.mjs). Each test states its input and its expected result
// before it runs (given / input / expect). Nothing here sleeps, waits or reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import * as testSchedule from "../src/test-schedule/index.mjs";
import { readDocument, writeDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { prepareJob, provenanceLines, registerStrategies } from "../src/job-runner/index.mjs";
import { COMMIT, fakeHost } from "./test-schedule.d/host.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { scheduleSchema, scheduleStrategies, defaultSchedule, ciConfiguration } = testSchedule;
const HEAD = "0123456789abcdef0123456789abcdef01234567";
const INSTANCE_COMMIT = "fedcba9876543210fedcba9876543210fedcba98";
const JOB = "JOB-20261019-1000-abcd";
const SCHEDULE_FILE = "docs/tests/schedule.md";
const OWN_SCHEDULE = `---\nnightly: 04:15\n---\n## Levels\n\n| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|
| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |\n| component | | ✓ | | ✓ | ✓ | |\n| system | ✓ | ✓ | ✓ | ✓ | ✓ | |\n| paid | | | ✓ | ✓ | ✓ | |\n| release | | | | ✓ | ✓ | |\n| user | | | | ✓ | ✓ | |\n`;
const PARTICIPANTS = "# Participants of this instance\n\n**REGISTER**\n\nThe participants.\n\n| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |\n|---|---|---|---|---|---|---|---|\n";

const ADDRESS = {
  github: { server: "github", origin: "https://github.com", path: "acme/product", web: "https://github.com/acme/product" },
  gitlab: { server: "gitlab", origin: "https://git.example.org", path: "acme/product", web: "https://git.example.org/acme/product" },
};
const INSTANCE_ADDRESS = {
  github: { server: "github", origin: "https://github.com", path: "acme/agent-m", web: "https://github.com/acme/agent-m" },
  gitlab: { server: "gitlab", origin: "https://git.example.org", path: "acme/agent-m", web: "https://git.example.org/acme/agent-m" },
};
const snapshotOf = (repository, files, commit = HEAD) => ({ repository, ref: commit, commit, paths: Object.keys(files), read: async (path) => files[path] ?? null, blob: (path) => (path in files ? "blob" : null) });

// The context of a job of the kind set-up-ci, over a product at HEAD with these files.
function jobContext(kind, { server = "github", files = {} } = {}) {
  const host = fakeHost({ server, files });
  return { host, context: {
    kind, params: {}, person: null, now: new Date("2026-10-19T10:00:00Z"), jobId: JOB, agentM: { version: "2026.10.0", commit: INSTANCE_COMMIT },
    product: { address: ADDRESS[server].web, snapshot: snapshotOf(ADDRESS[server], files), host },
    instance: { snapshot: snapshotOf(INSTANCE_ADDRESS[server], { "docs/participants.md": PARTICIPANTS }, INSTANCE_COMMIT), host: null, checkout: null },
    connect: async () => { throw new Error("no other repository is opened"); }, participants: [],
    places: { sources: {}, mailbox: null, contents: [] }, gates: [] } };
}
const RESULT = { draft: null, raw: null, drafter: null, rounds: [], remaining: [], forPerson: [], stepFindings: [], classes: null, stoppedBecause: "passed", gate: null, usage: [], written: null };
const written = (host) => host.of("commitFiles")[0].args[0];
const textOf = (host, path) => written(host).files.find((f) => f.path === path)?.text;
const target = (server) => ({ server, instance: server === "github" ? "acme/agent-m" : INSTANCE_ADDRESS.gitlab.web, instanceCommit: INSTANCE_COMMIT });
const NO_RESOURCES = readDocument(resourceSchema(), "docs/resources.md", "");
const NO_PARTICIPANTS = readDocument(participantSchema(), "docs/participants.md", PARTICIPANTS);

// TST-747001 · level: unit · module: MOD-test-schedule
// guards: A RUN SETS UP CI BEFORE IT IMPLEMENTS; THE DEFAULT SCHEDULE FOLLOWS THE BOOK
// given: a GitHub product at a head that holds no docs/tests/schedule.md and no workflow; the job context of set-up-ci with the job's id and Agent M's version and commit; no drafter
// input: the writer ci-configuration of scheduleStrategies, called with a job result and that context
// expect: one branch at the head, one commit holding exactly docs/tests/schedule.md (the default schedule as writeDocument writes it) and .github/workflows/agent-m-tests.yml (as ciConfiguration generates it from the default for the instance at Agent M's commit), whose message ends with the job's provenance lines (the participant "none"); one pull request; the outcome names that commit, those two files and the pull request's address
// Planted fault: proposing an empty schedule instead of the default, or a message without the lines, fails the text or the message assertion.
test("ci-configuration — a product without a schedule gets the default proposed, with the job's provenance lines", async () => {
  const { host, context } = jobContext(await kindOf("set-up-ci"));
  const outcome = await scheduleStrategies.writers["ci-configuration"](RESULT, context);
  assert.equal(host.of("createBranch").length, 1);
  assert.equal(host.of("createBranch")[0].args[1], HEAD);
  assert.equal(host.of("commitFiles").length, 1);
  assert.deepEqual(written(host).files.map((f) => f.path).sort(), [".github/workflows/agent-m-tests.yml", SCHEDULE_FILE]);
  assert.equal(textOf(host, SCHEDULE_FILE), writeDocument(scheduleSchema, defaultSchedule()));
  assert.equal(textOf(host, ".github/workflows/agent-m-tests.yml"), ciConfiguration(defaultSchedule(), target("github"), NO_RESOURCES, NO_PARTICIPANTS).files[".github/workflows/agent-m-tests.yml"]);
  const lines = provenanceLines({ agentM: context.agentM, jobId: JOB, kind: "set-up-ci", participant: { name: "none", model: null }, rounds: 0 });
  assert.ok(written(host).message.endsWith(lines.join("\n")), `the message ends with the provenance lines: ${written(host).message}`);
  assert.equal(host.of("openPullRequest").length, 1);
  assert.deepEqual({ ...outcome, files: [...outcome.files].sort() }, { commits: [COMMIT], files: [".github/workflows/agent-m-tests.yml", SCHEDULE_FILE], pullRequest: "https://example.org/pull/7", shown: null, notes: [] });
});

// TST-747002 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
// given: a GitHub product whose docs/tests/schedule.md ticks nightly at 04:15 and the row component only for a pull request, a release candidate and on demand
// input: the writer ci-configuration
// expect: the commit's docs/tests/schedule.md is that schedule as writeDocument writes it, not the default, and the generated workflow carries the cron "15 4 * * *" and has no job component-every-commit
// Planted fault: always proposing the default makes the schedule text and the cron differ.
test("ci-configuration — a product with a schedule gets its own proposed", async () => {
  const { host, context } = jobContext(await kindOf("set-up-ci"), { files: { [SCHEDULE_FILE]: OWN_SCHEDULE } });
  await scheduleStrategies.writers["ci-configuration"](RESULT, context);
  const own = readDocument(scheduleSchema, SCHEDULE_FILE, OWN_SCHEDULE);
  assert.equal(textOf(host, SCHEDULE_FILE), writeDocument(scheduleSchema, own));
  const workflow = textOf(host, ".github/workflows/agent-m-tests.yml");
  assert.match(workflow, /cron: "15 4 \* \* \*"/);
  assert.doesNotMatch(workflow, /component-every-commit/);
});

// TST-747003 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab product with no schedule and no .gitlab-ci.yml, whose instance lies on the same server
// input: the writer ci-configuration
// expect: the commit holds docs/tests/schedule.md, .gitlab/agent-m-tests.yml generated for the instance's web address at Agent M's commit, and .gitlab-ci.yml with the include entry
// Planted fault: taking the server from the instance's path instead of the product's address, or the instance as "owner/name", changes the clone line or the files.
test("ci-configuration — a GitLab product gets the GitLab files for the instance at Agent M's commit", async () => {
  const { host, context } = jobContext(await kindOf("set-up-ci"), { server: "gitlab" });
  await scheduleStrategies.writers["ci-configuration"](RESULT, context);
  assert.deepEqual(written(host).files.map((f) => f.path).sort(), [".gitlab-ci.yml", ".gitlab/agent-m-tests.yml", SCHEDULE_FILE]);
  assert.equal(textOf(host, ".gitlab/agent-m-tests.yml"), ciConfiguration(defaultSchedule(), target("gitlab"), NO_RESOURCES, NO_PARTICIPANTS).files[".gitlab/agent-m-tests.yml"]);
  assert.equal(textOf(host, ".gitlab-ci.yml"), "include:\n  - local: .gitlab/agent-m-tests.yml\n");
});

// TST-747004 · level: unit · module: MOD-test-schedule
// guards: A RUN SETS UP CI BEFORE IT IMPLEMENTS
// given: a GitHub product that holds, at its head, exactly the files the writer wrote for it before (the schedule and the generated workflow, byte for byte)
// input: the writer ci-configuration again
// expect: no branch, no commit and no pull request; the outcome is { commits: [], files: [], pullRequest: null, shown: null, notes: [] }
// Planted fault: proposing again though every file stands makes a branch and a pull request, and the counts fail.
test("ci-configuration — files that already stand on the head commit nothing", async () => {
  const first = jobContext(await kindOf("set-up-ci"));
  await scheduleStrategies.writers["ci-configuration"](RESULT, first.context);
  const standing = Object.fromEntries(written(first.host).files.map((f) => [f.path, f.text]));
  const { host, context } = jobContext(await kindOf("set-up-ci"), { files: standing });
  const outcome = await scheduleStrategies.writers["ci-configuration"](RESULT, context);
  for (const call of ["createBranch", "commitFiles", "openPullRequest"]) assert.equal(host.of(call).length, 0, `${call} is not called`);
  assert.deepEqual(outcome, { commits: [], files: [], pullRequest: null, shown: null, notes: [] });
});

// TST-747005 · level: unit · module: MOD-test-schedule
// guards: A RUN SETS UP CI BEFORE IT IMPLEMENTS
// given: the kind set-up-ci, which names the writer ci-configuration; first no module registered, then scheduleStrategies registered under MOD-test-schedule
// input: prepareJob("set-up-ci", context, { drafter: null, reviewers: [] }) before and after registering
// expect: before, it throws UnknownStrategy naming ci-configuration; after, it does not throw
// Planted fault: naming the writer otherwise (e.g. "ci-config") in scheduleStrategies leaves the strategy unknown after registering.
test("prepareJob — set-up-ci finds the writer once scheduleStrategies is registered", async () => {
  const kind = await kindOf("set-up-ci");
  const { context } = jobContext(kind);
  await assert.rejects(prepareJob("set-up-ci", context, { drafter: null, reviewers: [] }), (e) => e.name === "UnknownStrategy" && e.strategy === "ci-configuration");
  registerStrategies("MOD-test-schedule", scheduleStrategies);
  const prepared = await prepareJob("set-up-ci", context, { drafter: null, reviewers: [] });
  assert.deepEqual(prepared.blocking, []);
});
