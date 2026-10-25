// Release tests of sprint 02, strand B — backlog items and the order they are listed in, sprints, item states, the work-in-progress limit and the
// sprint's selection (ITM-143, testing ITM-033 and ITM-034). Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented nothing of the strand, from the SPEC rules, UC-032 and UC-033 alone; started on sprint/02 at
// 58b7fe4, 2026-10-01. They ask MOD-work-plans — backlogFindings, itemStates, heldItems and startable — over items read with
// MOD-documents' item schema.
//
// Module: MOD-work-plans
// Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES WHAT IT REALISES; EVERY ARTIFACT NAMES ITS ORIGIN; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; AGILE IMPLEMENTATION STARTS FROM THE BACKLOG; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032; UC-033
// Level: release
//
// Two kinds of input. This very repository's backlog as it was while sprint 02 ran (the copy
// tests/fixtures/sprint-02-running/docs/backlog/, from sprint/02 at 87b3268; the live backlog changes at every close), and its
// docs/use-cases/, read with fs because there are more of them than a command line holds; Agent M's own SPEC.md is not read
// (its requirement names are not needed: an item's realises is checked for its form). And fixtures written from the use cases,
// in the item schema: an item that realises nothing, items that build on each other, a Scrum product with limit 2, a Kanban
// product. The backlog keeps no order of its own (UC-032): its items are listed each after the items they build on.
// Whether a start is allowed is read as startable says it: { startable: true }, or the reasons, each a sentence. Each
// expectation is stated before its case runs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { artifactSchemas, documentFindings, readDocument } from "../src/documents/index.mjs";
import { roleAssignmentSchema } from "../src/product-process/index.mjs";
import { backlogFindings, heldItems, itemStates, planSchemas, startable } from "../src/work-plans/index.mjs";

const ROOT = new URL("../", import.meta.url);
// docs/backlog/ as it was while sprint 02 ran (sprint/02 at 87b3268), not the live one.
const FROZEN = new URL("tests/fixtures/sprint-02-running/", ROOT);
const ITEM = artifactSchemas().item;

const LIVES = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
const NAMES = "A BACKLOG ITEM NAMES WHAT IT REALISES";

// This repository's backlog while sprint 02 ran: every docs/backlog/ITM-<nnn>-<slug>.md of the frozen copy, read with fs.
const ITEM_FILES = readdirSync(new URL("docs/backlog/", FROZEN)).filter((f) => /^ITM-\d{3}-.+\.md$/.test(f)).sort()
  .map((f) => `docs/backlog/${f}`);
const ITEMS = ITEM_FILES.map((p) => readDocument(ITEM, p, readFileSync(new URL(p, FROZEN), "utf8")));
const USE_CASES = readdirSync(new URL("docs/use-cases/", ROOT)).map((f) => /^(UC-\d{3})-/.exec(f)?.[1]).filter(Boolean);

// An item of the item schema, ITM-900 by default, with the front matter lines given in place of the defaults.
function itemText({ id = "ITM-900", title = "Export a thesis as PDF", realises = ["EXPORT IS A PDF"], buildsOn = [],
  origin = ["sprint 03 planning"], extra = [] } = {}) {
  const list = (key, values) => (values.length ? [`${key}:`, ...values.map((v) => `  - ${v}`)] : [`${key}: []`]);
  return ["---", `id: ${id}`, `title: ${title}`, "level: module", ...list("realises", realises), "modules:", "  - MOD-export",
    ...list("builds_on", buildsOn), "tests:", "  - unit", ...list("origin", origin), ...extra, "---", `# ${id} ${title}`, "",
    "## Outcome", "", "The thesis is exported as one PDF.", "", "## Acceptance", "", "- a PDF.", ""].join("\n");
}
const itemOf = (options = {}) => {
  const id = options.id ?? "ITM-900";
  return readDocument(ITEM, `docs/backlog/${id}-export-a-thesis-as-pdf.md`, itemText(options));
};
const ARCHITECTURE = [{ kind: "module", path: "docs/architecture/MOD-export.md", id: "MOD-export", fields: { id: "MOD-export" }, sections: [] }];
const statusesOf = (names) => new Map(names.map((id) => [id, { id, kind: /^UC-/.test(id) ? "use-case" : "requirement", status: "accepted" }]));
const facts = (accepted, pullRequests = []) => ({ statuses: statusesOf(accepted), queues: [], jobs: [], pullRequests, gates: [], workflow: null });
const stateOf = (states, id) => states.find((s) => s.item === id);

// ---------------------------------------------------------------- ITM-033: items and their order

// THE BACKLOG LIVES IN THE PRODUCT REPOSITORY · A BACKLOG ITEM NAMES WHAT IT REALISES · EVERY ARTIFACT NAMES ITS ORIGIN — this
// backlog. Expected: every item file under docs/backlog/ is read with its identifier (the one of its file name), a title, at
// least one requirement or use case under realises, without an error of A BACKLOG ITEM NAMES WHAT IT REALISES, and an origin;
// every use case it names is one of docs/use-cases/.
test("release · work items: this backlog is read — each item names what it realises and where it came from", () => {
  assert.ok(ITEMS.length >= 100, `the backlog has its items (${ITEMS.length})`);
  for (const item of ITEMS) {
    const id = /^docs\/backlog\/(ITM-\d{3})-/.exec(item.path)[1];
    assert.equal(item.id, id, `${item.path}: its identifier`);
    assert.ok(item.fields.title, `${item.path}: a title`);
    assert.ok(item.fields.realises?.length >= 1, `${item.path}: realises something`);
    assert.ok(item.fields.origin, `${item.path}: names its origin`);
    const errors = documentFindings(ITEM, item).filter((f) => f.kind === "error" && f.rule === NAMES);
    assert.deepEqual(errors, [], `${item.path}: what it realises is a requirement or a use case`);
    for (const uc of item.fields.realises.filter((n) => /^UC-/.test(n))) assert.ok(USE_CASES.includes(uc), `${item.path}: ${uc} exists`);
  }
  assert.deepEqual(backlogFindings(ITEMS, []).filter((f) => f.rule === NAMES), [], "no item realises nothing");
});

// A BACKLOG ITEM NAMES WHAT IT REALISES: "Every backlog item names at least one requirement or use case that it realises."
// UC-032 step 3: "Agent M rejects a draft that realises nothing". Expected: an item with an empty list, and one without the field,
// each carry an error naming the rule; the same item realising a requirement or a use case carries none.
test("release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not", () => {
  const nothing = itemOf({ realises: [] });
  assert.ok(backlogFindings([nothing], ARCHITECTURE).some((f) => f.kind === "error" && f.rule === NAMES), "realises: [] — an error");
  assert.ok(documentFindings(ITEM, nothing).some((f) => f.kind === "error" && f.rule === NAMES), "realises: [] — a form error");
  const missing = readDocument(ITEM, nothing.path, itemText({ realises: [] }).replace("realises: []\n", ""));
  assert.ok(backlogFindings([missing], ARCHITECTURE).some((f) => f.kind === "error" && f.rule === NAMES), "no realises — an error");
  for (const name of ["EXPORT IS A PDF", "UC-001"]) {
    const item = itemOf({ realises: [name] });
    assert.deepEqual(item.fields.realises, [name]);
    assert.deepEqual(backlogFindings([item], ARCHITECTURE), [], `realising ${name}: no finding`);
    assert.deepEqual(documentFindings(ITEM, item), [], `realising ${name}: no form error`);
  }
});

// A BACKLOG ITEM NAMES WHAT IT REALISES applies NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED to the backlog: a name that matches
// nothing the product has accepted realises nothing yet. Expected: an item naming an unknown requirement or an unknown use case
// waits for acceptance, naming it.
test("release · work items: an item naming a requirement or use case the product does not have waits for acceptance", () => {
  for (const name of ["EXPORT IS A WORD FILE", "UC-099"]) {
    const [state] = itemStates([itemOf({ realises: [name] })], null, facts(["EXPORT IS A PDF", "UC-001"]));
    assert.equal(state.state, "waiting for acceptance", name);
    assert.match(state.reason, new RegExp(name), name);
  }
});

// UC-032 step 3: Agent M "flags a draft that restates an existing item" — a flag, not a rejection. Expected: a warning naming
// the existing item, and no error.
test("release · work items: an item that restates an existing one is flagged, not rejected", () => {
  const existing = itemOf({ id: "ITM-014" });
  const found = backlogFindings([itemOf(), existing], ARCHITECTURE).filter((f) => f.artifact === "ITM-900");
  assert.deepEqual(found.filter((f) => f.kind === "error"), []);
  assert.ok(found.some((f) => f.kind === "warning" && /ITM-014/.test(f.what)), "a warning that names ITM-014");
});

// THE BACKLOG LIVES IN THE PRODUCT REPOSITORY: "A product's backlog is kept as Markdown under docs/backlog/". UC-032 step 4:
// "one Markdown file per item under docs/backlog/, for example docs/backlog/ITM-014-export-thesis-as-pdf.md". Expected: an
// item file anywhere else, or not named ITM-<nnn>-<slug>.md, carries an error naming the rule; the same text under docs/backlog/
// does not.
test("release · work items: an item kept outside docs/backlog/ is an error", () => {
  const text = itemText();
  for (const path of ["backlog/ITM-900-export-a-thesis-as-pdf.md", "docs/ITM-900-export-a-thesis-as-pdf.md", "docs/backlog/export.md"]) {
    assert.ok(documentFindings(ITEM, readDocument(ITEM, path, text)).some((f) => f.kind === "error" && f.rule === LIVES), `${path}: an error`);
  }
  assert.deepEqual(documentFindings(ITEM, readDocument(ITEM, "docs/backlog/ITM-900-export-a-thesis-as-pdf.md", text)), []);
});

// The order the backlog is listed in (UC-032 step 1: "Agent M shows the items, each after the items it builds on"; the backlog
// keeps no order of its own). Expected: this backlog's every item exactly once; and of items that build on each other, every
// item it builds on that the backlog holds stands before it.
test("release · work items: a backlog is listed with every item once, each after the items it builds on", () => {
  const ids = ITEMS.map((i) => i.id);
  const order = itemStates(ITEMS, null, facts([])).map((s) => s.item);
  assert.equal(order.length, ids.length, "every item once");
  assert.deepEqual([...order].sort(), [...ids].sort(), "exactly the items of docs/backlog/");

  const items = [itemOf({ id: "ITM-001", buildsOn: ["ITM-004"] }), itemOf({ id: "ITM-002" }),
    itemOf({ id: "ITM-003", buildsOn: ["ITM-099"] }), itemOf({ id: "ITM-004", buildsOn: ["ITM-002"] })];
  const listed = itemStates(items, null, facts([])).map((s) => s.item);
  assert.deepEqual([...listed].sort(), ["ITM-001", "ITM-002", "ITM-003", "ITM-004"]);
  assert.ok(listed.indexOf("ITM-004") < listed.indexOf("ITM-001"), "ITM-004 before ITM-001");
  assert.ok(listed.indexOf("ITM-002") < listed.indexOf("ITM-004"), "ITM-002 before ITM-004");
});

// UC-033 step 5: "A bug item is ready. A change item is waiting for acceptance until every requirement it names is accepted
// (UC-006). It then becomes ready by itself, because its state is derived." Postcondition: "No implementation job can start for a
// change item before its specification change is accepted." Expected as written: an item realising the requirement the bug
// violates is ready; one realising the change's new requirement waits until it is accepted.
test("release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted", () => {
  const bug = itemOf({ id: "ITM-031", realises: ["EXPORT IS A PDF"], origin: ["https://github.com/alice/thesis-tool/issues/57"] });
  const change = itemOf({ id: "ITM-032", realises: ["EXPORT AS PDF/A"], origin: ["https://github.com/alice/thesis-tool/issues/57"] });
  let states = itemStates([bug, change], null, facts(["EXPORT IS A PDF"]));
  assert.equal(stateOf(states, "ITM-031").state, "ready");
  assert.equal(stateOf(states, "ITM-032").state, "waiting for acceptance");
  states = itemStates([bug, change], null, facts(["EXPORT IS A PDF", "EXPORT AS PDF/A"]));
  assert.equal(stateOf(states, "ITM-032").state, "ready");
});

// UC-033 postcondition "The backlog holds an item that names the issue as its origin" and 4a "The item then names both issues as
// origins": an item file read back. Expected: both addresses are its origins, and it has no finding.
test("release · work items: an item file naming two issues as its origin is read with both", () => {
  const origin = ["https://github.com/alice/thesis-tool/issues/57", "https://github.com/alice/thesis-tool/issues/61"];
  const item = itemOf({ origin });
  assert.deepEqual(item.fields.origin, origin);
  assert.deepEqual(documentFindings(ITEM, item), []);
  assert.deepEqual(backlogFindings([item], ARCHITECTURE), []);
});

// ---------------------------------------------------------------- ITM-034: states, limit, selection

// A Scrum product with a work-in-progress limit of 2 (the SPEC's check of NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT), its
// running sprint selecting four items, every requirement they realise accepted; and a Kanban product with limit 3. Its
// Developers are dev-a, a CLI agent with what the role needs.
const workflowWith = (flow) => ({
  model: { name: "fixture", kind: "pulled", flow },
  phases: [{ name: "Sprint planning", roles: ["Product Owner"], produces: ["ITM"] },
    { name: "Development", roles: ["Developers"], produces: ["MOD", "TST"] }],
  roles: [{ name: "Product Owner", filledBy: "person", howMany: "one", capabilities: ["read the repository"] },
    { name: "Developers", filledBy: "agent", howMany: "several", capabilities: ["read the repository", "write to the repository", "run code and tests"] }],
  gates: [],
});
const SCRUM = workflowWith({ wip: 2, timeBox: null, sprints: true });
const KANBAN = workflowWith({ wip: 3, timeBox: null, sprints: false });
const ASSIGNMENT = readDocument(roleAssignmentSchema, "docs/role-assignments/team.md",
  "# team\n\n## Roles\n\n| Role | Participants |\n|---|---|\n| Product Owner | alice |\n| Developers | dev-a |\n");
const PARTICIPANTS = [
  { name: "alice", type: "person", model: null, capabilities: ["read the repository"], place: null, route: "person" },
  { name: "dev-a", type: "CLI agent", model: "example-model", capabilities: ["read the repository", "write to the repository", "run code and tests"],
    place: "this machine", route: "bridge" },
];
const SPRINT = readDocument(planSchemas.sprint, "docs/backlog/sprints/team/03.md", ["---", "sprint: 3", "goal: Export",
  "start: 2026-10-01", "end:", "closer: alice", "branch: sprint/03", "selection:", "  - ITM-011", "  - ITM-012", "  - ITM-013",
  "  - ITM-014", "---", "# team Sprint 03", ""].join("\n"));
const BACKLOG = ["ITM-011", "ITM-012", "ITM-013", "ITM-014", "ITM-015"].map((id) => itemOf({ id, title: `Work ${id}` }));
const pr = (number, id, state) => ({ number, title: `${id}: work`, branch: `team/${id}`, base: "sprint/03", head: "a".repeat(40), state,
  draft: false, url: `https://github.com/alice/thesis-tool/pull/${number}`, opened: "2026-10-01T10:00:00Z",
  merged: state === "merged" ? "2026-10-01T12:00:00Z" : null, closed: state === "open" ? null : "2026-10-01T12:00:00Z" });
const ACCEPTED_NAMES = ["EXPORT IS A PDF"];

// startable for `item` in the product under `workflow`, with the backlog's states from the pull requests given.
function start(item, { workflow = SCRUM, sprint = SPRINT, items = BACKLOG, pullRequests = [], accepted = ACCEPTED_NAMES } = {}) {
  const states = itemStates(items, null, facts(accepted, pullRequests));
  const held = sprint ? heldItems([sprint], items, ARCHITECTURE, pullRequests) : [];
  return { states, verdict: startable(item, states, { workflow, assignment: ASSIGNMENT, sprint, held, wip: workflow.model.flow.wip,
    participants: PARTICIPANTS }) };
}
const reasonsOf = (verdict) => (verdict.startable ? [] : verdict.reasons);

// NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT: "With limit 2 and two items in progress, a third start is refused with the limit
// named. With one of the two done, the start succeeds." UC-032 7: "Items in Review count as in progress" — an open pull request is
// work waiting for review. Expected as written: the third item is ready, but a reason refuses its start, naming the limit 2 and
// the two items that hold it; with one of them merged, nothing refuses it.
test("release · work items: with limit 2 and two items in progress a third start is refused with the limit named", () => {
  const two = [pr(1, "ITM-011", "open"), pr(2, "ITM-012", "open")];
  const third = start("ITM-013", { pullRequests: two });
  assert.equal(stateOf(third.states, "ITM-011").state, "in progress", "an item with an open pull request — waiting for review — is in progress");
  assert.equal(stateOf(third.states, "ITM-013").state, "ready");
  assert.equal(third.verdict.startable, false, "the third start is refused");
  const limit = reasonsOf(third.verdict).find((r) => /work-in-progress limit of 2/.test(r));
  assert.ok(limit, "the refusal names the limit");
  assert.ok(/ITM-011/.test(limit) && /ITM-012/.test(limit), "and the items that hold it");

  const oneDone = [pr(1, "ITM-011", "merged"), pr(2, "ITM-012", "open")];
  const now = start("ITM-013", { pullRequests: oneDone });
  assert.equal(stateOf(now.states, "ITM-011").state, "done");
  assert.deepEqual(now.verdict, { startable: true }, "with one of the two done, the start succeeds");
});

// A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT: "implementation jobs start only for items selected for the current sprint".
// UC-032 6a: an item added during a running sprint goes to the backlog, not into the sprint. Expected: an item of the backlog that
// the running sprint does not select is refused, the reason naming it; a selected one is not. Without a running sprint, no item
// starts.
test("release · work items: an item outside the running sprint's selection is refused", () => {
  const outside = start("ITM-015");
  assert.equal(stateOf(outside.states, "ITM-015").state, "ready", "accepted and not started: ready");
  assert.equal(outside.verdict.startable, false, "but its start is refused");
  assert.ok(reasonsOf(outside.verdict).some((r) => /ITM-015 is not selected/.test(r)), "because the sprint does not select it");
  assert.deepEqual(start("ITM-014").verdict, { startable: true }, "a selected item starts");
  assert.ok(reasonsOf(start("ITM-014", { sprint: null }).verdict).some((r) => /No sprint/.test(r)), "no sprint running: refused");
});

// AGILE IMPLEMENTATION STARTS FROM THE BACKLOG: "Starting an implementation job without an item is refused for a Scrum and a
// Kanban fixture." Expected: for both, the start without an item is refused; in Kanban, which has no sprints, a backlog item
// below the limit starts, and one that is not in the backlog does not.
test("release · work items: a job without an item is refused, in Scrum and in Kanban", () => {
  for (const [label, workflow, sprint] of [["Scrum", SCRUM, SPRINT], ["Kanban", KANBAN, null]]) {
    for (const item of [null, undefined, ""]) {
      const { verdict } = start(item, { workflow, sprint });
      assert.equal(verdict.startable, false, `${label}: no item, no start`);
      assert.ok(reasonsOf(verdict).some((r) => /no item of the backlog/.test(r)), `${label}: refused, as no item of the backlog`);
    }
  }
  assert.deepEqual(start("ITM-015", { workflow: KANBAN, sprint: null }).verdict, { startable: true },
    "Kanban: an item of the backlog below the limit starts");
  const stray = start("ITM-099", { workflow: KANBAN, sprint: null }).verdict;
  assert.ok(reasonsOf(stray).some((r) => /ITM-099/.test(r) && /no item of the backlog/.test(r)), "Kanban: an item not in the backlog is refused");
});

// NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED (UC-032 step 1, waiting for acceptance; UC-033 step 5): "An item that names one open
// proposal cannot be started. The same item can be started after an approval record names the proposal's text." Expected: an
// item naming a requirement or a use case that is not accepted is waiting for acceptance, the names given as the reason; once
// they are accepted, the item is ready and starts.
test("release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts", () => {
  const items = [itemOf({ id: "ITM-014", realises: ["EXPORT IS A PDF", "EXPORT AS PDF/A", "UC-007"] })];
  const waits = start("ITM-014", { items });
  const state = stateOf(waits.states, "ITM-014");
  assert.equal(state.state, "waiting for acceptance");
  assert.match(state.reason, /EXPORT AS PDF\/A/);
  assert.match(state.reason, /UC-007/);
  assert.doesNotMatch(state.reason, /EXPORT IS A PDF[^/]/);
  assert.equal(waits.verdict.startable, false);
  const accepted = start("ITM-014", { items, accepted: ["EXPORT IS A PDF", "EXPORT AS PDF/A", "UC-007"] });
  assert.equal(stateOf(accepted.states, "ITM-014").state, "ready");
  assert.deepEqual(accepted.verdict, { startable: true });
});

// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED: "An item is in progress because a job for it is running or a pull request for it
// is open, not because a field says so." Expected: the same item is ready, in progress, done as the pull requests given change, and
// a state written into its file is not read — the file decides nothing.
test("release · work items: an item's state follows its pull requests, not a field of its file", () => {
  const item = itemOf({ id: "ITM-014", extra: ["state: done", "status: done"] });
  const at = (prs) => itemStates([item], null, facts(ACCEPTED_NAMES, prs))[0].state;
  assert.equal(at([]), "ready", "no pull request: ready, whatever the file says");
  assert.equal(at([pr(7, "ITM-014", "open")]), "in progress");
  assert.equal(at([pr(7, "ITM-014", "merged")]), "done");
  assert.equal(at([pr(7, "ITM-0140", "merged")]), "ready", "a pull request for ITM-0140 is not one for ITM-014");
});
