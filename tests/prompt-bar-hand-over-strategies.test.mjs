// MOD-prompt-bar's handOverStrategies (ITM-572): the strategy sets a hand-over of the bar is prepared with in the tab, which the bar
// hands to the frame as a view hands the strategies of its kinds.
//
// Run: node --test tests/prompt-bar-hand-over-strategies.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; ONE DEFINITION, THREE DRIVERS
// Level: unit
//
// The test states its expected sets in its own text. The sets are the real modules' own objects. The counter-proof (a planted fault in
// src/prompt-bar/hand-over.mjs and the test's failing result) is recorded in the pull request.

import assert from "node:assert/strict";
import test from "node:test";
import { approvalStrategies } from "../src/approvals/index.mjs";
import { editStrategies } from "../src/artifact-edits/index.mjs";
import { handOverStrategies } from "../src/prompt-bar/index.mjs";
import { resourceStrategies } from "../src/resource-list/index.mjs";
import { reuseStrategies } from "../src/reuse-facts/index.mjs";
import { runStrategies } from "../src/run-planner/index.mjs";
import { routeStrategies } from "../src/runtimes/index.mjs";
import { sourceStrategies } from "../src/source-register/index.mjs";
import { specStrategies } from "../src/spec-changes/index.mjs";

// TST-572007 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: the eight strategy sets that modules build and export today: approvalStrategies, specStrategies, editStrategies,
//   sourceStrategies, reuseStrategies, resourceStrategies, runStrategies and MOD-runtimes' routeStrategies
// input: MOD-prompt-bar's handOverStrategies
// expect: an array of eight entries, which are those eight sets themselves (the same objects, not copies), in the order named
//   (routeStrategies last), and no other
test("TST-572007 handOverStrategies holds the eight strategy sets that are built today, as the modules export them", () => {
  assert.ok(Array.isArray(handOverStrategies), "handOverStrategies is an array");
  assert.equal(handOverStrategies.length, 8);
  const expected = [approvalStrategies, specStrategies, editStrategies, sourceStrategies, reuseStrategies, resourceStrategies, runStrategies, routeStrategies];
  expected.forEach((set, at) => assert.equal(handOverStrategies[at], set, `entry ${at} is the module's own set`));
});
