// ITM-954: the recipes mail-batch and reply-inputs, and the writer mail-drafts, of mailStrategies, through the public MailHandling
// entry, over fake hosts, a fake mailbox and synthetic mails.
// Module: MOD-mail-handling
// Guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; CLOSING AN ISSUE PREPARES ITS REPLIES; UC-038; UC-039
// Level: unit
// Run: node --test tests/mail-handling-strategies.test.mjs

import test from "node:test";
import assert from "node:assert/strict";

const handling = await import(new URL("../src/mail-handling/index.mjs", import.meta.url).href);
// The strategies as MOD-job-runner's `registerStrategies` takes them; a missing export fails each test by name.
const strategies = () => {
  assert.ok(handling.mailStrategies, "MOD-mail-handling offers mailStrategies");
  return handling.mailStrategies;
};

const A = { id: "MAIL-ca171c6d1e8e76f0", messageId: "<sample@example.invalid>" };
const B = { id: "MAIL-f9f8e80f54bb5fa3", messageId: "<other@example.invalid>" };
const C = { id: "MAIL-327d1b3c6e47dfc8", messageId: "<third@example.invalid>" };
const PRODUCT = "https://github.com/example/thesis-tool";
const PULL = "https://github.com/example/thesis-tool/pull/31";

const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
const MAX = { name: "Max Beispiel", address: "max@example.invalid" };
function mail({ id, messageId }, over = {}) {
  return { id, messageId, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.invalid" }],
    cc: [], subject: "Export fails", date: "2026-10-10T08:00:00Z", text: "The export fails with error E42.", attachments: [], folder: "INBOX", ...over };
}
const peopleOf = (from) => ({ names: [from.name], addresses: [from.address], phones: [], accounts: [] });

const issue = (number, title, over = {}) => ({ number, title, body: `Body of ${title}`, labels: [], state: "open", url: `https://example.invalid/${number}`, comments: [], ...over });
function fakeHost({ issues = [], description = "A thesis tool", log = [] } = {}) {
  return { calls: log,
    repositoryInfo: async () => { log.push(["host.repositoryInfo"]); return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description }; },
    listIssues: async (filter) => { log.push(["host.listIssues", filter]); return issues.filter((each) => filter.state === "all" || each.state === filter.state); } };
}

// A job context as far as these strategies read it.
const contextOf = (params) => ({ params, kind: { name: "x" }, product: { address: PRODUCT, host: null }, person: "akmaier", now: new Date("2026-10-19T00:00:00Z") });
const textOf = (parts) => parts.map((part) => part.text).join("\n");
// The check a part must pass: none of a mail's people stand in it, by name or address.
const leaks = (parts, people) => [...people.names, ...people.addresses].some((each) => textOf(parts).includes(each));

const twoMails = () => {
  const first = { mail: mail(A), people: peopleOf(ERIKA), ticked: [] };
  const second = { mail: mail(B, { from: MAX, subject: "Import fails", text: "The import fails with error E43." }), people: peopleOf(MAX), ticked: [] };
  return [first, second];
};
const batchParams = (mails, hosts = [{ address: PRODUCT, host: fakeHost({ issues: [issue(5, "Export is slow"), issue(6, "Closed one", { state: "closed" })] }) }]) =>
  ({ mails, products: hosts });

// TST-954001
// level: unit
// module: MOD-mail-handling
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
// given: two chosen mails from two reporters, one product with a description and open issue 5 and closed issue 6
// input: mailStrategies.recipes["mail-batch"](context, params)
// expect: a part per mail holding its identifier and text; a part with the product's address and its description; a part with open issue 5 by number and title and not issue 6; no part holds either reporter's name or address
test("TST-954001 mail-batch gives a part per mail, the products with their descriptions and the open issues, and no name of the people", async () => {
  const mails = twoMails();
  const parts = await strategies().recipes["mail-batch"](contextOf(batchParams(mails)), batchParams(mails));
  const text = textOf(parts);
  for (const [{ id }, error] of [[A, "E42"], [B, "E43"]]) {
    const part = parts.find((each) => each.text.includes(id));
    assert.ok(part?.text.includes(error), `a part holds ${id} with its text`);
  }
  assert.ok(text.includes(PRODUCT) && text.includes("A thesis tool"), "the product with its description");
  assert.ok(text.includes("#5") && text.includes("Export is slow"), "the open issue");
  assert.ok(!text.includes("Closed one"), "a closed issue is not listed");
  for (const { people } of mails) assert.equal(leaks(parts, people), false, "no person in a part");
  for (const each of parts) assert.ok(each.name && typeof each.text === "string" && each.required === true, "a part as MOD-job-runner reads it");
});

// TST-954002
// level: unit
// module: MOD-mail-handling
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
// given: the same two mails
// input: mail-batch run on a context
// expect: the context holds each mail's people under its identifier, as the check people-search reads them
test("TST-954002 mail-batch puts each mail's people into the job's context, keyed by the mail's identifier", async () => {
  const mails = twoMails();
  const context = contextOf(batchParams(mails));
  await strategies().recipes["mail-batch"](context, context.params);
  assert.deepEqual(context.people, { [A.id]: peopleOf(ERIKA), [B.id]: peopleOf(MAX) });
});

// TST-954003
// level: unit
// module: MOD-mail-handling
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; UC-038
// given: mail A has two attachments with text, a log and a note; the person ticked the log for A only; mail B has an attachment with text, not ticked
// input: mail-batch
// expect: A's part holds the log's text and not the note's text; B's part holds no attachment text; an attachment's name stands in no part
test("TST-954003 mail-batch gives the text of the attachments the person ticked for that mail, and no other", async () => {
  const attachment = (name, text) => ({ name, type: "text/plain", size: text.length, text });
  const [first, second] = twoMails();
  first.mail.attachments = [attachment("erika-export.log", "LOG-LINE-77"), attachment("erika-note.txt", "NOTE-LINE-88")];
  first.ticked = ["erika-export.log"];
  second.mail.attachments = [attachment("max.log", "OTHER-LOG-99")];
  const mails = [first, second];
  const parts = await strategies().recipes["mail-batch"](contextOf(batchParams(mails)), batchParams(mails));
  const partOf = (id) => parts.find((each) => each.text.includes(id)).text;
  assert.ok(partOf(A.id).includes("LOG-LINE-77"));
  assert.ok(!partOf(A.id).includes("NOTE-LINE-88"));
  assert.ok(!partOf(B.id).includes("OTHER-LOG-99"));
  assert.ok(!textOf(parts).includes("erika-export.log"), "an attachment's name can name a person");
});

// TST-954004
// level: unit
// module: MOD-mail-handling
// guards: A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS; UC-038
// given: a recipe that does what the accepted text forbids: it puts the people of each mail into its part
// input: the same leak check as TST-954001 on that recipe's parts
// expect: the check finds the people, so the check does not pass everything; and the real recipe's parts pass it
test("TST-954004 counter-proof: a recipe that puts the people into a part fails the check", async () => {
  const mails = twoMails();
  const params = batchParams(mails);
  const leaking = async (context, given) => {
    const parts = await strategies().recipes["mail-batch"](context, given);
    return [...parts, { name: "people", text: given.mails.map(({ people }) => `${people.names[0]} <${people.addresses[0]}>`).join("\n"), size: 0, sources: [], required: true }];
  };
  const bad = await leaking(contextOf(params), params);
  for (const { people } of mails) assert.equal(leaks(bad, people), true, "the leaking recipe is caught");
  const good = await strategies().recipes["mail-batch"](contextOf(params), params);
  for (const { people } of mails) assert.equal(leaks(good, people), false);
});

// TST-954005
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: closed issue 8 closed with a pull request and in release 2026.10.1, listing mails A (no note, found), B (noted) and C (not in the mailbox)
// input: mailStrategies.recipes["reply-inputs"](context, { due, host })
// expect: a part with the issue's number, title and text, the closing pull request's address and the release; a part for A with its identifier and text; none for B (it has a reply) and none for C; no reporter's name or address in any part
test("TST-954005 reply-inputs gives the issue, the closing pull request and the release, and each listed mail without a reply", async () => {
  const host = fakeHost({ issues: [issue(8, "Export fails", { state: "closed" })] });
  const due = { product: PRODUCT, issue: 8, closedBy: PULL, release: "2026.10.1", mails: [
    { id: A.id, mail: mail(A), draft: null, noted: false },
    { id: B.id, mail: mail(B, { text: "Already answered text" }), draft: null, noted: true },
    { id: C.id, mail: null, draft: null, noted: false }] };
  const params = { due, host };
  const parts = await strategies().recipes["reply-inputs"](contextOf(params), params);
  const text = textOf(parts);
  assert.ok(text.includes("#8") && text.includes("Export fails") && text.includes("Body of Export fails"), "the issue");
  assert.ok(text.includes(PULL), "the closing pull request");
  assert.ok(text.includes("2026.10.1"), "the release");
  assert.ok(parts.some((each) => each.text.includes(A.id) && each.text.includes("error E42")), "mail A");
  assert.ok(!text.includes("Already answered text") && !text.includes(B.id), "a mail with a reply is not listed");
  assert.ok(!text.includes(C.id), "a mail not in the mailbox is not listed");
  assert.equal(leaks(parts, peopleOf(ERIKA)), false);
});

// TST-954006
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: closed issue 9 closed with a commit address and no release known, listing mail A
// input: reply-inputs
// expect: the commit's address is named, and the release is named as not known, not invented
test("TST-954006 reply-inputs names a closing commit and says the release is not known where it is null", async () => {
  const COMMIT = "https://github.com/example/thesis-tool/commit/0123abc";
  const host = fakeHost({ issues: [issue(9, "Import fails", { state: "closed" })] });
  const due = { product: PRODUCT, issue: 9, closedBy: COMMIT, release: null, mails: [{ id: A.id, mail: mail(A), draft: null, noted: false }] };
  const params = { due, host };
  const text = textOf(await strategies().recipes["reply-inputs"](contextOf(params), params));
  assert.ok(text.includes(COMMIT));
  assert.match(text, /release: not known/i);
});

// A fake Mailbox of MOD-mail-routes' interface that records every call, and has a send that must never be called.
function fakeMailbox({ log = [] } = {}) {
  return { calls: log,
    storeDraft: async (draft) => { log.push(["mailbox.storeDraft", draft]); return { route: "bridge", uid: log.length, uidValidity: 1 }; },
    sendDraft: async () => { log.push(["mailbox.sendDraft"]); throw new Error("a writer must never send"); } };
}
const resultOf = (replies) => ({ draft: { replies }, raw: null, drafter: null, rounds: [], remaining: [], forPerson: [], stepFindings: [], classes: null, stoppedBecause: "passed", gate: null, usage: [], written: null });
const dueOf = (mails) => ({ product: PRODUCT, issue: 8, closedBy: PULL, release: null, mails });

// TST-954007
// level: unit
// module: MOD-mail-handling
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: a result with a drafted text for mail A and one for mail B, of the issue's two mails without a reply
// input: mailStrategies.writers["mail-drafts"](result, context)
// expect: the mailbox stores two drafts, each replying to its mail, with the drafted text in its body and addressed to that mail's reporter only; sendDraft is never called; the outcome commits and writes nothing
test("TST-954007 mail-drafts stores each drafted text through storeReplies and sends nothing", async () => {
  const mailbox = fakeMailbox();
  const due = dueOf([{ id: A.id, mail: mail(A), draft: null, noted: false }, { id: B.id, mail: mail(B, { from: MAX, subject: "Import fails" }), draft: null, noted: false }]);
  const params = { due, mailbox };
  const outcome = await strategies().writers["mail-drafts"](resultOf([{ mail: A.id, text: "Fixed in 2026.10.1." }, { mail: B.id, text: "Second text." }]), contextOf(params));
  const stored = mailbox.calls.filter((call) => call[0] === "mailbox.storeDraft").map((call) => call[1]);
  assert.equal(stored.length, 2);
  assert.equal(stored[0].replyTo.id, A.id);
  assert.deepEqual(stored[0].to, ERIKA);
  assert.ok(stored[0].body.startsWith("Fixed in 2026.10.1."));
  assert.equal(stored[1].replyTo.id, B.id);
  assert.deepEqual(stored[1].to, MAX);
  assert.equal(stored[1].subject, "Re: Import fails");
  assert.deepEqual(mailbox.calls.filter((call) => call[0] === "mailbox.sendDraft"), []);
  assert.deepEqual([outcome.commits, outcome.files, outcome.pullRequest], [[], [], null]);
  assert.deepEqual(outcome.shown.map((each) => [each.id, each.problem]), [[A.id, null], [B.id, null]]);
});

// TST-954008
// level: unit
// module: MOD-mail-handling
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039
// given: a result with a text for mail A, for a mail the issue does not list, and for B, which has a reply already
// input: mail-drafts
// expect: only A is stored; the other two are named in the outcome's notes and nothing is stored for them
test("TST-954008 counter-proof: mail-drafts stores no draft for a mail the issue does not list or that has a reply", async () => {
  const mailbox = fakeMailbox();
  const due = dueOf([{ id: A.id, mail: mail(A), draft: null, noted: false }, { id: B.id, mail: mail(B), draft: null, noted: true }]);
  const outcome = await strategies().writers["mail-drafts"](resultOf([{ mail: A.id, text: "One." }, { mail: C.id, text: "Other." }, { mail: B.id, text: "Two." }]), contextOf({ due, mailbox }));
  const stored = mailbox.calls.filter((call) => call[0] === "mailbox.storeDraft");
  assert.deepEqual(stored.map((call) => call[1].replyTo.id), [A.id]);
  assert.equal(outcome.notes.length, 2);
  assert.ok(outcome.notes.some((note) => note.includes(C.id)) && outcome.notes.some((note) => note.includes(B.id)));
});

// TST-954009
// level: unit
// module: MOD-mail-handling
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// given: mail A has no usable reply address, so the mailbox refuses it as NoReplyAddress
// input: mail-drafts
// expect: the outcome's shown holds the problem `not sendable` for A, and the outcome's notes name it
test("TST-954009 mail-drafts names a mail that cannot be answered", async () => {
  const mailbox = { calls: [], storeDraft: async () => { throw Object.assign(new Error("none"), { name: "NoReplyAddress" }); } };
  const due = dueOf([{ id: A.id, mail: mail(A), draft: null, noted: false }]);
  const outcome = await strategies().writers["mail-drafts"](resultOf([{ mail: A.id, text: "One." }]), contextOf({ due, mailbox }));
  assert.deepEqual(outcome.shown.map((each) => [each.id, each.draft, each.problem]), [[A.id, null, "not sendable"]]);
  assert.ok(outcome.notes.some((note) => note.includes(A.id) && note.includes("not sendable")));
});
