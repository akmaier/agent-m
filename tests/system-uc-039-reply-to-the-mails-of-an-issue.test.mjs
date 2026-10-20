// UC-039 "Reply to the mails of an issue" as a system path: the author opens the route `replies` on the main page, started by MOD-site-frame's startPage over the view of MOD-maintenance-pages, in the browser of tests/maintenance-pages-world.mjs
// (the issues of alice/product, the participants' register, the model endpoints), over the mailbox on the Microsoft route — a fixture server of Microsoft Graph in place of graph.microsoft.com (tests/uc-039-world.mjs) — and walks
// the main flow (steps 1 to 7) and the alternative flows 2a, 2b, 2c, 3a, 3b, 4a, 5a, 5b, 6a, 1a, 1b and 7a, each reached by a person's input: the click on Read replies, the fragment of an issue, a chosen participant and a typed
// name, Run, an edit of a draft, Send and its dialog, No reply, Close and reply, Ask the reporter, Reopen. The Bridge route (the IMAP and SMTP servers) is walked in tests/system-uc-039-bridge-route.test.mjs.
// Run: node --test tests/system-uc-039-reply-to-the-mails-of-an-issue.test.mjs
//
// Module: MOD-maintenance-pages; MOD-mail-handling
// Guards: UC-039; CLOSING AN ISSUE PREPARES ITS REPLIES; A SENT REPLY IS NOTED IN THE ISSUE; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; A REPLY IS THREADED ON THE REPORTER'S MAIL; A REPLY GOES TO ONE REPORTER
// Guards: EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
// Guards: AN ISSUE WAITING FOR A REPORTER IS LABELLED; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; A CLOSED ISSUE IS REOPENED ONLY BY A PERSON; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; THE PAGE NAMES WHERE IT SENDS
// Guards: MAIL STAYS IN THE MAILBOX; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// Each test states its input and its expected result in its own text (given / input / expect) from UC-039, before it runs; none reads an expected value from the page. The mails are the raw texts the fixture Graph holds; their
// identifiers are those of tests/maintenance-pages-world.mjs' mailOf (the hash of the Message-ID). The route is reached as the frame's `go` writes it: the fragment `#replies/issue=<n>/product=<address>` and a hashchange.
// A case already green on main is every case here but those named a finding: the page is built; the counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { fragmentOf } from "../src/site-frame/routing.mjs";
import { ERIKA, PRODUCT_URL, SECRET, buttonsOf, byClass, flush, issueRecord, itemOf, mailOf, noteText, one, restoreWorld, textOf, trusted, waitFor, CLOUD, LOCAL } from "./maintenance-pages-world.mjs";
import { ACCOUNT, bodyOf, choose, comments, dialog, draftsOf, graphWrites, hashTo, headerOf, openIssue, openIssueAfterReading, openReplies, rawDraft, rawMail, readReplies, run, sends, writes, lastly } from "./uc-039-world.mjs";

afterEach(restoreWorld);

const [M1, M2, M3] = [await mailOf("m1"), await mailOf("m2"), await mailOf("m3")];
const ADA = "Ada Reporter <ada@example.invalid>";
const CLOSED_WITH = "Closed with pull request https://github.com/alice/product/pull/9.";
const CLI = "| agent-cli | CLI agent | model-c | 200000 | — | draft text | this machine | bridge lab-pc-4 agent claude |";
const day = /\d{4}-\d{2}-\d{2}/.source;

// The issue 4 as the standard fixture's: closed, listing the mails given.
const closed = (mails, extra = []) => issueRecord(4, "closed", mails, { comments: [CLOSED_WITH, ...extra] });

async function sendOf(p, id, confirm = true) {
  const item = itemOf(p.main(), id);
  await waitFor(() => byClass(item, "send-reply").length > 0);
  await trusted(one(item, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  if (!confirm) return item;
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(item, "reply-sent").length > 0 || byClass(item, "reply-problem").length > 0 || byClass(item, "reply-not-noted").length > 0);
  return item;
}

// TST-969001 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; CLOSING AN ISSUE PREPARES ITS REPLIES; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; MAIL STAYS IN THE MAILBOX; THE PAGE NAMES WHERE IT SENDS
// given: the page started at the route replies over the Microsoft route; the mailbox's INBOX holds m1 (from Erika) and m2 (from Erika, Reply-To Ada Reporter); the closed issue 4 lists both and says how it was closed; the participants local-llm (this machine, allowed), cloud-llm (a provider in the USA, not allowed) and checker (cannot draft)
// input: the person's click on Read replies (steps 1 and 2: read, open issue 4); local-llm chosen and a name typed; the person's click on Run (step 3); a click a script makes on Run first
// expect: reading writes nothing — no request but GETs reached Graph, no comment, no label, no state change — and issue 4 alone is under to answer; the issue shows what solved it (the closing pull request) and both mails with reporter, date and subject; only local-llm is offered, with its place; the run panel names where the texts go; the script's click asks no participant; the person's click asks the endpoint once and stores exactly two drafts in Drafts and nowhere else (INBOX unchanged, nothing in Sent, no send request), each with exactly one To — m1's to Erika, m2's to Ada, its Reply-To — no Cc and no Bcc, the subject Re: of the mail's subject, In-Reply-To and References from its Message-ID, the participant's text with the original quoted below it
test("main flow, steps 1 to 4: the issue read, the participant chosen, one draft per mail stored in Drafts to that mail's reporter alone", async () => {
  const texts = [];
  const inbox = [rawMail("m1"), rawMail("m2", { replyTo: ADA, subject: "Subject m2" })];
  const p = await openReplies({ inbox, issues: [closed([M1, M2])], texts });
  await lastly(p, async () => {
    const before = inbox.slice();
    await readReplies(p);
    assert.deepEqual(p.graph.requests.filter((request) => request.method !== "GET"), [], "reading writes nothing to the mailbox");
    assert.deepEqual(writes(p), [], "reading writes nothing to the issues");
    const groups = Object.fromEntries(["to-answer", "answer-received", "open"].map((name) => [name, byClass(p.main(), "replies-group").find((node) => node.getAttribute("data-group") === name)]));
    assert.deepEqual(byClass(groups["to-answer"], "reply-issue").map((node) => node.getAttribute("data-issue")), ["4"]);
    assert.deepEqual([groups["answer-received"], groups.open].map((node) => byClass(node, "reply-issue").length), [0, 0]);
    await openIssue(p, 4);
    assert.match(textOf(one(p.main(), "reply-solved")), /pull\/9/, "what solved the issue");
    for (const [mail, subject] of [[M1, "Subject m1"], [M2, "Subject m2"]]) {
      const item = itemOf(p.main(), mail.id);
      assert.match(textOf(item), new RegExp(`${ERIKA.name}.*2026-10-18.*${subject}`), `${mail.id}: reporter, date and subject`);
    }
    await waitFor(() => byClass(p.main(), "participant").length > 0);
    assert.deepEqual(byClass(p.main(), "participant").map((radio) => radio.value), ["local-llm"], "only the participant whose place the mailbox allows");
    assert.match(textOf(one(p.main(), "reply-participants")), /this machine/);
    await choose(p);
    assert.match(textOf(one(p.main(), "run-panel")), /local-llm.*this machine/s, "the panel names the participant and its place");
    texts.push({ mail: M1.id, text: "The export problem was fixed in version 1.5." }, { mail: M2.id, text: "The link is repaired in version 1.5." });
    assert.equal(await run(p), 0, "a click a script makes asks nobody");
    assert.equal(p.w.kept.endpoint.length, 1);
    assert.equal(byClass(p.main(), "reply-problem").length, 0, textOf(p.main()).slice(-400));
    const drafts = draftsOf(p);
    assert.equal(drafts.length, 2, "one draft per mail, in Drafts");
    for (const [key, to, text] of [["m1", ERIKA.address, "The export problem was fixed in version 1.5."], ["m2", "ada@example.invalid", "The link is repaired in version 1.5."]]) {
      const draft = drafts.find((raw) => headerOf(raw, "In-Reply-To").includes(`<${key}@mail.example.invalid>`));
      assert.ok(draft, `${key} has a draft`);
      assert.equal(headerOf(draft, "To").length, 1);
      assert.ok(headerOf(draft, "To")[0].includes(to) && !headerOf(draft, "To")[0].includes(","), `${key} goes to ${to} alone`);
      assert.deepEqual([headerOf(draft, "Cc"), headerOf(draft, "Bcc")], [[], []]);
      assert.deepEqual(headerOf(draft, "Subject"), [`Re: Subject ${key}`]);
      assert.ok(headerOf(draft, "References")[0].endsWith(`<${key}@mail.example.invalid>`));
      const body = bodyOf(draft);
      assert.ok(body.startsWith(text) && body.includes("> Hello,") && body.indexOf("> Hello,") > body.indexOf(text), `${key}: the text, then the original quoted below it`);
    }
    assert.deepEqual(p.graph.folders.inbox.map((each) => each.raw), before, "the mails stay in the mailbox as they were");
    assert.deepEqual(p.graph.folders.sentitems, []);
    assert.deepEqual(sends(p), [], "nothing is sent");
    assert.equal(writes(p).filter((request) => !request.path.includes("/git/")).length, 0, "no comment, label or state change yet");
  });
});

// TST-969002 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; ONE CLICK PER DECISION; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
// given: the closed issue 4 listing m1 and m2, and Drafts already holding Agent M's draft for each (from an earlier run), the mailbox on the Microsoft route
// input: the issue opened; the preview of m1's draft read; a click a script makes on Send; the person's click on Send and Cancel; the person's click on Send and the dialog's Send; then the same for m2; then Read replies again
// expect: the page lists both drafts with To, Subject, the full body and the attachments; a script's click opens no dialog; the dialog repeats recipient and subject and Cancel sends nothing and notes nothing; the confirmation sends exactly one mail — one send request — the provider removes the draft from Drafts and keeps the copy in Sent; the issue gets one comment each, Reply sent to the identifier on a day, and nothing of the mail (no address, subject or text) is in it; while m2 is unnoted issue 4 stays under to answer, and when both have a note it leaves
test("main flow, steps 5 to 7: Send repeats recipient and subject, the provider sends once, the reply is noted by identifier and date, and the issue leaves to answer", async () => {
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m2")], drafts: [rawDraft("m1"), rawDraft("m2", { to: "Ada Reporter <ada@example.invalid>", body: "Second reply text." })], issues: [closed([M1, M2])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const first = itemOf(p.main(), M1.id);
    await waitFor(() => byClass(first, "send-reply").length > 0);
    assert.match(textOf(first), new RegExp(`${ERIKA.address.replace(".", "\\.")}.*Re: Subject m1.*We fixed it in version 1.5`));
    assert.equal(byClass(first, "draft-attachments").length, 1, "the attachments are listed");
    byClass(first, "send-reply")[0].dispatchEvent(new Event("click"));
    await flush();
    assert.equal(dialog(), undefined, "a script's click opens no dialog");
    await trusted(one(first, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    assert.ok(textOf(dialog()).includes(ERIKA.address) && textOf(dialog()).includes("Re: Subject m1"), "the dialog repeats recipient and subject");
    assert.deepEqual(sends(p), [], "nothing is sent while the dialog is open");
    await trusted(buttonsOf(dialog(), "Cancel")[0]);
    assert.deepEqual([sends(p), comments(p)], [[], []], "declined: nothing sent, nothing noted");
    await trusted(one(first, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(first, "reply-sent").length > 0);
    assert.equal(sends(p).length, 1, "one mail is sent");
    assert.deepEqual(p.graph.folders.sentitems.map((each) => headerOf(each.raw, "In-Reply-To")[0]), ["<m1@mail.example.invalid>"], "the copy is in Sent");
    assert.equal(p.graph.folders.drafts.length, 1, "the draft left Drafts");
    assert.equal(comments(p).length, 1);
    assert.match(comments(p)[0], new RegExp(`^Reply sent to \`${M1.id}\` on ${day}\\.$`), "identifier and date only");
    await hashTo("#replies");
    await readReplies(p);
    assert.deepEqual(byClass(p.main(), "reply-issue").map((node) => node.getAttribute("data-issue")), ["4"], "m2 has no note: the issue stays under to answer");
    await openIssue(p, 4);
    const second = itemOf(p.main(), M2.id);
    await waitFor(() => byClass(second, "send-reply").length > 0);
    assert.match(textOf(itemOf(p.main(), M1.id)), /noted in the issue/);
    await trusted(one(second, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(second, "reply-sent").length > 0);
    assert.equal(sends(p).length, 2);
    assert.equal(comments(p).length, 2);
    const all = comments(p).join("\n");
    assert.ok(![ERIKA.address, "ada@example.invalid", "Subject m", "Second reply text", SECRET, "fixed it"].some((text) => all.includes(text)), "nothing of a mail is in a note");
    await hashTo("#replies");
    await readReplies(p);
    assert.deepEqual(byClass(p.main(), "reply-issue"), [], "every listed mail has a note: the issue left to answer");
    assert.equal(p.graph.folders.drafts.length, 0);
  });
});

// TST-969003 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; MAIL STAYS IN THE MAILBOX
// given: the closed issue 4 listing m1 and m2; Sent holds a reply to m1 that the author sent from the mail program (In-Reply-To <m1@…>, dated 2026-10-18), and no note says so
// input: the person's click on Read replies, twice
// expect: the reply to m1 is noted in issue 4 at the first reading — one comment, Reply sent to the identifier of m1 on 2026-10-18 — and not again at the second; issue 4 stays under to answer for m2; the mailbox is written nowhere
test("main flow, step 1: a reply found in Sent that no issue notes is noted in its issue, once", async () => {
  const sent = [["Message-ID: <hand@example.org>", "Date: Sun, 18 Oct 2026 12:00:00 +0000", `From: ${ACCOUNT}`, `To: ${ERIKA.address}`, "Subject: Re: Subject m1", "In-Reply-To: <m1@mail.example.invalid>", "References: <m1@mail.example.invalid>", "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", "Thanks, done.", ""].join("\r\n")];
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m2")], sent, issues: [closed([M1, M2])] });
  await lastly(p, async () => {
    await readReplies(p);
    assert.deepEqual(comments(p), [`Reply sent to \`${M1.id}\` on 2026-10-18.`]);
    await readReplies(p);
    assert.equal(comments(p).length, 1, "noted once");
    assert.deepEqual(byClass(p.main(), "reply-issue").map((node) => node.getAttribute("data-issue")), ["4"]);
    assert.deepEqual(graphWrites(p), [], "the mailbox is written nowhere");
  });
});

// TST-969004 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; CLOSING AN ISSUE PREPARES ITS REPLIES; ONE CLICK PER DECISION
// given: the open issue 6 listing m1, labelled with nothing, and no note
// input: the issue opened from the group open; the person's click on Close and reply
// expect: the page offers Close and reply on the open issue; a click a script makes changes nothing; the person's click closes the issue — one request that sets its state to closed — and the drafts section is offered as in step 2: the issue is now under to answer with its participants
test("alternative 2a: Close and reply closes the open issue and the drafting appears as in step 2", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], issues: [issueRecord(6, "open", [M1])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 6);
    assert.equal(byClass(p.main(), "reply-drafting").length, 0, "an open issue has no drafting of replies");
    const close = one(p.main(), "close-and-reply");
    close.dispatchEvent(new Event("click"));
    await flush();
    assert.deepEqual(writes(p), [], "a script's click closes nothing");
    await trusted(close);
    await waitFor(() => byClass(p.main(), "reply-drafting").length > 0);
    const patches = p.w.kept.github.filter((request) => request.method === "PATCH");
    assert.equal(patches.length, 1);
    assert.equal(JSON.parse(patches[0].body).state, "closed");
    assert.ok(patches[0].path.endsWith("/issues/6"));
    await waitFor(() => byClass(p.main(), "participant").length > 0);
    assert.deepEqual(byClass(p.main(), "participant").map((radio) => radio.value), ["local-llm"]);
  });
});

// TST-969005 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; CLOSING AN ISSUE PREPARES ITS REPLIES; ONE CLICK PER DECISION; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
// given: the closed issue 4 listing m1 (in the mailbox) and m3 (in no folder the connection names; it lies in the folder Reports)
// input: the issue opened; the person's click on No reply for m3, after a click a script makes on it; the person's click on No reply for m1
// expect: m3 says it was not found in the mailbox and offers neither a draft nor Send, only No reply; a script's click notes nothing; the person's click notes No reply to the identifier, decided on a day — one comment — and the item says so; m1 likewise; afterwards the issue has no mail left to answer and leaves to answer; no mail was sent
test("alternatives 2b and 2c: a mail no longer in the mailbox cannot be sent, and No reply notes the decision once by identifier and date", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], reports: [rawMail("m3")], issues: [closed([M1, M3])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const missing = itemOf(p.main(), M3.id);
    assert.match(textOf(missing), /not found in the mailbox/);
    assert.deepEqual(["send-reply", "write-reply", "ask-reporter", "reply-draft"].map((name) => byClass(missing, name).length), [0, 0, 0, 0]);
    const none = one(missing, "no-reply");
    none.dispatchEvent(new Event("click"));
    await flush();
    assert.deepEqual(comments(p), [], "a script's click notes nothing");
    await trusted(none);
    await waitFor(() => comments(p).length === 1);
    assert.match(comments(p)[0], new RegExp(`^No reply to \`${M3.id}\`, decided on ${day}\\.$`));
    assert.match(textOf(itemOf(p.main(), M3.id)), /noted in the issue/);
    assert.equal(byClass(itemOf(p.main(), M3.id), "no-reply").length, 0, "the draft leaves the list: nothing is offered for it any more");
    await trusted(one(itemOf(p.main(), M1.id), "no-reply"));
    await waitFor(() => comments(p).length === 2);
    assert.match(comments(p)[1], new RegExp(`^No reply to \`${M1.id}\`, decided on ${day}\\.$`));
    await hashTo("#replies");
    await readReplies(p);
    assert.deepEqual(byClass(p.main(), "reply-issue"), [], "every mail has a note: the issue left to answer");
    assert.deepEqual([sends(p), graphWrites(p)], [[], []]);
  });
});

// TST-969006 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL
// given: the closed issue 4 listing m1, no draft
// input: the person's click on Write the reply myself for m1; an edit of the text and the click on Save draft
// expect: an empty draft with the quoted original is stored in Drafts — one To (Erika), Re: Subject m1, In-Reply-To and References — and shown complete; the edit is saved to the draft (Drafts still holds one draft, with the new text, to the same recipient), and no participant was asked
test("alternative 3a: a reply written without a participant opens an empty draft with the quoted original, and every edit is saved to the draft", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], issues: [closed([M1])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const item = itemOf(p.main(), M1.id);
    await trusted(one(item, "write-reply"));
    await waitFor(() => byClass(item, "draft-body").length > 0);
    assert.equal(draftsOf(p).length, 1);
    const [draft] = draftsOf(p);
    assert.ok(headerOf(draft, "To")[0].includes(ERIKA.address));
    assert.deepEqual(headerOf(draft, "Subject"), ["Re: Subject m1"]);
    assert.deepEqual(headerOf(draft, "In-Reply-To"), ["<m1@mail.example.invalid>"]);
    assert.ok(bodyOf(draft).includes("> Hello,"), "the original is quoted");
    assert.ok(String(one(item, "draft-body").value).includes("> Hello,"), "shown complete");
    const body = one(item, "draft-body");
    body.value = "Typed by hand.\n\n> Hello,";
    body.dispatchEvent(new Event("input"));
    await trusted(one(item, "save-draft"));
    await waitFor(() => draftsOf(p).length === 1 && bodyOf(draftsOf(p)[0]).startsWith("Typed by hand."));
    assert.equal(draftsOf(p).length, 1, "the edit replaced the draft");
    assert.ok(headerOf(draftsOf(p)[0], "To")[0].includes(ERIKA.address));
    assert.deepEqual(p.w.kept.endpoint, [], "no participant was asked");
  });
});

// TST-969007 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; THE PAGE NAMES WHERE IT SENDS; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; EVERY OUTGOING MAIL IS RELEASED BY A PERSON
// given: the register lists the CLI agent agent-cli (this machine, reached through the Bridge lab-pc-4 as the agent claude) beside local-llm and cloud-llm; the mailbox allows this machine
// input: agent-cli chosen and a name typed; the person's click on Run
// expect: agent-cli is offered with its place and the run panel names it; the Bridge receives one ask for the agent claude whose input holds the issue, what solved it and the mail, and nothing that sends; the texts it returns are stored as drafts in Drafts; no send request reaches Graph and no mail operation of sending is asked of the Bridge — nothing is sent without the confirmation of step 5
test("alternative 3b: a CLI agent receives the job through its Bridge, returns the texts, and nothing is sent", async () => {
  const texts = [];
  const p = await openReplies({ inbox: [rawMail("m1")], issues: [closed([M1])], rows: [CLOUD, LOCAL, CLI], texts });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    await waitFor(() => byClass(p.main(), "participant").length > 0);
    const names = byClass(p.main(), "participant").map((radio) => radio.value);
    assert.deepEqual(names, ["local-llm", "agent-cli"]);
    await choose(p, "Reviewer Rae", 1);
    assert.match(textOf(one(p.main(), "run-panel")), /agent-cli.*this machine/s);
    texts.push({ mail: M1.id, text: "Fixed in version 1.5." });
    await run(p);
    assert.equal(byClass(p.main(), "reply-problem").length, 0, textOf(p.main()).slice(-400));
    assert.equal(p.state.asks.length, 1, "one ask to the Bridge");
    assert.deepEqual(Object.keys(p.state.asks[0]).sort(), ["agent", "input"]);
    assert.equal(p.state.asks[0].agent, "claude");
    for (const part of ["Issue #4", "pull/9", "Subject m1", "the export fails."]) assert.ok(p.state.asks[0].input.includes(part), `the job holds ${part}`);
    assert.doesNotMatch(p.state.asks[0].input, /\bconfirm-send\b|\/send\b|sendDraft/);
    assert.equal(draftsOf(p).length, 1);
    assert.ok(bodyOf(draftsOf(p)[0]).startsWith("Fixed in version 1.5."));
    assert.deepEqual([sends(p), p.state.calls.filter((call) => /send/.test(call.operation)), p.w.kept.endpoint], [[], [], []]);
  });
});

// TST-969008 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPLY GOES TO ONE REPORTER; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// given: the closed issue 4 listing m1 and m3; m3's From is no address (nobody) and it has no Reply-To; m1 is fine
// input: the issue opened
// expect: m3 is marked not sendable and says why — it has no usable reply address —, offers No reply and nothing that drafts or sends; m1 is offered a draft; the participants are offered for m1 alone; every step carries its folded explanation
test("alternative 4a: a mail whose reply address is missing or invalid is not sendable and can only be left unanswered", async () => {
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m3", { from: "nobody" })], issues: [closed([M1, M3])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const bad = itemOf(p.main(), M3.id);
    assert.match(textOf(one(bad, "reply-not-sendable")), /not sendable.*no usable reply address/);
    assert.deepEqual(["send-reply", "write-reply", "ask-reporter", "reply-draft"].map((name) => byClass(bad, name).length), [0, 0, 0, 0]);
    assert.equal(byClass(bad, "no-reply").length, 1);
    assert.equal(byClass(itemOf(p.main(), M1.id), "write-reply").length, 1);
    assert.ok(byClass(p.main(), "explain").length >= 2, "the steps explain themselves");
    for (const fold of byClass(p.main(), "explain")) assert.ok(textOf(fold).length > 40, "an explanation has words");
  });
});

// TST-969009 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
// given: Drafts holds Agent M's draft for m1; the closed issue 4 lists m1
// input: the person's edit of the text and click on Save draft; then the click on Send
// expect: the dialog shows the edited mail — the new text — and nothing is sent before its confirmation; the mail sent is the edited draft, to Erika alone; Drafts holds no draft any more and Sent holds the edited mail
test("alternative 5a: the dialog shows the edited mail again before anything is sent", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], drafts: [rawDraft("m1")], issues: [closed([M1])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const item = itemOf(p.main(), M1.id);
    await waitFor(() => byClass(item, "draft-body").length > 0);
    const before = draftsOf(p)[0];
    const body = one(item, "draft-body");
    body.value = "Edited reply text before sending.";
    body.dispatchEvent(new Event("input"));
    await trusted(one(item, "save-draft"));
    await waitFor(() => draftsOf(p).length === 1 && draftsOf(p)[0] !== before);
    await waitFor(() => String(one(item, "draft-body")?.value ?? "").includes("Edited reply") && /Saved to the draft/.test(textOf(item)));
    await trusted(one(item, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    assert.ok(textOf(dialog()).includes("Edited reply text before sending."), textOf(dialog()));
    assert.deepEqual(sends(p), [], "nothing is sent before the confirmation");
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0);
    assert.equal(sends(p).length, 1);
    assert.ok(bodyOf(p.graph.folders.sentitems[0].raw).includes("Edited reply text before sending."), "the edited draft was sent");
    assert.ok(headerOf(p.graph.folders.sentitems[0].raw, "To")[0].includes(ERIKA.address));
    assert.equal(p.graph.folders.drafts.length, 0);
  });
});

// TST-969010 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE
// given: the draft for m1 shown, the dialog confirmed once so that the mail is sent
// input: the same request again: a second click on the Send button the page showed before, and a second confirmation of the dialog
// expect: the provider is asked to send once; the issue has one note; the second request sends nothing
test("alternative 5b: the same request twice sends the mail once", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], drafts: [rawDraft("m1")], issues: [closed([M1, M2])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const item = itemOf(p.main(), M1.id);
    await waitFor(() => byClass(item, "send-reply").length > 0);
    const button = one(item, "send-reply");
    await trusted(button);
    await waitFor(() => dialog() !== undefined);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0);
    await trusted(button);
    await flush();
    assert.equal(dialog(), undefined, "the second click opens no dialog");
    assert.equal(sends(p).length, 1);
    assert.equal(comments(p).length, 1);
    assert.equal(p.graph.folders.sentitems.length, 1);
  });
});

// TST-969011 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; A SENT REPLY IS NOTED IN THE ISSUE
// given: the provider refuses the send of the draft for m1 (403 with its answer)
// input: the person's click on Send and the dialog's Send
// expect: nothing is noted in the issue; the draft stays in Drafts and on the page; nothing is in Sent; the page shows a problem that names the refusal
test("alternative 6a: when sending fails nothing is noted and the draft stays", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], drafts: [rawDraft("m1")], issues: [closed([M1])], refuseSend: true });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    const item = await sendOf(p, M1.id);
    assert.equal(byClass(item, "reply-problem").length, 1);
    assert.match(textOf(one(item, "reply-problem")), /not sent|refus|ErrorSendAsDenied|Permission|denied/i);
    assert.deepEqual(comments(p), []);
    assert.equal(p.graph.folders.drafts.length, 1, "the draft stays in Drafts");
    assert.equal(byClass(item, "reply-draft").length, 1, "and on the page");
    assert.deepEqual(p.graph.folders.sentitems, []);
  });
});

// TST-969012 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; AN ISSUE WAITING FOR A REPORTER IS LABELLED; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; ONE CLICK PER DECISION
// given: the open issue 6 listing m1, no note, no label
// input: the person's click on Ask the reporter; the text of the question typed and saved; the click on Send and wait and the dialog's Send and wait
// expect: an empty question draft with the original quoted is stored in Drafts and shown; before the confirmation nothing is sent; then one mail is sent, the issue gets the label waiting-for-reporter and one comment, Question sent to the identifier on a day, and the issue stays open (no request sets its state)
test("alternative 1a: Ask the reporter, Send and wait labels the issue waiting-for-reporter and notes the question, and the issue stays open", async () => {
  const p = await openReplies({ inbox: [rawMail("m1")], issues: [issueRecord(6, "open", [M1])] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 6);
    const item = itemOf(p.main(), M1.id);
    await trusted(one(item, "ask-reporter"));
    await waitFor(() => byClass(item, "draft-body").length > 0);
    assert.equal(draftsOf(p).length, 1);
    assert.ok(bodyOf(draftsOf(p)[0]).includes("> Hello,"));
    const body = one(item, "draft-body");
    body.value = "Which version do you use?\n\n> Hello,";
    body.dispatchEvent(new Event("input"));
    await trusted(one(item, "save-draft"));
    await waitFor(() => bodyOf(draftsOf(p)[0] ?? "").startsWith("Which version") && /Saved to the draft/.test(textOf(item)));
    await trusted(one(item, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    assert.deepEqual(sends(p), [], "nothing is sent before the confirmation");
    await trusted(buttonsOf(dialog(), "Send and wait")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0);
    assert.equal(sends(p).length, 1);
    assert.match(comments(p)[0], new RegExp(`^Question sent to \`${M1.id}\` on ${day}\\.$`));
    assert.equal(p.w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/labels")).map((request) => JSON.parse(request.body).labels).flat().join(), "waiting-for-reporter");
    assert.deepEqual(p.w.kept.github.filter((request) => request.method === "PATCH"), [], "the issue stays open");
  });
});

// TST-969013 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE; AN ISSUE WAITING FOR A REPORTER IS LABELLED
// given: the open issue 5, labelled waiting-for-reporter, whose comments say a question was sent for m1 and then that mail m1 was added; the open issue 6 listing m3; the open issue 7, whose comments say the same of m2 but which carries no label
// input: the person's click on Read replies; issue 5 opened; the click on Remove the label
// expect: issue 5 is under answer received, issues 6 and 7 under open (a new mail without the label waiting-for-reporter is no answer); issue 5 shows the new mail marked as new; the author can remove the label, ask again or close — the three buttons are offered; Remove the label removes the label from the issue, one request, and writes no comment
test("alternative 1b: an issue with the reporter's answer appears under answer received and the author removes the label, asks again or closes", async () => {
  const waiting = issueRecord(5, "open", [M1], { labels: ["waiting-for-reporter"], comments: [noteText("question-sent", M1.id, "2026-10-17"), noteText("mail-added", M1.id, "2026-10-18")] });
  const unlabelled = issueRecord(7, "open", [M2], { comments: [noteText("question-sent", M2.id, "2026-10-17"), noteText("mail-added", M2.id, "2026-10-18")] });
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m2"), rawMail("m3")], issues: [waiting, issueRecord(6, "open", [M3]), unlabelled] });
  await lastly(p, async () => {
    await readReplies(p);
    const group = (name) => byClass(p.main(), "replies-group").find((node) => node.getAttribute("data-group") === name);
    assert.deepEqual(byClass(group("answer-received"), "reply-issue").map((node) => node.getAttribute("data-issue")), ["5"]);
    assert.deepEqual(byClass(group("open"), "reply-issue").map((node) => node.getAttribute("data-issue")), ["6", "7"]);
    await openIssue(p, 5);
    const item = itemOf(p.main(), M1.id);
    assert.match(textOf(one(item, "reply-new")), /New/);
    assert.ok(byClass(p.main(), "remove-label").length === 1 && byClass(p.main(), "close-and-reply").length === 1 && byClass(item, "ask-reporter").length === 1, "remove the label, close, or ask again");
    await trusted(one(p.main(), "remove-label"));
    await waitFor(() => p.w.kept.github.some((request) => request.method === "DELETE"));
    assert.deepEqual(p.w.kept.github.filter((request) => request.method === "DELETE").map((request) => decodeURIComponent(request.path.split("/").pop())), ["waiting-for-reporter"]);
    assert.deepEqual(comments(p), []);
  });
});

// TST-969014 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
// given: as TST-969013: the answer's mail m1 lies in the mailbox with the text "Version 1.4, and the export fails with error E42"
// input: issue 5 opened
// expect: the mail is shown in full — UC-039 1b says "with the new mail shown in full" —: its text is on the page. FINDING: the page shows a mail's reporter, date and subject only (MOD-maintenance-pages' replies.mjs reads no text of a mail), so this case is red on main until the page shows the text
test("alternative 1b (finding): the new mail of the reporter's answer is shown in full", async () => {
  const waiting = issueRecord(5, "open", [M1], { labels: ["waiting-for-reporter"], comments: [noteText("question-sent", M1.id, "2026-10-17"), noteText("mail-added", M1.id, "2026-10-18")] });
  const p = await openReplies({ inbox: [rawMail("m1", { body: "Version 1.4, and the export fails with error E42" })], issues: [waiting] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 5);
    assert.ok(textOf(itemOf(p.main(), M1.id)).includes("Version 1.4, and the export fails with error E42"), "the text of the answer is on the page");
  });
});

// TST-969015 · level: system · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
// given: the closed issue 4 listing m1 (answered: a reply note) and m2, whose mail-added note follows the note of the closing
// input: the person's click on Read replies; issue 4 opened; a click a script makes on Reopen; the person's click on Leave closed; the issue opened again; the person's click on Reopen
// expect: reading and showing the issue change no state — no mail reopens an issue by itself; the mail m2 is shown under the issue with the offer Reopen, Leave closed; a script's click reopens nothing; Leave closed calls nothing and takes the offer away; Reopen sets the issue's state to open, one request
test("alternative 7a: a mail in the thread of a closed issue is shown, the issue stays closed until the person presses Reopen", async () => {
  const issue = closed([M1, M2], [noteText("reply-sent", M1.id, "2026-10-18"), noteText("closed-with", "ITM-001", "2026-10-17", "https://github.com/alice/product/pull/9"), noteText("mail-added", M2.id, "2026-10-18")]);
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m2")], issues: [issue] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    assert.deepEqual(p.w.kept.github.filter((request) => request.method === "PATCH"), [], "no mail reopens an issue by itself");
    const offer = one(itemOf(p.main(), M2.id), "reply-arrived");
    assert.match(textOf(offer), /arrived.*after the issue was closed.*stays closed until you reopen it/);
    const reopen = one(offer, "reopen-issue");
    reopen.dispatchEvent(new Event("click"));
    await flush();
    assert.deepEqual(p.w.kept.github.filter((request) => request.method === "PATCH"), [], "a script's click reopens nothing");
    await trusted(one(offer, "leave-closed"));
    assert.equal(byClass(itemOf(p.main(), M2.id), "reply-arrived").length, 0, "the offer is gone");
    assert.deepEqual(p.w.kept.github.filter((request) => request.method === "PATCH"), [], "Leave closed calls nothing");
    await openIssue(p, 4);
    await trusted(one(itemOf(p.main(), M2.id), "reopen-issue"));
    await waitFor(() => p.w.kept.github.some((request) => request.method === "PATCH"));
    const patches = p.w.kept.github.filter((request) => request.method === "PATCH");
    assert.equal(patches.length, 1);
    assert.equal(JSON.parse(patches[0].body).state, "open");
  });
});
