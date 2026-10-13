// Release coverage for UC-022. This is the release-level guard that the use case's realised SPEC requirements are either
// covered by executable tests, or explicitly left to review where the SPEC says "no automatic check; at review".
// Run: node --test tests/release-uc-022-derive-architecture.test.mjs
//
// Module: MOD-review-pages · MOD-job-runner · MOD-reuse-facts · MOD-approvals · MOD-artifact-edits · MOD-job-catalogue
// Guards: UC-022; every requirement realised by UC-022
// Level: release
//
// Input: docs/use-cases/UC-022-derive-the-architecture.md and SPEC.md as committed text.
// Precondition: ITM-448 is implemented only in new test files by a developer independent of ITM-434 through ITM-444.
// Expected result: each realised requirement whose SPEC check names an executable test has a release coverage entry whose
// evidence file exists; each realised requirement whose SPEC check says review-only is listed in REVIEW_ONLY, including
// AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS. Counter-proof notes are in the pull request/final report.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const pathExists = (path) => existsSync(new URL(path, ROOT));

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-022-derive-the-architecture.md").split("\n")) {
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
  "ONE ARCHITECTURE DECISION, ONE FILE": ["tests/test_architecture_files.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES": ["tests/test_architecture_files.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "ONE MODULE, ONE FILE": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A MODULE FILE IS REVIEWED AS AN ARCHITECTURE DECISION IS": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A MODULE IS A FOLDER": ["tests/test_coverage_report.py"],
  "ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES": ["tests/test_job_preconditions.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE": ["tests/test_derivation_context.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT": ["tests/test_derivation_context.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY": ["tests/test_derivation_context.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "AN ARCHITECTURE IS CHECKED WHEN IT IS COMPLETE": ["tests/test_architecture_review.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "NO REVIEWER IS THE DRAFTER": ["tests/test_architecture_review.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A REVIEWER'S FINDING IS A WARNING": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A REUSE DECISION RECORDS ITS DUE DILIGENCE": ["tests/reuse-facts.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "DUE DILIGENCE IS FETCHED, NOT RECALLED": ["tests/reuse-facts.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A PRODUCT DECLARES ITS LICENCE": ["tests/reuse-facts.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S": ["tests/reuse-facts.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "EVERY ARTIFACT NAMES ITS ORIGIN": ["tests/test_origin_links.py"],
  "DIAGRAMS ARE MERMAID IN MARKDOWN": ["tests/test_diagrams_are_mermaid.py"],
  "A GENERATED ARTIFACT IS A PROPOSAL": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON": ["tests/test_approval_records.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "SEVERAL FILES ARE ACCEPTED IN ONE CLICK": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "ONE REVIEW LAYOUT FOR EVERY PRODUCT": ["tests/test_pages_layout.py"],
  "AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT": ["tests/artifact-edits-open-files.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A DOCUMENT HOLDS NO HISTORY": ["tests/test_no_history.py"],
  "THE PAGE STATES WHAT IT SENDS WHERE": ["tests/test_destination_disclosure.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS": ["tests/review-core.test.mjs", "tests/system-uc-022-derive-architecture.test.mjs"],
  "EVERY STEP EXPLAINS ITSELF": ["tests/test_step_explanations.py"],
  "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "A FINDING READS LIKE A COMPILER MESSAGE": ["tests/test_correction_loop.py"],
  "AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "WHAT A PERSON DECIDES IS NOT SENT BACK": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "THE CORRECTION LOOP HAS A FIXED LIMIT": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "THE ROUNDS ARE COUNTED AND SHOWN": ["tests/test_correction_loop.py", "tests/system-uc-022-derive-architecture.test.mjs"],
  "AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION": ["tests/test_job_reading.py", "tests/system-uc-022-derive-architecture.test.mjs"],
};

const REVIEW_ONLY = [
  "AN ARCHITECTURE IS THE ORGANISATION OF THE WHOLE SYSTEM",
  "AN ARCHITECTURE STATES STRUCTURE, INTERACTION AND STRATEGY",
  "A SYSTEM IS DECOMPOSED INTO SUBSYSTEMS AND MODULES",
  "A MODULE BELONGS TO ONE SUBSYSTEM",
  "AN ARCHITECTURE IS DOCUMENTED IN FOUR VIEWS",
  "THE USE CASES ARE THE SCENARIOS OF THE ARCHITECTURE",
  "THE ARCHITECTURE DOES NOT RESTATE THE USE CASES",
  "THE ARCHITECTURE IS CUT BY FUNCTION, NOT BY USE-CASE STEP",
  "AN ARCHITECTURE NAMES ITS PATTERNS",
  "AN ARCHITECTURE STAYS AT THE LEVEL OF MODULES",
  "DIVIDE AND CONQUER",
  "DESIGN TO TEST",
  "KEEP IT SIMPLE",
  "YOU AREN'T GONNA NEED IT",
  "DON'T REPEAT YOURSELF",
  "LEAST ASTONISHMENT",
  "OPEN FOR EXTENSION, CLOSED FOR CHANGE",
  "DEVELOP AGAINST INTERFACES",
  "AN INTERFACE TELLS ITS USER WHAT TO CONSIDER",
  "AN INTERFACE HIDES ITS IMPLEMENTATION",
  "A REMOTE INTERFACE NAMES HOW IT FAILS",
  "A MODULE INTERFACE IS MINIMAL",
  "MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE",
  "ONE DECISION STATES THE WHOLE ARCHITECTURE",
  "ONE DECISION PER SUBSYSTEM",
  "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES",
  "AN INTERFACE STATES ITS TYPES",
  "A DATA FORMAT IS DEFINED ONCE",
  "AN ARCHITECTURE IS DERIVED FROM THE WHOLE TO ITS MODULES",
  "AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS",
  "THE ARCHITECTURE IS REVIEWED AGAINST THE SPECIFICATION",
  "EVERY USE CASE IS CHECKED AGAINST THE ARCHITECTURE",
  "A SUBSYSTEM IS CHECKED AGAINST THE SYSTEM",
  "A MODULE IS CHECKED AGAINST ITS SUBSYSTEM",
  "NO MODULE IS CHECKED AGAINST THE USE CASES",
  "A REVIEW FINDING IS WEIGHED BEFORE IT IS ACTED ON",
  "ONE CLICK PER DECISION",
];

// TST-448101 · level: release · module: MOD-review-pages; MOD-job-runner; MOD-reuse-facts; MOD-approvals; MOD-artifact-edits
// guards: UC-022; all realised requirements whose SPEC check names a test
// given: UC-022's `realises` list and SPEC's current check lines
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY
// expect: every requirement with an executable SPEC check has coverage evidence, every review-only requirement is named, and no realised requirement is in neither or both lists
test("TST-448101: UC-022 release coverage names every automatic and review-only requirement", () => {
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
  assert.ok(REVIEW_ONLY.includes("AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS"));
});

// TST-448102 · level: release · module: MOD-job-catalogue; MOD-job-runner
// guards: UC-022; AN ARCHITECTURE JOB RECEIVES THE CHAPTERS ON MODELING, ARCHITECTURE, DESIGN AND IMPLEMENTATION; AN ARCHITECTURE DRAFT IS CHECKED BEFORE A PERSON SEES IT; A REUSE DECISION RECORDS ITS DUE DILIGENCE
// given: the job catalogue as data
// input: read derive-architecture and review-architecture definitions
// expect: derive-architecture serves UC-022, takes whole SPEC, accepted use cases and chapters 9-12, is reviewed by review-architecture with a different participant, runs due-diligence, waits for a person, and writes open files
test("TST-448102: UC-022 release job definitions keep the architecture path wired as data", async () => {
  const { kindOf } = await import("../src/job-catalogue/index.mjs");
  const derive = await kindOf("derive-architecture");
  const review = await kindOf("review-architecture");

  assert.deepEqual(derive.serves, ["UC-022"]);
  assert.equal(derive.participant, "one");
  assert.deepEqual(derive.preconditions, ["architecture-ready"]);
  assert.deepEqual(derive.recipes.map((recipe) => recipe.name), ["whole-spec", "accepted-use-cases", "chapters-for-architecture"]);
  assert.deepEqual(derive.checks, ["document-schema", "graph-checks", "candidate-classes"]);
  assert.equal(derive.reviewer, "review-architecture");
  assert.equal(derive.reviewers, 1);
  assert.deepEqual(derive.steps, ["due-diligence"]);
  assert.equal(derive.review, "person");
  assert.equal(derive.writer, "open-files");

  assert.deepEqual(review.serves, ["UC-022", "UC-023"]);
  assert.deepEqual(review.recipes.map((recipe) => recipe.name), ["whole-spec", "accepted-use-cases", "draft", "chapters-for-architecture"]);
  assert.equal(review.writer, "return-draft");
});
