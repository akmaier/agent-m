// The routes `replies` and `replies/<issue>` of MOD-maintenance-pages, up to the drafts (ITM-966) — UC-039 steps 1 to 4 and 2b, 3a, 4a — as the accepted text of docs/architecture/MOD-maintenance-pages.md states it (:111-117, blob f21551157732):
// "`replies`, `replies/<issue>` — closed issues with mails to answer, answers received, open issues; an issue with what solved it and each listed mail found in the mailbox with its draft; *Draft replies* with its run panel, or a reply
// written without a participant; each draft complete — recipient, subject, body, attachments — and editable". Sending, asking a reporter and reopening are other items' (ITM-967, ITM-968): this page offers no Send.
// Run: node --test tests/maintenance-pages-replies.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: CLOSING AN ISSUE PREPARES ITS REPLIES; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE PAGE NAMES WHERE IT SENDS; THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; MAIL STAYS IN THE MAILBOX; UC-039
// Level: unit
//
// The browser, the repositories and the clock are those of tests/main-page-home-harness.mjs. The real MOD-mail-routes (the Bridge route), MOD-mail-handling, MOD-mail-records, MOD-participant-list, MOD-job-catalogue, MOD-job-runner, MOD-runtimes,
// MOD-repository-hosts, MOD-bridge-client and MOD-browser-store run as they are; only `fetch` is faked, over the harness's fake GitHub, by this file: the Bridge lab-pc-4 on the loopback answers the mail operations (drafts, sent, find,
// show-draft, store-draft, update-draft), keeping the drafts it is given; GitHub's REST API answers alice/product's issues; the model endpoint ep1 (the "fake runner") answers a chat completion with the texts given. Nothing leaves the process.
// Readings the texts leave open, which the tests state (the pull request names them):
//   - Reading changes nothing without a click: the page draws <button class="read-replies"> "Read replies"; the person's click calls repliesDue (which may note a reply found in Sent) and draws <section class="replies-group" data-group="to-answer"|
//     "answer-received"|"open"> with <li class="reply-issue" data-issue="<n>"> per issue (its number, product and a link <a class="issue-link"> to the route replies/<n>); the route with the parameters { issue, product } draws that issue
//     from the last reading (kept in memory only) or says to read first.
//   - The issue: <p class="reply-solved"> "Solved by: <closedBy|not known> · Release: <release|not known>"; per listed mail <li class="reply-mail" data-mail="<MAIL-id>"> with .reply-reporter, .reply-date, .reply-subject; a mail found with a draft shows
//     <div class="reply-draft"> (the draft as showDraft gives it: .draft-to, .draft-subject, <textarea class="draft-body"> editable, <ul class="draft-attachments"> with name and size) and <button class="save-draft"> "Save draft";
//     a mail with mail: null says <p class="reply-missing"> "not found in the mailbox"; a mail without a usable reply address says <p class="reply-not-sendable"> "not sendable"; a mail with a note says <p class="reply-noted">. No page offers Send.
//   - Drafting: <section class="reply-drafting"> lists <li class="reply-participant"> with <input type="radio" class="participant"> for the participants of the instance's register that can draft text AND whose processing place the mailbox allows
//     (the connection's `places`), the place named and, for an allowed place outside the EU, <span class="not-compliant">; <input class="person"> for the name; once a participant and a name are chosen, the run panel of MOD-site-frame (the kind
//     draft-replies, the recipe reply-inputs over the issue's mails that have no draft and can be answered) and its Run. A reply written without a participant: <button class="write-reply"> per mail without a draft, which stores an empty draft with the
//     original quoted below it and shows it.
//   - Run is the person's click (isTrusted); the job runs in this tab (the route tab), its start record naming the issue and not a mail; the texts the participant returns are stored as drafts through the mailbox, nothing is sent.
// The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { writeSetting } from "../src/browser-store/index.mjs";
import { mailId, noteText, withMailIds } from "../src/mail-records/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { mailStrategies } from "../src/mail-handling/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";
import { INSTANCE, PRODUCT, PRODUCT_URL, browser, byClass, draw, headOf, instanceFiles, network, smallProduct, timers } from "./main-page-home-harness.mjs";

const pages = await import("../src/maintenance-pages/index.mjs").catch((error) => ({ error }));
const route = () => pages.view?.routes.find((candidate) => candidate.name === "replies");
for (const [at, strategies] of [mailStrategies, routeStrategies].entries()) {
  try { registerStrategies(`tests/maintenance-pages-replies.test.mjs#${at}`, strategies); } catch { /* registered by the page's own view */ }
}

const BRIDGE = "http://127.0.0.1:4711";
const ERIKA = { name: "Erika Mustermann", address: "erika@example.invalid" };
const SECRET = "the export of my thesis fails with error E42";

let net;
afterEach(() => { net?.restore(); timers.restore(); document.body.replaceChildren(); });

const walk = (root, match) => { const found = []; (function visit(node) { for (const child of node.children ?? []) { if (typeof child === "string") continue; if (match(child)) found.push(child); visit(child); } })(root); return found; };
const one = (root, name) => byClass(root, name)[0];
const textOf = (node) => String(node.textContent).replace(/\s+/g, " ");
const flush = async () => { for (let n = 0; n < 80; n += 1) await new Promise((resolve) => setImmediate(resolve)); };
// The harness replaces setTimeout by a fake while a page is drawn, so the real one is kept from before: a page awaits the network, the hash of a Message-ID and a commit, which no number of turns of the event loop covers on a slower machine.
const realTimeout = globalThis.setTimeout;
const waitFor = async (condition) => { for (let n = 0; n < 500 && !condition(); n += 1) await new Promise((resolve) => realTimeout(resolve, 10)); await flush(); };
const trusted = async (node) => { const event = new Event("click"); Object.defineProperty(event, "isTrusted", { value: true }); node.dispatchEvent(event); await flush(); };
const buttonsOf = (root, text) => walk(root, (node) => node.localName === "button" && node.textContent === text);
const itemOf = (target, id) => walk(target, (node) => node.getAttribute?.("data-mail") === id)[0];

/** A mail as the Bridge returns it; its identifier is the hash of its Message-ID. */
async function mailOf(key, over = {}) {
  const messageId = `<${key}@mail.example.invalid>`;
  return { id: await mailId({ messageId, bytes: null }), messageId, inReplyTo: null, references: [], from: ERIKA, replyTo: [], to: [{ name: null, address: "reports@example.org" }], cc: [],
    subject: `Subject ${key}`, date: "2026-10-18T08:00:00Z", text: `Hello,\n${SECRET}.\nKind regards\nErika Mustermann`, attachments: [], folder: "INBOX", ...over };
}

const REGISTER = (rows) => ["# Participants of this instance", "", "**REGISTER**", "", "The participants of the test instance.", "",
  "| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |", "|---|---|---|---|---|---|---|---|", ...rows, ""].join("\n");
const LOCAL = "| local-llm | model endpoint | model-a | 200000 | — | draft text | this machine | endpoint ep1 |";
const CLOUD = "| cloud-llm | model endpoint | model-b | 200000 | — | draft text | a provider in the USA | endpoint ep2 |";
const NO_DRAFTER = "| checker | model endpoint | model-c | 200000 | — | read the repository | this machine | endpoint ep1 |";

const issueRecord = (number, state, mails, { comments = [], labels = [] } = {}) => ({ number, title: `Issue ${number}`, body: withMailIds(`Issue ${number}.`, mails.map((mail) => mail.id)), state, labels, comments });

/**
 * The world: the mails of the mailbox (`mails`, found by `find`), the drafts in Drafts (`drafts`: { ref, inReplyTo, mail }), GitHub's issues of alice/product, the participants' register and the places the mailbox allows.
 * Returns what the fakes kept: the operations the Bridge received, the requests GitHub received, the texts the endpoint returned.
 */
function world({ mails, drafts = [], issues, rows = [LOCAL, CLOUD, NO_DRAFTER], places = [{ place: "this machine", outsideEu: false }], texts = [] }) {
  const files = { ...instanceFiles(), "docs/participants.md": REGISTER(rows) };
  const productFiles = smallProduct();
  let pending = {};
  net = network({ [INSTANCE]: files, [PRODUCT]: productFiles }, { bridgeLists: null });
  net.install();
  const context = browser();
  // The small DOM of the harness lacks hasAttribute, which MOD-site-frame's run panel asks of its Run button.
  const prototype = Object.getPrototypeOf(document.createElement("div"));
  prototype.hasAttribute ??= function hasAttribute(name) { return this.getAttribute(name) !== null && this.getAttribute(name) !== undefined; };
  writeSetting(context.store, "mailbox", { address: "reports@example.org", route: "imap", folders: ["INBOX"], places,
    imap: { bridge: "lab-pc-4", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" }, smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: "mail-password-966" } });
  writeSetting(context.store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "model-a", key: "k1" });
  writeSetting(context.store, "endpoint:ep2", { url: "https://ep2.example.test/v1", kind: "openai-compatible", model: "model-b", key: "k2" });
  const kept = { bridge: [], github: [], endpoint: [], drafts: [...drafts], issues: issues.map((issue) => ({ ...issue })) };
  let nextUid = 100;
  let inner = globalThis.fetch;
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const wrapper = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const method = String(init.method ?? "GET").toUpperCase();
    if (url.origin === BRIDGE && url.pathname.startsWith("/v1/mail/")) {
      const operation = url.pathname.slice("/v1/mail/".length);
      const { args } = JSON.parse(init.body);
      kept.bridge.push({ operation, args });
      if (operation === "drafts") return json(kept.drafts);
      if (operation === "sent") return json([]);
      if (operation === "find") {
        const found = mails.find((each) => each.id === args.id);
        return found ? json(found) : json({ error: "not-found", message: `${args.id}: no such mail in INBOX` }, 404);
      }
      if (operation === "show-draft") {
        const draft = kept.drafts.find((each) => JSON.stringify(each.ref) === JSON.stringify(args.ref));
        if (!draft) return json({ error: "not-found", message: "no such draft" }, 404);
        return json({ ref: draft.ref, sha256: "a".repeat(64), from: { name: null, address: "reports@example.org" }, to: [draft.to ?? ERIKA], cc: [], subject: draft.subject ?? `Re: ${draft.mail.subject}`, body: draft.body ?? "Draft text.",
          attachments: draft.attachments ?? [] });
      }
      if (operation === "store-draft" || operation === "update-draft") {
        const ref = { route: "bridge", uid: nextUid += 1, uidValidity: 7 };
        const entry = { ref, inReplyTo: args.draft.replyTo.messageId, mail: args.draft.replyTo, to: args.draft.to, subject: args.draft.subject, body: args.draft.body };
        if (operation === "update-draft") kept.drafts = kept.drafts.filter((each) => JSON.stringify(each.ref) !== JSON.stringify(args.ref));
        kept.drafts.push(entry);
        return json(ref);
      }
      return json({ error: "not-found", message: `unknown operation ${operation}` }, 404);
    }
    if (url.host === "api.github.com" && url.pathname.startsWith(`/repos/${PRODUCT}/issues`)) {
      kept.github.push({ method, path: url.pathname, body: init.body ?? null });
      if (method === "GET" && url.pathname === `/repos/${PRODUCT}/issues`) return json(kept.issues.map((issue) => ({ number: issue.number, title: issue.title, body: issue.body, state: issue.state, labels: issue.labels, comments: issue.comments.length, html_url: `${PRODUCT_URL}/issues/${issue.number}` })));
      const comments = /^\/repos\/alice\/product\/issues\/(\d+)\/comments$/.exec(url.pathname);
      if (method === "GET" && comments) return json((kept.issues.find((issue) => issue.number === Number(comments[1]))?.comments ?? []).map((comment) => ({ user: { login: "dev" }, body: comment, created_at: "2026-10-18T09:00:00Z" })));
      if (method === "POST" && comments) { kept.issues.find((issue) => issue.number === Number(comments[1])).comments.push(JSON.parse(init.body).body); return json({ id: 1 }, 201); }
    }
    if (url.origin === "https://ep1.example.test" || url.origin === "https://ep2.example.test") {
      kept.endpoint.push({ origin: url.origin, body: JSON.parse(init.body) });
      return json({ choices: [{ message: { content: JSON.stringify({ draft: { replies: texts }, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } });
    }
    if (url.host === "api.github.com" && url.pathname === `/repos/${PRODUCT}/commits/${headOf(PRODUCT)}`) return inner(new URL(`https://api.github.com/repos/${PRODUCT}/commits/main`), init);
    if (url.host === "api.github.com" && url.pathname.startsWith(`/repos/${PRODUCT}/git/`) && !url.pathname.includes("/git/trees/")) {
      if (method !== "GET") kept.github.push({ method, path: url.pathname, body: init.body ?? null });
      if (method === "GET" && url.pathname.endsWith("/git/ref/heads/main")) return json({ object: { sha: headOf(PRODUCT) } });
      if (method === "GET" && url.pathname.includes("/git/commits/")) return json({ tree: { sha: "tree-1" } });
      if (method === "POST" && url.pathname.endsWith("/git/commits")) return json({ sha: "9".repeat(40) });
      if (method === "PATCH") { Object.assign(productFiles, pending); pending = {}; net.change(PRODUCT, { ...productFiles }); inner = globalThis.fetch; globalThis.fetch = wrapper; return json({}); }
    }
    if (url.host === "api.github.com" && method === "POST" && url.pathname === `/repos/${PRODUCT}/git/trees`) {
      kept.github.push({ method, path: url.pathname, body: init.body ?? null });
      for (const entry of JSON.parse(init.body).tree ?? []) if (typeof entry.content === "string") pending[entry.path] = entry.content;
      return json({ sha: "tree-2" });
    }
    return inner(input, init);
  };
  globalThis.fetch = wrapper;
  return { context, kept };
}

async function opened(w, params = {}) {
  assert.ok(route(), `the route replies: ${pages.error?.message}`);
  return draw(route(), w.context, params);
}
async function read(target) {
  await trusted(one(target, "read-replies"));
  await waitFor(() => byClass(target, "replies-group").length > 0 || byClass(target, "replies-problem").length > 0);
  return target;
}
const issuesIn = (target, group) => walk(walk(target, (node) => node.getAttribute?.("data-group") === group)[0] ?? target, (node) => (node.className ?? "").split(" ").includes("reply-issue")).map((node) => Number(node.getAttribute("data-issue")));

/** The standard fixture: the closed issue 4 listing four mails (one with a draft, one not in the mailbox, one without a reply address), an answer received (5), an open issue (6), and a closed issue fully answered (7). */
async function standard(over = {}) {
  const [plain, drafted, absent, nowhere, waiting, open, answered] = [await mailOf("plain"), await mailOf("drafted"), await mailOf("absent"), await mailOf("nowhere", { from: { name: null, address: "not-an-address" } }),
    await mailOf("waiting"), await mailOf("open"), await mailOf("answered")];
  const draft = { ref: { route: "bridge", uid: 1, uidValidity: 7 }, inReplyTo: drafted.messageId, mail: drafted, to: ERIKA, subject: "Re: Subject drafted", body: "We fixed the export in version 1.5.\n\n> Hello,\n> the original",
    attachments: [{ name: "log.txt", type: "text/plain", size: 4 }] };
  const date = new Date().toISOString().slice(0, 10);
  const issues = [
    issueRecord(4, "closed", [plain, drafted, absent, nowhere], { comments: ["Closed with pull request https://github.com/alice/product/pull/9."] }),
    issueRecord(5, "open", [waiting], { labels: ["waiting-for-reporter"], comments: [noteText("question-sent", waiting.id, date), noteText("mail-added", waiting.id, date)] }),
    issueRecord(6, "open", [open]),
    issueRecord(7, "closed", [answered], { comments: [noteText("reply-sent", answered.id, date)] }),
  ];
  return { mails: { plain, drafted, absent, nowhere, waiting, open, answered }, found: [plain, drafted, nowhere, waiting, open, answered], drafts: [draft], issues, ...over };
}
const start = async (extra = {}) => {
  const f = await standard();
  const w = world({ mails: f.found, drafts: f.drafts, issues: f.issues, ...extra });
  return { ...f, w, target: await opened(w) };
};

// TST-966001 · level: unit · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-039 (1)
// given: a closed issue listing four mails none of which has a note, an issue labelled waiting-for-reporter with a newer mail, an open issue, and a closed issue whose one mail has a reply note
// input: the route replies drawn; the person's click on Read replies
// expect: drawing reads and writes nothing; the groups are drawn: to answer holds issue 4 alone (the answered issue 7 is in none), answer received holds 5, open holds 6; each issue links to its route; GitHub received no write
test("the three groups are drawn, and a closed issue with an unnoted mail is under to answer", async () => {
  const { w, target } = await start();
  assert.deepEqual([w.kept.bridge, w.kept.github], [[], []], "drawing reads nothing");
  await read(target);
  assert.deepEqual([issuesIn(target, "to-answer"), issuesIn(target, "answer-received"), issuesIn(target, "open")], [[4], [5], [6]]);
  assert.deepEqual(walk(target, (node) => node.localName === "a" && (node.className ?? "").includes("issue-link")).slice(0, 1).map((link) => link.getAttribute("href")).map((href) => href.startsWith("#replies")), [true]);
  assert.deepEqual(w.kept.github.filter((request) => request.method !== "GET"), []);
});

// TST-966002 · level: unit · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS; A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; UC-039 (2, 2b, 4a)
// given: the closed issue 4 and its four mails: found without a draft, found with a draft, not in the mailbox, found with a sender that is no address
// input: the route replies/<4> drawn after the reading
// expect: the page shows what solved the issue (the pull request) and that the release is not known; each found mail with reporter, date and subject; the drafted mail shows its draft complete (recipient, subject, body in an editable field, the attachment
//         with its name and size); the mail not in the mailbox says "not found in the mailbox"; the mail without an address says "not sendable"; no button Send anywhere
test("the issue shows what solved it and each mail with its draft, a missing mail and a mail that cannot be sent", async () => {
  const { mails, w, target } = await start();
  await read(target);
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  const solved = textOf(one(detail, "reply-solved"));
  assert.ok(solved.includes("pull/9") && /Release: not known/.test(solved), solved);
  const plain = itemOf(detail, mails.plain.id);
  const line = textOf(plain);
  assert.ok(line.includes("Erika Mustermann") && line.includes("2026-10-18") && line.includes("Subject plain"), line);
  assert.equal(byClass(plain, "reply-draft").length, 0, "no draft yet");
  const drafted = itemOf(detail, mails.drafted.id);
  const draft = one(drafted, "reply-draft");
  assert.match(textOf(one(draft, "draft-to")), /erika@example\.invalid/);
  assert.match(textOf(one(draft, "draft-subject")), /Re: Subject drafted/);
  assert.match(String(one(draft, "draft-body").value ?? one(draft, "draft-body").textContent), /fixed the export in version 1\.5/);
  assert.match(textOf(one(draft, "draft-attachments")), /log\.txt.*4/);
  assert.match(textOf(one(itemOf(detail, mails.absent.id), "reply-missing")), /not found in the mailbox/);
  assert.equal(byClass(itemOf(detail, mails.absent.id), "draft-body").length, 0);
  assert.match(textOf(one(itemOf(detail, mails.nowhere.id), "reply-not-sendable")), /not sendable/);
  assert.deepEqual(buttonsOf(detail, "Send"), []);
});

// TST-966003 · level: unit · module: MOD-maintenance-pages
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-039 (4)
// given: the drafted mail of issue 4
// input: the text of the draft changed; a click a script makes on Save draft; the person's click on Save draft
// expect: the script's click saves nothing; the person's click calls the mailbox's update-draft once with the reference of the draft and the new body, the recipient and the subject unchanged, and the page shows the draft as stored (the new reference)
test("an edit of a draft is saved to the draft", async () => {
  const { mails, w, target } = await start();
  await read(target);
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  const draft = one(itemOf(detail, mails.drafted.id), "reply-draft");
  const body = one(draft, "draft-body");
  body.value = "Changed text of the reply.";
  body.dispatchEvent(new Event("input"));
  const save = one(draft, "save-draft");
  save.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.kept.bridge.filter((call) => call.operation === "update-draft"), []);
  await trusted(save);
  await waitFor(() => w.kept.bridge.some((call) => call.operation === "update-draft"));
  const updates = w.kept.bridge.filter((call) => call.operation === "update-draft");
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].args.ref, { route: "bridge", uid: 1, uidValidity: 7 });
  assert.equal(updates[0].args.draft.body, "Changed text of the reply.");
  assert.equal(updates[0].args.draft.subject, "Re: Subject drafted");
  assert.equal(updates[0].args.draft.to.address, ERIKA.address);
  assert.equal(updates[0].args.draft.replyTo.id, mails.drafted.id);
});

// TST-966004 · level: unit · module: MOD-maintenance-pages
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-039 (3a)
// given: the mail of issue 4 that has no draft
// input: the person's click on Write the reply myself
// expect: one draft is stored through the mailbox to that mail's reporter alone, subject Re: its subject, an empty reply above the original quoted line by line; the page then shows that draft, editable; nothing else is stored
test("a reply written without a participant opens an empty draft with the original quoted", async () => {
  const { mails, w, target } = await start();
  await read(target);
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  assert.deepEqual(w.kept.bridge.filter((call) => call.operation === "store-draft"), [], "known positive: nothing stored before the click");
  await trusted(one(itemOf(detail, mails.plain.id), "write-reply"));
  await waitFor(() => byClass(itemOf(detail, mails.plain.id), "reply-draft").length > 0);
  const stores = w.kept.bridge.filter((call) => call.operation === "store-draft");
  assert.equal(stores.length, 1);
  assert.equal(stores[0].args.draft.to.address, ERIKA.address);
  assert.equal(stores[0].args.draft.subject, "Re: Subject plain");
  assert.ok(stores[0].args.draft.body.includes(`> ${SECRET}.`) || stores[0].args.draft.body.includes(`> Hello,`), stores[0].args.draft.body);
  assert.ok(byClass(itemOf(detail, mails.plain.id), "reply-draft").length === 1);
});

// TST-966005 · level: unit · module: MOD-maintenance-pages
// guards: THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED; A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT; A ROLE NAMES THE CAPABILITIES IT NEEDS; UC-039 (3)
// given: a mailbox that allows the place "this machine"; a register with local-llm (draft text, this machine), cloud-llm (draft text, a provider in the USA) and checker (no draft text, this machine)
// input: the issue 4 drawn; and again with the mailbox also allowing the USA place, noted as outside the EU
// expect: first only local-llm is offered; then local-llm and cloud-llm, cloud-llm with the mark not compliant and its place named, local-llm without; checker is offered in neither
test("Draft replies offers only participants that can draft at a place the mailbox allows", async () => {
  const first = await start();
  await read(first.target);
  const detail = await opened(first.w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(detail, "reply-participant").length > 0);
  assert.deepEqual(byClass(detail, "participant").map((radio) => radio.value), ["local-llm"]);
  document.body.replaceChildren();
  net.restore();
  const second = await start({ places: [{ place: "this machine", outsideEu: false }, { place: "a provider in the USA", outsideEu: true, notCompliantNoted: true }] });
  await read(second.target);
  const both = await opened(second.w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(both, "reply-participant").length > 1);
  assert.deepEqual(byClass(both, "participant").map((radio) => radio.value).sort(), ["cloud-llm", "local-llm"]);
  const cloud = walk(both, (node) => node.getAttribute?.("data-participant") === "cloud-llm")[0];
  assert.match(textOf(cloud), /a provider in the USA/);
  assert.equal(byClass(cloud, "not-compliant").length, 1);
  assert.equal(byClass(walk(both, (node) => node.getAttribute?.("data-participant") === "local-llm")[0], "not-compliant").length, 0);
});

// TST-966006 · level: unit · module: MOD-maintenance-pages
// guards: THE PAGE NAMES WHERE IT SENDS; MAIL STAYS IN THE MAILBOX; UC-039 (3)
// given: local-llm chosen with a name; issue 4 with one mail with a draft, one without
// input: the choice of the participant
// expect: the run panel names the destination local-llm, where it processes data, and the parts it receives: the issue and the mail without a draft (by identifier), and not the mail that has a draft; Run is offered; nothing is sent or written yet
test("the run panel names the participant, its place and what it receives", async () => {
  const { mails, w, target } = await start();
  await read(target);
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(detail, "participant").length > 0);
  const radio = one(detail, "participant");
  radio.checked = true;
  one(detail, "person").value = "Reviewer Rae";
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(detail, "run-panel").length > 0);
  const panel = textOf(one(detail, "run-panel"));
  assert.ok(panel.includes("local-llm") && panel.includes("this machine"), panel);
  assert.ok(panel.includes(`mail ${mails.plain.id}`) && panel.includes("issue"), panel);
  assert.equal(panel.includes(`mail ${mails.drafted.id}`), false, "the mail that has a draft is not sent again");
  assert.equal(buttonsOf(one(detail, "run-panel"), "Run").length, 1);
  assert.deepEqual([w.kept.endpoint, w.kept.bridge.filter((call) => call.operation === "store-draft")], [[], []]);
});

// TST-966007 · level: unit · module: MOD-maintenance-pages
// guards: A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; MAIL STAYS IN THE MAILBOX; UC-039 (3, 4)
// given: the run panel of TST-966006 and a model endpoint (the fake runner) that returns one text for the mail without a draft
// input: the person's click on Run
// expect: the endpoint is asked once, at ep1; the text is stored as a draft through the mailbox, to that reporter alone, subject Re: its subject, the text above the original quoted; the page then shows that draft; the job's start record names the issue and no mail text or address;
//         nothing is sent to any other mail
test("Run drafts a reply with the participant and stores it as a draft, which the page then shows", async () => {
  const texts = [];
  const { mails, w, target } = await start({ texts });
  await read(target);
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(detail, "participant").length > 0);
  const radio = one(detail, "participant");
  radio.checked = true;
  one(detail, "person").value = "Reviewer Rae";
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(detail, "run-panel").length > 0);
  texts.push({ mail: mails.plain.id, text: "The export problem was fixed in version 1.5." });
  const run = buttonsOf(one(detail, "run-panel"), "Run")[0];
  run.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.kept.endpoint, [], "a click a script makes asks nothing");
  await trusted(run);
  await waitFor(() => w.kept.bridge.some((call) => call.operation === "store-draft") || byClass(detail, "reply-problem").length > 0);
  assert.equal(byClass(detail, "reply-problem").length, 0, textOf(one(detail, "reply-run-result") ?? detail));
  assert.equal(w.kept.endpoint.length, 1);
  await waitFor(() => byClass(detail, "reply-drafted").length > 0 || byClass(detail, "reply-problem").length > 0);
  assert.equal(byClass(detail, "reply-problem").length, 0, textOf(detail).slice(-300));
  assert.equal(byClass(detail, "reply-drafted").length, 1, "the page says the replies are stored as drafts");
  await waitFor(() => byClass(itemOf(detail, mails.plain.id), "reply-draft").length > 0);
  assert.equal(byClass(itemOf(detail, mails.plain.id), "reply-draft").length, 1, "the page then shows the stored draft");
  const stores = w.kept.bridge.filter((call) => call.operation === "store-draft");
  assert.equal(stores.length, 1);
  assert.equal(stores[0].args.draft.to.address, ERIKA.address);
  assert.equal(stores[0].args.draft.subject, "Re: Subject plain");
  assert.ok(stores[0].args.draft.body.startsWith("The export problem was fixed in version 1.5."));
  assert.ok(stores[0].args.draft.body.includes("> Hello,"));
  const records = w.kept.github.filter((request) => request.method === "POST" && request.path.includes("/git/"));
  assert.equal(records.map((request) => String(request.body ?? "")).some((body) => body.includes(SECRET) || body.includes(ERIKA.address)), false, "no mail text or address reaches the repository");
  assert.equal(w.kept.bridge.some((call) => /^(send|confirm-send)$/.test(call.operation)), false, "nothing is sent");
});

// TST-966008 · level: unit · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; READING THE MAILBOX CHANGES NOTHING IN IT; UC-039 (1)
// given: the Bridge does not answer
// input: the person's click on Read replies
// expect: no group is drawn; the page names why in .replies-problem; nothing is written to GitHub
test("a mailbox that cannot be reached is named and nothing is written", async () => {
  const f = await standard();
  const w = world({ mails: f.found, drafts: f.drafts, issues: f.issues });
  const inner = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    if (url.origin === BRIDGE) throw new TypeError("connect ECONNREFUSED 127.0.0.1:4711");
    return inner(input, init);
  };
  const target = await read(await opened(w));
  assert.equal(byClass(target, "replies-group").length, 0);
  assert.ok(textOf(one(target, "replies-problem")).length > 20);
  assert.deepEqual(w.kept.github.filter((request) => request.method !== "GET"), []);
});

// TST-966009 · level: unit · module: MOD-maintenance-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-039
// given: the page before and after the reading, and an issue
// input: the folded explanations
// expect: the reading, the groups, the issue and the drafting each carry a folded <details class="explain">
test("every step of the replies page carries its folded explanation", async () => {
  const { w, target } = await start();
  assert.ok(byClass(one(target, "replies-step-read") ?? target, "explain").length >= 1, "the reading step");
  await read(target);
  const groups = one(target, "replies-step-groups");
  assert.ok(groups && byClass(groups, "explain").length >= 1, "the groups");
  const detail = await opened(w, { issue: "4", product: PRODUCT_URL });
  await waitFor(() => byClass(detail, "reply-drafting").length > 0);
  assert.ok(byClass(one(detail, "replies-step-issue"), "explain").length >= 1, "the issue");
  assert.ok(byClass(one(detail, "reply-drafting"), "explain").length >= 1, "the drafting");
});

// TST-966010 · level: unit · module: MOD-maintenance-pages
// guards: UC-039
// given: the view of MOD-maintenance-pages
// input: its routes and strategies read
// expect: it holds the route replies in the menu entry maintenance, and hands the frame MOD-mail-handling's mailStrategies, which the kind draft-replies names
test("the view holds the route replies and hands the frame mailStrategies", () => {
  assert.ok(pages.view, `the view: ${pages.error?.message}`);
  assert.deepEqual([route()?.entry, route()?.title], ["maintenance", "Replies"]);
  assert.ok(pages.view.strategies.includes(mailStrategies));
});
