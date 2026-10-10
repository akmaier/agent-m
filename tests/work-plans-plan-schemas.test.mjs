// The implementation-plan order and sprint records (ITM-297) — fresh unit coverage for the two missing public schemas of MOD-work-plans.
// Run: node --test tests/work-plans-plan-schemas.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-002; UC-032; UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// The module owns schemas only. These cases read and write through MOD-documents' public interface and never introduce
// a caller, saved state, dependency validation, or a sprint action.

import test from "node:test";
import assert from "node:assert/strict";
import { appendSection, documentFindings, readDocument, readRegister, writeDocument } from "../src/documents/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const PLAN_PATH = "docs/plan/order.md";
const SPRINT_PATH = "docs/backlog/sprints/19.md";

const planOrderOf = (...rows) => [
  "# The order of the implementation plan", "", "**REGISTER**", "", "The plan's steps in their order.", "", "## Order", "",
  "| Step | Phase |", "|---|---|", ...rows.map(([step, phase]) => `| ${step} | ${phase} |`), "",
].join("\n");

const sprintOf = ({ selection = ["ITM-297", "ITM-298"], start = "2026-10-10", end = "", branch = "sprint/19" } = {}) => [
  "---", "sprint: 19", "goal: Give plans and sprints their schemas", `start: ${start}`, `end: ${end}`,
  "closer: scrum-master-session", `branch: ${branch}`, "selection:", ...selection.map((item) => `  - ${item}`), "---",
  "# Sprint 19", "", "**REGISTER**", "", "The selected backlog work.", "",
].join("\n");

const findingsOf = (schema, path, text) => documentFindings(schema, readDocument(schema, path, text));

// TST-297011
// given: an implementation-plan order with three ITM steps in two model phases
// input: readRegister(planSchemas.planOrder, docs/plan/order.md, text)
// expect: rows preserve Step and Phase values and their table order
// guards: UC-045; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
test("TST-297011: planSchemas.planOrder reads ordered Step and Phase rows", () => {
  const { rows } = readRegister(planSchemas.planOrder, PLAN_PATH,
    planOrderOf(["ITM-297", "Planning"], ["ITM-298", "Development"], ["ITM-299", "Development"]));
  assert.deepEqual(rows.map((row) => row.cells), [
    { Step: "ITM-297", Phase: "Planning" }, { Step: "ITM-298", Phase: "Development" }, { Step: "ITM-299", Phase: "Development" },
  ]);
});

// TST-297012
// given: canonical plan-order and sprint records, including a selected backlog list
// input: readDocument then writeDocument through their public schemas
// expect: each canonical record round-trips byte for byte
// guards: UC-032; UC-045; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
test("TST-297012: canonical plan order and sprint records round-trip without persisted state", () => {
  const plan = planOrderOf(["ITM-297", "Planning"], ["ITM-298", "Development"]);
  const sprint = sprintOf();
  assert.equal(writeDocument(planSchemas.planOrder, readDocument(planSchemas.planOrder, PLAN_PATH, plan)), plan);
  assert.equal(writeDocument(planSchemas.sprint, readDocument(planSchemas.sprint, SPRINT_PATH, sprint)), sprint);
  assert.equal(Object.hasOwn(readDocument(planSchemas.sprint, SPRINT_PATH, sprint).fields, "state"), false);
});

// TST-297013
// given: known-valid plan and sprint records; then an invalid plan step, an invalid sprint path, and an invalid sprint date
// input: documentFindings through planSchemas
// expect: valid records have no finding; each malformed value is named on its record line by the schema rule
// guards: THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
test("TST-297013: malformed identifiers, paths, and sprint dates are findings after known-valid records", () => {
  assert.deepEqual(findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderOf(["ITM-297", "Planning"])), []);
  assert.deepEqual(findingsOf(planSchemas.sprint, SPRINT_PATH, sprintOf()), []);
  assert.equal(findingsOf(planSchemas.planOrder, PLAN_PATH, planOrderOf(["NOT-297", "Planning"])).length, 1);
  assert.ok(findingsOf(planSchemas.sprint, "docs/backlog/sprints/x.md", sprintOf()).length > 0);
  assert.ok(findingsOf(planSchemas.sprint, SPRINT_PATH, sprintOf({ start: "2026-99-10" })).length > 0);
});

// TST-297014
// given: a sprint record and its first Selection decision
// input: appendSection for Selection twice, then readDocument
// expect: each allowed append retains every earlier byte, both decisions remain readable in order, and no item/job state is added
// guards: UC-032; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
test("TST-297014: repeated Selection decisions append without changing earlier sprint bytes", () => {
  const first = appendSection(planSchemas.sprint, sprintOf(), "## Selection", { selection: ["ITM-299"] });
  const second = appendSection(planSchemas.sprint, first, "## Selection", { selection: ["ITM-300"] });
  assert.ok(second.startsWith(first));
  const document = readDocument(planSchemas.sprint, SPRINT_PATH, second);
  assert.deepEqual(document.appended.filter((section) => section.heading === "## Selection").map((section) => section.fields.selection),
    [["ITM-299"], ["ITM-300"]]);
  assert.equal(second.includes("state:"), false);
});

// TST-297015
// given: a sprint record with each accepted append-only record kind
// input: appendSection then readDocument through planSchemas.sprint
// expect: Ended, Review, Unfinished items and Retrospective preserve their declared fields for later callers
// guards: UC-002; UC-032; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
test("TST-297015: sprint accepted appended records preserve review, unfinished-item, and retrospective facts", () => {
  let text = sprintOf();
  text = appendSection(planSchemas.sprint, text, "## Ended", { ended: "2026-10-11" });
  text = appendSection(planSchemas.sprint, text, "## Review", { increment: "ITM-297", feedback: "ITM-300: new item", participants: ["po-sol"], sources: ["issue #12"] });
  text = appendSection(planSchemas.sprint, text, "## Unfinished items", { item: "ITM-298", to: "backlog", reason: "needs review" });
  text = appendSection(planSchemas.sprint, text, "## Retrospective", { entry: "keep the review evidence", kind: "went well", goes: "team agreement" });
  const appended = readDocument(planSchemas.sprint, SPRINT_PATH, text).appended;
  assert.deepEqual(appended.map((section) => section.heading), ["## Ended", "## Review", "## Unfinished items", "## Retrospective"]);
  assert.equal(appended[1].fields.feedback, "ITM-300: new item");
  assert.equal(appended[2].fields.to, "backlog");
  assert.equal(appended[3].fields.goes, "team agreement");
});
