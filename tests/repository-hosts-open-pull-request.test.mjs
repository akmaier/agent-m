// Accepted Host pull-request prerequisites for ITM-476 / JOB-20261015-1903-6678.
// Module: MOD-repository-hosts
// Guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// Level: unit
// Run: node --test tests/repository-hosts-open-pull-request.test.mjs
// Primary API references read 2026-10-15: https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request,
// https://docs.gitlab.com/api/merge_requests/#create-a-merge-request,
// https://docs.gitlab.com/user/project/merge_requests/drafts/ (Draft: title prefix).
// Existing serving/request-capture pattern; no actual server or clone is written.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { connect, parseAddress, HostError } from "../src/repository-hosts/index.mjs";

const data = JSON.parse(readFileSync(new URL("./fixtures/repository-hosts/open-pull-request.json", import.meta.url), "utf8"));
const servers = [
  { kind: "github", web: "https://github.com/carol/schedule-tool", api: "https://api.github.com/repos/carol/schedule-tool",
    token: "github_pat_PRfixture0123456789abcdef", header: "authorization", authorization: "Bearer github_pat_PRfixture0123456789abcdef" },
  { kind: "gitlab", web: "https://gitlab.example.org/space/schedule-tool", api: "https://gitlab.example.org/api/v4/projects/space%2Fschedule-tool",
    token: "glpat-PRfixture0123456789", header: "private-token", authorization: "glpat-PRfixture0123456789" },
];
const json = (status, value, headers = {}) => new Response(JSON.stringify(value), {
  status, headers: { "Content-Type": "application/json", ...headers },
});
async function serving(answer, run) {
  const requests = [], original = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const request = { method: init.method ?? "GET", url: new URL(String(input)),
      headers: Object.fromEntries(new Headers(init.headers).entries()), body: init.body ? JSON.parse(init.body) : null };
    requests.push(request); return answer(request);
  };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = original; }
}
function expected(server, response) {
  return { number: 47, title: response.title, branch: data.request.branch, base: data.request.base,
    head: "1234567890123456789012345678901234567890", state: "open", draft: response.draft,
    url: server.kind === "github" ? response.html_url : response.web_url,
    opened: response.created_at, merged: null, closed: null };
}
function answer(server, draft = false) {
  return (r) => {
    const endpoint = `${server.api}/${server.kind === "github" ? "pulls" : "merge_requests"}`;
    assert.equal(r.url.origin + r.url.pathname, endpoint);
    assert.equal(r.headers[server.header], server.authorization);
    assert.equal(r.url.href.includes(server.token), false);
    const response = { ...data[server.kind], draft, title: draft && server.kind === "gitlab" ? `Draft: ${data.request.title}` : data.request.title };
    return json(r.method === "POST" ? 201 : 200, r.method === "GET" ? [response] : response);
  };
}
async function open(server, request = data.request, options = {}, respond = answer(server, request.draft === true)) {
  const host = connect(parseAddress(server.web), { token: server.token, ...options });
  const result = await serving(respond, async () => {
    let value;
    await assert.doesNotReject(async () => { value = await host.openPullRequest(request); },
      "accepted public Host.openPullRequest creates a request instead of rejecting its stub");
    return value;
  });
  return result;
}

// TST-476410
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED
// given: the existing listPullRequests public interface and controlled GitHub/GitLab responses in open-pull-request.json
// input: connect(...).listPullRequests({ state: "open" })
// expect: both existing adapters return the declared PullRequest shape from the same server fields creation will return
test("TST-476410: existing public request mapping and server fixtures are positive controls", async () => {
  for (const server of servers) {
    const host = connect(parseAddress(server.web), { token: server.token });
    const { result } = await serving(answer(server), () => host.listPullRequests({ state: "open" }));
    assert.deepEqual(result, [expected(server, data[server.kind])]);
  }
});

// TST-476411
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub repository and ready/draft variants of the request and 201 fixture
// input: openPullRequest with each variant
// expect: one POST to pulls with head/base/title/body and the requested draft flag; the server response normalized to PullRequest
test("TST-476411: GitHub creates ready and draft pull requests through its existing adapter", async () => {
  const server = servers[0];
  for (const draft of [false, true]) {
    const { result, requests } = await open(server, { ...data.request, draft });
    assert.deepEqual(requests.map((r) => [r.method, r.body]), [["POST", {
      head: data.request.branch, base: data.request.base, title: data.request.title, body: data.request.body, draft,
    }]]);
    assert.deepEqual(result, expected(server, { ...data.github, draft }));
  }
});

// TST-476412
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; GITLAB PRODUCTS ARE SUPPORTED
// given: a GitLab project and ready/draft variants, with Draft: as its documented draft-title convention
// input: openPullRequest with each variant
// expect: one POST to merge_requests with source_branch/target_branch/title/description; iid rather than global id as number, and the server's normalized PullRequest
test("TST-476412: GitLab creates ready and draft merge requests with the declared result", async () => {
  const server = servers[1];
  for (const draft of [false, true]) {
    const title = draft ? `Draft: ${data.request.title}` : data.request.title;
    const { result, requests } = await open(server, { ...data.request, draft });
    assert.deepEqual(requests.map((r) => [r.method, r.body]), [["POST", {
      source_branch: data.request.branch, target_branch: data.request.base, title, description: data.request.body,
    }]]);
    assert.deepEqual(result, expected(server, { ...data.gitlab, title, draft }));
  }
});

// TST-476413
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; DEVELOP AGAINST INTERFACES
// given: a Host of each server with a clone and token, and the same clone without a token
// input: openPullRequest with a valid request
// expect: token-bearing clones use the REST adapter; tokenless clones reject NotSupported without fetch or git activity
test("TST-476413: clone pull requests delegate to REST only with the supplied token", async () => {
  for (const server of servers) {
    const clone = "/tmp/unused-pull-request-fixture";
    assert.deepEqual((await open(server, data.request, { clone })).result, expected(server, data[server.kind]));
    const host = connect(parseAddress(server.web), { clone });
    const { requests } = await serving(() => assert.fail("tokenless clone must not request"),
      () => assert.rejects(host.openPullRequest(data.request), (error) => error instanceof HostError && error.name === "NotSupported"));
    assert.equal(requests.length, 0);
  }
});

// TST-476414
// level: unit
// module: MOD-repository-hosts
// guards: UC-027; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: each server succeeds first, then answers 401, 403, 404, rate limited, 500, or has unavailable transport
// input: public openPullRequest of the same valid request
// expect: TokenRefused, PermissionMissing for forbidden/hidden writes, RateLimited, or Unreachable respectively; never a PR or a generic NotSupported stub
test("TST-476414: pull-request creation preserves the documented Host failures", async () => {
  for (const server of servers) {
    assert.equal((await open(server)).result.number, 47, "known positive");
    const host = connect(parseAddress(server.web), { token: server.token });
    for (const [status, name] of [[401, "TokenRefused"], [403, "PermissionMissing"], [404, "PermissionMissing"],
      [429, "RateLimited"], [500, "Unreachable"], [null, "Unreachable"]]) {
      const { result: error } = await serving(() => {
        if (status === null) throw new TypeError("fixture transport unavailable");
        return json(status, { message: "fixture refusal" }, status === 429 && server.kind === "github"
          ? { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000" } : {});
      }, () => host.openPullRequest(data.request).then(() => null, (failure) => failure));
      assert.ok(error instanceof HostError);
      assert.equal(error.name, name, `${server.kind}: ${status}`);
    }
  }
});
