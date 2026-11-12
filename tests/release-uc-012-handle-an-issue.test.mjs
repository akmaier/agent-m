// Release tests of UC-012 "Handle an issue: bug fix or specification change", on the issue's page: each requirement UC-012 realises, checked from what the author reads on the page, from what the prompt bar holds and
// sends, and from the requests the fixture servers received. As akmaier accepted UC-012 (step 2): the author "presses **Implement**: one click puts the request to handle the issue as this use case does — with its
// number, title and text — into the prompt bar, where the author sends or changes it (UC-049). The agent of the conversation works on the issue with the requirements, use cases and tests it touches." The class, the
// fix and the change are the work of that agent (steps 3 to 6); the page keeps, as docs/architecture/MOD-maintenance-pages.md states its route `issue/<number>`, *Implement*, the old and the new expectation side by
// side (5a), *Move to backlog*, and "closing an issue with links once its pull request is merged".
// TST-585301 maps every requirement UC-012 realises to a release test that guards it.
// Run: node --test tests/release-uc-012-handle-an-issue.test.mjs
//
// Module: MOD-maintenance-pages
// Module: MOD-issue-handling
// Guards: UC-012
// Level: release
//
// Written for the release testing of sprint 141 by developer-opus-e (ITM-585), and rewritten for pull request #1802 (Implement in place of Analyse, the class and the fix and change run panels) by a participant who
// implemented none of that pull request (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER). The expectations are taken from UC-012 and MOD-maintenance-pages as accepted in 79bccc24d and 327b4b5de, not from the
// page's code. Two worlds: the whole main page of tests/uc-039-world.mjs (MOD-site-frame's startPage with the real MOD-prompt-bar, over the fake GitHub of alice/product, its mailbox and the model endpoints of
// tests/maintenance-pages-world.mjs), for what Implement puts into the prompt bar and what the bar then sends; and tests/uc-012-harness.mjs, the route `issue` over the real MOD-repository-hosts, for the fix's pull
// request and closing with links. Readings the texts leave open, which the cases state:
//   - "puts the request … into the prompt bar" is read through MOD-prompt-bar's own sentence: "A page puts a prompt into the bar with the window's event `agent-m:prompt`, its `detail` the text: the bar takes it into
//     its input and focuses it, and sends nothing." The case reads the bar's input. Node's globalThis is no EventTarget, so the cases give the page the window a browser has (`browserWindow`).
//   - "the request to handle the issue as this use case does" is read as a request that names UC-012, the use case to follow, and holds the issue's number, title and text.
//   - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI names no automatic check. In UC-012 it is read as: the page writes no code and no test, and the issue is closed with its links only
//     once the fix's pull request is merged; that the merge waits for green CI is the product's branch protection and Definition of Done (UC-002), not this page. The fix's pull request is the one of the job of
//     the kind fix-bug whose record works on the issue (MOD-job-ledger's `works_on`), which the product holds.
//   - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS is read in UC-012 through its actors: the decisions are the author's, a person's clicks, and the work is the participant's, "the model endpoint or agent the author
//     hands the work to" (UC-012, Actors) — here the one the author sends the request to in the prompt bar.
//   - ONE CLICK PER DECISION names no automatic check. It is read as: a decision whose inputs are complete takes effect on its one click — Implement's request in the bar, the issue closed with links.
//   - An issue from a mail is an issue whose text is neutral and lists the `MAIL-` identifier of its report (UC-038), while the mail itself stays in the mailbox.
// The requirements whose page behaviour the accepted texts removed are mapped in TST-585301 to release tests of other use cases that guard them where UC-012's work now runs; the cases removed are named in
// the pull request with the sentences that went.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { withMailIds } from "../src/mail-records/index.mjs";
import { startRecord } from "../src/job-ledger/index.mjs";
import { view as maintenance } from "../src/maintenance-pages/index.mjs";
import { ERIKA, mailOf } from "./maintenance-pages-world.mjs";
import { lastly, openReplies, rawMail } from "./uc-039-world.mjs";
import { registerLikeStart } from "./uc-049-world.mjs";
import { ADDRESS, PRODUCT_URL, byClass, everyWrite, issueNow, issueOf, one, open, restoreWorld, start, textOf, trusted, waitFor, writtenFiles } from "./uc-012-harness.mjs";

registerLikeStart([maintenance], "tests/release-uc-012-handle-an-issue.test.mjs");

// The map reads files only and draws no page, so that there is no world to put back after it.
afterEach(() => { if (globalThis.document) restoreWorld(); });

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const UC = "docs/use-cases/UC-012-turn-an-issue-into-a-specification-change.md";
const SELF = "tests/release-uc-012-handle-an-issue.test.mjs";

// ---------------------------------------------------------------- the map

// Each requirement UC-012 realises, with the release tests that guard it. Where the accepted texts moved the work from the page to the conversation's agent (UC-012 steps 3 to 6, 5b), the requirement is guarded
// where that work now runs: the impact list on the page of the entry the agent writes, accepted per UC-006 (step 6); the capabilities of a role and of a connection where the prompt bar and the role assignment offer them.
const EVIDENCE = {
  "EVOLUTION ENTERS THROUGH THE SPECIFICATION": [[SELF, "TST-585302"]],
  "A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST": [["tests/release-itm-1274-entry-impact-without-rationale.test.mjs", "TST-1274301"]],
  "EVERY ARTIFACT NAMES ITS ORIGIN": [[SELF, "TST-585304"]],
  "CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI": [[SELF, "TST-585305"]],
  "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS": [[SELF, "TST-585306"]],
  "A ROLE NAMES THE CAPABILITIES IT NEEDS": [["tests/release-sprint-06-uc-002-implementation-pages.test.mjs", "TST-472498"]],
  "A CONNECTION DECLARES ITS CAPABILITIES": [["tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs", "TST-513211"]],
  "ONE CLICK PER DECISION": [[SELF, "TST-585311"]],
  "A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL": [[SELF, "TST-585312"]],
  "NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY": [[SELF, "TST-585313"]],
};

// TST-585301 · level: release · module: system
// guards: UC-012
// given: UC-012 as committed text, whose `realises` lists ten requirements, and the release tests named in EVIDENCE
// input: read UC-012's list of the requirements it realises, and the declarations of the test files named for each
// expect: known positive — UC-012 realises these ten requirements; each has at least one test named; each test named stands in its file with the level release and guards that requirement
test("TST-585301: UC-012 every requirement it realises has a release test that guards it", () => {
  const front = /^realises:\n((?:  - .*\n)+)/m.exec(read(UC))?.[1] ?? "";
  const realised = front.split("\n").filter(Boolean).map((line) => line.replace(/^ {2}- /, ""));
  assert.equal(realised.length, 10, "known positive: UC-012 realises ten requirements");
  assert.deepEqual([...realised].sort(), Object.keys(EVIDENCE).sort(), "the map holds exactly the requirements UC-012 realises");
  for (const [requirement, tests] of Object.entries(EVIDENCE)) {
    assert.ok(tests.length > 0, `${requirement}: a test is named`);
    for (const [file, id] of tests) {
      assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${requirement}: ${file} exists`);
      const declared = testDeclarations(file, read(file)).find((each) => each.id === id);
      assert.ok(declared, `${requirement}: ${id} is declared in ${file}`);
      assert.equal(declared.level, "release", `${id} is a release test`);
      assert.ok((declared.guards ?? []).includes(requirement), `${id} guards ${requirement}`);
    }
  }
});

// ---------------------------------------------------------------- the whole page with its prompt bar

// The window a browser gives the page and the bar: an EventTarget, put back after the case.
function browserWindow() {
  const target = new EventTarget();
  const names = ["addEventListener", "removeEventListener", "dispatchEvent"];
  const before = names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  for (const name of names) globalThis[name] = target[name].bind(target);
  return () => { for (const [name, descriptor] of before) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } };
}

// What this browser declares for the bar to offer (UC-049 1): the endpoint local-llm at "this machine", which drafts text, and the CLI session the Bridge lab-pc-4 offers for its agent writer, which writes to the repository.
const ENDPOINTS = { "endpoint:local-llm": { kind: "openai-compatible", url: "https://ep1.example.test/v1", model: "model-a", key: "k1", place: "this machine", context: 200000 } };
const WRITER = { name: "writer", place: "this machine", capabilities: ["draft text", "read the repository", "write to the repository", "run code and tests"], models: [{ model: "model-w", context: 200000 }] };

const TITLE = "Export loses pages";
const TEXT = "The export is cut off after the second page; FIRST RULE says nothing about page counts.";
const anIssue = (number, { title = `${TITLE} ${number}`, body = TEXT, labels = [], state = "open" } = {}) => ({ number, title, body, state, labels, comments: [] });

/** The main page at the issue `number` of alice/product, with the window of a browser; `inbox` the mailbox's raw mails. The page's Implement and the bar's input waited for. */
async function issuePage(number, { issues, inbox = [] }) {
  const restore = browserWindow();
  const p = await openReplies({ inbox, issues, rows: [], settings: ENDPOINTS, agents: [WRITER], fragment: `#issue/number=${number}/product=${encodeURIComponent(PRODUCT_URL)}` });
  const stop = p.stop;
  p.stop = async () => { try { await stop(); } finally { restore(); } };
  await waitFor(() => byClass(p.main(), "implement-issue").length > 0 && byClass(document.body, "instruction").length > 0);
  return p;
}
const bar = () => one(document.body, "prompt-bar");
const barInput = () => one(bar(), "instruction");
const githubWrites = (p) => p.w.kept.github.filter((request) => request.method !== "GET");
const sentToParticipants = (p) => p.w.kept.endpoint.length + p.state.asks.length;

/** The person's Send in the bar to `participant` (its name: an endpoint, or `lab-pc-4:<agent>`), with what the input holds; what that participant was given, as one text. */
async function sendTo(p, participant) {
  const selector = byClass(bar(), "participant").find((node) => node.localName === "select");
  if (selector) {
    const option = selector.children.find((node) => typeof node !== "string" && node.localName === "option" && node.value.startsWith(`${participant} · `));
    assert.ok(option, `the bar offers ${participant}: ${textOf(selector)}`);
    selector.value = option.value;
  }
  const session = participant.startsWith("lab-pc-4:");
  const before = session ? p.state.asks.length : p.w.kept.endpoint.length;
  await trusted(one(bar(), "send"));
  await waitFor(() => (session ? p.state.asks.length : p.w.kept.endpoint.length) > before);
  return session ? String(p.state.asks[before].input) : p.w.kept.endpoint[before].body.messages.map((message) => message.content).join("\n");
}

// ---------------------------------------------------------------- evolution enters through the specification

// TST-585302 · level: release · module: system
// guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// given: the open issue 5 of alice/product, "Export loses pages 5", whose text TEXT asks for behaviour FIRST RULE does not give; the bar's input empty (known positive)
// input: the author opens the issue and presses Implement
// expect: the bar's input holds the request to handle issue #5 as UC-012 does — naming UC-012, whose step 6 makes a change a specification change before any code —, with the issue's title and text; the page offers no run panel and no control that changes code; the click writes nothing to the product's repository or its issue and sends nothing to a participant
// Planted fault: the request without the use case it follows (`as Agent M's UC-012 does` dropped from implementSection, src/maintenance-pages/issues.mjs) fails on "names UC-012".
test("TST-585302: UC-012 Implement asks for the issue to be handled as UC-012 does, which puts a change through the specification first, and the page itself changes no code", async () => {
  const p = await issuePage(5, { issues: [anIssue(5)] });
  await lastly(p, async () => {
    assert.equal(barInput().value, "", "known positive: the bar's input is empty before Implement");
    await trusted(one(p.main(), "implement-issue"));
    const request = barInput().value;
    assert.match(request, /UC-012/, `the request names UC-012: ${request}`);
    assert.match(request, /#5\b/);
    assert.ok(request.includes(`${TITLE} 5`) && request.includes(TEXT), request);
    assert.equal(byClass(p.main(), "run-panel").length, 0, "the issue page holds no run panel");
    assert.deepEqual(githubWrites(p), [], "Implement writes nothing");
    assert.equal(sentToParticipants(p), 0, "Implement sends nothing");
  });
});

// ---------------------------------------------------------------- every artifact names its origin

// TST-585304 · level: release · module: system
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; UC-012
// given: the open issues 5 and 7 of alice/product, each with its own title and text
// input: the author opens issue 7 and presses Implement; then opens issue 5 and presses Implement
// expect: each request names its own issue by its number and holds its own title and text, and nothing of the other issue — the identifier the entries of a change (step 6, "each naming the issue") and the pull request of a fix (step 5, "links the issue") name as their origin
// Planted fault: the request naming a fixed issue (`handle issue #${issue.number}` replaced by `handle issue #5` in implementSection, src/maintenance-pages/issues.mjs) fails on issue 7's request, which then names another issue.
test("TST-585304: UC-012 the request Implement puts into the bar names the issue it comes from", async () => {
  const issues = [anIssue(5), anIssue(7, { title: "Import drops tables 7", body: "The import of a table loses its last row." })];
  for (const [number, own, other] of [[7, ["Import drops tables 7", "The import of a table loses its last row."], [`${TITLE} 5`, TEXT]], [5, [`${TITLE} 5`, TEXT], ["Import drops tables 7"]]]) {
    const p = await issuePage(number, { issues });
    await lastly(p, async () => {
      await trusted(one(p.main(), "implement-issue"));
      const request = barInput().value;
      assert.match(request, new RegExp(`#${number}\\b`), `the request names issue #${number}: ${request}`);
      assert.doesNotMatch(request, new RegExp(`#${number === 7 ? 5 : 7}\\b`), "and no other issue");
      for (const part of own) assert.ok(request.includes(part), `the request holds ${part}`);
      for (const part of other) assert.ok(!request.includes(part), `the request holds nothing of the other issue: ${part}`);
    });
    restoreWorld();
  }
});

// ---------------------------------------------------------------- code enters through a pull request

const FIX_JOB = "JOB-20261029-0900-a1b2";
const FIX_RECORD = startRecord({ id: FIX_JOB, kind: "fix-bug", worksOn: [ADDRESS(5)], participant: "dev-cli", model: "fixture-llm", route: "ci hosted", run: null, retries: null, startedBy: "alice",
  start: new Date("2026-10-29T09:00:00Z"), agentM: { version: "unreleased", commit: "f".repeat(40) }, inputs: [], limit: 2, destinations: [{ participant: "dev-cli", place: "GitHub's hosted runners", parts: [] }], params: { issue: 5 } });
const pullOf = (branch, state) => ({ number: 9, title: `${branch}: fix-bug`, branch, base: "main", head: "2".repeat(40), mergeCommit: state === "merged" ? "3".repeat(40) : null, state, draft: false,
  url: `${PRODUCT_URL}/pull/9`, opened: "2026-10-29T09:10:00Z", merged: state === "merged" ? "2026-10-29T09:50:00Z" : null, closed: state === "merged" ? "2026-10-29T09:50:00Z" : null, body: `Job: ${branch}` });
const NO_FACTS = async () => ({ pullRequest: null, commits: [], files: [], reviews: [], checks: [], read: async () => null });

/** The world of the issue 5, classified as a bug (the label defect), whose fix job's record the product holds, its pull request #9 in `state`; `issue` the issue as the fake GitHub keeps it. */
const fixWorld = (state, issue = issueOf(5, TEXT, { labels: ["defect"] })) => start({ issues: [issue], product: { [FIX_RECORD.path]: FIX_RECORD.text },
  pulls: (branch) => (branch === FIX_JOB ? pullOf(branch, state) : null), facts: NO_FACTS });
async function fixPage(w) {
  const detail = await open(w, 5);
  await waitFor(() => byClass(detail, "fix-pull").length > 0 || byClass(detail, "issue-problem").length > 0);
  assert.equal(byClass(detail, "issue-problem").length, 0, textOf(one(detail, "issue-problem") ?? detail));
  return detail;
}

// TST-585305 · level: release · module: system
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; UC-012
// given: the open issue 5, classified as a bug; the product holds the record of its fix job, whose pull request #9 is open in one world and merged in another
// input: the author opens the issue and presses Implement, in each world
// expect: the page names pull request #9 as open, or as merged; it offers Close with links only for the merged one (known positive) and not while #9 is open; opening the issue and Implement write no file, no code and no test to the product, and the issue stays open until the person closes it
// Planted fault: Close with links offered for a pull request in any state (`pullRequest.state === "merged"` read as true in fixTrail, src/maintenance-pages/issues.mjs) fails on the open pull request.
test("TST-585305: UC-012 the page writes no code, and offers to close the issue with its links only once the fix's pull request is merged", async () => {
  for (const state of ["merged", "open"]) {
    const w = fixWorld(state);
    const before = writtenFiles(w).length;
    const detail = await fixPage(w);
    assert.match(textOf(one(detail, "fix-pull")), new RegExp(`pull request #9 is ${state}`));
    assert.equal(byClass(detail, "close-with-links").length, state === "merged" ? 1 : 0, `Close with links for a pull request ${state}`);
    await trusted(one(detail, "implement-issue"));
    assert.deepEqual(writtenFiles(w).slice(before).map((entry) => entry.path), [], "nothing is written to the repository");
    assert.equal(issueNow(w, 5).state, "open", "the issue stays open until the person closes it");
    restoreWorld();
  }
});

// ---------------------------------------------------------------- people and agents

// TST-585306 · level: release · module: system
// guards: A PROCESS MODEL ORGANISES PEOPLE AND AGENTS; UC-012
// given: the open issue 5; the bar offers the endpoint local-llm and the CLI session lab-pc-4:writer
// input: Implement clicked by a script, then by the person; the person's Send in the bar to local-llm
// expect: the script's click puts nothing into the bar; the person's click puts the request there and hands it to no participant — the endpoint and the Bridge's sessions received nothing —; only the person's Send hands it to the agent chosen, local-llm, which receives the request with issue #5 (known positive)
// Planted fault: Implement answering any click (`event?.isTrusted === true &&` dropped from mail.mjs' `button`, src/maintenance-pages/mail.mjs) fails on the script's click.
test("TST-585306: UC-012 the person puts the issue into the bar and hands it to the agent of the conversation; nothing is handed before", async () => {
  const p = await issuePage(5, { issues: [anIssue(5)] });
  await lastly(p, async () => {
    one(p.main(), "implement-issue").dispatchEvent(new Event("click"));
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(barInput().value, "", "a script's click puts nothing into the bar");
    await trusted(one(p.main(), "implement-issue"));
    assert.match(barInput().value, /#5\b/, "the person's click puts the request into the bar");
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(sentToParticipants(p), 0, "nothing is handed to a participant before the person sends it");
    const given = await sendTo(p, "local-llm");
    assert.ok(given.includes(TEXT) && /#5\b/.test(given), `known positive: the agent chosen receives the request: ${given.slice(0, 300)}`);
  });
});

// ---------------------------------------------------------------- one click per decision

// TST-585311 · level: release · module: system
// guards: ONE CLICK PER DECISION; UC-012
// given: the open issue 5; in another world the open issue 5, classified as a bug, whose fix's pull request #9 is merged
// input: one click on Implement; one click on Close with links
// expect: after the one click on Implement the request stands in the bar's input, with no dialog and nothing more to press before it is there; after the one click on Close with links the issue 5 is closed, with a comment that names pull request #9, and no dialog asks for a further click
// Planted fault: Close with links that only marks the issue to be closed (the call of `closeWithLinks` dropped from closeControls, src/maintenance-pages/issues.mjs) fails on the issue's state.
test("TST-585311: UC-012 Implement and closing with links each take one click", async () => {
  const p = await issuePage(5, { issues: [anIssue(5)] });
  await lastly(p, async () => {
    await trusted(one(p.main(), "implement-issue"));
    assert.match(barInput().value, /UC-012/, "one click puts the request into the bar");
    assert.equal(byClass(document.body, "decision").length, 0, "no dialog");
  });
  restoreWorld();

  const w = fixWorld("merged");
  const detail = await fixPage(w);
  await trusted(one(detail, "close-with-links"));
  await waitFor(() => issueNow(w, 5).state === "closed" || byClass(detail, "issue-problem").length > 0);
  assert.equal(issueNow(w, 5).state, "closed", textOf(detail));
  assert.ok(issueNow(w, 5).comments.some((comment) => String(comment).includes(`${PRODUCT_URL}/pull/9`)), `the comment names the pull request: ${issueNow(w, 5).comments}`);
  assert.equal(byClass(detail, "decision").length, 0, "no dialog");
});

// ---------------------------------------------------------------- mail

const REPORT = { subject: "Help with the export", body: "My export of the thesis fails with error E42 after page two.\r\nKind regards\r\nErika Mustermann" };
const MAIL_WORDS = [ERIKA.name, ERIKA.address, REPORT.subject, "error E42", "Erika"];
const holdsMail = (text) => MAIL_WORDS.filter((word) => text.includes(word));
const NEUTRAL = "The export of a long document stops after the second page; FIRST RULE.";

// TST-585312 · level: release · module: system
// guards: A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL; UC-012
// given: the open issue 5 created from a mail (UC-038), its text neutral and listing the mail's MAIL- identifier; the mail from Erika Mustermann, "Help with the export", reporting error E42, in the mailbox; the bar offers lab-pc-4:writer, a CLI session that writes to the repository; known positive: the scan below finds the sender's address in a text that holds it
// input: the author opens the issue, presses Implement and sends the request to lab-pc-4:writer
// expect: what lab-pc-4:writer is given holds the neutral issue — issue #5 and its text — and nothing of the mail: not its text, its subject, its sender's name or address
// Planted fault: the request carrying the mail's subject (the line "From the mail: Help with the export" appended to the request in implementSection, src/maintenance-pages/issues.mjs, standing for a mail read into it) fails on what the writer is given.
test("TST-585312: UC-012 the agent that writes, given the issue from a mail by Implement, receives the neutral issue, never the mail", async () => {
  assert.deepEqual(holdsMail(`planted: ${ERIKA.address}`), [ERIKA.address], "known positive: the scan finds a planted address");
  const { id } = await mailOf("r1");
  const p = await issuePage(5, { issues: [anIssue(5, { body: withMailIds(NEUTRAL, [id]) })], inbox: [rawMail("r1", REPORT)] });
  await lastly(p, async () => {
    await trusted(one(p.main(), "implement-issue"));
    const given = await sendTo(p, "lab-pc-4:writer");
    assert.ok(given.includes(NEUTRAL) && /#5\b/.test(given), `known positive: the writer is given the neutral issue: ${given.slice(0, 400)}`);
    assert.deepEqual(holdsMail(given), [], "the writer receives nothing of the mail");
  });
});

// TST-585313 · level: release · module: system
// guards: NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-012
// given: the open issue 5 created from a mail from Erika Mustermann (erika@example.invalid), its text neutral and listing the mail's identifier, classified as a bug, its fix's pull request #9 merged; known positive: the scan below finds the planted address in a text that holds it
// input: the author opens the issue, presses Implement and presses Close with links
// expect: the comment and the state that close the issue are written (known positive); no file, commit, comment or label the page sent to the product holds the sender's name, address, the mail's subject or its text
// Planted fault: the closing comment naming the reporter ("Reported by erika@example.invalid." appended to the comment of closeWithLinks, src/issue-handling/classes.mjs) fails on what is written.
test("TST-585313: UC-012 nothing the page writes while handling an issue from a mail holds personal data of the mail", async () => {
  assert.deepEqual(holdsMail(`planted: ${ERIKA.address}`), [ERIKA.address], "known positive: the scan finds a planted address");
  const { id } = await mailOf("r1");
  const w = fixWorld("merged", issueOf(5, withMailIds(NEUTRAL, [id]), { labels: ["defect"] }));
  const detail = await fixPage(w);
  await trusted(one(detail, "implement-issue"));
  await trusted(one(detail, "close-with-links"));
  await waitFor(() => issueNow(w, 5).state === "closed" || byClass(detail, "issue-problem").length > 0);
  assert.ok(everyWrite(w).includes(`${PRODUCT_URL}/pull/9`), "known positive: the closing comment is written");
  assert.deepEqual(holdsMail(everyWrite(w)), []);
});
