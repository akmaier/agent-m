// Independent release coverage for the authenticated Bridge tunnel-state route (ITM-285).
// Run: node --test tests/release-itm-285-bridge-tunnels.test.mjs
//
// Module: MOD-bridge-http
// Level: release
//
// Every case reaches the public GET /v1/tunnels boundary on a controlled loopback Bridge with an
// explicitly supplied handler. It creates neither a tunnel nor an SSH, HTTPS, browser, or native fixture.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bridgeApi, pairAnew, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://release-owner.github.io";
const STATES = [
  { name: "desk", kind: "reverse", state: "open", reason: null },
  { name: "lab", kind: "forward", state: "failed", reason: "host-unreachable" },
];

async function running(t, { paused = () => false, tunnels = {}, jobs = {} } = {}) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-release-tunnels-"));
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused }, { jobs, mail: {}, tunnels });
  t.after(async () => { await bridge.close(); await rm(folder, { recursive: true, force: true }); });
  return { ...bridge, folder };
}

async function request(bridge, { method = "GET", origin = ORIGIN, token = bridge.token, headers = {} } = {}) {
  return fetch(`${bridge.address}/v1/tunnels`, { method, headers: { Origin: origin, [bridgeApi.tokenHeader]: token, ...headers } });
}

// TST-285901
// level: release
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a paired loopback Bridge with a supplied public tunnels handler returning constructed states
// input: the paired Pages origin sends GET /v1/tunnels through the actual server
// expect: bridgeApi names the GET route and the server returns the handler's exact states after one empty request shape
test("TST-285901: the public tunnel-state route returns only supplied exact states", async (t) => {
  const seen = [];
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async (value) => { seen.push(value); return { tunnels: STATES }; } } });
  const route = bridgeApi.routes.find((candidate) => candidate.method === "GET" && candidate.path === "/v1/tunnels");
  assert.ok(route, "failure node: protocol route lookup declares the supplied-handler boundary");
  const response = await request(bridge);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { tunnels: STATES });
  assert.deepEqual(seen, [{ params: {}, body: {} }]);
});

// TST-285902
// level: release
// module: MOD-bridge-http
// guards: UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: paired Bridges with an explicit empty handler, no handler, a named handler failure, and an ordinary handler failure
// input: each receives the authenticated public GET /v1/tunnels request
// expect: empty is successful, missing remains named 404, and failures retain invalid-request 422 or upstream-failed 502
test("TST-285902: supplied tunnel handler absence and failures keep their public meanings", async (t) => {
  const empty = await running(t, { tunnels: { "GET /v1/tunnels": async () => ({ tunnels: [] }) } });
  assert.deepEqual(await (await request(empty)).json(), { tunnels: [] });

  const absent = await running(t);
  const absentResponse = await request(absent);
  assert.equal(absentResponse.status, 404, "failure node: the route refuses an absent supplied handler");
  assert.deepEqual(await absentResponse.json(), { error: "not-found", message: "Bridge handler not found." });

  const named = await running(t, { tunnels: { "GET /v1/tunnels": async () => { const failure = new Error("plan refused"); failure.code = "invalid-request"; throw failure; } } });
  const namedResponse = await request(named);
  assert.equal(namedResponse.status, 422);
  assert.deepEqual(await namedResponse.json(), { error: "invalid-request", message: "plan refused" });

  const ordinary = await running(t, { tunnels: { "GET /v1/tunnels": async () => { throw new Error("reader failed"); } } });
  const ordinaryResponse = await request(ordinary);
  assert.equal(ordinaryResponse.status, 502);
  assert.deepEqual(await ordinaryResponse.json(), { error: "upstream-failed", message: "reader failed" });
});

// TST-285903
// level: release
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN; THE BRIDGE IS PAIRED ONCE
// given: a paired loopback Bridge with one supplied tunnels handler and a current token that can be rotated
// input: allowed preflight, a foreign origin, no token, an old rotated token, and the rotated current token reach the route
// expect: preflight is allowed, all refused requests stop before the handler, and only the rotated current token reaches it once
test("TST-285903: tunnel state preserves origin, preflight, and current-token boundaries", async (t) => {
  let calls = 0;
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async () => { calls += 1; return { tunnels: [] }; } } });
  const preflight = await fetch(`${bridge.address}/v1/tunnels`, { method: "OPTIONS", headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": bridgeApi.tokenHeader, "Access-Control-Request-Private-Network": "true" } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(preflight.headers.get("access-control-allow-private-network"), "true");
  assert.equal((await request(bridge, { origin: "https://foreign.example" })).status, 403, "failure node: origin refusal precedes tunnel handler dispatch");
  assert.equal((await request(bridge, { token: "" })).status, 401);
  const old = bridge.token;
  const current = await pairAnew(bridge.folder, "release-tunnel-current-token");
  assert.equal((await request(bridge, { token: old })).status, 401);
  assert.equal((await request(bridge, { token: current })).status, 200);
  assert.equal(calls, 1);
});

// TST-285904
// level: release
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a paused paired Bridge with a supplied tunnels handler and an existing work-starting endpoint-test handler
// input: authenticated GET /v1/tunnels and POST /v1/probes/endpoint-test are sent to the actual server
// expect: read-only state is available while the existing work-starting request retains its named paused refusal
test("TST-285904: pause leaves tunnel state readable and retains work refusal", async (t) => {
  let tunnelCalls = 0;
  const bridge = await running(t, { paused: () => true, tunnels: { "GET /v1/tunnels": async () => { tunnelCalls += 1; return { tunnels: STATES }; } } });
  const state = await request(bridge);
  assert.equal(state.status, 200, "failure node: pause applies only to work-starting POST requests");
  assert.deepEqual(await state.json(), { tunnels: STATES });
  const probe = await fetch(`${bridge.address}/v1/probes/endpoint-test`, { method: "POST", headers: { Origin: ORIGIN, [bridgeApi.tokenHeader]: bridge.token, "content-type": "application/json" }, body: JSON.stringify({ args: { name: "release", kind: "openai-compatible", baseUrl: "http://127.0.0.1", model: "fixture", key: null } }) });
  assert.equal(probe.status, 503);
  assert.deepEqual(await probe.json(), { error: "paused", message: "Bridge is paused." });
  assert.equal(tunnelCalls, 1);
});

// TST-285905
// level: release
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN; NO SECRET IN THE REPOSITORY
// given: a paired Bridge with captured request logging and a supplied empty tunnel-state handler
// input: the authenticated GET carries a constructed extra credential-shaped header
// expect: its log records method, route and status but contains neither pairing token nor header value or handler result
test("TST-285905: tunnel-state logging excludes request credentials and handler data", async (t) => {
  const lines = [], previous = console.info;
  console.info = (...values) => lines.push(values.join(" "));
  t.after(() => { console.info = previous; });
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async () => ({ tunnels: [] }) } });
  const secret = "release-tunnel-header-secret";
  const response = await request(bridge, { headers: { "x-release-secret": secret } });
  assert.equal(response.status, 200);
  const log = lines.join("\n");
  assert.match(log, /GET.*\/v1\/tunnels.*200/);
  assert.equal(log.includes(bridge.token), false, "failure node: server log omits the pairing token");
  assert.equal(log.includes(secret), false);
  assert.equal(log.includes(JSON.stringify({ tunnels: [] })), false);
});
