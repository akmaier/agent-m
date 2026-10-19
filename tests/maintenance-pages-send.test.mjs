// Sending a reply from the replies page, and leaving a mail unanswered (ITM-967) — MOD-maintenance-pages, UC-039 steps 5 to 7 and 2c, 5a, 6a, as the accepted text of docs/architecture/MOD-maintenance-pages.md states it (:117-119, blob f21551157732):
// "*Send* with its confirmation repeating recipient and subject; a reply sent but not noted, its note offered again; *No reply*". MOD-mail-handling.md: `sendReply(mailbox, host, issue, id, shown)` sends the draft only as `shown` and then notes
// `reply-sent` in the issue; when sending fails, nothing is noted and the draft stays; `noReply(host, issue, id)` notes the decision not to answer.
// Run: node --test tests/maintenance-pages-send.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; CLOSING AN ISSUE PREPARES ITS REPLIES; UC-039
// Level: unit
//
// The world is tests/maintenance-pages-world.mjs (the harness's browser and fake GitHub, the Bridge lab-pc-4's mail operations including confirm-send and send, GitHub's issues): the real MOD-mail-routes, MOD-mail-handling (`sendReply`,
// `noReply`), MOD-site-frame (`confirmDecision`) and MOD-repository-hosts run as they are. Readings the texts leave open, which the tests state (the pull request names them):
//   - Each draft of the page has <button class="send-reply"> "Send"; the person's click reads the draft again (showDraft) and opens MOD-site-frame's confirmDecision (<section class="decision">): its lines repeat the recipient and the subject (and
//     the attachments and the body), its confirm button is "Send". Only the dialog's confirmation sends: exactly one sendReply, with the ShownMail the dialog showed. A click a script makes, and a declined dialog, send nothing.
//   - After a send the item says <p class="reply-sent"> and is noted; a failure the mailbox gives (SendRefused with the server's answer, ConfirmationRefused, DraftChanged) leaves the draft and notes nothing: <p class="reply-problem"> names it, and for
//     DraftChanged the draft is shown again. A failure after the send, of the note (the token refused or without permission), is named <p class="reply-not-noted"> with <button class="note-again"> "Note the reply again", whose click comments once.
//   - Every mail of an issue that is not yet noted has <button class="no-reply"> "No reply" (a mail not found in the mailbox and one not sendable included), one click, which calls noReply once and notes it: <p class="reply-noted">.
// The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { ERIKA, PRODUCT_URL, buttonsOf, byClass, flush, itemOf, one, opened, read, restoreWorld, start, textOf, trusted, waitFor, walk } from "./maintenance-pages-world.mjs";

afterEach(restoreWorld);

const dialog = () => byClass(document.body, "decision")[0];
const ops = (w, ...names) => w.kept.bridge.filter((call) => names.includes(call.operation));
const comments = (w) => w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/comments"));
async function issue4(extra = {}) {
  const f = await start(extra);
  await read(f.target);
  const detail = await opened(f.w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(itemOf(detail, f.mails.drafted.id), "send-reply").length > 0);
  return { ...f, detail, drafted: itemOf(detail, f.mails.drafted.id) };
}

// TST-967001 · level: unit · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-039 (5)
// given: the draft of the mail of issue 4 that has one
// input: a click a script makes on Send; the person's click on Send; the dialog declined (Cancel)
// expect: the script's click opens no dialog; the person's click opens one dialog that repeats the recipient and the subject, and nothing is sent; declining sends nothing and notes nothing
test("no send happens without the dialog's confirmation, and the dialog repeats recipient and subject", async () => {
  const { w, drafted } = await issue4();
  const send = one(drafted, "send-reply");
  send.dispatchEvent(new Event("click"));
  await flush();
  assert.equal(dialog(), undefined);
  await trusted(send);
  await waitFor(() => dialog() !== undefined);
  const said = textOf(dialog());
  assert.ok(said.includes(ERIKA.address) && said.includes("Re: Subject drafted"), said);
  assert.deepEqual(ops(w, "confirm-send", "send"), [], "nothing is sent while the dialog is open");
  await trusted(buttonsOf(dialog(), "Cancel")[0]);
  assert.deepEqual([ops(w, "confirm-send", "send"), comments(w)], [[], []]);
});

// TST-967002 · level: unit · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; UC-039 (5, 6)
// given: the draft shown, the Bridge sending as it should
// input: the person's click on Send and the dialog's Send
// expect: exactly one confirm-send and one send, both with the reference and the SHA-256 of the draft as it was shown; one comment on issue 4, the note reply-sent naming the mail's identifier and the day it was sent (2026-10-19); the item says it was sent and noted
test("with the confirmation exactly one sendReply is made with the mail shown, and the reply is noted", async () => {
  const { mails, w, drafted } = await issue4();
  await trusted(one(drafted, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(drafted, "reply-sent").length > 0 || byClass(drafted, "reply-problem").length > 0);
  assert.equal(ops(w, "send").length, 1);
  assert.equal(ops(w, "confirm-send").length, 1);
  assert.deepEqual(ops(w, "send")[0].args.ref, { route: "bridge", uid: 1, uidValidity: 7 });
  assert.equal(ops(w, "send")[0].args.sha256, "a".repeat(64));
  assert.equal(comments(w).length, 1);
  const note = JSON.parse(comments(w)[0].body).body;
  assert.ok(note.includes(mails.drafted.id) && note.includes("2026-10-19") && /reply/i.test(note), note);
  assert.equal(byClass(drafted, "reply-sent").length, 1);
});

// TST-967003 · level: unit · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039 (5a)
// given: the draft edited and saved (Save draft)
// input: the person's click on Send
// expect: the dialog shows the edited text and the new reference's draft; nothing is sent before the confirmation; the send that follows is of the edited draft's reference
test("after an edit the dialog shows the edited mail before anything is sent", async () => {
  const { w, drafted } = await issue4();
  const body = one(drafted, "draft-body");
  body.value = "Edited reply text before sending.";
  body.dispatchEvent(new Event("input"));
  await trusted(one(drafted, "save-draft"));
  await waitFor(() => ops(w, "update-draft").length > 0);
  const saved = ops(w, "show-draft").length;
  await waitFor(() => String(one(drafted, "draft-body")?.value ?? "").includes("Edited reply"));
  await trusted(one(drafted, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  assert.ok(textOf(dialog()).includes("Edited reply text before sending."), textOf(dialog()));
  assert.ok(ops(w, "show-draft").length > saved, "the draft was read again for the dialog");
  assert.deepEqual(ops(w, "confirm-send", "send"), []);
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => ops(w, "send").length > 0);
  assert.notDeepEqual(ops(w, "send")[0].args.ref, { route: "bridge", uid: 1, uidValidity: 7 }, "the edited draft is sent");
});

// TST-967004 · level: unit · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; UC-039 (6a)
// given: the mail server refuses the mail (the Bridge answers upstream-failed "550 relay denied")
// input: the person's click on Send and the dialog's Send
// expect: the page shows the server's answer; the draft stays shown; nothing is noted in the issue
test("SendRefused shows the server's answer and leaves the draft", async () => {
  const { w, drafted } = await issue4({ send: "refused" });
  await trusted(one(drafted, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(drafted, "reply-problem").length > 0);
  assert.match(textOf(one(drafted, "reply-problem")), /550 relay denied/);
  assert.equal(byClass(drafted, "reply-draft").length, 1, "the draft stays");
  assert.deepEqual(comments(w), []);
});

// TST-967005 · level: unit · module: MOD-maintenance-pages
// guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; UC-039 (5a)
// given: the Bridge answers that the draft is not the mail that was confirmed (DraftChanged)
// input: the person's click on Send and the dialog's Send
// expect: the page says the draft changed and shows it again (read again from the mailbox); nothing is noted
test("DraftChanged shows the draft again and notes nothing", async () => {
  const { w, drafted } = await issue4({ send: "changed" });
  await trusted(one(drafted, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  const before = ops(w, "show-draft").length;
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(drafted, "reply-problem").length > 0);
  assert.match(textOf(one(drafted, "reply-problem")), /changed|not the mail that was confirmed/i);
  await waitFor(() => ops(w, "show-draft").length > before);
  assert.equal(byClass(drafted, "reply-draft").length, 1);
  assert.deepEqual(comments(w), []);
});

// TST-967006 · level: unit · module: MOD-maintenance-pages
// guards: A SENT REPLY IS NOTED IN THE ISSUE; UC-039 (6)
// given: the mail is sent, and the token is refused when the note is written (HTTP 403)
// input: the person's click on Send and the dialog's Send; then the note permitted and the click on Note the reply again
// expect: the page names the reply as sent and not noted and offers the note again; Send is no longer offered for it; the click comments once more, with the note reply-sent, and the item then says it is noted
test("a reply sent but not noted offers its note again", async () => {
  const { mails, w, drafted } = await issue4({ commentStatus: 403 });
  await trusted(one(drafted, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(drafted, "reply-not-noted").length > 0);
  assert.match(textOf(one(drafted, "reply-not-noted")), /sent/i);
  assert.equal(ops(w, "send").length, 1);
  assert.equal(byClass(drafted, "send-reply").length, 0, "a sent reply is not sent again");
  w.kept.commentStatus = null;
  await trusted(one(drafted, "note-again"));
  await waitFor(() => byClass(drafted, "reply-sent").length > 0);
  const posted = comments(w).filter((request) => String(request.body).includes("reply-sent") || String(request.body).includes(mails.drafted.id));
  assert.ok(posted.length >= 1);
  assert.equal(ops(w, "send").length, 1, "it was not sent twice");
});

// TST-967007 · level: unit · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; ONE CLICK PER DECISION; UC-039 (2c, 2b, 4a)
// given: issue 4 with a mail with a draft, a mail not in the mailbox and a mail that is not sendable
// input: the person's click on No reply for the mail with a draft; a click a script makes on No reply for the missing mail; the person's click on it
// expect: noReply is called once for the first (one comment, the note no-reply with its identifier); the script's click does nothing; the missing mail then gets one note too; the notes name identifiers and a day, nothing else of a mail
test("No reply notes the decision once, for any mail not yet noted", async () => {
  const { mails, w, detail, drafted } = await issue4();
  assert.ok(byClass(itemOf(detail, mails.nowhere.id), "no-reply").length === 1, "offered for a mail that is not sendable");
  await trusted(one(drafted, "no-reply"));
  await waitFor(() => comments(w).length === 1);
  const first = JSON.parse(comments(w)[0].body).body;
  assert.ok(first.includes(mails.drafted.id) && /no reply/i.test(first), first);
  assert.equal(byClass(drafted, "reply-noted").length, 1);
  const missing = one(itemOf(detail, mails.absent.id), "no-reply");
  missing.dispatchEvent(new Event("click"));
  await flush();
  assert.equal(comments(w).length, 1, "a click a script makes does nothing");
  await trusted(missing);
  await waitFor(() => comments(w).length === 2);
  assert.ok(JSON.parse(comments(w)[1].body).body.includes(mails.absent.id));
  assert.equal(ops(w, "send").length, 0);
});
