// MOD-implementation-pages' route `process` — five of the gaps ITM-223's system and release tests of UC-002 found missing
// (ITM-223-F1 to ITM-223-F5; F6, the missing capability's link to the participants, stands on the Roles page, UC-048 3b,
// and is tested with it in tests/dashboard-roles.test.mjs; F7 is ITM-241's, on MOD-site-frame, and F8 and where the process
// requirements stand are change requests to akmaier — none of the three is built here, per the backlog commit that split
// the findings):
// - F1: the table that keeps the process model and the rules to be met apart opens unfolded the first time this route's
//   module renders, and folded at every later opening — kept in memory only, never the browser's storage, so it is no
//   setting (step 1);
// - F2: the model's transitions and its verification pairs, beside its phases and gates (step 5);
// - F3: beside a branch, the model's own gate at its end — the gate that leaves a phase, or, for the sprint, the gate
//   back to the model's first phase (step 5);
// - F4: for each practice, what it adds, read from the practice's file in the instance's snapshot with the catalogue's
//   practice schema, beside the models it fits (step 6);
// - F5: for a gate a process requirement adds, the two phases it stands between (step 7, 7b).
//
// Run: node --test tests/implementation-pages-uc-002-findings.test.mjs
//
// Module: MOD-implementation-pages
// Guards: UC-002; THE MODEL DETERMINES THE PHASES AND THE GATES; A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; A PRACTICE IS NOT A MODEL; A PROCESS REQUIREMENT ADDS TO THE MODEL
// Level: unit
//
// Each test names the requirement it guards and states its given, its input and its expected result before it runs.
// Node has no DOM: this file takes the small one of tests/site-frame-dom.mjs,
// so that schemaForm, its editors and explain run as they do in a
// browser. Nothing waits but the turn of the event loop, and nothing reaches the network: the repositories the route reads
// are fixtures held in memory, through a Host of this file's own that answers MOD-repository-hosts' interface.
//
// The F1 test is the first test of this file and the only one that depends on definition order: the route module's own
// "shown before" flag (F1) is a plain module-level variable, shared by every test of this one file (one module instance
// per test file, as node --test loads it), and every other test here renders the page without caring whether that one
// table is folded or open. Placing the F1 test first keeps its own first render the very first render of the whole file.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// The document is that of the frame's fixture DOM, tests/site-frame-dom.mjs, installed as the globals `document` and `window` when it is imported.
import "./site-frame-dom.mjs";

// The modules, loaded once the document is there. MOD-implementation-pages' route `process` is exercised through its
// Route; every other module is used as the route itself uses it.
const { route } = await import("../src/implementation-pages/process.mjs");

// ---------------------------------------------------------------- helpers: the DOM of a schemaForm, and a fixture repository
//
// Copied from tests/implementation-pages.test.mjs, trimmed to what this file's six tests use.

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const byClass = (root, name) => elements(root, (e) => e.className.split(" ").includes(name));

const sha1 = (text) => createHash("sha1").update(text).digest("hex");

// A Snapshot of MOD-repository-hosts, over a fixed map of path -> text.
function fakeSnapshot(files, commit) {
  return {
    repository: { server: "github", origin: "https://github.com", path: "fixture/repo", web: "https://github.com/fixture/repo" },
    ref: "main", commit, paths: Object.keys(files),
    async read(path) { return Object.hasOwn(files, path) ? files[path] : null; },
    blob(path) { return Object.hasOwn(files, path) ? sha1(`blob:${path}:${files[path]}`) : null; },
  };
}

// A Host of MOD-repository-hosts over a fixture repository held in memory: readSnapshot and repositoryInfo, which is all
// this file's reads call — none of these six tests saves.
function fakeHost(files, commit) {
  const current = fakeSnapshot(files, commit);
  return {
    async repositoryInfo() { return { defaultBranch: "main", visibility: "public", canWrite: true, archived: false, description: "" }; },
    async readSnapshot() { return current; },
  };
}

// ---------------------------------------------------------------- the fixture repositories: an instance and a product

const INSTANCE_COMMIT = sha1("itm-240-fixture-instance-head");

const PARTICIPANTS = `# Participants of this instance

Fixture participants for a test.

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| alice | person | — | — | — | draft text, write to the repository, run code and tests | — | account github/alice |
| bot-a | CI agent | fixture-endpoint | — | — | write to the repository, run code and tests | a lab | ci hosted secret BOT_A |
`;

// A fixture model with a "back" transition and two of its own gates — Build → Review and Review → Design — so that a
// branch given to a phase (Build) and a branch given to the sprint (whose end is the gate back to the first phase,
// Design) each have a model's own gate to show (F3), and so that there is a non-empty verification pair and more than
// one transition to show (F2). "pulled", with a time box and no WIP limit, as the book's Scrum is (MOD-model-catalogue's
// model.schema.md: a pulled model needs exactly one of the two).
const FIXTURE_MODEL_PATH = "docs/process-models/fixture-sprint-model.md";
const FIXTURE_MODEL = `---
name: fixture-sprint-model
kind: pulled
measure: remaining items per time box
---
# Fixture sprint model

## Phases

| Name | Role | Produces |
|---|---|---|
| Design | Owner | ARC |
| Build | Developers | ITM |
| Review | Owner | sprint record |

## Transitions

| From | To | Kind |
|---|---|---|
| Design | Build | sequence |
| Build | Review | sequence |
| Review | Design | back |

## Verification pairs

| Phase | Checked by |
|---|---|
| Build | Review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Build → Review | ITM | every item meets its acceptance criteria | Owner |
| Review → Design | sprint record | the retrospective names an improvement | Owner |

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | draft text |
| Developers | either | several | write to the repository, run code and tests |
| Reviewer | either | several | use tools |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | — |
| Time box | 1 week |
| Sprints | yes |
`;

// One fixture requirement, as the instance's SPEC.md — the process requirement F5's gate is added by.
const SPEC_TEXT = `# SPEC

## 1. Fixture

**A FIXTURE REQUIREMENT** *(PO Fixture)*
Fixture text for a test.
*Check:* no automatic check.
`;

// An instance snapshot with the participants, the fixture model and the instance's SPEC — and, when `practiceAdds` is
// given, a fixture body for the shipped practice devops at the path the catalogue reads it from (F4): the real file's
// name and fits come from MOD-model-catalogue's own shipped copy regardless of this fixture (it loads its shipped
// models and practices from its own files, not from the instance snapshot), but what it adds is read, by this item's
// Outcome, from the practice's file in the instance's snapshot — this fixture instance's own copy of it.
function instanceFiles({ practiceAdds } = {}) {
  const files = { "docs/participants.md": PARTICIPANTS, [FIXTURE_MODEL_PATH]: FIXTURE_MODEL, "SPEC.md": SPEC_TEXT };
  if (practiceAdds) {
    files["src/model-catalogue/practices/devops.md"] = `---
name: devops
fits:
  - scrum
  - kanban
---
# DevOps

## Adds

${practiceAdds}

## What it is

Fixture text.
`;
  }
  return files;
}

// A declaration text declaring fixture-sprint-model and naming no participant — enough for the roles, phases and gates
// panels to render, which `renderPanels` draws for a declared model —, with the given practices, rows under ## Branches
// and, when given, ## Gates added by requirements.
function declarationText({ practices = ["none"], branches = [], requirementGates = [] } = {}) {
  const branchRows = branches.map(({ at, branch }) => `| ${at} | ${branch} |`).join("\n");
  const requirementsSection = requirementGates.length
    ? `\n\n## Gates added by requirements\n\n| Requirement | Between | Artifacts | Condition | Decider |\n|---|---|---|---|---|\n${
      requirementGates.map(({ requirement, between, artifacts, condition, decider }) =>
        `| ${requirement} | ${between} | ${artifacts} | ${condition} | ${decider} |`).join("\n")}`
    : "";
  return `---
model: fixture-sprint-model
model_file: ${FIXTURE_MODEL_PATH}
model_version: ${INSTANCE_COMMIT}
---
# How the fixture product is developed

## Practices

${practices.map((practice) => `- ${practice}`).join("\n")}

## Branches

| Phase or time box | Branch |
|---|---|
${branchRows}

## Definition of Done

The job rules hold; no condition is added.${requirementsSection}
`;
}

// A ViewContext of MOD-site-frame over two fake hosts: the instance's and the product's.
function contextOf(instanceHost, productHost) {
  return {
    page: "review",
    instance: { repository: "fixture/instance", host: instanceHost },
    product: { address: "fixture/product", kind: "github", host: productHost },
    store: { async get() { return null; }, async set() {} },
    go() {},
  };
}

// A target connected to the document, as a route's render expects, removed after the test.
function connectedTarget() {
  const target = document.createElement("div");
  document.body.append(target);
  return target;
}


// ---------------------------------------------------------------- F1: the table opens unfolded the first time, folded later

// TST-472260 · level: unit · module: MOD-implementation-pages
// guards: UC-002 (step 1: the page opens with the table of the process model and the rules to be met, unfolded after the first reading, folded at every later one; ITM-223-F1)
// given: a product without a declaration; this is this test file's first render of the route
// input: route.render, twice, over two fresh targets of the same page
// expect: the "What is this?" holding that table is open on the first render, and folded (no open attribute) on the second — a plain module-level flag, in memory only, never written to any store
test("process route — the process-model-vs-rules table opens unfolded the first time this module renders, folded at every later opening (F1)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({}, sha1("f1-product-head"));

  const first = connectedTarget();
  await route.render(first, contextOf(instanceHost, productHost));
  const firstTable = byClass(first, "process-vs-rules")[0];
  assert.ok(firstTable, "known positive: the process-vs-rules explanation is on the page");
  const firstDetails = byTag(firstTable, "details")[0];
  assert.ok(firstDetails, "known positive: it is a folded What is this?");
  assert.equal(firstDetails.hasAttribute("open"), true, "unfolded on this module's first render");
  first.remove();

  const second = connectedTarget();
  await route.render(second, contextOf(instanceHost, productHost));
  const secondDetails = byTag(byClass(second, "process-vs-rules")[0], "details")[0];
  assert.equal(secondDetails.hasAttribute("open"), false, "folded at the later opening");
  second.remove();
});

// ---------------------------------------------------------------- F2: transitions and verification pairs

// TST-472261 · level: unit · module: MOD-implementation-pages
// guards: THE MODEL DETERMINES THE PHASES AND THE GATES; UC-002 (step 5: the workflow shows the model's transitions and its verification pairs, beside its phases and gates; ITM-223-F2)
// given: fixture-sprint-model declared, whose transitions include a "back" one and whose verification pairs name Build checked by Review
// input: route.render(target, context)
// expect: the phases panel names every transition, From, To and its kind, and the verification pair Build/Review
test("process route — the phases panel shows the model's transitions and its verification pairs (F2)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("f2-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const phasesPanel = byClass(target, "phases-panel")[0];
  assert.ok(phasesPanel, "known positive: the phases panel is shown");
  const transitionsEl = byClass(phasesPanel, "transitions")[0];
  assert.ok(transitionsEl, "known positive: a transitions list is shown");
  const transitions = transitionsEl.textContent;
  assert.match(transitions, /Design[^A-Za-z]+Build[^A-Za-z]+sequence/s, "the transition Design to Build, sequence");
  assert.match(transitions, /Review[^A-Za-z]+Design[^A-Za-z]+back/s, "the transition Review to Design, back");
  const pairsEl = byClass(phasesPanel, "verification-pairs")[0];
  assert.ok(pairsEl, "known positive: a verification-pairs list is shown");
  const pairs = pairsEl.textContent;
  assert.match(pairs, /Build/, "the verification pair names the checked phase, Build");
  assert.match(pairs, /Review/, "the verification pair names the phase that checks it, Review");

  target.remove();
});

// ---------------------------------------------------------------- F3: beside a branch, the gate at its end

// TST-472262 · level: unit · module: MOD-implementation-pages
// guards: A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN; UC-002 (step 5: beside a branch, the model's gate at its end — for a phase, the gate that leaves it; for the sprint, the gate back to the model's first phase; ITM-223-F3)
// given: fixture-sprint-model declared, Build given a branch of its own and the sprint given one too (two branch rows)
// input: route.render(target, context)
// expect: Build's branch line also shows Build's own gate, Build → Review; the sprint's branch line shows the gate back to the model's first phase, Review → Design
test("process route — beside a branch, the model's own gate at its end is shown (F3)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({
    branches: [{ at: "Build", branch: "feature/build" }, { at: "Sprint", branch: "sprint/07" }],
  }) }, sha1("f3-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const branches = byClass(target, "branches")[0];
  assert.ok(branches, "known positive: the branches list is shown");
  const items = byTag(branches, "li").map((li) => li.textContent);
  const buildLine = items.find((text) => text.startsWith("Build:"));
  const sprintLine = items.find((text) => text.startsWith("Sprint:"));
  assert.ok(buildLine, "known positive: Build's branch line is shown");
  assert.ok(sprintLine, "known positive: the sprint's branch line is shown");
  assert.match(buildLine, /Build[^A-Za-z]+Review/s, "Build's own gate, which leaves it: Build → Review");
  assert.match(sprintLine, /Review[^A-Za-z]+Design/s, "the gate back to the first phase: Review → Design");

  target.remove();
});

// ---------------------------------------------------------------- F4: a practice's own "what it adds"

// TST-472263 · level: unit · module: MOD-implementation-pages
// guards: A PRACTICE IS NOT A MODEL; UC-002 (step 6: each practice is shown with what it adds, beside the models it fits; ITM-223-F4)
// given: the shipped practice devops (fits: scrum, kanban, from MOD-model-catalogue's own copy), whose file in the instance's snapshot holds a fixture "## Adds"
// input: route.render(target, context), fixture-sprint-model declared
// expect: the practices panel names devops beside the models it fits, and the fixture text of its "## Adds"
test("process route — each practice is shown with what it adds, beside the models it fits (F4)", async () => {
  const instanceHost = fakeHost(instanceFiles({ practiceAdds: "- fixture addition: a continuous pipeline" }), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText() }, sha1("f4-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const practicesPanel = byClass(target, "practices-panel")[0];
  assert.ok(practicesPanel, "known positive: the practices panel is shown");
  assert.match(practicesPanel.textContent, /devops/, "known positive: devops is listed");
  assert.match(practicesPanel.textContent, /scrum/, "known positive: the models it fits are named");
  assert.match(practicesPanel.textContent, /fixture addition: a continuous pipeline/, "what it adds is shown");

  target.remove();
});

// TST-472264 · level: unit · module: MOD-implementation-pages
// guards: UC-002; THE MODEL DETERMINES THE PHASES AND THE GATES; A PRACTICE IS NOT A MODEL; A PROCESS REQUIREMENT ADDS TO THE MODEL; MOD-implementation-pages
// given: the same instance snapshot holds the selected devops practice with explicit model-table additions and a product declaration selecting it; a second declaration names no practice
// input: route.render for each controlled snapshot
// expect: only the selected declaration's workflow shows the practice phase, its produced artifact kind, role and marked gate; the model's own gates remain and the unselected declaration shows none of the practice additions
test("process route — selected tabled practice additions enter the workflow and disappear when the selection changes", async () => {
  const practiceAdds = `### Phases

| Name | Role | Produces |
|---|---|---|
| Evidence review | Evidence keeper | TST |

### Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Evidence review | evidence TST | evidence is reviewed | Owner |

### Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Evidence keeper | either | several | read the repository |`;
  const instanceHost = fakeHost(instanceFiles({ practiceAdds }), INSTANCE_COMMIT);
  const selectedHost = fakeHost({ "docs/process.md": declarationText({ practices: ["devops"] }) },
    sha1("practice-selected"));
  const selectedTarget = connectedTarget();

  await route.render(selectedTarget, contextOf(instanceHost, selectedHost));

  const selected = byClass(selectedTarget, "workflow-extra")[0].textContent;
  assert.match(selected, /Evidence review/, "the selected practice phase is in the workflow");
  assert.match(selected, /Evidence keeper/, "the selected practice role is in the workflow");
  assert.match(selected, /evidence TST/, "the phase's artifact addition is in the workflow");
  assert.match(selected, /practice: devops/, "the practice gate is marked distinctly");
  assert.match(selected, /Design → Build/, "the model's own gate remains");
  selectedTarget.remove();

  const unselectedHost = fakeHost({ "docs/process.md": declarationText() }, sha1("practice-unselected"));
  const unselectedTarget = connectedTarget();
  await route.render(unselectedTarget, contextOf(instanceHost, unselectedHost));
  assert.doesNotMatch(byClass(unselectedTarget, "phases-panel")[0].textContent, /Evidence review/,
    "a practice absent from the declaration adds nothing");
  unselectedTarget.remove();
});

// ---------------------------------------------------------------- F5: a process requirement's gate, the phases it stands between

// TST-472265 · level: unit · module: MOD-implementation-pages
// guards: A PROCESS REQUIREMENT ADDS TO THE MODEL; UC-002 (step 7, 7b: for a gate a process requirement adds, the two phases it stands between; ITM-223-F5)
// given: fixture-sprint-model declared, its declaration adding a gate for A FIXTURE REQUIREMENT between Design and Build — a pair the model's own gates do not use, so it is unambiguous
// input: route.render(target, context)
// expect: the process-requirements panel names the requirement and both phases, Design and Build
test("process route — a gate a process requirement adds is shown with the two phases it stands between (F5)", async () => {
  const instanceHost = fakeHost(instanceFiles(), INSTANCE_COMMIT);
  const productHost = fakeHost({ "docs/process.md": declarationText({
    requirementGates: [{ requirement: "A FIXTURE REQUIREMENT", between: "Design → Build", artifacts: "TST", condition: "documented", decider: "Owner" }],
  }) }, sha1("f5-product-head"));
  const target = connectedTarget();

  await route.render(target, contextOf(instanceHost, productHost));

  const panel = byClass(target, "process-requirements")[0];
  assert.ok(panel, "known positive: the process-requirements panel is shown");
  assert.match(panel.textContent, /A FIXTURE REQUIREMENT/, "known positive: the requirement is named");
  assert.match(panel.textContent, /Design[^A-Za-z]+Build/s, "the two phases the gate stands between");

  target.remove();
});
