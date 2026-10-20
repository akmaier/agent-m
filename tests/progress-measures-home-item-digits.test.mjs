// The progress bar of the main page counts the steps and items of four or more digits (ITM-1088): src/home/progress.mjs, which
// MOD-progress-measures takes over (docs/architecture/MOD-progress-measures.md, Parts: "src/home/progress.mjs: removed once this module
// gives stageShares, currentStage, buildInProgress and waitingForAPerson"), reads `ITM-<nnn>` as MOD-identifiers gives it: three or more
// digits. productFacts reads the plan (docs/plan/) or else the backlog (docs/backlog/) by that form and orders it by number.
// Run: node --test tests/progress-measures-home-item-digits.test.mjs
//
// Module: MOD-progress-measures
// Guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The product is a tree held in memory;
// nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { productFacts } from "../src/home/progress.mjs";

const item = (id) => `---\nid: ${id}\ntitle: The work of ${id}\nlevel: module\nrealises:\n  - A RULE\nmodules:\n  - MOD-store\ntests:\n  - unit\norigin:\n  - UC-001\n---\n# ${id}\n\n## Outcome\n\no\n\n## Acceptance\n\na\n`;
const merged = (number, id) => ({ number, title: `${id}: the work`, head: `job/${id}`, base: "main", state: "merged", openedAt: "2026-10-05T09:05:00.000Z",
  mergedAt: "2026-10-05T10:00:00.000Z", mergeCommit: null, participantLine: null, ci: null });

// Facts of a product whose `folder` holds these items, each with a merged pull request.
async function factsOf(folder, ids) {
  const files = Object.fromEntries(ids.map((id) => [`docs/${folder}/${id}-work.md`, item(id)]));
  const tree = Object.keys(files).map((path) => ({ path, sha: "0".repeat(40) }));
  const real = ids.filter((id) => /^ITM-\d{3,}$/.test(id));
  return productFacts({ tree, text: async (path) => files[path] ?? null, pullRequests: async () => real.map((id, n) => merged(n + 1, id)) });
}

// TST-1088001 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a backlog of ITM-1000, ITM-100 and ITM-999, each with a merged pull request, and the file docs/backlog/ITM-99-work.md, whose number has two digits
// input: productFacts of that tree
// expect: the implementation counts three items from the backlog, all three done, and shows them in the order of their numbers, ITM-100, ITM-999, ITM-1000; ITM-99 is not counted
// Planted fault: reading ITM-\d{3} leaves ITM-1000 out, and the count is two; reading \d+ counts ITM-99, and the count is four.
test("the progress counts the backlog items of three and of four digits, in the order of their numbers, and not ITM-99", async () => {
  const f = await factsOf("backlog", ["ITM-1000", "ITM-100", "ITM-999", "ITM-99"]);
  assert.equal(f.implementation.from, "backlog");
  assert.equal(f.implementation.total, 3);
  assert.equal(f.implementation.done, 3);
  assert.deepEqual(f.implementation.rows.map((row) => row.id), ["ITM-100", "ITM-999", "ITM-1000"]);
});

// TST-1088002 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a plan, docs/plan/, of ITM-1000, ITM-100 and ITM-999, each with a merged pull request, and docs/plan/ITM-99-work.md
// input: productFacts of that tree
// expect: the implementation counts three steps from the plan, all done, in the order of their numbers; ITM-99 is not counted
// Planted fault: reading ITM-\d{3} for the plan only leaves ITM-1000 out of it.
test("the progress counts the plan's steps of three and of four digits, in the order of their numbers, and not ITM-99", async () => {
  const f = await factsOf("plan", ["ITM-1000", "ITM-100", "ITM-999", "ITM-99"]);
  assert.equal(f.implementation.from, "plan");
  assert.equal(f.implementation.total, 3);
  assert.equal(f.implementation.done, 3);
  assert.deepEqual(f.implementation.rows.map((row) => row.id), ["ITM-100", "ITM-999", "ITM-1000"]);
});

// TST-1088003 · level: unit · module: MOD-progress-measures
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: a product whose only item is ITM-1000, with a merged pull request
// input: productFacts of that tree
// expect: one item, from the backlog, done — the product is not read as one without a backlog
// Planted fault: reading ITM-\d{3} finds no backlog file, and the facts say the implementation comes from nowhere.
test("a product whose only item has four digits has a backlog", async () => {
  const f = await factsOf("backlog", ["ITM-1000"]);
  assert.deepEqual([f.implementation.from, f.implementation.total, f.implementation.done], ["backlog", 1, 1]);
});
