// Independent release coverage for ITM-292's delivered role and gate readers. It uses the public
// MOD-product-process interface with declared-process, workflow, and gate-record document snapshots.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument, writeDocument } from "../src/documents/index.mjs";
import { declarationSchema, gateSchema, gateStates, holdsRole, mayDecide, workflowOf } from "../src/product-process/index.mjs";

const DECLARATION_PATH = "docs/process.md";
const gatePath = (name) => `docs/gates/${name}.md`;
const TEXTS = {
  "docs/plan.md": "1111111111111111111111111111111111111111",
  "src/product-process/gates.mjs": "2222222222222222222222222222222222222222",
  "tests/release-itm-292-product-process.test.mjs": "3333333333333333333333333333333333333333",
};

const declarationText = `---
model: release-fixture
model_file: docs/process-models/release-fixture.md
model_version: 0123456789abcdef0123456789abcdef01234567
---
# Release fixture process

## Roles

| Role | Participants |
|---|---|
| Product Owner | owner-a, owner-b |
| Developers | implementer |

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|

## Definition of Done

The job rules hold for every pull request; no condition is added.
`;

const model = {
  name: "release-fixture",
  phases: [
    { name: "Planning", role: "Product Owner", produces: ["ITM"] },
    { name: "Development", role: "Developers", produces: ["MOD"] },
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
    { from: "Review", to: "Release", artifacts: "release test", condition: "the release test is green", decider: "check: ci" },
  ],
  roles: [
    { name: "Product Owner", filledBy: "either", capabilities: [] },
    { name: "Developers", filledBy: "either", capabilities: [] },
  ],
};

const declaration = () => readDocument(declarationSchema, DECLARATION_PATH, declarationText);
const workflow = () => workflowOf(declaration(), model, [], "# Fixture SPEC\n");
const namedGate = (name) => workflow().gates.find((candidate) => candidate.name === name);

function record({ name, decision = "passed", decider = "owner-a", role = "Product Owner", on, path = gatePath(name), reason = "release fixture decision" }) {
  return readDocument(gateSchema, path, [
    "---", `gate: ${name}`, "job: JOB-20261010-0201-e19release292", `decider: ${decider}`, `role: ${role}`,
    `decision: ${decision}`, "on:", ...on.map((entry) => `  - ${entry}`), "date: 2026-10-10 02:11 UTC", "---",
    "# Gate decision", "", "## Reason", "", reason, "",
  ].join("\n"));
}

// TST-292016
// level: release
// module: MOD-product-process
// guards: A JOB GOES ONLY TO A HOLDER OF ITS ROLE; A GATE NAMES WHO DECIDES IT
// given: a declared process snapshot assigning two Product Owners and an implementer, and its declared workflow model
// input: public holdsRole and workflowOf for assigned and unassigned participants and the Development-to-Review gate
// expect: only the declared holders match their roles, and the resolved gate retains its declared deciding role and condition
test("TST-292016: declared roles and workflow gates resolve through the public process interface", () => {
  const resolved = workflow();
  assert.equal(holdsRole(declaration(), "owner-a", "Product Owner"), true);
  assert.equal(holdsRole(declaration(), "implementer", "Product Owner"), false);
  assert.deepEqual(resolved.gates[1], {
    name: "Development → Review", from: "Development", to: "Review", artifacts: "implementation",
    condition: "the implementation is checked", decider: "Product Owner", addedBy: null, practice: null,
  });
});

// TST-292017
// level: release
// module: MOD-product-process
// guards: THE GATE IS RECORDED
// given: a release-review gate record snapshot with its required gate, decider, role, decision, checked text, and reason
// input: public gateSchema through MOD-documents validates, writes, and reads the record
// expect: the complete record has no finding and preserves every field and its recorded reason after the document round trip
test("TST-292017: a complete declared gate record is preserved by the public gate schema", () => {
  const original = record({ name: namedGate("Development → Review").name, on: [`src/product-process/gates.mjs@${TEXTS["src/product-process/gates.mjs"]}`] });
  assert.deepEqual(documentFindings(gateSchema, original), []);
  const reread = readDocument(gateSchema, original.path, writeDocument(gateSchema, original));
  assert.deepEqual(reread.fields, original.fields);
  assert.equal(reread.sections.find((section) => section.heading === "## Reason").text.trim(), "release fixture decision");
});

// TST-292018
// level: release
// module: MOD-product-process
// guards: STATUS IS DERIVED FROM THE RECORDS; THE GATE IS RECORDED
// given: current, stale, rejected, mismatched-decider, and absent gate-record snapshots over the declared workflow's current text blobs
// input: public gateStates evaluates the workflow records against those current blobs
// expect: a current valid record passes, changed evidence is shown as passed on an earlier text, a valid rejection preserves its record and reason, an invalid decider never passes, and unrecorded reachable and blocked gates are pending and not reached
test("TST-292018: gate states distinguish current evidence, stale evidence, rejection, invalid deciders, and absent records", () => {
  const flow = workflow();
  const rejected = record({ name: "Review → Release", decision: "rejected", decider: "check: ci", role: "check", path: gatePath("release-rejected"),
    on: [`tests/release-itm-292-product-process.test.mjs@${TEXTS["tests/release-itm-292-product-process.test.mjs"]}`], reason: "release test failed" });
  const states = gateStates(flow, [
    record({ name: "Planning → Development", on: [`docs/plan.md@${TEXTS["docs/plan.md"]}`] }),
    record({ name: "Development → Review", on: ["src/product-process/gates.mjs@old-checked-blob"] }),
    record({ name: "Review → Release", decider: "implementer", role: "Product Owner", on: [`tests/release-itm-292-product-process.test.mjs@${TEXTS["tests/release-itm-292-product-process.test.mjs"]}`] }),
    rejected,
  ], TEXTS);
  assert.deepEqual(states.map(({ gate, state }) => [gate, state]), [
    ["Planning → Development", "passed"], ["Development → Review", "passed on an earlier text"], ["Review → Release", "rejected"],
  ]);
  assert.match(states[1].difference, /old-checked-blob/);
  assert.deepEqual(states[2], { gate: "Review → Release", state: "rejected", record: rejected.path, needs: null, difference: null });
  assert.equal(rejected.sections.find((section) => section.heading === "## Reason").text.trim(), "release test failed");
  const pending = gateStates(flow, [], TEXTS);
  assert.equal(pending[0].state, "pending");
  assert.equal(pending[1].state, "not reached");
});

// TST-292019
// level: release
// module: MOD-product-process
// guards: A GATE NAMES WHO DECIDES IT; A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
// given: the declared role-holder gate and named CI-check gate, with the implementer identified as checked work
// input: public mayDecide for a holder, non-holder, self-deciding holder, named check, and mismatched check
// expect: only an independent declared holder and the named check may decide; all refusals retain their role-holder or check reason
test("TST-292019: independent declared decision authority refuses implementers and mismatched checks", () => {
  const flow = workflow();
  assert.deepEqual(mayDecide({ name: "owner-a", kind: "person" }, "Development → Review", flow, []), { may: true });
  assert.deepEqual(mayDecide({ name: "implementer", kind: "agent" }, "Development → Review", flow, []), {
    may: false, reason: "not a holder of the deciding role", holders: ["owner-a", "owner-b"],
  });
  assert.deepEqual(mayDecide({ name: "owner-a", kind: "person" }, "Development → Review", flow, ["owner-a"]), {
    may: false, reason: "did the work this gate checks", holders: ["owner-a", "owner-b"],
  });
  assert.deepEqual(mayDecide({ name: "ci", kind: "check" }, "Review → Release", flow, []), { may: true });
  assert.deepEqual(mayDecide({ name: "other", kind: "check" }, "Review → Release", flow, []), {
    may: false, reason: "not the gate's check", holders: [],
  });
});
