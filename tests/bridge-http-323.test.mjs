// MOD-bridge-http — agents, jobs and asks routes (ITM-323).
// Module: MOD-bridge-http
// Guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit

import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after } from "node:test";
import { bridgeApi, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://akmaier.github.io";
const ENDPOINT = { name: "local", kind: "openai-compatible", baseUrl: "http://127.0.0.1:11434", model: "small", key: "key-only-in-body" };
const FAULTS = {
  "TST-323001": ["src/bridge-http/protocol.mjs", 'path: "/v1/agents"', 'path: "/v1/agents-missing"'],
  "TST-323002": ["src/bridge-http/server.mjs", "await handler({ params, query:", "await handler({ params: {}, query:"],
  "TST-323003": ["src/bridge-http/server.mjs", "handlers.jobs?.[key]", "undefined"],
  "TST-323004": ["src/bridge-http/server.mjs", "!== await currentToken(config.dataFolder)", "=== await currentToken(config.dataFolder)"],
  "TST-323005": ["src/bridge-http/server.mjs", 'path === "/v1/jobs" || path === "/v1/ask"', "false"],
  "TST-323006": ["src/bridge-http/server.mjs", "method: request.method, path, status", "method: request.method, path: request.url, status"],
};

async function running(t, { paused = () => false, jobs = {} } = {}) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-bridge-http-323-"));
  const bridge = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused }, { jobs, mail: {}, tunnels: {} });
  t.after(() => bridge.close());
  return bridge;
}
async function request(bridge, path, { method = "GET", token = bridge.token, body } = {}) {
  return fetch(`${bridge.address}${path}`, { method, headers: { Origin: ORIGIN, "X-Agent-M-Bridge-Token": token,
    ...(body === undefined ? {} : { "content-type": "application/json" }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}

 // TST-323001 · level: unit · module: MOD-bridge-http
 // guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: the public Bridge protocol
 // input: inspect its additive agents, jobs and asks route declarations
 // expect: every selected route and its declared method are public
 test("TST-323001: bridgeApi declares the selected agents, jobs and asks routes", () => {
  const selected = bridgeApi.routes.filter(({ method, path }) => [
    "GET /v1/agents", "POST /v1/jobs", "GET /v1/jobs", "GET /v1/jobs/{id}/log", "POST /v1/jobs/{id}/cancel", "POST /v1/ask", "GET /v1/ask/{ask}",
  ].includes(`${method} ${path}`));
  assert.deepEqual(selected.map(({ method, path }) => [method, path]), [
    ["GET", "/v1/agents"], ["POST", "/v1/jobs"], ["GET", "/v1/jobs"], ["GET", "/v1/jobs/{id}/log"],
    ["POST", "/v1/jobs/{id}/cancel"], ["POST", "/v1/ask"], ["GET", "/v1/ask/{ask}"],
  ]);
  const route = (method, path) => selected.find((candidate) => candidate.method === method && candidate.path === path);
  assert.deepEqual(route("GET", "/v1/agents").answer, { agents: [{ name: "string", version: "string", ready: "boolean", loggedIn: "boolean" }], missing: [{ name: "string" }] });
  assert.deepEqual(route("POST", "/v1/jobs"), { method: "POST", path: "/v1/jobs", request: { product: "string", record: "string", commit: "string", task: "string?" }, answer: { accepted: "string" } });
  assert.deepEqual(route("GET", "/v1/jobs").answer, { jobs: [{ id: "string", product: "string", kind: "string", agent: "string", state: "string", started: "string", usage: "object" }] });
  assert.deepEqual(route("GET", "/v1/jobs/{id}/log"), { method: "GET", path: "/v1/jobs/{id}/log", query: { from: "number" }, answer: { lines: ["string"], next: "number", ended: "boolean" } });
  assert.deepEqual(route("POST", "/v1/jobs/{id}/cancel").answer, { confirmed: "boolean" });
  assert.deepEqual(route("POST", "/v1/ask").request, [{ agent: "string", input: "string" }, { endpoint: { name: "string", kind: ["openai-compatible", "anthropic"], baseUrl: "string", model: "string", key: ["string", "null"] }, input: "string" }]);
  assert.deepEqual(route("POST", "/v1/ask").answer, { ask: "string" });
  assert.deepEqual(route("GET", "/v1/ask/{ask}").answer, { state: ["running", "done", "failed"], text: ["string", "null"], usage: ["object", "null"], error: ["string", "null"] });
});

 // TST-323002 · level: unit · module: MOD-bridge-http
 // guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge with one handler for each selected route
 // input: agents, hand-over, list, log, cancel, agent ask, endpoint ask and ask-follow requests
 // expect: every route reaches its handler with its path params, query and body
 test("TST-323002: selected routes dispatch params query and bodies to jobs handlers", async (t) => {
  const seen = [], jobs = {};
  for (const key of ["GET /v1/agents", "POST /v1/jobs", "GET /v1/jobs", "GET /v1/jobs/{id}/log", "POST /v1/jobs/{id}/cancel", "POST /v1/ask", "GET /v1/ask/{ask}"])
    jobs[key] = async (input) => { seen.push([key, input]); return { key }; };
  const bridge = await running(t, { jobs });
  const calls = [
    ["/v1/agents"], ["/v1/jobs", { method: "POST", body: { product: "a/b", record: "docs/jobs/JOB-323.md", commit: "abc" } }],
    ["/v1/jobs"], ["/v1/jobs/JOB-323/log?from=7"], ["/v1/jobs/JOB-323/cancel", { method: "POST", body: {} }],
    ["/v1/ask", { method: "POST", body: { agent: "codex", input: "draft" } }],
    ["/v1/ask", { method: "POST", body: { endpoint: ENDPOINT, input: "draft" } }], ["/v1/ask/ASK-323"],
  ];
  for (const [path, options = {}] of calls) assert.equal((await request(bridge, path, options)).status, 200);
  assert.deepEqual(seen.map(([key]) => key), ["GET /v1/agents", "POST /v1/jobs", "GET /v1/jobs", "GET /v1/jobs/{id}/log", "POST /v1/jobs/{id}/cancel", "POST /v1/ask", "POST /v1/ask", "GET /v1/ask/{ask}"]);
  assert.deepEqual(seen[0][1], { params: {}, query: {}, body: {} });
  assert.deepEqual(seen[1][1], { params: {}, query: {}, body: { product: "a/b", record: "docs/jobs/JOB-323.md", commit: "abc" } });
  assert.deepEqual(seen[2][1], { params: {}, query: {}, body: {} });
  assert.deepEqual(seen[3][1], { params: { id: "JOB-323" }, query: { from: "7" }, body: {} });
  assert.deepEqual(seen[4][1], { params: { id: "JOB-323" }, query: {}, body: {} });
  assert.deepEqual(seen[5][1].body, { agent: "codex", input: "draft" });
  assert.deepEqual(seen[6][1].body, { endpoint: ENDPOINT, input: "draft" });
  assert.deepEqual(seen[7][1], { params: { ask: "ASK-323" }, query: {}, body: {} });
});

// TST-323006 · level: unit · module: MOD-bridge-http
// guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a paired Bridge whose request log is captured and selected ask/log handlers
// input: an ask body and a job-log query carry distinct private sentinel values
// expect: logs retain only method, route, status and duration, never either value
test("TST-323006: selected route logs exclude ask bodies and job-log query values", async (t) => {
  const lines = [], prior = console.info;
  console.info = (...values) => lines.push(values.join(" "));
  t.after(() => { console.info = prior; });
  const bridge = await running(t, { jobs: {
    "POST /v1/ask": async () => ({ ask: "ASK-323" }),
    "GET /v1/jobs/{id}/log": async () => ({ lines: [], next: 0, ended: false }),
  } });
  await request(bridge, "/v1/ask", { method: "POST", body: { agent: "codex", input: "body-secret-323" } });
  await request(bridge, "/v1/jobs/JOB-323/log?from=query-secret-323");
  const text = lines.join("\n");
  assert.match(text, /\"method\":\"POST\".*\"path\":\"\/v1\/ask\".*\"status\":200.*\"duration\":\d+/);
  assert.match(text, /\"method\":\"GET\".*\"path\":\"\/v1\/jobs\/JOB-323\/log\".*\"status\":200.*\"duration\":\d+/);
  assert.equal(text.includes("body-secret-323"), false);
  assert.equal(text.includes("query-secret-323"), false);
});

after(() => {
  if (process.env.GITHUB_ACTIONS !== "true" || process.env.AGENT_M_323_FAULT_CHILD) return;
  const temporary = mkdtempSync(join(tmpdir(), "agent-m-323-fault-")), copied = join(temporary, "repo"), digest = (value) => createHash("sha256").update(value).digest("hex");
  try {
    cpSync(process.cwd(), copied, { recursive: true, filter: (path) => !path.includes("/.git") && !path.includes("/node_modules") });
    for (const [id, [file, needle, replacement]] of Object.entries(FAULTS)) {
      const source = join(copied, file), original = readFileSync(source);
      assert.equal(original.toString().split(needle).length - 1, 1, `${id}: unique fault target`);
      const invoke = () => { const env = { ...process.env, AGENT_M_323_FAULT_CHILD: "1" }; delete env.NODE_TEST_CONTEXT; return spawnSync(process.execPath, ["--test", "--test-name-pattern", id, "tests/bridge-http-323.test.mjs"], { cwd: copied, encoding: "utf8", timeout: 15_000, env }); };
      const originalHash = digest(original), testHash = digest(readFileSync(join(copied, "tests/bridge-http-323.test.mjs")));
      let failed, passed, faultHash, restoredHash, faultEnded, restoreStarted, restoredEnded, positiveEnded; const faultStarted = new Date().toISOString();
      try { writeFileSync(source, original.toString().replace(needle, replacement)); faultHash = digest(readFileSync(source)); failed = invoke(); faultEnded = new Date().toISOString(); }
      finally { restoreStarted = new Date().toISOString(); writeFileSync(source, original); restoredHash = digest(readFileSync(source)); restoredEnded = new Date().toISOString(); }
      passed = invoke(); positiveEnded = new Date().toISOString();
      console.log("TST323-counterproof " + JSON.stringify({ id, file, needle, replacement, testHash, originalHash, faultHash, restoredHash, faultStarted, faultEnded, restoreStarted, restoredEnded, positiveEnded, argv: [process.execPath, "--test", "--test-name-pattern", id, "tests/bridge-http-323.test.mjs"], cwd: copied, childflag: "AGENT_M_323_FAULT_CHILD=1", failed: { status: failed.status, signal: failed.signal, error: failed.error?.message ?? null, stdout: failed.stdout, stderr: failed.stderr }, passed: { status: passed.status, signal: passed.signal, error: passed.error?.message ?? null, stdout: passed.stdout, stderr: passed.stderr } }));
      assert.equal(failed.status, 1, id); assert.match(`${failed.stdout}\n${failed.stderr}`, new RegExp(`not ok \\d+ - ${id}\\b`)); assert.equal(restoredHash, originalHash, `${id}: exact restoration`); assert.equal(passed.status, 0, id); assert.match(`${passed.stdout}\n${passed.stderr}`, new RegExp(`ok \\d+ - ${id}\\b`));
    }
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

 // TST-323003 · level: unit · module: MOD-bridge-http
 // guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paired Bridge with no selected-route handler, and a handler that raises a named error
 // input: request the unhandled list then a hand-over whose handler refuses it
 // expect: missing dispatch is not-found and a known handler error keeps its declared status
 test("TST-323003: selected routes name missing handlers and handler failures", async (t) => {
  const absent = await running(t);
  assert.deepEqual(await (await request(absent, "/v1/jobs")).json(), { error: "not-found", message: "Bridge handler not found." });
  const jobs = { "POST /v1/jobs": async () => { const failure = new Error("agent unavailable"); failure.code = "invalid-request"; throw failure; } };
  const bridge = await running(t, { jobs });
  const response = await request(bridge, "/v1/jobs", { method: "POST", body: { product: "a/b", record: "docs/jobs/JOB-323.md", commit: "abc" } });
  assert.equal(response.status, 422);
  assert.deepEqual(await response.json(), { error: "invalid-request", message: "agent unavailable" });
});

 // TST-323004 · level: unit · module: MOD-bridge-http
 // guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a selected handler and a request missing the pairing token
 // input: make the hand-over request with no token
 // expect: token-refused occurs before the jobs handler is called
 test("TST-323004: a missing token refuses selected dispatch before its handler", async (t) => {
  let calls = 0;
  const bridge = await running(t, { jobs: { "POST /v1/jobs": async () => { calls += 1; return { accepted: "JOB-323" }; } } });
  const response = await request(bridge, "/v1/jobs", { method: "POST", token: "", body: { product: "a/b", record: "docs/jobs/JOB-323.md", commit: "abc" } });
  assert.deepEqual(await response.json(), { error: "token-refused", message: "Bridge token refused." });
  assert.equal(calls, 0);
});

 // TST-323005 · level: unit · module: MOD-bridge-http
 // guards: UC-011; UC-017; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
 // given: a paused paired Bridge with hand-over, ask, probe, list and cancel handlers
 // input: call each route while paused
 // expect: work starts are paused while listing and cancelling still dispatch
 test("TST-323005: pause refuses starts but permits list and cancellation", async (t) => {
  const seen = [], jobs = {};
  for (const key of ["POST /v1/jobs", "POST /v1/ask", "POST /v1/probes/agent", "GET /v1/jobs", "POST /v1/jobs/{id}/cancel"])
    jobs[key] = async () => { seen.push(key); return {}; };
  const bridge = await running(t, { paused: () => true, jobs });
  for (const [path, options] of [["/v1/jobs", { method: "POST", body: {} }], ["/v1/ask", { method: "POST", body: {} }], ["/v1/probes/agent", { method: "POST", body: { args: {} } }]])
    assert.equal((await request(bridge, path, options)).status, 503);
  assert.equal((await request(bridge, "/v1/jobs")).status, 200);
  assert.equal((await request(bridge, "/v1/jobs/JOB-323/cancel", { method: "POST", body: {} })).status, 200);
  assert.deepEqual(seen, ["GET /v1/jobs", "POST /v1/jobs/{id}/cancel"]);
});
