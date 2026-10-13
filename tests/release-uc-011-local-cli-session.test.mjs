// Release coverage for UC-011. This is the release-level guard that the use case's realised SPEC requirements are
// covered by executable tests or measurement evidence.
// Run: node --test tests/release-uc-011-local-cli-session.test.mjs
//
// Module: system
// Guards: UC-011; every requirement realised by UC-011
// Level: release
//
// Input: docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md and SPEC.md as committed text.
// Precondition: ITM-374 is implemented only in new test files by a developer independent of the UC-011 build-on items.
// Expected result: each realised requirement whose SPEC check names an automatic check has a release coverage entry whose
// evidence file exists; review-only requirements, if any, are listed in REVIEW_ONLY. Counter-proof notes are in the
// sprint review/final report.

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const pathExists = (path) => existsSync(new URL(path, ROOT));

function ucRealises() {
  const names = [];
  let inRealises = false;
  for (const line of read("docs/use-cases/UC-011-hand-a-job-to-a-local-cli-session.md").split("\n")) {
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

const SYSTEM = "tests/system-uc-011-local-cli-session.test.mjs";

const COVERED_BY_RELEASE = {
  "THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY": [
    SYSTEM,
    "tests/bridge-http.test.mjs",
    "tests/release-sprint-14-bridge-http.test.mjs",
    "tests/release-itm-276-desktop-shell.test.mjs",
  ],
  "REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/release-itm-286-tunnels-runtime.test.mjs",
    "tests/tunnels-runtime.test.mjs",
  ],
  "THE LOCAL BRIDGE REQUIRES A TOKEN": [
    SYSTEM,
    "tests/bridge-http.test.mjs",
    "tests/bridge-http-323.test.mjs",
    "tests/mod-desktop-shell-jobs-composition.test.mjs",
  ],
  "BROWSER REACHABILITY IS MEASURED, NOT ASSUMED": [
    SYSTEM,
    "docs/measurements/2026-09-30_architecture-open-points.md",
    "docs/measurements/2026-09-30_gitlab-cors.md",
  ],
  "ONE DEFINITION, THREE DRIVERS": [
    SYSTEM,
    "tests/mod-desktop-shell-jobs-composition.test.mjs",
    "tests/job-catalogue.test.mjs",
    "tests/endpoint-driver-release-21.test.mjs",
  ],
  "A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN": [
    SYSTEM,
    "tests/artifact-edits-open-files.test.mjs",
    "tests/repository-hosts-clone.test.mjs",
    "tests/review-core.test.mjs",
  ],
  "THE BRIDGE IS PAIRED ONCE": [
    SYSTEM,
    "tests/bridge-client-bridges-by-name.test.mjs",
    "tests/bridge-http.test.mjs",
    "tests/release-itm-276-desktop-shell.test.mjs",
  ],
  "A JOB IS RECORDED IN ITS PRODUCT REPOSITORY": [
    SYSTEM,
    "tests/runtimes-bridge.test.mjs",
    "tests/bridge-jobs-watch.test.mjs",
    "tests/job-ledger.test.mjs",
    "tests/job-ledger-append.test.mjs",
  ],
  "A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/release-itm-286-tunnels-runtime.test.mjs",
    "tests/tunnels-runtime.test.mjs",
  ],
  "A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/settings-pages-bridge-remote-sessions.test.mjs",
    "tests/release-itm-286-tunnels-runtime.test.mjs",
    "tests/tunnels-runtime.test.mjs",
  ],
  "EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/bridge-client-bridges-by-name.test.mjs",
    "tests/settings-pages-bridge-remote-sessions.test.mjs",
  ],
  "THE DASHBOARD WRITES THE TUNNEL COMMANDS": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/settings-pages-bridge-remote-sessions.test.mjs",
    "tests/settings-pages-bridges-by-name.test.mjs",
  ],
  "THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS": [
    SYSTEM,
    "tests/settings-pages-bridge-remote-sessions.test.mjs",
    "tests/browser-store-bridges-by-name.test.mjs",
    "tests/test_settings_page.py",
  ],
  "A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/bridge-client-bridges-by-name.test.mjs",
    "tests/component-itm-294-https-reverse-tunnel.test.mjs",
  ],
  "THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN": [
    SYSTEM,
    "tests/bridge-client-tunnel-plans.test.mjs",
    "tests/component-itm-294-https-reverse-tunnel.test.mjs",
  ],
  "A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY": [
    SYSTEM,
    "tests/runtimes-routes.test.mjs",
    "tests/runtimes-workflow.test.mjs",
    "docs/measurements/2026-10-05_self-hosted-runners.md",
  ],
  "THE BRIDGE OPENS ITS TUNNELS ITSELF": [
    SYSTEM,
    "tests/release-itm-286-tunnels-runtime.test.mjs",
    "tests/tunnels-runtime.test.mjs",
    "tests/mod-desktop-shell-jobs-composition.test.mjs",
  ],
  "A LOCAL AGENT USES THE PERSON'S OWN LOGIN": [
    SYSTEM,
    "tests/bridge-jobs-agents.test.mjs",
    "tests/bridge-jobs-watch.test.mjs",
    "tests/bridge-jobs-access.test.mjs",
    "tests/agent-processes-320.test.mjs",
  ],
  "THE BRIDGE FINDS THE INSTALLED AGENTS": [
    SYSTEM,
    "tests/bridge-jobs-agents.test.mjs",
    "tests/mod-desktop-shell-agents.test.mjs",
    "tests/agent-processes-320.test.mjs",
  ],
};

const REVIEW_ONLY = [];

// TST-374101
// level: release
// module: system
// guards: UC-011; all realised requirements whose SPEC check names a test or measurement
// given: UC-011's `realises` list and SPEC's current Check lines
// input: compare the realised requirements with COVERED_BY_RELEASE and REVIEW_ONLY
// expect: every automatic UC-011 requirement has coverage evidence, no review-only requirement is hidden in the automatic table, and no realised requirement is missing or duplicated
test("TST-374101: UC-011 release coverage names every automatic requirement", () => {
  const realised = ucRealises();
  const checks = specChecks();
  const automatic = realised.filter((name) => !/^no automatic check; at review/.test(checks.get(name) ?? ""));
  const reviewOnly = realised.filter((name) => /^no automatic check; at review/.test(checks.get(name) ?? ""));

  assert.deepEqual([...new Set(realised)].sort(), realised.toSorted(), "the use case realises each requirement once");
  assert.deepEqual(Object.keys(COVERED_BY_RELEASE).sort(), automatic.toSorted());
  assert.deepEqual(REVIEW_ONLY.toSorted(), reviewOnly.toSorted());

  for (const [requirement, files] of Object.entries(COVERED_BY_RELEASE)) {
    assert.ok(files.length > 1, `${requirement} has coverage evidence beyond this release map`);
    assert.ok(files.includes(SYSTEM), `${requirement} includes the UC-011 system harness`);
    assert.ok(files.some((file) => read(file).includes(requirement)), `${requirement} is named by at least one evidence file`);
    for (const file of files) assert.ok(pathExists(file), `${requirement} evidence exists: ${file}`);
  }
});

// TST-374102
// level: release
// module: system
// guards: UC-011; BROWSER REACHABILITY IS MEASURED, NOT ASSUMED; REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL; THE BRIDGE OPENS ITS TUNNELS ITSELF; A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; THE BRIDGE FINDS THE INSTALLED AGENTS
// given: the UC-011 release coverage table and the system harness source
// input: inspect the evidence classes attached to browser measurement, tunnel runtime, route privacy and local-agent execution
// expect: measurement-backed requirements include a dated measurement, tunnel requirements include tunnel runtime evidence, route privacy includes route/workflow evidence, and local-agent requirements include Bridge job and discovery evidence
test("TST-374102: UC-011 release evidence includes measurement, tunnel, route and Bridge-agent paths", () => {
  assert.ok(
    COVERED_BY_RELEASE["BROWSER REACHABILITY IS MEASURED, NOT ASSUMED"].some((file) => file.startsWith("docs/measurements/")),
    "browser reachability includes dated measurement evidence",
  );

  for (const requirement of [
    "REMOTE ACCESS TO THE BRIDGE GOES THROUGH A TUNNEL",
    "A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL",
    "A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK",
    "THE BRIDGE OPENS ITS TUNNELS ITSELF",
  ]) {
    assert.ok(COVERED_BY_RELEASE[requirement].some((file) => /tunnels?-runtime/.test(file)), `${requirement} includes tunnel runtime evidence`);
  }

  for (const requirement of [
    "A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY",
    "ONE DEFINITION, THREE DRIVERS",
  ]) {
    assert.ok(COVERED_BY_RELEASE[requirement].some((file) => /runtimes|job-catalogue|desktop-shell/.test(file)), `${requirement} includes runtime/catalogue evidence`);
  }

  for (const requirement of [
    "A LOCAL AGENT USES THE PERSON'S OWN LOGIN",
    "THE BRIDGE FINDS THE INSTALLED AGENTS",
  ]) {
    assert.ok(COVERED_BY_RELEASE[requirement].some((file) => /bridge-jobs|agent-processes|desktop-shell-agents/.test(file)), `${requirement} includes Bridge-agent evidence`);
  }

  assert.match(read(SYSTEM), /bridge-jobs-watch\.test\.mjs/, "the system harness imports the Bridge job watcher evidence");
  assert.deepEqual(REVIEW_ONLY, []);
});
