// The run panel (ITM-344) — MOD-site-frame's runPanel, as docs/architecture/MOD-site-frame.md states it under Interfaces: the panel
// before a job runs (THE PAGE NAMES WHERE IT SENDS): every destination — the participant, its part as drafter, reviewer or
// checker, its model, where it processes data — and what goes there, part by part with its size against the participant's context
// and the requirement sources whose content it carries; what does not fit, and why; a part left out, with its reason; the findings
// that keep the job from starting; the limit of correction rounds fixed for it. Run is offered only when nothing keeps the job from
// starting and everything fits; pressing it is the decision and calls onRun (UC-005 step 3, UC-007 step 2, UC-019 steps 4 and 5, 4a, 5a).
// Run: node --test tests/site-frame-run-panel.test.mjs
//
// Module: MOD-site-frame
// Guards: THE PAGE NAMES WHERE IT SENDS; ONE CLICK PER DECISION; NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; THE CORRECTION LOOP HAS A FIXED LIMIT; UC-005; UC-007; UC-019
// Level: unit
//
// This imports the module's existing browser harness unchanged, and
// calls runPanel with Prepared values as MOD-job-runner's prepareJob gives them, written out here. The panel is read as a person
// meets it: its text, its buttons and what pressing one does. Where the module file leaves a reading open, the test states the one it
// takes, and the pull request names it:
//   - The panel is a <section class="run-panel">. Each destination is a <section class="destination"> and each part sent there an
//     <li class="part"> in it; what does not fit is a <p class="not-fitting"> each, a part left out an <li class="left-out">, a finding
//     that keeps the job from starting an <li class="blocking">, and the limit a <p class="limit">. Nothing else is pinned of the layout.
//   - A destination shows the participant's name, its role, its model and its place; a model or place that is null, and a context that
//     is null, is said not to be declared and never printed as null. Its size is shown against the context, in tokens.
//   - A part shows its name, its size in tokens and, where it carries any, the identifiers of the sources whose content it holds.
//   - What does not fit names the participant, what would be sent and what its context holds. A part left out blocks nothing: Run is
//     offered with it. A finding shows its kind, what it says, the fix and its rule.
//   - Run is a button "Run"; it is not in the panel while a finding blocks or something does not fit. A press calls onRun once, whatever
//     the number of presses, and the button is disabled after it. Cancel is a button "Cancel", there only when onCancel is given.
//   - Every text of the Prepared value is shown as text, never as markup.
// Each test states its input and its expected result before it runs (given / input / expect); where a test expects something absent,
// the same call is first shown to give it on a known positive. The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import * as siteFrame from "../src/site-frame/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { runPanel } = siteFrame;

// ---------------------------------------------------------------- the fixtures

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));
const buttons = (root) => elements(root, (e) => e.localName === "button");
const buttonNamed = (root, label) => buttons(root).find((b) => b.textContent.trim() === label) ?? null;
const said = (node) => node.textContent.replace(/\s+/g, " ").trim();

const drafter = { name: "Erlangen endpoint", type: "model endpoint", model: "model-a", context: 20000, price: null,
  capabilities: ["draft text"], place: "Erlangen", route: "browser" };
const reviewer = { name: "CI reviewer", type: "CI agent", model: "model-b", context: 9000, price: null,
  capabilities: ["draft text"], place: "GitHub Actions, USA", route: "ci" };
const person = { name: "A. Person", type: "person", model: null, context: null, price: null, capabilities: ["draft text"],
  place: null, route: "browser" };

const part = (name, size, sources = []) => ({ name, text: "x".repeat(size), size, sources, required: true, recipe: name, artifacts: [] });
const EXCERPT = part("excerpt of the standard, section 4", 1234, ["SRC-standard"]);
const REQUIREMENTS = part("SPEC.md with its open queues", 5678);
const CHAPTER = part("08_requirements.md", 345);

// A Prepared value as prepareJob gives it for a job whose drafter and one reviewer receive these parts.
function prepared(overrides = {}) {
  return { kind: { name: "derive-requirements" }, params: {}, drafter, reviewers: [reviewer], parts: [EXCERPT, REQUIREMENTS, CHAPTER],
    destinations: [
      { participant: drafter, role: "drafter", place: "Erlangen", parts: [EXCERPT.name, REQUIREMENTS.name, CHAPTER.name], size: 7557 },
      { participant: reviewer, role: "reviewer", place: "GitHub Actions, USA", parts: [REQUIREMENTS.name], size: 5800 },
    ], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5, ...overrides };
}
const finding = (kind, what, fix, rule) => ({ artifact: "docs/participants.md", line: 1, kind, rule, what, fix });
const panel = (value, handlers = {}) => runPanel(value, { onRun: async () => {}, ...handlers });

// ---------------------------------------------------------------- what goes where

// TST-472846 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-005; UC-007; UC-019
// given: a Prepared value with a drafter that receives three parts, one of which carries the content of SRC-standard, and a reviewer that receives one of them
// input: runPanel(prepared, handlers)
// expect: a run panel with one destination for each participant, in order, each naming the participant, its role, its model and its place, and listing the parts it receives, each with its name and its size in tokens, the source identifier only on the part that carries it; the size of the whole against the participant's context
test("runPanel — every destination with its participant, role, model and place, and the parts sent there with their sizes", () => {
  const element = panel(prepared());

  assert.equal(element.localName, "section");
  assert.ok(element.className.split(" ").includes("run-panel"), element.className);
  const [first, second] = byClass(element, "destination");
  assert.equal(byClass(element, "destination").length, 2);
  for (const [box, who, role, model, place] of [[first, "Erlangen endpoint", "drafter", "model-a", "Erlangen"],
    [second, "CI reviewer", "reviewer", "model-b", "GitHub Actions, USA"]]) {
    const text = said(box);
    for (const word of [who, role, model, place]) assert.ok(text.includes(word), `${who}: ${word} in "${text}"`);
  }
  const listed = (box) => byClass(box, "part").map(said);
  assert.equal(listed(first).length, 3);
  assert.ok(listed(first)[0].includes("excerpt of the standard, section 4") && listed(first)[0].includes("1234") && listed(first)[0].includes("SRC-standard"));
  assert.ok(listed(first)[1].includes("SPEC.md with its open queues") && listed(first)[1].includes("5678"));
  assert.ok(listed(first)[2].includes("08_requirements.md") && listed(first)[2].includes("345"));
  assert.ok(listed(first)[0].includes("carries"), "a part that carries a source says so");
  assert.ok(!listed(first)[1].includes("SRC-") && !listed(first)[1].includes("carries"), "a part that carries no source says nothing of it");
  assert.deepEqual(listed(second).length, 1);
  assert.ok(listed(second)[0].includes("SPEC.md with its open queues") && listed(second)[0].includes("5678"));
  assert.ok(said(first).includes("7557") && said(first).includes("20000"), said(first));
  assert.ok(said(second).includes("5800") && said(second).includes("9000"), said(second));
});

// TST-472847 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-005
// given: the Prepared value above, and one whose only destination is a person, who has no model, no place and no context
// input: runPanel for each
// expect: the first names the model and the place; the second says the model, the place and the context are not declared, and prints neither null nor undefined
test("runPanel — a model, a place or a context that is not declared is said so, never printed as null", () => {
  assert.ok(said(panel(prepared())).includes("model-a"), "known positive: a declared model is named");

  const text = said(panel(prepared({ drafter: person, reviewers: [], parts: [CHAPTER],
    destinations: [{ participant: person, role: "drafter", place: "", parts: [CHAPTER.name], size: 345 }] })));
  assert.ok(text.includes("A. Person"), text);
  assert.ok(!/null|undefined/.test(text), text);
  assert.equal((text.match(/not declared/g) ?? []).length >= 3, true, text);
});

// ---------------------------------------------------------------- what does not fit, what is left out, what blocks

// TST-472848 · level: unit · module: MOD-site-frame
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY; UC-019
// given: the Prepared value above, to show Run offered; then one in which the reviewer's context of 9000 tokens cannot hold the 12000 it would receive, so that fits is false and notFitting names the reviewer
// input: runPanel for each
// expect: with the first a Run button; with the second no Run button, and one statement of what does not fit, naming CI reviewer, the 12000 tokens and the 9000 its context holds
test("runPanel — a participant whose context is too small is named with what it cannot hold, and Run is not offered", () => {
  assert.ok(buttonNamed(panel(prepared()), "Run"), "known positive: Run is offered when everything fits");
  assert.equal(byClass(panel(prepared()), "not-fitting").length, 0);

  const small = prepared({ fits: false, notFitting: [{ participant: reviewer, size: 12000, context: 9000 }] });
  const element = panel(small);

  assert.equal(buttonNamed(element, "Run"), null);
  const [statement, ...more] = byClass(element, "not-fitting");
  assert.equal(more.length, 0);
  const text = said(statement);
  for (const word of ["CI reviewer", "12000", "9000"]) assert.ok(text.includes(word), `${word} in "${text}"`);
});

// TST-472849 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-005
// given: a Prepared value whose only destination is a person, whose context is not declared and who therefore is not in notFitting, to show Run offered; and one whose notFitting names three participants, the third a person whose context is null
// input: runPanel for each
// expect: Run for the first; for the second one statement for each participant, in order — the last, a participant whose context is not declared, saying so —, and no Run
test("runPanel — every participant that does not fit is named, one statement each", () => {
  const unknown = prepared({ destinations: [{ participant: person, role: "drafter", place: "", parts: [CHAPTER.name], size: 345 }] });
  assert.ok(buttonNamed(panel(unknown), "Run"), "known positive: a context that is not declared blocks nothing");

  const both = prepared({ fits: false, notFitting: [{ participant: drafter, size: 30000, context: 20000 },
    { participant: reviewer, size: 12000, context: 9000 }, { participant: person, size: 345, context: null }] });
  const element = panel(both);

  const statements = byClass(element, "not-fitting").map(said);
  assert.equal(statements.length, 3);
  assert.ok(statements[2].includes("A. Person") && statements[2].includes("345") && statements[2].includes("not declared") && !/null/.test(statements[2]), statements[2]);
  assert.ok(statements[0].includes("Erlangen endpoint") && statements[0].includes("30000") && statements[0].includes("20000"), statements[0]);
  assert.ok(statements[1].includes("CI reviewer") && statements[1].includes("12000") && statements[1].includes("9000"), statements[1]);
  assert.equal(buttonNamed(element, "Run"), null);
});

// TST-472850 · level: unit · module: MOD-site-frame
// guards: NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY; UC-005; UC-007
// given: the Prepared value above, and one in which a part of a recipe that may be left out was left out, with the reason "the register entry SRC-standard records no version"
// input: runPanel for each
// expect: the first shows no part left out; the second shows that part's recipe and its reason, once, and still offers Run — a part left out keeps nothing from starting
test("runPanel — a part left out is shown with its reason, and does not keep the job from starting", () => {
  assert.equal(byClass(panel(prepared()), "left-out").length, 0, "known positive: nothing left out, nothing shown");

  const element = panel(prepared({ leftOut: [{ part: "source-excerpt", reason: "the register entry SRC-standard records no version" }] }));

  const [line, ...more] = byClass(element, "left-out");
  assert.equal(more.length, 0);
  assert.ok(said(line).includes("source-excerpt") && said(line).includes("the register entry SRC-standard records no version"), said(line));
  assert.ok(buttonNamed(element, "Run"));
});

// TST-472851 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS; UC-019
// given: the Prepared value above with two findings that keep the job from starting: an error that a participant lacks a capability, and one that a restricted source may not go to the reviewer's place
// input: runPanel
// expect: each finding shown once, in order, with its kind, what it says, its fix and its rule; no Run button
test("runPanel — a finding that keeps the job from starting is shown whole, and Run is not offered", () => {
  const blocking = [
    finding("error", "CI reviewer, the reviewer of this job, lacks the capability read the repository", "choose a participant that declares it",
      "A PARTICIPANT DECLARES ITS CAPABILITIES"),
    finding("error", "Erlangen endpoint may not receive SRC-standard", "choose a participant at a place SRC-standard permits",
      "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS")];

  const element = panel(prepared({ blocking }));

  const lines = byClass(element, "blocking").map(said);
  assert.equal(lines.length, 2);
  blocking.forEach((each, at) => {
    for (const word of [each.kind, each.what, each.fix, each.rule]) assert.ok(lines[at].includes(word), `${word} in "${lines[at]}"`);
  });
  assert.equal(buttonNamed(element, "Run"), null);
  assert.equal(byClass(panel(prepared()), "blocking").length, 0, "known positive: nothing blocks, nothing shown");
});

// ---------------------------------------------------------------- the limit

// TST-472852 · level: unit · module: MOD-site-frame
// guards: THE CORRECTION LOOP HAS A FIXED LIMIT; UC-005; UC-007; UC-019
// given: the Prepared value above with the limit 5, and one with the limit 3
// input: runPanel for each
// expect: one statement of the limit in each, naming correction rounds and the number
test("runPanel — the limit of correction rounds fixed for the job", () => {
  for (const limit of [5, 3]) {
    const [statement, ...more] = byClass(panel(prepared({ limit })), "limit");
    assert.equal(more.length, 0);
    assert.match(said(statement), /round/i);
    assert.match(said(statement), new RegExp(`\\b${limit}\\b`));
  }
});

// ---------------------------------------------------------------- the decision

// TST-472853 · level: unit · module: MOD-site-frame
// guards: ONE CLICK PER DECISION; THE PAGE NAMES WHERE IT SENDS; UC-005
// given: the Prepared value above, a handler onRun that counts its calls
// input: runPanel, nothing pressed; then Run pressed twice
// expect: nothing sent before the press; after it onRun called once, the second press calling nothing; the Run button disabled
test("runPanel — pressing Run calls onRun once, and not before", async () => {
  let calls = 0;
  const element = panel(prepared(), { onRun: async () => { calls += 1; } });
  const run = buttonNamed(element, "Run");
  assert.equal(calls, 0, "nothing is sent before Run is pressed");
  assert.equal(run.hasAttribute("disabled"), false);

  run.dispatchEvent(Object.defineProperty(new Event("click"), "isTrusted", { value: true }));
  run.dispatchEvent(Object.defineProperty(new Event("click"), "isTrusted", { value: true }));
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(calls, 1);
  assert.equal(run.hasAttribute("disabled"), true);
});

// TST-680208 · level: unit · module: MOD-site-frame
// guards: THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK; ONE CLICK PER DECISION
// given: the Prepared value above, a handler onRun that counts its calls
// input: a click a script makes (isTrusted false) on Run; then the person's click
// expect: after the script's click onRun is not called and Run is not disabled; after the person's click it is called once
test("runPanel — counter-proof: a click a script makes on Run calls nothing", async () => {
  let calls = 0;
  const run = buttonNamed(panel(prepared(), { onRun: async () => { calls += 1; } }), "Run");
  run.dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 0, "onRun is not called");
  assert.equal(run.hasAttribute("disabled"), false, "Run stays pressable");
  run.dispatchEvent(Object.defineProperty(new Event("click"), "isTrusted", { value: true }));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1, "the person's click calls it");
});

// TST-472854 · level: unit · module: MOD-site-frame
// guards: ONE CLICK PER DECISION; UC-019
// given: the Prepared value above; handlers with and without onCancel
// input: runPanel for each; Cancel pressed where it is offered
// expect: no Cancel button without onCancel; with it a Cancel button that calls onCancel once and does not call onRun
test("runPanel — Cancel is offered only with onCancel, and calls it", () => {
  let cancelled = 0, ran = 0;
  assert.equal(buttonNamed(runPanel(prepared(), { onRun: async () => { ran += 1; } }), "Cancel"), null);

  const element = runPanel(prepared(), { onRun: async () => { ran += 1; }, onCancel: () => { cancelled += 1; } });
  buttonNamed(element, "Cancel").dispatchEvent(new Event("click"));

  assert.equal(cancelled, 1);
  assert.equal(ran, 0);
});

// ---------------------------------------------------------------- text is shown as text

// TST-472855 · level: unit · module: MOD-site-frame
// guards: THE PAGE NAMES WHERE IT SENDS
// given: a Prepared value whose participant, part, left-out reason and finding hold markup
// input: runPanel
// expect: the text is shown as it is written and the panel holds no element the text made: no <b>, <img> or <script>
test("runPanel — the texts of the Prepared value are shown as text, never as markup", () => {
  const hostile = '<img src=x onerror="alert(1)"><b>bold</b><script>1</script>';
  const bad = { ...drafter, name: hostile };
  const element = panel(prepared({ drafter: bad, parts: [part(hostile, 10)],
    destinations: [{ participant: bad, role: "drafter", place: hostile, parts: [hostile], size: 10 }], reviewers: [],
    leftOut: [{ part: hostile, reason: hostile }], blocking: [finding("error", hostile, hostile, "A PARTICIPANT DECLARES ITS CAPABILITIES")] }));

  assert.ok(said(element).includes(hostile), said(element));
  assert.equal(elements(element, (e) => ["b", "img", "script"].includes(e.localName)).length, 0);
});
