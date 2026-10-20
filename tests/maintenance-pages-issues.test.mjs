// A product's issues are analysed, and the class is confirmed, corrected or the issue rejected in one click (ITM-582) — MOD-maintenance-pages' routes `issues` and `issue/<number>` over MOD-issue-handling's confirmClass and recipe issue-context, as the accepted text of docs/architecture/MOD-maintenance-pages.md states them (:117-120): "`issues`, `issue/<number>` — the product's issues; *Analyse* with its run panel and the class proposed with its reasoning; the class confirmed or corrected, or the issue rejected with a reason, with `confirmClass`". UC-012 steps 2 to 4, 3a and 4a.
// Run: node --test tests/maintenance-pages-issues.test.mjs
//
// Module: MOD-maintenance-pages; MOD-issue-handling; MOD-job-runner
// Guards: THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// Level: component
//
// The world is tests/maintenance-pages-world.mjs (its model endpoint ep1 is the participant local-llm, its fake GitHub holds the issues of alice/product); here a fetch over it answers the issues of the state asked for. The page, MOD-issue-handling, MOD-job-runner, MOD-runtimes and
// MOD-repository-hosts are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - The product is the one the frame has chosen (`context.product`); without one the page says so and reads nothing. Route names: `issues` (in the menu entry maintenance) and `issue` (out of the menu), whose parameter `number` is the issue's number: the address is `#issue/number=<n>`.
//   - `issues` lists the open issues: <ul class="issue-list"> of <li class="issue" data-issue="<n>"> with <a class="issue-link"> (href `#issue/number=<n>/product=<the product, percent-encoded>`; its click, by a person, goes to the route `issue` with `number`), the title, and <span class="issue-class"> — the class its label says:
//     defect, change or not-reproducible, else "not classified".
//   - `issue` shows <h2> with the number and title, <pre class="issue-text"> with the issue's text, <span class="issue-class">, and, for an open issue, <section class="issue-analysis"> and <section class="issue-decision">. A closed issue shows its text and its class only.
//   - The analysis: <input class="participant"> (radio) for each participant of the instance's register that declares draft text, with its place; <input class="person">; once a participant and a name are given, the run panel of the kind analyse-issue over this issue; Run (the person's click) runs the job in this tab and its start
//     record is committed to the product. The proposal is <section class="issue-proposal"> with <p class="proposed-class"> (the class), <p class="proposed-reasoning"> and <li class="proposed-wrong"> for each file named. Nothing is written to the issue by the analysis.
//   - The decision: <button class="set-class" data-class="bug|change|not-reproducible"> — labelled "Bug", "Change", "Not reproducible" before a proposal, "Confirm <class>" for the class proposed and "Correct to <class>" for another after it —, <input class="reject-reason"> and <button class="reject"> "Reject issue",
//     disabled while the reason is blank. A click is a person's (`isTrusted`) or does nothing. After a class click the page shows <p class="issue-classified" data-class data-how="confirmed|corrected|set">; after a rejection <p class="issue-rejected"> with the reason; a failure is <p class="issue-problem">, nothing is half done, and the controls stay.
// The counter-proofs are recorded in the pull request.

import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT, PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { buttonsOf, byClass, flush, one, restoreWorld, textOf, trusted, waitFor, world, routeNamed, pages } from "./maintenance-pages-world.mjs";

const handling = await import("../src/issue-handling/index.mjs").catch((error) => ({ error }));
if (handling.issueStrategies) {
  try { registerStrategies("tests/maintenance-pages-issues.test.mjs", handling.issueStrategies); } catch { /* registered by the page's own view */ }
}

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_HOME827PRODUCT0123456789abcdefg";
const ISSUE_TEXT = "The export of FIRST RULE is cut off after the second page.";
const PROPOSAL = { class: "change", reasoning: "The SPEC says nothing about page size: a requirement is missing.", wrong: ["src/export/index.mjs", "tests/export.test.mjs"] };
const issueRecord = (number, state, labels = [], title = `Issue ${number}`) => ({ number, title, body: number === 5 ? ISSUE_TEXT : `Text of issue ${number}.`, state, labels, comments: [] });
const ISSUES = [issueRecord(5, "open", [], "Export is cut off"), issueRecord(6, "open", ["defect"]), issueRecord(7, "open", ["change"]), issueRecord(8, "open", ["not-reproducible"]), issueRecord(9, "closed", ["defect"])];

/** The world with the product chosen, and a fetch that answers the issues of the state asked for, as GitHub does; the requests for the issues are kept in `listed`. */
function start({ issues = ISSUES, ...over } = {}) {
  const w = world({ mails: [], issues, answer: () => ({ draft: PROPOSAL, answers: [] }), ...over });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  const inner = globalThis.fetch;
  w.listed = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const response = await inner(input, init);
    if (String(init.method ?? "GET").toUpperCase() !== "GET" || url.host !== "api.github.com" || url.pathname !== `/repos/${PRODUCT}/issues`) return response;
    w.listed.push(url.searchParams.get("state"));
    const state = url.searchParams.get("state");
    const items = await response.json();
    return new Response(JSON.stringify(state === "all" ? items : items.filter((each) => each.state === state)), { status: 200, headers: { "content-type": "application/json" } });
  };
  return w;
}
const open = (w, name, params = {}) => {
  assert.ok(routeNamed(name), `the route ${name}: ${pages.error?.message}`);
  return draw(routeNamed(name), w.context, params);
};
const writesToIssues = (w) => w.kept.github.filter((request) => request.method !== "GET" && request.path.includes("/issues/")).map((request) => `${request.method} ${request.path.replace(`/repos/${PRODUCT}`, "")}`);
const issueOf = (w, number) => w.kept.issues.find((each) => each.number === number);

/** The issue 5 opened, a participant and a name given, and the run panel drawn. */
async function ready(w, participant = "local-llm") {
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "participant").length > 0);
  const radio = byClass(detail, "participant").find((each) => each.value === participant);
  radio.checked = true;
  one(detail, "person").value = "Reviewer Rae";
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(detail, "run-panel").length > 0);
  return detail;
}
/** The run panel's Run clicked by a person, and the proposal waited for. */
async function analysed(w) {
  const detail = await ready(w);
  await trusted(buttonsOf(one(detail, "run-panel"), "Run")[0]);
  await waitFor(() => byClass(detail, "issue-proposal").length > 0 || byClass(detail, "issue-problem").length > 0);
  return detail;
}

// TST-582301 · level: component · module: MOD-maintenance-pages
// guards: UC-012; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: known positive first — the page is loaded; the product alice/product with the open issues 5 to 8, of which 6 to 8 carry the label defect, change and not-reproducible, and the closed issue 9
// input: the route issues is drawn; the link of issue 5 is clicked by a script and then by a person
// expect: the issues requested are of the state open; the list holds 5, 6, 7 and 8 and not 9, with the class each label says — "not classified" for 5, defect, change, not-reproducible; the link of 5 has the href #issue/number=5/product=<the product>; the script's click goes nowhere and the person's goes to the route issue with number 5
test("issues — lists the product's open issues with their class, and a person's click on one goes to its page", async () => {
  const w = start();
  const target = await open(w, "issues");
  await waitFor(() => byClass(target, "issue").length > 0);
  assert.deepEqual(w.listed, ["open"]);
  const items = byClass(target, "issue");
  assert.deepEqual(items.map((node) => [node.getAttribute("data-issue"), textOf(one(node, "issue-class"))]),
    [["5", "not classified"], ["6", "defect"], ["7", "change"], ["8", "not-reproducible"]]);
  assert.ok(textOf(items[0]).includes("Export is cut off"));
  const link = one(items[0], "issue-link");
  assert.equal(link.getAttribute("href"), `#issue/number=5/product=${encodeURIComponent(PRODUCT_URL)}`);
  link.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.context.went, []);
  await trusted(link);
  assert.deepEqual(w.context.went, [["issue", { number: "5" }]]);
});

// TST-582302 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the page without a chosen product (the instance itself), and a product with no open issue
// input: the route issues is drawn for each
// expect: without a product the page says to choose one and the GitHub API is not asked for issues; with no open issue it says there is none
test("issues — says to choose a product where none is chosen, and that there is no open issue where there is none", async () => {
  const none = start();
  none.context.product = null;
  const target = await open(none, "issues");
  await flush();
  assert.match(textOf(one(target, "issues-problem")), /choose a product/i);
  assert.deepEqual(none.listed, []);
  restoreWorld();
  const empty = start({ issues: [issueRecord(9, "closed")] });
  const bare = await open(empty, "issues");
  await waitFor(() => byClass(bare, "issue-list").length > 0 || byClass(bare, "issues-empty").length > 0);
  assert.equal(byClass(bare, "issue").length, 0);
  assert.match(textOf(one(bare, "issues-empty")), /no open issue/i);
});

// TST-582303 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the open issue 5 with no label, and the closed issue 9 labelled defect
// input: the route issue with number 5, 9 and 99
// expect: issue 5: its number, title and text, "not classified", the analysis (participants and name) and the decision — buttons Bug, Change, Not reproducible and Reject issue, the last disabled —; issue 9: its text and class defect and neither analysis nor decision; 99: a problem naming it, and nothing else
test("issue — shows the issue with the analysis and the decision, a closed issue without them, and says when the issue is not there", async () => {
  const w = start();
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "issue-text").length > 0);
  assert.ok(textOf(detail).includes("#5") && textOf(detail).includes("Export is cut off"));
  assert.equal(one(detail, "issue-text").textContent, ISSUE_TEXT);
  assert.equal(textOf(one(detail, "issue-class")), "not classified");
  assert.equal(byClass(detail, "issue-analysis").length, 1);
  assert.deepEqual(byClass(detail, "set-class").map((node) => [node.getAttribute("data-class"), node.textContent]), [["bug", "Bug"], ["change", "Change"], ["not-reproducible", "Not reproducible"]]);
  const reject = buttonsOf(detail, "Reject issue")[0];
  assert.equal(reject.disabled, true);

  const closed = await open(w, "issue", { number: "9" });
  await waitFor(() => byClass(closed, "issue-text").length > 0);
  assert.equal(textOf(one(closed, "issue-class")), "defect");
  assert.deepEqual([byClass(closed, "issue-analysis").length, byClass(closed, "issue-decision").length], [0, 0]);

  const missing = await open(w, "issue", { number: "99" });
  await waitFor(() => byClass(missing, "issue-problem").length > 0);
  assert.match(textOf(one(missing, "issue-problem")), /99/);
  assert.equal(byClass(missing, "issue-text").length, 0);
});

// TST-582304 · level: component · module: MOD-maintenance-pages
// guards: THE PAGE NAMES WHERE IT SENDS; UC-012
// given: the issue 5 naming FIRST RULE; a register with local-llm (this machine) and cloud-llm (a provider in the USA), both declaring draft text, and checker, which declares only read the repository
// input: the issue opened; a participant and a name given step by step
// expect: the participants offered are local-llm and cloud-llm, each with its place, not checker; no run panel before both a participant and a name are given; then the panel names local-llm, its place, and the parts it receives — "issue #5" and "FIRST RULE" —; nothing is sent, stored or written to the issue yet
test("Analyse — offers the participants that can draft text with their places, and its run panel names what the participant receives, before anything is sent", async () => {
  const w = start();
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "participant").length > 0);
  assert.deepEqual(byClass(detail, "participant").map((radio) => radio.value), ["local-llm", "cloud-llm"]);
  const places = byClass(detail, "issue-participant").map((node) => textOf(node));
  assert.ok(places[0].includes("this machine") && places[1].includes("a provider in the USA"), places.join(" | "));
  const radio = byClass(detail, "participant")[0];
  radio.checked = true;
  radio.dispatchEvent(new Event("change"));
  await flush();
  assert.equal(byClass(detail, "run-panel").length, 0, "no panel before a name is given");
  one(detail, "person").value = "Reviewer Rae";
  radio.dispatchEvent(new Event("change"));
  await waitFor(() => byClass(detail, "run-panel").length > 0);
  const panel = textOf(one(detail, "run-panel"));
  assert.ok(panel.includes("local-llm") && panel.includes("this machine"), panel);
  assert.ok(panel.includes("issue #5") && panel.includes("FIRST RULE"), panel);
  assert.deepEqual([w.kept.endpoint, writesToIssues(w)], [[], []]);
  assert.equal(w.kept.github.some((request) => request.method !== "GET"), false, "nothing is committed before Run");
});

// TST-582305 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-012
// given: the run panel of TST-582304 and an endpoint that proposes the class change with its reasoning and two files that are wrong
// input: a click a script makes on Run; the person's click on Run
// expect: the script's click asks nothing; the endpoint is asked once and its request holds the issue's text and the requirement FIRST RULE; the job's start record is committed to the product; the page shows the class change, the reasoning and both files, and the decision's buttons now read Correct to bug, Confirm change and Correct to not reproducible; the analysis wrote nothing to the issue
test("Analyse — runs on the person's click and shows the class proposed with its reasoning, and writes nothing to the issue", async () => {
  const w = start();
  const detail = await ready(w);
  const run = buttonsOf(one(detail, "run-panel"), "Run")[0];
  run.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(w.kept.endpoint, []);
  await trusted(run);
  await waitFor(() => byClass(detail, "issue-proposal").length > 0);
  assert.equal(w.kept.endpoint.length, 1);
  const sent = JSON.stringify(w.kept.endpoint[0].body);
  assert.ok(sent.includes("is cut off after the second page") && sent.includes("The first rule holds."), "the request holds the issue and the requirement");
  assert.ok(w.kept.github.some((request) => request.method !== "GET" && request.path.includes("/git/")), "the start record is committed");
  assert.equal(textOf(one(detail, "proposed-class")).includes("change"), true);
  assert.ok(textOf(one(detail, "proposed-reasoning")).includes("a requirement is missing"));
  assert.deepEqual(byClass(detail, "proposed-wrong").map((node) => textOf(node)), PROPOSAL.wrong);
  assert.deepEqual(byClass(detail, "set-class").map((node) => node.textContent), ["Correct to bug", "Confirm change", "Correct to not reproducible"]);
  assert.deepEqual(writesToIssues(w), []);
});

// TST-582306 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-012
// given: the proposal of TST-582305
// input: a click a script makes on Confirm change; the person's click on it
// expect: the script's click writes nothing; the person's writes the label change and removes defect and not-reproducible, and nothing else; the page shows "confirmed" and the class change, in the issue's class and in <p class="issue-classified">
test("Confirm — one click on the class proposed sets its label and removes the other two", async () => {
  const w = start();
  const detail = await analysed(w);
  const confirm = buttonsOf(detail, "Confirm change")[0];
  confirm.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(writesToIssues(w), []);
  await trusted(confirm);
  await waitFor(() => byClass(detail, "issue-classified").length > 0);
  assert.deepEqual(writesToIssues(w).sort(), ["DELETE /issues/5/labels/defect", "DELETE /issues/5/labels/not-reproducible", "POST /issues/5/labels"]);
  assert.deepEqual(JSON.parse(w.kept.github.find((request) => request.method === "POST" && request.path.endsWith("/issues/5/labels")).body), { labels: ["change"] });
  assert.deepEqual(issueOf(w, 5).labels, ["change"]);
  const classified = one(detail, "issue-classified");
  assert.deepEqual([classified.getAttribute("data-class"), classified.getAttribute("data-how")], ["change", "confirmed"]);
  assert.equal(textOf(one(detail, "issue-class")), "change");
  assert.equal(issueOf(w, 5).state, "open");
});

// TST-582307 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; UC-012
// given: the proposal change of TST-582305, and an issue that carries the label change already
// input: the person's click on Correct to bug
// expect: the label defect is added and change and not-reproducible removed; the page shows "corrected" and the class bug; the issue stays open
test("Correct — one click on another class than the one proposed sets that class", async () => {
  const w = start({ issues: [issueRecord(5, "open", ["change"], "Export is cut off")] });
  const detail = await analysed(w);
  await trusted(buttonsOf(detail, "Correct to bug")[0]);
  await waitFor(() => byClass(detail, "issue-classified").length > 0);
  assert.deepEqual(issueOf(w, 5).labels, ["defect"]);
  const classified = one(detail, "issue-classified");
  assert.deepEqual([classified.getAttribute("data-class"), classified.getAttribute("data-how")], ["bug", "corrected"]);
  assert.equal(issueOf(w, 5).state, "open");
});

// TST-582308 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; UC-012
// given: the issue 5 opened and not analysed
// input: the person's click on Not reproducible
// expect: the label not-reproducible is set and the others removed; the page shows "set" and the class not-reproducible — a class needs no analysis first
test("Set a class — the author may classify an issue without an analysis", async () => {
  const w = start();
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "set-class").length > 0);
  await trusted(buttonsOf(detail, "Not reproducible")[0]);
  await waitFor(() => byClass(detail, "issue-classified").length > 0);
  assert.deepEqual(issueOf(w, 5).labels, ["not-reproducible"]);
  assert.equal(one(detail, "issue-classified").getAttribute("data-how"), "set");
});

// TST-582309 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the issue 5, open and unlabelled
// input: the reason field empty, then blank, then "Duplicate of #3."; a click a script makes on Reject issue; the person's click
// expect: Reject issue is disabled while the reason is blank and enabled once it is given; the script's click writes nothing; the person's comments the reason on the issue, closes it and touches no label; the page shows the rejection with its reason and offers neither analysis nor decision any more
test("Reject — closes the issue with the reason in one click, and changes nothing else", async () => {
  const w = start();
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "reject-reason").length > 0);
  const reason = one(detail, "reject-reason");
  const reject = buttonsOf(detail, "Reject issue")[0];
  assert.equal(reject.disabled, true);
  reason.value = "   ";
  reason.dispatchEvent(new Event("input"));
  assert.equal(reject.disabled, true);
  reason.value = "Duplicate of #3.";
  reason.dispatchEvent(new Event("input"));
  assert.equal(reject.disabled, false);
  reject.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(writesToIssues(w), []);
  await trusted(reject);
  await waitFor(() => byClass(detail, "issue-rejected").length > 0);
  assert.deepEqual(writesToIssues(w), ["POST /issues/5/comments", "PATCH /issues/5"]);
  assert.deepEqual(w.kept.github.filter((request) => request.method === "POST" && request.path.endsWith("/issues/5/comments")).map((request) => JSON.parse(request.body).body), ["Duplicate of #3."]);
  assert.equal(issueOf(w, 5).state, "closed");
  assert.deepEqual(issueOf(w, 5).labels, []);
  assert.ok(textOf(one(detail, "issue-rejected")).includes("Duplicate of #3."));
  assert.deepEqual([byClass(detail, "issue-analysis").length, byClass(detail, "issue-decision").length], [0, 0]);
});

// TST-582310 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: a token that may not comment (GitHub answers 403 to a comment), the issue 5
// input: a reason given and the person's click on Reject issue
// expect: the page shows a problem that says nothing was done by naming the permission; the issue is not closed and no label changed; the controls stay, so the click can be made again
test("Reject — a refused comment is shown, and the issue stays open", async () => {
  const w = start({ commentStatus: 403 });
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "reject-reason").length > 0);
  const reason = one(detail, "reject-reason");
  reason.value = "Duplicate of #3.";
  reason.dispatchEvent(new Event("input"));
  await trusted(buttonsOf(detail, "Reject issue")[0]);
  await waitFor(() => byClass(detail, "issue-problem").length > 0);
  assert.match(textOf(one(detail, "issue-problem")), /permission|token/i);
  assert.equal(issueOf(w, 5).state, "open");
  assert.equal(writesToIssues(w).some((line) => line.startsWith("PATCH")), false);
  assert.equal(buttonsOf(detail, "Reject issue")[0].disabled, false);
  assert.equal(byClass(detail, "issue-rejected").length, 0);
});

// TST-582311 · level: component · module: MOD-maintenance-pages
// guards: EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// given: the view of MOD-maintenance-pages
// input: its routes and its strategies
// expect: the routes issues (in the menu entry maintenance) and issue (out of the menu) after mail and replies; the strategies hold MOD-issue-handling's issueStrategies, so that the frame registers the recipe issue-context
test("view — serves the routes issues and issue and hands the frame the strategies of the issue kinds", () => {
  assert.ok(pages.view, `the view: ${pages.error?.message}`);
  const routes = pages.view.routes.map((each) => [each.name, each.entry]);
  assert.deepEqual(routes, [["mail", "maintenance"], ["replies", "maintenance"], ["issues", "maintenance"], ["issue", null]]);
  assert.ok(handling.issueStrategies, `MOD-issue-handling offers issueStrategies: ${handling.error?.message}`);
  assert.ok(pages.view.strategies.includes(handling.issueStrategies));
});
