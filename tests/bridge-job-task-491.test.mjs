// MOD-bridge-http and MOD-bridge-client — a hand-over to a Bridge carries its task (ITM-491).
// Module: MOD-bridge-http, MOD-bridge-client
// Guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// Level: unit

import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { serveBridge } from "../src/bridge-http/index.mjs";
import { bridgeAt, handOver } from "../src/bridge-client/index.mjs";

const ORIGIN = "https://akmaier.github.io";
const bridge = () => bridgeAt({ address: "http://127.0.0.1:4711", token: "bridge-token" });
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
function withFetch(t, fn) { const prior = globalThis.fetch; globalThis.fetch = fn; t.after(() => { globalThis.fetch = prior; }); }

async function running(t, received) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-ITM-491-"));
  const jobs = { "POST /v1/jobs": async ({ body }) => { received.push(body); return { accepted: "JOB-491" }; } };
  const server = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused: () => false }, { jobs, mail: {}, tunnels: {} });
  t.after(() => server.close());
  return server;
}
const post = (server, body) => fetch(`${server.address}/v1/jobs`, {
  method: "POST", headers: { Origin: ORIGIN, "X-Agent-M-Bridge-Token": server.token, "Content-Type": "application/json" }, body: JSON.stringify(body),
});

// TST-491001 · level: unit · module: MOD-bridge-client
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a paired Bridge whose fetch is a fixture answering { accepted: "JOB-491" }
// input: handOver with { product, record, commit } and handOver with the same and task "Add a footer"
// expect: both POST to exactly http://127.0.0.1:4711/v1/jobs; the first body is exactly {product,record,commit}, the second exactly those plus task "Add a footer"
test("TST-491001: handOver sends the wire's body with and without task, and the task stands in no URL", async (t) => {
  const calls = [];
  withFetch(t, async (url, init) => { calls.push([String(url), init]); return response({ accepted: "JOB-491" }); });
  const job = { product: "a/b", record: "docs/jobs/JOB-491.md", commit: "abc123" };
  assert.deepEqual(await handOver(bridge(), job), { accepted: "JOB-491" });
  assert.deepEqual(await handOver(bridge(), { ...job, task: "Add a footer" }), { accepted: "JOB-491" });
  assert.deepEqual(calls.map(([url, init]) => [url, init.method]), [["http://127.0.0.1:4711/v1/jobs", "POST"], ["http://127.0.0.1:4711/v1/jobs", "POST"]]);
  assert.deepEqual(JSON.parse(calls[0][1].body), { product: "a/b", record: "docs/jobs/JOB-491.md", commit: "abc123" });
  assert.deepEqual(JSON.parse(calls[1][1].body), { product: "a/b", record: "docs/jobs/JOB-491.md", commit: "abc123", task: "Add a footer" });
});

// TST-491002 · level: unit · module: MOD-bridge-http
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a running Bridge server whose jobs handler records the body it gets
// input: POST /v1/jobs with { product, record, commit } and with the same plus task "Add a footer"
// expect: both answer 200 { accepted: "JOB-491" }; the handler got the first body unchanged and the second with task "Add a footer"
test("TST-491002: the wire of POST /v1/jobs accepts a body with and without task", async (t) => {
  const received = [], server = await running(t, received);
  const job = { product: "a/b", record: "docs/jobs/JOB-491.md", commit: "abc123" };
  for (const body of [job, { ...job, task: "Add a footer" }]) {
    const answer = await post(server, body);
    assert.equal(answer.status, 200);
    assert.deepEqual(await answer.json(), { accepted: "JOB-491" });
  }
  assert.deepEqual(received, [job, { ...job, task: "Add a footer" }]);
});

// TST-491003 · level: unit · module: MOD-bridge-http
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a running Bridge server whose jobs handler records the body it gets
// input: POST /v1/jobs with task 5, with task null and with task ["a"]
// expect: each answers 422 { error: "invalid-request" } and the handler is not called
test("TST-491003: the wire of POST /v1/jobs refuses a task that is not text", async (t) => {
  const received = [], server = await running(t, received);
  const job = { product: "a/b", record: "docs/jobs/JOB-491.md", commit: "abc123" };
  for (const task of [5, null, ["a"]]) {
    const answer = await post(server, { ...job, task });
    assert.equal(answer.status, 422);
    assert.equal((await answer.json()).error, "invalid-request");
  }
  assert.deepEqual(received, []);
});
