// The machines of Agent M's job workflow on GitLab — MOD-runtimes' jobWorkflowFiles and gitlabVariableScopes and the template workflow/gitlab.yml, as
// docs/architecture/MOD-runtimes.md states them (Data: Agent M's job workflow in a product): for each route a plan of no environment, an agent's job for each key
// the file reads — of the environment agent-m-key-<the key's name> alone, never agent-m-write, and never naming the person's token — and one of none, and a job
// that writes, of agent-m-write, which reads the token, runs no agent and no entry that runs one, and deletes the result once it is written.
// Run: node --test tests/runtimes-job-workflow-machines-gitlab.test.mjs
//
// Module: MOD-runtimes
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// Level: unit
//
// GitLab gives a job every CI/CD variable of the project unless the variable is scoped to an environment, which then reaches only the jobs of that environment
// ("set the variable's environment scope to `production` to only allow jobs with an environment of `production` to access the variable", docs.gitlab.com,
// "Environments", Limit the environment scope of a CI/CD variable). So the variables a job receives are decided by its `environment:` name, and a job "reads" the
// person's token where its text names it. No YAML parser stands in this repository: the file is read as the jobs that begin at the margin, as
// tests/runtimes-workflow.test.mjs reads it. Each test states its expected values in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { jobWorkflowFiles, gitlabVariableScopes } from "../src/runtimes/index.mjs";

const INSTANCE = { repository: "alice/agent-m", commit: "0123456789abcdef0123456789abcdef01234567" };
const SECRETS = { token: "PERSON_TOKEN", keys: ["KEY_A", "KEY_B"] };

const jobsOf = (text) => text.split(/\n(?=[A-Za-z0-9_-]+:\n)/).filter((block) => /^agent-m-/.test(block))
  .map((block) => ({ id: /^([A-Za-z0-9_-]+):/.exec(block)[1], text: block }));
const codeLines = (text) => text.split("\n").filter((line) => !/^\s*#/.test(line));
const code = (job) => codeLines(job.text).join("\n");
// The environment a job is of, which decides the scoped variables it receives; null for none.
const environmentOf = (job) => /\n  environment:\n    name: (\S+)\n/.exec(job.text)?.[1] ?? null;
// Whether a job names the person's token: its variable, the name of its variable, or the read of it.
const namesToken = (job) => /AGENT_M_TOKEN|PERSON_TOKEN/.test(code(job));
// Whether an agent or a model takes part in a job: the agent installed, or an entry that runs a job's participant.
const runsAnAgent = (job) => /opencode|AGENT_M_ENTRY: (onRecordsChanged|onDispatch)\b/.test(code(job));
// The entries a job's rules start, in their order.
const entriesOf = (job) => [...job.text.matchAll(/AGENT_M_ENTRY: (\w+)/g)].map((match) => match[1]);
const generated = (runners = ["gpu"]) => jobsOf(jobWorkflowFiles("gitlab", INSTANCE, SECRETS, runners)[0].text);

// TST-0125101 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: the GitLab job workflow for the token variable PERSON_TOKEN, the keys KEY_A and KEY_B, and the runner gpu; and — the counter-proofs — the agent's job of KEY_A made of the environment agent-m-write, of KEY_B's environment, and naming PERSON_TOKEN
// input: each job's environment, whether it names the token, whether it runs an agent, its first script line
// expect: for each route the plan is of no environment, names no token, runs no agent and leaves AGENT_M_AGENT in a dotenv report; the agent's job 0 is of no environment, 1 of agent-m-key-KEY_A, 2 of agent-m-key-KEY_B, each with action verify, none names the token, each needs the plan alone, carries AGENT_M_KEY its number, runs the agent, and ends at its first script line unless AGENT_M_AGENT is its number; no key's name stands in any job but in AGENT_M_KEY_NAMES and an environment's name; each counter-proof is found
test("jobWorkflowFiles — on GitLab each agent's job is of its key's environment alone, and the plan of none", () => {
  const jobs = generated();
  const byId = Object.fromEntries(jobs.map((job) => [job.id, job]));
  for (const route of ["agent-m-hosted", "agent-m-runner-gpu"]) {
    const plan = byId[`${route}-plan`];
    assert.equal(environmentOf(plan), null, plan.id);
    assert.equal(namesToken(plan), false, plan.id);
    assert.equal(runsAnAgent(plan), false, plan.id);
    assert.match(plan.text, /main\.mjs chooseAgentKey\n/, plan.id);
    assert.match(plan.text, /\n  artifacts:\n    reports:\n      dotenv: agent-m-plan\.env(\n|$)/, plan.id);
    [null, "agent-m-key-KEY_A", "agent-m-key-KEY_B"].forEach((wanted, at) => {
      const agent = byId[`${route}-agent-${at}`];
      assert.equal(environmentOf(agent), wanted, agent.id);
      if (wanted) assert.ok(agent.text.includes(`\n  environment:\n    name: ${wanted}\n    action: verify\n`), agent.id);
      assert.equal(namesToken(agent), false, agent.id);
      assert.ok(agent.text.includes(`\n  needs:\n    - job: ${route}-plan\n  variables:\n`), agent.id);
      assert.ok(agent.text.includes(`AGENT_M_KEY: "${at}"\n`), agent.id);
      assert.equal(runsAnAgent(agent), true, `${agent.id} is where the agent runs`);
      const [first] = agent.text.slice(agent.text.indexOf("\n  script:\n")).split("\n    - ").slice(1);
      assert.equal(first.split("\n")[0], `if [ "$AGENT_M_AGENT" != "${at}" ]; then echo "The plan chose the agent's job $AGENT_M_AGENT, not this one."; exit 0; fi`, agent.id);
    });
  }
  for (const job of jobs) for (const key of SECRETS.keys) {
    for (const line of codeLines(job.text).filter((each) => each.includes(key))) {
      assert.ok(/^\s+AGENT_M_KEY_NAMES: "KEY_A KEY_B"$/.test(line) || line.trim() === `name: agent-m-key-${key}`, `${job.id}: ${line}`);
    }
  }
  const agentA = byId["agent-m-hosted-agent-1"];
  for (const [planted, found] of [["agent-m-key-KEY_A", "agent-m-write"], ["agent-m-key-KEY_A", "agent-m-key-KEY_B"]]) {
    assert.notEqual(environmentOf({ text: agentA.text.replace(`name: ${planted}`, `name: ${found}`) }), "agent-m-key-KEY_A", `counter-proof: ${found}`);
  }
  assert.equal(namesToken({ text: agentA.text.replace("  variables:\n", '  variables:\n    AGENT_M_TOKEN_NAME: "PERSON_TOKEN"\n') }), true, "counter-proof: the token named");
});

// TST-0125102 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the same file; and — the counter-proof — the job that writes with a rule that runs onDispatch
// input: each route's job that writes: its environment, its tags, its rules, what it needs, its script; and the agent's jobs' artifacts
// expect: it is of agent-m-write with action verify and has no tag whatever the route; it reads the token by the name AGENT_M_TOKEN_NAME holds, PERSON_TOKEN; it runs no agent — no opencode, no onRecordsChanged, no onDispatch — and its rules start writeResult on a push to the default branch and on a start from the page or the API, each `when: always`, then onPullRequestClosed, onCheckCompleted and onSchedule; it needs each of the route's three agent's jobs, optionally; it clones the instance without a token and pushes through a credential helper of the product's checkout alone; after its entry it deletes, with the token, the artifacts of each of its route's agent's jobs that has one, and then ends with the entry's status; each agent's job keeps its result as an artifact that no one may download, kept one hour, also when the job failed; the counter-proof is found running an agent
test("jobWorkflowFiles — on GitLab the job that writes is of agent-m-write, reads the token, runs no agent, and deletes the result", () => {
  for (const route of ["agent-m-hosted", "agent-m-runner-gpu"]) {
    const jobs = generated();
    const write = jobs.find((job) => job.id === route);
    assert.equal(environmentOf(write), "agent-m-write", route);
    assert.ok(write.text.includes("\n  environment:\n    name: agent-m-write\n    action: verify\n"), route);
    assert.ok(!/\n  tags:/.test(write.text), `${route}: the job that writes runs on the server's runners`);
    assert.ok(write.text.includes('AGENT_M_TOKEN_NAME: "PERSON_TOKEN"\n') && write.text.includes('export AGENT_M_TOKEN="$(printenv "$AGENT_M_TOKEN_NAME")"'), route);
    assert.equal(runsAnAgent(write), false, route);
    assert.deepEqual(entriesOf(write), ["writeResult", "onPullRequestClosed", "onCheckCompleted", "onSchedule", "writeResult"], route);
    assert.equal((write.text.match(/\n      when: always\n      variables:\n        AGENT_M_ENTRY: writeResult\n/g) ?? []).length, 2, route);
    assert.ok(write.text.includes(`\n  needs:\n${[0, 1, 2].map((at) => `    - job: ${route}-agent-${at}\n      optional: true\n`).join("")}  variables:\n`), route);
    assert.ok(write.text.includes('git clone "https://github.com/$AGENT_M_INSTANCE.git" ../instance\n'), route);
    assert.ok(write.text.includes("    - git remote set-url origin \"$CI_PROJECT_URL.git\"\n    - git config credential.helper '!f() { echo username=agent-m; echo \"password=$AGENT_M_TOKEN\"; }; f'\n"), route);
    const script = write.text.slice(write.text.indexOf("\n  script:\n"));
    const entryAt = script.indexOf('main.mjs "$AGENT_M_ENTRY" || AGENT_M_STATUS=$?'), deleteAt = script.indexOf('method: "DELETE"');
    assert.ok(entryAt > 0 && deleteAt > entryAt, `${route}: the result is deleted after the entry`);
    assert.ok(script.includes(`/^${route}-agent-[0-9]+$/.test(each.name) && each.artifacts_file`), route);
    assert.ok(script.includes('"/jobs/" + job.id + "/artifacts"') && script.includes('Authorization: "Bearer " + process.env.AGENT_M_TOKEN'), route);
    assert.ok(script.trimEnd().endsWith('- exit "$AGENT_M_STATUS"'), route);
    for (const agent of jobs.filter((job) => job.id.startsWith(`${route}-agent-`))) {
      assert.ok(agent.text.endsWith("\n  artifacts:\n    when: always\n    access: none\n    expire_in: 1 hour\n    paths:\n      - agent-m-result/") || agent.text.endsWith("\n  artifacts:\n    when: always\n    access: none\n    expire_in: 1 hour\n    paths:\n      - agent-m-result/\n"), agent.id);
    }
    assert.equal(runsAnAgent({ text: write.text.replace("AGENT_M_ENTRY: onSchedule", "AGENT_M_ENTRY: onDispatch") }), true, "counter-proof");
  }
});

// TST-0125103 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: the same file, which the product's .gitlab-ci.yml includes beside its own default: and variables:
// input: each job's text
// expect: every job takes neither the product's default: — whose before_script would run beside the token or the key — nor its global variables:
test("jobWorkflowFiles — on GitLab no job takes the product's default: or its global variables:", () => {
  const jobs = generated();
  assert.equal(jobs.length, 10);
  for (const job of jobs) assert.ok(job.text.includes("\n  inherit:\n    default: false\n    variables: false\n"), job.id);
});

// TST-0125104 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the token variable PERSON_TOKEN and the keys KEY_A and KEY_B; and no key
// input: gitlabVariableScopes
// expect: exactly PERSON_TOKEN with agent-m-write, KEY_A with agent-m-key-KEY_A and agent-m-write, KEY_B with agent-m-key-KEY_B and agent-m-write, in that order — the environments the generated file's jobs are of; without a key, the token alone
test("gitlabVariableScopes — the scopes the person gives each variable are the environments of the jobs that read it", () => {
  assert.deepEqual(gitlabVariableScopes(SECRETS), [
    { name: "PERSON_TOKEN", scopes: ["agent-m-write"] },
    { name: "KEY_A", scopes: ["agent-m-key-KEY_A", "agent-m-write"] },
    { name: "KEY_B", scopes: ["agent-m-key-KEY_B", "agent-m-write"] },
  ]);
  const environments = new Set(generated([]).map(environmentOf).filter(Boolean));
  assert.deepEqual([...environments].sort(), ["agent-m-key-KEY_A", "agent-m-key-KEY_B", "agent-m-write"]);
  assert.deepEqual(gitlabVariableScopes({ token: "PERSON_TOKEN", keys: [] }), [{ name: "PERSON_TOKEN", scopes: ["agent-m-write"] }]);
});
