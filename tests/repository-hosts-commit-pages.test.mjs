// MOD-repository-hosts' webLinks().commitRuns(commit), webLinks().branch(name) and webLinks().runners (ITM-889), as the accepted text of
// docs/architecture/MOD-repository-hosts.md states them: "WebLinks — { …, commitRuns(commit: string) -> string, branch(name: string) ->
// string, runners: string, … }: commitRuns is the page of the runs or pipelines of one commit, branch the page of a branch's files, runners the
// page on which a self-hosted runner is registered to the repository". The pages, as the servers route them — GitHub:
// <web>/commit/<sha>/checks, <web>/tree/<name>, <web>/settings/actions/runners/new; GitLab: <web>/-/commit/<sha>/pipelines,
// <web>/-/tree/<name>, <web>/-/settings/ci_cd. Navigation only: `fetch` is replaced by a recorder that must stay silent.
// Run: node --test tests/repository-hosts-commit-pages.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-028; UC-027; A CREDENTIAL IS NEVER PLACED IN A URL
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GITHUB = parseAddress("https://github.com/alice/agent-m");
const GITLAB = parseAddress("https://gitlab.example.org/grp/sub/thesis-tool");
const SHA = "0123456789abcdef0123456789abcdef01234567";

function withoutRequests(run) {
  const sent = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (input) => { sent.push(String(input?.url ?? input)); return new Response("{}", { status: 200 }); };
  let result;
  try { result = run(); } finally { globalThis.fetch = real; }
  assert.deepEqual(sent, [], "no request is made");
  return result;
}
const linksOf = (address) => connect(address, {}).webLinks();

// TST-889001 · level: unit · module: MOD-repository-hosts
// guards: UC-028; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitHub repository alice/agent-m; a commit identifier, and one that tries to leave its place
// input: webLinks().commitRuns(SHA); webLinks().commitRuns("a?token=b#c/../x")
// expect: https://github.com/alice/agent-m/commit/0123456789abcdef0123456789abcdef01234567/checks; for the second, one encoded segment: https://github.com/alice/agent-m/commit/a%3Ftoken%3Db%23c%2F..%2Fx/checks; no request
test("MOD-repository-hosts webLinks — the checks of one commit (GitHub)", () => {
  const [link, odd] = withoutRequests(() => { const l = linksOf(GITHUB); return [l.commitRuns(SHA), l.commitRuns("a?token=b#c/../x")]; });
  assert.equal(link, "https://github.com/alice/agent-m/commit/0123456789abcdef0123456789abcdef01234567/checks");
  assert.equal(odd, "https://github.com/alice/agent-m/commit/a%3Ftoken%3Db%23c%2F..%2Fx/checks");
});

// TST-889002 · level: unit · module: MOD-repository-hosts
// guards: UC-028; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitLab project grp/sub/thesis-tool on gitlab.example.org; a commit identifier, and one that tries to leave its place
// input: webLinks().commitRuns(SHA); webLinks().commitRuns("a?token=b#c/../x")
// expect: https://gitlab.example.org/grp/sub/thesis-tool/-/commit/0123456789abcdef0123456789abcdef01234567/pipelines; for the second, https://gitlab.example.org/grp/sub/thesis-tool/-/commit/a%3Ftoken%3Db%23c%2F..%2Fx/pipelines; no request
test("MOD-repository-hosts webLinks — the pipelines of one commit (GitLab)", () => {
  const [link, odd] = withoutRequests(() => { const l = linksOf(GITLAB); return [l.commitRuns(SHA), l.commitRuns("a?token=b#c/../x")]; });
  assert.equal(link, "https://gitlab.example.org/grp/sub/thesis-tool/-/commit/0123456789abcdef0123456789abcdef01234567/pipelines");
  assert.equal(odd, "https://gitlab.example.org/grp/sub/thesis-tool/-/commit/a%3Ftoken%3Db%23c%2F..%2Fx/pipelines");
});

// TST-889003 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitHub repository alice/agent-m; a branch name with a slash, and one with a space and a hash
// input: webLinks().branch("main"); webLinks().branch("feature/a b#1")
// expect: https://github.com/alice/agent-m/tree/main; https://github.com/alice/agent-m/tree/feature/a%20b%231 (slashes kept, the rest encoded); no request
test("MOD-repository-hosts webLinks — a branch's files (GitHub)", () => {
  const [plain, odd] = withoutRequests(() => { const l = linksOf(GITHUB); return [l.branch("main"), l.branch("feature/a b#1")]; });
  assert.equal(plain, "https://github.com/alice/agent-m/tree/main");
  assert.equal(odd, "https://github.com/alice/agent-m/tree/feature/a%20b%231");
});

// TST-889004 · level: unit · module: MOD-repository-hosts
// guards: UC-027; A CREDENTIAL IS NEVER PLACED IN A URL
// given: the GitLab project grp/sub/thesis-tool on gitlab.example.org; a branch name with a slash, and one with a space and a hash
// input: webLinks().branch("main"); webLinks().branch("feature/a b#1")
// expect: https://gitlab.example.org/grp/sub/thesis-tool/-/tree/main; https://gitlab.example.org/grp/sub/thesis-tool/-/tree/feature/a%20b%231; no request
test("MOD-repository-hosts webLinks — a branch's files (GitLab)", () => {
  const [plain, odd] = withoutRequests(() => { const l = linksOf(GITLAB); return [l.branch("main"), l.branch("feature/a b#1")]; });
  assert.equal(plain, "https://gitlab.example.org/grp/sub/thesis-tool/-/tree/main");
  assert.equal(odd, "https://gitlab.example.org/grp/sub/thesis-tool/-/tree/feature/a%20b%231");
});

// TST-889005 · level: unit · module: MOD-repository-hosts
// guards: UC-027; UC-028
// given: the GitHub repository alice/agent-m and the GitLab project grp/sub/thesis-tool on gitlab.example.org
// input: webLinks().runners on each
// expect: https://github.com/alice/agent-m/settings/actions/runners/new; https://gitlab.example.org/grp/sub/thesis-tool/-/settings/ci_cd; no request
test("MOD-repository-hosts webLinks — the page for registering a runner (both servers)", () => {
  const [gh, gl] = withoutRequests(() => [linksOf(GITHUB).runners, linksOf(GITLAB).runners]);
  assert.equal(gh, "https://github.com/alice/agent-m/settings/actions/runners/new");
  assert.equal(gl, "https://gitlab.example.org/grp/sub/thesis-tool/-/settings/ci_cd");
});
