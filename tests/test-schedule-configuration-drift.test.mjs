// The committed configuration against the schedule (ITM-745) — MOD-test-schedule's configurationDrift(files, schedule,
// target), as the accepted text of docs/architecture/MOD-test-schedule.md states it under Interfaces: where the committed
// configuration differs from the one the schedule generates, on GitLab including a .gitlab-ci.yml without the include
// entry; empty when they agree; for a configuration Agent M did not generate, the triggers it has and which rows they run.
// Run: node --test tests/test-schedule-configuration-drift.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing here sleeps,
// waits or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, defaultSchedule, ciConfiguration, configurationDrift } from "../src/test-schedule/index.mjs";
import { readDocument } from "../src/documents/index.mjs";
import { participantSchema } from "../src/participant-list/index.mjs";
import { resourceSchema } from "../src/resource-list/index.mjs";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const GITHUB = { server: "github", instance: "acme/agent-m", instanceCommit: COMMIT };
const GITLAB = { server: "gitlab", instance: "https://git.example.org/acme/agent-m", instanceCommit: COMMIT };
const GITHUB_FILE = ".github/workflows/agent-m-tests.yml";
const GITLAB_FILE = ".gitlab/agent-m-tests.yml";
const ENTRY = "- local: .gitlab/agent-m-tests.yml";
const NONE = { sections: [] };
const generated = (target) => ciConfiguration(defaultSchedule(), target, NONE, NONE).files;

// TST-745001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (1b)
// given: the files ciConfiguration generates from the default schedule for GitHub and for GitLab, the GitLab ones also with a .gitlab-ci.yml that holds the include entry under include:
// input: configurationDrift(files, defaultSchedule(), target) for each
// expect: the empty list for each — a committed configuration that agrees with the schedule shows no difference
for (const [server, target] of [["github", GITHUB], ["gitlab", GITLAB]]) {
  test(`configurationDrift — ${server}: the generated files give no difference`, () => {
    const files = generated(target);
    assert.deepEqual(configurationDrift(files, defaultSchedule(), target), []);
    if (server === "gitlab") {
      const withInclude = { ...files, ".gitlab-ci.yml": `stages:\n  - test\ninclude:\n  ${ENTRY}\n` };
      assert.deepEqual(configurationDrift(withInclude, defaultSchedule(), target), []);
    }
  });
}

// TST-745002 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (1b)
// given: the generated GitHub file with its line 2 changed to `name: my own tests`; the generated GitLab file with its last line changed; the generated GitHub file left out of the files
// input: configurationDrift(files, defaultSchedule(), target) for each
// expect: the edited GitHub file gives exactly one difference, with the path .github/workflows/agent-m-tests.yml and a text that names line 2 and the line found; the edited GitLab file exactly one, with the path .gitlab/agent-m-tests.yml; the missing GitHub file exactly one, with its path
test("configurationDrift — one edited line gives one difference with its path", () => {
  const github = generated(GITHUB);
  const edited = github[GITHUB_FILE].split("\n");
  assert.equal(edited[1], "name: agent-m tests");
  edited[1] = "name: my own tests";
  const one = configurationDrift({ [GITHUB_FILE]: edited.join("\n") }, defaultSchedule(), GITHUB);
  assert.equal(one.length, 1);
  assert.equal(one[0].path, GITHUB_FILE);
  assert.match(one[0].difference, /line 2/);
  assert.match(one[0].difference, /my own tests/);

  const gitlab = generated(GITLAB)[GITLAB_FILE].replace(/\n$/, "").split("\n");
  gitlab[gitlab.length - 1] += " # edited";
  const other = configurationDrift({ [GITLAB_FILE]: `${gitlab.join("\n")}\n` }, defaultSchedule(), GITLAB);
  assert.equal(other.length, 1);
  assert.equal(other[0].path, GITLAB_FILE);

  const missing = configurationDrift({}, defaultSchedule(), GITHUB);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].path, GITHUB_FILE);
});

// TST-745003 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (1b)
// given: the generated GitLab file and a .gitlab-ci.yml of the product that has an include: key with another entry but not `- local: .gitlab/agent-m-tests.yml`
// input: configurationDrift(files, defaultSchedule(), GITLAB)
// expect: exactly one difference, with the path .gitlab-ci.yml and a text that names the missing entry
test("configurationDrift — a GitLab .gitlab-ci.yml without the include entry gives a difference", () => {
  const files = { ...generated(GITLAB), ".gitlab-ci.yml": "stages:\n  - test\ninclude:\n  - local: other.yml\n" };
  const found = configurationDrift(files, defaultSchedule(), GITLAB);
  assert.equal(found.length, 1);
  assert.equal(found[0].path, ".gitlab-ci.yml");
  assert.ok(found[0].difference.includes(ENTRY), found[0].difference);
});

// TST-745004 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027 (1a)
// given: the generated GitHub file and, beside it, .github/workflows/ci.yml of the product, which Agent M did not generate, triggered by `push` and `schedule` and not by `pull_request`; the default schedule
// input: configurationDrift(files, defaultSchedule(), GITHUB)
// expect: exactly one entry, with the path .github/workflows/ci.yml, whose text names the triggers push and schedule, not pull_request, and the rows the schedule runs on their occasions — paid, which only the nightly occasion (schedule) runs, among them
test("configurationDrift — a foreign workflow with push and schedule triggers is read as such", () => {
  const foreign = "name: ci\non:\n  push:\n    branches: [main]\n  schedule:\n    - cron: \"0 2 * * *\"\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n";
  const files = { ...generated(GITHUB), ".github/workflows/ci.yml": foreign };
  const found = configurationDrift(files, defaultSchedule(), GITHUB);
  assert.equal(found.length, 1);
  assert.equal(found[0].path, ".github/workflows/ci.yml");
  assert.match(found[0].difference, /\bpush\b/);
  assert.match(found[0].difference, /\bschedule\b/);
  assert.doesNotMatch(found[0].difference, /pull_request/);
  assert.match(found[0].difference, /\bpaid\b/);
});

// TST-745005 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027 (1b)
// given: a schedule whose row component runs on the participant lab-runner (a runner route), resources with one endpoint whose secret is ci:ORACLE_KEY (the row paid is ticked nightly), and the files ciConfiguration generates from them for GitHub and for GitLab
// input: configurationDrift(files, schedule, target) for each; then the same with one line of the generated file edited
// expect: the unedited files give the empty list and do not throw; the edited ones give exactly one difference with the path of the file
const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const REAL = readDocument(scheduleSchema, "docs/tests/schedule.md", `---\nnightly: 03:30\n---\n## Levels\n\n${HEAD}
| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |
| component | ✓ | ✓ | ✓ | ✓ | ✓ | lab-runner |
| system | ✓ | ✓ | ✓ | ✓ | ✓ | |
| paid | | | ✓ | ✓ | ✓ | |
| release | | | | ✓ | ✓ | |
| user | | | | ✓ | ✓ | |
`);
const PARTICIPANTS = readDocument(participantSchema(), "docs/participants.md", `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ci runner:lab secret LAB_KEY |
`);
const RESOURCES = readDocument(resourceSchema(), "docs/resources.md", `# Resources of this product

**REGISTER**

The resources.

| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |
|---|---|---|---|---|---|---|---|---|---|
| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:ORACLE_KEY |
`);
for (const [server, target, path] of [["github", GITHUB, GITHUB_FILE], ["gitlab", GITLAB, GITLAB_FILE]]) {
  test(`configurationDrift — ${server}: the files of a schedule with a secret and a runner give no difference`, () => {
    const { files } = ciConfiguration(REAL, target, RESOURCES, PARTICIPANTS);
    assert.match(files[path], /ORACLE_KEY/);
    assert.match(files[path], /lab/);
    assert.deepEqual(configurationDrift(files, REAL, target), []);
    const lines = files[path].split("\n");
    lines[1] += " edited";
    const found = configurationDrift({ [path]: lines.join("\n") }, REAL, target);
    assert.equal(found.length, 1);
    assert.equal(found[0].path, path);
  });
}
