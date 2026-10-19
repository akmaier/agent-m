// MOD-review-pages' *Check this edit* on `decision/<id>/edit` and `module/<id>/edit` (ITM-731), as UC-023 step 3 ("Before saving an edit, the author may have it checked in the same way")
// and the accepted text of docs/architecture/MOD-review-pages.md state it: "Before saving an edit of the architecture, *Check this edit* runs the kind `review-architecture` on the edited
// files as its draft, and its findings stand beside them for the author to weigh" — the reviewing participant chosen among those that can draft text, the run panel naming what is sent
// where (`THE PAGE NAMES WHERE IT SENDS`), *Run*, the findings in the compiler form beside the edit, each a warning (`A REVIEWER'S FINDING IS A WARNING`); nothing is saved by the check.
// Run: node --test tests/review-pages-check-this-edit.test.mjs
//
// Module: MOD-review-pages
// Guards: UC-023; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON; NO REVIEWER IS THE DRAFTER; A REVIEWER'S FINDING IS A WARNING; THE PAGE NAMES WHERE IT SENDS
// Level: unit
//
// The small DOM of tests/review-pages-harness.mjs; the product and the instance are those of tests/review-pages-draft-world.mjs, whose register holds the fixture reviewer drafter-a behind the
// model endpoint ep1. The endpoint is the global `fetch`, which the test replaces and restores; every request is kept. The real MOD-job-runner, MOD-runtimes, MOD-approvals, MOD-spec-changes,
// MOD-source-register, MOD-trace-graph and MOD-site-frame run as they are, the strategies registered as the view hands them to the frame. Where the module file leaves a reading open, the
// test states the one it takes, and the pull request names it:
//   - The page of the edit holds <section class="check-edit"> beside the editor: <li class="participant"> with <input class="participant"> (a radio) for each participant able to draft text,
//     <button class="prepare"> labelled "Check this edit", which shows the run panel (the panel's own Run starts the job) in <section class="stage">.
//   - The job is not recorded: no job record is written, nothing is committed (a conversation of the prompt bar has no record either). It runs in this tab; a participant whose route is not the tab is
//     told so in <p class="problem">.
//   - The draft the reviewer receives is { files: [{ path, class: "change", of: <id>, text: <the edited text> }] }. Its findings are added to the editor's marks (<ol class="marks">) as warnings, in the
//     one compiler form, beside the marks of the schema and the graph; they stay while the text is edited.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import { fakeProduct, contextOf, draw, find, byClass, click, until, buttonsNamed, pages, writeSetting, ARC_PATH, ARC1, MOD_PATH } from "./review-pages-draft-world.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { registerStrategies } = await import("../src/job-runner/index.mjs");
(pages.view?.strategies ?? []).forEach((strategies, at) => registerStrategies(`tests/review-pages-check-this-edit.test.mjs#${at}`, strategies));

const FINDING = { artifact: ARC_PATH, line: 9, rule: "AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE", what: "the desk and the shelf have no named owner", fix: "name who owns each module" };
let requests = [];
const realFetch = globalThis.fetch;
function reviewerAnswers(findings) {
  requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), body: String(init.body ?? "") });
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft: { findings }, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

async function editPage(fake, id = "ARC-001") {
  const context = contextOf(fake);
  writeSetting(context.store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "m", throughBridge: false });
  const { target } = await draw(fake, "decision", { id, edit: "1" }, { context });
  return target;
}
const area = (target) => find(target, (node) => node.localName === "textarea")[0];
const type = (target, body) => { area(target).value = body; area(target).dispatchEvent(new Event("input")); };
const marksOf = (target) => byClass(target, "ol", "marks")[0]?.textContent ?? "";
const choose = (target, name) => { const box = find(target, (node) => node.localName === "input" && node.className.split(" ").includes("participant") && node.value === name)[0]; box.checked = true; box.dispatchEvent(new Event("change")); };
const EDITED = (body) => body.replace("The desk and the shelf are two modules.", "The desk and the shelf are two modules, each with an owner.");

// TST-731001 · level: unit · module: MOD-review-pages
// guards: UC-023; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REVIEWER'S FINDING IS A WARNING; THE PAGE NAMES WHERE IT SENDS
// given: ARC-001 opened in the editor with a token, its text edited; the fixture reviewer drafter-a, which answers one finding
// input: choose drafter-a, a click on "Check this edit", then on Run of the panel
// expect: before Run nothing was sent; the panel names drafter-a and where it processes data; the reviewer received the edited text as its draft; the finding stands beside the editor as a warning in the compiler form; Save is still offered; no commit was made
test("decision/<id>/edit — Check this edit runs review-architecture on the edited file and shows its findings as warnings, saving nothing", async () => {
  reviewerAnswers([FINDING]);
  const fake = fakeProduct();
  const target = await editPage(fake);
  const edited = EDITED(ARC1);
  assert.notEqual(edited, ARC1);
  type(target, edited);
  assert.equal(byClass(target, "section", "check-edit").length, 1, "the check is offered beside the editor");
  choose(target, "drafter-a");
  click(byClass(target, "button", "prepare")[0]);
  await until(() => byClass(target, "section", "run-panel").length === 1, "the run panel");
  const panel = byClass(target, "section", "run-panel")[0].textContent;
  assert.match(panel, /drafter-a/);
  assert.match(panel, /this machine/);
  assert.equal(requests.length, 0, "nothing is sent before Run");
  click(buttonsNamed(target, "Run")[0]);
  await until(() => marksOf(target).includes(FINDING.what), "the reviewer's finding");
  assert.ok(requests.length >= 1, "the reviewer was asked");
  assert.ok(requests.some((request) => request.body.includes("each with an owner")), "the reviewer received the edited text as its draft");
  assert.match(marksOf(target), new RegExp(`${ARC_PATH.replace(/[.]/g, "\\.")}:9: warning: ${FINDING.what}`));
  assert.equal(buttonsNamed(target, "Save")[0]?.disabled, false, "Save stays offered");
  assert.equal(fake.writes().length, 0, "nothing is committed");
});

// TST-731002 · level: unit · module: MOD-review-pages
// guards: UC-023; THE PAGE NAMES WHERE IT SENDS
// given: the same edit page, a module file as well as a decision
// input: a click on "Check this edit" with no participant chosen; and the page of a module file
// expect: the page says to choose the reviewing participant, shows no run panel and sends nothing; the module file's page offers the check too (counter-proof: the use case's edit page offers none)
test("decision/<id>/edit — without a chosen reviewer nothing is prepared or sent; a module offers the check, a use case does not", async () => {
  reviewerAnswers([]);
  const fake = fakeProduct();
  const target = await editPage(fake);
  click(byClass(target, "button", "prepare")[0]);
  await until(() => byClass(target, "p", "problem").some((node) => /Choose the participant/.test(node.textContent)), "the request to choose");
  assert.equal(byClass(target, "section", "run-panel").length, 0);
  assert.equal(requests.length, 0);
  const module_ = await draw(fake, "module", { id: "MOD-reader", edit: "1" }, { context: (() => { const context = contextOf(fake); writeSetting(context.store, "endpoint:ep1", { url: "https://ep1.example.test/v1", kind: "openai-compatible", model: "m", throughBridge: false }); return context; })() });
  assert.equal(byClass(module_.target, "section", "check-edit").length, 1, MOD_PATH);
  const useCase = await draw(fake, "use-case", { id: "UC-007", edit: "1" });
  assert.equal(byClass(useCase.target, "section", "check-edit").length, 0, "a use case has no such check");
});
