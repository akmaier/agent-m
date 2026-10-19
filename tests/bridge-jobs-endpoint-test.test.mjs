// MOD-bridge-jobs — the local Bridge handler of UC-003 endpoint-test (ITM-262).
// Run: node --test tests/bridge-jobs-endpoint-test.test.mjs
//
// Module: MOD-bridge-jobs
// Guards: UC-003; UC-040; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER; THE LOCAL BRIDGE REQUIRES A TOKEN; A CREDENTIAL IS NEVER PLACED IN A URL; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// Level: unit
//
// Every endpoint answer below is constructed. The injected endpoint test is the only endpoint boundary, so these cases
// make no network request, persist no configuration and expose no credential outside its supplied request configuration.

import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { jobHandlers } from "../src/bridge-jobs/index.mjs";

const CONFIG = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434/v1", model: "small", key: "request-only-key" };
const request = (args = CONFIG) => ({ params: { kind: "endpoint-test" }, body: { args } });
const handlerFor = (testEndpoint) => jobHandlers({ testEndpoint })["POST /v1/probes/endpoint-test"];

// TST-262-001
// TST-472089 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
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
// TST-472090 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// given: a valid endpoint configuration and a provider's refused-key diagnosis
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis, including its message, returns structurally unchanged
test("TST-262-002: endpoint-test returns a refused-key diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "key refused", message: "Provider says key is invalid.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-003
// TST-472091 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// given: a valid endpoint configuration and a provider's unknown-model diagnosis
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis, including its message, returns structurally unchanged
test("TST-262-003: endpoint-test returns an unknown-model diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "model unknown", message: "Model small is not installed.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-004
// TST-472092 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// given: a valid endpoint configuration and a local model server that cannot be reached
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the Node diagnosis returns unchanged and does not claim a browser retry route
test("TST-262-004: endpoint-test returns an unavailable local-server diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "not reachable", message: "connect ECONNREFUSED", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-005
// TST-472093 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// given: a valid endpoint configuration and another provider failure
// input: the endpoint-test probe handler calls the Node-side endpoint test
// expect: the provider diagnosis and message return unchanged
test("TST-262-005: endpoint-test returns another provider diagnosis unchanged", async () => {
  const answer = { works: false, diagnosis: { reason: "endpoint error", message: "Provider maintenance window.", routes: [] } };
  assert.deepEqual(await handlerFor(async () => answer)(request()), { answer });
});

// TST-262-006
// TST-472094 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
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
// TST-472095 · level: unit · module: MOD-bridge-jobs
// guards: UC-003; AN UNSUPPORTED ENDPOINT SAYS SO; NO SECRET IN THE REPOSITORY; CONFIGURATION LIVES IN THE BROWSER
// given: a valid endpoint configuration and an unexpected endpoint-test handler failure
// input: the probe handler calls the Node-side endpoint test
// expect: upstream-failed names the original message and the endpoint test is not retried
test("TST-262-007: endpoint-test names an unexpected handler failure without retrying", async () => {
  let calls = 0;
  await assert.rejects(() => handlerFor(async () => { calls += 1; throw new Error("local test adapter failed"); })(request()),
    (error) => error?.code === "upstream-failed" && error.message === "local test adapter failed");
  assert.equal(calls, 1);
});

// TST-960101 · level: unit · module: MOD-bridge-jobs
// guards: UC-040; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a valid endpoint configuration and a Node-side listing of served models that answers, and one that answers a diagnosis
// input: the endpoint-models probe handler receives body.args
// expect: it maps the exact fields to EndpointConfig, calls the listing once, and returns { answer: { models } } or { answer: { diagnosis } } unchanged
test("TST-960101: endpoint-models returns the listing, or its diagnosis, unchanged", async () => {
  const seen = [], models = { models: ["small", "large"] }, diagnosis = { diagnosis: { reason: "key refused", message: "Provider says key is invalid.", routes: [] } };
  const handler = (listModels) => jobHandlers({ listModels })["POST /v1/probes/endpoint-models"];
  assert.deepEqual(await handler(async (config) => { seen.push(config); return models; })({ params: { kind: "endpoint-models" }, body: { args: CONFIG } }), { answer: models });
  assert.deepEqual(seen, [CONFIG]);
  assert.deepEqual(await handler(async () => diagnosis)({ params: { kind: "endpoint-models" }, body: { args: CONFIG } }), { answer: diagnosis });
});

// TST-960102 · level: unit · module: MOD-bridge-jobs
// guards: UC-040; AN UNSUPPORTED ENDPOINT SAYS SO
// given: a body.args that is no EndpointConfig, and a valid one whose Node-side listing throws
// input: the endpoint-models probe handler
// expect: invalid-request before any listing is called; upstream-failed naming the thrown message for the throw
test("TST-960102: endpoint-models refuses a malformed configuration and names a handler failure", async () => {
  let calls = 0;
  const handler = jobHandlers({ listModels: async () => { calls += 1; throw new Error("models adapter failed"); } })["POST /v1/probes/endpoint-models"];
  await assert.rejects(() => handler({ params: { kind: "endpoint-models" }, body: { args: { ...CONFIG, key: 7 } } }), (error) => error?.code === "invalid-request");
  assert.equal(calls, 0);
  await assert.rejects(() => handler({ params: { kind: "endpoint-models" }, body: { args: CONFIG } }),
    (error) => error?.code === "upstream-failed" && error.message === "models adapter failed");
  assert.equal(calls, 1);
});

// TST-960103 · level: unit · module: MOD-bridge-jobs
// guards: UC-040; A CREDENTIAL IS NEVER PLACED IN A URL
// given: an OpenAI-compatible endpoint on loopback that serves the models "served-a" and "served-b" at /v1/models and answers 401 without its key, and a closed loopback port
// input: the endpoint-models probe handler with its own Node-side listing, for the endpoint with its key, without it, and for the closed port
// expect: { answer: { models: ["served-a", "served-b"] } }; { answer: { diagnosis } } with the reason "key refused"; { answer: { diagnosis } } with the reason "not reachable"; the key travelled in the Authorization header only
test("TST-960103: endpoint-models lists a loopback endpoint's served models, and names a refusal or a closed port", async (t) => {
  const seen = [];
  const server = createServer((request, response) => {
    seen.push({ url: request.url, authorization: request.headers.authorization });
    if (request.url !== "/v1/models" || request.headers.authorization !== "Bearer request-only-key") { response.writeHead(401, { "content-type": "application/json" }); response.end(JSON.stringify({ error: { message: "Invalid API key." } })); return; }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ data: [{ id: "served-a" }, { id: "served-b" }] }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const port = server.address().port, handler = jobHandlers()["POST /v1/probes/endpoint-models"];
  const ask = (args) => handler({ params: { kind: "endpoint-models" }, body: { args } });
  assert.deepEqual(await ask({ ...CONFIG, baseUrl: `http://127.0.0.1:${port}/v1` }), { answer: { models: ["served-a", "served-b"] } });
  assert.equal((await ask({ ...CONFIG, baseUrl: `http://127.0.0.1:${port}/v1`, key: null })).answer.diagnosis.reason, "key refused");
  assert.equal((await ask({ ...CONFIG, baseUrl: "http://127.0.0.1:9/v1" })).answer.diagnosis.reason, "not reachable");
  assert.ok(seen.every((each) => !each.url.includes("request-only-key")), "the key is not in any address");
});

// TST-960104 · level: unit · module: MOD-bridge-jobs
// guards: UC-040; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// given: a folder holding an executable sinfo that prints the lines "debug|up" and "gpu|down" and puts the arguments it got into a file, put first on the path
// input: the partitions probe handler with body.args {}
// expect: { answer: { partitions: [{ name: "debug", state: "up" }, { name: "gpu", state: "down" }] } }; sinfo was called once with --noheader and --format=%P|%a
test("TST-960104: partitions lists the scheduler's partitions with name and state", async (t) => {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-sinfo-")), oldPath = process.env.PATH;
  await writeFile(join(folder, "sinfo"), `#!/bin/sh\necho "$@" >> "${join(folder, "arguments")}"\nprintf 'debug|up\\ngpu|down\\n'\n`, { mode: 0o755 });
  process.env.PATH = `${folder}:${oldPath}`;
  t.after(async () => { process.env.PATH = oldPath; await rm(folder, { recursive: true, force: true }); });
  const result = await jobHandlers()["POST /v1/probes/partitions"]({ params: { kind: "partitions" }, body: { args: {} } });
  assert.deepEqual(result, { answer: { partitions: [{ name: "debug", state: "up" }, { name: "gpu", state: "down" }] } });
  assert.equal((await readFile(join(folder, "arguments"), "utf8")).trim(), "--noheader --format=%P|%a");
});

// TST-960105 · level: unit · module: MOD-bridge-jobs
// guards: UC-040; A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
// given: a computer without sinfo on the path, and one whose sinfo fails with the message "slurm controller unreachable"
// input: the partitions probe handler
// expect: upstream-failed in both, the message naming the command sinfo and, for the second, the command's own message
test("TST-960105: partitions names a missing or failing scheduler command as upstream-failed", async (t) => {
  const none = await mkdtemp(join(tmpdir(), "agent-m-nosinfo-")), failing = await mkdtemp(join(tmpdir(), "agent-m-failsinfo-")), oldPath = process.env.PATH;
  await writeFile(join(failing, "sinfo"), "#!/bin/sh\necho 'slurm controller unreachable' >&2\nexit 1\n", { mode: 0o755 });
  t.after(async () => { process.env.PATH = oldPath; await rm(none, { recursive: true, force: true }); await rm(failing, { recursive: true, force: true }); });
  const handler = jobHandlers()["POST /v1/probes/partitions"], ask = () => handler({ params: { kind: "partitions" }, body: { args: {} } });
  process.env.PATH = none;
  await assert.rejects(ask, (error) => error?.code === "upstream-failed" && /sinfo/.test(error.message));
  process.env.PATH = failing;
  await assert.rejects(ask, (error) => error?.code === "upstream-failed" && /sinfo/.test(error.message) && /slurm controller unreachable/.test(error.message));
});
