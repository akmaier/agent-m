// The live review page (docs/index.html, which loads src/site-frame/dashboard-app.mjs) opens Maintenance on its tab Mail and routes `mail/<id>`, as the texts akmaier accepted state them: UC-046 step 2
// "Maintenance holds two tabs, **Mail** first and **Issues** second, and opens on **Mail**"; MOD-maintenance-pages' Interfaces "under **Mail**, `mail`, `replies` and `replies/<issue>`; under **Issues**,
// `issues` and `issue/<number>`" and "With `<id>`, a `MAIL-` identifier, the mail of that identifier is opened"; UC-038 7c "The mail is opened from its issue's link". The menu and the views' table
// (src/site/menu.mjs, src/site/views.mjs), which MOD-site-frame took over, name which view the entry Maintenance opens and which views are built.
// Run: node --test --test-timeout=60000 tests/dashboard-maintenance-tabs.test.mjs
//
// Module: MOD-site-frame
// Guards: THE MENU FOLLOWS THE PROCESS; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-046; UC-038
// Level: component
//
// The page is the real app over tests/app-harness.mjs: the instance akmaier/agent-m, no product, and a mailbox on the IMAP route through the Bridge lab-pc-4, whose mail operations a handler here answers:
// `read` gives the mail recent, `find` finds recent and old by their identifier, Drafts and Sent are empty. Readings the texts leave open, which the tests state (the pull request names them):
//   - The entry Maintenance lists its views in the order of the tabs — mail, replies, issues —, so the first built one is mail; `issues` is a built-in view, drawn by MOD-maintenance-pages through the
//     app's route dispatch, with no file of its own.
//   - `mail/<id>` is written as the frame writes a route with a parameter: #mail/id=<id>. The harness's document writes an element's class, type, value and href, so the HTML is read for those.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DASHBOARD, builtViews } from "../src/site/views.mjs";
import { MENU, stageView } from "../src/site/menu.mjs";
import { mailId } from "../src/mail-records/index.mjs";
import { openDashboard, repoServer, setting } from "./app-harness.mjs";

const builtFiles = JSON.parse(readFileSync(new URL("../docs/assets/dashboard/built.json", import.meta.url), "utf8"));
const maintenance = MENU.find((entry) => entry.key === "maintenance");
const BRIDGE = "http://127.0.0.1:4711";

async function mailOf(key, over = {}) {
  const messageId = `<${key}@mail.example.invalid>`;
  return { id: await mailId({ messageId, bytes: null }), messageId, inReplyTo: null, references: [], from: { name: "Reporter", address: "reporter@example.invalid" }, replyTo: [],
    to: [{ name: null, address: "reports@example.org" }], cc: [], subject: `Subject ${key}`, date: "2026-11-10T08:00:00Z", text: `The text of ${key}.`, attachments: [], folder: "INBOX", ...over };
}

// The page opened at `hash`, with the mailbox through the Bridge lab-pc-4.
async function opened(hash) {
  const recent = await mailOf("recent");
  const old = await mailOf("old", { date: "2026-07-01T08:00:00Z" });
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const bridge = (url, init) => {
    if (url.origin !== BRIDGE || !url.pathname.startsWith("/v1/mail/")) return null;
    const operation = url.pathname.slice("/v1/mail/".length);
    const { args } = JSON.parse(init.body);
    if (operation === "read") return json([recent]);
    if (operation === "drafts" || operation === "sent") return json([]);
    if (operation === "find") { const found = [recent, old].find((each) => each.id === args.id); return found ? json(found) : json({ error: "not-found", message: "no such mail" }, 404); }
    return json({ error: "not-found", message: `unknown operation ${operation}` }, 404);
  };
  const server = await repoServer({ files: { "SPEC.md": "# SPEC\n" }, handlers: [bridge] });
  const entries = { ...setting("bridge:lab-pc-4", { address: BRIDGE, token: "pairing-token-four" }),
    ...setting("mailbox", { address: "reports@example.org", route: "imap", folders: ["INBOX"], places: [{ place: "this machine", outsideEu: false }],
      imap: { bridge: "lab-pc-4", jumpHostNoted: false, imap: { host: "imap.example.org", port: 993, security: "tls" }, smtp: { host: "smtp.example.org", port: 587, security: "starttls" }, account: "reports@example.org", password: "mail-password" } }) };
  return { page: await openDashboard({ server, hash, entries }), recent, old };
}

// TST-20261112101 · level: unit · module: MOD-site-frame
// guards: THE MENU FOLLOWS THE PROCESS; UC-046
// given: the table of the dashboard's views, the list built.json and the menu
// input: the entry Maintenance's views, the view issues in the table, builtViews(built.json)
// expect: the entry lists mail, replies and issues in this order; issues is a built-in view without a file, and counts as built; the entry opens mail all the same
test("TST-20261112101 the entry Maintenance lists Mail's views before Issues', issues is built in, and the entry opens mail", () => {
  assert.deepEqual(maintenance.views, ["mail", "replies", "issues"]);
  const issues = DASHBOARD.find((entry) => entry.view === "issues");
  assert.equal(issues.builtIn, true);
  assert.equal(issues.file, undefined);
  const built = builtViews(builtFiles);
  assert.ok(built.has("issues"));
  assert.equal(stageView(maintenance, built), "mail");
});

// TST-20261112102 · level: component · module: MOD-site-frame
// guards: UC-046; UC-038
// given: the live page with the mailbox through lab-pc-4
// input: the page opened at #maintenance
// expect: <main> shows the mail page with the tab strip at its head, Mail the current tab; the menu's Maintenance links #mail
test("TST-20261112102 #maintenance opens the tab Mail", async () => {
  const { page } = await opened("#maintenance");
  assert.match(page.el("tabs"), /<a href="#mail" id="tab-mail" data-entry="maintenance"/);
  assert.match(page.main(), /class="mail-page"/);
  assert.match(page.main(), /<nav class="maintenance-tabs"><a class="btn primary" href="#mail">Mail<\/a><a class="btn" href="#issues">Issues<\/a><\/nav>/);
});

// TST-20261112103 · level: component · module: MOD-site-frame
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-038
// given: the live page with the mailbox through lab-pc-4, whose reading holds recent and whose find also gives old
// input: the page opened at #mail/id=<recent>, then at #mail/id=<old>
// expect: each time <main> shows the details of that mail with its text
test("TST-20261112103 #mail/id=<id> opens that mail, from the list or found by its identifier", async () => {
  const { page, recent, old } = await opened("#mail");
  await page.go(`#mail/id=${recent.id}`);
  assert.match(page.main(), /<section class="mail-details">.*<pre class="mail-text">The text of recent\.<\/pre>/s);
  await page.go(`#mail/id=${old.id}`);
  assert.match(page.main(), /<section class="mail-details">.*<pre class="mail-text">The text of old\.<\/pre>/s);
});
