// The issue page's *Close* and the class an issue has by its label — MOD-maintenance-pages' routes `issues` and `issue/<number>` as akmaier accepted them (docs/architecture/MOD-maintenance-pages.md, Interfaces):
// "each with its class as its label `defect` or `change` gives it; … on an open issue, *Close*, which closes it at once without a change of code, with the reason the person typed as its comment (UC-012 2a)";
// UC-012 steps 3 and 4: the issue's class is its label, `defect` a bug and `change` a change, and "the class is not decided again"; UC-033 1a: an issue that carries neither label is not offered Move to backlog.
// Run: node --test --test-timeout=60000 tests/maintenance-pages-close-at-once.test.mjs
//
// Module: MOD-maintenance-pages
// Guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; UC-012; UC-033
// Level: component
//
// The world is tests/maintenance-pages-world.mjs; its fake GitHub holds the issues of alice/product. The page is the real one. Readings the texts leave open, which the tests state (the pull request names them):
//   - Close is <section class="issue-close"> on the page of an open issue: a <textarea class="close-reason"> for the reason and <button class="close-issue"> "Close". The person's click (`isTrusted`) with a reason
//     comments the reason, as typed, on the issue and then closes it; the page then says so (<p class="close-done">). A click without a reason writes nothing and says that a reason is needed
//     (<p class="close-problem">). A closed issue offers no Close.
//   - Implement's request names the class the label gives — "label defect: a bug", "label change: a change" — and says not to classify the issue anew; it asks for no proposed class and no confirmation.
//   - An issue that carries neither label is "not classified" in the list and on its page, a label not-reproducible included; such an issue offers no Move to backlog and no lead to UC-012.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { PRODUCT_URL, draw } from "./main-page-home-harness.mjs";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";
import { buttonsOf, byClass, flush, one, pages, restoreWorld, routeNamed, textOf, trusted, waitFor, world } from "./maintenance-pages-world.mjs";

afterEach(restoreWorld);

const PRODUCT_TOKEN = "github_pat_CLOSE2AT0ONCE0123456789abcdefgh";
const ISSUE_TEXT = "The export of FIRST RULE is cut off after the second page.";
const REASON = "Out of scope: the export is a feature of another product.";
const issue = (number, state, labels = []) => ({ number, title: `Export is cut off ${number}`, body: ISSUE_TEXT, state, labels, comments: [] });

function started(issues) {
  const w = world({ mails: [], issues });
  w.context.product = { address: PRODUCT_URL, kind: "github", host: connect(parseAddress(PRODUCT_URL), { token: PRODUCT_TOKEN }), tokenStored: true };
  return w;
}
async function drawn(w, name, params = {}) {
  assert.ok(routeNamed(name), `the route ${name}: ${pages.error?.message}`);
  const target = await draw(routeNamed(name), w.context, params);
  await waitFor(() => byClass(target, name === "issue" ? "issue-text" : "issue-list").length > 0 || byClass(target, `${name}-problem`).length > 0);
  await flush();
  return target;
}
async function prompted(run) {
  const prompts = [];
  const before = globalThis.dispatchEvent;
  globalThis.dispatchEvent = (event) => { if (event.type === "agent-m:prompt") prompts.push(event.detail); return true; };
  try { await run(); } finally { if (before) globalThis.dispatchEvent = before; else delete globalThis.dispatchEvent; }
  return prompts;
}
const writes = (w) => w.kept.github.filter((request) => request.method !== "GET");
const issueNow = (w, number) => w.kept.issues.find((each) => each.number === number);

// TST-20261112601 · level: component · module: MOD-maintenance-pages
// guards: ONE CLICK PER DECISION; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; UC-012
// given: the open issue 5 of alice/product, labelled defect
// input: the route issue/5 drawn; Close clicked by a person with no reason, then by a script with REASON typed (counter-proofs), then by a person with REASON typed
// expect: without a reason nothing is written and the page says a reason is needed; the script's click writes nothing; the person's click writes exactly two requests to the issue — the comment REASON, then the state closed — and no commit; the issue is closed with one comment, REASON, and the page says it is closed
test("TST-20261112601 Close closes an open issue at once, without a change of code, with the reason typed as its comment", async () => {
  const w = started([issue(5, "open", ["defect"])]);
  const target = await drawn(w, "issue", { number: "5" });
  const close = one(target, "close-issue");
  assert.ok(close, "Close is offered on an open issue");
  assert.equal(textOf(close), "Close");
  await trusted(close);
  assert.deepEqual(writes(w), [], "counter-proof: without a reason nothing is written");
  assert.match(textOf(one(target, "close-problem") ?? { textContent: "" }), /reason/i);
  one(target, "close-reason").value = REASON;
  close.dispatchEvent(new Event("click"));
  await flush();
  assert.deepEqual(writes(w), [], "counter-proof: a script's click writes nothing");
  await trusted(close);
  await waitFor(() => byClass(target, "close-done").length > 0);
  assert.deepEqual(writes(w).map((request) => [request.method, request.path]), [["POST", "/repos/alice/product/issues/5/comments"], ["PATCH", "/repos/alice/product/issues/5"]]);
  assert.equal(JSON.parse(writes(w)[0].body).body, REASON);
  assert.equal(JSON.parse(writes(w)[1].body).state, "closed");
  assert.deepEqual(issueNow(w, 5).comments, [REASON]);
  assert.equal(issueNow(w, 5).state, "closed");
  assert.match(textOf(one(target, "close-done")), /closed/i);
});

// TST-20261112602 · level: component · module: MOD-maintenance-pages
// guards: UC-012
// given: the closed issue 9, labelled defect; known positive — the open issue 6, unlabelled
// input: the routes issue/6 and issue/9 drawn
// expect: the open issue offers Close; the closed one offers none
test("TST-20261112602 a closed issue offers no Close", async () => {
  const w = started([issue(6, "open"), issue(9, "closed", ["defect"])]);
  assert.equal(byClass(await drawn(w, "issue", { number: "6" }), "close-issue").length, 1, "known positive: an open issue offers Close");
  const closed = await drawn(w, "issue", { number: "9" });
  assert.match(textOf(one(closed, "issue-text")), /FIRST RULE/);
  assert.equal(byClass(closed, "close-issue").length, 0);
});

// TST-20261112603 · level: component · module: MOD-maintenance-pages
// guards: AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; UC-012
// given: the open issues 6, labelled defect, 7, labelled change, and 5, with no label
// input: Implement pressed by a person on each
// expect: the request of 6 says its class is its label defect, a bug, that of 7 its label change, a change, that of 5 that it carries neither label; each says not to classify the issue anew and none asks to propose a class or to wait for a confirmation
test("TST-20261112603 Implement's request names the class the label gives and asks for no classification anew", async () => {
  const w = started([issue(5, "open"), issue(6, "open", ["defect"]), issue(7, "open", ["change"])]);
  const requests = {};
  for (const number of [5, 6, 7]) {
    const target = await drawn(w, "issue", { number: String(number) });
    [requests[number]] = await prompted(() => trusted(one(target, "implement-issue")));
  }
  assert.match(requests[6], /label defect: a bug/);
  assert.match(requests[7], /label change: a change/);
  assert.match(requests[5], /neither the label defect nor the label change/);
  for (const number of [5, 6, 7]) {
    assert.match(requests[number], /Do not classify it anew/, `issue ${number}`);
    assert.doesNotMatch(requests[number], /Propose its class|wait for my confirmation/i, `issue ${number}`);
  }
});

// TST-20261112604 · level: component · module: MOD-maintenance-pages
// guards: AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; UC-033
// given: the open issues 6, labelled defect (known positive), 8, labelled not-reproducible, and 5, with no label
// input: the route issues drawn; the routes issue/6, issue/8 and issue/5 drawn
// expect: the list names 6 defect and 5 and 8 "not classified"; 6 offers Move to backlog; 8 and 5 offer neither Move to backlog nor a lead to UC-012, and their pages name them "not classified"
test("TST-20261112604 an issue with neither the label defect nor change is not classified and is not offered Move to backlog (UC-033 1a)", async () => {
  const w = started([issue(5, "open"), issue(6, "open", ["defect"]), issue(8, "open", ["not-reproducible"])]);
  const list = await drawn(w, "issues");
  const classOf = (number) => textOf(one(byClass(list, "issue").find((node) => node.getAttribute("data-issue") === String(number)), "issue-class"));
  assert.deepEqual([5, 6, 8].map(classOf), ["not classified", "defect", "not classified"]);
  const six = await drawn(w, "issue", { number: "6" });
  await waitFor(() => buttonsOf(six, "Move to backlog").length > 0);
  assert.equal(buttonsOf(six, "Move to backlog").length, 1, "known positive: a bug is offered the move");
  for (const number of [8, 5]) {
    const target = await drawn(w, "issue", { number: String(number) });
    assert.equal(byClass(target, "implement-issue").length, 1, `issue ${number}: the page is drawn`);
    assert.equal(buttonsOf(target, "Move to backlog").length, 0, `issue ${number}`);
    assert.equal(byClass(target, "uc-012").length, 0, `issue ${number}: no lead to UC-012`);
    assert.equal(textOf(one(target, "issue-class")), "not classified", `issue ${number}`);
  }
});
