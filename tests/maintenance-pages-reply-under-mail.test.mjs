// A mail to answer is answered under the mail, in the tab Mail — MOD-maintenance-pages' route `mail` as akmaier accepted it (docs/architecture/MOD-maintenance-pages.md, Interfaces): "each mail that
// `repliesDue`, read with each reading, gives under `toAnswer` with `noted` false marked *to answer*, its details showing under the mail its reply as `replies/<issue>` shows the reply to that one mail — its
// draft, or the text boxes of a reply without one —, with *Draft replies* and its run panel over that mail, *Save draft*, *Send* with its confirmation and *No reply*"; UC-038 step 7: "under the mail, its
// details show its reply as a mail program shows a reply being written — its draft in *Drafts*, or the recipient, the subject `Re:`, an empty text and the original quoted —, drafted, edited and sent there as
// UC-039 steps 3 to 6 say"; UC-039 step 1: "a mail marked *to answer*, under which its reply is written from step 3 on, in the tab **Mail** itself".
// Run: node --test --test-timeout=60000 tests/maintenance-pages-reply-under-mail.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: CLOSING AN ISSUE PREPARES ITS REPLIES; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; ONE CLICK PER DECISION; UC-038; UC-039
// Level: component
//
// The world is tests/maintenance-pages-world.mjs (its standard fixture: the closed issue 4 lists plain, without a draft, and drafted, with one; the closed issue 7 lists answered, noted). The pages and the
// modules they use are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - Under the mail's text, the details of a mail to answer hold <div class="reply-under-mail">: the item the route replies/<issue> draws for that mail (<li class="reply-mail">) and its section
//     <section class="reply-drafting"> over that mail alone. There is no button Answer, and nothing goes to the route replies.
//   - A later reading of the mailbox keeps the reply under the mail as it stands, with what was typed into it.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { draw, timers } from "./main-page-home-harness.mjs";
import { ERIKA, buttonsOf, byClass, flush, mailRead, one, openMail, pages, restoreWorld, routeNamed, standard, textOf, trusted, waitFor, world } from "./maintenance-pages-world.mjs";

afterEach(restoreWorld);

const dialog = () => byClass(document.body, "decision")[0];
const ops = (w, ...names) => w.kept.bridge.filter((call) => names.includes(call.operation));
const comments = (w) => w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/comments"));

// The route mail drawn over the standard fixture, every mail of it in the reading, and read once.
async function mailPage() {
  const f = await standard();
  const w = world({ mails: f.found, drafts: f.drafts, issues: f.issues, reading: f.found });
  assert.ok(routeNamed("mail"), `the route mail: ${pages.error?.message}`);
  const target = await draw(routeNamed("mail"), w.context, {});
  await mailRead(target);
  return { ...f, w, target };
}
// A mail opened, and its reply under it waited for.
async function underMail(target, id) {
  openMail(target, id);
  const details = one(target, "mail-details");
  await waitFor(() => byClass(details, "reply-mail").length > 0 || byClass(details, "reply-problem").length > 0 || byClass(details, "draft-problem").length > 0);
  await waitFor(() => byClass(details, "reply-drafting").length > 0 || byClass(details, "reply-draft").length > 0 && byClass(details, "send-reply").length > 0);
  return details;
}

// TST-20261112501 · level: component · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-038; UC-039
// given: the standard fixture; plain, listed by the closed issue 4, has no draft and no reply note; answered, listed by the closed issue 7, is noted
// input: the route mail drawn and read; plain opened; then answered opened (counter-proof)
// expect: under plain's text its reply is written as a mail program writes one: To Erika's address, the subject "Re: Subject plain", an empty text box, the original quoted, Save draft, Send and No reply, and Draft replies over plain alone; no Answer and no go to replies; answered shows no reply
test("TST-20261112501 a mail to answer without a draft shows under it the reply to be written, with Draft replies over that mail", async () => {
  const { target, mails, w } = await mailPage();
  const details = await underMail(target, mails.plain.id);
  const under = one(details, "reply-under-mail");
  assert.ok(under, "the reply stands under the mail");
  const [text, reply] = [one(details, "mail-text"), under];
  const order = [...details.querySelectorAll?.("*") ?? []];
  if (order.length) assert.ok(order.indexOf(text) < order.indexOf(reply), "the mail first, its reply under it");
  assert.match(textOf(one(under, "draft-to")), new RegExp(ERIKA.address.replace(".", "\\.")));
  assert.equal(textOf(one(under, "draft-subject")), "Re: Subject plain");
  assert.equal(String(one(under, "compose-body").value ?? ""), "");
  assert.match(textOf(one(under, "compose-quoted")), /Kind regards/);
  for (const name of ["save-draft", "send-reply", "no-reply"]) assert.equal(byClass(under, name).length, 1, name);
  const drafting = one(under, "reply-drafting");
  assert.ok(drafting, "Draft replies over that mail");
  assert.equal(byClass(details, "answer-mail").length, 0, "no Answer");
  assert.equal(w.context.went.some(([name]) => name === "replies"), false, "nothing goes to the route replies");
  openMail(target, mails.answered.id);
  await flush();
  assert.equal(byClass(one(target, "mail-details"), "reply-under-mail").length, 0, "counter-proof: a noted mail shows no reply");
});

// TST-20261112502 · level: component · module: MOD-maintenance-pages
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039
// given: plain opened, its reply under it
// input: "We fixed it in 1.5." typed into the text box; the person's click on Save draft
// expect: one store-draft to the Bridge, replying to plain with the typed text; under the mail its draft is shown, with Send
test("TST-20261112502 Save draft under the mail stores the reply in Drafts and shows the draft there", async () => {
  const { target, mails, w } = await mailPage();
  const details = await underMail(target, mails.plain.id);
  const body = one(details, "compose-body");
  body.value = "We fixed it in 1.5.";
  await trusted(one(details, "save-draft"));
  await waitFor(() => byClass(details, "draft-body").length > 0 || byClass(details, "reply-problem").length > 0);
  const stored = ops(w, "store-draft");
  assert.equal(stored.length, 1);
  assert.equal(stored[0].args.draft.replyTo.messageId, mails.plain.messageId);
  assert.match(stored[0].args.draft.body, /We fixed it in 1\.5\./);
  assert.equal(byClass(one(details, "reply-under-mail"), "send-reply").length, 1);
});

// TST-20261112503 · level: component · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; UC-039
// given: drafted, listed by the closed issue 4, with its draft in Drafts
// input: drafted opened; its draft's Send clicked by the person, the dialog declined (counter-proof); Send clicked again and the dialog's Send
// expect: under the mail its draft is shown, its body the draft's; declining sends nothing; the confirmation sends once and notes the reply in issue 4 once
test("TST-20261112503 a mail to answer with a draft shows the draft under it, sent there only on the dialog's confirmation", async () => {
  const { target, mails, w } = await mailPage();
  const details = await underMail(target, mails.drafted.id);
  const under = one(details, "reply-under-mail");
  assert.match(String(one(under, "draft-body").value), /We fixed the export in version 1\.5\./);
  await trusted(one(under, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  await trusted(buttonsOf(dialog(), "Cancel")[0]);
  assert.deepEqual([ops(w, "confirm-send", "send"), comments(w)], [[], []], "counter-proof: declined, nothing is sent");
  await trusted(one(under, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(under, "reply-sent").length > 0 || byClass(under, "reply-problem").length > 0);
  assert.equal(ops(w, "send").length, 1);
  assert.equal(comments(w).length, 1);
  assert.ok(comments(w)[0].path.endsWith("/issues/4/comments"));
});

// TST-20261112504 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; UC-039
// given: plain opened, its reply under it
// input: the person's click on No reply
// expect: one comment on issue 4, the note no-reply naming plain's identifier; the reply under the mail says it is noted
test("TST-20261112504 No reply under the mail notes the decision in the issue with one click", async () => {
  const { target, mails, w } = await mailPage();
  const details = await underMail(target, mails.plain.id);
  await trusted(one(one(details, "reply-under-mail"), "no-reply"));
  await waitFor(() => comments(w).length > 0);
  assert.equal(comments(w).length, 1);
  const note = JSON.parse(comments(w)[0].body).body;
  assert.ok(note.includes(mails.plain.id) && /no reply/i.test(note), note);
  await waitFor(() => byClass(details, "reply-noted").length > 0);
  assert.equal(byClass(details, "reply-noted").length, 1);
});

// TST-20261112505 · level: component · module: MOD-maintenance-pages
// guards: UC-038; UC-039
// given: plain opened, "Half a reply" typed into its text box
// input: the next reading of the mailbox (its timer fired)
// expect: the reading ends; the reply under plain is the same, the text box still holding "Half a reply"
test("TST-20261112505 a later reading keeps the reply under the mail with what was typed", async () => {
  const { target, mails } = await mailPage();
  const details = await underMail(target, mails.plain.id);
  const body = one(details, "compose-body");
  body.value = "Half a reply";
  const before = Number(one(target, "mail-page").getAttribute("data-readings"));
  await timers.fire();
  await mailRead(target, before + 1);
  assert.equal(one(details, "compose-body"), body, "the same text box");
  assert.equal(String(one(details, "compose-body").value), "Half a reply");
});
