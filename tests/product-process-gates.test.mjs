// The role and gate reading foundation (ITM-292) — MOD-product-process' public role lookup, gate-record schema, derived
// gate states and decision eligibility from docs/architecture/MOD-product-process.md. Run: node --test
// tests/product-process-gates.test.mjs
//
// Module: MOD-product-process
// Level: unit
//
// The fixture declaration is read through the existing public declarationSchema, and its workflow is made through the
// existing public workflowOf. Gate-record fixtures are read and written through MOD-documents. No fixture replaces the
// module's workflow logic. Each case states its input and expected result in its declaration; the counter-proofs are
// recorded with this job's review evidence.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument, writeDocument } from "../src/documents/index.mjs";
import { declarationSchema, gateSchema, gateStates, holdsRole, mayDecide, workflowOf } from "../src/product-process/index.mjs";

const DECLARATION_PATH = "docs/process.md";
const GATE_PATH = "docs/gates/20261010-0000-development-review-a1b2.md";
const BLOBS = {
  plan: "1111111111111111111111111111111111111111",
  implementationBefore: "2222222222222222222222222222222222222222",
  implementationNow: "3333333333333333333333333333333333333333",
  release: "4444444444444444444444444444444444444444",
  retrospective: "5555555555555555555555555555555555555555",
  ci: "6666666666666666666666666666666666666666",
};

const declarationOf = (text) => readDocument(declarationSchema, DECLARATION_PATH, text);

const DECLARATION = `---
model: fixture-scrum
model_file: docs/process-models/fixture-scrum.md
model_version: 0123456789abcdef0123456789abcdef01234567
---
# How the fixture product is developed

## Roles

| Role | Participants |
|---|---|
| Product Owner | alice, bob |
| Developers | dev-a |

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold for every pull request; no condition is added.
`;

const MODEL = {
  name: "fixture-scrum",
  phases: [
    { name: "Planning", role: "Product Owner", produces: ["ITM"] },
    { name: "Development", role: "Developers", produces: ["MOD", "TST"] },
    { name: "Review", role: "Product Owner", produces: ["TST"] },
    { name: "Release", role: "Product Owner", produces: ["TST"] },
  ],
  transitions: [
    { from: "Planning", to: "Development", kind: "sequence" },
    { from: "Development", to: "Review", kind: "sequence" },
    { from: "Review", to: "Release", kind: "sequence" },
  ],
  pairs: [],
  gates: [
    { from: "Planning", to: "Development", artifacts: "plan", condition: "the plan is accepted", decider: "Product Owner" },
    { from: "Development", to: "Review", artifacts: "implementation", condition: "the implementation is checked", decider: "Product Owner" },
    { from: "Review", to: "Release", artifacts: "release test", condition: "the release test is green", decider: "Product Owner" },
    { from: "Release", to: "Planning", artifacts: "retrospective", condition: "the retrospective is recorded", decider: "Product Owner" },
    { from: "Development", to: "Release", artifacts: "CI", condition: "the named check is green", decider: "check: ci" },
  ],
  roles: [
    { name: "Product Owner", filledBy: "either", capabilities: [] },
    { name: "Developers", filledBy: "either", capabilities: [] },
  ],
};

const WORKFLOW = workflowOf(declarationOf(DECLARATION), MODEL, [], "# Fixture SPEC\n");
const gate = (name) => WORKFLOW.gates.find((candidate) => candidate.name === name);

function record(fields, reason = "") {
  return readDocument(gateSchema, GATE_PATH, [
    "---",
    `gate: ${fields.gate}`,
    `job: ${fields.job ?? ""}`,
    `decider: ${fields.decider}`,
    `role: ${fields.role}`,
    `decision: ${fields.decision}`,
    "on:",
    ...fields.on.map((entry) => `  - ${entry}`),
    `date: ${fields.date ?? "2026-10-10 00:00 UTC"}`,
    "---",
    "# Gate decision",
    "",
    "## Reason",
    "",
    reason,
    "",
  ].join("\n"));
}

// TST-292012
// level: unit
// module: MOD-product-process
// guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// given: a declaration read through declarationSchema that assigns alice and bob to Product Owner and dev-a to Developers
// input: holdsRole for each assigned participant and for an absent role or holder
// expect: each assignment is true, while an unassigned participant and an absent role are false
test("TST-292012: holdsRole reads the declaration's actual role assignment", () => {
  const declaration = declarationOf(DECLARATION);
  assert.equal(holdsRole(declaration, "alice", "Product Owner"), true);
  assert.equal(holdsRole(declaration, "bob", "Product Owner"), true);
  assert.equal(holdsRole(declaration, "dev-a", "Developers"), true);
  assert.equal(holdsRole(declaration, "dev-a", "Product Owner"), false);
  assert.equal(holdsRole(declaration, "alice", "Scrum Master"), false);
});

// TST-292013
// level: unit
// module: MOD-product-process
// guards: THE GATE IS RECORDED
// given: a passed gate record with every accepted front-matter field and its checked artifact blob
// input: read it with gateSchema, validate it through MOD-documents, write it, and read the written bytes again
// expect: no finding and the same gate, job, decider, role, decision, checked artifact, date, and Reason
test("TST-292013: gateSchema reads and writes every gate-record field", async () => {
  const on = [`src/product-process/index.mjs@${BLOBS.implementationNow}`];
  const original = record({ gate: gate("Development → Review").name, job: "JOB-292", decider: "alice", role: "Product Owner",
    decision: "passed", on }, "the implementation matches the checked text");

  assert.deepEqual(documentFindings(gateSchema, original), [], "known positive: the complete gate record fits its schema");
  const written = writeDocument(gateSchema, original);
  const reread = readDocument(gateSchema, GATE_PATH, written);
  assert.deepEqual(reread.fields, original.fields);
  assert.equal(reread.sections.find((section) => section.heading === "## Reason").text.trim(),
    "the implementation matches the checked text");
});

// TST-292014
// level: unit
// module: MOD-product-process
// guards: STATUS IS DERIVED FROM THE RECORDS; A GATE NAMES WHO DECIDES IT
// given: a workflow from workflowOf; passed, stale, rejected, and wrong-decider records; and current artifact blobs
// input: gateStates with those records and the current checked blobs
// expect: the valid current record passes, a changed checked text is passed on an earlier text with a difference, a valid rejection is rejected, an undecided reachable gate is pending, a later blocked gate is not reached, and a wrong-decider pass establishes no pass
test("TST-292014: gateStates derives current, stale, rejected, pending, and not-reached gates", () => {
  const texts = {
    "docs/plan.md": BLOBS.plan,
    "src/product-process/index.mjs": BLOBS.implementationNow,
    "tests/release.test.mjs": BLOBS.release,
    "docs/retrospective.md": BLOBS.retrospective,
    ".github/workflows/ci.yml": BLOBS.ci,
  };
  const records = [
    record({ gate: gate("Planning → Development").name, decider: "alice", role: "Product Owner", decision: "passed",
      on: [`docs/plan.md@${BLOBS.plan}`] }),
    record({ gate: gate("Development → Review").name, decider: "alice", role: "Product Owner", decision: "passed",
      on: [`src/product-process/index.mjs@${BLOBS.implementationBefore}`] }),
    record({ gate: gate("Review → Release").name, decider: "alice", role: "Product Owner", decision: "rejected",
      on: [`tests/release.test.mjs@${BLOBS.release}`] }, "release test failed"),
    record({ gate: gate("Development → Release").name, decider: "dev-a", role: "Product Owner", decision: "passed",
      on: [`.github/workflows/ci.yml@${BLOBS.ci}`] }),
  ];

  const states = gateStates(WORKFLOW, records, texts);
  assert.deepEqual(states.map(({ gate: name, state }) => [name, state]), [
    ["Planning → Development", "passed"],
    ["Development → Review", "passed on an earlier text"],
    ["Review → Release", "rejected"],
    ["Release → Planning", "not reached"],
    ["Development → Release", "pending"],
  ]);
  assert.match(states[1].difference, /src\/product-process\/index\.mjs/);
  assert.equal(states[4].record, null, "a wrong-decider record never establishes a pass");
});

// TST-292015
// level: unit
// module: MOD-product-process
// guards: A GATE NAMES WHO DECIDES IT; A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
// given: the workflow's Product Owner gate, its two declared holders, and its named CI check
// input: mayDecide for a role holder, a non-holder, a self-worker, the named check, and another check
// expect: the holder and named check may decide; role refusals name that role's holders, and a wrong named check has no holders
test("TST-292015: mayDecide enforces the deciding role, named check, and independent work", () => {
  const review = gate("Development → Review").name;
  const check = gate("Development → Release").name;
  assert.deepEqual(mayDecide({ name: "alice", kind: "person" }, review, WORKFLOW, []), { may: true });
  assert.deepEqual(mayDecide({ name: "ci", kind: "check" }, check, WORKFLOW, []), { may: true });
  assert.deepEqual(mayDecide({ name: "dev-a", kind: "agent" }, review, WORKFLOW, []), {
    may: false, reason: "not a holder of the deciding role", holders: ["alice", "bob"],
  });
  assert.deepEqual(mayDecide({ name: "alice", kind: "person" }, review, WORKFLOW, ["alice"]), {
    may: false, reason: "did the work this gate checks", holders: ["alice", "bob"],
  });
  assert.deepEqual(mayDecide({ name: "other", kind: "check" }, check, WORKFLOW, []), {
    may: false, reason: "not the gate's check", holders: [],
  });
});
