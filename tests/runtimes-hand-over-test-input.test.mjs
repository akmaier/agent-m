// The test job of an endpoint that runs through GitHub Actions takes the input `test` — MOD-runtimes' handOverJob(prepared, route, start, host, head, task, target) and the
// job workflow jobWorkflowFiles generates, as the accepted text of docs/architecture/MOD-runtimes.md states them (Data: "Its start from a page or a hand-over takes the inputs
// `job`, … `secret`, …, and `test`, set for the test job of that endpoint (UC-003, step 4)"; Interfaces, handOverJob: "the inputs `job`, `task` and, for a model endpoint,
// `endpoint` and `secret`, the CI secret its route names, and `test` where `target.test` is set"), for UC-003 step 4.
// Run: node --test tests/runtimes-hand-over-test-input.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-003; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. Readings of this file: a GitHub workflow_dispatch input is a text, so `test` is
// passed as "true"; the test job of an endpoint runs through GitHub Actions only (MOD-settings-pages, endpoints; MOD-prompt-bar, spawnEndpointJob), so the input is declared
// in GitHub's job workflow, and GitLab's is left as it is. The repository server is the fake host of tests/runtimes-hand-over-fixture.mjs. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { CI_HOSTED, ENDPOINT, ENDPOINT_TEXT, START, TASK, fakeHost, preparedOf } from "./runtimes-hand-over-fixture.mjs";

const prepared = preparedOf({ drafter: { name: "drafter-a", context: 200000, route: "endpoint ep1 secret EP1_KEY" } });
const hand = async (target) => {
  const run = fakeHost({});
  await runtimes.handOverJob(prepared, CI_HOSTED, START, run.host, run.head(), TASK, target);
  return run.starts[0].inputs;
};

// TST-2026313101 · level: unit · module: MOD-runtimes
// guards: UC-003
// given: a prepared job whose drafter's route is `endpoint ep1 secret EP1_KEY`, and a model endpoint as the target with `test: true`; the counter-proof the same target without `test`
// input: handOverJob on the CI route, for each
// expect: with `test` the started workflow's inputs are exactly { job, task, endpoint: the endpoint's JSON text, secret: "EP1_KEY", test: "true" }; without it exactly { job, task, endpoint, secret }, no key `test`
test("handOverJob — target.test starts the workflow with the input test, and a target without it passes none", async () => {
  assert.deepEqual(await hand({ endpoint: ENDPOINT, bridge: null, test: true }),
    { job: START.id, task: TASK, endpoint: ENDPOINT_TEXT, secret: "EP1_KEY", test: "true" });
  const without = await hand({ endpoint: ENDPOINT, bridge: null });
  assert.deepEqual(without, { job: START.id, task: TASK, endpoint: ENDPOINT_TEXT, secret: "EP1_KEY" });
  assert.equal(Object.hasOwn(without, "test"), false);
});

// TST-2026313102 · level: unit · module: MOD-runtimes
// guards: UC-003
// given: jobWorkflowFiles for GitHub with the token secret AGENT_M_TOKEN and the key secret EP1_KEY; known positive: the input `secret` of the same file is found by the same pattern
// input: the workflow_dispatch inputs of the generated file
// expect: the file declares an input `test` that is not required, with a description, beside `secret`
test("jobWorkflowFiles — GitHub's job workflow declares the input test, not required", () => {
  const [github] = runtimes.jobWorkflowFiles("github", { repository: "alice/agent-m", commit: "0123456789abcdef0123456789abcdef01234567" }, { token: "AGENT_M_TOKEN", keys: ["EP1_KEY"] }, []);
  const declared = (name) => new RegExp(`\\n {6}${name}:\\n {8}description: "[^\\n]+"\\n {8}required: false\\n`).test(github.text);
  assert.ok(declared("secret"), "known positive: the input secret is found");
  assert.ok(declared("test"), "the input test is declared");
});
