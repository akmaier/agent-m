// Release coverage for UC-008 Review and accept a use case. This release guard maps every requirement UC-008 realises
// to executable evidence.
// Run: node --test tests/release-uc-008-review-use-case.test.mjs
//
// Module: MOD-review-pages; MOD-approvals; MOD-artifact-edits; MOD-markdown-render
// Guards: UC-008; every requirement realised by UC-008
// Level: release
//
// Input: docs/use-cases/UC-008-review-and-accept-a-use-case.md and the executable checks on this commit.
// Precondition: ITM-372 adds only new test files by a participant independent of the UC-008 build items.
// Expected result: every requirement in UC-008's `realises` list has executable evidence, and no extra requirement is
// claimed.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const SYSTEM = "tests/system-uc-008-review-use-case.test.mjs";
const UC = "docs/use-cases/UC-008-review-and-accept-a-use-case.md";

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
  "AN APPROVAL NAMES THE EXACT TEXT": [
    ev(SYSTEM, "TST-372001"),
    ev("tests/approvals-accept.test.mjs", "TST-472001"),
    ev("tests/review-pages-use-cases.test.mjs", "TST-472680"),
  ],
  "STATUS IS DERIVED FROM THE RECORDS": [
    ev(SYSTEM, "TST-372003"),
    ev("tests/approvals-status.test.mjs", "TST-472020"),
    ev("tests/approvals-status.test.mjs", "TST-472021"),
  ],
  "EDITS ARE PREPARED ON THE DASHBOARD": [
    ev(SYSTEM, "TST-372001"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
  ],
  "NO TEXT TRAVELS IN A URL": [
    ev("tests/approvals-accept.test.mjs", "TST-472005"),
    ev("tests/review-pages-review-all.test.mjs", "TST-472657"),
  ],
  "THE PROSE IS AUTHORITATIVE, THE DIAGRAM IS THE OVERVIEW": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472679"),
    ev(SYSTEM, "TST-372001"),
  ],
  "THE GATE IS RECORDED": [
    ev("tests/approvals-accept.test.mjs", "TST-472001"),
    ev("tests/review-pages-use-cases.test.mjs", "TST-472680"),
  ],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [
    ev("tests/review-pages-review-all.test.mjs", "TST-472656"),
    ev("tests/review-pages-use-cases.test.mjs", "TST-472680"),
  ],
  "WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472683"),
    ev("tests/review-pages-review-all.test.mjs", "TST-472657"),
  ],
  "ONE CLICK PER DECISION": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472680"),
    ev("tests/review-pages-review-all.test.mjs", "TST-472652"),
  ],
  "ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON": [
    ev("tests/approvals-accept.test.mjs", "TST-472001"),
    ev("tests/review-pages-use-cases.test.mjs", "TST-472680"),
  ],
  "A GITLAB PRODUCT IS WRITTEN WITH A TOKEN": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472685"),
    ev("tests/approvals-accept.test.mjs", "TST-472006"),
  ],
  "SEVERAL FILES ARE ACCEPTED IN ONE CLICK": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472681"),
    ev("tests/review-pages-review-all.test.mjs", "TST-472652"),
  ],
  "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT": [
    ev("tests/review-pages-use-cases.test.mjs", "TST-472682"),
    ev("tests/review-pages-review-all.test.mjs", "TST-472651"),
  ],
};

// TST-372101
// level: release
// module: MOD-review-pages; MOD-approvals; MOD-artifact-edits; MOD-markdown-render
// guards: UC-008
// given: UC-008's realised requirements and the evidence map in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE
// expect: every realised requirement is covered exactly once in the map, and every evidence file exists and contains its named TST id
test("TST-372101: UC-008 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), realised.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.some(({ file }) => file !== "tests/release-uc-008-review-use-case.test.mjs"), `${requirement} has evidence beyond this release map`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
});

// TST-372102
// level: release
// module: MOD-test-document
// guards: UC-008
// given: the UC-008 system test and its declaration comments
// input: read the system test declarations and flow evidence names
// expect: the system test declares UC-008 at system level and includes every required alternative flow name
test("TST-372102: UC-008 release evidence includes system-level flow declarations", () => {
  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  assert.ok(declarations.some((declaration) => declaration.id === "TST-372001" && declaration.level === "system"), "TST-372001 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-372002" && declaration.level === "system"), "TST-372002 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-372003" && declaration.level === "system"), "TST-372003 is a system declaration");

  const system = read(SYSTEM);
  for (const phrase of ["1a-private-no-token", "2a-changed-since-acceptance", "3a-edit-and-save", "3b-github-no-token", "3c-gitlab-no-token", "3d-accept-ticked", "3e-review-all", "4a-no-write-access", "5a-edited-after-acceptance"]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
});
