// MOD-bridge-http — authenticated read-only tunnel-state route (ITM-285).
// Run: node --test tests/bridge-tunnel-state-route.test.mjs
//
// Module: MOD-bridge-http
// Guards: UC-044; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN;
//         THE BRIDGE IS PAIRED ONCE; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// Every case uses the actual controlled loopback server and supplies only constructed tunnel-state handlers.
// It opens no SSH tunnel and does not claim an HTTPS route or a desktop-shell integration.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bridgeApi, pairAnew, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://owner.github.io";
const STATES = [
  { name: "lab", kind: "reverse", state: "open", reason: null },
  { name: "desk", kind: "forward", state: "failed", reason: "host-unreachable" },
];

async function running(t, { paused = () => false, tunnels = {} } = {}) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-tunnel-state-"));
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused }, { jobs: {}, mail: {}, tunnels });
  t.after(async () => { await bridge.close(); await rm(folder, { recursive: true, force: true }); });
  return { ...bridge, folder };
}

async function request(bridge, path = "/v1/tunnels", { method = "GET", origin = ORIGIN, token = bridge.token, headers = {} } = {}) {
  return fetch(`${bridge.address}${path}`, { method, headers: { Origin: origin, [bridgeApi.tokenHeader]: token, ...headers } });
}

// TST-285001
// level: unit
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a paired loopback Bridge has a supplied tunnels route that returns constructed states
// input: the paired Pages origin sends GET /v1/tunnels
// expect: protocol data names the GET route and the exact handler state/reason array is returned once
test("TST-285001: GET tunnels dispatches exact constructed states through the route data", async (t) => {
  const seen = [];
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async (request_) => { seen.push(request_); return { tunnels: STATES }; } } });
  const route = bridgeApi.routes.find((candidate) => candidate.method === "GET" && candidate.path === "/v1/tunnels");
  assert.ok(route, "failure node: bridgeApi declares GET /v1/tunnels without positional route access");
  const response = await request(bridge);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { tunnels: STATES });
  assert.deepEqual(seen, [{ params: {}, body: {} }]);
});

// TST-285002
// level: unit
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: one paired Bridge has an explicit empty tunnels handler and another has no tunnels handler
// input: each receives GET /v1/tunnels with its current pairing token
// expect: the explicit empty result is successful; an absent handler remains the named 404, never an invented empty list
test("TST-285002: an explicit empty state differs from an absent tunnels handler", async (t) => {
  const empty = await running(t, { tunnels: { "GET /v1/tunnels": async () => ({ tunnels: [] }) } });
  const emptyResponse = await request(empty);
  assert.equal(emptyResponse.status, 200);
  assert.deepEqual(await emptyResponse.json(), { tunnels: [] });

  const absent = await running(t);
  const absentResponse = await request(absent);
  assert.equal(absentResponse.status, 404);
  assert.deepEqual(await absentResponse.json(), { error: "not-found", message: "Bridge handler not found." });
});

// TST-285003
// level: unit
// module: MOD-bridge-http
// guards: UC-044; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: paired Bridges have tunnels handlers that fail with an accepted code or an ordinary error
// input: GET /v1/tunnels reaches each handler
// expect: the accepted error keeps its mapping and an untyped failure is upstream-failed
test("TST-285003: tunnels handler failures retain the server error mapping", async (t) => {
  const named = await running(t, { tunnels: { "GET /v1/tunnels": async () => { const error = new Error("tunnel plan refused"); error.code = "invalid-request"; throw error; } } });
  const namedResponse = await request(named);
  assert.equal(namedResponse.status, 422);
  assert.deepEqual(await namedResponse.json(), { error: "invalid-request", message: "tunnel plan refused" });

  const unexpected = await running(t, { tunnels: { "GET /v1/tunnels": async () => { throw new Error("state reader failed"); } } });
  const unexpectedResponse = await request(unexpected);
  assert.equal(unexpectedResponse.status, 502);
  assert.deepEqual(await unexpectedResponse.json(), { error: "upstream-failed", message: "state reader failed" });
});

// TST-285004
// level: unit
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN; THE BRIDGE IS PAIRED ONCE
// given: a paired Bridge has a tunnels handler and its token can rotate while the server is running
// input: a paired preflight, a foreign-origin GET, a missing-token GET, then old and current tokens after rotation
// expect: only the allowed preflight and current-token same-origin GET can reach the handler
test("TST-285004: tunnels keeps origin, preflight and current-token protections after rotation", async (t) => {
  let calls = 0;
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async () => { calls += 1; return { tunnels: [] }; } } });
  const preflight = await fetch(`${bridge.address}/v1/tunnels`, { method: "OPTIONS", headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET", "Access-Control-Request-Headers": bridgeApi.tokenHeader, "Access-Control-Request-Private-Network": "true" } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);
  assert.match(preflight.headers.get("access-control-allow-headers"), /x-agent-m-bridge-token/i);
  assert.equal(preflight.headers.get("access-control-allow-private-network"), "true");
  assert.equal((await request(bridge, "/v1/tunnels", { origin: "https://other.example" })).status, 403);
  assert.equal((await request(bridge, "/v1/tunnels", { token: "" })).status, 401);
  const old = bridge.token;
  const current = await pairAnew(bridge.folder, "tunnel-state-rotated-token");
  assert.equal((await request(bridge, "/v1/tunnels", { token: old })).status, 401);
  assert.equal((await request(bridge, "/v1/tunnels", { token: current })).status, 200);
  assert.equal(calls, 1);
});

// TST-285005
// level: unit
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a paused paired Bridge has a tunnels state handler and the existing endpoint-test work handler
// input: GET /v1/tunnels followed by the existing POST endpoint-test probe
// expect: read-only tunnel state remains readable while the old work-starting POST still answers paused
test("TST-285005: paused Bridges expose tunnel state but retain paused POST refusal", async (t) => {
  let tunnelCalls = 0;
  const bridge = await running(t, { paused: () => true, tunnels: { "GET /v1/tunnels": async () => { tunnelCalls += 1; return { tunnels: STATES }; } } });
  const state = await request(bridge);
  assert.equal(state.status, 200);
  assert.deepEqual(await state.json(), { tunnels: STATES });
  const probe = await request(bridge, "/v1/probes/endpoint-test", { method: "POST", headers: { "content-type": "application/json" } });
  assert.equal(probe.status, 503);
  assert.deepEqual(await probe.json(), { error: "paused", message: "Bridge is paused." });
  assert.equal(tunnelCalls, 1);
});

// TST-285006
// level: unit
// module: MOD-bridge-http
// guards: UC-044; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a paired Bridge's request logger is captured and its tunnels handler returns a constructed empty state
// input: GET /v1/tunnels carries an extra credential-shaped header
// expect: the route is logged with method/path/status only; no token, header value or handler result is logged
test("TST-285006: tunnel-state request logging excludes token and headers", async (t) => {
  const lines = [], previous = console.info;
  console.info = (...values) => lines.push(values.join(" "));
  t.after(() => { console.info = previous; });
  const bridge = await running(t, { tunnels: { "GET /v1/tunnels": async () => ({ tunnels: [] }) } });
  const secret = "tunnel-state-header-secret";
  const response = await request(bridge, "/v1/tunnels", { headers: { "x-test-secret": secret } });
  assert.equal(response.status, 200);
  const log = lines.join("\n");
  assert.match(log, /GET.*\/v1\/tunnels.*200/);
  assert.equal(log.includes(bridge.token), false);
  assert.equal(log.includes(secret), false);
  assert.equal(log.includes("tunnels"), true, "the route name, not handler output, is logged");
});
