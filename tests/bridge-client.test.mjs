// MOD-bridge-client — the browser client for UC-003 endpoint tests through a Bridge (ITM-263).
// Run: node --test tests/bridge-client.test.mjs
//
// Module: MOD-bridge-client
// Guards: UC-003 alternative 2a; A CREDENTIAL IS NEVER PLACED IN A URL; A REMOTE INTERFACE NAMES HOW IT FAILS;
//         THE LOCAL BRIDGE REQUIRES A TOKEN; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN
// Level: unit

import assert from "node:assert/strict";
import test from "node:test";
import { BridgeError, bridgeAt, pair, probe } from "../src/bridge-client/index.mjs";

const CONFIG = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434", model: "tiny", key: "endpoint-key" };

function withFetch(t, implementation) {
  const prior = globalThis.fetch;
  globalThis.fetch = implementation;
  t.after(() => { globalThis.fetch = prior; });
}

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

// TST-263001
// given: a paired loopback Bridge and a constructed endpoint-test answer
// input: probe(bridge, "endpoint-test", args)
// expect: the browser calls only the Bridge's probe route, carries its token in the protocol header,
//         places configuration only in { args }, and unwraps the Bridge answer
// Planted fault: changing the endpoint-test body from { args } to args makes the body assertion fail.
test("TST-263001: endpoint-test goes only to the paired Bridge with configuration in its JSON body", async (t) => {
  const calls = [];
  withFetch(t, async (url, init) => {
    calls.push({ url: String(url), init });
    return json(200, { answer: { works: true, model: "tiny" } });
  });
  const bridge = bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
  assert.deepEqual(await probe(bridge, "endpoint-test", CONFIG), { works: true, model: "tiny" });
  assert.deepEqual(calls.map((call) => call.url), ["http://127.0.0.1:4711/v1/probes/endpoint-test"]);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "bridge-token");
  assert.equal(calls[0].url.includes("bridge-token"), false);
  assert.equal(calls[0].url.includes(CONFIG.key), false);
  assert.deepEqual(JSON.parse(calls[0].init.body), { args: CONFIG });
  assert.deepEqual(bridge, { address: "http://127.0.0.1:4711", route: "loopback" });
});

// TST-263002
// given: an HTTPS jump-host Bridge with web-server credentials and a constructed provider diagnosis
// input: endpoint-test through that Bridge
// expect: the Bridge token and jump-host login are headers, while the provider diagnosis remains the result
// Planted fault: removing the Basic authorisation header makes the header assertion fail.
test("TST-263002: an HTTPS Bridge sends jump-host login in a header and preserves a provider diagnosis", async (t) => {
  let call;
  withFetch(t, async (url, init) => {
    call = { url: String(url), init };
    return json(200, { answer: { works: false, diagnosis: { reason: "not reachable", message: "Ollama is stopped", routes: ["bridge"] } } });
  });
  const bridge = bridgeAt({ address: "https://jump.example.test/session/local", token: "bridge-token", login: { user: "alice", password: "jump-password" } });
  assert.deepEqual(await probe(bridge, "endpoint-test", CONFIG), { works: false, diagnosis: { reason: "not reachable", message: "Ollama is stopped", routes: ["bridge"] } });
  assert.equal(bridge.route, "jump-host");
  assert.equal(call.init.headers["x-agent-m-bridge-token"], "bridge-token");
  assert.equal(call.init.headers.Authorization, `Basic ${Buffer.from("alice:jump-password").toString("base64")}`);
  assert.equal(call.url.includes("bridge-token"), false);
  assert.equal(call.url.includes("jump-password"), false);
});

// TST-263003
// given: the token copied from a Bridge window and a constructed pairing answer
// input: pair at a forwarded localhost address
// expect: it requests /v1/pair with the copied token in the protocol header and returns settings, never a URL secret
// Planted fault: moving the pairing token from the header into the address makes the URL assertion fail.
test("TST-263003: pair sends the copied token only as a header and returns reusable settings", async (t) => {
  let call;
  withFetch(t, async (url, init) => {
    call = { url: String(url), init };
    return json(200, { bridge: { name: "Agent M Bridge", version: "1", platform: "macOS" }, origin: "https://akmaier.github.io" });
  });
  assert.deepEqual(await pair("http://localhost:4711", "copied-token"), { address: "http://localhost:4711", token: "copied-token" });
  assert.equal(call.url, "http://localhost:4711/v1/pair");
  assert.equal(call.init.method, "GET");
  assert.equal(call.init.headers["x-agent-m-bridge-token"], "copied-token");
  assert.equal(call.url.includes("copied-token"), false);
});

// TST-263004
// given: a Bridge without a stored pairing token
// input: an endpoint-test probe
// expect: TokenMissing is named before fetch can run
// Planted fault: removing the token guard makes the fetch-count assertion fail.
test("TST-263004: a missing Bridge token is named before any request", async (t) => {
  let calls = 0;
  withFetch(t, async () => { calls += 1; return json(200, { answer: { works: true, model: "tiny" } }); });
  await assert.rejects(() => probe(bridgeAt({ address: "http://127.0.0.1:4711", token: "" }), "endpoint-test", CONFIG), (error) => error instanceof BridgeError && error.name === "TokenMissing");
  assert.equal(calls, 0, "failure node: token guard prevents fetch");
});

// TST-263005
// given: a paired Bridge that refuses its pairing token
// input: an endpoint-test probe
// expect: the protocol's token-refused response becomes TokenRefused
// Planted fault: mapping 401 to BridgeFailed makes the named-error assertion fail.
test("TST-263005: a refused pairing token is named TokenRefused", async (t) => {
  withFetch(t, async () => json(401, { error: "token-refused", message: "pair again" }));
  await assert.rejects(() => probe(bridgeAt({ address: "http://127.0.0.1:4711", token: "old-token" }), "endpoint-test", CONFIG), (error) => error instanceof BridgeError && error.name === "TokenRefused");
});

// TST-263006
// given: an HTTPS jump host that refuses its web-server login before forwarding
// input: an endpoint-test probe
// expect: JumpHostLoginRefused remains distinct from a Bridge token refusal
// Planted fault: treating every 401 as TokenRefused makes the named-error assertion fail.
test("TST-263006: an HTTPS login refusal is named separately from a Bridge token refusal", async (t) => {
  withFetch(t, async () => new Response("login required", { status: 401, headers: { "WWW-Authenticate": "Basic realm=jump-host" } }));
  await assert.rejects(() => probe(bridgeAt({ address: "https://jump.example.test/session/local", token: "bridge-token", login: { user: "alice", password: "wrong" } }), "endpoint-test", CONFIG), (error) => error instanceof BridgeError && error.name === "JumpHostLoginRefused");
});

// TST-263007
// given: a paired Bridge whose own probe handler declines the configuration, and an unreachable Bridge
// input: endpoint-test probes
// expect: an accepted Bridge failure preserves code/message while an unreadable answer is NoAnswer with browser limits
// Planted fault: discarding Bridge error.message makes the first assertion fail.
test("TST-263007: Bridge failures and unreadable answers have their separate named failures", async (t) => {
  withFetch(t, async () => json(422, { error: "invalid-request", message: "model is required" }));
  await assert.rejects(() => probe(bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" }), "endpoint-test", CONFIG), (error) => {
    assert.equal(error.name, "BridgeFailed");
    assert.equal(error.error, "invalid-request");
    assert.equal(error.message, "model is required");
    return true;
  });
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(() => probe(bridgeAt({ address: "https://jump.example.test/session/local", token: "bridge-token" }), "endpoint-test", CONFIG), (error) => error instanceof BridgeError && error.name === "NoAnswer" && error.likely.includes("certificate not trusted"));
});
