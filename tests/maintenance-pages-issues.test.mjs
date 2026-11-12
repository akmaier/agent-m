// A product's issues are listed and each one shown (ITM-582) — MOD-maintenance-pages' routes `issues` and `issue/<number>`, as the accepted text of docs/architecture/MOD-maintenance-pages.md states them: "`issues`, `issue/<number>` — the product's issues; *Implement*, which puts the request to handle the issue as UC-012 does … into the prompt bar". UC-012 step 2. Implement itself is tests/maintenance-pages-implement.test.mjs'.
// Run: node --test tests/maintenance-pages-issues.test.mjs
//
// Module: MOD-maintenance-pages; MOD-issue-handling; MOD-job-runner
// Guards: THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// Level: component
//
// The world is tests/maintenance-pages-world.mjs (its model endpoint ep1 is the participant local-llm, its fake GitHub holds the issues of alice/product); here a fetch over it answers the issues of the state asked for. The page, MOD-issue-handling, MOD-job-runner, MOD-runtimes and
// MOD-repository-hosts are the real ones. Readings the texts leave open, which the tests state (the pull request names them):
//   - The product is the one the frame has chosen (`context.product`); without one the page says so and reads nothing. Route names: `issues` (in the menu entry maintenance) and `issue` (out of the menu), whose parameter `number` is the issue's number: the address is `#issue/number=<n>`.
//   - `issues` lists the open and closed issues (UC-012 step 2; MOD-maintenance-pages: `listIssues` with `state: "all"`): <ul class="issue-list"> of <li class="issue" data-issue="<n>"> with <a class="issue-link"> (href `#issue/number=<n>/product=<the product, percent-encoded>`; its click, by a person, goes to the route `issue` with `number`), the title, and <span class="issue-class"> — the class its label says:
//     defect or change (UC-012 step 3), else "not classified" — a label not-reproducible included.
//   - `issue` shows <h2> with the number and title, <pre class="issue-text"> with the issue's text, <span class="issue-class">, and, for an open issue, <button class="implement-issue"> Implement. A closed issue shows its text and its class only.
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
// expect: the issues requested are of the state all; the list holds 5, 6, 7, 8 and 9, with the class each label says — "not classified" for 5, defect, change, "not classified" for 8, whose label is neither defect nor change; the link of 5 has the href #issue/number=5/product=<the product>; the script's click goes nowhere and the person's goes to the route issue with number 5
test("issues — lists the product's open and closed issues with their class, and a person's click on one goes to its page", async () => {
  const w = start();
  const target = await open(w, "issues");
  await waitFor(() => byClass(target, "issue").length > 0);
  assert.deepEqual(w.listed, ["all"]);
  const items = byClass(target, "issue");
  assert.deepEqual(items.map((node) => [node.getAttribute("data-issue"), textOf(one(node, "issue-class"))]),
    [["5", "not classified"], ["6", "defect"], ["7", "change"], ["8", "not classified"], ["9", "defect"]]);
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
// given: the page without a chosen product (the instance itself), and a product with no issue, open or closed
// input: the route issues is drawn for each
// expect: without a product the page says to choose one and the GitHub API is not asked for issues; with no issue it says there is none
test("issues — says to choose a product where none is chosen, and that there is no issue where there is none", async () => {
  const none = start();
  none.context.product = null;
  const target = await open(none, "issues");
  await flush();
  assert.match(textOf(one(target, "issues-problem")), /choose a product/i);
  assert.deepEqual(none.listed, []);
  restoreWorld();
  const empty = start({ issues: [] });
  const bare = await open(empty, "issues");
  await waitFor(() => byClass(bare, "issue-list").length > 0 || byClass(bare, "issues-empty").length > 0);
  assert.equal(byClass(bare, "issue").length, 0);
  assert.match(textOf(one(bare, "issues-empty")), /has no issue/i);
});

// TST-582303 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the open issue 5 with no label, and the closed issue 9 labelled defect
// input: the route issue with number 5, 9 and 99
// expect: issue 5: its number, title and text, "not classified", and Implement; issue 9: its text and class defect and no Implement; 99: a problem naming it, and nothing else
test("issue — shows the issue with Implement, a closed issue without it, and says when the issue is not there", async () => {
  const w = start();
  const detail = await open(w, "issue", { number: "5" });
  await waitFor(() => byClass(detail, "issue-text").length > 0);
  assert.ok(textOf(detail).includes("#5") && textOf(detail).includes("Export is cut off"));
  assert.equal(one(detail, "issue-text").textContent, ISSUE_TEXT);
  assert.equal(textOf(one(detail, "issue-class")), "not classified");
  assert.deepEqual(buttonsOf(detail, "Implement").length, 1);

  const closed = await open(w, "issue", { number: "9" });
  await waitFor(() => byClass(closed, "issue-text").length > 0);
  assert.equal(textOf(one(closed, "issue-class")), "defect");
  assert.equal(byClass(closed, "implement-issue").length, 0);

  const missing = await open(w, "issue", { number: "99" });
  await waitFor(() => byClass(missing, "issue-problem").length > 0);
  assert.match(textOf(one(missing, "issue-problem")), /99/);
  assert.equal(byClass(missing, "issue-text").length, 0);
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
