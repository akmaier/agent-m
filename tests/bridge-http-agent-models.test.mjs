// The probe kind agent-models of the Bridge API — MOD-bridge-http's route table as docs/architecture/MOD-bridge-http.md states it: "`POST /v1/probes/{kind}` |
// `{ args }`; `kind` is `agent`, `agent-models`, `endpoint-models`, `endpoint-test` or `partitions`; `agent-models` takes `{ agent }`, the name of an agent the
// Bridge offers … | `{ answer }`; for `agent-models`, `{ models: { model, context }[] }` — `context` `null` where the agent reports none — or `{ reason }`".
// Run: node --test tests/bridge-http-agent-models.test.mjs
//
// Module: MOD-bridge-http
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; THE LOCAL BRIDGE REQUIRES A TOKEN; UC-044
// Level: unit
//
// The Bridge's real server on loopback, with a jobs handler of the test that records what it receives; nothing else is reached. Each test states its input and
// its expected result before it runs (given / input / expect). The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bridgeApi, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://akmaier.github.io";
const ANSWER = { models: [{ model: "gpt-6", context: 400000 }, { model: "opencode/big-pickle", context: null }] };

// TST-20261116121 · level: unit · module: MOD-bridge-http
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; THE LOCAL BRIDGE REQUIRES A TOKEN; UC-044
// given: a paired Bridge whose jobs handler for POST /v1/probes/agent-models answers { answer: { models: [gpt-6 400000, opencode/big-pickle null] } } and records the body it receives
// input: bridgeApi's probe route; POST /v1/probes/agent-models with { args: { agent: "codex" } } without the token, then with it
// expect: the probe route's kinds hold agent-models; without the token 401 and the handler does not run; with it 200, the handler received { args: { agent: "codex" } } once, and the answer is
//         returned unchanged as { answer }; counter-proof: a kind the API does not define, agent-modelz, is answered 404 and reaches no handler
test("TST-20261116121: the probe agent-models is a kind of the Bridge API, answered with the token and refused without it", async (t) => {
  const route = bridgeApi.routes.find((candidate) => candidate.method === "POST" && candidate.path === "/v1/probes/{kind}");
  assert.ok(route.kinds.includes("agent-models"), "agent-models is a probe kind");
  const seen = [];
  const server = await serveBridge({ name: () => "lab-pc", host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: await mkdtemp(join(tmpdir(), "agent-m-agent-models-http-")), paused: () => false },
    { jobs: { "POST /v1/probes/agent-models": async ({ body }) => { seen.push(body); return { answer: ANSWER }; } }, mail: {}, tunnels: {} });
  t.after(() => server.close());
  const post = (kind, token) => fetch(`${server.address}/v1/probes/${kind}`, { method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "application/json", ...(token ? { "X-Agent-M-Bridge-Token": token } : {}) }, body: JSON.stringify({ args: { agent: "codex" } }) });
  assert.equal((await post("agent-models")).status, 401);
  assert.deepEqual(seen, [], "no handler runs without the token");
  const answered = await post("agent-models", server.token);
  assert.equal(answered.status, 200);
  assert.deepEqual(await answered.json(), { answer: ANSWER });
  assert.deepEqual(seen, [{ args: { agent: "codex" } }]);
  assert.equal((await post("agent-modelz", server.token)).status, 404);
  assert.equal(seen.length, 1, "an undefined kind reaches no handler");
});
