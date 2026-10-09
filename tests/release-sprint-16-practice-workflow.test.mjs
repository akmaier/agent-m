// ITM-281's independent release guard.  The public dashboard caller is the existing
// routes.process(app); its older generic adapter is generation input, not this test's subject.
//
// Module: MOD-product-process; MOD-implementation-pages; MOD-model-catalogue
// Guards: UC-002; THE MODEL DETERMINES THE PHASES AND THE GATES; A PRACTICE IS NOT A MODEL;
//         A PROCESS REQUIREMENT ADDS TO THE MODEL; A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
// Level: release
//
// Input/precondition/expected are declared beside the case below.  The imported component
// test installs the repository's established small browser DOM; it remains the known-positive
// public-caller fixture and is not changed here.
// Counter-proof: in this worktree, temporarily changing
// src/product-process/workflow.mjs kindOf from `produced.replace(EXPLAINED, "").trim()` to
// `produced.trim()` made this case fail at `expectedPracticeWorkflow`: expected
// `Evidence review (Evidence keeper) → TST`, actual retaining `TST (review evidence)`.  Restoring
// that source line byte-for-byte makes the case pass.  The fault is not committed.
// Boundary counter-proof: changing additionsTable's non-table-line `break` to `continue` made the
// phase collection retain three rows from the later Roles table (`Name`, `---`, `Evidence keeper`)
// and fail its exact collection assertion.  Restoring `break` makes the case pass.  That source
// fault is not committed.

import "./dashboard-process-view.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { repoServer, settle, TOKEN } from "./app-harness.mjs";
import { routes } from "../docs/assets/dashboard/process-view.mjs";

const INSTANCE = "fixture/instance";
const PRODUCT = "fixture/product";
const VERSION = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678";
const PRACTICE_PATH = "src/model-catalogue/practices/devops.md";

const PARTICIPANTS = `# Participants

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| alice | person | — | — | — | read the repository, write to the repository | — | account |
`;

const SPEC = `# Fixture specification

## Process

**RECORD EVIDENCE** *(SRC-fixture)*
The review records evidence.
*Check:* no automatic check.
`;

const DECLARATION = `---
model: scrum
model_file: src/model-catalogue/models/scrum.md
model_version: ${VERSION}
---
# How this product is developed

## Roles

| Role | Participants |
|---|---|
| Product Owner | alice |

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold; no condition is added.

## Gates added by requirements

| Requirement | Between | Artifacts | Condition | Decider |
|---|---|---|---|---|
| RECORD EVIDENCE | Development → Sprint Review | evidence record | evidence is retained | Product Owner |
`;

// The tables are deliberately bare inside ## Adds.  Only their exact headers are workflow
// data; surrounding explanation is displayed as practice prose but never becomes a workflow row.
const PRACTICE = `---
name: devops
fits:
  - scrum
  - kanban
---
# DevOps

## Adds

This explanation is not a workflow phase or gate.

| Name | Role | Produces |
|---|---|---|
| Evidence review | Evidence keeper | TST (review evidence) |

The next table is a gate, not a continuation of the phase table.

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Evidence review | evidence TST | evidence is reviewed | Product Owner |

| Name | Filled by | Capabilities |
|---|---|---|
| Evidence keeper | either | read the repository |

## What it is

Fixture practice.
`;

const h = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const turn = () => new Promise((resolve) => setImmediate(resolve));
const elements = (root, match) => {
  const found = [];
  (function walk(node) { for (const child of node.childNodes) if (child.nodeType === 1) { if (match(child)) found.push(child); walk(child); } })(root);
  return found;
};
const text = (node) => node.textContent.replace(/\s+/g, " ").trim();
const byData = (root, name, value) => elements(root, (node) => node.getAttribute(name) === value);
const buttons = (root) => elements(root, (node) => node.localName === "button");
const area = (root, heading) => elements(byData(root, "data-section", heading)[0], (node) => node.localName === "textarea")[0];
const save = (root) => buttons(root).filter((button) => text(button) === "Save").at(-1);
const shown = (root) => elements(root, (node) => ["li", "p"].includes(node.localName)).map(text);

async function open(t, practice) {
  const instance = await repoServer({ repo: INSTANCE, files: {
    "docs/participants.md": PARTICIPANTS, "SPEC.md": SPEC, [PRACTICE_PATH]: practice,
  } });
  const product = await repoServer({ repo: PRODUCT, files: { "docs/process.md": DECLARATION }, handlers: [
    (url, init) => (url.pathname.includes(`/${INSTANCE}`) ? instance.fetch(url, init) : undefined),
  ] });
  globalThis.fetch = product.fetch;
  const target = globalThis.document.createElement("div");
  globalThis.document.body.append(target);
  t.after(() => target.remove());
  await routes.process({ T: { instance: INSTANCE, product: { address: `https://github.com/${PRODUCT}` } },
    ghToken: () => TOKEN, token: () => TOKEN, main: () => target, h });
  await turn();
  return { target, product };
}

async function choosePractice(target, name) {
  const field = area(target, "## Practices");
  field.value = `\n- ${name}\n`;
  field.dispatchEvent(new Event("input"));
  await turn();
}

function expectedPracticeWorkflow(target) {
  const entries = shown(target);
  const phaseList = elements(target, (node) => node.className.split(" ").includes("phases"))[0];
  assert.deepEqual(phaseList.children.map(text), [
    "Sprint Planning (Product Owner) → ITM",
    "Development (Developers) → MOD, TST",
    "Sprint Review (Product Owner) → sprint record",
    "Sprint Retrospective (Scrum Master) → sprint record",
    "Evidence review (Evidence keeper) → TST",
  ], "the selected practice adds exactly one phase; the following gate and role tables add none");
  assert.ok(entries.some((entry) => entry === "Evidence review (Evidence keeper) → TST"),
    "the bare phase table contributes its phase and strips the artifact explanation");
  assert.ok(entries.some((entry) => entry.includes("Development → Evidence review: evidence TST — evidence is reviewed")
    && entry.includes("practice: devops")), "the bare gate table contributes the selected practice gate");
  const role = byData(target, "data-role", "Evidence keeper")[0];
  assert.ok(role && text(role).includes("Evidence keeper (either)") && text(role).includes("read the repository"),
    "the bare role table contributes only its role");
  assert.ok(entries.some((entry) => entry.includes("RECORD EVIDENCE") && entry.includes("SRC-fixture")),
    "the process-requirement gate retains its requirement and source attribution");
}

// given: an existing Scrum declaration, a requirement-added gate, and the selected DevOps document above;
// input: through the dashboard's public process caller, select DevOps, deselect it before Save, then Save once;
// expect: its three bare tables add only their phase/gate/role while selected — exactly the four Scrum phases plus
//         Evidence review, never the following gate or role rows; explanatory prose creates no workflow row;
//         deselection removes those additions before any write; the one Save preserves the final declaration.
test("ITM-281 — public process caller derives and clears only selected practice tables before one Save", async (t) => {
  const page = await open(t, PRACTICE);
  assert.ok(!shown(page.target).some((entry) => entry.includes("practice: devops")), "known positive: no practice is selected initially");
  await choosePractice(page.target, "devops");
  expectedPracticeWorkflow(page.target);
  const phasePanel = elements(page.target, (node) => node.className.split(" ").includes("phases-panel"))[0];
  assert.ok(!elements(phasePanel, (node) => node.localName === "li").some((node) => text(node).includes("This explanation is not a workflow phase or gate.")),
    "prose is not derived as a workflow entry");

  await choosePractice(page.target, "none");
  assert.ok(!shown(page.target).some((entry) => entry.includes("practice: devops") || entry.includes("Evidence review (Evidence keeper)")),
    "deselecting clears practice-derived workflow state before Save");
  save(page.target).dispatchEvent(new Event("click"));
  await settle(page.product);
  assert.match(page.product.files["docs/process.md"], /## Practices\n\n- none/, "one Save preserves the final deselected practice");
});
