// System coverage for UC-019 Change a specification or a use case by prompt. This guard ties each flow of the accepted
// use case either to executable evidence or to a pending finding, across the review page, job runner, runtime routes and
// artifact edits.
// Run: node --test tests/system-uc-019-change-by-prompt.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-runtimes
// Guards: UC-019
// Level: system
//
// Input: UC-019 as committed text and the executable evidence files named below.
// Precondition: ITM-363, ITM-369, ITM-366, ITM-325 and ITM-367 are present on main.
// Expected result: step 4 and the difference of step 8, the correction loop (7), and the alternatives 3a, 6a, 6c, 7a, 7b,
// 8b (each file with its difference), 8c and 9a are covered by executable evidence that asserts nothing the accepted
// UC-019 replaced. The flows the accepted text changed and that have no such evidence yet - the instruction written in
// the prompt bar (steps 1 to 3), Send (5, 5a), a context that does not fit (4a), a follow-up instruction in the prompt
// bar (8), the work handed to GitHub Actions (6b) and Save with the record of step 9 - are pending findings, each a todo
// test below that names what is missing.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { lineDiff } from "../src/text-tools/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const UC = "docs/use-cases/UC-019-change-a-specification-or-use-case-by-prompt.md";
const SELF = "tests/system-uc-019-change-by-prompt.test.mjs";

const FLOW_EVIDENCE = {
  "main-4-complete-context": {
    uc: "the use case, every requirement it realises, and every other use case",
    evidence: [["tests/approvals-strategies.test.mjs", "TST-472023"]],
  },
  "main-6-endpoint-participant-returns-draft": {
    uc: "The participant returns the changed text",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"]],
  },
  "main-7-correction-loop": {
    uc: "The correction loop",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472643"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476060"]],
  },
  "main-8-editor-and-difference": {
    uc: "current text line by line",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"], ["tests/markdown-render-release-20.test.mjs", "TST-343005"]],
  },
  "3a-no-participant": {
    uc: "No participant can draft text",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472639"]],
  },
  "6a-bridge-agent-returns-draft": {
    uc: "The participant is a CLI or sandboxed agent",
    evidence: [["tests/runtimes-bridge.test.mjs", "TST-472698"]],
  },
  "6c-unusable-answer": {
    uc: "The participant returns nothing usable",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472644"]],
  },
  "7a-findings-left-identifier-restored": {
    uc: "The loop ends with findings left",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472643"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476060"]],
  },
  "7b-dropped-realises-name-shown-as-diff": {
    uc: "The participant dropped a name from `realises`",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"], ["tests/markdown-render-release-20.test.mjs", "TST-342009"]],
  },
  "8b-several-use-cases-each-with-its-difference": {
    uc: "Each file is shown with its own difference",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472642"]],
  },
  "8c-discard": {
    uc: "The author discards the draft",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472645"]],
  },
  "9a-target-changed": {
    uc: "The target changed while the participant was drafting",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472647"]],
  },
};

// Each flow the accepted UC-019 changed and that has no executable evidence yet; its todo test stands below.
const FLOW_PENDING = {
  "main-1-3-instruction-in-the-prompt-bar": { uc: "writes the instruction in the prompt bar (UC-049)", finding: "UC019-S1", test: "TST-377004" },
  "main-5-send": { uc: "The author presses **Send**", finding: "UC019-S2", test: "TST-377005" },
  "5a-send-not-pressed": { uc: "The author does not press Send", finding: "UC019-S2", test: "TST-377005" },
  "4a-context-too-small": { uc: "The context does not fit into the chosen participant", finding: "UC019-S3", test: "TST-377006" },
  "8-follow-up-instruction-in-the-prompt-bar": { uc: "writes a follow-up instruction in the prompt bar", finding: "UC019-S4", test: "TST-377007" },
  "6b-work-handed-to-github-actions": { uc: "The work is handed to GitHub Actions", finding: "UC019-S5", test: "TST-377008" },
  "9-save-records-the-version-not-the-instruction": { uc: "never the instruction", finding: "UC019-S6", test: "TST-377009" },
};

// TST-377001
// level: system
// module: MOD-review-pages; MOD-artifact-edits; MOD-runtimes
// guards: UC-019
// given: UC-019, the executable tests named in FLOW_EVIDENCE and the pending flows named in FLOW_PENDING
// input: compare every main-flow segment and named alternative with its executable evidence or its pending finding
// expect: every named passage stands in UC-019; every evidence file exists and contains its TST id; every pending flow's finding is the todo of its test in this file
test("TST-377001: UC-019 system coverage names the main flow and each required alternative", () => {
  const uc = read(UC);
  for (const [flow, { uc: needle, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    assert.ok(uc.includes(needle), `${flow}: UC-019 contains ${needle}`);
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, id] of evidence) {
      assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
      assert.ok(read(file).includes(id), `${flow}: ${file} contains ${id}`);
    }
  }
  const self = read(SELF);
  for (const [flow, { uc: needle, finding, test: id }] of Object.entries(FLOW_PENDING)) {
    assert.ok(uc.includes(needle), `${flow}: UC-019 contains ${needle}`);
    assert.ok(self.includes(`// ${id}\n`), `${flow}: ${id} stands in this file`);
    assert.ok(self.includes(`todo: "FINDING ${finding} `), `${flow}: the todo of ${id} names FINDING ${finding}`);
  }
});

// TST-377002
// level: system
// module: MOD-review-pages; MOD-runtimes
// guards: UC-019
// given: the Bridge and endpoint evidence files named for UC-019
// input: inspect their fixture boundaries
// expect: the endpoint is a fixture fetch and the Bridge path returns a draft from the Bridge
test("TST-377002: UC-019 system evidence includes the fixture endpoint and Bridge routes", () => {
  const review = read("tests/review-pages-prompt-use-case.test.mjs");
  assert.ok(review.includes("globalThis.fetch"), "the endpoint participant is a fixture fetch");
  assert.ok(review.includes("endpointAnswers"), "the fixture endpoint returns the draft");

  const bridge = read("tests/runtimes-bridge.test.mjs");
  assert.ok(bridge.includes("from the Bridge"), "the Bridge fixture returns the draft");
  assert.ok(bridge.includes("POST /v1/ask"), "the Bridge driver uses the Bridge ask API");
  assert.ok(bridge.includes("TST-472698"), "the Bridge driver evidence is present");
});

// TST-377003
// level: system
// module: MOD-markdown-render; MOD-text-tools
// guards: UC-019
// given: a current use case that realises two requirements and a draft that drops one of the names
// input: the same line-diff boundary that the dashboard difference uses
// expect: the dropped `realises` name is observable as a removed line, not hidden as a clean unchanged draft
test("TST-377003: UC-019 7b makes a dropped realised name visible in the difference", () => {
  const current = ["---", "id: UC-007", "realises:", "  - A LOAN HAS A DUE DATE", "  - A FINE HAS A REASON", "---", "# UC-007 Loan", ""].join("\n");
  const draft = ["---", "id: UC-007", "realises:", "  - A LOAN HAS A DUE DATE", "---", "# UC-007 Loan", ""].join("\n");
  const diff = lineDiff(current, draft);
  assert.ok(diff.some((line) => line.op === "removed" && line.text === "  - A FINE HAS A REASON"), "the dropped requirement name is highlighted as removed");
  assert.ok(!diff.some((line) => line.op === "added" && line.text.includes("A FINE HAS A REASON")), "the drop is not transformed into a new added name");
});

// ---------------------------------------------------------------- pending findings: the prompt bar's flows (ITM-503 to ITM-507)

// TST-377004
// level: system
// module: MOD-review-pages
// guards: UC-019 (steps 1 to 3)
// given: a requirement, a group of requirements or a use case open, and a participant able to draft text
// input: the author writes an instruction in the prompt bar
// expect: the bar names the participant with the place where it processes data, offers only participants that can draft text, and takes the open artifact as the target without the author naming it
test("TST-377004: UC-019 1-3 the instruction is written in the prompt bar", { todo: "FINDING UC019-S1 — no prompt bar exists on the review pages; the only executable evidence drives the replaced Change by prompt route (a link, an instruction field and a list of participants beside it)" }, () => {
  assert.fail("no test reaches the prompt bar of UC-049 from an open requirement or use case");
});

// TST-377005
// level: system
// module: MOD-review-pages
// guards: UC-019 (steps 5, 5a)
// given: an instruction in the prompt bar and the context assembled
// input: the author presses Send; in the other case the author does not
// expect: on Send the instruction and the context go to the participant; without Send nothing is sent
test("TST-377005: UC-019 5 and 5a Send is the decision to send", { todo: "FINDING UC019-S2 — no test presses Send; the evidence there presses the run panel's Run (TST-472645, TST-472650), which UC-019 replaced" }, () => {
  assert.fail("no test presses Send in the prompt bar or shows that nothing is sent without it");
});

// TST-377006
// level: system
// module: MOD-review-pages
// guards: UC-019 (4a)
// given: a participant whose context cannot hold the instruction and the context of step 4
// input: the author presses Send
// expect: nothing is sent; the page says how many requirements or use cases there are and how much fits, and offers a participant with a larger context
test("TST-377006: UC-019 4a a context that does not fit sends nothing", { todo: "FINDING UC019-S3 — the only test of a context that does not fit (TST-472640) asserts the run panel's destination, parts and Run button; none reaches Send" }, () => {
  assert.fail("no test shows a context that does not fit the participant on the path of Send");
});

// TST-377007
// level: system
// module: MOD-review-pages
// guards: UC-019 (step 8)
// given: a draft in the editor of UC-018
// input: the author writes a follow-up instruction in the prompt bar and presses Send
// expect: steps 5 to 7 repeat on the current draft
test("TST-377007: UC-019 8 a follow-up instruction in the prompt bar repeats steps 5 to 7", { todo: "FINDING UC019-S4 — no follow-up instruction exists; the evidence there presses Refine (TST-472345, TST-472348), which UC-019 replaced" }, () => {
  assert.fail("no test writes a follow-up instruction in the prompt bar on a draft");
});

// TST-377008
// level: system
// module: MOD-workflow-entries; MOD-review-pages
// guards: UC-019 (6b)
// given: a handover to GitHub Actions from the prompt bar (UC-049, 4a)
// input: the workflow runs the correction loop and commits the draft to the default branch
// expect: a use case is committed as open and a change to requirements as a queue entry, SPEC.md untouched; the commit records what step 9 records; the job record names no message of the conversation; the author reviews it on the dashboard
test("TST-377008: UC-019 6b the work is handed to GitHub Actions", { todo: "FINDING UC019-S5 — no test hands work to GitHub Actions from the prompt bar; the evidence there is a CI agent chosen as the participant of the run panel (TST-472649) and a job record carrying the instruction (TST-473198), which UC-019 replaced" }, () => {
  assert.fail("no test reaches the workflow from the prompt bar or checks that the job record names no message");
});

// TST-377009
// level: system
// module: MOD-review-pages; MOD-artifact-edits
// guards: UC-019 (steps 8b, 9)
// given: drafts of one or several use cases in their editors
// input: the author presses Save
// expect: one commit records the participant, the model, the Agent M version, the date and the correction rounds, and no instruction
test("TST-377009: UC-019 9 Save records the participant, model, version, date and rounds, never the instruction", { todo: "FINDING UC019-S6 — every test of Save's commit (TST-472646, TST-473198, TST-476059) asserts an Agent-M-Instruction line among the provenance lines, which UC-019 says is never recorded" }, () => {
  assert.fail("no test shows a commit of a saved draft without the instruction");
});
