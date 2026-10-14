// Release coverage for UC-010 Run a job in GitHub Actions. This release guard maps each realised requirement to
// executable evidence, except the ITM-373-scoped exclusion that belongs to MOD-test-schedule/UC-027.
// Run: node --test tests/release-uc-010-run-a-job-in-github-actions.test.mjs
//
// Module: MOD-workflow-entries; MOD-runtimes; MOD-job-ledger; MOD-settings-pages; MOD-repository-hosts; MOD-endpoint-calls
// Guards: UC-010
// Level: release
//
// Input: docs/use-cases/UC-010-run-a-job-in-github-actions.md, docs/backlog/ITM-373-the-system-and-release-tests-of-uc-010.md,
// SPEC.md and the executable checks on this commit.
// Precondition: ITM-373 is implemented only in new test files by a developer independent of the UC-010 build-on items.
// Expected result: each in-scope realised requirement has executable evidence, the out-of-scope requirement is tied to
// ITM-373 and MOD-test-schedule text, and no realised requirement is hidden.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const UC = "docs/use-cases/UC-010-run-a-job-in-github-actions.md";
const ITEM = "docs/backlog/ITM-373-the-system-and-release-tests-of-uc-010.md";
const TEST_SCHEDULE = "docs/architecture/MOD-test-schedule.md";
const SYSTEM = "tests/system-uc-010-run-a-job-in-github-actions.test.mjs";

const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const ev = (file, id) => ({ file, id });

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read(UC).split("\n")) {
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

const COVERED_BY_RELEASE = {
  "ONE DEFINITION, THREE DRIVERS": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472724"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472726"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473204"),
  ],
  "A RUNTIME IS INTERCHANGEABLE": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/runtimes-routes.test.mjs", "TST-472706"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473201"),
    ev("tests/endpoint-driver.test.mjs", "TST-472223"),
  ],
  "A GENERATED ARTIFACT IS A PROPOSAL": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/artifact-edits-open-files.test.mjs", "TST-472035"),
  ],
  "NO SECRET IN THE REPOSITORY": [
    ev(SYSTEM, "TST-373002"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473207"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472727"),
    ev("tests/repository-hosts-clone.test.mjs", "TST-472534"),
  ],
  "A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/artifact-edits-open-files.test.mjs", "TST-472033"),
    ev("tests/repository-hosts-clone.test.mjs", "TST-472532"),
    ev("tests/system-uc-006-approve-spec-change.test.mjs", "TST-371001"),
  ],
  "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/runtimes-ci.test.mjs", "TST-472702"),
    ev("tests/job-ledger.test.mjs", "TST-472297"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473201"),
  ],
  "AGENT M WORKS WITHOUT A LOCAL INSTALLATION": [
    ev(SYSTEM, "TST-373001"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472723"),
    ev("tests/runtimes-routes.test.mjs", "TST-472706"),
  ],
  "A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET": [
    ev(SYSTEM, "TST-373002"),
    ev("tests/settings-pages-settings-regressions.test.mjs", "TST-351001"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472727"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473203"),
    ev("tests/repository-hosts-ci-pages.test.mjs", "TST-472524"),
  ],
  "A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET": [
    ev(SYSTEM, "TST-373002"),
    ev("tests/settings-pages-settings-regressions.test.mjs", "TST-351001"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472726"),
    ev("tests/runtimes-workflow.test.mjs", "TST-472727"),
    ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473203"),
  ],
};

const OUT_OF_SCOPE_BY_ITEM = {
  "A JOB RECORD STARTS NO CI RUN": "MOD-test-schedule's `ciConfiguration` (UC-027)",
};

const REVIEW_ONLY = [];

// TST-373101
// level: release
// module: MOD-workflow-entries; MOD-runtimes; MOD-job-ledger; MOD-settings-pages; MOD-repository-hosts; MOD-endpoint-calls
// guards: UC-010; all in-scope realised requirements
// given: UC-010's `realises` list, SPEC's Check lines, the ITM-373 scope exception and this release evidence map
// input: compare the realised requirements with COVERED_BY_RELEASE, OUT_OF_SCOPE_BY_ITEM and REVIEW_ONLY
// expect: every in-scope automatic UC-010 requirement has evidence, review-only requirements are listed separately, and the excluded requirement is justified by the item
test("TST-373101: UC-010 release coverage names every in-scope realised requirement", () => {
  const realised = ucRealises();
  const checks = specChecks();
  const automatic = realised.filter((name) => !/^no automatic check; at review/.test(checks.get(name) ?? ""));
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));
  const covered = Object.keys(COVERED_BY_RELEASE);
  const outOfScope = Object.keys(OUT_OF_SCOPE_BY_ITEM);

  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual([...covered, ...outOfScope].sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 1, `${requirement} has coverage evidence beyond this release map`);
    assert.ok(evidence.some(({ file }) => file === SYSTEM), `${requirement} includes the UC-010 system harness`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
});

// TST-373102
// level: release
// module: MOD-test-schedule; MOD-test-document
// guards: UC-010; A JOB RECORD STARTS NO CI RUN
// given: the UC-010 release coverage table, the ITM-373 item text and MOD-test-schedule
// input: inspect the explicit out-of-scope mapping and the system-test declaration comments
// expect: the excluded requirement is visible, tied to the item exception and owner module, and the UC-010 system guard declares system-level tests
test("TST-373102: UC-010 release coverage exposes the ITM-373 out-of-scope requirement and system declarations", () => {
  assert.deepEqual(Object.keys(OUT_OF_SCOPE_BY_ITEM), ["A JOB RECORD STARTS NO CI RUN"]);
  assert.ok(
    read(ITEM).replace(/\s+/g, " ").includes("The release test of `A JOB RECORD STARTS NO CI RUN`, which needs MOD-test-schedule's `ciConfiguration` (UC-027), is not part of this item."),
    "ITM-373 explicitly excludes the job-record/CI-run release test",
  );
  assert.ok(read(TEST_SCHEDULE).includes("ciConfiguration"), "MOD-test-schedule owns ciConfiguration");

  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  assert.ok(declarations.some((declaration) => declaration.id === "TST-373001" && declaration.level === "system"), "TST-373001 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-373002" && declaration.level === "system"), "TST-373002 is a system declaration");

  const system = read(SYSTEM);
  for (const phrase of [
    "main-1-dashboard-ci-route-writes-job-record",
    "main-1-server-page-dispatch-writes-job-record",
    "alternative-3a-missing-secret-names-secret-and-writes-nothing",
    "alternative-4a-no-change-writes-nothing",
  ]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
});
