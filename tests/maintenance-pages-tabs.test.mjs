// Maintenance on two tabs, Mail first and Issues second — MOD-maintenance-pages as akmaier accepted it (docs/architecture/MOD-maintenance-pages.md, Parts and Interfaces): `tabs.mjs` "the strip of the
// entry's two tabs, which every route draws at its head: **Mail**, leading to `mail`, and **Issues**, leading to `issues`, the tab the route stands under marked as the current one; two links in the look's
// styles, with no style of its own"; `view` "its routes, in the order of the tabs, so that the entry opens on Mail … under **Mail**, `mail`, `replies` and `replies/<issue>`; under **Issues**, `issues` and
// `issue/<number>`"; the list "reads the product's open and closed issues … (`listIssues` with `state: "all"` and `comments: false`), each with its state"; "for an issue that lists mails, each of its mails
// named by its identifier (`listedMailIds`), as a link to `mail/<id>`"; on `mail`, "each mail that `repliesDue`, read with each reading, gives under `toAnswer` with `noted` false marked *to answer*, its
// details offering *Answer*, which opens `replies/<issue>` of its issue; and a link *Replies* to `replies`. With `<id>`, a `MAIL-` identifier, the mail of that identifier is opened — the one of the list, or
// else the one the mailbox's `find` gives, a mail older than 30 days among them — as a mail clicked; one the mailbox does not hold is shown as *not found in the mailbox*". UC-046 step 2, UC-012 step 2,
// UC-038 steps 1, 4, 7 and 7c, UC-039 step 1.
// Run: node --test --test-timeout=60000 tests/maintenance-pages-tabs.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: THE MENU FOLLOWS THE PROCESS; A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; CLOSING AN ISSUE PREPARES ITS REPLIES; AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-046; UC-012; UC-038; UC-039
// Level: component
//
// The world is tests/maintenance-pages-world.mjs: its Bridge lab-pc-4 reads `reading` and finds any mail of `mails` by its identifier, its fake GitHub holds the issues of alice/product; here a fetch over
// it answers the issues of the state asked for, as GitHub does. The pages and the modules they use are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - The strip is <nav class="maintenance-tabs"> as the first element the route draws into its target, with two <a> of the look's class `btn`: "Mail" (href #mail) and "Issues" (href #issues), each
//     followed by /product=<the product> where the page has one; the current tab carries `primary` and aria-current="page". A click on a tab goes, through the context's `go`, to its route.
//   - The list names each issue's state in <span class="issue-state">: open or closed. The issue page lists its mails in <ul class="issue-mails"> of <a class="mail-link"> named by the identifier, whose href
//     is #mail/id=<id>/product=<the product>; a click goes to the route mail with { id }.
//   - On `mail`, a line to answer carries <span class="mail-to-answer">to answer</span>; its details hold <button class="answer-mail"> Answer, whose click goes to replies with { issue, product }; the page
//     holds <a class="replies-link"> Replies, whose click goes to replies. A mail not in the list but found is shown as a mail clicked: its details with its text; a mail not found is <p class="mail-not-found">.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT, PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { byClass, flush, itemOf, mailOf, mailRead, one, openMail, pages, restoreWorld, routeNamed, textOf, trusted, waitFor, walk, world, issueRecord } from "./maintenance-pages-world.mjs";
import { heads } from "../src/maintenance-pages/routes.mjs";

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_TABS1PRODUCT0123456789abcdefghij";
const ENCODED = encodeURIComponent(PRODUCT_URL);

// The world with the product chosen, and a fetch that answers the issues of the state asked for; the states asked for are kept in `listed`.
function started(over) {
  const w = world(over);
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  const inner = globalThis.fetch;
  w.listed = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const response = await inner(input, init);
    if (String(init.method ?? "GET").toUpperCase() !== "GET" || url.host !== "api.github.com" || url.pathname !== `/repos/${PRODUCT}/issues`) return response;
    const state = url.searchParams.get("state");
    w.listed.push(state);
    const items = await response.json();
    return new Response(JSON.stringify(state === "all" ? items : items.filter((each) => each.state === state)), { status: 200, headers: { "content-type": "application/json" } });
  };
  return w;
}
const drawn = (w, name, params = {}) => {
  assert.ok(routeNamed(name), `the route ${name}: ${pages.error?.message}`);
  return draw(routeNamed(name), w.context, params);
};
const strip = (target) => target.children.find((child) => typeof child !== "string");
const tabsOf = (target) => walk(strip(target), (node) => node.localName === "a").map((node) => ({ text: textOf(node).trim(), href: node.getAttribute("href"), classes: node.className, current: node.getAttribute("aria-current") ?? null }));

// TST-20261112001 · level: component · module: MOD-maintenance-pages
// guards: THE MENU FOLLOWS THE PROCESS; UC-046
// given: the routes of the view as routes.mjs gives them, read for their heads
// input: the routes under the entry maintenance, in their order
// expect: Mail's routes first — mail, replies —, then Issues' issues; the first route under the entry, which the frame opens for #maintenance, is mail
test("TST-20261112001 the view's routes stand in the order of the tabs, so that the entry opens on Mail", () => {
  const names = pages.view.routes.map((route) => route.name);
  assert.deepEqual(names, ["mail", "replies", "issues", "issue"]);
  assert.equal(pages.view.routes.find((route) => route.entry === "maintenance").name, "mail");
  assert.deepEqual(Object.keys(heads), ["mail", "replies", "issues", "issue"]);
});

// TST-20261112002 · level: component · module: MOD-maintenance-pages
// guards: UC-046; UC-038; UC-039; UC-012
// given: known positive first — the route issues draws its heading; the product alice/product with the open issue 6 and the closed issue 4 listing a mail
// input: the routes mail, replies, replies/4, issues and issue/4 drawn
// expect: each draws the strip first: Mail (#mail/product=…) and Issues (#issues/product=…), both with class btn; under mail, replies and replies/4 Mail is current, under issues and issue/4 Issues is;
//         a script's click on the tab Issues of mail goes to issues, as does a person's
test("TST-20261112002 every route of Maintenance draws the tab strip at its head, its own tab marked current", async () => {
  const plain = await mailOf("plain");
  const w = started({ mails: [plain], reading: [plain], issues: [issueRecord(4, "closed", [plain]), issueRecord(6, "open", [])] });
  const known = await drawn(w, "issues");
  await waitFor(() => byClass(known, "issue").length > 0);
  assert.ok(walk(known, (node) => node.localName === "h2" && textOf(node) === "Issues").length, "known positive: the list's heading is drawn");
  const tab = (current) => ["Mail", "Issues"].map((text) => ({ text, href: `#${text.toLowerCase()}/product=${ENCODED}`, classes: text === current ? "btn primary" : "btn", current: text === current ? "page" : null }));
  const mail = await drawn(w, "mail");
  await mailRead(mail);
  for (const [target, current, name] of [[mail, "Mail", "mail"], [await drawn(w, "replies"), "Mail", "replies"], [await drawn(w, "replies", { issue: "4", product: PRODUCT_URL }), "Mail", "replies/4"],
    [known, "Issues", "issues"], [await drawn(w, "issue", { number: "4" }), "Issues", "issue/4"]]) {
    assert.equal(strip(target)?.className, "maintenance-tabs", `${name}: the strip is drawn first`);
    assert.deepEqual(tabsOf(target), tab(current), `${name}: its tabs`);
  }
  const issuesTab = walk(strip(mail), (node) => node.localName === "a")[1];
  issuesTab.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.context.went.at(-1), ["issues", {}]);
});

// TST-20261112003 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the product alice/product with the open issue 6 and the closed issue 4
// input: the route issues drawn
// expect: the issues are asked for in the state all; the list holds 4 and 6, each naming its state, closed and open
test("TST-20261112003 the list holds the product's open and closed issues, each with its state", async () => {
  const w = started({ mails: [], issues: [issueRecord(4, "closed", []), issueRecord(6, "open", [])] });
  const target = await drawn(w, "issues");
  await waitFor(() => byClass(target, "issue").length > 0 || byClass(target, "issues-empty").length > 0);
  assert.deepEqual(w.listed, ["all"]);
  assert.deepEqual(byClass(target, "issue").map((node) => [node.getAttribute("data-issue"), textOf(one(node, "issue-state"))]), [["4", "closed"], ["6", "open"]]);
});

// TST-20261112004 · level: component · module: MOD-maintenance-pages
// guards: AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS; UC-012
// given: the closed issue 4 listing the mails plain and other; counter-proof — the open issue 6 listing none
// input: the route issue/4, and issue/6; the link of plain clicked
// expect: issue 4 names both identifiers, each a link to #mail/id=<id>/product=<the product>, and the click goes to mail with { id }; issue 6 names no mail
test("TST-20261112004 an issue from mail names each of its mails as a link to that mail", async () => {
  const [plain, other] = [await mailOf("plain"), await mailOf("other")];
  const w = started({ mails: [plain, other], issues: [issueRecord(4, "closed", [plain, other]), issueRecord(6, "open", [])] });
  const four = await drawn(w, "issue", { number: "4" });
  await waitFor(() => byClass(four, "mail-link").length > 0 || byClass(four, "issue-text").length > 0);
  const links = byClass(four, "mail-link");
  assert.deepEqual(links.map((node) => [textOf(node), node.getAttribute("href")]), [plain.id, other.id].map((id) => [id, `#mail/id=${encodeURIComponent(id)}/product=${ENCODED}`]));
  links[0].dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.context.went.at(-1), ["mail", { id: plain.id }]);
  const six = await drawn(w, "issue", { number: "6" });
  await waitFor(() => byClass(six, "issue-text").length > 0);
  assert.equal(byClass(six, "mail-link").length, 0, "counter-proof: an issue without mails names none");
});

// TST-20261112005 · level: component · module: MOD-maintenance-pages
// guards: CLOSING AN ISSUE PREPARES ITS REPLIES; UC-038; UC-039
// given: the closed issue 4 listing plain, without a reply note; the closed issue 7 listing answered, with one; the open issue 6 listing open; all three mails in the reading
// input: the route mail drawn and read; plain and answered opened; Answer and Replies clicked
// expect: only plain's line is marked to answer; its details offer Answer, which goes to replies with issue 4 of the product; answered's details offer none; the link Replies goes to replies
test("TST-20261112005 a decided mail of a closed issue without a reply note is marked to answer, and Answer opens that issue's replies", async () => {
  const [plain, answered, open] = [await mailOf("plain"), await mailOf("answered"), await mailOf("open")];
  const date = new Date().toISOString().slice(0, 10);
  const { noteText } = await import("../src/mail-records/index.mjs");
  const w = world({ mails: [plain, answered, open], reading: [plain, answered, open],
    issues: [issueRecord(4, "closed", [plain]), issueRecord(7, "closed", [answered], { comments: [noteText("reply-sent", answered.id, date)] }), issueRecord(6, "open", [open])] });
  const target = await drawn(w, "mail");
  await mailRead(target);
  const marked = walk(target, (node) => node.getAttribute?.("data-line")).filter((line) => byClass(line, "mail-to-answer").length).map((line) => line.getAttribute("data-line"));
  assert.deepEqual(marked, [plain.id]);
  assert.equal(textOf(byClass(target, "mail-to-answer")[0]), "to answer");
  openMail(target, answered.id);
  assert.equal(byClass(one(target, "mail-details"), "answer-mail").length, 0, "counter-proof: a mail with a reply note offers no Answer");
  openMail(target, plain.id);
  const answer = one(one(target, "mail-details"), "answer-mail");
  assert.equal(textOf(answer), "Answer");
  answer.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.context.went.at(-1), ["replies", { issue: "4", product: PRODUCT_URL }]);
  const replies = one(target, "replies-link");
  assert.equal(textOf(replies), "Replies");
  replies.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.context.went.at(-1), ["replies", {}]);
});

// TST-20261112006 · level: component · module: MOD-maintenance-pages
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; UC-038
// given: the mailbox's reading holds recent, which the closed issue 4 lists; it also holds old, older than 30 days, which the reading does not give but find does; MAIL-0000000000000000 it does not hold
// input: the route mail with id recent, with id old, and with id MAIL-0000000000000000
// expect: recent is opened from the list — its line current and its details shown; old is opened as a mail clicked, its text shown and the mailbox asked for it by find; the third says not found in the mailbox
test("TST-20261112006 mail/<id> opens the mail of the list, else the one the mailbox finds, and names one it does not hold", async () => {
  const [recent, old] = [await mailOf("recent"), await mailOf("old", { date: "2026-07-01T08:00:00Z", text: "An old report of a broken export." })];
  const w = world({ mails: [recent, old], reading: [recent], issues: [issueRecord(4, "closed", [recent, old])] });
  const first = await drawn(w, "mail", { id: recent.id });
  await mailRead(first);
  await waitFor(() => itemOf(one(first, "mail-details"), recent.id) !== undefined);
  assert.equal(walk(first, (node) => node.getAttribute?.("data-line") === recent.id)[0].getAttribute("aria-current"), "true");
  assert.ok(itemOf(one(first, "mail-details"), recent.id), "the mail of the list is opened");
  const second = await drawn(w, "mail", { id: old.id });
  await mailRead(second);
  await waitFor(() => itemOf(one(second, "mail-details"), old.id) !== undefined);
  assert.match(textOf(one(second, "mail-details")), /An old report of a broken export\./);
  assert.ok(w.kept.bridge.some((call) => call.operation === "find" && call.args.ids.includes(old.id)), "the mailbox is asked for it by find");
  const third = await drawn(w, "mail", { id: "MAIL-0000000000000000" });
  await mailRead(third);
  await waitFor(() => byClass(third, "mail-not-found").length > 0);
  assert.match(textOf(one(third, "mail-not-found")), /MAIL-0000000000000000: not found in the mailbox/);
});

// TST-2026111701 · level: component · module: MOD-maintenance-pages
// guards: A MAIL IS FOUND AGAIN BY ITS IDENTIFIER; CLOSING AN ISSUE PREPARES ITS REPLIES; UC-038
// given: the closed issue 4 lists three mails without a reply note: recent, which the reading holds; old, older than 30 days, which the reading does not hold but the mailbox does; and bare, which the reading holds without a Message-ID
// input: the route mail drawn and the mailbox read once
// expect: the mailbox is asked by one find for old and for bare and not for recent — recent is found in the reading by the hash of its Message-ID, bare has none to hash —; recent and bare are marked to answer as before; counter-proof: old's find is asked, so a page that asked for every listed mail would be seen asking for recent too
test("TST-2026111701 a reading finds the listed mails it holds in itself and asks the mailbox only for the others", async () => {
  const [recent, old, bare] = [await mailOf("recent"), await mailOf("old", { date: "2026-07-01T08:00:00Z" }), await mailOf("bare", { messageId: null })];
  const w = world({ mails: [recent, old, bare], reading: [recent, bare], issues: [issueRecord(4, "closed", [recent, old, bare])] });
  const target = await drawn(w, "mail");
  await mailRead(target);
  const finds = w.kept.bridge.filter((call) => call.operation === "find");
  assert.equal(finds.length, 1, "the rest is passed on in one find");
  const asked = finds.flatMap((call) => call.args.ids);
  assert.ok(asked.includes(old.id), "counter-proof: the mailbox is asked for the mail the reading does not hold");
  assert.ok(asked.includes(bare.id), "a mail without a Message-ID is not found by a hash of one, so the mailbox is asked for it as before");
  assert.equal(asked.includes(recent.id), false, "the mail the reading holds is not asked for again");
  const marked = walk(target, (node) => node.getAttribute?.("data-line")).filter((line) => byClass(line, "mail-to-answer").length).map((line) => line.getAttribute("data-line"));
  assert.deepEqual(marked.sort(), [recent.id, bare.id].sort());
});
