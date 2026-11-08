// The recipe requirement-hierarchy — MOD-spec-changes' specStrategies, as the accepted text of docs/architecture/MOD-spec-changes.md states
// it under Interfaces: "the product's `docs/groups/requirements.md` as it stands, as one part that carries no artifact, since its
// requirements are those of `spec-with-queues`; no part where the product has no group file of requirements, every requirement then
// standing at the top level". For UC-005 step 2, UC-019 step 4.
// Run: node --test tests/spec-changes-requirement-hierarchy.test.mjs
//
// Module: MOD-spec-changes
// Guards: UC-005; UC-019; DERIVATION SEES THE EXISTING REQUIREMENTS; EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
// Level: unit
//
// The product is a snapshot this file holds in memory. A recipe is called as the job runner calls it, with a job's context and its
// parameters. Each test states its input and its expected result before it runs (given / input / expect); the case without a group file
// first shows the recipe giving its part on a known positive. The counter-proofs are recorded in the commit of the red tests.

import test from "node:test";
import assert from "node:assert/strict";
import * as specChanges from "../src/spec-changes/index.mjs";

const { specStrategies } = specChanges;
const GROUPS = "# Requirements — groups\n\nThe hierarchy of the requirements, each member by its name.\n\n- 3. Requirements\n  - EXPORT AS CSV\n";
const contextOf = (files) => ({ product: { snapshot: { paths: Object.keys(files), read: async (path) => (path in files ? files[path] : null), blob: () => null } }, params: {} });

// TST-2026110877 · level: unit · module: MOD-spec-changes
// guards: DERIVATION SEES THE EXISTING REQUIREMENTS; UC-005; UC-019
// given: a product whose docs/groups/requirements.md holds the group "3. Requirements" with EXPORT AS CSV, and one without that file
// input: the recipe requirement-hierarchy of specStrategies, called with each product's context and no parameter
// expect: for the first, one part named docs/groups/requirements.md whose text is the file's bytes, carrying no artifact; for the second, no part
test("TST-2026110877: requirement-hierarchy gives the group file of requirements as one part, and none where the product has none", async () => {
  const recipe = specStrategies?.recipes?.["requirement-hierarchy"];
  assert.equal(typeof recipe, "function", "specStrategies offers the recipe requirement-hierarchy");
  const parts = await recipe(contextOf({ "SPEC.md": "# S\n", "docs/groups/requirements.md": GROUPS }), {});
  assert.equal(parts.length, 1, "known positive: the file gives one part");
  assert.equal(parts[0].name, "docs/groups/requirements.md");
  assert.equal(parts[0].text, GROUPS);
  assert.deepEqual(parts[0].artifacts ?? [], []);
  assert.deepEqual(await recipe(contextOf({ "SPEC.md": "# S\n" }), {}), []);
});
