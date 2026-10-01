// Release tests of sprint 02, strand B — process model definitions, read and validated before use (ITM-143, testing ITM-027).
// Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented nothing of the strand, from
// the SPEC rules and UC-031 alone; started on sprint/02 at 58b7fe4, 2026-10-01.
//
// Module: MOD-process-model
// Guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A GATE NAMES WHAT IT CHECKS; A GATE NAMES WHO DECIDES IT; A ROLE NAMES THE CAPABILITIES IT NEEDS; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; UC-031
// Level: release
//
// What is tested: Agent M's own model, docs/process-models/scrum-wip.md, is read with its limit, its sprints and its measure and
// validates without an error; and for every rule the SPEC's check of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED names, and
// every error UC-031 step 4 lists, one definition that breaks exactly that rule — Agent M's own model with one line changed — is
// refused with an error beside the field that causes it (UC-031 step 4), in the form of A FINDING READS LIKE A COMPILER MESSAGE.
// The counter-proof of A GATE NAMES WHO DECIDES IT: a gate decided by a role and one decided by a named CI check both pass.
// Each expectation is stated before its case runs. The shipped catalogue of the book's models does not exist yet (ITM-028), so
// "each book model in the shipped catalogue must pass" is not tested here.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseModel, validateModel } from "../docs/assets/process-model.mjs";

const ROOT = new URL("../", import.meta.url);
const OWN = readFileSync(new URL("docs/process-models/scrum-wip.md", ROOT), "utf8");

const VALIDATED = "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED";
const GATE_WHAT = "A GATE NAMES WHAT IT CHECKS";
const GATE_WHO = "A GATE NAMES WHO DECIDES IT";
const CAPABILITIES = "A ROLE NAMES THE CAPABILITIES IT NEEDS";
const MEASURE = "PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE";
// The requirements a model definition's validation may name: the rules of §5 and §13 that a definition can break.
const MODEL_RULES = new Set([VALIDATED, GATE_WHAT, GATE_WHO, CAPABILITIES, MEASURE, "THE MODEL DETERMINES THE PHASES AND THE GATES",
  "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS"]);

const errorsOf = (text) => validateModel(parseModel(text)).filter((f) => f.kind === "error");

// Agent M's own model with the one line `from` replaced by `to` (a whole line, so that nothing else changes); -> { text, line }.
function breakLine(from, to) {
  const lines = OWN.split("\n");
  const at = lines.indexOf(from);
  assert.ok(at >= 0, `the line "${from}" stands in docs/process-models/scrum-wip.md`);
  assert.equal(lines.indexOf(from, at + 1), -1, `the line "${from}" stands once`);
  lines.splice(at, 1, ...(to === null ? [] : [to]));
  return { text: lines.join("\n"), line: at + 1 };
}
// Agent M's own model with `line` inserted after the line `after`; -> { text, line } of the inserted line.
function insertAfter(after, line) {
  const lines = OWN.split("\n");
  const at = lines.indexOf(after);
  assert.ok(at >= 0, `the line "${after}" stands in docs/process-models/scrum-wip.md`);
  lines.splice(at + 1, 0, line);
  return { text: lines.join("\n"), line: at + 2 };
}

// A FINDING READS LIKE A COMPILER MESSAGE — the form every finding below is held to.
function compilerForm(f) {
  assert.ok(f.artifact, "the finding names the artifact");
  assert.ok(Number.isInteger(f.line) && f.line >= 1, "the finding names a line");
  assert.ok(["error", "warning"].includes(f.kind), "the finding is an error or a warning");
  assert.ok(MODEL_RULES.has(f.rule), `the finding names a rule by name: ${f.rule}`);
  assert.ok(f.what && f.fix, "the finding says what is wrong and the correction expected");
}

// UC-031 postcondition, docs/process.md: Agent M declares scrum-wip, so its definition must validate. Expected, from the file as
// written: pulled work, the measure "items per state over time", a WIP limit of 4, no time box, sprints; its five phases and
// three gates, each gate decided by the role Product Owner; and no error.
test("release · process model: Agent M's own model is read with its limit and measure, and validates without an error", () => {
  const m = parseModel(OWN);
  assert.equal(m.name, "scrum-wip");
  assert.equal(m.kind, "pulled");
  assert.equal(m.measure, "items per state over time");
  assert.equal(m.flow.wipLimit, 4, "the WIP limit of 4");
  assert.equal(m.flow.sprints, true, "the work runs in sprints");
  assert.equal(m.flow.timeBox, null, "no time box");
  assert.deepEqual(m.phases.map((p) => p.name), ["Sprint planning", "Development", "Release testing", "Sprint review", "Retrospective"]);
  assert.deepEqual(m.gates.map((g) => `${g.from} → ${g.to}`),
    ["Development → Release testing", "Release testing → Sprint review", "Retrospective → Sprint planning"]);
  for (const g of m.gates) assert.deepEqual(g.decider, { role: "Product Owner" }, `${g.from} → ${g.to} is decided by the Product Owner`);
  assert.deepEqual(validateModel(m), []);
});

// One broken definition per rule. Each entry: the change to Agent M's own model, the rule the error must name (or null where
// the SPEC leaves the rule's name to the validation of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED and its neighbours), and
// the field the error must stand beside (UC-031 step 4: "lists each error beside the field that causes it").
const BROKEN = {
  // The SPEC's check of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED, rule by rule:
  "a transition naming a phase the model lacks":
    { ...breakLine("| Release testing | Development | back |", "| Release testing | Hotfix | back |"), rule: null, field: /^Transitions/ },
  "a verification pair naming a phase the model lacks":
    { ...breakLine("| Development | Release testing |", "| Development | Acceptance testing |"), rule: null, field: /^Verification pairs/ },
  "a gate without artifacts":
    { ...breakLine("| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |",
      "| Development → Release testing | — | CI is green on it and the Definition of Done holds | Product Owner |"), rule: GATE_WHAT, field: /^Gates/ },
  "a gate without a condition":
    { ...breakLine("| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |",
      "| Development → Release testing | the item's pull request into the sprint branch, with its code and TST |  | Product Owner |"), rule: GATE_WHAT, field: /^Gates/ },
  "a role without capabilities":
    { ...breakLine("| Scrum Master | either | read the repository |", "| Scrum Master | either |  |"), rule: CAPABILITIES, field: /^Roles/ },
  "a phase without a role":
    { ...breakLine("| Release testing | Release tester | TST (release tests of the selected items) |", "| Release testing |  | TST (release tests of the selected items) |"),
      rule: null, field: /^Phases/ },
  "a missing declaration of whether work is planned or pulled":
    { ...breakLine("kind: pulled", null), rule: null, field: /kind/i, anyLine: true },
  // A GATE NAMES WHO DECIDES IT:
  "a gate without a decider":
    { ...breakLine("| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Product Owner |",
      "| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch |  |"),
      rule: GATE_WHO, field: /^Gates/ },
  "a gate decided by a role the model does not define":
    { ...breakLine("| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Product Owner |",
      "| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Stakeholder |"),
      rule: GATE_WHO, field: /^Gates/ },
  // UC-031 step 4, the rest of its list:
  "a phase no transition reaches":
    { ...insertAfter("| Retrospective | Product Owner | sprint record (the retrospective) |", "| Refinement | Product Owner | ITM (refined items) |"),
      rule: null, field: /^(Phases|Transitions)/ },
  "a gate that checks an artifact kind no earlier phase produces":
    { ...breakLine("| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |",
      "| Development → Release testing | the item's pull request into the sprint branch, with its code, TST and the threat model ARC | CI is green on it and the Definition of Done holds | Product Owner |"),
      rule: GATE_WHAT, field: /^Gates/ },
  "pulled work with neither a time box nor a WIP limit":
    { ...breakLine("| WIP limit | 4 |", "| WIP limit | none |"), rule: null, field: /^Flow control/, anyLine: true },
  "pulled work with both a time box and a WIP limit":
    { ...breakLine("| Time box | none |", "| Time box | 2 weeks |"), rule: null, field: /^Flow control/, anyLine: true },
  "a progress measure that does not fit the kind of work":
    { ...breakLine("measure: items per state over time", "measure: plan entries per phase"), rule: MEASURE, field: /measure/i },
  // PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE: "A definition naming an unknown measure fails validation."
  "an unknown progress measure":
    { ...breakLine("measure: items per state over time", "measure: story points burned"), rule: MEASURE, field: /measure/i },
};

for (const [label, b] of Object.entries(BROKEN)) {
  test(`release · process model: ${label} is refused, beside the field that causes it`, () => {
    assert.notEqual(b.text, OWN);
    const errors = errorsOf(b.text);
    assert.ok(errors.length >= 1, "the definition is refused: at least one error");
    for (const f of errors) compilerForm(f);
    const hit = errors.find((f) => b.field.test(String(f.field)) && (b.anyLine || f.line === b.line));
    assert.ok(hit, `an error stands beside ${b.field} on line ${b.line}; got ${JSON.stringify(errors.map((f) => [f.line, f.field, f.rule]))}`);
    if (b.rule) assert.equal(hit.rule, b.rule, "the error names the rule it violates");
  });
}

// A GATE NAMES WHO DECIDES IT, counter-proof: "a gate decided by a role and one decided by a named CI check both pass validation."
// Expected: Agent M's own model (its gates decided by the role Product Owner) with one gate decided by a named CI check instead
// validates without an error, and the gate is read as decided by that check.
test("release · process model: a gate decided by a role and one decided by a named CI check both pass", () => {
  const b = breakLine("| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |",
    "| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | CI check `tests` |");
  const m = parseModel(b.text);
  assert.deepEqual(m.gates[0].decider, { check: "tests" }, "the gate is decided by the check named tests");
  assert.deepEqual(m.gates[1].decider, { role: "Product Owner" }, "the next gate is decided by a role");
  assert.deepEqual(validateModel(m), []);
});

// UC-031 step 4 and 4a: validation names every error, and the definition it checks is not changed by it.
test("release · process model: validation leaves the definition as it was, and names every error of a definition with two", () => {
  const two = breakLine("| Scrum Master | either | read the repository |", "| Scrum Master | either |  |").text
    .replace("| Release testing | Development | back |", "| Release testing | Hotfix | back |");
  const m = parseModel(two);
  const before = JSON.stringify(m);
  const errors = validateModel(m).filter((f) => f.kind === "error");
  assert.equal(JSON.stringify(m), before, "the model is not changed by its validation");
  assert.ok(errors.some((f) => /^Roles/.test(f.field)), "the role without capabilities is named");
  assert.ok(errors.some((f) => /^Transitions/.test(f.field)), "the transition to a phase the model lacks is named");
});
