// The Microsoft Graph route reads and finds mails and lists Drafts and Sent (ITM-836) — MOD-mail-routes' Mailbox operations read, find,
// drafts and sent on the Graph route, as the accepted text of docs/architecture/MOD-mail-routes.md states them: "read(since) — the mails of
// the named folders, read without changing anything", "find(id) — the mail with this MAIL- identifier in the named folders, found by hashing
// their mails' Message-IDs; null when none matches, never a guess", "drafts() -> { ref: DraftRef, inReplyTo, mail }[] and sent(since) ->
// Mail[]", with the failures SignInExpired, PermissionDeclined, Throttled and Unreachable; Mail and DraftRef { route: "graph", id }; the
// mails "for mails Microsoft Graph returns in their raw form" parsed by the vendored postal-mime; id the MAIL- identifier of MOD-mail-records.
// For UC-038.
// Run: node --test tests/mail-routes-graph-read.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
// Level: unit
//
// Microsoft Graph is a fake `fetch` of the tests' own, with the stand-in for the sign-in library's client (globalThis.msal), as
// tests/mail-routes-mailbox-test.test.mjs has them. The module file does not say which resources of Graph are read; this file takes the
// reading below, and the pull request names it. The test asserts the mails and the requests' method, address origin and header, nothing more:
//   - a folder's mails are listed from `<folder>/messages`, where INBOX is `/me/mailFolders/inbox`, Drafts `/me/mailFolders/drafts`, Sent
//     `/me/mailFolders/sentitems` and any other named folder the top-level folder of that display name, found by `/me/mailFolders?$filter=`;
//     the list gives each message's `id` and `internetMessageId`, and follows `@odata.nextLink` when it is an address of Microsoft Graph;
//   - a message's raw form is `/me/messages/<id>/$value`; it is parsed with postal-mime; `since` keeps the mails whose date is on or after it;
//   - find hashes the `internetMessageId`s of the named folders and fetches the raw form of the one that matches only;
//   - `folder` of a Mail is the name the connection gives, "Drafts" for Drafts, "Sent Items" for Sent.
// Nothing reaches the network. Each test states its input and its expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { mailbox } = mailRoutes;

const GRAPH = "https://graph.microsoft.com/v1.0";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.SECRET-GRAPH-TOKEN-836";
const SCOPES = ["Mail.ReadWrite", "Mail.Send", "offline_access"];

globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

const CONNECTION = { address: "reports@example.org", route: "graph", folders: ["INBOX", "Reports"], places: [],
  graph: { clientId: "11111111-2222-3333-4444-555555555555", account: "reports@example.org" } };

const identifier = (messageId) => `MAIL-${createHash("sha256").update(messageId.replace(/^<|>$/g, "")).digest("hex").slice(0, 16)}`;

function raw({ messageId, from, to, subject, date, text, inReplyTo = null, references = null }) {
  return [`Message-ID: ${messageId}`, `From: ${from}`, `To: ${to}`, `Subject: ${subject}`, `Date: ${date}`,
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`] : []), ...(references ? [`References: ${references}`] : []),
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", text, ""].join("\r\n");
}

// The fixture mails of the fake mailbox, each with the id Graph gives it and the folder it lies in.
const MAILS = {
  "AAMk-in-1=": { folder: "inbox", messageId: "<in-1@example.org>", raw: raw({ messageId: "<in-1@example.org>", from: "Ada Reporter <ada@example.net>",
    to: "reports@example.org", subject: "Broken link", date: "Mon, 05 Oct 2026 09:00:00 +0000", text: "The link on page 3 is dead." }) },
  "AAMk-in-2=": { folder: "inbox", messageId: "<in-2@example.org>", raw: raw({ messageId: "<in-2@example.org>", from: "Bo <bo@example.net>",
    to: "reports@example.org", subject: "Typo", date: "Tue, 13 Oct 2026 10:00:00 +0000", text: "A typo in the heading." }) },
  "AAMk-rep-1=": { folder: "REPORTS-ID", messageId: "<rep-1@example.org>", raw: raw({ messageId: "<rep-1@example.org>", from: "Cy <cy@example.net>",
    to: "reports@example.org", subject: "Report seven", date: "Wed, 07 Oct 2026 11:00:00 +0000", text: "Seventh report." }) },
  "AAMk-dr-1=": { folder: "drafts", messageId: "<dr-1@example.org>", raw: raw({ messageId: "<dr-1@example.org>", from: "reports@example.org",
    to: "Ada Reporter <ada@example.net>", subject: "Re: Broken link", date: "Mon, 05 Oct 2026 12:00:00 +0000", text: "Thank you, fixed.",
    inReplyTo: "<in-1@example.org>", references: "<in-1@example.org>" }) },
  "AAMk-se-1=": { folder: "sentitems", messageId: "<se-1@example.org>", raw: raw({ messageId: "<se-1@example.org>", from: "reports@example.org",
    to: "Bo <bo@example.net>", subject: "Re: Typo", date: "Wed, 14 Oct 2026 08:00:00 +0000", text: "Corrected." }) },
};

function signedIn() {
  globalThis.msal = {
    createStandardPublicClientApplication: async () => ({
      getAllAccounts: () => [{ username: "reports@example.org", homeAccountId: "x.y" }],
      acquireTokenSilent: async () => ({ accessToken: TOKEN, scopes: SCOPES, account: { username: "reports@example.org" } }),
    }),
  };
}

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

// A fake Microsoft Graph holding MAILS; every request is recorded. `trap`: the INBOX list carries a nextLink to this address.
// `status`: answers every request after the sign-in with this status, or throws when it is an Error.
function fakeGraph({ trap = null, status = null } = {}) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    requests.push({ address: String(address), method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? null });
    if (status instanceof Error) throw status;
    if (status) return json({ error: { code: "x" } }, status, status === 429 ? { "Retry-After": "17" } : {});
    const url = new URL(String(address));
    if (url.origin !== "https://graph.microsoft.com") return json({ value: [] });
    const path = decodeURIComponent(url.pathname).replace("/v1.0", "");
    if (path === "/me/mailFolders") {
      const name = /displayName eq '(.*)'/.exec(url.searchParams.get("$filter") ?? "")?.[1];
      return json({ value: name === "Reports" ? [{ id: "REPORTS-ID", displayName: name, totalItemCount: 1 }] : [] });
    }
    const list = /^\/me\/mailFolders\/([^/]+)\/messages$/.exec(path);
    if (list) {
      const folder = { inbox: "inbox", drafts: "drafts", sentitems: "sentitems", "REPORTS-ID": "REPORTS-ID" }[list[1]];
      if (!folder) return json({ error: { code: "ErrorItemNotFound" } }, 404);
      const all = Object.entries(MAILS).filter(([, mail]) => mail.folder === folder).map(([id, mail]) => ({ id, internetMessageId: mail.messageId }));
      if (folder === "inbox" && !url.searchParams.has("page")) {
        return json({ value: all.slice(0, 1), "@odata.nextLink": trap ?? `${GRAPH}/me/mailFolders/inbox/messages?page=2` });
      }
      return json({ value: folder === "inbox" ? all.slice(1) : all });
    }
    const one = /^\/me\/messages\/(.+)\/\$value$/.exec(path);
    if (one && MAILS[one[1]]) return new Response(MAILS[one[1]].raw, { status: 200, headers: { "Content-Type": "text/plain" } });
    return json({ error: { code: "ErrorItemNotFound" } }, 404);
  };
  return requests;
}

const rawFetched = (requests) => requests.filter((request) => request.address.includes("/$value") || request.address.includes("%24value"));

// TST-478301 · level: unit · module: MOD-mail-routes
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: a fake Microsoft Graph whose INBOX lists two mails over two pages (the first page names the second by @odata.nextLink) and whose folder Reports holds one; the stand-in signed in with all three scopes
// input: mailbox(connection of the Microsoft route with folders INBOX and Reports, null).read(null); then .read("2026-10-10T00:00:00Z")
// expect: the three mails as Mails, in the order of the folders: id the MAIL- identifier of the Message-ID without its angle brackets, messageId "<in-1@example.org>", from { name: "Ada Reporter", address: "ada@example.net" }, to [{ name: null, address: "reports@example.org" }], subject "Broken link", text holding "The link on page 3 is dead.", inReplyTo null, references [], attachments [], folder "INBOX" (and "Reports" for the third); with the date 2026-10-10 only the mail dated 13 October
test("read — on the Microsoft route: the mails of the named folders as Mails with their identifiers", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  fakeGraph();
  const mails = await mailbox(CONNECTION, null).read(null);
  assert.deepEqual(mails.map((mail) => mail.messageId), ["<in-1@example.org>", "<in-2@example.org>", "<rep-1@example.org>"]);
  assert.deepEqual(mails.map((mail) => mail.id), ["<in-1@example.org>", "<in-2@example.org>", "<rep-1@example.org>"].map(identifier));
  assert.deepEqual(mails.map((mail) => mail.folder), ["INBOX", "INBOX", "Reports"]);
  const [first] = mails;
  assert.deepEqual(first.from, { name: "Ada Reporter", address: "ada@example.net" });
  assert.deepEqual(first.to, [{ name: null, address: "reports@example.org" }]);
  assert.equal(first.subject, "Broken link");
  assert.match(first.text, /The link on page 3 is dead\./);
  assert.equal(first.inReplyTo, null);
  assert.deepEqual(first.references, []);
  assert.deepEqual(first.attachments, []);
  const since = await mailbox(CONNECTION, null).read("2026-10-10T00:00:00Z");
  assert.deepEqual(since.map((mail) => mail.messageId), ["<in-2@example.org>"]);
});

// TST-478302 · level: unit · module: MOD-mail-routes
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fake Graph with one mail in Drafts (a reply to <in-1@example.org>) and one in Sent
// input: mailbox(connection of the Microsoft route, null).drafts(); .sent(null); .sent("2026-10-14T00:00:00Z"); .sent("2026-10-15T00:00:00Z")
// expect: drafts gives [{ ref: { route: "graph", id: "AAMk-dr-1=" }, inReplyTo: "<in-1@example.org>", mail }] where mail has the identifier of <dr-1@example.org>, references ["<in-1@example.org>"], folder "Drafts" and the subject "Re: Broken link"; sent gives the one Mail <se-1@example.org> with folder "Sent Items" and the identifier of that Message-ID, also for the date 14 October, and [] for the 15th
test("drafts and sent — on the Microsoft route: the Drafts with their DraftRef of the route graph, and the Sent mails", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  fakeGraph();
  const drafts = await mailbox(CONNECTION, null).drafts();
  assert.equal(drafts.length, 1);
  assert.deepEqual(drafts[0].ref, { route: "graph", id: "AAMk-dr-1=" });
  assert.equal(drafts[0].inReplyTo, "<in-1@example.org>");
  assert.equal(drafts[0].mail.id, identifier("<dr-1@example.org>"));
  assert.deepEqual(drafts[0].mail.references, ["<in-1@example.org>"]);
  assert.equal(drafts[0].mail.folder, "Drafts");
  assert.equal(drafts[0].mail.subject, "Re: Broken link");
  const sent = await mailbox(CONNECTION, null).sent(null);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].id, identifier("<se-1@example.org>"));
  assert.equal(sent[0].folder, "Sent Items");
  assert.equal((await mailbox(CONNECTION, null).sent("2026-10-14T00:00:00Z")).length, 1);
  assert.deepEqual(await mailbox(CONNECTION, null).sent("2026-10-15T00:00:00Z"), []);
});

// TST-478303 · level: unit · module: MOD-mail-routes
// guards: UC-038; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
// given: the fake Graph with mails in INBOX (two) and Reports (one); the identifier of <rep-1@example.org> and an identifier of no mail
// input: mailbox(connection with folders INBOX and Reports, null).find(identifier of <rep-1@example.org>); .find("MAIL-0000000000000000")
// expect: the first is the Mail <rep-1@example.org> from the second named folder, folder "Reports", and only the raw form of that one mail was fetched; the second is null, not an error and no guess, and no raw form was fetched
test("find — on the Microsoft route: a mail in a second named folder by the hash of its Message-ID, and null for none", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  let requests = fakeGraph();
  const found = await mailbox(CONNECTION, null).find(identifier("<rep-1@example.org>"));
  assert.equal(found.messageId, "<rep-1@example.org>");
  assert.equal(found.id, identifier("<rep-1@example.org>"));
  assert.equal(found.folder, "Reports");
  assert.equal(rawFetched(requests).length, 1, "only the matching mail was fetched in full");
  requests = fakeGraph();
  assert.equal(await mailbox(CONNECTION, null).find("MAIL-0000000000000000"), null);
  assert.ok(requests.length > 0, "known positive: the folders were listed");
  assert.equal(rawFetched(requests).length, 0);
});

// TST-478304 · level: unit · module: MOD-mail-routes
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the fake Graph, which records every request; its INBOX list once names a next page at another origin (https://evil.example/steal)
// input: read(null), find(an identifier), drafts() and sent(null) on the Microsoft route
// expect: every recorded request is a GET without a body, to an address of https://graph.microsoft.com/v1.0 with the token only as `Bearer <token>` in its Authorization header; the token is in no address; no request goes to evil.example, and the foreign next page is not followed but fails as Unreachable
test("read, find, drafts and sent — on the Microsoft route: only GETs to Microsoft Graph, the token only in the authorisation header", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const requests = fakeGraph();
  const box = mailbox(CONNECTION, null);
  await box.read(null);
  await box.find(identifier("<rep-1@example.org>"));
  await box.drafts();
  await box.sent(null);
  assert.ok(requests.length >= 10, "known positive: requests were made");
  for (const request of requests) {
    assert.equal(request.method, "GET");
    assert.equal(request.body, null);
    assert.ok(request.address.startsWith(`${GRAPH}/`), `${request.address}: to Microsoft Graph`);
    assert.equal(request.headers.Authorization, `Bearer ${TOKEN}`);
    assert.ok(!request.address.includes("SECRET") && !request.address.includes("access_token"), "no token in the address");
  }
  const trapped = fakeGraph({ trap: "https://evil.example/steal" });
  await assert.rejects(box.read(null), (error) => error.name === "Unreachable");
  assert.ok(trapped.length > 0, "known positive: requests were made");
  assert.ok(trapped.every((request) => new URL(request.address).origin === "https://graph.microsoft.com"), "nothing sent to the other origin");
});

for (const [what, status, name, check] of [
  ["a refused sign-in (401)", 401, "SignInExpired", () => {}],
  ["a refused permission (403)", 403, "PermissionDeclined", (error) => assert.equal(error.permission, "Mail.ReadWrite")],
  ["a request to wait (429, 17 seconds)", 429, "Throttled", (error) => assert.equal(error.retryAfter, 17)],
  ["a failing Graph (503)", 503, "Unreachable", (error) => assert.match(error.reason, /503/)],
  ["a Graph that cannot be reached", new TypeError("fetch failed"), "Unreachable", (error) => assert.match(error.reason, /fetch failed/)],
]) {
  // TST-478305 · level: unit · module: MOD-mail-routes
  // guards: UC-038; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  // given: a fake Graph that fails every request, each time in one way
  // input: read(null), find(an identifier), drafts() and sent(null) on the Microsoft route, for each failure
  // expect: the error of the file for all four operations — SignInExpired for 401, PermissionDeclined naming Mail.ReadWrite for 403, Throttled with retryAfter 17 for 429, Unreachable with the reason for 503 and for a failed fetch — and nothing else
  test(`read, find, drafts and sent — on the Microsoft route: ${what} is answered with ${name}`, async () => {
    assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
    signedIn();
    for (const run of [(box) => box.read(null), (box) => box.find("MAIL-0000000000000000"), (box) => box.drafts(), (box) => box.sent(null)]) {
      fakeGraph({ status });
      await assert.rejects(run(mailbox(CONNECTION, null)), (error) => {
        assert.equal(error.name, name);
        check(error);
        return true;
      });
    }
  });
}
