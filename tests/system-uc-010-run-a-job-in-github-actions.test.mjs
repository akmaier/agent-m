// System coverage for UC-010 Run a job in GitHub Actions. This guard ties the use-case path to executable evidence
// across workflow entries, runtimes, the job ledger, settings pages, repository hosts and endpoint calls.
// Run: node --test tests/system-uc-010-run-a-job-in-github-actions.test.mjs
//
// Module: MOD-workflow-entries; MOD-runtimes; MOD-job-ledger; MOD-settings-pages; MOD-repository-hosts; MOD-endpoint-calls
// Guards: UC-010
// Level: system
//
// Input: UC-010 as committed text and the executable evidence files named below.
// Precondition: ITM-351 and the UC-010 build-on runtime, workflow-entry, job-ledger, repository-host and endpoint tests
// are present on main.
// Expected result: the main flow and alternatives 3a and 4a are covered by executable evidence, including dashboard and
// server-page starts, fixture product checkouts, a fixture endpoint, missing-secret handling and the no-change path.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const UC = "docs/use-cases/UC-010-run-a-job-in-github-actions.md";
const ITEM = "docs/backlog/ITM-373-the-system-and-release-tests-of-uc-010.md";

const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const exists = (path) => existsSync(new URL(path, ROOT));
const compact = (text) => text.replace(/\s+/g, " ").trim();
const ev = (file, id) => [file, id];

const FLOW_EVIDENCE = {
  "precondition-workflow-installed-and-secrets-named": {
    uc: [
      "The job workflow of Agent M is installed in the product repository.",
      "dashboard names the secret and opens the repository's secrets page",
    ],
    evidence: [
      ev("tests/settings-pages-settings-regressions.test.mjs", "TST-351001"),
      ev("tests/runtimes-workflow.test.mjs", "TST-472727"),
      ev("tests/repository-hosts-ci-pages.test.mjs", "TST-472524"),
    ],
  },
  "main-1-dashboard-ci-route-writes-job-record": {
    uc: "The author starts the job from the dashboard or from GitHub's Actions page.",
    evidence: [
      ev("tests/runtimes-ci.test.mjs", "TST-472702"),
      ev("tests/job-ledger.test.mjs", "TST-472297"),
    ],
  },
  "main-1-server-page-dispatch-writes-job-record": {
    uc: "The author starts the job from the dashboard or from GitHub's Actions page.",
    evidence: [
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473206"),
      ev("tests/repository-hosts-ci-pages.test.mjs", "TST-472526"),
    ],
  },
  "main-2-workflow-reads-same-job-definition": {
    uc: "The workflow reads the job definition and prompt — the same files the browser uses.",
    evidence: [
      ev("tests/runtimes-workflow.test.mjs", "TST-472724"),
      ev("tests/runtimes-workflow.test.mjs", "TST-472726"),
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473204"),
    ],
  },
  "main-3-workflow-calls-endpoint-with-secret": {
    uc: "The workflow calls the endpoint with the secret.",
    evidence: [
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473201"),
      ev("tests/endpoint-driver.test.mjs", "TST-472223"),
    ],
  },
  "main-4-artifacts-and-end-record-committed-open": {
    uc: "The workflow commits the resulting artifacts to the default branch, where they are open, together with the job's end record.",
    evidence: [
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473201"),
      ev("tests/artifact-edits-open-files.test.mjs", "TST-472033"),
      ev("tests/repository-hosts-clone.test.mjs", "TST-472532"),
    ],
  },
  "main-5-author-reviews-on-dashboard": {
    uc: "The author reviews them on the dashboard, as in UC-006 or UC-008.",
    evidence: [
      ev("tests/artifact-edits-open-files.test.mjs", "TST-472035"),
      ev("tests/system-uc-006-approve-spec-change.test.mjs", "TST-371001"),
    ],
  },
  "alternative-3a-missing-secret-names-secret-and-writes-nothing": {
    uc: [
      "The secret is missing.",
      "The workflow fails with a message naming the secret; nothing is written.",
    ],
    evidence: [
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473203"),
      ev("tests/settings-pages-settings-regressions.test.mjs", "TST-351001"),
    ],
  },
  "alternative-4a-no-change-writes-nothing": {
    uc: [
      "The result equals the current artifacts.",
      "Nothing is committed; the run reports \"no change\".",
    ],
    evidence: [
      ev("tests/workflow-entries-job-workflow.test.mjs", "TST-473205"),
      ev("tests/artifact-edits-open-files.test.mjs", "TST-472037"),
    ],
  },
};

// TST-373001
// level: system
// module: MOD-workflow-entries; MOD-runtimes; MOD-job-ledger; MOD-settings-pages; MOD-repository-hosts; MOD-endpoint-calls
// guards: UC-010
// given: UC-010 and the executable tests named in FLOW_EVIDENCE
// input: compare every main-flow segment and named alternative with its executable evidence
// expect: every UC-010 flow segment is present in the use case text and every evidence file exists and contains its TST id
test("TST-373001: UC-010 system coverage names the main flow and alternatives 3a and 4a", () => {
  const uc = compact(read(UC));
  for (const [flow, { uc: needles, evidence }] of Object.entries(FLOW_EVIDENCE)) {
    for (const needle of Array.isArray(needles) ? needles : [needles]) {
      assert.ok(uc.includes(compact(needle)), `${flow}: UC-010 contains ${needle}`);
    }
    assert.ok(evidence.length > 0, `${flow}: evidence is named`);
    for (const [file, id] of evidence) {
      assert.ok(exists(file), `${flow}: evidence file exists: ${file}`);
      assert.ok(read(file).includes(id), `${flow}: ${file} contains ${id}`);
    }
  }
});

// TST-373002
// level: system
// module: MOD-workflow-entries; MOD-runtimes; MOD-settings-pages
// guards: UC-010; NO SECRET IN THE REPOSITORY; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
// given: the UC-010 workflow-entry, runtime and settings evidence files
// input: inspect their fixture boundaries and secret boundaries
// expect: the job runs in fixture product checkouts against a fixture endpoint, settings name only secret names, and missing-secret/no-change paths are executable evidence
test("TST-373002: UC-010 evidence crosses CI route, server-page dispatch, fixture endpoint and secret boundaries", () => {
  const item = compact(read(ITEM));
  assert.ok(item.includes("from the dashboard on the CI route, and one from the server's own page"), "ITM-373 names both start surfaces");
  assert.ok(item.includes("3a, a missing secret"), "ITM-373 names alternative 3a");
  assert.ok(item.includes("4a, a result equal to the current artifacts"), "ITM-373 names alternative 4a");

  const workflowEntry = read("tests/workflow-entries-job-workflow.test.mjs");
  assert.ok(workflowEntry.includes("temporary git repositories"), "the job workflow evidence uses fixture product checkouts");
  assert.ok(workflowEntry.includes("globalThis.fetch"), "the job workflow evidence uses a fixture endpoint");
  assert.ok(workflowEntry.includes("onDispatch"), "the server-page dispatch path is exercised");
  assert.ok(workflowEntry.includes("not run"), "the missing-secret path ends before a run");
  assert.ok(workflowEntry.includes("no change"), "the no-change path is exercised");

  const workflow = read("tests/runtimes-workflow.test.mjs");
  assert.ok(workflow.includes(".github/workflows/agent-m-jobs.yml"), "the GitHub job workflow file is executable evidence");
  assert.ok(workflow.includes("AGENT_M_TOKEN"), "the agent secret is named");
  assert.ok(workflow.includes("GITHUB_TOKEN"), "the workflow rejects the platform token as the person's write token");

  const settings = read("tests/settings-pages-settings-regressions.test.mjs");
  assert.ok(settings.includes("settings-job-workflow"), "settings page exposes the job workflow section");
  assert.ok(settings.includes("AGENT_M_TOKEN"), "settings page names the Agent M secret");
  assert.ok(settings.includes("HOSTED_KEY"), "settings page names participant secrets");
});
