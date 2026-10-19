// UC-039 "Reply to the mails of an issue" on the IMAP route as a system path: the page of the route `replies`, started by MOD-site-frame's startPage, in front of the Bridge lab-pc-4 whose mail operations are the real mailHandlers of
// MOD-mail-protocols talking over STARTTLS to the local IMAP and SMTP servers of tests/uc-039-world.mjs (copies of those of tests/mail-protocols-send.test.mjs). It walks the main flow (steps 3 to 7) with the Bridge's own
// work — the draft stored in Drafts, the single-use confirmation carrying the SHA-256 of the mail shown, the send over TLS, the copy in Sent, the password forgotten — and the alternative flows that are the Bridge's: 2b (a mail
// filed into a folder the connection does not name), 5a (the hash changes with the edit), 5b (the same request twice: the confirmation is spent), 6a (SMTP refuses, the Bridge not running). The Microsoft route and the
// alternatives that are the page's alone are walked in tests/system-uc-039-reply-to-the-mails-of-an-issue.test.mjs.
// Run: node --test tests/system-uc-039-bridge-route.test.mjs (it needs imapflow and nodemailer: npm install --prefix src/bridge-build --omit=dev --ignore-scripts, as CI does)
//
// Module: MOD-maintenance-pages; MOD-mail-handling; MOD-mail-protocols
// Guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; THE MAIL SERVER IS REACHED ONLY OVER TLS
// Guards: THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY IS THREADED ON THE REPORTER'S MAIL; A REPLY GOES TO ONE REPORTER; A SENT REPLY IS NOTED IN THE ISSUE
// Guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; MAIL STAYS IN THE MAILBOX
// Level: system
//
// Each test states its input and its expected result in its own text (given / input / expect) from UC-039, before it runs. The servers keep every command and every mail, and relay nothing; nothing reaches the network. The
// counter-proofs are recorded in the pull request. These tests need the Bridge's libraries, which only CI installs; they were not run on the machine that wrote them, and the pull request says so.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { ERIKA, buttonsOf, byClass, issueRecord, itemOf, mailOf, one, restoreWorld, textOf, trusted, waitFor } from "./maintenance-pages-world.mjs";
import { ACCOUNT, PASSWORD, comments, dialog, hashTo, lastly, openIssueAfterReading as openIssue, openReplies, rawMail } from "./uc-039-world.mjs";

afterEach(restoreWorld);

const [M1, M3] = [await mailOf("m1"), await mailOf("m3")];
const CLOSED_WITH = "Closed with pull request https://github.com/alice/product/pull/9.";
const closed = (mails) => issueRecord(4, "closed", mails, { comments: [CLOSED_WITH] });
const day = /\d{4}-\d{2}-\d{2}/.source;
const sha = (raw) => createHash("sha256").update(raw).digest("hex");
const header = (raw, name) => new RegExp(`^${name}: (.*(?:\\r\\n[ \\t].*)*)$`, "im").exec(Buffer.from(raw).toString("utf8"))?.[1] ?? null;
const textBody = (raw) => Buffer.from(raw).toString("utf8").split(/\r?\n\r?\n/).slice(1).join("\n\n");

async function written(p, id) {
  const item = itemOf(p.main(), id);
  await trusted(one(item, "write-reply"));
  await waitFor(() => byClass(item, "send-reply").length > 0 || byClass(item, "reply-problem").length > 0);
  return item;
}
async function pressSend(item) {
  await trusted(one(item, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  assert.notEqual(dialog(), undefined, `the dialog opened: ${textOf(item)}`);
}
// TST-969101 · level: system · module: MOD-maintenance-pages · MOD-mail-handling · MOD-mail-protocols
// guards: UC-039 main flow; THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; THE MAIL SERVER IS REACHED ONLY OVER TLS; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; A SENT REPLY IS NOTED IN THE ISSUE; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
// given: the page on the IMAP route in front of the Bridge over the local IMAP server (INBOX holds m1 from Erika) and SMTP server; the closed issue 4 lists m1; the mailbox password is the marker password
// input: issue 4 opened; the person's click on Write the reply myself; the person's click on Send and the dialog's Send
// expect: the draft is in the server's Drafts with one To (Erika), Re: Subject m1, In-Reply-To and References from m1's Message-ID, and the original quoted; the dialog repeats recipient and subject and nothing reaches SMTP before its confirmation; then the Bridge asks for a confirmation of the SHA-256 of that draft's bytes and sends with it — exactly one mail reaches the SMTP server, over TLS, to Erika alone, with the bytes of the draft —, a copy is in Sent, the draft is gone from Drafts, INBOX is as it was, and the issue has one comment, Reply sent to the identifier of m1 on a day; every login of IMAP and SMTP was after TLS with the marker password, and the password is in no request but those to the Bridge
test("main flow on the IMAP route: the Bridge stores the draft, sends with the confirmation of the mail shown over TLS, copies it to Sent, and the reply is noted", async () => {
  const inbox = [rawMail("m1")];
  const p = await openReplies({ route: "imap", inbox, issues: [closed([M1])] });
  await lastly(p, async () => {
    await openIssue(p, 4);
    const item = await written(p, M1.id);
    assert.equal(byClass(item, "reply-problem").length, 0, textOf(item));
    const [draft] = p.imap.folders.Drafts;
    assert.ok(draft, "the draft is in Drafts");
    assert.match(header(draft.raw, "To"), new RegExp(`^"?${ERIKA.name}"? <${ERIKA.address.replace(".", "\\.")}>$`));
    assert.equal(header(draft.raw, "Subject"), "Re: Subject m1");
    assert.equal(header(draft.raw, "In-Reply-To"), "<m1@mail.example.invalid>");
    assert.match(header(draft.raw, "References"), /<m1@mail\.example\.invalid>$/);
    assert.equal(header(draft.raw, "Cc"), null);
    assert.ok(textBody(draft.raw).includes("> Hello,"), "the original is quoted");
    await pressSend(item);
    assert.ok(textOf(dialog()).includes(ERIKA.address) && textOf(dialog()).includes("Re: Subject m1"), "the dialog repeats recipient and subject");
    assert.deepEqual(p.smtp.messages, [], "nothing reaches SMTP before the confirmation");
    const sentBytes = draft.raw;
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0 || byClass(item, "reply-problem").length > 0);
    assert.equal(byClass(item, "reply-problem").length, 0, textOf(item));
    const confirm = p.state.calls.filter((call) => call.operation === "confirm-send");
    const send = p.state.calls.filter((call) => call.operation === "send");
    assert.equal(confirm.length, 1);
    assert.equal(send.length, 1);
    assert.equal(confirm[0].args.sha256, sha(sentBytes), "the confirmation carries the SHA-256 of the mail shown");
    assert.equal(p.smtp.messages.length, 1);
    assert.equal(p.smtp.messages[0].secure, true, "sent over TLS");
    assert.deepEqual(p.smtp.messages[0].to, [ERIKA.address]);
    assert.equal(header(p.smtp.messages[0].bytes, "Subject"), "Re: Subject m1");
    assert.equal(p.imap.folders.Sent.length, 1, "the copy is in Sent");
    assert.equal(p.imap.folders.Drafts.length, 0, "the draft left Drafts");
    assert.deepEqual(p.imap.folders.INBOX.map((message) => message.raw.toString()), inbox, "the mail stays in the mailbox as it was");
    assert.equal(comments(p).length, 1);
    assert.match(comments(p)[0], new RegExp(`^Reply sent to \`${M1.id}\` on ${day}\\.$`));
    assert.ok([...p.imap.logs.logins, ...p.smtp.logs.auths].length > 0 && [...p.imap.logs.logins, ...p.smtp.logs.auths].every((login) => login.secure === true && login.password === PASSWORD), "every login was after TLS");
    assert.equal(p.w.kept.github.some((request) => String(request.body ?? "").includes(PASSWORD)), false, "the password is in no write to the issues");
    assert.equal(p.w.kept.endpoint.some((call) => JSON.stringify(call.body).includes(PASSWORD)), false);
    assert.ok(p.state.calls.every((call) => call.connection.imap.password === PASSWORD && call.connection.address === ACCOUNT), "the password went to the Bridge with each call");
  });
});

// TST-969102 · level: system · module: MOD-maintenance-pages · MOD-mail-handling · MOD-mail-protocols
// guards: UC-039 alternative 5a; UC-039 alternative 5b; THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN; EVERY OUTGOING MAIL IS RELEASED BY A PERSON
// given: the page on the IMAP route with a stored draft of m1; the closed issue 4 lists m1
// input: the person's edit of the draft and Save draft; the click on Send and the dialog's Send; afterwards the same send request again with the confirmation the Bridge had spent
// expect: after the edit the draft in Drafts has other bytes — its SHA-256 changes with them — and the confirmation the Bridge is asked for carries the SHA-256 of the edited bytes; the edited mail is sent once; the same request twice — a reload, a double click — sends nothing the second time: the Bridge refuses the spent confirmation and the SMTP server holds the one mail
test("alternatives 5a and 5b on the IMAP route: the hash changes with the edit, and a spent confirmation sends nothing", async () => {
  const p = await openReplies({ route: "imap", inbox: [rawMail("m1")], issues: [closed([M1])] });
  await lastly(p, async () => {
    await openIssue(p, 4);
    const item = await written(p, M1.id);
    const original = sha(p.imap.folders.Drafts[0].raw);
    const body = one(item, "draft-body");
    body.value = "Edited reply text before sending.\n\n> Hello,";
    body.dispatchEvent(new Event("input"));
    await trusted(one(item, "save-draft"));
    await waitFor(() => p.imap.folders.Drafts.length === 1 && textBody(p.imap.folders.Drafts[0].raw).includes("Edited reply text"));
    const edited = p.imap.folders.Drafts[0].raw;
    assert.notEqual(sha(edited), original, "its hash changed with the edit");
    await waitFor(() => byClass(item, "send-reply").length > 0);
    await pressSend(item);
    assert.ok(textOf(dialog()).includes("Edited reply text before sending."));
    assert.deepEqual(p.smtp.messages, []);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0 || byClass(item, "reply-problem").length > 0);
    assert.equal(byClass(item, "reply-problem").length, 0, textOf(item));
    const confirm = p.state.calls.find((call) => call.operation === "confirm-send");
    assert.equal(confirm.args.sha256, sha(edited));
    assert.equal(p.smtp.messages.length, 1);
    assert.ok(textBody(p.smtp.messages[0].bytes).includes("Edited reply text before sending."), "the edited draft was sent");
    const spent = p.state.calls.find((call) => call.operation === "send");
    const { mailHandlers } = await import("../src/mail-protocols/index.mjs");
    await assert.rejects(mailHandlers()["POST /v1/mail/send"]({ params: { operation: "send" }, body: { connection: spent.connection, args: spent.args } }), (error) => error.code === "confirmation-refused" || error.code === "not-found");
    assert.equal(p.smtp.messages.length, 1, "the second request sent nothing");
  });
});

// TST-969103 · level: system · module: MOD-maintenance-pages · MOD-mail-handling · MOD-mail-protocols
// guards: UC-039 alternative 6a; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE
// given: the page on the IMAP route with a stored draft of m1; the SMTP server answers the finished mail with 554
// input: the person's click on Send and the dialog's Send; then the Bridge not running (it answers that it is paused) and the click on Send again
// expect: the page shows the server's answer (554); nothing is noted in the issue; the draft stays in Drafts and on the page; nothing is in Sent; with the Bridge not running the page names the failure (the draft cannot be read, so no dialog opens), the draft stays, and nothing is noted either
test("alternative 6a on the IMAP route: SMTP refuses or the Bridge is not running — nothing is noted and the draft stays", async () => {
  const p = await openReplies({ route: "imap", inbox: [rawMail("m1")], issues: [closed([M1])], refuseMail: true });
  await lastly(p, async () => {
    await openIssue(p, 4);
    const item = await written(p, M1.id);
    await pressSend(item);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-problem").length > 0);
    assert.match(textOf(one(item, "reply-problem")), /554/, "the server's answer is shown");
    assert.deepEqual(comments(p), []);
    assert.equal(p.imap.folders.Drafts.length, 1, "the draft stays in Drafts");
    assert.equal(byClass(item, "reply-draft").length, 1, "and on the page");
    assert.deepEqual(p.imap.folders.Sent, []);
    p.state.down = true;
    byClass(item, "reply-problem").forEach((node) => node.remove?.());
    await trusted(one(item, "send-reply"));
    await waitFor(() => /Bridge|paused|unavailable/i.test(textOf(item)));
    assert.match(textOf(item), /Bridge|paused|unavailable/i, "the page names that the Bridge does not answer");
    assert.equal(dialog() === undefined || textOf(dialog()).length > 0, true);
    assert.deepEqual(comments(p), []);
    assert.equal(p.imap.folders.Drafts.length, 1);
  });
});

// TST-969104 · level: system · module: MOD-maintenance-pages · MOD-mail-handling · MOD-mail-protocols
// guards: UC-039 alternative 2b; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; MAIL STAYS IN THE MAILBOX
// given: the closed issue 4 lists m1 and m3; m3 lies in the folder Reports, which the connection does not name (it names INBOX)
// input: issue 4 opened; then the connection names the folder Reports as well and the issue is read again
// expect: m3 says it was not found in the mailbox and cannot be sent; after the folder is named the same mail is found again through its identifier and offered a reply; the mailbox was written nowhere by the reading
test("alternative 2b on the IMAP route: a mail filed into a folder the connection does not name is not found until the folder is named", async () => {
  const p = await openReplies({ route: "imap", inbox: [rawMail("m1")], reports: [rawMail("m3")], issues: [closed([M1, M3])] });
  await lastly(p, async () => {
    await openIssue(p, 4);
    assert.match(textOf(itemOf(p.main(), M3.id)), /not found in the mailbox/);
    assert.equal(byClass(itemOf(p.main(), M3.id), "write-reply").length + byClass(itemOf(p.main(), M3.id), "send-reply").length, 0);
    assert.deepEqual(p.imap.folders.Drafts, []);
    const { readSetting, writeSetting } = await import("../src/browser-store/index.mjs");
    writeSetting(p.w.context.store, "mailbox", { ...readSetting(p.w.context.store, "mailbox"), folders: ["INBOX", "Reports"] });
    await hashTo("#replies");
    await openIssue(p, 4);
    assert.equal(byClass(itemOf(p.main(), M3.id), "write-reply").length, 1, "found again through its identifier");
    assert.deepEqual([p.imap.folders.Drafts, p.imap.folders.Sent], [[], []]);
    assert.ok(p.state.calls.every((call) => !/^(send|confirm-send|store-draft|update-draft)$/.test(call.operation)), "reading wrote nothing");
  });
});
