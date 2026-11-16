// The probe agent-models from the browser — MOD-bridge-client's probe as docs/architecture/MOD-bridge-client.md states it: "`probe(bridge: Bridge, kind:
// "agent-models", args: { agent: string }) -> Promise<{ models: { model: string, context: number | null }[] } | { reason: string }>` … — `POST /v1/probes/{kind}` with
// `{ args }`, resolving with the answer's `answer`: … an agent the Bridge offers names the models its CLI reports on the Bridge's computer, or why none could be read".
// Run: node --test tests/bridge-client-agent-models.test.mjs
//
// Module: MOD-bridge-client
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// A stand-in for `fetch` answers as a Bridge does and records each request; nothing reaches the network. Each test states its input and its expected result before
// it runs (given / input / expect). The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { bridgeAt, probe } from "../src/bridge-client/index.mjs";

const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

// TST-20261116131 · level: unit · module: MOD-bridge-client
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: a Bridge at http://127.0.0.1:4711 with the token bridge-token, which answers the first probe { answer: { models: [gpt-6 400000, opencode/big-pickle null] } } and the second { answer: { reason: "codex is not installed" } }
// input: probe(bridge, "agent-models", { agent: "codex" }), twice
// expect: each is one POST to http://127.0.0.1:4711/v1/probes/agent-models with the token and the body { args: { agent: "codex" } }; the first resolves with { models: [...] } and the second with { reason: "codex is not installed" }, each unchanged
test("TST-20261116131: probe agent-models posts the agent to the Bridge and resolves with its models or its reason", async (t) => {
  const calls = [], answers = [{ models: [{ model: "gpt-6", context: 400000 }, { model: "opencode/big-pickle", context: null }] }, { reason: "codex is not installed" }];
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return json({ answer: answers[calls.length - 1] }); };
  t.after(() => { globalThis.fetch = prior; });
  const bridge = bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
  assert.deepEqual(await probe(bridge, "agent-models", { agent: "codex" }), answers[0]);
  assert.deepEqual(await probe(bridge, "agent-models", { agent: "codex" }), answers[1]);
  assert.deepEqual(calls.map((call) => [call.url, call.init.method, call.init.headers["x-agent-m-bridge-token"], JSON.parse(call.init.body)]),
    [0, 1].map(() => ["http://127.0.0.1:4711/v1/probes/agent-models", "POST", "bridge-token", { args: { agent: "codex" } }]));
});
