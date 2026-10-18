// ITM-952: reading new mail without the decided ones, and carrying out a person's decision on a mail (create, add), through the
// public MailHandling entry, over a fake mailbox, fake hosts of the accepted issue functions and synthetic mails.
// Module: MOD-mail-handling
// Guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; UC-038
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
