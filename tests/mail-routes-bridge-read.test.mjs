// The Bridge route reads and finds mails and lists Drafts and Sent (ITM-834) — MOD-mail-routes' Mailbox operations read, find, drafts and
// sent on the Bridge route, as the accepted text of docs/architecture/MOD-mail-routes.md states them: "read(since) — the mails of the named
// folders, read without changing anything", "find(id) — the mail with this MAIL- identifier in the named folders ... null — not found in the
// mailbox — when none matches, never a guess", "drafts() -> { ref: DraftRef, inReplyTo, mail }[] and sent(since) -> Mail[]", failing with
// the Bridge route's BridgeUnavailable, NoEncryption, LoginRefused, FolderNotFound and Unreachable. For UC-038.
// Run: node --test tests/mail-routes-bridge-read.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// Level: unit
//
// The Bridge is a fake behind `fetch`, reached with MOD-bridge-client's real bridgeAt and mailCall; its answers are those the Bridge
// (MOD-mail-protocols) gives: read -> Mail[], find -> one Mail or the error `not-found` whose message begins with the identifier, drafts ->
// { ref, inReplyTo, mail }[], sent -> Mail[]. Values the module file leaves open, and the reading this file takes (the pull request names them):
//   - the arguments of the request: { since } for read and sent (null when none), { id } for find, {} for drafts;
//   - find's miss is the Bridge's `not-found` whose message begins with the asked identifier; a `not-found` that names a folder of the
//     connection is FolderNotFound with that `folder`;
//   - the answers are returned as the Bridge gave them, field for field.
// Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { bridgeAt } from "../src/bridge-client/index.mjs";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { mailbox } = mailRoutes;

const PASSWORD = "mail-password-constructed-834";
const BRIDGE_TOKEN = "bridge-token-constructed-834";
globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

const CONNECTION = { address: "reports@example.org", route: "imap", folders: ["INBOX", "Reports"], places: [],
  imap: { bridge: "lab-pc", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" },
    smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: PASSWORD } };
const BRIDGE = bridgeAt({ address: "http://127.0.0.1:4711", token: BRIDGE_TOKEN });

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const failure = (error, message, status = 502) => () => json({ error, message }, status);

const mail = (n, extra = {}) => ({ id: `MAIL-00000${n}`, messageId: `<m${n}@example.org>`, inReplyTo: null, references: [],
  from: { name: "Rita Reporter", address: "rita@example.net" }, replyTo: [], to: [{ name: null, address: "reports@example.org" }], cc: [],
  subject: `Report ${n}`, date: `2026-10-0${n}T09:00:00.000Z`, text: `Text of report ${n}`, attachments: [{ name: "log.txt", type: "text/plain", size: 4, text: "log\n" }],
  folder: "INBOX", ...extra });

function fakeBridge(answer) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? null });
    const given = typeof answer === "function" ? answer(requests.length) : answer;
    if (given instanceof Error) throw given;
    return given;
  };
  return requests;
}

// One request, POST to /v1/mail/<operation>, the connection with its password in the body only, the token in a header.
function assertOneRequest(requests, operation, args) {
  assert.equal(requests.length, 1, "exactly one request");
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].address, `http://127.0.0.1:4711/v1/mail/${operation}`);
  assert.deepEqual(JSON.parse(requests[0].body), { connection: CONNECTION, args });
  assert.ok(Object.values(requests[0].headers).includes(BRIDGE_TOKEN), "the Bridge's token in a header");
  assert.ok(!requests[0].address.includes(PASSWORD), "no password in the address");
  assert.ok(!JSON.stringify(requests[0].headers).includes(PASSWORD), "no password in a header");
}

// TST-483401 · level: unit · module: MOD-mail-routes
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; UC-038
// given: a fake Bridge that answers the operation read with two Mails
// input: mailbox(connection of the Bridge route, bridge).read(null), then .read("2026-10-02T00:00:00.000Z")
// expect: both Mails returned as the Bridge gave them; one request each, POST /v1/mail/read, body { connection, args: { since: null } } and { since: "2026-10-02T00:00:00.000Z" }
test("read — on the Bridge route: one read call with the date, and the Bridge's Mails returned", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const given = [mail(1), mail(2, { folder: "Reports" })];
  let requests = fakeBridge(() => json(given));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).read(null), given);
  assertOneRequest(requests, "read", { since: null });
  requests = fakeBridge(() => json(given));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).read("2026-10-02T00:00:00.000Z"), given);
  assertOneRequest(requests, "read", { since: "2026-10-02T00:00:00.000Z" });
});

// TST-483402 · level: unit · module: MOD-mail-routes
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-038
// given: a fake Bridge that answers find with the Mail of the identifier MAIL-000002
// input: mailbox(connection of the Bridge route, bridge).find("MAIL-000002")
// expect: the Mail as the Bridge gave it; one request, POST /v1/mail/find, body { connection, args: { id: "MAIL-000002" } }
test("find — on the Bridge route: the mail of a known identifier", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const given = mail(2);
  const requests = fakeBridge(() => json(given));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).find("MAIL-000002"), given);
  assertOneRequest(requests, "find", { id: "MAIL-000002" });
});

// TST-483403 · level: unit · module: MOD-mail-routes
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-038
// given: a fake Bridge that answers find for an unknown identifier with its error not-found, whose message begins with that identifier
// input: mailbox(connection of the Bridge route, bridge).find("MAIL-000099")
// expect: null — nothing thrown, no other mail; one request, POST /v1/mail/find
test("find — on the Bridge route: null for an identifier the Bridge does not find", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(failure("not-found", "MAIL-000099: no mail with this identifier in INBOX, Reports", 404));
  assert.equal(await mailbox(CONNECTION, BRIDGE).find("MAIL-000099"), null);
  assertOneRequest(requests, "find", { id: "MAIL-000099" });
});

// TST-483404 · level: unit · module: MOD-mail-routes
// guards: UC-038; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: a fake Bridge that answers drafts with two entries { ref: { route: "bridge", uid, uidValidity }, inReplyTo, mail }
// input: mailbox(connection of the Bridge route, bridge).drafts()
// expect: the two entries as the Bridge gave them, each ref { route: "bridge", uid: 7, uidValidity: 1 } and { route: "bridge", uid: 9, uidValidity: 1 }, inReplyTo "<m1@example.org>" and null; one request, POST /v1/mail/drafts, args {}
test("drafts — on the Bridge route: each draft with its DraftRef of the route bridge", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const given = [
    { ref: { route: "bridge", uid: 7, uidValidity: 1 }, inReplyTo: "<m1@example.org>", mail: mail(3, { inReplyTo: "<m1@example.org>", folder: "Drafts" }) },
    { ref: { route: "bridge", uid: 9, uidValidity: 1 }, inReplyTo: null, mail: mail(4, { folder: "Drafts" }) },
  ];
  const requests = fakeBridge(() => json(given));
  const answer = await mailbox(CONNECTION, BRIDGE).drafts();
  assert.deepEqual(answer, given);
  assert.deepEqual(answer.map((draft) => draft.ref), [{ route: "bridge", uid: 7, uidValidity: 1 }, { route: "bridge", uid: 9, uidValidity: 1 }]);
  assertOneRequest(requests, "drafts", {});
});

// TST-483405 · level: unit · module: MOD-mail-routes
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: a fake Bridge that answers sent with one Mail of the folder Sent
// input: mailbox(connection of the Bridge route, bridge).sent("2026-10-01T00:00:00.000Z")
// expect: the Mail as the Bridge gave it; one request, POST /v1/mail/sent, body { connection, args: { since: "2026-10-01T00:00:00.000Z" } }
test("sent — on the Bridge route: the Mails of Sent since a date", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const given = [mail(5, { folder: "Sent" })];
  const requests = fakeBridge(() => json(given));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).sent("2026-10-01T00:00:00.000Z"), given);
  assertOneRequest(requests, "sent", { since: "2026-10-01T00:00:00.000Z" });
});

const CALLS = [
  ["read", (box) => box.read(null)],
  ["find", (box) => box.find("MAIL-000002")],
  ["drafts", (box) => box.drafts()],
  ["sent", (box) => box.sent(null)],
];

// TST-483406 · level: unit · module: MOD-mail-routes
// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// given: a fake Bridge that fails with a mail server's answer, for each of the four operations
// input: read(null), find(id), drafts(), sent(null) of mailbox(connection of the Bridge route, bridge)
// expect: each makes exactly one request; each rejects; the password stands in no thrown error — not in its name, message or fields — and in no address or header
test("read, find, drafts, sent — on the Bridge route: the password in no error and in no request but the body", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  for (const [operation, call] of CALLS) {
    const requests = fakeBridge(failure("upstream-failed", "connection reset by peer"));
    let thrown;
    await call(mailbox(CONNECTION, BRIDGE)).catch((error) => { thrown = error; });
    assert.ok(thrown, `${operation}: rejects`);
    assert.equal(requests.length, 1, `${operation}: one request`);
    assert.equal(requests[0].address, `http://127.0.0.1:4711/v1/mail/${operation}`);
    assert.ok(JSON.parse(requests[0].body).connection.imap.password === PASSWORD, `${operation}: the password is in the body`);
    assert.ok(!requests[0].address.includes(PASSWORD) && !JSON.stringify(requests[0].headers).includes(PASSWORD), `${operation}: not elsewhere in the request`);
    assert.ok(!JSON.stringify({ name: thrown.name, message: thrown.message, ...thrown }).includes(PASSWORD), `${operation}: not in the error`);
  }
});

const FAILS = [
  ["a Bridge without a token", bridgeAt({ address: "http://127.0.0.1:4711" }), () => json({}), "BridgeUnavailable", (error) => assert.match(error.reason, /token/i)],
  ["a Bridge that gives no answer", BRIDGE, () => new TypeError("fetch failed"), "BridgeUnavailable", (error) => assert.match(error.reason, /gave no answer/)],
  ["a Bridge that refuses the token", BRIDGE, () => json({ error: "token-refused", message: "no" }, 401), "BridgeUnavailable", (error) => assert.match(error.reason, /refused its pairing token/)],
  ["a request that times out", BRIDGE, () => Object.assign(new Error("timed out"), { name: "TimeoutError" }), "BridgeUnavailable", (error) => assert.match(error.reason, /timed out/)],
  ["a paused Bridge", BRIDGE, failure("paused", "The Bridge is paused.", 503), "BridgeUnavailable", (error) => assert.match(error.reason, /paused/)],
  ["a mail server that offers no TLS", BRIDGE, failure("no-encryption", "imap.example.org:993 offers no TLS; no login was sent."), "NoEncryption", (error) => assert.equal(error.server, "imap.example.org")],
  ["a login the mail server refuses", BRIDGE, failure("login-refused", "AUTHENTICATIONFAILED Invalid credentials"), "LoginRefused", (error) => assert.equal(error.answer, "AUTHENTICATIONFAILED Invalid credentials")],
  ["a folder the mail server does not have", BRIDGE, failure("not-found", "Reports: Mailbox doesn't exist: Reports", 404), "FolderNotFound", (error) => assert.equal(error.folder, "Reports")],
  ["a mail server that fails", BRIDGE, failure("upstream-failed", "connection reset by peer"), "Unreachable", (error) => assert.match(error.reason, /connection reset by peer/)],
];
for (const [what, bridge, answer, name, check] of FAILS) {
  // TST-483407 · level: unit · module: MOD-mail-routes
  // guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; UC-038
  // given: a fake Bridge that fails, each time as Access's client names the failure
  // input: read(null), find(id), drafts() and sent(null) of mailbox(connection of the Bridge route, bridge), for each
  // expect: for all four the error of the file — BridgeUnavailable with Access's reason for no token, no answer, a refused token, a timeout and a paused Bridge; NoEncryption naming the server; LoginRefused with the server's answer; FolderNotFound naming the folder; Unreachable with the mail server's message — and nothing else
  test(`read, find, drafts, sent — on the Bridge route: ${what} is answered with ${name}`, async () => {
    assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
    for (const [operation, call] of CALLS) {
      fakeBridge(answer);
      await assert.rejects(call(mailbox(CONNECTION, bridge)), (error) => {
        assert.equal(error.name, name, operation);
        check(error);
        return true;
      });
    }
  });
}
