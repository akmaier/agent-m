// The Microsoft Graph route keeps a reply draft and sends only the mail shown (ITM-837) — MOD-mail-routes' Mailbox operations storeDraft,
// updateDraft, showDraft and sendDraft on the Graph route, as the accepted text of docs/architecture/MOD-mail-routes.md states them:
// "storeDraft(draft) — the reply stored in Drafts and nowhere else. Errors: NoReplyAddress when the mail's reply address is missing or invalid",
// "updateDraft(ref, draft) — an edit saved to the draft", "showDraft(ref) — the draft as it is stored, complete, with the SHA-256 of its bytes",
// "sendDraft(shown) — sends the draft only if its bytes still have the SHA-256 of the mail shown. On the Graph route the provider sends it,
// keeps the copy in Sent and removes the draft. Errors: DraftChanged — nothing sent"; Draft: "addressed to one reporter only; the route sets
// In-Reply-To and References from the mail's Message-ID"; DraftRef { route: "graph", id }. For UC-039.
// Run: node --test tests/mail-routes-graph-draft.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-039; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
// Level: unit
//
// Microsoft Graph is a fake `fetch` of the tests' own, with the stand-in for the sign-in library's client (globalThis.msal), as
// tests/mail-routes-graph-read.test.mjs has them. The module file leaves open which requests of Graph store, change and send a draft; this
// file takes the reading below and the pull request names it. The tests assert the mails (the bytes the fake holds), the number and the order of
// the requests, and their origin and header, nothing more:
//   - a draft is stored by `POST /me/messages` whose body is the mail in its raw form (Content-Type text/plain, base64), Graph's request form
//     for creating a message from MIME; the fake answers 201 with the new message's `id`, and holds the bytes it was given as the draft;
//   - the draft as stored is read from `/me/messages/<id>/$value` (as ITM-836 reads a mail), the SHA-256 is that of those bytes;
//   - a draft is sent by `POST /me/messages/<id>/send` (Graph answers 202), which is the provider's send, Sent copy and removal of the draft;
//   - an edit stores the new draft and removes the old one by `DELETE /me/messages/<id>`, and only a draft carrying the mark Agent M sets on
//     the drafts it stores (`X-Agent-M-Draft`, as the Bridge's drafts) — a draft of the person's own, written by hand, is not removed;
//   - which reply addresses are "usable" is not fixed: only an address that is missing, empty, without "@" or several in one is asserted to
//     fail with NoReplyAddress; no other value is asserted.
// Nothing reaches the network, no mail is sent. Each test states its input and its expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { mailbox } = mailRoutes;

const GRAPH = "https://graph.microsoft.com/v1.0";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.SECRET-GRAPH-TOKEN-837";
const SCOPES = ["Mail.ReadWrite", "Mail.Send", "offline_access"];

globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

const CONNECTION = { address: "reports@example.org", route: "graph", folders: ["INBOX"], places: [],
  graph: { clientId: "11111111-2222-3333-4444-555555555555", account: "reports@example.org" } };

const REPORT = { id: "MAIL-0000000000000001", messageId: "<in-1@example.net>", inReplyTo: null, references: ["<earlier@example.net>"],
  from: { name: "Ada Reporter", address: "ada@example.net" }, replyTo: [], to: [{ name: null, address: "reports@example.org" }], cc: [],
  subject: "Broken link", date: "2026-10-05T09:00:00.000Z", text: "The link on page 3 is dead.", attachments: [], folder: "INBOX" };
const DRAFT = { replyTo: REPORT, to: { name: "Ada Reporter", address: "ada@example.net" }, subject: "Re: Broken link", body: "Thank you, we have fixed it." };

function signedIn() {
  globalThis.msal = {
    createStandardPublicClientApplication: async () => ({
      getAllAccounts: () => [{ username: "reports@example.org", homeAccountId: "x.y" }],
      acquireTokenSilent: async () => ({ accessToken: TOKEN, scopes: SCOPES, account: { username: "reports@example.org" } }),
    }),
  };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// A hand-written draft of the person's own: no mark of Agent M's.
const FOREIGN = ["Message-ID: <hand@example.org>", "From: reports@example.org", "To: someone@example.net", "Subject: My own draft", "Date: Mon, 05 Oct 2026 12:00:00 +0000",
  "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", "Not Agent M's.", ""].join("\r\n");

// A fake Microsoft Graph holding the Drafts folder (id -> raw form) and the Sent folder; every request is recorded. `drafts` seeds Drafts.
function fakeGraph(seed = {}) {
  const requests = [];
  const graph = { requests, drafts: { ...seed }, sent: {}, created: 0 };
  globalThis.fetch = async (address, init = {}) => {
    const request = { address: String(address), method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? null };
    requests.push(request);
    const url = new URL(request.address);
    if (url.origin !== "https://graph.microsoft.com") return json({});
    const path = decodeURIComponent(url.pathname).replace("/v1.0", "");
    if (request.method === "POST" && path === "/me/messages") {
      if (request.headers["Content-Type"] !== "text/plain") return json({ error: { code: "ErrorInvalidRequest" } }, 400);
      const id = `AAMk-new-${++graph.created}=`;
      graph.drafts[id] = Buffer.from(String(request.body), "base64").toString("utf8");
      return json({ id }, 201);
    }
    const one = /^\/me\/messages\/([^/]+)(\/\$value|\/send)?$/.exec(path);
    if (!one || !graph.drafts[one[1]]) return json({ error: { code: "ErrorItemNotFound" } }, 404);
    if (request.method === "GET" && one[2] === "/$value") return new Response(graph.drafts[one[1]], { status: 200, headers: { "Content-Type": "text/plain" } });
    if (request.method === "DELETE" && !one[2]) { delete graph.drafts[one[1]]; return new Response(null, { status: 204 }); }
    if (request.method === "POST" && one[2] === "/send") {
      graph.sent[one[1]] = graph.drafts[one[1]];
      delete graph.drafts[one[1]];
      return new Response(null, { status: 202 });
    }
    return json({ error: { code: "ErrorInvalidRequest" } }, 400);
  };
  return graph;
}

// The header lines of raw bytes (unfolded) and the recipients named in a header.
const headerLines = (raw) => raw.split(/\r?\n\r?\n/)[0].replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/);
const header = (raw, name) => headerLines(raw).filter((line) => line.toLowerCase().startsWith(`${name.toLowerCase()}:`)).map((line) => line.slice(name.length + 1).trim());
const bodyOf = (raw) => Buffer.from(raw.split(/\r?\n\r?\n/)[1].replace(/\s+/g, ""), "base64").toString("utf8");
const sendRequests = (graph) => graph.requests.filter((request) => request.method === "POST" && /\/send$/.test(request.address));
const sha = (raw) => createHash("sha256").update(raw).digest("hex");

// TST-483701 · level: unit · module: MOD-mail-routes
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; UC-039
// given: a fake Microsoft Graph with an empty Drafts folder; a mail <in-1@example.net> with the references [<earlier@example.net>] and a Draft replying to it, addressed to Ada Reporter alone
// input: mailbox(connection of the Microsoft route, null).storeDraft(draft); then .showDraft(the DraftRef it returned)
// expect: the DraftRef { route: "graph", id } of the one new message in Drafts, and no other message anywhere; the stored bytes have exactly one To, ada@example.net, no Cc and no Bcc, In-Reply-To <in-1@example.net> and References <earlier@example.net> <in-1@example.net>, the subject "Re: Broken link" and the body; showDraft gives the ShownMail with that ref, the sha256 of exactly the stored bytes, to [{ address: "ada@example.net" }], the subject and the body text; nothing was sent
test("storeDraft and showDraft — on the Microsoft route: one reply in Drafts to the one reporter, threaded, shown with the SHA-256 of its stored bytes", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph();
  const box = mailbox(CONNECTION, null);
  const ref = await box.storeDraft(DRAFT);
  assert.deepEqual(Object.keys(graph.drafts), [ref.id]);
  assert.deepEqual(ref, { route: "graph", id: ref.id });
  assert.deepEqual(graph.sent, {});
  const stored = graph.drafts[ref.id];
  assert.equal(header(stored, "To").length, 1);
  assert.match(header(stored, "To")[0], /ada@example\.net/);
  assert.doesNotMatch(header(stored, "To")[0], /,/);
  assert.deepEqual([header(stored, "Cc"), header(stored, "Bcc")], [[], []]);
  assert.deepEqual(header(stored, "In-Reply-To"), ["<in-1@example.net>"]);
  assert.deepEqual(header(stored, "References"), ["<earlier@example.net> <in-1@example.net>"]);
  assert.deepEqual(header(stored, "Subject"), ["Re: Broken link"]);
  assert.match(stored, /^X-Agent-M-Draft: 1\r?$/m);
  const shown = await box.showDraft(ref);
  assert.deepEqual(shown.ref, ref);
  assert.equal(shown.sha256, sha(stored));
  assert.deepEqual(shown.to.map((each) => each.address), ["ada@example.net"]);
  assert.deepEqual(shown.cc, []);
  assert.equal(shown.subject, "Re: Broken link");
  assert.match(shown.body, /Thank you, we have fixed it\./);
  assert.deepEqual(shown.attachments, []);
  assert.equal(sendRequests(graph).length, 0, "nothing was sent");
});

const NO_ADDRESS = [
  ["no address at all", { name: "Ada Reporter" }],
  ["no recipient at all", undefined],
  ["an empty address", { name: "Ada Reporter", address: "" }],
  ["an address without @", { name: "Ada Reporter", address: "ada.example.net" }],
  ["two addresses in one", { name: null, address: "ada@example.net, ruth@example.net" }],
  ["a list in place of the one reporter", [{ name: null, address: "ada@example.net" }, { name: null, address: "ruth@example.net" }]],
];
// TST-483702 · level: unit · module: MOD-mail-routes
// guards: A REPLY GOES TO ONE REPORTER; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039
// given: a fake Microsoft Graph with one draft of Agent M's; a Draft whose recipient is missing, empty, without "@", two addresses in one, or a list of two
// input: mailbox(connection of the Microsoft route, null).storeDraft(draft) and .updateDraft(ref of that draft, draft), for each such Draft
// expect: each rejects with the error NoReplyAddress; no request is a write — nothing is stored, nothing removed
test("storeDraft and updateDraft — on the Microsoft route: no usable reply address fails with NoReplyAddress and nothing is stored", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph({ "AAMk-own-1=": FOREIGN.replace("Subject:", "X-Agent-M-Draft: 1\r\nSubject:") });
  const box = mailbox(CONNECTION, null);
  for (const [what, to] of NO_ADDRESS) {
    await assert.rejects(box.storeDraft({ ...DRAFT, to }), (error) => error.name === "NoReplyAddress", `storeDraft: ${what}`);
    await assert.rejects(box.updateDraft({ route: "graph", id: "AAMk-own-1=" }, { ...DRAFT, to }), (error) => error.name === "NoReplyAddress", `updateDraft: ${what}`);
  }
  assert.deepEqual(graph.requests.filter((request) => request.method !== "GET"), [], "no write request");
  assert.deepEqual(Object.keys(graph.drafts), ["AAMk-own-1="], "the draft is still there");
});

// TST-483703 · level: unit · module: MOD-mail-routes
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a fake Microsoft Graph holding a stored draft that was shown; afterwards the draft's bytes are changed in the mailbox (its subject differs by one letter)
// input: mailbox(connection of the Microsoft route, null).sendDraft(the ShownMail from before the change)
// expect: rejects with DraftChanged; no send request was made and the draft is still in Drafts, nothing is in Sent
test("sendDraft — on the Microsoft route: a draft changed after it was shown is not sent and DraftChanged is thrown", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph();
  const box = mailbox(CONNECTION, null);
  const ref = await box.storeDraft(DRAFT);
  const shown = await box.showDraft(ref);
  graph.drafts[ref.id] = graph.drafts[ref.id].replace("Subject: Re:", "Subject: RE:");
  await assert.rejects(box.sendDraft(shown), (error) => error.name === "DraftChanged");
  assert.equal(sendRequests(graph).length, 0, "no send request");
  assert.deepEqual(Object.keys(graph.drafts), [ref.id]);
  assert.deepEqual(graph.sent, {});
});

// TST-483704 · level: unit · module: MOD-mail-routes
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039
// given: a fake Microsoft Graph holding a stored draft that was shown and is unchanged
// input: mailbox(connection of the Microsoft route, null).sendDraft(the ShownMail)
// expect: resolves with a sentAt that is an ISO time; exactly one send request, POST /me/messages/<id>/send of that draft, made after the draft's bytes were read again; the provider's send leaves the draft out of Drafts and the copy in Sent; the route itself removes nothing (no DELETE)
test("sendDraft — on the Microsoft route: the unchanged draft is sent with one send request", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph();
  const box = mailbox(CONNECTION, null);
  const ref = await box.storeDraft(DRAFT);
  const shown = await box.showDraft(ref);
  const before = graph.requests.length;
  const { sentAt } = await box.sendDraft(shown);
  assert.ok(Number.isFinite(Date.parse(sentAt)), "sentAt is a time");
  const mine = graph.requests.slice(before);
  assert.equal(sendRequests({ requests: mine }).length, 1, "exactly one send request");
  const send = mine.findIndex((request) => /\/send$/.test(request.address));
  assert.equal(decodeURIComponent(new URL(mine[send].address).pathname), `/v1.0/me/messages/${ref.id}/send`);
  assert.ok(mine.slice(0, send).some((request) => request.method === "GET" && request.address.includes("$value")), "the bytes were read again before the send");
  assert.deepEqual(Object.keys(graph.sent), [ref.id]);
  assert.deepEqual(graph.drafts, {});
  assert.equal(mine.filter((request) => request.method === "DELETE").length, 0, "the route removes nothing itself");
});

// TST-483705 · level: unit · module: MOD-mail-routes
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a fake Microsoft Graph with one draft of Agent M's and one hand-written draft of the person's (no mark)
// input: mailbox(connection of the Microsoft route, null).updateDraft(ref of Agent M's draft, a Draft with another body); then .updateDraft(ref of the hand-written draft, a Draft)
// expect: the first returns the DraftRef of a new draft that holds the new body, and the old draft is removed by one DELETE of that draft only; the second rejects (DraftChanged), the hand-written draft is still there, unchanged, and no DELETE of it and no other message was made; nothing is sent in either
test("updateDraft — on the Microsoft route: the edit replaces the instance's own draft only, never the person's hand-written one", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph();
  const box = mailbox(CONNECTION, null);
  const first = await box.storeDraft(DRAFT);
  graph.drafts["AAMk-hand=" ] = FOREIGN;
  const before = graph.requests.length;
  const second = await box.updateDraft(first, { ...DRAFT, body: "A better answer." });
  assert.equal(second.route, "graph");
  assert.notEqual(second.id, first.id);
  assert.match(bodyOf(graph.drafts[second.id]), /A better answer\./);
  assert.equal(graph.drafts[first.id], undefined, "the old draft of Agent M's is removed");
  const deletes = graph.requests.slice(before).filter((request) => request.method === "DELETE");
  assert.equal(deletes.length, 1);
  assert.equal(decodeURIComponent(new URL(deletes[0].address).pathname), `/v1.0/me/messages/${first.id}`);
  const mark = graph.requests.length;
  await assert.rejects(box.updateDraft({ route: "graph", id: "AAMk-hand=" }, DRAFT), (error) => error.name === "DraftChanged");
  assert.equal(graph.drafts["AAMk-hand="], FOREIGN, "the hand-written draft is untouched");
  assert.deepEqual(graph.requests.slice(mark).filter((request) => request.method !== "GET"), [], "no write request for it");
  assert.deepEqual(graph.sent, {});
});

// TST-483706 · level: unit · module: MOD-mail-routes
// guards: THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER PLACED IN A URL; UC-039
// given: the fake Graph, which records every request
// input: storeDraft, showDraft, updateDraft and sendDraft on the Microsoft route
// expect: every recorded request is to an address of https://graph.microsoft.com/v1.0 with the token only as `Bearer <token>` in its Authorization header; the token is in no address and in no body; no request goes to any other origin
test("storeDraft, showDraft, updateDraft, sendDraft — on the Microsoft route: only requests to Microsoft Graph, the token only in the authorisation header", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const graph = fakeGraph();
  const box = mailbox(CONNECTION, null);
  const ref = await box.storeDraft(DRAFT);
  const moved = await box.updateDraft(ref, { ...DRAFT, body: "Edited." });
  await box.sendDraft(await box.showDraft(moved));
  assert.ok(graph.requests.length >= 6, "known positive: requests were made");
  assert.ok(graph.requests.some((request) => request.method === "POST" && /\/send$/.test(request.address)), "known positive: a send was made");
  for (const request of graph.requests) {
    assert.ok(request.address.startsWith(`${GRAPH}/`), `${request.address}: to Microsoft Graph`);
    assert.equal(request.headers.Authorization, `Bearer ${TOKEN}`);
    assert.ok(!request.address.includes("SECRET") && !request.address.includes("access_token"), "no token in the address");
    assert.ok(!String(request.body ?? "").includes("SECRET"), "no token in a body");
  }
});
