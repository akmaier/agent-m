// MOD-repository-hosts' WebLinks `fork`, `pagesSettings` and `pipelineSchedules` (ITM-950), as the accepted text of docs/architecture/MOD-repository-hosts.md states them: "`WebLinks` — { …, runners: string,
// pipelineSchedules: string | null, pagesSettings: string, fork: string | null, … }: the server's own pages; a page the server does not offer is `null`." UC-014 steps 1 and 2 open the fork page and the Pages
// settings page of a repository; UC-027 3a shows the pipeline schedules page of a GitLab project after a schedule is applied.
// Run: node --test tests/repository-hosts-web-links-pages.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-014; AN INSTANCE IS A FORK OF AGENT M; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// No server is reached: webLinks() makes no request, and the test replaces fetch with one that fails the test if it is called. The links are read through the public export, `connect(parseAddress(url)).webLinks()`.
// Readings the texts leave open, which the tests state (the pull request names them): GitHub's pages are <repository>/fork and <repository>/settings/pages, and it has no page of pipeline schedules, so that link
// is null; GitLab's are <project>/-/forks/new, <project>/-/pages and <project>/-/pipeline_schedules, and the project's path is every group up to GitLab's "/-/".
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const links = (url, credentials = {}) => connect(parseAddress(url), credentials).webLinks();
async function withoutNetwork(run) {
  const real = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("webLinks reaches no server"); };
  try { return await run(); } finally { globalThis.fetch = real; }
}

// TST-950001 · level: unit · module: MOD-repository-hosts
// guards: UC-014; AN INSTANCE IS A FORK OF AGENT M
// given: the repository https://github.com/akmaier/agent-m; known positive: its links to the runners and the Actions page are there
// input: webLinks()
// expect: fork is https://github.com/akmaier/agent-m/fork, pagesSettings is https://github.com/akmaier/agent-m/settings/pages, pipelineSchedules is null (GitHub has no such page); no request is made
test("webLinks — a GitHub repository gives its fork page and its Pages settings, and no page of pipeline schedules", async () => {
  await withoutNetwork(() => {
    const given = links("https://github.com/akmaier/agent-m");
    assert.equal(given.actions, "https://github.com/akmaier/agent-m/actions", "known positive: the Actions page is there");
    assert.equal(given.fork, "https://github.com/akmaier/agent-m/fork");
    assert.equal(given.pagesSettings, "https://github.com/akmaier/agent-m/settings/pages");
    assert.equal(given.pipelineSchedules, null);
  });
});

// TST-950002 · level: unit · module: MOD-repository-hosts
// guards: UC-014; UC-027
// given: the GitLab project https://gitlab.example.org/space/group/release-tool, in a group inside a group; known positive: its links to the runners and the pipelines are there
// input: webLinks()
// expect: fork is …/space/group/release-tool/-/forks/new, pagesSettings …/-/pages and pipelineSchedules …/-/pipeline_schedules, each under the project's address; no request is made
test("webLinks — a GitLab project gives its fork page, its Pages settings and its pipeline schedules", async () => {
  await withoutNetwork(() => {
    const given = links("https://gitlab.example.org/space/group/release-tool");
    assert.equal(given.actions, "https://gitlab.example.org/space/group/release-tool/-/pipelines", "known positive: the pipelines page is there");
    assert.equal(given.fork, "https://gitlab.example.org/space/group/release-tool/-/forks/new");
    assert.equal(given.pagesSettings, "https://gitlab.example.org/space/group/release-tool/-/pages");
    assert.equal(given.pipelineSchedules, "https://gitlab.example.org/space/group/release-tool/-/pipeline_schedules");
  });
});

// TST-950003 · level: unit · module: MOD-repository-hosts
// guards: UC-014; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitHub repository and a GitLab project, each connected with a token
// input: webLinks() of each
// expect: each of the three links is a text address under its repository's own address (or null for GitHub's pipeline schedules), and none holds the token; a second repository gives links under its own address, not the first's
test("webLinks — each link lies under its own repository's address, and none holds a token", async () => {
  await withoutNetwork(() => {
    const GH = "github_pat_CAROLreleaseTOOL0123456789abcdef", GL = "glpat-SPACEreleaseTOOL0123456789";
    const hub = links("https://github.com/carol/release-tool", { token: GH }), lab = links("https://gitlab.example.org/space/release-tool", { token: GL });
    for (const [given, web, token] of [[hub, "https://github.com/carol/release-tool", GH], [lab, "https://gitlab.example.org/space/release-tool", GL]]) {
      for (const name of ["fork", "pagesSettings", "pipelineSchedules"]) {
        const link = given[name];
        if (link === null) { assert.equal(name, "pipelineSchedules"); continue; }
        assert.ok(typeof link === "string" && link.startsWith(`${web}/`), `${name} lies under ${web}: ${link}`);
        assert.ok(!link.includes(token), `${name} holds no token`);
      }
    }
    assert.notEqual(links("https://github.com/alice/agent-m").fork, hub.fork);
  });
});
