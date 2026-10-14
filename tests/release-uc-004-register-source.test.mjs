// Release coverage for UC-004 Register a requirement source in the library. This release guard maps every requirement
// UC-004 realises to executable evidence.
// Run: node --test tests/release-uc-004-register-source.test.mjs
//
// Module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries; MOD-site-frame; MOD-artifacts
// Guards: UC-004; every requirement realised by UC-004
// Level: release
//
// Input: docs/use-cases/UC-004-register-a-requirement-source.md and the executable source-library checks on this commit.
// Precondition: ITM-370 adds only new test files by a participant independent of the UC-004 build items.
// Expected result: every requirement in UC-004's `realises` list has executable evidence, and no extra requirement is
// claimed.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const UC = "docs/use-cases/UC-004-register-a-requirement-source.md";
const SYSTEM = "tests/system-uc-004-register-source.test.mjs";

const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const ev = (file, marker) => ({ file, marker });

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

const COVERED_BY_RELEASE = {
  "THE INSTANCE KEEPS THE SOURCE REGISTER": [
    ev(SYSTEM, "TST-370001"),
    ev("tests/settings-pages-library.test.mjs", "TST-472750"),
    ev("tests/source-register-registration.test.mjs", "TST-472924"),
  ],
  "A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY": [
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472857"),
    ev("tests/settings-pages-library.test.mjs", "TST-472751"),
    ev("tests/settings-pages-library.test.mjs", "TST-472759"),
    ev("tests/source-register-registration.test.mjs", "TST-472924"),
  ],
  "A SOURCE DECLARES ITS LICENCE": [
    ev("tests/source-register.test.mjs", "TST-472937"),
    ev("tests/settings-pages-library.test.mjs", "TST-472754"),
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472860"),
  ],
  "RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE": [
    ev("tests/settings-pages-library.test.mjs", "TST-472754"),
    ev("tests/source-register-registration.test.mjs", "TST-472926"),
    ev("tests/source-register-hashed-only.test.mjs", "TST-472904"),
  ],
  "A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH": [
    ev("tests/source-register-registration.test.mjs", "TST-472925"),
    ev("tests/source-register-hashed-only.test.mjs", "TST-472903"),
    ev("tests/source-register-version-fetch.test.mjs", "TST-385004"),
  ],
  "A STANDARD IS REGISTERED BY ITS DESIGNATION": [
    ev("tests/settings-pages-library.test.mjs", "TST-472752"),
    ev("tests/settings-pages-library.test.mjs", "TST-472755"),
    ev("tests/source-register.test.mjs", "TST-472937"),
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472861"),
  ],
  "AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY": [
    ev(SYSTEM, "TST-370001"),
    ev("tests/source-register-legal-text.test.mjs", "TST-472907"),
    ev("tests/source-register-version-fetch.test.mjs", "TST-385001"),
    ev("tests/source-register-version-fetch.test.mjs", "TST-385003"),
    ev("tests/workflow-entries-sources.test.mjs", "TST-401001"),
    ev("tests/settings-pages-library.test.mjs", "TST-402001"),
  ],
  "THE SOURCE MODEL IS GENERIC": [
    ev("tests/settings-pages-library.test.mjs", "TST-472762"),
    ev("tests/settings-pages-library.test.mjs", "TST-472763"),
    ev("tests/source-register.test.mjs", "TST-472936"),
  ],
  "A SOURCE DECLARES ITS AUTHORITY": [
    ev("tests/settings-pages-library.test.mjs", "TST-472751"),
    ev("tests/source-register.test.mjs", "TST-472937"),
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472859"),
  ],
  "A LIVING SOURCE IS PINNED": [
    ev("tests/settings-pages-library.test.mjs", "TST-472752"),
    ev("tests/settings-pages-library.test.mjs", "TST-472759"),
    ev("tests/source-register-version-fetch.test.mjs", "TST-385001"),
  ],
  "THE SOURCE KIND IS ONE OF A CLOSED SET": [
    ev("tests/settings-pages-library.test.mjs", "TST-472751"),
    ev("tests/settings-pages-library.test.mjs", "TST-472762"),
    ev("tests/source-register.test.mjs", "TST-472937"),
  ],
  "EVERY ARTIFACT HAS AN IDENTIFIER": [
    ev("tests/test_identifiers.py", "test_every_artifact_of_the_fixture_is_read_by_its_identifier"),
    ev("tests/settings-pages-library.test.mjs", "TST-472762"),
  ],
  "A PERSON'S OWN INPUT IS COMMITTED DIRECTLY": [
    ev("tests/settings-pages-library.test.mjs", "TST-472753"),
    ev("tests/settings-pages-library.test.mjs", "TST-472759"),
  ],
  "ONE CLICK PER DECISION": [
    ev("tests/settings-pages-library.test.mjs", "TST-472753"),
    ev("tests/settings-pages-library.test.mjs", "TST-402001"),
  ],
  "EVERY STEP EXPLAINS ITSELF": [
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472856"),
    ev("tests/site-frame-source-explanations.test.mjs", "TST-472857"),
    ev("tests/settings-pages-library.test.mjs", "TST-472761"),
  ],
};

// TST-370101
// level: release
// module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries; MOD-site-frame; MOD-artifacts
// guards: UC-004
// given: UC-004's realised requirements and the evidence map in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE
// expect: every realised requirement is covered exactly once in the map, every evidence file exists, and every evidence marker is present
test("TST-370101: UC-004 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), realised.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.every(({ file }) => file !== "tests/release-uc-004-register-source.test.mjs"),
      `${requirement} has evidence beyond this release map`);
    assert.ok(evidence.some(({ file }) => read(file).includes(requirement)), `${requirement} is named by evidence`);
    for (const { file, marker } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(marker), `${requirement}: ${file} contains ${marker}`);
    }
  }
});

// TST-370102
// level: release
// module: MOD-settings-pages; MOD-source-register; MOD-workflow-entries; MOD-test-document
// guards: UC-004; AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
// given: the UC-004 release coverage table and the system harness source
// input: inspect the evidence attached to the Library route, source-register legal text/version path and workflow-entry path
// expect: the release evidence includes executable tests for the dashboard route, source-register recognition and fetch, workflow fetch, identity checks, and system-level declarations
test("TST-370102: UC-004 release evidence includes Library, source-register, workflow and identity paths", () => {
  const allFiles = [...new Set(Object.values(COVERED_BY_RELEASE).flat().map(({ file }) => file))];
  assert.ok(allFiles.every((file) => /^tests\/.+(\.test\.mjs|\.py)$/.test(file)), "only executable test files are named");
  for (const file of allFiles) assert.match(read(file), /level:\s*(unit|component|system|release)/i, `${file} has a level declaration`);

  const legal = COVERED_BY_RELEASE["AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY"].map(({ file }) => file);
  for (const file of [
    SYSTEM,
    "tests/settings-pages-library.test.mjs",
    "tests/source-register-legal-text.test.mjs",
    "tests/source-register-version-fetch.test.mjs",
    "tests/workflow-entries-sources.test.mjs",
  ]) assert.ok(legal.includes(file), `EU legal-text release evidence includes ${file}`);

  assert.ok(COVERED_BY_RELEASE["EVERY ARTIFACT HAS AN IDENTIFIER"].some(({ file }) => file === "tests/test_identifiers.py"),
    "identifier release evidence includes the artifact identity test");

  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  assert.ok(declarations.some((declaration) => declaration.id === "TST-370001" && declaration.level === "system"),
    "TST-370001 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-370002" && declaration.level === "system"),
    "TST-370002 is a system declaration");
});
