// MOD-bridge-jobs — the local Bridge handler of UC-003 endpoint-test (ITM-262).
// Run: node --test tests/bridge-jobs-endpoint-test.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// Level: unit
//
// Every endpoint answer below is constructed. The injected endpoint test is the only endpoint boundary, so these cases
// make no network request, persist no configuration and expose no credential outside its supplied request configuration.

import assert from "node:assert/strict";
import test from "node:test";
import { jobHandlers } from "../src/bridge-jobs/index.mjs";

const CONFIG = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434/v1", model: "small", key: "request-only-key" };
const request = (args = CONFIG) => ({ params: { kind: "endpoint-test" }, body: { args } });
const handlerFor = (testEndpoint) => jobHandlers({ testEndpoint })["POST /v1/probes/endpoint-test"];

// TST-262-001
// given: a valid local endpoint configuration and a Node-side endpoint test that succeeds
// input: the endpoint-test probe handler receives body.args
// expect: it maps those exact fields to EndpointConfig, invokes the Node test once, and returns its success unchanged
test("TST-262-001: endpoint-test maps body.args once and returns a success unchanged", async () => {
  const seen = [], answer = { works: true, model: "small" };
  const result = await handlerFor(async (config) => { seen.push(config); return answer; })(request());
  assert.deepEqual(seen, [CONFIG]);
  assert.deepEqual(result, { answer });
});

// TST-262-002
// given: a valid endpoint configuration and a provider's refused-key diagnosis
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis, including its message, returns structurally unchanged
test("TST-262-002: endpoint-test returns a refused-key diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "key refused", message: "Provider says key is invalid.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-003
// given: a valid endpoint configuration and a provider's unknown-model diagnosis
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis, including its message, returns structurally unchanged
test("TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "model unknown", message: "Model small is not installed.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-004
// given: a valid endpoint configuration and a local model server that cannot be reached
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the Node diagnosis returns unchanged and does not claim a browser retry route
test("TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "not reachable", message: "connect ECONNREFUSED", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-005
// given: a valid endpoint configuration and another provider failure
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis and message return unchanged
test("TST-262-005: endpoint-test returns another provider diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "endpoint error", message: "Provider maintenance window.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-006
// given: an endpoint-test request whose body.args is not an EndpointConfig
// input: the probe handler receives the malformed request directly
// expect: invalid-request is named and the Node-side endpoint test is never called
test("TST-262-006: endpoint-test rejects invalid body.args before any endpoint call", async () => {
  let calls = 0;
  await assert.rejects(() => handlerFor(async () => { calls += 1; return { works: true, model: "wrong" }; })(request({ ...CONFIG, key: 7 })),
    (error) => error?.code === "invalid-request" && /invalid/i.test(error.message));
  assert.equal(calls, 0);
});

// TST-262-007
// given: a valid endpoint configuration and an unexpected endpoint-test handler failure
// input: the probe handler calls the Node-side endpoint test
// expect: upstream-failed names the original message and the endpoint test is not retried
test("TST-262-007: endpoint-test names an unexpected handler failure without retrying", async () => {
  let calls = 0;
  await assert.rejects(() => handlerFor(async () => { calls += 1; throw new Error("local test adapter failed"); })(request()),
    (error) => error?.code === "upstream-failed" && error.message === "local test adapter failed");
  assert.equal(calls, 1);
});
