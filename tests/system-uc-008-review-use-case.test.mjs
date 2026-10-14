// System coverage for UC-008 Review and accept a use case. This guard ties the use-case review flow to executable
// evidence in the review pages, approvals, artifact edits and markdown editor tests.
// Run: node --test tests/system-uc-008-review-use-case.test.mjs
//
// Module: MOD-review-pages; MOD-approvals; MOD-artifact-edits; MOD-markdown-render
// Guards: UC-008
// Level: system
//
// Input: UC-008 as committed text and the executable evidence files named below.
// Precondition: ITM-355, ITM-356, ITM-358 and ITM-368 are present on main.
// Expected result: the main flow and alternatives 1a, 2a, 3a, 3b, 3c, 3d, 3e, 4a and 5a are covered by executable
// evidence, including fixture GitHub/GitLab host paths and the old dashboard guard that stays.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { statuses } from "../src/approvals/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const UC = "docs/use-cases/UC-008-review-and-accept-a-use-case.md";

const FLOW_EVIDENCE = {
  "main-1-list-status": {
    uc: "use case of that product with its derived status",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472678"], ["tests/approvals-status.test.mjs", "TST-472020"]],
  },
  "main-2-open-render": {
    uc: "renders its text and Mermaid diagram",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472679"]],
  },
  "main-3-accept-one-click": {
    uc: "presses **Accept**",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472680"], ["tests/approvals-accept.test.mjs", "TST-472001"]],
  },
  "main-4-record-names-sha": {
    uc: "computes the git blob SHA",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472680"], ["tests/approvals-accept.test.mjs", "TST-472001"]],
  },
  "main-5-accepted-status": {
    uc: "shows the use case as accepted",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472680"], ["tests/approvals-status.test.mjs", "TST-472020"]],
  },
  "1a-private-no-token": {
    uc: "The product repository is private",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472687"]],
  },
  "3a-edit-and-save": {
    uc: "opens an editor with a live",
    evidence: [["tests/markdown-render-release-20.test.mjs", "TST-343005"], ["tests/artifact-edits-save.test.mjs", "TST-472042"]],
  },
  "3b-github-no-token": {
    uc: "Accept** opens GitHub's new-file page",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472683"], ["tests/approvals-accept.test.mjs", "TST-472005"]],
  },
  "3c-gitlab-no-token": {
    uc: "product is on a GitLab server and no token",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472685"], ["tests/approvals-accept.test.mjs", "TST-472006"]],
  },
  "4a-no-write-access": {
    uc: "The reviewer has no write access",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472686"], ["tests/approvals-accept.test.mjs", "TST-472004"]],
  },
  "3d-accept-ticked": {
    uc: "Accept ticked** writes",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472681"], ["tests/approvals-accept.test.mjs", "TST-472001"]],
  },
  "3e-review-all": {
    uc: "Review all** opens one page",
    evidence: [["tests/review-pages-review-all.test.mjs", "TST-472651"], ["tests/review-pages-review-all.test.mjs", "TST-472652"]],
  },
  "2a-changed-since-acceptance": {
    uc: "difference to the text the most recent approval record",
    evidence: [["tests/review-pages-use-cases.test.mjs", "TST-472682"], ["tests/review-pages-review-all.test.mjs", "TST-472651"]],
  },
  "5a-edited-after-acceptance": {
    uc: "The file is edited after acceptance",
    evidence: [["tests/approvals-status.test.mjs", "TST-472021"], ["tests/review-pages-use-cases.test.mjs", "TST-472682"]],
  },
};

// TST-372001
// level: system
// module: MOD-review-pages; MOD-approvals; MOD-artifact-edits; MOD-markdown-render
// guards: UC-008
// given: UC-008 and the executable tests named in FLOW_EVIDENCE
// input: compare every main-flow segment and named alternative with its executable evidence
// expect: every UC-008 flow is present in the use case text and every evidence file exists and contains its TST id
test("TST-372001: UC-008 system coverage names the main flow and each required alternative", () => {
  const uc = read(UC);
  for (const [flow, { uc: needle, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    assert.ok(uc.includes(needle), `${flow}: UC-008 contains ${needle}`);
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, id] of evidence) {
      assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
      assert.ok(read(file).includes(id), `${flow}: ${file} contains ${id}`);
    }
  }
});

// TST-372002
// level: system
// module: MOD-review-pages; MOD-approvals
// guards: UC-008
// given: the review-page and approval evidence files named for UC-008
// input: inspect the fixture boundaries for host fallbacks, multi-file acceptance and changed-file status derivation
// expect: GitHub and GitLab are fixture host paths, no-token GitHub keeps text out of the URL, GitLab has no save path without a token, and review-all/ticked acceptance writes several records only on a click
test("TST-372002: UC-008 evidence covers host fallbacks, several-file acceptance and derived status", () => {
  const useCases = read("tests/review-pages-use-cases.test.mjs");
  assert.ok(useCases.includes("TST-472683"), "GitHub no-token fallback is executable evidence");
  assert.ok(useCases.includes("TST-472685"), "GitLab without a token is executable evidence");
  assert.ok(useCases.includes("TST-472687"), "private repository without a reaching token is executable evidence");

  const reviewAll = read("tests/review-pages-review-all.test.mjs");
  assert.ok(reviewAll.includes("Accept all"), "review-all acceptance is exercised");
  assert.ok(reviewAll.includes("TST-472653"), "changed-after-page-built files are left out");
  assert.ok(reviewAll.includes("TST-472657"), "GitHub fallback keeps record text out of the URL");

  const approvals = read("tests/approvals-accept.test.mjs");
  assert.ok(approvals.includes("two use cases shown are accepted in one commit"), "several accepted files are represented by the approval tests");
  assert.ok(approvals.includes("TST-472005"), "the approval fallback path checks no text travels in the URL");

  const status = read("tests/approvals-status.test.mjs");
  assert.ok(status.includes("open, accepted or changed"), "status is derived from records and the current blob");
});

// TST-372003
// level: system
// module: MOD-approvals
// guards: UC-008; STATUS IS DERIVED FROM THE RECORDS; A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
// given: a snapshot with one open use case, one accepted use case and one use case whose approval record names an older blob
// input: derive statuses from the snapshot's reviewed files and approval-record paths
// expect: the changed use case is changed because no record names its current blob, without any stored status being reset
test("TST-372003: UC-008 changed-after-acceptance status is derived from approval records and the current blob", () => {
  const acceptedBlob = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const changedBlob = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const olderBlob = "cccccccccccccccccccccccccccccccccccccccc";
  const files = {
    "docs/use-cases/UC-081-open.md": "1111111111111111111111111111111111111111",
    "docs/use-cases/UC-082-accepted.md": acceptedBlob,
    "docs/use-cases/UC-083-changed.md": changedBlob,
  };
  const snapshot = {
    paths: [
      ...Object.keys(files),
      `docs/approvals/UC-082-${acceptedBlob.slice(0, 12)}.md`,
      `docs/approvals/UC-083-${olderBlob.slice(0, 12)}.md`,
    ],
    blob: (path) => files[path] ?? null,
  };

  const result = statuses(snapshot);
  assert.equal(result.get("docs/use-cases/UC-081-open.md").status, "open");
  assert.equal(result.get("docs/use-cases/UC-082-accepted.md").status, "accepted");
  assert.equal(result.get("docs/use-cases/UC-083-changed.md").status, "changed");
});
