// MOD-bridge-http — the paired loopback API for UC-003's endpoint-test (ITM-261).
// Run: node --test tests/bridge-http.test.mjs
//
// Module: MOD-bridge-http
// Guards: UC-003; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN;
//         THE BRIDGE IS PAIRED ONCE; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit

import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bridgeApi, pairAnew, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://akmaier.github.io";
const CONFIG = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434", model: "tiny", key: "key-only-in-body" };
const SUCCESS = { works: true, model: "tiny" };

async function running(t, { paused = () => false, jobs = {} } = {}) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-bridge-http-"));
  const server = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused }, { jobs, mail: {}, tunnels: {} });
  t.after(() => server.close());
  return { ...server, folder };
}

async function request(server, path, { method = "POST", origin = ORIGIN, token = server.token, body } = {}) {
  return fetch(`${server.address}${path}`, {
    method,
    headers: {
      Origin: origin,
      "X-Agent-M-Bridge-Token": token,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

// TST-261001
// given: the accepted Bridge API
// input: inspect its endpoint-test route definition
// expect: the route is POST /v1/probes/endpoint-test and defines the Bridge-owned configuration/result fields
test("TST-261001: bridgeApi defines the typed endpoint-test probe", () => {
  const probe = bridgeApi.routes.find((route) => route.method === "POST" && route.path === "/v1/probes/{kind}");
  assert.ok(probe);
  assert.deepEqual(probe.kinds, ["agent", "endpoint-models", "endpoint-test", "partitions"]);
  assert.deepEqual(probe.endpointTest.args, { name: "string", kind: ["openai-compatible", "anthropic"], baseUrl: "string", model: "string", key: ["string", "null"] });
  assert.deepEqual(probe.endpointTest.answer, { works: [true, false], model: "string", diagnosis: { reason: bridgeApi.endpointDiagnosisReasons, message: "string", routes: ["ci", "bridge"] } });
});

// TST-261002
// given: a requested non-loopback bind address
// input: start the Bridge server
// expect: BindRefused is named and no server starts
test("TST-261002: serveBridge refuses a non-loopback bind", async () => {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-bridge-http-"));
  await assert.rejects(() => serveBridge({ host: "0.0.0.0", port: 0, origin: ORIGIN, dataFolder: folder, paused: () => false }, { jobs: {}, mail: {}, tunnels: {} }), { name: "BindRefused" });
});

// TST-261003
// given: a new Bridge data folder and a running paired Bridge
// input: pairAnew rotates its persisted token
// expect: the old token is refused and the current token is accepted
test("TST-261003: pairAnew persists and rotates the token", async (t) => {
  const bridge = await running(t);
  const old = bridge.token;
  const next = await pairAnew(bridge.folder, "rotated-token");
  assert.equal(next, "rotated-token");
  assert.equal(await readFile(join(bridge.folder, "pairing-token"), "utf8"), "rotated-token");
  assert.equal((await request(bridge, "/v1/pair", { method: "GET", token: old })).status, 401);
  const current = await request(bridge, "/v1/pair", { method: "GET", token: next });
  assert.equal(current.status, 200);
});

// TST-261004
// given: a paired Bridge and an endpoint-test handler
// input: a preflight and a request from the paired instance origin
// expect: both are allowed and the request body reaches the supplied handler once
test("TST-261004: serveBridge allows the paired origin and dispatches endpoint-test", async (t) => {
  const seen = [];
  const bridge = await running(t, { jobs: { "POST /v1/probes/endpoint-test": async ({ body }) => { seen.push(body.args); return { answer: SUCCESS }; } } });
  const preflight = await fetch(`${bridge.address}/v1/probes/endpoint-test`, { method: "OPTIONS", headers: { Origin: ORIGIN, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-agent-m-bridge-token" } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);
  const response = await request(bridge, "/v1/probes/endpoint-test", { body: { args: CONFIG } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: SUCCESS });
  assert.deepEqual(seen, [CONFIG]);
});

// TST-261005
// given: a paired Bridge
// input: an origin other than the paired instance, a missing token, and an invalid endpoint-test body
// expect: each is refused with its named status before any handler invocation
test("TST-261005: serveBridge names origin, token and body refusals", async (t) => {
  let calls = 0;
  const bridge = await running(t, { jobs: { "POST /v1/probes/endpoint-test": async () => { calls += 1; return { answer: SUCCESS }; } } });
  assert.equal((await request(bridge, "/v1/probes/endpoint-test", { origin: "https://other.example", body: { args: CONFIG } })).status, 403);
  assert.equal((await request(bridge, "/v1/probes/endpoint-test", { token: "", body: { args: CONFIG } })).status, 401);
  assert.equal((await request(bridge, "/v1/probes/endpoint-test", { body: { args: { ...CONFIG, key: 7 } } })).status, 422);
  assert.equal(calls, 0);
});

// TST-261006
// given: a paused Bridge and a handler that raises a non-protocol failure
// input: endpoint-test requests
// expect: pause is 503 and the handler failure is the named 502 upstream-failed error
test("TST-261006: serveBridge names pause and handler failures", async (t) => {
  const paused = await running(t, { paused: () => true, jobs: { "POST /v1/probes/endpoint-test": async () => ({ answer: SUCCESS }) } });
  assert.equal((await request(paused, "/v1/probes/endpoint-test", { body: { args: CONFIG } })).status, 503);
  const failed = await running(t, { jobs: { "POST /v1/probes/endpoint-test": async () => { throw new Error("local endpoint offline"); } } });
  const response = await request(failed, "/v1/probes/endpoint-test", { body: { args: CONFIG } });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "upstream-failed", message: "local endpoint offline" });
});
