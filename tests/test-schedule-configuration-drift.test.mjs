// The committed configuration against the schedule (ITM-745) — MOD-test-schedule's configurationDrift(files, schedule, target,
// resources, participants), as the accepted text of docs/architecture/MOD-test-schedule.md states it under Interfaces: where the
// committed configuration differs from the one ciConfiguration generates from the same schedule, target, resources and participants;
// on GitLab a .gitlab-ci.yml without the include entry; empty when they agree; for a configuration Agent M did not generate, its
// triggers and the rows they run, as far as they can be read.
// Run: node --test tests/test-schedule-configuration-drift.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; NO SECRET IN THE REPOSITORY; UC-027
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect), in the test's own text; none is read
// from a document. Nothing here sleeps, waits or reaches the network. The counter-proofs, each a fault planted in
// src/test-schedule/ and restored, are recorded in the pull request.
// Readings, each adding no word to the sentence it reads (MOD-test-schedule, Interfaces, configurationDrift):
//   - "differs" is counted by the hunk: a run of consecutive committed lines that differ from the generated text is one difference,
//     whose text begins with `line <n>`, n counted from 1 in the committed file; a line removed or added makes one, not one for
//     every line after it.
//   - "the triggers it has and which rows they run" is the rows the schedule ticks for the occasions the triggers stand for: push for
//     every commit, pull_request for pull request, schedule for nightly, workflow_dispatch for on demand.
//   - "a configuration Agent M did not generate" leaves out the files named agent-m-*, which Agent M's other modules generate.

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
const SERVERS = [["github", GITHUB, GITHUB_FILE], ["gitlab", GITLAB, GITLAB_FILE]];

const HEAD = "| Row | every commit | pull request | nightly | release candidate | on demand | runs on |\n|---|---|---|---|---|---|---|";
const scheduleOf = (rows) => readDocument(scheduleSchema, "docs/tests/schedule.md", `---\nnightly: 03:30\n---\n## Levels\n\n${HEAD}\n${rows.join("\n")}\n`);
// Every row ticked on every occasion but `paid`, which is ticked wherever the default ticks it; component runs on the runner lab.
const REAL = scheduleOf([
  "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | ✓ | ✓ | ✓ | ✓ | ✓ | lab-runner |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  "| paid | | | ✓ | ✓ | ✓ | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);
// The same, but paid and component are ticked for the release candidate only: one secret line and one runner line per file.
const ONCE = scheduleOf([
  "| unit | ✓ | ✓ | ✓ | ✓ | ✓ | |", "| component | | | | ✓ | | lab-runner |", "| system | ✓ | ✓ | ✓ | ✓ | ✓ | |",
  "| paid | | | | ✓ | | |", "| release | | | | ✓ | ✓ | |", "| user | | | | ✓ | ✓ | |"]);

const participantsOf = (route) => readDocument(participantSchema(), "docs/participants.md", `# Participants of this instance

**REGISTER**

The participants of the test instance.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| lab-runner | CI agent | example-model | 200000 | — | draft text, run code and tests | this machine | ${route} |
`);
const PARTICIPANTS = participantsOf("ci runner:lab secret LAB_KEY");
const RESOURCE_HEAD = "| Name | Kind | Address | Pin | Licence | Maintainer | Route | Processing place | Paid | Secret |\n|---|---|---|---|---|---|---|---|---|---|";
const resourcesOf = (secret) => readDocument(resourceSchema(), "docs/resources.md",
  `# Resources of this product\n\n**REGISTER**\n\nThe resources.\n\n${RESOURCE_HEAD}\n| oracle | endpoint | https://api.example.org/v1 | example-model | — | — | runner:cpu | the vendor | yes | ci:${secret} |\n`);
const RESOURCES = resourcesOf("ORACLE_KEY");

// The files of a product that merged the generated configuration: the generated files, on GitLab with a .gitlab-ci.yml that includes them.
function generated(schedule, target, resources = RESOURCES, participants = PARTICIPANTS) {
  const { files, include } = ciConfiguration(schedule, target, resources, participants);
  return include ? { ...files, [include.file]: `stages:\n  - test\ninclude:\n  ${include.entry}\n` } : files;
}
const place = (files, path, text) => ({ ...files, [path]: text });
const drift = (files, schedule, target) => configurationDrift(files, schedule, target, RESOURCES, PARTICIPANTS);
const linesOf = (text) => text.split("\n");
const lineAt = (text, pattern, nth = 0) => {
  const at = linesOf(text).flatMap((line, i) => (pattern.test(line) ? [i] : []))[nth];
  assert.notEqual(at, undefined, `no line matches ${pattern}`);
  return at;
};
const edited = (text, at, change) => linesOf(text).map((line, i) => (i === at ? change(line) : line)).join("\n");
const removed = (text, at) => linesOf(text).filter((_, i) => i !== at).join("\n");
// The one difference a single hand edit at (0-based) line `at` must give: the path, and a text that begins with that line's number —
// or, where the line was removed from a run of identical lines, with the number of any line of that run, since which of them was
// removed cannot be told.
function assertOne(found, path, at, mention, text = null) {
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0].path, path);
  const lines = text === null ? [] : linesOf(text);
  let first = at;
  let last = at;
  while (first > 0 && lines[first - 1] === lines[at]) first -= 1;
  while (last + 1 < lines.length && lines[last + 1] === lines[at]) last += 1;
  const number = Number(/^line (\d+)\b/.exec(found[0].difference)?.[1]);
  assert.ok(number >= first + 1 && number <= last + 1, `${found[0].difference} is not at line ${first + 1} to ${last + 1}`);
  if (mention) assert.ok(found[0].difference.includes(mention), `${found[0].difference} does not name ${mention}`);
}

// TST-745001 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; GITLAB PRODUCTS ARE SUPPORTED; UC-027
// given: a schedule whose row paid is ticked and whose row component runs on the participant lab-runner (route runner:lab), resources with one endpoint whose secret is ci:ORACLE_KEY, and the files ciConfiguration generates from them for GitHub and for GitLab (for GitLab also the product's .gitlab-ci.yml that holds the include entry); then the default schedule with no resource and no participant
// input: configurationDrift(files, schedule, target, resources, participants) for each, with the files unedited
// expect: the empty list for each, and nothing thrown — and the generated files do hold ORACLE_KEY and the label lab, so that the case is not empty of what it tests
for (const [server, target, path] of SERVERS) {
  test(`configurationDrift — ${server}: the unedited files with a paid secret and a runner participant give no difference`, () => {
    const files = generated(REAL, target);
    assert.match(files[path], /ORACLE_KEY/);
    assert.match(files[path], /\blab\b/);
    assert.deepEqual(configurationDrift(files, REAL, target, RESOURCES, PARTICIPANTS), []);
    if (server === "gitlab") assert.ok(".gitlab-ci.yml" in files, "the product's .gitlab-ci.yml, with the include entry");
    const bare = generated(defaultSchedule(), target, NONE, NONE);
    assert.deepEqual(configurationDrift(bare, defaultSchedule(), target, NONE, NONE), []);
  });
}

// TST-745002 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the files generated for the schedule with a secret and a runner (REAL), each in turn with the text of one single line changed (a suffix added), and in turn with one single line removed — every line of the file, one case per line
// input: configurationDrift(files, REAL, target, resources, participants), for GitHub and for GitLab
// expect: exactly one difference for each case, with the path of the file and a text that begins with the number of that line — an inserted or removed line shifts none of the others into a difference
for (const [server, target, path] of SERVERS) {
  test(`configurationDrift — ${server}: each single edited line, and each single removed line, gives exactly one difference with its path`, () => {
    const files = generated(REAL, target);
    const text = files[path];
    const count = linesOf(text).length;
    assert.ok(count > 100, "a file of the length the generation gives");
    for (let at = 0; at < count; at += 1) {
      const suffix = drift(place(files, path, edited(text, at, (line) => `${line} # by hand`)), REAL, target);
      assertOne(suffix, path, at);
      const without = drift(place(files, path, removed(text, at)), REAL, target);
      assertOne(without, path, at, null, text);
    }
  });
}

// TST-745003 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; NO SECRET IN THE REPOSITORY; UC-027
// given: the files generated for a schedule that ticks paid and component for the release candidate only, so that each file holds one secret line and one runner line; on GitHub the secret line `ORACLE_KEY: ${{ secrets.ORACLE_KEY }}` and `runs-on: [self-hosted, lab]`; on GitLab the comment `# Secrets, read from the CI variables: ORACLE_KEY` and `tags: [lab]`
// input: configurationDrift for the files with, in turn, (a) the secret line renamed to OTHER_KEY, (b) the runner label changed to other, (c) the secret line removed by hand
// expect: for each, exactly one difference, with the path of the file, the number of the line, and the text found (a, b) or the text missing (c) — a configuration that lost its paid secret or moved to another runner is shown as differing
for (const [server, target, path] of SERVERS) {
  test(`configurationDrift — ${server}: an edited secret line, an edited runner line and a removed secret line each give one difference`, () => {
    const files = generated(ONCE, target);
    const text = files[path];
    const secret = server === "github" ? /ORACLE_KEY: \$\{\{ secrets\.ORACLE_KEY \}\}/ : /# Secrets, read from the CI variables: ORACLE_KEY/;
    const runner = server === "github" ? /runs-on: \[self-hosted, lab\]/ : /tags: \[lab\]/;
    assert.equal(linesOf(text).filter((line) => secret.test(line)).length, 1);
    assert.equal(linesOf(text).filter((line) => runner.test(line)).length, 1);
    const atSecret = lineAt(text, secret);
    const atRunner = lineAt(text, runner);
    assertOne(drift(place(files, path, edited(text, atSecret, (line) => line.replaceAll("ORACLE_KEY", "OTHER_KEY"))), ONCE, target), path, atSecret, "OTHER_KEY");
    assertOne(drift(place(files, path, edited(text, atRunner, (line) => line.replace("lab", "other"))), ONCE, target), path, atRunner, "other");
    assertOne(drift(place(files, path, removed(text, atSecret)), ONCE, target), path, atSecret, "ORACLE_KEY");
    assertOne(drift(place(files, path, removed(text, atRunner)), ONCE, target), path, atRunner, "lab");
  });
}

// TST-745004 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; NO SECRET IN THE REPOSITORY; UC-027
// given: the files generated for the schedule that ticks paid for three occasions and component for five on lab-runner, so that a file holds three secret lines and five runner lines; the secret line of every occurrence renamed to OTHER_KEY, the runner label of every occurrence changed to other
// input: configurationDrift for each of the two edited files, on GitHub and on GitLab
// expect: one difference for each occurrence — three for the secret lines, five for the runner lines — each with the path of the file; none of the occurrences hides another
for (const [server, target, path] of SERVERS) {
  test(`configurationDrift — ${server}: every occurrence of an edited secret or runner line gives its own difference`, () => {
    const files = generated(REAL, target);
    const text = files[path];
    const secret = server === "github" ? /ORACLE_KEY: \$\{\{ secrets\.ORACLE_KEY \}\}/ : /# Secrets, read from the CI variables: ORACLE_KEY/;
    const runner = server === "github" ? /runs-on: \[self-hosted, lab\]/ : /tags: \[lab\]/;
    const everywhere = (pattern, change) => linesOf(text).map((line) => (pattern.test(line) ? change(line) : line)).join("\n");
    const secrets = drift(place(files, path, everywhere(secret, (line) => line.replaceAll("ORACLE_KEY", "OTHER_KEY"))), REAL, target);
    assert.equal(secrets.length, 3, JSON.stringify(secrets));
    assert.ok(secrets.every((found) => found.path === path));
    const runners = drift(place(files, path, everywhere(runner, (line) => line.replace("lab", "other"))), REAL, target);
    assert.equal(runners.length, 5, JSON.stringify(runners));
    assert.ok(runners.every((found) => found.path === path));
  });
}

// TST-745005 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; NO SECRET IN THE REPOSITORY; UC-027
// given: the files generated for REAL with the resource whose secret is ci:ORACLE_KEY and the participant lab-runner on runner:lab
// input: configurationDrift(files, REAL, target, resources, participants) with (a) resources whose secret is ci:OTHER_KEY, (b) no resource, (c) a participant lab-runner on runner:other, (d) no participant of that name — the rest as generated
// expect: (a) differences, the secret lines among them; (b) differences, the secret lines among them; (c) differences, the runner lines among them; (d) the call throws InvalidSchedule, as ciConfiguration does for a runner no participant offers — the secrets and the runner label are those of the resources and the participants passed in, none read back from the committed files
for (const [server, target, path] of SERVERS) {
  test(`configurationDrift — ${server}: the secrets and the runner are those of the resources and participants passed in`, () => {
    const files = generated(REAL, target);
    const secret = server === "github" ? "ORACLE_KEY: ${{ secrets.ORACLE_KEY }}" : "# Secrets, read from the CI variables: ORACLE_KEY";
    const runner = server === "github" ? "runs-on: [self-hosted, lab]" : "tags: [lab]";
    const other = configurationDrift(files, REAL, target, resourcesOf("OTHER_KEY"), PARTICIPANTS);
    assert.ok(other.length >= 3 && other.every((found) => found.path === path), JSON.stringify(other));
    assert.ok(other.some((found) => found.difference.includes(secret)), "the secret line, as committed, is named");
    const none = configurationDrift(files, REAL, target, NONE, PARTICIPANTS);
    assert.ok(none.length >= 3 && none.every((found) => found.path === path), JSON.stringify(none));
    assert.ok(none.some((found) => found.difference.includes(secret)));
    const moved = configurationDrift(files, REAL, target, RESOURCES, participantsOf("ci runner:other secret LAB_KEY"));
    assert.ok(moved.length >= 5 && moved.every((found) => found.path === path), JSON.stringify(moved));
    assert.ok(moved.some((found) => found.difference.includes(runner)));
    assert.throws(() => configurationDrift(files, REAL, target, RESOURCES, NONE), (error) => error.name === "InvalidSchedule");
  });
}

// TST-745006 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the generated GitHub file; and with it, in turn, the file left out, and the file whose first line is changed
// input: configurationDrift(files, REAL, GITHUB, resources, participants)
// expect: the file left out gives exactly one difference, with its path, that says the file is missing; the changed file exactly one, with its path and line 1
test("configurationDrift — a generated file that is missing gives one difference with its path", () => {
  const text = generated(REAL, GITHUB)[GITHUB_FILE];
  const missing = drift({}, REAL, GITHUB);
  assert.equal(missing.length, 1);
  assert.equal(missing[0].path, GITHUB_FILE);
  assert.match(missing[0].difference, /missing/i);
  assertOne(drift(place(generated(REAL, GITHUB), GITHUB_FILE, edited(text, 0, () => "# my own tests")), REAL, GITHUB), GITHUB_FILE, 0, "# my own tests");
});

// TST-745007 · level: unit · module: MOD-test-schedule
// guards: GITLAB PRODUCTS ARE SUPPORTED; THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the generated GitLab file and, beside it, a .gitlab-ci.yml of the product that (a) has an include: with another entry only, (b) has no include: key, (c) names the entry only in a comment, (d) is left out; and one that holds the entry among others, and one that holds it with quotes
// input: configurationDrift(files, REAL, GITLAB, resources, participants)
// expect: (a) to (d) exactly one difference each, with the path .gitlab-ci.yml and a text that names the entry `- local: .gitlab/agent-m-tests.yml`; the two that hold the entry, none. On GitHub, a .gitlab-ci.yml among the files is no difference
test("configurationDrift — GitLab: a .gitlab-ci.yml without the include entry gives a difference", () => {
  const { ".gitlab-ci.yml": _included, ...base } = generated(REAL, GITLAB);
  const without = {
    "an include: of another entry": "stages:\n  - test\ninclude:\n  - local: other.yml\n",
    "no include: key": "stages:\n  - test\nbuild:\n  script: make\n",
    "the entry in a comment only": `stages:\n  - test\ninclude:\n  - local: other.yml\n  # ${ENTRY}\n`,
  };
  for (const [why, text] of Object.entries(without)) {
    const found = drift({ ...base, ".gitlab-ci.yml": text }, REAL, GITLAB);
    assert.equal(found.length, 1, why);
    assert.equal(found[0].path, ".gitlab-ci.yml", why);
    assert.ok(found[0].difference.includes(ENTRY), `${why}: ${found[0].difference}`);
  }
  const absent = drift(base, REAL, GITLAB);
  assert.equal(absent.length, 1);
  assert.equal(absent[0].path, ".gitlab-ci.yml");
  assert.ok(absent[0].difference.includes(ENTRY));
  for (const text of [`stages:\n  - test\ninclude:\n  - local: other.yml\n  ${ENTRY}\n`, `include:\n  - local: '.gitlab/agent-m-tests.yml'\nbuild:\n  script: make\n`]) {
    assert.deepEqual(drift({ ...base, ".gitlab-ci.yml": text }, REAL, GITLAB), []);
  }
  assert.deepEqual(drift({ ...generated(REAL, GITHUB), ".gitlab-ci.yml": "stages:\n  - test\n" }, REAL, GITHUB), []);
});

// TST-745008 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the generated GitHub file for the default schedule and, beside it, .github/workflows/ci.yml of the product, which Agent M did not generate, triggered by push (with branches and tags below it) and schedule and not by pull_request; also .github/workflows/agent-m-jobs.yml triggered by push
// input: configurationDrift(files, defaultSchedule(), GITHUB, none, none)
// expect: exactly one entry, with the path .github/workflows/ci.yml, whose text names the triggers push and schedule, neither pull_request nor branches nor tags, and the rows the schedule ticks for every commit and nightly — unit, component, system and paid — and neither release nor user; agent-m-jobs.yml gives none
test("configurationDrift — a foreign workflow with push and schedule triggers is read as such", () => {
  const foreign = "name: ci\non:\n  push:\n    branches: [main]\n    tags:\n      - \"v*\"\n  schedule:\n    - cron: \"0 2 * * *\"\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n";
  const own = "name: jobs\non:\n  push:\n    branches: [main]\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - run: true\n";
  const files = { ...generated(defaultSchedule(), GITHUB, NONE, NONE), ".github/workflows/ci.yml": foreign, ".github/workflows/agent-m-jobs.yml": own };
  const found = configurationDrift(files, defaultSchedule(), GITHUB, NONE, NONE);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0].path, ".github/workflows/ci.yml");
  const text = found[0].difference;
  for (const word of ["push", "schedule", "unit", "component", "system", "paid"]) assert.match(text, new RegExp(`\\b${word}\\b`), `${word}: ${text}`);
  for (const word of ["pull_request", "branches", "tags", "release", "user"]) assert.doesNotMatch(text, new RegExp(`\\b${word}\\b`), `${word}: ${text}`);
});

// TST-745009 · level: unit · module: MOD-test-schedule
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: the default schedule and a foreign workflow in each of the other forms of `on:` — the list `[pull_request]`, the single word `workflow_dispatch`, the block with pull_request and push — and one with a non-workflow file name (notes.md)
// input: configurationDrift(files, defaultSchedule(), GITHUB, none, none), the generated file beside the foreign one
// expect: the list: one entry naming pull_request and not push; the word: one entry naming workflow_dispatch and every row (paid, release and user among them); the block: one entry naming pull_request and push; notes.md under .github/workflows/: none
test("configurationDrift — a foreign workflow's triggers are read in each form of `on:`", () => {
  const generatedFiles = generated(defaultSchedule(), GITHUB, NONE, NONE);
  const read = (extra) => configurationDrift({ ...generatedFiles, ...extra }, defaultSchedule(), GITHUB, NONE, NONE);
  const list = read({ ".github/workflows/a.yml": "on: [pull_request]\njobs: {}\n" });
  assert.equal(list.length, 1);
  assert.equal(list[0].path, ".github/workflows/a.yml");
  assert.match(list[0].difference, /\bpull_request\b/);
  assert.doesNotMatch(list[0].difference, /\bpush\b/);
  const word = read({ ".github/workflows/b.yml": "name: b\non: workflow_dispatch\njobs: {}\n" });
  assert.equal(word.length, 1);
  assert.equal(word[0].path, ".github/workflows/b.yml");
  for (const name of ["workflow_dispatch", "unit", "component", "system", "paid", "release", "user"]) assert.match(word[0].difference, new RegExp(`\\b${name}\\b`), name);
  const block = read({ ".github/workflows/c.yaml": "on:\n  pull_request:\n    branches: [main]\n  push:\njobs: {}\n" });
  assert.equal(block.length, 1);
  assert.equal(block[0].path, ".github/workflows/c.yaml");
  assert.match(block[0].difference, /\bpull_request\b/);
  assert.match(block[0].difference, /\bpush\b/);
  assert.deepEqual(read({ ".github/workflows/notes.md": "on: push\n" }), []);
});
