// Release tests of sprint 02, strand B — backlog items and their order, sprints, item states, the work-in-progress limit and the
// sprint's selection (ITM-143, testing ITM-033 and ITM-034). Written by tester-opus (claude-opus-5-5), the Release tester of
// docs/process.md, who implemented nothing of the strand, from the SPEC rules, UC-032 and UC-033 alone; started on sprint/02 at
// 58b7fe4, 2026-10-01.
//
// Module: MOD-work-items
// Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES WHAT IT REALISES; EVERY ARTIFACT NAMES ITS ORIGIN; NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; AGILE IMPLEMENTATION STARTS FROM THE BACKLOG; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032; UC-033
// Level: release
//
// Two kinds of input. This very repository — its docs/backlog/ with order.md and the sprint files frozen as they were while
// sprint 02 ran (the copy tests/fixtures/sprint-02-running/docs/backlog/, from sprint/02 at 87b3268, sprint-02.md's end empty;
// the live backlog changes at every close), and its docs/use-cases/, read with fs because there are more of them than a
// command line holds; Agent M's own SPEC.md is not read (its requirement names are not needed: an item's
// form is checked with `requirements: null`). And fixtures written from the use cases: an item that realises nothing, an order
// that names an item twice, an issue classified as a bug or a change, a Scrum product with limit 2, a Kanban product.
// Whether a start is allowed is read as itemState says it (its interface, MOD-work-items): allowed exactly when the state is
// "ready" and no reason stands. Each expectation is stated before its case runs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { parseItem, itemProblems, backlogOrder, itemFromIssue } from "../docs/assets/work-items.mjs";
import { sprint, itemState } from "../docs/assets/work-items/flow.mjs";

const ROOT = new URL("../", import.meta.url);
// docs/backlog/ as it was while sprint 02 ran (sprint/02 at 87b3268), not the live one; every other path from this repository.
const FROZEN = new URL("tests/fixtures/sprint-02-running/", ROOT);
const base = (path) => (path.startsWith("docs/backlog/") ? FROZEN : ROOT);
const read = (path) => readFileSync(new URL(path, base(path)), "utf8");

const LIVES = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
const NAMES = "A BACKLOG ITEM NAMES WHAT IT REALISES";
const WIP = "NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT";
const SELECTED = "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT";
const AGILE = "AGILE IMPLEMENTATION STARTS FROM THE BACKLOG";
const ACCEPTED = "NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED";

// This repository's backlog while sprint 02 ran: every docs/backlog/ITM-<nnn>-<slug>.md of the frozen copy, read with fs.
const ITEM_FILES = readdirSync(new URL("docs/backlog/", FROZEN)).filter((f) => /^ITM-\d{3}-.+\.md$/.test(f)).sort()
  .map((f) => `docs/backlog/${f}`);
const ITEMS = ITEM_FILES.map((p) => parseItem(p, read(p)));
const USE_CASES = readdirSync(new URL("docs/use-cases/", ROOT)).map((f) => /^(UC-\d{3})-/.exec(f)?.[1]).filter(Boolean);
const ORDER_TEXT = read("docs/backlog/order.md");
const SPRINT_02 = read("docs/backlog/sprints/sprint-02.md");

const isStartAllowed = (st) => st.state === "ready" && st.reasons.length === 0;
const kinds = (st) => st.reasons.map((r) => r.kind);

// ---------------------------------------------------------------- ITM-033: items and their order

// THE BACKLOG LIVES IN THE PRODUCT REPOSITORY · A BACKLOG ITEM NAMES WHAT IT REALISES · EVERY ARTIFACT NAMES ITS ORIGIN — this
// backlog. Expected: every item file under docs/backlog/ is read with its identifier (the one of its file name), a title, at
// least one name under realises and an origin, and has no error; every use case it names is one of docs/use-cases/.
test("release · work items: this backlog parses without a problem — each item names what it realises and where it came from", () => {
  assert.ok(ITEMS.length >= 100, `the backlog has its items (${ITEMS.length})`);
  for (const item of ITEMS) {
    const id = /^docs\/backlog\/(ITM-\d{3})-/.exec(item.path)[1];
    assert.equal(item.id, id, `${item.path}: its identifier`);
    assert.ok(item.title, `${item.path}: a title`);
    assert.ok(item.realises.length >= 1, `${item.path}: realises something`);
    assert.ok(item.origins.length >= 1, `${item.path}: names its origin`);
    const errors = itemProblems(item, { requirements: null, useCases: USE_CASES, items: ITEMS })
      .filter((f) => f.kind === "error");
    assert.deepEqual(errors, [], `${item.path}: no error`);
  }
});

const ITEM = (realises, extra = "") => `---
id: ITM-900
title: Export a thesis as PDF
kind: implementation
level: 1
realises:${realises}
modules: []
depends_on: []
origin: sprint 03 planning
---
# ITM-900 Export a thesis as PDF

## Outcome

The thesis is exported as one PDF.
${extra}`;

// A BACKLOG ITEM NAMES WHAT IT REALISES: "Every backlog item names at least one requirement or use case that it realises."
// UC-032 step 3: "Agent M rejects a draft that realises nothing". Expected: an item with an empty list, and one without the field,
// each carry an error naming the rule; the same item realising a known requirement or a known use case carries none.
test("release · work items: an item that realises nothing is an error; one that realises a requirement or use case is not", () => {
  const known = { requirements: ["EXPORT IS A PDF"], useCases: ["UC-001"], items: [] };
  for (const [label, text] of [["realises: []", ITEM(" []")], ["no realises", ITEM("").replace("realises:\n", "")]]) {
    const item = parseItem("docs/backlog/ITM-900-export-a-thesis-as-pdf.md", text);
    const errors = itemProblems(item, known).filter((f) => f.kind === "error");
    assert.ok(errors.some((f) => f.rule === NAMES), `${label}: an error naming ${NAMES}`);
  }
  for (const name of ["EXPORT IS A PDF", "UC-001"]) {
    const item = parseItem("docs/backlog/ITM-900-export-a-thesis-as-pdf.md", ITEM(`\n  - ${name}`));
    assert.deepEqual(item.realises, [name]);
    assert.deepEqual(itemProblems(item, known).filter((f) => f.kind === "error"), [], `realising ${name}: no error`);
  }
  // A draft (a job's answer, UC-032 step 3) is held to the same rule.
  const draft = { title: "Export a thesis as PDF", outcome: "The thesis is exported.", realises: [], origins: ["sprint 03 planning"] };
  assert.ok(itemProblems(draft, known).some((f) => f.kind === "error" && f.rule === NAMES), "a draft that realises nothing is rejected");
});

// A BACKLOG ITEM NAMES WHAT IT REALISES applies EVERY ARTIFACT NAMES ITS ORIGIN to the backlog: a name that matches nothing the
// product has realises nothing. Expected: an item naming an unknown requirement or an unknown use case carries an error.
test("release · work items: an item naming a requirement or use case the product does not have is an error", () => {
  const known = { requirements: ["EXPORT IS A PDF"], useCases: ["UC-001"], items: [] };
  for (const name of ["EXPORT IS A WORD FILE", "UC-099"]) {
    const item = parseItem("docs/backlog/ITM-900-export-a-thesis-as-pdf.md", ITEM(`\n  - ${name}`));
    assert.ok(itemProblems(item, known).some((f) => f.kind === "error" && f.rule === NAMES), `${name}: an error`);
  }
});

// UC-032 step 3: Agent M "flags a draft that restates an existing item" — a flag, not a rejection. Expected: a warning naming
// the existing item, and no error.
test("release · work items: an item that restates an existing one is flagged, not rejected", () => {
  const existing = parseItem("docs/backlog/ITM-014-export-thesis-as-pdf.md", ITEM("\n  - EXPORT IS A PDF").replace(/ITM-900/g, "ITM-014"));
  const draft = { title: "Export a thesis as PDF", outcome: "Something else.", realises: ["EXPORT IS A PDF"], origins: ["sprint 03 planning"] };
  const fs = itemProblems(draft, { requirements: ["EXPORT IS A PDF"], useCases: [], items: [existing] });
  assert.deepEqual(fs.filter((f) => f.kind === "error"), []);
  assert.ok(fs.some((f) => f.kind === "warning" && /ITM-014/.test(f.what)), "a warning that names ITM-014");
});

// THE BACKLOG LIVES IN THE PRODUCT REPOSITORY: "A product's backlog is kept as Markdown under docs/backlog/". UC-032 step 4:
// "one Markdown file per item under docs/backlog/, for example docs/backlog/ITM-014-export-thesis-as-pdf.md". Expected: an
// item file anywhere else, or not named ITM-<nnn>-<slug>.md, carries an error naming the rule; the same text under docs/backlog/
// does not.
test("release · work items: an item kept outside docs/backlog/ is an error", () => {
  const text = ITEM("\n  - EXPORT IS A PDF");
  for (const path of ["backlog/ITM-900-export-a-thesis-as-pdf.md", "docs/ITM-900-export-a-thesis-as-pdf.md", "docs/backlog/export.md"]) {
    assert.ok(parseItem(path, text).problems.some((f) => f.kind === "error" && f.rule === LIVES), `${path}: an error`);
  }
  assert.deepEqual(parseItem("docs/backlog/ITM-900-export-a-thesis-as-pdf.md", text).problems, []);
});

// The order of this backlog (UC-032 step 5; docs/backlog/order.md: "One item per line, by its identifier; an item file this list
// does not name is appended at the bottom"). Expected, from reading order.md's list lines independently: no problem; the order
// places every item of docs/backlog/ exactly once; it begins with the list's items in the list's order and ends with the items
// the list does not name, in the order of their identifiers.
test("release · work items: this backlog's order places every item once, and appends the unnamed at the bottom", () => {
  const listed = [...ORDER_TEXT.matchAll(/^\s*\d+\.\s+(ITM-\d{3})\b/gm)].map((m) => m[1]);
  const ids = ITEMS.map((i) => i.id);
  const { order, unplaced, problems } = backlogOrder(ORDER_TEXT, ITEMS);
  assert.deepEqual(problems, []);
  assert.equal(order.length, ids.length, "every item once");
  assert.deepEqual([...order].sort(), [...ids].sort(), "exactly the items of docs/backlog/");
  const expectedUnplaced = ids.filter((id) => !listed.includes(id)).sort();
  assert.deepEqual(unplaced, expectedUnplaced);
  assert.deepEqual(order, [...listed, ...expectedUnplaced]);
});

// The order's own faults (UC-032 step 5 commits an order of the backlog's items). Expected: a line naming an item the backlog
// does not have is a problem, so is an item named twice; an item no line names is appended at the bottom; the numbers of the
// list are not read — the order is the order of the lines.
test("release · work items: an order that names an unknown item or one twice is a problem; the unnamed are appended", () => {
  const items = ["ITM-003", "ITM-001", "ITM-002", "ITM-004"].map((id) => ({ id }));
  const text = "# Order\n\n3. ITM-002\n1. ITM-001\n2. ITM-099\n4. ITM-001\n";
  const { order, unplaced, problems } = backlogOrder(text, items);
  assert.deepEqual(order, ["ITM-002", "ITM-001", "ITM-003", "ITM-004"]);
  assert.deepEqual(unplaced, ["ITM-003", "ITM-004"]);
  assert.equal(problems.length, 2, "two problems");
  assert.ok(problems.some((f) => f.line === 5 && /ITM-099/.test(f.what)), "the unknown item, on its line");
  assert.ok(problems.some((f) => f.line === 6 && /ITM-001/.test(f.what)), "the second ITM-001, on its line");
});

// UC-033 steps 2 and postcondition — an item from an issue: title from the issue, outcome from its description, origin the
// issue's address, and what it realises from the issue's class: for a bug the requirement the code violates, for a change the
// requirement names of the queue entries UC-012 wrote for it. 1a: an issue not classified gives no item. Expected as written.
test("release · work items: an item from an issue names the issue as its origin, and realises what its class says", () => {
  const issue = { title: "Export fails for long theses", body: "The PDF export stops after page 200.\n",
    url: "https://github.com/alice/thesis-tool/issues/57" };
  const bug = itemFromIssue(issue, { kind: "bug", violated: "EXPORT IS A PDF" });
  assert.equal(bug.title, "Export fails for long theses");
  assert.equal(bug.outcome, "The PDF export stops after page 200.");
  assert.deepEqual(bug.origins, ["https://github.com/alice/thesis-tool/issues/57"]);
  assert.deepEqual(bug.issues, ["https://github.com/alice/thesis-tool/issues/57"], "the origin is read as an issue");
  assert.deepEqual(bug.realises, ["EXPORT IS A PDF"]);
  assert.deepEqual(itemProblems(bug, { requirements: ["EXPORT IS A PDF"], useCases: [], items: [] }).filter((f) => f.kind === "error"), []);

  const change = itemFromIssue({ ...issue, url: "https://gitlab.example.org/team/proj/-/issues/12" }, { kind: "change" },
    [{ names: ["EXPORT AS PDF/A"] }, { names: ["EXPORT NAMES ITS VERSION", "EXPORT AS PDF/A"] }]);
  assert.deepEqual(change.origins, ["https://gitlab.example.org/team/proj/-/issues/12"]);
  assert.deepEqual(change.issues, ["https://gitlab.example.org/team/proj/-/issues/12"], "a GitLab issue too");
  assert.deepEqual(change.realises, ["EXPORT AS PDF/A", "EXPORT NAMES ITS VERSION"], "each queue entry's name once");

  assert.equal(itemFromIssue(issue, null), null, "not classified: no item");
  assert.equal(itemFromIssue(issue, { kind: "question" }), null, "neither bug nor change: no item");
});

// UC-033 step 5: "A bug item is ready. A change item is waiting for acceptance until every requirement it names is accepted
// (UC-006). It then becomes ready by itself, because its state is derived." Postcondition: "No implementation job can start for a
// change item before its specification change is accepted." Expected as written, in a Kanban product (no sprint selection).
test("release · work items: a bug item is ready; a change item waits for acceptance, and is ready once accepted", () => {
  const KANBAN = { kind: "pulled", wipLimit: 3, timeBox: null, sprints: false, sprint: null, backlog: ["ITM-031", "ITM-032"], today: "2026-10-02" };
  const issue = { title: "Export", body: "Export as PDF/A.", url: "https://github.com/alice/thesis-tool/issues/57" };
  const bug = { ...itemFromIssue(issue, { kind: "bug", violated: "EXPORT IS A PDF" }), id: "ITM-031" };
  const change = { ...itemFromIssue(issue, { kind: "change" }, [{ names: ["EXPORT AS PDF/A"] }]), id: "ITM-032" };
  const before = { requirements: ["EXPORT IS A PDF"], useCases: [], pullRequests: [], wip: KANBAN };
  assert.deepEqual(itemState(bug, before), { state: "ready", reasons: [] });
  const waiting = itemState(change, before);
  assert.equal(waiting.state, "waiting for acceptance");
  assert.equal(isStartAllowed(waiting), false);
  assert.deepEqual(itemState(change, { ...before, requirements: ["EXPORT IS A PDF", "EXPORT AS PDF/A"] }), { state: "ready", reasons: [] });
});

// UC-033 postcondition "The backlog holds an item that names the issue as its origin" and 4a "The item then names both issues as
// origins": an item file read back. Expected: both addresses are its origins and its issues.
test("release · work items: an item file naming two issues as its origin is read with both", () => {
  const text = ITEM("\n  - EXPORT IS A PDF").replace("origin: sprint 03 planning",
    "origin:\n  - https://github.com/alice/thesis-tool/issues/57\n  - https://github.com/alice/thesis-tool/issues/61");
  const item = parseItem("docs/backlog/ITM-900-export-a-thesis-as-pdf.md", text);
  assert.deepEqual(item.issues, ["https://github.com/alice/thesis-tool/issues/57", "https://github.com/alice/thesis-tool/issues/61"]);
  assert.deepEqual(itemProblems(item, { requirements: ["EXPORT IS A PDF"], useCases: [], items: [] }), []);
});

// ---------------------------------------------------------------- ITM-034: sprints, states, limit, selection

// UC-032 step 6 and postcondition — the sprint record of this sprint, docs/backlog/sprints/sprint-02.md, as written: Expected:
// no problem; its id, start, branch and closer; its end as the file gives it (empty while it runs without a time box: none); the
// selected items in the order of the file (25 at planning); and no state in it (PROGRESS AND JOB STATE ARE DERIVED, NOT STORED:
// "No state is stored in them").
test("release · work items: this sprint's record is read with its selection in order, and stores no state", () => {
  const s = sprint(SPRINT_02);
  const fm = SPRINT_02.split("\n---")[0];
  assert.deepEqual(s.problems, []);
  assert.equal(s.id, "sprint-02");
  assert.equal(s.start, "2026-10-01");
  assert.equal(s.end, /^end:[ \t]*(\S*)/m.exec(fm)[1] || null, "the end as written");
  assert.equal(s.branch, "sprint/02");
  assert.equal(s.closer, "scrum-master-session");
  const listed = [...fm.matchAll(/^ {2}- (ITM-\d{3})$/gm)].map((m) => m[1]);
  assert.ok(listed.length >= 25, "the selection of the planning");
  assert.deepEqual(s.selection, listed);
  const keys = [...SPRINT_02.split("\n---")[0].matchAll(/^([a-z_]+):/gm)].map((m) => m[1]);
  assert.ok(!keys.some((k) => /state|status|progress|done/.test(k)), `no state field in the record: ${keys.join(", ")}`);
  assert.deepEqual(sprint(read("docs/backlog/sprints/sprint-01.md")).problems, [], "sprint 01's record too");
});

// A Scrum product with a work-in-progress limit of 2 (the SPEC's check of NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT), its
// running sprint selecting four items, every requirement they realise accepted.
const ITEM_OF = (id, realises = ["EXPORT IS A PDF"]) => ({ id, realises });
const SCRUM_SPRINT = sprint(`---
id: sprint-03
goal: Export
start: 2026-10-01
end:
selection:
  - ITM-011
  - ITM-012
  - ITM-013
  - ITM-014
branch: sprint/03
---
# Sprint 03
`);
const SCRUM = { kind: "pulled", wipLimit: 2, timeBox: null, sprints: true, sprint: SCRUM_SPRINT,
  backlog: ["ITM-011", "ITM-012", "ITM-013", "ITM-014", "ITM-015"], today: "2026-10-02" };
const pr = (number, id, state, at = "2026-10-01T10:00:00Z") => ({ number, title: `${id}: work`, head: `team/${id}`, base: "sprint/03",
  state, openedAt: at, mergedAt: state === "merged" ? "2026-10-01T12:00:00Z" : null });
const ACCEPTED_NAMES = { requirements: ["EXPORT IS A PDF"], useCases: [] };

// NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT: "With limit 2 and two items in progress, a third start is refused with the limit
// named. With one of the two done, the start succeeds." UC-032 7: "Items in Review count as in progress" — an open pull request is
// work waiting for review. Expected as written: the third item is ready, but a reason refuses its start, naming the limit 2, the
// rule, and the two items that hold it; with one of them merged, nothing refuses it.
test("release · work items: with limit 2 and two items in progress a third start is refused with the limit named", () => {
  const two = [pr(1, "ITM-011", "open"), pr(2, "ITM-012", "open")];
  assert.equal(itemState(ITEM_OF("ITM-011"), { ...ACCEPTED_NAMES, pullRequests: two, wip: SCRUM }).state, "in progress",
    "an item with an open pull request — waiting for review — is in progress");
  const third = itemState(ITEM_OF("ITM-013"), { ...ACCEPTED_NAMES, pullRequests: two, wip: SCRUM });
  assert.equal(isStartAllowed(third), false, "the third start is refused");
  const limit = third.reasons.find((r) => r.rule === WIP);
  assert.ok(limit, "the refusal names the rule of the limit");
  assert.equal(limit.limit, 2, "and the limit");
  assert.deepEqual(limit.inProgress.map((i) => i.id).sort(), ["ITM-011", "ITM-012"], "and the items that hold it");

  const oneDone = [pr(1, "ITM-011", "merged"), pr(2, "ITM-012", "open")];
  assert.equal(itemState(ITEM_OF("ITM-011"), { ...ACCEPTED_NAMES, pullRequests: oneDone, wip: SCRUM }).state, "done");
  const now = itemState(ITEM_OF("ITM-013"), { ...ACCEPTED_NAMES, pullRequests: oneDone, wip: SCRUM });
  assert.deepEqual(now, { state: "ready", reasons: [] }, "with one of the two done, the start succeeds");
});

// A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT: "implementation jobs start only for items selected for the current sprint".
// UC-032 6a: an item added during a running sprint goes to the backlog, not into the sprint. Expected: an item of the backlog that
// the running sprint does not select is refused with that rule; a selected one is not. Without a running sprint, no item starts;
// a sprint whose end lies behind today (UC-032 6b) is no current sprint.
test("release · work items: an item outside the running sprint's selection is refused", () => {
  const outside = itemState(ITEM_OF("ITM-015"), { ...ACCEPTED_NAMES, pullRequests: [], wip: SCRUM });
  assert.equal(outside.state, "ready", "accepted and not started: ready");
  assert.equal(isStartAllowed(outside), false, "but its start is refused");
  assert.ok(outside.reasons.some((r) => r.rule === SELECTED), "with the rule of the sprint's selection");
  assert.deepEqual(itemState(ITEM_OF("ITM-014"), { ...ACCEPTED_NAMES, pullRequests: [], wip: SCRUM }), { state: "ready", reasons: [] },
    "a selected item starts");

  const none = itemState(ITEM_OF("ITM-014"), { ...ACCEPTED_NAMES, pullRequests: [], wip: { ...SCRUM, sprint: null } });
  assert.ok(none.reasons.some((r) => r.rule === SELECTED), "no sprint running: refused");
  const ended = sprint(`---\nid: sprint-03\nstart: 2026-09-01\nend: 2026-09-14\nselection:\n  - ITM-014\n---\n`);
  const after = itemState(ITEM_OF("ITM-014"), { ...ACCEPTED_NAMES, pullRequests: [],
    wip: { ...SCRUM, wipLimit: null, timeBox: "2 weeks", sprint: ended, today: "2026-10-02" } });
  assert.ok(after.reasons.some((r) => r.rule === SELECTED), "the sprint has ended: refused");
});

// AGILE IMPLEMENTATION STARTS FROM THE BACKLOG: "Starting an implementation job without an item is refused for a Scrum and a
// Kanban fixture." Expected: for both, the start without an item is refused with that rule; in Kanban, which has no sprints, a
// backlog item below the limit starts, and one that is not in the backlog does not.
test("release · work items: a job without an item is refused, in Scrum and in Kanban", () => {
  const KANBAN = { kind: "pulled", wipLimit: 3, timeBox: null, sprints: false, sprint: null, backlog: ["ITM-021", "ITM-022"], today: "2026-10-02" };
  for (const [label, wip] of [["Scrum", SCRUM], ["Kanban", KANBAN]]) {
    for (const item of [null, undefined, { realises: ["EXPORT IS A PDF"] }]) {
      const st = itemState(item, { ...ACCEPTED_NAMES, pullRequests: [], wip });
      assert.equal(isStartAllowed(st), false, `${label}: no item, no start`);
      assert.ok(st.reasons.some((r) => r.rule === AGILE), `${label}: refused with ${AGILE}`);
    }
  }
  assert.deepEqual(itemState(ITEM_OF("ITM-021"), { ...ACCEPTED_NAMES, pullRequests: [], wip: KANBAN }), { state: "ready", reasons: [] },
    "Kanban: an item of the backlog below the limit starts");
  const stray = itemState(ITEM_OF("ITM-099"), { ...ACCEPTED_NAMES, pullRequests: [], wip: KANBAN });
  assert.ok(stray.reasons.some((r) => r.rule === AGILE), "Kanban: an item not in the backlog is refused");
});

// NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED (UC-032 step 1, waiting for acceptance; UC-033 step 5): "An item that names one open
// proposal cannot be started. The same item can be started after an approval record names the proposal's text." Expected: an
// item naming a requirement or a use case that is not accepted is waiting for acceptance, the name given as the reason; once it
// is accepted, the item is ready and starts.
test("release · work items: an item naming what is not accepted waits for acceptance; accepted, it starts", () => {
  const item = ITEM_OF("ITM-014", ["EXPORT IS A PDF", "EXPORT AS PDF/A", "UC-007"]);
  const waits = itemState(item, { ...ACCEPTED_NAMES, pullRequests: [], wip: SCRUM });
  assert.equal(waits.state, "waiting for acceptance");
  assert.deepEqual(waits.reasons.filter((r) => r.rule === ACCEPTED).map((r) => r.name).sort(), ["EXPORT AS PDF/A", "UC-007"]);
  assert.equal(isStartAllowed(waits), false);
  const accepted = itemState(item, { requirements: ["EXPORT IS A PDF", "EXPORT AS PDF/A"], useCases: ["UC-007"], pullRequests: [], wip: SCRUM });
  assert.deepEqual(accepted, { state: "ready", reasons: [] });
});

// PROGRESS AND JOB STATE ARE DERIVED, NOT STORED: "An item is in progress because a job for it is running or a pull request for it
// is open, not because a field says so." Expected: the same item is ready, in progress, done as the pull requests given change, and
// a state written into its file is not read — the file decides nothing.
test("release · work items: an item's state follows its pull requests, not a field of its file", () => {
  const text = ITEM("\n  - EXPORT IS A PDF").replace("level: 1", "level: 1\nstate: done\nstatus: done").replace(/ITM-900/g, "ITM-014");
  const item = parseItem("docs/backlog/ITM-014-export-a-thesis-as-pdf.md", text);
  const at = (prs) => itemState(item, { ...ACCEPTED_NAMES, pullRequests: prs, wip: SCRUM }).state;
  assert.equal(at([]), "ready", "no pull request: ready, whatever the file says");
  assert.equal(at([pr(7, "ITM-014", "open")]), "in progress");
  assert.equal(at([pr(7, "ITM-014", "merged")]), "done");
  assert.equal(at([pr(7, "ITM-0140", "merged")]), "ready", "a pull request for ITM-0140 is not one for ITM-014");
});
