// Release coverage for UC-038 "Turn mails into issues". The release-level guard that every requirement UC-038 realises with an automatic check is covered by executable evidence, that the system tests walk the main flow and every
// alternative flow the item names — 2a, 4b, 4c, 6a, 7a, 7b and 8a — and, for the requirements that concern what a whole session does with a mailbox, its mails, its participants and the tracker, release cases that run the page over the fixtures:
// a whole session leaves the mails in the mailbox and in no write of Agent M that names a sender, a name, a subject or a sentence of a mail, the issues carry the identifiers and the labels, and a participant at a place the mailbox does not allow
// receives nothing. And, for the inbox of steps 1 to 4 and 7: opening Mail reads the mailbox at once and every five minutes while it stays open; a reading lists only the mails of the last 30 days, as the mail server
// selects them, an older undecided mail stays in the mailbox unlisted (2b); the mails are listed newest first with sender, subject and date, the undecided ones in bold, the decided ones with their issue or mark and
// no proposal; a clicked mail shows its details; and a reading takes Propose, then per undecided mail one click to open it and one decision (postcondition).
// Run: node --test tests/release-uc-038-turn-mails-into-issues.test.mjs (TST-965206 needs imapflow and nodemailer: npm install --prefix src/bridge-build --omit=dev --ignore-scripts, as CI does)
//
// Module: MOD-maintenance-pages; MOD-mail-protocols
// Guards: UC-038
// Level: release
//
// Input: docs/use-cases/UC-038-turn-mails-into-issues.md, SPEC.md, the two system tests of UC-038, the files that already check the requirements, and the fixtures of tests/uc-039-world.mjs and tests/maintenance-pages-world.mjs. Written for ITM-965 by
// a participant who built none of ITM-963 and ITM-964 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). Where a file the SPEC names as a check does not exist, the finding is marked a todo, as the release tests of UC-049 mark theirs.
// TST-965203 to TST-965207 were written anew, from the accepted UC-038 (steps 1, 2, 3, 4, 7, 2b and the postcondition) and the accepted `mail` route of docs/architecture/MOD-maintenance-pages.md and NewMail and readNewMail of
// MOD-mail-handling.md, by a participant who built none of the inbox they test (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER); they replace the implementer's edit of TST-965203 and TST-965204.
// The counter-proofs are recorded in the pull request.

import test, { afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { PRODUCT_URL, buttonsOf, byClass, flush, issueRecord, itemOf, mailOf, one, restoreWorld, textOf, trusted, waitFor, walk } from "./maintenance-pages-world.mjs";
import { graphWrites, hashTo, lastly, openReplies, rawMail, writes } from "./uc-039-world.mjs";

afterEach(() => { mock.timers.reset(); clicks.count = 0; if (globalThis.document) restoreWorld(); });

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const GRAPH_SYSTEM = "tests/system-uc-038-turn-mails-into-issues.test.mjs";
const BRIDGE_SYSTEM = "tests/system-uc-038-bridge-route.test.mjs";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-038-turn-mails-into-issues.md").split("\n")) {
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

// The files the SPEC names as the check of a requirement of UC-038 and that this repository does not hold.
const MISSING_CHECKS = {};
const REVIEW_ONLY = ["ONE CLICK PER DECISION"];

// TST-965201 · level: release · module: MOD-maintenance-pages
// guards: UC-038; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: UC-038's `realises` list, SPEC's current Check lines, the two system tests of UC-038 and the files that check the requirements
// input: compare the realised requirements with the SPEC's Check lines; read the declarations of the system tests
// expect: every realised requirement is checked at review only, or its Check names files that exist — a system test of UC-038 among the evidence, each with a level — or a file listed as missing; the system tests declare the main flow and each alternative flow the item names: 2a, 4b, 4c, 6a, 6c, 7a, 7b, 8a
test("TST-965201: UC-038 release coverage names every automatic requirement and the system tests walk every flow", () => {
  const realised = ucRealises();
  const checks = specChecks();
  assert.equal(realised.length, 28, "known positive: the use case realises twenty-eight requirements");
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());
  const missing = Object.values(MISSING_CHECKS).flat();
  for (const requirement of realised.filter((name) => !reviewOnly.includes(name))) {
    const named = (checks.get(requirement) ?? "").match(/tests\/[A-Za-z0-9_.-]+/g) ?? [];
    assert.ok(named.length > 0, `${requirement}: the SPEC names a check`);
    for (const file of named) {
      if (Object.hasOwn(MISSING_CHECKS, file)) {
        assert.ok(!existsSync(new URL(file, ROOT)), `${file} is listed as missing, but exists: list it as evidence of ${requirement}`);
        assert.ok(MISSING_CHECKS[file].includes(requirement));
        continue;
      }
      assert.ok(existsSync(new URL(file, ROOT)), `${requirement}: ${file} exists`);
      assert.match(read(file), /Level: (unit|component|system|release)|level: (unit|component|system|release)/i, `${file} declares its level`);
    }
  }
  assert.deepEqual(missing, [], "no requirement of UC-038 names a check that is listed as missing");
  const declarations = [GRAPH_SYSTEM, BRIDGE_SYSTEM].flatMap((file) => testDeclarations(file, read(file)));
  assert.ok(declarations.length >= 11, "known positive: the declarations of the system tests are found");
  const declared = declarations.map((one) => `${one.guards.join("; ")} ${one.given ?? ""} ${one.input ?? ""} ${one.expect ?? ""}`).join("\n");
  for (const phrase of ["UC-038 main flow", ...["2a", "4b", "4c", "6a", "7a", "7b", "8a"].map((flow) => `UC-038 alternative ${flow}`)]) {
    assert.ok(declared.includes(phrase), `the system tests declare ${phrase}`);
  }
  assert.ok(declarations.every((one) => one.level === "system"), "every declaration of the system tests is level system");
});

// TST-965202 · level: release · module: MOD-maintenance-pages
// guards: UC-038
// given: the SPEC's Check lines of the requirements UC-038 realises
// input: look for each file they name
// expect: every file exists
test("TST-965202: the checks the SPEC names for the requirements of UC-038 exist", () => {
  const checks = specChecks();
  const files = new Set(ucRealises().flatMap((name) => (checks.get(name) ?? "").match(/tests\/[A-Za-z0-9_.-]+/g) ?? []));
  assert.ok(files.size > 10, "known positive: the use case names checks");
  for (const file of files) assert.ok(existsSync(new URL(file, ROOT)), `${file} exists`);
});

// The needles: a sender's name and address, a subject and a sentence that appear in the mails and in nothing Agent M writes.
const NEEDLES = ["Erika", "Mustermann", "erika@example.invalid", "NEEDLE-SUBJECT-965", "NEEDLE-SENTENCE-965", "Kind regards"];
const row = (name, model, place, route = "endpoint ep1") => `| ${name} | model endpoint | ${model} | 200000 | — | draft text | ${place} | ${route} |`;
const ROWS = [row("local-llm", "model-a", "this machine"), row("check-1", "model-b", "this machine"), row("check-2", "model-c", "this machine"), row("check-3", "model-d", "this machine"), row("cloud-llm", "model-e", "a provider in the USA", "endpoint ep2")];

async function session(extra = {}) {
  const [A, B, LISTED] = [await mailOf("a"), await mailOf("b"), await mailOf("listed")];
  const inbox = [
    rawMail("a", { subject: "NEEDLE-SUBJECT-965 export", body: "NEEDLE-SENTENCE-965 the export fails with error E42.\r\nKind regards\r\nErika Mustermann" }),
    rawMail("b", { subject: "NEEDLE-SUBJECT-965 dark", body: "NEEDLE-SENTENCE-965 please add a dark theme.\r\nKind regards\r\nErika Mustermann" }),
    rawMail("listed"),
  ];
  const answer = () => ({ draft: { proposals: [
    { mail: A.id, product: PRODUCT_URL, kind: "defect", title: "Export fails with E42", text: "The export of a document fails with error E42 in version 1.4.", duplicates: [] },
    { mail: B.id, product: PRODUCT_URL, kind: "change", title: "Dark theme", text: "A dark theme is asked for.", duplicates: [{ issue: 3, reason: "the same wish" }] }] }, answers: [] });
  const p = await openReplies({ route: "graph", fragment: "#mail", rows: ROWS, answer, inbox, issues: [issueRecord(3, "open", [LISTED])], ...extra });
  return { p, A, B, inbox };
}
// What the person does on the page, each button press counted (UC-038 postcondition: "Clicks per reading: Propose, then per undecided mail one click to open it and one decision"). Opening a mail is the person's
// click on its line in the list (step 7); a list is waited for until it shows `count` lines or names the mailbox's problem; opening Mail again is going to another page of the dashboard and back to Mail (step 1).
const clicks = { count: 0 };
const click = async (node) => { assert.ok(node, "the control the person clicks is shown"); clicks.count += 1; await trusted(node); };
const lines = (p) => byClass(p.main(), "mail-line");
const lineOf = (p, id) => lines(p).find((node) => node.getAttribute("data-line") === id);
const listedIds = (p) => lines(p).map((node) => node.getAttribute("data-line"));
const listed = (p, count) => waitFor(() => lines(p).length >= count || byClass(p.main(), "mailbox-problem").length > 0);
// A line in bold: the class the page's look sets in bold (TST-965207 reads the rule in src/site-frame/look.css).
const bold = (line) => String(line?.className ?? "").split(/\s+/).includes("undecided");
const openLine = async (p, id) => { await click(one(lineOf(p, id), "mail-open")); return itemOf(p.main(), id); };
async function openMailAgain(p, count) {
  await hashTo("#replies");
  await waitFor(() => lines(p).length === 0);
  await hashTo("#mail");
  await listed(p, count);
}
async function propose(p) {
  const select = one(p.main(), "participant");
  select.value = "local-llm";
  select.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(p.main(), "run-panel").length > 0);
  assert.match(textOf(one(p.main(), "run-panel")), /this machine/, "the panel names where local-llm processes data");
  await click(buttonsOf(one(p.main(), "mail-stage"), "Propose")[0]);
  await waitFor(() => byClass(p.main(), "mail-proposed").length > 0 || byClass(p.main(), "mail-propose-problem").length > 0);
}
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY);

// TST-965203 · level: release · module: MOD-maintenance-pages
// guards: UC-038; MAIL STAYS IN THE MAILBOX; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; READING THE MAILBOX CHANGES NOTHING IN IT; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; ONE CLICK PER DECISION
// given: the mailbox on the Microsoft route holds two new mails from Erika Mustermann, with needle words in subject and text, and a mail issue 3 lists; local-llm proposes
// input: a whole session: Mail opened, which reads the mailbox without a click; local-llm chosen and a name typed; Propose; the first mail's line clicked and Create issue; the second mail's line clicked, 3 typed, Add to #3; Mail opened again
// expect: the first reading lists the three mails, the two new ones in bold and the listed one not; the person pressed five buttons — Propose, then per undecided mail one to open it and one decision (postcondition); the mails of INBOX are the very bytes they were and Agent M's requests to Graph are only reads; besides the job record of the proposal the tracker is written twice — the creation of the issue and the comment that lists the second mail —, each with the MAIL identifier of its mail, and no write holds a needle; the issue is labelled defect; the next reading lists all three mails again, none in bold, the first with its new issue and the second with #3, and offers no proposal
test("TST-965203: a whole session leaves the mails in the mailbox, writes only neutral text and identifiers, and takes one click per mail to open and one to decide", async () => {
  const { p, A, B, inbox } = await session();
  await lastly(p, async () => {
    const LISTED = await mailOf("listed");
    await listed(p, 3);
    assert.equal(clicks.count, 0, "known positive: nothing was clicked before the list was shown");
    assert.deepEqual(listedIds(p).toSorted(), [A.id, B.id, LISTED.id].toSorted(), "opening Mail read the mailbox and lists its three mails");
    assert.ok(bold(lineOf(p, A.id)) && bold(lineOf(p, B.id)), "the undecided mails are in bold");
    assert.ok(!bold(lineOf(p, LISTED.id)), "the mail issue 3 lists is not in bold");
    const before = clicks.count;
    await propose(p);
    await click(one(await openLine(p, A.id), "create-issue"));
    await waitFor(() => p.w.kept.issues.some((issue) => issue.number >= 100));
    const second = await openLine(p, B.id);
    one(second, "mail-issue-number").value = "3";
    one(second, "mail-issue-number").dispatchEvent(new Event("input"));
    await flush();
    await click(one(second, "add-to-issue"));
    await waitFor(() => p.w.kept.github.some((request) => request.method === "POST" && request.path.endsWith("/issues/3/comments")));
    assert.equal(clicks.count - before, 1 + 2 * 2, "Propose, then per undecided mail one click to open it and one decision");
    assert.deepEqual(p.graph.folders.inbox.map((message) => message.raw), inbox, "the mails of INBOX are the very bytes they were");
    assert.deepEqual(graphWrites(p), [], "Agent M's requests to Graph are only reads");
    const made = writes(p).filter((request) => request.method === "POST");
    const record = (request) => /\/git\/(trees|commits)$/.test(request.path);
    assert.deepEqual(made.filter((request) => !record(request)).map((request) => `${request.method} ${request.path}`).sort(), ["POST /repos/alice/product/issues", "POST /repos/alice/product/issues/3/comments"], "besides the job record of the proposal, the tracker is written twice");
    assert.ok(made.some(record), "known positive: the job record of the proposal was committed");
    for (const request of made) for (const needle of NEEDLES) assert.ok(!String(request.body).includes(needle), `${needle} is not in a write to the repository (${request.path})`);
    for (const request of made.filter((each) => !record(each))) assert.match(String(request.body), /MAIL-[0-9a-f]{16}/, "an issue and a comment name their mail by an identifier");
    assert.deepEqual(JSON.parse(made.find((request) => request.path.endsWith("/issues")).body).labels, ["defect"]);
    const created = p.w.kept.issues.find((issue) => issue.number >= 100).number;
    await openMailAgain(p, 3);
    assert.deepEqual(listedIds(p).toSorted(), [A.id, B.id, LISTED.id].toSorted(), "the decided mails stay listed");
    assert.deepEqual(lines(p).filter(bold), [], "no mail is in bold: each is decided");
    assert.match(textOf(lineOf(p, A.id)), new RegExp(`#${created}\\b`), "the first mail shows the issue created from it");
    assert.match(textOf(lineOf(p, B.id)), /#3\b/, "the second mail shows the issue it was added to");
    assert.equal(byClass(p.main(), "mail-step-propose").length, 0, "no proposal is offered: no mail is undecided");
    assert.deepEqual(graphWrites(p), [], "still only reads");
  });
});

// TST-965204 · level: release · module: MOD-maintenance-pages
// guards: UC-038; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; THE PAGE NAMES WHERE IT SENDS; A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
// given: a register with participants at this machine and one in the USA (outside the EU), and a mailbox that allows this machine only
// input: Mail opened, which reads the mailbox; the participants offered; local-llm chosen; Propose; then the first mail's line clicked
// expect: the participant in the USA is not offered; the panel names where local-llm processes data; every request a model endpoint received went to the endpoint of the participants at this machine and none to the one in the USA; before its line is clicked the mail's details are not shown, after the click they show the mail in full and its proposal (step 7)
test("TST-965204: with a mailbox that allows this machine only, nothing is sent to a participant elsewhere, and a clicked mail shows its proposal", async () => {
  const { p, A } = await session();
  await lastly(p, async () => {
    await listed(p, 3);
    const offered = walk(p.main(), (node) => node.getAttribute?.("data-participant")).map((node) => node.getAttribute("data-participant"));
    assert.ok(offered.includes("local-llm") && !offered.includes("cloud-llm"), `offered: ${offered.join(", ")}`);
    await propose(p);
    assert.ok(p.w.kept.endpoint.length > 0, "known positive: the participant was asked");
    assert.ok(p.w.kept.endpoint.every((request) => request.origin === "https://ep1.example.test"), "every request went to the endpoint of a participant at this machine");
    assert.ok(itemOf(p.main(), A.id) === undefined, "before its line is clicked, the mail's details are not shown");
    const details = await openLine(p, A.id);
    assert.ok(details, "the clicked mail's details are shown");
    assert.match(textOf(details), /NEEDLE-SENTENCE-965 the export fails with error E42/, "the details show the mail in full");
    assert.equal(one(details, "mail-title").value, "Export fails with E42", "the details show its proposal");
  });
});

// TST-965205 · level: release · module: MOD-maintenance-pages
// guards: UC-038
// given: the mailbox on the Microsoft route with the session's three mails; the page's timers are node:test's mock timers, so that five minutes are the test's own clock
// input: Mail opened, without a click; the clock moved on by five minutes less a millisecond, then by one millisecond; then another page of the dashboard opened and the clock moved on by ten minutes
// expect: opening Mail reads the mailbox at once and lists the mails; no further reading before five minutes; a reading at five minutes (known positive); none once Mail is no longer open (step 1: "reads the mailbox at once, and again every five minutes while Mail stays open")
test("TST-965205: opening Mail reads the mailbox at once and again every five minutes while Mail stays open", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const { p, A } = await session();
  await lastly(p, async () => {
    const readings = () => p.graph.requests.filter((request) => request.method === "GET" && /\/mailFolders\/inbox\/messages/.test(decodeURIComponent(request.address))).length;
    await listed(p, 3);
    assert.equal(clicks.count, 0);
    assert.equal(readings(), 1, "opening Mail read the mailbox once, without a click");
    assert.ok(lineOf(p, A.id), "and lists its mails");
    mock.timers.tick(5 * 60 * 1000 - 1);
    await flush();
    assert.equal(readings(), 1, "no reading before five minutes");
    mock.timers.tick(1);
    await waitFor(() => readings() > 1);
    assert.equal(readings(), 2, "the reading at five minutes");
    await listed(p, 3);
    await hashTo("#replies");
    await waitFor(() => lines(p).length === 0);
    const left = readings();
    mock.timers.tick(10 * 60 * 1000);
    await flush();
    assert.equal(readings(), left, "no reading once Mail is no longer open");
  });
});

// TST-965206 · level: release · module: MOD-maintenance-pages · MOD-mail-protocols
// guards: UC-038; READING THE MAILBOX CHANGES NOTHING IN IT
// given: the IMAP route in front of the Bridge over the local IMAP server, whose INBOX holds a mail nobody decided received forty days ago (uid 1) and one received twenty-five days ago (uid 2)
// input: Mail opened
// expect: the server was asked to select the mails received since the day thirty days before now (SEARCH SINCE), and no mail's body was fetched for uid 1; the mail of twenty-five days ago is listed (known positive) and the one of forty days ago is not (step 2, 2b); the old mail stays in INBOX as it was (2b)
test("TST-965206: a reading lists only the mails of the last 30 days, selected by the mail server; an older undecided mail stays in the mailbox", async () => {
  const old = rawMail("old", { subject: "Old report", date: daysAgo(40).toUTCString() });
  const recent = rawMail("recent", { subject: "Recent report", date: daysAgo(25).toUTCString() });
  const [OLD, RECENT] = [await mailOf("old"), await mailOf("recent")];
  const p = await openReplies({ route: "imap", fragment: "#mail", rows: ROWS, inbox: [old, recent], issues: [issueRecord(3, "open", [])] });
  await lastly(p, async () => {
    await listed(p, 1);
    assert.deepEqual(listedIds(p), [RECENT.id], "the mail of twenty-five days ago is listed, the one of forty days ago is not");
    assert.ok(lineOf(p, OLD.id) === undefined, "the old mail has no line");
    const commands = p.imap.logs.commands.map((command) => command.line);
    const since = commands.map((line) => /\bUID SEARCH\b.*\bSINCE (\d{1,2})-(\w{3})-(\d{4})/i.exec(line)).filter(Boolean);
    assert.ok(since.length > 0, `the server was asked to select by SINCE: ${commands.filter((line) => /SEARCH/i.test(line)).join(" | ")}`);
    const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const wanted = daysAgo(30);
    const wantedDay = Date.UTC(wanted.getUTCFullYear(), wanted.getUTCMonth(), wanted.getUTCDate());
    for (const [, day, month, year] of since) {
      const asked = Date.UTC(Number(year), MONTHS.indexOf(month.toUpperCase()), Number(day));
      assert.ok(Math.abs(asked - wantedDay) <= DAY, `SINCE names the day thirty days before now (asked ${day}-${month}-${year})`);
    }
    const bodies = commands.filter((line) => /\bUID FETCH\b/i.test(line) && /BODY/i.test(line));
    assert.ok(bodies.length > 0, "known positive: a mail's body was fetched");
    const covers = (set, uid) => set.split(",").some((part) => { const [from, to] = part.split(":"); return uid >= Number(from) && uid <= (to === undefined ? Number(from) : to === "*" ? Infinity : Number(to)); });
    assert.deepEqual(bodies.filter((line) => covers(/\bUID FETCH (\S+)/i.exec(line)[1], 1)), [], "the old mail's body was not fetched");
    assert.deepEqual(p.imap.folders.INBOX.map((message) => message.raw.toString()), [old, recent], "the old mail stays in the mailbox as it was");
  });
});

// TST-965207 · level: release · module: MOD-maintenance-pages
// guards: UC-038; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; ONE CLICK PER DECISION
// given: the mailbox on the Microsoft route holds, each from its own sender: a mail issue 3 lists (five days ago), an undecided one of three days ago, an undecided one of two days ago, an undecided one of a day ago, and an answer to the listed mail (two hours ago)
// input: Mail opened; the listed mail's line clicked; the newest undecided mail's line clicked; the mail of two days ago clicked and Not an issue pressed; Mail opened again and that mail's line clicked
// expect: before any click the five mails are listed newest first, each line with its sender, subject and date, no mail's details shown; the three undecided ones in bold, the listed one and the answer not, each of these with issue 3, the answer attached to it; the look sets a line in bold; the listed mail's details show it in full and the issue that lists it, and no decision; the undecided one's details show it in full, an empty proposal and Create issue, Add to #n and Not an issue; after Not an issue its line leaves bold and names its mark; the next reading lists it again, not in bold, with its mark, its details show the mark and no decision; counter-proof: the other two undecided mails stay in bold
test("TST-965207: the mails are listed as an inbox, newest first, undecided ones in bold; a clicked mail shows its details and, if decided, its issue or its mark", async () => {
  const at = { listed: daysAgo(5), older: daysAgo(3), marked: daysAgo(2), newer: daysAgo(1), answer: new Date(Date.now() - 2 * 60 * 60 * 1000) };
  const senders = { listed: ["Erika Mustermann", "erika@example.invalid"], older: ["Frank Beispiel", "frank@example.invalid"], marked: ["Otto Normal", "otto@example.invalid"], newer: ["Max Muster", "max@example.invalid"], answer: ["Erika Mustermann", "erika@example.invalid"] };
  const subjects = { listed: "Export fails", older: "Import is slow", marked: "Out of office", newer: "Dark theme wanted", answer: "Re: Export fails" };
  const bodies = { listed: "The export fails with error E42.", older: "The import of a large file takes minutes.", marked: "I am out of the office until Monday.", newer: "Please add a dark theme.", answer: "It still fails in version 1.5." };
  const keys = Object.keys(at);
  const inbox = keys.map((key) => rawMail(key, { from: `"${senders[key][0]}" <${senders[key][1]}>`, subject: subjects[key], body: bodies[key], date: at[key].toUTCString(), inReplyTo: key === "answer" ? "<listed@mail.example.invalid>" : null }));
  const M = Object.fromEntries(await Promise.all(keys.map(async (key) => [key, await mailOf(key)])));
  const p = await openReplies({ route: "graph", fragment: "#mail", rows: ROWS, inbox, issues: [issueRecord(3, "open", [M.listed])] });
  await lastly(p, async () => {
    await listed(p, 5);
    assert.deepEqual(listedIds(p), ["answer", "newer", "marked", "older", "listed"].map((key) => M[key].id), "one line per mail, the newest first");
    for (const key of keys) {
      const line = lineOf(p, M[key].id);
      assert.ok(textOf(line).includes(senders[key][0]), `${key}: its line names its sender`);
      assert.ok(textOf(line).includes(subjects[key]), `${key}: its line names its subject`);
      const time = line.getElementsByTagName("time")[0];
      assert.ok(time && String(time.textContent).trim() !== "", `${key}: its line names its date`);
      assert.equal(Date.parse(time.getAttribute("datetime")), Math.floor(at[key].getTime() / 1000) * 1000, `${key}: the date is the mail's`);
      assert.ok(itemOf(p.main(), M[key].id) === undefined, `${key}: no details before its line is clicked`);
    }
    assert.deepEqual(keys.filter((key) => bold(lineOf(p, M[key].id))), ["older", "marked", "newer"], "the undecided mails are in bold, the listed one and the answer not");
    assert.match(textOf(lineOf(p, M.listed.id)), /#3\b/, "the listed mail shows its issue");
    assert.match(textOf(lineOf(p, M.answer.id)), /#3\b/, "the answer shows the issue of its thread");
    assert.ok(p.w.kept.github.some((request) => request.method === "POST" && request.path.endsWith("/issues/3/comments") && String(request.body).includes(M.answer.id)), "the answer was attached to issue 3");
    const look = read("src/site-frame/look.css");
    assert.match(look, /\.mail-line\.undecided\s*\{[^}]*font-weight:\s*(700|bold)/, "the look sets an undecided line in bold");
    assert.match(look, /\.mail-line\s*\{[^}]*font-weight:\s*(400|normal)/, "and every other line not");

    const decided = await openLine(p, M.listed.id);
    assert.ok(decided, "the listed mail's details are shown");
    assert.ok(textOf(decided).includes(bodies.listed), "the details show the mail in full");
    assert.match(textOf(decided), /#3\b/, "the details show the issue that lists it");
    for (const name of ["create-issue", "add-to-issue", "not-an-issue"]) assert.equal(byClass(decided, name).length, 0, `a decided mail offers no ${name}`);

    const undecided = await openLine(p, M.newer.id);
    assert.ok(undecided, "the undecided mail's details are shown");
    assert.ok(textOf(undecided).includes(bodies.newer), "the details show the mail in full");
    assert.equal(String(one(undecided, "mail-title").value ?? ""), "", "its proposal is empty before Propose (4b)");
    for (const name of ["create-issue", "add-to-issue", "not-an-issue"]) assert.equal(byClass(undecided, name).length, 1, `an undecided mail offers ${name}`);

    const before = clicks.count;
    await click(one(await openLine(p, M.marked.id), "not-an-issue"));
    assert.equal(clicks.count - before, 2, "one click to open the mail, one to decide it");
    await waitFor(() => !bold(lineOf(p, M.marked.id)));
    assert.ok(!bold(lineOf(p, M.marked.id)), "the mail marked not an issue leaves bold");
    assert.match(textOf(lineOf(p, M.marked.id)), /not an issue/i, "and names its mark");

    await openMailAgain(p, 5);
    assert.ok(lineOf(p, M.marked.id), "the marked mail stays listed");
    assert.ok(!bold(lineOf(p, M.marked.id)), "not in bold");
    assert.match(textOf(lineOf(p, M.marked.id)), /not an issue/i, "with its mark");
    assert.deepEqual(keys.filter((key) => bold(lineOf(p, M[key].id))), ["older", "newer"], "counter-proof: the other undecided mails stay in bold");
    const marked = await openLine(p, M.marked.id);
    assert.match(textOf(marked), /not an issue/i, "its details show its mark");
    for (const name of ["create-issue", "add-to-issue", "not-an-issue"]) assert.equal(byClass(marked, name).length, 0, `a marked mail offers no ${name}`);
  });
});
