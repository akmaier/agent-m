// The route `mail` of MOD-maintenance-pages, up to the author's decision (ITM-963, and the inbox the PO A. Maier asked for on 2026-11-05) — UC-038 steps 1 to 3, 7 to 9, 10 (the link), 2a, 4b, 6a, 7a, 7b, 8a — as the
// accepted text of docs/architecture/MOD-maintenance-pages.md states it (blob of commit 2337a9514): "`mail` — the mailbox read when the page is drawn and again every five minutes while it stays drawn, never while a
// reading runs. An inbox list in this browser only, the newest first, one line per mail with sender, subject and date: the proposable mails in bold, the attached and decided ones not, each of these with its issue or
// its mark *not an issue*. The mail clicked shows its details beside the list on a wide screen, and in place of the list, with a way back to it, on a narrow one: the mail in full and, for a proposable mail, its
// proposal, its text editable, every hit of the mail's people marked, *Create issue* — only without a hit —, *Add to #n*, *Not an issue*. ... A later reading keeps the mail that is open, the proposals and their
// edits, the chosen participant and a running proposal; a mail decided leaves bold and shows its decision." The participant, the run panel and *Propose* are ITM-964's: here every proposal is empty (UC-038 4b).
// Run: node --test tests/maintenance-pages-mail.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; MAIL STAYS IN THE MAILBOX; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; ONE CLICK PER DECISION; EVERY STEP EXPLAINS ITSELF;
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-038
// Level: component
//
// The document is the small DOM of tests/site-frame-dom.mjs. The real MOD-mail-routes (the Bridge route), MOD-mail-handling, MOD-mail-records, MOD-personal-data, MOD-repository-hosts (GitHub), MOD-bridge-client and MOD-browser-store
// run as they are; only `fetch` is faked, by this file: the Bridge on the loopback answers the mail operation `read` (POST /v1/mail/read) with the mails given, and GitHub's REST API for alice/product answers the issues — listed and one by one —, their
// comments, the creation of an issue and of a comment, keeping what it is given. The store is a Map-backed localStorage that holds the mailbox connection, the Bridge, the product and its token. Nothing leaves the process.
// The page's setTimeout is node:test's mock timers, so that "five minutes" is the test's own clock; the waits of this file keep the real one.
// Readings the texts leave open, which the tests state:
//   - The page: <div class="mail-page" data-readings="<n>"> counts the readings that have ended; no heading "Mail" and no button Read again. <p class="mail-status"> says when the mailbox was read. <p class="mailbox-problem">
//     names why nothing was read. The inbox is <div class="mail-inbox"> with <section class="mail-step-list"> (<ul class="mail-list"> of <li class="mail-line" data-line="<MAIL-id>">, the class undecided on the bold ones) and
//     <section class="mail-details">. Each line holds <button class="mail-open"> with .mail-sender, .mail-subject and <time class="mail-date" datetime="<the mail's date>">, the date written as a mail program writes it, not
//     the raw ISO text; a decided or attached line holds <span class="mail-decision"> with <a class="issue-link"> to #issue/number=<n>/product=<address>, or the words "not an issue".
//   - The mail clicked: the line gets aria-current="true", the inbox the class mail-open-shown, and the details hold <button class="mail-back"> "Back to the list" and <div class="mail" data-mail="<MAIL-id>">: for a
//     proposable mail the review — <pre class="mail-text"> (the mail in full), <select class="mail-product">, <select class="mail-kind">, <input class="mail-title">, <textarea class="mail-body">, <ul class="mail-hits">,
//     <button class="create-issue">, <input class="mail-issue-number"> with <button class="add-to-issue"> "Add to #<n>", <button class="not-an-issue">, <p class="mail-result"> —; for a decided one the mail in full and
//     <p class="mail-decided-as"> with its issue or its mark, and no decision. Opening a mail writes nothing, so it answers any click, the keyboard's included.
//   - On a narrow screen the style sheet (src/site-frame/look.css) hides the list while the inbox is mail-open-shown and shows the way back, which a wide screen hides; the small DOM lays nothing out, so the rules are read.
//   - Each decision is made on a click the browser marks as a person's (isTrusted); a click a script makes does nothing. Create issue is disabled while a hit stands, and while the title or the text is empty.
//   - After Create issue or Add to #n the mail keeps its review (7b: Create issue once per concern) and its line leaves bold with the issue; after Not an issue the line leaves bold with the mark and the details show the
//     decision. The next reading names every mail an issue lists or the store marks as decided.
//   - A created issue of the kind change is followed by <a class="issue-link"> to #issue/number=<n>/product=<address> (UC-038 step 10); one of the kind defect has none.
//   - A refused token (HTTP 401) or a missing permission (403) on Create issue is named with the product, with <a class="token-step"> to the step that stores the token (#add-product); nothing is written.
//   - Every step is folded with <details class="explain">: reading, the list, the review of a mail, the decisions.
//   - The route gives the prompt bar a subject whose page holds the `MAIL-` identifiers of the proposable mails and no mail text, and which refuses propose-edit and hand-over.

import "./site-frame-dom.mjs";
import test, { afterEach, mock } from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { openStore, writeSetting, readSetting } from "../src/browser-store/index.mjs";
import { mailId, withMailIds, noteText } from "../src/mail-records/index.mjs";
import { chosenProduct, fragmentOf, routeOf } from "../src/site-frame/routing.mjs";

const pages = await import("../src/maintenance-pages/index.mjs").catch((error) => ({ error }));
const route = () => pages.view?.routes.find((candidate) => candidate.name === "mail");

const INSTANCE = "alice/agent-m";
const PRODUCT = "alice/product";
const PRODUCT_URL = `https://github.com/${PRODUCT}`;
const BRIDGE_URL = "http://127.0.0.1:4711";
const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
const SECRET_SENTENCE = "the export of my thesis fails with error E42";

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const textOf = (node) => node.textContent.replace(/\s+/g, " ");
const flush = async () => { for (let n = 0; n < 80; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
const trusted = async (node) => { const event = new Event("click"); Object.defineProperty(event, "isTrusted", { value: true }); node.dispatchEvent(event); await flush(); };
// Waits (real timers, kept from before the mock ones, at most two seconds) until the condition holds: a page awaits the network and the hash of a Message-ID, which no fixed number of turns of the event loop covers on a slower machine.
const realTimeout = globalThis.setTimeout;
const waitFor = async (condition) => { for (let n = 0; n < 200 && !condition(); n += 1) await new Promise((resolve) => realTimeout(resolve, 10)); };
const typed = async (node, value) => { node.value = value; node.dispatchEvent(new Event("input")); await flush(); };
const itemOf = (target, id) => descendants(target, (node) => node.getAttribute?.("data-mail") === id)[0];

// ---------------------------------------------------------------- the world

const REAL_FETCH = globalThis.fetch;
function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null, values };
}
const CONNECTION = { address: "reports@example.org", route: "imap", folders: ["INBOX"], places: [],
  imap: { bridge: "lab-pc", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" }, smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: "mail-password-963" } };

const sent = [];                                  // every request to GitHub: { method, path, body }
let github, bridgeAnswer;
afterEach(() => { mock.timers.reset(); globalThis.fetch = REAL_FETCH; document.body.replaceChildren(); });

/** A mail as the Bridge returns it; its identifier is the hash of its Message-ID, as MOD-mail-records names it. */
async function mailOf(key, over = {}) {
  const messageId = `<${key}@mail.example.invalid>`;
  return { id: await mailId({ messageId, bytes: null }), messageId, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.org" }], cc: [],
    subject: `Subject ${key}`, date: "2026-10-18T08:00:00Z", text: `Hello,\n${SECRET_SENTENCE}.\nKind regards\nErika Mustermann`, attachments: [], folder: "INBOX", ...over };
}

/** The world: the store, the Bridge's answer to read, and GitHub's issues of alice/product (`issues`: { number, title, body, state, comments: [{ body }] }). */
function world({ mails, issues = [], bridge = null, refuse = null, marked = null }) {
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  Object.defineProperty(globalThis, "location", { value: { hostname: "alice.github.io", pathname: "/agent-m/", origin: "https://alice.github.io", href: "https://alice.github.io/agent-m/" }, configurable: true, writable: true });
  const store = openStore(INSTANCE);
  writeSetting(store, "mailbox", CONNECTION);
  writeSetting(store, "bridge:lab-pc", { address: BRIDGE_URL, token: "bridge-token-963" });
  writeSetting(store, "products", [PRODUCT_URL]);
  writeSetting(store, `github-token:${PRODUCT}`, { value: "github_pat_PRODUCT963", name: "alice/product token", expires: "2027-01-01" });
  if (marked) writeSetting(store, "not-an-issue", marked);
  sent.length = 0;
  github = { issues: issues.map((issue) => ({ state: "open", labels: [], comments: [], ...issue })), created: [] };
  bridgeAnswer = bridge ?? (() => new Response(JSON.stringify(mails), { status: 200, headers: { "Content-Type": "application/json" } }));
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    if (url.origin === BRIDGE_URL) return typeof bridgeAnswer === "function" ? bridgeAnswer(url, init) : bridgeAnswer;
    if (url.host !== "api.github.com") throw new Error(`no request leaves the fixtures: ${url.href}`);
    sent.push({ method, path: url.pathname, body: init.body ?? null });
    const base = `/repos/${PRODUCT}`;
    // An issue as GitHub's "List repository issues" and "Get an issue" answer it: its comments by their count.
    const issueJson = (issue) => ({ number: issue.number, title: issue.title, body: issue.body, state: issue.state, labels: issue.labels, comments: issue.comments.length, html_url: `${PRODUCT_URL}/issues/${issue.number}` });
    if (method === "GET" && url.pathname === `${base}/issues`) return json(github.issues.map(issueJson));
    const single = /^\/repos\/alice\/product\/issues\/(\d+)$/.exec(url.pathname);
    const found = single && github.issues.find((issue) => issue.number === Number(single[1]));
    if (method === "GET" && found) return json(issueJson(found));
    const comments = /^\/repos\/alice\/product\/issues\/(\d+)\/comments$/.exec(url.pathname);
    if (method === "GET" && comments) return json((github.issues.find((issue) => issue.number === Number(comments[1]))?.comments ?? []).map((comment) => ({ user: { login: "dev" }, body: comment.body, created_at: "2026-10-18T09:00:00Z" })));
    if (method === "POST" && comments) { github.issues.find((issue) => issue.number === Number(comments[1])).comments.push({ body: JSON.parse(init.body).body }); return json({ id: 1 }, 201); }
    if (method === "POST" && url.pathname === `${base}/issues`) {
      if (refuse) return json({ message: "Resource not accessible by personal access token" }, refuse);
      const given = JSON.parse(init.body);
      const number = 100 + github.created.length;
      const made = { number, title: given.title, body: given.body, labels: given.labels, state: "open", comments: [] };
      github.created.push(made);
      github.issues.push(made);
      return json({ number, title: made.title, body: made.body, labels: made.labels.map((name) => ({ name })), state: "open", html_url: `${PRODUCT_URL}/issues/${number}` }, 201);
    }
    return json({ message: "Not Found" }, 404);
  };
  return { store, storage };
}

const FIVE_MINUTES = 5 * 60 * 1000;
async function open(world_, goes = []) {
  const target = document.createElement("div");
  document.body.append(target);
  const context = { page: "main", instance: { repository: INSTANCE, host: null }, store: world_.store, product: null, go: (name, params) => goes.push([name, params]) };
  assert.ok(route(), `the route mail: ${pages.error?.message}`);
  mock.timers.enable({ apis: ["setTimeout"] });
  await route().render(target, context, {});
  await read(target, 1);
  return target;
}
const pageOf = (target) => byClass(target, "mail-page")[0];
const readings = (target) => Number(pageOf(target)?.getAttribute("data-readings") ?? 0);
// A reading is over when the page counts it.
const read = (target, count) => waitFor(() => readings(target) >= count);
// The reading five minutes after the last one ended: the mock clock moved on by five minutes.
async function readAgain(target) {
  const before = readings(target);
  mock.timers.tick(FIVE_MINUTES);
  await read(target, before + 1);
  return target;
}
const lines = (target) => byClass(target, "mail-line");
const lineIds = (target) => lines(target).map((node) => node.getAttribute("data-line"));
const lineOf = (target, id) => lines(target).find((node) => node.getAttribute("data-line") === id);
const bold = (target) => lines(target).filter((node) => (node.className ?? "").split(" ").includes("undecided")).map((node) => node.getAttribute("data-line"));
// The mail's line clicked (by a script: opening a mail writes nothing), and its details.
async function openMail(target, id) {
  const line = lineOf(target, id);
  assert.ok(line, `the line of ${id}`);
  byClass(line, "mail-open")[0].dispatchEvent(new Event("click"));
  await flush();
  return itemOf(target, id);
}
const writesToGitHub = () => sent.filter((request) => request.method !== "GET");

// ---------------------------------------------------------------- the tests

// TST-963001 · level: component · module: MOD-maintenance-pages
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL; READING THE MAILBOX CHANGES NOTHING IN IT; UC-038
// given: the mailbox holds a new mail (of 20 October), a mail an issue lists (19 October), a mail this browser marked (18 October), and a reply in the thread of the listed mail
// input: the route mail drawn, without any click
// expect: drawing reads the mailbox; the list holds one line per mail, the newest first — new, listed, marked — and the reply, which the reading attached, last; only the new mail is bold; its line names
//   sender, subject and date; the listed mail's line and the reply's link the address the frame writes for issue 4 of alice/product, the marked mail's says "not an issue"; the Bridge got one request, the read;
//   GitHub received one write, the note that lists the reply on #4
test("the mail page lists every mail as an inbox, the newest first, the undecided one bold and each decided one with its issue or its mark", async () => {
  const fresh = await mailOf("new", { date: "2026-10-20T08:00:00Z" }), listed = await mailOf("listed", { date: "2026-10-19T08:00:00Z" }), marked = await mailOf("marked", { date: "2026-10-18T08:00:00Z" });
  const reply = await mailOf("reply", { inReplyTo: listed.messageId, references: [listed.messageId], date: "2026-10-21T08:00:00Z" });
  const requests = [];
  const w = world({ mails: [marked, reply, listed, fresh], marked: [marked.id], issues: [{ number: 4, title: "Export fails", body: withMailIds("Export fails.", [listed.id]) }],
    bridge: (url, init) => { requests.push(`${init.method} ${url.pathname}`); return new Response(JSON.stringify([marked, reply, listed, fresh]), { status: 200, headers: { "Content-Type": "application/json" } }); } });
  const target = await open(w);
  assert.deepEqual(lineIds(target), [fresh.id, listed.id, marked.id, reply.id]);
  assert.deepEqual(bold(target), [fresh.id]);
  const line = textOf(lineOf(target, fresh.id));
  assert.ok(line.includes("Erika Mustermann") && line.includes("Subject new"), line);
  const issue4 = fragmentOf("issue", { number: "4", product: PRODUCT_URL });
  for (const id of [listed.id, reply.id]) assert.deepEqual(byClass(lineOf(target, id), "issue-link").map((link) => link.getAttribute("href")), [issue4], id);
  assert.match(textOf(byClass(lineOf(target, marked.id), "mail-decision")[0]), /not an issue/);
  assert.deepEqual(byClass(lineOf(target, fresh.id), "mail-decision"), [], "an undecided mail shows no decision");
  assert.deepEqual(requests, ["POST /v1/mail/read"]);
  assert.deepEqual(writesToGitHub().map((request) => `${request.method} ${request.path}`), ["POST /repos/alice/product/issues/4/comments"]);
  assert.equal(JSON.parse(writesToGitHub()[0].body).body, noteText("mail-added", reply.id, new Date().toISOString().slice(0, 10)));
});

// TST-2026110502 · level: component · module: MOD-maintenance-pages
// guards: UC-038; EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
// given: one new mail of 18 October 2026, 08:00 UTC
// input: the route mail drawn
// expect: the page draws no heading "Mail" and no button Read again, and names Read again nowhere; the line is a button (reached by the keyboard) carrying the frame's class btn; its date is a <time> whose
//   datetime is the mail's date and whose text is the day and the month's name, not the ISO text; counter-proof: the ISO text is in the datetime, so a page that wrote it raw would show it
test("the mail page has no heading Mail and no Read again, and each line is a button with the date written as a mail program writes it", async () => {
  const mail = await mailOf("look");
  const target = await open(world({ mails: [mail] }));
  assert.equal(byTag(target, "h2").some((node) => textOf(node).trim() === "Mail"), false, "no heading Mail");
  assert.deepEqual(byClass(target, "read-again"), []);
  assert.equal(textOf(target).includes("Read again"), false, "Read again is named nowhere");
  const button = byClass(lineOf(target, mail.id), "mail-open")[0];
  assert.equal(button.localName, "button");
  assert.ok((button.className ?? "").split(" ").includes("btn"));
  const time = byClass(button, "mail-date")[0];
  assert.equal(time.localName, "time");
  assert.equal(time.getAttribute("datetime"), "2026-10-18T08:00:00Z", "counter-proof: the raw date is there to be shown");
  assert.equal(textOf(time).includes("2026-10-18T"), false, textOf(time));
  assert.match(textOf(time), /18 Oct|\d\d:\d\d/, textOf(time));
});

// TST-2026110503 · level: component · module: MOD-maintenance-pages
// guards: UC-038; ONE CLICK PER DECISION; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: a new mail and a mail an issue (#4) lists
// input: before any click; the new mail's line clicked; the decided mail's line clicked; Back to the list
// expect: before a click no mail's details are shown; the new mail's details hold the mail in full, its review and the three decisions, and its line is the current one; the decided mail's details hold the mail
//   in full and its issue #4, and no Create issue, Add to #n or Not an issue (counter-proof of the first); Back to the list closes the details
test("a clicked line shows the mail's details and what to do with it, and a decided mail its decision without actions", async () => {
  const fresh = await mailOf("fresh", { date: "2026-10-20T08:00:00Z" }), listed = await mailOf("old");
  const target = await open(world({ mails: [fresh, listed], issues: [{ number: 4, title: "Export fails", body: withMailIds("Export fails.", [listed.id]) }] }));
  assert.deepEqual(byClass(target, "mail"), [], "no details before a click");
  const details = await openMail(target, fresh.id);
  assert.ok(details, "the details of the new mail");
  assert.match(textOf(byClass(details, "mail-text")[0]), new RegExp(SECRET_SENTENCE));
  for (const name of ["mail-title", "mail-body", "create-issue", "add-to-issue", "not-an-issue"]) assert.equal(byClass(details, name).length, 1, name);
  assert.equal(lineOf(target, fresh.id).getAttribute("aria-current"), "true");
  assert.ok((byClass(target, "mail-inbox")[0].className ?? "").split(" ").includes("mail-open-shown"));
  const decided = await openMail(target, listed.id);
  assert.match(textOf(byClass(decided, "mail-text")[0]), new RegExp(SECRET_SENTENCE));
  assert.match(textOf(byClass(decided, "mail-decided-as")[0]), /#4/);
  assert.deepEqual(byClass(decided, "issue-link").map((link) => link.getAttribute("href")), [fragmentOf("issue", { number: "4", product: PRODUCT_URL })]);
  for (const name of ["create-issue", "add-to-issue", "not-an-issue", "mail-title"]) assert.equal(byClass(decided, name).length, 0, `no ${name}`);
  assert.equal(itemOf(target, fresh.id), undefined, "one mail's details at a time");
  byClass(target, "mail-back")[0].dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(byClass(target, "mail"), [], "the way back closes the details");
  assert.equal((byClass(target, "mail-inbox")[0].className ?? "").split(" ").includes("mail-open-shown"), false);
});

// TST-963002 · level: component · module: MOD-maintenance-pages
// guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; THE PRODUCT ISSUE CARRIES NO PERSONAL DATA; ONE CLICK PER DECISION; UC-038
// given: one new mail from Erika Mustermann, opened from the list; the proposal is empty (4b)
// input: the title and the text typed with the sender's name in it; the title and the text edited without the name; a click a script makes on Create issue; the kind change chosen; the person's click on Create issue
// expect: with the name the hit is listed in .mail-hits and Create issue is disabled; without it no hit and Create issue is enabled; the script's click writes nothing; the person's click creates exactly one issue, labelled change, whose text ends with the mail's identifier in a Mails line and holds none of the mail's text, sender or address; the page names issue #100, and, the kind being change, links the address the frame writes for issue 100 of alice/product;
//   the mail's line leaves bold and links issue 100
test("Create issue is disabled while the text names the mail's people, and one click then creates one issue with the label and the Mails line", async () => {
  const mail = await mailOf("one");
  const w = world({ mails: [mail] });
  const target = await open(w);
  const item = await openMail(target, mail.id);
  const create = byClass(item, "create-issue")[0];
  assert.equal(create.disabled, true, "disabled while empty");
  await typed(byClass(item, "mail-title")[0], "Export fails for Erika");
  await typed(byClass(item, "mail-body")[0], "Erika Mustermann reports an export failure in version 1.4.");
  assert.ok(byClass(item, "mail-hit").length >= 1, "the hit is marked");
  assert.equal(create.disabled, true);
  await typed(byClass(item, "mail-title")[0], "PDF export fails with error E42");
  await typed(byClass(item, "mail-body")[0], "Exporting a thesis as PDF fails with error E42 in version 1.4. A PDF file was expected.");
  assert.equal(byClass(item, "mail-hit").length, 0);
  assert.equal(create.disabled, false);
  create.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(writesToGitHub(), []);
  const kind = byClass(item, "mail-kind")[0];
  kind.value = "change";
  kind.dispatchEvent(new Event("change"));
  assert.deepEqual(bold(target), [mail.id], "known positive: bold before the decision");
  await trusted(create);
  await waitFor(() => github.created.length > 0 && byClass(item, "mail-result")[0].textContent !== "");
  assert.equal(github.created.length, 1);
  const made = github.created[0];
  assert.deepEqual(made.labels, ["change"]);
  assert.ok(made.body.endsWith(`Mails: \`${mail.id}\``) || made.body.includes(mail.id), made.body);
  assert.equal(made.body.includes(SECRET_SENTENCE) || made.body.includes("Erika") || made.body.includes(ERIKA.address), false, "none of the mail's text, name or address");
  assert.match(textOf(byClass(item, "mail-result")[0]), /#100/);
  assert.deepEqual(byClass(item, "issue-link").map((link) => link.getAttribute("href")), [fragmentOf("issue", { number: "100", product: PRODUCT_URL })]);
  assert.deepEqual(bold(target), [], "the decided mail leaves bold");
  assert.deepEqual(byClass(lineOf(target, mail.id), "issue-link").map((link) => link.getAttribute("href")), [fragmentOf("issue", { number: "100", product: PRODUCT_URL })]);
});

// TST-963003 · level: component · module: MOD-maintenance-pages
// guards: A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; ONE CLICK PER DECISION; UC-038
// given: one new mail and an open issue #4
// input: the mail opened, the number 4 typed; the person's click on Add to #4; the reading five minutes later
// expect: exactly one comment is written to #4, the note `mail-added` naming the mail's identifier; the result names #4; the second reading lists the mail, not bold, with its issue #4, and its details show #4 and no decision
test("Add to #n lists the mail on the existing issue with one click, and the next reading shows it decided", async () => {
  const mail = await mailOf("two");
  const w = world({ mails: [mail], issues: [{ number: 4, title: "Export fails", body: "Export fails." }] });
  const target = await open(w);
  const item = await openMail(target, mail.id);
  await typed(byClass(item, "mail-issue-number")[0], "4");
  const add = byClass(item, "add-to-issue")[0];
  assert.match(textOf(add), /Add to #4/);
  await trusted(add);
  await waitFor(() => github.issues[0].comments.length > 0 && byClass(item, "mail-result")[0].textContent !== "");
  const comments = writesToGitHub().filter((request) => request.path.endsWith("/comments"));
  assert.equal(comments.length, 1);
  assert.equal(JSON.parse(comments[0].body).body, noteText("mail-added", mail.id, new Date().toISOString().slice(0, 10)));
  assert.match(textOf(byClass(item, "mail-result")[0]), /#4/);
  await readAgain(target);
  assert.deepEqual(lineIds(target), [mail.id]);
  assert.deepEqual(bold(target), []);
  assert.match(textOf(byClass(lineOf(target, mail.id), "mail-decision")[0]), /#4/);
  const shown = itemOf(target, mail.id);
  assert.match(textOf(byClass(shown, "mail-decided-as")[0]), /#4/);
  assert.equal(byClass(shown, "add-to-issue").length, 0);
});

// TST-963004 · level: component · module: MOD-maintenance-pages
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; MAIL STAYS IN THE MAILBOX; ONE CLICK PER DECISION; UC-038
// given: two new mails
// input: the first opened; the person's click on Not an issue; the reading five minutes later
// expect: the first stays in the list at once, not bold, marked "not an issue", and its details show the mark and no decision; the store holds its identifier under not-an-issue and nothing else of the mail; nothing is
//   written to GitHub; the second reading keeps the first marked and the second bold
test("Not an issue takes one click, marks the mail in this browser and writes nothing to the tracker", async () => {
  const [one, two] = [await mailOf("a"), await mailOf("b")];
  const w = world({ mails: [one, two] });
  const target = await open(w);
  const item = await openMail(target, one.id);
  await trusted(byClass(item, "not-an-issue")[0]);
  await waitFor(() => bold(target).length === 1);
  assert.deepEqual(bold(target), [two.id]);
  assert.match(textOf(byClass(lineOf(target, one.id), "mail-decision")[0]), /not an issue/);
  const shown = itemOf(target, one.id);
  assert.match(textOf(byClass(shown, "mail-decided-as")[0]), /not an issue/i);
  assert.equal(byClass(shown, "not-an-issue").length, 0);
  assert.deepEqual(readSetting(w.store, "not-an-issue"), [one.id]);
  assert.deepEqual(writesToGitHub(), []);
  await readAgain(target);
  assert.deepEqual(bold(target), [two.id]);
  assert.match(textOf(byClass(lineOf(target, one.id), "mail-decision")[0]), /not an issue/);
  assert.equal(JSON.stringify([...w.storage.values.values()]).includes(SECRET_SENTENCE), false, "the browser keeps no text of a mail");
});

// TST-963005 · level: component · module: MOD-maintenance-pages
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-038
// given: one mail that mixes two concerns, opened
// input: Create issue for the first concern, then the title and text changed and Create issue for the second
// expect: two issues are created, each of the kind chosen, and both list the same identifier; the mail's review is still shown between and after
test("a mail that mixes two concerns gets one issue per concern, each listing the same identifier", async () => {
  const mail = await mailOf("mixed");
  const w = world({ mails: [mail] });
  const target = await open(w);
  const item = await openMail(target, mail.id);
  await typed(byClass(item, "mail-title")[0], "PDF export fails");
  await typed(byClass(item, "mail-body")[0], "Exporting as PDF fails with error E42.");
  await trusted(byClass(item, "create-issue")[0]);
  await waitFor(() => github.created.length === 1);
  await typed(byClass(item, "mail-title")[0], "The ribbon hides the toolbar");
  await typed(byClass(item, "mail-body")[0], "On a small screen the ribbon covers the toolbar.");
  await trusted(byClass(item, "create-issue")[0]);
  await waitFor(() => github.created.length === 2);
  assert.equal(github.created.length, 2);
  assert.deepEqual(github.created.map((made) => made.body.includes(mail.id)), [true, true]);
  assert.notEqual(github.created[0].title, github.created[1].title);
  assert.equal(byClass(itemOf(target, mail.id), "create-issue").length, 1, "the review stays");
});

// TST-963006 · level: component · module: MOD-maintenance-pages
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-038
// given: the Bridge the connection names does not answer (the request fails); and a Bridge that answers with BridgeUnavailable-like HTTP 401 (token refused)
// input: the route mail drawn, for each
// expect: no mail is listed; .mailbox-problem names the reason (the failure's own words) and does not name Read again; nothing is written to GitHub
test("an unreachable mailbox is named, nothing is listed and nothing is written", async () => {
  for (const bridge of [() => { throw new TypeError("connect ECONNREFUSED 127.0.0.1:4711"); }, () => new Response(JSON.stringify({ error: "token-refused", message: "The pairing token was refused." }), { status: 401, headers: { "Content-Type": "application/json" } })]) {
    const w = world({ mails: [], bridge });
    const target = await open(w);
    assert.deepEqual(lines(target), []);
    const problem = byClass(target, "mailbox-problem")[0];
    assert.ok(problem && textOf(problem).length > 20, "a reason is named");
    assert.equal(textOf(problem).includes("Read again"), false);
    assert.deepEqual(writesToGitHub(), []);
    document.body.replaceChildren();
    mock.timers.reset();
  }
});

// TST-963007 · level: component · module: MOD-maintenance-pages
// guards: A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; UC-038
// given: one new mail; GitHub refuses the creation of an issue with 403 (the token lacks the permission), and, in another run, with 401 (the token is refused)
// input: the mail opened; a neutral title and text; the person's click on Create issue
// expect: the result names the product alice/product and which of the two happened, with a link to the step that stores the token (#add-product); no issue exists
test("an issue that cannot be created names the token's refusal or the missing permission, links the token step and writes nothing", async () => {
  for (const [status, words] of [[403, /permission/i], [401, /refused|token/i]]) {
    const mail = await mailOf(`refused${status}`);
    const w = world({ mails: [mail], refuse: status });
    const target = await open(w);
    const item = await openMail(target, mail.id);
    await typed(byClass(item, "mail-title")[0], "PDF export fails");
    await typed(byClass(item, "mail-body")[0], "Exporting as PDF fails with error E42.");
    await trusted(byClass(item, "create-issue")[0]);
    await waitFor(() => byClass(item, "mail-result")[0].textContent !== "");
    const result = textOf(byClass(item, "mail-result")[0]);
    assert.ok(result.includes(PRODUCT) && words.test(result), result);
    assert.equal(byClass(item, "token-step").length, 1);
    assert.equal(github.created.length, 0);
    document.body.replaceChildren();
    mock.timers.reset();
  }
});

// TST-963008 · level: component · module: MOD-maintenance-pages
// guards: NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; MAIL STAYS IN THE MAILBOX; UC-038
// given: the whole flow of a mail: reading, a neutral issue created, a duplicate added, another marked
// input: every request GitHub received, and the store
// expect: no body of any request holds the mail's text, the sender's name or address, or the subject; the mailbox connection's password reaches the Bridge only (not GitHub)
test("no text, sender or address of a mail reaches a repository request", async () => {
  const [a, b, c] = [await mailOf("x1"), await mailOf("x2"), await mailOf("x3")];
  const w = world({ mails: [a, b, c], issues: [{ number: 4, title: "Export fails", body: "Export fails." }] });
  const target = await open(w);
  const item = await openMail(target, a.id);
  await typed(byClass(item, "mail-title")[0], "PDF export fails");
  await typed(byClass(item, "mail-body")[0], "Exporting as PDF fails with error E42.");
  await trusted(byClass(item, "create-issue")[0]);
  await waitFor(() => github.created.length === 1);
  const second = await openMail(target, b.id);
  await typed(byClass(second, "mail-issue-number")[0], "4");
  await trusted(byClass(second, "add-to-issue")[0]);
  await waitFor(() => github.issues[0].comments.length > 0);
  await trusted(byClass(await openMail(target, c.id), "not-an-issue")[0]);
  await waitFor(() => bold(target).length === 0);
  const bodies = sent.map((request) => String(request.body ?? "")).join("\n");
  assert.ok(bodies.includes(a.id), "known positive: the identifier is written");
  for (const forbidden of [SECRET_SENTENCE, "Erika", ERIKA.address, "Subject x1", "mail-password-963"]) assert.equal(bodies.includes(forbidden), false, forbidden);
});

// TST-963009 · level: component · module: MOD-maintenance-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-038
// given: the page after its reading, with one mail opened
// input: the folded explanations
// expect: the reading step, the list of mails, the review of a mail and the decisions each carry a folded <details class="explain">, and every <details> of the page is such an explanation
test("every step of the route carries its folded explanation", async () => {
  const mail = await mailOf("explained");
  const w = world({ mails: [mail] });
  const target = await open(w);
  assert.ok(byClass(byClass(target, "mail-step-read")[0] ?? target, "explain").length >= 1, "the reading step");
  await openMail(target, mail.id);
  for (const step of ["mail-step-list", "mail-step-review", "mail-step-decide"]) {
    const sections = byClass(target, step);
    assert.ok(sections.length >= 1, `${step} is drawn`);
    assert.ok(byClass(sections[0], "explain").length >= 1, `${step} has its explanation`);
  }
  assert.equal(byTag(target, "details").every((node) => (node.className ?? "").includes("explain")), true);
});

// TST-963010 · level: component · module: MOD-maintenance-pages
// guards: MAIL STAYS IN THE MAILBOX; NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY; UC-038
// given: the page after its reading, with one mail
// input: the route's subject for its parameters, and its paramsFor for a participant
// expect: the subject is of the kind converse, refuses propose-edit and hand-over, and its page holds the mail's MAIL- identifier and none of the mail's text, sender or subject
test("the route gives the prompt bar a subject that holds a mail's identifier and no text of it", async () => {
  const mail = await mailOf("subject");
  const w = world({ mails: [mail] });
  const target = await open(w);
  const subject = route().subject({}, { page: "main", instance: { repository: INSTANCE }, store: w.store, product: null });
  assert.ok(subject, "a subject");
  assert.equal(subject.kind, undefined, "a subject names no kind: the bar runs converse on every page");
  assert.deepEqual([...subject.refuses].sort(), ["hand-over", "propose-edit"]);
  const page = String(subject.paramsFor({ name: "any" }).page);
  assert.ok(page.includes(mail.id), "the identifier");
  for (const forbidden of [SECRET_SENTENCE, "Erika", ERIKA.address, "Subject subject"]) assert.equal(page.includes(forbidden), false, forbidden);
  assert.ok(target);
});

// TST-963011 · level: unit · module: MOD-maintenance-pages
// guards: UC-038
// given: the view of MOD-maintenance-pages
// input: its routes read
// expect: it holds the route mail, in the menu entry maintenance, titled Mail
test("the view holds the route mail under the menu entry maintenance", () => {
  assert.ok(pages.view, `the view: ${pages.error?.message}`);
  const mail = route();
  assert.ok(mail);
  assert.deepEqual([mail.entry, mail.title], ["maintenance", "Mail"]);
});

// TST-963012 · level: component · module: MOD-maintenance-pages
// guards: READING THE MAILBOX CHANGES NOTHING IN IT; UC-038
// given: one new mail; a Bridge that counts the reads it answers
// input: the route mail drawn, without any click; the clock moved on by five minutes less a millisecond; then by one millisecond more; then by five minutes more
// expect: drawing alone reads the mailbox once and lists the mail; before five minutes no second reading; at five minutes the second, and five minutes later the third, each listing the mail again
test("drawing the mail page reads the mailbox at once, and again every five minutes", async () => {
  const mail = await mailOf("drawn");
  const requests = [];
  const w = world({ mails: [mail], bridge: (url, init) => { requests.push(`${init.method} ${url.pathname}`); return new Response(JSON.stringify([mail]), { status: 200, headers: { "Content-Type": "application/json" } }); } });
  const target = await open(w);
  assert.deepEqual(requests, ["POST /v1/mail/read"], "drawing reads the mailbox, without a click");
  assert.ok(lineOf(target, mail.id), "the mail is listed");
  mock.timers.tick(FIVE_MINUTES - 1);
  await flush();
  assert.equal(requests.length, 1, "no reading before five minutes");
  mock.timers.tick(1);
  await read(target, 2);
  assert.equal(requests.length, 2, "the reading at five minutes");
  await readAgain(target);
  assert.equal(requests.length, 3, "and five minutes later");
  assert.ok(lineOf(target, mail.id), "the mail is listed again");
});

// TST-963013 · level: component · module: MOD-maintenance-pages
// guards: UC-038
// given: a Bridge whose answer to the second read waits until the test releases it
// input: the route mail drawn; the clock moved on by five minutes, which starts the second reading; while it runs, the clock moved on by fifteen minutes more; the answer released; five minutes more
// expect: while the second reading runs no third request is sent; once it has ended the next reading comes five minutes later: three requests in all
test("no reading starts while one runs", async () => {
  const mail = await mailOf("slow");
  const requests = [];
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  const w = world({ mails: [mail], bridge: async (url, init) => { requests.push(`${init.method} ${url.pathname}`); if (requests.length === 2) await held; return new Response(JSON.stringify([mail]), { status: 200, headers: { "Content-Type": "application/json" } }); } });
  const target = await open(w);
  mock.timers.tick(FIVE_MINUTES);
  await waitFor(() => requests.length === 2);
  assert.equal(requests.length, 2, "known positive: the second reading started");
  mock.timers.tick(3 * FIVE_MINUTES);
  await flush();
  assert.equal(requests.length, 2, "no reading while one runs");
  release();
  await read(target, 2);
  assert.equal(requests.length, 2);
  await readAgain(target);
  assert.equal(requests.length, 3);
});

// TST-2026110504 · level: component · module: MOD-maintenance-pages
// guards: UC-038
// given: one mail; the page drawn and read; then the frame draws another route into the same element
// input: the clock moved on by ten minutes
// expect: the page that is no longer shown reads the mailbox no more: one request in all; counter-proof (TST-963012): while it is shown it reads at five minutes
test("the readings stop once the page is no longer shown", async () => {
  const mail = await mailOf("left");
  const requests = [];
  const w = world({ mails: [mail], bridge: (url, init) => { requests.push(url.pathname); return new Response(JSON.stringify([mail]), { status: 200, headers: { "Content-Type": "application/json" } }); } });
  const target = await open(w);
  target.replaceChildren(document.createElement("p"));
  mock.timers.tick(2 * FIVE_MINUTES);
  await flush();
  assert.equal(requests.length, 1);
});

// TST-2026110505 · level: component · module: MOD-maintenance-pages
// guards: UC-038; A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: two new mails; the first opened and its title and text typed; then a third mail arrives and the second is listed by issue #4 meanwhile
// input: the reading five minutes later
// expect: the first mail is still open, with the title and the text typed; the new mail is listed first and bold; the second is no longer bold and shows #4; the first stays bold
test("a later reading keeps the open mail and its edited proposal, and shows what was decided meanwhile", async () => {
  const one = await mailOf("first", { date: "2026-10-18T08:00:00Z" }), two = await mailOf("second", { date: "2026-10-19T08:00:00Z" }), three = await mailOf("third", { date: "2026-10-20T08:00:00Z" });
  let inbox = [one, two];
  const w = world({ mails: [], bridge: () => new Response(JSON.stringify(inbox), { status: 200, headers: { "Content-Type": "application/json" } }) });
  const target = await open(w);
  const item = await openMail(target, one.id);
  await typed(byClass(item, "mail-title")[0], "PDF export fails");
  await typed(byClass(item, "mail-body")[0], "Exporting as PDF fails with error E42.");
  inbox = [one, two, three];
  github.issues.push({ number: 4, title: "Export fails", body: withMailIds("Export fails.", [two.id]), state: "open", labels: [], comments: [] });
  await readAgain(target);
  assert.deepEqual(lineIds(target), [three.id, two.id, one.id]);
  assert.deepEqual(bold(target), [three.id, one.id]);
  assert.match(textOf(byClass(lineOf(target, two.id), "mail-decision")[0]), /#4/);
  const still = itemOf(target, one.id);
  assert.ok(still, "the open mail stays open");
  assert.equal(byClass(still, "mail-title")[0].value, "PDF export fails");
  assert.equal(byClass(still, "mail-body")[0].value, "Exporting as PDF fails with error E42.");
  assert.equal(lineOf(target, one.id).getAttribute("aria-current"), "true");
});

// TST-2026110506 · level: unit · module: MOD-maintenance-pages
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-038
// given: the site's style sheet src/site-frame/look.css
// input: its rules for the mail page
// expect: a line of an undecided mail is bold (.mail-line.undecided, font-weight 700 or bold); outside a media query the way back (.mail-back) is hidden; in a media query of a narrow screen (max-width) the inbox
//   with a mail open hides the list (.mail-open-shown … .mail-step-list, display: none) and the way back is shown; counter-proof: the media query's rule is not outside it, so a wide screen keeps the list beside the details
test("the style sheet shows the details in place of the list, with a way back, on a narrow screen only, and the undecided mails bold", () => {
  const css = readFileSync(new URL("../src/site-frame/look.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(css, /\.mail-line\.undecided\s*\{[^}]*font-weight:\s*(700|bold)/);
  const media = [...css.matchAll(/@media\s*\(max-width:\s*\d+px\)\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g)].map((match) => match[1]).filter((block) => block.includes("mail-"));
  assert.equal(media.length, 1, "one narrow-screen block for the mail page");
  assert.match(media[0], /\.mail-open-shown[^{]*\.mail-step-list\s*\{[^}]*display:\s*none/);
  assert.match(media[0], /\.mail-back\s*\{[^}]*display:\s*(inline-block|inline-flex|block)/);
  const outside = css.replace(/@media\s*\(max-width:\s*\d+px\)\s*\{((?:[^{}]*\{[^}]*\})*)\s*\}/g, "");
  assert.match(outside, /\.mail-back\s*\{[^}]*display:\s*none/);
  assert.equal(/\.mail-open-shown[^{]*\.mail-step-list\s*\{[^}]*display:\s*none/.test(outside), false, "counter-proof: a wide screen keeps the list");
});

/** What the frame does with an address: the route and parameters routeOf reads, the product chosenProduct names (the fragment's `product`), and the route drawn with them. */
async function followed(w, href) {
  const { name, params: { product: _named, ...params } } = routeOf(href);
  const issue = pages.view?.routes.find((candidate) => candidate.name === name);
  assert.ok(issue, `the route ${name} for ${href}`);
  const target = document.createElement("div");
  document.body.append(target);
  const product = await chosenProduct({ store: w.store, fragment: href });
  await issue.render(target, { page: "main", instance: { repository: INSTANCE, host: null }, store: w.store, product, go: () => {} }, params);
  return target;
}

// TST-1166001 · level: component · module: MOD-maintenance-pages
// guards: UC-038
// given: the mailbox holds a reply in the thread of issue #4 of alice/product, which GitHub lists as "Export fails"
// input: the link under the reply (the issue of its thread) followed as the frame follows an address: routeOf, chosenProduct, the route drawn with what they give
// expect: the link on the reply's line is the address the frame writes (fragmentOf: `#issue/number=4/product=<address>`); followed, it draws the page of issue #4 of alice/product ("Issue #4: Export fails"); counter-proof: the old form `#issue/4`, followed the same way, draws no such page
test("the link to the issue of a mail's thread is the address the frame writes, and following it shows that issue's page", async () => {
  const listed = await mailOf("listed"), reply = await mailOf("reply", { inReplyTo: listed.messageId, references: [listed.messageId] });
  const w = world({ mails: [listed, reply], issues: [{ number: 4, title: "Export fails", body: withMailIds("Export fails.", [listed.id]) }] });
  const target = await open(w);
  const href = byClass(lineOf(target, reply.id), "issue-link")[0].getAttribute("href");
  assert.equal(href, fragmentOf("issue", { number: "4", product: PRODUCT_URL }));
  const page = await followed(w, href);
  await waitFor(() => /Issue #4/.test(textOf(page)) || byClass(page, "issue-problem").length > 0);
  assert.match(textOf(page), /Issue #4: Export fails/);
  const old = await followed(w, "#issue/4");
  await waitFor(() => byClass(old, "issue-problem").length > 0);
  assert.doesNotMatch(textOf(old), /Issue #4: Export fails/, "the old form shows no issue page");
});

// TST-1166002 · level: component · module: MOD-maintenance-pages
// guards: UC-038
// given: one new mail; GitHub creates the issue as #100
// input: the mail opened; a change issue created with the person's click; the link Propose SPEC change followed as the frame follows an address
// expect: the link is the address the frame writes (fragmentOf: `#issue/number=100/product=<address>`); followed, it draws the page of issue #100 of alice/product with the title the person typed; counter-proof: the old form `#issue/100` draws no such page
test("the link Propose SPEC change is the address the frame writes, and following it shows the created issue's page", async () => {
  const mail = await mailOf("one");
  const w = world({ mails: [mail] });
  const target = await open(w);
  const item = await openMail(target, mail.id);
  await typed(byClass(item, "mail-title")[0], "PDF export fails with error E42");
  await typed(byClass(item, "mail-body")[0], "Exporting a thesis as PDF fails with error E42 in version 1.4. A PDF file was expected.");
  const kind = byClass(item, "mail-kind")[0];
  kind.value = "change";
  kind.dispatchEvent(new Event("change"));
  await trusted(byClass(item, "create-issue")[0]);
  await waitFor(() => byClass(item, "issue-link").length > 0);
  const href = byClass(item, "issue-link")[0].getAttribute("href");
  assert.equal(href, fragmentOf("issue", { number: "100", product: PRODUCT_URL }));
  const page = await followed(w, href);
  await waitFor(() => /Issue #100/.test(textOf(page)) || byClass(page, "issue-problem").length > 0);
  assert.match(textOf(page), /Issue #100: PDF export fails with error E42/);
  const old = await followed(w, "#issue/100");
  await waitFor(() => byClass(old, "issue-problem").length > 0);
  assert.doesNotMatch(textOf(old), /Issue #100: PDF export fails/, "the old form shows no issue page");
});
