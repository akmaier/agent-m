// A Bridge's jobs through MOD-bridge-client (ITM-544): bridgeJobs, bridgeJobLog and cancelOnBridge, as docs/architecture/MOD-bridge-client.md states them —
// `GET /v1/jobs`, `GET /v1/jobs/{id}/log?from={line}` and `POST /v1/jobs/{id}/cancel`, sent as handOver and ask are sent (the Bridge's address, the pairing token in
// its header, and for a Bridge through the jump host the web server's login), failing with every BridgeError but AskFailed, among them BridgeFailed with `not-found`
// for a job the Bridge does not know.
// Run: node --test tests/bridge-client-jobs-544.test.mjs
//
// Module: MOD-bridge-client
// Guards: UC-036; ONE DASHBOARD SHOWS EVERY JOB; A CANCELLED JOB WRITES NOTHING MORE
// Guards: THE LOCAL BRIDGE REQUIRES A TOKEN; A CREDENTIAL IS NEVER PLACED IN A URL; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// A fixture Bridge stands behind a stand-in for `fetch`, which records every request; the real network is never reached. The fixture speaks the routes as the text
// above gives them, each spelled out below, and answers any other route, or the right route with another method, as the real Bridge does: 404 `not-found`. The
// jobs, the token and the logins are constructed. Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - bridgeJobs gives the `jobs` of the answer `{ jobs }`; bridgeJobLog and cancelOnBridge give the answer as the Bridge gave it.
//   - The job's identifier is one segment of the path: it travels percent-encoded (encodeURIComponent), as the Bridge decodes it; `from` travels as the number's digits,
//     0 included.
//   - cancelOnBridge sends no body, since the route declares no request fields.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as client from "../src/bridge-client/index.mjs";

const { bridgeAt } = client;

const TOKEN = "bridge-token-constructed-544";
const LOGIN = { user: "proxy-user", password: "web-login-constructed-544" };
const LOOPBACK = { address: "http://127.0.0.1:4711", token: TOKEN };
const JUMP = { address: "https://jump.example.test/bridge/gpu-box", token: TOKEN, login: LOGIN };

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const failure = (error, message, status) => json({ error, message }, status);
const rejection = (name, fields = {}) => (error) => error?.name === name && Object.entries(fields).every(([key, value]) => JSON.stringify(error[key]) === JSON.stringify(value));

// A stand-in for fetch that records each request ({ url, init }) and answers through `implementation(url, init, number)`; after the test, fetch is what it was when this file loaded.
const loadedFetch = globalThis.fetch;
function withFetch(t, implementation) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return implementation(String(url), init, calls.length); };
  t.after(() => { globalThis.fetch = loadedFetch; });
  return calls;
}

// A fixture Bridge. `jobs` maps a job's identifier to { row, lines, ended }: the row `GET /v1/jobs` lists, the log's lines so far, and whether the log has ended.
// It answers a request without the token as token-refused (401), a job it does not know as not-found (404), and cancels by ending the job.
function fixtureBridge(t, jobs, base = "http://127.0.0.1:4711") {
  return withFetch(t, (url, init) => {
    if (init.headers?.["x-agent-m-bridge-token"] !== TOKEN) return failure("token-refused", "Bridge token refused.", 401);
    const where = new URL(url);
    const path = where.pathname.slice(new URL(base).pathname.replace(/\/$/, "").length);
    const method = init.method;
    if (method === "GET" && path === "/v1/jobs") return json({ jobs: [...jobs.values()].map((job) => job.row) });
    const log = /^\/v1\/jobs\/([^/]+)\/log$/.exec(path);
    if (method === "GET" && log) {
      const job = jobs.get(decodeURIComponent(log[1]));
      if (!job) return failure("not-found", `No job ${decodeURIComponent(log[1])}.`, 404);
      const from = Number(where.searchParams.get("from"));
      return json({ lines: job.lines.slice(from), next: job.lines.length, ended: job.ended });
    }
    const cancel = /^\/v1\/jobs\/([^/]+)\/cancel$/.exec(path);
    if (method === "POST" && cancel) {
      const job = jobs.get(decodeURIComponent(cancel[1]));
      if (!job) return failure("not-found", `No job ${decodeURIComponent(cancel[1])}.`, 404);
      job.ended = true;
      job.row.state = "cancelled";
      return json({ confirmed: true });
    }
    return failure("not-found", "Bridge route not found.", 404);
  });
}

const rowA = () => ({ id: "JOB-A", product: "akmaier/shop", kind: "implementation", agent: "codex", state: "running", started: "2026-10-16T09:00:00Z", usage: null });
const rowB = () => ({ id: "JOB-B", product: "akmaier/shop", kind: "derive requirements", agent: "claude", state: "done", started: "2026-10-16T08:00:00Z", usage: { tokens: 12 } });
const twoJobs = () => new Map([
  ["JOB-A", { row: rowA(), lines: ["one", "two"], ended: false }],
  ["JOB-B", { row: rowB(), lines: ["only"], ended: true }],
]);

// TST-544001 · level: unit · module: MOD-bridge-client
// guards: UC-036; ONE DASHBOARD SHOWS EVERY JOB; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a Bridge on the loopback that runs JOB-A (running, usage null) and ran JOB-B (done, usage { tokens: 12 }), and one that holds no job
// input: bridgeJobs(bridge) for each
// expect: one request each, GET http://127.0.0.1:4711/v1/jobs with no body and the token "bridge-token-constructed-544" in the header x-agent-m-bridge-token; the first gives the two rows [JOB-A, JOB-B] exactly as the Bridge lists them, the second gives []
test("bridgeJobs — GET /v1/jobs with the token, and gives the Bridge's jobs, none as []", async (t) => {
  const calls = fixtureBridge(t, twoJobs());
  const jobs = await client.bridgeJobs(bridgeAt(LOOPBACK));
  assert.deepEqual(jobs, [rowA(), rowB()]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://127.0.0.1:4711/v1/jobs");
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.body, undefined);
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "bridge-token-constructed-544");
  const none = fixtureBridge(t, new Map());
  assert.deepEqual(await client.bridgeJobs(bridgeAt(LOOPBACK)), []);
  assert.equal(none.length, 1);
});

// TST-544002 · level: unit · module: MOD-bridge-client
// guards: UC-036; ONE DASHBOARD SHOWS EVERY JOB; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a Bridge on the loopback whose JOB-A has the log lines "one", "two" and is running; later it has a third line "three" and is done
// input: bridgeJobLog(bridge, "JOB-A", 0), then — after the third line — bridgeJobLog(bridge, "JOB-A", 2)
// expect: the requests are GET http://127.0.0.1:4711/v1/jobs/JOB-A/log?from=0 and GET http://127.0.0.1:4711/v1/jobs/JOB-A/log?from=2, each with no body and the token header; the answers are { lines: ["one","two"], next: 2, ended: false } and { lines: ["three"], next: 3, ended: true }
test("bridgeJobLog — GET /v1/jobs/{id}/log?from= with the token, from 0 included, and gives { lines, next, ended } as the Bridge gave it", async (t) => {
  const jobs = twoJobs();
  const calls = fixtureBridge(t, jobs);
  const bridge = bridgeAt(LOOPBACK);
  assert.deepEqual(await client.bridgeJobLog(bridge, "JOB-A", 0), { lines: ["one", "two"], next: 2, ended: false });
  jobs.get("JOB-A").lines.push("three");
  Object.assign(jobs.get("JOB-A"), { ended: true });
  assert.deepEqual(await client.bridgeJobLog(bridge, "JOB-A", 2), { lines: ["three"], next: 3, ended: true });
  assert.deepEqual(calls.map((call) => call.url), ["http://127.0.0.1:4711/v1/jobs/JOB-A/log?from=0", "http://127.0.0.1:4711/v1/jobs/JOB-A/log?from=2"]);
  for (const call of calls) {
    assert.equal(call.init.method, "GET");
    assert.equal(call.init.body, undefined);
    assert.equal(call.init.headers["x-agent-m-bridge-token"], "bridge-token-constructed-544");
  }
});

// TST-544003 · level: unit · module: MOD-bridge-client
// guards: UC-036; A CANCELLED JOB WRITES NOTHING MORE; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a Bridge on the loopback that runs JOB-A and ends the agent's process when it is cancelled; another that answers { confirmed: false }
// input: cancelOnBridge(bridge, "JOB-A") on each
// expect: one request, POST http://127.0.0.1:4711/v1/jobs/JOB-A/cancel with no body and the token header; the first gives { confirmed: true } and its job is then listed as cancelled, the second gives { confirmed: false } and does not throw
test("cancelOnBridge — POST /v1/jobs/{id}/cancel with the token and no body, and gives { confirmed } as the Bridge gave it", async (t) => {
  const jobs = twoJobs();
  const calls = fixtureBridge(t, jobs);
  assert.deepEqual(await client.cancelOnBridge(bridgeAt(LOOPBACK), "JOB-A"), { confirmed: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://127.0.0.1:4711/v1/jobs/JOB-A/cancel");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, undefined);
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "bridge-token-constructed-544");
  assert.equal(jobs.get("JOB-A").row.state, "cancelled");
  const unconfirmed = withFetch(t, () => json({ confirmed: false }));
  assert.deepEqual(await client.cancelOnBridge(bridgeAt(LOOPBACK), "JOB-A"), { confirmed: false });
  assert.equal(unconfirmed.length, 1);
});

// TST-544004 · level: unit · module: MOD-bridge-client
// guards: UC-036; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a Bridge that knows JOB-A only and answers a job it does not know with 404 and { error: "not-found", message: "No job JOB-NONE." }
// input: bridgeJobLog(bridge, "JOB-NONE", 0) and cancelOnBridge(bridge, "JOB-NONE"), then bridgeJobLog(bridge, "JOB-A", 0)
// expect: the first two reject with BridgeFailed whose error is "not-found" and whose message is "No job JOB-NONE."; the third gives { lines: ["one","two"], next: 2, ended: false }
test("an unknown job — the log and the cancel fail as BridgeFailed with not-found, with the Bridge's message", async (t) => {
  const calls = fixtureBridge(t, new Map([["JOB-A", { row: rowA(), lines: ["one", "two"], ended: false }]]));
  const bridge = bridgeAt(LOOPBACK);
  const unknown = (error) => error.name === "BridgeFailed" && error.error === "not-found" && error.message === "No job JOB-NONE.";
  await assert.rejects(() => client.bridgeJobLog(bridge, "JOB-NONE", 0), unknown);
  await assert.rejects(() => client.cancelOnBridge(bridge, "JOB-NONE"), unknown);
  assert.deepEqual(await client.bridgeJobLog(bridge, "JOB-A", 0), { lines: ["one", "two"], next: 2, ended: false });
  assert.equal(calls.length, 3);
});

// TST-544005 · level: unit · module: MOD-bridge-client
// guards: UC-036; A CANCELLED JOB WRITES NOTHING MORE
// given: a Bridge that holds a job whose identifier is "a/b c" (a slash and a space) and one, JOB-A, whose cancel is a different route
// input: bridgeJobLog(bridge, "a/b c", 3) and cancelOnBridge(bridge, "a/b c")
// expect: the requests are GET http://127.0.0.1:4711/v1/jobs/a%2Fb%20c/log?from=3 and POST http://127.0.0.1:4711/v1/jobs/a%2Fb%20c/cancel; the log is { lines: ["d"], next: 4, ended: false }, the cancel { confirmed: true }, and JOB-A stays running
test("a job's identifier is one percent-encoded segment of the path", async (t) => {
  const jobs = new Map([
    ["a/b c", { row: { ...rowA(), id: "a/b c" }, lines: ["a", "b", "c", "d"], ended: false }],
    ["JOB-A", { row: rowA(), lines: [], ended: false }],
  ]);
  const calls = fixtureBridge(t, jobs);
  const bridge = bridgeAt(LOOPBACK);
  assert.deepEqual(await client.bridgeJobLog(bridge, "a/b c", 3), { lines: ["d"], next: 4, ended: false });
  assert.deepEqual(await client.cancelOnBridge(bridge, "a/b c"), { confirmed: true });
  assert.deepEqual(calls.map((call) => `${call.init.method} ${call.url}`), [
    "GET http://127.0.0.1:4711/v1/jobs/a%2Fb%20c/log?from=3",
    "POST http://127.0.0.1:4711/v1/jobs/a%2Fb%20c/cancel",
  ]);
  assert.equal(jobs.get("JOB-A").row.state, "running");
});

// TST-544006 · level: unit · module: MOD-bridge-client
// guards: UC-036; THE LOCAL BRIDGE REQUIRES A TOKEN; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a Bridge at the jump host's HTTPS address https://jump.example.test/bridge/gpu-box with the web server's login proxy-user, and the same jobs as TST-544001
// input: bridgeJobs, bridgeJobLog(bridge, "JOB-A", 0) and cancelOnBridge(bridge, "JOB-A")
// expect: the requests are GET https://jump.example.test/bridge/gpu-box/v1/jobs, GET …/v1/jobs/JOB-A/log?from=0 and POST …/v1/jobs/JOB-A/cancel; each carries the token in x-agent-m-bridge-token and the login as Authorization "Basic " + base64("proxy-user:web-login-constructed-544"); no URL contains the token, the user or the password
test("at the jump host — the three calls go to the Bridge's path with the token and the web login in headers, and none in a URL", async (t) => {
  const calls = fixtureBridge(t, twoJobs(), "https://jump.example.test/bridge/gpu-box");
  const bridge = bridgeAt(JUMP);
  assert.deepEqual(await client.bridgeJobs(bridge), [rowA(), rowB()]);
  assert.deepEqual(await client.bridgeJobLog(bridge, "JOB-A", 0), { lines: ["one", "two"], next: 2, ended: false });
  assert.deepEqual(await client.cancelOnBridge(bridge, "JOB-A"), { confirmed: true });
  assert.deepEqual(calls.map((call) => `${call.init.method} ${call.url}`), [
    "GET https://jump.example.test/bridge/gpu-box/v1/jobs",
    "GET https://jump.example.test/bridge/gpu-box/v1/jobs/JOB-A/log?from=0",
    "POST https://jump.example.test/bridge/gpu-box/v1/jobs/JOB-A/cancel",
  ]);
  const basic = `Basic ${Buffer.from("proxy-user:web-login-constructed-544").toString("base64")}`;
  for (const call of calls) {
    assert.equal(call.init.headers["x-agent-m-bridge-token"], "bridge-token-constructed-544");
    assert.equal(call.init.headers.Authorization, basic);
    for (const secret of [TOKEN, LOGIN.user, LOGIN.password]) assert.ok(!call.url.includes(secret), `${secret} is in ${call.url}`);
  }
});

// TST-544007 · level: unit · module: MOD-bridge-client
// guards: UC-036; THE LOCAL BRIDGE REQUIRES A TOKEN; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: for each of bridgeJobs, bridgeJobLog and cancelOnBridge, a Bridge with no token stored, one that refuses its token (401 token-refused), one at the jump host whose web server refuses the login (401 with www-authenticate), one that gives no answer (fetch throws) on the loopback and one at the jump host, one that times out, and ones that answer invalid-request (422), paused (503), upstream-failed (502) and a code no route knows (500)
// input: the call for each
// expect: TokenMissing with no request made; TokenRefused; JumpHostLoginRefused; NoAnswer whose likely causes begin with "blocked by the browser" on the loopback and end with "certificate not trusted" at the jump host; Timeout; BridgeFailed with error "invalid-request", "paused", "upstream-failed" and, for the unknown code, "upstream-failed"; no failure is named AskFailed
test("the three calls fail as the client's other calls do — a missing or refused token or login, no answer, a timeout and the Bridge's errors; never AskFailed", async (t) => {
  const calls = {
    bridgeJobs: (bridge) => client.bridgeJobs(bridge),
    bridgeJobLog: (bridge) => client.bridgeJobLog(bridge, "JOB-A", 0),
    cancelOnBridge: (bridge) => client.cancelOnBridge(bridge, "JOB-A"),
  };
  for (const [name, call] of Object.entries(calls)) {
    let mode = "ok";
    const requests = withFetch(t, () => {
      if (mode === "no-answer") throw new TypeError("Failed to fetch");
      if (mode === "timeout") throw new DOMException("The request timed out", "TimeoutError");
      if (mode === "token") return failure("token-refused", "pair again", 401);
      if (mode === "login") return new Response("", { status: 401, headers: { "www-authenticate": "Basic realm=\"Agent M jump host\"" } });
      if (typeof mode === "object") return failure(mode.code, "from the Bridge", mode.status);
      return json(name === "bridgeJobs" ? { jobs: [] } : name === "bridgeJobLog" ? { lines: [], next: 0, ended: false } : { confirmed: true });
    });
    await call(bridgeAt(LOOPBACK));
    assert.equal(requests.length, 1, `${name}: known positive`);
    await assert.rejects(() => call(bridgeAt({ address: LOOPBACK.address })), rejection("TokenMissing"), `${name}: no token`);
    assert.equal(requests.length, 1, `${name}: no request without a token`);
    mode = "token";
    await assert.rejects(() => call(bridgeAt(LOOPBACK)), rejection("TokenRefused"), `${name}: token refused`);
    mode = "login";
    await assert.rejects(() => call(bridgeAt(JUMP)), rejection("JumpHostLoginRefused"), `${name}: login refused`);
    mode = "no-answer";
    await assert.rejects(() => call(bridgeAt(LOOPBACK)), (error) => error.name === "NoAnswer" && error.likely[0] === "blocked by the browser" && !error.likely.includes("certificate not trusted"), `${name}: no answer on the loopback`);
    await assert.rejects(() => call(bridgeAt(JUMP)), (error) => error.name === "NoAnswer" && error.likely.at(-1) === "certificate not trusted", `${name}: no answer at the jump host`);
    mode = "timeout";
    await assert.rejects(() => call(bridgeAt(LOOPBACK)), rejection("Timeout"), `${name}: timeout`);
    for (const [code, status, expected] of [["invalid-request", 422, "invalid-request"], ["paused", 503, "paused"], ["upstream-failed", 502, "upstream-failed"], ["something-new", 500, "upstream-failed"]]) {
      mode = { code, status };
      await assert.rejects(() => call(bridgeAt(LOOPBACK)), (error) => error.name === "BridgeFailed" && error.error === expected, `${name}: ${code}`);
    }
  }
});
