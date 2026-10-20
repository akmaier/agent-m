// UC-038 "Turn mails into issues" on the IMAP route as a system path: the page of the route `mail`, started by MOD-site-frame's startPage, in front of the Bridge lab-pc-4 whose mail operations are the real mailHandlers of
// MOD-mail-protocols talking over STARTTLS to the local IMAP server of tests/uc-039-world.mjs. It walks the main flow (steps 1 to 8) as the Bridge runs it — read-only reading, the password sent to the Bridge with
// each call and to nothing else, the mails unchanged in the mailbox, the issue created with the identifier — and the alternative flow 2a (the Bridge does not answer). The alternative flows that are the page's alone are
// walked in tests/system-uc-038-turn-mails-into-issues.test.mjs.
// Run: node --test tests/system-uc-038-bridge-route.test.mjs (it needs imapflow and nodemailer: npm install --prefix src/bridge-build --omit=dev --ignore-scripts, as CI does)
//
// Module: MOD-maintenance-pages; MOD-mail-protocols
// Guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; MAIL STAYS IN THE MAILBOX; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// Guards: THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
// Level: system
//
// Each test states its input and its expected result in its own text (given / input / expect) from UC-038, before it runs. The server keeps every command it is given and every mail it holds; nothing leaves the process.
// The counter-proofs are recorded in the pull request. These tests need the Bridge's libraries, which only CI installs; they were not run on the machine that wrote them, and the pull request says so.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_URL, buttonsOf, byClass, flush, issueRecord, itemOf, mailOf, one, restoreWorld, textOf, trusted, waitFor, walk } from "./maintenance-pages-world.mjs";
import { ACCOUNT, PASSWORD, lastly, openReplies, rawMail } from "./uc-039-world.mjs";

afterEach(restoreWorld);

const row = (name, model, route = "endpoint ep1") => `| ${name} | model endpoint | ${model} | 200000 | — | draft text | this machine | ${route} |`;
const ROWS = [row("local-llm", "model-a"), row("check-1", "model-b"), row("check-2", "model-c"), row("check-3", "model-d")];
const [A] = [await mailOf("a")];
const BODY = "The export of my thesis fails with error E42 in version 1.4.\r\nKind regards\r\nErika Mustermann";
const answer = () => ({ draft: { proposals: [{ mail: A.id, product: PRODUCT_URL, kind: "defect", title: "Export fails with E42", text: "The export of a document fails with error E42 in version 1.4.", duplicates: [] }] }, answers: [] });
const open = (extra = {}) => openReplies({ route: "imap", fragment: "#mail", rows: ROWS, answer, issues: [issueRecord(3, "open", [])], inbox: [rawMail("a", { subject: "Export fails", body: BODY })], ...extra });

// TST-965101 · level: system · module: MOD-maintenance-pages · MOD-mail-protocols
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT; MAIL STAYS IN THE MAILBOX; THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
// given: the page on the IMAP route in front of the Bridge over the local IMAP server (INBOX holds the mail a from Erika Mustermann); the mailbox password is the marker password; local-llm and three checkers at this machine
// input: the person's click on Read mailbox; local-llm chosen and a name typed; Propose; the person's click on Create issue
// expect: the Bridge's read ran after the server's TLS and logged in with the marker password, and the server saw no STORE, APPEND, EXPUNGE, COPY or MOVE and no FETCH that sets a flag; INBOX holds the mail as it was; the mail is listed with sender and subject; one issue is created labelled defect, listing a's identifier and holding none of the mail's names or sentences; the password reached the Bridge with each call and no request to the tracker or to an endpoint (flow: UC-038 main flow, steps 1, 2, 4, 5, 7 and 8, and the postcondition)
test("main flow on the IMAP route: the Bridge reads read-only with the password it is given, the mail is unchanged, and the issue names the identifier and no person", async () => {
  const inbox = [rawMail("a", { subject: "Export fails", body: BODY })];
  const p = await open({ inbox });
  await lastly(p, async () => {
    await trusted(one(p.main(), "read-mailbox"));
    await waitFor(() => byClass(p.main(), "mail-decided").length > 0 || byClass(p.main(), "mailbox-problem").length > 0);
    assert.ok(p.state.calls.some((call) => call.operation === "read"), "the Bridge's read operation ran");
    const item = itemOf(p.main(), A.id);
    assert.ok(item && /Erika/.test(textOf(item)) && /Export fails/.test(textOf(item)), "the mail is listed with sender and subject");
    const commands = p.imap.logs.commands.map((command) => command.line);
    assert.ok(commands.some((line) => /\b(EXAMINE|SELECT|FETCH)\b/i.test(line)), "known positive: the server was read");
    assert.deepEqual(commands.filter((line) => /\b(STORE|APPEND|EXPUNGE|COPY|MOVE)\b/i.test(line)), [], "no command changed the mailbox");
    assert.deepEqual(commands.filter((line) => /FETCH/i.test(line) && /BODY\[/i.test(line) && !/PEEK/i.test(line)), [], "no FETCH marks a mail as read");
    assert.ok(p.imap.logs.logins.length > 0 && p.imap.logs.logins.every((login) => login.secure === true && login.password === PASSWORD), "every login was after TLS with the marker password");
    const input = one(p.main(), "person");
    input.value = "Anna Author";
    input.dispatchEvent(new Event("change"));
    const radio = one(walk(p.main(), (node) => node.getAttribute?.("data-participant") === "local-llm")[0], "participant");
    radio.checked = true;
    radio.dispatchEvent(new Event("change"));
    await waitFor(() => byClass(p.main(), "run-panel").length > 0);
    await trusted(buttonsOf(one(p.main(), "mail-stage"), "Run")[0]);
    await waitFor(() => byClass(p.main(), "mail-title").some((node) => node.value !== "" && node.value !== undefined));
    await trusted(one(itemOf(p.main(), A.id), "create-issue"));
    await waitFor(() => p.w.kept.issues.some((issue) => issue.number >= 100));
    const made = p.w.kept.issues.filter((issue) => issue.number >= 100);
    assert.equal(made.length, 1);
    assert.deepEqual(made[0].labels, ["defect"]);
    assert.ok(made[0].body.includes(A.id));
    for (const forbidden of ["Erika", "Mustermann", "erika@example.invalid", "Kind regards", "my thesis"]) assert.ok(!`${made[0].title}${made[0].body}`.includes(forbidden), `${forbidden} is not in the issue`);
    assert.deepEqual(p.imap.folders.INBOX.map((message) => message.raw.toString()), inbox, "the mail stays in the mailbox as it was");
    assert.ok(p.state.calls.every((call) => call.connection.imap.password === PASSWORD && call.connection.address === ACCOUNT), "the password went to the Bridge with each call");
    const elsewhere = JSON.stringify([p.w.kept.github, p.w.kept.endpoint, p.w.kept.ask]);
    assert.ok(!elsewhere.includes(PASSWORD), "the password reached no tracker, endpoint or agent");
  });
});

// TST-965102 · level: system · module: MOD-maintenance-pages · MOD-mail-protocols
// guards: UC-038; A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
// given: the page on the IMAP route and a Bridge that does not answer (it is paused)
// input: the person's click on Read mailbox
// expect: nothing is listed; the page names the Bridge's reason in the problem of the mailbox; nothing was written to the tracker and the server was not logged into (flow: UC-038 alternative 2a)
test("alternative 2a: a Bridge that does not answer is named, nothing is read and nothing is written", async () => {
  const p = await open();
  await lastly(p, async () => {
    p.state.down = true;
    await trusted(one(p.main(), "read-mailbox"));
    await waitFor(() => byClass(p.main(), "mailbox-problem").length > 0);
    assert.equal(byClass(p.main(), "mail").length, 0);
    assert.match(textOf(one(p.main(), "mailbox-problem")), /paus|Bridge|answer/i);
    assert.deepEqual(p.w.kept.github.filter((request) => request.method !== "GET"), []);
    assert.deepEqual(p.imap.logs.logins, [], "the server was not logged into");
  });
});
