// Release coverage for UC-019 Change a specification or a use case by prompt. This release guard maps every
// requirement UC-019 realises to executable evidence.
// Run: node --test tests/release-uc-019-change-by-prompt.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// Guards: UC-019
// Level: release
//
// Input: docs/use-cases/UC-019-change-a-specification-or-use-case-by-prompt.md, SPEC.md and the executable checks on
// this commit.
// Precondition: ITM-377 adds only new test files by a participant independent of the UC-019 build items named by the
// selected sprint record.
// Expected result: every requirement in UC-019's `realises` list has executable evidence, and no extra requirement is
// claimed.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const SYSTEM = "tests/system-uc-019-change-by-prompt.test.mjs";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-019-change-a-specification-or-use-case-by-prompt.md").split("\n")) {
    if (line === "realises:") { inRealises = true; continue; }
    if (!inRealises) continue;
    if (line.startsWith("  - ")) names.push(line.slice(4));
    else if (line === "---") break;
  }
  return names;
}

const ev = (file, id) => ({ file, id });

const COVERED_BY_RELEASE = {
  "A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT": [
    ev(SYSTEM, "TST-377001"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472641"),
    ev("tests/job-runner-refine.test.mjs", "TST-472345"),
  ],
  "A CI AGENT'S DRAFT ENTERS AS OPEN": [
    ev("tests/workflow-entries-design-kinds.test.mjs", "TST-473198"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476061"),
  ],
  "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT": [
    ev("tests/review-pages-architecture.test.mjs", "TST-472608"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-342009"),
  ],
  "A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES": [
    ev("tests/test_derivation_context.py", "TST-414100"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476062"),
  ],
  "THE PERSON WHO PROMPTS IS A SOURCE": [
    ev("tests/test_prompted_source.py", "TST-416100"),
    ev("tests/source-register-person.test.mjs", "TST-472921"),
  ],
  "A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS": [
    ev(SYSTEM, "TST-377001"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472640"),
    ev("tests/approvals-strategies.test.mjs", "TST-472023"),
  ],
  "NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY": [
    ev(SYSTEM, "TST-377001"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472640"),
    ev("tests/site-frame-run-panel.test.mjs", "TST-472848"),
  ],
  "DERIVATION SEES THE EXISTING REQUIREMENTS": [
    ev("tests/test_derivation_context.py", "TST-414100"),
    ev("tests/spec-changes-requirement-recipes.test.mjs", "TST-473014"),
  ],
  "NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY": [
    ev("tests/test_derivation_context.py", "TST-414101"),
    ev("tests/job-runner-left-out.test.mjs", "TST-472332"),
  ],
  "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT": [
    ev("tests/test_derivation_classes.py", "TST-415100"),
    ev("tests/job-runner-candidate-classes.test.mjs", "TST-472306"),
  ],
  "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL": [
    ev("tests/test_derivation_classes.py", "TST-415100"),
    ev("tests/documents-rule-decides.test.mjs", "TST-472180"),
  ],
  "A CHANGE IS PROPOSED UNDER THE EXISTING NAME": [
    ev("tests/spec-changes-sections.test.mjs", "TST-473031"),
    ev("tests/spec-changes-queue-entries.test.mjs", "TST-472995"),
  ],
  "A CONFLICT IS DECIDED BY A PERSON": [
    ev("tests/spec-changes-sections.test.mjs", "TST-473035"),
    ev("tests/spec-changes-queue-entries.test.mjs", "TST-472996"),
  ],
  "A SPEC EDIT IS SAVED AS A PROPOSAL": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476062"),
  ],
  "A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472647"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
  ],
  "A REFUSED SAVE KEEPS THE EDIT": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472647"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
  ],
  "AN EDITED FILE KEEPS ITS IDENTIFIER": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472643"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
  ],
  "A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED": [
    ev("tests/spec-document-sections.test.mjs", "TST-473073"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472988"),
  ],
  "A GENERATED ARTIFACT IS A PROPOSAL": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472644"),
    ev("tests/artifact-edits-open-files.test.mjs", "TST-472035"),
  ],
  "THE PAGE STATES WHAT IT SENDS WHERE": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472640"),
    ev("tests/site-frame-run-panel.test.mjs", "TST-472846"),
  ],
  "AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472646"),
    ev("tests/workflow-entries-design-kinds.test.mjs", "TST-473198"),
  ],
  "ONE DEFINITION, THREE DRIVERS": [
    ev("tests/workflow-entries-design-kinds.test.mjs", "TST-473198"),
    ev("tests/endpoint-driver.test.mjs", "TST-472223"),
  ],
  "A PARTICIPANT DECLARES ITS CAPABILITIES": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472638"),
    ev("tests/participant-list.test.mjs", "TST-472424"),
  ],
  "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472638"),
    ev("tests/site-frame-drafting-explanations.test.mjs", "TST-472808"),
  ],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472645"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472650"),
  ],
  "ONE CLICK PER DECISION": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472646"),
    ev("tests/site-frame-run-panel.test.mjs", "TST-472854"),
  ],
  "EVERY STEP EXPLAINS ITSELF": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472637"),
    ev("tests/site-frame-drafting-explanations.test.mjs", "TST-472812"),
  ],
  "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT": [
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476059"),
    ev("tests/test_correction_loop.py", "TST-475002"),
  ],
  "A FINDING READS LIKE A COMPILER MESSAGE": [
    ev("tests/test_correction_loop.py", "TST-475002"),
    ev("tests/text-tools.test.mjs", "TST-473100"),
  ],
  "AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED": [
    ev("tests/test_correction_loop.py", "TST-475003"),
    ev("tests/job-runner-requirement-form.test.mjs", "TST-472350"),
  ],
  "WHAT A PERSON DECIDES IS NOT SENT BACK": [
    ev("tests/job-runner-run.test.mjs", "TST-472355"),
    ev("tests/job-runner-records.test.mjs", "TST-472344"),
  ],
  "THE CORRECTION LOOP HAS A FIXED LIMIT": [
    ev("tests/test_correction_loop.py", "TST-475008"),
    ev("tests/site-frame-run-panel.test.mjs", "TST-472852"),
  ],
  "THE ROUNDS ARE COUNTED AND SHOWN": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472643"),
    ev("tests/job-runner-records.test.mjs", "TST-472342"),
  ],
  "A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING": [
    ev("tests/source-register-chapters.test.mjs", "TST-472885"),
    ev("tests/source-register-checkout.test.mjs", "TST-472890"),
  ],
};

// TST-377101
// level: release
// module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// guards: UC-019
// given: UC-019's realised requirements and the evidence map in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE
// expect: every realised requirement is covered exactly once in the map, and every evidence file exists and contains its named TST id
test("TST-377101: UC-019 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), realised.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.some(({ file }) => file !== "tests/release-uc-019-change-by-prompt.test.mjs"), `${requirement} has evidence beyond this release map`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
});

// TST-377102
// level: release
// module: MOD-test-document
// guards: UC-019
// given: the UC-019 system test and its declaration comments
// input: read the system test declarations and route-specific evidence files
// expect: the system test declares UC-019 at system level and contains the required Bridge and CI route evidence
test("TST-377102: UC-019 release evidence includes system-level Bridge and CI path declarations", () => {
  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  assert.ok(declarations.some((declaration) => declaration.id === "TST-377001" && declaration.level === "system"), "TST-377001 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-377002" && declaration.level === "system"), "TST-377002 is a system declaration");
  assert.ok(declarations.some((declaration) => declaration.id === "TST-377003" && declaration.level === "system"), "TST-377003 is a system declaration");

  const system = read(SYSTEM);
  for (const phrase of ["6a-bridge-agent-returns-draft", "6b-ci-workflow-commits-open-use-case", "8-refine", "9a-target-changed"]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
  assert.ok(read("tests/runtimes-bridge.test.mjs").includes("from the Bridge"));
  assert.ok(read("tests/workflow-entries-design-kinds.test.mjs").includes("one commit of an open file"));
});
