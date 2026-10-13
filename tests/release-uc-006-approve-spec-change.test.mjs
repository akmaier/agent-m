// Release coverage for UC-006. This is the release-level guard that the use case's realised SPEC requirements are either
// covered by executable tests, or explicitly left to review where the SPEC says "no automatic check; at review".
// Run: node --test tests/release-uc-006-approve-spec-change.test.mjs
//
// Module: MOD-review-pages · MOD-spec-changes · MOD-workflow-entries
// Guards: UC-006; every requirement realised by UC-006
// Level: release
//
// Input: docs/use-cases/UC-006-approve-a-specification-change.md and SPEC.md as committed text.
// Precondition: ITM-371 is implemented only in new test files by a developer independent of ITM-302, ITM-312, ITM-315,
// ITM-339, ITM-340, ITM-364, ITM-342, ITM-357, ITM-394 and ITM-397.
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
  for (const line of read("docs/use-cases/UC-006-approve-a-specification-change.md").split("\n")) {
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

const SYSTEM = "tests/system-uc-006-approve-spec-change.test.mjs";
const COVERED_BY_RELEASE = {
  "A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN": [SYSTEM, "tests/test_spec_gate.py", "tests/spec-changes-accept.test.mjs"],
  "NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT": [SYSTEM, "tests/test_proposal_shows_current.py", "tests/spec-changes-entry-view.test.mjs"],
  "THE APPROVED TEXT IS TAKEN VERBATIM": [SYSTEM, "tests/test_verbatim.py", "tests/spec-changes-accept.test.mjs"],
  "THE GATE IS RECORDED": [SYSTEM, "tests/spec-changes-retired-row.test.mjs", "tests/product-process-gates.test.mjs"],
  "THE REPLACED TEXT STAYS REACHABLE": [SYSTEM, "tests/test_replaced_in_history.py", "tests/spec-changes-accept.test.mjs"],
  "A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST": [SYSTEM, "tests/test_impact_list.py", "tests/spec-changes-entry-view.test.mjs"],
  "AN APPROVAL NAMES THE EXACT TEXT": [SYSTEM, "tests/test_approval_records.py", "tests/spec-changes-accept.test.mjs"],
  "A STALE APPROVAL IS NOT APPLIED": [SYSTEM, "tests/test_apply_approvals.py", "tests/spec-changes-accept.test.mjs", "tests/workflow-entries-apply-approvals.test.mjs"],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [SYSTEM, "tests/review-core.test.mjs", "tests/review-pages-edit-entry.test.mjs"],
  "WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK": [SYSTEM, "tests/review-core.test.mjs", "tests/review-pages-edit-entry.test.mjs"],
  "EDITS ARE PREPARED ON THE DASHBOARD": [SYSTEM, "tests/review-core.test.mjs", "tests/review-pages-edit-entry.test.mjs"],
  "ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON": [SYSTEM, "tests/test_approval_records.py", "tests/spec-changes-accept.test.mjs"],
  "AN ACCEPTED SPEC CHANGE IS WRITTEN WITH ITS APPROVAL": [SYSTEM, "tests/review-core.test.mjs", "tests/spec-changes-accept.test.mjs"],
  "WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE": [SYSTEM, "tests/test_apply_approvals.py", "tests/workflow-entries-apply-approvals.test.mjs"],
  "A QUEUE IS ACCEPTED IN ITS ORDER": [SYSTEM, "tests/review-core.test.mjs", "tests/spec-changes-accept.test.mjs"],
  "SEVERAL FILES ARE ACCEPTED IN ONE CLICK": [SYSTEM, "tests/review-core.test.mjs", "tests/spec-changes-accept.test.mjs"],
};

const REVIEW_ONLY = [
  "A RULE IS CHECKABLE",
  "NO STATE IN THE SPECIFICATION",
  "ONE CLICK PER DECISION",
];

// TST-371101 · level: release · module: MOD-review-pages; MOD-spec-changes; MOD-workflow-entries
// guards: UC-006; all realised requirements whose SPEC check names a test
// given: UC-006's `realises` list and SPEC's current Check lines
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY
// expect: every requirement with an executable SPEC check has coverage evidence, every review-only requirement is named, and no realised requirement is in neither or both lists
test("TST-371101: UC-006 release coverage names every automatic and review-only requirement", () => {
  const realised = ucRealises();
  const checks = specChecks();
  const automatic = realised.filter((name) => !/^no automatic check; at review/.test(checks.get(name) ?? ""));
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));

  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.length > 0, `${requirement} has coverage evidence`);
    for (const file of files) assert.ok(pathExists(file), `${requirement} evidence exists: ${file}`);
  }
});

// TST-371102 · level: release · module: MOD-review-pages; MOD-spec-changes; MOD-workflow-entries
// guards: UC-006; A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN; WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
// given: the release coverage table
// input: inspect the evidence attached to the dashboard path and no-token workflow path
// expect: the system test is evidence for every automatic UC-006 requirement, while the workflow-specific requirements also name the workflow-entry unit test
test("TST-371102: UC-006 release evidence includes the page path and the instance workflow path", () => {
  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.includes(SYSTEM), `${requirement} is covered by the system path`);
  }
  assert.ok(COVERED_BY_RELEASE["WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE"].includes("tests/workflow-entries-apply-approvals.test.mjs"));
  assert.ok(COVERED_BY_RELEASE["A STALE APPROVAL IS NOT APPLIED"].includes("tests/workflow-entries-apply-approvals.test.mjs"));
});
