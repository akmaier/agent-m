// The implementation-plan order schema and the existing sprint record schema (ITM-297) — MOD-work-plans' planSchemas
// surface through MOD-documents' public readDocument/readRegister/writeDocument/documentFindings/appendSection interfaces.
// Run: node --test tests/work-plans-plan-schemas.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-002; UC-032; UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
// Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// The module owns schemas only. These cases read and write through MOD-documents and do not introduce a caller, saved state,
// dependency validation, a model-phase check, or a sprint action.

import test from "node:test";
import assert from "node:assert/strict";
import { appendSection, documentFindings, readDocument, readRegister, writeDocument } from "../src/documents/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const PLAN_PATH = "docs/plan/order.md";
const SPRINT_PATH = "docs/backlog/sprints/team1/19.md";
const PLAN_RULE = "THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY";
const SPRINT_RULE = "EVERY TEAM RUNS SPRINTS OF ITS OWN";

const planOrderText = (...rows) => [
  "# The order of the implementation plan", "", "**REGISTER**", "", "The plan's steps in their order.", "", "## Order", "",
  "| Step | Phase |", "|---|---|", ...rows.map(([step, phase]) => `| ${step} | ${phase} |`), "",
].join("\n");

const sprintText = ({ path = SPRINT_PATH, selection = ["ITM-297", "ITM-298"], start = "2026-10-10" } = {}) => ({
  path,
  text: [
    "---", "sprint: 19", "goal: Give plans and sprints their schemas", `start: ${start}`, "end:",
    "closer: scrum-master-session", "branch: sprint/team1/19", "selection:", ...selection.map((item) => `  - ${item}`), "---",
    "# Team 1 Sprint 19", "", "**REGISTER**", "", "The selected backlog work.", "",
  ].join("\n"),
});

const findingsOf = (schema, path, text) => documentFindings(schema, readDocument(schema, path, text));
const compact = (finding) => ({ artifact: finding.artifact, line: finding.line, kind: finding.kind, rule: finding.rule,
  what: finding.what });

// TST-297011 · level: unit · module: MOD-work-plans
// guards: UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
// given: an implementation-plan order with three ITM steps in two model phases
// input: readRegister(planSchemas.planOrder, docs/plan/order.md, text)
// expect: rows preserve Step and Phase values and their table order
test("TST-297011: planSchemas.planOrder reads ordered Step and Phase rows", () => {
  const { rows } = readRegister(planSchemas.planOrder, PLAN_PATH,
    planOrderText(["ITM-297", "Planning"], ["ITM-298", "Development"], ["ITM-299", "Development"]));
  assert.deepEqual(rows.map((row) => row.cells), [
    { Step: "ITM-297", Phase: "Planning" },
    { Step: "ITM-298", Phase: "Development" },
    { Step: "ITM-299", Phase: "Development" },
  ]);
});

// TST-297012 · level: unit · module: MOD-work-plans
// guards: UC-032; UC-045; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: canonical plan-order and sprint records, including a selected backlog list
// input: readDocument then writeDocument through their public schemas
// expect: each canonical record round-trips byte for byte and the sprint has no stored item/job state field
test("TST-297012: canonical plan order and sprint records round-trip without persisted state", () => {
  const plan = planOrderText(["ITM-297", "Planning"], ["ITM-298", "Development"]);
  const sprint = sprintText();
  assert.equal(writeDocument(planSchemas.planOrder, readDocument(planSchemas.planOrder, PLAN_PATH, plan)), plan);
  assert.equal(writeDocument(planSchemas.sprint, readDocument(planSchemas.sprint, sprint.path, sprint.text)), sprint.text);
  assert.equal(Object.hasOwn(readDocument(planSchemas.sprint, sprint.path, sprint.text).fields, "state"), false);
});

// TST-297013 · level: unit · module: MOD-work-plans
// guards: THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; EVERY TEAM RUNS SPRINTS OF ITS OWN
// given: known-valid plan and sprint records; then an invalid plan step, a sprint path outside the team folder or with the wrong extension, a valid x.md sprint under {any}, and an invalid sprint date
// input: documentFindings through planSchemas
// expect: valid records have no finding; malformed identifier, path and date cases name their artifact, line, rule and compiler message; x.md is not rejected by {any}
test("TST-297013: malformed identifiers, paths, and sprint dates are findings after known-valid records", () => {
  assert.deepEqual(findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderText(["ITM-297", "Planning"])), []);
  const sprint = sprintText();
  assert.deepEqual(findingsOf(planSchemas.sprint, sprint.path, sprint.text), []);

  const [badStep] = findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderText(["NOT-297", "Planning"]));
  assert.deepEqual(compact(badStep), {
    artifact: PLAN_PATH, line: 11, kind: "error", rule: PLAN_RULE,
    what: 'the column Step does not fit: "NOT-297" is not an identifier ITM',
  });

  for (const path of ["docs/backlog/sprints/19.md", "docs/backlog/sprints/team1/19.txt"]) {
    const [badPath] = findingsOf(planSchemas.sprint, path, sprintText({ path }).text);
    assert.deepEqual(compact(badPath), {
      artifact: path, line: 1, kind: "error", rule: SPRINT_RULE,
      what: `the path ${path} does not match a path of the format sprint`,
    });
  }
  const anyName = sprintText({ path: "docs/backlog/sprints/team1/x.md" });
  assert.deepEqual(findingsOf(planSchemas.sprint, anyName.path, anyName.text), [], "{any} admits the file segment x");

  const badDate = sprintText({ start: "2026-99-10" });
  const [dateFinding] = findingsOf(planSchemas.sprint, badDate.path, badDate.text);
  assert.deepEqual(compact(dateFinding), {
    artifact: SPRINT_PATH, line: 4, kind: "error", rule: "A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT",
    what: 'the key start does not fit: "2026-99-10" is not a date YYYY-MM-DD',
  });
});

// TST-297014 · level: unit · module: MOD-work-plans
// guards: UC-032; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a sprint record and two later Selection headings with dates and selected items
// input: appendSection twice, then readDocument
// expect: each allowed append retains every earlier byte, both Selection decisions remain readable in order, and no state field is added
test("TST-297014: repeated Selection decisions append without changing earlier sprint bytes", () => {
  const sprint = sprintText();
  const first = appendSection(planSchemas.sprint, sprint.text, "## Selection", { at: "2026-10-11", selection: ["ITM-299"] });
  const second = appendSection(planSchemas.sprint, first, "## Selection", { at: "2026-10-12", selection: ["ITM-300", "ITM-301"] });
  assert.ok(first.startsWith(sprint.text));
  assert.ok(second.startsWith(first));
  const document = readDocument(planSchemas.sprint, sprint.path, second);
  assert.deepEqual(document.appended.filter((section) => section.heading === "## Selection").map((section) => section.fields), [
    { at: "2026-10-11", selection: ["ITM-299"] },
    { at: "2026-10-12", selection: ["ITM-300", "ITM-301"] },
  ]);
  assert.equal(Object.hasOwn(document.fields, "state"), false);
});

// TST-297015 · level: unit · module: MOD-work-plans
// guards: UC-002; UC-032; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
// given: a sprint record with each accepted appended section as freeform prose, feedback destinations, tables and lists
// input: readDocument then writeDocument through planSchemas.sprint
// expect: Ended, Review, Unfinished items and Retrospective retain their complete section text for later callers
test("TST-297015: sprint appended records preserve review, unfinished-item, and retrospective text", () => {
  const sprint = sprintText();
  const text = `${sprint.text}\n## Ended\n\nat: 2026-10-10\n\nThe Product Owner ended this sprint without a time box on 2026-10-10.\n\n## Review\n\nBy scrum-master-session, the closer of sprint 19, on sprint/team1/19 at 1f18003, 2026-10-13.\n\n**Feedback, each with where it goes.**\n- The order of the backlog is a table in MOD-work-plans.\n  -> New item ITM-209.\n- Step A shows no tokens button before an address is typed.\n  -> Noted.\n\n## Unfinished items\n\nto the backlog: ITM-301\ninto the next sprint: ITM-302\n\nITM-301 waits for acceptance. ITM-302 waits for a gate.\n\n## Retrospective\n\n**What went well.**\n- Every item began with failing tests.\n\n**Changes, each with where it goes.**\n- Proposed, team agreement: a sprint runs as one coordinated run.\n`;
  const document = readDocument(planSchemas.sprint, sprint.path, text);
  assert.equal(writeDocument(planSchemas.sprint, document), text);
  assert.deepEqual(document.appended.map((section) => section.heading), ["## Ended", "## Review", "## Unfinished items", "## Retrospective"]);
  assert.match(document.appended[1].text, /Feedback, each with where it goes/);
  assert.match(document.appended[2].text, /ITM-301 waits for acceptance/);
  assert.match(document.appended[3].text, /Proposed, team agreement/);
});
