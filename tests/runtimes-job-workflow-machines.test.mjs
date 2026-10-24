// The two machines of Agent M's job workflow on GitHub — MOD-runtimes' jobWorkflowFiles and its template workflow/github.yml, as
// docs/architecture/MOD-runtimes.md states them (Data: Agent M's job workflow in a product): for each route a plan that reads no secret, an agent's job for each
// key the file reads — which reads that key's secret and no other, and never the person's token — and one for none, and a job that writes, which reads the token,
// runs no agent and no entry that runs one, and deletes the result once it is written.
// Run: node --test tests/runtimes-job-workflow-machines.test.mjs
//
// Module: MOD-runtimes
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// Level: unit
//
// No YAML parser stands in this repository: the file is read as the jobs that begin at `  <id>:` under `jobs:`. GitHub sends a job's runner the secrets the job
// names by their literal name, and the whole secrets context where a job indexes it with a name computed at run time (`secrets[...]`, `toJSON(secrets)`) — so a
// job "reads" each `secrets.<NAME>` its text holds, and any dynamic index reads them all. Each test states its expected values in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { jobWorkflowFiles } from "../src/runtimes/index.mjs";

const INSTANCE = { repository: "alice/agent-m", commit: "0123456789abcdef0123456789abcdef01234567" };
const SECRETS = { token: "PERSON_TOKEN", keys: ["KEY_A", "KEY_B"] };

const jobsOf = (text) => text.slice(text.indexOf("\njobs:\n") + 7).split(/\n(?=  [A-Za-z0-9_-]+:\n)/)
  .map((block) => ({ id: /^\s*([A-Za-z0-9_-]+):/.exec(block)[1], text: block }));
const codeLines = (text) => text.split("\n").filter((line) => !/^\s*#/.test(line));
// The secrets a job's text reads: each literal name, and `*` for a read of the whole context or by a computed name.
function secretsRead(job) {
  const code = codeLines(job.text).join("\n");
  const named = [...code.matchAll(/secrets\.([A-Za-z_][A-Za-z0-9_]*)/g)].map((match) => match[1]);
  return [...new Set([...named, ...(/secrets\s*\[|toJSON\(\s*secrets\s*\)/.test(code) ? ["*"] : [])])].sort();
}
// What a job's steps run that an agent or a model takes part in: the agent installed, or an entry that runs a job's participant.
const runsAnAgent = (job) => /opencode|main\.mjs (onRecordsChanged|onDispatch)\b/.test(codeLines(job.text).join("\n"));
const generated = (runners = ["gpu"]) => jobsOf(jobWorkflowFiles("github", INSTANCE, SECRETS, runners)[0].text);

// TST-0124101 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
// given: the GitHub job workflow for the token secret PERSON_TOKEN, the keys KEY_A and KEY_B, and the runner gpu; and — the counter-proofs — the same file with the agent's job of KEY_A also reading PERSON_TOKEN, with it also reading KEY_B, and with it reading `secrets[inputs.secret]`
// input: the secrets each job reads
// expect: for each route the agent's job 0 reads none, 1 reads exactly KEY_A, 2 exactly KEY_B, each runs only when the plan's output `agent` is its number, and the plan reads none; in each counter-proof the check finds the agent's job reading more than its one key
test("jobWorkflowFiles — each agent's job reads the key of its number and no other secret, and the plan reads none", () => {
  const jobs = generated();
  for (const route of ["hosted", "runner-gpu"]) {
    const byId = Object.fromEntries(jobs.map((job) => [job.id, job]));
    assert.deepEqual(secretsRead(byId[`${route}-plan`]), [], `${route}-plan`);
    [[], ["KEY_A"], ["KEY_B"]].forEach((wanted, at) => {
      const agent = byId[`${route}-agent-${at}`];
      assert.deepEqual(secretsRead(agent), wanted, agent.id);
      assert.ok(agent.text.includes(`\n    if: needs.${route}-plan.outputs.agent == '${at}'\n`), agent.id);
      assert.ok(agent.text.includes(`AGENT_M_KEY: "${at}"\n`), agent.id);
      assert.ok(runsAnAgent(agent), `${agent.id} is where the agent runs`);
    });
  }
  const [agentA] = generated().filter((job) => job.id === "hosted-agent-1");
  for (const planted of ["      AGENT_M_TOKEN: ${{ secrets.PERSON_TOKEN }}\n", "      KEY_B: ${{ secrets.KEY_B }}\n", "      AGENT_M_VALUE: ${{ secrets[inputs.secret] }}\n"]) {
    const changed = { ...agentA, text: agentA.text.replace("    steps:\n", `${planted}    steps:\n`) };
    assert.notDeepEqual(secretsRead(changed), ["KEY_A"], `counter-proof: ${planted.trim()}`);
  }
});

// TST-0124102 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the same file; and — the counter-proof — the job that writes with a step that runs onDispatch
// input: each route's job that writes: its secrets, the steps it runs, its runner, what it needs; and the agent's jobs' result step
// expect: it reads PERSON_TOKEN and both keys, checks the product and the instance out with PERSON_TOKEN, runs on ubuntu-latest whatever the route, runs no agent — no opencode, no onRecordsChanged, no onDispatch — and writeResult on a dispatch or a push; it needs the plan and the route's three agent's jobs and runs unless the run is cancelled; its last step, always run, deletes each agent's job's artifact with the token; each agent's job uploads its result for one day; the counter-proof is found running an agent
test("jobWorkflowFiles — the job that writes reads the token, runs no agent, and deletes the result", () => {
  for (const route of ["hosted", "runner-gpu"]) {
    const write = generated().find((job) => job.id === route);
    assert.deepEqual(secretsRead(write), ["KEY_A", "KEY_B", "PERSON_TOKEN"], route);
    assert.equal(codeLines(write.text).filter((line) => line.trim() === "token: ${{ secrets.PERSON_TOKEN }}").length, 2, route);
    assert.match(write.text, /\n    runs-on: ubuntu-latest\n/, route);
    assert.equal(runsAnAgent(write), false, route);
    assert.match(write.text, /main\.mjs writeResult\n/, route);
    assert.ok(write.text.includes(`\n    needs: [${route}-plan, ${route}-agent-0, ${route}-agent-1, ${route}-agent-2]\n    if: \${{ !cancelled() }}\n`), route);
    const last = write.text.slice(write.text.lastIndexOf("\n      - "));
    assert.match(last, /^\n      - if: always\(\)\n/, route);
    assert.match(last, /-X DELETE -H "Authorization: Bearer \$AGENT_M_TOKEN"/, route);
    assert.match(last, /\/actions\/artifacts\/\$id"/, route);
    for (const at of [0, 1, 2]) assert.ok(last.includes(`\${{ needs.${route}-agent-${at}.outputs.artifact }}`), `${route}: agent ${at}'s artifact`);
    for (const agent of generated().filter((job) => job.id.startsWith(`${route}-agent-`))) {
      assert.match(agent.text, /uses: actions\/upload-artifact@v4\n(?:.*\n)*?          retention-days: 1\n/, agent.id);
      assert.match(agent.text, /\n      artifact: \$\{\{ steps\.result\.outputs\.artifact-id \}\}\n/, agent.id);
    }
    assert.equal(runsAnAgent({ text: `${write.text}\n      - run: node src/workflow-entries/main.mjs onDispatch` }), true, "counter-proof");
  }
});
