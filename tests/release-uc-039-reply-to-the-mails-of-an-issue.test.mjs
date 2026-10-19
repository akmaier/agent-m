// Release coverage for UC-039 "Reply to the mails of an issue". The release-level guard that every requirement UC-039 realises with an automatic check is covered by executable evidence, that the system tests walk the main flow and every
// alternative flow UC-039 names, and — for the requirements that concern what a whole session does with a mailbox, its mails, its password and its participants — release cases that run the page over the fixtures: a full run
// leaves the mails in the mailbox and in no write of Agent M, a reply goes to one reporter, nothing is sent without a person, the participants are those the mailbox allows and the page names where it sends, and the mailbox
// password goes only to the Bridge.
// Run: node --test tests/release-uc-039-reply-to-the-mails-of-an-issue.test.mjs
//
// Module: MOD-maintenance-pages; MOD-mail-handling
// Guards: UC-039
// Level: release
//
// Input: docs/use-cases/UC-039-close-or-defer-an-issue-and-reply.md, SPEC.md, the two system tests of UC-039, the files that already check the requirements, and the fixtures of tests/uc-039-world.mjs and tests/maintenance-pages-world.mjs. Written
// for ITM-969 by a participant who built none of ITM-953, ITM-954 and ITM-966 to ITM-968 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Where the page and UC-039 disagree the test follows UC-039: the finding is
// alternative 1b ("the new mail shown in full"), which tests/system-uc-039-reply-to-the-mails-of-an-issue.test.mjs names; this file has no case of it. The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { mailId } from "../src/mail-records/index.mjs";
import { CLOUD, ERIKA, LOCAL, buttonsOf, byClass, flush, issueRecord, itemOf, mailOf, one, opened, restoreWorld, start, textOf, trusted, waitFor, SECRET } from "./maintenance-pages-world.mjs";
import { bodyOf, choose, comments, dialog, draftsOf, graphWrites, headerOf, lastly, openIssueAfterReading, openReplies, rawMail, readReplies, run, sends, writes } from "./uc-039-world.mjs";

afterEach(() => { if (globalThis.document) restoreWorld(); });

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const GRAPH_SYSTEM = "tests/system-uc-039-reply-to-the-mails-of-an-issue.test.mjs";
const BRIDGE_SYSTEM = "tests/system-uc-039-bridge-route.test.mjs";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-039-close-or-defer-an-issue-and-reply.md").split("\n")) {
    if (line === "realises:") { inRealises = true; continue; }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

function specChecks() {
  const checks = new Map();
  const pattern = /^\*\*(.+?)\*\*[\s\S]*?\*Check:\* ([^\n]*(?:\n(?!\*\*|## ).*)*)/gm;
  let match;
  while ((match = pattern.exec(read("SPEC.md")))) checks.set(match[1], match[2].replace(/\s+/g, " ").trim());
  return checks;
}

// Each requirement with an automatic check: the files that check it (a system test of UC-039 among them) and, in each, a mention of the requirement or the file the SPEC names. This file's own cases are named beside.
const COVERED_BY_RELEASE = {
  "CLOSING AN ISSUE PREPARES ITS REPLIES": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-replies.test.mjs", "tests/mail-handling-replies.test.mjs"],
  "A SENT REPLY IS NOTED IN THE ISSUE": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-send.test.mjs"],
  "THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/mail-records-notes.test.mjs"],
  "AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/mail-handling-intake.test.mjs"],
  "A MAIL IS FOUND AGAIN BY ITS IDENTIFIER": [BRIDGE_SYSTEM, "tests/test_bridge_mail.py", "tests/mail-protocols-read.test.mjs"],
  "A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER": [GRAPH_SYSTEM, "tests/test_mail_import.py", "tests/mail-records-identifier.test.mjs"],
  "MAIL STAYS IN THE MAILBOX": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_mail_privacy.py", "tests/mail-protocols-privacy.test.mjs"],
  "EVERY OUTGOING MAIL IS RELEASED BY A PERSON": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_mail_routes.py", "tests/maintenance-pages-send.test.mjs"],
  "A REPLY IS THREADED ON THE REPORTER'S MAIL": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_bridge_mail.py", "tests/mail-routes-graph-draft.test.mjs"],
  "A REPLY GOES TO ONE REPORTER": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/mail-handling-replies.test.mjs"],
  "AN ISSUE WAITING FOR A REPORTER IS LABELLED": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-ask.test.mjs"],
  "A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-ask.test.mjs"],
  "A CLOSED ISSUE IS REOPENED ONLY BY A PERSON": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-ask.test.mjs"],
  "THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED": [GRAPH_SYSTEM, "tests/test_mail_privacy.py", "tests/maintenance-pages-replies.test.mjs"],
  "THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE": [BRIDGE_SYSTEM, "tests/test_mail_password_route.py", "tests/mail-routes-route.test.mjs"],
  "THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST": [BRIDGE_SYSTEM, "tests/test_bridge_mail.py", "tests/mail-protocols-send.test.mjs"],
  "THE MAIL SERVER IS REACHED ONLY OVER TLS": [BRIDGE_SYSTEM, "tests/test_bridge_mail.py", "tests/mail-protocols-send.test.mjs"],
  "THE PAGE NAMES WHERE IT SENDS": [GRAPH_SYSTEM, "tests/site-frame-run-panel.test.mjs", "tests/prompt-bar.test.mjs"],
  "EVERY STEP EXPLAINS ITSELF": [GRAPH_SYSTEM, "tests/site-frame.test.mjs", "tests/settings-pages-add-product.test.mjs", "tests/settings-pages-setup.test.mjs", "tests/maintenance-pages-replies.test.mjs"],
  "A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_mail_replies.py", "tests/mail-routes-graph-draft.test.mjs"],
  "THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/maintenance-pages-replies.test.mjs"],
  "A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO": [GRAPH_SYSTEM, "tests/test_mail_replies.py", "tests/mail-handling-replies.test.mjs"],
  "THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN": [BRIDGE_SYSTEM, "tests/test_bridge_mail.py", "tests/mail-protocols-send.test.mjs"],
  "A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE": [GRAPH_SYSTEM, BRIDGE_SYSTEM, "tests/test_mail_routes.py", "tests/mail-routes-route.test.mjs"],
};
const REVIEW_ONLY = ["ONE CLICK PER DECISION"];

// TST-969201 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; every requirement UC-039 realises; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: UC-039's `realises` list, SPEC's current Check lines, the two system tests of UC-039 and the files that check the requirements
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY; read the declarations of the system tests
// expect: every realised requirement is either checked automatically and covered by evidence that exists, a system test among it, or checked at review only; the files the SPEC names as a requirement's check are among its evidence; the system tests declare the main flow and each alternative flow UC-039 names — 1a, 1b, 2a, 2b, 2c, 3a, 3b, 4a, 5a, 5b, 6a and 7a — and every declaration of them is at level system
test("TST-969201: UC-039 release coverage names every automatic requirement and the system tests walk every flow", () => {
  const realised = ucRealises();
  const checks = specChecks();
  assert.equal(realised.length, 25, "known positive: the use case realises twenty-five requirements");
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));
  const automatic = realised.filter((name) => !reviewOnly.includes(name));
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.some((file) => [GRAPH_SYSTEM, BRIDGE_SYSTEM].includes(file)), `${requirement}: a system test of UC-039 is among the evidence`);
    for (const file of files) assert.ok(existsSync(new URL(file, ROOT)), `${requirement}: ${file} exists`);
    const named = (checks.get(requirement) ?? "").match(/tests\/[A-Za-z0-9_.-]+/g) ?? [];
    for (const file of named) assert.ok(files.includes(file), `${requirement}: the SPEC's check ${file} is among the evidence`);
    for (const file of files) assert.match(read(file), /Level: (unit|component|system|release)/i, `${file} declares its level`);
    assert.ok(files.some((file) => read(file).includes(requirement) || named.includes(file)), `${requirement} is named by an evidence file or checked by the file the SPEC names`);
  }

  const declarations = [GRAPH_SYSTEM, BRIDGE_SYSTEM].flatMap((file) => testDeclarations(file, read(file)));
  assert.ok(declarations.length >= 15, "known positive: the declarations of the system tests are found");
  const declared = declarations.map((one) => `${one.guards.join("; ")} ${one.given ?? ""} ${one.input ?? ""} ${one.expect ?? ""}`).join("\n");
  for (const phrase of ["UC-039 main flow", ...["1a", "1b", "2a", "2b", "2c", "3a", "3b", "4a", "5a", "5b", "6a", "7a"].map((flow) => `UC-039 alternative ${flow}`)]) {
    assert.ok(declared.includes(phrase), `the system tests declare ${phrase}`);
  }
  assert.ok(declarations.every((one) => one.level === "system"), "every declaration of the system tests is level system");
});

// TST-969202 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; the evidence of every requirement is an executable test; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
// given: the evidence files of UC-039
// input: read the files' text
// expect: every evidence file is an executable test file, and the Python files that the SPEC names for the mail requirements are at release level
test("TST-969202: UC-039 evidence is executable and the SPEC's Python checks are release-level cases", () => {
  const allFiles = [...new Set(Object.values(COVERED_BY_RELEASE).flat())];
  assert.ok(allFiles.every((file) => /^tests\/.+(\.test\.mjs|\.py)$/.test(file)), "only executable tests are named");
  for (const file of ["tests/test_mail_replies.py", "tests/test_bridge_mail.py", "tests/test_mail_import.py", "tests/test_mail_privacy.py", "tests/test_mail_routes.py", "tests/test_mail_password_route.py"]) {
    assert.match(read(file), /level: release/i, `${file} has release-level cases`);
  }
});

// TST-969203 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; MAIL STAYS IN THE MAILBOX; A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER; THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
// given: the closed issue 4 lists m1; the mailbox on the Microsoft route holds m1 with a reporter's name, address, subject and text; the participant local-llm drafts the reply
// input: a whole session: Read replies twice, the issue opened, Draft replies with local-llm, the text edited and saved, Send and its confirmation
// expect: the mails of INBOX are the very bytes they were, and Agent M's requests to Graph are only reads, the creation of the draft, its replacement and removal and the provider's send — no flag, no move, no copy of a mail; every write to the issues (comments, labels, the job record's commits) holds no address, reporter's name, subject or text of a mail; the identifier is MAIL- and sixteen hex digits, equal to the hash of the Message-ID, the same at both readings, and the one the comment names; the identifier carries nothing of the mail's content
test("TST-969203: a whole session leaves the mails in the mailbox and writes only identifiers and dates", async () => {
  const inbox = [rawMail("m1")];
  const texts = [];
  const M1 = await mailOf("m1");
  const p = await openReplies({ inbox, issues: [issueRecord(4, "closed", [M1], { comments: ["Closed with pull request https://github.com/alice/product/pull/9."] })], texts });
  await lastly(p, async () => {
    await readReplies(p);
    const first = byClass(p.main(), "reply-issue").map((node) => node.getAttribute("data-issue"));
    await readReplies(p);
    assert.deepEqual(byClass(p.main(), "reply-issue").map((node) => node.getAttribute("data-issue")), first);
    await openIssueAfterReading(p, 4);
    const identifier = itemOf(p.main(), M1.id).getAttribute("data-mail");
    assert.equal(identifier, await mailId({ messageId: "<m1@mail.example.invalid>", bytes: null }), "the identifier is that of the Message-ID, at both readings");
    assert.match(identifier, /^MAIL-[0-9a-f]{16}$/);
    for (const content of ["Subject", "Erika", "erika", "example", "Hello"]) assert.ok(!identifier.includes(content), `the identifier carries nothing of "${content}"`);
    await choose(p);
    texts.push({ mail: M1.id, text: "Fixed in version 1.5." });
    await run(p);
    assert.equal(byClass(p.main(), "reply-problem").length, 0, textOf(p.main()).slice(-300));
    const item = itemOf(p.main(), M1.id);
    await waitFor(() => byClass(item, "draft-body").length > 0);
    const body = one(item, "draft-body");
    body.value = "Fixed in version 1.5, thank you.\n\n> Hello,";
    body.dispatchEvent(new Event("input"));
    await trusted(one(item, "save-draft"));
    await waitFor(() => draftsOf(p).length === 1 && bodyOf(draftsOf(p)[0]).includes("thank you"));
    await waitFor(() => byClass(item, "send-reply").length > 0);
    await trusted(one(item, "send-reply"));
    await waitFor(() => dialog() !== undefined);
    await trusted(buttonsOf(dialog(), "Send")[0]);
    await waitFor(() => byClass(item, "reply-sent").length > 0);
    assert.deepEqual(p.graph.folders.inbox.map((each) => each.raw), inbox, "the mails of the mailbox are as they were");
    const kinds = graphWrites(p).map((request) => `${request.method} ${decodeURIComponent(new URL(request.address).pathname).replace(/\/messages\/[^/]+/, "/messages/<id>")}`);
    assert.deepEqual([...new Set(kinds)].sort(), ["DELETE /v1.0/me/messages/<id>", "POST /v1.0/me/messages", "POST /v1.0/me/messages/<id>/send"], "only the draft is created, replaced and sent");
    const written = [...writes(p).map((request) => String(request.body ?? "")), ...comments(p)].join("\n");
    for (const content of [ERIKA.address, ERIKA.name, "Subject m1", "the export fails", SECRET, "thank you"]) assert.ok(!written.includes(content), `no write of Agent M holds "${content}"`);
    assert.deepEqual(comments(p).map((note) => note.replace(/\d{4}-\d{2}-\d{2}/, "<day>")), [`Reply sent to \`${identifier}\` on <day>.`]);
  });
});

// TST-969204 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; A REPLY GOES TO ONE REPORTER; A REPLY IS THREADED ON THE REPORTER'S MAIL; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
// given: the closed issue 4 lists three mails of three reporters (one answers to a Reply-To of another person, one has a second recipient in To and a Cc, one is a plain mail); each has been read in the mailbox
// input: the person writes the reply for each of the three mails
// expect: three drafts are stored in Drafts, nowhere else; each has exactly one To — the mail's Reply-To where it has one, otherwise its sender —, no Cc, no Bcc, none of the other reporters' addresses; each is threaded on its own mail: In-Reply-To is that mail's Message-ID and References end with it
test("TST-969204: an issue with three reports yields three drafts, each to one reporter and threaded on that reporter's mail", async () => {
  const keys = ["m1", "m2", "m3"];
  const ids = await Promise.all(keys.map((key) => mailOf(key)));
  const raws = [rawMail("m1", { from: "Ada Reporter <ada@example.invalid>" }), rawMail("m2", { from: "Bo Writer <bo@example.invalid>", replyTo: "Cy Other <cy@example.invalid>", to: "reports@example.org, team@example.org" }), rawMail("m3", { from: "Di Plain <di@example.invalid>" })];
  const p = await openReplies({ inbox: raws, issues: [issueRecord(4, "closed", ids, { comments: ["Closed with pull request https://github.com/alice/product/pull/9."] })] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    for (const mail of ids) await trusted(one(itemOf(p.main(), mail.id), "write-reply"));
    await waitFor(() => draftsOf(p).length === 3);
    assert.equal(draftsOf(p).length, 3);
    const expected = { m1: "ada@example.invalid", m2: "cy@example.invalid", m3: "di@example.invalid" };
    for (const key of keys) {
      const draft = draftsOf(p).find((raw) => headerOf(raw, "In-Reply-To")[0] === `<${key}@mail.example.invalid>`);
      assert.ok(draft, `${key} has its draft`);
      const to = headerOf(draft, "To");
      assert.equal(to.length, 1);
      assert.ok(to[0].includes(expected[key]) && !to[0].includes(","), `${key} goes to ${expected[key]} alone`);
      assert.deepEqual([headerOf(draft, "Cc"), headerOf(draft, "Bcc")], [[], []]);
      for (const other of Object.values(expected).filter((address) => address !== expected[key])) assert.ok(!draft.includes(other), `${key}'s draft does not name ${other}`);
      assert.ok(headerOf(draft, "References")[0].endsWith(`<${key}@mail.example.invalid>`));
    }
    assert.deepEqual([p.graph.folders.sentitems, sends(p)], [[], []]);
  });
});

// TST-969205 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; EVERY OUTGOING MAIL IS RELEASED BY A PERSON; ONE CLICK PER DECISION; A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
// given: the closed issue 4 lists m1 and m2, m1 with Agent M's draft in Drafts, m2 without; the page shows the issue
// input: a click that a script makes — not the person's — on every button of the page, one after the other; then the person's click on Send, declined in the dialog
// expect: the scripted clicks write nothing anywhere — no comment, label or state change at GitHub, no request to Graph that is not a read, no participant asked — and open no dialog; the declined dialog sends nothing; no send request reaches Graph at any point of the session
test("TST-969205: nothing is written and nothing is sent unless a person clicks, and no mail is sent without the dialog's confirmation", async () => {
  const [M1, M2] = [await mailOf("m1"), await mailOf("m2")];
  const draft = ["Message-ID: <draft-m1@example.org>", "Date: Mon, 19 Oct 2026 08:00:00 +0000", "From: reports@example.org", `To: ${ERIKA.address}`, "Subject: Re: Subject m1", "In-Reply-To: <m1@mail.example.invalid>", "References: <m1@mail.example.invalid>", "X-Agent-M-Draft: 1", "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", "Text.", ""].join("\r\n");
  const p = await openReplies({ inbox: [rawMail("m1"), rawMail("m2")], drafts: [draft], issues: [issueRecord(4, "closed", [M1, M2], { comments: ["Closed with pull request https://github.com/alice/product/pull/9."] })] });
  await lastly(p, async () => {
    await openIssueAfterReading(p, 4);
    await waitFor(() => byClass(p.main(), "send-reply").length > 0 && byClass(p.main(), "participant").length > 0);
    const buttons = [];
    (function visit(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (child.localName === "button") buttons.push(child); visit(child); } })(p.main());
    assert.ok(buttons.length >= 4, `known positive: the page has buttons (${buttons.map((button) => button.textContent).join(", ")})`);
    const before = [writes(p).length, graphWrites(p).length, p.w.kept.endpoint.length];
    for (const button of buttons) { button.dispatchEvent(new Event("click")); await flush(); }
    assert.deepEqual([writes(p).length, graphWrites(p).length, p.w.kept.endpoint.length], before, "scripted clicks write nothing");
    assert.equal(dialog(), undefined, "and open no dialog");
    await trusted(one(itemOf(p.main(), M1.id), "send-reply"));
    await waitFor(() => dialog() !== undefined);
    await trusted(buttonsOf(dialog(), "Cancel")[0]);
    assert.deepEqual([sends(p), comments(p)], [[], []]);
  });
});

// TST-969206 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; THE PAGE NAMES WHERE IT SENDS
// given: the closed issue 4 lists m1; the register lists local-llm (this machine), cloud-llm (a provider in the USA) and checker (this machine, cannot draft text)
// input: the issue opened with a mailbox that allows only this machine; again with a mailbox that allows this machine and the USA (outside the EU); again with a mailbox that allows no place; each time local-llm and cloud-llm are chosen in turn
// expect: where only this machine is allowed local-llm is the only participant offered and the checker never is; where the USA is allowed too cloud-llm is offered, its place named and marked as not compliant with the GDPR and the EU AI Act, and its run panel names the place the mail goes to; where no place is allowed no participant is offered and the page says why; no model endpoint is asked in any of the three until Run
test("TST-969206: only participants at a place the mailbox allows are offered, and the page names where the mail goes", async () => {
  const M1 = await mailOf("m1");
  const issues = () => [issueRecord(4, "closed", [M1], { comments: ["Closed with pull request https://github.com/alice/product/pull/9."] })];
  const visit = async (places, fn) => {
    const p = await openReplies({ inbox: [rawMail("m1")], issues: issues(), places, rows: [LOCAL, CLOUD, "| checker | model endpoint | model-c | 200000 | — | read the repository | this machine | endpoint ep1 |"] });
    await lastly(p, async () => { await openIssueAfterReading(p, 4); await fn(p); assert.deepEqual(p.w.kept.endpoint, [], "no endpoint is asked before Run"); });
  };
  await visit([{ place: "this machine", outsideEu: false }], async (p) => {
    await waitFor(() => byClass(p.main(), "participant").length > 0);
    assert.deepEqual(byClass(p.main(), "participant").map((radio) => radio.value), ["local-llm"]);
  });
  restoreWorld();
  await visit([{ place: "this machine", outsideEu: false }, { place: "a provider in the USA", outsideEu: true }], async (p) => {
    await waitFor(() => byClass(p.main(), "participant").length > 0);
    assert.deepEqual(byClass(p.main(), "participant").map((radio) => radio.value).sort(), ["cloud-llm", "local-llm"]);
    const cloud = byClass(p.main(), "reply-participant").find((node) => node.getAttribute("data-participant") === "cloud-llm");
    assert.match(textOf(cloud), /a provider in the USA/);
    assert.match(textOf(one(cloud, "not-compliant")), /outside the EU.*GDPR.*EU AI Act/);
    assert.equal(byClass(byClass(p.main(), "reply-participant").find((node) => node.getAttribute("data-participant") === "local-llm"), "not-compliant").length, 0);
    await choose(p, "Reviewer Rae", byClass(p.main(), "participant").findIndex((radio) => radio.value === "cloud-llm"));
    assert.match(textOf(one(p.main(), "run-panel")), /cloud-llm.*a provider in the USA/s, "the panel names where the mail goes");
  });
  restoreWorld();
  await visit([], async (p) => {
    await waitFor(() => byClass(p.main(), "reply-no-participant").length > 0);
    assert.deepEqual(byClass(p.main(), "participant"), []);
    assert.match(textOf(one(p.main(), "reply-no-participant")), /No participant that can draft text works at a place this mailbox allows/);
  });
});

// TST-969207 · level: release · module: MOD-maintenance-pages · MOD-mail-handling
// guards: UC-039; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: the page on the IMAP route (the Bridge lab-pc-4 of the world answers the mail operations); the mailbox connection holds the marker password mail-password-966; the closed issue 4 lists four mails
// input: Read replies, the issue opened, Write the reply myself for a mail with a usable address, Send and its confirmation — every request the page makes is recorded with its address, headers and body
// expect: the marker password is in the body of requests to the Bridge's origin and in no other request — not GitHub, not a model endpoint —, in no address and in no header; the requests to the Bridge are the mail operations of the route; the reply is sent only after the dialog's confirmation
test("TST-969207: the mailbox password goes only to the Bridge in the body of its requests", async () => {
  const f = await start();
  const seen = [];
  const inner = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    seen.push({ url: String(typeof input === "object" && !(input instanceof URL) ? input.url : input), headers: JSON.stringify(init.headers ?? {}), body: String(init.body ?? "") });
    return inner(input, init);
  };
  await readReplies({ main: () => f.target });
  const detail = await opened(f.w, { issue: "4", product: "https://github.com/alice/product" });
  const item = itemOf(detail, f.mails.drafted.id);
  await waitFor(() => byClass(item, "send-reply").length > 0);
  await trusted(one(item, "send-reply"));
  await waitFor(() => dialog() !== undefined);
  assert.equal(f.w.kept.bridge.filter((call) => call.operation === "send").length, 0, "nothing is sent before the confirmation");
  await trusted(buttonsOf(dialog(), "Send")[0]);
  await waitFor(() => byClass(item, "reply-sent").length > 0 || byClass(item, "reply-problem").length > 0);
  assert.equal(f.w.kept.bridge.filter((call) => call.operation === "send").length, 1);
  const marker = "mail-password-966";
  const holding = seen.filter((request) => request.url.includes(marker) || request.headers.includes(marker) || request.body.includes(marker));
  assert.ok(holding.length > 0, "known positive: the password reaches the Bridge");
  assert.ok(holding.every((request) => request.url.startsWith("http://127.0.0.1:4711/v1/mail/") && !request.url.includes(marker) && !request.headers.includes(marker)), `only the body of a request to the Bridge holds it (${holding.map((each) => each.url).join(", ")})`);
  assert.ok(seen.some((request) => request.url.startsWith("https://api.github.com/")), "known positive: the issues were read");
  assert.equal(seen.filter((request) => request.url.startsWith("https://")).some((request) => request.body.includes(marker) || request.url.includes(marker)), false);
});
