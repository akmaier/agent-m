// ITM-953: the replies due are found and grouped, stored as drafts, sent only as shown and noted in the issue, through the public
// MailHandling entry, over a fake mailbox, fake hosts of the accepted issue functions and synthetic mails.
// Module: MOD-mail-handling
// Guards: CLOSING AN ISSUE PREPARES ITS REPLIES; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; AN ISSUE WAITING FOR A REPORTER IS LABELLED; UC-039
// Level: unit
// Run: node --test tests/mail-handling-replies.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { noteText, mailId } from "../src/mail-records/index.mjs";

// Only the not-yet-built public entry is tolerated as missing. Broken transitive imports and other loader errors still throw.
const entry = new URL("../src/mail-handling/index.mjs", import.meta.url);
const handling = await import(entry.href).catch((error) => {
  if (error.code !== "ERR_MODULE_NOT_FOUND" || error.url !== entry.href) throw error;
  return {};
});

// Identifiers are literals, each the first sixteen hex digits of the SHA-256 of the Message-ID beside it, checked with shasum
// before execution and not computed by the code under test.
const A = { id: "MAIL-ca171c6d1e8e76f0", messageId: "<sample@example.invalid>" };
const B = { id: "MAIL-f9f8e80f54bb5fa3", messageId: "<other@example.invalid>" };
const C = { id: "MAIL-327d1b3c6e47dfc8", messageId: "<third@example.invalid>" };
const D = { id: "MAIL-15192047a5b7d4c1", messageId: "<fourth@example.invalid>" };
const PRODUCT = "https://github.com/example/thesis-tool";
const PULL = "https://github.com/example/thesis-tool/pull/31";

const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
function mail({ id, messageId }, over = {}) {
  return { id, messageId, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.invalid" }],
    cc: [], subject: "Export fails", date: "2026-10-10T08:00:00Z", text: "Hello,\nthe export fails with an error.\nKind regards\nErika", attachments: [], folder: "INBOX", ...over };
}

// A fake Mailbox of MOD-mail-routes' interface. `found` maps an identifier to its Mail; `log` is shared with the fake host so that
// the order of a mailbox call and a host call can be read.
function fakeMailbox({ found = {}, drafts = [], sent = [], sendFails = null, sentAt = "2026-10-18T10:00:00Z", noAddress = false, draftsFail = null, log = [] } = {}) {
  const calls = log;
  return { calls,
    read: async () => { calls.push(["mailbox.read"]); return []; },
    find: async (id) => { calls.push(["mailbox.find", id]); return found[id] ?? null; },
    drafts: async () => { calls.push(["mailbox.drafts"]); if (draftsFail) throw draftsFail; return drafts; },
    sent: async (since) => { calls.push(["mailbox.sent", since]); return sent; },
    storeDraft: async (draft) => {
      calls.push(["mailbox.storeDraft", draft]);
      if (noAddress) throw Object.assign(new Error("no reply address"), { name: "NoReplyAddress" });
      return { route: "bridge", uid: calls.length, uidValidity: 1 };
    },
    updateDraft: async () => { calls.push(["mailbox.updateDraft"]); },
    showDraft: async () => { calls.push(["mailbox.showDraft"]); },
    sendDraft: async (shown) => { calls.push(["mailbox.sendDraft", shown]); if (sendFails) throw sendFails; return { sentAt }; },
    test: async () => { calls.push(["mailbox.test"]); } };
}

function fakeHost(issues, { commentFails = null, listFails = null, log = [] } = {}) {
  const calls = log;
  return { calls,
    listIssues: async (filter) => { calls.push(["host.listIssues", filter]); if (listFails) throw listFails; return issues; },
    createIssue: async () => { calls.push(["host.createIssue"]); },
    commentOnIssue: async (number, body) => { calls.push(["host.commentOnIssue", number, body]); if (commentFails) throw commentFails; },
    setIssueLabels: async (number, change) => { calls.push(["host.setIssueLabels", number, change]); },
    setIssueState: async (number, state) => { calls.push(["host.setIssueState", number, state]); } };
}
const issue = (number, body, over = {}) => ({ number, title: `Issue ${number}`, body, labels: [], state: "open", url: `https://example.invalid/${number}`, comments: [], ...over });
const comment = (body, date = "2026-10-12T09:00:00Z") => ({ author: "agent-m", body, date });
const listing = (...mails) => `Export fails.\n\nMails: ${mails.map((m) => `\`${m.id}\``).join(", ")}`;
const names = (log) => log.map((call) => call[0]);
const callsOf = (log, name) => log.filter((call) => call[0] === name);
const draftOf = (message, ref) => ({ ref, inReplyTo: message.messageId, mail: mail({ id: "MAIL-9999999999999999", messageId: "<draft@example.invalid>" }) });
const REF_A = { route: "bridge", uid: 5, uidValidity: 7 };

// TST-953001
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; UC-039
// given: the identifier controls of MOD-mail-records work; closed issue 8 lists A (no note) and B (reply-sent noted) and was closed with a pull request; closed issue 10 lists C, noted; open issue 9 lists D; Drafts holds a draft replying to A and an unrelated draft
// input: repliesDue(mailbox, [{ address, host }])
// expect: toAnswer holds only issue 8 with closedBy the pull request's address, release null, and mails A (found, draft = the draft's ref, noted false) and B (found, no draft, noted true); issue 10 is in no group; open holds issue 9; answerReceived is empty; the unrelated draft is listed nowhere
test("TST-953001 a closed issue with an unnoted mail is to answer, with its mails found and their drafts", async () => {
  assert.equal(await mailId({ messageId: A.messageId, bytes: null }), A.id);
  assert.equal(await mailId({ messageId: B.messageId, bytes: null }), B.id);
  const mailA = mail(A);
  const mailB = mail(B, { subject: "Other" });
  const host = fakeHost([
    issue(8, listing(A, B), { state: "closed", comments: [comment(`Reply sent to \`${B.id}\` on 2026-10-12.`), comment(`Closed with ${PULL}; item \`ITM-123\`.`)] }),
    issue(10, listing(C), { state: "closed", comments: [comment(`Reply sent to \`${C.id}\` on 2026-10-12.`)] }),
    issue(9, listing(D)),
  ]);
  const mailbox = fakeMailbox({ found: { [A.id]: mailA, [B.id]: mailB, [D.id]: mail(D) },
    drafts: [draftOf(A, REF_A), { ref: { route: "bridge", uid: 6, uidValidity: 7 }, inReplyTo: "<unrelated@example.invalid>", mail: mail(C) }] });
  const result = await handling.repliesDue?.(mailbox, [{ address: PRODUCT, host }]);
  assert.deepEqual(result?.toAnswer, [{ product: PRODUCT, issue: 8, closedBy: PULL, release: null, mails: [
    { id: A.id, mail: mailA, draft: REF_A, noted: false }, { id: B.id, mail: mailB, draft: null, noted: true }] }]);
  assert.deepEqual(result?.answerReceived, []);
  assert.deepEqual(result?.open.map((due) => [due.issue, due.mails.map((m) => m.id), due.mails.map((m) => m.draft)]), [[9, [D.id], [null]]]);
});

// TST-953002
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: a closed issue that lists A, with no note, whose mail is no longer in the named folders; no comment says how it was closed
// input: repliesDue
// expect: it is in toAnswer with the mail null, no draft, closedBy null and release null
test("TST-953002 a listed mail no longer in the mailbox is null, and an issue closed elsewhere has no closedBy", async () => {
  const host = fakeHost([issue(8, listing(A), { state: "closed" })]);
  const result = await handling.repliesDue?.(fakeMailbox(), [{ address: PRODUCT, host }]);
  assert.deepEqual(result?.toAnswer, [{ product: PRODUCT, issue: 8, closedBy: null, release: null, mails: [{ id: A.id, mail: null, draft: null, noted: false }] }]);
});

// TST-953003
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: counter-proof of TST-953001: a closed issue whose every listed mail has a reply-sent or a no-reply note
// input: repliesDue
// expect: the issue is in no group
test("TST-953003 counter-proof: a closed issue whose mails are all noted is in no group", async () => {
  const host = fakeHost([issue(8, listing(A, B), { state: "closed", comments: [comment(`Reply sent to \`${A.id}\` on 2026-10-12.`), comment(`No reply to \`${B.id}\`, decided on 2026-10-12.`)] })]);
  const result = await handling.repliesDue?.(fakeMailbox(), [{ address: PRODUCT, host }]);
  assert.deepEqual(result, { toAnswer: [], answerReceived: [], open: [] });
});

// TST-953004
// level: unit
// module: MOD-mail-handling
// guards: A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; AN ISSUE WAITING FOR A REPORTER IS LABELLED; UC-039
// given: open issue 11 is labelled waiting-for-reporter, a question was sent to A, and then D was added to it; issue 12 is labelled and has only the question; issue 13 is not labelled and has a mail added after a question
// input: repliesDue
// expect: answerReceived holds issue 11 only, with mails A and D; issues 12 and 13 are in open
test("TST-953004 an issue waiting for a reporter with a newer mail is answer received", async () => {
  const waiting = ["waiting-for-reporter"];
  const question = comment(`Question sent to \`${A.id}\` on 2026-10-12.`);
  const answer = comment(`Mail \`${D.id}\` added on 2026-10-14.`, "2026-10-14T09:00:00Z");
  const host = fakeHost([
    issue(11, listing(A), { labels: waiting, comments: [question, answer] }),
    issue(12, listing(B), { labels: waiting, comments: [comment(`Question sent to \`${B.id}\` on 2026-10-12.`)] }),
    issue(13, listing(C), { comments: [comment(`Question sent to \`${C.id}\` on 2026-10-12.`), comment(`Mail \`${D.id}\` added on 2026-10-14.`)] }),
  ]);
  const result = await handling.repliesDue?.(fakeMailbox(), [{ address: PRODUCT, host }]);
  assert.deepEqual(result?.answerReceived.map((due) => [due.issue, due.mails.map((m) => m.id)]), [[11, [A.id, D.id]]]);
  assert.deepEqual(result?.open.map((due) => due.issue), [12, 13]);
  assert.deepEqual(result?.toAnswer, []);
});

// TST-953005
// level: unit
// module: MOD-mail-handling
// guards: A CLOSED ISSUE IS REOPENED ONLY BY A PERSON; CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: a closed issue whose mail A was answered, and to which D was added afterwards
// input: repliesDue
// expect: it is in toAnswer with A noted and D not noted; the host receives no call that changes an issue
test("TST-953005 a mail added to a closed issue is to answer and the issue stays closed", async () => {
  const log = [];
  const host = fakeHost([issue(8, listing(A), { state: "closed", comments: [comment(`Reply sent to \`${A.id}\` on 2026-10-12.`), comment(`Mail \`${D.id}\` added on 2026-10-14.`)] })], { log });
  const result = await handling.repliesDue?.(fakeMailbox({ log }), [{ address: PRODUCT, host }]);
  assert.deepEqual(result?.toAnswer.map((due) => due.mails.map((m) => [m.id, m.noted])), [[[A.id, true], [D.id, false]]]);
  assert.deepEqual(callsOf(log, "host.setIssueState"), []);
  assert.deepEqual(callsOf(log, "host.commentOnIssue"), []);
});

// TST-953006
// level: unit
// module: MOD-mail-handling
// guards: A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; UC-039
// given: closed issue 8 lists A with no note, and Sent holds a reply to A dated 2026-10-17 and an unrelated sent mail
// input: repliesDue
// expect: exactly one commentOnIssue(8, "Reply sent to A on 2026-10-17."); A is then noted and issue 8 is in no group
test("TST-953006 a reply found in Sent that no issue notes is noted in its issue now", async () => {
  const log = [];
  const host = fakeHost([issue(8, listing(A), { state: "closed" })], { log });
  const reply = mail({ id: "MAIL-8888888888888888", messageId: "<reply@example.invalid>" }, { inReplyTo: A.messageId, references: [A.messageId], date: "2026-10-17T15:30:00Z", from: { name: null, address: "reports@example.invalid" } });
  const unrelated = mail({ id: "MAIL-7777777777777777", messageId: "<else@example.invalid>" }, { inReplyTo: "<stranger@example.invalid>", date: "2026-10-17T16:00:00Z" });
  const result = await handling.repliesDue?.(fakeMailbox({ sent: [reply, unrelated], log }), [{ address: PRODUCT, host }]);
  assert.deepEqual(callsOf(log, "host.commentOnIssue"), [["host.commentOnIssue", 8, noteText("reply-sent", A.id, "2026-10-17")]]);
  assert.deepEqual(result, { toAnswer: [], answerReceived: [], open: [] });
});

// TST-953007
// level: unit
// module: MOD-mail-handling
// guards: A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; UC-039
// given: counter-proof of TST-953006: Sent holds a reply to B, which already has a reply-sent note; and a reply to C, which has a question-sent note
// input: repliesDue
// expect: no comment is written
test("TST-953007 counter-proof: a sent mail is not noted for a mail already noted, nor for one a question was sent to", async () => {
  const log = [];
  const host = fakeHost([issue(8, listing(B), { state: "closed", comments: [comment(`Reply sent to \`${B.id}\` on 2026-10-12.`)] }),
    issue(9, listing(C), { comments: [comment(`Question sent to \`${C.id}\` on 2026-10-12.`)] })], { log });
  const toB = mail({ id: "MAIL-8888888888888888", messageId: "<reply@example.invalid>" }, { inReplyTo: B.messageId, date: "2026-10-17T15:30:00Z" });
  const toC = mail({ id: "MAIL-7777777777777777", messageId: "<ask@example.invalid>" }, { inReplyTo: C.messageId, date: "2026-10-12T15:30:00Z" });
  await handling.repliesDue?.(fakeMailbox({ sent: [toB, toC], log }), [{ address: PRODUCT, host }]);
  assert.deepEqual(callsOf(log, "host.commentOnIssue"), []);
});

// TST-953008
// level: unit
// module: MOD-mail-handling
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; UC-039
// given: a mailbox and a host with a closed issue
// input: repliesDue
// expect: the mailbox receives find, drafts and sent calls only (no storeDraft, updateDraft, sendDraft); the host lists issues once with every state and changes nothing
test("TST-953008 finding the replies due stores and sends nothing", async () => {
  const log = [];
  const host = fakeHost([issue(8, listing(A), { state: "closed" })], { log });
  await handling.repliesDue?.(fakeMailbox({ found: { [A.id]: mail(A) }, log }), [{ address: PRODUCT, host }]);
  assert.deepEqual([...new Set(names(log))].sort(), ["host.listIssues", "mailbox.drafts", "mailbox.find", "mailbox.sent"]);
  assert.deepEqual(callsOf(log, "host.listIssues"), [["host.listIssues", { state: "all" }]]);
});

// TST-953009
// level: unit
// module: MOD-mail-handling
// guards: UC-039
// given: a mailbox that cannot be reached when Drafts is read, and a host that refuses with TokenRefused
// input: repliesDue twice
// expect: each rejects with the failure's own error object
test("TST-953009 the mailbox's and the host's failures pass unchanged out of repliesDue", async () => {
  const unreachable = Object.assign(new Error("no route"), { name: "Unreachable" });
  const refused = Object.assign(new Error("token refused"), { name: "TokenRefused" });
  await assert.rejects(handling.repliesDue?.(fakeMailbox({ draftsFail: unreachable }), [{ address: PRODUCT, host: fakeHost([issue(8, listing(A), { state: "closed" })]) }]), (error) => error === unreachable);
  await assert.rejects(handling.repliesDue?.(fakeMailbox(), [{ address: PRODUCT, host: fakeHost([], { listFails: refused }) }]), (error) => error === refused);
});

// TST-953010
// level: unit
// module: MOD-mail-handling
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; UC-039
// given: two mails; the first has a Reply-To address of another person than its sender
// input: storeReplies(mailbox, [{ mail, body }, { mail, body }])
// expect: two storeDraft calls with Draft { replyTo: the mail, to: that mail's reply address only, subject "Re: " + its subject, body: the reply text followed by the original quoted line by line }; the result lists { id, draft: the stored ref, problem: null } for each
test("TST-953010 each reply is stored as a draft to its mail's reporter only, with the original quoted below", async () => {
  const log = [];
  const first = mail(A, { replyTo: [{ name: null, address: "reporter@example.invalid" }] });
  const second = mail(B, { subject: "Second report", from: { name: null, address: "second@example.invalid" } });
  const result = await handling.storeReplies?.(fakeMailbox({ log }), [{ mail: first, body: "It is fixed in 2026.4." }, { mail: second, body: "Thanks, noted." }]);
  const stored = callsOf(log, "mailbox.storeDraft").map((call) => call[1]);
  assert.equal(stored.length, 2);
  assert.deepEqual(stored[0].to, { name: null, address: "reporter@example.invalid" });
  assert.equal(stored[0].replyTo, first);
  assert.equal(stored[0].subject, "Re: Export fails");
  assert.equal(stored[0].body, "It is fixed in 2026.4.\n\n> Hello,\n> the export fails with an error.\n> Kind regards\n> Erika");
  assert.deepEqual(stored[1].to, { name: null, address: "second@example.invalid" });
  assert.equal(stored[1].subject, "Re: Second report");
  assert.deepEqual(result?.map((entry) => [entry.id, entry.problem]), [[A.id, null], [B.id, null]]);
  assert.ok(result?.every((entry) => entry.draft?.route === "bridge"));
});

// TST-953011
// level: unit
// module: MOD-mail-handling
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039
// given: a mail without a reply address (an empty sender address, no Reply-To), one with an address that is no address, and a mail the route refuses with NoReplyAddress
// input: storeReplies with the three, each with a body
// expect: the first two get { draft: null, problem: "not sendable" } and are never handed to storeDraft; the third gets the same problem; no failure is thrown
test("TST-953011 a mail without a usable reply address gets no draft and the problem not sendable", async () => {
  const log = [];
  const none = mail(A, { from: { name: null, address: "" } });
  const invalid = mail(B, { from: { name: null, address: "not an address" } });
  const result = await handling.storeReplies?.(fakeMailbox({ log }), [{ mail: none, body: "x" }, { mail: invalid, body: "y" }]);
  assert.deepEqual(result, [{ id: A.id, draft: null, problem: "not sendable" }, { id: B.id, draft: null, problem: "not sendable" }]);
  assert.deepEqual(callsOf(log, "mailbox.storeDraft"), []);
  const refused = await handling.storeReplies?.(fakeMailbox({ noAddress: true }), [{ mail: mail(C), body: "z" }]);
  assert.deepEqual(refused, [{ id: C.id, draft: null, problem: "not sendable" }]);
});

// TST-953012
// level: unit
// module: MOD-mail-handling
// guards: A SENT REPLY IS NOTED IN THE ISSUE; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a draft shown to the person, the mailbox sends it on 2026-10-18
// input: sendReply(mailbox, host, 8, A.id, shown)
// expect: sendDraft is called once with the very object shown, and only after it exactly one commentOnIssue(8, "Reply sent to A on 2026-10-18.") with nothing else written
test("TST-953012 a reply is sent as shown and then noted with the identifier and the date", async () => {
  const log = [];
  const shown = { ref: REF_A, sha256: "ab".repeat(32), from: { name: null, address: "reports@example.invalid" }, to: [ERIKA], cc: [], subject: "Re: Export fails", body: "Fixed.", attachments: [] };
  await handling.sendReply?.(fakeMailbox({ log }), fakeHost([], { log }), 8, A.id, shown);
  assert.deepEqual(names(log), ["mailbox.sendDraft", "host.commentOnIssue"]);
  assert.equal(log[0][1], shown);
  assert.deepEqual(log[1], ["host.commentOnIssue", 8, noteText("reply-sent", A.id, "2026-10-18")]);
});

// TST-953013
// level: unit
// module: MOD-mail-handling
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: counter-proof of TST-953012: the mailbox refuses the send with SendRefused, DraftChanged or ConfirmationRefused
// input: sendReply for each
// expect: each rejects with the mailbox's own error object; the host received no call at all (nothing noted), so a sendReply that notes before sending fails here
test("TST-953013 counter-proof: nothing is noted when the send is refused", async () => {
  for (const name of ["SendRefused", "DraftChanged", "ConfirmationRefused"]) {
    const log = [];
    const failure = Object.assign(new Error(name), { name });
    await assert.rejects(handling.sendReply?.(fakeMailbox({ log, sendFails: failure }), fakeHost([], { log }), 8, A.id, { ref: REF_A, sha256: "cd".repeat(32) }), (error) => error === failure);
    assert.deepEqual(names(log), ["mailbox.sendDraft"], name);
  }
});

// TST-953014
// level: unit
// module: MOD-mail-handling
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: the send succeeds but the issue cannot be written to (PermissionMissing)
// input: sendReply
// expect: it rejects with the host's own error object after exactly one sendDraft; the send is not repeated
test("TST-953014 a note that cannot be written is the host's own failure, after a send that happened once", async () => {
  const log = [];
  const denied = Object.assign(new Error("no permission"), { name: "PermissionMissing" });
  await assert.rejects(handling.sendReply?.(fakeMailbox({ log }), fakeHost([], { log, commentFails: denied }), 8, A.id, { ref: REF_A, sha256: "ef".repeat(32) }), (error) => error === denied);
  assert.deepEqual(callsOf(log, "mailbox.sendDraft").length, 1);
});

// TST-953015
// level: unit
// module: MOD-mail-handling
// guards: AN ISSUE WAITING FOR A REPORTER IS LABELLED; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a question shown to the person
// input: askReporter(mailbox, host, 8, A.id, shown)
// expect: sendDraft with the object shown, then the label waiting-for-reporter added to issue 8, then the note "Question sent to A on 2026-10-18."; the issue's state is never set
test("TST-953015 asking the reporter sends the question, labels the issue waiting-for-reporter and leaves it open", async () => {
  const log = [];
  const shown = { ref: REF_A, sha256: "12".repeat(32) };
  await handling.askReporter?.(fakeMailbox({ log }), fakeHost([], { log }), 8, A.id, shown);
  assert.deepEqual(names(log), ["mailbox.sendDraft", "host.setIssueLabels", "host.commentOnIssue"]);
  assert.equal(log[0][1], shown);
  assert.deepEqual(log[1], ["host.setIssueLabels", 8, { add: ["waiting-for-reporter"] }]);
  assert.deepEqual(log[2], ["host.commentOnIssue", 8, noteText("question-sent", A.id, "2026-10-18")]);
});

// TST-953016
// level: unit
// module: MOD-mail-handling
// guards: AN ISSUE WAITING FOR A REPORTER IS LABELLED; UC-039
// given: counter-proof of TST-953015: the question's send is refused
// input: askReporter
// expect: it rejects with the mailbox's own error; no label is set and nothing is noted
test("TST-953016 counter-proof: a refused question labels nothing and notes nothing", async () => {
  const log = [];
  const failure = Object.assign(new Error("refused"), { name: "SendRefused" });
  await assert.rejects(handling.askReporter?.(fakeMailbox({ log, sendFails: failure }), fakeHost([], { log }), 8, A.id, { ref: REF_A, sha256: "34".repeat(32) }), (error) => error === failure);
  assert.deepEqual(names(log), ["mailbox.sendDraft"]);
});

// TST-953017
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: the decision not to answer a mail
// input: noReply(host, 8, A.id), and noReply with a host that refuses with TokenRefused
// expect: one commentOnIssue(8, "No reply to A, decided on <today>.") and nothing else; the refusal passes unchanged
test("TST-953017 not answering a mail is noted in the issue with its identifier and the date", async () => {
  const before = new Date().toISOString().slice(0, 10);
  const log = [];
  await handling.noReply?.(fakeHost([], { log }), 8, A.id);
  const after = new Date().toISOString().slice(0, 10);
  assert.deepEqual(names(log), ["host.commentOnIssue"]);
  assert.ok([before, after].some((day) => log[0][2] === noteText("no-reply", A.id, day)), log[0][2]);
  const refused = Object.assign(new Error("token refused"), { name: "TokenRefused" });
  await assert.rejects(handling.noReply?.(fakeHost([], { commentFails: refused }), 8, A.id), (error) => error === refused);
});
