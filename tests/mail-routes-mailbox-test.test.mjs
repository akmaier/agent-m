// A mailbox tested on both routes (ITM-425) — MOD-mail-routes' mailbox(connection, bridge) and, of Mailbox, test(), as the accepted
// text of docs/architecture/MOD-mail-routes.md states them: "mailbox(connection, bridge) — the mailbox on the connection's route;
// bridge is Access's Bridge from bridgeAt for the Bridge the connection names, and is needed only on the Bridge route. Errors:
// BridgeNeeded on the Bridge route without one", and "test() — the number of mails in each named folder, whether Drafts and Sent were
// found, and whether sending works — on the Bridge route an SMTP login over TLS that sends nothing —; changes nothing", failing with
// SignInExpired, PermissionDeclined, Throttled, Unreachable, BridgeUnavailable with the reason Access names, and, on the Bridge route,
// the Bridge's NoEncryption naming the server, LoginRefused with the server's answer, and FolderNotFound. For UC-037 step 7, 7a to 7d, 3b.
// Run: node --test tests/mail-routes-mailbox-test.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-037; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; READING THE MAILBOX CHANGES NOTHING IN IT; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// Level: unit
//
// Microsoft Graph is a fake `fetch` of the tests' own, which records every request, with a stand-in for the sign-in library's client
// (globalThis.msal) that holds the account and hands out the token from its cache. The Bridge is a fake behind the same `fetch`, reached
// with MOD-bridge-client's real bridgeAt and mailCall: its answers are those bridgeApi defines. The module file does not say which
// resources of Graph test() reads, what the answer's fields hold beyond their names, or by what a Bridge error is told from another; where it
// leaves a reading open, this file takes the one below, and the pull request names it:
//   - Graph: the mails in a folder are read from its resource — INBOX from `/me/mailFolders/inbox`, any other named folder from the
//     top-level folder of that display name — as `totalItemCount`; Drafts and Sent are found when `/me/mailFolders/drafts` and
//     `/me/mailFolders/sentitems` answer; the token is silently taken from the library's cache for exactly the three scopes; sending
//     works when the token's scopes hold Mail.Send. Every request is a GET.
//   - The answer's `counts` has one key for each folder as the connection names it, `route` is "graph" or "imap", `encryption` a text.
//   - Bridge: test() calls mailCall(bridge, "test", connection, {}) once and returns its answer as it is. The Bridge's failures map: no
//     token, no answer, a refused token or login to the jump host, a timeout and a paused Bridge — BridgeUnavailable with Access's own
//     message as `reason`; no-encryption — NoEncryption with the `server` the Bridge's message names; login-refused — LoginRefused with
//     the Bridge's message as `answer`; upstream-failed whose message says that a folder the connection names is missing —
//     FolderNotFound with that `folder`; any other upstream-failed — Unreachable with the message as `reason`.
// Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { bridgeAt } from "../src/bridge-client/index.mjs";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { mailbox } = mailRoutes;

const GRAPH = "https://graph.microsoft.com/v1.0";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.SECRET-GRAPH-TOKEN";
const PASSWORD = "mail-password-constructed-001";
const BRIDGE_TOKEN = "bridge-token-constructed-002";
const SCOPES = ["Mail.ReadWrite", "Mail.Send", "offline_access"];

globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

const GRAPH_CONNECTION = { address: "reports@example.org", route: "graph", folders: ["INBOX", "Reports"], places: [],
  graph: { clientId: "11111111-2222-3333-4444-555555555555", account: "reports@example.org" } };
const BRIDGE_CONNECTION = { address: "reports@example.org", route: "imap", folders: ["INBOX", "Reports"], places: [],
  imap: { bridge: "lab-pc", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" },
    smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: PASSWORD } };
const BRIDGE = bridgeAt({ address: "http://127.0.0.1:4711", token: BRIDGE_TOKEN });

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
const failure = (error, message, status) => json({ error, message }, status);

// ---------------------------------------------------------------- Microsoft Graph

// The stand-in for the library's client, with the signed-in account and the token its cache holds.
function signedIn({ granted = SCOPES } = {}) {
  const seen = { silent: [], configs: [] };
  globalThis.msal = {
    createStandardPublicClientApplication: async (config) => seen.configs.push(structuredClone(config)) && ({
      getAllAccounts: () => [{ username: "reports@example.org", homeAccountId: "x.y" }],
      acquireTokenSilent: async (request) => { seen.silent.push(structuredClone(request)); return { accessToken: TOKEN, scopes: granted, account: { username: "reports@example.org" } }; },
    }),
  };
  return seen;
}

// A fake Microsoft Graph. folders: top-level folders by display name, with their number of mails. Every request is recorded.
function fakeGraph({ folders = { Reports: 7 }, inbox = 42 } = {}) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? null });
    const url = new URL(String(address));
    const path = decodeURIComponent(url.pathname).replace("/v1.0", "");
    if (path === "/me/mailFolders/inbox") return json({ id: "AAA1", totalItemCount: inbox });
    if (path === "/me/mailFolders/drafts" || path === "/me/mailFolders/sentitems") return json({ id: "AAA2" });
    if (path === "/me/mailFolders") {
      const name = /displayName eq '(.*)'/.exec(url.searchParams.get("$filter") ?? "")?.[1]?.replaceAll("''", "'");
      return json({ value: name in folders ? [{ id: "AAA3", displayName: name, totalItemCount: folders[name] }] : [] });
    }
    return json({ error: { code: "ErrorInvalidIdMalformed" } }, 404);
  };
  return requests;
}

// guards: UC-037 (7); A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: a fake Microsoft Graph that holds INBOX with 42 mails and Reports with 7, and finds Drafts and Sent; the stand-in for the
//        library's client, signed in as reports@example.org with all three scopes
// input: mailbox(connection of the Microsoft route, null).test()
// expect: { counts: { INBOX: 42, Reports: 7 }, drafts: true, sent: true, sending: "works", route: "graph", encryption: a text }; and,
//         for a sign-in whose token lacks Mail.Send, `sending` is not "works" but a text that says why
test("test — on the Microsoft route: the mails in each named folder, Drafts and Sent found, sending works", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  fakeGraph();
  const answer = await mailbox(GRAPH_CONNECTION, null).test();
  assert.deepEqual(answer.counts, { INBOX: 42, Reports: 7 });
  assert.equal(answer.drafts, true);
  assert.equal(answer.sent, true);
  assert.equal(answer.sending, "works");
  assert.equal(answer.route, "graph");
  assert.equal(typeof answer.encryption, "string");
  assert.ok(answer.encryption.length > 0);
  signedIn({ granted: ["Mail.ReadWrite", "offline_access"] });
  const without = await mailbox(GRAPH_CONNECTION, null).test();
  assert.notEqual(without.sending, "works");
  assert.match(without.sending, /Mail\.Send/);
});

// guards: THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the fake Graph and the stand-in whose cache holds the token
// input: mailbox(connection of the Microsoft route, null).test()
// expect: the token asked of the library's cache silently, for exactly the three scopes and the account; every request goes to Microsoft
//         Graph's version 1.0 address and carries the token only as `Bearer <token>` in its authorisation header; the token stands in no
//         address and no body; no request goes anywhere else, and none to a Bridge
test("test — on the Microsoft route: the token only in the authorisation header of requests to Microsoft Graph", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const seen = signedIn();
  const requests = fakeGraph();
  await mailbox(GRAPH_CONNECTION, null).test();
  assert.equal(seen.silent.length, 1, "the token is asked of the cache once");
  assert.deepEqual([...seen.silent[0].scopes].sort(), [...SCOPES].sort());
  assert.equal(seen.silent[0].account.username, "reports@example.org");
  assert.ok(requests.length >= 4, "the folders, Drafts and Sent are read");
  for (const request of requests) {
    assert.ok(request.address.startsWith(`${GRAPH}/`), `${request.address}: to Microsoft Graph`);
    assert.equal(request.headers.Authorization, `Bearer ${TOKEN}`, "the token in the authorisation header");
    assert.ok(!request.address.includes("SECRET") && !request.address.includes("access_token"), "no token in the address");
    assert.equal(request.body, null, "no body");
  }
});

// guards: READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fake Graph, which records the method of every request
// input: mailbox(connection of the Microsoft route, null).test()
// expect: every request is a GET, and none is made to a message, a draft's send, a move, a copy or a deletion: no request changes a message
test("test — on the Microsoft route: no request changes a message", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const requests = fakeGraph();
  await mailbox(GRAPH_CONNECTION, null).test();
  assert.ok(requests.length > 0, "known positive: requests were made");
  assert.deepEqual([...new Set(requests.map((request) => request.method))], ["GET"]);
  for (const request of requests) {
    assert.ok(!/\/messages|\/send|\/move|\/copy|\/forward|\/reply|\/sendMail|\/attachments/i.test(decodeURIComponent(new URL(request.address).pathname)), request.address);
  }
});

// ---------------------------------------------------------------- the Bridge

// A fake Bridge behind fetch. answer: what it answers to the request (a Response, or a function of the request), or an error to throw.
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

// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; UC-037 (7)
// given: a fake Bridge that answers the operation test with { counts, drafts, sent, sending, route, encryption }
// input: mailbox(connection of the Bridge route, bridge).test()
// expect: one request, POST to /v1/mail/test on the Bridge, whose JSON body is { connection, args: {} } with the connection and its
//         password; the Bridge's token in its header; the password in the body only, in no address and no header; the answer returned as
//         the Bridge gave it
test("test — on the Bridge route: one test call with the connection, and the Bridge's answer returned", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const given = { counts: { INBOX: 42, Reports: 7 }, drafts: true, sent: true, sending: "works", route: "imap", encryption: "TLS 1.3" };
  const requests = fakeBridge(() => json(given));
  const answer = await mailbox(BRIDGE_CONNECTION, BRIDGE).test();
  assert.deepEqual(answer, given);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].address, "http://127.0.0.1:4711/v1/mail/test");
  assert.deepEqual(JSON.parse(requests[0].body), { connection: BRIDGE_CONNECTION, args: {} });
  assert.ok(JSON.parse(requests[0].body).connection.imap.password === PASSWORD, "the password is in the body");
  assert.ok(Object.values(requests[0].headers).includes(BRIDGE_TOKEN), "the Bridge's token in a header");
  assert.ok(!requests[0].address.includes(PASSWORD), "no password in the address");
  assert.ok(!JSON.stringify(requests[0].headers).includes(PASSWORD), "no password in a header");
});

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// given: a fake Bridge that fails, each time as Access's client names the failure
// input: mailbox(connection of the Bridge route, bridge).test() for each
// expect: the error of the file — BridgeUnavailable with Access's reason for no token, no answer, a refused token, a timeout and a paused
//         Bridge; NoEncryption naming the server; LoginRefused with the server's answer; FolderNotFound naming the folder; Unreachable
//         with the mail server's message — and nothing else
const MESSAGE = (error, message, status = 502) => () => failure(error, message, status);
for (const [what, bridge, answer, name, check] of [
  ["a Bridge without a token", bridgeAt({ address: "http://127.0.0.1:4711" }), () => json({}), "BridgeUnavailable", (error) => assert.match(error.reason, /token/i)],
  ["a Bridge that gives no answer", BRIDGE, () => new TypeError("fetch failed"), "BridgeUnavailable", (error) => assert.match(error.reason, /gave no answer/)],
  ["a Bridge that refuses the token", BRIDGE, () => json({ error: "token-refused", message: "no" }, 401), "BridgeUnavailable", (error) => assert.match(error.reason, /refused its pairing token/)],
  ["a request that times out", BRIDGE, () => Object.assign(new Error("timed out"), { name: "TimeoutError" }), "BridgeUnavailable", (error) => assert.match(error.reason, /timed out/)],
  ["a paused Bridge", BRIDGE, MESSAGE("paused", "The Bridge is paused.", 503), "BridgeUnavailable", (error) => assert.match(error.reason, /paused/)],
  ["a mail server that offers no TLS", BRIDGE, MESSAGE("no-encryption", "imap.example.org offers no TLS; no login was sent."), "NoEncryption",
    (error) => assert.equal(error.server, "imap.example.org")],
  ["a mail server of the outgoing mail that offers no TLS", BRIDGE, MESSAGE("no-encryption", "smtp.example.org offers no TLS; no login was sent."), "NoEncryption",
    (error) => assert.equal(error.server, "smtp.example.org")],
  ["a login the mail server refuses", BRIDGE, MESSAGE("login-refused", "AUTHENTICATIONFAILED Invalid credentials"), "LoginRefused",
    (error) => assert.equal(error.answer, "AUTHENTICATIONFAILED Invalid credentials")],
  ["a folder the mail server does not have", BRIDGE, MESSAGE("upstream-failed", "Mailbox doesn't exist: Reports"), "FolderNotFound", (error) => assert.equal(error.folder, "Reports")],
  ["a mail server that fails", BRIDGE, MESSAGE("upstream-failed", "connection reset by peer"), "Unreachable", (error) => assert.match(error.reason, /connection reset by peer/)],
]) {
  test(`test — on the Bridge route: ${what} is answered with ${name}`, async () => {
    assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
    fakeBridge(answer);
    await assert.rejects(mailbox(BRIDGE_CONNECTION, bridge).test(), (error) => {
      assert.equal(error.name, name);
      check(error);
      return true;
    });
  });
}

// guards: A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: a connection of the Bridge route and a connection of the Microsoft route
// input: mailbox(Bridge connection, null); mailbox(Bridge connection, bridge); mailbox(Microsoft connection, null)
// expect: BridgeNeeded for the first, thrown before any request; no error for the other two: a Bridge is needed on the Bridge route only
test("mailbox — BridgeNeeded on the Bridge route without a Bridge", () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(() => json({}));
  assert.throws(() => mailbox(BRIDGE_CONNECTION, null), (error) => error.name === "BridgeNeeded");
  assert.equal(requests.length, 0, "no request");
  assert.doesNotThrow(() => mailbox(BRIDGE_CONNECTION, BRIDGE));
  assert.doesNotThrow(() => mailbox(GRAPH_CONNECTION, null));
});

// guards: AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN; UC-037
// given: the stand-in; a connection whose account is reports@example.org; one whose account has no domain but whose address is reports@uni.example.de;
//        one with neither
// input: mailbox(connection, null).test() for each
// expect: the library's client made at the tenant of the account's domain (https://login.microsoftonline.com/example.org), else of the address's
//         (.../uni.example.de); with neither a MailAddressNeeded asking for the mail address, before any client is made; never /common
test("test — the silent token is taken at the tenant of the stored account, else of the address", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  fakeGraph();
  let seen = signedIn();
  await mailbox(GRAPH_CONNECTION, null).test();
  assert.equal(seen.configs[0].auth.authority, "https://login.microsoftonline.com/example.org");
  seen = signedIn();
  await mailbox({ ...GRAPH_CONNECTION, address: "reports@Uni.Example.DE", graph: { ...GRAPH_CONNECTION.graph, account: "reports" } }, null).test().catch(() => {});
  assert.equal(seen.configs[0].auth.authority, "https://login.microsoftonline.com/uni.example.de");
  seen = signedIn();
  await assert.rejects(mailbox({ ...GRAPH_CONNECTION, address: "", graph: { ...GRAPH_CONNECTION.graph, account: "reports" } }, null).test(),
    (error) => error.name === "MailAddressNeeded" && /mail address/i.test(error.message));
  assert.equal(seen.configs.length, 0, "no client made");
});
