// The Microsoft Graph route reads and finds mails and lists Drafts and Sent (ITM-836) — MOD-mail-routes' Mailbox operations read, find,
// drafts and sent on the Graph route, as the accepted text of docs/architecture/MOD-mail-routes.md states them: "read(since) — the mails of
// the named folders, read without changing anything", "find(ids) — the mails with these MAIL- identifiers in the named folders, all found in
// one lookup ... on the Graph route in one listing of each folder ... only the mails that match are fetched in full; each identifier is
// answered with its mail, or with null ... when none matches, never a guess. An empty list is answered {} without crossing the network", "drafts() -> { ref: DraftRef, inReplyTo, mail }[] and sent(since) ->
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
//   - a message's raw form is `/me/messages/<id>/$value`; it is parsed with postal-mime; read's `since` is Graph's `$filter=receivedDateTime ge
//     <the start of the day it names, UTC>` on the list, so that only the messages Graph selects are fetched, and so is sent's;
//   - find lists each named folder once, hashes the `internetMessageId`s and fetches the raw form of the ones that match only;
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

function raw({ messageId, from, to, subject, date, text, inReplyTo = null, references = null, type = "text/plain" }) {
  return [`Message-ID: ${messageId}`, `From: ${from}`, `To: ${to}`, `Subject: ${subject}`, `Date: ${date}`,
    ...(inReplyTo ? [`In-Reply-To: ${inReplyTo}`] : []), ...(references ? [`References: ${references}`] : []),
    "MIME-Version: 1.0", `Content-Type: ${type}; charset=utf-8`, "", text, ""].join("\r\n");
}

// The fixture mails of the fake mailbox, each with the id Graph gives it and the folder it lies in.
const MAILS = {
  "AAMk-in-1=": { folder: "inbox", messageId: "<in-1@example.org>", raw: raw({ messageId: "<in-1@example.org>", from: "Ada Reporter <ada@example.net>",
    to: "reports@example.org", subject: "Broken link", date: "Mon, 05 Oct 2026 09:00:00 +0000", text: "The link on page 3 is dead." }) },
  "AAMk-in-2=": { folder: "inbox", messageId: "<in-2@example.org>", raw: raw({ messageId: "<in-2@example.org>", from: "Bo <bo@example.net>",
    to: "reports@example.org", subject: "Typo", date: "Tue, 13 Oct 2026 10:00:00 +0000", text: "A typo in the heading." }) },
  "AAMk-rep-1=": { folder: "REPORTS-ID", messageId: "<rep-1@example.org>", raw: raw({ messageId: "<rep-1@example.org>", from: "Cy <cy@example.net>",
    to: "reports@example.org", subject: "Report seven", date: "Wed, 07 Oct 2026 11:00:00 +0000", text: "<html><body><p>Seventh report.</p></body></html>", type: "text/html" }) },
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
      // Graph selects by `$filter=receivedDateTime ge <date and time>`, the date received being here the mail's Date; its next page keeps the filter.
      const received = /^receivedDateTime ge (\S+)$/.exec(url.searchParams.get("$filter") ?? "")?.[1];
      const all = Object.entries(MAILS).filter(([, mail]) => mail.folder === folder)
        .filter(([, mail]) => received === undefined || Date.parse(/^Date: (.*)$/m.exec(mail.raw)[1]) >= Date.parse(received))
        .map(([id, mail]) => ({ id, internetMessageId: mail.messageId }));
      if (folder === "inbox" && !url.searchParams.has("page")) {
        const kept = received === undefined ? "" : `&$filter=${encodeURIComponent(`receivedDateTime ge ${received}`)}`;
        return json({ value: all.slice(0, 1), "@odata.nextLink": trap ?? `${GRAPH}/me/mailFolders/inbox/messages?page=2${kept}` });
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
// given: the fake Graph with mails in INBOX (two, listed over two pages) and Reports (one, with an HTML part only); the identifiers of <rep-1@example.org> and <in-2@example.org>, and an identifier of no mail
// input: mailbox(connection with folders INBOX and Reports, null).find([identifier of <rep-1@example.org>, identifier of <in-2@example.org>, "MAIL-0000000000000000"]); then .find(["MAIL-0000000000000000"])
// expect: the first answers each identifier: <rep-1@example.org> from the second named folder, folder "Reports", its text "Seventh report." from its HTML part; <in-2@example.org> from INBOX; "MAIL-0000000000000000" null, not an error and no guess; each folder's list was asked once — the first page of INBOX, its next page, and Reports — and only the raw forms of those two mails were fetched; the second is { "MAIL-0000000000000000": null }, the folders listed and no raw form fetched
test("find — on the Microsoft route: the mails of several identifiers, each folder listed once, and null for none", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  let requests = fakeGraph();
  const [rep, in2] = [identifier("<rep-1@example.org>"), identifier("<in-2@example.org>")];
  const found = await mailbox(CONNECTION, null).find([rep, in2, "MAIL-0000000000000000"]);
  assert.deepEqual(Object.keys(found).sort(), [rep, in2, "MAIL-0000000000000000"].sort());
  assert.equal(found[rep].messageId, "<rep-1@example.org>");
  assert.equal(found[rep].id, rep);
  assert.match(found[rep].text, /^Seventh report\.\s*$/, "a mail with an HTML part only gives its text without the markup");
  assert.equal(found[rep].folder, "Reports");
  assert.equal(found[in2].messageId, "<in-2@example.org>");
  assert.equal(found[in2].folder, "INBOX");
  assert.equal(found["MAIL-0000000000000000"], null);
  const listed = requests.map((request) => new URL(request.address)).filter((url) => /\/messages$/.test(url.pathname)).map((url) => decodeURIComponent(url.pathname) + (url.searchParams.has("page") ? "?page" : ""));
  assert.deepEqual(listed, ["/v1.0/me/mailFolders/inbox/messages", "/v1.0/me/mailFolders/inbox/messages?page", "/v1.0/me/mailFolders/REPORTS-ID/messages"], "each folder listed once");
  assert.equal(rawFetched(requests).length, 2, "only the matching mails were fetched in full");
  requests = fakeGraph();
  assert.deepEqual(await mailbox(CONNECTION, null).find(["MAIL-0000000000000000"]), { "MAIL-0000000000000000": null });
  assert.ok(requests.length > 0, "known positive: the folders were listed");
  assert.equal(rawFetched(requests).length, 0);
});

// TST-20261112802 · level: unit · module: MOD-mail-routes
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-038
// given: the fake Graph, which records every request
// input: mailbox(connection of the Microsoft route, null).find([])
// expect: {} and no request at all; counter-proof: find([identifier of <in-1@example.org>]) on the same fake makes requests
test("find — on the Microsoft route: an empty list is answered {} without a request", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const requests = fakeGraph();
  assert.deepEqual(await mailbox(CONNECTION, null).find([]), {});
  assert.equal(requests.length, 0, "no request for an empty list");
  await mailbox(CONNECTION, null).find([identifier("<in-1@example.org>")]);
  assert.ok(requests.length > 0, "counter-proof: a list with an identifier makes its requests");
});

// TST-478304 · level: unit · module: MOD-mail-routes
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the fake Graph, which records every request; its INBOX list once names a next page at another origin (https://evil.example/steal)
// input: read(null), find([an identifier]), drafts() and sent(null) on the Microsoft route
// expect: every recorded request is a GET without a body, to an address of https://graph.microsoft.com/v1.0 with the token only as `Bearer <token>` in its Authorization header; the token is in no address; no request goes to evil.example, and the foreign next page is not followed but fails as Unreachable
test("read, find, drafts and sent — on the Microsoft route: only GETs to Microsoft Graph, the token only in the authorisation header", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const requests = fakeGraph();
  const box = mailbox(CONNECTION, null);
  await box.read(null);
  await box.find([identifier("<rep-1@example.org>")]);
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
  // input: read(null), find([an identifier]), drafts() and sent(null) on the Microsoft route, for each failure
  // expect: the error of the file for all four operations — SignInExpired for 401, PermissionDeclined naming Mail.ReadWrite for 403, Throttled with retryAfter 17 for 429, Unreachable with the reason for 503 and for a failed fetch — and nothing else
  test(`read, find, drafts and sent — on the Microsoft route: ${what} is answered with ${name}`, async () => {
    assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
    signedIn();
    for (const run of [(box) => box.read(null), (box) => box.find(["MAIL-0000000000000000"]), (box) => box.drafts(), (box) => box.sent(null)]) {
      fakeGraph({ status });
      await assert.rejects(run(mailbox(CONNECTION, null)), (error) => {
        assert.equal(error.name, name);
        check(error);
        return true;
      });
    }
  });
}

const listRequests = (requests) => requests.filter((request) => /\/me\/mailFolders\/[^/?]+\/messages\b/.test(request.address));
const receivedFilter = (request) => new URL(request.address).searchParams.get("$filter");

// TST-478306 · level: unit · module: MOD-mail-routes
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fake Graph of TST-478301 — INBOX holds in-1 (received 5 October 2026) over its first page and in-2 (13 October) over its second, Reports holds rep-1 (7 October) —, which lists only the messages a `$filter=receivedDateTime ge` selects, and keeps the filter on its next page
// input: mailbox(connection of the Microsoft route with folders INBOX and Reports, null).read("2026-10-10"); then .read("2026-10-13T18:00:00Z")
// expect: each list request of INBOX and Reports carries `$filter=receivedDateTime ge 2026-10-10T00:00:00Z`, and only the raw form of in-2 is fetched; the answer is the one Mail <in-2@example.org>; a since with a time names its day: the filter is `receivedDateTime ge 2026-10-13T00:00:00Z`, and in-2, received at 10:00 that day, is read
test("read — on the Microsoft route: the date received is filtered by Graph, and only the mails it selects are fetched", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  let requests = fakeGraph();
  const mails = await mailbox(CONNECTION, null).read("2026-10-10");
  assert.deepEqual(mails.map((mail) => mail.messageId), ["<in-2@example.org>"]);
  const lists = listRequests(requests);
  assert.ok(lists.some((request) => request.address.includes("/inbox/")) && lists.some((request) => request.address.includes("/REPORTS-ID/")), "known positive: both folders were listed");
  assert.deepEqual([...new Set(lists.map(receivedFilter))], ["receivedDateTime ge 2026-10-10T00:00:00Z"]);
  assert.deepEqual(rawFetched(requests).map((request) => /messages\/([^/]+)\//.exec(decodeURIComponent(request.address))[1]), ["AAMk-in-2="]);
  requests = fakeGraph();
  assert.deepEqual((await mailbox(CONNECTION, null).read("2026-10-13T18:00:00Z")).map((mail) => mail.messageId), ["<in-2@example.org>"]);
  assert.deepEqual([...new Set(listRequests(requests).map(receivedFilter))], ["receivedDateTime ge 2026-10-13T00:00:00Z"]);
});

// TST-478307 · level: unit · module: MOD-mail-routes
// guards: UC-038
// given: counter-proof of TST-478306: the same fake Graph
// input: mailbox(connection of the Microsoft route, null).read(null)
// expect: no list request carries a filter on the date received, and the raw forms of all three mails are fetched
test("read — on the Microsoft route: without since no date is filtered and every mail is fetched", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  const requests = fakeGraph();
  assert.equal((await mailbox(CONNECTION, null).read(null)).length, 3);
  assert.ok(listRequests(requests).length >= 3, "known positive: the folders were listed");
  assert.equal(listRequests(requests).some((request) => /receivedDateTime/.test(receivedFilter(request) ?? "")), false);
  assert.equal(rawFetched(requests).length, 3);
});

// TST-20261112302 · level: unit · module: MOD-mail-routes
// guards: A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fake Graph of TST-478301, whose Sent Items hold se-1 (received 14 October 2026), and which lists only the messages a `$filter=receivedDateTime ge` selects
// input: mailbox(connection of the Microsoft route, null).sent("2026-10-15"); counter-proof: .sent("2026-10-14")
// expect: the list request of sentitems carries `$filter=receivedDateTime ge 2026-10-15T00:00:00Z`, no raw form is fetched and the answer is []; with the 14th the filter names that day, the raw form of se-1 is fetched and the answer is its Mail
test("sent — on the Microsoft route: the date received is filtered by Graph, and only the mails it selects are fetched", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  let requests = fakeGraph();
  assert.deepEqual(await mailbox(CONNECTION, null).sent("2026-10-15"), []);
  const lists = listRequests(requests).filter((request) => request.address.includes("/sentitems/"));
  assert.ok(lists.length > 0, "known positive: Sent Items were listed");
  assert.deepEqual([...new Set(lists.map(receivedFilter))], ["receivedDateTime ge 2026-10-15T00:00:00Z"]);
  assert.deepEqual(rawFetched(requests), []);
  requests = fakeGraph();
  assert.deepEqual((await mailbox(CONNECTION, null).sent("2026-10-14")).map((mail) => mail.messageId), ["<se-1@example.org>"]);
  assert.deepEqual([...new Set(listRequests(requests).map(receivedFilter))], ["receivedDateTime ge 2026-10-14T00:00:00Z"]);
  assert.equal(rawFetched(requests).length, 1);
});

// TST-20261112309 · level: unit · module: MOD-mail-routes
// guards: THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the fake Graph of TST-478301, whose Drafts hold dr-1 (received 5 October 2026), and which lists only the messages a `$filter=receivedDateTime ge` selects
// input: mailbox(connection of the Microsoft route, null).drafts("2026-10-06"); counter-proof: .drafts("2026-10-05")
// expect: the list request of drafts carries `$filter=receivedDateTime ge 2026-10-06T00:00:00Z`, no raw form is fetched and the answer is []; with the 5th the filter names that day, the raw form of dr-1 is fetched and the answer is its one draft
test("TST-20261112309 drafts — on the Microsoft route: the date received is filtered by Graph, and only the drafts it selects are fetched", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  signedIn();
  let requests = fakeGraph();
  assert.deepEqual(await mailbox(CONNECTION, null).drafts("2026-10-06"), []);
  const lists = listRequests(requests).filter((request) => request.address.includes("/drafts/"));
  assert.ok(lists.length > 0, "known positive: Drafts were listed");
  assert.deepEqual([...new Set(lists.map(receivedFilter))], ["receivedDateTime ge 2026-10-06T00:00:00Z"]);
  assert.deepEqual(rawFetched(requests), []);
  requests = fakeGraph();
  assert.deepEqual((await mailbox(CONNECTION, null).drafts("2026-10-05")).map((draft) => draft.mail.messageId), ["<dr-1@example.org>"]);
  assert.deepEqual([...new Set(listRequests(requests).map(receivedFilter))], ["receivedDateTime ge 2026-10-05T00:00:00Z"]);
  assert.equal(rawFetched(requests).length, 1);
});
