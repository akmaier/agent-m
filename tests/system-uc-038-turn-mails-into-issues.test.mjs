// UC-038 "Turn mails into issues" as a system path: the author opens the route `mail` on the main page, started by MOD-site-frame's startPage over the view of MOD-maintenance-pages, in the browser of
// tests/maintenance-pages-world.mjs (the repositories, the participants' register, the model endpoints ep1 and ep2, GitHub's issues of alice/product), over the mailbox on the Microsoft route — a fixture server of
// Microsoft Graph in place of graph.microsoft.com (tests/uc-039-world.mjs) — and walks the main flow (steps 1 to 10) and the alternative flows 2a, 4b, 4c, 6a, 6c, 7a, 7b and 8a, each reached by a person's input: the
// click on Read mailbox, a chosen participant and a typed name, Propose, an edit of the title and the text, Create issue, Add to #n, Not an issue. The Bridge route (the IMAP server) is walked in
// tests/system-uc-038-bridge-route.test.mjs.
// Run: node --test tests/system-uc-038-turn-mails-into-issues.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; MAIL STAYS IN THE MAILBOX; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
// Guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// Guards: A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// Guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF
// Level: system
//
// Each test states its input and its expected result in its own text (given / input / expect) from UC-038, before it runs; none reads an expected value from the page. The mails are the raw texts the fixture Graph holds;
// their identifiers are those of tests/maintenance-pages-world.mjs' mailOf (the hash of the Message-ID). The classes of the page's elements are those of tests/maintenance-pages-mail.test.mjs and
// tests/maintenance-pages-propose.test.mjs. The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { writeSetting } from "../src/browser-store/index.mjs";
import { PRODUCT_URL, buttonsOf, byClass, flush, issueRecord, itemOf, mailOf, one, restoreWorld, textOf, waitFor, trusted as click, walk } from "./maintenance-pages-world.mjs";
import { graphWrites, lastly, openReplies, rawMail, writes } from "./uc-039-world.mjs";

afterEach(restoreWorld);

const row = (name, model, place, route = "endpoint ep1", type = "model endpoint") => `| ${name} | ${type} | ${model} | 200000 | — | draft text | ${place} | ${route} |`;
const LOCAL = row("local-llm", "model-a", "this machine");
const CHECKS = [row("check-1", "model-b", "this machine"), row("check-2", "model-c", "this machine"), row("check-3", "model-d", "this machine")];
const CLOUD = row("cloud-llm", "model-e", "a provider in the USA", "endpoint ep2");
const ROWS = [LOCAL, ...CHECKS];
const BODY = "The export of my thesis fails with error E42 in version 1.4.\r\nKind regards\r\nErika Mustermann";
const [A, B, C] = [await mailOf("a"), await mailOf("b"), await mailOf("c")];
const [D, L] = [await mailOf("listed"), await mailOf("marked")];

/** The proposals a participant returns, by the identifier of the mail: a neutral defect for `a`, a neutral change for `b`. */
const answer = () => ({ draft: { proposals: [
  { mail: A.id, product: PRODUCT_URL, kind: "defect", title: "Export fails with E42", text: "The export of a document fails with error E42 in version 1.4.", duplicates: [{ issue: 3, reason: "the same error" }] },
  { mail: B.id, product: PRODUCT_URL, kind: "change", title: "Add a dark theme", text: "A dark theme is asked for.", duplicates: [] },
] }, answers: [] });

const open = (extra = {}) => openReplies({ route: "graph", fragment: "#mail", rows: ROWS, answer, issues: [issueRecord(3, "open", [])],
  inbox: [rawMail("a", { subject: "Export fails", body: BODY }), rawMail("b", { subject: "Dark theme", body: "Please add a dark theme.\r\nKind regards\r\nErika Mustermann" })], ...extra });
async function readMailbox(p, clicks) {
  clicks.push("Read mailbox");
  await click(one(p.main(), "read-mailbox"));
  await waitFor(() => byClass(p.main(), "mail-decided").length > 0 || byClass(p.main(), "mailbox-problem").length > 0);
}
async function chooseParticipant(p, name, person = "Anna Author") {
  const input = one(p.main(), "person");
  input.value = person;
  input.dispatchEvent(new Event("change"));
  const radio = one(walk(p.main(), (node) => node.getAttribute?.("data-participant") === name)[0], "participant");
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(p.main(), "run-panel").length > 0 || byClass(p.main(), "mail-missing-checkers").length > 0);
}
async function propose(p, clicks) {
  const run = buttonsOf(one(p.main(), "mail-stage"), "Run")[0];
  run.dispatchEvent(new Event("click"));
  await flush();
  const byScript = p.w.kept.endpoint.length;
  clicks.push("Propose");
  await click(run);
  await waitFor(() => byClass(p.main(), "mail-title").some((node) => node.value !== "" && node.value !== undefined));
  return byScript;
}
const items = (p) => byClass(p.main(), "mail");
const created = (p) => p.w.kept.github.filter((request) => request.method === "POST" && /\/issues$/.test(request.path)).map((request) => JSON.parse(request.body));
const commentsOf = (p) => p.w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/comments")).map((request) => JSON.parse(request.body).body);
const typed = async (node, value) => { node.value = value; node.dispatchEvent(new Event("input")); await flush(); };
const everyWrite = (p) => JSON.stringify([writes(p), graphWrites(p)]);

// TST-965001 · level: system · module: MOD-maintenance-pages
// guards: UC-038 main flow, steps 1 to 3; READING THE MAILBOX CHANGES NOTHING IN IT; MAIL STAYS IN THE MAILBOX; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
// given: the page at the route mail over the Microsoft route; the INBOX holds a (new), listed (which the open issue 3 lists), marked (which the author marked not an issue in this browser) and reply (whose In-Reply-To names listed); no participant is chosen
// input: the person's click on Read mailbox
// expect: only a is listed, with sender, subject and date; the mail reply is attached to issue 3 at once — one comment that adds its identifier to the issue — and shown under it, without a participant: no request reached a model endpoint; listed and marked are left out; reading wrote nothing to the mailbox and nothing but that comment to the tracker
test("main flow, steps 1 to 3: the mailbox is read, decided mails are left out, a reply in a known thread is attached to its issue without a participant", async () => {
  const marked = await mailOf("marked");
  const p = await open({ issues: [issueRecord(3, "open", [D])],
    inbox: [rawMail("a", { subject: "Export fails", body: BODY }), rawMail("listed"), rawMail("marked"), rawMail("reply", { inReplyTo: "<listed@mail.example.invalid>", references: "<listed@mail.example.invalid>", subject: "Re: Subject listed" })] });
  await lastly(p, async () => {
    writeSetting(p.w.context.store, "not-an-issue", [marked.id]);
    const clicks = [];
    await readMailbox(p, clicks);
    const listed = items(p);
    assert.deepEqual(listed.map((node) => node.getAttribute("data-mail")), [A.id], "only the undecided mail is listed");
    const text = textOf(listed[0]);
    assert.ok(text.includes("Erika") && text.includes("Export fails") && /2026/.test(text), "sender, subject and date");
    const attached = textOf(one(p.main(), "mail-attached"));
    assert.ok(attached.includes("#3"), "the reply is shown under issue 3");
    const reply = await mailOf("reply");
    assert.deepEqual(commentsOf(p).length, 1, "one comment adds the reply's identifier");
    assert.ok(commentsOf(p)[0].includes(reply.id));
    assert.equal(p.w.kept.endpoint.length + p.w.kept.ask.length, 0, "no participant was asked");
    assert.deepEqual(graphWrites(p), [], "the mailbox is unchanged: no write reached it");
    assert.deepEqual(writes(p).map((request) => `${request.method} ${request.path}`), ["POST /repos/alice/product/issues/3/comments"]);
  });
});

// TST-965002 · level: system · module: MOD-maintenance-pages
// guards: UC-038 main flow, steps 4, 5, 7 and 8, and the postcondition; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; ONE CLICK PER DECISION; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; MAIL STAYS IN THE MAILBOX; THE PAGE NAMES WHERE IT SENDS
// given: two new mails a and b; the participants local-llm and three checkers at this machine; the answer of local-llm: a neutral defect for a, a neutral change for b
// input: Read mailbox; local-llm chosen and a name typed; a click a script makes on Propose, then the person's click; a click a script makes on Create issue, then the person's click, for a and for b
// expect: the panel names where local-llm processes data; the script's clicks send and write nothing; one Propose sends one request for both mails; the proposals are shown beside their mails and write nothing; Create issue creates one issue per mail — labelled defect and change — whose text lists the mail's MAIL identifier and holds no name, address, signature or sentence of the mail; for the change a link to the issue offers the SPEC change; the mailbox saw no write; the clicks of the reading are Read mailbox, Propose and one decision per mail
test("main flow, steps 4 to 10: one Propose for all mails, one decision per mail, neutral issues with the label and the identifier, the mailbox untouched", async () => {
  const p = await open();
  await lastly(p, async () => {
    const clicks = [];
    await readMailbox(p, clicks);
    await chooseParticipant(p, "local-llm");
    assert.match(textOf(one(p.main(), "run-panel")), /this machine/);
    assert.equal(byClass(p.main(), "mail-checker").length, 3);
    assert.equal(await propose(p, clicks), 0, "a click a script makes sends nothing");
    const asked = p.w.kept.endpoint.filter((request) => JSON.stringify(request.body).includes("You turn mails into proposals"));
    assert.equal(asked.length, 1, "one request for all listed mails");
    assert.ok(JSON.stringify(asked[0].body).includes(A.id) && JSON.stringify(asked[0].body).includes(B.id));
    assert.deepEqual(created(p), [], "a proposal creates nothing");
    for (const [mail, label] of [[A, "defect"], [B, "change"]]) {
      const item = itemOf(p.main(), mail.id);
      assert.equal(one(item, "mail-kind").value, label);
      one(item, "create-issue").dispatchEvent(new Event("click"));
      await flush();
      assert.equal(created(p).length, label === "defect" ? 0 : 1, "a click a script makes on Create issue writes nothing");
      clicks.push(`Create issue ${label}`);
      await click(one(item, "create-issue"));
      await waitFor(() => created(p).length > (label === "defect" ? 0 : 1) && textOf(one(item, "mail-result")) !== "");
    }
    const made = created(p);
    assert.deepEqual(made.map((issue) => issue.labels), [["defect"], ["change"]]);
    assert.ok(made[0].body.includes(A.id) && made[1].body.includes(B.id), "each issue lists its mail's identifier");
    for (const issue of made) {
      const text = `${issue.title}\n${issue.body}`;
      for (const forbidden of ["Erika", "Mustermann", "erika@example.invalid", "Kind regards", "my thesis"]) assert.ok(!text.includes(forbidden), `${forbidden} is not in the issue`);
    }
    assert.ok(byClass(itemOf(p.main(), B.id), "issue-link").length > 0, "a change offers the SPEC change");
    assert.equal(byClass(itemOf(p.main(), A.id), "issue-link").length, 0, "a defect goes to implementation directly");
    assert.deepEqual(graphWrites(p), [], "the mailbox saw no write");
    assert.deepEqual(clicks, ["Read mailbox", "Propose", "Create issue defect", "Create issue change"]);
    assert.ok(!everyWrite(p).includes("Mustermann") && !everyWrite(p).includes("erika@example.invalid"), "no sender or name in any write");
  });
});

// TST-965003 · level: system · module: MOD-maintenance-pages
// guards: UC-038 main flow, steps 7 and 9; A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; ONE CLICK PER DECISION; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
// given: two new mails a and b and the open issue 3
// input: Read mailbox; the person's click on Add to #3 for a; the person's click on Not an issue for b; the mailbox read again
// expect: Add to #3 writes one comment that lists a's identifier on issue 3, and nothing else; Not an issue writes nothing to any repository and marks b in this browser; the second reading lists neither a (an issue lists it now) nor b (marked); the mailbox saw no write
test("steps 7 and 9: Add to #n lists the mail on the issue, Not an issue marks it in this browser, and neither is proposed again", async () => {
  const p = await open();
  await lastly(p, async () => {
    const clicks = [];
    await readMailbox(p, clicks);
    const itemA = itemOf(p.main(), A.id), itemB = itemOf(p.main(), B.id);
    await typed(one(itemA, "mail-issue-number"), "3");
    await click(one(itemA, "add-to-issue"));
    await waitFor(() => commentsOf(p).length > 0);
    assert.equal(commentsOf(p).length, 1);
    assert.ok(commentsOf(p)[0].includes(A.id));
    const before = writes(p).length;
    await click(one(itemB, "not-an-issue"));
    assert.equal(writes(p).length, before, "Not an issue writes nothing to a repository");
    assert.equal(itemOf(p.main(), B.id), undefined, "the mail leaves the list at the click");
    p.w.kept.issues[0].comments.push(commentsOf(p)[0]);
    p.w.kept.issues[0].body = `${p.w.kept.issues[0].body}\n\nMails: \`${A.id}\``;
    await readMailbox(p, clicks);
    assert.deepEqual(items(p).map((node) => node.getAttribute("data-mail")), [], "neither is listed again");
    assert.deepEqual(graphWrites(p), []);
  });
});

// TST-965004 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 2a; READING THE MAILBOX CHANGES NOTHING IN IT; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: the page over the Microsoft route, and a provider that cannot be reached when the mailbox is read
// input: the person's click on Read mailbox
// expect: nothing is listed; the page names the reason (the provider's answer) in the problem of the mailbox; no participant was asked and nothing was written to the tracker
test("alternative 2a: a mailbox that cannot be reached is named, nothing is read and nothing is written", async () => {
  const p = await open();
  await lastly(p, async () => {
    p.graph.fetch = async () => { throw new TypeError("Failed to fetch: the provider cannot be reached"); };
    await readMailbox(p, []);
    assert.equal(items(p).length, 0);
    assert.ok(byClass(p.main(), "mailbox-problem").length > 0, "the problem of the mailbox is named");
    assert.match(textOf(one(p.main(), "mailbox-problem")), /provider|reach|Failed to fetch/i);
    assert.deepEqual(writes(p), []);
    assert.equal(p.w.kept.endpoint.length + p.w.kept.ask.length, 0);
  });
});

// TST-965005 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 4b; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// given: two new mails; the author presses no Propose
// input: Read mailbox; for a: the kind change chosen, a title and a text typed by hand; the person's click on Create issue
// expect: nothing was sent to any participant; Create issue is disabled while the proposal is empty and enabled by the typed title and text; the issue created holds the author's title, text and kind (the label change) and a's identifier
test("alternative 4b: without Propose the author decides a mail by hand with an empty proposal", async () => {
  const p = await open();
  await lastly(p, async () => {
    await readMailbox(p, []);
    const item = itemOf(p.main(), A.id);
    assert.equal(one(item, "create-issue").disabled, true, "disabled with an empty proposal");
    one(item, "mail-kind").value = "change";
    one(item, "mail-kind").dispatchEvent(new Event("change"));
    await typed(one(item, "mail-title"), "Export as PDF");
    await typed(one(item, "mail-body"), "The export of a document as PDF is asked for in version 1.4.");
    assert.equal(one(item, "create-issue").disabled, false);
    await click(one(item, "create-issue"));
    await waitFor(() => created(p).length > 0);
    assert.equal(p.w.kept.endpoint.length + p.w.kept.ask.length, 0, "no participant was asked");
    assert.deepEqual(created(p).map((issue) => [issue.title, issue.labels]), [["Export as PDF", ["change"]]]);
    assert.ok(created(p)[0].body.includes(A.id));
  });
});

// TST-965006 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 4c; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
// given: a register whose only participant that drafts text processes data in the USA, and a mailbox that allows this machine only
// input: Read mailbox
// expect: the page says that no participant processes data at a place the mailbox allows, links the mailbox's processing places, and offers no participant; nothing was sent; the author can still decide a mail by hand
test("alternative 4c: no participant at an allowed place is said, the mailbox's places are linked and nothing is sent", async () => {
  const p = await open({ rows: [CLOUD] });
  await lastly(p, async () => {
    await readMailbox(p, []);
    assert.equal(byClass(p.main(), "mail-participant").length, 0);
    assert.ok(byClass(p.main(), "mail-no-participant").length > 0);
    assert.ok(byClass(p.main(), "places-link").length > 0 && byClass(p.main(), "places-link")[0].getAttribute("href") === "#mailbox");
    assert.equal(p.w.kept.endpoint.length + p.w.kept.ask.length, 0, "nothing is sent");
    await typed(one(itemOf(p.main(), A.id), "mail-title"), "Export fails");
    await typed(one(itemOf(p.main(), A.id), "mail-body"), "The export of a document fails in version 1.4.");
    assert.equal(one(itemOf(p.main(), A.id), "create-issue").disabled, false, "the author can still decide by hand");
  });
});

// TST-965007 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 6a; A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
// given: the proposal for b names the reporter's address in its text
// input: Read mailbox; local-llm chosen; Propose; the text edited to remove the address; the person's click on Create issue
// expect: the hit is marked and Create issue disabled while it stands; after the edit no hit, Create issue enabled, and the issue is created without the address
test("alternative 6a: a hit of the mail's people is marked, Create issue stays disabled until it is edited out", async () => {
  const p = await open({ answer: () => ({ draft: { proposals: [
    { mail: A.id, product: PRODUCT_URL, kind: "defect", title: "Export fails with E42", text: "The export fails with error E42.", duplicates: [] },
    { mail: B.id, product: PRODUCT_URL, kind: "change", title: "Add a dark theme", text: "The reporter erika@example.invalid asks for a dark theme.", duplicates: [] }] }, answers: [] }) });
  await lastly(p, async () => {
    const clicks = [];
    await readMailbox(p, clicks);
    await chooseParticipant(p, "local-llm");
    await propose(p, clicks);
    const item = itemOf(p.main(), B.id);
    assert.ok(byClass(item, "mail-hit").length > 0, "the hit is marked");
    assert.equal(one(item, "create-issue").disabled, true);
    await typed(one(item, "mail-body"), "A dark theme is asked for.");
    assert.equal(byClass(item, "mail-hit").length, 0);
    assert.equal(one(item, "create-issue").disabled, false);
    await click(one(item, "create-issue"));
    await waitFor(() => created(p).length > 0);
    assert.ok(!JSON.stringify(created(p)).includes("erika@example.invalid"));
  });
});

// TST-965008 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 6c; A REWRITTEN TEXT IS CHECKED BY THREE LLMS
// given: a register with local-llm and only two checking participants at this machine
// input: Read mailbox; local-llm chosen and a name typed
// expect: the page names what is missing (a third checker) and links the participants and the mailbox's places; no run panel is drawn and nothing is sent; the author may still write the issue text by hand
test("alternative 6c: with fewer than three checkers the missing one is named and nothing is sent", async () => {
  const p = await open({ rows: [LOCAL, CHECKS[0], CHECKS[1]] });
  await lastly(p, async () => {
    await readMailbox(p, []);
    await chooseParticipant(p, "local-llm");
    assert.ok(byClass(p.main(), "mail-missing-checkers").length > 0, "what is missing is named");
    assert.ok(byClass(p.main(), "participants-link").length > 0);
    assert.equal(byClass(p.main(), "run-panel").length, 0);
    assert.equal(p.w.kept.endpoint.length + p.w.kept.ask.length, 0);
    await typed(one(itemOf(p.main(), A.id), "mail-title"), "Export fails");
    await typed(one(itemOf(p.main(), A.id), "mail-body"), "The export fails with error E42 in version 1.4.");
    assert.equal(one(itemOf(p.main(), A.id), "create-issue").disabled, false);
  });
});

// TST-965009 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 7a; UC-038 alternative 7b; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
// given: the proposal for a (a defect, titled "Export fails with E42")
// input: Propose; the author changes the kind to change and the title; the person's click on Create issue; the title and text changed for a second concern; the person's click on Create issue again
// expect: the issue is written as the author changed it (label change, her title), not as proposed; two issues are created, each listing a's identifier
test("alternatives 7a and 7b: the author's choice is what is written, and a mail of two concerns gets one issue per concern", async () => {
  const p = await open();
  await lastly(p, async () => {
    const clicks = [];
    await readMailbox(p, clicks);
    await chooseParticipant(p, "local-llm");
    await propose(p, clicks);
    const item = itemOf(p.main(), A.id);
    one(item, "mail-kind").value = "change";
    one(item, "mail-kind").dispatchEvent(new Event("change"));
    await typed(one(item, "mail-title"), "Export as PDF is asked for");
    await click(one(item, "create-issue"));
    await waitFor(() => created(p).length > 0);
    await typed(one(item, "mail-title"), "Export fails with E42");
    await typed(one(item, "mail-body"), "A second concern: the export fails with error E42 in version 1.4.");
    one(item, "mail-kind").value = "defect";
    one(item, "mail-kind").dispatchEvent(new Event("change"));
    await click(one(item, "create-issue"));
    await waitFor(() => created(p).length > 1);
    assert.deepEqual(created(p).map((issue) => [issue.title, issue.labels]), [["Export as PDF is asked for", ["change"]], ["Export fails with E42", ["defect"]]]);
    assert.ok(created(p).every((issue) => issue.body.includes(A.id)), "each issue lists the same identifier");
  });
});

// TST-965010 · level: system · module: MOD-maintenance-pages
// guards: UC-038 alternative 8a; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a token that lacks the permission to create issues in alice/product (the tracker answers 403)
// input: Read mailbox; a title and a text typed for a; the person's click on Create issue
// expect: the page says that the token lacks the permission, names the product and links the token step; nothing was written
test("alternative 8a: an issue that cannot be created says which refusal it is, links the token step and writes nothing", async () => {
  const p = await open({ createStatus: 403 });
  await lastly(p, async () => {
    await readMailbox(p, []);
    const item = itemOf(p.main(), A.id);
    await typed(one(item, "mail-title"), "Export fails");
    await typed(one(item, "mail-body"), "The export fails with error E42 in version 1.4.");
    await click(one(item, "create-issue"));
    await waitFor(() => textOf(one(item, "mail-result")) !== "");
    assert.match(textOf(one(item, "mail-result")), /permission|refus|alice\/product/i);
    assert.ok(byClass(item, "token-step").length > 0, "the token step is linked");
    assert.deepEqual(p.w.kept.created, [], "nothing was written");
  });
});
