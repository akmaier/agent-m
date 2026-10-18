// ITM-952 and ITM-953: reading new mail without the decided ones and carrying out a person's decision on a mail (TST-952001 to
// TST-952019); the replies due, stored as drafts, sent as shown and noted in the issue (TST-953001 to TST-953017). Through the public
// MailHandling entry, over a fake mailbox, fake hosts of the accepted issue functions and synthetic mails.
// Module: MOD-mail-handling
// Guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; CLOSING AN ISSUE PREPARES ITS REPLIES; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; AN ISSUE WAITING FOR A REPORTER IS LABELLED; UC-038; UC-039
// Level: unit
// Run: node --test tests/mail-handling-intake.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import { noteText, mailId } from "../src/mail-records/index.mjs";

// Only the not-yet-built public entry is tolerated as missing. Broken transitive imports and other loader errors still throw.
const entry = new URL("../src/mail-handling/index.mjs", import.meta.url);
const handling = await import(entry.href).catch((error) => {
  if (error.code !== "ERR_MODULE_NOT_FOUND" || error.url !== entry.href) throw error;
  return {};
});

// The identifiers below are literals checked before execution, not computed by the code under test. The two Message-ID
// identifiers are those of tests/mail-records-identifier.test.mjs (TST-631001, TST-631002).
const ROOT_ID = "MAIL-ca171c6d1e8e76f0"; // <sample@example.invalid>
const OTHER_ID = "MAIL-f9f8e80f54bb5fa3"; // <other@example.invalid>
const NEW_ID = "MAIL-1111111111111111";
const MARKED_ID = "MAIL-2222222222222222";
const LISTED_ID = "MAIL-3333333333333333";
const REPLY_ID = "MAIL-4444444444444444";
const REPLY_B_ID = "MAIL-5555555555555555";

const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
function mail(id, over = {}) {
  return { id, messageId: `<${id.toLowerCase()}@mail.example.invalid>`, inReplyTo: null, references: [], from: ERIKA, replyTo: [],
    to: [{ name: null, address: "reports@example.invalid" }], cc: [], subject: "Export fails", date: "2026-10-18T08:00:00Z",
    text: "Hello,\nthe export fails with an error.\nKind regards\nErika Mustermann", attachments: [], folder: "INBOX", ...over };
}

// A fake Mailbox of MOD-mail-routes' interface that records every call it receives.
function fakeMailbox(mails, { fail = null } = {}) {
  const calls = [];
  const record = (name, result) => async (...args) => { calls.push([name, ...args]); return result; };
  return { calls,
    read: async (...args) => { calls.push(["read", ...args]); if (fail) throw fail; return mails; },
    test: record("test", {}), find: record("find", null), drafts: record("drafts", []), sent: record("sent", []),
    storeDraft: record("storeDraft", null), updateDraft: record("updateDraft", null), showDraft: record("showDraft", null),
    sendDraft: record("sendDraft", { sentAt: "" }) };
}

// A fake Host with the accepted signatures of MOD-repository-hosts.md (listIssues, createIssue, commentOnIssue, setIssueLabels,
// setIssueState), which records every call. An issue is MOD-repository-hosts' Issue: its comments carry author, body, date.
function fakeHost(issues, { commentFails = null, createFails = null } = {}) {
  const calls = [];
  return { calls,
    listIssues: async (filter) => { calls.push(["listIssues", filter]); return issues; },
    createIssue: async (issue) => { calls.push(["createIssue", issue]); if (createFails) throw createFails; return { number: 77, title: issue.title, body: issue.body, labels: issue.labels, state: "open", url: "u", comments: [] }; },
    commentOnIssue: async (number, body) => { calls.push(["commentOnIssue", number, body]); if (commentFails) throw commentFails; },
    setIssueLabels: async (...args) => { calls.push(["setIssueLabels", ...args]); },
    setIssueState: async (...args) => { calls.push(["setIssueState", ...args]); } };
}
const issue = (number, body, over = {}) => ({ number, title: `Issue ${number}`, body, labels: [], state: "open", url: `https://example.invalid/${number}`, comments: [], ...over });
const callsOf = (host, name) => host.calls.filter((call) => call[0] === name);

const ERIKA_PEOPLE = { names: ["Erika Mustermann"], addresses: ["erika@example.invalid"], phones: [], accounts: [] };
const PRODUCT = "https://github.com/example/thesis-tool";

// A note's date is today's; it is accepted for the day before and the day after the call, so that midnight does not fail it.
function isNote(body, kind, id, before, after) {
  return [before, after].some((day) => body === noteText(kind, id, day));
}
const day = () => new Date().toISOString().slice(0, 10);

// TST-952001
// level: unit
// module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; UC-038
// given: the mailbox holds a new mail, a mail an issue lists, and a mail this browser marked; the identifier controls of MOD-mail-records work
// input: readNewMail(mailbox, [{ address, host }], [MARKED_ID]) where the product's issue 4 lists LISTED_ID in its Mails line
// expect: proposable holds only the new mail with its people (the name and address of its header, the name of its signature), decided is 2, attached is empty
test("TST-952001 a mail an issue lists and a mail marked not an issue are left out and counted as decided", async () => {
  assert.equal(await mailId({ messageId: "<sample@example.invalid>", bytes: null }), ROOT_ID);
  const newMail = mail(NEW_ID);
  const mails = [mail(LISTED_ID), newMail, mail(MARKED_ID)];
  const host = fakeHost([issue(4, `Export fails.\n\nMails: \`${LISTED_ID}\``)]);
  const result = await handling.readNewMail?.(fakeMailbox(mails), [{ address: PRODUCT, host }], [MARKED_ID]);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [NEW_ID]);
  assert.deepEqual(result?.proposable[0].mail, newMail);
  assert.ok(result?.proposable[0].people.names.includes("Erika Mustermann"));
  assert.ok(result?.proposable[0].people.addresses.includes("erika@example.invalid"));
  assert.equal(result?.decided, 2);
  assert.deepEqual(result?.attached, []);
});

// TST-952002
// level: unit
// module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; UC-038
// given: counter-proof of TST-952001: the same mails, no mail marked and no issue listing any of them
// input: readNewMail(mailbox, [{ address, host }], []) with an issue that lists a different identifier
// expect: all three mails are proposable and decided is 0; a mail marked in TST-952001 is proposed here, so a readNewMail that ignores the marks fails TST-952001
test("TST-952002 counter-proof: without a listing or a mark every mail is proposed", async () => {
  const mails = [mail(LISTED_ID), mail(NEW_ID), mail(MARKED_ID)];
  const host = fakeHost([issue(4, `Export fails.\n\nMails: \`${OTHER_ID}\``)]);
  const result = await handling.readNewMail?.(fakeMailbox(mails), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [LISTED_ID, NEW_ID, MARKED_ID]);
  assert.equal(result?.decided, 0);
});

// TST-952003
// level: unit
// module: MOD-mail-handling
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; UC-038
// given: an issue lists a mail only by a comment in the form of MOD-repository-hosts' Issue (author, body, date)
// input: readNewMail over a mailbox holding that mail and a new mail
// expect: the mail the comment lists is left out and counted; the new mail is proposable
test("TST-952003 a mail an issue lists by a comment is left out", async () => {
  const comment = { author: "someone", body: `Mail \`${LISTED_ID}\` added on 2026-10-01.`, date: "2026-10-01T10:00:00Z" };
  const host = fakeHost([issue(9, "Export fails.", { comments: [comment] })]);
  const result = await handling.readNewMail?.(fakeMailbox([mail(LISTED_ID), mail(NEW_ID)]), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [NEW_ID]);
  assert.equal(result?.decided, 1);
});

// TST-952004
// level: unit
// module: MOD-mail-handling
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; A CLOSED ISSUE IS REOPENED ONLY BY A PERSON; UC-038
// given: a closed issue 6 lists the mail <sample@example.invalid>; a reply names it in In-Reply-To; a second mail is new
// input: readNewMail over both mails
// expect: the reply is attached to {product, issue 6} by exactly one commentOnIssue with the mail-added note of the reply's identifier and today's date; it is not proposable; decided is 0; the issue is not reopened, relabelled or created again
test("TST-952004 a mail whose In-Reply-To names a listed mail is attached by a mail-added note and a closed issue stays closed", async () => {
  const before = day();
  const host = fakeHost([issue(6, `Export fails.\n\nMails: \`${ROOT_ID}\``, { state: "closed" })]);
  const reply = mail(REPLY_ID, { inReplyTo: "<sample@example.invalid>" });
  const result = await handling.readNewMail?.(fakeMailbox([reply, mail(NEW_ID)]), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.attached, [{ id: REPLY_ID, product: PRODUCT, issue: 6 }]);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [NEW_ID]);
  assert.equal(result?.decided, 0);
  const comments = callsOf(host, "commentOnIssue");
  assert.equal(comments.length, 1);
  assert.equal(comments[0][1], 6);
  assert.ok(isNote(comments[0][2], "mail-added", REPLY_ID, before, day()), comments[0][2]);
  assert.deepEqual(callsOf(host, "setIssueState"), []);
  assert.deepEqual(callsOf(host, "setIssueLabels"), []);
  assert.deepEqual(callsOf(host, "createIssue"), []);
});

// TST-952005
// level: unit
// module: MOD-mail-handling
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; UC-038
// given: an open issue 3 lists <sample@example.invalid>; a mail names it only in References, behind another message
// input: readNewMail over that mail
// expect: it is attached to issue 3 by one mail-added note; nothing is proposable
test("TST-952005 a mail whose References name a listed mail is attached", async () => {
  const host = fakeHost([issue(3, `Export fails.\n\nMails: \`${ROOT_ID}\``)]);
  const reply = mail(REPLY_ID, { references: ["<unrelated@example.invalid>", "<sample@example.invalid>"] });
  const result = await handling.readNewMail?.(fakeMailbox([reply]), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.attached, [{ id: REPLY_ID, product: PRODUCT, issue: 3 }]);
  assert.deepEqual(result?.proposable, []);
  assert.equal(callsOf(host, "commentOnIssue").length, 1);
});

// TST-952006
// level: unit
// module: MOD-mail-handling
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; UC-038
// given: counter-proof of TST-952004: a mail that names a message no issue lists
// input: readNewMail over a mail whose In-Reply-To is <other@example.invalid> while the issue lists <sample@example.invalid>
// expect: it is proposable, attached is empty and no comment is written
test("TST-952006 counter-proof: a reply to an unlisted message is proposed and attached to nothing", async () => {
  const host = fakeHost([issue(6, `Export fails.\n\nMails: \`${ROOT_ID}\``)]);
  const reply = mail(REPLY_ID, { inReplyTo: "<other@example.invalid>" });
  const result = await handling.readNewMail?.(fakeMailbox([reply]), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [REPLY_ID]);
  assert.deepEqual(result?.attached, []);
  assert.deepEqual(callsOf(host, "commentOnIssue"), []);
});

// TST-952007
// level: unit
// module: MOD-mail-handling
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; UC-038
// given: two products whose issues both have the number 5, each listing a different mail; a reply names the mail listed in the second product
// input: readNewMail over [first product, second product]
// expect: the reply is attached to {second product, issue 5}; the note is written through the second product's host only
test("TST-952007 a thread is matched within the product whose issue lists the mail", async () => {
  const hostA = fakeHost([issue(5, `Fault A.\n\nMails: \`${OTHER_ID}\``)]);
  const hostB = fakeHost([issue(5, `Fault B.\n\nMails: \`${ROOT_ID}\``)]);
  const reply = mail(REPLY_B_ID, { inReplyTo: "<sample@example.invalid>" });
  const result = await handling.readNewMail?.(fakeMailbox([reply]),
    [{ address: "https://github.com/example/a", host: hostA }, { address: "https://github.com/example/b", host: hostB }], []);
  assert.deepEqual(result?.attached, [{ id: REPLY_B_ID, product: "https://github.com/example/b", issue: 5 }]);
  assert.deepEqual(callsOf(hostA, "commentOnIssue"), []);
  assert.equal(callsOf(hostB, "commentOnIssue").length, 1);
});

// TST-952008
// level: unit
// module: MOD-mail-handling
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; UC-038
// given: a mailbox, a host with open issues, a new mail and a mail to attach
// input: readNewMail over them
// expect: the mailbox receives exactly one call, read; no host creates an issue, sets a label or a state
test("TST-952008 reading changes nothing in the mailbox and creates no issue", async () => {
  const mailbox = fakeMailbox([mail(NEW_ID), mail(REPLY_ID, { inReplyTo: "<sample@example.invalid>" })]);
  const host = fakeHost([issue(6, `Export fails.\n\nMails: \`${ROOT_ID}\``)]);
  await handling.readNewMail?.(mailbox, [{ address: PRODUCT, host }], []);
  assert.deepEqual(mailbox.calls.map((call) => call[0]), ["read"]);
  assert.deepEqual(callsOf(host, "createIssue"), []);
  assert.deepEqual(callsOf(host, "setIssueLabels"), []);
  assert.deepEqual(callsOf(host, "setIssueState"), []);
  assert.deepEqual(callsOf(host, "listIssues").length, 1);
});

// TST-952009
// level: unit
// module: MOD-mail-handling
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; UC-038
// given: the mailbox cannot be reached
// input: readNewMail over a mailbox whose read fails with an error named Unreachable
// expect: it rejects with that same error object, and no host was asked for its issues
test("TST-952009 nothing is read from the hosts when the mailbox cannot be reached", async () => {
  const unreachable = Object.assign(new Error("no route"), { name: "Unreachable" });
  const host = fakeHost([]);
  await assert.rejects(handling.readNewMail?.(fakeMailbox([], { fail: unreachable }), [{ address: PRODUCT, host }], []), (error) => error === unreachable);
  assert.deepEqual(host.calls, []);
});

// TST-952010
// level: unit
// module: MOD-mail-handling
// guards: UC-038
// given: a product's host refuses to list its issues with an error named TokenRefused
// input: readNewMail over a mailbox with one mail
// expect: it rejects with that same error object (Access's errors pass unchanged)
test("TST-952010 a host's refusal while reading issues passes unchanged", async () => {
  const refused = Object.assign(new Error("token refused"), { name: "TokenRefused", tokenName: "Agent M · thesis-tool" });
  const host = fakeHost([]);
  host.listIssues = async () => { throw refused; };
  await assert.rejects(handling.readNewMail?.(fakeMailbox([mail(NEW_ID)]), [{ address: PRODUCT, host }], []), (error) => error === refused);
});

// TST-952011
// level: unit
// module: MOD-mail-handling
// guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; UC-038
// given: an issue that cannot be commented on (PermissionMissing), and a reply to a mail it lists
// input: readNewMail over the reply
// expect: the reply stays proposable and is not attached; the issue that could not be written to is named in unwritten with its product, number and the error's name
test("TST-952011 an issue that cannot be written to is named and its mail stays proposable", async () => {
  const denied = Object.assign(new Error("no permission"), { name: "PermissionMissing" });
  const host = fakeHost([issue(6, `Export fails.\n\nMails: \`${ROOT_ID}\``)], { commentFails: denied });
  const reply = mail(REPLY_ID, { inReplyTo: "<sample@example.invalid>" });
  const result = await handling.readNewMail?.(fakeMailbox([reply]), [{ address: PRODUCT, host }], []);
  assert.deepEqual(result?.proposable.map((entry) => entry.mail.id), [REPLY_ID]);
  assert.deepEqual(result?.attached, []);
  assert.deepEqual(result?.unwritten, [{ product: PRODUCT, issue: 6, error: "PermissionMissing" }]);
});

// TST-952012
// level: unit
// module: MOD-mail-handling
// guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
// given: a person's name in the title of the proposed issue
// input: decideMail({ id, people }, create with the title "Export fails for Erika Mustermann"), a host that would accept the issue
// expect: it rejects with an error named PersonFound whose hits name the person (kind name, value, line 1); createIssue and commentOnIssue are not called
test("TST-952012 create with a person's name in the title refuses with PersonFound and writes nothing", async () => {
  const host = fakeHost([]);
  const decision = { kind: "create", product: PRODUCT, title: "Export fails for Erika Mustermann", text: "The export stops with an error.", label: "defect" };
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, decision, host), (error) => {
    assert.equal(error.name, "PersonFound");
    assert.ok(error.hits.some((hit) => hit.kind === "name" && hit.value === "Erika Mustermann" && hit.line === 1), JSON.stringify(error.hits));
    return true;
  });
  assert.deepEqual(host.calls, []);
});

// TST-952013
// level: unit
// module: MOD-mail-handling
// guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
// given: a person's mail address in the text of the proposed issue, none in its title
// input: decideMail with the text "Please answer erika@example.invalid."
// expect: it rejects with PersonFound whose hits hold the address; nothing is written
test("TST-952013 create with a person's address in the text refuses with PersonFound and writes nothing", async () => {
  const host = fakeHost([]);
  const decision = { kind: "create", product: PRODUCT, title: "Export fails", text: "The export stops.\nPlease answer erika@example.invalid.", label: "defect" };
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, decision, host), (error) => {
    assert.equal(error.name, "PersonFound");
    assert.ok(error.hits.some((hit) => hit.kind === "address" && hit.value === "erika@example.invalid"), JSON.stringify(error.hits));
    return true;
  });
  assert.deepEqual(host.calls, []);
});

// TST-952014
// level: unit
// module: MOD-mail-handling
// guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-038
// given: counter-proof of TST-952012 and TST-952013: the same mail's people, a title and text that name none of them
// input: decideMail with title "Export fails" and text "The export stops with an error.", label defect
// expect: exactly one createIssue with the title, labels [defect] and a body that is the text followed by the line "Mails: `MAIL-1111111111111111`" as its end; the result is { issue: 77 }; no comment is written
test("TST-952014 create without a person's name makes one issue labelled defect whose text ends with the mail's identifier", async () => {
  const host = fakeHost([]);
  const decision = { kind: "create", product: PRODUCT, title: "Export fails", text: "The export stops with an error.", label: "defect" };
  const result = await handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, decision, host);
  assert.deepEqual(result, { issue: 77 });
  const created = callsOf(host, "createIssue");
  assert.equal(created.length, 1);
  assert.equal(created[0][1].title, "Export fails");
  assert.deepEqual(created[0][1].labels, ["defect"]);
  assert.equal(created[0][1].body, `The export stops with an error.\n\nMails: \`${NEW_ID}\``);
  assert.ok(created[0][1].body.endsWith(`\`${NEW_ID}\``));
  assert.deepEqual(callsOf(host, "commentOnIssue"), []);
  assert.deepEqual(host.calls.map((call) => call[0]), ["createIssue"]);
});

// TST-952015
// level: unit
// module: MOD-mail-handling
// guards: AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; UC-038
// given: the label change, and a label that is neither defect nor change
// input: decideMail twice
// expect: change creates one issue labelled [change]; the label "question" rejects with a TypeError and writes nothing
test("TST-952015 an issue from a mail is labelled defect or change and no other label", async () => {
  const host = fakeHost([]);
  const base = { kind: "create", product: PRODUCT, title: "Please add a margin option", text: "The page should offer a margin option." };
  await handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { ...base, label: "change" }, host);
  assert.deepEqual(callsOf(host, "createIssue").map((call) => call[1].labels), [["change"]]);
  const other = fakeHost([]);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { ...base, label: "question" }, other), TypeError);
  assert.deepEqual(other.calls, []);
});

// TST-952016
// level: unit
// module: MOD-mail-handling
// guards: A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; UC-038
// given: a person confirms that a mail describes the existing issue 12
// input: decideMail with { kind: "add", product, issue: 12 }
// expect: exactly one commentOnIssue(12, the mail-added note of NEW_ID with today's date) and nothing else; the result is { issue: 12 }
test("TST-952016 add lists the mail on the existing issue by one mail-added note", async () => {
  const before = day();
  const host = fakeHost([]);
  const result = await handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "add", product: PRODUCT, issue: 12 }, host);
  assert.deepEqual(result, { issue: 12 });
  assert.deepEqual(host.calls.map((call) => call[0]), ["commentOnIssue"]);
  assert.equal(host.calls[0][1], 12);
  assert.ok(isNote(host.calls[0][2], "mail-added", NEW_ID, before, day()), host.calls[0][2]);
});

// TST-952017
// level: unit
// module: MOD-mail-handling
// guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; UC-038
// given: the decision not-an-issue, whose mark is another item's (ITM-956); a host that records its calls, and no host
// input: decideMail with { kind: "not-an-issue" } with a host and with null
// expect: both reject with a TypeError whose message names ITM-956; the host receives no call
test("TST-952017 not an issue throws a TypeError naming ITM-956 and writes nothing", async () => {
  const host = fakeHost([]);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "not-an-issue" }, host), (error) => {
    assert.ok(error instanceof TypeError);
    assert.match(error.message, /ITM-956/);
    return true;
  });
  assert.deepEqual(host.calls, []);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "not-an-issue" }, null), (error) => error instanceof TypeError && /ITM-956/.test(error.message));
});

// TST-952018
// level: unit
// module: MOD-mail-handling
// guards: UC-038
// given: a host that refuses with PermissionMissing on createIssue and with TokenRefused on commentOnIssue
// input: decideMail create, then decideMail add
// expect: each rejects with the host's own error object, unchanged
test("TST-952018 a host's refusal passes unchanged out of create and out of add", async () => {
  const denied = Object.assign(new Error("no permission"), { name: "PermissionMissing", permission: "Issues" });
  const refused = Object.assign(new Error("token refused"), { name: "TokenRefused", tokenName: "Agent M · thesis-tool" });
  const create = { kind: "create", product: PRODUCT, title: "Export fails", text: "The export stops.", label: "defect" };
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, create, fakeHost([], { createFails: denied })), (error) => error === denied);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "add", product: PRODUCT, issue: 12 }, fakeHost([], { commentFails: refused })), (error) => error === refused);
});

// TST-952019
// level: unit
// module: MOD-mail-handling
// guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; UC-038
// given: a decision of a kind the interface does not define, and create or add without a host
// input: decideMail with { kind: "close" }, and create and add with host null
// expect: each rejects with a TypeError; nothing is written
test("TST-952019 an undefined decision and a decision that needs a host without one are refused", async () => {
  const host = fakeHost([]);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "close", product: PRODUCT }, host), TypeError);
  assert.deepEqual(host.calls, []);
  const create = { kind: "create", product: PRODUCT, title: "Export fails", text: "The export stops.", label: "defect" };
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, create, null), TypeError);
  await assert.rejects(handling.decideMail?.({ id: NEW_ID, people: ERIKA_PEOPLE }, { kind: "add", product: PRODUCT, issue: 12 }, null), TypeError);
});

// ------------------------------------------------------------------------------------------------ ITM-953
// The cases below keep their own fixtures in this block, so that their names do not meet those above.
{
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
// expect: no comment is written; the groups are still found (issue 8 in none, issue 9 open), so the case cannot pass without repliesDue
test("TST-953007 counter-proof: a sent mail is not noted for a mail already noted, nor for one a question was sent to", async () => {
  const log = [];
  const host = fakeHost([issue(8, listing(B), { state: "closed", comments: [comment(`Reply sent to \`${B.id}\` on 2026-10-12.`)] }),
    issue(9, listing(C), { comments: [comment(`Question sent to \`${C.id}\` on 2026-10-12.`)] })], { log });
  const toB = mail({ id: "MAIL-8888888888888888", messageId: "<reply@example.invalid>" }, { inReplyTo: B.messageId, date: "2026-10-17T15:30:00Z" });
  const toC = mail({ id: "MAIL-7777777777777777", messageId: "<ask@example.invalid>" }, { inReplyTo: C.messageId, date: "2026-10-12T15:30:00Z" });
  const result = await handling.repliesDue?.(fakeMailbox({ sent: [toB, toC], log }), [{ address: PRODUCT, host }]);
  assert.deepEqual(callsOf(log, "host.commentOnIssue"), []);
  assert.deepEqual([result?.toAnswer.length, result?.answerReceived.length, result?.open.map((due) => due.issue)], [0, 0, [9]]);
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
}
