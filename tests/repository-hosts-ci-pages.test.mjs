// MOD-repository-hosts' webLinks().secrets, webLinks().actions and webLinks().run(id) (ITM-311), as the accepted text of
// docs/architecture/MOD-repository-hosts.md states them: "WebLinks — { …, secrets: string, …, actions: string, run(id: string) -> string,
// … }: the server's own pages", and "webLinks() — the addresses of the server's own pages for this repository, as defined under Data; no
// request is made", with A CREDENTIAL IS NEVER PLACED IN A URL. The pages, as each server documents them: GitHub — the repository's
// Settings > Secrets and variables > Actions (docs.github.com, "Using secrets in GitHub Actions": Settings, Security, Secrets and
// variables, Actions), at https://github.com/<owner>/<name>/settings/secrets/actions; its workflow runs at .../actions, and one run at
// .../actions/runs/<id> (docs.github.com, "Using workflow run logs": REPOSITORY/actions/runs/<id>). GitLab — the project's Settings >
// CI/CD, where the Variables are (docs.gitlab.com, "CI/CD variables": Settings > CI/CD, Expand Variables), at
// https://<server>/<project>/-/settings/ci_cd; its pipelines at .../-/pipelines, and one pipeline at .../-/pipelines/<id>
// (docs.gitlab.com, "Pipelines": gitlab.example.com/my-group/my-project/-/pipelines/<…>). The documentation names the settings pages by
// their menu, not by address: the addresses are the servers' routes for those menus. Deterministic, no network: the pages are addresses,
// navigation only, so `fetch` is replaced by a recorder that must stay silent.
// Run: node --test tests/repository-hosts-ci-pages.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-010; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GITHUB = parseAddress("https://github.com/alice/agent-m");
const GITLAB = parseAddress("https://gitlab.example.org/grp/sub/thesis-tool");

// Runs `run` with a `fetch` that records what it is asked for, and fails when any request was made; returns what `run` returns.
function withoutRequests(run) {
  const sent = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (input) => { sent.push(String(input?.url ?? input)); return new Response("{}", { status: 200 }); };
  let result;
  try { result = run(); } finally { globalThis.fetch = real; }
  assert.deepEqual(sent, [], "no request is made");
  return result;
}
const linksOf = (address, connection = {}) => connect(address, connection).webLinks();
// A page carries no credential: a plain address on the server's own origin, with no user name, password, query or fragment.
function assertNoCredential(link, origin) {
  const page = new URL(link);
  assert.equal(page.origin, origin, "on the server's own origin");
  assert.equal(page.username + page.password, "", "no user name or password");
  assert.equal(page.search + page.hash, "", "no query, no fragment");
  assert.ok(!/token|secret=|key=/i.test(page.search), "no token");
}

// TST-472524 · level: unit · module: MOD-repository-hosts
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitHub repository alice/agent-m, connected with a token and one secret value
// input: webLinks().secrets
// expect: https://github.com/alice/agent-m/settings/secrets/actions; no credential in it, not the token nor the secret; no request
test("MOD-repository-hosts webLinks — the repository's page for CI secrets (GitHub)", () => {
  const link = withoutRequests(() => linksOf(GITHUB, { token: "ghp_SECRETTOKEN0123456789", secrets: ["AGENT_KEY=sk-SECRETVALUE"] }).secrets);
  assert.equal(link, "https://github.com/alice/agent-m/settings/secrets/actions");
  assertNoCredential(link, "https://github.com");
  assert.ok(!link.includes("SECRET"), "neither the token nor a secret in the address");
});

// TST-472525 · level: unit · module: MOD-repository-hosts
// guards: A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitLab project grp/sub/thesis-tool on gitlab.example.org, connected with a project token
// input: webLinks().secrets
// expect: https://gitlab.example.org/grp/sub/thesis-tool/-/settings/ci_cd; no credential in it; no request
test("MOD-repository-hosts webLinks — the project's page for CI variables (GitLab)", () => {
  const link = withoutRequests(() => linksOf(GITLAB, { token: "glpat-SECRETTOKEN0123456789" }).secrets);
  assert.equal(link, "https://gitlab.example.org/grp/sub/thesis-tool/-/settings/ci_cd");
  assertNoCredential(link, "https://gitlab.example.org");
  assert.ok(!link.includes("SECRET"), "no token in the address");
});

// TST-472526 · level: unit · module: MOD-repository-hosts
// guards: UC-010; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitHub repository alice/agent-m
// input: webLinks().actions
// expect: https://github.com/alice/agent-m/actions; no credential in it; no request
test("MOD-repository-hosts webLinks — the page of workflow runs (GitHub)", () => {
  const link = withoutRequests(() => linksOf(GITHUB).actions);
  assert.equal(link, "https://github.com/alice/agent-m/actions");
  assertNoCredential(link, "https://github.com");
});

// TST-472527 · level: unit · module: MOD-repository-hosts
// guards: UC-010; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitLab project grp/sub/thesis-tool on gitlab.example.org
// input: webLinks().actions
// expect: https://gitlab.example.org/grp/sub/thesis-tool/-/pipelines; no credential in it; no request
test("MOD-repository-hosts webLinks — the page of pipelines (GitLab)", () => {
  const link = withoutRequests(() => linksOf(GITLAB).actions);
  assert.equal(link, "https://gitlab.example.org/grp/sub/thesis-tool/-/pipelines");
  assertNoCredential(link, "https://gitlab.example.org");
});

// TST-472528 · level: unit · module: MOD-repository-hosts
// guards: UC-010; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitHub repository alice/agent-m; the run 38165871626, and an id that is no run's number but tries to leave its place
// input: webLinks().run("38165871626"); webLinks().run("7?token=abc#x/../..")
// expect: https://github.com/alice/agent-m/actions/runs/38165871626; for the second, one path segment under .../actions/runs/ — no query, no fragment — so that what is given as an id never becomes part of the address's structure; no request
test("MOD-repository-hosts webLinks — one run's page (GitHub)", () => {
  const [link, odd] = withoutRequests(() => { const links = linksOf(GITHUB); return [links.run("38165871626"), links.run("7?token=abc#x/../..")]; });
  assert.equal(link, "https://github.com/alice/agent-m/actions/runs/38165871626");
  assertNoCredential(link, "https://github.com");
  assertNoCredential(odd, "https://github.com");
  assert.ok(new URL(odd).pathname.startsWith("/alice/agent-m/actions/runs/") && new URL(odd).pathname.split("/").length === 6, "one segment");
});

// TST-472529 · level: unit · module: MOD-repository-hosts
// guards: UC-010; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitLab project grp/sub/thesis-tool on gitlab.example.org; the pipeline 4711, and an id that tries to leave its place
// input: webLinks().run("4711"); webLinks().run("7?token=abc#x/../..")
// expect: https://gitlab.example.org/grp/sub/thesis-tool/-/pipelines/4711; for the second, one path segment under .../-/pipelines/ — no query, no fragment; no request
test("MOD-repository-hosts webLinks — one pipeline's page (GitLab)", () => {
  const [link, odd] = withoutRequests(() => { const links = linksOf(GITLAB); return [links.run("4711"), links.run("7?token=abc#x/../..")]; });
  assert.equal(link, "https://gitlab.example.org/grp/sub/thesis-tool/-/pipelines/4711");
  assertNoCredential(link, "https://gitlab.example.org");
  assertNoCredential(odd, "https://gitlab.example.org");
  assert.ok(new URL(odd).pathname.startsWith("/grp/sub/thesis-tool/-/pipelines/") && new URL(odd).pathname.split("/").length === 7, "one segment");
});
