// Accepted WebLinks.pipelineSchedules prerequisite for ITM-476 / JOB-20261015-1941-1e71.
// Module: MOD-repository-hosts
// Guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
// Run: node --test tests/repository-hosts-schedule-link.test.mjs
// Public Host only, following the existing repository-hosts-ci-pages request-free navigation tests.

import test from "node:test";
import assert from "node:assert/strict";
import { connect, parseAddress } from "../src/repository-hosts/index.mjs";

function withoutRequests(run) {
  const sent = [], original = globalThis.fetch;
  globalThis.fetch = async (input) => { sent.push(String(input)); return new Response("{}", { status: 200 }); };
  try { return run(); } finally {
    globalThis.fetch = original;
    assert.deepEqual(sent, [], "navigation makes no request");
  }
}

// TST-476420
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitHub Host, without credentials and with a token-bearing clone
// input: webLinks().actions as the known positive, then webLinks().pipelineSchedules
// expect: the existing actions URL, then exactly null (not undefined); no request in either connection
test("TST-476420: GitHub publicly reports no separate pipeline schedules page", (t) => {
  const address = parseAddress("https://github.com/alice/agent-m");
  for (const credentials of [{}, { token: "ghp_SCHEDULELINKfixture0123456789", clone: "/tmp/unused-schedule-link-fixture" }]) {
    withoutRequests(() => {
      const links = connect(address, credentials).webLinks();
      assert.equal(links.actions, "https://github.com/alice/agent-m/actions", "existing public actions positive");
      t.diagnostic("GitHub webLinks.actions positive passed before pipelineSchedules assertion");
      assert.equal(links.pipelineSchedules, null, "GitHub offers no separate pipeline schedules page");
    });
  }
});

// TST-476421
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a nested GitLab project, also through a token-bearing clone with a non-default navigation branch
// input: webLinks().actions as the known positive, then webLinks().pipelineSchedules
// expect: the existing pipelines URL, then this project's /-/pipeline_schedules URL, without credentials/query/fragment; no request
test("TST-476421: GitLab publicly links its own project pipeline schedules", (t) => {
  const address = parseAddress("https://gitlab.example.org/grp/sub/thesis-tool");
  const token = "glpat-SCHEDULELINKfixture0123456789", secret = "configured-SCHEDULELINK-fixture";
  for (const credentials of [{}, { token, secrets: [secret], clone: "/tmp/unused-schedule-link-fixture", defaultBranch: "release/ci" }]) {
    withoutRequests(() => {
      const links = connect(address, credentials).webLinks();
      assert.equal(links.actions, "https://gitlab.example.org/grp/sub/thesis-tool/-/pipelines", "existing public actions positive");
      t.diagnostic("GitLab webLinks.actions positive passed before pipelineSchedules assertion");
      assert.equal(links.pipelineSchedules, "https://gitlab.example.org/grp/sub/thesis-tool/-/pipeline_schedules");
      const page = new URL(links.pipelineSchedules);
      assert.equal(page.origin, "https://gitlab.example.org");
      assert.equal(page.username + page.password + page.search + page.hash, "");
      assert.equal(links.pipelineSchedules.includes(token) || links.pipelineSchedules.includes(secret), false);
    });
  }
});
