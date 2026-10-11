// MOD-bridge-http — the Bridge protocol's mail route (ITM-419), as docs/architecture/MOD-bridge-http.md states it: bridgeApi gains the
// route POST /v1/mail/{operation} — { connection, args } in, the operation's answer out — with its ten operations, the fields of
// confirm-send and send, and the errors confirmation-refused (409), no-encryption, login-refused and upstream-failed (502); serveBridge hands
// a mail request, after the origin and token checks, to the mail handler of its operation, passes its arguments and answer through
// without reading them, and answers paused for it while paused() holds; its log keeps no body (UC-037 step 7).
// Run: node --test tests/bridge-http-mail.test.mjs
//
// Module: MOD-bridge-http
// Guards: UC-037; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; THE LOCAL BRIDGE REQUIRES A TOKEN
// Level: unit
//
// The server runs on loopback with handlers the tests write; nothing reaches a mail server. Where the module file leaves a reading open, the
// test states the one it takes, and the pull request names it:
//   - A mail handler is found under the key `POST /v1/mail/<operation>` in handlers.mail, as the tunnels' handler is found under its
//     method and path; it is given { params: { operation }, body } with the body exactly as it was sent.
//   - The mail errors are a datum of the route (`errors`), not added to bridgeApi.errors, whose content an earlier test pins; the server
//     takes a handler's code from either.
//   - The server reads no field of the body: a body that is not JSON is invalid-request (422), any JSON object reaches the handler.
//   - Only the ten operations are routes: another name, or another method on the path, is not-found.
// Each test states its input and its expected result before it runs (given / input / expect); where a test expects a handler not to be
// called, the same request is first shown to call it. The counter-proofs are recorded in the pull request.

import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { mock } from "node:test";
import { bridgeApi, serveBridge } from "../src/bridge-http/index.mjs";

const ORIGIN = "https://akmaier.github.io";
const OPERATIONS = ["test", "read", "find", "drafts", "sent", "store-draft", "update-draft", "show-draft", "confirm-send", "send"];
const PASSWORD = "marker-password-419";
const CONNECTION = { host: "imap.example.test", port: 993, user: "reader", password: PASSWORD, security: "tls" };

async function running(t, { paused = () => false, mail = {}, jobs = {} } = {}) {
  const folder = await mkdtemp(join(tmpdir(), "agent-m-bridge-mail-"));
  const server = await serveBridge({ host: "127.0.0.1", port: 0, origin: ORIGIN, dataFolder: folder, paused }, { jobs, mail, tunnels: {} });
  t.after(() => server.close());
  return server;
}
async function request(server, path, { method = "POST", origin = ORIGIN, token = server.token, body } = {}) {
  return fetch(`${server.address}${path}`, {
    method,
    headers: { Origin: origin, "X-Agent-M-Bridge-Token": token, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}
// A mail handler that records what it was given and answers `answer`.
function recording(answer = { ok: true }) {
  const calls = [];
  return { calls, handler: async (given) => { calls.push(given); return answer; } };
}
const mailRoute = () => bridgeApi.routes.find((route) => route.path === "/v1/mail/{operation}");

// TST-419001
// given: the accepted Bridge API
// input: the route of the mail operations in bridgeApi.routes
// expect: POST /v1/mail/{operation}, with the ten operations in the order the module file lists them, the request { connection, args },
//         the fields of confirm-send ({ ref, sha256 } and { confirmation }) and of send ({ ref, sha256, confirmation }), and the errors
//         confirmation-refused 409, no-encryption 502, login-refused 502 and upstream-failed 502
test("TST-419001: bridgeApi declares the mail route, its ten operations, the fields of confirm-send and send, and its errors", () => {
  const route = mailRoute();
  assert.ok(route, "the route is declared");
  assert.equal(route.method, "POST");
  assert.deepEqual(route.operations, OPERATIONS);
  assert.deepEqual(route.request, { connection: "object", args: "object" });
  assert.deepEqual(route.confirmSend, { args: { ref: "string", sha256: "string" }, answer: { confirmation: "string" } });
  assert.deepEqual(route.send, { args: { ref: "string", sha256: "string", confirmation: "string" } });
  assert.deepEqual(route.errors, { "confirmation-refused": 409, "no-encryption": 502, "login-refused": 502, "upstream-failed": 502 });
});

// TST-419002
// given: a Bridge whose mail handlers answer each operation with its own marker, recording what they are given
// input: POST /v1/mail/<operation> with { connection, args } for each of the ten operations; then a body of another shape
// expect: status 200 and the handler of that operation alone called, once, with params.operation and the body as it was sent; the
//         answer returned unchanged, nested values included; a body without connection or args reaches the handler as it is
test("TST-419002: a mail request reaches the handler of its operation with its body, and its answer comes back unchanged", async (t) => {
  const handlers = Object.fromEntries(OPERATIONS.map((operation) => [operation, recording({ operation, nested: { counts: [1, 2], name: "Drafts" } })]));
  const server = await running(t, { mail: Object.fromEntries(OPERATIONS.map((operation) => [`POST /v1/mail/${operation}`, handlers[operation].handler])) });

  for (const operation of OPERATIONS) {
    const body = { connection: CONNECTION, args: { folder: "INBOX", marker: operation } };
    const answer = await request(server, `/v1/mail/${operation}`, { body });
    assert.equal(answer.status, 200, operation);
    assert.deepEqual(await answer.json(), { operation, nested: { counts: [1, 2], name: "Drafts" } }, operation);
    for (const other of OPERATIONS) assert.equal(handlers[other].calls.length, OPERATIONS.indexOf(other) <= OPERATIONS.indexOf(operation) ? 1 : 0, `${operation}: ${other}`);
    const [given] = handlers[operation].calls;
    assert.equal(given.params.operation, operation);
    assert.deepEqual(given.body, body);
  }

  const odd = { something: ["else"] };
  assert.equal((await request(server, "/v1/mail/test", { body: odd })).status, 200);
  assert.deepEqual(handlers.test.calls.at(-1).body, odd);
});

// TST-419003
// given: a Bridge with a mail handler for test
// input: POST /v1/mail/test with the token and the instance's origin; then without the token, with another token, from another origin
// expect: the first answered 200 and the handler called; the others 401 token-refused, 401 token-refused and 403 origin-refused, and the
//         handler not called again
test("TST-419003: a mail request is refused without the token and from another origin, before any handler", async (t) => {
  const { calls, handler } = recording();
  const server = await running(t, { mail: { "POST /v1/mail/test": handler } });
  const body = { connection: CONNECTION, args: {} };

  assert.equal((await request(server, "/v1/mail/test", { body })).status, 200);
  assert.equal(calls.length, 1, "known positive: the handler is called");
  for (const [refused, options, status, code] of [["no token", { token: "" }, 401, "token-refused"], ["another token", { token: "other" }, 401, "token-refused"],
    ["another origin", { origin: "https://evil.example" }, 403, "origin-refused"]]) {
    const answer = await request(server, "/v1/mail/test", { body, ...options });
    assert.equal(answer.status, status, refused);
    assert.equal((await answer.json()).error, code, refused);
  }
  assert.equal(calls.length, 1, "no refused request reached the handler");
});

// TST-419004
// given: a Bridge with a mail handler and jobs handlers for the list of jobs and for cancelling one; paused() false, then true
// input: POST /v1/mail/test, GET /v1/jobs and POST /v1/jobs/j1/cancel, each while running and while paused
// expect: while running all three answered 200; while paused the mail request answered 503 paused with the handler not called again,
//         and the other two still 200
test("TST-419004: while paused a mail request answers paused, and the routes that follow a running job still answer", async (t) => {
  let paused = false;
  const { calls, handler } = recording();
  const server = await running(t, { paused: () => paused, mail: { "POST /v1/mail/test": handler }, jobs: {
    "GET /v1/jobs": async () => ({ jobs: [] }), "POST /v1/jobs/{id}/cancel": async () => ({ confirmed: true }) } });
  const all = () => Promise.all([request(server, "/v1/mail/test", { body: { connection: CONNECTION, args: {} } }), request(server, "/v1/jobs", { method: "GET" }),
    request(server, "/v1/jobs/j1/cancel", { body: {} })]);

  assert.deepEqual((await all()).map((answer) => answer.status), [200, 200, 200]);
  paused = true;
  const answers = await all();

  assert.deepEqual(answers.map((answer) => answer.status), [503, 200, 200]);
  assert.equal((await answers[0].json()).error, "paused");
  assert.equal(calls.length, 1, "the paused request did not reach the handler");
});

// TST-419005
// given: a Bridge with a mail handler for test only, and one registered for a name that is no operation
// input: POST /v1/mail/read (no handler), POST /v1/mail/delete-all (no such operation, a handler under its key), GET /v1/mail/test
// expect: the first 404 not-found; the second 404 not-found with that handler not called; the third 404 not-found with the handler of test
//         not called; and, to show the handler is otherwise reachable, POST /v1/mail/test answered 200
test("TST-419005: an operation without a handler, a name that is no operation and another method answer not-found", async (t) => {
  const test_ = recording(), stray = recording();
  const server = await running(t, { mail: { "POST /v1/mail/test": test_.handler, "POST /v1/mail/delete-all": stray.handler } });
  const body = { connection: CONNECTION, args: {} };

  assert.equal((await request(server, "/v1/mail/test", { body })).status, 200);
  assert.equal(test_.calls.length, 1, "known positive");
  for (const [label, path, options] of [["no handler", "/v1/mail/read", { body }], ["no such operation", "/v1/mail/delete-all", { body }],
    ["another method", "/v1/mail/test", { method: "GET" }]]) {
    const answer = await request(server, path, options);
    assert.equal(answer.status, 404, label);
    assert.equal((await answer.json()).error, "not-found", label);
  }
  assert.equal(stray.calls.length, 0);
  assert.equal(test_.calls.length, 1);
});

// TST-419006
// given: a Bridge whose handler of test throws an error carrying a code and a message, one code at a time
// input: POST /v1/mail/test for confirmation-refused, no-encryption, login-refused, upstream-failed, a code the API does not know, and
//        an error without a code
// expect: the status of the route's code — 409, 502, 502, 502 — with { error, message } of the handler's own message; the unknown code and
//         the missing code answered upstream-failed 502 with the message
test("TST-419006: a handler's error is answered with its code and message", async (t) => {
  let failure;
  const server = await running(t, { mail: { "POST /v1/mail/test": async () => { throw failure; } } });
  const body = { connection: CONNECTION, args: {} };
  const fails = (code, message) => Object.assign(new Error(message), code === undefined ? {} : { code });

  for (const [code, message, status, expected] of [["confirmation-refused", "the confirmation is spent", 409, "confirmation-refused"],
    ["no-encryption", "imap.example.test offers no TLS", 502, "no-encryption"], ["login-refused", "AUTHENTICATIONFAILED", 502, "login-refused"],
    ["upstream-failed", "connection reset", 502, "upstream-failed"], ["something-else", "odd", 502, "upstream-failed"], [undefined, "plain", 502, "upstream-failed"]]) {
    failure = fails(code, message);
    const answer = await request(server, "/v1/mail/test", { body });
    assert.equal(answer.status, status, String(code));
    assert.deepEqual(await answer.json(), { error: expected, message }, String(code));
  }
});

// TST-419007
// given: a Bridge with a mail handler; the console's log captured; a request whose body holds a marker password and a marker argument
// input: POST /v1/mail/test answered, and the same answered with an error whose message names the marker argument
// expect: a log line for each request with method, path, status and duration; no line holds the password, the argument or the host
test("TST-419007: the log keeps no part of a mail request's body", async (t) => {
  const lines = [];
  mock.method(console, "info", (...parts) => { lines.push(parts.join(" ")); });
  t.after(() => mock.restoreAll());
  let fail = false;
  const server = await running(t, { mail: { "POST /v1/mail/find": async () => { if (fail) throw Object.assign(new Error("failed for subject-marker-419"), { code: "upstream-failed" }); return { found: [] }; } } });
  const body = { connection: CONNECTION, args: { subject: "subject-marker-419" } };

  assert.equal((await request(server, "/v1/mail/find", { body })).status, 200);
  fail = true;
  assert.equal((await request(server, "/v1/mail/find", { body })).status, 502);

  const mine = lines.filter((line) => line.includes("/v1/mail/find")).map((line) => JSON.parse(line));
  assert.deepEqual(mine.map((line) => [line.method, line.path, line.status, typeof line.duration]), [["POST", "/v1/mail/find", 200, "number"], ["POST", "/v1/mail/find", 502, "number"]]);
  for (const line of lines) for (const secret of [PASSWORD, "subject-marker-419", "imap.example.test"]) assert.ok(!line.includes(secret), `${secret} in ${line}`);
});

// TST-419008
// given: a Bridge with a mail handler for test
// input: POST /v1/mail/test with a body that is not JSON, then with JSON
// expect: the first 422 invalid-request with the handler not called; the second 200 with the handler called
test("TST-419008: a mail body that is not JSON is invalid-request", async (t) => {
  const { calls, handler } = recording();
  const server = await running(t, { mail: { "POST /v1/mail/test": handler } });

  assert.equal((await request(server, "/v1/mail/test", { body: { connection: CONNECTION, args: {} } })).status, 200);
  assert.equal(calls.length, 1, "known positive");
  const answer = await request(server, "/v1/mail/test", { body: "{not json" });

  assert.equal(answer.status, 422);
  assert.equal((await answer.json()).error, "invalid-request");
  assert.equal(calls.length, 1);
});
