// Agent M's job workflow for a product (ITM-322) — MOD-runtimes' jobWorkflowFiles(server, instance, secrets, runners) and the
// templates workflow/github.yml and workflow/gitlab.yml, as the accepted text of docs/architecture/MOD-runtimes.md states them (Data:
// Agent M's job workflow in a product; Interfaces: jobWorkflowFiles), for UC-010 and UC-011 1c: `.github/workflows/agent-m-jobs.yml`
// on GitHub, `.gitlab/agent-m-jobs.yml` on GitLab with the include the product's `.gitlab-ci.yml` needs; started by a push to the
// default branch that changes `docs/jobs/` or `docs/gates/`, a pull request closed or merged, a completed check, a daily schedule and
// a start from the server's own page with a job's identifier; one job for each route of the product's CI agents — the server's runners
// and each self-hosted runner by its label —, each checking out the product with the person's token, checking out the instance at the
// commit the file names and running `node src/workflow-entries/main.mjs <entry>`; the agents' keys only by their secrets' names. The
// entries (ITM-365) and the settings line that installs the files (ITM-351) are not part of this item.
// Run: node --test tests/runtimes-workflow.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-010; UC-011; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// Guards: NO SECRET IN THE REPOSITORY; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; AGENT M WORKS WITHOUT A LOCAL INSTALLATION
// Level: unit
//
// jobWorkflowFiles is pure and gives text, of which this file asks what the module file states and no more: the paths; the events and
// the entry each starts; the jobs and the runner each takes; the instance and its commit; the names of the secrets and nothing that
// could be a value. No YAML parser stands in this repository, so the files are read as text: a GitHub file as the steps that begin at
// `      - ` and the jobs that begin at `  <id>:` under `jobs:`, a GitLab file as the jobs that begin at the margin and the rules that
// begin at `    - if:`. The module file gives the arguments' meaning only by their names: `instance.repository` is read as `owner/name`
// on github.com, `secrets.token` as the name of the secret that holds the person's token and `secrets.keys` as the names of the
// secrets that hold the agents' keys; the entries find the runner a job is for in `AGENT_M_RUNNER` and the product's checkout in
// `AGENT_M_PRODUCT_DIR`, and the names of the secrets in `AGENT_M_TOKEN_NAME` and `AGENT_M_KEY_NAMES`. The include entry GitLab needs
// is returned as the text of `.gitlab-ci.yml` to add, a second file. Each test states its input and its expected result before it runs
// (given / input / expect). A name the module does not provide yet is undefined here, so that each test fails by itself. Nothing reaches
// the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";

const { jobWorkflowFiles } = runtimes;

const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const INSTANCE = { repository: "alice/agent-m", commit: COMMIT };
const SECRETS = { token: "AGENT_M_TOKEN", keys: ["CLAUDE_KEY", "OPENAI_KEY"] };
const NAMES = [SECRETS.token, ...SECRETS.keys];
const RUNNERS = ["gpu"];
const files = (server, runners = RUNNERS, secrets = SECRETS) => jobWorkflowFiles(server, INSTANCE, secrets, runners);
const workflow = (server, runners, secrets) => files(server, runners, secrets)[0].text;
const MAIN = "node src/workflow-entries/main.mjs";

// The entries the five events start (MOD-runtimes, Data).
const ENTRIES = ["onRecordsChanged", "onPullRequestClosed", "onCheckCompleted", "onSchedule", "onDispatch"];
const GITHUB_EVENTS = { onRecordsChanged: "push", onPullRequestClosed: "pull_request", onCheckCompleted: "check_run",
  onSchedule: "schedule", onDispatch: "workflow_dispatch" };
const GITLAB_SOURCES = { onRecordsChanged: "push", onPullRequestClosed: "merge_request_event", onCheckCompleted: "pipeline",
  onSchedule: "schedule", onDispatch: "web" };

// The jobs of a GitHub file: { id, text } for each `  <id>:` under `jobs:`; the steps of a job: the text from each `      - `.
function githubJobs(text) {
  const rest = text.slice(text.indexOf("\njobs:\n") + 7);
  return rest.split(/\n(?=  [A-Za-z0-9_-]+:\n)/).map((block) => ({ id: /^\s*([A-Za-z0-9_-]+):/.exec(block)[1], text: block }));
}
const stepsOf = (job) => job.text.split(/\n(?=      - )/).slice(1);
// The jobs of a GitLab file: { id, text } for each job that begins at the margin; the rules of a job: the text from each `    - if:`.
const gitlabJobs = (text) => text.split(/\n(?=[A-Za-z0-9_-]+:\n)/).filter((block) => /^agent-m-/.test(block))
  .map((block) => ({ id: /^([A-Za-z0-9_-]+):/.exec(block)[1], text: block }));
const rulesOf = (job) => job.text.split(/\n(?=    - if:)/).slice(1);

// ---------------------------------------------------------------- the files

// guards: UC-010; AGENT M WORKS WITHOUT A LOCAL INSTALLATION
// given: an instance alice/agent-m at a commit, two secret names for keys and one for the token, and the runner label gpu
// input: jobWorkflowFiles("github", …) and jobWorkflowFiles("gitlab", …)
// expect: for GitHub one file, .github/workflows/agent-m-jobs.yml; for GitLab .gitlab/agent-m-jobs.yml first and then the include the
//         product's .gitlab-ci.yml needs, at the path .gitlab-ci.yml, which includes that file; each file's text is not empty
test("jobWorkflowFiles — the file of GitHub, and the file of GitLab with the include its .gitlab-ci.yml needs", () => {
  const github = files("github"), gitlab = files("gitlab");

  assert.deepEqual(github.map((file) => file.path), [".github/workflows/agent-m-jobs.yml"]);
  assert.deepEqual(gitlab.map((file) => file.path), [".gitlab/agent-m-jobs.yml", ".gitlab-ci.yml"]);
  for (const file of [...github, ...gitlab]) assert.match(file.text, /\S/, file.path);
  assert.match(gitlab[1].text, /^include:\n\s+- local: ["']?\.gitlab\/agent-m-jobs\.yml["']?\s*$/);
});

// ---------------------------------------------------------------- the events

// guards: UC-010
// given: the two files for the instance, the secrets and the runner above
// input: the triggers and the steps of the GitHub file; the rules of each job of the GitLab file
// expect: GitHub — a push that changes docs/jobs/ or docs/gates/, a pull request closed, a check run completed, a schedule once a day,
//         and a start by hand with the job's identifier as its input; in every job a step for each of the five events that runs
//         `node src/workflow-entries/main.mjs <entry>` with the entry of that event — push onRecordsChanged, pull request
//         onPullRequestClosed, check onCheckCompleted, schedule onSchedule, dispatch onDispatch —, the push step only on the default
//         branch. GitLab — in every job a rule for each of the five pipeline sources that sets AGENT_M_ENTRY to that entry, the
//         push rule only on the default branch and for a change of docs/jobs/ or docs/gates/, and a script that runs the
//         entry
test("jobWorkflowFiles — each event starts its entry, on GitHub and on GitLab", () => {
  const github = workflow("github");
  assert.match(github, /\n  push:\n(?:.*\n)*?    paths:\n(?:.*\n)*?      - ["']?docs\/jobs\/\*\*["']?\n(?:.*\n)*?      - ["']?docs\/gates\/\*\*["']?\n/);
  assert.match(github, /\n  pull_request:\n    types: \[closed\]\n/);
  assert.match(github, /\n  check_run:\n    types: \[completed\]\n/);
  assert.match(github, /\n  schedule:\n    - cron: ["'][^"']+["']\n/);
  assert.match(github, /\n  workflow_dispatch:\n    inputs:\n      job:\n/);
  for (const job of githubJobs(github)) {
    for (const entry of ENTRIES) {
      const steps = stepsOf(job).filter((step) => step.includes(`${MAIN} ${entry}`));
      assert.equal(steps.length, 1, `${job.id}: one step for ${entry}`);
      assert.ok(steps[0].includes(`github.event_name == '${GITHUB_EVENTS[entry]}'`), `${job.id}: ${entry} on ${GITHUB_EVENTS[entry]}: ${steps[0]}`);
    }
    const push = stepsOf(job).find((step) => step.includes(`${MAIN} onRecordsChanged`));
    assert.match(push, /default_branch/, `${job.id}: the push step only on the default branch`);
  }

  const gitlab = gitlabJobs(workflow("gitlab"));
  assert.ok(gitlab.length > 0);
  for (const job of gitlab) {
    assert.equal(rulesOf(job).length, ENTRIES.length, `${job.id}: a rule for each event`);
    for (const entry of ENTRIES) {
      const rules = rulesOf(job).filter((rule) => rule.includes(`AGENT_M_ENTRY: ${entry}`));
      assert.equal(rules.length, 1, `${job.id}: one rule for ${entry}`);
      assert.ok(rules[0].includes(`$CI_PIPELINE_SOURCE == "${GITLAB_SOURCES[entry]}"`), `${job.id}: ${entry} on ${GITLAB_SOURCES[entry]}: ${rules[0]}`);
    }
    const push = rulesOf(job).find((rule) => rule.includes("AGENT_M_ENTRY: onRecordsChanged"));
    assert.ok(push.includes("$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH"), `${job.id}: the push rule on the default branch`);
    assert.match(push, /changes:\n\s+- docs\/jobs\/\*\*\/\*\n\s+- docs\/gates\/\*\*\/\*/);
    assert.ok(job.text.includes(`${MAIN} "$AGENT_M_ENTRY"`), `${job.id}: the script runs the entry`);
  }
});

// ---------------------------------------------------------------- the routes

// guards: A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; AGENT M WORKS WITHOUT A LOCAL INSTALLATION; UC-011
// given: the runner labels (1) gpu, (2) none, (3) gpu and cpu
// input: jobWorkflowFiles for each, on GitHub and on GitLab
// expect: one job for each route — the server's runners and each runner by its label, in that order: (1) two, (2) one, (3) three —;
//         GitHub: the hosted job runs on ubuntu-latest and a runner's on [self-hosted, "<label>"]; GitLab: the hosted job has no tag and
//         a runner's has the tag of its label; every job takes the product's jobs of its own route, AGENT_M_RUNNER being `hosted` or
//         the label
test("jobWorkflowFiles — one job for each route of the product's CI agents", () => {
  for (const [runners, labels] of [[["gpu"], ["gpu"]], [[], []], [["gpu", "cpu"], ["gpu", "cpu"]]]) {
    const github = githubJobs(workflow("github", runners)), gitlab = gitlabJobs(workflow("gitlab", runners));

    assert.deepEqual(github.map((job) => job.id), ["hosted", ...labels.map((label) => `runner-${label}`)], `GitHub with ${runners}`);
    assert.deepEqual(gitlab.map((job) => job.id), ["agent-m-hosted", ...labels.map((label) => `agent-m-runner-${label}`)], `GitLab with ${runners}`);
    assert.match(github[0].text, /\n    runs-on: ubuntu-latest\n/);
    assert.match(github[0].text, /AGENT_M_RUNNER: "hosted"\n/);
    assert.ok(!/\n {2,4}tags:/.test(gitlab[0].text), "the hosted job has no tag");
    assert.match(gitlab[0].text, /AGENT_M_RUNNER: "hosted"\n/);
    labels.forEach((label, at) => {
      assert.match(github[at + 1].text, new RegExp(`\\n    runs-on: \\[self-hosted, "${label}"\\]\\n`));
      assert.match(github[at + 1].text, new RegExp(`AGENT_M_RUNNER: "${label}"\\n`));
      assert.match(gitlab[at + 1].text, new RegExp(`\\n  tags: \\["${label}"\\]\\n`));
      assert.match(gitlab[at + 1].text, new RegExp(`AGENT_M_RUNNER: "${label}"\\n`));
    });
  }
});

// ---------------------------------------------------------------- the instance and the product

// guards: UC-010; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the instance alice/agent-m at the commit 0123…4567
// input: jobWorkflowFiles on each server
// expect: GitHub — in every job the product checked out with the person's token, then alice/agent-m checked out at that commit — and at
//         no other ref —, the entries run from the instance's checkout; GitLab — the instance cloned and set to that commit before the
//         entry runs, the product's directory handed over as AGENT_M_PRODUCT_DIR; on both the commit stands in the file once for each
//         job, and nothing runs on a branch name of the instance
test("jobWorkflowFiles — the product is checked out with the person's token and the instance at the commit the file names", () => {
  for (const job of githubJobs(workflow("github"))) {
    const checkouts = stepsOf(job).filter((step) => step.includes("actions/checkout"));
    assert.equal(checkouts.length, 2, job.id);
    assert.match(checkouts[0], /path: product(\n|$)/);
    assert.match(checkouts[0], /token: \$\{\{ secrets\.AGENT_M_TOKEN \}\}/);
    assert.match(checkouts[1], /repository: alice\/agent-m\n/);
    assert.ok(checkouts[1].includes(`ref: ${COMMIT}\n`), checkouts[1]);
    assert.match(checkouts[1], /path: instance(\n|$)/);
    assert.ok(stepsOf(job).filter((step) => step.includes(MAIN)).every((step) => step.includes("working-directory: instance")), job.id);
    assert.match(job.text, /AGENT_M_PRODUCT_DIR: \$\{\{ github\.workspace \}\}\/product\n/);
    assert.equal(job.text.split(COMMIT).length - 1, 1, `${job.id}: the commit once`);
  }
  for (const job of gitlabJobs(workflow("gitlab"))) {
    assert.ok(job.text.includes(`AGENT_M_COMMIT: "${COMMIT}"\n`), job.id);
    assert.ok(job.text.includes('AGENT_M_INSTANCE: "alice/agent-m"\n'), job.id);
    assert.match(job.text, /clone "https:\/\/github\.com\/\$AGENT_M_INSTANCE\.git"/);
    assert.match(job.text, /checkout "\$AGENT_M_COMMIT"/);
    assert.match(job.text, /AGENT_M_PRODUCT_DIR="\$CI_PROJECT_DIR"/);
    assert.equal(job.text.split(COMMIT).length - 1, 1, `${job.id}: the commit once`);
  }
});

// ---------------------------------------------------------------- the secrets

// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; NO SECRET IN THE REPOSITORY
// given: the secrets AGENT_M_TOKEN, CLAUDE_KEY and OPENAI_KEY, and a second call with the token secret PERSON_TOKEN; and names that are no
//        names of a secret
// input: jobWorkflowFiles on each server; and with a name that holds a space, `${{ secrets.X }}`, a quote or a newline, a commit that is
//        no 40-digit hex, a server that is neither, a repository that is no owner/name, and a runner label with a space
// expect: GitHub — every secret the file reads is one of the three, as `${{ secrets.<name> }}`, each of the three read, and the workflow's
//         own token (GITHUB_TOKEN) not at all; GitLab — every variable it reads is one of the three, a predefined CI_ variable or one of
//         Agent M's own AGENT_M_…, the names listed in AGENT_M_TOKEN_NAME and AGENT_M_KEY_NAMES; no file holds anything of the form of a
//         token (ghp_, github_pat_, glpat-); the second call reads PERSON_TOKEN and no AGENT_M_TOKEN secret; each bad argument throws a
//         TypeError and no file is made
test("jobWorkflowFiles — the secrets are named and never valued, the token is the person's and not the workflow's", () => {
  const github = workflow("github"), gitlab = workflow("gitlab");

  const read = [...github.matchAll(/secrets\.([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(read)].sort(), [...NAMES].sort());
  for (const name of NAMES) assert.ok(github.includes(`${name}: \${{ secrets.${name} }}`) || name === SECRETS.token, name);
  assert.ok(github.includes("AGENT_M_TOKEN: ${{ secrets.AGENT_M_TOKEN }}"));
  assert.ok(!/GITHUB_TOKEN|github\.token/.test(github), "the workflow's own token is not used");
  assert.ok(github.includes('AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN"') && github.includes('AGENT_M_KEY_NAMES: "CLAUDE_KEY OPENAI_KEY"'));

  const variables = [...gitlab.matchAll(/\$\{?([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1])
    .filter((name) => !/^(CI_|AGENT_M_)/.test(name));
  assert.deepEqual(variables, [], "every variable the GitLab file reads is predefined or Agent M's own");
  assert.ok(gitlab.includes('AGENT_M_TOKEN_NAME: "AGENT_M_TOKEN"') && gitlab.includes('AGENT_M_KEY_NAMES: "CLAUDE_KEY OPENAI_KEY"'));
  for (const text of [github, gitlab]) assert.ok(!/ghp_|github_pat_|glpat-/.test(text), "nothing of the form of a token");

  const other = workflow("github", RUNNERS, { token: "PERSON_TOKEN", keys: ["CLAUDE_KEY"] });
  assert.ok(other.includes("AGENT_M_TOKEN: ${{ secrets.PERSON_TOKEN }}") && !other.includes("secrets.AGENT_M_TOKEN"));
  assert.ok(workflow("gitlab", RUNNERS, { token: "PERSON_TOKEN", keys: [] }).includes('AGENT_M_TOKEN_NAME: "PERSON_TOKEN"'));

  for (const bad of ["MY KEY", "${{ secrets.X }}", 'A"B', "A\nB", "", "1KEY"]) {
    assert.throws(() => files("github", RUNNERS, { token: SECRETS.token, keys: [bad] }), TypeError, `key ${JSON.stringify(bad)}`);
    assert.throws(() => files("gitlab", RUNNERS, { token: bad, keys: [] }), TypeError, `token ${JSON.stringify(bad)}`);
  }
  assert.throws(() => jobWorkflowFiles("github", { repository: "alice/agent-m", commit: "main" }, SECRETS, []), TypeError, "a commit");
  assert.throws(() => jobWorkflowFiles("bitbucket", INSTANCE, SECRETS, []), { name: "TypeError", message: /GitHub or GitLab/ }, "a server");
  for (const repository of ["alice", "alice/agent m", "alice/agent-m/extra", "", "alice/agent-m\n  evil: x"]) {
    assert.throws(() => jobWorkflowFiles("github", { repository, commit: COMMIT }, SECRETS, []), TypeError, `repository ${JSON.stringify(repository)}`);
  }
  assert.throws(() => files("github", ["my gpu"]), TypeError, "a label");
});
