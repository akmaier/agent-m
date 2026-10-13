// Release coverage for UC-013. This is the release-level guard that the use case's realised SPEC requirements are
// covered by executable tests, or explicitly left to review where the SPEC says "no automatic check; at review".
// Run: node --test tests/release-uc-013-release-version.test.mjs
//
// Module: MOD-test-pages · MOD-release-evidence
// Guards: UC-013; every requirement realised by UC-013
// Level: release
//
// Input: docs/use-cases/UC-013-release-a-version.md and SPEC.md as committed text.
// Precondition: ITM-257 is implemented only in new test files by a developer independent of ITM-247 through ITM-256 and
// the change between jobs after them.
// Expected result: each realised requirement whose SPEC check names an executable test has a release coverage entry whose
// evidence file exists; each realised requirement whose SPEC check says review-only is listed in REVIEW_ONLY. Counter-proof
// notes are in the sprint review/final report.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const pathExists = (path) => existsSync(new URL(path, ROOT));

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-013-release-a-version.md").split("\n")) {
    if (line === "realises:") {
      inRealises = true;
      continue;
    }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

function specChecks() {
  const spec = read("SPEC.md");
  const checks = new Map();
  const pattern = /^\*\*(.+?)\*\*[\s\S]*?\*Check:\* ([^\n]*(?:\n(?!\*\*|## ).*)*)/gm;
  let match;
  while ((match = pattern.exec(spec))) checks.set(match[1], match[2].replace(/\s+/g, " ").trim());
  return checks;
}

const SYSTEM = "tests/system-uc-013-release-version.test.mjs";
const ROUTE = "tests/test-pages-release.test.mjs";
const EVIDENCE = "tests/release-evidence.test.mjs";

const COVERED_BY_RELEASE = {
  "CALENDAR VERSIONS": [SYSTEM, ROUTE, EVIDENCE],
  "EVERY PRODUCT HAS ITS OWN VERSION LINE": [SYSTEM, EVIDENCE, "tests/release-sprint-09-uc-001-add-product.test.mjs"],
  "A RELEASE IS TAGGED AND LOGGED": [SYSTEM, EVIDENCE, "tests/repository-hosts-tags.test.mjs"],
  "A VERSION IS NOT REWRITTEN": [SYSTEM, ROUTE, EVIDENCE, "tests/repository-hosts-tags.test.mjs"],
  "A PERSON'S OWN INPUT IS COMMITTED DIRECTLY": [SYSTEM, ROUTE, "tests/artifact-edits-save.test.mjs", "tests/release-sprint-06-uc-002-implementation-pages.test.mjs"],
  "EVERY STEP EXPLAINS ITSELF": [SYSTEM, ROUTE, "tests/test_step_explanations.py", "tests/site-frame.test.mjs"],
  "A GATE NAMES WHAT IT CHECKS": [SYSTEM, "tests/model-catalogue.test.mjs", "tests/test_gate_definition.py"],
  "THE GATE IS RECORDED": [SYSTEM, "tests/product-process-gates.test.mjs", "tests/spec-changes-retired-row.test.mjs"],
  "A RELEASE RUNS EVERY TEST AT EVERY LEVEL": [SYSTEM, EVIDENCE, "tests/test-schedule.test.mjs", "tests/result-records-outcomes.test.mjs"],
  "RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER": [SYSTEM, ROUTE, EVIDENCE, "tests/test_test_battery.py"],
  "THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON": [SYSTEM, EVIDENCE, "tests/release-itm-289-pending-report.test.mjs", "tests/test-pages-pending-release-report.test.mjs"],
  "ACCEPTING THE RELEASE TEST REPORT RELEASES": [SYSTEM, EVIDENCE],
  "A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED": [SYSTEM, ROUTE, EVIDENCE, "tests/release-evidence-293-release.test.mjs"],
};

const REVIEW_ONLY = [
  "ONE CLICK PER DECISION",
];

// TST-257101 · level: release · module: MOD-test-pages; MOD-release-evidence
// guards: UC-013; all realised requirements whose SPEC check names a test
// given: UC-013's `realises` list and SPEC's current Check lines
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY
// expect: every requirement with an executable SPEC check has coverage evidence, every review-only requirement is named, and no realised requirement is in neither or both lists
test("TST-257101: UC-013 release coverage names every automatic and review-only requirement", () => {
  const realised = ucRealises();
  const checks = specChecks();
  const automatic = realised.filter((name) => !/^no automatic check; at review/.test(checks.get(name) ?? ""));
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));

  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.length > 0, `${requirement} has coverage evidence`);
    assert.ok(files.some((file) => read(file).includes(requirement)), `${requirement} is named by at least one evidence file`);
    for (const file of files) assert.ok(pathExists(file), `${requirement} evidence exists: ${file}`);
  }
});

// TST-257102 · level: release · module: MOD-test-pages; MOD-release-evidence
// guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER; THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON; ACCEPTING THE RELEASE TEST REPORT RELEASES
// given: the UC-013 release coverage table and the system harness source
// input: inspect the evidence attached to the dashboard path, release-evidence module and review-only rule
// expect: every automatic UC-013 requirement includes the system harness, the release-specific requirements include MOD-release-evidence evidence, and only ONE CLICK PER DECISION remains review-only
test("TST-257102: UC-013 release evidence includes the dashboard path and release-evidence path", () => {
  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.includes(SYSTEM), `${requirement} is covered by the system path`);
  }

  for (const requirement of [
    "CALENDAR VERSIONS",
    "EVERY PRODUCT HAS ITS OWN VERSION LINE",
    "A RELEASE IS TAGGED AND LOGGED",
    "A VERSION IS NOT REWRITTEN",
    "A RELEASE RUNS EVERY TEST AT EVERY LEVEL",
    "RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER",
    "THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON",
    "ACCEPTING THE RELEASE TEST REPORT RELEASES",
    "A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED",
  ]) {
    assert.ok(COVERED_BY_RELEASE[requirement].includes(EVIDENCE), `${requirement} includes release-evidence evidence`);
  }

  assert.deepEqual(REVIEW_ONLY, ["ONE CLICK PER DECISION"]);
  assert.match(read(SYSTEM), /test-pages-release\.test\.mjs/, "the system harness imports the route tests it validates");
});
