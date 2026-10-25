// A hand-over to GitHub Actions passes the CI secret its endpoint's route names (ITM-1188) — MOD-runtimes' handOverJob(prepared, route, start, host, head, task, target) and the
// job workflow jobWorkflowFiles generates, as the accepted text of docs/architecture/MOD-runtimes.md states them (Interfaces: handOverJob, jobWorkflowFiles; Data: Agent M's job
// workflow in a product), for UC-049 4a: the started workflow gets the input `secret`, the NAME of the CI secret that the route of the participant `prepared` was prepared for names
// (`endpoint <name> secret <NAME>`), for a model endpoint and for no other target; the generated workflow declares that input and reads each key from one static line for a name
// given when the file is generated, never from a secret chosen by an input at dispatch.
// Run: node --test tests/runtimes-hand-over-secret.test.mjs
//
// Module: MOD-runtimes
// Guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; NO SECRET IN THE REPOSITORY; UC-049
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. Readings of this file: the participant `prepared` was prepared for is `prepared.drafter`,
// whose `route` is the register's text (MOD-participant-list, Data), and the name is read from it as `routesFor` reads the suffix (` secret <NAME>` after `endpoint <name>`); a
// target without an endpoint passes no `secret`, since the text says "for a model endpoint, `endpoint` and `secret`". The repository server is the fake host of
// tests/runtimes-hand-over-fixture.mjs. Nothing reaches the network. A name the module does not provide yet is undefined here, so that each test fails by itself. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { CI_HOSTED, ENDPOINT, ENDPOINT_TEXT, START, TASK, fakeHost, preparedOf } from "./runtimes-hand-over-fixture.mjs";

const drafterWith = (route) => preparedOf({ drafter: { name: "drafter-a", context: 200000, route } });
const hand = async (prepared, target) => {
  const run = fakeHost({});
  await runtimes.handOverJob(prepared, CI_HOSTED, START, run.host, run.head(), TASK, target);
  return run.starts[0].inputs;
};

// TST-1188001 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: a prepared job whose drafter's route is `endpoint ep1 secret EP1_KEY`, and a model endpoint as the target
// input: handOverJob on the CI route; the same with the route `endpoint ep1`, which names no secret
// expect: the started workflow's inputs are exactly { job: the job's id, task, endpoint: the endpoint's JSON text, secret: "EP1_KEY" }; for the route without ` secret <NAME>` exactly { job, task, endpoint } with no key `secret`
test("handOverJob — a model endpoint whose route names a CI secret starts the workflow with that name as the input secret, and one whose route names none starts it with no secret", async () => {
  assert.deepEqual(await hand(drafterWith("endpoint ep1 secret EP1_KEY"), { endpoint: ENDPOINT, bridge: null }),
    { job: START.id, task: TASK, endpoint: ENDPOINT_TEXT, secret: "EP1_KEY" });
  const without = await hand(drafterWith("endpoint ep1"), { endpoint: ENDPOINT, bridge: null });
  assert.deepEqual(without, { job: START.id, task: TASK, endpoint: ENDPOINT_TEXT });
  assert.equal(Object.hasOwn(without, "secret"), false);
});

// TST-1188002 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; NO SECRET IN THE REPOSITORY; UC-049
// given: a drafter whose route is `endpoint ep1 secret EP1_KEY`; an endpoint configuration that also holds the key "sk-PLANTED-KEY-91"; a second prepared job whose drafter is a CI agent with the route `ci hosted secret CLAUDE_KEY`
// input: handOverJob on the CI route with the endpoint configuration; and with no endpoint for the CI agent
// expect: the input `secret` is the name "EP1_KEY" and no input holds the key's value; for the target without an endpoint the inputs are exactly { job, task }
test("handOverJob — the input secret is the secret's name, never its value, and a target without an endpoint passes none", async () => {
  const inputs = await hand(drafterWith("endpoint ep1 secret EP1_KEY"), { endpoint: { ...ENDPOINT, key: "sk-PLANTED-KEY-91" }, bridge: null });
  assert.equal(inputs.secret, "EP1_KEY");
  assert.equal(Object.values(inputs).some((value) => value.includes("sk-PLANTED-KEY-91")), false, "no input holds the key");
  assert.deepEqual(await hand(drafterWith("ci hosted secret CLAUDE_KEY"), { endpoint: null, bridge: null }), { job: START.id, task: TASK });
});

// ---------------------------------------------------------------- the generated workflow

const COMMIT = "0123456789abcdef0123456789abcdef01234567";
const INSTANCE = { repository: "alice/agent-m", commit: COMMIT };
const SECRETS = { token: "AGENT_M_TOKEN", keys: ["CLAUDE_KEY", "EP1_KEY"] };
const generated = (server) => runtimes.jobWorkflowFiles(server, INSTANCE, SECRETS, ["gpu"]);
const codeLines = (text) => text.split("\n").filter((line) => !/^\s*#/.test(line));

// The lines of a GitHub text that read a secret otherwise than by one static name, or that read the input `secret`; and, for GitLab, any line that reads the variable named by the input.
function dynamicReads(text) {
  return codeLines(text).filter((line) => /secrets\[/.test(line) || /inputs\.secret/.test(line.replace(/^\s*secret:.*/, "")) && /\$\{\{/.test(line)
    || /printenv\s+"\$AGENT_M_INPUT_SECRET"/.test(line) || /\$\{\{[^}]*inputs\./.test(line));
}

// TST-1188003 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: jobWorkflowFiles for GitHub and GitLab with the token secret AGENT_M_TOKEN and the key secrets CLAUDE_KEY and EP1_KEY, and the runner gpu
// input: the GitHub file's workflow_dispatch inputs and its lines that hold `secrets`; the GitLab job file's spec header, its input variables, and the include the .gitlab-ci.yml passes
// expect: GitHub declares an input `secret` not required, and for each of its two routes each key has one line `NAME: ${{ secrets.NAME }}` in the job that writes and one in the agent's job of that key — four in all —, with AGENT_M_KEY_NAMES listing both names in each route's plan, its three agent's jobs and its job that writes; GitLab declares `secret` with an empty default, sets AGENT_M_INPUT_SECRET to `$[[ inputs.secret ]]` in each of its ten jobs — the plan, three agent's jobs and the job that writes of each route —, and passes `secret: $[[ inputs.secret ]]` in the include
test("jobWorkflowFiles — both files declare the input secret and keep one static line for each key they read", () => {
  const [github] = generated("github");
  assert.match(github.text, /\n      secret:\n        description: "[^\n]*"\n        required: false\n/);
  for (const key of SECRETS.keys) assert.equal(codeLines(github.text).filter((line) => line.trim() === `${key}: \${{ secrets.${key} }}`).length, 4, key);
  assert.equal(codeLines(github.text).filter((line) => line.includes("AGENT_M_KEY_NAMES: \"CLAUDE_KEY EP1_KEY\"")).length, 10);

  const [job, ci] = generated("gitlab");
  assert.ok(job.text.startsWith('spec:\n  inputs:\n    job:\n      default: ""\n    task:\n      default: ""\n    endpoint:\n      default: ""\n    secret:\n      default: ""\n---\n'));
  assert.equal(codeLines(job.text).filter((line) => line === "    AGENT_M_INPUT_SECRET: $[[ inputs.secret ]]").length, 10, "one in each of the ten jobs");
  assert.ok(ci.text.includes("      secret: $[[ inputs.secret ]]\n"));
});

// TST-1188004 · level: unit · module: MOD-runtimes
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-049
// given: the two generated files above; known positive first — the same files with a line planted that reads a secret by the name the input gives: `secrets[inputs.secret]` in GitHub's, `printenv "$AGENT_M_INPUT_SECRET"` in GitLab's
// input: the lines of each file that read a secret by a name given at dispatch
// expect: the planted lines are found (one in each planted text); the generated files hold none, and no line of either holds `inputs.secret` inside `${{ }}`
test("jobWorkflowFiles — no secret is read by a name given at dispatch", () => {
  const [github] = generated("github"), [job] = generated("gitlab");
  assert.equal(dynamicReads(`${github.text}      AGENT_M_VALUE: \${{ secrets[inputs.secret] }}\n`).length, 1, "known positive, GitHub");
  assert.equal(dynamicReads(`${job.text}    - export AGENT_M_VALUE="$(printenv "$AGENT_M_INPUT_SECRET")"\n`).length, 1, "known positive, GitLab");
  assert.deepEqual(dynamicReads(github.text), []);
  assert.deepEqual(dynamicReads(job.text), []);
});
