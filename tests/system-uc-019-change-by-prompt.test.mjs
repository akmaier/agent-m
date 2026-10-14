// System coverage for UC-019 Change a specification or a use case by prompt. This guard ties the use case's use-case
// path to executable evidence across the review page, job runner, runtime routes, artifact edits and CI workflow entry.
// Run: node --test tests/system-uc-019-change-by-prompt.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// Guards: UC-019
// Level: system
//
// Input: UC-019 as committed text and the executable evidence files named below.
// Precondition: ITM-363, ITM-369, ITM-366, ITM-325, ITM-367, ITM-389 and ITM-395 are present on main.
// Expected result: the main flow and alternatives 3a, 4a, 5a, 6a, 6b, 6c, 7a, 7b, 8/Refine, 8b, 8c and 9a are covered
// by executable evidence, including a fixture endpoint, a fixture Bridge agent and the product job workflow.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { lineDiff } from "../src/text-tools/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const UC = "docs/use-cases/UC-019-change-a-specification-or-use-case-by-prompt.md";

const FLOW_EVIDENCE = {
  "main-1-change-by-prompt-link": {
    uc: "presses **Change by prompt**",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472637"]],
  },
  "main-2-instruction": {
    uc: "The author writes the instruction",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472638"], ["tests/review-pages-prompt-use-case.test.mjs", "TST-472650"]],
  },
  "main-3-drafting-participant": {
    uc: "shows for each where it processes data",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472638"]],
  },
  "main-4-complete-context": {
    uc: "the use case, every requirement it realises, and every other use case",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472640"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476059"]],
  },
  "main-5-run-panel": {
    uc: "The run panel shows the destination",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472640"]],
  },
  "main-6-endpoint-participant-returns-draft": {
    uc: "The participant returns the changed text",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476059"]],
  },
  "main-7-correction-loop": {
    uc: "The correction loop",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472643"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476059"]],
  },
  "main-8-editor-and-difference": {
    uc: "current text line by line",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"], ["tests/markdown-render-release-20.test.mjs", "TST-343005"]],
  },
  "main-9-save-open-use-case": {
    uc: "The author presses **Save**",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472646"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476059"]],
  },
  "3a-no-participant": {
    uc: "No participant can draft text",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472639"]],
  },
  "4a-context-too-small": {
    uc: "The context does not fit into the chosen participant",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472640"], ["tests/job-runner-left-out.test.mjs", "TST-472332"]],
  },
  "5a-run-not-pressed": {
    uc: "The author does not press Run",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472645"], ["tests/review-pages-prompt-use-case.test.mjs", "TST-472650"]],
  },
  "6a-bridge-agent-returns-draft": {
    uc: "The participant is a CLI or sandboxed agent",
    evidence: [["tests/runtimes-bridge.test.mjs", "TST-472698"], ["tests/runtimes-bridge.test.mjs", "TST-472700"]],
  },
  "6b-ci-workflow-commits-open-use-case": {
    uc: "The participant is a CI agent",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472649"], ["tests/workflow-entries-design-kinds.test.mjs", "TST-473198"]],
  },
  "6c-unusable-answer": {
    uc: "The participant returns nothing usable",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472644"], ["tests/runtimes-tab.test.mjs", "TST-472722"]],
  },
  "7a-findings-left-identifier-restored": {
    uc: "The loop ends with findings left",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472643"], ["tests/specification-and-design-drafting-together.test.mjs", "TST-476060"]],
  },
  "7b-dropped-realises-name-shown-as-diff": {
    uc: "The participant dropped a name from `realises`",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472641"], ["tests/markdown-render-release-20.test.mjs", "TST-342009"]],
  },
  "8-refine": {
    uc: "presses **Refine**",
    evidence: [["tests/job-runner-refine.test.mjs", "TST-472345"], ["tests/job-runner-refine.test.mjs", "TST-472348"]],
  },
  "8b-several-use-cases": {
    uc: "The instruction touched several use cases",
    evidence: [["tests/review-pages-prompt-use-case.test.mjs", "TST-472642"], ["tests/review-pages-prompt-use-case.test.mjs", "TST-472646"]],
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

// TST-377001
// level: system
// module: MOD-review-pages; MOD-artifact-edits; MOD-workflow-entries; MOD-runtimes
// guards: UC-019
// given: UC-019 and the executable tests named in FLOW_EVIDENCE
// input: compare every main-flow segment and named alternative with its executable evidence
// expect: every UC-019 flow is present in the use case text and every evidence file exists and contains its TST id
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
});

// TST-377002
// level: system
// module: MOD-review-pages; MOD-workflow-entries; MOD-runtimes
// guards: UC-019
// given: the Bridge, endpoint and CI evidence files named for UC-019
// input: inspect their fixture boundaries
// expect: the endpoint is a fixture fetch, the Bridge path returns a draft from the Bridge, and the CI workflow runs over fixture git checkouts and commits an open use case
test("TST-377002: UC-019 system evidence includes the fixture endpoint, Bridge and CI workflow routes", () => {
  const review = read("tests/review-pages-prompt-use-case.test.mjs");
  assert.ok(review.includes("globalThis.fetch"), "the endpoint participant is a fixture fetch");
  assert.ok(review.includes("endpointAnswers"), "the fixture endpoint returns the draft");

  const bridge = read("tests/runtimes-bridge.test.mjs");
  assert.ok(bridge.includes("from the Bridge"), "the Bridge fixture returns the draft");
  assert.ok(bridge.includes("POST /v1/ask"), "the Bridge driver uses the Bridge ask API");
  assert.ok(bridge.includes("TST-472700"), "the runOnTab Bridge route evidence is present");

  const ci = read("tests/workflow-entries-design-kinds.test.mjs");
  assert.ok(ci.includes("temporary git repositories"), "the CI evidence uses fixture checkouts");
  assert.ok(ci.includes("change-use-case"), "the CI evidence runs the change-use-case kind");
  assert.ok(ci.includes("one commit of an open file"), "the CI evidence writes an open use case");
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
