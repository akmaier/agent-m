// The Bridge route keeps a reply draft and sends only the mail shown (ITM-835) — MOD-mail-routes' Mailbox operations storeDraft, updateDraft,
// showDraft and sendDraft on the Bridge route, as the accepted text of docs/architecture/MOD-mail-routes.md states them: "storeDraft(draft) — the
// reply stored in Drafts and nowhere else ... Errors: NoReplyAddress when the mail's reply address is missing or invalid", "updateDraft(ref, draft)",
// "showDraft(ref) — the draft as it is stored, complete, with the SHA-256 of its bytes", "sendDraft(shown) — on the Bridge route the call first
// obtains the Bridge's single-use confirmation for that SHA-256 and then sends with it ... Errors: DraftChanged, ConfirmationRefused with the reason,
// SendRefused with the server's answer". For UC-039.
// Run: node --test tests/mail-routes-bridge-draft.test.mjs
//
// Module: MOD-mail-routes
// Guards: UC-039; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; A REPLY GOES TO ONE REPORTER; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// Level: unit
//
// The Bridge is a fake behind `fetch`, reached with MOD-bridge-client's real bridgeAt and mailCall; its answers are those the Bridge
// (MOD-mail-protocols) gives: store-draft and update-draft -> DraftRef, show-draft -> ShownMail, confirm-send -> { confirmation, expiresAt },
// send -> { sentAt }, and its error confirmation-refused (409) or upstream-failed (502). Values the module file leaves open, and the reading this
// file takes (the pull request names them):
//   - the arguments of the request (send as MOD-bridge-http states): { draft } (store-draft), { ref, draft } (update-draft), { ref } (show-draft), { ref: shown.ref, sha256:
//     shown.sha256 } (confirm-send), { ref, sha256, confirmation } (send) — the Bridge's own reading of them;
//   - which reply addresses are "usable" is not fixed: only an address that is missing, empty, without "@", or a list of several addresses is
//     asserted to fail; no other value is asserted;
//   - the Bridge's confirmation-refused to send for a draft whose bytes are not the confirmed ones (its message says the draft is not the mail that
//     was confirmed) is DraftChanged; any other confirmation-refused is ConfirmationRefused with the Bridge's message as `reason`; upstream-failed
//     to send is SendRefused with the Bridge's message as `answer`.
// Nothing reaches the network, no mail is sent. Each test states its input and its expected result before it runs (given / input / expect). The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { bridgeAt } from "../src/bridge-client/index.mjs";

const mailRoutes = await import("../src/mail-routes/index.mjs").catch((error) => ({ error }));
const { mailbox } = mailRoutes;

const PASSWORD = "mail-password-constructed-835";
const BRIDGE_TOKEN = "bridge-token-constructed-835";
globalThis.location = { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" };

const CONNECTION = { address: "reports@example.org", route: "imap", folders: ["INBOX", "Reports"], places: [],
  imap: { bridge: "lab-pc", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" },
    smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: PASSWORD } };
const BRIDGE = bridgeAt({ address: "http://127.0.0.1:4711", token: BRIDGE_TOKEN });

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const failure = (error, message, status = 502) => json({ error, message }, status);

const REPORT = { id: "MAIL-000001", messageId: "<m1@example.org>", inReplyTo: null, references: [],
  from: { name: "Rita Reporter", address: "rita@example.net" }, replyTo: [], to: [{ name: null, address: "reports@example.org" }], cc: [],
  subject: "Report 1", date: "2026-10-01T09:00:00.000Z", text: "Text of report 1", attachments: [], folder: "INBOX" };
const DRAFT = { replyTo: REPORT, to: { name: "Rita Reporter", address: "rita@example.net" }, subject: "Re: Report 1", body: "Thank you, we are looking into it." };
const REF = { route: "bridge", uid: 7, uidValidity: 1 };
const SHA = "a".repeat(64);
const SHOWN = { ref: REF, sha256: SHA, from: { name: null, address: "reports@example.org" }, to: [DRAFT.to], cc: [], subject: DRAFT.subject, body: DRAFT.body, attachments: [] };

// The fake Bridge answers each request with the next of the given answers (a function of the operation, or a Response, or an Error to throw).
function fakeBridge(...answers) {
  const requests = [];
  globalThis.fetch = async (address, init = {}) => {
    const request = { address: String(address), method: init.method ?? "GET", headers: init.headers ?? {}, body: init.body ?? null };
    requests.push(request);
    const given = answers[Math.min(requests.length, answers.length) - 1];
    const answer = typeof given === "function" ? given(request) : given;
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return requests;
}
const operationOf = (request) => request.address.replace("http://127.0.0.1:4711/v1/mail/", "");

// A request to the Bridge: POST /v1/mail/<operation>, the connection with its password in the body only, the token in a header.
function assertRequest(request, operation, args) {
  assert.equal(request.method, "POST");
  assert.equal(request.address, `http://127.0.0.1:4711/v1/mail/${operation}`);
  assert.deepEqual(JSON.parse(request.body), { connection: CONNECTION, args });
  assert.ok(Object.values(request.headers).includes(BRIDGE_TOKEN), "the Bridge's token in a header");
  assert.ok(!request.address.includes(PASSWORD), "no password in the address");
  assert.ok(!JSON.stringify(request.headers).includes(PASSWORD), "no password in a header");
}

// TST-483501 · level: unit · module: MOD-mail-routes
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY GOES TO ONE REPORTER; UC-039
// given: a fake Bridge that answers store-draft with the DraftRef { route: "bridge", uid: 7, uidValidity: 1 }
// input: mailbox(connection of the Bridge route, bridge).storeDraft(a Draft replying to Rita Reporter, addressed to her alone)
// expect: that DraftRef, as the Bridge gave it; one request, POST /v1/mail/store-draft, body { connection, args: { draft } } with the Draft unchanged — its one recipient Rita Reporter
test("storeDraft — on the Bridge route: the one reply sent to the Bridge, its DraftRef returned", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(() => json(REF));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).storeDraft(DRAFT), REF);
  assert.equal(requests.length, 1, "exactly one request");
  assertRequest(requests[0], "store-draft", { draft: DRAFT });
});

// TST-483502 · level: unit · module: MOD-mail-routes
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a fake Bridge that answers update-draft with the DraftRef { route: "bridge", uid: 8, uidValidity: 1 } and show-draft with a ShownMail of sha256 "aaaa…"
// input: mailbox(connection of the Bridge route, bridge).updateDraft(ref of uid 7, a Draft), then .showDraft(ref of uid 8)
// expect: the new DraftRef, then the ShownMail with its sha256, both as the Bridge gave them; one request each, POST /v1/mail/update-draft with args { ref, draft } and POST /v1/mail/show-draft with args { ref }
test("updateDraft and showDraft — on the Bridge route: the edit saved, the draft shown with its SHA-256", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const moved = { route: "bridge", uid: 8, uidValidity: 1 };
  let requests = fakeBridge(() => json(moved));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).updateDraft(REF, DRAFT), moved);
  assert.equal(requests.length, 1);
  assertRequest(requests[0], "update-draft", { ref: REF, draft: DRAFT });
  requests = fakeBridge(() => json({ ...SHOWN, ref: moved }));
  const shown = await mailbox(CONNECTION, BRIDGE).showDraft(moved);
  assert.deepEqual(shown, { ...SHOWN, ref: moved });
  assert.equal(shown.sha256, SHA);
  assert.equal(requests.length, 1);
  assertRequest(requests[0], "show-draft", { ref: moved });
});

const NO_ADDRESS = [
  ["no address at all", { name: "Rita Reporter" }],
  ["no recipient at all", undefined],
  ["an empty address", { name: "Rita Reporter", address: "" }],
  ["an address without @", { name: "Rita Reporter", address: "rita.example.net" }],
  ["two addresses in one", { name: null, address: "rita@example.net, ruth@example.net" }],
  ["a list in place of the one reporter", [{ name: null, address: "rita@example.net" }, { name: null, address: "ruth@example.net" }]],
];
// TST-483503 · level: unit · module: MOD-mail-routes
// guards: A REPLY GOES TO ONE REPORTER; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039
// given: a fake Bridge that would answer a DraftRef; a Draft whose recipient is missing, empty, without "@", two addresses in one, or a list of two
// input: mailbox(connection of the Bridge route, bridge).storeDraft(draft) and .updateDraft(ref, draft), for each such Draft
// expect: each rejects with the error NoReplyAddress; no request reaches the Bridge
test("storeDraft and updateDraft — on the Bridge route: no usable reply address fails with NoReplyAddress and nothing is sent to the Bridge", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(() => json(REF));
  const box = mailbox(CONNECTION, BRIDGE);
  for (const [what, to] of NO_ADDRESS) {
    await assert.rejects(box.storeDraft({ ...DRAFT, to }), (error) => error.name === "NoReplyAddress", `storeDraft: ${what}`);
    await assert.rejects(box.updateDraft(REF, { ...DRAFT, to }), (error) => error.name === "NoReplyAddress", `updateDraft: ${what}`);
  }
  assert.equal(requests.length, 0, "no request to the Bridge");
});

// TST-483504 · level: unit · module: MOD-mail-routes
// guards: THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a fake Bridge that answers confirm-send with { confirmation: "c0nf1rm", expiresAt } and send with { sentAt: "2026-10-17T10:00:00.000Z" }
// input: mailbox(connection of the Bridge route, bridge).sendDraft(a ShownMail of ref uid 7 and sha256 "aaaa…")
// expect: { sentAt: "2026-10-17T10:00:00.000Z" }; exactly two requests, in this order: POST /v1/mail/confirm-send with args { ref, sha256 } of the mail shown, then POST /v1/mail/send with args { ref, sha256, confirmation: "c0nf1rm" } (MOD-bridge-http)
test("sendDraft — on the Bridge route: confirm-send for the SHA-256 of the mail shown, then send with that confirmation", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(() => json({ confirmation: "c0nf1rm", expiresAt: "2026-10-17T10:05:00.000Z" }), () => json({ sentAt: "2026-10-17T10:00:00.000Z" }));
  assert.deepEqual(await mailbox(CONNECTION, BRIDGE).sendDraft(SHOWN), { sentAt: "2026-10-17T10:00:00.000Z" });
  assert.equal(requests.length, 2, "exactly two requests");
  assertRequest(requests[0], "confirm-send", { ref: REF, sha256: SHA });
  assertRequest(requests[1], "send", { ref: REF, sha256: SHA, confirmation: "c0nf1rm" });
});

// TST-483505 · level: unit · module: MOD-mail-routes
// guards: THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a fake Bridge that refuses confirm-send with its error confirmation-refused ("The draft is gone.")
// input: mailbox(connection of the Bridge route, bridge).sendDraft(a ShownMail)
// expect: rejects with ConfirmationRefused whose reason is the Bridge's message; exactly one request, POST /v1/mail/confirm-send — no send request is made
test("sendDraft — on the Bridge route: a refused confirmation sends nothing", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const requests = fakeBridge(() => failure("confirmation-refused", "The draft is gone.", 409), () => json({ sentAt: "2026-10-17T10:00:00.000Z" }));
  await assert.rejects(mailbox(CONNECTION, BRIDGE).sendDraft(SHOWN), (error) => {
    assert.equal(error.name, "ConfirmationRefused");
    assert.equal(error.reason, "The draft is gone.");
    return true;
  });
  assert.deepEqual(requests.map(operationOf), ["confirm-send"], "only confirm-send was asked");
});

const REFUSALS = [
  ["a draft whose bytes are no longer the mail shown", () => failure("confirmation-refused", "The draft is not the mail that was confirmed; nothing was sent.", 409),
    "DraftChanged", () => {}],
  ["a confirmation that is spent", () => failure("confirmation-refused", "The confirmation is spent; nothing was sent.", 409),
    "ConfirmationRefused", (error) => assert.equal(error.reason, "The confirmation is spent; nothing was sent.")],
  ["a confirmation that is expired", () => failure("confirmation-refused", "The confirmation is expired; nothing was sent.", 409),
    "ConfirmationRefused", (error) => assert.equal(error.reason, "The confirmation is expired; nothing was sent.")],
  ["a mail server that refuses to send", () => failure("upstream-failed", "550 5.7.1 relay denied", 502),
    "SendRefused", (error) => assert.equal(error.answer, "550 5.7.1 relay denied")],
];
for (const [what, answer, name, check] of REFUSALS) {
  // TST-483506 · level: unit · module: MOD-mail-routes
  // guards: THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
  // given: a fake Bridge that confirms and then refuses send as the Bridge does: confirmation-refused saying the draft is not the mail that was confirmed, confirmation-refused saying the confirmation is spent or expired, upstream-failed with the server's answer
  // input: mailbox(connection of the Bridge route, bridge).sendDraft(a ShownMail), for each refusal
  // expect: DraftChanged; ConfirmationRefused with reason "The confirmation is spent; …" or "… expired; …"; SendRefused with answer "550 5.7.1 relay denied" — and nothing else; two requests each, confirm-send then send
  test(`sendDraft — on the Bridge route: ${what} is answered with ${name}`, async () => {
    assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
    const requests = fakeBridge(() => json({ confirmation: "c0nf1rm", expiresAt: "2026-10-17T10:05:00.000Z" }), answer);
    await assert.rejects(mailbox(CONNECTION, BRIDGE).sendDraft(SHOWN), (error) => {
      assert.equal(error.name, name);
      check(error);
      return true;
    });
    assert.deepEqual(requests.map(operationOf), ["confirm-send", "send"]);
  });
}

const CALLS = [
  ["store-draft", (box) => box.storeDraft(DRAFT)],
  ["update-draft", (box) => box.updateDraft(REF, DRAFT)],
  ["show-draft", (box) => box.showDraft(REF)],
  ["confirm-send", (box) => box.sendDraft(SHOWN)],
];
// TST-483507 · level: unit · module: MOD-mail-routes
// guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// given: a fake Bridge that fails with a mail server's answer, for each of storeDraft, updateDraft, showDraft and sendDraft (at confirm-send); and one that fails the send after confirming it
// input: those calls on mailbox(connection of the Bridge route, bridge)
// expect: each rejects; the password is in the body of every request and in no address and no header; it stands in no thrown error — not in its name, message or fields
test("storeDraft, updateDraft, showDraft, sendDraft — on the Bridge route: the password in no error and in no request but the body", async () => {
  assert.ok(mailbox, `mailbox: ${mailRoutes.error?.message}`);
  const check = (requests, thrown, what) => {
    assert.ok(thrown, `${what}: rejects`);
    for (const request of requests) {
      assert.ok(JSON.parse(request.body).connection.imap.password === PASSWORD, `${what}: the password is in the body`);
      assert.ok(!request.address.includes(PASSWORD) && !JSON.stringify(request.headers).includes(PASSWORD), `${what}: not elsewhere in the request`);
    }
    assert.ok(!JSON.stringify({ name: thrown.name, message: thrown.message, ...thrown }).includes(PASSWORD), `${what}: not in the error`);
  };
  for (const [operation, call] of CALLS) {
    const requests = fakeBridge(() => failure("upstream-failed", "connection reset by peer"));
    let thrown;
    await call(mailbox(CONNECTION, BRIDGE)).catch((error) => { thrown = error; });
    assert.equal(requests.length, 1, `${operation}: one request`);
    assert.equal(operationOf(requests[0]), operation);
    check(requests, thrown, operation);
  }
  const requests = fakeBridge(() => json({ confirmation: "c0nf1rm", expiresAt: "2026-10-17T10:05:00.000Z" }), () => failure("upstream-failed", "535 login failed for the mail account"));
  let thrown;
  await mailbox(CONNECTION, BRIDGE).sendDraft(SHOWN).catch((error) => { thrown = error; });
  assert.equal(requests.length, 2);
  check(requests, thrown, "send");
});
