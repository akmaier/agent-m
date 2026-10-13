// A mailbox operation through a Bridge (ITM-421) — MOD-bridge-client's mailCall(bridge, operation, connection, args), as
// docs/architecture/MOD-bridge-client.md states it: POST /v1/mail/{operation} with { connection, args }, the connection and its password only in that
// request's body, with the Bridge's token and, for a Bridge through the jump host, the web server's login, as the client's other requests carry
// them; the answer as the Bridge gives it; the BridgeErrors the file names.
// Run: node --test tests/bridge-client-mail-call.test.mjs
//
// Module: MOD-bridge-client
// Guards: UC-037
// Guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; A CREDENTIAL IS NEVER PLACED IN A URL; THE LOCAL BRIDGE REQUIRES A TOKEN
// Level: unit
//
// A fake Bridge answers through a stand-in for fetch, which records every request. The connection, the password and the tokens are constructed. Where
// the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - The operations are those of bridgeApi's mail route; any other name is a TypeError and no request is made.
//   - The Bridge's own error codes of the mail route (bridgeApi: confirmation-refused, no-encryption, login-refused, upstream-failed) are
//     BridgeFailed { error } with the Bridge's message, which for no-encryption names the mail server; a code no route knows stays upstream-failed.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as client from "../src/bridge-client/index.mjs";

const { mailCall, bridgeAt } = client;

const CONNECTION = { route: "imap", address: "me@example.test", servers: { imap: "imap.example.test:993", smtp: "smtp.example.test:465" }, password: "mail-password-constructed-001" };
const BRIDGE = { address: "http://127.0.0.1:4711", token: "bridge-token-constructed-002" };
const LOGIN = { user: "proxy-user", password: "web-login-constructed-003" };
const OPERATIONS = ["test", "read", "find", "drafts", "sent", "store-draft", "update-draft", "show-draft", "confirm-send", "send"];

function withFetch(t, implementation) {
  const calls = [];
  const prior = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return implementation(String(url), init, calls.length); };
  t.after(() => { globalThis.fetch = prior; });
  return calls;
}
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const failure = (error, message, status) => json({ error, message }, status);
const rejection = (name, fields = {}) => (error) => error?.name === name && Object.entries(fields).every(([key, value]) => JSON.stringify(error[key]) === JSON.stringify(value));

// TST-472069 · level: unit · module: MOD-bridge-client
// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; UC-037
// given: a Bridge on the loopback that answers the operation test with an object of its own
// input: mailCall(bridge, "test", connection, args)
// expect: one request, POST to /v1/mail/test, whose JSON body is exactly { connection, args }, as JSON; the answer is returned as the Bridge gave it
test("mailCall — test posts { connection, args } to its path and returns the Bridge's answer as it is", async (t) => {
  const answer = { ok: true, folders: ["INBOX", "Drafts"], extra: { nested: [1, 2] } };
  const calls = withFetch(t, () => json(answer));
  const result = await mailCall(bridgeAt(BRIDGE), "test", CONNECTION, { folder: "INBOX" });
  assert.deepEqual(result, answer);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://127.0.0.1:4711/v1/mail/test");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), { connection: CONNECTION, args: { folder: "INBOX" } });
  assert.equal(calls[0].init.headers["Content-Type"], "application/json");
});

// TST-472070 · level: unit · module: MOD-bridge-client
// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; A CREDENTIAL IS NEVER PLACED IN A URL; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a Bridge on the loopback, and one at the jump host's HTTPS address with the web server's login
// input: mailCall for each
// expect: the token in the protocol header; the password only in the body — not in the address, not in any header, not in the web login; at the jump host the address is the Bridge's path and the Authorization header is the web login, the token still its own header
test("mailCall — the token travels in its header, the password in the body only, and a jump-host Bridge adds the web login", async (t) => {
  const calls = withFetch(t, () => json({ ok: true }));
  await mailCall(bridgeAt(BRIDGE), "read", CONNECTION, { folder: "INBOX" });
  await mailCall(bridgeAt({ address: "https://jump.example.test/bridge/gpu-box", token: "jump-bridge-token", login: LOGIN }), "read", CONNECTION, {});
  const [direct, jump] = calls;
  assert.equal(direct.init.headers["x-agent-m-bridge-token"], BRIDGE.token);
  assert.equal(direct.init.headers.Authorization, undefined);
  assert.equal(jump.url, "https://jump.example.test/bridge/gpu-box/v1/mail/read");
  assert.equal(jump.init.headers["x-agent-m-bridge-token"], "jump-bridge-token");
  assert.equal(jump.init.headers.Authorization, `Basic ${Buffer.from("proxy-user:web-login-constructed-003").toString("base64")}`);
  for (const call of calls) {
    assert.ok(call.init.body.includes(CONNECTION.password), "the password is in the body");
    assert.ok(!call.url.includes(CONNECTION.password) && !call.url.includes("token"), "no credential in the address");
    assert.ok(!Object.values(call.init.headers).some((value) => String(value).includes(CONNECTION.password)), "no password in a header");
    assert.equal(call.init.credentials, "omit");
  }
});

// TST-472071 · level: unit · module: MOD-bridge-client
// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// given: the ten operations of the Bridge's mail route, the last two with the single-use confirmation in their arguments
// input: mailCall for each; and for an operation the route does not have
// expect: each posts to /v1/mail/<operation> with its arguments in the body, and no other operation is a TypeError that makes no request
test("mailCall — each operation of the mail route posts to its own path, and no other operation is asked", async (t) => {
  const calls = withFetch(t, () => json({ ok: true }));
  for (const operation of OPERATIONS) await mailCall(bridgeAt(BRIDGE), operation, CONNECTION, { ref: "draft-1", sha256: "ab".repeat(32), confirmation: "once" });
  assert.deepEqual(calls.map((call) => call.url), OPERATIONS.map((operation) => `http://127.0.0.1:4711/v1/mail/${operation}`));
  assert.deepEqual(JSON.parse(calls.at(-1).init.body).args, { ref: "draft-1", sha256: "ab".repeat(32), confirmation: "once" });
  const before = calls.length;
  await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "delete-everything", CONNECTION, {}), TypeError);
  await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "../jobs", CONNECTION, {}), TypeError);
  for (const near of ["testing", "send-all", "Read", ""]) await assert.rejects(() => mailCall(bridgeAt(BRIDGE), near, CONNECTION, {}), TypeError, near);
  assert.equal(calls.length, before);
});

// TST-472072 · level: unit · module: MOD-bridge-client
// guards: UC-037; THE LOCAL BRIDGE REQUIRES A TOKEN
// given: a Bridge that answers each error code of its mail route with the status bridgeApi gives it, and its own message
// input: mailCall for each
// expect: BridgeFailed { error } with the Bridge's message for confirmation-refused, no-encryption — the message naming the mail server —, login-refused, upstream-failed and paused; a code no route knows is upstream-failed
test("mailCall — each error of the Bridge is answered as its BridgeError, no-encryption with the server it names", async (t) => {
  const answers = [
    ["confirmation-refused", "The confirmation was used already.", 409],
    ["no-encryption", "imap.example.test offers no encryption; nothing was sent.", 502],
    ["login-refused", "The mail server refused the login.", 502],
    ["upstream-failed", "smtp.example.test: 451 try later", 502],
    ["paused", "The Bridge is paused.", 503],
    ["something-new", "unknown", 500],
  ];
  withFetch(t, (_url, _init, n) => failure(answers[n - 1][0], answers[n - 1][1], answers[n - 1][2]));
  for (const [code, message] of answers) {
    const expected = code === "something-new" ? "upstream-failed" : code;
    await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "send", CONNECTION, {}), (error) => error.name === "BridgeFailed" && error.error === expected
      && (code === "something-new" || error.message === message), code);
  }
});

// TST-472073 · level: unit · module: MOD-bridge-client
// guards: THE LOCAL BRIDGE REQUIRES A TOKEN; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a Bridge with no token stored, one that refuses its token, one at the jump host whose web server refuses the login, one that gives no answer on the loopback and one at the jump host, and one that times out
// input: mailCall for each
// expect: TokenMissing with no request; TokenRefused; JumpHostLoginRefused; NoAnswer whose likely causes begin with "blocked by the browser" on the loopback and end with "certificate not trusted" at the jump host; Timeout
test("mailCall — a missing or refused token, a refused web login, no answer and a timeout are named", async (t) => {
  let mode = "ok";
  const calls = withFetch(t, () => {
    if (mode === "no-answer") throw new TypeError("Failed to fetch");
    if (mode === "timeout") throw new DOMException("The request timed out", "TimeoutError");
    if (mode === "token") return json({ error: "token-refused" }, 401);
    if (mode === "login") return new Response("", { status: 401, headers: { "www-authenticate": "Basic realm=\"Agent M jump host\"" } });
    return json({ ok: true });
  });
  assert.deepEqual(await mailCall(bridgeAt(BRIDGE), "test", CONNECTION, {}), { ok: true }, "known positive");
  const before = calls.length;
  await assert.rejects(() => mailCall(bridgeAt({ address: BRIDGE.address }), "test", CONNECTION, {}), rejection("TokenMissing"));
  assert.equal(calls.length, before, "no request without a token");
  mode = "token";
  await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "test", CONNECTION, {}), rejection("TokenRefused"));
  mode = "login";
  await assert.rejects(() => mailCall(bridgeAt({ address: "https://jump.example.test/bridge/gpu-box", token: "t", login: LOGIN }), "test", CONNECTION, {}), rejection("JumpHostLoginRefused"));
  mode = "no-answer";
  await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "test", CONNECTION, {}), (error) => error.name === "NoAnswer" && error.likely[0] === "blocked by the browser"
    && !error.likely.includes("certificate not trusted") && !error.message.includes(CONNECTION.password));
  await assert.rejects(() => mailCall(bridgeAt({ address: "https://jump.example.test/bridge/gpu-box", token: "t" }), "test", CONNECTION, {}),
    (error) => error.name === "NoAnswer" && error.likely.at(-1) === "certificate not trusted");
  mode = "timeout";
  await assert.rejects(() => mailCall(bridgeAt(BRIDGE), "test", CONNECTION, {}), rejection("Timeout"));
});
