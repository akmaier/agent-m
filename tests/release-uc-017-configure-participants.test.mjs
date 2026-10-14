// Release coverage for UC-017. This is the release-level guard that the use case's realised SPEC requirements are
// covered by executable evidence, and that the self-hosted runner public-product refusal is exercised through routesFor.
// Run: node --test tests/release-uc-017-configure-participants.test.mjs
//
// Module: system
// Guards: UC-017
// Level: release
//
// Input: docs/use-cases/UC-017-configure-participants.md, SPEC.md, the UC-017 system test and existing evidence files.
// Precondition: ITM-375 is implemented only in new test files by a developer independent of the UC-017 build items.
// Expected result: each realised requirement whose SPEC check names an automatic check has release coverage evidence,
// the system test declares the UC-017 main/alternative paths, and routesFor refuses a self-hosted runner for public and
// internal products while allowing a private product. Counter-proof notes are recorded in the final report.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { routesFor } from "../src/runtimes/routes.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const pathExists = (path) => existsSync(new URL(path, ROOT));
const SYSTEM = "tests/system-uc-017-configure-participants.test.mjs";

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-017-configure-participants.md").split("\n")) {
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
  "PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/participant-list.test.mjs",
    "tests/product-process-role-assignments.test.mjs",
  ],
  "A PARTICIPANT HAS ONE OF FIVE TYPES": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/participant-list.test.mjs",
    "tests/test_participants.py",
  ],
  "A PARTICIPANT DECLARES ITS CAPABILITIES": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/participant-list-fit.test.mjs",
    "tests/dashboard-roles.test.mjs",
  ],
  "A PARTICIPANT DECLARES WHERE IT PROCESSES DATA": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/participant-list.test.mjs",
    "tests/dashboard-roles.test.mjs",
  ],
  "A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/documents.test.mjs",
    "src/participant-list/participants.schema.md",
  ],
  "NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY": [
    SYSTEM,
    "tests/job-runner-left-out.test.mjs",
    "tests/test_derivation_context.py",
    "tests/participant-list-fit.test.mjs",
  ],
  "NO COST IS GUESSED": [
    SYSTEM,
    "tests/endpoint-driver.test.mjs",
    "src/job-ledger/cost.mjs",
    "src/job-ledger/index.mjs",
  ],
  "RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/dashboard-roles.test.mjs",
    "tests/settings-pages-library.test.mjs",
  ],
  "NO SECRET IN THE REPOSITORY": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/runtimes-workflow.test.mjs",
    "tests/settings-pages-endpoints.test.mjs",
  ],
  "A PERSON'S OWN INPUT IS COMMITTED DIRECTLY": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/artifact-edits-save.test.mjs",
    "tests/dashboard-roles.test.mjs",
  ],
  "EVERY STEP EXPLAINS ITSELF": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/site-frame-participant-explanations.test.mjs",
    "tests/test_step_explanations.py",
  ],
  "A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY": [
    SYSTEM,
    "tests/runtimes-routes.test.mjs",
    "tests/runtimes-workflow.test.mjs",
    "docs/measurements/2026-10-05_self-hosted-runners.md",
  ],
  "A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/release-uc-011-local-cli-session.test.mjs",
  ],
  "THE BRIDGE FINDS THE INSTALLED AGENTS": [
    SYSTEM,
    "tests/settings-pages-participants.test.mjs",
    "tests/bridge-jobs-agents.test.mjs",
    "tests/release-itm-320-321-agent-processes.test.mjs",
  ],
};

const REVIEW_ONLY = ["ONE CLICK PER DECISION"];

function offers(participant, visibility) {
  return routesFor(participant, { visibility, jobWorkflow: true }, []);
}

// TST-375101 · level: release · module: system
// guards: UC-017; every requirement realised by UC-017; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
// given: UC-017's `realises` list, SPEC's current Check lines, the UC-017 system-test declarations and a CI participant on `ci runner:gpu secret MODEL_KEY`
// input: compare realised requirements with COVERED_BY_RELEASE/REVIEW_ONLY, inspect the system declarations, and call routesFor for private, public and internal products
// expect: every automatic UC-017 requirement has existing evidence including the UC-017 system harness; the system harness declares main flow and alternatives 3a, 3b, 5a, 6a and 7a; routesFor allows the self-hosted runner only for the private product and refuses public/internal products with a reason naming the runner and visibility
test("TST-375101: UC-017 release coverage names every automatic requirement and the self-hosted runner refusal", () => {
  const realised = ucRealises();
  const checks = specChecks();
  const automatic = realised.filter((name) => !/^no automatic check; at review/.test(checks.get(name) ?? ""));
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));

  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.length > 1, `${requirement} has coverage evidence beyond this release map`);
    assert.ok(files.includes(SYSTEM), `${requirement} includes the UC-017 system harness`);
    assert.ok(files.some((file) => read(file).includes(requirement)), `${requirement} is named by at least one evidence file`);
    for (const file of files) assert.ok(pathExists(file), `${requirement} evidence exists: ${file}`);
  }

  const declarations = testDeclarations(SYSTEM, read(SYSTEM));
  const declared = declarations.map((declaration) => `${declaration.id}: ${declaration.guards.join("; ")} ${declaration.given ?? ""} ${declaration.input ?? ""} ${declaration.expect ?? ""}`);
  for (const phrase of ["UC-017 main flow", "alternative 3a", "alternative 3b", "alternative 5a", "alternative 6a", "alternative 7a"]) {
    assert.ok(declared.some((text) => text.includes(phrase)), `system test declares ${phrase}`);
  }

  const participant = { name: "ci-gpu", route: "ci runner:gpu secret MODEL_KEY" };
  assert.deepEqual(offers(participant, "private"), [{ route: { kind: "ci", runner: "gpu" }, available: true, reason: null }]);
  for (const visibility of ["public", "internal"]) {
    const [offer] = offers(participant, visibility);
    assert.equal(offer.available, false, `${visibility}: the self-hosted runner is refused`);
    assert.match(offer.reason, /self-hosted runner gpu/);
    assert.match(offer.reason, new RegExp(visibility));
    assert.match(offer.reason, /private/);
  }
});
