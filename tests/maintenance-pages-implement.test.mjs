// The issue page offers *Implement*, which puts the issue into the prompt bar — MOD-maintenance-pages' routes `issues` and `issue/<number>` as akmaier accepted them (docs/architecture/MOD-maintenance-pages.md,
// Interfaces): "`issues`, `issue/<number>` — the product's issues; *Implement*, which puts the request to handle the issue as UC-012 does, with its number, title and text, into the prompt bar (MOD-prompt-bar's
// event `agent-m:prompt`)", and UC-012 step 2: "presses **Implement**: one click puts the request to handle the issue as this use case does — with its number, title and text — into the prompt bar, where the
// author sends or changes it (UC-049)". The run panels of Analyse, of the change and of the fix, and the class decided on the page, are no longer the page's.
// Run: node --test --test-timeout=60000 tests/maintenance-pages-implement.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; EVOLUTION ENTERS THROUGH THE SPECIFICATION; UC-012
// Level: component
//
// The world is tests/maintenance-pages-world.mjs; its fake GitHub holds the issues of alice/product. The page is the real one. Readings the texts leave open, which the tests state (the pull request names them):
//   - Implement is <button class="implement-issue"> on the page of an open issue; a closed issue is resolved and offers none. Its click, a person's (`isTrusted`), dispatches on the window the event
//     agent-m:prompt whose detail is the request: it names the product, the issue's number, says to handle it as Agent M's UC-012 does, and holds the issue's title and its text. It writes nothing.
//   - The page holds no section of Analyse (issue-analysis), of the decision of the class (issue-decision), of the change (issue-change) or of the fix's run (issue-fix), and no run panel.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { byClass, flush, one, pages, restoreWorld, routeNamed, textOf, trusted, waitFor, world } from "./maintenance-pages-world.mjs";

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_IMPLEMENT1PRODUCT0123456789abcd";
const ISSUE_TEXT = "The export of FIRST RULE is cut off after the second page.";
const issue = (number, state, labels = []) => ({ number, title: `Export is cut off ${number}`, body: ISSUE_TEXT, state, labels, comments: [] });

function started(issues) {
  const w = world({ mails: [], issues });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  return w;
}
async function issuePage(w, number) {
  assert.ok(routeNamed("issue"), `the route issue: ${pages.error?.message}`);
  const target = await draw(routeNamed("issue"), w.context, { number: String(number) });
  await waitFor(() => byClass(target, "issue-text").length > 0 || byClass(target, "issue-problem").length > 0);
  await flush();
  return target;
}
// The window the page dispatches the event on, standing in for the browser's (node's globalThis is no EventTarget): the prompts it received.
async function prompted(run) {
  const prompts = [];
  const before = globalThis.dispatchEvent;
  globalThis.dispatchEvent = (event) => { if (event.type === "agent-m:prompt") prompts.push(event.detail); return true; };
  try { await run(); } finally { if (before) globalThis.dispatchEvent = before; else delete globalThis.dispatchEvent; }
  return prompts;
}
const writes = (w) => w.kept.github.filter((request) => request.method !== "GET");

// TST-20261112401 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-012
// given: the product alice/product with the open issue 5, titled "Export is cut off 5", its text ISSUE_TEXT
// input: the route issue/5 drawn; Implement clicked by a script (counter-proof), then by a person
// expect: the script's click puts nothing into the prompt bar; the person's click dispatches one agent-m:prompt whose text names issue #5 and UC-012 and holds the title and ISSUE_TEXT; no request writes to GitHub
test("TST-20261112401 Implement puts the request to handle the issue as UC-012 does, with its number, title and text, into the prompt bar", async () => {
  const w = started([issue(5, "open")]);
  const target = await issuePage(w, 5);
  const implement = one(target, "implement-issue");
  assert.equal(textOf(implement), "Implement");
  assert.deepEqual(await prompted(async () => { implement.dispatchEvent(new Event("click")); await flush(); }), [], "counter-proof: a script's click puts nothing into the bar");
  const prompts = await prompted(() => trusted(implement));
  assert.equal(prompts.length, 1, "one click, one prompt");
  assert.match(prompts[0], /issue #5\b/);
  assert.match(prompts[0], /UC-012/);
  assert.ok(prompts[0].includes("Export is cut off 5") && prompts[0].includes(ISSUE_TEXT), prompts[0]);
  assert.deepEqual(writes(w), [], "putting the prompt into the bar writes nothing");
});

// TST-20261112402 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the open issue 6, labelled defect, and the open issue 7, labelled change
// input: the routes issue/6 and issue/7 drawn
// expect: each offers Implement (known positive: the page is drawn) and holds no Analyse, no decision of the class, no change and no fix section, and no run panel
test("TST-20261112402 the issue page offers Implement in place of Analyse, the class decided on the page, the change and the fix", async () => {
  const w = started([issue(6, "open", ["defect"]), issue(7, "open", ["change"])]);
  for (const number of [6, 7]) {
    const target = await issuePage(w, number);
    assert.equal(byClass(target, "implement-issue").length, 1, `issue ${number}: Implement is offered`);
    for (const gone of ["issue-analysis", "issue-decision", "set-class", "reject", "issue-change", "issue-fix", "run-panel"]) {
      assert.equal(byClass(target, gone).length, 0, `issue ${number}: no ${gone}`);
    }
  }
});

// TST-20261112403 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the closed issue 9, labelled defect; counter-proof — the open issue 5
// input: the routes issue/9 and issue/5 drawn
// expect: the closed issue shows its text and offers no Implement; the open one offers it
test("TST-20261112403 a closed issue offers no Implement", async () => {
  const w = started([issue(9, "closed", ["defect"]), issue(5, "open")]);
  const closed = await issuePage(w, 9);
  assert.match(textOf(one(closed, "issue-text")), /FIRST RULE/);
  assert.equal(byClass(closed, "implement-issue").length, 0);
  assert.equal(byClass(await issuePage(w, 5), "implement-issue").length, 1, "counter-proof: an open issue offers it");
});
