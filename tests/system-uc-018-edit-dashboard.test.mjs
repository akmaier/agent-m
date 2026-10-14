// System coverage for UC-018 Edit a specification or a use case in the dashboard. This guard ties the edit flow to
// executable evidence across review pages, artifact edits, spec-change queue entries, trace-page links and the editor.
// Run: node --test tests/system-uc-018-edit-dashboard.test.mjs
//
// Module: MOD-review-pages; MOD-artifact-edits; MOD-spec-changes; MOD-trace-pages; MOD-markdown-render
// Guards: UC-018
// Level: system
//
// Input: UC-018 as committed text and the executable evidence files named below.
// Precondition: ITM-358, ITM-359, ITM-360, ITM-368 and ITM-397 are present on main.
// Expected result: the main flow for a use case and a requirement, and alternatives 1a, 3a, 3b, 3c, 3d, 3e, 4a, 4b,
// 5a, 6a, 6b and 7a are covered by executable evidence with GitHub/GitLab represented by fixtures.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { saveFile } from "../src/artifact-edits/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const UC = "docs/use-cases/UC-018-edit-a-specification-or-use-case.md";

const FLOW_EVIDENCE = {
  "main-1-edit-control": {
    uc: "presses **Edit**",
    evidence: [["tests/trace-pages-edit-links.test.mjs", "TST-360001"], ["tests/review-pages-edit-requirement.test.mjs", "TST-472626"]],
  },
  "main-2-editor-and-blob": {
    uc: "notes the blob SHA",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472626"], ["tests/artifact-edits-save.test.mjs", "TST-472042"]],
  },
  "main-3-marks-and-preview": {
    uc: "The preview follows each keystroke",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472626"], ["tests/markdown-render-release-20.test.mjs", "TST-343005"]],
  },
  "main-4-why-and-impact": {
    uc: "shows a **Why** field",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472626"], ["tests/review-pages-edit-requirement.test.mjs", "TST-472627"]],
  },
  "main-5-compare-sha": {
    uc: "compares its blob SHA",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472633"], ["tests/artifact-edits-save.test.mjs", "TST-472042"]],
  },
  "main-6-use-case-direct-commit": {
    uc: "commits the edited file to the default branch",
    evidence: [["tests/artifact-edits-save.test.mjs", "TST-472042"], ["tests/artifact-edits-identifier.test.mjs", "TST-472030"]],
  },
  "main-6-requirement-queue-entry": {
    uc: "adds an entry to the author's open queue",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472628"], ["tests/spec-changes-propose-section.test.mjs", "TST-472985"]],
  },
  "main-7-commit-link-entry-view": {
    uc: "shows the commit as a link",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472628"], ["tests/review-pages-edit-entry.test.mjs", "TST-397001"]],
  },
  "1a-edit-open-proposal": {
    uc: "edits an open proposal",
    evidence: [["tests/review-pages-edit-entry.test.mjs", "TST-397001"], ["tests/review-pages-edit-entry.test.mjs", "TST-397003"]],
  },
  "3a-rename-requirement": {
    uc: "changes a requirement's name",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472631"], ["tests/spec-changes-propose-section.test.mjs", "TST-472988"]],
  },
  "3b-use-case-id-change-disabled": {
    uc: "changes a use case's `id`",
    evidence: [["tests/artifact-edits-identifier.test.mjs", "TST-472029"], ["tests/artifact-edits-identifier.test.mjs", "TST-472030"]],
  },
  "3c-mark-remains": {
    uc: "A mark from step 3 remains",
    evidence: [["tests/review-pages-edit-entry.test.mjs", "TST-397010"], ["tests/markdown-render-release-20.test.mjs", "TST-343005"]],
  },
  "3d-add-requirement": {
    uc: "The author adds a new requirement",
    evidence: [["tests/trace-pages-edit-links.test.mjs", "TST-360002"], ["tests/review-pages-edit-requirement.test.mjs", "TST-472630"]],
  },
  "3e-arrange-link": {
    uc: "link opens the arrangement",
    evidence: [["tests/trace-pages-edit-links.test.mjs", "TST-360002"], ["tests/trace-pages-edit-links.test.mjs", "TST-360003"]],
  },
  "4a-github-no-token": {
    uc: "No token is stored (GitHub)",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472634"], ["tests/spec-changes-propose-section.test.mjs", "TST-472992"]],
  },
  "4b-gitlab-no-token": {
    uc: "on GitLab and no token",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472635"], ["tests/spec-changes-propose-section.test.mjs", "TST-472993"]],
  },
  "5a-changed-since-open": {
    uc: "changed since step 2",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472633"], ["tests/spec-changes-propose-section.test.mjs", "TST-472989"]],
  },
  "6a-another-open-proposal": {
    uc: "Another open proposal already replaces",
    evidence: [["tests/review-pages-edit-requirement.test.mjs", "TST-472632"], ["tests/spec-changes-propose-section.test.mjs", "TST-472991"]],
  },
  "6b-no-write-access": {
    uc: "The author has no write access",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472686"], ["tests/review-pages-edit-requirement.test.mjs", "TST-472634"]],
  },
  "7a-unsaved-changes": {
    uc: "leaves the editor with unsaved changes",
    evidence: [["tests/markdown-render-release-20.test.mjs", "TST-343005"]],
  },
};

// TST-376001
// level: system
// module: MOD-review-pages; MOD-artifact-edits; MOD-spec-changes; MOD-trace-pages; MOD-markdown-render
// guards: UC-018
// given: UC-018 and the executable tests named in FLOW_EVIDENCE
// input: compare every main-flow segment and named alternative with its executable evidence
// expect: every UC-018 flow is present in the use case text and every evidence file exists and contains its TST id
test("TST-376001: UC-018 system coverage names the main flow and each required alternative", () => {
  const uc = read(UC);
  for (const [flow, { uc: needle, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    assert.ok(uc.includes(needle), `${flow}: UC-018 contains ${needle}`);
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, id] of evidence) {
      assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
      assert.ok(read(file).includes(id), `${flow}: ${file} contains ${id}`);
    }
  }
});

// TST-376002
// level: system
// module: MOD-review-pages; MOD-artifact-edits; MOD-spec-changes; MOD-trace-pages
// guards: UC-018
// given: the UC-018 edit, save and proposal evidence files
// input: inspect the split between direct use-case saves, requirement proposals, fallback pages and stale-save refusal
// expect: use cases save by artifact edit, requirements save through spec-change entries, GitHub fallback carries no text in URLs, GitLab has no tokenless save, and refused saves keep the edit
test("TST-376002: UC-018 evidence covers direct saves, proposal saves, fallbacks and stale-save refusal", () => {
  const artifactSave = read("tests/artifact-edits-save.test.mjs");
  assert.ok(artifactSave.includes("commitFiles"), "use-case saves write through the repository host");
  assert.ok(artifactSave.includes("changed meanwhile"), "changed files are refused");

  const editRequirement = read("tests/review-pages-edit-requirement.test.mjs");
  assert.ok(editRequirement.includes("SPEC.md untouched"), "requirement edits leave SPEC.md unchanged");
  assert.ok(editRequirement.includes("TST-472634"), "GitHub no-token fallback is exercised");
  assert.ok(editRequirement.includes("TST-472635"), "GitLab without token has no Save");

  const specChanges = read("tests/spec-changes-propose-section.test.mjs");
  assert.ok(specChanges.includes("openQueueOf"), "requirement edits collect in an open queue");
  assert.ok(specChanges.includes("TST-472989"), "section changed meanwhile is refused");

  const editor = read("tests/markdown-render-release-20.test.mjs");
  assert.ok(editor.includes("unsaved close"), "unsaved editor changes ask before being discarded");
});

// TST-376003
// level: system
// module: MOD-artifact-edits
// guards: UC-018; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE; A REFUSED SAVE KEEPS THE EDIT
// given: a use-case edit opened on an older blob while the default branch now holds newer text
// input: save the edited use-case file through MOD-artifact-edits
// expect: no commit is attempted, the refusal names the newer text and blob, and the person's edit can stay beside it
test("TST-376003: UC-018 refuses a use-case save when the file changed after the editor opened", async () => {
  const path = "docs/use-cases/UC-018-sample.md";
  const newer = "---\nid: UC-018\n---\n# UC-018 Newer\n";
  const writes = [];
  const host = {
    repositoryInfo: async () => ({ defaultBranch: "main" }),
    readSnapshot: async () => ({
      commit: "head-now",
      blob: (candidate) => candidate === path ? "newer-blob" : null,
      read: async (candidate) => candidate === path ? newer : null,
    }),
    commitFiles: async (change) => { writes.push(change); return { commit: "wrong" }; },
  };

  const result = await saveFile(host, { path, text: "---\nid: UC-018\n---\n# UC-018 Edited\n", openedBlob: "opened-blob", openedId: null });
  assert.deepEqual(result, { refused: "changed meanwhile", current: newer, currentBlob: "newer-blob" });
  assert.deepEqual(writes, [], "nothing is committed while the branch holds newer text");
});
