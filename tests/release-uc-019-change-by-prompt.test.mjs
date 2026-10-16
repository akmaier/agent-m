// Release coverage for UC-019 Change a specification or a use case by prompt. This release guard maps every
// requirement UC-019 realises to executable evidence or to a pending finding.
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
// Expected result: every requirement in UC-019's `realises` list has executable evidence that asserts nothing the
// accepted UC-019 replaced, or is a pending finding - a todo test below that names what is missing - and no extra
// requirement is claimed.

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

// The requirements UC-019 realises that have no executable evidence yet; each finding's todo test stands below.
const PENDING_RELEASE = {
  "A CI AGENT'S DRAFT ENTERS AS OPEN": { finding: "UC019-R1", test: "TST-377103" },
  "NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY": { finding: "UC019-R2", test: "TST-377104" },
  "THE PAGE NAMES WHERE IT SENDS": { finding: "UC019-R3", test: "TST-377105" },
  "A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON": { finding: "UC019-R4", test: "TST-377106" },
  "AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT": { finding: "UC019-R5", test: "TST-377107" },
  "ONE CLICK PER DECISION": { finding: "UC019-R6", test: "TST-377108" },
  "EVERY STEP EXPLAINS ITSELF": { finding: "UC019-R7", test: "TST-377109" },
};

const COVERED_BY_RELEASE = {
  "A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT": [
    ev(SYSTEM, "TST-377001"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472641"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-342009"),
  ],
  "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT": [
    ev("tests/review-pages-architecture.test.mjs", "TST-472608"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-342009"),
  ],
  "A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES": [
    ev("tests/test_derivation_context.py", "TST-414100"),
    ev("tests/spec-changes-requirement-recipes.test.mjs", "TST-473014"),
  ],
  "THE PERSON WHO PROMPTS IS A SOURCE": [
    ev("tests/test_prompted_source.py", "TST-416100"),
    ev("tests/source-register-person.test.mjs", "TST-472921"),
  ],
  "A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS": [
    ev(SYSTEM, "TST-377001"),
    ev("tests/approvals-strategies.test.mjs", "TST-472023"),
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
  "ONE DEFINITION, THREE DRIVERS": [
    ev("tests/runtimes-bridge.test.mjs", "TST-472698"),
    ev("tests/endpoint-driver.test.mjs", "TST-472223"),
  ],
  "A PARTICIPANT DECLARES ITS CAPABILITIES": [
    ev("tests/test_participants.py", "TST-475029"),
  ],
  "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA": [
    ev("tests/test_participants.py", "TST-475029"),
  ],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472645"),
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472647"),
  ],
  "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT": [
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
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
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
  ],
  "THE ROUNDS ARE COUNTED AND SHOWN": [
    ev("tests/review-pages-prompt-use-case.test.mjs", "TST-472643"),
    ev("tests/test_correction_loop.py", "TST-475008"),
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
// given: UC-019's realised requirements, the evidence map and the pending findings in this release test
// input: compare the realised requirements with COVERED_BY_RELEASE and PENDING_RELEASE
// expect: every realised requirement is in exactly one of the two, no other is; every evidence file exists and contains its named TST id; every pending requirement's finding is the todo of its test in this file
test("TST-377101: UC-019 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual([...Object.keys(COVERED_BY_RELEASE), ...Object.keys(PENDING_RELEASE)].sort(), realised.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.some(({ file }) => file !== "tests/release-uc-019-change-by-prompt.test.mjs"), `${requirement} has evidence beyond this release map`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
  const self = read("tests/release-uc-019-change-by-prompt.test.mjs");
  for (const [requirement, { finding, test: id }] of Object.entries(PENDING_RELEASE)) {
    assert.ok(self.includes(`// ${id}\n`), `${requirement}: ${id} stands in this file`);
    assert.ok(self.includes(`todo: "FINDING ${finding} `), `${requirement}: the todo of ${id} names FINDING ${finding}`);
  }
});

// TST-377102
// level: release
// module: MOD-test-document
// guards: UC-019
// given: the UC-019 system test and its declaration comments
// input: read the system test declarations and route-specific evidence files
// expect: the system test declares UC-019 at system level, names the Bridge route and the last alternative, and declares a todo test for each pending flow
test("TST-377102: UC-019 release evidence includes system-level declarations", () => {
  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  for (const id of ["TST-377001", "TST-377002", "TST-377003", "TST-377004", "TST-377005", "TST-377006", "TST-377007", "TST-377008", "TST-377009"]) {
    assert.ok(declarations.some((declaration) => declaration.id === id && declaration.level === "system"), `${id} is a system declaration`);
  }

  const system = read(SYSTEM);
  for (const phrase of ["6a-bridge-agent-returns-draft", "9a-target-changed"]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
  assert.ok(read("tests/runtimes-bridge.test.mjs").includes("from the Bridge"));
});

// ---------------------------------------------------------------- pending findings: the requirements the prompt bar's flows will evidence

// TST-377103
// level: release
// module: MOD-workflow-entries
// guards: UC-019 (A CI AGENT'S DRAFT ENTERS AS OPEN)
// given: a CI agent's workflow handed a prompted change from the prompt bar
// input: the workflow commits the draft
// expect: only an open use case or a queue entry of a SPEC change is committed to the default branch, SPEC.md byte-identical
test("TST-377103: UC-019 A CI AGENT'S DRAFT ENTERS AS OPEN", { todo: "FINDING UC019-R1 — the evidence (TST-473198, TST-476061) is a job record that carries the instruction and a commit that carries an Agent-M-Instruction line, both replaced by UC-019 6b; tests/test_prompted_change_context.py, which SPEC.md names, does not exist" }, () => {
  assert.fail("no test commits a CI agent's draft from a handover of the prompt bar");
});

// TST-377104
// level: release
// module: MOD-review-pages
// guards: UC-019 (NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY)
// given: a use case, its requirements and the other use cases that do not fit into the participant's context
// input: the author presses Send
// expect: nothing is sent and the page says what does not fit
test("TST-377104: UC-019 NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY", { todo: "FINDING UC019-R2 — the evidence (TST-472640, TST-472848) asserts the run panel and its Run button, which UC-019 replaced by Send; tests/test_prompted_change_context.py, which SPEC.md names, does not exist" }, () => {
  assert.fail("no test shows a context that does not fit on the path of Send");
});

// TST-377105
// level: release
// module: MOD-review-pages
// guards: UC-019 (THE PAGE NAMES WHERE IT SENDS)
// given: an instruction in the prompt bar and a participant with its processing place
// input: the author is about to press Send, and a message of a conversation is about to go
// expect: the page names each destination, a participant with its processing place, before anything is sent
test("TST-377105: UC-019 THE PAGE NAMES WHERE IT SENDS", { todo: "FINDING UC019-R3 — no test shows the prompt bar naming its destinations; tests/test_destination_disclosure.py, which SPEC.md names, asserts the token's destinations, not a participant with its place" }, () => {
  assert.fail("no test shows a participant named with its processing place before Send");
});

// TST-377106
// level: release
// module: MOD-review-pages; MOD-workflow-entries
// guards: UC-019 (A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON)
// given: recording off, a conversation in which the participant proposes an edit that the person saves and hands its task to CI
// input: the conversation, Save and the handover
// expect: no message's text in any commit, commit message or job record
test("TST-377106: UC-019 A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON", { todo: "FINDING UC019-R4 — no test of this requirement exists; tests/test_conversation_not_recorded.py, which SPEC.md names, does not exist" }, () => {
  assert.fail("no test checks that a conversation's messages are absent from commits and job records");
});

// TST-377107
// level: release
// module: MOD-artifact-edits; MOD-review-pages
// guards: UC-019 (AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT)
// given: a saved draft
// input: Save
// expect: the commit names the Agent M version, the participant and the model, and the artifact's own text names none of them
test("TST-377107: UC-019 AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT", { todo: "FINDING UC019-R5 — every test of the commit (TST-472646, TST-473198, TST-476059, TST-472342) also asserts an Agent-M-Instruction line, which UC-019 says is never recorded; tests/test_artifact_provenance.py, which SPEC.md names, does not exist" }, () => {
  assert.fail("no test checks the commit's version, participant and model without the instruction");
});

// TST-377108
// level: release
// module: MOD-review-pages
// guards: UC-019 (ONE CLICK PER DECISION)
// given: a draft whose inputs are complete
// input: the author presses Save
// expect: one click decides; everything that follows is done by Agent M
test("TST-377108: UC-019 ONE CLICK PER DECISION", { todo: "FINDING UC019-R6 — the only test of Save as one click (TST-472646) asserts the instruction among the provenance lines, which UC-019 says is never recorded" }, () => {
  assert.fail("no test shows Save as one click without asserting the replaced provenance");
});

// TST-377109
// level: release
// module: MOD-review-pages; MOD-site-frame
// guards: UC-019 (EVERY STEP EXPLAINS ITSELF)
// given: the prompt bar's steps
// input: the bar's folded What is this?
// expect: the bar carries the explanation UC-019 step 1 gives, with its examples
test("TST-377109: UC-019 EVERY STEP EXPLAINS ITSELF", { todo: "FINDING UC019-R7 — the evidence (TST-472637, TST-472812) asserts the Change by prompt link and the explanation of its instruction field, which UC-019 replaced by the bar's What is this?" }, () => {
  assert.fail("no test finds the folded What is this? of the prompt bar");
});
