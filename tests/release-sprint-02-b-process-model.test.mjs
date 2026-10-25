// Release tests of sprint 02, strand B — process model definitions, read and validated before use (ITM-143, testing ITM-027).
// Written by tester-opus (claude-opus-5-5), the Release tester of docs/process.md, who implemented nothing of the strand, from
// the SPEC rules and UC-031 alone; started on sprint/02 at 58b7fe4, 2026-10-01. They ask MOD-model-catalogue: catalogue reads a
// definition as a Model, modelFindings validates it.
//
// Module: MOD-model-catalogue
// Guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; A GATE NAMES WHAT IT CHECKS; A GATE NAMES WHO DECIDES IT; A ROLE NAMES THE CAPABILITIES IT NEEDS; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; UC-031
// Level: release
//
// What is tested: Agent M's own model, docs/process-models/scrum-wip.md, is read with its limit, its sprints and its measure and
// validates without an error; and for every rule the SPEC's check of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED names, and
// every error UC-031 step 4 lists, one definition that breaks exactly that rule — Agent M's own model with one line changed — is
// refused with an error on the line of the part that causes it (UC-031 step 4), in the form of A FINDING READS LIKE A COMPILER
// MESSAGE. The counter-proof of A GATE NAMES WHO DECIDES IT: a gate decided by a role and one decided by a named CI check both
// pass. Each expectation is stated before its case runs. "Each book model in the shipped catalogue must pass" is
// tests/test_model_validation.py's.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readDocument } from "../src/documents/index.mjs";
import { catalogue, modelFindings, modelSchema } from "../src/model-catalogue/index.mjs";

const ROOT = new URL("../", import.meta.url);
const PATH = "docs/process-models/scrum-wip.md";
const OWN = readFileSync(new URL(PATH, ROOT), "utf8");

const VALIDATED = "A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED";
const GATE_WHAT = "A GATE NAMES WHAT IT CHECKS";
const GATE_WHO = "A GATE NAMES WHO DECIDES IT";
const CAPABILITIES = "A ROLE NAMES THE CAPABILITIES IT NEEDS";
const MEASURE = "PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE";
// The requirements a model definition's validation may name: the rules of §5 and §13 that a definition can break.
const MODEL_RULES = new Set([VALIDATED, GATE_WHAT, GATE_WHO, CAPABILITIES, MEASURE, "THE MODEL DETERMINES THE PHASES AND THE GATES",
  "A PROCESS MODEL ORGANISES PEOPLE AND AGENTS", "A ROLE NAMES HOW MANY FILL IT"]);

const findingsOf = (text) => modelFindings(readDocument(modelSchema.model, PATH, text));
const errorsOf = (text) => findingsOf(text).filter((f) => f.kind === "error");
// The Model catalogue reads from `text` as the instance's own model at PATH.
async function modelOf(text) {
  const files = { [PATH]: text };
  const snapshot = { paths: Object.keys(files), read: async (p) => files[p] ?? null, blob: (p) => (p in files ? "b".repeat(40) : null) };
  return (await catalogue(snapshot)).models.find((m) => m.path === PATH);
}

// Agent M's own model with the one line `from` replaced by `to` (a whole line, so that nothing else changes); -> { text, line }.
function breakLine(from, to) {
  const lines = OWN.split("\n");
  const at = lines.indexOf(from);
  assert.ok(at >= 0, `the line "${from}" stands in ${PATH}`);
  assert.equal(lines.indexOf(from, at + 1), -1, `the line "${from}" stands once`);
  lines.splice(at, 1, ...(to === null ? [] : [to]));
  return { text: lines.join("\n"), line: at + 1 };
}
// Agent M's own model with `line` inserted after the line `after`; -> { text, line } of the inserted line.
function insertAfter(after, line) {
  const lines = OWN.split("\n");
  const at = lines.indexOf(after);
  assert.ok(at >= 0, `the line "${after}" stands in ${PATH}`);
  lines.splice(at + 1, 0, line);
  return { text: lines.join("\n"), line: at + 2 };
}
// The lines of the section under `heading` in Agent M's own model, from its heading to the line before the next one.
function sectionLines(heading) {
  const lines = OWN.split("\n");
  const at = lines.indexOf(heading);
  assert.ok(at >= 0, `the heading "${heading}" stands in ${PATH}`);
  const next = lines.findIndex((l, i) => i > at && l.startsWith("## "));
  return [at + 1, next < 0 ? lines.length : next];
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
test("release · process model: Agent M's own model is read with its limit and measure, and validates without an error", async () => {
  const m = await modelOf(OWN);
  assert.equal(m.name, "scrum-wip");
  assert.equal(m.kind, "pulled");
  assert.equal(m.measure, "items per state over time");
  assert.equal(m.flow.wip, 4, "the WIP limit of 4");
  assert.equal(m.flow.sprints, true, "the work runs in sprints");
  assert.equal(m.flow.timeBox, null, "no time box");
  assert.deepEqual(m.phases.map((p) => p.name), ["Sprint planning", "Development", "Release testing", "Sprint review", "Retrospective"]);
  assert.deepEqual(m.gates.map((g) => `${g.from} → ${g.to}`),
    ["Development → Release testing", "Release testing → Sprint review", "Retrospective → Sprint planning"]);
  for (const g of m.gates) assert.equal(g.decider, "Product Owner", `${g.from} → ${g.to} is decided by the Product Owner`);
  assert.deepEqual(errorsOf(OWN), []);
});

const FIRST_GATE = "| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |";
const SECOND_GATE = "| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Product Owner |";

// One broken definition per rule. Each entry: the change to Agent M's own model, the rule the error must name (or null where
// the SPEC leaves the rule's name to the validation of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED and its neighbours), and
// where the error must stand (UC-031 step 4: "lists each error beside the field that causes it"): on the changed line, or —
// `within` — on a line of the part, or — `about` — anywhere, saying what it is about.
const BROKEN = {
  // The SPEC's check of A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED, rule by rule:
  "a transition naming a phase the model lacks":
    { ...breakLine("| Release testing | Development | back |", "| Release testing | Hotfix | back |"), rule: null },
  "a verification pair naming a phase the model lacks":
    { ...breakLine("| Development | Release testing |", "| Development | Acceptance testing |"), rule: null },
  "a gate without artifacts":
    { ...breakLine(FIRST_GATE, "| Development → Release testing | — | CI is green on it and the Definition of Done holds | Product Owner |"), rule: GATE_WHAT },
  "a gate without a condition":
    { ...breakLine(FIRST_GATE, "| Development → Release testing | the item's pull request into the sprint branch, with its code and TST |  | Product Owner |"), rule: GATE_WHAT },
  "a role without capabilities":
    { ...breakLine("| Scrum Master | either | one | read the repository |", "| Scrum Master | either | one |  |"), rule: CAPABILITIES },
  "a phase without a role":
    { ...breakLine("| Release testing | Developers | TST (release tests of the selected items) |", "| Release testing |  | TST (release tests of the selected items) |"),
      rule: null },
  "a missing declaration of whether work is planned or pulled":
    { ...breakLine("kind: pulled", null), rule: null, about: /\bkind\b/ },
  // A GATE NAMES WHO DECIDES IT:
  "a gate without a decider":
    { ...breakLine(SECOND_GATE, SECOND_GATE.replace(" Product Owner |", "  |")), rule: GATE_WHO },
  "a gate decided by a role the model does not define":
    { ...breakLine(SECOND_GATE, SECOND_GATE.replace(" Product Owner |", " Stakeholder |")), rule: GATE_WHO },
  // UC-031 step 4, the rest of its list:
  "a phase no transition reaches":
    { ...insertAfter("| Retrospective | Product Owner | sprint record (the retrospective) |", "| Refinement | Product Owner | ITM (refined items) |"),
      rule: null },
  "a gate that checks an artifact kind no earlier phase produces":
    { ...breakLine(FIRST_GATE, FIRST_GATE.replace("with its code and TST", "with its code, TST and the threat model ARC")), rule: GATE_WHAT },
  "pulled work with neither a time box nor a WIP limit":
    { ...breakLine("| WIP limit | 4 |", "| WIP limit | — |"), rule: VALIDATED, within: sectionLines("## Flow control") },
  "pulled work with both a time box and a WIP limit":
    { ...breakLine("| Time box | none |", "| Time box | 2 weeks |"), rule: VALIDATED, within: sectionLines("## Flow control") },
  "a progress measure that does not fit the kind of work":
    { ...breakLine("measure: items per state over time", "measure: plan entries per phase"), rule: MEASURE },
  // PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE: "A definition naming an unknown measure fails validation."
  "an unknown progress measure":
    { ...breakLine("measure: items per state over time", "measure: story points burned"), rule: MEASURE },
};

for (const [label, b] of Object.entries(BROKEN)) {
  test(`release · process model: ${label} is refused, on the line of the part that causes it`, () => {
    assert.notEqual(b.text, OWN);
    const errors = errorsOf(b.text);
    assert.ok(errors.length >= 1, "the definition is refused: at least one error");
    for (const f of errors) compilerForm(f);
    const stands = (f) => (b.about ? b.about.test(f.what) : b.within ? f.line >= b.within[0] && f.line <= b.within[1] : f.line === b.line);
    const hit = errors.find((f) => stands(f) && (!b.rule || f.rule === b.rule));
    assert.ok(hit, `an error${b.rule ? ` naming ${b.rule}` : ""} stands ${b.about ? `about ${b.about}` : b.within ? `within lines ${b.within.join("–")}` : `on line ${b.line}`}; got ${JSON.stringify(errors.map((f) => [f.line, f.rule, f.what]))}`);
  });
}

// A GATE NAMES WHO DECIDES IT, counter-proof: "a gate decided by a role and one decided by a named CI check both pass validation."
// Expected: Agent M's own model (its gates decided by the role Product Owner) with one gate decided by a named CI check instead
// validates without an error, and the gate is read as decided by that check.
test("release · process model: a gate decided by a role and one decided by a named CI check both pass", async () => {
  const b = breakLine(FIRST_GATE, FIRST_GATE.replace(" Product Owner |", " check: tests |"));
  const m = await modelOf(b.text);
  assert.equal(m.gates[0].decider, "check: tests", "the gate is decided by the check named tests");
  assert.equal(m.gates[1].decider, "Product Owner", "the next gate is decided by a role");
  assert.deepEqual(errorsOf(b.text), []);
});

// UC-031 step 4 and 4a: validation names every error, and the definition it checks is not changed by it.
test("release · process model: validation leaves the definition as it was, and names every error of a definition with two", () => {
  const capabilities = breakLine("| Scrum Master | either | one | read the repository |", "| Scrum Master | either | one |  |");
  const transition = breakLine("| Release testing | Development | back |", "| Release testing | Hotfix | back |");
  const two = capabilities.text.replace("| Release testing | Development | back |", "| Release testing | Hotfix | back |");
  const d = readDocument(modelSchema.model, PATH, two);
  const before = JSON.stringify(d);
  const errors = modelFindings(d).filter((f) => f.kind === "error");
  assert.equal(JSON.stringify(d), before, "the definition is not changed by its validation");
  assert.ok(errors.some((f) => f.line === capabilities.line && f.rule === CAPABILITIES), "the role without capabilities is named");
  assert.ok(errors.some((f) => f.line === transition.line), "the transition to a phase the model lacks is named");
});
