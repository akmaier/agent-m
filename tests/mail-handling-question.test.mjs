// The recipe `reply-inputs` with the parameter `question` (ITM-1026) — MOD-mail-handling.md:126-129 (blob 6cd79c5ff469): "recipe `reply-inputs` — for drafting replies: the issue, what solved it ... and each listed mail without a reply. With the parameter
// `question`, for an open issue: the issue, the person's point to ask, and the one listed mail the question answers (UC-039 1a). writer `mail-drafts` — the drafted texts stored as drafts through `storeReplies`; it sends nothing."
// Run: node --test tests/mail-handling-question.test.mjs
//
// Module: MOD-mail-handling
// Guards: UC-039; A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; EVERY OUTGOING MAIL IS RELEASED BY A PERSON
// Level: unit
//
// Over a fake host, a fake mailbox and a synthetic mail, through the public entry. Readings the texts leave open, which the tests state (the pull request names them): the caller gives `question` as a text and the `due` of the open issue with the one listed mail
// the question answers (the other mails left out); the recipe gives three parts, named `issue`, `question` and `mail <id>`, the issue part naming no solution (an open issue has none), and refuses with a TypeError a blank question, a due with no mail found in the
// mailbox and a due with more than one. The mail's headers go into no part. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";

const handling = await import(new URL("../src/mail-handling/index.mjs", import.meta.url).href);
const recipe = () => handling.mailStrategies.recipes["reply-inputs"];

const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
const mailOf = (id, over = {}) => ({ id, messageId: `<${id}@mail.example.invalid>`, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.invalid" }], cc: [],
  subject: "Export fails", date: "2026-10-10T08:00:00Z", text: "The export fails with error E42.", attachments: [], folder: "INBOX", ...over });
const entry = (id, over = {}) => ({ id, mail: mailOf(id), draft: null, noted: false, ...over });
const host = { listIssues: async () => [{ number: 6, title: "Export fails", body: "Export fails for a thesis.", labels: [], state: "open", url: "u", comments: [] }] };
const dueOf = (...mails) => ({ product: "https://github.com/example/thesis-tool", issue: 6, closedBy: null, release: null, mails });
const POINT = "Which version of the tool do you use?";
const parts = (due, params) => recipe()({ params: { due, host, ...params } }, { due, host, ...params });
const textOf = (given) => given.map((part) => part.text).join("\n");

// TST-1026101 · level: unit · module: MOD-mail-handling
// guards: UC-039 (1a); A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
// given: an open issue with one listed mail found in the mailbox, and the person's point
// input: reply-inputs with the parameter question
// expect: three parts in the order issue, question, mail: the issue part holds the issue's number, title and text and no "Solved by" or "Release"; the question part holds the person's point; the mail part holds the mail's identifier, subject, date and text and not its sender's name or address
test("with the parameter question the recipe gives the issue, the person's point and the one mail", async () => {
  const given = await parts(dueOf(entry("MAIL-1111111111111111")), { question: POINT });
  assert.deepEqual(given.map((part) => part.name), ["issue", "question", "mail MAIL-1111111111111111"]);
  assert.match(given[0].text, /Issue #6: Export fails/);
  assert.match(given[0].text, /Export fails for a thesis\./);
  assert.doesNotMatch(given[0].text, /Solved by|Release/);
  assert.ok(given[1].text.includes(POINT));
  assert.ok(given[2].text.includes("Subject: Export fails") && given[2].text.includes("The export fails with error E42.") && given[2].text.includes("2026-10-10"));
  assert.equal(textOf(given).includes("Erika") || textOf(given).includes(ERIKA.address), false, "the mail's headers go into no part");
});

// TST-1026102 · level: unit · module: MOD-mail-handling
// guards: UC-039
// given: the same due without the parameter question
// input: reply-inputs
// expect: the recipe gives what it gave before: the issue part says "Solved by: not known" and "Release: not known", and one part for the mail; no part named question
test("without the parameter question the recipe is the recipe of replies", async () => {
  const given = await parts(dueOf(entry("MAIL-1111111111111111")), {});
  assert.deepEqual(given.map((part) => part.name), ["issue", "mail MAIL-1111111111111111"]);
  assert.match(given[0].text, /Solved by: not known/);
});

// TST-1026103 · level: unit · module: MOD-mail-handling
// guards: UC-039 (1a)
// given: a blank question; a due whose mail is not in the mailbox; a due with two mails found
// input: reply-inputs with the parameter question for each
// expect: each is refused with a TypeError and gives no part
test("a blank question, no mail found and more than one mail are refused", async () => {
  await assert.rejects(Promise.resolve().then(() => parts(dueOf(entry("MAIL-1111111111111111")), { question: "   " })), TypeError);
  await assert.rejects(Promise.resolve().then(() => parts(dueOf(entry("MAIL-1111111111111111", { mail: null })), { question: POINT })), TypeError);
  await assert.rejects(Promise.resolve().then(() => parts(dueOf(entry("MAIL-1111111111111111"), entry("MAIL-2222222222222222")), { question: POINT })), (error) => error instanceof TypeError && /one listed mail/.test(error.message));
});

// TST-1026104 · level: unit · module: MOD-mail-handling
// guards: UC-039 (1a); EVERY OUTGOING MAIL IS RELEASED BY A PERSON
// given: the question the participant drafted for the mail of an open issue, and a mailbox that records what it is given
// input: the writer mail-drafts with the question as the reply text
// expect: one draft is stored through the mailbox, to that mail's reporter, subject Re: its subject, the text above the original quoted; nothing is sent (no sendDraft)
test("the writer stores the drafted question as a draft and sends nothing", async () => {
  const calls = [];
  const mailbox = { storeDraft: async (draft) => { calls.push(["storeDraft", draft]); return { route: "bridge", uid: 1, uidValidity: 1 }; }, sendDraft: async () => { calls.push(["sendDraft"]); } };
  const due = dueOf(entry("MAIL-1111111111111111"));
  const written = await handling.mailStrategies.writers["mail-drafts"]({ draft: { replies: [{ mail: "MAIL-1111111111111111", text: "Which version do you use?" }] } }, { params: { due, mailbox } });
  assert.deepEqual(calls.map(([name]) => name), ["storeDraft"]);
  assert.equal(calls[0][1].to.address, ERIKA.address);
  assert.equal(calls[0][1].subject, "Re: Export fails");
  assert.ok(calls[0][1].body.startsWith("Which version do you use?") && calls[0][1].body.includes("> The export fails with error E42."));
  assert.equal(written.shown.length, 1);
});
