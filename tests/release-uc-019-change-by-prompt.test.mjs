// Release coverage for UC-019 Change a specification or a use case by prompt. This release guard maps every requirement UC-019 realises
// to executable evidence through the prompt bar and the review pages' route `draft`, or to a finding that names what the code does instead.
// Run: node --test tests/release-uc-019-change-by-prompt.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// Level: release
// Guards: UC-019
//
// Authored by developer-sonnet-e (ITM-514), who implemented none of ITM-507, ITM-508 or ITM-551.
// Input: the list of requirements UC-019 realises, as committed, and the executable checks on this commit.
// Precondition: ITM-504, ITM-506, ITM-507 and ITM-508 are merged.
// Expected result: every requirement in REALISED has executable evidence that asserts nothing the accepted UC-019 replaced, and no
// extra requirement is claimed; the parts of a requirement the code does otherwise are findings - todo tests that fail now and name what
// the code does instead: FINDINGS below. The tests of the flows run in the harness of
// tests/system-uc-019-change-requirements-by-prompt.test.mjs (the real frame, bar and review pages over servers in memory; no request
// leaves the process). Each test states its input and its expected values in its own text; none reads an expected result from the SPEC,
// a use case or an architecture file: the list of requirements is the expected value, and UC-019 is the input it is compared with.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { UC7, UC7_PATH, UC8, UC8_PATH, all, barOf, changed, conversationRecords, messageLines, namedButton, onUseCase, one, press, proposalTexts, proposalWrites, review, run, scenario,
  send, statusOf, useCases } from "./system-uc-019-change-requirements-by-prompt.test.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const SYSTEM = "tests/system-uc-019-change-by-prompt.test.mjs";
const SELF = "tests/release-uc-019-change-by-prompt.test.mjs";
const SYSTEM_REQUIREMENTS = "tests/system-uc-019-change-requirements-by-prompt.test.mjs";
const RELEASE_REQUIREMENTS = "tests/release-uc-019-change-requirements-by-prompt.test.mjs";
const DRAFT = "tests/review-pages-conversation-draft.test.mjs";

// The requirements UC-019 realises, as the test states them.
const REALISED = [
  "A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT", "A CI AGENT'S DRAFT ENTERS AS OPEN", "A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT",
  "A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES", "THE PERSON WHO PROMPTS IS A SOURCE", "A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS",
  "NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY", "DERIVATION SEES THE EXISTING REQUIREMENTS", "NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY",
  "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT", "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL", "A CHANGE IS PROPOSED UNDER THE EXISTING NAME",
  "A CONFLICT IS DECIDED BY A PERSON", "A SPEC EDIT IS SAVED AS A PROPOSAL", "A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE", "A REFUSED SAVE KEEPS THE EDIT",
  "AN EDITED FILE KEEPS ITS IDENTIFIER", "A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED", "A GENERATED ARTIFACT IS A PROPOSAL", "THE PAGE NAMES WHERE IT SENDS",
  "A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON", "AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT", "ONE DEFINITION, THREE DRIVERS",
  "A PARTICIPANT DECLARES ITS CAPABILITIES", "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA", "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK", "ONE CLICK PER DECISION",
  "EVERY STEP EXPLAINS ITSELF", "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT", "A FINDING READS LIKE A COMPILER MESSAGE",
  "AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED", "WHAT A PERSON DECIDES IS NOT SENT BACK", "THE CORRECTION LOOP HAS A FIXED LIMIT", "THE ROUNDS ARE COUNTED AND SHOWN",
  "A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING",
];

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
    ev(DRAFT, "TST-507020"),
    ev(RELEASE_REQUIREMENTS, "TST-418109"),
    ev(SYSTEM_REQUIREMENTS, "TST-418007"),
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
    ev(RELEASE_REQUIREMENTS, "TST-418101"),
    ev(SYSTEM_REQUIREMENTS, "TST-418008"),
    ev("tests/trace-pages-subject.test.mjs", "TST-600155"),
  ],
  "A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS": [
    ev(SYSTEM, "TST-377004"),
    ev("tests/approvals-strategies.test.mjs", "TST-472023"),
  ],
  "DERIVATION SEES THE EXISTING REQUIREMENTS": [
    ev("tests/test_derivation_context.py", "TST-414100"),
    ev(RELEASE_REQUIREMENTS, "TST-418106"),
  ],
  "NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY": [
    ev("tests/test_derivation_context.py", "TST-414101"),
    ev(RELEASE_REQUIREMENTS, "TST-418107"),
    ev("tests/job-runner-left-out.test.mjs", "TST-472332"),
  ],
  "A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT": [
    ev("tests/test_derivation_classes.py", "TST-415100"),
    ev(RELEASE_REQUIREMENTS, "TST-418108"),
  ],
  "EXACT DUPLICATES ARE FOUND WITHOUT A MODEL": [
    ev("tests/test_derivation_classes.py", "TST-415100"),
    ev("tests/documents-rule-decides.test.mjs", "TST-472180"),
  ],
  "A CHANGE IS PROPOSED UNDER THE EXISTING NAME": [
    ev("tests/spec-changes-sections.test.mjs", "TST-473031"),
    ev(RELEASE_REQUIREMENTS, "TST-418109"),
  ],
  "A CONFLICT IS DECIDED BY A PERSON": [
    ev("tests/spec-changes-sections.test.mjs", "TST-473035"),
    ev(SYSTEM_REQUIREMENTS, "TST-418005"),
    ev(RELEASE_REQUIREMENTS, "TST-418112"),
  ],
  "A SPEC EDIT IS SAVED AS A PROPOSAL": [
    ev("tests/review-pages-edit-requirement.test.mjs", "TST-472628"),
    ev(SYSTEM_REQUIREMENTS, "TST-418002"),
  ],
  "A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE": [
    ev(DRAFT, "TST-507023"),
    ev(DRAFT, "TST-507024"),
    ev(RELEASE_REQUIREMENTS, "TST-418111"),
    ev("tests/artifact-edits-save.test.mjs", "TST-472042"),
  ],
  "A REFUSED SAVE KEEPS THE EDIT": [
    ev(DRAFT, "TST-507023"),
    ev(RELEASE_REQUIREMENTS, "TST-418111"),
    ev("tests/markdown-render-release-20.test.mjs", "TST-343005"),
  ],
  "AN EDITED FILE KEEPS ITS IDENTIFIER": [
    ev(DRAFT, "TST-507021"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
  ],
  "A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED": [
    ev(RELEASE_REQUIREMENTS, "TST-418118"),
    ev("tests/spec-document-sections.test.mjs", "TST-473073"),
    ev("tests/spec-changes-propose-section.test.mjs", "TST-472988"),
  ],
  "A GENERATED ARTIFACT IS A PROPOSAL": [
    ev(SYSTEM, "TST-377015"),
    ev(RELEASE_REQUIREMENTS, "TST-418117"),
    ev("tests/artifact-edits-open-files.test.mjs", "TST-472035"),
  ],
  "ONE DEFINITION, THREE DRIVERS": [
    ev("tests/runtimes-bridge.test.mjs", "TST-472698"),
    ev(RELEASE_REQUIREMENTS, "TST-418102"),
    ev("tests/endpoint-driver.test.mjs", "TST-472223"),
  ],
  "A PARTICIPANT DECLARES ITS CAPABILITIES": [
    ev("tests/test_participants.py", "TST-475029"),
    ev(SYSTEM, "TST-377014"),
  ],
  "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA": [
    ev("tests/test_participants.py", "TST-475029"),
    ev(RELEASE_REQUIREMENTS, "TST-418105"),
  ],
  "THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK": [
    ev(SYSTEM, "TST-377005"),
    ev(DRAFT, "TST-507026"),
    ev(RELEASE_REQUIREMENTS, "TST-418110"),
  ],
  "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT": [
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
    ev(RELEASE_REQUIREMENTS, "TST-418113"),
    ev("tests/test_correction_loop.py", "TST-475002"),
  ],
  "A FINDING READS LIKE A COMPILER MESSAGE": [
    ev("tests/test_correction_loop.py", "TST-475002"),
    ev("tests/text-tools.test.mjs", "TST-473100"),
    ev(RELEASE_REQUIREMENTS, "TST-418126"),
  ],
  "AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED": [
    ev("tests/test_correction_loop.py", "TST-475003"),
    ev(RELEASE_REQUIREMENTS, "TST-418114"),
    ev("tests/job-runner-requirement-form.test.mjs", "TST-472350"),
  ],
  "WHAT A PERSON DECIDES IS NOT SENT BACK": [
    ev(RELEASE_REQUIREMENTS, "TST-418112"),
    ev("tests/job-runner-run.test.mjs", "TST-472355"),
    ev("tests/job-runner-records.test.mjs", "TST-472344"),
  ],
  "THE CORRECTION LOOP HAS A FIXED LIMIT": [
    ev("tests/test_correction_loop.py", "TST-475008"),
    ev(RELEASE_REQUIREMENTS, "TST-418115"),
    ev("tests/specification-and-design-drafting-together.test.mjs", "TST-476060"),
  ],
  "THE ROUNDS ARE COUNTED AND SHOWN": [
    ev(RELEASE_REQUIREMENTS, "TST-418123"),
    ev("tests/test_correction_loop.py", "TST-475008"),
  ],
  "A REQUIREMENTS JOB RECEIVES THE CHAPTER ON REQUIREMENTS ENGINEERING": [
    ev(RELEASE_REQUIREMENTS, "TST-418106"),
    ev("tests/source-register-chapters.test.mjs", "TST-472885"),
    ev("tests/source-register-checkout.test.mjs", "TST-472890"),
  ],
  // The requirements below have their evidence in this file, through the prompt bar and the route draft.
  "A CI AGENT'S DRAFT ENTERS AS OPEN": [
    ev(RELEASE_REQUIREMENTS, "TST-418120"),
    ev(RELEASE_REQUIREMENTS, "TST-418124"),
  ],
  "NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY": [
    ev(SELF, "TST-377104"),
    ev(SYSTEM, "TST-377006"),
  ],
  "THE PAGE NAMES WHERE IT SENDS": [
    ev(SELF, "TST-377105"),
    ev(SYSTEM_REQUIREMENTS, "TST-418001"),
  ],
  "A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON": [
    ev(SELF, "TST-377106"),
    ev(DRAFT, "TST-507022"),
  ],
  "AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT": [
    ev(SELF, "TST-377107"),
    ev(DRAFT, "TST-507022"),
  ],
  "ONE CLICK PER DECISION": [
    ev(SELF, "TST-377108"),
    ev(SYSTEM, "TST-377009"),
  ],
  "EVERY STEP EXPLAINS ITSELF": [
    ev(SELF, "TST-377109"),
    ev(SELF, "TST-377116"),
    ev(RELEASE_REQUIREMENTS, "TST-418105"),
  ],
};

// The parts of a requirement the code does otherwise: each a todo test, in the file named, that fails now and names what the code does instead.
const FINDINGS = {
  "A CI AGENT'S DRAFT ENTERS AS OPEN": { finding: "UC019-S12", file: SYSTEM, test: "TST-377013" },
  "NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY": { finding: "UC019-S10", file: SYSTEM, test: "TST-377011" },
  "THE PAGE NAMES WHERE IT SENDS": { finding: "UC019-S10", file: RELEASE_REQUIREMENTS, test: "TST-418121" },
  "THE CORRECTION LOOP HAS A FIXED LIMIT": { finding: "UC019-S13", file: RELEASE_REQUIREMENTS, test: "TST-418125" },
  "A PARTICIPANT DECLARES ITS CAPABILITIES": { finding: "UC019-S9", file: SYSTEM, test: "TST-377010" },
};

// TST-377101
// level: release
// module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// guards: UC-019
// given: UC-019's realised requirements as committed, REALISED, COVERED_BY_RELEASE and FINDINGS in this release test
// input: compare the realised requirements with REALISED and with the keys of COVERED_BY_RELEASE
// expect: UC-019 realises exactly the 35 requirements REALISED lists, each once; every one has evidence and no other does; every evidence file exists and contains its named TST id; every finding's test stands in its file with the todo naming the finding
test("TST-377101: UC-019 release coverage names every realised requirement and its executable evidence", () => {
  const realised = ucRealises();
  assert.equal(REALISED.length, 35);
  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(realised.toSorted(), REALISED.toSorted());
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), REALISED.toSorted());

  for (const [requirement, evidence] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(evidence.length > 0, `${requirement} has release evidence`);
    assert.ok(evidence.some(({ file }) => file !== SELF), `${requirement} has evidence beyond this release map`);
    for (const { file, id } of evidence) {
      assert.ok(exists(file), `${requirement} evidence exists: ${file}`);
      assert.ok(read(file).includes(id), `${requirement}: ${file} contains ${id}`);
    }
  }
  for (const [requirement, { finding, file, test: id }] of Object.entries(FINDINGS)) {
    assert.ok(REALISED.includes(requirement), `${requirement} is realised`);
    assert.ok(read(file).includes(`// ${id}\n`), `${requirement}: ${id} stands in ${file}`);
    assert.ok(read(file).includes(`todo: "FINDING ${finding} `), `${requirement}: the todo of ${id} names FINDING ${finding}`);
  }
});

// TST-377102
// level: release
// module: MOD-test-document
// guards: UC-019
// given: the UC-019 system test and its declaration comments
// input: read the system test declarations and route-specific evidence files
// expect: the system test declares UC-019 at system level for TST-377001 to TST-377015, names the Bridge route and the last alternative
test("TST-377102: UC-019 release evidence includes system-level declarations", () => {
  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  const ids = ["TST-377001", "TST-377002", "TST-377003", "TST-377004", "TST-377005", "TST-377006", "TST-377007", "TST-377008", "TST-377009", "TST-377010", "TST-377011", "TST-377012", "TST-377013", "TST-377014", "TST-377015"];
  for (const id of ids) {
    assert.ok(declarations.some((declaration) => declaration.id === id && declaration.level === "system"), `${id} is a system declaration`);
  }

  const system = read(SYSTEM);
  for (const phrase of ["6a-bridge-agent-returns-draft", "9a-target-changed"]) {
    assert.ok(system.includes(phrase), `system evidence includes ${phrase}`);
  }
  assert.ok(read("tests/runtimes-bridge.test.mjs").includes("from the Bridge"));
});

// ---------------------------------------------------------------- the requirements, through the prompt bar and the route draft

const ALIGN = "align UC-007 and UC-008 with the new rule";
const filesDraft = (...files) => ({ files });
// Every text a commit of the product or the instance holds: its message and its files.
const committed = (s) => [...s.product.writes, ...s.instance.writes].flatMap((write) => [write.message, ...Object.values(write.files)]);

// TST-377104
// level: release
// module: MOD-prompt-bar; MOD-job-runner; MOD-review-pages
// guards: UC-019 (NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY)
// given: the page of UC-007 with UC-008 in the product, a participant, drafter, whose context holds 1 token, and one with a larger context
// input: the author presses Send
// expect: nothing is sent and nothing is written; the bar says that drafter does not hold this message and its context holds 1 tokens - what does not fit, by participant - and offers the larger one
test("TST-377104: UC-019 NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY", async () => {
  const s = await scenario({ extraFiles: useCases, context: 1 });
  await onUseCase(s);
  await send(s, ALIGN, { participant: "drafter" });
  assert.match(statusOf(s).textContent, /^Nothing was sent\.drafter does not hold this message: its context holds 1 tokens, the job needs about \d+\. Choose observer, whose context is larger\./);
  assert.equal(s.endpointRequests.length, 0);
  assert.equal(s.product.writes.length, 0);
});

// TST-377105
// level: release
// module: MOD-prompt-bar; MOD-site-frame
// guards: UC-019 (THE PAGE NAMES WHERE IT SENDS)
// given: the page of UC-007, and drafter (this machine) and observer (Anthropic, USA) offered
// input: the author writes an instruction; later Send; at the moment the endpoint receives the exchange the test reads the bar
// expect: before Send the selector names each participant with its processing place; when the exchange reaches the endpoint the bar already says "Sent to:" and "drafter — this machine"
test("TST-377105: UC-019 THE PAGE NAMES WHERE IT SENDS", async () => {
  let seen = null;
  let current = null;
  const s = await scenario({ extraFiles: useCases, answers: [(requests) => { seen = statusOf(current).textContent; return filesDraft(changed("UC-007", UC7_PATH, UC7)); }] });
  current = s;
  await onUseCase(s);
  assert.deepEqual(all(barOf(s), "option").map((option) => option.textContent), ["drafter — this machine", "observer — Anthropic, USA"]);
  assert.equal(s.endpointRequests.length, 0);
  await send(s, ALIGN, { participant: "drafter" });
  assert.match(seen, /^Sent to:drafter — this machine/, "the destination is named before the exchange is answered");
});

// TST-377106
// level: release
// module: MOD-prompt-bar; MOD-review-pages; MOD-artifact-edits
// guards: UC-019 (A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON); UC-049 (6c)
// given: the draft of UC-007 for the instruction "align UC-007 and UC-008 with the new rule", once with recording off and once with recording on in the instance
// input: Send, Review the draft, Save
// expect: off: no commit of the product or the instance, no message and no file of one, holds the instruction or the participant's answer, and no conversation record exists; on: the conversation record of the product holds the instruction, and the Save commit still holds neither
test("TST-377106: UC-019 A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON", async () => {
  const answers = [filesDraft(changed("UC-007", UC7_PATH, UC7))];
  const off = await scenario({ extraFiles: useCases, answers });
  await onUseCase(off); await send(off, ALIGN); await review(off);
  await press(off, namedButton(all(off.target, "div", "draft")[0], "Save"));
  assert.equal(off.product.writes.length, 1, "known positive: the draft was saved");
  assert.equal(committed(off).some((body) => body.includes(ALIGN) || body.includes("is ready to review")), false, "recording off: nothing of the conversation in any commit");
  assert.equal(conversationRecords(off).length, 0);

  const on = await scenario({ extraFiles: useCases, answers, recording: true });
  await onUseCase(on); await send(on, ALIGN); await review(on);
  await press(on, namedButton(all(on.target, "div", "draft")[0], "Save"));
  const records = conversationRecords(on);
  assert.equal(records.length, 1, "recording on: one conversation record");
  assert.match(records[0][0], /^docs\/conversations\/\d{8}-\d{4}-[0-9a-f]{4}\.md$/);
  assert.ok(records[0][1].includes(ALIGN), "the record holds the instruction");
  const saved = on.product.writes.filter((write) => UC7_PATH in write.files);
  assert.equal(saved.length, 1);
  assert.ok(!saved[0].message.includes(ALIGN) && !saved[0].files[UC7_PATH].includes(ALIGN), "the Save commit holds no message of the conversation");
});

// TST-377107
// level: release
// module: MOD-artifact-edits; MOD-review-pages; MOD-job-runner
// guards: UC-019 (AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT)
// given: a saved draft of UC-007, and a saved draft of a requirement
// input: Save
// expect: each commit's message holds an Agent-M-Version line of the form "<40 hex>, commit <40 hex>", Agent-M-Participant: drafter and Agent-M-Model: fixture-model; the text of the saved use case and of the saved proposal holds none of them
test("TST-377107: UC-019 AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT", async () => {
  const useCase = await scenario({ extraFiles: useCases, answers: [filesDraft(changed("UC-007", UC7_PATH, UC7))] });
  await onUseCase(useCase); await send(useCase, ALIGN); await review(useCase);
  await press(useCase, namedButton(all(useCase.target, "div", "draft")[0], "Save"));
  const requirement = await scenario(); await run(requirement);
  await press(requirement, namedButton(requirement.target, "Save"));
  const commits = [useCase.product.writes[0], proposalWrites(requirement)[0]];
  for (const write of commits) {
    const lines = messageLines(write);
    assert.ok(lines.some((line) => /^Agent-M-Version: [0-9a-f]{40}, commit [0-9a-f]{40}$/.test(line)), `a version line in ${write.message}`);
    assert.ok(lines.includes("Agent-M-Participant: drafter") && lines.includes("Agent-M-Model: fixture-model"), write.message);
  }
  for (const body of [...Object.values(useCase.product.writes[0].files), ...proposalTexts(requirement)]) {
    assert.ok(!/Agent-M-|fixture-model|drafter/.test(body), "the artifact's own text names neither the version, the participant nor the model");
  }
});

// TST-377108
// level: release
// module: MOD-review-pages; MOD-prompt-bar
// guards: UC-019 (ONE CLICK PER DECISION)
// given: a draft whose inputs are complete
// input: the author presses Save once
// expect: that click alone writes the commit - one commit, with every file, and no second click or dialog is asked for
test("TST-377108: UC-019 ONE CLICK PER DECISION", async () => {
  const s = await scenario({ extraFiles: useCases, answers: [filesDraft(changed("UC-007", UC7_PATH, UC7), changed("UC-008", UC8_PATH, UC8))] });
  await onUseCase(s); await send(s, ALIGN); await review(s);
  assert.equal(s.product.writes.length, 0);
  await press(s, namedButton(all(s.target, "div", "draft")[0], "Save"));
  assert.equal(s.product.writes.length, 1, "one click, one commit");
  assert.deepEqual(Object.keys(s.product.writes[0].files), [UC7_PATH, UC8_PATH], "both files in it");
  assert.equal(all(s.body, "dialog").length, 0, "no dialog asks for a second click");
});

// TST-377109
// level: release
// module: MOD-prompt-bar; MOD-site-frame
// guards: UC-019 (EVERY STEP EXPLAINS ITSELF)
// given: the page of UC-007 with the prompt bar
// input: read the bar's explanation
// expect: the bar holds a folded "What is this?" that begins "The prompt bar is where you talk to a participant about the page you are looking at"
test("TST-377109: UC-019 EVERY STEP EXPLAINS ITSELF", async () => {
  const s = await scenario({ extraFiles: useCases });
  await onUseCase(s);
  const explanation = one(barOf(s), "details", "explain");
  assert.ok(!explanation.open, "folded");
  assert.equal(one(explanation, "summary").textContent, "What is this?");
  assert.ok(explanation.textContent.startsWith("What is this?The prompt bar is where you talk to a participant about the page you are looking at"));
});

// TST-377116
// level: release
// module: MOD-prompt-bar; MOD-site-frame
// guards: UC-019 (step 1; EVERY STEP EXPLAINS ITSELF)
// given: the page of UC-007 with the prompt bar
// input: read the bar's folded "What is this?"
// expect: it gives the examples UC-019 step 1 names: "split a requirement", "make a rule checkable", "add an alternative flow", "align a use case with a changed requirement"
test("TST-377116: UC-019 1 the bar's explanation gives examples of what to ask", async () => {
  const s = await scenario({ extraFiles: useCases });
  await onUseCase(s);
  const explanation = one(barOf(s), "details", "explain").textContent;
  for (const example of ["split a requirement", "make a rule checkable", "add an alternative flow", "align a use case"]) assert.ok(explanation.includes(example), example);
});
