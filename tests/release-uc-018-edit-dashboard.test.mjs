// Release coverage for UC-018 Edit a specification or a use case in the dashboard. This release guard maps every
// requirement UC-018 realises to executable evidence.
// Run: node --test tests/release-uc-018-edit-dashboard.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-spec-changes; MOD-trace-pages; MOD-markdown-render
// Guards: UC-018
// Level: release
//
// Input: docs/use-cases/UC-018-edit-a-specification-or-use-case.md and the executable checks on this commit.
// Precondition: ITM-376 adds only new test files by a participant independent of the UC-018 build items.
// Expected result: every requirement in UC-018's `realises` list has executable evidence, and no extra requirement is
// claimed.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const SYSTEM = "tests/system-uc-018-edit-dashboard.test.mjs";
const UC = "docs/use-cases/UC-018-edit-a-specification-or-use-case.md";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read(UC).split("\n")) {
    if (line === "realises:") { inRealises = true; continue; }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

const ev = (file, id) => ({ file, id });

const COVERED_BY_RELEASE = {
  "EDITS ARE PREPARED ON THE DASHBOARD": [
    ev(SYSTEM, "TST-376001"),
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472626"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
  ],
  "A SPEC EDIT IS SAVED AS A PROPOSAL": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472985"),
  ],
  "A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE": [
    ev(SYSTEM, "TST-376003"),
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472633"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
  ],
  "A REFUSED SAVE KEEPS THE EDIT": [
    ev(SYSTEM, "TST-376003"),
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472633"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
  ],
  "AN EDITED FILE KEEPS ITS IDENTIFIER": [
    ev("tests/artifact-edits-identifier.test.mjs", "TST-472029"),
    ev("tests/artifact-edits-identifier.test.mjs", "TST-472030"),
  ],
  "A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472631"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472988"),
  ],
  "A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev("tests/review-pages-edit-entry.test.mjs", "TST-397001"),
  ],
  "NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT": [
    ev("tests/review-pages-edit-entry.test.mjs", "TST-397002"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472985"),
  ],
  "A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472627"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472985"),
  ],
  "A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN": [
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
    ev("tests/artifact-edits-identifier.test.mjs", "TST-472030"),
  ],
  "STATUS IS DERIVED FROM THE RECORDS": [
    ev("tests/approvals-status.test.mjs", "TST-472020"),
    ev("tests/approvals-status.test.mjs", "TST-472021"),
  ],
  "THE NAME IS THE ID AND IT SURVIVES": [
    ev("tests/artifact-edits-identifier.test.mjs", "TST-472029"),
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472631"),
  ],
  "A REQUIREMENT HAS FOUR FIELDS": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472626"),
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472630"),
  ],
  "ONE STATEMENT PER REQUIREMENT": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472626"),
    ev("tests/review-pages-edit-entry.test.mjs", "TST-397010"),
  ],
  "A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION": [
    ev(SYSTEM, "TST-376001"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
  ],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472043"),
  ],
  "WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472634"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472992"),
  ],
  "NO TEXT TRAVELS IN A URL": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472634"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472992"),
  ],
  "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472635"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472993"),
  ],
  "ONE CLICK PER DECISION": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
  ],
  "EVERY STEP EXPLAINS ITSELF": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472626"),
    ev("tests/review-pages-edit-entry.test.mjs", "TST-397002"),
  ],
  "A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE": [
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472983"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472991"),
  ],
};

// TST-376101
// level: release
// module: MOD-review-pages; MOD-artifact-edits; MOD-spec-changes; MOD-trace-pages; MOD-markdown-render
// guards: UC-018
// given: UC-018's realised requirements and the evidence map in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE
// expect: every realised requirement is covered exactly once in the map, and every evidence file exists and contains its named TST id
test("TST-376101: UC-018 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), realised.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.some(({ file }) => file !== "tests/release-uc-018-edit-dashboard.test.mjs"), `${requirement} has evidence beyond this release map`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
});

// TST-376102
// level: release
// module: MOD-test-document
// guards: UC-018
// given: the UC-018 system test and its declaration comments
// input: read the system test declarations and flow evidence names
// expect: the system test declares UC-018 at system level and includes every required alternative flow name
test("TST-376102: UC-018 release evidence includes system-level flow declarations", () => {
  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  assert.ok(declarations.some((declaration) => declaration.id === "TST-376001" && declaration.level === "system"), "TST-376001 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-376002" && declaration.level === "system"), "TST-376002 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-376003" && declaration.level === "system"), "TST-376003 is a system declaration");

  const system = read(SYSTEM);
  for (const phrase of ["1a-edit-open-proposal", "3a-rename-requirement", "3b-use-case-id-change-disabled", "3c-mark-remains", "3d-add-requirement", "3e-arrange-link", "4a-github-no-token", "4b-gitlab-no-token", "5a-changed-since-open", "6a-another-open-proposal", "6b-no-write-access", "7a-unsaved-changes"]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
});
